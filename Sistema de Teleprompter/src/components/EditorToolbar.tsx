import React from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo,
  Copy,
  Clipboard,
  FileText,
  Type,
  Palette,
  CaseUpper,
  CaseLower
} from "lucide-react";

interface EditorToolbarProps {
  onAction: (action: string, value?: any) => void;
  currentFont: string;
  currentSize: number;
}

export function EditorToolbar({ onAction, currentFont, currentSize }: EditorToolbarProps) {
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
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
    <div className="bg-gray-100 border-b border-gray-300 px-2 py-1 flex items-center gap-1 text-sm">
      {/* File operations */}
      <Button size="sm" variant="ghost" onClick={() => onAction('new')}>
        <FileText className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <Button size="sm" variant="ghost" onClick={() => onAction('undo')}>
        <Undo className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('redo')}>
        <Redo className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Copy/Paste */}
      <Button size="sm" variant="ghost" onClick={() => onAction('copy')}>
        <Copy className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('paste')}>
        <Clipboard className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Family */}
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

      {/* Font Size */}
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

      {/* Text formatting */}
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

      {/* Text alignment */}
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

      {/* Text color */}
      <Button size="sm" variant="ghost" onClick={() => onAction('textColor')}>
        <Palette className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('textSize')}>
        <Type className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Case transformation */}
      <Button size="sm" variant="ghost" onClick={() => onAction('uppercase')} title="Uppercase">
        <CaseUpper className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction('lowercase')} title="Lowercase">
        <CaseLower className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Numbered buttons 1-0 */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => {
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