import React, { useState, useEffect } from 'react';
import { EquipmentInstance, ChemicalReactionRule } from '../types/chemistry';
import { CHEMICAL_DATABASE, CHEMICAL_REACTIONS } from '../engine/ChemicalDatabase';
import { formatChemicalText, formatFormula } from '../utils/chemicalFormatter';
import {
  FlaskConical,
  X,
  Sparkles,
  TrendingUp,
  Activity,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Flame,
  Droplets,
  Info,
  Thermometer,
  Zap,
} from 'lucide-react';

interface ReactionAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: EquipmentInstance[];
  selectedEquipmentId?: string | null;
}

export const ReactionAnalysisPanel: React.FC<ReactionAnalysisPanelProps> = ({
  isOpen,
  onClose,
  equipments,
  selectedEquipmentId,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string | null>(selectedEquipmentId || null);
  const [activeTab, setActiveTab] = useState<'equation' | 'phenomenon' | 'calculation' | 'kinetics'>('equation');

  const isExp3 = equipments.some(
    (e) =>
      e.name.includes('MnO2') ||
      e.name.includes('Cl2') ||
      e.name.includes('HCl đặc') ||
      e.name.includes('Phễu / Pipet Nhỏ Giọt Axit HCl đặc')
  );

  useEffect(() => {
    if (selectedEquipmentId) {
      setSelectedEqId(selectedEquipmentId);
    }
  }, [selectedEquipmentId]);

  if (!isOpen) return null;

  // Intelligently select active equipment with chemicals/reactions
  const resolveActiveEquipment = () => {
    const selected = equipments.find((eq) => eq.id === selectedEqId);

    const hasReaction = (eq: EquipmentInstance) => Boolean(eq.content.lastReactionMarkdown);
    const hasActiveGas = (eq: EquipmentInstance) => Boolean(eq.content.activeGas && eq.content.activeGas.rate > 0);
    const hasPrecipitates = (eq: EquipmentInstance) => eq.content.precipitates.some((p) => p.massGram > 0.0001);
    const hasSpecies = (eq: EquipmentInstance) => Object.keys(eq.content.speciesMoles).some((k) => eq.content.speciesMoles[k] > 0.00001);
    const hasVolume = (eq: EquipmentInstance) => eq.content.volumeMl > 0;

    const isUseful = (eq?: EquipmentInstance) =>
      eq && (hasReaction(eq) || hasActiveGas(eq) || hasPrecipitates(eq) || hasSpecies(eq) || hasVolume(eq));

    if (isUseful(selected)) return selected!;

    const withRxn = equipments.find(hasReaction);
    if (withRxn) return withRxn;

    const withGas = equipments.find(hasActiveGas);
    if (withGas) return withGas;

    const withPrecipitates = equipments.find(hasPrecipitates);
    if (withPrecipitates) return withPrecipitates;

    const withSpecies = equipments.find(hasSpecies);
    if (withSpecies) return withSpecies;

    const withVolume = equipments.find(hasVolume);
    if (withVolume) return withVolume;

    return selected || equipments[0];
  };

  const activeEq = resolveActiveEquipment();

  // Calculate Molar Masses
  const getMolarMass = (formula: string): number => {
    const found = CHEMICAL_DATABASE.find((c) => c.formula === formula || c.id === formula);
    return found ? found.molarMass : 50;
  };

  // Identify matching reaction rule from equipment content, species, or products
  const matchedRule: ChemicalReactionRule | undefined = (() => {
    if (!activeEq) return undefined;

    // Collect all equipments in this assembly (if stand, include clamped items)
    const eqList = [activeEq];
    if (activeEq.type === 'lab_stand') {
      equipments.forEach((e) => {
        if (e.clampedToStandId === activeEq.id) eqList.push(e);
      });
    } else if (activeEq.clampedToStandId) {
      const stand = equipments.find((e) => e.id === activeEq.clampedToStandId);
      if (stand) {
        eqList.push(stand);
        equipments.forEach((e) => {
          if (e.clampedToStandId === stand.id && e.id !== activeEq.id) eqList.push(e);
        });
      }
    }

    // 1. Direct match by lastReactionMarkdown across any item in assembly
    for (const eq of eqList) {
      if (eq.content.lastReactionMarkdown) {
        const md = eq.content.lastReactionMarkdown;
        const found = CHEMICAL_REACTIONS.find(
          (r) =>
            r.equationMarkdown === md ||
            r.name === md ||
            r.id === md ||
            md.includes(r.id) ||
            r.equationMarkdown.replace(/\s+/g, '') === md.replace(/\s+/g, '')
        );
        if (found) return found;
      }
    }

    // Also check if ANY equipment in the lab has lastReactionMarkdown
    const globalRxnEq = equipments.find((e) => e.content.lastReactionMarkdown);
    if (globalRxnEq?.content.lastReactionMarkdown) {
      const md = globalRxnEq.content.lastReactionMarkdown;
      const found = CHEMICAL_REACTIONS.find(
        (r) =>
          r.equationMarkdown === md ||
          r.name === md ||
          r.id === md ||
          md.includes(r.id) ||
          r.equationMarkdown.replace(/\s+/g, '') === md.replace(/\s+/g, '')
      );
      if (found) return found;
    }

    // Collect present chemical formulas across assembly
    const species = Array.from(
      new Set(
        eqList.flatMap((eq) =>
          Object.keys(eq.content.speciesMoles).filter(
            (k) => eq.content.speciesMoles[k] > 0.00001
          )
        )
      )
    );

    const precipitateFormulas = Array.from(
      new Set(
        eqList.flatMap((eq) =>
          eq.content.precipitates
            .filter((p) => p.massGram > 0.0001)
            .map((p) => p.formula)
        )
      )
    );

    const gasFormulas = Array.from(
      new Set(
        eqList
          .map((eq) => eq.content.activeGas?.formula)
          .filter((g): g is string => Boolean(g))
      )
    );

    const allPresent = Array.from(new Set([...species, ...precipitateFormulas, ...gasFormulas]));
    const hasWater = eqList.some((eq) => eq.content.volumeMl > 0);

    // 2. Search by reactants
    const reactantMatch = CHEMICAL_REACTIONS.find((r) =>
      r.reactants.every((rec) =>
        rec.formula === 'H2O' ? hasWater || allPresent.includes('H2O') : allPresent.includes(rec.formula)
      )
    );
    if (reactantMatch) return reactantMatch;

    // 3. Search by products created in speciesMoles or precipitates (reaction finished or active)
    const productMatch = CHEMICAL_REACTIONS.find((r) =>
      r.products.some((prod) => allPresent.includes(prod.formula))
    );
    if (productMatch) return productMatch;

    // 4. Fallback: Search all equipments on the canvas for chemicals or reactions
    const allGlobalFormulas = Array.from(
      new Set(
        equipments.flatMap((eq) => [
          ...Object.keys(eq.content.speciesMoles).filter((k) => eq.content.speciesMoles[k] > 0.00001),
          ...eq.content.precipitates.filter((p) => p.massGram > 0.0001).map((p) => p.formula),
          ...(eq.content.activeGas?.formula ? [eq.content.activeGas.formula] : []),
        ])
      )
    );

    if (allGlobalFormulas.length > 0) {
      const globalReactantMatch = CHEMICAL_REACTIONS.find((r) =>
        r.reactants.every((rec) =>
          rec.formula === 'H2O' ? true : allGlobalFormulas.includes(rec.formula)
        )
      );
      if (globalReactantMatch) return globalReactantMatch;

      const globalProductMatch = CHEMICAL_REACTIONS.find((r) =>
        r.products.some((prod) => allGlobalFormulas.includes(prod.formula))
      );
      if (globalProductMatch) return globalProductMatch;
    }

    // 5. Special fallback for KMnO4 (Nhiệt phân KMnO4 -> K2MnO4 + MnO2 + O2)
    if (allPresent.includes('KMnO4') || allGlobalFormulas.includes('KMnO4')) {
      const kmno4Rule = CHEMICAL_REACTIONS.find((r) => r.id === 'rxn_KMnO4_heat');
      if (kmno4Rule) return kmno4Rule;
    }

    return undefined;
  })();

  // Perform Stoichiometric Excess, Limiting Reagent & Thermodynamics Calculations
  const calculateStoichiometry = () => {
    if (!activeEq || !matchedRule) return null;

    const volumeL = Math.max(0.001, activeEq.content.volumeMl / 1000);

    // Estimate completed reaction runs from present products / precipitates / gas
    let completedRuns = 0;
    matchedRule.products.forEach((p) => {
      let pMoles = activeEq.content.speciesMoles[p.formula] || 0;
      const solid = activeEq.content.precipitates.find((item) => item.formula === p.formula);
      if (solid) {
        pMoles += solid.massGram / getMolarMass(p.formula);
      }
      if (pMoles > 0) {
        const runsFromProduct = pMoles / p.ratio;
        if (runsFromProduct > completedRuns) {
          completedRuns = runsFromProduct;
        }
      }
    });

    // Reconstruct initial reactant moles
    const initialMolesMap: Record<string, number> = {};
    matchedRule.reactants.forEach((r) => {
      let currentM = activeEq.content.speciesMoles[r.formula] || 0;
      const solid = activeEq.content.precipitates.find((item) => item.formula === r.formula);
      if (solid) {
        currentM += solid.massGram / getMolarMass(r.formula);
      }
      const initialM = currentM + completedRuns * r.ratio;
      initialMolesMap[r.formula] = Math.max(0.03, initialM);
    });

    // Determine limiting reactant (smallest n0 / coefficient)
    const ratios = matchedRule.reactants.map((r) => {
      const moles = initialMolesMap[r.formula] || 0.03;
      return {
        formula: r.formula,
        ratio: r.ratio,
        moles,
        ratioVal: moles / r.ratio,
      };
    });

    const sortedRatios = [...ratios].sort((a, b) => a.ratioVal - b.ratioVal);
    const limiting = sortedRatios[0];
    const maxTheoreticalRuns = limiting ? limiting.ratioVal : 0.03;
    const runsActual = Math.max(completedRuns, maxTheoreticalRuns, 0.03);

    // Reactant calculation results
    const reactantResults = matchedRule.reactants.map((r) => {
      const initM = initialMolesMap[r.formula] || 0;
      const consumedM = Math.min(initM, runsActual * r.ratio);
      const excessM = Math.max(0, initM - consumedM);
      const molarMass = getMolarMass(r.formula);
      const isLimiting = r.formula === limiting?.formula;

      return {
        formula: r.formula,
        initM,
        consumedM,
        excessM,
        initGram: initM * molarMass,
        consumedGram: consumedM * molarMass,
        excessGram: excessM * molarMass,
        isLimiting,
        concM: excessM / volumeL,
      };
    });

    // Product calculation results
    const productResults = matchedRule.products.map((p) => {
      const generatedM = runsActual * p.ratio;
      const molarMass = getMolarMass(p.formula);
      const gramYield = generatedM * molarMass;
      const gasVolL = p.state === 'g' ? generatedM * 24.79 : 0;

      return {
        formula: p.formula,
        ratio: p.ratio,
        state: p.state,
        generatedM,
        gramYield,
        gasVolL,
        concM: generatedM / volumeL,
      };
    });

    // Thermodynamics & Enthalpy Calculation (deltaH, Heat Q)
    let deltaH_kJ_per_mol = -57.3; // Default exothermic enthalpy estimate (kJ/mol)
    if (matchedRule.heatChangeJ) {
      deltaH_kJ_per_mol = matchedRule.heatChangeJ / 1000;
    } else if (matchedRule.eventTriggers?.heatEffect?.tempRiseC) {
      const rise = matchedRule.eventTriggers.heatEffect.tempRiseC;
      const isExo = matchedRule.eventTriggers.heatEffect.isExothermic;
      deltaH_kJ_per_mol = isExo ? -Math.max(15, rise * 3.2) : Math.max(15, rise * 3.2);
    }

    const heatQ_kJ = Math.abs(deltaH_kJ_per_mol * (runsActual > 0 ? runsActual : 0.05));
    const isExothermic = deltaH_kJ_per_mol < 0;
    const estimatedTempRiseC = parseFloat(
      ((heatQ_kJ * 1000) / (Math.max(10, activeEq.content.volumeMl) * 4.18)).toFixed(1)
    );

    return {
      limitingFormula: limiting?.formula || '',
      maxRuns: runsActual,
      completedRuns,
      reactantResults,
      productResults,
      deltaH_kJ_per_mol,
      heatQ_kJ,
      isExothermic,
      estimatedTempRiseC,
    };
  };

  const stoichData = calculateStoichiometry();

  // Synthetic time-series kinetics simulation data for visualization
  const generateKineticsData = () => {
    if (!matchedRule || !stoichData) {
      return {
        points: [],
        durationSec: 0,
        avgRateMmolSec: 0,
        isFastReaction: false,
        limitingMoles: 0,
      };
    }

    const isFastReaction =
      matchedRule.id.includes('HCl_NaOH') ||
      matchedRule.id.includes('H2SO4_NaOH') ||
      matchedRule.id.includes('HNO3_NaOH') ||
      matchedRule.id.includes('CH3COOH_NaOH') ||
      matchedRule.reactants.some((r) => ['Na', 'K', 'Li', 'Ca', 'Ba', 'HCl', 'NaOH', 'H2SO4'].includes(r.formula));

    const limitingMoles = stoichData.limitingFormula
      ? stoichData.reactantResults.find((r) => r.formula === stoichData.limitingFormula)?.initM || 0.03
      : stoichData.maxRuns || 0.03;

    const baseDurationSec = isFastReaction
      ? Math.max(1.5, Math.min(15.0, 1.2 + 35.0 * limitingMoles))
      : Math.max(2.5, Math.min(35.0, 2.5 + 85.0 * limitingMoles));

    const currentTemp = activeEq?.content.temperatureC || 25;
    const tempMultiplier = 1 + Math.max(0, currentTemp - 25) / 25;
    const durationSec = Math.max(0.5, baseDurationSec / tempMultiplier);
    const avgRateMmolSec = (stoichData.maxRuns * 1000) / durationSec;

    const points = [];
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const t = fraction * durationSec;
      // Smooth kinetic progress curve reaching 100% at t = durationSec
      const progressFactor = fraction === 1.0 ? 1.0 : (1 - Math.exp(-3.5 * fraction)) / (1 - Math.exp(-3.5));
      const progressPercent = Math.min(100, Math.round(progressFactor * 100));

      const reactantsState: Record<string, number> = {};
      const productsState: Record<string, number> = {};

      stoichData.reactantResults.forEach((r) => {
        reactantsState[r.formula] = Math.max(0, r.initM - r.consumedM * progressFactor);
      });
      stoichData.productResults.forEach((p) => {
        productsState[p.formula] = p.generatedM * progressFactor;
      });

      points.push({
        timeSec: t,
        progressPercent,
        reactantsState,
        productsState,
      });
    }

    return {
      points,
      durationSec,
      avgRateMmolSec,
      isFastReaction,
      limitingMoles,
    };
  };

  const kineticsInfo = generateKineticsData();
  const kineticsPoints = kineticsInfo.points;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg text-white">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white flex items-center space-x-2">
                <span>Phân Tích Phản Ứng & Nhiệt Động Học (Enthalpy ΔH)</span>
                <span className="text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/50 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                  Real-time Kinetic Calculation
                </span>
              </h2>

              {/* Equipment Selector Dropdown */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-slate-400">Chọn dụng cụ:</span>
                <select
                  value={activeEq?.id || ''}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="bg-slate-800 text-cyan-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {equipments.map((eq) => {
                    const hasRxn = Boolean(eq.content.lastReactionMarkdown);
                    return (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} {hasRxn ? '⚡ (Có phản ứng)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 overflow-x-auto shrink-0 custom-scrollbar">
          <button
            onClick={() => setActiveTab('equation')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'equation'
                ? 'bg-slate-900 text-blue-400 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>1. Phương Trình Hóa Học</span>
          </button>

          <button
            onClick={() => setActiveTab('phenomenon')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'phenomenon'
                ? 'bg-slate-900 text-amber-400 border-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>2. Hiện Tượng & Enthalpy ΔH</span>
          </button>

          <button
            onClick={() => setActiveTab('calculation')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'calculation'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>3. Tính Toán Chất Dư Thừa</span>
          </button>

          <button
            onClick={() => setActiveTab('kinetics')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'kinetics'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>4. Biến Thiên Theo Thời Gian</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {/* TAB 1: PHƯƠNG TRÌNH PHẢN ỨNG HÓA HỌC */}
          {activeTab === 'equation' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Phương Trình Hóa Học Cân Bằng
                </span>
                <div className="text-lg sm:text-xl font-bold text-amber-300 font-mono tracking-wide py-1">
                  {matchedRule
                    ? formatChemicalText(matchedRule.equationMarkdown)
                    : activeEq?.content.lastReactionMarkdown
                    ? formatChemicalText(activeEq.content.lastReactionMarkdown)
                    : 'Chưa phát hiện phản ứng hóa học rõ rệt trên thiết bị này'}
                </div>
                {matchedRule && (
                  <p className="text-xs text-slate-300 max-w-xl mx-auto italic">
                    "{matchedRule.description}"
                  </p>
                )}
              </div>

              {!matchedRule && (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-800/40 text-amber-300 text-xs flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <strong>Chưa có phản ứng hóa học xảy ra:</strong> {activeEq?.name || 'Vật chứa'}{' '}
                    {activeEq?.content.volumeMl && activeEq.content.volumeMl > 0
                      ? isExp3
                        ? `hiện đang chứa dung dịch (${activeEq.content.volumeMl.toFixed(1)} mL)`
                        : `hiện đang chứa dung dịch (pH = ${activeEq.content.pH.toFixed(2)}, ${activeEq.content.volumeMl.toFixed(1)} mL)`
                      : 'hiện đang chứa chất rắn khan hoặc bình khí'}
                    . Bạn có thể chọn dụng cụ khác ở menu phía trên nếu vừa trộn hóa chất ở dụng cụ khác!
                  </div>
                </div>
              )}

              {matchedRule && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reactants Table */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-blue-400 flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                      <Droplets className="w-4 h-4" />
                      <span>Chất Tham Gia Phản Ứng (Reactants)</span>
                    </h3>
                    <div className="space-y-2">
                      {matchedRule.reactants.map((r) => {
                        const db = CHEMICAL_DATABASE.find((c) => c.formula === r.formula);
                        return (
                          <div
                            key={r.formula}
                            className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-bold text-amber-300">{formatFormula(r.formula)}</span>
                              <span className="text-slate-400 text-[11px] ml-1.5">({db?.name || 'Hóa chất'})</span>
                            </div>
                            <div className="text-right font-mono text-[11px]">
                              <div>Tỷ lệ hệ số: <strong className="text-white">{r.ratio}</strong></div>
                              <div className="text-slate-400">M = {db?.molarMass || 50} g/mol</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sản Phẩm Tạo Thành (Products)</span>
                    </h3>
                    <div className="space-y-2">
                      {matchedRule.products.map((p) => {
                        const db = CHEMICAL_DATABASE.find((c) => c.formula === p.formula);
                        const stateLabel =
                          p.state === 's'
                            ? 'Trạng thái Rắn (Kết tủa)'
                            : p.state === 'g'
                            ? 'Khí sủi bọt (Chất khí)'
                            : p.state === 'l'
                            ? 'Chất lỏng (Dung môi)'
                            : 'Tan trong dung dịch (dd)';

                        return (
                          <div
                            key={p.formula}
                            className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-bold text-emerald-300">{formatFormula(p.formula)}</span>
                              <span className="text-slate-400 text-[11px] ml-1.5">({db?.name || p.formula})</span>
                              <div className="text-[10px] text-cyan-400 italic">{stateLabel}</div>
                            </div>
                            <div className="text-right font-mono text-[11px]">
                              <div>Tỷ lệ hệ số: <strong className="text-white">{p.ratio}</strong></div>
                              <div className="text-slate-400">M = {db?.molarMass || 50} g/mol</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GIẢI THÍCH HIỆN TƯỢNG & NHIỆT ĐỘNG HỌC ENTHALPY ΔH */}
          {activeTab === 'phenomenon' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Giải Thích Hiện Tượng Phản Ứng Hóa Học</span>
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {matchedRule?.description ||
                    'Phản ứng hóa học đang diễn ra làm biến đổi liên kết hóa học, dẫn đến sự chuyển màu dung dịch, tỏa/thu nhiệt hoặc tạo chất mới.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Indicators */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-cyan-400 block border-b border-slate-800 pb-1.5">
                    🎨 Biến Đổi Màu Sắc & Trạng Thái Trực Quan
                  </span>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>
                        <strong>Dung dịch:</strong> Chuyển từ màu ban đầu sang dung dịch sản phẩm có màu đặc trưng.
                      </span>
                    </li>
                    {matchedRule?.eventTriggers?.precipitateEffect && (
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>
                          <strong>Kết tủa xuất hiện:</strong> {matchedRule.eventTriggers.precipitateEffect.formula} ngưng tụ thành chất rắn lơ lửng lắng xuống đáy.
                        </span>
                      </li>
                    )}
                    {matchedRule?.eventTriggers?.bubbleEffect && (
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>
                          <strong>Sủi bọt khí:</strong> Thoát khí {matchedRule.eventTriggers.bubbleEffect.gasName} ({matchedRule.eventTriggers.bubbleEffect.gasFormula}) bốc lên bề mặt.
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Thermochemistry & Enthalpy ΔH */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-orange-400 flex items-center space-x-1 border-b border-slate-800 pb-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Hiệu Ứng Nhiệt Động & Biến Thiên Enthalpy (ΔH)</span>
                  </span>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span>Biến thiên Enthalpy chuẩn (ΔH°):</span>
                      <strong className={`font-mono text-sm ${stoichData?.isExothermic ? 'text-rose-400' : 'text-blue-400'}`}>
                        {stoichData ? `${stoichData.deltaH_kJ_per_mol.toFixed(1)} kJ/mol` : '-57.3 kJ/mol'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span>Nhiệt lượng tỏa / thu (Q):</span>
                      <strong className="text-amber-400 font-mono text-sm">
                        {stoichData ? `${stoichData.heatQ_kJ.toFixed(2)} kJ` : '0.00 kJ'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span>Nhiệt độ hiện tại:</span>
                      <strong className="text-orange-400 font-mono text-sm">
                        {activeEq?.content.temperatureC || 25}°C
                      </strong>
                    </div>

                    {!isExp3 && (
                      <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span>Độ pH dung dịch:</span>
                        <strong className="text-emerald-400 font-mono text-sm">
                          {activeEq?.content.volumeMl && activeEq.content.volumeMl > 0
                            ? `pH = ${activeEq.content.pH.toFixed(2)}`
                            : 'N/A (Khô/Rỗng)'}
                        </strong>
                      </div>
                    )}

                    <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                      ⚡ {stoichData?.isExothermic ? 'Phản ứng tỏa nhiệt (Exothermic, ΔH° < 0) làm dung dịch nóng lên' : 'Phản ứng thu nhiệt (Endothermic, ΔH° > 0)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TÍNH TOÁN CHẤT DƯ THỪA */}
          {activeTab === 'calculation' && (
            <div className="space-y-4">
              {!stoichData && (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-bold text-amber-300">Chưa có phản ứng hóa học trên {activeEq?.name || 'dụng cụ này'}</p>
                  <p>Vui lòng chọn dụng cụ chứa phản ứng từ danh sách phía trên.</p>
                </div>
              )}

              {stoichData && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <Scale className="w-4 h-4" />
                      <span>Xác Định Chất Hết - Chất Dư Thừa & Khối Lượng Sản Phẩm</span>
                    </h3>
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/50">
                      Chất phản ứng hết: {formatFormula(stoichData.limitingFormula)}
                    </span>
                  </div>

                  {/* Reactant Calculation Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">1. Tính Toán Chất Tham Gia (Reactants):</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                            <th className="p-2">Hóa chất</th>
                            <th className="p-2">Ban đầu (n₀)</th>
                            <th className="p-2">Tỷ lệ (n₀ / hệ số)</th>
                            <th className="p-2">Đã phản ứng (Δn)</th>
                            <th className="p-2">Còn dư thừa (n_dư)</th>
                            <th className="p-2">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {stoichData.reactantResults.map((r) => (
                            <tr key={r.formula} className={r.isLimiting ? 'bg-emerald-950/20' : 'bg-slate-950/40'}>
                              <td className="p-2 font-bold text-amber-300">{formatFormula(r.formula)}</td>
                              <td className="p-2 font-mono text-slate-200">
                                {r.initM.toFixed(3)} mol ({r.initGram.toFixed(2)} g)
                              </td>
                              <td className="p-2 font-mono text-cyan-300">
                                {(r.initM / (matchedRule?.reactants.find((k) => k.formula === r.formula)?.ratio || 1)).toFixed(3)}
                              </td>
                              <td className="p-2 font-mono text-rose-300">
                                {r.consumedM.toFixed(3)} mol ({r.consumedGram.toFixed(2)} g)
                              </td>
                              <td className="p-2 font-mono text-emerald-300 font-bold">
                                {r.excessM.toFixed(3)} mol ({r.excessGram.toFixed(2)} g)
                              </td>
                              <td className="p-2">
                                {r.isLimiting ? (
                                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-bold">
                                    HẾT HOÀN TOÀN
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded font-bold">
                                    DƯ THỪA ({r.excessGram.toFixed(2)}g)
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Product Calculation Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300">2. Sản Phẩm Tạo Thành (Theoretical Yield):</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stoichData.productResults.map((p) => (
                        <div key={p.formula} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-300">• {formatFormula(p.formula)}:</span>
                            <span className="font-mono text-cyan-300 font-bold">{p.generatedM.toFixed(3)} mol</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Khối lượng: <strong className="text-white">{p.gramYield.toFixed(2)} g</strong></span>
                            {p.state === 'g' && (
                              <span>Thể tích khí (25°C, 1atm): <strong className="text-amber-300">{p.gasVolL.toFixed(2)} L</strong></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BIẾN THIÊN CÁC CHẤT THEO THỜI GIAN */}
          {activeTab === 'kinetics' && (
            <div className="space-y-4">
              {kineticsPoints.length === 0 && (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-bold text-amber-300">Chưa có dữ liệu động học trên {activeEq?.name || 'dụng cụ này'}</p>
                  <p>Vui lòng chọn dụng cụ đã xảy ra phản ứng từ menu phía trên.</p>
                </div>
              )}

              {kineticsPoints.length > 0 && (
                <div className="space-y-4">
                  {/* Reaction Duration & Kinetics Metrics Summary Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-cyan-800/40 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>Thời Gian Kết Thúc & Tốc Độ Phản Ứng (Reaction Kinetics)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/50">
                        Phản ứng kết thúc sau T = {kineticsInfo.durationSec.toFixed(1)}s
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[11px] block">Lượng chất giới hạn (n):</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {kineticsInfo.limitingMoles.toFixed(3)} mol
                        </span>
                        <span className="text-[10px] text-slate-400 block italic">Quyết định thời gian kết thúc</span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[11px] block">Thời gian phản ứng (T):</span>
                        <span className="font-mono font-bold text-cyan-300 text-sm">
                          {kineticsInfo.durationSec.toFixed(1)} giây
                        </span>
                        <span className="text-[10px] text-slate-400 block italic">
                          {kineticsInfo.isFastReaction ? 'Phản ứng ion / trung hòa nhanh' : 'Phản ứng phân hủy / oxy hóa'}
                        </span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[11px] block">Tốc độ tiêu thụ trung bình (v):</span>
                        <span className="font-mono font-bold text-emerald-300 text-sm">
                          {kineticsInfo.avgRateMmolSec.toFixed(2)} mmol/s
                        </span>
                        <span className="text-[10px] text-slate-400 block italic">
                          Tăng khi đun nóng / khuấy
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 italic">
                      💡 <strong>Nguyên lý Động học:</strong> Thời gian hoàn thành phản ứng $T$ được tính toán trực tiếp từ số mol chất tham gia $n$. Lượng hóa chất lớn hơn yêu cầu thời gian lớn hơn để tiêu thụ hoàn toàn. Đun nóng hoặc khuấy đũa thủy tinh làm tăng hằng số tốc độ $k$, giúp rút ngắn thời gian $T$.
                    </p>
                  </div>

                  {/* Visual Progress Bar & Species Evolution Graph */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                        <TrendingUp className="w-4 h-4" />
                        <span>Đồ Thị & Bảng Biến Thiên Số Mol Theo Thời Gian (Kinetic Timeline)</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">0.0s → {kineticsInfo.durationSec.toFixed(1)}s</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {kineticsPoints.map((pt, idx) => (
                        <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between items-center font-mono">
                            <span className="font-bold text-slate-300">⏱️ t = {pt.timeSec.toFixed(1)}s ({((pt.timeSec / (kineticsInfo.durationSec || 1)) * 100).toFixed(0)}% T)</span>
                            <span className="text-cyan-400 font-bold">Tiến độ phản ứng: {pt.progressPercent}%</span>
                          </div>

                          {/* Visual Kinetic Progress Bar */}
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                            <div
                              className="bg-rose-500 h-full transition-all duration-300"
                              style={{ width: `${100 - pt.progressPercent}%` }}
                              title="Chất tham gia giảm dần"
                            />
                            <div
                              className="bg-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${pt.progressPercent}%` }}
                              title="Sản phẩm tăng dần"
                            />
                          </div>

                          <div className="flex flex-wrap justify-between text-[11px] text-slate-400 pt-0.5 gap-2">
                            <span className="text-rose-300">
                              Chất tham gia: {Object.entries(pt.reactantsState).map(([f, m]) => `${formatFormula(f)}: ${(m as number).toFixed(3)}m`).join(', ')}
                            </span>
                            <span className="text-emerald-300">
                              Sản phẩm: {Object.entries(pt.productsState).map(([f, m]) => `${formatFormula(f)}: ${(m as number).toFixed(3)}m`).join(', ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-xl shadow-md transition-all"
          >
            Đóng Bảng Phân Tích
          </button>
        </div>
      </div>
    </div>
  );
};
