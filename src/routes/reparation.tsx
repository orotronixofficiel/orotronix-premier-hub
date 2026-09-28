import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Phone, Truck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { moroccanCities, phoneBrands, repairTypes } from "@/data/repair";
import { makeReference, saveRepairRequest, type RepairRequest } from "@/lib/orders";
import { formatMAD } from "@/lib/format";

export const Route = createFileRoute("/reparation")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Réparation téléphone au Maroc — OROTRONIX" },
      {
        name: "description",
        content: "Réparation professionnelle de smartphones : écran, batterie, charge, caméra, audio, logiciel et oxydation.",
      },
    ],
  }),
  component: RepairPage,
});

function RepairPage() {
  const [submitted, setSubmitted] = useState<RepairRequest | null>(null);

  return (
    <main className="min-h-screen">
      <section className="border-b border-border">
        <div className="container-page py-14 lg:py-20">
          <p className="eyebrow">Atelier OROTRONIX</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Réparation <span className="text-gradient-gold">professionnelle</span> de téléphone
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Diagnostic transparent, pièces de qualité et intervention réalisée avec soin.
            Déposez votre téléphone en atelier ou demandez le ramassage à domicile.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#demande" className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-5 text-sm font-semibold text-black">
              Demander une réparation
            </a>
            <a href="tel:+212656566366" className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold">
              <Phone className="mr-2 h-4 w-4" /> 06 56 56 63 66
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <p className="eyebrow">Nos interventions</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Types de réparation</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Tarifs indicatifs à partir de. Le prix final est confirmé après diagnostic.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {repairTypes.map((repair) => (
            <article key={repair.id} className="rounded-xl border border-border bg-card p-5">
              <Wrench className="h-5 w-5 text-gold" />
              <h3 className="mt-4 font-display font-semibold">{repair.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{repair.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-gold">
                  {repair.from > 0 ? `Dès ${formatMAD(repair.from)}` : "Diagnostic"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> {repair.duration}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/30">
        <div className="container-page py-14 lg:py-20">
          <p className="eyebrow">Service à domicile</p>
          <h2 className="mt-3 font-display text-3xl font-bold">Ramassage et livraison</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard icon={<Truck className="h-5 w-5" />} title="Ramassage" text="Nous récupérons votre appareil selon le créneau convenu." />
            <InfoCard icon={<Wrench className="h-5 w-5" />} title="Réparation" text="Diagnostic, validation du devis puis intervention." />
            <InfoCard icon={<CheckCircle2 className="h-5 w-5" />} title="Retour" text="Contrôle de l'appareil puis restitution." />
          </div>
        </div>
      </section>

      {submitted ? (
        <Success request={submitted} onReset={() => setSubmitted(null)} />
      ) : (
        <RepairForm onSubmitted={setSubmitted} />
      )}
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 text-gold">{icon}</span>
      <h3 className="mt-5 font-display font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function RepairForm({ onSubmitted }: { onSubmitted: (request: RepairRequest) => void }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    brand: "",
    model: "",
    problemType: "",
    problemDescription: "",
    notes: "",
    pickup: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};

    if (form.fullName.trim().length < 3) next.fullName = "Nom complet requis.";
    if (!/^[0-9 +]{9,18}$/.test(form.phone.trim())) next.phone = "Numéro invalide.";
    if (!form.city) next.city = "Choisissez une ville.";
    if (form.address.trim().length < 5) next.address = "Adresse requise.";
    if (!form.brand) next.brand = "Choisissez une marque.";
    if (form.model.trim().length < 2) next.model = "Modèle requis.";
    if (!form.problemType) next.problemType = "Choisissez le problème.";
    if (form.problemDescription.trim().length < 10) next.problemDescription = "Décrivez le problème (10 caractères minimum).";

    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Veuillez corriger les champs indiqués.");
      return;
    }

    setLoading(true);
    try {
      const request: RepairRequest = {
        reference: makeReference("REP"),
        createdAt: new Date().toISOString(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        city: form.city,
        address: form.address.trim(),
        brand: form.brand,
        model: form.model.trim(),
        problemType: form.problemType,
        problemDescription: form.problemDescription.trim(),
        notes: form.notes.trim(),
        pickup: form.pickup,
      };

      await saveRepairRequest(request);
      onSubmitted(request);
      toast.success("Demande enregistrée", { description: `Référence ${request.reference}` });
    } catch (error) {
      console.error("OROTRONIX repair error:", error);
      toast.error("Impossible d'enregistrer la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demande" className="container-page py-14 lg:py-20">
      <p className="eyebrow">Formulaire</p>
      <h2 className="mt-3 font-display text-3xl font-bold">Demander une réparation</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Remplissez le formulaire et notre équipe vous contacte pour confirmer la prise en charge.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-border bg-card p-6 lg:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom complet" error={errors.fullName}>
            <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Ex. Salma Bennani" />
          </Field>
          <Field label="Téléphone" error={errors.phone}>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="06 00 00 00 00" inputMode="tel" />
          </Field>
          <Field label="Ville" error={errors.city}>
            <select value={form.city} onChange={(e) => update("city", e.target.value)}>
              <option value="">Choisir une ville</option>
              {moroccanCities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </Field>
          <Field label="Marque" error={errors.brand}>
            <select value={form.brand} onChange={(e) => update("brand", e.target.value)}>
              <option value="">Choisir une marque</option>
              {phoneBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </Field>
          <Field label="Modèle" error={errors.model}>
            <input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="Ex. iPhone 13 Pro" />
          </Field>
          <Field label="Type de problème" error={errors.problemType}>
            <select value={form.problemType} onChange={(e) => update("problemType", e.target.value)}>
              <option value="">Choisir une panne</option>
              {repairTypes.map((repair) => <option key={repair.id} value={repair.name}>{repair.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Adresse" error={errors.address}>
          <textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} placeholder="Quartier, rue, numéro..." />
        </Field>

        <Field label="Description du problème" error={errors.problemDescription}>
          <textarea value={form.problemDescription} onChange={(e) => update("problemDescription", e.target.value)} rows={4} placeholder="Décrivez exactement la panne..." />
        </Field>

        <Field label="Notes supplémentaires">
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} placeholder="Disponibilités ou remarques..." />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gold/30 bg-surface p-4 text-sm">
          <input type="checkbox" checked={form.pickup} onChange={(e) => update("pickup", e.target.checked)} className="mt-1" />
          <span>
            <strong className="block">Je souhaite le ramassage et la livraison</strong>
            <span className="mt-1 block text-xs text-muted-foreground">Nous vous contactons pour confirmer le créneau.</span>
          </span>
        </label>

        <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gold px-6 text-sm font-semibold text-black sm:w-fit">
          {loading ? "Enregistrement..." : "Envoyer la demande"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="mt-2 block [&_input]:h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-border [&_input]:bg-surface [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_select]:h-11 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-border [&_select]:bg-surface [&_select]:px-3 [&_select]:text-sm [&_select]:outline-none [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-border [&_textarea]:bg-surface [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none">
        {children}
      </span>
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Success({ request, onReset }: { request: RepairRequest; onReset: () => void }) {
  return (
    <section id="demande" className="container-page py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gold/40 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Demande envoyée</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre référence est <strong className="text-gold">{request.reference}</strong>.
          Nous vous contacterons au {request.phone} pour confirmer la prise en charge.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="tel:+212656566366" className="inline-flex h-10 items-center rounded-lg bg-gold px-5 text-sm font-semibold text-black">
            <Phone className="mr-2 h-4 w-4" /> Appeler
          </a>
          <button type="button" onClick={onReset} className="h-10 rounded-lg border border-border px-5 text-sm font-semibold">
            Nouvelle demande
          </button>
        </div>
      </div>
    </section>
  );
}
