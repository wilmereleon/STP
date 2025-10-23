# PLAN DE REFACTORIZACIÓN - Sistema de Teleprompter
**Versión**: 2.0.0  
**Fecha**: 2025-10-15  
**Autor**: Equipo de Desarrollo

---

## 📋 RESUMEN EJECUTIVO

### Problemas Identificados en Pruebas CN
Del reporte de Melqui (2025-10-01):
- **35 pruebas aprobadas** (46.7%)
- **31 pruebas fallidas** (41.3%) 
- **9 N/A** (12.0%)

### Bugs Críticos a Resolver
1. **TP-1**: Play no funciona (CRÍTICO)
2. **VF-3/4/5**: Sincronización entre Preview y ventana emergente
3. **PD-1/2/3**: Falta persistencia de datos
4. **ED-2/3**: Falta formato de texto (Bold, Italic)
5. **CP-4**: Problemas de responsividad

---

## 🎯 OBJETIVOS DE LA REFACTORIZACIÓN

### 1. Arquitectura Mejorada
- ✅ Patrón Flux con estado centralizado
- ✅ Separación de responsabilidades (Stores, Services, UI)
- ✅ Sincronización Maestro-Esclavo
- ✅ Auto-scroll unificado

### 2. Nuevas Funcionalidades
- ✅ Importación desde Excel
- ✅ Persistencia con IndexedDB
- ✅ Editor de texto enriquecido
- ✅ Controles en ventana flotante

### 3. Optimizaciones
- ✅ Reducir instalador de 240MB → 140-160MB
- ✅ Mejorar responsividad
- ✅ Eliminar loops infinitos de postMessage

---

## 📐 ARQUITECTURA PROPUESTA

### Capa de Estado (Stores)
```
src/stores/
├── TeleprompterStore.ts    ← Estado del teleprompter
├── RunOrderStore.ts         ← Items del Run Order
└── ConfigurationStore.ts    ← Macros y configuración
```

**Responsabilidades**:
- Mantener estado centralizado
- Notificar cambios a suscriptores
- Validar datos antes de actualizar
- Sin lógica de UI

### Capa de Servicios (Services)
```
src/services/
├── SyncService.ts           ← Sincronización ventanas
├── AutoScrollService.ts     ← Auto-scroll unificado
├── PersistenceService.ts    ← IndexedDB storage
└── ExcelImportService.ts    ← Importar .xlsx
```

**Responsabilidades**:
- Lógica de negocio compleja
- Comunicación entre ventanas
- Operaciones asíncronas
- Sin acceso directo al DOM

### Capa de Presentación (UI)
```
src/components/
├── App.tsx                  ← Usa hooks simples
├── panels/
│   ├── RunOrderPanel.tsx
│   ├── EditorPanel.tsx
│   └── PreviewPanel.tsx
├── windows/
│   ├── TeleprompterWindow.tsx
│   └── TeleprompterModal.tsx
└── controls/
    ├── TransportControls.tsx
    ├── MacroControls.tsx
    └── SettingsPanel.tsx
```

**Responsabilidades**:
- Solo renderizado
- Event handlers simples
- Llamadas a Store
- Sin lógica de negocio

### Hooks Personalizados
```
src/hooks/
├── useTeleprompterStore.ts  ← Estado teleprompter
├── useRunOrderStore.ts      ← Estado Run Order
├── useAutoScroll.ts         ← Auto-scroll DOM
└── usePersistence.ts        ← Auto-save
```

---

## 🔧 IMPLEMENTACIÓN PASO A PASO

### FASE 1: Crear Infraestructura (1-2 días)

#### 1.1 Crear TeleprompterStore
**Archivo**: `src/stores/TeleprompterStore.ts`

```typescript
export interface TeleprompterState {
  text: string;
  isPlaying: boolean;
  speed: number; // 0.1-5.0
  fontSize: number; // 12-500
  scrollPosition: number;
  currentScript: string;
  jumpMarkers: Map<string, number>;
  guideLinePosition: number; // 0-100 %
  theme: 'dark' | 'light';
  timestamp: number;
}

type Listener = (state: TeleprompterState) => void;

class TeleprompterStore {
  private state: TeleprompterState;
  private listeners = new Set<Listener>();
  
  constructor() {
    this.state = this.getInitialState();
  }
  
  getState(): TeleprompterState {
    return { ...this.state };
  }
  
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // Actions
  play() {
    this.setState({ isPlaying: true });
  }
  
  pause() {
    this.setState({ isPlaying: false });
  }
  
  reset() {
    this.setState({ 
      isPlaying: false, 
      scrollPosition: 0 
    });
  }
  
  setSpeed(speed: number) {
    const validated = Math.max(0.1, Math.min(5.0, speed));
    this.setState({ speed: validated });
  }
  
  setFontSize(fontSize: number) {
    const validated = Math.max(12, Math.min(500, fontSize));
    this.setState({ fontSize: validated });
  }
  
  setScrollPosition(scrollPosition: number) {
    this.setState({ scrollPosition });
  }
  
  setText(text: string) {
    this.setState({ text });
  }
  
  private setState(partial: Partial<TeleprompterState>) {
    this.state = {
      ...this.state,
      ...partial,
      timestamp: Date.now()
    };
    this.notify();
  }
  
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  private getInitialState(): TeleprompterState {
    return {
      text: '',
      isPlaying: false,
      speed: 1.0,
      fontSize: 200,
      scrollPosition: 0,
      currentScript: 'Untitled.awn',
      jumpMarkers: new Map(),
      guideLinePosition: 50,
      theme: 'dark',
      timestamp: Date.now()
    };
  }
}

export const teleprompterStore = new TeleprompterStore();
```

#### 1.2 Crear useTeleprompterStore Hook
**Archivo**: `src/hooks/useTeleprompterStore.ts`

```typescript
import { useState, useEffect } from 'react';
import { teleprompterStore, TeleprompterState } from '../stores/TeleprompterStore';

export function useTeleprompterStore() {
  const [state, setState] = useState<TeleprompterState>(
    teleprompterStore.getState()
  );
  
  useEffect(() => {
    // Suscribirse a cambios
    const unsubscribe = teleprompterStore.subscribe(setState);
    
    // Cleanup
    return unsubscribe;
  }, []);
  
  return {
    // Estado
    ...state,
    
    // Métodos
    play: () => teleprompterStore.play(),
    pause: () => teleprompterStore.pause(),
    reset: () => teleprompterStore.reset(),
    setSpeed: (speed: number) => teleprompterStore.setSpeed(speed),
    setFontSize: (size: number) => teleprompterStore.setFontSize(size),
    setScrollPosition: (pos: number) => teleprompterStore.setScrollPosition(pos),
    setText: (text: string) => teleprompterStore.setText(text),
  };
}
```

#### 1.3 Crear AutoScrollService
**Archivo**: `src/services/AutoScrollService.ts`

```typescript
import { teleprompterStore } from '../stores/TeleprompterStore';

export class AutoScrollService {
  private intervalId: number | null = null;
  private lastUpdateTime: number = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS; // ~16.67ms
  
  start() {
    if (this.intervalId !== null) return; // Ya está corriendo
    
    this.lastUpdateTime = Date.now();
    this.intervalId = window.setInterval(
      () => this.tick(),
      this.frameTime
    );
    
    console.log('🟢 AutoScrollService: started');
  }
  
  stop() {
    if (this.intervalId === null) return;
    
    window.clearInterval(this.intervalId);
    this.intervalId = null;
    
    console.log('🔴 AutoScrollService: stopped');
  }
  
  private tick() {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    const state = teleprompterStore.getState();
    
    if (!state.isPlaying) {
      this.stop();
      return;
    }
    
    // Cálculo unificado de incremento
    // speed=1.0 → 1 píxel por frame @ 60 FPS
    const increment = (state.speed / this.targetFPS) * deltaTime;
    const newPosition = state.scrollPosition + increment;
    
    // Detectar fin del texto
    if (this.detectEndOfText(state.text, newPosition)) {
      console.log('🔚 AutoScrollService: end of text detected');
      this.stop();
      teleprompterStore.pause();
      // TODO: Auto-advance al siguiente script
      return;
    }
    
    teleprompterStore.setScrollPosition(newPosition);
  }
  
  private detectEndOfText(text: string, scrollPosition: number): boolean {
    const lines = text.split('\n');
    const lineHeight = 40; // Altura aproximada por línea
    const estimatedHeight = lines.length * lineHeight;
    const viewportHeight = 800; // Altura del viewport
    const maxScroll = estimatedHeight + viewportHeight;
    
    return scrollPosition > maxScroll;
  }
}

export const autoScrollService = new AutoScrollService();
```

#### 1.4 Crear SyncService (Maestro-Esclavo)
**Archivo**: `src/services/SyncService.ts`

```typescript
import { teleprompterStore, TeleprompterState } from '../stores/TeleprompterStore';

export interface SyncMessage {
  type: 'SYNC_STATE' | 'REQUEST_CHANGE' | 'ACK';
  payload: any;
  timestamp: number;
  sourceId: string;
  requestId?: string;
}

export class SyncService {
  private slaves = new Map<string, Window>();
  private pendingRequests = new Map<string, NodeJS.Timeout>();
  private throttleTimer: NodeJS.Timeout | null = null;
  private readonly throttleDelay = 50; // ms
  
  /**
   * Registra una ventana esclava (popup o iframe)
   */
  registerSlave(id: string, window: Window) {
    this.slaves.set(id, window);
    
    // Enviar estado inicial inmediatamente
    this.sendToSlave(id, {
      type: 'SYNC_STATE',
      payload: teleprompterStore.getState(),
      timestamp: Date.now(),
      sourceId: 'master'
    });
    
    console.log(`🔗 SyncService: slave "${id}" registered`);
  }
  
  /**
   * Desregistra una ventana esclava
   */
  unregisterSlave(id: string) {
    this.slaves.delete(id);
    console.log(`🔌 SyncService: slave "${id}" unregistered`);
  }
  
  /**
   * Broadcast del estado a todos los esclavos (throttled)
   */
  broadcastState() {
    if (this.throttleTimer !== null) return;
    
    this.throttleTimer = setTimeout(() => {
      const state = teleprompterStore.getState();
      const message: SyncMessage = {
        type: 'SYNC_STATE',
        payload: state,
        timestamp: Date.now(),
        sourceId: 'master'
      };
      
      this.slaves.forEach((window, id) => {
        try {
          window.postMessage(message, '*');
        } catch (error) {
          console.error(`❌ Error sending to slave "${id}":`, error);
          this.unregisterSlave(id);
        }
      });
      
      this.throttleTimer = null;
    }, this.throttleDelay);
  }
  
  /**
   * Maneja requests de esclavos
   */
  handleSlaveRequest(message: SyncMessage) {
    if (message.sourceId === 'master') return; // Ignorar propios mensajes
    
    console.log('📨 SyncService: received request from slave:', message);
    
    switch (message.type) {
      case 'REQUEST_CHANGE':
        this.applySlaveRequest(message);
        break;
      case 'ACK':
        this.handleAck(message);
        break;
    }
  }
  
  private applySlaveRequest(message: SyncMessage) {
    const { action, payload } = message.payload;
    
    // Aplicar cambio al store maestro
    switch (action) {
      case 'setSpeed':
        teleprompterStore.setSpeed(payload.speed);
        break;
      case 'setFontSize':
        teleprompterStore.setFontSize(payload.fontSize);
        break;
      case 'play':
        teleprompterStore.play();
        break;
      case 'pause':
        teleprompterStore.pause();
        break;
      // ... otros casos
    }
    
    // El store notificará y se hará broadcast automáticamente
  }
  
  private sendToSlave(id: string, message: SyncMessage) {
    const window = this.slaves.get(id);
    if (!window) return;
    
    try {
      window.postMessage(message, '*');
    } catch (error) {
      console.error(`❌ Error sending to slave "${id}":`, error);
      this.unregisterSlave(id);
    }
  }
  
  private handleAck(message: SyncMessage) {
    const { requestId } = message;
    if (!requestId) return;
    
    const timeout = this.pendingRequests.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingRequests.delete(requestId);
    }
  }
}

export const syncService = new SyncService();

// Conectar con el store para auto-broadcast
teleprompterStore.subscribe(() => {
  syncService.broadcastState();
});
```

---

### FASE 2: Migrar Componentes (2-3 días)

#### 2.1 Refactorizar App.tsx

**ANTES (764 líneas, 15+ estados)**:
```typescript
export default function App() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [fontSize, setFontSize] = useState(200);
  // ... 11 estados más
  
  // 50+ funciones de manejo
  const handlePlayPause = () => { /* ... */ };
  const handleSetFontSize = (size) => { /* ... */ };
  // ...
}
```

**DESPUÉS (~200 líneas, 3 hooks)**:
```typescript
export default function App() {
  const teleprompter = useTeleprompterStore();
  const runOrder = useRunOrderStore();
  const config = useConfigStore();
  
  return (
    <div className="h-screen flex flex-col bg-gray-800">
      <MainToolbar />
      <div className="flex-1 flex">
        <RunOrderPanel />
        <EditorPanel />
        <PreviewPanel />
      </div>
      <StatusBar />
      <Toaster />
    </div>
  );
}
```

#### 2.2 Crear TransportControls Refactorizado
**Archivo**: `src/components/controls/TransportControls.tsx`

```typescript
import { useTeleprompterStore } from '../../hooks/useTeleprompterStore';

export function TransportControls() {
  const { 
    isPlaying, 
    speed, 
    fontSize,
    play,
    pause,
    reset,
    setSpeed,
    setFontSize
  } = useTeleprompterStore();
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button onClick={handlePlayPause}>
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      
      <Button onClick={reset}>
        <RotateCcw />
      </Button>
      
      <Slider
        value={[speed]}
        onValueChange={([v]) => setSpeed(v)}
        min={0.1}
        max={5.0}
        step={0.1}
      />
      
      <div className="flex gap-1">
        <Button onClick={() => setFontSize(fontSize - 2)}>
          <Minus />
        </Button>
        <span className="px-2">{fontSize}px</span>
        <Button onClick={() => setFontSize(fontSize + 2)}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}
```

#### 2.3 Refactorizar TeleprompterWindow (Esclavo)
**Archivo**: `src/components/windows/TeleprompterWindow.tsx`

```typescript
import { useState, useEffect, useRef } from 'react';
import { SyncMessage } from '../../services/SyncService';
import { TeleprompterState } from '../../stores/TeleprompterStore';

export function TeleprompterWindow() {
  const [state, setState] = useState<TeleprompterState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Conectar con ventana maestra
  useEffect(() => {
    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload, sourceId } = event.data;
      
      // Solo aceptar mensajes del maestro
      if (sourceId !== 'master') return;
      
      if (type === 'SYNC_STATE') {
        setState(payload);
        setIsConnected(true);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Anunciarse al maestro
    let retries = 0;
    const announceInterval = setInterval(() => {
      if (window.opener && !isConnected && retries < 50) {
        window.opener.postMessage({
          type: 'SLAVE_READY',
          sourceId: `popup-${Date.now()}`,
          timestamp: Date.now()
        }, '*');
        retries++;
      } else {
        clearInterval(announceInterval);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(announceInterval);
    };
  }, [isConnected]);
  
  // Aplicar scroll al DOM
  useEffect(() => {
    if (!scrollRef.current || !state) return;
    
    scrollRef.current.scrollTop = state.scrollPosition;
  }, [state?.scrollPosition]);
  
  // Enviar request de cambio al maestro
  const requestChange = (action: string, payload: any) => {
    if (!window.opener) return;
    
    window.opener.postMessage({
      type: 'REQUEST_CHANGE',
      payload: { action, payload },
      sourceId: `popup-${Date.now()}`,
      timestamp: Date.now()
    }, '*');
  };
  
  // Mouse wheel: solo envía request, no modifica localmente
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    
    if (!state) return;
    
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newSpeed = Math.max(0.1, Math.min(5.0, state.speed + delta));
    
    requestChange('setSpeed', { speed: newSpeed });
    
    // Auto-iniciar si no está playing
    if (!state.isPlaying) {
      requestChange('play', {});
    }
  };
  
  if (!isConnected || !state) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>Conectando con ventana principal...</div>
      </div>
    );
  }
  
  return (
    <div 
      ref={scrollRef}
      className="h-screen bg-gray-900 text-white overflow-y-auto"
      onWheel={handleWheel}
    >
      <div 
        className="p-8"
        style={{ fontSize: `${state.fontSize}px` }}
      >
        {state.text.split('\n').map((line, i) => (
          <div key={i}>{line || '\u00A0'}</div>
        ))}
      </div>
      
      {/* Línea guía */}
      <div 
        className="fixed left-0 right-0 border-t-2 border-red-500 pointer-events-none"
        style={{ top: `${state.guideLinePosition}%` }}
      />
    </div>
  );
}
```

---

### FASE 3: Persistencia (1 día)

#### 3.1 Crear PersistenceService
**Archivo**: `src/services/PersistenceService.ts`

```typescript
import { openDB, IDBPDatabase } from 'idb';
import { RunOrderItem } from '../stores/RunOrderStore';

export class PersistenceService {
  private db: IDBPDatabase | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  
  async initialize() {
    this.db = await openDB('teleprompter', 1, {
      upgrade(db) {
        // Object stores
        db.createObjectStore('scripts');
        db.createObjectStore('config');
        db.createObjectStore('sessions');
      }
    });
    
    console.log('💾 PersistenceService: initialized');
  }
  
  async saveScripts(items: RunOrderItem[]) {
    if (!this.db) throw new Error('DB not initialized');
    
    await this.db.put('scripts', items, 'current');
    console.log('💾 Saved scripts:', items.length);
  }
  
  async loadScripts(): Promise<RunOrderItem[]> {
    if (!this.db) throw new Error('DB not initialized');
    
    const items = await this.db.get('scripts', 'current');
    return items || [];
  }
  
  async saveConfig(config: any) {
    if (!this.db) throw new Error('DB not initialized');
    
    await this.db.put('config', config, 'current');
  }
  
  async loadConfig(): Promise<any> {
    if (!this.db) throw new Error('DB not initialized');
    
    return await this.db.get('config', 'current');
  }
  
  enableAutoSave(callback: () => any) {
    this.autoSaveInterval = setInterval(async () => {
      const data = callback();
      await this.saveScripts(data.scripts);
      await this.saveConfig(data.config);
      console.log('💾 Auto-save completed');
    }, 30000); // 30 segundos
  }
  
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}

export const persistenceService = new PersistenceService();
```

#### 3.2 Integrar en App.tsx
```typescript
useEffect(() => {
  // Inicializar e cargar datos guardados
  persistenceService.initialize().then(async () => {
    const scripts = await persistenceService.loadScripts();
    if (scripts.length > 0) {
      runOrderStore.setItems(scripts);
    }
    
    const config = await persistenceService.loadConfig();
    if (config) {
      configStore.setConfig(config);
    }
    
    // Habilitar auto-save
    persistenceService.enableAutoSave(() => ({
      scripts: runOrderStore.getItems(),
      config: configStore.getConfig()
    }));
  });
  
  return () => {
    persistenceService.disableAutoSave();
  };
}, []);
```

---

### FASE 4: Importar Excel (1 día)

#### 4.1 Instalar dependencia
```bash
npm install xlsx
npm install @types/xlsx --save-dev
```

#### 4.2 Crear ExcelImportService
**Archivo**: `src/services/ExcelImportService.ts`

```typescript
import * as XLSX from 'xlsx';
import { RunOrderItem } from '../stores/RunOrderStore';

export interface ExcelRow {
  'Número de Guion'?: string;
  'Título': string;
  'Texto/Contenido': string;
  'Duración'?: string;
  'Notas'?: string;
}

export class ExcelImportService {
  async importFromFile(file: File): Promise<RunOrderItem[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Leer primera hoja
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);
    
    // Validar estructura
    if (!this.validateStructure(data)) {
      throw new Error('Excel inválido: faltan columnas requeridas (Título, Texto/Contenido)');
    }
    
    // Mapear a RunOrderItem
    return this.mapToRunOrderItems(data);
  }
  
  private validateStructure(data: ExcelRow[]): boolean {
    if (data.length === 0) return false;
    
    return data.every(row => 
      row['Título'] && row['Texto/Contenido']
    );
  }
  
  private mapToRunOrderItems(data: ExcelRow[]): RunOrderItem[] {
    return data.map((row, index) => ({
      id: String(index + 1),
      title: row['Título'],
      text: row['Texto/Contenido'],
      duration: row['Duración'] || '00:00:00',
      status: 'ready' as const,
      notes: row['Notas'] || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
  
  async previewImport(file: File): Promise<{ headers: string[], rows: any[][] }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    return {
      headers: data[0] as string[],
      rows: data.slice(1, 6) as any[][] // Primeras 5 filas
    };
  }
}

export const excelImportService = new ExcelImportService();
```

#### 4.3 Componente de Importación
**Archivo**: `src/components/ImportExcelDialog.tsx`

```typescript
import { useState } from 'react';
import { excelImportService } from '../services/ExcelImportService';
import { runOrderStore } from '../stores/RunOrderStore';

export function ImportExcelDialog({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    try {
      const previewData = await excelImportService.previewImport(selectedFile);
      setPreview(previewData);
    } catch (error) {
      alert('Error al leer archivo: ' + error.message);
    }
  };
  
  const handleImport = async () => {
    if (!file) return;
    
    try {
      const items = await excelImportService.importFromFile(file);
      runOrderStore.setItems(items);
      alert(`${items.length} scripts importados exitosamente`);
      onClose();
    } catch (error) {
      alert('Error al importar: ' + error.message);
    }
  };
  
  return (
    <Dialog>
      <DialogTitle>Importar desde Excel</DialogTitle>
      <DialogContent>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
        />
        
        {preview && (
          <div className="mt-4">
            <h3>Vista previa:</h3>
            <table>
              <thead>
                <tr>
                  {preview.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleImport} disabled={!file}>
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

### FASE 5: Editor Enriquecido (1 día)

#### 5.1 Opción A: Markdown con Preview
Usar `react-markdown` y `remark-gfm`:

```bash
npm install react-markdown remark-gfm
```

#### 5.2 Opción B: Editor WYSIWYG
Usar `@lexical/react`:

```bash
npm install lexical @lexical/react
```

#### 5.3 Implementar Toolbar
**Archivo**: `src/components/editor/RichTextToolbar.tsx`

```typescript
export function RichTextToolbar({ onFormat }: { onFormat: (format: string) => void }) {
  return (
    <div className="flex gap-2 p-2 border-b">
      <Button onClick={() => onFormat('bold')}>
        <Bold />
      </Button>
      <Button onClick={() => onFormat('italic')}>
        <Italic />
      </Button>
      <Button onClick={() => onFormat('highlight')}>
        Señalizador
      </Button>
      <Button onClick={() => onFormat('marker')}>
        Marcador [1]
      </Button>
    </div>
  );
}
```

---

## 📊 CRONOGRAMA

| Fase | Duración | Tareas | Bugs Resueltos |
|------|----------|--------|----------------|
| **Fase 1**: Infraestructura | 1-2 días | Stores, Services, Hooks | - |
| **Fase 2**: Migración UI | 2-3 días | Refactorizar componentes | TP-1, VF-3/4/5 |
| **Fase 3**: Persistencia | 1 día | IndexedDB, Auto-save | PD-1/2/3 |
| **Fase 4**: Excel Import | 1 día | Parser, UI de importación | - |
| **Fase 5**: Editor Rico | 1 día | Toolbar, Formato | ED-2/3 |
| **Fase 6**: Testing | 2 días | Pruebas, Bug fixes | - |
| **Fase 7**: Optimización | 1 día | Bundle size, Electron | IN-2 |
| **TOTAL** | **9-11 días** | | **10+ bugs** |

---

## ✅ CHECKLIST DE MIGRACIÓN

### Preparación
- [ ] Crear branch `refactor/architecture-v2`
- [ ] Backup de código actual
- [ ] Instalar dependencias: `idb`, `xlsx`

### Fase 1
- [ ] Crear `src/stores/TeleprompterStore.ts`
- [ ] Crear `src/stores/RunOrderStore.ts`
- [ ] Crear `src/stores/ConfigurationStore.ts`
- [ ] Crear `src/hooks/useTeleprompterStore.ts`
- [ ] Crear `src/services/AutoScrollService.ts`
- [ ] Crear `src/services/SyncService.ts`
- [ ] Probar Store + Hook en componente simple

### Fase 2
- [ ] Refactorizar `App.tsx` (eliminar 15+ estados)
- [ ] Refactorizar `TransportControls.tsx`
- [ ] Refactorizar `TeleprompterWindow.tsx` (esclavo)
- [ ] Refactorizar `TeleprompterPreview.tsx`
- [ ] Conectar AutoScrollService con Store
- [ ] Conectar SyncService con postMessage
- [ ] Probar Play/Pause (debe resolver BUG TP-1)
- [ ] Probar sincronización ventanas (debe resolver VF-3/4/5)

### Fase 3
- [ ] Crear `src/services/PersistenceService.ts`
- [ ] Integrar con RunOrderStore
- [ ] Implementar auto-save cada 30s
- [ ] Probar guardado y carga (debe resolver PD-1/2/3)

### Fase 4
- [ ] Crear `src/services/ExcelImportService.ts`
- [ ] Crear `src/components/ImportExcelDialog.tsx`
- [ ] Probar importación con archivo de prueba

### Fase 5
- [ ] Crear `src/components/editor/RichTextToolbar.tsx`
- [ ] Implementar Bold/Italic
- [ ] Implementar Señalizador (highlight)
- [ ] Probar formato (debe resolver ED-2/3)

### Fase 6
- [ ] Ejecutar suite de pruebas CN
- [ ] Verificar 31 bugs identificados
- [ ] Fix de bugs encontrados
- [ ] Validar responsividad (CP-4)

### Fase 7
- [ ] Configurar `electron-builder` con `asar: true`
- [ ] Excluir `devDependencies`
- [ ] Tree-shaking y minificación
- [ ] Generar instalador y verificar tamaño

---

## 🎯 MÉTRICAS DE ÉXITO

### Objetivos Cuantitativos
- ✅ Reducir `App.tsx` de 764 → ~200 líneas (-73%)
- ✅ Eliminar 15 estados locales → 3 hooks
- ✅ Resolver 10+ bugs críticos
- ✅ Reducir instalador 240MB → 140-160MB (-30%)
- ✅ Cobertura de pruebas: 46.7% → 85%+

### Objetivos Cualitativos
- ✅ Código más mantenible
- ✅ Sin loops infinitos de postMessage
- ✅ Estado predecible
- ✅ Fácil agregar nuevas features
- ✅ Mejor experiencia de usuario

---

## 📚 RECURSOS

### Diagramas
- `Diagramas antes de refactorización/` - Estado actual (4 diagramas)
- `Diagramas para la refactorización/` - Arquitectura propuesta (4 diagramas)

### Documentación
- [Patrón Flux](https://facebook.github.io/flux/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [SheetJS (xlsx)](https://docs.sheetjs.com/)
- [Electron Builder](https://www.electron.build/)

### Ejemplos de Código
- Todos los snippets en este documento
- Tests en `test-scripts/`

---

## 🐛 PRIORIZACIÓN DE BUGS

### Críticos (P0) - Debe resolverse en Fase 2
1. **TP-1**: Play no funciona ← Sincronización rota
2. **VF-3**: Scroll desincronizado ← Estado duplicado
3. **VF-4**: Velocidad desincronizada ← Auto-scroll independiente
4. **VF-5**: Font size desincronizado ← Sin broadcast coordinado

### Altos (P1) - Fase 3-4
5. **PD-1/2/3**: Sin persistencia ← Falta backend
6. **ED-2/3**: Sin formato de texto ← Editor básico
7. **RO-3**: No se puede eliminar ← UI truncada

### Medios (P2) - Fase 6
8. **PC-4**: No sale de fullscreen ← Event listener falta
9. **CP-4**: Mala responsividad ← CSS rígido
10. **LG-2/3**: Línea guía no configurable ← Estado no persiste

### Bajos (P3) - Fase 7
11. **IN-2**: Instalador grande ← Sin optimización
12. **MK-1/2/3/4**: Macros conflictivas ← Teclas predefinidas
13. **RM-1/2/3/4**: Control de mouse ← No implementado

---

## 🔄 ROLLBACK PLAN

Si algo sale mal:

1. **Git**: `git checkout master`
2. **Backup**: Copiar carpeta `backup-[fecha]/`
3. **npm**: `npm ci` (reinstalar dependencias limpias)
4. **Build**: `npm run build`

---

**FIN DEL PLAN DE REFACTORIZACIÓN**
