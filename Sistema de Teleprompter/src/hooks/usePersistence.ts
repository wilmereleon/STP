/**
 * usePersistence - Hook para integración de PersistenceService
 * 
 * Hook personalizado que maneja la inicialización, carga y guardado
 * de datos usando PersistenceService con Electron.
 * 
 * @version 2.0.0
 * @pattern Custom Hook
 */

import { useEffect, useState } from 'react';
import { getPersistenceService } from '../services';
import { runOrderStore } from '../stores/RunOrderStore';
import { configurationStore } from '../stores/ConfigurationStore';

// Get singleton instance
const persistenceService = getPersistenceService();

interface UsePersistenceReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  saveNow: () => Promise<void>;
}

/**
 * Hook para manejar persistencia con PersistenceService
 * 
 * - Inicializa PersistenceService en mount
 * - Carga datos guardados (scripts + config)
 * - Habilita auto-save cada 30 segundos
 * - Cleanup en unmount
 * 
 * @returns {UsePersistenceReturn} Estado e métodos de persistencia
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { isInitialized, isLoading, error } = usePersistence();
 *   
 *   if (isLoading) return <div>Cargando...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return <MainApp />;
 * }
 * ```
 */
export function usePersistence(): UsePersistenceReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inicialización y carga de datos
  useEffect(() => {
    async function initPersistence() {
      try {
        console.log('📦 Inicializando persistencia...');
        
        // 1. Inicializar PersistenceService
        await persistenceService.initialize();
        console.log('✅ PersistenceService inicializado');
        
        // 2. Cargar scripts guardados
        const scripts = await persistenceService.loadScripts();
        if (scripts.length > 0) {
          runOrderStore.setItems(scripts);
          console.log(`📜 Cargados ${scripts.length} scripts`);
        } else {
          console.log('📜 No hay scripts guardados (primera ejecución)');
        }
        
        // 3. Cargar configuración guardada
        const config = await persistenceService.loadConfig();
        if (config) {
          configurationStore.setConfig(config);
          console.log('⚙️ Configuración cargada');
        } else {
          console.log('⚙️ No hay configuración guardada (usando defaults)');
        }
        
        // 4. Habilitar auto-save
        persistenceService.startAutoSave(async () => {
          const scripts = runOrderStore.getState().items;
          const config = configurationStore.getState();
          await persistenceService.saveScripts(scripts);
          await persistenceService.saveConfig(config);
        });
        console.log('💾 Auto-save habilitado (cada 30s)');
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('❌ Error inicializando persistencia:', err);
        setError(err.message || 'Error desconocido');
        setIsLoading(false);
      }
    }
    
    initPersistence();
    
    // Cleanup: deshabilitar auto-save
    return () => {
      persistenceService.stopAutoSave();
      console.log('🛑 Persistencia deshabilitada');
    };
  }, []);
  
  /**
   * Guarda manualmente los datos ahora (sin esperar al auto-save)
   */
  const saveNow = async (): Promise<void> => {
    try {
      const scripts = runOrderStore.getState().items;
      const config = configurationStore.getState();
      
      await persistenceService.saveScripts(scripts);
      await persistenceService.saveConfig(config);
      
      console.log('💾 Guardado manual completado');
    } catch (err: any) {
      console.error('❌ Error en guardado manual:', err);
      throw err;
    }
  };
  
  return {
    isInitialized,
    isLoading,
    error,
    saveNow
  };
}
