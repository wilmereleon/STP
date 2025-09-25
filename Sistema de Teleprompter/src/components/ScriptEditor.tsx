import { FileText, Upload, Save, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, RefreshCw, Target, SkipForward } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { TextWithJumpMarkers } from './TextWithJumpMarkers';

interface ScriptEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  currentScript: string;
  onFileLoad?: (scripts: Array<{id: string, title: string, text: string}>, fileName: string) => void;
  jumpMarkers?: {[key: string]: number};
  onJumpToPosition?: (position: number) => void;
}

export function ScriptEditor({ text, onTextChange, currentScript, onFileLoad, jumpMarkers = {}, onJumpToPosition }: ScriptEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('72');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState('left');
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [lastLoadedFile, setLastLoadedFile] = useState<File | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [showJumpIcons, setShowJumpIcons] = useState(true);

  const toggleCase = () => {
    if (!text.trim()) return; // Don't do anything if text is empty
    
    const newText = isUpperCase ? text.toLowerCase() : text.toUpperCase();
    onTextChange(newText);
    setIsUpperCase(!isUpperCase);
  };

  const parseScriptFile = (content: string) => {
    const scripts: Array<{id: string, title: string, text: string}> = [];
    
    // Find all script blocks using regex
    const scriptRegex = /\[(\d+)\]\s*\{([^}]+)\}([\s\S]*?)(?=\[\d+\]\s*\{[^}]+\}|$)/g;
    let match;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      const [, number, title, text] = match;
      
      scripts.push({
        id: number.trim(),
        title: title.trim(),
        text: text.trim()
      });
    }
    
    return scripts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Try to parse as structured script file
        const parsedScripts = parseScriptFile(content);
        
        if (parsedScripts.length > 0 && onFileLoad) {
          // If we have structured scripts, use the file loading handler
          const fileName = file.name.replace('.txt', '');
          onFileLoad(parsedScripts, fileName);
          toast.success(`Archivo cargado: ${parsedScripts.length} guiones encontrados en "${file.name}"`);
        } else {
          // If no structured format found, load as single script
          onTextChange(content);
          toast.info('Archivo cargado como texto único. Use el formato [1] {TITULO} para múltiples guiones.');
        }
        
        // Store the file for reload functionality
        setLastLoadedFile(file);
        setIsReloading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleReloadFile = () => {
    if (!lastLoadedFile) {
      toast.error('No hay archivo cargado para recargar');
      return;
    }
    
    setIsReloading(true);
    toast.info(`Recargando "${lastLoadedFile.name}"...`);
    
    // Re-process the same file using File API
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Try to parse as structured script file
      const parsedScripts = parseScriptFile(content);
      
      if (parsedScripts.length > 0 && onFileLoad) {
        // If we have structured scripts, use the file loading handler
        const fileName = lastLoadedFile.name.replace('.txt', '');
        onFileLoad(parsedScripts, fileName);
        toast.success(`✅ Archivo recargado: ${parsedScripts.length} guiones actualizados desde "${lastLoadedFile.name}"`);
      } else {
        // If no structured format found, load as single script
        onTextChange(content);
        toast.success(`✅ Archivo recargado: "${lastLoadedFile.name}"`);
      }
      
      setIsReloading(false);
    };
    reader.readAsText(lastLoadedFile);
  };

  const sampleText = `[1] {INTRO/TECH SCRIPTS ROLLING} KEEPING THOSE SCRIPTS ROLLING:

Teleprompter - the unsung hero in the broadcast chain - a critical element, to be sure, but one too often taken for granted as just another tool - a critical essential, to be work.

[2] {MAIN CONTENT} While the teleprompter has been around for decades, helping anchors and reporters deliver news with confidence and eye contact, its role in modern broadcasting has evolved significantly.

Today's teleprompter systems offer advanced features like speed control, font customization, and real-time editing capabilities that make them indispensable tools for professional broadcasters.

[3] {CONCLUSION} The technology continues to advance, with new features being added regularly to meet the changing needs of the industry.

For best results, use the format: [number] {TITLE} text content`;

  return (
    <div className="h-full bg-gray-100 border-r border-gray-300">
      {/* Header */}
      <div className="border-b border-gray-300 bg-gray-200">
        {/* Title Bar */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-800">Story Editor: {currentScript}</h3>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-300 p-1">
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-300 p-1">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTextChange(sampleText)}
              className="text-xs"
            >
              Texto de Ejemplo
            </Button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="px-3 py-2 bg-gray-300 border-t border-gray-400">
          <div className="flex items-center gap-1">
            {/* Font Family */}
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

            {/* Font Size */}
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

            {/* Separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* Text Color */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-1 bg-white border border-gray-400 hover:bg-gray-100"
            >
              <div className="w-4 h-1 bg-black" />
            </Button>

            {/* Format Buttons */}
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

            {/* Separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* Alignment Buttons */}
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

            {/* Separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* Case Toggle */}
            <Button 
              size="sm" 
              variant="ghost" 
              className={`h-7 w-7 p-1 border border-gray-400 hover:bg-gray-100 ${isUpperCase ? 'bg-gray-200' : 'bg-white'}`}
              onClick={toggleCase}
              title="Alternar Mayúsculas/Minúsculas"
            >
              <Type className="h-3 w-3" />
            </Button>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* Additional Tools */}
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

            {/* Separator */}
            <div className="w-px h-5 bg-gray-500 mx-1" />

            {/* Number Shortcuts */}
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

      {/* Jump Markers Bar */}
      {Object.keys(jumpMarkers).length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-300">
          <div className="text-xs text-gray-600 mb-2">🎯 Marcadores de Salto:</div>
          <div className="flex flex-wrap gap-1">
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
                {label.length > 15 ? label.substring(0, 15) + '...' : label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="p-3 flex-1 overflow-hidden">
        <div className="w-full h-full relative">
          {/* Toggle for Jump Icons */}
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

          {/* Text Editor with embedded jump markers */}
          {showJumpIcons ? (
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
              <TextWithJumpMarkers
                text={text}
                onJumpToPosition={onJumpToPosition}
                fontSize={parseInt(fontSize) * 0.2}
                showJumpIcons={true}
              />
              
              {/* Invisible textarea for editing */}
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
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  zIndex: 1
                }}
              />
            </div>
          ) : (
            <Textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Escribe aquí tu script..."
              className="w-full h-full resize-none border-0 bg-white leading-relaxed"
              style={{ 
                minHeight: 'calc(100vh - 240px)',
                fontFamily: fontFamily,
                fontSize: `${parseInt(fontSize) * 0.2}px`,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline ? 'underline' : 'none',
                textAlign: alignment as 'left' | 'center' | 'right',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-300 bg-gray-200">
        <div className="text-xs text-gray-600">
          Script: {currentScript} | Caracteres: {text.length}
        </div>
      </div>
    </div>
  );
}