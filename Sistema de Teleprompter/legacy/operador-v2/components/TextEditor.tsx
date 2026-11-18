// ===== IMPORTACIONES / IMPORTS =====
// Iconos de Lucide React / Lucide React icons
import { FileText, Upload } from 'lucide-react';
// Componentes UI base / Base UI components
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// Hook de React para referencias / React hook for references
import { useRef } from 'react';

/**
 * Props del componente TextEditor
 * TextEditor component props
 * 
 * @interface TextEditorProps
 * @property {string} text - Texto actual del editor / Current editor text
 * @property {(text: string) => void} onTextChange - Callback cuando el texto cambia / Callback when text changes
 */
interface TextEditorProps {
  text: string;
  onTextChange: (text: string) => void;
}

/**
 * TextEditor - Editor de texto para guiones del teleprompter
 * TextEditor - Text editor for teleprompter scripts
 * 
 * Componente simple que proporciona un área de texto para escribir o cargar
 * guiones que luego se mostrarán en el teleprompter. Incluye funcionalidades
 * de carga de archivos y texto de ejemplo.
 * 
 * Simple component that provides a text area to write or load scripts
 * that will later be displayed in the teleprompter. Includes file upload
 * and sample text functionality.
 * 
 * Características / Features:
 * - Área de texto grande y sin redimensionamiento / Large textarea without resize
 * - Carga de archivos .txt desde el sistema / Load .txt files from system
 * - Texto de ejemplo predefinido / Predefined sample text
 * - Validación de tipo de archivo / File type validation
 * - Lectura con FileReader API / Reading with FileReader API
 * 
 * @component
 * @param {TextEditorProps} props - Props del componente / Component props
 * @returns {JSX.Element} Card con editor de texto / Card with text editor
 */
export function TextEditor({ text, onTextChange }: TextEditorProps) {
  // ===== REFERENCIAS / REFERENCES =====
  // Referencia al input de archivo oculto / Reference to hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== MANEJADOR: CARGA DE ARCHIVO / HANDLER: FILE UPLOAD =====
  /**
   * Maneja la carga de archivos de texto (.txt)
   * Handles text file upload (.txt)
   * 
   * Proceso / Process:
   * 1. Obtiene el archivo del evento / Gets file from event
   * 2. Valida que sea tipo text/plain / Validates it's text/plain type
   * 3. Lee el contenido con FileReader / Reads content with FileReader
   * 4. Actualiza el texto mediante callback / Updates text via callback
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de cambio del input / Input change event
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Obtener primer archivo / Get first file
    
    // Validar que existe y es texto plano / Validate it exists and is plain text
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      
      // Callback cuando la lectura completa / Callback when reading completes
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onTextChange(content); // Actualizar texto / Update text
      };
      
      // Iniciar lectura como texto / Start reading as text
      reader.readAsText(file);
    }
  };

  // ===== TEXTO DE EJEMPLO / SAMPLE TEXT =====
  /**
   * Texto de ejemplo predefinido para pruebas rápidas
   * Predefined sample text for quick testing
   * 
   * Contiene un guion de noticias con estructura típica:
   * Contains a news script with typical structure:
   * - Saludo / Greeting
   * - Varios segmentos / Multiple segments
   * - Despedida / Closing
   * 
   * Formato con párrafos separados por líneas en blanco para mejor lectura
   * Format with paragraphs separated by blank lines for better readability
   */
  const sampleText = `Bienvenidos a nuestro programa de noticias.

En primer lugar, queremos hablar sobre los últimos acontecimientos en tecnología. La inteligencia artificial sigue revolucionando diferentes industrias.

Las empresas están adoptando nuevas herramientas para mejorar la productividad y la eficiencia en sus operaciones diarias.

En el ámbito económico, los mercados muestran signos de estabilidad después de un período de volatilidad.

Finalmente, en deportes, el equipo local se prepara para el próximo campeonato con grandes expectativas.

Eso es todo por hoy. Gracias por su atención.`;

  // ===== RENDERIZADO / RENDERING =====
  return (
    <Card className="h-full">
      {/* ===== ENCABEZADO / HEADER ===== */}
      <CardHeader>
        {/* Título con icono / Title with icon */}
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Editor de Texto
        </CardTitle>
        
        {/* ===== BOTONES DE ACCIÓN / ACTION BUTTONS ===== */}
        <div className="flex gap-2">
          {/* Botón: Cargar texto de ejemplo / Button: Load sample text */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTextChange(sampleText)}
          >
            Texto de Ejemplo
          </Button>
          
          {/* Botón: Abrir diálogo de carga de archivo / Button: Open file upload dialog */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()} // Activar input oculto / Trigger hidden input
          >
            <Upload className="h-4 w-4 mr-2" />
            Cargar Archivo
          </Button>
          
          {/* Input de archivo oculto / Hidden file input */}
          {/* Solo acepta archivos .txt / Only accepts .txt files */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt" // Filtro de tipo de archivo / File type filter
            onChange={handleFileUpload}
            className="hidden" // Oculto visualmente / Visually hidden
          />
        </div>
      </CardHeader>
      
      {/* ===== CONTENIDO / CONTENT ===== */}
      <CardContent>
        {/* Área de texto principal / Main text area */}
        {/* min-h-96: Altura mínima de 24rem (384px) / Minimum height of 24rem (384px) */}
        {/* resize-none: Desactiva redimensionamiento manual / Disables manual resizing */}
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Escribe aquí tu texto para el teleprompter..."
          className="min-h-96 resize-none"
        />
        
        {/* Tip para el usuario / User tip */}
        <p className="text-sm text-muted-foreground mt-2">
          Tip: Separa párrafos con líneas en blanco para mejor lectura
        </p>
      </CardContent>
    </Card>
  );
}