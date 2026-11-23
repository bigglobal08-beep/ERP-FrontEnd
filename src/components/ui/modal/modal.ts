// API global de modales: se puede llamar desde componentes, hooks o código fuera de React
// (helpers de fetch, interceptores de API). <ModalProvider /> en el layout los dibuja.

export type ModalVariant = "info" | "success" | "warning" | "error" | "confirm";

export type ModalOptions = {
  title?: string;
  // Texto del botón principal ("Aceptar" / "Confirmar")
  confirmText?: string;
  // Solo confirm: texto del botón secundario
  cancelText?: string;
  // Solo confirm: botón principal en rojo para acciones destructivas
  danger?: boolean;
};

export type ModalRequest = ModalOptions & {
  id: number;
  variant: ModalVariant;
  message: string;
  resolve: (confirmed: boolean) => void;
};

export type LoadingRequest = { id: number; message?: string };

type ModalState = {
  // Cola: se muestra un modal a la vez, en el orden en que se pidieron
  queue: ModalRequest[];
  loadings: LoadingRequest[];
};

let state: ModalState = { queue: [], loadings: [] };
let nextId = 1;
const listeners = new Set<() => void>();

function setState(next: ModalState) {
  state = next;
  listeners.forEach((listener) => listener());
}

// --- Para useSyncExternalStore en <ModalProvider /> ---

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSnapshot = () => state;

const emptyState: ModalState = { queue: [], loadings: [] };
export const getServerSnapshot = () => emptyState;

// Cierra el modal actual y resuelve su promesa
export function resolveModal(id: number, confirmed: boolean) {
  const modal = state.queue.find((m) => m.id === id);
  if (!modal) return;
  setState({ ...state, queue: state.queue.filter((m) => m.id !== id) });
  modal.resolve(confirmed);
}

// --- API pública ---

function open(variant: ModalVariant, message: string, options?: ModalOptions) {
  return new Promise<boolean>((resolve) => {
    setState({
      ...state,
      queue: [
        ...state.queue,
        { ...options, id: nextId++, variant, message, resolve },
      ],
    });
  });
}

// Acepta string, Error o cualquier cosa lanzada en un catch
function toMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

/** Aviso informativo. Se resuelve al cerrarlo. */
export const modalAlert = (message: string, options?: ModalOptions) =>
  open("info", message, options).then(() => undefined);

export const modalSuccess = (message: string, options?: ModalOptions) =>
  open("success", message, options).then(() => undefined);

export const modalWarning = (message: string, options?: ModalOptions) =>
  open("warning", message, options).then(() => undefined);

/** Error: recibe un mensaje o directamente lo capturado en un `catch`. */
export const modalError = (error: unknown, options?: ModalOptions) =>
  open("error", toMessage(error), options).then(() => undefined);

/** Confirmación: `true` si acepta, `false` si cancela o cierra. */
export const modalConfirm = (message: string, options?: ModalOptions) =>
  open("confirm", message, options);

/**
 * Pantalla de carga que bloquea la interacción. Devuelve la función para cerrarla.
 * Admite varias a la vez: el overlay sigue visible hasta que se cierran todas.
 */
export function alertLoading(message?: string) {
  const id = nextId++;
  setState({ ...state, loadings: [...state.loadings, { id, message }] });
  return () =>
    setState({ ...state, loadings: state.loadings.filter((l) => l.id !== id) });
}

/** Muestra la carga mientras se resuelve la promesa y la cierra siempre, aunque falle. */
export async function withLoading<T>(
  task: Promise<T> | (() => Promise<T>),
  message?: string,
): Promise<T> {
  const close = alertLoading(message);
  try {
    return await (typeof task === "function" ? task() : task);
  } finally {
    close();
  }
}

export const modal = {
  alert: modalAlert,
  success: modalSuccess,
  warning: modalWarning,
  error: modalError,
  confirm: modalConfirm,
  loading: alertLoading,
  withLoading,
};

/** Para quien prefiera la forma de hook; son las mismas funciones globales. */
export const useModal = () => modal;
