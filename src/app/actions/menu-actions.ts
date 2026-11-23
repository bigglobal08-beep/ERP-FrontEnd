"use server";

import { apiRequest, pathId, runAction } from "@/lib/api";
import type { IMenu, MenuItemInput } from "@/lib/menu/interface";

// El menú está en el layout: hay que revalidarlo completo
const revalidate = { path: "/app", type: "layout" } as const;

export async function fetchAdminMenu() {
  return runAction(() => apiRequest<IMenu>("GET", "/admin/menu"));
}

export async function createAdminMenu() {
  return runAction(
    () => apiRequest<IMenu>("POST", "/admin/menu", { body: { admin: true, menu: [] } }),
    revalidate,
  );
}

export async function addMenuItem(menuId: string, item: MenuItemInput) {
  return runAction(
    () =>
      apiRequest<IMenu>("POST", `/admin/menu/${pathId(menuId)}/items`, {
        body: { items: [item] },
      }),
    revalidate,
  );
}

export async function addMenuChild(menuId: string, itemId: string, child: MenuItemInput) {
  return runAction(
    () =>
      apiRequest<IMenu>(
        "POST",
        `/admin/menu/${pathId(menuId)}/items/${pathId(itemId)}/children`,
        { body: { children: [child] } },
      ),
    revalidate,
  );
}

export async function updateMenuItem(menuId: string, itemId: string, changes: MenuItemInput) {
  return runAction(
    () =>
      apiRequest<IMenu>("PATCH", `/admin/menu/${pathId(menuId)}/items/${pathId(itemId)}`, {
        body: changes,
      }),
    revalidate,
  );
}

// rootItemId es siempre el elemento principal, aunque el submenú esté más abajo
export async function updateMenuChild(
  menuId: string,
  rootItemId: string,
  childId: string,
  changes: MenuItemInput,
) {
  return runAction(
    () =>
      apiRequest<IMenu>(
        "PATCH",
        `/admin/menu/${pathId(menuId)}/items/${pathId(rootItemId)}/children/${pathId(childId)}`,
        { body: changes },
      ),
    revalidate,
  );
}
