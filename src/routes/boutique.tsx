import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X, LayoutGrid, ChevronDown } from "lucide-react";
import { categories as fallbackCategories, products as fallbackProducts, loadRemoteCatalog } from "@/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
} from "@/components/ui/select";
import { formatMAD } from "@/lib/format";

type ShopSearch = { categorie?: string; q?: string };

export const Route = createFileRoute("/boutique")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const categorie = String(search.categorie ?? "");
    const q = String(search.q ?? "");
    return {
      categorie: categorie || undefined,
      q: q || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Boutique — Smartphones et accessoires | OROTRONIX" },
      {
        name: "description",
        content:
          "Parcourez les smartphones, accessoires téléphone, accessoires TV et offres OROTRONIX. Livraison au Maroc, paiement à la livraison.",
      },
      { property: "og:title", content: "Boutique OROTRONIX" },
      {
        property: "og:description",
        content: "Smartphones, accessoires téléphone et TV, et offres spéciales. Livraison partout au Maroc.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.orotronix.com/boutique" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { categorie, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/boutique" });

  const [query, setQuery] = useState(q ?? "");
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts);
  const [catalogCategories, setCatalogCategories] = useState(fallbackCategories);
  useEffect(() => { void loadRemoteCatalog().then((data) => { setCatalogProducts(data.products); setCatalogCategories(data.categories); }).catch(() => {}); }, []);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const activeQuery = (q ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const list = useMemo(() => {
    let result = catalogProducts.filter((p) => {
      if (categorie && p.category !== categorie) return false;
      if (activeQuery.length) {
        const haystack = `${p.name ?? ""} ${p.brand ?? ""} ${p.shortDescription ?? ""}`
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("fr")
          .replace(/[^a-z0-9]+/g, " ");
        if (!activeQuery.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
    return result;
  }, [catalogProducts, categorie, activeQuery.join(" ")]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: query || undefined }) });
  };

  const current = catalogCategories.find((c) => c.slug === categorie);

  return (
    <div className="container-page py-10 lg:py-14">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Boutique</span>
        {current && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gold">{current.name}</span>
          </>
        )}
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Boutique</h1>
      </header>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {/* Recherche et catégories */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              aria-expanded={categoriesOpen}
              aria-label={categoriesOpen ? "Masquer les catégories" : "Afficher les catégories"}
              onClick={() => setCategoriesOpen((open) => !open)}
              className="h-10 shrink-0 justify-center gap-2 rounded-xl border-border bg-card px-3 shadow-sm transition-colors hover:border-gold/60 hover:bg-gold/5 sm:order-1"
            >
              <LayoutGrid className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium">Catégories</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
            </Button>
            <form onSubmit={submitSearch} className="relative min-w-0 flex-1 sm:order-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque…"
                className="bg-surface pl-9"
              />
            </form>
          </div>
          {categoriesOpen && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-3 shadow-lg sm:p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate({ search: (prev) => ({ ...prev, categorie: undefined }) });
                    setCategoriesOpen(false);
                  }}
                  className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors hover:border-gold/50 hover:bg-gold/5 ${!categorie ? "border-gold/60 bg-gold/5 text-gold" : "border-border"}`}
                >
                  <span>Toutes les catégories</span>
                  {!categorie && <span aria-hidden="true">✓</span>}
                </button>
                {catalogCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => {
                      navigate({ search: (prev) => ({ ...prev, categorie: category.slug }) });
                      setCategoriesOpen(false);
                    }}
                    className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-gold/50 hover:bg-gold/5 ${categorie === category.slug ? "border-gold/60 bg-gold/5 text-gold" : "border-border"}`}
                  >
                    <span>{category.name}</span>
                    {categorie === category.slug && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">
          Recherche : « {q} »
          <button
            aria-label="Effacer la recherche"
            onClick={() => {
              setQuery("");
              navigate({ search: (prev) => ({ ...prev, q: undefined }) });
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

          <p className="mt-6 text-xs text-muted-foreground">
            {list.length} produit{list.length > 1 ? "s" : ""}
          </p>

          {list.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
          <p className="font-display text-lg">Aucun produit ne correspond à votre recherche.</p>
          <p className="mt-2 text-sm text-muted-foreground">Essayez d'élargir le prix ou de changer de catégorie.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
          )}
        </div>
      </div>
    </div>
  );
}

