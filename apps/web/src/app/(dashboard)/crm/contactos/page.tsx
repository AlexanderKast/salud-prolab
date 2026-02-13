"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCrmContacts, useImportCrmContacts } from "@/hooks/use-crm";
import { Plus, Search, Upload, Building, User } from "lucide-react";

export default function ContactosPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmContacts({
    search: search || "",
    page: String(page),
    limit: "20",
  });
  const importMutation = useImportCrmContacts();

  const contacts = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Contactos" description="Gestión de contactos del CRM" />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => importMutation.mutate({ all: true })}
            disabled={importMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Distribuidores
          </Button>
          <Link href="/crm/contactos/nuevo">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contacto
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar contactos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-[var(--muted)]/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Contacto</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Teléfono</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Fuente</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Leads</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Negocios</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  Cargando contactos...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  No se encontraron contactos
                </td>
              </tr>
            ) : (
              contacts.map((contact: Record<string, unknown>) => (
                <tr
                  key={contact.id as string}
                  className="border-b hover:bg-[var(--muted)]/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/crm/contactos/${contact.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)]">
                        {(contact.type as string) === "EMPRESA" ? (
                          <Building className="h-4 w-4 text-[var(--muted-foreground)]" />
                        ) : (
                          <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {contact.firstName as string} {(contact.lastName as string) || ""}
                        </p>
                        {Boolean(contact.companyName) && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {String(contact.companyName)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{(contact.email as string) || "—"}</td>
                  <td className="px-4 py-3 text-sm">{(contact.phone as string) || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {contact.source as string}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(contact._count as Record<string, number>)?.leads ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(contact._count as Record<string, number>)?.deals ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Mostrando {contacts.length} de {pagination.total} contactos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
