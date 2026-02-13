"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCrmAutomation, useCrmPipelines } from "@/hooks/use-crm";

const triggers = [
  { value: "LEAD_CREADO", label: "Lead creado" },
  { value: "LEAD_ETAPA_CAMBIADA", label: "Lead cambió de etapa" },
  { value: "DEAL_CREADO", label: "Negocio creado" },
  { value: "DEAL_ETAPA_CAMBIADA", label: "Negocio cambió de etapa" },
  { value: "DEAL_GANADO", label: "Negocio ganado" },
  { value: "DEAL_PERDIDO", label: "Negocio perdido" },
  { value: "CONTACTO_CREADO", label: "Contacto creado" },
  { value: "ACTIVIDAD_CREADA", label: "Actividad creada" },
];

const actions = [
  { value: "ENVIAR_EMAIL", label: "Enviar email" },
  { value: "ENVIAR_WHATSAPP", label: "Enviar WhatsApp" },
  { value: "CREAR_ACTIVIDAD", label: "Crear actividad" },
  { value: "MOVER_ETAPA", label: "Mover a etapa" },
  { value: "ASIGNAR_USUARIO", label: "Asignar usuario" },
  { value: "NOTIFICAR", label: "Notificar" },
];

export default function NuevaAutomatizacionPage() {
  const router = useRouter();
  const createMutation = useCreateCrmAutomation();
  const { data: pipelines } = useCrmPipelines();

  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger: "LEAD_CREADO",
    action: "ENVIAR_EMAIL",
    pipelineId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...form,
        pipelineId: form.pipelineId || undefined,
      });
      router.push("/crm/automatizaciones");
    } catch {
      // Error handled
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Nueva Automatización"
        description="Crea una regla de automatización para tu CRM"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Enviar bienvenida al crear contacto"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trigger">Cuando (Trigger) *</Label>
          <select
            id="trigger"
            value={form.trigger}
            onChange={(e) => setForm({ ...form, trigger: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm bg-[var(--background)]"
          >
            {triggers.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="action">Entonces (Acción) *</Label>
          <select
            id="action"
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm bg-[var(--background)]"
          >
            {actions.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {pipelines && pipelines.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="pipeline">Pipeline (opcional)</Label>
            <select
              id="pipeline"
              value={form.pipelineId}
              onChange={(e) => setForm({ ...form, pipelineId: e.target.value })}
              className="w-full rounded-md border px-3 py-2 text-sm bg-[var(--background)]"
            >
              <option value="">Todos los pipelines</option>
              {pipelines.map((p: Record<string, unknown>) => (
                <option key={p.id as string} value={p.id as string}>
                  {p.name as string} ({p.type as string})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creando..." : "Crear Automatización"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/crm/automatizaciones")}
          >
            Cancelar
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-sm text-red-500">{createMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}
