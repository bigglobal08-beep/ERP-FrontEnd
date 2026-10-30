"use client";

import { BellDot } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import NavMenuItems from "./NavMenuItems";
import UserAvatar from "./UserAvatar";

export default function TopBarNav() {
  return (
    <nav className="navbar bg-base-100 border-b border-base-200">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              aria-label="Menu"
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
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <NavMenuItems />
            <hr className="mt-2 border border-base-200" />
          </ul>
        </div>
      </div>
      <div className="navbar-end px-4 gap-3 items-center">
        <BellDot />
        <UserAvatar />
        <ThemeToggle />
      </div>
    </nav>
  );
}
