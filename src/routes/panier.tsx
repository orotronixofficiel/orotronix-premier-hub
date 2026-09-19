import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatMAD } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Mon panier — OROTRONIX" },
      { name: "description", content: "Vérifiez les articles de votre panier OROTRONIX avant de commander." },
      { property: "og:title", content: "Mon panier — OROTRONIX" },
      { property: "og:description", content: "Votre sélection de produits OROTRONIX." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, removeItem, subtotal, shipping, total } = useCart();

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Mon panier</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-display text-lg">Votre panier est vide</p>
          <p className="mt-2 text-sm text-muted-foreground">Découvrez nos smartphones et accessoires.</p>
          <Button asChild className="mt-6"><Link to="/boutique">Aller à la boutique</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.slug} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <Link to="/produit/$slug" params={{ slug: item.slug }} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to="/produit/$slug"
                    params={{ slug: item.slug }}
                    className="font-display text-sm font-semibold hover:text-gold sm:text-base"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-gold">{formatMAD(item.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        aria-label="Réduire"
                        className="px-2.5 py-2 text-muted-foreground hover:text-gold"
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label="Augmenter"
                        className="px-2.5 py-2 text-muted-foreground hover:text-gold"
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.slug)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold">Récapitulatif</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd>{formatMAD(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd>{shipping === 0 ? "Offerte" : formatMAD(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-display text-base font-semibold">
                <dt>Total</dt>
                <dd className="text-gold">{formatMAD(total)}</dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link to="/commande">Passer la commande</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Paiement à la livraison partout au Maroc
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
