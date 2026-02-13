"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrmWhatsAppMessages, useSendCrmWhatsApp, useCrmContact } from "@/hooks/use-crm";
import { Send, Check, CheckCheck, Clock } from "lucide-react";

export default function WhatsAppConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = use(params);
  const { data: contact } = useCrmContact(contactId);
  const { data: messagesData, isLoading } = useCrmWhatsAppMessages(contactId);
  const sendMessage = useSendCrmWhatsApp();
  const [body, setBody] = useState("");

  const messages = messagesData ?? [];

  const handleSend = async () => {
    if (!body.trim()) return;
    await sendMessage.mutateAsync({ contactId, body });
    setBody("");
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "ENVIADO":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "ENTREGADO":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "LEIDO":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <PageHeader
        title={contact ? `${contact.firstName} ${contact.lastName || ""}` : "Conversación"}
        description={contact?.whatsapp || contact?.phone || "WhatsApp"}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-[var(--muted-foreground)]">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[var(--muted-foreground)] py-8">
            No hay mensajes aún. Envía el primero.
          </div>
        ) : (
          messages.map((msg: Record<string, unknown>) => (
            <div
              key={msg.id as string}
              className={`max-w-[70%] ${msg.direction === "SALIENTE" ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`rounded-lg p-3 text-sm ${
                  msg.direction === "SALIENTE" ? "bg-green-100 text-green-900" : "bg-[var(--muted)]"
                }`}
              >
                {Boolean(msg.templateName) && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    Plantilla: {String(msg.templateName)}
                  </p>
                )}
                <p>{(msg.body as string) || `[Plantilla: ${String(msg.templateName)}]`}</p>
              </div>
              <div
                className={`flex items-center gap-1 mt-1 text-xs text-[var(--muted-foreground)] ${
                  msg.direction === "SALIENTE" ? "justify-end" : ""
                }`}
              >
                <span>
                  {new Date(msg.createdAt as string).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.direction === "SALIENTE" && statusIcon(msg.status as string)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-3 flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <Button onClick={handleSend} disabled={sendMessage.isPending || !body.trim()} size="sm">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
