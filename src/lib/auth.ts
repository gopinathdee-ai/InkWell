import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } from "./session";

// Every Admin page, Server Action and route handler calls this first.
// It checks the signed session itself, not only the proxy.
export async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) redirect("/admin/login");
  return session;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

// Single admin account from env vars. Returns the admin email on success.
export async function checkAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return { ok: false as const, configured: false as const };
  // Always run bcrypt so a wrong email takes as long as a wrong password.
  const passwordMatches = await bcrypt.compare(password, hash);
  const ok = email.trim().toLowerCase() === adminEmail && passwordMatches && password !== "";
  return ok
    ? { ok: true as const, email: adminEmail, configured: true as const }
    : { ok: false as const, configured: true as const };
}
