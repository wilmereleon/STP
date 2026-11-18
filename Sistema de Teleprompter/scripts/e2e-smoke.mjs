/**
 * Prueba de humo E2E del teleprompter (operador + ventana de salida).
 *
 *   npm run build && npm run test:e2e
 *
 * Levanta `vite preview`, abre el operador en Chrome (puppeteer), carga
 * Prompt/prueba.txt y verifica reproducción, sincronización con la salida,
 * saltos entre historias, control desde la salida, blanking, edición en vivo
 * y persistencia. Guarda capturas en test-scripts/results/e2e/.
 */

import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { preview } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '..');
const sample = resolve(project, '../Prompt/prueba.txt');
const shots = resolve(project, 'test-scripts/results/e2e');
mkdirSync(shots, { recursive: true });

const PORT = 4179;
const BASE = `http://localhost:${PORT}/`;
const results = [];
const errors = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Lee la posición (px lógicos) aplicada al contenido del prompter */
const readY = (page) =>
  page.$eval('.pt-content', (el) => {
    const m = /translate3d\(0(?:px)?, (-?[\d.]+)px/.exec(el.style.transform);
    return m ? -Number(m[1]) : Number.NaN;
  });

const server = await preview({ root: project, preview: { port: PORT, strictPort: true }, logLevel: 'silent' });
const browser = await puppeteer.launch({ headless: 'new', args: ['--window-size=1600,1000'] });

try {
  const op = await browser.newPage();
  await op.setViewport({ width: 1600, height: 950 });
  op.on('pageerror', (e) => errors.push(`operador: ${e.message}`));
  op.on('console', (m) => m.type() === 'error' && errors.push(`operador console: ${m.text()}`));

  await op.goto(`${BASE}#/operator`, { waitUntil: 'networkidle0' });
  await op.waitForSelector('.op-app');
  check('La vista del operador carga', true);

  // Cargar prueba.txt
  const input = await op.$('input[data-testid="file-input"]');
  await input.uploadFile(sample);
  await op.waitForFunction(() => document.querySelectorAll('.op-row').length === 3, { timeout: 5000 });
  const slugs = await op.$$eval('.op-cell-slug', (els) => els.map((e) => e.textContent));
  check('Abre prueba.txt con 3 historias', slugs.join('|') === 'ENTRADA|TITULARES|FECHA FÚTBOL 14', slugs.join(' | '));

  const y0 = await readY(op);
  await op.click('.op-play');
  await sleep(1500);
  const y1 = await readY(op);
  const isLive = await op.$eval('.op-prompting', (el) => el.classList.contains('is-live'));
  check('Play desplaza la vista previa', y1 > y0 + 20 && isLive, `y ${y0.toFixed(0)} → ${y1.toFixed(0)}`);

  // Abrir salida
  const targetPromise = browser.waitForTarget((t) => t.url().includes('#/output'), { timeout: 5000 });
  await op.evaluate(() => [...document.querySelectorAll('.op-btn')].find((b) => b.textContent?.includes('Salida'))?.click());
  const out = await (await targetPromise).page();
  out.on('pageerror', (e) => errors.push(`salida: ${e.message}`));
  out.on('console', (m) => m.type() === 'error' && errors.push(`salida console: ${m.text()}`));
  await out.setViewport({ width: 1280, height: 720 });
  await out.waitForSelector('.pt-content', { timeout: 5000 });
  await sleep(400);
  const [ya, yb] = await Promise.all([readY(op), readY(out)]);
  check('La salida muestra el mismo punto que la vista previa', Math.abs(ya - yb) < 25, `preview ${ya.toFixed(0)} / salida ${yb.toFixed(0)}`);
  const outCount = await op.$eval('.op-statusbar', (el) => el.textContent ?? '');
  check('El operador ve la salida conectada', /Salidas: 1/.test(outCount));

  // Saltar a la historia siguiente
  await op.bringToFront();
  await op.keyboard.press('PageDown');
  await sleep(300);
  const live = await op.$eval('.op-row.is-air .op-cell-slug', (el) => el.textContent).catch(() => '');
  check('AvPág salta a la historia siguiente (AIR en el Run Order)', live === 'TITULARES', live);
  await sleep(200);
  const [yc, yd] = await Promise.all([readY(op), readY(out)]);
  check('La salida sigue el salto', Math.abs(yc - yd) < 25, `preview ${yc.toFixed(0)} / salida ${yd.toFixed(0)}`);

  // Velocidad desde el teclado
  const speedBefore = await op.$eval('#op-speed', (el) => Number(el.value));
  await op.keyboard.press('ArrowUp');
  await op.keyboard.press('ArrowUp');
  const speedAfter = await op.$eval('#op-speed', (el) => Number(el.value));
  check('↑ aumenta la velocidad', speedAfter === speedBefore + 1, `${speedBefore} → ${speedAfter}`);

  // Pausa desde la ventana de salida
  await out.bringToFront();
  await out.keyboard.press('Space');
  await sleep(300);
  const playingAfter = await op.$eval('.op-play', (el) => el.classList.contains('is-playing'));
  check('Espacio en la salida pausa el operador', playingAfter === false);
  const [ye, yf] = await Promise.all([readY(op), readY(out)]);
  await sleep(600);
  const [yg, yh] = await Promise.all([readY(op), readY(out)]);
  check('En pausa no hay deriva', Math.abs(ye - yg) < 0.5 && Math.abs(yf - yh) < 0.5 && Math.abs(yg - yh) < 25);

  // Blanking
  await op.bringToFront();
  await op.keyboard.press('KeyB');
  await sleep(250);
  const blankOut = await out.$eval('.pt-content', (el) => getComputedStyle(el).visibility).catch(() => '');
  const blankPreview = await op.$('.pt-blank-preview');
  check('Blanking oculta el texto en la salida y lo marca en la vista previa', blankOut === 'hidden' && !!blankPreview);
  await op.keyboard.press('KeyB');

  // Edición en vivo
  await op.click('.op-row:nth-child(3)');
  await op.waitForSelector('.op-textarea');
  await op.click('.op-textarea');
  await op.keyboard.press('End');
  await op.keyboard.type(' PALABRAEDITADA');
  await sleep(400);
  const outHasEdit = await out.$eval('.pt-content', (el) => el.textContent?.includes('PALABRAEDITADA'));
  check('Lo escrito en el editor aparece en la salida', !!outHasEdit);
  const typingMoved = await op.$eval('.op-play', (el) => el.classList.contains('is-playing'));
  check('Escribir un espacio en el editor no activa Play', typingMoved === false);

  // Flotar historia
  await op.click('.op-row:nth-child(2)');
  await op.evaluate(() => document.querySelector('button[title^="Flotar"]')?.click());
  await sleep(300);
  const outSlugs = await out.$$eval('.pt-slug', (els) => els.map((e) => e.textContent));
  check('Una historia flotada (FLT) desaparece de la salida', outSlugs.length === 2 && !outSlugs.some((s) => s?.includes('TITULARES')), outSlugs.join(' | '));

  await op.screenshot({ path: resolve(shots, 'operador.png') });
  await out.screenshot({ path: resolve(shots, 'salida.png') });

  // Persistencia
  await op.reload({ waitUntil: 'networkidle0' });
  await op.waitForSelector('.op-row');
  const rowsAfterReload = await op.$$eval('.op-row', (els) => els.length);
  const floatedAfterReload = await op.$$eval('.op-row.is-floated', (els) => els.length);
  check('El Run Order persiste al recargar', rowsAfterReload === 3 && floatedAfterReload === 1);
  await sleep(1500);
  const reconnected = await op.$eval('.op-statusbar', (el) => /Salidas: 1/.test(el.textContent ?? ''));
  check('La salida se reconecta tras recargar el operador', reconnected);

  // Espejo
  const mirrorTarget = browser.waitForTarget((t) => t.url().includes('mirror=h'), { timeout: 5000 });
  await op.evaluate(() => [...document.querySelectorAll('.op-btn')].find((b) => b.textContent?.includes('Espejo'))?.click());
  const mirrorPage = await (await mirrorTarget).page();
  await mirrorPage.waitForSelector('.pt-mirror', { timeout: 5000 });
  const mirrorTransform = await mirrorPage.$eval('.pt-mirror', (el) => el.style.transform);
  check('La salida de presentador está espejada', mirrorTransform.includes('scaleX(-1)'), mirrorTransform);
} catch (err) {
  check('Ejecución sin excepciones', false, err instanceof Error ? err.stack : String(err));
} finally {
  check('Sin errores en consola', errors.length === 0, errors.join(' || '));
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
process.exit(failed.length ? 1 : 0);
