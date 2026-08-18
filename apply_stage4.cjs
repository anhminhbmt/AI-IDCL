const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// Update HUD
content = content.replace(/`MÀN \$\{currentStage\}\/3`/g, '`MÀN ${currentStage}/4`');
content = content.replace(/\(currentStage - 1\) \/ 3/g, '(currentStage - 1) / 4');

// Update nextStage
content = content.replace(/if \(currentStage > 3\)/g, 'if (currentStage > 4)');

// Insert loadStage block
const loadStage3End = `startStage3CanvasGame(() => {
                  showStageCompleteEffect(nextStage);
                });
              }`;
const loadStage4Add = `} else if (stage === 4) {
                Doms.questTitle.innerHTML = \`<i data-lucide="alert-triangle" class="w-5 h-5 inline"></i> Nhiệm vụ 4: Ký hiệu GHS\`;
                Doms.questDesc.textContent = "Chọn 2 thẻ tương ứng (Biểu tượng - Ý nghĩa) để ghép cặp.";
                startStage4CanvasGame(() => {
                  showStageCompleteEffect(nextStage);
                });
              }`;
content = content.replace(loadStage3End, loadStage3End + '\n              ' + loadStage4Add);

// Add startStage4CanvasGame
const appStartIdx = content.indexOf('// --- Start Application ---');

const stage4Code = `function startStage4CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");
              
              const symbols = [
                { id: "explosive", text: "Chất nổ", emoji: "💥", color: "#dc2626" },
                { id: "compressed", text: "Khí nén", emoji: "🗜️", color: "#2563eb" },
                { id: "corrosive", text: "Ăn mòn", emoji: "🧪", color: "#d97706" },
                { id: "toxic", text: "Độc tính", emoji: "💀", color: "#000000" },
                { id: "env", text: "Nguy hại MT", emoji: "🐟", color: "#16a34a" },
                { id: "flammable", text: "Dễ cháy", emoji: "🔥", color: "#dc2626" },
                { id: "oxidizing", text: "Oxy hóa", emoji: "⭕", color: "#ca8a04" },
                { id: "health", text: "Nguy hại SK", emoji: "🫁", color: "#9333ea" }
              ];
              
              const cards = [];
              let idCounter = 0;
              symbols.forEach(s => {
                  cards.push({ uid: idCounter++, matchId: s.id, type: 'symbol', content: s.emoji, color: s.color, isMatched: false });
                  cards.push({ uid: idCounter++, matchId: s.id, type: 'text', content: s.text, color: s.color, isMatched: false });
              });
              
              cards.sort(() => Math.random() - 0.5);
              
              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                  const cols = 4;
                  const rows = 4;
                  const cardW = 120;
                  const cardH = 120;
                  const gap = 15;
                  const startX = window.innerWidth/2 - (cols * cardW + (cols-1)*gap)/2;
                  const startY = window.innerHeight/2 - (rows * cardH + (rows-1)*gap)/2 + 40;
                  
                  cards.forEach((c, i) => {
                      c.x = startX + (i % cols) * (cardW + gap);
                      c.y = startY + Math.floor(i / cols) * (cardH + gap);
                      c.w = cardW;
                      c.h = cardH;
                  });
              }
              window.addEventListener('resize', resize);
              resize();
              
              let firstFlipped = null;
              let secondFlipped = null;
              let waitTimer = 0;
              let stage4LoopId;
              let matchedPairs = 0;
              
              function drawGHSDiamond(ctx, x, y, size, emoji) {
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.beginPath();
                  ctx.moveTo(0, -size/2);
                  ctx.lineTo(size/2, 0);
                  ctx.lineTo(0, size/2);
                  ctx.lineTo(-size/2, 0);
                  ctx.closePath();
                  ctx.fillStyle = "#fff";
                  ctx.fill();
                  ctx.strokeStyle = "#dc2626";
                  ctx.lineWidth = 4;
                  ctx.stroke();
                  ctx.fillStyle = "#000";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.font = (size/3) + "px Arial";
                  ctx.fillText(emoji, 0, 0);
                  ctx.restore();
              }
              
              function draw() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  // Draw 2.5D background
                  drawRoom(ctx, canvas.width, canvas.height);
                  drawPlayer(ctx);
                  
                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText("Giải Mã GHS: Chọn 2 thẻ tương ứng (Biểu tượng - Ý nghĩa) để ghép cặp.", canvas.width / 2, 80);
                  ctx.shadowColor = "transparent";

                  cards.forEach(c => {
                      if (c.isMatched) {
                          ctx.fillStyle = "#1e293b";
                          ctx.fillRect(c.x, c.y, c.w, c.h);
                          ctx.strokeStyle = "#22c55e";
                          ctx.lineWidth = 3;
                          ctx.strokeRect(c.x, c.y, c.w, c.h);
                          
                          // Draw content faded out
                          ctx.globalAlpha = 0.2;
                          if (c.type === 'symbol') {
                              drawGHSDiamond(ctx, c.x + c.w/2, c.y + c.h/2, c.w * 0.8, c.content);
                          } else {
                              ctx.fillStyle = "#0f172a";
                              ctx.textAlign = "center";
                              ctx.textBaseline = "middle";
                              ctx.font = "bold 16px Arial";
                              ctx.fillText(c.content, c.x + c.w/2, c.y + c.h/2);
                          }
                          ctx.globalAlpha = 1.0;
                          
                          // Checkmark
                          ctx.fillStyle = "#22c55e";
                          ctx.textAlign = "center";
                          ctx.textBaseline = "middle";
                          ctx.font = "bold 32px Arial";
                          ctx.fillText("✔️", c.x + c.w/2, c.y + c.h/2);
                      } else {
                          // All remaining cards are drawn face up
                          ctx.fillStyle = "#f8fafc";
                          ctx.fillRect(c.x, c.y, c.w, c.h);
                          
                          const isSelected = (c === firstFlipped || c === secondFlipped);
                          ctx.strokeStyle = isSelected ? "#fbbf24" : (c.color || "#38bdf8");
                          ctx.lineWidth = isSelected ? 6 : 4;
                          ctx.strokeRect(c.x, c.y, c.w, c.h);
                          
                          if (isSelected) {
                              ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 15;
                              ctx.strokeRect(c.x, c.y, c.w, c.h);
                              ctx.shadowColor = "transparent";
                          }
                          
                          if (c.type === 'symbol') {
                              drawGHSDiamond(ctx, c.x + c.w/2, c.y + c.h/2, c.w * 0.8, c.content);
                          } else {
                              ctx.fillStyle = "#0f172a";
                              ctx.textAlign = "center";
                              ctx.textBaseline = "middle";
                              ctx.font = "bold 16px Arial";
                              ctx.fillText(c.content, c.x + c.w/2, c.y + c.h/2);
                          }
                      }
                  });
                  
                  if (waitTimer > 0) {
                      waitTimer--;
                      if (waitTimer === 0) {
                          if (firstFlipped && secondFlipped) {
                              if (firstFlipped.matchId === secondFlipped.matchId) {
                                  firstFlipped.isMatched = true;
                                  secondFlipped.isMatched = true;
                                  matchedPairs++;
                                  if (matchedPairs === 8) {
                                      setTimeout(() => {
                                          window.removeEventListener("mousedown", handleDown);
                                          window.removeEventListener("resize", resize);
                                          cancelAnimationFrame(stage4LoopId);
                                          onComplete();
                                      }, 1000);
                                  }
                              } else {
                                  deductScore(5, "Ghép sai ký hiệu!");
                              }
                              firstFlipped = null;
                              secondFlipped = null;
                          }
                      }
                  }
                  
                  stage4LoopId = requestAnimationFrame(draw);
              }
              
              function handleDown(e) {
                  if (waitTimer > 0) return;
                  const mx = e.clientX;
                  const my = e.clientY;
                  
                  const clicked = cards.find(c => mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h);
                  if (clicked && !clicked.isMatched && clicked !== firstFlipped) {
                      playClick();
                      if (!firstFlipped) {
                          firstFlipped = clicked;
                      } else {
                          secondFlipped = clicked;
                          waitTimer = 30; // 0.5s to show selection before grading
                      }
                  }
              }
              
              window.addEventListener("mousedown", handleDown);
              stage4LoopId = requestAnimationFrame(draw);
            }
            
            `;

content = content.substring(0, appStartIdx) + stage4Code + content.substring(appStartIdx);

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
console.log('Applied stage 4 successfully.');
