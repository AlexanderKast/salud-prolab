"use client";

import { useState } from "react";
import {
  useAdminCountries,
  useCreateCountry,
  useUpdateCountry,
  useDeleteCountry,
} from "@/hooks/use-admin";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/admin/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminPaisesPage() {
  const countries = useAdminCountries();
  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();
  const deleteCountry = useDeleteCountry();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    currency: "",
    taxRate: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", currency: "", taxRate: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    setForm({
      code: (row.code as string) ?? "",
      name: (row.name as string) ?? "",
      currency: (row.currency as string) ?? "",
      taxRate: row.taxRate != null ? String(row.taxRate) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      ...form,
      taxRate: form.taxRate ? parseFloat(form.taxRate) : undefined,
    };
    if (editing) {
      updateCountry.mutate(
        { id: editing.id as string, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCountry.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Estas seguro de eliminar este pais?")) {
      deleteCountry.mutate(id);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Codigo",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className="font-mono">
          {row.code as string}
        </Badge>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{row.name as string}</span>
      ),
    },
    { key: "currency", header: "Moneda" },
    {
      key: "taxRate",
      header: "Tasa impositiva",
      render: (row: Record<string, unknown>) => (row.taxRate != null ? `${row.taxRate}%` : "-"),
    },
    {
      key: "active",
      header: "Estado",
      render: (row: Record<string, unknown>) => (
        <Badge variant={(row.active ?? true) ? "default" : "secondary"}>
          {(row.active ?? true) ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id as string)}>
            <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestion de Paises"
        description="Administra los paises disponibles en el sistema"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo pais
          </Button>
        }
      />

      {countries.isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={Array.isArray(countries.data?.data) ? countries.data.data : []}
          emptyMessage="No hay paises registrados"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar pais" : "Nuevo pais"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Codigo (ISO)</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="CO"
                  maxLength={3}
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Colombia"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Moneda</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  placeholder="COP"
                />
              </div>
              <div>
                <Label>Tasa impositiva (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  placeholder="19"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createCountry.isPending || updateCountry.isPending}
              >
                {createCountry.isPending || updateCountry.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
