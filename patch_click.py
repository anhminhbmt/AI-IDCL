import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

new_left_click = """
        function leftClickHandler(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const currentInteractables = getInteractables();

            for (let item of currentInteractables) {
                if (mouseX >= item.x && mouseX <= item.x + item.w &&
                    mouseY >= item.y && mouseY <= item.y + item.h) {
                    
                    // Check distance (2D distance to center of item)
                    const itemCenterX = item.x + item.w / 2;
                    const itemCenterY = item.y + item.h / 2;
                    const dist = Math.sqrt(Math.pow(player.x - itemCenterX, 2) + Math.pow(player.y - itemCenterY, 2));
                    
                    // We allow a generous distance since the item might be high up on a shelf
                    if (dist < 350) {
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
                        alert("Bạn cần bước đến gần hơn (Click chuột phải để di chuyển)!");
                    }
                }
            }
        }
"""
content = re.sub(r'function leftClickHandler\(e\) \{.*?(?=let lastTime = 0;)', new_left_click, content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
