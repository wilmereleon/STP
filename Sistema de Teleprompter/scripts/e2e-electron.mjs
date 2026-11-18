/**
 * Prueba de humo de la app empaquetada (release/win-unpacked).
 *
 *   npm run electron:build:win && node scripts/e2e-electron.mjs
 *
 * Arranca el .exe con depuración remota, comprueba que el operador carga desde
 * app://, que Play desplaza el texto y que la ventana de salida se abre y
 * se sincroniza.
 */

import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const here = dirname(fileURLToPath(import.meta.url));
const exe = resolve(here, '../release/win-unpacked/Teleprompter Pro.exe');
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const readY = (page) =>
  page.$eval('.pt-content', (el) => -Number(/translate3d\(0(?:px)?, (-?[\d.]+)px/.exec(el.style.transform)?.[1]));

const child = spawn(exe, [`--remote-debugging-port=${PORT}`], { stdio: 'ignore' });
let browser;
try {
  let wsOk = false;
  for (let i = 0; i < 40 && !wsOk; i++) {
    await sleep(500);
    try {
      browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PORT}`, defaultViewport: null });
      wsOk = true;
    } catch {
      /* esperando a que arranque */
    }
  }
  check('La app empaquetada arranca', wsOk);

  const target = await browser.waitForTarget((t) => t.url().includes('#/operator'), { timeout: 10000 });
  const op = await target.page();
  await op.waitForSelector('.op-app', { timeout: 10000 });
  check('El operador carga desde app://', op.url().startsWith('app://stp/'), op.url());

  const y0 = await readY(op);
  await op.click('.op-play');
  await sleep(1200);
  const y1 = await readY(op);
  check('Play desplaza el texto', y1 > y0 + 10, `${y0.toFixed(0)} → ${y1.toFixed(0)}`);

  const outTarget = browser.waitForTarget((t) => t.url().includes('#/output'), { timeout: 8000 });
  await op.evaluate(() => [...document.querySelectorAll('.op-btn')].find((b) => b.title.startsWith('Abrir ventana de salida'))?.click());
  const out = await (await outTarget).page();
  await out.waitForSelector('.pt-content', { timeout: 8000 });
  await sleep(500);
  const [a, b] = await Promise.all([readY(op), readY(out)]);
  check('La ventana de salida se abre y sigue al operador', Math.abs(a - b) < 25, `${a.toFixed(0)} / ${b.toFixed(0)}`);
  const status = await op.$eval('.op-statusbar', (el) => el.textContent ?? '');
  check('El operador registra la salida', /Salidas: 1/.test(status));
  await op.click('.op-play');
} catch (err) {
  check('Sin excepciones', false, err instanceof Error ? err.message : String(err));
} finally {
  await browser?.disconnect();
  child.kill();
}
process.exit(results.every(Boolean) ? 0 : 1);
