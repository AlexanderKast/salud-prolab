import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useResearchNotes(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["research-notes", filters],
    queryFn: () => fetch(`/api/research?${params}`).then((r) => r.json()),
  });
}

export function useResearchNote(id: string) {
  return useQuery({
    queryKey: ["research-notes", id],
    queryFn: () => fetch(`/api/research/${id}`).then((r) => r.json()),
    enabled: !!id,
  });
}

export function useCreateResearchNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["research-notes"] }),
  });
}

export function useUpdateResearchNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetch(`/api/research/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["research-notes"] });
      qc.invalidateQueries({ queryKey: ["research-notes", vars.id] });
    },
  });
}

export function useDeleteResearchNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/research/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["research-notes"] }),
  });
}

export function useBenchmarks(noteId: string) {
  return useQuery({
    queryKey: ["benchmarks", noteId],
    queryFn: () =>
      fetch(`/api/research/${noteId}/benchmarks`).then((r) => r.json()),
    enabled: !!noteId,
  });
}

export function useCreateBenchmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteId,
      ...data
    }: { noteId: string } & Record<string, unknown>) =>
      fetch(`/api/research/${noteId}/benchmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["benchmarks", vars.noteId] }),
  });
}
