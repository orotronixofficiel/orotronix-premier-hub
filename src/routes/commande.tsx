import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { formatMAD } from "@/lib/format";
import { moroccanCities } from "@/data/repair";
import { makeReference, saveOrder, type Order } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabaseRest, setSupabaseAccessToken } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/commande")({
  head: () => ({ meta: [
    { title: "Commande — OROTRONIX" },
    { name: "description", content: "Finalisez votre commande OROTRONIX avec paiement à la livraison." },
    { property: "og:title", content: "Commande — OROTRONIX" },
    { property: "og:description", content: "Coordonnées, adresse de livraison et paiement à la livraison." },
    { name: "robots", content: "noindex" },
  ] }),
  component: CheckoutPage,
});

type SavedAddress = { id:string; label:string; full_name:string; phone:string; city:string; address:string; is_default:boolean };

function CheckoutPage() {
  const { items, subtotal, shipping, total, clear } = useCart();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("orotronix_user_email") || "" : "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("orotronix_user_token");
    if (!token) return;
    setLoggedIn(true);
    setSupabaseAccessToken(token);
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: string };
      const userId = payload.sub;
      if (!userId) return;
      void Promise.all([
        supabaseRest<Array<{full_name:string|null;phone:string|null;city:string|null}>>("customer_profiles", { query: "?select=full_name,phone,city&user_id=eq." + encodeURIComponent(userId) }),
        supabaseRest<SavedAddress[]>("customer_addresses", { query: "?select=*&user_id=eq." + encodeURIComponent(userId) + "&order=is_default.desc,created_at.desc" }),
      ]).then(([profiles, addresses]) => {
        const profile = profiles[0];
        if (profile) {
          setFullName(profile.full_name || sessionStorage.getItem("orotronix_user_name") || "");
          setPhone(profile.phone || "");
          setCity(profile.city || "");
        }
        setSavedAddresses(addresses);
        const primary = addresses.find(a => a.is_default);
        if (primary) {
          setFullName(primary.full_name);
          setPhone(primary.phone);
          setCity(primary.city);
          setAddress(primary.address);
        }
      }).catch(() => {});
    } catch {}
  }, []);

  if (items.length === 0) {
    return <div className="container-page py-20 text-center"><h1 className="font-display text-2xl font-semibold">Votre panier est vide</h1><p className="mt-2 text-sm text-muted-foreground">Ajoutez des produits avant de commander.</p><Button asChild className="mt-6"><Link to="/boutique">Aller à la boutique</Link></Button></div>;
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 3) next.fullName = "Indiquez votre nom complet.";
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) next.phone = "Numéro de téléphone invalide.";
    if (!city) next.city = "Choisissez votre ville.";
    if (address.trim().length < 8) next.address = "Indiquez une adresse complète.";
    if (customerEmail && !/^\S+@\S+\.\S+$/.test(customerEmail.trim())) next.customerEmail = "E-mail invalide.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error("Veuillez corriger les champs indiqués."); return; }
    setSubmitting(true);
    const order: Order = {
      reference: makeReference(),
      createdAt: new Date().toISOString(),
      items,
      subtotal,
      shipping,
      total,
      paymentMethod: "cod",
      customer: { fullName: fullName.trim(), email: customerEmail.trim(), phone: phone.trim(), city, address: address.trim(), notes },
    };
    try {
      await saveOrder(order);
      clear();
      navigate({ to: "/confirmation" });
    } catch (error) {
      console.error("OROTRONIX: commande non enregistrée", error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Stock insuffisant")) toast.error("Désolé, ce produit est en rupture de stock ou la quantité demandée n’est plus disponible. Veuillez modifier votre panier et réessayer.");
      else if (message.includes("Produit indisponible")) toast.error("Désolé, un produit de votre panier n’est plus disponible. Veuillez modifier votre panier et réessayer.");
      else toast.error("Impossible d’enregistrer la commande pour le moment. Veuillez réessayer dans quelques instants.");
    } finally { setSubmitting(false); }
  };

  const applyAddress = (id: string) => {
    const a = savedAddresses.find(x => x.id === id);
    if (!a) return;
    setFullName(a.full_name); setPhone(a.phone); setCity(a.city); setAddress(a.address);
    toast.success("Adresse appliquée.");
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h1 className="font-display text-3xl font-bold sm:text-4xl">Finaliser la commande</h1><p className="mt-2 text-sm text-muted-foreground">Paiement à la livraison — vous réglez le montant en recevant votre colis.</p></div>
        {loggedIn && <Link to="/compte" className="text-sm text-gold hover:underline">Gérer mon compte</Link>}
      </div>

      {loggedIn && savedAddresses.length > 0 && (
        <section className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-5">
          <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-gold" /><h2 className="font-display font-semibold">Utiliser une adresse enregistrée</h2></div>
          <div className="mt-3 flex flex-wrap gap-2">{savedAddresses.map(a => <button type="button" key={a.id} onClick={() => applyAddress(a.id)} className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${a.is_default ? "border-gold/60 bg-background" : "border-border bg-background/40 hover:border-gold/40"}`}><span className="font-semibold">{a.label}</span><span className="ml-2 text-muted-foreground">{a.city}</span></button>)}</div>
        </section>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Vos informations</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="E-mail" id="customerEmail" error={errors.customerEmail}><Input id="customerEmail" type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} placeholder="exemple@email.com" className="bg-surface" /></Field>
              <Field label="Nom complet" id="fullName" error={errors.fullName}><Input id="fullName" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Ex. Yassine El Amrani" className="bg-surface" /></Field>
              <Field label="Téléphone" id="phone" error={errors.phone}><Input id="phone" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="06 00 00 00 00" inputMode="tel" className="bg-surface" /></Field>
            </div>
            {!loggedIn && <p className="mt-4 text-xs text-muted-foreground">Vous pouvez commander sans créer de compte. Créez un compte ensuite pour retrouver vos commandes plus facilement.</p>}
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Adresse de livraison</h2>
            <div className="mt-5 grid gap-4">
              <Field label="Ville" id="city" error={errors.city}><Select value={city} onValueChange={setCity}><SelectTrigger id="city" className="bg-surface"><SelectValue placeholder="Choisir une ville" /></SelectTrigger><SelectContent>{moroccanCities.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Adresse complète" id="address" error={errors.address}><Textarea id="address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Quartier, rue, numéro, étage…" className="bg-surface" rows={3} /></Field>
              <Field label="Note pour la livraison (optionnel)" id="notes"><Textarea id="notes" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Horaire préféré, repère…" className="bg-surface" rows={2} /></Field>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Paiement</h2>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-gold/40 bg-surface p-4"><Banknote className="mt-0.5 h-5 w-5 text-gold" /><div><p className="font-display text-sm font-semibold">Paiement à la livraison</p><p className="mt-1 text-xs text-muted-foreground">Réglez en espèces au coursier lors de la réception de votre commande.</p></div></div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Votre commande</h2>
          <ul className="mt-4 space-y-3">{items.map(i=><li key={i.slug} className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{i.name} <span className="text-foreground">× {i.quantity}</span></span><span>{formatMAD(i.price*i.quantity)}</span></li>)}</ul>
          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd>{formatMAD(subtotal)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd>{shipping===0?"Offerte":formatMAD(shipping)}</dd></div><div className="flex justify-between border-t border-border pt-3 font-display text-base font-semibold"><dt>Total à payer</dt><dd className="text-gold">{formatMAD(total)}</dd></div></dl>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>{submitting?"Enregistrement…":"Confirmer la commande"}</Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Aucun paiement en ligne requis</p>
          {loggedIn && <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Votre commande sera liée à votre compte</p>}
        </aside>
      </form>
    </div>
  );
}

function Field({label,id,error,children}:{label:string;id:string;error?:string;children:React.ReactNode}) {
  return <div><Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label><div className="mt-2">{children}</div>{error&&<p className="mt-1.5 text-xs text-destructive">{error}</p>}</div>;
}
