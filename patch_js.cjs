const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// Remove references in JS
content = content.replace(/document\.getElementById\("stage-container"\)\.style\.display = "none";/g, '');
content = content.replace(/document\.getElementById\("bottom-dock"\)\.style\.display = "none";/g, '');

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
console.log('Cleaned JS references.');
