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
/**
 * TeleprompterWindow v2 - Ventana esclava sincronizada con Store
 * 
 * @param autoMirrorX - Activa espejo horizontal al iniciar
 * @param autoMirrorY - Activa espejo vertical al iniciar
 */
interface TeleprompterWindowProps {
  autoMirrorX?: boolean;
  autoMirrorY?: boolean;
}

export function TeleprompterWindow({ autoMirrorX = false, autoMirrorY = false }: TeleprompterWindowProps = {}) {
  // ===== STORE INTEGRATION / INTEGRACIÓN CON STORE =====
  const {
    text,
    fontSize,
    isPlaying,
    scrollPosition,
    speed,
    guideLinePosition,
    mirrorX,
    mirrorY,
    play,
    pause,
    reset,
    setSpeed,
    adjustSpeed,
    setFontSize,
    adjustFontSize,
    setScrollPosition,
    jumpToMarker,
    setMirrorX,
    setMirrorY,
    toggleMirrorX,
    toggleMirrorY
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
  
  // Detectar si es ventana popup (presentador o espejo)
  const isPopup = autoMirrorX || autoMirrorY;
  
  // ===== EFECTO DEBUG: MONITOREAR isPlaying / DEBUG EFFECT: MONITOR isPlaying =====
  useEffect(() => {
    console.log('🔍 TeleprompterWindow: isPlaying changed to:', isPlaying);
  }, [isPlaying]);
  
  // ===== EFECTO: INICIALIZAR SYNC SERVICE (SLAVE MODE) / EFFECT: INITIALIZE SYNC SERVICE (SLAVE MODE) =====
  /**
   * Inicializa SyncService en modo 'slave' para recibir actualizaciones del master
   * Activa espejo si se especificó en la URL
   */
  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('🔵 TeleprompterWindow: INIT');
    console.log('   autoMirrorX:', autoMirrorX);
    console.log('   autoMirrorY:', autoMirrorY);
    console.log('   isPopup:', isPopup);
    console.log('═══════════════════════════════════════');
    
    // Inicializar en modo slave
    syncService.initialize('slave');
    
    // Activar espejo si corresponde
    if (autoMirrorX) {
      console.log('🪞🪞🪞 Auto-activando espejo horizontal (presentador)');
      setMirrorX(true);
      
      // Verificar después de 500ms
      setTimeout(() => {
        const state = teleprompterStore.getState();
        console.log('🪞 VERIFICACIÓN espejo después de 500ms:');
        console.log('   state.mirrorX:', state.mirrorX);
        console.log('   mirrorX local:', mirrorX);
      }, 500);
    }
    if (autoMirrorY) {
      console.log('🪞 Auto-activando espejo vertical');
      setMirrorY(true);
    }
    
    // Marcar como conectado después de inicialización
    setTimeout(() => {
      setIsConnected(true);
      console.log('✅ TeleprompterWindow: connected to master');
    }, 500);
    
    // Cleanup: Dispose service on unmount
    return () => {
      console.log('🔴 TeleprompterWindow: disposing SyncService');
      syncService.dispose();
    };
  }, [autoMirrorX, autoMirrorY, setMirrorX, setMirrorY]);
  
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
   * ❌ LISTENER DE WHEEL DESHABILITADO EN EL DIV RAÍZ
   * ❌ WHEEL LISTENER DISABLED ON ROOT DIV
   * 
   * PROBLEMA: Había dos handlers de wheel compitiendo:
   * 1. Este listener en el div raíz (enviaba requestChange al master)
   * 2. El onWheel del TeleprompterScreen (inercia local)
   * 
   * Esto causaba doble procesamiento del mismo evento y desincronización.
   * 
   * SOLUCIÓN: Eliminado este listener. Solo TeleprompterScreen maneja wheel
   * y usa requestChange para propagar cambios al master.
   */
  
  // DISABLED - Wheel handling now only in TeleprompterScreen
  // This fixes the double-handler bug that caused scroll desync
  
  // ===== MANEJADORES DE TRANSPORTE / TRANSPORT HANDLERS =====
  /**
   * Todos los handlers delegan al store local
   * El store notificará a SyncService automáticamente
   * 
   * All handlers delegate to local store
   * Store will notify SyncService automatically
   */
  
  /**
   * Play/Pause - NO resetea al pausar
   * ✅ CORREGIDO: Solo pausa, NUNCA resetea
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
    
    if (currentState.isPlaying) {
      console.log('   🔴 Llamando pause() - SIN reset');
      pause(); // ✅ SOLO PAUSA - NO HACE RESET
    } else {
      console.log('   🟢 Llamando play()...');
      play(); // ✅ CONTINÚA DESDE POSICIÓN ACTUAL
    }
    
    console.log('═══════════════════════════════════════');
  };
  
  const handleReset = () => {
    console.log('⏮️ TeleprompterWindow: reset to beginning');
    pause(); // Pausar primero
    reset(); // Resetear posición
  };
  
  const handleStop = () => {
    console.log('⏹️ TeleprompterWindow: stop (SOLO pause, NO reset)');
    pause(); // ✅ SOLO PAUSA - NO RESETEA
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
   * ✅ SIMPLIFICADO: Llamadas directas a funciones del store
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si no está escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      console.log('⌨️ Key pressed:', e.key, 'isPlaying:', isPlaying);
      
      switch (e.key) {
        case ' ': // ESPACIO = Play/Pause
          e.preventDefault();
          console.log('🎮 ESPACIO presionado, isPlaying:', isPlaying);
          if (isPlaying) {
            console.log('⏸️ Pausando...');
            pause();
          } else {
            console.log('▶️ Reproduciendo...');
            play();
          }
          break;
          
        case 'r':
        case 'R':
          e.preventDefault();
          console.log('⏮️ Reset');
          pause();
          reset();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          console.log('↑ Velocidad +0.1');
          adjustSpeed(0.1);
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          console.log('↓ Velocidad -0.1');
          adjustSpeed(-0.1);
          break;
          
        case '+':
        case '=':
          e.preventDefault();
          adjustFontSize(8);
          break;
          
        case '-':
        case '_':
          e.preventDefault();
          adjustFontSize(-8);
          break;
          
        case 'h':
        case 'H':
          if (!isPopup) {
            e.preventDefault();
            setShowControls(prev => !prev);
          }
          break;
          
        case 'PageDown':
          e.preventDefault();
          console.log('⏭️ PageDown: Next script');
          const nextSuccess = nextItem();
          console.log('   nextItem() returned:', nextSuccess);
          break;
          
        case 'PageUp':
          e.preventDefault();
          console.log('⏮️ PageUp: Previous script');
          const prevSuccess = previousItem();
          console.log('   previousItem() returned:', prevSuccess);
          break;
          
        case 'x':
        case 'X':
          e.preventDefault();
          toggleMirrorX();
          break;
          
        case 'y':
        case 'Y':
          e.preventDefault();
          toggleMirrorY();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, pause, play, reset, adjustSpeed, adjustFontSize, nextItem, previousItem, toggleMirrorX, toggleMirrorY, setShowControls, isPopup]);
  
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
      className={`h-screen w-screen bg-black text-white overflow-hidden flex flex-col ${
        isPopup && mirrorX ? 'border-8 border-blue-500' : ''
      }`}
    >
      {/* ===== PANEL DE INFORMACIÓN (SOLO EN VENTANA NO-POPUP) / INFO PANEL (ONLY IN NON-POPUP WINDOW) ===== */}
      {!isPopup && showControls && (
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
              <div>SHIFT + WHEEL = Velocidad</div>
              <div>CTRL + WHEEL = Tamaño fuente</div>
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
      
      {/* Botón flotante para mostrar controles (cuando están ocultos, SOLO EN NO-POPUP) */}
      {!isPopup && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 left-4 z-50 text-xs text-white/40 hover:text-white transition-colors px-3 py-1 rounded bg-black/60 hover:bg-black/80"
        >
          Mostrar (H)
        </button>
      )}
      
      {/* ===== INDICADOR DE VENTANA PRESENTADOR / PRESENTER WINDOW INDICATOR ===== */}
      {isPopup && mirrorX && (
        <div className="absolute top-4 right-4 z-50 bg-blue-500/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-bold">
          🪞 PRESENTADOR (Espejo)
        </div>
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
          mirrorX={mirrorX}
          mirrorY={mirrorY}
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
      
      {/* ===== BARRA DE CONTROLES (SOLO EN VENTANA NO-POPUP) / CONTROLS BAR (ONLY IN NON-POPUP WINDOW) ===== */}
      {!isPopup && showControls && (
        <div className="absolute bottom-4 right-4 z-50">
          <TeleprompterControls
            onBackward={handleBackward}
            onForward={handleForward}
          />
        </div>
      )}
    </div>
  );
}
