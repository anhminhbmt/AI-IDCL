import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# Add animTime to player
content = content.replace('moving: false,', 'moving: false,\n                  animTime: 0,')

# Add animTime update inside update()
content = content.replace('if (player.moving) {\n                      const dx', 'if (player.moving) {\n                      player.animTime += 0.2;\n                      const dx')

# Replace drawPlayer completely
new_draw_player = """
              function drawPlayer(ctx) {
                  ctx.save();
                  ctx.translate(player.x, player.y);
                  
                  // Simple shadow
                  ctx.fillStyle = "rgba(0,0,0,0.3)";
                  ctx.beginPath();
                  ctx.ellipse(0, player.height/2 + 5, 40, 15, 0, 0, Math.PI*2);
                  ctx.fill();

                  // Calculate animation angle for walking
                  let walkAngle = 0;
                  if (player.moving) {
                      walkAngle = Math.sin(player.animTime) * 0.5;
                  } else {
                      player.animTime = 0; // reset
                  }

                  // Torso dimensions
                  const torsoW = player.width - 20;
                  const torsoH = player.height - 150;
                  
                  // Helper for creating linear gradient
                  const createLg = (x1, y1, x2, y2, c1, c2) => {
                      let g = ctx.createLinearGradient(x1, y1, x2, y2);
                      g.addColorStop(0, c1);
                      g.addColorStop(1, c2);
                      return g;
                  };

                  // --- LEGS ---
                  // Back Leg (Right leg)
                  ctx.save();
                  ctx.translate(torsoW/4, torsoH/2);
                  ctx.rotate(-walkAngle);
                  ctx.fillStyle = player.equipped.coat ? createLg(-15, 0, 15, 0, "#e2e8f0", "#94a3b8") : createLg(-15, 0, 15, 0, "#1d4ed8", "#1e3a8a");
                  ctx.beginPath(); ctx.roundRect(-15, 0, 30, 90, 10); ctx.fill();
                  
                  // Back Shoe
                  ctx.translate(0, 85);
                  ctx.fillStyle = player.equipped.shoes ? createLg(-20, -10, 20, 10, "#3b82f6", "#1e40af") : createLg(-18, -8, 18, 8, "#334155", "#0f172a");
                  ctx.beginPath(); ctx.ellipse(0, 5, player.equipped.shoes ? 22 : 18, 12, 0, Math.PI, 0); ctx.fill();
                  ctx.restore();

                  // Front Leg (Left leg)
                  ctx.save();
                  ctx.translate(-torsoW/4, torsoH/2);
                  ctx.rotate(walkAngle);
                  ctx.fillStyle = player.equipped.coat ? createLg(-15, 0, 15, 0, "#f8fafc", "#cbd5e1") : createLg(-15, 0, 15, 0, "#3b82f6", "#1d4ed8");
                  ctx.beginPath(); ctx.roundRect(-15, 0, 30, 90, 10); ctx.fill();
                  
                  // Front Shoe
                  ctx.translate(0, 85);
                  ctx.fillStyle = player.equipped.shoes ? createLg(-20, -10, 20, 10, "#60a5fa", "#2563eb") : createLg(-18, -8, 18, 8, "#475569", "#1e293b");
                  ctx.beginPath(); ctx.ellipse(0, 5, player.equipped.shoes ? 22 : 18, 12, 0, Math.PI, 0); ctx.fill();
                  ctx.restore();

                  // --- BACK ARM (Right arm) ---
                  ctx.save();
                  ctx.translate(torsoW/2 - 5, -torsoH/2 + 10);
                  ctx.rotate(walkAngle);
                  ctx.fillStyle = player.equipped.coat ? createLg(-12, 0, 12, 0, "#e2e8f0", "#94a3b8") : createLg(-12, 0, 12, 0, "#2563eb", "#1e40af");
                  ctx.beginPath(); ctx.roundRect(-12, 0, 24, 100, 12); ctx.fill();
                  // Back Hand
                  ctx.translate(0, 95);
                  if (player.equipped.gloves) {
                      ctx.fillStyle = createLg(-15, -10, 15, 10, "#4f46e5", "#3730a3");
                      ctx.beginPath(); ctx.roundRect(-12, 0, 24, 25, 8); ctx.fill();
                  } else {
                      ctx.fillStyle = createLg(-12, -10, 12, 10, "#fed7aa", "#fdba74");
                      ctx.beginPath(); ctx.roundRect(-10, 0, 20, 20, 8); ctx.fill();
                  }
                  ctx.restore();

                  // --- TORSO ---
                  ctx.fillStyle = player.equipped.coat ? createLg(-torsoW/2, 0, torsoW/2, 0, "#ffffff", "#cbd5e1") : createLg(-torsoW/2, 0, torsoW/2, 0, "#60a5fa", "#2563eb");
                  ctx.beginPath();
                  ctx.roundRect(-torsoW/2, -torsoH/2, torsoW, torsoH, 15);
                  ctx.fill();

                  // Collar
                  ctx.fillStyle = createLg(-15, 0, 15, 0, "#ffedd5", "#fdba74");
                  ctx.beginPath();
                  ctx.moveTo(-15, -torsoH/2);
                  ctx.lineTo(15, -torsoH/2);
                  ctx.lineTo(0, -torsoH/2 + 25);
                  ctx.fill();
                  
                  if (player.equipped.coat) {
                      // Coat lapels
                      ctx.strokeStyle = "#e2e8f0";
                      ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.moveTo(-15, -torsoH/2); ctx.lineTo(-15, torsoH/2); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(15, -torsoH/2); ctx.lineTo(15, torsoH/2); ctx.stroke();
                  }

                  // --- HEAD ---
                  ctx.translate(0, -torsoH/2 - 35);
                  // Hair back/ponytail
                  if (!player.equipped.headcover) {
                      ctx.fillStyle = createLg(-40, -10, 0, 10, "#0f172a", "#1e293b");
                      ctx.beginPath(); ctx.ellipse(-35, 5, 15, 25, Math.PI/4, 0, Math.PI*2); ctx.fill();
                  }
                  
                  // Face
                  ctx.fillStyle = createLg(-30, -30, 30, 30, "#ffedd5", "#fdba74");
                  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();

                  // Hair top
                  if (!player.equipped.headcover) {
                      ctx.fillStyle = "#0f172a";
                      ctx.beginPath(); ctx.arc(0, -5, 32, Math.PI, 0); ctx.fill();
                  }

                  // Face details
                  ctx.fillStyle = "#1e293b";
                  ctx.beginPath(); ctx.arc(-10, -5, 4, 0, Math.PI*2); ctx.fill(); // L eye
                  ctx.beginPath(); ctx.arc(10, -5, 4, 0, Math.PI*2); ctx.fill();  // R eye
                  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
                  ctx.beginPath(); ctx.arc(0, 10, 8, 0, Math.PI); ctx.stroke();   // Mouth

                  // Headcover
                  if (player.equipped.headcover) {
                      ctx.fillStyle = createLg(-35, -35, 35, 35, "#f8fafc", "#94a3b8");
                      ctx.beginPath();
                      ctx.arc(0, -8, 34, Math.PI + 0.2, -0.2);
                      ctx.fill();
                      // Texture lines
                      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
                      ctx.lineWidth = 1;
                      for(let i=0; i<3; i++) {
                          ctx.beginPath(); ctx.arc(0, -8 + i*5, 34, Math.PI+0.4, -0.4); ctx.stroke();
                      }
                  }

                  // Goggles
                  if (player.equipped.goggles) {
                      ctx.fillStyle = "rgba(14, 165, 233, 0.6)";
                      ctx.strokeStyle = "#0284c7";
                      ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.roundRect(-25, -15, 50, 20, 5); ctx.fill(); ctx.stroke();
                      // strap
                      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 3;
                      ctx.beginPath(); ctx.moveTo(25, -5); ctx.lineTo(32, -8); ctx.stroke();
                      ctx.moveTo(-25, -5); ctx.lineTo(-32, -8); ctx.stroke();
                  }

                  ctx.translate(0, torsoH/2 + 35); // back to torso center

                  // --- FRONT ARM (Left arm) ---
                  ctx.save();
                  ctx.translate(-torsoW/2 + 5, -torsoH/2 + 10);
                  ctx.rotate(-walkAngle); // opposite to back arm
                  ctx.fillStyle = player.equipped.coat ? createLg(-12, 0, 12, 0, "#f8fafc", "#cbd5e1") : createLg(-12, 0, 12, 0, "#3b82f6", "#1d4ed8");
                  ctx.beginPath(); ctx.roundRect(-12, 0, 24, 100, 12); ctx.fill();
                  
                  // Front Hand
                  ctx.translate(0, 95);
                  if (player.equipped.gloves) {
                      ctx.fillStyle = createLg(-15, -10, 15, 10, "#6366f1", "#4338ca");
                      ctx.beginPath(); ctx.roundRect(-12, 0, 24, 25, 8); ctx.fill();
                  } else {
                      ctx.fillStyle = createLg(-12, -10, 12, 10, "#ffedd5", "#fdba74");
                      ctx.beginPath(); ctx.roundRect(-10, 0, 20, 20, 8); ctx.fill();
                  }
                  ctx.restore();

                  ctx.restore();
              }
"""

content = re.sub(r'function drawPlayer\(ctx\) \{.*?function draw\(time\)', new_draw_player + '\n              function draw(time)', content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
