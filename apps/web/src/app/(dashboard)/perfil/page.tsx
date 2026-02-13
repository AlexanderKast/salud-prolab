"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCollections, useCreateCollection } from "@/hooks/use-collections";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CardsSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Star, Plus, FolderOpen, Eye } from "lucide-react";
import Link from "next/link";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  ANALYST: "Analista",
  DROPSHIPPER: "Dropshipper",
  GUEST: "Invitado",
};

export default function PerfilPage() {
  const { data: session } = useSession();
  const collections = useCollections();
  const createCollection = useCreateCollection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection.mutate(
      { name: newName, description: newDesc },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewName("");
          setNewDesc("");
        },
      }
    );
  };

  return (
    <div>
      <PageHeader title="Mi Perfil" />

      {/* User Info Card */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {session?.user?.name ?? "Usuario"}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">{session?.user?.email}</p>
            <Badge className="mt-1">
              {roleLabels[session?.user?.role ?? ""] ?? session?.user?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Star className="h-5 w-5" />
            Mis Colecciones
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 h-10 px-4 py-2">
              <Plus className="h-4 w-4" />
              Nueva coleccion
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nueva coleccion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="col-name">Nombre</Label>
                  <Input
                    id="col-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Mi coleccion"
                  />
                </div>
                <div>
                  <Label htmlFor="col-desc">Descripcion (opcional)</Label>
                  <Input
                    id="col-desc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Descripcion de la coleccion"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!newName.trim() || createCollection.isPending}
                  >
                    {createCollection.isPending ? "Creando..." : "Crear"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {collections.isLoading ? (
          <CardsSkeleton count={3} />
        ) : (collections.data?.data ?? []).length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Sin colecciones"
            description="Crea colecciones para organizar tus productos favoritos"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(collections.data?.data ?? []).map((col: Record<string, unknown>) => (
              <div
                key={col.id as string}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">{col.name as string}</h3>
                    {(col.description as string) ? (
                      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                        {col.description as string}
                      </p>
                    ) : null}
                  </div>
                  <FolderOpen className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  {(col.itemCount as number) ?? 0} productos
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                  <Link href={`/perfil/coleccion/${col.id}`}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Ver coleccion
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
