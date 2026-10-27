"use client";

import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
  Bold,
  CircleCheck,
  CircleX,
  Code,
  Grid2x2X,
  Heading2,
  Heading3,
  ImagePlus,
  Info,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Redo2,
  Strikethrough,
  Table,
  TableRowsSplit,
  TextQuote,
  Trash2,
  TriangleAlert,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { AlertNode, type AlertVariant } from "./AlertNode";

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  // Sube la imagen al backend y devuelve su URL; sin esto se inserta en base64
  onUploadImage?: (file: File) => Promise<string>;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Evita que el editor pierda la selección al hacer clic en la barra
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`btn btn-xs btn-square ${active ? "btn-neutral" : "btn-ghost"}`}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

const Separator = () => <span className="bg-base-300 mx-1 h-4 w-px" />;

function Group({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

const alertButtons: { variant: AlertVariant; icon: LucideIcon; label: string }[] = [
  { variant: "info", icon: Info, label: "Alerta informativa" },
  { variant: "success", icon: CircleCheck, label: "Alerta de éxito" },
  { variant: "warning", icon: TriangleAlert, label: "Alerta de advertencia" },
  { variant: "error", icon: CircleX, label: "Alerta de error" },
];

function Toolbar({
  editor,
  disabled,
  onPickImage,
}: {
  editor: Editor;
  disabled?: boolean;
  onPickImage: () => void;
}) {
  // En Tiptap v3 el editor no re-renderiza en cada cambio; aquí se lee solo lo que la barra necesita
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      table: e.isActive("table"),
      alert: alertButtons.map(({ variant }) => e.isActive("alert", { variant })),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  const setLink = () => {
    if (state.link) {
      chain().unsetLink().run();
      return;
    }
    const url = window.prompt("URL del enlace", "https://");
    if (url) chain().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border-base-300 bg-base-200/60 flex flex-wrap items-center gap-y-1 border-b px-2 py-1">
      <Group>
        <ToolbarButton icon={Bold} label="Negrita" active={state.bold} disabled={disabled} onClick={() => chain().toggleBold().run()} />
        <ToolbarButton icon={Italic} label="Cursiva" active={state.italic} disabled={disabled} onClick={() => chain().toggleItalic().run()} />
        <ToolbarButton icon={Strikethrough} label="Tachado" active={state.strike} disabled={disabled} onClick={() => chain().toggleStrike().run()} />
        <ToolbarButton icon={Code} label="Código" active={state.code} disabled={disabled} onClick={() => chain().toggleCode().run()} />
        <ToolbarButton icon={Link} label={state.link ? "Quitar enlace" : "Enlace"} active={state.link} disabled={disabled} onClick={setLink} />
      </Group>
      <Separator />
      <Group>
        <ToolbarButton icon={Heading2} label="Título" active={state.h2} disabled={disabled} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton icon={Heading3} label="Subtítulo" active={state.h3} disabled={disabled} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton icon={List} label="Lista" active={state.bulletList} disabled={disabled} onClick={() => chain().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} label="Lista numerada" active={state.orderedList} disabled={disabled} onClick={() => chain().toggleOrderedList().run()} />
        <ToolbarButton icon={TextQuote} label="Cita" active={state.blockquote} disabled={disabled} onClick={() => chain().toggleBlockquote().run()} />
        <ToolbarButton icon={Minus} label="Separador" disabled={disabled} onClick={() => chain().setHorizontalRule().run()} />
      </Group>
      <Separator />
      <Group>
        {alertButtons.map(({ variant, icon, label }, i) => (
          <ToolbarButton key={variant} icon={icon} label={label} active={state.alert[i]} disabled={disabled} onClick={() => chain().toggleAlert(variant).run()} />
        ))}
      </Group>
      <Separator />
      <Group>
        <ToolbarButton icon={ImagePlus} label="Imagen" disabled={disabled} onClick={onPickImage} />
        <ToolbarButton
          icon={Table}
          label="Insertar tabla"
          disabled={disabled || state.table}
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        {/* Acciones de tabla: solo cuando el cursor está dentro de una */}
        {state.table && (
          <>
            <ToolbarButton icon={BetweenHorizontalEnd} label="Agregar fila" disabled={disabled} onClick={() => chain().addRowAfter().run()} />
            <ToolbarButton icon={BetweenVerticalEnd} label="Agregar columna" disabled={disabled} onClick={() => chain().addColumnAfter().run()} />
            <ToolbarButton icon={TableRowsSplit} label="Eliminar fila" disabled={disabled} onClick={() => chain().deleteRow().run()} />
            <ToolbarButton icon={Grid2x2X} label="Eliminar columna" disabled={disabled} onClick={() => chain().deleteColumn().run()} />
            <ToolbarButton icon={Trash2} label="Eliminar tabla" disabled={disabled} onClick={() => chain().deleteTable().run()} />
          </>
        )}
      </Group>
      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton icon={Undo2} label="Deshacer" disabled={disabled || !state.canUndo} onClick={() => chain().undo().run()} />
        <ToolbarButton icon={Redo2} label="Rehacer" disabled={disabled || !state.canRedo} onClick={() => chain().redo().run()} />
      </div>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Escribe aquí… usa # para títulos, - para listas, ** para negritas",
  disabled,
  error,
  onUploadImage,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Último valor recibido, para no notificar cambios que no lo son
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  const editor = useEditor({
    // Necesario en Next.js para evitar diferencias entre SSR y cliente
    immediatelyRender: false,
    editable: !disabled,
    content: value || "",
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder }),
      AlertNode,
    ],
    editorProps: {
      attributes: {
        class:
          "rich-text prose prose-sm max-w-none min-h-40 px-3 py-2 focus:outline-none",
      },
    },
    // Un editor vacío ("<p></p>") se guarda como "" para que Zod lo trate como vacío
    // Tiptap emite updates internos al iniciar (normaliza el documento); solo se notifica
    // si el HTML realmente cambió, para no marcar el form como "con cambios"
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? "" : e.getHTML();
      if (html !== (valueRef.current || "")) onChange(html);
    },
    onBlur: () => onBlur?.(),
  });

  // Sincroniza cambios externos (reset del form, carga de datos) sin perder el cursor al escribir
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const insertImage = async (file: File | undefined) => {
    if (!editor || !file?.type.startsWith("image/")) return;
    const src = onUploadImage
      ? await onUploadImage(file)
      : await readAsDataUrl(file);
    editor.chain().focus().setImage({ src, alt: file.name }).run();
  };

  return (
    <div
      className={`rounded-field bg-base-100 overflow-hidden border ${
        error
          ? "border-error"
          : "border-base-300 focus-within:border-base-content/40"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {editor ? (
        <>
          <Toolbar
            editor={editor}
            disabled={disabled}
            onPickImage={() => fileInputRef.current?.click()}
          />
          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="skeleton h-52 rounded-none" />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          insertImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
