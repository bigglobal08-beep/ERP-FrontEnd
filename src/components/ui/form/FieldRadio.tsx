"use client";

import {
  useController,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import FieldWrapper, { type FieldDirection } from "./FieldWrapper";
import useFieldChange, { type FieldChangeHandler } from "./useFieldChange";
import type { SelectOption } from "./FieldSelect";

type FieldRadioProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  options: SelectOption[];
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<SelectOption["value"], TFieldValues>;
  hint?: string;
  // radio: círculos clásicos | buttons: grupo de botones (segmented)
  variant?: "radio" | "buttons";
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues>;
};

export default function FieldRadio<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  options,
  label,
  direction,
  onChange: onChangeProp,
  hint,
  variant = "radio",
  orientation = "vertical",
  disabled,
  rules,
}: FieldRadioProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, onBlur, ref },
    fieldState: { error },
  } = useController<TFieldValues>({ name, rules, disabled });

  const onChange = useFieldChange<SelectOption["value"], TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  const isHorizontal = orientation === "horizontal";

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <div
        role="radiogroup"
        aria-invalid={!!error}
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
            type: "radio" as const,
            name,
            value: String(option.value),
            // Compara el valor original para respetar number/string
            checked: value === option.value,
            disabled: disabled || option.disabled,
            onChange: () => onChange(option.value),
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
            <label
              key={option.value}
              className="label cursor-pointer gap-2"
            >
              <input
                {...inputProps}
                className={`radio radio-sm ${error ? "radio-error" : ""}`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}
