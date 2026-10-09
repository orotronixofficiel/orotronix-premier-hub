import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.orotronix.com/</loc></url>
  <url><loc>https://www.orotronix.com/boutique</loc></url>
  <url><loc>https://www.orotronix.com/reparation</loc></url>
  <url><loc>https://www.orotronix.com/produit/orotronix-flagship-pro-256</loc></url>
  <url><loc>https://www.orotronix.com/produit/galaxy-s-ultra-512</loc></url>
  <url><loc>https://www.orotronix.com/produit/pixel-8-128</loc></url>
  <url><loc>https://www.orotronix.com/produit/redmi-note-pro-256</loc></url>
  <url><loc>https://www.orotronix.com/produit/chargeur-gan-65w</loc></url>
  <url><loc>https://www.orotronix.com/produit/ecouteurs-anc-pro</loc></url>
  <url><loc>https://www.orotronix.com/produit/powerbank-10000</loc></url>
  <url><loc>https://www.orotronix.com/produit/verre-trempe-premium</loc></url>
  <url><loc>https://www.orotronix.com/produit/support-mural-tv</loc></url>
  <url><loc>https://www.orotronix.com/produit/cable-hdmi-2-1</loc></url>
  <url><loc>https://www.orotronix.com/produit/box-android-tv-4k</loc></url>
  <url><loc>https://www.orotronix.com/produit/pack-essentiel-smartphone</loc></url>
  <url><loc>https://www.orotronix.com/produit/pack-audio-nomade</loc></url>
</urlset>`;

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Serve the sitemap directly as XML before TanStack Start handles app routes.
    if (url.pathname === "/sitemap.xml") {
      return new Response(SITEMAP_XML, {
        headers: {
          "content-type": "application/xml; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
