import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Phone } from "lucide-react";
import { getLastOrder, type Order } from "@/lib/orders";
import { formatMAD } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/confirmation")({
  head: () => ({
    meta: [
      { title: "Commande confirmée — OROTRONIX" },
      { name: "description", content: "Votre commande OROTRONIX a bien été enregistrée." },
      { property: "og:title", content: "Commande confirmée — OROTRONIX" },
      { property: "og:description", content: "Merci pour votre commande OROTRONIX." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrder(getLastOrder());
  }, []);

  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
        <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">Commande confirmée</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Merci&nbsp;! Notre équipe vous appelle pour confirmer la livraison et le créneau de passage.
        </p>
      </div>

      {order ? (
        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Référence</p>
              <p className="font-display text-lg font-semibold text-gold">{order.reference}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Paiement</p>
              <p className="text-sm">À la livraison</p>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {order.items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{i.name} × {i.quantity}</span>
                <span>{formatMAD(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd>{order.shipping === 0 ? "Offerte" : formatMAD(order.shipping)}</dd></div>
            <div className="flex justify-between font-display text-base font-semibold"><dt>Total</dt><dd className="text-gold">{formatMAD(order.total)}</dd></div>
          </dl>

          <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
            <p className="font-display text-sm font-semibold text-foreground">Livraison</p>
            <p className="mt-1">{order.customer.fullName} — {order.customer.phone}</p>
            <p>{order.customer.address}, {order.customer.city}</p>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Aucune commande récente trouvée sur cet appareil.
        </p>
      )}

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild><Link to="/boutique">Continuer mes achats</Link></Button>
        <Button asChild variant="outline">
          <a href="tel:+212600000000"><Phone className="mr-2 h-4 w-4" /> Contacter OROTRONIX</a>
        </Button>
      </div>
    </div>
  );
}
