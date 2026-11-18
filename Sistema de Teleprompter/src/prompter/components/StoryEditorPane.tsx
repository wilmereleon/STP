import { Bold, CaseUpper, Italic, Lock, MessageSquareText, Replace, Search, Underline, Unlock, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { estimateSeconds, formatDuration, wordCount } from '../markup';
import { useOperatorStore } from '../store';

const EDITOR_SIZES = [14, 16, 18, 20, 24, 28, 32];

/**
 * Inserta texto en la selección conservando el historial de deshacer del
 * navegador (execCommand('insertText') mantiene Ctrl+Z en Chromium/Electron).
 */
function replaceSelection(el: HTMLTextAreaElement, transform: (selected: string) => string) {
  const { selectionStart: start, selectionEnd: end, value } = el;
  const replacement = transform(value.slice(start, end));
  el.focus();
  const ok = typeof document.execCommand === 'function' && document.execCommand('insertText', false, replacement);
  if (!ok) {
    el.setRangeText(replacement, start, end, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  el.setSelectionRange(start, start + replacement.length);
}

export function StoryEditorPane() {
  const story = useOperatorStore((s) => s.runOrder.stories.find((x) => x.id === s.selectedId) ?? null);
  const locked = useOperatorStore((s) => s.editorLocked);
  const wpm = useOperatorStore((s) => s.settings.wordsPerMinute);
  const isLive = useOperatorStore((s) => s.selectedId !== null && s.selectedId === s.liveId);
  const storyCount = useOperatorStore((s) => s.runOrder.stories.length);
  const { updateStory, setEditorLocked, flash } = useOperatorStore.getState();

  const textRef = useRef<HTMLTextAreaElement>(null);
  const findRef = useRef<HTMLInputElement>(null);
  const [editorSize, setEditorSize] = useState(18);
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  useEffect(() => {
    if (findOpen) findRef.current?.focus();
  }, [findOpen]);

  const wrap = (left: string, right = left) => {
    const el = textRef.current;
    if (!el || locked || !story) return;
    if (el.selectionStart === el.selectionEnd) {
      flash('Seleccione el texto al que quiere aplicar el formato');
      return;
    }
    replaceSelection(el, (sel) => `${left}${sel}${right}`);
  };

  const upper = () => {
    const el = textRef.current;
    if (!el || locked || !story || el.selectionStart === el.selectionEnd) return;
    replaceSelection(el, (sel) => sel.toUpperCase());
  };

  const findNext = () => {
    const el = textRef.current;
    if (!el || !findText) return;
    const haystack = el.value.toLowerCase();
    const needle = findText.toLowerCase();
    let index = haystack.indexOf(needle, el.selectionEnd);
    if (index === -1) index = haystack.indexOf(needle);
    if (index === -1) {
      flash(`No se encontró "${findText}"`, 'error');
      return;
    }
    el.focus();
    el.setSelectionRange(index, index + findText.length);
  };

  const replaceOne = () => {
    const el = textRef.current;
    if (!el || locked || !findText) return;
    const sel = el.value.slice(el.selectionStart, el.selectionEnd);
    if (sel.toLowerCase() === findText.toLowerCase()) replaceSelection(el, () => replaceText);
    findNext();
  };

  const replaceAll = () => {
    if (locked || !findText) return;
    const pattern = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let count = 0;
    for (const s of useOperatorStore.getState().runOrder.stories) {
      const matches = s.text.match(pattern)?.length ?? 0;
      if (matches > 0) {
        count += matches;
        updateStory(s.id, { text: s.text.replace(pattern, () => replaceText) });
      }
    }
    flash(count > 0 ? `${count} reemplazos en el Run Order` : `No se encontró "${findText}"`, count ? 'info' : 'error');
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      wrap('**');
    } else if (key === 'i') {
      e.preventDefault();
      wrap('*');
    } else if (key === 'u') {
      e.preventDefault();
      wrap('__');
    } else if (key === 'f' || key === 'h') {
      e.preventDefault();
      setFindOpen(true);
    }
  };

  if (!story) {
    return (
      <section className="op-pane op-editor" aria-label="Story Editor">
        <header className="op-pane-title">
          <h2>Story Editor</h2>
        </header>
        <div className="op-empty op-empty-large">
          {storyCount ? 'Seleccione una historia del Run Order.' : 'Añada una historia o abra un archivo.'}
        </div>
      </section>
    );
  }

  const words = wordCount(story.text);

  return (
    <section className={`op-pane op-editor ${story.floated ? 'is-floated' : ''}`} aria-label="Story Editor">
      <header className="op-pane-title">
        <h2>
          Story Editor: {story.slug}
          {isLive && <span className="op-badge op-badge-live">AL AIRE</span>}
          {story.floated && <span className="op-badge">FLT</span>}
        </h2>
      </header>

      <div className="op-pane-toolbar">
        <button className="op-btn op-icon" onClick={() => wrap('**')} title="Negrita (Ctrl+B) → **texto**" disabled={locked}>
          <Bold size={16} />
        </button>
        <button className="op-btn op-icon" onClick={() => wrap('*')} title="Cursiva (Ctrl+I) → *texto*" disabled={locked}>
          <Italic size={16} />
        </button>
        <button className="op-btn op-icon" onClick={() => wrap('__')} title="Subrayado (Ctrl+U) → __texto__" disabled={locked}>
          <Underline size={16} />
        </button>
        <button
          className="op-btn op-icon"
          onClick={() => wrap('((', '))')}
          title="Instrucción para el presentador → ((texto)). Se muestra en otro color y no cuenta en la duración"
          disabled={locked}
        >
          <MessageSquareText size={16} />
        </button>
        <button className="op-btn op-icon" onClick={upper} title="Convertir selección a MAYÚSCULAS" disabled={locked}>
          <CaseUpper size={16} />
        </button>
        <button
          className={`op-btn op-icon ${findOpen ? 'is-active' : ''}`}
          onClick={() => setFindOpen(!findOpen)}
          title="Buscar y reemplazar (Ctrl+F)"
        >
          <Search size={16} />
        </button>
        <span className="op-spacer" />
        <select
          className="op-select"
          value={editorSize}
          onChange={(e) => setEditorSize(Number(e.target.value))}
          title="Tamaño del texto en el editor (no afecta a la salida)"
        >
          {EDITOR_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          className={`op-btn op-icon ${locked ? 'is-warning' : ''}`}
          onClick={() => setEditorLocked(!locked)}
          aria-pressed={locked}
          title={locked ? 'Desbloquear edición' : 'Bloquear edición'}
        >
          {locked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>

      {findOpen && (
        <div className="op-find">
          <input
            ref={findRef}
            className="op-input"
            placeholder="Buscar"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') findNext();
              if (e.key === 'Escape') setFindOpen(false);
            }}
          />
          <input
            className="op-input"
            placeholder="Reemplazar por"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            disabled={locked}
          />
          <button className="op-btn" onClick={findNext}>
            <Search size={14} /> Siguiente
          </button>
          <button className="op-btn" onClick={replaceOne} disabled={locked}>
            <Replace size={14} /> Reemplazar
          </button>
          <button className="op-btn" onClick={replaceAll} disabled={locked} title="Reemplaza en todas las historias">
            Todo
          </button>
          <button className="op-btn op-icon" onClick={() => setFindOpen(false)} aria-label="Cerrar búsqueda">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="op-story-fields">
        <label>
          Nº
          <input
            className="op-input op-input-num"
            value={story.number}
            disabled={locked}
            onChange={(e) => updateStory(story.id, { number: e.target.value.slice(0, 8) })}
          />
        </label>
        <label className="op-grow">
          Slugline
          <input
            className="op-input"
            value={story.slug}
            disabled={locked}
            onChange={(e) => updateStory(story.id, { slug: e.target.value })}
          />
        </label>
      </div>

      <textarea
        ref={textRef}
        className="op-textarea"
        value={story.text}
        readOnly={locked}
        spellCheck
        lang="es"
        style={{ fontSize: editorSize }}
        placeholder="Escriba o pegue aquí el texto de la historia…"
        onChange={(e) => updateStory(story.id, { text: e.target.value })}
        onKeyDown={onEditorKeyDown}
      />

      <footer className="op-pane-footer">
        <span>{words} palabras</span>
        <span>{story.text.length} caracteres</span>
        <span>Duración estimada: {formatDuration(estimateSeconds(story.text, wpm))}</span>
        {locked && (
          <span className="op-locked">
            <Lock size={12} /> Bloqueado
          </span>
        )}
      </footer>
    </section>
  );
}
