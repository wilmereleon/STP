const jwt = require('jsonwebtoken');
const { Session } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware de autenticación JWT
 * Verifica el token y agrega req.user con la información del usuario
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        code: 'NO_TOKEN'
      });
    }
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Verificar que la sesión existe y está activa
    const session = await Session.findOne({ 
      token, 
      isActive: true 
    });
    
    if (!session) {
      return res.status(401).json({ 
        error: 'Sesión inválida o expirada',
        code: 'INVALID_SESSION'
      });
    }
    
    // Verificar que la sesión no ha expirado
    if (session.expiresAt < new Date()) {
      session.isActive = false;
      await session.save();
      
      return res.status(401).json({ 
        error: 'Sesión expirada',
        code: 'SESSION_EXPIRED'
      });
    }
    
    // Agregar información del usuario a req
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
    
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    res.status(500).json({ error: 'Error en autenticación' });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {string[]} allowedRoles - Array de roles permitidos (ej: ['Admin', 'Producer'])
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar que el usuario es Admin
 */
const requireAdmin = requireRole(['Admin']);

/**
 * Middleware para verificar que el usuario es Admin o Producer
 */
const requireProducerOrAdmin = requireRole(['Admin', 'Producer']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireProducerOrAdmin
};
