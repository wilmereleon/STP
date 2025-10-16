# ✅ Checklist para Generar Instalador Funcional

## 📋 Estado Actual

**Versión:** 2.0.0-alpha  
**Fecha:** Octubre 15, 2025  
**Última compilación exitosa:** ✅ Sí (825 KB)

---

## 🎯 Cambios Importantes en FASE 2

### 1. **PersistenceService ahora usa localStorage** (era `fs`)
- ✅ **Navegador**: Funciona perfectamente con localStorage
- ⚠️ **Electron**: Requiere verificación

**Impacto en Instalador:**
- Si Electron tiene localStorage (lo tiene), funciona sin cambios
- Si NO, necesitamos crear un PersistenceService específico para Electron

### 2. **ExcelImportService usa FileReader API** (era `fs`)
- ✅ **Navegador**: Funciona con input file
- ⚠️ **Electron**: Los métodos `fs` están comentados

**Impacto en Instalador:**
- FileReader API funciona en Electron
- Si se necesita leer archivos directamente del sistema, descomentar métodos con `fs`

### 3. **SyncService usa postMessage** (ventanas popup)
- ✅ **Navegador**: Funciona con window.open()
- ⚠️ **Electron**: Requiere BrowserWindow de Electron

**Impacto en Instalador:**
- Electron puede abrir ventanas con BrowserWindow
- Verificar que postMessage funcione entre BrowserWindows

---

## 🔍 Testing Antes de Generar Instalador

### Paso 1: Testing en Navegador (✅ HECHO)

```bash
cd "Sistema de Teleprompter"
npm run dev
```

**Checklist:**
- [x] Aplicación carga sin errores
- [ ] Controles de transporte funcionan (Play/Pause/Reset)
- [ ] Importar Excel funciona
- [ ] localStorage guarda datos (verificar en DevTools)
- [ ] Ventana popup se abre y sincroniza
- [ ] Atajos de teclado funcionan

### Paso 2: Testing Build de Producción

```bash
npm run build
npm run preview
```

**Checklist:**
- [ ] Build compila sin errores
- [ ] Preview funciona igual que dev
- [ ] localStorage persiste entre recargas
- [ ] Tamaño del bundle es aceptable (<1MB)

### Paso 3: Testing con Electron (ANTES de generar instalador)

```bash
npm run electron:dev
```

**Checklist:**
- [ ] Aplicación abre ventana de Electron
- [ ] localStorage funciona en Electron
- [ ] Importar Excel funciona con FileReader
- [ ] Ventanas popup se abren como BrowserWindow
- [ ] postMessage funciona entre ventanas
- [ ] Cierre de ventanas no causa crashes

### Paso 4: Generar Build de Electron

```bash
npm run electron:build
```

**Checklist:**
- [ ] Build compila sin errores
- [ ] No warnings de módulos faltantes (fs, path)
- [ ] package.json tiene todas las dependencias
- [ ] electron-builder config es correcta

### Paso 5: Testing Instalador

```bash
# El instalador está en: release/Teleprompter Pro-Setup-x.x.x.exe
```

**Checklist:**
- [ ] Instalador se ejecuta sin errores
- [ ] Aplicación instalada abre correctamente
- [ ] localStorage persiste datos
- [ ] Importar Excel funciona
- [ ] Ventanas popup funcionan
- [ ] No hay errores en consola

---

## 🛠️ Posibles Problemas y Soluciones

### Problema 1: localStorage no funciona en Electron

**Síntoma:**
```
Error: localStorage is not defined
```

**Solución:**
```typescript
// En electron/main.js
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    // localStorage está disponible por defecto
  }
});
```

### Problema 2: FileReader no funciona en Electron

**Síntoma:**
```
Error: FileReader is not defined
```

**Solución:**
FileReader debería funcionar en Electron. Si no:
1. Descomentar métodos con `fs` en ExcelImportService.ts
2. Agregar `fs` y `path` a electron/preload.js
3. Exponer métodos vía contextBridge

### Problema 3: postMessage no funciona entre ventanas

**Síntoma:**
```
Error: Cannot read property 'postMessage' of undefined
```

**Solución:**
```javascript
// En electron/main.js
const childWindow = new BrowserWindow({
  parent: mainWindow,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true
  }
});

// postMessage funciona entre BrowserWindows del mismo origen
```

### Problema 4: Build incluye módulos de Node.js

**Síntoma:**
```
Error: Cannot find module 'fs'
Error: Cannot find module 'path'
```

**Solución:**
1. Verificar que `fs` y `path` NO estén importados en archivos de build
2. Si se necesitan, deben estar SOLO en electron/main.js o preload.js
3. Actualizar vite.config.ts:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'electron']
    }
  }
});
```

---

## 📦 Comandos para Generar Instalador

### Opción 1: Build Simple (Windows)

```bash
cd "Sistema de Teleprompter"
npm run build
npm run electron:build:win
```

### Opción 2: Build con Scripts (recomendado)

```bash
cd "Sistema de Teleprompter"

# 1. Limpiar builds anteriores
Remove-Item -Recurse -Force dist, release -ErrorAction SilentlyContinue

# 2. Build web
npm run build

# 3. Build Electron
npm run electron:build

# El instalador está en: release/Teleprompter Pro-Setup-x.x.x.exe
```

### Opción 3: Build con Testing

```bash
# 1. Testing en dev
npm run dev
# Probar manualmente

# 2. Build y preview
npm run build
npm run preview
# Probar manualmente

# 3. Build Electron
npm run electron:build

# 4. Instalar y probar
cd release
Start-Process "Teleprompter Pro-Setup-1.0.0.exe"
```

---

## ✅ Checklist Final Antes de Distribuir

### Pre-Build
- [ ] Código compila sin errores TypeScript
- [ ] Build web funciona (`npm run build`)
- [ ] No hay console.log innecesarios en producción
- [ ] Versión actualizada en package.json

### Post-Build
- [ ] Instalador se genera correctamente
- [ ] Instalador se ejecuta sin errores
- [ ] Aplicación instalada funciona
- [ ] localStorage persiste datos entre sesiones
- [ ] Excel import funciona
- [ ] Ventanas popup funcionan y sincronizan
- [ ] No hay crashes al cerrar

### Testing en PC Limpio
- [ ] Instalar en PC sin Node.js
- [ ] Instalar en PC sin dependencias de desarrollo
- [ ] Verificar que no requiere runtime adicional
- [ ] Verificar que localStorage funciona
- [ ] Verificar todas las funcionalidades

---

## 📝 Notas Importantes

### localStorage en Electron

Electron guarda localStorage en:
```
%APPDATA%\Teleprompter Pro\Local Storage\
```

Si quieres cambiar la ubicación:
```javascript
// En electron/main.js
app.setPath('userData', 'C:\\tu\\ruta\\personalizada');
```

### Debugging Instalador

Si el instalador falla:
1. Ejecutar desde terminal para ver errores:
   ```bash
   .\Teleprompter-Pro-Setup-1.0.0.exe --verbose
   ```

2. Verificar logs de Electron:
   ```
   %APPDATA%\Teleprompter Pro\logs\
   ```

3. Abrir DevTools en Electron:
   ```javascript
   // En electron/main.js
   mainWindow.webContents.openDevTools();
   ```

### Rollback si Falla

Si el instalador no funciona:
1. Revertir cambios:
   ```bash
   git checkout [commit-anterior]
   ```

2. Usar versión v1 (backup):
   ```bash
   git checkout origin/master
   # O restaurar archivos .v1.tsx manualmente
   ```

---

## 🚀 Próximos Pasos Recomendados

1. **Testing Navegador** (5-10 minutos)
   - Probar todas las funcionalidades en http://localhost:5173/
   - Verificar localStorage en DevTools

2. **Testing Build** (2-3 minutos)
   - `npm run build && npm run preview`
   - Verificar que funciona igual que dev

3. **Testing Electron Dev** (5-10 minutos)
   - `npm run electron:dev` (si existe el script)
   - Verificar que Electron abre correctamente
   - Probar funcionalidades críticas

4. **Generar Instalador** (2-5 minutos)
   - `npm run electron:build`
   - Esperar a que termine

5. **Testing Instalador** (10-15 minutos)
   - Instalar en PC
   - Probar todas las funcionalidades
   - Verificar persistencia de datos

6. **Testing PC Limpio** (Opcional, 15-30 minutos)
   - Instalar en VM o PC sin dependencias
   - Verificar funcionamiento completo

---

**Última actualización:** Octubre 15, 2025  
**Estado:** ✅ Código listo, pendiente testing completo  
**Siguiente paso:** Testing en navegador (localhost:5173)
