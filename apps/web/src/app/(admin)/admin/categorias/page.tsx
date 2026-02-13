"use client";

import { useState } from "react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-admin";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/admin/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCategoriasPage() {
  const categories = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", parentId: "" });

  const allCategories = Array.isArray(categories.data?.data) ? categories.data.data : [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", parentId: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    setForm({
      name: (row.name as string) ?? "",
      slug: (row.slug as string) ?? "",
      parentId: (row.parentId as string) ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      ...form,
      parentId: form.parentId || undefined,
    };
    if (editing) {
      updateCategory.mutate(
        { id: editing.id as string, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCategory.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Estas seguro de eliminar esta categoria?")) {
      deleteCategory.mutate(id);
    }
  };

  const columns: {
    key: string;
    header: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
    className?: string;
  }[] = [
    {
      key: "name",
      header: "Nombre",
      render: (row) => <span className="font-medium">{row.name as string}</span>,
    },
    { key: "slug", header: "Slug" },
    {
      key: "parentId",
      header: "Categoria padre",
      render: (row) => {
        if (!row.parentId) return "-";
        const parent = allCategories.find((c: Record<string, unknown>) => c.id === row.parentId);
        return String((parent as Record<string, unknown>)?.name ?? row.parentId);
      },
    },
    {
      key: "productCount",
      header: "Productos",
      render: (row) => String((row.productCount as number) ?? 0),
    },
    {
      key: "active",
      header: "Estado",
      render: (row) => (
        <Badge variant={(row.active ?? true) ? "default" : "secondary"}>
          {(row.active ?? true) ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (row) => (
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
        title="Gestion de Categorias"
        description="Administra las categorias de productos"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva categoria
          </Button>
        }
      />

      {categories.isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={allCategories}
          emptyMessage="No hay categorias registradas"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar categoria" : "Nueva categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre de la categoria"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="slug-de-categoria"
              />
            </div>
            <div>
              <Label>Categoria padre (opcional)</Label>
              <Select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              >
                <SelectOption value="">Sin padre</SelectOption>
                {allCategories
                  .filter((c: Record<string, unknown>) => c.id !== editing?.id)
                  .map((c: Record<string, unknown>) => (
                    <SelectOption key={c.id as string} value={c.id as string}>
                      {c.name as string}
                    </SelectOption>
                  ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
