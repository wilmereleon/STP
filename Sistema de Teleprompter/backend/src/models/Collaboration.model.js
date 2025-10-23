const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  scriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Script',
    required: [true, 'Script ID es requerido']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido']
  },
  lockType: {
    type: String,
    enum: ['read', 'write'],
    default: 'write'
  },
  lockExpiry: {
    type: Date,
    required: [true, 'Lock expiry es requerido'],
    index: { expires: 0 } // TTL index - auto-delete cuando expire
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Índices
collaborationSchema.index({ scriptId: 1, userId: 1 });
collaborationSchema.index({ lockExpiry: 1 }); // Para TTL

// Método estático: Adquirir lock
collaborationSchema.statics.acquireLock = async function(scriptId, userId, durationMinutes = 15) {
  const lockExpiry = new Date(Date.now() + durationMinutes * 60 * 1000);
  
  // Intentar crear lock
  return this.findOneAndUpdate(
    { scriptId, userId },
    { lockExpiry, lockType: 'write' },
    { upsert: true, new: true }
  );
};

// Método estático: Liberar lock
collaborationSchema.statics.releaseLock = async function(scriptId, userId) {
  return this.deleteOne({ scriptId, userId });
};

// Método estático: Verificar si script está bloqueado
collaborationSchema.statics.isLocked = async function(scriptId, excludeUserId = null) {
  const query = { scriptId, lockExpiry: { $gt: new Date() } };
  if (excludeUserId) {
    query.userId = { $ne: excludeUserId };
  }
  
  return !!(await this.findOne(query));
};

module.exports = mongoose.model('Collaboration', collaborationSchema);
