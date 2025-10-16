/**
 * Services - Capa de servicios (lógica de negocio)
 * 
 * Exporta todos los servicios de la aplicación.
 * 
 * @pattern Service Layer
 * @version 2.0.0
 */

export { autoScrollService, AutoScrollService } from './AutoScrollService';
export { syncService, SyncService, SyncMessageType } from './SyncService';
export { getPersistenceService, PersistenceService } from './PersistenceService';
export { excelImportService, ExcelImportService } from './ExcelImportService';

export type { SyncMessage } from './SyncService';
export type { SessionData } from './PersistenceService';
export type { ImportPreview, ImportResult } from './ExcelImportService';
