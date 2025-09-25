

  import { useEffect, useRef, useState, useCallback } from 'react';
  import { TeleprompterScreen } from './TeleprompterScreen';
  import { TeleprompterControls } from './TeleprompterControls';
  import { useMacros, defaultMacroSettings, MacroSettings } from './useMacros';



interface TeleprompterData {
  text: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  scrollPosition: number;
}


export function TeleprompterWindow() {

  // State for teleprompter data
  const [data, setData] = useState<TeleprompterData>({
    text: '',
    isPlaying: false,
    speed: 1.0, // Velocidad inicial más lenta
    fontSize: 36,
    scrollPosition: 0
  });

  // Refs para animación de auto-scroll
  const isPlayingRef = useRef(data.isPlaying);
  const speedRef = useRef(data.speed);
  useEffect(() => { isPlayingRef.current = data.isPlaying; }, [data.isPlaying]);
  useEffect(() => { speedRef.current = data.speed; }, [data.speed]);

  // Animación de auto-scroll cuando isPlaying es true
  useEffect(() => {
    if (!isPlayingRef.current) return;
    let frame: number;
    let lastTime = performance.now();
    function animate(now: number) {
      if (!isPlayingRef.current) return;
      const elapsed = now - lastTime;
      lastTime = now;
      // Igual que en TeleprompterScreen: velocidad más suave
      const pixelsPerSecond = speedRef.current * 14;
      const increment = (pixelsPerSecond * elapsed) / 1000;
      setData((prev: TeleprompterData) => ({ ...prev, scrollPosition: prev.scrollPosition + increment }));
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [data.isPlaying, data.speed]);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [macroSettings] = useState<MacroSettings>(() => {
    try {
      const saved = localStorage.getItem('macroSettings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultMacroSettings;
  });

  // Ref for the teleprompter area to attach wheel event
  const teleprompterAreaRef = useRef<HTMLDivElement>(null);

  // Handle mouse wheel to control speed and start playing
  useEffect(() => {
    const area = teleprompterAreaRef.current;
    if (!area) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // DeltaY > 0: scroll down (faster), < 0: scroll up (slower)
      let newSpeed = data.speed + (e.deltaY > 0 ? 0.1 : -0.1);
      newSpeed = Math.max(0.1, Math.min(5, Math.round(newSpeed * 100) / 100));
  setData((prev: TeleprompterData) => ({ ...prev, speed: newSpeed, isPlaying: true }));
      // Also notify parent
      if (window.opener) {
        window.opener.postMessage({
          type: 'TELEPROMPTER_CONTROL',
          data: { speed: newSpeed, isPlaying: true }
        }, '*');
      }
    };
    area.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      area.removeEventListener('wheel', handleWheel);
    };
  }, [data.speed]);

  useEffect(() => {
    // Listen for messages from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TELEPROMPTER_UPDATE') {
        setData(event.data.data);
        setIsConnected(true);
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that window is ready
    const notifyParent = () => {
  setConnectionAttempts((prev: number) => prev + 1);
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'TELEPROMPTER_READY' }, '*');
      } else {
        if (connectionAttempts < 50) { // Try for 5 seconds
          setTimeout(notifyParent, 100);
        }
      }
    };

    // Delay notification to ensure parent window is ready
    setTimeout(notifyParent, 100);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const sendUpdate = useCallback((updates: Partial<TeleprompterData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    if (window.opener) {
      window.opener.postMessage({
        type: 'TELEPROMPTER_CONTROL',
        data: updates
      }, '*');
    }
  }, [data]);


  const handlePlayPause = useCallback(() => {
    // Si está al final, no reiniciar scrollPosition, solo pausar/reanudar
    sendUpdate({ isPlaying: !data.isPlaying });
  }, [data, sendUpdate]);

  const handleReset = useCallback(() => {
    sendUpdate({ isPlaying: false, scrollPosition: 0 });
  }, [sendUpdate]);

  const handleStop = useCallback(() => {
    sendUpdate({ isPlaying: false, scrollPosition: 0 });
  }, [sendUpdate]);

  const handleForward = useCallback(() => {
    sendUpdate({ scrollPosition: data.scrollPosition + 50 });
  }, [data, sendUpdate]);

  const handleBackward = useCallback(() => {
    sendUpdate({ scrollPosition: Math.max(0, data.scrollPosition - 50) });
  }, [data, sendUpdate]);

  const handleEnd = useCallback(() => {
    sendUpdate({ isPlaying: false });
  }, [sendUpdate]);


  const handleSpeedChange = useCallback((speed: number) => {
    // Limitar el rango y actualizar correctamente
    const newSpeed = Math.max(0.1, Math.min(5, Math.round(speed * 100) / 100));
    sendUpdate({ speed: newSpeed });
  }, [sendUpdate]);


  const handleFontSizeChange = useCallback((fontSize: number) => {
    // Limitar el rango y actualizar correctamente
    const newFontSize = Math.max(12, Math.min(200, Math.round(fontSize)));
    sendUpdate({ fontSize: newFontSize });
  }, [sendUpdate]);

  const handleScrollPositionChange = useCallback((scrollPosition: number) => {
    sendUpdate({ scrollPosition });
  }, [sendUpdate]);

  // Macros support in popup
  // Helper: get all cue/guion marker positions in the text
  function getCuePositions(text: string): number[] {
    const lines = text.split('\n');
    let positions: number[] = [];
    let currentPos = 0;
    for (const line of lines) {
      // Match [1], [2], ... or lines with all caps and colon, or markdown headings
      if (/^(\[\d+\])/.test(line) || /^(#{1,3}\s+.+|[A-Z][A-Z\s]+:|^\*\*.+\*\*)/.test(line)) {
        positions.push(currentPos);
      }
      currentPos += line.length + 1;
    }
    return positions;
  }

  // Macro handlers for cues
  const handleNextCue = useCallback(() => {
    const positions = getCuePositions(data.text);
    const current = data.scrollPosition;
    // Find the first cue after current scrollPosition
    const next = positions.find(pos => pos > current + 10); // +10 for tolerance
    if (typeof next === 'number') {
      sendUpdate({ scrollPosition: next });
    }
  }, [data.text, data.scrollPosition, sendUpdate]);

  const handlePreviousCue = useCallback(() => {
    const positions = getCuePositions(data.text);
    const current = data.scrollPosition;
    // Find the last cue before current scrollPosition
    const prev = [...positions].reverse().find(pos => pos < current - 10); // -10 for tolerance
    if (typeof prev === 'number') {
      sendUpdate({ scrollPosition: prev });
    }
  }, [data.text, data.scrollPosition, sendUpdate]);

  useMacros(
    macroSettings,
    {
      onPlayStop: handlePlayPause,
      onPause: () => sendUpdate({ isPlaying: false }),
      onPrevious: handleBackward,
      onNext: handleForward,
      onIncreaseSpeed: () => handleSpeedChange(Math.min(5, data.speed + 0.1)),
      onDecreaseSpeed: () => handleSpeedChange(Math.max(0.1, data.speed - 0.1)),
      onIncreaseFontSize: () => handleFontSizeChange(data.fontSize + 2),
      onDecreaseFontSize: () => handleFontSizeChange(data.fontSize - 2),
      onNextCue: handleNextCue,
      onPreviousCue: handlePreviousCue,
    },
    true
  );

  if (!isConnected) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">
            {connectionAttempts < 50 ? 'Conectando con ventana principal...' : 'Error de conexión'}
          </div>
          <div className="text-gray-400">
            {connectionAttempts < 50 
              ? 'Asegúrate de que la ventana principal esté abierta' 
              : 'No se pudo conectar con la ventana principal. Cierra esta ventana y vuelve a intentar.'
            }
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Intentos: {connectionAttempts}/50
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen bg-black flex flex-col relative"
      ref={teleprompterAreaRef}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Fixed Header with controls, hideable */}
      {showControls && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur border-b border-gray-800 flex flex-col">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="text-white text-sm">
              Teleprompter - {data.isPlaying ? 'REPRODUCIENDO' : 'PAUSADO'}
            </div>
            <div className="flex items-center gap-2">
              <TeleprompterControls
                isPlaying={data.isPlaying}
                speed={data.speed}
                fontSize={data.fontSize}
                onPlayPause={handlePlayPause}
                onReset={handleReset}
                onStop={handleStop}
                onForward={handleForward}
                onBackward={handleBackward}
                onSpeedChange={handleSpeedChange}
                onFontSizeChange={handleFontSizeChange}
              />
              <button
                className="ml-2 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-900/60 rounded border border-gray-700"
                onClick={() => setShowControls(false)}
                title="Ocultar barra de controles"
              >
                Ocultar
              </button>
            </div>
          </div>
        </div>
      )}
      {!showControls && (
        <button
          className="fixed top-2 right-2 z-30 px-3 py-1 text-xs text-gray-400 hover:text-white bg-gray-900/80 rounded border border-gray-700"
          onClick={() => setShowControls(true)}
          title="Mostrar barra de controles"
        >
          Mostrar controles
        </button>
      )}

      {/* Static red guide line (apuntador) overlay - fixed to viewport */}
      <div
        className="pointer-events-none z-30"
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          width: '100vw',
          height: 0,
          borderTop: '3px solid red',
          transform: 'translateY(-1.5px)',
        }}
        aria-hidden="true"
      />

      {/* Teleprompter Screen */}
      <div className="flex-1 pt-20">
        <TeleprompterScreen
          text={data.text}
          isPlaying={data.isPlaying}
          speed={data.speed}
          fontSize={data.fontSize}
          onEnd={handleEnd}
          scrollPosition={data.scrollPosition}
          setScrollPosition={handleScrollPositionChange}
        />
      </div>
    </div>
  );
}