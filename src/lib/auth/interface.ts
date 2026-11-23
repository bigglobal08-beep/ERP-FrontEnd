export interface IAdmin {
  id: string;
  email: string;
  name: string;
  permissions: string[];
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Solo oculta o deshabilita en pantalla: el backend siempre vuelve a validar
export const can = (admin: Pick<IAdmin, "permissions">, permission: string) =>
  admin.permissions.includes(permission);
