import {
  FilePlus,
  FileText,
  FlipHorizontal2,
  FolderOpen,
  Keyboard,
  Minus,
  Monitor,
  MonitorOff,
  Pause,
  Play,
  Plus,
  Save,
  Settings,
  SkipBack,
  SkipForward,
  Square,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FONT_MAX, FONT_MIN, FONT_STEP, SPEED_MAX, SPEED_MIN, SPEED_STEP } from '../defaults';
import { useOperatorStore } from '../store';

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExportTxt: () => void;
  onOpenOutput: (mirror: '' | 'h') => void;
  onSettings: () => void;
  onShortcuts: () => void;
}

const FONT_PRESETS = [72, 96, 120, 150, 200, 300];

export function Toolbar({ onNew, onOpen, onSave, onExportTxt, onOpenOutput, onSettings, onShortcuts }: ToolbarProps) {
  const playing = useOperatorStore((s) => s.transport.playing);
  const speed = useOperatorStore((s) => s.transport.speed);
  const blank = useOperatorStore((s) => s.transport.blank);
  const fontSize = useOperatorStore((s) => s.settings.fontSize);
  const outputs = useOperatorStore((s) => Object.keys(s.outputs).length);
  const { togglePlay, stop, prevStory, nextStory, setSpeed, setFontSize, toggleBlank } = useOperatorStore.getState();

  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="op-toolbar">
      <div className="op-group" aria-label="Archivo">
        <button className="op-btn" onClick={onNew} title="Nuevo Run Order">
          <FilePlus size={16} />
          <span>Nuevo</span>
        </button>
        <button className="op-btn" onClick={onOpen} title="Abrir .txt, .xlsx o .json (Ctrl+O)">
          <FolderOpen size={16} />
          <span>Abrir</span>
        </button>
        <button className="op-btn" onClick={onSave} title="Guardar Run Order como .json (Ctrl+S)">
          <Save size={16} />
          <span>Guardar</span>
        </button>
        <button className="op-btn" onClick={onExportTxt} title="Exportar como .txt ([1] {SLUGLINE})">
          <FileText size={16} />
          <span>TXT</span>
        </button>
      </div>

      <div className="op-group op-transport" aria-label="Transporte">
        <button className="op-btn op-icon" onClick={prevStory} title="Historia anterior (RePág / F11)">
          <SkipBack size={18} />
        </button>
        <button
          className={`op-btn op-play ${playing ? 'is-playing' : ''}`}
          onClick={togglePlay}
          title="Reproducir / Pausar (Espacio / F10)"
          aria-pressed={playing}
        >
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button className="op-btn op-icon" onClick={stop} title="Detener y volver al inicio (F8)">
          <Square size={16} />
        </button>
        <button className="op-btn op-icon" onClick={nextStory} title="Historia siguiente (AvPág / F12)">
          <SkipForward size={18} />
        </button>
      </div>

      <div className="op-group op-slider-group" title="Velocidad (↑ / ↓, Shift + rueda)">
        <label htmlFor="op-speed">Velocidad</label>
        <button className="op-btn op-mini" onClick={() => setSpeed(speed - SPEED_STEP)} aria-label="Reducir velocidad">
          <Minus size={14} />
        </button>
        <input
          id="op-speed"
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={SPEED_STEP}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <button className="op-btn op-mini" onClick={() => setSpeed(speed + SPEED_STEP)} aria-label="Aumentar velocidad">
          <Plus size={14} />
        </button>
        <output className="op-value">{speed.toFixed(1)}</output>
      </div>

      <div className="op-group op-slider-group" title="Tamaño de fuente de la salida (+ / -, Ctrl + rueda)">
        <label htmlFor="op-font">Fuente</label>
        <button className="op-btn op-mini" onClick={() => setFontSize(fontSize - FONT_STEP)} aria-label="Reducir fuente">
          <Minus size={14} />
        </button>
        <input
          id="op-font"
          type="range"
          min={FONT_MIN}
          max={FONT_MAX}
          step={1}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
        <button className="op-btn op-mini" onClick={() => setFontSize(fontSize + FONT_STEP)} aria-label="Aumentar fuente">
          <Plus size={14} />
        </button>
        <select
          className="op-select op-value"
          value={FONT_PRESETS.includes(fontSize) ? fontSize : ''}
          onChange={(e) => e.target.value && setFontSize(Number(e.target.value))}
          aria-label="Tamaños predefinidos"
        >
          {!FONT_PRESETS.includes(fontSize) && <option value="">{fontSize}</option>}
          {FONT_PRESETS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="op-group" aria-label="Salidas">
        <button
          className={`op-btn ${blank ? 'is-warning' : ''}`}
          onClick={toggleBlank}
          title="Blanking: oculta el texto en la salida (Shift+F9 / B)"
          aria-pressed={blank}
        >
          <MonitorOff size={16} />
          <span>Blank</span>
        </button>
        <button className="op-btn" onClick={() => onOpenOutput('')} title="Abrir ventana de salida (segundo monitor)">
          <Monitor size={16} />
          <span>Salida</span>
        </button>
        <button className="op-btn" onClick={() => onOpenOutput('h')} title="Abrir salida espejada para el cristal del prompter">
          <FlipHorizontal2 size={16} />
          <span>Espejo</span>
        </button>
        <button className="op-btn op-icon" onClick={onSettings} title="Ajustes">
          <Settings size={16} />
        </button>
        <button className="op-btn op-icon" onClick={onShortcuts} title="Atajos de teclado">
          <Keyboard size={16} />
        </button>
      </div>

      <div className="op-group op-right">
        <span className={`op-prompting ${playing ? 'is-live' : ''}`} title={`${outputs} salida(s) conectada(s)`}>
          {playing ? 'PROMPTING' : 'STANDBY'}
        </span>
        <time className="op-clock">{clock.toLocaleTimeString('es-CO', { hour12: false })}</time>
      </div>
    </header>
  );
}
