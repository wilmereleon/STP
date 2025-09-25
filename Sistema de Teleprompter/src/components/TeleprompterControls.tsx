import { Play, Pause, RotateCcw, Square, SkipBack, SkipForward } from 'lucide-react';

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
  
  // Debug handlers with direct event prevention
  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls PLAY/PAUSE clicked - isPlaying:', isPlaying);
    onPlayPause();
  };

  const handleBackwardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls BACKWARD clicked');
    onBackward();
  };

  const handleForwardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls FORWARD clicked');
    onForward();
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls STOP clicked');
    onStop();
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 TeleprompterControls RESET clicked');
    onReset();
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
      {/* Main Controls */}
      <button
        onClick={handleBackwardClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Retroceder"
        type="button"
      >
        <SkipBack className="h-4 w-4" />
      </button>
      
      <button
        onClick={handlePlayPauseClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title={isPlaying ? "Pausar" : "Reproducir"}
        type="button"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <button
        onClick={handleForwardClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Avanzar"
        type="button"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      <button
        onClick={handleStopClick}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
        title="Detener"
        type="button"
      >
        <Square className="h-4 w-4" />
      </button>
      
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

      {/* Speed Controls */}
      <div className="flex items-center gap-1 mx-2 border-l border-gray-600 pl-2">
        <span className="text-gray-400 text-xs">V:</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔴 Speed DOWN clicked, current:', speed);
            onSpeedChange(Math.max(0.1, speed - 0.1)); // Incrementos más pequeños
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
            console.log('🔴 Speed UP clicked, current:', speed);
            onSpeedChange(Math.min(5, speed + 0.1)); // Máximo más bajo, incrementos más pequeños
          }}
          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
          title="Aumentar velocidad"
          type="button"
        >
          <span className="text-xs">+</span>
        </button>
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center gap-1 mx-2 border-l border-gray-600 pl-2">
        <span className="text-gray-400 text-xs">F:</span>
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
        <span className="text-white text-xs font-mono w-12 text-center">{fontSize}px</span>
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