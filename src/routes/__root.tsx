import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/context/cart";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { initLanguage } from "@/lib/i18n";

const OROTRONIX_LOGO =
  "https://qeqqfelebzxwupsqyzbz.supabase.co/storage/v1/object/public/orotronix-media/Branding/Picsart_26-09-25_21-06-06-191.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Cette page ne s'est pas chargée
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un problème est survenu. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OROTRONIX — Smartphones, accessoires et réparation au Maroc" },
      {
        name: "description",
        content:
          "OROTRONIX : smartphones, accessoires téléphone et TV, et réparation professionnelle à Mohammedia et partout au Maroc.",
      },
      { name: "author", content: "OROTRONIX" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#0a0a0a" },
      { name: "og:site_name", content: "OROTRONIX" },
      { property: "og:locale", content: "fr_MA" },
      { property: "og:url", content: "https://www.orotronix.com/" },
      { property: "og:title", content: "OROTRONIX — Smartphones, accessoires et réparation" },
      {
        property: "og:description",
        content: "Boutique smartphone, accessoires et atelier de réparation à Mohammedia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://www.orotronix.com/#business",
          name: "OROTRONIX",
          url: "https://www.orotronix.com/",
          telephone: "+212656566366",
          image: OROTRONIX_LOGO,
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Rue 21, N°10, Kasba",
            postalCode: "28800",
            addressLocality: "Mohammedia",
            addressCountry: "MA",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              opens: "10:00",
              closes: "22:00",
            },
          ],
          areaServed: "MA",
          sameAs: [
            "https://www.instagram.com/orotronixofficiel/",
            "https://www.facebook.com/orotronixofficiel/",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initLanguage();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/") return;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const type = params.get("type");
    const hasAuthCallback = Boolean(params.get("access_token")) && (type === "signup" || type === "recovery");
    if (hasAuthCallback) {
      window.location.replace("/compte" + window.location.search + window.location.hash);
    }
  }, []);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {isAdminRoute ? (
          <main className="min-h-screen bg-background">
            <Outlet />
          </main>
        ) : (
          <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        )}
        <Toaster position="top-center" />
      </CartProvider>
    </QueryClientProvider>
  );
}
