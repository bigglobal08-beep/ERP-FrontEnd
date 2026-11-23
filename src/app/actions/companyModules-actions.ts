"use server";

import { apiRequest, pathId, runAction } from "@/lib/api";
import type {
  CompanyModuleChildInput,
  CompanyModuleInput,
  ICompanyModule,
} from "@/lib/companyModules/interface";

const revalidate = { path: "/app/companyModules" };

export async function fetchCompanyModules() {
  return runAction(() => apiRequest<ICompanyModule[]>("GET", "/admin/company-modules"));
}

export async function createCompanyModule(data: CompanyModuleInput) {
  return runAction(
    () =>
      apiRequest<ICompanyModule>("POST", "/admin/company-modules", {
        body: {
          key: data.key,
          span: data.span,
          className: data.className,
          href: data.href,
          defaultActiveKey: data.defaultActiveKey,
          eventKey: data.eventKey,
          order: data.order,
          active: data.active,
        },
      }),
    revalidate,
  );
}

export async function updateCompanyModule(id: string, data: CompanyModuleInput) {
  return runAction(
    () =>
      apiRequest<ICompanyModule>("PATCH", `/admin/company-modules/${pathId(id)}`, {
        body: {
          span: data.span,
          className: data.className,
          href: data.href,
          defaultActiveKey: data.defaultActiveKey,
          eventKey: data.eventKey,
          order: data.order,
          active: data.active,
        },
      }),
    revalidate,
  );
}

export async function deleteCompanyModule(id: string) {
  return runAction(
    () => apiRequest<unknown>("DELETE", `/admin/company-modules/${pathId(id)}`),
    revalidate,
  );
}

export async function addCompanyModuleChild(id: string, child: CompanyModuleChildInput) {
  return runAction(
    () =>
      apiRequest<ICompanyModule>("POST", `/admin/company-modules/${pathId(id)}/children`, {
        body: { children: [child] },
      }),
    revalidate,
  );
}

export async function updateCompanyModuleChild(
  id: string,
  childId: string,
  child: CompanyModuleChildInput,
) {
  return runAction(
    () =>
      apiRequest<ICompanyModule>(
        "PATCH",
        `/admin/company-modules/${pathId(id)}/children/${pathId(childId)}`,
        { body: child },
      ),
    revalidate,
  );
}
