// ===== IMPORTACIONES / IMPORTS =====
// React core / React núcleo
import React, { useRef, useState } from "react";
// Componentes de tarjeta UI / Card UI components
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
// Componentes UI reutilizables / Reusable UI components
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
// Iconos de Lucide React / Lucide React icons
import { Plus, Trash2, Edit, FileSpreadsheet, Upload } from "lucide-react";
// Hooks del Store / Store hooks
import { useRunOrderStore } from "../hooks";
// Servicio de importación Excel / Excel import service
import { excelImportService } from "../services/ExcelImportService";
// Toast notifications
import { toast } from "sonner";

/**
 * Propiedades del componente RunOrderPanel v2
 * RunOrderPanel v2 component properties
 * 
 * @interface RunOrderPanelProps
 * @property {() => void} onAddItem - Callback para agregar nuevo item / Callback to add new item
 * @property {(id: string) => void} onEditItem - Callback para editar item / Callback to edit item
 */
interface RunOrderPanelProps {
  onAddItem: () => void;
  onEditItem: (id: string) => void;
}

/**
 * RunOrderPanel v2 - Panel de orden de reproducción con Store integration
 * RunOrderPanel v2 - Run order panel with Store integration
 * 
 * Componente refactorizado que usa RunOrderStore directamente:
 * - Elimina props: runOrder, activeItemId, onSelectItem, onDeleteItem, onMoveItem, onImportExcel
 * - Accede directamente al store para estado y acciones
 * - Incluye funcionalidad de importación Excel integrada
 * - Input file oculto para seleccionar archivos .xlsx/.xls
 * - Mensajes de éxito/error durante importación
 * - Validación y manejo de errores robusto
 * - Indicadores de carga durante importación
 * 
 * Refactored component that uses RunOrderStore directly:
 * - Removes props: runOrder, activeItemId, onSelectItem, onDeleteItem, onMoveItem, onImportExcel
 * - Accesses store directly for state and actions
 * - Includes integrated Excel import functionality
 * - Hidden file input for selecting .xlsx/.xls files
 * - Success/error messages during import
 * - Robust validation and error handling
 * - Loading indicators during import
 * 
 * @component
 * @param {RunOrderPanelProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Panel de orden de reproducción / Run order panel
 * 
 * @example
 * ```tsx
 * // Antes (v1) - 7 props
 * <RunOrderPanel
 *   runOrder={items}
 *   activeItemId={currentId}
 *   onSelectItem={handleSelect}
 *   onAddItem={handleAdd}
 *   onDeleteItem={handleDelete}
 *   onEditItem={handleEdit}
 *   onImportExcel={handleImport}
 * />
 * 
 * // Después (v2) - 2 props
 * <RunOrderPanel.v2
 *   onAddItem={handleAdd}
 *   onEditItem={handleEdit}
 * />
 * ```
 */
export function RunOrderPanel({
  onAddItem,
  onEditItem
}: RunOrderPanelProps) {
  // ===== STORE INTEGRATION / INTEGRACIÓN CON STORE =====
  const {
    items: runOrder,
    activeItemId,
    setActiveItem,
    deleteItem,
    setItems,
    updateItem
  } = useRunOrderStore();
  
  // ===== ESTADO LOCAL / LOCAL STATE =====
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para edición inline de título / State for inline title editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  // ===== HANDLERS / MANEJADORES =====
  
  /**
   * Maneja la selección de un item
   * Handles selecting an item from the run order
   */
  const handleSelectItem = (id: string) => {
    console.log('📋 RunOrderPanel: selecting item', id);
    setActiveItem(id);
    // Llamar a onEditItem para cargar el texto en el editor
    // Call onEditItem to load text in editor
    onEditItem(id);
  };
  
  /**
   * Maneja la eliminación de un item
   * Handles deleting an item
   */
  const handleDeleteItem = (id: string) => {
    console.log('🗑️ RunOrderPanel: deleting item', id);
    deleteItem(id);
  };
  
  /**
   * Inicia la edición del título de un item
   * Starts editing an item's title
   */
  const handleStartEdit = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('✏️ RunOrderPanel: starting edit for item', id);
    setEditingItemId(id);
    setEditingTitle(currentTitle);
  };
  
  /**
   * Guarda el nuevo título del item
   * Saves the new item title
   */
  const handleSaveTitle = () => {
    if (editingItemId && editingTitle.trim()) {
      const success = updateItem(editingItemId, { title: editingTitle.trim() });
      if (success) {
        console.log('✅ RunOrderPanel: title updated for item', editingItemId);
        toast.success('Script renombrado');
      } else {
        console.error('❌ RunOrderPanel: failed to update title');
        toast.error('Error al renombrar script');
      }
    }
    setEditingItemId(null);
    setEditingTitle('');
  };
  
  /**
   * Cancela la edición del título
   * Cancels title editing
   */
  const handleCancelEdit = () => {
    console.log('🚫 RunOrderPanel: canceling edit');
    setEditingItemId(null);
    setEditingTitle('');
  };
  
  /**
   * Maneja el teclado durante la edición
   * Handles keyboard during editing
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };
  
  /**
   * Abre el diálogo de selección de archivo Excel
   * Opens Excel file selection dialog
   */
  const handleImportClick = () => {
    console.log('📂 RunOrderPanel: opening file picker');
    fileInputRef.current?.click();
  };
  
  /**
   * Procesa el archivo Excel seleccionado
   * Processes the selected Excel file
   */
  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log('📊 RunOrderPanel: importing file', file.name);
    setIsImporting(true);
    setImportMessage(null);
    
    try {
      // Leer archivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Importar usando el servicio
      const result = await excelImportService.importFromBuffer(arrayBuffer);
      
      if (result.success && result.items.length > 0) {
        // Actualizar store con los items importados
        setItems(result.items);
        
        // Mensaje de éxito
        const successMsg = `✅ ${result.items.length} script${result.items.length > 1 ? 's' : ''} importado${result.items.length > 1 ? 's' : ''} correctamente`;
        setImportMessage({ type: 'success', text: successMsg });
        console.log('✅ RunOrderPanel: import successful', result.items.length, 'items');
        
        // Mostrar warnings si los hay
        if (result.warnings.length > 0) {
          console.warn('⚠️ RunOrderPanel: import warnings', result.warnings);
        }
      } else {
        // Error: no se importó nada
        const errorMsg = result.errors.length > 0
          ? result.errors.join(', ')
          : 'No se encontraron datos válidos en el archivo';
        setImportMessage({ type: 'error', text: `❌ ${errorMsg}` });
        console.error('❌ RunOrderPanel: import failed', result.errors);
      }
    } catch (error: any) {
      const errorMsg = `Error importando archivo: ${error.message}`;
      setImportMessage({ type: 'error', text: `❌ ${errorMsg}` });
      console.error('❌ RunOrderPanel: import error', error);
    } finally {
      setIsImporting(false);
      // Limpiar input para permitir reimportar el mismo archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Auto-ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setImportMessage(null);
      }, 5000);
    }
  };
  
  // ===== RENDER / RENDERIZADO =====
  
  return (
    <Card className="h-full flex flex-col">
      {/* ===== ENCABEZADO / HEADER ===== */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Run Order</CardTitle>
          <div className="flex items-center gap-2">
            {/* Botón de importar Excel / Import Excel button */}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleImportClick}
              disabled={isImporting}
              title="Importar desde Excel (.xlsx, .xls)"
            >
              {isImporting ? (
                <Upload className="w-3 h-3 mr-1 animate-pulse" />
              ) : (
                <FileSpreadsheet className="w-3 h-3 mr-1" />
              )}
              {isImporting ? 'Importando...' : 'Import Excel'}
            </Button>
            {/* Botón para agregar nuevo item / Button to add new item */}
            <Button size="sm" variant="outline" onClick={onAddItem}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        {/* Mensaje de importación (éxito o error) / Import message (success or error) */}
        {importMessage && (
          <div 
            className={`mt-2 p-2 rounded text-xs ${
              importMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {importMessage.text}
          </div>
        )}
      </CardHeader>
      
      {/* Input file oculto para seleccionar Excel / Hidden file input for Excel selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      
      {/* ===== CONTENIDO PRINCIPAL / MAIN CONTENT ===== */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3 pt-0">
            {/* ===== LISTA DE ITEMS / ITEMS LIST ===== */}
            {runOrder.map((item, index) => (
              <div
                key={item.id}
                className={`p-2 rounded cursor-pointer border transition-colors ${
                  item.id === activeItemId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted border-transparent"
                }`}
                onClick={() => handleSelectItem(item.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* ===== INFORMACIÓN DEL ITEM / ITEM INFORMATION ===== */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Numeración / Numbering */}
                      <span className="text-xs font-mono text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {/* Badge con duración / Badge with duration */}
                      <Badge variant="secondary" className="text-xs">
                        {item.duration || '00:00'}
                      </Badge>
                    </div>
                    {/* Título del item (editable inline) / Item title (inline editable) */}
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="text-xs font-medium w-full px-1 py-0.5 border rounded bg-background"
                      />
                    ) : (
                      <div 
                        className="text-xs font-medium truncate cursor-text hover:text-primary/80 transition-colors"
                        onDoubleClick={(e) => handleStartEdit(item.id, item.title, e)}
                        title="Doble-clic para editar / Double-click to edit"
                      >
                        {item.title}
                      </div>
                    )}
                  </div>
                  
                  {/* ===== BOTONES DE ACCIÓN / ACTION BUTTONS ===== */}
                  <div className="flex gap-1">
                    {/* Botón de editar título / Edit title button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleStartEdit(item.id, item.title, e);
                      }}
                      title="Editar nombre / Edit name"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {/* Botón de eliminar / Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* ===== ESTADO VACÍO / EMPTY STATE ===== */}
            {runOrder.length === 0 && !isImporting && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No items in run order</p>
                <p className="text-xs mt-1">Add manually or import from Excel</p>
              </div>
            )}
            
            {/* Indicador de carga durante importación / Loading indicator during import */}
            {isImporting && runOrder.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Upload className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Importing scripts...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
