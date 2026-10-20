import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "PATIENT" | "THERAPIST" | "ADMIN";

export type SessionUser = {
  id: string;
  name: string;
  role: Role;
};

function isRole(value: unknown): value is Role {
  return (
    value === "PATIENT" ||
    value === "THERAPIST" ||
    value === "ADMIN"
  );
}

// Lazy — build-ի ժամանակ չի throw-ի, միայն runtime-ում
function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export const HOME_BY_ROLE: Record<Role, string> = {
  PATIENT: "/patient/dashboard",
  THERAPIST: "/therapist/dashboard",
  ADMIN: "/admin/dashboard",
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 օր

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getKey());

  (await cookies()).set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey());

    // ✅ Բոլոր դաշտերը ստուգվում են, ոչ թե `as string`
    if (!isRole(payload.role)) return null;
    if (typeof payload.id !== "string") return null;
    if (typeof payload.name !== "string") return null;

    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireRole(role: Role) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(HOME_BY_ROLE[user.role]);
  return user;
}