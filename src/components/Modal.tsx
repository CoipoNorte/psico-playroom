import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: ReactNode;
}

/**
 * Diálogo basado en <dialog> nativo: el navegador se encarga de atrapar el foco,
 * cerrar con Escape y devolver el foco al control que lo abrió.
 */
export function Modal({ open, onClose, title, subtitle, wide = false, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto max-h-[94dvh] w-[calc(100vw-1rem)] overflow-hidden ${wide ? "max-w-4xl" : "max-w-xl"} rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl`}
    >
      {open && (
        <div className="flex max-h-[94dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-xl font-extrabold leading-tight">
                {title}
              </h2>
              {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Cerrar ${title.toLowerCase()}`}
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-soft text-ink hover:border-primary"
            >
              <Icon name="close" />
            </button>
          </header>
          <div className="overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
