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
   * @param speed - Velocidad (0.1 - 5.0)
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
    this.setSpeed(newSpeed);
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
    
    // Evitar notificaciones excesivas si la diferencia es < 1px
    if (Math.abs(validated - this.state.scrollPosition) < 1) return;
    
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
   * Valida y ajusta la velocidad al rango permitido
   */
  private validateSpeed(speed: number): number {
    return Math.max(0.1, Math.min(5.0, speed));
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
      modalOpen: false
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
