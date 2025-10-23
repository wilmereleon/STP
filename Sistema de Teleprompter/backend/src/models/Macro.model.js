const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido']
  },
  key: {
    type: String,
    required: [true, 'Tecla/combinación es requerida'],
    trim: true,
    maxlength: [50, 'Tecla no puede exceder 50 caracteres']
  },
  action: {
    type: String,
    required: [true, 'Acción es requerida'],
    enum: {
      values: ['play', 'pause', 'reset', 'scrollUp', 'scrollDown', 'increaseFontSize', 'decreaseFontSize', 
               'jumpToMarker', 'toggleGuideline', 'toggleFullscreen'],
      message: '{VALUE} no es una acción válida'
    }
  },
  description: {
    type: String,
    maxlength: [200, 'Descripción no puede exceder 200 caracteres']
  },
  params: {
    type: mongoose.Schema.Types.Mixed, // Parámetros adicionales (ej: markerId para jumpToMarker)
    default: {}
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
macroSchema.index({ userId: 1, key: 1 }, { unique: true }); // Unique key per user
macroSchema.index({ userId: 1, isEnabled: 1 });

// Método estático: Obtener macros activos de usuario
macroSchema.statics.findEnabledByUser = function(userId) {
  return this.find({ userId, isEnabled: true }).sort({ key: 1 });
};

// Método estático: Crear macros por defecto
macroSchema.statics.createDefaults = async function(userId) {
  const defaults = [
    { userId, key: 'F11', action: 'play', description: 'Iniciar reproducción' },
    { userId, key: 'F10', action: 'reset', description: 'Reiniciar a inicio' },
    { userId, key: 'PageUp', action: 'scrollUp', description: 'Scroll hacia arriba' },
    { userId, key: 'PageDown', action: 'scrollDown', description: 'Scroll hacia abajo' },
    { userId, key: 'Ctrl++', action: 'increaseFontSize', description: 'Aumentar tamaño de fuente' },
    { userId, key: 'Ctrl+-', action: 'decreaseFontSize', description: 'Disminuir tamaño de fuente' }
  ];
  
  return this.insertMany(defaults, { ordered: false }).catch(err => {
    if (err.code === 11000) return; // Ignore duplicates
    throw err;
  });
};

module.exports = mongoose.model('Macro', macroSchema);
