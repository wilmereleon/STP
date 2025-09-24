import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Card, CardHeader, CardContent } from "./ui/card";
import { EditorToolbar } from "./EditorToolbar";

interface ScriptEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
  title: string;
}

export function ScriptEditor({ script, onScriptChange, title }: ScriptEditorProps) {
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState(14);

  const handleToolbarAction = (action: string, value?: any) => {
    switch (action) {
      case 'fontFamily':
        setCurrentFont(value);
        break;
      case 'fontSize':
        setCurrentSize(value);
        break;
      case 'bold':
        // Apply bold formatting
        break;
      case 'italic':
        // Apply italic formatting
        break;
      case 'underline':
        // Apply underline formatting
        break;
      case 'alignLeft':
      case 'alignCenter':
      case 'alignRight':
        // Apply text alignment
        break;
      case 'textColor':
        // Open color picker
        break;
      case 'uppercase':
        onScriptChange(script.toUpperCase());
        break;
      case 'lowercase':
        onScriptChange(script.toLowerCase());
        break;
      case 'hotkey':
        // Handle numbered hotkey buttons (1-0)
        console.log(`Hotkey ${value} pressed`);
        break;
      case 'undo':
      case 'redo':
      case 'copy':
      case 'paste':
      case 'new':
        // Handle these actions
        console.log(`Action: ${action}`);
        break;
      default:
        break;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium">Story Editor: {title}</h3>
      </CardHeader>
      <div className="px-3">
        <EditorToolbar 
          onAction={handleToolbarAction}
          currentFont={currentFont}
          currentSize={currentSize}
        />
      </div>
      <CardContent className="flex-1 p-0">
        <Textarea
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          placeholder="Write your script here..."
          className="h-full resize-none border-none focus-visible:ring-0 text-sm leading-relaxed p-4"
          style={{
            fontFamily: currentFont,
            fontSize: `${currentSize}px`
          }}
        />
      </CardContent>
    </Card>
  );
}