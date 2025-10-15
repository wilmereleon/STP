// Importaciones de componentes UI
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Importaciones de íconos
import { X, Settings, Keyboard } from 'lucide-react';

// Importaciones de tipos y utilidades de macros
import { MacroSettings, getKeyDisplayName } from './useMacros';

/**
 * Props del componente MacroMenu
 * 
 * @property {boolean} isOpen - Indica si el menú está visible
 * @property {function} onClose - Callback que se ejecuta al cerrar el menú
 * @property {MacroSettings} macros - Objeto con la configuración actual de macros/atajos
 * @property {function} onOpenFullConfig - Callback para abrir el panel de configuración completa
 */
interface MacroMenuProps {
  isOpen: boolean;
  onClose: () => void;
  macros: MacroSettings;
  onOpenFullConfig: () => void;
}

/**
 * Definición de los campos de macros a mostrar en el menú
 * Array constante que define todas las acciones disponibles con sus etiquetas y descripciones.
 * 
 * Cada objeto contiene:
 * - key: Identificador de la macro (debe coincidir con MacroSettings)
 * - label: Etiqueta corta para mostrar al usuario
 * - description: Descripción breve de la funcionalidad
 */
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

/**
 * MacroMenu - Menú flotante de visualización de atajos de teclado
 * 
 * Componente que muestra un panel emergente con la lista de todos los atajos
 * de teclado (macros) configurados actualmente. Permite al usuario ver rápidamente
 * qué teclas están asignadas a cada acción sin tener que abrir el panel de
 * configuración completo.
 * 
 * Características:
 * - Lista scrolleable de todos los atajos configurados
 * - Visualización de teclas en formato kbd (estilo tecla de teclado)
 * - Botón para acceder a la configuración completa
 * - Panel posicionado absolutamente (esquina superior derecha)
 * - Solo lectura (no permite edición directa)
 * 
 * @component
 * @param {MacroMenuProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Menú de macros o null si está cerrado
 */
export function MacroMenu({ 
  isOpen, 
  onClose, 
  macros,
  onOpenFullConfig
}: MacroMenuProps) {
  // Si el menú no está abierto, no renderiza nada
  // Si el menú no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    // Contenedor principal posicionado absolutamente en la esquina superior derecha
    <div className="absolute top-8 right-0 z-50">
      <Card className="w-80 bg-gray-700 border-gray-600 shadow-2xl">
        
        {/* ===== HEADER DEL MENÚ ===== */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* Título con ícono de teclado */}
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-white" />
              <CardTitle className="text-white text-sm">Atajos de Teclado</CardTitle>
            </div>
            
            {/* Botón de cerrar (X) */}
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
        
        {/* ===== CONTENIDO DEL MENÚ ===== */}
        <CardContent className="space-y-3">
          
          {/* ===== LISTA DE ATAJOS ===== */}
          {/* Contenedor scrolleable para la lista de macros */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {macroFields.map(({ key, label, description }) => (
              <div 
                key={key}
                className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-md"
              >
                {/* Nombre de la acción */}
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-semibold">{label}</span>
                </div>
                
                {/* Tecla asignada y descripción */}
                <div className="flex items-center gap-2">
                  {/* Visualización de la tecla en estilo kbd (tecla de teclado) */}
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-900 bg-gray-100 border border-gray-300 rounded-lg">
                    {getKeyDisplayName(macros[key] ?? '') || '—'}
                  </kbd>
                  {/* Descripción breve de la acción */}
                  <span className="text-gray-400 text-xs">{description}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* ===== BOTÓN DE CONFIGURACIÓN ===== */}
          {/* Separador y botón para abrir el panel de configuración completa */}
          <div className="pt-3 border-t border-gray-600">
            <Button
              onClick={() => {
                onClose(); // Cerrar este menú
                onOpenFullConfig(); // Abrir panel de configuración completa
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