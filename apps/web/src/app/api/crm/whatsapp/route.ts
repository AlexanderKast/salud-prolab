import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { sendCrmWhatsAppSchema } from "@salud-prolab/shared";
import { sendTemplateMessage, sendTextMessage } from "@/lib/crm/whatsapp";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:whatsapp:read");
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    if (!contactId) {
      // Return contacts with recent messages for inbox view
      const contacts = await prisma.crmContact.findMany({
        where: {
          active: true,
          whatsappMessages: { some: {} },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          whatsapp: true,
          companyName: true,
          whatsappMessages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              body: true,
              templateName: true,
              direction: true,
              createdAt: true,
              status: true,
            },
          },
          _count: { select: { whatsappMessages: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      });

      return NextResponse.json({ data: contacts });
    }

    // Return conversation for a specific contact
    const [data, total] = await Promise.all([
      prisma.crmWhatsAppMessage.findMany({
        where: { contactId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.crmWhatsAppMessage.count({ where: { contactId } }),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/crm/whatsapp error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permError = await requirePermission("crm:whatsapp:send");
    if (permError) return permError;

    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = sendCrmWhatsAppSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const contact = await prisma.crmContact.findUnique({
      where: { id: parsed.data.contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    const phoneNumber = contact.whatsapp || contact.phone;
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "El contacto no tiene número de WhatsApp o teléfono" },
        { status: 400 }
      );
    }

    let waMessageId: string | undefined;

    // Try sending via Meta Cloud API if configured
    if (env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        if (parsed.data.templateName) {
          waMessageId = await sendTemplateMessage({
            to: phoneNumber.replace(/[^0-9]/g, ""),
            templateName: parsed.data.templateName,
            templateParams: parsed.data.templateParams,
          });
        } else if (parsed.data.body) {
          waMessageId = await sendTextMessage({
            to: phoneNumber.replace(/[^0-9]/g, ""),
            body: parsed.data.body,
          });
        }
      } catch (apiErr) {
        console.error("WhatsApp API send error:", apiErr);
        return NextResponse.json({ error: "Error al enviar mensaje de WhatsApp" }, { status: 502 });
      }
    }

    // Store message record
    const message = await prisma.crmWhatsAppMessage.create({
      data: {
        contactId: parsed.data.contactId,
        direction: "SALIENTE",
        status: waMessageId ? "ENVIADO" : "PENDIENTE",
        waMessageId,
        templateName: parsed.data.templateName,
        templateParams: parsed.data.templateParams,
        body: parsed.data.body,
        sentAt: new Date(),
        createdById: session!.user!.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/whatsapp error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
