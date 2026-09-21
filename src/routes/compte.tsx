import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRound, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseUserId, refreshSupabaseSession, supabaseAuth, supabaseConfigured, supabaseRest, setSupabaseAccessToken } from "@/lib/supabase";

export const Route = createFileRoute("/compte")({ component: ComptePage });

export default function ComptePage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Array<{reference:string; total:number; status:string; created_at:string}>>([]);

  useEffect(() => {
    const boot = async () => {
      const refreshed = await refreshSupabaseSession();
      const token = refreshed || (typeof window !== "undefined" ? sessionStorage.getItem("orotronix_user_token") : null);
      if (!token) return;
      setSupabaseAccessToken(token);
      setLoggedIn(true);
      try {
        const rows = await supabaseRest<Array<{reference:string; total:number; status:string; created_at:string}>>("orders", {
          query: "?select=reference,total,status,created_at&order=created_at.desc&limit=20",
        });
        setOrders(rows);
      } catch {}
    };
    void boot();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (!supabaseConfigured) throw new Error("Le compte client sera disponible après la configuration de Supabase.");
      if (mode === "signup") {
        await supabaseAuth("signup", {
          email,
          password,
          redirect_to: "https://www.orotronix.com/compte",
        });
        setMessage("Compte créé. Vérifiez votre e-mail si la confirmation est activée.");
      } else {
        const session = await supabaseAuth("token?grant_type=password", { email, password });
        setSupabaseAccessToken(session.access_token);
        sessionStorage.setItem("orotronix_user_email", email.trim());
        sessionStorage.setItem("orotronix_user_token", session.access_token);
        if (session.refresh_token) sessionStorage.setItem("orotronix_user_refresh_token", session.refresh_token);
        setMessage("Connexion réussie.");
        setLoggedIn(true);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("orotronix_user_token");
    sessionStorage.removeItem("orotronix_user_refresh_token");
    sessionStorage.removeItem("orotronix_user_email");
    setSupabaseAccessToken(null);
    setLoggedIn(false);
    setOrders([]);
    setMessage("Vous êtes déconnecté.");
  };

  if (loggedIn) {
    const accountEmail = typeof window !== "undefined" ? sessionStorage.getItem("orotronix_user_email") || email : email;
    return (
      <main className="container-page py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface/60 p-8 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">OROTRONIX</p>
              <h1 className="mt-2 font-display text-3xl text-foreground">Mon compte</h1>
              <p className="mt-2 text-sm text-muted-foreground">Connecté avec <strong className="text-foreground">{accountEmail}</strong></p>
            </div>
            <Button type="button" variant="outline" onClick={logout}>Déconnexion</Button>
          </div>
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">Mes commandes</h2>
            {orders.length === 0 ? (
              <p className="mt-4 rounded-lg border border-border p-4 text-sm text-muted-foreground">Aucune commande associée à ce compte pour le moment.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map(o => <div key={o.reference} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                  <div><p className="font-medium">{o.reference}</p><p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-MA")}</p></div>
                  <div className="text-right"><p className="font-medium text-gold">{Number(o.total).toLocaleString("fr-MA")} MAD</p><p className="text-xs text-muted-foreground">{o.status}</p></div>
                </div>)}
              </div>
            )}
          </div>
          <Link to="/boutique" className="mt-7 inline-block text-sm text-gold hover:underline">Continuer mes achats →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page py-16">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface/60 p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold">
            <UserRound className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl text-foreground">
            {mode === "login" ? "Mon compte" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérez votre compte OROTRONIX simplement et en toute sécurité.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail" />
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Veuillez patienter…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        {message && <p className="mt-4 rounded-md border border-border p-3 text-sm text-muted-foreground">{message}</p>}

        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "text-gold" : "text-muted-foreground"}><LogIn className="mr-1 inline h-4 w-4" />Connexion</button>
          <span className="text-border">|</span>
          <button type="button" onClick={() => setMode("signup")} className={mode === "signup" ? "text-gold" : "text-muted-foreground"}><UserPlus className="mr-1 inline h-4 w-4" />Inscription</button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-gold">Retour à l'accueil</Link>
        </div>
      </div>
    </main>
  );
}
