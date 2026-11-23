import { fetchPermissionsCatalog } from "@/app/actions/permissions-actions";
import { fetchUsers, findUserById } from "@/app/actions/users-actions";
import StateMessage from "@/components/ui/StateMessage";
import UserInfoOne from "@/components/users/UserInfoOne";
import UsersTableList from "@/components/users/UsersTableList";
import { can } from "@/lib/auth/interface";
import { parseListParams, type RawSearchParams } from "@/lib/listParams";
import { getCurrentAdmin } from "@/lib/session";

export default async function ListAllUsers({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const [params, admin] = await Promise.all([searchParams, getCurrentAdmin()]);

  if (!can(admin, "admins.read")) {
    return <StateMessage variant="forbidden" message="No tienes permiso para ver usuarios." />;
  }

  const { id, page, limit, search, active } = parseListParams(params);

  if (id) {
    const [user, catalog] = await Promise.all([findUserById(id), fetchPermissionsCatalog()]);
    if (!user.success || !user.data) {
      return <StateMessage variant="error" message={user.message} />;
    }
    if (!catalog.success) return <StateMessage variant="error" message={catalog.message} />;
    return (
      <UserInfoOne
        key={user.data.updatedAt}
        user={user.data}
        currentAdmin={admin}
        catalog={catalog.data ?? []}
      />
    );
  }

  const res = await fetchUsers({ page, limit, search, active });
  if (!res.success) return <StateMessage variant="error" message={res.message} />;

  return (
    <UsersTableList
      users={res.data ?? []}
      total={res.total ?? 0}
      page={res.page ?? page}
      limit={res.limit ?? limit}
      canCreate={can(admin, "admins.create")}
    />
  );
}
