/**
 * PersistenceService - Servicio de persistencia con localStorage
 * 
 * Maneja el almacenamiento local de datos usando localStorage.
 * Compatible con navegador y Electron.
 * 
 * Estructura de datos:
 * - localStorage.getItem('teleprompter-config') (configuración)
 * - localStorage.getItem('teleprompter-scripts') (run order)
 * 
 * @version 2.0.0
 * @pattern Service Layer
 */

import type { RunOrderItem } from '../stores/RunOrderStore';
import type { ConfigurationState } from '../stores/ConfigurationStore';

/**
 * Interfaz para datos de sesión completa
 */
export interface SessionData {
  version: string;
  timestamp: number;
  scripts: RunOrderItem[];
  config: ConfigurationState;
}

export class PersistenceService {
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly autoSavePeriod = 30000; // 30 segundos
  private isInitialized = false;
  private readonly storagePrefix = 'teleprompter-';
  
  /**
   * Inicializa el servicio
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('💾 PersistenceService: already initialized');
      return;
    }

    try {
      // Verificar disponibilidad de localStorage
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage not available');
      }

      this.isInitialized = true;
      console.log('💾 PersistenceService: initialized with localStorage');
    } catch (error) {
      console.error('❌ PersistenceService: initialization failed:', error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está listo
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Guarda configuración
   */
  async saveConfig(config: ConfigurationState): Promise<void> {
    try {
      const key = `${this.storagePrefix}config`;
      const data = JSON.stringify(config, null, 2);
      localStorage.setItem(key, data);
      console.log('💾 PersistenceService: config saved');
    } catch (error) {
      console.error('❌ PersistenceService: error saving config:', error);
      throw error;
    }
  }

  /**
   * Carga configuración
   */
  async loadConfig(): Promise<ConfigurationState | null> {
    try {
      const key = `${this.storagePrefix}config`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log('💾 PersistenceService: no config found');
        return null;
      }

      const config = JSON.parse(data) as ConfigurationState;
      console.log('💾 PersistenceService: config loaded');
      return config;
    } catch (error) {
      console.error('❌ PersistenceService: error loading config:', error);
      return null;
    }
  }

  /**
   * Guarda run order
   */
  async saveScripts(scripts: RunOrderItem[]): Promise<void> {
    try {
      const key = `${this.storagePrefix}scripts`;
      const data = JSON.stringify(scripts, null, 2);
      localStorage.setItem(key, data);
      console.log(`💾 PersistenceService: ${scripts.length} scripts saved`);
    } catch (error) {
      console.error('❌ PersistenceService: error saving scripts:', error);
      throw error;
    }
  }

  /**
   * Carga run order
   */
  async loadScripts(): Promise<RunOrderItem[]> {
    try {
      const key = `${this.storagePrefix}scripts`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log('💾 PersistenceService: no scripts found');
        return [];
      }

      const scripts = JSON.parse(data) as RunOrderItem[];
      console.log(`💾 PersistenceService: ${scripts.length} scripts loaded`);
      return scripts;
    } catch (error) {
      console.error('❌ PersistenceService: error loading scripts:', error);
      return [];
    }
  }

  /**
   * Lee contenido de un script
   */
  async readScriptContent(scriptId: string): Promise<string> {
    try {
      const key = `${this.storagePrefix}script-${scriptId}`;
      const content = localStorage.getItem(key);
      
      if (!content) {
        console.log(`💾 PersistenceService: script ${scriptId} not found`);
        return '';
      }

      console.log(`💾 PersistenceService: script ${scriptId} loaded (${content.length} chars)`);
      return content;
    } catch (error) {
      console.error(`❌ PersistenceService: error reading script ${scriptId}:`, error);
      return '';
    }
  }

  /**
   * Guarda contenido de un script
   */
  async saveScriptContent(scriptId: string, content: string): Promise<void> {
    try {
      const key = `${this.storagePrefix}script-${scriptId}`;
      localStorage.setItem(key, content);
      console.log(`💾 PersistenceService: script ${scriptId} saved (${content.length} chars)`);
    } catch (error) {
      console.error(`❌ PersistenceService: error saving script ${scriptId}:`, error);
      throw error;
    }
  }

  /**
   * Exporta todo como JSON
   */
  async exportSession(): Promise<SessionData> {
    const config = await this.loadConfig();
    const scripts = await this.loadScripts();

    const sessionData: SessionData = {
      version: '2.0.0',
      timestamp: Date.now(),
      scripts,
      config: config || {} as ConfigurationState
    };

    console.log('💾 PersistenceService: session exported');
    return sessionData;
  }

  /**
   * Importa desde JSON
   */
  async importSession(sessionData: SessionData): Promise<void> {
    try {
      if (sessionData.config) {
        await this.saveConfig(sessionData.config);
      }

      if (sessionData.scripts && Array.isArray(sessionData.scripts)) {
        await this.saveScripts(sessionData.scripts);
      }

      console.log('💾 PersistenceService: session imported');
    } catch (error) {
      console.error('❌ PersistenceService: error importing session:', error);
      throw error;
    }
  }

  /**
   * Inicia auto-guardado
   */
  startAutoSave(callback: () => Promise<void>): void {
    if (this.autoSaveInterval) {
      console.log('💾 PersistenceService: auto-save already running');
      return;
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        console.log('💾 PersistenceService: auto-save triggered');
        await callback();
      } catch (error) {
        console.error('❌ PersistenceService: auto-save error:', error);
      }
    }, this.autoSavePeriod);

    console.log(`💾 PersistenceService: auto-save started (every ${this.autoSavePeriod / 1000}s)`);
  }

  /**
   * Detiene auto-guardado
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('💾 PersistenceService: auto-save stopped');
    }
  }

  /**
   * Verifica si existe un archivo
   */
  async fileExists(key: string): Promise<boolean> {
    const fullKey = `${this.storagePrefix}${key}`;
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const fullKey = `${this.storagePrefix}${key}`;
      localStorage.removeItem(fullKey);
      console.log(`💾 PersistenceService: ${key} deleted`);
    } catch (error) {
      console.error(`❌ PersistenceService: error deleting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Limpia todos los datos
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storagePrefix));
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`💾 PersistenceService: cleared ${keys.length} items`);
    } catch (error) {
      console.error('❌ PersistenceService: error clearing data:', error);
      throw error;
    }
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.stopAutoSave();
    this.isInitialized = false;
    console.log('💾 PersistenceService: disposed');
  }
}

// Singleton
let persistenceServiceInstance: PersistenceService | null = null;

export function getPersistenceService(): PersistenceService {
  if (!persistenceServiceInstance) {
    persistenceServiceInstance = new PersistenceService();
  }
  return persistenceServiceInstance;
}
