"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import {
  useController,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import FieldWrapper, { type FieldDirection } from "./FieldWrapper";
import useFieldChange, { type FieldChangeHandler } from "./useFieldChange";

// El editor solo se descarga si algún campo usa widget="html"
const RichTextEditor = dynamic(() => import("./editor/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="skeleton rounded-field h-52 w-full" />,
});

type FieldTextareaProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<"textarea">,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur"
> & {
  name: FieldPath<TFieldValues>;
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<string, TFieldValues>;
  hint?: string;
  // text: textarea simple | html: editor enriquecido (tablas, alertas, imágenes)
  widget?: "text" | "html";
  // Solo html: sube la imagen y devuelve su URL (sin esto se inserta en base64)
  onUploadImage?: (file: File) => Promise<string>;
  rules?: RegisterOptions<TFieldValues>;
};

export default function FieldTextarea<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  label,
  direction,
  onChange: onChangeProp,
  hint,
  widget = "text",
  onUploadImage,
  rules,
  rows = 3,
  maxLength,
  placeholder,
  disabled,
  className = "",
  ...props
}: FieldTextareaProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController<TFieldValues>({ name, rules, disabled });

  const onChange = useFieldChange<string, TFieldValues>(
    field.onChange,
    onChangeProp,
  );

  if (widget === "html") {
    return (
      <FieldWrapper
        label={label}
        hint={hint}
        error={error?.message}
        direction={direction}
      >
        <RichTextEditor
          value={field.value ?? ""}
          onChange={onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={!!error}
          onUploadImage={onUploadImage}
        />
      </FieldWrapper>
    );
  }

  const length = String(field.value ?? "").length;

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <textarea
        {...props}
        {...field}
        onChange={onChange}
        value={field.value ?? ""}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`textarea w-full ${error ? "textarea-error" : ""} ${className}`}
      />
      {/* Contador de caracteres solo si hay límite */}
      {maxLength && (
        <span className="text-base-content/60 text-right text-xs">
          {length}/{maxLength}
        </span>
      )}
    </FieldWrapper>
  );
}
