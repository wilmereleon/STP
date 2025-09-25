import { Target, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface TextWithJumpMarkersProps {
  text: string;
  onJumpToPosition?: (position: number) => void;
  fontSize?: number;
  className?: string;
  style?: React.CSSProperties;
  showJumpIcons?: boolean;
}

export function TextWithJumpMarkers({ 
  text, 
  onJumpToPosition, 
  fontSize = 16, 
  className = "", 
  style = {},
  showJumpIcons = true 
}: TextWithJumpMarkersProps) {
  

  const renderTextWithJumpMarkers = () => {
    if (!showJumpIcons || !onJumpToPosition) {
      // Renderizado original sin iconos
      return text.split('\n').map((line, index) => (
        <div key={index} className="leading-relaxed mb-4 transition-all duration-200">
          {line.trim() || '\u00A0'}
        </div>
      ));
    }

    const lines = text.split('\n');
    let currentPosition = 0;

    return lines.map((line, lineIndex) => {
      const lineStartPosition = currentPosition;
      currentPosition += line.length + 1; // +1 for newline

      // Detect jump markers like [1], [2], etc.
      const markerMatch = line.match(/^(\[(\d+)\])(.*)/);

      if (markerMatch) {
        const [, fullMarker, markerNumber, restOfLine] = markerMatch;

        return (
          <div key={`marker-${lineIndex}`} className="leading-relaxed mb-4 transition-all duration-200 flex items-start gap-1 group">
            <span className="shrink-0">
              {fullMarker}
              <Button
                size="sm"
                variant="ghost"
                className="ml-1 p-0 h-4 w-4 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onJumpToPosition(lineStartPosition);
                }}
                title={`⚡ Saltar a sección ${markerNumber}`}
                type="button"
                aria-label={`Saltar a sección ${markerNumber}`}
              >
                <Zap className="h-2.5 w-2.5" />
              </Button>
            </span>
            <span className="flex-1">{restOfLine}</span>
          </div>
        );
      }

      // Check for other types of section markers
      const titleMatch = line.match(/^(#{1,3}\s+(.+)|[A-Z][A-Z\s]+:|^\*\*(.+)\*\*)/);
      if (titleMatch && line.trim().length > 0) {
        return (
          <div key={`title-${lineIndex}`} className="leading-relaxed mb-4 transition-all duration-200 flex items-start gap-1 group">
            <span className="flex-1">{line}</span>
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 p-0 h-4 w-4 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 inline-flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onJumpToPosition(lineStartPosition);
              }}
              title={`🎯 Saltar a: ${line.trim().substring(0, 30)}`}
              type="button"
              aria-label={`Saltar a ${line.trim().substring(0, 30)}`}
            >
              <Target className="h-2.5 w-2.5" />
            </Button>
          </div>
        );
      }

      // Regular line - mantener estructura original
      return (
        <div key={`line-${lineIndex}`} className="leading-relaxed mb-4 transition-all duration-200">
          {line.trim() || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div 
      className={`${className}`}
      style={{ 
        ...style 
      }}
    >
      {renderTextWithJumpMarkers()}
    </div>
  );
}