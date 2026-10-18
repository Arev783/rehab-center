"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HOME_BY_ROLE, createSession, deleteSession } from "@/lib/session";

export async function login(_prev: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  const ok =
    !!user && user.isActive && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !ok) return "Սխալ email կամ գաղտնաբառ";

  await createSession({ id: user.id, name: user.name, role: user.role });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
  });
  redirect(HOME_BY_ROLE[user.role]);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}