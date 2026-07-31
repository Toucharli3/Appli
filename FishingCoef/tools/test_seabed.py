#!/usr/bin/env python3
"""
Tests du traitement de la réponse Overpass.

Overpass renvoie des nœuds et des contours mêlés, souvent en double pour un
même objet, avec des étiquettes hétérogènes et parfois aberrantes. Ces tests
figent le comportement attendu face à chacun de ces cas.

    python3 test_seabed.py
"""

import json
import subprocess
import sys
from pathlib import Path

TOOL = Path(__file__).with_name("seabed.py")
failures = []


def run(payload):
    """Exécute l'outil et rend la liste d'objets produite."""
    proc = subprocess.run(
        [sys.executable, str(TOOL)],
        input=json.dumps(payload), capture_output=True, text=True)
    out = proc.stdout.strip()
    assert out.startswith("window.__SEABED__ = "), out[:80]
    return json.loads(out[len("window.__SEABED__ = "):].rstrip(";")), proc.stderr


def check(label, ok, detail=""):
    print(f"  {'ok  ' if ok else 'ÉCHEC'} {label}{' — ' + detail if detail else ''}")
    if not ok:
        failures.append(label)


def node(i, lat, lon, **tags):
    return {"type": "node", "id": i, "lat": lat, "lon": lon, "tags": tags}


def main():
    print("cas nominal :")
    feats, _ = run({"elements": [
        node(1, 47.72, -3.98, **{"seamark:type": "wreck",
                                 "seamark:name": "Épave du Sphinx",
                                 "seamark:wreck:depth": "18"}),
        {"type": "way", "id": 2, "center": {"lat": 47.73, "lon": -3.99},
         "tags": {"seamark:type": "shoal", "name": "Guiriden"}},
    ]})
    check("nœud et contour tous deux retenus", len(feats) == 2, f"{len(feats)}")
    check("nom repris", feats[0]["n"] == "Épave du Sphinx")
    check("profondeur lue", feats[0]["d"] == 18.0)
    check("l'épave passe devant", feats[0]["k"] == "wreck")

    print("\ndoublons entre le nœud et le contour d'un même objet :")
    feats, _ = run({"elements": [
        node(1, 47.7205, -3.9812, **{"seamark:type": "wreck"}),
        node(2, 47.7205, -3.9812, **{"seamark:type": "wreck"}),
        node(3, 47.72051, -3.98121, **{"seamark:type": "wreck"}),
    ]})
    check("un seul objet conservé", len(feats) == 1, f"{len(feats)}")

    print("\nentrées à écarter :")
    feats, _ = run({"elements": [
        node(1, 47.72, -3.98, amenity="cafe"),
        {"type": "way", "id": 2, "tags": {"seamark:type": "rock"}},        # sans position
        node(3, 47.72, -3.98, **{"seamark:type": "rock", "depth": "9999"}),
        node(4, 47.73, -3.97, **{"seamark:type": "rock", "depth": "4,5"}),
    ]})
    kept = {f["lo"]: f for f in feats}
    check("le café est écarté", all(f["k"] != "cafe" for f in feats))
    check("l'objet sans position est écarté", len(feats) == 2, f"{len(feats)}")
    check("la profondeur aberrante est rejetée",
          kept[-3.98]["d"] is None, str(kept[-3.98]["d"]))
    check("la virgule décimale est lue", kept[-3.97]["d"] == 4.5, str(kept[-3.97]["d"]))

    print("\nordre : épaves d'abord, puis ce qui porte un nom :")
    feats, _ = run({"elements": [
        node(1, 47.70, -4.00, **{"seamark:type": "rock"}),
        node(2, 47.71, -4.01, **{"seamark:type": "wreck"}),
        node(3, 47.72, -4.02, **{"seamark:type": "wreck", "name": "Nommée"}),
    ]})
    check("épave nommée en tête", feats[0]["n"] == "Nommée")
    check("roche en dernier", feats[-1]["k"] == "rock")

    print("\nréponses dégradées :")
    proc = subprocess.run([sys.executable, str(TOOL)], input="pas du json",
                          capture_output=True, text=True)
    check("entrée illisible → liste vide, sans planter",
          proc.returncode == 0 and "[]" in proc.stdout)
    feats, _ = run({})
    check("réponse vide → liste vide", feats == [])

    print("\nplafond de volume :")
    many = {"elements": [node(i, 47.6 + i * 1e-4, -4.0 + i * 1e-4,
                              **{"seamark:type": "rock"}) for i in range(400)]}
    feats, _ = run(many)
    check("plafonné à 140 objets", len(feats) == 140, f"{len(feats)}")

    print()
    if failures:
        print(f"ÉCHEC — {len(failures)} test(s) : {', '.join(failures)}")
        return 1
    print("tous les tests passent")
    return 0


if __name__ == "__main__":
    sys.exit(main())
