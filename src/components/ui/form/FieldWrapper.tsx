import { useId, type ReactNode } from "react";
import { useErrorMode } from "./errorMode";

// col: label arriba del control | row: label a la izquierda y control a la derecha
export type FieldDirection = "row" | "col";

type FieldWrapperProps = {
  label?: string;
  hint?: string;
  error?: string;
  direction?: FieldDirection;
  children: ReactNode;
};

export default function FieldWrapper({
  label,
  hint,
  error,
  direction = "col",
  children,
}: FieldWrapperProps) {
  const labelId = useId();
  const errorMode = useErrorMode();
  const isRow = direction === "row";

  return (
    // El label es un <div> y no <legend> porque el legend no participa en el grid del fieldset
    <fieldset
      aria-labelledby={label ? labelId : undefined}
      // min-w-0: el fieldset por defecto no se encoge por debajo de su contenido y se desborda en grids
      className="fieldset @container min-w-0"
    >
      {/* row: 2 columnas solo si el propio campo mide ≥ 24rem (container query);
          en contenedores angostos (móvil, modales, paneles) queda en vertical */}
      <div
        className={`grid gap-1.5 ${isRow ? "@sm:grid-cols-[10rem_minmax(0,1fr)] @sm:items-start @sm:gap-x-4" : ""}`}
      >
        {label ? (
          <div
            id={labelId}
            // En row se centra contra la altura estándar de un input (h-10)
            className={`fieldset-legend ${isRow ? "@sm:min-h-10 @sm:py-0" : ""}`}
          >
            {label}
          </div>
        ) : (
          // Sin label, en row se deja la columna vacía para que el control quede alineado con los demás
          isRow && <div className="hidden @sm:block" />
        )}
        <div className="grid min-w-0 gap-1.5">
          {children}
          {/* En modo toast el mensaje va en el toast; el campo solo conserva su borde rojo */}
          {error && errorMode === "inline" ? (
            <p className="label text-error">{error}</p>
          ) : (
            hint && <p className="label">{hint}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
