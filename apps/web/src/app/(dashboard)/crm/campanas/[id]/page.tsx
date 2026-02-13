"use client";

import { use } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { useCrmCampaign, useSendCrmCampaign } from "@/hooks/use-crm";
import { Send, Mail, Eye, MousePointer, AlertTriangle } from "lucide-react";

export default function CampanaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useCrmCampaign(id);
  const sendMutation = useSendCrmCampaign();

  if (isLoading) return <div className="p-6">Cargando campaña...</div>;
  if (!campaign) return <div className="p-6">Campaña no encontrada</div>;

  const canSend = campaign.status === "BORRADOR" || campaign.status === "PROGRAMADA";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={campaign.name} description={campaign.subject} />
        {canSend && (
          <Button
            size="sm"
            onClick={() => sendMutation.mutate(id)}
            disabled={sendMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendMutation.isPending ? "Enviando..." : "Enviar Campaña"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Enviados" value={campaign.totalSent} icon={Mail} />
        <StatCard label="Entregados" value={campaign.totalDelivered} icon={Mail} />
        <StatCard label="Abiertos" value={campaign.totalOpened} icon={Eye} />
        <StatCard label="Clicks" value={campaign.totalClicked} icon={MousePointer} />
      </div>

      {campaign.totalBounced > 0 && (
        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          {campaign.totalBounced} emails rebotados
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-3">
          Destinatarios ({campaign.recipients?.length ?? 0})
        </h3>
        <div className="space-y-2">
          {campaign.recipients?.map((r: Record<string, unknown>) => (
            <div
              key={r.id as string}
              className="flex items-center justify-between text-sm py-1 border-b last:border-0"
            >
              <div>
                <span className="font-medium">{(r.name as string) || (r.email as string)}</span>
                <span className="ml-2 text-[var(--muted-foreground)]">{r.email as string}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {r.status as string}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
