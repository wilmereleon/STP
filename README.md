# 📜 Sistema de Teleprompter Profesional

<<<<<<< HEAD
Sistema de teleprompter estilo Winplus diseñado para entornos de producción de televisión y broadcasting.
=======
Sistema de teleprompter estilo **Winplus**, diseñado para entornos de producción de televisión y broadcasting.
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025

## 🏗️ Arquitectura del Sistema

### Arquitectura Multi-Contenedor (Docker)

<<<<<<< HEAD
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

=======
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

>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025
# Verificar estado
docker-compose ps
```

**Acceso a servicios:**
<<<<<<< HEAD
- 🎨 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:3000
- 🗄️ MongoDB: mongodb://localhost:27017
- 🔨 Jenkins: http://localhost:8080/jenkins

**Credenciales por defecto:**
- MongoDB: `admin` / `admin123`
- Jenkins: Ver `GUIA-VALIDACION-JENKINS.md`
=======
- 🎨 Frontend → http://localhost:5173  
- 🔧 Backend API → http://localhost:3000  
- 🗄️ MongoDB → mongodb://localhost:27017  
- 🔨 Jenkins → http://localhost:8080/jenkins  

**Credenciales por defecto:**
- MongoDB: `admin` / `admin123`  
- Jenkins: ver `GUIA-VALIDACION-JENKINS.md`  
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025

### Opción 2: Modo Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

<<<<<<< HEAD
El servidor se ejecutará en `http://localhost:5173/`
=======
El servidor se ejecutará en `http://localhost:5173/`.
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025

### Opción 3: Modo Producción (Electron)

```bash
# Construir instalador para Windows
npm run electron:build:win
```

El instalador se generará en la carpeta `release/`.

<<<<<<< HEAD
=======
---

>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025
## 🧪 Pruebas de Calidad

### Formulario Interactivo de Pruebas

<<<<<<< HEAD
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
=======
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
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025

## 🛠️ Stack Tecnológico

### Frontend
<<<<<<< HEAD
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
=======
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
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025

## 🔧 Configuración Avanzada

### Docker

<<<<<<< HEAD
El sistema incluye configuración Docker completa:

```yaml
# docker-compose.yml
=======
Ejemplo de `docker-compose.yml`:

```yaml
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025
services:
  frontend:   # React + Vite (puerto 5173)
  backend:    # Express + Socket.IO (puertos 3000-3001)
  mongo:      # MongoDB 7.0 (puerto 27017)
  jenkins:    # Jenkins LTS (puerto 8080)
```

**Comandos útiles:**
```bash
<<<<<<< HEAD
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
=======
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
>>>>>>> ad5b3b941549d5e484ed4663f0248edbc48b9025

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
  