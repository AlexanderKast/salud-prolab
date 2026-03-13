"use client";

import { useState } from "react";
import { useConversations, useCreateConversation, useUpdateConversation } from "@/hooks/use-ghl";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  ABIERTA: "bg-green-100 text-green-800",
  EN_ESPERA: "bg-yellow-100 text-yellow-800",
  CERRADA: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  ABIERTA: "Abierta",
  EN_ESPERA: "En espera",
  CERRADA: "Cerrada",
};

const channelLabels: Record<string, string> = {
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  CHAT: "Chat",
  INTERNO: "Interno",
};

export default function ConversacionesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useConversations(Object.keys(filters).length ? filters : undefined);
  const items = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Conversaciones</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Inbox unificado de conversaciones
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "ABIERTA", "EN_ESPERA", "CERRADA"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s ? statusLabels[s] : "Todas"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="mt-4 text-lg font-medium">Sin conversaciones</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Las conversaciones aparecer&aacute;n aqu&iacute; cuando se creen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((conv: any) => (
            <div
              key={conv.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
                  <MessageCircle className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--foreground)]">
                      {conv.contact?.firstName} {conv.contact?.lastName}
                    </p>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {channelLabels[conv.channel] || conv.channel}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {conv.subject || "Sin asunto"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {conv._count?.messages || 0} mensajes
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[conv.status] || ""}`}
                >
                  {statusLabels[conv.status] || conv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
