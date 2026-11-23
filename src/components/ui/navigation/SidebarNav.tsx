"use client";

import { PanelLeftClose, PanelLeftOpen, Settings, UserRound } from "lucide-react";
import { useState, type MouseEvent } from "react";
import type { IMenuItem } from "@/lib/menu/interface";
import ConditionalRender from "../ConditionalRender";
import { NavItem } from "./NavItem";
import NavMenuItems from "./NavMenuItems";

export default function SidebarNav({ menu }: { menu: IMenuItem[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  // Contraído no caben los submenús: al tocar un grupo primero se expande el menú
  const expandOnGroupClick = (event: MouseEvent<HTMLElement>) => {
    if (collapsed && (event.target as Element).closest("summary")) {
      event.preventDefault();
      setCollapsed(false);
    }
  };

  return (
    <aside
      data-collapsed={collapsed}
      onClickCapture={expandOnGroupClick}
      className={`${collapsed ? "w-16" : "w-52"} shrink-0 border-r border-base-200 md:flex flex-col min-h-0 hidden overflow-x-hidden transition-[width] duration-200`}
    >
      <div
        className={`h-16 shrink-0 flex items-center border-b border-base-200 px-3 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        <ConditionalRender cond={!collapsed}>
          <strong className="font-[500] uppercase">Menú</strong>
        </ConditionalRender>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          title={collapsed ? "Expandir menú" : "Contraer menú"}
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setCollapsed((current) => !current)}
        >
          <ToggleIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
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
  );
}
