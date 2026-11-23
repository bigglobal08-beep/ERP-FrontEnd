"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCompany } from "@/app/actions/companies-actions";
import ConditionalRender from "@/components/ui/ConditionalRender";
import { modalPrompt, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import useActionError from "@/hooks/useActionError";
import type { ICompany } from "@/lib/companies/interface";
import type {
  ICompanyModule,
  ICompanyModuleAssigned,
} from "@/lib/companyModules/interface";
import CompanyForm from "./CompanyForm";
import CompanyModulesAssign from "./CompanyModulesAssign";

export default function CompanyInfoOne({
  company,
  baseDomain,
  catalog,
  assigned,
  modulesError,
  canUpdate,
  canDelete,
  canReadCatalog,
}: {
  company: ICompany;
  baseDomain: string;
  catalog: ICompanyModule[];
  assigned: ICompanyModuleAssigned[];
  modulesError?: string;
  canUpdate: boolean;
  canDelete: boolean;
  canReadCatalog: boolean;
}) {
  const router = useRouter();
  const showError = useActionError();
  const [section, setSection] = useState<"data" | "modules">("data");

  const handleDelete = async () => {
    const reason = await modalPrompt(
      `Se dará de baja "${company.nameCompany}" y su subdominio no se podrá reutilizar.`,
      {
        title: "¿Seguro que quieres eliminar la empresa?",
        label: "Motivo",
        minLength: 3,
        maxLength: 250,
        confirmText: "Eliminar",
        danger: true,
      },
    );
    if (reason === null) return;

    const res = await withLoading(deleteCompany(company.id, reason), "Eliminando empresa...");
    if (!res.success) {
      await showError(res);
      return;
    }
    await modalSuccess(res.message);
    router.push("/app/companies");
  };

  return (
    <>
      <div className="breadcrumbs mb-2 text-sm">
        <ul>
          <li><Link href="/app/companies">Empresas</Link></li>
          <li>{company.nameCompany}</li>
        </ul>
      </div>
      <PageTitle title={company.nameCompany}>
        <ConditionalRender cond={canDelete}>
          <button type="button" className="btn btn-error btn-outline btn-sm" onClick={handleDelete}>
            <Trash2 className="size-4" /> Eliminar
          </button>
        </ConditionalRender>
      </PageTitle>

      <div className="join mb-4">
        <button
          type="button"
          className={`btn btn-sm join-item ${section === "data" ? "btn-neutral" : ""}`}
          onClick={() => setSection("data")}
        >
          Datos
        </button>
        <button
          type="button"
          className={`btn btn-sm join-item ${section === "modules" ? "btn-neutral" : ""}`}
          onClick={() => setSection("modules")}
        >
          Módulos
        </button>
      </div>

      <div className={section === "data" ? "" : "hidden"}>
        {/* Se vuelve a montar con los datos nuevos después de guardar */}
        <CompanyForm
          key={company.updatedAt}
          company={company}
          baseDomain={baseDomain}
          canEdit={canUpdate}
        />
      </div>

      <div className={section === "modules" ? "" : "hidden"}>
        {modulesError ? (
          <StateMessage variant="error" message={modulesError} />
        ) : !canReadCatalog ? (
          // Sin catálogo no se puede asignar: solo se muestra lo que ya tiene
          assigned.length ? (
            <ul className="list-disc pl-5 text-sm">
              {assigned.map((module) => (
                <li key={module.key}>
                  {module.span}
                  {module.children.length > 0 &&
                    ` (${module.children.map((child) => child.span).join(", ")})`}
                </li>
              ))}
            </ul>
          ) : (
            <StateMessage message="Esta empresa no tiene módulos asignados." />
          )
        ) : (
          <CompanyModulesAssign
            key={assigned.map((m) => `${m.key}:${m.children.length}`).join("|")}
            companyId={company.id}
            catalog={catalog}
            assigned={assigned}
            canEdit={canUpdate}
          />
        )}
      </div>
    </>
  );
}
