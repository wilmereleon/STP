/**
 * App v2 - Componente principal refactorizado con Store Architecture
 * App v2 - Refactored main component with Store Architecture
 * 
 * Versión refactorizada que elimina 15+ useState y usa:
 * - useTeleprompterStore() para estado del teleprompter
 * - useRunOrderStore() para run order y navegación
 * - useConfigStore() para configuración
 * - usePersistence() para carga/guardado automático
 * - SyncService en modo 'master' para sincronización de ventanas
 * 
 * Refactored version that eliminates 15+ useState and uses:
 * - useTeleprompterStore() for teleprompter state
 * - useRunOrderStore() for run order and navigation
 * - useConfigStore() for configuration
 * - usePersistence() for automatic load/save
 * - SyncService in 'master' mode for window synchronization
 * 
 * Reducción: 1,158 líneas → ~400 líneas (65% reducción)
 * Reduction: 1,158 lines → ~400 lines (65% reduction)
 * 
 * @version 2.0.0
 * @pattern Observer + Service Layer + Master-Slave + Persistence
 */

// ===== IMPORTACIONES / IMPORTS =====
import { useEffect, useState } from 'react';

// Componentes refactorizados v2 / Refactored v2 components
import { RunOrderPanel } from './components/RunOrderPanel';
import { TeleprompterPreview } from './components/TeleprompterPreview';
import { TeleprompterWindow } from './components/TeleprompterWindow';
import { MainToolbar } from './components/MainToolbar';

// Componentes v1 que aún no tienen v2 / v1 components that don't have v2 yet
import { ScriptEditor } from './components/ScriptEditor';
import { MacroMenu } from './components/MacroMenu';
import { MacroSettings as MacroSettingsType } from './components/useMacros';

// UI Components
import { Toaster } from './components/ui/sonner';

// Hooks del Store / Store hooks
import { 
  useTeleprompterStore, 
  useRunOrderStore, 
  useConfigStore,
  usePersistence 
} from './hooks';

// Servicios / Services
import { syncService } from './services/SyncService';
import { autoScrollService } from './services/AutoScrollService';

/**
 * App v2 - Aplicación principal con arquitectura Store
 * App v2 - Main application with Store architecture
 * 
 * Props eliminados: N/A (componente raíz)
 * Estados eliminados: 15+ useState reemplazados por stores
 * 
 * Eliminated props: N/A (root component)
 * Eliminated states: 15+ useState replaced by stores
 * 
 * @component
 * @returns {JSX.Element} Aplicación completa / Complete application
 * 
 * @example
 * ```tsx
 * // Antes (v1) - 15+ useState, 1,158 líneas
 * const [text, setText] = useState('');
 * const [isPlaying, setIsPlaying] = useState(false);
 * const [speed, setSpeed] = useState(1.0);
 * // ... 12+ más
 * 
 * // Después (v2) - 3 hooks, ~400 líneas
 * const teleprompter = useTeleprompterStore();
 * const runOrder = useRunOrderStore();
 * const config = useConfigStore();
 * const { isInitialized, isLoading } = usePersistence();
 * ```
 */
export default function App() {
  // ===== DETECCIÓN DE VENTANA EMERGENTE / POPUP WINDOW DETECTION =====
  /**
   * Si popup=true en URL, renderiza TeleprompterWindow (modo slave)
   * If popup=true in URL, render TeleprompterWindow (slave mode)
   */
  const isPopupWindow = new URLSearchParams(window.location.search).get('popup') === 'true';
  
  if (isPopupWindow) {
    return <TeleprompterWindow />;
  }

  // ===== STORE INTEGRATION / INTEGRACIÓN CON STORES =====
  /**
   * Reemplaza 15+ useState con 3 hooks de stores
   * Replaces 15+ useState with 3 store hooks
   */
  const {
    text,
    setText,
    isPlaying,
    play,
    pause,
    reset
  } = useTeleprompterStore();
  
  const {
    items: runOrderItems,
    activeItem,
    activeItemId,
    setActiveItem,
    addItem,
    updateItem,
    nextItem,
    previousItem
  } = useRunOrderStore();
  
  const {
    macros: macroSettings,
    setMacros
  } = useConfigStore();
  
  // ===== PERSISTENCE / PERSISTENCIA =====
  /**
   * Hook que maneja carga automática al iniciar y guardado periódico
   * Hook that handles automatic loading on start and periodic saving
   */
  const { isInitialized, isLoading, error: persistenceError } = usePersistence();
  
  // ===== ESTADO LOCAL DE UI / LOCAL UI STATE =====
  /**
   * Solo estados de UI que no necesitan persistencia ni sincronización
   * Only UI states that don't need persistence or synchronization
   */
  const [showMacroMenu, setShowMacroMenu] = useState(false);
  const [showMacroConfig, setShowMacroConfig] = useState(false);
  const [teleprompterWindowRef, setTeleprompterWindowRef] = useState<Window | null>(null);
  
  // ===== EFECTO: INICIALIZAR SYNC SERVICE (MASTER MODE) / EFFECT: INITIALIZE SYNC SERVICE (MASTER MODE) =====
  /**
   * Inicializa SyncService en modo 'master' para controlar ventanas slave
   * Initializes SyncService in 'master' mode to control slave windows
   * 
   * El master es la fuente de verdad y propaga cambios a slaves
   * Master is the source of truth and propagates changes to slaves
   */
  useEffect(() => {
    console.log('🟢 App: initializing SyncService in MASTER mode');
    syncService.initialize('master');
    
    return () => {
      console.log('🔴 App: disposing SyncService');
      syncService.dispose();
    };
  }, []);
  
  // ===== EFECTO: AUTO-SCROLL SERVICE DESHABILITADO / EFFECT: AUTO-SCROLL SERVICE DISABLED =====
  /**
   * ❌ AutoScrollService DESHABILITADO
   * ❌ AutoScrollService DISABLED
   * 
   * El auto-scroll local de TeleprompterScreen está activo.
   * AutoScrollService fue deshabilitado para evitar competencia.
   * 
   * Local auto-scroll in TeleprompterScreen is active.
   * AutoScrollService was disabled to avoid competition.
   */
  /* 
  useEffect(() => {
    console.log('🟢 App: AutoScrollService ready (auto-starts on play)');
    
    return () => {
      console.log('🔴 App: stopping AutoScrollService');
      autoScrollService.stop();
    };
  }, []);
  */
  
  // ===== MANEJADORES DE VENTANAS / WINDOW HANDLERS =====
  
  /**
   * Abre ventana emergente del teleprompter
   * Opens teleprompter popup window
   */
  const handleOpenTeleprompter = () => {
    console.log('🪟 App: opening teleprompter window');
    
    // Cerrar ventana anterior si existe / Close previous window if exists
    if (teleprompterWindowRef && !teleprompterWindowRef.closed) {
      teleprompterWindowRef.close();
    }
    
    // Abrir nueva ventana / Open new window
    const newWindow = window.open(
      '?popup=true',
      'teleprompter',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
    );
    
    if (newWindow) {
      setTeleprompterWindowRef(newWindow);
      console.log('✅ App: teleprompter window opened');
    } else {
      console.error('❌ App: failed to open teleprompter window (popup blocked?)');
    }
  };
  
  // ===== MANEJADORES DE RUN ORDER / RUN ORDER HANDLERS =====
  
  /**
   * Agrega nuevo item al run order
   * Adds new item to run order
   */
  const handleAddItem = () => {
    console.log('➕ App: adding new run order item');
    
    const newItem = {
      id: `${Date.now()}`,
      title: `Script ${runOrderItems.length + 1}`,
      duration: '00:00',
      status: 'ready' as const,
      text: ''
    };
    
    addItem(newItem);
  };
  
  /**
   * Carga múltiples scripts desde un archivo TXT estructurado
   * Loads multiple scripts from a structured TXT file
   * 
   * Formato esperado / Expected format:
   * [1] {TITULO} texto del script
   * [2] {OTRO TITULO} más texto
   * 
   * @param scripts - Array de scripts parseados del archivo
   * @param fileName - Nombre del archivo (usado como prefijo)
   */
  const handleFileLoad = (
    scripts: Array<{id: string, title: string, text: string}>, 
    fileName: string
  ) => {
    console.log(`📄 App: loading ${scripts.length} scripts from "${fileName}"`);
    
    // Agregar cada script como un item del Run Order
    scripts.forEach((script, index) => {
      const newItem = {
        id: `${Date.now()}-${index}`,
        title: script.title,
        duration: '00:00',
        status: 'ready' as const,
        text: script.text,
        sourceFile: fileName // Opcional: guardar referencia al archivo fuente
      };
      
      addItem(newItem);
    });
    
    // Activar el primer script cargado
    if (scripts.length > 0) {
      const firstItemId = `${Date.now()}-0`;
      setTimeout(() => {
        setActiveItem(firstItemId);
        setText(scripts[0].text);
      }, 100);
    }
    
    console.log(`✅ App: ${scripts.length} scripts added to Run Order`);
  };
  
  /**
   * Edita un item del run order (cambia al editor)
   * Edits a run order item (switches to editor)
   */
  const handleEditItem = (id: string) => {
    console.log('✏️ App: editing item', id);
    setActiveItem(id);
    
    // Cargar texto del item al editor / Load item text to editor
    const item = runOrderItems.find(i => i.id === id);
    if (item) {
      setText(item.text);
    }
  };
  
  /**
   * Maneja cambios en el editor de texto
   * Handles changes in text editor
   */
  const handleTextChange = (newText: string) => {
    console.log('📝 App: text changed', newText.length, 'chars');
    setText(newText);
    
    // Actualizar el item activo en el run order / Update active item in run order
    if (activeItemId) {
      updateItem(activeItemId, { text: newText });
    }
  };
  
  // ===== MANEJADORES DE MACROS / MACRO HANDLERS =====
  
  /**
   * Maneja cambios en la configuración de macros
   * Handles changes in macro configuration
   */
  const handleMacrosChange = (newMacros: MacroSettingsType) => {
    console.log('⚙️ App: macros configuration changed');
    setMacros(newMacros as any); // Cast necesario por incompatibilidad de tipos / Cast needed for type incompatibility
  };
  
  /**
   * Toggle del menú de macros
   * Toggles macro menu
   */
  const handleToggleMacroMenu = () => {
    console.log('📋 App: toggling macro menu');
    setShowMacroMenu(prev => !prev);
  };
  
  // ===== MANEJADORES DE TECLADO GLOBALES / GLOBAL KEYBOARD HANDLERS =====
  /**
   * Atajos de teclado globales de la aplicación
   * Global application keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si no está escribiendo en input/textarea / Only process if not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // CTRL/CMD + M = Toggle macro menu / Toggle macro menu
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleToggleMacroMenu();
      }
      
      // ESC = Cerrar menús / Close menus
      if (e.key === 'Escape') {
        setShowMacroMenu(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // ===== PANTALLA DE CARGA / LOADING SCREEN =====
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando teleprompter...</p>
        </div>
      </div>
    );
  }
  
  // ===== PANTALLA DE ERROR / ERROR SCREEN =====
  if (persistenceError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold">Error de inicialización</h1>
          <p className="text-muted-foreground">{persistenceError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  // ===== RENDER PRINCIPAL / MAIN RENDER =====
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ===== TOOLBAR SUPERIOR / TOP TOOLBAR ===== */}
      {/* Barra de herramientas principal estilo WinPlus */}
      <div className="flex-shrink-0 border-b">
        <MainToolbar
          isPlaying={isPlaying}
          currentTime="00:00"
          onPlay={play}
          onPause={pause}
          onStop={() => { pause(); reset(); }}
          onPrevious={previousItem}
          onNext={nextItem}
          onSettings={() => {/* TODO: Abrir settings */}}
          onFullscreen={handleOpenTeleprompter}
          onSave={() => {/* TODO: Guardar */}}
          onOpen={() => {/* TODO: Abrir archivo */}}
          isPrompting={isPlaying}
        />
      </div>

      {/* ===== LAYOUT DE 3 PANELES HORIZONTAL / 3-PANEL HORIZONTAL LAYOUT ===== */}
      {/* Layout horizontal estilo WinPlus: RunOrder | Editor | Preview */}
      <div className="flex-1 flex flex-row gap-0 min-h-0 overflow-hidden">
        
        {/* ===== PANEL IZQUIERDO: RUN ORDER / LEFT PANEL: RUN ORDER ===== */}
        {/* Ancho fijo 280px según diseño WinPlus */}
        <div className="w-[280px] flex-shrink-0 border-r h-full overflow-auto">
          <RunOrderPanel
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
          />
        </div>
        
        {/* ===== PANEL CENTRAL: EDITOR / CENTER PANEL: EDITOR ===== */}
        {/* Flex-1 para ocupar espacio restante */}
        <div className="flex-1 min-w-0 h-full overflow-auto border-r" style={{backgroundColor: '#f5f5f5', minWidth: '300px'}}>
          <ScriptEditor
            text={text}
            onTextChange={handleTextChange}
            currentScript={activeItem?.title || 'Sin título'}
            onFileLoad={handleFileLoad}
            macros={macroSettings}
            onMacrosChange={setMacros}
          />
        </div>
        
        {/* ===== PANEL DERECHO: PREVIEW / RIGHT PANEL: PREVIEW ===== */}
        {/* Ancho fijo 400px según diseño WinPlus */}
        <div className="preview-panel-wrapper w-[400px] h-full flex-shrink-0 border-r" style={{ maxWidth: '400px', minWidth: '400px', width: '400px', overflow: 'hidden' }}>
          <TeleprompterPreview
            onOpenTeleprompter={handleOpenTeleprompter}
          />
        </div>
      </div>
      
      {/* ===== MENÚ DE MACROS / MACRO MENU ===== */}
      {showMacroMenu && (
        <MacroMenu
          isOpen={showMacroMenu}
          onClose={() => setShowMacroMenu(false)}
          macros={macroSettings as any}
          onOpenFullConfig={() => {
            setShowMacroMenu(false);
            setShowMacroConfig(true);
          }}
        />
      )}
      
      {/* ===== TOAST NOTIFICATIONS ===== */}
      <Toaster />
    </div>
  );
}
