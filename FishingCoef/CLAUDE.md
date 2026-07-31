# Coef de pêche — Fouesnant · Les Glénan

Page web unique qui répond à deux questions : **si je pars maintenant, où —
sinon, quand.** Centrée sur le Finistère sud, de l'embouchure de l'Odet à
l'Aven et jusqu'au sud de l'archipel des Glénan.

En ligne : <https://toucharli3.github.io/Appli/>

## Structure

```
FishingCoef/
├── web/
│   ├── glenan.html     Toute l'application : style, balisage et calcul
│   ├── sw.js           Service worker — ouverture hors ligne
│   └── icon-*.png      Icônes d'écran d'accueil
└── tools/
    ├── seabed.py       Réponse Overpass → objets de carte marine
    ├── bathy.py        Grille EMODnet → secs et tombants
    └── test_*.py       Tests de ces deux outils
```

Il n'y a **pas d'étape de compilation ni de dépendance à installer**.
`.github/workflows/deploy-web.yml` assemble `glenan.html` dans un squelette
HTML, y injecte les données du fond, et publie sur GitHub Pages.

Une ancienne version React Native / Expo a existé dans ce dossier ; elle a été
supprimée, la page web l'ayant remplacée en tous points.

## Le calcul

Tout tourne sur l'appareil. La page fonctionne sans réseau.

### Astronomie

Algorithmes de Jean Meeus, *Astronomical Algorithms* (2ᵉ éd.). Position et
phase de la Lune, lever/coucher/transit, éphémérides solaires. Vérifié : midi
solaire recoupé avec un calcul manuel, période synodique à 29,5 j, retard
lunaire de 50 min par jour.

### Coefficient de marée

Reconstruit par sa définition réelle : rapport entre l'amplitude du jour et la
vive-eau moyenne d'équinoxe à Brest, à partir des composantes M2, S2 et N2.
Sur 2026 : 22 à 119, moyenne 74, contre 20–120 et ~70 au SHOM.

> Le coefficient officiel peut être saisi à la main dans la page ; il prime
> alors sur cette reconstruction. L'API du SHOM est payante.

### Note sur 100

| Terme | Poids | |
|---|---|---|
| Solunaire | 50 | Proximité aux passages de la Lune au méridien, modulée par la phase |
| Lune | 20 | Pic aux syzygies |
| Marée | 20 | Amplitude du jour × force du courant à l'heure considérée |
| Lumière | 10 | Aube et crépuscule |

Deux corrections multiplicatives s'appliquent ensuite, hors barème pour ne pas
dérégler l'étalonnage : **l'état de la mer** (elle ne peut que retrancher) et
**la tendance barométrique** (×0,88 à ×1,10).

Étalonnage : sur une année, 26 % Excellent, 32 % Très bon, 24 % Bon, 15 %
Moyen, 4 % Faible. **Toute modification du modèle doit être suivie d'une
vérification de cette distribution** — `test_page.js` s'en charge.

> Les pondérations sont un jugement, jamais confronté à des prises réelles. La
> théorie solunaire relève davantage de la tradition halieutique que de la
> science établie.

## Les données

| Source | Usage | Quand |
|---|---|---|
| Open-Meteo | Vent, rafales, houle, période, température, pression, niveau de la mer | À l'ouverture, gardé 48 h sur l'appareil |
| OpenStreetMap (Overpass) | Épaves, roches, hauts-fonds, récifs | Au déploiement |
| EMODnet Bathymetry | Grille de profondeurs → secs et tombants | Au déploiement |
| OpenStreetMap / OpenSeaMap | Tuiles de carte et surcouche marine | À l'affichage |

Les relevés se font **au déploiement** parce que le runner GitHub a un accès
réseau que l'environnement de développement n'a pas. Leur échec ne casse pas
le site : la page fonctionne sans.

## Postes et repères

- **Postes retenus à la main** : lieux réels, positionnés approximativement,
  avec orientation, abri, marée favorable et nature du fond attribués au
  jugé. Ceux marqués `check` restent à confirmer.
- **Repères théoriques** : objets de carte marine et reliefs détectés. Jamais
  éprouvés. Ils n'entrent ni dans le programme ni dans le classement des
  postes. Un repère recoupé par deux sources indépendantes est signalé.
- **Postes personnels** : ajoutés depuis la page, conservés sur l'appareil.

## Tests

```bash
python3 FishingCoef/tools/test_bathy.py     # détection des secs
python3 FishingCoef/tools/test_seabed.py    # traitement Overpass
node    FishingCoef/web/test_page.js        # page (nécessite playwright)
```

Ils tournent aussi à chaque poussée via `.github/workflows/tests.yml`.

## Ce qui manque

- [ ] Journal de sorties, pour confronter le modèle aux prises réelles
- [ ] Positions relevées au traceur pour les postes marqués « à confirmer »
- [ ] Pouvoir corriger les postes fournis, et pas seulement en ajouter
