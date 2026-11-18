/**
 * Hooks - Punto de entrada centralizado
 * 
 * Exporta todos los hooks personalizados
 */

// TeleprompterStore hooks
export {
  useTeleprompterStore,
  useTeleprompterState,
  useTeleprompterField
} from './useTeleprompterStore';

// RunOrderStore hooks
export {
  useRunOrderStore,
  useRunOrderState,
  useRunOrderItems,
  useActiveRunOrderItem
} from './useRunOrderStore';

// ConfigurationStore hooks
export {
  useConfigStore,
  useConfigState,
  useMacros,
  usePreferences,
  useWindowSettings
} from './useConfigStore';

// Persistence hook
export { usePersistence } from './usePersistence';
