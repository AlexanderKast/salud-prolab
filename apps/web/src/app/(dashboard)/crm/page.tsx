"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useCrmStats } from "@/hooks/use-crm";
import {
  Users,
  UserPlus,
  Handshake,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Mail,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CrmDashboardPage() {
  const { data: stats, isLoading } = useCrmStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="CRM" description="Gestión de relaciones con clientes" />
        <div className="flex gap-2">
          <Link href="/crm/contactos/nuevo">
            <Button size="sm">Nuevo Contacto</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Contactos"
          value={isLoading ? "..." : (stats?.totalContacts ?? 0)}
          trend={`${stats?.newContactsThisMonth ?? 0} nuevos este mes`}
          icon={Users}
        />
        <StatCard
          label="Leads Activos"
          value={isLoading ? "..." : (stats?.totalLeads ?? 0)}
          icon={UserPlus}
        />
        <StatCard
          label="Negocios Activos"
          value={isLoading ? "..." : (stats?.totalDeals ?? 0)}
          icon={Handshake}
        />
        <StatCard
          label="Valor del Pipeline"
          value={
            isLoading ? "..." : `$${Number(stats?.pipelineValue ?? 0).toLocaleString("es-CO")}`
          }
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ganados este mes"
          value={isLoading ? "..." : (stats?.wonDealsThisMonth ?? 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Perdidos este mes"
          value={isLoading ? "..." : (stats?.lostDealsThisMonth ?? 0)}
          icon={TrendingDown}
        />
        <StatCard
          label="Campañas Activas"
          value={isLoading ? "..." : (stats?.activeCampaigns ?? 0)}
          icon={Mail}
        />
        <StatCard
          label="Tasa de Conversión"
          value={
            isLoading
              ? "..."
              : stats?.wonDealsThisMonth && stats?.totalDeals
                ? `${Math.round((stats.wonDealsThisMonth / stats.totalDeals) * 100)}%`
                : "0%"
          }
          icon={Target}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/crm/leads"
          className="rounded-lg border p-4 hover:bg-[var(--accent)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Pipeline de Leads</p>
              <p className="text-sm text-[var(--muted-foreground)]">Ver tablero Kanban de leads</p>
            </div>
          </div>
        </Link>
        <Link
          href="/crm/deals"
          className="rounded-lg border p-4 hover:bg-[var(--accent)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Handshake className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Pipeline de Ventas</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Ver tablero Kanban de negocios
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/crm/campanas"
          className="rounded-lg border p-4 hover:bg-[var(--accent)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium">Email Marketing</p>
              <p className="text-sm text-[var(--muted-foreground)]">Gestionar campañas de email</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
