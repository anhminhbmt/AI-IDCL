import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

canvas_js = """
      // --- Stage 1 Canvas Game (60fps) ---
      let stage1LoopId;
      function startStage1CanvasGame(onComplete) {
        const canvas = document.getElementById("stage1-canvas");
        const ctx = canvas.getContext("2d");
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", resize);
        resize();

        // Game state
        const player = {
            x: 200, y: innerHeight - 150,
            targetX: 200, targetY: innerHeight - 150,
            speed: 5,
            width: 60, height: 160,
            frameX: 0, frameY: 0,
            moving: false,
            equipped: { coat: false, goggles: false, gloves: false, shoes: false, headcover: false }
        };

        const interactables = [
            { id: "headcover", name: "Mũ trùm đầu", x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 150, w: 100, h: 80, color: "#cbd5e1" },
            { id: "goggles", name: "Kính bảo hộ", x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 150, w: 100, h: 80, color: "#38bdf8" },
            { id: "gloves", name: "Găng tay Nitrile", x: window.innerWidth / 2 + 50, y: window.innerHeight / 2 - 150, w: 100, h: 80, color: "#818cf8" },
            { id: "shoes", name: "Giày bảo hộ", x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 + 50, w: 100, h: 80, color: "#475569" },
            { id: "coat", name: "Áo Blouse", x: window.innerWidth / 2 + 250, y: window.innerHeight / 2 - 100, w: 120, h: 200, color: "#ffffff" }
        ];

        let foundCount = 0;

        function rightClickHandler(e) {
            e.preventDefault();
            player.targetX = e.clientX;
            // Constrain y to floor level
            player.targetY = window.innerHeight - 150; 
            player.moving = true;
            playClick();
        }

        canvas.addEventListener("contextmenu", rightClickHandler);

        // Click to equip if close enough
        function leftClickHandler(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            for (let item of interactables) {
                if (mouseX >= item.x && mouseX <= item.x + item.w &&
                    mouseY >= item.y && mouseY <= item.y + item.h) {
                    
                    // Check distance
                    const dist = Math.abs(player.x - item.x);
                    if (dist < 200) {
                        if (!player.equipped[item.id]) {
                            player.equipped[item.id] = true;
                            foundCount++;
                            playSuccessDing();
                            
                            // Visual feedback
                            score += 10;
                            Doms.scoreText.textContent = score;

                            if (foundCount >= 5) {
                                cancelAnimationFrame(stage1LoopId);
                                canvas.removeEventListener("contextmenu", rightClickHandler);
                                canvas.removeEventListener("click", leftClickHandler);
                                window.removeEventListener("resize", resize);
                                onComplete();
                            }
                        }
                    } else {
                        playError();
                        alert("Bạn cần bước đến gần hơn để lấy vật phẩm này!");
                    }
                }
            }
        }
        canvas.addEventListener("click", leftClickHandler);

        let lastTime = 0;
        function update(deltaTime) {
            if (player.moving) {
                const dx = player.targetX - player.x;
                const distance = Math.abs(dx);
                if (distance > player.speed) {
                    player.x += Math.sign(dx) * player.speed;
                } else {
                    player.x = player.targetX;
                    player.moving = false;
                }
            }
        }

        function drawRoom(ctx, w, h) {
            // Background Wall
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(0, 0, w, h);
            
            // Floor
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(0, h - 200, w, 200);

            // Lab Table
            const tableW = 600;
            const tableH = 150;
            const tableX = w / 2 - 300;
            const tableY = h - 200 - tableH;

            // Table legs
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(tableX + 20, tableY, 20, tableH + 200);
            ctx.fillRect(tableX + tableW - 40, tableY, 20, tableH + 200);

            // Table top
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(tableX, tableY, tableW, 20);

            // Shelves
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(tableX, tableY - 200, tableW - 150, 200); // Main shelf back
            
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(tableX, tableY - 200, tableW - 150, 10); // top
            ctx.fillRect(tableX, tableY - 100, tableW - 150, 10); // mid

            // Vertical dividers
            ctx.fillRect(tableX + 150, tableY - 200, 10, 200);
            ctx.fillRect(tableX + 300, tableY - 200, 10, 200);

            // Coat Rack
            const rackX = tableX + tableW + 50;
            const rackY = tableY - 250;
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(rackX, rackY, 200, 10); // top bar
            ctx.fillRect(rackX + 20, rackY, 10, tableH + 250 + 200); // left leg
            ctx.fillRect(rackX + 170, rackY, 10, tableH + 250 + 200); // right leg
        }

        function drawItems(ctx) {
            ctx.textAlign = "center";
            ctx.font = "12px sans-serif";
            for (let item of interactables) {
                if (!player.equipped[item.id]) {
                    ctx.fillStyle = item.color;
                    ctx.fillRect(item.x, item.y, item.w, item.h);
                    ctx.strokeStyle = "#334155";
                    ctx.strokeRect(item.x, item.y, item.w, item.h);
                    
                    ctx.fillStyle = "#1e293b";
                    ctx.fillText(item.name, item.x + item.w/2, item.y + item.h + 15);
                }
            }
        }

        function drawPlayer(ctx) {
            ctx.save();
            ctx.translate(player.x, player.y);
            
            // Body (Base)
            ctx.fillStyle = player.equipped.coat ? "#ffffff" : "#6366f1";
            ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 2;
            ctx.strokeRect(-player.width/2, -player.height/2, player.width, player.height);

            // Head
            ctx.fillStyle = "#ffedd5";
            ctx.beginPath();
            ctx.arc(0, -player.height/2 - 30, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Headcover
            if (player.equipped.headcover) {
                ctx.fillStyle = "#cbd5e1";
                ctx.beginPath();
                ctx.arc(0, -player.height/2 - 35, 26, Math.PI, 0);
                ctx.fill();
            }

            // Goggles
            if (player.equipped.goggles) {
                ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
                ctx.fillRect(-15, -player.height/2 - 40, 30, 10);
                ctx.strokeRect(-15, -player.height/2 - 40, 30, 10);
            }

            // Gloves
            if (player.equipped.gloves) {
                ctx.fillStyle = "#818cf8";
                ctx.fillRect(-player.width/2 - 10, 0, 10, 30);
                ctx.fillRect(player.width/2, 0, 10, 30);
            }

            // Shoes
            if (player.equipped.shoes) {
                ctx.fillStyle = "#334155";
                ctx.fillRect(-player.width/2, player.height/2, 25, 15);
                ctx.fillRect(player.width/2 - 25, player.height/2, 25, 15);
            }

            ctx.restore();
            
            // Draw Target Indicator
            if (player.moving) {
                ctx.beginPath();
                ctx.arc(player.targetX, player.targetY + player.height/2, 10, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        function draw(time) {
            const deltaTime = time - lastTime;
            lastTime = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawRoom(ctx, canvas.width, canvas.height);
            drawItems(ctx);
            
            update(deltaTime);
            drawPlayer(ctx);

            // HUD overlay hints
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Di chuyển: CLICK CHUỘT PHẢI", canvas.width / 2, 80);
            ctx.fillText("Nhặt đồ: CLICK CHUỘT TRÁI (Khi đứng gần)", canvas.width / 2, 100);

            stage1LoopId = requestAnimationFrame(draw);
        }

        stage1LoopId = requestAnimationFrame(draw);
      }
"""

content = content.replace("// --- Start Application ---", canvas_js + "\n      // --- Start Application ---")

with open("public/safety_gate.html", "w") as f:
    f.write(content)
