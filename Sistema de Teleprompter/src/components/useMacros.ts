// ===== IMPORTACIONES / IMPORTS =====
// Hook de React para efectos / React hook for effects
import { useEffect } from 'react';

/**
 * Configuración de macros (atajos de teclado)
 * Macro settings (keyboard shortcuts)
 * 
 * Define las teclas asignadas a cada acción del teleprompter.
 * Usa códigos de tecla de la KeyboardEvent API (event.code).
 * 
 * Defines the keys assigned to each teleprompter action.
 * Uses key codes from the KeyboardEvent API (event.code).
 * 
 * @interface MacroSettings
 * @property {string} playStop - Tecla para play/pausa / Key for play/pause
 * @property {string} pause - Tecla para pausa / Key for pause
 * @property {string} previousScript - Tecla para guion anterior / Key for previous script
 * @property {string} nextScript - Tecla para siguiente guion / Key for next script
 * @property {string} increaseSpeed - Tecla para aumentar velocidad / Key to increase speed
 * @property {string} decreaseSpeed - Tecla para reducir velocidad / Key to decrease speed
 * @property {string} [increaseFontSize] - Tecla para aumentar fuente (opcional) / Key to increase font (optional)
 * @property {string} [decreaseFontSize] - Tecla para reducir fuente (opcional) / Key to decrease font (optional)
 * @property {string} [nextCue] - Tecla para siguiente cue/marcador (opcional) / Key for next cue/marker (optional)
 * @property {string} [previousCue] - Tecla para cue/marcador anterior (opcional) / Key for previous cue/marker (optional)
 */
export interface MacroSettings {
  playStop: string;
  pause: string;
  previousScript: string;
  nextScript: string;
  increaseSpeed: string;
  decreaseSpeed: string;
  increaseFontSize?: string;
  decreaseFontSize?: string;
  nextCue?: string;
  previousCue?: string;
}

/**
 * Configuración predeterminada de macros
 * Default macro settings
 * 
 * Asignación estándar de teclas de función para operación del teleprompter.
 * Standard function key assignment for teleprompter operation.
 * 
 * Distribución de teclas / Key distribution:
 * - F1-F2: Control de velocidad / Speed control
 * - F3-F4: Control de fuente / Font control
 * - F9-F10: Control de reproducción / Playback control
 * - F11-F12: Navegación de guiones / Script navigation
 * - PageUp/PageDown: Navegación de cues / Cue navigation
 * 
 * @constant
 * @type {MacroSettings}
 */
export const defaultMacroSettings: MacroSettings = {
  playStop: 'F10',           // Play/Pausa / Play/Pause
  pause: 'F9',               // Solo pausa / Pause only
  previousScript: 'F11',     // Guion anterior / Previous script
  nextScript: 'F12',         // Siguiente guion / Next script
  increaseSpeed: 'F1',       // Aumentar velocidad / Increase speed
  decreaseSpeed: 'F2',       // Reducir velocidad / Decrease speed
  increaseFontSize: 'F3',    // Aumentar fuente / Increase font
  decreaseFontSize: 'F4',    // Reducir fuente / Decrease font
  nextCue: 'PageDown',       // Siguiente marcador / Next marker
  previousCue: 'PageUp',     // Marcador anterior / Previous marker
};

/**
 * Acciones asociadas a las macros
 * Actions associated with macros
 * 
 * Define los callbacks que se ejecutarán cuando se presione cada tecla macro.
 * Defines the callbacks that will execute when each macro key is pressed.
 * 
 * @interface MacroActions
 * @property {() => void} onPlayStop - Callback para alternar play/pausa / Callback to toggle play/pause
 * @property {() => void} onPause - Callback para pausar / Callback to pause
 * @property {() => void} onPrevious - Callback para ir al anterior / Callback to go to previous
 * @property {() => void} onNext - Callback para ir al siguiente / Callback to go to next
 * @property {() => void} onIncreaseSpeed - Callback para aumentar velocidad / Callback to increase speed
 * @property {() => void} onDecreaseSpeed - Callback para reducir velocidad / Callback to decrease speed
 * @property {() => void} [onIncreaseFontSize] - Callback para aumentar fuente (opcional) / Callback to increase font (optional)
 * @property {() => void} [onDecreaseFontSize] - Callback para reducir fuente (opcional) / Callback to decrease font (optional)
 * @property {() => void} [onNextCue] - Callback para siguiente cue (opcional) / Callback for next cue (optional)
 * @property {() => void} [onPreviousCue] - Callback para cue anterior (opcional) / Callback for previous cue (optional)
 */
interface MacroActions {
  onPlayStop: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onIncreaseSpeed: () => void;
  onDecreaseSpeed: () => void;
  onIncreaseFontSize?: () => void;
  onDecreaseFontSize?: () => void;
  onNextCue?: () => void;
  onPreviousCue?: () => void;
}

/**
 * useMacros - Hook personalizado para manejo de atajos de teclado
 * useMacros - Custom hook for keyboard shortcut handling
 * 
 * Configura listeners globales de teclado para ejecutar acciones del teleprompter
 * mediante atajos personalizables. Previene conflictos con campos de entrada de texto.
 * 
 * Sets up global keyboard listeners to execute teleprompter actions via
 * customizable shortcuts. Prevents conflicts with text input fields.
 * 
 * Características / Features:
 * - Listener global de keydown / Global keydown listener
 * - Prevención en inputs/textareas / Prevention in inputs/textareas
 * - 10 macros configurables / 10 configurable macros
 * - Sistema enable/disable / Enable/disable system
 * - Cleanup automático / Automatic cleanup
 * - preventDefault para evitar comportamiento del navegador / preventDefault to avoid browser behavior
 * 
 * @param {MacroSettings} macroSettings - Configuración de teclas / Key configuration
 * @param {MacroActions} actions - Callbacks de acciones / Action callbacks
 * @param {boolean} [enabled=true] - Activar/desactivar macros / Enable/disable macros
 * 
 * @example
 * useMacros(
 *   { playStop: 'F10', pause: 'F9', ... },
 *   { onPlayStop: handlePlay, onPause: handlePause, ... },
 *   true
 * );
 */
export function useMacros(macroSettings: MacroSettings, actions: MacroActions, enabled: boolean = true) {
  useEffect(() => {
    // Si no está habilitado, no hacer nada / If not enabled, do nothing
    if (!enabled) return;

    /**
     * Manejador de eventos de teclado
     * Keyboard event handler
     * 
     * Proceso / Process:
     * 1. Verifica que no sea un campo de entrada / Verifies it's not an input field
     * 2. Obtiene el código de tecla / Gets key code
     * 3. Compara con macros configuradas / Compares with configured macros
     * 4. Ejecuta acción correspondiente / Executes corresponding action
     * 5. Previene comportamiento por defecto / Prevents default behavior
     * 
     * @param {KeyboardEvent} event - Evento de teclado / Keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // ===== PREVENCIÓN EN CAMPOS DE ENTRADA / PREVENTION IN INPUT FIELDS =====
      /**
       * Evita que las macros se activen mientras el usuario escribe
       * Prevents macros from activating while user is typing
       * 
       * Detecta / Detects:
       * - <input> elementos
       * - <textarea> elementos
       * - Elementos con contentEditable=true
       */
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; // Ignorar evento / Ignore event
      }

      // Obtener código de tecla (ej: 'F10', 'KeyA', 'Space') / Get key code (e.g.: 'F10', 'KeyA', 'Space')
      const key = event.code;
      
      // ===== SWITCH: EVALUACIÓN DE MACROS / SWITCH: MACRO EVALUATION =====
      /**
       * Compara la tecla presionada con cada macro configurada
       * Compares pressed key with each configured macro
       * 
       * Patrón para cada caso / Pattern for each case:
       * 1. Comparar con configuración / Compare with configuration
       * 2. Prevenir comportamiento por defecto / Prevent default behavior
       * 3. Ejecutar acción / Execute action
       * 4. Break para evitar múltiples ejecuciones / Break to avoid multiple executions
       */
      switch (key) {
        // ===== MACRO: PLAY/STOP (ALTERNAR) / PLAY/STOP (TOGGLE) =====
        case macroSettings.playStop:
          event.preventDefault(); // Prevenir F10 por defecto del navegador / Prevent F10 browser default
          actions.onPlayStop();
          break;
        
        // ===== MACRO: PAUSE (SOLO PAUSAR) / PAUSE (PAUSE ONLY) =====
        case macroSettings.pause:
          event.preventDefault();
          actions.onPause();
          break;
        
        // ===== MACRO: GUION ANTERIOR / PREVIOUS SCRIPT =====
        case macroSettings.previousScript:
          event.preventDefault(); // Prevenir F11 fullscreen por defecto / Prevent F11 fullscreen default
          actions.onPrevious();
          break;
        
        // ===== MACRO: SIGUIENTE GUION / NEXT SCRIPT =====
        case macroSettings.nextScript:
          event.preventDefault();
          actions.onNext();
          break;
        
        // ===== MACRO: AUMENTAR VELOCIDAD / INCREASE SPEED =====
        case macroSettings.increaseSpeed:
          event.preventDefault();
          actions.onIncreaseSpeed();
          break;
        
        // ===== MACRO: REDUCIR VELOCIDAD / DECREASE SPEED =====
        case macroSettings.decreaseSpeed:
          event.preventDefault();
          actions.onDecreaseSpeed();
          break;
        
        // ===== MACRO: AUMENTAR FUENTE (OPCIONAL) / INCREASE FONT (OPTIONAL) =====
        case macroSettings.increaseFontSize:
          if (actions.onIncreaseFontSize) { // Solo si el callback existe / Only if callback exists
            event.preventDefault();
            actions.onIncreaseFontSize();
          }
          break;
        
        // ===== MACRO: REDUCIR FUENTE (OPCIONAL) / DECREASE FONT (OPTIONAL) =====
        case macroSettings.decreaseFontSize:
          if (actions.onDecreaseFontSize) { // Solo si el callback existe / Only if callback exists
            event.preventDefault();
            actions.onDecreaseFontSize();
          }
          break;
        
        // ===== MACRO: SIGUIENTE CUE/MARCADOR (OPCIONAL) / NEXT CUE/MARKER (OPTIONAL) =====
        case macroSettings.nextCue:
          if (actions.onNextCue) { // Solo si el callback existe / Only if callback exists
            event.preventDefault();
            actions.onNextCue();
          }
          break;
        
        // ===== MACRO: CUE/MARCADOR ANTERIOR (OPCIONAL) / PREVIOUS CUE/MARKER (OPTIONAL) =====
        case macroSettings.previousCue:
          if (actions.onPreviousCue) { // Solo si el callback existe / Only if callback exists
            event.preventDefault();
            actions.onPreviousCue();
          }
          break;
      }
    };

    // ===== REGISTRO Y CLEANUP DE LISTENER / LISTENER REGISTRATION AND CLEANUP =====
    /**
     * Registra el listener global de teclado
     * Registers global keyboard listener
     * 
     * - document.addEventListener: Captura eventos en todo el documento
     * - 'keydown': Se dispara cuando se presiona una tecla
     * - Cleanup function: Se ejecuta cuando el componente se desmonta o las dependencias cambian
     */
    document.addEventListener('keydown', handleKeyDown);
    
    // Función de limpieza / Cleanup function
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [macroSettings, actions, enabled]); // Re-ejecutar si cambian las configuraciones, acciones o estado enabled
}

// ===== FUNCIÓN AUXILIAR: NOMBRE DE VISUALIZACIÓN DE TECLAS / HELPER FUNCTION: KEY DISPLAY NAME =====
/**
 * Obtiene un nombre legible para mostrar al usuario de los códigos de tecla
 * Gets a readable name to display to the user from key codes
 * 
 * Convierte códigos técnicos (ej: 'KeyA', 'ArrowUp') en nombres amigables (ej: 'A', '↑')
 * Converts technical codes (e.g.: 'KeyA', 'ArrowUp') to friendly names (e.g.: 'A', '↑')
 * 
 * Categorías mapeadas / Mapped categories:
 * - Teclas de función: F1-F12
 * - Teclas especiales: Space, Enter, Escape
 * - Flechas: ↑ ↓ ← →
 * - Letras: A-Z
 * 
 * @param {string} keyCode - Código de tecla de KeyboardEvent.code / Key code from KeyboardEvent.code
 * @returns {string} Nombre legible para mostrar / Readable name to display
 * 
 * @example
 * getKeyDisplayName('KeyA')      // → 'A'
 * getKeyDisplayName('ArrowUp')   // → '↑'
 * getKeyDisplayName('Space')     // → 'Space'
 * getKeyDisplayName('F10')       // → 'F10'
 */
export function getKeyDisplayName(keyCode: string): string {
  // Mapa de códigos a nombres de visualización / Map of codes to display names
  const keyMap: { [key: string]: string } = {
    // Teclas de función / Function keys (F1-F12)
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
    'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    
    // Teclas especiales / Special keys
    'Space': 'Space', 'Enter': 'Enter', 'Escape': 'Esc',
    
    // Flechas con símbolos Unicode / Arrows with Unicode symbols
    'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
    
    // Letras A-Z / Letters A-Z
    'KeyA': 'A', 'KeyB': 'B', 'KeyC': 'C', 'KeyD': 'D', 'KeyE': 'E',
    'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyI': 'I', 'KeyJ': 'J',
    'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M', 'KeyN': 'N', 'KeyO': 'O',
    'KeyP': 'P', 'KeyQ': 'Q', 'KeyR': 'R', 'KeyS': 'S', 'KeyT': 'T',
    'KeyU': 'U', 'KeyV': 'V', 'KeyW': 'W', 'KeyX': 'X', 'KeyY': 'Y', 'KeyZ': 'Z'
  };
  
  // Retornar nombre mapeado o el código original si no existe / Return mapped name or original code if not found
  return keyMap[keyCode] || keyCode;
}

// ===== CONSTANTE: TECLAS DISPONIBLES PARA ASIGNACIÓN / CONSTANT: AVAILABLE KEYS FOR ASSIGNMENT =====
/**
 * Array de códigos de teclas disponibles para asignar a macros
 * Array of key codes available for assigning to macros
 * 
 * Lista completa de teclas que pueden ser usadas como atajos.
 * Se excluyen teclas de modificadores (Ctrl, Alt, Shift) y teclas especiales del sistema.
 * 
 * Complete list of keys that can be used as shortcuts.
 * Excludes modifier keys (Ctrl, Alt, Shift) and special system keys.
 * 
 * Categorías incluidas / Included categories:
 * - 12 teclas de función (F1-F12)
 * - 3 teclas especiales (Space, Enter, Escape)
 * - 26 letras (A-Z)
 * 
 * Total: 41 teclas disponibles / Total: 41 available keys
 * 
 * @constant
 * @type {string[]}
 */
export const availableKeys = [
  // Teclas de función / Function keys (12 keys)
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  
  // Teclas especiales / Special keys (3 keys)
  'Space', 'Enter', 'Escape',
  
  // Letras A-Z en formato KeyCode / Letters A-Z in KeyCode format (26 keys)
  'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ',
  'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT',
  'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ'
];