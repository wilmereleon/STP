// ===== IMPORTACIONES / IMPORTS =====
// Hooks de React / React hooks
import { useEffect, useRef } from 'react';
// Componente para renderizar texto con marcadores de salto / Component to render text with jump markers
import { TextWithJumpMarkers } from './TextWithJumpMarkers';
// Estilos personalizados para ocultar scrollbar / Custom styles to hide scrollbar
import './TeleprompterScreen.css';

/**
 * Propiedades del componente TeleprompterScreen
 * TeleprompterScreen component properties
 * 
 * @interface TeleprompterScreenProps
 * @property {string} text - Texto del guion a mostrar / Script text to display
 * @property {boolean} isPlaying - Estado de reproducción / Playback state
 * @property {number} speed - Velocidad de scroll (multiplicador) / Scroll speed (multiplier)
 * @property {number} fontSize - Tamaño de fuente en píxeles / Font size in pixels
 * @property {() => void} onEnd - Callback cuando se llega al final del texto / Callback when reaching end of text
 * @property {number} scrollPosition - Posición actual de scroll en píxeles / Current scroll position in pixels
 * @property {(position: number) => void} setScrollPosition - Función para actualizar posición de scroll / Function to update scroll position
 * @property {(position: number) => void} [onJumpToPosition] - Callback para saltar a posición específica / Callback to jump to specific position
 * @property {number} [guideLinePosition=50] - Posición de la línea guía (%) / Guide line position (%)
 */
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
  guideLinePosition?: number;
  mirrorX?: boolean;
  mirrorY?: boolean;
}

/**
 * TeleprompterScreen - Pantalla principal del teleprompter
 * TeleprompterScreen - Main teleprompter screen
 * 
 * Componente que renderiza la pantalla completa del teleprompter con texto scrolleando
 * de forma fluida y suave. Proporciona auto-scroll configurable y scroll manual con inercia.
 * 
 * Component that renders the full teleprompter screen with smoothly scrolling text.
 * Provides configurable auto-scroll and manual scroll with inertia.
 * 
 * Características principales / Main features:
 * - Auto-scroll fluido con velocidad configurable / Smooth auto-scroll with configurable speed
 * - Scroll manual con efecto de inercia / Manual scroll with inertia effect
 * - Detección automática del final del texto / Automatic end-of-text detection
 * - Gradientes superior e inferior para transiciones suaves / Top and bottom gradients for smooth transitions
 * - Sincronización de posición de scroll / Scroll position synchronization
 * - Soporte para marcadores de salto en el texto / Support for jump markers in text
 * - Control mediante rueda del mouse con suavidad / Mouse wheel control with smoothness
 * 
 * Algoritmo de scroll / Scroll algorithm:
 * - Base: speed × 14 píxeles/segundo (optimizado para lectura)
 * - Inercia: Decaimiento del 92% (0.92) para suavidad natural
 * - Detección de fin: 100px antes del final real
 * - Delay de fin: 1 segundo antes de llamar onEnd()
 * 
 * @component
 * @param {TeleprompterScreenProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Pantalla del teleprompter / Teleprompter screen
 */
export function TeleprompterScreen({ 
  text, 
  isPlaying, 
  speed, 
  fontSize, 
  onEnd,
  scrollPosition,
  setScrollPosition,
  isManualScrolling = false, // Mantenido por compatibilidad pero no usado / Kept for compatibility but not used
  onJumpToPosition,
  guideLinePosition = 50,
  mirrorX = false,
  mirrorY = false
}: TeleprompterScreenProps) {
  // ===== REFERENCIAS / REFERENCES =====
  // Referencia al contenedor principal de scroll / Reference to main scroll container
  const containerRef = useRef<HTMLDivElement>(null);
  // Referencia al frame de animación de auto-scroll / Reference to auto-scroll animation frame
  const animationRef = useRef<number | undefined>(undefined);
  // Referencia a la inercia del scroll manual / Reference to manual scroll inertia
  const inertiaRef = useRef<number>(0);
  // Referencia a scrollPosition para acceder al valor actual en animación
  // Reference to scrollPosition to access current value in animation
  const scrollPositionRef = useRef<number>(scrollPosition);
  // Factor de decaimiento de la inercia (0.92 = 92% por frame, suave y natural)
  // Inertia decay factor (0.92 = 92% per frame, smooth and natural)
  const inertiaDecay = 0.92;
  
  // Actualizar ref cuando cambie scrollPosition
  // Update ref when scrollPosition changes
  useEffect(() => {
    scrollPositionRef.current = scrollPosition;
  }, [scrollPosition]);

  // ===== EFECTO DEBUG: LOG DE PROPS / DEBUG EFFECT: LOG PROPS =====
  useEffect(() => {
    console.log('🔵 TeleprompterScreen: Props received', {
      isPlaying,
      speed,
      fontSize,
      scrollPosition,
      hasText: text?.length > 0,
      textPreview: text?.substring(0, 50)
    });
  }, [isPlaying, speed, fontSize, scrollPosition, text]);

  // ===== EFECTO: AUTO-SCROLL FLUIDO / EFFECT: SMOOTH AUTO-SCROLL =====
  /**
   * Maneja el auto-scroll suave del teleprompter usando requestAnimationFrame
   * Handles smooth teleprompter auto-scroll using requestAnimationFrame
   * 
   * Algoritmo / Algorithm:
   * 1. Calcula delta time entre frames para scroll consistente
   * 2. Velocidad base: speed × 14 px/s (optimizado para lectura)
   * 3. Acumula incrementos sub-píxel para mejor fluidez
   * 4. Detecta cuando está a 100px del final
   * 5. Espera 1 segundo y llama onEnd()
   * 
   * MEJORA: Acumulador sub-píxel para evitar pérdida de precisión
   * 
   * Se detiene si / Stops if:
   * - isPlaying = false
   */
  useEffect(() => {
    console.log('🎬 TeleprompterScreen: auto-scroll effect triggered', { isPlaying, speed });
    
    let animationFrame: number | null = null;
    let lastTimestamp: number | null = null;
    let subPixelAccumulator = 0; // Acumulador para incrementos sub-píxel

    /**
     * Función de animación que se llama en cada frame
     * Animation function called on each frame
     * 
     * @param {number} timestamp - Timestamp actual del frame / Current frame timestamp
     */
    function animateScroll(timestamp: number) {
      // **CONDICIÓN DE PARADA: No está reproduciendo**
      // **STOP CONDITION: Not playing**
      if (!isPlaying) {
        lastTimestamp = null;
        subPixelAccumulator = 0; // Reset acumulador
        return;
      }
      
      // Inicializar timestamp en el primer frame / Initialize timestamp on first frame
      if (lastTimestamp === null) lastTimestamp = timestamp;
      
      // Calcular tiempo transcurrido desde último frame / Calculate elapsed time since last frame
      const elapsed = timestamp - lastTimestamp;
      
      // **CÁLCULO DE VELOCIDAD CON ACUMULADOR SUB-PÍXEL**
      // **SPEED CALCULATION WITH SUB-PIXEL ACCUMULATOR**
      const pixelsPerSecond = speed * 14; // 14 es más lento y suave / 14 is slower and smoother
      const increment = (pixelsPerSecond * elapsed) / 1000; // Convertir ms a segundos / Convert ms to seconds
      
      // Acumular incremento sub-píxel
      subPixelAccumulator += increment;
      
      // Solo actualizar cuando tenemos >= 0.1px acumulados
      if (Math.abs(subPixelAccumulator) >= 0.1) {
        const newPos = scrollPositionRef.current + subPixelAccumulator; // Usar ref para obtener valor actual
        subPixelAccumulator = 0; // Reset tras aplicar

        // **DETECCIÓN DE FINAL DEL TEXTO / END-OF-TEXT DETECTION**
        if (containerRef.current) {
          const container = containerRef.current;
          const maxScroll = container.scrollHeight - container.clientHeight; // Scroll máximo posible / Maximum possible scroll
          const endThreshold = maxScroll - 100; // Umbral: 100px antes del final / Threshold: 100px before end
          
          // Si llegó al umbral de fin (SOLO si realmente está cerca del final)
          // If reached end threshold (ONLY if really close to the end)
          if (newPos >= endThreshold && newPos >= maxScroll - 200) {
            console.log('🏁 TeleprompterScreen: reached end threshold, calling onEnd() in 1s');
            setTimeout(() => onEnd(), 1000); // Esperar 1 segundo antes de notificar / Wait 1 second before notifying
            return;
          }
        }

        // Actualizar posición de scroll / Update scroll position
        setScrollPosition(newPos);
      }
      
      lastTimestamp = timestamp;
      
      // Solicitar siguiente frame / Request next frame
      animationFrame = window.requestAnimationFrame(animateScroll);
    }

    // Iniciar animación si está reproduciendo
    // Start animation if playing
    if (isPlaying) {
      console.log('▶️ TeleprompterScreen: starting auto-scroll animation');
      animationFrame = window.requestAnimationFrame(animateScroll);
    } else {
      console.log('⏸️ TeleprompterScreen: auto-scroll NOT started', { isPlaying });
    }

    // Cleanup: Cancelar animación al desmontar o cambiar dependencias
    // Cleanup: Cancel animation on unmount or dependency change
    return () => {
      if (animationFrame !== null) {
        console.log('🛑 TeleprompterScreen: canceling auto-scroll animation');
        window.cancelAnimationFrame(animationFrame);
      }
      lastTimestamp = null;
    };
  }, [isPlaying, speed, onEnd, setScrollPosition]);
  // ⚠️ NO incluir scrollPosition en dependencias - causaría loop infinito
  // ⚠️ DO NOT include scrollPosition in dependencies - would cause infinite loop

  // ===== EFECTO: SCROLL MANUAL CON INERCIA / EFFECT: MANUAL SCROLL WITH INERTIA =====
  /**
   * Maneja el scroll manual con efecto de inercia suave
   * Handles manual scroll with smooth inertia effect
   * 
   * Algoritmo de inercia / Inertia algorithm:
   * 1. inertiaRef.current contiene la velocidad de inercia actual
   * 2. Se multiplica por inertiaDecay (0.92) en cada frame
   * 3. Se detiene cuando la inercia es menor a 0.5
   * 4. Crea un efecto de "deslizamiento" natural después de scrollear
   * 
   * Umbral de detención: 0.5 (si |inercia| < 0.5, se detiene)
   * Stop threshold: 0.5 (if |inertia| < 0.5, stops)
   */
  useEffect(() => {
    let animationFrame: number | null = null;
    let localScroll = scrollPosition; // Copia local para evitar loops / Local copy to avoid loops
    
    /**
     * Función de animación de inercia
     * Inertia animation function
     */
    function animateInertia() {
      // Continuar solo si hay inercia significativa / Continue only if there's significant inertia
      if (Math.abs(inertiaRef.current) > 0.5) {
        // Aplicar inercia a la posición / Apply inertia to position
        localScroll = localScroll + inertiaRef.current;
        setScrollPosition(localScroll);
        
        // Decaer la inercia (92% del valor anterior) / Decay inertia (92% of previous value)
        inertiaRef.current *= inertiaDecay;
        
        // Solicitar siguiente frame / Request next frame
        animationFrame = window.requestAnimationFrame(animateInertia);
      }
    }
    
    // Iniciar animación si hay inercia / Start animation if there's inertia
    if (Math.abs(inertiaRef.current) > 0.5) {
      animationFrame = window.requestAnimationFrame(animateInertia);
    }
    
    // Cleanup: Cancelar animación / Cleanup: Cancel animation
    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPosition, setScrollPosition]);

  // ===== EFECTO: SINCRONIZAR SCROLL VISUAL / EFFECT: SYNCHRONIZE VISUAL SCROLL =====
  /**
   * Sincroniza la posición de scroll lógica con el scroll visual del contenedor
   * Synchronizes logical scroll position with container's visual scroll
   * 
   * Se ejecuta cada vez que cambia scrollPosition
   * Runs whenever scrollPosition changes
   */
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // ===== MANEJADOR: RUEDA DEL MOUSE - SCROLL MANUAL DURANTE EJECUCIÓN / HANDLER: MOUSE WHEEL - MANUAL SCROLL DURING PLAYBACK =====
  /**
   * ✅ NUEVO: Scroll manual funciona SIEMPRE, incluso durante reproducción
   * ✅ NEW: Manual scroll works ALWAYS, even during playback
   * 
   * Permite al operador ajustar posición manualmente en cualquier momento
   * Allows operator to adjust position manually at any time
   */
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // ✅ Funciona SIEMPRE - sin restricción de isPlaying
    // ✅ Works ALWAYS - no isPlaying restriction
    
    // Calcular dirección y magnitud del scroll
    // Calculate scroll direction and magnitude
    const delta = e.deltaY > 0 ? 1 : -1;
    
    // Aplicar inercia para scroll manual suave
    // Apply inertia for smooth manual scrolling
    inertiaRef.current = delta * 8; // Magnitud de inercia
    
    // Actualizar posición inmediatamente
    // Update position immediately
    const newPos = scrollPosition + (delta * 50); // Scroll de 50px por tick
    setScrollPosition(newPos);
    
    console.log('🖱️ Manual wheel scroll (durante ejecución permitido):', delta > 0 ? '↓' : '↑', 'new pos:', newPos);
  };

  // ===== CALCULAR TRANSFORMACIÓN DE ESPEJO / CALCULATE MIRROR TRANSFORMATION =====
  const mirrorTransform = [];
  if (mirrorX) mirrorTransform.push('scaleX(-1)');
  if (mirrorY) mirrorTransform.push('scaleY(-1)');
  const transformStyle = mirrorTransform.length > 0 ? mirrorTransform.join(' ') : 'none';

  // ✅ LOGGING EXPLÍCITO PARA DEBUG
  console.log('═══════════════════════════════════════');
  console.log('🪞 TeleprompterScreen MIRROR CHECK:');
  console.log('   mirrorX prop:', mirrorX);
  console.log('   mirrorY prop:', mirrorY);
  console.log('   mirrorTransform array:', mirrorTransform);
  console.log('   transformStyle:', transformStyle);
  console.log('   DEBERÍA VERSE INVERTIDO:', mirrorX ? 'SÍ ✅' : 'NO ❌');
  console.log('═══════════════════════════════════════');

  return (
    // ===== CONTENEDOR PRINCIPAL CON POSICIÓN RELATIVA / MAIN CONTAINER WITH RELATIVE POSITION =====
    <div className="relative w-full" style={{ height: '100vh' }}>
      {/* ===== CONTENEDOR DE SCROLL / SCROLL CONTAINER ===== */}
      {/* Contenedor con fondo negro y scroll automático pero barra oculta */}
      {/* Container with black background and automatic scroll but hidden scrollbar */}
      <div 
        ref={containerRef}
        className="teleprompter-screen w-full h-full bg-black text-white overflow-y-auto overflow-x-hidden"
        style={{ 
          fontSize: `${fontSize}px`, // Tamaño de fuente dinámico / Dynamic font size
          scrollBehavior: 'auto', // Cambiado de 'smooth' a 'auto' para mejor control / Changed from 'smooth' to 'auto' for better control
          scrollbarWidth: 'none', // Firefox: ocultar scrollbar / Firefox: hide scrollbar
          msOverflowStyle: 'none' // IE/Edge: ocultar scrollbar / IE/Edge: hide scrollbar
        }}
        onWheel={handleWheel} // Capturar eventos de rueda del mouse / Capture mouse wheel events
      >
        {/* ===== CONTENIDO DE TEXTO CON ESPEJO / TEXT CONTENT WITH MIRROR ===== */}
        {/* ✅ IMPORTANTE: El transform se aplica al DIV INTERNO para invertir el texto */}
        {/* ✅ IMPORTANT: Transform is applied to INNER DIV to flip the text */}
        <div 
          className="p-8 pb-96"
          style={{ 
            transform: transformStyle, // ✅ ✅ ✅ Aplicar espejo AQUÍ / Apply mirror HERE
            transformOrigin: 'center center', // Centrar transformación / Center transformation
            backgroundColor: mirrorX ? 'rgba(0, 100, 255, 0.05)' : 'transparent' // DEBUG: fondo azul si mirror activo
          }}
        >
          {/* ✅ DEBUG VISUAL */}
          {mirrorX && (
            <div style={{ 
              position: 'fixed', 
              top: '20px', 
              left: '20px', 
              background: 'red', 
              color: 'white', 
              padding: '10px', 
              zIndex: 9999,
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              🪞 MIRROR ACTIVO - TEXTO DEBERÍA ESTAR INVERTIDO
            </div>
          )}
          
          {text ? (
            // **Componente TextWithJumpMarkers: Renderiza texto con marcadores de salto**
            // **TextWithJumpMarkers Component: Renders text with jump markers**
            <TextWithJumpMarkers
              text={text}
              onJumpToPosition={onJumpToPosition}
              fontSize={fontSize}
              className=""
              style={{ lineHeight: 1.6 }} // Espaciado entre líneas / Line spacing
              showJumpIcons={true} // Mostrar iconos de salto / Show jump icons
            />
          ) : (
            // **Mensaje cuando no hay texto / Message when there's no text**
            <div className="text-center text-gray-500 mt-20">
              <p>No hay texto para mostrar</p>
              <p className="text-sm">Escribe texto en el editor principal</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== LÍNEA GUÍA (APUNTADOR) - POSICIÓN FIJA / GUIDE LINE (POINTER) - FIXED POSITION ===== */}
      {/* Línea amarilla horizontal que indica dónde leer - SIEMPRE VISIBLE */}
      {/* Yellow horizontal line indicating where to read - ALWAYS VISIBLE */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ 
          top: `${guideLinePosition}%`,
          borderTop: '4px solid #FBBF24',
          opacity: 1,
          zIndex: 100,
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.9), 0 0 40px rgba(251, 191, 36, 0.6)',
          filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))'
        }}
      />

      {/* ===== OVERLAYS DE GRADIENTE - POSICIÓN FIJA / GRADIENT OVERLAYS - FIXED POSITION ===== */}
      {/* Gradiente superior: Oculta el texto que entra suavemente / Top gradient: Hides entering text smoothly */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none" style={{ zIndex: 50 }} />
      
      {/* Gradiente inferior: Oculta el texto que sale suavemente / Bottom gradient: Hides exiting text smoothly */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{ zIndex: 50 }} />
    </div>
  );
}