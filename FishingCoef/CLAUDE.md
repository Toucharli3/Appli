# FishingCoef — Clone de Fishing Point

Application mobile React Native / Expo centrée sur le **coefficient de pêche** (théorie solunar + coefficient de marée français).

## Stack technique

- **Framework** : Expo SDK 56 + React Native 0.85
- **Language** : TypeScript
- **Navigation** : State-based (tabs sans dépendance externe)
- **Calculs** : Moteur astronomique local (zéro API, zéro connexion requise)

## Lancement

```bash
cd FishingCoef
npm install
npm start          # Expo DevTools (QR code pour mobile)
npm run web        # Version navigateur
```

## Architecture

```
FishingCoef/
├── App.tsx                   # Racine : state, GPS, tab navigation
├── src/
│   ├── utils/
│   │   ├── astronomy.ts      # Algorithmes soleil/lune (Jean Meeus)
│   │   ├── solunar.ts        # Théorie solunar + score 0–100
│   │   └── tides.ts          # Simulation coefficient de marée SHOM
│   ├── components/
│   │   ├── ScoreGauge.tsx    # Jauge circulaire principale
│   │   ├── ActivityChart.tsx # Graphique horaire 24h
│   │   ├── MoonCard.tsx      # Phase lunaire + lever/coucher
│   │   ├── SolunarCard.tsx   # Périodes majeures/mineures
│   │   ├── TideCard.tsx      # Coefficient de marée (20–120)
│   │   ├── WeekForecast.tsx  # Prévisions 7 jours
│   │   └── Header.tsx        # En-tête avec localisation
│   ├── screens/
│   │   ├── HomeScreen.tsx    # Tableau de bord principal
│   │   ├── CalendarScreen.tsx # Vue calendrier hebdomadaire
│   │   └── InfoScreen.tsx    # Documentation / À propos
│   └── theme/
│       └── colors.ts         # Palette couleurs (thème sombre marin)
```

## Moteur de calcul — Points clés

### Théorie solunar (`solunar.ts`)

Score composite 0–100 :
| Facteur | Poids | Détail |
|---|---|---|
| Phase lunaire | 0–30 pts | Pic à nouvelle lune et pleine lune (`|cos(phase × 2π)|^0.4`) |
| Activité solunar | 0–60 pts | Proximité aux transits/lever-coucher lunaires |
| Bonus aube/crépuscule | 0–10 pts | ±2h autour du lever/coucher solaire |

**Périodes :**
- **Majeure** (±60 min) : transit supérieur et inférieur de la lune
- **Mineure** (±45 min) : lever et coucher de la lune

### Astronomie (`astronomy.ts`)

Algorithmes basés sur Jean Meeus *Astronomical Algorithms* (2e éd.) :
- Position du soleil (RA, déclinaison, azimut, altitude)
- Position de la lune (RA, déclinaison, distance, angle parallactique)
- Illumination lunaire et phase (0 = nouvelle lune, 0.5 = pleine lune)
- Lever/coucher/transit solaire et lunaire (recherche numérique par échantillonnage)

### Coefficient de marée (`tides.ts`)

Simulation du système SHOM français (20–120) :
```
coef = 70 + 45×|cos(phase × 2π)| + 12×cos(anomalie × 2π)
```
- Cycle synodique (29.53 j) → alternance vives-eaux/mortes-eaux
- Cycle anomalistique (27.55 j) → amplification périgée/apogée

> ⚠️ Pour la navigation réelle, toujours consulter les tables SHOM officielles.

## Améliorations possibles

- [ ] Intégration API SHOM pour les coefficients officiels par port
- [ ] Données météo (vent, pression) via Open-Meteo (gratuit, sans clé)
- [ ] Spots de pêche sur carte (MapView)
- [ ] Notifications push aux périodes solunar
- [ ] Mode hors-ligne avec cache des prévisions 30 jours
- [ ] Widget iOS/Android affichant le score en temps réel
- [ ] Historique des prises (journal de pêche)
- [ ] Filtrage par espèce (eau douce / mer)
