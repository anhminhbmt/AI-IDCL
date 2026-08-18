const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// Find the dangling handleDown block and remove it
const startDangling = content.indexOf('function handleDown(e) {\n                  if (memorizeTimer > 0) return;');
const endDangling = content.indexOf('stage4LoopId = requestAnimationFrame(draw);\n            }', startDangling) + 'stage4LoopId = requestAnimationFrame(draw);\n            }'.length;

if (startDangling !== -1 && endDangling !== -1) {
    content = content.substring(0, startDangling) + content.substring(endDangling);
    fs.writeFileSync('public/safety_gate.html', content, 'utf8');
    console.log('Removed dangling code.');
} else {
    console.log('Could not find dangling code.');
}
