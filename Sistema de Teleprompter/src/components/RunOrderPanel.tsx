import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Play, Plus, Trash2, Edit, Upload } from "lucide-react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableRunOrderItem } from "./DraggableRunOrderItem";

interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  script: string;
  isActive: boolean;
}

interface RunOrderPanelProps {
  runOrder: RunOrderItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (id: string) => void;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
  onImportExcel?: () => void;
}

export function RunOrderPanel({
  runOrder,
  activeItemId,
  onSelectItem,
  onAddItem,
  onDeleteItem,
  onEditItem
}: RunOrderPanelProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Run Order</CardTitle>
          <Button size="sm" variant="outline" onClick={onAddItem}>
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3 pt-0">
            {runOrder.map((item, index) => (
              <div
                key={item.id}
                className={`p-2 rounded cursor-pointer border transition-colors ${
                  item.id === activeItemId
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted border-transparent'
                }`}
                onClick={() => onSelectItem(item.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.duration}
                      </Badge>
                    </div>
                    <div className="text-xs font-medium truncate">
                      {item.title}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditItem(item.id);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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