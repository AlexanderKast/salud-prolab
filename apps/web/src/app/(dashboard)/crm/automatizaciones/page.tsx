"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrmAutomations, useDeleteCrmAutomation, useUpdateCrmAutomation } from "@/hooks/use-crm";
import { Plus, Zap, Trash2 } from "lucide-react";
import Link from "next/link";

const triggerLabels: Record<string, string> = {
  LEAD_CREADO: "Lead creado",
  LEAD_ETAPA_CAMBIADA: "Lead cambió de etapa",
  DEAL_CREADO: "Negocio creado",
  DEAL_ETAPA_CAMBIADA: "Negocio cambió de etapa",
  DEAL_GANADO: "Negocio ganado",
  DEAL_PERDIDO: "Negocio perdido",
  CONTACTO_CREADO: "Contacto creado",
  ACTIVIDAD_CREADA: "Actividad creada",
};

const actionLabels: Record<string, string> = {
  ENVIAR_EMAIL: "Enviar email",
  ENVIAR_WHATSAPP: "Enviar WhatsApp",
  CREAR_ACTIVIDAD: "Crear actividad",
  MOVER_ETAPA: "Mover a etapa",
  ASIGNAR_USUARIO: "Asignar usuario",
  NOTIFICAR: "Notificar",
};

export default function AutomatizacionesPage() {
  const { data, isLoading } = useCrmAutomations();
  const deleteMutation = useDeleteCrmAutomation();
  const updateMutation = useUpdateCrmAutomation();

  const automations = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Automatizaciones" description="Reglas de automatización del CRM" />
        <Link href="/crm/automatizaciones/nueva">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Automatización
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-[var(--muted)] rounded animate-pulse" />
          ))}
        </div>
      ) : automations.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted-foreground)]">
          <Zap className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p>No hay automatizaciones configuradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((auto: Record<string, unknown>) => (
            <div
              key={auto.id as string}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Zap className={`h-5 w-5 ${auto.active ? "text-yellow-500" : "text-gray-400"}`} />
                <div>
                  <p className="font-medium">{auto.name as string}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Cuando: {triggerLabels[auto.trigger as string] || (auto.trigger as string)}
                    {" → "}
                    {actionLabels[auto.action as string] || (auto.action as string)}
                  </p>
                  {(auto.executionCount as number) > 0 && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Ejecutada {auto.executionCount as number} veces
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateMutation.mutate({
                      id: auto.id as string,
                      active: !(auto.active as boolean),
                    })
                  }
                >
                  <Badge variant={auto.active ? "default" : "secondary"}>
                    {auto.active ? "Activa" : "Inactiva"}
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(auto.id as string)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
