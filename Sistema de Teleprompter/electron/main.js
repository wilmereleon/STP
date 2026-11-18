/**
 * Proceso principal de Electron - Teleprompter
 *
 * - Sirve la app desde el protocolo propio app://stp/ (origen estable: rutas con
 *   hash, localStorage y BroadcastChannel funcionan igual que en el navegador).
 * - Las ventanas de salida (#/output) se abren a pantalla completa en el monitor
 *   secundario si existe; la de espejo usa un tercer monitor si lo hay.
 * - Sin limitación en segundo plano: el prompter no se frena si la ventana del
 *   operador queda tapada por la salida.
 */

const { app, BrowserWindow, Menu, net, protocol, screen, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_ORIGIN = 'app://stp';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const DEV_SERVER = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
// En desarrollo se usa el servidor de Vite; STP_USE_DIST=1 fuerza la build de dist/
const useDevServer = !app.isPackaged && process.env.STP_USE_DIST !== '1';
const START_URL = useDevServer ? `${DEV_SERVER}/#/operator` : `${APP_ORIGIN}/index.html#/operator`;
const ICON = path.join(__dirname, '..', 'img', 'pT.png');

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // API y WebSocket del backend opcional (vista de productor)
  "connect-src 'self' http://localhost:3000 ws://localhost:3000 https://api.teleprompter.com wss://api.teleprompter.com",
].join('; ');

// En Windows, Chromium marca como "ocultas" las ventanas que cree tapadas (p. ej. la
// salida en otro monitor) y detiene su animación. Para un prompter eso no es aceptable.
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

let mainWindow = null;

const webPreferences = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  backgroundThrottling: false,
};

function isAppUrl(url) {
  return url.startsWith(`${APP_ORIGIN}/`) || (useDevServer && url.startsWith(DEV_SERVER));
}

function registerAppProtocol() {
  protocol.handle('app', async (request) => {
    const { pathname } = new URL(request.url);
    const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
    const filePath = path.normalize(path.join(DIST_DIR, relative));
    // Impide salir de dist/ con rutas tipo ../../
    if (!filePath.startsWith(DIST_DIR + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }
    const response = await net.fetch(pathToFileURL(filePath).toString());
    if (!filePath.endsWith('.html')) return response;
    const headers = new Headers(response.headers);
    headers.set('Content-Security-Policy', CSP);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(response.body, { status: response.status, headers });
  });
}

/** Elige el monitor para una salida: secundario para la normal, otro para el espejo */
function outputBounds(isMirror) {
  const primary = screen.getPrimaryDisplay();
  const externals = screen.getAllDisplays().filter((d) => d.id !== primary.id);
  const target = isMirror ? externals[1] || externals[0] : externals[0];
  if (!target) return { width: 1280, height: 720, center: true };
  const { x, y, width, height } = target.bounds;
  return { x, y, width, height, fullscreen: true };
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 920,
    minWidth: 1024,
    minHeight: 640,
    icon: ICON,
    title: 'Teleprompter',
    backgroundColor: '#1b1c1f',
    autoHideMenuBar: true,
    show: false,
    webPreferences,
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAppUrl(url) && url.includes('#/output')) {
      const isMirror = url.includes('mirror=');
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          ...outputBounds(isMirror),
          title: isMirror ? 'Salida presentador (espejo)' : 'Salida del prompter',
          show: true,
          icon: ICON,
          backgroundColor: '#000000',
          autoHideMenuBar: true,
          webPreferences,
        },
      };
    }
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Las ventanas de salida tampoco pueden abrir otras ni navegar fuera de la app
  mainWindow.webContents.on('did-create-window', (child) => {
    child.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    child.webContents.on('will-navigate', (event, url) => {
      if (!isAppUrl(url)) event.preventDefault();
    });
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) event.preventDefault();
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`No se pudo cargar ${url}: ${code} ${description}`);
  });

  mainWindow.loadURL(START_URL);
  if (useDevServer) mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Al cerrar el operador se cierran también las salidas
  mainWindow.on('closed', () => {
    mainWindow = null;
    BrowserWindow.getAllWindows().forEach((w) => w.close());
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    // Sin menú en Windows/Linux: evita que F11 (pantalla completa) o Ctrl+R choquen con los atajos
    if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
    registerAppProtocol();
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
