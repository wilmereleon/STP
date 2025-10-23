# 🐳 Docker Deployment - Sistema de Teleprompter v2.0

Guía completa para desplegar el sistema usando Docker Compose.

---

## 📋 Requisitos Previos

### 1. **Docker Desktop**
- **Windows/Mac**: Descargar de [docker.com/get-started](https://www.docker.com/get-started)
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

### 2. **Docker Compose**
- Incluido en Docker Desktop
- Linux: 
  ```bash
  sudo apt-get install docker-compose-plugin
  ```

### 3. **Puertos Disponibles**
- **5173**: Frontend (Vite dev server)
- **3000**: Backend API REST
- **3001**: Backend WebSocket
- **27017**: MongoDB
- **8080**: Jenkins CI/CD (opcional)

---

## 🚀 Inicio Rápido (3 Pasos)

### 1. **Clonar/Ubicar el Proyecto**
```bash
cd "c:\xampp\htdocs\STP\Sistema de Teleprompter"
```

### 2. **Iniciar Servicios**
```bash
docker-compose up -d
```

### 3. **Acceder a las Interfaces**
- **Operator View**: http://localhost:5173
- **Producer View**: http://localhost:5173/producer
- **API REST**: http://localhost:3000/api
- **MongoDB**: mongodb://localhost:27017

---

## 📦 Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                     Port: 5173                              │
│                                                             │
│  /operator   →  Vista Operador (Teleprompter)             │
│  /producer   →  Vista Productor (Gestión Scripts)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP REST + WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               BACKEND (Node.js + Express)                   │
│                   Port: 3000, 3001                          │
│                                                             │
│  /api/*     →  REST API (Scripts, RunOrders, Config)      │
│  Socket.IO  →  WebSocket (Sync en tiempo real)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ MongoDB Driver
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   MONGODB (Base de Datos)                   │
│                     Port: 27017                             │
│                                                             │
│  Collections: users, scripts, runorders, configurations    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Comandos Útiles

### **Iniciar Servicios**
```bash
# Iniciar todos los contenedores
docker-compose up -d

# Iniciar solo algunos servicios
docker-compose up -d frontend backend
```

### **Ver Estado**
```bash
# Ver contenedores activos
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### **Detener Servicios**
```bash
# Detener todos los contenedores (mantiene volúmenes)
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar y limpiar volúmenes
docker-compose down -v
```

### **Reconstruir Imágenes**
```bash
# Reconstruir todas las imágenes
docker-compose build

# Reconstruir sin caché
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up -d --build
```

### **Acceder a Contenedores**
```bash
# Shell en contenedor backend
docker exec -it teleprompter-backend sh

# Shell en MongoDB
docker exec -it teleprompter-mongo mongosh

# Ver archivos en contenedor
docker exec teleprompter-backend ls -la /app
```

---

## 📂 Estructura de Volúmenes

### **Volúmenes Persistentes**
```
teleprompter-mongodb-data/    # Datos de MongoDB
teleprompter-backend-logs/    # Logs del backend
jenkins-data/                  # Configuración Jenkins (si se usa)
```

### **Ver Volúmenes**
```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect teleprompter-mongodb-data

# Limpiar volúmenes no usados
docker volume prune
```

---

## 🗄️ Gestión de Base de Datos

### **Inicialización**
```bash
# MongoDB se inicializa automáticamente con:
# - Usuario admin: admin / admin123
# - Base de datos: teleprompter
# - Script: database/mongodb/01-init.js
```

### **Acceder a MongoDB**
```bash
# Desde terminal local (si tienes mongosh instalado)
mongosh mongodb://admin:admin123@localhost:27017/teleprompter?authSource=admin

# Desde el contenedor
docker exec -it teleprompter-mongo mongosh -u admin -p admin123 --authenticationDatabase admin

# Ver colecciones
use teleprompter
show collections

# Ver documentos
db.users.find().pretty()
db.scripts.find().pretty()
```

### **Backup de MongoDB**
```bash
# Crear backup
docker exec teleprompter-mongo mongodump \
  -u admin -p admin123 --authenticationDatabase admin \
  -d teleprompter -o /tmp/backup

# Copiar backup al host
docker cp teleprompter-mongo:/tmp/backup ./mongodb-backup

# Restaurar backup
docker exec teleprompter-mongo mongorestore \
  -u admin -p admin123 --authenticationDatabase admin \
  -d teleprompter /tmp/backup/teleprompter
```

---

## 🔐 Seguridad y Configuración

### **Variables de Entorno**

Editar `.env.development` o `.env.production`:

```env
# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Backend
JWT_SECRET=CAMBIAR_EN_PRODUCCION
JWT_REFRESH_SECRET=CAMBIAR_EN_PRODUCCION
MONGODB_URI=mongodb://admin:PASSWORD@mongo:27017/teleprompter

# CORS
CORS_ORIGIN=http://localhost:5173,https://tu-dominio.com
```

### **Cambiar Contraseña de MongoDB**

1. Editar `docker-compose.yml`:
```yaml
environment:
  MONGO_INITDB_ROOT_PASSWORD: tu_nueva_contraseña_segura
```

2. Actualizar `MONGODB_URI` en backend con nueva contraseña

3. Recrear contenedores:
```bash
docker-compose down -v
docker-compose up -d
```

---

## 🐛 Troubleshooting

### **Puerto Ya en Uso**
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Mac/Linux

# Cambiar puerto en docker-compose.yml
ports:
  - "3010:3000"  # Mapear puerto 3010 externo a 3000 interno
```

### **Contenedor No Inicia**
```bash
# Ver logs detallados
docker-compose logs backend

# Ver eventos de Docker
docker events

# Reiniciar contenedor específico
docker-compose restart backend
```

### **MongoDB No Conecta**
```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Verificar health check
docker inspect teleprompter-mongodb --format='{{.State.Health.Status}}'
```

### **Frontend No Carga**
```bash
# Verificar que Vite está sirviendo
docker-compose logs frontend

# Reconstruir frontend
docker-compose build frontend
docker-compose up -d frontend

# Verificar que el build existe
docker exec teleprompter-frontend ls -la /usr/share/nginx/html
```

### **WebSocket No Conecta**
```bash
# Verificar CORS en backend
docker-compose logs backend | grep CORS

# Verificar que Socket.IO escucha
docker exec teleprompter-backend netstat -tuln | grep 3001

# Probar conexión desde navegador
# Abrir DevTools → Console:
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected!'));
```

---

## 🚀 Deployment en Producción

### **1. Build de Producción**
```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml build

# Iniciar en producción
docker-compose -f docker-compose.prod.yml up -d
```

### **2. HTTPS con Nginx + Let's Encrypt**
```bash
# Agregar certificados SSL
docker-compose exec frontend sh
certbot --nginx -d tu-dominio.com
```

### **3. Monitoreo**
```bash
# Ver uso de recursos
docker stats

# Ver métricas
docker-compose exec backend curl http://localhost:3000/metrics
```

---

## 📊 Health Checks

Todos los servicios tienen health checks integrados:

```bash
# Frontend
curl http://localhost:5173/health

# Backend
curl http://localhost:3000/health

# MongoDB
docker exec teleprompter-mongodb mongosh --eval "db.adminCommand('ping')"
```

---

## 🧪 Testing en Docker

```bash
# Ejecutar tests del backend
docker-compose exec backend npm test

# Ejecutar tests del frontend
docker-compose exec frontend npm test

# Coverage
docker-compose exec backend npm run test:coverage
```

---

## 📞 Soporte

**Problemas Comunes:**
- Docker no inicia → Verificar que Docker Desktop está corriendo
- Permiso denegado → Ejecutar terminal como Administrador (Windows)
- Out of disk space → Limpiar imágenes: `docker system prune -a`

**Documentación:**
- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- MongoDB Docker: https://hub.docker.com/_/mongo

---

## ✅ Checklist de Deployment

- [ ] Docker Desktop instalado y corriendo
- [ ] Puertos 5173, 3000, 3001, 27017 disponibles
- [ ] Variables de entorno configuradas
- [ ] `docker-compose up -d` ejecutado sin errores
- [ ] Frontend accesible en http://localhost:5173
- [ ] Backend responde en http://localhost:3000/health
- [ ] MongoDB conecta correctamente
- [ ] WebSocket conecta (ver DevTools Console)
- [ ] Login funciona (crear usuario test)
- [ ] Scripts se guardan en MongoDB

---

**¡Listo! El sistema está corriendo en Docker** 🎉

Para cualquier duda, revisar los logs:
```bash
docker-compose logs -f
```
