import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createCrmActivitySchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const contactId = searchParams.get("contactId") || undefined;
    const leadId = searchParams.get("leadId") || undefined;
    const dealId = searchParams.get("dealId") || undefined;
    const type = searchParams.get("type") || undefined;

    const where: Record<string, unknown> = {};
    if (contactId) where.contactId = contactId;
    if (leadId) where.leadId = leadId;
    if (dealId) where.dealId = dealId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.crmActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          lead: { select: { id: true, title: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
      prisma.crmActivity.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/crm/activities error:", err);
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
    const parsed = createCrmActivitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const activity = await prisma.crmActivity.create({
      data: {
        ...parsed.data,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
        createdById: session!.user!.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        lead: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/activities error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
