import { z } from "zod";
import { passwordRule } from "./password.schema";

const name = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(120, "El nombre admite máximo 120 caracteres");

export const createUserSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  name,
  password: passwordRule,
  permissions: z.array(z.string()),
});

export const updateUserSchema = z.object({
  name,
  active: z.boolean(),
  permissions: z.array(z.string()),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;

export const defaultCreateUser: CreateUserSchemaType = {
  email: "",
  name: "",
  password: "",
  permissions: [],
};
