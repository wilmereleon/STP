const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Configuration, AuditLog } = require('../models');

/**
 * GET /api/config
 * Obtener configuración del usuario (crea una por defecto si no existe)
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Buscar o crear configuración
    let config = await Configuration.findOne({ userId });
    
    if (!config) {
      // Crear configuración por defecto
      config = new Configuration({ userId });
      await config.save();
      
      // Log audit
      await AuditLog.logChange('Configuration', config._id, 'create', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }
    
    res.json({ config });
    
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

/**
 * PUT /api/config
 * Actualizar configuración (permite actualizaciones parciales)
 */
router.put('/',
  [
    // Validaciones para campos numéricos
    body('fontSize').optional().isInt({ min: 12, max: 120 }).withMessage('fontSize debe estar entre 12-120'),
    body('scrollSpeed').optional().isInt({ min: 1, max: 100 }).withMessage('scrollSpeed debe estar entre 1-100'),
    body('guidelinePosition').optional().isInt({ min: 0, max: 100 }).withMessage('guidelinePosition debe estar entre 0-100'),
    body('guidelineThickness').optional().isInt({ min: 1, max: 10 }).withMessage('guidelineThickness debe estar entre 1-10'),
    
    // Validaciones para colores (hex)
    body('textColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('textColor debe ser hex válido'),
    body('backgroundColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('backgroundColor debe ser hex válido'),
    body('guidelineColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('guidelineColor debe ser hex válido'),
    
    // Validaciones para booleanos
    body('showGuideline').optional().isBoolean().withMessage('showGuideline debe ser booleano'),
    body('mirrorMode').optional().isBoolean().withMessage('mirrorMode debe ser booleano'),
    body('autoSave').optional().isBoolean().withMessage('autoSave debe ser booleano'),
    
    // Validaciones para strings
    body('fontFamily').optional().isString().trim().withMessage('fontFamily debe ser string'),
    body('theme').optional().isIn(['light', 'dark']).withMessage('theme debe ser light o dark')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const updates = req.body;
      
      // Buscar configuración existente
      let config = await Configuration.findOne({ userId });
      
      // Si no existe, crear nueva
      if (!config) {
        config = new Configuration({ userId, ...updates });
        await config.save();
        
        await AuditLog.logChange('Configuration', config._id, 'create', userId, {}, {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
        
        return res.status(201).json({
          message: 'Configuración creada exitosamente',
          config
        });
      }
      
      // Guardar estado anterior
      const oldState = config.toObject();
      
      // Aplicar updates (solo campos permitidos)
      const allowedFields = [
        'fontSize', 'fontFamily', 'textColor', 'backgroundColor',
        'scrollSpeed', 'guidelinePosition', 'guidelineColor', 'guidelineThickness',
        'showGuideline', 'mirrorMode', 'autoSave', 'theme'
      ];
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          config[key] = updates[key];
        }
      });
      
      await config.save();
      
      // Log audit
      await AuditLog.logChange('Configuration', config._id, 'update', userId, oldState, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        message: 'Configuración actualizada exitosamente',
        config
      });
      
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  }
);

/**
 * POST /api/config/reset
 * Resetear configuración a valores por defecto
 */
router.post('/reset', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Buscar configuración existente
    let config = await Configuration.findOne({ userId });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    // Guardar estado anterior
    const oldState = config.toObject();
    
    // Resetear a valores por defecto (definidos en el schema)
    config.fontSize = 48;
    config.fontFamily = 'Arial';
    config.textColor = '#FFFFFF';
    config.backgroundColor = '#000000';
    config.scrollSpeed = 50;
    config.guidelinePosition = 50;
    config.guidelineColor = '#FF0000';
    config.guidelineThickness = 2;
    config.showGuideline = true;
    config.mirrorMode = false;
    config.autoSave = true;
    config.theme = 'dark';
    
    await config.save();
    
    // Log audit
    await AuditLog.logChange('Configuration', config._id, 'update', userId, 
      { ...oldState, action: 'reset' }, 
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    res.json({
      message: 'Configuración reseteada a valores por defecto',
      config
    });
    
  } catch (error) {
    console.error('Error al resetear configuración:', error);
    res.status(500).json({ error: 'Error al resetear configuración' });
  }
});

/**
 * PATCH /api/config/theme
 * Cambiar solo el tema (light/dark)
 */
router.patch('/theme',
  [
    body('theme').isIn(['light', 'dark']).withMessage('theme debe ser light o dark')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const { theme } = req.body;
      
      // Buscar o crear configuración
      let config = await Configuration.findOne({ userId });
      
      if (!config) {
        config = new Configuration({ userId, theme });
        await config.save();
        
        return res.status(201).json({
          message: 'Configuración creada con tema',
          config
        });
      }
      
      const oldTheme = config.theme;
      config.theme = theme;
      
      // Si cambia a dark, ajustar colores
      if (theme === 'dark') {
        config.textColor = '#FFFFFF';
        config.backgroundColor = '#000000';
      } else {
        config.textColor = '#000000';
        config.backgroundColor = '#FFFFFF';
      }
      
      await config.save();
      
      // Log audit
      await AuditLog.logChange('Configuration', config._id, 'update', userId, 
        { action: 'change_theme', oldTheme, newTheme: theme }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.json({
        message: `Tema cambiado a ${theme}`,
        config
      });
      
    } catch (error) {
      console.error('Error al cambiar tema:', error);
      res.status(500).json({ error: 'Error al cambiar tema' });
    }
  }
);

module.exports = router;
