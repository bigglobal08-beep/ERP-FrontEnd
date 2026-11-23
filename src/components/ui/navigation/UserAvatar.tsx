"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth-actions";

export default function UserAvatar({ name }: { name: string }) {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="flex cursor-pointer items-center gap-2">
        <div className="avatar avatar-placeholder">
          <div className="bg-primary/15 text-primary w-8 rounded-full">
            <span className="text-sm font-semibold">{name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <span className="hidden max-w-32 truncate font-semibold sm:inline">{name}</span>
      </div>
      <ul
        tabIndex={-1}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-44 p-2 shadow"
      >
        <li>
          <Link href="/app/profile">
            <UserRound className="size-4" />
            Perfil
          </Link>
        </li>
        <li>
          <form action={logout} className="contents">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
}
