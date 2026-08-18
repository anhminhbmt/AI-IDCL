const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

// The stage-container starts around line 284.
const startIdx = content.indexOf('<div\n      id="stage-container"');
if (startIdx !== -1) {
    // We want to delete until the `<script>` tag
    const scriptIdx = content.indexOf('<script>', startIdx);
    if (scriptIdx !== -1) {
        content = content.substring(0, startIdx) + content.substring(scriptIdx);
    }
}

fs.writeFileSync('public/safety_gate.html', content, 'utf8');
console.log('Cleaned HTML.');
