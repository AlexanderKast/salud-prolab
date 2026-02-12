"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Package } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku?: string;
    price?: number;
    currency?: string;
    category?: { name: string };
    status?: string;
    countries?: { code: string; name: string }[];
    imageUrl?: string;
  };
  onAddToCollection?: (id: string) => void;
  className?: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Activo", variant: "default" },
  DRAFT: { label: "Borrador", variant: "secondary" },
  ARCHIVED: { label: "Archivado", variant: "outline" },
  DISCONTINUED: { label: "Descontinuado", variant: "destructive" },
};

export function ProductCard({ product, onAddToCollection, className }: ProductCardProps) {
  const st = statusMap[product.status ?? "DRAFT"] ?? statusMap.DRAFT;

  return (
    <div
      className={cn(
        "group rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Image placeholder */}
      <div className="relative h-48 bg-[var(--muted)] flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-[var(--muted-foreground)]" />
        )}
        <Badge className="absolute top-2 right-2" variant={st.variant}>
          {st.label}
        </Badge>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-[var(--foreground)] truncate">
          {product.name}
        </h3>
        {product.sku && (
          <p className="text-xs text-[var(--muted-foreground)]">SKU: {product.sku}</p>
        )}
        {product.category && (
          <Badge variant="outline" className="text-xs">
            {product.category.name}
          </Badge>
        )}
        {product.price != null && (
          <p className="text-lg font-bold text-[var(--primary)]">
            {product.currency ?? "$"} {product.price.toFixed(2)}
          </p>
        )}
        {product.countries && product.countries.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {product.countries.map((c) => (
              <span
                key={c.code}
                className="text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] px-1.5 py-0.5 rounded"
              >
                {c.code}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/producto/${product.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              Ver
            </Link>
          </Button>
          {onAddToCollection && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAddToCollection(product.id)}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
