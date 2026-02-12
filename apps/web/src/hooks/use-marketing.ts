import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function usePlaybooks(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["playbooks", filters],
    queryFn: () => fetch(`/api/marketing/playbooks?${params}`).then((r) => r.json()),
  });
}

export function usePlaybook(id: string) {
  return useQuery({
    queryKey: ["playbooks", id],
    queryFn: () => fetch(`/api/marketing/playbooks/${id}`).then((r) => r.json()),
    enabled: !!id,
  });
}

export function useCreatePlaybook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/marketing/playbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playbooks"] }),
  });
}

export function useUpdatePlaybook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetch(`/api/marketing/playbooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["playbooks"] });
      qc.invalidateQueries({ queryKey: ["playbooks", vars.id] });
    },
  });
}

export function useUpdatePlaybookSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      playbookId,
      sectionId,
      ...data
    }: {
      playbookId: string;
      sectionId: string;
    } & Record<string, unknown>) =>
      fetch(`/api/marketing/playbooks/${playbookId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["playbooks", vars.playbookId] }),
  });
}

export function useTemplates(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["templates", filters],
    queryFn: () => fetch(`/api/marketing/templates?${params}`).then((r) => r.json()),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => fetch(`/api/marketing/templates/${id}`).then((r) => r.json()),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/marketing/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}
