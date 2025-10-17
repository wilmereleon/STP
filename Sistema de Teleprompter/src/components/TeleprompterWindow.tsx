/**
 * TeleprompterWindow v2 - Ventana esclava sincronizada con Store
 * TeleprompterWindow v2 - Slave window synchronized with Store
 * 
 * Versión refactorizada que usa:
 * - useTeleprompterStore() para acceso directo al estado
 * - SyncService en modo 'slave' para sincronización
 * - useRunOrderStore() para navegación entre scripts
 * - Sin estado local independiente (single source of truth)
 * 
 * Refactored version that uses:
 * - useTeleprompterStore() for direct state access
 * - SyncService in 'slave' mode for synchronization
 * - useRunOrderStore() for script navigation
 * - No independent local state (single source of truth)
 * 
 * Arquitectura Master-Slave:
 * - SLAVE: Esta ventana escucha cambios del master
 * - MASTER: App.tsx controla el estado principal
 * - Comunicación: SyncService con postMessage
 * 
 * Master-Slave Architecture:
 * - SLAVE: This window listens to changes from master
 * - MASTER: App.tsx controls main state
 * - Communication: SyncService with postMessage
 * 
 * @version 2.0.0
 * @pattern Observer + Service Layer + Master-Slave
 */

// ===== IMPORTACIONES / IMPORTS =====
import { useEffect, useRef, useState } from 'react';
// Componentes del teleprompter / Teleprompter components
import { TeleprompterScreen } from './TeleprompterScreen';
import { TeleprompterControls } from './TeleprompterControls';
// Hooks del Store / Store hooks
import { useTeleprompterStore, useRunOrderStore } from '../hooks';
// Servicio de sincronización / Synchronization service
import { syncService } from '../services/SyncService';

/**
 * TeleprompterWindow v2 - Ventana esclava con sincronización por Store
 * TeleprompterWindow v2 - Slave window with Store synchronization
 * 
 * Props eliminados (antes 5+):
 * - ❌ text, isPlaying, speed, fontSize, scrollPosition
 * - ❌ onUpdate callbacks
 * 
 * Ahora usa Store directamente (0 props requeridos)
 * Now uses Store directly (0 required props)
 * 
 * @component
 * @returns {JSX.Element} Ventana del teleprompter sincronizada / Synchronized teleprompter window
 * 
 * @example
 * ```tsx
 * // Antes (v1) - 5+ props
 * <TeleprompterWindow
 *   text={text}
 *   isPlaying={isPlaying}
 *   speed={speed}
 *   fontSize={fontSize}
 *   scrollPosition={scrollPosition}
 *   onPlayPause={handlePlayPause}
 *   onReset={handleReset}
 *   // ... más props
 * />
 * 
 * // Después (v2) - 0 props
 * <TeleprompterWindow.v2 />
 * ```
 */
export function TeleprompterWindow() {
  // ===== STORE INTEGRATION / INTEGRACIÓN CON STORE =====
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
    setSpeed,
    adjustSpeed,
    setFontSize,
    adjustFontSize,
    setScrollPosition,
    jumpToMarker
  } = useTeleprompterStore();
  
  const {
    nextItem,
    previousItem
  } = useRunOrderStore();
  
  // ===== ESTADO LOCAL DE UI / LOCAL UI STATE =====
  const [showControls, setShowControls] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const teleprompterAreaRef = useRef<HTMLDivElement>(null);
  
  // ===== EFECTO: INICIALIZAR SYNC SERVICE (SLAVE MODE) / EFFECT: INITIALIZE SYNC SERVICE (SLAVE MODE) =====
  /**
   * Inicializa SyncService en modo 'slave' para recibir actualizaciones del master
   * Initializes SyncService in 'slave' mode to receive updates from master
   * 
   * El slave NO modifica el store directamente, solo recibe estado del master
   * The slave does NOT modify store directly, only receives state from master
   * 
   * Flujo / Flow:
   * 1. Master (App.tsx) modifica TeleprompterStore
   * 2. AutoScrollService detecta cambios y notifica a SyncService
   * 3. SyncService envía SYNC_STATE via postMessage
   * 4. Este componente (slave) recibe SYNC_STATE
   * 5. Store se actualiza automáticamente (por el servicio)
   * 6. Componente re-renderiza con nuevo estado
   */
  useEffect(() => {
    console.log('🔵 TeleprompterWindow: initializing SyncService in SLAVE mode');
    
    // Inicializar en modo slave
    // SyncService automatically registers with master via registerWithMaster()
    syncService.initialize('slave');
    
    // Marcar como conectado después de inicialización
    setTimeout(() => {
      setIsConnected(true);
      console.log('✅ TeleprompterWindow: connected to master');
      
      // AUTO-START: Iniciar reproducción automáticamente si hay texto
      // AUTO-START: Start playback automatically if there's text
      if (text && !isPlaying) {
        console.log('▶️ TeleprompterWindow: auto-starting playback');
        play();
      }
    }, 500);
    
    // Cleanup: Dispose service on unmount
    return () => {
      console.log('🔴 TeleprompterWindow: disposing SyncService');
      syncService.dispose();
    };
  }, []);
  
  // ===== EFECTO: AUTO-START CUANDO LLEGA TEXTO NUEVO / EFFECT: AUTO-START WHEN NEW TEXT ARRIVES =====
  /**
   * Inicia automáticamente la reproducción cuando llega texto nuevo
   * Automatically starts playback when new text arrives
   */
  useEffect(() => {
    console.log('🔵 TeleprompterWindow: text changed. Length:', text?.length || 0, 'First 50 chars:', text?.substring(0, 50));
    
    // Solo auto-start si hay texto y NO está reproduciendo
    if (text && text.length > 0 && !isPlaying && isConnected) {
      console.log('▶️ TeleprompterWindow: auto-starting on new text');
      play();
    }
  }, [text, isConnected, isPlaying, play]);
  
  // ===== EFECTO: MOUSE WHEEL CONTROLS / EFFECT: MOUSE WHEEL CONTROLS =====
  /**
   * Maneja controles con rueda del mouse
   * Handles mouse wheel controls
   * 
   * En modo slave, los cambios se envían al master via SyncService.requestChange()
   * El master decide si acepta el cambio y lo propaga de vuelta
   * 
   * In slave mode, changes are sent to master via SyncService.requestChange()
   * Master decides whether to accept change and propagates it back
   * 
   * Comportamiento / Behavior:
   * - CTRL + WHEEL: Cambiar velocidad / Change speed (±0.1x)
   * - SHIFT + WHEEL: Cambiar tamaño de fuente / Change font size (±8px)
   * - WHEEL: Scroll manual / Manual scroll (60px)
   * - ALT + WHEEL: Scroll fino / Fine scroll (20px)
   */
  useEffect(() => {
    const area = teleprompterAreaRef.current;
    if (!area) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const isCtrlPressed = e.ctrlKey;
      const isShiftPressed = e.shiftKey;
      const isAltPressed = e.altKey;
      const delta = e.deltaY > 0 ? 1 : -1;
      
      if (isCtrlPressed) {
        // CTRL + WHEEL = Velocidad / Speed
        const speedDelta = delta * 0.1;
        const newSpeed = Math.max(0.1, Math.min(5.0, speed + speedDelta));
        console.log('🖱️ TeleprompterWindow: speed change requested', speed, '→', newSpeed);
        
        // Solicitar cambio al master / Request change to master
        syncService.requestChange('SET_SPEED', newSpeed);
        
        // Auto-iniciar reproducción si no está activo / Auto-start if not playing
        if (!isPlaying) {
          syncService.requestChange('PLAY');
        }
      } else if (isShiftPressed) {
        // SHIFT + WHEEL = Tamaño fuente / Font size
        const fontDelta = delta * 8;
        const newFontSize = Math.max(12, Math.min(500, fontSize + fontDelta));
        console.log('🖱️ TeleprompterWindow: fontSize change requested', fontSize, '→', newFontSize);
        
        // Solicitar cambio al master / Request change to master
        syncService.requestChange('SET_FONT_SIZE', newFontSize);
      } else {
        // WHEEL = Scroll manual / Manual scroll
        const scrollDelta = delta * (isAltPressed ? 20 : 60);
        const newScrollPosition = Math.max(0, scrollPosition + scrollDelta);
        console.log('🖱️ TeleprompterWindow: scroll change requested', scrollPosition, '→', newScrollPosition);
        
        // Solicitar cambio al master / Request change to master
        syncService.requestChange('SET_SCROLL_POSITION', newScrollPosition);
        
        // Pausar al hacer scroll manual / Pause on manual scroll
        if (isPlaying) {
          syncService.requestChange('PAUSE');
        }
      }
    };
    
    area.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      area.removeEventListener('wheel', handleWheel);
    };
  }, [speed, fontSize, scrollPosition, isPlaying]);
  
  // ===== MANEJADORES DE TRANSPORTE / TRANSPORT HANDLERS =====
  /**
   * Todos los handlers delegan al store local
   * El store notificará a SyncService automáticamente
   * 
   * All handlers delegate to local store
   * Store will notify SyncService automatically
   */
  
  const handlePlayPause = () => {
    console.log('▶️ TeleprompterWindow: play/pause toggled');
    isPlaying ? pause() : play();
  };
  
  const handleReset = () => {
    console.log('⏮️ TeleprompterWindow: reset to beginning');
    reset();
  };
  
  const handleStop = () => {
    console.log('⏹️ TeleprompterWindow: stop (pause + reset)');
    pause();
    reset();
  };
  
  const handleSpeedChange = (newSpeed: number) => {
    console.log('⚡ TeleprompterWindow: speed changed', speed, '→', newSpeed);
    setSpeed(newSpeed);
  };
  
  const handleFontSizeChange = (newFontSize: number) => {
    console.log('🔤 TeleprompterWindow: fontSize changed', fontSize, '→', newFontSize);
    setFontSize(newFontSize);
  };
  
  const handleScrollPositionChange = (newPosition: number) => {
    console.log('📜 TeleprompterWindow: scroll position changed', scrollPosition, '→', newPosition);
    setScrollPosition(newPosition);
  };
  
  const handleForward = () => {
    console.log('⏭️ TeleprompterWindow: forward to next script');
    nextItem();
  };
  
  const handleBackward = () => {
    console.log('⏮️ TeleprompterWindow: backward to previous script');
    previousItem();
  };
  
  // ===== MANEJADORES DE TECLADO / KEYBOARD HANDLERS =====
  /**
   * Atajos de teclado para control rápido
   * Keyboard shortcuts for quick control
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si no está escribiendo en un input / Only process if not typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case ' ': // Espacio = Play/Pause / Space = Play/Pause
          e.preventDefault();
          handlePlayPause();
          break;
        case 'r': // R = Reset / R = Reset
        case 'R':
          e.preventDefault();
          handleReset();
          break;
        case 'ArrowUp': // Flecha arriba = velocidad - / Arrow up = speed -
          e.preventDefault();
          adjustSpeed(-0.1);
          break;
        case 'ArrowDown': // Flecha abajo = velocidad + / Arrow down = speed +
          e.preventDefault();
          adjustSpeed(0.1);
          break;
        case '+': // + = font size + / + = font size +
        case '=':
          e.preventDefault();
          adjustFontSize(8);
          break;
        case '-': // - = font size - / - = font size -
        case '_':
          e.preventDefault();
          adjustFontSize(-8);
          break;
        case 'h': // H = Toggle controls / H = Toggle controls
        case 'H':
          e.preventDefault();
          setShowControls(prev => !prev);
          break;
        case 'PageDown': // PageDown = Next script / PageDown = Next script
          e.preventDefault();
          handleForward();
          break;
        case 'PageUp': // PageUp = Previous script / PageUp = Previous script
          e.preventDefault();
          handleBackward();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, speed, fontSize]);
  
  // ===== RENDER / RENDERIZADO =====
  
  // Debug: Log del texto para verificar que llega / Debug: Log text to verify it arrives
  useEffect(() => {
    console.log('📄 TeleprompterWindow: text updated', { 
      textLength: text?.length || 0, 
      textPreview: text?.substring(0, 100) || 'NO TEXT',
      fontSize,
      isPlaying,
      scrollPosition
    });
  }, [text, fontSize, isPlaying, scrollPosition]);
  
  return (
    <div 
      ref={teleprompterAreaRef}
      className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col"
    >
      {/* ===== BARRA DE CONTROLES SUPERIOR / TOP CONTROLS BAR ===== */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm p-3 transition-opacity">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Indicador de conexión / Connection indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-white/60">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            
            {/* Controles de transporte / Transport controls */}
            <div className="flex-1 flex justify-center">
              <TeleprompterControls
                onBackward={handleBackward}
                onForward={handleForward}
              />
            </div>
            
            {/* Botón para ocultar controles / Button to hide controls */}
            <button
              onClick={() => setShowControls(false)}
              className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1 rounded hover:bg-white/10"
            >
              Ocultar (H)
            </button>
          </div>
        </div>
      )}
      
      {/* Botón flotante para mostrar controles (cuando están ocultos) / Floating button to show controls (when hidden) */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 right-4 z-50 text-xs text-white/40 hover:text-white transition-colors px-3 py-1 rounded bg-black/60 hover:bg-black/80"
        >
          Mostrar controles (H)
        </button>
      )}
      
      {/* ===== ÁREA DEL TELEPROMPTER / TELEPROMPTER AREA ===== */}
      <div className="flex-1 relative">
        <TeleprompterScreen
          text={text}
          fontSize={fontSize}
          isPlaying={isPlaying}
          scrollPosition={scrollPosition}
          speed={speed}
          setScrollPosition={setScrollPosition}
          onEnd={() => {
            console.log('📜 TeleprompterWindow: reached end of text');
            pause();
          }}
          onJumpToPosition={setScrollPosition}
        />
      </div>
      
      {/* ===== INDICADORES DE ESTADO / STATUS INDICATORS ===== */}
      <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {/* Velocidad / Speed */}
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white/80">
          Velocidad: {speed.toFixed(1)}x
        </div>
        
        {/* Tamaño de fuente / Font size */}
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white/80">
          Fuente: {fontSize}px
        </div>
        
        {/* Estado de reproducción / Playback state */}
        <div className={`backdrop-blur-sm px-3 py-1 rounded text-xs ${
          isPlaying ? 'bg-green-500/60 text-white' : 'bg-red-500/60 text-white'
        }`}>
          {isPlaying ? '▶ Reproduciendo' : '⏸ Pausado'}
        </div>
      </div>
      
      {/* ===== ATAJOS DE TECLADO / KEYBOARD SHORTCUTS ===== */}
      <div className="absolute bottom-4 left-4 z-40 bg-black/60 backdrop-blur-sm px-3 py-2 rounded text-xs text-white/60">
        <div className="font-semibold mb-1">Atajos:</div>
        <div>ESPACIO = Play/Pause</div>
        <div>R = Reset</div>
        <div>↑/↓ = Velocidad</div>
        <div>+/- = Tamaño fuente</div>
        <div>H = Mostrar/Ocultar controles</div>
        <div>PageUp/PageDown = Script anterior/siguiente</div>
        <div className="mt-1 pt-1 border-t border-white/20">
          <div>CTRL + WHEEL = Velocidad</div>
          <div>SHIFT + WHEEL = Tamaño fuente</div>
          <div>WHEEL = Scroll manual</div>
        </div>
      </div>
    </div>
  );
}
