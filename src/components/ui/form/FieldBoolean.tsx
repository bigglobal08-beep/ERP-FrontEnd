"use client";

import {
  useController,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import FieldWrapper, { type FieldDirection } from "./FieldWrapper";
import useFieldChange, { type FieldChangeHandler } from "./useFieldChange";

// Clases completas para que Tailwind las detecte al escanear
const variantClasses = {
  checkbox: { base: "checkbox", error: "checkbox-error" },
  toggle: { base: "toggle", error: "toggle-error" },
};

type FieldBooleanProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<boolean, TFieldValues>;
  hint?: string;
  variant?: "checkbox" | "toggle";
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues>;
};

export default function FieldBoolean<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  label,
  direction = "col",
  onChange: onChangeProp,
  hint,
  variant = "checkbox",
  disabled,
  rules,
}: FieldBooleanProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, ...field },
    fieldState: { error },
  } = useController<TFieldValues>({ name, rules, disabled });

  const onChange = useFieldChange<boolean, TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  const isRow = direction === "row";

  const input = (
    <input
      {...field}
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={isRow ? label : undefined}
      className={`${variantClasses[variant].base} ${error ? variantClasses[variant].error : ""}`}
    />
  );

  // row: el label va en la columna izquierda como en los demás Fields; col: junto al checkbox
  return (
    <FieldWrapper
      label={isRow ? label : undefined}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      {isRow ? (
        <div className="flex min-h-10 items-center">{input}</div>
      ) : (
        <label className="label cursor-pointer gap-2">
          {input}
          {label}
        </label>
      )}
    </FieldWrapper>
  );
}
