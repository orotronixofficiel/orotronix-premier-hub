import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Save,
  Shield,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  notifyAuthChanged,
  setSupabaseAccessToken,
  startSupabaseOAuth,
  supabaseAuth,
  supabaseConfigured,
  supabaseCurrentUser,
  supabaseRest,
  supabaseSignOut,
  supabaseUpdatePassword,
  supabaseUpdateUser,
} from "@/lib/supabase";
import { formatMAD } from "@/lib/format";
import { loadRemoteProduct } from "@/data/catalog";
import { useCart } from "@/context/cart";
import { moroccanCities } from "@/data/repair";

export const Route = createFileRoute("/compte")({ component: ComptePage });

type AccountMode = "login" | "signup" | "forgot" | "reset";
type OAuthProvider = "google" | "facebook";
type Profile = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  loyalty_points: number;
  loyalty_tier: string;
};
type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  city: string;
  address: string;
  is_default: boolean;
};
type CustomerOrder = {
  id: string;
  reference: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ name: string; quantity: number; price: number; slug?: string }>;
};
type Favorite = {
  product_id: string;
  products?: { id: string; slug: string; name: string; price: number; image_url: string | null; visible: boolean } | null;
};

function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z" /><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z" /><path fill="#FBBC05" d="M6.54 13.79A5.86 5.86 0 0 1 6.23 12c0-.62.11-1.22.31-1.79V7.68H3.3A9.72 9.72 0 0 0 2.25 12c0 1.56.37 3.04 1.05 4.32l3.24-2.53Z" /><path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.23 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.9 9.46 6.18 12 6.18Z" /></svg>;
}
function FacebookMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 rounded-full"><circle cx="12" cy="12" r="12" fill="#1877F2" /><path fill="#fff" d="M13.45 20v-7.02h2.35l.35-2.73h-2.7V8.51c0-.79.22-1.33 1.36-1.33h1.45V4.74c-.25-.03-1.11-.11-2.12-.11-2.1 0-3.54 1.28-3.54 3.63v1.99H8.23v2.73h2.37V20h2.85Z" /></svg>;
}

export default function ComptePage() {
  const [mode, setMode] = useState<AccountMode>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", city: "" });
  const [addressForm, setAddressForm] = useState({ id: "", label: "Domicile", full_name: "", phone: "", city: "", address: "", is_default: true });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [activeSection, setActiveSection] = useState<"overview" | "orders" | "addresses" | "favorites" | "security">("overview");
  const navigate = useNavigate();

  const token = typeof window !== "undefined" ? sessionStorage.getItem("orotronix_user_token") : null;
  const userId = useMemo(() => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).sub as string; } catch { return null; }
  }, [token]);

  const loadAccount = async () => {
    const savedToken = sessionStorage.getItem("orotronix_user_token");
    if (!savedToken || !userId) return;
    setSupabaseAccessToken(savedToken);
    try {
      const [p, a, o, f, n] = await Promise.all([
        supabaseRest<Profile[]>("customer_profiles", { query: "?select=*&user_id=eq." + encodeURIComponent(userId) }),
        supabaseRest<Address[]>("customer_addresses", { query: "?select=*&user_id=eq." + encodeURIComponent(userId) + "&order=is_default.desc,created_at.desc" }),
        supabaseRest<CustomerOrder[]>("orders", { query: "?select=id,reference,total,status,created_at,items&user_id=eq." + encodeURIComponent(userId) + "&order=created_at.desc" }),
        supabaseRest<Favorite[]>("customer_favorites", { query: "?select=product_id,products(id,slug,name,price,image_url,visible)&user_id=eq." + encodeURIComponent(userId) }),
        supabaseRest<Array<{order_updates:boolean;promotions:boolean;security_alerts:boolean}>>("customer_notification_preferences", { query: "?select=*&user_id=eq." + encodeURIComponent(userId) }),
      ]);
      const nextProfile = p[0] ?? null;
      setProfile(nextProfile);
      setProfileForm({ full_name: nextProfile?.full_name || sessionStorage.getItem("orotronix_user_name") || "", phone: nextProfile?.phone || "", city: nextProfile?.city || "" });
      setAddresses(a);
      setOrders(o);
      setFavorites(f);
      const prefs = n[0];
      if (prefs) {
        setOrderUpdates(prefs.order_updates);
        setPromotions(prefs.promotions);
        setSecurityAlerts(prefs.security_alerts);
      }
    } catch (error) {
      console.error("OROTRONIX: account load failed", error);
      toast.error("Impossible de charger certaines informations de votre compte.");
    }
  };

  useEffect(() => {
    let active = true;
    const handleAuthCallback = async () => {
      const stored = sessionStorage.getItem("orotronix_user_token");
      if (stored) {
        setSupabaseAccessToken(stored);
        setLoggedIn(true);
        const user = await supabaseCurrentUser(stored).catch(() => null);
        if (user?.email) { setEmail(user.email); sessionStorage.setItem("orotronix_user_email", user.email); }
        if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
          const name = user.user_metadata.full_name || user.user_metadata.name || "";
          sessionStorage.setItem("orotronix_user_name", name);
        }
        if (active) await loadAccount();
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const type = hash.get("type") || query.get("type");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (type === "recovery" && accessToken) {
        setRecoveryToken(accessToken);
        setSupabaseAccessToken(accessToken);
        sessionStorage.setItem("orotronix_user_token", accessToken);
        if (refreshToken) sessionStorage.setItem("orotronix_user_refresh_token", refreshToken);
        setLoggedIn(false);
        setMode("reset");
        setMessage("Choisissez votre nouveau mot de passe.");
        window.localStorage.removeItem("orotronix_recovery_pending");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (accessToken) {
        try {
          setSupabaseAccessToken(accessToken);
          sessionStorage.setItem("orotronix_user_token", accessToken);
          if (refreshToken) sessionStorage.setItem("orotronix_user_refresh_token", refreshToken);
          const user = await supabaseCurrentUser(accessToken);
          if (!active) return;
          if (user.email) {
            setEmail(user.email);
            sessionStorage.setItem("orotronix_user_email", user.email);
          }
          const name = user.user_metadata?.full_name || user.user_metadata?.name;
          if (name) sessionStorage.setItem("orotronix_user_name", name);
          setLoggedIn(true);
          notifyAuthChanged();
          window.history.replaceState({}, document.title, window.location.pathname);
          await loadAccount();
          await navigate({ to: "/boutique" });
        } catch (error) {
          sessionStorage.removeItem("orotronix_user_token");
          sessionStorage.removeItem("orotronix_user_refresh_token");
          setSupabaseAccessToken(null);
          setMessage(error instanceof Error ? error.message : "La connexion sociale a échoué.");
        }
      }
    };
    void handleAuthCallback();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loggedIn && userId) void loadAccount();
  }, [loggedIn, userId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (!supabaseConfigured) throw new Error("Le compte client sera disponible après la configuration de Supabase.");

      if (mode === "forgot") {
        if (typeof window !== "undefined") window.localStorage.setItem("orotronix_recovery_pending", "1");
        await supabaseAuth("recover", { email: email.trim(), redirect_to: "https://www.orotronix.com/compte" });
        setMessage("Si cette adresse est associée à un compte, un e-mail de réinitialisation va être envoyé.");
      } else if (mode === "reset") {
        if (!recoveryToken) throw new Error("Le lien de réinitialisation est invalide ou expiré.");
        if (password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
        await supabaseUpdatePassword(password, recoveryToken);
        if (typeof window !== "undefined") window.localStorage.removeItem("orotronix_recovery_pending");
        sessionStorage.removeItem("orotronix_user_token");
        sessionStorage.removeItem("orotronix_user_refresh_token");
        setSupabaseAccessToken(null);
        setRecoveryToken("");
        setMode("login");
        setPassword("");
        setMessage("Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.");
      } else if (mode === "signup") {
        if (fullName.trim().length < 3) throw new Error("Indiquez votre nom complet.");
        if (password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
        if (password !== confirmPassword) throw new Error("Les deux mots de passe ne correspondent pas.");
        await supabaseAuth("signup", {
          email: email.trim(),
          password,
          redirect_to: window.location.origin + "/compte",
        });
        setMessage("Compte créé. Vérifiez votre e-mail pour confirmer votre adresse.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        const session = await supabaseAuth("token?grant_type=password", { email: email.trim(), password });
        setSupabaseAccessToken(session.access_token);
        sessionStorage.setItem("orotronix_user_email", email.trim());
        sessionStorage.setItem("orotronix_user_token", session.access_token);
        if (session.refresh_token) sessionStorage.setItem("orotronix_user_refresh_token", session.refresh_token);
        setLoggedIn(true);
        notifyAuthChanged();
        await loadAccount();
        await navigate({ to: "/boutique" });
      }
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Une erreur est survenue.";
      setMessage(raw.includes("Invalid login credentials") ? "E-mail ou mot de passe incorrect." : raw);
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = (provider: OAuthProvider) => {
    if (!supabaseConfigured) { setMessage("La connexion sociale sera disponible après la configuration de Supabase."); return; }
    setMessage(""); setOauthLoading(provider);
    try { startSupabaseOAuth(provider); } catch (error) { setOauthLoading(null); setMessage(error instanceof Error ? error.message : "Impossible de démarrer la connexion."); }
  };

  const logout = async () => {
    const currentToken = sessionStorage.getItem("orotronix_user_token");
    if (currentToken) await supabaseSignOut(currentToken, "local");
    sessionStorage.removeItem("orotronix_user_token");
    sessionStorage.removeItem("orotronix_user_refresh_token");
    sessionStorage.removeItem("orotronix_user_email");
    sessionStorage.removeItem("orotronix_user_name");
    setSupabaseAccessToken(null);
    setLoggedIn(false);
    notifyAuthChanged();
    setMessage("Vous êtes déconnecté.");
    await navigate({ to: "/" });
  };

  const saveProfile = async () => {
    if (!userId) return;
    if (profileForm.full_name.trim().length < 3) { toast.error("Nom complet invalide."); return; }
    if (profileForm.phone && !/^[0-9+\s]{9,15}$/.test(profileForm.phone.trim())) { toast.error("Numéro de téléphone invalide."); return; }
    setSavingAccount(true);
    try {
      const saved = await supabaseRest<Profile[]>("customer_profiles", {
        method: "PATCH",
        query: "?user_id=eq." + encodeURIComponent(userId),
        body: { full_name: profileForm.full_name.trim(), phone: profileForm.phone.trim() || null, city: profileForm.city || null },
        prefer: "return=representation",
      });
      if (profileForm.full_name.trim()) sessionStorage.setItem("orotronix_user_name", profileForm.full_name.trim());
      setProfile(saved[0] || { ...(profile || { user_id: userId, loyalty_points: 0, loyalty_tier: "Bronze" }), ...profileForm });
      setEditingProfile(false);
      toast.success("Informations mises à jour.");
      notifyAuthChanged();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de sauvegarder."); }
    finally { setSavingAccount(false); }
  };

  const changePassword = async () => {
    const currentToken = sessionStorage.getItem("orotronix_user_token");
    if (!currentToken) return;
    if (newPassword.length < 8) { toast.error("8 caractères minimum."); return; }
    if (newPassword !== newPassword2) { toast.error("Les deux mots de passe ne correspondent pas."); return; }
    setSavingAccount(true);
    try {
      await supabaseUpdatePassword(newPassword, currentToken);
      setNewPassword(""); setNewPassword2("");
      toast.success("Mot de passe modifié. Un e-mail de sécurité peut être envoyé selon votre configuration Supabase.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de modifier le mot de passe."); }
    finally { setSavingAccount(false); }
  };

  const resendVerification = async () => {
    if (!email) return;
    try {
      await supabaseAuth("resend", { type: "signup", email: email.trim(), options: { email_redirect_to: window.location.origin + "/compte" } });
      toast.success("E-mail de confirmation renvoyé.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de renvoyer l'e-mail."); }
  };

  const saveAddress = async () => {
    if (!userId) return;
    if (addressForm.full_name.trim().length < 3 || addressForm.address.trim().length < 8 || addressForm.city.length < 2) {
      toast.error("Complétez le nom, la ville et l'adresse."); return;
    }
    if (!/^[0-9+\s]{9,15}$/.test(addressForm.phone.trim())) { toast.error("Numéro de téléphone invalide."); return; }
    setSavingAccount(true);
    try {
      const body = { label: addressForm.label.trim() || "Domicile", full_name: addressForm.full_name.trim(), phone: addressForm.phone.trim(), city: addressForm.city, address: addressForm.address.trim(), is_default: addressForm.is_default };
      if (addressForm.id) {
        await supabaseRest("customer_addresses", { method: "PATCH", query: "?id=eq." + encodeURIComponent(addressForm.id) + "&user_id=eq." + encodeURIComponent(userId), body });
      } else {
        await supabaseRest("customer_addresses", { method: "POST", body, prefer: "return=minimal" });
      }
      setShowAddressForm(false);
      setAddressForm({ id: "", label: "Domicile", full_name: profileForm.full_name || "", phone: profileForm.phone || "", city: profileForm.city || "", address: "", is_default: true });
      await loadAccount();
      toast.success("Adresse enregistrée.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer l'adresse."); }
    finally { setSavingAccount(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!userId || !window.confirm("Supprimer cette adresse ?")) return;
    try {
      await supabaseRest("customer_addresses", { method: "DELETE", query: "?id=eq." + encodeURIComponent(id) + "&user_id=eq." + encodeURIComponent(userId) });
      await loadAccount();
      toast.success("Adresse supprimée.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de supprimer l'adresse."); }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await supabaseRest("rpc/set_default_customer_address", { method: "POST", body: { p_address_id: id } });
      await loadAccount();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de définir l'adresse."); }
  };

  const toggleFavorite = async (productId: string) => {
    if (!userId) return;
    const exists = favorites.some(f => f.product_id === productId);
    try {
      if (exists) await supabaseRest("customer_favorites", { method: "DELETE", query: "?user_id=eq." + encodeURIComponent(userId) + "&product_id=eq." + encodeURIComponent(productId) });
      else await supabaseRest("customer_favorites", { method: "POST", body: { user_id: userId, product_id: productId }, prefer: "return=minimal" });
      await loadAccount();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de modifier les favoris."); }
  };

  const updatePrefs = async (field: "order_updates" | "promotions" | "security_alerts", value: boolean) => {
    if (!userId) return;
    const body = { user_id: userId, order_updates: field === "order_updates" ? value : orderUpdates, promotions: field === "promotions" ? value : promotions, security_alerts: field === "security_alerts" ? value : securityAlerts };
    try {
      await supabaseRest("customer_notification_preferences", { method: "PATCH", query: "?user_id=eq." + encodeURIComponent(userId), body });
      if (field === "order_updates") setOrderUpdates(value);
      if (field === "promotions") setPromotions(value);
      if (field === "security_alerts") setSecurityAlerts(value);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Impossible de modifier les notifications."); }
  };

  const startEditAddress = (a: Address) => {
    setAddressForm({ id: a.id, label: a.label, full_name: a.full_name, phone: a.phone, city: a.city, address: a.address, is_default: a.is_default });
    setShowAddressForm(true);
  };

  if (loggedIn && userId) {
    return (
      <main className="container-page py-10 lg:py-14">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Espace client</p>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{profileForm.full_name ? "Bonjour, " + profileForm.full_name.split(" ")[0] : "Mon compte"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{email}</p>
          </div>
          <Button variant="outline" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Déconnexion</Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border border-border bg-card p-3">
            {[
              ["overview","Vue d'ensemble",UserRound],
              ["orders","Mes commandes",Package],
              ["addresses","Mes adresses",MapPin],
              ["favorites","Mes favoris",Heart],
              ["security","Sécurité",Shield],
            ].map(([key,label,Icon]) => (
              <button key={String(key)} onClick={() => setActiveSection(key as typeof activeSection)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${activeSection === key ? "bg-gold/10 text-gold" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />{String(label)}
              </button>
            ))}
          </aside>

          <section className="space-y-6">
            {activeSection === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat icon={<Package className="h-5 w-5" />} label="Commandes" value={String(orders.length)} />
                  <Stat icon={<Heart className="h-5 w-5" />} label="Favoris" value={String(favorites.length)} />
                  <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="Fidélité" value={String(profile?.loyalty_points ?? 0) + " pts"} />
                </div>

                {!profile?.full_name && (
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                    <p className="font-display font-semibold">Complétez votre profil</p>
                    <p className="mt-1 text-sm text-muted-foreground">Ajoutez votre téléphone et votre ville pour accélérer vos prochaines commandes.</p>
                    <Button className="mt-4" onClick={() => { setEditingProfile(true); setActiveSection("overview"); }}>Compléter</Button>
                  </div>
                )}

                <AccountProfileCard editing={editingProfile} form={profileForm} setForm={setProfileForm} onEdit={() => setEditingProfile(true)} onCancel={() => setEditingProfile(false)} onSave={saveProfile} saving={savingAccount} />

                {!email || message ? (
                  <div className="rounded-xl border border-border bg-card p-5 text-sm">
                    <p>{message || "Vérifiez votre adresse e-mail pour sécuriser votre compte."}</p>
                    <Button variant="outline" className="mt-3" onClick={resendVerification}>Renvoyer l'e-mail de confirmation</Button>
                  </div>
                ) : null}
              </>
            )}

            {activeSection === "orders" && <OrdersPanel orders={orders} />}
            {activeSection === "addresses" && (
              <AddressesPanel addresses={addresses} onAdd={() => { setAddressForm({ id:"",label:"Domicile",full_name:profileForm.full_name,phone:profileForm.phone,city:profileForm.city,address:"",is_default:addresses.length===0 }); setShowAddressForm(true); }} onEdit={startEditAddress} onDelete={deleteAddress} onDefault={setDefaultAddress} showForm={showAddressForm} form={addressForm} setForm={setAddressForm} onSave={saveAddress} onCancel={() => setShowAddressForm(false)} saving={savingAccount} />
            )}
            {activeSection === "favorites" && <FavoritesPanel favorites={favorites} onRemove={toggleFavorite} />}
            {activeSection === "security" && (
              <SecurityPanel newPassword={newPassword} setNewPassword={setNewPassword} newPassword2={newPassword2} setNewPassword2={setNewPassword2} onChangePassword={changePassword} saving={savingAccount} orderUpdates={orderUpdates} promotions={promotions} securityAlerts={securityAlerts} updatePrefs={updatePrefs} />
            )}
          </section>
        </div>
      </main>
    );
  }

  const title = mode === "signup" ? "Créer un compte" : mode === "forgot" ? "Mot de passe oublié" : mode === "reset" ? "Nouveau mot de passe" : "Mon compte";
  const isAuthForm = mode === "login" || mode === "signup";

  return (
    <main className="container-page py-16">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface/60 p-6 shadow-xl sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold"><UserRound className="h-7 w-7" /></div>
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Accédez à votre espace OROTRONIX simplement et en toute sécurité.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && <>
            <Field label="Nom complet" id="signup-name"><Input id="signup-name" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex. Yassine El Amrani" /></Field>
          </>}
          {mode !== "reset" && <Field label="Adresse e-mail" id="account-email"><Input id="account-email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" /></Field>}
          {(mode === "login" || mode === "signup" || mode === "reset") && (
            <Field label={mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"} id="account-password">
              <div className="relative"><Input id="account-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pr-11" /><button type="button" aria-label="Afficher/masquer le mot de passe" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-gold">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </Field>
          )}
          {mode === "signup" && <Field label="Confirmer le mot de passe" id="confirm-password"><Input id="confirm-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" /></Field>}
          {mode === "forgot" && <p className="text-sm leading-6 text-muted-foreground">Entrez votre e-mail. Pour protéger votre vie privée, la réponse sera la même qu'un compte existe ou non.</p>}

          {mode === "login" && <button type="button" onClick={() => { setMode("forgot"); setMessage(""); }} className="text-xs text-muted-foreground hover:text-gold">Mot de passe oublié ?</button>}

          <Button type="submit" className="h-11 w-full" disabled={loading || oauthLoading !== null}>
            {loading ? "Veuillez patienter…" : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : mode === "forgot" ? "Envoyer le lien" : "Modifier le mot de passe"}
          </Button>
        </form>

        {isAuthForm && <>
          <div className="my-6 flex items-center gap-3" aria-hidden="true"><div className="h-px flex-1 bg-gold/50" /><span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/80">Ou continuer avec</span><div className="h-px flex-1 bg-gold/50" /></div>
          <div className="grid gap-3">
            <Button type="button" variant="outline" className="h-11 w-full justify-center gap-3 border-border bg-background/40 hover:border-gold/40" disabled={loading || oauthLoading !== null} onClick={() => loginWithOAuth("google")}><GoogleMark />{oauthLoading === "google" ? "Connexion à Google…" : "Continuer avec Google"}</Button>
            <Button type="button" variant="outline" className="h-11 w-full justify-center gap-3 border-border bg-background/40 hover:border-gold/40" disabled={loading || oauthLoading !== null} onClick={() => loginWithOAuth("facebook")}><FacebookMark />{oauthLoading === "facebook" ? "Connexion à Facebook…" : "Continuer avec Facebook"}</Button>
          </div>
        </>}

        {message && <p role="status" aria-live="polite" className="mt-4 rounded-md border border-border bg-background/30 p-3 text-sm leading-5 text-muted-foreground">{message}</p>}

        {mode !== "reset" && <div className="mt-6 flex items-center justify-center gap-3 text-sm"><button type="button" onClick={() => { setMode("login"); setMessage(""); setPassword(""); setConfirmPassword(""); }} className={mode === "login" ? "text-gold" : "text-muted-foreground hover:text-foreground"}><LogIn className="mr-1 inline h-4 w-4" />Connexion</button><span className="text-border">|</span><button type="button" onClick={() => { setMode("signup"); setMessage(""); setPassword(""); setConfirmPassword(""); }} className={mode === "signup" ? "text-gold" : "text-muted-foreground hover:text-foreground"}><UserPlus className="mr-1 inline h-4 w-4" />Inscription</button></div>}
        <div className="mt-7 border-t border-border pt-5 text-center"><Link to="/" className="text-sm text-muted-foreground hover:text-gold">Retour à l'accueil</Link></div>
      </div>
    </main>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label}</label>{children}{error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}</div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-card p-5"><div className="text-gold">{icon}</div><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-semibold">{value}</p></div>;
}

function AccountProfileCard({ editing, form, setForm, onEdit, onCancel, onSave, saving }: any) {
  return <div className="rounded-xl border border-border bg-card p-6">
    <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Profil</p><h2 className="mt-1 font-display text-xl font-semibold">Mes informations</h2></div>{!editing && <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="mr-2 h-4 w-4" />Modifier</Button>}</div>
    {editing ? <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nom complet" id="profile-name"><Input id="profile-name" value={form.full_name} onChange={e => setForm({...form,full_name:e.target.value})} /></Field><Field label="Téléphone" id="profile-phone"><Input id="profile-phone" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} inputMode="tel" /></Field><Field label="Ville" id="profile-city"><select id="profile-city" value={form.city} onChange={e => setForm({...form,city:e.target.value})} className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm">{<option value="">Choisir une ville</option>}{moroccanCities.map(c=><option key={c} value={c}>{c}</option>)}</select></Field><div className="flex items-end gap-2"><Button onClick={onSave} disabled={saving}><Save className="mr-2 h-4 w-4" />Enregistrer</Button><Button variant="outline" onClick={onCancel}>Annuler</Button></div></div> : <div className="mt-5 grid gap-4 sm:grid-cols-3"><Info label="Nom" value={form.full_name || "Non renseigné"} /><Info label="Téléphone" value={form.phone || "Non renseigné"} /><Info label="Ville" value={form.city || "Non renseignée"} /></div>}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm">{value}</p></div>; }

function OrdersPanel({ orders }: { orders: CustomerOrder[] }) {
  const { addItem } = useCart();
  const [buying, setBuying] = useState<string | null>(null);
  const statusMap: Record<string,string> = { pending_whatsapp:"Nouvelle", confirmed:"Confirmée", processing:"En préparation", shipped:"Expédiée", completed:"Livrée", cancelled:"Annulée" };
  return <div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center gap-3"><Package className="h-5 w-5 text-gold" /><h2 className="font-display text-xl font-semibold">Mes commandes</h2></div>{orders.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">Aucune commande pour le moment.</p> : <div className="mt-5 space-y-3">{orders.map(o=><div key={o.id} className="rounded-lg border border-border p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{o.reference}</p><p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-MA")}</p></div><div className="text-right"><p className="text-gold">{formatMAD(Number(o.total))}</p><p className="text-xs text-muted-foreground">{statusMap[o.status] || o.status}</p></div></div><ul className="mt-3 space-y-1 text-sm text-muted-foreground">{(o.items || []).map((i,index)=><li key={index}>{i.name} × {i.quantity}</li>)}</ul>{o.items.some(i => i.slug) && <Button variant="outline" size="sm" className="mt-3" disabled={buying===o.id} onClick={async()=>{setBuying(o.id);try{for(const item of o.items){if(!item.slug)continue;const p=await loadRemoteProduct(item.slug);if(p) addItem(p,Number(item.quantity)||1);}toast.success("Produits ajoutés au panier");}catch{toast.error("Impossible de recharger certains produits.");}finally{setBuying(null);}}}>{buying===o.id?"Ajout…":"Racheter ces produits"}</Button>}</div>)}</div>}</div>;
}

function AddressesPanel({ addresses, onAdd, onEdit, onDelete, onDefault, showForm, form, setForm, onSave, onCancel, saving }: any) {
  return <div className="rounded-xl border border-border bg-card p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Livraison</p><h2 className="mt-1 font-display text-xl font-semibold">Mes adresses</h2></div><Button onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Ajouter</Button></div>{showForm && <div className="mt-5 rounded-xl border border-gold/30 bg-surface p-5"><h3 className="font-display font-semibold">{form.id ? "Modifier l'adresse" : "Nouvelle adresse"}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Libellé" id="address-label"><Input id="address-label" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} /></Field><Field label="Nom complet" id="address-name"><Input id="address-name" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} /></Field><Field label="Téléphone" id="address-phone"><Input id="address-phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} inputMode="tel" /></Field><Field label="Ville" id="address-city"><select id="address-city" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="">Choisir une ville</option>{moroccanCities.map(c=><option key={c} value={c}>{c}</option>)}</select></Field></div><Field label="Adresse complète" id="address-full"><Textarea id="address-full" rows={3} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></Field><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_default} onChange={e=>setForm({...form,is_default:e.target.checked})} /> Adresse principale</label><div className="mt-4 flex gap-2"><Button onClick={onSave} disabled={saving}><Save className="mr-2 h-4 w-4" />Enregistrer</Button><Button variant="outline" onClick={onCancel}>Annuler</Button></div></div>}{addresses.length===0&&!showForm?<p className="mt-6 text-sm text-muted-foreground">Aucune adresse enregistrée.</p>:<div className="mt-5 grid gap-3">{addresses.map(a=><div key={a.id} className="rounded-lg border border-border p-4"><div className="flex justify-between gap-3"><div><div className="flex items-center gap-2"><Home className="h-4 w-4 text-gold" /><p className="font-semibold">{a.label}</p>{a.is_default&&<span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] text-gold">Principale</span>}</div><p className="mt-2 text-sm">{a.full_name} · {a.phone}</p><p className="text-sm text-muted-foreground">{a.address}, {a.city}</p></div><div className="flex items-start gap-1"><Button variant="ghost" size="icon" onClick={()=>onEdit(a)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={()=>onDelete(a.id)}><Trash2 className="h-4 w-4" /></Button></div></div>{!a.is_default&&<button onClick={()=>onDefault(a.id)} className="mt-3 text-xs text-gold hover:underline">Définir comme principale</button>}</div>)}</div>}</div>;
}

function FavoritesPanel({ favorites, onRemove }: { favorites: Favorite[]; onRemove: (id:string)=>void }) {
  const visible = favorites.filter(f=>f.products?.visible !== false);
  return <div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center gap-3"><Heart className="h-5 w-5 text-gold" /><h2 className="font-display text-xl font-semibold">Mes favoris</h2></div>{visible.length===0?<p className="mt-6 text-sm text-muted-foreground">Aucun favori pour le moment.</p>:<div className="mt-5 grid gap-3 sm:grid-cols-2">{visible.map(f=>f.products&&<div key={f.product_id} className="flex gap-3 rounded-lg border border-border p-3"><img src={f.products.image_url||"/placeholder.svg"} alt="" className="h-20 w-20 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold">{f.products.name}</p><p className="mt-1 text-gold">{formatMAD(Number(f.products.price))}</p><div className="mt-2 flex gap-2"><Button asChild size="sm"><Link to="/produit/$slug" params={{slug:f.products.slug}}>Voir</Link></Button><Button variant="outline" size="sm" onClick={()=>onRemove(f.product_id)}>Retirer</Button></div></div></div>)}</div>}</div>;
}

function SecurityPanel({ newPassword,setNewPassword,newPassword2,setNewPassword2,onChangePassword,saving,orderUpdates,promotions,securityAlerts,updatePrefs }: any) {
  return <div className="space-y-6"><div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center gap-3"><Shield className="h-5 w-5 text-gold" /><h2 className="font-display text-xl font-semibold">Sécurité</h2></div><p className="mt-2 text-sm text-muted-foreground">Gardez un mot de passe unique et difficile à deviner.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nouveau mot de passe" id="new-password"><Input id="new-password" type="password" minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></Field><Field label="Confirmation" id="new-password2"><Input id="new-password2" type="password" minLength={8} value={newPassword2} onChange={e=>setNewPassword2(e.target.value)} /></Field></div><Button className="mt-4" onClick={onChangePassword} disabled={saving}>Modifier le mot de passe</Button></div><div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-gold" /><h2 className="font-display text-xl font-semibold">Notifications</h2></div><div className="mt-4 space-y-3"><Toggle label="Mises à jour de commande" checked={orderUpdates} onChange={(v:boolean)=>updatePrefs("order_updates",v)} /><Toggle label="Offres et promotions" checked={promotions} onChange={(v:boolean)=>updatePrefs("promotions",v)} /><Toggle label="Alertes de sécurité" checked={securityAlerts} onChange={(v:boolean)=>updatePrefs("security_alerts",v)} /></div></div><div className="rounded-xl border border-border bg-card p-6"><p className="font-display font-semibold">Connexion sociale</p><p className="mt-1 text-sm text-muted-foreground">Google et Facebook peuvent être liés automatiquement lorsqu'ils utilisent la même adresse e-mail, selon la configuration Supabase.</p></div></div>;
}
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}) { return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm"><span>{label}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} /></label>; }
