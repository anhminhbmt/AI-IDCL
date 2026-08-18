import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# 1. Extract and globalize the game state and drawing helpers
player_state = """
            // --- Global Canvas State & Helpers ---
            const player = {
                x: 200, y: window.innerHeight - 260,
                targetX: 200, targetY: window.innerHeight - 260,
                speed: 8,
                width: 90, height: 350,
                moving: false,
                animTime: 0,
                equipped: { coat: false, goggles: false, gloves: false, shoes: false, headcover: false, mask: false }
            };

            function createGradient(ctx, x, y, w, h, colors) {
                const g = ctx.createLinearGradient(x, y, x, y+h);
                colors.forEach((c, i) => g.addColorStop(i/(colors.length-1), c));
                return g;
            }

            function getMetalGradient(ctx, x, y, w, h, horizontal=false) {
                let g = horizontal ? ctx.createLinearGradient(x, y, x+w, y) : ctx.createLinearGradient(x, y, x, y+h);
                g.addColorStop(0, "#475569");
                g.addColorStop(0.1, "#94a3b8");
                g.addColorStop(0.3, "#ffffff"); // sharp highlight
                g.addColorStop(0.5, "#94a3b8");
                g.addColorStop(0.8, "#64748b");
                g.addColorStop(1, "#334155");
                return g;
            }

            function drawRoom(ctx, w, h) {
                // High contrast wall with depth
                const bgG = ctx.createRadialGradient(w/2, h/2, h/4, w/2, h/2, h);
                bgG.addColorStop(0, "#ffffff");
                bgG.addColorStop(1, "#e2e8f0");
                ctx.fillStyle = bgG;
                ctx.fillRect(0, 0, w, h);
                
                // Floor with deep reflections
                const floorTop = h - 250;
                const floorG = ctx.createLinearGradient(0, floorTop, 0, h);
                floorG.addColorStop(0, "#cbd5e1");
                floorG.addColorStop(0.2, "#f8fafc");
                floorG.addColorStop(1, "#64748b");
                ctx.fillStyle = floorG;
                ctx.fillRect(0, floorTop, w, 250);

                // Floor tiles perspective
                ctx.strokeStyle = "rgba(0,0,0,0.05)";
                ctx.lineWidth = 2;
                for(let i=0; i<w; i+=100) {
                    ctx.beginPath(); ctx.moveTo(i, floorTop); ctx.lineTo(i-200, h); ctx.stroke();
                }

                // Baseboard
                ctx.fillStyle = "#94a3b8";
                ctx.fillRect(0, floorTop, w, 15);

                // Table properties
                const tableW = 800;
                const tableH = 150;
                const tableX = w / 2 - 400;
                const tableY = h - 200 - tableH;

                // Ambient Occlusion shadow under table
                ctx.shadowColor = "rgba(0,0,0,0.4)";
                ctx.shadowBlur = 30;
                ctx.fillStyle = "rgba(0,0,0,0.2)";
                ctx.fillRect(tableX - 20, floorTop + 20, tableW + 40, 40);
                ctx.shadowColor = "transparent";

                // Table legs
                ctx.fillStyle = getMetalGradient(ctx, tableX+20, tableY, 25, tableH+180, true);
                ctx.fillRect(tableX + 20, tableY, 25, tableH + 180);
                ctx.fillRect(tableX + tableW - 45, tableY, 25, tableH + 180);
                
                // Mid bar
                ctx.fillStyle = getMetalGradient(ctx, tableX+20, h-100, tableW-60, 15, false);
                ctx.fillRect(tableX + 20, h - 100, tableW - 60, 15);

                // Table top
                ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;
                ctx.fillStyle = getMetalGradient(ctx, tableX, tableY, tableW, 25, false);
                ctx.fillRect(tableX, tableY, tableW, 25);
                ctx.shadowColor = "transparent";

                // --- Shelves (Glass & Metal) ---
                const shelfY = tableY - 250;
                
                // Shelf brackets
                ctx.fillStyle = getMetalGradient(ctx, tableX, shelfY-20, tableW, 250, true);
                ctx.fillRect(tableX + 100, shelfY - 40, 15, 300);
                ctx.fillRect(tableX + tableW - 100, shelfY - 40, 15, 300);

                // Glass shelf planes
                ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 15; ctx.shadowOffsetY = 10;
                ctx.fillStyle = "rgba(240, 249, 255, 0.4)";
                ctx.fillRect(tableX, shelfY, tableW, 12);
                ctx.fillRect(tableX, shelfY + 120, tableW, 12);
                
                // Glass highlights
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fillRect(tableX, shelfY, tableW, 2);
                ctx.fillRect(tableX, shelfY + 120, tableW, 2);
                ctx.shadowColor = "transparent";
                ctx.shadowOffsetY = 0;

                // --- Coat Rack ---
                const rackX = tableX + tableW - 200;
                const rackY = tableY - 300;
                ctx.fillStyle = getMetalGradient(ctx, rackX, rackY, 20, 350, true);
                ctx.fillRect(rackX, rackY, 15, 350);
                // Top knob
                ctx.beginPath(); ctx.arc(rackX + 7.5, rackY, 15, 0, Math.PI*2); ctx.fill();
                // Hook
                ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 8; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(rackX + 7.5, rackY + 50); ctx.lineTo(rackX + 40, rackY + 30); ctx.stroke();

                return { tableX, tableY, tableW, floorTop, shelfY, rackX, rackY };
            }

            function drawPlayer(ctx) {
                ctx.save();
                ctx.translate(player.x, player.y);
                
                // Shadow
                ctx.shadowColor = "rgba(0,0,0,0.4)";
                ctx.shadowBlur = 15;
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.beginPath();
                ctx.ellipse(0, player.height/2 - 10, 40, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowColor = "transparent";

                // Leg movement
                const walkAngle = player.moving ? Math.sin(player.animTime) * 0.4 : 0;
                const torsoW = 60, torsoH = 120;
                
                // Helper for cylindrical gradients
                const createCylGrad = (x1, x2, color1, color2) => {
                    const g = ctx.createLinearGradient(x1, 0, x2, 0);
                    g.addColorStop(0, color2);
                    g.addColorStop(0.3, color1); // highlight
                    g.addColorStop(0.7, color1);
                    g.addColorStop(1, color2);
                    return g;
                };

                // --- LEGS ---
                ctx.save();
                ctx.translate(0, torsoH/2);
                
                // Left leg
                ctx.save();
                ctx.translate(-15, 0);
                ctx.rotate(walkAngle);
                ctx.fillStyle = createCylGrad(-12, 12, "#1e293b", "#0f172a");
                ctx.beginPath(); ctx.roundRect(-12, 0, 24, 120, 5); ctx.fill();
                // Shoe
                if (player.equipped.shoes) {
                    ctx.fillStyle = createCylGrad(-18, 18, "#52525b", "#27272a");
                    ctx.beginPath(); ctx.roundRect(-18, 110, 36, 25, 8); ctx.fill();
                    // Steel toe
                    ctx.fillStyle = createCylGrad(0, 18, "#d4d4d8", "#71717a");
                    ctx.beginPath(); ctx.roundRect(0, 110, 18, 25, 8); ctx.fill();
                } else {
                    ctx.fillStyle = createCylGrad(-15, 15, "#a1a1aa", "#52525b");
                    ctx.beginPath(); ctx.roundRect(-15, 115, 30, 15, 5); ctx.fill();
                }
                ctx.restore();

                // Right leg
                ctx.save();
                ctx.translate(15, 0);
                ctx.rotate(-walkAngle);
                ctx.fillStyle = createCylGrad(-12, 12, "#1e293b", "#0f172a");
                ctx.beginPath(); ctx.roundRect(-12, 0, 24, 120, 5); ctx.fill();
                // Shoe
                if (player.equipped.shoes) {
                    ctx.fillStyle = createCylGrad(-18, 18, "#52525b", "#27272a");
                    ctx.beginPath(); ctx.roundRect(-18, 110, 36, 25, 8); ctx.fill();
                    ctx.fillStyle = createCylGrad(0, 18, "#d4d4d8", "#71717a");
                    ctx.beginPath(); ctx.roundRect(0, 110, 18, 25, 8); ctx.fill();
                } else {
                    ctx.fillStyle = createCylGrad(-15, 15, "#a1a1aa", "#52525b");
                    ctx.beginPath(); ctx.roundRect(-15, 115, 30, 15, 5); ctx.fill();
                }
                ctx.restore();
                ctx.restore();

                // --- BACK ARM (Right) ---
                ctx.save();
                ctx.translate(torsoW/2 - 5, -torsoH/2 + 10);
                ctx.rotate(walkAngle); 
                ctx.fillStyle = player.equipped.coat ? createCylGrad(-10, 10, "#e2e8f0", "#94a3b8") : createCylGrad(-10, 10, "#3b82f6", "#1e40af");
                ctx.beginPath(); ctx.roundRect(-10, 0, 20, 100, 10); ctx.fill();
                ctx.translate(0, 95);
                if (player.equipped.gloves) {
                    ctx.fillStyle = createCylGrad(-12, 12, "#6366f1", "#3730a3");
                    ctx.beginPath(); ctx.roundRect(-12, 0, 24, 25, 8); ctx.fill();
                } else {
                    ctx.fillStyle = createCylGrad(-10, 10, "#fed7aa", "#ea580c");
                    ctx.beginPath(); ctx.roundRect(-10, 0, 20, 20, 8); ctx.fill();
                }
                ctx.restore();

                // --- TORSO ---
                ctx.shadowColor = "rgba(0,0,0,0.4)";
                ctx.shadowBlur = 15;
                ctx.fillStyle = player.equipped.coat ? createCylGrad(-torsoW/2, torsoW/2, "#ffffff", "#cbd5e1") : createCylGrad(-torsoW/2, torsoW/2, "#93c5fd", "#2563eb");
                ctx.beginPath();
                ctx.roundRect(-torsoW/2, -torsoH/2, torsoW, torsoH, 15);
                ctx.fill();
                ctx.shadowColor = "transparent";

                // Collar
                ctx.fillStyle = createCylGrad(-15, 15, "#ffedd5", "#fb923c");
                ctx.beginPath(); ctx.moveTo(-15, -torsoH/2); ctx.lineTo(15, -torsoH/2); ctx.lineTo(0, -torsoH/2 + 25); ctx.fill();
                
                if (player.equipped.coat) {
                    // 3D lapel folds
                    ctx.fillStyle = "rgba(0,0,0,0.05)";
                    ctx.beginPath(); ctx.moveTo(-15, -torsoH/2); ctx.lineTo(0, torsoH/2); ctx.lineTo(-10, torsoH/2); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(15, -torsoH/2); ctx.lineTo(0, torsoH/2); ctx.lineTo(10, torsoH/2); ctx.fill();
                }

                // --- HEAD ---
                ctx.translate(0, -torsoH/2 - 35);
                
                // Face (Spherical gradient)
                const faceGrad = ctx.createRadialGradient(-5, -10, 5, 0, 0, 35);
                faceGrad.addColorStop(0, "#ffffff");
                faceGrad.addColorStop(0.5, "#ffedd5");
                faceGrad.addColorStop(1, "#fb923c");
                
                // Back hair
                if (!player.equipped.headcover) {
                    const hairGrad = ctx.createRadialGradient(-35, 5, 2, -35, 5, 20);
                    hairGrad.addColorStop(0, "#334155"); hairGrad.addColorStop(1, "#020617");
                    ctx.fillStyle = hairGrad;
                    ctx.beginPath(); ctx.ellipse(-35, 5, 15, 25, Math.PI/4, 0, Math.PI*2); ctx.fill();
                }
                
                // Face base
                ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
                ctx.fillStyle = faceGrad;
                ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fill();
                ctx.shadowColor = "transparent";

                // Top hair
                if (!player.equipped.headcover) {
                    const topHair = ctx.createRadialGradient(0, -15, 5, 0, 0, 35);
                    topHair.addColorStop(0, "#334155"); topHair.addColorStop(1, "#020617");
                    ctx.fillStyle = topHair;
                    ctx.beginPath(); ctx.arc(0, -5, 33, Math.PI+0.2, -0.2); ctx.fill();
                }

                // Face details
                ctx.fillStyle = "#0f172a";
                ctx.beginPath(); ctx.arc(-12, -5, 4, 0, Math.PI*2); ctx.fill(); // L eye
                ctx.beginPath(); ctx.arc(12, -5, 4, 0, Math.PI*2); ctx.fill();  // R eye
                
                if (!player.equipped.mask) {
                    ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(0, 12, 8, 0, Math.PI); ctx.stroke(); // Mouth
                }

                // Headcover
                if (player.equipped.headcover) {
                    const hcGrad = ctx.createRadialGradient(-10, -15, 10, 0, 0, 40);
                    hcGrad.addColorStop(0, "#ffffff"); hcGrad.addColorStop(1, "#94a3b8");
                    ctx.fillStyle = hcGrad;
                    ctx.beginPath(); ctx.arc(0, -8, 35, Math.PI + 0.2, -0.2); ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(0, -8, 35, Math.PI + 0.2, -0.2); ctx.stroke();
                }

                // Mask
                if (player.equipped.mask) {
                    const maskGrad = ctx.createLinearGradient(0, 5, 0, 25);
                    maskGrad.addColorStop(0, "#e0f2fe"); maskGrad.addColorStop(1, "#7dd3fc");
                    ctx.fillStyle = maskGrad;
                    ctx.beginPath(); ctx.roundRect(-22, 5, 44, 22, 4); ctx.fill();
                    
                    ctx.strokeStyle = "rgba(2, 132, 199, 0.3)"; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(-20, 12); ctx.lineTo(20, 12); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-20, 18); ctx.lineTo(20, 18); ctx.stroke();
                    
                    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(-22, 16, 12, Math.PI/2, Math.PI*1.5); ctx.stroke();
                    ctx.beginPath(); ctx.arc(22, 16, 12, -Math.PI/2, Math.PI/2); ctx.stroke();
                }

                // Goggles
                if (player.equipped.goggles) {
                    ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
                    ctx.strokeStyle = "rgba(2, 132, 199, 0.9)";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.roundRect(-28, -15, 56, 22, 6); ctx.fill(); ctx.stroke();
                    
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.beginPath(); ctx.ellipse(-15, -8, 6, 2, Math.PI/6, 0, Math.PI*2); ctx.fill();
                    
                    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(28, -5); ctx.lineTo(35, -8); ctx.stroke();
                    ctx.moveTo(-28, -5); ctx.lineTo(-35, -8); ctx.stroke();
                }

                ctx.translate(0, torsoH/2 + 35); // back to torso center

                // --- FRONT ARM (Left) ---
                ctx.save();
                ctx.translate(-torsoW/2 + 5, -torsoH/2 + 10);
                ctx.rotate(-walkAngle); 
                ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10; ctx.shadowOffsetX = -5;
                ctx.fillStyle = player.equipped.coat ? createCylGrad(-12, 12, "#ffffff", "#cbd5e1") : createCylGrad(-12, 12, "#60a5fa", "#1d4ed8");
                ctx.beginPath(); ctx.roundRect(-12, 0, 24, 105, 12); ctx.fill();
                ctx.shadowColor = "transparent";
                
                ctx.translate(0, 100);
                if (player.equipped.gloves) {
                    ctx.fillStyle = createCylGrad(-12, 12, "#818cf8", "#4338ca");
                    ctx.beginPath(); ctx.roundRect(-12, 0, 24, 25, 8); ctx.fill();
                } else {
                    ctx.fillStyle = createCylGrad(-10, 10, "#ffedd5", "#ea580c");
                    ctx.beginPath(); ctx.roundRect(-10, 0, 20, 20, 8); ctx.fill();
                }
                ctx.restore();

                ctx.restore();
            }

"""

# Use regex to strip out everything from "// --- Stage 1 Canvas Game (60fps) ---" down to "// --- Start Application ---"
new_content = re.sub(
    r'// --- Stage 1 Canvas Game \(60fps\) ---.*?// --- Start Application ---',
    player_state + '\n' +
    open('stage_patches.js').read() + '\n            // --- Start Application ---',
    content,
    flags=re.DOTALL
)

with open("public/safety_gate.html", "w") as f:
    f.write(new_content)

