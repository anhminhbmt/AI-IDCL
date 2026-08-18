import React, { useRef, useEffect, useState } from 'react';
import {
  EquipmentInstance,
  SolutionContent,
  EquipmentType,
  ToolInteractionState,
  SpatulaSolidContent,
  PrecipitateSolid,
} from '../types/chemistry';
import {
  processSolutionState,
  mixSolutions,
  addSolidToSolution,
  parseColorToRgba,
  getSolidColor,
  getChemicalColorInfo,
  calculateSolutionPh,
} from '../engine/ChemicalEngine';
import { createEquipment, createChemicalSolution, createEmptySolution, STANDARD_EQUIPMENT_CAPACITIES, getEquipmentDimensions } from '../engine/EquipmentClass';
import { CHEMICAL_DATABASE } from '../engine/ChemicalDatabase';
import { formatChemicalText, formatFormula } from '../utils/chemicalFormatter';
import { ReactionAnalysisPanel } from './ReactionAnalysisPanel';
import { HippoIcon } from './HippoIcon';
import {
  Flame,
  RotateCcw,
  Pipette as PipetteIcon,
  Trash2,
  Droplets,
  Zap,
  UtensilsCrossed,
  Archive,
  AlertTriangle,
  Sliders,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  Layers,
  Unlink,
} from 'lucide-react';

// Polyfill CanvasRenderingContext2D.prototype.roundRect for maximum browser compatibility
if (typeof window !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    this: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | number[]
  ) {
    let r = 0;
    if (typeof radii === 'number') {
      r = radii;
    } else if (Array.isArray(radii) && radii.length > 0) {
      r = radii[0] || 0;
    }
    r = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, Math.abs(r));
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

interface LabCanvas2DProps {
  equipments: EquipmentInstance[];
  setEquipments: React.Dispatch<React.SetStateAction<EquipmentInstance[]>>;
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  onSelectEquipmentForDetails: (eq: EquipmentInstance | null) => void;
  onOpenChatbot?: () => void;
  onResetDesk?: () => void;
}

// Particle System Interfaces
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface FluidDropParticle {
  x: number;
  y: number;
  vy: number;
  color: string;
  size: number;
  targetEqId: string;
  transferMl: number;
  chemicalLabel?: string;
  dropSolution?: SolutionContent;
}

interface PowderStreamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  targetEqId: string;
  transferGram: number;
  chemicalId: string;
}

interface RippleParticle {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface InflowParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
  isPowder?: boolean;
}

// Helper to compare two chemical formulas ignoring case and whitespace
function isSameChemicalFormula(formulaA: string, formulaB: string): boolean {
  if (!formulaA || !formulaB) return false;
  if (formulaA === 'H2O' || formulaB === 'H2O') return false;
  const cleanA = formulaA.replace(/[^a-zA-Z0-9()]/g, '').toLowerCase();
  const cleanB = formulaB.replace(/[^a-zA-Z0-9()]/g, '').toLowerCase();
  return cleanA === cleanB;
}

// Helper to resolve the primary chemical reagent inside an equipment container
function getContainerPrimaryChemical(container: EquipmentInstance) {
  if (!container) return null;

  // 1. Check speciesMoles in solution content
  if (container.content && container.content.speciesMoles) {
    let maxMoles = 0;
    let mainFormula = '';

    // Priority 1: non-H2O species (solutes) with any non-zero amount (> 1e-9)
    for (const [formula, moles] of Object.entries(container.content.speciesMoles)) {
      if (formula !== 'H2O' && moles > 1e-9) {
        if (moles > maxMoles) {
          maxMoles = moles;
          mainFormula = formula;
        }
      }
    }

    // Priority 2: H2O if no non-H2O solute is present
    if (!mainFormula && (container.content.speciesMoles['H2O'] || 0) > 0) {
      mainFormula = 'H2O';
    }

    if (mainFormula) {
      const match = CHEMICAL_DATABASE.find(
        (c) => c.formula === mainFormula || c.id === mainFormula
      );
      if (match) return match;
    }
  }

  // 2. Check precipitates
  if (container.content && container.content.precipitates && container.content.precipitates.length > 0) {
    const p = container.content.precipitates.find((item) => item.massGram > 0.0001) || container.content.precipitates[0];
    const match = CHEMICAL_DATABASE.find(
      (c) => c.formula === p.formula || c.id === p.formula || c.name === p.name
    );
    if (match) return match;
  }

  // 3. Search by label or name ONLY IF it is a chemical_bottle
  if (container.type === 'chemical_bottle') {
    const textToSearch = `${container.label || ''} ${container.name || ''}`;
    if (textToSearch.trim()) {
      const exact = CHEMICAL_DATABASE.find(
        (c) =>
          c.id === container.label ||
          c.formula === container.label ||
          c.name === container.label ||
          c.id === container.name ||
          c.formula === container.name ||
          c.name === container.name
      );
      if (exact) return exact;

      const subMatch = CHEMICAL_DATABASE.find(
        (c) =>
          (c.id && textToSearch.includes(c.id)) ||
          (c.formula && textToSearch.includes(c.formula)) ||
          (c.name && textToSearch.includes(c.name))
      );
      if (subMatch) return subMatch;
    }
  }

  return null;
}

// Helper to get a comprehensive label showing ALL chemicals inside an equipment container
function getContainerLabelStr(container: EquipmentInstance): string {
  if (!container) return '';

  const activeNonH2oSpecies: string[] = [];
  let hasH2O = false;

  if (container.content && container.content.speciesMoles) {
    for (const [formula, moles] of Object.entries(container.content.speciesMoles)) {
      if (moles > 0.000005) {
        if (formula === 'H2O') {
          hasH2O = true;
        } else {
          activeNonH2oSpecies.push(formatFormula(formula));
        }
      }
    }
  }

  const activePrecipitates = (container.content?.precipitates || [])
    .filter((p) => p.massGram > 0.0005)
    .map((p) => formatFormula(p.formula));

  // Remove formulas from activeNonH2oSpecies that are already present in activePrecipitates (e.g. CaCO3 solid)
  const filteredNonH2oSpecies = activeNonH2oSpecies.filter(
    (s) => !activePrecipitates.includes(s)
  );

  // 1. Solutes present
  if (filteredNonH2oSpecies.length > 0) {
    const formattedSolutes = filteredNonH2oSpecies.join(' + ');
    const solStr = hasH2O ? `Dung dịch ${formattedSolutes}` : formattedSolutes;
    if (activePrecipitates.length > 0) {
      return `${solStr} + ${activePrecipitates.join(' + ')}`;
    }
    return solStr;
  }

  // 2. H2O + Precipitates
  if (hasH2O) {
    if (activePrecipitates.length > 0) {
      return `H₂O + ${activePrecipitates.join(' + ')}`;
    }
    return 'H₂O';
  }

  // 3. Dry solids / powders
  if (activePrecipitates.length > 0) {
    return activePrecipitates.join(' + ');
  }

  // 4. Fallback to primary reagent formula or label / name
  const primary = getContainerPrimaryChemical(container);
  if (primary) {
    return formatFormula(primary.formula);
  }

  return formatFormula(container.label || container.name || '');
}

// Helper to verify chemical compatibility between a tool (Pipette/Spatula) and a target container
function checkToolChemicalCompatibility(
  tool: EquipmentInstance,
  targetContainer: EquipmentInstance,
  mode: 'SUCK' | 'DISPENSE'
): { compatible: boolean; warningMsg: string | null } {
  const isChemBottle = targetContainer.type === 'chemical_bottle';
  const targetReagent = getContainerPrimaryChemical(targetContainer);
  
  // Resolve target solute formula
  let targetFormula = targetReagent ? targetReagent.formula : '';
  if (!targetFormula || targetFormula === 'H2O') {
    if (targetContainer.content?.speciesMoles) {
      const nonH2oKey = Object.keys(targetContainer.content.speciesMoles).find((k) => k !== 'H2O' && (targetContainer.content.speciesMoles[k] || 0) > 1e-9);
      if (nonH2oKey) targetFormula = nonH2oKey;
    }
  }
  if (!targetFormula || targetFormula === 'H2O') {
    targetFormula = targetContainer.label || targetContainer.name || '';
  }

  const targetName = targetReagent
    ? targetReagent.name
    : (targetContainer.label || targetContainer.name || targetFormula || 'bình chứa');

  const hasTargetLiquid = Boolean(targetContainer.content && targetContainer.content.volumeMl > 0);
  const hasTargetSolid = Boolean(
    targetContainer.content &&
    targetContainer.content.precipitates &&
    targetContainer.content.precipitates.length > 0 &&
    targetContainer.content.precipitates.some((p) => p.massGram > 0.0001)
  );
  // chemical_bottle is never empty
  const isTargetEmpty = !isChemBottle && !hasTargetLiquid && !hasTargetSolid;

  // 1. PIPETTE LOGIC
  if (tool.type === 'pipette') {
    const currentVol = tool.suckedContent?.volumeMl || 0;
    let toolFormula = '';
    let toolName = 'hóa chất';

    if (currentVol > 0.001 && tool.suckedContent) {
      const toolReagent = getContainerPrimaryChemical({ ...tool, content: tool.suckedContent } as EquipmentInstance);
      if (toolReagent && toolReagent.formula !== 'H2O') {
        toolFormula = toolReagent.formula;
        toolName = toolReagent.name;
      } else {
        const nonH2oKey = Object.keys(tool.suckedContent.speciesMoles || {}).find((k) => k !== 'H2O' && (tool.suckedContent!.speciesMoles[k] || 0) > 1e-9);
        if (nonH2oKey) {
          toolFormula = nonH2oKey;
          const dbItem = CHEMICAL_DATABASE.find((c) => c.formula === nonH2oKey || c.id === nonH2oKey);
          toolName = dbItem ? dbItem.name : nonH2oKey;
        }
      }
    }

    const hasToolChem = currentVol > 0.001 && Boolean(toolFormula);
    const hasTargetChem = !isTargetEmpty && Boolean(targetFormula) && targetFormula !== 'H2O';

    if (mode === 'SUCK') {
      if (hasToolChem && hasTargetChem && !isSameChemicalFormula(toolFormula, targetFormula)) {
        if (isChemBottle) {
          // Auto-clear residual when dipping pipette into stock bottle to suck fresh chemical
          return { compatible: true, warningMsg: null };
        }
        return {
          compatible: false,
          warningMsg: `⚠️ Khác hóa chất! Pipet đang chứa ${toolName} (${formatFormula(toolFormula)}). Vui lòng xả hết hoặc nhấn "Rửa Pipet" trước khi hút ${targetName} (${formatFormula(targetFormula)}).`,
        };
      }
    } else if (mode === 'DISPENSE') {
      if (isChemBottle) {
        if (hasToolChem && hasTargetChem && isSameChemicalFormula(toolFormula, targetFormula)) {
          return { compatible: true, warningMsg: null };
        }
        if (hasToolChem && hasTargetChem) {
          return {
            compatible: false,
            warningMsg: `⚠️ Khác hóa chất! Sai thao tác, không thể thả/nhỏ dung dịch ${toolName} (${formatFormula(toolFormula)}) vào lọ hóa chất gốc ${targetName} (${formatFormula(targetFormula)}). Lọ hóa chất gốc chỉ được chứa 1 chất duy nhất.`,
          };
        }
        return {
          compatible: false,
          warningMsg: `⚠️ Sai thao tác! Lọ hóa chất gốc ${targetName} là bình lưu trữ gốc chỉ chứa 1 chất duy nhất, không được phép nhỏ/trút chất khác vào.`,
        };
      }
    }
  }

  // 2. SPATULA LOGIC
  if (tool.type === 'spatula') {
    const currentGrams = tool.spatulaContent?.amountGram || 0;
    const toolChemId = tool.spatulaContent?.chemicalId;
    const toolFormula = tool.spatulaContent?.formula || toolChemId || '';
    const toolName = tool.spatulaContent?.name || toolFormula || 'bột hóa chất';

    const hasToolChem = currentGrams > 0.001 && Boolean(toolFormula);
    const hasTargetChem = !isTargetEmpty && Boolean(targetFormula) && targetFormula !== 'H2O';

    if (mode === 'SUCK') {
      if (hasToolChem && hasTargetChem && !isSameChemicalFormula(toolFormula, targetFormula)) {
        if (isChemBottle) {
          // Auto-clear residual when dipping spatula into stock bottle to scoop fresh chemical
          return { compatible: true, warningMsg: null };
        }
        return {
          compatible: false,
          warningMsg: `⚠️ Khác hóa chất! Thìa đang múc ${toolName} (${formatFormula(toolFormula)}). Vui lòng xả hết hoặc nhấn "Rửa Thìa" trước khi múc ${targetName} (${formatFormula(targetFormula)}).`,
        };
      }
    } else if (mode === 'DISPENSE') {
      if (isChemBottle) {
        if (hasToolChem && hasTargetChem && isSameChemicalFormula(toolFormula, targetFormula)) {
          return { compatible: true, warningMsg: null };
        }
        if (hasToolChem && hasTargetChem) {
          return {
            compatible: false,
            warningMsg: `⚠️ Khác hóa chất! Sai thao tác, không thể thả/trút bột ${toolName} (${formatFormula(toolFormula)}) vào lọ hóa chất gốc ${targetName} (${formatFormula(targetFormula)}). Lọ hóa chất gốc chỉ được chứa 1 chất duy nhất.`,
          };
        }
        return {
          compatible: false,
          warningMsg: `⚠️ Sai thao tác! Lọ hóa chất gốc ${targetName} là bình lưu trữ gốc chỉ chứa 1 chất duy nhất, không được phép nhỏ/trút chất khác vào.`,
        };
      }
    }
  }

  return { compatible: true, warningMsg: null };
}

// Extract liquid from container into Pipette
function extractLiquidFromContainer(
  container: EquipmentInstance,
  volumeToExtractMl: number
): { extractedSolution: SolutionContent; updatedContainerContent: SolutionContent; actualExtractedVol: number } {
  const isChemBottle = container.type === 'chemical_bottle';
  const currentVol = container.content?.volumeMl || 0;

  if (isChemBottle) {
    const primaryReagent = getContainerPrimaryChemical(container);
    const chemId = primaryReagent ? primaryReagent.id : 'H2O';
    const actualConc = container.content && container.content.volumeMl > 0 && chemId !== 'H2O' 
        ? (container.content.speciesMoles[primaryReagent?.formula || chemId] || 0) / (container.content.volumeMl / 1000)
        : (primaryReagent?.defaultConcentration || 1.0);
    const extracted = createChemicalSolution(chemId, volumeToExtractMl, actualConc);
    return {
      extractedSolution: extracted,
      updatedContainerContent: container.content,
      actualExtractedVol: volumeToExtractMl,
    };
  }

  const actualExtractedVol = Math.min(volumeToExtractMl, currentVol);
  if (actualExtractedVol <= 0 || currentVol <= 0) {
    return {
      extractedSolution: createEmptySolution(),
      updatedContainerContent: container.content,
      actualExtractedVol: 0,
    };
  }

  const ratio = actualExtractedVol / currentVol;

  const extractedSpecies: Record<string, number> = {};
  const remainingSpecies: Record<string, number> = {};

  for (const [formula, moles] of Object.entries(container.content.speciesMoles || {})) {
    const mExtracted = moles * ratio;
    extractedSpecies[formula] = mExtracted;
    remainingSpecies[formula] = Math.max(0, moles - mExtracted);
  }

  const extractedPrecipitates: PrecipitateSolid[] = [];
  const remainingPrecipitates: PrecipitateSolid[] = [];

  for (const p of container.content.precipitates || []) {
    const mExtracted = p.massGram * ratio;
    if (mExtracted > 0) {
      extractedPrecipitates.push({ ...p, massGram: mExtracted });
    }
    const mRem = p.massGram - mExtracted;
    if (mRem > 0.001) {
      remainingPrecipitates.push({ ...p, massGram: mRem });
    }
  }

  const newVol = Math.max(0, currentVol - actualExtractedVol);

  const extractedSolution: SolutionContent = {
    ...container.content,
    volumeMl: actualExtractedVol,
    speciesMoles: extractedSpecies,
    precipitates: extractedPrecipitates,
    pH: calculateSolutionPh(extractedSpecies, actualExtractedVol),
  };

  const updatedContainerContent: SolutionContent = {
    ...container.content,
    volumeMl: newVol,
    speciesMoles: remainingSpecies,
    precipitates: remainingPrecipitates,
    pH: newVol > 0 ? calculateSolutionPh(remainingSpecies, newVol) : 7.0,
  };

  return { extractedSolution, updatedContainerContent, actualExtractedVol };
}

// Dispense liquid from Pipette into container
function dispenseLiquidFromPipette(
  pipetteContent: SolutionContent,
  targetContainer: EquipmentInstance,
  volumeToDispenseMl: number
): { remainingPipetteContent: SolutionContent; updatedTargetContent: SolutionContent; actualDispensedVol: number } {
  const isChemBottle = targetContainer.type === 'chemical_bottle';
  const currentPipVol = pipetteContent.volumeMl || 0;
  const actualDispenseVol = Math.min(volumeToDispenseMl, currentPipVol);

  if (actualDispenseVol <= 0 || currentPipVol <= 0) {
    return {
      remainingPipetteContent: pipetteContent,
      updatedTargetContent: targetContainer.content,
      actualDispensedVol: 0,
    };
  }

  const ratio = actualDispenseVol / currentPipVol;

  const dispensedSpecies: Record<string, number> = {};
  const remainingSpecies: Record<string, number> = {};

  for (const [formula, moles] of Object.entries(pipetteContent.speciesMoles || {})) {
    const mDispensed = moles * ratio;
    dispensedSpecies[formula] = mDispensed;
    remainingSpecies[formula] = Math.max(0, moles - mDispensed);
  }

  const dispensedPrecipitates: PrecipitateSolid[] = [];
  const remainingPrecipitates: PrecipitateSolid[] = [];

  for (const p of pipetteContent.precipitates || []) {
    const mDispensed = p.massGram * ratio;
    if (mDispensed > 0) {
      dispensedPrecipitates.push({ ...p, massGram: mDispensed });
    }
    const mRem = p.massGram - mDispensed;
    if (mRem > 0.001) {
      remainingPrecipitates.push({ ...p, massGram: mRem });
    }
  }

  const newPipVol = Math.max(0, currentPipVol - actualDispenseVol);

  const dispensedSolution: SolutionContent = {
    ...pipetteContent,
    volumeMl: actualDispenseVol,
    speciesMoles: dispensedSpecies,
    precipitates: dispensedPrecipitates,
    pH: calculateSolutionPh(dispensedSpecies, actualDispenseVol),
  };

  const remainingPipetteContent: SolutionContent = newPipVol > 0.001
    ? {
        ...pipetteContent,
        volumeMl: newPipVol,
        speciesMoles: remainingSpecies,
        precipitates: remainingPrecipitates,
        pH: calculateSolutionPh(remainingSpecies, newPipVol),
      }
    : createEmptySolution();

  let updatedTargetContent = targetContainer.content;
  if (!isChemBottle) {
    updatedTargetContent = mixSolutions(targetContainer.content, dispensedSolution, actualDispenseVol);
  }

  return { remainingPipetteContent, updatedTargetContent, actualDispensedVol: actualDispenseVol };
}

// Scoop solid from container into Spatula
function scoopSolidFromContainer(
  container: EquipmentInstance,
  spatulaTool: EquipmentInstance,
  gramsToScoop: number
): { newSpatulaContent: SpatulaSolidContent; updatedContainerContent: SolutionContent; actualScoopedGrams: number } {
  const isChemBottle = container.type === 'chemical_bottle';
  const primaryReagent = getContainerPrimaryChemical(container);
  const chemFormula = primaryReagent ? primaryReagent.formula : (container.label || container.name || 'CaCO3');
  const chemName = primaryReagent ? primaryReagent.name : chemFormula;
  const chemColor = primaryReagent?.color || 'rgba(245, 245, 245, 0.95)';

  const currentGrams = spatulaTool.spatulaContent?.amountGram || 0;
  const maxCap = spatulaTool.capacityMl || 5.0;

  if (isChemBottle) {
    const actualScooped = Math.min(gramsToScoop, maxCap - currentGrams);
    const newGrams = currentGrams + actualScooped;
    return {
      newSpatulaContent: {
        chemicalId: chemFormula,
        name: chemName,
        formula: chemFormula,
        color: chemColor,
        amountGram: newGrams,
        isPowder: true,
      },
      updatedContainerContent: container.content,
      actualScoopedGrams: actualScooped,
    };
  }

  const precipitates = container.content?.precipitates || [];
  if (precipitates.length > 0) {
    const targetP = precipitates[0];
    const maxPossible = Math.min(targetP.massGram, maxCap - currentGrams);
    const actualScooped = Math.min(gramsToScoop, maxPossible);

    if (actualScooped <= 0) {
      return {
        newSpatulaContent: spatulaTool.spatulaContent || {
          chemicalId: targetP.formula,
          name: targetP.name,
          formula: targetP.formula,
          color: targetP.color,
          amountGram: currentGrams,
          isPowder: true,
        },
        updatedContainerContent: container.content,
        actualScoopedGrams: 0,
      };
    }

    const newGrams = currentGrams + actualScooped;
    const remainingPrecipitates = precipitates.map((p, idx) => {
      if (idx === 0) {
        return { ...p, massGram: p.massGram - actualScooped };
      }
      return p;
    }).filter((p) => p.massGram > 0.001);

    return {
      newSpatulaContent: {
        chemicalId: targetP.formula,
        name: targetP.name,
        formula: targetP.formula,
        color: targetP.color,
        amountGram: newGrams,
        isPowder: true,
      },
      updatedContainerContent: {
        ...container.content,
        precipitates: remainingPrecipitates,
      },
      actualScoopedGrams: actualScooped,
    };
  }

  // Fallback: If container has volumeMl <= 0 (dry container) and speciesMoles
  if (container.content && container.content.volumeMl <= 0 && container.content.speciesMoles) {
    const activeSpecies = Object.entries(container.content.speciesMoles).filter(([f, m]) => m > 0.0001 && f !== 'H2O');
    if (activeSpecies.length > 0) {
      const [formula, moles] = activeSpecies[0];
      const reagent = CHEMICAL_DATABASE.find((c) => c.formula === formula || c.id === formula);
      const molarMass = reagent ? reagent.molarMass : 50;
      const totalMassGram = moles * molarMass;
      const name = reagent ? reagent.name : formula;
      const color = reagent?.color || 'rgba(245, 245, 245, 0.95)';

      const actualScooped = Math.min(gramsToScoop, totalMassGram, maxCap - currentGrams);
      if (actualScooped > 0) {
        const remainingMass = totalMassGram - actualScooped;
        const remainingMoles = remainingMass / molarMass;
        const updatedSpecies = { ...container.content.speciesMoles };
        if (remainingMoles > 0.0001) {
          updatedSpecies[formula] = remainingMoles;
        } else {
          delete updatedSpecies[formula];
        }

        return {
          newSpatulaContent: {
            chemicalId: formula,
            name,
            formula,
            color,
            amountGram: currentGrams + actualScooped,
            isPowder: true,
          },
          updatedContainerContent: {
            ...container.content,
            speciesMoles: updatedSpecies,
          },
          actualScoopedGrams: actualScooped,
        };
      }
    }
  }

  return {
    newSpatulaContent: spatulaTool.spatulaContent || {
      chemicalId: chemFormula,
      name: chemName,
      formula: chemFormula,
      color: chemColor,
      amountGram: currentGrams,
      isPowder: true,
    },
    updatedContainerContent: container.content,
    actualScoopedGrams: 0,
  };
}

// Dispense solid from Spatula into container
function dispenseSolidFromSpatula(
  spatulaTool: EquipmentInstance,
  targetContainer: EquipmentInstance,
  gramsToDispense: number
): { remainingSpatulaContent: SpatulaSolidContent | null; updatedTargetContent: SolutionContent; actualDispensedGrams: number } {
  const isChemBottle = targetContainer.type === 'chemical_bottle';
  const currentGrams = spatulaTool.spatulaContent?.amountGram || 0;
  const actualDispenseGrams = Math.min(gramsToDispense, currentGrams);

  if (actualDispenseGrams <= 0 || !spatulaTool.spatulaContent) {
    return {
      remainingSpatulaContent: spatulaTool.spatulaContent || null,
      updatedTargetContent: targetContainer.content,
      actualDispensedGrams: 0,
    };
  }

  const remainingGrams = Math.max(0, currentGrams - actualDispenseGrams);
  const remainingSpatulaContent: SpatulaSolidContent | null = remainingGrams > 0.001
    ? { ...spatulaTool.spatulaContent, amountGram: remainingGrams }
    : null;

  let updatedTargetContent = targetContainer.content;
  if (!isChemBottle) {
    updatedTargetContent = addSolidToSolution(
      targetContainer.content,
      spatulaTool.spatulaContent.chemicalId,
      actualDispenseGrams
    );
  }

  return { remainingSpatulaContent, updatedTargetContent, actualDispensedGrams: actualDispenseGrams };
}

export const LabCanvas2D: React.FC<LabCanvas2DProps> = ({
  equipments,
  setEquipments,
  selectedEquipmentId,
  setSelectedEquipmentId,
  onSelectEquipmentForDetails,
  onOpenChatbot,
  onResetDesk,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredEquipment, setHoveredEquipment] = useState<EquipmentInstance | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'move' | 'pour' | 'pipette' | 'spatula' | 'burn' | 'store'>('move');
  const [showReactionAnalysis, setShowReactionAnalysis] = useState<boolean>(false);

  // Particle systems refs
  const steamParticlesRef = useRef<Particle[]>([]);
  const bubbleParticlesRef = useRef<{ eqId: string; x: number; y: number; r: number; vy: number; alpha: number }[]>([]);
  const fluidDropParticlesRef = useRef<FluidDropParticle[]>([]);
  const powderStreamParticlesRef = useRef<PowderStreamParticle[]>([]);
  const rippleParticlesRef = useRef<RippleParticle[]>([]);
  const splashParticlesRef = useRef<SplashParticle[]>([]);
  const inflowParticlesRef = useRef<InflowParticle[]>([]);

  // Drag & Hold Pointer Tracking Refs
  const isPointerDownRef = useRef<boolean>(false);
  const pointerDownTimeRef = useRef<number>(0);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeSourceBottleIdRef = useRef<string | null>(null);
  const activeTargetVesselIdRef = useRef<string | null>(null);
  const activeHoldActionTextRef = useRef<string | null>(null);
  const activeHoldGestureModeRef = useRef<'SUCK' | 'DISPENSE' | null>(null);
  const lastStateSyncTimeRef = useRef<number>(0);

  // Synchronized State Refs (Guarantees zero-lag interactions & no stale closures)
  const equipmentsRef = useRef<EquipmentInstance[]>(equipments);
  useEffect(() => {
    if (!isPointerDownRef.current && !draggingIdRef.current) {
      equipmentsRef.current = equipments;
    }
  }, [equipments]);

  const selectedEquipmentIdRef = useRef<string | null>(selectedEquipmentId);
  useEffect(() => {
    selectedEquipmentIdRef.current = selectedEquipmentId;
  }, [selectedEquipmentId]);

  const activeToolRef = useRef<'move' | 'pour' | 'pipette' | 'spatula' | 'burn' | 'store'>(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const isExp3 = equipments.some(
    (e) =>
      e.name.includes('MnO2') ||
      e.name.includes('Cl2') ||
      e.name.includes('HCl đặc') ||
      e.name.includes('Bình thu khí Cl2')
  );

  const exp3TimerRef = useRef<number>(0);
  const exp4TimerRef = useRef<number>(0);
  const exp5TimerRef = useRef<number>(0);
  const exp6TimerRef = useRef<number>(0); // NH3 prep
  const exp9TimerRef = useRef<number>(0); // Cl2 & Javel prep
  const exp12TimerRef = useRef<number>(0); // HNO3 prep
  const draggingIdRef = useRef<string | null>(draggingId);
  const dragOffsetRef = useRef<{ x: number; y: number }>(dragOffset);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const buretteDripTimerRef = useRef<Record<string, number>>({});

  // Main Smooth Animation & Real-time Chemistry Loop (60 FPS)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const deltaTime = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const currentList = equipmentsRef.current;

      // 1. Step Chemical Physics Engine across all equipment
      let updatedList = currentList.map((eq) => {
        // Check if being heated by a lit alcohol burner (Directly OR via Tripod Assembly)
        const isHeated = currentList.some((other) => {
          if (other.type !== 'alcohol_burner' || !other.isBurning) return false;

          // 1. Direct heating under container
          const isDirectUnder = Math.abs(other.x - eq.x) < 75 && other.y > eq.y && (other.y - eq.y) < 260;
          if (isDirectUnder) return true;

          // 2. Clamped on same lab stand
          if (other.clampedToStandId && eq.clampedToStandId && other.clampedToStandId === eq.clampedToStandId) {
            return true;
          }

          // 3. Heating through Tripod Assembly: container resting on top of a tripod with a lit burner underneath
          const tripod = currentList.find(
            (t) =>
              t.type === 'tripod_wire_gauze' &&
              Math.abs(t.x - eq.x) < 70 &&
              Math.abs((eq.y + eq.height) - (t.y + 16)) < 45
          );
          if (tripod) {
            const isBurnerUnderTripod = Math.abs(other.x - tripod.x) < 70 && other.y > tripod.y && (other.y - tripod.y) < 260;
            if (isBurnerUnderTripod) return true;
          }

          return false;
        });

        // Check if glass rod is dipped inside container to stir solution
        const isStirred = currentList.some(
          (other) =>
            other.type === 'glass_rod' &&
            Math.abs(other.x - eq.x) < Math.max(28, eq.width / 2 + 8) &&
            other.y + other.height > eq.y + 10 &&
            other.y < eq.y + eq.height + 20
        );

        let stepContent = eq.content;
        let funnelVol = eq.droppingFunnelVolumeMl !== undefined ? eq.droppingFunnelVolumeMl : (eq.hasDroppingFunnel ? 25.0 : undefined);
        let updatedValveOpen = eq.valveOpen;

        // Auto-drip 12M HCl when dropping funnel valve is open on round flask (In Exp 3, requires alcohol burner to be ON as well)
        const isExp3ActiveForDrip = currentList.some(
          (c) =>
            c.name.includes('Bình 1') ||
            c.name.includes('Bình 2') ||
            c.name.includes('Bình thu khí Cl2')
        ) && !currentList.some((c) => c.hasFabricStrip || c.name.includes('NaOH') || c.name.includes('Javel'));
        const isBurnerOnForDrip = currentList.some((c) => c.type === 'alcohol_burner' && c.isBurning);

        if ((eq.hasDroppingFunnel || (eq.name.includes('Phễu') && eq.type !== 'pipette') || eq.name.includes('MnO2')) && eq.valveOpen) {
          if (!isExp3ActiveForDrip || isBurnerOnForDrip) {
            const currentFunnel = funnelVol !== undefined ? funnelVol : 25.0;
            if (currentFunnel > 0.001) {
              const addMl = Math.min(currentFunnel, 2.5 * deltaTime); // 2.5 mL / sec (25 mL drops in exactly 10 sec)
              const currentHCl = stepContent.speciesMoles['HCl'] || 0;
              const newHCl = currentHCl + 0.012 * addMl; // 12M HCl
              const newVol = stepContent.volumeMl + addMl;
              funnelVol = Math.max(0, currentFunnel - addMl);
              updatedValveOpen = funnelVol > 0;

              stepContent = {
                ...stepContent,
                volumeMl: newVol,
                speciesMoles: {
                  ...stepContent.speciesMoles,
                  'HCl': newHCl,
                },
              };
            } else {
              updatedValveOpen = false;
            }
          }
        }

        // Process chemical engine step
        const newContent = processSolutionState(stepContent, deltaTime, isHeated, isStirred);

        return {
          ...eq,
          droppingFunnelVolumeMl: funnelVol,
          valveOpen: updatedValveOpen,
          isStirring: isStirred,
          content: newContent,
        };
      });

      // Check if Exp 3 (Cl2 preparation) is active on canvas
      const isExp3Active = updatedList.some(
        (c) =>
          c.name.includes('Bình 1 (Dung dịch NaCl)') ||
          c.name.includes('Bình 2 (Axit H2SO4 đặc)') ||
          c.name.includes('Bình thu khí Cl2') ||
          c.hasWetPaper !== undefined ||
          c.hasDryPaper !== undefined
      ) && !updatedList.some((c) => c.hasFabricStrip || c.name.includes('Javel') || c.name.includes('Pipet hút'));

      if (isExp3Active) {
        // 1. Ensure wooden splints and test tubes are completely removed in Experiment 3
        updatedList = updatedList.filter((eq) => eq.type !== 'wooden_splint' && eq.type !== 'test_tube');

        let funnelEq = updatedList.find(
          (c) => c.hasDroppingFunnel || (c.name.includes('Phễu') && c.type !== 'pipette') || c.name.includes('MnO2')
        );
        const burnerEq = updatedList.find((c) => c.type === 'alcohol_burner');

        const isBurnerOn = Boolean(burnerEq && burnerEq.isBurning);
        const isFunnelOpen = Boolean(funnelEq && funnelEq.valveOpen);

        // Advance 10-second timer when burner is burning AND funnel valve is open
        if (isBurnerOn && isFunnelOpen && exp3TimerRef.current < 10.0) {
          exp3TimerRef.current = Math.min(10.0, exp3TimerRef.current + deltaTime);
        }

        const currentTimer = exp3TimerRef.current;
        const progress = Math.min(1.0, currentTimer / 10.0);

        if (currentTimer < 10.0 && isBurnerOn && isFunnelOpen) {
          const funnelVol = Math.max(0, 25.0 * (1.0 - progress));
          updatedList = updatedList.map((eq) => {
            // A. Round flask dropping funnel drops HCl
            if (eq.hasDroppingFunnel || (eq.name.includes('Phễu') && eq.type !== 'pipette') || eq.name.includes('MnO2')) {
              return {
                ...eq,
                droppingFunnelVolumeMl: funnelVol,
                valveOpen: funnelVol > 0,
              };
            }
            // B. Wash Bottles 1 & 2 receive rising Cl2 gas bubbles
            if (eq.name.includes('Bình 1') || eq.name.includes('Bình 2') || eq.name.includes('NaCl') || eq.name.includes('H2SO4')) {
              return {
                ...eq,
                content: {
                  ...eq.content,
                  activeGas: {
                    formula: 'Cl2',
                    name: 'Khí Cl₂',
                    color: 'rgba(163, 230, 53, 0.55)',
                    rate: 0.85,
                  },
                },
              };
            }
            // C. Receiver flask fills with Cl2 gas & bleaches wet paper strip
            if (eq.type === 'erlenmeyer' || eq.name.includes('Bình thu') || eq.hasDryPaper !== undefined || eq.hasWetPaper !== undefined) {
              const currentBleach = eq.wetPaperBleachProgress || 0;
              let newBleach = currentBleach;
              if (eq.hasWetPaper && progress > 0.1) {
                newBleach = Math.min(1.0, currentBleach + deltaTime * 0.125); // Takes ~8 seconds to bleach
              } else if (!eq.hasWetPaper) {
                newBleach = 0;
              }
              return {
                ...eq,
                gasFillLevel: Math.max(eq.gasFillLevel || 0, progress),
                wetPaperBleachProgress: newBleach,
              };
            }
            return eq;
          });
        } else if (currentTimer >= 10.0) {
          // Timer reached 10 seconds: Auto turn off burner, close valve, stop wash bottle bubbles, KEEP yellow gas & bleached paper!
          updatedList = updatedList.map((eq) => {
            if (eq.type === 'alcohol_burner') {
              return { ...eq, isBurning: false, hasCap: true };
            }
            if (eq.hasDroppingFunnel || (eq.name.includes('Phễu') && eq.type !== 'pipette') || eq.name.includes('MnO2')) {
              return { ...eq, valveOpen: false, droppingFunnelVolumeMl: 0 };
            }
            if (eq.name.includes('Bình 1') || eq.name.includes('Bình 2') || eq.name.includes('NaCl') || eq.name.includes('H2SO4')) {
              if (eq.content && eq.content.activeGas) {
                return { ...eq, content: { ...eq.content, activeGas: null } };
              }
            }
            if (eq.type === 'erlenmeyer' || eq.name.includes('Bình thu') || eq.hasDryPaper !== undefined || eq.hasWetPaper !== undefined) {
              const currentBleach = eq.wetPaperBleachProgress || 0;
              let newBleach = currentBleach;
              if (eq.hasWetPaper && (eq.gasFillLevel || 0) > 0.1) {
                newBleach = Math.min(1.0, currentBleach + deltaTime * 0.125); // Takes ~8 seconds to bleach
              } else if (!eq.hasWetPaper) {
                newBleach = 0;
              }
              return { ...eq, gasFillLevel: 1.0, wetPaperBleachProgress: newBleach };
            }
            return eq;
          });
        }
      }

      // Check if Exp 4 (CO2 preparation & drying) is active on canvas
      const isExp4Active = updatedList.some(
        (c) =>
          c.name.includes('CaCO3') ||
          c.name.includes('NaHCO3') ||
          c.isCo2Collector
      );

      if (isExp4Active) {
        // Filter out alcohol burners and wooden splints in Exp 4
        updatedList = updatedList.filter((eq) => eq.type !== 'alcohol_burner' && eq.type !== 'wooden_splint');

        let funnelEq = updatedList.find(
          (c) => c.hasDroppingFunnel || (c.name.includes('Phễu') && c.type !== 'pipette') || c.name.includes('CaCO3')
        );

        const isFunnelOpen = Boolean(funnelEq && funnelEq.valveOpen);

        // Advance 10-second timer when dropping funnel valve is open or once reaction has started
        if ((isFunnelOpen || exp4TimerRef.current > 0) && exp4TimerRef.current < 10.0) {
          exp4TimerRef.current = Math.min(10.0, exp4TimerRef.current + deltaTime);
        }

        const currentTimer = exp4TimerRef.current;
        const progress = Math.min(1.0, currentTimer / 10.0);

        if (currentTimer < 10.0 && (isFunnelOpen || currentTimer > 0)) {
          const funnelVol = Math.max(0, 25.0 * (1.0 - progress));
          const caco3Mass = Math.max(0, 10.0 * (1.0 - progress)); // Completely dissolves from 10.0g to 0g in 10s

          updatedList = updatedList.map((eq) => {
            // A. Erlenmeyer flask containing CaCO3 (HCl drops down, CaCO3 decreases, solution gets CaCl2, gas CO2 evolves)
            if (eq.hasDroppingFunnel || eq.name.includes('CaCO3') || (eq.name.includes('Phễu') && eq.type !== 'pipette')) {
              const prevPrecip = eq.content?.precipitates || [];
              const updatedPrecip = caco3Mass > 0.05
                ? prevPrecip.map((p) => (p.formula === 'CaCO3' ? { ...p, massGram: caco3Mass } : p))
                : prevPrecip.filter((p) => p.formula !== 'CaCO3');

              return {
                ...eq,
                droppingFunnelVolumeMl: funnelVol,
                valveOpen: funnelVol > 0,
                content: {
                  ...eq.content,
                  volumeMl: Math.min(45, 20 + progress * 25),
                  pH: 2.5,
                  speciesMoles: {
                    ...eq.content.speciesMoles,
                    CaCl2: 0.05 * progress,
                    HCl: Math.max(0, 0.05 * (1.0 - progress)),
                  },
                  precipitates: updatedPrecip,
                  activeGas: funnelVol > 0 ? {
                    formula: 'CO2',
                    name: 'Khí CO₂',
                    color: 'rgba(241, 245, 249, 0.6)',
                    rate: 0.9,
                  } : null,
                  lastReactionMarkdown: 'CaCO₃ (r) + 2HCl (dd) → CaCl₂ (dd) + CO₂↑ (k) + H₂O (l)',
                },
              };
            }

            // B. Wash Bottle 1 (NaHCO3 bão hòa) & Wash Bottle 2 (H2SO4 đặc) receive rising CO2 gas bubbles
            if (eq.name.includes('Bình 1') || eq.name.includes('Bình 2') || eq.name.includes('NaHCO3') || eq.name.includes('H2SO4')) {
              return {
                ...eq,
                content: {
                  ...eq.content,
                  activeGas: {
                    formula: 'CO2',
                    name: 'Khí CO₂',
                    color: 'rgba(241, 245, 249, 0.6)',
                    rate: 0.85,
                  },
                },
              };
            }

            // C. Round flask / Upright Collector fills with CO2 dry gas
            if (eq.type === 'round_flask_1arm' || eq.name.includes('Bình thu') || eq.isCo2Collector) {
              return {
                ...eq,
                gasFillLevel: Math.max(eq.gasFillLevel || 0, Math.max(0.25, progress)),
                content: {
                  ...eq.content,
                  activeGas: {
                    formula: 'CO2',
                    name: 'Khí CO₂ khô (Tinh khiết)',
                    color: 'rgba(241, 245, 249, 0.6)',
                    rate: 0.85,
                  },
                },
              };
            }
            return eq;
          });
        } else if (currentTimer >= 10.0) {
          // Timer reached 10 seconds: Auto turn off funnel valve, dissolve CaCO3 completely into CaCl2 solution, stop bubbles, KEEP dry CO2 in collector flask!
          updatedList = updatedList.map((eq) => {
            if (eq.hasDroppingFunnel || eq.name.includes('CaCO3') || (eq.name.includes('Phễu') && eq.type !== 'pipette')) {
              const prevPrecip = eq.content?.precipitates || [];
              const updatedPrecip = prevPrecip.filter((p) => p.formula !== 'CaCO3');
              return {
                ...eq,
                valveOpen: false,
                droppingFunnelVolumeMl: 0,
                content: {
                  ...eq.content,
                  volumeMl: 45,
                  pH: 3.0,
                  speciesMoles: {
                    ...eq.content.speciesMoles,
                    CaCl2: 0.05,
                    HCl: 0,
                  },
                  precipitates: updatedPrecip,
                  activeGas: null,
                  reactionFxTimer: 0,
                  lastReactionMarkdown: 'CaCO₃ (r) + 2HCl (dd) → CaCl₂ (dd) + CO₂↑ (k) + H₂O (l) (Phản ứng hoàn tất)',
                },
              };
            }
            if (eq.name.includes('Bình 1') || eq.name.includes('Bình 2') || eq.name.includes('NaHCO3') || eq.name.includes('H2SO4')) {
              if (eq.content) {
                return { ...eq, content: { ...eq.content, activeGas: null, reactionFxTimer: 0 } };
              }
            }
            if (eq.type === 'round_flask_1arm' || eq.name.includes('Bình thu') || eq.isCo2Collector) {
              return {
                ...eq,
                gasFillLevel: 1.0,
                content: {
                  ...eq.content,
                  activeGas: null,
                  reactionFxTimer: 0,
                },
              };
            }
            return eq;
          });
        }
      }

      // Check if Exp 5 (SO2 preparation & testing) is active on canvas
      const isExp5Active = updatedList.some(
        (c) =>
          c.name.includes('Na2SO3') ||
          c.name.includes('KMnO4')
      );

      if (isExp5Active) {
        let funnelEq = updatedList.find(
          (c) => c.hasDroppingFunnel || (c.name.includes('Phễu') && c.type !== 'pipette') || c.name.includes('Na2SO3')
        );
        const burnerEq = updatedList.find((c) => c.type === 'alcohol_burner');

        const isFunnelOpen = Boolean(funnelEq && funnelEq.valveOpen);
        const isBurnerOn = Boolean(burnerEq && burnerEq.isBurning);

        let speedMultiplier = isBurnerOn ? 1.0 : 0.0;
        if (isBurnerOn && (isFunnelOpen || exp5TimerRef.current > 0) && exp5TimerRef.current < 15.0) {
          exp5TimerRef.current = Math.min(15.0, exp5TimerRef.current + deltaTime * speedMultiplier);
        }

        const currentTimer = exp5TimerRef.current;
        const progress = Math.min(1.0, currentTimer / 15.0);

        if (currentTimer < 15.0 && (isFunnelOpen || currentTimer > 0) && isBurnerOn) {
          const funnelVol = Math.max(0, 40.0 * (1.0 - progress));
          const solidMass = Math.max(0, 8.0 * (1.0 - progress)); 

          updatedList = updatedList.map((eq) => {
            // A. Round flask containing Na2SO3
            if (eq.hasDroppingFunnel || eq.name.includes('Na2SO3') || (eq.name.includes('Phễu') && eq.type !== 'pipette')) {
              const prevPrecip = eq.content?.precipitates || [];
              const updatedPrecip = solidMass > 0.05
                ? prevPrecip.map((p) => (p.formula === 'Na2SO3' ? { ...p, massGram: solidMass } : p))
                : prevPrecip.filter((p) => p.formula !== 'Na2SO3');

              return {
                ...eq,
                droppingFunnelVolumeMl: funnelVol,
                valveOpen: funnelVol > 0,
                content: {
                  ...eq.content,
                  volumeMl: Math.min(45, 10 + progress * 35),
                  pH: 1.5,
                  speciesMoles: {
                    ...eq.content.speciesMoles,
                    Na2SO4: 0.05 * progress,
                    H2SO4: Math.max(0, 0.05 * (1.0 - progress)),
                  },
                  precipitates: updatedPrecip,
                  activeGas: funnelVol > 0 ? {
                    formula: 'SO2',
                    name: 'Khí SO₂',
                    color: 'rgba(253, 224, 71, 0.4)',
                    rate: 0.9 * speedMultiplier,
                  } : null,
                  lastReactionMarkdown: 'Na₂SO₃ (r) + H₂SO₄ (dd) → Na₂SO₄ (dd) + SO₂↑ (k) + H₂O (l)',
                },
              };
            }

            // B. Receiver flask containing KMnO4
            if (eq.name.includes('KMnO4')) {
                  // Bleaching logic: purple -> transparent (rgba(147, 51, 234) -> rgba(255,255,255,0.15))
              return {
                ...eq,
                content: {
                  ...eq.content,
                  activeGas: funnelVol > 0 ? {
                    formula: 'SO2',
                    name: 'Khí SO₂',
                    color: 'rgba(253, 224, 71, 0.4)',
                    rate: 0.85 * speedMultiplier,
                  } : null,
                  reactionFxTimer: 1.0,
                  colorRgba: {
                    r: Math.round(147 + (255 - 147) * progress),
                    g: Math.round(51 + (255 - 51) * progress),
                    b: Math.round(234 + (255 - 234) * progress),
                    a: Math.max(0.15, 0.85 * (1.0 - progress)),
                  },
                  lastReactionMarkdown: '5SO₂ (k) + 2KMnO₄ (dd) + 2H₂O (l) → K₂SO₄ (dd) + 2MnSO₄ (dd) + 2H₂SO₄ (dd)\n(Khí SO₂ làm mất màu thuốc tím)',
                },
              };
            }
            return eq;
          });
        } else if (currentTimer >= 15.0) {
          updatedList = updatedList.map((eq) => {
            if (eq.hasDroppingFunnel || eq.name.includes('Na2SO3') || (eq.name.includes('Phễu') && eq.type !== 'pipette')) {
              const prevPrecip = eq.content?.precipitates || [];
              const updatedPrecip = prevPrecip.filter((p) => p.formula !== 'Na2SO3');
              return {
                ...eq,
                valveOpen: false,
                droppingFunnelVolumeMl: 0,
                content: {
                  ...eq.content,
                  volumeMl: 45,
                  precipitates: updatedPrecip,
                  activeGas: null,
                  reactionFxTimer: 0,
                  lastReactionMarkdown: 'Na₂SO₃ (r) + H₂SO₄ (dd) → Na₂SO₄ (dd) + SO₂↑ (k) + H₂O (l) (Phản ứng hoàn tất)',
                },
              };
            }
            if (eq.name.includes('KMnO4')) {
              return {
                ...eq,
                content: {
                  ...eq.content,
                  activeGas: null,
                  reactionFxTimer: 0,
                  colorRgba: { r: 255, g: 255, b: 255, a: 0.15 },
                  lastReactionMarkdown: '5SO₂ (k) + 2KMnO₄ (dd) + 2H₂O (l) → K₂SO₄ (dd) + 2MnSO₄ (dd) + 2H₂SO₄ (dd)\n(KMnO₄ đã mất màu hoàn toàn)',
                },
              };
            }
            return eq;
          });
        }
      }

      // --------------------------------------------------------------------------------
      // EXPERIMENT 6: NH3 PREPARATION & PROPERTIES (NH4Cl + NaOH -> NH3 -> Quỳ tím hóa xanh)
      // --------------------------------------------------------------------------------
      const isExp6Active = updatedList.some(
        (c) =>
          c.name.includes('NH4Cl') ||
          c.name.includes('Úp ngược thu NH3')
      );

      if (isExp6Active) {
        let generatorTube = updatedList.find(
          (c) => c.name.includes('NH4Cl')
        );
        const burnerEq = updatedList.find((c) => c.type === 'alcohol_burner');
        const isBurnerOn = Boolean(burnerEq && burnerEq.isBurning);

        if (isBurnerOn && exp6TimerRef.current < 10.0) {
          exp6TimerRef.current = Math.min(10.0, exp6TimerRef.current + deltaTime);
        }

        const currentTimer = exp6TimerRef.current;
        const progress = Math.min(1.0, currentTimer / 8.0); // NH3 generation progress (0-8s)
        const litmusProgress = Math.max(0, Math.min(1.0, (currentTimer - 5.0) / 3.0)); // Litmus turns blue from 5s to 8s

        if (currentTimer > 0 && currentTimer < 10.0 && isBurnerOn) {
          updatedList = updatedList.map((eq) => {
            // A. Test tube containing NH4Cl + Ca(OH)2
            if (eq.name.includes('NH4Cl')) {
              return {
                ...eq,
                content: {
                  ...eq.content,
                  chemicalId: 'NH4Cl + Ca(OH)2',
                  activeGas: {
                    formula: 'NH3',
                    name: 'Khí NH₃',
                    color: 'rgba(255, 255, 255, 0.4)',
                    rate: 0.8 * (1.0 - progress), // Bubble rate decreases
                  },
                  reactionFxTimer: currentTimer,
                  lastReactionMarkdown: '2NH₄Cl (r) + Ca(OH)₂ (r) → CaCl₂ (r) + 2NH₃↑ (k) + 2H₂O (h)',
                },
              };
            }
            // B. Inverted test tube receiving NH3
            if (eq.name.includes('Úp ngược thu NH3')) {
              return {
                ...eq,
                gasFillLevel: progress,
                redLitmusColorProgress: litmusProgress, // 0 to 1
                content: {
                  ...eq.content,
                  lastReactionMarkdown: 'NH₃ (k) + H₂O (l) ⇌ NH₄⁺ (dd) + OH⁻ (dd)\n(Khí NH₃ tan vào nước trên giấy quỳ tạo môi trường bazơ làm quỳ tím hóa xanh lam)',
                }
              };
            }
            return eq;
          });
        } else if (currentTimer >= 10.0) {
          // Timer reached 10 seconds: Reaction completes
          updatedList = updatedList.map((eq) => {
            if (eq.name.includes('NH4Cl')) {
              if (eq.content) {
                return { 
                  ...eq, 
                  content: { 
                    ...eq.content, 
                    chemicalId: 'CaCl2 + H2O',
                    precipitates: [
                      { id: 'cacl2_solid', name: 'Calcium chloride', formula: 'CaCl2', color: 'rgba(255, 255, 255, 0.95)', massGram: 4.1, settledRatio: 1.0 }
                    ],
                    activeGas: null, 
                    reactionFxTimer: 0,
                    lastReactionMarkdown: '2NH₄Cl (r) + Ca(OH)₂ (r) →(t°) CaCl₂ (r) + 2NH₃↑ (k) + 2H₂O (h)\n(Sau phản ứng, trong ống nghiệm 1 tạo thành muối CaCl₂ và H₂O)',
                  } 
                };
              }
            }
            if (eq.name.includes('Úp ngược thu NH3')) {
              return {
                ...eq,
                gasFillLevel: 1.0,
                redLitmusColorProgress: 1.0,
                content: {
                  ...eq.content,
                  lastReactionMarkdown: 'NH₃ (k) + H₂O (l) ⇌ NH₄⁺ (dd) + OH⁻ (dd)\n(Khí NH₃ đầy ống nghiệm 2, tan vào nước ở giấy quỳ tím ẩm tạo OH⁻ làm quỳ tím hóa xanh lam chứng minh tính bazơ của amoniac)',
                }
              };
            }
            return eq;
          });
        }
      }

      // --------------------------------------------------------------------------------

      // --------------------------------------------------------------------------------
      // EXPERIMENT 12: HNO3 PREPARATION (NaNO3 + H2SO4)
      // --------------------------------------------------------------------------------
      const isExp12Active = updatedList.some((c) => c.name.includes('Bình cầu 1 nhánh') || c.name.includes('Bình cầu cổ cong'));
      if (isExp12Active) {
        const retortEq = updatedList.find((c) => c.name.includes('Bình cầu 1 nhánh') || c.name.includes('Bình cầu cổ cong'));
        const burnerEq = updatedList.find((c) => c.type === 'alcohol_burner');
        const isBurnerOn = Boolean(burnerEq && burnerEq.isBurning);

        if (!isBurnerOn) {
           exp12TimerRef.current = 0;
        } else if (exp12TimerRef.current < 10.0) {
           exp12TimerRef.current = Math.min(10.0, exp12TimerRef.current + deltaTime);
        }

        const currentTimer = exp12TimerRef.current;

        if (currentTimer > 0 && currentTimer < 10.0 && isBurnerOn) {
          if (retortEq) {
             // check if reaction is producing HNO3
             if (retortEq.content.activeGas && retortEq.content.activeGas.formula === 'HNO3') {
               // Find receiver
               const recvEqIndex = updatedList.findIndex(c => c.name.includes('Bình cầu thu sản phẩm'));
               if (recvEqIndex !== -1) {
                  // Condense HNO3 gas into receiver liquid
                  const rate = retortEq.content.activeGas.rate;
                  const condensedVol = rate * deltaTime * 5; // ml per sec
                  const condensedMoles = (condensedVol / 1000) * 15; // roughly
                  
                  updatedList[recvEqIndex] = {
                    ...updatedList[recvEqIndex],
                    content: {
                      ...updatedList[recvEqIndex].content,
                      volumeMl: (updatedList[recvEqIndex].content.volumeMl || 0) + condensedVol,
                      colorRgba: { r: 255, g: 245, b: 157, a: 0.7 }, // Vàng nhạt do NO2 tan
                      speciesMoles: {
                        ...updatedList[recvEqIndex].content.speciesMoles,
                        'HNO3': (updatedList[recvEqIndex].content.speciesMoles['HNO3'] || 0) + condensedMoles
                      },
                      pH: 1.0
                    }
                  };
               }
             }
          }
        } else if (currentTimer >= 10.0) {
           // Timer reached 10 seconds: Auto turn off burner, stop gas generation, cool down flask
           updatedList = updatedList.map((eq) => {
             if (eq.type === 'alcohol_burner') {
               return { ...eq, isBurning: false, hasCap: true };
             }
             if (eq.name.includes('Bình cầu 1 nhánh') || eq.name.includes('Bình cầu cổ cong')) {
               if (eq.content) {
                 return {
                   ...eq,
                   content: {
                     ...eq.content,
                     activeGas: null,
                     temperatureC: Math.min(eq.content.temperatureC, 25) // Cool down so boiling stops immediately
                   }
                 };
               }
             }
             return eq;
           });
        }
      }

      // --------------------------------------------------------------------------------
      // EXPERIMENT 9: JAVEL WATER PREPARATION & BLEACHING TEST (MnO2 + HCl -> Cl2 -> NaOH -> Javel)
      // --------------------------------------------------------------------------------
      const isExp9Active = updatedList.some(
        (c) => c.name.includes('Pipet hút Nước Javel') || c.name.includes('NaCl(dd)+NaClO(dd)') || c.name.includes('Nước Javel') || c.name.includes('Mẩu vải')
      );

      if (isExp9Active) {
        let generatorFlask = updatedList.find(
          (c) => c.name.includes('MnO2') || c.hasDroppingFunnel
        );
        const burnerEq = updatedList.find((c) => c.type === 'alcohol_burner');

        const isFunnelOpen = Boolean(generatorFlask && generatorFlask.valveOpen);
        const isBurnerOn = Boolean(burnerEq && burnerEq.isBurning);

        let speedMultiplier = isBurnerOn ? 1.0 : 0.0;
        if (isBurnerOn && (isFunnelOpen || exp9TimerRef.current > 0) && exp9TimerRef.current < 15.0) {
          exp9TimerRef.current = Math.min(15.0, exp9TimerRef.current + deltaTime * speedMultiplier);
        }

        const currentTimer = exp9TimerRef.current;
        const progress = Math.min(1.0, currentTimer / 12.0);

        if (currentTimer < 15.0 && (isFunnelOpen || currentTimer > 0)) {
          const funnelVol = Math.max(0, 25.0 * (1.0 - progress));
          const solidMass = Math.max(0, 4.0 * (1.0 - progress));

          updatedList = updatedList.map((eq) => {
            // A. Round flask containing MnO2 + HCl
            if (eq.name.includes('MnO2') || (eq.hasDroppingFunnel && eq.type.startsWith('round_flask'))) {
              const prevPrecip = eq.content?.precipitates || [];
              const updatedPrecip = solidMass > 0.05
                ? prevPrecip.map((p) => (p.formula === 'MnO2' ? { ...p, massGram: solidMass } : p))
                : prevPrecip.filter((p) => p.formula !== 'MnO2');

              return {
                ...eq,
                droppingFunnelVolumeMl: funnelVol,
                valveOpen: funnelVol > 0,
                content: {
                  ...eq.content,
                  volumeMl: Math.min(40, 10 + progress * 25),
                  pH: 0.5,
                  speciesMoles: {
                    ...eq.content.speciesMoles,
                    MnCl2: 0.04 * progress,
                    HCl: Math.max(0, 0.08 * (1.0 - progress)),
                  },
                  precipitates: updatedPrecip,
                  activeGas: (funnelVol > 0 || currentTimer > 0) ? {
                    formula: 'Cl2',
                    name: 'Khí Clo (Cl₂)',
                    color: 'rgba(192, 202, 51, 0.65)',
                    rate: 0.9 * speedMultiplier,
                  } : null,
                  reactionFxTimer: currentTimer,
                  lastReactionMarkdown: 'MnO₂ (r) + 4HCl (đặc) →(t°) MnCl₂ (dd) + Cl₂↑ (k) + 2H₂O (l)\n(Đun nóng bình cầu sinh khí Clo vàng lục nhẹ hơn/thoát mạnh)',
                },
              };
            }

            // B. Reaction beaker containing NaOH 10% -> Javel (NaCl + NaClO)
            if (eq.name.includes('NaOH') || eq.name.includes('Cốc phản ứng') || eq.name.includes('NaCl') || eq.name.includes('Javel')) {
              const javelVolume = Math.min(110, 100 + progress * 10);
              return {
                ...eq,
                content: {
                  ...eq.content,
                  chemicalId: 'Nước Javel (NaCl + NaClO)',
                  volumeMl: javelVolume,
                  pH: 11.5,
                  speciesMoles: {
                    ...eq.content.speciesMoles,
                    NaCl: 0.05 * progress,
                    NaClO: 0.05 * progress,
                    NaOH: Math.max(0, 0.1 * (1.0 - progress)),
                  },
                  activeGas: (funnelVol > 0 || currentTimer > 0) ? {
                    formula: 'Cl2',
                    name: 'Khí Clo (Cl₂)',
                    color: 'rgba(192, 202, 51, 0.5)',
                    rate: 0.85 * speedMultiplier,
                  } : null,
                  reactionFxTimer: currentTimer,
                  colorRgba: {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 0.15, // Clear / transparent Javel water
                  },
                  lastReactionMarkdown: 'Cl₂ (k) + 2NaOH (dd) → NaCl (dd) + NaClO (dd) + H₂O (l)\n(Khí Clo sục vào dung dịch NaOH sủi bọt tạo thành dung dịch Nước Javel không màu chứa NaCl + NaClO)',
                },
              };
            }
            return eq;
          });
        } else if (currentTimer >= 15.0) {
          updatedList = updatedList.map((eq) => {
            if (eq.name.includes('MnO2') || (eq.hasDroppingFunnel && eq.type.startsWith('round_flask'))) {
              const prevPrecip = eq.content?.precipitates || [];
              const updatedPrecip = prevPrecip.filter((p) => p.formula !== 'MnO2');
              return {
                ...eq,
                valveOpen: false,
                droppingFunnelVolumeMl: 0,
                content: {
                  ...eq.content,
                  volumeMl: 35,
                  precipitates: updatedPrecip,
                  activeGas: null,
                  reactionFxTimer: 0,
                  lastReactionMarkdown: 'MnO₂ (r) + 4HCl (đặc) →(t°) MnCl₂ (dd) + Cl₂↑ (k) + 2H₂O (l) (Phản ứng điều chế hoàn tất)',
                },
              };
            }
            if (eq.name.includes('NaOH') || eq.name.includes('Cốc phản ứng') || eq.name.includes('NaCl') || eq.name.includes('Javel')) {
              return {
                ...eq,
                name: 'Cốc chứa dung dịch NaCl(dd) + NaClO(dd) (Nước Javel)',
                content: {
                  ...eq.content,
                  chemicalId: 'Nước Javel (NaCl + NaClO)',
                  activeGas: null,
                  reactionFxTimer: 0,
                  colorRgba: { r: 255, g: 255, b: 255, a: 0.15 },
                  lastReactionMarkdown: 'Cl₂ (k) + 2NaOH (dd) → NaCl (dd) + NaClO (dd) + H₂O (l)\n(Hoàn tất phản ứng: Cốc NaOH đã chuyển thành dung dịch NaCl(dd) + NaClO(dd) - Nước Javel)',
                },
              };
            }
            return eq;
          });
        }
      }

      // Update glass rod active stirring state
      updatedList = updatedList.map((eq) => {
        if (eq.type === 'glass_rod') {
          const rodTipX = eq.x;
          const rodTipY = eq.y + eq.height;
          const isRodInsideLiquid = updatedList.some(
            (c) =>
              c.id !== eq.id &&
              c.type !== 'glass_rod' &&
              c.type !== 'lab_stand' &&
              c.type !== 'tripod_wire_gauze' &&
              c.content &&
              c.content.volumeMl > 0 &&
              Math.abs(c.x - rodTipX) < Math.max(28, c.width / 2 + 8) &&
              rodTipY > c.y + 10 &&
              eq.y < c.y + c.height + 20
          );
          return {
            ...eq,
            isStirring: isRodInsideLiquid,
          };
        }
        return eq;
      });

      // Update wooden splint gas testing & Fabric strip bleaching progression
      updatedList = updatedList.map((eq) => {
        if (eq.hasFabricStrip) {
          if (eq.fabricBleachProgress !== undefined && eq.fabricBleachProgress > 0 && eq.fabricBleachProgress < 1.0) {
            // Rate = 1.0 / 5.0 seconds = 0.20 per second
            const nextProgress = Math.min(1.0, eq.fabricBleachProgress + deltaTime * 0.20);
            if (nextProgress >= 1.0) {
              activeHoldActionTextRef.current = '✨ Nước Javel (NaClO) đã TẨY TRẮNG MẨU VẢI MÀU thành màu trắng tinh (#FFFFFF)!';
            } else {
              activeHoldActionTextRef.current = `⚡ Nước Javel (NaClO) đang tẩy màu mẩu vải nhuộm hữu cơ (${Math.round(nextProgress * 100)}%)...`;
            }
            return {
              ...eq,
              fabricBleachProgress: nextProgress,
            };
          }
        }
        if (eq.type === 'wooden_splint') {
          const splintX = eq.x;
          const splintY = eq.y;

          // Find container producing active gas near the splint mouth (distance < 80px horizontal, 110px vertical)
          const nearGasContainer = updatedList.find(
            (c) =>
              c.id !== eq.id &&
              c.content &&
              c.content.activeGas &&
              c.content.activeGas.rate > 0.02 &&
              Math.abs(c.x - splintX) < Math.max(80, c.width / 2 + 50) &&
              Math.abs(splintY - c.y) < 110
          );

          if (nearGasContainer && nearGasContainer.content && nearGasContainer.content.activeGas) {
            const activeGasFormula = nearGasContainer.content.activeGas.formula || '';
            const rxnMd = nearGasContainer.content.lastReactionMarkdown || '';
            
            let gasForm = activeGasFormula.replace(/\(g\)/gi, '').trim();
            if (!gasForm) {
              if (rxnMd.includes('H2') || rxnMd.includes('H₂')) gasForm = 'H2';
              else if (rxnMd.includes('O2') || rxnMd.includes('O₂')) gasForm = 'O2';
              else if (rxnMd.includes('CO2') || rxnMd.includes('CO₂')) gasForm = 'CO2';
              else if (rxnMd.includes('Cl2') || rxnMd.includes('Cl₂')) gasForm = 'Cl2';
            }
            if (gasForm.includes('H2') || gasForm.includes('H₂')) gasForm = 'H2';
            if (gasForm.includes('O2') || gasForm.includes('O₂')) gasForm = 'O2';
            if (gasForm.includes('Cl2') || gasForm.includes('Cl₂')) gasForm = 'Cl2';

            if (gasForm === 'H2' && eq.splintState !== 'OFF') {
              if (eq.flameColor !== 'lightblue' || eq.splintState !== 'BURNING') {
                activeHoldActionTextRef.current = '💥 Pốp! Khí H₂ xuất hiện làm que tàn đỏ bùng cháy với ngọn lửa màu xanh nhạt!';
              }
              return {
                ...eq,
                splintState: 'BURNING' as const,
                flameColor: 'lightblue',
                flameTimer: 10.0,
              };
            } else if (gasForm === 'O2' && (eq.splintState === 'GLOWING' || eq.splintState === 'BURNING')) {
              if (eq.flameColor !== 'bright' || eq.splintState !== 'BURNING') {
                activeHoldActionTextRef.current = '🔥 Khí O₂ xuất hiện làm que tàn đỏ bùng cháy sáng chói!';
              }
              return {
                ...eq,
                splintState: 'BURNING' as const,
                flameColor: 'bright',
                flameTimer: 10.0,
              };
            } else if (['CO2', 'SO2', 'N2', 'Cl2'].includes(gasForm) && eq.splintState !== 'OFF') {
              activeHoldActionTextRef.current = `💨 Khí ${gasForm} dập tắt ngọn lửa của que đốm!`;
              return {
                ...eq,
                splintState: 'OFF' as const,
              };
            }
          } else {
            // When reaction finishes / gas stops evolving / or splint moved away:
            // Extinguish gas-dependent flames (H2 light blue flame / O2 bright flare) and return to glowing ember ('GLOWING')
            if (eq.splintState === 'BURNING' && (eq.flameColor === 'lightblue' || eq.flameColor === 'bright')) {
              if (eq.flameTimer && eq.flameTimer > 0) {
                return {
                  ...eq,
                  flameTimer: eq.flameTimer - deltaTime,
                };
              } else {
                activeHoldActionTextRef.current = '💨 Khí đã thoát hết (phản ứng kết thúc) hoặc que bị đưa ra xa, ngọn lửa đã tắt!';
                return {
                  ...eq,
                  splintState: 'GLOWING' as const,
                  flameColor: 'red',
                };
              }
            }
          }
        }
        return eq;
      });

      // 2. DRAG - HOLD - DISPENSE INTERACTION ENGINE
      const currentDraggingId = draggingIdRef.current;
      const isPointerDown = isPointerDownRef.current;

      if (currentDraggingId) {
        const draggedEq = updatedList.find((e) => e.id === currentDraggingId);

        if (draggedEq && (draggedEq.type === 'pipette' || draggedEq.type === 'spatula')) {
          // Tip of the vertical tool (bottom center)
          const tipX = draggedEq.x;
          const tipY = draggedEq.y + draggedEq.height;

          // Universal Container Hitbox Detection (Chemical bottle or any lab experiment container)
          const hitContainer = updatedList.find(
            (c) =>
              c.id !== draggedEq.id &&
              c.type !== 'lab_stand' &&
              c.type !== 'pipette' &&
              c.type !== 'spatula' &&
              c.type !== 'glass_rod' &&
              c.type !== 'tripod_wire_gauze' &&
              Math.abs(c.x - tipX) < Math.max(55, c.width / 2 + 35) &&
              tipY >= c.y - 120 &&
              tipY <= c.y + c.height + 60
          );

          // PIPETTE INTERACTIONS (LIQUID EXTRACTION & DISPENSING)
          if (draggedEq.type === 'pipette') {
            const currentVol = draggedEq.suckedContent?.volumeMl || 0;

            if (isPointerDown && hitContainer) {
              const isChemBottle = hitContainer.type === 'chemical_bottle';

              // Lock mode on the first frame of hold gesture over a container
              if (!activeHoldGestureModeRef.current) {
                const maxCap = draggedEq.capacityMl || 10.0;
                if (isChemBottle && currentVol < maxCap) {
                  // Dipping into stock chemical bottle: prefer SUCK mode if pipette is not completely full
                  activeHoldGestureModeRef.current = 'SUCK';
                } else if (draggedEq.toolMode) {
                  activeHoldGestureModeRef.current = draggedEq.toolMode;
                } else if (currentVol > 0) {
                  activeHoldGestureModeRef.current = 'DISPENSE';
                } else {
                  activeHoldGestureModeRef.current = 'SUCK';
                }
              }

              const currentMode = activeHoldGestureModeRef.current;

              // DISPENSE MODE
              if (currentMode === 'DISPENSE') {
                if (currentVol > 0) {
                  const compat = checkToolChemicalCompatibility(draggedEq, hitContainer, 'DISPENSE');
                  if (!compat.compatible) {
                    activeHoldActionTextRef.current = compat.warningMsg;
                  } else {
                    const maxCap = draggedEq.capacityMl || 10.0;
                    // Rate scaled to capacity: empties/fills completely in ~1.5 seconds regardless of size
                    const fillTimeSec = 1.5;
                    const dispenseVol = Math.min(currentVol, (maxCap / fillTimeSec) * deltaTime);
                    const { remainingPipetteContent, updatedTargetContent } = dispenseLiquidFromPipette(
                      draggedEq.suckedContent!,
                      hitContainer,
                      dispenseVol
                    );
                    const newSqueeze = Math.min(1.0, (draggedEq.squeezeBulbRatio || 0) + 3.0 * deltaTime);

                    if (!isChemBottle) {
                      activeTargetVesselIdRef.current = hitContainer.id;
                      activeSourceBottleIdRef.current = null;
                      activeHoldActionTextRef.current = `Đang nhỏ giọt vào ${hitContainer.name}`;
                    } else {
                      activeSourceBottleIdRef.current = hitContainer.id;
                      activeTargetVesselIdRef.current = null;
                      activeHoldActionTextRef.current = `Đang trả dung dịch về chai ${hitContainer.label || ''}`;
                    }

                    const ratio = currentVol > 0 ? dispenseVol / currentVol : 0;
                    const dropSpecies: Record<string, number> = {};
                    for (const [f, m] of Object.entries(draggedEq.suckedContent!.speciesMoles || {})) {
                      dropSpecies[f] = m * ratio;
                    }
                    const dropSolutionData: SolutionContent = {
                      ...draggedEq.suckedContent!,
                      volumeMl: dispenseVol,
                      speciesMoles: dropSpecies,
                      pH: draggedEq.suckedContent!.pH,
                    };

                    const { r, g, b, a } = draggedEq.suckedContent!.colorRgba;
                    fluidDropParticlesRef.current.push({
                      x: tipX,
                      y: tipY + 4,
                      vy: 180 + Math.random() * 40,
                      color: `rgba(${r}, ${g}, ${b}, ${Math.max(0.75, a)})`,
                      size: 3.8,
                      targetEqId: hitContainer.id,
                      transferMl: isChemBottle ? 0 : dispenseVol,
                      dropSolution: isChemBottle ? undefined : dropSolutionData,
                    });

                    updatedList = updatedList.map((item) => {
                      if (item.id === draggedEq.id) {
                        return {
                          ...item,
                          suckedContent: remainingPipetteContent,
                          squeezeBulbRatio: newSqueeze,
                          interactionState: remainingPipetteContent.volumeMl > 0 ? 'DISPENSING' : 'IDLE',
                          toolMode: remainingPipetteContent.volumeMl <= 0 ? 'SUCK' : 'DISPENSE',
                        };
                      }
                      if (item.id === hitContainer.id) {
                        if (isChemBottle) {
                          return {
                            ...item,
                            content: updatedTargetContent,
                          };
                        }
                        if (item.hasFabricStrip) {
                          activeHoldActionTextRef.current = '⚡ Nước Javel (NaClO) đang loang tẩy màu mẩu vải nhuộm hữu cơ (5 giây)...';
                          return {
                            ...item,
                            fabricBleachProgress: Math.max(0.01, item.fabricBleachProgress || 0),
                          };
                        }
                      }
                      return item;
                    });
                  }
                }
              }
              // SUCK MODE
              else if (currentMode === 'SUCK') {
                const primaryReagent = getContainerPrimaryChemical(hitContainer);
                const isSolidChem =
                  (primaryReagent && (primaryReagent.state === 'solid' || primaryReagent.solubility === false)) ||
                  (hitContainer.content && hitContainer.content.volumeMl <= 0 && hitContainer.content.precipitates.length > 0);

                if (isSolidChem) {
                  activeHoldActionTextRef.current = `⚠️ Pipet chỉ dùng cho chất lỏng! Dùng Muỗng/Thìa (Spatula) để lấy chất rắn.`;
                } else {
                  const compat = checkToolChemicalCompatibility(draggedEq, hitContainer, 'SUCK');
                  if (!compat.compatible) {
                    activeHoldActionTextRef.current = compat.warningMsg;
                  } else {
                    const maxCap = draggedEq.capacityMl || 10.0;
                    if (currentVol < maxCap) {
                      // Suction rate scaled to capacity: fills completely in 1.5 seconds regardless of size
                      const fillTimeSec = 1.5;
                      const fillRate = (maxCap / fillTimeSec) * deltaTime;
                      const { extractedSolution, updatedContainerContent, actualExtractedVol } = extractLiquidFromContainer(
                        hitContainer,
                        fillRate
                      );

                      if (actualExtractedVol <= 0 && !isChemBottle) {
                        activeHoldActionTextRef.current = `${hitContainer.name} đang trống (0 mL)!`;
                      } else {
                        activeSourceBottleIdRef.current = hitContainer.id;
                        activeTargetVesselIdRef.current = null;

                        const newSuckedContent = (!draggedEq.suckedContent || draggedEq.suckedContent.volumeMl <= 0)
                          ? extractedSolution
                          : mixSolutions(draggedEq.suckedContent, extractedSolution, actualExtractedVol);

                        const newSqueeze = Math.min(1.0, (draggedEq.squeezeBulbRatio || 0) + 4.0 * deltaTime);
                        const chemDisplayName = getContainerLabelStr(hitContainer) || hitContainer.name;

                        activeHoldActionTextRef.current = `Đang hút ${chemDisplayName} (${newSuckedContent.volumeMl.toFixed(1)} mL)`;

                        if (Math.random() < 0.85 && newSuckedContent) {
                          const { r, g, b, a } = newSuckedContent.colorRgba;
                          inflowParticlesRef.current.push({
                            x: tipX + (Math.random() - 0.5) * 16,
                            y: tipY + 20 + Math.random() * 15,
                            targetX: tipX,
                            targetY: tipY - 15,
                            progress: 0,
                            speed: 2.2 + Math.random() * 1.2,
                            color: `rgba(${r}, ${g}, ${b}, ${Math.max(0.7, a)})`,
                            size: 2.5 + Math.random() * 1.5,
                          });

                          bubbleParticlesRef.current.push({
                            eqId: hitContainer.id,
                            x: tipX + (Math.random() - 0.5) * 10,
                            y: tipY,
                            r: 1.5 + Math.random() * 2.0,
                            vy: -30 - Math.random() * 20,
                            alpha: 0.8,
                          });
                        }

                        updatedList = updatedList.map((item) => {
                          if (item.id === draggedEq.id) {
                            return {
                              ...item,
                              suckedContent: newSuckedContent,
                              squeezeBulbRatio: newSqueeze,
                              interactionState: 'LOADING',
                              toolMode: newSuckedContent.volumeMl >= maxCap ? 'DISPENSE' : 'SUCK',
                            };
                          }
                          if (item.id === hitContainer.id) {
                            return {
                              ...item,
                              content: updatedContainerContent,
                            };
                          }
                          return item;
                        });
                      }
                    } else {
                      activeHoldActionTextRef.current = `Pipet đã đầy (${maxCap} mL)!`;
                    }
                  }
                }
              }
            } else {
              // When not holding down or not hitting container, relax squeeze and return to idle/loaded state
              const relaxedSqueeze = Math.max(0, (draggedEq.squeezeBulbRatio || 0) - 5.0 * deltaTime);
              const isLoaded = (draggedEq.suckedContent?.volumeMl || 0) > 0;
              updatedList = updatedList.map((item) =>
                item.id === draggedEq.id
                  ? {
                      ...item,
                      squeezeBulbRatio: relaxedSqueeze,
                      interactionState: isLoaded ? 'LOADED' : 'IDLE',
                    }
                  : item
              );
            }
          }

          // SPATULA INTERACTIONS (SOLID POWDER EXTRACTION & DISPENSING)
          if (draggedEq.type === 'spatula') {
            const currentGrams = draggedEq.spatulaContent?.amountGram || 0;

            if (isPointerDown && hitContainer) {
              const isChemBottle = hitContainer.type === 'chemical_bottle';

              // Lock mode on the first frame of hold gesture over a container
              if (!activeHoldGestureModeRef.current) {
                const maxGrams = draggedEq.capacityMl || 5.0;
                if (isChemBottle && currentGrams < maxGrams) {
                  // Dipping into stock chemical bottle: prefer SUCK mode if spatula is not full
                  activeHoldGestureModeRef.current = 'SUCK';
                } else if (draggedEq.toolMode) {
                  activeHoldGestureModeRef.current = draggedEq.toolMode;
                } else if (currentGrams > 0) {
                  activeHoldGestureModeRef.current = 'DISPENSE';
                } else {
                  activeHoldGestureModeRef.current = 'SUCK';
                }
              }

              const currentMode = activeHoldGestureModeRef.current;

              // DISPENSE MODE
              if (currentMode === 'DISPENSE') {
                if (currentGrams > 0) {
                  const compat = checkToolChemicalCompatibility(draggedEq, hitContainer, 'DISPENSE');
                  if (!compat.compatible) {
                    activeHoldActionTextRef.current = compat.warningMsg;
                  } else {
                    const maxGrams = draggedEq.capacityMl || 5.0;
                    // Rate scaled to capacity: empties/fills completely in ~1.5 seconds regardless of size
                    const fillTimeSec = 1.5;
                    const dispenseGrams = Math.min(currentGrams, (maxGrams / fillTimeSec) * deltaTime);
                    const { remainingSpatulaContent, updatedTargetContent } = dispenseSolidFromSpatula(
                      draggedEq,
                      hitContainer,
                      dispenseGrams
                    );
                    const newTilt = Math.min(25, (draggedEq.tiltAngle || 0) + 120 * deltaTime);

                    if (!isChemBottle) {
                      activeTargetVesselIdRef.current = hitContainer.id;
                      activeSourceBottleIdRef.current = null;
                      activeHoldActionTextRef.current = `Đang trút bột vào ${hitContainer.name}`;
                    } else {
                      activeSourceBottleIdRef.current = hitContainer.id;
                      activeTargetVesselIdRef.current = null;
                      activeHoldActionTextRef.current = `Đang trả bột về chai ${hitContainer.label || ''}`;
                    }

                    if (draggedEq.spatulaContent) {
                      for (let i = 0; i < 2; i++) {
                        powderStreamParticlesRef.current.push({
                          x: tipX + (Math.random() - 0.5) * 8,
                          y: tipY + 4,
                          vx: (Math.random() - 0.5) * 15,
                          vy: 140 + Math.random() * 60,
                          color: draggedEq.spatulaContent.color,
                          size: 2.0 + Math.random() * 2.0,
                          alpha: 0.9,
                          life: 0,
                          maxLife: 0.8,
                          targetEqId: hitContainer.id,
                          transferGram: 0.05,
                          chemicalId: draggedEq.spatulaContent.chemicalId,
                        });
                      }
                    }

                    const remainingAmount = remainingSpatulaContent?.amountGram || 0;

                    updatedList = updatedList.map((item) => {
                      if (item.id === draggedEq.id) {
                        return {
                          ...item,
                          spatulaContent: remainingSpatulaContent,
                          tiltAngle: newTilt,
                          interactionState: remainingAmount > 0 ? 'DISPENSING' : 'IDLE',
                          toolMode: remainingAmount <= 0 ? 'SUCK' : 'DISPENSE',
                        };
                      }
                      if (item.id === hitContainer.id) {
                        return {
                          ...item,
                          content: updatedTargetContent,
                        };
                      }
                      return item;
                    });
                  }
                }
              }
              // SUCK MODE
              else if (currentMode === 'SUCK') {
                const isLiquidContainer =
                  hitContainer.content &&
                  hitContainer.content.volumeMl > 0 &&
                  (!hitContainer.content.precipitates || hitContainer.content.precipitates.length === 0);

                if (isLiquidContainer) {
                  activeHoldActionTextRef.current = `⚠️ Muỗng/Thìa chỉ dùng múc CHẤT RẮN / BỘT! Dùng Pipet để hút chất lỏng.`;
                } else {
                  const compat = checkToolChemicalCompatibility(draggedEq, hitContainer, 'SUCK');
                  if (!compat.compatible) {
                    activeHoldActionTextRef.current = compat.warningMsg;
                  } else {
                    const maxGrams = draggedEq.capacityMl || 5.0;
                    if (currentGrams < maxGrams) {
                      // Scooping rate scaled to capacity: fills completely in 1.5 seconds regardless of size
                      const fillTimeSec = 1.5;
                      const scoopRate = (maxGrams / fillTimeSec) * deltaTime;
                      const { newSpatulaContent, updatedContainerContent, actualScoopedGrams } = scoopSolidFromContainer(
                        hitContainer,
                        draggedEq,
                        scoopRate
                      );

                      if (actualScoopedGrams <= 0 && !isChemBottle) {
                        activeHoldActionTextRef.current = `${hitContainer.name} không có bột để múc!`;
                      } else {
                        activeSourceBottleIdRef.current = hitContainer.id;
                        activeTargetVesselIdRef.current = null;
                        const newTilt = Math.max(-20, (draggedEq.tiltAngle || 0) - 80 * deltaTime);

                        activeHoldActionTextRef.current = `Đang múc bột ${newSpatulaContent.name} (${newSpatulaContent.amountGram.toFixed(1)}g)`;

                        if (Math.random() < 0.85) {
                          inflowParticlesRef.current.push({
                            x: tipX + (Math.random() - 0.5) * 20,
                            y: tipY + 18 + Math.random() * 15,
                            targetX: tipX,
                            targetY: tipY - 15,
                            progress: 0,
                            speed: 2.0 + Math.random() * 1.5,
                            color: newSpatulaContent.color || '#f8fafc',
                            size: 2.2 + Math.random() * 1.8,
                            isPowder: true,
                          });
                        }

                        updatedList = updatedList.map((item) => {
                          if (item.id === draggedEq.id) {
                            return {
                              ...item,
                              spatulaContent: newSpatulaContent,
                              tiltAngle: newTilt,
                              interactionState: 'LOADING',
                              toolMode: newSpatulaContent.amountGram >= maxGrams ? 'DISPENSE' : 'SUCK',
                            };
                          }
                          if (item.id === hitContainer.id) {
                            return {
                              ...item,
                              content: updatedContainerContent,
                            };
                          }
                          return item;
                        });
                      }
                    } else {
                      activeHoldActionTextRef.current = `Thìa đã đầy bột (${maxGrams}g)!`;
                    }
                  }
                }
              }
            } else {
              // Relaxation state when not holding or not over a container
              const currentTilt = draggedEq.tiltAngle || 0;
              const relaxedTilt = currentTilt > 0 ? Math.max(0, currentTilt - 100 * deltaTime) : Math.min(0, currentTilt + 100 * deltaTime);
              const isLoaded = (draggedEq.spatulaContent?.amountGram || 0) > 0;
              updatedList = updatedList.map((item) =>
                item.id === draggedEq.id
                  ? {
                      ...item,
                      tiltAngle: relaxedTilt,
                      interactionState: isLoaded ? 'LOADED' : 'IDLE',
                    }
                  : item
              );
            }
          }
        }
      } else {
        activeSourceBottleIdRef.current = null;
        activeTargetVesselIdRef.current = null;
        activeHoldActionTextRef.current = null;
      }

      // 3. Handle Burette dripping titration logic
      updatedList = updatedList.map((eq) => {
        if (eq.type === 'burette' && eq.valveOpen && eq.content.volumeMl > 0) {
          const dripSpeed = eq.dripRate || 0.5; // mL per second
          const singleDropVol = 0.05; // Standard 0.05 mL drop
          const timePerDrop = singleDropVol / Math.max(0.05, dripSpeed);

          let timer = (buretteDripTimerRef.current[eq.id] || 0) + deltaTime;
          let currentBuretteVol = eq.content.volumeMl;
          let currentSpecies = { ...eq.content.speciesMoles };

          const targetContainer = updatedList.find(
            (c) =>
              c.id !== eq.id &&
              c.type !== 'lab_stand' &&
              c.type !== 'glass_rod' &&
              c.type !== 'spatula' &&
              Math.abs(c.x - eq.x) < c.width / 2 + 30 &&
              c.y >= eq.y + eq.height - 40 &&
              c.y < eq.y + eq.height + 260
          );

          if (targetContainer && targetContainer.type === 'chemical_bottle') {
            const targetReagent = getContainerPrimaryChemical(targetContainer);
            const targetName = targetReagent ? targetReagent.name : (targetContainer.label || targetContainer.name);
            activeHoldActionTextRef.current = `⚠️ Sai thao tác! Lọ hóa chất gốc ${targetName} là bình lưu trữ gốc, không được phép nhỏ dung dịch từ buret vào.`;
            return eq;
          }

          let dropsCreated = 0;
          while (timer >= timePerDrop && currentBuretteVol > 0 && dropsCreated < 6) {
            timer -= timePerDrop;
            dropsCreated++;
            const actualDropVol = Math.min(singleDropVol, currentBuretteVol);

            // Extract species for drop payload
            const ratio = currentBuretteVol > 0 ? actualDropVol / currentBuretteVol : 0;
            const dropSpecies: Record<string, number> = {};
            for (const [f, m] of Object.entries(currentSpecies)) {
              const mDrop = m * ratio;
              dropSpecies[f] = mDrop;
              currentSpecies[f] = Math.max(0, m - mDrop);
            }

            const dropSolutionData: SolutionContent = {
              ...eq.content,
              volumeMl: actualDropVol,
              speciesMoles: dropSpecies,
              pH: eq.content.pH,
            };

            currentBuretteVol = Math.max(0, currentBuretteVol - actualDropVol);

            const { r, g, b, a } = eq.content.colorRgba;
            fluidDropParticlesRef.current.push({
              x: eq.x,
              y: eq.y + eq.height - 2,
              vy: 210 + Math.random() * 20,
              color: `rgba(${r}, ${g}, ${b}, ${Math.max(0.8, a)})`,
              size: 4.0,
              targetEqId: targetContainer ? targetContainer.id : '',
              transferMl: actualDropVol,
              dropSolution: dropSolutionData,
            });
          }

          buretteDripTimerRef.current[eq.id] = timer;

          return {
            ...eq,
            content: {
              ...eq.content,
              volumeMl: currentBuretteVol,
              speciesMoles: currentSpecies,
              pH: currentBuretteVol > 0 ? calculateSolutionPh(currentSpecies, currentBuretteVol) : 7.0,
            },
          };
        }
        return eq;
      });

      // Commit updated list to Ref and React State
      equipmentsRef.current = updatedList;

      // Throttled sync to React state every ~100ms so top bar, sidebars, & AI update live
      if (now - lastStateSyncTimeRef.current > 100) {
        lastStateSyncTimeRef.current = now;
        setEquipments([...updatedList]);
        if (selectedEquipmentIdRef.current) {
          const selectedItem = updatedList.find((e) => e.id === selectedEquipmentIdRef.current);
          if (selectedItem) {
            onSelectEquipmentForDetails(selectedItem);
          }
        }
      }

      // Draw Canvas Scene & Physics Particles
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawScene(ctx, canvas.width, canvas.height, deltaTime, updatedList);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Gas Delivery Tubing Renderer between connected glass vessels (Bình cầu, bình rửa, bình thu)
  const drawGasTubingConnections = (ctx: CanvasRenderingContext2D, currentEquipments: EquipmentInstance[]) => {
    // Experiment 8 (Sugar Carbonization) and Experiment 11 (Precipitates): No glass tubing connected!
    if (
      currentEquipments.some(
        (e) =>
          e.content.precipitates?.some((p) => p.formula === 'C12H22O11' || p.formula === 'C') ||
          e.name.includes('Saccarozơ') ||
          e.name.includes('Đường') ||
          e.name.includes('Cốc BaCl2') ||
          e.name.includes('Cốc CuSO4')
      )
    )
      return;
    // Find gas generating vessel (round flask, test tube, or erlenmeyer with dropping funnel/CaCO3)
    const genFlask = currentEquipments.find(
      (e) => e.hasDroppingFunnel || e.name.includes('CaCO3') || e.name.includes('MnO2') || (e.name.includes('Phễu') && e.type !== 'pipette') || e.name.includes('Na2SO3') || e.name.includes('NH4Cl')
    ) || currentEquipments.find(
      (e) => (e.type.startsWith('round_flask') || e.type === 'test_tube') && !e.isCo2Collector && !e.name.includes('KMnO4') && !e.name.includes('Úp ngược') && !e.name.includes('thu sản phẩm')
    );

    // If no gas generator is present, do not draw inter-vessel gas delivery tubing
    if (!genFlask) return;

    // Find wash bottles / receiving vessels in sequence: Wash 1 (NaHCO3/NaCl) -> Wash 2 (H2SO4) -> Collector (Glass Erlenmeyer/Receiver)
    const wash1 = currentEquipments.find((e) => (e.name.includes('Bình 1') || e.name.includes('Bình rửa 1') || e.name.includes('NaHCO3') || e.name.includes('NaCl')) && e.type !== 'chemical_bottle');
    const wash2 = currentEquipments.find((e) => (e.name.includes('Bình 2') || e.name.includes('Bình rửa 2')) && e.type !== 'chemical_bottle');
    const recvFlask = currentEquipments.find(
      (e) => e.isCo2Collector || (e.name.includes('Bình thu') && !e.hasDroppingFunnel) || e.hasDryPaper !== undefined || e.hasWetPaper !== undefined || e.name.includes('KMnO4') || e.name.includes('Úp ngược') || e.name.includes('Bình cầu thu sản phẩm')
    ) || currentEquipments.find(
      (e) => (e.type === 'erlenmeyer' || e.type === 'beaker') && e.id !== genFlask?.id && e.id !== wash1?.id && e.id !== wash2?.id
    );

    ctx.save();

    // Helper to draw a glass & rubber delivery tube section with optional Cl2 gas flow animation
    const drawTubeSection = (
      x1: number, y1: number,
      x2: number, y2: number,
      x3: number, y3: number,
      x4: number, y4: number,
      hasActiveGas: boolean,
      gasLabel?: string,
      particleColor: string = '#a3e635',
      particleStroke: string = '#65a30d'
    ) => {
      // Outer glass/rubber tube shadow
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();

      // Outer tube glass body
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Inner hollow core (gas pathway)
      const isCl2Gas = particleColor.includes('C0CA33') || particleStroke.includes('827717');
      ctx.strokeStyle = hasActiveGas
        ? (particleColor.includes('242') || particleColor.includes('e2e8f0') 
            ? 'rgba(186, 230, 253, 0.8)' 
            : isCl2Gas 
              ? 'rgba(192, 202, 51, 0.85)' 
              : 'rgba(163, 230, 53, 0.7)')
        : 'rgba(226, 232, 240, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Animated gas flow particles & arrow if active gas evolving
      if (hasActiveGas) {
        // Calculate length of each segment along the tube
        const l1 = Math.hypot(x2 - x1, y2 - y1);
        const l2 = Math.hypot(x3 - x2, y3 - y2);
        const l3 = Math.hypot(x4 - x3, y4 - y3);
        const totalL = l1 + l2 + l3;

        const now = Date.now() * 0.006;
        const numBubbles = 9;

        ctx.save();
        ctx.globalAlpha = isCl2Gas ? 0.85 : 0.55;
        for (let i = 0; i < numBubbles; i++) {
          const progress = ((now + i / numBubbles) % 1.0) * totalL;
          let px = x1;
          let py = y1;
          if (progress <= l1) {
            const t = progress / Math.max(1, l1);
            px = x1 + (x2 - x1) * t;
            py = y1 + (y2 - y1) * t;
          } else if (progress <= l1 + l2) {
            const t = (progress - l1) / Math.max(1, l2);
            px = x2 + (x3 - x2) * t;
            py = y2 + (y3 - y2) * t;
          } else {
            const t = (progress - l1 - l2) / Math.max(1, l3);
            px = x3 + (x4 - x3) * t;
            py = y3 + (y4 - y3) * t;
          }

          ctx.beginPath();
          ctx.arc(px, py, isCl2Gas ? 3.5 : 3.0, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.fill();
          ctx.strokeStyle = particleStroke;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
        ctx.restore();

        // Flow Direction Arrow & Label on top horizontal segment
        const midX = (x2 + x3) / 2;
        const midY = (y2 + y3) / 2;

        ctx.fillStyle = particleColor;
        ctx.strokeStyle = particleStroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midX + 7, midY);
        ctx.lineTo(midX - 3, midY - 4);
        ctx.lineTo(midX - 3, midY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (gasLabel) {
          ctx.fillStyle = particleColor.includes('e2e8f0') ? '#f1f5f9' : '#fef08a';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(gasLabel, midX, midY - 8);
        }
      }
    };

    let activeGasFormula = '';
    let isGasActive = false;

    const activeGasEq = currentEquipments.find(e => e.content?.activeGas && e.content.activeGas.rate > 0.001);
    if (activeGasEq) {
      activeGasFormula = activeGasEq.content!.activeGas!.formula;
      isGasActive = true;
    } else if (currentEquipments.some(e => e.hasDroppingFunnel && e.valveOpen && (e.name.includes('CaCO3') || (e.name.includes('Phễu') && e.type !== 'pipette') || e.name.includes('Na2SO3')))) {
      isGasActive = exp4TimerRef.current < 10.0 || exp5TimerRef.current < 15.0;
      if (isGasActive) {
         if (currentEquipments.some(e => e.name.includes('Na2SO3'))) activeGasFormula = 'SO2';
         else activeGasFormula = 'CO2';
      }
    }

    let particleColor = '#a3e635';
    let particleStroke = '#65a30d';

    if (activeGasFormula === 'CO2') {
       particleColor = '#e2e8f0'; 
       particleStroke = '#94a3b8';
    } else if (activeGasFormula === 'SO2') {
       particleColor = '#fef08a'; // pale yellow
       particleStroke = '#ca8a04';
    } else if (activeGasFormula === 'Cl2' || currentEquipments.some((e) => e.name.includes('MnO2'))) {
       particleColor = '#C0CA33'; // yellowish green #C0CA33
       particleStroke = '#827717';
    }

    const gasLabel1 = isGasActive ? `${activeGasFormula} →` : '';
    const gasLabel2 = gasLabel1;
    const gasLabel3 = isGasActive && activeGasFormula !== 'SO2' && wash2 ? `${activeGasFormula} khô →` : gasLabel1;

    // 1. Tube 1: Generator side arm / Stopper -> Wash Bottle 1 (deep dip tube into NaHCO3 / NaCl)
    if (genFlask && wash1) {
      const startX = genFlask.x + (genFlask.type === 'round_flask_1arm' ? 70 : 15);
      const startY = genFlask.y + (genFlask.type === 'round_flask_1arm' ? 40 : (genFlask.type === 'erlenmeyer' ? 10 : 36));
      const corner1X = startX + 25;
      const corner1Y = startY;
      const corner2X = wash1.x - 12;
      const corner2Y = wash1.y - 25;
      const endX = wash1.x - 12;
      const endY = wash1.y + wash1.height - 12; // Deep tube into liquid

      drawTubeSection(startX, startY, corner1X, corner1Y, corner2X, corner2Y, endX, endY, isGasActive, gasLabel1, particleColor, particleStroke);

      if (genFlask.type === 'round_flask_1arm') {
        ctx.save();
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(startX - 4, startY - 5, 8, 10);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX - 4, startY - 5, 8, 10);
        ctx.restore();
      }
    } else if (genFlask && recvFlask && !wash1 && !wash2) {
      // Direct connection: Generator -> Receiver
      let startX = genFlask.x + (genFlask.type === 'round_flask_1arm' ? 70 : (genFlask.type === 'test_tube' ? 12 : 15));
      let startY = genFlask.y + (genFlask.type === 'round_flask_1arm' ? 40 : (genFlask.type === 'erlenmeyer' ? 10 : (genFlask.type === 'test_tube' ? 5 : 36)));
      
      let corner1X = 0, corner1Y = 0, corner2X = 0, corner2Y = 0, endX = 0, endY = 0;
      
            const isNH3Exp = genFlask.name.includes('NH4Cl') && recvFlask.name.includes('Úp ngược');
      const isHNO3Exp = genFlask.name.includes('Bình cầu 1 nhánh') && recvFlask.name.includes('Bình cầu thu sản phẩm');

      if (isHNO3Exp) {
        // Find lab stand to draw metal clamps
        const stand = currentEquipments.find(e => e.type === 'lab_stand');
        if (stand) {
          ctx.save();
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          
          const genClampX = genFlask.x;
          const genClampY = genFlask.y;
          ctx.fillRect(Math.min(stand.x, genClampX), genClampY - 4, Math.abs(stand.x - genClampX), 8);
          ctx.strokeRect(Math.min(stand.x, genClampX), genClampY - 4, Math.abs(stand.x - genClampX), 8);
          
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(stand.x, genClampY, 7, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillRect(genFlask.x - 24, genClampY - 6, 8, 12);
          ctx.fillRect(genFlask.x + 16, genClampY - 6, 8, 12);
          ctx.restore();
        }

        // Draw retort delivery tube (slanted straight into receiver)
        startX = genFlask.x;
        startY = genFlask.y - genFlask.height / 2 + 15;
        
        // Let's make it look like a retort side arm, starting from the side of the stopper
        startX = genFlask.x + 70;
        startY = genFlask.y + 40;

        // Slant straight to the receiver
        corner1X = genFlask.x + 80;
        corner1Y = genFlask.y + 40;
        
        endX = recvFlask.x;
        endY = recvFlask.y;


                // Rubber joint at side arm
        ctx.save();
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(startX - 4, startY - 5, 8, 10);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX - 4, startY - 5, 8, 10);
        ctx.restore();
        
        // Straight slanted pipe (thicker and purely glass for retort neck)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.lineWidth = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
        ctx.lineWidth = 12;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(startX, startY - 4);
        ctx.lineTo(endX, endY - 4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Gas animation inside the neck
        if (isGasActive) {
            const time = Date.now() * 0.002;
            const flowProgress = (time % 1.0);
            
            const pX = startX + (endX - startX) * flowProgress;
            const pY = startY + (endY - startY) * flowProgress;
            
            ctx.fillStyle = 'rgba(255, 230, 150, 0.8)';
            ctx.beginPath();
            ctx.arc(pX, pY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            const pX2 = startX + (endX - startX) * ((flowProgress + 0.3) % 1.0);
            const pY2 = startY + (endY - startY) * ((flowProgress + 0.3) % 1.0);
            
            ctx.fillStyle = 'rgba(255, 240, 180, 0.6)';
            ctx.beginPath();
            ctx.arc(pX2, pY2, 5, 0, Math.PI * 2);
            ctx.fill();
            
            const pX3 = startX + (endX - startX) * ((flowProgress + 0.6) % 1.0);
            const pY3 = startY + (endY - startY) * ((flowProgress + 0.6) % 1.0);
            
            ctx.fillStyle = 'rgba(255, 230, 150, 0.7)';
            ctx.beginPath();
            ctx.arc(pX3, pY3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

      } else if (isNH3Exp) {
        // Find lab stand to draw metal clamps
        const stand = currentEquipments.find(e => e.type === 'lab_stand');
        if (stand) {
          ctx.save();
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          
          // Clamp for generator (lower)
          const genClampX = genFlask.x;
          const genClampY = genFlask.y - 50;
          ctx.fillRect(Math.min(stand.x, genClampX), genClampY - 4, Math.abs(stand.x - genClampX), 8);
          ctx.strokeRect(Math.min(stand.x, genClampX), genClampY - 4, Math.abs(stand.x - genClampX), 8);
          
          // Clamp for receiver (upper)
          const recvClampY = recvFlask.y - 120; // higher up on the inverted tube
          ctx.fillRect(Math.min(stand.x, recvFlask.x), recvClampY - 4, Math.abs(recvFlask.x - stand.x), 8);
          ctx.strokeRect(Math.min(stand.x, recvFlask.x), recvClampY - 4, Math.abs(recvFlask.x - stand.x), 8);
          
          // Joints
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(stand.x, genClampY, 7, 0, Math.PI * 2);
          ctx.arc(stand.x, recvClampY, 7, 0, Math.PI * 2);
          ctx.fill();
          
          // Jaws for Generator
          ctx.fillRect(genFlask.x - 24, genClampY - 6, 8, 12);
          ctx.fillRect(genFlask.x + 16, genClampY - 6, 8, 12);
          
          // Jaws for Receiver
          ctx.fillRect(recvFlask.x - 24, recvClampY - 6, 8, 12);
          ctx.fillRect(recvFlask.x + 16, recvClampY - 6, 8, 12);

          ctx.restore();
        }

        // Test tubes are vertical and their mouths are aligned horizontally.
        // Tube goes straight up, slants down to clear the receiver mouth, then up into receiver.
        startX = genFlask.x;
        startY = genFlask.y - 15;
        
        corner1X = genFlask.x;
        corner1Y = genFlask.y - 40;

        // Slant down to below the receiver mouth to avoid wall crossing
        corner2X = recvFlask.x;
        corner2Y = recvFlask.y + 40;

        // Go straight up into the inverted receiver
        endX = recvFlask.x;
        endY = recvFlask.y - 15; // Reaching just the mouth of the inverted receiver

        // Use the standard glass tube drawing function
        drawTubeSection(
          startX, startY,
          corner1X, corner1Y,
          corner2X, corner2Y,
          endX, endY,
          isGasActive, gasLabel1,
          'rgba(96, 165, 250, 0.8)', // Blue gas for NH3
          'rgba(59, 130, 246, 1.0)'
        );
      } else {
        corner1X = startX + 25;
        corner1Y = startY;
        corner2X = recvFlask.x;
        corner2Y = startY;
        endX = recvFlask.x;
        endY = recvFlask.y + recvFlask.height - 18; // Dip tube deep inside receiving beaker/flask
        drawTubeSection(startX, startY, corner1X, corner1Y, corner2X, corner2Y, endX, endY, isGasActive, gasLabel1, particleColor, particleStroke);
        
        // Draw Red Rubber Hose Connector in the middle of horizontal segment
        ctx.save();
        const midTubeX = (corner1X + corner2X) / 2;
        ctx.fillStyle = '#b91c1c'; // Red rubber
        ctx.fillRect(midTubeX - 12, corner1Y - 6, 24, 12);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1;
        ctx.strokeRect(midTubeX - 12, corner1Y - 6, 24, 12);
        // hose ridges
        ctx.beginPath(); ctx.moveTo(midTubeX - 6, corner1Y - 6); ctx.lineTo(midTubeX - 6, corner1Y + 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(midTubeX, corner1Y - 6); ctx.lineTo(midTubeX, corner1Y + 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(midTubeX + 6, corner1Y - 6); ctx.lineTo(midTubeX + 6, corner1Y + 6); ctx.stroke();

        if (genFlask.type === 'round_flask_1arm') {
          // Sleeve joint right on the round flask sidearm tip
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(startX - 4, startY - 5, 8, 10);
          ctx.strokeStyle = '#7f1d1d';
          ctx.strokeRect(startX - 4, startY - 5, 8, 10);
        }
        ctx.restore();
      }
    }

    // 2. Tube 2: Wash Bottle 1 (short outlet) -> Wash Bottle 2 (H2SO4 deep dip tube)
    if (wash1 && wash2) {
      const startX = wash1.x + 12;
      const startY = wash1.y + 15;
      const corner1X = startX;
      const corner1Y = wash1.y - 20;
      const corner2X = wash2.x - 12;
      const corner2Y = wash2.y - 20;
      const endX = wash2.x - 12;
      const endY = wash2.y + wash2.height - 12; // Deep tube into H2SO4

      drawTubeSection(startX, startY, corner1X, corner1Y, corner2X, corner2Y, endX, endY, isGasActive, gasLabel2, particleColor, particleStroke);
    }

    // 3. Tube 3: Wash Bottle 2 (H2SO4 short outlet) -> Receiving Flask (CO2 / Cl2 dry gas container)
    if (wash2 && recvFlask) {
      const startX = wash2.x + 12;
      const startY = wash2.y + 15;
      const corner1X = startX;
      const corner1Y = wash2.y - 20;
      const corner2X = recvFlask.x;
      const corner2Y = recvFlask.y - 20;
      const endX = recvFlask.x;
      const endY = recvFlask.y + recvFlask.height - 30; // Deep into receiver

      drawTubeSection(startX, startY, corner1X, corner1Y, corner2X, corner2Y, endX, endY, isGasActive, gasLabel3, particleColor, particleStroke);
    }

    ctx.restore();
  };

  // Main Canvas Rendering Pipeline
  const drawScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    currentEquipments: EquipmentInstance[]
  ) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Background Laboratory Bench
    drawLaboratoryBackground(ctx, width, height);

    // 2. Render Lab Stand & Clamps FIRST (behind glassware)
    currentEquipments
      .filter((eq) => eq.type === 'lab_stand')
      .forEach((stand) => drawLabStand(ctx, stand));

    // 3. Render Inter-Equipment Glass & Rubber Gas Delivery Tubes (Ống dẫn khí thủy tinh & cao su nối giữa các bình)
    drawGasTubingConnections(ctx, currentEquipments);

    // 4. Render Equipment Glassware, Liquids, Tools, & Glowing Target Outlines
    currentEquipments
      .filter((eq) => eq.type !== 'lab_stand')
      .forEach((eq) => {
        ctx.save();

        // Handle Erlenmeyer flask 3-finger wrist rotation oscillation
        let currentAngle = eq.angle;
        let translateX = eq.x;
        let translateY = eq.y;

        if (eq.isSwirling) {
          currentAngle += Math.sin(Date.now() * 0.012) * 6;
        }

        // Screen Shake / Container Vibration for Violent Solid-Water Reactions (Na, K, Li, Ca, Ba in H2O)
        const hasViolentWaterReaction =
          eq.content &&
          eq.content.volumeMl > 0 &&
          eq.content.precipitates?.some(
            (p) => (p.formula === 'Na' || p.formula === 'K' || p.formula === 'Li' || p.formula === 'Ca' || p.formula === 'Ba') && p.massGram > 0.001
          );

        if (hasViolentWaterReaction) {
          translateX += (Math.random() - 0.5) * 3.5;
          translateY += (Math.random() - 0.5) * 3.5;
          currentAngle += (Math.random() - 0.5) * 2.5;
        }

        ctx.translate(translateX, translateY);
        ctx.rotate((currentAngle * Math.PI) / 180);

        // Target Source Bottle Glow Outline Effect
        if (eq.id === activeSourceBottleIdRef.current) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 22;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.strokeRect(-eq.width / 2 - 4, -4, eq.width + 8, eq.height + 8);
        }

        // Target Vessel Mouth Glowing Highlight Effect
        if (eq.id === activeTargetVesselIdRef.current) {
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 22;
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, eq.width / 2 + 6, 10, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Highlight if selected or actively being dragged
        const isSelected = eq.id === selectedEquipmentIdRef.current || eq.id === draggingIdRef.current;
        const isHovered = hoveredEquipment?.id === eq.id;
        if (isSelected) {
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 12;
        }

        drawEquipmentByType(ctx, eq, dt, currentEquipments);
        drawInteractiveFrame(ctx, eq, isSelected, isHovered);

        ctx.restore();
      });

    // 4. Render Particle Physics Systems (Fluid Drops, Powder Streams, Bubbles, Ripples)
    drawParticlesAndPhysics(ctx, dt, currentEquipments);

    // 5. Render HUD Cursor Hold Progress Ring & Status Badge
    drawCursorHUD(ctx);
  };

  // Dispatch individual equipment rendering
  const drawEquipmentByType = (
    ctx: CanvasRenderingContext2D,
    eq: EquipmentInstance,
    dt: number,
    allList: EquipmentInstance[]
  ) => {
    switch (eq.type) {
      case 'test_tube':
      case 'beaker':
      case 'erlenmeyer':
      case 'round_flask':
      case 'round_flask_1arm':
      case 'round_flask_2neck':
      case 'graduated_cylinder':
        drawGlasswareContainer(ctx, eq, dt);
        break;
      case 'pipette':
        drawPipetteGraphics(ctx, eq);
        break;
      case 'spatula':
        drawSpatulaGraphics(ctx, eq);
        break;
      case 'burette':
        drawBuretteGraphics(ctx, eq);
        break;
      case 'glass_rod':
        drawGlassRodGraphics(ctx, eq);
        break;
      case 'alcohol_burner':
        drawAlcoholBurnerGraphics(ctx, eq);
        break;
      case 'chemical_bottle':
        drawChemicalBottleGraphics(ctx, eq);
        break;
      case 'tripod_wire_gauze':
        drawTripodWireGauzeGraphics(ctx, eq);
        break;
      case 'wooden_splint':
        drawWoodenSplintGraphics(ctx, eq);
        break;
    }
  };

  // High-Contrast Interactive Selection & Hover Frame Renderer (Khung viền chọn & chốt 4 góc)
  const drawInteractiveFrame = (
    ctx: CanvasRenderingContext2D,
    eq: EquipmentInstance,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    if (!isSelected && !isHovered) return;

    ctx.save();
    const halfW = eq.width / 2;
    const isSpecialTop =
      eq.type === 'pipette' ||
      eq.type === 'spatula' ||
      eq.type === 'chemical_bottle' ||
      eq.type === 'alcohol_burner';
    const topY = isSpecialTop ? -16 : -8;
    const boxW = eq.width + 12;
    const boxH = eq.height + (isSpecialTop ? 22 : 14);
    const boxX = -halfW - 6;

    if (isSelected) {
      // 1. Glowing Neon Cyan Dashed Selection Border
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.roundRect(boxX, topY, boxW, boxH, 6);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Corner Anchor Handles (4 chốt ở 4 góc)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f0f9ff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      const corners = [
        { x: boxX, y: topY },
        { x: boxX + boxW, y: topY },
        { x: boxX, y: topY + boxH },
        { x: boxX + boxW, y: topY + boxH },
      ];
      corners.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // 3. Floating Title Badge above Equipment (unrotated so text is always readable regardless of equipment rotation)
      const badgeText = `${eq.name}`;
      ctx.font = 'bold 10px sans-serif';
      const textW = ctx.measureText(badgeText).width + 12;

      ctx.save();
      if (eq.angle) {
        ctx.translate(0, topY - 10);
        ctx.rotate((-eq.angle * Math.PI) / 180);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-textW / 2, -8, textW, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, 0, 0);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-textW / 2, topY - 18, textW, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, 0, topY - 10);
      }
      ctx.restore();
    } else if (isHovered) {
      // Light Blue Dashed Outline on Hover
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.roundRect(boxX + 2, topY + 2, boxW - 4, boxH - 4, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Dedicated Solid Powder / Precipitate Layer Renderer
  const drawContainerSolids = (
    ctx: CanvasRenderingContext2D,
    eq: EquipmentInstance,
    halfW: number,
    h: number
  ) => {
    if (!eq.content.precipitates || eq.content.precipitates.length === 0) return;
    if (eq.content.precipitates.some((p) => p.formula === 'C12H22O11' || p.formula === 'C') || eq.name.includes('Saccarozơ') || eq.name.includes('Đường')) {
      return; // Handled by specialized drawSugarCarbonizationAnimation
    }

    ctx.save();
    ctx.beginPath();
    if (eq.type === 'erlenmeyer') {
      ctx.moveTo(-15, 0);
      ctx.lineTo(-halfW, h - 10);
      ctx.quadraticCurveTo(-halfW, h, -halfW + 10, h);
      ctx.lineTo(halfW - 10, h);
      ctx.quadraticCurveTo(halfW, h, halfW, h - 10);
      ctx.lineTo(15, 0);
    } else if (eq.type.startsWith('round_flask')) {
      const nW = eq.type === 'round_flask_2neck' ? 14 : 18;
      const cy = h - halfW;
      const angL = 2 * Math.PI - Math.acos(-nW / halfW);
      const angR = 2 * Math.PI - Math.acos(nW / halfW);
      const nY = cy + Math.sin(angL) * halfW;
      ctx.moveTo(-nW, 0);
      ctx.lineTo(-nW, nY);
      ctx.arc(0, cy, halfW, angL, angR, true);
      ctx.lineTo(nW, 0);
    } else if (eq.type === 'test_tube') {
      ctx.moveTo(-halfW, 0);
      ctx.lineTo(-halfW, h - halfW);
      ctx.arc(0, h - halfW, halfW, Math.PI, 0, true);
      ctx.lineTo(halfW, 0);
    } else if (eq.type === 'chemical_bottle') {
      ctx.roundRect(-halfW + 3, 22, eq.width - 6, h - 24, [0, 0, 6, 6]);
    } else {
      ctx.rect(-halfW + 2, 0, eq.width - 4, h);
    }
    ctx.clip();

    let currentTopY = h;
    eq.content.precipitates.forEach((p) => {
      if (p.massGram <= 0) return;
      const solidColor = p.color || getSolidColor(p.formula) || 'rgba(240, 240, 245, 0.95)';

      const layerHeight = Math.min(h * 0.48, Math.max(2, p.massGram * 4.0));
      const layerY = currentTopY - layerHeight;

      // Solid Powder Layer Base Fill
      ctx.fillStyle = solidColor;
      ctx.beginPath();
      ctx.fillRect(-halfW - 10, layerY, eq.width + 20, layerHeight + 10);

      // Curved Mounded Top Surface for Powder
      ctx.fillStyle = solidColor;
      ctx.beginPath();
      ctx.ellipse(0, layerY, halfW - 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top Surface Contour Line / Phase Interface Boundary (Đường phân cách tách lớp Rắn - Lỏng rõ ràng)
      const hasLiquidOverlay = eq.content && eq.content.volumeMl > 0;
      ctx.strokeStyle = hasLiquidOverlay ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = hasLiquidOverlay ? 2 : 1;
      ctx.beginPath();
      ctx.ellipse(0, layerY, halfW - 2, 5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Distinct Phase Separation Line Accent if liquid coexists
      if (hasLiquidOverlay) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-halfW + 4, layerY);
        ctx.lineTo(halfW - 4, layerY);
        ctx.stroke();
      }

      // Powder Granule Texture Dots
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let i = 0; i < 8; i++) {
        const rx = Math.sin(i * 2.3) * (halfW - 8);
        const ry = layerY + 2 + Math.cos(i * 1.7) * (layerHeight * 0.5);
        ctx.fillRect(rx, ry, 2, 2);
      }

      currentTopY = layerY;
    });

    ctx.restore();
  };

  // Specialized Renderer for Active Solid-Water Reactions (Na, K, Li, Ca, Ba, CaO)
  const drawWaterSolidReactions = (
    ctx: CanvasRenderingContext2D,
    eq: EquipmentInstance,
    halfW: number,
    h: number,
    liquidY: number,
    liquidH: number
  ) => {
    if (eq.content.volumeMl <= 0) return;

    const species = eq.content.speciesMoles || {};
    const precipitates = eq.content.precipitates || [];

    // 1. Detect Alkali Metals (Na, K, Li) in liquid solution (unreacted solid metal chunk)
    const naMass = precipitates.find((p) => p.formula === 'Na')?.massGram || 0;
    const kMass = precipitates.find((p) => p.formula === 'K')?.massGram || 0;
    const liMass = precipitates.find((p) => p.formula === 'Li')?.massGram || 0;

    const activeAlkali = naMass > 0.001 ? 'Na' : kMass > 0.001 ? 'K' : liMass > 0.001 ? 'Li' : null;

    if (activeAlkali) {
      ctx.save();

      const rxnTime = Date.now() * 0.001;
      const maxX = halfW - 14;
      // High frequency rapid skittering on surface
      const beadX = Math.sin(rxnTime * 14.0) * (maxX * 0.65) + Math.cos(rxnTime * 8.5) * (maxX * 0.25);
      const beadY = liquidY + 1; // Floats right on water surface

      // A. Alkaline Indicator Magenta Trail underneath moving bead
      if (eq.content.pH > 8.0) {
        const trailWidth = 22;
        const trailGrad = ctx.createRadialGradient(beadX, beadY + 4, 2, beadX, beadY + 12, trailWidth);
        trailGrad.addColorStop(0, 'rgba(236, 72, 153, 0.85)'); // Vibrant Pink / Magenta
        trailGrad.addColorStop(0.5, 'rgba(219, 39, 119, 0.4)');
        trailGrad.addColorStop(1, 'rgba(219, 39, 119, 0)');

        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.ellipse(beadX, beadY + 8, trailWidth, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // B. Surface Ripple Rings under floating bead
      const rippleR = 7 + Math.sin(rxnTime * 22) * 3;
      ctx.strokeStyle = activeAlkali === 'K' ? 'rgba(192, 132, 252, 0.85)' : 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(beadX, beadY, rippleR, rippleR * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // C. Floating Metallic Sphere Bead (Na / K / Li)
      const beadRadius = 5 + Math.min(4, (activeAlkali === 'Na' ? naMass : kMass) * 2);
      const beadGrad = ctx.createRadialGradient(beadX - 2, beadY - 2, 1, beadX, beadY, beadRadius);
      beadGrad.addColorStop(0, '#ffffff');
      beadGrad.addColorStop(0.3, '#f1f5f9');
      beadGrad.addColorStop(0.7, '#64748b');
      beadGrad.addColorStop(1, '#334155');

      ctx.fillStyle = beadGrad;
      ctx.beginPath();
      ctx.arc(beadX, beadY, beadRadius, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent Red-Hot Edge Glow
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(beadX, beadY, beadRadius + 1, 0, Math.PI * 2);
      ctx.stroke();

      // D. Flame & Fire Effect ("Hiện tượng cháy nổ")
      // Na = Golden Yellow / Orange Flame
      // K = Violet / Lilac Purple Flame
      // Li = Crimson Red Flame
      const flameColors =
        activeAlkali === 'K'
          ? ['#f0abfc', '#c084fc', '#9333ea'] // Lilac / Violet (Potassium)
          : activeAlkali === 'Li'
          ? ['#fca5a5', '#ef4444', '#b91c1c'] // Crimson (Lithium)
          : ['#fef08a', '#fbbf24', '#d97706']; // Golden Yellow (Sodium)

      const flameH = 16 + Math.sin(rxnTime * 28) * 6;
      for (let f = 0; f < 3; f++) {
        const fWidth = (beadRadius + 2 - f * 2) * (0.8 + Math.sin(rxnTime * 18 + f) * 0.2);
        const fHeight = flameH - f * 4;
        const fX = beadX + (Math.random() - 0.5) * 2;
        const fY = beadY - 2;

        ctx.fillStyle = flameColors[f];
        ctx.beginPath();
        ctx.moveTo(fX - fWidth, fY);
        ctx.quadraticCurveTo(fX, fY - fHeight, fX + fWidth, fY);
        ctx.fill();
      }

      // Flame Glow Core
      ctx.shadowColor = flameColors[1];
      ctx.shadowBlur = 16;
      ctx.fillStyle = flameColors[0];
      ctx.beginPath();
      ctx.arc(beadX, beadY - 8, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // E. Flying Fire Sparks & Embers
      for (let i = 0; i < 5; i++) {
        const sparkAng = rxnTime * 18 + i * 1.3;
        const sparkDist = 6 + ((rxnTime * 38 + i * 12) % 18);
        const sx = beadX + Math.cos(sparkAng) * sparkDist;
        const sy = beadY - 6 - Math.abs(Math.sin(sparkAng)) * sparkDist;

        ctx.fillStyle = flameColors[i % 3];
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2 + Math.random() * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // F. Explosive Pop Flashes & Shockwave Rings ("Cháy nổ")
      if (Math.sin(rxnTime * 12) > 0.82) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(beadX, beadY - 4, beadRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = flameColors[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(beadX, beadY - 4, beadRadius * 3.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // G. Rising Smoke Billows
      for (let s = 0; s < 3; s++) {
        const smokeProgress = ((rxnTime * 22 + s * 10) % 32) / 32;
        const smX = beadX + Math.sin(rxnTime * 4 + s) * 10;
        const smY = beadY - 10 - smokeProgress * 38;
        const smRadius = 3 + smokeProgress * 11;
        const smAlpha = (1 - smokeProgress) * 0.55;

        ctx.fillStyle = `rgba(226, 232, 240, ${smAlpha})`;
        ctx.beginPath();
        ctx.arc(smX, smY, smRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Calcium in Water (Ca + H2O -> Ca(OH)2 + H2)
    const caMass = precipitates.find((p) => p.formula === 'Ca')?.massGram || 0;
    if (caMass > 0.001) {
      ctx.save();
      const caTime = Date.now() * 0.008;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 5; i++) {
        const px = -halfW + 10 + i * ((eq.width - 20) / 4);
        const py = h - 15 - ((caTime * 30 + i * 20) % (liquidH * 0.8));
        const pr = 4 + Math.sin(caTime + i) * 3;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 8; i++) {
        const bx = -halfW + 8 + ((i * 15 + caTime * 25) % (eq.width - 16));
        const by = h - 12 - ((i * 18 + caTime * 45) % liquidH);
        ctx.beginPath();
        ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Quicklime (CaO) in Water ("Tôi vôi" exothermic boiling & thick steam)
    const caoMass = precipitates.find((p) => p.formula === 'CaO')?.massGram || 0;
    if (caoMass > 0.001) {
      ctx.save();
      const caoTime = Date.now() * 0.006;

      ctx.fillStyle = 'rgba(241, 245, 249, 0.65)';
      for (let s = 0; s < 4; s++) {
        const progress = ((caoTime * 20 + s * 12) % 38) / 38;
        const sx = Math.sin(caoTime * 4 + s) * 12;
        const sy = -8 - progress * 45;
        const sr = 6 + progress * 16;
        const sAlpha = (1 - progress) * 0.7;

        ctx.fillStyle = `rgba(241, 245, 249, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  };

  // Specialized Renderer for Sugar Carbonization Experiment (Experiment 8: C12H22O11 + H2SO4)
  const drawSugarCarbonizationAnimation = (
    ctx: CanvasRenderingContext2D,
    eq: EquipmentInstance,
    halfW: number,
    h: number
  ) => {
    // Check if equipment contains C12H22O11 (Sugar) or C (Carbon)
    const precipitates = eq.content.precipitates || [];
    const sugarP = precipitates.find((p) => p.formula === 'C12H22O11');
    const carbonP = precipitates.find((p) => p.formula === 'C');

    if (!sugarP && !carbonP && !eq.name.includes('Đường') && !eq.name.includes('Saccarozơ')) return;

    const sugarMass = sugarP?.massGram || 0;
    const carbonMass = carbonP?.massGram || 0;
    const totalMass = sugarMass + carbonMass;
    if (totalMass <= 0.0001) return;

    const carbonRatio = carbonMass / totalMass; // 0.0 (all sugar) to 1.0 (all carbon)
    const tempC = eq.content.temperatureC || 25;
    const reactionActive = Boolean((eq.content.reactionFxTimer && eq.content.reactionFxTimer > 0) || carbonMass > 0.01);

    // Progress is driven by carbon conversion ratio
    const progress = Math.min(1.0, Math.max(0, carbonRatio));

    const now = Date.now() * 0.001;

    ctx.save();

    // 1. THERMAL RADIATION GLOW AURA (Mảng đỏ tỏa nhiệt xung quanh cốc)
    if (tempC > 40) {
      const heatAlpha = Math.min(0.65, (tempC - 40) / 140);
      const pulse = Math.sin(now * 5.0) * 0.12;
      const auraRadius = Math.max(halfW * 2.2, h * 0.8) + pulse * 10;

      const auraGrad = ctx.createRadialGradient(0, h * 0.5, 10, 0, h * 0.5, auraRadius);
      auraGrad.addColorStop(0, `rgba(239, 68, 68, ${0.5 * heatAlpha})`);
      auraGrad.addColorStop(0.5, `rgba(249, 115, 22, ${0.3 * heatAlpha})`);
      auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, h * 0.5, auraRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. STRICT TWO-PHASE CARBONIZATION SEQUENCE:
    // Base flat bed height at beaker bottom (~20% of beaker height)
    const baseBedHeight = Math.min(h * 0.22, Math.max(12, totalMass * 1.5));
    // Max extrusion height (~1.65x beaker height, length of glass stirring rod out of beaker)
    const maxHeight = h * 1.65;
    
    // PHASE 1: Color transformation at beaker bottom while carbonRatio < 0.95
    // Sugar turns White -> Yellow -> Brown -> 100% Jet Black Carbon strictly at the bottom of beaker.
    const isFullyCarbonized = progress >= 0.95;

    // Track Phase 2 (Vertical Extrusion) Start Timestamp
    const eqAny = eq as any;
    if (isFullyCarbonized) {
      if (!eqAny._carbonRisingStartTime) {
        eqAny._carbonRisingStartTime = Date.now();
      }
    } else {
      // Reset timer if sugar is not carbonized yet
      delete eqAny._carbonRisingStartTime;
    }

    // PHASE 2: 10-Second Slow Motion Vertical Extrusion
    // ONLY AFTER sugar has turned 100% jet black carbon, gas bubbles (CO2 + SO2) push the porous mass up slowly over 10s.
    let growthProgress = 0;
    if (eqAny._carbonRisingStartTime) {
      const elapsedRisingSec = (Date.now() - eqAny._carbonRisingStartTime) / 1000.0;
      growthProgress = Math.min(1.0, elapsedRisingSec / 10.0); // Exactly 10.0 seconds smooth extrusion!
    }

    const growthFactor = Math.pow(growthProgress, 0.95);
    const columnH = baseBedHeight + (maxHeight - baseBedHeight) * growthFactor;

    const baseWidth = halfW - 3;
    const topY = h - columnH; // y coordinate of column top

    // COLOR SEQUENCE (White -> Yellow -> Dark Brown -> 100% Jet Black)
    let baseFill: string;
    let highlightFill: string;

    if (progress < 0.20) {
      baseFill = '#ffffff'; // Trắng tinh
      highlightFill = '#fef08a';
    } else if (progress < 0.50) {
      baseFill = '#fde047'; // Vàng chanh / caramel
      highlightFill = '#fef08a';
    } else if (progress < 0.85) {
      baseFill = '#582f0e'; // Nâu sẫm
      highlightFill = '#78350f';
    } else {
      baseFill = '#18181b'; // Đen tuyền tuyệt đối 100%
      highlightFill = '#27272a';
    }

    // DRAW POROUS MESH COLUMN
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-baseWidth, h);

    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const stepRatio = i / steps;
      const currY = h - stepRatio * columnH;

      const widthMultiplier = stepRatio > 0.3 ? 1.0 + (stepRatio - 0.3) * 0.25 : 1.0;
      const noise = Math.sin(i * 2.8 + now * (reactionActive ? 1.5 : 0)) * (3 + stepRatio * 4) * Math.min(1.0, growthProgress + 0.1);
      const currX = -baseWidth * widthMultiplier + noise;

      if (i === 0) ctx.lineTo(currX, currY);
      else ctx.quadraticCurveTo(currX - 3, currY + (columnH / steps) * 0.5, currX, currY);
    }

    const topBulbWidth = baseWidth * (1.0 + growthProgress * 0.15);
    ctx.quadraticCurveTo(-topBulbWidth * 0.7, topY - 14, 0, topY - 10);
    ctx.quadraticCurveTo(topBulbWidth * 0.7, topY - 14, topBulbWidth, h - columnH);

    for (let i = steps; i >= 0; i--) {
      const stepRatio = i / steps;
      const currY = h - stepRatio * columnH;
      const widthMultiplier = stepRatio > 0.3 ? 1.0 + (stepRatio - 0.3) * 0.25 : 1.0;
      const noise = Math.cos(i * 3.1 + now * (reactionActive ? 1.5 : 0)) * (3 + stepRatio * 4) * Math.min(1.0, growthProgress + 0.1);
      const currX = baseWidth * widthMultiplier + noise;

      ctx.lineTo(currX, currY);
    }

    ctx.closePath();

    const meshGrad = ctx.createLinearGradient(-baseWidth * 1.3, topY, baseWidth * 1.3, h);
    if (progress < 0.38) {
      meshGrad.addColorStop(0, baseFill);
      meshGrad.addColorStop(0.5, highlightFill);
      meshGrad.addColorStop(1, '#d97706');
    } else {
      meshGrad.addColorStop(0, '#121212');
      meshGrad.addColorStop(0.3, '#18181b');
      meshGrad.addColorStop(0.7, '#27272a');
      meshGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = meshGrad;
    ctx.fill();

    ctx.strokeStyle = progress >= 0.38 ? '#3f3f46' : '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // POROUS TEXTURE (Viền sần sùi / bọt xốp)
    if (progress > 0.2) {
      const poreCount = Math.floor(10 + progress * 20);
      ctx.fillStyle = '#0a0a0a';
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1.0;

      for (let p = 0; p < poreCount; p++) {
        const poreRatioY = (Math.sin(p * 4.7) * 0.5 + 0.5);
        const py = h - poreRatioY * (columnH * 0.92);
        const px = Math.sin(p * 2.3) * (baseWidth * 0.82);
        // Ensure non-negative radii for ellipse call
        const pr = Math.max(0.8, Math.abs(2 + Math.cos(p * 3.1) * 2.2));

        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.2, pr, Math.sin(p), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // PHASE 1: Stain Center Spread Effect
    if (progress > 0.02 && progress < 0.5) {
      const stainRadius = (baseWidth * 0.9) * Math.min(1.0, progress * 2.5);
      const stainY = h - baseBedHeight * 0.8;

      const stainGrad = ctx.createRadialGradient(0, stainY, 2, 0, stainY, stainRadius);
      stainGrad.addColorStop(0, '#09090b');
      stainGrad.addColorStop(0.5, '#451a03');
      stainGrad.addColorStop(0.8, '#d97706');
      stainGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = stainGrad;
      ctx.beginPath();
      ctx.arc(0, stainY, stainRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 3. SMOKE & GAS PARTICLE SYSTEM
    if (reactionActive || tempC > 60 || progress > 0.15) {
      const particleTime = now * 12.0;
      const streamY = topY - 10;

      // Steam
      for (let s = 0; s < 12; s++) {
        const pProg = ((particleTime * 0.08 + s / 12) % 1.0);
        const py = streamY - pProg * 120;
        const px = Math.sin(particleTime * 0.15 + s) * (12 + pProg * 28);
        const pr = 6 + pProg * 24;
        const alpha = Math.max(0, (0.75 * (1.0 - pProg))).toFixed(2);

        ctx.fillStyle = `rgba(241, 245, 249, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // SO2/CO2 Gas Clouds
      for (let g = 0; g < 8; g++) {
        const gProg = ((particleTime * 0.06 + g / 8) % 1.0);
        const py = streamY - gProg * 160;
        const px = Math.cos(particleTime * 0.12 + g * 2) * (18 + gProg * 35);
        const pr = 10 + gProg * 30;
        const alpha = Math.max(0, (0.65 * (1.0 - gProg))).toFixed(2);

        ctx.fillStyle = `rgba(203, 213, 225, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      if (progress > 0.3) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 Phản ứng tỏa nhiệt mạnh (tº ≈ 180°C) | Khí SO₂↑ + CO₂↑ + H₂O(g)↑', 0, streamY - 170);
      }
    }

    // 4. CHILD 1.2: DIGITAL THERMOMETER (NHIỆT KẾ ĐIỆN TỬ DÁN NGOÀI CỐC)
    const thermX = halfW + 18;
    const thermY = h * 0.25;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(thermX - 10, thermY + 12);
    ctx.lineTo(halfW + 2, thermY + 12);
    ctx.lineTo(halfW - 5, h * 0.6);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(halfW - 8, h * 0.6 - 4, 6, 12, 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = tempC > 80 ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(thermX - 10, thermY - 10, 85, 36, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NHIỆT KẾ ĐIỆN TỬ', thermX - 4, thermY + 0);

    const tempStr = `${tempC.toFixed(1)}°C`;
    ctx.fillStyle = tempC > 100 ? '#f87171' : tempC > 60 ? '#fb923c' : '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(tempStr, thermX - 4, thermY + 18);

    ctx.restore();
  };

  // Background Bench Rendering
  const drawLaboratoryBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, height * 0.82);
    wallGrad.addColorStop(0, '#0f172a');
    wallGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, width, height * 0.82);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height * 0.82);
      ctx.stroke();
    }
    for (let y = 0; y < height * 0.82; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const benchY = height * 0.82;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, height);
    benchGrad.addColorStop(0, '#334155');
    benchGrad.addColorStop(0.1, '#1e293b');
    benchGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, width, height - benchY);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(width, benchY);
    ctx.stroke();
  };

  // Lab Stand Renderer
  const drawLabStand = (ctx: CanvasRenderingContext2D, stand: EquipmentInstance) => {
    ctx.save();
    ctx.translate(stand.x, stand.y);

    const w = stand.width;
    const h = stand.height;

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-w / 2, h - 20, w, 20, 4);
    ctx.fill();
    ctx.stroke();

    const rodGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.5, '#f8fafc');
    rodGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(-5, 0, 10, h - 20);

    if (!stand.hideRingClamp) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(-5, 50, 45, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(40, 56, 16, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Tripod & Wire Gauze Renderer (Kiềng ba chân & Lưới Amiăng tản nhiệt)
  const drawTripodWireGauzeGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const w = eq.width;
    const h = eq.height;

    // Check if heat is actively being transferred through wire gauze
    const isHeatingActive = equipmentsRef.current.some(
      (b) => b.type === 'alcohol_burner' && b.isBurning && Math.abs(b.x - eq.x) < 55 && b.y > eq.y && (b.y - eq.y) < 180
    );

    // Tripod metal legs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 10, 20);
    ctx.lineTo(-w / 2 - 15, h);
    ctx.moveTo(w / 2 - 10, 20);
    ctx.lineTo(w / 2 + 15, h);
    ctx.moveTo(0, 20);
    ctx.lineTo(0, h - 5);
    ctx.stroke();

    // Metal ring collar
    ctx.strokeStyle = isHeatingActive ? '#f97316' : '#94a3b8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 20, w / 2, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Wire Gauze ceramic plate base
    ctx.fillStyle = isHeatingActive ? 'rgba(254, 215, 170, 0.95)' : 'rgba(226, 232, 240, 0.9)';
    ctx.strokeStyle = isHeatingActive ? '#c2410c' : '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-w / 2 + 5, 12, w - 10, 14);
    ctx.fill();
    ctx.stroke();

    // Mesh Grid
    ctx.strokeStyle = isHeatingActive ? '#ea580c' : '#94a3b8';
    ctx.lineWidth = 1;
    for (let x = -w / 2 + 10; x < w / 2 - 10; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, 26);
      ctx.stroke();
    }

    // Ceramic Center Disc (Hot Glowing Spot when heating)
    if (isHeatingActive) {
      const glowGrad = ctx.createRadialGradient(0, 19, 2, 0, 19, 22);
      glowGrad.addColorStop(0, '#ffffff');
      glowGrad.addColorStop(0.3, '#fde047');
      glowGrad.addColorStop(0.7, '#f97316');
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 19, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 19, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Status Label Badge at base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w / 2 - 12, h + 2, w + 24, 16);
    ctx.fillStyle = isHeatingActive ? '#fbbf24' : '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isHeatingActive ? '🔥 Lưới Amiăng (Đang Truyền Nhiệt)' : 'Lưới Amiăng & Kiềng', 0, h + 14);
  };

  // Glassware Container (Test tube, Beaker, Flask, Cylinder)
  const drawGlasswareContainer = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance, dt: number) => {
    const w = eq.width;
    const h = eq.height;
    const halfW = w / 2;

    // Calculate total solid height at bottom
    let totalSolidH = 0;
    if (eq.content.precipitates && eq.content.precipitates.length > 0) {
      eq.content.precipitates.forEach((p) => {
        if (p.massGram > 0) {
          totalSolidH += Math.min(h * 0.48, Math.max(14, p.massGram * 3.8));
        }
      });
    }

    const fillRatio = Math.min(1.0, eq.content.volumeMl / eq.capacityMl);
    const liquidH = h * fillRatio * 0.82;

    if (liquidH > 2) {
      ctx.save();
      // Liquid layer rests on top of the solid phase layer
      const liquidY = h - totalSolidH - liquidH;

      ctx.beginPath();
      if (eq.type === 'erlenmeyer') {
        ctx.moveTo(-15, 0);
        ctx.lineTo(-halfW, h - 10);
        ctx.quadraticCurveTo(-halfW, h, -halfW + 10, h);
        ctx.lineTo(halfW - 10, h);
        ctx.quadraticCurveTo(halfW, h, halfW, h - 10);
        ctx.lineTo(15, 0);
      } else if (eq.type.startsWith('round_flask')) {
        const nW = eq.type === 'round_flask_2neck' ? 14 : 18;
        const cy = h - halfW;
        const angL = 2 * Math.PI - Math.acos(-nW / halfW);
        const angR = 2 * Math.PI - Math.acos(nW / halfW);
        const nY = cy + Math.sin(angL) * halfW;
        ctx.moveTo(-nW, 0);
        ctx.lineTo(-nW, nY);
        ctx.arc(0, cy, halfW, angL, angR, true);
        ctx.lineTo(nW, 0);
      } else if (eq.type === 'test_tube') {
        ctx.moveTo(-halfW, 0);
        ctx.lineTo(-halfW, h - halfW);
        ctx.arc(0, h - halfW, halfW, Math.PI, 0, true);
        ctx.lineTo(halfW, 0);
      } else {
        ctx.rect(-halfW, 0, w, h);
      }
      ctx.clip();

      const { r, g, b, a } = eq.content.colorRgba;
      const liqGrad = ctx.createLinearGradient(-halfW, liquidY, halfW, h);
      liqGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(1.0, a + 0.25)})`);
      liqGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a})`);
      liqGrad.addColorStop(1, `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, ${Math.min(1.0, a + 0.35)})`);

      ctx.fillStyle = liqGrad;
      ctx.fillRect(-halfW - 20, liquidY, w + 40, liquidH + 20);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1.0, a + 0.4)})`;
      ctx.beginPath();
      ctx.ellipse(0, liquidY, halfW - 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- NEW: Draw Ice Bath if eq is named "nước đá" ---
      if (eq.name.toLowerCase().includes('đá') && eq.content.temperatureC <= 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(200, 240, 255, 0.6)';
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
        ctx.lineWidth = 1.5;
        // Seed random based on eq.id so cubes don't jump around
        let s = 1234;
        const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
        // Draw some ice cubes in the liquid
        for (let i = 0; i < 20; i++) {
          const x = -halfW + 10 + (rand() * (w - 20));
          const y = liquidY + 5 + (rand() * (liquidH - 20));
          const size = 12 + rand() * 15;
          ctx.beginPath();
          ctx.rect(x - size/2, y, size, size * 0.8);
          ctx.fill();
          ctx.stroke();
          // Inner detail
          ctx.beginPath();
          ctx.moveTo(x - size/2 + 2, y + 2);
          ctx.lineTo(x + size/2 - 2, y + size * 0.8 - 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Stirring Water Swirl & Vortex Effect when Glass Rod is dipped inside
      if (eq.isStirring) {
        const time = Date.now() * 0.008;

        // 1. Surface Vortex Spiral Ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const vortexRadius = (halfW - 4) * 0.75;
        for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
          const radius = (angle / (Math.PI * 4)) * vortexRadius;
          const vx = Math.cos(angle + time) * radius;
          const vy = liquidY + Math.sin(angle + time) * (radius * 0.35);
          if (angle === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.stroke();

        // 2. Liquid Body Circulating Wave Streams
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const phase = time * 0.9 + i * ((Math.PI * 2) / 3);
          const sy = liquidY + liquidH * 0.2 + i * liquidH * 0.25;
          const sw = (halfW - 6) * Math.sin(phase);
          ctx.beginPath();
          ctx.ellipse(0, sy, Math.abs(sw), 5 + Math.sin(phase) * 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Spinning Particles inside Liquid
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 6; i++) {
          const pAngle = time * 1.5 + i * 1.05;
          const pDist = (halfW - 8) * (0.2 + 0.6 * Math.sin(i * 1.7));
          const px = Math.cos(pAngle) * pDist;
          const py = liquidY + 6 + liquidH * 0.65 * ((Math.sin(pAngle + i) + 1) / 2);
          ctx.beginPath();
          ctx.arc(px, py, 1.2 + Math.sin(i + time) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Boiling Bubbles when Liquid is Heated (> 75°C)
      if (eq.content.temperatureC > 75) {
        const boilTime = Date.now() * 0.012;
        const bubbleCount = Math.min(10, Math.floor((eq.content.temperatureC - 70) / 3));
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < bubbleCount; i++) {
          const bx = -halfW + 8 + ((i * 19 + boilTime * 15) % (w - 16));
          const by = h - totalSolidH - ((i * 23 + boilTime * 35) % liquidH);
          const bRadius = 1.2 + Math.sin(boilTime + i) * 0.8;
          ctx.beginPath();
          ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4b. Active Reaction Gas Bubbles & Effervescence Stream (CO2, H2, O2, SO2, NH3, Cl2, etc.)
      const gasActive = eq.content.activeGas;
      if (gasActive && gasActive.rate > 0) {
        const safeTime = ((Date.now() % 100000) * 0.001);
        const gasTime = safeTime * 15.0;

        const isExp4Flask0 = eq.hasDroppingFunnel || eq.name.includes('CaCO3');
        const isExp4Flask1 = eq.name.includes('Bình 1') || eq.name.includes('NaHCO3');
        const isExp4Flask2 = eq.name.includes('Bình 2') || eq.name.includes('H2SO4');
        const isExp4Flask3 = eq.isCo2Collector || eq.name.includes('Bình thu');
        const isExp5Flask1 = eq.name.includes('KMnO4');

        if (isExp4Flask0) {
          // --- BÌNH 0: BÌNH PHẢN ỨNG TAM GIÁC (CaCO3 + HCl) ---
          // Surface Effervescence: Bubbles emit directly from CaCO3 solid surface at bottom.
          const bubbleCount = Math.max(18, Math.floor(gasActive.rate * 28));
          ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
          for (let i = 0; i < bubbleCount; i++) {
            const bProgress = ((gasTime * 0.8 + i / bubbleCount) % 1.0);
            const bx = -halfW + 8 + ((i * 13 + gasTime * 18) % (w - 16));
            const startY = h - totalSolidH;
            const by = startY - bProgress * Math.max(1, (startY - liquidY));
            const bRadius = 1.0 + Math.sin(gasTime * 3 + i) * 1.0 + (1 - bProgress) * 1.0;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // Surface Foam / Burst Effect
          const foamY = liquidY;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          for (let f = -halfW + 4; f < halfW - 4; f += 4) {
            const foamR = 2.0 + Math.sin(gasTime * 4 + f) * 1.5;
            ctx.beginPath();
            ctx.arc(f, foamY, foamR, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isExp4Flask1) {
          // --- BÌNH 1: BÌNH RỬA 1 (NaHCO3 bão hòa / NaCl) ---
          // Subsurface Sparging: Emitter Point EXACTLY at tip of deep left dip tube
          const dipTubeX = -12;
          const dipTubeY = h - 12; // Deep in liquid solution
          const bTime = safeTime * 4.0;
          const bubbleCount = Math.max(16, Math.floor(gasActive.rate * 24));
          const travelDist = Math.max(10, dipTubeY - liquidY);

          ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
          for (let i = 0; i < bubbleCount; i++) {
            const bProgress = ((bTime * 0.9 + i / bubbleCount) % 1.0);
            const disperseX = Math.sin(bTime * 3 + i * 2) * (halfW * 0.22);
            const bx = dipTubeX + disperseX;
            const by = dipTubeY - bProgress * travelDist;
            const bRadius = 1.8 + bProgress * 1.8;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.5, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // Surface Foam / Burst Effect
          const foamY = liquidY;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          for (let f = -10; f <= 10; f += 4) {
            const foamR = 2.5 + Math.sin(bTime * 4 + f) * 1.5;
            ctx.beginPath();
            ctx.arc(dipTubeX + f, foamY, foamR, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isExp4Flask2) {
          // --- BÌNH 2: BÌNH RỬA 2 (H2SO4 đặc) ---
          // Viscous Subsurface Sparging: Emitter Point at deep dip tube tip in H2SO4
          const dipTubeX = -12;
          const dipTubeY = h - 12; // Deep in H2SO4 liquid
          const viscousGasTime = safeTime * 2.8; // 30% slower rising speed
          const bubbleCount = Math.max(14, Math.floor(gasActive.rate * 22));
          const travelDist = Math.max(10, dipTubeY - liquidY);

          ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
          for (let i = 0; i < bubbleCount; i++) {
            const bProgress = ((viscousGasTime + i / bubbleCount) % 1.0);
            const bx = dipTubeX + Math.sin(viscousGasTime * 2 + i) * (halfW * 0.18);
            const by = dipTubeY - bProgress * travelDist;
            const rx = 3.2 + bProgress * 1.8;
            const ry = rx * 0.8; // Slightly flattened viscous bubble
            ctx.beginPath();
            ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Surface Burst in Viscous H2SO4
          const foamY = liquidY;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          for (let f = -8; f <= 8; f += 4) {
            const foamR = 3.0 + Math.sin(viscousGasTime * 3 + f) * 1.2;
            ctx.beginPath();
            ctx.arc(dipTubeX + f, foamY, foamR, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isExp4Flask3) {
          // --- BÌNH 3: BÌNH THU KHÍ CẦU/TAM GIÁC (CO2 / Cl2 Collector) ---
          // Render gas stream exiting tube tip (x=0, y=h-25) and expanding UPWARDS inside collector
          const tubeTipX = 0;
          const tubeTipY = h - 25;
          const dryTime = safeTime * 3.5;

          ctx.save();
          for (let p = 0; p < 12; p++) {
            const pProgress = ((dryTime + p / 12) % 1.0);
            const px = tubeTipX + Math.sin(dryTime * 2.5 + p) * (8 + pProgress * 16);
            const py = tubeTipY - pProgress * (h - 45); // RISES UPWARDS!
            const pr = 2.5 + pProgress * 6.5;

            ctx.fillStyle = 'rgba(226, 232, 240, ' + (0.75 * (1 - pProgress * 0.5)).toFixed(2) + ')';
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        } else if (isExp5Flask1) {
          // --- BÌNH KMN04: Sparging ---
          // Subsurface Sparging: Emitter Point at dip tube tip (x=0, y=h-30)
          const dipTubeX = 0;
          const dipTubeY = h - 30; // Deep in liquid solution
          const bTime = safeTime * 2.5; // slow
          const bubbleCount = Math.max(16, Math.floor(gasActive.rate * 24));
          const travelDist = Math.max(10, dipTubeY - liquidY);

          ctx.fillStyle = gasActive.color || 'rgba(253, 224, 71, 0.6)';
          for (let i = 0; i < bubbleCount; i++) {
            const bProgress = ((bTime * 0.9 + i / bubbleCount) % 1.0);
            const disperseX = Math.sin(bTime * 2 + i * 2) * (halfW * 0.3);
            const bx = dipTubeX + disperseX;
            const by = dipTubeY - bProgress * travelDist;
            const bRadius = 1.8 + bProgress * 2.0;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.5, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // Surface Foam / Burst Effect
          const foamY = liquidY;
          ctx.fillStyle = gasActive.color || 'rgba(253, 224, 71, 0.4)';
          for (let f = -12; f <= 12; f += 4) {
            const foamR = 2.5 + Math.sin(bTime * 3 + f) * 1.5;
            ctx.beginPath();
            ctx.arc(dipTubeX + f, foamY, foamR, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (gasActive.formula === 'NO2') {
          // --- THÍ NGHIỆM HNO3 ĐẶC: KHÍ NO2 NÂU ĐỎ ĐẬM TRÀO DÂN MẠNH ---
          const safeTime = ((Date.now() % 100000) * 0.001);
          const fastTime = safeTime * 22.0;

          // A. Strong, Fast Bubbles Rising from Bottom Liquid
          const bubbleCount = 28;
          ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
          for (let i = 0; i < bubbleCount; i++) {
            const bx = -halfW + 6 + ((i * 13 + fastTime * 22) % (w - 12));
            const by = h - totalSolidH - ((i * 17 + fastTime * 50) % Math.max(1, liquidH));
            const bRadius = 1.6 + Math.sin(fastTime * 3 + i) * 1.2;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // B. Swirling Dark Red-Brown NO2 Gas filling inner jar body (y between 0 and liquidY)
          const cloudCount = 14;
          ctx.save();
          for (let c = 0; c < cloudCount; c++) {
            const progress = ((fastTime * 0.05 + c / cloudCount) % 1.0);
            const cy = liquidY - progress * liquidY;
            const cx = Math.sin(fastTime * 0.15 + c) * (halfW * 0.5);
            const cr = 8 + progress * 12;
            ctx.fillStyle = 'rgba(139, 69, 19, ' + (0.7 - progress * 0.2).toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (gasActive.formula === 'NO2') {
          // --- THÍ NGHIỆM HNO3 ĐẶC: KHÍ NO2 NÂU ĐỎ ĐẬM TRÀO DÂN MẠNH ---
          const safeTime = ((Date.now() % 100000) * 0.001);
          const fastTime = safeTime * 22.0;

          // A. Strong, Fast Bubbles Rising from Bottom Liquid
          const bubbleCount = 28;
          ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
          for (let i = 0; i < bubbleCount; i++) {
            const bx = -halfW + 6 + ((i * 13 + fastTime * 22) % (w - 12));
            const by = h - totalSolidH - ((i * 17 + fastTime * 50) % Math.max(1, liquidH));
            const bRadius = 1.6 + Math.sin(fastTime * 3 + i) * 1.2;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // B. Swirling Dark Red-Brown NO2 Gas filling inner jar body (y between 0 and liquidY)
          const cloudCount = 14;
          ctx.save();
          for (let c = 0; c < cloudCount; c++) {
            const progress = ((fastTime * 0.05 + c / cloudCount) % 1.0);
            const cy = liquidY - progress * liquidY;
            const cx = Math.sin(fastTime * 0.15 + c) * (halfW * 0.5);
            const cr = 8 + progress * 12;
            ctx.fillStyle = 'rgba(139, 69, 19, ' + (0.7 - progress * 0.2).toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (gasActive.formula === 'NO') {
          // --- THÍ NGHIỆM HNO3 LOÃNG: KHÍ NO KHÔNG MÀU SỦI LĂN TĂN -> HÓA NÂU TẠI MIỆNG BÌNH ---
          const safeTime = ((Date.now() % 100000) * 0.001);
          const slowTime = safeTime * 8.0;

          // A. Slow, Gentle Bubbles Rising inside Liquid ("Sủi bọt lăn tăn")
          const bubbleCount = 10;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; // Colorless / transparent
          for (let i = 0; i < bubbleCount; i++) {
            const bx = -halfW + 8 + ((i * 17 + slowTime * 10) % (w - 16));
            const by = h - totalSolidH - ((i * 23 + slowTime * 25) % Math.max(1, liquidH));
            const bRadius = 1.1 + Math.sin(slowTime * 2 + i) * 0.7;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // B. COMPLETELY COLORLESS NO Gas filling inner jar body (y between 0 and liquidY)
          const cloudCount = 8;
          ctx.save();
          for (let c = 0; c < cloudCount; c++) {
            const progress = ((slowTime * 0.05 + c / cloudCount) % 1.0);
            const cy = liquidY - progress * liquidY;
            const cx = Math.sin(slowTime * 0.12 + c) * (halfW * 0.35);
            const cr = 4 + progress * 6;
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.12 * (1 - progress * 0.5)).toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (gasActive.formula === 'Cl2_absorbed' || ((eq.name.includes('NaOH') || eq.name.includes('NaCl') || eq.name.includes('Javel') || eq.name.includes('Cốc')) && gasActive.formula === 'Cl2')) {
          // --- THÍ NGHIỆM 9: KHÍ CL2 SỤC VÀO NAOH TỪ ĐẦU ỐNG DẪN TAN TẠO NƯỚC JAVEL ---
          const safeTime = ((Date.now() % 100000) * 0.001);
          const gasTime = safeTime * 15.0;
          const bubbleCount = 22;

          // Emitter point at deep dip tube tip (x=0, y=h-18)
          const dipX = 0;
          const dipY = h - 18;
          const travelDist = Math.max(10, dipY - liquidY);

          ctx.save();
          for (let i = 0; i < bubbleCount; i++) {
            const progress = ((i / bubbleCount + gasTime * 0.08) % 1.0);
            const bx = dipX + Math.sin(gasTime * 2.5 + i * 1.8) * (halfW * 0.38);
            const by = dipY - progress * travelDist;
            const bRadius = 1.8 + Math.sin(gasTime * 3 + i) * 0.9;
            const opacity = Math.max(0, 0.85 * (1.0 - progress * 0.85)); // Fades as Cl2 dissolves & reacts

            if (opacity > 0.01) {
              ctx.fillStyle = `rgba(192, 202, 51, ${opacity.toFixed(2)})`;
              ctx.beginPath();
              ctx.arc(bx, by, Math.max(0.8, bRadius), 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Micro bubbles bursting at tip
          ctx.fillStyle = 'rgba(230, 238, 120, 0.9)';
          for (let m = 0; m < 6; m++) {
            const mx = dipX + (Math.sin(gasTime * 4 + m) * 6);
            const my = dipY - (m * 2);
            ctx.beginPath();
            ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (gasActive.formula === 'Cl2' || eq.name.includes('MnO2')) {
          // --- THÍ NGHIỆM 9: ĐIỀU CHẾ KHÍ CL2 VÀNG LỤC TRONG BÌNH CẦU ---
          const safeTime = ((Date.now() % 100000) * 0.001);
          const gasTime = safeTime * 14.0;

          // A. Strong Bubbles Rising from MnO2 Solid at Bottom
          const bubbleCount = 20;
          ctx.fillStyle = 'rgba(192, 202, 51, 0.8)';
          for (let i = 0; i < bubbleCount; i++) {
            const bx = -halfW + 6 + ((i * 13 + gasTime * 18) % (w - 12));
            const by = h - totalSolidH - ((i * 19 + gasTime * 40) % Math.max(1, liquidH));
            const bRadius = 1.5 + Math.sin(gasTime * 2.5 + i) * 1.0;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // B. Swirling Yellow-Green Cl2 Gas Cloud filling upper flask body (above liquidY)
          ctx.save();
          const cloudCount = 14;
          for (let c = 0; c < cloudCount; c++) {
            const progress = ((gasTime * 0.05 + c / cloudCount) % 1.0);
            const cy = liquidY - progress * (liquidY - 10);
            const cx = Math.sin(gasTime * 0.15 + c * 2) * (halfW * 0.45);
            const cr = 6 + progress * 10;
            const alpha = 0.55 * (1.0 - progress * 0.3);

            ctx.fillStyle = `rgba(192, 202, 51, ${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (gasActive.formula === 'HNO3') {
          // --- THÍ NGHIỆM 12: ĐIỀU CHẾ HNO3 (Hơi bốc lên từ phản ứng rắn + đặc) ---
          const safeTime = ((Date.now() % 100000) * 0.001);
          const gasTime = safeTime * 15.0;
          const bubbleCount = 18;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          for (let i = 0; i < bubbleCount; i++) {
            const bx = -halfW + 8 + ((i * 17 + gasTime * 25) % (w - 16));
            const by = h - totalSolidH - ((i * 21 + gasTime * 45) % Math.max(1, liquidH));
            const bRadius = 1.2 + Math.sin(gasTime * 2.5 + i) * 1.0;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }
          // Yellowish white gas cloud for HNO3 mixed with NO2
          ctx.save();
          const cloudCount = 14;
          for (let c = 0; c < cloudCount; c++) {
            const progress = ((gasTime * 0.06 + c / cloudCount) % 1.0);
            const cy = liquidY - progress * (liquidY - 10);
            const cx = Math.sin(gasTime * 0.15 + c * 2) * (halfW * 0.45);
            const cr = 6 + progress * 14;
            const alpha = 0.5 * (1.0 - progress * 0.4);
            ctx.fillStyle = `rgba(255, 250, 200, ${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else {
          const safeTime = ((Date.now() % 100000) * 0.001);
          const gasTime = safeTime * 15.0;
          const gasBubbleCount = Math.max(8, Math.floor(gasActive.rate * 22));
          const bubbleColor = gasActive.color || 'rgba(255, 255, 255, 0.75)';

          // A. Rising Gas Bubbles Stream inside Liquid Body
          ctx.fillStyle = bubbleColor;
          for (let i = 0; i < gasBubbleCount; i++) {
            const bx = -halfW + 6 + ((i * 17 + gasTime * 20) % (w - 12));
            const by = h - totalSolidH - ((i * 21 + gasTime * 45) % liquidH);
            const bRadius = 1.4 + Math.sin(gasTime * 2 + i) * 1.0;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1.0, bRadius), 0, Math.PI * 2);
            ctx.fill();
          }

          // B. Effervescent Surface Foam Layer at Top Liquid Interface
          const foamY = liquidY;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
          for (let f = -halfW + 4; f < halfW - 4; f += 5) {
            const foamR = 2.5 + Math.sin(gasTime * 3 + f) * 1.5;
            ctx.beginPath();
            ctx.arc(f, foamY, foamR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4c. Suspended Precipitate Cloud / Turbid Reaction Swirl in Liquid
      if (eq.content.precipitates && eq.content.precipitates.length > 0) {
        eq.content.precipitates.forEach((p) => {
          if (p.massGram > 0.001) {
            const opacity = p.settledRatio < 1.0 ? 0.65 : 0.25;
            const pColor = p.color || 'rgba(240, 240, 245, 0.8)';
            const cloudTime = Date.now() * 0.003;
            ctx.save();
            ctx.fillStyle = pColor;
            ctx.globalAlpha = opacity;

            for (let c = 0; c < 5; c++) {
              const cx = Math.sin(cloudTime + c * 1.5) * (halfW * 0.45);
              const cy = liquidY + liquidH * 0.2 + c * (liquidH * 0.15);
              const cr = (halfW * 0.35) + Math.cos(cloudTime * 2 + c) * 4;
              ctx.beginPath();
              ctx.ellipse(cx, cy, Math.max(2, cr), Math.max(1, cr * 0.5), 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        });
      }

      // 5. Active Solid-Water Reaction Physics & Visuals (Na, K, Li, Ca, CaO in Water)
      drawWaterSolidReactions(ctx, eq, halfW, h, liquidY, liquidH);

      ctx.restore(); // END VESSEL CLIP!
    }

    // --- UNCLIPPED: SUGAR CARBONIZATION ANIMATION (EXPERIMENT 8: C12H22O11 + H2SO4) ---
    drawSugarCarbonizationAnimation(ctx, eq, halfW, h);

    // --- UNCLIPPED: GAS PLUMES RISING ABOVE GLASS VESSEL MOUTH (y <= 0) (CHỈ ÁP DỤNG CHO THÍ NGHIỆM 7: HNO3 + Cu) ---
    const gasActive = eq.content.activeGas;
    const isExp7Gas = Boolean(
      gasActive &&
      (gasActive.formula === 'NO2' ||
        gasActive.formula === 'NO' ||
        eq.name.includes('HNO3') ||
        eq.name.includes('Cu'))
    );

    if (gasActive && gasActive.rate > 0 && isExp7Gas) {
      const safeTime = ((Date.now() % 100000) * 0.001);
      const fastTime = safeTime * 22.0;
      const slowTime = safeTime * 8.0;

      if (gasActive.formula === 'NO2') {
        // C. Dark Red-Brown NO2 Gas Plume Billowing Above Jar Mouth (y <= 0)
        // Rises above beaker mouth by 2.0 * h (~180px+)
        const no2PlumeH = Math.max(h * 2.0, 180);
        ctx.save();
        for (let p = 0; p < 14; p++) {
          const progress = ((fastTime * 0.07 + p / 14) % 1.0);
          const py = -progress * (no2PlumeH + 30);
          const px = Math.sin(fastTime * 0.2 + p) * (10 + progress * 24);
          const pr = 8 + progress * 22;
          const alpha = (0.85 * (1.0 - progress)).toFixed(2);
          ctx.fillStyle = 'rgba(185, 28, 28, ' + alpha + ')';
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (gasActive.formula === 'NO') {
        // C. COLOR CHANGE WHEN EXITING MOUTH (y <= 0): Contacting O2 in air -> TURNS RED-BROWN!
        // Rises above beaker mouth by 1.8 * h (~160px+)
        const noPlumeH = Math.max(h * 1.8, 160);
        ctx.save();
        for (let p = 0; p < 14; p++) {
          const progress = ((slowTime * 0.08 + p / 14) % 1.0);
          const py = -progress * (noPlumeH + 30);
          const px = Math.sin(slowTime * 0.18 + p) * (8 + progress * 20);
          const pr = 6 + progress * 18;
          const alpha = (0.8 * (1.0 - progress)).toFixed(2);
          ctx.fillStyle = 'rgba(180, 83, 9, ' + alpha + ')'; // Vivid Dark Red-Brown NO2
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
        // Floating Callout Formula above Mouth
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText('2NO (không màu) + O₂ → 2NO₂↑ (hóa nâu)', 0, -(noPlumeH + 35));
        ctx.restore();
      }
    }

    // 5b. (Disabled mouth wisps as requested - no wisps/steam above container opening)
    /*
    const isGasActive = Boolean(eq.content.activeGas && eq.content.activeGas.rate > 0);
    const isRxnActive = Boolean(eq.content.reactionFxTimer && eq.content.reactionFxTimer > 0);
    const isHot = eq.content.temperatureC > 38;
    const isCaCO3Flask = eq.hasDroppingFunnel || eq.name.includes('CaCO3');

    if ((isHot || isGasActive || isRxnActive) && !isExp3 && !isCaCO3Flask) {
      ctx.save();
      const steamTime = Date.now() * 0.006;
      const steamAlpha = isGasActive ? 0.75 : isRxnActive ? 0.6 : Math.min(0.7, (eq.content.temperatureC - 35) / 60);
      const steamColor = eq.content.activeGas?.color || 'rgba(240, 248, 255, 0.7)';
      ctx.strokeStyle = steamColor;
      ctx.lineWidth = 2.0;

      for (let i = 0; i < 4; i++) {
        const sx = -14 + i * 9;
        const sy = -8 - ((steamTime * 32 + i * 16) % 40);
        const wave = Math.sin(steamTime * 4 + i * 2) * 7;
        const alpha = Math.max(0, steamAlpha * (1.0 - (Math.abs(sy) / 45)));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(sx + wave, sy);
        ctx.quadraticCurveTo(sx - wave, sy - 12, sx + wave, sy - 28);
        ctx.stroke();
      }
      ctx.restore();
    }
    */

    // 6. Active Reaction Pulsing Aura Ring around Container
    if (eq.content.reactionFxTimer && eq.content.reactionFxTimer > 0) {
      ctx.save();
      const pulse = 0.5 + Math.sin(Date.now() * 0.012) * 0.5;
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.45 + pulse * 0.45})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14 + pulse * 10;
      if (eq.type === 'erlenmeyer') {
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-halfW, h - 10);
        ctx.quadraticCurveTo(-halfW, h, -halfW + 10, h);
        ctx.lineTo(halfW - 10, h);
        ctx.quadraticCurveTo(halfW, h, halfW, h - 10);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.stroke();
      } else if (eq.type === 'test_tube') {
        ctx.beginPath();
        ctx.moveTo(-halfW, 0);
        ctx.lineTo(-halfW, h - halfW);
        ctx.arc(0, h - halfW, halfW, Math.PI, 0, true);
        ctx.lineTo(halfW, 0);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeRect(-halfW - 2, -2, w + 4, h + 4);
      }
      ctx.restore();
    }

    // Render solid powder / precipitate layer at bottom (whether liquid exists or dry)
    drawContainerSolids(ctx, eq, halfW, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    if (eq.type === 'erlenmeyer') {
      ctx.moveTo(-15, 0);
      ctx.lineTo(-halfW, h - 10);
      ctx.quadraticCurveTo(-halfW, h, -halfW + 10, h);
      ctx.lineTo(halfW - 10, h);
      ctx.quadraticCurveTo(halfW, h, halfW, h - 10);
      ctx.lineTo(15, 0);
      ctx.stroke();
      ctx.strokeRect(-18, -4, 36, 4);

      // Render Rubber Stopper ("Nút bịt kín") on CaCO3 flask & CO2 collection flask mouth & closed gas containers
      const isExp5Receiver = eq.name.includes('KMnO4');
      if (eq.hasDroppingFunnel || eq.name.includes('CaCO3') || eq.isCo2Collector || eq.name.includes('Bình thu') || isExp5Receiver || eq.name.includes('NH4Cl')) {
        ctx.save();
        ctx.fillStyle = '#334155'; // Dark rubber stopper
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-16, -10);
        ctx.lineTo(16, -10);
        ctx.lineTo(14, 2);
        ctx.lineTo(-14, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rubber stopper highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(-14, -9, 28, 2);

        // Glass tube holes through stopper
        ctx.fillStyle = '#64748b';
        if (eq.isCo2Collector || eq.name.includes('Bình thu')) {
          ctx.fillRect(-1.5, -11, 3, 14); // Central single tube hole
        } else {
          ctx.fillRect(-6, -11, 3, 14);
          ctx.fillRect(4, -11, 3, 14);
        }

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Nút bịt kín', 0, -13);
        ctx.restore();
      }

      // Render Cotton Plug (Bông y tế tẩm NaOH) on neck if erlenmeyer is receiving flask or contains NaOH
      if (eq.name.toLowerCase().includes('bông')) {
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-8, -2, 7, 0, Math.PI * 2);
        ctx.arc(0, -5, 8, 0, Math.PI * 2);
        ctx.arc(8, -2, 7, 0, Math.PI * 2);
        ctx.arc(0, 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Label "Bông tẩm NaOH"
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bông NaOH', 0, -14);
        ctx.restore();
      }

      // Render Cl2 / CO2 / NH3 Heavy Gas Fill Layer accumulating from bottom up
      const fillRatio = Math.min(1.0, eq.gasFillLevel || 0);
      if (fillRatio > 0.02) {
        ctx.save();
        const gasH = (h - 12) * fillRatio;
        const gasTopY = h - gasH;

        const isCo2Container = eq.isCo2Collector || eq.name.includes('CO2');
        const isNH3Container = eq.name.includes('NH3') || eq.name.includes('Úp ngược');

        const gasGrad = ctx.createLinearGradient(0, h, 0, gasTopY);
        if (isCo2Container) {
          gasGrad.addColorStop(0, 'rgba(186, 230, 253, 0.65)'); // Soft sky-blue tint for CO2 gas layer
          gasGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.50)');
          gasGrad.addColorStop(1.0, 'rgba(226, 232, 240, 0.30)');
        } else if (isNH3Container) {
          gasGrad.addColorStop(0, 'rgba(241, 245, 249, 0.8)'); // White-grey tint for NH3 gas
          gasGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.6)');
          gasGrad.addColorStop(1.0, 'rgba(203, 213, 225, 0.4)');
        } else {
          gasGrad.addColorStop(0, 'rgba(163, 230, 53, 0.75)');
          gasGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.55)');
          gasGrad.addColorStop(1.0, 'rgba(163, 230, 53, 0.35)');
        }

        ctx.fillStyle = gasGrad;
        ctx.beginPath();
        ctx.moveTo(-15 + (1 - fillRatio) * (-halfW + 25), gasTopY);
        ctx.lineTo(-halfW + 4, h - 8);
        ctx.quadraticCurveTo(-halfW + 4, h, -halfW + 10, h);
        ctx.lineTo(halfW - 10, h);
        ctx.quadraticCurveTo(halfW - 4, h, halfW - 4, h - 8);
        ctx.lineTo(15 - (1 - fillRatio) * (15 - halfW + 10), gasTopY);
        ctx.closePath();
        ctx.fill();

        // Density Gradient Animated Wisp Wave at Gas Top Boundary
        if ((isCo2Container || isNH3Container) && fillRatio > 0.05) {
          const waveTime = Date.now() * 0.004;
          ctx.strokeStyle = isNH3Container ? 'rgba(226, 232, 240, 0.4)' : 'rgba(241, 245, 249, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const startX = -12 + (1 - fillRatio) * (-halfW + 22);
          const endX = 12 - (1 - fillRatio) * (12 - halfW + 8);
          ctx.moveTo(startX, gasTopY);
          for (let wx = startX; wx <= endX; wx += 4) {
            const wy = gasTopY + Math.sin(waveTime * 3 + wx * 0.15) * 2.2;
            ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = isNH3Container ? '#cbd5e1' : (isCo2Container ? '#f1f5f9' : '#fef08a');
        ctx.textAlign = 'center';
        
        let fillText = '';
        if (isNH3Container) {
          fillText = `Khí NH₃ (${Math.round(fillRatio * 100)}% đầy bình)`;
        } else if (isCo2Container) {
          fillText = `Chứa: Khí CO₂ khô (Dời chỗ KH)`;
        } else {
          fillText = `Khí Cl₂ (${Math.round(fillRatio * 100)}% đầy bình)`;
        }
        
        // NH3 is inverted, mouth at 0, bottom at h. Rotate text so it's readable.
        if (isNH3Container) {
          ctx.save();
          // Translate to the visual top of the gas
          ctx.translate(0, gasTopY + 12);
          // Reverse the test tube's 180 degree rotation to draw upright text
          ctx.rotate(-Math.PI);
          ctx.fillText(fillText, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(fillText, 0, Math.max(25, gasTopY + 12));
        }

        ctx.restore();
      }

      // Render Paper Strips (Giấy màu khô, Giấy màu ẩm, Giấy quỳ tím ẩm)
      if (eq.hasDryPaper || eq.hasWetPaper || eq.hasRedLitmus) {
        ctx.save();

        if (eq.hasRedLitmus) {
          // NH3 test tube is inverted (angle=180). Mouth is at local y=0, closed top at local y=h.
          const progress = Math.min(1.0, Math.max(0, eq.redLitmusColorProgress || 0));

          // 1. Suspension thread & clip holding the paper strip inside the inverted tube
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 4);
          ctx.lineTo(0, 22);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(0, 22, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // 2. Moist Red Litmus Paper Strip (wider, centered & clearly visible!)
          const pw = 12; // 12px wide
          const ph = 68; // 68px tall
          const px = -pw / 2; // Centered inside test tube
          const py = 24;

          // Gradient: Bottom turns blue first as NH3 gas rises up from mouth
          const litmusGrad = ctx.createLinearGradient(0, py + ph, 0, py);
          if (progress <= 0) {
            litmusGrad.addColorStop(0, '#f43f5e'); // Rose Red
            litmusGrad.addColorStop(1, '#e11d48');
          } else if (progress >= 1) {
            litmusGrad.addColorStop(0, '#2563eb'); // Royal Blue
            litmusGrad.addColorStop(1, '#3b82f6');
          } else {
            litmusGrad.addColorStop(0, '#2563eb'); // Bottom is Blue
            litmusGrad.addColorStop(progress, '#3b82f6');
            litmusGrad.addColorStop(Math.min(1.0, progress + 0.1), '#f43f5e');
            litmusGrad.addColorStop(1, '#e11d48');
          }

          ctx.fillStyle = litmusGrad;
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 2);
          ctx.fill();

          ctx.strokeStyle = progress > 0.5 ? '#1e40af' : '#9f1239';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 3. Water droplets on paper surface indicating moisture ("quỳ tím ẨM")
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(px + 3, py + 12, 1.5, 0, Math.PI * 2);
          ctx.arc(px + 9, py + 30, 1.8, 0, Math.PI * 2);
          ctx.arc(px + 4, py + 52, 1.4, 0, Math.PI * 2);
          ctx.fill();

          // 4. Callout Badge pointing to the paper strip, unrotated for perfect readability
          const labelX = halfW + 12; // Right of the tube
          const labelY = py + ph / 2;

          // Pointer line
          ctx.strokeStyle = progress > 0.5 ? '#60a5fa' : '#f472b6';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(px + pw, labelY);
          ctx.lineTo(labelX, labelY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Unrotated Callout Badge Text
          ctx.save();
          ctx.translate(labelX, labelY);
          if (eq.angle !== 0) {
            ctx.rotate((-eq.angle * Math.PI) / 180);
          }

          const paperText = progress > 0.3 ? '✨ Quỳ tím ẩm → HÓA XANH (NH₃)' : '📄 Giấy quỳ tím ẩm (Đỏ)';
          ctx.font = 'bold 9px sans-serif';
          const tw = ctx.measureText(paperText).width;
          const bw = tw + 12;
          const bh = 18;

          ctx.fillStyle = progress > 0.3 ? 'rgba(30, 58, 138, 0.92)' : 'rgba(136, 19, 55, 0.92)';
          ctx.strokeStyle = progress > 0.3 ? '#3b82f6' : '#fb7185';
          ctx.lineWidth = 1.2;

          ctx.beginPath();
          ctx.roundRect(0, -bh / 2, bw, bh, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(paperText, 6, 0);

          ctx.restore();
        }

        // 1. Dry Paper Strip (Giấy màu khô) - Left Neck
        if (eq.hasDryPaper) {
          const px = -12;
          const py = 12;
          const pw = 8;
          const ph = 38;

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 4, -2);
          ctx.lineTo(px + 4, py);
          ctx.stroke();

          ctx.fillStyle = '#a855f7'; // Purple dry paper strip
          ctx.fillRect(px, py, pw, ph);
          ctx.strokeStyle = '#7e22ce';
          ctx.strokeRect(px, py, pw, ph);

          ctx.font = 'bold 8px sans-serif';
          ctx.fillStyle = '#c084fc';
          ctx.textAlign = 'right';
          ctx.fillText('Giấy tím khô', px - 2, py + 16);
          ctx.font = 'bold 7px sans-serif';
          ctx.fillStyle = '#e9d5ff';
          ctx.fillText('(Không đổi màu)', px - 2, py + 26);
        }

        // 2. Wet Paper Strip (Giấy màu tím ẩm) - Right Neck
        if (eq.hasWetPaper) {
          const px = 4;
          const py = 12;
          const pw = 8;
          const ph = 38;

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 4, -2);
          ctx.lineTo(px + 4, py);
          ctx.stroke();

          const bleach = Math.min(1.0, eq.wetPaperBleachProgress || 0);

          // Interpolate from Purple (#a855f7 -> rgb(168, 85, 247)) to Pure White (#ffffff -> rgb(255, 255, 255))
          const r = Math.round(168 + (255 - 168) * bleach);
          const g = Math.round(85 + (255 - 85) * bleach);
          const b = Math.round(247 + (255 - 247) * bleach);

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(px, py, pw, ph);
          ctx.strokeStyle = bleach > 0.8 ? '#e2e8f0' : '#7e22ce';
          ctx.strokeRect(px, py, pw, ph);

          if (bleach < 0.95) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
            ctx.beginPath();
            ctx.arc(px + 2, py + 8, 1.2, 0, Math.PI * 2);
            ctx.arc(px + 6, py + 22, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'left';
          if (bleach >= 0.85) {
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('GIẤY ẨM MẤT MÀU TÍM!', px + pw + 3, py + 16);
            ctx.font = 'bold 7px sans-serif';
            ctx.fillStyle = '#a5f3fc';
            ctx.fillText('(Cl₂ + H₂O → HCl + HClO)', px + pw + 3, py + 26);
          } else {
            ctx.fillStyle = '#c084fc';
            ctx.fillText(`Giấy tím ẩm (${Math.round(bleach * 100)}%)`, px + pw + 3, py + 20);
          }
        }

        ctx.restore();
      }
    } else if (eq.type.startsWith('round_flask')) {
      if (eq.type === 'round_flask_2neck') {
        // Main central neck
        const nW = 14;
        const cy = h - halfW;
        const angL = 2 * Math.PI - Math.acos(-nW / halfW);
        const angR = 2 * Math.PI - Math.acos(nW / halfW);
        const nY = cy + Math.sin(angL) * halfW;
        ctx.moveTo(-nW, 0);
        ctx.lineTo(-nW, nY);
        ctx.arc(0, cy, halfW, angL, angR, true);
        ctx.lineTo(nW, 0);
        ctx.stroke();

        // Rim for central neck
        ctx.strokeRect(-17, -4, 34, 4);

        // 2nd neck (Cổ phụ bên phải)
        ctx.beginPath();
        ctx.moveTo(22, 52);
        ctx.lineTo(32, 10);
        ctx.moveTo(34, 58);
        ctx.lineTo(44, 12);
        ctx.stroke();
        // Rim for 2nd neck
        ctx.strokeRect(30, 6, 16, 4);
      } else if (eq.type === 'round_flask_1arm') {
        // Standard central neck & spherical bulb body
        const nW = 18;
        const cy = h - halfW;
        const angL = 2 * Math.PI - Math.acos(-nW / halfW);
        const angR = 2 * Math.PI - Math.acos(nW / halfW);
        const nY = cy + Math.sin(angL) * halfW;
        ctx.moveTo(-nW, 0);
        ctx.lineTo(-nW, nY);
        ctx.arc(0, cy, halfW, angL, angR, true);
        ctx.lineTo(nW, 0);
        ctx.stroke();

        
        // Main neck rim
        ctx.strokeRect(-21, -4, 42, 4);

        if (eq.type === 'round_flask_1arm' || eq.name.includes('NH4Cl')) {
          ctx.save();
          ctx.fillStyle = '#334155'; // Dark rubber stopper
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-16, -10);
          ctx.lineTo(16, -10);
          ctx.lineTo(14, 2);
          ctx.lineTo(-14, 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Rubber stopper highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(-14, -9, 28, 2);

          // Glass tube holes through stopper
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-1.5, -11, 3, 14); // Central single tube hole

          // Label
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Nút bịt kín', 0, -13);
          ctx.restore();
        }


        // 1 side arm branch (nhánh chưng cất phụ nghiêng)
        ctx.beginPath();
        ctx.moveTo(18, 20);
        ctx.lineTo(halfW + 30, 36);
        ctx.moveTo(18, 28);
        ctx.lineTo(halfW + 30, 44);
        ctx.stroke();

        // Side arm tip rim
        ctx.strokeRect(halfW + 28, 34, 4, 12);
      } else {
        // Standard 0-branch round flask
        const nW = 18;
        const cy = h - halfW;
        const angL = 2 * Math.PI - Math.acos(-nW / halfW);
        const angR = 2 * Math.PI - Math.acos(nW / halfW);
        const nY = cy + Math.sin(angL) * halfW;
        ctx.moveTo(-nW, 0);
        ctx.lineTo(-nW, nY);
        ctx.arc(0, cy, halfW, angL, angR, true);
        ctx.lineTo(nW, 0);
        ctx.stroke();
        ctx.strokeRect(-21, -4, 42, 4);
      }

      // Render Dropping Funnel (Phễu nhỏ giọt có khóa) fitted on central neck
      if (eq.hasDroppingFunnel || (eq.name.includes('Phễu') && eq.type !== 'pipette') || eq.name.includes('MnO2')) {
        ctx.save();
        
        // Stem down into neck
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(0, 30);
        ctx.stroke();

        // Stopcock Valve (Khóa xoay phễu)
        const isValveOpen = !!eq.valveOpen;
        ctx.fillStyle = isValveOpen ? '#22c55e' : '#ef4444';
        ctx.fillRect(-10, -18, 20, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -18, 20, 6);

        // Upper Funnel Bulb Reservoir (Teardrop / Pear bulb holding HCl đặc)
        ctx.beginPath();
        ctx.moveTo(-3, -22);
        ctx.lineTo(-14, -38);
        ctx.arc(0, -48, 14, Math.PI, 0, false);
        ctx.lineTo(3, -22);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Liquid inside funnel bulb (HCl đặc - pale yellow amber, H2SO4 - colorless/pale)
        const isH2SO4Funnel = eq.name.includes('H2SO4');
        const funnelAxit = isH2SO4Funnel ? 'H₂SO₄' : 'HCl';
        ctx.fillStyle = isH2SO4Funnel ? 'rgba(240, 248, 255, 0.75)' : 'rgba(254, 240, 138, 0.75)';
        ctx.beginPath();
        ctx.moveTo(-2, -22);
        ctx.lineTo(-11, -35);
        ctx.arc(0, -43, 11, Math.PI * 0.9, Math.PI * 0.1, false);
        ctx.lineTo(2, -22);
        ctx.closePath();
        ctx.fill();

        // Top funnel rim & stopper cap
        ctx.strokeRect(-8, -64, 16, 4);

        // Status Label
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isValveOpen ? '#4ade80' : '#f87171';
        ctx.fillText(isValveOpen ? `💧 Phễu ${funnelAxit} (Đang Nhỏ)` : `🔒 Phễu ${funnelAxit} (Đang Khóa)`, 0, -70);

        // Animated dripping drops when valve is open
        if (isValveOpen) {
          const time = (Date.now() * 0.008) % 1;
          const dropY = -12 + time * 42;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, dropY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    } else if (eq.type === 'test_tube') {
      ctx.moveTo(-halfW, 0);
      ctx.lineTo(-halfW, h - halfW);
      ctx.arc(0, h - halfW, halfW, Math.PI, 0, true);
      ctx.lineTo(halfW, 0);
      ctx.stroke();
      ctx.strokeRect(-halfW - 2, -3, w + 4, 3);
      
      if (eq.hasStopper) {
        ctx.fillStyle = '#334155'; // Dark rubber stopper
        ctx.beginPath();
        ctx.moveTo(-halfW - 1, -14);
        ctx.lineTo(halfW + 1, -14);
        ctx.lineTo(halfW - 2, 4);
        ctx.lineTo(-halfW + 2, 4);
        ctx.fill();
        // Hole for glass tube
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, -14, 4, 18);
      }
    } else {
      ctx.strokeRect(-halfW, 0, w, h);
      ctx.strokeRect(-halfW - 3, -3, w + 6, 3);
    }

    // Render Cotton Plug (Bông y tế tẩm NaOH) on neck if erlenmeyer is receiving flask or contains NaOH
    if (eq.name.toLowerCase().includes('bông')) {
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-8, -2, 7, 0, Math.PI * 2);
      ctx.arc(0, -5, 8, 0, Math.PI * 2);
      ctx.arc(8, -2, 7, 0, Math.PI * 2);
      ctx.arc(0, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Label "Bông tẩm NaOH"
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Bông NaOH', 0, -14);
      ctx.restore();
    }

    // Render Cl2 / CO2 / NH3 Heavy Gas Fill Layer accumulating from bottom up
    const gasFillRatio = Math.min(1.0, eq.gasFillLevel || 0);
    if (gasFillRatio > 0.02) {
      ctx.save();
      const gasH = (h - 12) * gasFillRatio;
      const gasTopY = h - gasH;

      const isCo2Container = eq.isCo2Collector || eq.name.includes('CO2');
      const isNH3Container = eq.name.includes('NH3') || eq.name.includes('Úp ngược');

      const gasGrad = ctx.createLinearGradient(0, h, 0, gasTopY);
      if (isCo2Container) {
        gasGrad.addColorStop(0, 'rgba(186, 230, 253, 0.65)'); // Soft sky-blue tint for CO2 gas layer
        gasGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.50)');
        gasGrad.addColorStop(1.0, 'rgba(226, 232, 240, 0.30)');
      } else if (isNH3Container) {
        gasGrad.addColorStop(0, 'rgba(241, 245, 249, 0.8)'); // White-grey tint for NH3 gas
        gasGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.6)');
        gasGrad.addColorStop(1.0, 'rgba(203, 213, 225, 0.4)');
      } else {
        gasGrad.addColorStop(0, 'rgba(163, 230, 53, 0.75)');
        gasGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.55)');
        gasGrad.addColorStop(1.0, 'rgba(163, 230, 53, 0.35)');
      }

      ctx.fillStyle = gasGrad;
      ctx.beginPath();
      ctx.moveTo(-15 + (1 - gasFillRatio) * (-halfW + 25), gasTopY);
      ctx.lineTo(-halfW + 4, h - 8);
      ctx.quadraticCurveTo(-halfW + 4, h, -halfW + 10, h);
      ctx.lineTo(halfW - 10, h);
      ctx.quadraticCurveTo(halfW - 4, h, halfW - 4, h - 8);
      ctx.lineTo(15 - (1 - gasFillRatio) * (15 - halfW + 10), gasTopY);
      ctx.closePath();
      ctx.fill();

      // Density Gradient Animated Wisp Wave at Gas Top Boundary
      if ((isCo2Container || isNH3Container) && gasFillRatio > 0.05) {
        const waveTime = Date.now() * 0.004;
        ctx.strokeStyle = isNH3Container ? 'rgba(226, 232, 240, 0.4)' : 'rgba(241, 245, 249, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const startX = -12 + (1 - gasFillRatio) * (-halfW + 22);
        const endX = 12 - (1 - gasFillRatio) * (12 - halfW + 8);
        ctx.moveTo(startX, gasTopY);
        for (let wx = startX; wx <= endX; wx += 4) {
          const wy = gasTopY + Math.sin(waveTime * 3 + wx * 0.15) * 2.2;
          ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = isNH3Container ? '#cbd5e1' : (isCo2Container ? '#f1f5f9' : '#fef08a');
      ctx.textAlign = 'center';
      
      let fillText = '';
      if (isNH3Container) {
        fillText = `Khí NH₃ (${Math.round(gasFillRatio * 100)}% đầy bình)`;
      } else if (isCo2Container) {
        fillText = `Chứa: Khí CO₂ khô (Dời chỗ KH)`;
      } else {
        fillText = `Khí Cl₂ (${Math.round(gasFillRatio * 100)}% đầy bình)`;
      }
      
      // NH3 is inverted, mouth at 0, bottom at h. Rotate text so it's readable.
      if (isNH3Container) {
        ctx.save();
        // Translate to the visual top of the gas
        ctx.translate(0, gasTopY + 12);
        // Reverse the test tube's 180 degree rotation to draw upright text
        ctx.rotate(-Math.PI);
        ctx.fillText(fillText, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(fillText, 0, Math.max(25, gasTopY + 12));
      }

      ctx.restore();
    }

    // Render Paper Strips (Giấy màu khô, Giấy màu ẩm, Giấy quỳ tím ẩm)
    if (eq.hasDryPaper || eq.hasWetPaper || eq.hasRedLitmus) {
      ctx.save();

      if (eq.hasRedLitmus) {
        // NH3 test tube is inverted (angle=180). Mouth is at local y=0, closed top at local y=h.
        const progress = Math.min(1.0, Math.max(0, eq.redLitmusColorProgress || 0));

        // 1. Suspension thread & clip holding the paper strip inside the inverted tube
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 22);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 22, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Moist Red Litmus Paper Strip (wider, centered & clearly visible!)
        const pw = 12; // 12px wide
        const ph = 68; // 68px tall
        const px = -pw / 2; // Centered inside test tube
        const py = 24;

        // Gradient: Bottom turns blue first as NH3 gas rises up from mouth
        const litmusGrad = ctx.createLinearGradient(0, py + ph, 0, py);
        if (progress <= 0) {
          litmusGrad.addColorStop(0, '#f43f5e'); // Rose Red
          litmusGrad.addColorStop(1, '#e11d48');
        } else if (progress >= 1) {
          litmusGrad.addColorStop(0, '#2563eb'); // Royal Blue
          litmusGrad.addColorStop(1, '#3b82f6');
        } else {
          litmusGrad.addColorStop(0, '#2563eb'); // Bottom is Blue
          litmusGrad.addColorStop(progress, '#3b82f6');
          litmusGrad.addColorStop(Math.min(1.0, progress + 0.1), '#f43f5e');
          litmusGrad.addColorStop(1, '#e11d48');
        }

        ctx.fillStyle = litmusGrad;
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 2);
        ctx.fill();

        ctx.strokeStyle = progress > 0.5 ? '#1e40af' : '#9f1239';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Water droplets on paper surface indicating moisture ("quỳ tím ẨM")
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(px + 3, py + 12, 1.5, 0, Math.PI * 2);
        ctx.arc(px + 9, py + 30, 1.8, 0, Math.PI * 2);
        ctx.arc(px + 4, py + 52, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // 4. Callout Badge pointing to the paper strip, unrotated for perfect readability
        const labelX = halfW + 12; // Right of the tube
        const labelY = py + ph / 2;

        // Pointer line
        ctx.strokeStyle = progress > 0.5 ? '#60a5fa' : '#f472b6';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(px + pw, labelY);
        ctx.lineTo(labelX, labelY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Unrotated Callout Badge Text
        ctx.save();
        ctx.translate(labelX, labelY);
        if (eq.angle !== 0) {
          ctx.rotate((-eq.angle * Math.PI) / 180);
        }

        const paperText = progress > 0.3 ? '✨ Quỳ tím ẩm → HÓA XANH (NH₃)' : '📄 Giấy quỳ tím ẩm (Đỏ)';
        ctx.font = 'bold 9px sans-serif';
        const tw = ctx.measureText(paperText).width;
        const bw = tw + 12;
        const bh = 18;

        ctx.fillStyle = progress > 0.3 ? 'rgba(30, 58, 138, 0.92)' : 'rgba(136, 19, 55, 0.92)';
        ctx.strokeStyle = progress > 0.3 ? '#3b82f6' : '#fb7185';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.roundRect(0, -bh / 2, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(paperText, 6, 0);

        ctx.restore();
      }

      // 1. Dry Paper Strip (Giấy màu khô) - Left Neck
      if (eq.hasDryPaper) {
        const px = -12;
        const py = 12;
        const pw = 8;
        const ph = 38;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 4, -2);
        ctx.lineTo(px + 4, py);
        ctx.stroke();

        ctx.fillStyle = '#a855f7'; // Purple dry paper strip
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = '#7e22ce';
        ctx.strokeRect(px, py, pw, ph);

        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#c084fc';
        ctx.textAlign = 'right';
        ctx.fillText('Giấy tím khô', px - 2, py + 16);
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#e9d5ff';
        ctx.fillText('(Không đổi màu)', px - 2, py + 26);
      }

      // 2. Wet Paper Strip (Giấy màu tím ẩm) - Right Neck
      if (eq.hasWetPaper) {
        const px = 4;
        const py = 12;
        const pw = 8;
        const ph = 38;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 4, -2);
        ctx.lineTo(px + 4, py);
        ctx.stroke();

        const bleach = Math.min(1.0, eq.wetPaperBleachProgress || 0);

        // Interpolate from Purple (#a855f7 -> rgb(168, 85, 247)) to Pure White (#ffffff -> rgb(255, 255, 255))
        const r = Math.round(168 + (255 - 168) * bleach);
        const g = Math.round(85 + (255 - 85) * bleach);
        const b = Math.round(247 + (255 - 247) * bleach);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = bleach > 0.8 ? '#e2e8f0' : '#7e22ce';
        ctx.strokeRect(px, py, pw, ph);

        if (bleach < 0.95) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.beginPath();
          ctx.arc(px + 2, py + 8, 1.2, 0, Math.PI * 2);
          ctx.arc(px + 6, py + 22, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'left';
        if (bleach >= 0.85) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('GIẤY ẨM MẤT MÀU TÍM!', px + pw + 3, py + 16);
          ctx.font = 'bold 7px sans-serif';
          ctx.fillStyle = '#a5f3fc';
          ctx.fillText('(Cl₂ + H₂O → HCl + HClO)', px + pw + 3, py + 26);
        } else {
          ctx.fillStyle = '#c084fc';
          ctx.fillText(`Giấy tím ẩm (${Math.round(bleach * 100)}%)`, px + pw + 3, py + 20);
        }
      }

      ctx.restore();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let y = h - 20; y > 20; y -= 20) {
      ctx.beginPath();
      ctx.moveTo(halfW - 12, y);
      ctx.lineTo(halfW - 2, y);
      ctx.stroke();
    }

    // Parameter HUD Badge below container
    const volStr = `${eq.content.volumeMl.toFixed(1)} mL`;
    const labelStr = getContainerLabelStr(eq);

    const statParts: string[] = [volStr];
    if (!isExp3 && eq.content.volumeMl > 0) {
      statParts.push(`pH ${eq.content.pH.toFixed(2)}`);
    }
    if (eq.content.precipitates.length > 0) {
      const precipList = eq.content.precipitates
        .filter((p) => p.massGram > 0.01)
        .map((p) => `${formatFormula(p.formula)} ${p.massGram.toFixed(1)}g`);
      if (precipList.length > 0) {
        statParts.push(`↓ ${precipList.join(', ')}`);
      }
    }
    if (eq.content.activeGas) {
      statParts.push(`↑ ${formatFormula(eq.content.activeGas.formula)}`);
    }
    if (eq.content.temperatureC > 30) {
      statParts.push(`🌡️ ${eq.content.temperatureC.toFixed(0)}°C`);
    }

    const badgeText = `${labelStr}: ${statParts.join(' | ')}`;

    ctx.font = 'bold 11px sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = Math.max(textWidth + 16, 70);
    const badgeH = 20;

    ctx.save();
    if (eq.angle !== 0) {
      // Un-rotate Parameter HUD Badge for inverted/tilted test tubes
      ctx.translate(0, h + 16);
      ctx.rotate((-eq.angle * Math.PI) / 180);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 10);
      ctx.fill();

      let borderColor = 'rgba(148, 163, 184, 0.5)';
      if (!isExp3 && eq.content.volumeMl > 0) {
        if (eq.content.pH < 6.5) borderColor = 'rgba(248, 113, 113, 0.8)';
        else if (eq.content.pH > 7.5) borderColor = 'rgba(96, 165, 250, 0.8)';
        else borderColor = 'rgba(52, 211, 153, 0.8)';
      }
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 0, 0);
    } else {
      // Normal angle = 0
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, h + 8, badgeW, badgeH, 10);
      ctx.fill();

      let borderColor = 'rgba(148, 163, 184, 0.5)';
      if (!isExp3 && eq.content.volumeMl > 0) {
        if (eq.content.pH < 6.5) borderColor = 'rgba(248, 113, 113, 0.8)';
        else if (eq.content.pH > 7.5) borderColor = 'rgba(96, 165, 250, 0.8)';
        else borderColor = 'rgba(52, 211, 153, 0.8)';
      }
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 0, h + 8 + badgeH / 2);
    }
    ctx.restore();
  };

  // Upgraded Pipette Renderer
  const drawPipetteGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const h = eq.height;
    const squeeze = eq.squeezeBulbRatio || 0;

    // Glass Stem Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 25);
    ctx.lineTo(-5, h - 20);
    ctx.lineTo(-1.5, h);
    ctx.lineTo(1.5, h);
    ctx.lineTo(5, h - 20);
    ctx.lineTo(5, 25);
    ctx.stroke();

    // Glass reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-3, 27, 2, h - 50);

    // Graduation marks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    for (let y = 35; y <= h - 25; y += 12) {
      ctx.beginPath();
      ctx.moveTo(-5, y);
      ctx.lineTo(-2, y);
      ctx.stroke();
    }

    // Rubber Bulb (Đầu bóp cao su)
    const bulbR = 14 * (1 - squeeze * 0.25);
    const bulbH = 14 * (1 + squeeze * 0.2);
    const bulbGrad = ctx.createRadialGradient(-3, 10 - squeeze * 3, 2, 0, 10, bulbR);
    bulbGrad.addColorStop(0, '#f87171');
    bulbGrad.addColorStop(0.7, '#dc2626');
    bulbGrad.addColorStop(1, '#991b1b');

    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.ellipse(0, 12, bulbR, bulbH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Mode Pill Badge above Rubber Bulb
    const isSuckP = (eq.suckedContent?.volumeMl || 0) <= 0;
    const pModeStr = isSuckP ? '💧 Nhấp lọ để HÚT axit' : '💧 Nhấp bình để THẢ axit';
    ctx.save();
    ctx.font = 'bold 10px sans-serif';
    const mwP = ctx.measureText(pModeStr).width + 12;
    ctx.fillStyle = isSuckP ? 'rgba(14, 116, 144, 0.95)' : 'rgba(16, 185, 129, 0.95)';
    ctx.beginPath();
    ctx.roundRect(-mwP / 2, -18, mwP, 18, 9);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pModeStr, 0, -9);
    ctx.restore();

    // Glass Stem Capacity Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${eq.capacityMl || 10}mL`, -7, 42);

    // Sucked Liquid inside glass stem
    if (eq.suckedContent && eq.suckedContent.volumeMl > 0) {
      const pipCap = eq.capacityMl || 10.0;
      const fillRatio = Math.min(1.0, eq.suckedContent.volumeMl / pipCap);
      const liquidH = (h - 45) * fillRatio;
      const { r, g, b, a } = eq.suckedContent.colorRgba;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.7, a)})`;
      ctx.fillRect(-4, h - 20 - liquidH, 8, liquidH);

      // Liquid meniscus at top
      ctx.fillStyle = `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.9)`;
      ctx.beginPath();
      ctx.ellipse(0, h - 20 - liquidH, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Text label displaying sucked volume and chemical label
      const chemStr = getContainerLabelStr({ content: eq.suckedContent } as any) || 'Dung dịch';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${chemStr} (${eq.suckedContent.volumeMl.toFixed(1)} mL)`, 10, h - 20 - liquidH / 2);
    }
  };

  // Upgraded Vertical Spatula / Spoon Renderer (Muỗng lấy hóa chất chất rắn dài đặt dọc)
  const drawSpatulaGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const h = eq.height;
    ctx.save();

    const tilt = eq.tiltAngle || 0;
    if (tilt !== 0) {
      ctx.rotate((tilt * Math.PI) / 180);
    }

    // 1. Long Vertical Metallic Handle (from y = 0 to y = h - 28)
    const handleGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    handleGrad.addColorStop(0, '#e2e8f0');
    handleGrad.addColorStop(0.3, '#f8fafc');
    handleGrad.addColorStop(0.7, '#94a3b8');
    handleGrad.addColorStop(1, '#475569');

    ctx.fillStyle = handleGrad;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, h - 28, 3);
    ctx.fill();

    // Metallic highlight line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(-1.5, 4, 1.5, h - 34);

    // Handle Top Cap
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 4, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Mode Pill Badge above Handle Cap
    const sModeStr = (eq.toolMode || ((eq.spatulaContent?.amountGram || 0) > 0 ? 'DISPENSE' : 'SUCK')) === 'SUCK' ? '🥄 MÚC' : '🥄 TRÚT';
    const isSuckS = sModeStr.includes('MÚC');
    ctx.save();
    ctx.font = 'bold 10px sans-serif';
    const mwS = ctx.measureText(sModeStr).width + 10;
    ctx.fillStyle = isSuckS ? 'rgba(14, 116, 144, 0.95)' : 'rgba(16, 185, 129, 0.95)';
    ctx.beginPath();
    ctx.roundRect(-mwS / 2, -18, mwS, 16, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sModeStr, 0, -10);
    ctx.restore();

    // 2. Spoon Bowl / Scoop Head at bottom
    const bowlY = h - 18;
    const spoonGrad = ctx.createRadialGradient(-3, bowlY - 3, 2, 0, bowlY, 14);
    spoonGrad.addColorStop(0, '#ffffff');
    spoonGrad.addColorStop(0.5, '#cbd5e1');
    spoonGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = spoonGrad;
    ctx.beginPath();
    ctx.ellipse(0, bowlY, 11, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner bowl depth shading
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, bowlY + 2, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Powder Heap inside Spoon Bowl when loaded
    if (eq.spatulaContent && eq.spatulaContent.amountGram > 0) {
      const heapRatio = Math.min(1.0, eq.spatulaContent.amountGram / 5.0);
      const heapR = 10 * heapRatio;
      const heapH = 13 * heapRatio;

      ctx.fillStyle = eq.spatulaContent.color || '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, bowlY - 1, heapR, heapH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Powder texture granules
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let i = 0; i < 7; i++) {
        const dx = Math.sin(i * 3.5) * heapR * 0.6;
        const dy = Math.cos(i * 2.1) * heapH * 0.6;
        ctx.fillRect(dx, bowlY - 1 + dy, 1.5, 1.5);
      }

      // Mass label next to spoon
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${eq.spatulaContent.amountGram.toFixed(1)}g`, 14, bowlY + 4);
    }

    ctx.restore();
  };

  // Burette Renderer
  const drawBuretteGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const halfW = eq.width / 2;
    const h = eq.height;
    const bodyH = h - 35; // Glass tube body height

    // 1. Liquid Fill inside Tube
    const fillRatio = Math.min(1.0, eq.content.volumeMl / (eq.capacityMl || 50));
    const liquidH = bodyH * fillRatio;

    if (liquidH > 0.5) {
      const { r, g, b, a } = eq.content.colorRgba;
      const liquidTopY = bodyH - liquidH;

      // Liquid Body Gradient
      const liqGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
      liqGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(1.0, (a || 0.6) + 0.25)})`);
      liqGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${Math.max(0.4, (a || 0.6) * 0.75)})`);
      liqGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${Math.min(1.0, (a || 0.6) + 0.2)})`);

      ctx.fillStyle = liqGrad;
      ctx.beginPath();
      ctx.rect(-halfW + 2, liquidTopY, eq.width - 4, liquidH);
      ctx.fill();

      // Curved Meniscus surface at top of liquid
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
      ctx.beginPath();
      ctx.ellipse(0, liquidTopY, halfW - 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Liquid column shine reflection line
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-halfW + 3, liquidTopY, 2.5, liquidH);
    }

    // 2. Main Glass Tube Outline & Glass Highlights
    const glassGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    glassGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.1)');
    glassGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.35)');

    ctx.fillStyle = glassGrad;
    ctx.fillRect(-halfW, 0, eq.width, bodyH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW, 0, eq.width, bodyH);

    // Top Flared Funnel Mouth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-halfW - 3, -4);
    ctx.lineTo(halfW + 3, -4);
    ctx.lineTo(halfW, 0);
    ctx.lineTo(-halfW, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Graduation Marks & Scale Numbers (0 to 50 mL)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'right';

    const totalCap = eq.capacityMl || 50;
    const numSteps = 5;
    for (let i = 0; i <= numSteps; i++) {
      const val = (totalCap / numSteps) * i;
      const y = (bodyH / numSteps) * i;

      // Major tick
      ctx.beginPath();
      ctx.moveTo(halfW - 2, y);
      ctx.lineTo(halfW - 8, y);
      ctx.stroke();

      ctx.fillText(`${val.toFixed(0)}`, halfW - 9, y + 3);

      // Minor ticks
      if (i < numSteps) {
        for (let j = 1; j < 5; j++) {
          const subY = y + (bodyH / numSteps / 5) * j;
          ctx.beginPath();
          ctx.moveTo(halfW - 2, subY);
          ctx.lineTo(halfW - 5, subY);
          ctx.stroke();
        }
      }
    }

    // 4. Bottom Tapered Tip & Nozzle
    ctx.beginPath();
    ctx.moveTo(-halfW, bodyH);
    ctx.lineTo(-3, h - 12);
    ctx.lineTo(-2, h);
    ctx.lineTo(2, h);
    ctx.lineTo(3, h - 12);
    ctx.lineTo(halfW, bodyH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Stopcock / Valve Housing (Khóa buret)
    const valveY = bodyH + 8;
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(-8, valveY - 5, 16, 10, 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Valve handle (Red key)
    ctx.save();
    ctx.translate(0, valveY);
    if (eq.valveOpen) {
      // Vertical handle (OPEN)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(-3, -12, 6, 24, 3);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Red knob end
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -12, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Horizontal handle (CLOSED)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-14, -3, 28, 6, 3);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Valve knob
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(14, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 6. Forming Droplet at Tip if valve is open and has liquid
    if (eq.valveOpen && eq.content.volumeMl > 0) {
      const { r, g, b, a } = eq.content.colorRgba;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.85, a)})`;
      ctx.beginPath();
      ctx.ellipse(0, h + 2, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Text Badge showing Chemical Name & Volume (Hóa chất & Thể tích mL trong Buret)
    const chemName = getContainerLabelStr(eq) || (eq.content.volumeMl > 0 ? 'Dung dịch' : 'Trống');
    const volStr = `${eq.content.volumeMl.toFixed(1)} / ${eq.capacityMl || 50} mL`;
    const labelBadgeText = `${chemName} (${volStr})`;

    ctx.save();
    ctx.font = 'bold 10px sans-serif';
    const textWidth = ctx.measureText(labelBadgeText).width;
    const badgeW = textWidth + 16;
    const badgeX = -halfW - badgeW - 8;
    const badgeY = bodyH * 0.35;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, 20, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const primaryChem = getContainerPrimaryChemical(eq);
    const chemColorInfo = primaryChem ? getChemicalColorInfo(primaryChem.id) : null;
    if (chemColorInfo && eq.content.volumeMl > 0) {
      ctx.fillStyle = chemColorInfo.badgeColor;
      ctx.beginPath();
      ctx.arc(badgeX + 8, badgeY + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelBadgeText, badgeX + (chemColorInfo && eq.content.volumeMl > 0 ? 16 : 8), badgeY + 10);
    ctx.restore();
  };

  // Glass Rod Renderer (Cải tiến icon đũa thủy tinh sáng bóng, có nút tròn cầm ở đỉnh)
  const drawGlassRodGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const h = eq.height;

    // 1. Main Transparent Glass Body
    const rodGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    rodGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    rodGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.6)');
    rodGrad.addColorStop(0.7, 'rgba(224, 242, 254, 0.4)');
    rodGrad.addColorStop(1, 'rgba(148, 163, 184, 0.85)');

    ctx.fillStyle = rodGrad;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, h, 3.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glass refraction highlight line down the middle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1, 8);
    ctx.lineTo(-1, h - 8);
    ctx.stroke();

    // 2. Rounded Glass Bulb / Knob at Top End
    const topBulbGrad = ctx.createRadialGradient(-1, 3, 1, 0, 4, 7);
    topBulbGrad.addColorStop(0, '#ffffff');
    topBulbGrad.addColorStop(0.5, '#7dd3fc');
    topBulbGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = topBulbGrad;
    ctx.beginPath();
    ctx.arc(0, 4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Rounded Smooth Tip at Bottom End
    ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
    ctx.beginPath();
    ctx.arc(0, h - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    if (eq.isStirring) {
      // Swirling cyan aura around glass rod body
      const time = Date.now() * 0.01;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let y = 12; y < h - 12; y += 4) {
        const x = Math.sin(y * 0.12 + time) * 8;
        if (y === 12) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Top Badge indicator
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      const modeStr = '🌀 ĐANG KHUẤY & TÁCH LỚP';
      const mw = ctx.measureText(modeStr).width + 10;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.95)';
      ctx.beginPath();
      ctx.roundRect(-mw / 2, -18, mw, 16, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(modeStr, 0, -10);
      ctx.restore();
    }
  };

  // Fabric Strip Renderer (Mẩu vải màu thử tính tẩy của Nước Javel)
  const drawFabricStripGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const w = eq.width || 80;
    const h = eq.height || 30;
    const halfW = w / 2;
    const bleachProgress = eq.fabricBleachProgress || 0;
    const baseColor = eq.fabricColor || '#D32F2F';

    ctx.save();

    // 1. Drop shadow underneath fabric strip
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // 2. Base Fabric Strip Body
    ctx.beginPath();
    ctx.roundRect(-halfW, 0, w, h, 4);

    if (bleachProgress <= 0) {
      ctx.fillStyle = baseColor;
      ctx.fill();
    } else {
      // Bleaching Radial Gradient: White center expanding outwards
      const maxR = Math.hypot(w / 2, h / 2);
      const rInner = Math.max(0, maxR * bleachProgress * 0.75);
      const rOuter = Math.max(rInner + 6, maxR * Math.min(1.25, bleachProgress * 1.3));

      const bleachGrad = ctx.createRadialGradient(0, h / 2, 0, 0, h / 2, rOuter);
      bleachGrad.addColorStop(0, '#ffffff'); // Pure White #FFFFFF
      bleachGrad.addColorStop(Math.min(0.9, 0.7 * bleachProgress), '#ffffff');
      bleachGrad.addColorStop(Math.min(1.0, 0.7 * bleachProgress + 0.3), baseColor);
      bleachGrad.addColorStop(1.0, baseColor);

      ctx.fillStyle = bleachGrad;
      ctx.fill();
    }

    ctx.shadowColor = 'transparent';

    // 3. Fabric Textile Pattern / Weave Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let x = -halfW + 6; x < halfW; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 2);
      ctx.lineTo(x, h - 2);
      ctx.stroke();
    }

    // Border stroke around fabric strip
    ctx.strokeStyle = bleachProgress > 0.5 ? '#cbd5e1' : '#991b1b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, 0, w, h);

    // 4. Status Badge above Fabric Strip
    ctx.font = 'bold 10px sans-serif';
    const isFullyBleached = bleachProgress >= 0.99;
    const badgeText = isFullyBleached
      ? '✨ Mẩu vải bị TẨY TRẮNG (#FFFFFF)'
      : bleachProgress > 0
      ? `⚡ Đang loang tẩy màu (${Math.round(bleachProgress * 100)}%)...`
      : '👔 Mẩu vải màu (Thử tính tẩy Javel)';
    const textW = ctx.measureText(badgeText).width + 12;

    ctx.fillStyle = isFullyBleached
      ? 'rgba(15, 23, 42, 0.95)'
      : bleachProgress > 0
      ? 'rgba(217, 119, 6, 0.95)'
      : 'rgba(185, 28, 28, 0.95)';
    ctx.beginPath();
    ctx.roundRect(-textW / 2, -18, textW, 16, 8);
    ctx.fill();

    ctx.strokeStyle = isFullyBleached ? '#ffffff' : bleachProgress > 0 ? '#fef08a' : '#fca5a5';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, -10);

    ctx.restore();
  };

  // Wooden Splint Renderer (Que đốm thử khí O2, H2)
  const drawWoodenSplintGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    if (eq.hasFabricStrip) {
      drawFabricStripGraphics(ctx, eq);
      return;
    }
    const h = eq.height;
    const splintState = eq.splintState || 'BURNING';
    const flameColor = eq.flameColor || 'orange';

    // 1. Wooden Stick Body
    const stickGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    stickGrad.addColorStop(0, '#fde68a');
    stickGrad.addColorStop(0.5, '#d97706');
    stickGrad.addColorStop(1, '#92400e');

    ctx.fillStyle = stickGrad;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, h, 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 2. Charred / Ember Tip at Top End (y = 0)
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Flame or Glowing Ember Effects
    if (splintState === 'GLOWING') {
      // Tàn đỏ (Glowing Red Ember for Oxygen Test)
      const emberGrad = ctx.createRadialGradient(0, 3, 0.5, 0, 3, 6);
      emberGrad.addColorStop(0, '#ffffff');
      emberGrad.addColorStop(0.3, '#ef4444');
      emberGrad.addColorStop(0.8, '#b91c1c');
      emberGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = emberGrad;
      ctx.beginPath();
      ctx.arc(0, 3, 5 + Math.sin(Date.now() * 0.01) * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Label Badge
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      const modeStr = '🔥 Tàn Đỏ (Thử O2)';
      const mw = ctx.measureText(modeStr).width + 10;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-mw / 2, -18, mw, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(modeStr, 0, -10);
      ctx.restore();
    } else if (splintState === 'BURNING') {
      // Bùng cháy (Light blue for H2 or bright yellow/orange for Wood / O2)
      ctx.save();
      const time = Date.now() * 0.015;
      const flicker = Math.sin(time) * 1.5;

      let innerColor = '#ffffff';
      let midColor = '#fde047';
      let outerColor = '#f97316';
      let badgeLabel = '🔥 Que Đốm Cháy (Mồi Lửa)';

      if (flameColor === 'lightblue' || flameColor === 'blue') {
        // H2 flame - Light blue / Cyan flame
        innerColor = '#ffffff';
        midColor = '#38bdf8';
        outerColor = '#0284c7';
        badgeLabel = '💧 Lửa Xanh Nhạt (Khí H2)';
      } else if (flameColor === 'bright') {
        // O2 flare up - Intense bright white/yellow
        innerColor = '#ffffff';
        midColor = '#fef08a';
        outerColor = '#eab308';
        badgeLabel = '✨ Bùng Cháy Sáng (Khí O2)';
      }

      const flameGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 14 + flicker);
      flameGrad.addColorStop(0, innerColor);
      flameGrad.addColorStop(0.3, midColor);
      flameGrad.addColorStop(0.75, outerColor);
      flameGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(0, -10, 7 + flicker * 0.5, 16 + flicker, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top Badge
      ctx.font = 'bold 10px sans-serif';
      const mw = ctx.measureText(badgeLabel).width + 10;
      ctx.fillStyle = flameColor === 'lightblue' ? 'rgba(2, 132, 199, 0.9)' : 'rgba(217, 119, 6, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-mw / 2, -32, mw, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeLabel, 0, -24);
      ctx.restore();
    }
  };

  // Alcohol Burner Renderer
  const drawAlcoholBurnerGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const w = eq.width;
    const h = eq.height;

    ctx.fillStyle = 'rgba(240, 248, 255, 0.35)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, h - 30, w / 2, Math.PI * 0.8, Math.PI * 0.2, false);
    ctx.lineTo(10, 20);
    ctx.lineTo(-10, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.beginPath();
    ctx.arc(0, h - 30, w / 2 - 4, Math.PI * 0.9, Math.PI * 0.1, false);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(-8, 10, 16, 12);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-3, -2, 6, 12);

    if (eq.isBurning) {
      const flameGrad = ctx.createRadialGradient(0, -15, 2, 0, -15, 18);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#fde047');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(0, -15, 10 + Math.sin(Date.now() * 0.02) * 2, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Enhanced Transparent Amber Chemical Bottle Renderer (Bình chứa màu vàng trong suốt)
  const drawChemicalBottleGraphics = (ctx: CanvasRenderingContext2D, eq: EquipmentInstance) => {
    const w = eq.width;
    const h = eq.height;
    const halfW = w / 2;

    const fillRatio = Math.min(1.0, eq.content.volumeMl / eq.capacityMl);
    const liquidH = (h - 22) * fillRatio * 0.85;

    // 1. Draw Liquid Solution Inside Amber Glass
    if (liquidH > 2) {
      ctx.save();
      const liquidY = h - liquidH;

      ctx.beginPath();
      ctx.roundRect(-halfW + 3, liquidY, w - 6, liquidH - 2, [0, 0, 6, 6]);
      ctx.clip();

      const { r, g, b, a } = eq.content.colorRgba;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.65, a)})`;
      ctx.fillRect(-halfW + 3, liquidY, w - 6, liquidH);

      // Surface Meniscus
      ctx.fillStyle = `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(0, liquidY, halfW - 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stirring Effect inside Bottle
      if (eq.isStirring) {
        const time = Date.now() * 0.008;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const vortexRadius = (halfW - 6) * 0.7;
        for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
          const radius = (angle / (Math.PI * 4)) * vortexRadius;
          const vx = Math.cos(angle + time) * radius;
          const vy = liquidY + Math.sin(angle + time) * (radius * 0.3);
          if (angle === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    // Render solid powder / reagent layer at bottom (whether liquid exists or dry)
    drawContainerSolids(ctx, eq, halfW, h);

    // 2. Transparent Amber Glass Body (Bình thủy tinh vàng trong suốt)
    const glassGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    glassGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    glassGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.18)');
    glassGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.22)');
    glassGrad.addColorStop(1, 'rgba(180, 83, 9, 0.4)');

    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-16, 18);
    ctx.quadraticCurveTo(-halfW, 20, -halfW, 30);
    ctx.lineTo(-halfW, h - 6);
    ctx.quadraticCurveTo(-halfW, h, -halfW + 6, h);
    ctx.lineTo(halfW - 6, h);
    ctx.quadraticCurveTo(halfW, h, halfW, h - 6);
    ctx.lineTo(halfW, 30);
    ctx.quadraticCurveTo(halfW, 20, 16, 18);
    ctx.lineTo(16, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Neck Lip
    ctx.strokeRect(-18, -3, 36, 4);

    // Stopper / Cap
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 12, 3);
    ctx.fill();
    ctx.stroke();

    // 3. Chemical Paper Label on Front
    const labelW = w - 16;
    const labelH = 36;
    const labelY = 32;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-labelW / 2, labelY, labelW, labelH, 4);
    ctx.fill();
    ctx.stroke();

    const primaryReagent = getContainerPrimaryChemical(eq);
    const mainText = formatFormula(primaryReagent ? primaryReagent.formula : (eq.label || eq.name));
    const subText = primaryReagent ? `${primaryReagent.defaultConcentration || 1.0}M` : '';

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mainText, 0, labelY + 16);

    if (subText) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(subText, 0, labelY + 28);
    }

    // 4. Parameter HUD Badge Below Bottle (Calculations & Stats)
    const volStr = `${eq.content.volumeMl.toFixed(1)} mL`;
    const labelStr = getContainerLabelStr(eq);

    const statParts: string[] = [volStr];
    if (!isExp3 && eq.content.volumeMl > 0) {
      statParts.push(`pH ${eq.content.pH.toFixed(2)}`);
    }
    if (eq.content.precipitates.length > 0) {
      const precipList = eq.content.precipitates
        .filter((p) => p.massGram > 0.01)
        .map((p) => `${formatFormula(p.formula)} ${p.massGram.toFixed(1)}g`);
      if (precipList.length > 0) {
        statParts.push(`↓ ${precipList.join(', ')}`);
      }
    }
    if (eq.content.activeGas) {
      statParts.push(`↑ ${formatFormula(eq.content.activeGas.formula)}`);
    }
    if (eq.content.temperatureC > 30) {
      statParts.push(`🌡️ ${eq.content.temperatureC.toFixed(0)}°C`);
    }

    const badgeText = `${labelStr}: ${statParts.join(' | ')}`;

    ctx.font = 'bold 11px sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = Math.max(textWidth + 16, 70);
    const badgeH = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(-badgeW / 2, h + 8, badgeW, badgeH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, h + 8 + badgeH / 2);
  };

  // Render & Physics Engine for Particles (Drops, Powder Streams, Bubbles, Ripples, Inflow)
  const drawParticlesAndPhysics = (
    ctx: CanvasRenderingContext2D,
    dt: number,
    currentEquipments: EquipmentInstance[]
  ) => {
    // 0. Inflow Particles Physics (Liquid & Powder flowing UP into Pipette / Spatula during extraction)
    inflowParticlesRef.current.forEach((p) => {
      p.progress += p.speed * dt;
      const currentX = p.x + (p.targetX - p.x) * p.progress;
      const currentY = p.y + (p.targetY - p.y) * p.progress;
      const alpha = Math.max(0, 1.0 - p.progress * 0.25);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      if (p.isPowder) {
        ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
      } else {
        ctx.ellipse(currentX, currentY, p.size * 0.8, p.size * 1.5, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    inflowParticlesRef.current = inflowParticlesRef.current.filter((p) => p.progress < 1.0);

    // 1. Bubbles inside bottles when sucking liquid
    bubbleParticlesRef.current.forEach((b) => {
      b.y += b.vy * dt;
      b.alpha -= 0.6 * dt;

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, b.alpha)})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
    bubbleParticlesRef.current = bubbleParticlesRef.current.filter((b) => b.alpha > 0);

    // 2. Fluid Drop Particles Physics (Liquid falling from Pipette, Burette or pouring)
    const benchY = (ctx.canvas.height || 620) * 0.82;

    const calculateDropImpactY = (drop: FluidDropParticle, equipments: EquipmentInstance[], defaultBenchY: number) => {
      let target: EquipmentInstance | undefined = undefined;

      if (drop.targetEqId) {
        target = equipments.find((e) => e.id === drop.targetEqId);
      }

      if (!target) {
        const candidates = equipments.filter((c) => {
          if (
            c.type === 'lab_stand' ||
            c.type === 'glass_rod' ||
            c.type === 'tripod_wire_gauze' ||
            c.type === 'pipette' ||
            c.type === 'spatula'
          ) {
            return false;
          }
          if (c.type === 'burette') {
            // A drop falling into a burette must be coming from above/inside the body tube of the burette
            const isAboveBuretteBody = drop.y < c.y + c.height - 30;
            if (!isAboveBuretteBody) return false;
          }
          const halfW = c.hasFabricStrip ? 50 : c.width / 2 + 18;
          const targetH = c.hasFabricStrip ? 30 : c.height;
          const xMatch = Math.abs(c.x - drop.x) <= halfW;
          const yBelow = c.y + targetH >= drop.y - 15;
          return xMatch && yBelow;
        });

        if (candidates.length > 0) {
          candidates.sort((a, b) => a.y - b.y);
          target = candidates[0];
        }
      }

      if (target) {
        if (target.hasFabricStrip) {
          return { impactY: target.y + 15, targetEq: target };
        } else if (target.type === 'burette') {
          const bodyH = target.height - 35;
          const cap = target.capacityMl || 50;
          const vol = target.content?.volumeMl || 0;
          const fillRatio = Math.min(1.0, vol / cap);
          if (vol > 0) {
            return { impactY: target.y + bodyH - bodyH * fillRatio, targetEq: target };
          } else {
            return { impactY: target.y + bodyH - 4, targetEq: target };
          }
        } else {
          const cap = target.capacityMl || 100;
          const vol = target.content?.volumeMl || 0;
          const fillRatio = Math.min(1.0, vol / cap);

          if (vol > 0) {
            return { impactY: target.y + target.height - 10 - (target.height - 25) * fillRatio * 0.85, targetEq: target };
          } else {
            return { impactY: target.y + target.height - 12, targetEq: target };
          }
        }
      }

      return { impactY: defaultBenchY, targetEq: undefined };
    };

    fluidDropParticlesRef.current.forEach((drop) => {
      drop.vy += 420 * dt;
      drop.y += drop.vy * dt;

      const { impactY, targetEq } = calculateDropImpactY(drop, currentEquipments, benchY);

      if (targetEq && targetEq.type === 'burette') {
        // Guide drop X to align cleanly down the center of the narrow burette tube
        drop.x += (targetEq.x - drop.x) * 0.35;
      }

      if (drop.y >= impactY) {
        // Execute real solution transfer at drop impact moment
        if (targetEq && drop.dropSolution && drop.transferMl > 0) {
          const freshEq = equipmentsRef.current.find((e) => e.id === targetEq.id);
          if (freshEq && freshEq.type !== 'chemical_bottle') {
            const updatedTargetContent = mixSolutions(freshEq.content, drop.dropSolution, drop.transferMl);
            equipmentsRef.current = equipmentsRef.current.map((e) => {
              if (e.id === freshEq.id) {
                if (e.hasFabricStrip) {
                  const currentP = e.fabricBleachProgress || 0;
                  const nextProgress = currentP > 0 ? currentP : 0.01;
                  activeHoldActionTextRef.current = nextProgress >= 1.0
                    ? '✨ Nước Javel (NaClO) đã TẨY TRẮNG MẨU VẢI MÀU thành màu trắng tinh (#FFFFFF)!'
                    : `⚡ Nước Javel (NaClO) đang loang tẩy màu mẩu vải (${Math.round(nextProgress * 100)}%)...`;
                  return {
                    ...e,
                    fabricBleachProgress: nextProgress,
                  };
                }
                if (e.hasDroppingFunnel || e.name.includes('CaCO3') || e.name.includes('MnO2') || (e.name.includes('Phễu') && e.type !== 'pipette')) {
                  exp3TimerRef.current = 0; exp4TimerRef.current = 0; exp5TimerRef.current = 0; exp6TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0;
                  const newFunnelVol = Math.min(25.0, (e.droppingFunnelVolumeMl || 0) + Math.max(5.0, drop.transferMl * 5));
                  return {
                    ...e,
                    content: updatedTargetContent,
                    droppingFunnelVolumeMl: newFunnelVol,
                    valveOpen: true,
                  };
                }
                return { ...e, content: updatedTargetContent };
              }
              return e;
            });
          }
        }
        // Spawn Concentric Ripples (Expanding dual concentric rings matching attached reference photo)
        const maxR = targetEq ? Math.min(targetEq.width / 2 - 4, 22) : 22;

        rippleParticlesRef.current.push({
          x: drop.x,
          y: impactY,
          radius: 1.5,
          maxRadius: maxR,
          alpha: 0.95,
          color: drop.color,
        });

        rippleParticlesRef.current.push({
          x: drop.x,
          y: impactY,
          radius: 4.5,
          maxRadius: maxR,
          alpha: 0.7,
          color: drop.color,
        });

        // Upward Crown Splash Droplet (bounce back like photo)
        for (let i = 0; i < 3; i++) {
          splashParticlesRef.current.push({
            x: drop.x + (Math.random() - 0.5) * 4,
            y: impactY - 1,
            vx: (Math.random() - 0.5) * 35,
            vy: -35 - Math.random() * 45,
            size: 1.2 + Math.random() * 1.5,
            alpha: 0.95,
            color: drop.color,
            life: 0,
            maxLife: 0.35,
          });
        }
      } else {
        // Render 3D Glossy Liquid Droplet (Teardrop shape with specular highlight & bottom rim glare like photo)
        ctx.save();
        ctx.translate(drop.x, drop.y);

        const r = drop.size || 4;
        const stretchY = Math.min(r * 1.6, r + drop.vy * 0.012);
        const stretchX = Math.max(r * 0.7, r - drop.vy * 0.003);

        // 1. Droplet Main Body Radial Refraction Fill
        const dropGrad = ctx.createRadialGradient(-stretchX * 0.25, -stretchY * 0.25, 0.5, 0, 0, stretchY);
        dropGrad.addColorStop(0, '#ffffff');
        dropGrad.addColorStop(0.35, drop.color);
        dropGrad.addColorStop(0.85, drop.color);
        dropGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

        ctx.fillStyle = dropGrad;
        ctx.beginPath();
        ctx.moveTo(0, -stretchY);
        ctx.bezierCurveTo(stretchX * 1.1, -stretchY * 0.3, stretchX * 1.1, stretchY, 0, stretchY);
        ctx.bezierCurveTo(-stretchX * 1.1, stretchY, -stretchX * 1.1, -stretchY * 0.3, 0, -stretchY);
        ctx.closePath();
        ctx.fill();

        // 2. Crystal Specular Highlight (White glare spot at top-left like photo)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.ellipse(-stretchX * 0.3, -stretchY * 0.35, stretchX * 0.35, stretchY * 0.25, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // 3. Bottom Caustic Highlight Rim
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(stretchX * 0.1, stretchY * 0.5, stretchX * 0.4, stretchY * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    fluidDropParticlesRef.current = fluidDropParticlesRef.current.filter((drop) => {
      const { impactY } = calculateDropImpactY(drop, currentEquipments, benchY);
      return drop.y < impactY;
    });

    // 3. Powder Stream Particles Physics (Falling from Spatula)
    powderStreamParticlesRef.current.forEach((p) => {
      p.life += dt;
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const { impactY, targetEq } = calculateDropImpactY(
        { x: p.x, y: p.y, targetEqId: p.targetEqId } as any,
        currentEquipments,
        benchY
      );

      if (p.y >= impactY) {
        p.life = p.maxLife; // Expire particle upon landing on surface
        if (targetEq) {
          // Draw subtle powder dust mark at surface level
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          ctx.ellipse(p.x, impactY, p.size * 1.8, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      p.alpha = Math.max(0, 0.9 * (1 - p.life / p.maxLife));

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, Math.min(p.y, impactY), p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    powderStreamParticlesRef.current = powderStreamParticlesRef.current.filter((p) => p.life < p.maxLife);

    // 4. Concentric Ripple Particles on liquid surfaces (Matching attached photo)
    rippleParticlesRef.current.forEach((r) => {
      r.radius += 32 * dt;
      r.alpha -= 1.2 * dt;

      if (r.alpha > 0) {
        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = Math.max(0, r.alpha);

        // Outer Expanding Ripple Ring
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Sub-Ripple Ring (Concentric like photo!)
        if (r.radius > 3.5) {
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 0.55, r.radius * 0.16, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }
    });
    rippleParticlesRef.current = rippleParticlesRef.current.filter((r) => r.alpha > 0 && r.radius < r.maxRadius);

    // 5. Splash particles
    splashParticlesRef.current.forEach((s) => {
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 200 * dt;
      s.alpha = Math.max(0, 0.9 * (1 - s.life / s.maxLife));

      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    splashParticlesRef.current = splashParticlesRef.current.filter((s) => s.life < s.maxLife);
  };

  // Render HUD Progress Ring & Action Badge next to cursor
  const drawCursorHUD = (ctx: CanvasRenderingContext2D) => {
    const actionText = activeHoldActionTextRef.current;
    if (!actionText) return;

    ctx.save();
    const x = mousePosRef.current.x;
    const y = mousePosRef.current.y;

    const time = Date.now() * 0.005;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22, time, time + Math.PI * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.font = 'bold 12px sans-serif';

    const textWidth = ctx.measureText(actionText).width;
    const pillW = textWidth + 24;
    const pillH = 26;
    const pillX = x + 25;
    const pillY = y - 35;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText(actionText, pillX + 12, pillY + 17);

    ctx.restore();
  };

  // Window-level Pointer Event Tracking for Smooth Dragging & Holding
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const currX = (e.clientX - rect.left) * scaleX;
      const currY = (e.clientY - rect.top) * scaleY;

      mousePosRef.current = { x: currX, y: currY };
      setMousePos({ x: currX, y: currY });

      const currentDraggingId = draggingIdRef.current;
      if (!currentDraggingId) return;

      const draggedEq = equipmentsRef.current.find((e) => e.id === currentDraggingId);
      if (!draggedEq) return;

      const offset = dragOffsetRef.current;
      let newX = currX - offset.x;
      let newY = currY - offset.y;

      newX = Math.max(draggedEq.width / 2, Math.min(canvas.width - draggedEq.width / 2, newX));
      newY = Math.max(10, Math.min(canvas.height - draggedEq.height - 10, newY));

      const dx = newX - draggedEq.x;
      const dy = newY - draggedEq.y;

      // Find attached items if dragging tripod_wire_gauze or lab_stand as a unified assembly ("1 khối")
      const attachedChildIds: string[] = [];

      if (draggedEq.type === 'tripod_wire_gauze') {
        equipmentsRef.current.forEach((child) => {
          if (child.id === draggedEq.id) return;
          if (
            child.type === 'alcohol_burner' &&
            Math.abs(child.x - draggedEq.x) < 55 &&
            Math.abs(child.y - (draggedEq.y + draggedEq.height - child.height + 12)) < 45
          ) {
            attachedChildIds.push(child.id);
          } else if (
            child.type !== 'pipette' &&
            child.type !== 'spatula' &&
            child.type !== 'glass_rod' &&
            child.type !== 'chemical_bottle' &&
            Math.abs(child.x - draggedEq.x) < 55 &&
            Math.abs(child.y + child.height - (draggedEq.y + 16)) < 45
          ) {
            attachedChildIds.push(child.id);
          }
        });
      } else if (draggedEq.type === 'lab_stand') {
        equipmentsRef.current.forEach((child) => {
          if (child.id === draggedEq.id) return;
          const isClamped = child.clampedToStandId === draggedEq.id;
          const dxToStand = Math.abs(child.x - draggedEq.x);
          const dyToStand = child.y - draggedEq.y;

          const isClampedVessel =
            ['test_tube', 'burette', 'erlenmeyer', 'beaker'].includes(child.type) ||
            child.type.startsWith('round_flask');

          if (isClamped) {
            attachedChildIds.push(child.id);
          } else if (isClampedVessel && dxToStand < 90 && dyToStand >= -140 && dyToStand <= 180) {
            attachedChildIds.push(child.id);
          } else if (child.type === 'alcohol_burner' && dxToStand < 90 && dyToStand >= 40 && dyToStand <= 220) {
            attachedChildIds.push(child.id);
          } else if (child.type === 'wooden_splint' && dxToStand < 90 && dyToStand >= -140 && dyToStand <= 180) {
            attachedChildIds.push(child.id);
          }
        });
      }

      const updatedList = equipmentsRef.current.map((eq) => {
        if (eq.id === currentDraggingId) {
          return {
            ...eq,
            x: newX,
            y: newY,
          };
        }
        if (attachedChildIds.includes(eq.id)) {
          return {
            ...eq,
            x: Math.max(eq.width / 2, Math.min(canvas.width - eq.width / 2, eq.x + dx)),
            y: Math.max(10, Math.min(canvas.height - eq.height - 10, eq.y + dy)),
          };
        }
        return eq;
      });

      equipmentsRef.current = updatedList;
      setEquipments(updatedList);
    };

    const handleWindowPointerUp = () => {
      isPointerDownRef.current = false;

      const holdDuration = Date.now() - pointerDownTimeRef.current;
      const currentDraggingId = draggingIdRef.current;
      activeHoldGestureModeRef.current = null;

      if (currentDraggingId && holdDuration < 250) {
        const list = equipmentsRef.current;
        const tool = list.find((e) => e.id === currentDraggingId);

        if (tool && tool.type === 'alcohol_burner') {
          // Quick click on alcohol burner ignites or extinguishes flame
          equipmentsRef.current = list.map((item) =>
            item.id === tool.id ? { ...item, isBurning: !item.isBurning, hasCap: item.isBurning } : item
          );
          setEquipments([...equipmentsRef.current]);
        } else if (tool && tool.type === 'burette') {
          // Quick click on burette toggles its valve
          equipmentsRef.current = list.map((item) =>
            item.id === tool.id ? { ...item, valveOpen: !item.valveOpen } : item
          );
          setEquipments([...equipmentsRef.current]);
        } else if (tool && (tool.hasDroppingFunnel || (tool.name.includes('Phễu') && tool.type !== 'pipette') || tool.name.includes('CaCO3') || tool.name.includes('MnO2'))) {
          // Quick click on flask with dropping funnel toggles its valve & resets timer/refills if empty
          const isOpening = !tool.valveOpen;
          equipmentsRef.current = list.map((item) => {
            if (item.id === tool.id) {
              let funnelVol = item.droppingFunnelVolumeMl;
              if (isOpening && (funnelVol === undefined || funnelVol <= 0.5)) {
                funnelVol = 25.0;
              }
              return { ...item, valveOpen: isOpening, droppingFunnelVolumeMl: funnelVol };
            }
            return item;
          });
          if (isOpening) {
            exp3TimerRef.current = 0; exp4TimerRef.current = 0; exp5TimerRef.current = 0; exp6TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0;
          }
          setEquipments([...equipmentsRef.current]);
        } else if (tool && (tool.type === 'pipette' || tool.type === 'spatula')) {
          const tipX = tool.x;
          const tipY = tool.y + tool.height;

          const targetContainer = list.find(
            (v) =>
              v.id !== tool.id &&
              v.type !== 'lab_stand' &&
              v.type !== 'pipette' &&
              v.type !== 'spatula' &&
              v.type !== 'glass_rod' &&
              Math.abs(v.x - tipX) < Math.max(50, v.width / 2 + 30) &&
              tipY >= v.y - 120 &&
              tipY <= v.y + v.height + 50
          );

          if (tool.type === 'pipette') {
            const currentVol = tool.suckedContent?.volumeMl || 0;
            const isChemBottle = targetContainer?.type === 'chemical_bottle';
            const maxCap = tool.capacityMl || 10.0;
            const currentMode = isChemBottle && currentVol < maxCap
              ? 'SUCK'
              : (tool.toolMode || (currentVol > 0 ? 'DISPENSE' : 'SUCK'));

            if (targetContainer) {
              const compat = checkToolChemicalCompatibility(tool, targetContainer, currentMode);
              if (!compat.compatible) {
                activeHoldActionTextRef.current = compat.warningMsg;
                return;
              }

              if (currentMode === 'DISPENSE' && currentVol > 0) {
                const isChemBottle = targetContainer.type === 'chemical_bottle';
                const toolCap = tool.capacityMl || 10.0;
                const singleDropVol = Math.min(currentVol, toolCap * 0.25);
                const { remainingPipetteContent, updatedTargetContent } = dispenseLiquidFromPipette(
                  tool.suckedContent!,
                  targetContainer,
                  singleDropVol
                );

                const ratio = currentVol > 0 ? singleDropVol / currentVol : 0;
                const dropSpecies: Record<string, number> = {};
                for (const [f, m] of Object.entries(tool.suckedContent!.speciesMoles || {})) {
                  dropSpecies[f] = m * ratio;
                }
                const dropSolutionData: SolutionContent = {
                  ...tool.suckedContent!,
                  volumeMl: singleDropVol,
                  speciesMoles: dropSpecies,
                  pH: tool.suckedContent!.pH,
                };

                const { r, g, b, a } = tool.suckedContent!.colorRgba;
                fluidDropParticlesRef.current.push({
                  x: tipX,
                  y: tipY + 4,
                  vy: 180,
                  color: `rgba(${r}, ${g}, ${b}, ${Math.max(0.75, a)})`,
                  size: 4,
                  targetEqId: targetContainer.id,
                  transferMl: isChemBottle ? 0 : singleDropVol,
                  dropSolution: isChemBottle ? undefined : dropSolutionData,
                });

                equipmentsRef.current = list.map((item) => {
                  if (item.id === tool.id) {
                    return {
                      ...item,
                      suckedContent: remainingPipetteContent,
                      toolMode: remainingPipetteContent.volumeMl <= 0 ? 'SUCK' : 'DISPENSE',
                    };
                  }
                  if (item.id === targetContainer.id) {
                    if (isChemBottle) {
                      return { ...item, content: updatedTargetContent };
                    }
                    if (item.hasDroppingFunnel || item.name.includes('CaCO3') || item.name.includes('MnO2') || (item.name.includes('Phễu') && item.type !== 'pipette')) {
                      exp3TimerRef.current = 0; exp4TimerRef.current = 0; exp5TimerRef.current = 0; exp6TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0;
                      const newFunnelVol = Math.min(25.0, (item.droppingFunnelVolumeMl || 0) + 5.0);
                      return {
                        ...item,
                        content: updatedTargetContent,
                        droppingFunnelVolumeMl: newFunnelVol,
                        valveOpen: true,
                      };
                    }
                    if (item.hasFabricStrip) {
                      activeHoldActionTextRef.current = '✨ Nước Javel (NaClO) đã TẨY TRẮNG MẨU VẢI MÀU thành màu trắng tinh (#FFFFFF)!';
                      return {
                        ...item,
                        fabricBleachProgress: 1.0,
                      };
                    }
                    return { ...item, content: updatedTargetContent };
                  }
                  return item;
                });
              } else if (currentMode === 'SUCK') {
                const toolCap = tool.capacityMl || 10.0;
                if (currentVol < toolCap) {
                  const singleSuckVol = toolCap * 0.25;
                  const { extractedSolution, updatedContainerContent, actualExtractedVol } = extractLiquidFromContainer(
                    targetContainer,
                    singleSuckVol
                  );

                  if (actualExtractedVol > 0) {
                    const newSuckedContent = (!tool.suckedContent || tool.suckedContent.volumeMl <= 0)
                      ? extractedSolution
                      : mixSolutions(tool.suckedContent, extractedSolution, actualExtractedVol);

                    const { r, g, b, a } = newSuckedContent.colorRgba;
                    inflowParticlesRef.current.push({
                      x: tipX + (Math.random() - 0.5) * 16,
                      y: tipY + 20,
                      targetX: tipX,
                      targetY: tipY - 15,
                      progress: 0,
                      speed: 2.5,
                      color: `rgba(${r}, ${g}, ${b}, ${Math.max(0.7, a)})`,
                      size: 3,
                    });

                    equipmentsRef.current = list.map((item) => {
                      if (item.id === tool.id) {
                        return {
                          ...item,
                          suckedContent: newSuckedContent,
                          toolMode: 'DISPENSE',
                        };
                      }
                      if (item.id === targetContainer.id) {
                        return { ...item, content: updatedContainerContent };
                      }
                      return item;
                    });
                  }
                }
              }
            } else {
              // Tap on tool without container -> Toggle Mode
              const nextMode = currentMode === 'SUCK' ? 'DISPENSE' : 'SUCK';
              equipmentsRef.current = list.map((item) =>
                item.id === tool.id ? { ...item, toolMode: nextMode } : item
              );
            }
          } else if (tool.type === 'spatula') {
            const currentGrams = tool.spatulaContent?.amountGram || 0;
            const isChemBottle = targetContainer?.type === 'chemical_bottle';
            const maxGrams = tool.capacityMl || 5.0;
            const currentMode = isChemBottle && currentGrams < maxGrams
              ? 'SUCK'
              : (tool.toolMode || (currentGrams > 0 ? 'DISPENSE' : 'SUCK'));

            if (targetContainer) {
              const compat = checkToolChemicalCompatibility(tool, targetContainer, currentMode);
              if (!compat.compatible) {
                activeHoldActionTextRef.current = compat.warningMsg;
                return;
              }

              if (currentMode === 'DISPENSE' && currentGrams > 0) {
                const toolCap = tool.capacityMl || 5.0;
                const singleScoopGrams = Math.min(currentGrams, toolCap * 0.25);
                const { remainingSpatulaContent, updatedTargetContent } = dispenseSolidFromSpatula(
                  tool,
                  targetContainer,
                  singleScoopGrams
                );

                if (tool.spatulaContent) {
                  powderStreamParticlesRef.current.push({
                    x: tipX,
                    y: tipY + 4,
                    vx: 0,
                    vy: 140,
                    color: tool.spatulaContent.color,
                    size: 3,
                    alpha: 0.9,
                    life: 0,
                    maxLife: 0.8,
                    targetEqId: targetContainer.id,
                    transferGram: singleScoopGrams,
                    chemicalId: tool.spatulaContent.chemicalId,
                  });
                }

                const remainingGrams = remainingSpatulaContent?.amountGram || 0;

                equipmentsRef.current = list.map((item) => {
                  if (item.id === tool.id) {
                    return {
                      ...item,
                      spatulaContent: remainingSpatulaContent,
                      toolMode: remainingGrams <= 0 ? 'SUCK' : 'DISPENSE',
                    };
                  }
                  if (item.id === targetContainer.id) {
                    return { ...item, content: updatedTargetContent };
                  }
                  return item;
                });
              } else if (currentMode === 'SUCK') {
                const isLiquidContainer =
                  targetContainer.content &&
                  targetContainer.content.volumeMl > 0 &&
                  (!targetContainer.content.precipitates || targetContainer.content.precipitates.length === 0);
                if (isLiquidContainer) {
                  activeHoldActionTextRef.current = `⚠️ Muỗng/Thìa chỉ dùng múc CHẤT RẮN / BỘT! Dùng Pipet để hút chất lỏng.`;
                  return;
                }
                const toolCap = tool.capacityMl || 5.0;
                if (currentGrams < toolCap) {
                  const singleScoop = toolCap * 0.25;
                  const { newSpatulaContent, updatedContainerContent, actualScoopedGrams } = scoopSolidFromContainer(
                    targetContainer,
                    tool,
                    singleScoop
                  );

                  if (actualScoopedGrams > 0) {
                    inflowParticlesRef.current.push({
                      x: tipX,
                      y: tipY + 15,
                      targetX: tipX,
                      targetY: tipY - 10,
                      progress: 0,
                      speed: 2.5,
                      color: newSpatulaContent.color,
                      size: 3,
                      isPowder: true,
                    });

                    equipmentsRef.current = list.map((item) => {
                      if (item.id === tool.id) {
                        return { ...item, spatulaContent: newSpatulaContent, toolMode: 'DISPENSE' };
                      }
                      if (item.id === targetContainer.id) {
                        return { ...item, content: updatedContainerContent };
                      }
                      return item;
                    });
                  }
                }
              }
            } else {
              // Tap on tool without container -> Toggle Mode
              const nextMode = currentMode === 'SUCK' ? 'DISPENSE' : 'SUCK';
              equipmentsRef.current = list.map((item) =>
                item.id === tool.id ? { ...item, toolMode: nextMode } : item
              );
            }
          }
        }
      }

      // Auto snap and clamp check upon drop (pointerup)
      if (currentDraggingId) {
        const draggedEq = equipmentsRef.current.find((e) => e.id === currentDraggingId);
        const clampableStandTypes = [
          'test_tube',
          'burette',
          'erlenmeyer',
          'beaker',
          'round_flask',
          'round_flask_1arm',
          'round_flask_2neck',
          'alcohol_burner',
          'wooden_splint',
        ];
        if (draggedEq && clampableStandTypes.includes(draggedEq.type)) {
          const labStand = equipmentsRef.current.find(
            (s) =>
              s.type === 'lab_stand' &&
              s.id !== draggedEq.id &&
              Math.abs(s.x - draggedEq.x) < 250 &&
              Math.abs(s.y - draggedEq.y) < 220
          );

          if (labStand) {
            let snapX = labStand.x;
            let snapY = labStand.y;

            if (draggedEq.type === 'burette') {
              snapX = labStand.x + 38;
              snapY = labStand.y - 30;
            } else if (draggedEq.type === 'erlenmeyer' || draggedEq.type === 'beaker') {
              snapX = labStand.x + 38;
              snapY = labStand.y + labStand.height - draggedEq.height - 20;
            } else if (draggedEq.type === 'test_tube' || draggedEq.type.startsWith('round_flask')) {
              const dx = draggedEq.x - labStand.x;
              const offsets = [-130, -50, 10, 60, 130];
              const bestOffset = offsets.reduce((prev, curr) => Math.abs(curr - dx) < Math.abs(prev - dx) ? curr : prev);
              snapX = labStand.x + bestOffset;
              snapY = Math.max(labStand.y + 20, draggedEq.y);
            } else if (draggedEq.type === 'alcohol_burner') {
              const dx = draggedEq.x - labStand.x;
              const offsets = [-130, -50, 10, 60, 130];
              const bestOffset = offsets.reduce((prev, curr) => Math.abs(curr - dx) < Math.abs(prev - dx) ? curr : prev);
              snapX = labStand.x + bestOffset;
              snapY = labStand.y + 160; // Base of stand
            } else if (draggedEq.type === 'wooden_splint') {
              snapX = labStand.x + 10;
              snapY = labStand.y - 48;
            }

            equipmentsRef.current = equipmentsRef.current.map((item) =>
              item.id === draggedEq.id
                ? { ...item, x: snapX, y: snapY, clampedToStandId: labStand.id }
                : item
            );
            activeHoldActionTextRef.current = `🔗 Đã kẹp ${draggedEq.name} vào Giá đỡ thí nghiệm!`;
          } else {
            const tripod = equipmentsRef.current.find(
              (t) =>
                t.type === 'tripod_wire_gauze' &&
                t.id !== draggedEq.id &&
                Math.abs(t.x - draggedEq.x) < 65 &&
                Math.abs(t.y - draggedEq.y) < 140
            );

            if (tripod) {
              let snapX = tripod.x;
              let snapY = tripod.y;

              if (draggedEq.type === 'alcohol_burner') {
                snapX = tripod.x;
                snapY = tripod.y + tripod.height - draggedEq.height + 12;
              } else if (
                draggedEq.type !== 'pipette' &&
                draggedEq.type !== 'spatula' &&
                draggedEq.type !== 'glass_rod' &&
                draggedEq.type !== 'chemical_bottle'
              ) {
                snapX = tripod.x;
                snapY = tripod.y + 16 - draggedEq.height;
              }

              equipmentsRef.current = equipmentsRef.current.map((item) =>
                item.id === draggedEq.id
                  ? { ...item, x: snapX, y: snapY, clampedToStandId: null }
                  : item
              );
              activeHoldActionTextRef.current = `🔗 Đã đặt ${draggedEq.name} lên Kiềng ba chân & Lưới amiăng!`;
            } else {
              equipmentsRef.current = equipmentsRef.current.map((item) =>
                item.id === draggedEq.id ? { ...item, clampedToStandId: null } : item
              );
            }
          }
        }
      }

      // Handle tap on alcohol burner to toggle flame directly
      if (currentDraggingId) {
        const duration = Date.now() - pointerDownTimeRef.current;
        const distMoved = Math.hypot(
          mousePosRef.current.x - pointerStartPosRef.current.x,
          mousePosRef.current.y - pointerStartPosRef.current.y
        );
        if (duration < 350 && distMoved < 8) {
          const tappedEq = equipmentsRef.current.find((e) => e.id === currentDraggingId);
          if (tappedEq && tappedEq.type === 'alcohol_burner') {
            const nextBurning = !tappedEq.isBurning;
            equipmentsRef.current = equipmentsRef.current.map((item) =>
              item.id === tappedEq.id ? { ...item, isBurning: nextBurning, hasCap: !nextBurning } : item
            );
            activeHoldActionTextRef.current = nextBurning
              ? '🔥 Đã châm lửa Đèn Cồn gia nhiệt!'
              : '🔒 Đã đậy nắp dập tắt lửa Đèn Cồn.';
          }
        }
      }

      draggingIdRef.current = null;
      setDraggingId(null);
      activeSourceBottleIdRef.current = null;
      activeTargetVesselIdRef.current = null;

      // Always commit latest equipment state to React state on pointer up
      setEquipments([...equipmentsRef.current]);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [setEquipments]);

  // Canvas Pointer Interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    isPointerDownRef.current = true;
    pointerDownTimeRef.current = Date.now();
    pointerStartPosRef.current = { x: clickX, y: clickY };
    mousePosRef.current = { x: clickX, y: clickY };
    setMousePos({ x: clickX, y: clickY });

    const currentList = equipmentsRef.current;

    // Helper for rotated hit detection
    const isPointInEq = (px: number, py: number, eq: EquipmentInstance, pad: number) => {
      let testX = px;
      let testY = py;
      if (eq.angle) {
        const rad = -eq.angle * Math.PI / 180;
        const dx = px - eq.x;
        const dy = py - eq.y;
        testX = eq.x + dx * Math.cos(rad) - dy * Math.sin(rad);
        testY = eq.y + dx * Math.sin(rad) + dy * Math.cos(rad);
      }
      return (
        testX >= eq.x - eq.width / 2 - pad &&
        testX <= eq.x + eq.width / 2 + pad &&
        testY >= eq.y - pad &&
        testY <= eq.y + eq.height + pad
      );
    };

    // Find clicked equipment from top rendered item down
    const clicked = [...currentList].reverse().find((eq) => isPointInEq(clickX, clickY, eq, 20));

    if (clicked) {
      if (activeToolRef.current === 'store') {
        const remainingList = currentList.filter((e) => e.id !== clicked.id);
        equipmentsRef.current = remainingList;
        setEquipments(remainingList);
        if (selectedEquipmentIdRef.current === clicked.id) {
          setSelectedEquipmentId(null);
          onSelectEquipmentForDetails(null);
        }
        activeHoldActionTextRef.current = `Đã cất ${clicked.name} vào kho`;
        return;
      }

      // Bring clicked equipment to TOP layer
      const reorderedList = [
        ...currentList.filter((e) => e.id !== clicked.id),
        clicked,
      ];
      equipmentsRef.current = reorderedList;

      // Immediately enable dragging without waiting for React re-render
      draggingIdRef.current = clicked.id;
      const offset = { x: clickX - clicked.x, y: clickY - clicked.y };
      dragOffsetRef.current = offset;

      setSelectedEquipmentId(clicked.id);
      onSelectEquipmentForDetails(clicked);
      setDraggingId(clicked.id);
      setDragOffset(offset);
      setEquipments(reorderedList);

      if (activeToolRef.current === 'burn' && clicked.type === 'alcohol_burner') {
        const updated = equipmentsRef.current.map((eq) =>
          eq.id === clicked.id ? { ...eq, isBurning: !eq.isBurning, hasCap: eq.isBurning } : eq
        );
        equipmentsRef.current = updated;
        setEquipments(updated);
      }
    } else {
      setSelectedEquipmentId(null);
      onSelectEquipmentForDetails(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currX = (e.clientX - rect.left) * scaleX;
    const currY = (e.clientY - rect.top) * scaleY;

    mousePosRef.current = { x: currX, y: currY };
    setMousePos({ x: currX, y: currY });

    const hovered = equipmentsRef.current.find((eq) => {
      let testX = currX;
      let testY = currY;
      if (eq.angle) {
        const rad = -eq.angle * Math.PI / 180;
        const dx = currX - eq.x;
        const dy = currY - eq.y;
        testX = eq.x + dx * Math.cos(rad) - dy * Math.sin(rad);
        testY = eq.y + dx * Math.sin(rad) + dy * Math.cos(rad);
      }
      return (
        testX >= eq.x - eq.width / 2 - 15 &&
        testX <= eq.x + eq.width / 2 + 15 &&
        testY >= eq.y - 15 &&
        testY <= eq.y + eq.height + 15
      );
    });
    setHoveredEquipment(hovered || null);
  };

  // Pour liquid action
  const handlePourLiquid = () => {
    if (!selectedEquipmentIdRef.current) return;
    const list = equipmentsRef.current;
    const source = list.find((eq) => eq.id === selectedEquipmentIdRef.current);
    if (!source || source.content.volumeMl <= 0) return;

    // Find nearest target container
    const target = list.find(
      (eq) =>
        eq.id !== source.id &&
        eq.type !== 'lab_stand' &&
        eq.type !== 'glass_rod' &&
        Math.abs(eq.x - source.x) < 160
    );

    if (target) {
      if (target.type === 'chemical_bottle') {
        const targetReagent = getContainerPrimaryChemical(target);
        const sourceReagent = getContainerPrimaryChemical(source);
        const targetFormula = targetReagent ? targetReagent.formula : (target.label || target.name || '');
        const sourceFormula = sourceReagent ? sourceReagent.formula : (source.label || source.name || '');
        const targetName = targetReagent ? targetReagent.name : (target.label || target.name);
        const sourceName = sourceReagent ? sourceReagent.name : (source.label || source.name);

        const isSameChem = isSameChemicalFormula(sourceFormula, targetFormula);

        if (!isSameChem) {
          activeHoldActionTextRef.current = `⚠️ Khác hóa chất! Sai thao tác, không thể thả/rót ${sourceName} (${formatFormula(sourceFormula)}) vào lọ hóa chất gốc ${targetName} (${formatFormula(targetFormula)}).`;
        } else {
          activeHoldActionTextRef.current = `⚠️ Sai thao tác! Lọ hóa chất gốc ${targetName} là bình lưu trữ gốc, không được phép rót/thả chất vào lọ hóa chất gốc.`;
        }
        return;
      }

      const pourAmount = Math.min(20, source.content.volumeMl);
      const newTargetContent = mixSolutions(target.content, source.content, pourAmount);

      const updatedList = list.map((eq) => {
        if (eq.id === target.id) {
          if (eq.hasDroppingFunnel || eq.name.includes('CaCO3') || eq.name.includes('MnO2') || (eq.name.includes('Phễu') && eq.type !== 'pipette')) {
            exp3TimerRef.current = 0; exp4TimerRef.current = 0; exp5TimerRef.current = 0; exp6TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0;
            return {
              ...eq,
              content: newTargetContent,
              droppingFunnelVolumeMl: 25.0,
              valveOpen: true,
            };
          }
          return { ...eq, content: newTargetContent };
        }
        if (eq.id === source.id)
          return {
            ...eq,
            angle: 45,
            content: {
              ...eq.content,
              volumeMl: Math.max(0, eq.content.volumeMl - pourAmount),
            },
          };
        return eq;
      });

      equipmentsRef.current = updatedList;
      setEquipments(updatedList);

      setTimeout(() => {
        const resetList = equipmentsRef.current.map((eq) =>
          eq.id === source.id ? { ...eq, angle: 0 } : eq
        );
        equipmentsRef.current = resetList;
        setEquipments(resetList);
      }, 600);
    }
  };

  
  const handleAddBurnerToStand = (targetStandId: string) => {
    const currentList = [...equipmentsRef.current];
    const stand = currentList.find((eq) => eq.id === targetStandId);
    if (!stand) return;

    let burner = currentList.find((eq) => eq.type === 'alcohol_burner');
    if (!burner) {
      burner = {
        ...createEquipment('alcohol_burner', stand.x + 10, stand.y + 120, 'Đèn Cồn Gia Nhiệt'),
        isBurning: true,
        hasCap: false,
        clampedToStandId: stand.id,
      };
      currentList.push(burner);
    } else {
      burner = {
        ...burner,
        x: stand.x + 10,
        y: stand.y + 120,
        isBurning: true,
        hasCap: false,
        clampedToStandId: stand.id,
      };
      // remove old burner and push new
      const idx = currentList.findIndex(e => e.id === burner.id);
      if (idx !== -1) currentList[idx] = burner;
    }
    
    equipmentsRef.current = currentList;
    setEquipments(currentList);
    activeHoldActionTextRef.current = '🔥 Đã thêm đèn cồn vào giá đỡ!';
  };

  const handleAssembleO2Block = (targetStandId?: string) => {
    const currentList = [...equipmentsRef.current];

    let stand = targetStandId ? currentList.find((eq) => eq.id === targetStandId) : currentList.find((eq) => eq.type === 'lab_stand');
    const standX = stand ? stand.x : Math.max(160, Math.min(window.innerWidth - 320, 380));
    const standY = stand ? stand.y : 180;

    if (!stand) {
      stand = createEquipment('lab_stand', standX, standY);
      currentList.push(stand);
    }
    const standId = stand.id;

    // 1. Test tube with KMnO4
    let testTube = currentList.find((eq) => eq.type === 'test_tube');
    if (!testTube) {
      testTube = {
        ...createEquipment('test_tube', standX + 10, standY - 40, 'Ống nghiệm KMnO4', 'KMnO4', 0, 0),
        content: {
          ...createChemicalSolution('KMnO4', 0, 0),
          precipitates: [{ id: 'kmno4_solid', name: 'Potassium permanganate', formula: 'KMnO4', color: 'rgba(128, 0, 128, 0.95)', massGram: 5.0, settledRatio: 1.0 }],
        },
        clampedToStandId: standId,
      };
      currentList.push(testTube);
    } else {
      testTube = {
        ...testTube,
        x: standX + 10,
        y: standY - 40,
        clampedToStandId: standId,
      };
    }

    // 2. Alcohol burner lit below test tube
    let burner = currentList.find((eq) => eq.type === 'alcohol_burner');
    if (!burner) {
      burner = {
        ...createEquipment('alcohol_burner', standX + 10, standY + 120, 'Đèn Cồn Gia Nhiệt'),
        isBurning: true,
        hasCap: false,
        clampedToStandId: standId,
      };
      currentList.push(burner);
    } else {
      burner = {
        ...burner,
        x: standX + 10,
        y: standY + 120,
        isBurning: true,
        hasCap: false,
        clampedToStandId: standId,
      };
    }

    // 3. Wooden splint glowing at mouth of test tube
    let splint = currentList.find((eq) => eq.type === 'wooden_splint');
    if (!splint) {
      splint = {
        ...createEquipment('wooden_splint', standX + 10, standY - 48, 'Que Đốm Tàn Đỏ'),
        splintState: 'GLOWING',
        flameColor: 'red',
        angle: 0,
        clampedToStandId: standId,
      };
      currentList.push(splint);
    } else {
      splint = {
        ...splint,
        x: standX + 10,
        y: standY - 48,
        splintState: 'GLOWING',
        flameColor: 'red',
        angle: 0,
        clampedToStandId: standId,
      };
    }

    const finalUpdated = currentList.map((item) => {
      if (item.id === standId) return stand!;
      if (item.id === testTube!.id) return testTube!;
      if (item.id === burner!.id) return burner!;
      if (item.id === splint!.id) return splint!;
      return item;
    });

    equipmentsRef.current = finalUpdated;
    setEquipments(finalUpdated);
    setSelectedEquipmentId(standId);
    activeHoldActionTextRef.current = '🧩 Đã ghép Giá đỡ + Ống nghiệm + Đèn cồn + Que tàn đỏ thành 1 khối hoàn chỉnh!';
  };

  const handleDetachFromStand = (targetEqId: string) => {
    const currentList = [...equipmentsRef.current];
    const targetEq = currentList.find((eq) => eq.id === targetEqId);
    if (!targetEq) return;

    if (targetEq.type === 'lab_stand') {
      const updated = currentList.map((item, index) => {
        if (item.clampedToStandId === targetEqId) {
          return {
            ...item,
            clampedToStandId: null,
            x: item.x + 130 + (index % 3) * 30,
          };
        }
        return item;
      });
      equipmentsRef.current = updated;
      setEquipments(updated);
      activeHoldActionTextRef.current = '🔓 Đã tách tất cả dụng cụ khỏi giá đỡ!';
    } else {
      const updated = currentList.map((item) => {
        if (item.id === targetEqId) {
          return {
            ...item,
            clampedToStandId: null,
            x: item.x + 130,
          };
        }
        return item;
      });
      equipmentsRef.current = updated;
      setEquipments(updated);
      activeHoldActionTextRef.current = `🔓 Đã tách rời ${targetEq.name} khỏi giá đỡ!`;
    }
  };

  const selectedEq = equipments.find((eq) => eq.id === selectedEquipmentId);

  const getCurrentStatus = () => {
    if (activeTool === 'store') {
      return {
        key: 'storing',
        label: 'Cất dụng cụ',
        desc: 'Nhấn vào dụng cụ bất kỳ trên bàn để cất vào kho',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        dotBg: 'bg-rose-500 animate-pulse',
        icon: Archive,
      };
    }

    const actionText = activeHoldActionTextRef.current || '';
    const lowerText = actionText.toLowerCase();

    if (actionText.includes('⚠️') || lowerText.includes('khác hóa chất') || lowerText.includes('chỉ dùng')) {
      return {
        key: 'warning',
        label: 'Khác hóa chất / Sai thao tác',
        desc: actionText,
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        dotBg: 'bg-rose-500 animate-ping',
        icon: AlertTriangle,
      };
    }

    if (
      lowerText.includes('hút') ||
      lowerText.includes('múc') ||
      lowerText.includes('lấy') ||
      (activeTool === 'pipette' && selectedEq?.suckedContent && selectedEq.suckedContent.volumeMl > 0) ||
      (activeTool === 'spatula' && selectedEq?.spatulaContent && selectedEq.spatulaContent.amountGram > 0)
    ) {
      return {
        key: 'taking',
        label: 'Lấy chất',
        desc: actionText || 'Đang hút dung dịch hoặc múc hóa chất',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        dotBg: 'bg-amber-400 animate-ping',
        icon: PipetteIcon,
      };
    }

    if (
      lowerText.includes('nhỏ') ||
      lowerText.includes('trút') ||
      lowerText.includes('rót') ||
      lowerText.includes('trả')
    ) {
      return {
        key: 'releasing',
        label: 'Thả chất / Rót',
        desc: actionText || 'Đang nhỏ giọt hoặc trút hóa chất vào bình',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
        dotBg: 'bg-cyan-400 animate-pulse',
        icon: Droplets,
      };
    }

    const reactingEq = equipments.find(
      (eq) =>
        (eq.content.activeGas != null && eq.content.activeGas.rate > 0) ||
        (eq.content.reactionFxTimer != null && eq.content.reactionFxTimer > 0) ||
        (eq.content.temperatureC && eq.content.temperatureC > 45) ||
        (eq.isBurning && eq.content.volumeMl > 0)
    );

    const completedEq = equipments.find((eq) => eq.content.lastReactionMarkdown != null && eq.content.lastReactionMarkdown !== '');

    if (reactingEq) {
      const gasName = reactingEq.content.activeGas?.name;
      const eqEquation = reactingEq.content.lastReactionMarkdown;
      return {
        key: 'reacting',
        label: 'Phản ứng đang xảy ra',
        desc: eqEquation ? eqEquation : gasName ? `Sủi bọt khí ${gasName}` : 'Đang sủi bọt / đun nóng / kết tủa',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
        dotBg: 'bg-orange-500 animate-ping',
        icon: Flame,
      };
    }

    if (completedEq && completedEq.content.lastReactionMarkdown) {
      return {
        key: 'completed',
        label: 'Phương trình hóa học',
        desc: completedEq.content.lastReactionMarkdown,
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        dotBg: 'bg-emerald-400',
        icon: CheckCircle,
      };
    }

    return {
      key: 'idle',
      label: 'Nhàn rỗi',
      desc: 'Bàn thí nghiệm sẵn sàng - Di chuyển & Thao tác tự do',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      dotBg: 'bg-emerald-400',
      icon: Zap,
    };
  };

  const status = getCurrentStatus();
  const StatusIcon = status.icon;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-6 right-6 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-800/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/60 shadow-xl">
        {/* Left: Dynamic Real-Time Status Card */}
        <div className="flex items-center space-x-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-inner">
          <div className="relative flex items-center justify-center shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${status.dotBg}`} />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-lg border ${status.badgeBg} shrink-0`}>
              <StatusIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Trạng thái:</span>
                <span className="text-xs font-bold text-white">{status.label}</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-300 max-w-[280px] sm:max-w-[420px] truncate">{formatChemicalText(status.desc)}</p>
            </div>
          </div>
        </div>

        {/* Center: Essential Action Controls - Store Mode & Reaction Analysis */}
        <div className="flex items-center space-x-2 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setActiveTool(activeTool === 'store' ? 'move' : 'store')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTool === 'store'
                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400 animate-pulse'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700 border border-rose-500/30'
            }`}
            title="Cất dụng cụ: Bấm vào dụng cụ trên bàn để cất vào kho"
          >
            <Archive className="w-4 h-4 text-rose-400" />
            <span>Cất đồ</span>
          </button>

          <button
            onClick={() => setShowReactionAnalysis(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md border border-cyan-400/40"
            title="Xem phương trình hóa học, giải thích hiện tượng, tính chất dư thừa & biến thiên theo thời gian"
          >
            <TrendingUp className="w-4 h-4 text-cyan-300" />
            <span>Phân Tích Phản Ứng & Biến Thiên</span>
          </button>

          <button
            onClick={() => onOpenChatbot?.()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md border border-blue-400/40"
            title="Hỏi Trợ lý AI Anh Mã giải thích chi tiết hiện tượng phản ứng hóa học đang xảy ra"
          >
            <HippoIcon className="w-4 h-4 text-amber-300" />
            <span>Hỏi Anh Mã Giải Thích</span>
          </button>

          <button
            onClick={() => onResetDesk?.()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 shadow-md"
            title="Reset Thí Nghiệm: Đặt lại các chất & dụng cụ về trạng thái ban đầu"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Thí Nghiệm</span>
          </button>
        </div>

        {/* Selected Tool Controller */}
        {selectedEq && (
          <div className="flex items-center space-x-2 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
            <span className="text-blue-400 font-bold max-w-[130px] truncate">{selectedEq.name}</span>
            {!isExp3 && selectedEq.content.volumeMl > 0 && (
              <span className="text-slate-400">| pH: {selectedEq.content.pH.toFixed(2)}</span>
            )}
            <span className="text-slate-400">| {selectedEq.content.temperatureC}°C</span>

            {/* Dynamic Capacity / Volume Selector for Selected Equipment */}
            {STANDARD_EQUIPMENT_CAPACITIES[selectedEq.type] && (
              <div className="flex items-center space-x-1 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700 text-[11px] font-semibold text-slate-200">
                <span>Dung tích:</span>
                <select
                  value={selectedEq.capacityMl}
                  onChange={(e) => {
                    const newCap = Number(e.target.value);
                    const dims = getEquipmentDimensions(selectedEq.type, newCap);
                    const updated = equipmentsRef.current.map((eq) => {
                      if (eq.id === selectedEq.id) {
                        return {
                          ...eq,
                          capacityMl: newCap,
                          width: dims.width,
                          height: dims.height,
                          name: eq.type === 'pipette' ? `Pipet ${newCap}mL` : eq.name,
                          content: { ...eq.content, volumeMl: Math.min(eq.content.volumeMl, newCap) },
                          suckedContent: eq.suckedContent
                            ? { ...eq.suckedContent, volumeMl: Math.min(eq.suckedContent.volumeMl, newCap) }
                            : null,
                          spatulaContent: eq.spatulaContent
                            ? { ...eq.spatulaContent, amountGram: Math.min(eq.spatulaContent.amountGram, newCap) }
                            : null,
                        };
                      }
                      return eq;
                    });
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className="bg-slate-900 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none cursor-pointer"
                >
                  {STANDARD_EQUIPMENT_CAPACITIES[selectedEq.type].map((cap) => (
                    <option key={cap} value={cap}>
                      {cap} {selectedEq.type === 'spatula' ? 'g' : 'mL'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedEq.type === 'pipette' || selectedEq.type === 'spatula') && (
              <button
                onClick={() => {
                  const updated = equipmentsRef.current.map((eq) => {
                    if (eq.id === selectedEq.id) {
                      return {
                        ...eq,
                        suckedContent: createEmptySolution(),
                        spatulaContent: null,
                        toolMode: 'SUCK' as const,
                        interactionState: 'IDLE' as const,
                      };
                    }
                    return eq;
                  });
                  equipmentsRef.current = updated;
                  setEquipments(updated);
                  activeHoldActionTextRef.current = selectedEq.type === 'pipette' ? '✨ Đã rửa sạch Pipet!' : '✨ Đã rửa sạch Thìa!';
                }}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm"
                title="Rửa sạch hóa chất dư trên dụng cụ về trạng thái ban đầu"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{selectedEq.type === 'pipette' ? 'Rửa Clean Pipet' : 'Rửa Clean Thìa'}</span>
              </button>
            )}

            {(selectedEq.type === 'erlenmeyer' || selectedEq.type === 'beaker' || selectedEq.type === 'test_tube' || selectedEq.type.startsWith('round_flask')) && (
              <button
                onClick={() => {
                  const updated = equipmentsRef.current.map((eq) =>
                    eq.id === selectedEq.id ? { ...eq, isSwirling: !eq.isSwirling, angle: eq.isSwirling ? 0 : 8 } : eq
                  );
                  equipmentsRef.current = updated;
                  setEquipments(updated);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                  selectedEq.isSwirling ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
                title="Lắc xoay tròn 3 ngón tay hòa tan & chuẩn độ dung dịch"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{selectedEq.isSwirling ? 'Đang Lắc Xoay' : 'Lắc 3 Ngón Tay'}</span>
              </button>
            )}

            {/* Dropping Funnel HCl/H2SO4 Stopcock Valve Toggle & Refill */}
            {(selectedEq.hasDroppingFunnel || selectedEq.type.startsWith('round_flask') || selectedEq.name.includes('MnO2') || selectedEq.name.includes('CaCO3') || selectedEq.name.includes('Na2SO3')) && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) => {
                      if (eq.id === selectedEq.id) {
                        const nextValve = !eq.valveOpen;
                        let funnelVol = eq.droppingFunnelVolumeMl;
                        if (nextValve && (funnelVol === undefined || funnelVol <= 0.5)) {
                          funnelVol = 25.0;
                        }
                        if (nextValve) {
                          exp3TimerRef.current = 0; exp4TimerRef.current = 0; exp5TimerRef.current = 0; exp6TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0;
                        }
                        return { ...eq, valveOpen: nextValve, droppingFunnelVolumeMl: funnelVol };
                      }
                      return eq;
                    });
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                    const funnelAxit = selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl';
                    activeHoldActionTextRef.current = !selectedEq.valveOpen
                      ? `💧 Đã mở khóa phễu: Axit ${funnelAxit} đang nhỏ từ từ vào bình!`
                      : `🔒 Đã đóng khóa phễu nhỏ giọt ${funnelAxit}.`;
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm ${
                    selectedEq.valveOpen ? 'bg-emerald-600 text-white animate-pulse' : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                  title={`Xoay mở khóa phễu nhỏ giọt để nhỏ từ từ axit ${selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl'} vào bình`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{selectedEq.valveOpen ? `Khóa Phễu ${selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl'}` : `Mở Khóa Phễu ${selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl'}`}</span>
                </button>

                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) => {
                      if (eq.id === selectedEq.id) {
                        exp3TimerRef.current = 0; exp4TimerRef.current = 0; exp5TimerRef.current = 0; exp6TimerRef.current = 0; exp9TimerRef.current = 0; exp12TimerRef.current = 0;
                        return { ...eq, droppingFunnelVolumeMl: 25.0, valveOpen: true };
                      }
                      return eq;
                    });
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                    const funnelAxit = selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl';
                    activeHoldActionTextRef.current = `🧪 Đã nạp đầy 25mL dung dịch ${funnelAxit} vào phễu & mở khóa!`;
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center space-x-1 shadow-sm"
                  title={`Nạp đầy 25mL dung dịch Axit ${selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl'} vào phễu nhỏ giọt`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nạp Phễu {selectedEq.name.includes('H2SO4') ? 'H₂SO₄' : 'HCl'} (25mL)</span>
                </button>
              </div>
            )}

            {/* Paper Strips Test Buttons (Giấy màu khô & Giấy màu ẩm) */}
            {(selectedEq.type === 'erlenmeyer' || selectedEq.hasDryPaper !== undefined || selectedEq.hasWetPaper !== undefined) && (
              <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-700">
                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, hasDryPaper: !eq.hasDryPaper } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                    activeHoldActionTextRef.current = !selectedEq.hasDryPaper
                      ? '📄 Đã cắm mẩu giấy màu khô vào bình thu khí Cl₂.'
                      : 'Đã tháo giấy màu khô.';
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedEq.hasDryPaper ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                  title="Thử tính chất tẩy màu với mẩu giấy màu khô (Cl2 khô không làm mất màu)"
                >
                  <span>{selectedEq.hasDryPaper ? 'Tháo Giấy Khô' : '📄 Giấy Màu Khô'}</span>
                </button>

                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, hasWetPaper: !eq.hasWetPaper, wetPaperBleachProgress: 0 } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                    activeHoldActionTextRef.current = !selectedEq.hasWetPaper
                      ? '💧 Đã cắm mẩu giấy màu ẩm vào bình thu khí Cl₂. Khí Cl₂ gặp H₂O tạo HClO gây tẩy màu!'
                      : 'Đã tháo giấy màu ẩm.';
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedEq.hasWetPaper ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                  title="Thử tính chất tẩy màu với mẩu giấy màu ẩm (Cl2 + H2O -> HCl + HClO làm mất màu hoàn toàn)"
                >
                  <span>{selectedEq.hasWetPaper ? 'Tháo Giấy Ẩm' : '💧 Giấy Màu Ẩm'}</span>
                </button>
              </div>
            )}

            {selectedEq.type === 'alcohol_burner' && (
              <button
                onClick={() => {
                  const updated = equipmentsRef.current.map((eq) =>
                    eq.id === selectedEq.id ? { ...eq, isBurning: !eq.isBurning, hasCap: eq.isBurning } : eq
                  );
                  equipmentsRef.current = updated;
                  setEquipments(updated);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                  selectedEq.isBurning ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
                title="Dùng nắp đậy dập tắt lửa đèn cồn an toàn"
              >
                <Flame className="w-3 h-3" />
                <span>{selectedEq.isBurning ? 'Đậy Nắp Dập Lửa' : 'Bật Đèn Cồn'}</span>
              </button>
            )}

            {selectedEq.type === 'wooden_splint' && (
              <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-700/80 shadow-md">
                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, angle: eq.angle === 90 ? 0 : 90 } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    selectedEq.angle === 90 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                  title="Đặt que đốm nằm ngang ngay miệng ống nghiệm"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-300" />
                  <span>{selectedEq.angle === 90 ? 'Nằm Ngang (90°)' : 'Xoay Ngang (90°)'}</span>
                </button>

                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, splintState: 'GLOWING' as const, flameColor: 'red' } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    selectedEq.splintState === 'GLOWING'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                  title="Que đốm tàn đỏ sẵn sàng thử khí"
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
                  <span>Tàn Đỏ (Thử Khí)</span>
                </button>

                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, splintState: 'BURNING' as const, flameColor: 'lightblue' } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    selectedEq.splintState === 'BURNING' && selectedEq.flameColor === 'lightblue'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                  title="Cháy với ngọn lửa màu xanh nhạt đặc trưng của khí Hiđro (H2)"
                >
                  <Flame className="w-3 h-3 text-sky-300" />
                  <span>Lửa Xanh H₂</span>
                </button>

                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, splintState: 'BURNING' as const, flameColor: 'bright' } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    selectedEq.splintState === 'BURNING' && selectedEq.flameColor === 'bright'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                  title="Tàn đỏ bùng cháy sáng chói đặc trưng trong khí Oxi (O2)"
                >
                  <Flame className="w-3 h-3 text-amber-200" />
                  <span>Bùng Cháy O₂</span>
                </button>

                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, splintState: 'OFF' as const } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    selectedEq.splintState === 'OFF'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Tắt lửa que đốm"
                >
                  <span>Tắt Lửa</span>
                </button>
              </div>
            )}

            {selectedEq.type === 'burette' && (
              <div className="flex items-center space-x-2.5 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700/80 shadow-md">
                <button
                  onClick={() => {
                    const updated = equipmentsRef.current.map((eq) =>
                      eq.id === selectedEq.id ? { ...eq, valveOpen: !eq.valveOpen } : eq
                    );
                    equipmentsRef.current = updated;
                    setEquipments(updated);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center space-x-1 ${
                    selectedEq.valveOpen ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600 text-white hover:bg-red-500'
                  }`}
                  title="Vặn vòi mở/khóa buret chuẩn độ"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{selectedEq.valveOpen ? 'Đang Nhỏ Giọt (Khóa)' : 'Mở Khóa Buret'}</span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs text-slate-200 pl-1 border-l border-slate-700">
                  <span className="text-[11px] font-medium text-slate-300 whitespace-nowrap">Tốc độ nhỏ giọt:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="2.5"
                    step="0.1"
                    value={selectedEq.dripRate || 0.5}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updated = equipmentsRef.current.map((eq) =>
                        eq.id === selectedEq.id ? { ...eq, dripRate: val } : eq
                      );
                      equipmentsRef.current = updated;
                      setEquipments(updated);
                    }}
                    className="w-20 accent-emerald-400 cursor-pointer h-1.5 bg-slate-600 rounded-lg"
                  />
                  <span className="text-[11px] font-bold text-emerald-400 min-w-[38px]">
                    {((selectedEq.dripRate || 0.5) * 20).toFixed(0)} giọt/s
                  </span>
                </div>
              </div>
            )}

            {(selectedEq.type === 'test_tube' || selectedEq.type === 'beaker' || selectedEq.type === 'erlenmeyer' || selectedEq.type.startsWith('round_flask')) && (
              <button
                onClick={() => {
                  const updated = equipmentsRef.current.map((eq) =>
                    eq.id === selectedEq.id ? { ...eq, angle: eq.angle === 45 ? 0 : 45 } : eq
                  );
                  equipmentsRef.current = updated;
                  setEquipments(updated);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedEq.angle === 45 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
                title="Đặc tính thao tác: Nghiêng góc 45 độ"
              >
                <span>{selectedEq.angle === 45 ? 'Thẳng Đứng' : 'Nghiêng 45°'}</span>
              </button>
            )}

            {/* Assembly / Clamp / Detach buttons */}
            {['lab_stand', 'test_tube', 'alcohol_burner', 'wooden_splint', 'round_flask', 'round_flask_1arm', 'round_flask_2neck', 'burette'].includes(selectedEq.type) && (selectedEq.clampedToStandId || selectedEq.type === 'lab_stand') && (
              <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-700">
                <button
                  onClick={() => handleDetachFromStand(selectedEq.id)}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center space-x-1 transition-all"
                  title={selectedEq.type === 'lab_stand' ? 'Tách tất cả dụng cụ ra khỏi giá' : 'Tách dụng cụ này ra khỏi giá'}
                >
                  <Unlink className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEq.type === 'lab_stand' ? 'Tách Tất Cả' : 'Tách Khỏi Giá'}</span>
                </button>
                {selectedEq.type === 'lab_stand' && (
                  <button
                    onClick={() => handleAddBurnerToStand(selectedEq.id)}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-orange-700 hover:bg-orange-600 text-slate-100 flex items-center space-x-1 transition-all"
                    title="Thêm đèn cồn vào giá đỡ này"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-300" />
                    <span>Thêm Đèn Cồn</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => {
                const updated = equipmentsRef.current.filter((eq) => eq.id !== selectedEq.id);
                equipmentsRef.current = updated;
                setEquipments(updated);
                setSelectedEquipmentId(null);
              }}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors ml-1"
              title="Cất bỏ dụng cụ này khỏi bàn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Store Mode Active Banner */}
      {activeTool === 'store' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 text-rose-200 border border-rose-500/60 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-bounce">
          <Archive className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Chế độ Cất Dụng Cụ BẬT: Bấm vào dụng cụ bất kỳ trên bàn để cất vào kho!</span>
          <button
            onClick={() => setActiveTool('move')}
            className="ml-3 bg-rose-700 hover:bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow"
          >
            Thoát
          </button>
        </div>
      )}

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={620}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={`w-full h-full touch-none transition-opacity ${
          activeTool === 'store' ? 'cursor-pointer' : draggingId ? 'cursor-grabbing' : hoveredEquipment ? 'cursor-grab' : 'cursor-crosshair'
        }`}
      />

      {/* Hover Equipment Info Tooltip */}
      {hoveredEquipment && (() => {
        const primaryChem = getContainerPrimaryChemical(hoveredEquipment);
        const colorInfo = (
          hoveredEquipment.type === 'lab_stand' ||
          hoveredEquipment.type === 'glass_rod' ||
          hoveredEquipment.type === 'tripod_wire_gauze' ||
          hoveredEquipment.type === 'pipette' ||
          hoveredEquipment.type === 'spatula'
        )
          ? null
          : primaryChem
          ? getChemicalColorInfo(primaryChem.id)
          : hoveredEquipment.content.precipitates.length > 0
          ? getChemicalColorInfo(hoveredEquipment.content.precipitates[0].formula)
          : null;

        const isSolidOnly =
          (primaryChem && (primaryChem.state === 'solid' || primaryChem.solubility === false)) ||
          (hoveredEquipment.content.volumeMl <= 0 && hoveredEquipment.content.precipitates.length > 0);

        return (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-1.5 backdrop-blur-md max-w-xs min-w-[200px]"
            style={{
              left: `${Math.min(78, Math.max(2, (mousePos.x / 1000) * 100))}%`,
              top: `${Math.min(75, Math.max(2, (mousePos.y / 620) * 100))}%`,
            }}
          >
            <div className="font-bold text-blue-400 text-sm border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>{hoveredEquipment.name}</span>
              {colorInfo && (
                <span
                  className="w-3 h-3 rounded-full border border-white/50 shrink-0 ml-2"
                  style={{ backgroundColor: colorInfo.badgeColor }}
                />
              )}
            </div>

            {/* Color Annotation */}
            {colorInfo && (
              <div className="text-[11px] text-amber-300 font-medium">
                🎨 Chú thích màu: <span className="text-slate-100">{colorInfo.colorName}</span>
              </div>
            )}

            {hoveredEquipment.type === 'lab_stand' ? (
              <div className="text-slate-200 text-[11px] space-y-1">
                <div>📦 Dụng cụ: <span className="font-semibold text-sky-300">Giá đỡ & Kẹp kim loại</span></div>
                <div>💡 Chức năng: <span className="text-slate-300">Kẹp giữ cố định Buret, Ống nghiệm hoặc Bình tam giác ở độ cao chuẩn độ.</span></div>
              </div>
            ) : hoveredEquipment.type === 'pipette' ? (
              <div className="text-slate-200 text-[11px] space-y-1">
                <div>🧪 Dụng cụ: <span className="font-semibold text-amber-300">Pipet nhỏ giọt ({hoveredEquipment.capacityMl || 10} mL)</span></div>
                {hoveredEquipment.suckedContent && hoveredEquipment.suckedContent.volumeMl > 0 ? (
                  <div className="pt-1 border-t border-slate-800 space-y-0.5">
                    <div className="text-amber-300 font-semibold">
                      💧 Dung dịch trong pipet: {getContainerLabelStr({ content: hoveredEquipment.suckedContent } as any) || 'Dung dịch'}
                    </div>
                    <div>Thể tích đã hút: <span className="text-cyan-300 font-bold">{hoveredEquipment.suckedContent.volumeMl.toFixed(2)} mL</span></div>
                    {!isExp3 && <div>Độ pH: <span className="text-emerald-300 font-bold">{hoveredEquipment.suckedContent.pH.toFixed(1)}</span></div>}
                  </div>
                ) : (
                  <div className="text-slate-400 italic pt-1 border-t border-slate-800">
                    Trạng thái: Pipet trống (Dùng để hút & nhỏ giọt dung dịch)
                  </div>
                )}
              </div>
            ) : hoveredEquipment.type === 'spatula' ? (
              <div className="text-slate-200 text-[11px] space-y-1">
                <div>🥄 Dụng cụ: <span className="font-semibold text-amber-300">Muỗng / Thìa lấy chất rắn</span></div>
                {hoveredEquipment.spatulaContent && hoveredEquipment.spatulaContent.amountGram > 0 ? (
                  <div className="text-amber-300 font-semibold pt-1 border-t border-slate-800">
                    Bột trên muỗng: {hoveredEquipment.spatulaContent.name} ({hoveredEquipment.spatulaContent.amountGram.toFixed(2)} g)
                  </div>
                ) : (
                  <div className="text-slate-400 italic pt-1 border-t border-slate-800">
                    Trạng thái: Muỗng trống (Dùng để múc hóa chất dạng bột/rắn)
                  </div>
                )}
              </div>
            ) : hoveredEquipment.type === 'glass_rod' ? (
              <div className="text-slate-200 text-[11px] space-y-1">
                <div>🥢 Dụng cụ: <span className="font-semibold text-sky-300">Đũa thủy tinh khuấy</span></div>
                <div>💡 Chức năng: <span className="text-slate-300">Dùng khuấy dung dịch tăng tốc độ hòa tan và phản ứng.</span></div>
              </div>
            ) : hoveredEquipment.type === 'tripod_wire_gauze' ? (
              <div className="text-slate-200 text-[11px] space-y-1">
                <div>🔥 Dụng cụ: <span className="font-semibold text-orange-300">Kiềng ba chân & Lưới Amiăng</span></div>
                <div>💡 Chức năng: <span className="text-slate-300">Đế tản nhiệt khi đun bằng Đèn cồn.</span></div>
              </div>
            ) : (
              <>
                {isSolidOnly ? (
                  <div className="text-amber-200/90 text-[11px]">
                    📦 Trạng thái: <span className="font-semibold text-amber-300">Chất rắn / Bột khô (Không có nồng độ M)</span>
                  </div>
                ) : (
                  <div>
                    Thể tích chất lỏng: <span className="text-amber-300 font-semibold">{hoveredEquipment.content.volumeMl.toFixed(1)} / {hoveredEquipment.capacityMl} mL</span>
                  </div>
                )}

                {hoveredEquipment.content.volumeMl > 0 && (
                  <>
                    {!isExp3 && <div>Độ pH: <span className="text-emerald-300 font-semibold">{hoveredEquipment.content.pH.toFixed(2)}</span></div>}
                    <div>Nhiệt độ: <span className="text-orange-400 font-semibold">{hoveredEquipment.content.temperatureC}°C</span></div>
                  </>
                )}

                {/* Dissolved species concentration M */}
                {hoveredEquipment.content.volumeMl > 0 && Object.keys(hoveredEquipment.content.speciesMoles).length > 0 && (
                  <div className="text-[11px] space-y-1 pt-1.5 border-t border-slate-800">
                    <div className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Nồng độ chất tan (C<sub>M</sub> = n / V):</span>
                      <span className="text-[10px] text-cyan-400 font-bold">V = {hoveredEquipment.content.volumeMl.toFixed(1)} mL</span>
                    </div>
                    {Object.entries(hoveredEquipment.content.speciesMoles)
                      .filter(([formula, moles]) => (moles as number) > 0.000005 && formula !== 'H2O')
                      .map(([formula, molesVal]) => {
                        const moles = molesVal as number;
                        const concM = (moles * 1000) / hoveredEquipment.content.volumeMl;
                        const reagent = CHEMICAL_DATABASE.find((c) => c.formula === formula || c.id === formula);
                        const mMass = reagent ? reagent.molarMass : 50;
                        const soluteMassG = moles * mMass;
                        const solutionMassG = soluteMassG + hoveredEquipment.content.volumeMl * 1.0;
                        const concPercent = (soluteMassG / Math.max(0.1, solutionMassG)) * 100;

                        return (
                          <div key={formula} className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 space-y-0.5">
                            <div className="flex justify-between items-center text-slate-200">
                              <span className="font-bold text-amber-300">• {formatFormula(formula)} ({reagent?.name || formula}):</span>
                              <span className="font-bold text-cyan-300">{concM < 0.01 ? concM.toFixed(3) : concM.toFixed(2)} M</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>n = {moles.toFixed(3)} mol ({soluteMassG.toFixed(2)} g)</span>
                              <span>C% = {concPercent.toFixed(2)}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Precipitates / Solid masses */}
                {hoveredEquipment.content.precipitates.length > 0 && (
                  <div className="text-amber-300 font-medium pt-1.5 border-t border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Chất rắn / Bột chưa tan:</span>
                      {hoveredEquipment.content.volumeMl > 0 && (
                        <span className="text-[10px] text-cyan-400 font-normal italic">Khuấy bằng Đũa thủy tinh để tan!</span>
                      )}
                    </div>
                    {hoveredEquipment.content.precipitates.map((p) => (
                      <div key={p.id} className="text-amber-200 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40 text-[11px] flex justify-between">
                        <span>• {p.name} ({formatFormula(p.formula)}):</span>
                        <span className="font-bold">{p.massGram.toFixed(2)} g</span>
                      </div>
                    ))}
                  </div>
                )}

                {hoveredEquipment.content.activeGas && (
                  <div className="text-emerald-400 font-medium animate-pulse pt-1 border-t border-slate-800">
                    Thoát khí: {hoveredEquipment.content.activeGas.name}
                  </div>
                )}

                {/* Experiment 3 Special Bottle Pedagogical Annotations */}
                {hoveredEquipment.name.includes('Bình 1') || hoveredEquipment.name.includes('NaCl') ? (
                  <div className="text-[11px] text-amber-200 bg-amber-950/50 p-2 rounded-lg border border-amber-800/60 space-y-1 mt-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">🧪 Bình 1 (Dung dịch NaCl bão hòa)</div>
                    <div className="text-slate-200">Giữ lại hơi HCl bị bay hơi theo dòng khí Cl₂.</div>
                  </div>
                ) : hoveredEquipment.name.includes('Bình 2') || hoveredEquipment.name.includes('H2SO4') ? (
                  <div className="text-[11px] text-sky-200 bg-sky-950/50 p-2 rounded-lg border border-sky-800/60 space-y-1 mt-1">
                    <div className="font-bold text-sky-300 flex items-center gap-1">🧪 Bình 2 (Dung dịch H₂SO₄ đặc)</div>
                    <div className="text-slate-200">Hút ẩm và làm khô khí Cl₂ trước khi đưa vào bình thu.</div>
                  </div>
                ) : (hoveredEquipment.hasWetPaper !== undefined || hoveredEquipment.hasDryPaper !== undefined || hoveredEquipment.name.includes('Bình thu')) ? (
                  <div className="text-[11px] text-emerald-200 bg-emerald-950/50 p-2 rounded-lg border border-emerald-800/60 space-y-1 mt-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1">🧪 Bình 3 (Bình thu khí Cl₂ rỗng)</div>
                    <div className="text-slate-200">Khí Cl₂ tác dụng với H₂O trên giấy màu ẩm tạo <strong>HClO (Axit hypoclorơ)</strong>.</div>
                    <div className="text-amber-300 font-semibold">✨ HClO có tính oxi hóa rất mạnh làm đứt gãy liên kết màu hữu cơ, làm MẤT MÀU hoàn toàn giấy màu ẩm!</div>
                    <div className="text-slate-400 italic">📄 Mẩu giấy khô không có H₂O nên KHÔNG tạo HClO và không bị mất màu.</div>
                  </div>
                ) : hoveredEquipment.name.includes('NH4Cl') ? (
                  <div className="text-[11px] text-purple-200 bg-purple-950/50 p-2 rounded-lg border border-purple-800/60 space-y-1 mt-1">
                    <div className="font-bold text-purple-300 flex items-center gap-1">🧪 Ống nghiệm 1 (NH₄Cl + Ca(OH)₂)</div>
                    <div className="text-slate-200">Phản ứng điều chế khí NH₃ trong phòng thí nghiệm:</div>
                    <div className="text-amber-300 font-semibold">2NH₄Cl (r) + Ca(OH)₂ (r) →(t°) CaCl₂ (r) + 2NH₃↑ + 2H₂O (h)</div>
                    <div className="text-slate-200 font-medium pt-0.5">✨ Sản phẩm thu được sau phản ứng:</div>
                    <div className="text-emerald-300">• Muối <strong>CaCl₂</strong> và <strong>H₂O</strong> đọng lại trong ống nghiệm 1.</div>
                    <div className="text-sky-300">• Khí <strong>NH₃</strong> nhẹ hơn không khí thoát ra theo ống dẫn sang ống nghiệm 2.</div>
                  </div>
                ) : (hoveredEquipment.name.includes('Úp ngược') || hoveredEquipment.hasRedLitmus) ? (
                  <div className="text-[11px] text-blue-200 bg-blue-950/50 p-2 rounded-lg border border-blue-800/60 space-y-1 mt-1">
                    <div className="font-bold text-blue-300 flex items-center gap-1">🧪 Ống nghiệm 2 (Thu khí NH₃ & Giấy quỳ tím ẩm)</div>
                    <div className="text-slate-200">Đặt 1 mẩu <strong>GIẤY QUỲ TÍM ẨM</strong> bên trong ống nghiệm 2 để nhận biết khí amoniac.</div>
                    <div className="text-sky-300 font-semibold pt-0.5">Phương trình hòa tan thử tính bazơ:</div>
                    <div className="text-amber-200 font-mono">NH₃ (k) + H₂O (l) ⇌ NH₄⁺ (dd) + OH⁻ (dd)</div>
                    <div className="text-emerald-300 font-bold">✨ Ion OH⁻ sinh ra làm GIẤY QUỲ TÍM ẨM HÓA XANH LAM, chứng minh NH₃ có tính bazơ!</div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        );
      })()}

      {/* Reaction Analysis & Time Kinetics Panel Modal */}
      <ReactionAnalysisPanel
        isOpen={showReactionAnalysis}
        onClose={() => setShowReactionAnalysis(false)}
        equipments={equipments}
        selectedEquipmentId={selectedEquipmentId}
      />
    </div>
  );
};
