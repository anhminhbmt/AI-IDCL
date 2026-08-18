const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

const stage4Code = `
            function startStage4CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");
              const w = window.innerWidth;
              const h = window.innerHeight;
              
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
                  cards.push({ uid: idCounter++, matchId: s.id, type: 'symbol', content: s.emoji, color: s.color, isFlipped: false, isMatched: false });
                  cards.push({ uid: idCounter++, matchId: s.id, type: 'text', content: s.text, color: s.color, isFlipped: false, isMatched: false });
              });
              
              cards.sort(() => Math.random() - 0.5);
              
              const cols = 4;
              const rows = 4;
              const cardW = 120;
              const cardH = 120;
              const gap = 15;
              const startX = w/2 - (cols * cardW + (cols-1)*gap)/2;
              const startY = h/2 - (rows * cardH + (rows-1)*gap)/2 + 40;
              
              cards.forEach((c, i) => {
                  c.x = startX + (i % cols) * (cardW + gap);
                  c.y = startY + Math.floor(i / cols) * (cardH + gap);
                  c.w = cardW;
                  c.h = cardH;
              });
              
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
                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText("Giải Mã GHS: Lật mở và ghép đúng cặp Biểu tượng - Ý nghĩa.", canvas.width / 2, 80);
                  ctx.shadowColor = "transparent";

                  cards.forEach(c => {
                      if (c.isMatched) {
                          ctx.fillStyle = "#1e293b";
                          ctx.fillRect(c.x, c.y, c.w, c.h);
                          ctx.strokeStyle = "#22c55e";
                          ctx.lineWidth = 3;
                          ctx.strokeRect(c.x, c.y, c.w, c.h);
                          ctx.fillStyle = "#22c55e";
                          ctx.textAlign = "center";
                          ctx.textBaseline = "middle";
                          ctx.font = "bold 24px Arial";
                          ctx.fillText("✔️", c.x + c.w/2, c.y + c.h/2);
                      } else if (c.isFlipped) {
                          ctx.fillStyle = "#f8fafc";
                          ctx.fillRect(c.x, c.y, c.w, c.h);
                          ctx.strokeStyle = c.color || "#38bdf8";
                          ctx.lineWidth = 4;
                          ctx.strokeRect(c.x, c.y, c.w, c.h);
                          
                          if (c.type === 'symbol') {
                              drawGHSDiamond(ctx, c.x + c.w/2, c.y + c.h/2, c.w * 0.8, c.content);
                          } else {
                              ctx.fillStyle = "#0f172a";
                              ctx.textAlign = "center";
                              ctx.textBaseline = "middle";
                              ctx.font = "bold 16px Arial";
                              ctx.fillText(c.content, c.x + c.w/2, c.y + c.h/2);
                          }
                      } else {
                          ctx.fillStyle = "#334155";
                          ctx.fillRect(c.x, c.y, c.w, c.h);
                          ctx.strokeStyle = "#475569";
                          ctx.lineWidth = 2;
                          ctx.strokeRect(c.x, c.y, c.w, c.h);
                          ctx.fillStyle = "#94a3b8";
                          ctx.textAlign = "center";
                          ctx.textBaseline = "middle";
                          ctx.font = "30px Arial";
                          ctx.fillText("?", c.x + c.w/2, c.y + c.h/2);
                      }
                  });
                  
                  if (waitTimer > 0) {
                      waitTimer--;
                      if (waitTimer === 0) {
                          if (firstFlipped.matchId === secondFlipped.matchId) {
                              firstFlipped.isMatched = true;
                              secondFlipped.isMatched = true;
                              matchedPairs++;
                              if (matchedPairs === 8) {
                                  setTimeout(() => {
                                      window.removeEventListener("mousedown", handleDown);
                                      cancelAnimationFrame(stage4LoopId);
                                      onComplete();
                                  }, 1000);
                              }
                          } else {
                              firstFlipped.isFlipped = false;
                              secondFlipped.isFlipped = false;
                              deductScore(5, "Ghép sai ký hiệu!");
                          }
                          firstFlipped = null;
                          secondFlipped = null;
                      }
                  }
                  
                  stage4LoopId = requestAnimationFrame(draw);
              }
              
              function handleDown(e) {
                  if (waitTimer > 0) return;
                  const mx = e.clientX;
                  const my = e.clientY;
                  
                  const clicked = cards.find(c => mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h);
                  if (clicked && !clicked.isMatched && !clicked.isFlipped) {
                      clicked.isFlipped = true;
                      if (!firstFlipped) {
                          firstFlipped = clicked;
                      } else {
                          secondFlipped = clicked;
                          waitTimer = 60;
                      }
                  }
              }
              
              window.addEventListener("mousedown", handleDown);
              stage4LoopId = requestAnimationFrame(draw);
            }
`;

content = content.replace('// --- Start Application ---', stage4Code + '\n            // --- Start Application ---');

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
