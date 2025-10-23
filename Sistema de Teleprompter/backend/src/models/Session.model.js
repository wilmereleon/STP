const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido']
  },
  token: {
    type: String,
    required: [true, 'Token es requerido'],
    unique: true
  },
  refreshToken: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date es requerido'],
    index: { expires: 0 } // TTL index - auto-delete cuando expire
  },
  ipAddress: String,
  userAgent: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expiresAt: 1 }); // Para TTL

// Método estático: Crear sesión
sessionSchema.statics.createSession = function(userId, token, refreshToken, expirationMinutes = 60, metadata = {}) {
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  
  return this.create({
    userId,
    token,
    refreshToken,
    expiresAt,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    isActive: true
  });
};

// Método estático: Invalidar sesión
sessionSchema.statics.invalidateSession = async function(token) {
  return this.findOneAndUpdate(
    { token },
    { isActive: false },
    { new: true }
  );
};

// Método estático: Invalidar todas las sesiones de un usuario
sessionSchema.statics.invalidateAllUserSessions = async function(userId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

// Método estático: Verificar si sesión es válida
sessionSchema.statics.isValid = async function(token) {
  const session = await this.findOne({ 
    token, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
  
  return !!session;
};

module.exports = mongoose.model('Session', sessionSchema);
