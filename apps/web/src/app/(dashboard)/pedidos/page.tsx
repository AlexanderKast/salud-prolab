"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "EN_PRODUCCION", label: "En produccion" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "DEVUELTO", label: "Devuelto" },
];

const typeOptions = [
  { value: "", label: "Todos los tipos" },
  { value: "DROPSHIPPING_INMEDIATO", label: "Dropshipping Inmediato" },
  { value: "DROPSHIPPING_PROGRAMADO", label: "Dropshipping Programado" },
  { value: "MAQUILA_PRODUCCION", label: "Maquila / Produccion" },
];

const statusColorMap: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMADO: "bg-blue-100 text-blue-800 border-blue-200",
  EN_PRODUCCION: "bg-indigo-100 text-indigo-800 border-indigo-200",
  ENVIADO: "bg-purple-100 text-purple-800 border-purple-200",
  ENTREGADO: "bg-green-100 text-green-800 border-green-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
  DEVUELTO: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusLabelMap: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PRODUCCION: "En produccion",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
  DEVUELTO: "Devuelto",
};

const typeLabelMap: Record<string, string> = {
  DROPSHIPPING_INMEDIATO: "Drop. Inmediato",
  DROPSHIPPING_PROGRAMADO: "Drop. Programado",
  MAQUILA_PRODUCCION: "Maquila",
};

export default function PedidosPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;
  if (typeFilter) filters.type = typeFilter;

  const orders = useOrders(Object.keys(filters).length > 0 ? filters : undefined);

  const orderList: Record<string, unknown>[] = Array.isArray(orders.data?.data)
    ? orders.data.data
    : [];

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Gestion de pedidos y ordenes"
        action={
          <Button asChild>
            <Link href="/pedidos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo pedido
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {typeOptions.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      {orders.isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : orderList.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Sin pedidos"
          description="No se encontraron pedidos con los filtros seleccionados"
          action={
            <Button asChild>
              <Link href="/pedidos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear primer pedido
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead># Orden</TableHead>
                <TableHead>Distribuidor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((order: Record<string, unknown>) => (
                <TableRow key={order.id as string}>
                  <TableCell>
                    <Link
                      href={`/pedidos/${order.id}`}
                      className="font-medium text-[var(--primary)] hover:underline"
                    >
                      {(order.orderNumber as string) ?? `#${(order.id as string).slice(0, 8)}`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {(order.distributor as Record<string, string>)?.companyName ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabelMap[(order.type as string) ?? ""] ?? (order.type as string) ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColorMap[(order.status as string) ?? ""] ?? ""}>
                      {statusLabelMap[(order.status as string) ?? ""] ??
                        (order.status as string) ??
                        "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.total != null
                      ? `$${(order.total as number).toLocaleString("es", {
                          minimumFractionDigits: 2,
                        })}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {order.createdAt
                      ? new Date(order.createdAt as string).toLocaleDateString("es")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
