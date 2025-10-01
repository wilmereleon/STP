import { useState, useEffect, useRef, useCallback } from 'react';
import { useMacros, defaultMacroSettings, MacroSettings as MacroSettingsType } from './components/useMacros';

// Define MacroKey type based on macroSettings keys
type MacroKey = keyof typeof defaultMacroSettings;
import { RunOrderList } from './components/RunOrderList';
import { ScriptEditor } from './components/ScriptEditor';
import { TeleprompterPreview } from './components/TeleprompterPreview';
import { TeleprompterControls } from './components/TeleprompterControls';
import { TeleprompterWindow } from './components/TeleprompterWindow';
import { TeleprompterModal } from './components/TeleprompterModal';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { MacroMenu } from './components/MacroMenu';
import { Toaster } from './components/ui/sonner';

interface RunOrderItem {
  id: string;
  title: string;
  duration: string;
  status: 'ready' | 'playing' | 'completed';
  text: string;
}



export default function App() {
  // Check if this is a teleprompter popup window
  const isPopupWindow = new URLSearchParams(window.location.search).get('popup') === 'true';
  
  if (isPopupWindow) {
    return <TeleprompterWindow />;
  }

  const [text, setText] = useState('');
  const [scriptTexts, setScriptTexts] = useState<{[key: string]: string}>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0); // Velocidad mucho más lenta
  const [fontSize, setFontSize] = useState(200);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentScript, setCurrentScript] = useState('How To Script.awn');
  const [loadedFileName, setLoadedFileName] = useState<string | undefined>(undefined);
  const [isTeleprompterModalOpen, setIsTeleprompterModalOpen] = useState(false);
  const [showMacroConfig, setShowMacroConfig] = useState(false);
  const [showMacroMenu, setShowMacroMenu] = useState(false);
  const [jumpMarkers, setJumpMarkers] = useState<{[key: string]: number}>({});
  const teleprompterWindowRef = useRef<Window | null>(null);
  
  // Flag to prevent postMessage loops between windows
  const isUpdatingFromPopup = useRef(false);

  const [runOrderItems, setRunOrderItems] = useState<RunOrderItem[]>([
    { id: '1', title: 'INTRO/TECH SCRIPTS ROLLING', duration: '00:01:15', status: 'ready', text: '[1] KEEPING THOSE SCRIPTS ROLLING:\n\nTeleprompter - the unsung hero in the broadcast chain - a critical element, to be sure, but one too often taken for granted as just another tool - a critical essential, to be work.\n\nWhile the teleprompter has been around for decades, helping anchors and reporters deliver news with confidence and eye contact, its role in modern broadcasting has evolved significantly.' },
    { id: '2', title: 'Intro/VTr', duration: '00:02:36', status: 'ready', text: '' },
    { id: '3', title: 'Pre-oil getting things going', duration: '00:01:40', status: 'ready', text: '' },
    { id: '4', title: 'No Problems', duration: '00:03:28', status: 'ready', text: '' },
    { id: '5', title: 'Support', duration: '00:05:18', status: 'ready', text: '' },
    { id: '6', title: 'Inbox Recovery', duration: '00:01:47', status: 'ready', text: '' },
    { id: '7', title: 'Traditional prompting systems', duration: '00:01:50', status: 'ready', text: '' },
    { id: '8', title: 'The Tools', duration: '00:04:32', status: 'ready', text: '' },
    { id: '9', title: 'Overview', duration: '00:01:01', status: 'ready', text: '' },
    { id: '10', title: 'Equipment Not Required', duration: '00:01:17', status: 'ready', text: '' },
    { id: '11', title: 'Product', duration: '00:01:17', status: 'ready', text: '' },
    { id: '12', title: 'Redundancy', duration: '00:05:19', status: 'ready', text: '' },
    { id: '13', title: 'Performance', duration: '00:08:20', status: 'ready', text: '' }
  ]);

  const [currentItem, setCurrentItem] = useState<string | null>('1');
  // Macro settings state (for useMacros)
  const [macroSettings, setMacroSettings] = useState<MacroSettingsType>(() => {
    // Try to load from localStorage for persistence
    try {
      const saved = localStorage.getItem('macroSettings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultMacroSettings;
  });

  // Persist macro settings
  useEffect(() => {
    localStorage.setItem('macroSettings', JSON.stringify(macroSettings));
  }, [macroSettings]);

  // Enhanced setFontSize with immediate feedback and logging
  const handleSetFontSize = (size: number) => {
    console.log('🔴 App.handleSetFontSize CALLED with:', size, 'current fontSize:', fontSize);
    const newSize = Math.max(12, Math.min(500, size));
    console.log('🔴 App.handleSetFontSize - calculated newSize:', newSize);
    
    // Log the actual state change
    console.log('🔴 App.handleSetFontSize - calling setFontSize with:', newSize);
    setFontSize(newSize);
    
    // Send to teleprompter window immediately if open
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed) {
      console.log('🔴 App.handleSetFontSize - sending to teleprompter window:', newSize);
      teleprompterWindowRef.current.postMessage({
        type: 'TELEPROMPTER_UPDATE',
        data: { text, isPlaying, speed, fontSize: newSize, scrollPosition }
      }, '*');
    }
    
    // Verification after state update
    setTimeout(() => {
      console.log('🔴 App.handleSetFontSize - VERIFICATION: fontSize should now be:', newSize);
    }, 100);
  };

  // Debug effects to monitor critical state changes
  useEffect(() => {
    console.log('🔵 STATE CHANGE - isPlaying:', isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    console.log('🔵 STATE CHANGE - fontSize:', fontSize);
  }, [fontSize]);

  const handleEnd = () => {
    console.log('🔚 Auto-advance: Current script ended, checking for next script...');
    
    // Auto-advance to next script if available
    if (currentItem) {
      const currentIndex = runOrderItems.findIndex(item => item.id === currentItem);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < runOrderItems.length) {
        const nextItem = runOrderItems[nextIndex];
        console.log('🔚 Auto-advance: Moving to next script:', nextItem.title);
        
        // Mark current as completed
        const updatedItems = runOrderItems.map(item => 
          item.id === currentItem ? { ...item, status: 'completed' as const } : item
        );
        setRunOrderItems(updatedItems);
        
        // Move to next script
        setCurrentItem(nextItem.id);
        setScrollPosition(0);
        setText(nextItem.text);
        setCurrentScript(nextItem.title + '.awn');
        
        // Continue playing if there's content
        if (nextItem.text.trim()) {
          console.log('🔚 Auto-advance: Continuing playback with next script');
          setIsPlaying(true);
        } else {
          console.log('🔚 Auto-advance: Next script is empty, stopping playback');
          setIsPlaying(false);
        }
      } else {
        console.log('🔚 Auto-advance: End of run order reached');
        setIsPlaying(false);
        
        // Mark current as completed
        const updatedItems = runOrderItems.map(item => 
          item.id === currentItem ? { ...item, status: 'completed' as const } : item
        );
        setRunOrderItems(updatedItems);
      }
    } else {
      console.log('🔚 Auto-advance: No current item, just stopping');
      setIsPlaying(false);
    }
  };

  // Auto scroll effect with auto-advance detection (MUCH slower speeds)
  useEffect(() => {
    let interval: number | null = null;
    
    if (isPlaying && text.trim()) {
      console.log('🟡 Auto-scroll STARTED - speed:', speed, 'scrollPosition:', scrollPosition);
      interval = window.setInterval(() => {
        setScrollPosition(prev => {
          // Don't scroll if we're at the very beginning and just reset
          if (prev === 0 && !isPlaying) {
            console.log('🟡 Auto-scroll: Reset state detected, not scrolling');
            return 0;
          }
          
          const increment = speed * 0.5; // Mucho más lento: 0.5 en lugar de 3
          const newPos = prev + increment;
          console.log('🟡 Auto-scroll tick:', prev, '->', newPos, 'increment:', increment);
          
          // Estimate if we've reached the end of the text
          // This is an approximation - we'll trigger auto-advance when scroll position gets very high
          const estimatedTextHeight = text.split('\n').length * 40; // Approximate line height
          const viewportHeight = 800; // Approximate viewport height
          const maxScrollNeeded = estimatedTextHeight + viewportHeight;
          
          if (newPos > maxScrollNeeded && text.trim()) {
            console.log('🔚 Auto-scroll: End of text detected, triggering auto-advance');
            setTimeout(() => handleEnd(), 1000); // 1 second delay before advancing
            return prev; // Don't update scroll position further
          }
          
          return newPos;
        });
      }, 100); // Intervalo más lento: 100ms en lugar de 40ms
    } else {
      console.log('🟡 Auto-scroll STOPPED - isPlaying:', isPlaying, 'hasText:', !!text.trim());
    }
    
    return () => {
      if (interval !== null) {
        console.log('🟡 Auto-scroll cleanup');
        window.clearInterval(interval);
      }
    };
  }, [isPlaying, speed, text, scrollPosition]);

  // Update text when current item changes
  useEffect(() => {
    if (currentItem) {
      const item = runOrderItems.find(item => item.id === currentItem);
      if (item) {
        setText(item.text);
        setCurrentScript(item.title + '.awn');
      }
    }
  }, [currentItem, runOrderItems]);

  // Listen for messages from teleprompter window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TELEPROMPTER_READY') {
        // Send initial data to teleprompter window
        sendToTeleprompter();
      } else if (event.data.type === 'TELEPROMPTER_CONTROL') {
        // Update local state from teleprompter controls
        console.log('📩 Received TELEPROMPTER_CONTROL from popup:', event.data.data);
        
        // Set flag to prevent sending updates back to popup
        isUpdatingFromPopup.current = true;
        
        const updates = event.data.data;
        if (updates.hasOwnProperty('isPlaying')) {
          console.log('📩 Updating isPlaying to:', updates.isPlaying);
          setIsPlaying(updates.isPlaying);
        }
        if (updates.hasOwnProperty('speed')) {
          console.log('📩 Updating speed to:', updates.speed);
          setSpeed(updates.speed);
        }
        if (updates.hasOwnProperty('fontSize')) {
          console.log('📩 Updating fontSize to:', updates.fontSize);
          setFontSize(updates.fontSize);
        }
        if (updates.hasOwnProperty('scrollPosition')) {
          console.log('📩 Updating scrollPosition to:', updates.scrollPosition);
          setScrollPosition(updates.scrollPosition);
        }
        
        // Reset flag after a short delay
        setTimeout(() => {
          isUpdatingFromPopup.current = false;
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // Remover dependencias para evitar re-crear el listener


  // Macro actions for useMacros
  // Helper: get all cue/guion marker positions in the text
  function getCuePositions(text: string): number[] {
    const lines = text.split('\n');
    let positions: number[] = [];
    let currentPos = 0;
    for (const line of lines) {
      // Match [1], [2], ... or lines with all caps and colon, or markdown headings
      if (/^(\[\d+\])/.test(line) || /^(#{1,3}\s+.+|[A-Z][A-Z\s]+:|^\*\*.+\*\*)/.test(line)) {
        positions.push(currentPos);
      }
      currentPos += line.length + 1;
    }
    return positions;
  }

  const handleNextCue = useCallback(() => {
    const positions = getCuePositions(text);
    const current = scrollPosition;
    const next = positions.find(pos => pos > current + 10);
    if (typeof next === 'number') {
      setScrollPosition(next);
    }
  }, [text, scrollPosition]);

  const handlePreviousCue = useCallback(() => {
    const positions = getCuePositions(text);
    const current = scrollPosition;
    const prev = [...positions].reverse().find(pos => pos < current - 10);
    if (typeof prev === 'number') {
      setScrollPosition(prev);
    }
  }, [text, scrollPosition]);

  // Send data to teleprompter window
  const sendToTeleprompter = () => {
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed) {
      const dataToSend = { text, isPlaying, speed, fontSize, scrollPosition };
      console.log('📤 Sending to teleprompter:', dataToSend);
      teleprompterWindowRef.current.postMessage({
        type: 'TELEPROMPTER_UPDATE',
        data: dataToSend
      }, '*');
    }
  };

  // Update teleprompter window when TEXT changes (not for other state changes)
  useEffect(() => {
    // Solo enviar cuando cambia el texto, no cuando cambian otros estados
    // que pueden venir de la ventana desplegable
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed && !isUpdatingFromPopup.current) {
      console.log('📤 Text changed, sending update');
      sendToTeleprompter();
    }
  }, [text]); // Solo cuando cambia el texto
  
  // Para isPlaying, usar un pequeño debounce para evitar loops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed && !isUpdatingFromPopup.current) {
        console.log('📤 isPlaying changed, sending update');
        sendToTeleprompter();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  const handleOpenTeleprompter = () => {
    const features = 'width=1200,height=800,scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no';
    teleprompterWindowRef.current = window.open(
      `${window.location.origin}${window.location.pathname}?popup=true`,
      'teleprompter',
      features
    );
  };

  const handleOpenTeleprompterModal = () => {
    setIsTeleprompterModalOpen(true);
  };

  const handleCloseTeleprompterModal = () => {
    setIsTeleprompterModalOpen(false);
  };

  // Define handlePlayPause BEFORE using it in macroActions
  const handlePlayPause = () => {
    console.log('🟢 App.handlePlayPause called - current isPlaying:', isPlaying);
    setIsPlaying(prev => {
      const newState = !prev;
      console.log('🟢 App.handlePlayPause - setting isPlaying to:', newState);
      return newState;
    });
  };

  const handleTeleprompterStateChange = (isPlaying: boolean, speed: number, fontSize: number, scrollPosition: number) => {
    setIsPlaying(isPlaying);
    setSpeed(speed);
    setFontSize(fontSize);
    setScrollPosition(scrollPosition);
  };

  // macroActions defined AFTER handlePlayPause
  const macroActions = {
    onPlayStop: useCallback(() => handlePlayPause(), []),
    onPause: useCallback(() => setIsPlaying(false), []),
    onPrevious: useCallback(() => handleBackward(), [currentItem, runOrderItems]),
    onNext: useCallback(() => handleForward(), [currentItem, runOrderItems]),
    onIncreaseSpeed: useCallback(() => handleSpeedChange(Math.min(5, speed + 0.1)), [speed]),
    onDecreaseSpeed: useCallback(() => handleSpeedChange(Math.max(0.1, speed - 0.1)), [speed]),
    onIncreaseFontSize: useCallback(() => handleSetFontSize(fontSize + 2), [fontSize]),
    onDecreaseFontSize: useCallback(() => handleSetFontSize(fontSize - 2), [fontSize]),
    onNextCue: handleNextCue,
    onPreviousCue: handlePreviousCue,
  };

  useMacros(macroSettings, macroActions, !(showMacroConfig || showMacroMenu || isTeleprompterModalOpen));

  const handleReset = () => {
    console.log('🟢 App.handleReset called - Resetting teleprompter to initial state');
    console.log('🟢 Before reset - isPlaying:', isPlaying, 'scrollPosition:', scrollPosition);
    
    // Force stop playback first
    setIsPlaying(false);
    
    // Reset to beginning of current script
    setScrollPosition(0);
    
    // Send message to teleprompter window if open
    if (teleprompterWindowRef.current && !teleprompterWindowRef.current.closed) {
      teleprompterWindowRef.current.postMessage({
        type: 'TELEPROMPTER_UPDATE',
        data: { text, isPlaying: false, speed, fontSize, scrollPosition: 0 }
      }, '*');
    }
    
    console.log('🟢 After reset - State should be: isPlaying: false, scrollPosition: 0');
    
    // Force re-render with timeout to ensure state update
    setTimeout(() => {
      console.log('🟢 Reset verification - isPlaying:', false, 'scrollPosition:', 0);
    }, 100);
  };

  const executeMacroAction = (action: string) => {
    console.log('MACRO: Executing action:', action);
    switch(action) {
      case 'play_pause':
        console.log('MACRO: Calling handlePlayPause');
        handlePlayPause();
        break;
      case 'reset':
        console.log('MACRO: Calling handleReset');
        handleReset();
        break;
      case 'stop':
        console.log('MACRO: Calling handleStop');
        handleStop();
        break;
      case 'forward':
        console.log('MACRO: Calling handleForward');
        handleForward();
        break;
      case 'backward':
        console.log('MACRO: Calling handleBackward');
        handleBackward();
        break;
      case 'speed_up':
        console.log('MACRO: Speed up from', speed);
        handleSpeedChange(Math.min(5, speed + 0.1)); // Incrementos más pequeños
        break;
      case 'speed_down':
        console.log('MACRO: Speed down from', speed);
        handleSpeedChange(Math.max(0.1, speed - 0.1)); // Mínimo más bajo
        break;
      case 'font_size_up':
        console.log('MACRO: Font size up from', fontSize);
        handleSetFontSize(Math.min(500, fontSize + 8));
        break;
      case 'font_size_down':
        console.log('MACRO: Font size down from', fontSize);
        handleSetFontSize(Math.max(12, fontSize - 8));
        break;
      case 'scroll_up':
        console.log('MACRO: Scroll up from', scrollPosition);
        setScrollPosition(prev => Math.max(0, prev - 50));
        break;
      case 'scroll_down':
        console.log('MACRO: Scroll down from', scrollPosition);
        setScrollPosition(prev => prev + 50);
        break;
    }
  };

  const handleAddItem = () => {
    const newId = (runOrderItems.length + 1).toString();
    const newItem: RunOrderItem = {
      id: newId,
      title: 'Nuevo Script',
      duration: '00:00:00',
      status: 'ready',
      text: ''
    };
    setRunOrderItems([...runOrderItems, newItem]);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (currentItem) {
      const updatedItems = runOrderItems.map(item => 
        item.id === currentItem ? { ...item, text: newText } : item
      );
      setRunOrderItems(updatedItems);
    }
    
    // Generar marcadores de salto automáticamente
    generateJumpMarkers(newText);
  };

  const generateJumpMarkers = (text: string) => {
    const markers: {[key: string]: number} = {};
    const lines = text.split('\n');
    let currentPosition = 0;
    
    lines.forEach((line, index) => {
      // Buscar marcadores de sección como [1], [2], etc. o títulos
      const sectionMatch = line.match(/^\[(\d+)\]/);
      const titleMatch = line.match(/^#{1,3}\s+(.+)/) || line.match(/^[A-Z][A-Z\s]+:/) || line.match(/^\*\*(.+)\*\*/);
      
      if (sectionMatch) {
        const sectionNumber = sectionMatch[1];
        markers[`Sección ${sectionNumber}`] = currentPosition;
      } else if (titleMatch && line.trim().length > 0) {
        const title = titleMatch[1] || line.trim();
        markers[title.substring(0, 30)] = currentPosition;
      }
      
      currentPosition += line.length + 1; // +1 para el salto de línea
    });
    
    setJumpMarkers(markers);
  };

  const handleJumpToPosition = (position: number) => {
    console.log('🎯 Saltando a posición:', position);
    setScrollPosition(position * 2); // Factor de conversión aproximado
    setIsPlaying(false); // Pausar para que el usuario vea el salto
  };

  const handleJumpToScript = (scriptId: string) => {
    console.log('🎯 Saltando a script:', scriptId);
    
    // Buscar el script por ID
    const targetScript = runOrderItems.find(item => item.id === scriptId);
    if (!targetScript) {
      console.log('🎯 Script no encontrado:', scriptId);
      return;
    }
    
    console.log('🎯 Saltando a:', targetScript.title);
    
    // Cambiar al script seleccionado
    setCurrentItem(scriptId);
    setText(targetScript.text);
    setCurrentScript(targetScript.title + '.awn');
    setScrollPosition(0); // Empezar desde el principio
    
    // Marcar como playing y empezar inmediatamente
    setIsPlaying(true);
    
    // Actualizar el estado del script actual como playing
    const updatedItems = runOrderItems.map(item => ({
      ...item,
      status: item.id === scriptId ? 'ready' as const : item.status
    }));
    setRunOrderItems(updatedItems);
    
    console.log('🎯 Script iniciado automáticamente:', targetScript.title);
  };

  const handleItemSelect = (id: string) => {
    setCurrentItem(id);
    const item = runOrderItems.find(item => item.id === id);
    if (item) {
      setText(item.text);
      setCurrentScript(item.title + '.awn');
    }
  };

  const handleStop = () => {
    console.log('🟢 App.handleStop called - Calling handleReset for consistency');
    handleReset(); // Use the same logic as reset
  };

  const handleForward = () => {
    console.log('🟢 App.handleForward called - navigating to next script in Run Order');
    if (!currentItem) return;
    
    const currentIndex = runOrderItems.findIndex(item => item.id === currentItem);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < runOrderItems.length) {
      const nextItem = runOrderItems[nextIndex];
      console.log('🟢 Moving from script:', runOrderItems[currentIndex]?.title, 'to:', nextItem.title);
      setCurrentItem(nextItem.id);
      setScrollPosition(0); // Reset scroll position for new script
      setText(nextItem.text);
      setCurrentScript(nextItem.title + '.awn');
    } else {
      console.log('🟢 Already at last script in Run Order');
    }
  };

  const handleBackward = () => {
    console.log('🟢 App.handleBackward called - navigating to previous script in Run Order');
    if (!currentItem) return;
    
    const currentIndex = runOrderItems.findIndex(item => item.id === currentItem);
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevItem = runOrderItems[prevIndex];
      console.log('🟢 Moving from script:', runOrderItems[currentIndex]?.title, 'to:', prevItem.title);
      setCurrentItem(prevItem.id);
      setScrollPosition(0); // Reset scroll position for new script
      setText(prevItem.text);
      setCurrentScript(prevItem.title + '.awn');
    } else {
      console.log('🟢 Already at first script in Run Order');
    }
  };
  
  const handleSpeedChange = (newSpeed: number) => {
    console.log('App.Speed change:', speed, '->', newSpeed);
    setSpeed(newSpeed);
  };

  const handleReorderItems = (dragIndex: number, hoverIndex: number) => {
    const dragItem = runOrderItems[dragIndex];
    const newItems = [...runOrderItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setRunOrderItems(newItems);
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    console.log('🟢 Updating title for item:', id, 'to:', newTitle);
    const updatedItems = runOrderItems.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    );
    setRunOrderItems(updatedItems);
    
    // Update current script name if this is the current item
    if (currentItem === id) {
      setCurrentScript(newTitle + '.awn');
    }
  };

  const handleFileLoad = (scripts: Array<{id: string, title: string, text: string}>, fileName: string) => {
    // Convert parsed scripts to RunOrderItems
    const newItems: RunOrderItem[] = scripts.map((script) => ({
      id: script.id,
      title: script.title,
      duration: '00:00:00', // Default duration
      status: 'ready' as const,
      text: script.text
    }));

    // Replace current run order with loaded scripts
    setRunOrderItems(newItems);
  setLoadedFileName(fileName);
    
    // Select the first script
    if (newItems.length > 0) {
      setCurrentItem(newItems[0].id);
      setText(newItems[0].text);
      setCurrentScript(newItems[0].title + '.awn');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-800">
      {/* Top Toolbar */}
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="text-white text-sm font-medium">AutoScript</div>
          <div className="text-gray-400 text-xs">
            PROMPTING | 14:53:05
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowMacroMenu(!showMacroMenu)}
              className="text-gray-400 hover:text-white px-2 py-1 rounded text-sm"
            >
              ⌨️ Atajos
            </button>
            {/* MacroMenu can be updated to show macroSettings if needed */}
            <MacroMenu 
              isOpen={showMacroMenu}
              onClose={() => setShowMacroMenu(false)}
              macros={macroSettings}
              onOpenFullConfig={() => setShowMacroConfig(true)}
            />
          </div>
          <TeleprompterControls
            isPlaying={isPlaying}
            speed={speed}
            fontSize={fontSize}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onStop={handleStop}
            onForward={handleForward}
            onBackward={handleBackward}
            onSpeedChange={handleSpeedChange}
            onFontSizeChange={handleSetFontSize}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Run Order */}
        <div className="w-64 border-r border-gray-700">
          <RunOrderList
            items={runOrderItems}
            currentItem={currentItem}
            onItemSelect={handleItemSelect}
            onAddItem={handleAddItem}
            onReorderItems={handleReorderItems}
            onJumpToScript={handleJumpToScript}
            onTitleChange={handleTitleChange}
          />
        </div>

        {/* Center Panel - Script Editor */}
        <div className="flex-1">
          <ScriptEditor
            text={text}
            onTextChange={handleTextChange}
            currentScript={currentScript}
            onFileLoad={handleFileLoad}
            jumpMarkers={jumpMarkers}
            onJumpToPosition={handleJumpToPosition}
          />
        </div>

        {/* Right Panel - Teleprompter Preview */}
        <div className="w-80 border-l border-gray-700">
          <TeleprompterPreview
            text={text}
            fontSize={fontSize}
            isPlaying={isPlaying}
            scrollPosition={scrollPosition}
            speed={speed}
            onOpenTeleprompter={handleOpenTeleprompter}
            onOpenTeleprompterModal={handleOpenTeleprompterModal}
            onFontSizeChange={handleSetFontSize}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            fileName={loadedFileName}
            macros={macroSettings}
            onMacrosChange={setMacroSettings}
            onSpeedChange={handleSpeedChange}
            onScrollPositionChange={setScrollPosition}
            onJumpToPosition={handleJumpToPosition}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 bg-gray-900 border-t border-gray-700 flex items-center px-4">
        <div className="text-xs text-gray-400">
          Run Orders | Story Editor: {loadedFileName || currentScript} | Prompter Preview: {loadedFileName || currentScript}
        </div>
      </div>
      
      <Toaster />
      
      {/* Teleprompter Modal */}
      <TeleprompterModal
        text={text}
        isOpen={isTeleprompterModalOpen}
        onClose={handleCloseTeleprompterModal}
        initialFontSize={fontSize}
        initialSpeed={speed}
        onStateChange={handleTeleprompterStateChange}
        onJumpToPosition={handleJumpToPosition}
      />
      
      {/* Configuration Panel */}
      {/* Macro configuration panel for macroSettings */}
      <ConfigurationPanel
        isOpen={showMacroConfig}
        onClose={() => setShowMacroConfig(false)}
        macros={macroSettings}
        onMacrosChange={setMacroSettings}
      />
    </div>
  );
}