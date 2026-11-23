"use client";

import { Toaster } from "react-hot-toast";

/**
 * Contenedor global de toasts (react-hot-toast), con colores del tema de daisyUI.
 * Se monta una vez en el layout raíz; los toasts se lanzan con `toast()` / `toast.error()` desde cualquier lado.
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        className: "!bg-base-100 !text-base-content !shadow-lg !rounded-box text-sm",
        duration: 4000,
        error: {
          duration: 5000,
          iconTheme: { primary: "var(--color-error)", secondary: "var(--color-error-content)" },
        },
        success: {
          iconTheme: { primary: "var(--color-success)", secondary: "var(--color-success-content)" },
        },
      }}
    />
  );
}
