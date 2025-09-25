// ...existing code...
import React, { useRef } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import type { Identifier } from "dnd-core";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Edit, Trash2, GripVertical } from "lucide-react";

interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  script: string;
  isActive: boolean;
}

interface DraggableRunOrderItemProps {
  item: RunOrderItem;
  index: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

type DragItem = {
  id: string;
  index: number;
};

const ITEM_TYPE = "runOrderItem";

export function DraggableRunOrderItem({
  item,
  index,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  moveItem
}: DraggableRunOrderItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ITEM_TYPE,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId()
    }),
    hover(draggedItem: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current || !draggedItem) return;

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Perform move
      moveItem(dragIndex, hoverIndex);

      // Mutate dragged item index for performance (as in react-dnd examples)
      draggedItem.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // connect refs (drop then drag)
  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId ?? undefined}
      className={`
        border rounded-md p-3 mb-2 cursor-pointer transition-colors
        ${isActive ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-muted/50"}
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium truncate">{item.title}</h4>
            <Badge variant="secondary" className="text-xs">
              {item.duration}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.script || "No script content"}
          </p>

          <div className="flex items-center gap-1 mt-2">
            {isActive && <Play className="w-3 h-3 text-primary" />}
            <div className="flex gap-1 ml-auto">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onEdit(item.id);
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...