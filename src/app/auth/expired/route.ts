import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/session";

// La API respondió 401: se borra la cookie para que el proxy no regrese a /app
export async function GET() {
  await clearSessionCookie();
  redirect("/auth?expired=1");
}
