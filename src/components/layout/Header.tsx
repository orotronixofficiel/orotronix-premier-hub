import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/context/cart";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { refreshSupabaseSession } from "@/lib/supabase";

const navLinks = [
  { to: "/boutique", label: "Boutique" },
  { to: "/boutique", label: "Smartphones", search: { categorie: "smartphones" } },
  { to: "/boutique", label: "Accessoires", search: { categorie: "accessoires-telephone" } },
  { to: "/boutique", label: "TV", search: { categorie: "accessoires-tv" } },
  { to: "/reparation", label: "Réparation" },
] as const;

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    const syncAuth = async () => {
      if (!active) return;
      const token = sessionStorage.getItem("orotronix_user_token");
      setLoggedIn(Boolean(token));

      if (token) {
        const refreshed = await refreshSupabaseSession();
        if (!active) return;
        setLoggedIn(Boolean(refreshed || sessionStorage.getItem("orotronix_user_token")));
      }
    };

    const handleAuthChange = () => void syncAuth();
    const handleStorage = () => void syncAuth();

    void syncAuth();
    window.addEventListener("orotronix-auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      active = false;
      window.removeEventListener("orotronix-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/boutique", search: { q: query || undefined } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="hidden border-b border-border/50 py-2 text-center text-xs text-muted-foreground md:block">
        Livraison partout au Maroc • Paiement à la livraison • Ramassage et retour à domicile pour vos réparations
      </div>
      <div className="container-page relative grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Ouvrir le menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm border-border bg-background p-6">
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button aria-label="Fermer" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={submitSearch} className="mb-6">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="bg-surface"
                />
              </form>
              <Link
                to="/compte"
                onClick={() => setOpen(false)}
                className="mb-3 flex items-center gap-3 rounded-md border border-border px-3 py-3 font-display text-base text-foreground transition-colors hover:border-gold/60 hover:text-gold"
              >
                <UserRound className="h-5 w-5" />
                <span>{loggedIn ? "Mon compte" : "Se connecter / Créer un compte"}</span>
              </Link>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    search={"search" in link ? link.search : {}}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 font-display text-base text-foreground transition-colors hover:bg-surface hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/boutique"
                  search={{ categorie: "offres" }}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 font-display text-base text-gold"
                >
                  Offres
                </Link>
              </nav>
              <Button asChild className="mt-8 w-full" onClick={() => setOpen(false)}>
                <Link to="/reparation">Demander une réparation</Link>
              </Button>
            </SheetContent>
          </Sheet>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                search={"search" in link ? link.search : {}}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/boutique"
              search={{ categorie: "offres" }}
              className="text-sm font-medium text-gold"
            >
              Offres
            </Link>
          </nav>
        </div>

        <div className="justify-self-center">
          <Logo />
        </div>

        <div className="flex items-center justify-end gap-2">
          <form onSubmit={submitSearch} className="hidden xl:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-56 bg-surface pl-9"
              />
            </div>
          </form>
          <Link
            to="/compte"
            aria-label={loggedIn ? "Mon compte" : "Se connecter ou créer un compte"}
            title={loggedIn ? "Mon compte" : "Se connecter / Créer un compte"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors hover:border-gold/60 hover:text-gold"
          >
            <UserRound className="h-5 w-5" />
          </Link>
          <Link
            to="/panier"
            aria-label="Panier"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors hover:border-gold/60"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
