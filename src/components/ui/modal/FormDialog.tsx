"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

// Diálogo para formularios cortos. Sus forms usan errorMode="inline":
// los toasts quedarían detrás del top layer del <dialog>
export default function FormDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    // Sin cleanup: en StrictMode un close() dispararía onClose y cerraría el diálogo al abrir
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={ref} className="modal" aria-label={title} onClose={onClose}>
      <div className="modal-box max-w-lg">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            aria-label="Cerrar"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
