"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTemplate, useCreateTemplate } from "@/hooks/use-marketing";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import { ArrowLeft, FileText, Save, Variable } from "lucide-react";
import Link from "next/link";

const typeOptions = [
  { value: "EMAIL", label: "Email" },
  { value: "SOCIAL", label: "Red Social" },
  { value: "AD", label: "Anuncio" },
  { value: "LANDING", label: "Landing Page" },
  { value: "SMS", label: "SMS" },
];

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/\{|\}/g, "")))];
}

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const template = useTemplate(isNew ? "" : id);
  const createTemplate = useCreateTemplate();

  const [name, setName] = useState("");
  const [type, setType] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (template.data) {
      setName(template.data.name ?? "");
      setType(template.data.type ?? "EMAIL");
      setSubject(template.data.subject ?? "");
      setBody(template.data.body ?? "");
    }
  }, [template.data]);

  const variables = extractVariables(body + " " + subject);

  const handleSave = () => {
    createTemplate.mutate({ name, type, subject, body });
  };

  if (!isNew && template.isLoading) return <DetailSkeleton />;

  if (!isNew && !template.data) {
    return (
      <EmptyState
        icon={FileText}
        title="Plantilla no encontrada"
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

  // Highlight variables in body
  const highlightedBody = body.replace(
    /\{\{(\w+)\}\}/g,
    '<span class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded text-sm font-mono">{{$1}}</span>'
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/marketing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={isNew ? "Nueva Plantilla" : (template.data?.name ?? "Plantilla")}
          className="mb-0 flex-1"
        />
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {typeOptions.map((opt) => (
                    <SelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje (usa {{variable}} para variables)"
              />
            </div>

            <div>
              <Label htmlFor="body">Contenido</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe el contenido de la plantilla. Usa {{variable}} para variables dinamicas."
                rows={12}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={createTemplate.isPending || !name}
            >
              <Save className="h-4 w-4 mr-2" />
              {createTemplate.isPending ? "Guardando..." : "Guardar plantilla"}
            </Button>
          </div>

          {/* Preview */}
          {body && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">
                Vista previa
              </h3>
              <div
                className="text-sm text-[var(--foreground)] whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightedBody }}
              />
            </div>
          )}
        </div>

        {/* Sidebar: Variables */}
        <div className="w-64 shrink-0">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sticky top-6">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-3">
              <Variable className="h-4 w-4" />
              Variables detectadas
            </h3>
            {variables.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Usa {"{{variable}}"} en el contenido para definir variables dinamicas.
              </p>
            ) : (
              <div className="space-y-2">
                {variables.map((v) => (
                  <div
                    key={v}
                    className="flex items-center gap-2 rounded bg-[var(--muted)] px-3 py-2"
                  >
                    <Badge variant="outline" className="font-mono text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  </div>
                ))}
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  {variables.length} variable{variables.length !== 1 ? "s" : ""} encontrada{variables.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
