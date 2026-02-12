"use client";

import { useAdminUsers, useAdminSuppliers, useAdminCategories, useAuditLogs } from "@/hooks/use-admin";
import { useProducts } from "@/hooks/use-products";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CardsSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import {
  Users,
  Truck,
  FolderTree,
  Package,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const users = useAdminUsers();
  const suppliers = useAdminSuppliers();
  const categories = useAdminCategories();
  const products = useProducts();
  const audit = useAuditLogs({ limit: "5" });

  const isLoading =
    users.isLoading || suppliers.isLoading || categories.isLoading || products.isLoading;

  return (
    <div>
      <PageHeader
        title="Panel de Administracion"
        description="Resumen general del sistema"
      />

      {/* Stats */}
      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Usuarios"
            value={users.data?.total ?? users.data?.length ?? 0}
            icon={Users}
            borderColor="border-l-blue-500"
          />
          <StatCard
            label="Proveedores"
            value={suppliers.data?.total ?? suppliers.data?.length ?? 0}
            icon={Truck}
            borderColor="border-l-green-500"
          />
          <StatCard
            label="Categorias"
            value={categories.data?.total ?? categories.data?.length ?? 0}
            icon={FolderTree}
            borderColor="border-l-purple-500"
          />
          <StatCard
            label="Productos"
            value={products.data?.total ?? products.data?.length ?? 0}
            icon={Package}
            borderColor="border-l-orange-500"
          />
        </div>
      )}

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Accesos rapidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/usuarios", label: "Usuarios", icon: Users },
            { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
            { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
            { href: "/admin/paises", label: "Paises", icon: Package },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:bg-[var(--muted)] transition-colors"
            >
              <link.icon className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">
                {link.label}
              </span>
              <ArrowRight className="h-4 w-4 ml-auto text-[var(--muted-foreground)]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Audit */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Auditoria reciente
          </h2>
          <Button variant="link" asChild>
            <Link href="/admin/audit">
              Ver todo <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {audit.isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Entidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(audit.data?.data ?? audit.data ?? [])
                  .slice(0, 5)
                  .map((log: Record<string, string>) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("es")
                          : "-"}
                      </TableCell>
                      <TableCell>{log.userName ?? log.userId ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.entity ?? "-"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
