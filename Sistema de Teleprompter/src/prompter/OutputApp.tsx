/**
 * Ventana de salida del prompter (monitor del presentador / segundo monitor).
 *
 * No tiene estado propio de Run Order: recibe el documento y el transporte de la
 * ventana del operador y calcula la posición localmente en cada fotograma.
 * Teclado y rueda del ratón se reenvían al operador como comandos.
 *
 * Parámetros (en el hash):  #/output?mirror=h   (h | v | hv)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { openChannel, type BridgeMessage, type RemoteCommand } from './bridge';
import { PrompterStage, type Mirror } from './components/PrompterStage';
import { resolveCommand } from './shortcuts';
import { newId } from './importers';
import { reanchor } from './transport';
import type { PrompterDoc, Transport } from './types';
import './prompter.css';

const STALE_AFTER_MS = 3500;

function parseMirror(value: string | null): Mirror {
  return value === 'h' || value === 'v' || value === 'hv' ? value : '';
}

export function OutputApp() {
  const [params] = useSearchParams();
  const mirror = parseMirror(params.get('mirror'));
  const outputId = useMemo(() => newId(), []);

  const [doc, setDoc] = useState<PrompterDoc | null>(null);
  const [transport, setTransport] = useState<Transport | null>(null);
  const [connected, setConnected] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastSeenRef = useRef(0);

  useEffect(() => {
    document.title = mirror ? 'Salida presentador (espejo)' : 'Salida del prompter';
  }, [mirror]);

  // Conexión con el operador
  useEffect(() => {
    const channel = openChannel();
    if (!channel) return;
    channelRef.current = channel;
    const post = (msg: BridgeMessage) => channel.postMessage(msg);

    channel.onmessage = (event: MessageEvent<BridgeMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      lastSeenRef.current = Date.now();
      if (msg.t === 'doc' && msg.doc?.settings && Array.isArray(msg.doc.stories)) setDoc(msg.doc);
      else if (msg.t === 'transport' && msg.tr) setTransport(msg.tr);
      else if (msg.t === 'master-hello') post({ t: 'hello', id: outputId, mirror });
    };

    post({ t: 'hello', id: outputId, mirror });
    const ping = window.setInterval(() => {
      post({ t: 'ping', id: outputId, mirror });
      const alive = Date.now() - lastSeenRef.current < STALE_AFTER_MS;
      setConnected(alive);
      // Sin operador no hay quien controle la velocidad: se congela la lectura
      if (!alive) setTransport((t) => (t && t.playing ? reanchor(t, Date.now(), { playing: false }) : t));
    }, 1000);
    const bye = () => post({ t: 'bye', id: outputId });
    window.addEventListener('beforeunload', bye);

    return () => {
      window.clearInterval(ping);
      window.removeEventListener('beforeunload', bye);
      bye();
      channel.close();
      channelRef.current = null;
    };
  }, [outputId, mirror]);

  useEffect(() => {
    if (doc && transport) setConnected(true);
  }, [doc, transport]);

  const send = (cmd: RemoteCommand, arg?: number) => channelRef.current?.postMessage({ t: 'cmd', cmd, arg });

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else document.documentElement.requestFullscreen().catch(() => undefined);
  };

  // Teclado: mismos atajos que el operador
  const keys = doc?.settings.keys;
  useEffect(() => {
    if (!keys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyF' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      const cmd = resolveCommand(e, keys);
      if (!cmd) return;
      e.preventDefault();
      send(cmd);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keys]);

  // Ocultar el cursor tras 2 s sin movimiento
  useEffect(() => {
    let timer = window.setTimeout(() => setCursorHidden(true), 2000);
    const onMove = () => {
      setCursorHidden(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCursorHidden(true), 2000);
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  const handleWheel = (e: WheelEvent) => {
    if (e.shiftKey) send(e.deltaY > 0 ? 'slower' : 'faster');
    else if (e.ctrlKey) send(e.deltaY > 0 ? 'fontDown' : 'fontUp');
    else send('nudge', e.deltaY * (e.altKey ? 0.4 : 1.5));
  };

  return (
    <div className={`pt-output ${cursorHidden ? 'pt-no-cursor' : ''}`}>
      {doc && transport ? (
        <PrompterStage
          doc={doc}
          transport={transport}
          mirror={mirror}
          onWheel={handleWheel}
          onDoubleClick={toggleFullscreen}
        />
      ) : (
        <div className="pt-output-wait">
          <div className="pt-spinner" />
          <p>Esperando a la ventana del operador…</p>
          <small>Abra esta salida desde el botón «Salida» del teleprompter.</small>
        </div>
      )}
      {doc && !connected && <div className="pt-output-offline">Sin conexión con el operador</div>}
    </div>
  );
}
