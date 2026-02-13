"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useCrmWhatsAppMessages } from "@/hooks/use-crm";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function WhatsAppPage() {
  const { data: contacts, isLoading } = useCrmWhatsAppMessages("");

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp" description="Bandeja de mensajes de WhatsApp Business" />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--muted)] rounded animate-pulse" />
          ))}
        </div>
      ) : !contacts || contacts.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted-foreground)]">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p>No hay conversaciones de WhatsApp aún</p>
          <p className="text-sm mt-1">Envía un mensaje desde un contacto para iniciar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact: Record<string, unknown>) => {
            const lastMsg = (contact.whatsappMessages as Array<Record<string, unknown>>)?.[0];
            return (
              <Link
                key={contact.id as string}
                href={`/crm/whatsapp/${contact.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-[var(--muted)]/30 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {contact.firstName as string} {(contact.lastName as string) || ""}
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {lastMsg.direction === "SALIENTE" ? "Tú: " : ""}
                      {(lastMsg.body as string) || (lastMsg.templateName as string) || "Mensaje"}
                    </p>
                  )}
                </div>
                {lastMsg && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(lastMsg.createdAt as string).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
