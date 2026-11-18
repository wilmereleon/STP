/**
 * Comunicación entre la ventana del operador (master) y las salidas.
 *
 * Usa BroadcastChannel (mismo origen): no depende de window.opener, admite
 * varias salidas a la vez y sigue funcionando si se recarga cualquiera de ellas.
 *
 *   master -> salidas : doc (historias + ajustes), transport, master-hello
 *   salidas -> master : hello, ping, bye, cmd
 */

import type { Command, PrompterDoc, Transport } from './types';
import { promptStories, useOperatorStore } from './store';

export const CHANNEL_NAME = 'stp-prompter-v3';

export type BridgeMessage =
  | { t: 'doc'; doc: PrompterDoc }
  | { t: 'transport'; tr: Transport }
  | { t: 'master-hello' }
  | { t: 'hello'; id: string; mirror: string }
  | { t: 'ping'; id: string; mirror: string }
  | { t: 'bye'; id: string }
  | { t: 'cmd'; cmd: RemoteCommand; arg?: number };

export type RemoteCommand = Command | 'nudge' | 'setSpeed';

const REMOTE_COMMANDS: ReadonlySet<string> = new Set<RemoteCommand>([
  'togglePlay',
  'stop',
  'faster',
  'slower',
  'fontUp',
  'fontDown',
  'nextStory',
  'prevStory',
  'top',
  'toggleBlank',
  'gotoSelected',
  'nudge',
  'setSpeed',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function openChannel(): BroadcastChannel | null {
  return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);
}

/** Inicia el lado master. Devuelve una función de limpieza. */
export function startMasterBridge(): () => void {
  const channel = openChannel();
  if (!channel) return () => undefined;

  const post = (msg: BridgeMessage) => channel.postMessage(msg);
  const currentDoc = (): PrompterDoc => {
    const s = useOperatorStore.getState();
    return { stories: promptStories(s.runOrder.stories), settings: s.settings };
  };

  let docTimer: number | null = null;
  const postDocSoon = () => {
    if (docTimer !== null) return;
    docTimer = window.setTimeout(() => {
      docTimer = null;
      post({ t: 'doc', doc: currentDoc() });
    }, 30);
  };

  const unsubscribe = useOperatorStore.subscribe((state, prev) => {
    if (state.runOrder.stories !== prev.runOrder.stories || state.settings !== prev.settings) postDocSoon();
    if (state.transport !== prev.transport) post({ t: 'transport', tr: state.transport });
  });

  channel.onmessage = (event: MessageEvent<unknown>) => {
    const msg = event.data;
    if (!isRecord(msg) || typeof msg.t !== 'string') return;
    const store = useOperatorStore.getState();
    switch (msg.t) {
      case 'hello':
        if (typeof msg.id !== 'string') return;
        store.registerOutput(msg.id, typeof msg.mirror === 'string' ? msg.mirror : '');
        post({ t: 'doc', doc: currentDoc() });
        post({ t: 'transport', tr: store.transport });
        return;
      case 'ping':
        if (typeof msg.id === 'string') store.registerOutput(msg.id, typeof msg.mirror === 'string' ? msg.mirror : '');
        return;
      case 'bye':
        if (typeof msg.id === 'string') store.unregisterOutput(msg.id);
        return;
      case 'cmd':
        if (typeof msg.cmd === 'string' && REMOTE_COMMANDS.has(msg.cmd)) {
          const arg = typeof msg.arg === 'number' && Number.isFinite(msg.arg) ? msg.arg : undefined;
          store.runCommand(msg.cmd as RemoteCommand, arg);
        }
        return;
    }
  };

  // Latido: las salidas detectan si el operador sigue activo
  const heartbeat = window.setInterval(() => {
    const s = useOperatorStore.getState();
    s.pruneOutputs(Date.now());
    post({ t: 'transport', tr: s.transport });
  }, 1000);

  post({ t: 'master-hello' });

  return () => {
    unsubscribe();
    window.clearInterval(heartbeat);
    if (docTimer !== null) window.clearTimeout(docTimer);
    channel.close();
  };
}
