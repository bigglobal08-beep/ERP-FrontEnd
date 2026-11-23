import { Suspense } from "react";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import LoadingPage from "@/components/ui/LoadingPage";
import PageTitle from "@/components/ui/PageTitle";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCurrentAdmin } from "@/lib/session";

async function ProfileView() {
  const admin = await getCurrentAdmin();

  return (
    <>
      <PageTitle title={admin.name} />
      <dl className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-base-content/60 text-xs">Correo</dt>
          <dd className="font-medium break-words">{admin.email}</dd>
        </div>
        <div>
          <dt className="text-base-content/60 text-xs">Estatus</dt>
          <dd>
            <StatusBadge active={admin.active} />
          </dd>
        </div>
        <div>
          <dt className="text-base-content/60 text-xs">Permisos</dt>
          <dd className="font-medium">{admin.permissions.length}</dd>
        </div>
      </dl>
      <ChangePasswordForm />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ProfileView />
    </Suspense>
  );
}
