# -*- coding: utf-8 -*-
"""
Patches index.html to inject Three.js CDN, navbar button, and 3D Visualizer bundle.
"""
import re

def patch_index():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Inject Three.js & OrbitControls into <head> if not present
    three_cdn = """
    <!-- Three.js & OrbitControls for 3D Organic Chemistry Visualizer -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    """
    if "three.min.js" not in html:
        html = html.replace("<head>", "<head>\n" + three_cdn, 1)
        print("Injected Three.js CDNs into <head>")

    # 2. Patch HeaderNavbar to remove "Nhiệt độ phòng" and add 3D Molecule Button
    # Find the room info block
    room_info_pattern = r'h\.jsxDEV\("div",\{className:"hidden sm:flex items-center space-x-3 text-xs bg-slate-900 border border-slate-800 px-3 py-1\.5 rounded-xl text-slate-300",children:\[.*?\]\},void 0,!0,\{fileName:"/app/applet/src/components/HeaderNavbar\.tsx",lineNumber:70,columnNumber:9\},void 0\),'
    
    # Check if pattern matches
    match = re.search(room_info_pattern, html, re.DOTALL)
    if match:
        html = html[:match.start()] + html[match.end():]
        print("Removed room thermodynamics & equipment counter from HeaderNavbar")
    else:
        print("Room info pattern not directly matched via regex, let's search specifically")

    # Inject 3D Molecule button next to Google Meet button
    btn_code = r'''h.jsxDEV("button",{id:"btn-open-3d-molecules",onClick:()=>{window.openOrganicMoleculeVisualizer&&window.openOrganicMoleculeVisualizer()},className:"px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-indigo-950 border border-indigo-400/40 hover:scale-[1.02] active:scale-[0.98]",children:[h.jsxDEV("span",{className:"text-sm",children:"🔬"},void 0,!1),h.jsxDEV("span",{children:"3D Hóa Hữu Cơ"},void 0,!1),h.jsxDEV("span",{className:"hidden md:inline text-[10px] bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded font-normal",children:"53 Phân Tử"},void 0,!1)]},void 0,!0),'''

    # Google meet button search
    meet_btn_pattern = r'(h\.jsxDEV\("button",\{id:"btn-google-meet",.*?\}\),)'
    meet_match = re.search(meet_btn_pattern, html, re.DOTALL)
    if meet_match:
        html = html[:meet_match.end()] + btn_code + html[meet_match.end():]
        print("Injected 3D Molecule button next to Google Meet button")
    else:
        # Alternative search
        idx = html.find('id:"btn-google-meet"')
        if idx != -1:
            end_btn = html.find('void 0),', idx) + len('void 0),')
            html = html[:end_btn] + btn_code + html[end_btn:]
            print("Injected 3D Molecule button using fallback index")

    # 3. Inject the complete visualizer bundle before </body>
    with open("visualizer_injection_bundle.html", "r", encoding="utf-8") as f:
        visualizer_code = f.read()

    # Remove any previous injection if present
    if 'id="organic-3d-visualizer-modal"' in html:
        print("Previous visualizer found, replacing...")
        # remove old script
        html = re.sub(r'<!-- 3D Organic Molecule Visualizer Module Start -->.*?<!-- 3D Organic Molecule Visualizer Module End -->', '', html, flags=re.DOTALL)

    wrapped_bundle = f"\n<!-- 3D Organic Molecule Visualizer Module Start -->\n{visualizer_code}\n<!-- 3D Organic Molecule Visualizer Module End -->\n"
    html = html.replace("</body>", wrapped_bundle + "</body>")
    print("Injected full 3D visualizer module before </body>")

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully patched index.html!")

if __name__ == "__main__":
    patch_index()
