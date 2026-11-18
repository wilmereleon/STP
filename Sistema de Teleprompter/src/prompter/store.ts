/**
 * Store del operador (ventana principal = fuente de verdad).
 *
 * Reúne Run Order, ajustes y transporte en un único store de zustand con
 * persistencia en localStorage. Las ventanas de salida no usan este store:
 * reciben un PrompterDoc y el Transport por BroadcastChannel (ver bridge.ts).
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_KEYS, DEFAULT_SETTINGS, FONT_MAX, FONT_MIN, FONT_STEP, SPEED_STEP } from './defaults';
import { createStory, parseRunOrderJson } from './importers';
import type { Command, Layout, PrompterSettings, RunOrder, Story, Transport } from './types';
import {
  bounds,
  clampSpeed,
  positionAt,
  pxPerSecond,
  reanchor,
  remapPosition,
  storyAtPosition,
  storyTarget,
} from './transport';

export type StatusKind = 'info' | 'error';

export interface StatusMessage {
  text: string;
  kind: StatusKind;
  at: number;
}

export interface OutputInfo {
  mirror: string;
  lastSeen: number;
}

export interface OperatorState {
  runOrder: RunOrder;
  dirty: boolean;
  selectedId: string | null;
  liveId: string | null;
  settings: PrompterSettings;
  transport: Transport;
  layout: Layout | null;
  followLive: boolean;
  editorLocked: boolean;
  outputs: Record<string, OutputInfo>;
  status: StatusMessage | null;

  // Run Order
  newRunOrder: () => void;
  loadRunOrder: (runOrder: RunOrder) => void;
  renameRunOrder: (name: string) => void;
  markSaved: () => void;
  addStory: (afterId?: string | null) => string;
  deleteStories: (ids: string[]) => void;
  updateStory: (id: string, patch: Partial<Omit<Story, 'id'>>) => void;
  moveStory: (from: number, to: number) => void;
  dropStory: (id: string) => void;
  toggleFloat: (id: string) => void;
  renumber: () => void;
  select: (id: string | null) => void;
  setFollowLive: (value: boolean) => void;
  setEditorLocked: (value: boolean) => void;

  // Transporte
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  nudge: (deltaPx: number) => void;
  seek: (y: number) => void;
  gotoStory: (id: string) => boolean;
  nextStory: () => void;
  prevStory: () => void;
  toggleBlank: () => void;
  runCommand: (cmd: Command | 'nudge' | 'setSpeed', arg?: number) => void;

  // Ajustes
  updateSettings: (patch: Partial<PrompterSettings>) => void;
  setFontSize: (size: number) => void;
  resetSettings: () => void;

  // Integración con la vista y las salidas
  setLayout: (layout: Layout) => void;
  tick: (now: number) => void;
  registerOutput: (id: string, mirror: string) => void;
  unregisterOutput: (id: string) => void;
  pruneOutputs: (now: number) => void;
  flash: (text: string, kind?: StatusKind) => void;
}

const LEGACY_SCRIPTS_KEY = 'teleprompter-scripts';

function initialRunOrder(): RunOrder {
  // Migración automática desde la v2 (localStorage "teleprompter-scripts")
  try {
    const legacy = typeof localStorage !== 'undefined' ? localStorage.getItem(LEGACY_SCRIPTS_KEY) : null;
    if (legacy) {
      const migrated = parseRunOrderJson(legacy, 'Run Order migrado');
      if (migrated.stories.length > 0) return migrated;
    }
  } catch {
    // Datos antiguos ilegibles: se ignoran
  }
  return {
    name: 'Untitled',
    stories: [
      createStory({
        number: '1',
        slug: 'BIENVENIDA',
        text:
          'Escriba o pegue aquí el texto de la historia.\n\n' +
          'Use **negrita**, *cursiva*, __subrayado__ y ((instrucciones para el presentador)).\n\n' +
          'Abra un archivo .txt con el formato [1] {SLUGLINE} para cargar un Run Order completo.',
      }),
    ],
  };
}

function initialTransport(settings: PrompterSettings, speed = 4): Transport {
  return {
    playing: false,
    speed,
    pxPerSec: pxPerSecond(speed, settings),
    anchorY: 0,
    anchorT: Date.now(),
    minY: 0,
    maxY: 0,
    blank: false,
  };
}

function mergeSettings(saved: Partial<PrompterSettings> | undefined): PrompterSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    cue: { ...DEFAULT_SETTINGS.cue, ...(saved?.cue ?? {}) },
    keys: { ...DEFAULT_KEYS, ...(saved?.keys ?? {}) },
  };
}

export const useOperatorStore = create<OperatorState>()(
  persist(
    (set, get) => {
      const touch = (runOrder: RunOrder, extra: Partial<OperatorState> = {}) =>
        set({ runOrder, dirty: true, ...extra });

      const setTransport = (patch: Partial<Transport>) => {
        const now = Date.now();
        set({ transport: reanchor(get().transport, now, patch) });
      };

      return {
        runOrder: initialRunOrder(),
        dirty: false,
        selectedId: null,
        liveId: null,
        settings: DEFAULT_SETTINGS,
        transport: initialTransport(DEFAULT_SETTINGS),
        layout: null,
        followLive: false,
        editorLocked: false,
        outputs: {},
        status: null,

        // ===== Run Order =====
        newRunOrder: () => {
          const story = createStory({ number: '1', slug: 'NUEVA HISTORIA' });
          // layout: null => la próxima medición coloca la lectura al inicio
          setTransport({ playing: false });
          set({
            runOrder: { name: 'Untitled', stories: [story] },
            dirty: false,
            selectedId: story.id,
            liveId: null,
            layout: null,
          });
        },

        loadRunOrder: (runOrder) => {
          setTransport({ playing: false });
          set({ runOrder, dirty: false, selectedId: runOrder.stories[0]?.id ?? null, liveId: null, layout: null });
          get().flash(`Archivo cargado: ${runOrder.stories.length} historias`);
        },

        renameRunOrder: (name) => touch({ ...get().runOrder, name: name.trim() || 'Untitled' }),

        markSaved: () => {
          set({ dirty: false });
          get().flash('Guardado');
        },

        addStory: (afterId) => {
          const { runOrder } = get();
          const index = afterId ? runOrder.stories.findIndex((s) => s.id === afterId) : -1;
          const story = createStory({ number: String(runOrder.stories.length + 1) });
          const stories = [...runOrder.stories];
          stories.splice(index === -1 ? stories.length : index + 1, 0, story);
          touch({ ...runOrder, stories }, { selectedId: story.id });
          return story.id;
        },

        deleteStories: (ids) => {
          const { runOrder, selectedId } = get();
          const remove = new Set(ids);
          const index = runOrder.stories.findIndex((s) => s.id === selectedId);
          const stories = runOrder.stories.filter((s) => !remove.has(s.id));
          let nextSelected = selectedId;
          if (selectedId && remove.has(selectedId)) {
            nextSelected = stories[Math.min(Math.max(index, 0), stories.length - 1)]?.id ?? null;
          }
          touch({ ...runOrder, stories }, { selectedId: nextSelected });
        },

        updateStory: (id, patch) => {
          const { runOrder } = get();
          touch({ ...runOrder, stories: runOrder.stories.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
        },

        moveStory: (from, to) => {
          const { runOrder } = get();
          const n = runOrder.stories.length;
          if (from === to || from < 0 || to < 0 || from >= n || to >= n) return;
          const stories = [...runOrder.stories];
          const [moved] = stories.splice(from, 1);
          stories.splice(to, 0, moved);
          touch({ ...runOrder, stories });
        },

        dropStory: (id) => {
          const { runOrder } = get();
          const from = runOrder.stories.findIndex((s) => s.id === id);
          if (from === -1) return;
          get().moveStory(from, runOrder.stories.length - 1);
          get().flash('Historia enviada al final del Run Order');
        },

        toggleFloat: (id) => {
          const story = get().runOrder.stories.find((s) => s.id === id);
          if (!story) return;
          get().updateStory(id, { floated: !story.floated });
          get().flash(story.floated ? 'Historia restaurada en la salida' : 'Historia flotada (FLT): no sale al prompter');
        },

        renumber: () => {
          const { runOrder } = get();
          touch({ ...runOrder, stories: runOrder.stories.map((s, i) => ({ ...s, number: String(i + 1) })) });
        },

        select: (id) => set({ selectedId: id }),
        setFollowLive: (value) => set({ followLive: value }),
        setEditorLocked: (value) => set({ editorLocked: value }),

        // ===== Transporte =====
        play: () => {
          const { transport, layout } = get();
          if (transport.playing || !layout) return;
          const y = positionAt(transport, Date.now());
          // Si está al final, reproducir de nuevo desde el inicio
          setTransport({ playing: true, anchorY: y >= transport.maxY - 1 ? transport.minY : y });
        },
        pause: () => {
          if (get().transport.playing) setTransport({ playing: false });
        },
        togglePlay: () => (get().transport.playing ? get().pause() : get().play()),
        stop: () => setTransport({ playing: false, anchorY: get().transport.minY }),

        setSpeed: (speed) => {
          const value = clampSpeed(speed);
          setTransport({ speed: value, pxPerSec: pxPerSecond(value, get().settings) });
        },

        nudge: (deltaPx) => {
          const { transport } = get();
          setTransport({ anchorY: positionAt(transport, Date.now()) + deltaPx });
        },

        seek: (y) => setTransport({ anchorY: y }),

        gotoStory: (id) => {
          const { layout, settings, runOrder } = get();
          const story = runOrder.stories.find((s) => s.id === id);
          if (story?.floated) {
            get().flash('La historia está flotada (FLT) y no aparece en la salida', 'error');
            return false;
          }
          const target = layout ? storyTarget(layout, id, settings) : null;
          if (target === null) return false;
          setTransport({ anchorY: target });
          set({ liveId: id });
          return true;
        },

        nextStory: () => {
          const { layout, transport } = get();
          if (!layout) return;
          const current = storyAtPosition(layout, positionAt(transport, Date.now()));
          const index = layout.stories.findIndex((s) => s.id === current);
          const next = layout.stories[index + 1];
          if (next) get().gotoStory(next.id);
          else get().flash('Ya está en la última historia');
        },

        prevStory: () => {
          const { layout, transport, settings } = get();
          if (!layout) return;
          const y = positionAt(transport, Date.now());
          const current = storyAtPosition(layout, y);
          const index = layout.stories.findIndex((s) => s.id === current);
          const start = current ? storyTarget(layout, current, settings) : null;
          // Como en un reproductor: primero vuelve al inicio de la historia actual
          const threshold = settings.fontSize * settings.lineSpacing;
          if (start !== null && y - start > threshold) {
            setTransport({ anchorY: start });
            return;
          }
          const prev = layout.stories[index - 1];
          if (prev) get().gotoStory(prev.id);
          else if (start !== null) setTransport({ anchorY: start });
        },

        toggleBlank: () => {
          const blank = !get().transport.blank;
          setTransport({ blank });
          get().flash(blank ? 'Blanking activado: la salida no muestra texto' : 'Blanking desactivado');
        },

        runCommand: (cmd, arg) => {
          const s = get();
          switch (cmd) {
            case 'togglePlay':
              return s.togglePlay();
            case 'stop':
              return s.stop();
            case 'faster':
              return s.setSpeed(s.transport.speed + SPEED_STEP);
            case 'slower':
              return s.setSpeed(s.transport.speed - SPEED_STEP);
            case 'setSpeed':
              return s.setSpeed(arg ?? s.transport.speed);
            case 'fontUp':
              return s.setFontSize(s.settings.fontSize + FONT_STEP);
            case 'fontDown':
              return s.setFontSize(s.settings.fontSize - FONT_STEP);
            case 'nextStory':
              return s.nextStory();
            case 'prevStory':
              return s.prevStory();
            case 'top': {
              const live = s.layout ? storyAtPosition(s.layout, positionAt(s.transport, Date.now())) : null;
              if (live) s.gotoStory(live);
              return;
            }
            case 'toggleBlank':
              return s.toggleBlank();
            case 'gotoSelected':
              if (s.selectedId) s.gotoStory(s.selectedId);
              return;
            case 'nudge':
              return s.nudge(arg ?? 0);
          }
        },

        // ===== Ajustes =====
        updateSettings: (patch) => {
          const settings = mergeSettings({ ...get().settings, ...patch });
          set({ settings });
          setTransport({ pxPerSec: pxPerSecond(get().transport.speed, settings) });
        },

        setFontSize: (size) => {
          const fontSize = Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, size)));
          if (fontSize !== get().settings.fontSize) get().updateSettings({ fontSize });
        },

        resetSettings: () => {
          get().updateSettings({ ...DEFAULT_SETTINGS, keys: DEFAULT_KEYS });
          get().flash('Ajustes restablecidos');
        },

        // ===== Maquetación y ciclo de refresco =====
        setLayout: (layout) => {
          const { layout: prev, transport, settings } = get();
          const now = Date.now();
          const { minY, maxY } = bounds(layout, settings);
          let y = positionAt(transport, now);
          if (!prev) y = minY;
          else if (prev.signature !== layout.signature || prev.contentHeight !== layout.contentHeight) {
            y = remapPosition(prev, layout, y);
          }
          set({
            layout,
            transport: reanchor({ ...transport, minY, maxY }, now, { anchorY: y }),
            liveId: storyAtPosition(layout, Math.max(minY, Math.min(maxY, y))),
          });
        },

        tick: (now) => {
          const { transport, layout, liveId, followLive, selectedId } = get();
          if (!layout) return;
          const y = positionAt(transport, now);
          if (transport.playing && y >= transport.maxY) {
            setTransport({ playing: false, anchorY: transport.maxY });
            get().flash('Fin del Run Order');
          }
          const live = storyAtPosition(layout, y);
          if (live !== liveId) {
            set({ liveId: live, ...(followLive && live && live !== selectedId ? { selectedId: live } : {}) });
          }
        },

        registerOutput: (id, mirror) => {
          const outputs = { ...get().outputs };
          const isNew = !outputs[id];
          outputs[id] = { mirror, lastSeen: Date.now() };
          set({ outputs });
          if (isNew) get().flash(mirror ? 'Salida de presentador (espejo) conectada' : 'Salida conectada');
        },

        unregisterOutput: (id) => {
          if (!get().outputs[id]) return;
          const outputs = { ...get().outputs };
          delete outputs[id];
          set({ outputs });
          get().flash('Salida desconectada');
        },

        pruneOutputs: (now) => {
          const outputs = get().outputs;
          const stale = Object.keys(outputs).filter((id) => now - outputs[id].lastSeen > 4000);
          if (stale.length === 0) return;
          const next = { ...outputs };
          stale.forEach((id) => delete next[id]);
          set({ outputs: next });
        },

        flash: (text, kind = 'info') => set({ status: { text, kind, at: Date.now() } }),
      };
    },
    {
      name: 'stp-operator-v3',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        runOrder: s.runOrder,
        dirty: s.dirty,
        settings: s.settings,
        followLive: s.followLive,
        speed: s.transport.speed,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<OperatorState> & { speed?: number };
        const settings = mergeSettings(p.settings);
        const speed = clampSpeed(p.speed ?? current.transport.speed);
        const runOrder = p.runOrder?.stories ? p.runOrder : current.runOrder;
        return {
          ...current,
          runOrder,
          dirty: p.dirty ?? false,
          followLive: p.followLive ?? false,
          settings,
          transport: initialTransport(settings, speed),
          selectedId: runOrder.stories[0]?.id ?? null,
        };
      },
    }
  )
);

/** Selector derivado: historias que salen al prompter */
export function promptStories(stories: Story[]): Story[] {
  return stories.filter((s) => !s.floated);
}
