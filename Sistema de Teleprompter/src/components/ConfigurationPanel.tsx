import { useState } from 'react';
import { MacroSettings, defaultMacroSettings, availableKeys, getKeyDisplayName } from './useMacros';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Settings, Keyboard } from 'lucide-react';



interface ConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  macros: MacroSettings;
  onMacrosChange: (macros: MacroSettings) => void;
}


export function ConfigurationPanel({ isOpen, onClose, macros, onMacrosChange }: ConfigurationPanelProps) {
  const macroFields: { key: keyof MacroSettings; label: string; description: string }[] = [
    { key: 'playStop', label: 'Play/Stop', description: 'Iniciar o detener el teleprompter' },
    { key: 'pause', label: 'Pausar', description: 'Pausar el teleprompter' },
    { key: 'previousScript', label: 'Script Anterior', description: 'Ir al script anterior' },
    { key: 'nextScript', label: 'Siguiente Script', description: 'Ir al siguiente script' },
    { key: 'increaseSpeed', label: 'Aumentar Velocidad', description: 'Aumentar velocidad de scroll' },
    { key: 'decreaseSpeed', label: 'Disminuir Velocidad', description: 'Disminuir velocidad de scroll' },
    { key: 'increaseFontSize', label: 'Aumentar Tamaño', description: 'Aumentar tamaño de fuente' },
    { key: 'decreaseFontSize', label: 'Disminuir Tamaño', description: 'Disminuir tamaño de fuente' },
    { key: 'nextCue', label: 'Avanzar Guion', description: 'Avanzar al siguiente guion/cue' },
    { key: 'previousCue', label: 'Retroceder Guion', description: 'Retroceder al guion/cue anterior' },
  ];

  const [tempMacros, setTempMacros] = useState<MacroSettings>(macros);

  const handleMacroChange = (field: keyof MacroSettings, value: string) => {
    setTempMacros(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onMacrosChange(tempMacros);
    onClose();
  };

  const handleCancel = () => {
    setTempMacros(macros);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-[600px] h-[500px] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-white" />
            <h2 className="text-white font-medium">Configuración de Macros</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-120px)] bg-gray-800">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Configuración de Atajos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-300 font-medium border-b border-gray-600 pb-2">
                <div>Acción</div>
                <div>Tecla</div>
                <div>Descripción</div>
              </div>
              {macroFields.map(({ key, label, description }) => (
                <div key={key} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-white text-sm">{label}</span>
                  <Select
                    value={tempMacros[key] || ''}
                    onValueChange={(value: string) => handleMacroChange(key, value)}
                  >
                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white text-sm">
                      <SelectValue>{getKeyDisplayName(tempMacros[key] || '')}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-600 border-gray-500">
                      {availableKeys.map((k) => (
                        <SelectItem key={k} value={k} className="text-white">
                          {getKeyDisplayName(k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-400 text-xs">{description}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 px-4 py-3 border-t border-gray-700 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  );
}