import smartphonesImg from "@/assets/cat-smartphones.jpg";
import accessoriesImg from "@/assets/cat-accessories.jpg";
import tvImg from "@/assets/cat-tv.jpg";
import offersImg from "@/assets/cat-offers.jpg";

export type CategorySlug = "smartphones" | "accessoires-telephone" | "accessoires-tv" | "offres";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
};

export const categories: Category[] = [
  {
    slug: "smartphones",
    name: "Smartphones",
    description: "Flagships et modèles essentiels, garantis et prêts à l'emploi.",
    image: smartphonesImg,
  },
  {
    slug: "accessoires-telephone",
    name: "Accessoires téléphone",
    description: "Chargeurs, protections, audio et énergie portable.",
    image: accessoriesImg,
  },
  {
    slug: "accessoires-tv",
    name: "Accessoires TV",
    description: "Supports muraux, câbles HDMI, boîtiers et télécommandes.",
    image: tvImg,
  },
  {
    slug: "offres",
    name: "Offres",
    description: "Sélection à prix réduit, pendant que le stock dure.",
    image: offersImg,
  },
];

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  price: number;
  oldPrice?: number;
  image: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  inStock: boolean;
  featured?: boolean;
  visible?: boolean;
  sortOrder?: number;
};

export const products: Product[] = [
  {
    slug: "orotronix-flagship-pro-256",
    name: "Flagship Pro 5G 256 Go",
    brand: "Apple",
    category: "smartphones",
    price: 11900,
    image: smartphonesImg,
    shortDescription: "Écran OLED 6,7\", triple caméra, 256 Go.",
    description:
      "Le smartphone haut de gamme de notre sélection : écran OLED 120 Hz, châssis titane et système photo professionnel. Livré scellé avec garantie OROTRONIX de 12 mois.",
    highlights: ["Écran OLED 6,7\" 120 Hz", "Triple caméra 48 MP", "Batterie longue durée", "Garantie 12 mois"],
    inStock: true,
    featured: true,
  },
  {
    slug: "galaxy-s-ultra-512",
    name: "Galaxy S Ultra 512 Go",
    brand: "Samsung",
    category: "smartphones",
    price: 13500,
    oldPrice: 14800,
    image: smartphonesImg,
    shortDescription: "Photo 200 MP, stylet intégré, 512 Go.",
    description:
      "Puissance maximale pour la photo et la productivité : capteur 200 MP, zoom optique et autonomie confortable. Appareil neuf, facture et garantie incluses.",
    highlights: ["Capteur 200 MP", "Zoom optique x5", "512 Go de stockage", "Charge rapide 45 W"],
    inStock: true,
    featured: true,
  },
  {
    slug: "pixel-8-128",
    name: "Pixel 8 128 Go",
    brand: "Google",
    category: "smartphones",
    price: 6900,
    image: smartphonesImg,
    shortDescription: "Photographie computationnelle, Android pur.",
    description:
      "L'expérience Android la plus fluide avec un traitement photo remarquable et des mises à jour garanties pendant plusieurs années.",
    highlights: ["Android pur", "Photo IA", "Écran 6,2\"", "Garantie 12 mois"],
    inStock: true,
  },
  {
    slug: "redmi-note-pro-256",
    name: "Redmi Note Pro 256 Go",
    brand: "Xiaomi",
    category: "smartphones",
    price: 2790,
    oldPrice: 3190,
    image: smartphonesImg,
    shortDescription: "Le meilleur rapport qualité/prix du marché.",
    description:
      "Grande autonomie, écran AMOLED et charge rapide : le choix malin pour un usage quotidien sans compromis.",
    highlights: ["AMOLED 120 Hz", "Batterie 5000 mAh", "Charge 67 W", "Double SIM"],
    inStock: true,
    featured: true,
  },
  {
    slug: "chargeur-gan-65w",
    name: "Chargeur GaN 65 W",
    brand: "OROTRONIX",
    category: "accessoires-telephone",
    price: 349,
    image: accessoriesImg,
    shortDescription: "Chargeur compact 3 ports, USB-C Power Delivery.",
    description:
      "Chargez téléphone, tablette et ordinateur portable avec un seul bloc. Technologie GaN pour un format compact et une chauffe maîtrisée.",
    highlights: ["65 W Power Delivery", "3 ports (2 USB-C + USB-A)", "Protection surtension", "Garantie 6 mois"],
    inStock: true,
    featured: true,
  },
  {
    slug: "ecouteurs-anc-pro",
    name: "Écouteurs sans fil ANC Pro",
    brand: "OROTRONIX",
    category: "accessoires-telephone",
    price: 590,
    oldPrice: 790,
    image: accessoriesImg,
    shortDescription: "Réduction de bruit active, 30 h d'autonomie.",
    description:
      "Son riche, réduction de bruit active et appels clairs grâce au double micro. Boîtier de charge USB-C.",
    highlights: ["Réduction de bruit active", "30 h avec le boîtier", "Bluetooth 5.3", "Résistant à la transpiration"],
    inStock: true,
  },
  {
    slug: "powerbank-10000",
    name: "Batterie externe 10 000 mAh",
    brand: "OROTRONIX",
    category: "accessoires-telephone",
    price: 249,
    image: accessoriesImg,
    shortDescription: "Charge rapide 22,5 W, format poche.",
    description: "Une recharge complète pour la majorité des smartphones, avec affichage du niveau de batterie.",
    highlights: ["22,5 W", "USB-C + USB-A", "Format poche", "Indicateur LED"],
    inStock: true,
  },
  {
    slug: "verre-trempe-premium",
    name: "Verre trempé premium",
    brand: "OROTRONIX",
    category: "accessoires-telephone",
    price: 89,
    image: accessoriesImg,
    shortDescription: "Protection 9H, pose offerte en boutique.",
    description: "Verre trempé 9H anti-rayures avec kit de pose. Installation gratuite dans notre atelier.",
    highlights: ["Dureté 9H", "Oléophobe", "Pose offerte", "Compatible coques"],
    inStock: true,
  },
  {
    slug: "support-mural-tv",
    name: "Support mural TV orientable",
    brand: "OROTRONIX",
    category: "accessoires-tv",
    price: 450,
    image: tvImg,
    shortDescription: "32\" à 75\", inclinable et pivotant.",
    description:
      "Bras articulé en acier pour téléviseurs de 32 à 75 pouces. Kit de fixation complet inclus, installation possible sur demande.",
    highlights: ["32\" – 75\"", "Charge max 45 kg", "Inclinable / pivotant", "Kit de fixation inclus"],
    inStock: true,
    featured: true,
  },
  {
    slug: "cable-hdmi-2-1",
    name: "Câble HDMI 2.1 — 2 m",
    brand: "OROTRONIX",
    category: "accessoires-tv",
    price: 129,
    image: tvImg,
    shortDescription: "8K 60 Hz / 4K 120 Hz, connecteurs plaqués or.",
    description: "Bande passante 48 Gbps pour consoles et TV récentes. Gaine tressée et connecteurs plaqués or.",
    highlights: ["8K 60 Hz", "48 Gbps", "Gaine tressée", "2 mètres"],
    inStock: true,
  },
  {
    slug: "box-android-tv-4k",
    name: "Box Android TV 4K",
    brand: "OROTRONIX",
    category: "accessoires-tv",
    price: 690,
    oldPrice: 850,
    image: tvImg,
    shortDescription: "Transformez n'importe quel écran en Smart TV.",
    description:
      "Boîtier Android TV 4K HDR avec télécommande vocale. Applications de streaming, navigateur et Wi-Fi double bande.",
    highlights: ["4K HDR", "Wi-Fi double bande", "Télécommande vocale", "4 Go RAM / 32 Go"],
    inStock: true,
  },
  {
    slug: "pack-essentiel-smartphone",
    name: "Pack essentiel smartphone",
    brand: "OROTRONIX",
    category: "offres",
    price: 399,
    oldPrice: 560,
    image: offersImg,
    shortDescription: "Coque + verre trempé + chargeur 20 W.",
    description:
      "Le pack de démarrage idéal pour un nouveau téléphone : protection complète et charge rapide, à prix réduit.",
    highlights: ["Coque renforcée", "Verre trempé 9H", "Chargeur 20 W", "Économie de 160 MAD"],
    inStock: true,
    featured: true,
  },
  {
    slug: "pack-audio-nomade",
    name: "Pack audio nomade",
    brand: "OROTRONIX",
    category: "offres",
    price: 749,
    oldPrice: 980,
    image: offersImg,
    shortDescription: "Écouteurs ANC + batterie externe.",
    description: "Écouteurs à réduction de bruit et batterie externe 10 000 mAh réunis dans une offre unique.",
    highlights: ["Écouteurs ANC Pro", "Batterie 10 000 mAh", "Câble USB-C inclus", "Économie de 231 MAD"],
    inStock: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}


import { supabaseConfigured, supabaseRest } from "@/lib/supabase";

const categoryImageBySlug: Record<CategorySlug, string> = {
  smartphones: smartphonesImg,
  "accessoires-telephone": accessoriesImg,
  "accessoires-tv": tvImg,
  offres: offersImg,
};

export async function loadRemoteCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  if (!supabaseConfigured) return { products, categories };
  const [rows, cats] = await Promise.all([
    supabaseRest<Array<{
      slug:string; name:string; brand:string|null; price:number; old_price:number|null;
      image_url:string|null; short_description:string|null; description:string|null;
      highlights:string[]; in_stock:boolean; featured:boolean; visible:boolean; sort_order:number; sort_order:number;
      category?: { slug:string; name:string; description:string|null; image_url:string|null } | null;
    }>>("products", { query: "?select=slug,name,brand,price,old_price,image_url,short_description,description,highlights,in_stock,featured,visible,sort_order,category:categories(slug,name,description,image_url)&order=created_at.desc" }),
    supabaseRest<Array<{slug:string;name:string;description:string|null;image_url:string|null}>>("categories", { query: "?select=slug,name,description,image_url&order=sort_order.asc" }),
  ]);
  const remoteCategories: Category[] = cats.map(c => ({
    slug: c.slug as CategorySlug, name:c.name, description:c.description ?? "", image:c.image_url || categoryImageBySlug[c.slug as CategorySlug] || accessoriesImg
  }));
  const remoteProducts: Product[] = rows.map(p => ({
    slug:p.slug, name:p.name, brand:p.brand ?? "", category:(p.category?.slug || "offres") as CategorySlug,
    price:Number(p.price), oldPrice:p.old_price == null ? undefined : Number(p.old_price),
    image:p.image_url || categoryImageBySlug[(p.category?.slug || "offres") as CategorySlug] || accessoriesImg,
    shortDescription:p.short_description ?? "", description:p.description ?? "",
    highlights:Array.isArray(p.highlights) ? p.highlights : [], inStock:p.in_stock, featured:p.featured, visible:p.visible, sortOrder:p.sort_order
  }));
  return { products: remoteProducts, categories: remoteCategories };
}

export async function loadRemoteProduct(slug: string): Promise<Product | undefined> {
  if (!supabaseConfigured) return getProduct(slug);
  const rows = await supabaseRest<Array<{
    slug:string; name:string; brand:string|null; price:number; old_price:number|null; image_url:string|null;
    short_description:string|null; description:string|null; highlights:string[]; in_stock:boolean; featured:boolean; visible:boolean;
    category?: { slug:string } | null;
  }>>("products", { query: "?select=slug,name,brand,price,old_price,image_url,short_description,description,highlights,in_stock,featured,category:categories(slug)&slug=eq."+encodeURIComponent(slug)+"&limit=1" });
  const p=rows[0]; if(!p) return undefined;
  const cat=(p.category?.slug || "offres") as CategorySlug;
  return {slug:p.slug,name:p.name,brand:p.brand??"",category:cat,price:Number(p.price),oldPrice:p.old_price==null?undefined:Number(p.old_price),image:p.image_url||categoryImageBySlug[cat]||accessoriesImg,shortDescription:p.short_description??"",description:p.description??"",highlights:Array.isArray(p.highlights)?p.highlights:[],inStock:p.in_stock,featured:p.featured,visible:p.visible,sortOrder:p.sort_order};
}
