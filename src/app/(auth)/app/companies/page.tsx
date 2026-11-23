import { Suspense } from "react";
import LoadingPage from "@/components/ui/LoadingPage";
import ListAllCompanies from "./views/ListAllCompanies";

export default function PageCompanies({ searchParams }: PageProps<"/app/companies">) {
  return (
    <Suspense fallback={<LoadingPage message="Cargando datos..." />}>
      <ListAllCompanies searchParams={searchParams} />
    </Suspense>
  );
}
