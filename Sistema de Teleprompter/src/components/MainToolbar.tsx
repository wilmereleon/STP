// Importaciones de componentes UI
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

// Importaciones de íconos de Lucide
import { 
  Play,          // Reproducir
  Pause,         // Pausar
  Square,        // Detener
  SkipBack,      // Anterior
  SkipForward,   // Siguiente
  Volume2,       // Volumen/Audio
  Settings,      // Configuración
  Maximize2,     // Pantalla completa
  Save,          // Guardar
  FolderOpen     // Abrir archivo
} from "lucide-react";

/**
 * Props del componente MainToolbar
 * 
 * @property {boolean} isPlaying - Indica si el teleprompter está reproduciendo
 * @property {string} currentTime - Tiempo actual de reproducción (formato "MM:SS")
 * @property {function} onPlay - Callback para iniciar la reproducción
 * @property {function} onPause - Callback para pausar la reproducción
 * @property {function} onStop - Callback para detener completamente la reproducción
 * @property {function} onPrevious - Callback para ir al script anterior
 * @property {function} onNext - Callback para ir al script siguiente
 * @property {function} onSettings - Callback para abrir configuración
 * @property {function} onFullscreen - Callback para activar pantalla completa
 * @property {function} onSave - Callback para guardar el trabajo actual
 * @property {function} onOpen - Callback para abrir un archivo
 * @property {boolean} isPrompting - Indica si el teleprompter está activo/visible
 */
interface MainToolbarProps {
  isPlaying: boolean;
  currentTime: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSettings: () => void;
  onFullscreen: () => void;
  onSave: () => void;
  onOpen: () => void;
  isPrompting: boolean;
}

/**
 * MainToolbar - Barra de herramientas principal de la aplicación
 * 
 * Componente que proporciona los controles principales del teleprompter,
 * organizados en tres secciones:
 * 
 * 1. **Sección Izquierda**: Operaciones de archivo (Abrir, Guardar)
 * 2. **Sección Central**: Controles de transporte (Play, Pause, Stop, Anterior, Siguiente)
 *                         y visualización de tiempo
 * 3. **Sección Derecha**: Estado (indicador PROMPTING), Pantalla completa y Configuración
 * 
 * Características:
 * - Diseño de tres columnas con distribución espaciada
 * - Indicador visual de estado de prompting (pulsante)
 * - Controles tipo reproductor multimedia
 * - Separadores visuales entre secciones
 * - Botones con íconos intuitivos
 * 
 * @component
 * @param {MainToolbarProps} props - Propiedades del componente
 * @returns {JSX.Element} Barra de herramientas principal
 */
export function MainToolbar({
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onStop,
  onPrevious,
  onNext,
  onSettings,
  onFullscreen,
  onSave,
  onOpen,
  isPrompting
}: MainToolbarProps) {
  return (
    // Contenedor principal con fondo semi-transparente y borde inferior
    <div className="bg-muted/30 border-b px-4 py-2">
      <div className="flex items-center justify-between">
        
        {/* ===== SECCIÓN IZQUIERDA: OPERACIONES DE ARCHIVO ===== */}
        <div className="flex items-center gap-2">
          {/* Botón Abrir archivo */}
          <Button variant="outline" size="sm" onClick={onOpen}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Open
          </Button>
          
          {/* Botón Guardar */}
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          {/* Separador vertical */}
          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* ===== SECCIÓN CENTRAL: CONTROLES DE TRANSPORTE ===== */}
        <div className="flex items-center gap-2">
          {/* Botón Script Anterior */}
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <SkipBack className="w-4 h-4" />
          </Button>
          
          {/* Botón Play/Pause (alterna según el estado) */}
          {isPlaying ? (
            // Si está reproduciendo, mostrar botón Pause
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="w-4 h-4" />
            </Button>
          ) : (
            // Si está pausado/detenido, mostrar botón Play
            <Button variant="outline" size="sm" onClick={onPlay}>
              <Play className="w-4 h-4" />
            </Button>
          )}
          
          {/* Botón Stop (detener completamente) */}
          <Button variant="outline" size="sm" onClick={onStop}>
            <Square className="w-4 h-4" />
          </Button>
          
          {/* Botón Script Siguiente */}
          <Button variant="outline" size="sm" onClick={onNext}>
            <SkipForward className="w-4 h-4" />
          </Button>
          
          {/* Separador vertical */}
          <Separator orientation="vertical" className="h-6" />
          
          {/* Indicador de tiempo con ícono de volumen */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            {/* Tiempo en formato monoespaciado con ancho mínimo para evitar saltos */}
            <span className="text-sm font-mono min-w-[60px]">{currentTime}</span>
          </div>
        </div>

        {/* ===== SECCIÓN DERECHA: ESTADO Y CONFIGURACIÓN ===== */}
        <div className="flex items-center gap-2">
          {/* Badge PROMPTING (solo visible cuando isPrompting=true) */}
          {isPrompting && (
            <Badge variant="destructive" className="animate-pulse">
              PROMPTING
            </Badge>
          )}
          
          {/* Separador vertical */}
          <Separator orientation="vertical" className="h-6" />
          
          {/* Botón Pantalla Completa */}
          <Button variant="outline" size="sm" onClick={onFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          {/* Botón Configuración */}
          <Button variant="outline" size="sm" onClick={onSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}