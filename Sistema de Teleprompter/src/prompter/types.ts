/**
 * Modelo de dominio del teleprompter (v3).
 *
 * Inspirado en WinPlus-IP: un Run Order contiene historias (stories); cada
 * historia tiene un slugline (título) y texto. La salida del prompter muestra
 * el Run Order completo de forma continua, sin las historias flotadas.
 */

export interface Story {
  id: string;
  /** Identificador visible (columna "Nº"), p. ej. "1", "2A" */
  number: string;
  /** Slugline (título de la historia) */
  slug: string;
  /** Texto con marcado ligero: **negrita**, *cursiva*, __subrayado__, ((instrucción)) */
  text: string;
  /** Flotada: se mantiene en el Run Order pero no sale al prompter (FLT) */
  floated: boolean;
}

export interface RunOrder {
  name: string;
  stories: Story[];
}

export type CueStyle = 'arrow' | 'block' | 'line';
export type AspectRatio = '16:9' | '16:10' | '4:3';

export type Command =
  | 'togglePlay'
  | 'stop'
  | 'faster'
  | 'slower'
  | 'fontUp'
  | 'fontDown'
  | 'nextStory'
  | 'prevStory'
  | 'top'
  | 'toggleBlank'
  | 'gotoSelected';

/** Teclas por comando, en formato "Ctrl+Shift+Alt+<KeyboardEvent.code>" */
export type KeyMap = Record<Command, string[]>;

export interface CueSettings {
  visible: boolean;
  style: CueStyle;
  color: string;
  /** Posición vertical del marcador (% de la altura visible, 0-90) */
  offset: number;
  /** true: cada historia se coloca junto al marcador al saltar; false: arriba */
  controlsPromptPosition: boolean;
}

export interface PrompterSettings {
  fontFamily: string;
  /** Tamaño de fuente en px lógicos sobre un lienzo de 1920 px de ancho */
  fontSize: number;
  /** Interlineado (multiplicador del tamaño de fuente) */
  lineSpacing: number;
  /** Márgenes laterales en % del ancho */
  marginLeft: number;
  marginRight: number;
  uppercase: boolean;
  textColor: string;
  backgroundColor: string;
  instructionColor: string;
  showSluglines: boolean;
  showInstructions: boolean;
  aspect: AspectRatio;
  cue: CueSettings;
  blankMessage: string;
  showClock: boolean;
  clock24h: boolean;
  /** Palabras por minuto para estimar duraciones */
  wordsPerMinute: number;
  keys: KeyMap;
}

/**
 * Estado de transporte. La posición es una función del tiempo:
 *   y(t) = anchorY + (playing ? pxPerSec * (t - anchorT) / 1000 : 0)
 * limitada a [minY, maxY]. Así la ventana principal y las salidas calculan la
 * misma posición sin depender de recibir un mensaje por fotograma.
 */
export interface Transport {
  playing: boolean;
  /** Velocidad en la escala del operador (0.5 - 20) */
  speed: number;
  pxPerSec: number;
  anchorY: number;
  anchorT: number;
  minY: number;
  maxY: number;
  blank: boolean;
}

/** Medidas del contenido en px lógicos (independientes de la escala de pantalla) */
export interface StoryBox {
  id: string;
  top: number;
  height: number;
}

export interface Layout {
  contentHeight: number;
  viewHeight: number;
  cueY: number;
  stories: StoryBox[];
  /** Huella de los parámetros que afectan la maquetación */
  signature: string;
}

/** Documento que se envía a las ventanas de salida */
export interface PrompterDoc {
  stories: Story[];
  settings: PrompterSettings;
}
