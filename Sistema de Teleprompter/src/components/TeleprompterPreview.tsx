// ===== IMPORTACIONES / IMPORTS =====
// Iconos de Lucide React / Lucide React icons
import { Monitor, ExternalLink, Settings, Type, Plus, Minus, Maximize, Play, Pause, RotateCcw, Target } from 'lucide-react';
// Componentes personalizados / Custom components
import { TextWithJumpMarkers } from './TextWithJumpMarkers';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { GuideLineSettings } from './GuideLineSettings';
import { ConfigurationPanel } from './ConfigurationPanel';
// Hooks de React / React hooks
import { useState, useEffect, useRef } from 'react';

// Importar tipos desde useMacros para evitar conflictos
// Import types from useMacros to avoid conflicts
import type { MacroSettings } from './useMacros';

/**
 * Propiedades del componente TeleprompterPreview
 * TeleprompterPreview component properties
 * 
 * @interface TeleprompterPreviewProps
 * @property {string} text - Texto del guion a mostrar / Script text to display
 * @property {number} fontSize - Tamaño de fuente en píxeles (12-500px) / Font size in pixels (12-500px)
 * @property {boolean} isPlaying - Estado de reproducción del teleprompter / Teleprompter playback state
 * @property {number} scrollPosition - Posición actual de scroll en píxeles / Current scroll position in pixels
 * @property {number} speed - Velocidad de scroll (0.1-5x) / Scroll speed (0.1-5x)
 * @property {() => void} onOpenTeleprompter - Callback para abrir en nueva ventana / Callback to open in new window
 * @property {() => void} [onOpenTeleprompterModal] - Callback para abrir en pantalla completa / Callback to open in fullscreen
 * @property {(size: number) => void} [onFontSizeChange] - Callback al cambiar tamaño de fuente / Callback on font size change
 * @property {() => void} [onPlayPause] - Callback para play/pause / Callback for play/pause
 * @property {() => void} [onReset] - Callback para reiniciar / Callback to reset
 * @property {string} [fileName] - Nombre del archivo del guion / Script file name
 * @property {MacroSettings} macros - Configuración de macros / Macro settings
 * @property {(macros: MacroSettings) => void} onMacrosChange - Callback al cambiar macros / Callback on macros change
 * @property {(speed: number) => void} [onSpeedChange] - Callback al cambiar velocidad / Callback on speed change
 * @property {(position: number) => void} [onScrollPositionChange] - Callback al cambiar posición de scroll / Callback on scroll position change
 * @property {(position: number) => void} [onJumpToPosition] - Callback para saltar a posición específica / Callback to jump to specific position
 */
interface TeleprompterPreviewProps {
  text: string;
  fontSize: number;
  isPlaying: boolean;
  scrollPosition: number;
  speed: number;
  onOpenTeleprompter: () => void;
  onOpenTeleprompterModal?: () => void;
  onFontSizeChange?: (size: number) => void;
  onPlayPause?: () => void;
  onReset?: () => void;
  fileName?: string;
  macros: MacroSettings;
  onMacrosChange: (macros: MacroSettings) => void;
  onSpeedChange?: (speed: number) => void;
  onScrollPositionChange?: (position: number) => void;
  onJumpToPosition?: (position: number) => void;
}

/**
 * TeleprompterPreview - Panel de vista previa y control del teleprompter
 * TeleprompterPreview - Teleprompter preview and control panel
 * 
 * Panel lateral derecho que proporciona una vista previa en miniatura del teleprompter
 * con controles completos para configuración y reproducción.
 * 
 * Right sidebar panel that provides a miniature preview of the teleprompter
 * with complete controls for configuration and playback.
 * 
 * Características principales / Main features:
 * - Vista previa en tiempo real del texto / Real-time text preview
 * - Controles de reproducción (Play/Pause/Reset) / Playback controls (Play/Pause/Reset)
 * - Ajuste de tamaño de fuente con slider y botones preestablecidos / Font size adjustment with slider and preset buttons
 * - Control de velocidad y scroll con rueda del mouse / Speed and scroll control with mouse wheel
 * - Línea guía configurable / Configurable guide line
 * - Modo de scroll manual con timeout de 3 segundos / Manual scroll mode with 3-second timeout
 * - Indicadores visuales de estado (AUTO/MANUAL) / Visual state indicators (AUTO/MANUAL)
 * - Estadísticas del sistema en tiempo real / Real-time system statistics
 * - Configuración de macros / Macro configuration
 * - Apertura en nueva ventana o pantalla completa / Open in new window or fullscreen
 * 
 * @component
 * @param {TeleprompterPreviewProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Panel de vista previa del teleprompter / Teleprompter preview panel
 */
export function TeleprompterPreview({ 
  text, 
  fontSize, 
  isPlaying, 
  scrollPosition,
  speed,
  onOpenTeleprompter, 
  onOpenTeleprompterModal, 
  onFontSizeChange,
  onPlayPause,
  onReset,
  fileName,
  macros,
  onMacrosChange,
  onSpeedChange,
  onScrollPositionChange,
  onJumpToPosition
}: TeleprompterPreviewProps) {
  // ===== ESTADO LOCAL / LOCAL STATE =====
  // Control de visibilidad de paneles / Panel visibility control
  const [showFontControls, setShowFontControls] = useState(false); // Panel de controles de fuente / Font controls panel
  const [showGuideSettings, setShowGuideSettings] = useState(false); // Panel de configuración de línea guía / Guide line settings panel
  const [showMacroConfig, setShowMacroConfig] = useState(false); // Panel de configuración de macros / Macro configuration panel
  
  // Configuración de línea guía / Guide line configuration
  const [guideLinePosition, setGuideLinePosition] = useState(50); // Posición como porcentaje (0-100) / Position as percentage (0-100)
  
  // Estado de scroll manual / Manual scroll state
  const [isManualScrolling, setIsManualScrolling] = useState(false); // true = usuario scrolleando, false = auto-scroll / true = user scrolling, false = auto-scroll
  
  // Referencias / References
  const previewRef = useRef<HTMLDivElement>(null); // Referencia al contenedor de vista previa / Reference to preview container
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout para reanudar auto-scroll / Timeout to resume auto-scroll

  // ===== EFECTOS DE DEBUG / DEBUG EFFECTS =====
  /**
   * Monitorea cambios críticos de estado para debugging
   * Monitors critical state changes for debugging
   */
  // Debug: Cambios en tamaño de fuente / Font size changes
  useEffect(() => {
    console.log('🔵 TeleprompterPreview - fontSize changed to:', fontSize);
    console.log('🔵 TeleprompterPreview - calculated CSS fontSize:', `${Math.max(12, Math.min(60, fontSize * 0.12))}px`);
  }, [fontSize]);

  // Debug: Cambios en estado de reproducción / Playback state changes
  useEffect(() => {
    console.log('🔵 TeleprompterPreview - isPlaying changed to:', isPlaying);
    if (isPlaying) {
      console.log('🔵 TeleprompterPreview - TELEPROMPTER IS NOW PLAYING!');
    } else {
      console.log('🔵 TeleprompterPreview - TELEPROMPTER IS NOW STOPPED');
    }
  }, [isPlaying]);

  // ===== MANEJADORES ESTABLES / STABLE HANDLERS =====
  /**
   * Manejadores que previenen reversión de estado
   * Handlers that prevent state reversion
   */
  
  /**
   * Maneja el toggle de Play/Pause
   * Handles Play/Pause toggle
   */
  const handlePlayPause = () => {
    console.log('TeleprompterPreview.handlePlayPause clicked, current isPlaying:', isPlaying);
    onPlayPause?.();
  };

  /**
   * Maneja el reset del teleprompter
   * Handles teleprompter reset
   */
  const handleReset = () => {
    console.log('TeleprompterPreview.handleReset clicked');
    onReset?.();
  };

  /**
   * Maneja cambios en el tamaño de fuente con límites
   * Handles font size changes with limits
   * 
   * @param {number} increment - Incremento o decremento en píxeles / Increment or decrement in pixels
   */
  const handleFontSizeChange = (increment: number) => {
    console.log('🔴 TeleprompterPreview.handleFontSizeChange:', increment, 'current size:', fontSize);
    if (onFontSizeChange) {
      const newSize = Math.max(12, Math.min(500, fontSize + increment)); // Rango: 12-500px / Range: 12-500px
      console.log('🔴 TeleprompterPreview.Setting new font size:', fontSize, '->', newSize);
      onFontSizeChange(newSize);
      
      // Forzar re-render inmediato para feedback visual / Force immediate re-render for visual feedback
      setTimeout(() => {
        console.log('🔴 FontSize changed confirmed:', fontSize);
      }, 100);
    }
  };

  // ===== MANEJADOR: CONTROL DE RUEDA DEL MOUSE / HANDLER: MOUSE WHEEL CONTROL =====
  /**
   * Maneja el control mediante rueda del mouse con 3 modos diferentes
   * Handles mouse wheel control with 3 different modes
   * 
   * **MODO 1: CTRL + WHEEL = CONTROL DE VELOCIDAD**
   * - Incrementos muy pequeños (0.1x) para control fino
   * - Rango: 0.1-5x (velocidades lentas optimizadas para lectura)
   * 
   * **MODO 2: SHIFT + WHEEL = CONTROL DE TAMAÑO DE FUENTE**
   * - Incrementos de 8px para cambios visibles
   * - Rango: 12-500px
   * 
   * **MODO 3: WHEEL NORMAL = SCROLL MANUAL**
   * - Control manual del scroll con timeout de 3 segundos
   * - Alt + Wheel = Control fino (20px en vez de 60px)
   * - Después de 3s de inactividad, vuelve a auto-scroll
   * 
   * @param {React.WheelEvent} e - Evento de rueda del mouse / Mouse wheel event
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Prevenir scroll de página / Prevent page scroll
    
    // Detectar teclas modificadoras / Detect modifier keys
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;
    const delta = e.deltaY > 0 ? 1 : -1; // 1 = abajo, -1 = arriba / 1 = down, -1 = up
    
    console.log('🖱️ Mouse wheel:', { delta, ctrl: isCtrlPressed, shift: isShiftPressed, alt: isAltPressed });
    
    if (isCtrlPressed) {
      // **MODO 1: CTRL + WHEEL = CONTROL DE VELOCIDAD / MODE 1: CTRL + WHEEL = SPEED CONTROL**
      const speedDelta = delta * 0.1; // Incrementos muy pequeños para control preciso / Very small increments for precise control
      const newSpeed = Math.max(0.1, Math.min(5, speed + speedDelta)); // Rango optimizado para lectura / Range optimized for reading
      console.log('🖱️ Speed change:', speed, '->', newSpeed);
      onSpeedChange?.(newSpeed);
    } else if (isShiftPressed) {
      // **MODO 2: SHIFT + WHEEL = CONTROL DE TAMAÑO DE FUENTE / MODE 2: SHIFT + WHEEL = FONT SIZE CONTROL**
      const fontDelta = delta * 8; // Incrementos de 8px / 8px increments
      const newFontSize = Math.max(12, Math.min(500, fontSize + fontDelta)); // Rango: 12-500px / Range: 12-500px
      console.log('🖱️ Font size change:', fontSize, '->', newFontSize);
      onFontSizeChange?.(newFontSize);
    } else {
      // **MODO 3: WHEEL NORMAL = SCROLL MANUAL / MODE 3: NORMAL WHEEL = MANUAL SCROLL**
      const scrollDelta = delta * (isAltPressed ? 20 : 60); // Control fino con Alt / Fine control with Alt
      const newScrollPosition = Math.max(0, scrollPosition + scrollDelta); // No permitir valores negativos / Don't allow negative values
      console.log('🖱️ Manual scroll:', scrollPosition, '->', newScrollPosition);
      
      // Activar modo de scroll manual / Set manual scrolling mode
      setIsManualScrolling(true);
      onScrollPositionChange?.(newScrollPosition);
      
      // Limpiar timeout existente / Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      
      // Reanudar auto-scroll después de 3 segundos de inactividad / Resume auto-scroll after 3 seconds of inactivity
      manualScrollTimeoutRef.current = setTimeout(() => {
        console.log('🖱️ Manual scroll timeout - resuming auto-scroll');
        setIsManualScrolling(false);
      }, 3000);
    }
  };

  // ===== EFECTO: SINCRONIZACIÓN DE POSICIÓN DE SCROLL / EFFECT: SCROLL POSITION SYNCHRONIZATION =====
  /**
   * Aplica la posición de scroll a la vista previa con sincronización mejorada
   * Applies scroll position to preview with enhanced synchronization
   * 
   * Escala la posición por 2.0x para mejor visibilidad en la vista previa
   * Scales position by 2.0x for better visibility in preview
   */
  useEffect(() => {
    if (previewRef.current) {
      const scaledScrollPosition = scrollPosition * 2.0; // Escala mejorada para visibilidad óptima / Enhanced scale for optimal visibility
      console.log('🟡 TeleprompterPreview scroll sync:', scrollPosition, '->', scaledScrollPosition);
      previewRef.current.scrollTop = scaledScrollPosition;
      
      // Comportamiento de scroll suave para mejor UX / Smooth scroll behavior for better UX
      if (isPlaying && scrollPosition > 0) {
        console.log('🟡 Auto-scroll ACTIVE - visible position:', scaledScrollPosition);
      }
    }
  }, [scrollPosition, isPlaying]);



  return (
    <div className="h-full bg-gray-100 border-l border-gray-300">
      {/* ===== ENCABEZADO / HEADER ===== */}
      <div className="p-3 border-b border-gray-300 bg-gray-200">
        {/* Título y botones de configuración / Title and configuration buttons */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-800">Prompter Preview: {fileName || 'How To Script'}</h3>
          <div className="flex gap-1">
            {/* Botón: Controles de fuente / Button: Font controls */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-300 p-1"
              onClick={() => setShowFontControls(!showFontControls)}
            >
              <Type className="h-4 w-4" />
            </Button>
            {/* Botón: Configuración de línea guía / Button: Guide line settings */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-300 p-1"
              onClick={() => setShowGuideSettings(!showGuideSettings)}
            >
              <Target className="h-4 w-4" />
            </Button>
            {/* Botón: Configuración de macros / Button: Macro configuration */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-300 p-1"
              onClick={() => setShowMacroConfig(!showMacroConfig)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ===== CONTROLES RÁPIDOS / QUICK CONTROLS ===== */}
        <div className="flex gap-1 mb-3">
          {/* Botón Play/Pause / Play/Pause button */}
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            className="flex-1 text-xs hover:bg-gray-100"
          >
            {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </Button>
          
          {/* Botón Reset / Reset button */}
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-xs px-2 hover:bg-gray-100"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        
        {/* ===== BOTONES DE APERTURA / OPEN BUTTONS ===== */}
        <div className="space-y-2 mb-2">
          {/* Botón: Nueva Ventana / Button: New Window */}
          <Button
            onClick={onOpenTeleprompter}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Nueva Ventana
          </Button>
          
          {/* Botón: Pantalla Completa / Button: Fullscreen */}
          {onOpenTeleprompterModal && (
            <Button
              onClick={onOpenTeleprompterModal}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <Maximize className="h-3 w-3 mr-1" />
              Pantalla Completa
            </Button>
          )}
        </div>
        
        {/* ===== INFORMACIÓN DE ESTADO / STATUS INFORMATION ===== */}
        <div className="text-xs text-gray-600 space-y-1">
          <div>Estado: {isPlaying ? 'REPRODUCIENDO' : 'PAUSADO'}</div>
          <div>Velocidad: {speed.toFixed(1)} | Tamaño: {fontSize}px</div>
          <div className="text-gray-500">
            Nueva Ventana: Para entornos de producción<br/>
            Pantalla Completa: Compatible con todos los navegadores
          </div>
        </div>
      </div>

      {/* ===== PANEL DE CONTROLES DE FUENTE / FONT CONTROLS PANEL ===== */}
      {/* Se muestra al hacer clic en el botón Type / Shown when clicking Type button */}
      {showFontControls && onFontSizeChange && (
        <div className="p-3 bg-gray-300 border-b border-gray-400">
          <div className="space-y-3">
            {/* Indicador de tamaño actual / Current size indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-700">Tamaño de Fuente</span>
              <span className="text-xs text-gray-700">{fontSize}px</span>
            </div>
            
            {/* Controles de slider con botones +/- / Slider controls with +/- buttons */}
            <div className="flex items-center gap-2">
              {/* Botón decrementar / Decrement button */}
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  console.log('🔴 Minus button clicked');
                  handleFontSizeChange(-8); // Decrementar 8px / Decrement 8px
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              {/* Slider principal / Main slider */}
              <Slider
                value={[fontSize]}
                onValueChange={(value: number[]) => {
                  console.log('🔴 Slider onValueChange called with:', value[0], 'from:', fontSize);
                  if (onFontSizeChange) {
                    onFontSizeChange(value[0]);
                  }
                }}
                max={500} // Máximo 500px / Maximum 500px
                min={12}  // Mínimo 12px / Minimum 12px
                step={8}  // Incrementos de 8px / 8px increments
                className="flex-1"
              />
              
              {/* Botón incrementar / Increment button */}
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  console.log('🔴 Plus button clicked');
                  handleFontSizeChange(8); // Incrementar 8px / Increment 8px
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Botones preestablecidos de tamaño / Preset size buttons */}
            {/* 10 tamaños comunes desde 24px hasta 500px / 10 common sizes from 24px to 500px */}
            <div className="flex gap-1 flex-wrap">
              {[24, 36, 48, 72, 96, 144, 200, 300, 400, 500].map((size) => (
                <Button
                  key={size}
                  size="sm"
                  variant={fontSize === size ? "default" : "outline"} // Resaltar botón activo / Highlight active button
                  className="h-6 text-xs px-2"
                  onClick={() => {
                    console.log('🔴 Font size preset button clicked:', size, 'current:', fontSize);
                    if (onFontSizeChange) {
                      console.log('🔴 Calling onFontSizeChange with:', size);
                      onFontSizeChange(size);
                    }
                  }}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ÁREA DE VISTA PREVIA / PREVIEW AREA ===== */}
      <div className="p-3 flex-1 overflow-hidden">
        {/* Tarjeta de vista previa del teleprompter / Teleprompter preview card */}
        <Card className="mb-4 h-[500px]">
          <CardContent className="p-0 h-full">
            <div className="relative h-full">
              {/* ===== CONTENEDOR DE TEXTO CON SCROLL / TEXT CONTAINER WITH SCROLL ===== */}
              <div 
                ref={previewRef}
                className={`bg-black text-white p-4 rounded-lg h-full overflow-y-auto scroll-smooth cursor-grab active:cursor-grabbing ${
                  isPlaying ? 'ring-4 ring-red-500 ring-opacity-70 shadow-lg shadow-red-500/20' : '' // Ring rojo cuando reproduce / Red ring when playing
                } ${isManualScrolling ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}`} // Ring amarillo en modo manual / Yellow ring in manual mode
                style={{ 
                  fontSize: `${Math.max(10, Math.min(16, fontSize * 0.06))}px`, // Escala: 6% del tamaño original / Scale: 6% of original size
                  lineHeight: '1.4',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.01em'
                }}
                onWheel={handleWheel}
                title="Scroll: Controlar velocidad y dirección"
              >
                {text ? (
                  <div className="space-y-2">
                    {/* Padding superior para mejor posición inicial / Top padding for better starting position */}
                    <div style={{ height: '20vh' }} />
                    
                    {/* Renderizado simple del texto línea por línea / Simple line-by-line text rendering */}
                    {text.split('\n').map((line, index) => (
                      <div key={index} className="leading-tight mb-2 transition-all duration-200">
                        {line.trim() || '\u00A0'} {/* nbsp para líneas vacías / nbsp for empty lines */}
                      </div>
                    ))}
                    
                    {/* Padding inferior para que el texto pueda pasar el centro / Bottom padding so text can scroll past center */}
                    <div style={{ height: '40vh' }} />
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-center mt-20 text-sm">
                    Escribe texto en el editor para ver la vista previa...
                  </div>
                )}
              </div>
              
              {/* ===== LÍNEA GUÍA (LÍNEA DE LECTURA) / GUIDE LINE (READING LINE) ===== */}
              {/* Línea roja horizontal que indica la posición de lectura / Red horizontal line indicating reading position */}
              <div 
                className={`absolute left-8 right-8 h-1 bg-red-500 pointer-events-none z-30 shadow-lg transition-opacity duration-300 ${
                  isPlaying ? 'opacity-100' : 'opacity-60' // Más visible cuando reproduce / More visible when playing
                }`}
                style={{ 
                  top: `${guideLinePosition}%`, // Posición configurable 0-100% / Configurable position 0-100%
                  transform: 'translateY(-50%)',
                  boxShadow: isPlaying ? '0 0 12px rgba(239, 68, 68, 0.8)' : '0 0 6px rgba(239, 68, 68, 0.4)' // Brillo animado / Animated glow
                }} 
              />
              
              {/* ===== INDICADORES DE ESTADO / STATUS INDICATORS ===== */}
              {/* Esquina superior derecha con badges de estado / Top-right corner with status badges */}
              <div className="absolute top-3 right-3 space-y-2 z-40">
                {/* Badge AUTO: Modo de auto-scroll activo / AUTO badge: Auto-scroll mode active */}
                {isPlaying && !isManualScrolling && (
                  <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg opacity-95 font-mono flex items-center gap-2 shadow-lg animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div> {/* Dot pulsante / Pulsing dot */}
                    <span className="font-bold">AUTO</span>
                    <div className="text-xs opacity-80">v{speed}x</div> {/* Mostrar velocidad / Show speed */}
                  </div>
                )}
                
                {/* Badge MANUAL: Modo de scroll manual activo / MANUAL badge: Manual scroll mode active */}
                {isManualScrolling && (
                  <div className="bg-yellow-500 text-black text-xs px-3 py-1.5 rounded-lg opacity-95 font-mono flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="font-bold">MANUAL</span>
                    <div className="text-xs opacity-80">🖱️</div> {/* Emoji de mouse / Mouse emoji */}
                  </div>
                )}
                
                {/* Badge de posición de scroll / Scroll position badge */}
                {scrollPosition > 0 && (
                  <div className="bg-gray-800 text-green-400 text-xs px-2 py-1 rounded opacity-90 font-mono border border-green-500/20">
                    {Math.round(scrollPosition)}px
                  </div>
                )}
                
                {/* Badge de tamaño de fuente / Font size badge */}
                <div className="bg-gray-800 text-blue-400 text-xs px-2 py-1 rounded opacity-90 font-mono border border-blue-500/20">
                  {fontSize}px
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== TARJETA DE ESTADO DEL SISTEMA / SYSTEM STATUS CARD ===== */}
        {/* Muestra estadísticas en tiempo real / Shows real-time statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {/* Estado del teleprompter / Teleprompter state */}
            <div className="flex justify-between">
              <span>Teleprompter:</span>
              <span className={isPlaying ? 'text-green-600' : 'text-red-600'}>
                {isPlaying ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            
            {/* Velocidad actual / Current speed */}
            <div className="flex justify-between">
              <span>Velocidad:</span>
              <span>{speed}x</span>
            </div>
            
            {/* Posición de scroll / Scroll position */}
            <div className="flex justify-between">
              <span>Posición:</span>
              <span>{scrollPosition}px</span>
            </div>
            
            {/* Conteo de caracteres / Character count */}
            <div className="flex justify-between">
              <span>Caracteres:</span>
              <span>{text.length}</span>
            </div>
            
            {/* Conteo de líneas / Line count */}
            <div className="flex justify-between">
              <span>Líneas:</span>
              <span>{text.split('\n').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== DIÁLOGOS DE CONFIGURACIÓN / CONFIGURATION DIALOGS ===== */}
      
      {/* Configuración de línea guía / Guide line settings */}
      <GuideLineSettings
        isOpen={showGuideSettings}
        onClose={() => setShowGuideSettings(false)}
        guideLinePosition={guideLinePosition}
        onGuideLinePositionChange={setGuideLinePosition}
      />
      
      {/* Configuración de macros / Macro configuration */}
      <ConfigurationPanel
        isOpen={showMacroConfig}
        onClose={() => setShowMacroConfig(false)}
        macros={macros}
        onMacrosChange={onMacrosChange}
      />
    </div>
  );
}