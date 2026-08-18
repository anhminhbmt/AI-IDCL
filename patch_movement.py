import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

new_right_click = """
        function rightClickHandler(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            player.targetX = e.clientX - rect.left;
            
            // Allow Y movement within floor area
            let destY = e.clientY - rect.top;
            const floorTop = window.innerHeight - 200;
            const floorBottom = window.innerHeight;
            if (destY < floorTop) destY = floorTop;
            if (destY > floorBottom) destY = floorBottom;
            
            player.targetY = destY; 
            player.moving = true;
            playClick();
        }
"""
content = re.sub(r'function rightClickHandler\(e\) \{.*?\}', new_right_click, content, flags=re.DOTALL)

new_update = """
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
"""
content = re.sub(r'function update\(deltaTime\) \{.*?\}', new_update, content, flags=re.DOTALL)

with open("public/safety_gate.html", "w") as f:
    f.write(content)
