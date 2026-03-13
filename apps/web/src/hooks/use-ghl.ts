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

// ── Tags ────────────────────────────────────────────────

export function useTags(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return useQuery({
    queryKey: ["tags", search],
    queryFn: () => fetchJson(`/api/tags${params}`).then((r) => r.data),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/tags", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/tags/${id}`, "PATCH", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/tags/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

// ── Conversations ───────────────────────────────────────

export function useConversations(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["conversations", filters],
    queryFn: () => fetchJson(`/api/conversations?${params}`),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchJson(`/api/conversations/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/conversations", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUpdateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/conversations/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["conversation", vars.id] });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      ...data
    }: { conversationId: string } & Record<string, unknown>) =>
      mutateJson(`/api/conversations/${conversationId}/messages`, "POST", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["conversation", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ── Tasks ───────────────────────────────────────────────

export function useTasks(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchJson(`/api/tasks?${params}`),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchJson(`/api/tasks/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/tasks", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/tasks/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["task", vars.id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/tasks/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ── Appointments ────────────────────────────────────────

export function useAppointments(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => fetchJson(`/api/appointments?${params}`),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => fetchJson(`/api/appointments/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/appointments", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutateJson(`/api/appointments/${id}`, "PATCH", data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["appointment", vars.id] });
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateJson(`/api/appointments/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// ── Events ──────────────────────────────────────────────

export function useEvents(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => fetchJson(`/api/events?${params}`),
  });
}

// ── Workspaces ──────────────────────────────────────────

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => fetchJson("/api/workspaces").then((r) => r.data),
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mutateJson("/api/workspaces", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
