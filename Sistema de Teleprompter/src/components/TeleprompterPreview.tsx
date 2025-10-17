// ===== IMPORTACIONES / IMPORTS =====
import { Monitor, ExternalLink, Settings, Type, Plus, Minus, Maximize, Play, Pause, RotateCcw, Target } from 'lucide-react';
import { TextWithJumpMarkers } from './TextWithJumpMarkers';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { GuideLineSettings } from './GuideLineSettings';
import { ConfigurationPanel } from './ConfigurationPanel';
import { useState, useEffect, useRef } from 'react';
import { useTeleprompterStore } from '../hooks';
import type { MacroSettings } from './useMacros';

/**
 * Props opcionales para callbacks externos
 */
interface TeleprompterPreviewProps {
  /** Callback para abrir en nueva ventana */
  onOpenTeleprompter?: () => void;
  /** Callback para abrir en pantalla completa */
  onOpenTeleprompterModal?: () => void;
  /** Nombre del archivo (opcional) */
  fileName?: string;
  /** Configuración de macros */
  macros?: MacroSettings;
  /** Callback al cambiar macros */
  onMacrosChange?: (macros: MacroSettings) => void;
  /** Callback para saltar a posición específica */
  onJumpToPosition?: (position: number) => void;
}

/**
 * TeleprompterPreview - Panel de vista previa del teleprompter (REFACTORIZADO v2)
 * 
 * Versión 2.0 usando Stores directamente (sin props drilling).
 * 
 * Panel lateral derecho que proporciona vista previa en miniatura con controles.
 * 
 * CAMBIOS EN v2.0:
 * - ✅ Eliminados 10+ props (text, fontSize, isPlaying, scrollPosition, speed, etc.)
 * - ✅ Usa useTeleprompterStore() directamente
 * - ✅ Sincronización automática de scrollPosition
 * - ✅ Control de rueda del mouse integrado
 * - ✅ Modo manual de scroll con timeout
 * - ✅ Callbacks opcionales para backwards compatibility
 * 
 * Características:
 * - Vista previa en tiempo real del texto
 * - Controles de reproducción (Play/Pause/Reset)
 * - Ajuste de tamaño de fuente con slider y botones
 * - Control de velocidad y scroll con rueda del mouse
 * - Línea guía configurable
 * - Modo de scroll manual con timeout de 3 segundos
 * - Indicadores visuales de estado (AUTO/MANUAL)
 * - Estadísticas del sistema en tiempo real
 * 
 * Control con rueda del mouse:
 * - CTRL + WHEEL = Control de velocidad (0.1x increments)
 * - SHIFT + WHEEL = Control de tamaño de fuente (8px increments)
 * - WHEEL NORMAL = Scroll manual (con timeout 3s)
 * - ALT + WHEEL = Scroll fino (20px en vez de 60px)
 * 
 * @component
 * @example
 * ```tsx
 * // Uso simple sin props
 * <TeleprompterPreview />
 * 
 * // Con callbacks personalizados
 * <TeleprompterPreview
 *   onOpenTeleprompter={handleOpen}
 *   fileName="Script 1.txt"
 * />
 * ```
 */
export function TeleprompterPreview({
  onOpenTeleprompter,
  onOpenTeleprompterModal,
  fileName,
  macros,
  onMacrosChange,
  onJumpToPosition
}: TeleprompterPreviewProps = {}) {
  
  // ===== HOOKS / HOOKS =====
  const {
    text,
    fontSize,
    isPlaying,
    scrollPosition,
    speed,
    guideLinePosition,
    play,
    pause,
    reset,
    setFontSize,
    adjustFontSize,
    setSpeed,
    adjustSpeed,
    setScrollPosition,
    setGuideLinePosition
  } = useTeleprompterStore();
  
  // ===== ESTADO LOCAL DE UI / LOCAL UI STATE =====
  const [showFontControls, setShowFontControls] = useState(false);
  const [showGuideSettings, setShowGuideSettings] = useState(false);
  const [showMacroConfig, setShowMacroConfig] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  
  // ===== REFERENCIAS / REFERENCES =====
  const previewRef = useRef<HTMLDivElement>(null);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ===== EFECTOS DE DEBUG / DEBUG EFFECTS =====
  useEffect(() => {
    console.log('🔵 TeleprompterPreview - fontSize changed to:', fontSize);
  }, [fontSize]);
  
  useEffect(() => {
    console.log('🔵 TeleprompterPreview - isPlaying:', isPlaying);
  }, [isPlaying]);
  
  // ===== EFECTO: SINCRONIZACIÓN DE SCROLL / EFFECT: SCROLL SYNC =====
  /**
   * Aplica scrollPosition del store al DOM
   * Escala por 2.0x para mejor visibilidad en preview
   */
  useEffect(() => {
    if (previewRef.current) {
      const scaledScrollPosition = scrollPosition * 2.0;
      console.log('🟡 TeleprompterPreview scroll sync:', scrollPosition, '->', scaledScrollPosition);
      previewRef.current.scrollTop = scaledScrollPosition;
    }
  }, [scrollPosition, isPlaying]);
  
  // ===== MANEJADORES / HANDLERS =====
  
  /**
   * Play/Pause toggle
   */
  const handlePlayPause = () => {
    console.log('TeleprompterPreview.handlePlayPause, current:', isPlaying);
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  /**
   * Reset teleprompter
   */
  const handleReset = () => {
    console.log('TeleprompterPreview.handleReset');
    reset();
  };
  
  /**
   * Cambio de tamaño de fuente
   */
  const handleFontSizeChange = (increment: number) => {
    console.log('🔴 TeleprompterPreview.handleFontSizeChange:', increment);
    adjustFontSize(increment);
  };
  
  /**
   * Control con rueda del mouse
   * - CTRL + WHEEL = Velocidad
   * - SHIFT + WHEEL = Tamaño de fuente
   * - WHEEL = Scroll manual
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;
    const delta = e.deltaY > 0 ? 1 : -1;
    
    console.log('🖱️ Mouse wheel:', { delta, ctrl: isCtrlPressed, shift: isShiftPressed, alt: isAltPressed });
    
    if (isCtrlPressed) {
      // CTRL + WHEEL = Velocidad
      const speedDelta = delta * 0.1;
      adjustSpeed(speedDelta);
      console.log('🖱️ Speed changed:', speed);
    } else if (isShiftPressed) {
      // SHIFT + WHEEL = Tamaño de fuente
      const fontDelta = delta * 8;
      adjustFontSize(fontDelta);
      console.log('🖱️ Font size changed:', fontSize);
    } else {
      // WHEEL = Scroll manual
      const scrollDelta = delta * (isAltPressed ? 20 : 60);
      const newScrollPosition = Math.max(0, scrollPosition + scrollDelta);
      console.log('🖱️ Manual scroll:', scrollPosition, '->', newScrollPosition);
      
      setIsManualScrolling(true);
      setScrollPosition(newScrollPosition);
      
      // Limpiar timeout existente
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      
      // Reanudar auto-scroll después de 3s
      manualScrollTimeoutRef.current = setTimeout(() => {
        console.log('🖱️ Manual scroll timeout - resuming auto-scroll');
        setIsManualScrolling(false);
      }, 3000);
    }
  };
  
  // ===== RENDER / RENDER =====
  
  // Calcular tamaño de fuente para preview (escalado)
  const previewFontSize = Math.max(12, Math.min(60, fontSize * 0.12));
  
  return (
    <div className="h-full bg-gray-100 border-l border-gray-300">
      {/* ===== ENCABEZADO / HEADER ===== */}
      <div className="p-3 border-b border-gray-300 bg-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-800">
            Prompter Preview: {fileName || 'How To Script'}
          </h3>
          <div className="flex gap-1">
            {/* Botón Configuración */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowMacroConfig(!showMacroConfig)}
              title="Configuración de Macros"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Botón Línea Guía */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowGuideSettings(!showGuideSettings)}
              title="Configuración de Línea Guía"
            >
              <Target className="h-4 w-4" />
            </Button>
            
            {/* Botón Tamaño de Fuente */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFontControls(!showFontControls)}
              title="Controles de Tamaño de Fuente"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Controles de Reproducción */}
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            onClick={handlePlayPause}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Reproducir
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            title="Reiniciar al inicio"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Indicador de Estado */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Velocidad: {speed.toFixed(1)}x</span>
          <span className={isManualScrolling ? 'text-orange-600 font-semibold' : ''}>
            {isManualScrolling ? 'MANUAL' : 'AUTO'}
          </span>
          <span>Fuente: {fontSize}px</span>
        </div>
      </div>
      
      {/* ===== PANELES DESPLEGABLES / COLLAPSIBLE PANELS ===== */}
      
      {/* Panel de Configuración de Macros */}
      {showMacroConfig && macros && onMacrosChange && (
        <div className="p-3 border-b border-gray-300 bg-gray-50">
          <ConfigurationPanel
            isOpen={showMacroConfig}
            macros={macros}
            onMacrosChange={onMacrosChange}
            onClose={() => setShowMacroConfig(false)}
          />
        </div>
      )}
      
      {/* Panel de Línea Guía */}
      {showGuideSettings && (
        <div className="p-3 border-b border-gray-300 bg-gray-50">
          <GuideLineSettings
            isOpen={showGuideSettings}
            guideLinePosition={guideLinePosition}
            onGuideLinePositionChange={setGuideLinePosition}
            onClose={() => setShowGuideSettings(false)}
          />
        </div>
      )}
      
      {/* Panel de Controles de Fuente */}
      {showFontControls && (
        <div className="p-3 border-b border-gray-300 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Tamaño de Fuente: {fontSize}px
              </label>
              <Slider
                value={[fontSize]}
                onValueChange={([value]) => setFontSize(value)}
                min={12}
                max={500}
                step={1}
                className="mb-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFontSizeChange(-8)}
                className="flex-1"
              >
                <Minus className="h-3 w-3 mr-1" />
                -8px
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFontSizeChange(8)}
                className="flex-1"
              >
                <Plus className="h-3 w-3 mr-1" />
                +8px
              </Button>
            </div>
            
            <div className="flex gap-2">
              {[100, 150, 200, 250].map(size => (
                <Button
                  key={size}
                  size="sm"
                  variant={fontSize === size ? "default" : "outline"}
                  onClick={() => setFontSize(size)}
                  className="flex-1"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* ===== VISTA PREVIA / PREVIEW ===== */}
      <div 
        ref={previewRef}
        className="flex-1 overflow-y-auto bg-black text-white p-4 relative min-h-0"
        style={{
          fontSize: `${previewFontSize}px`,
          lineHeight: '1.5'
        }}
        onWheel={handleWheel}
      >
        {/* Línea Guía */}
        <div
          className="absolute left-0 right-0 border-t-2 border-yellow-400 opacity-50 pointer-events-none"
          style={{ top: `${guideLinePosition}%` }}
        />
        
        {/* Texto con Marcadores */}
        <TextWithJumpMarkers
          text={text}
        />
      </div>
      
      {/* ===== BOTONES DE APERTURA / OPEN BUTTONS ===== */}
      <div className="p-3 border-t border-gray-300 bg-gray-200 space-y-2">
        {onOpenTeleprompter && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenTeleprompter}
            className="w-full"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Abrir en Nueva Ventana
          </Button>
        )}
        
        {onOpenTeleprompterModal && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenTeleprompterModal}
            className="w-full"
          >
            <Maximize className="h-4 w-4 mr-2" />
            Pantalla Completa
          </Button>
        )}
        
        {/* Estadísticas */}
        <div className="text-xs text-gray-600 text-center space-y-1">
          <div>Caracteres: {text.length}</div>
          <div>Posición: {scrollPosition.toFixed(0)}px</div>
          <div className="text-gray-400">
            Ctrl+Wheel: Velocidad | Shift+Wheel: Fuente | Wheel: Scroll
          </div>
        </div>
      </div>
    </div>
  );
}
