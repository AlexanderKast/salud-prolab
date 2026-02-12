"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Megaphone,
  User,
  Shield,
  Users,
  Truck,
  FolderTree,
  Globe,
  FileText,
} from "lucide-react";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo", icon: Package },
  { href: "/research", label: "Investigación", icon: FlaskConical },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/perfil", label: "Mi Perfil", icon: User },
];

const adminNav = [
  { href: "/admin", label: "Panel Admin", icon: Shield },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/paises", label: "Países", icon: Globe },
  { href: "/admin/audit", label: "Auditoría", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)]">
      <div className="flex h-14 items-center border-b border-[var(--sidebar-border)] px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] text-sm font-bold">
            SP
          </div>
          <span className="text-sm font-semibold text-[var(--sidebar-foreground)]">
            Salud ProLab
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Principal
        </p>
        {mainNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-medium"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-[var(--sidebar-border)]" />
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Administración
            </p>
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-medium"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate text-[var(--sidebar-foreground)]">
              {session?.user?.name || "Usuario"}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {session?.user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
