"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrmCampaigns } from "@/hooks/use-crm";
import { Plus, Mail, Send, Clock, CheckCircle, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  BORRADOR: { label: "Borrador", color: "bg-gray-100 text-gray-700", icon: Mail },
  PROGRAMADA: { label: "Programada", color: "bg-blue-100 text-blue-700", icon: Clock },
  ENVIANDO: { label: "Enviando", color: "bg-yellow-100 text-yellow-700", icon: Send },
  COMPLETADA: { label: "Completada", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function CampanasPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmCampaigns({ page: String(page), limit: "20" });

  const campaigns = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Campañas de Email"
          description="Gestiona tus campañas de email marketing"
        />
        <Link href="/crm/campanas/nueva">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--muted)] rounded animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted-foreground)]">
          No hay campañas. Crea tu primera campaña de email.
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: Record<string, unknown>) => {
            const status = statusConfig[campaign.status as string] || statusConfig.BORRADOR;
            return (
              <Link
                key={campaign.id as string}
                href={`/crm/campanas/${campaign.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-[var(--muted)]/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{campaign.name as string}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {campaign.subject as string} ·{" "}
                    {(campaign._count as Record<string, number>)?.recipients ?? 0} destinatarios
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-[var(--muted-foreground)]">
                    {(campaign.totalSent as number) > 0 && (
                      <p>
                        {campaign.totalSent as number} enviados · {campaign.totalOpened as number}{" "}
                        abiertos
                      </p>
                    )}
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
