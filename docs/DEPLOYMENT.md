# Deploiement - Vercel + Render

Ce projet se deploie proprement en **3 services distincts** :

1. `apps/site` sur Vercel
2. `apps/app` sur Vercel
3. `backend` sur Render

## Architecture cible

- `site`
  - landing page marketing
  - deploiement Vercel separe
- `app`
  - application React/Vite principale
  - deploiement Vercel separe
- `backend`
  - API Node.js / Express
  - deploiement Render

## 1. Backend sur Render

Le projet contient deja [render.yaml](../render.yaml).

### Creation du service

1. Connecter le repo GitHub a Render
2. Choisir **Blueprint** ou **New Web Service**
3. Si tu utilises le `render.yaml`, Render pre-remplira :
   - `rootDir: backend`
   - `buildCommand: npm install && npm run build`
   - `startCommand: npm start`

### Variables Render a renseigner

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENWEATHER_API_KEY`
- `GEMINI_API_KEY`
- `CORS_ORIGIN`
- `CORS_ORIGINS`

### Recommandation CORS

Mettre :

- `CORS_ORIGIN=https://ton-app.vercel.app`
- `CORS_ORIGINS=https://ton-site.vercel.app,*.vercel.app`

Le backend accepte :

- les origines exactes
- les listes separees par virgules
- les suffixes de type `*.vercel.app`

## 2. Frontend app sur Vercel

Le projet contient deja [apps/app/vercel.json](../apps/app/vercel.json).

### Configuration Vercel

- Root Directory : `apps/app`
- Framework Preset : `Vite`
- Build Command : `npm run build`
- Output Directory : `dist`

### Variables d'environnement Vercel pour `app`

- `VITE_API_URL=https://ton-backend.onrender.com/api/v1`
- `VITE_SUPABASE_URL=https://ton-projet.supabase.co`
- `VITE_SUPABASE_ANON_KEY=...`
- `GEMINI_API_KEY=...`

### Important

Le fichier `vercel.json` ajoute une re-ecriture SPA pour que les routes React comme :

- `/login`
- `/register`
- `/auth/callback`
- `/admin/dashboard`

fonctionnent directement en production.

## 3. Frontend site sur Vercel

Le projet contient deja [apps/site/vercel.json](../apps/site/vercel.json).

### Configuration Vercel

- Root Directory : `apps/site`
- Framework Preset : `Vite`
- Build Command : `npm run build`
- Output Directory : `dist`

### Variables d'environnement Vercel pour `site`

Le site n'a pas besoin de variables obligatoires pour fonctionner, sauf si tu ajoutes plus tard des integrations marketing.

## 4. Google Auth en production

Pour que Google Auth fonctionne sur Vercel + Render :

### Dans Supabase

Ajouter dans **Auth > URL Configuration** :

- `https://ton-app.vercel.app`
- `https://ton-app.vercel.app/auth/callback`
- tes URLs de preview si tu veux les autoriser

### Dans Google Cloud Console

Ajouter les URLs autorisees par Supabase pour OAuth.

### Point critique

Le frontend `app` utilise cette route de callback :

- `/auth/callback`

Il faut donc que cette URL soit autorisee cote Supabase/Google.

## 5. Ordre de mise en ligne conseille

1. Deployer le backend sur Render
2. Recuperer l'URL publique Render
3. Configurer `VITE_API_URL` dans Vercel pour `app`
4. Deployer `app` sur Vercel
5. Deployer `site` sur Vercel
6. Ajouter les domaines Vercel dans `CORS_ORIGIN` et `CORS_ORIGINS` sur Render
7. Configurer les URLs OAuth dans Supabase

## 6. URLs finales recommandees

Exemple :

- `site`: `https://agrimeteo-site.vercel.app`
- `app`: `https://agrimeteo-app.vercel.app`
- `backend`: `https://agrimeteo-backend.onrender.com`

## 7. Verification apres deploiement

Verifier ces points :

- le site charge sans erreur
- l'app charge sans erreur
- `/login` fonctionne en acces direct
- `/register` fonctionne en acces direct
- `/auth/callback` ne retourne pas 404
- l'API Render repond sur `/api/v1/...`
- Google sign-in redirige puis revient bien sur l'app
- le backend accepte bien les appels depuis les domaines Vercel
