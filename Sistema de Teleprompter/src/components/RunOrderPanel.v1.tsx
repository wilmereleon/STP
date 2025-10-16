// ===== IMPORTACIONES / IMPORTS =====
// React core / React núcleo
import React from "react";
// Componentes de tarjeta UI / Card UI components
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
// Componentes UI reutilizables / Reusable UI components
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
// Iconos de Lucide React / Lucide React icons
import { Plus, Trash2, Edit } from "lucide-react";

/**
 * Representa un item individual en el panel de orden de reproducción
 * Represents an individual item in the run order panel
 * 
 * @interface RunOrderItem
 * @property {string} id - Identificador único del item / Unique item identifier
 * @property {string} title - Título del guion o segmento / Script or segment title
 * @property {string} duration - Duración estimada (formato texto) / Estimated duration (text format)
 * @property {string} script - Contenido del guion / Script content
 * @property {boolean} isActive - Indica si el item está actualmente activo / Indicates if item is currently active
 */
interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  script: string;
  isActive: boolean;
}

/**
 * Propiedades del componente RunOrderPanel
 * RunOrderPanel component properties
 * 
 * @interface RunOrderPanelProps
 * @property {RunOrderItem[]} runOrder - Lista de items en el orden de reproducción / List of items in run order
 * @property {string} activeItemId - ID del item actualmente activo (string vacío si no hay selección) / Currently active item ID (empty string if no selection)
 * @property {(id: string) => void} onSelectItem - Callback al seleccionar un item / Callback when selecting an item
 * @property {() => void} onAddItem - Callback para agregar nuevo item / Callback to add new item
 * @property {(id: string) => void} onDeleteItem - Callback para eliminar item / Callback to delete item
 * @property {(id: string) => void} onEditItem - Callback para editar item / Callback to edit item
 * @property {(dragIndex: number, hoverIndex: number) => void} [onMoveItem] - Callback opcional para reordenar items / Optional callback to reorder items
 * @property {() => void} [onImportExcel] - Callback opcional para importar desde Excel / Optional callback to import from Excel
 */
interface RunOrderPanelProps {
  runOrder: RunOrderItem[];
  activeItemId: string; // App pasa un string ('' cuando no hay selección)
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (id: string) => void;
  onMoveItem?: (dragIndex: number, hoverIndex: number) => void; // opcional
  onImportExcel?: () => void; // opcional
}

/**
 * RunOrderPanel - Panel de orden de reproducción simplificado
 * RunOrderPanel - Simplified run order panel
 * 
 * Componente que muestra una lista compacta de items del orden de reproducción con:
 * - Vista de lista con scroll para muchos items
 * - Indicador visual del item activo con colores destacados
 * - Botones de acción inline (editar y eliminar)
 * - Numeración automática de items
 * - Badge de duración para cada item
 * - Opciones de agregar e importar items
 * - Mensaje cuando la lista está vacía
 * 
 * Component that displays a compact list of run order items with:
 * - Scrollable list view for many items
 * - Visual indicator of active item with highlighted colors
 * - Inline action buttons (edit and delete)
 * - Automatic item numbering
 * - Duration badge for each item
 * - Options to add and import items
 * - Empty state message
 * 
 * @component
 * @param {RunOrderPanelProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Panel de orden de reproducción / Run order panel
 */
export function RunOrderPanel({
  runOrder,
  activeItemId,
  onSelectItem,
  onAddItem,
  onDeleteItem,
  onEditItem,
  onMoveItem,
  onImportExcel
}: RunOrderPanelProps) {
  return (
    <Card className="h-full flex flex-col">
      {/* ===== ENCABEZADO / HEADER ===== */}
      {/* Título del panel y botones de acción principales / Panel title and main action buttons */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Run Order</CardTitle>
          <div className="flex items-center gap-2">
            {/* Botón de importar (solo si hay callback) / Import button (only if callback exists) */}
            {onImportExcel && (
              <Button size="sm" variant="ghost" onClick={onImportExcel}>
                Import
              </Button>
            )}
            {/* Botón para agregar nuevo item / Button to add new item */}
            <Button size="sm" variant="outline" onClick={onAddItem}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      {/* ===== CONTENIDO PRINCIPAL / MAIN CONTENT ===== */}
      {/* ScrollArea permite desplazamiento con muchos items / ScrollArea allows scrolling with many items */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3 pt-0">
            {/* ===== LISTA DE ITEMS / ITEMS LIST ===== */}
            {runOrder.map((item, index) => (
              <div
                key={item.id}
                // Estilos condicionales según si el item está activo / Conditional styles based on whether item is active
                // - Item activo: fondo primary con texto contrastante / Active item: primary background with contrasting text
                // - Item inactivo: hover suave y borde transparente / Inactive item: soft hover and transparent border
                className={`p-2 rounded cursor-pointer border transition-colors ${
                  item.id === activeItemId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted border-transparent"
                }`}
                onClick={() => onSelectItem(item.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* ===== INFORMACIÓN DEL ITEM / ITEM INFORMATION ===== */}
                  <div className="flex-1 min-w-0">
                    {/* Número y duración del item / Item number and duration */}
                    <div className="flex items-center gap-2 mb-1">
                      {/* Numeración con padding (01, 02, 03...) / Numbering with padding (01, 02, 03...) */}
                      <span className="text-xs font-mono text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {/* Badge con duración / Badge with duration */}
                      <Badge variant="secondary" className="text-xs">
                        {item.duration}
                      </Badge>
                    </div>
                    {/* Título del item con truncado / Item title with truncation */}
                    <div className="text-xs font-medium truncate">{item.title}</div>
                  </div>
                  
                  {/* ===== BOTONES DE ACCIÓN / ACTION BUTTONS ===== */}
                  <div className="flex gap-1">
                    {/* Botón de editar / Edit button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation(); // Evitar activación del item al editar / Prevent item activation when editing
                        onEditItem?.(item.id);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {/* Botón de eliminar / Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation(); // Evitar activación del item al eliminar / Prevent item activation when deleting
                        onDeleteItem?.(item.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {/* ===== ESTADO VACÍO / EMPTY STATE ===== */}
            {/* Mensaje cuando no hay items en la lista / Message when there are no items in the list */}
            {runOrder.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No items in run order
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}