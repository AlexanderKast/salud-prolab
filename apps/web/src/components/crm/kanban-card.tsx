"use client";

import { User, DollarSign } from "lucide-react";

interface KanbanCardProps {
  item: Record<string, unknown>;
  type: "leads" | "deals";
  onClick?: () => void;
}

export function KanbanCard({ item, type, onClick }: KanbanCardProps) {
  const contact = item.contact as Record<string, string> | undefined;
  const assignedTo = item.assignedTo as Record<string, string> | undefined;

  return (
    <div
      onClick={onClick}
      className="rounded-lg border bg-[var(--card)] p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <p className="text-sm font-medium mb-1 line-clamp-2">{item.title as string}</p>

      {contact && (
        <p className="text-xs text-[var(--muted-foreground)] mb-2">
          {contact.firstName} {contact.lastName || ""}
          {contact.companyName && ` · ${contact.companyName}`}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        {type === "deals" && item.value !== undefined && (
          <span className="flex items-center gap-1 font-medium text-green-600">
            <DollarSign className="h-3 w-3" />
            {Number(item.value).toLocaleString("es-CO")}
          </span>
        )}

        {type === "leads" && item.score !== undefined && (
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
            {item.score as number}pts
          </span>
        )}

        {assignedTo && (
          <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
            <User className="h-3 w-3" />
            {assignedTo.name}
          </span>
        )}
      </div>
    </div>
  );
}
