import { connection } from "next/server";
import type { ReactNode } from "react";
import { fetchAdminMenu } from "@/app/actions/menu-actions";
import { getCurrentAdmin } from "@/lib/session";
import SidebarNav from "./SidebarNav";
import TopBarNav from "./TopBarNav";

export default async function AppShell({ children }: { children: ReactNode }) {
  // Sesión, permisos y menú son de cada usuario: nunca se prerenderizan
  await connection();
  const [admin, menuResponse] = await Promise.all([getCurrentAdmin(), fetchAdminMenu()]);
  // Un 404 significa que aún no se crea el menú: el layout no debe romperse
  const menu = menuResponse.success ? (menuResponse.data?.menu ?? []) : [];

  return (
    <div className="flex-1 flex min-h-0 w-min-0 overflow-hidden">
      <SidebarNav menu={menu} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBarNav name={admin.name} menu={menu} />
        <main className="min-h-0 min-w-0 overflow-y-auto p-3 md:p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
