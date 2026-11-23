"use client";

import {
  CircleCheck,
  CircleHelp,
  CircleX,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  resolveModal,
  subscribe,
  type ModalRequest,
  type ModalVariant,
} from "./modal";

// Clases completas para que Tailwind las detecte al escanear
const variants: Record<
  ModalVariant,
  { icon: LucideIcon; title: string; iconClass: string; buttonClass: string }
> = {
  info: { icon: Info, title: "Aviso", iconClass: "bg-info/15 text-info", buttonClass: "btn-primary" },
  success: { icon: CircleCheck, title: "¡Listo!", iconClass: "bg-success/15 text-success", buttonClass: "btn-success" },
  warning: { icon: TriangleAlert, title: "Atención", iconClass: "bg-warning/15 text-warning", buttonClass: "btn-warning" },
  error: { icon: CircleX, title: "Error", iconClass: "bg-error/15 text-error", buttonClass: "btn-error" },
  confirm: { icon: CircleHelp, title: "Confirmar", iconClass: "bg-primary/15 text-primary", buttonClass: "btn-primary" },
};

// Círculo que se dibuja y después la palomita (animaciones `pop` y `draw` en globals.css)
function AnimatedCheck() {
  return (
    <svg
      viewBox="0 0 52 52"
      className="animate-pop size-20"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="26"
        cy="26"
        r="24"
        pathLength={1}
        strokeWidth="2"
        // Rotado -90° para que el trazo empiece arriba, como un reloj
        className="stroke-base-300 animate-draw origin-center -rotate-90 [transform-box:fill-box] [stroke-dasharray:1] [stroke-dashoffset:1]"
      />
      <path
        d="M15 27 l7 7 l15 -15"
        pathLength={1}
        strokeWidth="4"
        className="stroke-success animate-draw [stroke-dasharray:1] [stroke-dashoffset:1] [animation-delay:0.35s]"
      />
    </svg>
  );
}

// Mantiene un <dialog> abierto con showModal() (top layer) mientras `open` sea true
function useDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return ref;
}

// Campo y botones de modalPrompt(); el botón se habilita al cumplir la longitud mínima
function PromptForm({ request }: { request: ModalRequest }) {
  const [value, setValue] = useState("");
  const { label, inputType = "text", minLength = 1, maxLength } = request.prompt ?? {};
  const isPassword = inputType === "password";
  const clean = isPassword ? value : value.trim();
  const isValid = clean.length >= minLength;

  return (
    <form
      method="dialog"
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) resolveModal(request.id, true, clean);
      }}
    >
      <label className="fieldset">
        {label && <span className="fieldset-legend">{label}</span>}
        <input
          type={inputType}
          value={value}
          maxLength={maxLength}
          autoComplete={isPassword ? "new-password" : "off"}
          onChange={(e) => setValue(e.target.value)}
          className="input w-full"
        />
        <span className="label">Mínimo {minLength} caracteres</span>
      </label>
      <div className="modal-action flex-wrap">
        <button
          type="submit"
          disabled={!isValid}
          className={`btn btn-outline btn-sm ${request.danger ? "btn-error" : "btn-primary"}`}
        >
          {request.confirmText ?? "Confirmar"}
        </button>
        <button
          type="button"
          className="btn btn-neutral btn-sm"
          onClick={() => resolveModal(request.id, false)}
        >
          {request.cancelText ?? "Cancelar"}
        </button>
      </div>
    </form>
  );
}

/** Se monta una sola vez en el layout raíz; dibuja los modales pedidos con modalAlert(), etc. */
export default function ModalProvider() {
  const { queue, loadings } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const current = queue[0];
  const isLoading = loadings.length > 0;
  const modalRef = useDialog(!!current);
  // El loading se abre después que el modal para quedar encima en el top layer
  const loadingRef = useDialog(isLoading);

  const variant = current ? variants[current.variant] : null;
  const Icon = variant?.icon;
  const isConfirm = current?.variant === "confirm";
  const confirmClass = current?.danger
    ? "btn-outline btn-error"
    : isConfirm
      ? "btn-outline btn-primary"
      : variant?.buttonClass;
  const closeButton = current && (
    <button
      type="button"
      aria-label="Cerrar"
      className="btn btn-ghost btn-xs btn-square absolute top-3 right-3"
      onClick={() => resolveModal(current.id, false)}
    >
      <X className="size-4" />
    </button>
  );

  return (
    <>
      <dialog
        ref={modalRef}
        className="modal"
        aria-labelledby="app-modal-title"
        // Escape equivale a cancelar
        onCancel={(e) => {
          e.preventDefault();
          if (current) resolveModal(current.id, false);
        }}
      >
        {current && variant && current.variant === "success" && (
          // Éxito: diseño centrado con la palomita animada
          <div
            key={current.id}
            className="modal-box flex max-w-xs flex-col items-center gap-3 text-center"
          >
            <AnimatedCheck />
            <h3 id="app-modal-title" className="text-lg font-semibold">
              {current.title ?? variant.title}
            </h3>
            {current.message && (
              <p className="text-base-content/70 -mt-1 text-sm break-words whitespace-pre-line">
                {current.message}
              </p>
            )}
            <button
              type="button"
              className="btn btn-neutral btn-sm btn-block mt-2"
              onClick={() => resolveModal(current.id, true)}
            >
              {current.confirmText ?? "Aceptar"}
            </button>
          </div>
        )}
        {current && variant && Icon && current.variant !== "success" && (
          <div key={current.id} className="modal-box max-w-md">
            {/* showModal() enfoca lo primero: en confirm es la X, así un Enter accidental
                no ejecuta la acción. En prompt va al final para enfocar el campo */}
            {isConfirm && !current.prompt && closeButton}
            <div className="flex items-start gap-3">
              {!isConfirm && (
                <div className={`shrink-0 rounded-full p-2 ${variant.iconClass}`}>
                  <Icon className="size-5" />
                </div>
              )}
              <div className={`min-w-0 ${isConfirm ? "pr-6" : ""}`}>
                {/* Sin título, la pregunta de la confirmación se vuelve el título */}
                <h3 id="app-modal-title" className="text-lg font-semibold">
                  {current.title ?? (isConfirm ? current.message : variant.title)}
                </h3>
                {(!isConfirm || current.title) && (
                  <p className="text-base-content/70 mt-1 text-sm break-words whitespace-pre-line">
                    {current.message}
                  </p>
                )}
              </div>
            </div>
            {current.prompt ? (
              <PromptForm request={current} />
            ) : (
              <div className="modal-action flex-wrap">
                <button
                  type="button"
                  className={`btn btn-sm ${confirmClass}`}
                  onClick={() => resolveModal(current.id, true)}
                >
                  {current.confirmText ?? (isConfirm ? "Confirmar" : "Aceptar")}
                </button>
                {isConfirm && (
                  <button
                    type="button"
                    className="btn btn-neutral btn-sm"
                    onClick={() => resolveModal(current.id, false)}
                  >
                    {current.cancelText ?? "Cancelar"}
                  </button>
                )}
              </div>
            )}
            {current.prompt && closeButton}
          </div>
        )}
        {/* Clic afuera: cierra los avisos; en confirm no, para evitar cancelar por accidente */}
        <div
          className="modal-backdrop"
          onClick={() => current && !isConfirm && resolveModal(current.id, false)}
        />
      </dialog>

      <dialog
        ref={loadingRef}
        className="modal"
        aria-busy="true"
        aria-label="Cargando"
        // La carga no se puede cerrar con Escape
        onCancel={(e) => e.preventDefault()}
      >
        <div className="bg-base-100 rounded-box flex min-w-64 flex-col items-center gap-5 px-10 py-7 shadow-xl">
          <p className="text-center text-base font-semibold">
            {loadings.at(-1)?.message ?? "Cargando…"}
          </p>
          {/* Tres puntos que tintinean en secuencia (animación `blink` en globals.css) */}
          <div className="flex gap-3" aria-hidden="true">
            <span className="animate-blink bg-error size-3 rounded-full" />
            <span className="animate-blink bg-error size-3 rounded-full [animation-delay:0.2s]" />
            <span className="animate-blink bg-error size-3 rounded-full [animation-delay:0.4s]" />
          </div>
        </div>
      </dialog>
    </>
  );
}
