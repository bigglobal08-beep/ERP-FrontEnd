"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItemProps = {
  label: string;
  icon?: ReactNode;
  route: string;
};

export function NavItem({ label, icon, route = "#" }: NavItemProps) {
  const pathname = usePathname();
  const path = route.split("?")[0];
  const isActive = path === "/app" ? pathname === path : pathname.startsWith(path);

  return (
    <li>
      {/* title: con el menú contraído es el único texto visible del enlace */}
      <Link
        href={route}
        title={label}
        className={`font-semibold in-data-[collapsed=true]:justify-center ${isActive ? "menu-active" : ""}`}
      >
        {icon}
        <span className="min-w-0 break-words in-data-[collapsed=true]:hidden">{label}</span>
      </Link>
    </li>
  );
}
