import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOrders(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetch(`/api/orders?${params}`).then((r) => r.json()),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetch(`/api/orders/${id}`).then((r) => r.json()),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", vars.id] });
    },
  });
}

export function useDistributors() {
  return useQuery({
    queryKey: ["distributors"],
    queryFn: () => fetch("/api/distributors").then((r) => r.json()),
  });
}

export function useCreateDistributor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/distributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["distributors"] }),
  });
}

export function useScheduledOrders() {
  return useQuery({
    queryKey: ["scheduled-orders"],
    queryFn: () => fetch("/api/orders/scheduled").then((r) => r.json()),
  });
}

export function usePriceTiers(productId: string) {
  return useQuery({
    queryKey: ["price-tiers", productId],
    queryFn: () => fetch(`/api/products/${productId}/price-tiers`).then((r) => r.json()),
    enabled: !!productId,
  });
}

export function usePlatformReferences(productId: string) {
  return useQuery({
    queryKey: ["platform-refs", productId],
    queryFn: () => fetch(`/api/products/${productId}/platforms`).then((r) => r.json()),
    enabled: !!productId,
  });
}
