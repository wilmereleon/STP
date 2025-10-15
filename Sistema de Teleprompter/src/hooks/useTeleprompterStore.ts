/**
 * useTeleprompterStore - Hook personalizado para el TeleprompterStore
 * 
 * Conecta componentes React con el TeleprompterStore usando el patrón Observer.
 * Maneja automáticamente suscripción/desuscripción en el ciclo de vida del componente.
 * 
 * @example
 * ```tsx
 * function TransportControls() {
 *   const { isPlaying, speed, play, pause, setSpeed } = useTeleprompterStore();
 *   
 *   return (
 *     <button onClick={isPlaying ? pause : play}>
 *       {isPlaying ? 'Pause' : 'Play'}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { teleprompterStore, type TeleprompterState } from '../stores/TeleprompterStore';

/**
 * Hook que conecta componentes con el TeleprompterStore
 * 
 * @returns Objeto con estado y métodos del store
 */
export function useTeleprompterStore() {
  // Estado local que refleja el estado del store
  const [state, setState] = useState<TeleprompterState>(
    teleprompterStore.getState()
  );
  
  // Suscribirse al store cuando el componente se monta
  useEffect(() => {
    // Listener que actualiza el estado local cuando el store cambia
    const handleStateChange = (newState: TeleprompterState) => {
      setState(newState);
    };
    
    // Suscribir
    const unsubscribe = teleprompterStore.subscribe(handleStateChange);
    
    // Cleanup: desuscribir cuando el componente se desmonta
    return unsubscribe;
  }, []); // [] = solo en mount/unmount
  
  // Retornar estado y métodos
  return {
    // ===== ESTADO =====
    
    /** Texto actual del script */
    text: state.text,
    
    /** Estado de reproducción */
    isPlaying: state.isPlaying,
    
    /** Velocidad de scroll (0.1 - 5.0) */
    speed: state.speed,
    
    /** Tamaño de fuente en píxeles (12 - 500) */
    fontSize: state.fontSize,
    
    /** Posición actual del scroll en píxeles */
    scrollPosition: state.scrollPosition,
    
    /** Nombre del script actual */
    currentScript: state.currentScript,
    
    /** Mapa de marcadores de salto */
    jumpMarkers: state.jumpMarkers,
    
    /** Posición de la línea guía (0-100%) */
    guideLinePosition: state.guideLinePosition,
    
    /** Tema visual */
    theme: state.theme,
    
    /** Timestamp de última actualización */
    timestamp: state.timestamp,
    
    /** Estado de ventana popup */
    popupWindowOpen: state.popupWindowOpen,
    
    /** Estado del modal fullscreen */
    modalOpen: state.modalOpen,
    
    // ===== MÉTODOS DE CONTROL =====
    
    /**
     * Inicia la reproducción
     */
    play: () => teleprompterStore.play(),
    
    /**
     * Pausa la reproducción
     */
    pause: () => teleprompterStore.pause(),
    
    /**
     * Resetea (pausa y vuelve al inicio)
     */
    reset: () => teleprompterStore.reset(),
    
    // ===== MÉTODOS DE CONFIGURACIÓN =====
    
    /**
     * Establece la velocidad de scroll
     * @param speed - Velocidad (0.1 - 5.0)
     */
    setSpeed: (speed: number) => teleprompterStore.setSpeed(speed),
    
    /**
     * Incrementa/decrementa la velocidad
     * @param delta - Incremento (puede ser negativo)
     */
    adjustSpeed: (delta: number) => teleprompterStore.adjustSpeed(delta),
    
    /**
     * Establece el tamaño de fuente
     * @param fontSize - Tamaño en píxeles (12 - 500)
     */
    setFontSize: (fontSize: number) => teleprompterStore.setFontSize(fontSize),
    
    /**
     * Ajusta el tamaño de fuente
     * @param delta - Incremento en píxeles
     */
    adjustFontSize: (delta: number) => teleprompterStore.adjustFontSize(delta),
    
    /**
     * Establece la posición del scroll
     * @param position - Posición en píxeles
     */
    setScrollPosition: (position: number) => teleprompterStore.setScrollPosition(position),
    
    /**
     * Establece la posición de la línea guía
     * @param position - Posición porcentual (0-100)
     */
    setGuideLinePosition: (position: number) => teleprompterStore.setGuideLinePosition(position),
    
    /**
     * Cambia el tema visual
     * @param theme - 'dark' o 'light'
     */
    setTheme: (theme: 'dark' | 'light') => teleprompterStore.setTheme(theme),
    
    // ===== MÉTODOS DE CONTENIDO =====
    
    /**
     * Establece el texto del script
     * @param text - Contenido del script
     */
    setText: (text: string) => teleprompterStore.setText(text),
    
    /**
     * Establece el nombre del script actual
     * @param name - Nombre del script
     */
    setCurrentScript: (name: string) => teleprompterStore.setCurrentScript(name),
    
    /**
     * Salta a un marcador específico
     * @param markerName - Nombre del marcador
     * @returns true si existe el marcador
     */
    jumpToMarker: (markerName: string) => teleprompterStore.jumpToMarker(markerName),
    
    // ===== MÉTODOS DE VENTANAS =====
    
    /**
     * Abre/cierra ventana popup
     * @param open - true para abrir, false para cerrar
     */
    setPopupWindowOpen: (open: boolean) => teleprompterStore.setPopupWindowOpen(open),
    
    /**
     * Abre/cierra modal fullscreen
     * @param open - true para abrir, false para cerrar
     */
    setModalOpen: (open: boolean) => teleprompterStore.setModalOpen(open)
  };
}

/**
 * Hook simplificado que solo retorna el estado (sin métodos)
 * Útil cuando solo necesitas leer el estado sin modificarlo
 * 
 * @example
 * ```tsx
 * function StatusDisplay() {
 *   const state = useTeleprompterState();
 *   return <div>Speed: {state.speed}x</div>;
 * }
 * ```
 */
export function useTeleprompterState(): TeleprompterState {
  const [state, setState] = useState<TeleprompterState>(
    teleprompterStore.getState()
  );
  
  useEffect(() => {
    const unsubscribe = teleprompterStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return state;
}

/**
 * Hook que solo escucha un campo específico del estado
 * Útil para optimizar re-renders cuando solo te interesa un valor
 * 
 * @example
 * ```tsx
 * function SpeedDisplay() {
 *   const speed = useTeleprompterField('speed');
 *   return <div>Speed: {speed}x</div>;
 * }
 * ```
 */
export function useTeleprompterField<K extends keyof TeleprompterState>(
  field: K
): TeleprompterState[K] {
  const [value, setValue] = useState<TeleprompterState[K]>(
    () => teleprompterStore.getState()[field]
  );
  
  useEffect(() => {
    const unsubscribe = teleprompterStore.subscribe((state) => {
      const newValue = state[field];
      setValue(newValue);
    });
    
    return unsubscribe;
  }, [field]);
  
  return value;
}
