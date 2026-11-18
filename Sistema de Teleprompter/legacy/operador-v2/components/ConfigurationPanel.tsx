// Importaciones de React
import { useState } from 'react';

// Importaciones de configuración de macros y tipos
import { MacroSettings, defaultMacroSettings, availableKeys, getKeyDisplayName } from './useMacros';

// Importaciones de componentes UI
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Importaciones de íconos
import { X, Settings, Keyboard } from 'lucide-react';

/**
 * Interface que define las propiedades del componente ConfigurationPanel
 * 
 * @property {boolean} isOpen - Indica si el panel de configuración está visible
 * @property {function} onClose - Callback que se ejecuta al cerrar el panel
 * @property {MacroSettings} macros - Objeto con la configuración actual de macros/atajos de teclado
 * @property {function} onMacrosChange - Callback que se ejecuta al guardar los cambios de macros
 */
interface ConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  macros: MacroSettings;
  onMacrosChange: (macros: MacroSettings) => void;
}

/**
 * ConfigurationPanel - Panel modal para configurar atajos de teclado (macros)
 * 
 * Este componente renderiza un modal con una lista de acciones configurables
 * donde el usuario puede asignar teclas personalizadas a cada acción del teleprompter.
 * 
 * @component
 * @param {ConfigurationPanelProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Modal de configuración o null si está cerrado
 */
export function ConfigurationPanel({ isOpen, onClose, macros, onMacrosChange }: ConfigurationPanelProps) {
  /**
   * Array que define todos los campos de macros configurables
   * Cada objeto contiene:
   * - key: Identificador único de la acción (debe coincidir con MacroSettings)
   * - label: Etiqueta visible para el usuario
   * - description: Descripción breve de la funcionalidad
   */
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

  /**
   * Estado local temporal para almacenar los cambios de macros antes de guardarlos
   * Permite cancelar los cambios sin afectar la configuración actual
   */
  const [tempMacros, setTempMacros] = useState<MacroSettings>(macros);

  /**
   * Maneja el cambio de una tecla asignada a una acción específica
   * 
   * @param {keyof MacroSettings} field - Campo de la macro a modificar
   * @param {string} value - Nueva tecla asignada
   */
  const handleMacroChange = (field: keyof MacroSettings, value: string) => {
    setTempMacros(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Guarda los cambios realizados y cierra el modal
   * Ejecuta el callback onMacrosChange con la nueva configuración
   */
  const handleSave = () => {
    onMacrosChange(tempMacros);
    onClose();
  };

  /**
   * Cancela los cambios y cierra el modal
   * Restaura el estado temporal a la configuración original
   */
  const handleCancel = () => {
    setTempMacros(macros);
    onClose();
  };

  // Si el panel no está abierto, no renderiza nada
  // Si el panel no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    // Overlay oscuro que cubre toda la pantalla con z-index alto para aparecer encima de todo
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Contenedor principal del modal con tamaño fijo */}
      <div className="bg-gray-800 rounded-lg shadow-2xl w-[600px] h-[500px] overflow-hidden">
        
        {/* ===== HEADER DEL MODAL ===== */}
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          {/* Título con ícono */}
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-white" />
            <h2 className="text-white font-medium">Configuración de Macros</h2>
          </div>
          
          {/* Botón de cerrar (X) */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ===== CONTENIDO PRINCIPAL ===== */}
        {/* Área scrolleable con altura calculada restando header y footer */}
        <div className="p-4 overflow-y-auto h-[calc(100%-120px)] bg-gray-800">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Configuración de Atajos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Encabezados de las columnas */}
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-300 font-medium border-b border-gray-600 pb-2">
                <div>Acción</div>
                <div>Tecla</div>
                <div>Descripción</div>
              </div>
              
              {/* Iteración sobre cada campo de macro para renderizar su configuración */}
              {macroFields.map(({ key, label, description }) => (
                <div key={key} className="grid grid-cols-3 gap-2 items-center">
                  {/* Columna 1: Nombre de la acción */}
                  <span className="text-white text-sm">{label}</span>
                  
                  {/* Columna 2: Selector de tecla (dropdown) */}
                  <Select
                    value={tempMacros[key] || ''}
                    onValueChange={(value: string) => handleMacroChange(key, value)}
                  >
                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white text-sm">
                      <SelectValue>{getKeyDisplayName(tempMacros[key] || '')}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-600 border-gray-500">
                      {/* Lista de todas las teclas disponibles */}
                      {availableKeys.map((k) => (
                        <SelectItem key={k} value={k} className="text-white">
                          {getKeyDisplayName(k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Columna 3: Descripción de la acción */}
                  <span className="text-gray-400 text-xs">{description}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ===== FOOTER CON BOTONES DE ACCIÓN ===== */}
        <div className="bg-gray-900 px-4 py-3 border-t border-gray-700 flex justify-end gap-2">
          {/* Botón para cancelar y cerrar sin guardar */}
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
          >
            Cancelar
          </Button>
          
          {/* Botón para guardar la configuración y cerrar */}
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