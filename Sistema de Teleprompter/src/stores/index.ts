/**
 * Stores - Punto de entrada centralizado
 * 
 * Exporta todos los stores y tipos relacionados
 */

// TeleprompterStore
export {
  teleprompterStore,
  type TeleprompterState
} from './TeleprompterStore';

// RunOrderStore
export {
  runOrderStore,
  type RunOrderItem,
  type RunOrderState,
  type ItemStatus
} from './RunOrderStore';

// ConfigurationStore
export {
  configurationStore,
  type ConfigurationState,
  type MacroSettings,
  type WindowSettings,
  type AppPreferences
} from './ConfigurationStore';
