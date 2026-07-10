# Mettre le site en ligne + activer le blog en ligne

Ce guide explique, pas à pas, comment **publier le site gratuitement** sur GitHub
Pages et **activer le back-office du blog** (Sveltia CMS) pour écrire des articles
directement en ligne, depuis un ordinateur ou un téléphone.

Aucune compétence technique requise : il suffit de suivre les étapes.

---

## Partie 1 — Publier le site (gratuit) sur GitHub Pages

1. Sur GitHub, ouvrir le dépôt **`Toucharli3/Appli`**.
2. **Settings** (Réglages) → menu de gauche **Pages**.
3. Section *Build and deployment* → **Source** : choisir **GitHub Actions**.
4. C'est tout. À chaque modification, le site se reconstruit et se met en ligne
   automatiquement (le workflow `deploy-sovibes.yml` s'en charge).

L'adresse du site sera du type `https://toucharli3.github.io/Appli/`.

### Utiliser le domaine OVH (sovibesstudio.fr / .com)
Pour garder le vrai nom de domaine tout en profitant de l'hébergement gratuit :

1. Dans **Settings → Pages → Custom domain**, saisir `www.sovibesstudio.fr`
   (ou `.com`) puis **Save**.
2. Chez **OVH** (zone DNS du domaine), ajouter :
   - un enregistrement **CNAME** `www` → `toucharli3.github.io.`
   - pour le domaine « nu » (sans www), 4 enregistrements **A** vers les IP de
     GitHub Pages : `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
3. Attendre quelques minutes à quelques heures (propagation DNS), puis cocher
   **Enforce HTTPS** dans GitHub.
4. On peut alors **résilier la partie hébergement OVH** (garder seulement le
   domaine). ⚠️ Si des adresses **email** `@sovibesstudio.fr` sont utilisées,
   souscrire au préalable une offre email seule chez OVH (ne pas couper l'email).

---

## Partie 2 — Activer le back-office du blog (écrire en ligne)

Le CMS a besoin d'un tout petit service pour se connecter à GitHub en sécurité
(l'authentification). Il est **gratuit** et se met en place une seule fois.

### Étape A — Créer une « OAuth App » GitHub
1. GitHub → votre photo (en haut à droite) → **Settings** → tout en bas
   **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Remplir :
   - *Application name* : `SoVibeS'tudio CMS`
   - *Homepage URL* : l'adresse du site (ex. `https://www.sovibesstudio.fr`)
   - *Authorization callback URL* : `https://sovibes-auth.VOTRE-COMPTE.workers.dev/callback`
     (on ajuste après l'étape B ; mettre une valeur provisoire pour l'instant)
3. **Register application**. Noter le **Client ID** et générer un **Client Secret**.

### Étape B — Déployer le mini-service d'authentification (Cloudflare, gratuit)
Le plus simple est d'utiliser le service prêt à l'emploi **`sveltia-cms-auth`** :

1. Créer un compte gratuit sur **Cloudflare**.
2. Suivre le dépôt officiel <https://github.com/sveltia/sveltia-cms-auth>
   (bouton *Deploy to Cloudflare Workers*).
3. Dans les variables du worker, renseigner :
   - `GITHUB_CLIENT_ID` = le Client ID de l'étape A
   - `GITHUB_CLIENT_SECRET` = le Client Secret de l'étape A
   - `ALLOWED_DOMAINS` = `toucharli3.github.io,www.sovibesstudio.fr,www.sovibesstudio.com`
4. Le worker vous donne une adresse, ex. `https://sovibes-auth.xxxx.workers.dev`.
5. Revenir à l'**OAuth App** (étape A) et mettre le *callback URL* exact :
   `https://sovibes-auth.xxxx.workers.dev/callback`.

### Étape C — Brancher le CMS
Dans **`SoVibesStudio/admin/config.yml`**, remplacer la ligne :
```yaml
  base_url: https://REMPLACER-PAR-VOTRE-WORKER.workers.dev
```
par l'adresse de votre worker :
```yaml
  base_url: https://sovibes-auth.xxxx.workers.dev
```
Enregistrer (commit). Une fois le site fusionné dans `main`, penser aussi à
remplacer, dans ce même fichier, `branch: claude/…` par `branch: main`.

---

## Utiliser le blog au quotidien
1. Aller sur **`.../admin/`** (ex. `https://www.sovibesstudio.fr/admin/`).
2. **Se connecter avec GitHub** (le compte autorisé).
3. **Articles du blog → New Article** : titre, catégorie, image, contenu.
4. **Publish**. En 1 à 2 minutes, l'article est en ligne sur le blog. 🎉

> En coulisses : l'article est enregistré comme fichier Markdown dans
> `content/articles/`, le site se reconstruit (`data/articles.json`) et se
> redéploie automatiquement.

Pas envie de configurer le CMS tout de suite ? On peut aussi ajouter des articles
« à la main » : voir `README.md` (dossier `content/articles/`).
