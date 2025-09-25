import { useEffect, useRef, useState } from 'react';
import { TeleprompterScreen } from './TeleprompterScreen';
import { TeleprompterControls } from './TeleprompterControls';

interface TeleprompterData {
  text: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  scrollPosition: number;
}

export function TeleprompterWindow() {
  const [data, setData] = useState<TeleprompterData>({
    text: '',
    isPlaying: false,
    speed: 1.0, // Velocidad inicial más lenta
    fontSize: 36,
    scrollPosition: 0
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

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
      setConnectionAttempts(prev => prev + 1);
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

  const sendUpdate = (updates: Partial<TeleprompterData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    
    if (window.opener) {
      window.opener.postMessage({
        type: 'TELEPROMPTER_CONTROL',
        data: updates
      }, '*');
    }
  };

  const handlePlayPause = () => {
    sendUpdate({ isPlaying: !data.isPlaying });
  };

  const handleReset = () => {
    sendUpdate({ isPlaying: false, scrollPosition: 0 });
  };

  const handleStop = () => {
    sendUpdate({ isPlaying: false, scrollPosition: 0 });
  };

  const handleForward = () => {
    sendUpdate({ scrollPosition: data.scrollPosition + 50 });
  };

  const handleBackward = () => {
    sendUpdate({ scrollPosition: Math.max(0, data.scrollPosition - 50) });
  };

  const handleEnd = () => {
    sendUpdate({ isPlaying: false });
  };

  const handleSpeedChange = (speed: number) => {
    sendUpdate({ speed });
  };

  const handleFontSizeChange = (fontSize: number) => {
    sendUpdate({ fontSize });
  };

  const handleScrollPositionChange = (scrollPosition: number) => {
    sendUpdate({ scrollPosition });
  };

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
    <div className="h-screen w-screen bg-black flex flex-col relative">
      {/* Header with controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/50 backdrop-blur rounded-lg p-2">
            <div className="text-white text-sm">
              Teleprompter - {data.isPlaying ? 'REPRODUCIENDO' : 'PAUSADO'}
            </div>
          </div>
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
        </div>
      </div>

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
          transform: 'translateY(-1.5px)', // half the border width for perfect centering
        }}
        aria-hidden="true"
      />

      {/* Teleprompter Screen */}
      <div className="flex-1">
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