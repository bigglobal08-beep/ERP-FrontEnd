import type { ReactNode } from "react";

type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type Breakpoints = {
  // Base (móvil y en adelante)
  xs?: Cols;
  // ≥ 640px
  sm?: Cols;
  // ≥ 768px
  md?: Cols;
  // ≥ 1024px
  lg?: Cols;
  // ≥ 1280px
  xl?: Cols;
};

// Clases completas (no interpoladas) para que Tailwind las detecte al escanear
const gridCols = {
  xs: ["", "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5", "grid-cols-6", "grid-cols-7", "grid-cols-8", "grid-cols-9", "grid-cols-10", "grid-cols-11", "grid-cols-12"],
  sm: ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4", "sm:grid-cols-5", "sm:grid-cols-6", "sm:grid-cols-7", "sm:grid-cols-8", "sm:grid-cols-9", "sm:grid-cols-10", "sm:grid-cols-11", "sm:grid-cols-12"],
  md: ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4", "md:grid-cols-5", "md:grid-cols-6", "md:grid-cols-7", "md:grid-cols-8", "md:grid-cols-9", "md:grid-cols-10", "md:grid-cols-11", "md:grid-cols-12"],
  lg: ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4", "lg:grid-cols-5", "lg:grid-cols-6", "lg:grid-cols-7", "lg:grid-cols-8", "lg:grid-cols-9", "lg:grid-cols-10", "lg:grid-cols-11", "lg:grid-cols-12"],
  xl: ["", "xl:grid-cols-1", "xl:grid-cols-2", "xl:grid-cols-3", "xl:grid-cols-4", "xl:grid-cols-5", "xl:grid-cols-6", "xl:grid-cols-7", "xl:grid-cols-8", "xl:grid-cols-9", "xl:grid-cols-10", "xl:grid-cols-11", "xl:grid-cols-12"],
};

const colSpans = {
  xs: ["", "col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10", "col-span-11", "col-span-12"],
  sm: ["", "sm:col-span-1", "sm:col-span-2", "sm:col-span-3", "sm:col-span-4", "sm:col-span-5", "sm:col-span-6", "sm:col-span-7", "sm:col-span-8", "sm:col-span-9", "sm:col-span-10", "sm:col-span-11", "sm:col-span-12"],
  md: ["", "md:col-span-1", "md:col-span-2", "md:col-span-3", "md:col-span-4", "md:col-span-5", "md:col-span-6", "md:col-span-7", "md:col-span-8", "md:col-span-9", "md:col-span-10", "md:col-span-11", "md:col-span-12"],
  lg: ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4", "lg:col-span-5", "lg:col-span-6", "lg:col-span-7", "lg:col-span-8", "lg:col-span-9", "lg:col-span-10", "lg:col-span-11", "lg:col-span-12"],
  xl: ["", "xl:col-span-1", "xl:col-span-2", "xl:col-span-3", "xl:col-span-4", "xl:col-span-5", "xl:col-span-6", "xl:col-span-7", "xl:col-span-8", "xl:col-span-9", "xl:col-span-10", "xl:col-span-11", "xl:col-span-12"],
};

const breakpoints = ["xs", "sm", "md", "lg", "xl"] as const;

function toClasses(map: typeof gridCols, values: Breakpoints) {
  return breakpoints
    .map((bp) => (values[bp] ? map[bp][values[bp]] : ""))
    .filter(Boolean)
    .join(" ");
}

type FormGroupProps = Breakpoints & {
  // Encabezado opcional del grupo (como <group string="…"> de Odoo)
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Contenedor en grid para Fields. Cada Field ocupa una columna; usa <FormCol> para que ocupe más.
 * Las columnas se definen por breakpoint: xs (base), sm, md, lg y xl. Por defecto 1 columna.
 */
export default function FormGroup({
  xs = 1,
  sm,
  md,
  lg,
  xl,
  title,
  description,
  className = "",
  children,
}: FormGroupProps) {
  const grid = toClasses(gridCols, { xs, sm, md, lg, xl });

  return (
    <section className={className}>
      {(title || description) && (
        <header className="border-base-300 mb-2 border-b pb-1">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && (
            <p className="text-base-content/60 text-sm">{description}</p>
          )}
        </header>
      )}
      <div className={`grid items-start gap-x-4 ${grid}`}>{children}</div>
    </section>
  );
}

type FormColProps = Breakpoints & {
  className?: string;
  children: ReactNode;
};

/** Hace que su contenido ocupe varias columnas del FormGroup (como colspan de Odoo). */
export function FormCol({
  xs,
  sm,
  md,
  lg,
  xl,
  className = "",
  children,
}: FormColProps) {
  const span = toClasses(colSpans, { xs, sm, md, lg, xl });
  return <div className={`min-w-0 ${span} ${className}`}>{children}</div>;
}
