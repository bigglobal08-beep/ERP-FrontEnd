"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"corporate" | "dracula">("corporate");

  const toggleTheme = () => {
    const nextTheme = theme === "corporate" ? "dracula" : "corporate";

    document.documentElement.setAttribute("data-theme", nextTheme);

    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-circle"
      onClick={toggleTheme}
    >
      {theme === "corporate" ? <Moon /> : <Sun />}
    </button>
  );
}
