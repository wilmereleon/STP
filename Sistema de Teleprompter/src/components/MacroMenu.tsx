import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Settings, Keyboard } from 'lucide-react';

interface MacroKey {
  key: string;
  action: string;
  description: string;
}

interface MacroMenuProps {
  isOpen: boolean;
  onClose: () => void;
  macros: MacroKey[];
  onOpenFullConfig: () => void;
}

export function MacroMenu({ 
  isOpen, 
  onClose, 
  macros,
  onOpenFullConfig
}: MacroMenuProps) {
  if (!isOpen) return null;

  const actionLabels: { [key: string]: string } = {
    'play_pause': 'Reproducir/Pausar',
    'reset': 'Reiniciar',
    'stop': 'Detener',
    'forward': 'Avanzar',
    'backward': 'Retroceder',
    'speed_up': 'Acelerar',
    'speed_down': 'Ralentizar',
    'font_size_up': 'Aumentar Fuente',
    'font_size_down': 'Disminuir Fuente',
    'scroll_up': 'Subir',
    'scroll_down': 'Bajar'
  };

  const formatKey = (key: string): string => {
    if (key === ' ') return 'Espacio';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowRight') return '→';
    return key;
  };

  return (
    <div className="absolute top-8 right-0 z-50">
      <Card className="w-80 bg-gray-700 border-gray-600 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-white" />
              <CardTitle className="text-white text-sm">Atajos de Teclado</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {macros.map((macro, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                    {formatKey(macro.key)}
                  </kbd>
                  <span className="text-gray-300 text-sm">
                    {actionLabels[macro.action] || macro.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-3 border-t border-gray-600">
            <Button
              onClick={() => {
                onClose();
                onOpenFullConfig();
              }}
              variant="outline"
              size="sm"
              className="w-full text-xs border-gray-600 text-white bg-gray-800 hover:bg-gray-600"
            >
              <Settings className="h-3 w-3 mr-2" />
              Configurar Atajos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}