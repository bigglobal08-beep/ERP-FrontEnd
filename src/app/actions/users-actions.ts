"use server";

import { apiRequest, listQuery, pathId, runAction } from "@/lib/api";
import type { IAdmin } from "@/lib/auth/interface";
import type { ListArgs } from "@/lib/definitions";

const revalidate = { path: "/app/users" };

export async function fetchUsers(args: ListArgs = {}) {
  return runAction(() =>
    apiRequest<IAdmin[]>("GET", "/admin/users", { query: listQuery(args) }),
  );
}

export async function findUserById(id: string) {
  return runAction(() => apiRequest<IAdmin>("GET", `/admin/users/${pathId(id)}`));
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  permissions?: string[];
}) {
  return runAction(
    () =>
      apiRequest<IAdmin>("POST", "/admin/users", {
        body: {
          email: data.email,
          name: data.name,
          password: data.password,
          ...(data.permissions && { permissions: data.permissions }),
        },
      }),
    revalidate,
  );
}

export async function updateUser(
  id: string,
  data: { name?: string; active?: boolean; permissions?: string[] },
) {
  return runAction(
    () =>
      apiRequest<IAdmin>("PATCH", `/admin/users/${pathId(id)}`, {
        body: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.active !== undefined && { active: data.active }),
          ...(data.permissions && { permissions: data.permissions }),
        },
      }),
    revalidate,
  );
}

export async function resetUserPassword(id: string, password: string) {
  return runAction(() =>
    apiRequest<unknown>("PUT", `/admin/users/${pathId(id)}/password`, {
      body: { password },
    }),
  );
}

export async function deleteUser(id: string, reasonDelete: string) {
  return runAction(
    () =>
      apiRequest<unknown>("DELETE", `/admin/users/${pathId(id)}`, {
        body: { reasonDelete },
      }),
    revalidate,
  );
}
