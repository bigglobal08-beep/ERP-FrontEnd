"use server";

import { apiRequest, listQuery, pathId, runAction } from "@/lib/api";
import type {
  CreateCompanyInput,
  ICompany,
  UpdateCompanyInput,
} from "@/lib/companies/interface";
import type {
  AssignCompanyModule,
  ICompanyModuleDirectory,
} from "@/lib/companyModules/interface";
import type { ListArgs } from "@/lib/definitions";

const revalidate = { path: "/app/companies" };

export async function fetchCompanies(args: ListArgs = {}) {
  return runAction(() =>
    apiRequest<ICompany[]>("GET", "/admin/companies-clients", { query: listQuery(args) }),
  );
}

export async function findCompanyById(id: string) {
  return runAction(() =>
    apiRequest<ICompany>("GET", `/admin/companies-clients/${pathId(id)}`),
  );
}

export async function createCompany(data: CreateCompanyInput) {
  return runAction(
    () => apiRequest<ICompany>("POST", "/admin/companies-clients", { body: data }),
    revalidate,
  );
}

export async function updateCompany(id: string, data: UpdateCompanyInput) {
  return runAction(
    () =>
      apiRequest<ICompany>("PATCH", `/admin/companies-clients/${pathId(id)}`, {
        body: data,
      }),
    revalidate,
  );
}

export async function deleteCompany(id: string, reasonDelete: string) {
  return runAction(
    () =>
      apiRequest<unknown>("DELETE", `/admin/companies-clients/${pathId(id)}`, {
        body: { reasonDelete },
      }),
    revalidate,
  );
}

export async function fetchCompanyAssignedModules(id: string) {
  return runAction(() =>
    apiRequest<ICompanyModuleDirectory>(
      "GET",
      `/admin/companies-clients/${pathId(id)}/modules`,
    ),
  );
}

export async function assignCompanyModules(id: string, modules: AssignCompanyModule[]) {
  return runAction(
    () =>
      apiRequest<ICompanyModuleDirectory>(
        "PUT",
        `/admin/companies-clients/${pathId(id)}/modules`,
        { body: { modules } },
      ),
    revalidate,
  );
}
