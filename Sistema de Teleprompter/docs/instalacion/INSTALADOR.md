# 📦 Instalador de pT Torneos portátil

## ✅ **Instalador Generado Exitosamente**

El instalador NSIS completo ha sido generado en:

```
release\Teleprompter Pro-Setup-1.0.0.exe
```

---

## 📋 **Características del Instalador**

### **Archivo Generado:**
- **Nombre:** `Teleprompter Pro-Setup-1.0.0.exe`
- **Ubicación:** `c:\xampp\htdocs\STP\Sistema de Teleprompter\release\`
- **Tamaño:** ~200 MB (incluye Electron + Node.js + Dependencias)
- **Tipo:** Instalador NSIS (Nullsoft Scriptable Install System)

### **Características del Instalador:**

✅ **Wizard de Instalación** - Interfaz gráfica paso a paso  
✅ **Ruta Personalizable** - El usuario puede elegir dónde instalar  
✅ **Icono Personalizado** - Icono `pT.png` (256x256) en el instalador  
✅ **Acceso Directo en Escritorio** - Se crea automáticamente  
✅ **Menú Inicio** - Entrada en el menú de inicio como "pT Torneos portátil"  
✅ **Desinstalador Incluido** - Desinstalación limpia desde Panel de Control  
✅ **Ejecutar al Finalizar** - Opción para abrir la app inmediatamente  
✅ **Sin Firma Digital** - (Puede aparecer advertencia de Windows Defender)

---

## 🚀 **Cómo Usar el Instalador**

### **1. Distribución:**
Puedes compartir el archivo `.exe` de estas formas:

- **USB/Pendrive** - Copia el `.exe` y compártelo físicamente
- **Email** - Adjunta el archivo (algunos servicios pueden bloquearlo por tamaño)
- **Google Drive / Dropbox / OneDrive** - Sube y comparte el enlace
- **Servidor Web** - Hospeda el archivo y comparte la URL de descarga
- **Red Local** - Comparte en carpeta compartida de red

### **2. Instalación:**

1. **Ejecuta el instalador:**
   - Doble clic en `Teleprompter Pro-Setup-1.0.0.exe`

2. **Advertencia de Windows Defender:**
   - Windows puede mostrar: _"Windows protegió tu PC"_
   - Haz clic en **"Más información"**
   - Luego clic en **"Ejecutar de todas formas"**
   - (Esto ocurre porque el ejecutable no tiene firma digital)

3. **Wizard de Instalación:**
   - **Paso 1:** Pantalla de bienvenida → Clic en **"Next"**
   - **Paso 2:** Seleccionar carpeta de instalación (default: `C:\Users\<Usuario>\AppData\Local\Programs\Teleprompter Pro\`)
   - **Paso 3:** Confirmar instalación → Clic en **"Install"**
   - **Paso 4:** Barra de progreso (copia archivos)
   - **Paso 5:** Finalización
     - ☑️ Marcar: _"Run pT Torneos portátil"_ para ejecutar inmediatamente
     - Clic en **"Finish"**

4. **Resultado:**
   - ✅ Aplicación instalada
   - ✅ Acceso directo en Escritorio
   - ✅ Entrada en Menú Inicio
   - ✅ Registro en "Agregar o quitar programas"

---

## 🗑️ **Cómo Desinstalar**

### **Método 1: Panel de Control**
1. Abre **"Configuración"** → **"Aplicaciones"** → **"Aplicaciones instaladas"**
2. Busca **"Teleprompter Pro"**
3. Clic en **"Desinstalar"**
4. Confirma la desinstalación

### **Método 2: Ejecutar Desinstalador**
1. Ve a la carpeta de instalación:
   ```
   C:\Users\<TuUsuario>\AppData\Local\Programs\Teleprompter Pro\
   ```
2. Ejecuta `Uninstall Teleprompter Pro.exe`

---

## 🔧 **Regenerar el Instalador**

Si necesitas crear un nuevo instalador (por ejemplo, después de hacer cambios):

```powershell
# 1. Cerrar app si está abierta
taskkill /F /IM "Teleprompter Pro.exe" 2>$null

# 2. Limpiar carpeta release
Remove-Item -Recurse -Force release -ErrorAction SilentlyContinue

# 3. Generar nuevo instalador
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npm run electron:build:win
```

El nuevo instalador estará en: `release\Teleprompter Pro-Setup-1.0.0.exe`

---

## 📊 **Detalles Técnicos**

### **Configuración del Instalador (package.json):**

```json
{
  "build": {
    "appId": "com.teleprompter.pro",
    "productName": "Teleprompter Pro",
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico",
      "artifactName": "${productName}-Setup-${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "allowElevation": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "pT Torneos portátil",
      "runAfterFinish": true,
      "perMachine": false
    }
  }
}
```

### **Estructura del Instalador:**
- Aplicación Electron empaquetada
- Node.js runtime incluido
- Chromium embebido
- Todas las dependencias de React/Vite
- Assets (íconos, estilos, scripts)

### **Tamaño Final:**
- **Instalador comprimido:** ~70-100 MB
- **Aplicación instalada:** ~200-250 MB

---

## ⚠️ **Notas Importantes**

### **Advertencia de Windows Defender:**
- El instalador **NO está firmado digitalmente**
- Windows Defender lo marcará como "desconocido"
- Los usuarios deben hacer clic en **"Más información"** → **"Ejecutar de todas formas"**
- Esto es normal para aplicaciones sin certificado de firma de código

### **Para Evitar la Advertencia:**
Si quieres distribuir profesionalmente sin advertencias, necesitas:

1. **Certificado de Firma de Código**
   - Costo: $200-400 USD/año
   - Proveedores: DigiCert, Sectigo, GlobalSign
   - Validación de identidad requerida

2. **Firmar el Instalador:**
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password"
   }
   ```

### **Distribución Segura:**
- Comparte el instalador a través de enlaces HTTPS
- Proporciona hash SHA256 del archivo para verificación
- Instrucciones claras sobre la advertencia de Windows

---

## 🎯 **Resultado Final**

✅ **Instalador profesional con wizard gráfico**  
✅ **Ruta de instalación personalizable**  
✅ **Accesos directos automáticos**  
✅ **Desinstalador incluido**  
✅ **Icono personalizado `pT.png`**  
✅ **Título: "pT Torneos portátil"**  
✅ **Sin dependencias externas** (todo incluido)  
✅ **Ejecutable standalone** (~100 MB)

**El instalador está listo para distribuir. 🎉**

---

**Fecha de Generación:** Octubre 1, 2025  
**Versión:** 1.0.0  
**Herramientas:** Electron 38.2.0, electron-builder 26.0.12, NSIS
