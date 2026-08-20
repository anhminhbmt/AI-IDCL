# -*- coding: utf-8 -*-
"""
Patches index.html safely using string slicing without re.sub unescaping.
"""
import subprocess, tempfile

def patch_index():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update HeaderNavbar buttons in script
    idx_start = html.find('id:"btn-google-meet"')
    if idx_start != -1:
        div_start = html.rfind('h.jsxDEV("div",{className:', 0, idx_start)
        div_end = html.find('lineNumber:69,columnNumber:7},void 0)', idx_start)
        if div_start != -1 and div_end != -1:
            div_end += len('lineNumber:69,columnNumber:7},void 0)')
            old_block = html[div_start:div_end]
            
            new_buttons = r'''h.jsxDEV("div",{className:"flex items-center space-x-1.5 sm:space-x-2 shrink-0 flex-nowrap",children:[h.jsxDEV("button",{id:"btn-google-meet",onClick:()=>b(!0),className:"px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 shrink-0 shadow-sm border border-emerald-400/30 active:scale-95 whitespace-nowrap",title:"Mở phòng họp Google Meet trình chiếu",children:[h.jsxDEV(rb,{className:"w-3.5 h-3.5 text-emerald-100 shrink-0"},void 0,!1,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:88,columnNumber:11},void 0),h.jsxDEV("span",{className:"hidden sm:inline",children:"Google Meet"},void 0,!1,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:89,columnNumber:11},void 0)]},void 0,!0,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:82,columnNumber:9},void 0),h.jsxDEV("button",{id:"btn-open-3d-molecules",onClick:()=>{window.openOrganicMoleculeVisualizer&&window.openOrganicMoleculeVisualizer()},className:"px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 shadow-sm shadow-indigo-950 border border-indigo-400/40 hover:scale-[1.02] active:scale-95 whitespace-nowrap",title:"Khám phá cấu trúc không gian 3D của 53 phân tử hữu cơ",children:[h.jsxDEV("span",{className:"text-xs shrink-0",children:"🔬"},void 0,!1),h.jsxDEV("span",{children:"3D Hữu Cơ"},void 0,!1),h.jsxDEV("span",{className:"hidden xl:inline text-[9px] bg-indigo-950/80 text-indigo-200 px-1 py-0.2 rounded font-normal",children:"53 Mẫu"},void 0,!1)]},void 0,!0),h.jsxDEV("button",{onClick:()=>f(!0),className:"px-2.5 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/50 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 shrink-0 shadow-sm active:scale-95 whitespace-nowrap",title:"Xem quy tắc an toàn phòng thí nghiệm",children:[h.jsxDEV(Vx,{className:"w-3.5 h-3.5 text-amber-400 shrink-0"},void 0,!1,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:100,columnNumber:11},void 0),h.jsxDEV("span",{className:"hidden sm:inline",children:"An Toàn"},void 0,!1,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:101,columnNumber:11},void 0)]},void 0,!0,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:96,columnNumber:9},void 0),h.jsxDEV("button",{onClick:r,className:"px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 shrink-0 shadow-sm active:scale-95 whitespace-nowrap",title:"Dọn dẹp lại toàn bộ bàn thí nghiệm",children:[h.jsxDEV(Sm,{className:"w-3.5 h-3.5 text-blue-400 shrink-0"},void 0,!1,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:110,columnNumber:11},void 0),h.jsxDEV("span",{className:"hidden sm:inline",children:"Đặt Lại"},void 0,!1,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:111,columnNumber:11},void 0)]},void 0,!0,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:105,columnNumber:9},void 0)]},void 0,!0,{fileName:"/app/applet/src/components/HeaderNavbar.tsx",lineNumber:69,columnNumber:7},void 0)'''
            
            html = html[:div_start] + new_buttons + html[div_end:]
            print("Successfully replaced HeaderNavbar buttons!")

    # 2. Replace visualizer bundle before </body> using string slicing
    with open("visualizer_injection_bundle.html", "r", encoding="utf-8") as f:
        visualizer_code = f.read()

    start_tag = "<!-- 3D Organic Molecule Visualizer Module Start -->"
    end_tag = "<!-- 3D Organic Molecule Visualizer Module End -->"

    s_pos = html.find(start_tag)
    e_pos = html.find(end_tag)

    if s_pos != -1 and e_pos != -1:
        e_pos += len(end_tag)
        html = html[:s_pos] + f"{start_tag}\n{visualizer_code}\n{end_tag}" + html[e_pos:]
        print("Replaced existing visualizer module block via string slice!")
    else:
        body_pos = html.find("</body>")
        if body_pos != -1:
            html = html[:body_pos] + f"\n{start_tag}\n{visualizer_code}\n{end_tag}\n" + html[body_pos:]
            print("Injected visualizer module before </body>!")

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Saved index.html successfully!")

if __name__ == "__main__":
    patch_index()
