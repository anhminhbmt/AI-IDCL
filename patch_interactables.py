import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

interactables_js = """
        function getInteractables() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const tableW = 800;
            const tableH = 150;
            const tableX = w / 2 - 400;
            const tableY = h - 200 - tableH;
            const shelfY = tableY - 250;
            const rackX = tableX + tableW - 200;
            const rackY = tableY - 300;
            
            return [
                { id: "headcover", name: "Lấy Mũ Trùm", x: tableX + 30, y: shelfY + 25, w: 120, h: 80, color: "#cbd5e1" },
                { id: "goggles", name: "Lấy Kính", x: tableX + 210, y: shelfY + 25, w: 120, h: 80, color: "#38bdf8" },
                { id: "gloves", name: "Lấy Găng Tay", x: tableX + 390, y: shelfY + 25, w: 140, h: 80, color: "#818cf8" },
                { id: "shoes", name: "Lấy Giày", x: tableX + 390, y: shelfY + 145, w: 140, h: 80, color: "#475569" },
                { id: "coat", name: "Lấy Áo Blouse", x: rackX + 30, y: rackY + 60, w: 140, h: 300, color: "#ffffff" }
            ];
        }
"""

content = re.sub(r'const interactables = \[.*?\];', 'const interactables = getInteractables();', content, flags=re.DOTALL)
content = content.replace('let foundCount = 0;', interactables_js + '\n        let foundCount = 0;')

# We need to make sure getInteractables is called in leftClickHandler to get updated positions 
# and also in drawItems.
left_click_logic = """
        function leftClickHandler(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const currentInteractables = getInteractables();

            for (let item of currentInteractables) {
"""
content = re.sub(r'function leftClickHandler\(e\) \{.*?for \(let item of interactables\) \{', left_click_logic, content, flags=re.DOTALL)

draw_items_logic = """
        function drawItems(ctx) {
            const currentInteractables = getInteractables();
            ctx.textAlign = "center";
            ctx.font = "bold 13px sans-serif";
            for (let item of currentInteractables) {
"""
content = re.sub(r'function drawItems\(ctx\) \{.*?for \(let item of interactables\) \{', draw_items_logic, content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
