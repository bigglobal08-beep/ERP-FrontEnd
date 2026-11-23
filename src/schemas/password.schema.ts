import { z } from "zod";

export const passwordRule = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .max(128, "La contraseña admite máximo 128 caracteres");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Escribe tu contraseña actual"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "La nueva contraseña debe ser distinta de la actual",
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;

export const defaultChangePassword: ChangePasswordSchemaType = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
