import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../defaults';
import { useOperatorStore } from '../store';
import { positionAt, pxPerSecond, reanchor, remapPosition, storyAtPosition } from '../transport';
import type { Layout, Transport } from '../types';

const base: Transport = {
  playing: false,
  speed: 4,
  pxPerSec: 100,
  anchorY: 0,
  anchorT: 1000,
  minY: -300,
  maxY: 5000,
  blank: false,
};

function layoutFor(ids: string[], storyHeight = 1000, cueY = 300): Layout {
  return {
    contentHeight: ids.length * storyHeight + 100,
    viewHeight: 1080,
    cueY,
    stories: ids.map((id, i) => ({ id, top: i * storyHeight, height: storyHeight })),
    signature: 'sig',
  };
}

describe('transporte (posición en función del tiempo)', () => {
  it('no avanza en pausa y avanza pxPerSec por segundo en reproducción', () => {
    expect(positionAt(base, 5000)).toBe(0);
    expect(positionAt({ ...base, playing: true }, 3000)).toBe(200);
  });

  it('se limita a [minY, maxY]', () => {
    expect(positionAt({ ...base, playing: true }, 1_000_000)).toBe(5000);
    expect(positionAt({ ...base, anchorY: -9999 }, 0)).toBe(-300);
  });

  it('reanchor conserva la posición al cambiar la velocidad', () => {
    const playing = { ...base, playing: true };
    const next = reanchor(playing, 2000, { pxPerSec: 50 });
    expect(next.anchorY).toBe(100);
    expect(positionAt(next, 4000)).toBe(200);
  });

  it('la velocidad es proporcional a la altura de línea', () => {
    expect(pxPerSecond(1, DEFAULT_SETTINGS)).toBeCloseTo(0.1 * DEFAULT_SETTINGS.fontSize * DEFAULT_SETTINGS.lineSpacing);
  });

  it('identifica la historia que pasa por el marcador', () => {
    const layout = layoutFor(['a', 'b', 'c']);
    expect(storyAtPosition(layout, -300)).toBe('a');
    expect(storyAtPosition(layout, 800)).toBe('b');
    expect(storyAtPosition(layout, 2500)).toBe('c');
  });

  it('remapPosition mantiene el punto de lectura dentro de la historia al cambiar la fuente', () => {
    const before = layoutFor(['a', 'b'], 1000);
    const after = layoutFor(['a', 'b'], 2000);
    // Lectura al 50 % de la historia b
    const y = 1500 - before.cueY;
    expect(remapPosition(before, after, y)).toBe(2000 + 1000 - after.cueY);
  });
});

describe('store del operador', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const store = useOperatorStore.getState();
    store.loadRunOrder({
      name: 'Test',
      stories: [
        { id: 'a', number: '1', slug: 'A', text: 'a', floated: false },
        { id: 'b', number: '2', slug: 'B', text: 'b', floated: false },
        { id: 'c', number: '3', slug: 'C', text: 'c', floated: false },
      ],
    });
    store.setLayout(layoutFor(['a', 'b', 'c']));
  });

  it('empieza con la primera historia en el marcador', () => {
    const { transport, liveId } = useOperatorStore.getState();
    expect(transport.minY).toBe(-300);
    expect(positionAt(transport, Date.now())).toBe(-300);
    expect(liveId).toBe('a');
  });

  it('play / pausa conservan la posición', () => {
    const s = useOperatorStore.getState();
    s.play();
    vi.setSystemTime(12_000);
    s.pause();
    const t = useOperatorStore.getState().transport;
    expect(t.playing).toBe(false);
    expect(positionAt(t, 99_999)).toBeCloseTo(-300 + 2 * t.pxPerSec, 5);
  });

  it('siguiente / anterior saltan entre historias', () => {
    const s = useOperatorStore.getState();
    s.nextStory();
    expect(useOperatorStore.getState().liveId).toBe('b');
    expect(positionAt(useOperatorStore.getState().transport, Date.now())).toBe(1000 - 300);
    s.nextStory();
    expect(useOperatorStore.getState().liveId).toBe('c');
    s.prevStory();
    expect(useOperatorStore.getState().liveId).toBe('b');
  });

  it('anterior vuelve primero al inicio de la historia actual', () => {
    const s = useOperatorStore.getState();
    s.gotoStory('b');
    s.nudge(500);
    s.prevStory();
    expect(positionAt(useOperatorStore.getState().transport, Date.now())).toBe(700);
  });

  it('se detiene al final del Run Order', () => {
    const s = useOperatorStore.getState();
    s.play();
    vi.setSystemTime(10_000_000);
    s.tick(Date.now());
    const t = useOperatorStore.getState().transport;
    expect(t.playing).toBe(false);
    expect(positionAt(t, Date.now())).toBe(t.maxY);
    expect(useOperatorStore.getState().status?.text).toBe('Fin del Run Order');
  });

  it('no salta a historias flotadas', () => {
    const s = useOperatorStore.getState();
    s.toggleFloat('b');
    expect(s.gotoStory('b')).toBe(false);
    expect(useOperatorStore.getState().status?.kind).toBe('error');
  });

  it('la velocidad se limita al rango permitido', () => {
    const s = useOperatorStore.getState();
    s.setSpeed(999);
    expect(useOperatorStore.getState().transport.speed).toBe(20);
    s.runCommand('slower');
    expect(useOperatorStore.getState().transport.speed).toBe(19.5);
  });

  it('reordenar y enviar al final mantiene todas las historias', () => {
    const s = useOperatorStore.getState();
    s.moveStory(0, 2);
    expect(useOperatorStore.getState().runOrder.stories.map((x) => x.id)).toEqual(['b', 'c', 'a']);
    s.dropStory('b');
    expect(useOperatorStore.getState().runOrder.stories.map((x) => x.id)).toEqual(['c', 'a', 'b']);
    expect(useOperatorStore.getState().dirty).toBe(true);
  });
});
