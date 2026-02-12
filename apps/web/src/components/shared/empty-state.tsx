"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center",
        className
      )}
    >
      <Icon className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
      <h3 className="text-lg font-medium text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
