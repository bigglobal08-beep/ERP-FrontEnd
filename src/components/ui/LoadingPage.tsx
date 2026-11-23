// Mismos tres puntos de la pantalla de carga global, para los fallback de <Suspense>
export default function LoadingPage({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-4" role="status">
      <p className="font-semibold">{message}</p>
      <div className="flex gap-3" aria-hidden="true">
        <span className="animate-blink bg-error size-3 rounded-full" />
        <span className="animate-blink bg-error size-3 rounded-full [animation-delay:0.2s]" />
        <span className="animate-blink bg-error size-3 rounded-full [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
