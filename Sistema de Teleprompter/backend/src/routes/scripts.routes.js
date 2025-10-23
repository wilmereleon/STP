const express = require('express');
const router = express.Router();
const Script = require('../models/Script.model');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/scripts
 * Listar todos los scripts con paginación y filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir query
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Búsqueda full-text
    if (search) {
      query.$text = { $search: search };
    }

    // Paginación
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Ejecutar query
    const scripts = await Script.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    // Total count
    const total = await Script.countDocuments(query);

    res.json({
      success: true,
      data: scripts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener scripts'
    });
  }
});

/**
 * GET /api/scripts/:id
 * Obtener un script por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const script = await Script.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('collaborators', 'name email');

    if (!script) {
      return res.status(404).json({
        success: false,
        error: 'Script no encontrado'
      });
    }

    res.json({
      success: true,
      data: script
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener script'
    });
  }
});

/**
 * POST /api/scripts
 * Crear nuevo script
 */
router.post('/',
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('content').notEmpty(),
    body('category').optional().isIn(['Noticias', 'Deportes', 'Clima', 'Entrevista', 'Especial', 'Comercial', 'Otro']),
    body('priority').optional().isIn(['Alta', 'Media', 'Baja']),
    body('status').optional().isIn(['Borrador', 'Revisión', 'Aprobado', 'En Uso', 'Archivado'])
  ],
  async (req, res) => {
    try {
      // Validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Crear script
      const script = new Script({
        ...req.body,
        createdBy: req.user?.id, // Del middleware de autenticación
        lastModifiedBy: req.user?.id
      });

      await script.save();

      // Emitir evento WebSocket
      req.app.get('io').emit('script:created', {
        id: script._id,
        title: script.title,
        category: script.category,
        createdBy: req.user?.name
      });

      res.status(201).json({
        success: true,
        data: script,
        message: 'Script creado exitosamente'
      });
    } catch (error) {
      console.error('Error creating script:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear script'
      });
    }
  }
);

/**
 * PUT /api/scripts/:id
 * Actualizar script existente
 */
router.put('/:id',
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('content').optional(),
    body('category').optional().isIn(['Noticias', 'Deportes', 'Clima', 'Entrevista', 'Especial', 'Comercial', 'Otro']),
    body('priority').optional().isIn(['Alta', 'Media', 'Baja']),
    body('status').optional().isIn(['Borrador', 'Revisión', 'Aprobado', 'En Uso', 'Archivado'])
  ],
  async (req, res) => {
    try {
      // Validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const script = await Script.findById(req.params.id);
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Script no encontrado'
        });
      }

      // Crear versión antes de actualizar (si cambió el contenido)
      if (req.body.content && req.body.content !== script.content) {
        await script.createVersion(req.user?.id, 'Actualización manual');
      }

      // Actualizar campos
      Object.assign(script, req.body);
      script.lastModifiedBy = req.user?.id;
      
      await script.save();

      // Emitir evento WebSocket
      req.app.get('io').emit('script:updated', {
        id: script._id,
        title: script.title,
        updatedBy: req.user?.name
      });

      res.json({
        success: true,
        data: script,
        message: 'Script actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating script:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar script'
      });
    }
  }
);

/**
 * DELETE /api/scripts/:id
 * Eliminar script (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    
    if (!script) {
      return res.status(404).json({
        success: false,
        error: 'Script no encontrado'
      });
    }

    // No permitir eliminar scripts "En Uso"
    if (script.status === 'En Uso') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un script que está en uso'
      });
    }

    // Soft delete: cambiar estado a Archivado
    script.status = 'Archivado';
    await script.save();

    // Emitir evento WebSocket
    req.app.get('io').emit('script:deleted', {
      id: script._id,
      title: script.title
    });

    res.json({
      success: true,
      message: 'Script eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar script'
    });
  }
});

/**
 * GET /api/scripts/:id/versions
 * Obtener historial de versiones de un script
 */
router.get('/:id/versions', async (req, res) => {
  try {
    const script = await Script.findById(req.params.id)
      .populate('versions.modifiedBy', 'name email');

    if (!script) {
      return res.status(404).json({
        success: false,
        error: 'Script no encontrado'
      });
    }

    res.json({
      success: true,
      data: script.versions
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener versiones'
    });
  }
});

/**
 * POST /api/scripts/:id/restore
 * Restaurar una versión anterior del script
 */
router.post('/:id/restore', async (req, res) => {
  try {
    const { versionIndex } = req.body;
    const script = await Script.findById(req.params.id);

    if (!script) {
      return res.status(404).json({
        success: false,
        error: 'Script no encontrado'
      });
    }

    if (!script.versions[versionIndex]) {
      return res.status(400).json({
        success: false,
        error: 'Versión no encontrada'
      });
    }

    // Guardar versión actual antes de restaurar
    await script.createVersion(req.user?.id, 'Antes de restaurar');

    // Restaurar versión
    script.content = script.versions[versionIndex].content;
    script.lastModifiedBy = req.user?.id;
    
    await script.save();

    res.json({
      success: true,
      data: script,
      message: 'Versión restaurada exitosamente'
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({
      success: false,
      error: 'Error al restaurar versión'
    });
  }
});

module.exports = router;
