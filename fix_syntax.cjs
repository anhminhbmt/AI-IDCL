const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

content = content.replace('}\n              } else if (stage === 4) {', '} else if (stage === 4) {');

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
console.log('Fixed syntax error in loadStage.');
