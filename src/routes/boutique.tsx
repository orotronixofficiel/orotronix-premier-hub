import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { categories as fallbackCategories, products as fallbackProducts, loadRemoteCatalog, type CategorySlug } from "@/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMAD } from "@/lib/format";

type ShopSearch = { categorie?: string; q?: string };

const MAX_PRICE = 15000;

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
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState("pertinence");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeQuery = (q ?? "").toLowerCase();

  const list = useMemo(() => {
    let result = catalogProducts.filter((p) => {
      if (categorie && p.category !== categorie) return false;
      if (p.price > maxPrice) return false;
      if (activeQuery) {
        const haystack = `${p.name} ${p.brand} ${p.shortDescription}`.toLowerCase();
        if (!haystack.includes(activeQuery)) return false;
      }
      return true;
    });
    if (sort === "prix-croissant") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "prix-decroissant") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "promos") result = [...result].sort((a, b) => Number(!!b.oldPrice) - Number(!!a.oldPrice));
    return result;
  }, [catalogProducts, categorie, activeQuery, maxPrice, sort]);

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
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {current ? current.name : "Boutique"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {current ? current.description : "Tous nos smartphones, accessoires téléphone et TV, et offres spéciales."}
        </p>
      </header>

      {/* Catégories */}
      <div className="mt-6 flex flex-wrap gap-2">
        <CategoryChip active={!categorie} to={{}}>Tout</CategoryChip>
        {catalogCategories.map((c) => (
          <CategoryChip key={c.slug} active={categorie === c.slug} to={{ categorie: c.slug }}>
            {c.name}
          </CategoryChip>
        ))}
      </div>

      {/* Recherche + tri */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une marque…"
            className="bg-surface pl-9"
          />
        </form>
        <div className="flex gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[170px] bg-surface">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pertinence">Pertinence</SelectItem>
              <SelectItem value="prix-croissant">Prix croissant</SelectItem>
              <SelectItem value="prix-decroissant">Prix décroissant</SelectItem>
              <SelectItem value="promos">Promotions</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtres
          </Button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold">Prix maximum</p>
            <span className="text-sm text-gold">{formatMAD(maxPrice)}</span>
          </div>
          <Slider
            className="mt-4"
            value={[maxPrice]}
            min={50}
            max={MAX_PRICE}
            step={50}
            onValueChange={(v) => setMaxPrice(v[0])}
          />
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
  );
}

function CategoryChip({
  active,
  to,
  children,
}: {
  active: boolean;
  to: ShopSearch;
  children: React.ReactNode;
}) {
  return (
    <Link
      to="/boutique"
      search={to}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-gold bg-gold text-primary-foreground"
          : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
      }`}
    >
      {children}
    </Link>
  );
}
