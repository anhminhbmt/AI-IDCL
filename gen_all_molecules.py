# -*- coding: utf-8 -*-
import json, math

def get_complete_database():
    mols = []

    def make_chain_alkane(n, name, iupac, formula, cond, desc, bp, mp, sol, rx, app):
        atoms = []
        bonds = []
        cc_len = 1.54
        ch_len = 1.09
        ang = 109.5 * math.pi / 180.0
        
        # Carbons along x-axis ziczac in xy plane
        for i in range(n):
            x = (i - (n-1)/2.0) * cc_len * math.sin(ang/2.0)
            y = (cc_len/2.0 * math.cos(ang/2.0)) if (i % 2 == 0) else (-cc_len/2.0 * math.cos(ang/2.0))
            z = 0.0
            atoms.append({"element": "C", "x": round(x, 3), "y": round(y, 3), "z": round(z, 3), "hybrid": "sp³", "valency": 4, "ox": -3 if (i==0 or i==n-1) else -2})
            if i > 0:
                bonds.append({"a1": i-1, "a2": i, "order": 1})
        
        # Hydrogens
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
            "geometry": "Mạch C cacbon ziczac, lai hóa tứ diện sp³ quanh mỗi nguyên tử C",
            "hybridization": "sp³ (Tất cả liên kết C-C và C-H là liên kết đơn σ bền vững)",
            "state": desc, "boilingPoint": bp, "meltingPoint": mp, "solubility": sol,
            "reactions": rx, "applications": app, "atoms": atoms, "bonds": bonds
        }

    # 1. Methane
    mols.append({
        "id": "methane", "name": "Methane (Metan)", "iupac": "Methane", "formula": "CH4", "condensed": "CH4",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 16.04,
        "geometry": "Tứ diện đều (Tetrahedral, góc H-C-H = 109.5°)", "hybridization": "sp³",
        "state": "Khí không màu, không mùi, nhẹ hơn không khí (d ≈ 0.55)",
        "boilingPoint": "-161.5 °C", "meltingPoint": "-182.5 °C",
        "solubility": "Kém tan trong nước, tan tốt trong dung môi hữu cơ (benzen, ete)",
        "reactions": "1) Thế clo: CH₄ + Cl₂ →(as) CH₃Cl + HCl\n2) Phản ứng cháy: CH₄ + 2O₂ → CO₂ + 2H₂O\n3) Nhiệt phân 1500°C: 2CH₄ → C₂H₂ + 3H₂",
        "applications": "Nhiên liệu khí thiên nhiên (CNG), khí Biogas, nguyên liệu tổng hợp khí than, methanol và phân đạm Urê.",
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
    mols.append(make_chain_alkane(2, "Ethane (Etan)", "Ethane", "C2H6", "CH3-CH3", "Khí không màu, dễ cháy", "-88.6 °C", "-182.8 °C", "Không tan trong nước", "Thế halogen: C₂H₆ + Cl₂ → C₂H₅Cl + HCl\nĐề hidro hóa thành Ethylene", "Nhiệt phân công nghiệp sản xuất Ethylene."))
    # 3. Propane
    mols.append(make_chain_alkane(3, "Propane (Propan)", "Propane", "C3H8", "CH3-CH2-CH3", "Khí không màu, dễ hóa lỏng", "-42.1 °C", "-187.7 °C", "Không tan trong nước", "Cháy tỏa nhiệt lớn: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O", "Khí gas đun nấu LPG, nhiên liệu động cơ."))
    # 4. Butane
    mols.append(make_chain_alkane(4, "Butane (Butan)", "Butane", "C4H10", "CH3-CH2-CH2-CH3", "Khí không màu, dễ nén hóa lỏng", "-0.5 °C", "-138.4 °C", "Không tan trong nước", "Cracking tạo ra C₂H₄ + C₂H₆ hoặc CH₄ + C₃H₆", "Nạp trong bật lửa gas, bình gas mini du lịch."))
    # 5. Pentane
    mols.append(make_chain_alkane(5, "Pentane (Pentan)", "Pentane", "C5H12", "CH3-(CH2)3-CH3", "Chất lỏng không màu, bay hơi nhanh", "36.1 °C", "-129.8 °C", "Kém tan trong nước, tan trong este", "Oxy hóa, cracking và reforming xúc tác", "Dung môi trong phòng thí nghiệm, sản xuất bọt xốp EPS."))
    # 6. Hexane
    mols.append(make_chain_alkane(6, "Hexane (Hexan)", "Hexane", "C6H14", "CH3-(CH2)4-CH3", "Chất lỏng không màu, mùi xăng nhẹ", "68.7 °C", "-95.3 °C", "Tan trong dung môi hữu cơ", "Đề hidro đóng vòng thành benzen (reforming)", "Dung môi trích ly dầu thực vật (dầu đậu nành), dung môi keo dán."))
    # 7. Octane
    mols.append(make_chain_alkane(8, "Octane (Octan)", "Octane", "C8H18", "CH3-(CH2)6-CH3", "Chất lỏng không màu trong suốt", "125.6 °C", "-56.8 °C", "Không tan trong nước", "Cháy sinh công cơ học: 2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O", "Chuẩn đo lường chỉ số Octane chống kích nổ của xăng dầu."))

    # 8. Isobutane (2-Methylpropane)
    mols.append({
        "id": "isobutane", "name": "Isobutane (2-Metylpropan)", "iupac": "2-Methylpropane", "formula": "C4H10", "condensed": "CH(CH3)3",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 58.12,
        "geometry": "C trung tâm liên kết với 3 nhóm CH3 dạng chân vạc", "hybridization": "sp³",
        "state": "Khí không màu, dễ hóa lỏng", "boilingPoint": "-11.7 °C", "meltingPoint": "-159.6 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Thế clo ưu tiên vị trí C bậc 3 tạo 2-chloro-2-methylpropane với hiệu suất vượt trội.",
        "applications": "Khí gas lạnh thân thiện môi trường R-600a thay thế CFC trong tủ lạnh hiện đại.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.2, "hybrid": "sp³", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.0, "y": 1.45, "z": -0.3, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -1.26, "y": -0.73, "z": -0.3, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 1.26, "y": -0.73, "z": -0.3, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": 0.0, "y": 0.0, "z": 1.28, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": 2.25, "z": 0.44, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.89, "y": 1.55, "z": -0.92, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.89, "y": 1.55, "z": -0.92, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.15, "y": -0.73, "z": 0.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.34, "y": -0.15, "z": -1.22, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.08, "y": -1.76, "z": -0.61, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.15, "y": -0.73, "z": 0.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.08, "y": -1.76, "z": -0.61, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.34, "y": -0.15, "z": -1.22, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1},
                  {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1},
                  {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1},
                  {"a1": 3, "a2": 11, "order": 1}, {"a1": 3, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1}]
    })

    # 9. Neopentane (2,2-Dimethylpropane)
    mols.append({
        "id": "neopentane", "name": "Neopentane (2,2-Dimetylpropan)", "iupac": "2,2-Dimethylpropane", "formula": "C5H12", "condensed": "C(CH3)4",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 72.15,
        "geometry": "Đối xứng cầu hoàn hảo, C bậc 4 ở trung tâm nối 4 nhóm metyl tứ diện", "hybridization": "sp³",
        "state": "Khí/Chất lỏng dễ bay hơi, điểm sôi thấp nhất trong các đồng phân C5", "boilingPoint": "9.5 °C", "meltingPoint": "-16.6 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Chỉ có 1 vị trí phản ứng thế duy nhất (12 nguyên tử H hoàn toàn tương đương).",
        "applications": "Nhiên liệu tiêu chuẩn, tổng hợp hữu cơ đặc biệt.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "C", "x": 0.89, "y": 0.89, "z": 0.89, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -0.89, "y": -0.89, "z": 0.89, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -0.89, "y": 0.89, "z": -0.89, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 0.89, "y": -0.89, "z": -0.89, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": 1.45, "y": 1.45, "z": 0.16, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.58, "y": 0.28, "z": 1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.28, "y": 1.58, "z": 1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.45, "y": -1.45, "z": 0.16, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.58, "y": -0.28, "z": 1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.28, "y": -1.58, "z": 1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.45, "y": 1.45, "z": -0.16, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.58, "y": 0.28, "z": -1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.28, "y": 1.58, "z": -1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.45, "y": -1.45, "z": -0.16, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.58, "y": -0.28, "z": -1.48, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.28, "y": -1.58, "z": -1.48, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1},
                  {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1},
                  {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1},
                  {"a1": 3, "a2": 11, "order": 1}, {"a1": 3, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1},
                  {"a1": 4, "a2": 14, "order": 1}, {"a1": 4, "a2": 15, "order": 1}, {"a1": 4, "a2": 16, "order": 1}]
    })

    # 10. Cyclopropane
    mols.append({
        "id": "cyclopropane", "name": "Cyclopropane (Xiclopropan)", "iupac": "Cyclopropane", "formula": "C3H6", "condensed": "c-C3H6",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 42.08,
        "geometry": "Tam giác đều phẳng, góc C-C-C = 60° (sức căng vòng Bayer cực lớn, liên kết quả chuối banana bond)", "hybridization": "sp³ bị biến dạng",
        "state": "Khí không màu, mùi ete ngọt", "boilingPoint": "-32.8 °C", "meltingPoint": "-127.6 °C",
        "solubility": "Kém tan trong nước",
        "reactions": "Dễ dàng tham gia phản ứng CỘNG MỞ VÒNG với H₂ (Ni, 80°C) và Br₂ (làm mất màu dd brom):\nc-C₃H₆ + Br₂ → Br-CH₂-CH₂-CH₂-Br",
        "applications": "Từng dùng làm thuốc mê hít phẫu thuật, chất trung gian tổng hợp dược chất.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.87, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": -0.75, "y": -0.43, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.75, "y": -0.43, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "H", "x": 0.0, "y": 1.45, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": 1.45, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.26, "y": -0.72, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.26, "y": -0.72, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.26, "y": -0.72, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.26, "y": -0.72, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 0, "order": 1},
                  {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1},
                  {"a1": 1, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1},
                  {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1}]
    })

    # 11. Cyclohexane (Chair conformation)
    mols.append({
        "id": "cyclohexane", "name": "Cyclohexane - Cấu dạng Ghế (Xiclohexan)", "iupac": "Cyclohexane", "formula": "C6H12", "condensed": "c-C6H12",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 84.16,
        "geometry": "Cấu dạng ghế (Chair conformation) bền nhất, góc liên kết chuẩn 109.5° hoàn toàn không có sức căng vòng", "hybridization": "sp³",
        "state": "Chất lỏng không màu, mùi giống xăng nhẹ", "boilingPoint": "80.7 °C", "meltingPoint": "6.5 °C",
        "solubility": "Không tan trong nước, tan vô hạn trong ete, cloroform",
        "reactions": "1) Phản ứng thế halogen (chiếu sáng): C₆H₁₂ + Cl₂ → C₆H₁₁Cl + HCl\n2) Đề hiđro hóa thành benzen: C₆H₁₂ →(Pt, t°) C₆H₆ + 3H₂",
        "applications": "Dung môi không phân cực quan trọng; nguyên liệu oxy hóa sản xuất axit adipic và caprolactam (sản xuất tơ nilon-6,6 và nilon-6).",
        "atoms": [
            {"element": "C", "x": 1.26, "y": 0.73, "z": 0.25, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.0, "y": 1.45, "z": -0.25, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": -1.26, "y": 0.73, "z": 0.25, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": -1.26, "y": -0.73, "z": -0.25, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.0, "y": -1.45, "z": 0.25, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 1.26, "y": -0.73, "z": -0.25, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "H", "x": 1.28, "y": 0.74, "z": 1.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.16, "y": 1.25, "z": -0.12, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": 1.48, "z": -1.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": 2.49, "z": 0.12, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.28, "y": 0.74, "z": 1.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.16, "y": 1.25, "z": -0.12, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.28, "y": -0.74, "z": -1.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.16, "y": -1.25, "z": 0.12, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -1.48, "z": 1.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -2.49, "z": -0.12, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.28, "y": -0.74, "z": -1.33, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.16, "y": -1.25, "z": 0.12, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                  {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1}, {"a1": 5, "a2": 0, "order": 1},
                  {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1},
                  {"a1": 1, "a2": 8, "order": 1}, {"a1": 1, "a2": 9, "order": 1},
                  {"a1": 2, "a2": 10, "order": 1}, {"a1": 2, "a2": 11, "order": 1},
                  {"a1": 3, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1},
                  {"a1": 4, "a2": 14, "order": 1}, {"a1": 4, "a2": 15, "order": 1},
                  {"a1": 5, "a2": 16, "order": 1}, {"a1": 5, "a2": 17, "order": 1}]
    })

    print(f"Loaded base molecules. Total so far: {len(mols)}")
    return mols

if __name__ == "__main__":
    get_complete_database()
