export type LanguageCode = "AR" | "FR" | "EN";

type TranslationMap = Record<string, string>;

const translations: Record<LanguageCode, TranslationMap> = {
  FR: {},
  AR: {
    "Boutique": "المتجر",
    "Smartphones": "الهواتف الذكية",
    "Accessoires": "الإكسسوارات",
    "TV": "التلفاز",
    "Réparation": "الإصلاح",
    "Offres": "العروض",
    "Mon compte": "حسابي",
    "Se connecter / Créer un compte": "تسجيل الدخول / إنشاء حساب",
    "Rechercher un produit…": "البحث عن منتج…",
    "Rechercher…": "بحث…",
    "Rechercher un produit, une marque…": "البحث عن منتج أو علامة تجارية…",
    "Demander une réparation": "طلب إصلاح",
    "Changer de langue": "تغيير اللغة",
    "Livraison partout au Maroc • Paiement à la livraison • Ramassage et retour à domicile pour vos réparations": "التوصيل في جميع أنحاء المغرب • الدفع عند الاستلام • استلام وإرجاع أجهزة الإصلاح من المنزل",
    "Technologie premium • Maroc": "تقنية فاخرة • المغرب",
    "L'excellence mobile,": "التميز في عالم الهواتف،",
    "du choix à la réparation.": "من الاختيار إلى الإصلاح.",
    "Smartphones, accessoires téléphone et TV sélectionnés avec soin, et un atelier de réparation professionnel avec ramassage et livraison à domicile.": "هواتف ذكية وإكسسوارات للهواتف والتلفاز مختارة بعناية، وورشة إصلاح احترافية مع الاستلام والتوصيل من وإلى المنزل.",
    "Découvrir la boutique": "اكتشف المتجر",
    "Réparer mon téléphone": "إصلاح هاتفي",
    "Garantie": "الضمان",
    "Réparation moyenne": "متوسط مدة الإصلاح",
    "Livraison nationale": "التوصيل الوطني",
    "Paiement": "الدفع",
    "À la livraison": "عند الاستلام",
    "Livraison Maroc": "التوصيل في المغرب",
    "Expédition rapide dans tout le royaume.": "شحن سريع في جميع أنحاء المملكة.",
    "Paiement à la livraison": "الدفع عند الاستلام",
    "Vous payez en recevant votre commande.": "تدفع عند استلام طلبك.",
    "Produits garantis": "منتجات مضمونة",
    "Appareils vérifiés, garantie incluse.": "أجهزة مفحوصة مع ضمان.",
    "Atelier certifié": "ورشة احترافية",
    "Techniciens expérimentés, pièces de qualité.": "تقنيون ذوو خبرة وقطع غيار عالية الجودة.",
    "Sélection": "اختيارنا",
    "Produits en vedette": "منتجات مميزة",
    "Les appareils et accessoires les plus demandés de notre catalogue.": "أكثر الأجهزة والإكسسوارات طلباً في كتالوجنا.",
    "Tout voir": "عرض الكل",
    "Catalogue": "الكتالوج",
    "Nos catégories": "فئاتنا",
    "Explorer": "استكشف",
    "Service réparation": "خدمة الإصلاح",
    "Votre téléphone réparé par des professionnels": "إصلاح هاتفك على يد محترفين",
    "Voir les tarifs": "عرض الأسعار",
    "Sans vous déplacer": "بدون تنقل",
    "Ramassage et livraison de votre réparation": "استلام وتوصيل جهازك للإصلاح",
    "Vous décrivez la panne": "صف العطل",
    "Nous récupérons l'appareil": "نستلم الجهاز",
    "Retour réparé": "إرجاع الجهاز بعد الإصلاح",
    "Bons plans": "عروض مميزة",
    "Offres spéciales": "عروض خاصة",
    "Toutes les offres": "جميع العروض",
    "Besoin d'un conseil avant d'acheter ?": "هل تحتاج إلى نصيحة قبل الشراء؟",
    "Commander maintenant": "اطلب الآن",
    "Nous appeler": "اتصل بنا",
    "Accueil": "الرئيسية",
    "Tous": "الكل",
    "Prix croissant": "السعر تصاعدياً",
    "Prix décroissant": "السعر تنازلياً",
    "Pertinence": "الأكثر صلة",
    "Promotions": "التخفيضات",
    "Filtrer": "تصفية",
    "Réinitialiser": "إعادة ضبط",
    "Page introuvable": "الصفحة غير موجودة",
    "Retour à l'accueil": "العودة إلى الرئيسية",
    "Cette page ne s'est pas chargée": "تعذر تحميل هذه الصفحة",
    "Réessayer": "إعادة المحاولة",
    "Connexion": "تسجيل الدخول",
    "Inscription": "إنشاء حساب",
    "Mot de passe": "كلمة المرور",
    "E-mail": "البريد الإلكتروني",
    "Nom complet": "الاسم الكامل",
    "Enregistrer": "حفظ",
    "Annuler": "إلغاء",
    "Mes commandes": "طلباتي",
    "Mes adresses": "عناويني",
    "Mes favoris": "المفضلة",
    "Sécurité": "الأمان",
    "Notifications": "الإشعارات",
    "Aucune commande pour le moment.": "لا توجد طلبات حالياً.",
    "Aucune adresse enregistrée.": "لا توجد عناوين مسجلة.",
    "Aucun favori pour le moment.": "لا توجد منتجات مفضلة حالياً.",
  },
  EN: {
    "Boutique": "Shop",
    "Smartphones": "Smartphones",
    "Accessoires": "Accessories",
    "TV": "TV",
    "Réparation": "Repair",
    "Offres": "Offers",
    "Mon compte": "My account",
    "Se connecter / Créer un compte": "Sign in / Create an account",
    "Rechercher un produit…": "Search for a product…",
    "Rechercher…": "Search…",
    "Rechercher un produit, une marque…": "Search for a product or brand…",
    "Demander une réparation": "Request a repair",
    "Changer de langue": "Change language",
    "Livraison partout au Maroc • Paiement à la livraison • Ramassage et retour à domicile pour vos réparations": "Delivery across Morocco • Cash on delivery • Home pickup and return for repairs",
    "Technologie premium • Maroc": "Premium technology • Morocco",
    "L'excellence mobile,": "Mobile excellence,",
    "du choix à la réparation.": "from selection to repair.",
    "Smartphones, accessoires téléphone et TV sélectionnés avec soin, et un atelier de réparation professionnel avec ramassage et livraison à domicile.": "Carefully selected smartphones, phone and TV accessories, with a professional repair workshop and home pickup and delivery.",
    "Découvrir la boutique": "Discover the shop",
    "Réparer mon téléphone": "Repair my phone",
    "Garantie": "Warranty",
    "Réparation moyenne": "Average repair time",
    "Livraison nationale": "Nationwide delivery",
    "Paiement": "Payment",
    "À la livraison": "Cash on delivery",
    "Livraison Maroc": "Morocco delivery",
    "Expédition rapide dans tout le royaume.": "Fast shipping across the kingdom.",
    "Paiement à la livraison": "Cash on delivery",
    "Vous payez en recevant votre commande.": "Pay when you receive your order.",
    "Produits garantis": "Warranty included",
    "Appareils vérifiés, garantie incluse.": "Verified devices with warranty included.",
    "Atelier certifié": "Professional workshop",
    "Techniciens expérimentés, pièces de qualité.": "Experienced technicians and quality parts.",
    "Sélection": "Selection",
    "Produits en vedette": "Featured products",
    "Les appareils et accessoires les plus demandés de notre catalogue.": "Our most requested devices and accessories.",
    "Tout voir": "View all",
    "Catalogue": "Catalog",
    "Nos catégories": "Our categories",
    "Explorer": "Explore",
    "Service réparation": "Repair service",
    "Votre téléphone réparé par des professionnels": "Your phone repaired by professionals",
    "Voir les tarifs": "View prices",
    "Sans vous déplacer": "Without leaving home",
    "Ramassage et livraison de votre réparation": "Pickup and delivery for your repair",
    "Vous décrivez la panne": "Describe the issue",
    "Nous récupérons l'appareil": "We collect the device",
    "Retour réparé": "Repaired and returned",
    "Bons plans": "Great deals",
    "Offres spéciales": "Special offers",
    "Toutes les offres": "All offers",
    "Besoin d'un conseil avant d'acheter ?": "Need advice before buying?",
    "Commander maintenant": "Order now",
    "Nous appeler": "Call us",
    "Accueil": "Home",
    "Tous": "All",
    "Prix croissant": "Price: low to high",
    "Prix décroissant": "Price: high to low",
    "Pertinence": "Relevance",
    "Promotions": "Promotions",
    "Filtrer": "Filter",
    "Réinitialiser": "Reset",
    "Page introuvable": "Page not found",
    "Retour à l'accueil": "Back to home",
    "Cette page ne s'est pas chargée": "This page could not be loaded",
    "Réessayer": "Try again",
    "Connexion": "Sign in",
    "Inscription": "Sign up",
    "Mot de passe": "Password",
    "E-mail": "Email",
    "Nom complet": "Full name",
    "Enregistrer": "Save",
    "Annuler": "Cancel",
    "Mes commandes": "My orders",
    "Mes adresses": "My addresses",
    "Mes favoris": "My favorites",
    "Sécurité": "Security",
    "Notifications": "Notifications",
    "Aucune commande pour le moment.": "No orders yet.",
    "Aucune adresse enregistrée.": "No saved addresses.",
    "Aucun favori pour le moment.": "No favorites yet.",
  },
};

const STORAGE_KEY = "orotronix_language";

let currentLanguage: LanguageCode = "FR";
let observer: MutationObserver | null = null;
let translating = false;
const originalText = new WeakMap<Text, string>();

function translateString(value: string, language: LanguageCode) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();
  const translated = language === "FR" ? core : (translations[language][core] ?? core);
  return leading + translated + trailing;
}

function translateElement(root: Node, language: LanguageCode) {
  if (translating) return;
  translating = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);
    for (const textNode of nodes) {
      const parent = textNode.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
      if (!textNode.nodeValue?.trim()) continue;
      const original = originalText.get(textNode) ?? textNode.nodeValue ?? "";
      if (!originalText.has(textNode)) originalText.set(textNode, original);
      textNode.nodeValue = translateString(original, language);
    }

    const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))] : Array.from(document.querySelectorAll<HTMLElement>("*"));
    for (const element of elements) {
      for (const attr of ["placeholder", "title", "aria-label"]) {
        const value = element.getAttribute(attr);
        if (!value) continue;
        const originalAttr = "data-orotronix-" + attr;
        const original = element.getAttribute(originalAttr) ?? value;
        if (!element.getAttribute(originalAttr)) element.setAttribute(originalAttr, original);
        element.setAttribute(attr, translateString(original, language));
      }
    }
  } finally {
    translating = false;
  }
}

export function setLanguage(language: LanguageCode) {
  currentLanguage = language;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "AR" ? "ar" : language === "EN" ? "en" : "fr";
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
    document.body.dataset.language = language.toLowerCase();
    translateElement(document.body, language);
  }
}

export function getLanguage(): LanguageCode {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "AR" || saved === "EN" || saved === "FR") currentLanguage = saved;
  }
  return currentLanguage;
}

export function initLanguage() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY);
  currentLanguage = saved === "AR" || saved === "EN" || saved === "FR" ? saved : "FR";
  setLanguage(currentLanguage);
  observer?.disconnect();
  observer = new MutationObserver((mutations) => {
    if (currentLanguage === "FR" || translating) return;
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          translateElement(node, currentLanguage);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
