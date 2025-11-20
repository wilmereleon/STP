const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { Macro, AuditLog } = require('../models');

/**
 * GET /api/macros
 * Listar todos los macros del usuario
 * En modo invitado, devuelve los macros globales/por defecto
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    
    // Determinar query según modo
    const query = userId 
      ? { userId }           // Usuario autenticado: sus macros
      : {};                  // Invitado: todos los macros públicos
    
    // Obtener todos los macros ordenados por categoría y key
    const macros = await Macro.find(query)
      .sort({ category: 1, key: 1 });
    
    res.json({ 
      macros,
      count: macros.length
    });
    
  } catch (error) {
    console.error('Error al listar macros:', error);
    res.status(500).json({ error: 'Error al obtener macros' });
  }
});

/**
 * POST /api/macros
 * Crear nuevo macro
 */
router.post('/',
  [
    body('key').trim().matches(/^[A-Za-z0-9+]+$/).withMessage('Key debe ser alfanumérico (ej: F11, Ctrl+P)'),
    body('action').trim().isLength({ min: 1 }).withMessage('Action es requerido'),
    body('category').optional().isIn(['Playback', 'Navigation', 'Editing', 'System', 'Custom']).withMessage('Categoría inválida'),
    body('description').optional().isString().withMessage('Description debe ser string'),
    body('isEnabled').optional().isBoolean().withMessage('isEnabled debe ser booleano')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const { key, action, category, description, isEnabled } = req.body;
      
      // Verificar si ya existe un macro con ese key
      const existingMacro = await Macro.findOne({ userId, key });
      if (existingMacro) {
        return res.status(409).json({ 
          error: 'Ya existe un macro con esa tecla',
          code: 'KEY_EXISTS'
        });
      }
      
      // Crear macro
      const macro = new Macro({
        userId,
        key,
        action,
        category: category || 'Custom',
        description: description || '',
        isEnabled: isEnabled !== undefined ? isEnabled : true
      });
      
      await macro.save();
      
      // Log audit
      await AuditLog.logChange('Macro', macro._id, 'create', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(201).json({
        message: 'Macro creado exitosamente',
        macro
      });
      
    } catch (error) {
      console.error('Error al crear macro:', error);
      res.status(500).json({ error: 'Error al crear macro' });
    }
  }
);

/**
 * PUT /api/macros/:id
 * Actualizar macro existente
 */
router.put('/:id',
  [
    param('id').isMongoId().withMessage('ID inválido'),
    body('key').optional().trim().matches(/^[A-Za-z0-9+]+$/).withMessage('Key debe ser alfanumérico'),
    body('action').optional().trim().isLength({ min: 1 }).withMessage('Action no puede estar vacío'),
    body('category').optional().isIn(['Playback', 'Navigation', 'Editing', 'System', 'Custom']).withMessage('Categoría inválida'),
    body('description').optional().isString().withMessage('Description debe ser string'),
    body('isEnabled').optional().isBoolean().withMessage('isEnabled debe ser booleano')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const macroId = req.params.id;
      const updates = req.body;
      
      // Buscar macro
      const macro = await Macro.findOne({ 
        _id: macroId, 
        userId 
      });
      
      if (!macro) {
        return res.status(404).json({ error: 'Macro no encontrado' });
      }
      
      // Si se cambia el key, verificar que no exista otro con ese key
      if (updates.key && updates.key !== macro.key) {
        const existingMacro = await Macro.findOne({ 
          userId, 
          key: updates.key,
          _id: { $ne: macroId }
        });
        
        if (existingMacro) {
          return res.status(409).json({ 
            error: 'Ya existe otro macro con esa tecla',
            code: 'KEY_EXISTS'
          });
        }
      }
      
      // Guardar estado anterior
      const oldState = macro.toObject();
      
      // Aplicar updates
      const allowedFields = ['key', 'action', 'category', 'description', 'isEnabled'];
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          macro[key] = updates[key];
        }
      });
      
      await macro.save();
      
      // Log audit
      await AuditLog.logChange('Macro', macro._id, 'update', userId, oldState, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        message: 'Macro actualizado exitosamente',
        macro
      });
      
    } catch (error) {
      console.error('Error al actualizar macro:', error);
      res.status(500).json({ error: 'Error al actualizar macro' });
    }
  }
);

/**
 * DELETE /api/macros/:id
 * Eliminar macro
 */
router.delete('/:id',
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
      const macroId = req.params.id;
      
      // Buscar macro
      const macro = await Macro.findOne({ 
        _id: macroId, 
        userId 
      });
      
      if (!macro) {
        return res.status(404).json({ error: 'Macro no encontrado' });
      }
      
      // Eliminar
      await macro.deleteOne();
      
      // Log audit
      await AuditLog.logChange('Macro', macroId, 'delete', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ 
        message: 'Macro eliminado exitosamente',
        macroId
      });
      
    } catch (error) {
      console.error('Error al eliminar macro:', error);
      res.status(500).json({ error: 'Error al eliminar macro' });
    }
  }
);

/**
 * POST /api/macros/defaults
 * Restaurar macros por defecto (F11 fullscreen, F10 play/pause, etc.)
 */
router.post('/defaults', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Definir macros por defecto
    const defaultMacros = [
      {
        userId,
        key: 'F11',
        action: 'toggleFullscreen',
        category: 'System',
        description: 'Activar/desactivar pantalla completa',
        isEnabled: true
      },
      {
        userId,
        key: 'F10',
        action: 'togglePlay',
        category: 'Playback',
        description: 'Reproducir/pausar teleprompter',
        isEnabled: true
      },
      {
        userId,
        key: 'Space',
        action: 'togglePlay',
        category: 'Playback',
        description: 'Reproducir/pausar (alternativo)',
        isEnabled: true
      },
      {
        userId,
        key: 'ArrowUp',
        action: 'increaseSpeed',
        category: 'Playback',
        description: 'Aumentar velocidad de scroll',
        isEnabled: true
      },
      {
        userId,
        key: 'ArrowDown',
        action: 'decreaseSpeed',
        category: 'Playback',
        description: 'Disminuir velocidad de scroll',
        isEnabled: true
      },
      {
        userId,
        key: 'Home',
        action: 'resetPosition',
        category: 'Navigation',
        description: 'Volver al inicio del guion',
        isEnabled: true
      },
      {
        userId,
        key: 'Escape',
        action: 'exitFullscreen',
        category: 'System',
        description: 'Salir de pantalla completa',
        isEnabled: true
      },
      {
        userId,
        key: 'Ctrl+S',
        action: 'saveScript',
        category: 'Editing',
        description: 'Guardar guion',
        isEnabled: true
      }
    ];
    
    // Eliminar todos los macros existentes del usuario
    await Macro.deleteMany({ userId });
    
    // Crear macros por defecto
    const createdMacros = await Macro.insertMany(defaultMacros);
    
    // Log audit
    await AuditLog.logChange('Macro', null, 'create', userId, 
      { action: 'restore_defaults', count: createdMacros.length }, 
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    res.json({
      message: `${createdMacros.length} macros por defecto restaurados`,
      macros: createdMacros
    });
    
  } catch (error) {
    console.error('Error al restaurar macros por defecto:', error);
    res.status(500).json({ error: 'Error al restaurar macros' });
  }
});

/**
 * PATCH /api/macros/:id/toggle
 * Habilitar/deshabilitar macro
 */
router.patch('/:id/toggle',
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
      const macroId = req.params.id;
      
      // Buscar macro
      const macro = await Macro.findOne({ 
        _id: macroId, 
        userId 
      });
      
      if (!macro) {
        return res.status(404).json({ error: 'Macro no encontrado' });
      }
      
      // Toggle isEnabled
      macro.isEnabled = !macro.isEnabled;
      await macro.save();
      
      // Log audit
      await AuditLog.logChange('Macro', macro._id, 'update', userId, 
        { action: 'toggle', isEnabled: macro.isEnabled }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.json({
        message: `Macro ${macro.isEnabled ? 'habilitado' : 'deshabilitado'}`,
        macro
      });
      
    } catch (error) {
      console.error('Error al toggle macro:', error);
      res.status(500).json({ error: 'Error al cambiar estado del macro' });
    }
  }
);

module.exports = router;
