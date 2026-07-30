#!/usr/bin/env python3
"""
Transforme une réponse Overpass en relief du fond exploitable par la page.

Les données viennent d'OpenStreetMap, où les contributeurs d'OpenSeaMap
saisissent les objets des cartes marines : épaves, roches isolées, hauts-fonds,
récifs, obstructions. Ce sont exactement les accidents qui retiennent le
poisson, et le seul jeu de données libre et interrogeable du secteur.

Lit le JSON Overpass sur l'entrée standard, écrit sur la sortie standard une
ligne JavaScript à insérer dans la page.
"""

import json
import re
import sys

# Ordre d'intérêt halieutique : une épave vaut mieux qu'un caillou de plage.
RANK = {"wreck": 0, "obstruction": 1, "shoal": 2, "reef": 3, "rock": 4}

LABEL = {
    "wreck": "épave",
    "obstruction": "obstruction",
    "shoal": "haut-fond",
    "reef": "récif",
    "rock": "roche",
}

MAX_FEATURES = 140


def kind_of(tags):
    st = tags.get("seamark:type", "")
    if st in RANK:
        return st
    if tags.get("historic") == "wreck" or st.startswith("wreck"):
        return "wreck"
    if tags.get("natural") == "reef":
        return "reef"
    if tags.get("natural") in ("shoal", "sand", "bank"):
        return "shoal"
    if tags.get("natural") in ("rock", "bare_rock", "stone"):
        return "rock"
    return None


def depth_of(tags):
    """Profondeur en mètres si elle est renseignée, sinon None."""
    for key in ("seamark:wreck:depth", "seamark:rock:depth",
                "seamark:obstruction:depth", "seamark:sounding:depth", "depth"):
        raw = tags.get(key)
        if not raw:
            continue
        m = re.search(r"-?\d+(?:[.,]\d+)?", str(raw))
        if m:
            try:
                v = abs(float(m.group(0).replace(",", ".")))
            except ValueError:
                continue
            if 0 <= v <= 200:
                return round(v, 1)
    return None


def name_of(tags):
    for key in ("seamark:name", "name", "seamark:wreck:name"):
        v = tags.get(key)
        if v and len(v) <= 60:
            return v
    return None


def main():
    try:
        data = json.load(sys.stdin)
        elements = data.get("elements") or []
    except Exception as exc:                      # réponse absente ou illisible
        print(f"// relief du fond indisponible : {exc}", file=sys.stderr)
        print("window.__SEABED__ = [];")
        return 0

    seen = set()
    out = []
    for el in elements:
        tags = el.get("tags") or {}
        kind = kind_of(tags)
        if not kind:
            continue

        lat = el.get("lat")
        lon = el.get("lon")
        if lat is None or lon is None:
            centre = el.get("center") or {}
            lat, lon = centre.get("lat"), centre.get("lon")
        if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
            continue

        # Doublons fréquents entre le nœud et le contour d'un même objet.
        key = (round(lat, 4), round(lon, 4), kind)
        if key in seen:
            continue
        seen.add(key)

        out.append({
            "k": kind,
            "la": round(float(lat), 5),
            "lo": round(float(lon), 5),
            "n": name_of(tags),
            "d": depth_of(tags),
        })

    # Les épaves d'abord, puis ce qui porte un nom, puis ce dont on sait la
    # profondeur : ce sont les repères qu'on retrouve sur un traceur.
    out.sort(key=lambda f: (RANK.get(f["k"], 9), f["n"] is None, f["d"] is None))
    out = out[:MAX_FEATURES]

    counts = {}
    for f in out:
        counts[f["k"]] = counts.get(f["k"], 0) + 1
    summary = ", ".join(f"{n} {LABEL.get(k, k)}{'s' if n > 1 and k != 'wreck' else 's' if n > 1 else ''}"
                        for k, n in sorted(counts.items(), key=lambda kv: RANK.get(kv[0], 9)))
    print(f"// relief du fond : {len(out)} objets — {summary or 'aucun'}", file=sys.stderr)

    print("window.__SEABED__ = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";")
    return 0


if __name__ == "__main__":
    sys.exit(main())
