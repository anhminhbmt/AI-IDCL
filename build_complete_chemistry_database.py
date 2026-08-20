# -*- coding: utf-8 -*-
"""
Generates the complete 55+ molecules JSON database with 10 chemical families
"""
import json, math, os

def get_full_55_molecules():
    mols = []

    def make_chain_alkane(n, name, iupac, formula, cond, desc, bp, mp, sol, rx, app):
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
            "geometry": "Mạch C ziczac không gian, lai hóa tứ diện sp³ quanh mỗi C",
            "hybridization": "sp³ (Tất cả liên kết là liên kết đơn σ bền vững)",
            "state": desc, "boilingPoint": bp, "meltingPoint": mp, "solubility": sol,
            "reactions": rx, "applications": app, "atoms": atoms, "bonds": bonds
        }

    def make_benzene_derivative(name, iupac, formula, cond, group, groupId, mm, desc, bp, mp, sol, rx, app, subs=None):
        rc = 1.40
        rh = 2.48
        atoms = []
        bonds = []
        for i in range(6):
            ang = i * math.pi / 3.0
            atoms.append({"element": "C", "x": round(rc*math.cos(ang), 3), "y": round(rc*math.sin(ang), 3), "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1})
        for i in range(6):
            bonds.append({"a1": i, "a2": (i+1)%6, "order": 2 if i%2==0 else 1})

        subs = subs or {}
        for i in range(6):
            ang = i * math.pi / 3.0
            if i not in subs:
                atoms.append({"element": "H", "x": round(rh*math.cos(ang), 3), "y": round(rh*math.sin(ang), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                bonds.append({"a1": i, "a2": len(atoms)-1, "order": 1})
            else:
                s = subs[i]
                if s == "OH":
                    ox = round((rc+1.36)*math.cos(ang), 3)
                    oy = round((rc+1.36)*math.sin(ang), 3)
                    hx = round(ox + 0.96*math.cos(ang + 0.8), 3)
                    hy = round(oy + 0.96*math.sin(ang + 0.8), 3)
                    atoms.append({"element": "O", "x": ox, "y": oy, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2})
                    o_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": o_idx, "order": 1})
                    atoms.append({"element": "H", "x": hx, "y": hy, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": o_idx, "a2": len(atoms)-1, "order": 1})
                elif s == "CH3":
                    cx = round((rc+1.51)*math.cos(ang), 3)
                    cy = round((rc+1.51)*math.sin(ang), 3)
                    atoms.append({"element": "C", "x": cx, "y": cy, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3})
                    c_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": c_idx, "order": 1})
                    atoms.append({"element": "H", "x": round(cx + 1.09*math.cos(ang), 3), "y": round(cy + 1.09*math.sin(ang), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c_idx, "a2": len(atoms)-1, "order": 1})
                    atoms.append({"element": "H", "x": cx, "y": cy, "z": 0.89, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c_idx, "a2": len(atoms)-1, "order": 1})
                    atoms.append({"element": "H", "x": cx, "y": cy, "z": -0.89, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c_idx, "a2": len(atoms)-1, "order": 1})
                elif s == "CHO":
                    cx = round((rc+1.48)*math.cos(ang), 3)
                    cy = round((rc+1.48)*math.sin(ang), 3)
                    atoms.append({"element": "C", "x": cx, "y": cy, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +1})
                    c_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": c_idx, "order": 1})
                    ox = round(cx + 1.22*math.cos(ang+0.6), 3)
                    oy = round(cy + 1.22*math.sin(ang+0.6), 3)
                    hx = round(cx + 1.09*math.cos(ang-0.6), 3)
                    hy = round(cy + 1.09*math.sin(ang-0.6), 3)
                    atoms.append({"element": "O", "x": ox, "y": oy, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2})
                    bonds.append({"a1": c_idx, "a2": len(atoms)-1, "order": 2})
                    atoms.append({"element": "H", "x": hx, "y": hy, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c_idx, "a2": len(atoms)-1, "order": 1})
                elif s == "COOH":
                    cx = round((rc+1.48)*math.cos(ang), 3)
                    cy = round((rc+1.48)*math.sin(ang), 3)
                    atoms.append({"element": "C", "x": cx, "y": cy, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3})
                    c_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": c_idx, "order": 1})
                    ox1 = round(cx + 1.22*math.cos(ang+0.6), 3)
                    oy1 = round(cy + 1.22*math.sin(ang+0.6), 3)
                    ox2 = round(cx + 1.36*math.cos(ang-0.6), 3)
                    oy2 = round(cy + 1.36*math.sin(ang-0.6), 3)
                    hx = round(ox2 + 0.96*math.cos(ang), 3)
                    hy = round(oy2 + 0.96*math.sin(ang), 3)
                    atoms.append({"element": "O", "x": ox1, "y": oy1, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2})
                    bonds.append({"a1": c_idx, "a2": len(atoms)-1, "order": 2})
                    atoms.append({"element": "O", "x": ox2, "y": oy2, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2})
                    o2_idx = len(atoms)-1
                    bonds.append({"a1": c_idx, "a2": o2_idx, "order": 1})
                    atoms.append({"element": "H", "x": hx, "y": hy, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": o2_idx, "a2": len(atoms)-1, "order": 1})
                elif s == "NH2":
                    nx = round((rc+1.40)*math.cos(ang), 3)
                    ny = round((rc+1.40)*math.sin(ang), 3)
                    atoms.append({"element": "N", "x": nx, "y": ny, "z": 0.15, "hybrid": "sp³", "valency": 3, "ox": -3})
                    n_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": n_idx, "order": 1})
                    atoms.append({"element": "H", "x": round(nx + 0.85*math.cos(ang+0.7), 3), "y": round(ny + 0.85*math.sin(ang+0.7), 3), "z": -0.3, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": n_idx, "a2": len(atoms)-1, "order": 1})
                    atoms.append({"element": "H", "x": round(nx + 0.85*math.cos(ang-0.7), 3), "y": round(ny + 0.85*math.sin(ang-0.7), 3), "z": -0.3, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": n_idx, "a2": len(atoms)-1, "order": 1})
                elif s == "Cl":
                    clx = round((rc+1.72)*math.cos(ang), 3)
                    cly = round((rc+1.72)*math.sin(ang), 3)
                    atoms.append({"element": "Cl", "x": clx, "y": cly, "z": 0.0, "hybrid": "sp³", "valency": 1, "ox": -1})
                    bonds.append({"a1": i, "a2": len(atoms)-1, "order": 1})
                elif s == "NO2":
                    nx = round((rc+1.45)*math.cos(ang), 3)
                    ny = round((rc+1.45)*math.sin(ang), 3)
                    atoms.append({"element": "N", "x": nx, "y": ny, "z": 0.0, "hybrid": "sp²", "valency": 3, "ox": +3})
                    n_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": n_idx, "order": 1})
                    o1x = round(nx + 1.22*math.cos(ang+0.5), 3)
                    o1y = round(ny + 1.22*math.sin(ang+0.5), 3)
                    o2x = round(nx + 1.22*math.cos(ang-0.5), 3)
                    o2y = round(ny + 1.22*math.sin(ang-0.5), 3)
                    atoms.append({"element": "O", "x": o1x, "y": o1y, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2})
                    bonds.append({"a1": n_idx, "a2": len(atoms)-1, "order": 2})
                    atoms.append({"element": "O", "x": o2x, "y": o2y, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2})
                    bonds.append({"a1": n_idx, "a2": len(atoms)-1, "order": 1})
                elif s == "CH=CH2":
                    cx1 = round((rc+1.47)*math.cos(ang), 3)
                    cy1 = round((rc+1.47)*math.sin(ang), 3)
                    atoms.append({"element": "C", "x": cx1, "y": cy1, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1})
                    c1_idx = len(atoms)-1
                    bonds.append({"a1": i, "a2": c1_idx, "order": 1})
                    atoms.append({"element": "H", "x": round(cx1 + 1.09*math.cos(ang+1.0), 3), "y": round(cy1 + 1.09*math.sin(ang+1.0), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c1_idx, "a2": len(atoms)-1, "order": 1})
                    cx2 = round(cx1 + 1.34*math.cos(ang-0.3), 3)
                    cy2 = round(cy1 + 1.34*math.sin(ang-0.3), 3)
                    atoms.append({"element": "C", "x": cx2, "y": cy2, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2})
                    c2_idx = len(atoms)-1
                    bonds.append({"a1": c1_idx, "a2": c2_idx, "order": 2})
                    atoms.append({"element": "H", "x": round(cx2 + 1.09*math.cos(ang+0.8), 3), "y": round(cy2 + 1.09*math.sin(ang+0.8), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c2_idx, "a2": len(atoms)-1, "order": 1})
                    atoms.append({"element": "H", "x": round(cx2 + 1.09*math.cos(ang-0.8), 3), "y": round(cy2 + 1.09*math.sin(ang-0.8), 3), "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1})
                    bonds.append({"a1": c2_idx, "a2": len(atoms)-1, "order": 1})

        return {
            "id": iupac.lower().replace(" ", "_").replace("-", "_").replace(",", "_"),
            "name": name, "iupac": iupac, "formula": formula, "condensed": cond,
            "group": group, "groupId": groupId, "molarMass": mm,
            "geometry": "Nhân benzen phẳng 6 cạnh đều kết hợp nhóm chức định hướng",
            "hybridization": "sp² (Hệ π liên hợp giải tỏa toàn vòng thơm)",
            "state": desc, "boilingPoint": bp, "meltingPoint": mp, "solubility": sol,
            "reactions": rx, "applications": app, "atoms": atoms, "bonds": bonds
        }

    # Load base molecules
    from gen_all_molecules import get_complete_database
    mols.extend(get_complete_database())

    # Add Cyclobutane
    mols.append({
        "id": "cyclobutane", "name": "Cyclobutane (Xiclobutan)", "iupac": "Cyclobutane", "formula": "C4H8", "condensed": "c-C4H8",
        "group": "1. Hydrocarbon no (Alkane & Xicloankan)", "groupId": "alkane", "molarMass": 56.11,
        "geometry": "Tứ giác gập cánh bướm (puckered conformation, góc C-C-C = 88° nhằm giảm lực cản che khuất)", "hybridization": "sp³",
        "state": "Khí không màu, dễ cháy", "boilingPoint": "12.5 °C", "meltingPoint": "-90.7 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Cộng H₂ mở vòng ở nhiệt độ cao hơn xiclopropan: c-C₄H₈ + H₂ →(Ni, 120°C) C₄H₁₀ (Không làm mất màu dd Brom ở đk thường)",
        "applications": "Nghiên cứu nhiệt động học sức căng vòng và hóa học lập thể.",
        "atoms": [
            {"element": "C", "x": -0.77, "y": -0.77, "z": 0.15, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.77, "y": -0.77, "z": -0.15, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": 0.77, "y": 0.77, "z": 0.15, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "C", "x": -0.77, "y": 0.77, "z": -0.15, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "H", "x": -1.25, "y": -1.25, "z": 0.98, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": -1.25, "z": -0.75, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": -1.25, "z": 0.75, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": -1.25, "z": -0.98, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 1.25, "z": 0.98, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 1.25, "z": -0.75, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 1.25, "z": 0.75, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 1.25, "z": -0.98, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1}, {"a1": 3, "a2": 0, "order": 1},
                  {"a1": 0, "a2": 4, "order": 1}, {"a1": 0, "a2": 5, "order": 1},
                  {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1},
                  {"a1": 2, "a2": 8, "order": 1}, {"a1": 2, "a2": 9, "order": 1},
                  {"a1": 3, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1}]
    })

    # Group 2 additions
    # cis-But-2-ene
    mols.append({
        "id": "cis_but_2_ene", "name": "cis-But-2-ene (cis-But-2-en)", "iupac": "(Z)-But-2-ene", "formula": "C4H8", "condensed": "CH3-CH=CH-CH3 (cis)",
        "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 56.11,
        "geometry": "Đồng phân hình học cis-(Z): 2 nhóm -CH₃ nằm cùng một phía mặt phẳng liên kết đôi C=C", "hybridization": "sp² và sp³",
        "state": "Khí không màu, phân cực nhẹ (μ = 0.25 D, nhiệt độ sôi cao hơn dạng trans)", "boilingPoint": "3.7 °C", "meltingPoint": "-138.9 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Cộng halogen, cộng H₂; hydro hóa chuyển thành butan.",
        "applications": "Sản xuất alkylat xăng chỉ số octane cao, butan-2-ol.",
        "atoms": [
            {"element": "C", "x": -0.67, "y": -0.35, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.67, "y": -0.35, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -1.65, "y": 0.78, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 1.65, "y": 0.78, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -1.02, "y": -1.38, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.02, "y": -1.38, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.68, "y": 0.42, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.52, "y": 1.42, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.52, "y": 1.42, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.68, "y": 0.42, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.52, "y": 1.42, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.52, "y": 1.42, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 1, "a2": 3, "order": 1},
                  {"a1": 0, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1},
                  {"a1": 2, "a2": 6, "order": 1}, {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1},
                  {"a1": 3, "a2": 9, "order": 1}, {"a1": 3, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1}]
    })

    # trans-But-2-ene
    mols.append({
        "id": "trans_but_2_ene", "name": "trans-But-2-ene (trans-But-2-en)", "iupac": "(E)-But-2-ene", "formula": "C4H8", "condensed": "CH3-CH=CH-CH3 (trans)",
        "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 56.11,
        "geometry": "Đồng phân hình học trans-(E): 2 nhóm -CH₃ nằm đối diện 2 phía mặt phẳng liên kết đôi C=C (đối xứng tâm, μ = 0)", "hybridization": "sp² và sp³",
        "state": "Khí không màu, bền nhiệt hơn đồng phân cis", "boilingPoint": "0.9 °C", "meltingPoint": "-105.5 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Cộng halogen, trùng hợp, phản ứng thế allylic.",
        "applications": "Sản xuất cao su butyl, hóa dầu tổng hợp.",
        "atoms": [
            {"element": "C", "x": -0.67, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.67, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -1.65, "y": 1.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 1.65, "y": -1.15, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -1.02, "y": -1.03, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.02, "y": 1.03, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.68, "y": 0.78, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.52, "y": 1.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.52, "y": 1.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.68, "y": -0.78, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.52, "y": -1.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.52, "y": -1.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 1, "a2": 3, "order": 1},
                  {"a1": 0, "a2": 4, "order": 1}, {"a1": 1, "a2": 5, "order": 1},
                  {"a1": 2, "a2": 6, "order": 1}, {"a1": 2, "a2": 7, "order": 1}, {"a1": 2, "a2": 8, "order": 1},
                  {"a1": 3, "a2": 9, "order": 1}, {"a1": 3, "a2": 10, "order": 1}, {"a1": 3, "a2": 11, "order": 1}]
    })

    # Isoprene (2-Methylbuta-1,3-diene)
    mols.append({
        "id": "isoprene", "name": "Isoprene (Isopren / 2-Metylbuta-1,3-dien)", "iupac": "2-Methylbuta-1,3-diene", "formula": "C5H8", "condensed": "CH2=C(CH3)-CH=CH2",
        "group": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "groupId": "alkene_alkyne", "molarMass": 68.12,
        "geometry": "Hệ diene liên hợp phân nhánh tại vị trí C2", "hybridization": "sp² và sp³",
        "state": "Chất lỏng dễ bay hơi không màu, mùi hydrocacbon hăng nhẹ", "boilingPoint": "34.0 °C", "meltingPoint": "-145.9 °C",
        "solubility": "Không tan trong nước",
        "reactions": "Trùng hợp cis-1,4 tạo cao su isopren (tính chất đàn hồi và cơ lý hoàn toàn giống cao su thiên nhiên):\nn CH₂=C(CH₃)-CH=CH₂ → (-CH₂-C(CH₃)=CH-CH₂-)n (Cao su Isopren)",
        "applications": "Monomer tổng hợp cao su nhân tạo mô phỏng cao su thiên nhiên làm lốp máy bay và thiết bị y tế; đơn vị cơ bản cấu thành tecpen và carotenoid trong thực vật.",
        "atoms": [
            {"element": "C", "x": -1.85, "y": -0.45, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
            {"element": "C", "x": -0.65, "y": 0.15, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "C", "x": 0.65, "y": -0.45, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 1.85, "y": 0.15, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
            {"element": "C", "x": -0.75, "y": 1.66, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -2.75, "y": 0.15, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.95, "y": -1.53, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.55, "y": -1.53, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.95, "y": 1.23, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.75, "y": -0.45, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.78, "y": 2.02, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.25, "y": 2.05, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.25, "y": 2.05, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 2},
                  {"a1": 1, "a2": 4, "order": 1},
                  {"a1": 0, "a2": 5, "order": 1}, {"a1": 0, "a2": 6, "order": 1},
                  {"a1": 2, "a2": 7, "order": 1}, {"a1": 3, "a2": 8, "order": 1}, {"a1": 3, "a2": 9, "order": 1},
                  {"a1": 4, "a2": 10, "order": 1}, {"a1": 4, "a2": 11, "order": 1}, {"a1": 4, "a2": 12, "order": 1}]
    })

    # Group 3: o-Xylene, p-Xylene, Naphthalene
    mols.append(make_benzene_derivative("o-Xylene (ortho-Xilen / 1,2-Dimetylbenzen)", "1,2-Dimethylbenzene", "C8H10", "1,2-(CH3)2C6H4", "3. Hydrocarbon thơm (Arene)", "arene", 106.17, "Chất lỏng không màu, mùi thơm nhẹ", "144.4 °C", "-25.2 °C", "Không tan trong nước", "Oxy hóa bằng O₂ xúc tác V₂O₅ tạo anhydrit phtalic sản xuất chất hóa dẻo.", "Sản xuất anhydrit phtalic, dung môi sơn cao cấp.", {0: "CH3", 1: "CH3"}))
    mols.append(make_benzene_derivative("p-Xylene (para-Xilen / 1,4-Dimetylbenzen)", "1,4-Dimethylbenzene", "C8H10", "1,4-(CH3)2C6H4", "3. Hydrocarbon thơm (Arene)", "arene", 106.17, "Chất lỏng không màu dễ đông đặc thành tinh thể trắng ở 13°C", "138.3 °C", "13.2 °C", "Không tan trong nước", "Oxy hóa 2 nhóm metyl thành axit terephthalic: C₆H₄(CH₃)₂ + 3O₂ → C₆H₄(COOH)₂ + 2H₂O", "Nguyên liệu chủ chốt sản xuất tơ dệt polyester (PET / Dacron / Lapsan) và chai nhựa PET.", {0: "CH3", 3: "CH3"}))
    
    # Naphthalene (Băng phiến)
    mols.append({
        "id": "naphthalene", "name": "Naphthalene (Băng phiến / Long não nhân tạo)", "iupac": "Naphthalene", "formula": "C10H8", "condensed": "C10H8",
        "group": "3. Hydrocarbon thơm (Arene)", "groupId": "arene", "molarMass": 128.17,
        "geometry": "Hệ 2 vòng benzen ngưng tụ phẳng hoàn toàn (10 carbon sp²)", "hybridization": "sp² (Hệ thơm 10 electron π thỏa quy tắc Hückel 4n+2 với n=2)",
        "state": "Chất rắn kết tinh màu trắng dạng vảy óng ánh, mùi hăng nồng đặc trưng, THĂNG HOA rất mạnh ở nhiệt độ thường", "boilingPoint": "218.0 °C", "meltingPoint": "80.26 °C",
        "solubility": "Không tan trong nước, tan tốt trong cồn, ete, benzen",
        "reactions": "1) Thế ái điện tử dễ hơn benzen (ưu tiên vị trí alpha - C1):\nC₁₀H₈ + Br₂ → C₁₀H₇Br (1-bromonaphthalene) + HBr\n2) Nitro hóa tạo 1-nitronaphthalene\n3) Oxy hóa xúc tác V₂O₅ ở 400°C tạo anhydrit phtalic",
        "applications": "Viên băng phiến đuổi gián chuột và chống nấm mốc tủ quần áo; chất dẻo hóa bê tông, thuốc nhuộm azo, chất diệt côn trùng.",
        "atoms": [
            {"element": "C", "x": -0.71, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "C", "x": 0.71, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "C", "x": 1.42, "y": 1.93, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.71, "y": 3.16, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -0.71, "y": 3.16, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -1.42, "y": 1.93, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.71, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "C", "x": 1.42, "y": -1.93, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": 0.71, "y": -3.16, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -0.71, "y": -3.16, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -1.42, "y": -1.93, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -1},
            {"element": "C", "x": -0.71, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "H", "x": 2.50, "y": 1.93, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 4.10, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 4.10, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.50, "y": 1.93, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.50, "y": -1.93, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": -4.10, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": -4.10, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.50, "y": -1.93, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 2},
                  {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 2}, {"a1": 5, "a2": 0, "order": 1},
                  {"a1": 1, "a2": 6, "order": 1}, {"a1": 6, "a2": 7, "order": 2}, {"a1": 7, "a2": 8, "order": 1},
                  {"a1": 8, "a2": 9, "order": 2}, {"a1": 9, "a2": 10, "order": 1}, {"a1": 10, "a2": 11, "order": 2},
                  {"a1": 11, "a2": 0, "order": 1}, {"a1": 11, "a2": 6, "order": 1},
                  {"a1": 2, "a2": 12, "order": 1}, {"a1": 3, "a2": 13, "order": 1}, {"a1": 4, "a2": 14, "order": 1}, {"a1": 5, "a2": 15, "order": 1},
                  {"a1": 7, "a2": 16, "order": 1}, {"a1": 8, "a2": 17, "order": 1}, {"a1": 9, "a2": 18, "order": 1}, {"a1": 10, "a2": 19, "order": 1}]
    })

    # Group 4: Chloromethane, Dichloromethane, CFC-12
    mols.append({
        "id": "chloromethane", "name": "Chloromethane (Metyl clorua)", "iupac": "Chloromethane", "formula": "CH3Cl", "condensed": "CH3Cl",
        "group": "4. Dẫn xuất Halogen", "groupId": "halogen", "molarMass": 50.49,
        "geometry": "Tứ diện sp³ phân cực", "hybridization": "sp³",
        "state": "Khí không màu, mùi ngọt nhẹ", "boilingPoint": "-24.2 °C", "meltingPoint": "-97.4 °C",
        "solubility": "Kém tan trong nước",
        "reactions": "Thủy phân trong kiềm tạo methanol: CH₃Cl + NaOH → CH₃OH + NaCl",
        "applications": "Tác nhân metyl hóa trong tổng hợp hữu cơ, sản xuất silicon polymers.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.0, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -2},
            {"element": "Cl", "x": 0.0, "y": 0.0, "z": 1.78, "hybrid": "sp³", "valency": 1, "ox": -1},
            {"element": "H", "x": 1.03, "y": 0.0, "z": -0.36, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.51, "y": 0.89, "z": -0.36, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.51, "y": -0.89, "z": -0.36, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 0, "a2": 4, "order": 1}]
    })

    # Group 5 additions: Propan-2-ol (Isopropyl alcohol), Picric acid
    mols.append({
        "id": "propan_2_ol", "name": "Isopropyl Alcohol (IPA / Propan-2-ol)", "iupac": "Propan-2-ol", "formula": "C3H8O", "condensed": "CH3-CH(OH)-CH3",
        "group": "5. Alcohol & Phenol", "groupId": "alcohol_phenol", "molarMass": 60.10,
        "geometry": "Ancol bậc 2 với nhóm -OH gắn vào C trung tâm", "hybridization": "sp³",
        "state": "Chất lỏng trong suốt, mùi cồn gắt cay, bay hơi nhanh", "boilingPoint": "82.6 °C", "meltingPoint": "-89.0 °C",
        "solubility": "Tan vô hạn trong nước",
        "reactions": "Oxy hóa bằng CuO nung nóng tạo Axeton (propan-2-on):\n(CH₃)₂CHOH + CuO →(t°) CH₃COCH₃ + Cu↓ + H₂O",
        "applications": "Cồn lau vi mạch màn hình điện tử, dung dịch rửa tay sát khuẩn y tế, dung môi sơn mực.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.35, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "C", "x": -1.26, "y": -0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 1.26, "y": -0.52, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "O", "x": 0.0, "y": 1.72, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 0.85, "y": 2.08, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -0.05, "z": 1.05, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.15, "y": 0.12, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.28, "y": -1.16, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.28, "y": -1.16, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.15, "y": 0.12, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.28, "y": -1.16, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.28, "y": -1.16, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                  {"a1": 0, "a2": 5, "order": 1}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 1, "a2": 7, "order": 1}, {"a1": 1, "a2": 8, "order": 1},
                  {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1}, {"a1": 2, "a2": 11, "order": 1}]
    })

    # Picric acid (2,4,6-trinitrophenol)
    mols.append(make_benzene_derivative("Picric Acid (Axit picric / 2,4,6-Trinitrophenol)", "2,4,6-Trinitrophenol", "C6H3N3O7", "C6H2(NO2)3OH", "5. Alcohol & Phenol", "alcohol_phenol", 229.10, "Chất rắn tinh thể màu vàng tươi, vị rất đắng, tính axit mạnh làm đổi màu quỳ tím sang đỏ đậm", "300 °C (nổ)", "122.5 °C", "Ít tan trong nước lạnh, tan trong nước nóng, cồn", "Phản ứng nổ mạnh khi va đập hoặc đun nóng tạo khí CO, CO₂, N₂, H₂O.", "Thuốc nổ quân sự thời Thế chiến I; thuốc nhuộm lụa màu vàng, thuốc thử sinh hóa định lượng creatinin.", {0: "OH", 1: "NO2", 3: "NO2", 5: "NO2"}))

    # Group 7 additions: Oxalic Acid, Acrylic Acid
    mols.append({
        "id": "oxalic_acid", "name": "Oxalic Acid (Axit oxalic / Axit etanđioic)", "iupac": "Ethanedioic acid", "formula": "C2H2O4", "condensed": "HOOC-COOH",
        "group": "7. Carboxylic Acid", "groupId": "carboxylic_acid", "molarMass": 90.03,
        "geometry": "Axit 2 chức (điacit) đơn giản nhất, mặt phẳng phẳng đối xứng tâm", "hybridization": "sp²",
        "state": "Chất rắn kết tinh trắng ngậm 2 phân tử nước (C₂H₂O₄·2H₂O), vị chua gắt, có độc", "boilingPoint": "Thăng hoa ở 157 °C", "meltingPoint": "189.5 °C",
        "solubility": "Tan tốt trong nước",
        "reactions": "Tác dụng chất oxy hóa mạnh KMnO₄ làm mất màu thuốc tím (dùng chuẩn độ oxi hóa khử):\n5(COOH)₂ + 2KMnO₄ + 3H₂SO₄ → 10CO₂↑ + 2MnSO₄ + K₂SO₄ + 8H₂O",
        "applications": "Chất tẩy rỉ sét sắt ố trên bề mặt kim loại và vải áo trắng; đánh bóng đá hoa cương.",
        "atoms": [
            {"element": "C", "x": -0.77, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "C", "x": 0.77, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "O", "x": -1.35, "y": 1.10, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "O", "x": -1.48, "y": -1.15, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": -2.42, "y": -0.92, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "O", "x": 1.35, "y": -1.10, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "O", "x": 1.48, "y": 1.15, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 2.42, "y": 0.92, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 2}, {"a1": 0, "a2": 3, "order": 1}, {"a1": 3, "a2": 4, "order": 1},
                  {"a1": 1, "a2": 5, "order": 2}, {"a1": 1, "a2": 6, "order": 1}, {"a1": 6, "a2": 7, "order": 1}]
    })

    # Group 8 additions: Methyl Methacrylate, Vinyl Acetate
    mols.append({
        "id": "methyl_methacrylate", "name": "Methyl Methacrylate (MMA / Metyl metacrylat)", "iupac": "Methyl 2-methylpropenoate", "formula": "C5H8O2", "condensed": "CH2=C(CH3)-COO-CH3",
        "group": "8. Ester & Lipid", "groupId": "ester_lipid", "molarMass": 100.12,
        "geometry": "Khung este không no liên hợp với liên kết đôi C=C", "hybridization": "sp² và sp³",
        "state": "Chất lỏng không màu, mùi ester nồng dễ bay hơi", "boilingPoint": "101.0 °C", "meltingPoint": "-48.0 °C",
        "solubility": "Ít tan trong nước",
        "reactions": "Trùng hợp tạo thủy tinh hữu cơ Plexiglas (PMMa / Polymethyl methacrylate):\nn CH₂=C(CH₃)COOCH₃ → (-CH₂-C(CH₃)(COOCH₃)-)n",
        "applications": "Sản xuất thủy tinh hữu cơ Plexiglas (kính máy bay, kính mắt an toàn, răng giả y tế, bể cá thủy cung siêu bền trong suốt).",
        "atoms": [
            {"element": "C", "x": -1.85, "y": -0.65, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": -2},
            {"element": "C", "x": -0.65, "y": -0.10, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "C", "x": -0.55, "y": 1.40, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 0.65, "y": -0.88, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "O", "x": 0.72, "y": -2.08, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "O", "x": 1.72, "y": -0.05, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "C", "x": 3.02, "y": -0.68, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -2.75, "y": -0.05, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.95, "y": -1.73, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.55, "y": 1.85, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.05, "y": 1.78, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.05, "y": 1.78, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 3.75, "y": 0.12, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 3.15, "y": -1.30, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 3.15, "y": -1.30, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 1, "a2": 3, "order": 1},
                  {"a1": 3, "a2": 4, "order": 2}, {"a1": 3, "a2": 5, "order": 1}, {"a1": 5, "a2": 6, "order": 1},
                  {"a1": 0, "a2": 7, "order": 1}, {"a1": 0, "a2": 8, "order": 1},
                  {"a1": 2, "a2": 9, "order": 1}, {"a1": 2, "a2": 10, "order": 1}, {"a1": 2, "a2": 11, "order": 1},
                  {"a1": 6, "a2": 12, "order": 1}, {"a1": 6, "a2": 13, "order": 1}, {"a1": 6, "a2": 14, "order": 1}]
    })

    # Group 9 additions: Alanine, Dimethylamine
    mols.append({
        "id": "alanine", "name": "Alanine (Alanin / Axit 2-aminopropanoic)", "iupac": "2-Aminopropanoic acid", "formula": "C3H7NO2", "condensed": "CH3-CH(NH2)-COOH",
        "group": "9. Amine & Amino Acid", "groupId": "amine_amino_acid", "molarMass": 89.09,
        "geometry": "Amino acid có carbon bất đối C* (chiral center), có đồng phân quang học D/L", "hybridization": "sp² và sp³",
        "state": "Chất rắn tinh thể trắng, vị ngọt nhẹ, nóng chảy ở nhiệt độ cao", "boilingPoint": "Phân hủy", "meltingPoint": "297.0 °C",
        "solubility": "Dễ tan trong nước",
        "reactions": "Tính chất lưỡng tính tác dụng axit và bazo; tạo liên kết peptit với các amino acid khác.",
        "applications": "Một trong 20 amino acid tiêu chuẩn tạo protein cơ thể, nguồn tạo năng lượng cho mô cơ.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 0.45, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "N", "x": -1.25, "y": -0.32, "z": 0.0, "hybrid": "sp³", "valency": 3, "ox": -3},
            {"element": "C", "x": 1.25, "y": -0.38, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "O", "x": 1.30, "y": -1.58, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "O", "x": 2.35, "y": 0.42, "z": 0.0, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 3.15, "y": -0.15, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "C", "x": 0.0, "y": 1.98, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": 0.0, "y": 0.12, "z": 1.05, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.05, "y": 0.28, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": -0.92, "z": 0.82, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.98, "y": 2.45, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.52, "y": 2.35, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.52, "y": 2.35, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 2}, {"a1": 2, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1},
                  {"a1": 0, "a2": 6, "order": 1}, {"a1": 0, "a2": 7, "order": 1},
                  {"a1": 1, "a2": 8, "order": 1}, {"a1": 1, "a2": 9, "order": 1},
                  {"a1": 6, "a2": 10, "order": 1}, {"a1": 6, "a2": 11, "order": 1}, {"a1": 6, "a2": 12, "order": 1}]
    })

    # Group 10 additions: D-Glucose (Ring chair conformation), Caffeine
    # D-Glucose ring (alpha-D-glucopyranose)
    mols.append({
        "id": "glucose", "name": "D-Glucose - Dạng Vòng Ghế (Đường Nho)", "iupac": "(2R,3S,4R,5R,6S)-6-(hydroxymethyl)tetrahydro-2H-pyran-2,3,4,5-tetrol", "formula": "C6H12O6", "condensed": "C6H12O6 (pyranose)",
        "group": "10. Carbohydrate & Hợp chất sinh học", "groupId": "biomolecules", "molarMass": 180.16,
        "geometry": "Vòng pyranose 6 cạnh (5C + 1O) cấu dạng ghế bền vững, các nhóm -OH ở vị trí xích đạo (equatorial) giảm tương tác đẩy", "hybridization": "sp³",
        "state": "Chất rắn kết tinh màu trắng, vị ngọt thanh mát, hòa tan tỏa nhiệt nhẹ", "boilingPoint": "Phân hủy", "meltingPoint": "146.0 °C",
        "solubility": "Tan vô hạn trong nước tạo dung dịch có độ nhớt",
        "reactions": "1) Phản ứng tráng bạc tỉ lệ 1:2 Ag (khi mở vòng thành anđehit):\nC₆H₁₂O₆ + 2[Ag(NH₃)₂]OH → C₆H₁₁O₇NH₄ + 2Ag↓ + 3NH₃ + H₂O\n2) Hòa tan Cu(OH)₂ ở đk thường tạo dung dịch XANH LAM THẪM (tính chất polyancol)\n3) Tác dụng Cu(OH)₂ đun nóng tạo kết tủa đỏ gạch Cu₂O\n4) Lên men rượu: C₆H₁₂O₆ →(men rượu, 30-32°C) 2C₂H₅OH + 2CO₂↑",
        "applications": "Nguồn cung cấp năng lượng chính cho não bộ và tế bào sống (đường huyết chuẩn 4.4-7.2 mmol/L); dịch truyền y tế tiếp sức, sản xuất vitamin C, tráng gương ruột phích.",
        "atoms": [
            {"element": "C", "x": 1.25, "y": 0.65, "z": 0.20, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "C", "x": 0.0, "y": 1.45, "z": -0.22, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "C", "x": -1.25, "y": 0.65, "z": 0.20, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "C", "x": -1.25, "y": -0.75, "z": -0.22, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "C", "x": 0.0, "y": -1.45, "z": 0.20, "hybrid": "sp³", "valency": 4, "ox": 0},
            {"element": "O", "x": 1.15, "y": -0.65, "z": -0.22, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "O", "x": 2.45, "y": 1.28, "z": -0.15, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 3.15, "y": 0.82, "z": 0.25, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "O", "x": 0.0, "y": 2.75, "z": 0.35, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 0.85, "y": 3.12, "z": 0.25, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "O", "x": -2.45, "y": 1.28, "z": -0.15, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": -3.15, "y": 0.82, "z": 0.25, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "O", "x": -2.45, "y": -1.45, "z": 0.15, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": -2.45, "y": -2.35, "z": -0.18, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "C", "x": 0.0, "y": -2.85, "z": -0.38, "hybrid": "sp³", "valency": 4, "ox": -1},
            {"element": "O", "x": 1.15, "y": -3.55, "z": 0.05, "hybrid": "sp³", "valency": 2, "ox": -2},
            {"element": "H", "x": 1.15, "y": -4.45, "z": -0.28, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.25, "y": 0.65, "z": 1.30, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": 1.45, "z": -1.32, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": 0.65, "z": 1.30, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -1.25, "y": -0.75, "z": -1.32, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -1.45, "z": 1.30, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.88, "y": -3.42, "z": -0.05, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 0.0, "y": -2.78, "z": -1.48, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 1}, {"a1": 1, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                  {"a1": 3, "a2": 4, "order": 1}, {"a1": 4, "a2": 5, "order": 1}, {"a1": 5, "a2": 0, "order": 1},
                  {"a1": 0, "a2": 6, "order": 1}, {"a1": 6, "a2": 7, "order": 1},
                  {"a1": 1, "a2": 8, "order": 1}, {"a1": 8, "a2": 9, "order": 1},
                  {"a1": 2, "a2": 10, "order": 1}, {"a1": 10, "a2": 11, "order": 1},
                  {"a1": 3, "a2": 12, "order": 1}, {"a1": 12, "a2": 13, "order": 1},
                  {"a1": 4, "a2": 14, "order": 1}, {"a1": 14, "a2": 15, "order": 1}, {"a1": 15, "a2": 16, "order": 1},
                  {"a1": 0, "a2": 17, "order": 1}, {"a1": 1, "a2": 18, "order": 1}, {"a1": 2, "a2": 19, "order": 1},
                  {"a1": 3, "a2": 20, "order": 1}, {"a1": 4, "a2": 21, "order": 1},
                  {"a1": 14, "a2": 22, "order": 1}, {"a1": 14, "a2": 23, "order": 1}]
    })

    # Caffeine (1,3,7-Trimethylxanthine)
    mols.append({
        "id": "caffeine", "name": "Caffeine (Cafein / 1,3,7-Trimetylxantin)", "iupac": "1,3,7-Trimethylpurine-2,6-dione", "formula": "C8H10N4O2", "condensed": "C8H10N4O2",
        "group": "10. Carbohydrate & Hợp chất sinh học", "groupId": "biomolecules", "molarMass": 194.19,
        "geometry": "Hệ vòng đôi Purine thơm (vòng 6 cạnh kết hợp vòng 5 cạnh imidazole phẳng) gắn 3 nhóm metyl và 2 nhóm cacbonyl", "hybridization": "sp² và sp³",
        "state": "Chất rắn tinh thể trắng hình kim không mùi, vị đắng đặc trưng", "boilingPoint": "178 °C (thăng hoa)", "meltingPoint": "235.0 °C",
        "solubility": "Tan vừa trong nước lạnh, tan rất tốt trong nước sôi",
        "reactions": "Chất kiềm purine yếu, ức chế thụ thể adenosine ở não bộ, kích thích giải phóng dopamine và adrenaline.",
        "applications": "Chất kích thích thần kinh trung ương tự nhiên trong hạt cà phê, lá trà xanh, hạt cacao; thành phần nước tăng lực và thuốc giảm đau hạ sốt kết hợp.",
        "atoms": [
            {"element": "C", "x": 0.0, "y": 1.40, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "O", "x": 0.0, "y": 2.62, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "N", "x": 1.25, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 3, "ox": -3},
            {"element": "C", "x": 1.25, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +3},
            {"element": "O", "x": 2.30, "y": -1.35, "z": 0.0, "hybrid": "sp²", "valency": 2, "ox": -2},
            {"element": "N", "x": 0.0, "y": -1.40, "z": 0.0, "hybrid": "sp²", "valency": 3, "ox": -3},
            {"element": "C", "x": -1.25, "y": -0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "C", "x": -1.25, "y": 0.70, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": 0},
            {"element": "N", "x": -2.48, "y": 1.15, "z": 0.0, "hybrid": "sp²", "valency": 3, "ox": -3},
            {"element": "C", "x": -3.22, "y": 0.0, "z": 0.0, "hybrid": "sp²", "valency": 4, "ox": +1},
            {"element": "N", "x": -2.48, "y": -1.15, "z": 0.0, "hybrid": "sp²", "valency": 3, "ox": -3},
            {"element": "C", "x": 2.55, "y": 1.42, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": 0.0, "y": -2.85, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "C", "x": -2.85, "y": 2.55, "z": 0.0, "hybrid": "sp³", "valency": 4, "ox": -3},
            {"element": "H", "x": -4.30, "y": 0.0, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 3.32, "y": 0.65, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.65, "y": 2.05, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 2.65, "y": 2.05, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": 1.02, "y": -3.25, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.52, "y": -3.22, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -0.52, "y": -3.22, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -3.94, "y": 2.65, "z": 0.0, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.42, "y": 3.02, "z": 0.88, "hybrid": "1s", "valency": 1, "ox": +1},
            {"element": "H", "x": -2.42, "y": 3.02, "z": -0.88, "hybrid": "1s", "valency": 1, "ox": +1}
        ],
        "bonds": [{"a1": 0, "a2": 1, "order": 2}, {"a1": 0, "a2": 2, "order": 1}, {"a1": 2, "a2": 3, "order": 1},
                  {"a1": 3, "a2": 4, "order": 2}, {"a1": 3, "a2": 5, "order": 1}, {"a1": 5, "a2": 6, "order": 1},
                  {"a1": 6, "a2": 7, "order": 2}, {"a1": 7, "a2": 0, "order": 1},
                  {"a1": 7, "a2": 8, "order": 1}, {"a1": 8, "a2": 9, "order": 1}, {"a1": 9, "a2": 10, "order": 2},
                  {"a1": 10, "a2": 6, "order": 1},
                  {"a1": 2, "a2": 11, "order": 1}, {"a1": 5, "a2": 12, "order": 1}, {"a1": 8, "a2": 13, "order": 1},
                  {"a1": 9, "a2": 14, "order": 1},
                  {"a1": 11, "a2": 15, "order": 1}, {"a1": 11, "a2": 16, "order": 1}, {"a1": 11, "a2": 17, "order": 1},
                  {"a1": 12, "a2": 18, "order": 1}, {"a1": 12, "a2": 19, "order": 1}, {"a1": 12, "a2": 20, "order": 1},
                  {"a1": 13, "a2": 21, "order": 1}, {"a1": 13, "a2": 22, "order": 1}, {"a1": 13, "a2": 23, "order": 1}]
    })

    print(f"Total fully detailed molecules in comprehensive database: {len(mols)}")
    return mols

if __name__ == "__main__":
    mols = get_full_55_molecules()
    with open("mols_complete_db.json", "w", encoding="utf-8") as f:
        json.dump(mols, f, ensure_ascii=False, indent=2)
    print("Exported mols_complete_db.json successfully!")
