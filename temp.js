507:    
508-    function showStageCompleteEffect(callback) {
509-        const overlay = document.getElementById('screen-fx');
510-        overlay.innerHTML = `
511-            <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300" id="success-overlay">
512-                <div class="bg-white p-8 rounded-2xl shadow-2xl transform scale-50 opacity-0 transition-all duration-500 ease-out flex flex-col items-center" id="success-modal">
513-                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
514-                        <i data-lucide="check-circle" class="w-12 h-12 text-green-500"></i>
515-                    </div>
516-                    <h2 class="text-3xl font-bold text-slate-800 mb-2">Nhiệm vụ hoàn thành!</h2>
517-                    <p class="text-slate-500 text-lg">Chuẩn bị chuyển sang bước tiếp theo...</p>
518-                </div>
519-            </div>
520-        `;
521-        lucide.createIcons();
522-        playSuccessDing(); // play sound immediately
523-        
524-        // Animate in
525-        requestAnimationFrame(() => {
526-            const modal = document.getElementById('success-modal');
527-            if(modal) {
528-                modal.classList.remove('scale-50', 'opacity-0');
529-                modal.classList.add('scale-100', 'opacity-100');
530-            }
531-        });
532-
533-        // Wait 3 seconds, then callback
534-        setTimeout(() => {
535-            const overlayContainer = document.getElementById('success-overlay');
536-            if(overlayContainer) {
537-                overlayContainer.classList.add('opacity-0');
538-                setTimeout(() => {
539-                    overlay.innerHTML = '';
540-                    callback();
541-                }, 300);
542-            } else {
543-                callback();
544-            }
545-        }, 3000);
546-    }
547-
548-            lucide.createIcons();
549-
550-            // --- Audio System (Web Audio API Synthesizer) ---
551-            let audioCtx = null;
552-            function initAudio() {
553-                if (!audioCtx) {
554-                    try {
555-                        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
556-                    } catch(e) {}
557-                }
558-            }
559-
560-            function playTone(freq, type, duration, vol = 0.1) {
561-              if (audioCtx.state === "suspended") audioCtx.resume();
562-              const osc = audioCtx.createOscillator();
563-              const gain = audioCtx.createGain();
564-              osc.type = type;
565-              osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
566-
567-              gain.gain.setValueAtTime(vol, audioCtx.currentTime);
568-              gain.gain.exponentialRampToValueAtTime(
569-                0.01,
570-                audioCtx.currentTime + duration,
571-              );
572-
573-              osc.connect(gain);
574-              gain.connect(audioCtx.destination);
575-              osc.start();
576-              osc.stop(audioCtx.currentTime + duration);
577-            }
578-
579-            function playClick() { initAudio(); if(!audioCtx) return;
580-              playTone(600, "sine", 0.1, 0.1);
581-            }
582-            function playError() { initAudio(); if(!audioCtx) return;
583-              playTone(150, "sawtooth", 0.4, 0.2);
584-            }
585-            function playSuccessDing() { initAudio(); if(!audioCtx) return;
586-              playTone(523.25, "sine", 0.1, 0.1); // C5
587-              setTimeout(() => playTone(659.25, "sine", 0.2, 0.1), 100); // E5
588-              setTimeout(() => playTone(783.99, "sine", 0.4, 0.1), 200); // G5
589-            }
590-            function playExplosion() { initAudio(); if(!audioCtx) return;
591-              if (audioCtx.state === "suspended") audioCtx.resume();
592-              const bufferSize = audioCtx.sampleRate * 1;
593-              const buffer = audioCtx.createBuffer(
594-                1,
595-                bufferSize,
596-                audioCtx.sampleRate,
597-              );
598-              const data = buffer.getChannelData(0);
599-              for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
600-
601-              const noise = audioCtx.createBufferSource();
602-              noise.buffer = buffer;
603-              const filter = audioCtx.createBiquadFilter();
604-              filter.type = "lowpass";
605-              filter.frequency.value = 1000;
606-
607-              const gain = audioCtx.createGain();
608-              gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
609-              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
610-
611-              noise.connect(filter);
612-              filter.connect(gain);
613-              gain.connect(audioCtx.destination);
614-              noise.start();
615-            }
616-
617-            let sirenOsc, sirenGain, sirenInterval;
618-            function startSiren() {
619-              if (sirenOsc) return;
620-              sirenOsc = audioCtx.createOscillator();
621-              sirenGain = audioCtx.createGain();
622-              sirenOsc.type = "square";
623-              sirenGain.gain.value = 0.05;
624-              sirenOsc.connect(sirenGain);
625-              sirenGain.connect(audioCtx.destination);
626-              sirenOsc.start();
627-
628-              let high = true;
629-              sirenInterval = setInterval(() => {
630-                sirenOsc.frequency.setValueAtTime(
631-                  high ? 800 : 600,
632-                  audioCtx.currentTime,
633-                );
634-                high = !high;
635-              }, 400);
636-            }
637-            function stopSiren() {
638-              if (sirenOsc) {
639-                sirenOsc.stop();
640-                clearInterval(sirenInterval);
641-                sirenOsc = null;
642-              }
643-            }
644-
645-            // --- State Management ---
646-            let currentStage = 1;
647-            let score = 100;
648-            let draggedItem = null;
649-            let stageState = {};
650-
651-            const Doms = {
652-              stageText: document.getElementById("stage-text"),
653-              progressText: document.getElementById("progress-text"),
654-              progressBar: document.getElementById("progress-bar"),
655-              scoreText: document.getElementById("score-text"),
656-              questTitle: document.getElementById("quest-title"),
657-              questDesc: document.getElementById("quest-desc"),
658-              inventory: document.getElementById("inventory"),
659-              deskItems: document.getElementById("desk-items"),
660-              screenFx: document.getElementById("screen-fx"),
661-              character: document.getElementById("character"),
662-              charZone: document.getElementById("character-zone"),
663-            };
664-
665-            function updateHUD() {
666-              Doms.stageText.textContent = `MÀN ${currentStage}/4`;
667-              const pct = Math.round(((currentStage - 1) / 4) * 100);
668-              Doms.progressText.textContent = `${pct}% HOÀN THÀNH`;
669-              Doms.progressBar.style.width = `${pct}%`;
670-              Doms.scoreText.textContent = score;
671-              if (score < 50)
672-                Doms.scoreText.className = "text-xl font-bold text-red-400";
673-              else if (score < 80)
674-                Doms.scoreText.className = "text-xl font-bold text-amber-400";
675-              else Doms.scoreText.className = "text-xl font-bold text-emerald-400";
676-            }
677-
678-            
679-            function showToast(message, isError=true) {
680-                const toast = document.createElement('div');
681-                toast.style.cssText = 'position: fixed; top: 40px; left: 50%; transform: translateX(-50%) translateY(-20px); z-index: 99999; padding: 12px 24px; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); font-weight: bold; color: white; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; pointer-events: none; text-align: center; font-size: 16px; min-width: 300px;';
682-                toast.style.backgroundColor = isError ? '#ef4444' : '#10b981';
683-                toast.textContent = message;
684-                document.body.appendChild(toast);
685-                
686-                // Trigger reflow
687-                toast.offsetHeight;
688-                
689-                requestAnimationFrame(() => {
690-                    toast.style.opacity = '1';
691-                    toast.style.transform = 'translateX(-50%) translateY(0)';
692-                });
693-                
694-                setTimeout(() => {
695-                    toast.style.opacity = '0';
696-                    toast.style.transform = 'translateX(-50%) translateY(-20px)';
697-                    setTimeout(() => {
698-                        if (toast.parentNode) toast.parentNode.removeChild(toast);
699-                    }, 300);
700-                }, 4000);
701-            }
702-
703-            function deductScore(pts, reason) {
704-              score = Math.max(0, score - pts);
705-              updateHUD();
706-              try { playError(); } catch(e) { console.error('Audio error:', e); }
707-              Doms.screenFx.className = "fixed inset-0 pointer-events-none z-[60] flash-red";
708-              setTimeout(() => {
709-                  Doms.screenFx.className = "fixed inset-0 pointer-events-none z-[60]";
710-              }, 500);
711-              showToast("CẢNH BÁO: " + reason + " (-" + pts + " điểm)", true);
712-            }
713-
714-
715-            function nextStage() {
716-              currentStage++;
717-              if (currentStage > 4) {
718-                completeGate();
719-              } else {
720-                updateHUD();
721-                loadStage(currentStage);
722-              }
723-            }
724-
725-            // --- Drag and Drop Engine ---
726-            function initDraggable(el, data) {
727-              el.draggable = true;
728-              el.dataset.item = JSON.stringify(data);
729-              el.addEventListener("dragstart", (e) => {
730-                draggedItem = data;
731-                e.dataTransfer.setData("text/plain", JSON.stringify(data));
732-                e.currentTarget.style.opacity = "0.5";
733-                playClick();
734-              });
735-              el.addEventListener("dragend", (e) => {
736-                e.currentTarget.style.opacity = "1";
737-                draggedItem = null;
738-              });
739-            }
740-
741-            function initDropzone(el, onDropCb) {
742-              el.addEventListener("dragover", (e) => {
743-                e.preventDefault();
744-                el.classList.add("drag-over");
745-              });
746-              el.addEventListener("dragleave", () => {
747-                el.classList.remove("drag-over");
748-              });
749-              el.addEventListener("drop", (e) => {
750-                e.preventDefault();
751-                el.classList.remove("drag-over");
752-                const dataStr = e.dataTransfer.getData("text/plain");
753-                if (dataStr) {
754-                  const data = JSON.parse(dataStr);
755-                  onDropCb(data, el);
756-                }
757-              });
758-            }
759-
760-            // --- Stage Logics ---
761-
762-            function clearStage() {
763-              Doms.inventory.innerHTML = "";
764-              Doms.deskItems.innerHTML = "";
765-              // Reset character pos
766-              Doms.charZone.style.left = "370px";
767-              Doms.charZone.style.top = "600px";
768-              stopSiren();
769-              document.body.classList.remove("shake-active");
770-
771-              // Remove previous dropzone listeners if any (by cloning)
772-              const cZone = Doms.charZone.cloneNode(true);
773-              Doms.charZone.parentNode.replaceChild(cZone, Doms.charZone);
774-              Doms.charZone = cZone;
775-            }
776-
777-            
778-            function loadStage(stage) {
779-              clearStage();
780-              stageState = {};
781-              
782-              // Canvas takes over for all stages
783-              document.getElementById("stage1-canvas").classList.remove("hidden");
784-              document.getElementById("stage-container").style.display = "none";
785-              document.getElementById("bottom-dock").style.display = "none";
786-
787-              if (stage === 1) {
788-                Doms.questTitle.innerHTML = `<i data-lucide="shield-check" class="w-5 h-5 inline"></i> Nhiệm vụ 1: Chuẩn bị PPE`;
789-                Doms.questDesc.textContent = "Click CHUỘT PHẢI để đi tới gần kệ. KÉO THẢ các vật phẩm từ kệ vào người nhân vật để trang bị: Áo, Kính, Găng tay, Giày, Mũ, Khẩu trang.";
790-                startStage1CanvasGame(() => {
791-                  showStageCompleteEffect(nextStage);
792-                });
793-              } else if (stage === 2) {
794-                Doms.questTitle.innerHTML = `<i data-lucide="flask-conical" class="w-5 h-5 inline"></i> Nhiệm vụ 2: Pha chế Axit`;
795-                Doms.questDesc.textContent = "Kéo bình Axit rót vào cốc Nước. (Quy tắc: Luôn rót Axit vào Nước, KHÔNG LÀM NGƯỢC LẠI!)";
796-                startStage2CanvasGame(() => {
797-                  showStageCompleteEffect(nextStage);
798-                });
799-              } else if (stage === 3) {
800-                Doms.questTitle.innerHTML = `<i data-lucide="trash-2" class="w-5 h-5 inline"></i> Nhiệm vụ 3: Phân Loại Rác`;
801-                Doms.questDesc.textContent = "Kéo rác thả vào đúng thùng: Đỏ (Sắc nhọn), Cam (Hóa chất), Xanh (Rác sinh hoạt).";
802-                startStage3CanvasGame(() => {
803-                  showStageCompleteEffect(nextStage);
804-                });
805-              } else if (stage === 4) {
806-                Doms.questTitle.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5 inline"></i> Nhiệm vụ 4: Ký hiệu GHS`;
807-                Doms.questDesc.textContent = "Lật mở và ghép đúng 8 cặp Biểu tượng - Ý nghĩa cảnh báo hóa chất GHS.";
808-                startStage4CanvasGame(() => {
809-                  showStageCompleteEffect(nextStage);
810-                });
811-              }
812-            }
813-
814-            function completeGate() {
815-              Doms.stageText.textContent = `HOÀN THÀNH!`;
816-              Doms.progressText.textContent = `100%`;
817-              Doms.progressBar.style.width = `100%`;
818-              document.getElementById("status-badge").className =
819-                "bg-emerald-900/50 text-emerald-400 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5";
820-              document.getElementById("status-badge").innerHTML =
821-                '<i data-lucide="check-circle" class="w-4 h-4"></i><span>ĐÃ CẤP PHÉP</span>';
822-              lucide.createIcons();
823-              confetti({ particleCount: 150, spread: 180, origin: { y: 0.3 } });
824-              playSuccessDing();
825-              setTimeout(playSuccessDing, 400);
826-
827-              // Skip cert modal, enter lab directly
828-              setTimeout(() => {
829-                localStorage.setItem("lab_safety_passed", "true");
830-                localStorage.setItem("just_passed_safety", "true");
831-                document.body.style.opacity = "0";
832-                document.body.style.transition = "opacity 1s";
833-                setTimeout(() => {
834-                  window.location.href = "/";
835-                }, 1000);
836-              }, 2000);
837-            }
838-
839-            function generateCertificate(name, score) {
840-              const canvas = document.getElementById("cert-canvas");
841-              const ctx = canvas.getContext("2d");
842-
843-              // Background
844-              ctx.fillStyle = "#f8fafc";
845-              ctx.fillRect(0, 0, canvas.width, canvas.height);
846-
847-              // Border
848-              ctx.strokeStyle = "#0f766e";
849-              ctx.lineWidth = 10;
850-              ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
851-              ctx.strokeStyle = "#14b8a6";
852-              ctx.lineWidth = 2;
853-              ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
854-
855-              // Header
856-              ctx.fillStyle = "#0f172a";
857-              ctx.font = 'bold 36px "Segoe UI", sans-serif';
858-              ctx.textAlign = "center";
859-              ctx.fillText(
860-                "CHỨNG NHẬN AN TOÀN PHÒNG THÍ NGHIỆM",
861-                canvas.width / 2,
862-                100,
863-              );
864-
865-              ctx.font = '20px "Segoe UI", sans-serif';
866-              ctx.fillStyle = "#64748b";
867-              ctx.fillText(
868-                "Cấp cho học viên đã hoàn thành xuất sắc Khóa Huấn Luyện 2.5D",
869-                canvas.width / 2,
870-                140,
871-              );
872-
873-              // Name
874-              ctx.font = 'bold 48px "Segoe UI", serif';
875-              ctx.fillStyle = "#0f766e";
876-              ctx.fillText(name.toUpperCase(), canvas.width / 2, 240);
877-
878-              // Line
879-              ctx.beginPath();
880-              ctx.moveTo(200, 260);
881-              ctx.lineTo(600, 260);
882-              ctx.strokeStyle = "#cbd5e1";
883-              ctx.lineWidth = 1;
884-              ctx.stroke();
885-
886-              // Details
887-              ctx.font = '22px "Segoe UI", sans-serif';
888-              ctx.fillStyle = "#334155";
889-              ctx.fillText(`Điểm số đánh giá: ${score}/100`, canvas.width / 2, 320);
890-              ctx.fillText(
891-                `Ngày cấp: ${new Date().toLocaleDateString("vi-VN")}`,
892-                canvas.width / 2,
893-                360,
894-              );
895-
896-              // Stamp
897-              ctx.save();
898-              ctx.translate(650, 420);
899-              ctx.rotate((-15 * Math.PI) / 180);
900-              ctx.strokeStyle = "#dc2626";
901-              ctx.lineWidth = 4;
902-              ctx.beginPath();
903-              ctx.arc(0, 0, 50, 0, Math.PI * 2);
904-              ctx.stroke();
905-              ctx.beginPath();
906-              ctx.arc(0, 0, 44, 0, Math.PI * 2);
907-              ctx.stroke();
908-              ctx.fillStyle = "#dc2626";
909-              ctx.font = "bold 16px sans-serif";
910-              ctx.fillText("CERTIFIED", 0, -5);
911-              ctx.fillText("SAFE", 0, 15);
912-              ctx.restore();
913-
914-              // Signatures
915-              ctx.font = "italic 20px serif";
916-              ctx.fillStyle = "#0f172a";
917-              ctx.fillText("Dr. AI Chemist", 200, 450);
918-              ctx.font = "14px sans-serif";
919-              ctx.fillText("Trưởng Phòng Quản Lý", 200, 470);
920-
921-              // Download handler
922-              document.getElementById("btn-download-cert").onclick = () => {
923-                const link = document.createElement("a");
924-                link.download = `Chung_Nhan_An_Toan_${name.replace(/\s+/g, "_")}.png`;
925-                link.href = canvas.toDataURL();
926-                link.click();
927-              };
928-            }
929-
930-
931-            
932-            
933-            
934-            // --- Global Canvas State & Helpers ---
935-            // Polyfill for roundRect for older browsers
936-            if (!CanvasRenderingContext2D.prototype.roundRect) {
937-                CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
938-                    if (w < 2 * r) r = w / 2;
939-                    if (h < 2 * r) r = h / 2;
940-                    this.moveTo(x + r, y);
941-                    this.arcTo(x + w, y, x + w, y + h, r);
942-                    this.arcTo(x + w, y + h, x, y + h, r);
943-                    this.arcTo(x, y + h, x, y, r);
944-                    this.arcTo(x, y, x + w, y, r);
945-                    this.closePath(); // Ensure polyfill has closePath
946-                    return this;
947-                };
948-            }
949-
950-            const player = {
951-                x: window.innerWidth / 2, y: window.innerHeight - 100,
952-                targetX: window.innerWidth / 2, targetY: window.innerHeight - 100,
953-                speed: 6,
954-                width: 120, height: 300,
955-                moving: false,
956-                animTime: 0, direction: 1,
957-                equipped: { coat: false, goggles: false, gloves: false, shoes: false, headcover: false, mask: false }
958-            };
959-
960-            function createGradient(ctx, x, y, w, h, colors) {
961-                const g = ctx.createLinearGradient(x, y, x, y+h);
962-                colors.forEach((c, i) => g.addColorStop(i/(colors.length-1), c));
963-                return g;
964-            }
965-
966-            function getMetalGradient(ctx, x, y, w, h, horizontal=false) {
967-                let g = horizontal ? ctx.createLinearGradient(x, y, x+w, y) : ctx.createLinearGradient(x, y, x, y+h);
968-                g.addColorStop(0, "#475569");
969-                g.addColorStop(0.1, "#94a3b8");
970-                g.addColorStop(0.3, "#ffffff"); // sharp highlight
971-                g.addColorStop(0.5, "#94a3b8");
972-                g.addColorStop(0.8, "#64748b");
973-                g.addColorStop(1, "#334155");
974-                return g;
975-            }
976-
977-            
978-            // --- Stage 1: Put on PPE ---
979-            let stage1LoopId;
980-            let draggingItem = null;
981-              function drawRoom(ctx, w, h) {
982-              // Hậu cảnh phòng thay đồ PPE siêu thực tế
983-              
984-              // 1. Tường và sàn nhà (phòng lab trắng sáng)
985-              const wallG = ctx.createLinearGradient(0, 0, 0, h - 250);
986-              wallG.addColorStop(0, "#ffffff");
987-              wallG.addColorStop(1, "#f1f5f9");
988-              ctx.fillStyle = wallG;
989-              ctx.fillRect(0, 0, w, h - 250);
990-
991-              // Các đường nối panel tường (phòng sạch)
992-              ctx.strokeStyle = "#e2e8f0";
993-              ctx.lineWidth = 2;
994-              for(let i=100; i<w; i+=300) {
995-                  ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h-250); ctx.stroke();
996-              }
997-
998-              // Sàn nhà Epoxy bóng
999-              const floorG = ctx.createLinearGradient(0, h - 250, 0, h);
1000-              floorG.addColorStop(0, "#d1d5db");
1001-              floorG.addColorStop(1, "#9ca3af");
1002-              ctx.fillStyle = floorG;
1003-              ctx.fillRect(0, h - 250, w, 250);
1004-              
1005-              // Lưới gạch sàn mờ
1006-              ctx.strokeStyle = "rgba(255,255,255,0.1)";
1007-              ctx.lineWidth = 1;
1008-              for(let i=0; i<w; i+=100) {
1009-                  ctx.beginPath(); ctx.moveTo(i, h-250); ctx.lineTo(i - 100, h); ctx.stroke();
1010-              }
1011-              for(let j=h-250; j<h; j+=40) {
1012-                  ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
1013-              }
1014-
1015-              // 2. Bàn Inox (Stainless Steel Table) trung tâm - SHIFTED LEFT
1016-              const tableW = 800;
1017-              const tableH = 40;
1018-              const tableX = w / 2 - 500;
1019-              const tableY = h - 250;
1020-
1021-              ctx.shadowColor = "rgba(0,0,0,0.5)";
1022-              ctx.shadowBlur = 30;
1023-              ctx.shadowOffsetY = 20;
1024-
1025-              // Mặt bàn Inox
1026-              const tblG = ctx.createLinearGradient(tableX, tableY, tableX, tableY + tableH);
1027-              tblG.addColorStop(0, "#f8fafc");
1028-              tblG.addColorStop(0.5, "#cbd5e1");
1029-              tblG.addColorStop(1, "#94a3b8");
1030-              ctx.fillStyle = tblG;
1031-              ctx.fillRect(tableX, tableY, tableW, tableH);
1032-              
1033-              ctx.shadowColor = "transparent";
1034-              ctx.strokeStyle = "#ffffff";
1035-              ctx.lineWidth = 2;
1036-              ctx.strokeRect(tableX, tableY, tableW, tableH);
1037-
1038-              // Chân bàn Inox
1039-              const legG = ctx.createLinearGradient(tableX, 0, tableX + 20, 0);
1040-              legG.addColorStop(0, "#94a3b8"); legG.addColorStop(0.5, "#f1f5f9"); legG.addColorStop(1, "#64748b");
1041-              ctx.fillStyle = legG;
1042-              ctx.fillRect(tableX + 20, tableY + tableH, 20, 210);
1043-              ctx.fillRect(tableX + tableW - 40, tableY + tableH, 20, 210);
1044-              // Thanh ngang chân bàn
1045-              ctx.fillRect(tableX + 20, tableY + tableH + 150, tableW - 40, 15);
1046-
1047-              // 3. Tủ kệ Inox trên bàn (Shelving unit)
1048-              const shelfW = tableW;
1049-              const shelfH = 250;
1050-              const shelfX = tableX;
1051-              const shelfY = tableY - shelfH;
1052-
1053-              // Khung kệ
1054-              ctx.fillStyle = "#e2e8f0";
1055-              ctx.fillRect(shelfX, shelfY, shelfW, shelfH);
1056-              // Đổ bóng góc kệ
1057-              const innerShadow = ctx.createLinearGradient(shelfX, shelfY, shelfX, shelfY+20);
1058-              innerShadow.addColorStop(0, "rgba(0,0,0,0.2)"); innerShadow.addColorStop(1, "transparent");
1059-              ctx.fillStyle = innerShadow;
1060-              ctx.fillRect(shelfX, shelfY, shelfW, shelfH);
1061-
1062-              ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 6;
1063-              ctx.strokeRect(shelfX, shelfY, shelfW, shelfH);
1064-
1065-              // Ngăn kệ (3 cột, 2 hàng)
1066-              ctx.lineWidth = 4;
1067-              ctx.beginPath(); ctx.moveTo(shelfX, shelfY + shelfH/2); ctx.lineTo(shelfX + shelfW, shelfY + shelfH/2); ctx.stroke(); // Ngang
1068-              ctx.beginPath(); ctx.moveTo(shelfX + shelfW/3, shelfY); ctx.lineTo(shelfX + shelfW/3, shelfY + shelfH); ctx.stroke(); // Dọc 1
1069-              ctx.beginPath(); ctx.moveTo(shelfX + shelfW*2/3, shelfY); ctx.lineTo(shelfX + shelfW*2/3, shelfY + shelfH); ctx.stroke(); // Dọc 2
1070-
1071-              // Text nhãn dán trên kệ
1072-              ctx.fillStyle = "#ffffff";
1073-              ctx.fillRect(shelfX + shelfW/6 - 40, shelfY - 20, 80, 20);
1074-              ctx.fillRect(shelfX + shelfW/2 - 40, shelfY - 20, 80, 20);
1075-              ctx.fillRect(shelfX + shelfW*5/6 - 60, shelfY - 20, 120, 20);
1076-              
1077-              ctx.fillRect(shelfX + shelfW/6 - 45, shelfY + shelfH/2 - 20, 90, 20);
1078-              ctx.fillRect(shelfX + shelfW/2 - 45, shelfY + shelfH/2 - 20, 90, 20);
1079-
1080-              ctx.fillStyle = "#0f172a"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
1081-              ctx.fillText("MŨ TRÙM ĐẦU", shelfX + shelfW/6, shelfY - 6);
1082-              ctx.fillText("KÍNH BẢO HỘ", shelfX + shelfW/2, shelfY - 6);
1083-              ctx.fillText("GĂNG TAY NITRILE", shelfX + shelfW*5/6, shelfY - 6);
1084-              ctx.fillText("KHẨU TRANG Y TẾ", shelfX + shelfW/6, shelfY + shelfH/2 - 6);
1085-              ctx.fillText("GIÀY BẢO HỘ", shelfX + shelfW/2, shelfY + shelfH/2 - 6);
1086-
1087-              // 4. Giá treo áo khoác Inox (bên phải)
1088-              const rackX = tableX + tableW + 50;
1089-              const rackY = h - 500;
1090-              const rackW = 200;
1091-              ctx.fillStyle = legG;
1092-              ctx.fillRect(rackX, rackY, 15, 300); // Trụ trái
1093-              ctx.fillRect(rackX + rackW, rackY, 15, 300); // Trụ phải
1094-              ctx.fillRect(rackX, rackY + 20, rackW + 15, 15); // Thanh treo trên
1095-              ctx.fillRect(rackX, rackY + 280, rackW + 15, 15); // Thanh ngang dưới chân
1096-
1097-              // Bánh xe giá treo
1098-              ctx.fillStyle = "#1e293b";
1099-              ctx.beginPath(); ctx.arc(rackX + 7, rackY + 310, 10, 0, Math.PI*2); ctx.fill();
1100-              ctx.beginPath(); ctx.arc(rackX + rackW + 7, rackY + 310, 10, 0, Math.PI*2); ctx.fill();
1101-
1102-              // Bảng nội quy an toàn trên tường
1103-              ctx.fillStyle = "#0284c7";
1104-              ctx.fillRect(rackX, rackY - 100, 200, 80);
1105-              ctx.fillStyle = "#ffffff";
1106-              ctx.fillRect(rackX + 2, rackY - 98, 196, 76);
1107-              ctx.fillStyle = "#0284c7";
1108-              ctx.fillRect(rackX, rackY - 100, 200, 25);
1109-              ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
1110-              ctx.fillText("BẢNG NỘI QUY PPE", rackX + 100, rackY - 84);
1111-              // Vẽ vài icon nhỏ trên bảng
1112-              ctx.fillStyle = "#0ea5e9";
1113-              ctx.beginPath(); ctx.arc(rackX + 40, rackY - 50, 15, 0, Math.PI*2); ctx.fill();
1114-              ctx.beginPath(); ctx.arc(rackX + 100, rackY - 50, 15, 0, Math.PI*2); ctx.fill();
1115-              ctx.beginPath(); ctx.arc(rackX + 160, rackY - 50, 15, 0, Math.PI*2); ctx.fill();
1116-            }
1117-
1118-
1119-
1120-            function drawPlayer(ctx) {
1121-    const isMoving = player.moving;
1122-    const t = isMoving ? player.animTime : 0;
1123-    
1124-    // Determine facing direction (1 for right, -1 for left)
1125-    if (player.direction == null) player.direction = 1;
1126-    if (isMoving) {
1127-        let dx = player.targetX - player.x;
1128-        if (Math.abs(dx) > 2) player.direction = dx > 0 ? 1 : -1;
1129-    }
1130-    
1131-    // Smooth turning for scale (flips horizontally)
1132-    if (player.turn == null) player.turn = player.direction;
1133-    player.turn += (player.direction - player.turn) * 0.2;
1134-    
1135-    const bounce = isMoving ? Math.abs(Math.sin(t % (Math.PI * 2) * 2)) * 3 : 0;
1136-    
1137-    ctx.save();
1138-    // Move to player position
1139-    ctx.translate(player.x, player.y - bounce);
1140-    
1141-    // SCALE CHARACTER LARGER
1142-    ctx.scale(1.5, 1.5);
1143-    
1144-    // Shadow
1145-    ctx.fillStyle = "rgba(0,0,0,0.2)";
1146-    ctx.beginPath(); ctx.ellipse(0, 5 + bounce/1.5, 27 - bounce/2, 7, 0, 0, Math.PI*2); ctx.fill();
1147-    
1148-    // Base colors
1149-    const skin = "#fcd4b6";
1150-    const suitColor = "#1e293b"; // Dark blue/slate suit
1151-    const tieColor = "#dc2626"; // Red tie
1152-    const shoeColor = "#0f172a";
1153-    
1154-    function drawLimb(ctx, startX, startY, len1, len2, angle1, angle2, width1, width2, color) {
1155-        const jx = startX + Math.sin(angle1) * len1;
1156-        const jy = startY + Math.cos(angle1) * len1;
1157-        const ex = jx + Math.sin(angle2) * len2;
1158-        const ey = jy + Math.cos(angle2) * len2;
1159-        
1160-        ctx.strokeStyle = color;
1161-        ctx.lineCap = "round";
1162-        ctx.lineJoin = "round";
1163-        
1164-        ctx.beginPath();
1165-        ctx.lineWidth = width1;
1166-        ctx.moveTo(startX, startY);
1167-        ctx.lineTo(jx, jy);
1168-        ctx.stroke();
1169-        
1170-        ctx.beginPath();
1171-        ctx.lineWidth = width2;
1172-        ctx.moveTo(jx, jy);
1173-        ctx.lineTo(ex, ey);
1174-        ctx.stroke();
1175-        
1176-        return { jx, jy, ex, ey };
1177-    }
1178-
1179-    const hipY = -90;
1180-    const shoulderY = -145;
1181-
1182-    if (!isMoving) {
1183-        // --- FRONT VIEW (Realistic & Detailed) ---
1184-
1185-        // Gradients
1186-        const skinGrad = ctx.createRadialGradient(0, shoulderY - 25, 2, 0, shoulderY - 25, 15);
1187-        skinGrad.addColorStop(0, "#fed7aa");
1188-        skinGrad.addColorStop(1, "#fdba74");
1189-
1190-        const pantGrad = ctx.createLinearGradient(-16, 0, 16, 0);
1191-        pantGrad.addColorStop(0, "#0f172a"); // Darker edges
1192-        pantGrad.addColorStop(0.5, "#334155"); // Lighter center
1193-        pantGrad.addColorStop(1, "#0f172a");
1194-
1195-        const shirtGrad = ctx.createLinearGradient(0, shoulderY, 0, hipY);
1196-        shirtGrad.addColorStop(0, "#ffffff");
1197-        shirtGrad.addColorStop(1, "#e2e8f0");
1198-
1199-        // 1. LEGS
1200-        ctx.fillStyle = pantGrad;
1201-        // Left Leg
1202-        ctx.beginPath();
1203-        ctx.moveTo(-15, hipY); ctx.lineTo(-3, hipY); ctx.lineTo(-6, -10); ctx.lineTo(-17, -10); ctx.fill();
1204-        // Right Leg
1205-        ctx.beginPath();
1206-        ctx.moveTo(3, hipY); ctx.lineTo(15, hipY); ctx.lineTo(17, -10); ctx.lineTo(6, -10); ctx.fill();
1207-
1208-        // 2. SHOES
1209-        const shoeGrad = ctx.createLinearGradient(-15, -10, -15, 5);
1210-        shoeGrad.addColorStop(0, player.equipped.shoes ? "#334155" : "#1e293b");
1211-        shoeGrad.addColorStop(1, player.equipped.shoes ? "#020617" : "#020617");
1212-
1213-        ctx.fillStyle = shoeGrad;
1214-        // Left shoe
1215-        ctx.beginPath(); ctx.ellipse(-12, -4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
1216-        // Right shoe
1217-        ctx.beginPath(); ctx.ellipse(12, -4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
1218-
1219-        if (player.equipped.shoes) {
1220-             // Steel toe cap highlight
1221-             ctx.fillStyle = "rgba(255,255,255,0.3)";
1222-             ctx.beginPath(); ctx.ellipse(-15, -5, 3, 4, 0, 0, Math.PI*2); ctx.fill();
1223-             ctx.beginPath(); ctx.ellipse(9, -5, 3, 4, 0, 0, Math.PI*2); ctx.fill();
1224-        }
1225-
1226-        // 3. ARMS (Under coat)
1227-        const armGrad = ctx.createLinearGradient(-26, 0, -14, 0);
1228-        armGrad.addColorStop(0, "#0f172a"); armGrad.addColorStop(0.5, "#334155"); armGrad.addColorStop(1, "#020617");
1229-
1230-        const rArmGrad = ctx.createLinearGradient(14, 0, 26, 0);
1231-        rArmGrad.addColorStop(0, "#020617"); rArmGrad.addColorStop(0.5, "#334155"); rArmGrad.addColorStop(1, "#0f172a");
1232-
1233-        // Coat sleeve gradients
1234-        const cArmGrad = ctx.createLinearGradient(-26, 0, -14, 0);
1235-        cArmGrad.addColorStop(0, "#94a3b8"); cArmGrad.addColorStop(0.5, "#f8fafc"); cArmGrad.addColorStop(1, "#64748b");
1236-        
1237-        const crArmGrad = ctx.createLinearGradient(14, 0, 26, 0);
1238-        crArmGrad.addColorStop(0, "#64748b"); crArmGrad.addColorStop(0.5, "#f8fafc"); crArmGrad.addColorStop(1, "#94a3b8");
1239-
1240-        const lArmColor = player.equipped.coat ? cArmGrad : armGrad;
1241-        const rArmColor = player.equipped.coat ? crArmGrad : rArmGrad;
1242-
1243-        // Draw Left Arm
1244-        ctx.fillStyle = lArmColor;
1245-        ctx.beginPath();
1246-        ctx.moveTo(-16, shoulderY + 5);
1247-        ctx.quadraticCurveTo(-27, shoulderY + 15, -24, hipY + 5);
1248-        ctx.lineTo(-14, hipY + 5);
1249-        ctx.quadraticCurveTo(-16, shoulderY + 20, -12, shoulderY + 10);
1250-        ctx.fill();
1251-
1252-        // Draw Right Arm
1253-        ctx.fillStyle = rArmColor;
1254-        ctx.beginPath();
1255-        ctx.moveTo(16, shoulderY + 5);
1256-        ctx.quadraticCurveTo(27, shoulderY + 15, 24, hipY + 5);
1257-        ctx.lineTo(14, hipY + 5);
1258-        ctx.quadraticCurveTo(16, shoulderY + 20, 12, shoulderY + 10);
1259-        ctx.fill();
1260-
1261-        // 4. HANDS / GLOVES
1262-        const gloveGrad = ctx.createRadialGradient(-20, hipY + 10, 1, -20, hipY + 10, 8);
1263-        gloveGrad.addColorStop(0, "#bfdbfe"); gloveGrad.addColorStop(1, "#2563eb");
1264-
1265-        ctx.fillStyle = player.equipped.gloves ? gloveGrad : skinGrad;
1266-        ctx.beginPath(); ctx.ellipse(-20, hipY + 10, 5, 7, 0, 0, Math.PI*2); ctx.fill();
1267-
1268-        const rGloveGrad = ctx.createRadialGradient(20, hipY + 10, 1, 20, hipY + 10, 8);
1269-        rGloveGrad.addColorStop(0, "#bfdbfe"); rGloveGrad.addColorStop(1, "#2563eb");
1270-        ctx.fillStyle = player.equipped.gloves ? rGloveGrad : skinGrad;
1271-        ctx.beginPath(); ctx.ellipse(20, hipY + 10, 5, 7, 0, 0, Math.PI*2); ctx.fill();
1272-
1273-        // 5. TORSO (Inner Suit/Shirt)
1274-        ctx.fillStyle = shirtGrad;
1275-        ctx.beginPath();
1276-        ctx.moveTo(-13, shoulderY); ctx.lineTo(13, shoulderY);
1277-        ctx.lineTo(11, hipY); ctx.lineTo(-11, hipY); ctx.fill();
1278-
1279-        // Tie
1280-        const tieGrad = ctx.createLinearGradient(0, shoulderY, 0, hipY - 20);
1281-        tieGrad.addColorStop(0, "#ef4444"); tieGrad.addColorStop(1, "#7f1d1d");
1282-        ctx.fillStyle = tieGrad;
1283-        ctx.beginPath();
1284-        ctx.moveTo(-3, shoulderY + 5); ctx.lineTo(3, shoulderY + 5);
1285-        ctx.lineTo(4, hipY - 15); ctx.lineTo(0, hipY - 10); ctx.lineTo(-4, hipY - 15); ctx.fill();
1286-
1287-        // Suit Jacket (if no coat)
1288-        if (!player.equipped.coat) {
1289-            ctx.fillStyle = pantGrad;
1290-            // Left jacket panel
1291-            ctx.beginPath(); ctx.moveTo(-15, shoulderY); ctx.lineTo(-4, shoulderY + 20); ctx.lineTo(-2, hipY); ctx.lineTo(-13, hipY); ctx.fill();
1292-            // Right jacket panel
1293-            ctx.beginPath(); ctx.moveTo(15, shoulderY); ctx.lineTo(4, shoulderY + 20); ctx.lineTo(2, hipY); ctx.lineTo(13, hipY); ctx.fill();
1294-        }
1295-
1296-        // 6. LAB COAT (Outer layer with volume and folds)
1297-        if (player.equipped.coat) {
1298-            const coatLeft = ctx.createLinearGradient(-22, shoulderY, 0, shoulderY);
1299-            coatLeft.addColorStop(0, "#94a3b8"); coatLeft.addColorStop(0.4, "#ffffff"); coatLeft.addColorStop(1, "#e2e8f0");
1300-
1301-            const coatRight = ctx.createLinearGradient(0, shoulderY, 22, shoulderY);
1302-            coatRight.addColorStop(0, "#e2e8f0"); coatRight.addColorStop(0.6, "#ffffff"); coatRight.addColorStop(1, "#94a3b8");
1303-
1304-            // Shadow cast by coat onto the legs
1305-            ctx.fillStyle = "rgba(0,0,0,0.25)";
1306-            ctx.beginPath(); ctx.ellipse(0, hipY + 5, 16, 4, 0, 0, Math.PI*2); ctx.fill();
1307-
1308-            // Left panel
1309-            ctx.fillStyle = coatLeft;
1310-            ctx.beginPath();
1311-            ctx.moveTo(-14, shoulderY);
1312-            ctx.lineTo(-4, shoulderY + 25); // Lapel start
1313-            ctx.lineTo(0, hipY + 55); // Bottom inner edge
1314-            ctx.lineTo(-16, hipY + 50); // Bottom outer edge
1315-            ctx.lineTo(-14, shoulderY); 
1316-            ctx.fill();
1317-
1318-            // Right panel
1319-            ctx.fillStyle = coatRight;
1320-            ctx.beginPath();
1321-            ctx.moveTo(14, shoulderY);
1322-            ctx.lineTo(4, shoulderY + 25); 
1323-            ctx.lineTo(0, hipY + 55); 
1324-            ctx.lineTo(16, hipY + 50); 
1325-            ctx.lineTo(14, shoulderY); 
1326-            ctx.fill();
1327-
1328-            // Coat Lapels (folded collars)
1329-            ctx.fillStyle = "#f8fafc";
1330-            ctx.strokeStyle = "#cbd5e1";
1331-            ctx.lineWidth = 1;
1332-            
1333-            // Left Lapel
1334-            ctx.beginPath(); 
1335-            ctx.moveTo(-10, shoulderY); ctx.lineTo(-2, shoulderY + 28); ctx.lineTo(-13, shoulderY + 18); 
1336-            ctx.closePath(); ctx.fill(); ctx.stroke();
1337-            
1338-            // Right Lapel
1339-            ctx.beginPath(); 
1340-            ctx.moveTo(10, shoulderY); ctx.lineTo(2, shoulderY + 28); ctx.lineTo(13, shoulderY + 18); 
1341-            ctx.closePath(); ctx.fill(); ctx.stroke();
1342-
1343-            // Pockets
1344-            ctx.strokeStyle = "#cbd5e1";
1345-            ctx.lineWidth = 1.5;
1346-            ctx.strokeRect(-20, hipY - 5, 8, 12);
1347-            ctx.strokeRect(12, hipY - 5, 8, 12);
1348-            
1349-            // Buttons
1350-            ctx.fillStyle = "#94a3b8";
1351-            ctx.beginPath(); ctx.arc(-2, shoulderY + 40, 2, 0, Math.PI*2); ctx.fill();
1352-            ctx.beginPath(); ctx.arc(-2, shoulderY + 55, 2, 0, Math.PI*2); ctx.fill();
1353-            ctx.beginPath(); ctx.arc(-2, shoulderY + 70, 2, 0, Math.PI*2); ctx.fill();
1354-            
1355-            // Subtle fabric folds
1356-            ctx.strokeStyle = "rgba(0,0,0,0.05)";
1357-            ctx.beginPath(); ctx.moveTo(-16, hipY); ctx.lineTo(-8, hipY + 35); ctx.stroke();
1358-            ctx.beginPath(); ctx.moveTo(16, hipY); ctx.lineTo(8, hipY + 35); ctx.stroke();
1359-        }
1360-
1361-        // 7. NECK & HEAD
1362-        // Shadow under chin
1363-        ctx.fillStyle = "rgba(0,0,0,0.2)";
1364-        ctx.fillRect(-4, shoulderY - 12, 8, 12);
1365-        
1366-        ctx.fillStyle = skinGrad;
1367-        ctx.fillRect(-3, shoulderY - 12, 6, 12);
1368-
1369-        // Head Base
1370-        ctx.fillStyle = skinGrad;
1371-        ctx.beginPath(); ctx.ellipse(0, shoulderY - 28, 13, 17, 0, 0, Math.PI*2); ctx.fill();
1372-
1373-        // 8. HAIR
1374-        if (!player.equipped.headcover) {
1375-            const hairGrad = ctx.createLinearGradient(0, shoulderY-45, 0, shoulderY-25);
1376-            hairGrad.addColorStop(0, "#020617"); hairGrad.addColorStop(1, "#334155");
1377-            ctx.fillStyle = hairGrad;
1378-            
1379-            ctx.beginPath();
1380-            // Outer dome (top of head)
1381-            ctx.arc(0, shoulderY - 30, 14, Math.PI, 0);
1382-            // Right sideburn outer
1383-            ctx.quadraticCurveTo(15, shoulderY - 20, 14, shoulderY - 15);
1384-            // Right sideburn inner
1385-            ctx.lineTo(12, shoulderY - 28);
1386-            // Forehead hairline (above eyebrows which are at -33)
1387-            ctx.quadraticCurveTo(0, shoulderY - 38, -12, shoulderY - 28);
1388-            // Left sideburn inner
1389-            ctx.lineTo(-14, shoulderY - 15);
1390-            // Left sideburn outer
1391-            ctx.quadraticCurveTo(-15, shoulderY - 20, -14, shoulderY - 30);
1392-            ctx.fill();
1393-            
1394-            // Hair highlight
1395-            ctx.strokeStyle = "rgba(255,255,255,0.15)";
1396-            ctx.lineWidth = 2;
1397-            ctx.beginPath(); ctx.arc(0, shoulderY - 31, 10, Math.PI*1.2, Math.PI*1.8); ctx.stroke();
1398-        }
1399-
1400-        // 9. PROTECTIVE GEAR (HEAD)
1401-        if (player.equipped.headcover) {
1402-            const capGrad = ctx.createRadialGradient(0, shoulderY-40, 2, 0, shoulderY-40, 20);
1403-            capGrad.addColorStop(0, "#bae6fd"); capGrad.addColorStop(1, "#0284c7");
1404-            ctx.fillStyle = capGrad; 
1405-            ctx.beginPath(); ctx.ellipse(0, shoulderY - 38, 16, 13, 0, 0, Math.PI*2); ctx.fill();
1406-            
1407-            // Elastic band wrinkles
1408-            ctx.strokeStyle = "rgba(2, 132, 199, 0.5)";
1409-            ctx.lineWidth = 1;
1410-            for(let i=-12; i<=12; i+=4) {
1411-                ctx.beginPath(); ctx.moveTo(i, shoulderY - 26); ctx.lineTo(i + 2, shoulderY - 32); ctx.stroke();
1412-            }
1413-        }
1414-
1415-        if (player.equipped.goggles) {
1416-            const goggleGrad = ctx.createLinearGradient(-12, shoulderY - 32, 12, shoulderY - 20);
1417-            goggleGrad.addColorStop(0, "rgba(186, 230, 253, 0.7)");
1418-            goggleGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)"); // Sharp glare
1419-            goggleGrad.addColorStop(1, "rgba(14, 165, 233, 0.7)");
1420-            
1421-            ctx.fillStyle = goggleGrad; 
1422-            ctx.strokeStyle = "#0284c7"; 
1423-            ctx.lineWidth = 2;
1424-            
1425-            // Left lens
1426-            ctx.beginPath(); ctx.roundRect(-13, shoulderY - 34, 12, 11, 4); ctx.fill(); ctx.stroke();
1427-            // Right lens
1428-            ctx.beginPath(); ctx.roundRect(1, shoulderY - 34, 12, 11, 4); ctx.fill(); ctx.stroke();
1429-            // Bridge
1430-            ctx.beginPath(); ctx.moveTo(-1, shoulderY - 29); ctx.lineTo(1, shoulderY - 29); ctx.stroke();
1431-            // Strap
1432-            ctx.lineWidth = 3;
1433-            ctx.strokeStyle = "#334155";
1434-            ctx.beginPath(); ctx.moveTo(-13, shoulderY - 29); ctx.lineTo(-15, shoulderY - 29); ctx.stroke();
1435-            ctx.beginPath(); ctx.moveTo(13, shoulderY - 29); ctx.lineTo(15, shoulderY - 29); ctx.stroke();
1436-        } else {
1437-            // Eyes
1438-            ctx.fillStyle = "#0f172a"; 
1439-            ctx.beginPath(); ctx.ellipse(-5, shoulderY - 29, 2, 2.5, 0, 0, Math.PI*2); ctx.fill();
1440-            ctx.beginPath(); ctx.ellipse(5, shoulderY - 29, 2, 2.5, 0, 0, Math.PI*2); ctx.fill();
1441-            // Eyebrows
1442-            ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5;
1443-            ctx.beginPath(); ctx.moveTo(-8, shoulderY - 33); ctx.lineTo(-3, shoulderY - 32); ctx.stroke();
1444-            ctx.beginPath(); ctx.moveTo(8, shoulderY - 33); ctx.lineTo(3, shoulderY - 32); ctx.stroke();
1445-        }
1446-
1447-        if (player.equipped.mask) {
1448-            const maskGrad = ctx.createLinearGradient(0, shoulderY - 18, 0, shoulderY - 8);
1449-            maskGrad.addColorStop(0, "#ffffff"); maskGrad.addColorStop(1, "#cbd5e1");
1450-            ctx.fillStyle = maskGrad; 
1451-            ctx.strokeStyle = "#94a3b8"; 
1452-            ctx.lineWidth = 1;
1453-            
1454-            // Mask Body
1455-            ctx.beginPath(); 
1456-            ctx.moveTo(-8, shoulderY - 18); ctx.lineTo(8, shoulderY - 18); 
1457-            ctx.lineTo(6, shoulderY - 6); ctx.lineTo(-6, shoulderY - 6); 
1458-            ctx.closePath(); ctx.fill(); ctx.stroke();
1459-            
1460-            // Mask folds
1461-            ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
1462-            ctx.beginPath(); ctx.moveTo(-7, shoulderY - 14); ctx.lineTo(7, shoulderY - 14); ctx.stroke();
1463-            ctx.beginPath(); ctx.moveTo(-6, shoulderY - 10); ctx.lineTo(6, shoulderY - 10); ctx.stroke();
1464-
1465-            // Straps
1466-            ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2;
1467-            ctx.beginPath(); ctx.moveTo(-8, shoulderY - 17); ctx.lineTo(-14, shoulderY - 22); ctx.stroke();
1468-            ctx.beginPath(); ctx.moveTo(8, shoulderY - 17); ctx.lineTo(14, shoulderY - 22); ctx.stroke();
1469-        } else {
1470-            // Nose and Mouth
1471-            ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1.5;
1472-            ctx.beginPath(); ctx.moveTo(0, shoulderY - 24); ctx.lineTo(0, shoulderY - 19); ctx.stroke();
1473-            ctx.strokeStyle = "#991b1b"; ctx.lineWidth = 1;
1474-            ctx.beginPath(); ctx.moveTo(-3, shoulderY - 14); ctx.quadraticCurveTo(0, shoulderY - 12, 3, shoulderY - 14); ctx.stroke();
1475-        }
1476-    } else {
1477-        // --- SIDE VIEW (Moving) ---
1478-        // Apply horizontal flip for direction
1479-        const scaleX = Math.abs(player.turn) < 0.1 ? 0.1 * Math.sign(player.turn || 1) : player.turn;
1480-        ctx.scale(scaleX, 1);
1481-        
1482-        const cycle = t % (Math.PI * 2);
1483-        const swing1 = Math.sin(cycle);          // Right leg, left arm
1484-        const swing2 = Math.sin(cycle + Math.PI); // Left leg, right arm
1485-        
1486-        const lLegA1 = swing2 * 0.5;
1487-        const lLegBend = Math.max(0, Math.sin(cycle + Math.PI + 0.5)) * 1.0;
1488-        const lLegA2 = lLegA1 - lLegBend;
1489-        
1490-        const rLegA1 = swing1 * 0.5;
1491-        const rLegBend = Math.max(0, Math.sin(cycle + 0.5)) * 1.0;
1492-        const rLegA2 = rLegA1 - rLegBend;
1493-        
1494-        const lArmA1 = swing1 * 0.4;
1495-        const lArmBend = Math.max(0, Math.sin(cycle + Math.PI)) * 0.5;
1496-        const lArmA2 = lArmA1 + 0.2 + lArmBend;
1497-        
1498-        const rArmA1 = swing2 * 0.4;
1499-        const rArmBend = Math.max(0, Math.sin(cycle)) * 0.5;
1500-        const rArmA2 = rArmA1 + 0.2 + rArmBend;
1501-
1502-        // Left leg
1503-        const lFoot = drawLimb(ctx, 0, hipY, 40, 45, lLegA1, lLegA2, 16, 12, suitColor);
1504-        ctx.fillStyle = player.equipped.shoes ? "#1e293b" : shoeColor; 
1505-        ctx.beginPath(); ctx.ellipse(lFoot.ex + 5, lFoot.ey, 12, 6, 0, 0, Math.PI*2); ctx.fill();
1506-
1507-        // Left Arm
1508-        const lArmColor = player.equipped.coat ? "#f8fafc" : suitColor;
1509-        const lHand = drawLimb(ctx, 0, shoulderY, 35, 35, lArmA1, lArmA2, 12, 10, lArmColor);
1510-        ctx.fillStyle = player.equipped.gloves ? "#60a5fa" : skin;
1511-        ctx.beginPath(); ctx.arc(lHand.ex, lHand.ey, 6, 0, Math.PI*2); ctx.fill();
1512-
1513-        // Torso
1514-        ctx.fillStyle = suitColor;
1515-        ctx.beginPath();
1516-        ctx.moveTo(-8, shoulderY - 5); ctx.lineTo(10, shoulderY - 5); 
1517-        ctx.lineTo(8, hipY); ctx.lineTo(-8, hipY); ctx.fill();
1518-        
1519-        // Right leg (Foreground, under coat)
1520-        const rFoot = drawLimb(ctx, 0, hipY, 40, 45, rLegA1, rLegA2, 16, 12, suitColor);
1521-        ctx.fillStyle = player.equipped.shoes ? "#1e293b" : shoeColor;
1522-        ctx.beginPath(); ctx.ellipse(rFoot.ex + 5, rFoot.ey, 12, 6, 0, 0, Math.PI*2); ctx.fill();
1523-
1524-        if (!player.equipped.coat) {
1525-            ctx.fillStyle = "#ffffff";
1526-            ctx.beginPath(); ctx.moveTo(0, shoulderY - 5); ctx.lineTo(10, shoulderY - 5); ctx.lineTo(5, shoulderY + 15); ctx.fill();
1527-            ctx.strokeStyle = tieColor; ctx.lineWidth = 3;
1528-            ctx.beginPath(); ctx.moveTo(5, shoulderY - 3); ctx.lineTo(2, shoulderY + 20); ctx.stroke();
1529-        }
1530-
1531-        if (player.equipped.coat) {
1532-            const coatSwing = (player.moving ? swing1 * 10 : 0);
1533-            ctx.fillStyle = "#f8fafc";
1534-            ctx.beginPath();
1535-            ctx.moveTo(-10, shoulderY - 8); ctx.lineTo(12, shoulderY - 8);
1536-            ctx.lineTo(15 + coatSwing, hipY); ctx.lineTo(12 + coatSwing, hipY + 50);
1537-            ctx.lineTo(-15 + coatSwing, hipY + 45); ctx.lineTo(-12 + coatSwing, hipY); ctx.fill();
1538-            ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2;
1539-            ctx.beginPath(); ctx.moveTo(5, shoulderY - 8); ctx.lineTo(0 + coatSwing*0.5, shoulderY + 20); ctx.stroke();
1540-        }
1541-
1542-        // Head & Face
1543-        ctx.fillStyle = skin;
1544-        ctx.fillRect(-3, shoulderY - 12, 8, 12);
1545-        ctx.beginPath(); ctx.ellipse(3, shoulderY - 25, 12, 16, 0, 0, Math.PI*2); ctx.fill();
1546-        ctx.beginPath(); ctx.moveTo(10, shoulderY - 25); ctx.lineTo(17, shoulderY - 22); ctx.lineTo(12, shoulderY - 18); ctx.fill();
1547-        
1548-        if (!player.equipped.headcover) {
1549-            ctx.fillStyle = "#0f172a";
1550-            ctx.beginPath();
1551-            ctx.moveTo(8, shoulderY - 35); ctx.quadraticCurveTo(10, shoulderY - 45, 0, shoulderY - 42);
1552-            ctx.quadraticCurveTo(-15, shoulderY - 42, -10, shoulderY - 25);
1553-            ctx.lineTo(-10, shoulderY - 15); ctx.lineTo(-5, shoulderY - 15); ctx.fill();
1554-        }
1555-
1556-        if (player.equipped.headcover) {
1557-            ctx.fillStyle = "#38bdf8"; 
1558-            ctx.beginPath(); ctx.ellipse(2, shoulderY - 38, 15, 11, 0, 0, Math.PI*2); ctx.fill();
1559-            ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1;
1560-            ctx.beginPath(); ctx.ellipse(2, shoulderY - 38, 14, 10, 0, Math.PI/2, Math.PI*1.5); ctx.stroke();
1561-        }
1562-
1563-        if (player.equipped.goggles) {
1564-            ctx.fillStyle = "rgba(186, 230, 253, 0.7)"; ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 2;
1565-            ctx.beginPath(); ctx.roundRect(5, shoulderY - 30, 12, 10, 3); ctx.fill(); ctx.stroke();
1566-            ctx.beginPath(); ctx.moveTo(5, shoulderY - 25); ctx.lineTo(-10, shoulderY - 25); ctx.stroke();
1567-        } else {
1568-            ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(8, shoulderY - 26, 1.5, 0, Math.PI*2); ctx.fill();
1569-        }
1570-
1571-        if (player.equipped.mask) {
1572-            ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
1573-            ctx.beginPath(); ctx.moveTo(8, shoulderY - 18); ctx.lineTo(15, shoulderY - 16); ctx.lineTo(13, shoulderY - 8); ctx.lineTo(2, shoulderY - 10); ctx.closePath(); ctx.fill(); ctx.stroke();
1574-            ctx.strokeStyle = "#e2e8f0"; ctx.beginPath(); ctx.moveTo(8, shoulderY - 18); ctx.lineTo(-2, shoulderY - 20); ctx.stroke();
1575-        } else {
1576-            ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.moveTo(12, shoulderY - 14); ctx.lineTo(15, shoulderY - 14); ctx.stroke();
1577-        }
1578-
1579-        
1580-
1581-        const rArmColor = player.equipped.coat ? "#f1f5f9" : suitColor;
1582-        const rHand = drawLimb(ctx, 0, shoulderY, 35, 35, rArmA1, rArmA2, 12, 10, rArmColor);
1583-        ctx.fillStyle = player.equipped.gloves ? "#60a5fa" : skin;
1584-        ctx.beginPath(); ctx.arc(rHand.ex, rHand.ey, 6, 0, Math.PI*2); ctx.fill();
1585-    }
1586-    
1587-    ctx.restore();
1588-}
1589-            function startStage1CanvasGame(onComplete) {
1590-              const canvas = document.getElementById("stage1-canvas");
1591-              const ctx = canvas.getContext("2d");
1592-              let lastTime = performance.now();
1593-              let interactables = [
1594-                  { id: "headcover", name: "MŨ TRÙM ĐẦU", ox: window.innerWidth/2 - 412, oy: window.innerHeight - 468, w: 90, h: 60 },
1595-                  { id: "goggles", name: "KÍNH BẢO HỘ", ox: window.innerWidth/2 - 145, oy: window.innerHeight - 468, w: 90, h: 60 },
1596-                  { id: "gloves", name: "GĂNG TAY", ox: window.innerWidth/2 + 122, oy: window.innerHeight - 468, w: 90, h: 60 },
1597-                  { id: "mask", name: "KHẨU TRANG", ox: window.innerWidth/2 - 412, oy: window.innerHeight - 343, w: 90, h: 60 },
1598-                  { id: "shoes", name: "GIÀY BẢO HỘ", ox: window.innerWidth/2 + 122, oy: window.innerHeight - 343, w: 140, h: 60 },
1599-                  { id: "coat", name: "ÁO KHOÁC", ox: window.innerWidth/2 + 390, oy: window.innerHeight - 480, w: 120, h: 290 },
1600-                  { id: "slippers", name: "DÉP LÊ", ox: window.innerWidth/2 - 145, oy: window.innerHeight - 343, w: 90, h: 60 }
1601-              ];
1602-              
1603-              function mousedownHandler(e) {
1604-                  if (e.button === 2) {
1605-                      player.targetX = e.clientX;
1606-                      player.targetY = e.clientY;
1607-                      player.moving = true;
1608-                      player.direction = e.clientX > player.x ? 1 : -1;
1609-                  } else if (e.button === 0) {
1610-                      for(let i=0; i<interactables.length; i++) {
1611-                          const item = interactables[i];
1612-                          if(e.clientX > item.ox && e.clientX < item.ox + item.w && 
1613-                             e.clientY > item.oy && e.clientY < item.oy + item.h) {
1614-                              draggingItem = item;
1615-                              draggingItem.x = e.clientX - item.w/2;
1616-                              draggingItem.y = e.clientY - item.h/2;
1617-                              break;
1618-                          }
1619-                      }
1620-                  }
1621-              }
1622-              function mousemoveHandler(e) {
1623-                  if (draggingItem) {
1624-                      draggingItem.x = e.clientX - draggingItem.w/2;
1625-                      draggingItem.y = e.clientY - draggingItem.h/2;
1626-                  }
1627-              }
1628-              function mouseupHandler(e) {
1629-                  if (draggingItem) {
1630-                      if (e.clientX > player.x - 80 && e.clientX < player.x + 80 && e.clientY > player.y - 400 && e.clientY < player.y + 50) {
1631-                          if (draggingItem.id === "slippers") {
1632-                              if (typeof playError === 'function') playError();
1633-                              if (typeof deductScore === 'function') deductScore(10, "Lỗi: Không được mang dép lê trong phòng thí nghiệm!");
1634-                              
1635-
1636-                          } else {
1637-                              player.equipped[draggingItem.id] = true;
1638-                              if (typeof playClick === 'function') playClick();
1639-                              if (Object.keys(player.equipped).filter(k => k !== 'slippers').every(k => player.equipped[k]) && !player.stage1Done) {
1640-                                  player.stage1Done = true;
1641-                                  setTimeout(() => { cleanup(); onComplete(); }, 3000);
1642-                              }
1643-                          }
1644-                      }
1645-                      draggingItem = null;
1646-                  }
1647-              }
1648-              canvas.addEventListener("mousedown", mousedownHandler);
1649-              canvas.addEventListener("mousemove", mousemoveHandler);
1650-              canvas.addEventListener("mouseup", mouseupHandler);
1651-              canvas.addEventListener("contextmenu", e => { e.preventDefault(); return false; });
1652-              
1653-              function cleanup() {
1654-                  cancelAnimationFrame(stage1LoopId);
1655-                  canvas.removeEventListener("mousedown", mousedownHandler);
1656-                  canvas.removeEventListener("mousemove", mousemoveHandler);
1657-                  canvas.removeEventListener("mouseup", mouseupHandler);
1658-              }
1659-              
1660-              function update(deltaTime) {
1661-                  if (player.moving) {
1662-                      player.animTime += 0.2;
1663-                      let dx = player.targetX - player.x;
1664-                      let dy = player.targetY - player.y;
1665-                      let dist = Math.hypot(dx, dy);
1666-                      if (dist > player.speed) {
1667-                          player.x += (dx / dist) * player.speed;
1668-                          player.y += (dy / dist) * player.speed;
1669-                      } else {
1670-                          player.x = player.targetX;
1671-                          player.y = player.targetY;
1672-                          player.moving = false;
1673-                          player.animTime = 0;
1674-                      }
1675-                  }
1676-              }
1677-
1678-              function resize() {
1679-                  canvas.width = window.innerWidth;
1680-                  canvas.height = window.innerHeight;
1681-                  const cx = window.innerWidth/2;
1682-                  const cy = window.innerHeight;
1683-                  interactables[0].ox = cx - 412; interactables[0].oy = cy - 468;
1684-                  interactables[1].ox = cx - 145; interactables[1].oy = cy - 468;
1685-                  interactables[2].ox = cx + 122; interactables[2].oy = cy - 468;
1686-                  interactables[3].ox = cx - 412; interactables[3].oy = cy - 343;
1687-                  interactables[4].ox = cx + 122; interactables[4].oy = cy - 343;
1688-                  interactables[5].ox = cx + 390; interactables[5].oy = cy - 480;
1689-                  interactables[6].ox = cx - 145; interactables[6].oy = cy - 343;
1690-                  if (!player.moving) {
1691-                      player.y = cy - 100;
1692-                      player.targetY = cy - 100;
1693-                  }
1694-              }
1695-              window.addEventListener("resize", resize);
1696-              resize();
1697-
1698-              function drawItems(ctx) {
1699-                  interactables.forEach(item => {
1700-                      const isEquipped = player.equipped[item.id];
1701-                      const maxCount = (item.id === "coat") ? 1 : 3;
1702-                      const shelfCount = isEquipped ? (maxCount - 1) : maxCount;
1703-                      const isDragging = (draggingItem === item);
1704-
1705-                      // 1. Draw items on shelf / rack
1706-                      for(let copy = 0; copy < shelfCount; copy++) {
1707-                          if (isDragging && copy === 0) continue;
1708-                          ctx.save();
1709-                          ctx.translate(item.ox, item.oy);
1710-                          if(copy > 0) {
1711-                              if(item.id === "headcover") ctx.translate(0, -10 * copy);
1712-                              else if(item.id === "goggles") ctx.translate(15 * copy, -5 * copy);
1713-                              else if(item.id === "gloves") ctx.translate(0, -15 * copy); 
1714-                              else if(item.id === "mask") ctx.translate(0, -8 * copy);
1715-                              else if(item.id === "shoes" || item.id === "slippers") ctx.translate(30 * copy, 0); 
1716-                          }
1717-                          drawSingleItem(ctx, item.id, copy);
1718-                          ctx.restore();
1719-                      }
1720-
1721-                      // 2. Draw label under the shelf (only if not empty)
1722-                      if (shelfCount > 0) {
1723-                          ctx.save();
1724-                          ctx.translate(item.ox, item.oy);
1725-                          ctx.fillStyle = "rgba(255,255,255,0.85)";
1726-                          ctx.fillRect(item.w/2 - 45, item.h + 8, 90, 24);
1727-                          ctx.strokeStyle = "rgba(148,163,184,0.3)"; ctx.strokeRect(item.w/2 - 45, item.h + 8, 90, 24);
1728-                          ctx.fillStyle = "#0f172a"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
1729-                          ctx.fillText(item.name, item.w/2, item.h + 24);
1730-                          ctx.restore();
1731-                      }
1732-                  });
1733-              }
1734-
1735-              function drawDraggedItem(ctx) {
1736-                  if (draggingItem) {
1737-                      ctx.save();
1738-                      ctx.translate(draggingItem.x, draggingItem.y);
1739-                      ctx.shadowColor = "rgba(0,0,0,0.4)";
1740-                      ctx.shadowBlur = 15;
1741-                      ctx.shadowOffsetY = 10;
1742-                      ctx.scale(1.05, 1.05);
1743-                      drawSingleItem(ctx, draggingItem.id, 0);
1744-                      ctx.restore();
1745-                  }
1746-              }
1747-
1748-
1749-              function drawSingleItem(ctx, id, copyIndex) {
1750-                  if (id === "headcover") {
1751-                      const w = 90, h = 60;
1752-                      const capG = ctx.createRadialGradient(w/2, h/2 - 10, 5, w/2, h/2, 40);
1753-                      capG.addColorStop(0, "#ffffff");
1754-                      capG.addColorStop(0.8, "#f1f5f9");
1755-                      capG.addColorStop(1, "#cbd5e1");
1756-                      ctx.fillStyle = capG;
1757-                      ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 4;
1758-                      ctx.beginPath();
1759-                      ctx.ellipse(w/2, h/2, 40, 25, 0, 0, Math.PI*2);
1760-                      ctx.fill();
1761-                      ctx.shadowColor = "transparent";
1762-
1763-                      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
1764-                      ctx.beginPath(); ctx.ellipse(w/2, h/2 + 20, 35, 5, 0, 0, Math.PI*2); ctx.stroke();
1765-
1766-                      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; ctx.lineWidth = 1.5;
1767-                      for(let i=0; i<9; i++) {
1768-                          ctx.beginPath();
1769-                          let x1 = w/2 - 32 + i*8;
1770-                          ctx.moveTo(x1, h/2 - 20 + Math.abs(i-4)*2);
1771-                          ctx.quadraticCurveTo(x1 + (Math.random()*10 - 5), h/2, x1 - (Math.random()*6), h/2 + 20);
1772-                          ctx.stroke();
1773-                      }
1774-                  } else if (id === "goggles") {
1775-                      const w = 100;
1776-                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
1777-                      const lensG = ctx.createLinearGradient(0, 0, 0, 50);
1778-                      lensG.addColorStop(0, "rgba(255,255,255,0.95)");
1779-                      lensG.addColorStop(0.4, "rgba(224, 242, 254, 0.3)"); 
1780-                      lensG.addColorStop(1, "rgba(255,255,255,0.5)");
1781-                      ctx.fillStyle = lensG;
1782-                      ctx.beginPath();
1783-                      ctx.moveTo(10, 20);
1784-                      ctx.quadraticCurveTo(w/2, 35, w-10, 20);
1785-                      ctx.quadraticCurveTo(w-5, 60, w/2, 55);
1786-                      ctx.quadraticCurveTo(5, 60, 10, 20);
1787-                      ctx.fill();
1788-                      ctx.shadowColor = "transparent";
1789-
1790-                      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3; ctx.stroke();
1791-                      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)"; ctx.lineWidth = 1; ctx.stroke();
1792-
1793-                      ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
1794-                      ctx.beginPath(); ctx.moveTo(10, 20); ctx.quadraticCurveTo(w/2, 35, w-10, 20); ctx.stroke();
1795-
1796-                      ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 6;
1797-                      ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(0, -5); ctx.stroke();
1798-                      ctx.beginPath(); ctx.moveTo(w-10, 20); ctx.lineTo(w, -5); ctx.stroke();
1799-
1800-                      ctx.fillStyle = "rgba(255,255,255,0.95)";
1801-                      ctx.beginPath(); ctx.ellipse(25, 32, 10, 4, Math.PI/5, 0, Math.PI*2); ctx.fill();
1802-                      ctx.beginPath(); ctx.ellipse(w - 30, 30, 6, 2, -Math.PI/6, 0, Math.PI*2); ctx.fill();
1803-                  } else if (id === "gloves") {
1804-                      if (copyIndex > 0) { // Khi copyIndex > 0, vẽ hộp găng tay trên kệ
1805-                          const boxW = 80; const boxH = 40;
1806-                          ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
1807-                          ctx.fillStyle = "#eff6ff"; 
1808-                          ctx.fillRect(10, 10, boxW, boxH);
1809-                          ctx.shadowColor = "transparent";
1810-                          ctx.fillStyle = "#3b82f6"; 
1811-                          ctx.fillRect(10, 10, boxW, 10);
1812-                          ctx.fillStyle = "#bfdbfe"; 
1813-                          ctx.beginPath(); ctx.ellipse(10 + boxW/2, 10 + boxH/2, 25, 10, 0, 0, Math.PI*2); ctx.fill();
1814-                      } else { // Vẽ găng tay chi tiết
1815-                          ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 4;
1816-                          ctx.fillStyle = "#3b82f6"; 
1817-                          ctx.beginPath();
1818-                          ctx.moveTo(25, 80); ctx.lineTo(50, 75); 
1819-                          ctx.lineTo(55, 45); 
1820-                          ctx.lineTo(80, 50); ctx.arc(80, 45, 5, Math.PI/2, -Math.PI/2); ctx.lineTo(60, 30); 
1821-                          ctx.lineTo(65, 10); ctx.arc(60, 10, 5, 0, Math.PI, true); ctx.lineTo(50, 25); 
1822-                          ctx.lineTo(50, 5); ctx.arc(45, 5, 5, 0, Math.PI, true); ctx.lineTo(40, 25); 
1823-                          ctx.lineTo(35, 10); ctx.arc(30, 10, 5, 0, Math.PI, true); ctx.lineTo(30, 30); 
1824-                          ctx.lineTo(22, 20); ctx.arc(17, 20, 4, 0, Math.PI, true); ctx.lineTo(20, 40); 
1825-                          ctx.lineTo(25, 80);
1826-                          ctx.fill();
1827-                          ctx.shadowColor = "transparent";
1828-                          
1829-                          ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2.5;
1830-                          ctx.beginPath(); ctx.moveTo(32, 70); ctx.lineTo(32, 35); ctx.stroke();
1831-                          ctx.beginPath(); ctx.moveTo(42, 65); ctx.lineTo(50, 40); ctx.stroke();
1832-                          ctx.strokeStyle = "#1e3a8a"; ctx.lineWidth = 3;
1833-                          ctx.beginPath(); ctx.moveTo(24, 80); ctx.quadraticCurveTo(38, 85, 51, 75); ctx.stroke();
1834-                          
1835-                          ctx.fillStyle = "#0ea5e9";
1836-                          ctx.beginPath();
1837-                          ctx.moveTo(70, 75); ctx.lineTo(45, 85); 
1838-                          ctx.lineTo(40, 55); 
1839-                          ctx.lineTo(20, 65); ctx.arc(20, 60, 5, Math.PI/2, -Math.PI/2); ctx.lineTo(35, 40);
1840-                          ctx.lineTo(30, 20); ctx.arc(35, 20, 5, Math.PI, 0); ctx.lineTo(45, 35);
1841-                          ctx.lineTo(45, 15); ctx.arc(50, 15, 5, Math.PI, 0); ctx.lineTo(55, 35);
1842-                          ctx.lineTo(60, 20); ctx.arc(65, 20, 5, Math.PI, 0); ctx.lineTo(65, 40);
1843-                          ctx.lineTo(75, 30); ctx.arc(80, 30, 4, Math.PI, 0); ctx.lineTo(75, 50);
1844-                          ctx.lineTo(70, 75);
1845-                          ctx.fill();
1846-                          ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2.5;
1847-                          ctx.beginPath(); ctx.moveTo(60, 65); ctx.lineTo(60, 40); ctx.stroke();
1848-                          ctx.beginPath(); ctx.moveTo(50, 70); ctx.lineTo(45, 45); ctx.stroke();
1849-                          ctx.strokeStyle = "#075985"; ctx.lineWidth = 3;
1850-                          ctx.beginPath(); ctx.moveTo(71, 75); ctx.quadraticCurveTo(58, 85, 44, 85); ctx.stroke();
1851-                      }
1852-                  } else if (id === "mask") {
1853-                      ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 4;
1854-                      const maskG = ctx.createLinearGradient(10, 20, 10, 70);
1855-                      maskG.addColorStop(0, "#bae6fd"); maskG.addColorStop(1, "#38bdf8");
1856-                      ctx.fillStyle = maskG;
1857-                      ctx.beginPath(); ctx.roundRect(20, 20, 80, 50, 4); ctx.fill();
1858-                      ctx.shadowColor = "transparent";
1859-                      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5;
1860-                      ctx.strokeRect(20, 20, 80, 50);
1861-                      ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1;
1862-                      for(let py=32; py<=55; py+=11) {
1863-                          ctx.beginPath(); ctx.moveTo(22, py); ctx.lineTo(98, py); ctx.stroke();
1864-                          ctx.fillStyle = "rgba(0,0,0,0.06)"; ctx.fillRect(22, py, 76, 4);
1865-                      }
1866-                      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3.5;
1867-                      ctx.beginPath(); ctx.moveTo(40, 22); ctx.lineTo(80, 22); ctx.stroke();
1868-                      ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 2.5;
1869-                      ctx.beginPath(); ctx.moveTo(20, 30); ctx.bezierCurveTo(-5, 20, -5, 70, 20, 60); ctx.stroke();
1870-                      ctx.beginPath(); ctx.moveTo(100, 30); ctx.bezierCurveTo(125, 20, 125, 70, 100, 60); ctx.stroke();
1871-                  } else if (id === "shoes") {
1872-                      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 6;
1873-                      const shoeG = ctx.createLinearGradient(10, 30, 10, 70);
1874-                      shoeG.addColorStop(0, "#334155"); shoeG.addColorStop(1, "#0f172a");
1875-                      
1876-                      // Left shoe
1877-                      ctx.fillStyle = shoeG;
1878-                      ctx.beginPath();
1879-                      ctx.moveTo(10, 60); ctx.quadraticCurveTo(10, 30, 35, 25); 
1880-                      ctx.lineTo(55, 25); ctx.quadraticCurveTo(75, 35, 75, 60); 
1881-                      ctx.fill();
1882-                      ctx.shadowColor = "transparent";
1883-                      ctx.fillStyle = "#020617";
1884-                      ctx.beginPath(); ctx.roundRect(8, 60, 68, 12, 5); ctx.fill();
1885-                      ctx.fillStyle = "#000000";
1886-                      ctx.beginPath(); ctx.arc(45, 45, 3.5, 0, Math.PI*2); ctx.fill();
1887-                      ctx.beginPath(); ctx.arc(58, 48, 3.5, 0, Math.PI*2); ctx.fill();
1888-                      ctx.beginPath(); ctx.arc(52, 55, 3.5, 0, Math.PI*2); ctx.fill();
1889-                      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 4;
1890-                      ctx.beginPath(); ctx.moveTo(15, 60); ctx.quadraticCurveTo(10, 45, 30, 35); ctx.stroke();
1891-                      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
1892-                      ctx.beginPath(); ctx.moveTo(35, 27); ctx.quadraticCurveTo(55, 27, 65, 45); ctx.stroke();
1893-
1894-                      // Right shoe
1895-                      ctx.shadowColor = "rgba(0,0,0,0.3)";
1896-                      ctx.fillStyle = shoeG;
1897-                      ctx.beginPath();
1898-                      ctx.moveTo(80, 60); ctx.quadraticCurveTo(80, 30, 105, 25);
1899-                      ctx.lineTo(125, 25); ctx.quadraticCurveTo(145, 35, 145, 60);
1900-                      ctx.fill();
1901-                      ctx.shadowColor = "transparent";
1902-                      ctx.fillStyle = "#020617";
1903-                      ctx.beginPath(); ctx.roundRect(78, 60, 68, 12, 5); ctx.fill();
1904-                      ctx.fillStyle = "#000000";
1905-                      ctx.beginPath(); ctx.arc(115, 45, 3.5, 0, Math.PI*2); ctx.fill();
1906-                      ctx.beginPath(); ctx.arc(128, 48, 3.5, 0, Math.PI*2); ctx.fill();
1907-                      ctx.beginPath(); ctx.arc(122, 55, 3.5, 0, Math.PI*2); ctx.fill();
1908-                      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 4;
1909-                      ctx.beginPath(); ctx.moveTo(85, 60); ctx.quadraticCurveTo(80, 45, 100, 35); ctx.stroke();
1910-                      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
1911-                      ctx.beginPath(); ctx.moveTo(105, 27); ctx.quadraticCurveTo(125, 27, 135, 45); ctx.stroke();
1912-                  } else if (id === "coat") {
1913-                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
1914-                      const coatG = ctx.createLinearGradient(0, 40, 120, 40);
1915-                      coatG.addColorStop(0, "#e2e8f0"); 
1916-                      coatG.addColorStop(0.2, "#ffffff"); 
1917-                      coatG.addColorStop(0.5, "#f8fafc");
1918-                      coatG.addColorStop(0.8, "#ffffff"); 
1919-                      coatG.addColorStop(1, "#cbd5e1"); 
1920-                      
1921-                      ctx.fillStyle = coatG;
1922-                      ctx.beginPath();
1923-                      ctx.moveTo(40, 35); ctx.lineTo(80, 35); 
1924-                      ctx.lineTo(120, 65); ctx.lineTo(115, 160); 
1925-                      ctx.lineTo(85, 145); ctx.lineTo(95, 290); 
1926-                      ctx.lineTo(25, 290); ctx.lineTo(35, 145); 
1927-                      ctx.lineTo(5, 160); ctx.lineTo(0, 65); 
1928-                      ctx.closePath();
1929-                      ctx.fill();
1930-                      ctx.shadowColor = "transparent";
1931-
1932-                      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; ctx.lineWidth = 2.5;
1933-                      ctx.beginPath(); ctx.moveTo(35, 145); ctx.quadraticCurveTo(55, 220, 40, 280); ctx.stroke(); 
1934-                      ctx.beginPath(); ctx.moveTo(85, 145); ctx.quadraticCurveTo(65, 220, 80, 280); ctx.stroke(); 
1935-                      ctx.beginPath(); ctx.moveTo(25, 75); ctx.lineTo(30, 130); ctx.stroke(); 
1936-                      ctx.beginPath(); ctx.moveTo(95, 75); ctx.lineTo(90, 130); ctx.stroke(); 
1937-
1938-                      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
1939-                      ctx.beginPath(); ctx.moveTo(40, 35); ctx.lineTo(60, 95); ctx.lineTo(80, 35); ctx.stroke(); 
1940-                      ctx.beginPath(); ctx.moveTo(60, 95); ctx.lineTo(60, 290); ctx.stroke(); 
1941-                      
1942-                      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
1943-                      for(let by=120; by<=250; by+=40) {
1944-                          ctx.beginPath(); ctx.arc(55, by, 4.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
1945-                          ctx.fillStyle = "#94a3b8";
1946-                          ctx.fillRect(53.5, by-1, 1, 2); ctx.fillRect(56.5, by-1, 1, 2);
1947-                          ctx.fillStyle = "#ffffff";
1948-                      }
1949-
1950-                      ctx.strokeStyle = "rgba(148, 163, 184, 0.7)"; ctx.lineWidth = 1.5;
1951-                      ctx.strokeRect(30, 190, 24, 28); 
1952-                      ctx.strokeRect(66, 190, 24, 28); 
1953-                      ctx.strokeRect(68, 110, 18, 22); 
1954-
1955-                      ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
1956-                      ctx.beginPath(); ctx.moveTo(60, 35); ctx.lineTo(60, 15); ctx.stroke(); 
1957-                      ctx.beginPath(); ctx.arc(60, 10, 6, Math.PI, Math.PI*2.5); ctx.stroke();
1958-                   } else if (id === "slippers") {
1959-                       ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 4;
1960-                       const slipG = ctx.createLinearGradient(0, 30, 0, 70);
1961-                       slipG.addColorStop(0, "#ef4444"); slipG.addColorStop(1, "#991b1b");
1962-                       // Left
1963-                       ctx.fillStyle = slipG;
1964-                       ctx.beginPath(); ctx.ellipse(25, 45, 12, 22, -Math.PI/12, 0, Math.PI*2); ctx.fill();
1965-                       ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.ellipse(25, 40, 10, 12, -Math.PI/12, 0, Math.PI*2); ctx.fill();
1966-                       ctx.fillStyle = "#ffffff"; ctx.fillRect(15, 30, 20, 12);
1967-                       // Right
1968-                       ctx.fillStyle = slipG;
1969-                       ctx.beginPath(); ctx.ellipse(65, 45, 12, 22, Math.PI/12, 0, Math.PI*2); ctx.fill();
1970-                       ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.ellipse(65, 40, 10, 12, Math.PI/12, 0, Math.PI*2); ctx.fill();
1971-                       ctx.fillStyle = "#ffffff"; ctx.fillRect(55, 30, 20, 12);
1972-                       ctx.shadowColor = "transparent";
1973- 
1974-                  }
1975-              }
1976-
1977-
1978-              function draw(time) {
1979-                  const deltaTime = time - lastTime;
1980-                  lastTime = time;
1981-                  ctx.clearRect(0, 0, canvas.width, canvas.height);
1982-                  drawRoom(ctx, canvas.width, canvas.height);
1983-                  update(deltaTime);
1984-                  drawItems(ctx);
1985-                  drawPlayer(ctx);
1986-                  drawDraggedItem(ctx);
1987-                  
1988-                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
1989-                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
1990-                  ctx.fillText("Di chuyển: CLICK CHUỘT PHẢI", canvas.width / 2, 80);
1991-                  ctx.fillStyle = "#0284c7";
1992-                  ctx.fillText("Mặc đồ: KÉO THẢ TỪ KỆ VÀO NGƯỜI NHÂN VẬT (Cần 6 món)", canvas.width / 2, 105);
1993-                  ctx.shadowColor = "transparent";
1994-                  stage1LoopId = requestAnimationFrame(draw);
1995-              }
1996-              stage1LoopId = requestAnimationFrame(draw);
1997-            }
1998-
1999-            // --- Stage 2: Acid Mixing ---
2000-            let stage2LoopId;
2001-            function startStage2CanvasGame(onComplete) {
2002-              const canvas = document.getElementById("stage1-canvas");
2003-              const ctx = canvas.getContext("2d");
2004-              let state = "playing"; // playing, success, explosion
2005-              
2006-              // Position player next to the table
2007-              player.targetX = window.innerWidth/2 - 250;
2008-              player.targetY = window.innerHeight - 200;
2009-              player.x = player.targetX;
2010-              player.y = player.targetY;
2011-
2012-              let water = { id: "water", x: window.innerWidth/2 - 50, y: window.innerHeight - 350 - 100, w: 90, h: 100 };
2013-              let acid = { id: "acid", x: window.innerWidth/2 + 100, y: window.innerHeight - 350 - 120, w: 70, h: 120 };
2014-              
2015-              let draggingItem = null;
2016-              let dragOffsetX = 0;
2017-              let dragOffsetY = 0;
2018-              let particles = [];
2019-              let shakeAmt = 0;
2020-
2021-              function resize() {
2022-                  canvas.width = window.innerWidth;
2023-                  canvas.height = window.innerHeight;
2024-                  const tY = window.innerHeight - 350;
2025-                  const cx = window.innerWidth/2;
2026-                  if (!draggingItem) {
2027-                      water.x = cx - 50;
2028-                      water.y = tY - water.h;
2029-                      acid.x = cx + 100;
2030-                      acid.y = tY - acid.h;
2031-                  }
2032-                  if (!player.moving) {
2033-                      player.x = cx - 250;
2034-                      player.y = window.innerHeight - 200;
2035-                  }
2036-              }
2037-              window.addEventListener("resize", resize);
2038-              resize();
2039-
2040-              function getBounds(item) {
2041-                  return { left: item.x, right: item.x + item.w, top: item.y, bottom: item.y + item.h };
2042-              }
2043-              
2044-              function isOverlap(a, b) {
2045-                  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
2046-              }
2047-
2048-              function mousedownHandler(e) {
2049-                  if(e.button !== 0 || state !== "playing") return;
2050-                  const rect = canvas.getBoundingClientRect();
2051-                  const mx = e.clientX - rect.left;
2052-                  const my = e.clientY - rect.top;
2053-
2054-                  if (mx >= acid.x && mx <= acid.x + acid.w && my >= acid.y && my <= acid.y + acid.h) {
2055-                      draggingItem = acid;
2056-                      dragOffsetX = mx - acid.x; dragOffsetY = my - acid.y;
2057-                      playClick();
2058-                  } else if (mx >= water.x && mx <= water.x + water.w && my >= water.y && my <= water.y + water.h) {
2059-                      draggingItem = water;
2060-                      dragOffsetX = mx - water.x; dragOffsetY = my - water.y;
2061-                      playClick();
2062-                  }
2063-              }
2064-
2065-              function mousemoveHandler(e) {
2066-                  if (draggingItem && state === "playing") {
2067-                      const rect = canvas.getBoundingClientRect();
2068-                      draggingItem.x = e.clientX - rect.left - dragOffsetX;
2069-                      draggingItem.y = e.clientY - rect.top - dragOffsetY;
2070-                  }
2071-              }
2072-
2073-              function mouseupHandler(e) {
2074-                  if (draggingItem && state === "playing") {
2075-                      const wb = getBounds(water);
2076-                      const ab = getBounds(acid);
2077-                      
2078-                      if (isOverlap(wb, ab)) {
2079-                          if (draggingItem.id === "acid") {
2080-                              playClick();
2081-                              state = "success";
2082-                              Doms.questDesc.textContent = "Chuẩn! Rót axit vào nước giúp tản nhiệt an toàn.";
2083-                              setTimeout(() => { cleanup(); onComplete(); }, 3000);
2084-                          } else {
2085-                              playExplosion();
2086-                              state = "explosion";
2087-                              shakeAmt = 20;
2088-                              deductScore(15, "Rót Nước vào Axit đặc gây sôi bùng, bắn axit tung tóe!");
2089-                              for(let i=0; i<50; i++) {
2090-                                  particles.push({
2091-                                      x: acid.x + acid.w/2, y: acid.y,
2092-                                      vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 20,
2093-                                      life: 1.0, color: (Math.random() > 0.5) ? "#ef4444" : "#f59e0b"
2094-                                  });
2095-                              }
2096-                              setTimeout(() => { cleanup(); loadStage(2); }, 2500);
2097-                          }
2098-                      } else {
2099-                          const tY = window.innerHeight - 350;
2100-                          draggingItem.y = tY - draggingItem.h;
2101-                      }
2102-                      draggingItem = null;
2103-                  }
2104-              }
2105-
2106-              function cleanup() {
2107-                  cancelAnimationFrame(stage2LoopId);
2108-                  canvas.removeEventListener("mousedown", mousedownHandler);
2109-                  canvas.removeEventListener("mousemove", mousemoveHandler);
2110-                  canvas.removeEventListener("mouseup", mouseupHandler);
2111-                  window.removeEventListener("resize", resize);
2112-              }
2113-              canvas.addEventListener("mousedown", mousedownHandler);
2114-              canvas.addEventListener("mousemove", mousemoveHandler);
2115-              canvas.addEventListener("mouseup", mouseupHandler);
2116-
2117-
2118-              canvas.addEventListener("mousedown", mousedownHandler);
2119-              canvas.addEventListener("mousemove", mousemoveHandler);
2120-              canvas.addEventListener("mouseup", mouseupHandler);
2121-
2122-              function drawBeaker(ctx, item, type) {
2123-                  ctx.save();
2124-                  ctx.translate(item.x, item.y);
2125-                  if (draggingItem === item) {
2126-                      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
2127-                      ctx.rotate(0.1); 
2128-                  } else {
2129-                      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
2130-                  }
2131-                  
2132-                  // HYPER REALISTIC GLASS
2133-
2134-                  // Back of glass
2135-                  ctx.fillStyle = "rgba(255,255,255,0.1)";
2136-                  
2137-                  if (type === "water") {
2138-                      // Glass back
2139-                      ctx.beginPath(); ctx.roundRect(0, 0, item.w, item.h, 5); ctx.fill();
2140-                      
2141-                      // Liquid
2142-                      let liqH = (state === "success") ? item.h * 0.7 : item.h * 0.5;
2143-                      let gL = ctx.createLinearGradient(0, item.h - liqH, 0, item.h);
2144-                      if (state === "success") {
2145-                          gL.addColorStop(0, "rgba(253, 186, 116, 0.8)"); gL.addColorStop(1, "rgba(234, 88, 12, 0.9)");
2146-                      } else {
2147-                          gL.addColorStop(0, "rgba(125, 211, 252, 0.7)"); gL.addColorStop(1, "rgba(2, 132, 199, 0.8)");
2148-                      }
2149-                      ctx.fillStyle = gL;
2150-                      ctx.beginPath(); ctx.roundRect(4, item.h - liqH, item.w - 8, liqH - 4, 3); ctx.fill();
2151-                      
2152-                      // Volumetric highlight inside liquid
2153-                      ctx.fillStyle = "rgba(255,255,255,0.3)";
2154-                      ctx.beginPath(); ctx.roundRect(8, item.h - liqH + 5, 5, liqH - 15, 2); ctx.fill();
2155-
2156-                      // Glass Front
2157-                      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2;
2158-                      ctx.beginPath(); ctx.roundRect(0, 0, item.w, item.h, 5); ctx.stroke();
2159-                      
2160-                      // Glints
2161-                      ctx.fillStyle = "rgba(255,255,255,0.9)";
2162-                      ctx.fillRect(8, 10, 4, item.h - 20);
2163-                      ctx.fillRect(15, 10, 2, item.h - 20);
2164-                      
2165-                      // Label
2166-                      ctx.fillStyle = "#ffffff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
2167-                      ctx.fillText("H2O", item.w/2, item.h/2 - 10);
2168-                  } else {
2169-                      // Bottle Body Back
2170-                      ctx.beginPath(); 
2171-                      ctx.moveTo(20, 30); ctx.lineTo(20, item.h - 10); ctx.arcTo(20, item.h, 30, item.h, 10);
2172-                      ctx.lineTo(item.w - 30, item.h); ctx.arcTo(item.w - 20, item.h, item.w - 20, item.h - 10, 10);
2173-                      ctx.lineTo(item.w - 20, 30); ctx.lineTo(item.w/2 + 10, 15); ctx.lineTo(item.w/2 + 10, 0);
2174-                      ctx.lineTo(item.w/2 - 10, 0); ctx.lineTo(item.w/2 - 10, 15); ctx.closePath();
2175-                      ctx.fill();
2176-                      
2177-                      // Liquid
2178-                      if (state !== "explosion" || draggingItem !== item) {
2179-                          let gL = ctx.createLinearGradient(0, item.h - 60, 0, item.h);
2180-                          gL.addColorStop(0, "rgba(252, 211, 77, 0.8)");
2181-                          gL.addColorStop(1, "rgba(180, 83, 9, 0.9)");
2182-                          ctx.fillStyle = gL;
2183-                          ctx.beginPath(); ctx.roundRect(22, item.h - 60, item.w - 44, 55, 5); ctx.fill();
2184-                          // Liquid highlight
2185-                          ctx.fillStyle = "rgba(255,255,255,0.4)";
2186-                          ctx.fillRect(25, item.h - 55, 4, 45);
2187-                      }
2188-                      
2189-                      // Bottle Front
2190-                      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
2191-                      ctx.stroke();
2192-                      
2193-                      // Glints
2194-                      ctx.fillStyle = "rgba(255,255,255,0.8)";
2195-                      ctx.beginPath(); ctx.moveTo(22, 35); ctx.lineTo(22, item.h - 15); ctx.lineTo(26, item.h - 15); ctx.lineTo(26, 33); ctx.fill();
2196-                      
2197-                      // Label
2198-                      ctx.fillStyle = "#fef2f2"; ctx.fillRect(20, item.h/2 - 10, item.w - 40, 25);
2199-                      ctx.fillStyle = "#dc2626"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
2200-                      ctx.fillText("H2SO4", item.w/2, item.h/2 + 7);
2201-                  }
2202-                  
2203-                  ctx.restore();
2204-              }
2205-
2206-              function draw() {
2207-                  ctx.clearRect(0, 0, canvas.width, canvas.height);
2208-                  
2209-                  if (shakeAmt > 0) {
2210-                      ctx.save();
2211-                      ctx.translate((Math.random()-0.5)*shakeAmt, (Math.random()-0.5)*shakeAmt);
2212-                      shakeAmt *= 0.9;
2213-                      if(shakeAmt < 0.5) shakeAmt = 0;
2214-                  }
2215-
2216-                  drawRoom(ctx, canvas.width, canvas.height);
2217-                  drawPlayer(ctx);
2218-                  
2219-                  if (state === "explosion") {
2220-                      particles.forEach(p => {
2221-                          p.vy += 0.8;
2222-                          p.x += p.vx; p.y += p.vy;
2223-                          p.life -= 0.02;
2224-                          ctx.globalAlpha = Math.max(0, p.life);
2225-                          ctx.fillStyle = p.color;
2226-                          ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI*2); ctx.fill();
2227-                      });
2228-                      ctx.globalAlpha = 1.0;
2229-                      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
2230-                      ctx.fillRect(0,0,canvas.width,canvas.height);
2231-                  }
2232-
2233-                  // Draw items
2234-                  if (draggingItem === acid) drawBeaker(ctx, water, "water");
2235-// Debug
2236-ctx.fillStyle="red"; ctx.fillRect(water.x, water.y, 100, 100);
2237-                  if (draggingItem === water) drawBeaker(ctx, acid, "acid");
2238-                  if (draggingItem !== water) drawBeaker(ctx, water, "water");
2239-                  if (draggingItem !== acid) drawBeaker(ctx, acid, "acid");
2240-
2241-                  if (shakeAmt > 0) ctx.restore();
2242-
2243-                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
2244-                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
2245-                  ctx.fillText("Pha chế Axit: KÉO THẢ bình H2SO4 vào cốc H2O theo đúng nguyên tắc an toàn.", canvas.width / 2, 80);
2246-                  ctx.shadowColor = "transparent";
2247-
2248-                  stage2LoopId = requestAnimationFrame(draw);
2249-              }
2250-              stage2LoopId = requestAnimationFrame(draw);
2251-            }
2252-
2253-            // --- Stage 3: Waste Sorting ---
2254-            let stage3LoopId;
2255-            function startStage3CanvasGame(onComplete) {
2256-              const canvas = document.getElementById("stage1-canvas");
2257-              const ctx = canvas.getContext("2d");
2258-              
2259-              const tY = window.innerHeight - 350;
2260-              const w = window.innerWidth;
2261-              
2262-              var bins = [
2263-                  { id: "red", color1: "#ef4444", color2: "#7f1d1d", label: "SẮC NHỌN", x: w/2 - 200, y: tY + 120, w: 100, h: 120 },
2264-                  { id: "yellow", color1: "#f59e0b", color2: "#78350f", label: "HÓA CHẤT", x: w/2 - 50, y: tY + 120, w: 100, h: 120 },
2265-                  { id: "green", color1: "#22c55e", color2: "#14532d", label: "SINH HOẠT", x: w/2 + 100, y: tY + 120, w: 100, h: 120 }
2266-              ];
2267-
2268-              var trash = [
2269-                  { id: "glass", type: "glass", name: "Thủy tinh vỡ", x: w/2 - 150, y: tY - 60, w: 50, h: 50, target: "red", visible: true, ox: w/2 - 150, oy: tY - 60 },
2270-                  { id: "chem", type: "flask", name: "Hóa chất dư", x: w/2, y: tY - 60, w: 50, h: 50, target: "yellow", visible: true, ox: w/2, oy: tY - 60 },
2271-                  { id: "paper", type: "paper", name: "Giấy lau sạch", x: w/2 + 150, y: tY - 60, w: 50, h: 50, target: "green", visible: true, ox: w/2 + 150, oy: tY - 60 }
2272-              ];
2273-let sortedCount = 0;
2274-
2275-              player.targetX = window.innerWidth/2 - 350;
2276-              player.targetY = window.innerHeight - 200;
2277-              player.x = player.targetX;
2278-              player.y = player.targetY;
2279-
2280-              function resize() {
2281-                  canvas.width = window.innerWidth;
2282-                  canvas.height = window.innerHeight;
2283-                  if (!player.moving) {
2284-                      player.x = window.innerWidth/2 - 350;
2285-                      player.y = window.innerHeight - 200;
2286-                  }
2287-                  
2288-                  const cx = window.innerWidth/2;
2289-                  const tY = window.innerHeight - 350;
2290-                  
2291-                  if (typeof bins !== 'undefined') {
2292-                      bins[0].x = cx - 200; bins[0].y = tY + 120;
2293-                      bins[1].x = cx - 50;  bins[1].y = tY + 120;
2294-                      bins[2].x = cx + 100; bins[2].y = tY + 120;
2295-                  }
2296-                  
2297-                  if (typeof trash !== 'undefined') {
2298-                      trash[0].ox = cx - 150; trash[0].oy = tY - 60;
2299-                      trash[1].ox = cx;       trash[1].oy = tY - 60;
2300-                      trash[2].ox = cx + 150; trash[2].oy = tY - 60;
2301-                      
2302-                      if (!draggingItem) {
2303-                          trash.forEach(t => { t.x = t.ox; t.y = t.oy; });
2304-                      }
2305-                  }
2306-              }
2307-              
2308-
2309-              let draggingItem = null;
2310-              let dragOffsetX = 0, dragOffsetY = 0;
2311-              window.addEventListener("resize", resize);
2312-              resize();
2313-
2314-              function getBounds(item) {
2315-                  return { left: item.x, right: item.x + item.w, top: item.y, bottom: item.y + item.h };
2316-              }
2317-              function isOverlap(a, b) {
2318-                  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
2319-              }
2320-
2321-              function mousedownHandler(e) {
2322-                  if(e.button !== 0) return;
2323-                  const mx = e.clientX, my = e.clientY;
2324-                  for (let t of trash) {
2325-                      if (t.visible && mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h) {
2326-                          draggingItem = t;
2327-                          dragOffsetX = mx - t.x; dragOffsetY = my - t.y;
2328-                          playClick();
2329-                          break;
2330-                      }
2331-                  }
2332-              }
2333-
2334-              function mousemoveHandler(e) {
2335-                  if (draggingItem) {
2336-                      draggingItem.x = e.clientX - dragOffsetX;
2337-                      draggingItem.y = e.clientY - dragOffsetY;
2338-                  }
2339-              }
2340-
2341-              function mouseupHandler(e) {
2342-                  if (draggingItem) {
2343-                      let dropped = false;
2344-                      const tb = getBounds(draggingItem);
2345-                      for (let b of bins) {
2346-                          const bb = getBounds(b);
2347-                          if (isOverlap(tb, bb)) {
2348-                              if (draggingItem.target === b.id) {
2349-                                  playClick();
2350-                                  draggingItem.visible = false;
2351-                                  sortedCount++;
2352-                                  if (sortedCount >= 3) {
2353-                                      setTimeout(() => { cleanup(); onComplete(); }, 500);
2354-                                  }
2355-                              } else {
2356-                                  playError();
2357-                                  deductScore(5, "Phân loại sai! Nguy cơ lây nhiễm hoặc cháy nổ.");
2358-                                  draggingItem.x = draggingItem.ox; draggingItem.y = draggingItem.oy;
2359-                              }
2360-                              dropped = true;
2361-                              break;
2362-                          }
2363-                      }
2364-                      if (!dropped) {
2365-                          draggingItem.x = draggingItem.ox; draggingItem.y = draggingItem.oy;
2366-                      }
2367-                      draggingItem = null;
2368-                  }
2369-              }
2370-
2371-              function cleanup() {
2372-                  cancelAnimationFrame(stage3LoopId);
2373-                  canvas.removeEventListener("mousedown", mousedownHandler);
2374-                  canvas.removeEventListener("mousemove", mousemoveHandler);
2375-                  canvas.removeEventListener("mouseup", mouseupHandler);
2376-                  window.removeEventListener("resize", resize);
2377-              }
2378-
2379-              canvas.addEventListener("mousedown", mousedownHandler);
2380-              canvas.addEventListener("mousemove", mousemoveHandler);
2381-              canvas.addEventListener("mouseup", mouseupHandler);
2382-
2383-              function drawBin(ctx, b) {
2384-                  ctx.save();
2385-                  ctx.translate(b.x, b.y);
2386-                  
2387-                  // Ambient Occlusion Shadow
2388-                  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
2389-                  ctx.fillStyle = "rgba(0,0,0,0.5)";
2390-                  ctx.fillRect(10, b.h-10, b.w-20, 10);
2391-                  
2392-                  // 3D Cylinder Gradient
2393-                  const bgG = ctx.createLinearGradient(0, 0, b.w, 0);
2394-                  bgG.addColorStop(0, b.color2);
2395-                  bgG.addColorStop(0.2, b.color1); // highlight
2396-                  bgG.addColorStop(0.8, b.color1);
2397-                  bgG.addColorStop(1, b.color2);
2398-                  ctx.fillStyle = bgG;
2399-                  
2400-                  ctx.shadowColor = "transparent";
2401-                  ctx.beginPath(); 
2402-                  ctx.moveTo(5, 10); ctx.lineTo(b.w-5, 10); ctx.lineTo(b.w-15, b.h); ctx.lineTo(15, b.h); 
2403-                  ctx.fill();
2404-                  
2405-                  // Top Rim
2406-                  const rimG = ctx.createLinearGradient(0,0,b.w,0);
2407-                  rimG.addColorStop(0, "#ffffff"); rimG.addColorStop(1, b.color1);
2408-                  ctx.fillStyle = rimG;
2409-                  ctx.fillRect(0, 0, b.w, 10);
2410-                  
2411-                  // Ribs (lines on the bin for detail)
2412-                  ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 2;
2413-                  ctx.beginPath(); ctx.moveTo(b.w/4 + 5, 20); ctx.lineTo(b.w/4 + 5, b.h - 10); ctx.stroke();
2414-                  ctx.beginPath(); ctx.moveTo(b.w/2, 20); ctx.lineTo(b.w/2, b.h - 10); ctx.stroke();
2415-                  ctx.beginPath(); ctx.moveTo(b.w*3/4 - 5, 20); ctx.lineTo(b.w*3/4 - 5, b.h - 10); ctx.stroke();
2416-
2417-                  // Label Plate
2418-                  ctx.fillStyle = "rgba(255,255,255,0.9)";
2419-                  ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 4;
2420-                  ctx.fillRect(b.w/2 - 35, b.h/2 - 15, 70, 30);
2421-                  ctx.shadowColor = "transparent";
2422-                  ctx.fillStyle = b.color2; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
2423-                  ctx.fillText(b.label, b.w/2, b.h/2 + 4);
2424-                  
2425-                  ctx.restore();
2426-              }
2427-
2428-              function drawTrash(ctx, t) {
2429-                  if (!t.visible) return;
2430-                  ctx.save();
2431-                  ctx.translate(t.x, t.y);
2432-                  if (draggingItem === t) {
2433-                      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 15; ctx.shadowOffsetY = 10;
2434-                      ctx.scale(1.1, 1.1);
2435-                  } else {
2436-                      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 5;
2437-                  }
2438-                  
2439-                  if (t.type === "glass") {
2440-                      // Broken glass with sharp metallic gradients
2441-                      ctx.fillStyle = "rgba(186, 230, 253, 0.7)";
2442-                      ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(0, 40); ctx.lineTo(40, 50); ctx.fill();
2443-                      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.stroke();
2444-                      // Internal shard lines
2445-                      ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(15, 25); ctx.lineTo(40, 50); ctx.stroke();
2446-                  } else if (t.type === "flask") {
2447-                      // Shiny flask
2448-                      const fg = ctx.createRadialGradient(25, 30, 5, 25, 30, 25);
2449-                      fg.addColorStop(0, "rgba(251, 191, 36, 0.9)"); fg.addColorStop(1, "rgba(180, 83, 9, 0.9)");
2450-                      ctx.fillStyle = fg;
2451-                      ctx.beginPath(); ctx.arc(25, 30, 20, 0, Math.PI*2); ctx.fill();
2452-                      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(20, 25, 5, 0, Math.PI*2); ctx.fill();
2453-                      ctx.fillStyle = "#78350f"; ctx.fillRect(20, 0, 10, 15);
2454-                  } else {
2455-                      // Crumpled paper
2456-                      const pg = ctx.createLinearGradient(0,0,45,45);
2457-                      pg.addColorStop(0, "#ffffff"); pg.addColorStop(1, "#cbd5e1");
2458-                      ctx.fillStyle = pg;
2459-                      ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(35, 0); ctx.lineTo(45, 20); ctx.lineTo(40, 45); ctx.lineTo(0, 40); ctx.fill();
2460-                      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
2461-                      // Crumple lines
2462-                      ctx.beginPath(); ctx.moveTo(5,5); ctx.lineTo(25, 25); ctx.lineTo(45, 20); ctx.stroke();
2463-                      ctx.beginPath(); ctx.moveTo(25,25); ctx.lineTo(15, 45); ctx.stroke();
2464-                  }
2465-                  
2466-                  ctx.shadowColor = "transparent";
2467-                  ctx.fillStyle = "#1e293b"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
2468-                  ctx.fillText(t.name, 25, -10);
2469-                  
2470-                  ctx.restore();
2471-              }
2472-
2473-              function draw() {
2474-                  ctx.clearRect(0, 0, canvas.width, canvas.height);
2475-                  drawRoom(ctx, canvas.width, canvas.height);
2476-                  drawPlayer(ctx);
2477-                  
2478-                  bins.forEach(b => drawBin(ctx, b));
2479-                  trash.forEach(t => { if(draggingItem !== t) drawTrash(ctx, t); });
2480-                  if (draggingItem) drawTrash(ctx, draggingItem);
2481-
2482-                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
2483-                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
2484-                  ctx.fillText("Phân Loại Rác: KÉO THẢ các vật phẩm trên bàn vào đúng thùng rác ở dưới đất.", canvas.width / 2, 80);
2485-                  ctx.shadowColor = "transparent";
2486-
2487-                  stage3LoopId = requestAnimationFrame(draw);
2488-              }
2489-              stage3LoopId = requestAnimationFrame(draw);
2490-            }
2491-
2492-            
2493-            function startStage4CanvasGame(onComplete) {
2494-              const canvas = document.getElementById("stage1-canvas");
2495-              const ctx = canvas.getContext("2d");
2496-              
2497-              const symbols = [
2498-                { id: "explosive", text: "Chất nổ", emoji: "💥", color: "#dc2626" },
2499-                { id: "compressed", text: "Khí nén", emoji: "🗜️", color: "#2563eb" },
2500-                { id: "corrosive", text: "Ăn mòn", emoji: "🧪", color: "#d97706" },
2501-                { id: "toxic", text: "Độc tính", emoji: "💀", color: "#000000" },
2502-                { id: "env", text: "Nguy hại MT", emoji: "🐟", color: "#16a34a" },
2503-                { id: "flammable", text: "Dễ cháy", emoji: "🔥", color: "#dc2626" },
2504-                { id: "oxidizing", text: "Oxy hóa", emoji: "⭕", color: "#ca8a04" },
2505-                { id: "health", text: "Nguy hại SK", emoji: "🫁", color: "#9333ea" }
2506-              ];
2507-              
2508-              const cards = [];
2509-              let idCounter = 0;
2510-              symbols.forEach(s => {
2511-                  cards.push({ uid: idCounter++, matchId: s.id, type: 'symbol', content: s.emoji, color: s.color, isFlipped: true, isMatched: false });
2512-                  cards.push({ uid: idCounter++, matchId: s.id, type: 'text', content: s.text, color: s.color, isFlipped: true, isMatched: false });
2513-              });
2514-              
2515-              cards.sort(() => Math.random() - 0.5);
2516-              
2517-              function resize() {
2518-                  canvas.width = window.innerWidth;
2519-                  canvas.height = window.innerHeight;
2520-                  const cols = 4;
2521-                  const rows = 4;
2522-                  const cardW = 120;
2523-                  const cardH = 120;
2524-                  const gap = 15;
2525-                  const startX = window.innerWidth/2 - (cols * cardW + (cols-1)*gap)/2;
2526-                  const startY = window.innerHeight/2 - (rows * cardH + (rows-1)*gap)/2 + 40;
2527-                  
2528-                  cards.forEach((c, i) => {
2529-                      c.x = startX + (i % cols) * (cardW + gap);
2530-                      c.y = startY + Math.floor(i / cols) * (cardH + gap);
2531-                      c.w = cardW;
2532-                      c.h = cardH;
2533-                  });
2534-              }
2535-              window.addEventListener('resize', resize);
2536-              resize();
2537-              
2538-              let firstFlipped = null;
2539-              let secondFlipped = null;
2540-              let waitTimer = 0;
2541-              let stage4LoopId;
2542-              let matchedPairs = 0;
2543-              let memorizeTimer = 180; // 3 seconds at 60fps
2544-              
2545-              function drawGHSDiamond(ctx, x, y, size, emoji) {
2546-                  ctx.save();
2547-                  ctx.translate(x, y);
2548-                  ctx.beginPath();
2549-                  ctx.moveTo(0, -size/2);
2550-                  ctx.lineTo(size/2, 0);
2551-                  ctx.lineTo(0, size/2);
2552-                  ctx.lineTo(-size/2, 0);
2553-                  ctx.closePath();
2554-                  ctx.fillStyle = "#fff";
2555-                  ctx.fill();
2556-                  ctx.strokeStyle = "#dc2626";
2557-                  ctx.lineWidth = 4;
2558-                  ctx.stroke();
2559-                  ctx.fillStyle = "#000";
2560-                  ctx.textAlign = "center";
2561-                  ctx.textBaseline = "middle";
2562-                  ctx.font = (size/3) + "px Arial";
2563-                  ctx.fillText(emoji, 0, 0);
2564-                  ctx.restore();
2565-              }
2566-              
2567-              function draw() {
2568-                  ctx.clearRect(0, 0, canvas.width, canvas.height);
2569-                  
2570-                  // Draw 2.5D background
2571-                  drawRoom(ctx, canvas.width, canvas.height);
2572-                  drawPlayer(ctx);
2573-                  
2574-                  ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 10;
2575-                  ctx.fillStyle = "#0f172a"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
2576-                  if (memorizeTimer > 0) {
2577-                      ctx.fillText("GHI NHỚ CÁC THẺ: " + Math.ceil(memorizeTimer/60) + "s", canvas.width / 2, 80);
2578-                  } else {
2579-                      ctx.fillText("Giải Mã GHS: Lật mở và ghép đúng cặp Biểu tượng - Ý nghĩa.", canvas.width / 2, 80);
2580-                  }
2581-                  ctx.shadowColor = "transparent";
2582-
2583-                  cards.forEach(c => {
2584-                      if (c.isMatched) {
2585-                          ctx.fillStyle = "#1e293b";
2586-                          ctx.fillRect(c.x, c.y, c.w, c.h);
2587-                          ctx.strokeStyle = "#22c55e";
2588-                          ctx.lineWidth = 3;
2589-                          ctx.strokeRect(c.x, c.y, c.w, c.h);
2590-                          ctx.fillStyle = "#22c55e";
2591-                          ctx.textAlign = "center";
2592-                          ctx.textBaseline = "middle";
2593-                          ctx.font = "bold 24px Arial";
2594-                          ctx.fillText("✔️", c.x + c.w/2, c.y + c.h/2);
2595-                      } else if (c.isFlipped || memorizeTimer > 0) {
2596-                          ctx.fillStyle = "#f8fafc";
2597-                          ctx.fillRect(c.x, c.y, c.w, c.h);
2598-                          ctx.strokeStyle = c.color || "#38bdf8";
2599-                          ctx.lineWidth = 4;
2600-                          ctx.strokeRect(c.x, c.y, c.w, c.h);
2601-                          
2602-                          if (c.type === 'symbol') {
2603-                              drawGHSDiamond(ctx, c.x + c.w/2, c.y + c.h/2, c.w * 0.8, c.content);
2604-                          } else {
2605-                              ctx.fillStyle = "#0f172a";
2606-                              ctx.textAlign = "center";
2607-                              ctx.textBaseline = "middle";
2608-                              ctx.font = "bold 16px Arial";
2609-                              ctx.fillText(c.content, c.x + c.w/2, c.y + c.h/2);
2610-                          }
2611-                      } else {
2612-                          ctx.fillStyle = "#334155";
2613-                          ctx.fillRect(c.x, c.y, c.w, c.h);
2614-                          ctx.strokeStyle = "#475569";
2615-                          ctx.lineWidth = 2;
2616-                          ctx.strokeRect(c.x, c.y, c.w, c.h);
2617-                          ctx.fillStyle = "#94a3b8";
2618-                          ctx.textAlign = "center";
2619-                          ctx.textBaseline = "middle";
2620-                          ctx.font = "30px Arial";
2621-                          ctx.fillText("?", c.x + c.w/2, c.y + c.h/2);
2622-                      }
2623-                  });
2624-                  
2625-                  if (memorizeTimer > 0) {
2626-                      memorizeTimer--;
2627-                      if (memorizeTimer === 0) {
2628-                          cards.forEach(c => c.isFlipped = false);
2629-                      }
2630-                  } else {
2631-                      if (waitTimer > 0) {
2632-                          waitTimer--;
2633-                          if (waitTimer === 0) {
2634-                              if (firstFlipped.matchId === secondFlipped.matchId) {
2635-                                  firstFlipped.isMatched = true;
2636-                                  secondFlipped.isMatched = true;
2637-                                  matchedPairs++;
2638-                                  if (matchedPairs === 8) {
2639-                                      setTimeout(() => {
2640-                                          window.removeEventListener("mousedown", handleDown);
2641-                                          window.removeEventListener("resize", resize);
2642-                                          cancelAnimationFrame(stage4LoopId);
2643-                                          onComplete();
2644-                                      }, 1000);
2645-                                  }
2646-                              } else {
2647-                                  firstFlipped.isFlipped = false;
2648-                                  secondFlipped.isFlipped = false;
2649-                                  deductScore(5, "Ghép sai ký hiệu!");
2650-                              }
2651-                              firstFlipped = null;
2652-                              secondFlipped = null;
2653-                          }
2654-                      }
2655-                  }
2656-                  
2657-                  stage4LoopId = requestAnimationFrame(draw);
2658-              }
2659-              
2660-              function handleDown(e) {
2661-                  if (memorizeTimer > 0) return;
2662-                  if (waitTimer > 0) return;
2663-                  const mx = e.clientX;
2664-                  const my = e.clientY;
2665-                  
2666-                  const clicked = cards.find(c => mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h);
2667-                  if (clicked && !clicked.isMatched && !clicked.isFlipped) {
2668-                      clicked.isFlipped = true;
2669-                      if (!firstFlipped) {
2670-                          firstFlipped = clicked;
2671-                      } else {
2672-                          secondFlipped = clicked;
2673-                          waitTimer = 60;
2674-                      }
2675-                  }
2676-              }
2677-              
2678-              window.addEventListener("mousedown", handleDown);
2679-              stage4LoopId = requestAnimationFrame(draw);
2680-            }
2681-              
2682-              function handleDown(e) {
2683-                  if (waitTimer > 0) return;
2684-                  const mx = e.clientX;
2685-                  const my = e.clientY;
2686-                  
2687-                  const clicked = cards.find(c => mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h);
2688-                  if (clicked && !clicked.isMatched && !clicked.isFlipped) {
2689-                      clicked.isFlipped = true;
2690-                      if (!firstFlipped) {
2691-                          firstFlipped = clicked;
2692-                      } else {
2693-                          secondFlipped = clicked;
2694-                          waitTimer = 60;
2695-                      }
2696-                  }
2697-              }
2698-              
2699-              window.addEventListener("mousedown", handleDown);
2700-              stage4LoopId = requestAnimationFrame(draw);
2701-            }
2702-
2703-            // --- Start Application ---
2704-            updateHUD();
2705-            loadStage(1);
2706-    
2707-  
2708-
