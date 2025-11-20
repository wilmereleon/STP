const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const { Script, AuditLog } = require('../models');

/**
 * Middleware para verificar que el usuario NO es invitado
 * Bloquea operaciones de escritura (POST, PUT, DELETE) para invitados
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ 
      error: 'Esta acción requiere iniciar sesión',
      code: 'GUEST_NOT_ALLOWED',
      message: 'Los usuarios invitados solo tienen acceso de lectura. Por favor inicia sesión para crear o modificar contenido.'
    });
  }
  next();
};

/**
 * GET /api/scripts
 * Listar todos los scripts del usuario (con paginación y filtros)
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page debe ser >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit entre 1-100'),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['active', 'archived']).withMessage('Status inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Soportar modo invitado (req.user === null)
      const userId = req.user ? req.user.userId : null;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Construir query
      const query = userId 
        ? { createdBy: userId, deletedAt: null }  // Usuario autenticado: sus scripts
        : { deletedAt: null };                    // Invitado: todos los scripts públicos
      
      // Filtro por texto
      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { content: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      // Filtro por status
      if (req.query.status === 'archived') {
        query.deletedAt = { $ne: null };
      }
      
      // Ejecutar query con paginación
      const scripts = await Script.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Script.countDocuments(query);
      
      // Crear preview del contenido (primeros 100 caracteres)
      const scriptsWithPreview = scripts.map(script => ({
        ...script.toObject(),
        contentPreview: script.content ? script.content.substring(0, 100) : '',
        content: undefined // No enviar contenido completo
      }));
      
      res.json({
        scripts: scriptsWithPreview,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Error al listar scripts:', error);
      res.status(500).json({ error: 'Error al obtener scripts' });
    }
  }
);

/**
 * POST /api/scripts
 * Crear nuevo script
 */
/**
 * POST /api/scripts
 * Crear nuevo script
 */
router.post('/',
  requireAuth,  // Requiere autenticación (bloquea invitados)
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Título requerido (1-255 chars)'),
    body('content').optional().isString().withMessage('Content debe ser string'),
    body('metadata').optional().isObject().withMessage('Metadata debe ser objeto')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const { title, content, metadata } = req.body;
      
      // Crear script
      const script = new Script({
        userId,
        title,
        content: content || '',
        metadata: metadata || {}
      });
      
      await script.save();
      
      // Log audit
      await AuditLog.logChange('Script', script._id, 'create', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(201).json({
        message: 'Script creado exitosamente',
        script
      });
      
    } catch (error) {
      console.error('Error al crear script:', error);
      res.status(500).json({ error: 'Error al crear script' });
    }
  }
);

/**
 * GET /api/scripts/:id
 * Obtener script por ID (con contenido completo)
 */
router.get('/:id',
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user ? req.user.userId : null;
      const scriptId = req.params.id;
      
      // Buscar script (verificar ownership si hay usuario autenticado)
      const query = userId 
        ? { _id: scriptId, userId, deletedAt: null }
        : { _id: scriptId, deletedAt: null };
        
      const script = await Script.findOne(query);
      
      if (!script) {
        return res.status(404).json({ error: 'Script no encontrado' });
      }
      
      res.json({ script });
      
    } catch (error) {
      console.error('Error al obtener script:', error);
      res.status(500).json({ error: 'Error al obtener script' });
    }
  }
);

/**
 * PUT /api/scripts/:id
 * Actualizar script
 */
/**
 * PUT /api/scripts/:id
 * Actualizar script
 */
router.put('/:id',
  requireAuth,  // Requiere autenticación (bloquea invitados)
  [
    param('id').isMongoId().withMessage('ID inválido'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Título (1-255 chars)'),
    body('content').optional().isString().withMessage('Content debe ser string'),
    body('metadata').optional().isObject().withMessage('Metadata debe ser objeto')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const scriptId = req.params.id;
      const updates = req.body;
      
      // Buscar script
      const script = await Script.findOne({ 
        _id: scriptId, 
        userId,
        deletedAt: null 
      });
      
      if (!script) {
        return res.status(404).json({ error: 'Script no encontrado' });
      }
      
      // Guardar estado anterior para audit
      const oldState = script.toObject();
      
      // Aplicar updates
      Object.keys(updates).forEach(key => {
        if (['title', 'content', 'metadata'].includes(key)) {
          script[key] = updates[key];
        }
      });
      
      await script.save();
      
      // Log audit
      await AuditLog.logChange('Script', script._id, 'update', userId, oldState, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        message: 'Script actualizado exitosamente',
        script
      });
      
    } catch (error) {
      console.error('Error al actualizar script:', error);
      res.status(500).json({ error: 'Error al actualizar script' });
    }
  }
);

/**
 * DELETE /api/scripts/:id
 * Eliminar script (soft delete)
 */
router.delete('/:id',
  requireAuth,  // Requiere autenticación (bloquea invitados)
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const scriptId = req.params.id;
      
      // Buscar script
      const script = await Script.findOne({ 
        _id: scriptId, 
        userId,
        deletedAt: null 
      });
      
      if (!script) {
        return res.status(404).json({ error: 'Script no encontrado' });
      }
      
      // Soft delete
      script.deletedAt = new Date();
      await script.save();
      
      // Log audit
      await AuditLog.logChange('Script', script._id, 'delete', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ 
        message: 'Script eliminado exitosamente',
        scriptId: script._id
      });
      
    } catch (error) {
      console.error('Error al eliminar script:', error);
      res.status(500).json({ error: 'Error al eliminar script' });
    }
  }
);

/**
 * POST /api/scripts/:id/duplicate
 * Duplicar script
 */
router.post('/:id/duplicate',
  requireAuth,  // Requiere autenticación (bloquea invitados)
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const scriptId = req.params.id;
      
      // Buscar script original
      const originalScript = await Script.findOne({ 
        _id: scriptId, 
        userId,
        deletedAt: null 
      });
      
      if (!originalScript) {
        return res.status(404).json({ error: 'Script no encontrado' });
      }
      
      // Crear copia
      const duplicatedScript = new Script({
        userId,
        title: `${originalScript.title} (Copia)`,
        content: originalScript.content,
        metadata: { ...originalScript.metadata }
      });
      
      await duplicatedScript.save();
      
      // Log audit
      await AuditLog.logChange('Script', duplicatedScript._id, 'create', userId, 
        { duplicatedFrom: originalScript._id }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.status(201).json({
        message: 'Script duplicado exitosamente',
        script: duplicatedScript
      });
      
    } catch (error) {
      console.error('Error al duplicar script:', error);
      res.status(500).json({ error: 'Error al duplicar script' });
    }
  }
);

/**
 * GET /api/scripts/search/fulltext
 * Búsqueda full-text en scripts
 */
router.get('/search/fulltext',
  [
    query('q').isString().trim().isLength({ min: 2 }).withMessage('Query mínimo 2 caracteres')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const searchQuery = req.query.q;
      
      // Full-text search
      const scripts = await Script.find({
        userId,
        deletedAt: null,
        $text: { $search: searchQuery }
      })
      .select('title content metadata createdAt updatedAt')
      .limit(50);
      
      res.json({ 
        results: scripts,
        count: scripts.length
      });
      
    } catch (error) {
      console.error('Error en búsqueda fulltext:', error);
      res.status(500).json({ error: 'Error en búsqueda' });
    }
  }
);

module.exports = router;
