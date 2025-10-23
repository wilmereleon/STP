# 📊 BASE DE DATOS - Sistema de Teleprompter v2.0

Este directorio contiene todos los esquemas, scripts y diagramas de la base de datos del sistema.

---

## 📁 Estructura del Directorio

```
database/
├── diagrams/              # Diagramas PlantUML y PNGs
│   ├── 01-ER-diagram.puml
│   ├── 01-ER-diagram.png
│   ├── 02-normalization.puml
│   ├── 02-normalization.png
│   └── generate-diagrams.py
├── mongodb/               # Scripts para MongoDB (RECOMENDADO)
│   ├── 01-init.js
│   ├── 02-indexes.js
│   ├── 03-seeds.js
│   └── README.md
├── mysql/                 # Scripts para MySQL (Alternativo)
│   ├── 01-schema.sql
│   ├── 02-seeds.sql
│   ├── 03-procedures.sql
│   └── README.md
└── README.md              # Este archivo
```

---

## 🎯 Motor de Base de Datos

### ✅ Recomendado: **MongoDB 7.0+**

**¿Por qué MongoDB?**

1. **Flexibilidad de Schema:** 
   - Scripts con contenido variable (texto largo, marcadores, versiones)
   - Configuraciones JSON dinámicas
   - Tags y arrays nativos

2. **Performance:**
   - Full-text search nativo
   - Índices compuestos eficientes
   - Agregación pipeline potente

3. **Integración con Node.js:**
   - Mongoose ODM maduro y robusto
   - Serialización JSON nativa
   - No impedance mismatch

4. **WebSocket Friendly:**
   - Change Streams para sincronización real-time
   - Operaciones atómicas para locks
   - TTL indexes para sesiones

5. **Escalabilidad:**
   - Sharding horizontal
   - Replica sets para HA
   - GridFS para archivos grandes

### 🔄 Alternativa: **MySQL 8.0+**

**Cuándo usar MySQL:**

- Requisito estricto de ACID
- Equipocionales tradicionales con SQL
- Auditoría compleja con triggers
- Reportes complejos con JOINs

---

## 🗂️ Modelo de Datos

### Entidades Principales

```
┌─────────┐
│  User   │ 1:N ┌─────────┐
└────┬────┘────►│ Script  │
     │          └────┬────┘
     │ 1:1           │ 1:N
     ▼               ▼
┌─────────┐    ┌──────────┐
│ Config  │    │ Version  │
└─────────┘    └──────────┘
     │
     │ 1:N
     ▼
┌──────────┐   1:N   ┌─────────────┐
│ RunOrder │────────►│ RunOrderItem│
└──────────┘         └─────────────┘
```

### Colecciones/Tablas

1. **users** - Usuarios del sistema (Producers, Operators, Admins)
2. **scripts** - Guiones con contenido y metadatos
3. **runorders** - Listas de reproducción de scripts
4. **configurations** - Configuraciones personalizadas por usuario
5. **macros** - Atajos de teclado configurables
6. **collaborations** - Gestión de edición concurrente
7. **auditlogs** - Trazabilidad de cambios
8. **sessions** - Sesiones JWT activas

---

## 🔢 Normalización

### MongoDB (Denormalización Estratégica)

**Embedido (Denormalizado):**
- `scripts.versions[]` - Historial de versiones (máx 10)
- `scripts.jumpMarkers[]` - Marcadores de salto
- `runorders.items[]` - Items del RunOrder
- `configurations.*` - Todas las configs en 1 documento

**Razón:** Performance en lectura, datos que siempre se usan juntos

**Referenciado (Normalizado):**
- `scripts.createdBy` → `users._id`
- `runorders.items[].scriptId` → `scripts._id`
- `macros.userId` → `users._id`

**Razón:** Evitar duplicación, integridad referencial

### MySQL (3FN Estricta)

**1FN - Primera Forma Normal:**
✅ Todos los atributos son atómicos
✅ No hay grupos repetitivos (versiones en tabla separada)

**2FN - Segunda Forma Normal:**
✅ Sin dependencias parciales de clave compuesta
✅ Todas las tablas tienen clave primaria simple (UUID)

**3FN - Tercera Forma Normal:**
✅ Sin dependencias transitivas entre atributos no-clave
✅ `scripts.category` no determina otros campos
✅ `users.role` no determina permissions (manejado en app)

---

## 📐 Diagramas

### 01-ER-diagram.puml

Diagrama Entidad-Relación completo con:
- Todas las entidades y atributos
- Relaciones y cardinalidades
- Índices y constraints
- Notas de normalización

**Generar PNG:**

```bash
# Opción 1: Con Python script
cd database/diagrams
python generate-diagrams.py

# Opción 2: Con PlantUML directo
plantuml -tpng 01-ER-diagram.puml

# Opción 3: Con Java + JAR
java -jar plantuml.jar -tpng 01-ER-diagram.puml
```

---

## 🚀 Inicialización Rápida

### MongoDB (Docker Compose)

```bash
# El docker-compose.yml ya incluye MongoDB
docker-compose up -d mongo

# Ejecutar script de inicialización
docker exec -i teleprompter-mongo mongosh teleprompter < database/mongodb/01-init.js

# Verificar
docker exec -it teleprompter-mongo mongosh
> use teleprompter
> show collections
> db.users.countDocuments()
```

### MongoDB (Local)

```bash
# Iniciar MongoDB
mongod --dbpath /data/db

# En otra terminal, ejecutar script
mongosh teleprompter < database/mongodb/01-init.js

# Verificar
mongosh teleprompter
> show collections
> db.users.find().pretty()
```

### MySQL (Docker Compose)

```bash
# Modificar docker-compose.yml para usar MySQL en lugar de MongoDB

# Ejecutar scripts
docker exec -i teleprompter-mysql mysql -u root -p < database/mysql/01-schema.sql

# Verificar
docker exec -it teleprompter-mysql mysql -u root -p teleprompter
mysql> SHOW TABLES;
mysql> SELECT * FROM users;
```

---

## 🔐 Credenciales por Defecto

⚠️ **CAMBIAR EN PRODUCCIÓN**

### MongoDB

```
Database: teleprompter
User: admin
Password: admin123
```

### Usuario Admin de la Aplicación

```
Email: admin@teleprompter.com
Password: admin123
```

---

## 📋 Índices Importantes

### MongoDB

```javascript
// Scripts - Búsqueda full-text
db.scripts.createIndex({ title: "text", content: "text", tags: "text" });

// Scripts - Filtrado y ordenamiento
db.scripts.createIndex({ status: 1, createdAt: -1 });

// Configurations - Lookup por usuario (unique)
db.configurations.createIndex({ userId: 1 }, { unique: true });

// Macros - Evitar duplicados
db.macros.createIndex({ userId: 1, key: 1 }, { unique: true });

// AuditLogs - Búsqueda eficiente
db.auditlogs.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
```

### MySQL

```sql
-- Scripts - Búsqueda full-text
FULLTEXT INDEX idx_fulltext_search (title, content);

-- Scripts - Filtrado compuesto
INDEX idx_compound_status_date (status, created_at DESC);

-- Configurations - Único por usuario
UNIQUE KEY uk_user_id (user_id);

-- Macros - Único por usuario + tecla
UNIQUE KEY uk_user_key (user_id, key_binding);
```

---

## 🧪 Datos de Prueba (Seeds)

Los scripts de inicialización incluyen:

✅ 1 usuario Admin  
✅ 1 configuración por defecto  
✅ 6 macros predefinidos (F11, F10, PageUp, PageDown, Ctrl++, Ctrl+-)  
✅ 1 script de ejemplo  

**Agregar más datos de prueba:**

```bash
# MongoDB
mongosh teleprompter < database/mongodb/03-seeds.js

# MySQL
mysql -u root -p teleprompter < database/mysql/02-seeds.sql
```

---

## 🔄 Migraciones

### Estrategia de Versioning

```
database/
├── mongodb/
│   ├── migrations/
│   │   ├── v1.0.0_initial.js
│   │   ├── v1.1.0_add_collaborations.js
│   │   └── v1.2.0_add_jumpmarkers.js
│   └── migrate.js
└── mysql/
    ├── migrations/
    │   ├── V001__initial_schema.sql
    │   ├── V002__add_collaborations.sql
    │   └── V003__add_jumpmarkers.sql
    └── flyway.conf
```

**Herramientas:**

- MongoDB: [migrate-mongo](https://github.com/seppevs/migrate-mongo)
- MySQL: [Flyway](https://flywaydb.org/)

---

## 📊 Queries Comunes

### MongoDB

```javascript
// Buscar scripts por texto
db.scripts.find({
  $text: { $search: "noticias deportes" }
}, {
  score: { $meta: "textScore" }
}).sort({ score: { $meta: "textScore" } });

// Scripts por categoría con paginación
db.scripts.find({ 
  category: "Noticias",
  status: "Aprobado" 
})
.sort({ createdAt: -1 })
.skip(0)
.limit(20);

// RunOrder activo de un usuario
db.runorders.findOne({ 
  userId: ObjectId("..."),
  isActive: true 
});

// Configuración de usuario
db.configurations.findOne({ 
  userId: ObjectId("...") 
});
```

### MySQL

```sql
-- Buscar scripts por texto
SELECT * FROM scripts
WHERE MATCH(title, content) AGAINST('noticias deportes' IN NATURAL LANGUAGE MODE)
ORDER BY created_at DESC;

-- Scripts con información de usuario
SELECT 
  s.*,
  u.name AS created_by_name
FROM scripts s
JOIN users u ON s.created_by = u.id
WHERE s.status = 'Aprobado'
ORDER BY s.created_at DESC
LIMIT 20;

-- RunOrder con duración total
SELECT 
  ro.*,
  COUNT(roi.id) AS item_count
FROM run_orders ro
LEFT JOIN run_order_items roi ON ro.id = roi.run_order_id
WHERE ro.user_id = '...' AND ro.is_active = TRUE
GROUP BY ro.id;
```

---

## 🔍 Validación de Integridad

### MongoDB

```javascript
// Verificar constraints
db.runCommand({
  collMod: "scripts",
  validator: { /* schema */ },
  validationLevel: "strict",
  validationAction: "error"
});

// Scripts huérfanos (sin usuario creador)
db.scripts.find({
  createdBy: { $nin: db.users.distinct("_id") }
});
```

### MySQL

```sql
-- Scripts huérfanos
SELECT s.* 
FROM scripts s
LEFT JOIN users u ON s.created_by = u.id
WHERE u.id IS NULL;

-- Verificar foreign keys
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'teleprompter'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## 📈 Monitoreo y Performance

### MongoDB

```javascript
// Estadísticas de colección
db.scripts.stats();

// Explicar query plan
db.scripts.find({ status: "Aprobado" }).explain("executionStats");

// Índices utilizados
db.scripts.aggregate([
  { $indexStats: {} }
]);

// Slow queries
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

### MySQL

```sql
-- Explain plan
EXPLAIN SELECT * FROM scripts WHERE status = 'Aprobado';

-- Slow query log
SHOW VARIABLES LIKE 'slow_query_log%';

-- Tamaño de tablas
SELECT 
  TABLE_NAME,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS `Size (MB)`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'teleprompter'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- Índices no utilizados
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema = 'teleprompter';
```

---

## 🛡️ Backup y Restore

### MongoDB

```bash
# Backup completo
mongodump --db teleprompter --out /backup/$(date +%Y%m%d)

# Backup específico
mongodump --db teleprompter --collection scripts --out /backup/scripts

# Restore
mongorestore --db teleprompter /backup/20251023/teleprompter
```

### MySQL

```bash
# Backup
mysqldump -u root -p teleprompter > backup_$(date +%Y%m%d).sql

# Backup con gzip
mysqldump -u root -p teleprompter | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
mysql -u root -p teleprompter < backup_20251023.sql
```

---

## 📚 Referencias

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose ODM](https://mongoosejs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PlantUML ER Diagrams](https://plantuml.com/er-diagram)
- [Database Design Best Practices](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/)

---

## 🤝 Contribuir

Al modificar el schema:

1. ✅ Actualizar diagrams PlantUML
2. ✅ Regenerar PNGs (`python generate-diagrams.py`)
3. ✅ Actualizar scripts SQL/JS
4. ✅ Crear migration script
5. ✅ Actualizar este README
6. ✅ Actualizar modelos Mongoose (backend/src/models/)
7. ✅ Tests de integración

---

_Última actualización: 23 de Octubre 2025_
