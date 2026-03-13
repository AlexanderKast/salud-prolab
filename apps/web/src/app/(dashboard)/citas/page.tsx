"use client";

import { useState } from "react";
import { useAppointments } from "@/hooks/use-ghl";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User } from "lucide-react";

const statusLabels: Record<string, string> = {
  PROGRAMADA: "Programada",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

const statusColors: Record<string, string> = {
  PROGRAMADA: "bg-blue-100 text-blue-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  COMPLETADA: "bg-gray-100 text-gray-800",
  CANCELADA: "bg-red-100 text-red-800",
  NO_ASISTIO: "bg-yellow-100 text-yellow-800",
};

export default function CitasPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useAppointments(Object.keys(filters).length ? filters : undefined);
  const items = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Citas</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Calendario de citas y reuniones</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "PROGRAMADA", "CONFIRMADA", "COMPLETADA"].map((s) => (
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
            <div key={i} className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="mt-4 text-lg font-medium">Sin citas</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Programa tu primera cita para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((apt: any) => (
            <div
              key={apt.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[var(--muted)]">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {new Date(apt.startAt).toLocaleDateString("es", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    {new Date(apt.startAt).getDate()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">{apt.title}</p>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <span>
                      {new Date(apt.startAt).toLocaleTimeString("es", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(apt.endAt).toLocaleTimeString("es", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {apt.location}
                      </span>
                    )}
                    {apt.contact && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {apt.contact.firstName} {apt.contact.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {apt.assignedTo && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {apt.assignedTo.name}
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[apt.status] || ""}`}
                >
                  {statusLabels[apt.status] || apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
