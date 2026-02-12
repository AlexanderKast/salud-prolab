import { auth } from "@/lib/auth";
import { hasPermission, type Permission, type RoleType } from "@salud-prolab/shared";
import { NextResponse } from "next/server";

export async function requirePermission(permission: Permission) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!hasPermission(session.user.role as RoleType, permission)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  return null;
}

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}
