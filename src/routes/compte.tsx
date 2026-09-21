import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { UserRound, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  supabaseAuth,
  supabaseConfigured,
  supabaseUpdatePassword,
  setSupabaseAccessToken,
} from "@/lib/supabase";

export const Route = createFileRoute("/compte")({ component: ComptePage });

type AccountMode = "login" | "signup" | "forgot" | "reset";

export default function ComptePage() {
  const [mode, setMode] = useState<AccountMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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
      if (refreshToken) {
        sessionStorage.setItem("orotronix_user_refresh_token", refreshToken);
      }
      setLoggedIn(false);
      setMode("reset");
      setMessage("Choisissez votre nouveau mot de passe.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
        if (password.length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères.");

        await supabaseUpdatePassword(password, recoveryToken);
        sessionStorage.removeItem("orotronix_user_token");
        sessionStorage.removeItem("orotronix_user_refresh_token");
        setSupabaseAccessToken(null);
        setRecoveryToken("");
        setMode("login");
        setPassword("");
        setMessage("Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.");
      } else if (mode === "signup") {
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
        if (session.refresh_token) {
          sessionStorage.setItem("orotronix_user_refresh_token", session.refresh_token);
        }
        await navigate({ to: "/boutique", replace: true });
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

  return (
    <main className="container-page py-16">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface/60 p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold">
            <UserRound className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérez votre compte OROTRONIX simplement et en toute sécurité.
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
            <form onSubmit={submit} className="space-y-4">
              {mode !== "reset" && (
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                />
              )}

              {mode !== "forgot" && mode !== "reset" && (
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                />
              )}

              {mode === "reset" && (
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
              )}

              <Button type="submit" className="w-full" disabled={loading}>
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
              <p className="mt-4 rounded-md border border-border p-3 text-sm text-muted-foreground">
                {message}
              </p>
            )}

            {mode === "login" && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setMessage("");
                  }}
                  className="text-sm text-muted-foreground hover:text-gold"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {mode !== "reset" && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                  className={mode === "login" ? "text-gold" : "text-muted-foreground"}
                >
                  <LogIn className="mr-1 inline h-4 w-4" />Connexion
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                  }}
                  className={mode === "signup" ? "text-gold" : "text-muted-foreground"}
                >
                  <UserPlus className="mr-1 inline h-4 w-4" />Inscription
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-gold">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
