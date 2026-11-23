import { Blocks, Building2, KeyRound, ListTree, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import LoadingPage from "@/components/ui/LoadingPage";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import { can } from "@/lib/auth/interface";
import { getCurrentAdmin } from "@/lib/session";

// Accesos fijos: permiten llegar a "Menú" aunque todavía no exista un menú en la base
const shortcuts = [
  { href: "/app/companies", label: "Empresas", icon: Building2, permissions: ["companies-clients.read"] },
  { href: "/app/users", label: "Usuarios", icon: Users, permissions: ["admins.read"] },
  { href: "/app/companyModules", label: "Módulos de empresas", icon: Blocks, permissions: ["company-modules.read"] },
  { href: "/app/permissions", label: "Permisos", icon: KeyRound, permissions: ["permissions.manage"] },
  { href: "/app/menu", label: "Menú lateral", icon: ListTree, permissions: ["create.menu", "update.menu"] },
];

async function Shortcuts() {
  const admin = await getCurrentAdmin();
  const visible = shortcuts.filter(({ permissions }) =>
    permissions.some((permission) => can(admin, permission)),
  );

  if (!visible.length) {
    return <StateMessage variant="forbidden" message="Tu usuario no tiene pantallas asignadas." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="card card-border bg-base-100 hover:bg-base-200 transition-colors"
        >
          <div className="card-body flex-row items-center gap-3 p-4">
            <Icon className="text-primary size-6 shrink-0" aria-hidden="true" />
            <span className="font-semibold">{label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AppPage() {
  return (
    <>
      <PageTitle title="Configuración" />
      <Suspense fallback={<LoadingPage />}>
        <Shortcuts />
      </Suspense>
    </>
  );
}
