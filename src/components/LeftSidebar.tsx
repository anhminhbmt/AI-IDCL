import React, { useState, useEffect } from 'react';
import {
  EquipmentType,
  EquipmentInstance,
  PresetExperiment,
} from '../types/chemistry';
import { CHEMICAL_DATABASE } from '../engine/ChemicalDatabase';
import { PRESET_EXPERIMENTS, createEquipment, STANDARD_EQUIPMENT_CAPACITIES } from '../engine/EquipmentClass';
import { getChemicalColorInfo } from '../engine/ChemicalEngine';
import { formatFormula, formatChemicalText } from '../utils/chemicalFormatter';
import {
  FlaskConical,
  Beaker as BeakerIcon,
  TestTube,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  Plus,
  Atom,
  Layers,
  UtensilsCrossed,
  X,
  Pipette,
} from 'lucide-react';

interface LeftSidebarProps {
  onAddEquipment: (eq: EquipmentInstance) => void;
  onLoadPreset: (preset: PresetExperiment) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const EQUIPMENT_INFO: Record<EquipmentType, { name: string; icon: React.FC<{ className?: string }>; desc: string }> = {
  beaker: { name: 'Cốc đốt (Becher)', icon: BeakerIcon, desc: 'Dụng cụ chứa & pha chế dung dịch' },
  test_tube: { name: 'Ống nghiệm', icon: TestTube, desc: 'Thực hiện phản ứng dung tích nhỏ' },
  erlenmeyer: { name: 'Bình tam giác', icon: FlaskConical, desc: 'Thích hợp lắc & chuẩn độ' },
  round_flask: { name: 'Bình cầu', icon: Atom, desc: 'Đun nóng & chưng cất (0, 1, 2 nhánh)' },
  round_flask_1arm: { name: 'Bình cầu 1 nhánh', icon: Atom, desc: 'Bình cầu có nhánh chiết / chưng cất' },
  round_flask_2neck: { name: 'Bình cầu 2 nhánh', icon: Atom, desc: 'Bình cầu 2 cổ gắn phản ứng & đo đạc' },
  graduated_cylinder: { name: 'Ống đong', icon: Layers, desc: 'Đo thể tích chất lỏng chính xác' },
  burette: { name: 'Buret chuẩn độ', icon: Sliders, desc: 'Thả nhỏ giọt chuẩn độ axit-bazơ' },
  pipette: { name: 'Ống Pipet / Dropper', icon: Pipette, desc: 'Hút & nhỏ chính xác chất lỏng' },
  spatula: { name: 'Muỗng múc bột (Spatula)', icon: UtensilsCrossed, desc: 'Múc chất rắn dạng bột/tinh thể' },
  glass_rod: { name: 'Đũa thủy tinh', icon: Sliders, desc: 'Khuấy đều dung dịch, hòa tan & tách lớp chất rắn' },
  alcohol_burner: { name: 'Đèn cồn', icon: Flame, desc: 'Nguồn đun nóng phản ứng' },
  tripod_wire_gauze: { name: 'Kiềng & Lưới amiăng', icon: Layers, desc: 'Kê & phân tán nhiệt khi đun' },
  lab_stand: { name: 'Giá đỡ & Kẹp', icon: Layers, desc: 'Kẹp cố định ống nghiệm/buret' },
  chemical_bottle: { name: 'Chai hóa chất gốc', icon: Atom, desc: 'Chai lưu trữ hóa chất phòng thí nghiệm' },
  wooden_splint: { name: 'Que đốm gỗ (Thử khí)', icon: Flame, desc: 'Que đốm thử O2 (bùng cháy), H2 (lửa xanh nhạt)' },
  fabric_strip: { name: 'Mẩu vải màu', icon: Atom, desc: 'Mẩu vải dùng để thử tính tẩy màu (vd: khí Clo ẩm, Nước Javel)' },
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onAddEquipment,
  onLoadPreset,
  isOpen,
  setIsOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'chemical' | 'presets'>('equipment');

  // Modal / Selection bar state for adding equipment with capacity
  const [selectedModalType, setSelectedModalType] = useState<EquipmentType | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<number>(100);

  // Chemical creation state sliders
  const [selectedChemId, setSelectedChemId] = useState<string>('HCl');
  const [chemForm, setChemForm] = useState<'liquid' | 'solid'>('liquid');
  const [concentrationM, setConcentrationM] = useState<number>(1.0);
  const [volumeMl, setVolumeMl] = useState<number>(50);
  const [solidMassG, setSolidMassG] = useState<number>(5.0);
  const [targetEquipmentType, setTargetEquipmentType] = useState<EquipmentType>('beaker');

  const selectedChem = CHEMICAL_DATABASE.find((c) => c.id === selectedChemId);
  const isAcid = selectedChem?.type === 'acid';
  const isInsoluble = Boolean(selectedChem && ((selectedChem.solubility as boolean | undefined) === false || (selectedChem.state === 'solid' && (selectedChem.solubility as boolean | undefined) === false)));
  const isGas = Boolean(selectedChem && (selectedChem.state === 'gas' || selectedChem.type === 'gas_container'));

  useEffect(() => {
    if (!selectedChem) return;
    const isGasSelected = selectedChem.state === 'gas' || selectedChem.type === 'gas_container';
    if (isGasSelected) {
      setChemForm('liquid');
      if (targetEquipmentType === 'beaker') {
        setTargetEquipmentType('chemical_bottle');
      }
    } else if (selectedChem.type === 'acid') {
      setChemForm('liquid');
    } else if (selectedChem.state === 'solid' && (selectedChem.solubility as boolean | undefined) === false) {
      setChemForm('solid');
    } else {
      setChemForm('liquid');
    }
  }, [selectedChemId, selectedChem, targetEquipmentType]);

  const handleOpenEquipmentModal = (type: EquipmentType) => {
    const capacities = STANDARD_EQUIPMENT_CAPACITIES[type];
    if (capacities && capacities.length > 0) {
      setSelectedModalType(type);
      setSelectedCapacity(capacities[Math.floor(capacities.length / 2)] || capacities[0]);
    } else {
      // Equipment without volume capacities (e.g. glass rod, tripod)
      onAddEquipment(createEquipment(type, 380 + Math.random() * 80, 240 + Math.random() * 40));
    }
  };

  const handleConfirmAddEquipment = () => {
    if (!selectedModalType) return;
    const eq = createEquipment(
      selectedModalType,
      380 + Math.random() * 80,
      240 + Math.random() * 40,
      undefined,
      undefined,
      50,
      1.0,
      selectedCapacity
    );
    onAddEquipment(eq);
    setSelectedModalType(null);
  };

  const handleCreateChemicalInEquipment = () => {
    let targetCap = 250;
    if (targetEquipmentType === 'chemical_bottle') targetCap = 500;
    else if (targetEquipmentType === 'beaker') targetCap = 250;
    else if (targetEquipmentType === 'erlenmeyer') targetCap = 250;
    else if (targetEquipmentType === 'test_tube') targetCap = 30;
    else if (targetEquipmentType === 'round_flask') targetCap = 250;

    const isSolidSelected = isAcid ? false : chemForm === 'solid';

    const eq = createEquipment(
      targetEquipmentType,
      350 + Math.random() * 100,
      250 + Math.random() * 50,
      selectedChem ? `${selectedChem.name}` : 'Bình chứa',
      selectedChemId,
      volumeMl,
      concentrationM,
      targetCap,
      isSolidSelected,
      solidMassG
    );
    onAddEquipment(eq);
  };

  return (
    <div
      className={`relative flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 transition-all duration-300 z-20 shadow-2xl ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3.5 top-5 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full shadow-lg border border-slate-700 transition-transform z-30"
        title={isOpen ? 'Thu gọn' : 'Mở rộng'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-sm text-slate-100 tracking-wide uppercase">Dụng Cụ & Hóa Chất</h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'equipment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BeakerIcon className="w-3.5 h-3.5" />
              <span>Dụng Cụ</span>
            </button>
            <button
              onClick={() => setActiveTab('chemical')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'chemical' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>Hóa Chất</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'presets' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mẫu Thí Nghiệm</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {/* TAB 1: EQUIPMENT GRID */}
            {activeTab === 'equipment' && (
              <div className="space-y-4">
                {/* Glassware Containers */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1">
                    <TestTube className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dụng Cụ Chứa & Thủy Tinh</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'beaker' as EquipmentType, icon: BeakerIcon, color: 'text-cyan-400' },
                      { type: 'test_tube' as EquipmentType, icon: TestTube, color: 'text-blue-400' },
                      { type: 'erlenmeyer' as EquipmentType, icon: FlaskConical, color: 'text-indigo-400' },
                      { type: 'round_flask' as EquipmentType, icon: Atom, color: 'text-teal-400' },
                    ].map(({ type, icon: Icon, color }) => (
                      <button
                        key={type}
                        onClick={() => handleOpenEquipmentModal(type)}
                        className="p-3 bg-slate-800/80 hover:bg-slate-700/90 rounded-xl border border-slate-700/70 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:border-blue-500/50 hover:shadow-lg active:scale-95"
                      >
                        <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-bold text-slate-200">{EQUIPMENT_INFO[type].name}</span>
                        <span className="text-[10px] text-slate-400">Bấm để chọn thể tích</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volumetric Tools */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Đo Lường Thể Tích & Chuẩn Độ</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'pipette' as EquipmentType, icon: Pipette, color: 'text-amber-400' },
                      { type: 'graduated_cylinder' as EquipmentType, icon: Layers, color: 'text-amber-300' },
                      { type: 'burette' as EquipmentType, icon: Sliders, color: 'text-emerald-400', fullWidth: true },
                    ].map(({ type, icon: Icon, color, fullWidth }) => (
                      <button
                        key={type}
                        onClick={() => handleOpenEquipmentModal(type)}
                        className={`p-3 bg-slate-800/80 hover:bg-slate-700/90 rounded-xl border border-slate-700/70 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:border-amber-500/50 hover:shadow-lg active:scale-95 ${
                          fullWidth ? 'col-span-2' : ''
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-bold text-slate-200">{EQUIPMENT_INFO[type].name}</span>
                        <span className="text-[10px] text-slate-400">Bấm để chọn thể tích</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auxiliary & Heating Tools */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Dụng Cụ Hỗ Trợ & Gia Nhiệt</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'glass_rod' as EquipmentType, icon: Sliders, color: 'text-cyan-300', note: 'Khuấy & Tách lớp' },
                      { type: 'spatula' as EquipmentType, icon: UtensilsCrossed, color: 'text-amber-400', note: 'Múc chất rắn' },
                      { type: 'alcohol_burner' as EquipmentType, icon: Flame, color: 'text-orange-400', note: 'Gia nhiệt' },
                      { type: 'wooden_splint' as EquipmentType, icon: Flame, color: 'text-amber-300', note: 'Que đốm thử khí' },
                      { type: 'tripod_wire_gauze' as EquipmentType, icon: Layers, color: 'text-emerald-400', note: 'Kiềng đun' },
                      { type: 'lab_stand' as EquipmentType, icon: Layers, color: 'text-slate-400', note: 'Giá đỡ' },
                    ].map(({ type, icon: Icon, color, note }, idx) => (
                      <button
                        key={`${type}_${idx}`}
                        onClick={() => handleOpenEquipmentModal(type)}
                        className="p-2.5 bg-slate-800/80 hover:bg-slate-700/90 rounded-xl border border-slate-700/70 flex flex-col items-center justify-center text-center space-y-1 transition-all group hover:border-blue-500/50 hover:shadow-lg active:scale-95"
                      >
                        <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-bold text-slate-200">{EQUIPMENT_INFO[type].name}</span>
                        <span className="text-[10px] text-slate-400">{note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHEMICAL SELECTION & SLIDERS */}
            {activeTab === 'chemical' && (
              <div className="space-y-4">
                {/* Chemical Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Chọn Hóa Chất:</label>
                  <select
                    value={selectedChemId}
                    onChange={(e) => setSelectedChemId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <optgroup label="💧 Dung môi & Nước cất">
                      <option value="H2O">H2O - Nước cất tinh khiết (Pha dung dịch)</option>
                    </optgroup>
                    <optgroup label="Axit">
                      {CHEMICAL_DATABASE.filter((c) => c.type === 'acid').map((c) => (
                        <option key={c.id} value={c.id}>
                          {formatFormula(c.formula)} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Bazơ">
                      {CHEMICAL_DATABASE.filter((c) => c.type === 'base').map((c) => (
                        <option key={c.id} value={c.id}>
                          {formatFormula(c.formula)} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Muối">
                      {CHEMICAL_DATABASE.filter((c) => c.type === 'salt').map((c) => (
                        <option key={c.id} value={c.id}>
                          {formatFormula(c.formula)} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Đơn chất (Kim loại / Phi kim)">
                      {CHEMICAL_DATABASE.filter((c) => c.type === 'element').map((c) => (
                        <option key={c.id} value={c.id}>
                          {formatFormula(c.formula)} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Oxit & Chất khí">
                      {CHEMICAL_DATABASE.filter((c) => c.type === 'oxide' || c.type === 'gas_container').map((c) => (
                        <option key={c.id} value={c.id}>
                          {formatFormula(c.formula)} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🧪 Chất chỉ thị màu (Phenolphthalein / Quỳ tím)">
                      {CHEMICAL_DATABASE.filter((c) => c.type === 'indicator').map((c) => (
                        <option key={c.id} value={c.id}>
                          🧪 {formatFormula(c.formula)} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Chemical Color Annotation & Description Card */}
                {selectedChem && (() => {
                  const colorInfo = getChemicalColorInfo(selectedChem.id);
                  return (
                    <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0"
                          style={{ backgroundColor: colorInfo.badgeColor }}
                        />
                        <span className="font-bold text-amber-300 text-sm">
                          {formatFormula(selectedChem.formula)} - {selectedChem.name}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="flex items-start space-x-1">
                          <span className="font-bold text-slate-400 shrink-0">🎨 Chú thích màu:</span>
                          <span className="font-semibold text-cyan-300">{colorInfo.colorName}</span>
                        </div>
                        <div className="flex items-start space-x-1">
                          <span className="font-bold text-slate-400 shrink-0">🏷️ Trạng thái:</span>
                          <span className="text-slate-200">{colorInfo.stateText}</span>
                        </div>
                        <div className="flex items-start space-x-1">
                          <span className="font-bold text-slate-400 shrink-0">💧 Tính tan:</span>
                          <span className="text-slate-200">{colorInfo.solubilityText}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 italic border-t border-slate-700/50">
                          {selectedChem.description}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Chemical Form Selector: Dung dịch vs Chất rắn vs Chất khí */}
                {selectedChemId !== 'H2O' && (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Dạng hóa chất khi lấy:</label>
                    {isGas ? (
                      <div className="space-y-1">
                        <div className="p-2.5 bg-sky-900/60 border border-sky-500/70 rounded-xl text-xs font-bold text-sky-200 text-center shadow flex items-center justify-center space-x-1.5">
                          <span>💨 Dạng chất khí</span>
                        </div>
                        <p className="text-[11px] text-sky-300 mt-1.5 italic">
                          ℹ️ Các chất khí chỉ tồn tại ở dạng khí và chỉ được chứa trong các bình kín có nút đậy.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {!isInsoluble && (
                            <button
                              type="button"
                              onClick={() => setChemForm('liquid')}
                              className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                                chemForm === 'liquid'
                                  ? 'bg-blue-600 text-white border-blue-400 shadow ring-1 ring-blue-300'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              💧 Dung dịch lỏng
                            </button>
                          )}
                          {!isAcid && (
                            <button
                              type="button"
                              onClick={() => setChemForm('solid')}
                              className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                                chemForm === 'solid'
                                  ? 'bg-amber-600 text-white border-amber-400 shadow ring-1 ring-amber-300'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              🧱 Chất rắn / Bột
                            </button>
                          )}
                        </div>
                        {isAcid && (
                          <p className="text-[11px] text-blue-400 mt-1.5 italic">
                            ℹ️ Axit trong phòng thí nghiệm luôn ở dạng dung dịch lỏng.
                          </p>
                        )}
                        {isInsoluble && (
                          <p className="text-[11px] text-amber-400 mt-1.5 italic">
                            ℹ️ Chất rắn không tan chỉ ở dạng bột / kết tủa (không thể pha dạng dung dịch lỏng).
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Target Equipment Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Chứa hóa chất trong:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(isGas
                      ? [
                          { type: 'chemical_bottle' as EquipmentType, label: '🫙 Chai chứa khí (Bình kín)' },
                          { type: 'erlenmeyer' as EquipmentType, label: '🧪 Bình tam giác (Bình kín)' },
                          { type: 'test_tube' as EquipmentType, label: '🧪 Ống nghiệm (Bình kín)' },
                          { type: 'round_flask' as EquipmentType, label: '🧪 Bình cầu (Bình kín)' },
                        ]
                      : [
                          { type: 'beaker' as EquipmentType, label: '🧪 Cốc đốt (Beaker)' },
                          { type: 'test_tube' as EquipmentType, label: '🧪 Ống nghiệm (Test tube)' },
                          { type: 'erlenmeyer' as EquipmentType, label: '🧪 Bình tam giác (Flask)' },
                          { type: 'chemical_bottle' as EquipmentType, label: '🫙 Bình chứa gốc' },
                        ]
                    ).map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setTargetEquipmentType(type)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                          targetEquipmentType === type
                            ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-1 ring-amber-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {isGas && (
                    <p className="text-[11px] text-amber-300 mt-1.5 italic">
                      🔒 Khí chỉ được chứa trong các bình kín có nút đậy bảo vệ để tránh thoát khí.
                    </p>
                  )}
                </div>

                {/* Sliders for Gas, Solid, or Liquid */}
                {isGas ? (
                  <div className="space-y-3 p-3 bg-sky-950/50 border border-sky-800/70 rounded-xl text-xs text-sky-200">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-sky-300 font-bold">Thể tích khí nạp vào bình (mL):</span>
                        <span className="font-bold text-cyan-300">{volumeMl} mL</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={volumeMl}
                        onChange={(e) => setVolumeMl(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {selectedChem && (() => {
                      const moles = volumeMl / 24790;
                      const massG = moles * (selectedChem.molarMass || 30);
                      return (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-sky-800/50 font-mono text-[11px] space-y-1">
                          <div className="flex justify-between text-cyan-300 font-bold">
                            <span>Số mol khí (n = V / 24.79):</span>
                            <span>{moles.toFixed(4)} mol</span>
                          </div>
                          <div className="flex justify-between text-amber-300 font-bold">
                            <span>Khối lượng khí (m = n × M):</span>
                            <span>{massG.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                            <span>Molar Mass (M): {selectedChem.molarMass || 30} g/mol</span>
                            <span>{volumeMl} mL ({(volumeMl / 1000).toFixed(3)} L)</span>
                          </div>
                        </div>
                      );
                    })()}

                    <p className="text-[10px] leading-relaxed text-sky-200/90 pt-1 border-t border-sky-800/40 italic">
                      💡 Khí được đậy kín trong bình bằng nút bảo vệ. Khi mở nút hoặc kết nối ống dẫn, khí có thể thoát ra sục vào giải pháp.
                    </p>
                  </div>
                ) : chemForm === 'solid' && selectedChemId !== 'H2O' ? (
                  <div className="space-y-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-300 font-bold">Khối lượng chất rắn (g):</span>
                        <span className="font-bold text-amber-200">{solidMassG} g</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="50.0"
                        step="0.5"
                        value={solidMassG}
                        onChange={(e) => setSolidMassG(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Calculated moles for solid */}
                    {selectedChem && (
                      <div className="p-2 bg-slate-900/80 rounded-lg border border-amber-800/40 font-mono text-[11px] space-y-0.5">
                        <div className="flex justify-between text-amber-300 font-bold">
                          <span>Số mol (n = m/M):</span>
                          <span>{(solidMassG / (selectedChem.molarMass || 50)).toFixed(4)} mol</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Mối phân tử khối (M):</span>
                          <span>{selectedChem.molarMass || 50} g/mol</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] leading-relaxed text-amber-200/90 pt-1 border-t border-amber-800/40 italic">
                      💡 Mẹo: Cho chất rắn vào Cốc, sau đó rót Nước cất (H2O) vào và dùng <strong>Đũa thủy tinh</strong> khuấy đều để hòa tan. Nồng độ C<sub>M</sub> = n/V sẽ được tính toán tự động!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    {selectedChemId !== 'H2O' && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Nồng độ (M):</span>
                          <span className="font-bold text-blue-400">{concentrationM} M</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="6.0"
                          step="0.1"
                          value={concentrationM}
                          onChange={(e) => setConcentrationM(parseFloat(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Thể tích (mL):</span>
                        <span className="font-bold text-cyan-400">{volumeMl} mL</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="250"
                        step="5"
                        value={volumeMl}
                        onChange={(e) => setVolumeMl(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Calculated stoichiometry box for solution (n, m, V, C_M) */}
                    {selectedChem && selectedChemId !== 'H2O' && (() => {
                      const moles = (concentrationM * volumeMl) / 1000;
                      const massG = moles * (selectedChem.molarMass || 36.5);
                      return (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80 font-mono text-[11px] space-y-1">
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>Số mol (n = C<sub>M</sub> × V):</span>
                            <span>{moles.toFixed(4)} mol</span>
                          </div>
                          <div className="flex justify-between text-amber-300 font-bold">
                            <span>Khối lượng tan (m = n × M):</span>
                            <span>{massG.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                            <span>Molar Mass (M): {selectedChem.molarMass} g/mol</span>
                            <span>{volumeMl} mL ({ (volumeMl / 1000).toFixed(3) } L)</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Add Chemical Button */}
                <button
                  onClick={handleCreateChemicalInEquipment}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo & Đưa Về Bàn Thí Nghiệm</span>
                </button>
              </div>
            )}

            {/* TAB 3: PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Chọn mẫu bài thí nghiệm sẵn có để thực hành ngay:</p>
                {PRESET_EXPERIMENTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onLoadPreset(preset)}
                    className="w-full p-3 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl border border-slate-700/70 flex flex-col text-left transition-all group hover:border-amber-500/50 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                        {preset.name}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900/80 text-[10px] text-slate-400 rounded-full border border-slate-700">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Sidebar Icons */
        <div className="flex flex-col items-center py-4 space-y-4 text-slate-400">
          <BeakerIcon className="w-5 h-5 hover:text-white cursor-pointer" onClick={() => setIsOpen(true)} />
          <Atom className="w-5 h-5 hover:text-white cursor-pointer" onClick={() => setIsOpen(true)} />
          <Sparkles className="w-5 h-5 hover:text-white cursor-pointer" onClick={() => setIsOpen(true)} />
        </div>
      )}

      {/* CAPACITY SELECTION MODAL / SELECTOR BAR */}
      {selectedModalType && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4 relative text-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setSelectedModalType(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 pr-6">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                {React.createElement(EQUIPMENT_INFO[selectedModalType].icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{EQUIPMENT_INFO[selectedModalType].name}</h3>
                <p className="text-xs text-slate-400">{EQUIPMENT_INFO[selectedModalType].desc}</p>
              </div>
            </div>

            {/* Round Flask Variant Selector */}
            {selectedModalType.startsWith('round_flask') && (
              <div className="space-y-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/80">
                <label className="text-xs font-bold text-slate-300 block">Chọn Kiểu Bình Cầu:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { type: 'round_flask' as EquipmentType, label: '0 Nhánh', desc: 'Tiêu chuẩn' },
                    { type: 'round_flask_1arm' as EquipmentType, label: '1 Nhánh', desc: 'Chưng cất' },
                    { type: 'round_flask_2neck' as EquipmentType, label: '2 Nhánh', desc: 'Phản ứng' },
                  ].map((variant) => (
                    <button
                      key={variant.type}
                      onClick={() => setSelectedModalType(variant.type)}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                        selectedModalType === variant.type
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-cyan-300'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span>{variant.label}</span>
                      <span className="text-[9px] opacity-75 font-normal">{variant.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity Selection Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Chọn Dung Tích / Thể Tích:</span>
                <span className="text-sm font-bold text-cyan-400">
                  {selectedCapacity} {selectedModalType === 'spatula' ? 'g' : 'mL'}
                </span>
              </div>

              {/* Preset Buttons Bar (Chips) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {STANDARD_EQUIPMENT_CAPACITIES[selectedModalType]?.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setSelectedCapacity(cap)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 ${
                      selectedCapacity === cap
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg ring-2 ring-cyan-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{cap}</span>
                    <span className="text-[10px] opacity-80">{selectedModalType === 'spatula' ? 'g' : 'mL'}</span>
                  </button>
                ))}
              </div>

              {/* Custom Slider Bar */}
              <div className="pt-2">
                <input
                  type="range"
                  min={STANDARD_EQUIPMENT_CAPACITIES[selectedModalType]?.[0] || 1}
                  max={
                    STANDARD_EQUIPMENT_CAPACITIES[selectedModalType]?.[
                      STANDARD_EQUIPMENT_CAPACITIES[selectedModalType].length - 1
                    ] || 1000
                  }
                  step={selectedModalType === 'spatula' || selectedModalType === 'pipette' ? 1 : 10}
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setSelectedModalType(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddEquipment}
                className="flex-[2] py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Vào Lab ({selectedCapacity}{selectedModalType === 'spatula' ? 'g' : 'mL'})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
