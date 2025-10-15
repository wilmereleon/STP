// ===== IMPORTACIONES / IMPORTS =====
// Iconos de Lucide React / Lucide React icons
import { Target, Zap } from 'lucide-react';
// Componente de botón / Button component
import { Button } from './ui/button';

/**
 * Props del componente TextWithJumpMarkers
 * TextWithJumpMarkers component props
 * 
 * @interface TextWithJumpMarkersProps
 * @property {string} text - Texto del guion a renderizar / Script text to render
 * @property {(position: number) => void} [onJumpToPosition] - Callback opcional para saltar a posición / Optional callback to jump to position
 * @property {number} [fontSize=16] - Tamaño de fuente en píxeles / Font size in pixels
 * @property {string} [className=""] - Clases CSS adicionales / Additional CSS classes
 * @property {React.CSSProperties} [style={}] - Estilos en línea adicionales / Additional inline styles
 * @property {boolean} [showJumpIcons=true] - Mostrar iconos de salto en marcadores / Show jump icons on markers
 */
interface TextWithJumpMarkersProps {
  text: string;
  onJumpToPosition?: (position: number) => void;
  fontSize?: number;
  className?: string;
  style?: React.CSSProperties;
  showJumpIcons?: boolean;
}

/**
 * TextWithJumpMarkers - Renderizador de texto con marcadores de salto
 * TextWithJumpMarkers - Text renderer with jump markers
 * 
 * Componente que renderiza texto con marcadores interactivos que permiten
 * saltar rápidamente a secciones específicas del guion. Detecta diferentes
 * tipos de marcadores y muestra iconos de navegación apropiados.
 * 
 * Component that renders text with interactive markers that allow
 * quick jumping to specific script sections. Detects different types
 * of markers and displays appropriate navigation icons.
 * 
 * Tipos de marcadores detectados / Types of markers detected:
 * 1. **Numerados**: [1], [2], ... (icono Zap amarillo)
 * 2. **Markdown**: # Título, ## Subtítulo, ### Sub-subtítulo (icono Target azul)
 * 3. **Mayúsculas**: TÍTULO: (icono Target azul)
 * 4. **Negrita**: **Texto** (icono Target azul)
 * 
 * Características / Features:
 * - Detección automática de 4 tipos de marcadores / Automatic detection of 4 marker types
 * - Iconos de navegación con hover effects / Navigation icons with hover effects
 * - Opacidad adaptativa (visible al hover) / Adaptive opacity (visible on hover)
 * - Cálculo preciso de posiciones de caracteres / Precise character position calculation
 * - Modo sin iconos para vista limpia / Icon-less mode for clean view
 * - Preserva espacios en blanco con \u00A0 / Preserves whitespace with \u00A0
 * 
 * @component
 * @param {TextWithJumpMarkersProps} props - Props del componente / Component props
 * @returns {JSX.Element} Texto renderizado con marcadores / Rendered text with markers
 */
export function TextWithJumpMarkers({ 
  text, 
  onJumpToPosition, 
  fontSize = 16, 
  className = "", 
  style = {},
  showJumpIcons = true 
}: TextWithJumpMarkersProps) {
  
  // ===== FUNCIÓN: RENDERIZAR TEXTO CON MARCADORES / FUNCTION: RENDER TEXT WITH MARKERS =====
  /**
   * Renderiza el texto línea por línea, detectando y añadiendo iconos de salto
   * Renders text line by line, detecting and adding jump icons
   * 
   * Algoritmo / Algorithm:
   * 1. Si showJumpIcons=false u onJumpToPosition no existe → renderizado simple
   * 2. Divide texto en líneas / Split text into lines
   * 3. Mantiene contador de posición de caracteres / Maintains character position counter
   * 4. Por cada línea:
   *    - Calcula posición inicial de la línea
   *    - Detecta tipo de marcador (numerado, markdown, mayúsculas, negrita)
   *    - Renderiza con icono apropiado o como línea regular
   * 5. Incrementa contador (+1 por salto de línea) / Increments counter (+1 for newline)
   * 
   * @returns {JSX.Element[]} Array de elementos div con las líneas / Array of div elements with lines
   */
  const renderTextWithJumpMarkers = () => {
    // ===== CASO 1: RENDERIZADO SIMPLE SIN ICONOS / CASE 1: SIMPLE RENDERING WITHOUT ICONS =====
    if (!showJumpIcons || !onJumpToPosition) {
      // Renderizado original sin iconos / Original rendering without icons
      return text.split('\n').map((line, index) => (
        <div key={index} className="leading-relaxed mb-4 transition-all duration-200">
          {line.trim() || '\u00A0'} {/* \u00A0 = espacio no separable para líneas vacías / non-breaking space for empty lines */}
        </div>
      ));
    }

    // ===== CASO 2: RENDERIZADO CON ICONOS DE SALTO / CASE 2: RENDERING WITH JUMP ICONS =====
    const lines = text.split('\n'); // Dividir en líneas / Split into lines
    let currentPosition = 0; // Contador de posición de caracteres / Character position counter

    return lines.map((line, lineIndex) => {
      // Guardar posición inicial de esta línea / Save starting position of this line
      const lineStartPosition = currentPosition;
      currentPosition += line.length + 1; // +1 por el salto de línea / +1 for newline

      // ===== DETECCIÓN TIPO 1: MARCADORES NUMERADOS [1], [2], ... / DETECTION TYPE 1: NUMBERED MARKERS =====
      /**
       * Detecta marcadores con formato: [número]texto
       * Detects markers with format: [number]text
       * 
       * Ejemplo / Example: "[1] Introducción del programa"
       * Captura / Captures:
       * - fullMarker: "[1]"
       * - markerNumber: "1"
       * - restOfLine: " Introducción del programa"
       */
      const markerMatch = line.match(/^(\[(\d+)\])(.*)/);

      if (markerMatch) {
        const [, fullMarker, markerNumber, restOfLine] = markerMatch;

        return (
          <div key={`marker-${lineIndex}`} className="leading-relaxed mb-4 transition-all duration-200 flex items-start gap-1 group">
            {/* Marcador + Icono Zap amarillo / Marker + Yellow Zap icon */}
            <span className="shrink-0">
              {fullMarker}
              <Button
                size="sm"
                variant="ghost"
                className="ml-1 p-0 h-4 w-4 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation(); // Prevenir propagación / Prevent propagation
                  onJumpToPosition(lineStartPosition); // Saltar a esta posición / Jump to this position
                }}
                title={`⚡ Saltar a sección ${markerNumber}`}
                type="button"
                aria-label={`Saltar a sección ${markerNumber}`}
              >
                <Zap className="h-2.5 w-2.5" /> {/* Icono de rayo / Lightning icon */}
              </Button>
            </span>
            <span className="flex-1">{restOfLine}</span>
          </div>
        );
      }

      // ===== DETECCIÓN TIPO 2, 3, 4: OTROS MARCADORES / DETECTION TYPE 2, 3, 4: OTHER MARKERS =====
      /**
       * Detecta otros tipos de marcadores de sección:
       * Detects other types of section markers:
       * 
       * 1. Markdown headings: # Título, ## Subtítulo, ### Sub-subtítulo
       * 2. Texto en mayúsculas con dos puntos: TÍTULO:
       * 3. Texto en negrita markdown: **Texto**
       * 
       * Regex breakdown:
       * - #{1,3}\s+(.+)  → 1 a 3 # seguidos de espacio y texto
       * - [A-Z][A-Z\s]+: → Mayúsculas con espacios y dos puntos al final
       * - ^\*\*(.+)\*\*  → Texto entre ** al inicio de línea
       */
      const titleMatch = line.match(/^(#{1,3}\s+(.+)|[A-Z][A-Z\s]+:|^\*\*(.+)\*\*)/);
      
      if (titleMatch && line.trim().length > 0) {
        return (
          <div key={`title-${lineIndex}`} className="leading-relaxed mb-4 transition-all duration-200 flex items-start gap-1 group">
            <span className="flex-1">{line}</span>
            {/* Icono Target azul / Blue Target icon */}
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 p-0 h-4 w-4 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 inline-flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation(); // Prevenir propagación / Prevent propagation
                onJumpToPosition(lineStartPosition); // Saltar a esta posición / Jump to this position
              }}
              title={`🎯 Saltar a: ${line.trim().substring(0, 30)}`} // Título truncado a 30 chars / Title truncated to 30 chars
              type="button"
              aria-label={`Saltar a ${line.trim().substring(0, 30)}`}
            >
              <Target className="h-2.5 w-2.5" /> {/* Icono de objetivo / Target icon */}
            </Button>
          </div>
        );
      }

      // ===== LÍNEA REGULAR SIN MARCADOR / REGULAR LINE WITHOUT MARKER =====
      // Mantener estructura original / Maintain original structure
      return (
        <div key={`line-${lineIndex}`} className="leading-relaxed mb-4 transition-all duration-200">
          {line.trim() || '\u00A0'} {/* \u00A0 preserva líneas vacías / \u00A0 preserves empty lines */}
        </div>
      );
    });
  };

  // ===== RENDERIZADO DEL COMPONENTE / COMPONENT RENDERING =====
  return (
    // Contenedor con clases y estilos personalizables / Container with customizable classes and styles
    <div 
      className={`${className}`}
      style={{ 
        ...style // Spread de estilos personalizados / Spread custom styles
      }}
    >
      {renderTextWithJumpMarkers()} {/* Renderizar contenido / Render content */}
    </div>
  );
}