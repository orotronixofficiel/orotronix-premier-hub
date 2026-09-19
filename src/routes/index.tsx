import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Truck,
  ShieldCheck,
  Wrench,
  Smartphone,
  PackageCheck,
  Clock,
} from "lucide-react";
import heroImg from "@/assets/hero-phone.jpg";
import repairImg from "@/assets/repair.jpg";
import { categories, products } from "@/data/catalog";
import { repairTypes } from "@/data/repair";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { formatMAD } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OROTRONIX — Smartphones, accessoires et réparation au Maroc" },
      {
        name: "description",
        content:
          "Achetez smartphones et accessoires premium, et faites réparer votre téléphone avec ramassage et livraison à domicile partout au Maroc. Paiement à la livraison.",
      },
      { property: "og:title", content: "OROTRONIX — Technologie premium au Maroc" },
      {
        property: "og:description",
        content: "Smartphones, accessoires téléphone et TV, réparation professionnelle. Paiement à la livraison.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const offers = products.filter((p) => p.oldPrice).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">Technologie premium • Maroc</p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              L'excellence <span className="text-gradient-gold">mobile</span>,
              <br />
              du choix à la réparation.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Smartphones, accessoires téléphone et TV sélectionnés avec soin, et un atelier de
              réparation professionnel avec ramassage et livraison à domicile.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/boutique">
                  Découvrir la boutique <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/reparation">Réparer mon téléphone</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center sm:text-left">
              <Stat value="12 mois" label="Garantie" />
              <Stat value="48 h" label="Réparation moyenne" />
              <Stat value="Maroc" label="Livraison nationale" />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-elevated)]">
              <img
                src={heroImg}
                alt="Smartphone premium OROTRONIX"
                width={1408}
                height={1008}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="surface-panel absolute -bottom-5 left-4 hidden rounded-xl px-5 py-4 sm:block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Paiement</p>
              <p className="font-display text-base font-semibold text-gold">À la livraison</p>
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="border-b border-border bg-surface/30">
        <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <Advantage icon={<Truck className="h-5 w-5" />} title="Livraison Maroc" text="Expédition rapide dans tout le royaume." />
          <Advantage icon={<PackageCheck className="h-5 w-5" />} title="Paiement à la livraison" text="Vous payez en recevant votre commande." />
          <Advantage icon={<ShieldCheck className="h-5 w-5" />} title="Produits garantis" text="Appareils vérifiés, garantie incluse." />
          <Advantage icon={<Wrench className="h-5 w-5" />} title="Atelier certifié" text="Techniciens expérimentés, pièces de qualité." />
        </div>
      </section>

      {/* PRODUITS EN VEDETTE */}
      <section className="container-page py-16 lg:py-20">
        <SectionHeading
          eyebrow="Sélection"
          title="Produits en vedette"
          description="Les appareils et accessoires les plus demandés de notre catalogue."
          action={
            <Button asChild variant="outline">
              <Link to="/boutique">Tout voir</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-6 lg:py-10">
        <SectionHeading eyebrow="Catalogue" title="Nos catégories" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/boutique"
              search={{ categorie: c.slug }}
              className="hover-lift group relative overflow-hidden rounded-xl border border-border"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                <span className="mt-3 inline-flex items-center text-xs font-medium text-gold">
                  Explorer <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* REPARATION */}
      <section className="container-page py-16 lg:py-20">
        <div className="surface-panel overflow-hidden rounded-2xl">
          <div className="grid lg:grid-cols-2">
            <img
              src={repairImg}
              alt="Réparation de smartphone en atelier"
              loading="lazy"
              width={1200}
              height={912}
              className="h-64 w-full object-cover lg:h-full"
            />
            <div className="p-7 lg:p-12">
              <p className="eyebrow">Service réparation</p>
              <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                Votre téléphone réparé par des professionnels
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Diagnostic honnête, pièces de qualité et garantie sur l'intervention. Écran, batterie,
                port de charge, caméra, audio, logiciel ou oxydation : nous prenons en charge toutes les pannes.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {repairTypes.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-gold" />
                    {r.name}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/reparation" hash="demande">Demander une réparation</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/reparation">Voir les tarifs</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAMASSAGE & LIVRAISON */}
      <section className="border-y border-border bg-surface/30">
        <div className="container-page py-16 lg:py-20">
          <SectionHeading
            eyebrow="Sans vous déplacer"
            title="Ramassage et livraison de votre réparation"
            description="Nous récupérons votre téléphone chez vous, nous le réparons dans notre atelier, et nous vous le ramenons réparé."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              step="01"
              icon={<Smartphone className="h-5 w-5" />}
              title="Vous décrivez la panne"
              text="Remplissez le formulaire de demande en moins de deux minutes."
            />
            <StepCard
              step="02"
              icon={<Truck className="h-5 w-5" />}
              title="Nous récupérons l'appareil"
              text="Un coursier passe à l'adresse indiquée, au créneau convenu."
            />
            <StepCard
              step="03"
              icon={<Clock className="h-5 w-5" />}
              title="Retour réparé"
              text="Réparation, contrôle qualité, puis livraison chez vous."
            />
          </div>
        </div>
      </section>

      {/* OFFRES */}
      <section className="container-page py-16 lg:py-20">
        <SectionHeading
          eyebrow="Bons plans"
          title="Offres spéciales"
          description="Des prix réduits pendant que le stock dure."
          action={
            <Button asChild variant="outline">
              <Link to="/boutique" search={{ categorie: "offres" }}>Toutes les offres</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {offers.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page pb-20">
        <div className="surface-panel rounded-2xl px-6 py-12 text-center lg:px-16">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Besoin d'un conseil avant d'acheter&nbsp;?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Notre équipe vous aide à choisir le bon appareil ou à estimer une réparation.
            Livraison au Maroc à partir de {formatMAD(40)}, offerte dès {formatMAD(800)}.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/boutique">Commander maintenant</Link></Button>
            <Button asChild size="lg" variant="outline"><a href="tel:+212600000000">Nous appeler</a></Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold text-gold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Advantage({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-surface-2 text-gold">
        {icon}
      </span>
      <div>
        <p className="font-display text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  text,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="hover-lift rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/30 text-gold">
          {icon}
        </span>
        <span className="font-display text-2xl font-bold text-muted-foreground/40">{step}</span>
      </div>
      <h3 className="mt-5 font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
