import type { Command, KeyMap, PrompterSettings, AspectRatio } from './types';

/** Ancho lógico del lienzo del prompter. Preview y salidas se escalan desde aquí. */
export const STAGE_WIDTH = 1920;

export const SPEED_MIN = 0.5;
export const SPEED_MAX = 20;
export const SPEED_STEP = 0.5;
export const FONT_MIN = 24;
export const FONT_MAX = 500;
export const FONT_STEP = 8;

export const ASPECTS: Record<AspectRatio, number> = {
  '16:9': 16 / 9,
  '16:10': 16 / 10,
  '4:3': 4 / 3,
};

export const COMMAND_LABELS: Record<Command, string> = {
  togglePlay: 'Reproducir / Pausar',
  stop: 'Detener (volver al inicio)',
  faster: 'Aumentar velocidad',
  slower: 'Reducir velocidad',
  fontUp: 'Aumentar fuente',
  fontDown: 'Reducir fuente',
  nextStory: 'Historia siguiente',
  prevStory: 'Historia anterior',
  top: 'Inicio de la historia al aire',
  toggleBlank: 'Blanking (ocultar texto en salida)',
  gotoSelected: 'Saltar a la historia seleccionada',
};

export const DEFAULT_KEYS: KeyMap = {
  togglePlay: ['Space', 'F10'],
  stop: ['F8'],
  faster: ['ArrowUp', 'F1'],
  slower: ['ArrowDown', 'F2'],
  fontUp: ['F3', 'Equal', 'NumpadAdd'],
  fontDown: ['F4', 'Minus', 'NumpadSubtract'],
  nextStory: ['PageDown', 'F12'],
  prevStory: ['PageUp', 'F11'],
  top: ['Home'],
  toggleBlank: ['Shift+F9', 'KeyB'],
  gotoSelected: ['F6'],
};

export const DEFAULT_SETTINGS: PrompterSettings = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: 120,
  lineSpacing: 1.3,
  marginLeft: 8,
  marginRight: 5,
  uppercase: false,
  textColor: '#ffffff',
  backgroundColor: '#000000',
  instructionColor: '#ffd400',
  showSluglines: true,
  showInstructions: true,
  aspect: '16:9',
  cue: {
    visible: true,
    style: 'arrow',
    color: '#ffd400',
    offset: 30,
    controlsPromptPosition: true,
  },
  blankMessage: '',
  showClock: false,
  clock24h: true,
  wordsPerMinute: 180,
  keys: DEFAULT_KEYS,
};

export const FONT_FAMILIES = [
  'Arial, Helvetica, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Tahoma, sans-serif',
  "'Segoe UI', sans-serif",
  "'Times New Roman', Times, serif",
  'Georgia, serif',
  "'Courier New', monospace",
];
