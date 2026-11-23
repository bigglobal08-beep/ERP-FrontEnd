"use client";

import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import ListToolbar from "@/components/ui/list/ListToolbar";
import Pagination from "@/components/ui/list/Pagination";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ICompany } from "@/lib/companies/interface";

const formHref = (id: string) => `/app/companies?view_type=form&id=${encodeURIComponent(id)}`;

const addressText = ({ address }: ICompany) =>
  address
    ? `${address.street} ${address.exteriorNumber}, ${address.city}, ${address.state}`
    : "Sin dirección";

const phoneText = ({ contacts }: ICompany) =>
  contacts.find((contact) => contact.phone)?.phone?.nationalNumber ||
  contacts.find((contact) => contact.phone)?.phone?.number ||
  "-";

export default function CompaniesTableList({
  companies,
  total,
  page,
  limit,
  view,
  canCreate,
}: {
  companies: ICompany[];
  total: number;
  page: number;
  limit: number;
  view: "cards" | "table";
  canCreate: boolean;
}) {
  return (
    <>
      <PageTitle title="Empresas" />
      <ListToolbar
        showViewToggle
        createLabel="Nueva"
        createHref={canCreate ? "/app/companies/create" : undefined}
      />

      {!companies.length ? (
        <StateMessage message="No se encontraron empresas." />
      ) : view === "table" ? (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estatus</th>
                <th>RFC</th>
                <th>Dirección</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-base-200">
                  <td className="font-medium uppercase">
                    <Link href={formHref(company.id)} className="link link-hover">
                      {company.nameCompany}
                    </Link>
                  </td>
                  <td><StatusBadge active={company.active} feminine /></td>
                  <td>{company.billing?.rfc || "-"}</td>
                  <td className="max-w-64 truncate">{addressText(company)}</td>
                  <td className="whitespace-nowrap">{phoneText(company)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {companies.map((company) => (
            <article key={company.id} className="card card-border bg-base-100 shadow-sm sm:card-side">
              <div className="bg-base-200 flex items-center justify-center p-6 sm:w-32">
                <Building2 className="text-base-content/40 size-10" aria-hidden="true" />
              </div>
              <div className="card-body min-w-0 gap-1 p-4">
                <StatusBadge active={company.active} feminine />
                <h2 className="card-title break-words uppercase">{company.nameCompany}</h2>
                <p className="text-base-content/70 text-sm">{addressText(company)}</p>
                <Link
                  href={formHref(company.id)}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium"
                >
                  Más información <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} limit={limit} total={total} />
    </>
  );
}
