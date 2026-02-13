"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrmPipelines, useCreateCrmPipeline } from "@/hooks/use-crm";
import { Plus, GitBranch } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function PipelinesPage() {
  const { data: pipelines, isLoading } = useCrmPipelines();
  const createPipeline = useCreateCrmPipeline();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"LEADS" | "DEALS">("LEADS");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createPipeline.mutateAsync({ name: newName, type: newType });
    setNewName("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Pipelines" description="Configura tus pipelines de leads y negocios" />
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pipeline
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <Input
            placeholder="Nombre del pipeline..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="LEADS"
                checked={newType === "LEADS"}
                onChange={() => setNewType("LEADS")}
              />
              <span className="text-sm">Leads</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="DEALS"
                checked={newType === "DEALS"}
                onChange={() => setNewType("DEALS")}
              />
              <span className="text-sm">Negocios</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createPipeline.isPending}>
              Crear
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-[var(--muted)] rounded animate-pulse" />
          ))}
        </div>
      ) : !pipelines || pipelines.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted-foreground)]">
          No hay pipelines configurados. Crea uno para comenzar.
        </div>
      ) : (
        <div className="space-y-3">
          {pipelines.map((pipeline: Record<string, unknown>) => (
            <Link
              key={pipeline.id as string}
              href={`/crm/pipelines/${pipeline.id}`}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-[var(--muted)]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="font-medium">{pipeline.name as string}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {(pipeline.stages as Array<Record<string, unknown>>)?.length ?? 0} etapas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{pipeline.type as string}</Badge>
                {Boolean(pipeline.isDefault) && <Badge variant="outline">Default</Badge>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
