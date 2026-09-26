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
    "Trier": "ترتيب",
    "Filtres": "الفلاتر",
    "Prix maximum": "السعر الأقصى",
    "Recherche :": "البحث:",
    "Effacer la recherche": "مسح البحث",
    "produit": "منتج",
    "produits": "منتجات",
    "Aucun produit ne correspond à votre recherche.": "لا يوجد أي منتج يطابق بحثك.",
    "Essayez d'élargir le prix ou de changer de catégorie.": "حاول توسيع نطاق السعر أو تغيير الفئة.",
    "Prix": "السعر",
    "Description": "الوصف",
    "Ajouter au panier": "أضف إلى السلة",
    "Voir le produit": "عرض المنتج",
    "En stock": "متوفر",
    "Rupture de stock": "نفد المخزون",
    "Commander": "اطلب الآن",
    "Quantité": "الكمية",
    "Panier": "السلة",
    "Total": "المجموع",
    "Continuer": "متابعة",
    "Supprimer": "حذف",
    "Sous-total": "المجموع الفرعي",
    "Livraison": "التوصيل",
    "Gratuit": "مجاني",
    "Valider la commande": "تأكيد الطلب",
    "Informations de livraison": "معلومات التوصيل",
    "Nom": "الاسم",
    "Téléphone": "الهاتف",
    "Adresse": "العنوان",
    "Ville": "المدينة",
    "Maroc": "المغرب",
    "Retour": "رجوع",
    "Fermer": "إغلاق",
    "En savoir plus": "معرفة المزيد",
    "Accessoires téléphone": "إكسسوارات الهاتف",
    "Accessoires TV": "إكسسوارات التلفاز",
    "Mon panier": "سلتي",
    "Service de réparation": "خدمة الإصلاح",
    "Ramassage & livraison": "الاستلام والتوصيل",
    "Contact": "اتصل بنا",
    "Tous droits réservés.": "جميع الحقوق محفوظة.",
    "Trier": "ترتيب",
    "Filtres": "الفلاتر",
    "Prix maximum": "الحد الأقصى للسعر",
    "Référence": "المرجع",
    "Date": "التاريخ",
    "Offerte": "مجانية",
    "Commande confirmée": "تم تأكيد الطلب",
    "Merci ! Notre équipe vous appelle pour confirmer la livraison et le créneau de passage.": "شكراً لك! سيتصل بك فريقنا لتأكيد التوصيل وموعد التسليم.",
    "Continuer mes achats": "متابعة التسوق",
    "Contacter OROTRONIX": "الاتصال بـ OROTRONIX",
    "Imprimer / PDF": "طباعة / PDF",
    "Aucune commande récente trouvée sur cet appareil.": "لم يتم العثور على أي طلب حديث على هذا الجهاز.",
    "Profil": "الملف الشخصي",
    "Mes informations": "معلوماتي",
    "Modifier": "تعديل",
    "Téléphone": "الهاتف",
    "Ville": "المدينة",
    "Choisir une ville": "اختر مدينة",
    "Principale": "رئيسي",
    "Livraison": "التوصيل",
    "Ajouter": "إضافة",
    "Libellé": "التسمية",
    "Adresse complète": "العنوان الكامل",
    "Adresse principale": "العنوان الرئيسي",
    "Sécurité": "الأمان",
    "Gardez un mot de passe unique et difficile à deviner.": "استخدم كلمة مرور فريدة يصعب تخمينها.",
    "Nouveau mot de passe": "كلمة المرور الجديدة",
    "Confirmation": "التأكيد",
    "Modifier le mot de passe": "تغيير كلمة المرور",
    "Mises à jour de commande": "تحديثات الطلب",
    "Offres et promotions": "العروض والتخفيضات",
    "Alertes de sécurité": "تنبيهات الأمان",
    "Connexion sociale": "تسجيل الدخول الاجتماعي",
    "Ou continuer avec": "أو المتابعة باستخدام",
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
    "Trier": "Sort",
    "Filtres": "Filters",
    "Prix maximum": "Maximum price",
    "Recherche :": "Search:",
    "Effacer la recherche": "Clear search",
    "produit": "product",
    "produits": "products",
    "Aucun produit ne correspond à votre recherche.": "No product matches your search.",
    "Essayez d'élargir le prix ou de changer de catégorie.": "Try increasing the price range or changing the category.",
    "Prix": "Price",
    "Description": "Description",
    "Ajouter au panier": "Add to cart",
    "Voir le produit": "View product",
    "En stock": "In stock",
    "Rupture de stock": "Out of stock",
    "Commander": "Order now",
    "Quantité": "Quantity",
    "Panier": "Cart",
    "Total": "Total",
    "Continuer": "Continue",
    "Supprimer": "Remove",
    "Sous-total": "Subtotal",
    "Livraison": "Delivery",
    "Gratuit": "Free",
    "Valider la commande": "Place order",
    "Informations de livraison": "Delivery information",
    "Nom": "Name",
    "Téléphone": "Phone",
    "Adresse": "Address",
    "Ville": "City",
    "Maroc": "Morocco",
    "Retour": "Back",
    "Fermer": "Close",
    "En savoir plus": "Learn more",
    "Accessoires téléphone": "Phone accessories",
    "Accessoires TV": "TV accessories",
    "Mon panier": "My cart",
    "Service de réparation": "Repair service",
    "Ramassage & livraison": "Pickup & delivery",
    "Contact": "Contact",
    "Tous droits réservés.": "All rights reserved.",
    "Trier": "Sort",
    "Filtres": "Filters",
    "Prix maximum": "Maximum price",
    "Référence": "Reference",
    "Date": "Date",
    "Offerte": "Free",
    "Commande confirmée": "Order confirmed",
    "Merci ! Notre équipe vous appelle pour confirmer la livraison et le créneau de passage.": "Thank you! Our team will call you to confirm delivery and the delivery time.",
    "Continuer mes achats": "Continue shopping",
    "Contacter OROTRONIX": "Contact OROTRONIX",
    "Imprimer / PDF": "Print / PDF",
    "Aucune commande récente trouvée sur cet appareil.": "No recent order was found on this device.",
    "Profil": "Profile",
    "Mes informations": "My information",
    "Modifier": "Edit",
    "Téléphone": "Phone",
    "Ville": "City",
    "Choisir une ville": "Choose a city",
    "Principale": "Primary",
    "Livraison": "Delivery",
    "Ajouter": "Add",
    "Libellé": "Label",
    "Adresse complète": "Full address",
    "Adresse principale": "Primary address",
    "Sécurité": "Security",
    "Gardez un mot de passe unique et difficile à deviner.": "Use a unique password that is difficult to guess.",
    "Nouveau mot de passe": "New password",
    "Confirmation": "Confirmation",
    "Modifier le mot de passe": "Change password",
    "Mises à jour de commande": "Order updates",
    "Offres et promotions": "Offers and promotions",
    "Alertes de sécurité": "Security alerts",
    "Connexion sociale": "Social sign-in",
    "Ou continuer avec": "Or continue with",
  },
};

const STORAGE_KEY = "orotronix_language";

let currentLanguage: LanguageCode = "FR";
let observer: MutationObserver | null = null;
let translating = false;
const originalText = new WeakMap<Text, string>();
const autoTranslationCache = new Map<string, string>();
const autoTranslatedLanguage = new WeakMap<Text, LanguageCode>();
const AUTO_CACHE_KEY = "orotronix_auto_translation_cache";

function loadAutoTranslationCache() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(AUTO_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") {
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string") autoTranslationCache.set(key, value);
      }
    }
  } catch {}
}

function saveAutoTranslationCache() {
  if (typeof window === "undefined") return;
  try {
    const obj: Record<string, string> = {};
    for (const [key, value] of autoTranslationCache) obj[key] = value;
    localStorage.setItem(AUTO_CACHE_KEY, JSON.stringify(obj));
  } catch {}
}

function shouldAutoTranslate(value: string) {
  if (!value || value.length < 3 || value.length > 500) return false;
  if (value.startsWith("http://") || value.startsWith("https://") || value.includes("@")) return false;
  if (/^[\\d\\s.,:+%€$MAD/-]+$/.test(value)) return false;
  if (/^[A-Z0-9._-]{2,20}$/.test(value) && !/[a-z]/.test(value)) return false;
  return true;
}

async function autoTranslateText(value: string, language: LanguageCode) {
  if (language === "FR" || !shouldAutoTranslate(value)) return value;
  const key = language + "::" + normalizeKey(value);
  const cached = autoTranslationCache.get(key);
  if (cached) return cached;
  try {
    const params = new URLSearchParams({ q: value, langpair: "fr|" + (language === "AR" ? "ar" : "en") });
    const response = await fetch("https://api.mymemory.translated.net/get?" + params.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) return value;
    const data = await response.json() as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText?.trim();
    if (!translated || translated.toLowerCase() === value.toLowerCase()) return value;
    autoTranslationCache.set(key, translated);
    saveAutoTranslationCache();
    return translated;
  } catch {
    return value;
  }
}

async function autoTranslateUnknownText(root: Node, language: LanguageCode) {
  if (language === "FR") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  const pending = nodes.filter((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return false;
    const original = originalText.get(textNode) ?? textNode.nodeValue ?? "";
    return shouldAutoTranslate(original.trim()) && autoTranslatedLanguage.get(textNode) !== language && !translations[language][normalizeKey(original.trim())] && !dynamicTranslations[language].some(([pattern]) => pattern.test(normalizeKey(original.trim())));
  });
  for (const textNode of pending) {
    const original = originalText.get(textNode) ?? textNode.nodeValue ?? "";
    const translated = await autoTranslateText(original.trim(), language);
    if (translated !== original.trim() && textNode.isConnected) {
      const leading = original.match(/^\\s*/)?.[0] ?? "";
      const trailing = original.match(/\\s*$/)?.[0] ?? "";
      textNode.nodeValue = leading + translated + trailing;\n      autoTranslatedLanguage.set(textNode, language);
    }
  }
}


function normalizeKey(value: string) {
  return value
    .replace(/[’]/g, "'")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

const dynamicTranslations: Record<LanguageCode, Array<[RegExp, (match: RegExpMatchArray) => string]>> = {
  FR: [],
  AR: [
    [/^(\\d+) produits?$/i, (m) => `${m[1]} منتج${m[0].toLowerCase().includes("produits") ? "ات" : ""}`],
    [/^Recherche\s*:\s*«\s*(.*?)\s*»$/i, (m) => `البحث: « ${m[1]} »`],
    [/^Ajouter (.+) au panier$/i, (m) => `أضف ${m[1]} إلى السلة`],
    [/^Connectez-vous pour enregistrer vos favoris\.?$/i, () => "سجّل الدخول لحفظ منتجاتك المفضلة."],
    [/^Ajouté au panier$/i, () => "تمت الإضافة إلى السلة"],
    [/^Ajouté aux favoris$/i, () => "تمت الإضافة إلى المفضلة"],
    [/^Retiré des favoris$/i, () => "تمت الإزالة من المفضلة"],
    [/^Impossible de modifier le favori\.?$/i, () => "تعذر تعديل المفضلة."],
    [/^Veuillez patienter…$/i, () => "يرجى الانتظار…"],
    [/^Connexion à Google…$/i, () => "جارٍ تسجيل الدخول عبر Google…"],
    [/^Connexion à Facebook…$/i, () => "جارٍ تسجيل الدخول عبر Facebook…"],
    [/^Continuer avec Google$/i, () => "المتابعة باستخدام Google"],
    [/^Continuer avec Facebook$/i, () => "المتابعة باستخدام Facebook"],
    [/^Choisir une ville$/i, () => "اختر مدينة"],
    [/^Non renseigné(?:e)?$/i, () => "غير محدد"],
    [/^Modifier (.+)$/i, (m) => `تعديل ${m[1]}`],
    [/^Nouvelle adresse$/i, () => "عنوان جديد"],
    [/^Modifier l'adresse$/i, () => "تعديل العنوان"],
    [/^Définir comme principale$/i, () => "تعيين كعنوان رئيسي"],
    [/^Produits ajoutés au panier$/i, () => "تمت إضافة المنتجات إلى السلة"],
    [/^Impossible de recharger certains produits\.?$/i, () => "تعذر إعادة تحميل بعض المنتجات."],
  ],
  EN: [
    [/^(\\d+) produits?$/i, (m) => `${m[1]} product${m[0].toLowerCase().includes("produits") ? "s" : ""}`],
    [/^Recherche\s*:\s*«\s*(.*?)\s*»$/i, (m) => `Search: “${m[1]}”`],
    [/^Ajouter (.+) au panier$/i, (m) => `Add ${m[1]} to cart`],
    [/^Connectez-vous pour enregistrer vos favoris\.?$/i, () => "Sign in to save your favorites."],
    [/^Ajouté au panier$/i, () => "Added to cart"],
    [/^Ajouté aux favoris$/i, () => "Added to favorites"],
    [/^Retiré des favoris$/i, () => "Removed from favorites"],
    [/^Impossible de modifier le favori\.?$/i, () => "Unable to update favorite."],
    [/^Veuillez patienter…$/i, () => "Please wait…"],
    [/^Connexion à Google…$/i, () => "Signing in with Google…"],
    [/^Connexion à Facebook…$/i, () => "Signing in with Facebook…"],
    [/^Continuer avec Google$/i, () => "Continue with Google"],
    [/^Continuer avec Facebook$/i, () => "Continue with Facebook"],
    [/^Choisir une ville$/i, () => "Choose a city"],
    [/^Non renseigné(?:e)?$/i, () => "Not provided"],
    [/^Modifier (.+)$/i, (m) => `Edit ${m[1]}`],
    [/^Nouvelle adresse$/i, () => "New address"],
    [/^Modifier l'adresse$/i, () => "Edit address"],
    [/^Définir comme principale$/i, () => "Set as primary"],
    [/^Produits ajoutés au panier$/i, () => "Products added to cart"],
    [/^Impossible de recharger certains produits\.?$/i, () => "Unable to reload some products."],
  ],
};

function translateString(value: string, language: LanguageCode) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();
  if (language === "FR") return value;

  const normalized = normalizeKey(core);
  const direct = translations[language][core] ?? translations[language][normalized];
  if (direct) return leading + direct + trailing;

  for (const [pattern, translator] of dynamicTranslations[language]) {
    const match = normalized.match(pattern);
    if (match) return leading + translator(match) + trailing;
  }

  return value;
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
          translateElement(node, currentLanguage);\n          void autoTranslateUnknownText(node, currentLanguage);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
