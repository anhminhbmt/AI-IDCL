# -*- coding: utf-8 -*-
"""
Generates the modern 3D Organic Molecule Visualizer Engine
with exact display modes:
1. Dạng Que & Quả cầu (Mặc định) - Ball & Stick
2. Dạng Đặc chiếm không gian - CPK Space Filling
3. Dạng Khung dây - Wireframe / Skeletal Stick
Accurate 3D geometry, high-res smooth spheres, auto camera fit,
top toolbar, spacious properties panel, and measurement tools.
"""
import json, os, re, subprocess, tempfile

def build_visualizer_engine():
    with open("mols_database_complete_53.json", "r", encoding="utf-8") as f:
        molecules_data = json.load(f)

    mols_json_str = json.dumps(molecules_data, ensure_ascii=False)

    js_code = r"""<script>
(function() {
    // 53 Organic Molecules Database
    const MOLECULES_DB = """ + mols_json_str + r""";

    // Vibrant CPK Element Specifications
    const ELEMENT_SPECS = {
        'H':  { name: 'Hydrogen', viName: 'Hiđro',    color: 0xFFFFFF, hex: '#FFFFFF', covRadius: 0.31, vdwRadius: 1.20, z: 1,  mass: 1.008,  pauling: 2.20, valency: 1 },
        'C':  { name: 'Carbon',   viName: 'Cacbon',   color: 0x334155, hex: '#334155', covRadius: 0.76, vdwRadius: 1.70, z: 6,  mass: 12.011, pauling: 2.55, valency: 4 },
        'N':  { name: 'Nitrogen', viName: 'Nitơ',     color: 0x2563EB, hex: '#2563EB', covRadius: 0.71, vdwRadius: 1.55, z: 7,  mass: 14.007, pauling: 3.04, valency: 3 },
        'O':  { name: 'Oxygen',   viName: 'Oxi',      color: 0xEF4444, hex: '#EF4444', covRadius: 0.66, vdwRadius: 1.52, z: 8,  mass: 15.999, pauling: 3.44, valency: 2 },
        'F':  { name: 'Fluorine', viName: 'Flo',      color: 0x06B6D4, hex: '#06B6D4', covRadius: 0.57, vdwRadius: 1.47, z: 9,  mass: 18.998, pauling: 3.98, valency: 1 },
        'Cl': { name: 'Chlorine', viName: 'Clo',      color: 0x10B981, hex: '#10B981', covRadius: 1.02, vdwRadius: 1.75, z: 17, mass: 35.45,  pauling: 3.16, valency: 1 },
        'Br': { name: 'Bromine',  viName: 'Brom',     color: 0xEA580C, hex: '#EA580C', covRadius: 1.20, vdwRadius: 1.85, z: 35, mass: 79.90,  pauling: 2.96, valency: 1 },
        'I':  { name: 'Iodine',   viName: 'Iot',      color: 0x8B5CF6, hex: '#8B5CF6', covRadius: 1.39, vdwRadius: 1.98, z: 53, mass: 126.90, pauling: 2.66, valency: 1 },
        'S':  { name: 'Sulfur',   viName: 'Lưu huỳnh',color: 0xEAB308, hex: '#EAB308', covRadius: 1.05, vdwRadius: 1.80, z: 16, mass: 32.06,  pauling: 2.58, valency: 2 },
        'P':  { name: 'Phosphorus',viName: 'Photpho', color: 0xF97316, hex: '#F97316', covRadius: 1.07, vdwRadius: 1.80, z: 15, mass: 30.97, pauling: 2.19, valency: 3 }
    };

    const GROUPS_LIST = [
        { id: 'all', name: 'Tất Cả (53)', icon: '✨' },
        { id: 'alkane', name: 'Alkane & Xicloankan', icon: '⛓️' },
        { id: 'alkene_alkyne', name: 'Alkene, Alkyne, Diene', icon: '⚡' },
        { id: 'arene', name: 'Arene (Thơm)', icon: '🔷' },
        { id: 'halogen', name: 'Dẫn Xuất Halogen', icon: '🧪' },
        { id: 'alcohol_phenol', name: 'Alcohol & Phenol', icon: '🍷' },
        { id: 'carbonyl', name: 'Aldehyde & Ketone', icon: '🍋' },
        { id: 'carboxylic_acid', name: 'Carboxylic Acid', icon: '🍎' },
        { id: 'ester_lipid', name: 'Ester & Lipid', icon: '🌸' },
        { id: 'amine_amino_acid', name: 'Amine & Amino Acid', icon: '🧬' },
        { id: 'biomolecules', name: 'Carbohydrate & Sinh Học', icon: '💊' }
    ];

    let currentMoleculeIndex = 0;
    let currentFilterGroup = 'all';
    let currentSearchTerm = '';
    let currentRightTab = 'select_mol'; // 'select_mol', 'details', 'measure'
    let displayMode = 'ball_stick'; // 'ball_stick', 'space_fill', 'wireframe'
    let showOrbitals = false;
    let measureMode = 'none'; // 'none', 'distance', 'angle'
    let selectedAtomsForMeasure = [];
    let autoRotate = true;

    let rightSidebarOpen = true;

    // Three.js State
    let scene, camera, renderer, controls;
    let moleculeGroup = null;
    let orbitalsGroup = null;
    let measureGroup = null;
    let atomMeshes = [];
    let bondMeshes = [];
    let hoveredAtom = null;
    let raycaster = null;
    let mouse = null;
    let containerEl = null;
    let animFrameId = null;

    // Open Visualizer Function (global)
    window.openOrganicMoleculeVisualizer = function(molId) {
        let modal = document.getElementById('organic-3d-visualizer-modal');
        if (!modal) {
            initVisualizerDOM();
            modal = document.getElementById('organic-3d-visualizer-modal');
        }
        // Hide laboratory interface completely for full-focus 3D immersion
        const labRoot = document.getElementById('root');
        if (labRoot) {
            labRoot.style.display = 'none';
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (!scene) {
            setTimeout(initThreeJS, 60);
        } else {
            setTimeout(handleResize, 60);
        }

        if (molId) {
            const idx = MOLECULES_DB.findIndex(m => m.id === molId);
            if (idx !== -1) currentMoleculeIndex = idx;
        }
        renderMoleculeList();
        loadCurrentMolecule();
        renderLegendBar();
    };

    window.closeOrganicMoleculeVisualizer = function() {
        const modal = document.getElementById('organic-3d-visualizer-modal');
        if (modal) modal.classList.add('hidden');
        // Restore laboratory interface
        const labRoot = document.getElementById('root');
        if (labRoot) {
            labRoot.style.display = '';
        }
        document.body.style.overflow = '';
        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));
        }, 60);
    };

    function initVisualizerDOM() {
        const html = `
        <div id="organic-3d-visualizer-modal" class="fixed inset-0 z-[9999] bg-slate-950 text-slate-100 flex flex-col font-sans backdrop-blur-xl hidden select-none">
            
            <!-- Top Header Navbar -->
            <header class="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between z-30 shadow-xl shrink-0">
                <div class="flex items-center space-x-2 sm:space-x-3">
                    <button id="btn-return-lab" class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-blue-950 border border-blue-400/40 hover:scale-[1.02] active:scale-[0.98]" title="Quay trở lại phòng thí nghiệm ảo">
                        <svg class="w-4 h-4 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        <span class="hidden sm:inline">← Về Phòng Thí Nghiệm</span>
                        <span class="sm:hidden">← Thoát</span>
                    </button>
                    
                    <div class="h-5 w-px bg-slate-800"></div>

                    <!-- Title Banner -->
                    <div class="flex items-center space-x-2">
                        <div class="p-1 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg text-white font-black text-xs px-2 shadow-sm">
                            3D HỮU CƠ
                        </div>
                        <h1 class="font-extrabold text-xs sm:text-sm text-white">
                            Không Gian 3D 53 Phân Tử Hữu Cơ Chuẩn Quốc Tế
                        </h1>
                    </div>
                </div>

                <!-- Right Controls: Toggle Right Bar & Snapshot & Close -->
                <div class="flex items-center space-x-2">
                    <!-- Sidebar Toggle Right -->
                    <button id="btn-toggle-right-bar" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md active:scale-95" title="Đóng / Mở bảng chọn chất & thông số bên phải">
                        <span id="label-right-bar" class="hidden sm:inline">Bảng Điều Khiển</span>
                        <span id="icon-right-bar">▶</span>
                    </button>

                    <button id="btn-snapshot" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-950 border border-emerald-400/40 active:scale-95" title="Chụp ảnh phân tử 3D độ nét cao PNG trong suốt">
                        <svg class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span class="hidden sm:inline">Chụp Ảnh 4K</span>
                    </button>

                    <button id="btn-close-visualizer" class="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center w-9 h-9" title="Đóng và quay lại thí nghiệm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </header>

            <!-- Clean Top Toolbar: 3 Primary Display Modes + Secondary Controls -->
            <div class="h-12 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between z-20 shrink-0 gap-2 overflow-x-auto select-none">
                
                <!-- 3 Primary Display Modes (Full Explicit Names) -->
                <div class="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button id="mode-ball-stick" class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all bg-indigo-600 text-white shadow-md flex items-center space-x-1.5" title="Mô hình Quả cầu & Que liên kết chuẩn">
                        <span>🏐</span>
                        <span>Dạng Que & Quả cầu (Mặc định)</span>
                    </button>
                    <button id="mode-space-fill" class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5" title="Mô hình Cầu đặc chiếm không gian CPK / Van der Waals">
                        <span>🪐</span>
                        <span>Dạng Đặc chiếm không gian</span>
                    </button>
                    <button id="mode-wireframe" class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5" title="Mô hình Khung dây liên kết xương phân tử">
                        <span>🕸️</span>
                        <span>Dạng Khung dây</span>
                    </button>
                </div>

                <!-- Secondary Actions: Orbitals, Auto-spin, Reset View -->
                <div class="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button id="btn-toggle-orbitals" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5" title="Hiển thị đám mây lai hóa obitan nguyên tử">
                        <span class="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#22d3ee]"></span>
                        <span>Mây Obitan</span>
                    </button>
                    <div class="h-4 w-px bg-slate-800"></div>
                    <button id="btn-toggle-spin" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1" title="Bật/Tắt tự động xoay quanh trục">
                        <span>🔄 Xoay 360°</span>
                    </button>
                    <button id="btn-reset-view" class="px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center font-bold" title="Khôi phục góc nhìn và vị trí mặc định">
                        <span>🎯 Đặt Lại</span>
                    </button>
                </div>
            </div>

            <!-- Main Flex Viewport Area -->
            <div class="flex-1 flex overflow-hidden relative">
                
                <!-- Center: 3D Canvas -->
                <main class="flex-1 relative bg-[#030712] flex flex-col overflow-hidden">
                    
                    <!-- 3D Canvas Area -->
                    <div id="three-canvas-container" class="w-full flex-1 relative cursor-grab active:cursor-grabbing"></div>

                    <!-- Floating Dock Button to open sidebar if collapsed -->
                    <button id="btn-dock-open-sidebar" class="absolute top-4 right-3 pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-2xl text-xs font-black shadow-2xl border border-indigo-400/50 flex items-center space-x-1.5 z-10 transition-all hidden active:scale-95">
                        <span>🧪 Chọn Chất & Thông Số</span>
                        <span>◀</span>
                    </button>

                    <!-- Atom Inspector Mini HUD (Top Left / Floating) -->
                    <div id="atom-inspector-hud" class="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl max-w-xs w-72 text-xs text-slate-200 hidden z-20 space-y-2">
                        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div class="flex items-center space-x-2">
                                <span id="insp-elem-badge" class="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-xs border border-white/30 shadow-md">C</span>
                                <div>
                                    <h4 id="insp-elem-name" class="font-black text-white text-sm">Carbon (#1)</h4>
                                    <p id="insp-elem-hybrid" class="text-[10px] text-cyan-300 font-bold">Lai hóa: sp³</p>
                                </div>
                            </div>
                            <button id="btn-close-inspector" class="text-slate-400 hover:text-white font-black text-xs p-1">✕</button>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-[11px] pt-1 font-medium">
                            <div>Số hiệu Z: <strong id="insp-elem-z" class="text-white font-bold">6</strong></div>
                            <div>Khối lượng: <strong id="insp-elem-mass" class="text-white font-bold">12.011</strong></div>
                            <div>Bán kính VdW: <strong id="insp-elem-vdw" class="text-cyan-300 font-bold">1.70 Å</strong></div>
                            <div>Độ âm điện: <strong id="insp-elem-pauling" class="text-amber-300 font-bold">2.55</strong></div>
                            <div>Hóa trị: <strong id="insp-elem-valency" class="text-emerald-300 font-bold">4</strong></div>
                            <div>Số oxi hóa: <strong id="insp-elem-ox" class="text-rose-400 font-bold">-2</strong></div>
                        </div>
                    </div>
                </main>

                <!-- Single Unified Right Sidebar: Molecules List, Clear Large Specs, Measurements (Collapsible) -->
                <aside id="visualizer-right-sidebar" class="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out">
                    
                    <!-- Right Sidebar Top Tab Switcher -->
                    <div class="p-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-1 shrink-0">
                        <button id="tab-btn-select-mol" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-md flex items-center justify-center space-x-1">
                            <span>🧪</span> <span>Chọn Chất</span>
                            <span class="text-[10px] bg-indigo-950 text-indigo-200 px-1.5 py-0.2 rounded-full font-normal">53</span>
                        </button>
                        <button id="tab-btn-details" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center space-x-1">
                            <span>📋</span> <span>Thông Số</span>
                        </button>
                        <button id="tab-btn-measure" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center space-x-1">
                            <span>📏</span> <span>Đo Đạc</span>
                        </button>
                    </div>

                    <!-- TAB 1: Molecule Directory & Search -->
                    <div id="tab-content-select-mol" class="flex-1 flex flex-col overflow-hidden">
                        <!-- Search Box -->
                        <div class="p-2.5 border-b border-slate-800 shrink-0">
                            <div class="relative">
                                <input id="mol-search-input" type="text" placeholder="Tìm tên, công thức, IUPAC..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner">
                                <svg class="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                        </div>

                        <!-- Category Pills Horizontal Scroll -->
                        <div class="px-2 py-2 border-b border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-900 pb-2 shrink-0" id="group-pills-container">
                            <!-- Rendered dynamically -->
                        </div>

                        <!-- Molecule Items List -->
                        <div class="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700" id="molecule-items-list">
                            <!-- Rendered dynamically -->
                        </div>
                    </div>

                    <!-- TAB 2: Detailed Molecule Specifications (High-Contrast, Clear, Easy to Read) -->
                    <div id="tab-content-details" class="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700 hidden">
                        <!-- Molecule Title Header Card -->
                        <div class="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/60 rounded-2xl p-4 shadow-xl space-y-2.5">
                            <div class="flex items-start justify-between">
                                <span id="panel-mol-group-badge" class="text-xs uppercase tracking-wider font-extrabold bg-indigo-900 text-indigo-100 border border-indigo-400 px-3 py-0.5 rounded-full shadow-sm">Alkane</span>
                                <span id="panel-mol-mass" class="text-sm font-black text-amber-300 font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-500/30">16.04 g/mol</span>
                            </div>
                            <div>
                                <h2 id="panel-mol-name" class="text-lg font-black text-white leading-tight">Methane (Metan)</h2>
                                <div class="flex items-center space-x-2 pt-1">
                                    <span class="text-xs text-slate-300 font-medium">Tên IUPAC:</span>
                                    <strong id="panel-mol-iupac" class="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">Methane</strong>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3 pt-1 border-t border-indigo-900/60">
                                <span class="text-xs text-slate-300 font-medium">Công thức:</span>
                                <span id="panel-mol-formula" class="text-base font-black text-emerald-300 tracking-wide font-mono">CH₄</span>
                                <span class="text-slate-500">|</span>
                                <span id="panel-mol-condensed" class="text-sm font-bold text-slate-200 font-mono">CH₄</span>
                            </div>
                        </div>

                        <!-- Structural & Geometry Card -->
                        <div class="bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                            <h3 class="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center space-x-2">
                                <span class="text-sm">📐</span> <span>Cấu Trúc & Hình Học Không Gian</span>
                            </h3>
                            <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                <span class="text-[11px] text-slate-400 block">Dạng hình học & Lai hóa:</span>
                                <p id="panel-mol-geometry" class="text-xs font-bold text-cyan-200 leading-relaxed pt-0.5">Tứ diện đều sp³, góc H-C-H = 109.5°</p>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                                    <span class="text-[11px] text-slate-400 block font-medium">Số Nguyên Tử</span>
                                    <strong id="panel-mol-atom-count" class="text-base font-black text-white">5</strong>
                                </div>
                                <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                                    <span class="text-[11px] text-slate-400 block font-medium">Số Liên Kết</span>
                                    <strong id="panel-mol-bond-count" class="text-base font-black text-white">4</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Physical Properties Card -->
                        <div class="bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                            <h3 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-2">
                                <span class="text-sm">🌡️</span> <span>Tính Chất Vật Lý</span>
                            </h3>
                            <div class="space-y-2 text-xs">
                                <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <span class="text-slate-400 font-medium">Trạng thái:</span>
                                    <strong id="panel-mol-state" class="text-white font-bold">Khí không màu, không mùi</strong>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="bg-slate-900 p-2 rounded-xl border border-slate-800">
                                        <span class="text-[10px] text-slate-400 block">Nhiệt độ sôi:</span>
                                        <strong id="panel-mol-bp" class="text-xs font-black text-cyan-300 font-mono">-161.5 °C</strong>
                                    </div>
                                    <div class="bg-slate-900 p-2 rounded-xl border border-slate-800">
                                        <span class="text-[10px] text-slate-400 block">Nóng chảy:</span>
                                        <strong id="panel-mol-mp" class="text-xs font-black text-cyan-300 font-mono">-182.5 °C</strong>
                                    </div>
                                </div>
                                <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                    <span class="text-[10px] text-slate-400 block">Độ tan trong nước:</span>
                                    <span id="panel-mol-sol" class="text-xs font-semibold text-slate-200">Không tan trong nước</span>
                                </div>
                            </div>
                        </div>

                        <!-- Chemical Reactions Card -->
                        <div class="bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 space-y-2 shadow-md">
                            <h3 class="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                                <span class="text-sm">⚡</span> <span>Phản Ứng Hóa Học Đặc Trưng</span>
                            </h3>
                            <div id="panel-mol-reactions" class="text-xs text-emerald-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-xl border border-slate-800 whitespace-pre-line font-bold">
                                CH₄ + Cl₂ →(as) CH₃Cl + HCl
                            </div>
                        </div>

                        <!-- Applications Card -->
                        <div class="bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 space-y-2 shadow-md">
                            <h3 class="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                                <span class="text-sm">🏭</span> <span>Ứng Dụng Thực Tế & Sinh Học</span>
                            </h3>
                            <p id="panel-mol-apps" class="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800 font-medium">
                                Thành phần chính của khí thiên nhiên (95%), khí biogas, dùng làm nhiên liệu sạch đun nấu và phát điện.
                            </p>
                        </div>
                    </div>

                    <!-- TAB 3: Measurement Suite -->
                    <div id="tab-content-measure" class="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700 hidden">
                        <!-- Dedicated Measurement & Angle Tool Card -->
                        <div class="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-xl space-y-3">
                            <div class="flex items-center justify-between">
                                <h3 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-2">
                                    <span class="text-base">📏</span> <span>Đo Khoảng Cách & Góc</span>
                                </h3>
                                <span id="measure-state-badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Tắt</span>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-2">
                                <button id="btn-measure-dist" class="px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-amber-400 flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm" title="Chọn 2 nguyên tử để đo khoảng cách liên kết">
                                    <span>📏</span> <span>Đo d (Å)</span>
                                </button>
                                <button id="btn-measure-angle" class="px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-amber-400 flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm" title="Chọn 3 nguyên tử để đo góc liên kết">
                                    <span>📐</span> <span>Đo Góc (°)</span>
                                </button>
                            </div>

                            <!-- Result Display -->
                            <div id="measure-result-panel" class="bg-slate-950 border border-indigo-800/80 rounded-xl p-3 text-xs space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-slate-300">Kết quả đo:</span>
                                    <button id="btn-cancel-measure" class="text-xs font-bold text-rose-400 hover:text-rose-300 hidden">✕ Hủy đo</button>
                                </div>
                                <p id="measure-guide-text" class="text-xs text-slate-400 leading-relaxed italic">
                                    Nhấp chọn nút đo bên trên, sau đó nhấp vào các quả cầu nguyên tử trong không gian 3D.
                                </p>
                                <div id="measure-data-display" class="hidden font-mono font-bold text-amber-300 text-xs bg-amber-950/40 border border-amber-500/60 p-2.5 rounded-lg leading-relaxed">
                                    --
                                </div>
                            </div>
                        </div>

                        <!-- Current Molecule Quick Info Card -->
                        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
                            <h4 class="font-bold text-indigo-300">Phân tử đang đo:</h4>
                            <div class="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                <span id="quick-mol-name" class="font-bold text-white text-sm">Methane</span>
                                <span id="quick-mol-formula" class="font-mono text-emerald-400 font-black text-sm">CH₄</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <!-- Dedicated Conventions Footer (Bottom of Visualizer) -->
            <footer id="element-color-legend-container" class="bg-slate-900/95 border-t border-slate-800 px-3 sm:px-5 py-2.5 z-30 shadow-2xl shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 overflow-x-auto select-none">
                
                <!-- Left: CPK Element Colors -->
                <div class="flex items-center space-x-2 shrink-0">
                    <span class="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/40 shrink-0">
                        <span>🎨</span>
                        <span>Màu nguyên tố:</span>
                    </span>
                    <div id="legend-pills-row" class="flex flex-wrap gap-1.5 items-center">
                        <!-- Populated dynamically with rich element badges -->
                    </div>
                </div>

                <div class="h-4 w-px bg-slate-800 hidden md:block shrink-0"></div>

                <!-- Right: 3D Bond Type Conventions -->
                <div class="flex items-center space-x-2 shrink-0">
                    <span class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center space-x-1.5 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40 shrink-0">
                        <span>🔗</span>
                        <span>Quy ước liên kết 3D:</span>
                    </span>
                    <div class="flex flex-wrap gap-1.5 items-center text-[11px] font-bold text-slate-200">
                        <div class="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800" title="Liên kết đơn (Single Bond): 01 hình trụ xám kim loại nối giữa 2 tâm nguyên tử">
                            <span class="text-slate-400 font-mono text-xs">➖</span>
                            <span class="text-white">Đơn:</span>
                            <span class="text-slate-400 font-normal">01 Trụ kim loại</span>
                        </div>
                        <div class="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800" title="Liên kết đôi (Double Bond): 02 hình trụ song song mảnh">
                            <span class="text-emerald-400 font-mono text-xs">═</span>
                            <span class="text-white">Đôi:</span>
                            <span class="text-slate-400 font-normal">02 Trụ song song</span>
                        </div>
                        <div class="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800" title="Liên kết ba (Triple Bond): 03 hình trụ song song mảnh">
                            <span class="text-cyan-400 font-mono text-xs">≡</span>
                            <span class="text-white">Ba:</span>
                            <span class="text-slate-400 font-normal">03 Trụ song song</span>
                        </div>
                        <div class="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800" title="Vòng thơm Benzen: Render 6 liên kết xen kẽ & vòng tròn thơm liên hợp π">
                            <span class="text-sky-400 font-mono text-xs">⭕</span>
                            <span class="text-white">Vòng thơm:</span>
                            <span class="text-slate-400 font-normal">6 xen kẽ + Vòng π</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper.firstElementChild);

        setupVisualizerEvents();
    }

    function renderLegendBar() {
        const row = document.getElementById('legend-pills-row');
        if (!row) return;

        const elems = ['H', 'C', 'N', 'O', 'F', 'Cl', 'Br', 'I', 'S', 'P'];
        row.innerHTML = elems.map(el => {
            const spec = ELEMENT_SPECS[el];
            const isWhite = el === 'H';
            return `
            <div class="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all text-[11px] font-bold text-slate-200 shadow-sm cursor-default" title="${spec.name} (${spec.viName}) - Z=${spec.z}, Bán kính VdW=${spec.vdwRadius}Å">
                <span class="w-3 h-3 rounded-full inline-block shrink-0 shadow-sm ${isWhite ? 'border border-slate-400' : ''}" style="background-color: ${spec.hex};"></span>
                <span class="font-extrabold text-white">${el}</span>
                <span class="text-slate-400 font-normal">(${spec.viName})</span>
            </div>
            `;
        }).join('');
    }

    function setupVisualizerEvents() {
        document.getElementById('btn-close-visualizer').addEventListener('click', window.closeOrganicMoleculeVisualizer);
        const returnLabBtn = document.getElementById('btn-return-lab');
        if (returnLabBtn) returnLabBtn.addEventListener('click', window.closeOrganicMoleculeVisualizer);
        
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('organic-3d-visualizer-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    window.closeOrganicMoleculeVisualizer();
                }
            }
        });

        // Toggle Right Sidebar (Single Unified Panel)
        const toggleRightBar = () => {
            rightSidebarOpen = !rightSidebarOpen;
            const aside = document.getElementById('visualizer-right-sidebar');
            const icon = document.getElementById('icon-right-bar');
            const dockBtn = document.getElementById('btn-dock-open-sidebar');
            if (rightSidebarOpen) {
                aside.classList.remove('w-0', 'opacity-0', 'overflow-hidden', 'border-0', 'p-0');
                aside.classList.add('w-80', 'sm:w-96');
                icon.textContent = '▶';
                if (dockBtn) dockBtn.classList.add('hidden');
            } else {
                aside.classList.remove('w-80', 'sm:w-96');
                aside.classList.add('w-0', 'opacity-0', 'overflow-hidden', 'border-0', 'p-0');
                icon.textContent = '◀';
                if (dockBtn) dockBtn.classList.remove('hidden');
            }
            setTimeout(handleResize, 60);
        };

        document.getElementById('btn-toggle-right-bar').addEventListener('click', toggleRightBar);
        const dockBtn = document.getElementById('btn-dock-open-sidebar');
        if (dockBtn) dockBtn.addEventListener('click', toggleRightBar);

        // Tab Navigation in Right Sidebar
        const setRightTab = (tab) => {
            currentRightTab = tab;
            ['select-mol', 'details', 'measure'].forEach(t => {
                const b = document.getElementById('tab-btn-' + t);
                const c = document.getElementById('tab-content-' + t);
                const isSelected = (tab === t.replace('-', '_'));
                if (isSelected) {
                    b.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-md flex items-center justify-center space-x-1';
                    c.classList.remove('hidden');
                } else {
                    b.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center space-x-1';
                    c.classList.add('hidden');
                }
            });
        };

        document.getElementById('tab-btn-select-mol').addEventListener('click', () => setRightTab('select_mol'));
        document.getElementById('tab-btn-details').addEventListener('click', () => setRightTab('details'));
        document.getElementById('tab-btn-measure').addEventListener('click', () => setRightTab('measure'));

        // Search Input
        document.getElementById('mol-search-input').addEventListener('input', function(e) {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            renderMoleculeList();
        });

        // Group Pills
        const pillsContainer = document.getElementById('group-pills-container');
        pillsContainer.innerHTML = GROUPS_LIST.map(g => `
            <button class="group-pill-btn px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${g.id === currentFilterGroup ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}" data-group="${g.id}">
                ${g.icon} ${g.name}
            </button>
        `).join('');

        pillsContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.group-pill-btn');
            if (!btn) return;
            currentFilterGroup = btn.getAttribute('data-group');
            document.querySelectorAll('.group-pill-btn').forEach(b => {
                const isActive = b.getAttribute('data-group') === currentFilterGroup;
                b.className = `group-pill-btn px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`;
            });
            renderMoleculeList();
        });

        // 3 Display Modes
        const setMode = (mode) => {
            displayMode = mode;
            ['ball-stick', 'space-fill', 'wireframe'].forEach(m => {
                const b = document.getElementById('mode-' + m);
                const isSelected = (mode === m.replace('-', '_'));
                b.className = `px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`;
            });
            rebuildMolecule3D();
        };
        document.getElementById('mode-ball-stick').addEventListener('click', () => setMode('ball_stick'));
        document.getElementById('mode-space-fill').addEventListener('click', () => setMode('space_fill'));
        document.getElementById('mode-wireframe').addEventListener('click', () => setMode('wireframe'));

        // Toggle Orbitals
        document.getElementById('btn-toggle-orbitals').addEventListener('click', function() {
            showOrbitals = !showOrbitals;
            this.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${showOrbitals ? 'bg-cyan-600/30 text-cyan-300 border-cyan-400 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800 border-transparent'}`;
            rebuildOrbitals3D();
        });

        // Measurement Handlers
        document.getElementById('btn-measure-dist').addEventListener('click', () => startMeasureMode('distance'));
        document.getElementById('btn-measure-angle').addEventListener('click', () => startMeasureMode('angle'));
        document.getElementById('btn-cancel-measure').addEventListener('click', cancelMeasureMode);

        // Auto spin
        document.getElementById('btn-toggle-spin').addEventListener('click', function() {
            autoRotate = !autoRotate;
            this.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${autoRotate ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}`;
        });

        // Reset View
        document.getElementById('btn-reset-view').addEventListener('click', resetCamera);

        // Snapshot PNG
        document.getElementById('btn-snapshot').addEventListener('click', takeSnapshot);

        // Close Inspector HUD
        document.getElementById('btn-close-inspector').addEventListener('click', () => {
            document.getElementById('atom-inspector-hud').classList.add('hidden');
        });
    }

    function getFilteredMolecules() {
        return MOLECULES_DB.filter(m => {
            const matchGroup = (currentFilterGroup === 'all') || (m.groupId === currentFilterGroup);
            const matchSearch = !currentSearchTerm || 
                m.name.toLowerCase().includes(currentSearchTerm) ||
                m.iupac.toLowerCase().includes(currentSearchTerm) ||
                m.formula.toLowerCase().includes(currentSearchTerm) ||
                m.condensed.toLowerCase().includes(currentSearchTerm);
            return matchGroup && matchSearch;
        });
    }

    function renderMoleculeList() {
        const filtered = getFilteredMolecules();
        const listEl = document.getElementById('molecule-items-list');
        const currMol = MOLECULES_DB[currentMoleculeIndex];

        if (!listEl) return;

        if (filtered.length === 0) {
            listEl.innerHTML = `<div class="text-center py-8 text-slate-500 text-xs">Không tìm thấy phân tử phù hợp</div>`;
            return;
        }

        listEl.innerHTML = filtered.map(m => {
            const isSelected = (m.id === currMol?.id);
            return `
            <div class="mol-item-card p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-indigo-950 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'}" data-id="${m.id}">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-xs truncate max-w-[170px]">${m.name}</h4>
                    <span class="text-[11px] font-black text-emerald-400 shrink-0 font-mono">${m.formula}</span>
                </div>
                <div class="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span class="truncate max-w-[140px]">${m.iupac}</span>
                    <span class="font-semibold text-amber-400">${m.molarMass} g/mol</span>
                </div>
            </div>
            `;
        }).join('');

        listEl.querySelectorAll('.mol-item-card').forEach(card => {
            card.addEventListener('click', function() {
                const molId = this.getAttribute('data-id');
                const idx = MOLECULES_DB.findIndex(m => m.id === molId);
                if (idx !== -1) {
                    currentMoleculeIndex = idx;
                    loadCurrentMolecule();
                }
            });
        });
    }

    function loadCurrentMolecule() {
        const mol = MOLECULES_DB[currentMoleculeIndex];
        if (!mol) return;

        // Update properties panel
        const badgeEl = document.getElementById('panel-mol-group-badge');
        if (badgeEl) badgeEl.textContent = mol.group.split('.')[1] || mol.group;
        const massEl = document.getElementById('panel-mol-mass');
        if (massEl) massEl.textContent = mol.molarMass + ' g/mol';
        const nameEl = document.getElementById('panel-mol-name');
        if (nameEl) nameEl.textContent = mol.name;
        const iupacEl = document.getElementById('panel-mol-iupac');
        if (iupacEl) iupacEl.textContent = mol.iupac;
        const formEl = document.getElementById('panel-mol-formula');
        if (formEl) formEl.textContent = mol.formula;
        const condEl = document.getElementById('panel-mol-condensed');
        if (condEl) condEl.textContent = mol.condensed;
        const geomEl = document.getElementById('panel-mol-geometry');
        if (geomEl) geomEl.textContent = mol.geometry;
        const atomCountEl = document.getElementById('panel-mol-atom-count');
        if (atomCountEl) atomCountEl.textContent = mol.atoms.length;
        const bondCountEl = document.getElementById('panel-mol-bond-count');
        if (bondCountEl) bondCountEl.textContent = mol.bonds.length;
        const stateEl = document.getElementById('panel-mol-state');
        if (stateEl) stateEl.textContent = mol.state;
        const bpEl = document.getElementById('panel-mol-bp');
        if (bpEl) bpEl.textContent = mol.boilingPoint;
        const mpEl = document.getElementById('panel-mol-mp');
        if (mpEl) mpEl.textContent = mol.meltingPoint;
        const solEl = document.getElementById('panel-mol-sol');
        if (solEl) solEl.textContent = mol.solubility;
        const reactEl = document.getElementById('panel-mol-reactions');
        if (reactEl) reactEl.textContent = mol.reactions;
        const appsEl = document.getElementById('panel-mol-apps');
        if (appsEl) appsEl.textContent = mol.applications;

        // Quick info in measure tab
        const qName = document.getElementById('quick-mol-name');
        if (qName) qName.textContent = mol.name;
        const qForm = document.getElementById('quick-mol-formula');
        if (qForm) qForm.textContent = mol.formula;

        renderMoleculeList();
        rebuildMolecule3D();
        rebuildOrbitals3D();
        resetCamera();
        cancelMeasureMode();
        const inspectorEl = document.getElementById('atom-inspector-hud');
        if (inspectorEl) inspectorEl.classList.add('hidden');
    }

    function initThreeJS() {
        containerEl = document.getElementById('three-canvas-container');
        if (!containerEl || typeof THREE === 'undefined') return;

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030712);

        // Camera
        const aspect = containerEl.clientWidth / containerEl.clientHeight;
        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.position.set(0, 0, 9);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        containerEl.appendChild(renderer.domElement);

        // OrbitControls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.2;

        // Vivid Studio Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(12, 18, 12);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
        fillLight.position.set(-12, -10, -12);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.5);
        rimLight.position.set(0, -15, 10);
        scene.add(rimLight);

        // Raycasting
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        containerEl.addEventListener('mousemove', onCanvasMouseMove);
        containerEl.addEventListener('click', onCanvasClick);
        window.addEventListener('resize', handleResize);

        // Groups
        moleculeGroup = new THREE.Group();
        orbitalsGroup = new THREE.Group();
        measureGroup = new THREE.Group();
        scene.add(moleculeGroup);
        scene.add(orbitalsGroup);
        scene.add(measureGroup);

        animate();
        loadCurrentMolecule();
        renderLegendBar();
    }

    function handleResize() {
        if (!containerEl || !camera || !renderer) return;
        const width = containerEl.clientWidth;
        const height = containerEl.clientHeight;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function rebuildMolecule3D() {
        if (!moleculeGroup) return;

        // Clear existing meshes
        while (moleculeGroup.children.length > 0) {
            const obj = moleculeGroup.children[0];
            moleculeGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }

        atomMeshes = [];
        bondMeshes = [];

        const mol = MOLECULES_DB[currentMoleculeIndex];
        if (!mol || !mol.atoms || mol.atoms.length === 0) return;

        // Centroid calculation
        let cx = 0, cy = 0, cz = 0;
        mol.atoms.forEach(a => { cx += a.x; cy += a.y; cz += a.z; });
        cx /= mol.atoms.length; cy /= mol.atoms.length; cz /= mol.atoms.length;

        // High segment smooth SphereGeometry
        const sphereGeo = new THREE.SphereGeometry(1, 36, 36);

        // 1. Build Atom Spheres according to Display Mode
        mol.atoms.forEach((atom, idx) => {
            const spec = ELEMENT_SPECS[atom.element] || ELEMENT_SPECS['C'];
            let radius = 0.42;

            if (displayMode === 'space_fill') {
                // Space-filling (Dạng Đặc chiếm không gian CPK): scaled to true Van der Waals interpenetrating dimensions
                radius = spec.vdwRadius * 0.72;
            } else if (displayMode === 'wireframe') {
                // Wireframe (Dạng Khung dây): tiny sleek vertex spheres to keep full focus on the skeletal bonds
                radius = 0.07;
            } else {
                // Ball & Stick (Dạng Que & Quả cầu - Mặc định): standard distinct CPK spheres
                if (atom.element === 'H') radius = 0.28;
                else if (atom.element === 'C') radius = 0.44;
                else if (atom.element === 'N') radius = 0.42;
                else if (atom.element === 'O') radius = 0.40;
                else if (atom.element === 'F') radius = 0.36;
                else if (atom.element === 'Cl') radius = 0.50;
                else if (atom.element === 'Br') radius = 0.55;
                else if (atom.element === 'I') radius = 0.62;
                else if (atom.element === 'S') radius = 0.50;
                else if (atom.element === 'P') radius = 0.50;
                else radius = spec.covRadius * 0.45 + 0.15;
            }

            const mat = new THREE.MeshStandardMaterial({
                color: spec.color,
                roughness: 0.18,
                metalness: 0.08,
                flatShading: false
            });

            const mesh = new THREE.Mesh(sphereGeo, mat);
            mesh.scale.set(radius, radius, radius);
            mesh.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
            mesh.userData = { atomIndex: idx, atomData: atom, origColor: spec.color, radius: radius };

            moleculeGroup.add(mesh);
            atomMeshes.push(mesh);
        });

        // 2. Build Bonds (Cylinders) for Ball & Stick and Wireframe
        if (displayMode !== 'space_fill') {
            const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 24, 1);
            const isWire = (displayMode === 'wireframe');
            const bondRadius = isWire ? 0.038 : 0.085;

            // Common metallic bond material (xám kim loại tiêu chuẩn quốc tế)
            const metallicBondMat = new THREE.MeshStandardMaterial({
                color: 0x94a3b8, // Clean slate / silver metallic
                roughness: 0.30,
                metalness: 0.55
            });

            mol.bonds.forEach((bond, bIdx) => {
                const idx1 = (bond.a1 !== undefined) ? bond.a1 : bond.from;
                const idx2 = (bond.a2 !== undefined) ? bond.a2 : bond.to;
                const a1 = mol.atoms[idx1];
                const a2 = mol.atoms[idx2];
                if (!a1 || !a2) return;

                const p1 = new THREE.Vector3(a1.x - cx, a1.y - cy, a1.z - cz);
                const p2 = new THREE.Vector3(a2.x - cx, a2.y - cy, a2.z - cz);
                const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
                const dist = p1.distanceTo(p2);

                const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
                const orientation = new THREE.Quaternion();
                orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

                const bondOrder = bond.order || 1;

                // Calculate orthogonal offset vector in the molecular plane for multi-bonds
                let perp = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
                if (perp.lengthSq() < 0.01) {
                    perp = new THREE.Vector3(1, 0, 0).cross(dir).normalize();
                }

                // Check adjacent atoms to align double/triple bond plane
                for (let i = 0; i < mol.atoms.length; i++) {
                    if (i !== idx1 && i !== idx2) {
                        const pNeigh = new THREE.Vector3(mol.atoms[i].x - cx, mol.atoms[i].y - cy, mol.atoms[i].z - cz);
                        const vNeigh = new THREE.Vector3().subVectors(pNeigh, p1);
                        const normal = new THREE.Vector3().crossVectors(dir, vNeigh).normalize();
                        if (normal.lengthSq() > 0.05) {
                            perp = new THREE.Vector3().crossVectors(normal, dir).normalize();
                            break;
                        }
                    }
                }

                if (bondOrder === 1) {
                    // Liên kết đơn (Single Bond): 01 hình trụ xám kim loại nối giữa 2 tâm nguyên tử
                    const mesh = new THREE.Mesh(cylGeo, metallicBondMat);
                    mesh.scale.set(bondRadius, dist, bondRadius);
                    mesh.position.copy(mid);
                    mesh.quaternion.copy(orientation);
                    moleculeGroup.add(mesh);
                    bondMeshes.push(mesh);
                } else if (bondOrder === 2) {
                    // Liên kết đôi (Double Bond): 02 hình trụ song song mảnh
                    const offset = isWire ? 0.065 : 0.095;
                    const rDouble = bondRadius * 0.72;

                    const midA = mid.clone().addScaledVector(perp, offset);
                    const meshA = new THREE.Mesh(cylGeo, metallicBondMat);
                    meshA.scale.set(rDouble, dist, rDouble);
                    meshA.position.copy(midA);
                    meshA.quaternion.copy(orientation);
                    moleculeGroup.add(meshA);
                    bondMeshes.push(meshA);

                    const midB = mid.clone().addScaledVector(perp, -offset);
                    const meshB = new THREE.Mesh(cylGeo, metallicBondMat);
                    meshB.scale.set(rDouble, dist, rDouble);
                    meshB.position.copy(midB);
                    meshB.quaternion.copy(orientation);
                    moleculeGroup.add(meshB);
                    bondMeshes.push(meshB);
                } else if (bondOrder === 3) {
                    // Liên kết ba (Triple Bond): 03 hình trụ song song mảnh
                    const offset = isWire ? 0.08 : 0.125;
                    const rTriple = bondRadius * 0.62;

                    // Central cylinder
                    const meshCenter = new THREE.Mesh(cylGeo, metallicBondMat);
                    meshCenter.scale.set(rTriple, dist, rTriple);
                    meshCenter.position.copy(mid);
                    meshCenter.quaternion.copy(orientation);
                    moleculeGroup.add(meshCenter);
                    bondMeshes.push(meshCenter);

                    // +offset cylinder
                    const midA = mid.clone().addScaledVector(perp, offset);
                    const meshA = new THREE.Mesh(cylGeo, metallicBondMat);
                    meshA.scale.set(rTriple, dist, rTriple);
                    meshA.position.copy(midA);
                    meshA.quaternion.copy(orientation);
                    moleculeGroup.add(meshA);
                    bondMeshes.push(meshA);

                    // -offset cylinder
                    const midB = mid.clone().addScaledVector(perp, -offset);
                    const meshB = new THREE.Mesh(cylGeo, metallicBondMat);
                    meshB.scale.set(rTriple, dist, rTriple);
                    meshB.position.copy(midB);
                    meshB.quaternion.copy(orientation);
                    moleculeGroup.add(meshB);
                    bondMeshes.push(meshB);
                }
            });

            // 3. Vòng thơm Benzen: Render hiệu ứng vòng thơm đặc trưng (Delocalized π electron ring)
            const aromaticRings = findAromaticBenzeneRings(mol, cx, cy, cz);
            aromaticRings.forEach(ring => {
                const ringRadius = (ring.radius || 1.39) * 0.62;
                const torusTube = isWire ? 0.022 : 0.034;
                const torusGeo = new THREE.TorusGeometry(ringRadius, torusTube, 16, 48);
                const torusMat = new THREE.MeshStandardMaterial({
                    color: 0x38bdf8, // Sky blue luminous π cloud
                    roughness: 0.25,
                    metalness: 0.45,
                    transparent: true,
                    opacity: 0.85
                });
                const torusMesh = new THREE.Mesh(torusGeo, torusMat);
                torusMesh.position.copy(ring.center);

                // Align Torus axis (0, 0, 1) with ring planar normal
                const q = new THREE.Quaternion();
                q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), ring.normal);
                torusMesh.quaternion.copy(q);

                moleculeGroup.add(torusMesh);
                bondMeshes.push(torusMesh);
            });
        }
    }

    function findAromaticBenzeneRings(mol, cx, cy, cz) {
        if (!mol || !mol.atoms || !mol.bonds) return [];
        const isAromatic = (mol.groupId === 'arene') || 
                          (mol.id && (mol.id.includes('benzene') || mol.id.includes('naphthalene') || mol.id.includes('anthracene') || mol.id.includes('phenol') || mol.id.includes('toluene') || mol.id.includes('xylene') || mol.id.includes('picric') || mol.id.includes('styrene') || mol.id.includes('benzoic') || mol.id.includes('aniline')));
        if (!isAromatic) return [];

        const atoms = mol.atoms;
        const bonds = mol.bonds;
        const n = atoms.length;
        const adj = Array.from({ length: n }, () => []);

        bonds.forEach(b => {
            const u = (b.a1 !== undefined) ? b.a1 : b.from;
            const v = (b.a2 !== undefined) ? b.a2 : b.to;
            if (u !== undefined && v !== undefined && u < n && v < n) {
                adj[u].push(v);
                adj[v].push(u);
            }
        });

        const rings = [];
        const visited = new Set();

        function dfs(path) {
            const curr = path[path.length - 1];
            adj[curr].forEach(neighbor => {
                if (path.length === 6 && neighbor === path[0]) {
                    const sortedKey = [...path].sort((a, b) => a - b).join(',');
                    if (!visited.has(sortedKey)) {
                        if (path.every(idx => atoms[idx].element === 'C')) {
                            visited.add(sortedKey);
                            const pList = path.map(idx => new THREE.Vector3(atoms[idx].x - cx, atoms[idx].y - cy, atoms[idx].z - cz));
                            const center = new THREE.Vector3();
                            pList.forEach(p => center.add(p));
                            center.divideScalar(6);

                            const v1 = new THREE.Vector3().subVectors(pList[1], pList[0]);
                            const v2 = new THREE.Vector3().subVectors(pList[3], pList[0]);
                            const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

                            let avgRadius = 0;
                            pList.forEach(p => { avgRadius += p.distanceTo(center); });
                            avgRadius /= 6;

                            rings.push({ indices: path, center: center, normal: normal, radius: avgRadius || 1.39 });
                        }
                    }
                    return;
                }
                if (path.length < 6 && !path.includes(neighbor)) {
                    dfs([...path, neighbor]);
                }
            });
        }

        for (let i = 0; i < n; i++) {
            if (atoms[i].element === 'C') {
                dfs([i]);
            }
        }
        return rings;
    }

    function rebuildOrbitals3D() {
        if (!orbitalsGroup) return;

        while (orbitalsGroup.children.length > 0) {
            const obj = orbitalsGroup.children[0];
            orbitalsGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }

        if (!showOrbitals) return;

        const mol = MOLECULES_DB[currentMoleculeIndex];
        if (!mol) return;

        let cx = 0, cy = 0, cz = 0;
        mol.atoms.forEach(a => { cx += a.x; cy += a.y; cz += a.z; });
        cx /= mol.atoms.length; cy /= mol.atoms.length; cz /= mol.atoms.length;

        // Smooth orbital lobes
        const lobeGeo = new THREE.SphereGeometry(1, 24, 24);

        mol.atoms.forEach(atom => {
            if (atom.element === 'H') return;
            const hybrid = atom.hybridization || 'sp3';
            const pos = new THREE.Vector3(atom.x - cx, atom.y - cy, atom.z - cz);

            const matCyan = new THREE.MeshStandardMaterial({
                color: 0x06b6d4,
                transparent: true,
                opacity: 0.38,
                roughness: 0.1,
                metalness: 0.1
            });

            const matPink = new THREE.MeshStandardMaterial({
                color: 0xec4899,
                transparent: true,
                opacity: 0.38,
                roughness: 0.1,
                metalness: 0.1
            });

            let vectors = [];
            if (hybrid === 'sp3') {
                vectors = [
                    new THREE.Vector3(1, 1, 1).normalize(),
                    new THREE.Vector3(-1, -1, 1).normalize(),
                    new THREE.Vector3(-1, 1, -1).normalize(),
                    new THREE.Vector3(1, -1, -1).normalize()
                ];
            } else if (hybrid === 'sp2') {
                vectors = [
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(-0.5, 0.866, 0),
                    new THREE.Vector3(-0.5, -0.866, 0)
                ];
            } else if (hybrid === 'sp') {
                vectors = [
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(-1, 0, 0)
                ];
            }

            vectors.forEach((v, idx) => {
                const lobe = new THREE.Mesh(lobeGeo, idx % 2 === 0 ? matCyan : matPink);
                lobe.scale.set(0.32, 0.55, 0.32);
                lobe.position.copy(pos).addScaledVector(v, 0.45);
                const q = new THREE.Quaternion();
                q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
                lobe.quaternion.copy(q);
                orbitalsGroup.add(lobe);
            });
        });
    }

    function onCanvasMouseMove(e) {
        if (!containerEl || !raycaster || !camera) return;
        const rect = containerEl.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(atomMeshes);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            containerEl.style.cursor = 'pointer';

            if (hoveredAtom !== hit) {
                if (hoveredAtom && !selectedAtomsForMeasure.includes(hoveredAtom)) {
                    hoveredAtom.material.emissive.setHex(0x000000);
                }
                hoveredAtom = hit;
                hoveredAtom.material.emissive.setHex(0x38bdf8);
            }
        } else {
            containerEl.style.cursor = 'grab';
            if (hoveredAtom && !selectedAtomsForMeasure.includes(hoveredAtom)) {
                hoveredAtom.material.emissive.setHex(0x000000);
                hoveredAtom = null;
            }
        }
    }

    function onCanvasClick(e) {
        if (!containerEl || !raycaster || !camera) return;
        const rect = containerEl.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(atomMeshes);

        if (intersects.length > 0) {
            const clickedAtom = intersects[0].object;
            if (measureMode !== 'none') {
                handleAtomClickForMeasure(clickedAtom);
            } else {
                showAtomInspector(clickedAtom);
            }
        }
    }

    function showAtomInspector(mesh) {
        const hud = document.getElementById('atom-inspector-hud');
        if (!hud) return;

        const a = mesh.userData.atomData;
        const spec = ELEMENT_SPECS[a.element] || ELEMENT_SPECS['C'];

        const badge = document.getElementById('insp-elem-badge');
        badge.textContent = a.element;
        badge.style.backgroundColor = spec.hex;

        document.getElementById('insp-elem-name').textContent = `${spec.name} (${spec.viName}) #${mesh.userData.atomIndex + 1}`;
        document.getElementById('insp-elem-hybrid').textContent = `Lai hóa: ${a.hybridization || 'sp³'}`;
        document.getElementById('insp-elem-z').textContent = spec.z;
        document.getElementById('insp-elem-mass').textContent = spec.mass;
        document.getElementById('insp-elem-vdw').textContent = spec.vdwRadius + ' Å';
        document.getElementById('insp-elem-pauling').textContent = spec.pauling;
        document.getElementById('insp-elem-valency').textContent = spec.valency;
        document.getElementById('insp-elem-ox').textContent = a.oxidation || '-';

        hud.classList.remove('hidden');
    }

    function startMeasureMode(mode) {
        measureMode = mode;
        selectedAtomsForMeasure = [];
        clearMeasureVisuals();

        // Switch to measurement tab in right sidebar
        const setRightTab = (tab) => {
            currentRightTab = tab;
            ['select-mol', 'details', 'measure'].forEach(t => {
                const b = document.getElementById('tab-btn-' + t);
                const c = document.getElementById('tab-content-' + t);
                const isSelected = (tab === t.replace('-', '_'));
                if (isSelected) {
                    b.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-md flex items-center justify-center space-x-1';
                    c.classList.remove('hidden');
                } else {
                    b.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center space-x-1';
                    c.classList.add('hidden');
                }
            });
        };
        setRightTab('measure');

        const badge = document.getElementById('measure-state-badge');
        const guide = document.getElementById('measure-guide-text');
        const display = document.getElementById('measure-data-display');
        const cancelBtn = document.getElementById('btn-cancel-measure');

        cancelBtn.classList.remove('hidden');
        display.classList.add('hidden');

        if (mode === 'distance') {
            badge.textContent = 'Đo d (Å)';
            badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-500';
            guide.textContent = '👉 Hãy nhấp chọn 2 quả cầu nguyên tử trên mô hình 3D để đo khoảng cách liên kết.';
        } else if (mode === 'angle') {
            badge.textContent = 'Đo Góc (°)';
            badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-500';
            guide.textContent = '👉 Hãy nhấp chọn 3 quả cầu nguyên tử: Nguyên tử 1 → Nguyên tử ở giữa (tâm góc) → Nguyên tử 3.';
        }
    }

    function cancelMeasureMode() {
        measureMode = 'none';
        selectedAtomsForMeasure.forEach(a => {
            if (a && a.material) a.material.emissive.setHex(0x000000);
        });
        selectedAtomsForMeasure = [];
        clearMeasureVisuals();

        const badge = document.getElementById('measure-state-badge');
        const guide = document.getElementById('measure-guide-text');
        const display = document.getElementById('measure-data-display');
        const cancelBtn = document.getElementById('btn-cancel-measure');

        if (badge) {
            badge.textContent = 'Tắt';
            badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
        }
        if (guide) {
            guide.textContent = 'Nhấp chọn nút đo bên trên, sau đó nhấp vào các quả cầu nguyên tử trong không gian 3D.';
        }
        if (display) display.classList.add('hidden');
        if (cancelBtn) cancelBtn.classList.add('hidden');
    }

    function handleAtomClickForMeasure(mesh) {
        if (selectedAtomsForMeasure.includes(mesh)) return;

        selectedAtomsForMeasure.push(mesh);
        mesh.material.emissive.setHex(0xf59e0b); // Amber glow

        const guide = document.getElementById('measure-guide-text');
        const display = document.getElementById('measure-data-display');

        if (measureMode === 'distance') {
            if (selectedAtomsForMeasure.length === 1) {
                guide.textContent = `Đã chọn nguyên tử 1: ${mesh.userData.atomData.element}(#${mesh.userData.atomIndex + 1}). Hãy chọn nguyên tử thứ 2...`;
            } else if (selectedAtomsForMeasure.length === 2) {
                const m1 = selectedAtomsForMeasure[0];
                const m2 = selectedAtomsForMeasure[1];
                const d = m1.position.distanceTo(m2.position);

                display.innerHTML = `
                    <div class="text-xs text-amber-200">Khoảng cách giữa ${m1.userData.atomData.element}(#${m1.userData.atomIndex + 1}) và ${m2.userData.atomData.element}(#${m2.userData.atomIndex + 1}):</div>
                    <div class="text-base text-amber-300 font-extrabold pt-0.5">d = ${d.toFixed(3)} Å (${(d * 100).toFixed(1)} pm)</div>
                `;
                display.classList.remove('hidden');
                drawMeasureLine(m1.position, m2.position);
                guide.textContent = '✅ Đã hoàn tất đo khoảng cách!';
            }
        } else if (measureMode === 'angle') {
            if (selectedAtomsForMeasure.length === 1) {
                guide.textContent = `Đã chọn đỉnh 1: ${mesh.userData.atomData.element}(#${mesh.userData.atomIndex + 1}). Hãy chọn tiếp nguyên tử ở giữa (đỉnh góc)...`;
            } else if (selectedAtomsForMeasure.length === 2) {
                guide.textContent = `Đã chọn tâm: ${mesh.userData.atomData.element}(#${mesh.userData.atomIndex + 1}). Hãy chọn tiếp nguyên tử thứ 3...`;
            } else if (selectedAtomsForMeasure.length === 3) {
                const p1 = selectedAtomsForMeasure[0].position;
                const pCenter = selectedAtomsForMeasure[1].position;
                const p2 = selectedAtomsForMeasure[2].position;

                const v1 = new THREE.Vector3().subVectors(p1, pCenter).normalize();
                const v2 = new THREE.Vector3().subVectors(p2, pCenter).normalize();
                const dot = Math.min(Math.max(v1.dot(v2), -1), 1);
                const angleRad = Math.acos(dot);
                const angleDeg = angleRad * (180 / Math.PI);

                display.innerHTML = `
                    <div class="text-xs text-amber-200">Góc ∠(${selectedAtomsForMeasure[0].userData.atomData.element} - ${selectedAtomsForMeasure[1].userData.atomData.element} - ${selectedAtomsForMeasure[2].userData.atomData.element}):</div>
                    <div class="text-base text-amber-300 font-extrabold pt-0.5">θ = ${angleDeg.toFixed(1)}° (${angleRad.toFixed(3)} rad)</div>
                `;
                display.classList.remove('hidden');
                drawMeasureLine(p1, pCenter);
                drawMeasureLine(pCenter, p2);
                guide.textContent = '✅ Đã hoàn tất đo góc liên kết!';
            }
        }
    }

    function drawMeasureLine(p1, p2) {
        const material = new THREE.LineDashedMaterial({
            color: 0xf59e0b,
            dashSize: 0.15,
            gapSize: 0.08,
            linewidth: 2
        });
        const points = [p1, p2];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        measureGroup.add(line);
    }

    function clearMeasureVisuals() {
        if (!measureGroup) return;
        while (measureGroup.children.length > 0) {
            const obj = measureGroup.children[0];
            measureGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }
    }

    function resetCamera() {
        if (!camera || !controls) return;
        const mol = MOLECULES_DB[currentMoleculeIndex];
        let maxDist = 3.5;
        if (mol && mol.atoms) {
            let cx = 0, cy = 0, cz = 0;
            mol.atoms.forEach(a => { cx += a.x; cy += a.y; cz += a.z; });
            cx /= mol.atoms.length; cy /= mol.atoms.length; cz /= mol.atoms.length;
            mol.atoms.forEach(a => {
                const d = Math.sqrt((a.x - cx)**2 + (a.y - cy)**2 + (a.z - cz)**2);
                if (d > maxDist) maxDist = d;
            });
        }
        const fitDistance = Math.max(6.5, maxDist * 2.6);
        camera.position.set(0, 0, fitDistance);
        controls.target.set(0, 0, 0);
        controls.update();
    }

    function takeSnapshot() {
        if (!renderer || !scene || !camera) return;
        renderer.render(scene, camera);
        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        const mol = MOLECULES_DB[currentMoleculeIndex];
        link.download = `3D_PhanTu_${mol ? mol.formula : 'Molecule'}.png`;
        link.href = dataURL;
        link.click();
    }

    function animate() {
        animFrameId = requestAnimationFrame(animate);

        if (autoRotate && moleculeGroup) {
            moleculeGroup.rotation.y += 0.005;
            if (orbitalsGroup) orbitalsGroup.rotation.y += 0.005;
            if (measureGroup) measureGroup.rotation.y += 0.005;
        }

        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

})();
</script>
"""

    with open("visualizer_injection_bundle.html", "w", encoding="utf-8") as f:
        f.write(js_code)
    print(f"Visualizer bundle generated. Size: {len(js_code)} bytes")

if __name__ == "__main__":
    build_visualizer_engine()
