import { jwtVerify, SignJWT } from "jose";

// Signed session token stored in an httpOnly cookie. Pure jose, so it runs in
// both the proxy and server code.
export const SESSION_COOKIE = "inkwell_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export function createSessionToken(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

// Returns the session, or null for a missing, expired, forged or misconfigured token.
export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}
