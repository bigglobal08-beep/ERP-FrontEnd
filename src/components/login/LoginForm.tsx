"use client";

import { z } from "zod";
import FieldBoolean from "@/components/ui/form/FieldBoolean";
import FieldText from "@/components/ui/form/FieldText";
import FormLayout from "@/components/ui/form/FormLayout";
import useZodForm from "@/hooks/useZodForm";
import useOnChange from "@/hooks/useOnChange";
import FieldSelect from "../ui/form/FieldSelect";
import FieldNumber from "../ui/form/FieldNumber";
import FieldTextarea from "../ui/form/FieldTextarea";
import FieldDate from "../ui/form/FieldDate";
import FieldRadio from "../ui/form/FieldRadio";
import FieldChoice from "../ui/form/FieldChoice";
import FieldImage from "../ui/form/FieldImage";
import FieldFile from "../ui/form/FieldFile";
import {
  modalAlert,
  modalConfirm,
  modalError,
  modalSuccess,
  withLoading,
} from "@/components/ui/modal/modal";

const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  roleId: z.number(),
  price: z
    .number({ error: "El precio es obligatorio" })
    .min(0, "No puede ser negativo"),
  notes: z.string().max(200, "Máximo 200 caracteres"),
  description: z.string().min(1, "Escribe la descripción"),
  dueDate: z.iso.date({ error: "La fecha es obligatoria" }), // "2026-10-27"
  deliveredAt: z.iso.datetime({ local: true }).nullable(), // "2026-10-27T14:30"
  period: z.object(
    {
      from: z.iso.date(),
      to: z.iso.date({ error: "Selecciona la fecha final" }),
    },
    { error: "Selecciona un periodo" },
  ),
  paymentType: z.enum(["cash", "credit"], {
    error: "Selecciona el tipo de pago",
  }),
  priority: z.number({ error: "Selecciona la prioridad" }),
  modules: z.array(z.string()).min(1, "Selecciona al menos un módulo"),
  days: z.array(z.number()).min(1, "Selecciona al menos un día"),
  avatar: z
    .union([
      z
        .file()
        .max(2 * 1024 * 1024, "Máximo 2 MB")
        .mime(
          ["image/png", "image/jpeg", "image/webp"],
          "Solo PNG, JPG o WEBP",
        ),
      z.string(),
    ])
    .nullable(),
  contract: z
    .union([
      z
        .file()
        .max(10 * 1024 * 1024, "Máximo 10 MB")
        .mime(
          ["application/pdf", "image/png", "image/jpeg"],
          "Solo PDF o imagen",
        ),
      z.string(),
    ])
    .nullable()
    .refine((v) => v !== null, "Adjunta el contrato"),
  remember: z.boolean(),
});

type LoginInput = z.input<typeof loginSchema>;
type LoginValues = z.output<typeof loginSchema>;

export default function LoginForm() {
  const methods = useZodForm(loginSchema, {
    defaultValues: { email: "", password: "", remember: false },
  });

  // Demo onchange a nivel form: precio o prioridad → resumen en Notas
  useOnChange(methods, ["price", "priority"], (values, { name, form }) => {
    console.log("[onchange]", name, values.price, values.priority);
    form.setValue("notes", `Precio ${values.price ?? 0} · prioridad ${values.priority ?? "-"}`, {
      shouldDirty: true,
    });
  });

  const onSubmit = (values: LoginValues) => {
    console.log(values);
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit}>
      <FieldText<LoginInput>
        direction="row"
        name="email"
        type="email"
        label="Correo"
      />
      <FieldText<LoginInput>
        name="password"
        type="password"
        label="Contraseña"
        direction="row"
      />
      <FieldSelect<LoginInput>
        name="roleId"
        direction="row"
        label="Rol"
        // Demo onchange de un campo: Administrador → todos los módulos
        onChange={(roleId, form) =>
          form.setValue("modules", roleId === 1 ? ["sales", "purchases", "inventory"] : [], {
            shouldDirty: true,
          })
        }
        options={[
          { value: 1, label: "Administrador" },
          { value: 2, label: "Vendedor" },
          { value: 3, label: "Bodega", disabled: true },
        ]}
      />
      <FieldNumber<LoginInput>
        name="price"
        direction="row"
        label="Precio"
        widget="monetary"
        currency="USD"
      />
      <FieldRadio<LoginInput>
        name="paymentType"
        direction="row"
        label="Tipo de pago"
        orientation="horizontal"
        options={[
          { value: "cash", label: "Contado" },
          { value: "credit", label: "Crédito" },
        ]}
      />
      <FieldRadio<LoginInput>
        name="priority"
        label="Prioridad"
        variant="buttons"
        orientation="horizontal"
        options={[
          { value: 1, label: "Baja" },
          { value: 2, label: "Media" },
          { value: 3, label: "Alta" },
        ]}
      />
      <FieldChoice<LoginInput>
        name="modules"
        label="Módulos"
        options={[
          { value: "sales", label: "Ventas" },
          { value: "purchases", label: "Compras" },
          { value: "inventory", label: "Inventario" },
        ]}
      />
      <FieldChoice<LoginInput>
        name="days"
        label="Días de entrega"
        variant="buttons"
        orientation="horizontal"
        options={[
          { value: 1, label: "Lun" },
          { value: 2, label: "Mar" },
          { value: 3, label: "Mié" },
          { value: 4, label: "Jue" },
          { value: 5, label: "Vie" },
        ]}
      />
      <FieldImage<LoginInput> name="avatar" label="Foto" shape="square" />
      <FieldFile<LoginInput> name="contract" label="Contrato" />
      <FieldBoolean<LoginInput>
        direction="row"
        name="remember"
        label="Recordar"
      />
      <FieldTextarea<LoginInput> name="notes" label="Notas" />
      <FieldTextarea<LoginInput>
        name="description"
        label="Descripción"
        widget="html"
      />
      <FieldDate<LoginInput>
        name="dueDate"
        label="Vencimiento"
        min="2026-01-01"
      />
      <FieldDate<LoginInput> name="deliveredAt" label="Entregado" withTime />
      <FieldDate<LoginInput> name="period" label="Periodo" mode="range" />
      <button
        type="submit"
        className="btn btn-neutral btn-sm"
        disabled={methods.formState.isSubmitting}
      >
        Ingresar
      </button>
      {/* Demo de modales globales */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className="btn btn-xs"
          onClick={() => modalAlert("Alerta de prueba")}
        >
          Alert
        </button>
        <button
          type="button"
          className="btn btn-xs"
          onClick={() =>
            modalError(new Error("No se pudo conectar con el servidor."))
          }
        >
          Error
        </button>
        <button
          type="button"
          className="btn btn-xs"
          onClick={async () => {
            const ok = await modalConfirm(
              "¿Estás seguro de eliminar la factura F-0012?",
              {
                title: "Eliminar factura",
                confirmText: "Guardar",
              },
            );
            if (ok) {
              await withLoading(
                new Promise((r) => setTimeout(r, 1500)),
                "Guardando...",
              );
              await modalSuccess("Factura eliminada.");
            }
          }}
        >
          Confirm
        </button>
      </div>
    </FormLayout>
  );
}
