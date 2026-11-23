"use server";

import { redirect } from "next/navigation";
import { apiRequest, runAction } from "@/lib/api";
import type { IAdmin } from "@/lib/auth/interface";
import type { ActionResponse } from "@/lib/definitions";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<ActionResponse> {
  const res = await runAction(() =>
    apiRequest<{ token: string; admin: IAdmin }>("POST", "/admin/auth/login", {
      body: { email: credentials.email, password: credentials.password },
      auth: false,
    }),
  );
  if (!res.success || !res.data?.token) {
    return { ...res, success: false, data: undefined };
  }

  await setSessionCookie(res.data.token);
  // El token no regresa al navegador
  return { success: true, status: res.status, message: res.message };
}

export async function logout() {
  await clearSessionCookie();
  redirect("/auth");
}

export async function changeOwnPassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return runAction(() =>
    apiRequest<null>("PATCH", "/admin/auth/me/password", {
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    }),
  );
}
