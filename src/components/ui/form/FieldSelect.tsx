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

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type FieldSelectProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<"select">,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "children"
> & {
  name: FieldPath<TFieldValues>;
  options: SelectOption[];
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<SelectOption["value"] | null, TFieldValues>;
  hint?: string;
  placeholder?: string;
  rules?: RegisterOptions<TFieldValues>;
};

export default function FieldSelect<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  options,
  label,
  direction,
  onChange: onChangeProp,
  hint,
  placeholder = "Selecciona una opción",
  rules,
  className = "",
  ...props
}: FieldSelectProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, ...field },
    fieldState: { error },
  } = useController<TFieldValues>({ name, rules });

  const onChange = useFieldChange<SelectOption["value"] | null, TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <select
        {...props}
        {...field}
        // El <select> nativo solo maneja strings
        value={value == null ? "" : String(value)}
        // Devuelve el valor original de la opción (respeta number) o null si no hay selección
        onChange={(e) => {
          const option = options.find((o) => String(o.value) === e.target.value);
          onChange(option ? option.value : null);
        }}
        aria-invalid={!!error}
        className={`select w-full ${error ? "select-error" : ""} ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
