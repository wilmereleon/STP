import { Plus, Play, Pause, MoreVertical, Settings, GripVertical, CheckCircle, Circle, Target, SkipForward, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';

interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  status: 'ready' | 'playing' | 'completed';
}

interface RunOrderListProps {
  items: RunOrderItem[];
  currentItem: string | null;
  onItemSelect: (id: string) => void;
  onAddItem: () => void;
  onReorderItems: (dragIndex: number, hoverIndex: number) => void;
  onJumpToScript?: (id: string) => void;
  onTitleChange?: (id: string, newTitle: string) => void;
}

export function RunOrderList({ items, currentItem, onItemSelect, onAddItem, onReorderItems, onJumpToScript, onTitleChange }: RunOrderListProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      onReorderItems(draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  const handleEditStart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: RunOrderItem) => {
    e.stopPropagation();
    setEditingItem(item.id);
    setEditingTitle(item.title);
  };

  const handleEditSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, itemId: string) => {
    e.stopPropagation();
    if (onTitleChange && editingTitle.trim()) {
      onTitleChange(itemId, editingTitle.trim());
    }
    setEditingItem(null);
    setEditingTitle('');
  };

  const handleEditCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setEditingItem(null);
    setEditingTitle('');
  };

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
      {/* Header */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Run Order</h3>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onAddItem} className="text-white hover:bg-gray-700">
              <Plus className="h-4 w-4" />
            </Button>

          </div>
        </div>
        <div className="text-xs text-gray-400">
          Active Run Order: How To Script.awn
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-2 mb-1 rounded cursor-pointer text-xs border-l-2 ${
                currentItem === item.id
                  ? 'bg-red-600 border-red-500'
                  : item.status === 'completed'
                  ? 'bg-green-700 border-green-600'
                  : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
              } ${draggedItem === index ? 'opacity-50' : ''}`}
              onClick={() => onItemSelect(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical className="h-3 w-3 text-gray-500 cursor-grab" />
                  <span className="text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
                  
                  {/* Status indicator */}
                  {currentItem === item.id ? (
                    <Play className="h-3 w-3 text-red-400" aria-label="Reproduciendo" />
                  ) : item.status === 'completed' ? (
                    <CheckCircle className="h-3 w-3 text-green-400" aria-label="Completado" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-500" aria-label="Pendiente" />
                  )}
                  
                  <div className="flex-1">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEditKeyDown(e, item.id)}
                          className="flex-1 bg-gray-700 text-white text-xs px-1 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          autoFocus
                          onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:bg-green-600/20 p-0.5 h-auto"
                          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleEditSave(e, item.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
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
                      <div className="truncate group flex items-center gap-1">
                        <span className="flex-1">{item.title}</span>
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
                    <div className="text-gray-500 mt-1 flex items-center gap-1">
                      {item.duration}
                      {item.status === 'completed' && <span className="text-xs text-green-400">✓</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Jump to Script Button */}
                  {onJumpToScript && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 p-1" 
                      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.stopPropagation(); // Prevent item selection
                        onJumpToScript(item.id);
                      }}
                      title={`🎯 Saltar y reproducir: ${item.title}`}
                    >
                      <Target className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:bg-gray-600 p-1">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400">
          Total: {items.length} items | 🎯 = Saltar directamente
        </div>
      </div>


    </div>
  );
}