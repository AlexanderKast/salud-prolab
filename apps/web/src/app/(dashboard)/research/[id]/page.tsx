"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useResearchNote,
  useUpdateResearchNote,
  useBenchmarks,
  useCreateBenchmark,
} from "@/hooks/use-research";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ResearchEditor } from "@/components/research/research-editor";
import { BenchmarkTable } from "@/components/research/benchmark-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const note = useResearchNote(id);
  const updateNote = useUpdateResearchNote();
  const benchmarks = useBenchmarks(id);
  const createBenchmark = useCreateBenchmark();

  if (note.isLoading) return <DetailSkeleton />;

  if (!note.data) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="Investigacion no encontrada"
        action={
          <Button asChild variant="outline">
            <Link href="/research">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a investigaciones
            </Link>
          </Button>
        }
      />
    );
  }

  const handleSave = (data: {
    title: string;
    content: string;
    source: string;
    tags: string[];
  }) => {
    updateNote.mutate({ id, ...data });
  };

  const handleAddBenchmark = (data: Record<string, unknown>) => {
    createBenchmark.mutate({ noteId: id, ...data });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/research">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={note.data.title ?? "Investigacion"}
          className="mb-0 flex-1"
        />
      </div>

      <div className="space-y-8">
        {/* Editor */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <ResearchEditor
            initialData={note.data}
            onSave={handleSave}
            saving={updateNote.isPending}
          />
        </div>

        {/* Benchmarks */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <BenchmarkTable
            benchmarks={benchmarks.data ?? []}
            onAdd={handleAddBenchmark}
            adding={createBenchmark.isPending}
          />
        </div>
      </div>
    </div>
  );
}
