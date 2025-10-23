# 🧪 CHECKLIST DE TESTING - Teleprompter Pro
**Fecha:** 15 de Octubre, 2025  
**URL de Testing:** http://localhost:5174/  
**Estado del Servidor:** ✅ ACTIVO (Puerto 5174)

---

## ✅ TESTS COMPLETADOS (Código Verificado)

### 1. ✅ Separadores TXT [] y {}
- **Estado:** CÓDIGO VERIFICADO
- **Archivos:** `ScriptEditor.tsx` (líneas 117-162), `App.tsx` (líneas 253-283)
- **Funcionalidad:** Regex actualizado para soportar `[n] {TÍTULO}` y `[n]` sin título

### 2. ✅ Auto-play en Ventana Popup
- **Estado:** CÓDIGO VERIFICADO
- **Archivos:** `TeleprompterWindow.tsx` (líneas 123-147)
- **Funcionalidad:** Dos triggers implementados (conexión + cambio de texto)

### 3. ✅ Layout Responsivo
- **Estado:** CÓDIGO VERIFICADO
- **Archivos:** `App.tsx` (líneas 399-428)
- **Funcionalidad:** Sistema simplificado con `min-h-0`, altura automática en paneles

### 4. ✅ Scroll en TeleprompterScreen
- **Estado:** CÓDIGO VERIFICADO
- **Archivos:** `TeleprompterScreen.tsx` (líneas 1-5, 263-277), `TeleprompterScreen.css` (NUEVO)
- **Funcionalidad:** `overflow-y-auto` + scrollbar oculto en todos los navegadores

### 5. ✅ Edición Inline de Títulos
- **Estado:** CÓDIGO VERIFICADO
- **Archivos:** `RunOrderPanel.tsx`
- **Funcionalidad:** Doble-clic, botón editar, Enter/Blur/Escape

### 6. ✅ Cleanup de Archivos Versionados
- **Estado:** COMPLETADO
- **Commit:** `d713cda` (10 archivos .v1/.v2 eliminados)

---

## 📋 TESTS PENDIENTES (Requieren Interacción Manual)

### TEST 1: 📂 Carga de Archivo TXT con Múltiples Scripts

**Objetivo:** Verificar que `ejemplo_teleprompter.txt` crea 5 scripts en Run Order

**Archivo de Prueba:** `src/ejemplo_teleprompter.txt` ✅ EXISTE (5 scripts)

**Scripts Esperados:**
1. `INTRO/TECH SCRIPTS ROLLING`
2. `INTRO/VTR`
3. `PRE-OIL GETTING THINGS GOING`
4. `NO PROBLEMS`
5. `SUPPORT`

**Pasos:**
1. Abre http://localhost:5174/
2. En el **panel central** (ScriptEditor), busca el botón **"Upload"** o **"Cargar archivo"**
3. Selecciona el archivo: `c:\xampp\htdocs\STP\Sistema de Teleprompter\src\ejemplo_teleprompter.txt`
4. Verifica que aparezcan **5 items** en el **panel izquierdo** (Run Order)
5. Verifica que los títulos coincidan con los esperados arriba

**Consola (Chrome DevTools):**
```
📄 App: loading 5 scripts from "ejemplo_teleprompter"
✅ App: 5 scripts added to Run Order
```

**Criterios de Éxito:**
- ✅ 5 items aparecen en Run Order
- ✅ Títulos extraídos correctamente de `{...}`
- ✅ Primer script se activa automáticamente
- ✅ Texto del primer script aparece en el editor
- ✅ Toast de confirmación: "✅ 5 scripts loaded from 'ejemplo_teleprompter'"

**Resultado:** [ ] PENDIENTE

---

### TEST 2: ▶️ Auto-play y Sincronización en Popup

**Objetivo:** Verificar que ventana popup auto-inicia reproducción y sincroniza cambios

**Pasos:**
1. Con scripts cargados, ve al **panel derecho** (TeleprompterPreview)
2. Haz clic en **"Nueva Ventana"** o **"Abrir Ventana Flotante"**
3. Se abre una ventana popup nueva
4. **ESPERA 500ms** (medio segundo)
5. Verifica que el indicador cambie de `⏸ Pausado` a `▶ Reproduciendo`
6. Verifica que el texto **comienza a scrollear automáticamente**

**Consola (Ventana Popup - F12):**
```
🔵 TeleprompterWindow: initializing SyncService in SLAVE mode
✅ TeleprompterWindow: connected to master
▶️ TeleprompterWindow: auto-starting playback
📄 TeleprompterWindow: text updated
```

**Test de Sincronización:**
1. En la **ventana principal**, haz clic en un **script diferente** en Run Order
2. En la **ventana popup**, verifica que:
   - ✅ El texto cambia al nuevo script
   - ✅ El scroll se resetea al inicio
   - ✅ La reproducción reinicia automáticamente

**Consola (Ventana Popup):**
```
▶️ TeleprompterWindow: auto-starting on new text
```

**Criterios de Éxito:**
- ✅ Ventana popup se abre correctamente
- ✅ Indicador de conexión: punto verde pulsante + "Conectado"
- ✅ Auto-play después de 500ms
- ✅ Texto scrollea suavemente
- ✅ Cambio de script sincroniza texto
- ✅ Scroll se resetea en cambio de script
- ✅ Reproducción reinicia automáticamente

**Resultado:** [ ] PENDIENTE

---

### TEST 3: ✏️ Edición Inline de Títulos

**Objetivo:** Verificar que se puede renombrar scripts con doble-clic o botón editar

**Pasos:**

**Método 1: Doble-Clic**
1. En **Run Order** (panel izquierdo), busca cualquier script
2. **Doble-clic** en el título del script
3. El título se convierte en un **input field** (campo de texto)
4. Escribe un nuevo nombre: `"Mi Script Renombrado"`
5. Presiona **Enter**
6. Verifica que aparece un **toast**: `"Script renombrado"` ✅
7. Verifica que el título se actualiza en la lista

**Consola:**
```
✏️ RunOrderPanel: starting edit for item <id>
✅ RunOrderPanel: title updated for item <id>
```

**Método 2: Botón Editar (✏️)**
1. Haz clic en el **icono de lápiz** (✏️) junto a un script
2. El título se convierte en input field
3. Escribe nuevo nombre
4. Haz clic **fuera del input** (blur)
5. Verifica toast y actualización

**Método 3: Cancelar con Escape**
1. Activa edición (doble-clic o botón)
2. Escribe algo
3. Presiona **Escape**
4. Verifica que **NO** aparece toast
5. Verifica que el título **NO** cambia (mantiene el original)

**Consola:**
```
🚫 RunOrderPanel: canceling edit
```

**Criterios de Éxito:**
- ✅ Doble-clic activa modo edición
- ✅ Botón editar (✏️) activa modo edición
- ✅ Input tiene auto-focus
- ✅ Enter guarda cambios + toast
- ✅ Blur (click fuera) guarda cambios + toast
- ✅ Escape cancela sin guardar (sin toast)
- ✅ Título se actualiza inmediatamente en UI

**Resultado:** [ ] PENDIENTE

---

### TEST 4: 📱 Responsive Layout en Diferentes Tamaños

**Objetivo:** Verificar que layout se adapta correctamente en móvil y desktop

**Pasos:**

**Test Desktop (≥768px):**
1. Abre http://localhost:5174/
2. Maximiza la ventana del navegador (o hazla ≥768px de ancho)
3. Verifica que los **3 paneles** se muestran **horizontalmente** (lado a lado):
   - 📋 **Izquierda:** Run Order (~320px)
   - ✍️ **Centro:** Script Editor (flexible, ocupa espacio restante)
   - 📺 **Derecha:** Teleprompter Preview (~384px)
4. Verifica que **NO hay scroll horizontal**
5. Verifica que cada panel ocupa **100% de altura** de la ventana

**Test Móvil (<768px):**
1. Abre Chrome DevTools (F12)
2. Activa **Device Toolbar** (Ctrl+Shift+M)
3. Selecciona un dispositivo móvil (ej: iPhone 12)
4. O redimensiona manualmente la ventana a **<768px** de ancho
5. Verifica que los **3 paneles** se apilan **verticalmente**:
   - 📋 **Run Order** (arriba, 256px altura)
   - ✍️ **Script Editor** (medio, flexible)
   - 📺 **Preview** (abajo, 256px altura)
6. Verifica que cada panel tiene **scroll vertical interno** si el contenido es largo

**Breakpoint Test:**
1. Redimensiona la ventana **gradualmente** cruzando los 768px
2. Verifica la transición suave entre layouts
3. El cambio debe ocurrir exactamente en **768px**

**Criterios de Éxito:**
- ✅ Desktop (≥768px): 3 paneles horizontales
- ✅ Desktop: Paneles ocupan 100% altura
- ✅ Desktop: Sin scroll horizontal en viewport
- ✅ Móvil (<768px): 3 paneles verticales
- ✅ Móvil: Paneles laterales limitados a 256px altura
- ✅ Transición suave en breakpoint 768px
- ✅ Sin elementos rotos o superpuestos

**Herramientas:**
- Chrome DevTools > Device Toolbar (Ctrl+Shift+M)
- Responsive Design Mode en Firefox (Ctrl+Shift+M)

**Resultado:** [ ] PENDIENTE

---

### TEST 5: 📜 Scroll en Ventana del Teleprompter

**Objetivo:** Verificar que scroll funciona correctamente y scrollbar está oculto

**Pasos:**

**Test 1: Scroll con Rueda del Mouse**
1. Abre ventana popup del teleprompter
2. Posiciona el mouse sobre el texto
3. Usa la **rueda del mouse** para scrollear
4. Verifica que el texto se desplaza **suavemente**
5. Verifica que **NO se ve la barra de scroll** (debe estar oculta)

**Test 2: Wheel Controls**
1. **Ctrl + Rueda del Mouse**: Cambia **velocidad** (±0.1x)
   - Verifica el indicador en esquina inferior derecha
   - Verifica que la reproducción **inicia automáticamente** si estaba pausada
2. **Shift + Rueda del Mouse**: Cambia **tamaño de fuente** (±8px)
   - Verifica el indicador: "Fuente: XXpx"
3. **Rueda sola**: Scroll manual (60px por step)
   - Verifica que la reproducción **se pausa** al hacer scroll manual
4. **Alt + Rueda**: Scroll fino (20px por step)

**Consola:**
```
🖱️ TeleprompterWindow: speed change requested 1.0 → 1.1
🖱️ TeleprompterWindow: fontSize change requested 200 → 208
🖱️ TeleprompterWindow: scroll change requested 0 → 60
```

**Test 3: Auto-Scroll**
1. Haz clic en **Play** (▶️) en los controles superiores
2. Verifica que el texto scrollea **automáticamente**
3. Verifica que es **suave y fluido** (no salta)
4. Verifica la velocidad en indicador inferior
5. Haz clic en **Pause** (⏸) - debe detenerse

**Test 4: Scrollbar Oculto en Todos los Navegadores**

**Chrome/Edge:**
1. Abre ventana popup
2. Inspecciona con DevTools (F12)
3. Verifica que `.teleprompter-screen::-webkit-scrollbar { display: none }` está aplicado
4. Confirma que NO se ve barra de scroll

**Firefox:**
1. Abre ventana popup
2. Inspecciona con DevTools (F12)
3. Verifica estilos inline: `scrollbarWidth: 'none'`
4. Confirma que NO se ve barra de scroll

**Test 5: Scroll Hasta el Final**
1. Activa reproducción
2. Deja que llegue al **final del texto**
3. Verifica que la reproducción **se detiene** automáticamente
4. Verifica que el indicador cambia a `⏸ Pausado`

**Criterios de Éxito:**
- ✅ Scroll con rueda funciona suavemente
- ✅ Scrollbar completamente oculto (todos navegadores)
- ✅ Ctrl+Wheel cambia velocidad
- ✅ Shift+Wheel cambia tamaño de fuente
- ✅ Wheel solo hace scroll manual y pausa
- ✅ Alt+Wheel hace scroll fino
- ✅ Auto-scroll funciona correctamente
- ✅ Reproducción se detiene al final
- ✅ Scroll manual pausa reproducción

**Resultado:** [ ] PENDIENTE

---

## 🏗️ BUILD FINAL

### TEST 6: Build de Producción

**Objetivo:** Verificar que el proyecto compila sin errores para producción

**Comando:**
```bash
cd "c:\xampp\htdocs\STP\Sistema de Teleprompter"
npm run build
```

**Verificaciones:**
1. Verifica que **NO** hay errores TypeScript
2. Verifica que **NO** hay errores de ESLint
3. Verifica que el bundle se genera en `dist/`
4. Anota el **tamaño del bundle** (debe ser ~800-900 KB)

**Output Esperado:**
```
✓ built in XXXms
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js        XXX.XX kB │ gzip: XXX.XX kB
dist/assets/index-XXXXX.css       XXX.XX kB │ gzip: XX.XX kB
✓ Build completed successfully
```

**Criterios de Éxito:**
- ✅ 0 errores TypeScript
- ✅ 0 errores ESLint
- ✅ Archivos generados en `dist/`
- ✅ Tamaño razonable (~800-900 KB total)

**Resultado:** [ ] PENDIENTE

---

## 📊 RESUMEN DE RESULTADOS

| # | Test | Estado | Notas |
|---|------|--------|-------|
| 1 | Carga TXT Múltiples Scripts | [ ] | 5 scripts esperados |
| 2 | Auto-play y Sincronización | [ ] | Popup + cambio script |
| 3 | Edición Inline Títulos | [ ] | Doble-clic + botón + Escape |
| 4 | Responsive Layout | [ ] | <768px vertical, ≥768px horizontal |
| 5 | Scroll en Teleprompter | [ ] | Wheel + controls + scrollbar oculto |
| 6 | Build de Producción | [ ] | npm run build sin errores |

---

## 🐛 BUGS ENCONTRADOS

*Documentar aquí cualquier bug encontrado durante el testing:*

### Bug #X: [Título del Bug]
- **Descripción:** 
- **Pasos para Reproducir:**
- **Comportamiento Esperado:**
- **Comportamiento Actual:**
- **Screenshots/Console Logs:**
- **Prioridad:** [ ] Crítico | [ ] Alto | [ ] Medio | [ ] Bajo

---

## ✅ CHECKLIST FINAL

Marca cada item cuando esté completado:

- [ ] TEST 1: Carga de archivo TXT con 5 scripts
- [ ] TEST 2: Auto-play en ventana popup (500ms + cambio texto)
- [ ] TEST 3: Edición inline de títulos (3 métodos)
- [ ] TEST 4: Responsive layout (móvil + desktop)
- [ ] TEST 5: Scroll en teleprompter (rueda + controls + scrollbar oculto)
- [ ] TEST 6: Build de producción exitoso
- [ ] Todos los bugs críticos resueltos
- [ ] Commit final creado
- [ ] Documentación actualizada

---

## 📝 NOTAS ADICIONALES

*Espacio para notas, observaciones o mejoras sugeridas:*

---

**Última Actualización:** 15 de Octubre, 2025  
**Versión:** 2.0.0  
**Testeado por:** [Tu Nombre]
