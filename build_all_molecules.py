# -*- coding: utf-8 -*-
import json, math, os

def create_molecules():
    molecules = []

    # 1. Alkane & Cycloalkane (9)
    # Methane
    molecules.append({
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

    # Ethane
    molecules.append({
        "id": "ethane", "name": "Ethane (Etan)", "iupac": "Ethane", "formula": "C2H6", "condensed": "CH3-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 30.07,
        "geometry": "2 Tứ diện lồng nhau (Staggered)", "hybridization": "sp³",
        "state": "Khí không màu, dễ cháy", "boilingPoint": "-88.6 °C", "meltingPoint": "-182.8 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Phản ứng thế clo, phản ứng tách hydro (đề hidro hóa) tạo etilen.",
        "applications": "Nguyên liệu công nghiệp cracking sản xuất etilen – monomer nhựa PE.",
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

    # Propane
    molecules.append({
        "id": "propane", "name": "Propane (Propan)", "iupac": "Propane", "formula": "C3H8", "condensed": "CH3-CH2-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 44.10,
        "geometry": "Mạch gấp khúc (Tetrahedral angles)", "hybridization": "sp³",
        "state": "Khí không màu, dễ hóa lỏng", "boilingPoint": "-42.1 °C", "meltingPoint": "-187.7 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Cháy tỏa lượng nhiệt lớn, phản ứng thế halogen ưu tiên vị trí C bậc 2.",
        "applications": "Thành phần chính trong khí dầu mỏ hóa lỏng (LPG / Gas đun nấu gia đình), chất đẩy bình xịt.",
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

    # Butane
    molecules.append({
        "id": "butane", "name": "Butane (Butan)", "iupac": "Butane", "formula": "C4H10", "condensed": "CH3-CH2-CH2-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 58.12,
        "geometry": "Mạch thẳng zic-zắc", "hybridization": "sp³",
        "state": "Khí không màu, áp suất hóa lỏng thấp", "boilingPoint": "-0.5 °C", "meltingPoint": "-138.4 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Phản ứng craking, oxi hóa không hoàn toàn tạo axit axetic.",
        "applications": "Nhiên liệu bật lửa gas, bếp gas mini du lịch, thành phần khí hóa lỏng LPG.",
        "atoms": [
            {"element": "C", "x": -1.90, "y": -0.36, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": -0.63, "y": 0.49, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 0.63, "y": -0.49, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 1.90, "y": 0.36, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": -2.81, "y": 0.25, "z": 0.0, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.94, "y": -1.00, "z": 0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.94, "y": -1.00, "z": -0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.63, "y": 1.14, "z": 0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.63, "y": 1.14, "z": -0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.63, "y": -1.14, "z": 0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.63, "y": -1.14, "z": -0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 2.81, "y": -0.25, "z": 0.0, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.94, "y": 1.00, "z": 0.88, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.94, "y": 1.00, "z": -0.88, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [
            {"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
            {"a1": 0, "a2": 4, "order": 1}, {"a1": 0, "a2": 5, "order": 1}, {"a1": 0, "a2": 6, "order": 1},
            {"a1": 1, "a2": 7, "order": 1}, {"a1": 1, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1},
            {"a1": 2, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1}, {"a1": 3, "a2": 12, "order": 1},
            {"a1": 3, "a2": 13, "order": 1}
        ]
    })

    # Isobutane
    molecules.append({
        "id": "isobutane", "name": "Isobutane (Isobutan)", "iupac": "2-Methylpropane", "formula": "C4H10", "condensed": "CH(CH3)3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 58.12,
        "geometry": "Phân nhánh 3 nhánh chóp tam giác", "hybridization": "sp³",
        "state": "Khí không màu", "boilingPoint": "-11.7 °C", "meltingPoint": "-159.6 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Phản ứng thế ưu tiên vị trí C bậc 3, đề hidro hóa tạo isobutene.",
        "applications": "Môi chất lạnh thân thiện môi trường R600a trong tủ lạnh hiện đại.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.36, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 0.0, "y": 1.45, "z": -0.19, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": -1.26, "y": -0.73, "z": -0.19, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 1.26, "y": -0.73, "z": -0.19, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": 0.0, "y": 0.0, "z": 1.45, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": 2.27, "z": 0.54, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.88, "y": 1.57, "z": -0.83, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -0.88, "y": 1.57, "z": -0.83, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -2.16, "y": -0.21, "z": 0.16, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.28, "y": -1.74, "z": 0.22, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.30, "y": -0.78, "z": -1.28, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 2.16, "y": -0.21, "z": 0.16, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.28, "y": -1.74, "z": 0.22, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.30, "y": -0.78, "z": -1.28, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [
            {"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1},
            {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1},
            {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1},
            {"a1": 3, "a2": 11, "order": 1}, {"a1": 3, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1}
        ]
    })

    # Cyclopropane
    molecules.append({
        "id": "cyclopropane", "name": "Cyclopropane (Xiclopropan)", "iupac": "Cyclopropane", "formula": "C3H6", "condensed": "c-C3H6 (Vòng 3)",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 42.08,
        "geometry": "Tam giác đều phẳng (Góc liên kết 60° uốn cong)", "hybridization": "sp³ (banana bond)",
        "state": "Khí không màu", "boilingPoint": "-32.9 °C", "meltingPoint": "-127.6 °C",
        "solubility": "Ít tan trong nước, tan trong ete",
        "reactions": "Phản ứng cộng mở vòng dễ dàng với H₂ (xúc tác Ni, 80°C) và Br₂ (khác với ankan).",
        "applications": "Từng dùng làm thuốc mê qua đường thở, dùng trong nghiên cứu cấu trúc liên kết hóa học đặc biệt.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.87, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": -0.76, "y": -0.44, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 0.76, "y": -0.44, "z": 0.0, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": 0.0, "y": 1.48, "z": 0.90, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": 1.48, "z": -0.90, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.31, "y": -0.74, "z": 0.90, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.31, "y": -0.74, "z": -0.90, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.31, "y": -0.74, "z": 0.90, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.31, "y": -0.74, "z": -0.90, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [
            {"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 0, "order": 1},
            {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1},
            {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1},
            {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1}
        ]
    })

    # Cyclohexane
    molecules.append({
        "id": "cyclohexane", "name": "Cyclohexane (Xiclohexan)", "iupac": "Cyclohexane", "formula": "C6H12", "condensed": "c-C6H12 (Vòng 6)",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 84.16,
        "geometry": "Cấu dạng ghế bền vững (Chair conformation)", "hybridization": "sp³",
        "state": "Chất lỏng không màu", "boilingPoint": "80.7 °C", "meltingPoint": "6.5 °C",
        "solubility": "Không tan trong nước, hòa tan chất béo",
        "reactions": "Thế clo chiếu sáng, oxi hóa thành axit adipic.",
        "applications": "Dung môi hữu cơ không phân cực, nguyên liệu sản xuất tơ nilon-6,6.",
        "atoms": [
            {"element": "C", "x": 1.26, "y": 0.73, "z": 0.23, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 0.0, "y": 1.45, "z": -0.23, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": -1.26, "y": 0.73, "z": 0.23, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": -1.26, "y": -0.73, "z": -0.23, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 0.0, "y": -1.45, "z": 0.23, "hybrid": "sp³", "valency": 4},
            {"element": "C", "x": 1.26, "y": -0.73, "z": -0.23, "hybrid": "sp³", "valency": 4},
            {"element": "H", "x": 1.28, "y": 0.74, "z": 1.33, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 2.16, "y": 1.25, "z": -0.12, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": 1.48, "z": -1.33, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": 2.49, "z": 0.12, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.28, "y": 0.74, "z": 1.33, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -2.16, "y": 1.25, "z": -0.12, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -1.28, "y": -0.74, "z": -1.33, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": -2.16, "y": -1.25, "z": 0.12, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": -1.48, "z": 1.33, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 0.0, "y": -2.49, "z": -0.12, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 1.28, "y": -0.74, "z": -1.33, "hybrid": "1s", "valency": 1},
            {"element": "H", "x": 2.16, "y": -1.25, "z": 0.12, "hybrid": "1s", "valency": 1}
        ],
        "bonds": [
            {"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
            {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1}, {"a1": 5, "a2": 0, "order": 1},
            {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1}, {"a1": 1, "a2": 8, "order": 1},
            {"a1": 1, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1}, {"a1": 2, "a2": 11, "order": 1},
            {"a1": 3, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1}, {"a1": 4, "a2": 14, "order": 1},
            {"a1": 4, "a2": 15, "order": 1}, {"a1": 5, "a2": 16, "order": 1}, {"a1": 5, "a2": 17, "order": 1}
        ]
    })

    return molecules

print("Molecules module built successfully")
