# SoVibeS'tudio — Site web

Refonte moderne du site de **SoVibeS'tudio**, le studio de bien-être d'Anne-Sophie Maquinghem à Fouesnant (yoga danse, yog'hiit, soins énergétiques, coaching bien-être).

Site **statique** (HTML / CSS / JavaScript, sans dépendances ni build) — rapide, responsive, et déployable sur GitHub Pages.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil — hero, services, à propos, témoignages, derniers articles |
| `bien-etre.html` | Bien-être & coaching (sérénité, vitalité, alimentation) |
| `soins-energetiques.html` | Soins énergétiques (présentiel & à distance) |
| `cours-en-ligne.html` | Vidéothèque : cours gratuits + abonnement 10 €/mois |
| `blog.html` | Liste des articles, filtrable par catégorie |
| `article.html` | Lecture d'un article (`?slug=...`) |
| `admin/` | **Back-office en ligne** (Sveltia CMS) : écrire / publier de vrais articles |
| `brouillon.html` | Éditeur de brouillon local (hors-ligne, sans compte) |
| `contact.html` | Coordonnées + formulaire (ouvre le mail pré-rempli) |
| `mentions-legales.html` | Mentions légales & RGPD |

## Blog — architecture

Le blog est **piloté par les données** (aucun texte en dur dans le JavaScript) :

```
content/articles/*.md   →  (build)  →  data/articles.json  →  (fetch)  →  blog
   ▲ écrits par le CMS                  généré automatiquement            affiché
```

1. Chaque article est un fichier **Markdown** dans `content/articles/`, avec un
   en-tête (front-matter) : `title`, `date`, `category`, `author`, `cover`, `excerpt`.
2. Le script `scripts/build-articles.mjs` compile ces fichiers en
   `data/articles.json` (lancé automatiquement à chaque déploiement).
3. `assets/js/blog.js` charge ce JSON et affiche la liste, les articles et les
   « derniers articles » de l'accueil. Il gère aussi un rendu Markdown maison.

### Trois façons d'ajouter un article
- **En ligne (recommandé)** : via le back-office `admin/` → voir `CMS-SETUP.md`.
- **À la main** : créer un fichier `.md` dans `content/articles/` (copier un
  existant comme modèle) puis commit.
- **Brouillon rapide** : `brouillon.html` (localStorage, aperçu direct, export/import
  JSON) pour préparer un texte avant de le publier.

Après ajout, relancer le build localement si besoin :
```bash
node scripts/build-articles.mjs
```

## Mise en ligne & CMS

👉 Tout est expliqué pas à pas dans **`CMS-SETUP.md`** : publier gratuitement sur
GitHub Pages, brancher le domaine OVH, et activer le back-office du blog.

## Développement local

Aucune installation. Servir le dossier avec n'importe quel serveur statique, par ex. :

```bash
cd SoVibesStudio
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

> Ouvrir les fichiers via `file://` fonctionne aussi, mais un serveur local est recommandé.

## Déploiement

Le workflow `.github/workflows/deploy-sovibes.yml` publie automatiquement le dossier `SoVibesStudio/` sur **GitHub Pages** à chaque push sur la branche de la refonte (ou via *Run workflow*). Activer GitHub Pages sur « GitHub Actions » dans les réglages du dépôt.

## Personnalisation rapide

- **Couleurs & typographie** : variables CSS en haut de `assets/css/styles.css` (`:root`).
- **Menu / pied de page** : `assets/js/main.js`.
- **Coordonnées** : recherchées dans `main.js` (footer) et `contact.html`.
- **Images** : actuellement des photos Unsplash de démonstration — à remplacer par les vraies photos du studio.
