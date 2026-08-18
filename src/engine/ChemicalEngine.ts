import { SolutionContent, PrecipitateSolid, ActiveGas } from '../types/chemistry';
import { CHEMICAL_DATABASE, CHEMICAL_REACTIONS } from './ChemicalDatabase';

// Helper to blend RGBA colors
export function blendColors(
  colors: { r: number; g: number; b: number; a: number; weight: number }[]
): { r: number; g: number; b: number; a: number } {
  let totalWeight = 0;
  let r = 0,
    g = 0,
    b = 0,
    a = 0;

  for (const c of colors) {
    if (c.weight <= 0) continue;
    totalWeight += c.weight;
    r += c.r * c.weight;
    g += c.g * c.weight;
    b += c.b * c.weight;
    a += c.a * c.weight;
  }

  if (totalWeight <= 0) {
    return { r: 235, g: 245, b: 255, a: 0.15 }; // Default clear liquid
  }

  return {
    r: Math.round(r / totalWeight),
    g: Math.round(g / totalWeight),
    b: Math.round(b / totalWeight),
    a: Math.min(1.0, Math.max(0.1, a / totalWeight)),
  };
}

// Convert Hex or RGBA string to Object
export function parseColorToRgba(colorStr: string): { r: number; g: number; b: number; a: number } {
  if (colorStr.startsWith('rgba')) {
    const parts = colorStr.replace(/rgba\(|\)/g, '').split(',').map((p) => parseFloat(p.trim()));
    return { r: parts[0] || 200, g: parts[1] || 200, b: parts[2] || 200, a: parts[3] ?? 0.5 };
  }
  if (colorStr.startsWith('rgb')) {
    const parts = colorStr.replace(/rgb\(|\)/g, '').split(',').map((p) => parseFloat(p.trim()));
    return { r: parts[0] || 200, g: parts[1] || 200, b: parts[2] || 200, a: 0.8 };
  }
  if (colorStr.startsWith('#')) {
    let hex = colorStr.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 0.8 };
  }
  return { r: 220, g: 235, b: 250, a: 0.3 };
}

// Compute solution pH based on dissolved acids, bases, and indicators
export function calculateSolutionPh(speciesMoles: Record<string, number>, volumeMl: number): number {
  if (volumeMl <= 0) return 7.0;
  const volumeLiter = volumeMl / 1000;

  // Total H+ and OH-
  let totalH = 0;
  let totalOH = 0;

  // Acids
  if (speciesMoles['HCl']) totalH += speciesMoles['HCl'] / volumeLiter;
  if (speciesMoles['H2SO4']) totalH += (speciesMoles['H2SO4'] * 2) / volumeLiter;
  if (speciesMoles['HNO3']) totalH += speciesMoles['HNO3'] / volumeLiter;
  if (speciesMoles['CH3COOH']) {
    const c = speciesMoles['CH3COOH'] / volumeLiter;
    totalH += Math.sqrt(1.8e-5 * c); // Weak acid Ka
  }

  // Bases
  if (speciesMoles['NaOH']) totalOH += speciesMoles['NaOH'] / volumeLiter;
  if (speciesMoles['KOH']) totalOH += speciesMoles['KOH'] / volumeLiter;
  if (speciesMoles['Ba(OH)2']) totalOH += (speciesMoles['Ba(OH)2'] * 2) / volumeLiter;
  if (speciesMoles['Ca(OH)2']) totalOH += (speciesMoles['Ca(OH)2'] * 2) / volumeLiter;
  if (speciesMoles['NH3']) {
    const c = speciesMoles['NH3'] / volumeLiter;
    totalOH += Math.sqrt(1.8e-5 * c); // Weak base Kb
  }

  const netH = totalH - totalOH;
  if (netH > 1e-12) {
    const ph = -Math.log10(netH);
    return Math.max(0.1, Math.min(6.99, parseFloat(ph.toFixed(2))));
  } else if (netH < -1e-12) {
    const netOH = Math.abs(netH);
    const poh = -Math.log10(netOH);
    const ph = 14 - poh;
    return Math.max(7.01, Math.min(13.9, parseFloat(ph.toFixed(2))));
  }

  // Slightly acidic salts (e.g. MnCl2, FeCl3, FeCl2, CuSO4, AlCl3, NH4Cl)
  if (speciesMoles['MnCl2'] || speciesMoles['FeCl3'] || speciesMoles['FeCl2'] || speciesMoles['CuSO4'] || speciesMoles['AlCl3'] || speciesMoles['NH4Cl']) {
    const saltMoles = (speciesMoles['MnCl2'] || 0) + (speciesMoles['FeCl3'] || 0) + (speciesMoles['FeCl2'] || 0) + (speciesMoles['CuSO4'] || 0) + (speciesMoles['AlCl3'] || 0) + (speciesMoles['NH4Cl'] || 0);
    if (saltMoles > 0) {
      const conc = saltMoles / volumeLiter;
      const ph = 7.0 - 0.5 * Math.log10(1 + conc * 10);
      return Math.max(5.0, Math.min(6.8, parseFloat(ph.toFixed(2))));
    }
  }

  return 7.0;
}

// Evaluate indicator color based on indicator type and solution pH
export function getIndicatorColor(indicatorType: 'litmus' | 'phenolphthalein' | 'universal', ph: number): string {
  if (indicatorType === 'litmus') {
    if (ph < 5.0) return 'rgba(235, 45, 45, 0.85)'; // Đỏ axit
    if (ph > 8.0) return 'rgba(30, 80, 240, 0.85)'; // Xanh bazơ
    return 'rgba(138, 43, 226, 0.75)'; // Tím trung tính
  }
  if (indicatorType === 'phenolphthalein') {
    if (ph >= 10.0) {
      return 'rgba(236, 72, 153, 0.90)'; // Hồng tím rực rỡ
    } else if (ph >= 8.2) {
      const ratio = (ph - 8.2) / 1.8;
      const alpha = (0.2 + ratio * 0.65).toFixed(2);
      return `rgba(244, 114, 182, ${alpha})`; // Hồng nhạt chuyển dần
    }
    return 'rgba(240, 245, 255, 0.12)'; // Không màu / Trong suốt khi pH < 8.2
  }
  if (indicatorType === 'universal') {
    if (ph <= 2) return 'rgba(235, 30, 30, 0.85)'; // Đỏ tươi
    if (ph <= 4) return 'rgba(255, 120, 0, 0.85)'; // Cam
    if (ph <= 6) return 'rgba(240, 210, 20, 0.85)'; // Vàng
    if (ph <= 7.5) return 'rgba(40, 180, 40, 0.85)'; // Xanh lá lục
    if (ph <= 9) return 'rgba(30, 140, 230, 0.85)'; // Xanh lam
    if (ph <= 11) return 'rgba(75, 0, 130, 0.85)'; // Chàm
    return 'rgba(148, 0, 211, 0.85)'; // Tím
  }
  return 'rgba(220, 235, 250, 0.2)';
}

// Dissolve any soluble dry solids in precipitates when liquid volume is present
export function dissolveSolublePrecipitates(
  solution: SolutionContent,
  deltaTimeSec: number = 0.1,
  isStirring: boolean = false,
  isBeingHeated: boolean = false
): SolutionContent {
  if (solution.volumeMl <= 0 || !solution.precipitates || solution.precipitates.length === 0) {
    return solution;
  }

  const updatedSpecies = { ...solution.speciesMoles };
  const remainingPrecipitates: PrecipitateSolid[] = [];
  let dissolvedAny = false;

  for (const p of solution.precipitates) {
    const reagent = CHEMICAL_DATABASE.find(
      (c) => c.formula === p.formula || c.id === p.formula || c.name === p.name
    );
    // Soluble if chemical's solubility is not false OR if it's an active oxide reacting with H2O
    const isReactiveWaterSolid = ['CaO', 'Na2O', 'K2O', 'P2O5'].includes(p.formula);
    const isSoluble = reagent ? (reagent.solubility !== false || isReactiveWaterSolid) : true;

    if (isSoluble) {
      const molarMass = reagent ? reagent.molarMass : 100;
      // Dissolution / Reaction rate in g/s:
      // Active water-reactive solid: 0.35 g/s for steady lively reaction
      // Soluble salts dissolve rapidly when mixed into liquid solution (~25.0 g/s)
      // When stirred with glass rod: 30.0 g/s
      // When heated: 15.0 g/s
      const dissolveRateGramsPerSec = isReactiveWaterSolid ? 0.35 : isStirring ? 30.0 : isBeingHeated ? 15.0 : 25.0;
      const massToDissolve = Math.min(p.massGram, dissolveRateGramsPerSec * Math.max(0.02, deltaTimeSec));

      const molesDissolved = massToDissolve / molarMass;
      // Clean formula for aqueous species (e.g. 'CuSO4(khan)' -> 'CuSO4', 'KMnO4(rắn)' -> 'KMnO4')
      const aqFormula = (reagent && reagent.formula)
        ? reagent.formula.replace(/\(rắn\)|\(khan\)/g, '').trim()
        : p.formula.replace(/\(rắn\)|\(khan\)/g, '').trim();

      updatedSpecies[aqFormula] = (updatedSpecies[aqFormula] || 0) + molesDissolved;
      dissolvedAny = true;

      const remainingMass = p.massGram - massToDissolve;
      if (remainingMass > 0.001) {
        remainingPrecipitates.push({
          ...p,
          massGram: remainingMass,
        });
      }
    } else {
      remainingPrecipitates.push(p);
    }
  }

  if (!dissolvedAny) {
    return solution;
  }

  const newPh = calculateSolutionPh(updatedSpecies, solution.volumeMl);
  return {
    ...solution,
    speciesMoles: updatedSpecies,
    precipitates: remainingPrecipitates,
    pH: newPh,
  };
}

// Main Chemical Engine Processor (runs per frame or tick)
export function processSolutionState(
  inputSolution: SolutionContent,
  deltaTimeSec: number,
  isBeingHeated: boolean = false,
  isStirring: boolean = false
): SolutionContent {
  const solution = dissolveSolublePrecipitates(inputSolution, deltaTimeSec, isStirring, isBeingHeated);

  if (solution.volumeMl <= 0 && solution.precipitates.length === 0) {
    return solution;
  }

  const updatedSpecies = { ...solution.speciesMoles };
  let currentTemp = solution.temperatureC;
  let activeGas: ActiveGas | null = solution.activeGas || null;

  // Temperature simulation (Gia nhiệt nhanh khi đun & Hạ nhiệt liên tục về 25°C khi tắt/kéo xa)
  const maxHeatingTemp = solution.volumeMl > 0 ? 100 : 250;
  if (isBeingHeated) {
    currentTemp = Math.min(maxHeatingTemp, currentTemp + 35 * deltaTimeSec);
  } else {
    if (currentTemp > 25) {
      currentTemp = Math.max(25, currentTemp - 4.5 * deltaTimeSec);
    }
  }

  const isBoiling = currentTemp >= 98 && solution.volumeMl > 0;

  // Check and run matching chemical reactions
  let gasEvolutionRate = 0;
  let gasFormula = '';
  let gasColor = 'rgba(240, 245, 255, 0.3)';
  let lastReactionMarkdown: string | undefined = solution.lastReactionMarkdown;
  let reactionFxTimer = solution.reactionFxTimer || 0;

  // Reaction multiplier speeds up with temperature and glass rod stirring
  const tempMultiplier = 1 + (currentTemp - 25) / 25;
  const stirMultiplier = isStirring ? 2.5 : 1.0;
  const reactionRate = 0.8 * tempMultiplier * stirMultiplier * deltaTimeSec;

  let newPrecipitates: PrecipitateSolid[] = solution.precipitates.filter((p) => p.massGram > 0.0001);

  for (const rule of CHEMICAL_REACTIONS) {
    if (rule.requiresHeat && currentTemp < (rule.minTempC || 50)) {
      continue;
    }

    // Special concentration check for Cu + HNO3 (dac vs loang)
    if (rule.id === 'rxn_017_Cu_HNO3_dac') {
      const hno3Moles = updatedSpecies['HNO3'] || 0;
      const hno3Conc = solution.volumeMl > 0 ? hno3Moles / (solution.volumeMl / 1000) : 0;
      if (hno3Conc < 3.5) continue;
    }
    if (rule.id === 'rxn_018_Cu_HNO3_loang') {
      const hno3Moles = updatedSpecies['HNO3'] || 0;
      const hno3Conc = solution.volumeMl > 0 ? hno3Moles / (solution.volumeMl / 1000) : 0;
      if (hno3Conc >= 3.5) continue;
    }

    // Strict State Validation: Non-heat reactions require liquid solvent (solution.volumeMl > 0)
    if (!rule.requiresHeat && solution.volumeMl <= 0) {
      continue;
    }

    // Check if reactants are present in correct state (solid vs aqueous)
    let canReact = true;
    let maxReactMoles = Infinity;

    for (const reactant of rule.reactants) {
      let availableMoles = 0;

      if (reactant.formula === 'H2O') {
        availableMoles = (solution.volumeMl > 0 ? solution.volumeMl / 18.0 : 0) + (updatedSpecies['H2O'] || 0);
      } else {
        // Check both dissolved aqueous species and solid precipitate crystals without double-counting
        const solidItem = newPrecipitates.find((p) => p.formula === reactant.formula);
        if (solidItem) {
          availableMoles = solidItem.massGram / getMolarMass(reactant.formula);
        } else {
          availableMoles = updatedSpecies[reactant.formula] || 0;
        }
      }

      if (availableMoles <= 0.00001) {
        canReact = false;
        break;
      }
      const possibleRuns = availableMoles / reactant.ratio;
      if (possibleRuns < maxReactMoles) {
        maxReactMoles = possibleRuns;
      }
    }

    if (canReact && maxReactMoles > 0) {
      // Record this chemical equation as occurred
      lastReactionMarkdown = rule.equationMarkdown;

      // Fast ionic acid-base / alkali metal / MnO2 reactions react rapidly & stoichiometrically
      const isFastReaction =
        rule.id.includes('HCl_NaOH') ||
        rule.id.includes('H2SO4_NaOH') ||
        rule.id.includes('HNO3_NaOH') ||
        rule.id.includes('CH3COOH_NaOH') ||
        rule.id.includes('MnO2') ||
        rule.reactants.some((r) => ['Na', 'K', 'Li', 'Ca', 'Ba', 'HCl', 'NaOH', 'H2SO4', 'NaCl', 'BaCl2', 'AgNO3', 'CuSO4', 'FeCl3'].includes(r.formula));

      // Calculate realistic reaction completion time T (in seconds) proportional to maxReactMoles (limiting reactant)
      // Larger reactant amounts take proportionally longer to complete.
      // Tốc độ thí nghiệm diễn ra hoàn tất trong đúng 10 giây theo yêu cầu (hoặc 1 giây cho phản ứng trao đổi ion nhanh)
      let baseDurationSec = isFastReaction ? 1.0 : 10.0;

      if (rule.id === 'rxn_C12H22O11_H2SO4') {
        baseDurationSec = 4.0; // Biến đổi đường thành cacbon đen hoàn tất trong ~4 giây
      } else if (rule.id === 'rxn_017_Cu_HNO3_dac' || rule.id === 'rxn_018_Cu_HNO3_loang') {
        baseDurationSec = 10.0;
      }

      const effectiveDurationSec = Math.max(0.2, baseDurationSec / (tempMultiplier * stirMultiplier));

      // Moles reacted per second based on calculated reaction kinetics
      const consumptionRatePerSec = maxReactMoles / effectiveDurationSec;

      // Calculate moles reacted in current frame deltaTimeSec
      let runs = Math.min(maxReactMoles, consumptionRatePerSec * deltaTimeSec);

      // If remaining reactant amount is extremely small (last step), consume completely to finish cleanly
      if (maxReactMoles - runs < 0.00002) {
        runs = maxReactMoles;
      }

      if (runs > 0) {
        reactionFxTimer = 10.0; // All reaction visual effects finish within 10 seconds
        // Consume reactants strictly according to stoichiometry
        for (const reactant of rule.reactants) {
          const molesNeeded = runs * reactant.ratio;
          if (reactant.formula === 'H2O') {
            const currentAqH2O = updatedSpecies['H2O'] || 0;
            if (currentAqH2O >= molesNeeded) {
              updatedSpecies['H2O'] = currentAqH2O - molesNeeded;
            } else {
              updatedSpecies['H2O'] = 0;
              const remainingH2OMoles = molesNeeded - currentAqH2O;
              solution.volumeMl = Math.max(0, solution.volumeMl - remainingH2OMoles * 18.0);
            }
          } else {
            let remainingToDeduct = molesNeeded;
            // 1. Deduct directly from solid precipitate crystal mass if solid exists
            const solidIndex = newPrecipitates.findIndex((p) => p.formula === reactant.formula);
            if (solidIndex >= 0) {
              const molarMass = getMolarMass(reactant.formula);
              const massToDeduct = remainingToDeduct * molarMass;
              newPrecipitates[solidIndex].massGram = Math.max(0, newPrecipitates[solidIndex].massGram - massToDeduct);
              const remainingMass = newPrecipitates[solidIndex].massGram;
              if (remainingMass <= 0.0001) {
                newPrecipitates.splice(solidIndex, 1);
                delete updatedSpecies[reactant.formula];
              } else {
                updatedSpecies[reactant.formula] = remainingMass / molarMass;
              }
            } else {
              // 2. Otherwise deduct from dissolved aqueous species
              const currentAqMoles = updatedSpecies[reactant.formula] || 0;
              if (currentAqMoles > 0) {
                const takenAq = Math.min(currentAqMoles, remainingToDeduct);
                updatedSpecies[reactant.formula] = currentAqMoles - takenAq;
                if (updatedSpecies[reactant.formula] <= 0.000001) {
                  delete updatedSpecies[reactant.formula];
                }
              }
            }
          }
        }

        // Produce products strictly according to stoichiometry
        for (const product of rule.products) {
          if (product.state === 's') {
            // Solid precipitate
            const massGram = runs * product.ratio * getMolarMass(product.formula);
            const existingIndex = newPrecipitates.findIndex((p) => p.formula === product.formula);
            const color = getSolidColor(product.formula);
            const name = getSolidName(product.formula);

            if (existingIndex >= 0) {
              newPrecipitates[existingIndex].massGram += massGram;
            } else {
              newPrecipitates.push({
                id: `${product.formula}_${Date.now()}`,
                formula: product.formula,
                name,
                color,
                massGram,
                settledRatio: 0.1,
              });
            }
          } else if (product.state === 'g') {
            // Gas evolution
            gasEvolutionRate += Math.min(1.0, 0.5 + runs * product.ratio * 250);
            gasFormula = product.formula;
            gasColor = getGasColor(product.formula);
          } else if (product.state === 'aq' || product.state === 'l') {
            updatedSpecies[product.formula] = (updatedSpecies[product.formula] || 0) + runs * product.ratio;
            if (product.formula === 'H2O') {
              // 1 mole of H2O = ~18 mL volume addition
              solution.volumeMl = solution.volumeMl + runs * product.ratio * 18.0;
            }
          }
        }

        // Exothermic heat release
        if (rule.heatChangeJ && rule.heatChangeJ < 0) {
          const heatJ = Math.abs(rule.heatChangeJ) * runs;
          const volForHeat = Math.max(1, solution.volumeMl);
          const maxTemp = rule.id === 'rxn_C12H22O11_H2SO4' ? 180 : 100;
          const tempMultiplier = rule.id === 'rxn_C12H22O11_H2SO4' ? 0.25 : 12.0;
          const deltaT = (heatJ / (volForHeat * 4.184)) * tempMultiplier;
          currentTemp = Math.min(maxTemp, currentTemp + deltaT);
        }
      }
    }
  }

  // Filter out exhausted precipitates
  newPrecipitates = newPrecipitates.filter((p) => p.massGram > 0.0001);

  // Update precipitate settling physics
  for (const p of newPrecipitates) {
    if (p.settledRatio < 1.0) {
      p.settledRatio = Math.min(1.0, p.settledRatio + 0.3 * deltaTimeSec);
    }
  }

  // Active gas bubbles
  if (gasEvolutionRate > 0) {
    activeGas = {
      formula: gasFormula,
      name: `Khí ${gasFormula}`,
      color: gasColor,
      rate: Math.min(1.0, gasEvolutionRate),
    };
  } else if (isBoiling) {
    activeGas = {
      formula: 'H2O(g)',
      name: 'Hơi nước sôi',
      color: 'rgba(255, 255, 255, 0.4)',
      rate: 0.8,
    };
  } else if (solution.activeGas && solution.activeGas.rate > 0.005) {
    // Decay lingering gas evolution rate rapidly so all gas and bubbling effects stop promptly within 10s
    activeGas = {
      ...solution.activeGas,
      rate: Math.max(0, solution.activeGas.rate - 0.35 * deltaTimeSec),
    };
  } else {
    activeGas = null;
  }

  if (reactionFxTimer > 0) {
    reactionFxTimer = Math.max(0, reactionFxTimer - deltaTimeSec);
  }

  // Recalculate pH
  const ph = calculateSolutionPh(updatedSpecies, solution.volumeMl);

  // Determine indicator color
  let indicatorColor: string | undefined = undefined;
  if (solution.indicatorType) {
    indicatorColor = getIndicatorColor(solution.indicatorType, ph);
  }

  // Blend overall liquid color
  const colorWeights: { r: number; g: number; b: number; a: number; weight: number }[] = [];
  const volL = Math.max(0.001, (solution.volumeMl || 50) / 1000);
  let totalSoluteConc = 0;

  // Check if strongly colored species are present
  const hasStrongColoredIon = Object.entries(updatedSpecies).some(
    ([f, m]) => (m / volL) > 0.0001 && (
      f.includes('Cu(NO3)2') || f.includes('CuSO4') || f.includes('KMnO4') || f.includes('FeCl3') || f.includes('FeSO4')
    )
  );

  for (const [formula, moles] of Object.entries(updatedSpecies)) {
    if (moles <= 0.00001) continue;
    if (formula === 'H2O') continue; // Handle solvent H2O separately

    const conc = moles / volL; // Molar concentration (M)
    totalSoluteConc += conc;

    const dbItem = CHEMICAL_DATABASE.find((item) => item.formula === formula || item.id === formula);
    if (dbItem && dbItem.color) {
      const rgba = parseColorToRgba(dbItem.color);
      let weight = Math.min(10.0, conc * 4.0);

      // Strongly colored transition metal salts/complexes dominate liquid tint
      if (formula === 'Cu(NO3)2_dac') {
        weight = Math.min(60.0, Math.max(12.0, conc * 120.0));
      } else if (formula === 'Cu(NO3)2_loang' || formula === 'CuSO4') {
        weight = Math.min(50.0, Math.max(10.0, conc * 100.0));
      } else if (formula === 'KMnO4' || formula === 'FeCl3') {
        weight = Math.min(50.0, Math.max(10.0, conc * 80.0));
      } else if (hasStrongColoredIon && (formula === 'HNO3' || formula === 'HCl' || formula === 'H2SO4' || formula === 'NaOH')) {
        // Suppress clear acid/alkali color weight so it doesn't bleach the vivid metal ion color
        weight = 0.2;
      }

      colorWeights.push({ ...rgba, weight });
    }
  }

  // Base H2O solvent background weight
  const h2oDbItem = CHEMICAL_DATABASE.find((item) => item.formula === 'H2O');
  const h2oRgba = h2oDbItem?.color ? parseColorToRgba(h2oDbItem.color) : { r: 240, g: 240, b: 250, a: 0.15 };
  const h2oWeight = hasStrongColoredIon ? 0.1 : Math.max(0.05, 1.0 - Math.min(0.95, totalSoluteConc * 2.0));
  colorWeights.push({ ...h2oRgba, weight: h2oWeight });

  // If an indicator is present, it strongly dominates liquid color
  if (solution.indicatorType && indicatorColor) {
    const indRgba = parseColorToRgba(indicatorColor);
    colorWeights.push({ ...indRgba, weight: 5.0 });
  }

  const blendedColor = blendColors(colorWeights);

  return {
    ...solution,
    speciesMoles: updatedSpecies,
    temperatureC: parseFloat(currentTemp.toFixed(1)),
    pH: ph,
    colorRgba: blendedColor,
    precipitates: newPrecipitates,
    activeGas,
    lastReactionMarkdown,
    reactionFxTimer,
    indicatorColor,
    isBoiling,
  };
}

// Mix two solutions together
export function mixSolutions(target: SolutionContent, source: SolutionContent, addedVolumeMl: number): SolutionContent {
  if (addedVolumeMl <= 0 || source.volumeMl <= 0) return target;

  const actualAddMl = Math.min(addedVolumeMl, source.volumeMl);
  const ratio = actualAddMl / source.volumeMl;

  const newTargetVol = target.volumeMl + actualAddMl;
  const newSpecies: Record<string, number> = { ...target.speciesMoles };

  // Transfer species
  for (const [formula, moles] of Object.entries(source.speciesMoles)) {
    const transferredMoles = moles * ratio;
    newSpecies[formula] = (newSpecies[formula] || 0) + transferredMoles;
  }

  // Blend temperature
  const blendedTemp =
    target.volumeMl > 0
      ? (target.temperatureC * target.volumeMl + source.temperatureC * actualAddMl) / newTargetVol
      : source.temperatureC;

  // Transfer indicator if present or present in species
  let indicatorType = target.indicatorType || source.indicatorType || null;
  if (!indicatorType) {
    if (newSpecies['Phenolphthalein'] && newSpecies['Phenolphthalein'] > 0.000001) {
      indicatorType = 'phenolphthalein';
    } else if (newSpecies['Litmus'] && newSpecies['Litmus'] > 0.000001) {
      indicatorType = 'litmus';
    } else if (newSpecies['UniversalIndicator'] && newSpecies['UniversalIndicator'] > 0.000001) {
      indicatorType = 'universal';
    }
  }

  // Combine precipitates
  const combinedPrecipitates = [...target.precipitates];
  for (const p of source.precipitates) {
    const transferredMass = p.massGram * ratio;
    if (transferredMass > 0) {
      const existing = combinedPrecipitates.find((item) => item.formula === p.formula);
      if (existing) {
        existing.massGram += transferredMass;
      } else {
        combinedPrecipitates.push({
          ...p,
          massGram: transferredMass,
          settledRatio: 0.2,
        });
      }
    }
  }

  const initialSolution: SolutionContent = {
    volumeMl: newTargetVol,
    temperatureC: parseFloat(blendedTemp.toFixed(1)),
    speciesMoles: newSpecies,
    colorRgba: target.colorRgba,
    pH: calculateSolutionPh(newSpecies, newTargetVol),
    precipitates: combinedPrecipitates,
    indicatorType,
    lastReactionMarkdown: target.lastReactionMarkdown || source.lastReactionMarkdown,
    reactionFxTimer: Math.max(target.reactionFxTimer || 0, source.reactionFxTimer || 0),
  };

  // Immediate process step
  return processSolutionState(initialSolution, 0.1, false, false);
}

// Helper utilities for chemical properties
function getMolarMass(formula: string): number {
  const item = CHEMICAL_DATABASE.find((c) => c.formula === formula || c.id === formula);
  return item ? item.molarMass : 50;
}

export function getChemicalColorInfo(chemicalIdOrFormula: string): {
  colorName: string;
  badgeColor: string;
  stateText: string;
  solubilityText: string;
} {
  const item = CHEMICAL_DATABASE.find((c) => c.id === chemicalIdOrFormula || c.formula === chemicalIdOrFormula);
  const formula = item ? item.formula : chemicalIdOrFormula;

  let colorName = item?.description || 'Không màu (Dung dịch trong suốt)';
  let badgeColor = item?.color || 'rgba(225, 235, 245, 0.8)';
  let stateText = item?.state === 'solid' ? 'Chất rắn (Dạng bột/tinh thể)' : 'Dung dịch lỏng';
  let solubilityText = item?.solubility === false ? 'Không tan trong nước' : 'Tan hoàn toàn';

  switch (formula) {
    case 'HCl':
      colorName = 'Không màu (Dung dịch trong suốt)';
      badgeColor = '#e0f2fe';
      break;
    case 'H2SO4':
      colorName = 'Không màu (Dung dịch trong suốt, sánh như dầu)';
      badgeColor = '#e0f2fe';
      break;
    case 'HNO3':
      colorName = 'Hơi ngả vàng nhạt (Dung dịch trong)';
      badgeColor = '#fef08a';
      break;
    case 'CH3COOH':
      colorName = 'Không màu (Dung dịch axit giấm ăn)';
      badgeColor = '#f8fafc';
      break;
    case 'NaOH':
      colorName = 'Không màu (Dung dịch kiềm trong suốt)';
      badgeColor = '#e0f2fe';
      break;
    case 'Ca(OH)2':
      colorName = 'Không màu / Trắng đục nhẹ (Nước vôi trong)';
      badgeColor = '#f1f5f9';
      break;
    case 'Ba(OH)2':
    case 'KOH':
      colorName = 'Không màu (Dung dịch trong suốt)';
      badgeColor = '#f8fafc';
      break;
    case 'NH3':
      colorName = 'Không màu (Dung dịch amoniak)';
      badgeColor = '#e0f2fe';
      break;
    case 'Fe(OH)2':
      colorName = 'Trắng xanh (Chất rắn kết tủa)';
      badgeColor = '#d1fae5';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'Fe(OH)3':
    case 'Fe2O3':
      colorName = 'Đỏ nâu / Nâu đỏ (Chất rắn kết tủa/bột)';
      badgeColor = '#991b1b';
      stateText = 'Chất rắn (Kết tủa/bột)';
      solubilityText = 'Không tan';
      break;
    case 'Cu(OH)2':
      colorName = 'Xanh lam da trời (Chất rắn kết tủa)';
      badgeColor = '#0284c7';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'Cr(OH)3':
      colorName = 'Lục xám (Chất rắn kết tủa)';
      badgeColor = '#4d7c0f';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'Al(OH)3':
      colorName = 'Trắng keo (Chất rắn kết tủa keo)';
      badgeColor = '#ffffff';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'Zn(OH)2':
    case 'Mn(OH)2':
      colorName = 'Trắng (Chất rắn kết tủa)';
      badgeColor = '#ffffff';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'CuSO4':
      colorName = 'Xanh lam đặc trưng (Dung dịch ion Cu²⁺)';
      badgeColor = '#0284c7';
      break;
    case 'CuSO4(khan)':
      colorName = 'Bột trắng (Chất rắn khan hút ẩm)';
      badgeColor = '#f8fafc';
      stateText = 'Chất rắn (Dạng bột)';
      solubilityText = 'Tan trong nước chuyển sang dung dịch xanh lam';
      break;
    case 'FeCl2':
      colorName = 'Lục nhạt (Dung dịch ion Fe²⁺)';
      badgeColor = '#a7f3d0';
      break;
    case 'FeCl3':
      colorName = 'Vàng nâu / Đỏ nâu (Dung dịch ion Fe³⁺)';
      badgeColor = '#d97706';
      break;
    case 'KMnO4':
      colorName = 'Tím thẫm (Dung dịch/Bột tinh thể thuốc tím)';
      badgeColor = '#7e22ce';
      break;
    case 'CaCO3':
      colorName = 'Trắng (Chất rắn đá vôi / bột)';
      badgeColor = '#ffffff';
      stateText = 'Chất rắn (Dạng bột / Đá vôi)';
      solubilityText = 'Không tan trong nước';
      break;
    case 'BaSO4':
    case 'AgCl':
      colorName = 'Trắng (Chất rắn kết tủa)';
      badgeColor = '#ffffff';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'AgBr':
      colorName = 'Vàng nhạt / Ngà vàng (Chất rắn kết tủa)';
      badgeColor = '#fef08a';
      stateText = 'Chất rắn (Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'AgI':
    case 'S':
      colorName = 'Vàng tươi / Vàng đậm (Chất rắn bột/kết tủa)';
      badgeColor = '#eab308';
      stateText = 'Chất rắn (Bột / Kết tủa)';
      solubilityText = 'Không tan';
      break;
    case 'C':
    case 'CuO':
    case 'FeO':
    case 'CuS':
    case 'PbS':
    case 'Ag2S':
      colorName = 'Màu đen (Chất rắn dạng bột)';
      badgeColor = '#18181b';
      stateText = 'Chất rắn (Dạng bột)';
      solubilityText = 'Không tan';
      break;
    case 'Cu':
      colorName = 'Đỏ đồng / Vàng ánh đỏ (Chất rắn kim loại)';
      badgeColor = '#b45309';
      stateText = 'Chất rắn (Kim loại)';
      solubilityText = 'Không tan trong nước';
      break;
    case 'Fe':
    case 'Zn':
    case 'Al':
    case 'Mg':
      colorName = 'Xám bạc / Trắng ánh kim (Chất rắn kim loại)';
      badgeColor = '#94a3b8';
      stateText = 'Chất rắn (Kim loại)';
      solubilityText = 'Không tan trong nước';
      break;
    case 'CaO':
    case 'BaO':
    case 'P2O5':
      colorName = 'Bột màu trắng (Chất rắn)';
      badgeColor = '#ffffff';
      stateText = 'Chất rắn (Dạng bột)';
      solubilityText = 'Mãnh liệt phản ứng với nước';
      break;
  }

  return { colorName, badgeColor, stateText, solubilityText };
}

export function getSolidColor(formula: string): string {
  const dbItem = CHEMICAL_DATABASE.find((c) => c.formula === formula || c.id === formula);
  if (dbItem && dbItem.color) return dbItem.color;

  switch (formula) {
    case 'BaSO4':
    case 'AgCl':
    case 'CaCO3':
    case 'MgCO3':
    case 'Al(OH)3':
    case 'Zn(OH)2':
    case 'Mn(OH)2':
    case 'CaO':
    case 'BaO':
    case 'P2O5':
    case 'CuSO4(khan)':
      return 'rgba(255, 255, 255, 0.95)'; // Bột/kết tủa màu trắng
    case 'AgBr':
      return 'rgba(254, 240, 138, 0.95)'; // Ngà vàng (vàng nhạt)
    case 'AgI':
    case 'Ag3PO4':
    case 'S':
      return 'rgba(234, 179, 8, 0.95)'; // Vàng đậm / Vàng
    case 'Fe(OH)2':
      return 'rgba(209, 250, 229, 0.95)'; // Trắng xanh
    case 'Fe(OH)3':
    case 'Fe2O3':
      return 'rgba(153, 27, 27, 0.95)'; // Nâu đỏ / Đỏ đất
    case 'Cu(OH)2':
      return 'rgba(2, 132, 199, 0.95)'; // Xanh lam (xanh da trời)
    case 'Cr(OH)3':
      return 'rgba(77, 124, 15, 0.95)'; // Lục xám
    case 'Cr2O3':
      return 'rgba(6, 78, 59, 0.95)'; // Lục thẫm (xanh đen)
    case 'CrO3':
      return 'rgba(136, 19, 55, 0.95)'; // Đỏ thẫm
    case 'Cu2O':
      return 'rgba(185, 28, 28, 0.95)'; // Đỏ gạch
    case 'Cu':
      return 'rgba(180, 83, 9, 0.98)'; // Màu đỏ đồng / vàng ánh đỏ
    case 'FeO':
    case 'CuO':
    case 'MnO2':
    case 'FeS':
    case 'CuS':
    case 'PbS':
    case 'Ag2S':
    case 'C':
      return 'rgba(24, 24, 27, 0.98)'; // Màu đen
    case 'Fe3O4':
      return 'rgba(41, 29, 24, 0.98)'; // Nâu đen
    case 'KMnO4':
      return 'rgba(107, 33, 168, 0.98)'; // Tím sẫm
    case 'Fe':
    case 'Zn':
    case 'Al':
    case 'Mg':
      return 'rgba(148, 163, 184, 0.98)'; // Màu xám kim loại / trắng bạc
    case 'I2':
      return 'rgba(46, 16, 101, 0.95)'; // Tím than
    case 'HNO3':
      return 'rgba(255, 230, 150, 0.4)'; // Vàng nhạt do HNO3 lẫn một ít NO2 khi đun nóng
    default:
      return 'rgba(220, 220, 225, 0.95)';
  }
}

function getSolidName(formula: string): string {
  const dbItem = CHEMICAL_DATABASE.find((c) => c.formula === formula || c.id === formula);
  if (dbItem && dbItem.name) return dbItem.name;

  switch (formula) {
    case 'BaSO4':
      return 'Bari Sunfat (Kết tủa trắng)';
    case 'AgCl':
      return 'Bạc Clorua (Kết tủa trắng)';
    case 'AgBr':
      return 'Bạc Bromua (Kết tủa ngà vàng)';
    case 'AgI':
      return 'Bạc Iotđua (Kết tủa vàng đậm)';
    case 'Cu(OH)2':
      return 'Đồng(II) Hiđroxit (Kết tủa xanh lam)';
    case 'Fe(OH)2':
      return 'Sắt(II) Hiđroxit (Kết tủa trắng xanh)';
    case 'Fe(OH)3':
      return 'Sắt(III) Hiđroxit (Kết tủa nâu đỏ)';
    case 'Cr(OH)3':
      return 'Crom(III) Hiđroxit (Kết tủa lục xám)';
    case 'CaCO3':
      return 'Canxi Cacbonat (Đục vôi/Kết tủa trắng)';
    default:
      return `${formula} (Kết tủa)`;
  }
}

function getGasColor(formula: string): string {
  switch (formula) {
    case 'Cl2':
      return 'rgba(163, 230, 53, 0.45)'; // Vàng lục
    case 'Br2':
    case 'NO2':
      return 'rgba(180, 83, 9, 0.6)'; // Khí/hơi màu đỏ nâu
    default:
      return 'rgba(255, 255, 255, 0.4)'; // Không màu / Sủi bọt trong
  }
}

export function addSolidToSolution(
  solution: SolutionContent,
  chemicalId: string,
  amountGram: number
): SolutionContent {
  if (amountGram <= 0) return solution;

  const reagent = CHEMICAL_DATABASE.find(
    (c) => c.id === chemicalId || c.formula === chemicalId || c.name === chemicalId
  );
  
  const name = reagent ? reagent.name : chemicalId;
  const formula = reagent ? reagent.formula : chemicalId;
  const color = (reagent && reagent.color) ? reagent.color : getSolidColor(formula);

  // Add solid to precipitates layer so it can be seen and dissolved (especially when stirred with glass rod)
  const existingIndex = solution.precipitates.findIndex(
    (p) => p.id === chemicalId || p.formula === formula
  );
  const updatedPrecipitates = [...solution.precipitates];
  if (existingIndex >= 0) {
    updatedPrecipitates[existingIndex] = {
      ...updatedPrecipitates[existingIndex],
      massGram: updatedPrecipitates[existingIndex].massGram + amountGram,
    };
  } else {
    updatedPrecipitates.push({
      id: chemicalId,
      formula,
      name,
      color,
      massGram: amountGram,
      settledRatio: 1.0,
    });
  }

  const initialSolution: SolutionContent = {
    ...solution,
    precipitates: updatedPrecipitates,
  };

  return processSolutionState(initialSolution, 0.1, false, false);
}
