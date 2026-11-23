"use client";

import Link from "next/link";
import ListToolbar from "@/components/ui/list/ListToolbar";
import Pagination from "@/components/ui/list/Pagination";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import StatusBadge from "@/components/ui/StatusBadge";
import type { IAdmin } from "@/lib/auth/interface";

export default function UsersTableList({
  users,
  total,
  page,
  limit,
  canCreate,
}: {
  users: IAdmin[];
  total: number;
  page: number;
  limit: number;
  canCreate: boolean;
}) {
  return (
    <>
      <PageTitle title="Usuarios" />
      <ListToolbar createLabel="Nuevo" createHref={canCreate ? "/app/users/create" : undefined} />

      {!users.length ? (
        <StateMessage message="No se encontraron usuarios." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <article key={user.id} className="card card-border bg-base-100 shadow-sm">
              <div className="card-body min-w-0 items-center gap-2 p-4 text-center">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary/15 text-primary w-14 rounded-full">
                    <span className="text-xl font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <StatusBadge active={user.active} />
                <h2 className="font-bold break-words uppercase">{user.name}</h2>
                <p className="text-base-content/70 max-w-full text-sm break-words">{user.email}</p>
                <Link
                  href={`/app/users?view_type=form&id=${encodeURIComponent(user.id)}`}
                  className="btn btn-error btn-sm mt-1"
                >
                  Más información
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
