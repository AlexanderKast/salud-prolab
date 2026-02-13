"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { PipelineSelector } from "@/components/crm/pipeline-selector";
import { useCrmPipelines, useCrmLeadsKanban } from "@/hooks/use-crm";
import { Plus, List } from "lucide-react";

export default function LeadsKanbanPage() {
  const router = useRouter();
  const { data: pipelines, isLoading: loadingPipelines } = useCrmPipelines("LEADS");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

  const pipelineId = selectedPipelineId || (pipelines?.[0]?.id ?? "");
  const { data: kanbanData, isLoading: loadingKanban } = useCrmLeadsKanban(pipelineId);

  // Auto-select first pipeline when loaded
  if (!selectedPipelineId && pipelines?.[0]?.id) {
    setSelectedPipelineId(pipelines[0].id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Pipeline de Leads"
          description="Gestiona tus leads en el tablero Kanban"
        />
        <div className="flex gap-2">
          <Link href="/crm/leads/lista">
            <Button variant="outline" size="sm">
              <List className="mr-2 h-4 w-4" />
              Vista Lista
            </Button>
          </Link>
          <Button size="sm" onClick={() => router.push("/crm/leads/lista?new=true")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {pipelines && pipelines.length > 1 && (
        <PipelineSelector
          pipelines={pipelines}
          selectedId={pipelineId}
          onSelect={setSelectedPipelineId}
        />
      )}

      {loadingPipelines || loadingKanban ? (
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-72 shrink-0">
              <div className="h-8 bg-[var(--muted)] rounded mb-3 animate-pulse" />
              <div className="space-y-2 p-2 bg-[var(--muted)]/30 rounded-lg min-h-[200px]">
                <div className="h-24 bg-[var(--muted)] rounded animate-pulse" />
                <div className="h-24 bg-[var(--muted)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : kanbanData?.stages ? (
        <KanbanBoard
          stages={kanbanData.stages}
          type="leads"
          onCardClick={(id) => router.push(`/crm/leads/${id}`)}
        />
      ) : (
        <div className="py-12 text-center text-[var(--muted-foreground)]">
          No hay pipelines configurados.{" "}
          <Link href="/crm/pipelines" className="underline">
            Crear pipeline
          </Link>
        </div>
      )}
    </div>
  );
}
