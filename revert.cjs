const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// Revert HUD updates
content = content.replace('`MÀN ${currentStage}/4`', '`MÀN ${currentStage}/3`');
content = content.replace('(currentStage - 1) / 4', '(currentStage - 1) / 3');

// Revert nextStage
content = content.replace('if (currentStage > 4)', 'if (currentStage > 3)');

// Remove loadStage block for stage 4
const stage4LoadBlock = `} else if (stage === 4) {
                Doms.questTitle.innerHTML = \`<i data-lucide="alert-triangle" class="w-5 h-5 inline"></i> Nhiệm vụ 4: Ký hiệu GHS\`;
                Doms.questDesc.textContent = "Lật mở và ghép đúng 8 cặp Biểu tượng - Ý nghĩa cảnh báo hóa chất GHS.";
                startStage4CanvasGame(() => {
                  showStageCompleteEffect(nextStage);
                });
              }`;
content = content.replace(stage4LoadBlock, '}');

// Remove startStage4CanvasGame implementation
const regex = /function startStage4CanvasGame\([\s\S]*?stage4LoopId = requestAnimationFrame\(draw\);\s*\}/;
content = content.replace(regex, '');

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
console.log('Reverted successfully.');
