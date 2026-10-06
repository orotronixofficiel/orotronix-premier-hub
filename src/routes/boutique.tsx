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

function CategoryMenuItem({ active, to, children }: { active: boolean; to: ShopSearch; children: React.ReactNode }) {
  return (
    <Link
      to="/boutique"
      search={to}
      className={`flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
        active
          ? "bg-gold text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-gold/10 hover:text-gold"
      }`}
    >
      <span className="truncate">{children}</span>
    </Link>
  );
}
