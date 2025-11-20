const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Importar routers
const authRoutes = require('./auth.routes');
const scriptRoutes = require('./script.routes');
const runorderRoutes = require('./runorder.routes');
const configRoutes = require('./config.routes');
const macroRoutes = require('./macro.routes');

/**
 * Configurar todas las rutas de la API
 * @param {express.Application} app - Instancia de Express
 */
const setupRoutes = (app) => {
  // Rutas públicas (sin autenticación)
  app.use('/api/auth', authRoutes);
  
  // Rutas con autenticación opcional (permite modo invitado)
  // Los usuarios invitados tienen acceso de solo lectura
  app.use('/api/scripts', optionalAuth, scriptRoutes);
  app.use('/api/runorders', optionalAuth, runorderRoutes);
  app.use('/api/config', optionalAuth, configRoutes);
  app.use('/api/macros', optionalAuth, macroRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Teleprompter API',
      version: '1.0.0',
      description: 'API para Sistema de Teleprompter Profesional',
      endpoints: {
        auth: '/api/auth',
        scripts: '/api/scripts',
        runorders: '/api/runorders',
        config: '/api/config',
        macros: '/api/macros'
      },
      documentation: '/api/docs' // TODO: Implementar Swagger
    });
  });
};

module.exports = setupRoutes;
