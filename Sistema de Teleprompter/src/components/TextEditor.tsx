import { FileText, Upload } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useRef } from 'react';

interface TextEditorProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function TextEditor({ text, onTextChange }: TextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onTextChange(content);
      };
      reader.readAsText(file);
    }
  };

  const sampleText = `Bienvenidos a nuestro programa de noticias.

En primer lugar, queremos hablar sobre los últimos acontecimientos en tecnología. La inteligencia artificial sigue revolucionando diferentes industrias.

Las empresas están adoptando nuevas herramientas para mejorar la productividad y la eficiencia en sus operaciones diarias.

En el ámbito económico, los mercados muestran signos de estabilidad después de un período de volatilidad.

Finalmente, en deportes, el equipo local se prepara para el próximo campeonato con grandes expectativas.

Eso es todo por hoy. Gracias por su atención.`;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Editor de Texto
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTextChange(sampleText)}
          >
            Texto de Ejemplo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Cargar Archivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Escribe aquí tu texto para el teleprompter..."
          className="min-h-96 resize-none"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Tip: Separa párrafos con líneas en blanco para mejor lectura
        </p>
      </CardContent>
    </Card>
  );
}