"use client";

import { useState } from "react";
import {
  useAdminSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/use-admin";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/admin/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminProveedoresPage() {
  const suppliers = useAdminSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", contactName: "", email: "", phone: "", country: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    setForm({
      name: (row.name as string) ?? "",
      contactName: (row.contactName as string) ?? "",
      email: (row.email as string) ?? "",
      phone: (row.phone as string) ?? "",
      country: (row.country as string) ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      updateSupplier.mutate(
        { id: editing.id as string, ...form },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createSupplier.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Estas seguro de eliminar este proveedor?")) {
      deleteSupplier.mutate(id);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nombre",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{row.name as string}</span>
      ),
    },
    { key: "contactName", header: "Contacto" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefono" },
    { key: "country", header: "Pais" },
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id as string)}
          >
            <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestion de Proveedores"
        description="Administra los proveedores del sistema"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo proveedor
          </Button>
        }
      />

      {suppliers.isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : (
        <DataTable
          columns={columns}
          data={suppliers.data?.data ?? suppliers.data ?? []}
          emptyMessage="No hay proveedores registrados"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar proveedor" : "Nuevo proveedor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <Label>Nombre de contacto</Label>
              <Input
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="Persona de contacto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@proveedor.com"
                />
              </div>
              <div>
                <Label>Telefono</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+57 300 000 0000"
                />
              </div>
            </div>
            <div>
              <Label>Pais</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Colombia"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createSupplier.isPending || updateSupplier.isPending}
              >
                {(createSupplier.isPending || updateSupplier.isPending)
                  ? "Guardando..."
                  : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
