import { useCallback, useMemo } from 'react';
import { ASPECTS } from '../defaults';
import { promptStories, useOperatorStore } from '../store';
import type { Layout, PrompterDoc } from '../types';
import { PrompterStage } from './PrompterStage';

export function PreviewPane() {
  const stories = useOperatorStore((s) => s.runOrder.stories);
  const name = useOperatorStore((s) => s.runOrder.name);
  const settings = useOperatorStore((s) => s.settings);
  const transport = useOperatorStore((s) => s.transport);
  const playing = transport.playing;
  const { setLayout, nudge, setSpeed, setFontSize, updateSettings } = useOperatorStore.getState();

  const visible = useMemo(() => promptStories(stories), [stories]);
  const doc: PrompterDoc = useMemo(() => ({ stories: visible, settings }), [visible, settings]);
  const onLayout = useCallback((layout: Layout) => setLayout(layout), [setLayout]);

  const handleWheel = (e: WheelEvent) => {
    const s = useOperatorStore.getState();
    if (e.shiftKey) setSpeed(s.transport.speed + (e.deltaY > 0 ? -0.5 : 0.5));
    else if (e.ctrlKey) setFontSize(s.settings.fontSize + (e.deltaY > 0 ? -8 : 8));
    else nudge(e.deltaY * (e.altKey ? 0.4 : 1.5));
  };

  return (
    <section className={`op-pane op-preview ${playing ? 'is-live' : ''}`} aria-label="Prompter Preview">
      <header className="op-pane-title">
        <h2>Prompter Preview: {name}</h2>
      </header>

      <div className="op-preview-frame" style={{ aspectRatio: String(ASPECTS[settings.aspect]) }}>
        <PrompterStage doc={doc} transport={transport} onLayout={onLayout} onWheel={handleWheel} previewBlank />
      </div>

      <div className="op-preview-controls">
        <label title="Posición vertical del marcador de lectura (cue marker)">
          Marcador
          <input
            type="range"
            min={5}
            max={80}
            value={settings.cue.offset}
            onChange={(e) => updateSettings({ cue: { ...settings.cue, offset: Number(e.target.value) } })}
          />
          <output>{settings.cue.offset}%</output>
        </label>
        <label title="Interlineado de la salida">
          Interlineado
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.05}
            value={settings.lineSpacing}
            onChange={(e) => updateSettings({ lineSpacing: Number(e.target.value) })}
          />
          <output>{settings.lineSpacing.toFixed(2)}</output>
        </label>
        <div className="op-checks">
          <label>
            <input
              type="checkbox"
              checked={settings.showSluglines}
              onChange={(e) => updateSettings({ showSluglines: e.target.checked })}
            />
            Sluglines
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.showInstructions}
              onChange={(e) => updateSettings({ showInstructions: e.target.checked })}
            />
            Instrucciones
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.uppercase}
              onChange={(e) => updateSettings({ uppercase: e.target.checked })}
            />
            MAYÚSCULAS
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.showClock}
              onChange={(e) => updateSettings({ showClock: e.target.checked })}
            />
            Reloj
          </label>
        </div>
        <p className="op-hint">Rueda: desplazar · Shift+rueda: velocidad · Ctrl+rueda: fuente</p>
      </div>
    </section>
  );
}
