"use client";

import { useEffect, useId, useRef } from "react";
import toast from "react-hot-toast";
import {
  useFormState,
  type Control,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";

const MAX_SUMMARY = 5;

// { "email": "Correo inválido", "period.to": "Selecciona la fecha final", ... }
function flattenErrors(errors: FieldErrors, prefix = "", out: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    // Un nodo con `type` es un error de campo; no se recorre (trae `ref`, un elemento del DOM)
    if ("type" in value) {
      if (typeof value.message === "string" && value.message) out[path] = value.message;
    } else {
      flattenErrors(value as FieldErrors, path, out);
    }
  }
  return out;
}

/**
 * Muestra los errores de validación del form en toasts:
 * - Validación en vivo (al salir de un campo): un toast por campo, que se cierra solo al corregirlo.
 * - Al enviar con errores: un solo toast con el resumen, en lugar de uno por campo.
 */
export default function useErrorToasts<TFieldValues extends FieldValues>(
  control: Control<TFieldValues, unknown, unknown>,
  enabled: boolean,
) {
  const { errors, submitCount } = useFormState({ control });
  // Prefijo por form, para que dos formularios en la misma página no compartan ids de toast
  const formId = useId();
  const previous = useRef<Record<string, string>>({});
  const previousSubmitCount = useRef(submitCount);

  // RHF muta `errors`; se compara por contenido serializado y no por referencia
  const errorsKey = JSON.stringify(flattenErrors(errors));

  useEffect(() => {
    if (!enabled) return;

    const current: Record<string, string> = JSON.parse(errorsKey);
    const before = previous.current;
    const submitted = submitCount !== previousSubmitCount.current;
    const fieldToastId = (name: string) => `${formId}:${name}`;
    const summaryId = `${formId}:summary`;

    // Campos corregidos: se cierra su toast
    for (const name of Object.keys(before)) {
      if (!(name in current)) toast.dismiss(fieldToastId(name));
    }

    const messages = Object.values(current);
    if (messages.length === 0) {
      toast.dismiss(summaryId);
    } else if (submitted) {
      // Envío con errores: se reemplazan los toasts individuales por un resumen
      Object.keys(current).forEach((name) => toast.dismiss(fieldToastId(name)));
      toast.error(
        <div>
          <p className="font-semibold">Revisa el formulario</p>
          <ul className="mt-1 list-disc pl-4">
            {messages.slice(0, MAX_SUMMARY).map((message, i) => (
              <li key={i}>{message}</li>
            ))}
            {messages.length > MAX_SUMMARY && (
              <li>y {messages.length - MAX_SUMMARY} más…</li>
            )}
          </ul>
        </div>,
        { id: summaryId, duration: 6000 },
      );
    } else {
      // Validación en vivo: toast solo para los errores nuevos o que cambiaron de mensaje
      for (const [name, message] of Object.entries(current)) {
        if (before[name] !== message) toast.error(message, { id: fieldToastId(name) });
      }
    }

    previous.current = current;
    previousSubmitCount.current = submitCount;
  }, [errorsKey, submitCount, enabled, formId]);
}
