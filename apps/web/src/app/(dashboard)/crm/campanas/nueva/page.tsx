"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCrmCampaign, useCrmContacts } from "@/hooks/use-crm";

export default function NuevaCampanaPage() {
  const router = useRouter();
  const createMutation = useCreateCrmCampaign();
  const { data: contactsData } = useCrmContacts({ limit: "100" });
  const contacts = contactsData?.data ?? [];

  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
    fromName: "",
    replyTo: "",
  });
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContactIds.length === 0) return;
    try {
      await createMutation.mutateAsync({
        ...form,
        recipientContactIds: selectedContactIds,
      });
      router.push("/crm/campanas");
    } catch {
      // Error handled by mutation
    }
  };

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Nueva Campaña" description="Crea una nueva campaña de email marketing" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la campaña *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">Nombre del remitente</Label>
            <Input
              id="fromName"
              value={form.fromName}
              onChange={(e) => setForm({ ...form, fromName: e.target.value })}
              placeholder="Salud ProLab"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Asunto del email *</Label>
          <Input
            id="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Contenido del email *</Label>
          <Textarea
            id="body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={8}
            placeholder="Escribe el contenido HTML del email..."
            required
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Variables disponibles: {"{{firstName}}"}, {"{{lastName}}"}, {"{{companyName}}"}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Destinatarios * ({selectedContactIds.length} seleccionados)</Label>
          <div className="rounded-lg border max-h-60 overflow-y-auto p-2 space-y-1">
            {contacts.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] p-2">
                No hay contactos con email
              </p>
            ) : (
              contacts
                .filter((c: Record<string, unknown>) => c.email)
                .map((contact: Record<string, unknown>) => (
                  <label
                    key={contact.id as string}
                    className="flex items-center gap-3 p-2 rounded hover:bg-[var(--muted)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContactIds.includes(contact.id as string)}
                      onChange={() => toggleContact(contact.id as string)}
                    />
                    <div>
                      <p className="text-sm">
                        {contact.firstName as string} {(contact.lastName as string) || ""}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {contact.email as string}
                      </p>
                    </div>
                  </label>
                ))
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createMutation.isPending || selectedContactIds.length === 0}
          >
            {createMutation.isPending ? "Creando..." : "Crear Campaña"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/crm/campanas")}>
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
