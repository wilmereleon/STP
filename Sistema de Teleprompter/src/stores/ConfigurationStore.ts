/**
 * ConfigurationStore - Gestión de configuración y macros
 * 
 * Maneja la configuración global de la aplicación incluyendo:
 * - Macros de teclado (controlSettings y jumpMarkerMacros)
 * - Preferencias de usuario
 * - Configuración de ventanas
 * 
 * @version 2.0.0
 * @pattern Observer (Publish-Subscribe)
 */

// Import MacroSettings from useMacros for control keys
import { MacroSettings } from '../components/useMacros';

export interface JumpMarkerMacros {
  /** Macro 1: Saltar al marcador [1] */
  macro1: string;
  
  /** Macro 2: Saltar al marcador [2] */
  macro2: string;
  
  /** Macro 3: Saltar al marcador [3] */
  macro3: string;
  
  /** Macro 4: Saltar al marcador [4] */
  macro4: string;
  
  /** Macro 5: Saltar al marcador [5] */
  macro5: string;
  
  /** Macro 6: Saltar al marcador [6] */
  macro6: string;
  
  /** Macro 7: Saltar al marcador [7] */
  macro7: string;
  
  /** Macro 8: Saltar al marcador [8] */
  macro8: string;
  
  /** Macro 9: Saltar al marcador [9] */
  macro9: string;
  
  /** Macro 10: Saltar al marcador [10] */
  macro10: string;
}

export interface WindowSettings {
  /** Posición X de la ventana principal */
  mainWindowX?: number;
  
  /** Posición Y de la ventana principal */
  mainWindowY?: number;
  
  /** Ancho de la ventana principal */
  mainWindowWidth?: number;
  
  /** Alto de la ventana principal */
  mainWindowHeight?: number;
  
  /** Estado maximizado de la ventana principal */
  mainWindowMaximized?: boolean;
  
  /** Posición X de la ventana popup */
  popupWindowX?: number;
  
  /** Posición Y de la ventana popup */
  popupWindowY?: number;
  
  /** Ancho de la ventana popup */
  popupWindowWidth?: number;
  
  /** Alto de la ventana popup */
  popupWindowHeight?: number;
}

export interface AppPreferences {
  /** Idioma de la interfaz */
  language: 'es' | 'en';
  
  /** Habilitar auto-guardado */
  autoSaveEnabled: boolean;
  
  /** Intervalo de auto-guardado en milisegundos */
  autoSaveInterval: number;
  
  /** Mostrar números de línea en el editor */
  showLineNumbers: boolean;
  
  /** Habilitar resaltado de sintaxis */
  enableSyntaxHighlight: boolean;
  
  /** Última carpeta abierta */
  lastOpenedFolder?: string;
  
  /** Archivos recientes */
  recentFiles: string[];
  
  /** Máximo de archivos recientes */
  maxRecentFiles: number;
  
  /** Mostrar bienvenida al iniciar */
  showWelcomeScreen: boolean;
  
  /** Habilitar telemetría */
  enableTelemetry: boolean;
}

export interface ConfigurationState {
  /** Configuración de macros */
  macros: MacroSettings;
  
  /** Configuración de ventanas */
  windows: WindowSettings;
  
  /** Preferencias de la aplicación */
  preferences: AppPreferences;
  
  /** Timestamp de última actualización */
  timestamp: number;
}

/**
 * Tipo de función listener
 */
type Listener = (state: ConfigurationState) => void;

/**
 * ConfigurationStore - Almacén de configuración
 */
class ConfigurationStore {
  private state: ConfigurationState;
  private listeners = new Set<Listener>();
  
  constructor() {
    this.state = this.getInitialState();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 ConfigurationStore: initialized');
    }
  }
  
  /**
   * Obtiene una copia del estado actual
   */
  getState(): ConfigurationState {
    return {
      ...this.state,
      macros: { ...this.state.macros },
      windows: { ...this.state.windows },
      preferences: {
        ...this.state.preferences,
        recentFiles: [...this.state.preferences.recentFiles]
      }
    };
  }
  
  /**
   * Obtiene solo la configuración de macros
   */
  getMacros(): MacroSettings {
    return { ...this.state.macros };
  }
  
  /**
   * Obtiene solo la configuración de ventanas
   */
  getWindows(): WindowSettings {
    return { ...this.state.windows };
  }
  
  /**
   * Obtiene solo las preferencias
   */
  getPreferences(): AppPreferences {
    return {
      ...this.state.preferences,
      recentFiles: [...this.state.preferences.recentFiles]
    };
  }
  
  /**
   * Suscribe un listener
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📢 ConfigurationStore: listener subscribed (total: ${this.listeners.size})`);
    }
    
    return () => {
      this.listeners.delete(listener);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📢 ConfigurationStore: listener unsubscribed (total: ${this.listeners.size})`);
      }
    };
  }
  
  // ============================================================================
  // MACROS
  // ============================================================================
  
  /**
   * Actualiza una macro específica
   */
  setMacro(key: keyof MacroSettings, value: string): void {
    this.setState({
      macros: {
        ...this.state.macros,
        [key]: value
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⌨️ ConfigurationStore: ${key} = "${value}"`);
    }
  }
  
  /**
   * Actualiza todas las macros
   */
  setMacros(macros: MacroSettings): void {
    this.setState({ macros: { ...macros } });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⌨️ ConfigurationStore: macros updated');
    }
  }
  
  /**
   * Resetea las macros a valores por defecto
   */
  resetMacros(): void {
    this.setState({
      macros: this.getDefaultMacros()
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⌨️ ConfigurationStore: macros reset to defaults');
    }
  }
  
  // ============================================================================
  // VENTANAS
  // ============================================================================
  
  /**
   * Actualiza configuración de ventana principal
   */
  setMainWindowBounds(bounds: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    maximized?: boolean;
  }): void {
    this.setState({
      windows: {
        ...this.state.windows,
        mainWindowX: bounds.x,
        mainWindowY: bounds.y,
        mainWindowWidth: bounds.width,
        mainWindowHeight: bounds.height,
        mainWindowMaximized: bounds.maximized
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🪟 ConfigurationStore: main window bounds updated');
    }
  }
  
  /**
   * Actualiza configuración de ventana popup
   */
  setPopupWindowBounds(bounds: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }): void {
    this.setState({
      windows: {
        ...this.state.windows,
        popupWindowX: bounds.x,
        popupWindowY: bounds.y,
        popupWindowWidth: bounds.width,
        popupWindowHeight: bounds.height
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🪟 ConfigurationStore: popup window bounds updated');
    }
  }
  
  // ============================================================================
  // PREFERENCIAS
  // ============================================================================
  
  /**
   * Actualiza el idioma
   */
  setLanguage(language: 'es' | 'en'): void {
    this.setState({
      preferences: {
        ...this.state.preferences,
        language
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ConfigurationStore: language = ${language}`);
    }
  }
  
  /**
   * Habilita/deshabilita auto-guardado
   */
  setAutoSaveEnabled(enabled: boolean): void {
    this.setState({
      preferences: {
        ...this.state.preferences,
        autoSaveEnabled: enabled
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 ConfigurationStore: autoSave = ${enabled}`);
    }
  }
  
  /**
   * Establece intervalo de auto-guardado
   */
  setAutoSaveInterval(interval: number): void {
    const validated = Math.max(5000, Math.min(300000, interval)); // 5s - 5min
    
    this.setState({
      preferences: {
        ...this.state.preferences,
        autoSaveInterval: validated
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ConfigurationStore: autoSaveInterval = ${validated}ms`);
    }
  }
  
  /**
   * Actualiza última carpeta abierta
   */
  setLastOpenedFolder(folder: string): void {
    this.setState({
      preferences: {
        ...this.state.preferences,
        lastOpenedFolder: folder
      }
    });
  }
  
  /**
   * Agrega un archivo a la lista de recientes
   */
  addRecentFile(filePath: string): void {
    const { recentFiles, maxRecentFiles } = this.state.preferences;
    
    // Eliminar si ya existe
    const filtered = recentFiles.filter(f => f !== filePath);
    
    // Agregar al inicio
    const newRecentFiles = [filePath, ...filtered].slice(0, maxRecentFiles);
    
    this.setState({
      preferences: {
        ...this.state.preferences,
        recentFiles: newRecentFiles
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📂 ConfigurationStore: added recent file "${filePath}"`);
    }
  }
  
  /**
   * Limpia la lista de archivos recientes
   */
  clearRecentFiles(): void {
    this.setState({
      preferences: {
        ...this.state.preferences,
        recentFiles: []
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ ConfigurationStore: cleared recent files');
    }
  }
  
  /**
   * Actualiza preferencias completas
   */
  setPreferences(preferences: Partial<AppPreferences>): void {
    this.setState({
      preferences: {
        ...this.state.preferences,
        ...preferences,
        // Proteger arrays de mutación
        recentFiles: preferences.recentFiles 
          ? [...preferences.recentFiles] 
          : this.state.preferences.recentFiles
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⚙️ ConfigurationStore: preferences updated');
    }
  }
  
  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================
  
  /**
   * Reemplaza toda la configuración (usado al cargar desde disco)
   */
  setConfig(config: ConfigurationState): void {
    this.state = {
      ...config,
      timestamp: Date.now()
    };
    
    this.notify();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 ConfigurationStore: config loaded from disk');
    }
  }
  
  /**
   * Resetea toda la configuración a valores por defecto
   */
  resetConfig(): void {
    this.state = this.getInitialState();
    
    this.notify();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 ConfigurationStore: config reset to defaults');
    }
  }
  
  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================
  
  private setState(partial: Partial<ConfigurationState>): void {
    this.state = {
      ...this.state,
      ...partial,
      timestamp: Date.now()
    };
    
    this.notify();
  }
  
  private notify(): void {
    const state = this.getState();
    
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('❌ ConfigurationStore: error in listener', error);
      }
    });
  }
  
  private getDefaultMacros(): MacroSettings {
    return {
      playStop: 'F10',
      pause: 'F9',
      previousScript: 'F11',
      nextScript: 'F12',
      increaseSpeed: 'F1',
      decreaseSpeed: 'F2',
      increaseFontSize: 'F3',
      decreaseFontSize: 'F4',
      nextCue: 'PageDown',
      previousCue: 'PageUp'
    };
  }
  
  private getInitialState(): ConfigurationState {
    return {
      macros: this.getDefaultMacros(),
      windows: {},
      preferences: {
        language: 'es',
        autoSaveEnabled: true,
        autoSaveInterval: 30000, // 30 segundos
        showLineNumbers: false,
        enableSyntaxHighlight: true,
        recentFiles: [],
        maxRecentFiles: 10,
        showWelcomeScreen: true,
        enableTelemetry: false
      },
      timestamp: Date.now()
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const configurationStore = new ConfigurationStore();

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__CONFIGURATION_STORE__ = configurationStore;
  console.log('🔧 ConfigurationStore expuesto en window.__CONFIGURATION_STORE__ para debugging');
}
