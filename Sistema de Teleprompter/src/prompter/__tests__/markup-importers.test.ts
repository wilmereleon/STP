import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { estimateSeconds, formatDuration, tokenize, wordCount } from '../markup';
import { exportJson, exportTxt, parseRunOrderJson, parseScriptText } from '../importers';

const repoRoot = resolve(__dirname, '../../../..');

describe('markup', () => {
  it('separa negrita, cursiva, subrayado e instrucciones', () => {
    const tokens = tokenize('Hola **mundo** y *tú* __aquí__ ((MIRAR CÁMARA)) fin');
    expect(tokens.map((t) => t.kind)).toEqual([
      'text',
      'bold',
      'text',
      'italic',
      'text',
      'underline',
      'text',
      'instruction',
      'text',
    ]);
    expect(tokens[7].value).toBe('MIRAR CÁMARA');
  });

  it('no cuenta las instrucciones en palabras ni duración', () => {
    expect(wordCount('uno dos ((no cuenta esto)) tres')).toBe(3);
    expect(estimateSeconds('palabra '.repeat(180), 180)).toBe(60);
  });

  it('formatea duraciones como hh:mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00:00');
    expect(formatDuration(3725)).toBe('01:02:05');
  });
});

describe('importación de .txt estructurado', () => {
  it('lee Prompt/prueba.txt con sus historias y sluglines', () => {
    const content = readFileSync(resolve(repoRoot, 'Prompt/prueba.txt'), 'utf8');
    const ro = parseScriptText(content, 'prueba.txt');
    expect(ro.name).toBe('prueba');
    expect(ro.stories.map((s) => [s.number, s.slug])).toEqual([
      ['1', 'ENTRADA'],
      ['2', 'TITULARES'],
      ['3', 'FECHA FÚTBOL 14'],
    ]);
    expect(ro.stories[0].text.startsWith('BUENAS TARDES')).toBe(true);
    expect(ro.stories[1].text).toContain('((TITU1))');
  });

  it('acepta texto en la misma línea del encabezado y CRLF', () => {
    const ro = parseScriptText('[1] {INTRO} Primera línea\r\nsegunda\r\n\r\n[2] Sin título\r\n', 'x.txt');
    expect(ro.stories[0]).toMatchObject({ slug: 'INTRO', text: 'Primera línea\nsegunda' });
    expect(ro.stories[1]).toMatchObject({ number: '2', slug: 'HISTORIA 2', text: 'Sin título' });
  });

  it('un .txt sin encabezados se carga como una sola historia', () => {
    const ro = parseScriptText('Texto libre\n\nOtro párrafo', 'Noticias.txt');
    expect(ro.stories).toHaveLength(1);
    expect(ro.stories[0].slug).toBe('NOTICIAS');
  });

  it('lee los guiones de ejemplo de test-scripts', () => {
    const content = readFileSync(resolve(repoRoot, 'Sistema de Teleprompter/test-scripts/Script_01_Noticias_Matutinas.txt'), 'utf8');
    const ro = parseScriptText(content, 'Script_01.txt');
    expect(ro.stories).toHaveLength(5);
    expect(ro.stories[4].slug).toBe('CIERRE Y DESPEDIDA');
  });
});

describe('ida y vuelta de formatos', () => {
  const ro = parseScriptText('[1] {A}\nTexto a\n\n[2] {B}\nTexto **b**', 'demo.txt');

  it('TXT exportado se vuelve a leer igual', () => {
    const again = parseScriptText(exportTxt(ro), 'demo.txt');
    expect(again.stories.map(({ number, slug, text }) => ({ number, slug, text }))).toEqual(
      ro.stories.map(({ number, slug, text }) => ({ number, slug, text }))
    );
  });

  it('JSON exportado conserva el estado flotado', () => {
    const json = exportJson({ ...ro, stories: [{ ...ro.stories[0], floated: true }, ro.stories[1]] });
    const again = parseRunOrderJson(json, 'demo.json');
    expect(again.name).toBe('demo');
    expect(again.stories[0].floated).toBe(true);
    expect(again.stories[1].text).toBe('Texto **b**');
  });

  it('acepta el formato v2 (title / text)', () => {
    const again = parseRunOrderJson(JSON.stringify([{ title: 'Viejo', text: 'hola' }]), 'old.json');
    expect(again.stories[0]).toMatchObject({ slug: 'Viejo', text: 'hola' });
  });

  it('rechaza JSON inválido con un mensaje claro', () => {
    expect(() => parseRunOrderJson('{nope', 'x.json')).toThrow('no es válido');
    expect(() => parseRunOrderJson('{"a":1}', 'x.json')).toThrow('lista de historias');
  });
});
