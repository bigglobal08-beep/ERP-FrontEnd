import { fetchCompanies } from "@/app/actions/companies-actions";
import CompaniesTableList from "@/components/companies/CompaniesTableList";
import StateMessage from "@/components/ui/StateMessage";
import { can } from "@/lib/auth/interface";
import { parseListParams, type RawSearchParams } from "@/lib/listParams";
import { getCurrentAdmin } from "@/lib/session";
import CompanyInfoOneView from "./CompanyInfoOneView";

export default async function ListAllCompanies({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const [params, admin] = await Promise.all([searchParams, getCurrentAdmin()]);

  if (!can(admin, "companies-clients.read")) {
    return <StateMessage variant="forbidden" message="No tienes permiso para ver empresas." />;
  }

  const { id, page, limit, search, active, view } = parseListParams(params);
  if (id) return <CompanyInfoOneView id={id} admin={admin} />;

  const res = await fetchCompanies({ page, limit, search, active });
  if (!res.success) return <StateMessage variant="error" message={res.message} />;

  return (
    <CompaniesTableList
      companies={res.data ?? []}
      total={res.total ?? 0}
      page={res.page ?? page}
      limit={res.limit ?? limit}
      view={view}
      canCreate={can(admin, "companies-clients.create")}
    />
  );
}
