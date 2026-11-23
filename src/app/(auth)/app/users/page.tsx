import { Suspense } from "react";
import LoadingPage from "@/components/ui/LoadingPage";
import ListAllUsers from "./views/ListAllUsers";

export default function PageUsers({ searchParams }: PageProps<"/app/users">) {
  return (
    <Suspense fallback={<LoadingPage message="Cargando datos..." />}>
      <ListAllUsers searchParams={searchParams} />
    </Suspense>
  );
}
