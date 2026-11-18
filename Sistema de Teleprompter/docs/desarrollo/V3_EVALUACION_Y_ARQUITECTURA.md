# Teleprompter v3 — Evaluación y nueva arquitectura del operador

Referencia funcional: *WinPlus-IP Installation and Operation Manual* (carpeta
`Documentos de inspiración operativa/`) y las capturas de `Imágenes de inspiración/`.

## 1. Evaluación de la versión 2

| # | Fallo encontrado | Causa |
|---|---|---|
| 1 | Play no movía el texto en la ventana principal | El auto-scroll solo existía dentro de la ventana emergente (`TeleprompterScreen`). Sin ventana abierta, Play no hacía nada visible. |
| 2 | Anterior / Siguiente no cambiaban el guion | `nextItem()` cambiaba el ítem activo del Run Order pero nunca cargaba su texto en el teleprompter. En la ventana emergente el Run Order estaba vacío (store distinto por ventana). |
| 3 | Al cargar un .txt no se activaba el primer guion | `App` buscaba el id `${Date.now()}-0`, pero el store generaba otro id. |
| 4 | Vista previa y salida desincronizadas | La vista previa aplicaba `scrollPosition * 0.5` (factor empírico) con otro ancho y otra fuente, así que los saltos de línea no coincidían. Con dos salidas abiertas, cada una animaba por su cuenta y peleaban por la posición. |
| 5 | La ventana de salida no funcionaba en el instalador | `BrowserRouter` con `file://` no resuelve rutas y la sincronización dependía de `window.opener`. |
| 6 | Editor con el cursor desalineado | Se escribía sobre un `textarea` invisible superpuesto a un texto renderizado con otro tamaño. Varios botones (color, 1–0, guardar, copiar) no tenían función. |
| 7 | Atajos F1–F12 solo en la ventana emergente | `useMacros` no estaba montado en la vista principal. |
| 8 | Hooks condicionales en `App` | `return` antes de los hooks cuando `?popup=true`, contrario a las reglas de React. |
| 9 | Fin de texto estimado | `40 px por línea` y `viewport = 800` fijos, sin medir el contenido real. |
| 10 | Instalador de 142 MB | `puppeteer` y todas las librerías del frontend estaban en `dependencies` y se empaquetaban en el asar, aunque Vite ya las incluye en el bundle. |

## 2. Arquitectura v3

Diagramas (PlantUML + PNG) en `Diagramas para la refactorización/`:
`06-v3-componentes`, `07-v3-clases`, `08-v3-secuencia-play-sync`.

### Principios

1. **Un único lienzo lógico.** Vista previa y salidas maquetan el texto sobre un lienzo de
   1920 px de ancho (alto según la relación de aspecto) y lo escalan con CSS. Los saltos de
   línea y la posición en px lógicos son idénticos en todas las ventanas
   (equivale a *Script Matches Prompt* de WinPlus).
2. **La posición es una función del tiempo.**
   `y(t) = anchorY + pxPerSec · (t − anchorT)`, limitada a `[minY, maxY]`. Cada ventana la
   calcula en su propio fotograma; solo se envía un mensaje cuando cambia algo (play, pausa,
   velocidad, salto). No hay deriva ni dependencia de recibir 60 mensajes por segundo.
3. **El operador es la fuente de verdad.** Las salidas solo renderizan y reenvían comandos
   (teclado, rueda) por `BroadcastChannel`. Admite varias salidas y reconexión automática.
4. **El Run Order completo sale al prompter**, como en WinPlus: las historias se leen de
   forma continua, con su slugline, y Anterior/Siguiente saltan entre historias.

### Módulo `src/prompter/`

| Archivo | Responsabilidad |
|---|---|
| `types.ts`, `defaults.ts` | Modelo de dominio y valores por defecto (atajos incluidos) |
| `markup.ts` | `**negrita**`, `*cursiva*`, `__subrayado__`, `((instrucción))`; palabras y duración |
| `importers.ts` | .txt `[1] {SLUGLINE}`, .xlsx, .json; exportación .txt/.json |
| `transport.ts` | Cálculos puros: posición, límites, historia al aire, remapeo al cambiar la fuente |
| `store.ts` | Store zustand con persistencia (`localStorage: stp-operator-v3`), migra los datos v2 |
| `bridge.ts` | Protocolo master/salidas sobre `BroadcastChannel('stp-prompter-v3')` |
| `shortcuts.ts` | Resolución de atajos; en campos de texto solo F1–F12 y Ctrl+… |
| `components/PrompterStage.tsx` | Render compartido (vista previa y salidas), marcador, blanking, reloj, espejo |
| `OperatorApp.tsx` / `OutputApp.tsx` | Rutas `#/operator` y `#/output?mirror=h` |

Los archivos v2 sustituidos están en `legacy/operador-v2/` (fuera de la compilación).

### Electron

- Protocolo `app://stp/` (origen estable para rutas, `localStorage` y `BroadcastChannel`),
  con protección contra rutas fuera de `dist/` y Content-Security-Policy.
- Las salidas se abren a pantalla completa en el monitor secundario; la de espejo, en un
  tercer monitor si existe.
- Sin limitación en segundo plano ni detección de oclusión: la salida no se congela cuando
  Windows la considera tapada.
- Instancia única, sin menú (F11/F12 quedan libres para los atajos), navegación externa bloqueada.

## 3. Funciones respecto al manual WinPlus-IP

| WinPlus-IP | v3 |
|---|---|
| Active Run Order con Nº, Estado, Slugline, Tiempo y total | Sí. Estado `AIR` (rojo) al reproducir, `CUE` en pausa, `FLT` flotada |
| Add / Remove / Float / Drop story / Jump to selected / Track live | Sí (botones del Run Order, doble clic, Intro, F6, «Seguir al aire») |
| Reordenar arrastrando | Sí |
| Story Editor: B / I / U, aA, Lock, Find & Replace | Sí (marcado ligero, conserva Ctrl+Z) |
| Run Order Status `*` y EDIT | Asterisco en el título cuando hay cambios sin guardar en archivo |
| Prompter Preview idéntico a la salida | Sí (lienzo lógico común) |
| Cue marker: estilo, color, posición, *Controls Prompt Position* | Sí |
| Márgenes e interlineado | Sí |
| Blanking (Shift+F9) con mensaje | Sí; la vista previa muestra «BLANK» sin ocultar el texto |
| Reloj en la salida, 12/24 h | Sí |
| Mostrar/ocultar sluglines e instrucciones | Sí |
| Atajos configurables y ventana de atajos | Sí (Ajustes → Atajos; botón de teclado) |
| Status bar con mensajes de 5 s | Sí, además de historia al aire, progreso, tiempo restante y salidas |
| Export/Import de ajustes | Sí |
| Importar .txt / .xlsx | Sí. No se importan .doc/.docx/.rtf/.pdf |
| Timer, mensajes al presentador, presenters, bookmarks, MOS/iNews, redundancia, controladores hardware | No incluidos en esta versión |

## 4. Verificación

```bash
npm test                 # 25 pruebas unitarias (vitest): markup, importadores, transporte, store
npm run build
npm run test:e2e         # 18 comprobaciones en Chrome: operador + salida + espejo
npm run electron:build:win
node scripts/e2e-electron.mjs   # app empaquetada: app://, Play, salida sincronizada
```

Las capturas de la prueba E2E quedan en `test-scripts/results/e2e/`.
