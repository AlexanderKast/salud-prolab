import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { z } from "zod";

const importSchema = z
  .object({
    distributorIds: z.array(z.string()).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => data.distributorIds || data.all, {
    message: "Debe especificar distributorIds o all: true",
  });

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { active: true };
    if (parsed.data.distributorIds) {
      where.id = { in: parsed.data.distributorIds };
    }

    // Find distributors that don't already have a CRM contact
    const distributors = await prisma.distributor.findMany({
      where: {
        ...where,
        crmContact: null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (distributors.length === 0) {
      return NextResponse.json({
        data: { imported: 0 },
        message: "No hay distribuidores nuevos para importar",
      });
    }

    const contacts = await prisma.$transaction(
      distributors.map((d) =>
        prisma.crmContact.create({
          data: {
            type: "EMPRESA",
            source: "IMPORTACION",
            firstName: d.companyName,
            companyName: d.companyName,
            phone: d.phone,
            address: d.address,
            city: d.city,
            country: d.country,
            notes: d.notes,
            distributorId: d.id,
            createdById: session!.user!.id,
          },
        })
      )
    );

    return NextResponse.json({ data: { imported: contacts.length, contacts } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/contacts/import error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
