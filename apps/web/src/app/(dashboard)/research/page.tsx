"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useResearchNotes, useCreateResearchNote } from "@/hooks/use-research";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CardsSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  FlaskConical,
  Plus,
  Search,
  Zap,
  Calendar,
  BarChart3,
  Link as LinkIcon,
} from "lucide-react";

const EXPRESS_TEMPLATE = {
  title: "Investigacion Express - ",
  content: `## Resumen del Producto\n\n## Analisis de Mercado\n\n## Competidores Principales\n\n## Oportunidades\n\n## Conclusiones\n`,
  source: "",
  tags: ["express"],
};

export default function ResearchListPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const research = useResearchNotes(filters);
  const createNote = useCreateResearchNote();

  const canWrite =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "ANALYST";

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const handleExpressCreate = () => {
    const date = new Date().toLocaleDateString("es");
    createNote.mutate({
      title: EXPRESS_TEMPLATE.title + date,
      content: EXPRESS_TEMPLATE.content,
      source: EXPRESS_TEMPLATE.source,
      tags: EXPRESS_TEMPLATE.tags,
    });
  };

  const notes = research.data?.data ?? research.data ?? [];

  return (
    <div>
      <PageHeader
        title="Centro de Investigacion"
        description="Gestiona notas de investigacion y benchmarks de competidores"
        action={
          canWrite ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExpressCreate} disabled={createNote.isPending}>
                <Zap className="h-4 w-4 mr-2" />
                Investigacion Express
              </Button>
              <Button asChild>
                <Link href="/research/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Investigacion
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar investigaciones..."
            className="pl-9"
            value={filters.search ?? ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <Input
          placeholder="Filtrar por producto"
          className="w-48"
          value={filters.product ?? ""}
          onChange={(e) => handleFilterChange("product", e.target.value)}
        />
        <Input
          placeholder="Filtrar por etiquetas"
          className="w-48"
          value={filters.tags ?? ""}
          onChange={(e) => handleFilterChange("tags", e.target.value)}
        />
      </div>

      {/* Notes List */}
      {research.isLoading ? (
        <CardsSkeleton count={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Sin investigaciones"
          description="Crea tu primera nota de investigacion para comenzar"
          action={
            canWrite ? (
              <Button asChild>
                <Link href="/research/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Investigacion
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note: Record<string, unknown>) => (
            <Link
              key={note.id as string}
              href={`/research/${note.id}`}
              className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                {note.title as string}
              </h3>

              {note.productName && (
                <p className="text-sm text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" />
                  {note.productName as string}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {(note.benchmarkCount as number) ?? 0} benchmarks
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {note.createdAt
                    ? new Date(note.createdAt as string).toLocaleDateString("es")
                    : "-"}
                </span>
              </div>

              {Array.isArray(note.tags) && note.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {(note.tags as string[]).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
