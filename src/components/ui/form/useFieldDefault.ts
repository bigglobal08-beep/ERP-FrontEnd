"use client";

import { useEffect } from "react";
import {
  get,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from "react-hook-form";

/**
 * Registra el valor inicial propio de un Field (0, [], null…) como su valor por defecto
 * cuando el form no define uno en `defaultValues`.
 * Sin esto, `useController({ defaultValue })` deja el form como "con cambios" (isDirty)
 * desde el inicio, porque compara ese valor contra `undefined`.
 */
export default function useFieldDefault<TFieldValues extends FieldValues>(
  name: FieldPath<TFieldValues>,
  fallback: PathValue<TFieldValues, FieldPath<TFieldValues>>,
) {
  const { resetField, formState } = useFormContext<TFieldValues>();
  const defaultValues = formState.defaultValues;

  useEffect(() => {
    if (get(defaultValues, name) === undefined) {
      resetField(name, { defaultValue: fallback });
    }
  }, [name, fallback, defaultValues, resetField]);
}
