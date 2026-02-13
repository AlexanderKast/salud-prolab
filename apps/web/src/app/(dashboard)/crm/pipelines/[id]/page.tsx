"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCrmPipeline,
  useCreateCrmPipelineStage,
  useUpdateCrmPipelineStage,
  useDeleteCrmPipelineStage,
} from "@/hooks/use-crm";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pipeline, isLoading } = useCrmPipeline(id);
  const createStage = useCreateCrmPipelineStage();
  const updateStage = useUpdateCrmPipelineStage();
  const deleteStage = useDeleteCrmPipelineStage();
  const [showAdd, setShowAdd] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("#6B7280");

  if (isLoading) return <div className="p-6">Cargando pipeline...</div>;
  if (!pipeline) return <div className="p-6">Pipeline no encontrado</div>;

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    await createStage.mutateAsync({
      pipelineId: id,
      name: newStageName,
      color: newStageColor,
    });
    setNewStageName("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={pipeline.name}
        description={`Pipeline de ${pipeline.type === "LEADS" ? "Leads" : "Negocios"} · ${pipeline.stages?.length ?? 0} etapas`}
      />

      <div className="space-y-2">
        {pipeline.stages?.map((stage: Record<string, unknown>) => (
          <div
            key={stage.id as string}
            className="flex items-center gap-3 rounded-lg border p-3 group"
          >
            <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: stage.color as string }}
            />
            <span className="flex-1 text-sm font-medium">{stage.name as string}</span>
            <div className="flex items-center gap-2">
              {Boolean(stage.isWon) && (
                <Badge className="bg-green-100 text-green-700">Ganado</Badge>
              )}
              {Boolean(stage.isLost) && <Badge className="bg-red-100 text-red-700">Perdido</Badge>}
              <span className="text-xs text-[var(--muted-foreground)]">
                {((stage._count as Record<string, number>)?.leads ?? 0) +
                  ((stage._count as Record<string, number>)?.deals ?? 0)}{" "}
                items
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteStage.mutate({ pipelineId: id, stageId: stage.id as string })}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="rounded-lg border p-3 space-y-3">
          <div className="flex gap-3">
            <Input
              placeholder="Nombre de la etapa..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="flex-1"
            />
            <input
              type="color"
              value={newStageColor}
              onChange={(e) => setNewStageColor(e.target.value)}
              className="h-9 w-9 rounded border cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddStage} disabled={createStage.isPending}>
              Agregar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Etapa
        </Button>
      )}
    </div>
  );
}
