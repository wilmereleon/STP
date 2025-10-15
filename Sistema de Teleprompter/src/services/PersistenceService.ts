/**
 * PersistenceService - Servicio de persistencia con fs (Electron)
 * 
 * Maneja el almacenamiento local de datos usando el sistema de archivos.
 * Compatible con Electron usando app.getPath('userData').
 * 
 * NO usa IndexedDB (eso es para navegadores web).
 * USA fs.promises para operaciones asíncronas de archivos.
 * 
 * Estructura de archivos:
 * - userData/config.json (configuración)
 * - userData/scripts.json (run order)
 * - userData/scripts/ (scripts individuales .txt)
 * 
 * @version 2.0.0
 * @pattern Service Layer
 */

import { promises as fs } from 'fs';
import * as path from 'path';
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
  private userDataPath: string = '';
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly autoSavePeriod = 30000; // 30 segundos
  private isInitialized = false;
  
  /**
   * Inicializa el servicio obteniendo el userDataPath de Electron
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // En Electron, obtener userDataPath desde main process
      if (typeof window !== 'undefined' && (window as any).electron) {
        this.userDataPath = await (window as any).electron.getUserDataPath();
      } else {
        // Fallback para desarrollo (sin Electron)
        this.userDataPath = path.join(process.cwd(), 'user-data');
      }
      
      // Crear directorios necesarios
      await this.ensureDirectories();
      
      this.isInitialized = true;
      
      console.log(`💾 PersistenceService: initialized @ ${this.userDataPath}`);
    } catch (error) {
      console.error('❌ PersistenceService: error en initialize', error);
      throw error;
    }
  }
  
  /**
   * Asegura que existan los directorios necesarios
   */
  private async ensureDirectories(): Promise<void> {
    const scriptsDir = path.join(this.userDataPath, 'scripts');
    
    await fs.mkdir(this.userDataPath, { recursive: true });
    await fs.mkdir(scriptsDir, { recursive: true });
  }
  
  // ============================================================================
  // SCRIPTS (RUN ORDER)
  // ============================================================================
  
  /**
   * Guarda la lista de scripts del Run Order
   */
  async saveScripts(items: RunOrderItem[]): Promise<void> {
    this.ensureInitialized();
    
    const filePath = this.getScriptsPath();
    
    try {
      const data = JSON.stringify(items, null, 2);
      await fs.writeFile(filePath, data, 'utf-8');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 PersistenceService: saved ${items.length} scripts`);
      }
    } catch (error) {
      console.error('❌ PersistenceService: error saving scripts', error);
      throw error;
    }
  }
  
  /**
   * Carga la lista de scripts del Run Order
   */
  async loadScripts(): Promise<RunOrderItem[]> {
    this.ensureInitialized();
    
    const filePath = this.getScriptsPath();
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const items: RunOrderItem[] = JSON.parse(data);
      
      // Convertir strings de fecha a Date objects
      items.forEach(item => {
        item.createdAt = new Date(item.createdAt);
        item.updatedAt = new Date(item.updatedAt);
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 PersistenceService: loaded ${items.length} scripts`);
      }
      
      return items;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Archivo no existe, retornar array vacío
        return [];
      }
      
      console.error('❌ PersistenceService: error loading scripts', error);
      throw error;
    }
  }
  
  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================
  
  /**
   * Guarda la configuración completa
   */
  async saveConfig(config: ConfigurationState): Promise<void> {
    this.ensureInitialized();
    
    const filePath = this.getConfigPath();
    
    try {
      const data = JSON.stringify(config, null, 2);
      await fs.writeFile(filePath, data, 'utf-8');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 PersistenceService: saved config');
      }
    } catch (error) {
      console.error('❌ PersistenceService: error saving config', error);
      throw error;
    }
  }
  
  /**
   * Carga la configuración completa
   */
  async loadConfig(): Promise<ConfigurationState | null> {
    this.ensureInitialized();
    
    const filePath = this.getConfigPath();
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const config: ConfigurationState = JSON.parse(data);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 PersistenceService: loaded config');
      }
      
      return config;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Archivo no existe
        return null;
      }
      
      console.error('❌ PersistenceService: error loading config', error);
      throw error;
    }
  }
  
  // ============================================================================
  // ARCHIVOS DE TEXTO (.txt)
  // ============================================================================
  
  /**
   * Lee un archivo de texto desde el sistema de archivos
   * @param filePath - Ruta absoluta o relativa al userDataPath
   */
  async loadTextFile(filePath: string): Promise<string> {
    this.ensureInitialized();
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📄 PersistenceService: loaded text file (${content.length} chars)`);
      }
      
      return content;
    } catch (error) {
      console.error(`❌ PersistenceService: error loading ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * Guarda un archivo de texto en el sistema de archivos
   * @param filePath - Ruta absoluta o relativa al userDataPath
   * @param content - Contenido a guardar
   */
  async saveTextFile(filePath: string, content: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📄 PersistenceService: saved text file (${content.length} chars)`);
      }
    } catch (error) {
      console.error(`❌ PersistenceService: error saving ${filePath}`, error);
      throw error;
    }
  }
  
  // ============================================================================
  // SESIÓN COMPLETA
  // ============================================================================
  
  /**
   * Exporta sesión completa (scripts + config) a un archivo
   * @param outputPath - Ruta donde guardar el archivo de sesión
   */
  async exportSession(
    scripts: RunOrderItem[],
    config: ConfigurationState,
    outputPath: string
  ): Promise<void> {
    this.ensureInitialized();
    
    const sessionData: SessionData = {
      version: '2.0.0',
      timestamp: Date.now(),
      scripts,
      config
    };
    
    try {
      const data = JSON.stringify(sessionData, null, 2);
      await fs.writeFile(outputPath, data, 'utf-8');
      
      console.log(`💾 PersistenceService: exported session to ${outputPath}`);
    } catch (error) {
      console.error('❌ PersistenceService: error exporting session', error);
      throw error;
    }
  }
  
  /**
   * Importa sesión completa desde un archivo
   * @param filePath - Ruta del archivo de sesión
   */
  async importSession(filePath: string): Promise<SessionData> {
    this.ensureInitialized();
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const sessionData: SessionData = JSON.parse(data);
      
      // Validar versión
      if (!sessionData.version) {
        throw new Error('Archivo de sesión inválido: falta versión');
      }
      
      // Convertir fechas
      sessionData.scripts.forEach(item => {
        item.createdAt = new Date(item.createdAt);
        item.updatedAt = new Date(item.updatedAt);
      });
      
      console.log(`💾 PersistenceService: imported session from ${filePath}`);
      
      return sessionData;
    } catch (error) {
      console.error('❌ PersistenceService: error importing session', error);
      throw error;
    }
  }
  
  // ============================================================================
  // AUTO-SAVE
  // ============================================================================
  
  /**
   * Habilita el auto-guardado periódico
   * @param callback - Función que retorna los datos a guardar
   */
  enableAutoSave(callback: () => { scripts: RunOrderItem[], config: ConfigurationState }): void {
    if (this.autoSaveInterval !== null) {
      console.warn('⚠️ PersistenceService: auto-save ya está habilitado');
      return;
    }
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        const { scripts, config } = callback();
        
        await this.saveScripts(scripts);
        await this.saveConfig(config);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('💾 PersistenceService: auto-save completed');
        }
      } catch (error) {
        console.error('❌ PersistenceService: error en auto-save', error);
      }
    }, this.autoSavePeriod);
    
    console.log(`💾 PersistenceService: auto-save enabled (every ${this.autoSavePeriod/1000}s)`);
  }
  
  /**
   * Deshabilita el auto-guardado
   */
  disableAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      
      console.log('💾 PersistenceService: auto-save disabled');
    }
  }
  
  // ============================================================================
  // UTILIDADES
  // ============================================================================
  
  /**
   * Verifica si existe un archivo
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Lista archivos en un directorio
   */
  async listFiles(dirPath: string): Promise<string[]> {
    this.ensureInitialized();
    
    try {
      const files = await fs.readdir(dirPath);
      return files;
    } catch (error) {
      console.error(`❌ PersistenceService: error listing ${dirPath}`, error);
      return [];
    }
  }
  
  /**
   * Elimina un archivo
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ PersistenceService: deleted ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ PersistenceService: error deleting ${filePath}`, error);
      throw error;
    }
  }
  
  // ============================================================================
  // PATHS
  // ============================================================================
  
  private getConfigPath(): string {
    return path.join(this.userDataPath, 'config.json');
  }
  
  private getScriptsPath(): string {
    return path.join(this.userDataPath, 'scripts.json');
  }
  
  /**
   * Obtiene la carpeta de scripts individuales
   */
  getScriptsDirectory(): string {
    return path.join(this.userDataPath, 'scripts');
  }
  
  /**
   * Obtiene el userDataPath actual
   */
  getUserDataPath(): string {
    return this.userDataPath;
  }
  
  // ============================================================================
  // VALIDACIONES
  // ============================================================================
  
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('PersistenceService no inicializado. Llamar initialize() primero.');
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const persistenceService = new PersistenceService();

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__PERSISTENCE_SERVICE__ = persistenceService;
  console.log('🔧 PersistenceService expuesto en window.__PERSISTENCE_SERVICE__');
}
