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
| `admin.html` | **Espace de rédaction** : écrire / publier / éditer des articles |
| `contact.html` | Coordonnées + formulaire (ouvre le mail pré-rempli) |
| `mentions-legales.html` | Mentions légales & RGPD |

## Blog & espace de rédaction

Le blog est la nouveauté principale. Deux sources d'articles se combinent :

1. **Articles « seed »** intégrés au code, dans `assets/js/blog.js` (visibles par tout le monde, en permanence).
2. **Articles rédigés en ligne** via `admin.html`, enregistrés dans le `localStorage` du navigateur.

### Écrire un article
1. Ouvrir `admin.html` (lien « Espace rédaction » en pied de page / bouton sur le blog).
2. Rédiger en **Markdown** (`## titre`, `**gras**`, `*italique*`, `- liste`, `> citation`, `[lien](url)`, `![alt](img)`), avec **aperçu en direct**.
3. Cliquer sur **Publier** → l'article apparaît aussitôt sur le blog.
4. Modifier / supprimer ses articles depuis la liste en bas de page.

### Rendre un article permanent pour tous les visiteurs
Le `localStorage` est propre à chaque navigateur. Pour publier « pour de vrai » :
1. Dans `admin.html`, cliquer **⬇ Exporter (.json)**.
2. Copier les objets du fichier téléchargé dans le tableau `SEED` de `assets/js/blog.js`.
3. Commiter & pousser. (Ou réimporter le `.json` sur un autre poste via **⬆ Importer**.)

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
