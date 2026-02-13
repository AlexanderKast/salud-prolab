"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCrmContact, useCrmActivities, useCreateCrmActivity } from "@/hooks/use-crm";
import {
  Building,
  User,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  UserPlus,
  Handshake,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: contact, isLoading } = useCrmContact(id);
  const { data: activitiesData } = useCrmActivities({ contactId: id, limit: "10" });
  const createActivity = useCreateCrmActivity();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activitySubject, setActivitySubject] = useState("");
  const [activityBody, setActivityBody] = useState("");

  if (isLoading) {
    return <div className="p-6">Cargando contacto...</div>;
  }

  if (!contact) {
    return <div className="p-6">Contacto no encontrado</div>;
  }

  const activities = activitiesData?.data ?? [];

  const handleAddActivity = async () => {
    if (!activitySubject.trim()) return;
    await createActivity.mutateAsync({
      type: "NOTA",
      subject: activitySubject,
      body: activityBody || undefined,
      contactId: id,
    });
    setActivitySubject("");
    setActivityBody("");
    setShowActivityForm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName || ""}`}
        description={contact.companyName || "Contacto CRM"}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Información</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {contact.type === "EMPRESA" ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <Badge variant="secondary">{contact.type}</Badge>
                <Badge variant="outline">{contact.source}</Badge>
              </div>
              {contact.email && (
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Mail className="h-4 w-4" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Phone className="h-4 w-4" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.whatsapp && (
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <MessageCircle className="h-4 w-4" />
                  <span>{contact.whatsapp}</span>
                </div>
              )}
              {(contact.city || contact.country) && (
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <MapPin className="h-4 w-4" />
                  <span>{[contact.city, contact.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
            {contact.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-[var(--muted-foreground)]">{contact.notes}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold text-sm">Resumen</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 rounded bg-[var(--muted)]">
                <p className="text-lg font-bold">{contact._count?.leads ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Leads</p>
              </div>
              <div className="text-center p-2 rounded bg-[var(--muted)]">
                <p className="text-lg font-bold">{contact._count?.deals ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Negocios</p>
              </div>
            </div>
          </div>

          {contact.distributor && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-sm">Distribuidor Vinculado</h3>
              <p className="text-sm">{contact.distributor.companyName}</p>
            </div>
          )}
        </div>

        {/* Main content: leads, deals, activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leads */}
          {contact.leads && contact.leads.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Leads
              </h3>
              <div className="space-y-2">
                {contact.leads.map((lead: Record<string, unknown>) => (
                  <Link
                    key={lead.id as string}
                    href={`/crm/leads/${lead.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className="text-sm">{lead.title as string}</span>
                    <Badge
                      style={{
                        backgroundColor: `${(lead.stage as Record<string, string>)?.color}20`,
                        color: (lead.stage as Record<string, string>)?.color,
                      }}
                    >
                      {(lead.stage as Record<string, string>)?.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Deals */}
          {contact.deals && contact.deals.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Handshake className="h-4 w-4" /> Negocios
              </h3>
              <div className="space-y-2">
                {contact.deals.map((deal: Record<string, unknown>) => (
                  <Link
                    key={deal.id as string}
                    href={`/crm/deals/${deal.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--muted)] transition-colors"
                  >
                    <div>
                      <span className="text-sm">{deal.title as string}</span>
                      <span className="ml-2 text-sm font-medium">
                        ${Number(deal.value).toLocaleString("es-CO")} {deal.currency as string}
                      </span>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: `${(deal.stage as Record<string, string>)?.color}20`,
                        color: (deal.stage as Record<string, string>)?.color,
                      }}
                    >
                      {(deal.stage as Record<string, string>)?.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" /> Actividad
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowActivityForm(!showActivityForm)}
              >
                <Plus className="mr-1 h-3 w-3" /> Agregar Nota
              </Button>
            </div>

            {showActivityForm && (
              <div className="mb-4 p-3 rounded border space-y-2">
                <Input
                  placeholder="Asunto de la nota..."
                  value={activitySubject}
                  onChange={(e) => setActivitySubject(e.target.value)}
                />
                <Textarea
                  placeholder="Detalles (opcional)..."
                  value={activityBody}
                  onChange={(e) => setActivityBody(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddActivity}
                    disabled={createActivity.isPending || !activitySubject.trim()}
                  >
                    Guardar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowActivityForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">
                  Sin actividad registrada
                </p>
              ) : (
                activities.map((activity: Record<string, unknown>) => (
                  <div key={activity.id as string} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.subject as string}</p>
                      {Boolean(activity.body) && (
                        <p className="text-[var(--muted-foreground)] text-xs mt-1">
                          {String(activity.body)}
                        </p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {new Date(activity.createdAt as string).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {(activity.createdBy as Record<string, string>)?.name}
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
