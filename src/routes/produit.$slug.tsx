import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products as fallbackProducts, loadRemoteProduct, loadRemoteCatalog } from "@/data/catalog";
import { formatMAD } from "@/lib/format";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/layout/Section";

export const Route = createFileRoute("/produit/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Produit indisponible — OROTRONIX" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — OROTRONIX` },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: `${product.name} — OROTRONIX` },
        { property: "og:description", content: product.shortDescription },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const initialProduct = Route.useLoaderData().product;
  const [product, setProduct] = useState(initialProduct);
  const [allProducts, setAllProducts] = useState(fallbackProducts);
  const { addItem } = useCart();
  useEffect(() => { void Promise.all([loadRemoteProduct(initialProduct.slug), loadRemoteCatalog()]).then(([p, data]) => { if (p) setProduct(p); setAllProducts(data.products); }).catch(() => {}); }, [initialProduct.slug]);
  const [quantity, setQuantity] = useState(1);

  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="container-page py-10 lg:py-14">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to="/boutique" className="hover:text-gold">Boutique</Link>
        <span className="mx-2">/</span>
        <span className="text-gold">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-3xl font-semibold text-gold">{formatMAD(product.price)}</p>
            {product.oldPrice && (
              <p className="pb-1 text-sm text-muted-foreground line-through">{formatMAD(product.oldPrice)}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {product.inStock ? "En stock — expédition sous 24 h" : "Temporairement indisponible"}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="h-4 w-4 shrink-0 text-gold" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex w-fit items-center rounded-md border border-border">
              <button
                aria-label="Réduire la quantité"
                className="px-3 py-2.5 text-muted-foreground hover:text-gold"
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-display text-sm">{quantity}</span>
              <button
                aria-label="Augmenter la quantité"
                className="px-3 py-2.5 text-muted-foreground hover:text-gold"
                onClick={() => setQuantity((n) => n + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
              onClick={() => {
                addItem(product, quantity);
                toast.success("Ajouté au panier", { description: `${product.name} × ${quantity}` });
              }}
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> Ajouter au panier
            </Button>
          </div>

          <div className="mt-8 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-gold" /> Livraison partout au Maroc
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-gold" /> Paiement à la livraison
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="À découvrir" title="Produits similaires" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
