# 📘 Guía de Migración v1 → v2

## 🎯 Objetivo

Esta guía te ayudará a migrar de manera segura de los componentes v1 (con props drilling) a los componentes v2 (con Store architecture).

---

## ⚠️ Importante: Antes de Comenzar

### Pre-requisitos
- ✅ FASE 1 completa (Stores, Services, Hooks)
- ✅ FASE 2 completa (Todos los componentes v2 creados)
- ✅ 0 errores de compilación en el proyecto actual
- ✅ Todos los archivos commiteados en Git

### Backup
```powershell
# 1. Crear branch de backup
git checkout -b backup-before-v2-migration

# 2. Commitear todo
git add .
git commit -m "Backup antes de migración v2"

# 3. Crear branch para migración
git checkout -b feature/migrate-to-v2

# 4. Verificar que estás en el branch correcto
git branch
```

---

## 📋 Checklist de Migración

### Fase 1: Preparación (15 min)
- [ ] Backup completo en Git
- [ ] Verificar que v2 compila sin errores
- [ ] Leer esta guía completamente
- [ ] Tener test scripts listos (ver `test-scripts/`)

### Fase 2: Renombrado de Archivos (10 min)
- [ ] Renombrar componentes v1 → v1.backup
- [ ] Renombrar componentes v2 → nombre final
- [ ] Actualizar imports en index/main

### Fase 3: Actualización de Imports (20 min)
- [ ] Actualizar imports en App.tsx
- [ ] Actualizar imports en otros archivos
- [ ] Verificar 0 errores de compilación

### Fase 4: Testing Manual (30 min)
- [ ] Testing de cada componente
- [ ] Testing de integración
- [ ] Testing de persistencia
- [ ] Testing de sincronización

### Fase 5: Limpieza (10 min)
- [ ] Eliminar archivos v1.backup
- [ ] Limpiar código comentado
- [ ] Actualizar README

**Tiempo total estimado:** ~1.5 horas

---

## 🔄 Paso a Paso Detallado

### Paso 1: Renombrar Componentes v1 → v1.backup

**Propósito:** Mantener v1 como backup por si algo sale mal.

```powershell
# En el directorio: Sistema de Teleprompter/src/components/

# Renombrar v1 componentes
Rename-Item -Path "TeleprompterControls.tsx" -NewName "TeleprompterControls.v1.backup.tsx"
Rename-Item -Path "TeleprompterPreview.tsx" -NewName "TeleprompterPreview.v1.backup.tsx"
Rename-Item -Path "RunOrderPanel.tsx" -NewName "RunOrderPanel.v1.backup.tsx"
Rename-Item -Path "TeleprompterWindow.tsx" -NewName "TeleprompterWindow.v1.backup.tsx"

# Renombrar App.tsx (si existe en src/)
cd ..
Rename-Item -Path "App.tsx" -NewName "App.v1.backup.tsx"
```

**Verificación:**
```powershell
# Listar archivos para confirmar
Get-ChildItem -Path "src/components/" -Filter "*.v1.backup.tsx"
Get-ChildItem -Path "src/" -Filter "App.v1.backup.tsx"
```

---

### Paso 2: Renombrar Componentes v2 → Nombre Final

**Propósito:** Los componentes v2 se convierten en los oficiales.

```powershell
# En el directorio: Sistema de Teleprompter/src/components/

Rename-Item -Path "TeleprompterControls.v2.tsx" -NewName "TeleprompterControls.tsx"
Rename-Item -Path "TeleprompterPreview.v2.tsx" -NewName "TeleprompterPreview.tsx"
Rename-Item -Path "RunOrderPanel.v2.tsx" -NewName "RunOrderPanel.tsx"
Rename-Item -Path "TeleprompterWindow.v2.tsx" -NewName "TeleprompterWindow.tsx"

# Renombrar App.v2.tsx
cd ..
Rename-Item -Path "App.v2.tsx" -NewName "App.tsx"
```

**Verificación:**
```powershell
# Debe mostrar los archivos sin sufijo .v2
Get-ChildItem -Path "src/components/" -Filter "TeleprompterControls.tsx"
Get-ChildItem -Path "src/" -Filter "App.tsx"

# No debe mostrar archivos .v2
Get-ChildItem -Path "src/components/" -Filter "*.v2.tsx"
# (debe estar vacío)
```

---

### Paso 3: Actualizar Imports en App.tsx

**Propósito:** App.tsx ahora importa los componentes sin sufijo .v2.

**ANTES (App.v2.tsx):**
```tsx
import TeleprompterControls from './components/TeleprompterControls.v2';
import TeleprompterPreview from './components/TeleprompterPreview.v2';
import RunOrderPanel from './components/RunOrderPanel.v2';
import TeleprompterWindow from './components/TeleprompterWindow.v2';
```

**DESPUÉS (App.tsx):**
```tsx
import TeleprompterControls from './components/TeleprompterControls';
import TeleprompterPreview from './components/TeleprompterPreview';
import RunOrderPanel from './components/RunOrderPanel';
import TeleprompterWindow from './components/TeleprompterWindow';
```

**Acción manual:**
1. Abrir `src/App.tsx`
2. Buscar todos los imports con `.v2`
3. Reemplazar `.v2` con cadena vacía
4. Guardar archivo

**Verificación en VS Code:**
- ✅ No debe haber errores rojos en la línea de imports
- ✅ Ctrl+Click en el import debe abrir el archivo correcto

---

### Paso 4: Actualizar Otros Imports (si aplica)

**Archivos a revisar:**
- `src/main.tsx` (si importa App)
- Otros componentes que importen los refactorizados
- Tests (si existen)

**Comando para buscar imports .v2:**
```powershell
# Buscar en todo el proyecto
Get-ChildItem -Path "src/" -Recurse -Filter "*.tsx" | Select-String -Pattern "\.v2'"
```

**Si encuentra resultados:**
- Abrir cada archivo
- Reemplazar `.v2` por cadena vacía
- Guardar

---

### Paso 5: Verificar Compilación

```powershell
# Limpiar build anterior
Remove-Item -Path "dist/" -Recurse -Force -ErrorAction SilentlyContinue

# Compilar TypeScript
npm run build

# O iniciar dev server
npm run dev
```

**Resultado esperado:**
```
✓ Built in XXXms
```

**Si hay errores:**
1. Leer el mensaje de error cuidadosamente
2. Verificar que todos los imports estén correctos
3. Verificar que los archivos v2 fueron renombrados correctamente
4. Revisar `FASE2_RESUMEN_COMPLETADO.md` sección "Desafíos superados"

---

## 🧪 Testing Manual

### Test 1: Componentes Individuales

#### TeleprompterControls
```
1. Abrir aplicación
2. Panel derecho → Sección "Controles"
3. ✅ Botón Play/Pause funciona
4. ✅ Botón Reset funciona
5. ✅ Botones Speed (+/-) funcionan
6. ✅ Botones Font (+/-) funcionan
7. ✅ Iconos cambian (Play ↔ Pause)
```

#### TeleprompterPreview
```
1. Panel derecho → Preview principal
2. ✅ Texto del editor se muestra
3. ✅ CTRL + WHEEL cambia velocidad
4. ✅ SHIFT + WHEEL cambia fuente
5. ✅ WHEEL normal hace scroll manual
6. ✅ Modo manual se activa (timeout 3s)
7. ✅ Slider de fuente funciona (12-500px)
8. ✅ Presets de fuente funcionan (100/150/200/250)
9. ✅ Configuración de línea guía funciona
```

#### RunOrderPanel
```
1. Panel izquierdo → Lista de scripts
2. ✅ Botón "+" agrega nuevo ítem
3. ✅ Click en ítem lo selecciona (resaltado)
4. ✅ Botón de eliminar funciona
5. ✅ Botón "Importar desde Excel":
   - Abre selector de archivos
   - Acepta .xlsx y .xls
   - Muestra mensaje de éxito "✅ X scripts importados"
   - Lista se actualiza con scripts importados
6. ✅ Estado vacío muestra instrucciones
```

#### TeleprompterWindow (Popup)
```
1. Panel derecho → Botón "Abrir Ventana"
2. ✅ Se abre ventana popup (1920x1080)
3. ✅ Texto sincronizado con editor
4. ✅ Play/Pause sincronizado
5. ✅ Velocidad sincronizada
6. ✅ Fuente sincronizada
7. ✅ Scroll sincronizado
8. ✅ Controles de rueda de ratón funcionan:
   - CTRL + WHEEL: Velocidad
   - SHIFT + WHEEL: Fuente
   - WHEEL: Scroll (pausa automática)
9. ✅ Atajos de teclado funcionan:
   - SPACE: Play/Pause
   - R: Reset
   - ↑↓: Velocidad
   - +/-: Fuente
   - H: Ocultar controles
   - PageUp/PageDown: Scripts anterior/siguiente
10. ✅ Indicador de conexión verde (conectado)
11. ✅ Panel de atajos visible en pantalla
```

---

### Test 2: Persistencia

```
1. Agregar varios scripts en RunOrderPanel
2. Escribir texto en editor
3. Cambiar configuración (velocidad, fuente)
4. Cerrar aplicación completamente
5. Esperar 5 segundos
6. Reabrir aplicación
7. ✅ Scripts guardados están presentes
8. ✅ Texto del editor se recupera
9. ✅ Configuración se mantiene
10. ✅ No hay mensaje de error
```

---

### Test 3: Sincronización de Ventanas

```
1. Abrir ventana popup
2. En ventana PRINCIPAL:
   - Cambiar velocidad con botones
   - ✅ Velocidad se refleja en popup
3. En ventana PRINCIPAL:
   - Cambiar fuente con slider
   - ✅ Fuente se refleja en popup
4. En ventana POPUP:
   - Usar CTRL + WHEEL para velocidad
   - ✅ Velocidad se refleja en principal
5. En ventana POPUP:
   - Usar SHIFT + WHEEL para fuente
   - ✅ Fuente se refleja en principal
6. En ventana POPUP:
   - Presionar SPACE para play/pause
   - ✅ Estado se refleja en principal
7. En ventana PRINCIPAL:
   - Hacer scroll en preview
   - ✅ Scroll se refleja en popup
```

---

### Test 4: Importación Excel

**Preparar archivo de prueba:**
```
Usar: test-scripts/Script_01_Noticias_Matutinas.txt
O crear Excel con columnas:
- Columna A: Títulos de scripts
- Columna B: Texto de scripts
```

**Test:**
```
1. Click en "Importar desde Excel"
2. Seleccionar archivo .xlsx
3. ✅ Indicador de carga aparece
4. ✅ Después de 1-2 segundos:
   - Mensaje "✅ X scripts importados" aparece
   - Mensaje desaparece después de 5 segundos
5. ✅ Scripts aparecen en RunOrderPanel
6. ✅ Click en script carga su texto en editor

Test de error (archivo inválido):
1. Seleccionar archivo .txt (no Excel)
2. ✅ Mensaje de error aparece
3. ✅ No se crashea la aplicación
```

---

### Test 5: Macros

```
1. Presionar CTRL+M (o CMD+M en Mac)
2. ✅ Panel de macros aparece
3. ✅ Lista de atajos de teclado visible
4. ✅ Click en "Configuración completa"
   - Abre panel de configuración de macros
5. ✅ Presionar ESC cierra ambos paneles
```

---

## 🐛 Problemas Comunes y Soluciones

### Error 1: "Cannot find module './components/Component.v2'"

**Causa:** Import no actualizado después de renombrar.

**Solución:**
```powershell
# Buscar imports .v2
Get-ChildItem -Path "src/" -Recurse -Filter "*.tsx" | Select-String -Pattern "\.v2'"

# Abrir archivos encontrados y quitar .v2
```

---

### Error 2: "Property 'X' does not exist on type 'Y'"

**Causa:** Component interface cambió en v2.

**Solución:**
1. Revisar `FASE2_RESUMEN_COMPLETADO.md`
2. Buscar sección del componente específico
3. Ver props "Antes vs. Después"
4. Actualizar uso en tu código

**Ejemplo:**
```tsx
// ❌ ANTES (v1)
<TeleprompterControls
  isPlaying={isPlaying}
  onPlayPause={handlePlayPause}
/>

// ✅ DESPUÉS (v2)
<TeleprompterControls />
// No requiere props - usa stores
```

---

### Error 3: "X is not a function"

**Causa:** Store method no existe o nombre cambió.

**Solución:**
1. Abrir archivo del Store (e.g., `stores/TeleprompterStore.ts`)
2. Verificar nombre correcto del método
3. Actualizar tu código

**Ejemplo:**
```tsx
// ❌ INCORRECTO
const { removeItem } = useRunOrderStore();

// ✅ CORRECTO
const { deleteItem } = useRunOrderStore();
```

---

### Error 4: Ventana popup no sincroniza

**Causa:** SyncService no inicializado correctamente.

**Solución:**
1. Verificar que `App.tsx` tiene:
```tsx
useEffect(() => {
  syncService.initialize('master');
  return () => syncService.dispose();
}, []);
```

2. Verificar que `TeleprompterWindow.tsx` tiene:
```tsx
useEffect(() => {
  syncService.initialize('slave');
  return () => syncService.dispose();
}, []);
```

3. Verificar en consola del navegador:
```
SyncService: Initialized as master
SyncService: Broadcasting state...
```

---

### Error 5: Persistencia no funciona

**Causa:** `usePersistence()` no llamado en App.tsx.

**Solución:**
```tsx
// Debe estar en App.tsx
const { isInitialized, isLoading, error } = usePersistence();

// Renderizado condicional
if (isLoading) return <div>Cargando...</div>;
if (error) return <div>Error: {error}</div>;
// ... resto del JSX
```

---

### Error 6: Excel import no funciona

**Causa:** Archivo Excel con formato incorrecto.

**Solución:**
1. Verificar que Excel tiene:
   - Primera hoja con datos
   - Columna A: Títulos
   - Columna B: Textos
2. Abrir consola del navegador para ver error específico:
```javascript
console.log('[ExcelImportService] Error:', error);
```

3. Verificar formato con archivo de prueba en `test-scripts/`

---

## ✅ Verificación Final

Antes de considerar la migración completa:

### Checklist Técnica
- [ ] 0 errores de compilación TypeScript
- [ ] 0 warnings en consola del navegador
- [ ] Todos los imports actualizados
- [ ] Archivos v1.backup creados
- [ ] Git commit realizado

### Checklist Funcional
- [ ] Todos los tests manuales pasados (5/5)
- [ ] Persistencia funciona correctamente
- [ ] Sincronización de ventanas perfecta
- [ ] Excel import funciona sin errores
- [ ] Atajos de teclado responden
- [ ] No hay regresiones vs. v1

### Checklist de Usuario
- [ ] Interfaz se ve correcta
- [ ] No hay lags o delays
- [ ] Mensajes de error son claros
- [ ] Feedback visual en todas las acciones
- [ ] Experiencia fluida y natural

---

## 🗑️ Limpieza (Después de Confirmar)

**Solo después de 1 semana de uso sin problemas:**

```powershell
# Eliminar backups v1
Remove-Item -Path "src/components/TeleprompterControls.v1.backup.tsx"
Remove-Item -Path "src/components/TeleprompterPreview.v1.backup.tsx"
Remove-Item -Path "src/components/RunOrderPanel.v1.backup.tsx"
Remove-Item -Path "src/components/TeleprompterWindow.v1.backup.tsx"
Remove-Item -Path "src/App.v1.backup.tsx"

# Commit limpieza
git add .
git commit -m "Limpieza: Eliminados componentes v1 después de migración exitosa"
```

---

## 🆘 Rollback (Si algo sale mal)

**Si encuentras un bug crítico después de migrar:**

```powershell
# 1. Volver a archivos v1
Rename-Item -Path "src/components/TeleprompterControls.tsx" -NewName "TeleprompterControls.v2.tsx"
Rename-Item -Path "src/components/TeleprompterControls.v1.backup.tsx" -NewName "TeleprompterControls.tsx"

# Repetir para todos los componentes...

# 2. O revertir commit completo
git log --oneline  # Ver commits
git revert <commit-hash-de-migracion>

# 3. O volver a branch de backup
git checkout backup-before-v2-migration
```

---

## 📚 Referencias

- `FASE2_RESUMEN_COMPLETADO.md` - Detalles técnicos completos
- `FASE2_PROGRESO.md` - Historial de desarrollo
- `test-scripts/` - Scripts de prueba

---

## 💡 Consejos Finales

1. **No apresurarse:** Toma el tiempo necesario para cada fase
2. **Testear incrementalmente:** No pasar a siguiente fase si hay errores
3. **Leer mensajes de error:** TypeScript da mensajes muy precisos
4. **Usar Git:** Commitear después de cada fase exitosa
5. **Pedir ayuda:** Si algo no funciona, consultar documentación antes de modificar

---

## 🎉 ¡Éxito!

Si llegaste aquí y todos los tests pasaron:

**¡Felicitaciones! La migración a v2 está completa.** 🚀

Tu aplicación ahora tiene:
- ✅ Arquitectura moderna (Flux + Observer)
- ✅ Sin props drilling
- ✅ Persistencia automática
- ✅ Sincronización perfecta
- ✅ Código 65% más limpio

**Disfruta tu teleprompter mejorado.** 🎬

---

**Guía creada:** Octubre 15, 2025  
**Versión:** 1.0  
**Para:** Sistema de Teleprompter v2.0.0-alpha
