PROYECTO CI/CD - SISTEMA DE TELEPROMPTER v2.0
==============================================

📅 Fecha Inicio: 23 de Octubre 2025
👥 Equipo: 5 miembros
🎯 Entregas: 3 iteraciones (4 nov, 18 nov, 2 dic 2025)

═══════════════════════════════════════════════════════
📋 ÍNDICE
═══════════════════════════════════════════════════════

1. Visión General del Proyecto
2. Arquitectura
3. Historias de Usuario
4. Requerimientos
4.5. Base de Datos ⭐ NUEVO
5. Roles y Responsabilidades
6. Setup de Desarrollo
7. CI/CD Pipeline
8. GitHub Projects Setup
9. Cronograma
10. Referencias

═══════════════════════════════════════════════════════
1. 🎯 VISIÓN GENERAL DEL PROYECTO
═══════════════════════════════════════════════════════

OBJETIVO:
Transformar el Sistema de Teleprompter de una aplicación Electron standalone
a una aplicación web containerizada con Docker, que incluya:

✓ Backend con base de datos MongoDB para persistencia
✓ Vista de Productor (nueva) para creación de contenido
✓ Vista de Operador (refactorizada) para operación en vivo
✓ Sincronización en tiempo real vía WebSocket
✓ Pipeline CI/CD con Jenkins y CodeCov
✓ Gestión de proyecto con GitHub Projects

PROBLEMAS QUE RESUELVE:
- 31 bugs identificados en el reporte de pruebas
- Falta de persistencia de datos (scripts, configuraciones, RunOrder)
- Necesidad de separar roles: Producers vs Operators
- Falta de colaboración en tiempo real
- Despliegue manual propenso a errores
- Falta de calidad de código automatizada

BENEFICIOS:
- Trabajo colaborativo entre productores y operadores
- Datos persistentes entre sesiones
- Despliegue automatizado y confiable
- Calidad de código garantizada (tests, coverage, linting)
- Ambientes aislados (dev, staging, prod)
- Rollback rápido en caso de problemas

═══════════════════════════════════════════════════════
2. 🏗️ ARQUITECTURA
═══════════════════════════════════════════════════════

ANTES (Monolítico):
┌─────────────────────────┐
│   Electron Desktop App   │
│  (Frontend + Storage)   │
└─────────────────────────┘

DESPUÉS (Microservicios Containerizados):
┌─────────────────────────────────────────────────┐
│                   DOCKER                        │
│                                                 │
│  ┌──────────────┐   ┌──────────────┐          │
│  │  FRONTEND    │   │   BACKEND    │          │
│  │  React+Vite  │◄─►│ Node.js+API  │          │
│  │  Port: 5173  │   │  Port: 3000  │          │
│  │              │   │  WebSocket   │          │
│  └──────────────┘   │  Port: 3001  │          │
│         │           └──────┬───────┘          │
│         │                  │                   │
│         │           ┌──────▼───────┐          │
│         └──────────►│   MONGODB    │          │
│                     │  Port: 27017 │          │
│                     └──────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   JENKINS    │
              │   CI/CD      │
              │  Port: 8080  │
              └──────────────┘

COMPONENTES:

1. FRONTEND (React + TypeScript + Vite)
   - Vista de Operador: Control de teleprompter en vivo
   - Vista de Productor: Creación y gestión de scripts
   - WebSocket Client: Sincronización en tiempo real
   - Estado: Zustand stores
   - Rutas: React Router

2. BACKEND (Node.js + Express + Socket.IO)
   - API REST: CRUD de scripts, runorder, configs, macros
   - WebSocket Server: Sincronización bidireccional
   - Autenticación: JWT
   - Validación: express-validator
   - Manejo de archivos: multer (Excel/TXT import)

3. BASE DE DATOS (MongoDB 7.0+)
   - Scripts: Contenido, metadatos, versiones (embedded max 10)
   - Users: Producers, Operators, Admins con roles
   - RunOrder: Orden de ejecución con items embebidos
   - Config: Preferencias de usuario (1:1 con User)
   - Macros: Shortcuts configurables con validación única
   - Collaborations: Gestión de edición concurrente con locks
   - AuditLogs: Trazabilidad completa de cambios
   - Sessions: Gestión de JWT con TTL automático
   
   📊 Ver detalles completos: ../../../database/README.md
   📐 Diagrama ER: ../../../database/diagrams/01-ER-diagram.png

4. CI/CD (Jenkins)
   - Build automático
   - Tests unitarios + integración
   - Análisis de código (ESLint, CodeCov)
   - Build de imágenes Docker
   - Deploy a staging/producción
   - Rollback automático

FLUJO DE DATOS:

Producer crea script:
Producer → Frontend → API → MongoDB → WebSocket → Operator Frontend

Operator inicia Play:
Operator → Frontend → WebSocket → (sync) → Preview/FloatingWindow

═══════════════════════════════════════════════════════
3. 📖 HISTORIAS DE USUARIO
═══════════════════════════════════════════════════════

UBICACIÓN: docs/proyecto-ci-cd/historias-usuario/

ESTADO ACTUAL:
✅ US-001: Play funcionalidad (TP-1) - CRÍTICO - 3 pts
✅ US-002: Pause funcionalidad (TP-2) - CRÍTICO - 2 pts
✅ US-003: Reset funcionalidad (TP-3) - ALTA - 2 pts
✅ US-004: Velocidad ajustable (TP-4) - ALTA - 3 pts
✅ US-005: Font size ajustable (RF-005) - MEDIA - 2 pts
✅ US-032: Backend con base de datos - CRÍTICO - 13 pts
✅ US-034: Vista de Productor - CRÍTICO - 21 pts

⏳ PENDIENTES: US-006 a US-031, US-033, US-035 a US-040

CATEGORÍAS:
- US-001 a US-031: Bugs del reporte de pruebas
  - TP (Teleprompter): US-001 a US-006
  - VF (Ventana Flotante): US-007 a US-012
  - PF (Pantalla Completa): US-013 a US-016
  - ED (Editor): US-017 a US-021
  - RO (RunOrder): US-022 a US-027
  - MK (Macros): US-028 a US-031

- US-032 a US-040: Nuevas funcionalidades
  - US-032: Backend con base de datos ⭐ CRÍTICO
  - US-033: API avanzada para Producer
  - US-034: Vista de Productor ⭐ CRÍTICO
  - US-035: Sincronización tiempo real
  - US-036: Docker frontend
  - US-037: Docker backend
  - US-038: Comunicación entre contenedores
  - US-039: Pipeline Jenkins CI/CD ⭐ CRÍTICO
  - US-040: Integración CodeCov

FORMATO DE CADA HISTORIA:
```
US-XXX: Título
==============
CATEGORÍA: ...
PRIORIDAD: Alta/Media/Baja
ORIGEN: Reporte de Pruebas / Nueva Funcionalidad

COMO: [rol]
QUIERO: [funcionalidad]
PARA: [beneficio]

CRITERIOS DE ACEPTACIÓN:
✓ ...
✓ ...

NOTAS TÉCNICAS:
- ...

CASOS DE PRUEBA:
1. ...
2. ...

DEPENDENCIAS:
- Requiere US-XXX

ESTADO: Pendiente/En Progreso/Completado
ESTIMACIÓN: X Story Points
SPRINT: Sprint X
ASIGNADO A: [Rol]
```

═══════════════════════════════════════════════════════
4. 📋 REQUERIMIENTOS
═══════════════════════════════════════════════════════

UBICACIÓN: docs/proyecto-ci-cd/requerimientos/

FUNCIONALES (RF-requerimientos-funcionales.txt):
- 100+ requerimientos funcionales agrupados en 13 módulos
- RF-001: Autenticación y Usuarios
- RF-002: Scripts (CRUD)
- RF-003: Importación/Exportación
- RF-004: RunOrder
- RF-005: Teleprompter
- RF-006: Macros y Shortcuts
- RF-007: Editor (Productor)
- RF-008: Configuración
- RF-009: Sincronización Tiempo Real
- RF-010: Workflow y Estados
- RF-011: Colaboración
- RF-012: Búsqueda y Filtrado
- RF-013: Administración

NO FUNCIONALES (RNF-requerimientos-no-funcionales.txt):
- RNF-001: Rendimiento (60 FPS scroll, API < 500ms)
- RNF-002: Escalabilidad (50 usuarios, 10k scripts)
- RNF-003: Disponibilidad (99.9% uptime)
- RNF-004: Seguridad (JWT, HTTPS, validación)
- RNF-005: Mantenibilidad (70% coverage, linting)
- RNF-006: Usabilidad (UX, accesibilidad)
- RNF-007: Compatibilidad (Chrome, Firefox, Edge)
- RNF-008: Portabilidad (Docker, multi-OS)
- RNF-009: CI/CD y Calidad (tests, coverage)
- RNF-010: Monitoreo (logs, métricas, alertas)

═══════════════════════════════════════════════════════
4.5. 🗄️ BASE DE DATOS
═══════════════════════════════════════════════════════

MOTOR SELECCIONADO: MongoDB 7.0+

RAZONES:
✓ Schema flexible (embedded documents)
✓ WebSocket-friendly (Change Streams)
✓ Native JSON (sin overhead de serialización)
✓ Full-text search nativo
✓ Horizontal scaling (sharding)
✓ Mongoose ODM maduro

UBICACIÓN: ../../../database/

ESTRUCTURA:
database/
├── diagrams/
│   ├── 01-ER-diagram.puml        # PlantUML source
│   ├── 01-ER-diagram.png         # Diagrama generado
│   └── generate-diagrams.py      # Script de generación
├── mongodb/
│   └── 01-init.js                # Schema + seeds
├── mysql/
│   └── 01-schema.sql             # Alternativa SQL (por si se requiere)
└── README.md                     # Documentación completa

ENTIDADES PRINCIPALES:

1. users (Usuarios del Sistema)
   - ID, email (unique), password, name, role, preferences
   - Roles: Admin, Producer, Operator
   - 1:1 con configurations
   - 1:N con scripts, macros, runorders

2. scripts (Guiones de Teleprompter)
   - ID, title, content (LONGTEXT), category, tags[], status
   - Embedded: versions[] (max 10), jumpMarkers[]
   - Indexes: Full-text (title, content, tags)
   - Estados: Borrador, Revisión, Aprobado, Archivado

3. runorders (Listas de Reproducción)
   - ID, userId, name, isActive, totalDuration
   - Embedded: items[] (scriptId, position, duration)
   - Constraint: Solo 1 activo por usuario

4. configurations (Configuraciones de Usuario)
   - ID, userId (unique), fontSize, scrollSpeed, guidelinePos, colors
   - Todos los ajustes del panel de configuración

5. macros (Shortcuts Configurables)
   - ID, userId, key, action, description
   - Unique: (userId, key) - No duplicados de teclas por usuario

6. collaborations (Edición Concurrente)
   - ID, scriptId, userId, lockExpiry
   - Gestión de locks para evitar conflictos

7. auditlogs (Trazabilidad)
   - ID, entityType, entityId, action, changes, userId
   - Registro de todos los cambios críticos

8. sessions (Gestión de Sesiones JWT)
   - ID, userId, token, expiresAt
   - TTL index para limpieza automática

NORMALIZACIÓN 3FN:

Primera Forma Normal (1FN):
✓ Todos los atributos son atómicos
✓ No hay grupos repetitivos en columnas

Segunda Forma Normal (2FN):
✓ Sin dependencias parciales
✓ Todas las tablas tienen clave primaria simple (UUID/ObjectId)

Tercera Forma Normal (3FN):
✓ Sin dependencias transitivas entre no-claves
✓ Cada atributo depende directamente de la PK

DENORMALIZACIÓN ESTRATÉGICA:
- scripts.versions[] - Embedded para evitar JOINs (max 10)
- scripts.jumpMarkers[] - Embedded (siempre se usan juntos)
- runorders.items[] - Embedded para performance
- scripts.duration - Calculado pero almacenado (evitar recálculo)

INICIALIZACIÓN:

Con Docker Compose:
  docker-compose up -d mongo
  docker exec -i teleprompter-mongo mongosh teleprompter < database/mongodb/01-init.js

Sin Docker:
  mongosh teleprompter < database/mongodb/01-init.js

DATOS DE SEMILLA:
✓ Usuario Admin (admin@teleprompter.com / admin123)
✓ Configuración por defecto
✓ 6 macros predefinidos (F11, F10, PageUp, PageDown, Ctrl++, Ctrl+-)
✓ Script de ejemplo

DIAGRAMAS:

Generar PNG desde PlantUML:
  cd database/diagrams
  python generate-diagrams.py

O manualmente:
  plantuml -tpng 01-ER-diagram.puml

📊 Ver diagrama: ../../../database/diagrams/01-ER-diagram.png
📚 Documentación completa: ../../../database/README.md

MODELOS BACKEND (Mongoose):
Los modelos correspondientes se encuentran en:
  backend/src/models/
    - User.model.js
    - Script.model.js
    - RunOrder.model.js
    - Configuration.model.js
    - Macro.model.js
    - Collaboration.model.js
    - AuditLog.model.js
    - Session.model.js

QUERIES COMUNES:

Buscar scripts por texto:
  db.scripts.find({
    $text: { $search: "noticias deportes" }
  }).sort({ score: { $meta: "textScore" } });

RunOrder activo de usuario:
  db.runorders.findOne({
    userId: ObjectId("..."),
    isActive: true
  });

Scripts con información de usuario:
  db.scripts.aggregate([
    { $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator"
    }},
    { $unwind: "$creator" }
  ]);

═══════════════════════════════════════════════════════
5. 👥 ROLES Y RESPONSABILIDADES
═══════════════════════════════════════════════════════

UBICACIÓN: docs/proyecto-ci-cd/roles-tareas/EQUIPO-roles-y-responsabilidades.txt

ROL 1: FRONTEND LEAD
- React + TypeScript
- Vista Operador + Vista Productor
- WebSocket client
- Sprint 1: US-001 a US-006 (15 pts)
- Sprint 2: US-034 (21 pts)

ROL 2: BACKEND LEAD
- Node.js + Express + MongoDB
- API REST + WebSocket Server
- Autenticación JWT
- Sprint 1: US-032 (13 pts) ⭐
- Sprint 2: US-033 (13 pts)

ROL 3: DEVOPS ENGINEER
- Docker + Docker Compose
- Jenkins CI/CD
- Infraestructura
- Sprint 1: US-036, US-037, US-038 (8 pts)
- Sprint 2: US-039 (8 pts) ⭐

ROL 4: QA ENGINEER
- Testing strategy
- Tests unitarios + integración + E2E
- CodeCov analysis
- Bug tracking
- Sprint 1: Plan de pruebas (4 pts)
- Sprint 2: Tests E2E + performance (8 pts)

ROL 5: FULL STACK DEVELOPER
- Apoyo frontend + backend
- Integración end-to-end
- Code reviews
- Sprint 1: Apoyo US-032 + US-001 a US-006 (15 pts)
- Sprint 2: US-035 + Editor bugs (16 pts)

DISTRIBUCIÓN POR SPRINT:
Sprint 1: 40 Story Points (Foundation)
Sprint 2: 50 Story Points (Features)
Sprint 3: 30 Story Points (Polish)

═══════════════════════════════════════════════════════
6. 💻 SETUP DE DESARROLLO
═══════════════════════════════════════════════════════

PREREQUISITOS:
✓ Node.js 18+ LTS
✓ Docker Desktop
✓ Git
✓ Visual Studio Code (recomendado)

INSTALACIÓN RÁPIDA:

1. Clonar repositorio:
   git clone https://github.com/wilmereleon/STP.git
   cd "Sistema de Teleprompter"

2. Instalar dependencias:
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..

3. Configurar variables de entorno:
   # Copiar archivos .env.example
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # Editar con tus valores
   # MONGODB_URI, JWT_SECRET, etc.

4. Iniciar con Docker Compose:
   docker-compose up -d
   
   # Verificar servicios
   docker-compose ps
   
   # Inicializar base de datos MongoDB
   docker exec -i teleprompter-mongo mongosh teleprompter < database/mongodb/01-init.js
   
   # Verificar inicialización
   docker exec -it teleprompter-mongo mongosh teleprompter
   > show collections
   > db.users.countDocuments()  # Debe retornar 1 (admin)
   > exit

5. Acceder a la aplicación:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017
   - Jenkins: http://localhost:8080

DESARROLLO SIN DOCKER:

1. Iniciar MongoDB local:
   mongod --dbpath /data/db
   
   # En otra terminal, inicializar DB
   mongosh teleprompter < database/mongodb/01-init.js

2. Iniciar backend:
   cd backend
   npm run dev

3. Iniciar frontend:
   npm run dev

SCRIPTS ÚTILES:
npm run dev          # Desarrollo con hot reload
npm run build        # Build de producción
npm run test         # Tests unitarios
npm run test:watch   # Tests en modo watch
npm run lint         # Linter
npm run lint:fix     # Linter + autofix

═══════════════════════════════════════════════════════
7. 🚀 CI/CD PIPELINE
═══════════════════════════════════════════════════════

UBICACIÓN: Jenkinsfile (raíz del proyecto)

STAGES:

1. 📋 Checkout
   - Clone del repositorio
   - Obtención de metadata (commit, autor, mensaje)

2. 🔍 Análisis de Código Estático
   - ESLint frontend (paralelo)
   - ESLint backend (paralelo)

3. 🧪 Tests Unitarios
   - Tests frontend con coverage (paralelo)
   - Tests backend con coverage (paralelo)
   - Publicación de resultados (JUnit + HTML)

4. 📊 CodeCov Analysis
   - Upload de coverage a CodeCov
   - Análisis de tendencias
   - Comentarios en PRs con % coverage

5. 🏗️ Build Docker Images
   - Build imagen frontend (paralelo)
   - Build imagen backend (paralelo)
   - Tag con número de build y "latest"

6. 🔐 Security Scan
   - Trivy scan de imágenes Docker
   - Detección de vulnerabilidades críticas

7. 🚀 Deploy to Staging (solo branch develop)
   - Push de imágenes a registry
   - Deploy con docker-compose
   - Health check automático
   - Rollback si falla

8. 🧪 Integration Tests (solo branch develop)
   - Tests E2E contra staging
   - Validación de flujos completos

9. ⚡ Performance Tests (solo branch develop)
   - Artillery load tests
   - Validación de SLAs (latencia, throughput)

10. 📦 Deploy to Production (solo branch main)
    - Requiere aprobación manual
    - Push de imágenes
    - Deploy con zero-downtime
    - Health check
    - Rollback automático si falla

NOTIFICACIONES:
✓ Slack: Canal #teleprompter-ci
✓ Email: team@teleprompter.com
✓ GitHub: Status checks en PRs

TRIGGERS:
- Push a cualquier branch: Stages 1-6
- Push a develop: Stages 1-9
- Push a main: Stages 1-10 (con aprobación)
- Pull Request: Stages 1-6 + comentario CodeCov

═══════════════════════════════════════════════════════
8. 📊 GITHUB PROJECTS SETUP
═══════════════════════════════════════════════════════

TABLEROS KANBAN:

1. BOARD: Sprint 1 - Foundation (23 Oct - 4 Nov)
   Columnas:
   - 📋 Backlog
   - 🔄 In Progress
   - 👀 In Review
   - ✅ Done
   
   Issues: US-001 a US-006, US-032, US-036, US-037, US-038

2. BOARD: Sprint 2 - Features (5 Nov - 18 Nov)
   Issues: US-033, US-034, US-035, US-039, US-007 a US-012

3. BOARD: Sprint 3 - Polish (19 Nov - 2 Dec)
   Issues: Refinamiento, bugs de QA, documentación

LABELS:
- priority: critical / high / medium / low
- type: bug / feature / refactor / docs
- area: frontend / backend / devops / testing
- sprint: sprint-1 / sprint-2 / sprint-3
- status: blocked / in-progress / review

MILESTONES:
- Entrega 1: 4 Noviembre 2025
- Entrega 2: 18 Noviembre 2025
- Entrega 3: 2 Diciembre 2025

AUTOMATIZACIONES:
- Issue creado → Agregar a backlog
- PR abierto → Mover issue a "In Review"
- PR merged → Mover issue a "Done"
- Build falla → Agregar label "build-failing"

═══════════════════════════════════════════════════════
9. 📅 CRONOGRAMA
═══════════════════════════════════════════════════════

SPRINT 1: FOUNDATION (23 Oct - 4 Nov)
Semana 1 (23-27 Oct):
- Lunes: Sprint Planning, setup de ambientes
- Martes-Viernes: Desarrollo US-032 (Backend) + US-001 a US-006
- Viernes: Demo interna, ajustes

Semana 2 (28 Oct - 1 Nov):
- Lunes-Jueves: Finalización + US-036, US-037, US-038 (Docker)
- Jueves: QA intensivo, corrección de bugs
- Viernes: Buffer para imprevistos

Lunes 4 Nov: ENTREGA 1
- Sprint Review con stakeholders
- Retrospectiva
- Sprint 2 Planning

SPRINT 2: FEATURES (5 Nov - 18 Nov)
Semana 1 (5-8 Nov):
- Desarrollo US-034 (Vista Productor)
- Desarrollo US-033 (API avanzada)
- Desarrollo US-039 (Jenkins CI/CD)

Semana 2 (11-15 Nov):
- Finalización features principales
- US-035 (Sincronización)
- Tests E2E + Performance

Viernes 15 Nov: Code freeze
Lunes 18 Nov: ENTREGA 2

SPRINT 3: POLISH (19 Nov - 2 Dec)
Semana 1 (19-22 Nov):
- Refinamiento UI/UX
- Corrección de bugs de QA
- Optimización de performance

Semana 2 (25-29 Nov):
- Documentación final
- Tests de aceptación con usuarios
- Preparación de release

Lunes 2 Dec: ENTREGA 3 (FINAL)

═══════════════════════════════════════════════════════
10. 📚 REFERENCIAS
═══════════════════════════════════════════════════════

DOCUMENTACIÓN:
- docs/guias/               → Guías de usuario
- docs/pruebas/             → Testing y QA
- docs/instalacion/         → Instalación y setup
- docs/desarrollo/          → Desarrollo y refactorización
- docs/proyecto-ci-cd/      → Este proyecto
- database/                 → Esquemas y diagramas de BD ⭐ NUEVO
  - database/README.md      → Documentación completa de BD
  - database/diagrams/      → Diagramas ER en PlantUML y PNG
  - database/mongodb/       → Scripts de inicialización MongoDB
  - database/mysql/         → Scripts SQL alternativos

DIAGRAMAS:
- Diagramas para la refactorización/
  - 01-arquitectura-propuesta.puml
  - 02-diagrama-clases-refactorizado.puml
  - 03-secuencia-play-refactorizado.puml
  - 04-patron-implementacion.puml

DISEÑOS:
- Diseño/Vista de Productor.png → Mockup de vista Producer

REPORTES:
- Reportes de pruebas de CN/Reporte_Pruebas_Melqui_2025-10-01.txt
  → 75 test cases, 31 bugs identificados

RECURSOS EXTERNOS:
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Node.js: https://nodejs.org/
- Express: https://expressjs.com/
- MongoDB: https://www.mongodb.com/
- Mongoose: https://mongoosejs.com/
- PlantUML: https://plantuml.com/
- Docker: https://www.docker.com/
- Jenkins: https://www.jenkins.io/
- CodeCov: https://about.codecov.io/

CONTACTO:
- Repositorio: https://github.com/wilmereleon/STP
- Issues: https://github.com/wilmereleon/STP/issues
- Projects: https://github.com/wilmereleon/STP/projects

═══════════════════════════════════════════════════════

✨ ¡ÉXITO EN EL PROYECTO! 🚀

