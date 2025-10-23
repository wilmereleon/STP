# 🚀 API Routes Documentation

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Scripts](#scripts)
- [RunOrders](#runorders)
- [Configuración](#configuración)
- [Macros](#macros)
- [Middlewares](#middlewares)

---

## 🔐 Autenticación

**Base URL:** `/api/auth`

### POST /register
Registrar nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "Operator" // opcional: Admin, Producer, Operator
}
```

**Response 201:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Operator"
  }
}
```

### POST /login
Iniciar sesión.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "message": "Login exitoso",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

### POST /logout
Cerrar sesión (requiere token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Logout exitoso"
}
```

### POST /refresh
Renovar access token.

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "message": "Token renovado exitosamente",
  "accessToken": "eyJhbGc..."
}
```

### GET /me
Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Operator"
  }
}
```

---

## 📝 Scripts

**Base URL:** `/api/scripts`  
**Requiere:** Token de autenticación

### GET /
Listar scripts del usuario.

**Query Params:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20, max: 100)
- `search` (opcional): Búsqueda por título o contenido
- `status` (opcional): `active` o `archived`

**Response 200:**
```json
{
  "scripts": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### POST /
Crear nuevo script.

**Body:**
```json
{
  "title": "Noticias Matutinas",
  "content": "Texto del guion...",
  "metadata": {
    "category": "Noticias",
    "tags": ["matutino", "política"]
  }
}
```

**Response 201:**
```json
{
  "message": "Script creado exitosamente",
  "script": { ... }
}
```

### GET /:id
Obtener script por ID.

**Response 200:**
```json
{
  "script": {
    "_id": "...",
    "title": "...",
    "content": "...",
    "metadata": { ... },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### PUT /:id
Actualizar script.

**Body (parcial permitido):**
```json
{
  "title": "Nuevo título",
  "content": "Nuevo contenido"
}
```

**Response 200:**
```json
{
  "message": "Script actualizado exitosamente",
  "script": { ... }
}
```

### DELETE /:id
Eliminar script (soft delete).

**Response 200:**
```json
{
  "message": "Script eliminado exitosamente",
  "scriptId": "..."
}
```

### POST /:id/duplicate
Duplicar script.

**Response 201:**
```json
{
  "message": "Script duplicado exitosamente",
  "script": { ... }
}
```

### GET /search/fulltext
Búsqueda full-text.

**Query Params:**
- `q`: Texto a buscar (mínimo 2 caracteres)

**Response 200:**
```json
{
  "results": [ ... ],
  "count": 10
}
```

---

## 📋 RunOrders

**Base URL:** `/api/runorders`  
**Requiere:** Token de autenticación

### GET /
Listar runorders del usuario.

**Query Params:**
- `page` (opcional): Número de página
- `limit` (opcional): Items por página
- `isActive` (opcional): `true` o `false`

**Response 200:**
```json
{
  "runorders": [ ... ],
  "pagination": { ... }
}
```

### POST /
Crear nuevo runorder.

**Body:**
```json
{
  "title": "Programa Matutino - Lunes 15",
  "description": "RunOrder para programa del lunes",
  "isActive": true
}
```

**Response 201:**
```json
{
  "message": "RunOrder creado exitosamente",
  "runorder": { ... }
}
```

### GET /:id
Obtener runorder con items.

**Response 200:**
```json
{
  "runorder": {
    "_id": "...",
    "title": "...",
    "runOrderItems": [
      {
        "scriptId": { ... },
        "position": 0,
        "duration": 120
      }
    ],
    "totalDuration": 1200,
    "isActive": true
  }
}
```

### PUT /:id
Actualizar runorder.

**Body:**
```json
{
  "title": "Nuevo título",
  "isActive": true
}
```

### DELETE /:id
Eliminar runorder.

### POST /:id/items
Agregar script al runorder.

**Body:**
```json
{
  "scriptId": "6507...",
  "position": 0,
  "duration": 180
}
```

**Response 201:**
```json
{
  "message": "Script agregado al RunOrder",
  "runorder": { ... }
}
```

### PUT /:id/items/:itemId
Actualizar item (posición o duración).

**Body:**
```json
{
  "position": 2,
  "duration": 200
}
```

### DELETE /:id/items/:itemId
Eliminar item del runorder.

### PUT /:id/activate
Activar runorder (desactiva los demás).

**Response 200:**
```json
{
  "message": "RunOrder activado exitosamente",
  "runorder": { ... }
}
```

---

## ⚙️ Configuración

**Base URL:** `/api/config`  
**Requiere:** Token de autenticación

### GET /
Obtener configuración del usuario (crea una por defecto si no existe).

**Response 200:**
```json
{
  "config": {
    "fontSize": 48,
    "fontFamily": "Arial",
    "textColor": "#FFFFFF",
    "backgroundColor": "#000000",
    "scrollSpeed": 50,
    "guidelinePosition": 50,
    "guidelineColor": "#FF0000",
    "guidelineThickness": 2,
    "showGuideline": true,
    "mirrorMode": false,
    "autoSave": true,
    "theme": "dark"
  }
}
```

### PUT /
Actualizar configuración (actualizaciones parciales permitidas).

**Body:**
```json
{
  "fontSize": 60,
  "scrollSpeed": 75,
  "guidelineColor": "#00FF00"
}
```

**Response 200:**
```json
{
  "message": "Configuración actualizada exitosamente",
  "config": { ... }
}
```

### POST /reset
Resetear configuración a valores por defecto.

**Response 200:**
```json
{
  "message": "Configuración reseteada a valores por defecto",
  "config": { ... }
}
```

### PATCH /theme
Cambiar solo el tema (light/dark).

**Body:**
```json
{
  "theme": "light"
}
```

**Response 200:**
```json
{
  "message": "Tema cambiado a light",
  "config": { ... }
}
```

---

## ⌨️ Macros

**Base URL:** `/api/macros`  
**Requiere:** Token de autenticación

### GET /
Listar todos los macros del usuario.

**Response 200:**
```json
{
  "macros": [
    {
      "_id": "...",
      "key": "F11",
      "action": "toggleFullscreen",
      "category": "System",
      "description": "Activar/desactivar pantalla completa",
      "isEnabled": true
    }
  ],
  "count": 8
}
```

### POST /
Crear nuevo macro.

**Body:**
```json
{
  "key": "Ctrl+P",
  "action": "togglePlay",
  "category": "Playback",
  "description": "Play/Pause personalizado",
  "isEnabled": true
}
```

**Response 201:**
```json
{
  "message": "Macro creado exitosamente",
  "macro": { ... }
}
```

### PUT /:id
Actualizar macro.

**Body:**
```json
{
  "key": "F12",
  "action": "toggleFullscreen"
}
```

**Response 200:**
```json
{
  "message": "Macro actualizado exitosamente",
  "macro": { ... }
}
```

### DELETE /:id
Eliminar macro.

**Response 200:**
```json
{
  "message": "Macro eliminado exitosamente",
  "macroId": "..."
}
```

### POST /defaults
Restaurar macros por defecto (8 macros predefinidos).

**Response 200:**
```json
{
  "message": "8 macros por defecto restaurados",
  "macros": [ ... ]
}
```

**Macros por defecto:**
- `F11`: toggleFullscreen
- `F10`: togglePlay
- `Space`: togglePlay
- `ArrowUp`: increaseSpeed
- `ArrowDown`: decreaseSpeed
- `Home`: resetPosition
- `Escape`: exitFullscreen
- `Ctrl+S`: saveScript

### PATCH /:id/toggle
Habilitar/deshabilitar macro.

**Response 200:**
```json
{
  "message": "Macro habilitado",
  "macro": { ... }
}
```

---

## 🛡️ Middlewares

### Auth Middleware

**Archivo:** `middleware/auth.middleware.js`

- **authenticateToken**: Verifica JWT token y agrega `req.user`
- **requireRole(roles)**: Verifica que el usuario tenga uno de los roles especificados
- **requireAdmin**: Requiere rol `Admin`
- **requireProducerOrAdmin**: Requiere rol `Admin` o `Producer`

**Uso:**
```javascript
router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
  // Solo usuarios Admin pueden acceder
});
```

### Error Middleware

**Archivo:** `middleware/error.middleware.js`

- **errorHandler**: Manejo global de errores
- **notFoundHandler**: Manejo de rutas 404
- **asyncHandler**: Wrapper para funciones async

**Códigos de error:**
- `VALIDATION_ERROR`: Error de validación (400)
- `INVALID_ID`: ID de MongoDB inválido (400)
- `DUPLICATE_KEY`: Clave duplicada (409)
- `INVALID_TOKEN`: Token JWT inválido (401)
- `TOKEN_EXPIRED`: Token JWT expirado (401)
- `INTERNAL_SERVER_ERROR`: Error interno (500)

### Rate Limit Middleware

**Archivo:** `middleware/rateLimit.middleware.js`

- **apiLimiter**: 100 requests / 15 min (general)
- **authLimiter**: 5 requests / 15 min (auth endpoints)
- **createLimiter**: 20 creaciones / hora (POST endpoints)

**Aplicación:**
```javascript
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

### Validation Middleware

**Archivo:** `middleware/validation.middleware.js`

- **validate**: Procesa resultados de `express-validator`

---

## 🔗 Health Check

### GET /health

**Response 200:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "development"
}
```

---

## 📚 Códigos de Error Comunes

| Código | HTTP | Descripción |
|--------|------|-------------|
| `NO_TOKEN` | 401 | Token no proporcionado |
| `TOKEN_EXPIRED` | 401 | Token expirado |
| `INVALID_TOKEN` | 401 | Token inválido |
| `INVALID_SESSION` | 401 | Sesión inválida |
| `SESSION_EXPIRED` | 401 | Sesión expirada |
| `EMAIL_EXISTS` | 409 | Email ya registrado |
| `KEY_EXISTS` | 409 | Macro key duplicado |
| `INSUFFICIENT_PERMISSIONS` | 403 | Permisos insuficientes |
| `VALIDATION_ERROR` | 400 | Error de validación |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `TOO_MANY_REQUESTS` | 429 | Rate limit excedido |

---

## 🚀 Instalación de Dependencias

```bash
cd backend
npm install
```

**Nuevas dependencias agregadas:**
- `express-rate-limit@^7.1.5` - Rate limiting
- `helmet@^7.1.0` - Security headers

---

## 🔧 Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/teleprompter

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# WebSocket
WS_PORT=3001
```

---

## 📝 Notas Importantes

1. **Autenticación**: Todas las rutas excepto `/api/auth/*` y `/health` requieren token JWT
2. **Rate Limiting**: Límites diferentes para auth (5/15min) vs general (100/15min)
3. **Validación**: Todos los endpoints tienen validación de input con `express-validator`
4. **Audit Log**: Todas las operaciones CRUD se registran en `AuditLog` collection
5. **Soft Delete**: Scripts usan soft delete (`deletedAt` field)
6. **Auto-Population**: Configuración se crea automáticamente en primer GET

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test

# Watch mode
npm run test:watch
```

---

## 📖 API Info Endpoint

### GET /api

Retorna información general de la API:

```json
{
  "name": "Teleprompter API",
  "version": "1.0.0",
  "description": "API para Sistema de Teleprompter Profesional",
  "endpoints": {
    "auth": "/api/auth",
    "scripts": "/api/scripts",
    "runorders": "/api/runorders",
    "config": "/api/config",
    "macros": "/api/macros"
  },
  "documentation": "/api/docs"
}
```

---

**Última actualización:** 2024-01-15  
**Versión API:** 1.0.0
