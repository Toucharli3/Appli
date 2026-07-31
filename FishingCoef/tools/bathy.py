#!/usr/bin/env python3
"""
Cherche dans une grille de profondeurs les accidents qui retiennent le poisson.

Deux formes recherchées :

  * les secs et les langues — une remontée du fond isolée au milieu d'un fond
    plus creux. On les détecte par le relief : l'écart entre la profondeur
    d'un point et celle du fond alentour, mesurée sur une couronne. Un point
    qui remonte nettement au-dessus de ce qui l'entoure est un sec.

  * les tombants — les ruptures de pente, mesurées par le gradient. C'est là
    que le lieu et le congre tiennent.

La grille vient d'EMODnet Bathymetry (~115 m de maille). Le calcul se fait au
déploiement, là où le réseau est disponible.

Aucune dépendance en dehors de numpy : les moyennes glissantes passent par
des images intégrales plutôt que par scipy.
"""

import json
import math
import sys

import numpy as np

# Bandes de profondeur exploitables. Au-delà on sort de la pêche de loisir,
# en deçà on tombe sur l'estran déjà couvert par les postes du bord.
MIN_DEPTH = 3.0
MAX_DEPTH = 60.0

RELIEF_MIN = 4.0        # mètres au-dessus du fond alentour pour parler d'un sec
SLOPE_MIN = 0.10        # pente, en mètres par mètre, pour parler d'un tombant
INNER_M = 300.0         # rayon intérieur de la couronne
OUTER_M = 1500.0        # rayon extérieur
NMS_M = 700.0           # distance minimale entre deux repères retenus
MAX_BANKS = 45
MAX_DROPS = 25


def integral(a):
    """Image intégrale avec une ligne et une colonne de zéros en tête."""
    s = np.zeros((a.shape[0] + 1, a.shape[1] + 1), dtype=np.float64)
    s[1:, 1:] = a.cumsum(axis=0).cumsum(axis=1)
    return s


def box_sums(a, valid, r):
    """Somme et effectif d'une fenêtre carrée de demi-largeur r, bords compris."""
    si = integral(np.where(valid, a, 0.0))
    ci = integral(valid.astype(np.float64))
    h, w = a.shape
    rows = np.arange(h)
    cols = np.arange(w)
    r0 = np.clip(rows - r, 0, h)[:, None]
    r1 = np.clip(rows + r + 1, 0, h)[:, None]
    c0 = np.clip(cols - r, 0, w)[None, :]
    c1 = np.clip(cols + r + 1, 0, w)[None, :]

    def win(ii):
        return ii[r1, c1] - ii[r0, c1] - ii[r1, c0] + ii[r0, c0]

    return win(si), win(ci)


def analyse(depth, valid, lat0, lon0, dlat, dlon):
    """
    depth : profondeurs positives, en mètres, indexées [ligne, colonne].
    valid : masque des cellules en eau exploitables.
    lat0/lon0 : coordonnées du centre de la cellule [0, 0].
    dlat/dlon : pas de la grille en degrés (dlat négatif si le nord est en haut).
    """
    h, w = depth.shape
    mid_lat = lat0 + dlat * h / 2
    m_per_lat = 111_320.0
    m_per_lon = 111_320.0 * math.cos(math.radians(mid_lat))
    cell_y = abs(dlat) * m_per_lat
    cell_x = abs(dlon) * m_per_lon
    cell = (cell_x + cell_y) / 2

    r_in = max(1, int(round(INNER_M / cell)))
    r_out = max(r_in + 1, int(round(OUTER_M / cell)))

    s_in, n_in = box_sums(depth, valid, r_in)
    enough = n_in >= 6
    local = np.divide(s_in, n_in, out=np.full_like(depth, np.nan), where=enough)

    def shifted(a, di, dj):
        """Le fond mesuré à `off` cellules dans une direction donnée."""
        out = np.full_like(a, np.nan)
        h_, w_ = a.shape
        i0, i1 = max(0, di), min(h_, h_ + di)
        j0, j1 = max(0, dj), min(w_, w_ + dj)
        out[i0:i1, j0:j1] = a[i0 - di:i1 - di, j0 - dj:j1 - dj]
        return out

    # Un sec remonte au-dessus du fond dans toutes les directions ; le bord
    # d'un tombant ne remonte que d'un côté. On mesure donc le fond des quatre
    # côtés et on retient le plus défavorable, ce qui élimine les fausses
    # bosses alignées le long des ruptures de pente.
    off = r_out
    around = np.stack([
        shifted(local, +off, 0), shifted(local, -off, 0),
        shifted(local, 0, +off), shifted(local, 0, -off),
    ])
    # Trois directions suffisent : au bord de la grille, et surtout près de la
    # côte où la terre masque un côté, en exiger quatre écarterait des secs
    # bien réels. Le minimum reste pris sur les directions disponibles, ce qui
    # continue d'annuler le relief au bord d'un tombant.
    finite = np.isfinite(around)
    n_dirs = finite.sum(axis=0)
    background = np.min(np.where(finite, around, np.inf), axis=0)
    relief = background - depth
    relief[n_dirs < 3] = np.nan
    relief[~valid] = np.nan
    relief[~enough] = np.nan

    # Pente, par différences centrées.
    gy, gx = np.gradient(np.where(valid, depth, np.nan))
    slope = np.sqrt((gy / cell_y) ** 2 + (gx / cell_x) ** 2)
    slope[~valid] = np.nan

    def collect(field, threshold, kind, limit):
        f = np.where(np.isnan(field), -np.inf, field)
        order = np.argsort(f, axis=None)[::-1]
        taken = []
        min_cells = max(1, int(round(NMS_M / cell)))
        for flat in order:
            v = f.flat[flat]
            if not np.isfinite(v) or v < threshold:
                break
            i, j = divmod(int(flat), w)
            # Suppression des voisins : un sec occupe plusieurs cellules, on ne
            # veut pas le signaler quarante fois.
            if any(abs(i - pi) < min_cells and abs(j - pj) < min_cells for pi, pj in taken):
                continue
            taken.append((i, j))
            yield {
                "k": kind,
                "la": round(lat0 + dlat * i, 5),
                "lo": round(lon0 + dlon * j, 5),
                "d": round(float(depth[i, j]), 1),
                "r": round(float(v), 1) if kind == "bank" else None,
                "s": round(float(v), 3) if kind == "drop" else None,
            }
            if len(taken) >= limit:
                break

    banks = list(collect(relief, RELIEF_MIN, "bank", MAX_BANKS))
    drops = list(collect(slope, SLOPE_MIN, "drop", MAX_DROPS))
    return banks, drops


def read_geotiff(path):
    """Lit la grille et sa géoréférence. rasterio si présent, sinon abandon."""
    import rasterio                                    # noqa: PLC0415
    with rasterio.open(path) as src:
        band = src.read(1).astype(np.float64)
        t = src.transform
        nodata = src.nodata
    # EMODnet fournit des altitudes : négatives sous le niveau de la mer.
    depth = -band
    valid = np.isfinite(depth) & (depth >= MIN_DEPTH) & (depth <= MAX_DEPTH)
    if nodata is not None:
        valid &= band != nodata
    # Centre de la cellule (0, 0)
    lon0 = t.c + t.a / 2
    lat0 = t.f + t.e / 2
    return depth, valid, lat0, lon0, t.e, t.a


def main():
    if len(sys.argv) < 2:
        print("usage: bathy.py <grille.tif>", file=sys.stderr)
        print("window.__BATHY__ = [];")
        return 0
    try:
        depth, valid, lat0, lon0, dlat, dlon = read_geotiff(sys.argv[1])
        banks, drops = analyse(depth, valid, lat0, lon0, dlat, dlon)
    except Exception as exc:
        print(f"// bathymétrie indisponible : {exc}", file=sys.stderr)
        print("window.__BATHY__ = [];")
        return 0

    out = banks + drops
    print(f"// bathymétrie : {len(banks)} secs, {len(drops)} tombants "
          f"(grille {depth.shape[0]}x{depth.shape[1]})", file=sys.stderr)
    for f in banks[:6]:
        print(f"//   sec {f['la']:.4f} {f['lo']:.4f} — {f['d']} m, "
              f"remonte de {f['r']} m", file=sys.stderr)
    print("window.__BATHY__ = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";")
    return 0


if __name__ == "__main__":
    sys.exit(main())
