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

## 📖 Recursos Adicionales

- `PRUEBAS_FUNCIONALES.md` - Casos de prueba detallados (48 pruebas)
- `test-form.html` - Formulario interactivo de pruebas
- `INSTALADOR.md` - Guía de generación del instalador
- `Attributions.md` - Créditos y licencias

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
  