import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .email("Ingresa un correo válido")
    .min(1, "El campo correo es requerido"),
  password: z.string().min(1, "El campo contraseña es requrido"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const defaultLoginSchema: LoginSchemaType = {
  login: "",
  password: "",
};
