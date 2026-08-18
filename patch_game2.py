import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# Fix player dimensions and speed
content = content.replace('width: 70, height: 180,', 'width: 90, height: 350,')
content = content.replace('speed: 6,', 'speed: 8,')

# Fix initial position
content = content.replace('x: 200, y: window.innerHeight - 150,', 'x: 200, y: window.innerHeight - 260,')
content = content.replace('targetX: 200, targetY: window.innerHeight - 150,', 'targetX: 200, targetY: window.innerHeight - 260,')

# Fix floor bound limits
content = content.replace('const floorTop = window.innerHeight - 200;', 'const floorTop = window.innerHeight - 300;')
content = content.replace('const floorBottom = window.innerHeight;', 'const floorBottom = window.innerHeight - 150;')

# Replace drawItems to support drawing a dragged item separately, leaving the rest on shelf
new_draw_items = """
              function drawSingleItem(ctx, id, w) {
                  if (id === "headcover") {
                      ctx.fillStyle = "#f8fafc";
                      for(let i=0; i<4; i++) {
                          ctx.beginPath();
                          ctx.ellipse(w/2, 20 + i*15, 40, 20, 0, 0, Math.PI*2);
                          ctx.fill();
                          ctx.strokeStyle = "#cbd5e1";
                          ctx.lineWidth = 2;
                          ctx.stroke();
                      }
                  } else if (id === "goggles") {
                      for(let i=0; i<3; i++) {
                          const gx = 20 + i*40;
                          const gy = 20 + (i%2)*20;
                          ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
                          ctx.strokeStyle = "#0ea5e9";
                          ctx.lineWidth = 3;
                          ctx.beginPath();
                          ctx.roundRect(gx, gy, 35, 18, 8);
                          ctx.fill(); ctx.stroke();
                          ctx.beginPath();
                          ctx.moveTo(gx, gy+9); ctx.lineTo(gx-10, gy-15); ctx.stroke();
                      }
                  } else if (id === "gloves") {
                      ctx.fillStyle = "#2563eb"; 
                      ctx.fillRect(10, 10, w - 20, 35);
                      ctx.fillRect(10, 50, w - 20, 35);
                      ctx.fillStyle = "#ffffff";
                      ctx.fillRect(15, 20, w - 30, 15);
                      ctx.fillRect(15, 60, w - 30, 15);
                      ctx.fillStyle = "#2563eb";
                      ctx.font = "9px sans-serif";
                      ctx.fillText("NITRILE GLOVES", w/2, 31);
                      ctx.fillText("NITRILE GLOVES", w/2, 71);
                  } else if (id === "shoes") {
                      ctx.fillStyle = "#3b82f6";
                      for(let i=0; i<2; i++) {
                          ctx.beginPath();
                          ctx.ellipse(35 + i*60, 40, 30, 15, 0, Math.PI, 0);
                          ctx.fill();
                          ctx.strokeStyle = "#1e40af";
                          ctx.lineWidth = 2;
                          ctx.beginPath();
                          ctx.moveTo(5 + i*60, 40); ctx.lineTo(65 + i*60, 40); ctx.stroke();
                      }
                  } else if (id === "coat") {
                      ctx.fillStyle = "#ffffff";
                      ctx.strokeStyle = "#cbd5e1";
                      ctx.lineWidth = 2;
                      for(let i=0; i<3; i++) {
                          const cx = 20 + i*40;
                          ctx.beginPath(); ctx.moveTo(cx+25, 0); ctx.lineTo(cx+25, -15); ctx.stroke();
                          ctx.beginPath(); ctx.arc(cx+25, -20, 5, -Math.PI, 0); ctx.stroke();
                          ctx.beginPath();
                          ctx.moveTo(cx, 15);
                          ctx.lineTo(cx+50, 15);
                          ctx.lineTo(cx+60, 200);
                          ctx.lineTo(cx-10, 200);
                          ctx.fill(); ctx.stroke();
                          ctx.beginPath(); ctx.moveTo(cx+15, 15); ctx.lineTo(cx+25, 40); ctx.lineTo(cx+35, 15); ctx.stroke();
                      }
                  }
              }

              function drawDraggedItem(ctx, id, w) {
                  // Only draw one instance of the item to represent picking it up
                  if (id === "headcover") {
                      ctx.fillStyle = "#f8fafc";
                      ctx.beginPath();
                      ctx.ellipse(w/2, 20, 40, 20, 0, 0, Math.PI*2);
                      ctx.fill();
                      ctx.strokeStyle = "#cbd5e1";
                      ctx.lineWidth = 2;
                      ctx.stroke();
                  } else if (id === "goggles") {
                      const gx = w/2 - 17;
                      const gy = 20;
                      ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
                      ctx.strokeStyle = "#0ea5e9";
                      ctx.lineWidth = 3;
                      ctx.beginPath();
                      ctx.roundRect(gx, gy, 35, 18, 8);
                      ctx.fill(); ctx.stroke();
                      ctx.beginPath();
                      ctx.moveTo(gx, gy+9); ctx.lineTo(gx-10, gy-15); ctx.stroke();
                  } else if (id === "gloves") {
                      // Draw a single blue glove
                      ctx.fillStyle = "#6366f1";
                      ctx.beginPath(); ctx.roundRect(w/2 - 10, 10, 20, 40, 5); ctx.fill(); ctx.stroke();
                  } else if (id === "shoes") {
                      ctx.fillStyle = "#3b82f6";
                      ctx.beginPath();
                      ctx.ellipse(w/2, 40, 30, 15, 0, Math.PI, 0);
                      ctx.fill();
                      ctx.strokeStyle = "#1e40af";
                      ctx.lineWidth = 2;
                      ctx.beginPath();
                      ctx.moveTo(w/2 - 30, 40); ctx.lineTo(w/2 + 30, 40); ctx.stroke();
                  } else if (id === "coat") {
                      const cx = w/2 - 25;
                      ctx.fillStyle = "#ffffff";
                      ctx.strokeStyle = "#cbd5e1";
                      ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.moveTo(cx+25, 0); ctx.lineTo(cx+25, -15); ctx.stroke();
                      ctx.beginPath(); ctx.arc(cx+25, -20, 5, -Math.PI, 0); ctx.stroke();
                      ctx.beginPath();
                      ctx.moveTo(cx, 15);
                      ctx.lineTo(cx+50, 15);
                      ctx.lineTo(cx+60, 200);
                      ctx.lineTo(cx-10, 200);
                      ctx.fill(); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(cx+15, 15); ctx.lineTo(cx+25, 40); ctx.lineTo(cx+35, 15); ctx.stroke();
                  }
              }

              function drawItems(ctx) {
                  ctx.textAlign = "center";
                  ctx.font = "bold 13px sans-serif";

                  for (let item of interactables) {
                      // We ALWAYS draw items on the shelf (even if equipped, since a lab has many items)
                      // Wait, if it's equipped we could still draw the shelf, but for game feedback we might hide the text
                      ctx.save();
                      ctx.translate(item.ox, item.oy);
                      drawSingleItem(ctx, item.id, item.w);
                      
                      if (!player.equipped[item.id]) {
                          ctx.fillStyle = "#1e293b";
                          ctx.fillText(item.name, item.w/2, item.h + 20);
                      }
                      ctx.restore();

                      if (draggingItem && draggingItem.id === item.id) {
                          ctx.save();
                          ctx.translate(item.x, item.y);
                          ctx.shadowColor = "rgba(0,0,0,0.5)";
                          ctx.shadowBlur = 15;
                          ctx.shadowOffsetX = 5;
                          ctx.shadowOffsetY = 15;
                          ctx.scale(1.1, 1.1);
                          drawDraggedItem(ctx, item.id, item.w);
                          ctx.restore();
                      }
                  }
              }
"""

content = re.sub(r'function drawItems\(ctx\) \{.*?(?=function drawPlayer)', new_draw_items, content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
