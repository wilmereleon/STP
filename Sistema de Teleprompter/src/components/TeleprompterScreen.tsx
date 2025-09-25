import { useEffect, useRef } from 'react';
import { TextWithJumpMarkers } from './TextWithJumpMarkers';

interface TeleprompterScreenProps {
  text: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  onEnd: () => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
  isManualScrolling?: boolean;
  onJumpToPosition?: (position: number) => void;
}

export function TeleprompterScreen({ 
  text, 
  isPlaying, 
  speed, 
  fontSize, 
  onEnd,
  scrollPosition,
  setScrollPosition,
  isManualScrolling = false,
  onJumpToPosition
}: TeleprompterScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Auto-scroll efecto corregido para pantalla completa
  useEffect(() => {
    let animationFrame: number | null = null;
    let lastTimestamp: number | null = null;

    function animateScroll(timestamp: number) {
      if (!isPlaying || isManualScrolling) {
        lastTimestamp = null;
        return;
      }
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      // Ajusta la velocidad: menor valor = más lento
      const pixelsPerSecond = speed * 20; // 20 es lento y legible
      const increment = (pixelsPerSecond * elapsed) / 1000;
      const newPos = scrollPosition + increment;

      // Detectar final del texto
      if (containerRef.current) {
        const container = containerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const endThreshold = maxScroll - 100;
        if (newPos >= endThreshold && newPos > 100) {
          setTimeout(() => onEnd(), 1000);
          return;
        }
      }

      setScrollPosition(newPos);
      lastTimestamp = timestamp;
      animationFrame = window.requestAnimationFrame(animateScroll);
    }

    if (isPlaying && !isManualScrolling) {
      animationFrame = window.requestAnimationFrame(animateScroll);
    }

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      lastTimestamp = null;
    };
  }, [isPlaying, speed, onEnd, setScrollPosition, isManualScrolling, scrollPosition]);

  useEffect(() => {
    if (containerRef.current) {
      console.log('🎬 TeleprompterScreen: Setting scroll position:', scrollPosition, 'isManualScrolling:', isManualScrolling);
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition, isManualScrolling]);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full bg-black text-white overflow-hidden relative"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="p-8 pb-96">
        {text ? (
          <TextWithJumpMarkers
            text={text}
            onJumpToPosition={onJumpToPosition}
            fontSize={fontSize}
            className=""
            style={{ lineHeight: 1.6 }}
            showJumpIcons={true}
          />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p>No hay texto para mostrar</p>
            <p className="text-sm">Escribe texto en el editor principal</p>
          </div>
        )}
      </div>

      {/* Gradient overlay at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}