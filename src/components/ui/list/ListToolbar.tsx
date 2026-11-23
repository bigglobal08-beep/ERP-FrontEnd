"use client";

import { LayoutGrid, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConditionalRender from "../ConditionalRender";

type ListToolbarProps = {
  createHref?: string;
  createLabel?: string;
  // Solo empresas tiene vista de tarjetas y de tabla
  showViewToggle?: boolean;
};

export default function ListToolbar({
  createHref,
  createLabel = "Nueva",
  showViewToggle = false,
}: ListToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "table" ? "table" : "cards";

  // Cualquier filtro nuevo regresa a la primera página
  const update = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <ConditionalRender cond={showViewToggle}>
        <div className="join">
          <button
            type="button"
            aria-label="Ver como tarjetas"
            aria-pressed={view === "cards"}
            className={`btn btn-sm btn-square join-item ${view === "cards" ? "btn-active" : ""}`}
            onClick={() => update({ view: "cards" })}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Ver como tabla"
            aria-pressed={view === "table"}
            className={`btn btn-sm btn-square join-item ${view === "table" ? "btn-active" : ""}`}
            onClick={() => update({ view: "table" })}
          >
            <List className="size-4" />
          </button>
        </div>
      </ConditionalRender>

      <select
        aria-label="Filtrar por estatus"
        className="select select-sm w-32"
        value={searchParams.get("active") ?? ""}
        onChange={(e) => update({ active: e.target.value })}
      >
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>

      <form
        className="min-w-40 flex-1"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("search");
          update({ search: String(value ?? "").trim() });
        }}
      >
        <label className="input input-sm w-full rounded-full">
          <Search className="size-4 opacity-60" aria-hidden="true" />
          <input
            key={searchParams.get("search") ?? ""}
            name="search"
            type="search"
            maxLength={100}
            placeholder="BUSCAR..."
            defaultValue={searchParams.get("search") ?? ""}
          />
        </label>
      </form>

      <ConditionalRender cond={!!createHref}>
        <Link href={createHref ?? "#"} className="btn btn-neutral btn-sm" aria-label={createLabel}>
          <span className="hidden sm:inline">{createLabel}</span>
          <Plus className="size-4" />
        </Link>
      </ConditionalRender>
    </div>
  );
}
