"use client";

import StateMessage from "@/components/ui/StateMessage";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StateMessage variant="error" message="No se pudo cargar esta pantalla.">
      <button type="button" className="btn btn-neutral btn-sm" onClick={reset}>
        Reintentar
      </button>
    </StateMessage>
  );
}
