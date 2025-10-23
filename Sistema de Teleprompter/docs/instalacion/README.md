# 🔧 Instalación y Deploy

Guías de instalación, configuración de Electron y distribución del sistema.

## 📚 Contenido

### [📦 Instalador](INSTALADOR.md)
Guía completa para generar el instalador de Windows:
- Requisitos previos
- Configuración de Electron Builder
- Generación del instalador
- Firma digital (opcional)
- Troubleshooting

### [⚡ Electron Setup](ELECTRON_SETUP.md)
Configuración detallada de Electron:
- Estructura del proyecto Electron
- Configuración de main.js
- IPC Communication
- Ventanas múltiples
- Optimización de rendimiento

### [✅ Checklist Instalador](CHECKLIST_INSTALADOR.md)
Lista de verificación pre-release:
- Verificación de build
- Testing del instalador
- Compatibilidad de SO
- Tamaño del instalador
- Proceso de desinstalación

## 🚀 Quick Start

### Desarrollo
```bash
npm install
npm run dev
```

### Build Producción
```bash
npm run electron:build:win
```

El instalador se generará en `release/Teleprompter Pro-Setup-{version}.exe`

## 📋 Requisitos del Sistema

### Para Desarrollo
- Node.js 16.x o superior
- npm 7.x o superior
- Windows 10/11 (para build Windows)

### Para Usuario Final
- Windows 10 64-bit o superior
- 4GB RAM mínimo
- 200MB espacio en disco

## 🔗 Navegación

- [← Volver a Documentación](../README.md)
- [📖 README Principal](../../README.md)
