"use client";

import { useState, type ComponentProps } from "react";
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

const DEFAULT_LOCALE = "es-MX";
const DEFAULT_CURRENCY = "MXN";

// float: decimales obligatorios | integer: sin decimales | monetary: siempre 2 decimales con moneda
type NumberWidget =
  | { widget?: "float"; decimals: number }
  | { widget: "integer" }
  | { widget: "monetary"; currency?: string };

type FieldNumberProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<"input">,
  "name" | "type" | "value" | "defaultValue" | "onChange" | "onBlur"
> &
  NumberWidget & {
    name: FieldPath<TFieldValues>;
    label?: string;
    direction?: FieldDirection;
    // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
    onChange?: FieldChangeHandler<number | null, TFieldValues>;
    hint?: string;
    locale?: string;
    rules?: RegisterOptions<TFieldValues>;
  };

function getFormatter(
  locale: string,
  decimals: number,
  currency: string | undefined,
) {
  return new Intl.NumberFormat(locale, {
    ...(currency && { style: "currency", currency }),
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // Trunca en vez de redondear si llega un valor con más decimales
    roundingMode: "trunc",
  });
}

export default function FieldNumber<
  TFieldValues extends FieldValues = FieldValues,
>(props: FieldNumberProps<TFieldValues>) {
  const {
    name,
    label,
    direction,
    onChange: onChangeProp,
    hint,
    locale = DEFAULT_LOCALE,
    rules,
    className = "",
    widget = "float",
    decimals: decimalsProp,
    currency: currencyProp,
    ...inputProps
  } = props as FieldNumberProps<TFieldValues> & {
    decimals?: number;
    currency?: string;
  };

  const decimals =
    widget === "integer" ? 0 : widget === "monetary" ? 2 : (decimalsProp ?? 0);
  const currency =
    widget === "monetary" ? (currencyProp ?? DEFAULT_CURRENCY) : undefined;

  const {
    field: { value, onChange: rhfOnChange, onBlur, ...field },
    fieldState: { error },
  } = useController<TFieldValues>({
    name,
    rules,
    // Arranca en 0 si el form no define un defaultValue para este campo
    defaultValue: 0 as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  const onChange = useFieldChange<number | null, TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  useFieldDefault(
    name,
    0 as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  );

  // Texto mientras se edita; null = sin foco, se muestra el valor formateado
  const [draft, setDraft] = useState<string | null>(null);

  const pattern =
    decimals === 0
      ? /^-?\d*$/
      : new RegExp(`^-?\\d*(\\.\\d{0,${decimals}})?$`);

  const display =
    draft ?? (value == null ? "" : getFormatter(locale, decimals, currency).format(value));

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <input
        autoComplete="off"
        inputMode={decimals === 0 ? "numeric" : "decimal"}
        {...inputProps}
        {...field}
        type="text"
        value={display}
        onFocus={(e) => {
          const input = e.currentTarget;
          setDraft(value == null ? "" : String(value));
          // Selecciona todo para que al escribir se reemplace el 0
          requestAnimationFrame(() => input.select());
          inputProps.onFocus?.(e);
        }}
        onChange={(e) => {
          // Permite pegar valores formateados como "$1,000.50"
          const text = e.target.value.replace(/[\s,$]/g, "");

          // Ignora la tecla si rompe el formato (letras, decimales de más, etc.)
          if (!pattern.test(text)) return;

          setDraft(text);
          const parsed = Number(text);
          onChange(text === "" || Number.isNaN(parsed) ? null : parsed);
        }}
        onBlur={() => {
          // Si se deja vacío (o solo "-"), vuelve a 0
          if (value == null) onChange(0);
          setDraft(null);
          onBlur();
        }}
        aria-invalid={!!error}
        className={`input w-full text-right ${error ? "input-error" : ""} ${className}`}
      />
    </FieldWrapper>
  );
}
