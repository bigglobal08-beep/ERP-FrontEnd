import { cookies } from "next/headers";
import { cache } from "react";
import { apiRequest } from "./api";
import type { IAdmin } from "./auth/interface";
import { SESSION_COOKIE } from "./sessionCookie";

const FALLBACK_MAX_AGE = 8 * 60 * 60;

// La cookie dura lo mismo que el token. No se valida la firma: eso lo hace el backend
function tokenMaxAge(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    const seconds = Math.floor((payload.exp ?? 0) - Date.now() / 1000);
    return seconds > 0 ? seconds : FALLBACK_MAX_AGE;
  } catch {
    return FALLBACK_MAX_AGE;
  }
}

export async function setSessionCookie(token: string) {
  const isLocal = (process.env.BASE_DOMAIN ?? "localhost") === "localhost";
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !isLocal,
    path: "/",
    maxAge: tokenMaxAge(token),
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

// Lee /me una sola vez por render; así los permisos siempre están al día
export const getCurrentAdmin = cache(async () => {
  const { data } = await apiRequest<IAdmin>("GET", "/admin/auth/me");
  return data;
});
