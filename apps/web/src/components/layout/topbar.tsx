"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 hover:bg-[var(--accent)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
          Plataforma de Proveeduría Drop
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted-foreground)]">
          {session?.user?.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
