/**
 * ExcelImportService - Servicio de importación desde Excel
 * 
 * Permite importar scripts desde archivos Excel (.xlsx) usando SheetJS (xlsx).
 * Compatible con navegador: usa FileReader API para leer archivos.
 * 
 * Formato esperado del Excel:
 * - Columna "Número de Guion" / "Numero" / "ID" → id
 * - Columna "Título" / "Titulo" / "Title" → title
 * - Columna "Texto/Contenido" / "Text" / "Script" → text
 * - Columna "Duración" / "Duracion" / "Duration" → duration
 * - Columna "Notas" / "Notes" → notes (opcional)
 * 
 * @version 2.0.0
 * @pattern Service Layer
 */

import * as XLSX from 'xlsx';
import type { RunOrderItem, ItemStatus } from '../stores/RunOrderStore';

/**
 * Mapeo de columnas detectadas
 */
interface ColumnMapping {
  id?: number;
  title?: number;
  text?: number;
  duration?: number;
  notes?: number;
}

/**
 * Resultado de preview de importación
 */
export interface ImportPreview {
  totalRows: number;
  previewRows: any[][];
  columnMapping: ColumnMapping;
  estimatedItems: number;
}

/**
 * Resultado de importación
 */
export interface ImportResult {
  success: boolean;
  items: RunOrderItem[];
  errors: string[];
  warnings: string[];
}

export class ExcelImportService {
  /**
   * Nombres alternativos para detectar columnas automáticamente
   */
  private columnAliases = {
    id: ['número de guion', 'numero de guion', 'numero', 'id', '#'],
    title: ['título', 'titulo', 'title', 'nombre'],
    text: ['texto', 'contenido', 'texto/contenido', 'text', 'script', 'body'],
    duration: ['duración', 'duracion', 'duration', 'tiempo'],
    notes: ['notas', 'notes', 'comentarios', 'observaciones']
  };
  
  /**
   * Importa scripts desde un archivo Excel local
   * NOTA: Este método requiere Node.js/Electron y no funciona en navegador
   * Use importFromBuffer() con FileReader API en navegador
   * @param filePath - Ruta absoluta del archivo .xlsx
   */
  async importFromFile(filePath: string): Promise<ImportResult> {
    console.error('❌ ExcelImportService.importFromFile(): Not available in browser. Use importFromBuffer() with FileReader API instead.');
    return {
      success: false,
      items: [],
      errors: ['importFromFile() no disponible en navegador. Use FileReader API con importFromBuffer()'],
      warnings: []
    };
    
    /* COMMENTED OUT - Requires Node.js fs module
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ExcelImportService: importing from ${filePath}`);
      }
      
      // Leer archivo con fs (Electron/Node.js)
      const buffer = await fs.readFile(filePath);
      
      // Importar desde buffer (convertir Buffer a ArrayBuffer)
      return this.importFromBuffer(buffer.buffer as ArrayBuffer);
    } catch (error: any) {
      console.error('❌ ExcelImportService: error reading file', error);
      return {
        success: false,
        items: [],
        errors: [`Error leyendo archivo: ${error.message}`],
        warnings: []
      };
    }
    */
  }
  
  /**
   * Importa scripts desde un ArrayBuffer
   * @param buffer - Buffer con datos del archivo Excel
   */
  async importFromBuffer(buffer: ArrayBuffer): Promise<ImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const items: RunOrderItem[] = [];
    
    try {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Usar la primera hoja
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return {
          success: false,
          items: [],
          errors: ['El archivo Excel no contiene hojas'],
          warnings: []
        };
      }
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON (array de arrays)
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length === 0) {
        return {
          success: false,
          items: [],
          errors: ['La hoja está vacía'],
          warnings: []
        };
      }
      
      // Primera fila = headers
      const headers = data[0] as string[];
      
      // Detectar columnas
      const columnMapping = this.detectColumns(headers);
      
      // Validar columnas requeridas
      if (columnMapping.title === undefined || columnMapping.text === undefined) {
        const missing: string[] = [];
        if (columnMapping.title === undefined) missing.push('Título');
        if (columnMapping.text === undefined) missing.push('Texto/Contenido');
        
        return {
          success: false,
          items: [],
          errors: [`Faltan columnas requeridas: ${missing.join(', ')}`],
          warnings: []
        };
      }
      
      // Procesar filas (skip header)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        // Validar que la fila no esté vacía
        if (!row || row.every(cell => !cell)) {
          warnings.push(`Fila ${i + 1} vacía, omitida`);
          continue;
        }
        
        try {
          const item = this.mapRowToItem(row, columnMapping, i + 1);
          items.push(item);
        } catch (error: any) {
          errors.push(`Fila ${i + 1}: ${error.message}`);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ExcelImportService: imported ${items.length} items`);
        if (errors.length > 0) {
          console.warn(`⚠️ ExcelImportService: ${errors.length} errors`);
        }
      }
      
      return {
        success: errors.length === 0,
        items,
        errors,
        warnings
      };
    } catch (error: any) {
      console.error('❌ ExcelImportService: error parsing Excel', error);
      return {
        success: false,
        items: [],
        errors: [`Error procesando Excel: ${error.message}`],
        warnings: []
      };
    }
  }
  
  /**
   * Genera un preview de la importación (primeras 5 filas)
   * NOTA: Este método requiere Node.js/Electron y no funciona en navegador
   * @param filePath - Ruta del archivo Excel
   */
  async previewImport(filePath: string): Promise<ImportPreview | null> {
    console.error('❌ ExcelImportService.previewImport(): Not available in browser.');
    return null;
    
    /* COMMENTED OUT - Requires Node.js fs module
    try {
      const buffer = await fs.readFile(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return null;
      
      const worksheet = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length === 0) return null;
      
      const headers = data[0] as string[];
      const columnMapping = this.detectColumns(headers);
      
      // Primeras 5 filas (incluyendo header)
      const previewRows = data.slice(0, 6);
      
      return {
        totalRows: data.length - 1, // -1 por el header
        previewRows,
        columnMapping,
        estimatedItems: data.length - 1
      };
    } catch (error) {
      console.error('❌ ExcelImportService: error en preview', error);
      return null;
    }
    */
  }
  
  /**
   * Detecta automáticamente las columnas del Excel
   */
  private detectColumns(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    
    const normalizedHeaders = headers.map(h => 
      h?.toString().toLowerCase().trim() ?? ''
    );
    
    // Detectar cada tipo de columna
    for (let i = 0; i < normalizedHeaders.length; i++) {
      const header = normalizedHeaders[i];
      
      // ID
      if (this.columnAliases.id.some(alias => header.includes(alias))) {
        mapping.id = i;
      }
      // Title
      else if (this.columnAliases.title.some(alias => header.includes(alias))) {
        mapping.title = i;
      }
      // Text
      else if (this.columnAliases.text.some(alias => header.includes(alias))) {
        mapping.text = i;
      }
      // Duration
      else if (this.columnAliases.duration.some(alias => header.includes(alias))) {
        mapping.duration = i;
      }
      // Notes
      else if (this.columnAliases.notes.some(alias => header.includes(alias))) {
        mapping.notes = i;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 ExcelImportService: column mapping', mapping);
    }
    
    return mapping;
  }
  
  /**
   * Mapea una fila del Excel a un RunOrderItem
   */
  private mapRowToItem(
    row: any[],
    mapping: ColumnMapping,
    rowNumber: number
  ): RunOrderItem {
    // Title (requerido)
    const title = mapping.title !== undefined 
      ? row[mapping.title]?.toString().trim() 
      : '';
    
    if (!title) {
      throw new Error('Título vacío');
    }
    
    // Text (requerido)
    const text = mapping.text !== undefined
      ? row[mapping.text]?.toString().trim()
      : '';
    
    if (!text) {
      throw new Error('Texto/Contenido vacío');
    }
    
    // ID (opcional, generado si no existe)
    const id = mapping.id !== undefined && row[mapping.id]
      ? row[mapping.id].toString()
      : `script-${Date.now()}-${rowNumber}`;
    
    // Duration (opcional, "00:00:00" si no existe)
    let duration = '00:00:00';
    if (mapping.duration !== undefined && row[mapping.duration]) {
      const durationValue = row[mapping.duration];
      
      // Puede venir como número (segundos) o string "MM:SS"
      if (typeof durationValue === 'number') {
        duration = this.formatDuration(durationValue); // segundos a HH:MM:SS
      } else if (typeof durationValue === 'string') {
        duration = this.normalizeDuration(durationValue);
      }
    }
    
    // Notes (opcional)
    const notes = mapping.notes !== undefined && row[mapping.notes]
      ? row[mapping.notes].toString().trim()
      : undefined;
    
    const now = new Date();
    
    return {
      id,
      title,
      text,
      duration,
      status: 'ready' as ItemStatus,
      notes,
      createdAt: now,
      updatedAt: now,
      sourcePath: undefined // Se puede agregar después
    };
  }
  
  /**
   * Parse duration string "MM:SS" a segundos
   */
  private parseDuration(durationStr: string): number {
    const parts = durationStr.split(':').map(p => parseInt(p.trim(), 10));
    
    if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // Solo segundos
      return parts[0];
    }
    
    return 0;
  }
  
  /**
   * Formatea segundos a string HH:MM:SS
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Normaliza duration string a formato HH:MM:SS
   */
  private normalizeDuration(durationStr: string): string {
    const parts = durationStr.split(':').map(p => parseInt(p.trim(), 10));
    
    if (parts.length === 3) {
      // Ya está en HH:MM:SS
      return durationStr;
    } else if (parts.length === 2) {
      // MM:SS → 00:MM:SS
      return `00:${parts[0].toString().padStart(2, '0')}:${parts[1].toString().padStart(2, '0')}`;
    } else if (parts.length === 1) {
      // Solo segundos → 00:00:SS
      return `00:00:${parts[0].toString().padStart(2, '0')}`;
    }
    
    return '00:00:00';
  }
  
  /**
   * Valida que el archivo sea un Excel válido
   * NOTA: Este método requiere Node.js/Electron y no funciona en navegador
   */
  async validateExcelFile(filePath: string): Promise<{ valid: boolean, error?: string }> {
    return { valid: false, error: 'validateExcelFile() no disponible en navegador' };
    
    /* COMMENTED OUT - Requires Node.js fs module
    try {
      const buffer = await fs.readFile(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      if (workbook.SheetNames.length === 0) {
        return { valid: false, error: 'El archivo no contiene hojas' };
      }
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        return { valid: false, error: 'El archivo debe tener al menos una fila de datos además del encabezado' };
      }
      
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: `Error al validar: ${error.message}` };
    }
    */
  }
  
  /**
   * Exporta items a Excel (inverso de importar)
   */
  async exportToExcel(items: RunOrderItem[], filePath: string): Promise<void> {
    try {
      // Preparar datos para Excel
      const data: any[][] = [
        // Header
        ['Número de Guion', 'Título', 'Texto/Contenido', 'Duración (seg)', 'Notas']
      ];
      
      // Rows
      items.forEach(item => {
        data.push([
          item.id,
          item.title,
          item.text,
          item.duration, // Ya es string HH:MM:SS
          item.notes || ''
        ]);
      });
      
      // Crear workbook
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scripts');
      
      // Guardar archivo
      XLSX.writeFile(workbook, filePath);
      
      console.log(`📊 ExcelImportService: exported ${items.length} items to ${filePath}`);
    } catch (error) {
      console.error('❌ ExcelImportService: error exporting to Excel', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const excelImportService = new ExcelImportService();

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__EXCEL_IMPORT_SERVICE__ = excelImportService;
  console.log('🔧 ExcelImportService expuesto en window.__EXCEL_IMPORT_SERVICE__');
}
