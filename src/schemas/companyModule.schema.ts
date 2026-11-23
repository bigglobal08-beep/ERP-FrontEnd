import { z } from "zod";

const baseFields = {
  span: z.string().trim().min(1, "El texto es obligatorio").max(80, "Máximo 80 caracteres"),
  className: z.string().trim().max(120, "Máximo 120 caracteres"),
  href: z.string().trim().max(300, "Máximo 300 caracteres"),
  defaultActiveKey: z.string().trim().max(80, "Máximo 80 caracteres"),
  eventKey: z.string().trim().max(80, "Máximo 80 caracteres"),
  active: z.boolean(),
};

export const companyModuleSchema = z.object({
  ...baseFields,
  key: z
    .string()
    .trim()
    .min(1, "La clave es obligatoria")
    .max(40, "Máximo 40 caracteres")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  order: z
    .number({ error: "Escribe un número" })
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .max(9999, "Máximo 9999"),
});

export const companyModuleChildSchema = z.object(baseFields);

export type CompanyModuleSchemaType = z.infer<typeof companyModuleSchema>;
export type CompanyModuleChildSchemaType = z.infer<typeof companyModuleChildSchema>;
