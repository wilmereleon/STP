/**
 * Cálculos puros del transporte (sin DOM ni estado global).
 * Los usan la ventana principal y las salidas para obtener la misma posición.
 */

import { ASPECTS, SPEED_MAX, SPEED_MIN, STAGE_WIDTH } from './defaults';
import type { Layout, PrompterSettings, Transport } from './types';

/** Líneas por segundo por cada punto de velocidad */
const LINES_PER_SECOND_PER_SPEED = 0.1;

export function clampSpeed(speed: number): number {
  const rounded = Math.round(speed * 10) / 10;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, rounded));
}

export function lineHeightPx(settings: PrompterSettings): number {
  return settings.fontSize * settings.lineSpacing;
}

export function pxPerSecond(speed: number, settings: PrompterSettings): number {
  return speed * LINES_PER_SECOND_PER_SPEED * lineHeightPx(settings);
}

export function stageHeight(settings: PrompterSettings): number {
  return Math.round(STAGE_WIDTH / ASPECTS[settings.aspect]);
}

export function cueY(settings: PrompterSettings): number {
  return Math.round((stageHeight(settings) * settings.cue.offset) / 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Posición (px lógicos) del contenido en el borde superior de la vista en el instante `now` */
export function positionAt(t: Transport, now: number): number {
  const elapsed = t.playing ? Math.max(0, now - t.anchorT) : 0;
  return clamp(t.anchorY + (t.pxPerSec * elapsed) / 1000, t.minY, Math.max(t.minY, t.maxY));
}

/** Fija un nuevo ancla en la posición actual y aplica los cambios indicados */
export function reanchor(t: Transport, now: number, patch: Partial<Transport> = {}): Transport {
  const y = positionAt(t, now);
  const next: Transport = { ...t, ...patch, anchorT: now };
  next.anchorY = clamp(patch.anchorY ?? y, next.minY, Math.max(next.minY, next.maxY));
  return next;
}

export function storyTarget(layout: Layout, storyId: string, settings: PrompterSettings): number | null {
  const box = layout.stories.find((s) => s.id === storyId);
  if (!box) return null;
  return box.top - (settings.cue.controlsPromptPosition ? layout.cueY : 0);
}

export function bounds(layout: Layout, settings: PrompterSettings): { minY: number; maxY: number } {
  const first = layout.stories[0];
  const minY = first ? first.top - (settings.cue.controlsPromptPosition ? layout.cueY : 0) : -layout.cueY;
  const maxY = Math.max(minY, layout.contentHeight - layout.cueY);
  return { minY, maxY };
}

/** Historia que está pasando por la línea de lectura (marcador) */
export function storyAtPosition(layout: Layout, y: number): string | null {
  const line = y + layout.cueY + 1;
  let current: string | null = layout.stories[0]?.id ?? null;
  for (const box of layout.stories) {
    if (box.top <= line) current = box.id;
    else break;
  }
  return current;
}

/**
 * Tras un cambio de maquetación (fuente, márgenes, texto) conserva la lectura
 * en el mismo punto relativo de la misma historia.
 */
export function remapPosition(prev: Layout, next: Layout, y: number): number {
  const line = y + prev.cueY;
  const id = storyAtPosition(prev, y);
  const a = prev.stories.find((s) => s.id === id);
  const b = next.stories.find((s) => s.id === id);
  if (!a || !b) {
    const ratio = prev.contentHeight > 0 ? line / prev.contentHeight : 0;
    return ratio * next.contentHeight - next.cueY;
  }
  const frac = a.height > 0 ? clamp((line - a.top) / a.height, 0, 1) : 0;
  return b.top + frac * b.height - next.cueY;
}

/** Fracción (0-1) recorrida del Run Order */
export function progress(t: Transport, y: number): number {
  const span = t.maxY - t.minY;
  return span > 0 ? clamp((y - t.minY) / span, 0, 1) : 0;
}
