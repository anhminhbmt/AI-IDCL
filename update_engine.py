# -*- coding: utf-8 -*-
"""
Script to update visualizer engine and index.html
"""
import re, json

def update_visualizer_engine():
    with open("build_organic_visualizer_engine.py", "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update open/close functions
    open_replacement = """    // Open Visualizer Function (global)
    window.openOrganicMoleculeVisualizer = function(molId) {
        let modal = document.getElementById('organic-3d-visualizer-modal');
        if (!modal) {
            initVisualizerDOM();
            modal = document.getElementById('organic-3d-visualizer-modal');
        }
        // Hide laboratory interface completely to give 100% focused space to 3D organic viewer
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
    };"""

    code = re.sub(
        r"// Open Visualizer Function \(global\)[\s\S]*?window\.closeOrganicMoleculeVisualizer = function\(\) \{[\s\S]*?\};",
        open_replacement,
        code,
        count=1
    )

    # 2. Update Header Navbar inside initVisualizerDOM
    old_header_pattern = r'<header class="h-14 bg-slate-900/90[\s\S]*?</header>'
    new_header = """<header class="h-14 bg-slate-900/95 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-30 shadow-lg shrink-0">
                <div class="flex items-center space-x-3">
                    <button id="btn-return-lab" class="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-blue-950 border border-blue-400/40 hover:scale-[1.02] active:scale-[0.98]" title="Quay trở lại không gian phòng thí nghiệm">
                        <svg class="w-4 h-4 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        <span>← Trở Về Phòng Thí Nghiệm</span>
                    </button>
                    <div class="h-5 w-px bg-slate-800 hidden sm:block"></div>
                    <div class="hidden md:flex items-center space-x-2">
                        <div class="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md text-white font-black text-xs flex items-center justify-center w-7 h-7">
                            3D
                        </div>
                        <div>
                            <h1 class="font-bold text-xs md:text-sm text-white flex items-center space-x-1.5">
                                <span>Thư Viện 3D Cấu Trúc 53 Phân Tử Hữu Cơ</span>
                                <span class="text-[10px] bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full font-semibold">Chuẩn Quốc Tế IUPAC</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    <button id="btn-snapshot" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95" title="Chụp ảnh phân tử 3D độ nét cao PNG trong suốt">
                        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span class="hidden sm:inline">Chụp Ảnh 4K</span>
                    </button>
                    <button id="btn-close-visualizer" class="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center w-9 h-9" title="Đóng và quay lại thí nghiệm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </header>"""

    code = re.sub(old_header_pattern, new_header, code, count=1)

    # 3. Add listener for btn-return-lab and Escape key
    old_listener = "document.getElementById('btn-close-visualizer').addEventListener('click', window.closeOrganicMoleculeVisualizer);"
    new_listener = """document.getElementById('btn-close-visualizer').addEventListener('click', window.closeOrganicMoleculeVisualizer);
        const returnLabBtn = document.getElementById('btn-return-lab');
        if (returnLabBtn) returnLabBtn.addEventListener('click', window.closeOrganicMoleculeVisualizer);
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('organic-3d-visualizer-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    window.closeOrganicMoleculeVisualizer();
                }
            }
        });"""

    if old_listener in code:
        code = code.replace(old_listener, new_listener, 1)

    with open("build_organic_visualizer_engine.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated build_organic_visualizer_engine.py")

if __name__ == "__main__":
    update_visualizer_engine()
