// Importaciones de React
import React from "react";

// Importaciones de componentes UI
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";

// Importaciones de íconos de Lucide para la barra de herramientas
import { 
  Bold,           // Negrita
  Italic,         // Cursiva
  Underline,      // Subrayado
  AlignLeft,      // Alinear izquierda
  AlignCenter,    // Alinear centro
  AlignRight,     // Alinear derecha
  Undo,           // Deshacer
  Redo,           // Rehacer
  Copy,           // Copiar
  Clipboard,      // Pegar
  FileText,       // Nuevo archivo
  Type,           // Tamaño de texto
  Palette,        // Color de texto
  CaseUpper,      // Mayúsculas
  CaseLower       // Minúsculas
} from "lucide-react";

/**
 * Props del componente EditorToolbar
 * 
 * @property {function} onAction - Callback que se ejecuta cuando se realiza una acción en la barra de herramientas
 *                                 Recibe el nombre de la acción y opcionalmente un valor
 * @property {string} currentFont - Fuente tipográfica actual seleccionada en el editor
 * @property {number} currentSize - Tamaño de fuente actual seleccionado en el editor
 */
interface EditorToolbarProps {
  onAction: (action: string, value?: any) => void;
  currentFont: string;
  currentSize: number;
}

/**
 * EditorToolbar - Barra de herramientas del editor de scripts
 * 
 * Componente que proporciona una interfaz completa de herramientas de edición
 * de texto similar a un procesador de textos. Incluye opciones para:
 * - Operaciones de archivo (nuevo)
 * - Deshacer/Rehacer
 * - Copiar/Pegar
 * - Formato de texto (negrita, cursiva, subrayado)
 * - Selección de fuente y tamaño
 * - Alineación de texto
 * - Color de texto
 * - Transformación de mayúsculas/minúsculas
 * - Teclas rápidas numéricas (1-0) para marcadores
 * 
 * @component
 * @param {EditorToolbarProps} props - Propiedades del componente
 * @returns {JSX.Element} Barra de herramientas del editor
 */
export function EditorToolbar({ onAction, currentFont, currentSize }: EditorToolbarProps) {
  /**
   * Array de tamaños de fuente disponibles (en píxeles)
   * Rangos desde texto pequeño (8px) hasta títulos grandes (96px)
   */
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
  
  /**
   * Array de familias de fuentes disponibles
   * Incluye fuentes comunes web-safe que funcionan en todos los navegadores
   */
  const fontFamilies = [
    "Arial",
    "Times New Roman", 
    "Helvetica",
    "Georgia",
    "Verdana",
    "Courier New",
    "Tahoma",
    "Impact"
  ];

  return (
    // Contenedor principal de la barra de herramientas con fondo gris claro
    <div className="bg-gray-100 border-b border-gray-300 px-2 py-1 flex items-center gap-1 text-sm">
      
      {/* ===== OPERACIONES DE ARCHIVO ===== */}
      {/* Botón para crear un nuevo documento/script */}
      <Button size="sm" variant="ghost" onClick={() => onAction('new')}>
        <FileText className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />

      {/* ===== DESHACER/REHACER ===== */}
      {/* Botones para deshacer y rehacer cambios en el editor */}
      <Button size="sm" variant="ghost" onClick={() => onAction('undo')}>
        <Undo className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('redo')}>
        <Redo className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== COPIAR/PEGAR ===== */}
      {/* Operaciones de portapapeles para copiar y pegar texto */}
      <Button size="sm" variant="ghost" onClick={() => onAction('copy')}>
        <Copy className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('paste')}>
        <Clipboard className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== SELECCIÓN DE FUENTE ===== */}
      {/* Dropdown para seleccionar la familia de fuente */}
      <Select value={currentFont} onValueChange={(value: string) => onAction('fontFamily', value)}>
        <SelectTrigger className="w-24 h-7 text-xs">
          <SelectValue>{String(currentFont)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font} value={font} className="text-xs">
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ===== SELECCIÓN DE TAMAÑO DE FUENTE ===== */}
      {/* Dropdown para seleccionar el tamaño de fuente en píxeles */}
      <Select value={currentSize.toString()} onValueChange={(value: string) => onAction('fontSize', parseInt(value, 10))}>
        <SelectTrigger className="w-16 h-7 text-xs">
          <SelectValue>{String(currentSize)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size.toString()} className="text-xs">
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== FORMATO DE TEXTO ===== */}
      {/* Botones para aplicar estilos de texto básicos */}
      <Button size="sm" variant="ghost" onClick={() => onAction('bold')}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('italic')}>
        <Italic className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('underline')}>
        <Underline className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== ALINEACIÓN DE TEXTO ===== */}
      {/* Botones para alinear el texto a izquierda, centro o derecha */}
      <Button size="sm" variant="ghost" onClick={() => onAction('alignLeft')}>
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('alignCenter')}>
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('alignRight')}>
        <AlignRight className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== COLOR Y TAMAÑO DE TEXTO ===== */}
      {/* Botones para abrir selectores de color y tamaño */}
      <Button size="sm" variant="ghost" onClick={() => onAction('textColor')}>
        <Palette className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('textSize')}>
        <Type className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== TRANSFORMACIÓN DE MAYÚSCULAS/MINÚSCULAS ===== */}
      {/* Botones para convertir texto seleccionado a mayúsculas o minúsculas */}
      <Button size="sm" variant="ghost" onClick={() => onAction('uppercase')} title="Uppercase">
        <CaseUpper className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('lowercase')} title="Lowercase">
        <CaseLower className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* ===== TECLAS RÁPIDAS NUMÉRICAS (1-0) ===== */}
      {/* Botones numéricos para insertar marcadores o saltar a secciones específicas del script */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => {
          // Genera números del 1 al 9, y luego 0
          const num = i === 9 ? 0 : i + 1;
          return (
            <Button 
              key={num}
              size="sm" 
              variant="ghost" 
              className="w-7 h-7 p-0 text-xs"
              onClick={() => onAction('hotkey', num)}
            >
              {num}
            </Button>
          );
        })}
      </div>
    </div>
  );
}