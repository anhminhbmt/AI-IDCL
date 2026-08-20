# -*- coding: utf-8 -*-
import json, math, os, sys

def build_data():
    def dist(a, b):
        return round(math.sqrt((a['x']-b['x'])**2 + (a['y']-b['y'])**2 + (a['z']-b['z'])**2), 3)

    mols = []
    
    # 1. Methane
    mols.append({
        "id": "methane", "name": "Methane (Metan)", "iupac": "Methane", "formula": "CH4", "condensed": "CH4",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 16.04,
        "geometry": "Tứ diện đều (Tetrahedral)", "hybridization": "sp³ (Góc liên kết 109.5°)",
        "state": "Khí không màu, không mùi, nhẹ hơn không khí (d ≈ 0.55)",
        "boilingPoint": "-161.5 °C", "meltingPoint": "-182.5 °C",
        "solubility": "Kém tan trong nước, tan tốt trong dung môi không phân cực (benzen, ete)",
        "reactions": "1) Phản ứng thế clo (chiếu sáng):\nCH₄ + Cl₂ → CH₃Cl + HCl\n2) Phản ứng cháy tỏa nhiệt lớn:\nCH₄ + 2O₂ → CO₂ + 2H₂O (ΔH = -890 kJ/mol)\n3) Nhiệt phân ở 1500°C làm lạnh nhanh:\n2CH₄ → C₂H₂ + 3H₂",
        "applications": "Thành phần chính (85-95%) của khí thiên nhiên và Biogas; làm nhiên liệu sạch gia dụng và nguyên liệu sản xuất khí tổng hợp (CO+H₂), phân đạm ure.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -4},
            {"element": "H", "x": 0.63, "y": 0.63, "z": 0.63, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.63, "y": -0.63, "z": 0.63, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.63, "y": 0.63, "z": -0.63, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.63, "y": -0.63, "z": -0.63, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}]
    })

    # 2. Ethane
    mols.append({
        "id": "ethane", "name": "Ethane (Etan)", "iupac": "Ethane", "formula": "C2H6", "condensed": "CH3-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 30.07,
        "geometry": "2 Tứ diện lồng nhau (Góc C-C-H ≈ 109.5°)", "hybridization": "sp³",
        "state": "Khí không màu, dễ cháy", "boilingPoint": "-88.6 °C", "meltingPoint": "-182.8 °C",
        "solubility": "Không tan trong nước",
        "reactions": "1) Phản ứng thế halogen: C₂H₆ + Cl₂ → C₂H₅Cl + HCl\n2) Đề hiđro hóa nhiệt độ cao: C₂H₆ → C₂H₄ + H₂\n3) Cháy: 2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O",
        "applications": "Nguyên liệu nhiệt phân (cracking hơi nước) để sản xuất ethylene – monomer quan trọng nhất của ngành hóa dầu sản xuất nhựa PE.",
        "atoms": [
            {"element": "C", "x": -0.77, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 0.77, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -1.16, "y": 1.02, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.16, "y": -0.51, "z": 0.89, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.16, "y": -0.51, "z": -0.89, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.16, "y": -1.02, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.16, "y": 0.51, "z": -0.89, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.16, "y": 0.51, "z": 0.89, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}]
    })

    # 3. Propane
    mols.append({
        "id": "propane", "name": "Propane (Propan)", "iupac": "Propane", "formula": "C3H8", "condensed": "CH3-CH2-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 44.10,
        "geometry": "Mạch C-C-C gấp khúc ziczac (Góc C-C-C ≈ 112°)", "hybridization": "sp³",
        "state": "Khí không màu, dễ hóa lỏng dưới áp suất vừa phải", "boilingPoint": "-42.1 °C", "meltingPoint": "-187.7 °C",
        "solubility": "Không tan trong nước",
        "reactions": "1) Phản ứng thế clo (ưu tiên C bậc 2 tạo 2-chloropropane làm sản phẩm chính).\n2) Phản ứng cháy: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O",
        "applications": "Thành phần chủ yếu trong khí hóa lỏng LPG (gas đun nấu dân dụng và công nghiệp), chất đẩy trong bình xịt khí dung.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.58, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": -1.26, "y": -0.29, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 1.26, "y": -0.29, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": 0.0, "y": 1.24, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": 1.24, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.16, "y": 0.33, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.30, "y": -0.93, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.30, "y": -0.93, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.16, "y": 0.33, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.30, "y": -0.93, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.30, "y": -0.93, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1}]
    })

    return mols

print("build_data() ready")
