# 🎙️ Sistema de Teleprompter Profesional

> Teleprompter estilo **Winplus** creado para estudios profesionales, productoras y equipos broadcasting que necesitan scripts sincronizados, monitorización de run orders y control total de la ventana de lectura.

![GitHub release](https://img.shields.io/badge/release-v2.0.0-blue)
![Docker](https://img.shields.io/badge/docker-ready-2496ED)
![Node.js](https://img.shields.io/badge/node-18-green)

## 📋 Tabla de contenidos
- [Arquitectura del sistema](#🏗️-arquitectura-del-sistema)
- [Instalación y ejecución](#🚀-instalación-y-ejecución)
- [Pruebas de calidad](#✅-pruebas-de-calidad)
- [Características principales](#✨-características-principales)
- [Casos de uso](#🎯-casos-de-uso)
- [Stack tecnológico](#🧰-stack-tecnológico)
- [Documentación](#📚-documentación)
- [Configuración avanzada](#🧪-configuración-avanzada)
- [Proyecto original, contribuir y licencia](#🧩-proyecto-original-contribuir-y-licencia)

## 🏗️ Arquitectura del sistema

### 🌐 Arquitectura multi-contenedor (Docker)
El sistema aprovecha una topología de microservicios con 4 contenedores dedicados: Frontend (React + Vite), Backend (Express + Socket.IO), MongoDB y Jenkins para CI/CD.

![Arquitectura de Contenedores](docs/Arquitectura%20de%20Contenedores%20-%20Sistema%20de%20Teleprompter.png)

**Servicios principales:**
- Frontend en los puertos 5173/4173
- Backend en los puertos 3000/3001
- MongoDB 7.0 en el puerto 27017
- Jenkins LTS en el puerto 8080

### 🔁 Flujo de comunicación en tiempo real
La sincronización ocurre vía WebSocket: el productor crea y edita scripts, el backend los persiste en Mongo, y los operadores reciben cada cambio con menos de 50 ms de latencia.

![Flujo en Tiempo Real](docs/Flujo%20de%20Comunicación%20-%20Escenario%20Completo.png)

### 🧵 Topología de red Docker
Todos los contenedores comparten la red 	eleprompter-network, lo que garantiza aislamiento, nombres DNS automáticos y volúmenes persistentes para datos y logs.

![Topología de Red](docs/Diagrama%20de%20Red%20-%20Docker%20Compose.png)

## 🚀 Instalación y ejecución

### 🐳 Opción 1: Docker (recomendado para producción)
`ash
git clone https://github.com/wilmereleon/STP.git
cd STP/Sistema\ de\ Teleprompter

docker-compose up -d
# Verificar estado
docker-compose ps
`

**Accesos locales:**
- 🎧 Frontend → http://localhost:5173
- 🧠 Backend API → http://localhost:3000
- 🗃️ MongoDB → mongodb://localhost:27017
- 🎬 Jenkins → http://localhost:8080/jenkins

**Credenciales por defecto:**
- MongoDB: dmin / dmin123
- Jenkins: sigue la guía GUIA-VALIDACION-JENKINS.md

### 🛠️ Opción 2: Modo desarrollo local
`ash
npm install
npm run dev
`
El frontend queda en http://localhost:5173/.

### 🖥️ Opción 3: Modo producción (Electron)
`ash
npm run electron:build:win
`
El instalador se genera en elease/.

## ✅ Pruebas de calidad
Incluye un formulario HTML interactivo para documentar 68 casos de prueba, registrar observaciones y exportar reportes.

Pasos rápidos:
1. Abrir 	est-form.html y completar la sesión.
2. Marcar cada caso como **Pass**, **Fail** o **N/A**.
3. Guardar periódicamente con  💾 Guardar Progreso.
4. Exportar usando 📤 Exportar Resultados.

**Capturas avanzadas:**
- Auto-guardado cada 30 segundos.
- Persistencia local sin servidor.
- Barra de progreso y modo impresión.
- Historial de sesiones anteriores.

## ✨ Características principales
- Interfaz inspirada en Winplus pensada para broadcast.
- Ventana flotante dedicada para teleprompter en segundo monitor.
- Control preciso de velocidad (0.1‑5.0x) y tamaño de fuente (12px‑500px).
- Run order con drag & drop y macros personalizables.
- Sincronización Master/Slave con AutoScrollService.
- Línea guía configurable, atajos, y control por rueda del ratón.
- Importación de scripts .txt estructurados y guardado automático.

## 🎯 Casos de uso
- Estudios de televisión y noticieros.
- Streaming y producciones corporativas.
- Producción de podcasts y presentaciones en vivo.
- Eventos con múltiples locutores.

## 🧰 Stack tecnológico
### Frontend
- React 18.3.1 + Vite 6.3.5
- TypeScript 5.x
- Tailwind CSS 3.x & shadcn/ui
- Socket.IO Client 4.x & Axios

### Backend
- Node.js 18 y Express 4.21.2
- Socket.IO 4.8.1
- Mongoose 8.8.4, JWT (jsonwebtoken + bcryptjs)
- Multer, Morgan para uploads y logging

### Base de datos
- MongoDB 7.0 con 8 colecciones optimizadas y transacciones ACID.

### DevOps
- Docker + Docker Compose
- Jenkins LTS
- Git

## 📚 Documentación
- Guías de usuario: docs/guias/INICIO_RAPIDO_FORMULARIO.md, LAYOUT_WINPLUS.md, PLANTILLA_EXCEL.md.
- Pruebas: docs/pruebas/PRUEBAS_FUNCIONALES.md, TESTING_CHECKLIST.md, 	est-form.html.
- Instalación/Deploy: docs/instalacion/INSTALADOR.md, ELECTRON_SETUP.md, CHECKLIST_INSTALADOR.md, README-DOCKER.md, GUIA-VALIDACION-JENKINS.md.
- Arquitectura: docs/README.md, diagramas PlantUML y red.
- Desarrollo: docs/desarrollo/PLAN_REFACTORIZACION.md, GUIA_MIGRACION_V2.md, historiales de Fase 1/2.
- Otros: src/Attributions.md, src/guidelines/Guidelines.md.

## 🧪 Configuración avanzada
### Docker
ejemplo de docker-compose.yml:
`yaml
services:
  frontend:
  backend:
  mongo:
  jenkins:
`
Comandos útiles:
`ash
docker-compose logs -f
docker-compose restart
docker-compose ps
docker exec -it teleprompter-mongo mongosh
docker exec teleprompter-mongo mongodump --out /backup
`

### Electron & build
- electron/main.js controla la ventana principal.
- 
pm run electron:build:win genera el instalador.
- ite.config.ts, 	sconfig.json y package.json contienen la configuración del proyecto.

## 🧩 Proyecto original, contribuir y licencia
- Basado en [Teleprompter estilo Winplus – Figma](https://www.figma.com/design/gHWcL5pOEAzOQXOdRes302/Teleprompter-estilo-Winplus).
- Para bugs o mejoras, completa y exporta el formulario 	est-form.html.
- Licencia: consulta LICENSE para detalles.
