/**
 * Vista del operador (ventana principal).
 *
 * Layout estilo WinPlus-IP:  Run Order | Story Editor | Prompter Preview
 * con barra de transporte arriba y barra de estado abajo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { startMasterBridge } from './bridge';
import { PreviewPane } from './components/PreviewPane';
import { RunOrderPane } from './components/RunOrderPane';
import { SettingsDialog } from './components/SettingsDialog';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { StatusBar } from './components/StatusBar';
import { StoryEditorPane } from './components/StoryEditorPane';
import { Toolbar } from './components/Toolbar';
import { downloadFile, exportJson, exportTxt, importFile, safeFileName } from './importers';
import { resolveCommand } from './shortcuts';
import { useOperatorStore } from './store';
import './prompter.css';

/** Frecuencia del ciclo de control (detección de fin e historia al aire) */
const TICK_MS = 50;

export function OperatorApp() {
  const name = useOperatorStore((s) => s.runOrder.name);
  const dirty = useOperatorStore((s) => s.dirty);
  const [dialog, setDialog] = useState<'settings' | 'shortcuts' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${dirty ? '* ' : ''}${name} — Teleprompter`;
  }, [name, dirty]);

  // Sincronización con las salidas + ciclo de control.
  // setInterval (no requestAnimationFrame) para que siga activo con la ventana minimizada.
  useEffect(() => {
    const stopBridge = startMasterBridge();
    const id = window.setInterval(() => useOperatorStore.getState().tick(Date.now()), TICK_MS);
    return () => {
      window.clearInterval(id);
      stopBridge();
    };
  }, []);

  const confirmDiscard = () =>
    !useOperatorStore.getState().dirty ||
    window.confirm('El Run Order tiene cambios que no se han guardado en archivo. ¿Continuar?');

  const handleNew = useCallback(() => {
    if (confirmDiscard()) useOperatorStore.getState().newRunOrder();
  }, []);

  const handleOpen = useCallback(() => {
    if (confirmDiscard()) fileRef.current?.click();
  }, []);

  const handleSave = useCallback(() => {
    const { runOrder, markSaved } = useOperatorStore.getState();
    downloadFile(`${safeFileName(runOrder.name)}.stp.json`, exportJson(runOrder), 'application/json');
    markSaved();
  }, []);

  const handleExportTxt = useCallback(() => {
    const { runOrder, flash } = useOperatorStore.getState();
    downloadFile(`${safeFileName(runOrder.name)}.txt`, exportTxt(runOrder), 'text/plain');
    flash('Exportado como .txt');
  }, []);

  const handleFile = async (file: File) => {
    const { loadRunOrder, flash } = useOperatorStore.getState();
    try {
      const runOrder = await importFile(file);
      if (runOrder.stories.length === 0) throw new Error('El archivo no contiene historias');
      loadRunOrder(runOrder);
    } catch (err) {
      flash(`No se pudo abrir "${file.name}": ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const openOutput = useCallback((mirror: '' | 'h') => {
    const url = `${window.location.pathname}${window.location.search}#/output${mirror ? `?mirror=${mirror}` : ''}`;
    const win = window.open(url, mirror ? 'stp-output-mirror' : 'stp-output', 'popup=yes,width=1280,height=720');
    if (win) win.focus();
    else useOperatorStore.getState().flash('El navegador bloqueó la ventana emergente: permita ventanas emergentes', 'error');
  }, []);

  // Atajos globales
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.body.dataset.modal === '1') return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.code === 'KeyS') {
          e.preventDefault();
          return handleSave();
        }
        if (e.code === 'KeyO') {
          e.preventDefault();
          return handleOpen();
        }
      }
      const state = useOperatorStore.getState();
      const cmd = resolveCommand(e, state.settings.keys);
      if (!cmd) return;
      e.preventDefault();
      state.runCommand(cmd);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleOpen, handleSave]);

  return (
    <div className="op-app">
      <Toolbar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onExportTxt={handleExportTxt}
        onOpenOutput={openOutput}
        onSettings={() => setDialog('settings')}
        onShortcuts={() => setDialog('shortcuts')}
      />
      <main className="op-main">
        <RunOrderPane />
        <StoryEditorPane />
        <PreviewPane />
      </main>
      <StatusBar />

      <input
        ref={fileRef}
        type="file"
        accept=".txt,.xlsx,.xls,.json,.stp"
        hidden
        data-testid="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {dialog === 'settings' && <SettingsDialog onClose={() => setDialog(null)} />}
      {dialog === 'shortcuts' && <ShortcutsDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
