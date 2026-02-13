import { env } from "@/lib/env";
import { prisma } from "@salud-prolab/database";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

interface ResendResponse {
  id: string;
}

async function resendFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no configurada");

  const res = await fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend API error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json() as Promise<T>;
}

export async function sendEmail(opts: SendEmailOptions): Promise<string> {
  const result = await resendFetch<ResendResponse>("/emails", {
    from: opts.from || env.RESEND_FROM_EMAIL,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
    reply_to: opts.replyTo,
    tags: opts.tags,
  });

  return result.id;
}

/**
 * Sends a campaign in batches of 50 emails.
 * Updates recipient records with Resend IDs and status.
 */
export async function sendCampaignBatch(campaignId: string): Promise<{
  sent: number;
  failed: number;
}> {
  const campaign = await prisma.crmEmailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      recipients: {
        where: { status: "PENDIENTE" },
        include: {
          contact: { select: { email: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!campaign) throw new Error("Campaña no encontrada");

  let sent = 0;
  let failed = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < campaign.recipients.length; i += BATCH_SIZE) {
    const batch = campaign.recipients.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (recipient) => {
        const email = recipient.contact?.email;
        if (!email) {
          await prisma.crmEmailRecipient.update({
            where: { id: recipient.id },
            data: { status: "FALLIDO" },
          });
          throw new Error("Sin email");
        }

        const html = campaign.body
          .replace(/\{\{nombre\}\}/gi, recipient.contact?.firstName || "")
          .replace(/\{\{apellido\}\}/gi, recipient.contact?.lastName || "");

        const resendId = await sendEmail({
          to: email,
          subject: campaign.subject,
          html,
          from: campaign.fromName ? `${campaign.fromName} <${env.RESEND_FROM_EMAIL}>` : undefined,
          replyTo: campaign.replyTo || undefined,
          tags: [
            { name: "campaign_id", value: campaignId },
            { name: "recipient_id", value: recipient.id },
          ],
        });

        await prisma.crmEmailRecipient.update({
          where: { id: recipient.id },
          data: {
            resendId,
            status: "ENVIADO",
            sentAt: new Date(),
          },
        });

        return resendId;
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
      }
    }
  }

  // Update campaign stats
  await prisma.crmEmailCampaign.update({
    where: { id: campaignId },
    data: {
      status: failed === campaign.recipients.length ? "CANCELADA" : "COMPLETADA",
      totalSent: sent,
    },
  });

  return { sent, failed };
}

/**
 * Handles Resend webhook events (delivered, opened, clicked, bounced, complained).
 */
export async function handleResendWebhook(event: {
  type: string;
  data: {
    email_id?: string;
    tags?: { name: string; value: string }[];
  };
}): Promise<void> {
  const recipientIdTag = event.data.tags?.find((t) => t.name === "recipient_id");
  if (!recipientIdTag) return;

  const recipientId = recipientIdTag.value;
  const now = new Date();

  switch (event.type) {
    case "email.delivered":
      await prisma.crmEmailRecipient.update({
        where: { id: recipientId },
        data: { status: "ENTREGADO", deliveredAt: now },
      });
      break;

    case "email.opened":
      await prisma.crmEmailRecipient.update({
        where: { id: recipientId },
        data: { openedAt: now },
      });
      // Increment campaign open count
      const openRecipient = await prisma.crmEmailRecipient.findUnique({
        where: { id: recipientId },
        select: { campaignId: true },
      });
      if (openRecipient) {
        await prisma.crmEmailCampaign.update({
          where: { id: openRecipient.campaignId },
          data: { totalOpened: { increment: 1 } },
        });
      }
      break;

    case "email.clicked":
      await prisma.crmEmailRecipient.update({
        where: { id: recipientId },
        data: { clickedAt: now },
      });
      const clickRecipient = await prisma.crmEmailRecipient.findUnique({
        where: { id: recipientId },
        select: { campaignId: true },
      });
      if (clickRecipient) {
        await prisma.crmEmailCampaign.update({
          where: { id: clickRecipient.campaignId },
          data: { totalClicked: { increment: 1 } },
        });
      }
      break;

    case "email.bounced":
      await prisma.crmEmailRecipient.update({
        where: { id: recipientId },
        data: { status: "REBOTADO", bouncedAt: now },
      });
      const bounceRecipient = await prisma.crmEmailRecipient.findUnique({
        where: { id: recipientId },
        select: { campaignId: true },
      });
      if (bounceRecipient) {
        await prisma.crmEmailCampaign.update({
          where: { id: bounceRecipient.campaignId },
          data: { totalBounced: { increment: 1 } },
        });
      }
      break;

    case "email.complained":
      await prisma.crmEmailRecipient.update({
        where: { id: recipientId },
        data: { status: "FALLIDO" },
      });
      break;
  }
}
