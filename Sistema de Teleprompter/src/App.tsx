import { useState, useCallback, useEffect } from "react";
import { RunOrderPanel } from "./components/RunOrderPanel";
import { ScriptEditor } from "./components/ScriptEditor";
import { TeleprompterPanel } from "./components/TeleprompterPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { MainToolbar } from "./components/MainToolbar";
import { FloatingTeleprompter } from "./components/FloatingTeleprompter";
import { useMacros, defaultMacroSettings, MacroSettings } from "./components/useMacros";

interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  script: string;
  isActive: boolean;
}

export default function App() {
  const [runOrder, setRunOrder] = useState<RunOrderItem[]>([
    {
      id: '1',
      title: 'Introduction',
      duration: '00:02:30',
      script: `Welcome to our teleprompter system demonstration.

This is the introduction segment where we explain the key features and capabilities of the system.

The teleprompter allows for smooth, professional delivery of content with adjustable speed and formatting options.`,
      isActive: false
    },
    {
      id: '2',
      title: 'Main Content',
      duration: '00:05:45',
      script: `This is the main content section of our script.

Here we dive deep into the topic at hand, providing detailed information and key points that need to be covered during the presentation.

The system supports real-time editing and immediate preview updates.`,
      isActive: true
    },
    {
      id: '3',
      title: 'Conclusion',
      duration: '00:01:15',
      script: `In conclusion, this teleprompter system provides professional-grade functionality for content creators and broadcasters.

Thank you for watching this demonstration.

For more information, please visit our website.`,
      isActive: false
    }
  ]);

  const [activeItemId, setActiveItemId] = useState<string>('2');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [currentTime, setCurrentTime] = useState('14:53:21');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isDetached, setIsDetached] = useState(false);
  const [macroSettings, setMacroSettings] = useState<MacroSettings>(defaultMacroSettings);

  const [settings, setSettings] = useState({
    brightness: 85,
    fontSize: 32,
    scrollSpeed: 2, // Default speed 2x
    backgroundColor: '#000000',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    enableMirror: false,
    enableOutline: false,
    margins: 40
  });

  const activeItem = runOrder.find(item => item.id === activeItemId);
  const currentScript = activeItem?.script || '';
  const currentTitle = activeItem?.title || 'No Selection';

  const handleScriptChange = useCallback((newScript: string) => {
    setRunOrder(prev => prev.map(item => 
      item.id === activeItemId 
        ? { ...item, script: newScript }
        : item
    ));
  }, [activeItemId]);

  const handleSelectItem = useCallback((id: string) => {
    setActiveItemId(id);
    setIsPlaying(false);
  }, []);

  const handleAddItem = () => {
    const newId = Date.now().toString();
    const newItem: RunOrderItem = {
      id: newId,
      title: 'New Item',
      duration: '00:00:30',
      script: 'Enter your script here...',
      isActive: false
    };
    setRunOrder(prev => [...prev, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setRunOrder(prev => prev.filter(item => item.id !== id));
    if (activeItemId === id && runOrder.length > 1) {
      const currentIndex = runOrder.findIndex(item => item.id === id);
      const nextItem = runOrder[currentIndex + 1] || runOrder[currentIndex - 1];
      if (nextItem) {
        setActiveItemId(nextItem.id);
      }
    }
  };

  const handleEditItem = (id: string) => {
    const newTitle = prompt('Enter new title:');
    if (newTitle) {
      setRunOrder(prev => prev.map(item => 
        item.id === id 
          ? { ...item, title: newTitle }
          : item
      ));
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPrompting(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPrompting(false);
    setShouldReset(true);
  };

  const handlePrevious = () => {
    const currentIndex = runOrder.findIndex(item => item.id === activeItemId);
    if (currentIndex > 0) {
      setActiveItemId(runOrder[currentIndex - 1].id);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    const currentIndex = runOrder.findIndex(item => item.id === activeItemId);
    if (currentIndex < runOrder.length - 1) {
      setActiveItemId(runOrder[currentIndex + 1].id);
      setIsPlaying(false);
    }
  };

  const handleResetComplete = () => {
    setShouldReset(false);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(runOrder, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'runorder.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setRunOrder(data);
            if (data.length > 0) {
              setActiveItemId(data[0].id);
            }
          } catch (error) {
            alert('Error loading file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDetachTeleprompter = () => {
    setIsDetached(true);
  };

  const handleAttachTeleprompter = () => {
    setIsDetached(false);
  };

  const handleIncreaseSpeed = () => {
    setSettings(prev => ({
      ...prev,
      scrollSpeed: Math.min(prev.scrollSpeed + 1, 10)
    }));
  };

  const handleDecreaseSpeed = () => {
    setSettings(prev => ({
      ...prev,
      scrollSpeed: Math.max(prev.scrollSpeed - 1, 1)
    }));
  };

  const handleFontSizeChange = (newSize: number) => {
    setSettings(prev => ({
      ...prev,
      fontSize: newSize
    }));
  };

  // Setup keyboard macros
  useMacros(macroSettings, {
    onPlayStop: isPlaying ? handleStop : handlePlay,
    onPause: handlePause,
    onPrevious: handlePrevious,
    onNext: handleNext,
    onIncreaseSpeed: handleIncreaseSpeed,
    onDecreaseSpeed: handleDecreaseSpeed
  });

  // Prevent page scroll when teleprompter is playing
  useEffect(() => {
    if (isPlaying) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPlaying]);

  return (
    <div className={`h-screen bg-background flex flex-col ${isPlaying ? 'overflow-hidden' : ''}`}>
      {/* Main Toolbar */}
      <MainToolbar
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSettings={() => setIsSettingsOpen(true)}
        onFullscreen={handleFullscreen}
        onSave={handleSave}
        onOpen={handleOpen}
        isPrompting={isPrompting}
      />

      {/* Three-panel layout */}
      <div className="flex-1 flex min-h-0 gap-1 p-1">
        {/* Left Panel - Run Order */}
        <div className="w-80 min-w-[320px]">
          <RunOrderPanel
            runOrder={runOrder}
            activeItemId={activeItemId}
            onSelectItem={handleSelectItem}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
          />
        </div>

        {/* Middle Panel - Script Editor */}
        <div className="flex-1 min-w-0">
          <ScriptEditor
            script={currentScript}
            onScriptChange={handleScriptChange}
            title={currentTitle}
          />
        </div>

        {/* Right Panel - Teleprompter */}
        {!isDetached && (
          <div className="w-96 min-w-[384px]">
            <TeleprompterPanel
              script={currentScript}
              isPlaying={isPlaying}
              speed={settings.scrollSpeed}
              fontSize={settings.fontSize}
              shouldReset={shouldReset}
              onResetComplete={handleResetComplete}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onFullscreen={handleFullscreen}
              onDetach={handleDetachTeleprompter}
              onFontSizeChange={handleFontSizeChange}
              onSpeedChange={(newSpeed) => setSettings(prev => ({ ...prev, scrollSpeed: newSpeed }))}
            />
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        macroSettings={macroSettings}
        onSettingsChange={setSettings}
        onMacroSettingsChange={setMacroSettings}
      />

      {/* Floating Teleprompter */}
      {isDetached && (
        <FloatingTeleprompter
          script={currentScript}
          isPlaying={isPlaying}
          speed={settings.scrollSpeed}
          fontSize={settings.fontSize}
          shouldReset={shouldReset}
          onResetComplete={handleResetComplete}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClose={handleAttachTeleprompter}
          onFontSizeChange={handleFontSizeChange}
          onSpeedChange={(newSpeed) => setSettings(prev => ({ ...prev, scrollSpeed: newSpeed }))}
          settings={{
            backgroundColor: settings.backgroundColor,
            textColor: settings.textColor,
            fontFamily: settings.fontFamily,
            enableOutline: settings.enableOutline,
            margins: settings.margins
          }}
        />
      )}
    </div>
  );
}