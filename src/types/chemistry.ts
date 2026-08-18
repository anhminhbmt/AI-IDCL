export type ChemicalType =
  | 'oxide'
  | 'acid'
  | 'base'
  | 'salt'
  | 'element'
  | 'gas_container'
  | 'indicator';

export type PhysicalState = 'liquid' | 'solid' | 'gas' | 'solution';

export interface ChemicalReagent {
  id: string;
  name: string;
  formula: string;
  type: ChemicalType;
  state: PhysicalState;
  color: string; // Hex or RGBA string
  molarMass: number; // g/mol
  pH?: number; // default pH if pure solution
  defaultConcentration?: number; // Molar or %
  defaultVolume?: number; // mL
  description?: string;
  solubility?: boolean; // Is soluble in water
}

export interface PrecipitateSolid {
  id: string;
  formula: string;
  name: string;
  color: string;
  massGram: number; // grams
  settledRatio: number; // 0 to 1 progress of sinking to bottom
}

export interface ActiveGas {
  formula: string;
  name: string;
  color: string;
  rate: number; // rate of bubble generation
}

export interface SolutionContent {
  volumeMl: number; // Volume of liquid in mL
  temperatureC: number; // Temperature in Celsius (default 25)
  // Amounts of dissolved species in Moles
  speciesMoles: Record<string, number>; 
  // Visual blended color
  colorRgba: { r: number; g: number; b: number; a: number };
  pH: number;
  precipitates: PrecipitateSolid[];
  activeGas?: ActiveGas | null;
  lastReactionMarkdown?: string;
  indicatorType?: 'litmus' | 'phenolphthalein' | 'universal' | null;
  indicatorColor?: string;
  isBoiling?: boolean;
  reactionFxTimer?: number;
}

export type EquipmentType =
  | 'test_tube'
  | 'beaker'
  | 'erlenmeyer'
  | 'round_flask'
  | 'round_flask_1arm'
  | 'round_flask_2neck'
  | 'graduated_cylinder'
  | 'pipette'
  | 'burette'
  | 'glass_rod'
  | 'alcohol_burner'
  | 'lab_stand'
  | 'chemical_bottle'
  | 'tripod_wire_gauze'
  | 'spatula'
  | 'wooden_splint'
  | 'fabric_strip';

export type ToolInteractionState =
  | 'IDLE'
  | 'DRAGGING_EMPTY'
  | 'LOADING'
  | 'LOADED'
  | 'DISPENSING';

export interface SpatulaSolidContent {
  chemicalId: string;
  name: string;
  formula: string;
  color: string;
  amountGram: number; // 0 to 5 grams
  isPowder?: boolean;
}

export interface EquipmentInstance {
  id: string;
  type: EquipmentType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // rotation in degrees
  capacityMl: number;
  content: SolutionContent;
  
  // Specific equipment states & laboratory physics
  clampedToStandId?: string | null;
  isBurning?: boolean; // For alcohol burner
  hasCap?: boolean; // For bottle / burner cap
  hasStopper?: boolean; // For flask / test tube rubber stopper
  valveOpen?: boolean; // For burette stopcock
  dripRate?: number; // burette drops per second
  suckedContent?: SolutionContent | null; // For pipette
  spatulaContent?: SpatulaSolidContent | null; // For spatula / spoon
  toolMode?: 'SUCK' | 'DISPENSE'; // Explicit tool mode (Hút vs Thả)
  interactionState?: ToolInteractionState;
  squeezeBulbRatio?: number; // 0 to 1 for pipette bulb squeeze
  tiltAngle?: number; // for spatula scoop/dispense tilt
  isStirring?: boolean; // For glass rod insertion
  hasAsbestosMesh?: boolean; // Wire gauze / Lưới amiăng under beaker/flask
  preheatProgress?: number; // 0 to 1 progress for test tube hơ đều ngọn lửa
  isSwirling?: boolean; // Erlenmeyer flask 3-finger wrist rotation during titration
  hasRubberPaddedClamp?: boolean; // Giá đỡ & kẹp lót đệm cao su
  hideRingClamp?: boolean; // Hide ring clamp on lab stand
  
  // Wooden splint state
  splintState?: 'OFF' | 'GLOWING' | 'BURNING'; // Tắt, tàn đỏ, hay bùng cháy
  isLit?: boolean; // Tắt hay cháy
  flameColor?: string; // Mặc định cam (gỗ), vàng, hay xanh nhạt (H2)
  flameTimer?: number; // Timer for how long the flame persists
  
  // Dropping Funnel & Gas Test Papers
  hasDroppingFunnel?: boolean; // Phễu nhỏ giọt có khóa lắp trên miệng bình cầu
  droppingFunnelVolumeMl?: number; // Thể tích axit HCl đặc còn trong phễu nhỏ giọt (mL)
  hasDryPaper?: boolean; // Thử giấy màu khô
  hasWetPaper?: boolean; // Thử giấy màu ẩm
  wetPaperBleachProgress?: number; // 0 to 1 (mất màu do Cl2 + H2O -> HClO)
  hasRedLitmus?: boolean; // Giấy quỳ tím ẩm (Màu ban đầu: Đỏ/Tím)
  redLitmusColorProgress?: number; // 0 to 1 (Chuyển sang màu Xanh Lam do NH3)
  hasFabricStrip?: boolean; // Mẩu vải màu thử tính tẩy
  fabricColor?: string; // Màu vải sẫm gốc (#D32F2F)
  fabricBleachProgress?: number; // 0 to 1 (Tẩy màu sang #FFFFFF)
  gasFillLevel?: number; // 0 to 1 (khí Cl2 / CO2 / NH3 dâng từ đáy bình thu khí lên)
  isCo2Collector?: boolean; // Bình cầu / bình tam giác thu khí CO2 khô
  
  label?: string; // Custom label on glassware
}

export interface PresetExperiment {
  id: string;
  name: string;
  category: string;
  description: string;
  equipments: EquipmentInstance[];
}

export interface ChemicalReactionRule {
  id: string;
  name: string;
  reactants: { formula: string; ratio: number }[];
  products: { formula: string; ratio: number; state: 'aq' | 's' | 'g' | 'l' }[];
  equationMarkdown: string;
  requiresHeat?: boolean;
  minTempC?: number;
  catalyst?: string;
  heatChangeJ?: number; // Exothermic (-) or Endothermic (+)
  description: string;
  eventTriggers?: {
    bubbleEffect?: {
      gasFormula: string;
      gasName: string;
      rate: 'light' | 'moderate' | 'vigorous';
      color?: string;
    };
    colorTransition?: {
      fromColor?: string;
      toColor?: string;
      to?: string;
      durationMs?: number;
    };
    precipitateEffect?: {
      formula: string;
      color: string;
      amount: 'light' | 'moderate' | 'heavy';
    };
    heatEffect?: {
      isExothermic: boolean;
      tempRiseC?: number;
    };
    shakeEffect?: boolean;
  };
}
