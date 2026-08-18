import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# Fix syntax error caused by regex patching
content = content.replace('''      let lastTime = 0;

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
       else {
                          player.x = player.targetX;
                          player.moving = false;
                      }
                  }
              }''', 
'''      let lastTime = 0;

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
              }''')

with open("public/safety_gate.html", "w") as f:
    f.write(content)
