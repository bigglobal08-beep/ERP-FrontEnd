import NavMenuItems from "@/components/ui/navigation/NavMenuItems";
import TopBarNav from "@/components/ui/navigation/TopBarNav";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex min-h-0 w-min-0 overflow-hidden">
      <aside className="w-45 shrink-0 border-r border-base-200 md:flex flex-col min-h-0 hidden">
        <strong className="font-[500] h-16 p-4 uppercase border-b border-base-200">
          Menú
        </strong>
        <div className="flex-1 shrink-0 min-h-0 overflow-y-auto">
          <ul className="menu rounded-box w-full gap-1">
            <NavMenuItems />
          </ul>
        </div>
        <div className="h-25 border-t border-base-200 p-1"></div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBarNav />
        <main className="min-h-0 min-w-0 overflow-y-auto p-1 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
