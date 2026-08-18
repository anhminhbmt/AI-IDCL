import { ChemicalReagent, ChemicalReactionRule } from '../types/chemistry';

export const CHEMICAL_DATABASE: ChemicalReagent[] = [
  // --- AXIT / ACIDS ---
  {
    id: 'HCl',
    name: 'Hydrochloric acid',
    formula: 'HCl',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(235, 245, 255, 0.2)',
    molarMass: 36.5,
    pH: 1,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Axit vô cơ mạnh (Hydrochloric acid), trong suốt, không màu.',
    solubility: true,
  },
  {
    id: 'H2SO4',
    name: 'Sulfuric acid',
    formula: 'H2SO4',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(230, 240, 255, 0.3)',
    molarMass: 98.0,
    pH: 0.5,
    defaultConcentration: 2.0,
    defaultVolume: 50,
    description: 'Axit mạnh hàng đầu (Sulfuric acid), sánh như dầu, tỏa nhiều nhiệt khi tan.',
    solubility: true,
  },
  {
    id: 'HNO3',
    name: 'Nitric acid',
    formula: 'HNO3',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(255, 250, 220, 0.35)',
    molarMass: 63.0,
    pH: 1,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Axit mạnh có tính oxi hóa cao (Nitric acid).',
    solubility: true,
  },
  {
    id: 'CH3COOH',
    name: 'Acetic acid',
    formula: 'CH3COOH',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(245, 245, 245, 0.2)',
    molarMass: 60.05,
    pH: 3.0,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Axit hữu cơ yếu (Acetic acid / Ethanoic acid).',
    solubility: true,
  },
  {
    id: 'HF',
    name: 'Hydrofluoric acid',
    formula: 'HF',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 20.01,
    pH: 2.0,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Axit Hydrofluoric có khả năng ăn mòn thủy tinh.',
    solubility: true,
  },
  {
    id: 'HBr',
    name: 'Hydrobromic acid',
    formula: 'HBr',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 80.91,
    pH: 1.0,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Axit Hydrobromic mạnh không màu.',
    solubility: true,
  },

  // --- BAZƠ / BASES ---
  {
    id: 'NaOH',
    name: 'Sodium hydroxide',
    formula: 'NaOH',
    type: 'base',
    state: 'liquid',
    color: 'rgba(240, 250, 255, 0.2)',
    molarMass: 40.0,
    pH: 13,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Kiềm mạnh (Sodium hydroxide), làm hồng phenolphthalein.',
    solubility: true,
  },
  {
    id: 'KOH',
    name: 'Potassium hydroxide',
    formula: 'KOH',
    type: 'base',
    state: 'liquid',
    color: 'rgba(240, 250, 255, 0.2)',
    molarMass: 56.1,
    pH: 13.5,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Kiềm mạnh Potassium hydroxide.',
    solubility: true,
  },
  {
    id: 'Ca(OH)2',
    name: 'Calcium hydroxide',
    formula: 'Ca(OH)2',
    type: 'base',
    state: 'liquid',
    color: 'rgba(245, 250, 250, 0.4)',
    molarMass: 74.1,
    pH: 11.5,
    defaultConcentration: 0.05,
    defaultVolume: 50,
    description: 'Dung dịch Calcium hydroxide (nước vôi trong), vẩn đục với CO2.',
    solubility: true,
  },
  {
    id: 'Ba(OH)2',
    name: 'Barium hydroxide',
    formula: 'Ba(OH)2',
    type: 'base',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.25)',
    molarMass: 171.3,
    pH: 13,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Barium hydroxide tan tốt trong nước, tạo kết tủa BaSO4.',
    solubility: true,
  },
  {
    id: 'NH3',
    name: 'Ammonia',
    formula: 'NH3',
    type: 'base',
    state: 'liquid',
    color: 'rgba(235, 250, 245, 0.2)',
    molarMass: 17.03,
    pH: 10.5,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Dung dịch Ammonia (NH3) tạo phức xanh thẫm với Cu2+.',
    solubility: true,
  },
  {
    id: 'Fe(OH)2',
    name: 'Iron(II) hydroxide',
    formula: 'Fe(OH)2',
    type: 'base',
    state: 'solid',
    color: 'rgba(209, 250, 229, 0.95)',
    molarMass: 89.86,
    pH: 9,
    defaultConcentration: 0,
    defaultVolume: 0,
    description: 'Iron(II) hydroxide kết tủa màu trắng xanh.',
    solubility: false,
  },
  {
    id: 'Fe(OH)3',
    name: 'Iron(III) hydroxide',
    formula: 'Fe(OH)3',
    type: 'base',
    state: 'solid',
    color: 'rgba(153, 27, 27, 0.95)',
    molarMass: 106.87,
    pH: 7,
    defaultConcentration: 0,
    defaultVolume: 0,
    description: 'Iron(III) hydroxide kết tủa màu nâu đỏ đặc trưng.',
    solubility: false,
  },
  {
    id: 'Cu(OH)2',
    name: 'Copper(II) hydroxide',
    formula: 'Cu(OH)2',
    type: 'base',
    state: 'solid',
    color: 'rgba(2, 132, 199, 0.95)',
    molarMass: 97.56,
    pH: 8.5,
    defaultConcentration: 0,
    defaultVolume: 0,
    description: 'Copper(II) hydroxide kết tủa màu xanh lam.',
    solubility: false,
  },
  {
    id: 'Al(OH)3',
    name: 'Aluminium hydroxide',
    formula: 'Al(OH)3',
    type: 'base',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 78.0,
    pH: 7,
    defaultConcentration: 0,
    defaultVolume: 0,
    description: 'Aluminium hydroxide kết tủa keo trắng, lưỡng tính.',
    solubility: false,
  },
  {
    id: 'Zn(OH)2',
    name: 'Zinc hydroxide',
    formula: 'Zn(OH)2',
    type: 'base',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 99.42,
    pH: 7,
    defaultConcentration: 0,
    defaultVolume: 0,
    description: 'Zinc hydroxide kết tủa màu trắng, tan trong kiềm dư.',
    solubility: false,
  },
  {
    id: 'Mg(OH)2',
    name: 'Magnesium hydroxide',
    formula: 'Mg(OH)2',
    type: 'base',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 58.32,
    pH: 9,
    defaultConcentration: 0,
    defaultVolume: 0,
    description: 'Magnesium hydroxide kết tủa màu trắng.',
    solubility: false,
  },

  // --- SOLVENTS & OXIDES ---
  {
    id: 'H2O',
    name: 'Distilled water',
    formula: 'H2O',
    type: 'oxide',
    state: 'liquid',
    color: 'rgba(235, 245, 255, 0.2)',
    molarMass: 18.015,
    pH: 7.0,
    defaultConcentration: 55.5,
    defaultVolume: 50,
    description: 'Nước cất tinh khiết (H2O), dung dịch trung tính.',
    solubility: true,
  },
  {
    id: 'CaO',
    name: 'Calcium oxide',
    formula: 'CaO',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(250, 250, 250, 0.95)',
    molarMass: 56.08,
    pH: 12,
    description: 'Calcium oxide (vôi sống) tỏa nhiệt mạnh với H2O.',
    solubility: false,
  },
  {
    id: 'CuO',
    name: 'Copper(II) oxide',
    formula: 'CuO',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(24, 24, 27, 0.98)',
    molarMass: 79.55,
    pH: 7,
    description: 'Copper(II) oxide bột màu đen.',
    solubility: false,
  },
  {
    id: 'Cu2O',
    name: 'Copper(I) oxide',
    formula: 'Cu2O',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(185, 28, 28, 0.95)',
    molarMass: 143.09,
    pH: 7,
    description: 'Copper(I) oxide kết tủa màu đỏ gạch.',
    solubility: false,
  },
  {
    id: 'Fe2O3',
    name: 'Iron(III) oxide',
    formula: 'Fe2O3',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(153, 27, 27, 0.95)',
    molarMass: 159.69,
    pH: 7,
    description: 'Iron(III) oxide bột màu đỏ nâu.',
    solubility: false,
  },
  {
    id: 'Fe3O4',
    name: 'Iron(II,III) oxide',
    formula: 'Fe3O4',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(41, 29, 24, 0.98)',
    molarMass: 231.53,
    pH: 7,
    description: 'Iron(II,III) oxide chất rắn màu nâu đen.',
    solubility: false,
  },
  {
    id: 'MnO2',
    name: 'Manganese(IV) oxide',
    formula: 'MnO2',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(24, 24, 27, 0.98)',
    molarMass: 86.94,
    pH: 7,
    description: 'Manganese(IV) oxide bột màu đen.',
    solubility: false,
  },
  {
    id: 'P2O5',
    name: 'Phosphorus pentoxide',
    formula: 'P2O5',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 141.94,
    pH: 2,
    description: 'Phosphorus pentoxide bột khói trắng.',
    solubility: false,
  },
  {
    id: 'SiO2',
    name: 'Silicon dioxide',
    formula: 'SiO2',
    type: 'oxide',
    state: 'solid',
    color: 'rgba(240, 240, 240, 0.95)',
    molarMass: 60.08,
    pH: 7,
    description: 'Thủy tinh / Cát thạch anh SiO2.',
    solubility: false,
  },

  // --- MUỐI / SALTS ---
  {
    id: 'NaNO3',
    name: 'Sodium nitrate',
    formula: 'NaNO3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 240, 250, 0.15)',
    molarMass: 85.0,
    solubility: true
  },
  {
    id: 'NaNO3(rắn)',
    name: 'Tẩy Tinh Thể Sodium nitrate',
    formula: 'NaNO3(rắn)',
    type: 'salt',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 85.0,
    solubility: true
  },
  {
    id: 'NaHSO4',
    name: 'Sodium bisulfate',
    formula: 'NaHSO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 240, 250, 0.15)',
    molarMass: 120.0,
    solubility: true
  },
  {
    id: 'NaCl',
    name: 'Sodium chloride',
    formula: 'NaCl',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 240, 250, 0.15)',
    molarMass: 58.44,
    pH: 7.0,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Sodium chloride dung dịch trung tính không màu.',
    solubility: true,
  },
  {
    id: 'NaClO',
    name: 'Sodium hypochlorite (Nước Javel)',
    formula: 'NaClO',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(235, 250, 200, 0.35)',
    molarMass: 74.44,
    pH: 11.5,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Dung dịch Nước Javel (NaClO) có tính oxy hóa cực mạnh, dùng để tẩy màu vải nhuộm hữu cơ & diệt khuẩn.',
    solubility: true,
  },
  {
    id: 'Na2SO4',
    name: 'Sodium sulfate',
    formula: 'Na2SO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 240, 250, 0.15)',
    molarMass: 142.04,
    pH: 7.0,
    defaultConcentration: 1.0,
    defaultVolume: 50,
    description: 'Sodium sulfate dung dịch trung tính không màu.',
    solubility: true,
  },
  {
    id: 'CuSO4',
    name: 'Copper(II) sulfate',
    formula: 'CuSO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(2, 132, 199, 0.75)',
    molarMass: 159.6,
    pH: 5.5,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Copper(II) sulfate dung dịch màu xanh lam đặc trưng.',
    solubility: true,
  },
  {
    id: 'Cu(NO3)2_dac',
    name: 'Copper(II) nitrate (trong axit đặc)',
    formula: 'Cu(NO3)2_dac',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(16, 185, 129, 0.8)', // Xanh lục/xanh lam (Emerald green/blue)
    molarMass: 187.56,
    pH: 4,
    description: 'Dung dịch đồng(II) nitrat có màu xanh lục/lam do hòa tan khí NO2.',
    solubility: true,
  },
  {
    id: 'Cu(NO3)2_loang',
    name: 'Copper(II) nitrate (trong axit loãng)',
    formula: 'Cu(NO3)2_loang',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(6, 182, 212, 0.65)', // Xanh lam ngọc (Cyan/Light Blue)
    molarMass: 187.56,
    pH: 4,
    description: 'Dung dịch đồng(II) nitrat loãng có màu xanh lam ngọc.',
    solubility: true,
  },
  {
    id: 'FeCl2',
    name: 'Iron(II) chloride',
    formula: 'FeCl2',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(167, 243, 208, 0.75)',
    molarMass: 126.75,
    pH: 4.5,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Iron(II) chloride dung dịch màu lục nhạt.',
    solubility: true,
  },
  {
    id: 'FeCl3',
    name: 'Iron(III) chloride',
    formula: 'FeCl3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(217, 119, 6, 0.8)',
    molarMass: 162.2,
    pH: 3.0,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Iron(III) chloride dung dịch màu vàng nâu.',
    solubility: true,
  },
  {
    id: 'FeSO4',
    name: 'Iron(II) sulfate',
    formula: 'FeSO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(167, 243, 208, 0.75)',
    molarMass: 151.91,
    pH: 4.5,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Iron(II) sulfate dung dịch xanh nhạt.',
    solubility: true,
  },
  {
    id: 'Fe2(SO4)3',
    name: 'Iron(III) sulfate',
    formula: 'Fe2(SO4)3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(217, 119, 6, 0.8)',
    molarMass: 399.88,
    pH: 3.0,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Iron(III) sulfate dung dịch màu vàng nâu.',
    solubility: true,
  },
  {
    id: 'BaCl2',
    name: 'Barium chloride',
    formula: 'BaCl2',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 208.23,
    pH: 6.5,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Barium chloride dung dịch thử ion SO4(2-).',
    solubility: true,
  },
  {
    id: 'BaSO4',
    name: 'Barium sulfate',
    formula: 'BaSO4',
    type: 'salt',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 233.38,
    pH: 7,
    description: 'Barium sulfate kết tủa màu trắng mịn không tan trong axit.',
    solubility: false,
  },
  {
    id: 'AgNO3',
    name: 'Silver nitrate',
    formula: 'AgNO3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(245, 245, 255, 0.2)',
    molarMass: 169.87,
    pH: 6.0,
    defaultConcentration: 0.1,
    defaultVolume: 50,
    description: 'Silver nitrate dung dịch thử ion halide.',
    solubility: true,
  },
  {
    id: 'AgCl',
    name: 'Silver chloride',
    formula: 'AgCl',
    type: 'salt',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 143.32,
    pH: 7,
    description: 'Silver chloride kết tủa vón màu trắng.',
    solubility: false,
  },
  {
    id: 'AgBr',
    name: 'Silver bromide',
    formula: 'AgBr',
    type: 'salt',
    state: 'solid',
    color: 'rgba(254, 240, 138, 0.95)',
    molarMass: 187.77,
    pH: 7,
    description: 'Silver bromide kết tủa màu vàng nhạt.',
    solubility: false,
  },
  {
    id: 'AgI',
    name: 'Silver iodide',
    formula: 'AgI',
    type: 'salt',
    state: 'solid',
    color: 'rgba(234, 179, 8, 0.95)',
    molarMass: 234.77,
    pH: 7,
    description: 'Silver iodide kết tủa màu vàng đậm.',
    solubility: false,
  },
  {
    id: 'Pb(NO3)2',
    name: 'Lead(II) nitrate',
    formula: 'Pb(NO3)2',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 331.2,
    pH: 5.5,
    defaultConcentration: 0.2,
    defaultVolume: 50,
    description: 'Lead(II) nitrate dung dịch không màu.',
    solubility: true,
  },
  {
    id: 'PbI2',
    name: 'Lead(II) iodide',
    formula: 'PbI2',
    type: 'salt',
    state: 'solid',
    color: 'rgba(250, 204, 21, 0.98)',
    molarMass: 461.0,
    pH: 7,
    description: 'Lead(II) iodide kết tủa vàng tươi (hiệu ứng mưa vàng).',
    solubility: false,
  },
  {
    id: 'KI',
    name: 'Potassium iodide',
    formula: 'KI',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 166.0,
    pH: 7.0,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Potassium iodide dung dịch không màu.',
    solubility: true,
  },
  {
    id: 'NaBr',
    name: 'Sodium bromide',
    formula: 'NaBr',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 102.89,
    pH: 7.0,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Sodium bromide dung dịch không màu.',
    solubility: true,
  },
  {
    id: 'CaCO3',
    name: 'Calcium carbonate',
    formula: 'CaCO3',
    type: 'salt',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 100.09,
    pH: 8.5,
    description: 'Calcium carbonate (đá vôi) chất rắn màu trắng.',
    solubility: false,
  },
  {
    id: 'Ca(HCO3)2',
    name: 'Calcium bicarbonate',
    formula: 'Ca(HCO3)2',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 162.11,
    pH: 7.5,
    defaultConcentration: 0.1,
    defaultVolume: 50,
    description: 'Calcium bicarbonate muối tan gây nước cứng tạm thời.',
    solubility: true,
  },
  {
    id: 'Na2CO3',
    name: 'Sodium carbonate',
    formula: 'Na2CO3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 105.99,
    pH: 10.5,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Sodium carbonate dung dịch sủi bọt CO2 với axit.',
    solubility: true,
  },
  {
    id: 'NaHCO3',
    name: 'Sodium bicarbonate',
    formula: 'NaHCO3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 84.01,
    pH: 8.3,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Sodium bicarbonate (baking soda) sủi bọt khí CO2.',
    solubility: true,
  },
  {
    id: 'Na2SO3',
    name: 'Sodium sulfite',
    formula: 'Na2SO3',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 126.04,
    pH: 9.0,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Sodium sulfite thoát khí SO2 khi gặp axit.',
    solubility: true,
  },
  {
    id: 'NH4Cl',
    name: 'Ammonium chloride',
    formula: 'NH4Cl',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 245, 255, 0.2)',
    molarMass: 53.49,
    pH: 5.5,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Ammonium chloride thoát khí NH3 khi đun với kiềm.',
    solubility: true,
  },
  {
    id: 'KMnO4',
    name: 'Potassium permanganate',
    formula: 'KMnO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(147, 51, 234, 0.85)',
    molarMass: 158.03,
    pH: 7.0,
    defaultConcentration: 0.1,
    defaultVolume: 50,
    description: 'Potassium permanganate dung dịch màu đỏ tím rực rỡ.',
    solubility: true,
  },
  {
    id: 'K2Cr2O7',
    name: 'Potassium dichromate',
    formula: 'K2Cr2O7',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(234, 88, 12, 0.85)',
    molarMass: 294.18,
    pH: 4.0,
    defaultConcentration: 0.2,
    defaultVolume: 50,
    description: 'Potassium dichromate dung dịch màu da cam.',
    solubility: true,
  },
  {
    id: 'K2CrO4',
    name: 'Potassium chromate',
    formula: 'K2CrO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(234, 179, 8, 0.85)',
    molarMass: 194.19,
    pH: 8.5,
    defaultConcentration: 0.2,
    defaultVolume: 50,
    description: 'Potassium chromate dung dịch màu vàng tươi.',
    solubility: true,
  },
  {
    id: 'CuS',
    name: 'Copper(II) sulfide',
    formula: 'CuS',
    type: 'salt',
    state: 'solid',
    color: 'rgba(24, 24, 27, 0.98)',
    molarMass: 95.61,
    pH: 7,
    description: 'Copper(II) sulfide kết tủa đen không tan trong axit loãng.',
    solubility: false,
  },

  // --- ELEMENTALS & METALS ---
  {
    id: 'Fe',
    name: 'Iron',
    formula: 'Fe',
    type: 'element',
    state: 'solid',
    color: 'rgba(161, 161, 170, 0.95)',
    molarMass: 55.85,
    pH: 7,
    description: 'Iron (Sắt) kim loại màu trắng xám.',
    solubility: false,
  },
  {
    id: 'Cu',
    name: 'Copper',
    formula: 'Cu',
    type: 'element',
    state: 'solid',
    color: 'rgba(194, 65, 12, 0.95)',
    molarMass: 63.55,
    pH: 7,
    description: 'Copper (Đồng) kim loại màu đỏ vàng.',
    solubility: false,
  },
  {
    id: 'Zn',
    name: 'Zinc',
    formula: 'Zn',
    type: 'element',
    state: 'solid',
    color: 'rgba(175, 185, 195, 0.95)',
    molarMass: 65.38,
    pH: 7,
    description: 'Zinc (Kẽm) kim loại màu xám lam.',
    solubility: false,
  },
  {
    id: 'Al',
    name: 'Aluminium',
    formula: 'Al',
    type: 'element',
    state: 'solid',
    color: 'rgba(226, 232, 240, 0.95)',
    molarMass: 26.98,
    pH: 7,
    description: 'Aluminium (Nhôm) kim loại trắng bạc.',
    solubility: false,
  },
  {
    id: 'Na',
    name: 'Sodium',
    formula: 'Na',
    type: 'element',
    state: 'solid',
    color: 'rgba(215, 220, 225, 0.95)',
    molarMass: 22.99,
    pH: 7,
    description: 'Sodium kim loại kiềm mềm màu trắng bạc.',
    solubility: false,
  },
  {
    id: 'Li',
    name: 'Lithium',
    formula: 'Li',
    type: 'element',
    state: 'solid',
    color: 'rgba(225, 230, 235, 0.95)',
    molarMass: 6.94,
    pH: 7,
    description: 'Lithium kim loại kiềm nhẹ màu trắng bạc.',
    solubility: false,
  },
  {
    id: 'K',
    name: 'Potassium',
    formula: 'K',
    type: 'element',
    state: 'solid',
    color: 'rgba(200, 210, 220, 0.95)',
    molarMass: 39.1,
    pH: 7,
    description: 'Potassium kim loại kiềm cháy ngọn lửa tím.',
    solubility: false,
  },
  {
    id: 'Mg',
    name: 'Magnesium',
    formula: 'Mg',
    type: 'element',
    state: 'solid',
    color: 'rgba(220, 225, 230, 0.95)',
    molarMass: 24.31,
    pH: 7,
    description: 'Magnesium kim loại màu trắng bạc.',
    solubility: false,
  },
  {
    id: 'Ca',
    name: 'Calcium',
    formula: 'Ca',
    type: 'element',
    state: 'solid',
    color: 'rgba(220, 225, 230, 0.95)',
    molarMass: 40.08,
    pH: 7,
    description: 'Calcium kim loại kiềm thổ.',
    solubility: false,
  },
  {
    id: 'Ba',
    name: 'Barium',
    formula: 'Ba',
    type: 'element',
    state: 'solid',
    color: 'rgba(200, 210, 220, 0.95)',
    molarMass: 137.33,
    pH: 7,
    description: 'Barium kim loại kiềm thổ phản ứng mạnh với H2O.',
    solubility: false,
  },
  {
    id: 'FeS',
    name: 'Iron(II) sulfide',
    formula: 'FeS',
    type: 'element',
    state: 'solid',
    color: 'rgba(24, 24, 27, 0.98)',
    molarMass: 87.91,
    pH: 7,
    description: 'Iron(II) sulfide chất rắn màu đen.',
    solubility: false,
  },
  {
    id: 'I2',
    name: 'Iodine',
    formula: 'I2',
    type: 'element',
    state: 'solid',
    color: 'rgba(76, 29, 149, 0.95)',
    molarMass: 253.8,
    pH: 7,
    description: 'Iodine tinh thể rắn màu tím thẫm.',
    solubility: false,
  },
  {
    id: 'C12H22O11',
    name: 'Sucrose (Đường Saccarozơ)',
    formula: 'C12H22O11',
    type: 'salt',
    state: 'solid',
    color: 'rgba(255, 255, 255, 0.95)',
    molarMass: 342.3,
    pH: 7,
    description: 'Đường saccarozơ tinh thể màu trắng.',
    solubility: true,
  },
  {
    id: 'C',
    name: 'Carbon (Bột than xốp)',
    formula: 'C',
    type: 'element',
    state: 'solid',
    color: 'rgba(20, 20, 20, 0.98)',
    molarMass: 12.01,
    pH: 7,
    description: 'Cacbon / Than xốp màu đen.',
    solubility: false,
  },
  {
    id: 'K2MnO4',
    name: 'Potassium manganate',
    formula: 'K2MnO4',
    type: 'salt',
    state: 'solid',
    color: 'rgba(6, 95, 70, 0.95)',
    molarMass: 197.13,
    pH: 8,
    description: 'Potassium manganate màu xanh lục thẫm.',
    solubility: true,
  },
  {
    id: 'MnCl2',
    name: 'Manganese(II) chloride',
    formula: 'MnCl2',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(252, 231, 243, 0.4)',
    molarMass: 125.84,
    pH: 6,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Manganese(II) chloride dung dịch hồng nhạt / trong suốt.',
    solubility: true,
  },
  {
    id: 'MnSO4',
    name: 'Manganese(II) sulfate',
    formula: 'MnSO4',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(252, 231, 243, 0.3)',
    molarMass: 151.0,
    pH: 6,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Manganese(II) sulfate dung dịch gần như không màu.',
    solubility: true,
  },
  {
    id: 'PbS',
    name: 'Lead(II) sulfide',
    formula: 'PbS',
    type: 'salt',
    state: 'solid',
    color: 'rgba(15, 23, 42, 0.98)',
    molarMass: 239.3,
    pH: 7,
    description: 'Lead(II) sulfide kết tủa màu đen đặc trưng.',
    solubility: false,
  },
  {
    id: 'NaClO',
    name: 'Sodium hypochlorite (Nước Javel)',
    formula: 'NaClO',
    type: 'salt',
    state: 'liquid',
    color: 'rgba(240, 253, 250, 0.4)',
    molarMass: 74.44,
    pH: 11,
    defaultConcentration: 0.5,
    defaultVolume: 50,
    description: 'Dung dịch Natri hypoclorit (Nước Javel) có tính tẩy màu mạnh.',
    solubility: true,
  },
  {
    id: 'HClO',
    name: 'Hypochlorous acid',
    formula: 'HClO',
    type: 'acid',
    state: 'liquid',
    color: 'rgba(240, 253, 250, 0.3)',
    molarMass: 52.46,
    pH: 4,
    defaultConcentration: 0.1,
    defaultVolume: 50,
    description: 'Axit hypoclorơ có tính oxi hóa & tẩy màu cực mạnh.',
    solubility: true,
  },

  // --- GASES ---
  {
    id: 'O2',
    name: 'Oxygen gas',
    formula: 'O2',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(220, 240, 255, 0.2)',
    molarMass: 32.0,
    pH: 7,
    description: 'Khí Oxygen duy trì sự cháy.',
  },
  {
    id: 'H2',
    name: 'Hydrogen gas',
    formula: 'H2',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(240, 245, 255, 0.15)',
    molarMass: 2.02,
    pH: 7,
    description: 'Khí Hydrogen nhẹ nhất.',
  },
  {
    id: 'CO2',
    name: 'Carbon dioxide gas',
    formula: 'CO2',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(240, 240, 240, 0.2)',
    molarMass: 44.01,
    pH: 5.5,
    description: 'Khí Carbon dioxide không màu.',
  },
  {
    id: 'SO2',
    name: 'Sulfur dioxide gas',
    formula: 'SO2',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(254, 240, 138, 0.3)',
    molarMass: 64.07,
    pH: 3.0,
    description: 'Khí Sulfur dioxide mùi hắc đặc trưng.',
  },
  {
    id: 'NO2',
    name: 'Nitrogen dioxide gas',
    formula: 'NO2',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(185, 28, 28, 0.65)',
    molarMass: 46.01,
    pH: 3.0,
    description: 'Khí Nitrogen dioxide màu nâu đỏ đặc trưng.',
  },
  {
    id: 'NO',
    name: 'Nitric oxide gas',
    formula: 'NO',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(240, 245, 255, 0.15)',
    molarMass: 30.01,
    pH: 7.0,
    description: 'Khí Nitric oxide không màu hóa nâu ngoài không khí.',
  },
  {
    id: 'H2S',
    name: 'Hydrogen sulfide gas',
    formula: 'H2S',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(240, 245, 255, 0.15)',
    molarMass: 34.08,
    pH: 4.5,
    description: 'Khí Hydrogen sulfide mùi trứng thối đặc trưng.',
  },
  {
    id: 'Cl2',
    name: 'Chlorine gas',
    formula: 'Cl2',
    type: 'gas_container',
    state: 'gas',
    color: 'rgba(163, 230, 53, 0.45)',
    molarMass: 70.9,
    pH: 4.0,
    description: 'Khí Chlorine độc màu vàng lục.',
  },

  // --- INDICATORS ---
  {
    id: 'Litmus',
    name: 'Dung dịch Quỳ tím',
    formula: 'Litmus',
    type: 'indicator',
    state: 'liquid',
    color: 'rgba(138, 43, 226, 0.75)',
    molarMass: 100,
    pH: 7,
    defaultConcentration: 0.1,
    defaultVolume: 20,
    description: 'Dung dịch Quỳ tím: Hóa đỏ trong môi trường Axit (pH < 5), xanh trong môi trường Kiềm (pH > 8).',
  },
  {
    id: 'Phenolphthalein',
    name: 'Phenolphthalein (Chỉ thị chuẩn độ)',
    formula: 'Phenolphthalein',
    type: 'indicator',
    state: 'liquid',
    color: 'rgba(255, 105, 180, 0.35)',
    molarMass: 318.32,
    pH: 7,
    defaultConcentration: 0.1,
    defaultVolume: 20,
    description: 'Phenolphthalein: Chỉ thị axit-bazơ chuẩn độ. Không màu trong môi trường Axit & Trung tính (pH < 8.2), hóa hồng tím rực rỡ trong môi trường Kiềm (pH ≥ 8.2).',
  },
  {
    id: 'UniversalIndicator',
    name: 'Chỉ thị vạn năng (Universal Indicator)',
    formula: 'UniversalIndicator',
    type: 'indicator',
    state: 'liquid',
    color: 'rgba(40, 180, 40, 0.75)',
    molarMass: 100,
    pH: 7,
    defaultConcentration: 0.1,
    defaultVolume: 20,
    description: 'Chỉ thị vạn năng: Đổi màu dải cầu vồng từ đỏ (pH 1) sang cam, vàng, lục, lam, chàm, tím (pH 14).',
  },
];

// REACTION DATABASE MATRIX (150 REACTIONS WITH FULL EVENT TRIGGERS)
export const CHEMICAL_REACTIONS: ChemicalReactionRule[] = [
  // Điều chế HNO3
  {
    id: 'rxn_NaNO3_H2SO4',
    name: 'NaNO3(rắn) + H2SO4(đặc) -> NaHSO4 + HNO3(g)',
    reactants: [
      { formula: 'NaNO3(rắn)', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 }, // H2SO4 đặc
    ],
    products: [
      { formula: 'NaHSO4', ratio: 1, state: 'aq' },
      { formula: 'HNO3', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'NaNO₃ (rắn) + H₂SO₄ (đặc) →(t°) NaHSO₄ + HNO₃↑ (hơi)',
    description: 'H2SO4 đặc đẩy HNO3 dễ bay hơi ra khỏi muối NaNO3 rắn ở nhiệt độ cao.',
    requiresHeat: true,
    eventTriggers: {
      bubbleEffect: { gasFormula: 'HNO3', gasName: 'Hơi HNO3', rate: 'vigorous' },
    },
  },
  // 1. BaCl2 + Na2SO4 -> BaSO4(s) + 2NaCl
  {
    id: 'rxn_001_BaCl2_Na2SO4',
    name: 'BaCl2 + Na2SO4 -> BaSO4 + 2NaCl',
    reactants: [
      { formula: 'BaCl2', ratio: 1 },
      { formula: 'Na2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'BaSO4', ratio: 1, state: 's' },
      { formula: 'NaCl', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'BaCl₂ (dd) + Na₂SO₄ (dd) → BaSO₄↓ (r) + 2NaCl (dd)',
    description: 'Xuất hiện kết tủa trắng BaSO4 không tan trong axit.',
    eventTriggers: {
      precipitateEffect: { formula: 'BaSO4', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(245, 245, 250, 0.8)' },
    },
  },
  // 1b. BaCl2 + H2SO4 -> BaSO4(s) + 2HCl
  {
    id: 'rxn_001b_BaCl2_H2SO4',
    name: 'BaCl2 + H2SO4 -> BaSO4 + 2HCl',
    reactants: [
      { formula: 'BaCl2', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'BaSO4', ratio: 1, state: 's' },
      { formula: 'HCl', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'BaCl₂ (dd) + H₂SO₄ (dd) → BaSO₄↓ (r) + 2HCl (dd)',
    description: 'Xuất hiện kết tủa trắng BaSO4 không tan trong axit.',
    eventTriggers: {
      precipitateEffect: { formula: 'BaSO4', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(245, 245, 250, 0.8)' },
    },
  },
  // 2. AgNO3 + NaCl -> AgCl(s) + NaNO3
  {
    id: 'rxn_002_AgNO3_NaCl',
    name: 'AgNO3 + NaCl -> AgCl + NaNO3',
    reactants: [
      { formula: 'AgNO3', ratio: 1 },
      { formula: 'NaCl', ratio: 1 },
    ],
    products: [
      { formula: 'AgCl', ratio: 1, state: 's' },
      { formula: 'NaNO3', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'AgNO₃ (dd) + NaCl (dd) → AgCl↓ (r) + NaNO₃ (dd)',
    description: 'Xuất hiện kết tủa trắng AgCl, bị hóa đen ngoài ánh sáng.',
    eventTriggers: {
      precipitateEffect: { formula: 'AgCl', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(240, 240, 245, 0.7)' },
    },
  },
  // 3. CuSO4 + 2NaOH -> Cu(OH)2(s) + Na2SO4
  {
    id: 'rxn_003_CuSO4_NaOH',
    name: 'CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4',
    reactants: [
      { formula: 'CuSO4', ratio: 1 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'Cu(OH)2', ratio: 1, state: 's' },
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'CuSO₄ (dd) + 2NaOH (dd) → Cu(OH)₂↓ (r) + Na₂SO₄ (dd)',
    description: 'Xuất hiện kết tủa màu xanh lam Cu(OH)2.',
    eventTriggers: {
      precipitateEffect: { formula: 'Cu(OH)2', color: 'rgba(2, 132, 199, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(186, 230, 253, 0.5)' },
    },
  },
  // 4. FeCl3 + 3NaOH -> Fe(OH)3(s) + 3NaCl
  {
    id: 'rxn_004_FeCl3_NaOH',
    name: 'FeCl3 + 3NaOH -> Fe(OH)3 + 3NaCl',
    reactants: [
      { formula: 'FeCl3', ratio: 1 },
      { formula: 'NaOH', ratio: 3 },
    ],
    products: [
      { formula: 'Fe(OH)3', ratio: 1, state: 's' },
      { formula: 'NaCl', ratio: 3, state: 'aq' },
    ],
    equationMarkdown: 'FeCl₃ (dd) + 3NaOH (dd) → Fe(OH)₃↓ (r) + 3NaCl (dd)',
    description: 'Xuất hiện kết tủa màu đỏ nâu Fe(OH)3.',
    eventTriggers: {
      precipitateEffect: { formula: 'Fe(OH)3', color: 'rgba(153, 27, 27, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(254, 226, 226, 0.6)' },
    },
  },
  // 5. FeSO4 + 2NaOH -> Fe(OH)2(s) + Na2SO4
  {
    id: 'rxn_005_FeSO4_NaOH',
    name: 'FeSO4 + 2NaOH -> Fe(OH)2 + Na2SO4',
    reactants: [
      { formula: 'FeSO4', ratio: 1 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'Fe(OH)2', ratio: 1, state: 's' },
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'FeSO₄ (dd) + 2NaOH (dd) → Fe(OH)₂↓ (r) + Na₂SO₄ (dd)',
    description: 'Kết tủa trắng xanh Fe(OH)2 chuyển dần sang đỏ nâu trong không khí.',
    eventTriggers: {
      precipitateEffect: { formula: 'Fe(OH)2', color: 'rgba(209, 250, 229, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(209, 250, 229, 0.5)' },
    },
  },
  // 6. AgNO3 + NaBr -> AgBr(s) + NaNO3
  {
    id: 'rxn_006_AgNO3_NaBr',
    name: 'AgNO3 + NaBr -> AgBr + NaNO3',
    reactants: [
      { formula: 'AgNO3', ratio: 1 },
      { formula: 'NaBr', ratio: 1 },
    ],
    products: [
      { formula: 'AgBr', ratio: 1, state: 's' },
      { formula: 'NaNO3', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'AgNO₃ (dd) + NaBr (dd) → AgBr↓ (r) + NaNO₃ (dd)',
    description: 'Xuất hiện kết tủa màu vàng nhạt AgBr.',
    eventTriggers: {
      precipitateEffect: { formula: 'AgBr', color: 'rgba(254, 240, 138, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(254, 240, 138, 0.6)' },
    },
  },
  // 7. AgNO3 + KI -> AgI(s) + KNO3
  {
    id: 'rxn_007_AgNO3_KI',
    name: 'AgNO3 + KI -> AgI + KNO3',
    reactants: [
      { formula: 'AgNO3', ratio: 1 },
      { formula: 'KI', ratio: 1 },
    ],
    products: [
      { formula: 'AgI', ratio: 1, state: 's' },
      { formula: 'KNO3', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'AgNO₃ (dd) + KI (dd) → AgI↓ (r) + KNO₃ (dd)',
    description: 'Xuất hiện kết tủa màu vàng đậm AgI.',
    eventTriggers: {
      precipitateEffect: { formula: 'AgI', color: 'rgba(234, 179, 8, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(254, 240, 138, 0.6)' },
    },
  },
  // 8. Pb(NO3)2 + 2KI -> PbI2(s) + 2KNO3 ("Mưa vàng")
  {
    id: 'rxn_008_PbNO32_KI',
    name: 'Pb(NO3)2 + 2KI -> PbI2 + 2KNO3',
    reactants: [
      { formula: 'Pb(NO3)2', ratio: 1 },
      { formula: 'KI', ratio: 2 },
    ],
    products: [
      { formula: 'PbI2', ratio: 1, state: 's' },
      { formula: 'KNO3', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'Pb(NO₃)₂ (dd) + 2KI (dd) → PbI₂↓ (r) + 2KNO₃ (dd)',
    description: 'Xuất hiện kết tủa màu vàng tươi PbI2 (hiệu ứng "mưa vàng").',
    eventTriggers: {
      precipitateEffect: { formula: 'PbI2', color: 'rgba(250, 204, 21, 0.98)', amount: 'heavy' },
      colorTransition: { to: 'rgba(254, 240, 138, 0.8)' },
    },
  },
  // 9. Ca(OH)2 + CO2 -> CaCO3(s) + H2O
  {
    id: 'rxn_009_CaOH2_CO2',
    name: 'Ca(OH)2 + CO2 -> CaCO3 + H2O',
    reactants: [
      { formula: 'Ca(OH)2', ratio: 1 },
      { formula: 'CO2', ratio: 1 },
    ],
    products: [
      { formula: 'CaCO3', ratio: 1, state: 's' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Ca(OH)₂ (dd) + CO₂ (k) → CaCO₃↓ (r) + H₂O (l)',
    description: 'Dung dịch nước vôi trong bị vẩn đục trắng.',
    eventTriggers: {
      precipitateEffect: { formula: 'CaCO3', color: 'rgba(255, 255, 255, 0.95)', amount: 'moderate' },
      colorTransition: { to: 'rgba(240, 240, 240, 0.7)' },
    },
  },
  // 10. CaCO3 + CO2 + H2O -> Ca(HCO3)2
  {
    id: 'rxn_010_CaCO3_CO2_H2O',
    name: 'CaCO3 + CO2 + H2O -> Ca(HCO3)2',
    reactants: [
      { formula: 'CaCO3', ratio: 1 },
      { formula: 'CO2', ratio: 1 },
    ],
    products: [
      { formula: 'Ca(HCO3)2', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'CaCO₃ (r) + CO₂ (k) + H₂O (l) → Ca(HCO₃)₂ (dd)',
    description: 'Kết tủa trắng tan dần, dung dịch trở nên trong suốt.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 11. Zn + 2HCl -> ZnCl2 + H2(g)
  {
    id: 'rxn_011_Zn_HCl',
    name: 'Zn + 2HCl -> ZnCl2 + H2',
    reactants: [
      { formula: 'Zn', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'ZnCl2', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Zn (r) + 2HCl (dd) → ZnCl₂ (dd) + H₂↑ (k)',
    heatChangeJ: -150000,
    description: 'Viên kẽm tan dần, sủi bọt khí không màu H2, tỏa nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 15 },
    },
  },
  // 12. CaCO3 + 2HCl -> CaCl2 + CO2(g) + H2O
  {
    id: 'rxn_012_CaCO3_HCl',
    name: 'CaCO3 + 2HCl -> CaCl2 + CO2 + H2O',
    reactants: [
      { formula: 'CaCO3', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'CaCl2', ratio: 1, state: 'aq' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'CaCO₃ (r) + 2HCl (dd) → CaCl₂ (dd) + CO₂↑ (k) + H₂O (l)',
    description: 'Đá vôi tan rã, sủi bọt khí mạnh không màu CO2.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // 13. Na2CO3 + 2HCl -> 2NaCl + CO2(g) + H2O
  {
    id: 'rxn_013_Na2CO3_HCl',
    name: 'Na2CO3 + 2HCl -> 2NaCl + CO2 + H2O',
    reactants: [
      { formula: 'Na2CO3', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'NaCl', ratio: 2, state: 'aq' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Na₂CO₃ (dd) + 2HCl (dd) → 2NaCl (dd) + CO₂↑ (k) + H₂O (l)',
    description: 'Dung dịch sủi bọt khí không màu mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // 14. Na2SO3 + H2SO4 -> Na2SO4 + SO2(g) + H2O
  {
    id: 'rxn_014_Na2SO3_H2SO4',
    name: 'Na2SO3 + H2SO4 -> Na2SO4 + SO2 + H2O',
    reactants: [
      { formula: 'Na2SO3', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
      { formula: 'SO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Na₂SO₃ (dd) + H₂SO₄ (dd) → Na₂SO₄ (dd) + SO₂↑ (k) + H₂O (l)',
    description: 'Có khí mùi hắc đặc trưng (SO2) thoát ra.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'SO2', gasName: 'Sulfur dioxide', rate: 'moderate' },
    },
  },
  // 15. FeS + 2HCl -> FeCl2 + H2S(g)
  {
    id: 'rxn_015_FeS_HCl',
    name: 'FeS + 2HCl -> FeCl2 + H2S',
    reactants: [
      { formula: 'FeS', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'FeCl2', ratio: 1, state: 'aq' },
      { formula: 'H2S', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'FeS (r) + 2HCl (dd) → FeCl₂ (dd) + H₂S↑ (k)',
    description: 'Bột đen tan dần, thoát ra khí có mùi trứng thối (H2S).',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2S', gasName: 'Hydrogen sulfide', rate: 'moderate' },
      colorTransition: { to: 'rgba(167, 243, 208, 0.4)' },
    },
  },
  // 16. 2Al + 2NaOH + 2H2O -> 2NaAlO2 + 3H2(g)
  {
    id: 'rxn_016_Al_NaOH',
    name: '2Al + 2NaOH + 2H2O -> 2NaAlO2 + 3H2',
    reactants: [
      { formula: 'Al', ratio: 2 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'H2', ratio: 3, state: 'g' },
    ],
    equationMarkdown: '2Al (r) + 2NaOH (dd) + 2H₂O (l) → 2NaAlO₂ (dd) + 3H₂↑ (k)',
    heatChangeJ: -400000,
    description: 'Lá nhôm tan dần, sủi bọt khí mãnh liệt, tỏa nhiều nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 25 },
    },
  },
  // 17. Cu + 4HNO3 (đặc) -> Cu(NO3)2 + 2NO2(g) + 2H2O
  {
    id: 'rxn_017_Cu_HNO3_dac',
    name: 'Cu + 4HNO3 (đặc) -> Cu(NO3)2 + 2NO2 + 2H2O',
    reactants: [
      { formula: 'Cu', ratio: 1 },
      { formula: 'HNO3', ratio: 4 },
    ],
    products: [
      { formula: 'Cu(NO3)2_dac', ratio: 1, state: 'aq' },
      { formula: 'NO2', ratio: 2, state: 'g' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Cu (r) + 4HNO₃ (đặc, dd) → Cu(NO₃)₂ (dd) + 2NO₂↑ (k) + 2H₂O (l)',
    description: 'Đồng tan, dung dịch chuyển sang màu xanh lục/lam, khí nâu đỏ NO2 thoát ra.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'NO2', gasName: 'Nitrogen dioxide', rate: 'vigorous', color: 'rgba(185, 28, 28, 0.85)' },
      colorTransition: { to: 'rgba(16, 185, 129, 0.8)' },
    },
  },
  // 18. 3Cu + 8HNO3 (loãng) -> 3Cu(NO3)2 + 2NO(g) + 4H2O
  {
    id: 'rxn_018_Cu_HNO3_loang',
    name: '3Cu + 8HNO3 (loãng) -> 3Cu(NO3)2 + 2NO + 4H2O',
    reactants: [
      { formula: 'Cu', ratio: 3 },
      { formula: 'HNO3', ratio: 8 },
    ],
    products: [
      { formula: 'Cu(NO3)2_loang', ratio: 3, state: 'aq' },
      { formula: 'NO', ratio: 2, state: 'g' },
      { formula: 'H2O', ratio: 4, state: 'l' },
    ],
    equationMarkdown: '3Cu (r) + 8HNO₃ (loãng, dd) → 3Cu(NO₃)₂ (dd) + 2NO↑ (k) + 4H₂O (l)',
    description: 'Đồng tan, dung dịch hóa xanh lam ngọc, khí không màu NO hóa nâu ngoài không khí.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'NO', gasName: 'Nitric oxide', rate: 'moderate', color: 'rgba(255, 255, 255, 0.1)' },
      colorTransition: { to: 'rgba(6, 182, 212, 0.65)' },
    },
  },
  // 19. Cu + 2H2SO4 (đặc, nóng) -> CuSO4 + SO2(g) + 2H2O
  {
    id: 'rxn_019_Cu_H2SO4_dac',
    name: 'Cu + 2H2SO4 (đặc, nóng) -> CuSO4 + SO2 + 2H2O',
    reactants: [
      { formula: 'Cu', ratio: 1 },
      { formula: 'H2SO4', ratio: 2 },
    ],
    products: [
      { formula: 'CuSO4', ratio: 1, state: 'aq' },
      { formula: 'SO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Cu (r) + 2H₂SO₄ (đặc, nóng) →(t°) CuSO₄ (dd) + SO₂↑ (k) + 2H₂O (l)',
    requiresHeat: true,
    minTempC: 50,
    description: 'Đồng tan, dung dịch hóa xanh lam, thoát khí SO2 mùi hắc.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'SO2', gasName: 'Sulfur dioxide', rate: 'moderate' },
      colorTransition: { to: 'rgba(2, 132, 199, 0.7)' },
    },
  },
  // 20. NH4Cl + NaOH -> NaCl + NH3(g) + H2O
  {
    id: 'rxn_020_NH4Cl_NaOH',
    name: 'NH4Cl + NaOH -> NaCl + NH3 + H2O',
    reactants: [
      { formula: 'NH4Cl', ratio: 1 },
      { formula: 'NaOH', ratio: 1 },
    ],
    products: [
      { formula: 'NaCl', ratio: 1, state: 'aq' },
      { formula: 'NH3', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'NH₄Cl (dd) + NaOH (dd) →(t°) NaCl (dd) + NH₃↑ (k) + H₂O (l)',
    requiresHeat: true,
    minTempC: 40,
    description: 'Khí NH3 mùi khai thoát ra, làm xanh giấy quỳ tím ẩm.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'NH3', gasName: 'Ammonia', rate: 'moderate' },
    },
  },
  // 21. Fe + CuSO4 -> FeSO4 + Cu(s)
  {
    id: 'rxn_021_Fe_CuSO4',
    name: 'Fe + CuSO4 -> FeSO4 + Cu',
    reactants: [
      { formula: 'Fe', ratio: 1 },
      { formula: 'CuSO4', ratio: 1 },
    ],
    products: [
      { formula: 'FeSO4', ratio: 1, state: 'aq' },
      { formula: 'Cu', ratio: 1, state: 's' },
    ],
    equationMarkdown: 'Fe (r) + CuSO₄ (dd) → FeSO₄ (dd) + Cu↓ (r)',
    description: 'Đinh sắt bám lớp kim loại màu đỏ xám (Cu), dung dịch xanh nhạt màu.',
    eventTriggers: {
      precipitateEffect: { formula: 'Cu', color: 'rgba(194, 65, 12, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(167, 243, 208, 0.5)' },
    },
  },
  // 22. 2Na + 2H2O -> 2NaOH + H2(g)
  {
    id: 'rxn_022_Na_H2O',
    name: '2Na + 2H2O -> 2NaOH + H2',
    reactants: [
      { formula: 'Na', ratio: 2 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'NaOH', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2Na (r) + 2H₂O (l) → 2NaOH (dd) + H₂↑ (k)',
    heatChangeJ: -368000,
    description: 'Na nóng chảy thành viên tròn chạy trên mặt nước, sủi khí, tỏa nhiệt mạnh.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 30 },
      shakeEffect: true,
    },
  },
  // 22b. 2Na + 2HCl -> 2NaCl + H2(g)
  {
    id: 'rxn_Na_HCl',
    name: '2Na + 2HCl -> 2NaCl + H2',
    reactants: [
      { formula: 'Na', ratio: 2 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'NaCl', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2Na (r) + 2HCl (dd) → 2NaCl (dd) + H₂↑ (k)',
    heatChangeJ: -480000,
    description: 'Sodium phản ứng mãnh liệt bốc cháy trong dung dịch HCl, sủi bọt khí H2 cực mạnh.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 45 },
      shakeEffect: true,
    },
  },
  // 22c. 2Na + H2SO4 -> Na2SO4 + H2(g)
  {
    id: 'rxn_Na_H2SO4',
    name: '2Na + H2SO4 -> Na2SO4 + H2',
    reactants: [
      { formula: 'Na', ratio: 2 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2Na (r) + H₂SO₄ (dd) → Na₂SO₄ (dd) + H₂↑ (k)',
    heatChangeJ: -500000,
    description: 'Sodium phản ứng mãnh liệt với H2SO4 loãng, phát nổ nhẹ và sủi khí H2.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 50 },
      shakeEffect: true,
    },
  },
  // 29. NaOH + HCl -> NaCl + H2O
  {
    id: 'rxn_029_NaOH_HCl',
    name: 'NaOH + HCl -> NaCl + H2O',
    reactants: [
      { formula: 'NaOH', ratio: 1 },
      { formula: 'HCl', ratio: 1 },
    ],
    products: [
      { formula: 'NaCl', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'NaOH (dd) + HCl (dd) → NaCl (dd) + H₂O (l)',
    heatChangeJ: -57000,
    description: 'Tỏa nhiệt nhẹ; dung dịch Phenolphtalein từ màu hồng chuyển thành không màu.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 8 },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 30. Cu(OH)2 + 2HCl -> CuCl2 + 2H2O
  {
    id: 'rxn_030_CuOH2_HCl',
    name: 'Cu(OH)2 + 2HCl -> CuCl2 + 2H2O',
    reactants: [
      { formula: 'Cu(OH)2', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'CuCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Cu(OH)₂ (r) + 2HCl (dd) → CuCl₂ (dd) + 2H₂O (l)',
    description: 'Kết tủa xanh lam tan rã, thu được dung dịch màu xanh.',
    eventTriggers: {
      colorTransition: { to: 'rgba(56, 189, 248, 0.6)' },
    },
  },
  // 51. 2FeCl2 + Cl2 -> 2FeCl3
  {
    id: 'rxn_051_FeCl2_Cl2',
    name: '2FeCl2 + Cl2 -> 2FeCl3',
    reactants: [
      { formula: 'FeCl2', ratio: 2 },
      { formula: 'Cl2', ratio: 1 },
    ],
    products: [
      { formula: 'FeCl3', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: '2FeCl₂ (dd) + Cl₂ (k) → 2FeCl₃ (dd)',
    description: 'Dung dịch từ màu xanh nhạt (Fe2+) chuyển sang màu vàng nâu (Fe3+).',
    eventTriggers: {
      colorTransition: { to: 'rgba(217, 119, 6, 0.8)' },
    },
  },
  // 55. H2S + CuSO4 -> CuS(s) + H2SO4
  {
    id: 'rxn_055_H2S_CuSO4',
    name: 'H2S + CuSO4 -> CuS + H2SO4',
    reactants: [
      { formula: 'H2S', ratio: 1 },
      { formula: 'CuSO4', ratio: 1 },
    ],
    products: [
      { formula: 'CuS', ratio: 1, state: 's' },
      { formula: 'H2SO4', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'H₂S (k) + CuSO₄ (dd) → CuS↓ (r) + H₂SO₄ (dd)',
    description: 'Xuất hiện kết tủa màu đen CuS không tan trong các axit loãng.',
    eventTriggers: {
      precipitateEffect: { formula: 'CuS', color: 'rgba(24, 24, 27, 0.98)', amount: 'heavy' },
      colorTransition: { to: 'rgba(30, 41, 59, 0.8)' },
    },
  },
  // 56. Fe2O3 + 6HCl -> 2FeCl3 + 3H2O
  {
    id: 'rxn_056_Fe2O3_HCl',
    name: 'Fe2O3 + 6HCl -> 2FeCl3 + 3H2O',
    reactants: [
      { formula: 'Fe2O3', ratio: 1 },
      { formula: 'HCl', ratio: 6 },
    ],
    products: [
      { formula: 'FeCl3', ratio: 2, state: 'aq' },
      { formula: 'H2O', ratio: 3, state: 'l' },
    ],
    equationMarkdown: 'Fe₂O₃ (r) + 6HCl (dd) → 2FeCl₃ (dd) + 3H₂O (l)',
    description: 'Bột Fe2O3 màu đỏ nâu tan ra, tạo dung dịch có màu vàng nâu.',
    eventTriggers: {
      colorTransition: { to: 'rgba(217, 119, 6, 0.8)' },
    },
  },
  // 57. CuO + H2SO4 -> CuSO4 + H2O
  {
    id: 'rxn_057_CuO_H2SO4',
    name: 'CuO + H2SO4 -> CuSO4 + H2O',
    reactants: [
      { formula: 'CuO', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'CuSO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'CuO (r) + H₂SO₄ (dd) → CuSO₄ (dd) + H₂O (l)',
    description: 'Bột CuO màu đen tan rã, dung dịch chuyển sang màu xanh lam.',
    eventTriggers: {
      colorTransition: { to: 'rgba(2, 132, 199, 0.75)' },
    },
  },
  // 58. 2K + 2H2O -> 2KOH + H2(g)
  {
    id: 'rxn_058_K_H2O',
    name: '2K + 2H2O -> 2KOH + H2',
    reactants: [
      { formula: 'K', ratio: 2 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'KOH', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2K (r) + 2H₂O (l) → 2KOH (dd) + H₂↑ (k)',
    heatChangeJ: -390000,
    description: 'Kali nóng chảy bốc cháy ngọn lửa màu tím, sủi bọt khí mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 35 },
      shakeEffect: true,
    },
  },
  // 58b. 2K + 2HCl -> 2KCl + H2(g)
  {
    id: 'rxn_K_HCl',
    name: '2K + 2HCl -> 2KCl + H2',
    reactants: [
      { formula: 'K', ratio: 2 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'KCl', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2K (r) + 2HCl (dd) → 2KCl (dd) + H₂↑ (k)',
    heatChangeJ: -520000,
    description: 'Kali bốc cháy cực mạnh ngọn lửa màu tím trong axit HCl, sủi bọt khí H2 vùn vụt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 50 },
      shakeEffect: true,
    },
  },
  // 58c. 2Li + 2H2O -> 2LiOH + H2(g)
  {
    id: 'rxn_Li_H2O',
    name: '2Li + 2H2O -> 2LiOH + H2',
    reactants: [
      { formula: 'Li', ratio: 2 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'LiOH', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2Li (r) + 2H₂O (l) → 2LiOH (dd) + H₂↑ (k)',
    heatChangeJ: -222000,
    description: 'Lithium phản ứng êm dịu trên mặt nước, sủi khí H2 và tạo giải pháp kiềm LiOH.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'moderate' },
      heatEffect: { isExothermic: true, tempRiseC: 20 },
    },
  },
  // 58d. 2Li + 2HCl -> 2LiCl + H2(g)
  {
    id: 'rxn_Li_HCl',
    name: '2Li + 2HCl -> 2LiCl + H2',
    reactants: [
      { formula: 'Li', ratio: 2 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'LiCl', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: '2Li (r) + 2HCl (dd) → 2LiCl (dd) + H₂↑ (k)',
    heatChangeJ: -350000,
    description: 'Lithium phản ứng nhanh với dung dịch axit HCl, sủi bọt khí H2 tỏa nhiều nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 30 },
      shakeEffect: true,
    },
  },
  // 59. Ca + 2H2O -> Ca(OH)2 + H2(g)
  {
    id: 'rxn_059_Ca_H2O',
    name: 'Ca + 2H2O -> Ca(OH)2 + H2',
    reactants: [
      { formula: 'Ca', ratio: 1 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'Ca(OH)2', ratio: 1, state: 's' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Ca (r) + 2H₂O (l) → Ca(OH)₂↓ (r) + H₂↑ (k)',
    heatChangeJ: -220000,
    description: 'Canxi phản ứng với nước sủi bọt khí H2 và tạo váng kết tủa đục Ca(OH)2.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      precipitateEffect: { formula: 'Ca(OH)2', color: 'rgba(255, 255, 255, 0.9)', amount: 'heavy' },
      heatEffect: { isExothermic: true, tempRiseC: 18 },
    },
  },
  // 59b. Ca + 2HCl -> CaCl2 + H2(g)
  {
    id: 'rxn_Ca_HCl',
    name: 'Ca + 2HCl -> CaCl2 + H2',
    reactants: [
      { formula: 'Ca', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'CaCl2', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Ca (r) + 2HCl (dd) → CaCl₂ (dd) + H₂↑ (k)',
    heatChangeJ: -380000,
    description: 'Canxi tan nhanh trong axit HCl sủi bọt khí H2 mãnh liệt và tỏa nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 32 },
    },
  },
  // 59c. Ca + H2SO4 -> CaSO4 + H2(g)
  {
    id: 'rxn_Ca_H2SO4',
    name: 'Ca + H2SO4 -> CaSO4 + H2',
    reactants: [
      { formula: 'Ca', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'CaSO4', ratio: 1, state: 's' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Ca (r) + H₂SO₄ (dd) → CaSO₄↓ (r) + H₂↑ (k)',
    heatChangeJ: -360000,
    description: 'Canxi tác dụng với H2SO4 sủi khí H2 và sinh ra kết tủa trắng CaSO4 bám ngoài.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'moderate' },
      precipitateEffect: { formula: 'CaSO4', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      heatEffect: { isExothermic: true, tempRiseC: 25 },
    },
  },
  // 60. Ba + 2H2O -> Ba(OH)2 + H2(g)
  {
    id: 'rxn_060_Ba_H2O',
    name: 'Ba + 2H2O -> Ba(OH)2 + H2',
    reactants: [
      { formula: 'Ba', ratio: 1 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'Ba(OH)2', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Ba (r) + 2H₂O (l) → Ba(OH)₂ (dd) + H₂↑ (k)',
    heatChangeJ: -290000,
    description: 'Bari phản ứng mạnh với nước sủi bọt khí H2 nhanh chóng và tỏa nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 25 },
      shakeEffect: true,
    },
  },
  // 60b. Ba + 2HCl -> BaCl2 + H2(g)
  {
    id: 'rxn_Ba_HCl',
    name: 'Ba + 2HCl -> BaCl2 + H2',
    reactants: [
      { formula: 'Ba', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'BaCl2', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Ba (r) + 2HCl (dd) → BaCl₂ (dd) + H₂↑ (k)',
    heatChangeJ: -440000,
    description: 'Bari phản ứng rất mạnh trong dung dịch axit HCl, sủi bọt khí H2 mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 40 },
      shakeEffect: true,
    },
  },
  // 60c. Ba + H2SO4 -> BaSO4 + H2(g)
  {
    id: 'rxn_Ba_H2SO4',
    name: 'Ba + H2SO4 -> BaSO4 + H2',
    reactants: [
      { formula: 'Ba', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'BaSO4', ratio: 1, state: 's' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Ba (r) + H₂SO₄ (dd) → BaSO₄↓ (r) + H₂↑ (k)',
    heatChangeJ: -460000,
    description: 'Bari tác dụng với H2SO4 sủi khí H2 và tạo kết tủa trắng BaSO4 cực bền.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      precipitateEffect: { formula: 'BaSO4', color: 'rgba(255, 255, 255, 0.98)', amount: 'heavy' },
      heatEffect: { isExothermic: true, tempRiseC: 35 },
    },
  },
  // 60d. Mg + 2H2O -> Mg(OH)2 + H2(g) (Đun nóng)
  {
    id: 'rxn_Mg_H2O',
    name: 'Mg + 2H2O -> Mg(OH)2 + H2',
    requiresHeat: true,
    minTempC: 60,
    reactants: [
      { formula: 'Mg', ratio: 1 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'Mg(OH)2', ratio: 1, state: 's' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Mg (r) + 2H₂O (l) -t°→ Mg(OH)₂↓ (r) + H₂↑ (k)',
    heatChangeJ: -80000,
    description: 'Magie phản ứng chậm với nước nóng, sủi bọt khí H2 nhẹ và đục dung dịch do Mg(OH)2.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'moderate' },
      precipitateEffect: { formula: 'Mg(OH)2', color: 'rgba(255, 255, 255, 0.85)', amount: 'light' },
    },
  },
  // 65. Zn + CuSO4 -> ZnSO4 + Cu(s)
  {
    id: 'rxn_065_Zn_CuSO4',
    name: 'Zn + CuSO4 -> ZnSO4 + Cu',
    reactants: [
      { formula: 'Zn', ratio: 1 },
      { formula: 'CuSO4', ratio: 1 },
    ],
    products: [
      { formula: 'Cu', ratio: 1, state: 's' },
    ],
    equationMarkdown: 'Zn (r) + CuSO₄ (dd) → ZnSO₄ (dd) + Cu↓ (r)',
    description: 'Kẽm tan dần, kim loại đồng màu đỏ bám ra ngoài, màu xanh nhạt đi.',
    eventTriggers: {
      precipitateEffect: { formula: 'Cu', color: 'rgba(194, 65, 12, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 82. Ba(OH)2 + H2SO4 -> BaSO4(s) + 2H2O
  {
    id: 'rxn_082_BaOH2_H2SO4',
    name: 'Ba(OH)2 + H2SO4 -> BaSO4 + 2H2O',
    reactants: [
      { formula: 'Ba(OH)2', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'BaSO4', ratio: 1, state: 's' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Ba(OH)₂ (dd) + H₂SO₄ (dd) → BaSO₄↓ (r) + 2H₂O (l)',
    description: 'Tạo kết tủa màu trắng BaSO4, độ dẫn điện giảm rõ rệt.',
    eventTriggers: {
      precipitateEffect: { formula: 'BaSO4', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(240, 240, 245, 0.7)' },
    },
  },
  // 84. Cu + 2AgNO3 -> Cu(NO3)2 + 2Ag(s)
  {
    id: 'rxn_084_Cu_AgNO3',
    name: 'Cu + 2AgNO3 -> Cu(NO3)2 + 2Ag',
    reactants: [
      { formula: 'Cu', ratio: 1 },
      { formula: 'AgNO3', ratio: 2 },
    ],
    products: [
      { formula: 'Ag', ratio: 2, state: 's' },
    ],
    equationMarkdown: 'Cu (r) + 2AgNO₃ (dd) → Cu(NO₃)₂ (dd) + 2Ag↓ (r)',
    description: 'Dây đồng tan, tinh thể Bạc bám bên ngoài, dung dịch chuyển sang xanh lam.',
    eventTriggers: {
      precipitateEffect: { formula: 'Ag', color: 'rgba(226, 232, 240, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(2, 132, 199, 0.6)' },
    },
  },
  // 86. Na2O + H2O -> 2NaOH
  {
    id: 'rxn_086_Na2O_H2O',
    name: 'Na2O + H2O -> 2NaOH',
    reactants: [
      { formula: 'Na2O', ratio: 1 },
      { formula: 'H2O', ratio: 1 },
    ],
    products: [
      { formula: 'NaOH', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'Na₂O (r) + H₂O (l) → 2NaOH (dd)',
    heatChangeJ: -100000,
    description: 'Bột màu trắng tan hoàn toàn, tỏa nhiệt mạnh tạo dung dịch kiềm trong suốt.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 18 },
    },
  },
  // 87. CaO + H2O -> Ca(OH)2
  {
    id: 'rxn_087_CaO_H2O',
    name: 'CaO + H2O -> Ca(OH)2',
    reactants: [
      { formula: 'CaO', ratio: 1 },
      { formula: 'H2O', ratio: 1 },
    ],
    products: [
      { formula: 'Ca(OH)2', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'CaO (r) + H₂O (l) → Ca(OH)₂ (r/dd)',
    heatChangeJ: -65000,
    description: 'Phản ứng tôi vôi: tỏa nhiều nhiệt, vôi sống nở ra thành chất màu trắng.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 22 },
    },
  },
  // 112. NaHCO3 + HCl -> NaCl + CO2(g) + H2O
  {
    id: 'rxn_112_NaHCO3_HCl',
    name: 'NaHCO3 + HCl -> NaCl + CO2 + H2O',
    reactants: [
      { formula: 'NaHCO3', ratio: 1 },
      { formula: 'HCl', ratio: 1 },
    ],
    products: [
      { formula: 'NaCl', ratio: 1, state: 'aq' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'NaHCO₃ (dd) + HCl (dd) → NaCl (dd) + CO₂↑ (k) + H₂O (l)',
    description: 'Dung dịch sủi bọt khí mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // 140. MgCl2 + 2NaOH -> Mg(OH)2(s) + 2NaCl
  {
    id: 'rxn_140_MgCl2_NaOH',
    name: 'MgCl2 + 2NaOH -> Mg(OH)2 + 2NaCl',
    reactants: [
      { formula: 'MgCl2', ratio: 1 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'Mg(OH)2', ratio: 1, state: 's' },
      { formula: 'NaCl', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'MgCl₂ (dd) + 2NaOH (dd) → Mg(OH)₂↓ (r) + 2NaCl (dd)',
    description: 'Xuất hiện kết tủa keo trắng Mg(OH)2.',
    eventTriggers: {
      precipitateEffect: { formula: 'Mg(OH)2', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(240, 240, 245, 0.7)' },
    },
  },
  // 148. Ca(OH)2 + Na2CO3 -> CaCO3(s) + 2NaOH
  {
    id: 'rxn_148_CaOH2_Na2CO3',
    name: 'Ca(OH)2 + Na2CO3 -> CaCO3 + 2NaOH',
    reactants: [
      { formula: 'Ca(OH)2', ratio: 1 },
      { formula: 'Na2CO3', ratio: 1 },
    ],
    products: [
      { formula: 'CaCO3', ratio: 1, state: 's' },
      { formula: 'NaOH', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'Ca(OH)₂ (dd) + Na₂CO₃ (dd) → CaCO₃↓ (r) + 2NaOH (dd)',
    description: 'Xuất hiện kết tủa trắng CaCO3 (phương pháp xút hóa vôi).',
    eventTriggers: {
      precipitateEffect: { formula: 'CaCO3', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
      colorTransition: { to: 'rgba(240, 240, 245, 0.7)' },
    },
  },
  // Cu(OH)2 + H2SO4 -> CuSO4 + 2H2O
  {
    id: 'rxn_CuOH2_H2SO4',
    name: 'Cu(OH)2 + H2SO4 -> CuSO4 + 2H2O',
    reactants: [
      { formula: 'Cu(OH)2', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'CuSO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Cu(OH)₂ (r) + H₂SO₄ (dd) → CuSO₄ (dd) + 2H₂O (l)',
    description: 'Kết tủa xanh lam Cu(OH)2 tan rã trong H2SO4, thu được dung dịch màu xanh lam.',
    eventTriggers: {
      colorTransition: { to: 'rgba(2, 132, 199, 0.75)' },
    },
  },
  // Fe(OH)3 + 3HCl -> FeCl3 + 3H2O
  {
    id: 'rxn_FeOH3_HCl',
    name: 'Fe(OH)3 + 3HCl -> FeCl3 + 3H2O',
    reactants: [
      { formula: 'Fe(OH)3', ratio: 1 },
      { formula: 'HCl', ratio: 3 },
    ],
    products: [
      { formula: 'FeCl3', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 3, state: 'l' },
    ],
    equationMarkdown: 'Fe(OH)₃ (r) + 3HCl (dd) → FeCl₃ (dd) + 3H₂O (l)',
    description: 'Kết tủa đỏ nâu Fe(OH)3 tan rã, thu được dung dịch màu vàng nâu.',
    eventTriggers: {
      colorTransition: { to: 'rgba(217, 119, 6, 0.8)' },
    },
  },
  // 2Fe(OH)3 + 3H2SO4 -> Fe2(SO4)3 + 6H2O
  {
    id: 'rxn_FeOH3_H2SO4',
    name: '2Fe(OH)3 + 3H2SO4 -> Fe2(SO4)3 + 6H2O',
    reactants: [
      { formula: 'Fe(OH)3', ratio: 2 },
      { formula: 'H2SO4', ratio: 3 },
    ],
    products: [
      { formula: 'Fe2(SO4)3', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 6, state: 'l' },
    ],
    equationMarkdown: '2Fe(OH)₃ (r) + 3H₂SO₄ (dd) → Fe₂(SO₄)₃ (dd) + 6H₂O (l)',
    description: 'Kết tủa đỏ nâu Fe(OH)3 tan rã trong dung dịch H2SO4.',
    eventTriggers: {
      colorTransition: { to: 'rgba(217, 119, 6, 0.5)' },
    },
  },
  // Fe(OH)2 + 2HCl -> FeCl2 + 2H2O
  {
    id: 'rxn_FeOH2_HCl',
    name: 'Fe(OH)2 + 2HCl -> FeCl2 + 2H2O',
    reactants: [
      { formula: 'Fe(OH)2', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'FeCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Fe(OH)₂ (r) + 2HCl (dd) → FeCl₂ (dd) + 2H₂O (l)',
    description: 'Kết tủa trắng xanh Fe(OH)2 tan rã, thu được dung dịch màu xanh nhạt.',
    eventTriggers: {
      colorTransition: { to: 'rgba(167, 243, 208, 0.5)' },
    },
  },
  // Fe(OH)2 + H2SO4 -> FeSO4 + 2H2O
  {
    id: 'rxn_FeOH2_H2SO4',
    name: 'Fe(OH)2 + H2SO4 -> FeSO4 + 2H2O',
    reactants: [
      { formula: 'Fe(OH)2', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'FeSO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Fe(OH)₂ (r) + H₂SO₄ (dd) → FeSO₄ (dd) + 2H₂O (l)',
    description: 'Kết tủa trắng xanh Fe(OH)2 tan rã trong H2SO4.',
    eventTriggers: {
      colorTransition: { to: 'rgba(167, 243, 208, 0.5)' },
    },
  },
  // Al(OH)3 + 3HCl -> AlCl3 + 3H2O
  {
    id: 'rxn_AlOH3_HCl',
    name: 'Al(OH)3 + 3HCl -> AlCl3 + 3H2O',
    reactants: [
      { formula: 'Al(OH)3', ratio: 1 },
      { formula: 'HCl', ratio: 3 },
    ],
    products: [
      { formula: 'AlCl3', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 3, state: 'l' },
    ],
    equationMarkdown: 'Al(OH)₃ (r) + 3HCl (dd) → AlCl₃ (dd) + 3H₂O (l)',
    description: 'Kết tủa keo trắng Al(OH)3 tan hoàn toàn trong axit HCl tạo dung dịch trong suốt.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 2Al(OH)3 + 3H2SO4 -> Al2(SO4)3 + 6H2O
  {
    id: 'rxn_AlOH3_H2SO4',
    name: '2Al(OH)3 + 3H2SO4 -> Al2(SO4)3 + 6H2O',
    reactants: [
      { formula: 'Al(OH)3', ratio: 2 },
      { formula: 'H2SO4', ratio: 3 },
    ],
    products: [
      { formula: 'Al2(SO4)3', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 6, state: 'l' },
    ],
    equationMarkdown: '2Al(OH)₃ (r) + 3H₂SO₄ (dd) → Al₂(SO₄)₃ (dd) + 6H₂O (l)',
    description: 'Kết tủa keo trắng Al(OH)3 tan rã hoàn toàn trong dung dịch H2SO4.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Al(OH)3 + NaOH -> NaAlO2 + 2H2O
  {
    id: 'rxn_AlOH3_NaOH',
    name: 'Al(OH)3 + NaOH -> NaAlO2 + 2H2O',
    reactants: [
      { formula: 'Al(OH)3', ratio: 1 },
      { formula: 'NaOH', ratio: 1 },
    ],
    products: [
      { formula: 'NaAlO2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Al(OH)₃ (r) + NaOH (dd) → NaAlO₂ (dd) + 2H₂O (l)',
    description: 'Kết tủa keo trắng Al(OH)3 tan rã trong dung dịch xút NaOH dư.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Zn(OH)2 + 2HCl -> ZnCl2 + 2H2O
  {
    id: 'rxn_ZnOH2_HCl',
    name: 'Zn(OH)2 + 2HCl -> ZnCl2 + 2H2O',
    reactants: [
      { formula: 'Zn(OH)2', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'ZnCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Zn(OH)₂ (r) + 2HCl (dd) → ZnCl₂ (dd) + 2H₂O (l)',
    description: 'Kết tủa trắng Zn(OH)2 tan rã trong dung dịch axit HCl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Zn(OH)2 + 2NaOH -> Na2ZnO2 + 2H2O
  {
    id: 'rxn_ZnOH2_NaOH',
    name: 'Zn(OH)2 + 2NaOH -> Na2ZnO2 + 2H2O',
    reactants: [
      { formula: 'Zn(OH)2', ratio: 1 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'Na2ZnO2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Zn(OH)₂ (r) + 2NaOH (dd) → Na₂ZnO₂ (dd) + 2H₂O (l)',
    description: 'Kết tủa trắng Zn(OH)2 tan rã trong dung dịch NaOH dư.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Mg(OH)2 + 2HCl -> MgCl2 + 2H2O
  {
    id: 'rxn_MgOH2_HCl',
    name: 'Mg(OH)2 + 2HCl -> MgCl2 + 2H2O',
    reactants: [
      { formula: 'Mg(OH)2', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'MgCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Mg(OH)₂ (r) + 2HCl (dd) → MgCl₂ (dd) + 2H₂O (l)',
    description: 'Kết tủa trắng Mg(OH)2 tan rã hoàn toàn trong dung dịch HCl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Mg(OH)2 + H2SO4 -> MgSO4 + 2H2O
  {
    id: 'rxn_MgOH2_H2SO4',
    name: 'Mg(OH)2 + H2SO4 -> MgSO4 + 2H2O',
    reactants: [
      { formula: 'Mg(OH)2', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'MgSO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Mg(OH)₂ (r) + H₂SO₄ (dd) → MgSO₄ (dd) + 2H₂O (l)',
    description: 'Kết tủa trắng Mg(OH)2 tan rã trong dung dịch H2SO4.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Ca(OH)2 + 2HCl -> CaCl2 + 2H2O
  {
    id: 'rxn_CaOH2_HCl',
    name: 'Ca(OH)2 + 2HCl -> CaCl2 + 2H2O',
    reactants: [
      { formula: 'Ca(OH)2', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'CaCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Ca(OH)₂ (r/dd) + 2HCl (dd) → CaCl₂ (dd) + 2H₂O (l)',
    description: 'Nước vôi / vẩn đục Ca(OH)2 tan rã hoàn toàn trong axit HCl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Ba(OH)2 + 2HCl -> BaCl2 + 2H2O
  {
    id: 'rxn_BaOH2_HCl',
    name: 'Ba(OH)2 + 2HCl -> BaCl2 + 2H2O',
    reactants: [
      { formula: 'Ba(OH)2', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'BaCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: 'Ba(OH)₂ (dd) + 2HCl (dd) → BaCl₂ (dd) + 2H₂O (l)',
    description: 'Phản ứng trung hòa giữa Ba(OH)2 và HCl tỏa nhiệt.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 8 },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // KOH + HCl -> KCl + H2O
  {
    id: 'rxn_KOH_HCl',
    name: 'KOH + HCl -> KCl + H2O',
    reactants: [
      { formula: 'KOH', ratio: 1 },
      { formula: 'HCl', ratio: 1 },
    ],
    products: [
      { formula: 'KCl', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'KOH (dd) + HCl (dd) → KCl (dd) + H₂O (l)',
    description: 'Phản ứng trung hòa giữa dung dịch KOH và axit HCl tỏa nhiệt.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 8 },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 2KOH + H2SO4 -> K2SO4 + 2H2O
  {
    id: 'rxn_KOH_H2SO4',
    name: '2KOH + H2SO4 -> K2SO4 + 2H2O',
    reactants: [
      { formula: 'KOH', ratio: 2 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'K2SO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: '2KOH (dd) + H₂SO₄ (dd) → K₂SO₄ (dd) + 2H₂O (l)',
    description: 'Phản ứng trung hòa giữa KOH và H2SO4.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 10 },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 2NaOH + H2SO4 -> Na2SO4 + 2H2O
  {
    id: 'rxn_NaOH_H2SO4',
    name: '2NaOH + H2SO4 -> Na2SO4 + 2H2O',
    reactants: [
      { formula: 'NaOH', ratio: 2 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: '2NaOH (dd) + H₂SO₄ (dd) → Na₂SO₄ (dd) + 2H₂O (l)',
    description: 'Phản ứng trung hòa mãnh liệt giữa NaOH và H2SO4 tỏa nhiệt.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 12 },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // NaOH + HNO3 -> NaNO3 + H2O
  {
    id: 'rxn_NaOH_HNO3',
    name: 'NaOH + HNO3 -> NaNO3 + H2O',
    reactants: [
      { formula: 'NaOH', ratio: 1 },
      { formula: 'HNO3', ratio: 1 },
    ],
    products: [
      { formula: 'NaNO3', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'NaOH (dd) + HNO₃ (dd) → NaNO₃ (dd) + H₂O (l)',
    description: 'Phản ứng trung hòa giữa dung dịch NaOH và HNO3.',
    eventTriggers: {
      heatEffect: { isExothermic: true, tempRiseC: 8 },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Mg + 2HCl -> MgCl2 + H2
  {
    id: 'rxn_Mg_HCl',
    name: 'Mg + 2HCl -> MgCl2 + H2',
    reactants: [
      { formula: 'Mg', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'MgCl2', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Mg (r) + 2HCl (dd) → MgCl₂ (dd) + H₂↑ (k)',
    description: 'Dải magie tan nhanh, sủi bọt khí H2 không màu mãnh liệt, tỏa nhiều nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 20 },
    },
  },
  // Fe + 2HCl -> FeCl2 + H2
  {
    id: 'rxn_Fe_HCl',
    name: 'Fe + 2HCl -> FeCl2 + H2',
    reactants: [
      { formula: 'Fe', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'FeCl2', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Fe (r) + 2HCl (dd) → FeCl₂ (dd) + H₂↑ (k)',
    description: 'Đinh sắt tan dần, sủi bọt khí H2 không màu, dung dịch chuyển màu xanh nhạt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'moderate' },
      colorTransition: { to: 'rgba(167, 243, 208, 0.4)' },
    },
  },
  // 2Al + 6HCl -> 2AlCl3 + 3H2
  {
    id: 'rxn_Al_HCl',
    name: '2Al + 6HCl -> 2AlCl3 + 3H2',
    reactants: [
      { formula: 'Al', ratio: 2 },
      { formula: 'HCl', ratio: 6 },
    ],
    products: [
      { formula: 'AlCl3', ratio: 2, state: 'aq' },
      { formula: 'H2', ratio: 3, state: 'g' },
    ],
    equationMarkdown: '2Al (r) + 6HCl (dd) → 2AlCl₃ (dd) + 3H₂↑ (k)',
    description: 'Lá nhôm tan rã, sủi bọt khí H2 vô cùng mãnh liệt, tỏa nhiều nhiệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
      heatEffect: { isExothermic: true, tempRiseC: 25 },
    },
  },
  // Mg + H2SO4 -> MgSO4 + H2
  {
    id: 'rxn_Mg_H2SO4',
    name: 'Mg + H2SO4 -> MgSO4 + H2',
    reactants: [
      { formula: 'Mg', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'MgSO4', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Mg (r) + H₂SO₄ (dd) → MgSO₄ (dd) + H₂↑ (k)',
    description: 'Dải magie tan trong H2SO4 loãng, sủi bọt khí H2 mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
    },
  },
  // Fe + H2SO4 -> FeSO4 + H2
  {
    id: 'rxn_Fe_H2SO4',
    name: 'Fe + H2SO4 -> FeSO4 + H2',
    reactants: [
      { formula: 'Fe', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'FeSO4', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Fe (r) + H₂SO₄ (dd) → FeSO₄ (dd) + H₂↑ (k)',
    description: 'Đinh sắt tan trong H2SO4 loãng, sủi bọt khí H2, dung dịch hóa xanh nhạt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'moderate' },
      colorTransition: { to: 'rgba(167, 243, 208, 0.4)' },
    },
  },
  // 2Al + 3H2SO4 -> Al2(SO4)3 + 3H2
  {
    id: 'rxn_Al_H2SO4',
    name: '2Al + 3H2SO4 -> Al2(SO4)3 + 3H2',
    reactants: [
      { formula: 'Al', ratio: 2 },
      { formula: 'H2SO4', ratio: 3 },
    ],
    products: [
      { formula: 'Al2(SO4)3', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 3, state: 'g' },
    ],
    equationMarkdown: '2Al (r) + 3H₂SO₄ (dd) → Al₂(SO₄)₃ (dd) + 3H₂↑ (k)',
    description: 'Lá nhôm tan trong dung dịch H2SO4 loãng, sủi bọt khí H2 mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
    },
  },
  // Zn + H2SO4 -> ZnSO4 + H2
  {
    id: 'rxn_Zn_H2SO4',
    name: 'Zn + H2SO4 -> ZnSO4 + H2',
    reactants: [
      { formula: 'Zn', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'ZnSO4', ratio: 1, state: 'aq' },
      { formula: 'H2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Zn (r) + H₂SO₄ (dd) → ZnSO₄ (dd) + H₂↑ (k)',
    description: 'Viên kẽm tan trong H2SO4 loãng, sủi bọt khí H2.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2', gasName: 'Hydrogen', rate: 'vigorous' },
    },
  },
  // CuO + 2HCl -> CuCl2 + H2O
  {
    id: 'rxn_CuO_HCl',
    name: 'CuO + 2HCl -> CuCl2 + H2O',
    reactants: [
      { formula: 'CuO', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'CuCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'CuO (r) + 2HCl (dd) → CuCl₂ (dd) + H₂O (l)',
    description: 'Bột CuO màu đen tan rã trong dung dịch HCl, thu được dung dịch CuCl2 màu xanh lam.',
    eventTriggers: {
      colorTransition: { to: 'rgba(56, 189, 248, 0.7)' },
    },
  },
  // Fe2O3 + 3H2SO4 -> Fe2(SO4)3 + 3H2O
  {
    id: 'rxn_Fe2O3_H2SO4',
    name: 'Fe2O3 + 3H2SO4 -> Fe2(SO4)3 + 3H2O',
    reactants: [
      { formula: 'Fe2O3', ratio: 1 },
      { formula: 'H2SO4', ratio: 3 },
    ],
    products: [
      { formula: 'Fe2(SO4)3', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 3, state: 'l' },
    ],
    equationMarkdown: 'Fe₂O₃ (r) + 3H₂SO₄ (dd) → Fe₂(SO₄)₃ (dd) + 3H₂O (l)',
    description: 'Bột Fe2O3 màu đỏ nâu tan rã trong H2SO4, dung dịch chuyển màu vàng nhạt.',
    eventTriggers: {
      colorTransition: { to: 'rgba(217, 119, 6, 0.5)' },
    },
  },
  // Fe3O4 + 8HCl -> FeCl2 + 2FeCl3 + 4H2O
  {
    id: 'rxn_Fe3O4_HCl',
    name: 'Fe3O4 + 8HCl -> FeCl2 + 2FeCl3 + 4H2O',
    reactants: [
      { formula: 'Fe3O4', ratio: 1 },
      { formula: 'HCl', ratio: 8 },
    ],
    products: [
      { formula: 'FeCl2', ratio: 1, state: 'aq' },
      { formula: 'FeCl3', ratio: 2, state: 'aq' },
      { formula: 'H2O', ratio: 4, state: 'l' },
    ],
    equationMarkdown: 'Fe₃O₄ (r) + 8HCl (dd) → FeCl₂ (dd) + 2FeCl₃ (dd) + 4H₂O (l)',
    description: 'Bột đen Fe3O4 tan hết trong dung dịch HCl, thu được dung dịch màu vàng nâu nhạt.',
    eventTriggers: {
      colorTransition: { to: 'rgba(217, 119, 6, 0.6)' },
    },
  },
  // Na2CO3 + H2SO4 -> Na2SO4 + CO2 + H2O
  {
    id: 'rxn_Na2CO3_H2SO4',
    name: 'Na2CO3 + H2SO4 -> Na2SO4 + CO2 + H2O',
    reactants: [
      { formula: 'Na2CO3', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Na₂CO₃ (dd) + H₂SO₄ (dd) → Na₂SO₄ (dd) + CO₂↑ (k) + H₂O (l)',
    description: 'Dung dịch sủi bọt khí CO2 mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // 2NaHCO3 + H2SO4 -> Na2SO4 + 2CO2 + 2H2O
  {
    id: 'rxn_NaHCO3_H2SO4',
    name: '2NaHCO3 + H2SO4 -> Na2SO4 + 2CO2 + 2H2O',
    reactants: [
      { formula: 'NaHCO3', ratio: 2 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
      { formula: 'CO2', ratio: 2, state: 'g' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    equationMarkdown: '2NaHCO₃ (dd) + H₂SO₄ (dd) → Na₂SO₄ (dd) + 2CO₂↑ (k) + 2H₂O (l)',
    description: 'Dung dịch sủi bọt khí CO2 mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // K2CO3 + 2HCl -> 2KCl + CO2 + H2O
  {
    id: 'rxn_K2CO3_HCl',
    name: 'K2CO3 + 2HCl -> 2KCl + CO2 + H2O',
    reactants: [
      { formula: 'K2CO3', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'KCl', ratio: 2, state: 'aq' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'K₂CO₃ (dd) + 2HCl (dd) → 2KCl (dd) + CO₂↑ (k) + H₂O (l)',
    description: 'Dung dịch sủi bọt khí CO2 mãnh liệt.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // CaCO3 + H2SO4 -> CaSO4 + CO2 + H2O
  {
    id: 'rxn_CaCO3_H2SO4',
    name: 'CaCO3 + H2SO4 -> CaSO4 + CO2 + H2O',
    reactants: [
      { formula: 'CaCO3', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'CaSO4', ratio: 1, state: 's' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'CaCO₃ (r) + H₂SO₄ (dd) → CaSO₄↓ (r) + CO₂↑ (k) + H₂O (l)',
    description: 'Đá vôi tan rã, sủi bọt khí CO2 đồng thời tạo váng kết tủa CaSO4.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
      precipitateEffect: { formula: 'CaSO4', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
    },
  },
  // BaCO3 + 2HCl -> BaCl2 + CO2 + H2O
  {
    id: 'rxn_BaCO3_HCl',
    name: 'BaCO3 + 2HCl -> BaCl2 + CO2 + H2O',
    reactants: [
      { formula: 'BaCO3', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'BaCl2', ratio: 1, state: 'aq' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'BaCO₃ (r) + 2HCl (dd) → BaCl₂ (dd) + CO₂↑ (k) + H₂O (l)',
    description: 'Kết tủa trắng BaCO3 tan rã, dung dịch sủi bọt khí CO2.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
    },
  },
  // BaCO3 + H2SO4 -> BaSO4 + CO2 + H2O
  {
    id: 'rxn_BaCO3_H2SO4',
    name: 'BaCO3 + H2SO4 -> BaSO4 + CO2 + H2O',
    reactants: [
      { formula: 'BaCO3', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'BaSO4', ratio: 1, state: 's' },
      { formula: 'CO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'BaCO₃ (r) + H₂SO₄ (dd) → BaSO₄↓ (r) + CO₂↑ (k) + H₂O (l)',
    description: 'BaCO3 sủi bọt khí CO2 và tạo kết tủa trắng BaSO4.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'CO2', gasName: 'Carbon dioxide', rate: 'vigorous' },
      precipitateEffect: { formula: 'BaSO4', color: 'rgba(255, 255, 255, 0.95)', amount: 'heavy' },
    },
  },
  // FeS + H2SO4 -> FeSO4 + H2S
  {
    id: 'rxn_FeS_H2SO4',
    name: 'FeS + H2SO4 -> FeSO4 + H2S',
    reactants: [
      { formula: 'FeS', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'FeSO4', ratio: 1, state: 'aq' },
      { formula: 'H2S', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'FeS (r) + H₂SO₄ (dd) → FeSO₄ (dd) + H₂S↑ (k)',
    description: 'Bột đen FeS tan rã trong H2SO4 loãng, thoát ra khí H2S mùi trứng thối.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2S', gasName: 'Hydrogen sulfide', rate: 'moderate' },
      colorTransition: { to: 'rgba(167, 243, 208, 0.4)' },
    },
  },
  // Na2S + 2HCl -> 2NaCl + H2S
  {
    id: 'rxn_Na2S_HCl',
    name: 'Na2S + 2HCl -> 2NaCl + H2S',
    reactants: [
      { formula: 'Na2S', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'NaCl', ratio: 2, state: 'aq' },
      { formula: 'H2S', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Na₂S (dd) + 2HCl (dd) → 2NaCl (dd) + H₂S↑ (k)',
    description: 'Dung dịch thoát ra khí H2S mùi trứng thối đặc trưng.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2S', gasName: 'Hydrogen sulfide', rate: 'moderate' },
    },
  },
  // Na2S + H2SO4 -> Na2SO4 + H2S
  {
    id: 'rxn_Na2S_H2SO4',
    name: 'Na2S + H2SO4 -> Na2SO4 + H2S',
    reactants: [
      { formula: 'Na2S', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'Na2SO4', ratio: 1, state: 'aq' },
      { formula: 'H2S', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'Na₂S (dd) + H₂SO₄ (dd) → Na₂SO₄ (dd) + H₂S↑ (k)',
    description: 'Dung dịch thoát ra khí H2S mùi trứng thối.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2S', gasName: 'Hydrogen sulfide', rate: 'moderate' },
    },
  },
  // Na2SO3 + 2HCl -> 2NaCl + SO2 + H2O
  {
    id: 'rxn_Na2SO3_HCl',
    name: 'Na2SO3 + 2HCl -> 2NaCl + SO2 + H2O',
    reactants: [
      { formula: 'Na2SO3', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'NaCl', ratio: 2, state: 'aq' },
      { formula: 'SO2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Na₂SO₃ (dd) + 2HCl (dd) → 2NaCl (dd) + SO₂↑ (k) + H₂O (l)',
    description: 'Dung dịch sủi bọt khí SO2 mùi hắc.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'SO2', gasName: 'Sulfur dioxide', rate: 'moderate' },
    },
  },
  // NH3 + HCl -> NH4Cl
  {
    id: 'rxn_NH3_HCl',
    name: 'NH3 + HCl -> NH4Cl',
    reactants: [
      { formula: 'NH3', ratio: 1 },
      { formula: 'HCl', ratio: 1 },
    ],
    products: [
      { formula: 'NH4Cl', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'NH₃ (dd) + HCl (dd) → NH₄Cl (dd)',
    description: 'Dung dịch NH3 phản ứng trung hòa với axit HCl tạo muối NH4Cl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Al2O3 + 6HCl -> 2AlCl3 + 3H2O
  {
    id: 'rxn_Al2O3_HCl',
    name: 'Al2O3 + 6HCl -> 2AlCl3 + 3H2O',
    reactants: [
      { formula: 'Al2O3', ratio: 1 },
      { formula: 'HCl', ratio: 6 },
    ],
    products: [
      { formula: 'AlCl3', ratio: 2, state: 'aq' },
      { formula: 'H2O', ratio: 3, state: 'l' },
    ],
    equationMarkdown: 'Al₂O₃ (r) + 6HCl (dd) → 2AlCl₃ (dd) + 3H₂O (l)',
    description: 'Bột Al2O3 tan rã hoàn toàn trong dung dịch HCl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // Al2O3 + 2NaOH -> 2NaAlO2 + H2O
  {
    id: 'rxn_Al2O3_NaOH',
    name: 'Al2O3 + 2NaOH -> 2NaAlO2 + H2O',
    reactants: [
      { formula: 'Al2O3', ratio: 1 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'NaAlO2', ratio: 2, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Al₂O₃ (r) + 2NaOH (dd) → 2NaAlO₂ (dd) + H₂O (l)',
    description: 'Bột Al2O3 lưỡng tính tan rã trong dung dịch NaOH.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // ZnO + 2HCl -> ZnCl2 + H2O
  {
    id: 'rxn_ZnO_HCl',
    name: 'ZnO + 2HCl -> ZnCl2 + H2O',
    reactants: [
      { formula: 'ZnO', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'ZnCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'ZnO (r) + 2HCl (dd) → ZnCl₂ (dd) + H₂O (l)',
    description: 'Bột trắng ZnO tan rã hoàn toàn trong dung dịch HCl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // MgO + 2HCl -> MgCl2 + H2O
  {
    id: 'rxn_MgO_HCl',
    name: 'MgO + 2HCl -> MgCl2 + H2O',
    reactants: [
      { formula: 'MgO', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'MgCl2', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'MgO (r) + 2HCl (dd) → MgCl₂ (dd) + H₂O (l)',
    description: 'Bột MgO màu trắng tan hoàn toàn trong dung dịch HCl.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // MgO + H2SO4 -> MgSO4 + H2O
  {
    id: 'rxn_MgO_H2SO4',
    name: 'MgO + H2SO4 -> MgSO4 + H2O',
    reactants: [
      { formula: 'MgO', ratio: 1 },
      { formula: 'H2SO4', ratio: 1 },
    ],
    products: [
      { formula: 'MgSO4', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'MgO (r) + H₂SO₄ (dd) → MgSO₄ (dd) + H₂O (l)',
    description: 'Bột MgO tan trong H2SO4 loãng tạo dung dịch MgSO4 trong suốt.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 2KMnO4 -> K2MnO4 + MnO2 + O2 (Nhiệt phân KMnO4)
  {
    id: 'rxn_KMnO4_heat',
    name: '2KMnO4 -> K2MnO4 + MnO2 + O2',
    reactants: [
      { formula: 'KMnO4', ratio: 2 },
    ],
    products: [
      { formula: 'K2MnO4', ratio: 1, state: 's' },
      { formula: 'MnO2', ratio: 1, state: 's' },
      { formula: 'O2', ratio: 1, state: 'g' },
    ],
    requiresHeat: true,
    minTempC: 50,
    equationMarkdown: '2KMnO₄ (r) →(t°) K₂MnO₄ (r) + MnO₂ (r) + O₂↑ (k)',
    description: 'Nhiệt phân tinh thể KMnO4 màu tím xám chuyển dần sang đen, giải phóng khí O2 bùng cháy que đốm.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'O2', gasName: 'Oxygen', rate: 'vigorous' },
      colorTransition: { to: 'rgba(24, 24, 27, 0.95)' },
      heatEffect: { isExothermic: true, tempRiseC: 40 },
    },
  },
  // MnO2 + 4HCl -> MnCl2 + Cl2 + 2H2O (Điều chế khí Clo)
  {
    id: 'rxn_MnO2_HCl_dac',
    name: 'MnO2 + 4HCl -> MnCl2 + Cl2 + 2H2O',
    reactants: [
      { formula: 'MnO2', ratio: 1 },
      { formula: 'HCl', ratio: 4 },
    ],
    products: [
      { formula: 'MnCl2', ratio: 1, state: 'aq' },
      { formula: 'Cl2', ratio: 1, state: 'g' },
      { formula: 'H2O', ratio: 2, state: 'l' },
    ],
    requiresHeat: false,
    minTempC: 20,
    equationMarkdown: 'MnO₂ (r) + 4HCl (đặc, dd) →(t°) MnCl₂ (dd) + Cl₂↑ (k) + 2H₂O (l)',
    description: 'Bột MnO2 tan dần trong HCl đặc nóng, giải phóng khí Cl2 màu vàng lục mùi hắc.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'Cl2', gasName: 'Chlorine', rate: 'vigorous', color: 'rgba(163, 230, 53, 0.45)' },
      colorTransition: { to: 'rgba(252, 231, 243, 0.4)' },
    },
  },
  // 2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O (Điều chế Clo từ KMnO4 không cần đun)
  {
    id: 'rxn_KMnO4_HCl_dac',
    name: '2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O',
    reactants: [
      { formula: 'KMnO4', ratio: 2 },
      { formula: 'HCl', ratio: 16 },
    ],
    products: [
      { formula: 'KCl', ratio: 2, state: 'aq' },
      { formula: 'MnCl2', ratio: 2, state: 'aq' },
      { formula: 'Cl2', ratio: 5, state: 'g' },
      { formula: 'H2O', ratio: 8, state: 'l' },
    ],
    requiresHeat: false,
    equationMarkdown: '2KMnO₄ (r/dd) + 16HCl (đặc, dd) → 2KCl (dd) + 2MnCl₂ (dd) + 5Cl₂↑ (k) + 8H₂O (l)',
    description: 'KMnO4 thuốc tím bị HCl đặc oxi hóa ngay ở nhiệt độ phòng, dung dịch mất màu tím chuyển thành MnCl2 và giải phóng mạnh khí Cl2 màu vàng lục.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'Cl2', gasName: 'Chlorine', rate: 'vigorous', color: 'rgba(163, 230, 53, 0.45)' },
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // 5SO2 + 2KMnO4 + 2H2O -> K2SO4 + 2MnSO4 + 2H2SO4 (SO2 làm mất màu KMnO4)
  {
    id: 'rxn_SO2_KMnO4',
    name: '5SO2 + 2KMnO4 + 2H2O -> K2SO4 + 2MnSO4 + 2H2SO4',
    reactants: [
      { formula: 'SO2', ratio: 5 },
      { formula: 'KMnO4', ratio: 2 },
      { formula: 'H2O', ratio: 2 },
    ],
    products: [
      { formula: 'K2SO4', ratio: 1, state: 'aq' },
      { formula: 'MnSO4', ratio: 2, state: 'aq' },
      { formula: 'H2SO4', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: '5SO₂ (k) + 2KMnO₄ (dd) + 2H₂O (l) → K₂SO₄ (dd) + 2MnSO₄ (dd) + 2H₂SO₄ (dd)',
    description: 'Khí SO2 có tính khử mạnh làm dung dịch thuốc tím KMnO4 nhạt màu rồi mất màu hoàn toàn.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
  // FeS + 2HCl -> FeCl2 + H2S
  {
    id: 'rxn_FeS_HCl',
    name: 'FeS + 2HCl -> FeCl2 + H2S',
    reactants: [
      { formula: 'FeS', ratio: 1 },
      { formula: 'HCl', ratio: 2 },
    ],
    products: [
      { formula: 'FeCl2', ratio: 1, state: 'aq' },
      { formula: 'H2S', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'FeS (r) + 2HCl (dd) → FeCl₂ (dd) + H₂S↑ (k)',
    description: 'Hạt FeS đen tan rã trong HCl, giải phóng khí H2S mùi trứng thối đặc trưng.',
    eventTriggers: {
      bubbleEffect: { gasFormula: 'H2S', gasName: 'Hydrogen sulfide', rate: 'moderate' },
      colorTransition: { to: 'rgba(167, 243, 208, 0.4)' },
    },
  },
  // H2S + Pb(NO3)2 -> PbS(s) + 2HNO3
  {
    id: 'rxn_H2S_PbNO32',
    name: 'H2S + Pb(NO3)2 -> PbS + 2HNO3',
    reactants: [
      { formula: 'H2S', ratio: 1 },
      { formula: 'Pb(NO3)2', ratio: 1 },
    ],
    products: [
      { formula: 'PbS', ratio: 1, state: 's' },
      { formula: 'HNO3', ratio: 2, state: 'aq' },
    ],
    equationMarkdown: 'H₂S (k) + Pb(NO₃)₂ (dd) → PbS↓ (r) + 2HNO₃ (dd)',
    description: 'Khí H2S sục vào dung dịch Pb(NO3)2 nhanh chóng tạo kết tủa đen PbS đặc trưng.',
    eventTriggers: {
      precipitateEffect: { formula: 'PbS', color: 'rgba(15, 23, 42, 0.98)', amount: 'heavy' },
      colorTransition: { to: 'rgba(30, 41, 59, 0.9)' },
    },
  },
  // C12H22O11 + H2SO4 dac -> 12C + 11H2O (Than hóa đường)
  {
    id: 'rxn_C12H22O11_H2SO4',
    name: 'C12H22O11 + H2SO4 (đặc) -> 12C + 11H2O',
    reactants: [
      { formula: 'C12H22O11', ratio: 1 },
      { formula: 'H2SO4', ratio: 0.01 }, // Catalytic dehydrating agent ratio
    ],
    products: [
      { formula: 'C', ratio: 12, state: 's' },
      { formula: 'H2O', ratio: 11, state: 'l' },
      { formula: 'SO2', ratio: 2, state: 'g' },
      { formula: 'CO2', ratio: 1, state: 'g' },
    ],
    equationMarkdown: 'C₁₂H₂₂O₁₁ (r) →(H₂SO₄ đặc) 12C (r) + 11H₂O (l)\nC + 2H₂SO₄ (đặc) →(t°) CO₂↑ + 2SO₂↑ + 2H₂O',
    description: 'Axit H2SO4 đặc háo nước mạnh mẽ biến đường thành khối than đen xốp dâng cao, tỏa nhiệt dữ dội (tới 180°C) và giải phóng khí SO2, CO2.',
    eventTriggers: {
      precipitateEffect: { formula: 'C', color: 'rgba(20, 20, 20, 0.98)', amount: 'heavy' },
      colorTransition: { to: 'rgba(15, 23, 42, 0.95)' },
      heatEffect: { isExothermic: true, tempRiseC: 155 },
      bubbleEffect: { gasFormula: 'SO2', gasName: 'Sulfur dioxide', rate: 'vigorous' },
    },
    heatChangeJ: -2800,
  },
  // Cl2 + H2O <=> HCl + HClO
  {
    id: 'rxn_Cl2_H2O',
    name: 'Cl2 + H2O <=> HCl + HClO',
    reactants: [
      { formula: 'Cl2', ratio: 1 },
      { formula: 'H2O', ratio: 1 },
    ],
    products: [
      { formula: 'HCl', ratio: 1, state: 'aq' },
      { formula: 'HClO', ratio: 1, state: 'aq' },
    ],
    equationMarkdown: 'Cl₂ (k) + H₂O (l) ⇌ HCl (dd) + HClO (dd)',
    description: 'Khí Clo tan trong nước tạo nước Clo màu vàng nhạt, có tính tẩy màu nhờ HClO.',
    eventTriggers: {
      colorTransition: { to: 'rgba(236, 252, 203, 0.35)' },
    },
  },
  // Cl2 + 2NaOH -> NaCl + NaClO + H2O (Nước Javel)
  {
    id: 'rxn_Cl2_NaOH',
    name: 'Cl2 + 2NaOH -> NaCl + NaClO + H2O',
    reactants: [
      { formula: 'Cl2', ratio: 1 },
      { formula: 'NaOH', ratio: 2 },
    ],
    products: [
      { formula: 'NaCl', ratio: 1, state: 'aq' },
      { formula: 'NaClO', ratio: 1, state: 'aq' },
      { formula: 'H2O', ratio: 1, state: 'l' },
    ],
    equationMarkdown: 'Cl₂ (k) + 2NaOH (dd) → NaCl (dd) + NaClO (dd) + H₂O (l)',
    description: 'Khí Clo hấp thụ hoàn toàn trong dung dịch NaOH tạo Nước Javel không màu có tính tẩy rửa tẩy màu mạnh.',
    eventTriggers: {
      colorTransition: { to: 'rgba(235, 245, 255, 0.2)' },
    },
  },
];

