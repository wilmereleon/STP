const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');

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
  
  // Rutas protegidas (requieren autenticación)
  app.use('/api/scripts', authenticateToken, scriptRoutes);
  app.use('/api/runorders', authenticateToken, runorderRoutes);
  app.use('/api/config', authenticateToken, configRoutes);
  app.use('/api/macros', authenticateToken, macroRoutes);
  
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
