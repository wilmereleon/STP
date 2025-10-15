

  // ===== IMPORTACIONES / IMPORTS =====
// Hooks de React / React hooks
import { useEffect, useRef, useState, useCallback } from 'react';
// Componentes del teleprompter / Teleprompter components
import { TeleprompterScreen } from './TeleprompterScreen';
import { TeleprompterControls } from './TeleprompterControls';
// Hook personalizado para macros / Custom hook for macros
import { useMacros, defaultMacroSettings, MacroSettings } from './useMacros';

/**
 * Datos del teleprompter que se sincronizan entre ventanas
 * Teleprompter data that syncs between windows
 * 
 * @interface TeleprompterData
 * @property {string} text - Texto del guion / Script text
 * @property {boolean} isPlaying - Estado de reproducción / Playback state
 * @property {number} speed - Velocidad de scroll (0.1-5x) / Scroll speed (0.1-5x)
 * @property {number} fontSize - Tamaño de fuente en píxeles (12-500px) / Font size in pixels (12-500px)
 * @property {number} scrollPosition - Posición de scroll en píxeles / Scroll position in pixels
 */
interface TeleprompterData {
  text: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  scrollPosition: number;
}

/**
 * TeleprompterWindow - Ventana emergente del teleprompter
 * TeleprompterWindow - Teleprompter popup window
 * 
 * Componente que se ejecuta en una ventana emergente (popup) separada para mostrar
 * el teleprompter en pantalla completa. Se comunica con la ventana principal mediante
 * el API de postMessage para sincronizar el estado.
 * 
 * Component that runs in a separate popup window to display the teleprompter
 * in fullscreen. Communicates with main window via postMessage API to sync state.
 * 
 * Características principales / Main features:
 * - Comunicación bidireccional con ventana principal / Two-way communication with main window
 * - Auto-scroll independiente sincronizado / Independent synchronized auto-scroll
 * - Control mediante rueda del mouse / Mouse wheel control
 * - Controles ocultables en barra superior / Hideable controls in top bar
 * - Línea guía roja fija en centro de pantalla / Fixed red guide line at screen center
 * - Soporte completo de macros / Full macro support
 * - Detección automática de cues (marcadores) / Automatic cue detection
 * - Manejo de conexión con reintentos / Connection handling with retries
 * - Sincronización de estado sin sobrescribir cambios locales / State sync without overwriting local changes
 * 
 * Comunicación / Communication:
 * - Envía: TELEPROMPTER_READY (al iniciar) / Sends: TELEPROMPTER_READY (on init)
 * - Envía: TELEPROMPTER_CONTROL (al cambiar estado) / Sends: TELEPROMPTER_CONTROL (on state change)
 * - Recibe: TELEPROMPTER_UPDATE (desde ventana principal) / Receives: TELEPROMPTER_UPDATE (from main window)
 * 
 * @component
 * @returns {JSX.Element} Ventana emergente del teleprompter / Teleprompter popup window
 */
export function TeleprompterWindow() {

  // ===== ESTADO PRINCIPAL / MAIN STATE =====
  // Estado de datos del teleprompter / Teleprompter data state
  const [data, setData] = useState<TeleprompterData>({
    text: '',
    isPlaying: false,
    speed: 1.0, // Velocidad inicial más lenta / Slower initial speed
    fontSize: 36,
    scrollPosition: 0
  });

  // ===== REFERENCIAS PARA AUTO-SCROLL / REFS FOR AUTO-SCROLL =====
  // Refs para mantener valores actuales sin re-renders / Refs to maintain current values without re-renders
  const isPlayingRef = useRef(data.isPlaying); // Referencia al estado de reproducción / Reference to playback state
  const speedRef = useRef(data.speed); // Referencia a la velocidad / Reference to speed
  
  // Sincronizar refs con estado / Sync refs with state
  useEffect(() => { isPlayingRef.current = data.isPlaying; }, [data.isPlaying]);
  useEffect(() => { speedRef.current = data.speed; }, [data.speed]);

  // ===== EFECTO: AUTO-SCROLL INDEPENDIENTE / EFFECT: INDEPENDENT AUTO-SCROLL =====
  /**
   * Animación de auto-scroll cuando isPlaying es true
   * Auto-scroll animation when isPlaying is true
   * 
   * Este auto-scroll es independiente del TeleprompterScreen, pero usa
   * el mismo algoritmo para mantener sincronización.
   * 
   * This auto-scroll is independent of TeleprompterScreen, but uses
   * the same algorithm to maintain synchronization.
   * 
   * Algoritmo / Algorithm:
   * - Base: speed × 14 px/s (igual que TeleprompterScreen)
   * - Usa requestAnimationFrame para fluidez
   * - Solo activo cuando isPlaying = true
   */
  useEffect(() => {
    if (!isPlayingRef.current) return; // Solo si está reproduciendo / Only if playing
    
    let frame: number;
    let lastTime = performance.now();
    
    /**
     * Función de animación recursiva / Recursive animation function
     */
    function animate(now: number) {
      if (!isPlayingRef.current) return; // Detener si pausó / Stop if paused
      
      const elapsed = now - lastTime; // Tiempo transcurrido / Elapsed time
      lastTime = now;
      
      // Igual que en TeleprompterScreen: velocidad más suave / Same as TeleprompterScreen: smoother speed
      const pixelsPerSecond = speedRef.current * 14;
      const increment = (pixelsPerSecond * elapsed) / 1000;
      
      // Actualizar posición / Update position
      setData((prev: TeleprompterData) => ({ ...prev, scrollPosition: prev.scrollPosition + increment }));
      
      // Solicitar siguiente frame / Request next frame
      frame = requestAnimationFrame(animate);
    }
    
    frame = requestAnimationFrame(animate);
    
    // Cleanup: Cancelar animación / Cleanup: Cancel animation
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [data.isPlaying, data.speed]);

  // ===== ESTADO DE CONEXIÓN Y UI / CONNECTION AND UI STATE =====
  const [isConnected, setIsConnected] = useState(false); // true cuando conectado con ventana principal / true when connected to main window
  const [connectionAttempts, setConnectionAttempts] = useState(0); // Contador de intentos de conexión (máx 50) / Connection attempt counter (max 50)
  const [showControls, setShowControls] = useState(true); // true = mostrar barra de controles / true = show controls bar
  
  // Configuración de macros desde localStorage / Macro settings from localStorage
  const [macroSettings] = useState<MacroSettings>(() => {
    try {
      const saved = localStorage.getItem('macroSettings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultMacroSettings;
  });

  // Referencia al área del teleprompter para eventos de rueda / Reference to teleprompter area for wheel events
  const teleprompterAreaRef = useRef<HTMLDivElement>(null);

  // ===== EFECTO: CONTROL CON RUEDA DEL MOUSE / EFFECT: MOUSE WHEEL CONTROL =====
  /**
   * Maneja la rueda del mouse para controlar velocidad e iniciar reproducción
   * Handles mouse wheel to control speed and start playing
   * 
   * Comportamiento / Behavior:
   * - Scroll abajo (deltaY > 0): Aumenta velocidad +0.1x
   * - Scroll arriba (deltaY < 0): Reduce velocidad -0.1x
   * - Rango: 0.1-5x
   * - Automáticamente inicia reproducción
   * - Notifica a ventana principal del cambio
   */
  useEffect(() => {
    const area = teleprompterAreaRef.current;
    if (!area) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevenir scroll nativo / Prevent native scroll
      
      // DeltaY > 0: scroll down (faster), < 0: scroll up (slower)
      let newSpeed = data.speed + (e.deltaY > 0 ? 0.1 : -0.1);
      newSpeed = Math.max(0.1, Math.min(5, Math.round(newSpeed * 100) / 100)); // Rango 0.1-5x / Range 0.1-5x
      
      // Actualizar estado local / Update local state
      setData((prev: TeleprompterData) => ({ ...prev, speed: newSpeed, isPlaying: true }));
      
      // Notificar a ventana principal / Notify parent window
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

  // ===== EFECTO: COMUNICACIÓN CON VENTANA PRINCIPAL / EFFECT: COMMUNICATION WITH MAIN WINDOW =====
  /**
   * Establece comunicación bidireccional con la ventana principal
   * Establishes two-way communication with main window
   * 
   * Mensajes recibidos / Messages received:
   * - TELEPROMPTER_UPDATE: Actualización de datos desde ventana principal
   * 
   * Mensajes enviados / Messages sent:
   * - TELEPROMPTER_READY: Notifica que la ventana popup está lista
   * 
   * Estrategia de merge:
   * - Combina datos recibidos con estado actual
   * - No sobrescribe cambios locales sin confirmar
   * 
   * Reintentos de conexión / Connection retries:
   * - Máximo 50 intentos (5 segundos)
   * - Intervalo de 100ms entre intentos
   */
  useEffect(() => {
    // Escuchar mensajes de la ventana principal / Listen for messages from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TELEPROMPTER_UPDATE') {
        console.log('🔵 POPUP received TELEPROMPTER_UPDATE:', event.data.data);
        
        // Merge con el estado actual para no sobrescribir cambios locales
        // Merge with current state to not overwrite local changes
        setData(prevData => {
          const newData = { ...prevData, ...event.data.data };
          console.log('🔵 POPUP merging data. Prev fontSize:', prevData.fontSize, 'New fontSize:', newData.fontSize);
          return newData;
        });
        
        setIsConnected(true); // Marcar como conectado / Mark as connected
      }
    };

    window.addEventListener('message', handleMessage);

    // Notificar a la ventana principal que este popup está listo
    // Notify parent window that this popup is ready
    const notifyParent = () => {
      setConnectionAttempts((prev: number) => prev + 1);
      
      if (window.opener && !window.opener.closed) {
        // Ventana principal existe y está abierta / Parent window exists and is open
        window.opener.postMessage({ type: 'TELEPROMPTER_READY' }, '*');
      } else {
        // Reintentar si no se ha alcanzado el límite / Retry if limit not reached
        if (connectionAttempts < 50) { // Try for 5 seconds (50 × 100ms)
          setTimeout(notifyParent, 100);
        }
      }
    };

    // Retrasar notificación para asegurar que ventana principal esté lista
    // Delay notification to ensure parent window is ready
    setTimeout(notifyParent, 100);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // ===== FUNCIÓN AUXILIAR: ENVIAR ACTUALIZACIÓN / HELPER FUNCTION: SEND UPDATE =====
  /**
   * Envía actualizaciones de estado a la ventana principal
   * Sends state updates to parent window
   * 
   * @param {Partial<TeleprompterData>} updates - Actualizaciones parciales del estado / Partial state updates
   */
  const sendUpdate = useCallback((updates: Partial<TeleprompterData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    
    // Enviar mensaje a ventana principal / Send message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'TELEPROMPTER_CONTROL',
        data: updates
      }, '*');
    }
  }, [data]);

  // ===== MANEJADORES DE TRANSPORTE / TRANSPORT HANDLERS =====
  
  /**
   * Maneja Play/Pause
   * Handles Play/Pause
   * 
   * Si está al final, no reinicia scrollPosition, solo pausa/reanuda
   * If at end, doesn't reset scrollPosition, just pauses/resumes
   */
  const handlePlayPause = useCallback(() => {
    sendUpdate({ isPlaying: !data.isPlaying });
  }, [data, sendUpdate]);

  /**
   * Reinicia al inicio (pausa y scrollPosition = 0)
   * Resets to beginning (pause and scrollPosition = 0)
   */
  const handleReset = useCallback(() => {
    sendUpdate({ isPlaying: false, scrollPosition: 0 });
  }, [sendUpdate]);

  /**
   * Detiene reproducción (igual que reset)
   * Stops playback (same as reset)
   */
  const handleStop = useCallback(() => {
    sendUpdate({ isPlaying: false, scrollPosition: 0 });
  }, [sendUpdate]);

  /**
   * Avanza 50 píxeles
   * Advances 50 pixels
   */
  const handleForward = useCallback(() => {
    sendUpdate({ scrollPosition: data.scrollPosition + 50 });
  }, [data, sendUpdate]);

  /**
   * Retrocede 50 píxeles (mínimo 0)
   * Goes back 50 pixels (minimum 0)
   */
  const handleBackward = useCallback(() => {
    sendUpdate({ scrollPosition: Math.max(0, data.scrollPosition - 50) });
  }, [data, sendUpdate]);

  /**
   * Maneja el final del texto (pausa automática)
   * Handles end of text (automatic pause)
   */
  const handleEnd = useCallback(() => {
    sendUpdate({ isPlaying: false });
  }, [sendUpdate]);

  // ===== MANEJADORES DE VELOCIDAD Y FUENTE / SPEED AND FONT HANDLERS =====
  
  /**
   * Maneja cambios de velocidad
   * Handles speed changes
   * 
   * @param {number} speed - Nueva velocidad / New speed
   * Límites: 0.1-5x, redondeado a 2 decimales / Limits: 0.1-5x, rounded to 2 decimals
   */
  const handleSpeedChange = useCallback((speed: number) => {
    // Limitar el rango y actualizar correctamente / Limit range and update correctly
    const newSpeed = Math.max(0.1, Math.min(5, Math.round(speed * 100) / 100));
    console.log('🟢 TeleprompterWindow handleSpeedChange:', speed, '→', newSpeed);
    setData(prev => ({ ...prev, speed: newSpeed }));
    
    // También notificar al parent / Also notify parent
    if (window.opener) {
      window.opener.postMessage({
        type: 'TELEPROMPTER_CONTROL',
        data: { speed: newSpeed }
      }, '*');
    }
  }, []);

  /**
   * Maneja cambios de tamaño de fuente
   * Handles font size changes
   * 
   * @param {number} fontSize - Nuevo tamaño / New size
   * Límites: 12-500px, redondeado a entero / Limits: 12-500px, rounded to integer
   */
  const handleFontSizeChange = useCallback((fontSize: number) => {
    // Limitar el rango y actualizar correctamente / Limit range and update correctly
    const newFontSize = Math.max(12, Math.min(500, Math.round(fontSize)));
    console.log('🟢 TeleprompterWindow handleFontSizeChange:', fontSize, '→', newFontSize);
    setData(prev => {
      const updated = { ...prev, fontSize: newFontSize };
      console.log('🟢 TeleprompterWindow setData fontSize:', updated.fontSize);
      return updated;
    });
    
    // También notificar al parent / Also notify parent
    if (window.opener) {
      window.opener.postMessage({
        type: 'TELEPROMPTER_CONTROL',
        data: { fontSize: newFontSize }
      }, '*');
    }
  }, []);

  /**
   * Maneja cambios de posición de scroll
   * Handles scroll position changes
   * 
   * @param {number} scrollPosition - Nueva posición / New position
   */
  const handleScrollPositionChange = useCallback((scrollPosition: number) => {
    sendUpdate({ scrollPosition });
  }, [sendUpdate]);

  // ===== SOPORTE DE MACROS EN POPUP / MACRO SUPPORT IN POPUP =====
  
  /**
   * Obtiene todas las posiciones de marcadores de cue/guion en el texto
   * Gets all cue/script marker positions in the text
   * 
   * Detecta / Detects:
   * - [1], [2], ... (marcadores numerados)
   * - Texto en mayúsculas con dos puntos (TITULO:)
   * - Encabezados markdown (# Titulo, ## Titulo, ### Titulo)
   * - Texto en negrita (**Texto**)
   * 
   * @param {string} text - Texto del guion / Script text
   * @returns {number[]} Array de posiciones en caracteres / Array of character positions
   */
  function getCuePositions(text: string): number[] {
    const lines = text.split('\n');
    let positions: number[] = [];
    let currentPos = 0;
    
    for (const line of lines) {
      // Match [1], [2], ... o líneas con mayúsculas y dos puntos, o encabezados markdown
      // Match [1], [2], ... or lines with all caps and colon, or markdown headings
      if (/^(\[\d+\])/.test(line) || /^(#{1,3}\s+.+|[A-Z][A-Z\s]+:|^\*\*.+\*\*)/.test(line)) {
        positions.push(currentPos);
      }
      currentPos += line.length + 1; // +1 por el salto de línea / +1 for newline
    }
    
    return positions;
  }

  // ===== MANEJADORES DE MACROS PARA CUES / MACRO HANDLERS FOR CUES =====
  
  /**
   * Salta al siguiente marcador de cue
   * Jumps to next cue marker
   * 
   * Encuentra el primer cue después de la posición actual (+10px de tolerancia)
   * Finds first cue after current position (+10px tolerance)
   */
  const handleNextCue = useCallback(() => {
    const positions = getCuePositions(data.text);
    const current = data.scrollPosition;
    
    // Encontrar el primer cue después de la posición actual / Find first cue after current position
    const next = positions.find(pos => pos > current + 10); // +10 for tolerance
    
    if (typeof next === 'number') {
      sendUpdate({ scrollPosition: next });
    }
  }, [data.text, data.scrollPosition, sendUpdate]);

  /**
   * Salta al marcador de cue anterior
   * Jumps to previous cue marker
   * 
   * Encuentra el último cue antes de la posición actual (-10px de tolerancia)
   * Finds last cue before current position (-10px tolerance)
   */
  const handlePreviousCue = useCallback(() => {
    const positions = getCuePositions(data.text);
    const current = data.scrollPosition;
    
    // Encontrar el último cue antes de la posición actual / Find last cue before current position
    const prev = [...positions].reverse().find(pos => pos < current - 10); // -10 for tolerance
    
    if (typeof prev === 'number') {
      sendUpdate({ scrollPosition: prev });
    }
  }, [data.text, data.scrollPosition, sendUpdate]);

  // ===== HOOK: ACTIVAR MACROS / HOOK: ACTIVATE MACROS =====
  /**
   * Activa el soporte de macros con todos los manejadores
   * Activates macro support with all handlers
   * 
   * Macros soportadas / Supported macros:
   * - onPlayStop: Play/Pause
   * - onPause: Solo pausa / Pause only
   * - onPrevious: Retroceder 50px / Go back 50px
   * - onNext: Avanzar 50px / Go forward 50px
   * - onIncreaseSpeed: +0.1x (máx 5x) / +0.1x (max 5x)
   * - onDecreaseSpeed: -0.1x (mín 0.1x) / -0.1x (min 0.1x)
   * - onIncreaseFontSize: +2px (máx 500px) / +2px (max 500px)
   * - onDecreaseFontSize: -2px (mín 12px) / -2px (min 12px)
   * - onNextCue: Saltar a siguiente marcador / Jump to next marker
   * - onPreviousCue: Saltar a marcador anterior / Jump to previous marker
   * 
   * Parámetro true = Activar en esta ventana / Parameter true = Activate in this window
   */
  useMacros(
    macroSettings,
    {
      onPlayStop: handlePlayPause,
      onPause: () => sendUpdate({ isPlaying: false }),
      onPrevious: handleBackward,
      onNext: handleForward,
      onIncreaseSpeed: () => handleSpeedChange(Math.min(5, data.speed + 0.1)),
      onDecreaseSpeed: () => handleSpeedChange(Math.max(0.1, data.speed - 0.1)),
      onIncreaseFontSize: () => {
        const newSize = Math.min(500, data.fontSize + 2);
        handleFontSizeChange(newSize);
      },
      onDecreaseFontSize: () => {
        const newSize = Math.max(12, data.fontSize - 2);
        handleFontSizeChange(newSize);
      },
      onNextCue: handleNextCue,
      onPreviousCue: handlePreviousCue,
    },
    true // Activar macros en esta ventana / Activate macros in this window
  );

  // ===== RENDERIZADO CONDICIONAL: PANTALLA DE CONEXIÓN / CONDITIONAL RENDER: CONNECTION SCREEN =====
  /**
   * Si no está conectado, muestra pantalla de espera/error
   * If not connected, shows waiting/error screen
   * 
   * Estados / States:
   * - < 50 intentos: "Conectando..." (amarillo, esperando)
   * - >= 50 intentos: "Error de conexión" (rojo, fallo)
   */
  if (!isConnected) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          {/* Mensaje principal / Main message */}
          <div className="text-xl mb-4">
            {connectionAttempts < 50 ? 'Conectando con ventana principal...' : 'Error de conexión'}
          </div>
          
          {/* Mensaje secundario / Secondary message */}
          <div className="text-gray-400">
            {connectionAttempts < 50 
              ? 'Asegúrate de que la ventana principal esté abierta' 
              : 'No se pudo conectar con la ventana principal. Cierra esta ventana y vuelve a intentar.'
            }
          </div>
          
          {/* Contador de intentos / Attempt counter */}
          <div className="text-sm text-gray-500 mt-2">
            Intentos: {connectionAttempts}/50
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDERIZADO PRINCIPAL: VENTANA DEL TELEPROMPTER / MAIN RENDER: TELEPROMPTER WINDOW =====
  return (
    // Contenedor principal de pantalla completa / Full-screen main container
    <div
      className="h-screen w-screen bg-black flex flex-col relative"
      ref={teleprompterAreaRef}
      tabIndex={0} // Permite enfocar para capturar eventos de teclado / Allows focus to capture keyboard events
      style={{ outline: 'none' }} // Ocultar outline de foco / Hide focus outline
    >
      {/* ===== BARRA DE CONTROLES FIJA (OCULTABLE) / FIXED CONTROLS BAR (HIDEABLE) ===== */}
      {showControls && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur border-b border-gray-800 flex flex-col">
          <div className="flex justify-between items-center px-4 py-2">
            {/* Título e indicador de estado / Title and status indicator */}
            <div className="text-white text-sm">
              pT Torneos portátil - {data.isPlaying ? 'REPRODUCIENDO' : 'PAUSADO'}
            </div>
            
            {/* Controles y botón ocultar / Controls and hide button */}
            <div className="flex items-center gap-2">
              {/* Componente de controles de transporte / Transport controls component */}
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
              
              {/* Botón para ocultar barra / Button to hide bar */}
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
      
      {/* ===== BOTÓN PARA MOSTRAR CONTROLES / BUTTON TO SHOW CONTROLS ===== */}
      {/* Solo visible cuando los controles están ocultos / Only visible when controls are hidden */}
      {!showControls && (
        <button
          className="fixed top-2 right-2 z-30 px-3 py-1 text-xs text-gray-400 hover:text-white bg-gray-900/80 rounded border border-gray-700"
          onClick={() => setShowControls(true)}
          title="Mostrar barra de controles"
        >
          Mostrar controles
        </button>
      )}

      {/* ===== LÍNEA GUÍA ROJA FIJA (APUNTADOR) / FIXED RED GUIDE LINE (POINTER) ===== */}
      {/* Línea roja horizontal fija en el centro de la pantalla / Fixed red horizontal line at screen center */}
      {/* No se mueve con el scroll, siempre visible en 50% de altura / Doesn't move with scroll, always visible at 50% height */}
      <div
        className="pointer-events-none z-30" // No interfiere con interacción / Doesn't interfere with interaction
        style={{
          position: 'fixed', // Fija al viewport / Fixed to viewport
          top: '50%', // Centro vertical / Vertical center
          left: 0,
          width: '100vw', // Ancho completo / Full width
          height: 0,
          borderTop: '3px solid red', // Línea roja de 3px / 3px red line
          transform: 'translateY(-1.5px)', // Centrar la línea / Center the line
        }}
        aria-hidden="true" // Ocultar de lectores de pantalla / Hide from screen readers
      />

      {/* ===== PANTALLA DEL TELEPROMPTER / TELEPROMPTER SCREEN ===== */}
      {/* Padding superior (pt-20) para espacio de la barra de controles / Top padding (pt-20) for controls bar space */}
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