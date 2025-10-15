# 🔧 Configuración Electron para PersistenceService

## 📋 Requisito

El `PersistenceService` necesita acceso a `app.getPath('userData')` desde Electron para determinar dónde guardar los archivos.

---

## ⚙️ Paso 1: Modificar `electron/main.js`

Agrega el siguiente handler IPC:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');

// ... código existente ...

// Handler para obtener userDataPath
ipcMain.handle('get-user-data-path', () => {
  const path = app.getPath('userData');
  console.log('📁 userDataPath:', path);
  return path;
});

// ... resto del código ...
```

---

## 🔌 Paso 2: Crear/Modificar Preload Script

Si no existe, crea `electron/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs de Electron al renderer
contextBridge.exposeInMainWorld('electron', {
  /**
   * Obtiene el path de userData de Electron
   * @returns {Promise<string>} Path completo al directorio userData
   */
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  /**
   * Abre un diálogo de selección de archivos
   * @param {object} options - Opciones del diálogo
   * @returns {Promise<string[]>} Paths de archivos seleccionados
   */
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  
  /**
   * Abre un diálogo de guardar archivo
   * @param {object} options - Opciones del diálogo
   * @returns {Promise<string>} Path donde guardar
   */
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options)
});
```

**Actualiza `electron/main.js` para usar el preload:**

```javascript
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,  // Seguridad
      contextIsolation: true,  // Seguridad
      preload: path.join(__dirname, 'preload.js')  // <-- AGREGAR ESTA LÍNEA
    }
  });
  
  // ... resto del código ...
}
```

---

## 📂 Paso 3: Agregar Handlers para Diálogos (Opcional pero Recomendado)

Para importar Excel, agrega estos handlers en `electron/main.js`:

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

// Handler para abrir diálogo de archivos
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: options?.filters || [],
    ...options
  });
  
  return result.filePaths;
});

// Handler para guardar archivo
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog({
    filters: options?.filters || [],
    ...options
  });
  
  return result.filePath;
});
```

---

## ✅ Paso 4: Verificar Integración

### En el código React/TypeScript:

```typescript
// Verificar que window.electron esté disponible
if (typeof window !== 'undefined' && (window as any).electron) {
  console.log('✅ Electron APIs disponibles');
  
  // Probar obtener userDataPath
  (window as any).electron.getUserDataPath().then((path: string) => {
    console.log('📁 userDataPath:', path);
  });
} else {
  console.warn('⚠️ Electron APIs NO disponibles (modo desarrollo web?)');
}
```

### Paths esperados por plataforma:

**Windows:**
```
C:\Users\[usuario]\AppData\Roaming\Teleprompter Pro\
```

**macOS:**
```
~/Library/Application Support/Teleprompter Pro/
```

**Linux:**
```
~/.config/Teleprompter Pro/
```

---

## 🐛 Troubleshooting

### Problema: "electron is undefined"
**Solución:** Verifica que:
1. El preload script esté cargando correctamente
2. `contextIsolation: true` está configurado
3. El build de Electron incluye el preload.js

### Problema: "Cannot find module 'fs'"
**Solución:** 
- `fs` es un módulo de Node.js, solo funciona en Electron
- No funcionará en desarrollo con Vite sin Electron
- Usa el fallback del `PersistenceService`:
  ```typescript
  // Fallback para desarrollo sin Electron
  this.userDataPath = path.join(process.cwd(), 'user-data');
  ```

### Problema: "Acceso denegado al escribir archivos"
**Solución:**
- Verifica permisos de la carpeta userData
- En Windows, ejecuta como administrador si es necesario
- Revisa que la ruta no tenga caracteres especiales

---

## 📝 Tipos TypeScript

Crea un archivo `src/types/electron.d.ts`:

```typescript
export interface ElectronAPI {
  getUserDataPath(): Promise<string>;
  openFileDialog(options?: {
    filters?: { name: string; extensions: string[] }[];
    properties?: string[];
  }): Promise<string[]>;
  saveFileDialog(options?: {
    filters?: { name: string; extensions: string[] }[];
    defaultPath?: string;
  }): Promise<string | undefined>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
```

---

## 🚀 Ejemplo Completo de Uso

```typescript
import { persistenceService } from '@/services';
import { runOrderStore, configurationStore } from '@/stores';

async function initApp() {
  try {
    // 1. Inicializar PersistenceService
    await persistenceService.initialize();
    console.log('✅ PersistenceService inicializado');
    
    // 2. Cargar datos guardados
    const scripts = await persistenceService.loadScripts();
    runOrderStore.setItems(scripts);
    console.log(`📜 Cargados ${scripts.length} scripts`);
    
    const config = await persistenceService.loadConfig();
    if (config) {
      configurationStore.setConfig(config);
      console.log('⚙️ Configuración cargada');
    }
    
    // 3. Habilitar auto-save
    persistenceService.enableAutoSave(() => ({
      scripts: runOrderStore.getState().items,
      config: configurationStore.getState()
    }));
    console.log('💾 Auto-save habilitado (cada 30s)');
    
  } catch (error) {
    console.error('❌ Error inicializando app:', error);
  }
}

// Llamar en App.tsx
useEffect(() => {
  initApp();
  
  // Cleanup
  return () => {
    persistenceService.disableAutoSave();
  };
}, []);
```

---

## 🎯 Resultado Esperado

Después de esta configuración, deberías ver en consola:

```
📁 userDataPath: C:\Users\[usuario]\AppData\Roaming\Teleprompter Pro
💾 PersistenceService: initialized @ C:\Users\[usuario]\AppData\Roaming\Teleprompter Pro
✅ PersistenceService inicializado
📜 Cargados 0 scripts (primera vez)
💾 Auto-save habilitado (cada 30s)
```

Y en el sistema de archivos:

```
C:\Users\[usuario]\AppData\Roaming\Teleprompter Pro\
├── config.json
├── scripts.json
└── scripts/
    └── (archivos .txt individuales)
```

---

**Documentado por:** GitHub Copilot  
**Fecha:** 2025  
**Versión:** 2.0.0
