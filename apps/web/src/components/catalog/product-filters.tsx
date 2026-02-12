"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ProductFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
  categories?: { id: string; name: string }[];
  countries?: { id: string; name: string }[];
}

export function ProductFilters({
  filters,
  onChange,
  categories = [],
  countries = [],
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Buscar productos..."
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </div>

      {/* Category */}
      <Select
        className="w-44"
        value={filters.category ?? ""}
        onChange={(e) => onChange("category", e.target.value)}
      >
        <SelectOption value="">Todas las categorias</SelectOption>
        {categories.map((c) => (
          <SelectOption key={c.id} value={c.id}>
            {c.name}
          </SelectOption>
        ))}
      </Select>

      {/* Country */}
      <Select
        className="w-36"
        value={filters.country ?? ""}
        onChange={(e) => onChange("country", e.target.value)}
      >
        <SelectOption value="">Todos los paises</SelectOption>
        {countries.map((c) => (
          <SelectOption key={c.id} value={c.id}>
            {c.name}
          </SelectOption>
        ))}
      </Select>

      {/* Status */}
      <Select
        className="w-36"
        value={filters.status ?? ""}
        onChange={(e) => onChange("status", e.target.value)}
      >
        <SelectOption value="">Todos los estados</SelectOption>
        <SelectOption value="ACTIVE">Activo</SelectOption>
        <SelectOption value="DRAFT">Borrador</SelectOption>
        <SelectOption value="ARCHIVED">Archivado</SelectOption>
        <SelectOption value="DISCONTINUED">Descontinuado</SelectOption>
      </Select>

      {/* Price range */}
      <Input
        type="number"
        placeholder="Precio min"
        className="w-28"
        value={filters.priceMin ?? ""}
        onChange={(e) => onChange("priceMin", e.target.value)}
      />
      <Input
        type="number"
        placeholder="Precio max"
        className="w-28"
        value={filters.priceMax ?? ""}
        onChange={(e) => onChange("priceMax", e.target.value)}
      />
    </div>
  );
}
