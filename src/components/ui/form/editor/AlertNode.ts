import { mergeAttributes, Node } from "@tiptap/core";

export const alertVariants = ["info", "success", "warning", "error"] as const;
export type AlertVariant = (typeof alertVariants)[number];

// Clases completas para que Tailwind las detecte al escanear
const variantClasses: Record<AlertVariant, string> = {
  info: "alert alert-info alert-soft",
  success: "alert alert-success alert-soft",
  warning: "alert alert-warning alert-soft",
  error: "alert alert-error alert-soft",
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    alert: {
      // Envuelve la selección en una alerta, o cambia/quita la variante si ya está en una
      toggleAlert: (variant: AlertVariant) => ReturnType;
    };
  }
}

// Bloque de alerta de daisyUI que puede contener párrafos, listas, etc.
// Se guarda como <div data-alert="info" class="alert alert-info alert-soft">…</div>
export const AlertNode = Node.create({
  name: "alert",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info" as AlertVariant,
        parseHTML: (element) => element.getAttribute("data-alert") ?? "info",
        renderHTML: (attributes) => ({ "data-alert": attributes.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-alert]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variant = node.attrs.variant as AlertVariant;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        role: "alert",
        class: variantClasses[variant] ?? variantClasses.info,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleAlert:
        (variant) =>
        ({ editor, commands }) => {
          if (!editor.isActive(this.name)) {
            return commands.wrapIn(this.name, { variant });
          }
          if (editor.isActive(this.name, { variant })) {
            return commands.lift(this.name);
          }
          return commands.updateAttributes(this.name, { variant });
        },
    };
  },
});
