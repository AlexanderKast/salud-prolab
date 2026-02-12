"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  usePlaybook,
  useUpdatePlaybook,
  useUpdatePlaybookSection,
} from "@/hooks/use-marketing";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { EsferaStepper, type EsferaPhase, PHASES } from "@/components/marketing/esfera-stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectOption } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import Link from "next/link";

const statusOptions = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "ARCHIVED", label: "Archivado" },
];

export default function PlaybookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const playbook = usePlaybook(id);
  const updatePlaybook = useUpdatePlaybook();
  const updateSection = useUpdatePlaybookSection();
  const [activePhase, setActivePhase] = useState<EsferaPhase>("estrategia");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState("");

  if (playbook.isLoading) return <DetailSkeleton />;

  if (!playbook.data) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Playbook no encontrado"
        action={
          <Button asChild variant="outline">
            <Link href="/marketing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a marketing
            </Link>
          </Button>
        }
      />
    );
  }

  const data = playbook.data;
  const sections = (data.sections ?? []) as Record<string, unknown>[];
  const phaseSections = sections.filter(
    (s) => (s.phase as string)?.toLowerCase() === activePhase
  );

  const handleStatusChange = (status: string) => {
    updatePlaybook.mutate({ id, status });
  };

  const handleStartEdit = (sectionId: string, content: string) => {
    setEditingSection(sectionId);
    setSectionContent(content);
  };

  const handleSaveSection = (sectionId: string) => {
    updateSection.mutate(
      { playbookId: id, sectionId, content: sectionContent },
      { onSuccess: () => setEditingSection(null) }
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/marketing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={data.title ?? "Playbook"} className="mb-0 flex-1" />

        <div className="flex items-center gap-3">
          <Badge
            variant={
              data.status === "PUBLISHED"
                ? "default"
                : data.status === "ARCHIVED"
                  ? "outline"
                  : "secondary"
            }
          >
            {statusOptions.find((s) => s.value === data.status)?.label ?? data.status}
          </Badge>
          <Select
            className="w-36"
            value={data.status ?? "DRAFT"}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: ESFERA Stepper */}
        <div className="w-56 shrink-0">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sticky top-6">
            <EsferaStepper
              activePhase={activePhase}
              onPhaseChange={setActivePhase}
            />
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)] capitalize">
              {PHASES.find((p) => p.key === activePhase)?.label ?? activePhase}
            </h2>
          </div>

          {phaseSections.length === 0 ? (
            <EmptyState
              title="Sin secciones en esta fase"
              description="No hay contenido configurado para esta fase del playbook"
            />
          ) : (
            phaseSections.map((section) => (
              <div
                key={section.id as string}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[var(--foreground)]">
                    {section.title as string}
                  </h3>
                  {editingSection !== (section.id as string) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleStartEdit(
                          section.id as string,
                          (section.content as string) ?? ""
                        )
                      }
                    >
                      Editar
                    </Button>
                  )}
                </div>

                {editingSection === (section.id as string) ? (
                  <div className="space-y-3">
                    <Textarea
                      value={sectionContent}
                      onChange={(e) => setSectionContent(e.target.value)}
                      rows={8}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveSection(section.id as string)}
                        disabled={updateSection.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {updateSection.isPending ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSection(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
                    {(section.content as string) || "Sin contenido"}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
