// ===== IMPORTACIONES / IMPORTS =====
// Iconos de Lucide React para controles de transporte / Lucide React icons for transport controls
import { Play, Pause, RotateCcw, Square, SkipBack, SkipForward } from 'lucide-react';

/**
 * Propiedades del componente TeleprompterControls
 * TeleprompterControls component properties
 * 
 * @interface TeleprompterControlsProps
 * @property {boolean} isPlaying - Estado de reproducción (reproduciendo/pausado) / Playback state (playing/paused)
 * @property {number} speed - Velocidad de scroll actual (0.1-5x) / Current scroll speed (0.1-5x)
 * @property {number} fontSize - Tamaño de fuente actual (12-500px) / Current font size (12-500px)
 * @property {() => void} onPlayPause - Callback para alternar play/pausa / Callback to toggle play/pause
 * @property {() => void} onReset - Callback para reiniciar al inicio / Callback to reset to beginning
 * @property {() => void} onStop - Callback para detener completamente / Callback to stop completely
 * @property {() => void} onForward - Callback para avanzar al siguiente guion / Callback to advance to next script
 * @property {() => void} onBackward - Callback para retroceder al guion anterior / Callback to go back to previous script
 * @property {(speed: number) => void} onSpeedChange - Callback al cambiar velocidad / Callback when speed changes
 * @property {(size: number) => void} onFontSizeChange - Callback al cambiar tamaño de fuente / Callback when font size changes
 */
interface TeleprompterControlsProps {
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  onPlayPause: () => void;
  onReset: () => void;
  onStop: () => void;
  onForward: () => void;
  onBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onFontSizeChange: (size: number) => void;
}

/**
 * TeleprompterControls - Controles de transporte del teleprompter
 * TeleprompterControls - Teleprompter transport controls
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
 * @component
 * @param {TeleprompterControlsProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Barra de controles / Control bar
 */
export function TeleprompterControls({
  isPlaying,
  speed,
  fontSize,
  onPlayPause,
  onReset,
  onStop,
  onForward,
  onBackward,
  onSpeedChange,
  onFontSizeChange
}: TeleprompterControlsProps) {
  
  // ===== MANEJADORES DE EVENTOS CON DEBUG / EVENT HANDLERS WITH DEBUG =====
  // Todos los handlers previenen propagación para evitar conflictos con otros eventos
  // All handlers prevent propagation to avoid conflicts with other events
  
  /**
   * Maneja el click en Play/Pause con prevención de propagación
   * Handles Play/Pause click with propagation prevention
   */
  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir comportamiento por defecto / Prevent default behavior
    e.stopPropagation(); // Evitar que el evento suba / Stop event bubbling
    console.log('🔴 TeleprompterControls PLAY/PAUSE clicked - isPlaying:', isPlaying);
    onPlayPause();
  };

  /**
   * Maneja el click en Retroceder (script anterior)
   * Handles Backward click (previous script)
   */
  const handleBackwardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls BACKWARD clicked');
    onBackward();
  };

  /**
   * Maneja el click en Avanzar (script siguiente)
   * Handles Forward click (next script)
   */
  const handleForwardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls FORWARD clicked');
    onForward();
  };

  /**
   * Maneja el click en Detener
   * Handles Stop click
   */
  const handleStopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls STOP clicked');
    onStop();
  };

  /**
   * Maneja el click en Reiniciar (volver al inicio)
   * Handles Reset click (return to beginning)
   */
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls RESET clicked');
    onReset();
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
      {/* ===== CONTROLES PRINCIPALES / MAIN CONTROLS ===== */}
      {/* Botones de transporte estilo reproductor multimedia / Media player style transport buttons */}
      
      {/* Botón Retroceder - Script anterior / Backward button - Previous script */}
      <button
        onClick={handleBackwardClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Retroceder"
        type="button"
      >
        <SkipBack className="h-4 w-4" />
      </button>
      
      {/* Botón Play/Pause - Alterna entre reproducción y pausa / Play/Pause button - Toggles between play and pause */}
      {/* Icono cambia dinámicamente según estado / Icon changes dynamically based on state */}
      <button
        onClick={handlePlayPauseClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title={isPlaying ? "Pausar" : "Reproducir"}
        type="button"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      {/* Botón Avanzar - Script siguiente / Forward button - Next script */}
      <button
        onClick={handleForwardClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Avanzar"
        type="button"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      {/* Botón Detener - Detiene reproducción / Stop button - Stops playback */}
      <button
        onClick={handleStopClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Detener"
        type="button"
      >
        <Square className="h-4 w-4" />
      </button>
      
      {/* Botón Reiniciar - Vuelve al inicio del script / Reset button - Returns to script beginning */}
      {/* Color verde cuando está pausado como indicador visual / Green color when paused as visual indicator */}
      <button
        onClick={handleResetClick}
        className={`h-8 w-8 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center transition-colors ${
          isPlaying ? 'text-gray-400' : 'text-green-400'
        }`}
        title="Reiniciar al inicio"
        type="button"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {/* ===== CONTROLES DE VELOCIDAD / SPEED CONTROLS ===== */}
      {/* Sección separada con borde izquierdo / Separated section with left border */}
      <div className="flex items-center gap-1 mx-2 border-l border-gray-600 pl-2">
        {/* Etiqueta "V:" (Velocidad) / Label "V:" (Velocity) */}
        <span className="text-gray-400 text-xs">V:</span>
        
        {/* Botón reducir velocidad / Decrease speed button */}
        {/* Decremento de 0.1x, mínimo 0.1x / 0.1x decrement, minimum 0.1x */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔴 Speed DOWN clicked, current:', speed);
            onSpeedChange(Math.max(0.1, speed - 0.1)); // Incrementos más pequeños / Smaller increments
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Reducir velocidad"
          type="button"
        >
          <span className="text-xs">-</span>
        </button>
        
        {/* Display de velocidad actual con fuente monoespaciada / Current speed display with monospace font */}
        {/* toFixed(1) muestra un decimal / toFixed(1) shows one decimal */}
        <span className="text-white text-xs font-mono w-8 text-center">{speed.toFixed(1)}</span>
        
        {/* Botón aumentar velocidad / Increase speed button */}
        {/* Incremento de 0.1x, máximo 5x / 0.1x increment, maximum 5x */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔴 Speed UP clicked, current:', speed);
            onSpeedChange(Math.min(5, speed + 0.1)); // Máximo más bajo, incrementos más pequeños / Lower maximum, smaller increments
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Aumentar velocidad"
          type="button"
        >
          <span className="text-xs">+</span>
        </button>
      </div>

      {/* ===== CONTROLES DE TAMAÑO DE FUENTE / FONT SIZE CONTROLS ===== */}
      {/* Sección separada con borde izquierdo / Separated section with left border */}
      <div className="flex items-center gap-1 mx-2 border-l border-gray-600 pl-2">
        {/* Etiqueta "F:" (Font/Fuente) / Label "F:" (Font) */}
        <span className="text-gray-400 text-xs">F:</span>
        
        {/* Botón reducir tamaño de fuente / Decrease font size button */}
        {/* Decremento de 8px, mínimo 12px / 8px decrement, minimum 12px */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newSize = Math.max(12, fontSize - 8);
            console.log('🔴 TELEPROMPTER CONTROLS - Font SIZE DOWN clicked, current:', fontSize, 'new:', newSize);
            onFontSizeChange(newSize);
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Reducir tamaño de fuente"
          type="button"
        >
          <span className="text-xs">-</span>
        </button>
        
        {/* Display de tamaño de fuente actual con fuente monoespaciada / Current font size display with monospace font */}
        {/* Ancho fijo (w-12) para estabilidad visual / Fixed width (w-12) for visual stability */}
        <span className="text-white text-xs font-mono w-12 text-center">{fontSize}px</span>
        
        {/* Botón aumentar tamaño de fuente / Increase font size button */}
        {/* Incremento de 8px, máximo 500px / 8px increment, maximum 500px */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newSize = Math.min(500, fontSize + 8);
            console.log('🔴 TELEPROMPTER CONTROLS - Font SIZE UP clicked, current:', fontSize, 'new:', newSize);
            onFontSizeChange(newSize);
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