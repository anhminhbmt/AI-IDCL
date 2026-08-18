const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// Put screen-fx back in just before the script tag
const screenFx = '<div id="screen-fx" class="fixed inset-0 pointer-events-none z-[60]"></div>\n    <script>';
content = content.replace('<script>', screenFx);

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
console.log('Restored screen-fx');
