# 📜 Sistema de Teleprompter Profesional

Sistema de teleprompter estilo Winplus diseñado para entornos de producción de televisión y broadcasting.

## 🏗️ Arquitectura del Sistema

### Arquitectura Multi-Contenedor (Docker)

El sistema utiliza una arquitectura de microservicios con 4 contenedores Docker:

![Arquitectura de Contenedores](docs/Arquitectura%20de%20Contenedores%20-%20Sistema%20de%20Teleprompter.png)

**Componentes principales:**
- **Frontend** (React + Vite) - Puerto 5173/4173
- **Backend** (Node.js + Express + Socket.IO) - Puertos 3000/3001
- **MongoDB** (Base de datos) - Puerto 27017
- **Jenkins** (CI/CD) - Puerto 8080

### Flujo de Comunicación en Tiempo Real

![Flujo de Comunicación](docs/Flujo%20de%20Comunicación%20-%20Escenario%20Completo.png)

El sistema implementa sincronización en tiempo real mediante WebSocket:
- **Productor** → Crea/edita scripts
- **Backend** → Procesa y almacena en MongoDB
- **Operador** → Recibe actualizaciones instantáneas
- **Latencia** < 50ms en red local

### Topología de Red Docker

![Topología de Red](docs/Diagrama%20de%20Red%20-%20Docker%20Compose.png)

**Red bridge: `teleprompter-network`**
- Aislamiento de contenedores
- Resolución DNS automática
- Port mapping a localhost
- Volúmenes persistentes

📚 **Documentación completa:** Ver [docs/README.md](docs/README.md) para detalles técnicos de la arquitectura.

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
- 🎨 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:3000
- 🗄️ MongoDB: mongodb://localhost:27017
- 🔨 Jenkins: http://localhost:8080/jenkins

**Credenciales por defecto:**
- MongoDB: `admin` / `admin123`
- Jenkins: Ver `GUIA-VALIDACION-JENKINS.md`

### Opción 2: Modo Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se ejecutará en `http://localhost:5173/`

### Opción 3: Modo Producción (Electron)

```bash
# Construir instalador para Windows
npm run electron:build:win
```

El instalador se generará en la carpeta `release/`.

## 🧪 Pruebas de Calidad

### Formulario Interactivo de Pruebas

Para facilitar las pruebas y control de calidad, incluimos un **formulario HTML interactivo** que permite:

- ✅ Registrar resultados de 68 casos de prueba organizados por categorías
- 📝 Agregar observaciones detalladas para cada prueba
- 💾 Guardar progreso automáticamente en el navegador
- 📊 Ver estadísticas en tiempo real (aprobadas/fallidas/pendientes)
- 📄 Exportar reportes completos en formato HTML
- 📚 Mantener historial de sesiones de prueba
- 🖨️ Imprimir reportes para documentación física

#### Cómo usar el formulario de pruebas:

1. Abrir el archivo `test-form.html` en cualquier navegador web
2. Completar la información de la sesión (nombre, fecha, versión, navegador)
3. Expandir las categorías de prueba y marcar cada caso como:
   - ✅ **Pass** - Prueba exitosa
   - ❌ **Fail** - Prueba fallida
   - ➖ **N/A** - No aplica
4. Agregar observaciones en los campos de texto según sea necesario
5. Guardar progreso periódicamente con el botón "💾 Guardar Progreso"
6. Al finalizar, exportar el reporte con "📄 Exportar Resultados"

**Características avanzadas:**
- Auto-guardado cada 30 segundos
- Persistencia local (no requiere servidor)
- Barra de progreso visual
- Historial de sesiones anteriores
- Modo impresión optimizado

### Documentación de Pruebas

Consulta `PRUEBAS_FUNCIONALES.md` para ver la lista completa de casos de prueba organizados por categorías.

## 📋 Características Principales

- **Interfaz Profesional**: Diseño optimizado para entornos de producción
- **Ventana Flotante**: Teleprompter en ventana independiente para segundo monitor
- **Modo Pantalla Completa**: Compatible con todos los navegadores modernos
- **Control de Velocidad**: Ajuste preciso de velocidad de desplazamiento
- **Tamaño de Fuente Variable**: Desde 12px hasta 500px
- **Run Order**: Gestión de múltiples scripts con drag & drop
- **Atajos de Teclado**: Macros personalizables para control rápido
- **Auto-avance**: Cambio automático entre scripts
- **Línea Guía de Lectura**: Referencia visual ajustable
- **Control con Rueda del Ratón**: Navegación intuitiva con modificadores
- **Persistencia de Datos**: Guardado automático en localStorage

## 🎯 Casos de Uso

- Estudios de televisión profesionales
- Noticieros y programas en vivo
- Presentaciones corporativas
- Streaming y podcasts
- Producción de video profesional
- Eventos en vivo

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3.1** - Framework de UI
- **TypeScript 5.x** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server
- **Electron 38.2.0** - Empaquetado desktop
- **Tailwind CSS 3.x** - Estilos utilitarios
- **shadcn/ui + Radix UI** - Componentes de UI
- **Socket.IO Client 4.x** - WebSocket en tiempo real
- **Axios** - Cliente HTTP

### Backend
- **Node.js 18** - Runtime
- **Express 4.21.2** - Framework web
- **Socket.IO 4.8.1** - WebSocket server
- **Mongoose 8.8.4** - ODM para MongoDB
- **JWT** - Autenticación (jsonwebtoken + bcryptjs)
- **Multer** - Gestión de archivos
- **Morgan** - Logging de requests

### Base de Datos
- **MongoDB 7.0** - Base de datos NoSQL
- 8 Collections optimizadas
- Índices para búsquedas rápidas
- Transacciones ACID

### DevOps
- **Docker & Docker Compose** - Contenedorización
- **Jenkins LTS** - CI/CD automático
- **Git** - Control de versiones

## 📖 Documentación

La documentación completa está organizada en la carpeta `docs/`:

### 📁 Guías de Usuario
- **[Inicio Rápido](docs/guias/INICIO_RAPIDO_FORMULARIO.md)** - Cómo empezar a usar el sistema
- **[Plantilla Excel](docs/guias/PLANTILLA_EXCEL.md)** - Formato para importar scripts
- **[Layout WinPlus](docs/guias/LAYOUT_WINPLUS.md)** - Diseño y distribución de la interfaz
- **[Resumen Ejecutivo](docs/guias/RESUMEN_EJECUTIVO.md)** - Visión general del proyecto

### 🧪 Pruebas y Testing
- **[Pruebas Funcionales](docs/pruebas/PRUEBAS_FUNCIONALES.md)** - Casos de prueba detallados (68 pruebas)
- **[Testing Checklist](docs/pruebas/TESTING_CHECKLIST.md)** - Lista de verificación de pruebas
- **[Instrucciones de Pruebas](docs/pruebas/INSTRUCCIONES_FORMULARIO_PRUEBAS.md)** - Guía del formulario de pruebas
- **[Formulario Interactivo](test-form.html)** - Herramienta de testing visual

### 🔧 Instalación y Deploy
- **[Instalador](docs/instalacion/INSTALADOR.md)** - Guía de generación del instalador
- **[Electron Setup](docs/instalacion/ELECTRON_SETUP.md)** - Configuración de Electron
- **[Checklist Instalador](docs/instalacion/CHECKLIST_INSTALADOR.md)** - Verificación pre-release
- **[Docker README](README-DOCKER.md)** - Guía completa de Docker
- **[Guía Jenkins](GUIA-VALIDACION-JENKINS.md)** - Configuración CI/CD
- **[Solución 404 Jenkins](SOLUCION-ERROR-404-JENKINS.md)** - Troubleshooting

### 🏗️ Arquitectura
- **[Diagramas PlantUML](docs/)** - Arquitectura visual del sistema
  - `arquitectura-contenedores.puml` - Vista de componentes
  - `flujo-comunicacion-completo.puml` - Secuencias de interacción
  - `topologia-red-docker.puml` - Red Docker
- **[README Arquitectura](docs/README.md)** - Documentación técnica completa

### 💻 Desarrollo
- **[Plan de Refactorización](docs/desarrollo/PLAN_REFACTORIZACION.md)** - Arquitectura y mejoras
- **[Guía de Migración V2](docs/desarrollo/GUIA_MIGRACION_V2.md)** - Migración a Store Architecture
- **[Fase 1 Completada](docs/desarrollo/FASE1_COMPLETADA.md)** - Store Layer implementado
- **[Fase 1 Progreso](docs/desarrollo/FASE1_PROGRESO.md)** - Historial Fase 1
- **[Fase 2 Resumen](docs/desarrollo/FASE2_RESUMEN_COMPLETADO.md)** - Service Layer completado
- **[Fase 2 Progreso](docs/desarrollo/FASE2_PROGRESO.md)** - Historial Fase 2

### 📚 Otros Recursos
- **[Attributions](src/Attributions.md)** - Créditos y licencias
- **[Guidelines](src/guidelines/Guidelines.md)** - Guías de desarrollo

## 🔧 Configuración Avanzada

### Docker

El sistema incluye configuración Docker completa:

```yaml
# docker-compose.yml
services:
  frontend:   # React + Vite (puerto 5173)
  backend:    # Express + Socket.IO (puertos 3000-3001)
  mongo:      # MongoDB 7.0 (puerto 27017)
  jenkins:    # Jenkins LTS (puerto 8080)
```

**Comandos útiles:**
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Ver estado de contenedores
docker-compose ps

# Acceder a MongoDB CLI
docker exec -it teleprompter-mongo mongosh

# Backup de base de datos
docker exec teleprompter-mongo mongodump --out /backup
```

### Electron

El archivo `electron/main.js` contiene la configuración de la ventana principal de Electron.

### Build

- `vite.config.ts` - Configuración de Vite
- `tsconfig.json` - Configuración de TypeScript
- `package.json` - Scripts y dependencias

## 📝 Proyecto Original

Este proyecto está basado en el diseño disponible en:
https://www.figma.com/design/gHWcL5pOEAzOQXOdRes302/Teleprompter-estilo-Winplus

## 🤝 Contribuir

Para reportar bugs o sugerir mejoras, utiliza el formulario de pruebas (`test-form.html`) para documentar los problemas encontrados y exporta el reporte.

## 📄 Licencia

Ver archivo LICENSE para más detalles.
  