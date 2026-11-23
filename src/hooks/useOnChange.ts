"use client";

import { useEffect, useRef } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export type OnChangeHandler<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
> = (
  values: TFieldValues,
  info: {
    // Campo que disparó el cambio
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  },
) => void | Promise<void>;

/**
 * Equivalente a `@api.onchange("campo1", "campo2")` de Odoo: ejecuta `handler` cuando el
 * **usuario** cambia alguno de los campos indicados, con todos los valores actuales del form.
 *
 * Los cambios hechos con `form.setValue()` (incluidos los del propio handler) no lo disparan,
 * así que un onchange puede actualizar otros campos sin entrar en bucle.
 */
export default function useOnChange<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
>(
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
  fields: FieldPath<TFieldValues>[],
  handler: OnChangeHandler<TFieldValues, TContext, TTransformedValues>,
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  // Clave estable para no resuscribirse si el arreglo se declara inline
  const fieldsKey = fields.join("|");

  useEffect(() => {
    const watched = fieldsKey.split("|");

    const subscription = form.watch((_, { name, type }) => {
      // type === "change" solo cuando viene del usuario; setValue no lo trae
      if (type !== "change" || !name) return;
      // También cubre subcampos: "period" escucha "period.from"
      const matches = watched.some((f) => name === f || name.startsWith(`${f}.`));
      if (!matches) return;

      handlerRef.current(form.getValues(), { name, form });
    });

    return () => subscription.unsubscribe();
  }, [form, fieldsKey]);
}
