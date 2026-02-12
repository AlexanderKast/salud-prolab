import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateTemplateSchema } from "@salud-prolab/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: template });
  } catch (err) {
    console.error("GET /api/marketing/templates/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("marketing:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }

    const template = await prisma.template.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: template });
  } catch (err: unknown) {
    console.error("PATCH /api/marketing/templates/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un template con ese slug" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("marketing:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }

    await prisma.template.delete({ where: { id } });

    return NextResponse.json({ message: "Template eliminado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/marketing/templates/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
