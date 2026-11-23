import { z } from "zod";

const order = z
  .number({ error: "Escribe un número" })
  .int("Debe ser un número entero")
  .min(0, "No puede ser negativo")
  .max(100000, "Máximo 100000");

const segmentKeyPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const permissionKeyPattern = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)+$/;

export const segmentSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(segmentKeyPattern, 'Solo minúsculas, números y guiones (ej. "recursos-humanos")'),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(80, "Máximo 80 caracteres"),
  description: z.string().trim().max(250, "Máximo 250 caracteres"),
  order,
});

export const permissionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(80, "Máximo 80 caracteres")
    .regex(permissionKeyPattern, 'Formato "segmento.accion" (ej. "ventas.cancelar")'),
  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(250, "Máximo 250 caracteres"),
  segment: z.string().min(1, "Selecciona un segmento"),
  order,
});

export type SegmentSchemaType = z.infer<typeof segmentSchema>;
export type PermissionSchemaType = z.infer<typeof permissionSchema>;
