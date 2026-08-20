# -*- coding: utf-8 -*-
"""
Adds the remaining 9 molecules to reach 53 distinct molecules.
"""
import json, math

def add_remaining():
    with open("mols_database_52.json", "r", encoding="utf-8") as f:
        mols = json.load(f)

    # 1. Isopentane (2-Methylbutane)
    mols.append({
        "id": "isopentane", "name": "Isopentane (2-Metylbutan)", "iupac": "2-Methylbutane", "formula": "C5H12", "condensed": "CH(CH3)2-CH2-CH3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 72.15,
        "geometry": "Mạch phân nhánh tứ diện sp³", "hybridization": "sp³",
        "state": "Chất lỏng dễ bay hơi không màu", "boilingPoint": "27.8 °C", "meltingPoint": "-159.9 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Thế halogen ưu tiên C bậc 3 tạo 2-chloro-2-methylbutane.",
        "applications": "Dung môi tạo bọt xốp EPS cách nhiệt mút xốp.",
        "atoms": [
            {"element": "C", "x": -0.65, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -1},
            {"element": "C", "x": -1.65, "y": 1.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -1.25, "y": -1.35, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 0.75, "y": 0.25, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 1.75, "y": -0.90, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -0.45, "y": 0.15, "z": 1.05, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.68, "y": 0.85, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.50, "y": 1.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.50, "y": 1.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.32, "y": -1.25, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.95, "y": -1.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.95, "y": -1.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.85, "y": 0.88, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.85, "y": 0.88, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.75, "y": -0.55, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.62, "y": -1.52, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.62, "y": -1.52, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                  {"a1": 0, "a2": 5, "order": 1},
                  {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}, {"a1": 1, "a2": 8, "order": 1},
                  {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1}, {"a1": 2, "a2": 11, "order": 1},
                  {"a1": 3, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1},
                  {"a1": 4, "a2": 14, "order": 1}, {"a1": 4, "a2": 15, "order": 1}, {"a1": 4, "a2": 16, "order": 1}]
    })

    # 2. Pent-1-ene
    mols.append({
        "id": "pent_1_ene", "name": "Pent-1-ene (Pent-1-en)", "iupac": "Pent-1-ene", "formula": "C5H10", "condensed": "CH2=CH-(CH2)2-CH3",
        "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 70.13,
        "geometry": "Alkene đầu mạch kết hợp chuỗi propyl", "hybridization": "sp² và sp³",
        "state": "Chất lỏng không màu dễ cháy", "boilingPoint": "30.0 °C", "meltingPoint": "-165.2 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Làm mất màu dung dịch Brom nâu đỏ, phản ứng cộng HCl.",
        "applications": "Đồng trùng hợp sản xuất nhựa copolymer chuyên dụng.",
        "atoms": [
            {"element": "C", "x": -2.45, "y": -0.35, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
            {"element": "C", "x": -1.25, "y": 0.15, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.0, "y": -0.65, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 1.25, "y": 0.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 2.52, "y": -0.65, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -3.35, "y": 0.25, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.55, "y": -1.43, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.15, "y": 1.23, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -1.30, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -1.30, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 0.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 0.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 3.42, "y": -0.05, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.55, "y": -1.30, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.55, "y": -1.30, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                  {"a1": 0, "a2": 5, "order": 1}, {"a1": 0, "a2": 6, "order": 1},
                  {"a1": 1, "a2": 7, "order": 1},
                  {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1},
                  {"a1": 3, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1},
                  {"a1": 4, "a2": 12, "order": 1}, {"a1": 4, "a2": 13, "order": 1}, {"a1": 4, "a2": 14, "order": 1}]
    })

    # 3. Pent-1-yne
    mols.append({
        "id": "pent_1_yne", "name": "Pent-1-yne (Propylaxetilen)", "iupac": "Pent-1-yne", "formula": "C5H8", "condensed": "CH≡C-(CH2)2-CH3",
        "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 68.12,
        "geometry": "Ankin đầu mạch thẳng sp nối chuỗi propyl", "hybridization": "sp và sp³",
        "state": "Chất lỏng không màu dễ cháy", "boilingPoint": "40.2 °C", "meltingPoint": "-105.7 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Tác dụng dung dịch AgNO₃/NH₃ tạo kết tủa màu vàng nhạt CAg≡C-C₃H₇.",
        "applications": "Tổng hợp hữu cơ chọn lọc đồng phân lập thể.",
        "atoms": [
            {"element": "C", "x": -2.45, "y": 0.0, "z": 0.0, "hybrid": "sp", "valency": 4, "ox": -1},
            {"element": "C", "x": -1.25, "y": 0.0, "z": 0.0, "hybrid": "sp", "valency": 4, "ox": 0},
            {"element": "C", "x": 0.22, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 1.05, "y": 1.25, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 2.55, "y": 1.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -3.51, "y": 0.0, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.48, "y": -0.58, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.48, "y": -0.58, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.72, "y": 1.82, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.72, "y": 1.82, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 3.05, "y": 2.12, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.88, "y": 0.62, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.88, "y": 0.62, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 3}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                  {"a1": 0, "a2": 5, "order": 1},
                  {"a1": 2, "a2": 6, "order": 1}, {"a1": 2, "a2": 7, "order": 1},
                  {"a1": 3, "a2": 8, "order": 1}, {"a1": 3, "a2": 9, "order": 1},
                  {"a1": 4, "a2": 10, "order": 1}, {"a1": 4, "a2": 11, "order": 1}, {"a1": 4, "a2": 12, "order": 1}]
    })

    # 4. m-Xylene (meta-Xilen / 1,3-Dimetylbenzen)
    rc = 1.40
    atoms_mx = []
    bonds_mx = []
    for i in range(6):
        ang = i * math.pi / 3.0
        atoms_mx.append({"element": "C", "x": round(rc*math.cos(ang), 3), "y": round(rc*math.sin(ang), 3), "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1})
    for i in range(6):
        bonds_mx.append({"a1": i, "a2": (i+1)%6, "order": 2 if i%2==0 else 1})
    # methyl at 0 and 2
    for i in range(6):
        ang = i * math.pi / 3.0
        if i == 0 or i == 2:
            cx = round((rc+1.51)*math.cos(ang), 3)
            cy = round((rc+1.51)*math.sin(ang), 3)
            atoms_mx.append({"element": "C", "x": cx, "y": cy, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3})
            c_idx = len(atoms_mx)-1
            bonds_mx.append({"a1": i, "a2": c_idx, "order": 1})
            atoms_mx.append({"element": "H", "x": round(cx + 1.09*math.cos(ang), 3), "y": round(cy + 1.09*math.sin(ang), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds_mx.append({"a1": c_idx, "a2": len(atoms_mx)-1, "order": 1})
            atoms_mx.append({"element": "H", "x": cx, "y": cy, "z": 0.89, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds_mx.append({"a1": c_idx, "a2": len(atoms_mx)-1, "order": 1})
            atoms_mx.append({"element": "H", "x": cx, "y": cy, "z": -0.89, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds_mx.append({"a1": c_idx, "a2": len(atoms_mx)-1, "order": 1})
        else:
            atoms_mx.append({"element": "H", "x": round(2.48*math.cos(ang), 3), "y": round(2.48*math.sin(ang), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds_mx.append({"a1": i, "a2": len(atoms_mx)-1, "order": 1})

    mols.append({
        "id": "m_xylene", "name": "m-Xylene (meta-Xilen / 1,3-Dimetylbenzen)", "iupac": "1,3-Dimethylbenzene", "formula": "C8H10", "condensed": "1,3-(CH3)2C6H4",
        "group": "3. Hydrocarbon thơm (Arene)", "groupId": "arene", "molarMass": 106.17,
        "geometry": "Vòng thơm benzen thế 2 nhóm metyl ở vị trí meta (1,3)", "hybridization": "sp² và sp³",
        "state": "Chất lỏng không màu, mùi thơm nhẹ", "boilingPoint": "139.1 °C", "meltingPoint": "-47.9 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Oxy hóa bằng dung dịch KMnO₄ đun nóng tạo axit isophtalic C₆H₄(COOH)₂.",
        "applications": "Sản xuất axit isophtalic dùng làm nhựa polyester cách nhiệt và sợi aramid Nomex chống cháy lính cứu hỏa.",
        "atoms": atoms_mx, "bonds": bonds_mx
    })

    # 5. Ethylbenzene (Etylbenzen)
    atoms_eb = []
    bonds_eb = []
    for i in range(6):
        ang = i * math.pi / 3.0
        atoms_eb.append({"element": "C", "x": round(rc*math.cos(ang), 3), "y": round(rc*math.sin(ang), 3), "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1})
    for i in range(6):
        bonds_eb.append({"a1": i, "a2": (i+1)%6, "order": 2 if i%2==0 else 1})
    # ethyl group at 0
    atoms_eb.append({"element": "C", "x": 2.91, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2})
    bonds_eb.append({"a1": 0, "a2": len(atoms_eb)-1, "order": 1})
    atoms_eb.append({"element": "C", "x": 3.75, "y": 1.25, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3})
    bonds_eb.append({"a1": len(atoms_eb)-2, "a2": len(atoms_eb)-1, "order": 1})
    atoms_eb.append({"element": "H", "x": 3.05, "y": -0.62, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1})
    bonds_eb.append({"a1": 6, "a2": len(atoms_eb)-1, "order": 1})
    atoms_eb.append({"element": "H", "x": 3.05, "y": -0.62, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1})
    bonds_eb.append({"a1": 6, "a2": len(atoms_eb)-1, "order": 1})
    atoms_eb.append({"element": "H", "x": 4.82, "y": 1.05, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
    bonds_eb.append({"a1": 7, "a2": len(atoms_eb)-1, "order": 1})
    atoms_eb.append({"element": "H", "x": 3.55, "y": 1.85, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1})
    bonds_eb.append({"a1": 7, "a2": len(atoms_eb)-1, "order": 1})
    atoms_eb.append({"element": "H", "x": 3.55, "y": 1.85, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1})
    bonds_eb.append({"a1": 7, "a2": len(atoms_eb)-1, "order": 1})
    for i in range(1, 6):
        ang = i * math.pi / 3.0
        atoms_eb.append({"element": "H", "x": round(2.48*math.cos(ang), 3), "y": round(2.48*math.sin(ang), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
        bonds_eb.append({"a1": i, "a2": len(atoms_eb)-1, "order": 1})

    mols.append({
        "id": "ethylbenzene", "name": "Ethylbenzene (Etylbenzen)", "iupac": "Ethylbenzene", "formula": "C8H10", "condensed": "C6H5-C2H5",
        "group": "3. Hydrocarbon thơm (Arene)", "groupId": "arene", "molarMass": 106.17,
        "geometry": "Vòng benzen gắn nhánh etyl linh động", "hybridization": "sp² và sp³",
        "state": "Chất lỏng không màu, mùi giống xăng", "boilingPoint": "136.2 °C", "meltingPoint": "-95.0 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Đề hydro hóa ở 600°C xúc tác Fe₂O₃ tạo Styrene: C₆H₅-CH₂CH₃ → C₆H₅-CH=CH₂ + H₂",
        "applications": "99% sản lượng thế giới dùng để sản xuất monome Styrene (nguyên liệu làm nhựa Polystyrene PS).",
        "atoms": atoms_eb, "bonds": bonds_eb
    })

    # 6. Bromoethane (Etyl bromua)
    mols.append({
        "id": "bromoethane", "name": "Bromoethane (Etyl bromua)", "iupac": "Bromoethane", "formula": "C2H5Br", "condensed": "CH3-CH2-Br",
        "group": "4. Dẫn xuất Halogen", "groupId": "halogen", "molarMass": 108.97,
        "geometry": "Dẫn xuất monobrom no bậc 1", "hybridization": "sp³",
        "state": "Chất lỏng không màu, mùi thơm ete dễ bay hơi, nặng hơn nước (d = 1.46 g/cm³)", "boilingPoint": "38.4 °C", "meltingPoint": "-119.0 °C",
        "solubility": "Ít tan trong nước, tan tốt trong dung môi hữu cơ",
        "reactions": "1) Thủy phân trong dung dịch kiềm nóng: C₂H₅Br + NaOH → C₂H₅OH + NaBr\n2) Phản ứng tách HBr trong dung dịch kiềm cồn tạo Etylen:\nC₂H₅Br + KOH →(ancol, t°) CH₂=CH₂ + KBr + H₂O",
        "applications": "Tác nhân etyl hóa trong tổng hợp hữu cơ và dược phẩm.",
        "atoms": [
            {"element": "C", "x": -0.85, "y": -0.38, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 0.45, "y": 0.38, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -1},
            {"element": "Br", "x": 2.05, "y": -0.72, "z": 0.0, "hybrid": "sp³", "valency": 1, "ox": -1},
            {"element": "H", "x": -1.72, "y": 0.28, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.88, "y": -1.02, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.88, "y": -1.02, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.45, "y": 1.05, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.45, "y": 1.05, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1},
                  {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}, {"a1": 0, "a2": 5, "order": 1},
                  {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}]
    })

    # 7. Butan-1-ol (n-Butanol)
    mols.append({
        "id": "butan_1_ol", "name": "Butan-1-ol (Rượu butylic)", "iupac": "Butan-1-ol", "formula": "C4H10O", "condensed": "CH3-(CH2)2-CH2-OH",
        "group": "5. Alcohol & Phenol", "groupId": "alcohol_phenol", "molarMass": 74.12,
        "geometry": "Ancol bậc 1 mạch hở 4 carbon", "hybridization": "sp³",
        "state": "Chất lỏng không màu, mùi chuối rượu đặc trưng", "boilingPoint": "117.7 °C", "meltingPoint": "-89.8 °C",
        "solubility": "Tan vừa phải trong nước (khoảng 7.7 g/100 mL ở 20°C)",
        "reactions": "Este hóa với axit axetic tạo butyl axetat (este có mùi chuối chín ngào ngạt).",
        "applications": "Dung môi pha sơn phủ cao cấp, chất sản xuất butyl axetat và chất hóa dẻo.",
        "atoms": [
            {"element": "C", "x": -2.45, "y": -0.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -1.25, "y": 0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.0, "y": -0.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 1.25, "y": 0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -1},
            {"element": "O", "x": 2.38, "y": -0.32, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 3.18, "y": 0.22, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -3.32, "y": 0.38, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.48, "y": -0.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.48, "y": -0.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 1.18, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 1.18, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -0.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -0.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 1.18, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 1.18, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1},
                  {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1}, {"a1": 0, "a2": 8, "order": 1},
                  {"a1": 1, "a2": 9, "order": 1}, {"a1": 1, "a2": 10, "order": 1},
                  {"a1": 2, "a2": 11, "order": 1}, {"a1": 2, "a2": 12, "order": 1},
                  {"a1": 3, "a2": 13, "order": 1}, {"a1": 3, "a2": 14, "order": 1}]
    })

    # 8. Butan-2-one (Methyl Ethyl Ketone / MEK)
    mols.append({
        "id": "butan_2_one", "name": "Methyl Ethyl Ketone (MEK / Butan-2-on)", "iupac": "Butan-2-one", "formula": "C4H8O", "condensed": "CH3-CO-CH2-CH3",
        "group": "6. Aldehyde & Ketone", "groupId": "carbonyl", "molarMass": 72.11,
        "geometry": "Nhóm C=O liên kết nhóm metyl và etyl", "hybridization": "sp² và sp³",
        "state": "Chất lỏng không màu, mùi giống axeton và bạc hà ngọt, bay hơi nhanh", "boilingPoint": "79.6 °C", "meltingPoint": "-86.0 °C",
        "solubility": "Tan tốt trong nước (khoảng 27.5 g/100 mL)",
        "reactions": "Phản ứng iodoform tạo CHI₃ (nhờ nhóm CH₃-C=O); không tráng bạc.",
        "applications": "Dung môi công nghiệp chủ chốt để hòa tan nhựa vinyl, keo dán cao su, mực in và sơn bóng xe hơi.",
        "atoms": [
            {"element": "C", "x": -1.85, "y": -0.65, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -0.55, "y": 0.15, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +2},
            {"element": "O", "x": -0.52, "y": 1.38, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "C", "x": 0.72, "y": -0.65, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 2.02, "y": 0.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -2.72, "y": -0.01, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.88, "y": -1.30, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.88, "y": -1.30, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.70, "y": -1.30, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.70, "y": -1.30, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.88, "y": -0.52, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.05, "y": 0.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.05, "y": 0.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 2}, {"a1": 1, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                  {"a1": 0, "a2": 5, "order": 1}, {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1},
                  {"a1": 3, "a2": 8, "order": 1}, {"a1": 3, "a2": 9, "order": 1},
                  {"a1": 4, "a2": 10, "order": 1}, {"a1": 4, "a2": 11, "order": 1}, {"a1": 4, "a2": 12, "order": 1}]
    })

    # 9. Butanoic Acid (Axit butyric / Axit bơ)
    mols.append({
        "id": "butanoic_acid", "name": "Butanoic Acid (Axit butyric / Axit bơ)", "iupac": "Butanoic acid", "formula": "C4H8O2", "condensed": "CH3-(CH2)2-COOH",
        "group": "7. Carboxylic Acid", "groupId": "carboxylic_acid", "molarMass": 88.11,
        "geometry": "Axit no đơn chức mạch 4 carbon", "hybridization": "sp² và sp³",
        "state": "Chất lỏng nhờn không màu, MÙI BƠ THIU ÔI KHÓ CHỊU NỒNG NẶC", "boilingPoint": "163.7 °C", "meltingPoint": "-5.1 °C",
        "solubility": "Tan vô hạn trong nước",
        "reactions": "Este hóa với ethanol tạo ethyl butyrate có mùi thơm ngào ngạt của quả dứa chín:\nCH₃(CH₂)₂COOH + C₂H₅OH ⇌ CH₃(CH₂)₂COOC₂H₅ + H₂O",
        "applications": "Tổng hợp este etyl butyrat hương liệu dứa, chất bổ sung men tiêu hóa chăn nuôi gia súc.",
        "atoms": [
            {"element": "C", "x": -2.45, "y": -0.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -1.25, "y": 0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.0, "y": -0.28, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 1.25, "y": 0.45, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "O", "x": 1.35, "y": 1.68, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "O", "x": 2.32, "y": -0.38, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 3.12, "y": 0.15, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -3.32, "y": 0.38, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.48, "y": -0.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.48, "y": -0.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 1.18, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 1.18, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -0.92, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -0.92, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                  {"a1": 3, "a2": 4, "order": 2}, {"a1": 3, "a2": 5, "order": 1}, {"a1": 5, "a2": 6, "order": 1},
                  {"a1": 0, "a2": 7, "order": 1}, {"a1": 0, "a2": 8, "order": 1}, {"a1": 0, "a2": 9, "order": 1},
                  {"a1": 1, "a2": 10, "order": 1}, {"a1": 1, "a2": 11, "order": 1},
                  {"a1": 2, "a2": 12, "order": 1}, {"a1": 2, "a2": 13, "order": 1}]
    })

    print(f"GRAND TOTAL: {len(mols)} molecules in database!")
    with open("mols_database_complete_53.json", "w", encoding="utf-8") as f:
        json.dump(mols, f, ensure_ascii=False, indent=2)
    return mols

if __name__ == "__main__":
    add_remaining()
