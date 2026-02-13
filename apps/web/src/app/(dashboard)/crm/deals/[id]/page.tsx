"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { useCrmDeal } from "@/hooks/use-crm";
import { User, DollarSign, Calendar, ShoppingCart } from "lucide-react";

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: deal, isLoading } = useCrmDeal(id);

  if (isLoading) return <div className="p-6">Cargando negocio...</div>;
  if (!deal) return <div className="p-6">Negocio no encontrado</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.title}
        description={`Negocio · $${Number(deal.value).toLocaleString("es-CO")} ${deal.currency}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Información</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Etapa</span>
                <Badge
                  style={{ backgroundColor: `${deal.stage?.color}20`, color: deal.stage?.color }}
                >
                  {deal.stage?.name}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Valor</span>
                <span className="flex items-center gap-1 font-medium text-green-600">
                  <DollarSign className="h-3 w-3" />
                  {Number(deal.value).toLocaleString("es-CO")} {deal.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Probabilidad</span>
                <span>{deal.probability}%</span>
              </div>
              {deal.expectedCloseDate && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Cierre esperado</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(deal.expectedCloseDate).toLocaleDateString("es-CO")}
                  </span>
                </div>
              )}
              {deal.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Asignado a</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {deal.assignedTo.name}
                  </span>
                </div>
              )}
              {deal.lostReason && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-red-500">Razón: {deal.lostReason}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold text-sm">Contacto</h3>
            <Link href={`/crm/contactos/${deal.contact?.id}`} className="text-sm hover:underline">
              {deal.contact?.firstName} {deal.contact?.lastName || ""}
            </Link>
            {deal.contact?.companyName && (
              <p className="text-xs text-[var(--muted-foreground)]">{deal.contact.companyName}</p>
            )}
          </div>

          {deal.order && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Pedido Vinculado
              </h3>
              <p className="text-sm">#{deal.order.orderNumber}</p>
              <Badge variant="secondary">{deal.order.status}</Badge>
            </div>
          )}

          {deal.fromLead && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-sm">Origen</h3>
              <Link href={`/crm/leads/${deal.fromLead.id}`} className="text-sm hover:underline">
                Lead: {deal.fromLead.title}
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {deal.description && (
            <div className="rounded-lg border p-4 mb-4">
              <h3 className="font-semibold text-sm mb-2">Descripción</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{deal.description}</p>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-sm mb-3">Actividad</h3>
            <div className="space-y-3">
              {!deal.activities || deal.activities.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  Sin actividad registrada
                </p>
              ) : (
                deal.activities.map((activity: Record<string, unknown>) => (
                  <div key={activity.id as string} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                    <div>
                      <p className="font-medium">{activity.subject as string}</p>
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
