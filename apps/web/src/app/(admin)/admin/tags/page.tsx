"use client";

import { useState } from "react";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/use-ghl";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Trash2, Pencil } from "lucide-react";

export default function TagsAdminPage() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6B7280");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await createTag.mutateAsync({ name: newTagName.trim(), color: newTagColor });
    setNewTagName("");
    setNewTagColor("#6B7280");
  };

  const items = Array.isArray(tags) ? tags : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Tags</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Administra las etiquetas del sistema
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex items-center gap-3">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Nombre del tag..."
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
        />
        <input
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border border-[var(--border)]"
        />
        <Button type="submit" size="sm" disabled={createTag.isPending}>
          <Plus className="h-4 w-4 mr-1" />
          Crear
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="mt-4 text-lg font-medium">Sin tags</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Crea tu primer tag para organizar elementos.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((tag: any) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="font-medium text-[var(--foreground)]">{tag.name}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{tag.slug}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("¿Eliminar este tag?")) {
                    deleteTag.mutate(tag.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
