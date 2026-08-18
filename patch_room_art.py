import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

new_draw_room = """
        function drawRoom(ctx, w, h) {
            // Background Wall
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(0, 0, w, h);
            
            // Floor
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(0, h - 200, w, 200);
            
            // Grid lines on floor for perspective
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1;
            for(let i=0; i<w; i+=50) {
                ctx.beginPath(); ctx.moveTo(i, h-200); ctx.lineTo(i-100, h); ctx.stroke();
            }
            for(let i=0; i<h; i+=50) {
                if(i > h-200) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
            }

            // Lab Table
            const tableW = 800;
            const tableH = 150;
            const tableX = w / 2 - 400;
            const tableY = h - 200 - tableH;

            // Table shadow
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fillRect(tableX - 20, h - 200, tableW + 40, 20);

            // Table legs stainless steel
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(tableX + 20, tableY, 20, tableH + 180);
            ctx.fillRect(tableX + tableW - 40, tableY, 20, tableH + 180);
            // Mid bar
            ctx.fillRect(tableX + 20, h - 100, tableW - 60, 10);

            // Table top
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(tableX, tableY, tableW, 20);
            ctx.strokeStyle = "#94a3b8";
            ctx.strokeRect(tableX, tableY, tableW, 20);

            // Shelves (Stainless steel)
            const shelfY = tableY - 250;
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(tableX, shelfY, tableW - 250, 250); // backboard
            ctx.strokeRect(tableX, shelfY, tableW - 250, 250);
            
            // Shelves horizontal
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(tableX, shelfY, tableW - 250, 15); // top
            ctx.fillRect(tableX, shelfY + 120, tableW - 250, 15); // mid
            
            // Vertical dividers
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(tableX + 180, shelfY, 15, 250);
            ctx.fillRect(tableX + 360, shelfY, 15, 250);

            // Shelf Labels
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("MŨ TRÙM ĐẦU", tableX + 90, shelfY - 10);
            ctx.fillText("KÍNH BẢO HỘ", tableX + 270, shelfY - 10);
            ctx.fillText("GĂNG TAY NITRILE", tableX + 450, shelfY - 10);
            ctx.fillText("GIÀY BẢO HỘ", tableX + 450, shelfY + 110);

            // Coat Rack (Stainless steel)
            const rackX = tableX + tableW - 200;
            const rackY = tableY - 300;
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(rackX, rackY, 200, 15); // top bar
            ctx.fillRect(rackX, rackY + 50, 200, 15); // hanging bar
            ctx.fillRect(rackX + 20, rackY, 15, tableH + 300 + 180); // left leg
            ctx.fillRect(rackX + 165, rackY, 15, tableH + 300 + 180); // right leg
            
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(rackX, h - 80, 200, 15); // bottom bar
            
            // Wheels
            ctx.fillStyle = "#334155";
            ctx.beginPath(); ctx.arc(rackX + 27, h - 60, 15, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(rackX + 172, h - 60, 15, 0, Math.PI*2); ctx.fill();
        }
"""

content = re.sub(r'function drawRoom\(ctx, w, h\) \{.*?(?=function drawItems)', new_draw_room, content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
