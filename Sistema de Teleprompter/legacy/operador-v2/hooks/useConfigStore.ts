/**
 * useConfigStore - Hook personalizado para el ConfigurationStore
 * 
 * Conecta componentes React con el ConfigurationStore para gestionar
 * macros, preferencias y configuración de ventanas.
 * 
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const { macros, preferences, setLanguage } = useConfigStore();
 *   
 *   return (
 *     <select 
 *       value={preferences.language} 
 *       onChange={e => setLanguage(e.target.value as 'es' | 'en')}
 *     >
 *       <option value="es">Español</option>
 *       <option value="en">English</option>
 *     </select>
 *   );
 * }
 * ```
 * 
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import {
  configurationStore,
  type ConfigurationState,
  type MacroSettings,
  type WindowSettings,
  type AppPreferences
} from '../stores/ConfigurationStore';

/**
 * Hook que conecta componentes con el ConfigurationStore
 */
export function useConfigStore() {
  const [state, setState] = useState<ConfigurationState>(
    configurationStore.getState()
  );
  
  useEffect(() => {
    const unsubscribe = configurationStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return {
    // ===== ESTADO =====
    
    /** Configuración de macros */
    macros: state.macros,
    
    /** Configuración de ventanas */
    windows: state.windows,
    
    /** Preferencias de la aplicación */
    preferences: state.preferences,
    
    /** Timestamp de última actualización */
    timestamp: state.timestamp,
    
    // ===== MÉTODOS DE MACROS =====
    
    /**
     * Actualiza una macro específica
     */
    setMacro: (key: keyof MacroSettings, value: string) => 
      configurationStore.setMacro(key, value),
    
    /**
     * Actualiza todas las macros
     */
    setMacros: (macros: MacroSettings) => 
      configurationStore.setMacros(macros),
    
    /**
     * Resetea las macros a valores por defecto
     */
    resetMacros: () => configurationStore.resetMacros(),
    
    // ===== MÉTODOS DE VENTANAS =====
    
    /**
     * Actualiza configuración de ventana principal
     */
    setMainWindowBounds: (bounds: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      maximized?: boolean;
    }) => configurationStore.setMainWindowBounds(bounds),
    
    /**
     * Actualiza configuración de ventana popup
     */
    setPopupWindowBounds: (bounds: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }) => configurationStore.setPopupWindowBounds(bounds),
    
    // ===== MÉTODOS DE PREFERENCIAS =====
    
    /**
     * Actualiza el idioma
     */
    setLanguage: (language: 'es' | 'en') => 
      configurationStore.setLanguage(language),
    
    /**
     * Habilita/deshabilita auto-guardado
     */
    setAutoSaveEnabled: (enabled: boolean) => 
      configurationStore.setAutoSaveEnabled(enabled),
    
    /**
     * Establece intervalo de auto-guardado
     */
    setAutoSaveInterval: (interval: number) => 
      configurationStore.setAutoSaveInterval(interval),
    
    /**
     * Actualiza última carpeta abierta
     */
    setLastOpenedFolder: (folder: string) => 
      configurationStore.setLastOpenedFolder(folder),
    
    /**
     * Agrega un archivo a recientes
     */
    addRecentFile: (filePath: string) => 
      configurationStore.addRecentFile(filePath),
    
    /**
     * Limpia archivos recientes
     */
    clearRecentFiles: () => configurationStore.clearRecentFiles(),
    
    /**
     * Actualiza preferencias completas
     */
    setPreferences: (preferences: Partial<AppPreferences>) => 
      configurationStore.setPreferences(preferences),
    
    // ===== OPERACIONES BULK =====
    
    /**
     * Reemplaza toda la configuración
     */
    setConfig: (config: ConfigurationState) => 
      configurationStore.setConfig(config),
    
    /**
     * Resetea toda la configuración
     */
    resetConfig: () => configurationStore.resetConfig()
  };
}

/**
 * Hook simplificado que solo retorna el estado
 */
export function useConfigState(): ConfigurationState {
  const [state, setState] = useState<ConfigurationState>(
    configurationStore.getState()
  );
  
  useEffect(() => {
    const unsubscribe = configurationStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return state;
}

/**
 * Hook que solo retorna las macros
 */
export function useMacros(): MacroSettings {
  const [macros, setMacros] = useState<MacroSettings>(
    () => configurationStore.getMacros()
  );
  
  useEffect(() => {
    const unsubscribe = configurationStore.subscribe((state) => {
      setMacros(state.macros);
    });
    
    return unsubscribe;
  }, []);
  
  return macros;
}

/**
 * Hook que solo retorna las preferencias
 */
export function usePreferences(): AppPreferences {
  const [preferences, setPreferences] = useState<AppPreferences>(
    () => configurationStore.getPreferences()
  );
  
  useEffect(() => {
    const unsubscribe = configurationStore.subscribe((state) => {
      setPreferences(state.preferences);
    });
    
    return unsubscribe;
  }, []);
  
  return preferences;
}

/**
 * Hook que retorna la configuración de ventanas
 */
export function useWindowSettings(): WindowSettings {
  const [windows, setWindows] = useState<WindowSettings>(
    () => configurationStore.getWindows()
  );
  
  useEffect(() => {
    const unsubscribe = configurationStore.subscribe((state) => {
      setWindows(state.windows);
    });
    
    return unsubscribe;
  }, []);
  
  return windows;
}
