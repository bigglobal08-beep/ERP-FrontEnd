import { z } from "zod";
import type { IMenuItem, MenuItemInput } from "@/lib/menu/interface";

// El select nativo no maneja null: este valor significa "lo ven todos"
export const PERMISSION_ALL = "__all__";

export const menuItemSchema = z.object({
  span: z.string().trim().min(1, "El texto es obligatorio").max(80, "Máximo 80 caracteres"),
  className: z.string().trim().max(120, "Máximo 120 caracteres"),
  href: z.string().trim().max(300, "Máximo 300 caracteres"),
  defaultActiveKey: z.string().trim().max(80, "Máximo 80 caracteres"),
  eventKey: z.string().trim().max(80, "Máximo 80 caracteres"),
  permission: z.string(),
});

export type MenuItemSchemaType = z.infer<typeof menuItemSchema>;

export const toMenuItemValues = (item?: IMenuItem | null): MenuItemSchemaType => ({
  span: item?.span ?? "",
  className: item?.className ?? "",
  href: item?.href ?? "",
  defaultActiveKey: item?.defaultActiveKey ?? "",
  eventKey: item?.eventKey ?? "",
  permission: item?.permission ?? PERMISSION_ALL,
});

export const toMenuItemInput = (values: MenuItemSchemaType): MenuItemInput => ({
  ...values,
  permission: values.permission === PERMISSION_ALL ? null : values.permission,
});
