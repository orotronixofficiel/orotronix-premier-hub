import { createFileRoute } from "@tanstack/react-router";

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <url><loc>https://www.orotronix.com/</loc></url>',
  '  <url><loc>https://www.orotronix.com/boutique</loc></url>',
  '  <url><loc>https://www.orotronix.com/reparation</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/orotronix-flagship-pro-256</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/galaxy-s-ultra-512</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/pixel-8-128</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/redmi-note-pro-256</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/chargeur-gan-65w</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/ecouteurs-anc-pro</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/powerbank-10000</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/verre-trempe-premium</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/support-mural-tv</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/cable-hdmi-2-1</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/box-android-tv-4k</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/pack-essentiel-smartphone</loc></url>',
  '  <url><loc>https://www.orotronix.com/produit/pack-audio-nomade</loc></url>',
  '</urlset>',
].join("\n");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemap, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        }),
    },
  },
});
