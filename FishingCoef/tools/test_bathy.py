#!/usr/bin/env python3
"""
Tests de la détection des secs et des tombants.

On fabrique une grille de profondeurs où l'on a planté des reliefs à des
positions connues, et on vérifie que l'analyse les retrouve. C'est le seul
moyen de savoir si elle voit ce qu'un pêcheur verrait : sur les vraies
données, on n'a pas de vérité de référence.

    python3 test_bathy.py
"""

import math
import sys

import numpy as np

from bathy import analyse

# Cadre identique à celui interrogé au déploiement, marge comprise.
LAT_N, LAT_S, LON_W, LON_E = 47.98, 47.59, -4.29, -3.61
DLAT, DLON = -1 / 16 / 60, 1 / 16 / 60
M_LAT = 111_320.0
M_LON = 111_320.0 * math.cos(math.radians(47.8))

# Reliefs plantés : nom, position, hauteur de remontée, étendue
PLANTED = [
    ("langue", 47.8100, -4.0300, 14.0, 380),
    ("bluiniers", 47.7350, -4.0600, 9.0, 300),
    ("perennes", 47.6900, -4.1050, 11.0, 350),
]
STEP_LON = -3.945          # méridien où l'on plante une marche de 18 m
failures = []


def build_grid(with_step=True, noise=0.35):
    h = int(round((LAT_N - LAT_S) / abs(DLAT)))
    w = int(round((LON_E - LON_W) / DLON))
    lat0, lon0 = LAT_N + DLAT / 2, LON_W + DLON / 2
    lats = lat0 + DLAT * np.arange(h)[:, None]
    lons = lon0 + DLON * np.arange(w)[None, :]

    depth = 30 + (LAT_N - lats) / (LAT_N - LAT_S) * 45 \
        + (lons - LON_W) / (LON_E - LON_W) * (-15)

    for _, clat, clon, amp, sig in PLANTED:
        dy = (lats - clat) * M_LAT
        dx = (lons - clon) * M_LON
        depth = depth - amp * np.exp(-((dx ** 2 + dy ** 2) / (2 * sig ** 2)))

    if with_step:
        depth = depth + np.where(lons > STEP_LON, 18.0, 0.0)

    depth = depth + np.random.default_rng(3).normal(0, noise, depth.shape)
    depth = np.where((lats > 47.88) & (lons > -3.95), -5.0, depth)   # terre
    valid = np.isfinite(depth) & (depth >= 3) & (depth <= 60)
    return depth, valid, lat0, lon0


def metres(a_lat, a_lon, b_lat, b_lon):
    return math.hypot((a_lat - b_lat) * M_LAT, (a_lon - b_lon) * M_LON)


def check(label, ok, detail=""):
    print(f"  {'ok  ' if ok else 'ÉCHEC'} {label}{' — ' + detail if detail else ''}")
    if not ok:
        failures.append(label)


def main():
    depth, valid, lat0, lon0 = build_grid()
    banks, drops = analyse(depth, valid, lat0, lon0, DLAT, DLON)

    print(f"grille analysée : {depth.shape[0]}×{depth.shape[1]}, "
          f"{len(banks)} secs et {len(drops)} tombants détectés")

    print("\nles reliefs plantés sont retrouvés :")
    for name, clat, clon, _, _ in PLANTED:
        near = [(metres(b["la"], b["lo"], clat, clon), i)
                for i, b in enumerate(banks)]
        dist, idx = min(near, default=(9e9, -1))
        check(name, dist < 400, f"à {dist:.0f} m, rang {idx + 1}")

    print("\nun bord de tombant ne doit pas passer pour un sec :")
    edge = [b for b in banks if abs(b["lo"] - STEP_LON) < 0.004]
    check("aucun faux positif le long de la marche", not edge,
          f"{len(edge)} trouvés" if edge else "")

    print("\nle tombant lui-même est bien détecté :")
    on_step = [d for d in drops if abs(d["lo"] - STEP_LON) < 0.01]
    check("des tombants sur la marche", len(on_step) > 0, f"{len(on_step)}")
    check("et nulle part ailleurs", len(on_step) == len(drops),
          f"{len(drops) - len(on_step)} hors marche")

    print("\nun fond uniforme ne doit rien produire :")
    flat = np.full((200, 300), 25.0) + np.random.default_rng(1).normal(0, 0.2, (200, 300))
    fb, _ = analyse(flat, np.ones_like(flat, dtype=bool), 47.9, -4.2, DLAT, DLON)
    check("aucun sec sur fond plat", len(fb) == 0, f"{len(fb)} trouvés")

    print("\nles profondeurs restent dans la bande exploitable :")
    check("toutes entre 3 et 60 m",
          all(3 <= b["d"] <= 60 for b in banks + drops))

    print()
    if failures:
        print(f"ÉCHEC — {len(failures)} test(s) : {', '.join(failures)}")
        return 1
    print("tous les tests passent")
    return 0


if __name__ == "__main__":
    sys.exit(main())
