// Importaciones de React
import { useEffect, useRef, useState } from "react";

// Importaciones de componentes UI
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// Importaciones de íconos
import { X, Maximize2, Settings, Minimize2, Dock, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Props del componente FloatingTeleprompter
 * 
 * @property {string} script - Contenido del script a mostrar
 * @property {boolean} isPlaying - Estado de reproducción/scroll automático
 * @property {number} speed - Velocidad de desplazamiento (multiplicador)
 * @property {number} fontSize - Tamaño de fuente en píxeles
 * @property {boolean} shouldReset - Bandera para resetear la posición del scroll
 * @property {function} onResetComplete - Callback ejecutado tras completar el reset
 * @property {function} onOpenSettings - Callback para abrir el panel de configuración
 * @property {function} onClose - Callback para cerrar la ventana flotante
 * @property {function} onFontSizeChange - Callback opcional para cambios de tamaño de fuente
 * @property {function} onSpeedChange - Callback opcional para cambios de velocidad
 * @property {object} settings - Objeto con configuraciones visuales del teleprompter
 * @property {string} settings.backgroundColor - Color de fondo
 * @property {string} settings.textColor - Color del texto
 * @property {string} settings.fontFamily - Familia de fuente
 * @property {boolean} settings.enableOutline - Si se aplica sombra/contorno al texto
 * @property {number} settings.margins - Márgenes internos en píxeles
 */
interface FloatingTeleprompterProps {
  script: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  shouldReset: boolean;
  onResetComplete: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  onFontSizeChange?: (size: number) => void;
  onSpeedChange?: (speed: number) => void;
  settings: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    enableOutline: boolean;
    margins: number;
  };
}

/**
 * FloatingTeleprompter - Ventana flotante de teleprompter con scroll automático
 * 
 * Componente que renderiza una ventana independiente y arrastrable del teleprompter.
 * Características principales:
 * - Ventana arrastrable por el header
 * - Modo pantalla completa
 * - Scroll automático configurable
 * - Control de velocidad con Ctrl + rueda del mouse
 * - Ajuste de tamaño de fuente
 * - Guía de lectura visual (línea amarilla)
 * - Sincronización con la ventana principal
 * 
 * El scroll siempre va de arriba hacia abajo (dirección natural de lectura).
 * 
 * @component
 * @param {FloatingTeleprompterProps} props - Propiedades del componente
 * @returns {JSX.Element} Ventana flotante del teleprompter
 */
export function FloatingTeleprompter({
  script,
  isPlaying,
  speed,
  fontSize,
  shouldReset,
  onResetComplete,
  onOpenSettings,
  onClose,
  onFontSizeChange,
  onSpeedChange,
  settings
}: FloatingTeleprompterProps) {
  // ===== ESTADOS DEL COMPONENTE =====
  
  /** Posición de la ventana en la pantalla (x, y) */
  const [position, setPosition] = useState({ x: 100, y: 100 });
  
  /** Dimensiones de la ventana (ancho, alto) */
  const [size, setSize] = useState({ width: 600, height: 400 });
  
  /** Indica si la ventana está siendo arrastrada */
  const [isDragging, setIsDragging] = useState(false);
  
  /** Indica si la ventana está en modo pantalla completa */
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  /** Offset del mouse al inicio del drag (para mantener posición relativa) */
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  /** Tamaño de fuente local (puede diferir temporalmente del prop) */
  const [localFontSize, setLocalFontSize] = useState(fontSize);

  // ===== REFERENCIAS DOM =====
  
  /** Referencia a la ventana completa */
  const windowRef = useRef<HTMLDivElement | null>(null);
  
  /** Referencia al contenedor con scroll del texto */
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  /** ID del frame de animación para el scroll automático */
  const animationRef = useRef<number | null>(null);
  
  /** Referencia al header (para drag & drop) */
  /** Referencia al header (para drag & drop) */
  const headerRef = useRef<HTMLDivElement | null>(null);

  // ===== EFECTOS (HOOKS) =====

  /**
   * Efecto: Sincronizar tamaño de fuente local con prop
   * Actualiza el estado local cuando cambia el prop externo
   */
  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  /**
   * Efecto: Resetear scroll al inicio
   * Se ejecuta cuando se activa play o cambia el script
   * Asegura que siempre se empiece desde el principio
   */
  useEffect(() => {
    if (scrollContainerRef.current && (isPlaying || shouldReset)) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isPlaying, script, shouldReset]);

  /**
   * Efecto: Scroll automático con requestAnimationFrame
   * 
   * Maneja el desplazamiento automático del texto cuando isPlaying=true.
   * Características:
   * - Usa requestAnimationFrame para animación fluida
   * - La velocidad se calcula como: speed * 40 píxeles por segundo
   * - Se detiene automáticamente al llegar al final
   * - Se cancela cuando isPlaying=false o se desmonta el componente
   * 
   * El scroll va de arriba hacia abajo (dirección natural).
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    console.log("isPlaying:", isPlaying, "shouldReset:", shouldReset);

    // Si hay una solicitud de reset, resetear y salir
    if (shouldReset) {
      container.scrollTop = 0;
      onResetComplete();
      return;
    }

    // Si no está reproduciendo, cancelar animación y salir
    if (!isPlaying) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Iniciar animación de scroll
    let lastTime = performance.now();

    /**
     * Función de animación recursiva
     * Calcula el delta de tiempo y ajusta el scroll proporcionalmente
     */
    const scroll = (currentTime: number) => {
      const dt = currentTime - lastTime; // Delta time en milisegundos
      lastTime = currentTime;

      // Calcular píxeles a avanzar según velocidad
      const pxPerSecond = Math.max(20, speed * 40);
      const delta = (pxPerSecond * dt) / 1000;
      container.scrollTop += delta; // Scroll hacia abajo (positivo)

      // Debug: descomentar para ver el progreso del scroll
      // console.log("scrollTop:", container.scrollTop, "max:", container.scrollHeight - container.clientHeight);

      // Verificar si llegó al final
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (container.scrollTop >= maxScroll) {
        container.scrollTop = maxScroll; // Asegurar que no pase del límite
        animationRef.current = null;
        return; // Detener animación
      }

      // Continuar animación
      animationRef.current = requestAnimationFrame(scroll);
    };

    // Iniciar el loop de animación
    animationRef.current = requestAnimationFrame(scroll);

    // Cleanup: cancelar animación al desmontar o cambiar dependencias
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, speed, shouldReset, onResetComplete, script]);

  /**
   * Efecto: Manejo de la rueda del mouse
   * 
   * Funcionalidad dual:
   * 1. Scroll manual: rueda del mouse desplaza el texto naturalmente
   * 2. Control de velocidad: Ctrl + rueda ajusta la velocidad de reproducción
   * 
   * Se previene el comportamiento por defecto para controlar el scroll completamente.
   * Solo actúa cuando el mouse está sobre la ventana flotante.
   */
  useEffect(() => {
    const listenerOptions: AddEventListenerOptions = { passive: false, capture: true };

    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current && windowRef.current) {
        // Verificar si el mouse está sobre la ventana flotante
        const windowRect = windowRef.current.getBoundingClientRect();
        const isOverWindow = e.clientX >= windowRect.left && e.clientX <= windowRect.right && 
                            e.clientY >= windowRect.top && e.clientY <= windowRect.bottom;
        
        if (isOverWindow) {
          e.preventDefault(); // Prevenir scroll de página
          e.stopPropagation();
          
          if (isPlaying && e.ctrlKey) {
            // Modo: Ajustar velocidad con Ctrl + rueda
            const speedDelta = e.deltaY > 0 ? -0.5 : 0.5;
            const newSpeed = Math.max(0.5, Math.min(speed + speedDelta, 10));
            onSpeedChange?.(newSpeed);
          } else {
            // Modo: Scroll manual natural
            // deltaY positivo -> scroll hacia abajo (aumenta scrollTop)
            scrollContainerRef.current.scrollTop += e.deltaY;
          }
        } else if (isPlaying) {
          // Si está reproduciendo y el mouse está fuera, prevenir scroll de página
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('wheel', handleWheel as EventListener, listenerOptions);
    return () => {
      document.removeEventListener('wheel', handleWheel as EventListener, listenerOptions);
    };
  }, [isPlaying, speed, onSpeedChange]);

  // ===== FUNCIONES DE MANEJO =====

  /**
   * Maneja el inicio del arrastre de la ventana
   * Se activa al hacer mousedown en el header
   * Calcula el offset para mantener la posición relativa del mouse
   */
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  /**
   * Efecto: Manejo del movimiento durante el arrastre
   * 
   * Mientras isDragging=true:
   * - mousemove: actualiza la posición de la ventana
   * - mouseup: termina el arrastre
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  /**
   * Alterna entre modo normal y pantalla completa
   * 
   * Pantalla completa:
   * - Posición (0,0)
   * - Tamaño = tamaño de la ventana del navegador
   * 
   * Modo normal:
   * - Posición (100,100)
   * - Tamaño 600x400
   */
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setIsFullscreen(false);
      setPosition({ x: 100, y: 100 });
      setSize({ width: 600, height: 400 });
    }
  };

  // ===== PREPARACIÓN DE DATOS PARA RENDERIZADO =====

  /**
   * Formatea el script dividiéndolo en párrafos
   * Cada línea se convierte en un <p> con espacio entre líneas
   * Las líneas vacías se renderizan con un espacio no-rompible (\u00A0)
   */
  const formattedScript = script.split('\n').map((line, index) => (
    <p key={index} className="mb-4 leading-relaxed">
      {line || '\u00A0'}
    </p>
  ));

  /**
   * Estilos CSS del texto basados en las configuraciones
   * Se aplican dinámicamente según las preferencias del usuario
   */
  const textStyle: React.CSSProperties = {
    fontSize: `${localFontSize}px`,
    lineHeight: '1.4',
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    textShadow: settings.enableOutline ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
    padding: `${settings.margins}px`
  };

  // ===== RENDERIZADO DEL COMPONENTE =====

  return (
    // Contenedor principal de la ventana flotante
    // Posicionado de forma fija con coordenadas absolutas
    <div
      ref={windowRef}
      className={`fixed z-50 shadow-2xl rounded-lg overflow-hidden ${
        isFullscreen ? '' : 'border border-border'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <Card className="h-full flex flex-col">
        {/* ===== HEADER DE LA VENTANA ===== */}
        {/* Área arrastrable con título y controles */}
        <CardHeader
          ref={headerRef}
          className="pb-2 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleHeaderMouseDown}
        >
          <div className="flex items-center justify-between">
            {/* Título e indicadores de estado */}
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Teleprompter Window</h3>
              
              {/* Badges de estado cuando está reproduciendo */}
              {isPlaying && (
                <div className="flex items-center gap-2">
                  {/* Indicador de scroll activo con animación */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Scroll Active
                  </div>
                  {/* Indicador de velocidad actual */}
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Speed: {speed}x
                  </div>
                </div>
              )}
            </div>
            
            {/* ===== BOTONES DE CONTROL ===== */}
            <div className="flex gap-1">
              {/* Reducir tamaño de fuente */}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const newSize = Math.max(localFontSize - 2, 12);
                  setLocalFontSize(newSize);
                  onFontSizeChange?.(newSize);
                }}
                title="Reduce font size"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              
              {/* Aumentar tamaño de fuente */}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const newSize = Math.min(localFontSize + 2, 72);
                  setLocalFontSize(newSize);
                  onFontSizeChange?.(newSize);
                }}
                title="Increase font size"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              
              {/* Abrir configuración */}
              <Button size="sm" variant="outline" onClick={onOpenSettings}>
                <Settings className="w-3 h-3" />
              </Button>
              
              {/* Toggle pantalla completa */}
              <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </Button>
              
              {/* Acoplar ventana (volver a panel principal) */}
              <Button size="sm" variant="outline" onClick={onClose} title="Dock window">
                <Dock className="w-3 h-3" />
              </Button>
              
              {/* Cerrar ventana */}
              <Button size="sm" variant="outline" onClick={onClose} title="Close window">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* ===== CONTENIDO PRINCIPAL: ÁREA DE TEXTO CON SCROLL ===== */}
        <CardContent className="flex-1 p-0">
          <div 
            className={`h-full relative ${isPlaying ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
            style={{ backgroundColor: settings.backgroundColor }}
          >
            {/* ===== GUÍA DE LECTURA (LÍNEA VERTICAL AMARILLA) ===== */}
            {/* Línea fija en el lado izquierdo que ayuda a mantener el enfoque de lectura */}
            <div 
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ 
                left: '8px',
                width: '4px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,204,0,0.3) 20%, rgba(255,204,0,0.9) 40%, rgba(255,204,0,0.9) 60%, rgba(255,204,0,0.3) 80%, transparent 100%)',
                boxShadow: '0 0 8px rgba(255,204,0,0.7)'
              }}
            />
            
            {/* ===== CONTENEDOR DE SCROLL CON TEXTO ===== */}
            {/* Oculta la scrollbar pero mantiene funcionalidad de scroll */}
            <div 
              ref={scrollContainerRef}
              className="h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ scrollBehavior: isPlaying ? 'auto' : 'smooth' }}
            >
              <div style={{
                ...textStyle,
                paddingTop: '12vh',    // Espacio superior para alinear con la guía de lectura
                paddingBottom: '60vh', // Espacio inferior para permitir scroll completo
                paddingLeft: '24px',   // Padding extra para la guía de lectura
                lineHeight: '1.6'
              }}>
                {/* Renderizar el script formateado o mensaje de vacío */}
                {formattedScript.length > 0 ? formattedScript : (
                  <p className="text-gray-400 text-center">
                    No text in script
                  </p>
                )}
              </div>
            </div>
            
            {/* ===== HINTS DE CONTROL (TOOLTIP FLOTANTE) ===== */}
            {/* Muestra controles disponibles según el estado */}
            
            {/* Hint cuando NO está reproduciendo */}
            {!isPlaying && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Use mouse wheel to scroll manually
              </div>
            )}
            
            {/* Hint cuando SÍ está reproduciendo */}
            {isPlaying && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Ctrl + Wheel to change speed | F1/F2 for speed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}