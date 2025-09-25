// ...existing code...
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Play, Pause, RotateCcw, Monitor, MonitorOff } from "lucide-react";

interface TeleprompterControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  isTeleprompterOpen: boolean;
  onToggleTeleprompter: () => void;
}

export function TeleprompterControls({
  isPlaying,
  speed,
  onPlayPause,
  onSpeedChange,
  onReset,
  isTeleprompterOpen,
  onToggleTeleprompter
}: TeleprompterControlsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={onToggleTeleprompter}
            variant={isTeleprompterOpen ? "destructive" : "default"}
            size="lg"
          >
            {isTeleprompterOpen ? (
              <>
                <MonitorOff className="w-4 h-4 mr-2" />
                Cerrar Teleprompter
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 mr-2" />
                Abrir Teleprompter
              </>
            )}
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <Button
            onClick={onPlayPause}
            variant="outline"
            size="lg"
            disabled={!isTeleprompterOpen}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Reproducir
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            disabled={!isTeleprompterOpen}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-3 min-w-[200px]">
            <Label htmlFor="speed-slider" className="whitespace-nowrap">
              Velocidad:
            </Label>
            <Slider
              id="speed-slider"
              // support sliders that emit either a number or a number[] (range)
              value={[speed]}
              onValueChange={(value: number | number[]) =>
                onSpeedChange(Array.isArray(value) ? value[0] : value)
              }
              max={10}
              min={1}
              step={0.5}
              className="flex-1"
              disabled={!isTeleprompterOpen}
            />
            <span className="text-sm text-muted-foreground w-8 text-right">
              {speed}x
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// ...existing code...