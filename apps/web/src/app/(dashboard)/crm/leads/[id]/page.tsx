"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCrmLead, useConvertCrmLead } from "@/hooks/use-crm";
import { ArrowRight, User } from "lucide-react";
import { useState } from "react";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: lead, isLoading } = useCrmLead(id);
  const convertMutation = useConvertCrmLead();
  const [showConvert, setShowConvert] = useState(false);

  if (isLoading) return <div className="p-6">Cargando lead...</div>;
  if (!lead) return <div className="p-6">Lead no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={lead.title} description={`Lead · Score: ${lead.score}/100`} />
        <div className="flex gap-2">
          {!lead.convertedDeal && (
            <Button size="sm" onClick={() => setShowConvert(!showConvert)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Convertir a Negocio
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Información</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Etapa</span>
                <Badge
                  style={{ backgroundColor: `${lead.stage?.color}20`, color: lead.stage?.color }}
                >
                  {lead.stage?.name}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Pipeline</span>
                <span>{lead.pipeline?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Fuente</span>
                <Badge variant="secondary">{lead.source}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Score</span>
                <span className="font-medium">{lead.score}/100</span>
              </div>
              {lead.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Asignado a</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {lead.assignedTo.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold text-sm">Contacto</h3>
            <Link href={`/crm/contactos/${lead.contact?.id}`} className="text-sm hover:underline">
              {lead.contact?.firstName} {lead.contact?.lastName || ""}
            </Link>
            {lead.contact?.email && (
              <p className="text-xs text-[var(--muted-foreground)]">{lead.contact.email}</p>
            )}
          </div>

          {lead.convertedDeal && (
            <div className="rounded-lg border p-4 space-y-2 bg-green-50">
              <h3 className="font-semibold text-sm text-green-700">Convertido</h3>
              <Link
                href={`/crm/deals/${lead.convertedDeal.id}`}
                className="text-sm hover:underline"
              >
                {lead.convertedDeal.title} · $
                {Number(lead.convertedDeal.value).toLocaleString("es-CO")}
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {lead.description && (
            <div className="rounded-lg border p-4 mb-4">
              <h3 className="font-semibold text-sm mb-2">Descripción</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{lead.description}</p>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-sm mb-3">Actividad</h3>
            <div className="space-y-3">
              {!lead.activities || lead.activities.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  Sin actividad registrada
                </p>
              ) : (
                lead.activities.map((activity: Record<string, unknown>) => (
                  <div key={activity.id as string} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                    <div>
                      <p className="font-medium">{activity.subject as string}</p>
                      {Boolean(activity.body) && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {String(activity.body)}
                        </p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {new Date(activity.createdAt as string).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
