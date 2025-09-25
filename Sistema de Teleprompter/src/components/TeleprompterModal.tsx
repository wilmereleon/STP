import { useEffect, useState, useRef } from 'react';
import { TeleprompterScreen } from './TeleprompterScreen';
import { TeleprompterControls } from './TeleprompterControls';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface TeleprompterModalProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  initialFontSize?: number;
  initialSpeed?: number;
  onStateChange?: (isPlaying: boolean, speed: number, fontSize: number, scrollPosition: number) => void;
  onJumpToPosition?: (position: number) => void;
}

export function TeleprompterModal({ 
  text, 
  isOpen, 
  onClose, 
  initialFontSize = 36, 
  initialSpeed = 3,
  onStateChange,
  onJumpToPosition
}: TeleprompterModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(Math.max(0.1, initialSpeed)); // Asegurar velocidades lentas
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state changes back to parent
  useEffect(() => {
    if (onStateChange) {
      onStateChange(isPlaying, speed, fontSize, scrollPosition);
    }
  }, [isPlaying, speed, fontSize, scrollPosition, onStateChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSpeed(prev => Math.min(5, prev + 0.1)); // Velocidades más lentas
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSpeed(prev => Math.max(0.1, prev - 0.1)); // Velocidades más lentas
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleBackward();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleReset();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setFontSize(prev => Math.min(500, prev + 8));
          break;
        case '-':
        case '_':
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

  // Mouse wheel control handler for teleprompter modal
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;
    const delta = e.deltaY > 0 ? 1 : -1;
    
    console.log('🖱️ Modal wheel:', { delta, ctrl: isCtrlPressed, shift: isShiftPressed, alt: isAltPressed });
    
    if (isCtrlPressed) {
      // Ctrl + Wheel = Speed control (velocidades más lentas)
      const speedDelta = delta * 0.1; // Incrementos más pequeños
      const newSpeed = Math.max(0.1, Math.min(5, speed + speedDelta)); // Rango más lento
      console.log('🖱️ Modal speed change:', speed, '->', newSpeed);
      setSpeed(newSpeed);
    } else if (isShiftPressed) {
      // Shift + Wheel = Font size control
      const fontDelta = delta * 8;
      const newFontSize = Math.max(12, Math.min(500, fontSize + fontDelta));
      console.log('🖱️ Modal font size change:', fontSize, '->', newFontSize);
      setFontSize(newFontSize);
    } else {
      // Normal wheel = Manual scroll control
      const scrollDelta = delta * (isAltPressed ? 30 : 100); // Larger increments for modal
      const newScrollPosition = Math.max(0, scrollPosition + scrollDelta);
      console.log('🖱️ Modal manual scroll:', scrollPosition, '->', newScrollPosition);
      
      // Set manual scrolling mode
      setIsManualScrolling(true);
      setScrollPosition(newScrollPosition);
      
      // Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      
      // Resume auto-scroll after 3 seconds of inactivity
      manualScrollTimeoutRef.current = setTimeout(() => {
        console.log('🖱️ Modal manual scroll timeout - resuming auto-scroll');
        setIsManualScrolling(false);
      }, 3000);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported or denied');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setScrollPosition(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setScrollPosition(0);
  };

  const handleForward = () => {
    setScrollPosition(prev => prev + 50);
  };

  const handleBackward = () => {
    setScrollPosition(prev => Math.max(0, prev - 50));
  };

  const handleEnd = () => {
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex flex-col cursor-grab active:cursor-grabbing" 
      onWheel={handleWheel}
      title="Scroll: Mover texto | Ctrl+Scroll: Velocidad | Shift+Scroll: Tamaño fuente | Alt+Scroll: Control fino"
    >
      {/* Header with controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/50 backdrop-blur rounded-lg p-2 flex items-center gap-2">
            <div className="text-white text-sm flex items-center gap-2">
              Teleprompter - {isManualScrolling ? 'MANUAL' : isPlaying ? 'AUTO' : 'PAUSADO'}
              {isManualScrolling && <span className="text-yellow-400">🖱️</span>}
            </div>
            <div className="text-gray-400 text-xs">
              {Math.round(fontSize)}px | Velocidad: {speed.toFixed(1)} | Pos: {Math.round(scrollPosition)}px
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TeleprompterControls
              isPlaying={isPlaying}
              speed={speed}
              fontSize={fontSize}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onStop={handleStop}
              onForward={handleForward}
              onBackward={handleBackward}
              onSpeedChange={setSpeed}
              onFontSizeChange={setFontSize}
            />
            
            <div className="bg-black/50 backdrop-blur rounded-lg p-1 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 p-2"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
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

      {/* Teleprompter Screen */}
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

      {/* Instructions overlay (only shown when not playing) */}
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