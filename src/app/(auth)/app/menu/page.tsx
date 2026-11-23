import { Suspense } from "react";
import { fetchAdminMenu } from "@/app/actions/menu-actions";
import { fetchPermissionsCatalog } from "@/app/actions/permissions-actions";
import MenuManager from "@/components/menu/MenuManager";
import LoadingPage from "@/components/ui/LoadingPage";
import StateMessage from "@/components/ui/StateMessage";
import { can } from "@/lib/auth/interface";
import { getCurrentAdmin } from "@/lib/session";

async function MenuView() {
  const admin = await getCurrentAdmin();
  const canCreate = can(admin, "create.menu");
  const canUpdate = can(admin, "update.menu");
  if (!canCreate && !canUpdate) {
    return <StateMessage variant="forbidden" message="No tienes permiso para administrar el menú." />;
  }

  const [menu, catalog] = await Promise.all([fetchAdminMenu(), fetchPermissionsCatalog()]);
  // 404 es válido: el menú aún no se crea
  if (!menu.success && menu.status !== 404) {
    return <StateMessage variant="error" message={menu.message} />;
  }
  if (!catalog.success) return <StateMessage variant="error" message={catalog.message} />;

  return (
    <MenuManager
      menu={menu.success ? (menu.data ?? null) : null}
      catalog={catalog.data ?? []}
      ownPermissions={admin.permissions}
      canCreate={canCreate}
      canUpdate={canUpdate}
    />
  );
}

export default function PageMenu() {
  return (
    <Suspense fallback={<LoadingPage message="Cargando datos..." />}>
      <MenuView />
    </Suspense>
  );
}
