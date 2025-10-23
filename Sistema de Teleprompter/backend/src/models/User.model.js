const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Password es requerido'],
    minlength: [8, 'Password debe tener mínimo 8 caracteres'],
    select: false // No devolver password en queries por defecto
  },
  name: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    minlength: [2, 'Nombre debe tener mínimo 2 caracteres'],
    maxlength: [100, 'Nombre no puede exceder 100 caracteres']
  },
  role: {
    type: String,
    enum: {
      values: ['Admin', 'Producer', 'Operator'],
      message: '{VALUE} no es un rol válido'
    },
    default: 'Operator'
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password; // No incluir password en JSON
      return ret;
    }
  }
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Middleware: Hash password antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear si password fue modificado
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método: Comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar passwords');
  }
};

// Método: Obtener perfil público (sin datos sensibles)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    createdAt: this.createdAt
  };
};

// Método estático: Buscar por email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Método estático: Buscar usuarios activos por rol
userSchema.statics.findActiveByRole = function(role) {
  return this.find({ role, isActive: true }).sort({ name: 1 });
};

// Virtual: Full name (si en el futuro separamos nombre y apellido)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

module.exports = mongoose.model('User', userSchema);
