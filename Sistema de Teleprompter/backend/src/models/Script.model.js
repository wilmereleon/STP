const mongoose = require('mongoose');

/**
 * Esquema de Script para el Teleprompter
 * 
 * Almacena el contenido de los guiones, metadatos,
 * historial de versiones y configuraciones específicas.
 */
const scriptSchema = new mongoose.Schema({
  // Identificación
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },

  // Contenido
  content: {
    type: String,
    required: [true, 'El contenido es obligatorio'],
    default: ''
  },

  // Metadatos
  category: {
    type: String,
    enum: ['Noticias', 'Deportes', 'Clima', 'Entrevista', 'Especial', 'Comercial', 'Otro'],
    default: 'Noticias'
  },

  duration: {
    type: Number, // En segundos
    default: 0,
    min: [0, 'La duración no puede ser negativa']
  },

  priority: {
    type: String,
    enum: ['Alta', 'Media', 'Baja'],
    default: 'Media'
  },

  status: {
    type: String,
    enum: ['Borrador', 'Revisión', 'Aprobado', 'En Uso', 'Archivado'],
    default: 'Borrador'
  },

  // Configuración específica del script
  fontSize: {
    type: Number,
    default: null, // null = usar configuración global
    min: 12,
    max: 120
  },

  scrollSpeed: {
    type: Number,
    default: null, // null = usar configuración global
    min: 1,
    max: 100
  },

  // Autoría y colaboración
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Historial de versiones
  versions: [{
    content: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changeDescription: String
  }],

  // Marcadores de salto (para scripts largos)
  jumpMarkers: [{
    position: Number, // Posición en el contenido (índice de carácter)
    label: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Estadísticas de uso
  timesUsed: {
    type: Number,
    default: 0
  },

  lastUsedAt: {
    type: Date,
    default: null
  },

  // Tags para búsqueda y organización
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Notas del productor
  producerNotes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  }

}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas eficientes
scriptSchema.index({ title: 'text', content: 'text', tags: 'text' });
scriptSchema.index({ status: 1, createdAt: -1 });
scriptSchema.index({ category: 1 });
scriptSchema.index({ createdBy: 1 });

// Virtual: duración estimada en formato legible
scriptSchema.virtual('durationFormatted').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Método: Crear nueva versión
scriptSchema.methods.createVersion = function(modifiedBy, changeDescription) {
  this.versions.push({
    content: this.content,
    modifiedBy,
    modifiedAt: new Date(),
    changeDescription
  });
  
  // Mantener solo las últimas 10 versiones
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(-10);
  }
  
  return this.save();
};

// Método: Marcar como usado
scriptSchema.methods.markAsUsed = function() {
  this.timesUsed += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Pre-save hook: Actualizar duración basada en contenido
scriptSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Estimar duración: ~180 palabras por minuto promedio de lectura
    const wordCount = this.content.split(/\s+/).length;
    this.duration = Math.ceil((wordCount / 180) * 60);
  }
  next();
});

const Script = mongoose.model('Script', scriptSchema);

module.exports = Script;
