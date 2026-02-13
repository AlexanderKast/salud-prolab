import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createCrmContactSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;
    const source = searchParams.get("source") || undefined;
    const type = searchParams.get("type") || undefined;
    const assignedToId = searchParams.get("assignedToId") || undefined;
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (source) where.source = source;
    if (type) where.type = type;
    if (assignedToId) where.assignedToId = assignedToId;
    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [data, total] = await Promise.all([
      prisma.crmContact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          distributor: { select: { id: true, companyName: true } },
          _count: { select: { leads: true, deals: true, activities: true } },
        },
      }),
      prisma.crmContact.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/crm/contacts error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createCrmContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.distributorId) {
      const existing = await prisma.crmContact.findUnique({
        where: { distributorId: parsed.data.distributorId },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Este distribuidor ya tiene un contacto CRM asociado" },
          { status: 409 }
        );
      }
    }

    const { customFields, ...restData } = parsed.data;
    const contact = await prisma.crmContact.create({
      data: {
        ...restData,
        ...(customFields !== undefined && { customFields: customFields as Prisma.InputJsonValue }),
        createdById: session!.user!.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        distributor: { select: { id: true, companyName: true } },
        _count: { select: { leads: true, deals: true, activities: true } },
      },
    });

    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/crm/contacts error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe un contacto con esos datos" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
