/**
 * PrompterStage - lienzo del prompter compartido por la vista previa y las salidas.
 *
 * El texto se maqueta siempre sobre un lienzo lógico de STAGE_WIDTH px de ancho
 * y se escala con CSS al tamaño real del contenedor. Por eso la vista previa y
 * cualquier monitor de salida tienen los mismos saltos de línea y la misma
 * posición de scroll (en px lógicos), como "Script Matches Prompt" en WinPlus.
 *
 * La posición se calcula en cada fotograma a partir del Transport (función del
 * tiempo) y se aplica directamente al DOM, sin re-render de React.
 */

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { STAGE_WIDTH } from '../defaults';
import { tokenize } from '../markup';
import { cueY as computeCueY, positionAt, stageHeight } from '../transport';
import type { Layout, PrompterDoc, PrompterSettings, Story, Transport } from '../types';

export type Mirror = '' | 'h' | 'v' | 'hv';

interface PrompterStageProps {
  doc: PrompterDoc;
  transport: Transport;
  mirror?: Mirror;
  /** Solo la ventana principal mide la maquetación */
  onLayout?: (layout: Layout) => void;
  onWheel?: (e: WheelEvent) => void;
  onDoubleClick?: () => void;
  /** En la vista previa el blanking no oculta el texto: lo atenúa */
  previewBlank?: boolean;
  className?: string;
}

function layoutSignature(s: PrompterSettings): string {
  return [
    s.fontFamily,
    s.fontSize,
    s.lineSpacing,
    s.marginLeft,
    s.marginRight,
    s.uppercase,
    s.showSluglines,
    s.showInstructions,
    s.aspect,
    s.cue.offset,
  ].join('|');
}

const StoryBody = memo(function StoryBody({ text, showInstructions }: { text: string; showInstructions: boolean }) {
  const tokens = useMemo(() => tokenize(text), [text]);
  return (
    <div className="pt-body">
      {tokens.map((t, i) => {
        switch (t.kind) {
          case 'bold':
            return <strong key={i}>{t.value}</strong>;
          case 'italic':
            return <em key={i}>{t.value}</em>;
          case 'underline':
            return <u key={i}>{t.value}</u>;
          case 'instruction':
            return showInstructions ? (
              <span key={i} className="pt-instruction">
                {t.value}
              </span>
            ) : null;
          default:
            return <span key={i}>{t.value}</span>;
        }
      })}
      {text.length === 0 && <span className="pt-empty-story"> </span>}
    </div>
  );
});

const StoryList = memo(function StoryList({ stories, settings }: { stories: Story[]; settings: PrompterSettings }) {
  return (
    <>
      {stories.map((story) => (
        <section key={story.id} className="pt-story" data-sid={story.id}>
          {settings.showSluglines && (
            <div className="pt-slug">
              {story.number && <span className="pt-slug-num">{story.number}</span>}
              <span>{story.slug}</span>
            </div>
          )}
          <StoryBody text={story.text} showInstructions={settings.showInstructions} />
        </section>
      ))}
      <div className="pt-end">■ FIN DEL RUN ORDER ■</div>
    </>
  );
});

function useClock(enabled: boolean, h24: boolean): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now.toLocaleTimeString(h24 ? 'es-CO' : 'en-US', { hour12: !h24 });
}

export function PrompterStage({
  doc,
  transport,
  mirror = '',
  onLayout,
  onWheel,
  onDoubleClick,
  previewBlank = false,
  className = '',
}: PrompterStageProps) {
  const { settings, stories } = doc;
  const width = STAGE_WIDTH;
  const height = stageHeight(settings);
  const cue = computeCueY(settings);

  const fitRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const transportRef = useRef(transport);
  transportRef.current = transport;
  const onLayoutRef = useRef(onLayout);
  onLayoutRef.current = onLayout;

  const [fit, setFit] = useState({ scale: 0.2, x: 0, y: 0 });

  // Escalado "contain" del lienzo lógico dentro del contenedor
  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const update = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 || ch === 0) return;
      const scale = Math.min(cw / width, ch / height);
      setFit({ scale, x: (cw - width * scale) / 2, y: (ch - height * scale) / 2 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  // Medición de la maquetación (solo master)
  const signature = layoutSignature(settings);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || !onLayoutRef.current) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const sections = Array.from(content.querySelectorAll<HTMLElement>('section[data-sid]'));
      onLayoutRef.current?.({
        contentHeight: content.offsetHeight,
        viewHeight: height,
        cueY: cue,
        stories: sections.map((el) => ({ id: el.dataset.sid ?? '', top: el.offsetTop, height: el.offsetHeight })),
        signature,
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(content);
    // Las fuentes web pueden cargar después del primer render
    document.fonts?.ready.then(schedule).catch(() => undefined);
    return () => {
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stories, signature, height, cue]);

  // Bucle de animación: aplica la posición calculada al DOM.
  // Con la página oculta el navegador detiene requestAnimationFrame; en ese caso
  // se usa un temporizador para que una salida nunca quede congelada.
  useEffect(() => {
    let raf = 0;
    let timer = 0;
    let stopped = false;
    let lastY = Number.NaN;
    const paint = () => {
      const y = positionAt(transportRef.current, Date.now());
      if (y !== lastY && contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${(-y).toFixed(2)}px, 0)`;
        lastY = y;
      }
    };
    const loop = () => {
      if (stopped) return;
      paint();
      if (document.hidden) timer = window.setTimeout(loop, 33);
      else raf = requestAnimationFrame(loop);
    };
    loop();
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      loop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Rueda del ratón (listener no pasivo para poder cancelar el scroll de la página)
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;
  useEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!onWheelRef.current) return;
      e.preventDefault();
      onWheelRef.current(e);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const clock = useClock(settings.showClock, settings.clock24h);
  const mirrorTransform = [mirror.includes('h') ? 'scaleX(-1)' : '', mirror.includes('v') ? 'scaleY(-1)' : '']
    .filter(Boolean)
    .join(' ');

  const blankHidesText = transport.blank && !previewBlank;

  return (
    <div
      ref={fitRef}
      className={`pt-fit ${className}`}
      style={{ background: settings.backgroundColor }}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="pt-stage"
        style={{
          width,
          height,
          transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
          background: settings.backgroundColor,
        }}
      >
        <div className="pt-mirror" style={{ transform: mirrorTransform || undefined }}>
          <div
            ref={contentRef}
            className="pt-content"
            style={{
              width,
              paddingLeft: `${settings.marginLeft}%`,
              paddingRight: `${settings.marginRight}%`,
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
              lineHeight: settings.lineSpacing,
              color: settings.textColor,
              textTransform: settings.uppercase ? 'uppercase' : 'none',
              visibility: blankHidesText ? 'hidden' : 'visible',
              ['--pt-instruction' as string]: settings.instructionColor,
            }}
          >
            {stories.length > 0 ? (
              <StoryList stories={stories} settings={settings} />
            ) : (
              <div className="pt-end">Sin historias para mostrar</div>
            )}
          </div>

          {settings.cue.visible && !blankHidesText && (
            <div
              className={`pt-cue pt-cue-${settings.cue.style}`}
              style={{
                top: cue,
                color: settings.cue.color,
                height: settings.fontSize * settings.lineSpacing,
                width: settings.cue.style === 'line' ? '100%' : `${Math.max(2, settings.marginLeft - 1)}%`,
              }}
            />
          )}

          {transport.blank && (
            <div className={previewBlank ? 'pt-blank pt-blank-preview' : 'pt-blank'}>
              {previewBlank ? 'BLANK' : settings.blankMessage}
            </div>
          )}

          {settings.showClock && <div className="pt-clock">{clock}</div>}
        </div>
      </div>
    </div>
  );
}
