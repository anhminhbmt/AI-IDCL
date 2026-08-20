# -*- coding: utf-8 -*-
import json, math

def get_molecules():
    molecules = []

    # Helper function to generate aromatic ring coordinates
    def make_benzene_ring(cx=0, cy=0, cz=0, r_c=1.40, r_h=2.48):
        atoms = []
        bonds = []
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "C", "x": round(cx + r_c * math.cos(ang), 3), "y": round(cy + r_c * math.sin(ang), 3), "z": cz, "hybrid": "sp²", "valency": 4})
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "H", "x": round(cx + r_h * math.cos(ang), 3), "y": round(cy + r_h * math.sin(ang), 3), "z": cz, "hybrid": "1s", "valency": 1})
        for i in range(6):
            bonds.append({"a1": i, "a2": (i+1)%6, "order": 2 if i%2==0 else 1})
            bonds.append({"a1": i, "a2": i+6, "order": 1})
        return atoms, bonds

    # 1. Methane
    molecules.append({
        "id": "methane", "name": "Methane (Metan)", "iupac": "Methane", "formula": "CH4", "condensed": "CH4",
        "group": "Hydrocarbon no", "groupId": "alkane", "molarMass": 16.04,
        "geometry": "Tứ diện đều (Tetrahedral)", "hybridization": "sp³",
        "state": "Khí không màu, không mùi", "boilingPoint": "-161.5 °C", "meltingPoint": "-182.5 °C",
        "solubility": "Thực tế không tan trong nước, tan trong benzen, ete",
        "reactions": "Thế clo theo tỉ lệ 1:1, 1:2, 1:3, 1:4 (CH₄ + Cl₂ → CH₃Cl + HCl); cháy tỏa nhiệt mạnh; nhiệt phân ở 1500°C làm lạnh nhanh thành C₂H₂.",
        "applications": "Thành phần chính của khí thiên nhiên và khí Biogas; làm nhiên liệu sạch gia dụng và nguyên liệu sản xuất hidro, phân bón ure.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": 0.63, "y": 0.63, "z": 0.63, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.63, "y": -0.63, "z": 0.63, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.63, "y": 0.63, "z": -0.63, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.63, "y": -0.63, "z": -0.63, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}]
    })

    # 2. Ethane
    molecules.append({
        "id": "ethane", "name": "Ethane (Etan)", "iupac": "Ethane", "formula": "C2H6", "condensed": "CH3-CH3",
        "group": "Hydrocarbon no", "groupId": "alkane", "molarMass": 30.07,
        "geometry": "2 Tứ diện lồng nhau (Staggered)", "hybridization": "sp³",
        "state": "Khí không màu, không mùi", "boilingPoint": "-88.6 °C", "meltingPoint": "-182.8 °C",
        "solubility": "Kém tan trong nước, tan trong dung môi hữu cơ",
        "reactions": "Phản ứng thế halogen (C₂H₆ + Cl₂ → C₂H₅Cl + HCl), phản ứng dehydro hóa thành ethylene ở nhiệt độ cao.",
        "applications": "Dùng trong công nghiệp hóa dầu để nhiệt phân sản xuất etilen – tiền chất sản xuất nhựa polyethylene (PE).",
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

    print(f"Generated {len(molecules)} base molecules")
    return molecules

get_molecules()
