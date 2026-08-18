import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

new_game_code = """
            // --- Stage 1 Canvas Game (60fps) ---
            let stage1LoopId;
            function startStage1CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");

              // Game state
              const player = {
                  x: 200, y: window.innerHeight - 150,
                  targetX: 200, targetY: window.innerHeight - 150,
                  speed: 6,
                  width: 70, height: 180,
                  moving: false,
                  equipped: { coat: false, goggles: false, gloves: false, shoes: false, headcover: false }
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
                      { id: "headcover", name: "Mũ Trùm", ox: tableX + 30, oy: shelfY + 25, w: 120, h: 80, color: "#cbd5e1" },
                      { id: "goggles", name: "Kính Bảo Hộ", ox: tableX + 210, oy: shelfY + 25, w: 120, h: 80, color: "#38bdf8" },
                      { id: "gloves", name: "Găng Tay", ox: tableX + 390, oy: shelfY + 25, w: 140, h: 80, color: "#818cf8" },
                      { id: "shoes", name: "Giày Bảo Hộ", ox: tableX + 390, oy: shelfY + 145, w: 140, h: 80, color: "#475569" },
                      { id: "coat", name: "Áo Blouse", ox: rackX + 30, oy: rackY + 60, w: 140, h: 300, color: "#ffffff" }
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
                  if(player.y > canvas.height - 150) {
                      player.y = canvas.height - 150;
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
                  const floorTop = window.innerHeight - 200;
                  const floorBottom = window.innerHeight;
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
                      const px = player.x - player.width/2 - 40;
                      const py = player.y - player.height/2 - 40;
                      const pw = player.width + 80;
                      const ph = player.height + 80;

                      if (mouseX >= px && mouseX <= px + pw &&
                          mouseY >= py && mouseY <= py + ph) {
                          
                          player.equipped[draggingItem.id] = true;
                          foundCount++;
                          playSuccessDing();
                          score += 10;
                          Doms.scoreText.textContent = score;

                          if (foundCount >= 5) {
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

              function drawRoom(ctx, w, h) {
                  // Photo-realistic attempt
                  // Wall
                  ctx.fillStyle = "#f8fafc";
                  ctx.fillRect(0, 0, w, h);
                  
                  // Floor
                  ctx.fillStyle = createGradient(ctx, 0, h-200, w, 200, ["#e2e8f0", "#94a3b8"]);
                  ctx.fillRect(0, h - 200, w, 200);

                  // Baseboard
                  ctx.fillStyle = "#cbd5e1";
                  ctx.fillRect(0, h-200, w, 15);

                  // Table
                  const tableW = 800;
                  const tableH = 150;
                  const tableX = w / 2 - 400;
                  const tableY = h - 200 - tableH;

                  // Shadow
                  ctx.fillStyle = "rgba(0,0,0,0.15)";
                  ctx.fillRect(tableX - 30, h - 195, tableW + 60, 25);

                  // Table legs (metallic)
                  const legG = createGradient(ctx, tableX+20, tableY, 20, tableH+180, ["#94a3b8", "#f1f5f9", "#64748b"]);
                  ctx.fillStyle = legG;
                  ctx.fillRect(tableX + 20, tableY, 25, tableH + 180);
                  ctx.fillRect(tableX + tableW - 45, tableY, 25, tableH + 180);
                  
                  ctx.fillStyle = legG;
                  ctx.fillRect(tableX + 20, h - 100, tableW - 60, 15); // Mid bar

                  // Table top (stainless steel)
                  const topG = createGradient(ctx, tableX, tableY, tableW, 25, ["#e2e8f0", "#ffffff", "#cbd5e1"]);
                  ctx.fillStyle = topG;
                  ctx.fillRect(tableX, tableY, tableW, 25);
                  ctx.strokeStyle = "#94a3b8";
                  ctx.lineWidth = 1;
                  ctx.strokeRect(tableX, tableY, tableW, 25);

                  // Shelves (Stainless steel)
                  const shelfY = tableY - 250;
                  ctx.fillStyle = "#e2e8f0";
                  ctx.fillRect(tableX, shelfY, tableW - 250, 250); // backboard
                  
                  const shelfG = createGradient(ctx, tableX, shelfY, tableW - 250, 15, ["#f1f5f9", "#94a3b8"]);
                  ctx.fillStyle = shelfG;
                  ctx.fillRect(tableX, shelfY, tableW - 250, 20); // top
                  ctx.fillRect(tableX, shelfY + 120, tableW - 250, 20); // mid
                  
                  // Vertical dividers
                  ctx.fillRect(tableX + 180, shelfY, 15, 250);
                  ctx.fillRect(tableX + 360, shelfY, 15, 250);

                  // Shelf Labels
                  ctx.fillStyle = "#ffffff";
                  ctx.font = "bold 13px sans-serif";
                  ctx.textAlign = "center";
                  const drawLabel = (text, x, y) => {
                      ctx.fillStyle = "#ffffff";
                      ctx.fillRect(x - 50, y - 14, 100, 20);
                      ctx.strokeStyle = "#94a3b8";
                      ctx.strokeRect(x - 50, y - 14, 100, 20);
                      ctx.fillStyle = "#0f172a";
                      ctx.fillText(text, x, y);
                  };
                  drawLabel("MŨ TRÙM ĐẦU", tableX + 90, shelfY - 10);
                  drawLabel("KÍNH BẢO HỘ", tableX + 270, shelfY - 10);
                  drawLabel("GĂNG TAY NITRILE", tableX + 450, shelfY - 10);
                  drawLabel("GIÀY BẢO HỘ", tableX + 450, shelfY + 110);

                  // Coat Rack
                  const rackX = tableX + tableW - 200;
                  const rackY = tableY - 300;
                  ctx.fillStyle = legG;
                  ctx.fillRect(rackX, rackY, 200, 15); // top bar
                  ctx.fillRect(rackX, rackY + 50, 200, 10); // hanging bar
                  ctx.fillRect(rackX + 20, rackY, 15, tableH + 300 + 180); // left leg
                  ctx.fillRect(rackX + 165, rackY, 15, tableH + 300 + 180); // right leg
                  ctx.fillRect(rackX, h - 80, 200, 15); // bottom bar
                  
                  // Wheels
                  ctx.fillStyle = "#1e293b";
                  ctx.beginPath(); ctx.arc(rackX + 27, h - 60, 15, 0, Math.PI*2); ctx.fill();
                  ctx.beginPath(); ctx.arc(rackX + 172, h - 60, 15, 0, Math.PI*2); ctx.fill();
              }

              function drawItems(ctx) {
                  ctx.textAlign = "center";
                  ctx.font = "bold 13px sans-serif";

                  for (let item of interactables) {
                      if (!player.equipped[item.id]) {
                          ctx.save();
                          ctx.translate(item.x, item.y);

                          // Add drop shadow if dragging
                          if (draggingItem && draggingItem.id === item.id) {
                              ctx.shadowColor = "rgba(0,0,0,0.5)";
                              ctx.shadowBlur = 15;
                              ctx.shadowOffsetX = 5;
                              ctx.shadowOffsetY = 15;
                              // Slightly scale up
                              ctx.scale(1.1, 1.1);
                          }
                          
                          if (item.id === "headcover") {
                              ctx.fillStyle = "#f8fafc";
                              for(let i=0; i<4; i++) {
                                  ctx.beginPath();
                                  ctx.ellipse(item.w/2, 20 + i*15, 40, 20, 0, 0, Math.PI*2);
                                  ctx.fill();
                                  ctx.strokeStyle = "#cbd5e1";
                                  ctx.lineWidth = 2;
                                  ctx.stroke();
                              }
                          } else if (item.id === "goggles") {
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
                          } else if (item.id === "gloves") {
                              ctx.fillStyle = "#2563eb"; // realistic blue box
                              ctx.fillRect(10, 10, item.w - 20, 35);
                              ctx.fillRect(10, 50, item.w - 20, 35);
                              ctx.fillStyle = "#ffffff";
                              ctx.fillRect(15, 20, item.w - 30, 15);
                              ctx.fillRect(15, 60, item.w - 30, 15);
                              ctx.fillStyle = "#2563eb";
                              ctx.font = "9px sans-serif";
                              ctx.fillText("NITRILE GLOVES", item.w/2, 31);
                              ctx.fillText("NITRILE GLOVES", item.w/2, 71);
                          } else if (item.id === "shoes") {
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
                          } else if (item.id === "coat") {
                              ctx.fillStyle = "#ffffff";
                              ctx.strokeStyle = "#cbd5e1";
                              ctx.lineWidth = 2;
                              for(let i=0; i<3; i++) {
                                  const cx = 20 + i*40;
                                  // Hanger
                                  ctx.beginPath(); ctx.moveTo(cx+25, 0); ctx.lineTo(cx+25, -15); ctx.stroke();
                                  ctx.beginPath(); ctx.arc(cx+25, -20, 5, -Math.PI, 0); ctx.stroke();
                                  // Coat body
                                  ctx.beginPath();
                                  ctx.moveTo(cx, 15);
                                  ctx.lineTo(cx+50, 15);
                                  ctx.lineTo(cx+60, 200);
                                  ctx.lineTo(cx-10, 200);
                                  ctx.fill(); ctx.stroke();
                                  // Collar
                                  ctx.beginPath(); ctx.moveTo(cx+15, 15); ctx.lineTo(cx+25, 40); ctx.lineTo(cx+35, 15); ctx.stroke();
                              }
                          }
                          
                          ctx.restore();
                          
                          // Hover instruction if not dragging
                          if(!draggingItem || draggingItem.id !== item.id) {
                              ctx.fillStyle = "#1e293b";
                              ctx.font = "bold 13px sans-serif";
                              ctx.fillText(item.name, item.x + item.w/2, item.y + item.h + 20);
                          }
                      }
                  }
              }

              function drawPlayer(ctx) {
                  ctx.save();
                  ctx.translate(player.x, player.y);
                  
                  // Simple shadow
                  ctx.fillStyle = "rgba(0,0,0,0.2)";
                  ctx.beginPath();
                  ctx.ellipse(0, player.height/2 + 5, 30, 10, 0, 0, Math.PI*2);
                  ctx.fill();

                  // Body (Base scrubs)
                  ctx.fillStyle = player.equipped.coat ? "#ffffff" : "#3b82f6"; // Blue scrubs
                  ctx.beginPath();
                  ctx.roundRect(-player.width/2, -player.height/2, player.width, player.height, 10);
                  ctx.fill();
                  ctx.strokeStyle = "#1e293b";
                  ctx.lineWidth = 2;
                  ctx.stroke();

                  // Collar/Neck
                  ctx.fillStyle = "#ffedd5";
                  ctx.beginPath();
                  ctx.moveTo(-15, -player.height/2);
                  ctx.lineTo(15, -player.height/2);
                  ctx.lineTo(0, -player.height/2 + 20);
                  ctx.fill();

                  // Head
                  ctx.fillStyle = "#ffedd5";
                  ctx.beginPath();
                  ctx.arc(0, -player.height/2 - 35, 30, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.stroke();

                  // Face details
                  ctx.fillStyle = "#1e293b";
                  ctx.beginPath(); ctx.arc(-10, -player.height/2 - 40, 3, 0, Math.PI*2); ctx.fill(); // L eye
                  ctx.beginPath(); ctx.arc(10, -player.height/2 - 40, 3, 0, Math.PI*2); ctx.fill();  // R eye
                  ctx.beginPath(); ctx.arc(0, -player.height/2 - 25, 5, 0, Math.PI); ctx.stroke();   // Mouth

                  // Hair (if no headcover)
                  if (!player.equipped.headcover) {
                      ctx.fillStyle = "#1e293b"; // Black hair
                      ctx.beginPath();
                      ctx.arc(0, -player.height/2 - 45, 32, Math.PI, 0);
                      ctx.fill();
                      // ponytail
                      ctx.beginPath();
                      ctx.ellipse(-35, -player.height/2 - 35, 10, 20, Math.PI/4, 0, Math.PI*2);
                      ctx.fill();
                  }

                  // Headcover
                  if (player.equipped.headcover) {
                      ctx.fillStyle = "#f8fafc";
                      ctx.beginPath();
                      ctx.arc(0, -player.height/2 - 42, 33, Math.PI + 0.2, -0.2);
                      ctx.fill();
                      ctx.strokeStyle = "#cbd5e1";
                      ctx.stroke();
                  }

                  // Goggles
                  if (player.equipped.goggles) {
                      ctx.fillStyle = "rgba(14, 165, 233, 0.5)";
                      ctx.fillRect(-25, -player.height/2 - 50, 50, 15);
                      ctx.strokeRect(-25, -player.height/2 - 50, 50, 15);
                      // strap
                      ctx.beginPath();
                      ctx.moveTo(25, -player.height/2 - 42); ctx.lineTo(32, -player.height/2 - 45); ctx.stroke();
                      ctx.moveTo(-25, -player.height/2 - 42); ctx.lineTo(-32, -player.height/2 - 45); ctx.stroke();
                  }

                  // Gloves
                  if (player.equipped.gloves) {
                      ctx.fillStyle = "#6366f1";
                      ctx.beginPath(); ctx.roundRect(-player.width/2 - 15, -10, 15, 40, 5); ctx.fill(); ctx.stroke();
                      ctx.beginPath(); ctx.roundRect(player.width/2, -10, 15, 40, 5); ctx.fill(); ctx.stroke();
                  } else {
                      // Bare hands
                      ctx.fillStyle = "#ffedd5";
                      ctx.beginPath(); ctx.roundRect(-player.width/2 - 10, -10, 10, 30, 5); ctx.fill(); ctx.stroke();
                      ctx.beginPath(); ctx.roundRect(player.width/2, -10, 10, 30, 5); ctx.fill(); ctx.stroke();
                  }

                  // Shoes
                  if (player.equipped.shoes) {
                      ctx.fillStyle = "#3b82f6";
                      ctx.beginPath(); ctx.ellipse(-player.width/4, player.height/2 + 5, 20, 10, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
                      ctx.beginPath(); ctx.ellipse(player.width/4, player.height/2 + 5, 20, 10, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
                  } else {
                      // Normal shoes
                      ctx.fillStyle = "#1e293b";
                      ctx.beginPath(); ctx.ellipse(-player.width/4, player.height/2 + 5, 18, 8, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
                      ctx.beginPath(); ctx.ellipse(player.width/4, player.height/2 + 5, 18, 8, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
                  }

                  ctx.restore();
                  
                  // Draw Target Indicator
                  if (player.moving) {
                      ctx.beginPath();
                      ctx.arc(player.targetX, player.targetY + player.height/2, 10, 0, Math.PI * 2);
                      ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
                      ctx.lineWidth = 3;
                      ctx.stroke();
                  }
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
                  ctx.fillStyle = "#0f172a";
                  ctx.font = "bold 16px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText("Di chuyển: CLICK CHUỘT PHẢI", canvas.width / 2, 80);
                  ctx.fillStyle = "#0ea5e9";
                  ctx.fillText("Mặc đồ: KÉO THẢ TỪ KỆ VÀO NGƯỜI NHÂN VẬT", canvas.width / 2, 105);

                  stage1LoopId = requestAnimationFrame(draw);
              }

              stage1LoopId = requestAnimationFrame(draw);
            }
"""

content = re.sub(r'// --- Stage 1 Canvas Game \(60fps\) ---.*?// --- Start Application ---', new_game_code + '\n            // --- Start Application ---', content, flags=re.DOTALL)

# Update DOM Text
content = content.replace('"Click CHUỘT PHẢI để di chuyển nhân vật đến khu vực kệ và giá treo áo để trang bị: Áo, Kính, Găng tay, Giày kín, Mũ trùm đầu."', '"Click CHUỘT PHẢI để đi tới gần kệ. Sau đó KÉO THẢ các vật phẩm từ kệ vào người nhân vật để mặc."')

with open("public/safety_gate.html", "w") as f:
    f.write(content)
