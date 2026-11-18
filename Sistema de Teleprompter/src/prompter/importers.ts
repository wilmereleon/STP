/**
 * Importación y exportación de Run Orders.
 *
 * Formatos soportados:
 *  - .txt estructurado:  "[1] {SLUGLINE}" seguido del texto de la historia
 *  - .txt libre: una sola historia con el nombre del archivo como slugline
 *  - .xlsx / .xls: columnas Número / Título / Texto (detección por alias)
 *  - .json (formato propio "stp-runorder")
 */

import type { RunOrder, Story } from './types';

export const RUNORDER_FORMAT = 'stp-runorder';
export const RUNORDER_VERSION = 3;
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createStory(partial: Partial<Story> = {}): Story {
  return {
    id: newId(),
    number: partial.number ?? '',
    slug: partial.slug ?? 'NUEVA HISTORIA',
    text: partial.text ?? '',
    floated: partial.floated ?? false,
  };
}

function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').trim() || 'Run Order';
}

/** Elimina líneas en blanco al inicio y al final, conservando las intermedias */
function trimBlankLines(text: string): string {
  return text.replace(/^(?:[ \t]*\n)+/, '').replace(/(?:\n[ \t]*)+$/, '').replace(/[ \t]+$/gm, '');
}

const HEADER = /^[ \t]*\[([0-9][0-9A-Za-z]{0,5})\][ \t]*(?:\{([^}\n]*)\})?[ \t]*(.*)$/gm;

export function parseScriptText(content: string, fileName = 'Run Order.txt'): RunOrder {
  const text = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const headers = Array.from(text.matchAll(HEADER));
  const name = baseName(fileName);

  if (headers.length === 0) {
    return { name, stories: [createStory({ number: '1', slug: name.toUpperCase(), text: trimBlankLines(text) })] };
  }

  const stories: Story[] = [];
  const preamble = trimBlankLines(text.slice(0, headers[0].index));
  if (preamble) stories.push(createStory({ number: '0', slug: 'INICIO', text: preamble }));

  headers.forEach((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < headers.length ? headers[i + 1].index ?? text.length : text.length;
    const sameLine = (m[3] ?? '').trim();
    const body = trimBlankLines((sameLine ? sameLine + '\n' : '') + text.slice(start, end).replace(/^\n/, ''));
    const slug = (m[2] ?? '').trim() || `HISTORIA ${m[1]}`;
    stories.push(createStory({ number: m[1], slug, text: body }));
  });

  return { name, stories };
}

const COLUMN_ALIASES = {
  number: ['número de guion', 'numero de guion', 'número', 'numero', 'nº', 'no', 'id', 'number'],
  slug: ['título', 'titulo', 'title', 'slug', 'slugline', 'nombre'],
  text: ['texto/contenido', 'texto', 'contenido', 'text', 'script', 'guion', 'body'],
};

function findColumn(headers: string[], aliases: string[]): number {
  const exact = headers.findIndex((h) => aliases.includes(h));
  if (exact !== -1) return exact;
  return headers.findIndex((h) => aliases.some((a) => a.length > 2 && h.includes(a)));
}

export async function parseExcel(buffer: ArrayBuffer, fileName: string): Promise<RunOrder> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('El archivo no contiene hojas');

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
  if (rows.length < 2) throw new Error('La hoja no tiene filas de datos');

  const headers = (rows[0] as unknown[]).map((h) => String(h).trim().toLowerCase());
  const textCol = findColumn(headers, COLUMN_ALIASES.text);
  if (textCol === -1) throw new Error('Falta la columna "Texto" (o "Contenido" / "Script")');
  const slugCol = findColumn(headers, COLUMN_ALIASES.slug);
  const numCol = findColumn(headers, COLUMN_ALIASES.number);

  const stories: Story[] = [];
  rows.slice(1).forEach((row, i) => {
    const cells = row as unknown[];
    const body = String(cells[textCol] ?? '').replace(/\r\n?/g, '\n').trim();
    const slug = slugCol !== -1 ? String(cells[slugCol] ?? '').trim() : '';
    if (!body && !slug) return;
    const number = numCol !== -1 ? String(cells[numCol] ?? '').trim() : '';
    stories.push(createStory({ number: number || String(i + 1), slug: slug || `HISTORIA ${i + 1}`, text: body }));
  });

  if (stories.length === 0) throw new Error('No se encontraron historias con texto');
  return { name: baseName(fileName), stories };
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : fallback;
}

export function parseRunOrderJson(content: string, fileName: string): RunOrder {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('El archivo JSON no es válido');
  }

  const record = data as Record<string, unknown>;
  const list = Array.isArray(data) ? data : Array.isArray(record?.stories) ? record.stories : null;
  if (!list) throw new Error('El JSON no contiene una lista de historias');

  const stories = (list as Record<string, unknown>[])
    .filter((s) => s && typeof s === 'object')
    .map((s, i) =>
      createStory({
        number: asString(s.number, String(i + 1)),
        // Compatibilidad con el formato v2 (title / text)
        slug: asString(s.slug ?? s.title, `HISTORIA ${i + 1}`),
        text: asString(s.text),
        floated: s.floated === true,
      })
    );

  const name = Array.isArray(data) ? baseName(fileName) : asString(record.name, baseName(fileName));
  return { name, stories };
}

export async function importFile(file: File): Promise<RunOrder> {
  if (file.size > MAX_IMPORT_BYTES) throw new Error('El archivo supera el límite de 20 MB');
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(await file.arrayBuffer(), file.name);
  const content = await file.text();
  if (ext === 'json' || ext === 'stp') return parseRunOrderJson(content, file.name.replace(/\.stp$/i, ''));
  return parseScriptText(content, file.name);
}

export function exportJson(runOrder: RunOrder): string {
  return JSON.stringify(
    {
      format: RUNORDER_FORMAT,
      version: RUNORDER_VERSION,
      name: runOrder.name,
      stories: runOrder.stories.map(({ number, slug, text, floated }) => ({ number, slug, text, floated })),
    },
    null,
    2
  );
}

export function exportTxt(runOrder: RunOrder): string {
  return (
    runOrder.stories
      .map((s, i) => `[${s.number || i + 1}] {${s.slug}}\n${s.text}`)
      .join('\n\n') + '\n'
  );
}

export function downloadFile(fileName: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'run-order';
}
