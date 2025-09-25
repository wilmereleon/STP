import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Settings, Keyboard } from 'lucide-react';
import { MacroSettings, getKeyDisplayName } from './useMacros';

interface MacroMenuProps {
  isOpen: boolean;
  onClose: () => void;
  macros: MacroSettings;
  onOpenFullConfig: () => void;
}

const macroFields: { key: keyof MacroSettings; label: string; description: string }[] = [
  { key: 'playStop', label: 'Play/Stop', description: 'Iniciar o detener el teleprompter' },
  { key: 'pause', label: 'Pausar', description: 'Pausar el teleprompter' },
  { key: 'previousScript', label: 'Script Anterior', description: 'Ir al script anterior' },
  { key: 'nextScript', label: 'Siguiente Script', description: 'Ir al siguiente script' },
  { key: 'increaseSpeed', label: 'Aumentar Velocidad', description: 'Aumentar velocidad de scroll' },
  { key: 'decreaseSpeed', label: 'Disminuir Velocidad', description: 'Disminuir velocidad de scroll' },
  { key: 'increaseFontSize', label: 'Aumentar Tamaño Fuente', description: 'Aumentar el tamaño de la fuente' },
  { key: 'decreaseFontSize', label: 'Disminuir Tamaño Fuente', description: 'Disminuir el tamaño de la fuente' },
  { key: 'nextCue', label: 'Siguiente Cue', description: 'Avanzar al siguiente marcador/cue' },
  { key: 'previousCue', label: 'Cue Anterior', description: 'Retroceder al marcador/cue anterior' },
];

export function MacroMenu({ 
  isOpen, 
  onClose, 
  macros,
  onOpenFullConfig
}: MacroMenuProps) {
  if (!isOpen) return null;

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
            {macroFields.map(({ key, label, description }) => (
              <div 
                key={key}
                className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-semibold">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-900 bg-gray-100 border border-gray-300 rounded-lg">
                    {getKeyDisplayName(macros[key] ?? '') || '—'}
                  </kbd>
                  <span className="text-gray-400 text-xs">{description}</span>
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