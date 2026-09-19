import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/catalog";
import { formatMAD } from "@/lib/format";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="hover-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Link
        to="/produit/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.oldPrice && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            Promo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.brand}</p>
        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug">
          <Link to="/produit/$slug" params={{ slug: product.slug }} className="hover:text-gold">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold text-gold">{formatMAD(product.price)}</p>
            {product.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">{formatMAD(product.oldPrice)}</p>
            )}
          </div>
          <Button
            size="icon"
            aria-label={`Ajouter ${product.name} au panier`}
            onClick={() => {
              addItem(product);
              toast.success("Ajouté au panier", { description: product.name });
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
