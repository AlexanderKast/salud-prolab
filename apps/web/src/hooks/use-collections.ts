import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => fetch("/api/collections").then((r) => r.json()),
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: () => fetch(`/api/collections/${id}`).then((r) => r.json()),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useAddToCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      productId,
    }: {
      collectionId: string;
      productId: string;
    }) =>
      fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).then((r) => r.json()),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["collections", vars.collectionId] }),
  });
}

export function useRemoveFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      productId,
    }: {
      collectionId: string;
      productId: string;
    }) =>
      fetch(`/api/collections/${collectionId}/items/${productId}`, {
        method: "DELETE",
      }).then((r) => r.json()),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["collections", vars.collectionId] }),
  });
}
