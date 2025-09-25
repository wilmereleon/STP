import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface TeleprompterWindowProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  isPlaying: boolean;
  speed: number;
  shouldReset: boolean;
  onResetComplete: () => void;
}

export function TeleprompterWindow({
  isOpen,
  onClose,
  script,
  isPlaying,
  speed,
  shouldReset,
  onResetComplete
}: TeleprompterWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (shouldReset && container) {
      container.scrollTop = 0;
      onResetComplete();
      return;
    }

    if (!isPlaying || !container) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();

    const step = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      // time-based scroll: px per second scaled by speed
      const pxPerSecond = Math.max(20, speed * 40);
      const delta = (pxPerSecond * dt) / 1000;
      container.scrollTop += delta;

      // If reached bottom, stop animation
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (container.scrollTop >= maxScroll) {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    // start loop
    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, speed, shouldReset, onResetComplete]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // ignore fullscreen errors
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Format script with proper line breaks
  const formattedScript = script.split("\n").map((line, index) => (
    <p key={index} className="mb-4 leading-relaxed">
      {line || "\u00A0"}
    </p>
  ));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <DialogTitle className="sr-only">Ventana del Teleprompter</DialogTitle>
        <DialogDescription className="sr-only">
          Ventana de teleprompter con controles de reproducción y texto desplazable
        </DialogDescription>
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2>Teleprompter</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-black text-white p-8 scroll-smooth"
          style={{
            fontSize: "2rem",
            lineHeight: "1.6",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          <div className="max-w-4xl mx-auto">
            {formattedScript.length > 0 ? (
              formattedScript
            ) : (
              <p className="text-gray-400 text-center">No hay texto en la escaleta</p>
            )}
            {/* Add extra space at the bottom for smooth scrolling */}
            <div className="h-screen" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TeleprompterWindow;