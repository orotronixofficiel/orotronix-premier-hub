import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole, LogOut, Package, RefreshCw, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseAuth, supabaseConfigured, supabaseRest, setSupabaseAccessToken } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration | OROTRONIX" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

type Product = { id: string; name: string; slug: string; price: number; in_stock: boolean; featured: boolean };
type Order = { id: string; reference: string; customer_name: string; phone: string; total: number; status: string; created_at: string };

function AdminPage() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("orotronix_admin_token") : null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [p, o] = await Promise.all([
        supabaseRest<Product[]>("products", { query: "?select=id,name,slug,price,in_stock,featured&order=created_at.desc" }),
        supabaseRest<Order[]>("orders", { query: "?select=id,reference,customer_name,phone,total,status,created_at&order=created_at.desc&limit=20" })
      ]);
      setProducts(p); setOrders(o);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de chargement"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) { setSupabaseAccessToken(token); void load(); } }, [token]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const data = await supabaseAuth("token?grant_type=password", { email, password });
      sessionStorage.setItem("orotronix_admin_token", data.access_token);
      setSupabaseAccessToken(data.access_token); setToken(data.access_token);
    } catch (e) { setError(e instanceof Error ? e.message : "Connexion impossible"); }
  };
  const logout = () => { sessionStorage.removeItem("orotronix_admin_token"); setSupabaseAccessToken(null); setToken(null); };

  if (!supabaseConfigured) return <Shell><Panel><h1 className="font-display text-2xl font-semibold">Administration OROTRONIX</h1><p className="mt-3 text-sm text-muted-foreground">Supabase n'est pas encore configuré sur l'hébergement.</p><p className="mt-2 text-sm text-muted-foreground">Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Cloudflare Pages.</p><Link className="mt-6 inline-block text-sm text-gold" to="/">← Retour au site</Link></Panel></Shell>;

  if (!token) return <Shell><form onSubmit={login} className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-7"><div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/30 text-gold"><LockKeyhole className="h-5 w-5" /></div><h1 className="mt-5 font-display text-2xl font-semibold">Espace administration</h1><p className="mt-2 text-sm text-muted-foreground">Connectez-vous avec votre compte Supabase.</p><div className="mt-6 space-y-4"><div><Label>Email</Label><Input className="mt-2 bg-surface" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div><Label>Mot de passe</Label><Input className="mt-2 bg-surface" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div></div>{error && <p className="mt-4 text-sm text-destructive">{error}</p>}<Button className="mt-6 w-full" type="submit">Se connecter</Button><Link className="mt-5 block text-center text-xs text-muted-foreground" to="/">Retour au site</Link></form></Shell>;

  return <Shell><div className="flex flex-col gap-8"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">OROTRONIX</p><h1 className="mt-2 font-display text-3xl font-bold">Tableau de bord</h1><p className="mt-1 text-sm text-muted-foreground">Gestion du catalogue et suivi des commandes.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button><Button variant="outline" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Déconnexion</Button></div></header>{error && <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</div>}<div className="grid gap-4 sm:grid-cols-3"><Stat icon={<Package className="h-5 w-5" />} label="Produits" value={products.length} /><Stat icon={<Package className="h-5 w-5" />} label="Commandes" value={orders.length} /><Stat icon={<Wrench className="h-5 w-5" />} label="À traiter" value={orders.filter(o => o.status === "pending_whatsapp").length} /></div><section className="rounded-2xl border border-border bg-card"><div className="border-b border-border p-5"><h2 className="font-display text-lg font-semibold">Produits</h2></div><div className="divide-y divide-border">{products.map(p => <div key={p.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.slug} · {p.price} MAD</p></div><div className="flex gap-2 text-xs"><span className={p.in_stock ? "text-emerald-500" : "text-muted-foreground"}>{p.in_stock ? "En stock" : "Rupture"}</span>{p.featured && <span className="text-gold">Vedette</span>}</div></div>)}{products.length === 0 && <p className="p-5 text-sm text-muted-foreground">Aucun produit dans Supabase.</p>}</div></section><section className="rounded-2xl border border-border bg-card"><div className="border-b border-border p-5"><h2 className="font-display text-lg font-semibold">Dernières commandes</h2></div><div className="divide-y divide-border">{orders.map(o => <div key={o.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto]"><div><p className="font-medium">{o.reference} · {o.customer_name}</p><p className="text-xs text-muted-foreground">{o.phone}</p></div><span className="text-xs text-gold">{o.status}</span><span className="text-sm">{o.total} MAD</span></div>)}{orders.length === 0 && <p className="p-5 text-sm text-muted-foreground">Aucune commande enregistrée.</p>}</div></section></div></Shell>;
}
function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl">{children}</div></div>; }
function Panel({ children }: { children: React.ReactNode }) { return <div className="mx-auto max-w-xl rounded-2xl border border-gold/30 bg-card p-8">{children}</div>; }
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="rounded-xl border border-border bg-card p-5"><div className="flex h-9 w-9 items-center justify-center rounded-md border border-gold/30 text-gold">{icon}</div><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="font-display text-2xl font-semibold">{value}</p></div>; }
