"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ExternalLink } from "lucide-react";

interface Benchmark {
  id: string;
  competitorName: string;
  url?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  pros?: string;
  cons?: string;
}

interface BenchmarkTableProps {
  benchmarks: Benchmark[];
  onAdd?: (data: Omit<Benchmark, "id">) => void;
  adding?: boolean;
}

export function BenchmarkTable({ benchmarks, onAdd, adding }: BenchmarkTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    competitorName: "",
    url: "",
    price: "",
    rating: "",
    reviews: "",
    pros: "",
    cons: "",
  });

  const handleSubmit = () => {
    if (!form.competitorName) return;
    onAdd?.({
      competitorName: form.competitorName,
      url: form.url || undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      rating: form.rating ? parseFloat(form.rating) : undefined,
      reviews: form.reviews ? parseInt(form.reviews) : undefined,
      pros: form.pros || undefined,
      cons: form.cons || undefined,
    });
    setForm({ competitorName: "", url: "", price: "", rating: "", reviews: "", pros: "", cons: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Benchmarks de Competidores
        </h3>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar benchmark
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Input
              placeholder="Nombre del competidor *"
              value={form.competitorName}
              onChange={(e) => setForm({ ...form, competitorName: e.target.value })}
            />
            <Input
              placeholder="URL"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Precio"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Rating (0-5)"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Resenas"
              value={form.reviews}
              onChange={(e) => setForm({ ...form, reviews: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Textarea
              placeholder="Ventajas"
              value={form.pros}
              onChange={(e) => setForm({ ...form, pros: e.target.value })}
              rows={2}
            />
            <Textarea
              placeholder="Desventajas"
              value={form.cons}
              onChange={(e) => setForm({ ...form, cons: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={adding}>
              {adding ? "Guardando..." : "Guardar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Competidor</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Resenas</TableHead>
            <TableHead>Ventajas</TableHead>
            <TableHead>Desventajas</TableHead>
            <TableHead>URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {benchmarks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[var(--muted-foreground)] py-8">
                Sin benchmarks registrados
              </TableCell>
            </TableRow>
          ) : (
            benchmarks.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.competitorName}</TableCell>
                <TableCell>{b.price != null ? `$${b.price.toFixed(2)}` : "-"}</TableCell>
                <TableCell>{b.rating ?? "-"}</TableCell>
                <TableCell>{b.reviews ?? "-"}</TableCell>
                <TableCell className="max-w-[150px] truncate">{b.pros ?? "-"}</TableCell>
                <TableCell className="max-w-[150px] truncate">{b.cons ?? "-"}</TableCell>
                <TableCell>
                  {b.url ? (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
