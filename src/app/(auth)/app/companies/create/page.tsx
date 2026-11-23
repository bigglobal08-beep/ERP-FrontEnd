import Link from "next/link";
import { Suspense } from "react";
import CompanyForm from "@/components/companies/CompanyForm";
import LoadingPage from "@/components/ui/LoadingPage";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import { can } from "@/lib/auth/interface";
import { getCurrentAdmin } from "@/lib/session";

async function CreateCompanyView() {
  const admin = await getCurrentAdmin();
  if (!can(admin, "companies-clients.create")) {
    return <StateMessage variant="forbidden" message="No tienes permiso para crear empresas." />;
  }

  return (
    <>
      <div className="breadcrumbs mb-2 text-sm">
        <ul>
          <li><Link href="/app/companies">Empresas</Link></li>
          <li>Nueva</li>
        </ul>
      </div>
      <PageTitle title="Nueva empresa" />
      <CompanyForm baseDomain={process.env.BASE_DOMAIN ?? "localhost"} />
    </>
  );
}

export default function CreateCompanyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <CreateCompanyView />
    </Suspense>
  );
}
