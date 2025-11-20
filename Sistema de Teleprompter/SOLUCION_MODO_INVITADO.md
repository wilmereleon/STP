# Solución: Modo Invitado (Guest Mode) para Vista del Productor

## 📋 Resumen del Problema

La vista del Productor no mostraba los scripts disponibles en la base de datos y los botones no funcionaban. El problema raíz era que **todas las rutas del API backend requerían autenticación JWT**, bloqueando el acceso a usuarios invitados (sin sesión iniciada).

### Síntomas Observados:
- ✅ Usuario podía acceder a `/producer` visualmente
- ❌ Mensaje "No se encontraron scripts" a pesar de existir 1 script en MongoDB
- ❌ Botones "Nuevo Script", "Importar", etc. no funcionaban
- ❌ API devolvía `401 Unauthorized` con error `{"error":"Token no proporcionado","code":"NO_TOKEN"}`

## 🔧 Solución Implementada

Se implementó un **sistema de autenticación opcional** que permite a usuarios invitados acceder en modo de solo lectura mientras protege las operaciones de escritura.

### Arquitectura de la Solución:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  - LoginView: Botones "Continuar como Productor/Operador"  │
│  - ProducerView: Manejo de errores GUEST_NOT_ALLOWED       │
│  - AppWithRouter: Rutas públicas (sin ProtectedRoute)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP/WebSocket (sin token)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE (auth.middleware.js)            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ optionalAuth (GET requests)                           │ │
│  │  - Token presente → Validar JWT + Session             │ │
│  │  - Token ausente → req.user = null (modo invitado)    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ requireAuth (POST/PUT/DELETE)                         │ │
│  │  - Bloquea invitados con 403 GUEST_NOT_ALLOWED        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  RUTAS DEL API (Backend)                    │
│                                                             │
│  GET  /api/scripts     ← optionalAuth (lectura pública)    │
│  POST /api/scripts     ← requireAuth  (solo autenticados)  │
│  GET  /api/config      ← optionalAuth (config por defecto) │
│  GET  /api/macros      ← optionalAuth (macros globales)    │
│  GET  /api/runorders   ← optionalAuth (runorders públicos) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB (Base de Datos)                  │
│  - Scripts: 1 documento (Script de Ejemplo - Noticias)     │
│  - Macros: 6 documentos (F11, F10, PageUp, etc.)           │
│  - Configurations: 1 documento (Dark theme, 32px, 50 WPM)  │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Archivos Modificados

### 1. **Backend - Middleware de Autenticación**
**Archivo:** `backend/src/middleware/auth.middleware.js`

#### Nuevo middleware `optionalAuth`:
```javascript
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.replace('Bearer ', '');
    
    // Si no hay token, continuar como invitado
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Si hay token, validarlo usando el middleware estándar
    return authenticateToken(req, res, next);
    
  } catch (error) {
    console.error('Error en optionalAuth:', error);
    res.status(500).json({ error: 'Error en autenticación opcional' });
  }
};
```

**Cambios:**
- ✅ Añadido middleware `optionalAuth` para permitir acceso sin token
- ✅ Exportado en `module.exports` junto a `authenticateToken`
- ✅ Permite `req.user = null` para indicar modo invitado

---

### 2. **Backend - Configuración de Rutas**
**Archivo:** `backend/src/routes/index.js`

```javascript
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Rutas con autenticación opcional (permite modo invitado)
app.use('/api/scripts', optionalAuth, scriptRoutes);
app.use('/api/runorders', optionalAuth, runorderRoutes);
app.use('/api/config', optionalAuth, configRoutes);
app.use('/api/macros', optionalAuth, macroRoutes);
```

**Cambios:**
- ✅ Cambiado de `authenticateToken` → `optionalAuth` en todas las rutas principales
- ✅ Ahora invitados pueden hacer `GET` requests sin error 401

---

### 3. **Backend - Rutas de Scripts**
**Archivo:** `backend/src/routes/script.routes.js`

#### Nuevo middleware local `requireAuth`:
```javascript
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ 
      error: 'Esta acción requiere iniciar sesión',
      code: 'GUEST_NOT_ALLOWED',
      message: 'Los usuarios invitados solo tienen acceso de lectura. Por favor inicia sesión para crear o modificar contenido.'
    });
  }
  next();
};
```

#### Rutas GET modificadas (lectura pública):
```javascript
// GET /api/scripts - Listar scripts
const query = userId 
  ? { userId, deletedAt: null }  // Usuario autenticado: sus scripts
  : { deletedAt: null };          // Invitado: todos los scripts públicos

// GET /api/scripts/:id - Obtener script por ID
const query = userId 
  ? { _id: scriptId, userId, deletedAt: null }
  : { _id: scriptId, deletedAt: null };
```

#### Rutas POST/PUT/DELETE protegidas:
```javascript
router.post('/', requireAuth, [...validations], async (req, res) => { ... });
router.put('/:id', requireAuth, [...validations], async (req, res) => { ... });
router.delete('/:id', requireAuth, [...validations], async (req, res) => { ... });
router.post('/:id/duplicate', requireAuth, [...validations], async (req, res) => { ... });
```

**Cambios:**
- ✅ GET requests: Permiten acceso sin `userId` (público)
- ✅ POST/PUT/DELETE: Requieren autenticación con middleware `requireAuth`
- ✅ Retorna código `GUEST_NOT_ALLOWED` (403) para operaciones bloqueadas

---

### 4. **Backend - Rutas de Configuración**
**Archivo:** `backend/src/routes/config.routes.js`

```javascript
router.get('/', async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  
  // Modo invitado: devolver configuración por defecto
  if (!userId) {
    const defaultConfig = {
      theme: 'dark',
      fontSize: 32,
      scrollSpeed: 50,
      textColor: '#FFFFFF',
      backgroundColor: '#000000',
      fontFamily: 'Arial',
      textAlign: 'center',
      lineHeight: 1.5,
      guidelineEnabled: true,
      guidelinePosition: 50,
      guidelineColor: '#FF0000',
      guidelineThickness: 2
    };
    return res.json({ config: defaultConfig });
  }
  
  // Usuario autenticado: buscar o crear configuración
  let config = await Configuration.findOne({ userId });
  ...
});
```

**Cambios:**
- ✅ Modo invitado: Devuelve configuración estática (no se guarda en DB)
- ✅ Usuario autenticado: Busca/crea configuración personalizada en MongoDB

---

### 5. **Backend - Rutas de Macros**
**Archivo:** `backend/src/routes/macro.routes.js`

```javascript
router.get('/', async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  
  const query = userId 
    ? { userId }           // Autenticado: sus macros
    : {};                  // Invitado: todos los macros públicos
  
  const macros = await Macro.find(query).sort({ category: 1, key: 1 });
  res.json({ macros, count: macros.length });
});
```

**Cambios:**
- ✅ Invitados ven todos los macros globales (F11, F10, PageUp, etc.)
- ✅ Usuarios autenticados ven solo sus macros personalizados

---

### 6. **Backend - Rutas de RunOrders**
**Archivo:** `backend/src/routes/runorder.routes.js`

```javascript
router.get('/', async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  const query = userId ? { userId } : {};
  
  const [runorders, total] = await Promise.all([
    RunOrder.find(query)
      .populate('runOrderItems.scriptId', 'title metadata')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    RunOrder.countDocuments(query)
  ]);
  ...
});
```

**Cambios:**
- ✅ Invitados ven todos los runorders públicos
- ✅ Usuarios autenticados ven solo sus runorders

---

### 7. **Frontend - Vista del Productor**
**Archivo:** `src/views/ProducerView.tsx`

```typescript
// Crear script (protegido)
const handleCreateScript = async () => {
  try {
    const newScript = await apiClient.createScript({ ... });
    ...
  } catch (error: any) {
    if (error.response?.data?.code === 'GUEST_NOT_ALLOWED') {
      toast({
        title: 'Inicia sesión requerido',
        description: error.response.data.message || 'Los usuarios invitados solo tienen acceso de lectura.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo crear el script',
        variant: 'destructive'
      });
    }
  }
};

// Actualizar script (protegido)
const handleUpdateScript = async (scriptId: string, updates: Partial<Script>) => {
  try {
    const updated = await apiClient.updateScript(scriptId, updates);
    ...
  } catch (error: any) {
    if (error.response?.data?.code === 'GUEST_NOT_ALLOWED') {
      toast({
        title: 'Inicio de sesión requerido',
        description: error.response.data.message || 'Los usuarios invitados solo tienen acceso de lectura.',
        variant: 'destructive'
      });
    } else { ... }
  }
};

// Eliminar script (protegido)
const handleDeleteScript = async (scriptId: string) => {
  try {
    await apiClient.deleteScript(scriptId);
    ...
  } catch (error: any) {
    if (error.response?.data?.code === 'GUEST_NOT_ALLOWED') {
      toast({
        title: 'Inicio de sesión requerido',
        description: error.response.data.message || 'Los usuarios invitados solo tienen acceso de lectura.',
        variant: 'destructive'
      });
    } else { ... }
  }
};
```

**Cambios:**
- ✅ Detección del código `GUEST_NOT_ALLOWED` en errores 403
- ✅ Mensajes de toast personalizados para usuarios invitados
- ✅ Tipado `error: any` para acceder a `error.response.data`

---

### 8. **Frontend - Vista de Login**
**Archivo:** `src/views/LoginView.tsx`

```typescript
<CardFooter className="flex flex-col gap-2 border-t pt-4">
  <Button
    variant="outline"
    onClick={() => {
      console.log('Navegando a /producer');
      navigate('/producer');
    }}
  >
    <FileText className="mr-2 h-4 w-4" />
    Continuar como Productor
  </Button>
  
  <Button
    variant="ghost"
    onClick={() => {
      console.log('Navegando a /operator');
      navigate('/operator');
    }}
  >
    Continuar como Operador
  </Button>
</CardFooter>
```

**Cambios:**
- ✅ Añadido botón "Continuar como Productor" (modo invitado)
- ✅ Botones fuera del `<form>` para evitar submit no deseado
- ✅ Console.log para debugging de navegación

---

### 9. **Frontend - Configuración de Rutas**
**Archivo:** `src/AppWithRouter.tsx`

```typescript
// ANTES (bloqueaba invitados)
<Route 
  path="/producer" 
  element={
    <ProtectedRoute>
      <ProducerView />
    </ProtectedRoute>
  } 
/>

// DESPUÉS (acceso libre)
<Route path="/producer" element={<ProducerView />} />
```

**Cambios:**
- ✅ Removido componente `<ProtectedRoute>` del path `/producer`
- ✅ Ahora la ruta es pública (acceso sin autenticación)

---

## ✅ Funcionalidad Verificada

### Modo Invitado (Guest):
```bash
# ✅ GET requests funcionan sin token
curl http://localhost:3000/api/scripts
→ 200 OK: {"scripts": [...], "pagination": {...}}

curl http://localhost:3000/api/config
→ 200 OK: {"config": {theme: "dark", fontSize: 32, ...}}

curl http://localhost:3000/api/macros
→ 200 OK: {"macros": [...], "count": 6}

# ✅ POST/PUT/DELETE bloqueados con mensaje apropiado
curl -X POST http://localhost:3000/api/scripts -d '{"title":"Test"}'
→ 403 Forbidden: {
  "error": "Esta acción requiere iniciar sesión",
  "code": "GUEST_NOT_ALLOWED",
  "message": "Los usuarios invitados solo tienen acceso de lectura. Por favor inicia sesión para crear o modificar contenido."
}
```

### Navegación Frontend:
- ✅ Usuario puede acceder a `http://localhost:5173/login`
- ✅ Click en "Continuar como Productor" → navega a `/producer`
- ✅ Vista del Productor carga y muestra "Script de Ejemplo - Noticias"
- ✅ Click en "Nuevo Script" → muestra toast: "Inicia sesión requerido"
- ✅ Botones de edición/eliminación también muestran mensaje de invitado

### Usuario Autenticado:
- ✅ Login con `admin@teleprompter.com` / `admin123` genera JWT token
- ✅ Token almacenado en `localStorage` y enviado en header `Authorization`
- ✅ GET requests muestran solo scripts del usuario autenticado
- ✅ POST/PUT/DELETE requests permitidos con validación de ownership

---

## 🔒 Seguridad

### Protecciones Implementadas:

1. **Autenticación Opcional en Lecturas:**
   - Invitados: `req.user = null` (acceso público)
   - Autenticados: `req.user = {userId, email, role}` (filtro por usuario)

2. **Autenticación Requerida en Escrituras:**
   - Middleware `requireAuth` bloquea invitados con 403
   - Código de error específico: `GUEST_NOT_ALLOWED`
   - Mensaje amigable al usuario

3. **Ownership Validation:**
   - Usuarios autenticados solo ven/editan sus propios recursos
   - Query filters: `{ userId, deletedAt: null }`
   - Soft delete: scripts marcados como eliminados (no borrado físico)

4. **Session Management:**
   - JWT tokens validados en cada request autenticado
   - Sessions activas verificadas en MongoDB
   - Expiración automática de tokens

---

## 📊 Estado de la Base de Datos

```javascript
// Verificado con ver-mongodb.ps1
Users: 1
  - admin@teleprompter.com (Admin) - password hash bcrypt

Scripts: 1
  - "Script de Ejemplo - Noticias" (Noticias, Aprobado, 45s)

Configurations: 1
  - Dark theme, 32px, 50 WPM, guideline visible

Macros: 6
  - F11: togglePlay
  - F10: reset
  - PageUp: previousScript
  - PageDown: nextScript
  - Ctrl+Plus: increaseFontSize
  - Ctrl+Minus: decreaseFontSize

RunOrders: 0
```

---

## 🚀 Próximos Pasos

### 1. **UX Mejorada para Invitados:**
- [ ] Banner en ProducerView: "Estás navegando como invitado (solo lectura)"
- [ ] Deshabilitar botones de escritura en lugar de mostrar error
- [ ] Agregar botón "Iniciar sesión" en el banner

### 2. **Permisos Granulares:**
- [ ] Implementar roles: `Admin`, `Producer`, `Operator`
- [ ] Operadores: Solo lectura + control de teleprompter
- [ ] Productores: CRUD en scripts propios
- [ ] Admins: Acceso completo a todos los recursos

### 3. **Audit Logs:**
- [ ] Registrar acciones de invitados (vistas, intentos de escritura)
- [ ] Dashboard de actividad por usuario
- [ ] Alertas de seguridad (intentos de acceso no autorizado)

### 4. **Testing:**
- [ ] Unit tests para `optionalAuth` y `requireAuth` middleware
- [ ] Integration tests para flujo invitado vs autenticado
- [ ] E2E tests con Playwright (login → crear script → logout → modo invitado)

### 5. **Documentación:**
- [ ] Actualizar README.md con sección "Modo Invitado"
- [ ] Crear diagrama de flujo de autenticación (PlantUML)
- [ ] Guía de usuario: "Cómo usar el sistema sin registrarse"

---

## 🐛 Troubleshooting

### Problema: "No se encontraron scripts" en vista Productor
**Solución:** Verificar que MongoDB tenga datos inicializados:
```powershell
.\ver-mongodb.ps1
# Debe mostrar: Scripts: 1
```

Si muestra 0 scripts:
```powershell
Get-Content database\mongodb\01-init.js | docker exec -i teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin
```

### Problema: Error 401 "Token no proporcionado"
**Solución:** Verificar que rutas usen `optionalAuth` en lugar de `authenticateToken`:
```bash
# Backend logs deberían mostrar:
GET /api/scripts - IP: ::ffff:172.19.0.1  ← Sin error de autenticación
```

### Problema: Frontend no muestra mensaje de invitado
**Solución:** Verificar que error tenga estructura correcta:
```javascript
// En catch del frontend
console.log('Error completo:', error.response?.data);
// Debe mostrar: {error: "...", code: "GUEST_NOT_ALLOWED", message: "..."}
```

---

## 📅 Historial de Cambios

**2025-10-23:** 
- ✅ Implementado modo invitado completo
- ✅ 9 archivos modificados (backend + frontend)
- ✅ Autenticación opcional funcionando
- ✅ Protección de escritura activa
- ✅ Mensajes de error amigables
- ✅ Database inicializada con datos de ejemplo

---

## 👨‍💻 Autor
- **Sistema:** Teleprompter Profesional v1.0
- **Stack:** React + TypeScript + Express + MongoDB + Docker
- **Modo:** Development (Docker Compose)
- **Fecha:** Octubre 2025
