// ...existing code...
// Importaciones de React
import React from "react";

// Importaciones de componentes UI
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Importaciones de tipos y utilidades de macros
import { MacroSettings as MacroSettingsType, getKeyDisplayName, availableKeys } from "./useMacros";

/**
 * Props del componente MacroSettings
 * 
 * @property {MacroSettingsType} macroSettings - Configuración actual de macros/atajos de teclado
 * @property {function} onMacroSettingsChange - Callback ejecutado cuando cambia la configuración de macros
 */
interface MacroSettingsProps {
  macroSettings: MacroSettingsType;
  onMacroSettingsChange: (settings: MacroSettingsType) => void;
}

/**
 * MacroSettings - Componente de configuración de atajos de teclado (macros)
 * 
 * Panel de configuración que permite al usuario personalizar los atajos de teclado
 * para controlar el teleprompter. Muestra un selector por cada acción disponible
 * y un resumen visual de todos los atajos configurados.
 * 
 * Características:
 * - Selectores dropdown para asignar teclas a acciones
 * - Vista previa en tiempo real de los cambios
 * - Resumen visual con elementos <kbd> estilizados
 * - Descripciones de cada acción
 * - Validación de teclas disponibles
 * 
 * @component
 * @param {MacroSettingsProps} props - Propiedades del componente
 * @returns {JSX.Element} Panel de configuración de macros
 */
export function MacroSettings({ macroSettings, onMacroSettingsChange }: MacroSettingsProps) {
  /**
   * Maneja el cambio de una tecla asignada a una acción
   * Crea un nuevo objeto de configuración con la tecla actualizada
   * 
   * @param {keyof MacroSettingsType} action - Acción a modificar
   * @param {string} keyCode - Código de la nueva tecla asignada
   */
  const handleMacroChange = (action: keyof MacroSettingsType, keyCode: string) => {
    onMacroSettingsChange({
      ...macroSettings,
      [action]: keyCode
    });
  };

  /**
   * Array de acciones disponibles para configurar
   * Define las acciones del teleprompter que pueden tener atajos de teclado asignados.
   * 
   * Cada objeto contiene:
   * - action: Identificador de la acción (key de MacroSettingsType)
   * - label: Etiqueta visible para el usuario
   * - description: Descripción breve en inglés de la funcionalidad
   */
  const macroActions: { action: keyof MacroSettingsType; label: string; description: string }[] = [
    { action: 'playStop', label: 'Play/Stop', description: 'Start or stop teleprompter' },
    { action: 'pause', label: 'Pause', description: 'Pause teleprompter' },
    { action: 'previousScript', label: 'Previous Script', description: 'Go to previous script in run order' },
    { action: 'nextScript', label: 'Next Script', description: 'Go to next script in run order' },
    { action: 'increaseSpeed', label: 'Increase Speed', description: 'Increase scroll speed' },
    { action: 'decreaseSpeed', label: 'Decrease Speed', description: 'Decrease scroll speed' }
  ];

  return (
    <Card>
      {/* ===== HEADER DEL PANEL ===== */}
      <CardHeader>
        <CardTitle>Keyboard Macros</CardTitle>
      </CardHeader>
      
      {/* ===== CONTENIDO DEL PANEL ===== */}
      <CardContent className="space-y-4">
        {/* Descripción general del panel */}
        <p className="text-sm text-muted-foreground">
          Configure keyboard shortcuts for teleprompter control. These work globally when not typing in text fields.
        </p>

        {/* ===== LISTA DE CONFIGURADORES DE MACROS ===== */}
        {/* Itera sobre cada acción para crear un selector de tecla */}
        {macroActions.map(({ action, label, description }) => {
          // Obtener el valor actual de la tecla asignada
          const rawValue = macroSettings[action];
          const currentValue = (rawValue ?? '') as string;
          
          return (
            <div key={String(action)} className="space-y-2">
              {/* Etiqueta de la acción */}
              <Label htmlFor={`macro-${String(action)}`}>{label}</Label>
              
              {/* Descripción de la acción */}
              <p className="text-xs text-muted-foreground">{description}</p>
              
              {/* ===== SELECTOR DE TECLA ===== */}
              {/* Dropdown para seleccionar la tecla a asignar */}
              <Select
                value={currentValue}
                onValueChange={(value: string) => handleMacroChange(action, value)}
              >
                <SelectTrigger id={`macro-${String(action)}`}>
                  <SelectValue placeholder="Select a key">
                    {/* Muestra el nombre legible de la tecla o un guion si no hay ninguna */}
                    {getKeyDisplayName(currentValue) || '—'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {/* Lista de todas las teclas disponibles */}
                  {availableKeys.map((keyCode) => (
                    <SelectItem key={keyCode} value={keyCode}>
                      {getKeyDisplayName(keyCode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}

        {/* ===== RESUMEN DE ATAJOS CONFIGURADOS ===== */}
        {/* Panel informativo que muestra todos los atajos actuales de forma condensada */}
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Current Shortcuts:</h4>
          <div className="text-xs space-y-1">
            {macroActions.map(({ action, label }) => (
              <div key={`summary-${String(action)}`} className="flex justify-between">
                {/* Nombre de la acción */}
                <span>{label}:</span>
                {/* Tecla asignada en formato <kbd> (estilo tecla de teclado) */}
                <kbd className="px-2 py-1 bg-background border rounded text-xs">
                  {getKeyDisplayName((macroSettings[action] ?? '') as string)}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}