# -*- coding: utf-8 -*-
"""
Full Generator for 55+ Organic Molecules with real 3D geometry & chemical data.
"""
import json, math, os

def build_all():
    # Import bases and add remaining
    from build_complete_chemistry_database import get_full_55_molecules
    mols = get_full_55_molecules()
    existing_ids = {m["id"] for m in mols}

    # Group 1 extra: Cyclopentane
    if "cyclopentane" not in existing_ids:
        r = 1.35
        atoms = []
        bonds = []
        for i in range(5):
            ang = i * 2 * math.pi / 5.0
            z = 0.15 if i % 2 == 0 else -0.15
            atoms.append({"element": "C", "x": round(r * math.cos(ang), 3), "y": round(r * math.sin(ang), 3), "z": z, "hybrid": "sp³", "valency": 4, "ox": -2})
        for i in range(5):
            bonds.append({"a1": i, "a2": (i+1)%5, "order": 1})
            ang = i * 2 * math.pi / 5.0
            cx, cy = atoms[i]["x"], atoms[i]["y"]
            atoms.append({"element": "H", "x": round(cx + 0.9*math.cos(ang), 3), "y": round(cy + 0.9*math.sin(ang), 3), "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds.append({"a1": i, "a2": len(atoms)-1, "order": 1})
            atoms.append({"element": "H", "x": round(cx + 0.9*math.cos(ang), 3), "y": round(cy + 0.9*math.sin(ang), 3), "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1})
            bonds.append({"a1": i, "a2": len(atoms)-1, "order": 1})
        mols.append({
            "id": "cyclopentane", "name": "Cyclopentane (Xiclopentan)", "iupac": "Cyclopentane", "formula": "C5H10", "condensed": "c-C5H10",
            "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 70.13,
            "geometry": "Cấu dạng phong bì gập nhẹ (Envelope conformation) giảm lực đẩy che khuất", "hybridization": "sp³",
            "state": "Chất lỏng không màu, mùi xăng", "boilingPoint": "49.2 °C", "meltingPoint": "-93.9 °C",
            "solubility": "Không tan trong nước", "reactions": "Phản ứng thế halogen (chiếu sáng).",
            "applications": "Dung môi tạo bọt xốp polyurethane cách nhiệt tủ lạnh.",
            "atoms": atoms, "bonds": bonds
        })

    # Group 4 extra: Dichloromethane, Tetrafluoroethylene
    if "dichloromethane" not in existing_ids:
        mols.append({
            "id": "dichloromethane", "name": "Dichloromethane (Metylen clorua / DCM)", "iupac": "Dichloromethane", "formula": "CH2Cl2", "condensed": "CH2Cl2",
            "group": "4. Dẫn xuất Halogen", "groupId": "halogen", "molarMass": 84.93,
            "geometry": "Tứ diện sp³ phân cực", "hybridization": "sp³",
            "state": "Chất lỏng không màu dễ bay hơi, nặng hơn nước (d = 1.33 g/cm³)", "boilingPoint": "39.6 °C", "meltingPoint": "-96.7 °C",
            "solubility": "Ít tan trong nước, hòa tan cực tốt chất hữu cơ",
            "reactions": "Bền nhiệt và không bắt lửa ở nhiệt độ phòng.",
            "applications": "Dung môi chiết xuất caffein từ hạt cà phê (cà phê decaf), tẩy sơn, sản xuất màng phim ảnh.",
            "atoms": [
                {"element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": 0},
                {"element": "Cl", "x": 1.25, "y": 0.0, "z": 1.15, "hybrid": "sp³", "valency": 1, "ox": -1},
                {"element": "Cl", "x": -1.25, "y": 0.0, "z": 1.15, "hybrid": "sp³", "valency": 1, "ox": -1},
                {"element": "H", "x": 0.0, "y": 0.95, "z": -0.75, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.0, "y": -0.95, "z": -0.75, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}]
        })

    if "tetrafluoroethylene" not in existing_ids:
        mols.append({
            "id": "tetrafluoroethylene", "name": "Tetrafluoroethylene (TFE)", "iupac": "Tetrafluoroethene", "formula": "C2F4", "condensed": "CF2=CF2",
            "group": "4. Dẫn xuất Halogen", "groupId": "halogen", "molarMass": 100.02,
            "geometry": "Mặt phẳng tam giác sp² đối xứng hoàn hảo", "hybridization": "sp²",
            "state": "Khí không màu, không mùi", "boilingPoint": "-76.3 °C", "meltingPoint": "-142.5 °C",
            "solubility": "Không tan trong nước",
            "reactions": "Trùng hợp tạo nhựa Teflon (PTFE): n CF₂=CF₂ → (-CF₂-CF₂-)n",
            "applications": "Sản xuất nhựa chống dính Teflon tráng lòng chảo chống dính, van chịu hóa chất và băng keo ren chống rò nước.",
            "atoms": [
                {"element": "C", "x": -0.67, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +2},
                {"element": "C", "x": 0.67, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +2},
                {"element": "F", "x": -1.35, "y": 1.15, "z": 0.0, "hybrid": "sp³", "valency": 1, "ox": -1},
                {"element": "F", "x": -1.35, "y": -1.15, "z": 0.0, "hybrid": "sp³", "valency": 1, "ox": -1},
                {"element": "F", "x": 1.35, "y": 1.15, "z": 0.0, "hybrid": "sp³", "valency": 1, "ox": -1},
                {"element": "F", "x": 1.35, "y": -1.15, "z": 0.0, "hybrid": "sp³", "valency": 1, "ox": -1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 1, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}]
        })

    # Group 7 extra: Acrylic acid
    if "acrylic_acid" not in existing_ids:
        mols.append({
            "id": "acrylic_acid", "name": "Acrylic Acid (Axit acrylic / Axit propenoic)", "iupac": "Prop-2-enoic acid", "formula": "C3H4O2", "condensed": "CH2=CH-COOH",
            "group": "7. Carboxylic Acid", "groupId": "carboxylic_acid", "molarMass": 72.06,
            "geometry": "Hệ liên hợp C=C-C=O phẳng hoàn toàn", "hybridization": "sp² (tất cả 3 C)",
            "state": "Chất lỏng không màu, mùi chua hắc sốc nồng", "boilingPoint": "141.2 °C", "meltingPoint": "13.0 °C",
            "solubility": "Tan vô hạn trong nước",
            "reactions": "1) Vừa làm quỳ tím hóa đỏ, vừa làm mất màu nước Brom ở đk thường:\nCH₂=CH-COOH + Br₂ → CH₂Br-CHBr-COOH\n2) Trùng hợp tạo polyacrylic acid (chất siêu hấp thụ nước trong tã bỉm trẻ em).",
            "applications": "Sản xuất polyme siêu thấm nước SAP (Super Absorbent Polymer) cho bỉm tã, sơn nước acrylic và keo dán dệt may.",
            "atoms": [
                {"element": "C", "x": -1.35, "y": -0.45, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
                {"element": "C", "x": -0.15, "y": 0.15, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 1.15, "y": -0.45, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
                {"element": "O", "x": 1.25, "y": -1.68, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
                {"element": "O", "x": 2.18, "y": 0.38, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": 3.02, "y": -0.12, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.25, "y": 0.15, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.45, "y": -1.53, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.05, "y": 1.23, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 1, "a2": 2, "order": 1},
                  {"a1": 2, "a2": 3, "order": 2}, {"a1": 2, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1},
                  {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1}, {"a1": 1, "a2": 8, "order": 1}]
        })

    # Group 8 extra: Methyl formate, Vinyl acetate
    if "methyl_formate" not in existing_ids:
        mols.append({
            "id": "methyl_formate", "name": "Methyl Formate (Metyl fomat)", "iupac": "Methyl methanoate", "formula": "C2H4O2", "condensed": "H-COO-CH3",
            "group": "8. Ester & Lipid", "groupId": "ester_lipid", "molarMass": 60.05,
            "geometry": "Este đơn giản nhất", "hybridization": "sp² và sp³",
            "state": "Chất lỏng không màu dễ bay hơi, mùi quả táo ngọt", "boilingPoint": "31.8 °C", "meltingPoint": "-99.0 °C",
            "solubility": "Tan vừa trong nước",
            "reactions": "THAM GIA PHẢN ỨNG TRÁNG BẠC (do chứa nhóm H-C=O của fomat):\nHCOOCH₃ + 2[Ag(NH₃)₂]OH → NH₄OCOOCH₃ + 2Ag↓ + 3NH₃ + H₂O",
            "applications": "Dung môi tạo bọt xốp, chất diệt nấm mốc ngũ cốc, trung gian sản xuất formamide.",
            "atoms": [
                {"element": "C", "x": -0.65, "y": 0.35, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +2},
                {"element": "O", "x": -0.55, "y": 1.55, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
                {"element": "O", "x": 0.35, "y": -0.55, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "C", "x": 1.72, "y": -0.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "H", "x": -1.65, "y": -0.15, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 2.25, "y": -1.10, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.95, "y": 0.42, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.95, "y": 0.42, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                      {"a1": 0, "a2": 4, "order": 1}, {"a1": 3, "a2": 5, "order": 1}, {"a1": 3, "a2": 6, "order": 1}, {"a1": 3, "a2": 7, "order": 1}]
        })

    if "vinyl_acetate" not in existing_ids:
        mols.append({
            "id": "vinyl_acetate", "name": "Vinyl Acetate (Vinyl axetat)", "iupac": "Ethenyl ethanoate", "formula": "C4H6O2", "condensed": "CH3-COO-CH=CH2",
            "group": "8. Ester & Lipid", "groupId": "ester_lipid", "molarMass": 86.09,
            "geometry": "Este chứa gốc không no vinyl", "hybridization": "sp² và sp³",
            "state": "Chất lỏng không màu, mùi hoa quả ngọt", "boilingPoint": "72.7 °C", "meltingPoint": "-93.0 °C",
            "solubility": "Ít tan trong nước",
            "reactions": "1) Thủy phân trong kiềm tạo anđehit axetic (do ancol vinyl không bền bị đồng phân hóa):\nCH₃COOCH=CH₂ + NaOH → CH₃COONa + CH₃CHO\n2) Trùng hợp tạo keo sữa PVA: n CH₃COOCH=CH₂ → (-CH(OCOCH₃)-CH₂-)n",
            "applications": "Sản xuất keo sữa PVA dán gỗ dán giấy (Polyvinyl acetate), nhũ tương sơn tường gốc nước.",
            "atoms": [
                {"element": "C", "x": -2.15, "y": -0.42, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
                {"element": "C", "x": -0.75, "y": 0.22, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
                {"element": "O", "x": -0.62, "y": 1.42, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
                {"element": "O", "x": 0.28, "y": -0.65, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "C", "x": 1.62, "y": -0.18, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
                {"element": "C", "x": 2.75, "y": -0.92, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
                {"element": "H", "x": -2.92, "y": 0.35, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.25, "y": -1.05, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.25, "y": -1.05, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.72, "y": 0.89, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 3.72, "y": -0.45, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 2.72, "y": -2.00, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 2}, {"a1": 1, "a2": 3, "order": 1},
                      {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 2},
                      {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1}, {"a1": 0, "a2": 8, "order": 1},
                      {"a1": 4, "a2": 9, "order": 1}, {"a1": 5, "a2": 10, "order": 1}, {"a1": 5, "a2": 11, "order": 1}]
        })

    # Group 9 extra: Dimethylamine, Trimethylamine
    if "dimethylamine" not in existing_ids:
        mols.append({
            "id": "dimethylamine", "name": "Dimethylamine (Dimetylamin)", "iupac": "N-Methylmethanamine", "formula": "C2H7N", "condensed": "(CH3)2NH",
            "group": "9. Amine & Amino Acid", "groupId": "amine_amino_acid", "molarMass": 45.08,
            "geometry": "Amine bậc 2 hình chóp tam giác tại N, lực bazơ mạnh hơn metylamin do hiệu ứng đẩy e của 2 nhóm metyl", "hybridization": "sp³",
            "state": "Khí không màu, mùi cá ươn khai nồng", "boilingPoint": "7.4 °C", "meltingPoint": "-92.2 °C",
            "solubility": "Tan rất nhiều trong nước",
            "reactions": "Tác dụng axit vô cơ tạo muối đimetylamoni clorua: (CH₃)₂NH + HCl → (CH₃)₂NH₂Cl",
            "applications": "Dung môi công nghiệp, chất làm mềm da thuộc, sản xuất chất kích thích tăng trưởng cây trồng.",
            "atoms": [
                {"element": "N", "x": 0.0, "y": 0.35, "z": 0.15, "hybrid": "sp³", "valency": 3, "ox": -3},
                {"element": "C", "x": -1.25, "y": -0.38, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": 1.25, "y": -0.38, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "H", "x": 0.0, "y": 1.35, "z": -0.15, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.12, "y": 0.28, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.28, "y": -1.02, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.28, "y": -1.02, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 2.12, "y": 0.28, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.28, "y": -1.02, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.28, "y": -1.02, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1},
                      {"a1": 1, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1},
                      {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1}]
        })

    if "trimethylamine" not in existing_ids:
        mols.append({
            "id": "trimethylamine", "name": "Trimethylamine (Trimetylamin)", "iupac": "N,N-Dimethylmethanamine", "formula": "C3H9N", "condensed": "(CH3)3N",
            "group": "9. Amine & Amino Acid", "groupId": "amine_amino_acid", "molarMass": 59.11,
            "geometry": "Amine bậc 3 hình chóp tam giác với 3 nhóm metyl hướng ra 3 phía", "hybridization": "sp³",
            "state": "Khí không màu, mùi tanh nồng cá chết thối", "boilingPoint": "2.9 °C", "meltingPoint": "-117.1 °C",
            "solubility": "Tan nhiều trong nước",
            "reactions": "Tác dụng axit tạo muối trimetylamoni clorua.",
            "applications": "Tác nhân tạo chất cholin và lecithin sinh học, hương liệu đánh lừa côn trùng hại lúa.",
            "atoms": [
                {"element": "N", "x": 0.0, "y": 0.0, "z": 0.25, "hybrid": "sp³", "valency": 3, "ox": -3},
                {"element": "C", "x": 0.0, "y": 1.42, "z": -0.22, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": -1.23, "y": -0.71, "z": -0.22, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "C", "x": 1.23, "y": -0.71, "z": -0.22, "hybrid": "sp³", "valency": 4, "ox": -2},
                {"element": "H", "x": 0.0, "y": 2.22, "z": 0.52, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.89, "y": 1.55, "z": -0.84, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.89, "y": 1.55, "z": -0.84, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -2.12, "y": -0.71, "z": 0.39, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.33, "y": -0.15, "z": -1.15, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.05, "y": -1.74, "z": -0.52, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 2.12, "y": -0.71, "z": 0.39, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.05, "y": -1.74, "z": -0.52, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.33, "y": -0.15, "z": -1.15, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1},
                      {"a1": 1, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1},
                      {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1},
                      {"a1": 3, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1}, {"a1": 3, "a2": 12, "order": 1}]
        })

    # Group 10 extra: D-Fructose (Ring furanose)
    if "fructose" not in existing_ids:
        mols.append({
            "id": "fructose", "name": "D-Fructose (Đường Quả / Levulose)", "iupac": "(2R,3S,4R,5R)-2-(hydroxymethyl)oxolane-2,3,4,5-tetrol", "formula": "C6H12O6", "condensed": "C6H12O6 (furanose)",
            "group": "10. Carbohydrate & Hợp chất sinh học", "groupId": "biomolecules", "molarMass": 180.16,
            "geometry": "Vòng furanose 5 cạnh (4C + 1O) cấu dạng gập", "hybridization": "sp³",
            "state": "Chất rắn kết tinh trắng, độ ngọt cao nhất trong các loại đường tự nhiên (ngọt gấp 1.7 lần saccarozơ)", "boilingPoint": "Phân hủy", "meltingPoint": "103.0 °C",
            "solubility": "Tan vô hạn trong nước",
            "reactions": "Trong môi trường kiềm, fructose chuyển hóa thuận nghịch thành glucose nên VẪN tham gia phản ứng tráng bạc và khử Cu(OH)₂:\nFructose ⇌(OH⁻) Glucose → 2Ag↓",
            "applications": "Đường hoa quả tự nhiên trong mật ong (chiếm 40%), quả chín (nho, xoài, chuối); chất tạo ngọt cho người tiểu đường hấp thu chậm hơn glucose.",
            "atoms": [
                {"element": "C", "x": 0.75, "y": 1.15, "z": 0.15, "hybrid": "sp³", "valency": 4, "ox": 0},
                {"element": "C", "x": -0.75, "y": 1.15, "z": -0.15, "hybrid": "sp³", "valency": 4, "ox": 0},
                {"element": "C", "x": -1.18, "y": -0.28, "z": 0.15, "hybrid": "sp³", "valency": 4, "ox": 0},
                {"element": "C", "x": 0.0, "y": -1.15, "z": -0.15, "hybrid": "sp³", "valency": 4, "ox": 0},
                {"element": "O", "x": 1.18, "y": -0.28, "z": 0.15, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "C", "x": 1.55, "y": 2.25, "z": -0.45, "hybrid": "sp³", "valency": 4, "ox": -1},
                {"element": "O", "x": 2.85, "y": 2.05, "z": 0.05, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": 3.42, "y": 2.75, "z": -0.22, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "O", "x": 0.95, "y": 1.35, "z": 1.52, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": 1.85, "y": 1.25, "z": 1.82, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "O", "x": -1.55, "y": 2.05, "z": 0.55, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": -1.55, "y": 2.95, "z": 0.22, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "O", "x": -2.45, "y": -0.65, "z": -0.25, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": -3.05, "y": -0.05, "z": 0.12, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "C", "x": 0.0, "y": -2.45, "z": 0.55, "hybrid": "sp³", "valency": 4, "ox": -1},
                {"element": "O", "x": 1.15, "y": -3.15, "z": 0.22, "hybrid": "sp³", "valency": 2, "ox": -2},
                {"element": "H", "x": 1.15, "y": -3.95, "z": 0.72, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.85, "y": 1.22, "z": -1.22, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -1.15, "y": -0.32, "z": 1.22, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.0, "y": -1.22, "z": -1.22, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.55, "y": 2.22, "z": -1.55, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 1.15, "y": 3.22, "z": -0.15, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": -0.88, "y": -3.02, "z": 0.32, "hybrid": "1s", "valency": 1, "ox": +1},
                {"element": "H", "x": 0.0, "y": -2.32, "z": 1.62, "hybrid": "1s", "valency": 1, "ox": +1}
            ],
            "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                      {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 0, "order": 1},
                      {"a1": 0, "a2": 5, "order": 1}, {"a1": 5, "a2": 6, "order": 1}, {"a1": 6, "a2": 7, "order": 1},
                      {"a1": 0, "a2": 8, "order": 1}, {"a1": 8, "a2": 9, "order": 1},
                      {"a1": 1, "a2": 10, "order": 1}, {"a1": 10, "a2": 11, "order": 1},
                      {"a1": 2, "a2": 12, "order": 1}, {"a1": 12, "a2": 13, "order": 1},
                      {"a1": 3, "a2": 14, "order": 1}, {"a1": 14, "a2": 15, "order": 1}, {"a1": 15, "a2": 16, "order": 1},
                      {"a1": 1, "a2": 17, "order": 1}, {"a1": 2, "a2": 18, "order": 1}, {"a1": 3, "a2": 19, "order": 1},
                      {"a1": 5, "a2": 20, "order": 1}, {"a1": 5, "a2": 21, "order": 1},
                      {"a1": 14, "a2": 22, "order": 1}, {"a1": 14, "a2": 23, "order": 1}]
        })

    print(f"Final Count of Organic Molecules: {len(mols)}")
    return mols

if __name__ == "__main__":
    mols = build_all()
    with open("mols_database_final.json", "w", encoding="utf-8") as f:
        json.dump(mols, f, ensure_ascii=False, indent=2)
    print("Database built and exported to mols_database_final.json")
