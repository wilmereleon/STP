const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: [true, 'Entity type es requerido'],
    enum: ['User', 'Script', 'RunOrder', 'Configuration', 'Macro'],
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID es requerido'],
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action es requerido'],
    enum: ['create', 'update', 'delete', 'read', 'login', 'logout']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido']
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // {before: {...}, after: {...}}
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: { createdAt: true, updatedAt: false } // Solo createdAt
});

// Índices compuestos
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Método estático: Log de cambio
auditLogSchema.statics.logChange = function(entityType, entityId, action, userId, changes = {}, metadata = {}) {
  return this.create({
    entityType,
    entityId,
    action,
    userId,
    changes,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent
  });
};

// Método estático: Obtener historial de una entidad
auditLogSchema.statics.getHistory = function(entityType, entityId, limit = 50) {
  return this.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
