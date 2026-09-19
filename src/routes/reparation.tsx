import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CheckCircle2, Clock, Phone, Truck, Wrench } from "lucide-react";
import { toast } from "sonner";
import repairImg from "@/assets/repair.jpg";
import { moroccanCities, phoneBrands, repairTypes } from "@/data/repair";
import { makeReference, saveRepairRequest, type RepairRequest } from "@/lib/orders";
import { SectionHeading } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMAD } from "@/lib/format";

export const Route = createFileRoute("/reparation")({
  head: () => ({
    meta: [
      { title: "Réparation téléphone au Maroc — OROTRONIX" },
      {
        name: "description",
        content:
          "Réparation professionnelle de smartphone : écran, batterie, port de charge, caméra, audio, logiciel, oxydation. Ramassage et livraison à domicile.",
      },
      { property: "og:title", content: "Réparation de téléphone — OROTRONIX" },
      {
        property: "og:description",
        content: "Diagnostic honnête, pièces de qualité, ramassage et retour à domicile partout au Maroc.",
      },
    ],
  }),
  component: RepairPage,
});

function RepairPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow">Atelier OROTRONIX</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Réparation <span className="text-gradient-gold">professionnelle</span> de téléphone
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Diagnostic transparent, pièces de qualité et garantie sur l'intervention. Déposez votre
              appareil en atelier ou demandez le ramassage à domicile.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><a href="#demande">Demander une réparation</a></Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:+212600000000"><Phone className="mr-2 h-4 w-4" /> Appeler l'atelier</a>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <img src={repairImg} alt="Technicien réparant un smartphone" width={1200} height={912} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* TYPES DE REPARATION */}
      <section className="container-page py-16 lg:py-20">
        <SectionHeading
          eyebrow="Nos interventions"
          title="Types de réparation"
          description="Tarifs indicatifs à partir de. Le prix final est confirmé après diagnostic, toujours avec votre accord."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {repairTypes.map((r) => (
            <article key={r.id} className="hover-lift rounded-xl border border-border bg-card p-5">
              <Wrench className="h-5 w-5 text-gold" />
              <h3 className="mt-4 font-display text-base font-semibold">{r.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-gold">
                  {r.from > 0 ? `Dès ${formatMAD(r.from)}` : "Diagnostic gratuit"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> {r.duration}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* RAMASSAGE */}
      <section id="ramassage" className="border-y border-border bg-surface/30">
        <div className="container-page py-16 lg:py-20">
          <SectionHeading
            eyebrow="Service à domicile"
            title="Ramassage et livraison de votre réparation"
            description="Vous ne vous déplacez pas : nous récupérons l'appareil, nous réparons, nous vous le rendons."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: <Truck className="h-5 w-5" />, title: "Ramassage à votre adresse", text: "Casablanca et principales villes du Maroc." },
              { icon: <Wrench className="h-5 w-5" />, title: "Réparation en atelier", text: "Diagnostic, devis validé par vous, puis intervention." },
              { icon: <BadgeCheck className="h-5 w-5" />, title: "Retour garanti", text: "Contrôle qualité et garantie sur la pièce remplacée." },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/30 text-gold">
                  {s.icon}
                </span>
                <h3 className="mt-5 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RepairForm />
    </div>
  );
}

function RepairForm() {
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    brand: "",
    model: "",
    problemType: "",
    problemDescription: "",
    notes: "",
  });
  const [pickup, setPickup] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<RepairRequest | null>(null);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 3) next.fullName = "Indiquez votre nom complet.";
    if (!/^[0-9+\s]{9,15}$/.test(values.phone.trim())) next.phone = "Numéro de téléphone invalide.";
    if (!values.city) next.city = "Choisissez votre ville.";
    if (values.address.trim().length < 8) next.address = "Indiquez une adresse complète.";
    if (!values.brand) next.brand = "Choisissez la marque.";
    if (values.model.trim().length < 2) next.model = "Indiquez le modèle.";
    if (!values.problemType) next.problemType = "Choisissez le type de panne.";
    if (values.problemDescription.trim().length < 10) next.problemDescription = "Décrivez le problème (10 caractères min.).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les champs indiqués.");
      return;
    }
    const request: RepairRequest = {
      reference: makeReference("REP"),
      createdAt: new Date().toISOString(),
      ...values,
      pickup,
    };
    saveRepairRequest(request);
    setSubmitted(request);
    toast.success("Demande enregistrée", { description: `Référence ${request.reference}` });
  };

  if (submitted) {
    return (
      <section id="demande" className="container-page py-16 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gold/40 bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Demande de réparation envoyée</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Référence <span className="text-gold">{submitted.reference}</span>. Notre équipe vous
            rappelle au {submitted.phone} pour confirmer le diagnostic
            {submitted.pickup ? " et le créneau de ramassage" : " et le dépôt en atelier"}.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild><a href="tel:+212600000000"><Phone className="mr-2 h-4 w-4" /> Appeler maintenant</a></Button>
            <Button variant="outline" onClick={() => setSubmitted(null)}>Nouvelle demande</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="demande" className="container-page py-16 lg:py-20">
      <SectionHeading
        eyebrow="Formulaire"
        title="Demander une réparation"
        description="Décrivez votre panne : nous vous rappelons rapidement avec une estimation et un créneau."
      />

      <form onSubmit={submit} className="grid gap-6 rounded-2xl border border-border bg-card p-6 lg:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="fullName" label="Nom complet" error={errors.fullName}>
            <Input id="fullName" value={values.fullName} onChange={(e) => set("fullName")(e.target.value)} placeholder="Ex. Salma Bennani" className="bg-surface" />
          </Field>
          <Field id="phone" label="Numéro de téléphone" error={errors.phone}>
            <Input id="phone" value={values.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="06 00 00 00 00" inputMode="tel" className="bg-surface" />
          </Field>
          <Field id="city" label="Ville" error={errors.city}>
            <Select value={values.city} onValueChange={set("city")}>
              <SelectTrigger id="city" className="bg-surface"><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
              <SelectContent>
                {moroccanCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field id="brand" label="Marque du téléphone" error={errors.brand}>
            <Select value={values.brand} onValueChange={set("brand")}>
              <SelectTrigger id="brand" className="bg-surface"><SelectValue placeholder="Choisir une marque" /></SelectTrigger>
              <SelectContent>
                {phoneBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field id="model" label="Modèle" error={errors.model}>
            <Input id="model" value={values.model} onChange={(e) => set("model")(e.target.value)} placeholder="Ex. iPhone 13 Pro" className="bg-surface" />
          </Field>
          <Field id="problemType" label="Type de problème" error={errors.problemType}>
            <Select value={values.problemType} onValueChange={set("problemType")}>
              <SelectTrigger id="problemType" className="bg-surface"><SelectValue placeholder="Choisir une panne" /></SelectTrigger>
              <SelectContent>
                {repairTypes.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field id="address" label="Adresse" error={errors.address}>
          <Textarea id="address" rows={2} value={values.address} onChange={(e) => set("address")(e.target.value)} placeholder="Quartier, rue, numéro, étage…" className="bg-surface" />
        </Field>

        <Field id="problemDescription" label="Description du problème" error={errors.problemDescription}>
          <Textarea id="problemDescription" rows={4} value={values.problemDescription} onChange={(e) => set("problemDescription")(e.target.value)} placeholder="Depuis quand ? Suite à une chute ? Que se passe-t-il exactement ?" className="bg-surface" />
        </Field>

        <Field id="notes" label="Notes supplémentaires (optionnel)">
          <Textarea id="notes" rows={2} value={values.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Disponibilités, code d'accès, remarques…" className="bg-surface" />
        </Field>

        <label className="flex items-start gap-3 rounded-lg border border-gold/30 bg-surface p-4">
          <Checkbox checked={pickup} onCheckedChange={(v) => setPickup(v === true)} className="mt-0.5" />
          <span>
            <span className="font-display text-sm font-semibold">Je souhaite le ramassage et la livraison à domicile</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Un coursier récupère l'appareil chez vous et vous le rapporte réparé.
            </span>
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full sm:w-auto sm:justify-self-start">
          Envoyer la demande
        </Button>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
