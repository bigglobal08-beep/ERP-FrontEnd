"use client";

import { CalendarDays, X } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import { es } from "react-day-picker/locale";
import {
  useController,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import FieldWrapper, { type FieldDirection } from "./FieldWrapper";
import useFieldChange, { type FieldChangeHandler } from "./useFieldChange";

const DEFAULT_LOCALE = "es-MX";
const GAP = 4;

// Valor de un rango: strings ISO "YYYY-MM-DD"; `to` es null mientras se elige la segunda fecha
export type DateRangeValue = { from: string | null; to: string | null };

// single: "YYYY-MM-DD" (o "YYYY-MM-DDTHH:mm" con withTime) | range: { from, to }
type DateMode =
  | { mode?: "single"; withTime?: boolean }
  | { mode: "range"; withTime?: never };

type FieldDateProps<TFieldValues extends FieldValues> = DateMode & {
  name: FieldPath<TFieldValues>;
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<string | DateRangeValue | null, TFieldValues>;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  // Límites en formato "YYYY-MM-DD"
  min?: string;
  max?: string;
  numberOfMonths?: number;
  className?: string;
  rules?: RegisterOptions<TFieldValues>;
};

const pad = (n: number) => String(n).padStart(2, "0");

// Se trabaja con fechas locales para evitar desfases por zona horaria
function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromISODate(value: string | null | undefined) {
  if (!value) return undefined;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  dateStyle: "medium",
});

function formatDate(value: string | null | undefined) {
  const date = fromISODate(value);
  if (!date) return "";
  const time = value?.slice(11, 16);
  return time
    ? `${dateFormatter.format(date)} ${time}`
    : dateFormatter.format(date);
}

export default function FieldDate<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  label,
  direction,
  onChange: onChangeProp,
  hint,
  placeholder,
  disabled,
  min,
  max,
  numberOfMonths = 1,
  className = "",
  rules,
  mode = "single",
  withTime = false,
}: FieldDateProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, onBlur, ref },
    fieldState: { error },
  } = useController<TFieldValues>({ name, rules, disabled });

  const onChange = useFieldChange<string | DateRangeValue | null, TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  const popoverId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // El calendario vive en el "top layer" (Popover API), así que no lo recorta
  // ningún overflow; se posiciona bajo el input, o arriba si no cabe
  useLayoutEffect(() => {
    if (!open) return;

    const position = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const popover = popoverRef.current;
      if (!trigger || !popover) return;

      const { offsetHeight: height, offsetWidth: width } = popover;
      const fitsBelow = trigger.bottom + GAP + height <= window.innerHeight;
      const top =
        fitsBelow || trigger.top - GAP - height < 0
          ? trigger.bottom + GAP
          : trigger.top - GAP - height;
      const left = Math.max(
        GAP,
        Math.min(trigger.left, window.innerWidth - width - GAP),
      );

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
    };

    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);

  const close = () => popoverRef.current?.hidePopover();

  const disabledDays = [
    min && { before: fromISODate(min) },
    max && { after: fromISODate(max) },
  ].filter(Boolean) as Matcher[];

  const range = (mode === "range" ? value : null) as DateRangeValue | null;
  const single = (mode === "single" ? value : null) as string | null;

  const display =
    mode === "range"
      ? range?.from
        ? `${formatDate(range.from)} – ${range.to ? formatDate(range.to) : "…"}`
        : ""
      : formatDate(single);

  const time = single?.slice(11, 16) || "00:00";

  const calendarProps = {
    className: "react-day-picker",
    locale: es,
    captionLayout: "dropdown" as const,
    numberOfMonths,
    disabled: disabledDays,
  };

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <div
        ref={triggerRef}
        className={`input w-full ${error ? "input-error" : ""} ${disabled ? "opacity-60" : ""} ${className}`}
      >
        <button
          ref={ref}
          type="button"
          name={name}
          disabled={disabled}
          popoverTarget={popoverId}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex flex-1 cursor-pointer items-center gap-2 truncate text-left outline-none"
        >
          <CalendarDays className="size-4 shrink-0 opacity-60" />
          {display || (
            <span className="opacity-50">
              {placeholder ??
                (mode === "range"
                  ? "Selecciona un rango"
                  : "Selecciona una fecha")}
            </span>
          )}
        </button>
        {display && !disabled && (
          <button
            type="button"
            aria-label="Limpiar fecha"
            className="btn btn-ghost btn-xs btn-circle"
            onClick={() => onChange(null)}
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        role="dialog"
        // Clic afuera y Escape los maneja el navegador; al cerrar se marca "touched"
        onToggle={(e) => {
          const isOpen = e.newState === "open";
          setOpen(isOpen);
          if (!isOpen) onBlur();
        }}
        className="rounded-box border-base-300 bg-base-100 text-base-content fixed inset-auto m-0 border p-2 shadow-lg"
      >
        {open && mode === "range" && (
          <DayPicker
            {...calendarProps}
            mode="range"
            defaultMonth={fromISODate(range?.from)}
            selected={{
              from: fromISODate(range?.from),
              to: fromISODate(range?.to),
            }}
            // Primer clic = inicio, segundo clic = fin (se ordenan si van al revés)
            onSelect={(_, day) => {
              const iso = toISODate(day);
              if (!range?.from || range.to) {
                onChange({ from: iso, to: null });
                return;
              }
              onChange(
                iso < range.from
                  ? { from: iso, to: range.from }
                  : { from: range.from, to: iso },
              );
              close();
            }}
          />
        )}

        {open && mode === "single" && (
          <DayPicker
            {...calendarProps}
            mode="single"
            defaultMonth={fromISODate(single)}
            selected={fromISODate(single)}
            onSelect={(_, day) => {
              const iso = toISODate(day);
              onChange(withTime ? `${iso}T${time}` : iso);
              if (!withTime) close();
            }}
          />
        )}

        {open && withTime && (
          <div className="border-base-300 flex items-center justify-between gap-2 border-t px-2 pt-2">
            <input
              type="time"
              className="input input-sm w-32"
              value={time}
              onChange={(e) => {
                const date = single?.slice(0, 10) ?? toISODate(new Date());
                onChange(`${date}T${e.target.value || "00:00"}`);
              }}
            />
            <button
              type="button"
              className="btn btn-neutral btn-sm"
              onClick={close}
            >
              Listo
            </button>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
