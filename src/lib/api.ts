import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import type {
  ActionResponse,
  ApiFieldError,
  ApiResponse,
  ListArgs,
} from "./definitions";
import { SESSION_COOKIE } from "./sessionCookie";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: ApiFieldError[],
  ) {
    super(message);
  }
}

type RequestOptions = {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  // Solo el login se llama sin sesión
  auth?: boolean;
};

export async function apiRequest<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  { body, query, auth = true }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  // Va antes de validar la URL: leer cookies evita que el build prerenderice datos de sesión
  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) redirect("/auth");
    headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new ApiError(500, "La API no está configurada.");

  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "No se pudo conectar con el servidor.");
  }

  // Un Server Component no puede borrar cookies: lo hace este route handler
  if (auth && response.status === 401) redirect("/auth/expired");

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !payload) {
    throw new ApiError(
      response.status,
      payload?.message ?? "Ocurrió un error inesperado.",
      payload?.error,
    );
  }
  return payload;
}

// Convierte la llamada en ActionResponse y revalida las rutas si tuvo éxito
export async function runAction<T>(
  task: () => Promise<ApiResponse<T>>,
  revalidate?: { path: string; type?: "layout" | "page" },
): Promise<ActionResponse<T>> {
  try {
    const { status, message, data, total, page, limit, dataExtra } = await task();
    if (revalidate) revalidatePath(revalidate.path, revalidate.type);
    return { success: true, status, message, data, total, page, limit, dataExtra };
  } catch (error) {
    // Deja pasar el redirect de sesión expirada
    unstable_rethrow(error);
    if (error instanceof ApiError) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    return { success: false, status: 500, message: "Ocurrió un error inesperado." };
  }
}

export const listQuery = ({ page, limit, search, active }: ListArgs = {}) => ({
  page,
  limit,
  search,
  active,
});

export const pathId = (id: string) => encodeURIComponent(id);
