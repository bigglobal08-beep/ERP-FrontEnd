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
      <Link href={route} className={`font-semibold ${isActive ? "menu-active" : ""}`}>
        {icon}
        <span className="min-w-0 break-words">{label}</span>
      </Link>
    </li>
  );
}
