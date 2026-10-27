"use client";

import {
  Download,
  Eye,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
} from "lucide-react";
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

// Valor del campo: File nuevo por subir | string con la URL del archivo actual (edición) | null
export type FileValue = File | string | null;

type FieldFileProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  direction?: FieldDirection;
  // Se ejecuta cuando el usuario cambia el valor (como @api.onchange de Odoo)
  onChange?: FieldChangeHandler<FileValue, TFieldValues>;
  hint?: string;
  accept?: string;
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues>;
};

type FileKind = "pdf" | "image" | "sheet" | "other";

// Detecta el tipo por MIME (File) o por extensión (URL existente)
function getKind(file: File | string): FileKind {
  const type = file instanceof File ? file.type : "";
  const ext = (file instanceof File ? file.name : file)
    .split(/[?#]/)[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("image/") || /^(png|jpe?g|webp|gif|svg)$/.test(ext ?? ""))
    return "image";
  if (/^(xlsx?|csv)$/.test(ext ?? "")) return "sheet";
  return "other";
}

function getFileName(file: File | string) {
  if (file instanceof File) return file.name;
  return decodeURIComponent(file.split(/[?#]/)[0].split("/").pop() ?? "archivo");
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const kindIcons = {
  pdf: FileText,
  image: FileImage,
  sheet: FileSpreadsheet,
  other: FileIcon,
};

export default function FieldFile<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  label,
  direction,
  onChange: onChangeProp,
  hint = "PDF, imágenes u hojas de cálculo",
  accept = "application/pdf,image/*,.xlsx,.xls,.csv",
  disabled,
  rules,
}: FieldFileProps<TFieldValues>) {
  const {
    field: { value, onChange: rhfOnChange, onBlur, ref },
    fieldState: { error },
  } = useController<TFieldValues>({
    name,
    rules,
    disabled,
    // Arranca en null (sin archivo) si el form no define un defaultValue
    defaultValue: null as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  const onChange = useFieldChange<FileValue, TFieldValues>(
    rhfOnChange,
    onChangeProp,
  );

  useFieldDefault(
    name,
    null as PathValue<TFieldValues, FieldPath<TFieldValues>>,
  );

  const file = (value || null) as FileValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // URL para ver el archivo: blob temporal para un File, o la URL tal cual si ya existe
  const fileUrl = useMemo(
    () =>
      file instanceof File ? URL.createObjectURL(file) : (file ?? null),
    [file],
  );

  // Libera el blob al cambiar o quitar el archivo
  useEffect(() => {
    if (!(file instanceof File) || !fileUrl) return;
    return () => URL.revokeObjectURL(fileUrl);
  }, [file, fileUrl]);

  const select = (selected: File | undefined) => {
    if (selected) onChange(selected);
    onBlur();
  };

  const openPreview = () => {
    setPreviewing(true);
    dialogRef.current?.showModal();
  };

  const closePreview = () => dialogRef.current?.close();

  const kind = file ? getKind(file) : null;
  const canPreview = kind === "pdf" || kind === "image";
  const Icon = kind ? kindIcons[kind] : FileIcon;

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error?.message}
      direction={direction}
    >
      {file && fileUrl ? (
        <div
          className={`rounded-box bg-base-100 flex items-center gap-3 border p-3 ${error ? "border-error" : "border-base-300"}`}
        >
          <div
            className={`rounded-field flex size-10 shrink-0 items-center justify-center ${kind === "pdf" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{getFileName(file)}</p>
            <p className="text-base-content/60 text-xs">
              {file instanceof File ? formatSize(file.size) : "Archivo actual"}
            </p>
          </div>
          {canPreview ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Ver archivo"
              onClick={openPreview}
            >
              <Eye className="size-4" />
            </button>
          ) : (
            <a
              href={fileUrl}
              download={getFileName(file)}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Descargar archivo"
            >
              <Download className="size-4" />
            </a>
          )}
          {!disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square text-error"
              aria-label="Quitar archivo"
              onClick={() => onChange(null)}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          ref={ref}
          type="button"
          disabled={disabled}
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
          className={`group rounded-box bg-base-200 flex w-full cursor-pointer flex-col items-center gap-1 border-2 border-dashed px-4 py-6 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? "border-error"
              : dragging
                ? "border-primary bg-primary/10"
                : "border-base-300 hover:border-primary"
          }`}
        >
          <Upload className="text-base-content/50 group-hover:text-primary size-6" />
          <span>
            <span className="text-primary font-medium">Elige un archivo</span>{" "}
            o arrástralo aquí
          </span>
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

      <dialog
        ref={dialogRef}
        className="modal"
        onClose={() => setPreviewing(false)}
      >
        <div className="modal-box flex h-[85vh] w-11/12 max-w-5xl flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold">
              {file ? getFileName(file) : ""}
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Cerrar vista previa"
              onClick={closePreview}
            >
              <X className="size-4" />
            </button>
          </div>
          {/* Solo se carga mientras el modal está abierto */}
          {previewing && fileUrl && (
            <div className="rounded-field bg-base-200 min-h-0 flex-1 overflow-hidden">
              {kind === "pdf" ? (
                <iframe
                  src={fileUrl}
                  title="Vista previa del PDF"
                  className="size-full"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- next/image no aplica a blobs locales
                <img
                  src={fileUrl}
                  alt="Vista previa"
                  className="size-full object-contain"
                />
              )}
            </div>
          )}
        </div>
        {/* Sin <form method="dialog">: el campo ya vive dentro del <form> del FormLayout */}
        <div className="modal-backdrop" onClick={closePreview} />

      </dialog>
    </FieldWrapper>
  );
}
