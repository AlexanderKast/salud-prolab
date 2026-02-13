"use client";

import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";

interface Stage {
  id: string;
  name: string;
  color: string;
  isWon?: boolean;
  isLost?: boolean;
  _count?: { leads?: number; deals?: number };
  leads?: Array<Record<string, unknown>>;
  deals?: Array<Record<string, unknown>>;
}

interface KanbanBoardProps {
  stages: Stage[];
  type: "leads" | "deals";
  onCardClick?: (id: string) => void;
}

export function KanbanBoard({ stages, type, onCardClick }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
      {stages.map((stage) => {
        const items = type === "leads" ? (stage.leads ?? []) : (stage.deals ?? []);
        const count =
          type === "leads"
            ? (stage._count?.leads ?? items.length)
            : (stage._count?.deals ?? items.length);

        return (
          <KanbanColumn
            key={stage.id}
            name={stage.name}
            color={stage.color}
            count={count}
            isWon={stage.isWon}
            isLost={stage.isLost}
          >
            {items.map((item) => (
              <KanbanCard
                key={item.id as string}
                item={item}
                type={type}
                onClick={() => onCardClick?.(item.id as string)}
              />
            ))}
          </KanbanColumn>
        );
      })}
    </div>
  );
}
