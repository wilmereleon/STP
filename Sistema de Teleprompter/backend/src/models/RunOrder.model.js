const mongoose = require('mongoose');

const runOrderItemSchema = new mongoose.Schema({
  scriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Script',
    required: [true, 'Script ID es requerido']
  },
  position: {
    type: Number,
    required: [true, 'Posición es requerida'],
    min: [0, 'Posición debe ser mayor o igual a 0']
  },
  duration: {
    type: Number, // En segundos
    default: 0,
    min: [0, 'Duración debe ser mayor o igual a 0']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notas no pueden exceder 500 caracteres']
  }
}, { _id: true });

const runOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido']
  },
  name: {
    type: String,
    required: [true, 'Nombre del RunOrder es requerido'],
    trim: true,
    minlength: [2, 'Nombre debe tener mínimo 2 caracteres'],
    maxlength: [200, 'Nombre no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    maxlength: [1000, 'Descripción no puede exceder 1000 caracteres']
  },
  items: {
    type: [runOrderItemSchema],
    default: [],
    validate: {
      validator: function(items) {
        // Validar que las posiciones sean únicas y consecutivas
        const positions = items.map(item => item.position).sort((a, b) => a - b);
        for (let i = 0; i < positions.length; i++) {
          if (positions[i] !== i) return false;
        }
        return true;
      },
      message: 'Las posiciones de los items deben ser consecutivas comenzando desde 0'
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  totalDuration: {
    type: Number, // Calculado automáticamente
    default: 0
  }
}, {
  timestamps: true
});

// Índices
runOrderSchema.index({ userId: 1, isActive: 1 });
runOrderSchema.index({ userId: 1, createdAt: -1 });

// Índice compuesto para asegurar solo 1 RunOrder activo por usuario
runOrderSchema.index(
  { userId: 1, isActive: 1 },
  { 
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_runorder_per_user'
  }
);

// Middleware: Calcular totalDuration antes de guardar
runOrderSchema.pre('save', function(next) {
  this.totalDuration = this.items.reduce((sum, item) => sum + (item.duration || 0), 0);
  next();
});

// Middleware: Validar que solo haya 1 activo por usuario
runOrderSchema.pre('save', async function(next) {
  if (this.isActive && !this.isNew) {
    // Si está marcando como activo, desactivar otros del mismo usuario
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id }, isActive: true },
      { isActive: false }
    );
  }
  next();
});

// Método: Agregar item al final
runOrderSchema.methods.addItem = function(scriptId, duration, notes) {
  const position = this.items.length;
  this.items.push({
    scriptId,
    position,
    duration: duration || 0,
    notes: notes || '',
    isCompleted: false
  });
  return this.save();
};

// Método: Remover item por posición
runOrderSchema.methods.removeItem = function(position) {
  this.items = this.items.filter(item => item.position !== position);
  // Reindexar posiciones
  this.items.forEach((item, index) => {
    item.position = index;
  });
  return this.save();
};

// Método: Reordenar items
runOrderSchema.methods.reorderItems = function(newOrder) {
  // newOrder es un array de scriptIds en el nuevo orden
  const itemsMap = new Map(this.items.map(item => [item.scriptId.toString(), item]));
  
  this.items = newOrder.map((scriptId, index) => {
    const item = itemsMap.get(scriptId.toString());
    if (item) {
      item.position = index;
      return item;
    }
  }).filter(Boolean);
  
  return this.save();
};

// Método: Marcar item como completado
runOrderSchema.methods.markItemCompleted = function(position) {
  const item = this.items.find(i => i.position === position);
  if (item) {
    item.isCompleted = true;
    return this.save();
  }
  throw new Error('Item no encontrado en posición ' + position);
};

// Método: Activar este RunOrder (desactiva los demás del usuario)
runOrderSchema.methods.activate = async function() {
  // Desactivar otros RunOrders del mismo usuario
  await this.constructor.updateMany(
    { userId: this.userId, _id: { $ne: this._id } },
    { isActive: false }
  );
  
  this.isActive = true;
  return this.save();
};

// Método estático: Obtener RunOrder activo de un usuario
runOrderSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ userId, isActive: true })
    .populate('items.scriptId', 'title category duration')
    .populate('userId', 'name email');
};

// Método estático: Obtener todos los RunOrders de un usuario
runOrderSchema.statics.findByUser = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('items.scriptId', 'title category')
    .populate('userId', 'name email');
};

// Virtual: Número de items
runOrderSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Virtual: Items completados
runOrderSchema.virtual('completedCount').get(function() {
  return this.items.filter(item => item.isCompleted).length;
});

// Virtual: Porcentaje de progreso
runOrderSchema.virtual('progressPercent').get(function() {
  if (this.items.length === 0) return 0;
  return Math.round((this.completedCount / this.items.length) * 100);
});

// Configurar virtuals en JSON y Object
runOrderSchema.set('toJSON', { virtuals: true });
runOrderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RunOrder', runOrderSchema);
