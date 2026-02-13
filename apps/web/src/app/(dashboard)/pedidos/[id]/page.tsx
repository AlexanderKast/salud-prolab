"use client";

import { useParams } from "next/navigation";
import { useOrder } from "@/hooks/use-orders";
import { PageHeader } from "@/components/shared/page-header";
import { CardsSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Package, Truck, Clock } from "lucide-react";

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
  DROPSHIPPING_INMEDIATO: "Dropshipping Inmediato",
  DROPSHIPPING_PROGRAMADO: "Dropshipping Programado",
  MAQUILA_PRODUCCION: "Maquila / Produccion",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);

  const data = order.data?.data as Record<string, unknown> | undefined;

  if (order.isLoading) return <CardsSkeleton count={3} />;

  if (!data) {
    return (
      <div>
        <PageHeader title="Orden no encontrada" />
        <Button variant="outline" asChild>
          <Link href="/pedidos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a pedidos
          </Link>
        </Button>
      </div>
    );
  }

  const distributor = data.distributor as Record<string, string> | null;
  const items = (data.items as Record<string, unknown>[]) ?? [];
  const history = (data.statusHistory as Record<string, unknown>[]) ?? [];

  return (
    <div>
      <PageHeader
        title={`Orden ${(data.orderNumber as string) ?? ""}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Informacion del Pedido
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Estado</span>
              <Badge className={statusColorMap[(data.status as string) ?? ""] ?? ""}>
                {statusLabelMap[(data.status as string) ?? ""] ?? (data.status as string)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Tipo</span>
              <span>{typeLabelMap[(data.type as string) ?? ""] ?? (data.type as string)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Subtotal</span>
              <span className="font-medium">
                ${Number(data.subtotal ?? 0).toLocaleString("es", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Impuesto</span>
              <span>
                ${Number(data.tax ?? 0).toLocaleString("es", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                ${Number(data.total ?? 0).toLocaleString("es", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Boolean(data.trackingNumber) && (
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Tracking</span>
                <span className="font-mono text-xs">{String(data.trackingNumber)}</span>
              </div>
            )}
            {Boolean(data.notes) && (
              <div className="pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--muted-foreground)] block mb-1">Notas</span>
                <p>{String(data.notes)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Distributor Info */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Distribuidor
          </h3>
          {distributor ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{distributor.companyName}</p>
              {distributor.taxId && (
                <p className="text-[var(--muted-foreground)]">NIT: {distributor.taxId}</p>
              )}
              {distributor.phone && (
                <p className="text-[var(--muted-foreground)]">{distributor.phone}</p>
              )}
              {distributor.address && (
                <p className="text-[var(--muted-foreground)]">{distributor.address}</p>
              )}
              {distributor.city && (
                <p className="text-[var(--muted-foreground)]">
                  {distributor.city}, {distributor.country}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">Sin distribuidor asignado</p>
          )}
          {Boolean(data.shippingAddress) && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Direccion de envio</p>
              <p className="text-sm">{String(data.shippingAddress)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Items del Pedido</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">
                  Producto
                </th>
                <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">
                  Variante
                </th>
                <th className="text-right py-2 px-2 text-[var(--muted-foreground)] font-medium">
                  Cant.
                </th>
                <th className="text-right py-2 px-2 text-[var(--muted-foreground)] font-medium">
                  Precio Unit.
                </th>
                <th className="text-right py-2 px-2 text-[var(--muted-foreground)] font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const product = item.product as Record<string, unknown> | null;
                return (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 px-2">
                      {product ? (
                        <Link
                          href={`/producto/${product.id}`}
                          className="text-[var(--primary)] hover:underline"
                        >
                          {product.name as string}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 px-2 text-[var(--muted-foreground)]">
                      {(item.variantInfo as string) ?? "-"}
                    </td>
                    <td className="py-2 px-2 text-right">{item.quantity as number}</td>
                    <td className="py-2 px-2 text-right">
                      $
                      {Number(item.unitPrice ?? 0).toLocaleString("es", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      $
                      {Number(item.totalPrice ?? 0).toLocaleString("es", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status History */}
      {history.length > 0 && (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial de Estados
          </h3>
          <div className="space-y-3">
            {history.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Badge
                  className={`${statusColorMap[(entry.status as string) ?? ""] ?? ""} shrink-0`}
                >
                  {statusLabelMap[(entry.status as string) ?? ""] ?? (entry.status as string)}
                </Badge>
                <div className="flex-1">
                  {Boolean(entry.notes) && <p>{String(entry.notes)}</p>}
                  <p className="text-[var(--muted-foreground)] text-xs">
                    {entry.createdAt
                      ? new Date(entry.createdAt as string).toLocaleString("es")
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
