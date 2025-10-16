// ===== IMPORTACIONES / IMPORTS =====
// Hooks de React / React hooks
import { useEffect, useState, useRef } from 'react';
// Componentes del teleprompter / Teleprompter components
import { TeleprompterScreen } from './TeleprompterScreen';
import { TeleprompterControls } from './TeleprompterControls';
// Iconos de Lucide React / Lucide React icons
import { X, Maximize2, Minimize2 } from 'lucide-react';
// Componente de botón / Button component
import { Button } from './ui/button';

/**
 * Propiedades del componente TeleprompterModal
 * TeleprompterModal component properties
 * 
 * @interface TeleprompterModalProps
 * @property {string} text - Texto del guion a mostrar / Script text to display
 * @property {boolean} isOpen - Estado de apertura del modal / Modal open state
 * @property {() => void} onClose - Callback para cerrar el modal / Callback to close modal
 * @property {number} [initialFontSize=36] - Tamaño de fuente inicial / Initial font size
 * @property {number} [initialSpeed=3] - Velocidad inicial de scroll / Initial scroll speed
 * @property {(isPlaying: boolean, speed: number, fontSize: number, scrollPosition: number) => void} [onStateChange] - Callback al cambiar estado / Callback when state changes
 * @property {(position: number) => void} [onJumpToPosition] - Callback para saltar a posición específica / Callback to jump to specific position
 */
interface TeleprompterModalProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  initialFontSize?: number;
  initialSpeed?: number;
  onStateChange?: (isPlaying: boolean, speed: number, fontSize: number, scrollPosition: number) => void;
  onJumpToPosition?: (position: number) => void;
}

/**
 * TeleprompterModal - Modal de pantalla completa del teleprompter
 * TeleprompterModal - Full-screen teleprompter modal
 * 
 * Componente modal con funcionalidades completas de teleprompter:
 * - Auto-scroll configurable con velocidad ajustable
 * - Control manual mediante rueda del mouse con 3 modos:
 *   · Scroll normal: Desplazamiento manual del texto
 *   · Ctrl+Scroll: Ajuste de velocidad de auto-scroll
 *   · Shift+Scroll: Ajuste de tamaño de fuente
 * - Atajos de teclado completos (ESPACIO, ESC, F, ↑↓, ←→, +/-, R)
 * - Modo pantalla completa
 * - Sincronización de estado con componente padre
 * - Timeout de 3 segundos para reanudar auto-scroll después de scroll manual
 * 
 * Full-screen modal component with complete teleprompter functionality:
 * - Configurable auto-scroll with adjustable speed
 * - Manual control via mouse wheel with 3 modes:
 *   · Normal scroll: Manual text scrolling
 *   · Ctrl+Scroll: Auto-scroll speed adjustment
 *   · Shift+Scroll: Font size adjustment
 * - Complete keyboard shortcuts (SPACE, ESC, F, ↑↓, ←→, +/-, R)
 * - Full-screen mode
 * - State synchronization with parent component
 * - 3-second timeout to resume auto-scroll after manual scrolling
 * 
 * @component
 * @param {TeleprompterModalProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element | null} Modal del teleprompter o null si está cerrado / Teleprompter modal or null if closed
 */
export function TeleprompterModal({ 
  text, 
  isOpen, 
  onClose, 
  initialFontSize = 36, 
  initialSpeed = 3,
  onStateChange,
  onJumpToPosition
}: TeleprompterModalProps) {
  // ===== ESTADO LOCAL / LOCAL STATE =====
  // Estado de reproducción / Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  // Velocidad de scroll (0.1-5x) / Scroll speed (0.1-5x)
  const [speed, setSpeed] = useState(Math.max(0.1, initialSpeed)); // Asegurar velocidades lentas / Ensure slow speeds
  // Tamaño de fuente (12-500px) / Font size (12-500px)
  const [fontSize, setFontSize] = useState(initialFontSize);
  // Posición actual de scroll en píxeles / Current scroll position in pixels
  const [scrollPosition, setScrollPosition] = useState(0);
  // Estado de pantalla completa / Full-screen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Modo de scroll manual activo / Manual scroll mode active
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  // Referencia al timeout de scroll manual / Reference to manual scroll timeout
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===== EFECTO: SINCRONIZACIÓN DE ESTADO / EFFECT: STATE SYNCHRONIZATION =====
  // Sincroniza cambios de estado con el componente padre
  // Synchronizes state changes with parent component
  useEffect(() => {
    if (onStateChange) {
      onStateChange(isPlaying, speed, fontSize, scrollPosition);
    }
  }, [isPlaying, speed, fontSize, scrollPosition, onStateChange]);

  // ===== EFECTO: ATAJOS DE TECLADO / EFFECT: KEYBOARD SHORTCUTS =====
  // Maneja todos los atajos de teclado del teleprompter
  // Handles all teleprompter keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return; // Solo activo cuando el modal está abierto / Only active when modal is open
      
      switch(e.key) {
        case 'Escape': // Cerrar modal / Close modal
          onClose();
          break;
        case ' ': // Play/Pause
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowUp': // Aumentar velocidad / Increase speed
          e.preventDefault();
          setSpeed(prev => Math.min(5, prev + 0.1)); // Velocidades más lentas / Slower speeds
          break;
        case 'ArrowDown': // Reducir velocidad / Decrease speed
          e.preventDefault();
          setSpeed(prev => Math.max(0.1, prev - 0.1)); // Velocidades más lentas / Slower speeds
          break;
        case 'ArrowRight': // Avanzar / Forward
          e.preventDefault();
          handleForward();
          break;
        case 'ArrowLeft': // Retroceder / Backward
          e.preventDefault();
          handleBackward();
          break;
        case 'r':
        case 'R': // Reset
          e.preventDefault();
          handleReset();
          break;
        case 'f':
        case 'F': // Pantalla completa / Full-screen
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=': // Aumentar fuente / Increase font
          e.preventDefault();
          setFontSize(prev => Math.min(500, prev + 8));
          break;
        case '-':
        case '_': // Reducir fuente / Decrease font
          e.preventDefault();
          setFontSize(prev => Math.max(12, prev - 8));
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ===== MANEJADOR: CONTROL DE RUEDA DEL MOUSE / HANDLER: MOUSE WHEEL CONTROL =====
  /**
   * Maneja el control mediante rueda del mouse con 3 modos diferentes
   * Handles mouse wheel control with 3 different modes
   * 
   * Modos / Modes:
   * 1. Normal: Scroll manual del texto (pausa auto-scroll por 3 seg)
   * 2. Ctrl+Wheel: Ajuste de velocidad de auto-scroll
   * 3. Shift+Wheel: Ajuste de tamaño de fuente
   * 4. Alt+Wheel: Control fino de scroll (incrementos de 30px en vez de 100px)
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Prevenir scroll de página / Prevent page scroll
    
    // Detectar teclas modificadoras / Detect modifier keys
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;
    const delta = e.deltaY > 0 ? 1 : -1; // 1 = abajo, -1 = arriba / 1 = down, -1 = up
    
    console.log('🖱️ Modal wheel:', { delta, ctrl: isCtrlPressed, shift: isShiftPressed, alt: isAltPressed });
    
    if (isCtrlPressed) {
      // **MODO 1: CTRL + WHEEL = CONTROL DE VELOCIDAD / MODE 1: CTRL + WHEEL = SPEED CONTROL**
      const speedDelta = delta * 0.1; // Incrementos de 0.1x / 0.1x increments
      const newSpeed = Math.max(0.1, Math.min(5, speed + speedDelta)); // Rango: 0.1-5x / Range: 0.1-5x
      console.log('🖱️ Modal speed change:', speed, '->', newSpeed);
      setSpeed(newSpeed);
    } else if (isShiftPressed) {
      // **MODO 2: SHIFT + WHEEL = CONTROL DE TAMAÑO DE FUENTE / MODE 2: SHIFT + WHEEL = FONT SIZE CONTROL**
      const fontDelta = delta * 8; // Incrementos de 8px / 8px increments
      const newFontSize = Math.max(12, Math.min(500, fontSize + fontDelta)); // Rango: 12-500px / Range: 12-500px
      console.log('🖱️ Modal font size change:', fontSize, '->', newFontSize);
      setFontSize(newFontSize);
    } else {
      // **MODO 3: WHEEL NORMAL = SCROLL MANUAL / MODE 3: NORMAL WHEEL = MANUAL SCROLL**
      const scrollDelta = delta * (isAltPressed ? 30 : 100); // Alt = control fino / Alt = fine control
      const newScrollPosition = Math.max(0, scrollPosition + scrollDelta); // No permitir valores negativos / Don't allow negative values
      console.log('🖱️ Modal manual scroll:', scrollPosition, '->', newScrollPosition);
      
      // Activar modo de scroll manual / Set manual scrolling mode
      setIsManualScrolling(true);
      setScrollPosition(newScrollPosition);
      
      // Limpiar timeout existente / Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      
      // Reanudar auto-scroll después de 3 segundos de inactividad / Resume auto-scroll after 3 seconds of inactivity
      manualScrollTimeoutRef.current = setTimeout(() => {
        console.log('🖱️ Modal manual scroll timeout - resuming auto-scroll');
        setIsManualScrolling(false);
      }, 3000);
    }
  };

  // ===== MANEJADOR: PANTALLA COMPLETA / HANDLER: FULLSCREEN =====
  /**
   * Alterna entre modo pantalla completa y modo ventana
   * Toggles between full-screen mode and windowed mode
   */
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Entrar a pantalla completa / Enter full-screen
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Salir de pantalla completa / Exit full-screen
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported or denied');
    }
  };

  // ===== EFECTO: ESCUCHAR CAMBIOS DE PANTALLA COMPLETA / EFFECT: LISTEN FOR FULLSCREEN CHANGES =====
  // Sincroniza el estado cuando el usuario sale de pantalla completa con ESC
  // Synchronizes state when user exits full-screen with ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ===== MANEJADORES DE TRANSPORTE / TRANSPORT HANDLERS =====
  
  /**
   * Alterna entre play y pause
   * Toggles between play and pause
   */
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  /**
   * Reinicia al inicio (pausa y posición 0)
   * Resets to beginning (pause and position 0)
   */
  const handleReset = () => {
    setIsPlaying(false);
    setScrollPosition(0);
  };

  /**
   * Detiene reproducción (igual que reset)
   * Stops playback (same as reset)
   */
  const handleStop = () => {
    setIsPlaying(false);
    setScrollPosition(0);
  };

  /**
   * Avanza 50 píxeles
   * Advances 50 pixels
   */
  const handleForward = () => {
    setScrollPosition(prev => prev + 50);
  };

  /**
   * Retrocede 50 píxeles (mínimo 0)
   * Goes back 50 pixels (minimum 0)
   */
  const handleBackward = () => {
    setScrollPosition(prev => Math.max(0, prev - 50));
  };

  /**
   * Maneja el final del texto (pausa automática)
   * Handles end of text (automatic pause)
   */
  const handleEnd = () => {
    setIsPlaying(false);
  };

  // No renderizar si el modal está cerrado / Don't render if modal is closed
  if (!isOpen) return null;

  return (
    // ===== CONTENEDOR PRINCIPAL / MAIN CONTAINER =====
    // Modal de pantalla completa con fondo negro / Full-screen modal with black background
    // onWheel maneja los 3 modos de control del mouse / onWheel handles 3 mouse control modes
    <div 
      className="fixed inset-0 z-50 bg-black flex flex-col cursor-grab active:cursor-grabbing" 
      onWheel={handleWheel}
      title="Scroll: Mover texto | Ctrl+Scroll: Velocidad | Shift+Scroll: Tamaño fuente | Alt+Scroll: Control fino"
    >
      {/* ===== ENCABEZADO CON CONTROLES / HEADER WITH CONTROLS ===== */}
      {/* Barra superior con información y controles / Top bar with info and controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-start">
          {/* Panel izquierdo con información de estado / Left panel with status info */}
          <div className="bg-black/50 backdrop-blur rounded-lg p-2 flex items-center gap-2">
            <div className="text-white text-sm flex items-center gap-2">
              {/* Indicador de modo: MANUAL, AUTO o PAUSADO / Mode indicator: MANUAL, AUTO or PAUSED */}
              Teleprompter - {isManualScrolling ? 'MANUAL' : isPlaying ? 'AUTO' : 'PAUSADO'}
              {/* Emoji de mouse cuando está en modo manual / Mouse emoji when in manual mode */}
              {isManualScrolling && <span className="text-yellow-400">🖱️</span>}
            </div>
            {/* Estadísticas en tiempo real / Real-time statistics */}
            <div className="text-gray-400 text-xs">
              {Math.round(fontSize)}px | Velocidad: {speed.toFixed(1)} | Pos: {Math.round(scrollPosition)}px
            </div>
          </div>
          
          {/* Panel derecho con controles / Right panel with controls */}
          <div className="flex items-center gap-2">
            {/* Componente de controles de transporte / Transport controls component */}
            <TeleprompterControls />
            
            {/* Botones de pantalla completa y cerrar / Fullscreen and close buttons */}
            <div className="bg-black/50 backdrop-blur rounded-lg p-1 flex gap-1">
              {/* Botón de pantalla completa / Fullscreen button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 p-2"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              {/* Botón cerrar / Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2"
                title="Cerrar teleprompter"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PANTALLA DEL TELEPROMPTER / TELEPROMPTER SCREEN ===== */}
      {/* Componente principal que muestra el texto scrolleado / Main component that displays scrolled text */}
      <div className="flex-1">
        <TeleprompterScreen
          text={text}
          isPlaying={isPlaying}
          speed={speed}
          fontSize={fontSize}
          onEnd={handleEnd}
          scrollPosition={scrollPosition}
          setScrollPosition={setScrollPosition}
          isManualScrolling={isManualScrolling}
          onJumpToPosition={onJumpToPosition}
        />
      </div>

      {/* ===== OVERLAY DE INSTRUCCIONES / INSTRUCTIONS OVERLAY ===== */}
      {/* Solo se muestra cuando está pausado / Only shown when paused */}
      {!isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 backdrop-blur rounded-lg p-4 text-center max-w-md">
            <div className="text-white text-sm mb-2">
              <strong>Controles de Teclado:</strong>
            </div>
            <div className="text-gray-300 text-xs space-y-1">
              <div><strong>ESPACIO:</strong> Play/Pause</div>
              <div><strong>ESC:</strong> Cerrar | <strong>F:</strong> Pantalla completa</div>
              <div><strong>↑↓:</strong> Velocidad | <strong>←→:</strong> Desplazar</div>
              <div><strong>+/-:</strong> Tamaño de letra | <strong>R:</strong> Reset</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}