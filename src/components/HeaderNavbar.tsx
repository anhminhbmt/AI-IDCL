import React, { useState } from 'react';
import { PresetExperiment } from '../types/chemistry';
import { PRESET_EXPERIMENTS } from '../engine/EquipmentClass';
import {
  FlaskConical,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  Info,
  X,
  Thermometer,
  Video,
  UserCheck,
} from 'lucide-react';
import { GoogleMeetModal } from './GoogleMeetModal';

interface HeaderNavbarProps {
  onResetDesk: () => void;
  equipmentCount: number;
  currentPresetId: string;
  onSelectPreset: (preset: PresetExperiment) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onResetDesk,
  equipmentCount,
  currentPresetId,
  onSelectPreset,
}) => {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between text-slate-100 z-30 shadow-lg">
      {/* App Branding */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide text-white flex items-center space-x-2">
            <span>AI-integrated digital chemistry laboratory</span>
          </h1>
        </div>
      </div>

      {/* Preset Experiment Quick Selector */}
      <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 border border-indigo-500/40 px-3 py-1.5 rounded-xl shadow-md">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs font-bold text-indigo-300">Mẫu Thí Nghiệm:</span>
        <select
          value={currentPresetId}
          onChange={(e) => {
            const selected = PRESET_EXPERIMENTS.find((p) => p.id === e.target.value);
            if (selected) onSelectPreset(selected);
          }}
          className="bg-slate-950 text-amber-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-xs truncate"
        >
          {PRESET_EXPERIMENTS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lab Desk Status Indicator & Control Actions */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-3 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
          <div className="flex items-center space-x-1">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span>Nhiệt độ phòng: <strong className="text-white">25°C</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span>Dụng cụ trên bàn: <strong className="text-blue-400">{equipmentCount}</strong></span>
          </div>
        </div>

        {/* Google Meet Screen Share / Presentation Button */}
        <button
          id="btn-google-meet"
          onClick={() => setShowMeetModal(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-emerald-950 border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98]"
          title="Mở cuộc họp Google Meet để trình bày màn hình thí nghiệm"
        >
          <Video className="w-4 h-4 text-emerald-100" />
          <span>Google Meet</span>
          <span className="hidden md:inline text-[10px] bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded font-normal">
            Trình chiếu
          </span>
        </button>

        {/* Safety Rules Button */}
        <button
          onClick={() => setShowSafetyModal(true)}
          className="px-3 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Quy Tắc An Toàn</span>
        </button>

        {/* Reset Desk */}
        <button
          onClick={onResetDesk}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
          title="Dọn dẹp lại toàn bộ bàn thí nghiệm"
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span>Đặt Lại Bàn</span>
        </button>
      </div>

      {/* Google Meet Modal */}
      <GoogleMeetModal
        isOpen={showMeetModal}
        onClose={() => setShowMeetModal(false)}
      />

      {/* Chemical Safety Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-200 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowSafetyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 font-bold text-base border-b border-slate-800 pb-3">
              <ShieldAlert className="w-6 h-6" />
              <span>CẢNH BÁO AN TOÀN PHÒNG THÍ NGHIỆM</span>
            </div>

            <ul className="text-xs space-y-2.5 text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-amber-300">Pha loãng Sulfuric acid (H₂SO₄) đặc:</strong> Bắt buộc rót từ từ axit vào nước dọc theo đũa thủy tinh, KHÔNG ĐƯỢC rót nước vào axit đặc để tránh hiện tượng sôi bùng gây bỏng axit nghiêm trọng.
              </li>
              <li>
                <strong className="text-amber-300">Đun nóng hóa chất trong ống nghiệm:</strong> Nghiêng ống nghiệm góc 45°, hướng miệng ống nghiệm về phía KHÔNG CÓ NGƯỜI. Di chuyển đều ngọn lửa đèn cồn dọc ống nghiệm trước khi đun tập trung tại vị trí chứa dung dịch.
              </li>
              <li>
                <strong className="text-amber-300">Sử dụng Buret & Pipet:</strong> Thao tác nhẹ nhàng tránh gãy vỡ ống thủy tinh. Khóa van Buret cẩn thận sau khi kết thúc quá trình chuẩn độ.
              </li>
              <li>
                <strong className="text-amber-300">Thu gom khí độc (Cl₂, SO₂):</strong> Luôn thực hiện trong tủ hút hoặc dùng nút cao su đậy kín dẫn khí vào dung dịch kiềm hấp thụ.
              </li>
            </ul>

            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl text-white transition-all shadow-md mt-2"
            >
              Đã Rõ & Tiếp Tục Thí Nghiệm
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
