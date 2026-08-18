import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

new_draw_items = """
        function drawItems(ctx) {
            const currentInteractables = getInteractables();
            ctx.textAlign = "center";
            ctx.font = "bold 13px sans-serif";
            
            for (let item of currentInteractables) {
                if (!player.equipped[item.id]) {
                    ctx.save();
                    ctx.translate(item.x, item.y);
                    
                    if (item.id === "headcover") {
                        // Draw stacked headcovers
                        ctx.fillStyle = "#f8fafc";
                        for(let i=0; i<3; i++) {
                            ctx.beginPath();
                            ctx.ellipse(item.w/2, 20 + i*15, 40, 15, 0, 0, Math.PI*2);
                            ctx.fill();
                            ctx.strokeStyle = "#cbd5e1";
                            ctx.stroke();
                        }
                    } else if (item.id === "goggles") {
                        // Draw goggles on hooks
                        for(let i=0; i<3; i++) {
                            const gx = 20 + i*40;
                            const gy = 20 + (i%2)*20;
                            ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
                            ctx.strokeStyle = "#38bdf8";
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.roundRect(gx, gy, 30, 15, 5);
                            ctx.fill(); ctx.stroke();
                            // strap
                            ctx.beginPath();
                            ctx.moveTo(gx, gy+5); ctx.lineTo(gx-5, gy-10); ctx.stroke();
                        }
                    } else if (item.id === "gloves") {
                        // Draw glove boxes
                        ctx.fillStyle = "#3b82f6";
                        ctx.fillRect(10, 10, item.w - 20, 30);
                        ctx.fillRect(10, 45, item.w - 20, 30);
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "10px sans-serif";
                        ctx.fillText("NITRILE", item.w/2, 30);
                        ctx.fillText("NITRILE", item.w/2, 65);
                    } else if (item.id === "shoes") {
                        // Draw shoe covers
                        ctx.fillStyle = "#3b82f6";
                        for(let i=0; i<2; i++) {
                            ctx.beginPath();
                            ctx.ellipse(30 + i*60, 40, 25, 12, 0, Math.PI, 0);
                            ctx.fill();
                        }
                    } else if (item.id === "coat") {
                        // Draw hanging coats
                        ctx.fillStyle = "#ffffff";
                        ctx.strokeStyle = "#cbd5e1";
                        for(let i=0; i<3; i++) {
                            const cx = 20 + i*40;
                            // Hanger
                            ctx.beginPath(); ctx.moveTo(cx+20, 0); ctx.lineTo(cx+20, -15); ctx.stroke();
                            // Coat body
                            ctx.beginPath();
                            ctx.moveTo(cx, 10);
                            ctx.lineTo(cx+40, 10);
                            ctx.lineTo(cx+45, 150);
                            ctx.lineTo(cx-5, 150);
                            ctx.fill(); ctx.stroke();
                            // Collar
                            ctx.beginPath(); ctx.moveTo(cx+10, 10); ctx.lineTo(cx+20, 30); ctx.lineTo(cx+30, 10); ctx.stroke();
                        }
                    }
                    
                    ctx.restore();
                    
                    // Hover instruction
                    ctx.fillStyle = "#1e293b";
                    ctx.fillText(item.name, item.x + item.w/2, item.y + item.h + 20);
                }
            }
        }
"""

content = re.sub(r'function drawItems\(ctx\) \{.*?(?=function drawPlayer)', new_draw_items, content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
