import { Monitor, ExternalLink, Settings, Type, Plus, Minus, Maximize, Play, Pause, RotateCcw, Target } from 'lucide-react';
import { TextWithJumpMarkers } from './TextWithJumpMarkers';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { GuideLineSettings } from './GuideLineSettings';
import { ConfigurationPanel } from './ConfigurationPanel';
import { useState, useEffect, useRef } from 'react';


// Use MacroSettings and MacroKey from useMacros to avoid type conflicts
import type { MacroSettings } from './useMacros';

interface TeleprompterPreviewProps {
  text: string;
  fontSize: number;
  isPlaying: boolean;
  scrollPosition: number;
  speed: number;
  onOpenTeleprompter: () => void;
  onOpenTeleprompterModal?: () => void;
  onFontSizeChange?: (size: number) => void;
  onPlayPause?: () => void;
  onReset?: () => void;
  fileName?: string;
  macros: MacroSettings;
  onMacrosChange: (macros: MacroSettings) => void;
  onSpeedChange?: (speed: number) => void;
  onScrollPositionChange?: (position: number) => void;
  onJumpToPosition?: (position: number) => void;
}

export function TeleprompterPreview({ 
  text, 
  fontSize, 
  isPlaying, 
  scrollPosition,
  speed,
  onOpenTeleprompter, 
  onOpenTeleprompterModal, 
  onFontSizeChange,
  onPlayPause,
  onReset,
  fileName,
  macros,
  onMacrosChange,
  onSpeedChange,
  onScrollPositionChange,
  onJumpToPosition
}: TeleprompterPreviewProps) {
  const [showFontControls, setShowFontControls] = useState(false);
  const [showGuideSettings, setShowGuideSettings] = useState(false);
  const [showMacroConfig, setShowMacroConfig] = useState(false);
  const [guideLinePosition, setGuideLinePosition] = useState(50); // Position as percentage
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug effects for monitoring critical state changes
  useEffect(() => {
    console.log('🔵 TeleprompterPreview - fontSize changed to:', fontSize);
    console.log('🔵 TeleprompterPreview - calculated CSS fontSize:', `${Math.max(12, Math.min(60, fontSize * 0.12))}px`);
  }, [fontSize]);

  useEffect(() => {
    console.log('🔵 TeleprompterPreview - isPlaying changed to:', isPlaying);
    if (isPlaying) {
      console.log('🔵 TeleprompterPreview - TELEPROMPTER IS NOW PLAYING!');
    } else {
      console.log('🔵 TeleprompterPreview - TELEPROMPTER IS NOW STOPPED');
    }
  }, [isPlaying]);

  // Stable handlers that prevent state reversion
  const handlePlayPause = () => {
    console.log('TeleprompterPreview.handlePlayPause clicked, current isPlaying:', isPlaying);
    onPlayPause?.();
  };

  const handleReset = () => {
    console.log('TeleprompterPreview.handleReset clicked');
    onReset?.();
  };

  const handleFontSizeChange = (increment: number) => {
    console.log('🔴 TeleprompterPreview.handleFontSizeChange:', increment, 'current size:', fontSize);
    if (onFontSizeChange) {
      const newSize = Math.max(12, Math.min(500, fontSize + increment));
      console.log('🔴 TeleprompterPreview.Setting new font size:', fontSize, '->', newSize);
      onFontSizeChange(newSize);
      
      // Force immediate re-render for visual feedback
      setTimeout(() => {
        console.log('🔴 FontSize changed confirmed:', fontSize);
      }, 100);
    }
  };

  // Mouse wheel control handler for teleprompter
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;
    const delta = e.deltaY > 0 ? 1 : -1;
    
    console.log('🖱️ Mouse wheel:', { delta, ctrl: isCtrlPressed, shift: isShiftPressed, alt: isAltPressed });
    
    if (isCtrlPressed) {
      // Ctrl + Wheel = Speed control (velocidades más lentas)
      const speedDelta = delta * 0.1; // Incrementos mucho más pequeños
      const newSpeed = Math.max(0.1, Math.min(5, speed + speedDelta)); // Rango más lento
      console.log('🖱️ Speed change:', speed, '->', newSpeed);
      onSpeedChange?.(newSpeed);
    } else if (isShiftPressed) {
      // Shift + Wheel = Font size control
      const fontDelta = delta * 8;
      const newFontSize = Math.max(12, Math.min(500, fontSize + fontDelta));
      console.log('🖱️ Font size change:', fontSize, '->', newFontSize);
      onFontSizeChange?.(newFontSize);
    } else {
      // Normal wheel = Manual scroll control
      const scrollDelta = delta * (isAltPressed ? 20 : 60); // Fine control with Alt
      const newScrollPosition = Math.max(0, scrollPosition + scrollDelta);
      console.log('🖱️ Manual scroll:', scrollPosition, '->', newScrollPosition);
      
      // Set manual scrolling mode
      setIsManualScrolling(true);
      onScrollPositionChange?.(newScrollPosition);
      
      // Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      
      // Resume auto-scroll after 3 seconds of inactivity
      manualScrollTimeoutRef.current = setTimeout(() => {
        console.log('🖱️ Manual scroll timeout - resuming auto-scroll');
        setIsManualScrolling(false);
      }, 3000);
    }
  };

  // Apply scroll position to preview with enhanced synchronization
  useEffect(() => {
    if (previewRef.current) {
      const scaledScrollPosition = scrollPosition * 2.0; // Enhanced scale for optimal visibility
      console.log('🟡 TeleprompterPreview scroll sync:', scrollPosition, '->', scaledScrollPosition);
      previewRef.current.scrollTop = scaledScrollPosition;
      
      // Smooth scroll behavior for better UX
      if (isPlaying && scrollPosition > 0) {
        console.log('🟡 Auto-scroll ACTIVE - visible position:', scaledScrollPosition);
      }
    }
  }, [scrollPosition, isPlaying]);



  return (
    <div className="h-full bg-gray-100 border-l border-gray-300">
      {/* Header */}
      <div className="p-3 border-b border-gray-300 bg-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-800">Prompter Preview: {fileName || 'How To Script'}</h3>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-300 p-1"
              onClick={() => setShowFontControls(!showFontControls)}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-300 p-1"
              onClick={() => setShowGuideSettings(!showGuideSettings)}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:bg-gray-300 p-1"
              onClick={() => setShowMacroConfig(!showMacroConfig)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Controls */}
        <div className="flex gap-1 mb-3">
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            className="flex-1 text-xs hover:bg-gray-100"
          >
            {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-xs px-2 hover:bg-gray-100"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Open Teleprompter Buttons */}
        <div className="space-y-2 mb-2">
          <Button
            onClick={onOpenTeleprompter}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Nueva Ventana
          </Button>
          
          {onOpenTeleprompterModal && (
            <Button
              onClick={onOpenTeleprompterModal}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <Maximize className="h-3 w-3 mr-1" />
              Pantalla Completa
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div>Estado: {isPlaying ? 'REPRODUCIENDO' : 'PAUSADO'}</div>
          <div>Velocidad: {speed.toFixed(1)} | Tamaño: {fontSize}px</div>
          <div className="text-gray-500">
            Nueva Ventana: Para entornos de producción<br/>
            Pantalla Completa: Compatible con todos los navegadores
          </div>
        </div>
      </div>

      {/* Font Controls */}
      {showFontControls && onFontSizeChange && (
        <div className="p-3 bg-gray-300 border-b border-gray-400">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-700">Tamaño de Fuente</span>
              <span className="text-xs text-gray-700">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  console.log('🔴 Minus button clicked');
                  handleFontSizeChange(-8);
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Slider
                value={[fontSize]}
                onValueChange={(value: number[]) => {
                  console.log('🔴 Slider onValueChange called with:', value[0], 'from:', fontSize);
                  if (onFontSizeChange) {
                    onFontSizeChange(value[0]);
                  }
                }}
                max={500}
                min={12}
                step={8}
                className="flex-1"
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  console.log('🔴 Plus button clicked');
                  handleFontSizeChange(8);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {[24, 36, 48, 72, 96, 144, 200, 300, 400, 500].map((size) => (
                <Button
                  key={size}
                  size="sm"
                  variant={fontSize === size ? "default" : "outline"}
                  className="h-6 text-xs px-2"
                  onClick={() => {
                    console.log('🔴 Font size preset button clicked:', size, 'current:', fontSize);
                    if (onFontSizeChange) {
                      console.log('🔴 Calling onFontSizeChange with:', size);
                      onFontSizeChange(size);
                    }
                  }}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="p-3 flex-1 overflow-hidden">
        <Card className="mb-4 h-[500px]">
          <CardContent className="p-0 h-full">
            <div className="relative h-full">
              <div 
                ref={previewRef}
                className={`bg-black text-white p-4 rounded-lg h-full overflow-y-auto scroll-smooth cursor-grab active:cursor-grabbing ${
                  isPlaying ? 'ring-4 ring-red-500 ring-opacity-70 shadow-lg shadow-red-500/20' : ''
                } ${isManualScrolling ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}`}
                style={{ 
                  fontSize: `${Math.max(10, Math.min(16, fontSize * 0.06))}px`,
                  lineHeight: '1.4',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.01em'
                }}
                onWheel={handleWheel}
                title="Scroll: Controlar velocidad y dirección"
              >
                {text ? (
                  <div className="space-y-2">
                    {/* Top padding for better starting position */}
                    <div style={{ height: '20vh' }} />
                    {/* Renderizado simple sin iconos complicados */}
                    {text.split('\n').map((line, index) => (
                      <div key={index} className="leading-tight mb-2 transition-all duration-200">
                        {line.trim() || '\u00A0'}
                      </div>
                    ))}
                    {/* Bottom padding so text can scroll past center */}
                    <div style={{ height: '40vh' }} />
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-center mt-20 text-sm">
                    Escribe texto en el editor para ver la vista previa...
                  </div>
                )}
              </div>
              
              {/* Guide line indicator (reading line) - ENHANCED visibility */}
              <div 
                className={`absolute left-8 right-8 h-1 bg-red-500 pointer-events-none z-30 shadow-lg transition-opacity duration-300 ${
                  isPlaying ? 'opacity-100' : 'opacity-60'
                }`}
                style={{ 
                  top: `${guideLinePosition}%`,
                  transform: 'translateY(-50%)',
                  boxShadow: isPlaying ? '0 0 12px rgba(239, 68, 68, 0.8)' : '0 0 6px rgba(239, 68, 68, 0.4)'
                }} 
              />
              
              {/* Play status and scroll position indicators */}
              <div className="absolute top-3 right-3 space-y-2 z-40">
                {isPlaying && !isManualScrolling && (
                  <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg opacity-95 font-mono flex items-center gap-2 shadow-lg animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="font-bold">AUTO</span>
                    <div className="text-xs opacity-80">v{speed}x</div>
                  </div>
                )}
                {isManualScrolling && (
                  <div className="bg-yellow-500 text-black text-xs px-3 py-1.5 rounded-lg opacity-95 font-mono flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="font-bold">MANUAL</span>
                    <div className="text-xs opacity-80">🖱️</div>
                  </div>
                )}
                {scrollPosition > 0 && (
                  <div className="bg-gray-800 text-green-400 text-xs px-2 py-1 rounded opacity-90 font-mono border border-green-500/20">
                    {Math.round(scrollPosition)}px
                  </div>
                )}
                <div className="bg-gray-800 text-blue-400 text-xs px-2 py-1 rounded opacity-90 font-mono border border-blue-500/20">
                  {fontSize}px
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Teleprompter:</span>
              <span className={isPlaying ? 'text-green-600' : 'text-red-600'}>
                {isPlaying ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Velocidad:</span>
              <span>{speed}x</span>
            </div>
            <div className="flex justify-between">
              <span>Posición:</span>
              <span>{scrollPosition}px</span>
            </div>
            <div className="flex justify-between">
              <span>Caracteres:</span>
              <span>{text.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Líneas:</span>
              <span>{text.split('\n').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guide Line Settings */}
      <GuideLineSettings
        isOpen={showGuideSettings}
        onClose={() => setShowGuideSettings(false)}
        guideLinePosition={guideLinePosition}
        onGuideLinePositionChange={setGuideLinePosition}
      />
      
      {/* Macros Configuration */}
      <ConfigurationPanel
        isOpen={showMacroConfig}
        onClose={() => setShowMacroConfig(false)}
        macros={macros}
        onMacrosChange={onMacrosChange}
      />
    </div>
  );
}