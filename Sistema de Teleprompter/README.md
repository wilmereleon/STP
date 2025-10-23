# 📜 Sistema de Teleprompter Profesional

Sistema de teleprompter estilo Winplus diseñado para entornos de producción de televisión y broadcasting.

## 🚀 Instalación y Ejecución

### Modo Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se ejecutará en `http://localhost:5173/`

### Modo Producción (Electron)

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

- **React 18.3.1** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server
- **Electron 38.2.0** - Empaquetado desktop
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes de UI

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
  