const fs = require('fs');
let content = fs.readFileSync('public/safety_gate.html', 'utf8');

const target = `            function clearStage() {
              Doms.inventory.innerHTML = "";
              Doms.deskItems.innerHTML = "";
              // Reset character pos
              Doms.charZone.style.left = "370px";
              Doms.charZone.style.top = "600px";
              stopSiren();
              document.body.classList.remove("shake-active");

              // Remove previous dropzone listeners if any (by cloning)
              const cZone = Doms.charZone.cloneNode(true);
              Doms.charZone.parentNode.replaceChild(cZone, Doms.charZone);
              Doms.charZone = cZone;
            }`;

const safeClearStage = `            function clearStage() {
              stopSiren();
              document.body.classList.remove("shake-active");
            }`;

if (content.includes(target)) {
    content = content.replace(target, safeClearStage);
    fs.writeFileSync('public/safety_gate.html', content, 'utf8');
    console.log('Fixed clearStage.');
} else {
    console.log('clearStage not found!');
}
