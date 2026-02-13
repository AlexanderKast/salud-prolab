"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCrmContact } from "@/hooks/use-crm";

export default function NuevoContactoPage() {
  const router = useRouter();
  const createMutation = useCreateCrmContact();
  const [form, setForm] = useState({
    type: "PERSONA" as "PERSONA" | "EMPRESA",
    source: "MANUAL",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    companyName: "",
    position: "",
    city: "",
    country: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      router.push("/crm/contactos");
    } catch {
      // Error handled by mutation
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Nuevo Contacto" description="Crear un nuevo contacto en el CRM" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="PERSONA"
              checked={form.type === "PERSONA"}
              onChange={(e) => updateField("type", e.target.value)}
            />
            <span className="text-sm">Persona</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="EMPRESA"
              checked={form.type === "EMPRESA"}
              onChange={(e) => updateField("type", e.target.value)}
            />
            <span className="text-sm">Empresa</span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="+57300..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Empresa</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={form.position}
              onChange={(e) => updateField("position", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creando..." : "Crear Contacto"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/crm/contactos")}>
            Cancelar
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-sm text-red-500">{createMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}
