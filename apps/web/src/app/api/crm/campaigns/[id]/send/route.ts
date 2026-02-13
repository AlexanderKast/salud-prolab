import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@salud-prolab/database";
import { requirePermission } from "@/lib/rbac";
import { sendCampaignBatch } from "@/lib/crm/resend";
import { env } from "@/lib/env";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permError = await requirePermission("crm:campaigns:send");
    if (permError) return permError;

    const { id } = await params;

    const campaign = await prisma.crmEmailCampaign.findUnique({
      where: { id },
      include: {
        recipients: { where: { status: "PENDIENTE" } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (campaign.status !== "BORRADOR" && campaign.status !== "PROGRAMADA") {
      return NextResponse.json(
        { error: "Esta campaña ya fue enviada o está en proceso" },
        { status: 400 }
      );
    }

    if (campaign.recipients.length === 0) {
      return NextResponse.json(
        { error: "La campaña no tiene destinatarios pendientes" },
        { status: 400 }
      );
    }

    // Update status to sending
    await prisma.crmEmailCampaign.update({
      where: { id },
      data: {
        status: "ENVIANDO",
        sentAt: new Date(),
      },
    });

    if (!env.RESEND_API_KEY) {
      // Fallback: mark as sent without actually sending (dev mode)
      await prisma.crmEmailRecipient.updateMany({
        where: { campaignId: id, status: "PENDIENTE" },
        data: { status: "ENVIADO", sentAt: new Date() },
      });

      await prisma.crmEmailCampaign.update({
        where: { id },
        data: {
          status: "COMPLETADA",
          totalSent: campaign.recipients.length,
        },
      });

      return NextResponse.json({
        data: { sent: campaign.recipients.length, failed: 0 },
        message: "Campaña completada (modo desarrollo - sin Resend API key)",
      });
    }

    // Send via Resend API
    const result = await sendCampaignBatch(id);

    return NextResponse.json({
      data: result,
      message: `Campaña enviada: ${result.sent} exitosos, ${result.failed} fallidos`,
    });
  } catch (err) {
    console.error("POST /api/crm/campaigns/[id]/send error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
