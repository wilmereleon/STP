import React, { useEffect, useRef, useState } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [localFontSize, setLocalFontSize] = useState<number>(fontSize);

  // Keep local font size in sync with prop
  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  // Auto-scroll (bottom -> top)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (shouldReset && container) {
      container.scrollTop = container.scrollHeight;
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

    let lastTs = performance.now();

    const step = (ts: number) => {
      const dt = ts - lastTs;
      lastTs = ts;

      // px per second base tuned for readability
      const pxPerSecond = Math.max(20, speed * 40);
      const deltaPx = (pxPerSecond * dt) / 1000;

      // scrolling upward: decrease scrollTop
      container.scrollTop = Math.max(0, container.scrollTop - deltaPx);

      // stop at top
      if (container.scrollTop <= 0) {
        animationRef.current = null;
        return;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    // Ensure starting from bottom when starting playback
    if (container.scrollTop <= 0) {
      container.scrollTop = container.scrollHeight;
    }

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, speed, shouldReset, onResetComplete]);

  // Wheel handler: when playing capture global wheel, otherwise only container
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const isOverTeleprompter =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isPlaying) {
        // prevent page scroll while playing
        e.preventDefault();
        e.stopPropagation();

        if (e.ctrlKey) {
          const speedDelta = e.deltaY > 0 ? -0.5 : 0.5;
          const newSpeed = Math.max(0.5, Math.min(speed + speedDelta, 10));
          onSpeedChange?.(newSpeed);
        } else {
          const scrollAmount = e.deltaY * 0.8;
          container.scrollTop += scrollAmount;
        }
      } else if (isOverTeleprompter) {
        // allow local scrolling when not playing
        e.preventDefault();
        e.stopPropagation();
        const scrollAmount = e.deltaY * 0.8;
        container.scrollTop += scrollAmount;
      }
    };

    const addOpts: AddEventListenerOptions = { passive: false, capture: true };
    const addOptsContainer: AddEventListenerOptions = { passive: false, capture: false };

    if (isPlaying) {
      document.addEventListener("wheel", handleWheel as EventListener, addOpts);
    } else {
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel as EventListener, addOptsContainer);
      }
    }

    return () => {
      document.removeEventListener("wheel", handleWheel as EventListener, addOpts);
      const container = scrollContainerRef.current;
      if (container) {
        container.removeEventListener("wheel", handleWheel as EventListener, addOptsContainer);
      }
    };
  }, [isPlaying, speed, onSpeedChange]);

  const formattedScript = script.split("\n").map((line, idx) => (
    <p key={idx} className="mb-4 leading-relaxed">
      {line || "\u00A0"}
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
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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
        <div
          className={`h-full bg-black text-white relative ${isPlaying ? "ring-2 ring-green-400 ring-opacity-50" : ""}`}
        >
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollBehavior: isPlaying ? "auto" : "smooth" }}
          >
            <div
              className="pt-12 pr-6 pb-6"
              style={{
                fontSize: `${localFontSize}px`,
                lineHeight: "1.6",
                fontFamily: "Arial, sans-serif",
                paddingLeft: "24px"
              }}
            >
              {formattedScript.length > 0 ? (
                formattedScript
              ) : (
                <p className="text-gray-400 text-center">No text in script</p>
              )}

              <div style={{ height: "50vh" }} />
            </div>
          </div>

          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{
              left: "8px",
              width: "4px",
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,204,0,0.3) 20%, rgba(255,204,0,0.9) 40%, rgba(255,204,0,0.9) 60%, rgba(255,204,0,0.3) 80%, transparent 100%)",
              boxShadow: "0 0 8px rgba(255,204,0,0.7)"
            }}
          />

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

export default TeleprompterPanel;