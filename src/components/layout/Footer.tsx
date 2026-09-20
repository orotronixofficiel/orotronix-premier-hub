import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            OROTRONIX — smartphones, accessoires téléphone et TV, et réparation professionnelle au Maroc.
            Qualité garantie, service soigné.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://instagram.com/orotronixofficiel"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-gold/60 hover:text-gold"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com/orotronixofficiel"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-gold/60 hover:text-gold"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="eyebrow">Boutique</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/boutique" search={{ categorie: "smartphones" }} className="hover:text-gold">Smartphones</Link></li>
            <li><Link to="/boutique" search={{ categorie: "accessoires-telephone" }} className="hover:text-gold">Accessoires téléphone</Link></li>
            <li><Link to="/boutique" search={{ categorie: "accessoires-tv" }} className="hover:text-gold">Accessoires TV</Link></li>
            <li><Link to="/boutique" search={{ categorie: "offres" }} className="hover:text-gold">Offres</Link></li>
            <li><Link to="/panier" className="hover:text-gold">Mon panier</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Réparation</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/reparation" className="hover:text-gold">Service de réparation</Link></li>
            <li><Link to="/reparation" hash="demande" className="hover:text-gold">Demander une réparation</Link></li>
            <li><Link to="/reparation" hash="ramassage" className="hover:text-gold">Ramassage & livraison</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-gold" />
              <a href="tel:+212656566366" className="hover:text-gold">+212 6 56 56 63 66</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-gold" />
              <a href="mailto:contact@orotronix.com" className="hover:text-gold">contact@orotronix.com</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-gold" />
              <span>Kasba, Rue 21, N°10, Mohammedia 28800, Maroc</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-gold" />
              <span>Lun – Dim : 10h00 – 22h00</span>
            </li>
            <li className="text-xs">www.orotronix.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 py-5">
        <p className="container-page text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OROTRONIX. Tous droits réservés. 
        </p>
      </div>
    </footer>
  );
}
