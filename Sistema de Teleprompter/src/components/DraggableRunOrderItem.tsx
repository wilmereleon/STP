// ...existing code...
// Importaciones de React
import React, { useRef } from "react";

// Importaciones de react-dnd para funcionalidad de arrastrar y soltar
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import type { Identifier } from "dnd-core";

// Importaciones de componentes UI
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

// Importaciones de íconos
import { Play, Edit, Trash2, GripVertical, Check, X } from "lucide-react";

/**
 * Interface que define la estructura de un item en el Run Order
 * 
 * @property {string} id - Identificador único del item
 * @property {string} title - Título/nombre del script
 * @property {string} duration - Duración estimada del script (formato: "MM:SS")
 * @property {string} script - Contenido completo del script
 * @property {boolean} isActive - Indica si el script está actualmente en reproducción
 */
interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  script: string;
  isActive: boolean;
}

/**
 * Props del componente DraggableRunOrderItem
 * 
 * @property {RunOrderItem} item - Datos del item a mostrar
 * @property {number} index - Posición actual del item en la lista
 * @property {boolean} isActive - Si este item está actualmente seleccionado/activo
 * @property {boolean} isEditing - Si este item está en modo edición
 * @property {string} editingTitle - Título temporal durante la edición
 * @property {function} onSelect - Callback al seleccionar el item
 * @property {function} onEdit - Callback al editar el item
 * @property {function} onDelete - Callback al eliminar el item
 * @property {function} onSaveEdit - Callback al guardar la edición
 * @property {function} onCancelEdit - Callback al cancelar la edición
 * @property {function} onEditingTitleChange - Callback al cambiar el título en edición
 * @property {function} moveItem - Callback para reordenar items (drag & drop)
 */
interface DraggableRunOrderItemProps {
  item: RunOrderItem;
  index: number;
  isActive: boolean;
  isEditing?: boolean;
  editingTitle?: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onEditingTitleChange?: (title: string) => void;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

/**
 * Tipo que define la estructura del item mientras se está arrastrando
 * Usado internamente por react-dnd para tracking del drag
 */
type DragItem = {
  id: string;
  index: number;
};

/**
 * Constante que identifica el tipo de item para react-dnd
 * Previene que otros tipos de elementos sean arrastrados a esta lista
 */
const ITEM_TYPE = "runOrderItem";

/**
 * DraggableRunOrderItem - Componente de item individual del Run Order con drag & drop
 * 
 * Renderiza un item de la lista de Run Order que puede ser:
 * - Arrastrado y soltado para reordenar
 * - Seleccionado para cargar su script
 * - Editado o eliminado
 * 
 * Utiliza react-dnd para la funcionalidad de drag & drop con detección
 * inteligente de posición de hover para un reordenamiento fluido.
 * 
 * @component
 * @param {DraggableRunOrderItemProps} props - Propiedades del componente
 * @returns {JSX.Element} Item arrastrable del Run Order
 */
export function DraggableRunOrderItem({
  item,
  index,
  isActive,
  isEditing = false,
  editingTitle = '',
  onSelect,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditingTitleChange,
  moveItem
}: DraggableRunOrderItemProps) {
  /**
   * Referencia al elemento DOM del item
   * Necesaria para calcular posiciones durante el drag & drop
   */
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Hook useDrop - Configura el componente como drop target (destino de arrastre)
   * 
   * Maneja la lógica de hover durante el arrastre:
   * - Detecta cuando otro item se arrastra sobre este
   * - Calcula si debe intercambiar posiciones basado en el punto medio vertical
   * - Solo reordena si el mouse cruza el punto medio del item
   */
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ITEM_TYPE, // Solo acepta items del tipo 'runOrderItem'
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId() // ID para debugging de react-dnd
    }),
    hover(draggedItem: DragItem, monitor: DropTargetMonitor) {
      // Validaciones iniciales
      if (!ref.current || !draggedItem) return;

      const dragIndex = draggedItem.index; // Índice del item que se está arrastrando
      const hoverIndex = index; // Índice del item sobre el que se está

      // Si es el mismo item, no hacer nada
      if (dragIndex === hoverIndex) {
        return;
      }

      // Calcular el rectángulo del elemento y su punto medio vertical
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Obtener la posición del mouse
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      /**
       * Lógica de reordenamiento inteligente:
       * Solo reordena cuando el mouse cruza el punto medio del item
       * Esto previene el "flickering" durante el drag
       */
      
      // Si arrastra hacia abajo y el mouse no ha cruzado el punto medio, no reordenar
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Si arrastra hacia arriba y el mouse no ha cruzado el punto medio, no reordenar
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Ejecutar el reordenamiento
      moveItem(dragIndex, hoverIndex);

      /**
       * Mutar el índice del item arrastrado por rendimiento
       * Esto evita búsquedas costosas durante el hover
       * Técnica recomendada en los ejemplos oficiales de react-dnd
       */
      draggedItem.index = hoverIndex;
    }
  });

  /**
   * Hook useDrag - Configura el componente como draggable (arrastrable)
   * 
   * Proporciona el estado isDragging para aplicar estilos visuales
   * durante el arrastre (ej: opacidad reducida)
   */
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ITEM_TYPE, // Tipo del item arrastrable
    item: () => ({ id: item.id, index }), // Datos que se transfieren durante el drag
    collect: (monitor) => ({
      isDragging: monitor.isDragging() // Estado de si este item está siendo arrastrado
    })
  });

  /**
   * Conectar las referencias de drag y drop al elemento DOM
   * El orden importa: primero drop, luego drag
   * Esto permite que el elemento sea tanto arrastrable como drop target
   */
  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId ?? undefined} // Atributo para debugging de react-dnd
      className={`
        border rounded-md p-2 mb-2 cursor-pointer transition-colors
        ${isActive ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-muted/50"}
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
      onClick={() => onSelect(item.id)} // Seleccionar item al hacer clic
    >
      <div className="flex items-center gap-2">
        {/* ===== ICONO DE ARRASTRE ===== */}
        {/* Handle visual para indicar que el item es arrastrable */}
        <div
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.stopPropagation()} // Prevenir que el clic active onSelect
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* ===== CONTENIDO PRINCIPAL DEL ITEM ===== */}
        <div className="flex-1 min-w-0">
          {/* Encabezado: Título y Duración */}
          <div className="flex items-center justify-between gap-2">
            {/* Título del script con truncamiento si es muy largo */}
            {isEditing ? (
              <Input
                value={editingTitle}
                onChange={(e) => onEditingTitleChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSaveEdit?.();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancelEdit?.();
                  }
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-7 text-sm flex-1"
                autoFocus
              />
            ) : (
              <h4 className="text-sm font-medium truncate flex-1">{item.title}</h4>
            )}
            
            {/* Badge con la duración del script */}
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {item.duration}
            </Badge>
          </div>
        </div>

        {/* ===== BOTONES DE ACCIÓN ===== */}
        <div className="flex items-center gap-1">
          {/* Icono de Play si el script está activo/en reproducción */}
          {isActive && !isEditing && <Play className="w-3 h-3 text-primary mr-1" />}
          
          {/* Botones de edición cuando está en modo edición */}
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onSaveEdit?.();
                }}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onCancelEdit?.();
                }}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              {/* Botón de Editar */}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation(); // Prevenir que active onSelect del contenedor
                  onEdit(item.id);
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
              
              {/* Botón de Eliminar */}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation(); // Prevenir que active onSelect del contenedor
                  onDelete(item.id);
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// ...existing code...