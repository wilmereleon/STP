# 💻 Documentación de Desarrollo

Documentación técnica para desarrolladores, arquitectura del sistema y guías de contribución.

## 📚 Contenido

### [🏗️ Plan de Refactorización](PLAN_REFACTORIZACION.md)
Arquitectura y estrategia de refactorización V2:
- Problemas identificados en V1
- Nueva arquitectura Store + Service Layer
- Patrones de diseño implementados
- Roadmap de refactorización

### [🔄 Guía de Migración V2](GUIA_MIGRACION_V2.md)
Guía paso a paso para migrar de V1 a V2:
- Comparativa V1 vs V2
- Migración de componentes
- Actualización de hooks
- Breaking changes
- Ejemplos de código

### [✅ Fase 1 Completada](FASE1_COMPLETADA.md)
Resumen de completación de Fase 1 (Store Layer):
- Stores implementados (3)
- Hooks creados (3)
- Componentes refactorizados
- Métricas de reducción de código

### [📊 Fase 1 Progreso](FASE1_PROGRESO.md)
Historial detallado del desarrollo de Fase 1:
- Timeline de implementación
- Decisiones técnicas
- Problemas y soluciones
- Commits principales

### [✅ Fase 2 Resumen](FASE2_RESUMEN_COMPLETADO.md)
Resumen de completación de Fase 2 (Service Layer):
- SyncService implementado
- AutoScrollService implementado
- ExcelImportService implementado
- PersistenceService implementado

### [📊 Fase 2 Progreso](FASE2_PROGRESO.md)
Historial detallado del desarrollo de Fase 2:
- Implementación de servicios
- Integración con stores
- Testing de servicios
- Optimizaciones

## 🏛️ Arquitectura del Sistema

### V2 Architecture (Actual)
```
┌─────────────────────────────────────┐
│         Components (UI)              │
│   (RunOrderPanel, TeleprompterPreview)│
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│     Hooks (useXxxStore)              │
│  (Interfaz entre UI y Store)         │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│         Stores (State)               │
│  (TeleprompterStore, RunOrderStore)  │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│       Services (Logic)               │
│ (SyncService, PersistenceService)    │
└─────────────────────────────────────┘
```

### Patrones Implementados
- **Observer Pattern** (Stores con listeners)
- **Service Layer** (Lógica de negocio desacoplada)
- **Master-Slave** (Sincronización de ventanas)
- **Persistence Layer** (Auto-save con localStorage)

## 📊 Métricas de Mejora

| Métrica | V1 | V2 | Mejora |
|---------|----|----|--------|
| Líneas de código | 1,158 | ~400 | -65% |
| useState en App | 15+ | 0 | -100% |
| Props en componentes | 5-7 | 0-2 | -70% |
| Duplicación de estado | Alta | Ninguna | -100% |

## 🛠️ Stack Técnico

- **React 18.3.1** - Framework UI
- **TypeScript** - Tipado estático
- **Zustand-like** - State management (custom)
- **Service Layer** - Lógica de negocio
- **Vite** - Build tool

## 🔗 Navegación

- [← Volver a Documentación](../README.md)
- [📖 README Principal](../../README.md)
