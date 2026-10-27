"use client";

import type { ComponentProps } from "react";
import {
  useController,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import FieldWrapper, { type FieldDirection } from "./FieldWrapper";
import useFieldChange, { type FieldChangeHandler } from "./useFieldChange";

type FieldTextProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<"input">,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur"
> & {
  name: FieldPath<TFieldValues>;
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<string, TFieldValues>;
  hint?: string;
  rules?: RegisterOptions<TFieldValues>;
};

export default function FieldText<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  label,
  direction,
  onChange: onChangeProp,
  hint,
  rules,
  type = "text",
  className = "",
  ...props
}: FieldTextProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController<TFieldValues>({ name, rules });

  const onChange = useFieldChange<string, TFieldValues>(
    field.onChange,
    onChangeProp,
  );

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <input
        autoComplete="off"
        {...props}
        {...field}
        onChange={onChange}
        value={field.value ?? ""}
        type={type}
        aria-invalid={!!error}
        className={`input w-full ${error ? "input-error" : ""} ${className}`}
      />
    </FieldWrapper>
  );
}
