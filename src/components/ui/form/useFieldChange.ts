"use client";

import { useEffect, useRef } from "react";
import {
  useFormContext,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

/**
 * Prop `onChange` de los Field*: se ejecuta cuando el **usuario** cambia el valor
 * (no con setValue desde código), con el valor nuevo y el form para leer/escribir otros campos.
 * Equivale a un @api.onchange de Odoo para un solo campo.
 */
export type FieldChangeHandler<
  TValue = unknown,
  TFieldValues extends FieldValues = FieldValues,
> = (value: TValue, form: UseFormReturn<TFieldValues>) => void;

const isChangeEvent = (arg: unknown): arg is { target: { value: unknown } } =>
  typeof arg === "object" &&
  arg !== null &&
  "nativeEvent" in arg &&
  "target" in arg;

/**
 * Envuelve el `onChange` de useController: primero actualiza el form y después avisa al listener,
 * así `form.getValues()` dentro del listener ya trae el valor nuevo.
 */
export default function useFieldChange<TValue, TFieldValues extends FieldValues>(
  rhfOnChange: (...event: unknown[]) => void,
  listener?: FieldChangeHandler<TValue, TFieldValues>,
) {
  const form = useFormContext<TFieldValues>();
  // Ref para no recrear el handler (y no romper la memoización) si el listener es inline
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });

  return (arg: unknown) => {
    rhfOnChange(arg);
    const value = (isChangeEvent(arg) ? arg.target.value : arg) as TValue;
    listenerRef.current?.(value, form);
  };
}
