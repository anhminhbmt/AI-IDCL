# -*- coding: utf-8 -*-
import json, math

def get_database():
    mols = []

    # Helper: Ring generator
    def benzene_ring(cx=0, cy=0, cz=0, rc=1.40, rh=2.48):
        atoms, bonds = [], []
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "C", "x": round(cx + rc*math.cos(ang), 3), "y": round(cy + rc*math.sin(ang), 3), "z": cz, "hybrid": "sp²", "valency": 4})
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "H", "x": round(cx + rh*math.cos(ang), 3), "y": round(cy + rh*math.sin(ang), 3), "z": cz, "hybrid": "1s", "valency": 1})
        for i in range(6):
            bonds.append({"a1": i, "a2": (i+1)%6, "order": 2 if i%2==0 else 1})
            bonds.append({"a1": i, "a2": i+6, "order": 1})
        return atoms, bonds

    return mols

print("Database helper ready")
