const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general para la API
 * 100 requests por 15 minutos por IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true, // Retornar info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
});

/**
 * Rate limiter estricto para endpoints de autenticación
 * 5 intentos por 15 minutos por IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    error: 'Demasiados intentos de login, intente nuevamente en 15 minutos',
    code: 'TOO_MANY_AUTH_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para creación de recursos
 * 20 creaciones por hora por usuario
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: {
    error: 'Demasiadas creaciones de recursos, intente nuevamente más tarde',
    code: 'TOO_MANY_CREATIONS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar userId en lugar de IP
  keyGenerator: (req) => {
    return req.user ? req.user.userId : req.ip;
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};
