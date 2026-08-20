# -*- coding: utf-8 -*-
import json, math

def get_data():
    # CPK Config
    cpk = {
        "H": {"color": "#F8FAFC", "colorNum": 0xf8fafc, "vdw": 1.20, "cov": 0.35, "name": "Hydrogen", "valency": 1, "z": 1},
        "C": {"color": "#334155", "colorNum": 0x334155, "vdw": 1.70, "cov": 0.70, "name": "Carbon", "valency": 4, "z": 6},
        "N": {"color": "#3B82F6", "colorNum": 0x3b82f6, "vdw": 1.55, "cov": 0.65, "name": "Nitrogen", "valency": 3, "z": 7},
        "O": {"color": "#EF4444", "colorNum": 0xef4444, "vdw": 1.52, "cov": 0.66, "name": "Oxygen", "valency": 2, "z": 8},
        "F": {"color": "#14B8A6", "colorNum": 0x14b8a6, "vdw": 1.47, "cov": 0.57, "name": "Fluorine", "valency": 1, "z": 9},
        "Cl": {"color": "#22C55E", "colorNum": 0x22c55e, "vdw": 1.75, "cov": 0.75, "name": "Chlorine", "valency": 1, "z": 17},
        "Br": {"color": "#991B1B", "colorNum": 0x991b1b, "vdw": 1.85, "cov": 0.85, "name": "Bromine", "valency": 1, "z": 35},
        "I": {"color": "#8B5CF6", "colorNum": 0x8b5cf6, "vdw": 1.98, "cov": 0.98, "name": "Iodine", "valency": 1, "z": 53},
        "S": {"color": "#EAB308", "colorNum": 0xeab308, "vdw": 1.80, "cov": 0.85, "name": "Sulfur", "valency": 2, "z": 16},
        "P": {"color": "#F97316", "colorNum": 0xf97316, "vdw": 1.80, "cov": 0.80, "name": "Phosphorus", "valency": 3, "z": 15}
    }
    return cpk

print("CPK Loaded")
