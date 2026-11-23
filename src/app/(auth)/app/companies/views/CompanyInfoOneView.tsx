import {
  fetchCompanyAssignedModules,
  findCompanyById,
} from "@/app/actions/companies-actions";
import { fetchCompanyModules } from "@/app/actions/companyModules-actions";
import CompanyInfoOne from "@/components/companies/CompanyInfoOne";
import StateMessage from "@/components/ui/StateMessage";
import { can, type IAdmin } from "@/lib/auth/interface";

export default async function CompanyInfoOneView({
  id,
  admin,
}: {
  id: string;
  admin: IAdmin;
}) {
  const canReadCatalog = can(admin, "company-modules.read");
  const [company, assigned, catalog] = await Promise.all([
    findCompanyById(id),
    fetchCompanyAssignedModules(id),
    canReadCatalog ? fetchCompanyModules() : null,
  ]);

  if (!company.success || !company.data) {
    return <StateMessage variant="error" message={company.message} />;
  }

  // Si falla el catálogo no se debe poder guardar: el PUT reemplaza toda la asignación
  const modulesError = !assigned.success
    ? assigned.message
    : catalog && !catalog.success
      ? catalog.message
      : undefined;

  return (
    <CompanyInfoOne
      company={company.data}
      baseDomain={process.env.BASE_DOMAIN ?? "localhost"}
      catalog={catalog?.data ?? []}
      assigned={assigned.data?.modules ?? []}
      modulesError={modulesError}
      canUpdate={can(admin, "companies-clients.update")}
      canDelete={can(admin, "companies-clients.delete")}
      canReadCatalog={canReadCatalog}
    />
  );
}
