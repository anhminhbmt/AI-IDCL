import { EquipmentInstance, EquipmentType, SolutionContent, PresetExperiment } from '../types/chemistry';
import { CHEMICAL_DATABASE } from './ChemicalDatabase';
import { calculateSolutionPh, parseColorToRgba, getSolidColor } from './ChemicalEngine';

export function createEmptySolution(): SolutionContent {
  return {
    volumeMl: 0,
    temperatureC: 25,
    speciesMoles: {},
    colorRgba: { r: 235, g: 245, b: 255, a: 0.15 },
    pH: 7.0,
    precipitates: [],
    activeGas: null,
    indicatorType: null,
  };
}

export function createChemicalSolution(
  chemicalId: string,
  volumeMl: number = 50,
  concentrationM: number = 1.0,
  asSolid: boolean = false,
  solidMassGram: number = 5.0
): SolutionContent {
  const chem = CHEMICAL_DATABASE.find((c) => c.id === chemicalId || c.formula === chemicalId);
  if (!chem) return createEmptySolution();

  // Pure Gas Chemical (e.g. O2, H2, CO2, SO2, NO2, NO, H2S, Cl2)
  if (chem.state === 'gas' || chem.type === 'gas_container') {
    const moles = (volumeMl || 50) / 24790;
    return {
      volumeMl: 0,
      temperatureC: 25,
      speciesMoles: { [chem.formula]: moles },
      colorRgba: parseColorToRgba(chem.color || 'rgba(220, 240, 255, 0.2)'),
      pH: chem.pH || 7.0,
      precipitates: [],
      activeGas: {
        formula: chem.formula,
        name: chem.name,
        color: chem.color || 'rgba(220, 240, 255, 0.3)',
        rate: 0.1,
      },
      indicatorType: null,
    };
  }

  // Pure distilled water H2O
  if (chem.id === 'H2O' || chem.formula === 'H2O') {
    return {
      volumeMl,
      temperatureC: 25,
      speciesMoles: { H2O: (volumeMl * 1.0) / 18.015 },
      colorRgba: { r: 235, g: 245, b: 255, a: 0.2 },
      pH: 7.0,
      precipitates: [],
      activeGas: null,
      indicatorType: null,
    };
  }

  // Force solid ONLY if explicitly requested as solid (asSolid === true),
  // or if volumeMl is 0 (dry solid reagent), or if chem is an insoluble solid metal/oxide/sulfide/carbonate.
  const isAcid = chem.type === 'acid';
  const isInsoluble = (chem.solubility as boolean | undefined) === false;
  
  // If volumeMl is 0 or asSolid is explicitly true or chem is insoluble, make solid!
  const isSolid = !isAcid && (asSolid || volumeMl === 0 || isInsoluble);

  if (isSolid) {
    const solidColor = chem.color || getSolidColor(chem.formula);
    const moles = solidMassGram / (chem.molarMass || 50);
    return {
      volumeMl: 0,
      temperatureC: 25,
      speciesMoles: { [chem.formula]: moles },
      colorRgba: parseColorToRgba(solidColor),
      pH: chem.pH || 7.0,
      precipitates: [
        {
          id: `${chem.formula}_init`,
          formula: chem.formula,
          name: chem.name,
          color: solidColor,
          massGram: solidMassGram,
          settledRatio: 1.0,
        },
      ],
      activeGas: null,
      indicatorType: null,
    };
  }

  // Solution
  const moles = (concentrationM * volumeMl) / 1000;
  const speciesMoles: Record<string, number> = { [chem.formula]: moles };

  let indicatorType: 'litmus' | 'phenolphthalein' | 'universal' | null = null;
  if (chem.type === 'indicator') {
    if (chem.id === 'Litmus') indicatorType = 'litmus';
    else if (chem.id === 'Phenolphthalein') indicatorType = 'phenolphthalein';
    else if (chem.id === 'UniversalIndicator') indicatorType = 'universal';
  }

  const pH = calculateSolutionPh(speciesMoles, volumeMl);
  const colorRgba = parseColorToRgba(chem.color || 'rgba(235, 245, 255, 0.3)');

  return {
    volumeMl,
    temperatureC: 25,
    speciesMoles,
    colorRgba,
    pH,
    precipitates: [],
    activeGas: null,
    indicatorType,
  };
}

export const STANDARD_EQUIPMENT_CAPACITIES: Record<EquipmentType, number[]> = {
  pipette: [2, 5, 10, 20, 25, 40, 50],
  beaker: [50, 100, 250, 500, 1000],
  test_tube: [10, 20, 30, 50],
  erlenmeyer: [50, 100, 250, 500, 1000],
  round_flask: [100, 250, 500, 1000],
  round_flask_1arm: [100, 250, 500, 1000],
  round_flask_2neck: [100, 250, 500, 1000],
  graduated_cylinder: [10, 25, 50, 100, 250, 500],
  burette: [10, 25, 50, 100],
  chemical_bottle: [100, 250, 500, 1000],
  alcohol_burner: [50, 100, 200, 250],
  spatula: [2, 5, 10],
  glass_rod: [],
  lab_stand: [],
  tripod_wire_gauze: [],
  wooden_splint: [],
  fabric_strip: [],
};

// Function to compute dynamic dimensions based on capacity
export function getEquipmentDimensions(type: EquipmentType, capacityMl: number): { width: number; height: number } {
  switch (type) {
    case 'test_tube': {
      const cap = capacityMl || 20;
      if (cap <= 10) return { width: 26, height: 110 };
      if (cap <= 20) return { width: 32, height: 130 };
      if (cap <= 30) return { width: 38, height: 145 };
      return { width: 44, height: 165 };
    }
    case 'beaker': {
      const cap = capacityMl || 250;
      if (cap <= 50) return { width: 75, height: 90 };
      if (cap <= 100) return { width: 90, height: 110 };
      if (cap <= 250) return { width: 110, height: 130 };
      if (cap <= 500) return { width: 135, height: 160 };
      return { width: 165, height: 195 };
    }
    case 'erlenmeyer': {
      const cap = capacityMl || 250;
      if (cap <= 50) return { width: 80, height: 95 };
      if (cap <= 100) return { width: 95, height: 115 };
      if (cap <= 250) return { width: 120, height: 140 };
      if (cap <= 500) return { width: 145, height: 170 };
      return { width: 175, height: 205 };
    }
    case 'round_flask':
    case 'round_flask_1arm':
    case 'round_flask_2neck': {
      const cap = capacityMl || 250;
      if (cap <= 100) return { width: 85, height: 120 };
      if (cap <= 250) return { width: 110, height: 150 };
      if (cap <= 500) return { width: 140, height: 180 };
      return { width: 170, height: 215 };
    }
    case 'graduated_cylinder': {
      const cap = capacityMl || 100;
      if (cap <= 10) return { width: 30, height: 120 };
      if (cap <= 25) return { width: 36, height: 140 };
      if (cap <= 50) return { width: 42, height: 160 };
      if (cap <= 100) return { width: 45, height: 170 };
      if (cap <= 250) return { width: 54, height: 200 };
      return { width: 64, height: 230 };
    }
    case 'pipette': {
      const cap = capacityMl || 10;
      if (cap <= 2) return { width: 18, height: 130 };
      if (cap <= 5) return { width: 20, height: 145 };
      if (cap <= 10) return { width: 24, height: 160 };
      if (cap <= 25) return { width: 30, height: 185 };
      return { width: 36, height: 215 };
    }
    case 'burette': {
      const cap = capacityMl || 50;
      if (cap <= 10) return { width: 22, height: 180 };
      if (cap <= 25) return { width: 26, height: 210 };
      if (cap <= 50) return { width: 30, height: 220 };
      return { width: 36, height: 260 };
    }
    case 'chemical_bottle': {
      const cap = capacityMl || 500;
      if (cap <= 100) return { width: 60, height: 95 };
      if (cap <= 250) return { width: 70, height: 110 };
      if (cap <= 500) return { width: 85, height: 130 };
      return { width: 110, height: 160 };
    }
    case 'spatula': {
      const cap = capacityMl || 5;
      if (cap <= 2) return { width: 20, height: 130 };
      if (cap <= 5) return { width: 24, height: 160 };
      return { width: 28, height: 180 };
    }
    case 'alcohol_burner': {
      const cap = capacityMl || 100;
      if (cap <= 100) return { width: 75, height: 85 };
      return { width: 90, height: 105 };
    }
    case 'glass_rod':
      return { width: 12, height: 180 };
    case 'lab_stand':
      return { width: 120, height: 260 };
    case 'tripod_wire_gauze':
      return { width: 100, height: 110 };
    case 'wooden_splint':
      return { width: 14, height: 160 };
    default:
      return { width: 100, height: 120 };
  }
}

// Factory to create equipment instances
export function createEquipment(
  type: EquipmentType,
  x: number,
  y: number,
  customName?: string,
  initialChemicalId?: string,
  initialVolMl: number = 50,
  concentrationM: number = 1.0,
  customCapacityMl?: number,
  asSolid: boolean = false,
  solidMassGram: number = 5.0
): EquipmentInstance {
  const id = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const content = initialChemicalId
    ? createChemicalSolution(initialChemicalId, initialVolMl, concentrationM, asSolid, solidMassGram)
    : createEmptySolution();

  const capacityMl = customCapacityMl || (
    type === 'test_tube' ? 20 :
    type === 'beaker' ? 250 :
    type === 'erlenmeyer' ? 250 :
    type.startsWith('round_flask') ? 250 :
    type === 'graduated_cylinder' ? 100 :
    type === 'pipette' ? 10 :
    type === 'burette' ? 50 :
    type === 'chemical_bottle' ? 500 :
    type === 'alcohol_burner' ? 100 :
    type === 'spatula' ? 5 : 0
  );

  const dims = getEquipmentDimensions(type, capacityMl);

  switch (type) {
    case 'test_tube':
      return {
        id,
        type,
        name: customName || 'Ống nghiệm',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'beaker':
      return {
        id,
        type,
        name: customName || 'Cốc đốt',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'erlenmeyer':
      return {
        id,
        type,
        name: customName || 'Bình tam giác',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'round_flask':
      return {
        id,
        type,
        name: customName || 'Bình cầu 0 nhánh',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'round_flask_1arm':
      return {
        id,
        type,
        name: customName || 'Bình cầu 1 nhánh',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'round_flask_2neck':
      return {
        id,
        type,
        name: customName || 'Bình cầu 2 nhánh',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'graduated_cylinder':
      return {
        id,
        type,
        name: customName || 'Ống đong',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
      };

    case 'pipette':
      return {
        id,
        type,
        name: customName || `Pipet ${capacityMl}mL`,
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content: createEmptySolution(),
        suckedContent: null,
      };

    case 'burette':
      return {
        id,
        type,
        name: customName || 'Buret',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
        valveOpen: false,
      };

    case 'glass_rod':
      return {
        id,
        type,
        name: customName || 'Đũa thủy tinh',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 15,
        capacityMl: 0,
        content: createEmptySolution(),
      };

    case 'alcohol_burner':
      return {
        id,
        type,
        name: customName || 'Đèn cồn',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content: createEmptySolution(),
        isBurning: false,
        hasCap: true,
      };

    case 'lab_stand':
      return {
        id,
        type,
        name: customName || 'Giá đỡ & Kẹp',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl: 0,
        content: createEmptySolution(),
      };

    case 'chemical_bottle':
      return {
        id,
        type,
        name: customName || `Lọ hóa chất ${initialChemicalId || ''}`,
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content,
        hasCap: true,
        label: initialChemicalId ? `${initialChemicalId}` : 'Hóa chất',
      };

    case 'tripod_wire_gauze':
      return {
        id,
        type,
        name: customName || 'Kiềng ba chân & Lưới amiăng',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl: 0,
        content: createEmptySolution(),
        hasAsbestosMesh: true,
      };

    case 'spatula':
      return {
        id,
        type,
        name: customName || 'Muỗng lấy hóa chất chất rắn',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl,
        content: createEmptySolution(),
        spatulaContent: null,
        interactionState: 'IDLE',
        tiltAngle: 0,
      };

    case 'wooden_splint':
      const lowerName = (customName || '').toLowerCase();
      const isFabric = Boolean(customName && (lowerName.includes('vải') || lowerName.includes('fabric')));
      return {
        id,
        type,
        name: customName || 'Que đốm thử lửa',
        x,
        y,
        width: isFabric ? 85 : dims.width,
        height: isFabric ? 32 : dims.height,
        angle: isFabric ? 0 : 90,
        capacityMl: 0,
        content: createEmptySolution(),
        splintState: isFabric ? 'BURNING' : 'GLOWING',
        flameColor: isFabric ? 'orange' : 'red',
        ...(isFabric ? { hasFabricStrip: true, fabricColor: '#D32F2F', fabricBleachProgress: 0 } : {}),
      };

    default:
      return {
        id,
        type: 'beaker',
        name: 'Cốc',
        x,
        y,
        width: dims.width,
        height: dims.height,
        angle: 0,
        capacityMl: 250,
        content,
      };
  }
}

// Preset Experiments Configuration
export const PRESET_EXPERIMENTS: PresetExperiment[] = [
  {
    id: 'exp_o2_prep',
    name: '1. Điều chế & thử tính chất khí Oxi (O2 từ KMnO4)',
    category: 'Điều chế khí',
    description: 'Nhiệt phân 2KMnO4 -> K2MnO4 + MnO2 + O2. Đun nóng KMnO4 sinh ra khí O2, dẫn đến miệng ống nghiệm làm que tàn đỏ kẹp ngang bùng cháy sáng chói.',
    equipments: [
      createEquipment('lab_stand', 380, 200),
      {
        ...createEquipment('test_tube', 390, 160, 'Ống nghiệm KMnO4', 'KMnO4', 0, 0, undefined, true, 8.0),
        angle: 25,
      },
      createEquipment('alcohol_burner', 380, 320, 'Đèn Cồn Gia Nhiệt'),
      {
        ...createEquipment('wooden_splint', 390, 135, 'Que tàn đỏ (Thử O2)'),
        splintState: 'GLOWING',
        flameColor: 'red',
        angle: 90,
      },
      createEquipment('beaker', 550, 260, 'Bình thu khí O2 (Úp trong chậu)', 'H2O', 150, 0),
      createEquipment('chemical_bottle', 200, 260, 'Tinh thể KMnO4', 'KMnO4', 0, 0, undefined, true, 50.0),
    ],
  },
  {
    id: 'exp_h2_prep',
    name: '2. Điều chế & thử tính chất khí Hiđro (H2 từ Zn + HCl)',
    category: 'Điều chế khí',
    description: 'Zn + 2HCl -> ZnCl2 + H2. Kẽm hạt trong ống nghiệm kẹp trên giá, que tàn đỏ kẹp ngang miệng ống. Khi nhỏ HCl vào, bọt khí H2 bọt ra làm que tàn đỏ bùng cháy ngọn lửa xanh nhạt (tiếng nổ pốp nhẹ).',
    equipments: [
      {
        ...createEquipment('lab_stand', 350, 200, 'Giá kẹp thí nghiệm'),
        id: 'h2_stand',
      },
      {
        ...createEquipment('test_tube', 360, 152, 'Ống nghiệm chứa Kẽm (Zn)', 'Zn', 0, 0, undefined, true, 0.6),
        id: 'h2_tube',
        clampedToStandId: 'h2_stand',
      },
      {
        ...createEquipment('wooden_splint', 360, 152, 'Que tàn đỏ đặt ngang miệng ống'),
        splintState: 'GLOWING',
        flameColor: 'red',
        angle: 90,
      },
      createEquipment('chemical_bottle', 180, 260, 'Lọ Axit HCl 2M', 'HCl', 150, 2.0),
      createEquipment('pipette', 480, 260, 'Pipet Nhỏ Giọt Axit'),
    ],
  },
  {
    id: 'exp_cl2_prep',
    name: '3. Điều chế & thử tính chất khí Clo (Cl2 từ MnO2 + HCl đặc)',
    category: 'Điều chế khí',
    description: 'MnO2 + 4HCl(đặc) ->(t°) MnCl2 + Cl2 + 2H2O. Khí Cl2 vàng lục thoát ra, qua Bình 1 (NaCl bão hòa) giữ hơi HCl, Bình 2 (H2SO4 đặc) làm khô khí, thu vào Bình tam giác RỖNG (có bông tẩm NaOH ở miệng bình & mẫu giấy màu khô/ẩm).',
    equipments: [
      createEquipment('lab_stand', 200, 180, 'Giá kẹp thí nghiệm'),
      {
        ...createEquipment('round_flask_1arm', 210, 140, 'Bình cầu có nhánh chứa MnO2 (Có Phễu Nhỏ Giọt HCl)', 'MnO2', 0, 0, undefined, true, 3.5),
        hasDroppingFunnel: true,
        droppingFunnelVolumeMl: 25.0,
        valveOpen: false,
      },
      {
        ...createEquipment('alcohol_burner', 200, 310, 'Đèn Cồn Gia Nhiệt (t°)'),
        isBurning: false,
        hasCap: true,
      },
      createEquipment('beaker', 360, 250, 'Bình 1: Rửa khí (Dung dịch NaCl bão hòa)', 'NaCl', 80, 5.0),
      createEquipment('beaker', 490, 250, 'Bình 2: Làm khô khí (Dung dịch H2SO4 đặc)', 'H2SO4', 80, 18.0),
      {
        ...createEquipment('erlenmeyer', 620, 250, 'Bình thu khí Cl2 (Rỗng, có bông tẩm NaOH ở miệng bình)', undefined, 0, 0),
        hasDryPaper: true,
        hasWetPaper: true,
      },
      createEquipment('chemical_bottle', 80, 250, 'Lọ Axit HCl đặc 12M', 'HCl', 150, 12.0),
      createEquipment('chemical_bottle', 730, 250, 'Lọ NaOH loãng/đặc (Xử lý dư)', 'NaOH', 150, 2.0),
      createEquipment('pipette', 140, 250, 'Phễu / Pipet Nhỏ Giọt Axit HCl đặc'),
    ],
  },
  {
    id: 'exp_co2_prep',
    name: '4. Điều chế & làm khô khí Carbon Dioxide (CO2 từ CaCO3 + HCl)',
    category: 'Điều chế khí',
    description: '1. Phản ứng: CaCO3 + 2HCl -> CaCl2 + CO2↑ + H2O. 2. Bình 1 (NaHCO3 bão hòa): HCl + NaHCO3 -> NaCl + CO2↑ + H2O (giữ lại hơi HCl). 3. Bình 2 (H2SO4 đặc): Hút ẩm làm khô khí CO2. 4. Bình thu khí (Bình cầu ngửa): Thu CO2 khô dời chỗ không khí (M_CO2 = 44 g/mol > 29 g/mol).',
    equipments: [
      {
        ...createEquipment('erlenmeyer', 200, 250, 'Bình tam giác chứa CaCO3 (Có Phễu Nhỏ Giọt HCl)', 'CaCO3', 0, 1.2, undefined, true, 10.0),
        hasDroppingFunnel: true,
        droppingFunnelVolumeMl: 25.0,
        valveOpen: false,
      },
      createEquipment('beaker', 340, 250, 'Bình 1: Rửa khí (Dung dịch NaHCO3 bão hòa)', 'NaHCO3', 80, 8.3),
      createEquipment('beaker', 470, 250, 'Bình 2: Làm khô khí (Dung dịch H2SO4 đặc)', 'H2SO4', 80, 0.1),
      {
        ...createEquipment('erlenmeyer', 600, 250, 'Bình tam giác kính thu khí CO2 khô (Upright Collector)', undefined, 0, 7.0),
        isCo2Collector: true,
      },
      createEquipment('chemical_bottle', 80, 250, 'Lọ Axit HCl 2.0M', 'HCl', 150, 0.3),
      createEquipment('pipette', 140, 250, 'Pipet 20ml hút dung dịch HCl 2.0M'),
      createEquipment('chemical_bottle', 710, 250, 'Lọ Dung dịch NaOH 1.0M (Trung hòa/Bổ sung)', 'NaOH', 150, 14.0),
    ],
  },
  {
    id: 'exp_so2_prop',
    name: '5. Tính chất khí Lưu huỳnh Dioxide (SO2 làm mất màu KMnO4)',
    category: 'Tính chất hóa học',
    description: 'Na2SO3 + H2SO4 -> Na2SO4 + SO2 + H2O. Khí SO2 sinh ra dẫn qua ống dẫn vào bình chứa KMnO4 làm mất màu tím.',
    equipments: [
      createEquipment('lab_stand', 250, 190, 'Giá sắt thí nghiệm', undefined, 0, 0, undefined, false, 0),
      createEquipment('alcohol_burner', 250, 315, 'Đèn cồn đun nóng', undefined, 0, 0),
      {
        ...createEquipment('round_flask', 250, 150, 'Bình cầu đáy tròn chứa Na2SO3 (Có phễu nhỏ giọt H2SO4)', 'Na2SO3', 0, 0, undefined, true, 8.0),
        hasDroppingFunnel: true,
        droppingFunnelVolumeMl: 40,
        valveOpen: false,
      },
      createEquipment('erlenmeyer', 550, 290, 'Bình thử thủy tinh chứa KMnO4', 'KMnO4', 150, 0.05, 250),
    ],
  },
  {
    id: 'exp_nh3_prop',
    name: '6. Điều chế và thử tính chất khí NH3',
    category: 'Điều chế khí',
    description: 'Đun nóng hỗn hợp NH4Cl + Ca(OH)2 sinh ra khí NH3. Khí NH3 nhẹ hơn không khí nên được thu bằng phương pháp đẩy không khí (úp ngược ống nghiệm). Khí NH3 làm quỳ tím ẩm hóa xanh.',
    equipments: [
      {
        ...createEquipment('lab_stand', 250, 120, 'Giá sắt thí nghiệm'),
        height: 380,
        hideRingClamp: true,
      },
      {
        ...createEquipment('test_tube', 350, 280, 'Ống nghiệm 1 (NH4Cl + Ca(OH)2)', 'NH4Cl', 5, 2.0, undefined, true, 4.0),
        angle: 0, // Perfectly vertical
        hasStopper: true,
        content: {
          ...createChemicalSolution('NH4Cl', 5, 2.0, true, 4.0),
          precipitates: [
            { id: 'nh4cl_solid', name: 'Ammonium chloride', formula: 'NH4Cl', color: 'rgba(240, 245, 255, 0.95)', massGram: 4.0, settledRatio: 1.0 },
            { id: 'caoh2_solid', name: 'Calcium hydroxide', formula: 'Ca(OH)2', color: 'rgba(255, 255, 255, 0.95)', massGram: 4.0, settledRatio: 1.0 }
          ]
        }
      },
      createEquipment('alcohol_burner', 350, 450, 'Đèn cồn'),
      {
        ...createEquipment('test_tube', 150, 280, 'Ống nghiệm 2 (Úp ngược thu NH3)', undefined, 0, 0),
        angle: 180, // Mouth down
        hasRedLitmus: true,
        hasStopper: true,
      },
    ],
  },
  {
    id: 'exp_hno3_cu',
    name: '7. Axit HNO3 tác dụng với kim loại Đồng (HNO3 Đặc vs Loãng)',
    category: 'Axit oxi hóa',
    description: 'Cu + 4HNO3(đặc) -> Cu(NO3)2 + 2NO2(nâu đỏ) + 2H2O. 3Cu + 8HNO3(loãng) -> 3Cu(NO3)2 + 2NO(không màu hóa nâu) + 4H2O. Dung dịch chuyển màu xanh lam thanh khiết.',
    equipments: [
      createEquipment('beaker', 280, 260, 'Bình Thủy Tinh A (Có bột Cu khô)', 'Cu', 0, 0, undefined, true, 5.0),
      createEquipment('beaker', 440, 260, 'Bình Thủy Tinh B (Có bột Cu khô)', 'Cu', 0, 0, undefined, true, 5.0),
      createEquipment('chemical_bottle', 140, 260, 'Lọ Axit HNO3 đặc 68%', 'HNO3', 150, 10.0),
      createEquipment('chemical_bottle', 580, 260, 'Lọ Axit HNO3 loãng 2M', 'HNO3', 150, 2.0),
      createEquipment('pipette', 720, 260, 'Pipet Hút/Thả Axit'),
    ],
  },
  {
    id: 'exp_h2so4_sucrose',
    name: '8. H2SO4 đặc tác dụng với Đường Saccarozơ (Than hóa & Tỏa nhiệt)',
    category: 'Tính háo nước',
    description: 'C12H22O11 ->(H2SO4) 12C + 11H2O. H2SO4 đặc hút nước biến đường thành khối cột than C đen xốp đẩy dâng tràn miệng cốc, tỏa nhiệt dữ dội và giải phóng khí SO2, CO2.',
    equipments: [
      createEquipment('beaker', 380, 240, 'Cốc 100mL Đường Saccarozơ', 'C12H22O11', 0, 0, undefined, true, 10.0),
      createEquipment('chemical_bottle', 200, 260, 'Lọ Axit H2SO4 đặc 98%', 'H2SO4', 150, 18.0),
      createEquipment('pipette', 560, 260, 'Pipet Hút Axit H2SO4'),
    ],
  },
  {
    id: 'exp_cl2_javel',
    name: '9. Điều chế Nước Javel & Thử tính tẩy màu (HCl + MnO2 -> Cl2 -> Javel)',
    category: 'Sản xuất hóa chất',
    description: '1) Mở phễu nhỏ giọt HCl đặc xuống MnO2 trong bình cầu có nhánh (đun đèn cồn) sinh khí Clo vàng lục (#C0CA33). 2) Khí Clo dẫn qua ống thủy tinh sục vào Cốc NaOH 10% tạo Nước Javel (NaCl + NaClO). 3) Hút Nước Javel bằng Pipet nhỏ lên các Mẩu vải màu (Đỏ, Xanh, Vàng) làm mẩu vải lập tức TẨY TRẮNG (#FFFFFF).',
    equipments: [
      createEquipment('lab_stand', 140, 150, 'Giá kẹp thí nghiệm'),
      {
        ...createEquipment('round_flask_1arm', 150, 140, 'Bình cầu có nhánh chứa MnO2', 'MnO2', 0, 0, undefined, true, 4.0),
        hasDroppingFunnel: true,
        droppingFunnelVolumeMl: 25.0,
        valveOpen: false,
      },
      {
        ...createEquipment('alcohol_burner', 150, 310, 'Đèn cồn gia nhiệt (t°)'),
        isBurning: false,
        hasCap: true,
      },
      createEquipment('beaker', 320, 250, 'Cốc phản ứng (Dung dịch NaOH 10%)', 'NaOH', 100, 2.5),
      createEquipment('pipette', 400, 220, 'Pipet hút Nước Javel'),
      {
        ...createEquipment('wooden_splint', 460, 280, 'Mẩu vải màu Đỏ (Thử tẩy Javel)'),
        width: 75,
        height: 30,
        hasFabricStrip: true,
        fabricColor: '#D32F2F',
        fabricBleachProgress: 0,
      },
      {
        ...createEquipment('wooden_splint', 540, 280, 'Mẩu vải màu Xanh (Thử tẩy Javel)'),
        width: 75,
        height: 30,
        hasFabricStrip: true,
        fabricColor: '#1976D2',
        fabricBleachProgress: 0,
      },
      {
        ...createEquipment('wooden_splint', 620, 280, 'Mẩu vải màu Vàng (Thử tẩy Javel)'),
        width: 75,
        height: 30,
        hasFabricStrip: true,
        fabricColor: '#F57F17',
        fabricBleachProgress: 0,
      },
    ],
  },
  {
    id: 'titration',
    name: '10. Chuẩn Độ Axit - Bazơ (Buret & Bình Tam Giác Lắc Xoay)',
    category: 'Chuẩn độ & Chỉ thị',
    description: 'Buret kẹp trên giá đỡ chứa HCl 0.1M, chảy nhỏ giọt vào Bình tam giác chứa NaOH + Phenolphthalein. Lắc xoay tròn 3 ngón tay để quan sát điểm tương đương!',
    equipments: [
      { ...createEquipment('lab_stand', 380, 150), id: 'stand_1' },
      {
        ...createEquipment('burette', 418, 120, 'Buret HCl 0.1M', 'HCl', 45, 0.1),
        clampedToStandId: 'stand_1',
      },
      {
        ...createEquipment('erlenmeyer', 418, 280, 'Bình tam giác NaOH + Phenolphthalein', 'NaOH', 30, 0.1),
        content: {
          ...createChemicalSolution('NaOH', 30, 0.1),
          indicatorType: 'phenolphthalein',
        },
      },
      createEquipment('pipette', 560, 260, 'Pipet Hút Chỉ Thị'),
      createEquipment('chemical_bottle', 200, 260, 'Lọ Phenolphthalein', 'Phenolphthalein', 100, 0.1),
      createEquipment('graduated_cylinder', 680, 240, 'Ống Đong Thể Tích'),
    ],
  },
  {
    id: 'precipitates',
    name: '11. Phản Ứng Tạo Kết Tủa (BaSO4, Cu(OH)2, Fe(OH)3)',
    category: 'Phản ứng trao đổi',
    description: 'Trộn các dung dịch muối để tạo kết tủa màu đặc trưng: BaSO4 (trắng mịn), Cu(OH)2 (xanh lam tươi), Fe(OH)3 (nâu đỏ).',
    equipments: [
      createEquipment('beaker', 200, 260, 'Cốc CuSO4 (Xanh lam)', 'CuSO4', 80, 0.5),
      createEquipment('beaker', 360, 260, 'Cốc BaCl2', 'BaCl2', 80, 0.5),
      createEquipment('chemical_bottle', 520, 260, 'Dung dịch NaOH', 'NaOH', 150, 1.0),
      createEquipment('chemical_bottle', 660, 260, 'Axit H2SO4', 'H2SO4', 150, 1.0),
      createEquipment('pipette', 800, 260, 'Pipet Hút Dung Dịch 25ml'),
    ],
  },
  {
    id: 'hno3_preparation',
    name: '12. Điều chế Axit Nitric (HNO3)',
    category: 'Điều chế Axit',
    description: 'Điều chế HNO3 từ NaNO3 rắn + H2SO4 đặc theo sơ đồ bình ngưng tụ nước đá.',
    equipments: [
      { ...createEquipment('lab_stand', 220, 200, 'Giá đỡ'), id: 'stand_1' },
      {
        ...createEquipment('round_flask_1arm', 280, 160, 'Bình cầu 1 nhánh (NaNO3 + H2SO4)', undefined, 0, 0),
        clampedToStandId: 'stand_1',
        content: {
          volumeMl: 30,
          temperatureC: 25,
          speciesMoles: { 'H2SO4': 0.5 },
          precipitates: [{ id: 'nano3_s', name: 'Sodium nitrate rắn', formula: 'NaNO3(rắn)', massGram: 10, color: 'rgba(255, 255, 255, 0.95)', settledRatio: 1.0 }],
          colorRgba: { r: 240, g: 248, b: 255, a: 0.1 },
          pH: 1.0
        }
      },
      {
        ...createEquipment('alcohol_burner', 290, 320, 'Đèn Cồn Gia Nhiệt (t°)'),
        isBurning: false,
        hasCap: true,
      },
      {
        ...createEquipment('beaker', 520, 260, 'Chậu chứa nước đá', undefined, 0, 0),
        capacityMl: 500,
        width: 150,
        height: 120,
        content: {
          volumeMl: 250,
          temperatureC: 0,
          speciesMoles: { 'H2O': 13.8 },
          precipitates: [],
          colorRgba: { r: 240, g: 248, b: 255, a: 0.1 },
          pH: 7.0
        }
      },
      {
        ...createEquipment('round_flask', 520, 260, 'Bình cầu thu sản phẩm', undefined, 0, 0),
        capacityMl: 250,
        width: 100,
        height: 100,
      }
    ],
  },
];
