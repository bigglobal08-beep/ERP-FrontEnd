"use client";

import Link from "next/link";
import { ReactNode } from "react";

type NavItemProps = {
  label: string;
  icon?: ReactNode;
  route: string;
};

export function NavItem({ label, icon, route = "#" }: NavItemProps) {
  return (
    <li>
      <div className="flex items-end">
        {icon}
        <Link href={route} className="font-semibold">
          {label}
        </Link>
      </div>
    </li>
  );
}
