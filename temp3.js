    
    function showStageCompleteEffect(callback) {
        const overlay = document.getElementById('screen-fx');
        overlay.innerHTML = `
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300" id="success-overlay">
                <div class="bg-white p-8 rounded-2xl shadow-2xl transform scale-50 opacity-0 transition-all duration-500 ease-out flex flex-col items-center" id="success-modal">
                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <i data-lucide="check-circle" class="w-12 h-12 text-green-500"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-800 mb-2">Nhiệm vụ hoàn thành!</h2>
                    <p class="text-slate-500 text-lg">Chuẩn bị chuyển sang bước tiếp theo...</p>
                </div>
            </div>
        `;
        lucide.createIcons();
        playSuccessDing(); // play sound immediately
        
        // Animate in
        requestAnimationFrame(() => {
            const modal = document.getElementById('success-modal');
            if(modal) {
                modal.classList.remove('scale-50', 'opacity-0');
                modal.classList.add('scale-100', 'opacity-100');
            }
        });

        // Wait 3 seconds, then callback
        setTimeout(() => {
            const overlayContainer = document.getElementById('success-overlay');
            if(overlayContainer) {
                overlayContainer.classList.add('opacity-0');
                setTimeout(() => {
                    overlay.innerHTML = '';
                    callback();
                }, 300);
            } else {
                callback();
            }
        }, 3000);
    }

            lucide.createIcons();

            // --- Audio System (Web Audio API Synthesizer) ---
            let audioCtx = null;
            function initAudio() {
                if (!audioCtx) {
                    try {
                        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    } catch(e) {}
                }
            }

            function playTone(freq, type, duration, vol = 0.1) {
              if (audioCtx.state === "suspended") audioCtx.resume();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = type;
              osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

              gain.gain.setValueAtTime(vol, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(
                0.01,
                audioCtx.currentTime + duration,
              );

              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + duration);
            }

            function playClick() { initAudio(); if(!audioCtx) return;
              playTone(600, "sine", 0.1, 0.1);
            }
            function playError() { initAudio(); if(!audioCtx) return;
              playTone(150, "sawtooth", 0.4, 0.2);
            }
            function playSuccessDing() { initAudio(); if(!audioCtx) return;
              playTone(523.25, "sine", 0.1, 0.1); // C5
              setTimeout(() => playTone(659.25, "sine", 0.2, 0.1), 100); // E5
              setTimeout(() => playTone(783.99, "sine", 0.4, 0.1), 200); // G5
            }
            function playExplosion() { initAudio(); if(!audioCtx) return;
              if (audioCtx.state === "suspended") audioCtx.resume();
              const bufferSize = audioCtx.sampleRate * 1;
              const buffer = audioCtx.createBuffer(
                1,
                bufferSize,
                audioCtx.sampleRate,
              );
              const data = buffer.getChannelData(0);
              for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

              const noise = audioCtx.createBufferSource();
              noise.buffer = buffer;
              const filter = audioCtx.createBiquadFilter();
              filter.type = "lowpass";
              filter.frequency.value = 1000;

              const gain = audioCtx.createGain();
              gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

              noise.connect(filter);
              filter.connect(gain);
              gain.connect(audioCtx.destination);
              noise.start();
            }

            let sirenOsc, sirenGain, sirenInterval;
            function startSiren() {
              if (sirenOsc) return;
              sirenOsc = audioCtx.createOscillator();
              sirenGain = audioCtx.createGain();
              sirenOsc.type = "square";
              sirenGain.gain.value = 0.05;
              sirenOsc.connect(sirenGain);
              sirenGain.connect(audioCtx.destination);
              sirenOsc.start();

              let high = true;
              sirenInterval = setInterval(() => {
                sirenOsc.frequency.setValueAtTime(
                  high ? 800 : 600,
                  audioCtx.currentTime,
                );
                high = !high;
              }, 400);
            }
            function stopSiren() {
              if (sirenOsc) {
                sirenOsc.stop();
                clearInterval(sirenInterval);
                sirenOsc = null;
              }
            }

            // --- State Management ---
            let currentStage = 1;
            let score = 100;
            let draggedItem = null;
            let stageState = {};

            const Doms = {
              stageText: document.getElementById("stage-text"),
              progressText: document.getElementById("progress-text"),
              progressBar: document.getElementById("progress-bar"),
              scoreText: document.getElementById("score-text"),
              questTitle: document.getElementById("quest-title"),
              questDesc: document.getElementById("quest-desc"),
              inventory: document.getElementById("inventory"),
              deskItems: document.getElementById("desk-items"),
              screenFx: document.getElementById("screen-fx"),
              character: document.getElementById("character"),
              charZone: document.getElementById("character-zone"),
            };

            function updateHUD() {
              Doms.stageText.textContent = `MÀN ${currentStage}/4`;
              const pct = Math.round(((currentStage - 1) / 4) * 100);
              Doms.progressText.textContent = `${pct}% HOÀN THÀNH`;
              Doms.progressBar.style.width = `${pct}%`;
              Doms.scoreText.textContent = score;
              if (score < 50)
                Doms.scoreText.className = "text-xl font-bold text-red-400";
              else if (score < 80)
                Doms.scoreText.className = "text-xl font-bold text-amber-400";
              else Doms.scoreText.className = "text-xl font-bold text-emerald-400";
            }

            
            function showToast(message, isError=true) {
                const toast = document.createElement('div');
                toast.style.cssText = 'position: fixed; top: 40px; left: 50%; transform: translateX(-50%) translateY(-20px); z-index: 99999; padding: 12px 24px; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); font-weight: bold; color: white; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; pointer-events: none; text-align: center; font-size: 16px; min-width: 300px;';
                toast.style.backgroundColor = isError ? '#ef4444' : '#10b981';
                toast.textContent = message;
                document.body.appendChild(toast);
                
                // Trigger reflow
                toast.offsetHeight;
                
                requestAnimationFrame(() => {
                    toast.style.opacity = '1';
                    toast.style.transform = 'translateX(-50%) translateY(0)';
                });
                
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(-50%) translateY(-20px)';
                    setTimeout(() => {
                        if (toast.parentNode) toast.parentNode.removeChild(toast);
                    }, 300);
                }, 4000);
            }

            function deductScore(pts, reason) {
              score = Math.max(0, score - pts);
              updateHUD();
              try { playError(); } catch(e) { console.error('Audio error:', e); }
              Doms.screenFx.className = "fixed inset-0 pointer-events-none z-[60] flash-red";
              setTimeout(() => {
                  Doms.screenFx.className = "fixed inset-0 pointer-events-none z-[60]";
              }, 500);
              showToast("CẢNH BÁO: " + reason + " (-" + pts + " điểm)", true);
            }


            function nextStage() {
              currentStage++;
              if (currentStage > 4) {
                completeGate();
              } else {
                updateHUD();
                loadStage(currentStage);
              }
            }

            // --- Drag and Drop Engine ---
            function initDraggable(el, data) {
              el.draggable = true;
              el.dataset.item = JSON.stringify(data);
              el.addEventListener("dragstart", (e) => {
                draggedItem = data;
                e.dataTransfer.setData("text/plain", JSON.stringify(data));
                e.currentTarget.style.opacity = "0.5";
                playClick();
              });
              el.addEventListener("dragend", (e) => {
                e.currentTarget.style.opacity = "1";
                draggedItem = null;
              });
            }

            function initDropzone(el, onDropCb) {
              el.addEventListener("dragover", (e) => {
                e.preventDefault();
                el.classList.add("drag-over");
              });
              el.addEventListener("dragleave", () => {
                el.classList.remove("drag-over");
              });
              el.addEventListener("drop", (e) => {
                e.preventDefault();
                el.classList.remove("drag-over");
                const dataStr = e.dataTransfer.getData("text/plain");
                if (dataStr) {
                  const data = JSON.parse(dataStr);
                  onDropCb(data, el);
                }
              });
            }

            // --- Stage Logics ---

            function clearStage() {
              Doms.inventory.innerHTML = "";
              Doms.deskItems.innerHTML = "";
              // Reset character pos
              Doms.charZone.style.left = "370px";
              Doms.charZone.style.top = "600px";
              stopSiren();
              document.body.classList.remove("shake-active");

              // Remove previous dropzone listeners if any (by cloning)
              const cZone = Doms.charZone.cloneNode(true);
              Doms.charZone.parentNode.replaceChild(cZone, Doms.charZone);
              Doms.charZone = cZone;
            }

            
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
                  showStageCompleteEffect(nextStage);
                });
              } else if (stage === 2) {
                Doms.questTitle.innerHTML = `<i data-lucide="flask-conical" class="w-5 h-5 inline"></i> Nhiệm vụ 2: Pha chế Axit`;
                Doms.questDesc.textContent = "Kéo bình Axit rót vào cốc Nước. (Quy tắc: Luôn rót Axit vào Nước, KHÔNG LÀM NGƯỢC LẠI!)";
                startStage2CanvasGame(() => {
                  showStageCompleteEffect(nextStage);
                });
              } else if (stage === 3) {
                Doms.questTitle.innerHTML = `<i data-lucide="trash-2" class="w-5 h-5 inline"></i> Nhiệm vụ 3: Phân Loại Rác`;
                Doms.questDesc.textContent = "Kéo rác thả vào đúng thùng: Đỏ (Sắc nhọn), Cam (Hóa chất), Xanh (Rác sinh hoạt).";
                startStage3CanvasGame(() => {
                  showStageCompleteEffect(nextStage);
                });
              } else if (stage === 4) {
                Doms.questTitle.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5 inline"></i> Nhiệm vụ 4: Ký hiệu GHS`;
                Doms.questDesc.textContent = "Lật mở và ghép đúng 8 cặp Biểu tượng - Ý nghĩa cảnh báo hóa chất GHS.";
                startStage4CanvasGame(() => {
                  showStageCompleteEffect(nextStage);
                });
              }
            }

            function completeGate() {
              Doms.stageText.textContent = `HOÀN THÀNH!`;
              Doms.progressText.textContent = `100%`;
              Doms.progressBar.style.width = `100%`;
              document.getElementById("status-badge").className =
                "bg-emerald-900/50 text-emerald-400 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5";
              document.getElementById("status-badge").innerHTML =
                '<i data-lucide="check-circle" class="w-4 h-4"></i><span>ĐÃ CẤP PHÉP</span>';
              lucide.createIcons();
              confetti({ particleCount: 150, spread: 180, origin: { y: 0.3 } });
              playSuccessDing();
              setTimeout(playSuccessDing, 400);

              // Skip cert modal, enter lab directly
              setTimeout(() => {
                localStorage.setItem("lab_safety_passed", "true");
                localStorage.setItem("just_passed_safety", "true");
                document.body.style.opacity = "0";
                document.body.style.transition = "opacity 1s";
                setTimeout(() => {
                  window.location.href = "/";
                }, 1000);
              }, 2000);
            }

            function generateCertificate(name, score) {
              const canvas = document.getElementById("cert-canvas");
              const ctx = canvas.getContext("2d");

              // Background
              ctx.fillStyle = "#f8fafc";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Border
              ctx.strokeStyle = "#0f766e";
              ctx.lineWidth = 10;
              ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
              ctx.strokeStyle = "#14b8a6";
              ctx.lineWidth = 2;
              ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

              // Header
              ctx.fillStyle = "#0f172a";
              ctx.font = 'bold 36px "Segoe UI", sans-serif';
              ctx.textAlign = "center";
              ctx.fillText(
                "CHỨNG NHẬN AN TOÀN PHÒNG THÍ NGHIỆM",
                canvas.width / 2,
                100,
              );

              ctx.font = '20px "Segoe UI", sans-serif';
              ctx.fillStyle = "#64748b";
              ctx.fillText(
                "Cấp cho học viên đã hoàn thành xuất sắc Khóa Huấn Luyện 2.5D",
                canvas.width / 2,
                140,
              );

              // Name
              ctx.font = 'bold 48px "Segoe UI", serif';
              ctx.fillStyle = "#0f766e";
              ctx.fillText(name.toUpperCase(), canvas.width / 2, 240);

              // Line
              ctx.beginPath();
              ctx.moveTo(200, 260);
              ctx.lineTo(600, 260);
              ctx.strokeStyle = "#cbd5e1";
              ctx.lineWidth = 1;
              ctx.stroke();

              // Details
              ctx.font = '22px "Segoe UI", sans-serif';
              ctx.fillStyle = "#334155";
              ctx.fillText(`Điểm số đánh giá: ${score}/100`, canvas.width / 2, 320);
              ctx.fillText(
                `Ngày cấp: ${new Date().toLocaleDateString("vi-VN")}`,
                canvas.width / 2,
                360,
              );

              // Stamp
              ctx.save();
              ctx.translate(650, 420);
              ctx.rotate((-15 * Math.PI) / 180);
              ctx.strokeStyle = "#dc2626";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(0, 0, 50, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(0, 0, 44, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = "#dc2626";
              ctx.font = "bold 16px sans-serif";
              ctx.fillText("CERTIFIED", 0, -5);
              ctx.fillText("SAFE", 0, 15);
              ctx.restore();

              // Signatures
              ctx.font = "italic 20px serif";
              ctx.fillStyle = "#0f172a";
              ctx.fillText("Dr. AI Chemist", 200, 450);
              ctx.font = "14px sans-serif";
              ctx.fillText("Trưởng Phòng Quản Lý", 200, 470);

              // Download handler
              document.getElementById("btn-download-cert").onclick = () => {
                const link = document.createElement("a");
                link.download = `Chung_Nhan_An_Toan_${name.replace(/\s+/g, "_")}.png`;
                link.href = canvas.toDataURL();
                link.click();
              };
            }


            
            
            
            // --- Global Canvas State & Helpers ---
            // Polyfill for roundRect for older browsers
            if (!CanvasRenderingContext2D.prototype.roundRect) {
                CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
                    if (w < 2 * r) r = w / 2;
                    if (h < 2 * r) r = h / 2;
                    this.moveTo(x + r, y);
                    this.arcTo(x + w, y, x + w, y + h, r);
                    this.arcTo(x + w, y + h, x, y + h, r);
                    this.arcTo(x, y + h, x, y, r);
                    this.arcTo(x, y, x + w, y, r);
                    this.closePath(); // Ensure polyfill has closePath
                    return this;
                };
            }

            const player = {
                x: window.innerWidth / 2, y: window.innerHeight - 100,
                targetX: window.innerWidth / 2, targetY: window.innerHeight - 100,
                speed: 6,
                width: 120, height: 300,
                moving: false,
                animTime: 0, direction: 1,
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

            
            // --- Stage 1: Put on PPE ---
            let stage1LoopId;
            let draggingItem = null;
              function drawRoom(ctx, w, h) {
              // Hậu cảnh phòng thay đồ PPE siêu thực tế
              
              // 1. Tường và sàn nhà (phòng lab trắng sáng)
              const wallG = ctx.createLinearGradient(0, 0, 0, h - 250);
              wallG.addColorStop(0, "#ffffff");
              wallG.addColorStop(1, "#f1f5f9");
              ctx.fillStyle = wallG;
              ctx.fillRect(0, 0, w, h - 250);

              // Các đường nối panel tường (phòng sạch)
              ctx.strokeStyle = "#e2e8f0";
              ctx.lineWidth = 2;
              for(let i=100; i<w; i+=300) {
                  ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h-250); ctx.stroke();
              }

              // Sàn nhà Epoxy bóng
              const floorG = ctx.createLinearGradient(0, h - 250, 0, h);
              floorG.addColorStop(0, "#d1d5db");
              floorG.addColorStop(1, "#9ca3af");
              ctx.fillStyle = floorG;
              ctx.fillRect(0, h - 250, w, 250);
              
              // Lưới gạch sàn mờ
              ctx.strokeStyle = "rgba(255,255,255,0.1)";
              ctx.lineWidth = 1;
              for(let i=0; i<w; i+=100) {
                  ctx.beginPath(); ctx.moveTo(i, h-250); ctx.lineTo(i - 100, h); ctx.stroke();
              }
              for(let j=h-250; j<h; j+=40) {
                  ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
              }

              // 2. Bàn Inox (Stainless Steel Table) trung tâm - SHIFTED LEFT
              const tableW = 800;
              const tableH = 40;
              const tableX = w / 2 - 500;
              const tableY = h - 250;

              ctx.shadowColor = "rgba(0,0,0,0.5)";
              ctx.shadowBlur = 30;
              ctx.shadowOffsetY = 20;

              // Mặt bàn Inox
              const tblG = ctx.createLinearGradient(tableX, tableY, tableX, tableY + tableH);
              tblG.addColorStop(0, "#f8fafc");
              tblG.addColorStop(0.5, "#cbd5e1");
              tblG.addColorStop(1, "#94a3b8");
              ctx.fillStyle = tblG;
              ctx.fillRect(tableX, tableY, tableW, tableH);
              
              ctx.shadowColor = "transparent";
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2;
              ctx.strokeRect(tableX, tableY, tableW, tableH);

              // Chân bàn Inox
              const legG = ctx.createLinearGradient(tableX, 0, tableX + 20, 0);
              legG.addColorStop(0, "#94a3b8"); legG.addColorStop(0.5, "#f1f5f9"); legG.addColorStop(1, "#64748b");
              ctx.fillStyle = legG;
              ctx.fillRect(tableX + 20, tableY + tableH, 20, 210);
              ctx.fillRect(tableX + tableW - 40, tableY + tableH, 20, 210);
              // Thanh ngang chân bàn
              ctx.fillRect(tableX + 20, tableY + tableH + 150, tableW - 40, 15);

              // 3. Tủ kệ Inox trên bàn (Shelving unit)
              const shelfW = tableW;
              const shelfH = 250;
              const shelfX = tableX;
              const shelfY = tableY - shelfH;

              // Khung kệ
              ctx.fillStyle = "#e2e8f0";
              ctx.fillRect(shelfX, shelfY, shelfW, shelfH);
              // Đổ bóng góc kệ
              const innerShadow = ctx.createLinearGradient(shelfX, shelfY, shelfX, shelfY+20);
              innerShadow.addColorStop(0, "rgba(0,0,0,0.2)"); innerShadow.addColorStop(1, "transparent");
              ctx.fillStyle = innerShadow;
              ctx.fillRect(shelfX, shelfY, shelfW, shelfH);

              ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 6;
              ctx.strokeRect(shelfX, shelfY, shelfW, shelfH);

              // Ngăn kệ (3 cột, 2 hàng)
              ctx.lineWidth = 4;
              ctx.beginPath(); ctx.moveTo(shelfX, shelfY + shelfH/2); ctx.lineTo(shelfX + shelfW, shelfY + shelfH/2); ctx.stroke(); // Ngang
              ctx.beginPath(); ctx.moveTo(shelfX + shelfW/3, shelfY); ctx.lineTo(shelfX + shelfW/3, shelfY + shelfH); ctx.stroke(); // Dọc 1
              ctx.beginPath(); ctx.moveTo(shelfX + shelfW*2/3, shelfY); ctx.lineTo(shelfX + shelfW*2/3, shelfY + shelfH); ctx.stroke(); // Dọc 2

              // Text nhãn dán trên kệ
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(shelfX + shelfW/6 - 40, shelfY - 20, 80, 20);
              ctx.fillRect(shelfX + shelfW/2 - 40, shelfY - 20, 80, 20);
              ctx.fillRect(shelfX + shelfW*5/6 - 60, shelfY - 20, 120, 20);
              
              ctx.fillRect(shelfX + shelfW/6 - 45, shelfY + shelfH/2 - 20, 90, 20);
              ctx.fillRect(shelfX + shelfW/2 - 45, shelfY + shelfH/2 - 20, 90, 20);

              ctx.fillStyle = "#0f172a"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
              ctx.fillText("MŨ TRÙM ĐẦU", shelfX + shelfW/6, shelfY - 6);
              ctx.fillText("KÍNH BẢO HỘ", shelfX + shelfW/2, shelfY - 6);
              ctx.fillText("GĂNG TAY NITRILE", shelfX + shelfW*5/6, shelfY - 6);
              ctx.fillText("KHẨU TRANG Y TẾ", shelfX + shelfW/6, shelfY + shelfH/2 - 6);
              ctx.fillText("GIÀY BẢO HỘ", shelfX + shelfW/2, shelfY + shelfH/2 - 6);

              // 4. Giá treo áo khoác Inox (bên phải)
              const rackX = tableX + tableW + 50;
              const rackY = h - 500;
              const rackW = 200;
              ctx.fillStyle = legG;
              ctx.fillRect(rackX, rackY, 15, 300); // Trụ trái
              ctx.fillRect(rackX + rackW, rackY, 15, 300); // Trụ phải
              ctx.fillRect(rackX, rackY + 20, rackW + 15, 15); // Thanh treo trên
              ctx.fillRect(rackX, rackY + 280, rackW + 15, 15); // Thanh ngang dưới chân

              // Bánh xe giá treo
              ctx.fillStyle = "#1e293b";
              ctx.beginPath(); ctx.arc(rackX + 7, rackY + 310, 10, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(rackX + rackW + 7, rackY + 310, 10, 0, Math.PI*2); ctx.fill();

              // Bảng nội quy an toàn trên tường
              ctx.fillStyle = "#0284c7";
              ctx.fillRect(rackX, rackY - 100, 200, 80);
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(rackX + 2, rackY - 98, 196, 76);
              ctx.fillStyle = "#0284c7";
              ctx.fillRect(rackX, rackY - 100, 200, 25);
              ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
              ctx.fillText("BẢNG NỘI QUY PPE", rackX + 100, rackY - 84);
              // Vẽ vài icon nhỏ trên bảng
              ctx.fillStyle = "#0ea5e9";
              ctx.beginPath(); ctx.arc(rackX + 40, rackY - 50, 15, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(rackX + 100, rackY - 50, 15, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(rackX + 160, rackY - 50, 15, 0, Math.PI*2); ctx.fill();
            }



            function drawPlayer(ctx) {
    const isMoving = player.moving;
    const t = isMoving ? player.animTime : 0;
    
    // Determine facing direction (1 for right, -1 for left)
    if (player.direction == null) player.direction = 1;
    if (isMoving) {
        let dx = player.targetX - player.x;
        if (Math.abs(dx) > 2) player.direction = dx > 0 ? 1 : -1;
    }
    
    // Smooth turning for scale (flips horizontally)
    if (player.turn == null) player.turn = player.direction;
    player.turn += (player.direction - player.turn) * 0.2;
    
    const bounce = isMoving ? Math.abs(Math.sin(t % (Math.PI * 2) * 2)) * 3 : 0;
    
    ctx.save();
    // Move to player position
    ctx.translate(player.x, player.y - bounce);
    
    // SCALE CHARACTER LARGER
    ctx.scale(1.5, 1.5);
    
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.ellipse(0, 5 + bounce/1.5, 27 - bounce/2, 7, 0, 0, Math.PI*2); ctx.fill();
    
    // Base colors
    const skin = "#fcd4b6";
    const suitColor = "#1e293b"; // Dark blue/slate suit
    const tieColor = "#dc2626"; // Red tie
    const shoeColor = "#0f172a";
    
    function drawLimb(ctx, startX, startY, len1, len2, angle1, angle2, width1, width2, color) {
        const jx = startX + Math.sin(angle1) * len1;
        const jy = startY + Math.cos(angle1) * len1;
        const ex = jx + Math.sin(angle2) * len2;
        const ey = jy + Math.cos(angle2) * len2;
        
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        ctx.beginPath();
        ctx.lineWidth = width1;
        ctx.moveTo(startX, startY);
        ctx.lineTo(jx, jy);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.lineWidth = width2;
        ctx.moveTo(jx, jy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        
        return { jx, jy, ex, ey };
    }

    const hipY = -90;
    const shoulderY = -145;

    if (!isMoving) {
        // --- FRONT VIEW (Realistic & Detailed) ---

        // Gradients
        const skinGrad = ctx.createRadialGradient(0, shoulderY - 25, 2, 0, shoulderY - 25, 15);
        skinGrad.addColorStop(0, "#fed7aa");
        skinGrad.addColorStop(1, "#fdba74");

        const pantGrad = ctx.createLinearGradient(-16, 0, 16, 0);
        pantGrad.addColorStop(0, "#0f172a"); // Darker edges
        pantGrad.addColorStop(0.5, "#334155"); // Lighter center
        pantGrad.addColorStop(1, "#0f172a");

        const shirtGrad = ctx.createLinearGradient(0, shoulderY, 0, hipY);
        shirtGrad.addColorStop(0, "#ffffff");
        shirtGrad.addColorStop(1, "#e2e8f0");

        // 1. LEGS
        ctx.fillStyle = pantGrad;
        // Left Leg
        ctx.beginPath();
        ctx.moveTo(-15, hipY); ctx.lineTo(-3, hipY); ctx.lineTo(-6, -10); ctx.lineTo(-17, -10); ctx.fill();
        // Right Leg
        ctx.beginPath();
        ctx.moveTo(3, hipY); ctx.lineTo(15, hipY); ctx.lineTo(17, -10); ctx.lineTo(6, -10); ctx.fill();

        // 2. SHOES
        const shoeGrad = ctx.createLinearGradient(-15, -10, -15, 5);
        shoeGrad.addColorStop(0, player.equipped.shoes ? "#334155" : "#1e293b");
        shoeGrad.addColorStop(1, player.equipped.shoes ? "#020617" : "#020617");

        ctx.fillStyle = shoeGrad;
        // Left shoe
        ctx.beginPath(); ctx.ellipse(-12, -4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        // Right shoe
        ctx.beginPath(); ctx.ellipse(12, -4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();

        if (player.equipped.shoes) {
             // Steel toe cap highlight
             ctx.fillStyle = "rgba(255,255,255,0.3)";
             ctx.beginPath(); ctx.ellipse(-15, -5, 3, 4, 0, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.ellipse(9, -5, 3, 4, 0, 0, Math.PI*2); ctx.fill();
        }

        // 3. ARMS (Under coat)
        const armGrad = ctx.createLinearGradient(-26, 0, -14, 0);
        armGrad.addColorStop(0, "#0f172a"); armGrad.addColorStop(0.5, "#334155"); armGrad.addColorStop(1, "#020617");

        const rArmGrad = ctx.createLinearGradient(14, 0, 26, 0);
        rArmGrad.addColorStop(0, "#020617"); rArmGrad.addColorStop(0.5, "#334155"); rArmGrad.addColorStop(1, "#0f172a");

        // Coat sleeve gradients
        const cArmGrad = ctx.createLinearGradient(-26, 0, -14, 0);
        cArmGrad.addColorStop(0, "#94a3b8"); cArmGrad.addColorStop(0.5, "#f8fafc"); cArmGrad.addColorStop(1, "#64748b");
        
        const crArmGrad = ctx.createLinearGradient(14, 0, 26, 0);
        crArmGrad.addColorStop(0, "#64748b"); crArmGrad.addColorStop(0.5, "#f8fafc"); crArmGrad.addColorStop(1, "#94a3b8");

        const lArmColor = player.equipped.coat ? cArmGrad : armGrad;
        const rArmColor = player.equipped.coat ? crArmGrad : rArmGrad;

        // Draw Left Arm
        ctx.fillStyle = lArmColor;
        ctx.beginPath();
        ctx.moveTo(-16, shoulderY + 5);
        ctx.quadraticCurveTo(-27, shoulderY + 15, -24, hipY + 5);
        ctx.lineTo(-14, hipY + 5);
        ctx.quadraticCurveTo(-16, shoulderY + 20, -12, shoulderY + 10);
        ctx.fill();

        // Draw Right Arm
        ctx.fillStyle = rArmColor;
        ctx.beginPath();
        ctx.moveTo(16, shoulderY + 5);
        ctx.quadraticCurveTo(27, shoulderY + 15, 24, hipY + 5);
        ctx.lineTo(14, hipY + 5);
        ctx.quadraticCurveTo(16, shoulderY + 20, 12, shoulderY + 10);
        ctx.fill();

        // 4. HANDS / GLOVES
        const gloveGrad = ctx.createRadialGradient(-20, hipY + 10, 1, -20, hipY + 10, 8);
        gloveGrad.addColorStop(0, "#bfdbfe"); gloveGrad.addColorStop(1, "#2563eb");

        ctx.fillStyle = player.equipped.gloves ? gloveGrad : skinGrad;
        ctx.beginPath(); ctx.ellipse(-20, hipY + 10, 5, 7, 0, 0, Math.PI*2); ctx.fill();

        const rGloveGrad = ctx.createRadialGradient(20, hipY + 10, 1, 20, hipY + 10, 8);
        rGloveGrad.addColorStop(0, "#bfdbfe"); rGloveGrad.addColorStop(1, "#2563eb");
        ctx.fillStyle = player.equipped.gloves ? rGloveGrad : skinGrad;
        ctx.beginPath(); ctx.ellipse(20, hipY + 10, 5, 7, 0, 0, Math.PI*2); ctx.fill();

        // 5. TORSO (Inner Suit/Shirt)
        ctx.fillStyle = shirtGrad;
        ctx.beginPath();
        ctx.moveTo(-13, shoulderY); ctx.lineTo(13, shoulderY);
        ctx.lineTo(11, hipY); ctx.lineTo(-11, hipY); ctx.fill();

        // Tie
        const tieGrad = ctx.createLinearGradient(0, shoulderY, 0, hipY - 20);
        tieGrad.addColorStop(0, "#ef4444"); tieGrad.addColorStop(1, "#7f1d1d");
        ctx.fillStyle = tieGrad;
        ctx.beginPath();
        ctx.moveTo(-3, shoulderY + 5); ctx.lineTo(3, shoulderY + 5);
        ctx.lineTo(4, hipY - 15); ctx.lineTo(0, hipY - 10); ctx.lineTo(-4, hipY - 15); ctx.fill();

        // Suit Jacket (if no coat)
        if (!player.equipped.coat) {
            ctx.fillStyle = pantGrad;
            // Left jacket panel
            ctx.beginPath(); ctx.moveTo(-15, shoulderY); ctx.lineTo(-4, shoulderY + 20); ctx.lineTo(-2, hipY); ctx.lineTo(-13, hipY); ctx.fill();
            // Right jacket panel
            ctx.beginPath(); ctx.moveTo(15, shoulderY); ctx.lineTo(4, shoulderY + 20); ctx.lineTo(2, hipY); ctx.lineTo(13, hipY); ctx.fill();
        }

        // 6. LAB COAT (Outer layer with volume and folds)
        if (player.equipped.coat) {
            const coatLeft = ctx.createLinearGradient(-22, shoulderY, 0, shoulderY);
            coatLeft.addColorStop(0, "#94a3b8"); coatLeft.addColorStop(0.4, "#ffffff"); coatLeft.addColorStop(1, "#e2e8f0");

            const coatRight = ctx.createLinearGradient(0, shoulderY, 22, shoulderY);
            coatRight.addColorStop(0, "#e2e8f0"); coatRight.addColorStop(0.6, "#ffffff"); coatRight.addColorStop(1, "#94a3b8");

            // Shadow cast by coat onto the legs
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath(); ctx.ellipse(0, hipY + 5, 16, 4, 0, 0, Math.PI*2); ctx.fill();

            // Left panel
            ctx.fillStyle = coatLeft;
            ctx.beginPath();
            ctx.moveTo(-14, shoulderY);
            ctx.lineTo(-4, shoulderY + 25); // Lapel start
            ctx.lineTo(0, hipY + 55); // Bottom inner edge
            ctx.lineTo(-16, hipY + 50); // Bottom outer edge
            ctx.lineTo(-14, shoulderY); 
            ctx.fill();

            // Right panel
            ctx.fillStyle = coatRight;
            ctx.beginPath();
            ctx.moveTo(14, shoulderY);
            ctx.lineTo(4, shoulderY + 25); 
            ctx.lineTo(0, hipY + 55); 
            ctx.lineTo(16, hipY + 50); 
            ctx.lineTo(14, shoulderY); 
            ctx.fill();

            // Coat Lapels (folded collars)
            ctx.fillStyle = "#f8fafc";
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1;
            
            // Left Lapel
            ctx.beginPath(); 
            ctx.moveTo(-10, shoulderY); ctx.lineTo(-2, shoulderY + 28); ctx.lineTo(-13, shoulderY + 18); 
            ctx.closePath(); ctx.fill(); ctx.stroke();
            
            // Right Lapel
            ctx.beginPath(); 
            ctx.moveTo(10, shoulderY); ctx.lineTo(2, shoulderY + 28); ctx.lineTo(13, shoulderY + 18); 
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Pockets
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-20, hipY - 5, 8, 12);
            ctx.strokeRect(12, hipY - 5, 8, 12);
            
            // Buttons
            ctx.fillStyle = "#94a3b8";
            ctx.beginPath(); ctx.arc(-2, shoulderY + 40, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-2, shoulderY + 55, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-2, shoulderY + 70, 2, 0, Math.PI*2); ctx.fill();
            
            // Subtle fabric folds
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.beginPath(); ctx.moveTo(-16, hipY); ctx.lineTo(-8, hipY + 35); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, hipY); ctx.lineTo(8, hipY + 35); ctx.stroke();
        }

        // 7. NECK & HEAD
        // Shadow under chin
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(-4, shoulderY - 12, 8, 12);
        
        ctx.fillStyle = skinGrad;
        ctx.fillRect(-3, shoulderY - 12, 6, 12);

        // Head Base
        ctx.fillStyle = skinGrad;
        ctx.beginPath(); ctx.ellipse(0, shoulderY - 28, 13, 17, 0, 0, Math.PI*2); ctx.fill();

        // 8. HAIR
        if (!player.equipped.headcover) {
            const hairGrad = ctx.createLinearGradient(0, shoulderY-45, 0, shoulderY-25);
            hairGrad.addColorStop(0, "#020617"); hairGrad.addColorStop(1, "#334155");
            ctx.fillStyle = hairGrad;
            
            ctx.beginPath();
            // Outer dome (top of head)
            ctx.arc(0, shoulderY - 30, 14, Math.PI, 0);
            // Right sideburn outer
            ctx.quadraticCurveTo(15, shoulderY - 20, 14, shoulderY - 15);
            // Right sideburn inner
            ctx.lineTo(12, shoulderY - 28);
            // Forehead hairline (above eyebrows which are at -33)
            ctx.quadraticCurveTo(0, shoulderY - 38, -12, shoulderY - 28);
            // Left sideburn inner
            ctx.lineTo(-14, shoulderY - 15);
            // Left sideburn outer
            ctx.quadraticCurveTo(-15, shoulderY - 20, -14, shoulderY - 30);
            ctx.fill();
            
            // Hair highlight
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, shoulderY - 31, 10, Math.PI*1.2, Math.PI*1.8); ctx.stroke();
        }

        // 9. PROTECTIVE GEAR (HEAD)
        if (player.equipped.headcover) {
            const capGrad = ctx.createRadialGradient(0, shoulderY-40, 2, 0, shoulderY-40, 20);
            capGrad.addColorStop(0, "#bae6fd"); capGrad.addColorStop(1, "#0284c7");
            ctx.fillStyle = capGrad; 
            ctx.beginPath(); ctx.ellipse(0, shoulderY - 38, 16, 13, 0, 0, Math.PI*2); ctx.fill();
            
            // Elastic band wrinkles
            ctx.strokeStyle = "rgba(2, 132, 199, 0.5)";
            ctx.lineWidth = 1;
            for(let i=-12; i<=12; i+=4) {
                ctx.beginPath(); ctx.moveTo(i, shoulderY - 26); ctx.lineTo(i + 2, shoulderY - 32); ctx.stroke();
            }
        }

        if (player.equipped.goggles) {
            const goggleGrad = ctx.createLinearGradient(-12, shoulderY - 32, 12, shoulderY - 20);
            goggleGrad.addColorStop(0, "rgba(186, 230, 253, 0.7)");
            goggleGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)"); // Sharp glare
            goggleGrad.addColorStop(1, "rgba(14, 165, 233, 0.7)");
            
            ctx.fillStyle = goggleGrad; 
            ctx.strokeStyle = "#0284c7"; 
            ctx.lineWidth = 2;
            
            // Left lens
            ctx.beginPath(); ctx.roundRect(-13, shoulderY - 34, 12, 11, 4); ctx.fill(); ctx.stroke();
            // Right lens
            ctx.beginPath(); ctx.roundRect(1, shoulderY - 34, 12, 11, 4); ctx.fill(); ctx.stroke();
            // Bridge
            ctx.beginPath(); ctx.moveTo(-1, shoulderY - 29); ctx.lineTo(1, shoulderY - 29); ctx.stroke();
            // Strap
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#334155";
            ctx.beginPath(); ctx.moveTo(-13, shoulderY - 29); ctx.lineTo(-15, shoulderY - 29); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(13, shoulderY - 29); ctx.lineTo(15, shoulderY - 29); ctx.stroke();
        } else {
            // Eyes
            ctx.fillStyle = "#0f172a"; 
            ctx.beginPath(); ctx.ellipse(-5, shoulderY - 29, 2, 2.5, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(5, shoulderY - 29, 2, 2.5, 0, 0, Math.PI*2); ctx.fill();
            // Eyebrows
            ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-8, shoulderY - 33); ctx.lineTo(-3, shoulderY - 32); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8, shoulderY - 33); ctx.lineTo(3, shoulderY - 32); ctx.stroke();
        }

        if (player.equipped.mask) {
            const maskGrad = ctx.createLinearGradient(0, shoulderY - 18, 0, shoulderY - 8);
            maskGrad.addColorStop(0, "#ffffff"); maskGrad.addColorStop(1, "#cbd5e1");
            ctx.fillStyle = maskGrad; 
            ctx.strokeStyle = "#94a3b8"; 
            ctx.lineWidth = 1;
            
            // Mask Body
            ctx.beginPath(); 
            ctx.moveTo(-8, shoulderY - 18); ctx.lineTo(8, shoulderY - 18); 
            ctx.lineTo(6, shoulderY - 6); ctx.lineTo(-6, shoulderY - 6); 
            ctx.closePath(); ctx.fill(); ctx.stroke();
            
            // Mask folds
            ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
            ctx.beginPath(); ctx.moveTo(-7, shoulderY - 14); ctx.lineTo(7, shoulderY - 14); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-6, shoulderY - 10); ctx.lineTo(6, shoulderY - 10); ctx.stroke();

            // Straps
            ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-8, shoulderY - 17); ctx.lineTo(-14, shoulderY - 22); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8, shoulderY - 17); ctx.lineTo(14, shoulderY - 22); ctx.stroke();
        } else {
            // Nose and Mouth
            ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(0, shoulderY - 24); ctx.lineTo(0, shoulderY - 19); ctx.stroke();
            ctx.strokeStyle = "#991b1b"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-3, shoulderY - 14); ctx.quadraticCurveTo(0, shoulderY - 12, 3, shoulderY - 14); ctx.stroke();
        }
    } else {
        // --- SIDE VIEW (Moving) ---
        // Apply horizontal flip for direction
        const scaleX = Math.abs(player.turn) < 0.1 ? 0.1 * Math.sign(player.turn || 1) : player.turn;
        ctx.scale(scaleX, 1);
        
        const cycle = t % (Math.PI * 2);
        const swing1 = Math.sin(cycle);          // Right leg, left arm
        const swing2 = Math.sin(cycle + Math.PI); // Left leg, right arm
        
        const lLegA1 = swing2 * 0.5;
        const lLegBend = Math.max(0, Math.sin(cycle + Math.PI + 0.5)) * 1.0;
        const lLegA2 = lLegA1 - lLegBend;
        
        const rLegA1 = swing1 * 0.5;
        const rLegBend = Math.max(0, Math.sin(cycle + 0.5)) * 1.0;
        const rLegA2 = rLegA1 - rLegBend;
        
        const lArmA1 = swing1 * 0.4;
        const lArmBend = Math.max(0, Math.sin(cycle + Math.PI)) * 0.5;
        const lArmA2 = lArmA1 + 0.2 + lArmBend;
        
        const rArmA1 = swing2 * 0.4;
        const rArmBend = Math.max(0, Math.sin(cycle)) * 0.5;
        const rArmA2 = rArmA1 + 0.2 + rArmBend;

        // Left leg
        const lFoot = drawLimb(ctx, 0, hipY, 40, 45, lLegA1, lLegA2, 16, 12, suitColor);
        ctx.fillStyle = player.equipped.shoes ? "#1e293b" : shoeColor; 
        ctx.beginPath(); ctx.ellipse(lFoot.ex + 5, lFoot.ey, 12, 6, 0, 0, Math.PI*2); ctx.fill();

        // Left Arm
        const lArmColor = player.equipped.coat ? "#f8fafc" : suitColor;
        const lHand = drawLimb(ctx, 0, shoulderY, 35, 35, lArmA1, lArmA2, 12, 10, lArmColor);
        ctx.fillStyle = player.equipped.gloves ? "#60a5fa" : skin;
        ctx.beginPath(); ctx.arc(lHand.ex, lHand.ey, 6, 0, Math.PI*2); ctx.fill();

        // Torso
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.moveTo(-8, shoulderY - 5); ctx.lineTo(10, shoulderY - 5); 
        ctx.lineTo(8, hipY); ctx.lineTo(-8, hipY); ctx.fill();
        
        // Right leg (Foreground, under coat)
        const rFoot = drawLimb(ctx, 0, hipY, 40, 45, rLegA1, rLegA2, 16, 12, suitColor);
        ctx.fillStyle = player.equipped.shoes ? "#1e293b" : shoeColor;
        ctx.beginPath(); ctx.ellipse(rFoot.ex + 5, rFoot.ey, 12, 6, 0, 0, Math.PI*2); ctx.fill();

        if (!player.equipped.coat) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.moveTo(0, shoulderY - 5); ctx.lineTo(10, shoulderY - 5); ctx.lineTo(5, shoulderY + 15); ctx.fill();
            ctx.strokeStyle = tieColor; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(5, shoulderY - 3); ctx.lineTo(2, shoulderY + 20); ctx.stroke();
        }

        if (player.equipped.coat) {
            const coatSwing = (player.moving ? swing1 * 10 : 0);
            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            ctx.moveTo(-10, shoulderY - 8); ctx.lineTo(12, shoulderY - 8);
            ctx.lineTo(15 + coatSwing, hipY); ctx.lineTo(12 + coatSwing, hipY + 50);
            ctx.lineTo(-15 + coatSwing, hipY + 45); ctx.lineTo(-12 + coatSwing, hipY); ctx.fill();
            ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(5, shoulderY - 8); ctx.lineTo(0 + coatSwing*0.5, shoulderY + 20); ctx.stroke();
        }

        // Head & Face
        ctx.fillStyle = skin;
        ctx.fillRect(-3, shoulderY - 12, 8, 12);
        ctx.beginPath(); ctx.ellipse(3, shoulderY - 25, 12, 16, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(10, shoulderY - 25); ctx.lineTo(17, shoulderY - 22); ctx.lineTo(12, shoulderY - 18); ctx.fill();
        
        if (!player.equipped.headcover) {
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.moveTo(8, shoulderY - 35); ctx.quadraticCurveTo(10, shoulderY - 45, 0, shoulderY - 42);
            ctx.quadraticCurveTo(-15, shoulderY - 42, -10, shoulderY - 25);
            ctx.lineTo(-10, shoulderY - 15); ctx.lineTo(-5, shoulderY - 15); ctx.fill();
        }

        if (player.equipped.headcover) {
            ctx.fillStyle = "#38bdf8"; 
            ctx.beginPath(); ctx.ellipse(2, shoulderY - 38, 15, 11, 0, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(2, shoulderY - 38, 14, 10, 0, Math.PI/2, Math.PI*1.5); ctx.stroke();
        }

        if (player.equipped.goggles) {
            ctx.fillStyle = "rgba(186, 230, 253, 0.7)"; ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(5, shoulderY - 30, 12, 10, 3); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(5, shoulderY - 25); ctx.lineTo(-10, shoulderY - 25); ctx.stroke();
        } else {
            ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(8, shoulderY - 26, 1.5, 0, Math.PI*2); ctx.fill();
        }

        if (player.equipped.mask) {
            ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(8, shoulderY - 18); ctx.lineTo(15, shoulderY - 16); ctx.lineTo(13, shoulderY - 8); ctx.lineTo(2, shoulderY - 10); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = "#e2e8f0"; ctx.beginPath(); ctx.moveTo(8, shoulderY - 18); ctx.lineTo(-2, shoulderY - 20); ctx.stroke();
        } else {
            ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.moveTo(12, shoulderY - 14); ctx.lineTo(15, shoulderY - 14); ctx.stroke();
        }

        

        const rArmColor = player.equipped.coat ? "#f1f5f9" : suitColor;
        const rHand = drawLimb(ctx, 0, shoulderY, 35, 35, rArmA1, rArmA2, 12, 10, rArmColor);
        ctx.fillStyle = player.equipped.gloves ? "#60a5fa" : skin;
        ctx.beginPath(); ctx.arc(rHand.ex, rHand.ey, 6, 0, Math.PI*2); ctx.fill();
    }
    
    ctx.restore();
}
            function startStage1CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");
              let lastTime = performance.now();
              let interactables = [
                  { id: "headcover", name: "MŨ TRÙM ĐẦU", ox: window.innerWidth/2 - 412, oy: window.innerHeight - 468, w: 90, h: 60 },
                  { id: "goggles", name: "KÍNH BẢO HỘ", ox: window.innerWidth/2 - 145, oy: window.innerHeight - 468, w: 90, h: 60 },
                  { id: "gloves", name: "GĂNG TAY", ox: window.innerWidth/2 + 122, oy: window.innerHeight - 468, w: 90, h: 60 },
                  { id: "mask", name: "KHẨU TRANG", ox: window.innerWidth/2 - 412, oy: window.innerHeight - 343, w: 90, h: 60 },
                  { id: "shoes", name: "GIÀY BẢO HỘ", ox: window.innerWidth/2 + 122, oy: window.innerHeight - 343, w: 140, h: 60 },
                  { id: "coat", name: "ÁO KHOÁC", ox: window.innerWidth/2 + 390, oy: window.innerHeight - 480, w: 120, h: 290 },
                  { id: "slippers", name: "DÉP LÊ", ox: window.innerWidth/2 - 145, oy: window.innerHeight - 343, w: 90, h: 60 }
              ];
              
              function mousedownHandler(e) {
                  if (e.button === 2) {
                      player.targetX = e.clientX;
                      player.targetY = e.clientY;
                      player.moving = true;
                      player.direction = e.clientX > player.x ? 1 : -1;
                  } else if (e.button === 0) {
                      for(let i=0; i<interactables.length; i++) {
                          const item = interactables[i];
                          if(e.clientX > item.ox && e.clientX < item.ox + item.w && 
                             e.clientY > item.oy && e.clientY < item.oy + item.h) {
                              draggingItem = item;
                              draggingItem.x = e.clientX - item.w/2;
                              draggingItem.y = e.clientY - item.h/2;
                              break;
                          }
                      }
                  }
              }
              function mousemoveHandler(e) {
                  if (draggingItem) {
                      draggingItem.x = e.clientX - draggingItem.w/2;
                      draggingItem.y = e.clientY - draggingItem.h/2;
                  }
              }
              function mouseupHandler(e) {
                  if (draggingItem) {
                      if (e.clientX > player.x - 80 && e.clientX < player.x + 80 && e.clientY > player.y - 400 && e.clientY < player.y + 50) {
                          if (draggingItem.id === "slippers") {
                              if (typeof playError === 'function') playError();
                              if (typeof deductScore === 'function') deductScore(10, "Lỗi: Không được mang dép lê trong phòng thí nghiệm!");
                              

                          } else {
                              player.equipped[draggingItem.id] = true;
                              if (typeof playClick === 'function') playClick();
                              if (Object.keys(player.equipped).filter(k => k !== 'slippers').every(k => player.equipped[k]) && !player.stage1Done) {
                                  player.stage1Done = true;
                                  setTimeout(() => { cleanup(); onComplete(); }, 3000);
                              }
                          }
                      }
                      draggingItem = null;
                  }
              }
              canvas.addEventListener("mousedown", mousedownHandler);
              canvas.addEventListener("mousemove", mousemoveHandler);
              canvas.addEventListener("mouseup", mouseupHandler);
              canvas.addEventListener("contextmenu", e => { e.preventDefault(); return false; });
              
              function cleanup() {
                  cancelAnimationFrame(stage1LoopId);
                  canvas.removeEventListener("mousedown", mousedownHandler);
                  canvas.removeEventListener("mousemove", mousemoveHandler);
                  canvas.removeEventListener("mouseup", mouseupHandler);
              }
              
              function update(deltaTime) {
                  if (player.moving) {
                      player.animTime += 0.2;
                      let dx = player.targetX - player.x;
                      let dy = player.targetY - player.y;
                      let dist = Math.hypot(dx, dy);
                      if (dist > player.speed) {
                          player.x += (dx / dist) * player.speed;
                          player.y += (dy / dist) * player.speed;
                      } else {
                          player.x = player.targetX;
                          player.y = player.targetY;
                          player.moving = false;
                          player.animTime = 0;
                      }
                  }
              }

              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                  const cx = window.innerWidth/2;
                  const cy = window.innerHeight;
                  interactables[0].ox = cx - 412; interactables[0].oy = cy - 468;
                  interactables[1].ox = cx - 145; interactables[1].oy = cy - 468;
                  interactables[2].ox = cx + 122; interactables[2].oy = cy - 468;
                  interactables[3].ox = cx - 412; interactables[3].oy = cy - 343;
                  interactables[4].ox = cx + 122; interactables[4].oy = cy - 343;
                  interactables[5].ox = cx + 390; interactables[5].oy = cy - 480;
                  interactables[6].ox = cx - 145; interactables[6].oy = cy - 343;
                  if (!player.moving) {
                      player.y = cy - 100;
                      player.targetY = cy - 100;
                  }
              }
              window.addEventListener("resize", resize);
              resize();

              function drawItems(ctx) {
                  interactables.forEach(item => {
                      const isEquipped = player.equipped[item.id];
                      const maxCount = (item.id === "coat") ? 1 : 3;
                      const shelfCount = isEquipped ? (maxCount - 1) : maxCount;
                      const isDragging = (draggingItem === item);

                      // 1. Draw items on shelf / rack
                      for(let copy = 0; copy < shelfCount; copy++) {
                          if (isDragging && copy === 0) continue;
                          ctx.save();
                          ctx.translate(item.ox, item.oy);
                          if(copy > 0) {
                              if(item.id === "headcover") ctx.translate(0, -10 * copy);
                              else if(item.id === "goggles") ctx.translate(15 * copy, -5 * copy);
                              else if(item.id === "gloves") ctx.translate(0, -15 * copy); 
                              else if(item.id === "mask") ctx.translate(0, -8 * copy);
                              else if(item.id === "shoes" || item.id === "slippers") ctx.translate(30 * copy, 0); 
                          }
                          drawSingleItem(ctx, item.id, copy);
                          ctx.restore();
                      }

                      // 2. Draw label under the shelf (only if not empty)
                      if (shelfCount > 0) {
                          ctx.save();
                          ctx.translate(item.ox, item.oy);
                          ctx.fillStyle = "rgba(255,255,255,0.85)";
                          ctx.fillRect(item.w/2 - 45, item.h + 8, 90, 24);
                          ctx.strokeStyle = "rgba(148,163,184,0.3)"; ctx.strokeRect(item.w/2 - 45, item.h + 8, 90, 24);
                          ctx.fillStyle = "#0f172a"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
                          ctx.fillText(item.name, item.w/2, item.h + 24);
                          ctx.restore();
                      }
                  });
              }

              function drawDraggedItem(ctx) {
                  if (draggingItem) {
                      ctx.save();
                      ctx.translate(draggingItem.x, draggingItem.y);
                      ctx.shadowColor = "rgba(0,0,0,0.4)";
                      ctx.shadowBlur = 15;
                      ctx.shadowOffsetY = 10;
                      ctx.scale(1.05, 1.05);
                      drawSingleItem(ctx, draggingItem.id, 0);
                      ctx.restore();
                  }
              }


              function drawSingleItem(ctx, id, copyIndex) {
                  if (id === "headcover") {
                      const w = 90, h = 60;
                      const capG = ctx.createRadialGradient(w/2, h/2 - 10, 5, w/2, h/2, 40);
                      capG.addColorStop(0, "#ffffff");
                      capG.addColorStop(0.8, "#f1f5f9");
                      capG.addColorStop(1, "#cbd5e1");
                      ctx.fillStyle = capG;
                      ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 4;
                      ctx.beginPath();
                      ctx.ellipse(w/2, h/2, 40, 25, 0, 0, Math.PI*2);
                      ctx.fill();
                      ctx.shadowColor = "transparent";

                      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
                      ctx.beginPath(); ctx.ellipse(w/2, h/2 + 20, 35, 5, 0, 0, Math.PI*2); ctx.stroke();

                      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; ctx.lineWidth = 1.5;
                      for(let i=0; i<9; i++) {
                          ctx.beginPath();
                          let x1 = w/2 - 32 + i*8;
                          ctx.moveTo(x1, h/2 - 20 + Math.abs(i-4)*2);
                          ctx.quadraticCurveTo(x1 + (Math.random()*10 - 5), h/2, x1 - (Math.random()*6), h/2 + 20);
                          ctx.stroke();
                      }
                  } else if (id === "goggles") {
                      const w = 100;
                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
                      const lensG = ctx.createLinearGradient(0, 0, 0, 50);
                      lensG.addColorStop(0, "rgba(255,255,255,0.95)");
                      lensG.addColorStop(0.4, "rgba(224, 242, 254, 0.3)"); 
                      lensG.addColorStop(1, "rgba(255,255,255,0.5)");
                      ctx.fillStyle = lensG;
                      ctx.beginPath();
                      ctx.moveTo(10, 20);
                      ctx.quadraticCurveTo(w/2, 35, w-10, 20);
                      ctx.quadraticCurveTo(w-5, 60, w/2, 55);
                      ctx.quadraticCurveTo(5, 60, 10, 20);
                      ctx.fill();
                      ctx.shadowColor = "transparent";

                      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3; ctx.stroke();
                      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)"; ctx.lineWidth = 1; ctx.stroke();

                      ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
                      ctx.beginPath(); ctx.moveTo(10, 20); ctx.quadraticCurveTo(w/2, 35, w-10, 20); ctx.stroke();

                      ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 6;
                      ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(0, -5); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(w-10, 20); ctx.lineTo(w, -5); ctx.stroke();

                      ctx.fillStyle = "rgba(255,255,255,0.95)";
                      ctx.beginPath(); ctx.ellipse(25, 32, 10, 4, Math.PI/5, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.ellipse(w - 30, 30, 6, 2, -Math.PI/6, 0, Math.PI*2); ctx.fill();
                  } else if (id === "gloves") {
                      if (copyIndex > 0) { // Khi copyIndex > 0, vẽ hộp găng tay trên kệ
                          const boxW = 80; const boxH = 40;
                          ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
                          ctx.fillStyle = "#eff6ff"; 
                          ctx.fillRect(10, 10, boxW, boxH);
                          ctx.shadowColor = "transparent";
                          ctx.fillStyle = "#3b82f6"; 
                          ctx.fillRect(10, 10, boxW, 10);
                          ctx.fillStyle = "#bfdbfe"; 
                          ctx.beginPath(); ctx.ellipse(10 + boxW/2, 10 + boxH/2, 25, 10, 0, 0, Math.PI*2); ctx.fill();
                      } else { // Vẽ găng tay chi tiết
                          ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 4;
                          ctx.fillStyle = "#3b82f6"; 
                          ctx.beginPath();
                          ctx.moveTo(25, 80); ctx.lineTo(50, 75); 
                          ctx.lineTo(55, 45); 
                          ctx.lineTo(80, 50); ctx.arc(80, 45, 5, Math.PI/2, -Math.PI/2); ctx.lineTo(60, 30); 
                          ctx.lineTo(65, 10); ctx.arc(60, 10, 5, 0, Math.PI, true); ctx.lineTo(50, 25); 
                          ctx.lineTo(50, 5); ctx.arc(45, 5, 5, 0, Math.PI, true); ctx.lineTo(40, 25); 
                          ctx.lineTo(35, 10); ctx.arc(30, 10, 5, 0, Math.PI, true); ctx.lineTo(30, 30); 
                          ctx.lineTo(22, 20); ctx.arc(17, 20, 4, 0, Math.PI, true); ctx.lineTo(20, 40); 
                          ctx.lineTo(25, 80);
                          ctx.fill();
                          ctx.shadowColor = "transparent";
                          
                          ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2.5;
                          ctx.beginPath(); ctx.moveTo(32, 70); ctx.lineTo(32, 35); ctx.stroke();
                          ctx.beginPath(); ctx.moveTo(42, 65); ctx.lineTo(50, 40); ctx.stroke();
                          ctx.strokeStyle = "#1e3a8a"; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(24, 80); ctx.quadraticCurveTo(38, 85, 51, 75); ctx.stroke();
                          
                          ctx.fillStyle = "#0ea5e9";
                          ctx.beginPath();
                          ctx.moveTo(70, 75); ctx.lineTo(45, 85); 
                          ctx.lineTo(40, 55); 
                          ctx.lineTo(20, 65); ctx.arc(20, 60, 5, Math.PI/2, -Math.PI/2); ctx.lineTo(35, 40);
                          ctx.lineTo(30, 20); ctx.arc(35, 20, 5, Math.PI, 0); ctx.lineTo(45, 35);
                          ctx.lineTo(45, 15); ctx.arc(50, 15, 5, Math.PI, 0); ctx.lineTo(55, 35);
                          ctx.lineTo(60, 20); ctx.arc(65, 20, 5, Math.PI, 0); ctx.lineTo(65, 40);
                          ctx.lineTo(75, 30); ctx.arc(80, 30, 4, Math.PI, 0); ctx.lineTo(75, 50);
                          ctx.lineTo(70, 75);
                          ctx.fill();
                          ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2.5;
                          ctx.beginPath(); ctx.moveTo(60, 65); ctx.lineTo(60, 40); ctx.stroke();
                          ctx.beginPath(); ctx.moveTo(50, 70); ctx.lineTo(45, 45); ctx.stroke();
                          ctx.strokeStyle = "#075985"; ctx.lineWidth = 3;
                          ctx.beginPath(); ctx.moveTo(71, 75); ctx.quadraticCurveTo(58, 85, 44, 85); ctx.stroke();
                      }
                  } else if (id === "mask") {
                      ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 4;
                      const maskG = ctx.createLinearGradient(10, 20, 10, 70);
                      maskG.addColorStop(0, "#bae6fd"); maskG.addColorStop(1, "#38bdf8");
                      ctx.fillStyle = maskG;
                      ctx.beginPath(); ctx.roundRect(20, 20, 80, 50, 4); ctx.fill();
                      ctx.shadowColor = "transparent";
                      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5;
                      ctx.strokeRect(20, 20, 80, 50);
                      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1;
                      for(let py=32; py<=55; py+=11) {
                          ctx.beginPath(); ctx.moveTo(22, py); ctx.lineTo(98, py); ctx.stroke();
                          ctx.fillStyle = "rgba(0,0,0,0.06)"; ctx.fillRect(22, py, 76, 4);
                      }
                      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3.5;
                      ctx.beginPath(); ctx.moveTo(40, 22); ctx.lineTo(80, 22); ctx.stroke();
                      ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 2.5;
                      ctx.beginPath(); ctx.moveTo(20, 30); ctx.bezierCurveTo(-5, 20, -5, 70, 20, 60); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(100, 30); ctx.bezierCurveTo(125, 20, 125, 70, 100, 60); ctx.stroke();
                  } else if (id === "shoes") {
                      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 6;
                      const shoeG = ctx.createLinearGradient(10, 30, 10, 70);
                      shoeG.addColorStop(0, "#334155"); shoeG.addColorStop(1, "#0f172a");
                      
                      // Left shoe
                      ctx.fillStyle = shoeG;
                      ctx.beginPath();
                      ctx.moveTo(10, 60); ctx.quadraticCurveTo(10, 30, 35, 25); 
                      ctx.lineTo(55, 25); ctx.quadraticCurveTo(75, 35, 75, 60); 
                      ctx.fill();
                      ctx.shadowColor = "transparent";
                      ctx.fillStyle = "#020617";
                      ctx.beginPath(); ctx.roundRect(8, 60, 68, 12, 5); ctx.fill();
                      ctx.fillStyle = "#000000";
                      ctx.beginPath(); ctx.arc(45, 45, 3.5, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.arc(58, 48, 3.5, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.arc(52, 55, 3.5, 0, Math.PI*2); ctx.fill();
                      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 4;
                      ctx.beginPath(); ctx.moveTo(15, 60); ctx.quadraticCurveTo(10, 45, 30, 35); ctx.stroke();
                      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.moveTo(35, 27); ctx.quadraticCurveTo(55, 27, 65, 45); ctx.stroke();

                      // Right shoe
                      ctx.shadowColor = "rgba(0,0,0,0.3)";
                      ctx.fillStyle = shoeG;
                      ctx.beginPath();
                      ctx.moveTo(80, 60); ctx.quadraticCurveTo(80, 30, 105, 25);
                      ctx.lineTo(125, 25); ctx.quadraticCurveTo(145, 35, 145, 60);
                      ctx.fill();
                      ctx.shadowColor = "transparent";
                      ctx.fillStyle = "#020617";
                      ctx.beginPath(); ctx.roundRect(78, 60, 68, 12, 5); ctx.fill();
                      ctx.fillStyle = "#000000";
                      ctx.beginPath(); ctx.arc(115, 45, 3.5, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.arc(128, 48, 3.5, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.arc(122, 55, 3.5, 0, Math.PI*2); ctx.fill();
                      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 4;
                      ctx.beginPath(); ctx.moveTo(85, 60); ctx.quadraticCurveTo(80, 45, 100, 35); ctx.stroke();
                      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.moveTo(105, 27); ctx.quadraticCurveTo(125, 27, 135, 45); ctx.stroke();
                  } else if (id === "coat") {
                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
                      const coatG = ctx.createLinearGradient(0, 40, 120, 40);
                      coatG.addColorStop(0, "#e2e8f0"); 
                      coatG.addColorStop(0.2, "#ffffff"); 
                      coatG.addColorStop(0.5, "#f8fafc");
                      coatG.addColorStop(0.8, "#ffffff"); 
                      coatG.addColorStop(1, "#cbd5e1"); 
                      
                      ctx.fillStyle = coatG;
                      ctx.beginPath();
                      ctx.moveTo(40, 35); ctx.lineTo(80, 35); 
                      ctx.lineTo(120, 65); ctx.lineTo(115, 160); 
                      ctx.lineTo(85, 145); ctx.lineTo(95, 290); 
                      ctx.lineTo(25, 290); ctx.lineTo(35, 145); 
                      ctx.lineTo(5, 160); ctx.lineTo(0, 65); 
                      ctx.closePath();
                      ctx.fill();
                      ctx.shadowColor = "transparent";

                      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; ctx.lineWidth = 2.5;
                      ctx.beginPath(); ctx.moveTo(35, 145); ctx.quadraticCurveTo(55, 220, 40, 280); ctx.stroke(); 
                      ctx.beginPath(); ctx.moveTo(85, 145); ctx.quadraticCurveTo(65, 220, 80, 280); ctx.stroke(); 
                      ctx.beginPath(); ctx.moveTo(25, 75); ctx.lineTo(30, 130); ctx.stroke(); 
                      ctx.beginPath(); ctx.moveTo(95, 75); ctx.lineTo(90, 130); ctx.stroke(); 

                      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
                      ctx.beginPath(); ctx.moveTo(40, 35); ctx.lineTo(60, 95); ctx.lineTo(80, 35); ctx.stroke(); 
                      ctx.beginPath(); ctx.moveTo(60, 95); ctx.lineTo(60, 290); ctx.stroke(); 
                      
                      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
                      for(let by=120; by<=250; by+=40) {
                          ctx.beginPath(); ctx.arc(55, by, 4.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                          ctx.fillStyle = "#94a3b8";
                          ctx.fillRect(53.5, by-1, 1, 2); ctx.fillRect(56.5, by-1, 1, 2);
                          ctx.fillStyle = "#ffffff";
                      }

                      ctx.strokeStyle = "rgba(148, 163, 184, 0.7)"; ctx.lineWidth = 1.5;
                      ctx.strokeRect(30, 190, 24, 28); 
                      ctx.strokeRect(66, 190, 24, 28); 
                      ctx.strokeRect(68, 110, 18, 22); 

                      ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
                      ctx.beginPath(); ctx.moveTo(60, 35); ctx.lineTo(60, 15); ctx.stroke(); 
                      ctx.beginPath(); ctx.arc(60, 10, 6, Math.PI, Math.PI*2.5); ctx.stroke();
                   } else if (id === "slippers") {
                       ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 4;
                       const slipG = ctx.createLinearGradient(0, 30, 0, 70);
                       slipG.addColorStop(0, "#ef4444"); slipG.addColorStop(1, "#991b1b");
                       // Left
                       ctx.fillStyle = slipG;
                       ctx.beginPath(); ctx.ellipse(25, 45, 12, 22, -Math.PI/12, 0, Math.PI*2); ctx.fill();
                       ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.ellipse(25, 40, 10, 12, -Math.PI/12, 0, Math.PI*2); ctx.fill();
                       ctx.fillStyle = "#ffffff"; ctx.fillRect(15, 30, 20, 12);
                       // Right
                       ctx.fillStyle = slipG;
                       ctx.beginPath(); ctx.ellipse(65, 45, 12, 22, Math.PI/12, 0, Math.PI*2); ctx.fill();
                       ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.ellipse(65, 40, 10, 12, Math.PI/12, 0, Math.PI*2); ctx.fill();
                       ctx.fillStyle = "#ffffff"; ctx.fillRect(55, 30, 20, 12);
                       ctx.shadowColor = "transparent";
 
                  }
              }


              function draw(time) {
                  const deltaTime = time - lastTime;
                  lastTime = time;
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  drawRoom(ctx, canvas.width, canvas.height);
                  update(deltaTime);
                  drawItems(ctx);
                  drawPlayer(ctx);
                  drawDraggedItem(ctx);
                  
                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText("Di chuyển: CLICK CHUỘT PHẢI", canvas.width / 2, 80);
                  ctx.fillStyle = "#0284c7";
                  ctx.fillText("Mặc đồ: KÉO THẢ TỪ KỆ VÀO NGƯỜI NHÂN VẬT (Cần 6 món)", canvas.width / 2, 105);
                  ctx.shadowColor = "transparent";
                  stage1LoopId = requestAnimationFrame(draw);
              }
              stage1LoopId = requestAnimationFrame(draw);
            }

            // --- Stage 2: Acid Mixing ---
            let stage2LoopId;
            function startStage2CanvasGame(onComplete) {
              const canvas = document.getElementById("stage1-canvas");
              const ctx = canvas.getContext("2d");
              let state = "playing"; // playing, success, explosion
              
              // Position player next to the table
              player.targetX = window.innerWidth/2 - 250;
              player.targetY = window.innerHeight - 200;
              player.x = player.targetX;
              player.y = player.targetY;

              let water = { id: "water", x: window.innerWidth/2 - 50, y: window.innerHeight - 350 - 100, w: 90, h: 100 };
              let acid = { id: "acid", x: window.innerWidth/2 + 100, y: window.innerHeight - 350 - 120, w: 70, h: 120 };
              
              let draggingItem = null;
              let dragOffsetX = 0;
              let dragOffsetY = 0;
              let particles = [];
              let shakeAmt = 0;

              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                  const tY = window.innerHeight - 350;
                  const cx = window.innerWidth/2;
                  if (!draggingItem) {
                      water.x = cx - 50;
                      water.y = tY - water.h;
                      acid.x = cx + 100;
                      acid.y = tY - acid.h;
                  }
                  if (!player.moving) {
                      player.x = cx - 250;
                      player.y = window.innerHeight - 200;
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
                  if (draggingItem && state === "playing") {
                      const rect = canvas.getBoundingClientRect();
                      draggingItem.x = e.clientX - rect.left - dragOffsetX;
                      draggingItem.y = e.clientY - rect.top - dragOffsetY;
                  }
              }

              function mouseupHandler(e) {
                  if (draggingItem && state === "playing") {
                      const wb = getBounds(water);
                      const ab = getBounds(acid);
                      
                      if (isOverlap(wb, ab)) {
                          if (draggingItem.id === "acid") {
                              playClick();
                              state = "success";
                              Doms.questDesc.textContent = "Chuẩn! Rót axit vào nước giúp tản nhiệt an toàn.";
                              setTimeout(() => { cleanup(); onComplete(); }, 3000);
                          } else {
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
                              setTimeout(() => { cleanup(); loadStage(2); }, 2500);
                          }
                      } else {
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


              canvas.addEventListener("mousedown", mousedownHandler);
              canvas.addEventListener("mousemove", mousemoveHandler);
              canvas.addEventListener("mouseup", mouseupHandler);

              function drawBeaker(ctx, item, type) {
                  ctx.save();
                  ctx.translate(item.x, item.y);
                  if (draggingItem === item) {
                      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
                      ctx.rotate(0.1); 
                  } else {
                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
                  }
                  
                  // HYPER REALISTIC GLASS

                  // Back of glass
                  ctx.fillStyle = "rgba(255,255,255,0.1)";
                  
                  if (type === "water") {
                      // Glass back
                      ctx.beginPath(); ctx.roundRect(0, 0, item.w, item.h, 5); ctx.fill();
                      
                      // Liquid
                      let liqH = (state === "success") ? item.h * 0.7 : item.h * 0.5;
                      let gL = ctx.createLinearGradient(0, item.h - liqH, 0, item.h);
                      if (state === "success") {
                          gL.addColorStop(0, "rgba(253, 186, 116, 0.8)"); gL.addColorStop(1, "rgba(234, 88, 12, 0.9)");
                      } else {
                          gL.addColorStop(0, "rgba(125, 211, 252, 0.7)"); gL.addColorStop(1, "rgba(2, 132, 199, 0.8)");
                      }
                      ctx.fillStyle = gL;
                      ctx.beginPath(); ctx.roundRect(4, item.h - liqH, item.w - 8, liqH - 4, 3); ctx.fill();
                      
                      // Volumetric highlight inside liquid
                      ctx.fillStyle = "rgba(255,255,255,0.3)";
                      ctx.beginPath(); ctx.roundRect(8, item.h - liqH + 5, 5, liqH - 15, 2); ctx.fill();

                      // Glass Front
                      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.roundRect(0, 0, item.w, item.h, 5); ctx.stroke();
                      
                      // Glints
                      ctx.fillStyle = "rgba(255,255,255,0.9)";
                      ctx.fillRect(8, 10, 4, item.h - 20);
                      ctx.fillRect(15, 10, 2, item.h - 20);
                      
                      // Label
                      ctx.fillStyle = "#ffffff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
                      ctx.fillText("H2O", item.w/2, item.h/2 - 10);
                  } else {
                      // Bottle Body Back
                      ctx.beginPath(); 
                      ctx.moveTo(20, 30); ctx.lineTo(20, item.h - 10); ctx.arcTo(20, item.h, 30, item.h, 10);
                      ctx.lineTo(item.w - 30, item.h); ctx.arcTo(item.w - 20, item.h, item.w - 20, item.h - 10, 10);
                      ctx.lineTo(item.w - 20, 30); ctx.lineTo(item.w/2 + 10, 15); ctx.lineTo(item.w/2 + 10, 0);
                      ctx.lineTo(item.w/2 - 10, 0); ctx.lineTo(item.w/2 - 10, 15); ctx.closePath();
                      ctx.fill();
                      
                      // Liquid
                      if (state !== "explosion" || draggingItem !== item) {
                          let gL = ctx.createLinearGradient(0, item.h - 60, 0, item.h);
                          gL.addColorStop(0, "rgba(252, 211, 77, 0.8)");
                          gL.addColorStop(1, "rgba(180, 83, 9, 0.9)");
                          ctx.fillStyle = gL;
                          ctx.beginPath(); ctx.roundRect(22, item.h - 60, item.w - 44, 55, 5); ctx.fill();
                          // Liquid highlight
                          ctx.fillStyle = "rgba(255,255,255,0.4)";
                          ctx.fillRect(25, item.h - 55, 4, 45);
                      }
                      
                      // Bottle Front
                      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
                      ctx.stroke();
                      
                      // Glints
                      ctx.fillStyle = "rgba(255,255,255,0.8)";
                      ctx.beginPath(); ctx.moveTo(22, 35); ctx.lineTo(22, item.h - 15); ctx.lineTo(26, item.h - 15); ctx.lineTo(26, 33); ctx.fill();
                      
                      // Label
                      ctx.fillStyle = "#fef2f2"; ctx.fillRect(20, item.h/2 - 10, item.w - 40, 25);
                      ctx.fillStyle = "#dc2626"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
                      ctx.fillText("H2SO4", item.w/2, item.h/2 + 7);
                  }
                  
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

                  drawRoom(ctx, canvas.width, canvas.height);
                  drawPlayer(ctx);
                  
                  if (state === "explosion") {
                      particles.forEach(p => {
                          p.vy += 0.8;
                          p.x += p.vx; p.y += p.vy;
                          p.life -= 0.02;
                          ctx.globalAlpha = Math.max(0, p.life);
                          ctx.fillStyle = p.color;
                          ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI*2); ctx.fill();
                      });
                      ctx.globalAlpha = 1.0;
                      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
                      ctx.fillRect(0,0,canvas.width,canvas.height);
                  }

                  // Draw items
                  if (draggingItem === acid) drawBeaker(ctx, water, "water");
// Debug
ctx.fillStyle="red"; ctx.fillRect(water.x, water.y, 100, 100);
                  if (draggingItem === water) drawBeaker(ctx, acid, "acid");
                  if (draggingItem !== water) drawBeaker(ctx, water, "water");
                  if (draggingItem !== acid) drawBeaker(ctx, acid, "acid");

                  if (shakeAmt > 0) ctx.restore();

                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText("Pha chế Axit: KÉO THẢ bình H2SO4 vào cốc H2O theo đúng nguyên tắc an toàn.", canvas.width / 2, 80);
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
              
              const tY = window.innerHeight - 350;
              const w = window.innerWidth;
              
              var bins = [
                  { id: "red", color1: "#ef4444", color2: "#7f1d1d", label: "SẮC NHỌN", x: w/2 - 200, y: tY + 120, w: 100, h: 120 },
                  { id: "yellow", color1: "#f59e0b", color2: "#78350f", label: "HÓA CHẤT", x: w/2 - 50, y: tY + 120, w: 100, h: 120 },
                  { id: "green", color1: "#22c55e", color2: "#14532d", label: "SINH HOẠT", x: w/2 + 100, y: tY + 120, w: 100, h: 120 }
              ];

              var trash = [
                  { id: "glass", type: "glass", name: "Thủy tinh vỡ", x: w/2 - 150, y: tY - 60, w: 50, h: 50, target: "red", visible: true, ox: w/2 - 150, oy: tY - 60 },
                  { id: "chem", type: "flask", name: "Hóa chất dư", x: w/2, y: tY - 60, w: 50, h: 50, target: "yellow", visible: true, ox: w/2, oy: tY - 60 },
                  { id: "paper", type: "paper", name: "Giấy lau sạch", x: w/2 + 150, y: tY - 60, w: 50, h: 50, target: "green", visible: true, ox: w/2 + 150, oy: tY - 60 }
              ];
let sortedCount = 0;

              player.targetX = window.innerWidth/2 - 350;
              player.targetY = window.innerHeight - 200;
              player.x = player.targetX;
              player.y = player.targetY;

              function resize() {
                  canvas.width = window.innerWidth;
                  canvas.height = window.innerHeight;
                  if (!player.moving) {
                      player.x = window.innerWidth/2 - 350;
                      player.y = window.innerHeight - 200;
                  }
                  
                  const cx = window.innerWidth/2;
                  const tY = window.innerHeight - 350;
                  
                  if (typeof bins !== 'undefined') {
                      bins[0].x = cx - 200; bins[0].y = tY + 120;
                      bins[1].x = cx - 50;  bins[1].y = tY + 120;
                      bins[2].x = cx + 100; bins[2].y = tY + 120;
                  }
                  
                  if (typeof trash !== 'undefined') {
                      trash[0].ox = cx - 150; trash[0].oy = tY - 60;
                      trash[1].ox = cx;       trash[1].oy = tY - 60;
                      trash[2].ox = cx + 150; trash[2].oy = tY - 60;
                      
                      if (!draggingItem) {
                          trash.forEach(t => { t.x = t.ox; t.y = t.oy; });
                      }
                  }
              }
              

              let draggingItem = null;
              let dragOffsetX = 0, dragOffsetY = 0;
              window.addEventListener("resize", resize);
              resize();

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
                                  playClick();
                                  draggingItem.visible = false;
                                  sortedCount++;
                                  if (sortedCount >= 3) {
                                      setTimeout(() => { cleanup(); onComplete(); }, 500);
                                  }
                              } else {
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
                  
                  // Ambient Occlusion Shadow
                  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
                  ctx.fillStyle = "rgba(0,0,0,0.5)";
                  ctx.fillRect(10, b.h-10, b.w-20, 10);
                  
                  // 3D Cylinder Gradient
                  const bgG = ctx.createLinearGradient(0, 0, b.w, 0);
                  bgG.addColorStop(0, b.color2);
                  bgG.addColorStop(0.2, b.color1); // highlight
                  bgG.addColorStop(0.8, b.color1);
                  bgG.addColorStop(1, b.color2);
                  ctx.fillStyle = bgG;
                  
                  ctx.shadowColor = "transparent";
                  ctx.beginPath(); 
                  ctx.moveTo(5, 10); ctx.lineTo(b.w-5, 10); ctx.lineTo(b.w-15, b.h); ctx.lineTo(15, b.h); 
                  ctx.fill();
                  
                  // Top Rim
                  const rimG = ctx.createLinearGradient(0,0,b.w,0);
                  rimG.addColorStop(0, "#ffffff"); rimG.addColorStop(1, b.color1);
                  ctx.fillStyle = rimG;
                  ctx.fillRect(0, 0, b.w, 10);
                  
                  // Ribs (lines on the bin for detail)
                  ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 2;
                  ctx.beginPath(); ctx.moveTo(b.w/4 + 5, 20); ctx.lineTo(b.w/4 + 5, b.h - 10); ctx.stroke();
                  ctx.beginPath(); ctx.moveTo(b.w/2, 20); ctx.lineTo(b.w/2, b.h - 10); ctx.stroke();
                  ctx.beginPath(); ctx.moveTo(b.w*3/4 - 5, 20); ctx.lineTo(b.w*3/4 - 5, b.h - 10); ctx.stroke();

                  // Label Plate
                  ctx.fillStyle = "rgba(255,255,255,0.9)";
                  ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 4;
                  ctx.fillRect(b.w/2 - 35, b.h/2 - 15, 70, 30);
                  ctx.shadowColor = "transparent";
                  ctx.fillStyle = b.color2; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText(b.label, b.w/2, b.h/2 + 4);
                  
                  ctx.restore();
              }

              function drawTrash(ctx, t) {
                  if (!t.visible) return;
                  ctx.save();
                  ctx.translate(t.x, t.y);
                  if (draggingItem === t) {
                      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 15; ctx.shadowOffsetY = 10;
                      ctx.scale(1.1, 1.1);
                  } else {
                      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 5;
                  }
                  
                  if (t.type === "glass") {
                      // Broken glass with sharp metallic gradients
                      ctx.fillStyle = "rgba(186, 230, 253, 0.7)";
                      ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(0, 40); ctx.lineTo(40, 50); ctx.fill();
                      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.stroke();
                      // Internal shard lines
                      ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(15, 25); ctx.lineTo(40, 50); ctx.stroke();
                  } else if (t.type === "flask") {
                      // Shiny flask
                      const fg = ctx.createRadialGradient(25, 30, 5, 25, 30, 25);
                      fg.addColorStop(0, "rgba(251, 191, 36, 0.9)"); fg.addColorStop(1, "rgba(180, 83, 9, 0.9)");
                      ctx.fillStyle = fg;
                      ctx.beginPath(); ctx.arc(25, 30, 20, 0, Math.PI*2); ctx.fill();
                      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(20, 25, 5, 0, Math.PI*2); ctx.fill();
                      ctx.fillStyle = "#78350f"; ctx.fillRect(20, 0, 10, 15);
                  } else {
                      // Crumpled paper
                      const pg = ctx.createLinearGradient(0,0,45,45);
                      pg.addColorStop(0, "#ffffff"); pg.addColorStop(1, "#cbd5e1");
                      ctx.fillStyle = pg;
                      ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(35, 0); ctx.lineTo(45, 20); ctx.lineTo(40, 45); ctx.lineTo(0, 40); ctx.fill();
                      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
                      // Crumple lines
                      ctx.beginPath(); ctx.moveTo(5,5); ctx.lineTo(25, 25); ctx.lineTo(45, 20); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(25,25); ctx.lineTo(15, 45); ctx.stroke();
                  }
                  
                  ctx.shadowColor = "transparent";
                  ctx.fillStyle = "#1e293b"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
                  ctx.fillText(t.name, 25, -10);
                  
                  ctx.restore();
              }

              function draw() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  drawRoom(ctx, canvas.width, canvas.height);
                  drawPlayer(ctx);
                  
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

            
            function startStage4CanvasGame(onComplete) {
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
                  cards.push({ uid: idCounter++, matchId: s.id, type: 'symbol', content: s.emoji, color: s.color, isFlipped: true, isMatched: false });
                  cards.push({ uid: idCounter++, matchId: s.id, type: 'text', content: s.text, color: s.color, isFlipped: true, isMatched: false });
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
              let memorizeTimer = 180; // 3 seconds at 60fps
              
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
                  if (memorizeTimer > 0) {
                      ctx.fillText("GHI NHỚ CÁC THẺ: " + Math.ceil(memorizeTimer/60) + "s", canvas.width / 2, 80);
                  } else {
                      ctx.fillText("Giải Mã GHS: Lật mở và ghép đúng cặp Biểu tượng - Ý nghĩa.", canvas.width / 2, 80);
                  }
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
                      } else if (c.isFlipped || memorizeTimer > 0) {
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
                  
                  if (memorizeTimer > 0) {
                      memorizeTimer--;
                      if (memorizeTimer === 0) {
                          cards.forEach(c => c.isFlipped = false);
                      }
                  } else {
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
                                          window.removeEventListener("resize", resize);
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
                  }
                  
                  stage4LoopId = requestAnimationFrame(draw);
              }
              
              function handleDown(e) {
                  if (memorizeTimer > 0) return;
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
            
            // --- Start Application ---
            updateHUD();
            loadStage(1);
    
  

