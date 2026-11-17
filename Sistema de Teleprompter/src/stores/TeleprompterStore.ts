/**
 * TeleprompterStore - Gestión centralizada del estado del teleprompter
 * 
 * Implementa el patrón Observer para notificar cambios a todos los suscriptores.
 * Es la única fuente de verdad para el estado del teleprompter.
 * 
 * @version 2.0.0
 * @pattern Observer (Publish-Subscribe)
 */

export interface TeleprompterState {
  /** Texto actual del script */
  text: string;
  
  /** Estado de reproducción */
  isPlaying: boolean;
  
  /** Velocidad de scroll (0.1 - 5.0) */
  speed: number;
  
  /** Tamaño de fuente en píxeles (12 - 500) */
  fontSize: number;
  
  /** Posición actual del scroll en píxeles */
  scrollPosition: number;
  
  /** Nombre del script actual */
  currentScript: string;
  
  /** Mapa de marcadores de salto [nombre -> posición] */
  jumpMarkers: Map<string, number>;
  
  /** Posición de la línea guía (0-100%) */
  guideLinePosition: number;
  
  /** Tema visual */
  theme: 'dark' | 'light';
  
  /** Timestamp de última actualización (para sincronización) */
  timestamp: number;
  
  /** Estado de la ventana popup */
  popupWindowOpen: boolean;
  
  /** Estado del modal fullscreen */
  modalOpen: boolean;
  
  /** Modo espejo horizontal (para reflejar en vidrio) */
  mirrorX: boolean;
  
  /** Modo espejo vertical */
  mirrorY: boolean;
}

/**
 * Tipo de función listener para suscriptores
 */
type Listener = (state: TeleprompterState) => void;

/**
 * TeleprompterStore - Almacén centralizado de estado
 */
class TeleprompterStore {
  private state: TeleprompterState;
  private listeners = new Set<Listener>();
  
  constructor() {
    this.state = this.getInitialState();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 TeleprompterStore: initialized');
    }
  }
  
  /**
   * Obtiene una copia inmutable del estado actual
   */
  getState(): TeleprompterState {
    return {
      ...this.state,
      jumpMarkers: new Map(this.state.jumpMarkers)
    };
  }
  
  /**
   * Suscribe un listener para recibir actualizaciones del estado
   * @returns Función para desuscribirse
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📢 TeleprompterStore: listener subscribed (total: ${this.listeners.size})`);
    }
    
    // Retornar función de cleanup
    return () => {
      this.listeners.delete(listener);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📢 TeleprompterStore: listener unsubscribed (total: ${this.listeners.size})`);
      }
    };
  }
  
  // ============================================================================
  // ACCIONES PÚBLICAS - Control de Reproducción
  // ============================================================================
  
  /**
   * Inicia la reproducción del teleprompter
   */
  play(): void {
    if (this.state.isPlaying) return; // Ya está reproduciendo
    
    this.setState({ isPlaying: true });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('▶️ TeleprompterStore: PLAY');
    }
  }
  
  /**
   * Pausa la reproducción del teleprompter
   */
  pause(): void {
    if (!this.state.isPlaying) return; // Ya está pausado
    
    this.setState({ isPlaying: false });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⏸️ TeleprompterStore: PAUSE');
    }
  }
  
  /**
   * Resetea el teleprompter (pausa y vuelve al inicio)
   */
  reset(): void {
    this.setState({
      isPlaying: false,
      scrollPosition: 0
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⏹️ TeleprompterStore: RESET');
    }
  }
  
  // ============================================================================
  // ACCIONES PÚBLICAS - Configuración
  // ============================================================================
  
  /**
   * Establece la velocidad de scroll
   * @param speed - Velocidad (0.1 - 100.0) - RANGO ULTRA EXPANDIDO
   */
  setSpeed(speed: number): void {
    const validated = this.validateSpeed(speed);
    
    if (validated === this.state.speed) return; // Sin cambios
    
    this.setState({ speed: validated });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ TeleprompterStore: speed = ${validated.toFixed(1)}x`);
    }
  }
  
  /**
   * Incrementa la velocidad en delta
   * @param delta - Incremento (puede ser negativo)
   */
  adjustSpeed(delta: number): void {
    const newSpeed = this.state.speed + delta;
    const validated = this.validateSpeed(newSpeed);
    
    // Permitir cambios siempre para que las flechas funcionen
    this.setState({ speed: validated });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ TeleprompterStore: speed adjusted ${delta > 0 ? '+' : ''}${delta.toFixed(1)} → ${validated.toFixed(1)}x`);
    }
  }
  
  /**
   * Establece el tamaño de fuente
   * @param fontSize - Tamaño en píxeles (12 - 500)
   */
  setFontSize(fontSize: number): void {
    const validated = this.validateFontSize(fontSize);
    
    if (validated === this.state.fontSize) return; // Sin cambios
    
    this.setState({ fontSize: validated });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔤 TeleprompterStore: fontSize = ${validated}px`);
    }
  }
  
  /**
   * Ajusta el tamaño de fuente en delta píxeles
   * @param delta - Incremento en píxeles (puede ser negativo)
   */
  adjustFontSize(delta: number): void {
    const newFontSize = this.state.fontSize + delta;
    this.setFontSize(newFontSize);
  }
  
  /**
   * Establece la posición del scroll
   * @param scrollPosition - Posición en píxeles
   */
  setScrollPosition(scrollPosition: number): void {
    const validated = Math.max(0, scrollPosition);
    
    // ZONA MUERTA ELIMINADA: ahora acepta cambios sub-píxel para scroll fluido
    // Esta era la causa principal del scroll a tirones a baja velocidad
    this.setState({ scrollPosition: validated });
  }
  
  /**
   * Establece la posición de la línea guía
   * @param position - Posición porcentual (0-100)
   */
  setGuideLinePosition(position: number): void {
    const validated = Math.max(0, Math.min(100, position));
    
    if (validated === this.state.guideLinePosition) return;
    
    this.setState({ guideLinePosition: validated });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📏 TeleprompterStore: guideLinePosition = ${validated}%`);
    }
  }
  
  /**
   * Cambia el tema visual
   * @param theme - 'dark' o 'light'
   */
  setTheme(theme: 'dark' | 'light'): void {
    if (theme === this.state.theme) return;
    
    this.setState({ theme });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 TeleprompterStore: theme = ${theme}`);
    }
  }
  
  // ============================================================================
  // ACCIONES PÚBLICAS - Contenido
  // ============================================================================
  
  /**
   * Establece el texto del script actual
   * @param text - Contenido del script
   */
  setText(text: string): void {
    this.setState({ text });
    
    // Analizar marcadores [1], [2], etc.
    this.parseJumpMarkers(text);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 TeleprompterStore: text updated (${text.length} chars)`);
    }
  }
  
  /**
   * Establece el nombre del script actual
   * @param name - Nombre del script
   */
  setCurrentScript(name: string): void {
    if (name === this.state.currentScript) return;
    
    this.setState({ currentScript: name });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📄 TeleprompterStore: currentScript = ${name}`);
    }
  }
  
  /**
   * Salta a un marcador específico
   * @param markerName - Nombre del marcador (ej: '1', '2')
   * @returns true si el marcador existe, false si no
   */
  jumpToMarker(markerName: string): boolean {
    const position = this.state.jumpMarkers.get(markerName);
    
    if (position === undefined) {
      console.warn(`⚠️ TeleprompterStore: marker [${markerName}] not found`);
      return false;
    }
    
    this.setScrollPosition(position);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 TeleprompterStore: jumped to marker [${markerName}] @ ${position}px`);
    }
    
    return true;
  }
  
  // ============================================================================
  // ACCIONES PÚBLICAS - Ventanas
  // ============================================================================
  
  /**
   * Abre/cierra la ventana popup
   */
  setPopupWindowOpen(open: boolean): void {
    if (open === this.state.popupWindowOpen) return;
    
    this.setState({ popupWindowOpen: open });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🪟 TeleprompterStore: popupWindow = ${open ? 'OPEN' : 'CLOSED'}`);
    }
  }
  
  /**
   * Abre/cierra el modal fullscreen
   */
  setModalOpen(open: boolean): void {
    if (open === this.state.modalOpen) return;
    
    this.setState({ modalOpen: open });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🖥️ TeleprompterStore: modal = ${open ? 'OPEN' : 'CLOSED'}`);
    }
  }
  
  // ============================================================================
  // ACCIONES PÚBLICAS - Modo Espejo
  // ============================================================================
  
  /**
   * Activa/desactiva espejo horizontal (para vidrio reflectante)
   * @param enabled - true para activar espejo horizontal
   */
  setMirrorX(enabled: boolean): void {
    if (enabled === this.state.mirrorX) return;
    
    this.setState({ mirrorX: enabled });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🪞 TeleprompterStore: mirrorX = ${enabled ? 'ON' : 'OFF'}`);
    }
  }
  
  /**
   * Activa/desactiva espejo vertical
   * @param enabled - true para activar espejo vertical
   */
  setMirrorY(enabled: boolean): void {
    if (enabled === this.state.mirrorY) return;
    
    this.setState({ mirrorY: enabled });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🪞 TeleprompterStore: mirrorY = ${enabled ? 'ON' : 'OFF'}`);
    }
  }
  
  /**
   * Toggle del espejo horizontal
   */
  toggleMirrorX(): void {
    this.setMirrorX(!this.state.mirrorX);
  }
  
  /**
   * Toggle del espejo vertical
   */
  toggleMirrorY(): void {
    this.setMirrorY(!this.state.mirrorY);
  }
  
  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================
  
  /**
   * Actualiza el estado y notifica a los suscriptores
   */
  private setState(partial: Partial<TeleprompterState>): void {
    this.state = {
      ...this.state,
      ...partial,
      timestamp: Date.now()
    };
    
    this.notify();
  }
  
  /**
   * Notifica a todos los suscriptores del cambio de estado
   */
  private notify(): void {
    const state = this.getState();
    
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('❌ TeleprompterStore: error in listener', error);
      }
    });
  }
  
  /**
   * Sincroniza el estado completo desde un master (usado por SyncService en modo slave)
   * Este método NO notifica a los listeners para evitar loops de sincronización
   */
  syncFromMaster(newState: Partial<TeleprompterState>): void {
    // Reemplazar estado completo sin notificar (para evitar loops)
    this.state = {
      ...this.state,
      ...newState,
      timestamp: Date.now()
    };
    
    // Solo notificar a React para re-renderizar, pero no propagar a SyncService
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('❌ TeleprompterStore: error in listener', error);
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 TeleprompterStore: synced from master', { 
        text: newState.text?.substring(0, 50),
        isPlaying: newState.isPlaying 
      });
    }
  }
  
  /**
   * Valida y ajusta la velocidad al rango permitido
   * Rango ultra expandido: 0.1x - 100.0x para lecturas ultra rápidas
   */
  private validateSpeed(speed: number): number {
    return Math.max(0.1, Math.min(100.0, speed));
  }
  
  /**
   * Valida y ajusta el tamaño de fuente al rango permitido
   */
  private validateFontSize(fontSize: number): number {
    return Math.max(12, Math.min(500, Math.round(fontSize)));
  }
  
  /**
   * Analiza el texto para encontrar marcadores de salto [1], [2], etc.
   */
  private parseJumpMarkers(text: string): void {
    const markers = new Map<string, number>();
    const lines = text.split('\n');
    let currentPosition = 0;
    const lineHeight = 40; // Altura aproximada por línea
    
    lines.forEach((line, index) => {
      // Buscar marcadores [1], [2], [INTRO], etc.
      const markerRegex = /\[([^\]]+)\]/g;
      let match;
      
      while ((match = markerRegex.exec(line)) !== null) {
        const markerName = match[1];
        markers.set(markerName, currentPosition);
      }
      
      currentPosition += lineHeight;
    });
    
    this.state.jumpMarkers = markers;
    
    if (process.env.NODE_ENV === 'development' && markers.size > 0) {
      console.log(`🎯 TeleprompterStore: found ${markers.size} markers:`, Array.from(markers.keys()));
    }
  }
  
  /**
   * Obtiene el estado inicial por defecto
   */
  private getInitialState(): TeleprompterState {
    return {
      text: '',
      isPlaying: false,
      speed: 1.0,
      fontSize: 200,
      scrollPosition: 0,
      currentScript: 'Untitled.awn',
      jumpMarkers: new Map(),
      guideLinePosition: 50,
      theme: 'dark',
      timestamp: Date.now(),
      popupWindowOpen: false,
      modalOpen: false,
      mirrorX: false,
      mirrorY: false
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Instancia única del TeleprompterStore
 * Exportada como singleton para uso global en la aplicación
 */
export const teleprompterStore = new TeleprompterStore();

// Exponer en desarrollo para debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__TELEPROMPTER_STORE__ = teleprompterStore;
  console.log('🔧 TeleprompterStore expuesto en window.__TELEPROMPTER_STORE__ para debugging');
}
