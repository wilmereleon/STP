import { useEffect, useState } from 'react';
import { formatDuration } from '../markup';
import { useOperatorStore } from '../store';
import { positionAt, progress } from '../transport';

const MESSAGE_MS = 5000;

export function StatusBar() {
  const status = useOperatorStore((s) => s.status);
  const liveStory = useOperatorStore((s) => s.runOrder.stories.find((x) => x.id === s.liveId) ?? null);
  // Seleccionar el objeto (referencia estable); derivar el array fuera del selector
  const outputMap = useOperatorStore((s) => s.outputs);
  const outputs = Object.values(outputMap);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const transport = useOperatorStore.getState().transport;
  const y = positionAt(transport, now);
  const pct = Math.round(progress(transport, y) * 100);
  const remaining = transport.pxPerSec > 0 ? (transport.maxY - y) / transport.pxPerSec : 0;
  const showMessage = status && now - status.at < MESSAGE_MS;
  const mirrored = outputs.filter((o) => o.mirror).length;

  return (
    <footer className="op-statusbar" role="status">
      <span className={`op-status-msg ${status?.kind === 'error' ? 'is-error' : ''}`}>{showMessage ? status.text : 'Listo'}</span>
      <span className="op-spacer" />
      <span title="Historia que pasa por el marcador de lectura">
        Al aire: <strong>{liveStory ? `${liveStory.number} ${liveStory.slug}` : '—'}</strong>
      </span>
      <span className="op-progress" title={`${pct}% del Run Order`}>
        <span className="op-progress-bar" style={{ width: `${pct}%` }} />
      </span>
      <span title="Tiempo restante a la velocidad actual">Restante: {formatDuration(remaining)}</span>
      <span className={outputs.length ? 'op-ok' : 'op-muted'} title="Ventanas de salida conectadas">
        Salidas: {outputs.length}
        {mirrored ? ` (${mirrored} espejo)` : ''}
      </span>
      <span className="op-muted" title="Los cambios se guardan automáticamente en este equipo">
        Autoguardado
      </span>
    </footer>
  );
}
