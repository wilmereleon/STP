import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Maximize2, Settings, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";

interface TeleprompterPanelProps {
  script: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  shouldReset: boolean;
  onResetComplete: () => void;
  onOpenSettings: () => void;
  onFullscreen: () => void;
  onDetach: () => void;
  onFontSizeChange?: (size: number) => void;
  onSpeedChange?: (speed: number) => void;
}

export function TeleprompterPanel({
  script,
  isPlaying,
  speed,
  fontSize,
  shouldReset,
  onResetComplete,
  onOpenSettings,
  onFullscreen,
  onDetach,
  onFontSizeChange,
  onSpeedChange
}: TeleprompterPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [localFontSize, setLocalFontSize] = useState(fontSize);

  // Update local font size when prop changes
  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  // Auto-scroll functionality - starts from the bottom and scrolls up
  useEffect(() => {
    if (shouldReset) {
      if (scrollContainerRef.current) {
        // Reset to bottom for upward scrolling
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
      onResetComplete();
      return;
    }

    if (!isPlaying || !scrollContainerRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const container = scrollContainerRef.current;
    let lastTime = 0;

    const scroll = (currentTime: number) => {
      if (currentTime - lastTime >= 16) { // ~60fps
        // Negative scroll speed for upward movement (speed 2x = -1 pixel per frame at 60fps)  
        const scrollSpeed = -(speed * 1.0);
        container.scrollTop += scrollSpeed;
        lastTime = currentTime;
        
        // Stop if we've reached the top
        if (container.scrollTop <= 0) {
          return;
        }
      }
      
      if (isPlaying && container.scrollTop > 0) {
        animationRef.current = requestAnimationFrame(scroll);
      }
    };

    // Start from bottom if we're just starting
    if (container.scrollTop === 0) {
      container.scrollTop = container.scrollHeight;
    }
    
    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, shouldReset, onResetComplete]);

  // Mouse wheel scroll handler for teleprompter control and speed adjustment
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const isOverTeleprompter = e.clientX >= rect.left && e.clientX <= rect.right && 
                                   e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        if (isPlaying) {
          e.preventDefault();
          e.stopPropagation();
          
          // Control playback speed when playing (Ctrl + scroll)
          if (e.ctrlKey) {
            const speedDelta = e.deltaY > 0 ? -0.5 : 0.5;
            const newSpeed = Math.max(0.5, Math.min(speed + speedDelta, 10));
            if (onSpeedChange) {
              onSpeedChange(newSpeed);
            }
          } else {
            // Manual scroll control when playing
            const scrollAmount = e.deltaY * 0.8;
            container.scrollTop += scrollAmount;
          }
        } else if (isOverTeleprompter) {
          e.preventDefault();
          e.stopPropagation();
          const scrollAmount = e.deltaY * 0.8;
          container.scrollTop += scrollAmount;
        }
      }
    };

    if (isPlaying) {
      // When playing, capture all wheel events at document level
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    } else {
      // When not playing, only listen on the container
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
      }
    }
    
    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
      const container = scrollContainerRef.current;
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isPlaying, speed, localFontSize, onFontSizeChange, onSpeedChange]);

  // Format script with proper line breaks
  const formattedScript = script.split('\n').map((line, index) => (
    <p key={index} className="mb-4 leading-relaxed">
      {line || '\u00A0'}
    </p>
  ));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Prompter Preview</h3>
            {isPlaying && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Scroll Active
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Speed: {speed}x
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const newSize = Math.max(localFontSize - 2, 12);
                setLocalFontSize(newSize);
                onFontSizeChange?.(newSize);
              }}
              title="Reduce font size"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const newSize = Math.min(localFontSize + 2, 72);
                setLocalFontSize(newSize);
                onFontSizeChange?.(newSize);
              }}
              title="Increase font size"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDetach}>
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onOpenSettings}>
              <Settings className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onFullscreen}>
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className={`h-full bg-black text-white relative ${isPlaying ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollBehavior: isPlaying ? 'auto' : 'smooth' }}
          >
            <div 
              className="pt-12 pr-6 pb-6"
              style={{
                fontSize: `${localFontSize}px`,
                lineHeight: '1.6',
                fontFamily: 'Arial, sans-serif',
                paddingLeft: '24px' // Extra padding for the reading guide
              }}
            >
              {formattedScript.length > 0 ? formattedScript : (
                <p className="text-gray-400 text-center">
                  No text in script
                </p>
              )}
              {/* Add extra space at the bottom for smooth scrolling */}
              <div style={{ height: '50vh' }}></div>
            </div>
          </div>
          
          {/* Reading guide - vertical line on the left */}
          <div 
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{ 
              left: '8px',
              width: '4px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,204,0,0.3) 20%, rgba(255,204,0,0.9) 40%, rgba(255,204,0,0.9) 60%, rgba(255,204,0,0.3) 80%, transparent 100%)',
              boxShadow: '0 0 8px rgba(255,204,0,0.7)'
            }}
          />
          
          {/* Control hints */}
          {!isPlaying && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Mouse wheel to scroll
            </div>
          )}
          {isPlaying && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Ctrl + Wheel to change speed | F1/F2 for speed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}