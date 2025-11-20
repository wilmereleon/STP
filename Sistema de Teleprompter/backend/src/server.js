const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Cargar variables de entorno
dotenv.config();

// Importar middlewares
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

// Importar configuración de rutas
const setupRoutes = require('./routes/index');

// Crear aplicación Express
const app = express();
const server = http.createServer(app);

// Configurar orígenes permitidos para CORS
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

console.log('🌐 Orígenes CORS permitidos:', allowedOrigins);

// Configurar Socket.IO para sincronización en tiempo real
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitar para desarrollo
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (aplicar a todas las rutas API)
app.use('/api/', apiLimiter);

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Conectar a MongoDB
const MONGO_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/teleprompter';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1); // Salir si no se puede conectar a la DB
  });

// Configurar todas las rutas API (centralizado)
setupRoutes(app);

// Middleware para rutas no encontradas (debe ir antes del errorHandler)
app.use(notFoundHandler);

// Middleware global de manejo de errores (debe ser el último)
app.use(errorHandler);

// ============================================
// WEBSOCKET - Sincronización en Tiempo Real
// ============================================
const activeConnections = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  activeConnections.set(socket.id, { role: 'operator', connectedAt: Date.now() });

  // Identificar rol del cliente (operator/producer)
  socket.on('identify', (data) => {
    activeConnections.set(socket.id, {
      ...activeConnections.get(socket.id),
      role: data.role,
      userId: data.userId
    });
    console.log(`👤 Cliente ${socket.id} identificado como: ${data.role}`);
  });

  // Sincronizar estado del teleprompter
  socket.on('sync:teleprompter', (data) => {
    socket.broadcast.emit('sync:teleprompter', data);
  });

  // Sincronizar RunOrder
  socket.on('sync:runorder', (data) => {
    socket.broadcast.emit('sync:runorder', data);
  });

  // Notificar cambios de scripts (desde Producer)
  socket.on('script:updated', (data) => {
    io.emit('script:updated', data);
  });

  socket.on('script:created', (data) => {
    io.emit('script:created', data);
  });

  socket.on('script:deleted', (data) => {
    io.emit('script:deleted', data);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
    activeConnections.delete(socket.id);
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎬 TELEPROMPTER BACKEND API            ║
║   Servidor corriendo en puerto ${PORT}       ║
║   WebSocket: ${process.env.WS_PORT || 3001}                         ║
║   Entorno: ${process.env.NODE_ENV || 'development'}              ║
╚═══════════════════════════════════════════╝
  `);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    mongoose.connection.close(false, () => {
      console.log('✅ Conexión a MongoDB cerrada');
      process.exit(0);
    });
  });
});

module.exports = { app, io, server };
