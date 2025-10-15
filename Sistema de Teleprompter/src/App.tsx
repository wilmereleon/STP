// ===== IMPORTACIONES / IMPORTS =====
// Hooks de React / React hooks
import { useState, useEffect, useRef, useCallback } from 'react';
// Hook personalizado de macros / Custom macros hook
import { useMacros, defaultMacroSettings, MacroSettings as MacroSettingsType } from './components/useMacros';

// Tipo para las claves de macro basado en defaultMacroSettings / Type for macro keys based on defaultMacroSettings
type MacroKey = keyof typeof defaultMacroSettings;

// Componentes de la aplicación / Application components
import { RunOrderList } from './components/RunOrderList';
import { ScriptEditor } from './components/ScriptEditor';
import { TeleprompterPreview } from './components/TeleprompterPreview';
import { TeleprompterControls } from './components/TeleprompterControls';
import { TeleprompterWindow } from './components/TeleprompterWindow';
import { TeleprompterModal } from './components/TeleprompterModal';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { MacroMenu } from './components/MacroMenu';
import { Toaster } from './components/ui/sonner';

/**
 * Item del orden de ejecución (Run Order)
 * Run Order item
 * 
 * Representa un script individual en la lista de ejecución del teleprompter.
 * Represents an individual script in the teleprompter's execution list.
 * 
 * @interface RunOrderItem
 * @property {string} id - Identificador único / Unique identifier
 * @property {string} title - Título del script / Script title
 * @property {string} duration - Duración estimada (formato HH:MM:SS) / Estimated duration (format HH:MM:SS)
 * @property {'ready' | 'playing' | 'completed'} status - Estado actual / Current status
 * @property {string} text - Contenido del script / Script content
 */
interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  status: 'ready' | 'playing' | 'completed';
  text: string;
}


/**
 * App - Componente principal de la aplicación Teleprompter
 * App - Main Teleprompter application component
 * 
 * Componente raíz que orquesta toda la funcionalidad del sistema de teleprompter.
 * Maneja el estado global, la comunicación entre ventanas, la navegación de scripts,
 * y la coordinación de todos los componentes hijos.
 * 
 * Root component that orchestrates all teleprompter system functionality.
 * Manages global state, inter-window communication, script navigation,
 * and coordination of all child components.
 * 
 * Arquitectura de 3 paneles / 3-panel architecture:
 * - Panel izquierdo: Lista de Run Order / Left panel: Run Order list
 * - Panel central: Editor de scripts / Center panel: Script editor
 * - Panel derecho: Vista previa del teleprompter / Right panel: Teleprompter preview
 * 
 * Características principales / Main features:
 * - Sistema de Run Order con drag & drop / Run Order system with drag & drop
 * - Editor de scripts con marcadores de salto / Script editor with jump markers
 * - Vista previa en tiempo real / Real-time preview
 * - Ventana emergente de teleprompter / Teleprompter popup window
 * - Modal de teleprompter en pantalla completa / Fullscreen teleprompter modal
 * - Auto-avance entre scripts / Auto-advance between scripts
 * - Sistema de macros personalizable / Customizable macro system
 * - Comunicación inter-ventana con postMessage / Inter-window communication with postMessage
 * - Persistencia de configuración en localStorage / Configuration persistence in localStorage
 * - Carga y guardado de archivos .awn / .awn file loading and saving
 * 
 * @component
 * @returns {JSX.Element} Aplicación completa del teleprompter / Complete teleprompter application
 */
export default function App() {
  // ===== DETECCIÓN DE VENTANA EMERGENTE / POPUP WINDOW DETECTION =====
  /**
   * Verifica si esta instancia es una ventana emergente del teleprompter
   * Checks if this instance is a teleprompter popup window
   * 
   * Si popup=true en URL, renderiza solo TeleprompterWindow
   * If popup=true in URL, renders only TeleprompterWindow
   */
  const isPopupWindow = new URLSearchParams(window.location.search).get('popup') === 'true';
  
  if (isPopupWindow) {
    return <TeleprompterWindow />;
  }

  // ===== ESTADO PRINCIPAL DEL TELEPROMPTER / MAIN TELEPROMPTER STATE =====
  const [text, setText] = useState(''); // Texto actual del script / Current script text
  const [scriptTexts, setScriptTexts] = useState<{[key: string]: string}>({}); // Cache de textos de scripts / Script texts cache
  const [isPlaying, setIsPlaying] = useState(false); // Estado de reproducción / Playback state
  const [speed, setSpeed] = useState(1.0); // Velocidad de scroll (0.1-5x) / Scroll speed (0.1-5x)
  const [fontSize, setFontSize] = useState(200); // Tamaño de fuente en píxeles / Font size in pixels
  const [scrollPosition, setScrollPosition] = useState(0); // Posición de scroll actual / Current scroll position
  const [currentScript, setCurrentScript] = useState('How To Script.awn'); // Nombre del script actual / Current script name
  const [loadedFileName, setLoadedFileName] = useState<string | undefined>(undefined); // Nombre del archivo cargado / Loaded file name
  
  // ===== ESTADO DE UI Y MODALES / UI AND MODALS STATE =====
  const [isTeleprompterModalOpen, setIsTeleprompterModalOpen] = useState(false); // Modal de teleprompter fullscreen / Fullscreen teleprompter modal
  const [showMacroConfig, setShowMacroConfig] = useState(false); // Panel de configuración de macros / Macro configuration panel
  const [showMacroMenu, setShowMacroMenu] = useState(false); // Menú de atajos / Shortcuts menu
  
  // ===== ESTADO DE MARCADORES Y NAVEGACIÓN / MARKERS AND NAVIGATION STATE =====
  const [jumpMarkers, setJumpMarkers] = useState<{[key: string]: number}>({}); // Marcadores de salto {nombre: posición} / Jump markers {name: position}
  
  // ===== REFERENCIAS / REFERENCES =====
  const teleprompterWindowRef = useRef<Window | null>(null); // Referencia a ventana emergente / Reference to popup window
  const isUpdatingFromPopup = useRef(false); // Flag para prevenir loops de postMessage / Flag to prevent postMessage loops

  // ===== ESTADO DEL RUN ORDER / RUN ORDER STATE =====
  /**
   * Lista de items del Run Order con scripts predefinidos de ejemplo
   * Run Order items list with predefined example scripts
   * 
   * Contiene 13 scripts de ejemplo sobre equipamiento de broadcast
   * Contains 13 example scripts about broadcast equipment
   */
  const [runOrderItems, setRunOrderItems] = useState<RunOrderItem[]>([
    { id: '1', title: 'INTRO/TECH SCRIPTS ROLLING', duration: '00:01:15', status: 'ready', text: '[1] KEEPING THOSE SCRIPTS ROLLING:\n\nTeleprompter - the unsung hero in the broadcast chain - a critical element, to be sure, but one too often taken for granted as just another tool - a critical essential, to be work.\n\nWhile the teleprompter has been around for decades, helping anchors and reporters deliver news with confidence and eye contact, its role in modern broadcasting has evolved significantly.' },
    { id: '2', title: 'Intro/VTr', duration: '00:02:36', status: 'ready', text: '' },
    { id: '3', title: 'Pre-oil getting things going', duration: '00:01:40', status: 'ready', text: '' },
    { id: '4', title: 'No Problems', duration: '00:03:28', status: 'ready', text: '' },
    { id: '5', title: 'Support', duration: '00:05:18', status: 'ready', text: '' },
    { id: '6', title: 'Inbox Recovery', duration: '00:01:47', status: 'ready', text: '' },
    { id: '7', title: 'Traditional prompting systems', duration: '00:01:50', status: 'ready', text: '' },
    { id: '8', title: 'The Tools', duration: '00:04:32', status: 'ready', text: '' },
    { id: '9', title: 'Overview', duration: '00:01:01', status: 'ready', text: '' },
    { id: '10', title: 'Equipment Not Required', duration: '00:01:17', status: 'ready', text: '' },
    { id: '11', title: 'Product', duration: '00:01:17', status: 'ready', text: '' },
    { id: '12', title: 'Redundancy', duration: '00:05:19', status: 'ready', text: '' },
    { id: '13', title: 'Performance', duration: '00:08:20', status: 'ready', text: '' }
  ]);

  const [currentItem, setCurrentItem] = useState<string | null>('1'); // ID del item actual del Run Order / Current Run Order item ID
  
  // ===== ESTADO DE MACROS CON PERSISTENCIA / MACROS STATE WITH PERSISTENCE =====
  /**
   * Configuración de macros con carga desde localStorage
   * Macro settings with loading from localStorage
   * 
   * Intenta cargar configuración guardada, usa defaults si no existe
   * Tries to load saved configuration, uses defaults if not exists
   */
  const [macroSettings, setMacroSettings] = useState<MacroSettingsType>(() => {
    try {
      const saved = localStorage.getItem('macroSettings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultMacroSettings;
  });

  // ===== EFECTO: PERSISTIR CONFIGURACIÓN DE MACROS / EFFECT: PERSIST MACRO SETTINGS =====
  /**
   * Guarda la configuración de macros en localStorage cuando cambia
   * Saves macro settings to localStorage when it changes
   */
  useEffect(() => {
    localStorage.setItem('macroSettings', JSON.stringify(macroSettings));
  }, [macroSettings]);

  // ===== MANEJADOR: CAMBIO DE TAMAÑO DE FUENTE / HANDLER: FONT SIZE CHANGE =====
  /**
   * Maneja cambios de tamaño de fuente con feedback inmediato y logging
   * Handles font size changes with immediate feedback and logging
   * 
   * Proceso / Process:
   * 1. Valida y limita el rango (12-500px)
   * 2. Actualiza estado local
   * 3. Envía actualización a ventana emergente si existe
   * 4. Verifica la actualización después de 100ms
   * 
   * @param {number} size - Nuevo tamaño de fuente / New font size
   */
  const handleSetFontSize = (size: number) => {
    console.log('🔴 App.handleSetFontSize CALLED with:', size, 'current fontSize:', fontSize);
    const newSize = Math.max(12, Math.min(500, size)); // Límites: 12-500px / Limits: 12-500px
    console.log('🔴 App.handleSetFontSize - calculated newSize:', newSize);
    
    // Log del cambio de estado / Log state change
    console.log('🔴 App.handleSetFontSize - calling setFontSize with:', newSize);
    setFontSize(newSize);
    
    // Enviar a ventana emergente inmediatamente si está abierta / Send to popup window immediately if open
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed) {
      console.log('🔴 App.handleSetFontSize - sending to teleprompter window:', newSize);
      teleprompterWindowRef.current.postMessage({
        type: 'TELEPROMPTER_UPDATE',
        data: { text, isPlaying, speed, fontSize: newSize, scrollPosition }
      }, '*');
    }
    
    // Verificación después de actualización / Verification after state update
    setTimeout(() => {
      console.log('🔴 App.handleSetFontSize - VERIFICATION: fontSize should now be:', newSize);
    }, 100);
  };

  // ===== EFECTOS DE DEBUG: MONITOREO DE ESTADO / DEBUG EFFECTS: STATE MONITORING =====
  /**
   * Efectos para monitorear cambios críticos de estado
   * Effects to monitor critical state changes
   */
  useEffect(() => {
    console.log('🔵 STATE CHANGE - isPlaying:', isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    console.log('🔵 STATE CHANGE - fontSize:', fontSize);
  }, [fontSize]);

  // ===== MANEJADOR: FIN DE SCRIPT CON AUTO-AVANCE / HANDLER: SCRIPT END WITH AUTO-ADVANCE =====
  /**
   * Maneja el fin de un script y auto-avanza al siguiente si existe
   * Handles end of script and auto-advances to next if exists
   * 
   * Lógica de auto-avance / Auto-advance logic:
   * 1. Encuentra el índice del script actual
   * 2. Verifica si existe un script siguiente
   * 3. Marca el actual como completado
   * 4. Carga el siguiente script
   * 5. Continúa reproducción si el siguiente tiene contenido
   * 6. Si no hay más scripts, marca como completado y detiene
   */
  const handleEnd = () => {
    console.log('🔚 Auto-advance: Current script ended, checking for next script...');
    
    // Auto-avance al siguiente script si está disponible / Auto-advance to next script if available
    if (currentItem) {
      const currentIndex = runOrderItems.findIndex(item => item.id === currentItem);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < runOrderItems.length) {
        const nextItem = runOrderItems[nextIndex];
        console.log('🔚 Auto-advance: Moving to next script:', nextItem.title);
        
        // Marcar actual como completado / Mark current as completed
        const updatedItems = runOrderItems.map(item => 
          item.id === currentItem ? { ...item, status: 'completed' as const } : item
        );
        setRunOrderItems(updatedItems);
        
        // Moverse al siguiente script / Move to next script
        setCurrentItem(nextItem.id);
        setScrollPosition(0);
        setText(nextItem.text);
        setCurrentScript(nextItem.title + '.awn');
        
        // Continuar reproduciendo si hay contenido / Continue playing if there's content
        if (nextItem.text.trim()) {
          console.log('🔚 Auto-advance: Continuing playback with next script');
          setIsPlaying(true);
        } else {
          console.log('🔚 Auto-advance: Next script is empty, stopping playback');
          setIsPlaying(false);
        }
      } else {
        console.log('🔚 Auto-advance: End of run order reached');
        setIsPlaying(false);
        
        // Marcar actual como completado / Mark current as completed
        const updatedItems = runOrderItems.map(item => 
          item.id === currentItem ? { ...item, status: 'completed' as const } : item
        );
        setRunOrderItems(updatedItems);
      }
    } else {
      console.log('🔚 Auto-advance: No current item, just stopping');
      setIsPlaying(false);
    }
  };

  // ===== EFECTO: AUTO-SCROLL CON DETECCIÓN DE FIN / EFFECT: AUTO-SCROLL WITH END DETECTION =====
  /**
   * Efecto de auto-scroll con detección de fin de texto y auto-avance
   * Auto-scroll effect with text end detection and auto-advance
   * 
   * Algoritmo / Algorithm:
   * - Velocidad: speed × 0.5 píxeles cada 100ms (scroll lento y suave)
   * - Speed: speed × 0.5 pixels every 100ms (slow and smooth scroll)
   * - Detección de fin: Estima altura del texto y detecta cuando se alcanza
   * - End detection: Estimates text height and detects when reached
   * - Auto-avance: 1 segundo de delay antes de avanzar al siguiente script
   * - Auto-advance: 1 second delay before advancing to next script
   * 
   * Cálculos / Calculations:
   * - estimatedTextHeight = líneas × 40px (altura aproximada por línea)
   * - maxScrollNeeded = estimatedTextHeight + viewportHeight (800px)
   * - Si scrollPosition > maxScrollNeeded → activar auto-avance
   */
  useEffect(() => {
    let interval: number | null = null;
    
    if (isPlaying && text.trim()) {
      console.log('🟡 Auto-scroll STARTED - speed:', speed, 'scrollPosition:', scrollPosition);
      interval = window.setInterval(() => {
        setScrollPosition(prev => {
          // No hacer scroll si estamos al inicio y acabamos de reiniciar / Don't scroll if at beginning and just reset
          if (prev === 0 && !isPlaying) {
            console.log('🟡 Auto-scroll: Reset state detected, not scrolling');
            return 0;
          }
          
          const increment = speed * 0.5; // Mucho más lento: 0.5 en lugar de 3 / Much slower: 0.5 instead of 3
          const newPos = prev + increment;
          console.log('🟡 Auto-scroll tick:', prev, '->', newPos, 'increment:', increment);
          
          // Estimar si hemos alcanzado el fin del texto / Estimate if we've reached the end of the text
          // Esta es una aproximación - activaremos auto-avance cuando la posición sea muy alta
          // This is an approximation - we'll trigger auto-advance when scroll position gets very high
          const estimatedTextHeight = text.split('\n').length * 40; // Altura aproximada de línea / Approximate line height
          const viewportHeight = 800; // Altura aproximada del viewport / Approximate viewport height
          const maxScrollNeeded = estimatedTextHeight + viewportHeight;
          
          if (newPos > maxScrollNeeded && text.trim()) {
            console.log('🔚 Auto-scroll: End of text detected, triggering auto-advance');
            setTimeout(() => handleEnd(), 1000); // 1 segundo de delay antes de avanzar / 1 second delay before advancing
            return prev; // No actualizar más la posición / Don't update scroll position further
          }
          
          return newPos;
        });
      }, 100); // Intervalo más lento: 100ms en lugar de 40ms / Slower interval: 100ms instead of 40ms
    } else {
      console.log('🟡 Auto-scroll STOPPED - isPlaying:', isPlaying, 'hasText:', !!text.trim());
    }
    
    return () => {
      if (interval !== null) {
        console.log('🟡 Auto-scroll cleanup');
        window.clearInterval(interval);
      }
    };
  }, [isPlaying, speed, text, scrollPosition]);

  // ===== EFECTO: ACTUALIZAR TEXTO AL CAMBIAR ITEM / EFFECT: UPDATE TEXT WHEN ITEM CHANGES =====
  /**
   * Actualiza el texto cuando cambia el item actual del Run Order
   * Updates text when current Run Order item changes
   */
  useEffect(() => {
    if (currentItem) {
      const item = runOrderItems.find(item => item.id === currentItem);
      if (item) {
        setText(item.text);
        setCurrentScript(item.title + '.awn');
      }
    }
  }, [currentItem, runOrderItems]);

  // ===== EFECTO: ESCUCHAR MENSAJES DE VENTANA EMERGENTE / EFFECT: LISTEN TO POPUP WINDOW MESSAGES =====
  /**
   * Establece comunicación bidireccional con la ventana emergente del teleprompter
   * Establishes two-way communication with teleprompter popup window
   * 
   * Mensajes manejados / Handled messages:
   * - TELEPROMPTER_READY: Ventana lista, enviar datos iniciales / Window ready, send initial data
   * - TELEPROMPTER_CONTROL: Actualización de controles desde ventana / Control update from window
   * 
   * Flag isUpdatingFromPopup previene loops infinitos de postMessage
   * Flag isUpdatingFromPopup prevents infinite postMessage loops
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TELEPROMPTER_READY') {
        // Enviar datos iniciales a ventana emergente / Send initial data to popup window
        sendToTeleprompter();
      } else if (event.data.type === 'TELEPROMPTER_CONTROL') {
        // Actualizar estado local desde controles del teleprompter / Update local state from teleprompter controls
        console.log('📩 Received TELEPROMPTER_CONTROL from popup:', event.data.data);
        
        // Activar flag para prevenir enviar actualizaciones de vuelta / Set flag to prevent sending updates back
        isUpdatingFromPopup.current = true;
        
        const updates = event.data.data;
        if (updates.hasOwnProperty('isPlaying')) {
          console.log('📩 Updating isPlaying to:', updates.isPlaying);
          setIsPlaying(updates.isPlaying);
        }
        if (updates.hasOwnProperty('speed')) {
          console.log('📩 Updating speed to:', updates.speed);
          setSpeed(updates.speed);
        }
        if (updates.hasOwnProperty('fontSize')) {
          console.log('📩 Updating fontSize to:', updates.fontSize);
          setFontSize(updates.fontSize);
        }
        if (updates.hasOwnProperty('scrollPosition')) {
          console.log('📩 Updating scrollPosition to:', updates.scrollPosition);
          setScrollPosition(updates.scrollPosition);
        }
        
        // Resetear flag después de un breve delay / Reset flag after a short delay
        setTimeout(() => {
          isUpdatingFromPopup.current = false;
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // Sin dependencias para evitar re-crear el listener / No dependencies to avoid re-creating listener


  // ===== FUNCIONES AUXILIARES: NAVEGACIÓN DE CUES / HELPER FUNCTIONS: CUE NAVIGATION =====
  
  /**
   * Obtiene todas las posiciones de marcadores de cue/guion en el texto
   * Gets all cue/script marker positions in the text
   * 
   * Detecta 4 tipos de marcadores / Detects 4 types of markers:
   * 1. [1], [2], ... (marcadores numerados)
   * 2. # Título (markdown headings)
   * 3. TÍTULO: (mayúsculas con dos puntos)
   * 4. **Texto** (negrita markdown)
   * 
   * @param {string} text - Texto del guion / Script text
   * @returns {number[]} Array de posiciones en caracteres / Array of character positions
   */
  function getCuePositions(text: string): number[] {
    const lines = text.split('\n');
    let positions: number[] = [];
    let currentPos = 0;
    
    for (const line of lines) {
      // Coincidir [1], [2], ... o líneas con mayúsculas y dos puntos, o encabezados markdown
      // Match [1], [2], ... or lines with all caps and colon, or markdown headings
      if (/^(\[\d+\])/.test(line) || /^(#{1,3}\s+.+|[A-Z][A-Z\s]+:|^\*\*.+\*\*)/.test(line)) {
        positions.push(currentPos);
      }
      currentPos += line.length + 1; // +1 por salto de línea / +1 for newline
    }
    return positions;
  }

  /**
   * Salta al siguiente marcador de cue
   * Jumps to next cue marker
   * 
   * Encuentra el primer cue después de la posición actual (+10px de tolerancia)
   * Finds first cue after current position (+10px tolerance)
   */
  const handleNextCue = useCallback(() => {
    const positions = getCuePositions(text);
    const current = scrollPosition;
    const next = positions.find(pos => pos > current + 10); // +10 de tolerancia / +10 tolerance
    if (typeof next === 'number') {
      setScrollPosition(next);
    }
  }, [text, scrollPosition]);

  /**
   * Salta al marcador de cue anterior
   * Jumps to previous cue marker
   * 
   * Encuentra el último cue antes de la posición actual (-10px de tolerancia)
   * Finds last cue before current position (-10px tolerance)
   */
  const handlePreviousCue = useCallback(() => {
    const positions = getCuePositions(text);
    const current = scrollPosition;
    const prev = [...positions].reverse().find(pos => pos < current - 10); // -10 de tolerancia / -10 tolerance
    if (typeof prev === 'number') {
      setScrollPosition(prev);
    }
  }, [text, scrollPosition]);

  // ===== FUNCIÓN: ENVIAR DATOS A VENTANA EMERGENTE / FUNCTION: SEND DATA TO POPUP WINDOW =====
  /**
   * Envía datos actuales al teleprompter en ventana emergente
   * Sends current data to teleprompter in popup window
   * 
   * Verifica que la ventana existe y está abierta antes de enviar
   * Verifies window exists and is open before sending
   */
  const sendToTeleprompter = () => {
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed) {
      const dataToSend = { text, isPlaying, speed, fontSize, scrollPosition };
      console.log('📤 Sending to teleprompter:', dataToSend);
      teleprompterWindowRef.current.postMessage({
        type: 'TELEPROMPTER_UPDATE',
        data: dataToSend
      }, '*');
    }
  };

  // ===== EFECTO: SINCRONIZAR TEXTO CON VENTANA EMERGENTE / EFFECT: SYNC TEXT WITH POPUP WINDOW =====
  /**
   * Actualiza ventana emergente cuando cambia el TEXTO (no otros estados)
   * Updates popup window when TEXT changes (not other states)
   * 
   * Solo envía cuando cambia el texto, no cuando cambian otros estados
   * que pueden venir de la ventana emergente (previene loops)
   */
  useEffect(() => {
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed && !isUpdatingFromPopup.current) {
      console.log('📤 Text changed, sending update');
      sendToTeleprompter();
    }
  }, [text]); // Solo cuando cambia el texto / Only when text changes
  
  // ===== EFECTO: SINCRONIZAR isPlaying CON DEBOUNCE / EFFECT: SYNC isPlaying WITH DEBOUNCE =====
  /**
   * Para isPlaying, usar un pequeño debounce para evitar loops
   * For isPlaying, use small debounce to avoid loops
   * 
   * Delay de 50ms previene múltiples actualizaciones rápidas
   * 50ms delay prevents multiple rapid updates
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed && !isUpdatingFromPopup.current) {
        console.log('📤 isPlaying changed, sending update');
        sendToTeleprompter();
      }
    }, 50); // Debounce de 50ms / 50ms debounce
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // ===== MANEJADORES: APERTURA DE VENTANAS DEL TELEPROMPTER / HANDLERS: OPEN TELEPROMPTER WINDOWS =====
  
  /**
   * Abre el teleprompter en una nueva ventana emergente
   * Opens teleprompter in a new popup window
   * 
   * Características de la ventana / Window features:
   * - 1200×800px
   * - Sin barras de scroll, estado, herramientas, menú
   * - Redimensionable
   */
  const handleOpenTeleprompter = () => {
    const features = 'width=1200,height=800,scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no';
    teleprompterWindowRef.current = window.open(
      `${window.location.origin}${window.location.pathname}?popup=true`,
      'teleprompter', // Nombre de la ventana / Window name
      features
    );
  };

  /**
   * Abre el teleprompter en modal de pantalla completa
   * Opens teleprompter in fullscreen modal
   */
  const handleOpenTeleprompterModal = () => {
    setIsTeleprompterModalOpen(true);
  };

  /**
   * Cierra el modal del teleprompter
   * Closes teleprompter modal
   */
  const handleCloseTeleprompterModal = () => {
    setIsTeleprompterModalOpen(false);
  };

  // ===== MANEJADOR: PLAY/PAUSE / HANDLER: PLAY/PAUSE =====
  /**
   * Alterna entre reproducción y pausa del teleprompter
   * Toggles between play and pause of teleprompter
   * 
   * Definido ANTES de usarse en macroActions
   * Defined BEFORE being used in macroActions
   */
  const handlePlayPause = () => {
    console.log('🟢 App.handlePlayPause called - current isPlaying:', isPlaying);
    setIsPlaying(prev => {
      const newState = !prev;
      console.log('🟢 App.handlePlayPause - setting isPlaying to:', newState);
      return newState;
    });
  };

  /**
   * Manejador para cambios de estado desde TeleprompterModal
   * Handler for state changes from TeleprompterModal
   * 
   * @param {boolean} isPlaying - Estado de reproducción / Playback state
   * @param {number} speed - Velocidad de scroll / Scroll speed
   * @param {number} fontSize - Tamaño de fuente / Font size
   * @param {number} scrollPosition - Posición de scroll / Scroll position
   */
  const handleTeleprompterStateChange = (isPlaying: boolean, speed: number, fontSize: number, scrollPosition: number) => {
    setIsPlaying(isPlaying);
    setSpeed(speed);
    setFontSize(fontSize);
    setScrollPosition(scrollPosition);
  };

  // ===== CONFIGURACIÓN DE ACCIONES DE MACROS / MACRO ACTIONS CONFIGURATION =====
  /**
   * Objeto de acciones para el hook useMacros
   * Actions object for useMacros hook
   * 
   * Definido DESPUÉS de handlePlayPause para evitar errores de referencia
   * Defined AFTER handlePlayPause to avoid reference errors
   * 
   * 10 macros configuradas / 10 configured macros:
   * - onPlayStop: Alternar play/pausa
   * - onPause: Solo pausa
   * - onPrevious: Script anterior
   * - onNext: Siguiente script
   * - onIncreaseSpeed: +0.1x (máx 5x)
   * - onDecreaseSpeed: -0.1x (mín 0.1x)
   * - onIncreaseFontSize: +2px
   * - onDecreaseFontSize: -2px
   * - onNextCue: Siguiente marcador
   * - onPreviousCue: Marcador anterior
   */
  const macroActions = {
    onPlayStop: useCallback(() => handlePlayPause(), []),
    onPause: useCallback(() => setIsPlaying(false), []),
    onPrevious: useCallback(() => handleBackward(), [currentItem, runOrderItems]),
    onNext: useCallback(() => handleForward(), [currentItem, runOrderItems]),
    onIncreaseSpeed: useCallback(() => handleSpeedChange(Math.min(5, speed + 0.1)), [speed]),
    onDecreaseSpeed: useCallback(() => handleSpeedChange(Math.max(0.1, speed - 0.1)), [speed]),
    onIncreaseFontSize: useCallback(() => handleSetFontSize(fontSize + 2), [fontSize]),
    onDecreaseFontSize: useCallback(() => handleSetFontSize(fontSize - 2), [fontSize]),
    onNextCue: handleNextCue,
    onPreviousCue: handlePreviousCue,
  };

  // ===== ACTIVACIÓN DEL HOOK DE MACROS / MACRO HOOK ACTIVATION =====
  /**
   * Activa el hook de macros excepto cuando hay modales abiertos
   * Activates macro hook except when modals are open
   * 
   * Desactivado cuando / Disabled when:
   * - showMacroConfig = true (panel de configuración)
   * - showMacroMenu = true (menú de atajos)
   * - isTeleprompterModalOpen = true (modal de teleprompter)
   */
  useMacros(macroSettings, macroActions, !(showMacroConfig || showMacroMenu || isTeleprompterModalOpen));

  // ===== MANEJADOR: RESET / HANDLER: RESET =====
  /**
   * Reinicia el teleprompter al inicio del script actual
   * Resets teleprompter to beginning of current script
   * 
   * Proceso / Process:
   * 1. Detiene la reproducción (isPlaying = false)
   * 2. Reinicia posición de scroll (scrollPosition = 0)
   * 3. Envía actualización a ventana emergente si existe
   * 4. Verifica actualización después de 100ms
   */
  const handleReset = () => {
    console.log('🟢 App.handleReset called - Resetting teleprompter to initial state');
    console.log('🟢 Before reset - isPlaying:', isPlaying, 'scrollPosition:', scrollPosition);
    
    // Forzar detener reproducción primero / Force stop playback first
    setIsPlaying(false);
    
    // Reiniciar al inicio del script actual / Reset to beginning of current script
    setScrollPosition(0);
    
    // Enviar mensaje a ventana emergente si está abierta / Send message to popup window if open
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed) {
      teleprompterWindowRef.current.postMessage({
        type: 'TELEPROMPTER_UPDATE',
        data: { text, isPlaying: false, speed, fontSize, scrollPosition: 0 }
      }, '*');
    }
    
    console.log('🟢 After reset - State should be: isPlaying: false, scrollPosition: 0');
    
    // Forzar re-render con timeout para asegurar actualización de estado / Force re-render with timeout to ensure state update
    setTimeout(() => {
      console.log('🟢 Reset verification - isPlaying:', false, 'scrollPosition:', 0);
    }, 100);
  };

  // ===== MANEJADOR: EJECUTAR ACCIÓN DE MACRO (LEGACY) / HANDLER: EXECUTE MACRO ACTION (LEGACY) =====
  /**
   * Ejecuta acciones de macro por string (función legacy)
   * Executes macro actions by string (legacy function)
   * 
   * NOTA: Esta función puede estar obsoleta ya que se usa el hook useMacros
   * NOTE: This function may be obsolete since useMacros hook is used
   * 
   * @param {string} action - Nombre de la acción / Action name
   */
  const executeMacroAction = (action: string) => {
    console.log('MACRO: Executing action:', action);
    switch(action) {
      case 'play_pause':
        console.log('MACRO: Calling handlePlayPause');
        handlePlayPause();
        break;
      case 'reset':
        console.log('MACRO: Calling handleReset');
        handleReset();
        break;
      case 'stop':
        console.log('MACRO: Calling handleStop');
        handleStop();
        break;
      case 'forward':
        console.log('MACRO: Calling handleForward');
        handleForward();
        break;
      case 'backward':
        console.log('MACRO: Calling handleBackward');
        handleBackward();
        break;
      case 'speed_up':
        console.log('MACRO: Speed up from', speed);
        handleSpeedChange(Math.min(5, speed + 0.1)); // Incrementos más pequeños / Smaller increments
        break;
      case 'speed_down':
        console.log('MACRO: Speed down from', speed);
        handleSpeedChange(Math.max(0.1, speed - 0.1)); // Mínimo más bajo / Lower minimum
        break;
      case 'font_size_up':
        console.log('MACRO: Font size up from', fontSize);
        handleSetFontSize(Math.min(500, fontSize + 8));
        break;
      case 'font_size_down':
        console.log('MACRO: Font size down from', fontSize);
        handleSetFontSize(Math.max(12, fontSize - 8));
        break;
      case 'scroll_up':
        console.log('MACRO: Scroll up from', scrollPosition);
        setScrollPosition(prev => Math.max(0, prev - 50));
        break;
      case 'scroll_down':
        console.log('MACRO: Scroll down from', scrollPosition);
        setScrollPosition(prev => prev + 50);
        break;
    }
  };

  // ===== MANEJADORES DEL RUN ORDER / RUN ORDER HANDLERS =====
  
  /**
   * Añade un nuevo item vacío al Run Order
   * Adds a new empty item to Run Order
   */
  const handleAddItem = () => {
    const newId = (runOrderItems.length + 1).toString();
    const newItem: RunOrderItem = {
      id: newId,
      title: 'Nuevo Script',
      duration: '00:00:00',
      status: 'ready',
      text: ''
    };
    setRunOrderItems([...runOrderItems, newItem]);
  };

  /**
   * Maneja cambios en el texto del script actual
   * Handles changes in current script text
   * 
   * Actualiza el texto y genera marcadores de salto automáticamente
   * Updates text and generates jump markers automatically
   * 
   * @param {string} newText - Nuevo texto del script / New script text
   */
  const handleTextChange = (newText: string) => {
    setText(newText);
    
    // Actualizar el texto en el item actual del Run Order / Update text in current Run Order item
    if (currentItem) {
      const updatedItems = runOrderItems.map(item => 
        item.id === currentItem ? { ...item, text: newText } : item
      );
      setRunOrderItems(updatedItems);
    }
    
    // Generar marcadores de salto automáticamente / Generate jump markers automatically
    generateJumpMarkers(newText);
  };

  /**
   * Genera marcadores de salto automáticamente desde el texto
   * Generates jump markers automatically from text
   * 
   * Detecta y mapea / Detects and maps:
   * - [1], [2], ... → "Sección 1", "Sección 2"
   * - Títulos markdown y mayúsculas → primeros 30 caracteres
   * 
   * @param {string} text - Texto del guion / Script text
   */
  const generateJumpMarkers = (text: string) => {
    const markers: {[key: string]: number} = {};
    const lines = text.split('\n');
    let currentPosition = 0;
    
    lines.forEach((line, index) => {
      // Buscar marcadores de sección como [1], [2], etc. o títulos
      // Search for section markers like [1], [2], etc. or titles
      const sectionMatch = line.match(/^\[(\d+)\]/);
      const titleMatch = line.match(/^#{1,3}\s+(.+)/) || line.match(/^[A-Z][A-Z\s]+:/) || line.match(/^\*\*(.+)\*\*/);
      
      if (sectionMatch) {
        const sectionNumber = sectionMatch[1];
        markers[`Sección ${sectionNumber}`] = currentPosition;
      } else if (titleMatch && line.trim().length > 0) {
        const title = titleMatch[1] || line.trim();
        markers[title.substring(0, 30)] = currentPosition; // Truncar a 30 chars / Truncate to 30 chars
      }
      
      currentPosition += line.length + 1; // +1 para el salto de línea / +1 for newline
    });
    
    setJumpMarkers(markers);
  };

  /**
   * Salta a una posición específica en el texto
   * Jumps to a specific position in the text
   * 
   * Factor de conversión × 2 para ajuste visual
   * Conversion factor × 2 for visual adjustment
   * 
   * @param {number} position - Posición en caracteres / Position in characters
   */
  const handleJumpToPosition = (position: number) => {
    console.log('🎯 Saltando a posición:', position);
    setScrollPosition(position * 2); // Factor de conversión aproximado / Approximate conversion factor
    setIsPlaying(false); // Pausar para que el usuario vea el salto / Pause so user sees the jump
  };

  /**
   * Salta a un script específico del Run Order e inicia reproducción
   * Jumps to a specific Run Order script and starts playback
   * 
   * Proceso / Process:
   * 1. Busca el script por ID
   * 2. Cambia al script seleccionado
   * 3. Reinicia scroll al inicio
   * 4. Inicia reproducción automáticamente
   * 5. Actualiza estado del script
   * 
   * @param {string} scriptId - ID del script / Script ID
   */
  const handleJumpToScript = (scriptId: string) => {
    console.log('🎯 Saltando a script:', scriptId);
    
    // Buscar el script por ID / Find script by ID
    const targetScript = runOrderItems.find(item => item.id === scriptId);
    if (!targetScript) {
      console.log('🎯 Script no encontrado:', scriptId);
      return;
    }
    
    console.log('🎯 Saltando a:', targetScript.title);
    
    // Cambiar al script seleccionado / Change to selected script
    setCurrentItem(scriptId);
    setText(targetScript.text);
    setCurrentScript(targetScript.title + '.awn');
    setScrollPosition(0); // Empezar desde el principio / Start from beginning
    
    // Marcar como playing y empezar inmediatamente / Mark as playing and start immediately
    setIsPlaying(true);
    
    // Actualizar el estado del script actual como playing / Update current script status as playing
    const updatedItems = runOrderItems.map(item => ({
      ...item,
      status: item.id === scriptId ? 'ready' as const : item.status
    }));
    setRunOrderItems(updatedItems);
    
    console.log('🎯 Script iniciado automáticamente:', targetScript.title);
  };

  /**
   * Selecciona un item del Run Order (sin iniciar reproducción)
   * Selects a Run Order item (without starting playback)
   * 
   * @param {string} id - ID del item / Item ID
   */
  const handleItemSelect = (id: string) => {
    setCurrentItem(id);
    const item = runOrderItems.find(item => item.id === id);
    if (item) {
      setText(item.text);
      setCurrentScript(item.title + '.awn');
    }
  };

  // ===== MANEJADORES DE TRANSPORTE / TRANSPORT HANDLERS =====
  
  /**
   * Stop: Usa la misma lógica que Reset para consistencia
   * Stop: Uses same logic as Reset for consistency
   */
  const handleStop = () => {
    console.log('🟢 App.handleStop called - Calling handleReset for consistency');
    handleReset(); // Usar la misma lógica que reset / Use same logic as reset
  };

  /**
   * Avanza al siguiente script en el Run Order
   * Advances to next script in Run Order
   * 
   * Reinicia scroll al inicio del nuevo script
   * Resets scroll to beginning of new script
   */
  const handleForward = () => {
    console.log('🟢 App.handleForward called - navigating to next script in Run Order');
    if (!currentItem) return;
    
    const currentIndex = runOrderItems.findIndex(item => item.id === currentItem);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < runOrderItems.length) {
      const nextItem = runOrderItems[nextIndex];
      console.log('🟢 Moving from script:', runOrderItems[currentIndex]?.title, 'to:', nextItem.title);
      setCurrentItem(nextItem.id);
      setScrollPosition(0); // Reiniciar posición de scroll para nuevo script / Reset scroll position for new script
      setText(nextItem.text);
      setCurrentScript(nextItem.title + '.awn');
    } else {
      console.log('🟢 Already at last script in Run Order');
    }
  };

  /**
   * Retrocede al script anterior en el Run Order
   * Goes back to previous script in Run Order
   * 
   * Reinicia scroll al inicio del nuevo script
   * Resets scroll to beginning of new script
   */
  const handleBackward = () => {
    console.log('🟢 App.handleBackward called - navigating to previous script in Run Order');
    if (!currentItem) return;
    
    const currentIndex = runOrderItems.findIndex(item => item.id === currentItem);
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevItem = runOrderItems[prevIndex];
      console.log('🟢 Moving from script:', runOrderItems[currentIndex]?.title, 'to:', prevItem.title);
      setCurrentItem(prevItem.id);
      setScrollPosition(0); // Reiniciar posición de scroll para nuevo script / Reset scroll position for new script
      setText(prevItem.text);
      setCurrentScript(prevItem.title + '.awn');
    } else {
      console.log('🟢 Already at first script in Run Order');
    }
  };
  
  /**
   * Cambia la velocidad de scroll
   * Changes scroll speed
   * 
   * @param {number} newSpeed - Nueva velocidad (0.1-5x) / New speed (0.1-5x)
   */
  const handleSpeedChange = (newSpeed: number) => {
    console.log('App.Speed change:', speed, '->', newSpeed);
    setSpeed(newSpeed);
  };

  /**
   * Reordena items del Run Order mediante drag & drop
   * Reorders Run Order items via drag & drop
   * 
   * @param {number} dragIndex - Índice del item arrastrado / Index of dragged item
   * @param {number} hoverIndex - Índice donde soltar / Index where to drop
   */
  const handleReorderItems = (dragIndex: number, hoverIndex: number) => {
    const dragItem = runOrderItems[dragIndex];
    const newItems = [...runOrderItems];
    newItems.splice(dragIndex, 1); // Remover de posición original / Remove from original position
    newItems.splice(hoverIndex, 0, dragItem); // Insertar en nueva posición / Insert at new position
    setRunOrderItems(newItems);
  };

  /**
   * Cambia el título de un item del Run Order
   * Changes title of a Run Order item
   * 
   * Si es el item actual, también actualiza currentScript
   * If it's the current item, also updates currentScript
   * 
   * @param {string} id - ID del item / Item ID
   * @param {string} newTitle - Nuevo título / New title
   */
  const handleTitleChange = (id: string, newTitle: string) => {
    console.log('🟢 Updating title for item:', id, 'to:', newTitle);
    const updatedItems = runOrderItems.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    );
    setRunOrderItems(updatedItems);
    
    // Actualizar nombre del script actual si este es el item actual
    // Update current script name if this is the current item
    if (currentItem === id) {
      setCurrentScript(newTitle + '.awn');
    }
  };

  /**
   * Carga scripts desde un archivo .awn
   * Loads scripts from a .awn file
   * 
   * Reemplaza el Run Order actual con los scripts cargados
   * Replaces current Run Order with loaded scripts
   * 
   * @param {Array} scripts - Array de scripts parseados / Array of parsed scripts
   * @param {string} fileName - Nombre del archivo / File name
   */
  const handleFileLoad = (scripts: Array<{id: string, title: string, text: string}>, fileName: string) => {
    // Convertir scripts parseados a RunOrderItems / Convert parsed scripts to RunOrderItems
    const newItems: RunOrderItem[] = scripts.map((script) => ({
      id: script.id,
      title: script.title,
      duration: '00:00:00', // Duración por defecto / Default duration
      status: 'ready' as const,
      text: script.text
    }));

    // Reemplazar Run Order actual con scripts cargados / Replace current Run Order with loaded scripts
    setRunOrderItems(newItems);
    setLoadedFileName(fileName);
    
    // Seleccionar el primer script / Select first script
    if (newItems.length > 0) {
      setCurrentItem(newItems[0].id);
      setText(newItems[0].text);
      setCurrentScript(newItems[0].title + '.awn');
    }
  };

  // ===== RENDERIZADO PRINCIPAL / MAIN RENDERING =====
  return (
    <div className="h-screen flex flex-col bg-gray-800">
      {/* ===== BARRA SUPERIOR DE HERRAMIENTAS / TOP TOOLBAR ===== */}
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4">
        {/* Logo y estado / Logo and status */}
        <div className="flex items-center gap-4">
          <div className="text-white text-sm font-medium">AutoScript</div>
          <div className="text-gray-400 text-xs">
            PROMPTING | 14:53:05
          </div>
        </div>
        
        {/* Controles del lado derecho / Right side controls */}
        <div className="ml-auto flex items-center gap-4">
          {/* Menú de atajos / Shortcuts menu */}
          <div className="relative">
            <button
              onClick={() => setShowMacroMenu(!showMacroMenu)}
              className="text-gray-400 hover:text-white px-2 py-1 rounded text-sm"
            >
              ⌨️ Atajos
            </button>
            <MacroMenu 
              isOpen={showMacroMenu}
              onClose={() => setShowMacroMenu(false)}
              macros={macroSettings}
              onOpenFullConfig={() => setShowMacroConfig(true)}
            />
          </div>
          
          {/* Controles del teleprompter / Teleprompter controls */}
          <TeleprompterControls
            isPlaying={isPlaying}
            speed={speed}
            fontSize={fontSize}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onStop={handleStop}
            onForward={handleForward}
            onBackward={handleBackward}
            onSpeedChange={handleSpeedChange}
            onFontSizeChange={handleSetFontSize}
          />
        </div>
      </div>

      {/* ===== CONTENIDO PRINCIPAL: 3 PANELES / MAIN CONTENT: 3 PANELS ===== */}
      <div className="flex-1 flex">
        {/* ===== PANEL IZQUIERDO: RUN ORDER LIST / LEFT PANEL: RUN ORDER LIST ===== */}
        <div className="w-64 border-r border-gray-700">
          <RunOrderList
            items={runOrderItems}
            currentItem={currentItem}
            onItemSelect={handleItemSelect}
            onAddItem={handleAddItem}
            onReorderItems={handleReorderItems}
            onJumpToScript={handleJumpToScript}
            onTitleChange={handleTitleChange}
          />
        </div>

        {/* ===== PANEL CENTRAL: SCRIPT EDITOR / CENTER PANEL: SCRIPT EDITOR ===== */}
        <div className="flex-1">
          <ScriptEditor
            text={text}
            onTextChange={handleTextChange}
            currentScript={currentScript}
            onFileLoad={handleFileLoad}
            jumpMarkers={jumpMarkers}
            onJumpToPosition={handleJumpToPosition}
          />
        </div>

        {/* ===== PANEL DERECHO: TELEPROMPTER PREVIEW / RIGHT PANEL: TELEPROMPTER PREVIEW ===== */}
        <div className="w-80 border-l border-gray-700">
          <TeleprompterPreview
            text={text}
            fontSize={fontSize}
            isPlaying={isPlaying}
            scrollPosition={scrollPosition}
            speed={speed}
            onOpenTeleprompter={handleOpenTeleprompter}
            onOpenTeleprompterModal={handleOpenTeleprompterModal}
            onFontSizeChange={handleSetFontSize}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            fileName={loadedFileName}
            macros={macroSettings}
            onMacrosChange={setMacroSettings}
            onSpeedChange={handleSpeedChange}
            onScrollPositionChange={setScrollPosition}
            onJumpToPosition={handleJumpToPosition}
          />
        </div>
      </div>

      {/* ===== BARRA INFERIOR DE ESTADO / BOTTOM STATUS BAR ===== */}
      <div className="h-8 bg-gray-900 border-t border-gray-700 flex items-center px-4">
        <div className="text-xs text-gray-400">
          Run Orders | Story Editor: {loadedFileName || currentScript} | Prompter Preview: {loadedFileName || currentScript}
        </div>
      </div>
      
      {/* ===== COMPONENTE DE NOTIFICACIONES / NOTIFICATIONS COMPONENT ===== */}
      <Toaster />
      
      {/* ===== MODAL DE TELEPROMPTER / TELEPROMPTER MODAL ===== */}
      {/* Modal fullscreen para teleprompter / Fullscreen modal for teleprompter */}
      <TeleprompterModal
        text={text}
        isOpen={isTeleprompterModalOpen}
        onClose={handleCloseTeleprompterModal}
        initialFontSize={fontSize}
        initialSpeed={speed}
        onStateChange={handleTeleprompterStateChange}
        onJumpToPosition={handleJumpToPosition}
      />
      
      {/* ===== PANEL DE CONFIGURACIÓN DE MACROS / MACRO CONFIGURATION PANEL ===== */}
      {/* Panel lateral para configurar atajos de teclado / Side panel to configure keyboard shortcuts */}
      <ConfigurationPanel
        isOpen={showMacroConfig}
        onClose={() => setShowMacroConfig(false)}
        macros={macroSettings}
        onMacrosChange={setMacroSettings}
      />
    </div>
  );
}