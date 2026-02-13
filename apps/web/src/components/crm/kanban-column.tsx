"use client";

interface KanbanColumnProps {
  name: string;
  color: string;
  count: number;
  isWon?: boolean;
  isLost?: boolean;
  children: React.ReactNode;
}

export function KanbanColumn({ name, color, count, children }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 min-w-[288px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold truncate">{name}</h3>
        <span className="ml-auto text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2 p-1 rounded-lg bg-[var(--muted)]/30 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
