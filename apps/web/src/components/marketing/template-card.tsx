"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Variable } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    type?: string;
    subject?: string;
    variablesCount?: number;
  };
  className?: string;
}

const typeLabels: Record<string, string> = {
  EMAIL: "Email",
  SOCIAL: "Red Social",
  AD: "Anuncio",
  LANDING: "Landing Page",
  SMS: "SMS",
};

export function TemplateCard({ template, className }: TemplateCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary)]">
          <FileText className="h-5 w-5 text-[var(--secondary-foreground)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] truncate">
            {template.name}
          </h3>
          {template.subject && (
            <p className="text-sm text-[var(--muted-foreground)] truncate mt-0.5">
              {template.subject}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {template.type && (
          <Badge variant="outline">{typeLabels[template.type] ?? template.type}</Badge>
        )}
        {template.variablesCount != null && (
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Variable className="h-3 w-3" />
            {template.variablesCount} variables
          </span>
        )}
      </div>

      <div className="mt-3">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/marketing/plantilla/${template.id}`}>
            <Eye className="h-3.5 w-3.5 mr-1" />
            Ver plantilla
          </Link>
        </Button>
      </div>
    </div>
  );
}
