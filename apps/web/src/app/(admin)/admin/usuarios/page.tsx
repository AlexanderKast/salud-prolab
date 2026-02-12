"use client";

import { useState } from "react";
import { useAdminUsers, useCreateUser, useUpdateUser } from "@/hooks/use-admin";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/admin/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, UserX } from "lucide-react";

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Administrador" },
  { value: "ANALYST", label: "Analista" },
  { value: "DROPSHIPPER", label: "Dropshipper" },
  { value: "GUEST", label: "Invitado" },
];

export default function AdminUsuariosPage() {
  const users = useAdminUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "GUEST" });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "GUEST" });
    setDialogOpen(true);
  };

  const openEdit = (user: Record<string, unknown>) => {
    setEditingUser(user);
    setForm({
      name: (user.name as string) ?? "",
      email: (user.email as string) ?? "",
      password: "",
      role: (user.role as string) ?? "GUEST",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      const data: Record<string, unknown> = {
        id: editingUser.id as string,
        name: form.name,
        role: form.role,
      };
      if (form.password) data.password = form.password;
      updateUser.mutate(data as { id: string }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      createUser.mutate(form, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleToggleActive = (user: Record<string, unknown>) => {
    updateUser.mutate({
      id: user.id as string,
      active: !(user.active as boolean),
    });
  };

  const columns = [
    { key: "name", header: "Nombre", render: (row: Record<string, unknown>) => (
      <span className="font-medium">{row.name as string}</span>
    )},
    { key: "email", header: "Email" },
    { key: "role", header: "Rol", render: (row: Record<string, unknown>) => (
      <Badge variant="outline">
        {roleOptions.find((r) => r.value === row.role)?.label ?? (row.role as string)}
      </Badge>
    )},
    { key: "active", header: "Estado", render: (row: Record<string, unknown>) => (
      <Badge variant={row.active ? "default" : "secondary"}>
        {row.active ? "Activo" : "Inactivo"}
      </Badge>
    )},
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
            onClick={() => handleToggleActive(row)}
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestion de Usuarios"
        description="Administra los usuarios del sistema"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear usuario
          </Button>
        }
      />

      {users.isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <DataTable
          columns={columns}
          data={users.data?.data ?? users.data ?? []}
          emptyMessage="No hay usuarios registrados"
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar usuario" : "Crear usuario"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@ejemplo.com"
                disabled={!!editingUser}
              />
            </div>
            <div>
              <Label>Contrasena{editingUser ? " (dejar vacio para no cambiar)" : ""}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="********"
              />
            </div>
            <div>
              <Label>Rol</Label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roleOptions.map((r) => (
                  <SelectOption key={r.value} value={r.value}>
                    {r.label}
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
                disabled={createUser.isPending || updateUser.isPending}
              >
                {(createUser.isPending || updateUser.isPending)
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
