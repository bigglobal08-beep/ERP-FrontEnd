export type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Normaliza los searchParams de las listas (el backend acepta limit hasta 100)
export function parseListParams(params: RawSearchParams) {
  const page = Math.max(Number(first(params.page)) || 1, 1);
  const limit = Math.min(Math.max(Number(first(params.limit)) || 20, 1), 100);
  const search = (first(params.search) ?? "").trim().slice(0, 100);
  const rawActive = first(params.active);
  const active = rawActive === "true" ? true : rawActive === "false" ? false : undefined;
  const rawId = first(params.id);
  const id = rawId && rawId !== "null" ? rawId : null;
  const view = first(params.view) === "table" ? "table" : "cards";
  return { page, limit, search, active, id, view } as const;
}
