import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

new_code = """
            // --- Stage 1 Canvas Game (60fps) ---
            let stage1LoopId;
            function startStage1CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");

              // Game state
              const player = {
                  x: 200, y: window.innerHeight - 260,
                  targetX: 200, targetY: window.innerHeight - 260,
                  speed: 8,
                  width: 90, height: 350,
                  moving: false,
                  animTime: 0,
                  equipped: { coat: false, goggles: false, gloves: false, shoes: false, headcover: false, mask: false }
              };

              let interactables = [];
              let draggingItem = null;
              let dragOffsetX = 0;
              let dragOffsetY = 0;
              let foundCount = 0;

              function initItems() {
                  const w = window.innerWidth;
                  const h = window.innerHeight;
                  const tableW = 800;
                  const tableH = 150;
                  const tableX = w / 2 - 400;
                  const tableY = h - 200 - tableH;
                  const shelfY = tableY - 250;
                  const rackX = tableX + tableW - 200;
                  const rackY = tableY - 300;

                  // Define base items
                  interactables = [
                      { id: "headcover", name: "Mũ Trùm", ox: tableX + 30, oy: shelfY + 25, w: 120, h: 80 },
                      { id: "goggles", name: "Kính Bảo Hộ", ox: tableX + 210, oy: shelfY + 25, w: 120, h: 80 },
                      { id: "gloves", name: "Găng Tay", ox: tableX + 390, oy: shelfY + 25, w: 140, h: 80 },
                      { id: "mask", name: "Khẩu Trang", ox: tableX + 210, oy: shelfY + 145, w: 120, h: 80 },
                      { id: "shoes", name: "Giày Bảo Hộ", ox: tableX + 390, oy: shelfY + 145, w: 140, h: 80 },
                      { id: "coat", name: "Áo Blouse", ox: rackX + 30, oy: rackY + 60, w: 140, h: 300 }
                  ];

                  // Set current pos to original pos
                  interactables.forEach(i => {
                      if(!draggingItem || draggingItem.id !== i.id) {
                          i.x = i.ox;
                          i.y = i.oy;
                      }
                  });
              }

              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                  initItems();
                  if(player.y > canvas.height - 260) {
                      player.y = canvas.height - 260;
                      player.targetY = player.y;
                  }
              }
              window.addEventListener("resize", resize);
              resize();

              // --- Event Listeners ---
              function rightClickHandler(e) {
                  e.preventDefault();
                  const rect = canvas.getBoundingClientRect();
                  player.targetX = e.clientX - rect.left;
                  
                  let destY = e.clientY - rect.top;
                  const floorTop = window.innerHeight - 300;
                  const floorBottom = window.innerHeight - 150;
                  if (destY < floorTop) destY = floorTop;
                  if (destY > floorBottom) destY = floorBottom;
                  
                  player.targetY = destY;
                  player.moving = true;
                  playClick();
              }

              function mousedownHandler(e) {
                  if(e.button !== 0) return; // Left click only
                  const rect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const mouseY = e.clientY - rect.top;

                  for (let item of interactables) {
                      if (!player.equipped[item.id] &&
                          mouseX >= item.x && mouseX <= item.x + item.w &&
                          mouseY >= item.y && mouseY <= item.y + item.h) {
                          
                          const dist = Math.abs(player.x - (item.ox + item.w/2));
                          if (dist < 280) { // Allowed to pick up
                              draggingItem = item;
                              dragOffsetX = mouseX - item.x;
                              dragOffsetY = mouseY - item.y;
                              playClick();
                          } else {
                              playError();
                              alert("Bạn đang đứng quá xa! Hãy click CHUỘT PHẢI để đi đến gần kệ chứa đồ này hơn.");
                          }
                          break;
                      }
                  }
              }

              function mousemoveHandler(e) {
                  if (draggingItem) {
                      const rect = canvas.getBoundingClientRect();
                      draggingItem.x = e.clientX - rect.left - dragOffsetX;
                      draggingItem.y = e.clientY - rect.top - dragOffsetY;
                  }
              }

              function mouseupHandler(e) {
                  if (draggingItem) {
                      const rect = canvas.getBoundingClientRect();
                      const mouseX = e.clientX - rect.left;
                      const mouseY = e.clientY - rect.top;

                      // Check if dropped on player (generous hitbox)
                      const px = player.x - player.width/2 - 60;
                      const py = player.y - player.height/2 - 60;
                      const pw = player.width + 120;
                      const ph = player.height + 120;

                      if (mouseX >= px && mouseX <= px + pw &&
                          mouseY >= py && mouseY <= py + ph) {
                          
                          player.equipped[draggingItem.id] = true;
                          foundCount++;
                          playSuccessDing();
                          score += 10;
                          Doms.scoreText.textContent = score;

                          if (foundCount >= 6) { // Now requires 6 items
                              setTimeout(() => {
                                  cancelAnimationFrame(stage1LoopId);
                                  canvas.removeEventListener("contextmenu", rightClickHandler);
                                  canvas.removeEventListener("mousedown", mousedownHandler);
                                  canvas.removeEventListener("mousemove", mousemoveHandler);
                                  canvas.removeEventListener("mouseup", mouseupHandler);
                                  window.removeEventListener("resize", resize);
                                  onComplete();
                              }, 500);
                          }
                      } else {
                          // Snap back to shelf
                          draggingItem.x = draggingItem.ox;
                          draggingItem.y = draggingItem.oy;
                          playError();
                      }
                      draggingItem = null;
                  }
              }

              canvas.addEventListener("contextmenu", rightClickHandler);
              canvas.addEventListener("mousedown", mousedownHandler);
              canvas.addEventListener("mousemove", mousemoveHandler);
              canvas.addEventListener("mouseup", mouseupHandler);

              let lastTime = 0;
              function update(deltaTime) {
                  if (player.moving) {
                      player.animTime += 0.2;
                      const dx = player.targetX - player.x;
                      const dy = player.targetY - player.y;
                      const distance = Math.sqrt(dx*dx + dy*dy);

                      if (distance > player.speed) {
                          player.x += (dx / distance) * player.speed;
                          player.y += (dy / distance) * player.speed;
                      } else {
                          player.x = player.targetX;
                          player.y = player.targetY;
                          player.moving = false;
                      }
                  }
              }

              // --- Drawing Functions ---
              function createGradient(ctx, x, y, w, h, colors) {
                  const g = ctx.createLinearGradient(x, y, x, y+h);
                  colors.forEach((c, i) => g.addColorStop(i/(colors.length-1), c));
                  return g;
              }

              // Draw a realistic metallic gradient with sharp specular highlights
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

                  // Table legs (highly metallic)
                  ctx.fillStyle = getMetalGradient(ctx, tableX+20, tableY, 25, tableH+180, true);
                  ctx.fillRect(tableX + 20, tableY, 25, tableH + 180);
                  ctx.fillRect(tableX + tableW - 45, tableY, 25, tableH + 180);
                  
                  // Mid bar
                  ctx.fillStyle = getMetalGradient(ctx, tableX+20, h-100, tableW-60, 15, false);
                  ctx.fillRect(tableX + 20, h - 100, tableW - 60, 15);

                  // Table top (thick stainless steel)
                  ctx.shadowColor = "rgba(0,0,0,0.3)";
                  ctx.shadowBlur = 10;
                  ctx.shadowOffsetY = 5;
                  ctx.fillStyle = getMetalGradient(ctx, tableX, tableY, tableW, 25, false);
                  ctx.fillRect(tableX, tableY, tableW, 25);
                  ctx.shadowColor = "transparent";

                  // Shelves base
                  const shelfY = tableY - 250;
                  ctx.fillStyle = "#e2e8f0"; // Matte backboard
                  ctx.fillRect(tableX, shelfY, tableW - 250, 250); 
                  
                  // Shelf tops with cast shadows
                  ctx.shadowColor = "rgba(0,0,0,0.5)";
                  ctx.shadowBlur = 8;
                  ctx.shadowOffsetY = 3;
                  ctx.fillStyle = getMetalGradient(ctx, tableX, shelfY, tableW-250, 15, false);
                  ctx.fillRect(tableX, shelfY, tableW - 250, 15); // top
                  ctx.fillRect(tableX, shelfY + 120, tableW - 250, 15); // mid
                  
                  // Vertical dividers
                  ctx.fillRect(tableX + 180, shelfY, 15, 250);
                  ctx.fillRect(tableX + 360, shelfY, 15, 250);
                  ctx.shadowColor = "transparent";

                  // Shelf Labels
                  const drawLabel = (text, x, y) => {
                      ctx.shadowColor = "rgba(0,0,0,0.2)";
                      ctx.shadowBlur = 4;
                      ctx.fillStyle = "#f8fafc";
                      ctx.fillRect(x - 55, y - 14, 110, 22);
                      ctx.shadowColor = "transparent";
                      ctx.strokeStyle = "#94a3b8";
                      ctx.strokeRect(x - 55, y - 14, 110, 22);
                      ctx.fillStyle = "#0f172a";
                      ctx.font = "bold 11px sans-serif";
                      ctx.textAlign = "center";
                      ctx.fillText(text, x, y+2);
                  };
                  drawLabel("MŨ TRÙM ĐẦU", tableX + 90, shelfY - 10);
                  drawLabel("KÍNH BẢO HỘ", tableX + 270, shelfY - 10);
                  drawLabel("GĂNG TAY NITRILE", tableX + 450, shelfY - 10);
                  drawLabel("KHẨU TRANG Y TẾ", tableX + 270, shelfY + 110);
                  drawLabel("GIÀY BẢO HỘ", tableX + 450, shelfY + 110);

                  // Coat Rack
                  const rackX = tableX + tableW - 200;
                  const rackY = tableY - 300;
                  ctx.fillStyle = getMetalGradient(ctx, rackX, rackY, 200, 15, false);
                  ctx.fillRect(rackX, rackY, 200, 15); // top bar
                  ctx.fillRect(rackX, rackY + 50, 200, 10); // hanging bar
                  ctx.fillRect(rackX, h - 80, 200, 15); // bottom bar
                  
                  ctx.fillStyle = getMetalGradient(ctx, rackX+20, rackY, 15, tableH+300+180, true);
                  ctx.fillRect(rackX + 20, rackY, 15, tableH + 300 + 180); // left leg
                  ctx.fillRect(rackX + 165, rackY, 15, tableH + 300 + 180); // right leg
                  
                  // Wheels
                  ctx.fillStyle = "#0f172a";
                  ctx.beginPath(); ctx.arc(rackX + 27, h - 60, 15, 0, Math.PI*2); ctx.fill();
                  ctx.beginPath(); ctx.arc(rackX + 172, h - 60, 15, 0, Math.PI*2); ctx.fill();
              }

              // Function to draw realistic volumetric objects
              function drawSingleItem(ctx, id, w) {
                  if (id === "headcover") {
                      // Stacked volumetric hairnets
                      for(let i=0; i<4; i++) {
                          const grad = ctx.createRadialGradient(w/2, 20+i*15-5, 5, w/2, 20+i*15, 25);
                          grad.addColorStop(0, "#ffffff");
                          grad.addColorStop(0.8, "#e2e8f0");
                          grad.addColorStop(1, "#94a3b8");
                          ctx.fillStyle = grad;
                          ctx.shadowColor = "rgba(0,0,0,0.3)";
                          ctx.shadowBlur = 5;
                          ctx.shadowOffsetY = 2;
                          ctx.beginPath();
                          ctx.ellipse(w/2, 20 + i*15, 40, 18, 0, 0, Math.PI*2);
                          ctx.fill();
                          ctx.shadowColor = "transparent";
                          ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
                          ctx.lineWidth = 1;
                          ctx.stroke();
                      }
                  } else if (id === "goggles") {
                      // Goggles with glassy reflections
                      for(let i=0; i<3; i++) {
                          const gx = 20 + i*40;
                          const gy = 20 + (i%2)*20;
                          ctx.fillStyle = "rgba(14, 165, 233, 0.25)";
                          ctx.strokeStyle = "rgba(2, 132, 199, 0.8)";
                          ctx.lineWidth = 2;
                          ctx.shadowColor = "rgba(0,0,0,0.2)";
                          ctx.shadowBlur = 5;
                          ctx.beginPath();
                          ctx.roundRect(gx, gy, 35, 18, 6);
                          ctx.fill(); ctx.stroke();
                          // Glass highlight
                          ctx.fillStyle = "rgba(255,255,255,0.6)";
                          ctx.beginPath(); ctx.ellipse(gx+10, gy+5, 8, 3, Math.PI/6, 0, Math.PI*2); ctx.fill();
                          // Strap
                          ctx.shadowColor = "transparent";
                          ctx.strokeStyle = "#334155";
                          ctx.beginPath(); ctx.moveTo(gx, gy+9); ctx.lineTo(gx-10, gy-15); ctx.stroke();
                      }
                  } else if (id === "mask") {
                      // Box of masks
                      const grad = ctx.createLinearGradient(10, 10, w-10, 80);
                      grad.addColorStop(0, "#ffffff");
                      grad.addColorStop(1, "#e0f2fe");
                      ctx.fillStyle = grad;
                      ctx.shadowColor = "rgba(0,0,0,0.4)";
                      ctx.shadowBlur = 8;
                      ctx.shadowOffsetY = 4;
                      ctx.fillRect(15, 15, w - 30, 45);
                      ctx.shadowColor = "transparent";
                      ctx.strokeStyle = "#38bdf8";
                      ctx.strokeRect(15, 15, w - 30, 45);
                      ctx.fillStyle = "#0284c7";
                      ctx.font = "bold 9px sans-serif";
                      ctx.fillText("MEDICAL MASKS", w/2, 35);
                      // Draw a few masks sticking out
                      ctx.fillStyle = "#bae6fd";
                      ctx.fillRect(w/2 - 15, 10, 30, 5);
                  } else if (id === "gloves") {
                      // Detailed glove boxes
                      const boxGrad = ctx.createLinearGradient(10, 10, 10, 45);
                      boxGrad.addColorStop(0, "#3b82f6");
                      boxGrad.addColorStop(1, "#1d4ed8");
                      ctx.shadowColor = "rgba(0,0,0,0.4)";
                      ctx.shadowBlur = 8;
                      ctx.shadowOffsetY = 4;
                      ctx.fillStyle = boxGrad;
                      ctx.fillRect(10, 10, w - 20, 35);
                      ctx.fillRect(10, 50, w - 20, 35);
                      ctx.shadowColor = "transparent";
                      ctx.fillStyle = "#ffffff";
                      ctx.fillRect(15, 20, w - 30, 15);
                      ctx.fillRect(15, 60, w - 30, 15);
                      ctx.fillStyle = "#1e40af";
                      ctx.font = "bold 9px sans-serif";
                      ctx.fillText("NITRILE GLOVES", w/2, 31);
                      ctx.fillText("NITRILE GLOVES", w/2, 71);
                  } else if (id === "shoes") {
                      // Volumetric shoe covers
                      const shoeGrad = ctx.createRadialGradient(35, 35, 5, 35, 40, 20);
                      shoeGrad.addColorStop(0, "#60a5fa");
                      shoeGrad.addColorStop(1, "#1e40af");
                      ctx.shadowColor = "rgba(0,0,0,0.3)";
                      ctx.shadowBlur = 5;
                      ctx.shadowOffsetY = 3;
                      for(let i=0; i<2; i++) {
                          ctx.fillStyle = shoeGrad;
                          ctx.beginPath();
                          ctx.ellipse(35 + i*60, 40, 30, 15, 0, Math.PI, 0);
                          ctx.fill();
                          // Elastic band
                          ctx.strokeStyle = "#eff6ff";
                          ctx.lineWidth = 1.5;
                          ctx.beginPath();
                          ctx.moveTo(5 + i*60, 40); ctx.lineTo(65 + i*60, 40); ctx.stroke();
                      }
                      ctx.shadowColor = "transparent";
                  } else if (id === "coat") {
                      // Coats with fabric folds
                      for(let i=0; i<3; i++) {
                          const cx = 20 + i*40;
                          ctx.shadowColor = "rgba(0,0,0,0.2)";
                          ctx.shadowBlur = 5;
                          ctx.shadowOffsetX = 2;
                          // Coat body
                          const coatGrad = ctx.createLinearGradient(cx, 15, cx+50, 15);
                          coatGrad.addColorStop(0, "#f8fafc");
                          coatGrad.addColorStop(0.5, "#ffffff");
                          coatGrad.addColorStop(1, "#e2e8f0");
                          ctx.fillStyle = coatGrad;
                          ctx.beginPath();
                          ctx.moveTo(cx, 15);
                          ctx.lineTo(cx+50, 15);
                          ctx.lineTo(cx+60, 200);
                          ctx.lineTo(cx-10, 200);
                          ctx.fill();
                          
                          ctx.shadowColor = "transparent";
                          // Folds/creases
                          ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
                          ctx.beginPath(); ctx.moveTo(cx+20, 30); ctx.lineTo(cx+15, 180); ctx.stroke();
                          ctx.beginPath(); ctx.moveTo(cx+35, 30); ctx.lineTo(cx+45, 180); ctx.stroke();

                          // Collar
                          ctx.fillStyle = "#f1f5f9";
                          ctx.beginPath(); ctx.moveTo(cx+15, 15); ctx.lineTo(cx+25, 40); ctx.lineTo(cx+35, 15); ctx.fill();
                          // Hanger
                          ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
                          ctx.beginPath(); ctx.moveTo(cx+25, 0); ctx.lineTo(cx+25, -15); ctx.stroke();
                          ctx.beginPath(); ctx.arc(cx+25, -20, 5, -Math.PI, 0); ctx.stroke();
                      }
                  }
              }

              function drawDraggedItem(ctx, id, w) {
                  // The single item being held by cursor
                  if (id === "headcover") {
                      const grad = ctx.createRadialGradient(w/2, 15, 5, w/2, 20, 25);
                      grad.addColorStop(0, "#ffffff"); grad.addColorStop(1, "#cbd5e1");
                      ctx.fillStyle = grad;
                      ctx.beginPath(); ctx.ellipse(w/2, 20, 40, 18, 0, 0, Math.PI*2); ctx.fill();
                  } else if (id === "goggles") {
                      ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
                      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.roundRect(w/2 - 17, 20, 35, 18, 6); ctx.fill(); ctx.stroke();
                  } else if (id === "mask") {
                      // Draw a single mask
                      ctx.fillStyle = "#bae6fd";
                      ctx.beginPath(); ctx.roundRect(w/2 - 20, 20, 40, 25, 3); ctx.fill();
                      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 0.5;
                      ctx.beginPath(); ctx.moveTo(w/2 - 20, 28); ctx.lineTo(w/2 + 20, 28); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(w/2 - 20, 35); ctx.lineTo(w/2 + 20, 35); ctx.stroke();
                      // Ear loops
                      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
                      ctx.beginPath(); ctx.arc(w/2 - 20, 32, 8, Math.PI/2, Math.PI*1.5); ctx.stroke();
                      ctx.beginPath(); ctx.arc(w/2 + 20, 32, 8, -Math.PI/2, Math.PI/2); ctx.stroke();
                  } else if (id === "gloves") {
                      const grad = ctx.createLinearGradient(w/2 - 10, 10, w/2 + 10, 50);
                      grad.addColorStop(0, "#3b82f6"); grad.addColorStop(1, "#1e40af");
                      ctx.fillStyle = grad;
                      ctx.beginPath(); ctx.roundRect(w/2 - 10, 10, 20, 40, 5); ctx.fill();
                  } else if (id === "shoes") {
                      const grad = ctx.createRadialGradient(w/2, 35, 5, w/2, 40, 20);
                      grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1e40af");
                      ctx.fillStyle = grad;
                      ctx.beginPath(); ctx.ellipse(w/2, 40, 30, 15, 0, Math.PI, 0); ctx.fill();
                  } else if (id === "coat") {
                      const cx = w/2 - 25;
                      const coatGrad = ctx.createLinearGradient(cx, 15, cx+50, 15);
                      coatGrad.addColorStop(0, "#f8fafc"); coatGrad.addColorStop(1, "#e2e8f0");
                      ctx.fillStyle = coatGrad;
                      ctx.beginPath(); ctx.moveTo(cx, 15); ctx.lineTo(cx+50, 15); ctx.lineTo(cx+60, 200); ctx.lineTo(cx-10, 200); ctx.fill();
                  }
              }

              function drawItems(ctx) {
                  ctx.textAlign = "center";
                  ctx.font = "bold 13px sans-serif";

                  for (let item of interactables) {
                      ctx.save();
                      ctx.translate(item.ox, item.oy);
                      drawSingleItem(ctx, item.id, item.w);
                      ctx.restore();

                      if (draggingItem && draggingItem.id === item.id) {
                          ctx.save();
                          ctx.translate(item.x, item.y);
                          ctx.shadowColor = "rgba(0,0,0,0.5)";
                          ctx.shadowBlur = 20;
                          ctx.shadowOffsetX = 10;
                          ctx.shadowOffsetY = 20;
                          ctx.scale(1.2, 1.2);
                          drawDraggedItem(ctx, item.id, item.w);
                          ctx.restore();
                      }
                  }
              }

              function drawPlayer(ctx) {
                  ctx.save();
                  ctx.translate(player.x, player.y);
                  
                  // Ground drop shadow
                  ctx.fillStyle = "rgba(0,0,0,0.4)";
                  ctx.shadowColor = "rgba(0,0,0,0.2)";
                  ctx.shadowBlur = 10;
                  ctx.beginPath();
                  ctx.ellipse(0, player.height/2 + 5, 45, 15, 0, 0, Math.PI*2);
                  ctx.fill();
                  ctx.shadowColor = "transparent";

                  // Walk animation cycle
                  let walkAngle = 0;
                  if (player.moving) {
                      walkAngle = Math.sin(player.animTime) * 0.4;
                  } else {
                      player.animTime = 0;
                  }

                  const torsoW = player.width - 20;
                  const torsoH = player.height - 150;
                  
                  // 3D Cylinder gradient helper
                  const createCylGrad = (x1, x2, colorCenter, colorEdge) => {
                      let g = ctx.createLinearGradient(x1, 0, x2, 0);
                      g.addColorStop(0, colorEdge);
                      g.addColorStop(0.3, colorCenter);
                      g.addColorStop(0.7, colorCenter);
                      g.addColorStop(1, colorEdge);
                      return g;
                  };

                  // --- LEGS ---
                  // Back Leg (Right)
                  ctx.save();
                  ctx.translate(torsoW/4, torsoH/2);
                  ctx.rotate(-walkAngle);
                  ctx.fillStyle = player.equipped.coat ? createCylGrad(-15, 15, "#ffffff", "#94a3b8") : createCylGrad(-15, 15, "#3b82f6", "#1e3a8a");
                  ctx.beginPath(); ctx.roundRect(-15, 0, 30, 95, 10); ctx.fill();
                  
                  // Back Shoe
                  ctx.translate(0, 90);
                  ctx.fillStyle = player.equipped.shoes ? createCylGrad(-20, 20, "#60a5fa", "#1e40af") : createCylGrad(-18, 18, "#475569", "#0f172a");
                  ctx.beginPath(); ctx.ellipse(0, 5, player.equipped.shoes ? 22 : 18, 14, 0, Math.PI, 0); ctx.fill();
                  ctx.restore();

                  // Front Leg (Left)
                  ctx.save();
                  ctx.translate(-torsoW/4, torsoH/2);
                  ctx.rotate(walkAngle);
                  // Drop shadow from torso onto leg
                  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = -5;
                  ctx.fillStyle = player.equipped.coat ? createCylGrad(-15, 15, "#ffffff", "#cbd5e1") : createCylGrad(-15, 15, "#60a5fa", "#1d4ed8");
                  ctx.beginPath(); ctx.roundRect(-15, 0, 30, 95, 10); ctx.fill();
                  ctx.shadowColor = "transparent";
                  
                  // Front Shoe
                  ctx.translate(0, 90);
                  ctx.fillStyle = player.equipped.shoes ? createCylGrad(-20, 20, "#93c5fd", "#2563eb") : createCylGrad(-18, 18, "#64748b", "#1e293b");
                  ctx.beginPath(); ctx.ellipse(0, 5, player.equipped.shoes ? 22 : 18, 14, 0, Math.PI, 0); ctx.fill();
                  ctx.restore();

                  // --- BACK ARM (Right) ---
                  ctx.save();
                  ctx.translate(torsoW/2 - 5, -torsoH/2 + 10);
                  ctx.rotate(walkAngle);
                  ctx.fillStyle = player.equipped.coat ? createCylGrad(-12, 12, "#e2e8f0", "#94a3b8") : createCylGrad(-12, 12, "#3b82f6", "#1e40af");
                  ctx.beginPath(); ctx.roundRect(-12, 0, 24, 105, 12); ctx.fill();
                  // Back Hand
                  ctx.translate(0, 100);
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
                  
                  // Back hair / ponytail
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
                      // Mask body
                      const maskGrad = ctx.createLinearGradient(0, 5, 0, 25);
                      maskGrad.addColorStop(0, "#e0f2fe"); maskGrad.addColorStop(1, "#7dd3fc");
                      ctx.fillStyle = maskGrad;
                      ctx.beginPath(); ctx.roundRect(-22, 5, 44, 22, 4); ctx.fill();
                      
                      // Pleats (folds)
                      ctx.strokeStyle = "rgba(2, 132, 199, 0.3)"; ctx.lineWidth = 1;
                      ctx.beginPath(); ctx.moveTo(-20, 12); ctx.lineTo(20, 12); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(-20, 18); ctx.lineTo(20, 18); ctx.stroke();

                      // Ear loops
                      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.arc(-22, 16, 12, Math.PI/2, Math.PI*1.5); ctx.stroke();
                      ctx.beginPath(); ctx.arc(22, 16, 12, -Math.PI/2, Math.PI/2); ctx.stroke();
                  }

                  // Goggles (Highest Z-index on face)
                  if (player.equipped.goggles) {
                      ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
                      ctx.strokeStyle = "rgba(2, 132, 199, 0.9)";
                      ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.roundRect(-28, -15, 56, 22, 6); ctx.fill(); ctx.stroke();
                      // Glint
                      ctx.fillStyle = "rgba(255,255,255,0.8)";
                      ctx.beginPath(); ctx.ellipse(-15, -8, 6, 2, Math.PI/6, 0, Math.PI*2); ctx.fill();
                      // Strap
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
                  
                  // Front Hand
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

              function draw(time) {
                  const deltaTime = time - lastTime;
                  lastTime = time;

                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  drawRoom(ctx, canvas.width, canvas.height);
                  update(deltaTime);
                  drawPlayer(ctx);
                  
                  // Draw items last so dragging item is on top
                  drawItems(ctx);

                  // HUD overlay hints
                  ctx.shadowColor = "rgba(255,255,255,0.8)";
                  ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a";
                  ctx.font = "bold 16px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText("Di chuyển: CLICK CHUỘT PHẢI", canvas.width / 2, 80);
                  ctx.fillStyle = "#0284c7";
                  ctx.fillText("Mặc đồ: KÉO THẢ TỪ KỆ VÀO NGƯỜI NHÂN VẬT (Cần 6 món)", canvas.width / 2, 105);
                  ctx.shadowColor = "transparent";

                  stage1LoopId = requestAnimationFrame(draw);
              }

              stage1LoopId = requestAnimationFrame(draw);
            }
"""

content = re.sub(r'// --- Stage 1 Canvas Game \(60fps\) ---.*?// --- Start Application ---', new_code + '\n            // --- Start Application ---', content, flags=re.DOTALL)

# Update the instructions text in DOM
content = content.replace('"Click CHUỘT PHẢI để đi tới gần kệ. Sau đó KÉO THẢ các vật phẩm từ kệ vào người nhân vật để mặc."', '"Click CHUỘT PHẢI để đi tới gần kệ. KÉO THẢ các vật phẩm từ kệ vào người nhân vật để trang bị: Áo, Kính, Găng tay, Giày, Mũ, Khẩu trang."')
content = content.replace('Áo, Kính, Găng tay, Giày kín, Mũ trùm đầu.', 'Áo, Kính, Găng tay, Giày, Mũ, Khẩu trang.')

with open("public/safety_gate.html", "w") as f:
    f.write(content)
