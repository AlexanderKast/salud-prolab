"use client";

import { useSession } from "next-auth/react";
import { useProducts } from "@/hooks/use-products";
import { useResearchNotes } from "@/hooks/use-research";
import { usePlaybooks } from "@/hooks/use-marketing";
import { useCollections } from "@/hooks/use-collections";
import { useAdminUsers, useAuditLogs } from "@/hooks/use-admin";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardsSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Package,
  FlaskConical,
  Megaphone,
  Users,
  Plus,
  ArrowRight,
  FileText,
  BookOpen,
  Star,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!session) return <CardsSkeleton count={4} />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Bienvenido, ${session.user?.name ?? "Usuario"}`}
      />

      {(role === "SUPER_ADMIN" || role === "ADMIN") && <AdminDashboard />}
      {role === "ANALYST" && <AnalystDashboard />}
      {role === "DROPSHIPPER" && <DropshipperDashboard />}
      {role === "GUEST" && <GuestDashboard />}
    </div>
  );
}

// ── Admin / Super Admin Dashboard ───────────────────────────────────────────
function AdminDashboard() {
  const products = useProducts();
  const research = useResearchNotes();
  const playbooks = usePlaybooks();
  const users = useAdminUsers();
  const audit = useAuditLogs({ limit: "5" });

  const isLoading =
    products.isLoading || research.isLoading || playbooks.isLoading || users.isLoading;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Productos"
            value={products.data?.total ?? products.data?.length ?? 0}
            icon={Package}
            borderColor="border-l-blue-500"
          />
          <StatCard
            label="Investigaciones"
            value={research.data?.total ?? research.data?.length ?? 0}
            icon={FlaskConical}
            borderColor="border-l-green-500"
          />
          <StatCard
            label="Playbooks"
            value={playbooks.data?.total ?? playbooks.data?.length ?? 0}
            icon={Megaphone}
            borderColor="border-l-purple-500"
          />
          <StatCard
            label="Usuarios"
            value={users.data?.total ?? users.data?.length ?? 0}
            icon={Users}
            borderColor="border-l-orange-500"
          />
        </div>
      )}

      {/* Recent Audit Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Actividad reciente
          </h2>
          <Button variant="link" asChild>
            <Link href="/admin/audit">
              Ver todo <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {audit.isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Entidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(audit.data?.data ?? audit.data ?? [])
                  .slice(0, 5)
                  .map((log: Record<string, string>) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("es")
                          : "-"}
                      </TableCell>
                      <TableCell>{log.userName ?? log.userId ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.entity ?? "-"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Acciones rapidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/catalogo">
              <Package className="h-4 w-4 mr-2" />
              Ver catalogo
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/research">
              <FlaskConical className="h-4 w-4 mr-2" />
              Nueva investigacion
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/marketing">
              <Megaphone className="h-4 w-4 mr-2" />
              Crear playbook
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/usuarios">
              <Users className="h-4 w-4 mr-2" />
              Gestionar usuarios
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Analyst Dashboard ───────────────────────────────────────────────────────
function AnalystDashboard() {
  const research = useResearchNotes();
  const products = useProducts({ status: "ACTIVE" });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Mis investigaciones"
          value={research.data?.total ?? research.data?.length ?? 0}
          icon={FlaskConical}
          borderColor="border-l-green-500"
        />
        <StatCard
          label="Productos activos"
          value={products.data?.total ?? products.data?.length ?? 0}
          icon={Package}
          borderColor="border-l-blue-500"
        />
        <StatCard
          label="Sin investigacion"
          value="--"
          icon={FileText}
          borderColor="border-l-red-500"
          trend="Productos que necesitan analisis"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Productos sin investigacion
          </h2>
          <Button asChild>
            <Link href="/research">
              <Plus className="h-4 w-4 mr-2" />
              Nueva investigacion
            </Link>
          </Button>
        </div>
        {products.isLoading ? (
          <CardsSkeleton count={3} />
        ) : (products.data?.data ?? products.data ?? []).length === 0 ? (
          <EmptyState
            title="Todos los productos tienen investigacion"
            description="No hay productos pendientes de analisis"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(products.data?.data ?? products.data ?? [])
              .slice(0, 6)
              .map((p: Record<string, unknown>) => (
                <ProductCard key={p.id as string} product={p as never} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dropshipper Dashboard ───────────────────────────────────────────────────
function DropshipperDashboard() {
  const products = useProducts({ status: "ACTIVE" });
  const collections = useCollections();
  const playbooks = usePlaybooks();

  return (
    <div className="space-y-6">
      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Productos destacados
          </h2>
          <Button variant="link" asChild>
            <Link href="/catalogo">
              Ver catalogo <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {products.isLoading ? (
          <CardsSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(products.data?.data ?? products.data ?? [])
              .slice(0, 4)
              .map((p: Record<string, unknown>) => (
                <ProductCard key={p.id as string} product={p as never} />
              ))}
          </div>
        )}
      </div>

      {/* My Collections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Mis colecciones
          </h2>
          <Button variant="link" asChild>
            <Link href="/perfil">
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {collections.isLoading ? (
          <CardsSkeleton count={3} />
        ) : (collections.data ?? []).length === 0 ? (
          <EmptyState
            icon={Star}
            title="Sin colecciones"
            description="Crea tu primera coleccion para organizar productos"
            action={
              <Button asChild>
                <Link href="/perfil">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear coleccion
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(collections.data ?? [])
              .slice(0, 3)
              .map((col: Record<string, unknown>) => (
                <div
                  key={col.id as string}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {col.name as string}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {(col.itemCount as number) ?? 0} productos
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* New Playbooks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Nuevos playbooks
          </h2>
          <Button variant="link" asChild>
            <Link href="/marketing">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {playbooks.isLoading ? (
          <CardsSkeleton count={3} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(playbooks.data?.data ?? playbooks.data ?? [])
              .slice(0, 3)
              .map((pb: Record<string, unknown>) => (
                <Link
                  key={pb.id as string}
                  href={`/marketing/playbook/${pb.id}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {pb.title as string}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {(pb.sectionCount as number) ?? 0} secciones
                  </p>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Guest Dashboard ─────────────────────────────────────────────────────────
function GuestDashboard() {
  const products = useProducts({ status: "ACTIVE" });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Bienvenido a Salud ProLab
        </h2>
        <p className="text-[var(--muted-foreground)] mt-2">
          Tu acceso es limitado. Contacta al administrador para obtener mas permisos.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Vista previa del catalogo
        </h2>
        {products.isLoading ? (
          <CardsSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(products.data?.data ?? products.data ?? [])
              .slice(0, 4)
              .map((p: Record<string, unknown>) => (
                <ProductCard key={p.id as string} product={p as never} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
