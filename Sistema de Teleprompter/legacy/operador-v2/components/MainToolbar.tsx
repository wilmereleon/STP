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
    // Responsive: padding reducido en móviles, flex-wrap para ajustar elementos
    <div className="bg-muted/30 border-b px-2 sm:px-4 py-1 sm:py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* ===== SECCIÓN IZQUIERDA: OPERACIONES DE ARCHIVO ===== */}
        {/* Responsive: ocultar texto en móviles (sm:mr-2), solo mostrar íconos */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botón Abrir archivo */}
          <Button variant="outline" size="sm" onClick={onOpen} className="px-2 sm:px-3">
            <FolderOpen className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Open</span>
          </Button>
          
          {/* Botón Guardar */}
          <Button variant="outline" size="sm" onClick={onSave} className="px-2 sm:px-3">
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          
          {/* Separador vertical - ocultar en móviles */}
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
        </div>

        {/* ===== SECCIÓN CENTRAL: CONTROLES DE TRANSPORTE ===== */}
        {/* Responsive: gap reducido en móviles, prioridad central */}
        <div className="flex items-center gap-1 sm:gap-2">
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
          
          {/* Separador vertical - ocultar en móviles */}
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          {/* Indicador de tiempo con ícono de volumen */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground hidden sm:block" />
            {/* Tiempo en formato monoespaciado con ancho mínimo para evitar saltos */}
            <span className="text-xs sm:text-sm font-mono min-w-[50px] sm:min-w-[60px]">{currentTime}</span>
          </div>
        </div>

        {/* ===== SECCIÓN DERECHA: ESTADO Y CONFIGURACIÓN ===== */}
        {/* Responsive: gap reducido, badge más pequeño en móviles */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Badge PROMPTING (solo visible cuando isPrompting=true) */}
          {isPrompting && (
            <Badge variant="destructive" className="animate-pulse text-xs">
              PROMPTING
            </Badge>
          )}
          
          {/* Separador vertical - ocultar en móviles */}
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
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