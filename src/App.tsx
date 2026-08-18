import React, { useState, useEffect } from 'react';
import { EquipmentInstance, PresetExperiment } from './types/chemistry';
import { PRESET_EXPERIMENTS } from './engine/EquipmentClass';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { LabCanvas2D } from './components/LabCanvas2D';
import { UserCheck, GraduationCap } from 'lucide-react';

export default function App() {
  
  const [showRoleModal, setShowRoleModal] = useState<boolean>(() => {
    // If just returning from safety gate, don't show modal
    return localStorage.getItem('just_passed_safety') !== 'true';
  });

  const initialized = React.useRef(false);

  // Check role and safety gate
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const justPassed = localStorage.getItem('just_passed_safety') === 'true';
    if (justPassed) {
      localStorage.removeItem('just_passed_safety');
      localStorage.setItem('user_role', 'student');
      setShowRoleModal(false);
    } else {
      // Normal reload or new visit -> Clear role and ask again
      localStorage.removeItem('user_role');
      localStorage.removeItem('lab_safety_passed');
      setShowRoleModal(true);
    }
  }, []);

  const handleSelectRole = (role: 'teacher' | 'student') => {
    localStorage.setItem('user_role', role);
    if (role === 'student') {
      // Force them to take the test when explicitly picking the role
      localStorage.removeItem('lab_safety_passed');
      window.location.href = '/safety_gate.html';
    } else {
      setShowRoleModal(false);
    }
  };

  // Initial experiment default: 9. Điều chế Nước Javel & Thử tính tẩy màu
  const defaultPreset =
    PRESET_EXPERIMENTS.find((p) => p.id === 'exp_cl2_javel') || PRESET_EXPERIMENTS[0];


  const [equipments, setEquipments] = useState<EquipmentInstance[]>(
    () => JSON.parse(JSON.stringify(defaultPreset.equipments))
  );
  const [currentPresetId, setCurrentPresetId] = useState<string>(defaultPreset.id);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedEquipmentForDetails, setSelectedEquipmentForDetails] =
    useState<EquipmentInstance | null>(null);

  // Sidebars toggle state
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);

  // Add Equipment to Desk
  const handleAddEquipment = (eq: EquipmentInstance) => {
    setEquipments((prev) => [...prev, eq]);
  };

  // Load Preset Experiment
  const handleLoadPreset = (preset: PresetExperiment) => {
    setEquipments(preset.equipments ? JSON.parse(JSON.stringify(preset.equipments)) : []);
    setCurrentPresetId(preset.id);
    setSelectedEquipmentId(null);
    setSelectedEquipmentForDetails(null);
    setResetKey(prev => prev + 1);
  };

  const [resetKey, setResetKey] = useState(0);

  // Clear all objects from the desk
  const handleClearDesk = () => {
    setEquipments([]);
    setCurrentPresetId('');
    setSelectedEquipmentId(null);
    setSelectedEquipmentForDetails(null);
    setResetKey(prev => prev + 1);
  };

  // Reload current preset experiment
  const handleReloadPreset = () => {
    const presetToLoad = PRESET_EXPERIMENTS.find(p => p.id === currentPresetId);
    if (presetToLoad && presetToLoad.equipments) {
      setEquipments(JSON.parse(JSON.stringify(presetToLoad.equipments)));
    } else {
      setEquipments([]);
    }
    setSelectedEquipmentId(null);
    setSelectedEquipmentForDetails(null);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans overflow-hidden select-none">
      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Chào mừng đến với Phòng Thí Nghiệm</h2>
            <p className="text-slate-400 text-center mb-8">Vui lòng chọn vai trò của bạn để bắt đầu</p>
            
            <div className="flex w-full gap-4">
              <button
                onClick={() => handleSelectRole('teacher')}
                className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500 rounded-xl transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="text-lg font-bold text-white mb-1">Giáo viên</span>
                <span className="text-xs text-slate-400 text-center">Truy cập trực tiếp vào phòng thí nghiệm</span>
              </button>
              
              <button
                onClick={() => handleSelectRole('student')}
                className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-sky-500 rounded-xl transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-sky-400" />
                </div>
                <span className="text-lg font-bold text-white mb-1">Học sinh</span>
                <span className="text-xs text-slate-400 text-center">Hoàn thành bài kiểm tra an toàn trước khi vào</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Navbar */}
      <HeaderNavbar
        onResetDesk={handleClearDesk}
        equipmentCount={equipments.length}
        currentPresetId={currentPresetId}
        onSelectPreset={handleLoadPreset}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar: Equipment & Chemicals */}
        <LeftSidebar
          onAddEquipment={handleAddEquipment}
          onLoadPreset={handleLoadPreset}
          isOpen={isLeftSidebarOpen}
          setIsOpen={setIsLeftSidebarOpen}
        />

        {/* Center Canvas Workspace */}
        <main className="flex-1 relative h-full bg-slate-900 overflow-hidden">
          <LabCanvas2D
            key={resetKey}
            equipments={equipments}
            setEquipments={setEquipments}
            selectedEquipmentId={selectedEquipmentId}
            setSelectedEquipmentId={setSelectedEquipmentId}
            onSelectEquipmentForDetails={setSelectedEquipmentForDetails}
            onOpenChatbot={() => setIsRightSidebarOpen(true)}
            onResetDesk={handleReloadPreset}
          />
        </main>

        {/* Right Sidebar: AI Chatbot "Anh Mã" */}
        <RightSidebar
          equipments={equipments}
          isOpen={isRightSidebarOpen}
          setIsOpen={setIsRightSidebarOpen}
        />
      </div>
    </div>
  );
}
