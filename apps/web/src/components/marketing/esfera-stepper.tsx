"use client";

import { cn } from "@/lib/utils";
import {
  Target,
  Users,
  Filter,
  Zap,
  FolderOpen,
  BarChart3,
} from "lucide-react";

const PHASES = [
  { key: "estrategia", label: "Estrategia", icon: Target },
  { key: "segmentos", label: "Segmentos", icon: Users },
  { key: "funnel", label: "Funnel", icon: Filter },
  { key: "ejecucion", label: "Ejecucion", icon: Zap },
  { key: "recursos", label: "Recursos", icon: FolderOpen },
  { key: "analisis", label: "Analisis", icon: BarChart3 },
] as const;

export type EsferaPhase = (typeof PHASES)[number]["key"];

interface EsferaStepperProps {
  activePhase: EsferaPhase;
  onPhaseChange: (phase: EsferaPhase) => void;
  className?: string;
}

export function EsferaStepper({
  activePhase,
  onPhaseChange,
  className,
}: EsferaStepperProps) {
  return (
    <nav className={cn("space-y-1", className)}>
      <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        Fases ESFERA
      </p>
      {PHASES.map((phase, idx) => {
        const isActive = activePhase === phase.key;
        return (
          <button
            key={phase.key}
            type="button"
            onClick={() => onPhaseChange(phase.key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left",
              isActive
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
                : "text-[var(--foreground)] hover:bg-[var(--muted)]"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                isActive
                  ? "bg-[var(--primary-foreground)] text-[var(--primary)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}
            >
              {idx + 1}
            </span>
            <phase.icon className="h-4 w-4 shrink-0" />
            <span>{phase.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { PHASES };
