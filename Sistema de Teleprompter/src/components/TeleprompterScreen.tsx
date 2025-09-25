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
  const inertiaRef = useRef<number>(0);
  const inertiaDecay = 0.92; // Suavidad del scroll manual

  // Auto-scroll efecto más fluido
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
      // Más fluido y lento
      const pixelsPerSecond = speed * 14; // 14 es más lento y suave
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

  // Scroll manual con inercia suave
  useEffect(() => {
    let animationFrame: number | null = null;
    let localScroll = scrollPosition;
    function animateInertia() {
      if (Math.abs(inertiaRef.current) > 0.5) {
        localScroll = localScroll + inertiaRef.current;
        setScrollPosition(localScroll);
        inertiaRef.current *= inertiaDecay;
        animationFrame = window.requestAnimationFrame(animateInertia);
      }
    }
    if (Math.abs(inertiaRef.current) > 0.5) {
      animationFrame = window.requestAnimationFrame(animateInertia);
    }
    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPosition, setScrollPosition]);

  // Sincronizar scroll visual
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition, isManualScrolling]);

  // Handler para scroll del mouse con suavidad
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY;
    inertiaRef.current += delta * 0.18; // Factor para hacerlo lento y fluido
    // Limitar inercia máxima
    if (inertiaRef.current > 40) inertiaRef.current = 40;
    if (inertiaRef.current < -40) inertiaRef.current = -40;
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full bg-black text-white overflow-hidden relative"
      style={{ fontSize: `${fontSize}px` }}
      onWheel={handleWheel}
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