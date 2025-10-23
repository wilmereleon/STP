/**
 * Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado por errorHandler:', err);
  
  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors
    });
  }
  
  // Error de casting de Mongoose (ej: ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      code: 'INVALID_ID',
      field: err.path
    });
  }
  
  // Error de duplicado (código 11000 de MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: `${field} ya existe`,
      code: 'DUPLICATE_KEY',
      field
    });
  }
  
  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }
  
  // Error genérico del servidor
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para capturar rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Wrapper para async handlers
 * Captura errores en funciones async y los pasa a errorHandler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
