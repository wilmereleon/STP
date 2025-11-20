// ============================================
// SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
// Sistema de Teleprompter v2.0
// Motor: MongoDB 7.0+
// ============================================

// Conectar a la base de datos
db = db.getSiblingDB('teleprompter');

// ============================================
// COLECCIÓN: users
// ============================================
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role", "isActive", "createdAt"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 100,
          description: "Nombre del usuario - requerido, max 100 chars"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email único - requerido, formato válido"
        },
        password: {
          bsonType: "string",
          minLength: 8,
          description: "Password hasheado con bcrypt - requerido, min 8 chars"
        },
        role: {
          enum: ["Producer", "Operator", "Admin"],
          description: "Rol del usuario - requerido"
        },
        avatar: {
          bsonType: ["string", "null"],
          description: "URL del avatar - opcional"
        },
        isActive: {
          bsonType: "bool",
          description: "Estado del usuario - requerido"
        },
        lastLogin: {
          bsonType: ["date", "null"],
          description: "Último login - opcional"
        },
        preferences: {
          bsonType: ["object", "null"],
          description: "Preferencias del usuario - opcional"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de actualización - requerido"
        }
      }
    }
  }
});

// Índices para users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

// ============================================
// COLECCIÓN: scripts
// ============================================
db.createCollection("scripts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "category", "status", "priority", "duration", "createdBy", "createdAt"],
      properties: {
        title: {
          bsonType: "string",
          maxLength: 200,
          description: "Título del script - requerido, max 200 chars"
        },
        content: {
          bsonType: "string",
          description: "Contenido del script - requerido"
        },
        category: {
          enum: ["Noticias", "Deportes", "Clima", "Entrevista", "Especial", "Comercial", "Otro"],
          description: "Categoría del script - requerido"
        },
        status: {
          enum: ["Borrador", "Revisión", "Aprobado", "En Uso", "Archivado"],
          description: "Estado del script - requerido"
        },
        priority: {
          enum: ["Alta", "Media", "Baja"],
          description: "Prioridad del script - requerido"
        },
        duration: {
          bsonType: "int",
          minimum: 0,
          description: "Duración estimada en segundos - requerido, >= 0"
        },
        fontSize: {
          bsonType: ["int", "null"],
          minimum: 12,
          maximum: 120,
          description: "Tamaño de fuente específico - opcional, 12-120"
        },
        scrollSpeed: {
          bsonType: ["int", "null"],
          minimum: 1,
          maximum: 100,
          description: "Velocidad de scroll específica - opcional, 1-100"
        },
        producerNotes: {
          bsonType: ["string", "null"],
          maxLength: 1000,
          description: "Notas del productor - opcional, max 1000 chars"
        },
        tags: {
          bsonType: ["array", "null"],
          items: { bsonType: "string" },
          description: "Tags para búsqueda - opcional"
        },
        timesUsed: {
          bsonType: ["int", "null"],
          minimum: 0,
          description: "Contador de uso - opcional, >= 0"
        },
        lastUsedAt: {
          bsonType: ["date", "null"],
          description: "Última vez usado - opcional"
        },
        createdBy: {
          bsonType: "objectId",
          description: "ID del usuario creador - requerido"
        },
        lastModifiedBy: {
          bsonType: ["objectId", "null"],
          description: "ID del último modificador - opcional"
        },
        collaborators: {
          bsonType: ["array", "null"],
          items: { bsonType: "objectId" },
          description: "IDs de colaboradores - opcional"
        },
        versions: {
          bsonType: ["array", "null"],
          maxItems: 10,
          items: {
            bsonType: "object",
            required: ["content", "modifiedAt"],
            properties: {
              content: { bsonType: "string" },
              modifiedBy: { bsonType: ["objectId", "null"] },
              modifiedAt: { bsonType: "date" },
              changeDescription: { bsonType: ["string", "null"] }
            }
          },
          description: "Historial de versiones - opcional, max 10"
        },
        jumpMarkers: {
          bsonType: ["array", "null"],
          items: {
            bsonType: "object",
            required: ["position", "label"],
            properties: {
              position: { 
                bsonType: "int",
                minimum: 0
              },
              label: { bsonType: "string" },
              color: { bsonType: "string" },
              createdAt: { bsonType: "date" }
            }
          },
          description: "Marcadores de salto - opcional"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de actualización - requerido"
        }
      }
    }
  }
});

// Índices para scripts
db.scripts.createIndex({ title: "text", content: "text", tags: "text" });
db.scripts.createIndex({ status: 1, createdAt: -1 });
db.scripts.createIndex({ category: 1 });
db.scripts.createIndex({ priority: 1 });
db.scripts.createIndex({ createdBy: 1 });
db.scripts.createIndex({ createdAt: -1 });
db.scripts.createIndex({ tags: 1 });

// ============================================
// COLECCIÓN: runorders
// ============================================
db.createCollection("runorders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "name", "isActive", "items", "createdAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "ID del usuario propietario - requerido"
        },
        name: {
          bsonType: "string",
          maxLength: 200,
          description: "Nombre del RunOrder - requerido"
        },
        isActive: {
          bsonType: "bool",
          description: "RunOrder activo - requerido"
        },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["scriptId", "position"],
            properties: {
              scriptId: { bsonType: "objectId" },
              position: { 
                bsonType: "int",
                minimum: 0
              },
              isCompleted: { bsonType: "bool" },
              startedAt: { bsonType: ["date", "null"] },
              completedAt: { bsonType: ["date", "null"] }
            }
          },
          description: "Items del RunOrder - requerido"
        },
        totalDuration: {
          bsonType: ["int", "null"],
          minimum: 0,
          description: "Duración total calculada - opcional, calculado automáticamente"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de actualización - requerido"
        }
      }
    }
  }
});

// Índices para runorders
db.runorders.createIndex({ userId: 1 });
db.runorders.createIndex({ isActive: 1 });
db.runorders.createIndex({ createdAt: -1 });
db.runorders.createIndex({ userId: 1, isActive: 1 });

// ============================================
// COLECCIÓN: configurations
// ============================================
db.createCollection("configurations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "scrollSpeed", "fontSize", "createdAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "ID del usuario - requerido, único"
        },
        scrollSpeed: {
          bsonType: "int",
          minimum: 1,
          maximum: 100,
          description: "Velocidad de scroll - requerido, 1-100"
        },
        fontSize: {
          bsonType: "int",
          minimum: 12,
          maximum: 120,
          description: "Tamaño de fuente - requerido, 12-120"
        },
        backgroundColor: {
          bsonType: ["string", "null"],
          pattern: "^#[0-9A-Fa-f]{6}$",
          description: "Color de fondo - HEX, opcional"
        },
        textColor: {
          bsonType: ["string", "null"],
          pattern: "^#[0-9A-Fa-f]{6}$",
          description: "Color de texto - HEX, opcional"
        },
        guidelinePosition: {
          bsonType: ["int", "null"],
          minimum: 0,
          maximum: 100,
          description: "Posición de línea guía - 0-100, opcional"
        },
        guidelineColor: {
          bsonType: ["string", "null"],
          pattern: "^#[0-9A-Fa-f]{6}$",
          description: "Color de línea guía - HEX, opcional"
        },
        guidelineThickness: {
          bsonType: ["int", "null"],
          minimum: 1,
          maximum: 10,
          description: "Grosor de línea guía - 1-10, opcional"
        },
        guidelineVisible: {
          bsonType: ["bool", "null"],
          description: "Línea guía visible - booleano, opcional"
        },
        autoAdvance: {
          bsonType: ["bool", "null"],
          description: "Auto-avance activado - booleano, opcional"
        },
        theme: {
          enum: ["Light", "Dark", null],
          description: "Tema de la interfaz, opcional"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de actualización - requerido"
        }
      }
    }
  }
});

// Índices para configurations
db.configurations.createIndex({ userId: 1 }, { unique: true });

// ============================================
// COLECCIÓN: macros
// ============================================
db.createCollection("macros", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "key", "action", "isActive", "createdAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "ID del usuario - requerido"
        },
        key: {
          bsonType: "string",
          minLength: 1,
          maxLength: 20,
          description: "Tecla asignada - requerido"
        },
        action: {
          bsonType: "string",
          minLength: 1,
          description: "Acción a ejecutar - requerido"
        },
        description: {
          bsonType: ["string", "null"],
          maxLength: 200,
          description: "Descripción del macro - opcional"
        },
        isActive: {
          bsonType: "bool",
          description: "Macro activo - requerido"
        },
        params: {
          bsonType: ["object", "null"],
          description: "Parámetros adicionales - opcional"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de actualización - requerido"
        }
      }
    }
  }
});

// Índices para macros
db.macros.createIndex({ userId: 1, key: 1 }, { unique: true });
db.macros.createIndex({ isActive: 1 });

// ============================================
// COLECCIÓN: collaborations
// ============================================
db.createCollection("collaborations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["scriptId", "userId", "action", "isActive", "createdAt"],
      properties: {
        scriptId: {
          bsonType: "objectId",
          description: "ID del script - requerido"
        },
        userId: {
          bsonType: "objectId",
          description: "ID del usuario - requerido"
        },
        action: {
          enum: ["Viewing", "Editing", "Commenting"],
          description: "Acción del usuario - requerido"
        },
        isActive: {
          bsonType: "bool",
          description: "Colaboración activa - requerido"
        },
        lockExpiry: {
          bsonType: ["date", "null"],
          description: "Expiración del lock - opcional"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de actualización - requerido"
        }
      }
    }
  }
});

// Índices para collaborations
db.collaborations.createIndex({ scriptId: 1 });
db.collaborations.createIndex({ userId: 1 });
db.collaborations.createIndex({ isActive: 1 });
db.collaborations.createIndex({ lockExpiry: 1 });

// ============================================
// COLECCIÓN: auditlogs
// ============================================
db.createCollection("auditlogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["entityType", "entityId", "action", "createdAt"],
      properties: {
        userId: {
          bsonType: ["objectId", "null"],
          description: "ID del usuario - opcional"
        },
        entityType: {
          bsonType: "string",
          description: "Tipo de entidad - requerido"
        },
        entityId: {
          bsonType: "objectId",
          description: "ID de la entidad - requerido"
        },
        action: {
          bsonType: "string",
          description: "Acción realizada - requerido"
        },
        changes: {
          bsonType: ["object", "null"],
          description: "Cambios realizados - opcional"
        },
        ipAddress: {
          bsonType: ["string", "null"],
          description: "Dirección IP - opcional"
        },
        userAgent: {
          bsonType: ["string", "null"],
          description: "User agent - opcional"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        }
      }
    }
  }
});

// Índices para auditlogs
db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ entityType: 1 });
db.auditlogs.createIndex({ entityId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ createdAt: -1 });
db.auditlogs.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });

// ============================================
// COLECCIÓN: sessions
// ============================================
db.createCollection("sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "token", "refreshToken", "expiresAt", "isActive", "createdAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "ID del usuario - requerido"
        },
        token: {
          bsonType: "string",
          description: "JWT token - requerido"
        },
        refreshToken: {
          bsonType: "string",
          description: "Refresh token - requerido"
        },
        expiresAt: {
          bsonType: "date",
          description: "Fecha de expiración - requerido"
        },
        ipAddress: {
          bsonType: ["string", "null"],
          description: "Dirección IP - opcional"
        },
        userAgent: {
          bsonType: ["string", "null"],
          description: "User agent - opcional"
        },
        isActive: {
          bsonType: "bool",
          description: "Sesión activa - requerido"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creación - requerido"
        }
      }
    }
  }
});

// Índices para sessions
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 });
db.sessions.createIndex({ isActive: 1 });
db.sessions.createIndex({ token: 1 });

// ============================================
// DATOS INICIALES (SEEDS)
// ============================================

// Usuario administrador
const adminId = ObjectId();
const now = new Date();

db.users.insertOne({
  _id: adminId,
  name: "Administrador",
  email: "admin@teleprompter.com",
  password: "$2a$10$.NUbc8F9fO4r1P85WfZRlO.znz2RsnmIu9s8MP90Rw48oxBc6ey2i", // Hash de 'admin123'
  role: "Admin",
  avatar: null,
  isActive: true,
  lastLogin: null,
  preferences: {},
  createdAt: now,
  updatedAt: now
});

// Configuración por defecto para admin
db.configurations.insertOne({
  userId: adminId,
  scrollSpeed: 50,
  fontSize: 32,
  backgroundColor: "#000000",
  textColor: "#FFFFFF",
  guidelinePosition: 50,
  guidelineColor: "#FF0000",
  guidelineThickness: 2,
  guidelineVisible: true,
  autoAdvance: false,
  theme: "Dark",
  createdAt: now,
  updatedAt: now
});

// Macros por defecto
db.macros.insertMany([
  {
    userId: adminId,
    key: "F11",
    action: "togglePlay",
    description: "Iniciar/Pausar scroll",
    isActive: true,
    params: {},
    createdAt: now,
    updatedAt: now
  },
  {
    userId: adminId,
    key: "F10",
    action: "reset",
    description: "Reiniciar scroll al inicio",
    isActive: true,
    params: {},
    createdAt: now,
    updatedAt: now
  },
  {
    userId: adminId,
    key: "PageDown",
    action: "nextScript",
    description: "Siguiente script en RunOrder",
    isActive: true,
    params: {},
    createdAt: now,
    updatedAt: now
  },
  {
    userId: adminId,
    key: "PageUp",
    action: "previousScript",
    description: "Script anterior en RunOrder",
    isActive: true,
    params: {},
    createdAt: now,
    updatedAt: now
  },
  {
    userId: adminId,
    key: "Ctrl+Plus",
    action: "increaseFontSize",
    description: "Aumentar tamaño de fuente",
    isActive: true,
    params: { increment: 2 },
    createdAt: now,
    updatedAt: now
  },
  {
    userId: adminId,
    key: "Ctrl+Minus",
    action: "decreaseFontSize",
    description: "Disminuir tamaño de fuente",
    isActive: true,
    params: { decrement: 2 },
    createdAt: now,
    updatedAt: now
  }
]);

// Script de ejemplo
db.scripts.insertOne({
  title: "Script de Ejemplo - Noticias",
  content: "Este es un script de ejemplo para el sistema de teleprompter.\n\nPuede contener múltiples párrafos y será leído por el talento durante la transmisión.\n\nLos scripts se organizan en categorías y pueden tener diferentes prioridades.",
  category: "Noticias",
  status: "Aprobado",
  priority: "Media",
  duration: 45,
  fontSize: null,
  scrollSpeed: null,
  producerNotes: "Script de ejemplo para pruebas del sistema",
  tags: ["ejemplo", "prueba", "noticias"],
  timesUsed: 0,
  lastUsedAt: null,
  createdBy: adminId,
  lastModifiedBy: null,
  collaborators: [],
  versions: [],
  jumpMarkers: [],
  createdAt: now,
  updatedAt: now
});

print("✅ Base de datos inicializada correctamente");
print("📊 Colecciones creadas: users, scripts, runorders, configurations, macros, collaborations, auditlogs, sessions");
print("👤 Usuario admin creado: admin@teleprompter.com");
print("🔧 Configuración por defecto creada");
print("⌨️  6 macros por defecto configurados");
print("📝 1 script de ejemplo creado");
