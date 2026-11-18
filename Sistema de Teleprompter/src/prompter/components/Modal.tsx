import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

/** Diálogo modal mínimo. Mientras está abierto, los atajos globales quedan en pausa. */
export function Modal({ title, onClose, children, wide = false }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.dataset.modal = '1';
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.body.dataset.keyCapture !== '1') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      delete document.body.dataset.modal;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="op-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        className={`op-modal ${wide ? 'op-modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="op-modal-header">
          <h2>{title}</h2>
          <button className="op-btn op-icon" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </header>
        <div className="op-modal-body">{children}</div>
      </div>
    </div>
  );
}
