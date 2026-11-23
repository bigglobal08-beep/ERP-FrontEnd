import Link from "next/link";
import { Suspense } from "react";
import { fetchPermissionsCatalog } from "@/app/actions/permissions-actions";
import LoadingPage from "@/components/ui/LoadingPage";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import CreateUser from "@/components/users/CreateUser";
import { can } from "@/lib/auth/interface";
import { getCurrentAdmin } from "@/lib/session";

async function CreateUserView() {
  const admin = await getCurrentAdmin();
  if (!can(admin, "admins.create")) {
    return <StateMessage variant="forbidden" message="No tienes permiso para crear usuarios." />;
  }

  const catalog = await fetchPermissionsCatalog();
  if (!catalog.success) return <StateMessage variant="error" message={catalog.message} />;

  return (
    <>
      <div className="breadcrumbs mb-2 text-sm">
        <ul>
          <li><Link href="/app/users">Usuarios</Link></li>
          <li>Nuevo</li>
        </ul>
      </div>
      <PageTitle title="Nuevo usuario" />
      <CreateUser
        catalog={catalog.data ?? []}
        ownPermissions={admin.permissions}
        canAssignPermissions={can(admin, "admins.permissions")}
      />
    </>
  );
}

export default function CreateUserPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <CreateUserView />
    </Suspense>
  );
}
