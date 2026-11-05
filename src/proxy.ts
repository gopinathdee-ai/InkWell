import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Optimistic check only: reads and verifies the cookie, no database calls.
// Each Admin page still calls requireAdmin() itself.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const signedIn = token ? (await verifySessionToken(token)) !== null : false;

  if (pathname === "/admin/login") {
    return signedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!signedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
