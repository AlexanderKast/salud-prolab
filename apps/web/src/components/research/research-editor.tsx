"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ResearchEditorProps {
  initialData?: {
    title?: string;
    content?: string;
    source?: string;
    tags?: string[];
  };
  onSave: (data: {
    title: string;
    content: string;
    source: string;
    tags: string[];
  }) => void;
  saving?: boolean;
}

export function ResearchEditor({ initialData, onSave, saving }: ResearchEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [source, setSource] = useState(initialData?.source ?? "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") ?? ""
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title ?? "");
      setContent(initialData.content ?? "");
      setSource(initialData.source ?? "");
      setTagsInput(initialData.tags?.join(", ") ?? "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      source,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titulo</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo de la investigacion"
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el contenido de la investigacion..."
          rows={12}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="source">Fuente</Label>
          <Input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="URL o referencia de la fuente"
          />
        </div>

        <div>
          <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="etiqueta1, etiqueta2"
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        <Save className="h-4 w-4 mr-1" />
        {saving ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
