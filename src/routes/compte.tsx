import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LogIn, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  notifyAuthChanged,
  setSupabaseAccessToken,
  startSupabaseOAuth,
  supabaseAuth,
  supabaseConfigured,
  supabaseCurrentUser,
  supabaseUpdatePassword,
} from "@/lib/supabase";

export const Route = createFileRoute("/compte")({ component: ComptePage });

type AccountMode = "login" | "signup" | "forgot" | "reset";
type OAuthProvider = "google" | "facebook";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z" />
      <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z" />
      <path fill="#FBBC05" d="M6.54 13.79A5.86 5.86 0 0 1 6.23 12c0-.62.11-1.22.31-1.79V7.68H3.3A9.72 9.72 0 0 0 2.25 12c0 1.56.37 3.04 1.05 4.32l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.23 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.9 9.46 6.18 12 6.18Z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 rounded-full">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M13.45 20v-7.02h2.35l.35-2.73h-2.7V8.51c0-.79.22-1.33 1.36-1.33h1.45V4.74c-.25-.03-1.11-.11-2.12-.11-2.1 0-3.54 1.28-3.54 3.63v1.99H8.23v2.73h2.37V20h2.85Z" />
    </svg>
  );
}

export default function ComptePage() {
  const [mode, setMode] = useState<AccountMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const handleAuthCallback = async () => {
      const token = sessionStorage.getItem("orotronix_user_token");
      setLoggedIn(Boolean(token));

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const type = hash.get("type");
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
          if (user.email) sessionStorage.setItem("orotronix_user_email", user.email);
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
          if (fullName) sessionStorage.setItem("orotronix_user_name", fullName);
          setLoggedIn(true);
          notifyAuthChanged();
          window.history.replaceState({}, document.title, window.location.pathname);
          await navigate({ to: "/boutique", replace: true });
        } catch (error) {
          if (!active) return;
          sessionStorage.removeItem("orotronix_user_token");
          sessionStorage.removeItem("orotronix_user_refresh_token");
          setSupabaseAccessToken(null);
          setMessage(error instanceof Error ? error.message : "La connexion sociale a échoué.");
        }
      }
    };

    void handleAuthCallback();
    return () => {
      active = false;
    };
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!supabaseConfigured) {
        throw new Error("Le compte client sera disponible après la configuration de Supabase.");
      }

      if (mode === "forgot") {
        await supabaseAuth("recover", {
          email: email.trim(),
          redirect_to: "https://www.orotronix.com/compte",
        });
        setMessage("Si cette adresse est associée à un compte, un e-mail de réinitialisation va être envoyé.");
      } else if (mode === "reset") {
        if (!recoveryToken) throw new Error("Le lien de réinitialisation est invalide ou expiré.");
        if (password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");

        await supabaseUpdatePassword(password, recoveryToken);
        sessionStorage.removeItem("orotronix_user_token");
        sessionStorage.removeItem("orotronix_user_refresh_token");
        setSupabaseAccessToken(null);
        setRecoveryToken("");
        setMode("login");
        setPassword("");
        setShowPassword(false);
        setMessage("Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.");
      } else if (mode === "signup") {
        await supabaseAuth("signup", {
          email: email.trim(),
          password,
          redirect_to: "https://www.orotronix.com/compte",
        });
        setMessage("Compte créé. Vérifiez votre e-mail pour confirmer votre adresse.");
        setMode("login");
        setPassword("");
      } else {
        const session = await supabaseAuth("token?grant_type=password", {
          email: email.trim(),
          password,
        });
        setSupabaseAccessToken(session.access_token);
        sessionStorage.setItem("orotronix_user_email", email.trim());
        sessionStorage.setItem("orotronix_user_token", session.access_token);
        if (session.refresh_token) sessionStorage.setItem("orotronix_user_refresh_token", session.refresh_token);
        setLoggedIn(true);
        notifyAuthChanged();
        await navigate({ to: "/boutique", replace: true });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = (provider: OAuthProvider) => {
    if (!supabaseConfigured) {
      setMessage("La connexion sociale sera disponible après la configuration de Supabase.");
      return;
    }
    setMessage("");
    setOauthLoading(provider);
    try {
      startSupabaseOAuth(provider);
    } catch (error) {
      setOauthLoading(null);
      setMessage(error instanceof Error ? error.message : "Impossible de démarrer la connexion.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("orotronix_user_token");
    sessionStorage.removeItem("orotronix_user_refresh_token");
    sessionStorage.removeItem("orotronix_user_email");
    sessionStorage.removeItem("orotronix_user_name");
    setSupabaseAccessToken(null);
    setLoggedIn(false);
    notifyAuthChanged();
    setMessage("Vous êtes déconnecté.");
  };

  const title =
    mode === "signup"
      ? "Créer un compte"
      : mode === "forgot"
        ? "Mot de passe oublié"
        : mode === "reset"
          ? "Nouveau mot de passe"
          : "Mon compte";

  const isAuthForm = mode === "login" || mode === "signup";

  return (
    <main className="container-page py-16">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface/60 p-6 shadow-xl sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold">
            <UserRound className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Accédez à votre espace OROTRONIX simplement et en toute sécurité.
          </p>
        </div>

        {loggedIn ? (
          <div className="space-y-4">
            <p className="rounded-md border border-border p-4 text-center text-sm text-muted-foreground">
              Vous êtes connecté à votre compte OROTRONIX.
            </p>
            <Button type="button" variant="outline" className="w-full" onClick={logout}>
              Se déconnecter
            </Button>
          </div>
        ) : (
          <>
            {isAuthForm && (
              <>
                <div className="grid gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-center gap-3 border-border bg-background/40 hover:border-gold/40 hover:bg-background/70"
                    disabled={loading || oauthLoading !== null}
                    onClick={() => loginWithOAuth("google")}
                  >
                    <GoogleMark />
                    {oauthLoading === "google" ? "Connexion à Google…" : "Continuer avec Google"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-center gap-3 border-border bg-background/40 hover:border-gold/40 hover:bg-background/70"
                    disabled={loading || oauthLoading !== null}
                    onClick={() => loginWithOAuth("facebook")}
                  >
                    <FacebookMark />
                    {oauthLoading === "facebook" ? "Connexion à Facebook…" : "Continuer avec Facebook"}
                  </Button>
                </div>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Ou avec e-mail</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode !== "reset" && (
                <div>
                  <label htmlFor="account-email" className="mb-2 block text-sm font-medium text-foreground">
                    Adresse e-mail
                  </label>
                  <Input
                    id="account-email"
                    type="email"
                    required
                    autoComplete={mode === "login" ? "email" : "email"}
                    inputMode="email"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                  />
                </div>
              )}

              {(mode === "login" || mode === "signup" || mode === "reset") && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="account-password" className="block text-sm font-medium text-foreground">
                      {mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setMessage("");
                        }}
                        className="text-xs text-muted-foreground transition-colors hover:text-gold"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="account-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-11"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-gold"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="mt-2 text-xs text-muted-foreground">8 caractères minimum.</p>
                  )}
                </div>
              )}

              {mode === "forgot" && (
                <p className="mb-4 text-sm leading-6 text-muted-foreground">
                  Entrez votre adresse e-mail. Si elle correspond à un compte, nous vous enverrons un lien sécurisé.
                </p>
              )}

              <Button type="submit" className="h-11 w-full" disabled={loading || oauthLoading !== null}>
                {loading
                  ? "Veuillez patienter…"
                  : mode === "login"
                    ? "Se connecter"
                    : mode === "signup"
                      ? "Créer mon compte"
                      : mode === "forgot"
                        ? "Envoyer le lien"
                        : "Modifier le mot de passe"}
              </Button>
            </form>

            {message && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-md border border-border bg-background/30 p-3 text-sm leading-5 text-muted-foreground"
              >
                {message}
              </p>
            )}

            {mode !== "reset" && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                    setPassword("");
                    setShowPassword(false);
                  }}
                  className={mode === "login" ? "text-gold" : "text-muted-foreground hover:text-foreground"}
                >
                  <LogIn className="mr-1 inline h-4 w-4" />Connexion
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                    setPassword("");
                    setShowPassword(false);
                  }}
                  className={mode === "signup" ? "text-gold" : "text-muted-foreground hover:text-foreground"}
                >
                  <UserPlus className="mr-1 inline h-4 w-4" />Inscription
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-7 border-t border-border pt-5 text-center">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-gold">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
