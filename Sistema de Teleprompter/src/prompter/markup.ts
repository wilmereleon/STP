/**
 * Marcado ligero del texto de las historias.
 *
 *   **negrita**   *cursiva*   __subrayado__   ((instrucción para el presentador))
 *
 * Las instrucciones se muestran con otro color y no cuentan para la duración,
 * igual que las "presenter instructions" de WinPlus-IP.
 */

export type TokenKind = 'text' | 'bold' | 'italic' | 'underline' | 'instruction';

export interface Token {
  kind: TokenKind;
  value: string;
}

const INLINE = /\(\(([\s\S]+?)\)\)|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|\*([^*\n]+?)\*/g;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) tokens.push({ kind: 'text', value: text.slice(last, start) });
    if (m[1] !== undefined) tokens.push({ kind: 'instruction', value: m[1] });
    else if (m[2] !== undefined) tokens.push({ kind: 'bold', value: m[2] });
    else if (m[3] !== undefined) tokens.push({ kind: 'underline', value: m[3] });
    else if (m[4] !== undefined) tokens.push({ kind: 'italic', value: m[4] });
    last = start + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: 'text', value: text.slice(last) });
  return tokens;
}

/** Texto legible (sin instrucciones ni símbolos de marcado) */
export function readableText(text: string): string {
  return tokenize(text)
    .filter((t) => t.kind !== 'instruction')
    .map((t) => t.value)
    .join('');
}

export function wordCount(text: string): number {
  const words = readableText(text).trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function estimateSeconds(text: string, wordsPerMinute: number): number {
  const wpm = Math.max(60, wordsPerMinute || 180);
  return Math.round((wordCount(text) / wpm) * 60);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
