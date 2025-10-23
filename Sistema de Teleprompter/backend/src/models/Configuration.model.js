const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido'],
    unique: true // Solo 1 configuración por usuario
  },
  // Texto
  fontSize: {
    type: Number,
    default: 48,
    min: [12, 'Tamaño de fuente mínimo es 12'],
    max: [120, 'Tamaño de fuente máximo es 120']
  },
  fontFamily: {
    type: String,
    default: 'Arial',
    enum: ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana', 'Georgia']
  },
  textColor: {
    type: String,
    default: '#FFFFFF',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color de texto debe ser un color HEX válido (#RRGGBB)']
  },
  backgroundColor: {
    type: String,
    default: '#000000',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color de fondo debe ser un color HEX válido (#RRGGBB)']
  },
  
  // Scroll
  scrollSpeed: {
    type: Number,
    default: 50,
    min: [1, 'Velocidad de scroll mínima es 1'],
    max: [100, 'Velocidad de scroll máxima es 100']
  },
  scrollDirection: {
    type: String,
    default: 'vertical',
    enum: ['vertical', 'horizontal']
  },
  
  // Línea Guía
  guidelinePosition: {
    type: Number,
    default: 30, // Porcentaje desde arriba (0-100)
    min: [0, 'Posición de línea guía mínima es 0%'],
    max: [100, 'Posición de línea guía máxima es 100%']
  },
  guidelineThickness: {
    type: Number,
    default: 2, // Pixeles
    min: [1, 'Grosor mínimo de línea guía es 1px'],
    max: [10, 'Grosor máximo de línea guía es 10px']
  },
  guidelineColor: {
    type: String,
    default: '#FF0000',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color de línea guía debe ser un color HEX válido']
  },
  guidelineVisible: {
    type: Boolean,
    default: true
  },
  
  // Ventana Flotante
  floatingWindow: {
    position: {
      x: { type: Number, default: 100 },
      y: { type: Number, default: 100 }
    },
    size: {
      width: { type: Number, default: 960 },
      height: { type: Number, default: 720 }
    },
    isMaximized: { type: Boolean, default: false }
  },
  
  // Otras opciones
  mirrorMode: {
    type: Boolean,
    default: false
  },
  showClock: {
    type: Boolean,
    default: false
  },
  autoSave: {
    type: Boolean,
    default: true
  },
  autoSaveInterval: {
    type: Number,
    default: 30, // segundos
    min: [10, 'Intervalo de auto-guardado mínimo es 10 segundos']
  }
}, {
  timestamps: true
});

// Índices
configurationSchema.index({ userId: 1 }, { unique: true });

// Método: Restaurar valores por defecto
configurationSchema.methods.restoreDefaults = function() {
  const defaults = {
    fontSize: 48,
    fontFamily: 'Arial',
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    scrollSpeed: 50,
    scrollDirection: 'vertical',
    guidelinePosition: 30,
    guidelineThickness: 2,
    guidelineColor: '#FF0000',
    guidelineVisible: true,
    mirrorMode: false,
    showClock: false,
    autoSave: true,
    autoSaveInterval: 30
  };
  
  Object.assign(this, defaults);
  return this.save();
};

// Método: Validar colores HEX
configurationSchema.methods.isValidHexColor = function(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

// Método estático: Obtener o crear configuración para usuario
configurationSchema.statics.findOrCreateForUser = async function(userId) {
  let config = await this.findOne({ userId });
  
  if (!config) {
    config = new this({ userId });
    await config.save();
  }
  
  return config;
};

// Método estático: Actualizar configuración parcial
configurationSchema.statics.updateForUser = async function(userId, updates) {
  let config = await this.findOne({ userId });
  
  if (!config) {
    config = new this({ userId, ...updates });
  } else {
    Object.assign(config, updates);
  }
  
  return config.save();
};

// Virtual: Configuración de texto completa
configurationSchema.virtual('textSettings').get(function() {
  return {
    fontSize: this.fontSize,
    fontFamily: this.fontFamily,
    textColor: this.textColor,
    backgroundColor: this.backgroundColor
  };
});

// Virtual: Configuración de scroll completa
configurationSchema.virtual('scrollSettings').get(function() {
  return {
    scrollSpeed: this.scrollSpeed,
    scrollDirection: this.scrollDirection
  };
});

// Virtual: Configuración de línea guía completa
configurationSchema.virtual('guidelineSettings').get(function() {
  return {
    position: this.guidelinePosition,
    thickness: this.guidelineThickness,
    color: this.guidelineColor,
    visible: this.guidelineVisible
  };
});

// Configurar virtuals en JSON
configurationSchema.set('toJSON', { virtuals: true });
configurationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Configuration', configurationSchema);
