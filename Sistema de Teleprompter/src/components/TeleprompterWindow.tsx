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
import { useTeleprompterStore, useRunOrderStore, useConfigStore } from '../hooks';
// Hook de macros / Macros hook
import { useMacros } from './useMacros';
// Store directo para debugging / Direct store for debugging
import { teleprompterStore } from '../stores/TeleprompterStore';
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
  
  const {
    macros: macroSettings
  } = useConfigStore();
  
  // ===== ESTADO LOCAL DE UI / LOCAL UI STATE =====
  const [showControls, setShowControls] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const teleprompterAreaRef = useRef<HTMLDivElement>(null);
  
  // ===== EFECTO DEBUG: MONITOREAR isPlaying / DEBUG EFFECT: MONITOR isPlaying =====
  useEffect(() => {
    console.log('🔍 TeleprompterWindow: isPlaying changed to:', isPlaying);
  }, [isPlaying]);
  
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
      
      // ❌ AUTO-START DESHABILITADO - Esperar comando manual del usuario
      // ❌ AUTO-START DISABLED - Wait for manual user command
      // if (text && !isPlaying) {
      //   console.log('▶️ TeleprompterWindow: auto-starting playback');
      //   play();
      // }
    }, 500);
    
    // Cleanup: Dispose service on unmount
    return () => {
      console.log('🔴 TeleprompterWindow: disposing SyncService');
      syncService.dispose();
    };
  }, []);
  
  // ===== EFECTO: AUTO-START DESHABILITADO / EFFECT: AUTO-START DISABLED =====
  /**
   * ❌ AUTO-START DESHABILITADO - Causar conflicto con controles manuales
   * ❌ AUTO-START DISABLED - Causes conflict with manual controls
   * 
   * Usuario debe presionar Play manualmente (espacio o botón)
   * User must press Play manually (space or button)
   */
  // DISABLED to avoid conflicts with manual play/pause
  
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
   * - CTRL + WHEEL: Cambiar velocidad / Change speed (±0.1x) y auto-iniciar
   * - SHIFT + WHEEL: Cambiar tamaño de fuente / Change font size (±8px)
   * - WHEEL: Scroll manual / Manual scroll (60px) - NO pausa, continúa auto-scroll
   * - ALT + WHEEL: Scroll fino / Fine scroll (20px) - NO pausa, continúa auto-scroll
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
        
        // ⚠️ NO PAUSAR - Permitir que auto-scroll continúe
        // ⚠️ DO NOT PAUSE - Allow auto-scroll to continue
        // El auto-scroll seguirá desde la nueva posición ajustada manualmente
        // Auto-scroll will continue from the new manually adjusted position
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
    console.log('═══════════════════════════════════════');
    console.log('🎮 TeleprompterWindow: handlePlayPause INICIO');
    
    // Obtener estado DIRECTO del store para evitar closure
    const currentState = teleprompterStore.getState();
    
    console.log('   📊 Estado ANTES de llamar play/pause:');
    console.log('      store.isPlaying:', currentState.isPlaying);
    console.log('      speed:', speed);
    console.log('      scrollPosition:', scrollPosition);
    console.log('      text length:', text?.length || 0);
    
    if (currentState.isPlaying) {
      console.log('   🔴 Llamando pause()...');
      pause();
      console.log('   ✅ pause() ejecutado');
    } else {
      console.log('   🟢 Llamando play()...');
      play();
      console.log('   ✅ play() ejecutado');
    }
    
    // Verificar estado inmediatamente después
    setTimeout(() => {
      const storeState = teleprompterStore.getState();
      console.log('   📊 Estado DEL STORE después de 50ms:');
      console.log('      store.isPlaying:', storeState.isPlaying);
      console.log('      store.speed:', storeState.speed);
      console.log('      store.scrollPosition:', storeState.scrollPosition);
      console.log('═══════════════════════════════════════');
    }, 50);
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
  
  // ===== HOOK DE MACROS / MACROS HOOK =====
  /**
   * Hook para manejar atajos de teclado personalizables
   * Hook to handle customizable keyboard shortcuts
   */
  useMacros(macroSettings, {
    onPlayStop: handlePlayPause,
    onPause: pause,
    onPrevious: handleBackward,
    onNext: handleForward,
    onIncreaseSpeed: () => adjustSpeed(0.1),
    onDecreaseSpeed: () => adjustSpeed(-0.1),
    onIncreaseFontSize: () => adjustFontSize(8),
    onDecreaseFontSize: () => adjustFontSize(-8),
  });
  
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
  }, [isPlaying, speed, fontSize, handlePlayPause, handleReset, adjustSpeed, adjustFontSize, setShowControls, handleForward, handleBackward]);
  
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
      {/* ===== PANEL DE INFORMACIÓN Y ATAJOS (ABAJO IZQUIERDA) / INFO AND SHORTCUTS PANEL (BOTTOM LEFT) ===== */}
      {showControls && (
        <div className="absolute bottom-4 left-4 z-50 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-sm">
          <div className="space-y-2">
            {/* Título */}
            <div className="font-bold text-white mb-3 border-b border-white/30 pb-2">
              Atajos
            </div>
            
            {/* Atajos de teclado */}
            <div className="space-y-1 text-white/80 text-xs">
              <div>ESPACIO = Play/Pause</div>
              <div>R = Reset</div>
              <div>↑/↓ = Velocidad</div>
              <div>+/- = Tamaño fuente</div>
              <div>H = Mostrar/Ocultar controles</div>
              <div>PageUp/PageDown = Script anterior/siguiente</div>
              <div>CTRL + WHEEL = Velocidad</div>
              <div>SHIFT + WHEEL = Tamaño fuente</div>
              <div>WHEEL = Scroll manual</div>
            </div>
            
            {/* Separador */}
            <div className="border-t border-white/30 my-3" />
            
            {/* Estado actual */}
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-4">
                <span className="text-white/60">Velocidad:</span>
                <span className="text-white font-mono">{speed.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-white/60">Fuente:</span>
                <span className="text-white font-mono">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-xs text-white/80">
                  {isPlaying ? '▶ Reproduciendo' : '⏸ Pausado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botón flotante para mostrar controles (cuando están ocultos) / Floating button to show controls (when hidden) */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 left-4 z-50 text-xs text-white/40 hover:text-white transition-colors px-3 py-1 rounded bg-black/60 hover:bg-black/80"
        >
          Mostrar (H)
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
          guideLinePosition={guideLinePosition}
          onEnd={() => {
            console.log('📜 TeleprompterWindow: reached end of text');
            pause();
            
            // Auto-avance al siguiente script después de 2 segundos
            // Auto-advance to next script after 2 seconds
            setTimeout(() => {
              const success = nextItem();
              if (success) {
                console.log('✅ TeleprompterWindow: auto-advanced to next script');
                // Resetear posición de scroll para el nuevo script
                // Reset scroll position for new script
                reset();
                // Esperar 500ms y reanudar reproducción automáticamente
                // Wait 500ms and resume playback automatically
                setTimeout(() => {
                  play();
                  console.log('▶️ TeleprompterWindow: auto-resuming playback for next script');
                }, 500);
              } else {
                console.log('⚠️ TeleprompterWindow: reached last script, no more scripts to advance');
              }
            }, 2000);
          }}
          onJumpToPosition={setScrollPosition}
        />
      </div>
    </div>
  );
}
