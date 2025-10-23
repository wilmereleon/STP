const { validationResult } = require('express-validator');

/**
 * Middleware para validar los resultados de express-validator
 * Si hay errores de validación, retorna 400 con los detalles
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

module.exports = {
  validate
};
