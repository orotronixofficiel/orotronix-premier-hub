# OROTRONIX — mise en ligne Supabase + Cloudflare

## 1. Créer le projet Supabase
1. Créez un projet Supabase.
2. Dans **SQL Editor**, exécutez le fichier `supabase/schema.sql`.
3. Exécutez ensuite `supabase/seed.sql`.
4. Dans **Authentication > Users**, créez le compte administrateur avec email + mot de passe.
5. Copiez l'UUID de cet utilisateur et exécutez :
```sql
insert into public.admin_users (user_id)
values ('UUID_DU_COMPTE_ADMIN')
on conflict (user_id) do nothing;
```

## 2. Variables Cloudflare Pages
Dans **Settings > Environment variables**, ajoutez pour Production et Preview :
- `VITE_SUPABASE_URL` = URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY` = clé publishable/anon du projet

Ne mettez **jamais** la `service_role` key dans le frontend.

## 3. Tester
- Site public : `/`
- Boutique : `/boutique`
- Administration : `/admin`
- Les commandes et demandes de réparation sont enregistrées dans Supabase quand les variables sont configurées.
- Sans Supabase configuré, le site conserve le catalogue local comme fallback.

## 4. Gestion
Depuis `/admin`, le compte autorisé peut gérer :
- produits et prix
- catégories
- services de réparation
- commandes et statuts
- coordonnées et horaires de la boutique

Les produits/catégories/services ajoutés dans l'administration sont ensuite chargés par le site public.

## 5. Sécurité
La base utilise Row Level Security. Les opérations d'administration sont limitées aux utilisateurs présents dans `admin_users`. Les visiteurs peuvent lire le catalogue actif et créer une commande, mais ne peuvent pas modifier le catalogue.

## 6. Images
Pour l'instant, les produits acceptent une **Image URL** dans l'administration. Les images locales existantes restent utilisées comme fallback. Une intégration Storage peut être ajoutée ensuite si vous voulez téléverser directement les photos depuis le dashboard.
