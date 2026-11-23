"use server";

import { apiRequest, pathId, runAction } from "@/lib/api";
import type {
  IPermission,
  IPermissionSegment,
  PermissionInput,
  SegmentInput,
} from "@/lib/permissions/interface";

// Crear un permiso cambia los del usuario actual: se revalida también el layout
const revalidate = { path: "/app", type: "layout" } as const;

export async function fetchPermissionsCatalog() {
  return runAction(() => apiRequest<IPermissionSegment[]>("GET", "/admin/permissions"));
}

export async function createSegment(data: SegmentInput) {
  return runAction(
    () =>
      apiRequest<IPermissionSegment>("POST", "/admin/permission-segments", {
        body: {
          key: data.key,
          name: data.name,
          description: data.description,
          order: data.order,
        },
      }),
    revalidate,
  );
}

export async function updateSegment(id: string, data: SegmentInput) {
  return runAction(
    () =>
      apiRequest<IPermissionSegment>("PATCH", `/admin/permission-segments/${pathId(id)}`, {
        body: { name: data.name, description: data.description, order: data.order },
      }),
    revalidate,
  );
}

export async function deleteSegment(id: string) {
  return runAction(
    () => apiRequest<unknown>("DELETE", `/admin/permission-segments/${pathId(id)}`),
    revalidate,
  );
}

export async function createPermission(data: PermissionInput) {
  return runAction(
    () =>
      apiRequest<IPermission>("POST", "/admin/permissions", {
        body: {
          key: data.key,
          description: data.description,
          segment: data.segment,
          order: data.order,
        },
      }),
    revalidate,
  );
}

export async function updatePermission(id: string, data: PermissionInput) {
  return runAction(
    () =>
      apiRequest<IPermission>("PATCH", `/admin/permissions/${pathId(id)}`, {
        body: { description: data.description, segment: data.segment, order: data.order },
      }),
    revalidate,
  );
}

export async function deletePermission(id: string) {
  return runAction(
    () =>
      apiRequest<{ key: string; removedFromUsers: number }>(
        "DELETE",
        `/admin/permissions/${pathId(id)}`,
      ),
    revalidate,
  );
}
