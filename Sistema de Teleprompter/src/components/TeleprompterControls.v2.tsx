// ===== IMPORTACIONES / IMPORTS =====
import { Play, Pause, RotateCcw, Square, SkipBack, SkipForward } from 'lucide-react';
import { useTeleprompterStore } from '../hooks';
import { useRunOrderStore } from '../hooks';

/**
 * Propiedades opcionales para callbacks externos
 * Optional properties for external callbacks
 */
interface TeleprompterControlsProps {
  /**
   * Callback opcional para navegación a script anterior
   * Optional callback for navigating to previous script
   */
  onBackward?: () => void;
  
  /**
   * Callback opcional para navegación a script siguiente
   * Optional callback for navigating to next script
   */
  onForward?: () => void;
}

/**
 * TeleprompterControls - Controles de transporte del teleprompter (REFACTORIZADO)
 * TeleprompterControls - Teleprompter transport controls (REFACTORED)
 * 
 * Versión 2.0 usando Stores directamente (sin props drilling).
 * Version 2.0 using Stores directly (no props drilling).
 * 
 * Barra de controles compacta similar a un reproductor multimedia con:
 * - Controles principales: Retroceder, Play/Pause, Avanzar, Detener, Reiniciar
 * - Controles de velocidad: Incrementos de 0.1x (rango: 0.1-5x)
 * - Controles de tamaño de fuente: Incrementos de 8px (rango: 12-500px)
 * - Prevención de propagación de eventos para evitar conflictos
 * - Logs de debug para troubleshooting
 * 
 * Compact control bar similar to media player with:
 * - Main controls: Backward, Play/Pause, Forward, Stop, Reset
 * - Speed controls: 0.1x increments (range: 0.1-5x)
 * - Font size controls: 8px increments (range: 12-500px)
 * - Event propagation prevention to avoid conflicts
 * - Debug logs for troubleshooting
 * 
 * CAMBIOS EN v2.0:
 * - ✅ Eliminados 7 props (isPlaying, speed, fontSize, onPlayPause, onReset, onStop, onSpeedChange, onFontSizeChange)
 * - ✅ Usa useTeleprompterStore() directamente
 * - ✅ Usa useRunOrderStore() para navegación
 * - ✅ Callbacks externos opcionales para backwards compatibility
 * 
 * @component
 * @param {TeleprompterControlsProps} props - Propiedades opcionales / Optional properties
 * @returns {JSX.Element} Barra de controles / Control bar
 * 
 * @example
 * ```tsx
 * // Uso simple sin props
 * <TeleprompterControls />
 * 
 * // Con callbacks personalizados para navegación
 * <TeleprompterControls
 *   onBackward={handleCustomBackward}
 *   onForward={handleCustomForward}
 * />
 * ```
 */
export function TeleprompterControls({
  onBackward,
  onForward
}: TeleprompterControlsProps = {}) {
  
  // ===== HOOKS / HOOKS =====
  const {
    isPlaying,
    speed,
    fontSize,
    play,
    pause,
    reset,
    setSpeed,
    setFontSize
  } = useTeleprompterStore();
  
  const runOrder = useRunOrderStore();
  
  // ===== MANEJADORES DE EVENTOS / EVENT HANDLERS =====
  
  /**
   * Maneja Play/Pause
   */
  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls PLAY/PAUSE clicked - isPlaying:', isPlaying);
    
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  /**
   * Maneja Retroceder (script anterior)
   */
  const handleBackward = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls BACKWARD clicked');
    
    if (onBackward) {
      onBackward();
    } else {
      // Default: usar RunOrderStore
      runOrder.previousItem();
    }
  };

  /**
   * Maneja Avanzar (script siguiente)
   */
  const handleForward = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls FORWARD clicked');
    
    if (onForward) {
      onForward();
    } else {
      // Default: usar RunOrderStore
      runOrder.nextItem();
    }
  };

  /**
   * Maneja Detener (pause + reset)
   */
  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls STOP clicked');
    
    pause();
    reset();
  };

  /**
   * Maneja Reiniciar
   */
  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls RESET clicked');
    
    reset();
  };

  /**
   * Ajusta velocidad
   */
  const handleSpeedChange = (delta: number) => {
    const newSpeed = Math.max(0.1, Math.min(5.0, speed + delta));
    console.log('🔴 Speed change:', speed, '→', newSpeed);
    setSpeed(newSpeed);
  };

  /**
   * Ajusta tamaño de fuente
   */
  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(500, fontSize + delta));
    console.log('🔴 Font size change:', fontSize, '→', newSize);
    setFontSize(newSize);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
      {/* ===== CONTROLES PRINCIPALES / MAIN CONTROLS ===== */}
      
      {/* Botón Retroceder */}
      <button
        onClick={handleBackward}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Retroceder"
        type="button"
      >
        <SkipBack className="h-4 w-4" />
      </button>
      
      {/* Botón Play/Pause */}
      <button
        onClick={handlePlayPause}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title={isPlaying ? "Pausar" : "Reproducir"}
        type="button"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      {/* Botón Avanzar */}
      <button
        onClick={handleForward}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Avanzar"
        type="button"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      {/* Botón Detener */}
      <button
        onClick={handleStop}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Detener"
        type="button"
      >
        <Square className="h-4 w-4" />
      </button>
      
      {/* Botón Reiniciar */}
      <button
        onClick={handleReset}
        className={`h-8 w-8 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center transition-colors ${
          isPlaying ? 'text-gray-400' : 'text-green-400'
        }`}
        title="Reiniciar al inicio"
        type="button"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {/* ===== CONTROLES DE VELOCIDAD / SPEED CONTROLS ===== */}
      <div className="flex items-center gap-1 mx-2 border-l border-gray-600 pl-2">
        <span className="text-gray-400 text-xs">V:</span>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSpeedChange(-0.1);
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Reducir velocidad"
          type="button"
        >
          <span className="text-xs">-</span>
        </button>
        
        <span className="text-white text-xs font-mono w-8 text-center">{speed.toFixed(1)}</span>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSpeedChange(0.1);
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Aumentar velocidad"
          type="button"
        >
          <span className="text-xs">+</span>
        </button>
      </div>

      {/* ===== CONTROLES DE TAMAÑO DE FUENTE / FONT SIZE CONTROLS ===== */}
      <div className="flex items-center gap-1 mx-2 border-l border-gray-600 pl-2">
        <span className="text-gray-400 text-xs">F:</span>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFontSizeChange(-8);
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Reducir tamaño de fuente"
          type="button"
        >
          <span className="text-xs">-</span>
        </button>
        
        <span className="text-white text-xs font-mono w-12 text-center">{fontSize}px</span>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFontSizeChange(8);
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Aumentar tamaño de fuente"
          type="button"
        >
          <span className="text-xs">+</span>
        </button>
      </div>
    </div>
  );
}
