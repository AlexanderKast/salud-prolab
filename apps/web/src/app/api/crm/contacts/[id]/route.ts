import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { updateCrmContactSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { id } = await params;

    const contact = await prisma.crmContact.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        distributor: {
          select: {
            id: true,
            companyName: true,
            taxId: true,
            phone: true,
            city: true,
            country: true,
          },
        },
        leads: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            score: true,
            createdAt: true,
            stage: { select: { id: true, name: true, color: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        deals: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            value: true,
            currency: true,
            createdAt: true,
            stage: { select: { id: true, name: true, color: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            leads: true,
            deals: true,
            activities: true,
            emailRecipients: true,
            whatsappMessages: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: contact });
  } catch (err) {
    console.error("GET /api/crm/contacts/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCrmContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.crmContact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    const { customFields, ...restData } = parsed.data;
    const contact = await prisma.crmContact.update({
      where: { id },
      data: {
        ...restData,
        ...(customFields !== undefined && { customFields: customFields as Prisma.InputJsonValue }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        distributor: { select: { id: true, companyName: true } },
        _count: { select: { leads: true, deals: true, activities: true } },
      },
    });

    return NextResponse.json({ data: contact });
  } catch (err: unknown) {
    console.error("PATCH /api/crm/contacts/[id] error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe un contacto con esos datos" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permError = await requirePermission("crm:delete");
    if (permError) return permError;

    const { id } = await params;

    const existing = await prisma.crmContact.findUnique({
      where: { id },
      include: { _count: { select: { leads: true, deals: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    // Soft delete
    await prisma.crmContact.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Contacto desactivado exitosamente" });
  } catch (err) {
    console.error("DELETE /api/crm/contacts/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
