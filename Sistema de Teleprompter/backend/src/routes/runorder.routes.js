const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const { RunOrder, Script, AuditLog } = require('../models');

/**
 * GET /api/runorders
 * Listar todos los runorders del usuario
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page debe ser >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit entre 1-100'),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser booleano')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user ? req.user.userId : null;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Construir query
      const query = userId ? { userId } : {};
      
      if (req.query.isActive !== undefined) {
        query.isActive = req.query.isActive === 'true';
      }
      
      // Ejecutar query
      const [runorders, total] = await Promise.all([
        RunOrder.find(query)
          .populate('runOrderItems.scriptId', 'title metadata')
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        RunOrder.countDocuments(query)
      ]);
      
      res.json({
        runorders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Error al listar runorders:', error);
      res.status(500).json({ error: 'Error al obtener runorders' });
    }
  }
);

/**
 * POST /api/runorders
 * Crear nuevo runorder
 */
router.post('/',
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Título requerido (1-255 chars)'),
    body('description').optional().isString().withMessage('Description debe ser string'),
    body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const { title, description, isActive } = req.body;
      
      // Si se marca como activo, desactivar otros
      if (isActive) {
        await RunOrder.updateMany(
          { userId, isActive: true },
          { $set: { isActive: false } }
        );
      }
      
      // Crear runorder
      const runorder = new RunOrder({
        userId,
        title,
        description: description || '',
        isActive: isActive || false,
        runOrderItems: []
      });
      
      await runorder.save();
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorder._id, 'create', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(201).json({
        message: 'RunOrder creado exitosamente',
        runorder
      });
      
    } catch (error) {
      console.error('Error al crear runorder:', error);
      res.status(500).json({ error: 'Error al crear runorder' });
    }
  }
);

/**
 * GET /api/runorders/:id
 * Obtener runorder por ID con todos sus items
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
      
      const userId = req.user.userId;
      const runorderId = req.params.id;
      
      // Buscar runorder con scripts populados
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      }).populate('runOrderItems.scriptId', 'title content metadata');
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      res.json({ runorder });
      
    } catch (error) {
      console.error('Error al obtener runorder:', error);
      res.status(500).json({ error: 'Error al obtener runorder' });
    }
  }
);

/**
 * PUT /api/runorders/:id
 * Actualizar runorder
 */
router.put('/:id',
  [
    param('id').isMongoId().withMessage('ID inválido'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Título (1-255 chars)'),
    body('description').optional().isString().withMessage('Description debe ser string'),
    body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const runorderId = req.params.id;
      const updates = req.body;
      
      // Buscar runorder
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      });
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      // Si se activa, desactivar otros
      if (updates.isActive === true) {
        await RunOrder.updateMany(
          { userId, isActive: true, _id: { $ne: runorderId } },
          { $set: { isActive: false } }
        );
      }
      
      // Guardar estado anterior
      const oldState = runorder.toObject();
      
      // Aplicar updates
      Object.keys(updates).forEach(key => {
        if (['title', 'description', 'isActive'].includes(key)) {
          runorder[key] = updates[key];
        }
      });
      
      await runorder.save();
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorder._id, 'update', userId, oldState, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        message: 'RunOrder actualizado exitosamente',
        runorder
      });
      
    } catch (error) {
      console.error('Error al actualizar runorder:', error);
      res.status(500).json({ error: 'Error al actualizar runorder' });
    }
  }
);

/**
 * DELETE /api/runorders/:id
 * Eliminar runorder
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
      const runorderId = req.params.id;
      
      // Buscar runorder
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      });
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      // Eliminar
      await runorder.deleteOne();
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorderId, 'delete', userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ 
        message: 'RunOrder eliminado exitosamente',
        runorderId
      });
      
    } catch (error) {
      console.error('Error al eliminar runorder:', error);
      res.status(500).json({ error: 'Error al eliminar runorder' });
    }
  }
);

/**
 * POST /api/runorders/:id/items
 * Agregar script al runorder
 */
router.post('/:id/items',
  [
    param('id').isMongoId().withMessage('RunOrder ID inválido'),
    body('scriptId').isMongoId().withMessage('Script ID inválido'),
    body('position').optional().isInt({ min: 0 }).withMessage('Position debe ser >= 0'),
    body('duration').optional().isInt({ min: 0 }).withMessage('Duration debe ser >= 0')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const runorderId = req.params.id;
      const { scriptId, position, duration } = req.body;
      
      // Verificar que el script existe y pertenece al usuario
      const script = await Script.findOne({ 
        _id: scriptId, 
        userId,
        deletedAt: null 
      });
      
      if (!script) {
        return res.status(404).json({ error: 'Script no encontrado' });
      }
      
      // Buscar runorder
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      });
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      // Agregar item
      const newItem = {
        scriptId,
        position: position !== undefined ? position : runorder.runOrderItems.length,
        duration: duration || 0
      };
      
      runorder.runOrderItems.push(newItem);
      await runorder.save(); // Trigger pre-save para recalcular totalDuration
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorder._id, 'update', userId, 
        { action: 'add_item', scriptId }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      // Recargar con populate
      await runorder.populate('runOrderItems.scriptId', 'title metadata');
      
      res.status(201).json({
        message: 'Script agregado al RunOrder',
        runorder
      });
      
    } catch (error) {
      console.error('Error al agregar item:', error);
      res.status(500).json({ error: 'Error al agregar script' });
    }
  }
);

/**
 * PUT /api/runorders/:id/items/:itemId
 * Actualizar item del runorder (posición, duración)
 */
router.put('/:id/items/:itemId',
  [
    param('id').isMongoId().withMessage('RunOrder ID inválido'),
    param('itemId').isMongoId().withMessage('Item ID inválido'),
    body('position').optional().isInt({ min: 0 }).withMessage('Position debe ser >= 0'),
    body('duration').optional().isInt({ min: 0 }).withMessage('Duration debe ser >= 0')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const { id: runorderId, itemId } = req.params;
      const { position, duration } = req.body;
      
      // Buscar runorder
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      });
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      // Buscar item
      const item = runorder.runOrderItems.id(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item no encontrado' });
      }
      
      // Actualizar
      if (position !== undefined) item.position = position;
      if (duration !== undefined) item.duration = duration;
      
      await runorder.save();
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorder._id, 'update', userId, 
        { action: 'update_item', itemId, position, duration }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.json({
        message: 'Item actualizado exitosamente',
        runorder
      });
      
    } catch (error) {
      console.error('Error al actualizar item:', error);
      res.status(500).json({ error: 'Error al actualizar item' });
    }
  }
);

/**
 * DELETE /api/runorders/:id/items/:itemId
 * Eliminar item del runorder
 */
router.delete('/:id/items/:itemId',
  [
    param('id').isMongoId().withMessage('RunOrder ID inválido'),
    param('itemId').isMongoId().withMessage('Item ID inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const userId = req.user.userId;
      const { id: runorderId, itemId } = req.params;
      
      // Buscar runorder
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      });
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      // Eliminar item usando pull
      runorder.runOrderItems.pull(itemId);
      await runorder.save();
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorder._id, 'update', userId, 
        { action: 'remove_item', itemId }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.json({
        message: 'Item eliminado exitosamente',
        runorder
      });
      
    } catch (error) {
      console.error('Error al eliminar item:', error);
      res.status(500).json({ error: 'Error al eliminar item' });
    }
  }
);

/**
 * PUT /api/runorders/:id/activate
 * Activar runorder (desactiva los demás)
 */
router.put('/:id/activate',
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
      const runorderId = req.params.id;
      
      // Buscar runorder
      const runorder = await RunOrder.findOne({ 
        _id: runorderId, 
        userId 
      });
      
      if (!runorder) {
        return res.status(404).json({ error: 'RunOrder no encontrado' });
      }
      
      // Desactivar todos los demás
      await RunOrder.updateMany(
        { userId, _id: { $ne: runorderId } },
        { $set: { isActive: false } }
      );
      
      // Activar este
      runorder.isActive = true;
      await runorder.save();
      
      // Log audit
      await AuditLog.logChange('RunOrder', runorder._id, 'update', userId, 
        { action: 'activate' }, 
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.json({
        message: 'RunOrder activado exitosamente',
        runorder
      });
      
    } catch (error) {
      console.error('Error al activar runorder:', error);
      res.status(500).json({ error: 'Error al activar runorder' });
    }
  }
);

module.exports = router;
