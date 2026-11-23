import { Suspense } from "react";
import { fetchCompanyModules } from "@/app/actions/companyModules-actions";
import CompanyModulesManager from "@/components/companyModules/CompanyModulesManager";
import LoadingPage from "@/components/ui/LoadingPage";
import StateMessage from "@/components/ui/StateMessage";
import { can } from "@/lib/auth/interface";
import { getCurrentAdmin } from "@/lib/session";

async function CompanyModulesView() {
  const admin = await getCurrentAdmin();
  if (!can(admin, "company-modules.read")) {
    return <StateMessage variant="forbidden" message="No tienes permiso para ver los módulos." />;
  }

  const modules = await fetchCompanyModules();
  if (!modules.success) return <StateMessage variant="error" message={modules.message} />;

  return (
    <CompanyModulesManager
      modules={modules.data ?? []}
      canCreate={can(admin, "company-modules.create")}
      canUpdate={can(admin, "company-modules.update")}
      canDelete={can(admin, "company-modules.delete")}
    />
  );
}

export default function PageCompanyModules() {
  return (
    <Suspense fallback={<LoadingPage message="Cargando datos..." />}>
      <CompanyModulesView />
    </Suspense>
  );
}
