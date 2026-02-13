import { env } from "@/lib/env";
import { prisma } from "@salud-prolab/database";

const META_API_BASE = "https://graph.facebook.com/v21.0";

interface WhatsAppSendResult {
  messaging_product: string;
  contacts: { wa_id: string }[];
  messages: { id: string }[];
}

async function metaFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    throw new Error(
      "WhatsApp API no configurada (WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID faltante)"
    );
  }

  const url = `${META_API_BASE}/${phoneId}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Meta API error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Send a WhatsApp template message via Meta Cloud API.
 */
export async function sendTemplateMessage(opts: {
  to: string;
  templateName: string;
  templateParams?: Record<string, string>;
  languageCode?: string;
}): Promise<string> {
  const components: Record<string, unknown>[] = [];

  if (opts.templateParams && Object.keys(opts.templateParams).length > 0) {
    components.push({
      type: "body",
      parameters: Object.values(opts.templateParams).map((value) => ({
        type: "text",
        text: value,
      })),
    });
  }

  const result = await metaFetch<WhatsAppSendResult>("/messages", {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "template",
    template: {
      name: opts.templateName,
      language: { code: opts.languageCode || "es" },
      ...(components.length > 0 ? { components } : {}),
    },
  });

  return result.messages[0]?.id || "";
}

/**
 * Send a free-form WhatsApp text message (only within 24h window).
 */
export async function sendTextMessage(opts: { to: string; body: string }): Promise<string> {
  const result = await metaFetch<WhatsAppSendResult>("/messages", {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "text",
    text: { body: opts.body },
  });

  return result.messages[0]?.id || "";
}

/**
 * Fetch approved templates from Meta Business Account.
 */
export async function fetchTemplates(): Promise<
  { name: string; status: string; language: string; category: string }[]
> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const businessId = env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (!token || !businessId) {
    return [];
  }

  const res = await fetch(`${META_API_BASE}/${businessId}/message_templates?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const json = await res.json();
  return (json.data || []).map(
    (t: { name: string; status: string; language: string; category: string }) => ({
      name: t.name,
      status: t.status,
      language: t.language,
      category: t.category,
    })
  );
}

/**
 * Verify webhook token for Meta webhook setup.
 */
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  const verifyToken = env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return challenge;
  }
  return null;
}

/**
 * Validate webhook payload signature from Meta.
 */
export async function validateWebhookSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  const secret = env.WHATSAPP_APP_SECRET;
  if (!secret || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expected = `sha256=${Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  return signature === expected;
}

/**
 * Handle incoming WhatsApp webhook event. Stores incoming messages.
 */
export async function handleIncomingWebhook(payload: {
  entry?: {
    changes?: {
      value?: {
        messages?: {
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }[];
        statuses?: {
          id: string;
          status: string;
          timestamp: string;
        }[];
      };
    }[];
  }[];
}): Promise<void> {
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value) continue;

      // Handle incoming messages
      for (const msg of value.messages || []) {
        const phone = msg.from;

        // Find contact by whatsapp or phone number
        const contact = await prisma.crmContact.findFirst({
          where: {
            OR: [
              { whatsapp: phone },
              { whatsapp: `+${phone}` },
              { phone: phone },
              { phone: `+${phone}` },
            ],
            active: true,
          },
        });

        if (!contact) continue;

        await prisma.crmWhatsAppMessage.create({
          data: {
            contactId: contact.id,
            waMessageId: msg.id,
            direction: "ENTRANTE",
            status: "ENTREGADO",
            body: msg.text?.body || `[${msg.type}]`,
            sentAt: new Date(Number(msg.timestamp) * 1000),
          },
        });
      }

      // Handle status updates
      for (const status of value.statuses || []) {
        const statusMap: Record<string, string> = {
          sent: "ENVIADO",
          delivered: "ENTREGADO",
          read: "LEIDO",
          failed: "FALLIDO",
        };

        const newStatus = statusMap[status.status];
        if (!newStatus) continue;

        await prisma.crmWhatsAppMessage.updateMany({
          where: { waMessageId: status.id },
          data: { status: newStatus as "ENVIADO" | "ENTREGADO" | "LEIDO" | "FALLIDO" },
        });
      }
    }
  }
}
