import { Settings, UserRound } from "lucide-react";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { fetchAdminMenu } from "@/app/actions/menu-actions";
import { getCurrentAdmin } from "@/lib/session";
import { NavItem } from "./NavItem";
import NavMenuItems from "./NavMenuItems";
import TopBarNav from "./TopBarNav";

export default async function AppShell({ children }: { children: ReactNode }) {
  // Sesión, permisos y menú son de cada usuario: nunca se prerenderizan
  await connection();
  const [admin, menuResponse] = await Promise.all([getCurrentAdmin(), fetchAdminMenu()]);
  // Un 404 significa que aún no se crea el menú: el layout no debe romperse
  const menu = menuResponse.success ? (menuResponse.data?.menu ?? []) : [];

  return (
    <div className="flex-1 flex min-h-0 w-min-0 overflow-hidden">
      <aside className="w-52 shrink-0 border-r border-base-200 md:flex flex-col min-h-0 hidden">
        <strong className="font-[500] h-16 p-4 uppercase border-b border-base-200">
          Menú
        </strong>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ul className="menu rounded-box w-full gap-1">
            <NavMenuItems items={menu} />
          </ul>
        </div>
        <ul className="menu w-full gap-1 border-t border-base-200 p-2">
          <NavItem
            label="Perfil"
            route="/app/profile"
            icon={<UserRound className="size-4" aria-hidden="true" />}
          />
          <NavItem
            label="Configuración"
            route="/app"
            icon={<Settings className="size-4" aria-hidden="true" />}
          />
        </ul>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBarNav name={admin.name} menu={menu} />
        <main className="min-h-0 min-w-0 overflow-y-auto p-3 md:p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
