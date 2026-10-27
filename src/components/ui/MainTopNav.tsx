"use client";

import ThemeToggle from "./ThemeToggle";

export default function MainTopNav() {
  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start"></div>
      <div className="navbar-end">
        <ThemeToggle />
      </div>
    </nav>
  );
}
