import type { Command, KeyMap } from './types';

/** "Ctrl+Shift+Alt+<code>" a partir de un evento de teclado */
export function keyString(e: Pick<KeyboardEvent, 'code' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  parts.push(e.code);
  return parts.join('+');
}

const MODIFIER_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
]);

export function isModifierOnly(code: string): boolean {
  return MODIFIER_CODES.has(code);
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Dentro de campos de texto solo se aceptan teclas de función o combinaciones
 * con Ctrl, para que escribir (espacios, flechas, + / -) no mueva el prompter.
 */
function allowedWhileTyping(combo: string): boolean {
  const code = combo.split('+').pop() ?? '';
  return /^F\d{1,2}$/.test(code) || combo.startsWith('Ctrl+');
}

export function resolveCommand(e: KeyboardEvent, keys: KeyMap): Command | null {
  if (isModifierOnly(e.code)) return null;
  const combo = keyString(e);
  if (isTypingTarget(e.target) && !allowedWhileTyping(combo)) return null;
  for (const [cmd, list] of Object.entries(keys) as [Command, string[]][]) {
    if (list?.includes(combo)) return cmd;
  }
  return null;
}

const CODE_LABELS: Record<string, string> = {
  Space: 'Espacio',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  PageUp: 'RePág',
  PageDown: 'AvPág',
  Equal: '+',
  Minus: '-',
  NumpadAdd: 'Num +',
  NumpadSubtract: 'Num -',
  Escape: 'Esc',
  Home: 'Inicio',
  End: 'Fin',
  Enter: 'Intro',
};

export function formatKey(combo: string): string {
  return combo
    .split('+')
    .map((part) => CODE_LABELS[part] ?? part.replace(/^Key/, '').replace(/^Digit/, ''))
    .join(' + ');
}
