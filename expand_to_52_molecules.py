# -*- coding: utf-8 -*-
"""
Expands database to 52 molecules with full real 3D geometries and rich chemical details.
"""
import json, math

def expand_to_52():
    with open("mols_database_final.json", "r", encoding="utf-8") as f:
        mols = json.load(f)
    
    existing_ids = {m["id"] for m in mols}

    def add_chain_alkane(n, name, iupac, formula, cond, desc, bp, mp, sol, rx, app):
        atoms = []
        bonds = []
        cc_len = 1.54
        ch_len = 1.09
        ang = 109.5 * math.pi / 180.0
        for i in range(n):
            x = (i - (n-1)/2.0) * cc_len * math.sin(ang/2.0)
            y = (cc_len/2.0 * math.cos(ang/2.0)) if (i % 2 == 0) else (-cc_len/2.0 * math.cos(ang/2.0))
            z = 0.0
            atoms.append({"element": "C", "x": round(x, 3), "y": round(y, 3), "z": round(z, 3), "hybrid": "sp³", "valency": 4, "ox": -3 if (i==0 or i==n-1) else -2})
            if i > 0:
                bonds.append({"a1": i-1, "a2": i, "order": 1})
        for i in range(n):
            cx, cy = atoms[i]["x"], atoms[i]["y"]
            y_dir = 1.0 if (i % 2 == 0) else -1.0
            h_z1 = round(ch_len * math.cos(math.radians(35.26)), 3)
            h_y1 = round(cy - y_dir * ch_len * math.sin(math.radians(35.26)), 3)
            idx = len(atoms)
            atoms.append({"element": "H", "x": cx, "y": h_y1, "z": h_z1, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds.append({"a1": i, "a2": idx, "order": 1})
            idx = len(atoms)
            atoms.append({"element": "H", "x": cx, "y": h_y1, "z": -h_z1, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds.append({"a1": i, "a2": idx, "order": 1})
            if i == 0:
                idx = len(atoms)
                x_end = round(cx - ch_len * math.sin(ang/2.0), 3)
                y_end = round(cy + y_dir * ch_len * math.cos(ang/2.0), 3)
                atoms.append({"element": "H", "x": x_end, "y": y_end, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                bonds.append({"a1": i, "a2": idx, "order": 1})
            elif i == n - 1:
                idx = len(atoms)
                x_end = round(cx + ch_len * math.sin(ang/2.0), 3)
                y_end = round(cy + y_dir * ch_len * math.cos(ang/2.0), 3)
                atoms.append({"element": "H", "x": x_end, "y": y_end, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                bonds.append({"a1": i, "a2": idx, "order": 1})

        return {
            "id": iupac.lower().replace(" ", "_").replace("-", "_"),
            "name": name, "iupac": iupac, "formula": formula, "condensed": cond,
            "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane",
            "molarMass": round(12.011*n + 1.008*(2*n+2), 2),
            "geometry": "Mạch C ziczac sp³", "hybridization": "sp³",
            "state": desc, "boilingPoint": bp, "meltingPoint": mp, "solubility": sol,
            "reactions": rx, "applications": app, "atoms": atoms, "bonds": bonds
        }

    # Heptane (C7H16)
    if "heptane" not in existing_ids:
        mols.append(add_chain_alkane(7, "Heptane (Heptan)", "Heptane", "C7H16", "CH3-(CH2)5-CH3", "Chất lỏng không màu, mùi xăng", "98.4 °C", "-90.6 °C", "Không tan trong nước", "Cháy sinh năng lượng, đề hiđro hóa thành Toluen", "Điểm mốc 0 trong thang đo chỉ số kích nổ Octane."))

    # Nonane (C9H20)
    if "nonane" not in existing_ids:
        mols.append(add_chain_alkane(9, "Nonane (Nonan)", "Nonane", "C9H20", "CH3-(CH2)7-CH3", "Chất lỏng không màu, nhớt nhẹ", "150.8 °C", "-53.5 °C", "Không tan trong nước", "Nhiệt phân cracking xăng dầu", "Thành phần nhiên liệu dầu hỏa kerosine và xăng phản lực máy bay."))

    # Decane (C10H22)
    if "decane" not in existing_ids:
        mols.append(add_chain_alkane(10, "Decane (Đecan)", "Decane", "C10H22", "CH3-(CH2)8-CH3", "Chất lỏng không màu", "174.1 °C", "-29.7 °C", "Không tan trong nước", "Cháy tỏa nhiệt lớn", "Thành phần nhiên liệu diesel và dung môi hydrocarbon."))

    # But-1-ene (C4H8)
    if "but_1_ene" not in existing_ids:
        mols.append({
            "id": "but_1_ene", "name": "But-1-ene (But-1-en)", "iupac": "But-1-ene", "formula": "C4H8", "condensed": "CH2=CH-CH2-CH3",
            "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 56.11,
            "geometry": "Mặt phẳng sp² tại đầu mạch nối tiếp chuỗi etyl sp³", "hybridization": "sp² và sp³",
            "state": "Khí không màu, dễ cháy", "boilingPoint": "-6.3 °C", "meltingPoint": "-185.3 °C",
            "solubility": "Không tan trong nước",
            "reactions": "1) Cộng HBr theo quy tắc Markovnikov cho sản phẩm chính 2-bromobutane\n2) Trùng hợp thành nhựa Polybutene-1 (PB-1)",
            "applications": "Đồng trùng hợp với etylen sản xuất nhựa LLDPE (Linear Low-Density Polyethylene) siêu bền dai làm màng bọc co dãn.",
            "atoms": [
                {"element": "C", "x": -1.85, "y": -0.35, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
                {"element": "C", "x": -0.65, "y": 0.15, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 0.65, "y": -0.65, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": 1.95, "y": 0.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "H", "x": -2.75, "y": 0.25, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.95, "y": -1.43, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.55, "y": 1.23, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.65, "y": -1.30, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.65, "y": -1.30, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 2.82, "y": -0.52, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.98, "y": 0.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.98, "y": 0.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                      {"a1": 0, "a2": 4, "order": 1}, {"a1": 0, "a2": 5, "order": 1},
                      {"a1": 1, "a2": 6, "order": 1},
                      {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1},
                      {"a1": 3, "a2": 9, "order": 1}, {"a1": 3, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1}]
        })

    # But-1-yne (C4H6)
    if "but_1_yne" not in existing_ids:
        mols.append({
            "id": "but_1_yne", "name": "But-1-yne (Etylaxetilen)", "iupac": "But-1-yne", "formula": "C4H6", "condensed": "CH≡C-CH2-CH3",
            "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 54.09,
            "geometry": "Đường thẳng sp tại liên kết 3 đầu mạch nối tiếp nhóm etyl", "hybridization": "sp và sp³",
            "state": "Khí không màu dễ cháy", "boilingPoint": "8.08 °C", "meltingPoint": "-125.7 °C",
            "solubility": "Không tan trong nước",
            "reactions": "Tác dụng dung dịch AgNO₃/NH₃ tạo kết tủa vàng nhạt CAg≡C-C₂H₅ (nhận biết ankin có liên kết ba đầu mạch).",
            "applications": "Tổng hợp các chất trung gian dược phẩm đặc hiệu.",
            "atoms": [
                {"element": "C", "x": -1.85, "y": 0.0, "z": 0.0, "hybrid": "sp", "valency": 4, "ox": -1},
                {"element": "C", "x": -0.65, "y": 0.0, "z": 0.0, "hybrid": "sp", "valency": 4, "ox": 0},
                {"element": "C", "x": 0.82, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": 1.62, "y": 1.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "H", "x": -2.91, "y": 0.0, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.08, "y": -0.58, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.08, "y": -0.58, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 2.70, "y": 1.12, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.40, "y": 1.86, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.40, "y": 1.86, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 3}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                      {"a1": 0, "a2": 4, "order": 1}, {"a1": 2, "a2": 5, "order": 1}, {"a1": 2, "a2": 6, "order": 1},
                      {"a1": 3, "a2": 7, "order": 1}, {"a1": 3, "a2": 8, "order": 1}, {"a1": 3, "a2": 9, "order": 1}]
        })

    # Anthracene (C14H10)
    if "anthracene" not in existing_ids:
        mols.append({
            "id": "anthracene", "name": "Anthracene (Antraxen)", "iupac": "Anthracene", "formula": "C14H10", "condensed": "C14H10",
            "group": "3. Hydrocarbon thơm (Arene)", "groupId": "arene", "molarMass": 178.23,
            "geometry": "Hệ 3 vòng benzen ngưng tụ thẳng hàng phẳng hoàn toàn (14 electron π)", "hybridization": "sp²",
            "state": "Chất rắn kết tinh không màu hoặc vàng nhạt, phát quang màu xanh dương rực rỡ dưới tia tử ngoại UV", "boilingPoint": "342.0 °C", "meltingPoint": "218.0 °C",
            "solubility": "Không tan trong nước, tan ít trong cồn, tan tốt trong benzen",
            "reactions": "Dễ dàng bị oxy hóa tại 2 vị trí meso C9 và C10 tạo anthraquinone (tiền chất sản xuất thuốc nhuộm alizarin).",
            "applications": "Chất phát quang nhấp nháy phát hiện bức xạ hạt nhân, sản xuất thuốc nhuộm sợi tự nhiên đỏ alizarin, vật liệu bán dẫn hữu cơ OLED.",
            "atoms": [
                {"element": "C", "x": -2.46, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": -2.46, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": -1.23, "y": -1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
                {"element": "C", "x": 0.0, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
                {"element": "C", "x": 0.0, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
                {"element": "C", "x": -1.23, "y": 1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
                {"element": "C", "x": 1.23, "y": -1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 2.46, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
                {"element": "C", "x": 2.46, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
                {"element": "C", "x": 1.23, "y": 1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 3.69, "y": -1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 4.92, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 4.92, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 3.69, "y": 1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "H", "x": -3.40, "y": 1.24, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -3.40, "y": -1.24, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.23, "y": -2.48, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.23, "y": 2.48, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.23, "y": -2.48, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.23, "y": 2.48, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 3.69, "y": -2.48, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 5.86, "y": -1.24, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 5.86, "y": 1.24, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 3.69, "y": 2.48, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 2}, {"a1": 2, "a2": 3, "order": 1},
                      {"a1": 3, "a2": 4, "order": 2}, {"a1": 4, "a2": 5, "order": 1}, {"a1": 5, "a2": 0, "order": 2},
                      {"a1": 3, "a2": 6, "order": 1}, {"a1": 6, "a2": 7, "order": 2}, {"a1": 7, "a2": 8, "order": 1},
                      {"a1": 8, "a2": 9, "order": 2}, {"a1": 9, "a2": 4, "order": 1},
                      {"a1": 7, "a2": 10, "order": 1}, {"a1": 10, "a2": 11, "order": 2}, {"a1": 11, "a2": 12, "order": 1},
                      {"a1": 12, "a2": 13, "order": 2}, {"a1": 13, "a2": 8, "order": 1},
                      {"a1": 0, "a2": 14, "order": 1}, {"a1": 1, "a2": 15, "order": 1}, {"a1": 2, "a2": 16, "order": 1},
                      {"a1": 5, "a2": 17, "order": 1}, {"a1": 6, "a2": 18, "order": 1}, {"a1": 9, "a2": 19, "order": 1},
                      {"a1": 10, "a2": 20, "order": 1}, {"a1": 11, "a2": 21, "order": 1}, {"a1": 12, "a2": 22, "order": 1}, {"a1": 13, "a2": 23, "order": 1}]
        })

    # Propan-1-ol (C3H7OH)
    if "propan_1_ol" not in existing_ids:
        mols.append({
            "id": "propan_1_ol", "name": "Propan-1-ol (Rượu propylic)", "iupac": "Propan-1-ol", "formula": "C3H8O", "condensed": "CH3-CH2-CH2-OH",
            "group": "5. Alcohol & Phenol", "groupId": "alcohol_phenol", "molarMass": 60.10,
            "geometry": "Ancol bậc 1 mạch 3 carbon", "hybridization": "sp³",
            "state": "Chất lỏng không màu, mùi cồn thơm", "boilingPoint": "97.1 °C", "meltingPoint": "-126.1 °C",
            "solubility": "Tan vô hạn trong nước",
            "reactions": "Oxy hóa bằng CuO nung nóng tạo Propanal (anđehit propylic):\nCH₃CH₂CH₂OH + CuO →(t°) CH₃CH₂CHO + Cu↓ + H₂O",
            "applications": "Dung môi trong công nghiệp in ấn bao bì thực phẩm và dược phẩm.",
            "atoms": [
                {"element": "C", "x": -1.85, "y": -0.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "C", "x": -0.58, "y": 0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": 0.68, "y": -0.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -1},
                {"element": "O", "x": 1.82, "y": 0.55, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": 2.62, "y": 0.02, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.72, "y": 0.38, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.88, "y": -0.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.88, "y": -0.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.58, "y": 1.18, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.58, "y": 1.18, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.68, "y": -0.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.68, "y": -0.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                      {"a1": 0, "a2": 5, "order": 1}, {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1},
                      {"a1": 1, "a2": 8, "order": 1}, {"a1": 1, "a2": 9, "order": 1},
                      {"a1": 2, "a2": 10, "order": 1}, {"a1": 2, "a2": 11, "order": 1}]
        })

    # Propionic Acid (C2H5COOH)
    if "propionic_acid" not in existing_ids:
        mols.append({
            "id": "propionic_acid", "name": "Propionic Acid (Axit propionic / Axit propanoic)", "iupac": "Propanoic acid", "formula": "C3H6O2", "condensed": "CH3-CH2-COOH",
            "group": "7. Carboxylic Acid", "groupId": "carboxylic_acid", "molarMass": 74.08,
            "geometry": "Axit no đơn chức mạch hở 3C", "hybridization": "sp² và sp³",
            "state": "Chất lỏng nhờn không màu, mùi hôi chua nồng đặc trưng giống mùi mồ hôi chân và phô mai Thụy Sĩ", "boilingPoint": "141.1 °C", "meltingPoint": "-21.0 °C",
            "solubility": "Tan vô hạn trong nước",
            "reactions": "Tác dụng bazo tạo muối canxi propionat Ca(CH₃CH₂COO)₂ chất ức chế mốc bánh mì.",
            "applications": "Chất bảo quản chống mốc cho bánh mì gối và thức ăn gia súc (E280-E283).",
            "atoms": [
                {"element": "C", "x": -1.85, "y": -0.25, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "C", "x": -0.55, "y": 0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": 0.72, "y": -0.28, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
                {"element": "O", "x": 0.82, "y": -1.50, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
                {"element": "O", "x": 1.78, "y": 0.55, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": 2.60, "y": 0.05, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.72, "y": 0.42, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.90, "y": -0.88, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.90, "y": -0.88, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.55, "y": 1.18, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.55, "y": 1.18, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 2}, {"a1": 2, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1},
                      {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1}, {"a1": 0, "a2": 8, "order": 1},
                      {"a1": 1, "a2": 9, "order": 1}, {"a1": 1, "a2": 10, "order": 1}]
        })

    # Ethylamine (C2H5NH2)
    if "ethylamine" not in existing_ids:
        mols.append({
            "id": "ethylamine", "name": "Ethylamine (Etylamin)", "iupac": "Ethanamine", "formula": "C2H7N", "condensed": "CH3-CH2-NH2",
            "group": "9. Amine & Amino Acid", "groupId": "amine_amino_acid", "molarMass": 45.08,
            "geometry": "Amine bậc 1 mạch 2C", "hybridization": "sp³",
            "state": "Khí không màu dễ hóa lỏng, mùi khai amoniac nồng", "boilingPoint": "16.6 °C", "meltingPoint": "-81.0 °C",
            "solubility": "Tan vô hạn trong nước, làm quỳ tím hóa xanh",
            "reactions": "Tác dụng HCl tạo khói trắng etylamoni clorua: C₂H₅NH₂ + HCl → C₂H₅NH₃Cl",
            "applications": "Tổng hợp thuốc nhuộm, hóa chất mạ điện và cao su.",
            "atoms": [
                {"element": "C", "x": -1.25, "y": -0.38, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "C", "x": 0.0, "y": 0.45, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -1},
                {"element": "N", "x": 1.25, "y": -0.32, "z": 0.0, "hybrid": "sp³", "valency": 3, "ox": -3},
                {"element": "H", "x": 1.65, "y": -0.85, "z": 0.78, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.65, "y": -0.85, "z": -0.78, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.12, "y": 0.28, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.28, "y": -1.02, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.28, "y": -1.02, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.0, "y": 1.12, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.0, "y": 1.12, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1},
                      {"a1": 2, "a2": 3, "order": 1}, {"a1": 2, "a2": 4, "order": 1},
                      {"a1": 0, "a2": 5, "order": 1}, {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1},
                      {"a1": 1, "a2": 8, "order": 1}, {"a1": 1, "a2": 9, "order": 1}]
        })

    print(f"Total Database Molecules after expansion: {len(mols)}")
    with open("mols_database_52.json", "w", encoding="utf-8") as f:
        json.dump(mols, f, ensure_ascii=False, indent=2)
    return mols

if __name__ == "__main__":
    expand_to_52()
