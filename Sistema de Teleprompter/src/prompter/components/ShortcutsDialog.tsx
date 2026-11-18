import { COMMAND_LABELS } from '../defaults';
import { formatKey } from '../shortcuts';
import { useOperatorStore } from '../store';
import type { Command } from '../types';
import { Modal } from './Modal';

const FIXED: [string, string][] = [
  ['Ctrl + O', 'Abrir Run Order (.txt, .xlsx, .json)'],
  ['Ctrl + S', 'Guardar Run Order (.json)'],
  ['Ctrl + F', 'Buscar y reemplazar (en el editor)'],
  ['Ctrl + B / I / U', 'Negrita / cursiva / subrayado (en el editor)'],
  ['Rueda', 'Desplazar el texto (vista previa y salidas)'],
  ['Shift + rueda', 'Velocidad'],
  ['Ctrl + rueda', 'Tamaño de fuente'],
  ['Doble clic en el Run Order', 'Saltar a la historia'],
  ['F (en la salida)', 'Pantalla completa'],
];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const keys = useOperatorStore((s) => s.settings.keys);
  return (
    <Modal title="Atajos de teclado" onClose={onClose}>
      <table className="op-keys">
        <tbody>
          {(Object.keys(COMMAND_LABELS) as Command[]).map((cmd) => (
            <tr key={cmd}>
              <td>
                {keys[cmd].map((k) => (
                  <kbd key={k} className="op-kbd">
                    {formatKey(k)}
                  </kbd>
                ))}
              </td>
              <td>{COMMAND_LABELS[cmd]}</td>
            </tr>
          ))}
          {FIXED.map(([k, label]) => (
            <tr key={k}>
              <td>
                <kbd className="op-kbd">{k}</kbd>
              </td>
              <td>{label}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="op-hint">Los atajos también funcionan con el foco en una ventana de salida. Se cambian en Ajustes → Atajos.</p>
    </Modal>
  );
}
