# -*- coding: utf-8 -*-
import json, math

def main():
    mols = []
    
    # Helper functions for geometry
    def aromatic(cx=0, cy=0, r_c=1.40, r_h=2.48):
        atoms, bonds = [], []
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "C", "x": round(cx + r_c * math.cos(ang), 3), "y": round(cy + r_c * math.sin(ang), 3), "z": 0.0, "hybrid": "sp²", "valency": 4})
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "H", "x": round(cx + r_h * math.cos(ang), 3), "y": round(cy + r_h * math.sin(ang), 3), "z": 0.0, "hybrid": "1s", "valency": 1})
        for i in range(6):
            bonds.append({"a1": i, "a2": (i+1)%6, "order": 2 if i%2==0 else 1})
            bonds.append({"a1": i, "a2": i+6, "order": 1})
        return atoms, bonds

    # GROUP 1: ALKANES & CYCLOALKANES
    mols.append({
        "id": "methane", "name": "Methane (Metan)", "iupac": "Methane", "formula": "CH4", "condensed": "CH4",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 16.04,
        "geometry": "Tứ diện đều (Tetrahedral)", "hybridization": "sp³",
        "state": "Khí không màu, không mùi", "boilingPoint": "-161.5 °C", "meltingPoint": "-182.5 °C",
        "solubility": "Kém tan trong nước, tan trong dung môi hữu cơ",
        "reactions": "Thế halogen (CH₄ + Cl₂ → CH₃Cl + HCl), cháy tỏa nhiệt (CH₄ + 2O₂ → CO₂ + 2H₂O), nhiệt phân 1500°C làm lạnh nhanh thành C₂H₂.",
        "applications": "Thành phần chính của khí thiên nhiên, khí dầu mỏ và Biogas; làm nhiên liệu sạch và nguyên liệu tổng hợp hữu cơ.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": 0.63, "y": 0.63, "z": 0.63, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.63, "y": -0.63, "z": 0.63, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.63, "y": 0.63, "z": -0.63, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.63, "y": -0.63, "z": -0.63, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}]
    })

    mols.append({
        "id": "ethane", "name": "Ethane (Etan)", "iupac": "Ethane", "formula": "C2H6", "condensed": "CH3-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 30.07,
        "geometry": "2 Tứ diện lồng nhau", "hybridization": "sp³",
        "state": "Khí không màu, dễ cháy", "boilingPoint": "-88.6 °C", "meltingPoint": "-182.8 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Phản ứng thế clo, phản ứng dehydro hóa thành ethylene.",
        "applications": "Nguyên liệu công nghiệp sản xuất etilen – monomer nhựa PE.",
        "atoms": [
            {"element": "C", "x": -0.77, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 0.77, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": -1.16, "y": 1.02, "z": 0.0, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.16, "y": -0.51, "z": 0.89, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.16, "y": -0.51, "z": -0.89, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.16, "y": -1.02, "z": 0.0, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.16, "y": 0.51, "z": -0.89, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.16, "y": 0.51, "z": 0.89, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}]
    })

    mols.append({
        "id": "propane", "name": "Propane (Propan)", "iupac": "Propane", "formula": "C3H8", "condensed": "CH3-CH2-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 44.10,
        "geometry": "Mạch gấp khúc", "hybridization": "sp³",
        "state": "Khí không màu, dễ hóa lỏng", "boilingPoint": "-42.1 °C", "meltingPoint": "-187.7 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Cháy tỏa nhiệt lớn, thế halogen ưu tiên vị trí C bậc 2.",
        "applications": "Thành phần chính trong khí dầu mỏ hóa lỏng (LPG / Gas đun nấu).",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.58, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": -1.26, "y": -0.29, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 1.26, "y": -0.29, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": 0.0, "y": 1.24, "z": 0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": 1.24, "z": -0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -2.16, "y": 0.33, "z": 0.0, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.30, "y": -0.93, "z": 0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.30, "y": -0.93, "z": -0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 2.16, "y": 0.33, "z": 0.0, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.30, "y": -0.93, "z": -0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.30, "y": -0.93, "z": 0.88, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1}]
    })

    with open("mols_part1.json", "w", encoding="utf-8") as f:
        json.dump(mols, f, ensure_ascii=False, indent=2)
    print("Part 1 saved:", len(mols))

main()
