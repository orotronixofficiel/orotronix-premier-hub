-- OROTRONIX initial catalog seed. Safe to run more than once.
insert into public.categories (slug,name,description,sort_order)
values
('smartphones','Smartphones','Flagships et modèles essentiels, garantis et prêts à l''emploi.',1),
('accessoires-telephone','Accessoires téléphone','Chargeurs, protections, audio et énergie portable.',2),
('accessoires-tv','Accessoires TV','Supports muraux, câbles HDMI, boîtiers et télécommandes.',3),
('offres','Offres','Sélection à prix réduit, pendant que le stock dure.',4)
on conflict (slug) do update set name=excluded.name, description=excluded.description, sort_order=excluded.sort_order;

insert into public.products (slug,name,brand,category_id,price,old_price,short_description,description,highlights,in_stock,featured)
select v.slug,v.name,v.brand,c.id,v.price,v.old_price,v.short_description,v.description,v.highlights::jsonb,v.in_stock,v.featured
from (values
('orotronix-flagship-pro-256','Flagship Pro 5G 256 Go','Apple','smartphones',11900::numeric,null::numeric,'Écran OLED 6,7", triple caméra, 256 Go.','Le smartphone haut de gamme de notre sélection : écran OLED 120 Hz, châssis titane et système photo professionnel. Livré scellé avec garantie OROTRONIX de 12 mois.','["Écran OLED 6,7\" 120 Hz","Triple caméra 48 MP","Batterie longue durée","Garantie 12 mois"]',true,true),
('galaxy-s-ultra-512','Galaxy S Ultra 512 Go','Samsung','smartphones',13500,14800,'Photo 200 MP, stylet intégré, 512 Go.','Puissance maximale pour la photo et la productivité : capteur 200 MP, zoom optique et autonomie confortable. Appareil neuf, facture et garantie incluses.','["Capteur 200 MP","Zoom optique x5","512 Go de stockage","Charge rapide 45 W"]',true,true),
('pixel-8-128','Pixel 8 128 Go','Google','smartphones',6900,null,'Photographie computationnelle, Android pur.','L’expérience Android la plus fluide avec un traitement photo remarquable et des mises à jour garanties pendant plusieurs années.','["Android pur","Photo IA","Écran 6,2\"","Garantie 12 mois"]',true,false),
('redmi-note-pro-256','Redmi Note Pro 256 Go','Xiaomi','smartphones',2790,3190,'Le meilleur rapport qualité/prix du marché.','Grande autonomie, écran AMOLED et charge rapide : le choix malin pour un usage quotidien sans compromis.','["AMOLED 120 Hz","Batterie 5000 mAh","Charge 67 W","Double SIM"]',true,true),
('chargeur-gan-65w','Chargeur GaN 65 W','OROTRONIX','accessoires-telephone',349,null,'Chargeur compact 3 ports, USB-C Power Delivery.','Chargez téléphone, tablette et ordinateur portable avec un seul bloc. Technologie GaN pour un format compact et une chauffe maîtrisée.','["65 W Power Delivery","3 ports (2 USB-C + USB-A)","Protection surtension","Garantie 6 mois"]',true,true),
('ecouteurs-anc-pro','Écouteurs sans fil ANC Pro','OROTRONIX','accessoires-telephone',590,790,'Réduction de bruit active, 30 h d’autonomie.','Son riche, réduction de bruit active et appels clairs grâce au double micro. Boîtier de charge USB-C.','["Réduction de bruit active","30 h avec le boîtier","Bluetooth 5.3","Résistant à la transpiration"]',true,false),
('powerbank-10000','Batterie externe 10 000 mAh','OROTRONIX','accessoires-telephone',249,null,'Charge rapide 22,5 W, format poche.','Une recharge complète pour la majorité des smartphones, avec affichage du niveau de batterie.','["22,5 W","USB-C + USB-A","Format poche","Indicateur LED"]',true,false),
('verre-trempe-premium','Verre trempé premium','OROTRONIX','accessoires-telephone',89,null,'Protection 9H, pose offerte en boutique.','Verre trempé 9H anti-rayures avec kit de pose. Installation gratuite dans notre atelier.','["Dureté 9H","Oléophobe","Pose offerte","Compatible coques"]',true,false),
('support-mural-tv','Support mural TV orientable','OROTRONIX','accessoires-tv',450,null,'32" à 75", inclinable et pivotant.','Bras articulé en acier pour téléviseurs de 32 à 75 pouces. Kit de fixation complet inclus, installation possible sur demande.','["32\" – 75\"","Charge max 45 kg","Inclinable / pivotant","Kit de fixation inclus"]',true,true),
('cable-hdmi-2-1','Câble HDMI 2.1 — 2 m','OROTRONIX','accessoires-tv',129,null,'8K 60 Hz / 4K 120 Hz, connecteurs plaqués or.','Bande passante 48 Gbps pour consoles et TV récentes. Gaine tressée et connecteurs plaqués or.','["8K 60 Hz","48 Gbps","Gaine tressée","2 mètres"]',true,false),
('box-android-tv-4k','Box Android TV 4K','OROTRONIX','accessoires-tv',690,850,'Transformez n’importe quel écran en Smart TV.','Boîtier Android TV 4K HDR avec télécommande vocale. Applications de streaming, navigateur et Wi-Fi double bande.','["4K HDR","Wi-Fi double bande","Télécommande vocale","4 Go RAM / 32 Go"]',true,false),
('pack-essentiel-smartphone','Pack essentiel smartphone','OROTRONIX','offres',399,560,'Coque + verre trempé + chargeur 20 W.','Le pack de démarrage idéal pour un nouveau téléphone : protection complète et charge rapide, à prix réduit.','["Coque renforcée","Verre trempé 9H","Chargeur 20 W","Économie de 160 MAD"]',true,true),
('pack-audio-nomade','Pack audio nomade','OROTRONIX','offres',749,980,'Écouteurs ANC + batterie externe.','Écouteurs à réduction de bruit et batterie externe 10 000 mAh réunis dans une offre unique.','["Écouteurs ANC Pro","Batterie 10 000 mAh","Câble USB-C inclus","Économie de 231 MAD"]',true,false)
) as v(slug,name,brand,cat,price,old_price,short_description,description,highlights,in_stock,featured)
join public.categories c on c.slug=v.cat
on conflict (slug) do update set name=excluded.name,brand=excluded.brand,category_id=excluded.category_id,price=excluded.price,old_price=excluded.old_price,short_description=excluded.short_description,description=excluded.description,highlights=excluded.highlights,in_stock=excluded.in_stock,featured=excluded.featured,updated_at=now();

insert into public.repair_services (slug,name,description,price_from,duration,sort_order)
values
('ecran','Remplacement d’écran','Écran cassé, tactile inactif, taches ou lignes à l’affichage.',250,'45 min – 2 h',1),
('batterie','Remplacement de batterie','Autonomie faible, extinctions soudaines, gonflement.',180,'30 min',2),
('port-de-charge','Réparation du port de charge','Charge instable, câble qui ne tient plus, connecteur encrassé.',150,'45 min',3),
('camera','Réparation de caméra','Photos floues, capteur noir, autofocus bloqué.',200,'1 h',4),
('audio','Haut-parleur / microphone','Son faible, grésillements, interlocuteur qui ne vous entend pas.',160,'1 h',5),
('logiciel','Problèmes logiciels','Blocage au démarrage, mise à jour échouée, ralentissements.',120,'1 – 3 h',6),
('oxydation','Dégâts des eaux','Nettoyage, désoxydation et diagnostic complet de la carte.',300,'24 – 48 h',7),
('autre','Autre problème','Panne non listée : diagnostic gratuit par nos techniciens.',0,'Sur diagnostic',8)
on conflict (slug) do update set name=excluded.name,description=excluded.description,price_from=excluded.price_from,duration=excluded.duration,sort_order=excluded.sort_order,active=true;
