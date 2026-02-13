import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { createCrmCampaignSchema } from "@salud-prolab/shared";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:campaigns:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.crmEmailCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { recipients: true } },
        },
      }),
      prisma.crmEmailCampaign.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/crm/campaigns error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:campaigns:write");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = createCrmCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientContactIds, ...campaignData } = parsed.data;

    // Get contacts with emails
    const contacts = await prisma.crmContact.findMany({
      where: { id: { in: recipientContactIds }, active: true, email: { not: null } },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const validContacts = contacts.filter((c) => c.email);

    if (validContacts.length === 0) {
      return NextResponse.json(
        { error: "Ningún contacto seleccionado tiene email válido" },
        { status: 400 }
      );
    }

    const campaign = await prisma.crmEmailCampaign.create({
      data: {
        ...campaignData,
        scheduledAt: campaignData.scheduledAt ? new Date(campaignData.scheduledAt) : undefined,
        createdById: session!.user!.id,
        totalRecipients: validContacts.length,
        recipients: {
          create: validContacts.map((c) => ({
            contactId: c.id,
            email: c.email!,
            name: [c.firstName, c.lastName].filter(Boolean).join(" "),
          })),
        },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
    });

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/campaigns error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
