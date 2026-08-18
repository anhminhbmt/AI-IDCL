import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

content = content.replace('const dist = Math.sqrt(Math.pow(player.x - itemCenterX, 2) + Math.pow(player.y - itemCenterY, 2));', 'const dist = Math.abs(player.x - itemCenterX); // Only care about X distance for shelf items')
content = content.replace('if (dist < 350) {', 'if (dist < 200) {')

with open("public/safety_gate.html", "w") as f:
    f.write(content)
