"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCollections, useAddToCollection } from "@/hooks/use-collections";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectOption } from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Plus,
  Package,
  Image,
  FlaskConical,
  Megaphone,
  HelpCircle,
  ShieldAlert,
  Globe,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = useProduct(id);
  const updateProduct = useUpdateProduct();
  const collections = useCollections();
  const addToCollection = useAddToCollection();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);

  const data = product.data;

  // Initialize edit data when product loads
  if (data && !editData) {
    setEditData({
      name: data.name ?? "",
      sku: data.sku ?? "",
      description: data.description ?? "",
      price: data.price ?? "",
      category: data.categoryId ?? "",
      supplier: data.supplierId ?? "",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
    });
  }

  const handleSave = () => {
    if (!editData) return;
    updateProduct.mutate({ id, ...editData });
  };

  const confirmAddToCollection = () => {
    if (selectedCollectionId) {
      addToCollection.mutate(
        { collectionId: selectedCollectionId, productId: id },
        { onSuccess: () => setAddDialogOpen(false) }
      );
    }
  };

  if (product.isLoading) return <DetailSkeleton />;
  if (!data) {
    return (
      <EmptyState
        icon={Package}
        title="Producto no encontrado"
        action={
          <Button asChild variant="outline">
            <Link href="/catalogo">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al catalogo
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/catalogo">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={data.name ?? "Producto"} className="mb-0 flex-1" />
        <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar a coleccion
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="variantes">Variantes</TabsTrigger>
          <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
          <TabsTrigger value="materiales">Materiales</TabsTrigger>
          <TabsTrigger value="investigacion">Investigacion</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="restricciones">Restricciones</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={(editData?.name as string) ?? ""}
                  onChange={(e) => setEditData((d) => ({ ...d!, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>SKU</Label>
                <Input
                  value={(editData?.sku as string) ?? ""}
                  onChange={(e) => setEditData((d) => ({ ...d!, sku: e.target.value }))}
                />
              </div>
              <div>
                <Label>Precio base</Label>
                <Input
                  type="number"
                  value={(editData?.price as string) ?? ""}
                  onChange={(e) => setEditData((d) => ({ ...d!, price: e.target.value }))}
                />
              </div>
              <div>
                <Label>Etiquetas (separadas por coma)</Label>
                <Input
                  value={(editData?.tags as string) ?? ""}
                  onChange={(e) => setEditData((d) => ({ ...d!, tags: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Descripcion</Label>
              <Textarea
                value={(editData?.description as string) ?? ""}
                onChange={(e) => setEditData((d) => ({ ...d!, description: e.target.value }))}
                rows={5}
              />
            </div>
            <Button onClick={handleSave} disabled={updateProduct.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProduct.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </TabsContent>

        {/* Variantes Tab */}
        <TabsContent value="variantes">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Variantes del producto
              </h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar variante
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.variants ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-[var(--muted-foreground)] py-8"
                    >
                      Sin variantes registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  (data.variants ?? []).map((v: Record<string, unknown>) => (
                    <TableRow key={v.id as string}>
                      <TableCell className="font-medium">{v.name as string}</TableCell>
                      <TableCell>{v.sku as string}</TableCell>
                      <TableCell>${(v.price as number)?.toFixed(2)}</TableCell>
                      <TableCell>{(v.stock as number) ?? "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Disponibilidad Tab */}
        <TabsContent value="disponibilidad">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Disponibilidad por pais
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pais</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Precio local</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.availability ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-[var(--muted-foreground)] py-8"
                    >
                      Sin disponibilidad configurada
                    </TableCell>
                  </TableRow>
                ) : (
                  (data.availability ?? []).map((a: Record<string, unknown>) => (
                    <TableRow key={a.countryId as string}>
                      <TableCell className="font-medium">{a.countryName as string}</TableCell>
                      <TableCell>
                        <Badge variant={a.active ? "default" : "secondary"}>
                          {a.active ? "Si" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {a.localPrice
                          ? `${a.currency ?? "$"} ${(a.localPrice as number).toFixed(2)}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Materiales Tab */}
        <TabsContent value="materiales">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Image className="h-4 w-4" />
                Materiales y recursos
              </h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Subir material
              </Button>
            </div>
            {(data.materials ?? []).length === 0 ? (
              <EmptyState
                icon={Image}
                title="Sin materiales"
                description="Sube imagenes, documentos y otros recursos del producto"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(data.materials ?? []).map((m: Record<string, unknown>) => (
                  <div
                    key={m.id as string}
                    className="rounded-lg border border-[var(--border)] overflow-hidden"
                  >
                    <div className="h-32 bg-[var(--muted)] flex items-center justify-center">
                      <Image className="h-8 w-8 text-[var(--muted-foreground)]" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{m.name as string}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{m.type as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Investigacion Tab */}
        <TabsContent value="investigacion">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <FlaskConical className="h-4 w-4" />
              Notas de investigacion vinculadas
            </h3>
            {(data.researchNotes ?? []).length === 0 ? (
              <EmptyState
                icon={FlaskConical}
                title="Sin investigaciones"
                description="No hay notas de investigacion vinculadas a este producto"
                action={
                  <Button asChild variant="outline">
                    <Link href="/research">Ir a investigacion</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {(data.researchNotes ?? []).map((note: Record<string, unknown>) => (
                  <Link
                    key={note.id as string}
                    href={`/research/${note.id}`}
                    className="block rounded-lg border border-[var(--border)] p-4 hover:bg-[var(--muted)] transition-colors"
                  >
                    <h4 className="font-medium">{note.title as string}</h4>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {(note.benchmarkCount as number) ?? 0} benchmarks
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Megaphone className="h-4 w-4" />
              Informacion de marketing
            </h3>
            {(data.playbooks ?? []).length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Sin playbooks vinculados"
                description="No hay playbooks de marketing vinculados a este producto"
                action={
                  <Button asChild variant="outline">
                    <Link href="/marketing">Ir a marketing</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {(data.playbooks ?? []).map((pb: Record<string, unknown>) => (
                  <Link
                    key={pb.id as string}
                    href={`/marketing/playbook/${pb.id}`}
                    className="block rounded-lg border border-[var(--border)] p-4 hover:bg-[var(--muted)] transition-colors"
                  >
                    <h4 className="font-medium">{pb.title as string}</h4>
                    <Badge variant="outline" className="mt-1">
                      {pb.status as string}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Preguntas frecuentes
              </h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar FAQ
              </Button>
            </div>
            {(data.faqs ?? []).length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="Sin FAQs"
                description="Agrega preguntas frecuentes para este producto"
              />
            ) : (
              <div className="space-y-3">
                {(data.faqs ?? []).map((faq: Record<string, unknown>, i: number) => (
                  <div
                    key={(faq.id as string) ?? i}
                    className="rounded-lg border border-[var(--border)] p-4"
                  >
                    <h4 className="font-medium">{faq.question as string}</h4>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {faq.answer as string}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Restricciones Tab */}
        <TabsContent value="restricciones">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4" />
              Restricciones
            </h3>
            {data.restrictions ? (
              <div className="prose prose-sm max-w-none text-[var(--foreground)]">
                <p className="whitespace-pre-wrap">{data.restrictions}</p>
              </div>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="Sin restricciones"
                description="Este producto no tiene restricciones configuradas"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

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
              {(collections.data?.data ?? []).map((col: Record<string, string>) => (
                <SelectOption key={col.id} value={col.id}>
                  {col.name}
                </SelectOption>
              ))}
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmAddToCollection}
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
