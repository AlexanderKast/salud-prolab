"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Helpers ──────────────────────────────────────────────

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error en la solicitud");
  }
  return res.json();
}

async function mutateJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error en la solicitud");
  }
  return res.json();
}

// ── Contacts ─────────────────────────────────────────────

export function useCrmContacts(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["crm-contacts", filters],
    queryFn: () => fetchJson(`/api/crm/contacts?${params}`),
  });
}

export function useCrmContact(id: string) {
  return useQuery({
    queryKey: ["crm-contact", id],
    queryFn: () => fetchJson(`/api/crm/contacts/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCrmContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/contacts", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-contacts"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useUpdateCrmContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/contacts/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-contacts"] });
      qc.invalidateQueries({ queryKey: ["crm-contact", vars.id] });
    },
  });
}

export function useDeleteCrmContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/crm/contacts/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-contacts"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useImportCrmContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { distributorIds?: string[]; all?: boolean }) =>
      mutateJson("/api/crm/contacts/import", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-contacts"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

// ── Pipelines ────────────────────────────────────────────

export function useCrmPipelines(type?: "LEADS" | "DEALS") {
  const params = type ? `?type=${type}` : "";
  return useQuery({
    queryKey: ["crm-pipelines", type],
    queryFn: () => fetchJson(`/api/crm/pipelines${params}`).then((r) => r.data),
  });
}

export function useCrmPipeline(id: string) {
  return useQuery({
    queryKey: ["crm-pipeline", id],
    queryFn: () => fetchJson(`/api/crm/pipelines/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/pipelines", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-pipelines"] });
    },
  });
}

export function useUpdateCrmPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/pipelines/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-pipelines"] });
      qc.invalidateQueries({ queryKey: ["crm-pipeline", vars.id] });
    },
  });
}

export function useCreateCrmPipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, ...data }: { pipelineId: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/pipelines/${pipelineId}/stages`, "POST", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-pipeline", vars.pipelineId] });
      qc.invalidateQueries({ queryKey: ["crm-pipelines"] });
    },
  });
}

export function useUpdateCrmPipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pipelineId,
      stageId,
      ...data
    }: { pipelineId: string; stageId: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/pipelines/${pipelineId}/stages/${stageId}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-pipeline", vars.pipelineId] });
    },
  });
}

export function useDeleteCrmPipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageId }: { pipelineId: string; stageId: string }) =>
      mutateJson(`/api/crm/pipelines/${pipelineId}/stages/${stageId}`, "DELETE"),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-pipeline", vars.pipelineId] });
    },
  });
}

export function useReorderCrmPipelineStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) =>
      mutateJson(`/api/crm/pipelines/${pipelineId}/stages/reorder`, "PATCH", { stageIds }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-pipeline", vars.pipelineId] });
    },
  });
}

// ── Leads ────────────────────────────────────────────────

export function useCrmLeadsKanban(pipelineId: string) {
  return useQuery({
    queryKey: ["crm-leads-kanban", pipelineId],
    queryFn: () =>
      fetchJson(`/api/crm/leads?view=kanban&pipelineId=${pipelineId}`).then((r) => r.data),
    enabled: !!pipelineId,
  });
}

export function useCrmLeads(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["crm-leads", filters],
    queryFn: () => fetchJson(`/api/crm/leads?${params}`),
  });
}

export function useCrmLead(id: string) {
  return useQuery({
    queryKey: ["crm-lead", id],
    queryFn: () => fetchJson(`/api/crm/leads/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCrmLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/leads", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-leads"] });
      qc.invalidateQueries({ queryKey: ["crm-leads-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useUpdateCrmLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/leads/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-leads"] });
      qc.invalidateQueries({ queryKey: ["crm-leads-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-lead", vars.id] });
    },
  });
}

export function useMoveCrmLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; stageId: string; stageOrder: number }) =>
      mutateJson(`/api/crm/leads/${id}/move`, "PATCH", data),
    onMutate: async ({ id, stageId, stageOrder }) => {
      await qc.cancelQueries({ queryKey: ["crm-leads-kanban"] });
      const previous = qc.getQueriesData({ queryKey: ["crm-leads-kanban"] });
      // Optimistic update: move card between columns in cache
      qc.setQueriesData({ queryKey: ["crm-leads-kanban"] }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as {
          stages: Array<{
            id: string;
            leads: Array<{ id: string; stageId: string; stageOrder: number }>;
          }>;
        };
        if (!data.stages) return old;
        const lead = data.stages.flatMap((s) => s.leads).find((l) => l.id === id);
        if (!lead) return old;
        return {
          ...data,
          stages: data.stages.map((stage) => ({
            ...stage,
            leads:
              stage.id === stageId
                ? [
                    ...stage.leads.filter((l) => l.id !== id),
                    { ...lead, stageId, stageOrder },
                  ].sort((a, b) => a.stageOrder - b.stageOrder)
                : stage.leads.filter((l) => l.id !== id),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["crm-leads-kanban"] });
    },
  });
}

export function useConvertCrmLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/leads/${id}/convert`, "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-leads"] });
      qc.invalidateQueries({ queryKey: ["crm-leads-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-deals"] });
      qc.invalidateQueries({ queryKey: ["crm-deals-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

// ── Deals ────────────────────────────────────────────────

export function useCrmDealsKanban(pipelineId: string) {
  return useQuery({
    queryKey: ["crm-deals-kanban", pipelineId],
    queryFn: () =>
      fetchJson(`/api/crm/deals?view=kanban&pipelineId=${pipelineId}`).then((r) => r.data),
    enabled: !!pipelineId,
  });
}

export function useCrmDeals(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["crm-deals", filters],
    queryFn: () => fetchJson(`/api/crm/deals?${params}`),
  });
}

export function useCrmDeal(id: string) {
  return useQuery({
    queryKey: ["crm-deal", id],
    queryFn: () => fetchJson(`/api/crm/deals/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/deals", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-deals"] });
      qc.invalidateQueries({ queryKey: ["crm-deals-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useUpdateCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/deals/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-deals"] });
      qc.invalidateQueries({ queryKey: ["crm-deals-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-deal", vars.id] });
    },
  });
}

export function useMoveCrmDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      stageId: string;
      stageOrder: number;
      lostReason?: string;
    }) => mutateJson(`/api/crm/deals/${id}/move`, "PATCH", data),
    onMutate: async ({ id, stageId, stageOrder }) => {
      await qc.cancelQueries({ queryKey: ["crm-deals-kanban"] });
      const previous = qc.getQueriesData({ queryKey: ["crm-deals-kanban"] });
      qc.setQueriesData({ queryKey: ["crm-deals-kanban"] }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as {
          stages: Array<{
            id: string;
            deals: Array<{ id: string; stageId: string; stageOrder: number }>;
          }>;
        };
        if (!data.stages) return old;
        const deal = data.stages.flatMap((s) => s.deals).find((d) => d.id === id);
        if (!deal) return old;
        return {
          ...data,
          stages: data.stages.map((stage) => ({
            ...stage,
            deals:
              stage.id === stageId
                ? [
                    ...stage.deals.filter((d) => d.id !== id),
                    { ...deal, stageId, stageOrder },
                  ].sort((a, b) => a.stageOrder - b.stageOrder)
                : stage.deals.filter((d) => d.id !== id),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["crm-deals-kanban"] });
      qc.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

// ── Activities ───────────────────────────────────────────

export function useCrmActivities(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["crm-activities", filters],
    queryFn: () => fetchJson(`/api/crm/activities?${params}`),
  });
}

export function useCreateCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/activities", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-activities"] });
    },
  });
}

export function useUpdateCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/activities/${id}`, "PATCH", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-activities"] });
    },
  });
}

export function useDeleteCrmActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/crm/activities/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-activities"] });
    },
  });
}

// ── Campaigns ────────────────────────────────────────────

export function useCrmCampaigns(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["crm-campaigns", filters],
    queryFn: () => fetchJson(`/api/crm/campaigns?${params}`),
  });
}

export function useCrmCampaign(id: string) {
  return useQuery({
    queryKey: ["crm-campaign", id],
    queryFn: () => fetchJson(`/api/crm/campaigns/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCrmCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/campaigns", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-campaigns"] });
    },
  });
}

export function useUpdateCrmCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/campaigns/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-campaigns"] });
      qc.invalidateQueries({ queryKey: ["crm-campaign", vars.id] });
    },
  });
}

export function useSendCrmCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/crm/campaigns/${id}/send`, "POST"),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["crm-campaigns"] });
      qc.invalidateQueries({ queryKey: ["crm-campaign", id] });
    },
  });
}

// ── WhatsApp ─────────────────────────────────────────────

export function useCrmWhatsAppMessages(contactId: string) {
  return useQuery({
    queryKey: ["crm-whatsapp", contactId],
    queryFn: () => fetchJson(`/api/crm/whatsapp?contactId=${contactId}`).then((r) => r.data),
    enabled: !!contactId,
    refetchInterval: 10000, // Poll every 10s for new messages
  });
}

export function useSendCrmWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/whatsapp", "POST", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["crm-whatsapp", (vars as { contactId: string }).contactId],
      });
    },
  });
}

export function useCrmWhatsAppTemplates() {
  return useQuery({
    queryKey: ["crm-whatsapp-templates"],
    queryFn: () => fetchJson("/api/crm/whatsapp/templates").then((r) => r.data),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// ── Automations ──────────────────────────────────────────

export function useCrmAutomations(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["crm-automations", filters],
    queryFn: () => fetchJson(`/api/crm/automations?${params}`),
  });
}

export function useCrmAutomation(id: string) {
  return useQuery({
    queryKey: ["crm-automation", id],
    queryFn: () => fetchJson(`/api/crm/automations/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCrmAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/crm/automations", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-automations"] });
    },
  });
}

export function useUpdateCrmAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/crm/automations/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["crm-automations"] });
      qc.invalidateQueries({ queryKey: ["crm-automation", vars.id] });
    },
  });
}

export function useDeleteCrmAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/crm/automations/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-automations"] });
    },
  });
}

// ── Stats ────────────────────────────────────────────────

export function useCrmStats() {
  return useQuery({
    queryKey: ["crm-stats"],
    queryFn: () => fetchJson("/api/crm/stats").then((r) => r.data),
    refetchInterval: 30000, // Refresh every 30s
  });
}
