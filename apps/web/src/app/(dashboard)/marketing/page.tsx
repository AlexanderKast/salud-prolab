"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePlaybooks } from "@/hooks/use-marketing";
import { useTemplates } from "@/hooks/use-marketing";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CardsSkeleton } from "@/components/shared/loading-skeleton";
import { TemplateCard } from "@/components/marketing/template-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  Plus,
  Calendar,
  Layers,
} from "lucide-react";

const statusLabels: Record<string, { text: string; variant: "default" | "secondary" | "outline" }> = {
  DRAFT: { text: "Borrador", variant: "secondary" },
  PUBLISHED: { text: "Publicado", variant: "default" },
  ARCHIVED: { text: "Archivado", variant: "outline" },
};

export default function MarketingPage() {
  const { data: session } = useSession();
  const playbooks = usePlaybooks();
  const templates = useTemplates();

  const canWrite =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "ANALYST";

  const playbookList = playbooks.data?.data ?? playbooks.data ?? [];
  const templateList = templates.data?.data ?? templates.data ?? [];

  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Gestiona playbooks de marketing y plantillas de contenido"
      />

      <Tabs defaultValue="playbooks">
        <TabsList className="mb-6">
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
        </TabsList>

        {/* Playbooks Tab */}
        <TabsContent value="playbooks">
          {canWrite && (
            <div className="mb-4">
              <Button asChild>
                <Link href="/marketing/playbook/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Playbook
                </Link>
              </Button>
            </div>
          )}

          {playbooks.isLoading ? (
            <CardsSkeleton count={6} />
          ) : playbookList.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sin playbooks"
              description="Crea tu primer playbook de marketing"
              action={
                canWrite ? (
                  <Button asChild>
                    <Link href="/marketing/playbook/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear playbook
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playbookList.map((pb: Record<string, unknown>) => {
                const status = statusLabels[(pb.status as string) ?? "DRAFT"] ?? statusLabels.DRAFT;
                return (
                  <Link
                    key={pb.id as string}
                    href={`/marketing/playbook/${pb.id}`}
                    className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {pb.title as string}
                        </h3>
                      </div>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {(pb.sectionCount as number) ?? 0} secciones
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {pb.createdAt
                          ? new Date(pb.createdAt as string).toLocaleDateString("es")
                          : "-"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Plantillas Tab */}
        <TabsContent value="plantillas">
          {canWrite && (
            <div className="mb-4">
              <Button asChild>
                <Link href="/marketing/plantilla/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Link>
              </Button>
            </div>
          )}

          {templates.isLoading ? (
            <CardsSkeleton count={6} />
          ) : templateList.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Sin plantillas"
              description="Crea tu primera plantilla de contenido"
              action={
                canWrite ? (
                  <Button asChild>
                    <Link href="/marketing/plantilla/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear plantilla
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {templateList.map((t: Record<string, unknown>) => (
                <TemplateCard key={t.id as string} template={t as never} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
