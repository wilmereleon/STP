# 📜 Sistema de Teleprompter Profesional

Sistema de teleprompter estilo **Winplus**, diseñado para entornos de producción de televisión y broadcasting.

## 🏗️ Arquitectura del Sistema

### Arquitectura Multi-Contenedor (Docker)

El sistema utiliza una arquitectura de microservicios con **4 contenedores Docker**:

<img width="580" height="632" alt="image" src="https://github.com/user-attachments/assets/39666507-be55-49db-bba9-06c9600e106d" />


**Componentes principales:**
- **Frontend** (React + Vite) – Puertos 5173/4173  
- **Backend** (Node.js + Express + Socket.IO) – Puertos 3000/3001  
- **MongoDB** (Base de datos) – Puerto 27017  
- **Jenkins** (CI/CD) – Puerto 8080  

### Flujo de Comunicación en Tiempo Real

<img width="1029" height="228" alt="image" src="https://github.com/user-attachments/assets/13c87171-876f-48d8-963f-e8a1714e8c56" />


El sistema implementa sincronización en tiempo real mediante **WebSocket**:
- **Productor** → Crea/edita scripts  
- **Backend** → Procesa y almacena en MongoDB  
- **Operador** → Recibe actualizaciones instantáneas  
- **Latencia estimada**: < 50 ms en red local  

### Topología de Red Docker

<img width="415" height="505" alt="image" src="https://github.com/user-attachments/assets/d5eff105-eb0f-44fb-a532-7fa9b54bc573" />



**Red bridge: `teleprompter-network`**
- Aislamiento de contenedores  
- Resolución DNS automática  
- Port mapping a localhost  
- Volúmenes persistentes  

📚 **Documentación completa:** ver [docs/README.md](docs/README.md) para detalles técnicos.

---

## 🚀 Instalación y Ejecución

### Opción 1: Docker (Recomendado para Producción)

```bash
# Clonar repositorio
git clone https://github.com/wilmereleon/STP.git
cd STP/Sistema\ de\ Teleprompter

# Iniciar todos los servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

**Acceso a servicios:**
- 🎨 Frontend → http://localhost:5173  
- 🔧 Backend API → http://localhost:3000  
- 🗄️ MongoDB → mongodb://localhost:27017  
- 🔨 Jenkins → http://localhost:8080/jenkins  

**Credenciales por defecto:**
- MongoDB: `admin` / `admin123`  
- Jenkins: ver `GUIA-VALIDACION-JENKINS.md`  

### Opción 2: Modo Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se ejecutará en `http://localhost:5173/`.

### Opción 3: Modo Producción (Electron)

```bash
# Construir instalador para Windows
npm run electron:build:win
```

El instalador se generará en la carpeta `release/`.

---

## 🧪 Pruebas de Calidad

### Formulario Interactivo de Pruebas

Incluye un **formulario HTML interactivo** que permite:  
- ✅ Registrar resultados de 68 casos de prueba organizados por categorías  
- 📝 Agregar observaciones detalladas  
- 💾 Guardar progreso automáticamente en el navegador  
- 📊 Ver estadísticas en tiempo real (aprobadas/fallidas/pendientes)  
- 📄 Exportar reportes completos en HTML  
- 📚 Mantener historial de sesiones  
- 🖨️ Imprimir reportes para documentación física  

#### Uso del formulario:
1. Abrir `test-form.html` en cualquier navegador  
2. Completar información de la sesión (nombre, fecha, versión, navegador)  
3. Marcar cada caso como:  
   - ✅ **Pass** – Prueba exitosa  
   - ❌ **Fail** – Prueba fallida  
   - ➖ **N/A** – No aplica  
4. Agregar observaciones según sea necesario  
5. Guardar progreso con "💾 Guardar Progreso"  
6. Exportar resultados con "📄 Exportar Resultados"  

**Características avanzadas:**
- Auto-guardado cada 30 segundos  
- Persistencia local (sin servidor)  
- Barra de progreso visual  
- Historial de sesiones anteriores  
- Modo impresión optimizado  

📚 Consulta `PRUEBAS_FUNCIONALES.md` para la lista completa de casos de prueba.

---

## 📋 Características Principales

- Interfaz profesional optimizada para producción  
- Ventana flotante para segundo monitor  
- Modo pantalla completa compatible con navegadores modernos  
- Control preciso de velocidad de desplazamiento  
- Tamaño de fuente variable (12px – 500px)  
- Gestión de múltiples scripts con drag & drop  
- Atajos de teclado personalizables  
- Auto-avance entre scripts  
- Línea guía de lectura ajustable  
- Control con rueda del ratón y modificadores  
- Persistencia de datos en localStorage  

---

## 🎯 Casos de Uso

- Estudios de televisión profesionales  
- Noticieros y programas en vivo  
- Presentaciones corporativas  
- Streaming y podcasts  
- Producción de video profesional  
- Eventos en vivo  

---

## 🛠️ Stack Tecnológico

### Frontend
- React 18.3.1  
- TypeScript 5.x  
- Vite 6.3.5  
- Electron 38.2.0  
- Tailwind CSS 3.x  
- shadcn/ui + Radix UI  
- Socket.IO Client 4.x  
- Axios  

### Backend
- Node.js 18  
- Express 4.21.2  
- Socket.IO 4.8.1  
- Mongoose 8.8.4  
- JWT (jsonwebtoken + bcryptjs)  
- Multer  
- Morgan  

### Base de Datos
- MongoDB 7.0  
- 8 colecciones optimizadas  
- Índices para búsquedas rápidas  
- Transacciones ACID  

### DevOps
- Docker & Docker Compose  
- Jenkins LTS  
- Git  

---

## 📖 Documentación

La documentación completa está en la carpeta `docs/`.  
Incluye guías de usuario, pruebas, instalación, arquitectura, desarrollo y recursos adicionales.  

---

## 🔧 Configuración Avanzada

### Docker

Ejemplo de `docker-compose.yml`:

```yaml
services:
  frontend:   # React + Vite (puerto 5173)
  backend:    # Express + Socket.IO (puertos 3000-3001)
  mongo:      # MongoDB 7.0 (puerto 27017)
  jenkins:    # Jenkins LTS (puerto 8080)
```

**Comandos útiles:**
```bash
docker-compose logs -f       # Ver logs en tiempo real
docker-compose restart       # Reiniciar servicios
docker-compose ps            # Ver estado de contenedores
docker exec -it teleprompter-mongo mongosh   # Acceder a MongoDB CLI
docker exec teleprompter-mongo mongodump --out /backup   # Backup de BD
```

### Electron
Configuración principal en `electron/main.js`.

### Build
- `vite.config.ts` – Configuración de Vite  
- `tsconfig.json` – Configuración de TypeScript  
- `package.json` – Scripts y dependencias  

---

## 📝 Proyecto Original

Basado en el diseño disponible en:  
[Teleprompter estilo Winplus – Figma](https://www.figma.com/design/gHWcL5pOEAzOQXOdRes302/Teleprompter-estilo-Winplus)

---

## 🤝 Contribuir

Para reportar bugs o sugerir mejoras, utiliza el formulario de pruebas (`test-form.html`) y exporta el reporte.

---

## 📄 Licencia

Ver archivo `LICENSE` para más detalles.

---

