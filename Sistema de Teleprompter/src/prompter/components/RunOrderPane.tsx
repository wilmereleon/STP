import {
  ArrowDownToLine,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eye,
  EyeOff,
  ListOrdered,
  LocateFixed,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { estimateSeconds, formatDuration } from '../markup';
import { useOperatorStore } from '../store';

export function RunOrderPane() {
  const runOrder = useOperatorStore((s) => s.runOrder);
  const dirty = useOperatorStore((s) => s.dirty);
  const selectedId = useOperatorStore((s) => s.selectedId);
  const liveId = useOperatorStore((s) => s.liveId);
  const playing = useOperatorStore((s) => s.transport.playing);
  const followLive = useOperatorStore((s) => s.followLive);
  const wpm = useOperatorStore((s) => s.settings.wordsPerMinute);
  const actions = useOperatorStore.getState();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const durations = useMemo(
    () => runOrder.stories.map((s) => estimateSeconds(s.text, wpm)),
    [runOrder.stories, wpm]
  );
  const total = durations.reduce((sum, d, i) => sum + (runOrder.stories[i].floated ? 0 : d), 0);

  const selectedIndex = runOrder.stories.findIndex((s) => s.id === selectedId);
  const selected = runOrder.stories[selectedIndex];

  // Mantener visible la historia al aire mientras se sigue la lectura
  useEffect(() => {
    if (!followLive || !liveId) return;
    listRef.current?.querySelector(`[data-row="${liveId}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [followLive, liveId]);

  const handleDelete = () => {
    if (!selected) return;
    if (selected.text.trim() && !window.confirm(`¿Eliminar la historia "${selected.slug}"?`)) return;
    actions.deleteStories([selected.id]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === -1) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const next = runOrder.stories[selectedIndex + (e.key === 'ArrowDown' ? 1 : -1)];
      if (next) actions.select(next.id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      actions.gotoStory(runOrder.stories[selectedIndex].id);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      handleDelete();
    }
  };

  return (
    <section className="op-pane op-runorder" aria-label="Run Order">
      <header className="op-pane-title">
        {editingName ? (
          <input
            className="op-input op-name-input"
            autoFocus
            defaultValue={runOrder.name}
            onBlur={(e) => {
              actions.renameRunOrder(e.target.value);
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditingName(false);
            }}
          />
        ) : (
          <h2 onDoubleClick={() => setEditingName(true)} title="Doble clic para renombrar">
            Active Run Order: {dirty ? '*' : ''}
            {runOrder.name}
          </h2>
        )}
      </header>

      <div className="op-pane-toolbar">
        <button className="op-btn op-icon" onClick={() => actions.addStory(selectedId)} title="Añadir historia después de la seleccionada">
          <Plus size={16} />
        </button>
        <button className="op-btn op-icon" onClick={handleDelete} disabled={!selected} title="Eliminar historia (Supr)">
          <Trash2 size={16} />
        </button>
        <button
          className="op-btn op-icon"
          onClick={() => selected && actions.toggleFloat(selected.id)}
          disabled={!selected}
          title={selected?.floated ? 'Restaurar en la salida' : 'Flotar: quitar de la salida sin borrar (FLT)'}
        >
          {selected?.floated ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          className="op-btn op-icon"
          onClick={() => selected && actions.dropStory(selected.id)}
          disabled={!selected}
          title="Enviar al final del Run Order"
        >
          <ArrowDownToLine size={16} />
        </button>
        <button
          className="op-btn op-icon"
          onClick={() => actions.moveStory(selectedIndex, selectedIndex - 1)}
          disabled={selectedIndex <= 0}
          title="Subir"
        >
          <ChevronUp size={16} />
        </button>
        <button
          className="op-btn op-icon"
          onClick={() => actions.moveStory(selectedIndex, selectedIndex + 1)}
          disabled={selectedIndex === -1 || selectedIndex >= runOrder.stories.length - 1}
          title="Bajar"
        >
          <ChevronDown size={16} />
        </button>
        <button className="op-btn op-icon" onClick={actions.renumber} title="Renumerar 1…n">
          <ListOrdered size={16} />
        </button>
        <span className="op-spacer" />
        <button
          className="op-btn op-icon"
          onClick={() => selected && actions.gotoStory(selected.id)}
          disabled={!selected}
          title="Saltar a la historia seleccionada (Intro / F6)"
        >
          <Crosshair size={16} />
        </button>
        <button
          className={`op-btn op-icon ${followLive ? 'is-active' : ''}`}
          onClick={() => actions.setFollowLive(!followLive)}
          aria-pressed={followLive}
          title="Seguir la historia al aire (selección y editor)"
        >
          <LocateFixed size={16} />
        </button>
      </div>

      <div className="op-table-head" role="row">
        <span>Nº</span>
        <span>Estado</span>
        <span>Slugline</span>
        <span className="op-right-align">Tiempo</span>
      </div>

      <div className="op-table" ref={listRef} role="listbox" tabIndex={0} onKeyDown={handleKeyDown}>
        {runOrder.stories.map((story, index) => {
          const isLive = story.id === liveId && !story.floated;
          const status = story.floated ? 'FLT' : isLive ? (playing ? 'AIR' : 'CUE') : '';
          const classes = [
            'op-row',
            story.id === selectedId ? 'is-selected' : '',
            isLive ? (playing ? 'is-air' : 'is-cue') : '',
            story.floated ? 'is-floated' : '',
            overIndex === index && dragIndex !== null && dragIndex !== index ? 'is-drop-target' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={story.id}
              data-row={story.id}
              role="option"
              aria-selected={story.id === selectedId}
              className={classes}
              draggable
              onClick={() => actions.select(story.id)}
              onDoubleClick={() => actions.gotoStory(story.id)}
              onDragStart={(e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', story.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) actions.moveStory(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              title="Clic: editar · Doble clic: saltar al prompter · Arrastrar: reordenar"
            >
              <span className="op-cell-num">{story.number || index + 1}</span>
              <span className="op-cell-status">{status}</span>
              <span className="op-cell-slug">{story.slug || '(sin slugline)'}</span>
              <span className="op-cell-time">{formatDuration(durations[index])}</span>
            </div>
          );
        })}
        {runOrder.stories.length === 0 && (
          <div className="op-empty">
            Run Order vacío. Use <Plus size={12} /> o abra un archivo .txt / .xlsx.
          </div>
        )}
      </div>

      <footer className="op-pane-footer">
        <span>{runOrder.stories.length} historias</span>
        <span>Total: {formatDuration(total)}</span>
      </footer>
    </section>
  );
}
