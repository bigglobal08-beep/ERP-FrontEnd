import { Suspense } from "react";
import { fetchPermissionsCatalog } from "@/app/actions/permissions-actions";
import PermissionsManager from "@/components/permissions/PermissionsManager";
import LoadingPage from "@/components/ui/LoadingPage";
import StateMessage from "@/components/ui/StateMessage";
import { can } from "@/lib/auth/interface";
import { getCurrentAdmin } from "@/lib/session";

async function PermissionsView() {
  const [admin, catalog] = await Promise.all([getCurrentAdmin(), fetchPermissionsCatalog()]);
  if (!catalog.success) return <StateMessage variant="error" message={catalog.message} />;

  return (
    <PermissionsManager
      catalog={catalog.data ?? []}
      canManage={can(admin, "permissions.manage")}
    />
  );
}

export default function PagePermissions() {
  return (
    <Suspense fallback={<LoadingPage message="Cargando datos..." />}>
      <PermissionsView />
    </Suspense>
  );
}
