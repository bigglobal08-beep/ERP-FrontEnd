import type { ReactNode } from "react";

// Grano fino sobre el degradado (ruido SVG en data URI, sin archivos extra)
const noise =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Forma y posición de cada mancha; son iguales en todas las paletas
const blobShapes = [
  "-top-1/3 -left-1/4 h-[75%] w-[70%]", // arriba a la izquierda
  "-top-1/4 -right-1/4 h-[55%] w-[55%]", // esquina superior derecha
  "top-[38%] -left-[10%] h-[26%] w-[78%] -rotate-6", // franja en diagonal (la "ola" del centro)
  "top-[24%] -right-[12%] h-[36%] w-[62%] -rotate-[22deg]", // banda que cruza por la derecha
  "-bottom-1/4 left-0 h-1/2 w-full", // abajo
];

// Clases completas (no interpoladas) para que Tailwind las detecte al escanear.
// `blobs` sigue el mismo orden que `blobShapes`
const palettes = {
  // Rojo tomate → coral → salmón/durazno
  red: {
    base: "bg-linear-to-b from-[#e8392f] via-[#f0544a] to-[#ffb4a6]",
    blobs: ["bg-[#dc2f2a]/75", "bg-[#ff8a7a]/70", "bg-[#ffc3b8]/80", "bg-[#ec3b34]/90", "bg-[#ffb09f]/90"],
    grain: "opacity-25",
  },
  // Negro arriba → azul eléctrico → franja de luz amarilla
  night: {
    base: "bg-linear-to-b from-[#05070d] via-[#0b1d4a] to-[#123a8c]",
    // El amarillo va opaco, más grueso y sumado como luz (screen): si el blur lo diluye
    // sobre negro se ve verde oliva en lugar de amarillo
    blobs: ["bg-[#000000]/85", "bg-[#2563eb]/55", "bg-[#ffd60a] mix-blend-screen scale-y-150 blur-2xl", "bg-[#1e40af]/80", "bg-[#0a1a40]/90"],
    grain: "opacity-35",
  },
  // Rojo y negro dominantes, con un toque de amarillo y uno de verde
  gama: {
    base: "bg-linear-to-br from-[#050505] via-[#3a0709] to-[#b5101c]",
    blobs: ["bg-[#000000]/85", "bg-[#e3192b]/75", "bg-[#d20f1f]/70", "bg-[#a50d18]/85", "bg-[#1a0304]/90"],
    grain: "opacity-30",
    // Manchas extra con su propia posición (los "toques" de color). Van sobre las zonas
    // oscuras: con `screen` sobre rojo, el amarillo se vuelve naranja y el verde amarillento
    accents: [
      "top-[16%] left-[4%] h-[16%] w-[30%] -rotate-12 bg-[#ffd400] mix-blend-screen blur-2xl",
      "bottom-[8%] -left-[6%] h-[30%] w-[26%] bg-[#22c55e] mix-blend-screen blur-2xl",
    ],
  },
} satisfies Record<
  string,
  { base: string; blobs: string[]; grain: string; accents?: string[] }
>;

export type GradientVariant = keyof typeof palettes;

type GradientBackgroundProps = {
  variant?: GradientVariant;
  children?: ReactNode;
  className?: string;
};

/**
 * Fondo degradado tipo "mesh": manchas de color difuminadas sobre una base lineal,
 * con una franja en diagonal y grano sutil. El contenido va encima.
 */
export default function GradientBackground({
  variant = "red",
  children,
  className = "",
}: GradientBackgroundProps) {
  const palette = palettes[variant];

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className={`absolute inset-0 ${palette.base}`} />
        {[
          ...blobShapes.map((shape, i) => `${shape} ${palette.blobs[i]}`),
          ...("accents" in palette ? palette.accents : []),
        ].map((classes) => (
          <div
            key={classes}
            // Una mancha puede fijar su propio blur-*; si no, blur-3xl
            className={`absolute rounded-full ${/\bblur-/.test(classes) ? "" : "blur-3xl"} ${classes}`}
          />
        ))}
        <div
          className={`absolute inset-0 mix-blend-soft-light ${palette.grain}`}
          style={{ backgroundImage: noise }}
        />
      </div>
      {children}
    </div>
  );
}
