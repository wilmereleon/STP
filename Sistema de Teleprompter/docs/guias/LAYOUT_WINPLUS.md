# 🎨 Layout WinPlus - Documentación

## Diseño Implementado

Basado en: `Diseño/Teleprompter_estilo_Winplus.png`

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOOLBAR SUPERIOR (MainToolbar)                │
│  [Abrir] [Guardar] | [◀] [⏮] [▶] [⏸] [⏹] | [PROMPTING] [⛶] [⚙] │
├──────────┬──────────────────────────────────────┬────────────────┤
│          │                                      │                │
│   RUN    │            EDITOR                    │    PREVIEW     │
│  ORDER   │           CENTRAL                    │                │
│          │                                      │                │
│  280px   │           flex-1                     │     400px      │
│  ancho   │          dinámico                    │     ancho      │
│  fijo    │                                      │     fijo       │
│          │                                      │                │
│  Lista   │  ScriptEditor                        │ Teleprompter   │
│  scripts │  - Texto editable                    │   Preview      │
│  con     │  - Upload TXT                        │ - Controles    │
│  drag &  │  - Toolbar editor                    │ - Preview text │
│  drop    │  - Título actual                     │ - Abrir window │
│          │                                      │                │
│ border-r │          border-r                    │                │
└──────────┴──────────────────────────────────────┴────────────────┘
```

## Características del Layout

### 🎛️ Toolbar Superior
- **Componente**: `MainToolbar`
- **Altura**: Auto (flex-shrink-0)
- **Border**: `border-b` (separación visual)
- **Controles**:
  - Izquierda: Abrir, Guardar
  - Centro: Play, Pause, Stop, Anterior, Siguiente, Tiempo
  - Derecha: Indicador PROMPTING, Fullscreen, Settings

### 📋 Panel Izquierdo (Run Order)
- **Ancho**: `280px` (fijo)
- **Componente**: `RunOrderPanel`
- **Border**: `border-r`
- **Funciones**:
  - Lista de scripts
  - Drag & Drop para reordenar
  - Edición inline de títulos
  - Import desde Excel
  - Botones: Import Excel, Add

### ✏️ Panel Central (Editor)
- **Ancho**: `flex-1` (dinámico, ocupa espacio restante)
- **Componente**: `ScriptEditor`
- **Border**: `border-r`
- **Funciones**:
  - Editor de texto rich
  - Upload de archivos TXT
  - Toolbar de edición
  - Muestra título del script actual
  - Soporte para macros

### 📺 Panel Derecho (Preview)
- **Ancho**: `400px` (fijo)
- **Componente**: `TeleprompterPreview`
- **Funciones**:
  - Preview del teleprompter
  - Controles de reproducción
  - Ajuste de velocidad
  - Ajuste de tamaño de fuente
  - Botón "Abrir Nueva Ventana"
  - Botón "Abrir Modal"

## Código de Implementación

### App.tsx - Estructura Principal

```tsx
<div className="h-screen flex flex-col bg-background">
  {/* TOOLBAR SUPERIOR */}
  <div className="flex-shrink-0 border-b">
    <MainToolbar {...props} />
  </div>

  {/* 3 PANELES HORIZONTALES */}
  <div className="flex-1 flex flex-row gap-0 min-h-0 overflow-hidden">
    
    {/* PANEL IZQUIERDO - 280px */}
    <div className="w-[280px] flex-shrink-0 border-r h-full overflow-hidden">
      <RunOrderPanel />
    </div>
    
    {/* PANEL CENTRAL - flex-1 */}
    <div className="flex-1 min-w-0 h-full overflow-hidden border-r">
      <ScriptEditor />
    </div>
    
    {/* PANEL DERECHO - 400px */}
    <div className="w-[400px] flex-shrink-0 h-full overflow-hidden">
      <TeleprompterPreview />
    </div>
  </div>
</div>
```

## Características Técnicas

### 📐 Dimensiones
- **Viewport**: 100vh (pantalla completa)
- **Sin padding global**: Diseño edge-to-edge
- **Sin gaps**: `gap-0` entre paneles
- **Separadores**: `border-r` entre paneles

### 🎯 Flexbox
- **Contenedor principal**: `flex flex-col` (vertical)
- **Contenedor paneles**: `flex flex-row` (horizontal)
- **Panel izquierdo**: `flex-shrink-0` (no se reduce)
- **Panel central**: `flex-1 min-w-0` (flexible, puede reducirse)
- **Panel derecho**: `flex-shrink-0` (no se reduce)

### 🌊 Overflow
- **Contenedor paneles**: `overflow-hidden`
- **Cada panel**: `overflow-hidden` (manejan su propio scroll internamente)

### 📱 Responsive
- **Desktop-only**: No hay breakpoints móviles
- **Diseño fijo**: Pensado para pantallas ≥1280px
- **Sin adaptación móvil**: WinPlus es software de escritorio

## Diferencias con Layout Anterior

### ❌ Antes (Layout Responsive)
```tsx
<div className="flex-1 flex flex-col md:flex-row gap-2 p-2 min-h-0">
  <div className="w-full h-64 md:h-auto md:w-80">...</div>
  <div className="flex-1 min-w-0 min-h-0">...</div>
  <div className="w-full h-64 md:h-auto md:w-96">...</div>
</div>
```
- ❌ Sin toolbar superior
- ❌ Con padding (p-2)
- ❌ Con gaps (gap-2)
- ❌ Responsive (flex-col md:flex-row)
- ❌ Anchos variables (md:w-80, md:w-96)

### ✅ Ahora (Layout WinPlus)
```tsx
<div className="flex-shrink-0 border-b">
  <MainToolbar />
</div>
<div className="flex-1 flex flex-row gap-0 min-h-0 overflow-hidden">
  <div className="w-[280px] flex-shrink-0 border-r">...</div>
  <div className="flex-1 min-w-0 border-r">...</div>
  <div className="w-[400px] flex-shrink-0">...</div>
</div>
```
- ✅ Toolbar superior fijo
- ✅ Sin padding (edge-to-edge)
- ✅ Sin gaps (gap-0)
- ✅ Desktop-only (flex-row fijo)
- ✅ Anchos fijos WinPlus (280px, 400px)
- ✅ Bordes verticales (border-r)

## Testing Checklist

### ✅ Visual
- [ ] Toolbar superior visible y funcional
- [ ] 3 paneles alineados horizontalmente
- [ ] Panel izquierdo exactamente 280px
- [ ] Panel derecho exactamente 400px
- [ ] Panel central ocupa espacio restante
- [ ] Bordes verticales entre paneles
- [ ] Sin gaps ni padding
- [ ] Altura completa 100vh

### ✅ Funcional
- [ ] Botones del toolbar responden
- [ ] Play/Pause funciona
- [ ] Anterior/Siguiente cambia scripts
- [ ] Fullscreen abre ventana popup
- [ ] Run Order muestra scripts
- [ ] Editor permite escribir
- [ ] Preview muestra texto
- [ ] Scroll funciona en cada panel

## Próximos Pasos

1. ✅ Layout WinPlus implementado
2. ⏳ Testing visual completo
3. ⏳ Testing funcional de todos los controles
4. ⏳ Refinamiento de estilos según feedback
5. ⏳ Build final y documentación

---

**Commit**: `ab7a663` - 🎨 Layout: Implementado diseño WinPlus con toolbar superior
**Fecha**: 2025-10-17
**Basado en**: `Diseño/Teleprompter_estilo_Winplus.png`
