"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

// Valor del campo: File nuevo por subir | string con la URL de la imagen actual (edición) | null
export type ImageValue = File | string | null;

type FieldImageProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<ImageValue, TFieldValues>;
  hint?: string;
  accept?: string;
  shape?: "square" | "circle";
  // Tamaño del recuadro de vista previa (clases de Tailwind)
  size?: string;
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues>;
};

export default function FieldImage<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  label,
  direction,
  onChange: onChangeProp,
  hint = "Arrastra una imagen o haz clic para elegirla",
  accept = "image/png,image/jpeg,image/webp",
  shape = "square",
  size = "size-40",
  disabled,
  rules,
}: FieldImageProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, onBlur, ref },
    fieldState: { error },
  } = useController<TFieldValues>({
    name,
    rules,
    disabled,
    // Arranca en null (sin imagen) si el form no define un defaultValue
    defaultValue: null as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  const onChange = useFieldChange<ImageValue, TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  useFieldDefault(
    name,
    null as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  );

  const image = value as ImageValue | undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Vista previa: blob temporal para un File, o la URL tal cual si ya existe
  const previewUrl = useMemo(
    () =>
      image instanceof File
        ? URL.createObjectURL(image)
        : typeof image === "string" && image
          ? image
          : null,
    [image],
  );

  // Libera el blob al cambiar o quitar la imagen
  useEffect(() => {
    if (!(image instanceof File) || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [image, previewUrl]);

  const select = (file: File | undefined) => {
    if (file) onChange(file);
    onBlur();
  };

  const rounded = shape === "circle" ? "rounded-full" : "rounded-box";

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      <div className={`relative ${size}`}>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          aria-label={previewUrl ? "Cambiar imagen" : "Elegir imagen"}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) select(e.dataTransfer.files[0]);
          }}
          className={`group bg-base-200 flex size-full cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${rounded} ${
            error
              ? "border-error"
              : dragging
                ? "border-primary bg-primary/10"
                : "border-base-300 hover:border-primary"
          }`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- next/image no aplica a blobs locales
            <img
              src={previewUrl}
              alt={label ?? "Vista previa"}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-base-content/50 group-hover:text-primary flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="size-8" />
              Subir imagen
            </span>
          )}
        </button>

        {previewUrl && !disabled && (
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={() => onChange(null)}
            className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 shadow"
          >
            <X className="size-3" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            select(e.target.files?.[0]);
            // Permite volver a elegir el mismo archivo después de quitarlo
            e.target.value = "";
          }}
        />
      </div>
    </FieldWrapper>
  );
}
