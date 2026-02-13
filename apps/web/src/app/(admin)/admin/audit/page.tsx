"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/use-admin";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/admin/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function AdminAuditPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const audit = useAuditLogs({ ...filters, page: String(page) });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPage(1);
  };

  const logs = Array.isArray(audit.data?.data) ? audit.data.data : [];
  const totalPages = audit.data?.totalPages ?? 1;

  const columns = [
    {
      key: "createdAt",
      header: "Fecha y hora",
      render: (row: Record<string, unknown>) =>
        row.createdAt ? new Date(row.createdAt as string).toLocaleString("es") : "-",
    },
    {
      key: "userName",
      header: "Usuario",
      render: (row: Record<string, unknown>) =>
        (row.userName as string) ?? (row.userId as string) ?? "-",
    },
    {
      key: "action",
      header: "Accion",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline">{row.action as string}</Badge>
      ),
    },
    {
      key: "entity",
      header: "Entidad",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{(row.entity as string) ?? "-"}</span>
      ),
    },
    {
      key: "entityId",
      header: "ID Entidad",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono text-[var(--muted-foreground)]">
          {(row.entityId as string) ?? "-"}
        </span>
      ),
    },
    {
      key: "details",
      header: "Detalles",
      render: (row: Record<string, unknown>) => (
        <span className="text-sm text-[var(--muted-foreground)] truncate max-w-[200px] block">
          {row.details ? JSON.stringify(row.details).slice(0, 60) : "-"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Registro de Auditoria"
        description="Historial de acciones realizadas en el sistema"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por usuario..."
            className="pl-9"
            value={filters.user ?? ""}
            onChange={(e) => handleFilterChange("user", e.target.value)}
          />
        </div>
        <Input
          placeholder="Entidad"
          className="w-40"
          value={filters.entity ?? ""}
          onChange={(e) => handleFilterChange("entity", e.target.value)}
        />
        <Select
          className="w-40"
          value={filters.action ?? ""}
          onChange={(e) => handleFilterChange("action", e.target.value)}
        >
          <SelectOption value="">Todas las acciones</SelectOption>
          <SelectOption value="CREATE">Crear</SelectOption>
          <SelectOption value="UPDATE">Actualizar</SelectOption>
          <SelectOption value="DELETE">Eliminar</SelectOption>
          <SelectOption value="LOGIN">Login</SelectOption>
          <SelectOption value="LOGOUT">Logout</SelectOption>
        </Select>
        <Input
          type="date"
          className="w-40"
          value={filters.dateFrom ?? ""}
          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
        />
        <Input
          type="date"
          className="w-40"
          value={filters.dateTo ?? ""}
          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
        />
      </div>

      {/* Table */}
      {audit.isLoading ? (
        <TableSkeleton rows={10} cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No hay registros de auditoria"
        />
      )}
    </div>
  );
}
