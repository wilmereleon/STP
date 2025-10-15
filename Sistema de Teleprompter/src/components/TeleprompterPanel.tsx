// ===== IMPORTACIONES / IMPORTS =====
// Hooks de React / React hooks
import React, { useEffect, useRef, useState } from "react";
// Componentes de UI / UI components
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
// Iconos de Lucide React / Lucide React icons
import { Maximize2, Settings, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Propiedades del componente TeleprompterPanel
 * TeleprompterPanel component properties
 * 
 * @interface TeleprompterPanelProps
 * @property {string} script - Texto del guion a mostrar / Script text to display
 * @property {boolean} isPlaying - Estado de reproducción / Playback state
 * @property {number} speed - Velocidad de scroll (0.5-10x) / Scroll speed (0.5-10x)
 * @property {number} fontSize - Tamaño de fuente (12-72px) / Font size (12-72px)
 * @property {boolean} shouldReset - Señal para reiniciar scroll / Signal to reset scroll
 * @property {() => void} onResetComplete - Callback al completar reset / Callback on reset complete
 * @property {() => void} onOpenSettings - Callback para abrir configuración / Callback to open settings
 * @property {() => void} onFullscreen - Callback para pantalla completa / Callback for fullscreen
 * @property {() => void} onDetach - Callback para desprender ventana / Callback to detach window
 * @property {(size: number) => void} [onFontSizeChange] - Callback al cambiar tamaño / Callback on font size change
 * @property {(speed: number) => void} [onSpeedChange] - Callback al cambiar velocidad / Callback on speed change
 */
interface TeleprompterPanelProps {
  script: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  shouldReset: boolean;
  onResetComplete: () => void;
  onOpenSettings: () => void;
  onFullscreen: () => void;
  onDetach: () => void;
  onFontSizeChange?: (size: number) => void;
  onSpeedChange?: (speed: number) => void;
}

/**
 * TeleprompterPanel - Panel de vista previa del teleprompter
 * TeleprompterPanel - Teleprompter preview panel
 * 
 * Panel embebido en la interfaz principal que muestra el texto scrolleando
 * de abajo hacia arriba (estilo teleprompter tradicional).
 * 
 * Embedded panel in main interface that displays text scrolling
 * from bottom to top (traditional teleprompter style).
 * 
 * Características / Features:
 * - Auto-scroll configurable de abajo hacia arriba / Configurable auto-scroll bottom to top
 * - Control de velocidad con Ctrl+Wheel / Speed control with Ctrl+Wheel
 * - Scroll manual con rueda del mouse / Manual scroll with mouse wheel
 * - Ajuste de tamaño de fuente con botones +/- / Font size adjustment with +/- buttons
 * - Línea guía vertical amarilla / Yellow vertical guide line
 * - Indicadores visuales de estado (playing/paused) / Visual state indicators (playing/paused)
 * - Botones de acción: Desprender, Configuración, Pantalla completa / Action buttons: Detach, Settings, Fullscreen
 * 
 * @component
 * @param {TeleprompterPanelProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Panel del teleprompter / Teleprompter panel
 */
export function TeleprompterPanel({
  script,
  isPlaying,
  speed,
  fontSize,
  shouldReset,
  onResetComplete,
  onOpenSettings,
  onFullscreen,
  onDetach,
  onFontSizeChange,
  onSpeedChange
}: TeleprompterPanelProps) {
  // ===== REFERENCIAS Y ESTADO / REFERENCES AND STATE =====
  // Referencia al contenedor de scroll / Reference to scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // Referencia a la animación de scroll / Reference to scroll animation
  const animationRef = useRef<number | null>(null);
  // Tamaño de fuente local (sincronizado con prop) / Local font size (synced with prop)
  const [localFontSize, setLocalFontSize] = useState<number>(fontSize);

  // ===== EFECTO: SINCRONIZAR TAMAÑO DE FUENTE / EFFECT: SYNC FONT SIZE =====
  // Mantiene el tamaño local en sincronía con la prop
  // Keeps local size in sync with prop
  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  // ===== EFECTO: AUTO-SCROLL (ABAJO → ARRIBA) / EFFECT: AUTO-SCROLL (BOTTOM → TOP) =====
  /**
   * Maneja el auto-scroll del teleprompter de abajo hacia arriba
   * Handles teleprompter auto-scroll from bottom to top
   * 
   * Lógica / Logic:
   * 1. Si shouldReset = true, salta al final (scrollTop = scrollHeight)
   * 2. Si isPlaying = true, inicia animación que reduce scrollTop gradualmente
   * 3. Velocidad base: speed * 40 px/segundo (mínimo 20 px/s)
   * 4. Se detiene al llegar a scrollTop = 0 (inicio del texto)
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    
    // **CASO 1: RESET - Saltar al final del texto / Jump to end of text**
    if (shouldReset && container) {
      container.scrollTop = container.scrollHeight; // Posicionar al final / Position at end
      onResetComplete();
      return;
    }

    // **CASO 2: PAUSADO - Cancelar animación / Cancel animation**
    if (!isPlaying || !container) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let lastTs = performance.now(); // Timestamp del último frame / Last frame timestamp

    /**
     * Función de animación step-by-step
     * Step-by-step animation function
     */
    const step = (ts: number) => {
      const dt = ts - lastTs; // Delta time en ms / Delta time in ms
      lastTs = ts;

      // Calcular píxeles a mover basado en velocidad / Calculate pixels to move based on speed
      const pxPerSecond = Math.max(20, speed * 40); // Base: 40px/s por unidad de velocidad / Base: 40px/s per speed unit
      const deltaPx = (pxPerSecond * dt) / 1000; // Convertir a píxeles para este frame / Convert to pixels for this frame

      // Scrolling hacia arriba: reducir scrollTop / Scrolling upward: decrease scrollTop
      container.scrollTop = Math.max(0, container.scrollTop - deltaPx);

      // **CONDICIÓN DE PARADA: Llegó al inicio / STOP CONDITION: Reached top**
      if (container.scrollTop <= 0) {
        animationRef.current = null;
        return;
      }

      // Continuar animación / Continue animation
      animationRef.current = requestAnimationFrame(step);
    };

    // **INICIO DE REPRODUCCIÓN: Asegurar que empiece desde el final / START PLAYBACK: Ensure starting from bottom**
    if (container.scrollTop <= 0) {
      container.scrollTop = container.scrollHeight;
    }

    animationRef.current = requestAnimationFrame(step);

    // Cleanup: Cancelar animación al desmontar / Cancel animation on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, speed, shouldReset, onResetComplete]);

  // ===== EFECTO: CONTROL DE RUEDA DEL MOUSE / EFFECT: MOUSE WHEEL CONTROL =====
  /**
   * Maneja el control mediante rueda del mouse con 2 comportamientos
   * Handles mouse wheel control with 2 behaviors
   * 
   * **MODO 1: REPRODUCIENDO (isPlaying = true)**
   * - Previene scroll de página globalmente / Prevents page scroll globally
   * - Ctrl+Wheel: Ajusta velocidad (±0.5x, rango 0.5-10x)
   * - Wheel normal: Scroll manual (multiplica deltaY × 0.8)
   * 
   * **MODO 2: PAUSADO (isPlaying = false)**
   * - Solo captura eventos sobre el contenedor / Only captures events over container
   * - Permite scroll manual local / Allows local manual scroll
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Detectar si el mouse está sobre el teleprompter / Detect if mouse is over teleprompter
      const rect = container.getBoundingClientRect();
      const isOverTeleprompter =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isPlaying) {
        // **MODO REPRODUCIENDO: Control global / PLAYING MODE: Global control**
        e.preventDefault(); // Prevenir scroll de página / Prevent page scroll
        e.stopPropagation();

        if (e.ctrlKey) {
          // **Ctrl+Wheel = Ajuste de velocidad / Speed adjustment**
          const speedDelta = e.deltaY > 0 ? -0.5 : 0.5; // Invertir dirección / Invert direction
          const newSpeed = Math.max(0.5, Math.min(speed + speedDelta, 10)); // Rango: 0.5-10x / Range: 0.5-10x
          onSpeedChange?.(newSpeed);
        } else {
          // **Wheel normal = Scroll manual / Normal wheel = Manual scroll**
          const scrollAmount = e.deltaY * 0.8; // Factor de suavizado / Smoothing factor
          container.scrollTop += scrollAmount;
        }
      } else if (isOverTeleprompter) {
        // **MODO PAUSADO: Solo scroll local / PAUSED MODE: Local scroll only**
        e.preventDefault();
        e.stopPropagation();
        const scrollAmount = e.deltaY * 0.8;
        container.scrollTop += scrollAmount;
      }
    };

    // Configuración de listeners / Listener configuration
    const addOpts: AddEventListenerOptions = { passive: false, capture: true }; // Global cuando reproduce / Global when playing
    const addOptsContainer: AddEventListenerOptions = { passive: false, capture: false }; // Local cuando pausa / Local when paused

    if (isPlaying) {
      // Listener global para capturar eventos en toda la página / Global listener to capture events on entire page
      document.addEventListener("wheel", handleWheel as EventListener, addOpts);
    } else {
      // Listener local solo en el contenedor / Local listener only on container
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel as EventListener, addOptsContainer);
      }
    }

    // Cleanup: Remover listeners / Remove listeners
    return () => {
      document.removeEventListener("wheel", handleWheel as EventListener, addOpts);
      const container = scrollContainerRef.current;
      if (container) {
        container.removeEventListener("wheel", handleWheel as EventListener, addOptsContainer);
      }
    };
  }, [isPlaying, speed, onSpeedChange]);

  // ===== FORMATEAR TEXTO DEL GUION / FORMAT SCRIPT TEXT =====
  /**
   * Divide el texto en líneas y las convierte en párrafos con espaciado
   * Splits text into lines and converts them to paragraphs with spacing
   * 
   * Usa &nbsp; (\u00A0) para líneas vacías para mantener el espaciado
   * Uses &nbsp; (\u00A0) for empty lines to maintain spacing
   */
  const formattedScript = script.split("\n").map((line, idx) => (
    <p key={idx} className="mb-4 leading-relaxed">
      {line || "\u00A0"}
    </p>
  ));

  return (
    <Card className="h-full flex flex-col">
      {/* ===== ENCABEZADO DEL PANEL / PANEL HEADER ===== */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* Panel izquierdo: Título e indicadores de estado / Left panel: Title and status indicators */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Prompter Preview</h3>
            {isPlaying && (
              <div className="flex items-center gap-2">
                {/* Badge verde animado "Scroll Active" / Animated green badge "Scroll Active" */}
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Scroll Active
                </div>
                {/* Badge azul con velocidad actual / Blue badge with current speed */}
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Speed: {speed}x
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho: Botones de control / Right panel: Control buttons */}
          <div className="flex gap-1">
            {/* Botón: Reducir tamaño de fuente / Button: Decrease font size */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newSize = Math.max(localFontSize - 2, 12); // Mínimo 12px / Minimum 12px
                setLocalFontSize(newSize);
                onFontSizeChange?.(newSize);
              }}
              title="Reduce font size"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            {/* Botón: Aumentar tamaño de fuente / Button: Increase font size */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newSize = Math.min(localFontSize + 2, 72); // Máximo 72px / Maximum 72px
                setLocalFontSize(newSize);
                onFontSizeChange?.(newSize);
              }}
              title="Increase font size"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            {/* Botón: Desprender en ventana flotante / Button: Detach in floating window */}
            <Button size="sm" variant="outline" onClick={onDetach}>
              <ExternalLink className="w-3 h-3" />
            </Button>
            {/* Botón: Abrir configuración / Button: Open settings */}
            <Button size="sm" variant="outline" onClick={onOpenSettings}>
              <Settings className="w-3 h-3" />
            </Button>
            {/* Botón: Pantalla completa / Button: Fullscreen */}
            <Button size="sm" variant="outline" onClick={onFullscreen}>
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* ===== CONTENIDO DEL PANEL / PANEL CONTENT ===== */}
      <CardContent className="flex-1 p-0">
        {/* Contenedor principal con fondo negro / Main container with black background */}
        {/* Ring verde cuando está reproduciendo / Green ring when playing */}
        <div
          className={`h-full bg-black text-white relative ${isPlaying ? "ring-2 ring-green-400 ring-opacity-50" : ""}`}
        >
          {/* ===== ÁREA DE SCROLL DEL TEXTO / TEXT SCROLL AREA ===== */}
          {/* Contenedor con scroll oculto para apariencia limpia / Container with hidden scroll for clean appearance */}
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollBehavior: isPlaying ? "auto" : "smooth" }} // Auto cuando reproduce, smooth cuando pausa / Auto when playing, smooth when paused
          >
            {/* Contenedor interno con padding y estilos de texto / Inner container with padding and text styles */}
            <div
              className="pt-12 pr-6 pb-6"
              style={{
                fontSize: `${localFontSize}px`,
                lineHeight: "1.6",
                fontFamily: "Arial, sans-serif",
                paddingLeft: "24px"
              }}
            >
              {/* Renderizar texto formateado o mensaje de vacío / Render formatted text or empty message */}
              {formattedScript.length > 0 ? (
                formattedScript
              ) : (
                <p className="text-gray-400 text-center">No text in script</p>
              )}

              {/* Espacio adicional al final (50% viewport height) / Additional space at end (50% viewport height) */}
              {/* Permite que el texto llegue a la parte superior / Allows text to reach the top */}
              <div style={{ height: "50vh" }} />
            </div>
          </div>

          {/* ===== LÍNEA GUÍA VERTICAL / VERTICAL GUIDE LINE ===== */}
          {/* Línea amarilla vertical con gradiente y sombra / Yellow vertical line with gradient and shadow */}
          {/* Ayuda al lector a seguir el texto / Helps reader follow the text */}
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{
              left: "8px",
              width: "4px",
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,204,0,0.3) 20%, rgba(255,204,0,0.9) 40%, rgba(255,204,0,0.9) 60%, rgba(255,204,0,0.3) 80%, transparent 100%)",
              boxShadow: "0 0 8px rgba(255,204,0,0.7)"
            }}
          />

          {/* ===== TOOLTIPS DE AYUDA / HELP TOOLTIPS ===== */}
          {/* Mensaje cuando está pausado / Message when paused */}
          {!isPlaying && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Mouse wheel to scroll
            </div>
          )}
          {/* Mensaje cuando está reproduciendo / Message when playing */}
          {isPlaying && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Ctrl + Wheel to change speed | F1/F2 for speed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TeleprompterPanel;