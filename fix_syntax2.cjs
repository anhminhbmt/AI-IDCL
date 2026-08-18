const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// The offending code starts after stage3LoopId = requestAnimationFrame(draw);\n            }
const target = `stage3LoopId = requestAnimationFrame(draw);
              }
              stage3LoopId = requestAnimationFrame(draw);
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
            }`;

const correct = `stage3LoopId = requestAnimationFrame(draw);
              }
              stage3LoopId = requestAnimationFrame(draw);
            }`;

if (content.includes(target)) {
    content = content.replace(target, correct);
    fs.writeFileSync('public/safety_gate.html', content, 'utf8');
    console.log('Fixed trailing dangling block.');
} else {
    console.log('Target not found, trying regex.');
    const regex = /function handleDown\(e\) {[\s\S]*?stage4LoopId = requestAnimationFrame\(draw\);\s*\}\s*function startStage4CanvasGame/;
    if (regex.test(content)) {
        content = content.replace(regex, 'function startStage4CanvasGame');
        fs.writeFileSync('public/safety_gate.html', content, 'utf8');
        console.log('Fixed via regex.');
    } else {
        console.log('Regex also failed.');
    }
}
