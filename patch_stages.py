import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# Replace loadStage function
new_load_stage = """
            function loadStage(stage) {
              clearStage();
              stageState = {};
              
              // Canvas takes over for all stages
              document.getElementById("stage1-canvas").classList.remove("hidden");
              document.getElementById("stage-container").style.display = "none";
              document.getElementById("bottom-dock").style.display = "none";

              if (stage === 1) {
                Doms.questTitle.innerHTML = `<i data-lucide="shield-check" class="w-5 h-5 inline"></i> Nhiệm vụ 1: Chuẩn bị PPE`;
                Doms.questDesc.textContent = "Click CHUỘT PHẢI để đi tới gần kệ. KÉO THẢ các vật phẩm từ kệ vào người nhân vật để trang bị: Áo, Kính, Găng tay, Giày, Mũ, Khẩu trang.";
                startStage1CanvasGame(() => {
                  setTimeout(nextStage, 1000);
                });
              } else if (stage === 2) {
                Doms.questTitle.innerHTML = `<i data-lucide="flask-conical" class="w-5 h-5 inline"></i> Nhiệm vụ 2: Pha chế Axit`;
                Doms.questDesc.textContent = "Kéo bình Axit rót vào cốc Nước. (Quy tắc: Luôn rót Axit vào Nước, KHÔNG LÀM NGƯỢC LẠI!)";
                startStage2CanvasGame(() => {
                  setTimeout(nextStage, 1500);
                });
              } else if (stage === 3) {
                Doms.questTitle.innerHTML = `<i data-lucide="trash-2" class="w-5 h-5 inline"></i> Nhiệm vụ 3: Phân Loại Rác`;
                Doms.questDesc.textContent = "Kéo rác thả vào đúng thùng: Đỏ (Sắc nhọn), Cam (Hóa chất), Xanh (Rác sinh hoạt).";
                startStage3CanvasGame(() => {
                  setTimeout(nextStage, 500);
                });
              }
            }
"""

content = re.sub(r'function loadStage\(stage\) \{.*?function completeGate\(\) \{', new_load_stage + '\n            function completeGate() {', content, flags=re.DOTALL)

# Now, define startStage2CanvasGame and startStage3CanvasGame before "// --- Start Application ---"

stage23_code = """
            // --- Helper to draw shared background ---
            function drawSharedLabRoom(ctx, w, h) {
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

                  ctx.strokeStyle = "rgba(0,0,0,0.05)";
                  ctx.lineWidth = 2;
                  for(let i=0; i<w; i+=100) {
                      ctx.beginPath(); ctx.moveTo(i, floorTop); ctx.lineTo(i-200, h); ctx.stroke();
                  }
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

                  const getMetalGradient = (x, y, w, h, horizontal=false) => {
                      let g = horizontal ? ctx.createLinearGradient(x, y, x+w, y) : ctx.createLinearGradient(x, y, x, y+h);
                      g.addColorStop(0, "#475569"); g.addColorStop(0.1, "#94a3b8");
                      g.addColorStop(0.3, "#ffffff"); g.addColorStop(0.5, "#94a3b8");
                      g.addColorStop(0.8, "#64748b"); g.addColorStop(1, "#334155");
                      return g;
                  };

                  // Table legs
                  ctx.fillStyle = getMetalGradient(tableX+20, tableY, 25, tableH+180, true);
                  ctx.fillRect(tableX + 20, tableY, 25, tableH + 180);
                  ctx.fillRect(tableX + tableW - 45, tableY, 25, tableH + 180);
                  
                  // Mid bar
                  ctx.fillStyle = getMetalGradient(tableX+20, h-100, tableW-60, 15, false);
                  ctx.fillRect(tableX + 20, h - 100, tableW - 60, 15);

                  // Table top
                  ctx.shadowColor = "rgba(0,0,0,0.3)";
                  ctx.shadowBlur = 10;
                  ctx.shadowOffsetY = 5;
                  ctx.fillStyle = getMetalGradient(tableX, tableY, tableW, 25, false);
                  ctx.fillRect(tableX, tableY, tableW, 25);
                  ctx.shadowColor = "transparent";
                  
                  return { tableX, tableY, tableW, floorTop };
            }

            // --- Stage 2: Acid Mixing ---
            let stage2LoopId;
            function startStage2CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");
              let state = "playing"; // playing, success, explosion
              
              let water = { id: "water", x: window.innerWidth/2 - 150, y: window.innerHeight - 350 - 100, w: 90, h: 100, isHovered: false };
              let acid = { id: "acid", x: window.innerWidth/2 + 50, y: window.innerHeight - 350 - 120, w: 70, h: 120, isHovered: false };
              
              let draggingItem = null;
              let dragOffsetX = 0;
              let dragOffsetY = 0;
              let particles = [];
              let shakeAmt = 0;

              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                  const tY = window.innerHeight - 350;
                  if (!draggingItem) {
                      water.y = tY - water.h;
                      acid.y = tY - acid.h;
                  }
              }
              window.addEventListener("resize", resize);
              resize();

              function getBounds(item) {
                  return { left: item.x, right: item.x + item.w, top: item.y, bottom: item.y + item.h };
              }
              
              function isOverlap(a, b) {
                  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
              }

              function mousedownHandler(e) {
                  if(e.button !== 0 || state !== "playing") return;
                  const rect = canvas.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;

                  if (mx >= acid.x && mx <= acid.x + acid.w && my >= acid.y && my <= acid.y + acid.h) {
                      draggingItem = acid;
                      dragOffsetX = mx - acid.x; dragOffsetY = my - acid.y;
                      playClick();
                  } else if (mx >= water.x && mx <= water.x + water.w && my >= water.y && my <= water.y + water.h) {
                      draggingItem = water;
                      dragOffsetX = mx - water.x; dragOffsetY = my - water.y;
                      playClick();
                  }
              }

              function mousemoveHandler(e) {
                  const rect = canvas.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;
                  if (draggingItem && state === "playing") {
                      draggingItem.x = mx - dragOffsetX;
                      draggingItem.y = my - dragOffsetY;
                  }
              }

              function mouseupHandler(e) {
                  if (draggingItem && state === "playing") {
                      const wb = getBounds(water);
                      const ab = getBounds(acid);
                      
                      if (isOverlap(wb, ab)) {
                          if (draggingItem.id === "acid") {
                              // Correct: Acid into Water
                              playClick();
                              state = "success";
                              Doms.questDesc.textContent = "Chuẩn! Rót axit vào nước giúp tản nhiệt an toàn.";
                              setTimeout(() => {
                                  cleanup();
                                  onComplete();
                              }, 1500);
                          } else {
                              // Wrong: Water into Acid -> EXPLOSION
                              playExplosion();
                              state = "explosion";
                              shakeAmt = 20;
                              deductScore(15, "Rót Nước vào Axit đặc gây sôi bùng, bắn axit tung tóe!");
                              for(let i=0; i<50; i++) {
                                  particles.push({
                                      x: acid.x + acid.w/2, y: acid.y,
                                      vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 20,
                                      life: 1.0, color: (Math.random() > 0.5) ? "#ef4444" : "#f59e0b"
                                  });
                              }
                              setTimeout(() => {
                                  cleanup();
                                  loadStage(2); // restart
                              }, 2500);
                          }
                      } else {
                          // Snap back
                          const tY = window.innerHeight - 350;
                          draggingItem.y = tY - draggingItem.h;
                      }
                      draggingItem = null;
                  }
              }

              function cleanup() {
                  cancelAnimationFrame(stage2LoopId);
                  canvas.removeEventListener("mousedown", mousedownHandler);
                  canvas.removeEventListener("mousemove", mousemoveHandler);
                  canvas.removeEventListener("mouseup", mouseupHandler);
                  window.removeEventListener("resize", resize);
              }

              canvas.addEventListener("mousedown", mousedownHandler);
              canvas.addEventListener("mousemove", mousemoveHandler);
              canvas.addEventListener("mouseup", mouseupHandler);

              function drawBeaker(ctx, item, type) {
                  ctx.save();
                  ctx.translate(item.x, item.y);
                  if (draggingItem === item) {
                      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
                      ctx.rotate(0.1); // tilt
                  } else {
                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 10;
                  }
                  
                  // Glass body
                  ctx.fillStyle = "rgba(255,255,255,0.2)";
                  ctx.strokeStyle = "rgba(255,255,255,0.7)";
                  ctx.lineWidth = 2;
                  
                  if (type === "water") {
                      // Beaker
                      ctx.beginPath(); ctx.roundRect(0, 0, item.w, item.h, 5); ctx.fill(); ctx.stroke();
                      // Liquid
                      let liqH = (state === "success") ? item.h * 0.7 : item.h * 0.5;
                      let liqC = (state === "success") ? "rgba(251, 146, 60, 0.7)" : "rgba(56, 189, 248, 0.5)";
                      ctx.fillStyle = liqC;
                      ctx.beginPath(); ctx.roundRect(5, item.h - liqH, item.w - 10, liqH - 5, 2); ctx.fill();
                      // Label
                      ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
                      ctx.fillText("H2O", item.w/2, item.h/2);
                  } else {
                      // Bottle
                      if (state !== "success" || draggingItem !== item) {
                          ctx.beginPath(); 
                          ctx.moveTo(10, 30); ctx.lineTo(10, item.h - 5); ctx.arcTo(10, item.h, 15, item.h, 5);
                          ctx.lineTo(item.w - 15, item.h); ctx.arcTo(item.w - 10, item.h, item.w - 10, item.h - 5, 5);
                          ctx.lineTo(item.w - 10, 30); ctx.lineTo(item.w/2 + 10, 15); ctx.lineTo(item.w/2 + 10, 0);
                          ctx.lineTo(item.w/2 - 10, 0); ctx.lineTo(item.w/2 - 10, 15); ctx.closePath();
                          ctx.fill(); ctx.stroke();
                          // Liquid
                          if (state !== "explosion" || draggingItem !== item) {
                              ctx.fillStyle = "rgba(252, 211, 77, 0.6)";
                              ctx.fillRect(15, item.h - 50, item.w - 30, 45);
                          }
                          // Label
                          ctx.fillStyle = "#f87171"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
                          ctx.fillText("H2SO4", item.w/2, item.h/2 + 20);
                      }
                  }
                  
                  // Glints
                  ctx.fillStyle = "rgba(255,255,255,0.8)";
                  ctx.fillRect(15, 20, 5, item.h - 40);
                  
                  ctx.restore();
              }

              function draw() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  if (shakeAmt > 0) {
                      ctx.save();
                      ctx.translate((Math.random()-0.5)*shakeAmt, (Math.random()-0.5)*shakeAmt);
                      shakeAmt *= 0.9;
                      if(shakeAmt < 0.5) shakeAmt = 0;
                  }

                  drawSharedLabRoom(ctx, canvas.width, canvas.height);
                  
                  if (state === "explosion") {
                      // Draw particles
                      particles.forEach(p => {
                          p.vy += 0.8; // gravity
                          p.x += p.vx; p.y += p.vy;
                          p.life -= 0.02;
                          ctx.globalAlpha = Math.max(0, p.life);
                          ctx.fillStyle = p.color;
                          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
                      });
                      ctx.globalAlpha = 1.0;
                      // Red overlay
                      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
                      ctx.fillRect(0,0,canvas.width,canvas.height);
                  }

                  // Draw items (dragging one last)
                  if (draggingItem === acid) drawBeaker(ctx, water, "water");
                  if (draggingItem === water) drawBeaker(ctx, acid, "acid");
                  if (draggingItem !== water) drawBeaker(ctx, water, "water");
                  if (draggingItem !== acid) drawBeaker(ctx, acid, "acid");

                  if (shakeAmt > 0) ctx.restore();

                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText("Pha chế Axit: KÉO THẢ bình vào cốc theo đúng nguyên tắc an toàn.", canvas.width / 2, 80);
                  ctx.shadowColor = "transparent";

                  stage2LoopId = requestAnimationFrame(draw);
              }
              stage2LoopId = requestAnimationFrame(draw);
            }

            // --- Stage 3: Waste Sorting ---
            let stage3LoopId;
            function startStage3CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");
              let sortedCount = 0;

              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
              }
              window.addEventListener("resize", resize);
              resize();

              const tY = window.innerHeight - 350;
              const w = window.innerWidth;
              
              // Bins on the floor
              const bins = [
                  { id: "red", color: "#dc2626", label: "SẮC NHỌN", x: w/2 - 200, y: tY + 120, w: 100, h: 120 },
                  { id: "yellow", color: "#d97706", label: "HÓA CHẤT", x: w/2 - 50, y: tY + 120, w: 100, h: 120 },
                  { id: "green", color: "#16a34a", label: "SINH HOẠT", x: w/2 + 100, y: tY + 120, w: 100, h: 120 }
              ];

              // Trash on the table
              const trash = [
                  { id: "glass", type: "glass", name: "Thủy tinh vỡ", x: w/2 - 150, y: tY - 60, w: 50, h: 50, target: "red", visible: true, ox: w/2 - 150, oy: tY - 60 },
                  { id: "chem", type: "flask", name: "Hóa chất dư", x: w/2, y: tY - 60, w: 50, h: 50, target: "yellow", visible: true, ox: w/2, oy: tY - 60 },
                  { id: "paper", type: "paper", name: "Giấy lau sạch", x: w/2 + 150, y: tY - 60, w: 50, h: 50, target: "green", visible: true, ox: w/2 + 150, oy: tY - 60 }
              ];

              let draggingItem = null;
              let dragOffsetX = 0, dragOffsetY = 0;

              function getBounds(item) {
                  return { left: item.x, right: item.x + item.w, top: item.y, bottom: item.y + item.h };
              }
              function isOverlap(a, b) {
                  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
              }

              function mousedownHandler(e) {
                  if(e.button !== 0) return;
                  const mx = e.clientX, my = e.clientY;
                  for (let t of trash) {
                      if (t.visible && mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h) {
                          draggingItem = t;
                          dragOffsetX = mx - t.x; dragOffsetY = my - t.y;
                          playClick();
                          break;
                      }
                  }
              }

              function mousemoveHandler(e) {
                  if (draggingItem) {
                      draggingItem.x = e.clientX - dragOffsetX;
                      draggingItem.y = e.clientY - dragOffsetY;
                  }
              }

              function mouseupHandler(e) {
                  if (draggingItem) {
                      let dropped = false;
                      const tb = getBounds(draggingItem);
                      for (let b of bins) {
                          const bb = getBounds(b);
                          if (isOverlap(tb, bb)) {
                              if (draggingItem.target === b.id) {
                                  // Correct
                                  playClick();
                                  draggingItem.visible = false;
                                  sortedCount++;
                                  if (sortedCount >= 3) {
                                      setTimeout(() => {
                                          cleanup();
                                          onComplete();
                                      }, 500);
                                  }
                              } else {
                                  // Wrong
                                  playError();
                                  deductScore(5, "Phân loại sai! Nguy cơ lây nhiễm hoặc cháy nổ.");
                                  draggingItem.x = draggingItem.ox; draggingItem.y = draggingItem.oy;
                              }
                              dropped = true;
                              break;
                          }
                      }
                      if (!dropped) {
                          draggingItem.x = draggingItem.ox; draggingItem.y = draggingItem.oy;
                      }
                      draggingItem = null;
                  }
              }

              function cleanup() {
                  cancelAnimationFrame(stage3LoopId);
                  canvas.removeEventListener("mousedown", mousedownHandler);
                  canvas.removeEventListener("mousemove", mousemoveHandler);
                  canvas.removeEventListener("mouseup", mouseupHandler);
                  window.removeEventListener("resize", resize);
              }

              canvas.addEventListener("mousedown", mousedownHandler);
              canvas.addEventListener("mousemove", mousemoveHandler);
              canvas.addEventListener("mouseup", mouseupHandler);

              function drawBin(ctx, b) {
                  ctx.save();
                  ctx.translate(b.x, b.y);
                  
                  // Shadow
                  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 15;
                  ctx.fillStyle = b.color;
                  ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(b.w-5, 0); ctx.lineTo(b.w-15, b.h); ctx.lineTo(15, b.h); ctx.fill();
                  ctx.shadowColor = "transparent";
                  
                  // 3D Rim
                  ctx.fillStyle = "rgba(255,255,255,0.2)";
                  ctx.fillRect(0, 0, b.w, 10);
                  
                  // Label
                  ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText(b.label, b.w/2, b.h/2);
                  
                  // Icon placeholder (simple shapes)
                  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
                  if(b.id === "red") {
                      ctx.beginPath(); ctx.moveTo(b.w/2, b.h/2 + 10); ctx.lineTo(b.w/2 - 15, b.h/2 + 35); ctx.lineTo(b.w/2 + 15, b.h/2 + 35); ctx.closePath(); ctx.stroke();
                  } else if (b.id === "yellow") {
                      ctx.beginPath(); ctx.arc(b.w/2, b.h/2 + 25, 12, 0, Math.PI*2); ctx.stroke();
                  } else {
                      ctx.beginPath(); ctx.rect(b.w/2 - 10, b.h/2 + 15, 20, 20); ctx.stroke();
                  }
                  ctx.restore();
              }

              function drawTrash(ctx, t) {
                  if (!t.visible) return;
                  ctx.save();
                  ctx.translate(t.x, t.y);
                  if (draggingItem === t) {
                      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10; ctx.scale(1.2, 1.2);
                  }
                  
                  if (t.type === "glass") {
                      ctx.fillStyle = "rgba(186, 230, 253, 0.8)";
                      ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(0, 40); ctx.lineTo(40, 50); ctx.fill();
                      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 2; ctx.stroke();
                  } else if (t.type === "flask") {
                      ctx.fillStyle = "rgba(251, 191, 36, 0.6)";
                      ctx.beginPath(); ctx.arc(25, 30, 20, 0, Math.PI*2); ctx.fill();
                      ctx.fillStyle = "#b45309"; ctx.fillRect(20, 0, 10, 15);
                  } else {
                      ctx.fillStyle = "#e2e8f0";
                      ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(45, 10); ctx.lineTo(40, 45); ctx.lineTo(0, 40); ctx.fill();
                      ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                  }
                  
                  ctx.fillStyle = "#1e293b"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText(t.name, 25, -10);
                  
                  ctx.restore();
              }

              function draw() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  drawSharedLabRoom(ctx, canvas.width, canvas.height);
                  
                  bins.forEach(b => drawBin(ctx, b));
                  trash.forEach(t => { if(draggingItem !== t) drawTrash(ctx, t); });
                  if (draggingItem) drawTrash(ctx, draggingItem);

                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText("Phân Loại Rác: KÉO THẢ các vật phẩm trên bàn vào đúng thùng rác ở dưới đất.", canvas.width / 2, 80);
                  ctx.shadowColor = "transparent";

                  stage3LoopId = requestAnimationFrame(draw);
              }
              stage3LoopId = requestAnimationFrame(draw);
            }
"""

content = re.sub(r'// --- Start Application ---', stage23_code + '\n            // --- Start Application ---', content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)

