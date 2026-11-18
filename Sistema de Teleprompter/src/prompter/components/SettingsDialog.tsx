import { useEffect, useRef, useState } from 'react';
import { COMMAND_LABELS, DEFAULT_KEYS, DEFAULT_SETTINGS, FONT_FAMILIES, FONT_MAX, FONT_MIN } from '../defaults';
import { downloadFile } from '../importers';
import { formatKey, isModifierOnly, keyString } from '../shortcuts';
import { useOperatorStore } from '../store';
import type { AspectRatio, Command, CueStyle, PrompterSettings } from '../types';
import { Modal } from './Modal';

type Tab = 'texto' | 'marcador' | 'salida' | 'atajos' | 'datos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'texto', label: 'Texto' },
  { id: 'marcador', label: 'Marcador' },
  { id: 'salida', label: 'Salida' },
  { id: 'atajos', label: 'Atajos' },
  { id: 'datos', label: 'Datos' },
];

function KeyCapture({ onCapture, onCancel }: { onCapture: (combo: string) => void; onCancel: () => void }) {
  const handlers = useRef({ onCapture, onCancel });
  handlers.current = { onCapture, onCancel };
  useEffect(() => {
    document.body.dataset.keyCapture = '1';
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') return handlers.current.onCancel();
      if (isModifierOnly(e.code)) return;
      handlers.current.onCapture(keyString(e));
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      // Diferido: el Escape que cancela no debe cerrar también el diálogo
      setTimeout(() => delete document.body.dataset.keyCapture, 0);
    };
  }, []);
  return <span className="op-capture">Pulse una tecla… (Esc cancela)</span>;
}

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const settings = useOperatorStore((s) => s.settings);
  const { updateSettings, resetSettings, flash } = useOperatorStore.getState();
  const [tab, setTab] = useState<Tab>('texto');
  const [capturing, setCapturing] = useState<Command | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<PrompterSettings>) => updateSettings(patch);
  const setCue = (patch: Partial<PrompterSettings['cue']>) => updateSettings({ cue: { ...settings.cue, ...patch } });

  const assignKey = (cmd: Command, combo: string) => {
    const keys = { ...settings.keys };
    for (const other of Object.keys(keys) as Command[]) {
      if (other !== cmd && keys[other].includes(combo)) {
        keys[other] = keys[other].filter((k) => k !== combo);
        flash(`"${formatKey(combo)}" se quitó de "${COMMAND_LABELS[other]}"`);
      }
    }
    keys[cmd] = [combo];
    updateSettings({ keys });
    setCapturing(null);
  };

  const importSettings = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || typeof data.fontSize !== 'number') throw new Error('formato');
      const allowed = Object.keys(DEFAULT_SETTINGS);
      const patch = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
      updateSettings(patch as Partial<PrompterSettings>);
      flash('Ajustes importados');
    } catch {
      flash('El archivo no contiene ajustes válidos', 'error');
    }
  };

  return (
    <Modal title="Ajustes del prompter" onClose={onClose} wide>
      <nav className="op-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`op-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'texto' && (
        <div className="op-form">
          <label>
            Fuente
            <select className="op-select" value={settings.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}>
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f.split(',')[0].replace(/'/g, '')}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tamaño ({FONT_MIN}–{FONT_MAX} px)
            <input
              className="op-input"
              type="number"
              min={FONT_MIN}
              max={FONT_MAX}
              value={settings.fontSize}
              onChange={(e) => useOperatorStore.getState().setFontSize(Number(e.target.value))}
            />
          </label>
          <label>
            Interlineado: {settings.lineSpacing.toFixed(2)}
            <input type="range" min={1} max={2.5} step={0.05} value={settings.lineSpacing} onChange={(e) => set({ lineSpacing: Number(e.target.value) })} />
          </label>
          <label>
            Margen izquierdo: {settings.marginLeft}%
            <input type="range" min={2} max={30} value={settings.marginLeft} onChange={(e) => set({ marginLeft: Number(e.target.value) })} />
          </label>
          <label>
            Margen derecho: {settings.marginRight}%
            <input type="range" min={0} max={30} value={settings.marginRight} onChange={(e) => set({ marginRight: Number(e.target.value) })} />
          </label>
          <label className="op-color">
            Color del texto
            <input type="color" value={settings.textColor} onChange={(e) => set({ textColor: e.target.value })} />
          </label>
          <label className="op-color">
            Color de fondo
            <input type="color" value={settings.backgroundColor} onChange={(e) => set({ backgroundColor: e.target.value })} />
          </label>
          <label className="op-color">
            Color de instrucciones ((…))
            <input type="color" value={settings.instructionColor} onChange={(e) => set({ instructionColor: e.target.value })} />
          </label>
          <label className="op-check">
            <input type="checkbox" checked={settings.uppercase} onChange={(e) => set({ uppercase: e.target.checked })} />
            Mostrar todo en mayúsculas
          </label>
          <label className="op-check">
            <input type="checkbox" checked={settings.showSluglines} onChange={(e) => set({ showSluglines: e.target.checked })} />
            Mostrar sluglines en la salida
          </label>
          <label className="op-check">
            <input type="checkbox" checked={settings.showInstructions} onChange={(e) => set({ showInstructions: e.target.checked })} />
            Mostrar instrucciones para el presentador
          </label>
        </div>
      )}

      {tab === 'marcador' && (
        <div className="op-form">
          <label className="op-check">
            <input type="checkbox" checked={settings.cue.visible} onChange={(e) => setCue({ visible: e.target.checked })} />
            Mostrar marcador de lectura
          </label>
          <label>
            Estilo
            <select className="op-select" value={settings.cue.style} onChange={(e) => setCue({ style: e.target.value as CueStyle })}>
              <option value="arrow">Flecha</option>
              <option value="block">Bloque</option>
              <option value="line">Línea horizontal</option>
            </select>
          </label>
          <label className="op-color">
            Color
            <input type="color" value={settings.cue.color} onChange={(e) => setCue({ color: e.target.value })} />
          </label>
          <label>
            Posición vertical: {settings.cue.offset}%
            <input type="range" min={5} max={80} value={settings.cue.offset} onChange={(e) => setCue({ offset: Number(e.target.value) })} />
          </label>
          <label className="op-check">
            <input
              type="checkbox"
              checked={settings.cue.controlsPromptPosition}
              onChange={(e) => setCue({ controlsPromptPosition: e.target.checked })}
            />
            Al saltar, colocar la historia junto al marcador (si no, en la línea superior)
          </label>
        </div>
      )}

      {tab === 'salida' && (
        <div className="op-form">
          <label>
            Relación de aspecto del monitor
            <select className="op-select" value={settings.aspect} onChange={(e) => set({ aspect: e.target.value as AspectRatio })}>
              <option value="16:9">16:9</option>
              <option value="16:10">16:10</option>
              <option value="4:3">4:3</option>
            </select>
          </label>
          <label className="op-check">
            <input type="checkbox" checked={settings.showClock} onChange={(e) => set({ showClock: e.target.checked })} />
            Mostrar reloj en la salida
          </label>
          <label className="op-check">
            <input type="checkbox" checked={settings.clock24h} onChange={(e) => set({ clock24h: e.target.checked })} />
            Formato 24 horas
          </label>
          <label>
            Mensaje de blanking (vacío = pantalla negra, máx. 3 líneas)
            <textarea
              className="op-input"
              rows={3}
              value={settings.blankMessage}
              onChange={(e) => set({ blankMessage: e.target.value.split('\n').slice(0, 3).join('\n') })}
            />
          </label>
          <label>
            Palabras por minuto (estimación de duración)
            <input
              className="op-input"
              type="number"
              min={60}
              max={400}
              value={settings.wordsPerMinute}
              onChange={(e) => set({ wordsPerMinute: Math.min(400, Math.max(60, Number(e.target.value) || 180)) })}
            />
          </label>
        </div>
      )}

      {tab === 'atajos' && (
        <div>
          <table className="op-keys">
            <thead>
              <tr>
                <th>Función</th>
                <th>Teclas</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(Object.keys(COMMAND_LABELS) as Command[]).map((cmd) => (
                <tr key={cmd}>
                  <td>{COMMAND_LABELS[cmd]}</td>
                  <td>
                    {capturing === cmd ? (
                      <KeyCapture onCapture={(combo) => assignKey(cmd, combo)} onCancel={() => setCapturing(null)} />
                    ) : (
                      settings.keys[cmd].map((k) => (
                        <kbd key={k} className="op-kbd">
                          {formatKey(k)}
                        </kbd>
                      ))
                    )}
                  </td>
                  <td className="op-keys-actions">
                    <button className="op-btn" onClick={() => setCapturing(cmd)}>
                      Asignar
                    </button>
                    <button
                      className="op-btn"
                      onClick={() => updateSettings({ keys: { ...settings.keys, [cmd]: DEFAULT_KEYS[cmd] } })}
                    >
                      Por defecto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="op-hint">
            En los campos de texto solo funcionan las teclas de función (F1–F12) y las combinaciones con Ctrl, para no
            interferir con la escritura.
          </p>
        </div>
      )}

      {tab === 'datos' && (
        <div className="op-form">
          <p>Los ajustes y el Run Order se guardan automáticamente en este equipo.</p>
          <div className="op-row-buttons">
            <button
              className="op-btn"
              onClick={() => downloadFile('teleprompter-ajustes.json', JSON.stringify(settings, null, 2), 'application/json')}
            >
              Exportar ajustes
            </button>
            <button className="op-btn" onClick={() => importRef.current?.click()}>
              Importar ajustes
            </button>
            <button
              className="op-btn is-danger"
              onClick={() => window.confirm('¿Restablecer todos los ajustes a los valores por defecto?') && resetSettings()}
            >
              Restablecer valores por defecto
            </button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importSettings(file);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </Modal>
  );
}
