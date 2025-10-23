const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Session, AuditLog } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Password debe tener mínimo 8 caracteres'),
    body('name').trim().isLength({ min: 2 }).withMessage('Nombre debe tener mínimo 2 caracteres'),
    body('role').optional().isIn(['Admin', 'Producer', 'Operator']).withMessage('Rol inválido')
  ],
  async (req, res) => {
    try {
      // Validar input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password, name, role } = req.body;
      
      // Verificar si email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email ya registrado',
          code: 'EMAIL_EXISTS'
        });
      }
      
      // Crear usuario
      const user = new User({
        email,
        password, // Se hasheará automáticamente en el pre-save hook
        name,
        role: role || 'Operator'
      });
      
      await user.save();
      
      // Log audit
      await AuditLog.logChange('User', user._id, 'create', user._id, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      // Retornar usuario (sin password)
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: user.getPublicProfile()
      });
      
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').exists().withMessage('Password es requerido')
  ],
  async (req, res) => {
    try {
      // Validar input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password } = req.body;
      
      // Buscar usuario (incluir password para comparación)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Verificar password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Verificar si usuario está activo
      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'Usuario desactivado',
          code: 'USER_INACTIVE'
        });
      }
      
      // Generar JWT tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
      );
      
      // Crear sesión
      await Session.createSession(
        user._id,
        accessToken,
        refreshToken,
        60, // 60 minutos
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      // Actualizar lastLogin
      user.lastLogin = new Date();
      await user.save();
      
      // Log audit
      await AuditLog.logChange('User', user._id, 'login', user._id, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      // Retornar tokens y usuario
      res.json({
        message: 'Login exitoso',
        accessToken,
        refreshToken,
        user: user.getPublicProfile()
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
);

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }
    
    // Invalidar sesión
    await Session.invalidateSession(token);
    
    // Decodificar token para obtener userId (sin verificar expiración)
    const decoded = jwt.decode(token);
    if (decoded && decoded.userId) {
      await AuditLog.logChange('User', decoded.userId, 'logout', decoded.userId, {}, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }
    
    res.json({ message: 'Logout exitoso' });
    
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token no proporcionado' });
    }
    
    // Verificar refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Refresh token inválido o expirado',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }
    
    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    
    // Crear nueva sesión
    await Session.createSession(
      user._id,
      newAccessToken,
      refreshToken,
      60,
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    res.json({
      message: 'Token renovado exitosamente',
      accessToken: newAccessToken
    });
    
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ error: 'Error al renovar token' });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 * Requiere: JWT token válido
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ user: user.getPublicProfile() });
    
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ error: 'Error al obtener información de usuario' });
  }
});

module.exports = router;
