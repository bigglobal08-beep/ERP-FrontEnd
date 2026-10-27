"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Intento de salir de la página: `proceed` completa la navegación si el usuario lo confirma
export type LeaveAttempt = (proceed: () => void) => void;

// Navigation API (Chrome/Edge, Firefox y Safari recientes); se tipa lo mínimo que se usa
type NavigateEvent = Event & {
  navigationType: string;
  cancelable: boolean;
  destination: { key: string };
};
type NavigationApi = EventTarget & {
  traverseTo: (key: string) => { finished: Promise<unknown> };
};

/**
 * Bloquea la salida de la página mientras `enabled` sea true:
 * - Recargar / cerrar pestaña / URL escrita: diálogo nativo del navegador (no se puede personalizar)
 * - Clic en enlaces (<a>, <Link>): llama a `onAttempt` para mostrar un diálogo propio
 * - Botón atrás/adelante: igual que los enlaces, si el navegador soporta la Navigation API
 *
 * No cubre `router.push()` llamado desde código: esas navegaciones son intencionales.
 */
export default function useUnsavedChangesGuard(
  enabled: boolean,
  onAttempt: LeaveAttempt,
) {
  const router = useRouter();
  // Se activa al confirmar la salida para que los propios listeners no la vuelvan a bloquear
  const bypassRef = useRef(false);
  const onAttemptRef = useRef(onAttempt);

  useEffect(() => {
    onAttemptRef.current = onAttempt;
  });

  useEffect(() => {
    if (!enabled) return;
    bypassRef.current = false;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypassRef.current) return;
      e.preventDefault();
      // Requerido por algunos navegadores para mostrar el diálogo
      e.returnValue = "";
    };

    // Fase de captura en document: corre antes que el onClick de <Link> (React escucha en el root)
    const handleClick = (e: MouseEvent) => {
      if (bypassRef.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nueva pestaña/ventana

      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      // Anclas dentro de la misma página (#seccion) no salen del formulario
      if (
        url.origin === current.origin &&
        url.pathname === current.pathname &&
        url.search === current.search
      )
        return;

      e.preventDefault();
      e.stopPropagation();

      onAttemptRef.current(() => {
        bypassRef.current = true;
        if (url.origin === current.origin) {
          router.push(url.pathname + url.search + url.hash);
        } else {
          window.location.assign(url.href);
        }
      });
    };

    const navigation = (window as Window & { navigation?: NavigationApi })
      .navigation;

    const handleNavigate = (event: Event) => {
      const e = event as NavigateEvent;
      if (bypassRef.current || e.navigationType !== "traverse" || !e.cancelable)
        return;

      e.preventDefault();
      const key = e.destination.key;

      onAttemptRef.current(() => {
        bypassRef.current = true;
        navigation
          ?.traverseTo(key)
          .finished.catch(() => {})
          .finally(() => {
            bypassRef.current = false;
          });
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    navigation?.addEventListener("navigate", handleNavigate);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      navigation?.removeEventListener("navigate", handleNavigate);
    };
  }, [enabled, router]);
}
