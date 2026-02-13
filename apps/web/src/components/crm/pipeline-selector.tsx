"use client";

interface Pipeline {
  id: string;
  name: string;
  _count?: { leads?: number; deals?: number };
}

interface PipelineSelectorProps {
  pipelines: Pipeline[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PipelineSelector({ pipelines, selectedId, onSelect }: PipelineSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {pipelines.map((pipeline) => (
        <button
          key={pipeline.id}
          onClick={() => onSelect(pipeline.id)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedId === pipeline.id
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
          }`}
        >
          {pipeline.name}
        </button>
      ))}
    </div>
  );
}
