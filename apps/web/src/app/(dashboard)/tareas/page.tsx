"use client";

import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-ghl";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, AlertTriangle, Circle, CheckCircle } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-gray-100 text-gray-800",
  EN_PROGRESO: "bg-blue-100 text-blue-800",
  COMPLETADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-red-100 text-red-800",
};

const priorityLabels: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

const priorityColors: Record<string, string> = {
  BAJA: "text-gray-500",
  MEDIA: "text-blue-500",
  ALTA: "text-orange-500",
  URGENTE: "text-red-500",
};

export default function TareasPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useTasks(Object.keys(filters).length ? filters : undefined);
  const items = Array.isArray(data?.data) ? data.data : [];
  const updateTask = useUpdateTask();

  const handleToggleComplete = (task: any) => {
    const newStatus = task.status === "COMPLETADA" ? "PENDIENTE" : "COMPLETADA";
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tareas</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Gestiona las tareas del equipo</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "PENDIENTE", "EN_PROGRESO", "COMPLETADA"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s ? statusLabels[s] : "Todas"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckSquare className="h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="mt-4 text-lg font-medium">Sin tareas</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Crea tu primera tarea para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((task: any) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleComplete(task)} className="flex-shrink-0">
                  {task.status === "COMPLETADA" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                  )}
                </button>
                <div>
                  <p
                    className={`font-medium ${task.status === "COMPLETADA" ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    {task.assignedTo && <span>{task.assignedTo.name}</span>}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString("es")}
                      </span>
                    )}
                    {task.contact && (
                      <span>
                        {task.contact.firstName} {task.contact.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${priorityColors[task.priority] || ""}`}>
                  {priorityLabels[task.priority] || task.priority}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status] || ""}`}
                >
                  {statusLabels[task.status] || task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
