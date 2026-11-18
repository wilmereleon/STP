// ===== IMPORTACIONES / IMPORTS =====
// Iconos de Lucide React para UI / Lucide React icons for UI
import { Plus, Play, Pause, MoreVertical, Settings, GripVertical, CheckCircle, Circle, Target, SkipForward, Edit2, Check, X } from 'lucide-react';
// Componentes UI reutilizables / Reusable UI components
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
// Hook de estado de React / React state hook
import { useState } from 'react';

/**
 * Representa un item individual en el orden de reproducción
 * Represents an individual item in the run order
 * 
 * @interface RunOrderItem
 * @property {string} id - Identificador único del item / Unique item identifier
 * @property {string} title - Título del guion o segmento / Script or segment title
 * @property {string} duration - Duración estimada (formato texto) / Estimated duration (text format)
 * @property {('ready'|'playing'|'completed')} status - Estado actual del item / Current item status
 */
interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  status: 'ready' | 'playing' | 'completed';
}

/**
 * Propiedades del componente RunOrderList
 * RunOrderList component properties
 * 
 * @interface RunOrderListProps
 * @property {RunOrderItem[]} items - Lista de items en el orden de reproducción / List of items in run order
 * @property {string|null} currentItem - ID del item actualmente reproduciéndose / Currently playing item ID
 * @property {(id: string) => void} onItemSelect - Callback al seleccionar un item / Callback when selecting an item
 * @property {() => void} onAddItem - Callback para agregar nuevo item / Callback to add new item
 * @property {(dragIndex: number, hoverIndex: number) => void} onReorderItems - Callback para reordenar con drag & drop / Callback to reorder with drag & drop
 * @property {(id: string) => void} [onJumpToScript] - Callback para saltar directamente a un guion / Callback to jump directly to a script
 * @property {(id: string, newTitle: string) => void} [onTitleChange] - Callback para cambiar título del item / Callback to change item title
 */
interface RunOrderListProps {
  items: RunOrderItem[];
  currentItem: string | null;
  onItemSelect: (id: string) => void;
  onAddItem: () => void;
  onReorderItems: (dragIndex: number, hoverIndex: number) => void;
  onJumpToScript?: (id: string) => void;
  onTitleChange?: (id: string, newTitle: string) => void;
}

/**
 * RunOrderList - Lista de orden de reproducción con drag & drop
 * RunOrderList - Run order list with drag & drop
 * 
 * Componente que muestra una lista ordenada de guiones/segmentos con:
 * - Drag & drop nativo para reordenar items
 * - Edición inline de títulos
 * - Indicadores visuales de estado (listo/reproduciendo/completado)
 * - Navegación directa a guiones específicos
 * - Numeración automática de items
 * 
 * Component that displays an ordered list of scripts/segments with:
 * - Native drag & drop for reordering items
 * - Inline title editing
 * - Visual status indicators (ready/playing/completed)
 * - Direct navigation to specific scripts
 * - Automatic item numbering
 * 
 * @component
 * @param {RunOrderListProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Lista de orden de reproducción / Run order list
 */
export function RunOrderList({ items, currentItem, onItemSelect, onAddItem, onReorderItems, onJumpToScript, onTitleChange }: RunOrderListProps) {
  // ===== ESTADO LOCAL / LOCAL STATE =====
  
  // Índice del item siendo arrastrado / Index of item being dragged
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  // ID del item en modo edición / ID of item in edit mode
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  // Título temporal durante edición / Temporary title during editing
  const [editingTitle, setEditingTitle] = useState('');

  // ===== MANEJADORES DE DRAG & DROP / DRAG & DROP HANDLERS =====
  
  /**
   * Inicia el arrastre de un item
   * Starts dragging an item
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move'; // Solo permitir mover / Only allow move
  };

  /**
   * Permite soltar el item durante el arrastre
   * Allows dropping item during drag
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necesario para permitir el drop / Required to allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * Completa el reordenamiento al soltar el item
   * Completes reordering when dropping item
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    // Solo reordenar si hay cambio de posición / Only reorder if position changed
    if (draggedItem !== null && draggedItem !== dropIndex) {
      onReorderItems(draggedItem, dropIndex);
    }
    setDraggedItem(null); // Limpiar estado / Clear state
  };

  // ===== MANEJADORES DE EDICIÓN / EDIT HANDLERS =====
  
  /**
   * Inicia el modo de edición para un item
   * Starts edit mode for an item
   */
  const handleEditStart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: RunOrderItem) => {
    e.stopPropagation(); // Evitar selección del item / Prevent item selection
    setEditingItem(item.id);
    setEditingTitle(item.title); // Pre-cargar título actual / Pre-load current title
  };

  /**
   * Guarda los cambios del título editado
   * Saves edited title changes
   */
  const handleEditSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, itemId: string) => {
    e.stopPropagation();
    // Solo guardar si hay callback y título válido / Only save if callback exists and title is valid
    if (onTitleChange && editingTitle.trim()) {
      onTitleChange(itemId, editingTitle.trim());
    }
    setEditingItem(null);
    setEditingTitle('');
  };

  /**
   * Cancela la edición sin guardar cambios
   * Cancels editing without saving changes
   */
  const handleEditCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setEditingItem(null); // Salir del modo edición / Exit edit mode
    setEditingTitle(''); // Limpiar título temporal / Clear temporary title
  };

  /**
   * Maneja atajos de teclado durante la edición
   * Handles keyboard shortcuts during editing
   * - Enter: Guarda cambios / Save changes
   * - Escape: Cancela edición / Cancel editing
   */
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onTitleChange && editingTitle.trim()) {
        onTitleChange(itemId, editingTitle.trim());
      }
      setEditingItem(null);
      setEditingTitle('');
    } else if (e.key === 'Escape') {
      setEditingItem(null);
      setEditingTitle('');
    }
  };
  
  return (
    <div className="h-full bg-gray-900 text-white">
      {/* ===== ENCABEZADO / HEADER ===== */}
      {/* Título, botón de agregar y nombre del archivo activo / Title, add button and active file name */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Run Order</h3>
          <div className="flex gap-1">
            {/* Botón para agregar nuevo item / Button to add new item */}
            <Button size="sm" variant="ghost" onClick={onAddItem} className="text-white hover:bg-gray-700">
              <Plus className="h-4 w-4" />
            </Button>

          </div>
        </div>
        {/* Nombre del archivo de orden de reproducción activo / Active run order file name */}
        <div className="text-xs text-gray-400">
          Active Run Order: How To Script.awn
        </div>
      </div>

      {/* ===== LISTA DE ITEMS / ITEMS LIST ===== */}
      {/* ScrollArea permite desplazamiento con muchos items / ScrollArea allows scrolling with many items */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable // Hace el elemento arrastrable / Makes element draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              // Estilos dinámicos según estado del item / Dynamic styles based on item status
              // - Rojo: item actualmente reproduciéndose / Red: currently playing item
              // - Verde: item completado / Green: completed item
              // - Gris: item pendiente / Gray: pending item
              className={`p-2 mb-1 rounded cursor-pointer text-xs border-l-2 ${
                currentItem === item.id
                  ? 'bg-red-600 border-red-500'
                  : item.status === 'completed'
                  ? 'bg-green-700 border-green-600'
                  : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
              } ${draggedItem === index ? 'opacity-50' : ''}`} // Opacidad reducida mientras se arrastra / Reduced opacity while dragging
              onClick={() => onItemSelect(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {/* Icono de agarre para arrastrar / Grab handle for dragging */}
                  <GripVertical className="h-3 w-3 text-gray-500 cursor-grab" />
                  
                  {/* Número de item con padding (01, 02, 03...) / Item number with padding (01, 02, 03...) */}
                  <span className="text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
                  
                  {/* ===== INDICADOR DE ESTADO / STATUS INDICATOR ===== */}
                  {/* Muestra icono según estado del item / Shows icon based on item status */}
                  {currentItem === item.id ? (
                    <Play className="h-3 w-3 text-red-400" aria-label="Reproduciendo" />
                  ) : item.status === 'completed' ? (
                    <CheckCircle className="h-3 w-3 text-green-400" aria-label="Completado" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-500" aria-label="Pendiente" />
                  )}
                  
                  {/* ===== ÁREA DE TÍTULO E INFORMACIÓN / TITLE AND INFO AREA ===== */}
                  <div className="flex-1">
                    {editingItem === item.id ? (
                      // **MODO EDICIÓN** / **EDIT MODE**
                      // Input de texto con botones de guardar/cancelar / Text input with save/cancel buttons
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEditKeyDown(e, item.id)}
                          className="flex-1 bg-gray-700 text-white text-xs px-1 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          autoFocus // Auto-foco para UX inmediata / Auto-focus for immediate UX
                          onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => e.stopPropagation()} // Evitar selección del item / Prevent item selection
                        />
                        {/* Botón confirmar (✓) / Confirm button (✓) */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:bg-green-600/20 p-0.5 h-auto"
                          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleEditSave(e, item.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        {/* Botón cancelar (✗) / Cancel button (✗) */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-600/20 p-0.5 h-auto"
                          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleEditCancel(e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      // **MODO VISUALIZACIÓN** / **VIEW MODE**
                      // Título con botón de edición que aparece al hover / Title with edit button that appears on hover
                      <div className="truncate group flex items-center gap-1">
                        <span className="flex-1">{item.title}</span>
                        {/* Botón de edición (solo si hay callback) / Edit button (only if callback exists) */}
                        {/* opacity-0 group-hover:opacity-100 = aparece al pasar mouse / appears on mouse hover */}
                        {onTitleChange && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-gray-600/50 p-0.5 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleEditStart(e, item)}
                            title="Editar título"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    {/* Duración y marca de completado / Duration and completion mark */}
                    <div className="text-gray-500 mt-1 flex items-center gap-1">
                      {item.duration}
                      {item.status === 'completed' && <span className="text-xs text-green-400">✓</span>}
                    </div>
                  </div>
                </div>
                
                {/* ===== BOTONES DE ACCIÓN / ACTION BUTTONS ===== */}
                <div className="flex items-center gap-1">
                  {/* Botón de salto directo (🎯 Target) / Direct jump button (🎯 Target) */}
                  {/* Permite navegar y reproducir un guion específico inmediatamente / Allows navigating and playing a specific script immediately */}
                  {onJumpToScript && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 p-1" 
                      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.stopPropagation(); // Evitar selección del item / Prevent item selection
                        onJumpToScript(item.id);
                      }}
                      title={`🎯 Saltar y reproducir: ${item.title}`}
                    >
                      <Target className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {/* Menú de opciones adicionales (⋮) / Additional options menu (⋮) */}
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:bg-gray-600 p-1">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* ===== PIE DE PÁGINA / FOOTER ===== */}
      {/* Muestra contador total de items y leyenda de iconos / Shows total item counter and icon legend */}
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400">
          Total: {items.length} items | 🎯 = Saltar directamente
        </div>
      </div>


    </div>
  );
}