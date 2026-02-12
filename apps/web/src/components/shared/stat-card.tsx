"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  borderColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  borderColor = "border-l-[var(--primary)]",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm border-l-4",
        borderColor,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <Icon className="h-5 w-5 text-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}
