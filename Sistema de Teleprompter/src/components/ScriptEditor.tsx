// ===== IMPORTACIONES / IMPORTS =====
// Iconos de Lucide React para UI / Lucide React icons for UI
import { FileText, Upload, Save, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, RefreshCw, Target, SkipForward, Settings } from 'lucide-react';
// Componentes UI reutilizables / Reusable UI components
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// Hooks de React / React hooks
import { useRef, useState } from 'react';
// Notificaciones toast / Toast notifications
import { toast } from 'sonner';
// Componente personalizado para marcadores de salto / Custom component for jump markers
import { TextWithJumpMarkers } from './TextWithJumpMarkers';
// Componente de configuración de macros / Macro configuration component
import { ConfigurationPanel } from './ConfigurationPanel';
import { MacroSettings } from './useMacros';

/**
 * Propiedades del componente ScriptEditor
 * ScriptEditor component properties
 * 
 * @interface ScriptEditorProps
 * @property {string} text - Texto actual del script / Current script text
 * @property {(text: string) => void} onTextChange - Callback cuando el texto cambia / Callback when text changes
 * @property {string} currentScript - Nombre del script actual / Current script name
 * @property {(scripts: Array<{id: string, title: string, text: string}>, fileName: string) => void} [onFileLoad] - Callback para cargar múltiples scripts desde archivo / Callback to load multiple scripts from file
 * @property {{[key: string]: number}} [jumpMarkers] - Mapa de marcadores de salto (etiqueta -> posición) / Map of jump markers (label -> position)
 * @property {(position: number) => void} [onJumpToPosition] - Callback para saltar a una posición específica / Callback to jump to specific position
 * @property {MacroSettings} [macros] - Configuración de macros / Macro configuration
 * @property {(macros: MacroSettings) => void} [onMacrosChange] - Callback para cambiar macros / Callback to change macros
 */
interface ScriptEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  currentScript: string;
  onFileLoad?: (scripts: Array<{id: string, title: string, text: string}>, fileName: string) => void;
  jumpMarkers?: {[key: string]: number};
  onJumpToPosition?: (position: number) => void;
  macros?: MacroSettings;
  onMacrosChange?: (macros: MacroSettings) => void;
}

/**
 * ScriptEditor - Editor de texto enriquecido para scripts de teleprompter
 * ScriptEditor - Rich text editor for teleprompter scripts
 * 
 * Componente principal para editar scripts con:
 * - Formateo de texto completo (fuente, tamaño, negrita, cursiva, subrayado)
 * - Alineación de texto (izquierda, centro, derecha)
 * - Conversión mayúsculas/minúsculas
 * - Carga de archivos .txt con formato estructurado [número] {TÍTULO}
 * - Recarga automática del último archivo cargado
 * - Marcadores de salto integrados en el texto
 * - Vista previa con iconos de salto activables/desactivables
 * - Atajos numéricos (1-0) para funciones rápidas
 * 
 * Component for editing scripts with:
 * - Complete text formatting (font, size, bold, italic, underline)
 * - Text alignment (left, center, right)
 * - Upper/lowercase conversion
 * - Loading .txt files with structured format [number] {TITLE}
 * - Automatic reload of last loaded file
 * - Jump markers integrated in text
 * - Preview with toggleable jump icons
 * - Numeric shortcuts (1-0) for quick functions
 * 
 * @component
 * @param {ScriptEditorProps} props - Propiedades del componente / Component properties
 * @returns {JSX.Element} Editor de scripts / Script editor
 */
export function ScriptEditor({ text, onTextChange, currentScript, onFileLoad, jumpMarkers = {}, onJumpToPosition, macros, onMacrosChange }: ScriptEditorProps) {
  // ===== REFERENCIAS / REFERENCES =====
  // Referencia al input oculto de archivo / Reference to hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ===== ESTADO LOCAL / LOCAL STATE =====
  // Estado de formateo de texto / Text formatting state
  const [fontFamily, setFontFamily] = useState('Arial'); // Familia de fuente / Font family
  const [fontSize, setFontSize] = useState('72'); // Tamaño de fuente / Font size
  const [isBold, setIsBold] = useState(false); // Texto en negrita / Bold text
  const [isItalic, setIsItalic] = useState(false); // Texto en cursiva / Italic text
  const [isUnderline, setIsUnderline] = useState(false); // Texto subrayado / Underlined text
  const [alignment, setAlignment] = useState('left'); // Alineación del texto / Text alignment
  const [isUpperCase, setIsUpperCase] = useState(false); // Modo mayúsculas / Uppercase mode
  
  // Estado de gestión de archivos / File management state
  const [lastLoadedFile, setLastLoadedFile] = useState<File | null>(null); // Último archivo cargado / Last loaded file
  const [isReloading, setIsReloading] = useState(false); // Estado de recarga / Reloading state
  
  // Estado de visualización / Display state
  const [showJumpIcons, setShowJumpIcons] = useState(true); // Mostrar iconos de salto / Show jump icons
  const [showMacroConfig, setShowMacroConfig] = useState(false); // Mostrar configuración de macros / Show macro configuration

  /**
   * Alterna entre mayúsculas y minúsculas del texto completo
   * Toggles between uppercase and lowercase for entire text
   */
  const toggleCase = () => {
    if (!text.trim()) return; // No hacer nada si el texto está vacío / Don't do anything if text is empty
    
    const newText = isUpperCase ? text.toLowerCase() : text.toUpperCase();
    onTextChange(newText);
    setIsUpperCase(!isUpperCase);
  };

  /**
   * Analiza un archivo de texto y extrae scripts estructurados
   * Parses a text file and extracts structured scripts
   * 
   * Formato esperado: [número] {TÍTULO} contenido del texto
   * Expected format: [number] {TITLE} text content
   * 
   * Soporta múltiples formatos / Supports multiple formats:
   * - [1] {INTRO} texto...
   * - [2] {MAIN CONTENT} texto...
   * - [3] texto sin título (título por defecto)
   * 
   * Ejemplo / Example:
   * [1] {INTRO} Este es el primer script...
   * [2] {MAIN CONTENT} Este es el segundo script...
   * 
   * @param {string} content - Contenido del archivo / File content
   * @returns {Array<{id: string, title: string, text: string}>} Array de scripts parseados / Array of parsed scripts
   */
  const parseScriptFile = (content: string) => {
    const scripts: Array<{id: string, title: string, text: string}> = [];
    
    // Primero, dividir el contenido por bloques que empiezan con [número]
    // First, split content by blocks starting with [number]
    const blockRegex = /\[(\d+)\]/g;
    const matches = Array.from(content.matchAll(blockRegex));
    
    if (matches.length === 0) {
      // No se encontró formato estructurado
      return scripts;
    }
    
    // Procesar cada bloque
    matches.forEach((match, index) => {
      const number = match[1];
      const startPos = match.index!;
      const endPos = index < matches.length - 1 
        ? matches[index + 1].index! 
        : content.length;
      
      // Extraer el bloque completo
      let block = content.substring(startPos, endPos).trim();
      
      // Remover el [número] del inicio
      block = block.replace(/^\[\d+\]\s*/, '');
      
      // Intentar extraer título entre {}
      let title = `Script ${number}`;
      let text = block;
      
      const titleMatch = block.match(/^\{([^}]+)\}\s*/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        text = block.substring(titleMatch[0].length).trim();
      }
      
      scripts.push({
        id: number,
        title: title,
        text: text
      });
    });
    
    return scripts;
  };

  /**
   * Maneja la carga de archivos .txt desde el sistema de archivos
   * Handles loading .txt files from file system
   * 
   * Proceso / Process:
   * 1. Lee el archivo seleccionado
   * 2. Intenta parsear formato estructurado [número] {TÍTULO}
   * 3. Si encuentra estructura: carga múltiples scripts
   * 4. Si no encuentra estructura: carga como texto único
   * 5. Guarda referencia del archivo para función de recarga
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de cambio del input file / File input change event
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Intentar parsear como archivo de script estructurado / Try to parse as structured script file
        const parsedScripts = parseScriptFile(content);
        
        if (parsedScripts.length > 0 && onFileLoad) {
          // Si tenemos scripts estructurados, usar el handler de carga / If we have structured scripts, use the file loading handler
          const fileName = file.name.replace('.txt', '');
          onFileLoad(parsedScripts, fileName);
          toast.success(`Archivo cargado: ${parsedScripts.length} guiones encontrados en "${file.name}"`);
        } else {
          // Si no se encuentra formato estructurado, cargar como script único / If no structured format found, load as single script
          onTextChange(content);
          toast.info('Archivo cargado como texto único. Use el formato [1] {TITULO} para múltiples guiones.');
        }
        
        // Almacenar archivo para funcionalidad de recarga / Store the file for reload functionality
        setLastLoadedFile(file);
        setIsReloading(false);
      };
      reader.readAsText(file);
    }
  };

  /**
   * Recarga el último archivo cargado desde el sistema de archivos
   * Reloads the last loaded file from file system
   * 
   * Útil cuando el archivo .txt se ha editado externamente y se necesita actualizar
   * Useful when the .txt file has been edited externally and needs to be refreshed
   * 
   * Proceso / Process:
   * 1. Verifica que haya un archivo previamente cargado
   * 2. Lee el archivo nuevamente usando File API
   * 3. Parsea y carga el contenido actualizado
   * 4. Muestra notificación de éxito con detalles
   */
  const handleReloadFile = () => {
    if (!lastLoadedFile) {
      toast.error('No hay archivo cargado para recargar');
      return;
    }
    
    setIsReloading(true);
    toast.info(`Recargando "${lastLoadedFile.name}"...`);
    
    // Re-procesar el mismo archivo usando File API / Re-process the same file using File API
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Intentar parsear como archivo de script estructurado / Try to parse as structured script file
      const parsedScripts = parseScriptFile(content);
      
      if (parsedScripts.length > 0 && onFileLoad) {
        // Si tenemos scripts estructurados, usar el handler de carga / If we have structured scripts, use the file loading handler
        const fileName = lastLoadedFile.name.replace('.txt', '');
        onFileLoad(parsedScripts, fileName);
        toast.success(`✅ Archivo recargado: ${parsedScripts.length} guiones actualizados desde "${lastLoadedFile.name}"`);
      } else {
        // Si no se encuentra formato estructurado, cargar como script único / If no structured format found, load as single script
        onTextChange(content);
        toast.success(`✅ Archivo recargado: "${lastLoadedFile.name}"`);
      }
      
      setIsReloading(false);
    };
    reader.readAsText(lastLoadedFile);
  };

  // ===== TEXTO DE EJEMPLO / SAMPLE TEXT =====
  // Texto de demostración con formato estructurado [número] {TÍTULO}
  // Demo text with structured format [number] {TITLE}
  const sampleText = `[1] {INTRO/TECH SCRIPTS ROLLING} KEEPING THOSE SCRIPTS ROLLING:

Teleprompter - the unsung hero in the broadcast chain - a critical element, to be sure, but one too often taken for granted as just another tool - a critical essential, to be work.

[2] {MAIN CONTENT} While the teleprompter has been around for decades, helping anchors and reporters deliver news with confidence and eye contact, its role in modern broadcasting has evolved significantly.

Today's teleprompter systems offer advanced features like speed control, font customization, and real-time editing capabilities that make them indispensable tools for professional broadcasters.

[3] {CONCLUSION} The technology continues to advance, with new features being added regularly to meet the changing needs of the industry.

For best results, use the format: [number] {TITLE} text content`;

  return (
    <div className="h-full bg-gray-100 border-r border-gray-300">
      {/* ===== ENCABEZADO / HEADER ===== */}
      <div className="border-b border-gray-300 bg-gray-200">
        {/* ===== BARRA DE TÍTULO / TITLE BAR ===== */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            {/* Título del editor con nombre del script actual / Editor title with current script name */}
            <h3 className="text-sm font-medium text-gray-800">Story Editor: {currentScript}</h3>
            <div className="flex gap-1">
              {/* Botón de configuración de macros / Macro configuration button */}
              {macros && onMacrosChange && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-gray-600 hover:bg-gray-300 p-1"
                  onClick={() => setShowMacroConfig(!showMacroConfig)}
                  title="Configuración de Macros"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {/* Botón guardar / Save button */}
              <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-300 p-1">
                <Save className="h-4 w-4" />
              </Button>
              {/* Botón copiar / Copy button */}
              <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-300 p-1">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Botón para cargar texto de ejemplo / Button to load sample text */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTextChange(sampleText)}
              className="text-xs"
            >
              Texto de Ejemplo
            </Button>
            {/* Botón para cargar archivo .txt / Button to load .txt file */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
              title="Cargar archivo .txt con formato: [1] {TITULO} texto"
            >
              <Upload className="h-3 w-3 mr-1" />
              Cargar TXT
            </Button>
            {/* Botón para recargar último archivo / Button to reload last file */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReloadFile}
              disabled={!lastLoadedFile || isReloading}
              className="text-xs"
              title={lastLoadedFile ? `Recargar "${lastLoadedFile.name}"` : "No hay archivo cargado"}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isReloading ? 'animate-spin' : ''}`} />
              {isReloading ? 'Recargando...' : 'Recargar'}
            </Button>
            {/* Input oculto para selección de archivo / Hidden input for file selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* ===== BARRA DE FORMATEO / FORMATTING TOOLBAR ===== */}
        {/* Controles completos de formato de texto similares a MS Word / Complete text formatting controls similar to MS Word */}
        <div className="px-3 py-2 bg-gray-300 border-t border-gray-400">
          <div className="flex items-center gap-1 flex-wrap">
            {/* ===== SELECTOR DE FUENTE / FONT FAMILY SELECTOR ===== */}
            {/* 4 familias de fuente disponibles / 4 font families available */}
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-24 h-7 text-xs bg-white border-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times">Times</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Calibri">Calibri</SelectItem>
              </SelectContent>
            </Select>

            {/* ===== SELECTOR DE TAMAÑO / FONT SIZE SELECTOR ===== */}
            {/* 18 tamaños predefinidos de 8px a 500px / 18 predefined sizes from 8px to 500px */}
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-12 h-7 text-xs bg-white border-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="14">14</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="18">18</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="36">36</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="72">72</SelectItem>
                <SelectItem value="96">96</SelectItem>
                <SelectItem value="120">120</SelectItem>
                <SelectItem value="144">144</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="400">400</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>

            {/* Separador visual / Visual separator */}
            <div className="w-px h-5 bg-gray-500 mx-1 hidden sm:block" />

            {/* ===== SELECTOR DE COLOR / TEXT COLOR SELECTOR ===== */}
            {/* Botón con indicador de color actual / Button with current color indicator */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-1 bg-white border border-gray-400 hover:bg-gray-100"
            >
              <div className="w-4 h-1 bg-black" />
            </Button>

            {/* ===== BOTONES DE FORMATO / FORMAT BUTTONS ===== */}
            {/* Negrita, cursiva, subrayado / Bold, italic, underline */}
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 text-xs font-bold ${isBold ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setIsBold(!isBold)}
            >
              B
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 text-xs italic ${isItalic ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setIsItalic(!isItalic)}
            >
              I
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 text-xs underline ${isUnderline ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setIsUnderline(!isUnderline)}
            >
              U
            </Button>

            {/* Separador visual / Visual separator */}
            <div className="w-px h-5 bg-gray-500 mx-1 hidden sm:block" />

            {/* ===== BOTONES DE ALINEACIÓN / ALIGNMENT BUTTONS ===== */}
            {/* Izquierda, centro, derecha / Left, center, right */}
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 ${alignment === 'left' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setAlignment('left')}
            >
              <AlignLeft className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 ${alignment === 'center' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setAlignment('center')}
            >
              <AlignCenter className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 ${alignment === 'right' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setAlignment('right')}
            >
              <AlignRight className="h-3 w-3" />
            </Button>

            {/* Separador visual / Visual separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* ===== BOTÓN DE MAYÚSCULAS / CASE TOGGLE BUTTON ===== */}
            {/* Alterna entre mayúsculas y minúsculas / Toggles between uppercase and lowercase */}
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 ${isUpperCase ? 'bg-gray-200' : 'bg-white'}`}
              onClick={toggleCase}
              title="Alternar Mayúsculas/Minúsculas"
            >
              <Type className="h-3 w-3" />
            </Button>

            {/* Separador visual / Visual separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* ===== HERRAMIENTAS ADICIONALES / ADDITIONAL TOOLS ===== */}
            {/* Botones para funciones extra: color de fondo, zoom, caso, menú / Buttons for extra functions: background color, zoom, case, menu */}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-1 bg-white border border-gray-500 hover:bg-gray-100">
              <div className="w-3 h-3 bg-blue-600 rounded-sm" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-1 bg-white border border-gray-500 hover:bg-gray-100">
              <div className="text-xs text-gray-600">+</div>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-500 hover:bg-gray-100 ${isUpperCase ? 'bg-gray-200' : 'bg-white'}`}
              onClick={toggleCase}
              title="Alternar Mayúsculas/Minúsculas"
            >
              <div className="text-xs text-gray-600">Aa</div>
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-1 bg-white border border-gray-500 hover:bg-gray-100">
              <div className="text-xs text-gray-600">≡</div>
            </Button>

            {/* Separador visual / Visual separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* ===== ATAJOS NUMÉRICOS / NUMBER SHORTCUTS ===== */}
            {/* Botones 1-0 para funciones rápidas personalizables / Buttons 1-0 for customizable quick functions */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <Button 
                key={num}
                size="sm" 
                variant="ghost" 
                className="h-7 w-7 p-1 bg-gray-600 text-white text-xs hover:bg-gray-700 border border-gray-500"
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BARRA DE MARCADORES DE SALTO / JUMP MARKERS BAR ===== */}
      {/* Solo se muestra si hay marcadores definidos / Only shown if markers are defined */}
      {/* Permite navegación rápida a secciones específicas del script / Allows quick navigation to specific script sections */}
      {Object.keys(jumpMarkers).length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-300">
          <div className="text-xs text-gray-600 mb-2">🎯 Marcadores de Salto:</div>
          <div className="flex flex-wrap gap-1">
            {/* Botón por cada marcador / Button for each marker */}
            {Object.entries(jumpMarkers).map(([label, position]) => (
              <Button
                key={position}
                size="sm"
                variant="outline"
                onClick={() => onJumpToPosition?.(position)}
                className="text-xs h-6 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                title={`Saltar a: ${label}`}
              >
                <Target className="h-3 w-3" />
                {/* Truncar etiquetas largas / Truncate long labels */}
                {label.length > 15 ? label.substring(0, 15) + '...' : label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ===== ÁREA DE EDICIÓN / EDITOR AREA ===== */}
      <div className="p-3 flex-1 overflow-hidden">
        <div className="w-full h-full relative">
          {/* ===== BOTÓN DE ALTERNANCIA DE ICONOS DE SALTO / JUMP ICONS TOGGLE BUTTON ===== */}
          {/* Permite mostrar/ocultar los iconos de salto integrados en el texto / Allows showing/hiding jump icons embedded in text */}
          <div className="absolute top-0 right-0 z-10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowJumpIcons(!showJumpIcons)}
              className={`text-xs h-6 px-2 ${showJumpIcons ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
              title="Mostrar/Ocultar iconos de salto"
            >
              ⚡ {showJumpIcons ? 'ON' : 'OFF'}
            </Button>
          </div>

          {/* ===== EDITOR DE TEXTO CON MARCADORES INTEGRADOS / TEXT EDITOR WITH EMBEDDED MARKERS ===== */}
          {showJumpIcons ? (
            // **MODO CON ICONOS DE SALTO** / **MODE WITH JUMP ICONS**
            // Usa componente personalizado para renderizar texto con iconos de salto clickeables
            // Uses custom component to render text with clickable jump icons
            <div 
              className="w-full h-full border border-gray-300 bg-white p-3 overflow-auto rounded"
              style={{ 
                minHeight: 'calc(100vh - 240px)',
                fontFamily: fontFamily,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline ? 'underline' : 'none',
                textAlign: alignment as 'left' | 'center' | 'right'
              }}
            >
              {/* Componente que renderiza texto con iconos de salto / Component that renders text with jump icons */}
              <TextWithJumpMarkers
                text={text}
                onJumpToPosition={onJumpToPosition}
                fontSize={parseInt(fontSize) * 0.2} // Escala del tamaño de fuente / Font size scaling
                showJumpIcons={true}
              />
              
              {/* Textarea invisible para edición / Invisible textarea for editing */}
              {/* Permite editar mientras se visualizan los iconos / Allows editing while viewing icons */}
              <Textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Escribe aquí tu script..."
                className="absolute inset-0 w-full h-full resize-none border-0 bg-transparent opacity-0 cursor-text p-3"
                style={{ 
                  fontFamily: fontFamily,
                  fontSize: `${parseInt(fontSize) * 0.2}px`,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: isUnderline ? 'underline' : 'none',
                  textAlign: alignment as 'left' | 'center' | 'right',
                  whiteSpace: 'pre-wrap', // Preservar saltos de línea / Preserve line breaks
                  wordWrap: 'break-word', // Romper palabras largas / Break long words
                  overflowWrap: 'break-word', // Wrap overflow / Envolver overflow
                  zIndex: 1 // Por encima del texto decorado / Above decorated text
                }}
              />
            </div>
          ) : (
            // **MODO TEXTO SIMPLE** / **PLAIN TEXT MODE**
            // Textarea estándar sin iconos de salto / Standard textarea without jump icons
            <Textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Escribe aquí tu script..."
              className="w-full h-full resize-none border-0 bg-white leading-relaxed"
              style={{ 
                minHeight: 'calc(100vh - 240px)',
                fontFamily: fontFamily,
                fontSize: `${parseInt(fontSize) * 0.2}px`, // Escala 0.2x del valor seleccionado / 0.2x scale of selected value
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline ? 'underline' : 'none',
                textAlign: alignment as 'left' | 'center' | 'right',
                whiteSpace: 'pre-wrap', // Preservar saltos de línea / Preserve line breaks
                wordWrap: 'break-word', // Romper palabras largas / Break long words
                overflowWrap: 'break-word' // Wrap overflow / Envolver overflow
              }}
            />
          )}
        </div>
      </div>

      {/* ===== PIE DE PÁGINA / FOOTER ===== */}
      {/* Muestra información del script actual y contador de caracteres / Shows current script info and character counter */}
      <div className="p-2 border-t border-gray-300 bg-gray-200">
        <div className="text-xs text-gray-600">
          Script: {currentScript} | Caracteres: {text.length}
        </div>
      </div>

      {/* ===== PANEL DE CONFIGURACIÓN DE MACROS / MACRO CONFIGURATION PANEL ===== */}
      {showMacroConfig && macros && onMacrosChange && (
        <ConfigurationPanel
          isOpen={showMacroConfig}
          onClose={() => setShowMacroConfig(false)}
          macros={macros}
          onMacrosChange={onMacrosChange}
        />
      )}
    </div>
  );
}