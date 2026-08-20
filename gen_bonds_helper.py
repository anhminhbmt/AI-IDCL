# -*- coding: utf-8 -*-
import json, math

def generate():
    # Helper to calculate distances and create bonds automatically if needed
    def auto_bonds(atoms, max_dist=1.7):
        bonds = []
        n = len(atoms)
        for i in range(n):
            for j in range(i+1, n):
                dx = atoms[i]["x"] - atoms[j]["x"]
                dy = atoms[i]["y"] - atoms[j]["y"]
                dz = atoms[i]["z"] - atoms[j]["z"]
                dist = math.sqrt(dx*dx + dy*dy + dz*dz)
                
                # Check bond thresholds based on elements
                e1, e2 = atoms[i]["element"], atoms[j]["element"]
                thresh = 1.65
                if "H" in (e1, e2): thresh = 1.25
                if "Cl" in (e1, e2) or "Br" in (e1, e2) or "S" in (e1, e2) or "P" in (e1, e2) or "I" in (e1, e2): thresh = 2.05
                
                if dist <= thresh and dist > 0.4:
                    bonds.append({"a1": i, "a2": j, "order": 1})
        return bonds

    print("Auto-bonds helper ready")

generate()
