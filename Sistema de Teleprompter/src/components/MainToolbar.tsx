import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Settings,
  Maximize2,
  Save,
  FolderOpen
} from "lucide-react";

interface MainToolbarProps {
  isPlaying: boolean;
  currentTime: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSettings: () => void;
  onFullscreen: () => void;
  onSave: () => void;
  onOpen: () => void;
  isPrompting: boolean;
}

export function MainToolbar({
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onStop,
  onPrevious,
  onNext,
  onSettings,
  onFullscreen,
  onSave,
  onOpen,
  isPrompting
}: MainToolbarProps) {
  return (
    <div className="bg-muted/30 border-b px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left section - File operations */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpen}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Open
          </Button>
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* Center section - Transport controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <SkipBack className="w-4 h-4" />
          </Button>
          
          {isPlaying ? (
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onPlay}>
              <Play className="w-4 h-4" />
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={onStop}>
            <Square className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={onNext}>
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono min-w-[60px]">{currentTime}</span>
          </div>
        </div>

        {/* Right section - Status and settings */}
        <div className="flex items-center gap-2">
          {isPrompting && (
            <Badge variant="destructive" className="animate-pulse">
              PROMPTING
            </Badge>
          )}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" size="sm" onClick={onFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={onSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}