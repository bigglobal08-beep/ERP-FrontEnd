"use client";

import { BellDot } from "lucide-react";
import type { IMenuItem } from "@/lib/menu/interface";
import ThemeToggle from "../ThemeToggle";
import { NavItem } from "./NavItem";
import NavMenuItems from "./NavMenuItems";
import UserAvatar from "./UserAvatar";

export default function TopBarNav({
  name,
  menu,
}: {
  name: string;
  menu: IMenuItem[];
}) {
  return (
    <nav className="navbar bg-base-100 border-b border-base-200">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            aria-label="Abrir menú"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-56 p-2 shadow"
          >
            <NavMenuItems items={menu} />
            <hr className="my-2 border border-base-200" />
            <NavItem label="Configuración" route="/app" />
          </ul>
        </div>
      </div>
      <div className="navbar-end px-4 gap-3 items-center">
        <BellDot />
        <UserAvatar name={name} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
