"use client";

import {
  useController,
  type FieldPath,
  type FieldValues,
  type PathValue,
  type RegisterOptions,
} from "react-hook-form";
import FieldWrapper, { type FieldDirection } from "./FieldWrapper";
import useFieldChange, { type FieldChangeHandler } from "./useFieldChange";
import useFieldDefault from "./useFieldDefault";
import type { SelectOption } from "./FieldSelect";

type FieldChoiceProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  options: SelectOption[];
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<SelectOption["value"][], TFieldValues>;
  hint?: string;
  // checkbox: casillas clásicas | buttons: grupo de botones (varios activos)
  variant?: "checkbox" | "buttons";
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues>;
};

type ChoiceValue = SelectOption["value"];

export default function FieldChoice<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  options,
  label,
  direction,
  onChange: onChangeProp,
  hint,
  variant = "checkbox",
  orientation = "vertical",
  disabled,
  rules,
}: FieldChoiceProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, onBlur, ref },
    fieldState: { error },
  } = useController<TFieldValues>({
    name,
    rules,
    disabled,
    // Arranca como lista vacía si el form no define un defaultValue
    defaultValue: [] as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  const onChange = useFieldChange<SelectOption["value"][], TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  useFieldDefault(
    name,
    [] as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  );

  const selected: ChoiceValue[] = Array.isArray(value) ? value : [];
  const isHorizontal = orientation === "horizontal";

  // Agrega o quita la opción, manteniendo el orden en que aparecen las opciones
  const toggle = (optionValue: ChoiceValue) => {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];

    onChange(
      options.map((o) => o.value).filter((v) => next.includes(v)),
    );
  };

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <div
        role="group"
        className={
          variant === "buttons"
            ? `join ${isHorizontal ? "" : "join-vertical"}`
            : `flex gap-x-4 gap-y-2 ${isHorizontal ? "min-h-10 flex-row flex-wrap items-center" : "flex-col"}`
        }
      >
        {options.map((option, index) => {
          const inputProps = {
            // Solo el primero recibe el ref para que RHF pueda enfocar el grupo
            ref: index === 0 ? ref : undefined,
            type: "checkbox" as const,
            name,
            value: String(option.value),
            checked: selected.includes(option.value),
            disabled: disabled || option.disabled,
            onChange: () => toggle(option.value),
            onBlur,
          };

          return variant === "buttons" ? (
            <input
              key={option.value}
              {...inputProps}
              aria-label={option.label}
              className={`join-item btn btn-sm ${error ? "btn-error btn-outline" : ""}`}
            />
          ) : (
            <label key={option.value} className="label cursor-pointer gap-2">
              <input
                {...inputProps}
                className={`checkbox checkbox-sm ${error ? "checkbox-error" : ""}`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
