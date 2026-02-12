"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useAdminCategories, useAdminCountries } from "@/hooks/use-admin";
import { useAddToCollection, useCollections } from "@/hooks/use-collections";
import { PageHeader } from "@/components/shared/page-header";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectOption } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

export default function CatalogoPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const products = useProducts({ ...filters, page: String(page) });
  const categories = useAdminCategories();
  const countries = useAdminCountries();
  const collections = useCollections();
  const addToCollection = useAddToCollection();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPage(1);
  };

  const handleAddToCollection = (productId: string) => {
    setSelectedProductId(productId);
    setAddDialogOpen(true);
  };

  const confirmAdd = () => {
    if (selectedProductId && selectedCollectionId) {
      addToCollection.mutate(
        { collectionId: selectedCollectionId, productId: selectedProductId },
        { onSuccess: () => setAddDialogOpen(false) }
      );
    }
  };

  const items = products.data?.data ?? products.data ?? [];
  const totalPages = products.data?.totalPages ?? 1;

  return (
    <div>
      <PageHeader
        title="Catalogo de Productos"
        description="Explora y gestiona el catalogo completo de productos"
      />

      <ProductFilters
        filters={filters}
        onChange={handleFilterChange}
        categories={(categories.data?.data ?? categories.data ?? []).map(
          (c: Record<string, string>) => ({ id: c.id, name: c.name })
        )}
        countries={(countries.data?.data ?? countries.data ?? []).map(
          (c: Record<string, string>) => ({ id: c.id, name: c.name })
        )}
      />

      {products.isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin productos"
          description="No se encontraron productos con los filtros aplicados"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product: Record<string, unknown>) => (
              <ProductCard
                key={product.id as string}
                product={product as never}
                onAddToCollection={handleAddToCollection}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Pagina {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add to Collection Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar a coleccion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
            >
              <SelectOption value="">Seleccionar coleccion...</SelectOption>
              {(collections.data ?? []).map(
                (col: Record<string, string>) => (
                  <SelectOption key={col.id} value={col.id}>
                    {col.name}
                  </SelectOption>
                )
              )}
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmAdd}
                disabled={!selectedCollectionId || addToCollection.isPending}
              >
                {addToCollection.isPending ? "Agregando..." : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
