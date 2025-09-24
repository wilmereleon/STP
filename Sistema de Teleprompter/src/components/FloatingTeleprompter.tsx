import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { X, Maximize2, Settings, Minimize2, Dock, ZoomIn, ZoomOut } from "lucide-react";

interface FloatingTeleprompterProps {
  script: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  shouldReset: boolean;
  onResetComplete: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  onFontSizeChange?: (size: number) => void;
  onSpeedChange?: (speed: number) => void;
  settings: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    enableOutline: boolean;
    margins: number;
  };
}

export function FloatingTeleprompter({
  script,
  isPlaying,
  speed,
  fontSize,
  shouldReset,
  onResetComplete,
  onOpenSettings,
  onClose,
  onFontSizeChange,
  onSpeedChange,
  settings
}: FloatingTeleprompterProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const headerRef = useRef<HTMLDivElement>(null);

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

  // Mouse wheel scroll handler for floating teleprompter
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current && windowRef.current) {
        // Check if wheel event is over the floating teleprompter window
        const windowRect = windowRef.current.getBoundingClientRect();
        const isOverWindow = e.clientX >= windowRect.left && e.clientX <= windowRect.right && 
                            e.clientY >= windowRect.top && e.clientY <= windowRect.bottom;
        
        if (isOverWindow) {
          e.preventDefault();
          e.stopPropagation();
          
          if (isPlaying && e.ctrlKey) {
            // Control playback speed when playing (Ctrl + scroll)
            const speedDelta = e.deltaY > 0 ? -0.5 : 0.5;
            const newSpeed = Math.max(0.5, Math.min(speed + speedDelta, 10));
            if (onSpeedChange) {
              onSpeedChange(newSpeed);
            }
          } else {
            // Manual scroll control
            const scrollAmount = e.deltaY * 0.8;
            scrollContainerRef.current.scrollTop += scrollAmount;
          }
        } else if (isPlaying) {
          // When playing, prevent scrolling outside the teleprompter window
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Always listen at document level for floating teleprompter
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [isPlaying, speed, onSpeedChange]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setIsFullscreen(false);
      setPosition({ x: 100, y: 100 });
      setSize({ width: 600, height: 400 });
    }
  };

  // Format script with proper line breaks
  const formattedScript = script.split('\n').map((line, index) => (
    <p key={index} className="mb-4 leading-relaxed">
      {line || '\u00A0'}
    </p>
  ));

  const textStyle = {
    fontSize: `${localFontSize}px`,
    lineHeight: '1.4',
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    textShadow: settings.enableOutline ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
    padding: `${settings.margins}px`
  };

  return (
    <div
      ref={windowRef}
      className={`fixed z-50 shadow-2xl rounded-lg overflow-hidden ${
        isFullscreen ? '' : 'border border-border'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full flex flex-col">
        <CardHeader 
          ref={headerRef}
          className="pb-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Teleprompter Window</h3>
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
              <Button size="sm" variant="outline" onClick={onOpenSettings}>
                <Settings className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={onClose} title="Dock window">
                <Dock className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={onClose} title="Close window">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div 
            className={`h-full relative ${isPlaying ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
            style={{ backgroundColor: settings.backgroundColor }}
          >
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
            
            <div 
              ref={scrollContainerRef}
              className="h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ scrollBehavior: isPlaying ? 'auto' : 'smooth' }}
            >
              <div style={{
                ...textStyle,
                paddingTop: '12vh', // More space at top for reading line alignment
                paddingBottom: '60vh', // More space at bottom
                paddingLeft: '24px', // Extra padding for the reading guide
                lineHeight: '1.6'
              }}>
                {formattedScript.length > 0 ? formattedScript : (
                  <p className="text-gray-400 text-center">
                    No text in script
                  </p>
                )}
              </div>
            </div>
            
            {/* Control hints */}
            {!isPlaying && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Use mouse wheel to scroll manually
              </div>
            )}
            {isPlaying && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Ctrl + Wheel to change speed | F1/F2 for speed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}