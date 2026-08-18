import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# 1. Update completeGate to skip cert modal and redirect directly
old_complete = """            function completeGate() {
              Doms.stageText.textContent = `HOÀN THÀNH!`;
              Doms.progressText.textContent = `100%`;
              Doms.progressBar.style.width = `100%`;
              document.getElementById("status-badge").className =
                "bg-emerald-900/50 text-emerald-400 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5";
              document.getElementById("status-badge").innerHTML =
                '<i data-lucide="check-circle" class="w-4 h-4"></i><span>ĐÃ CẤP PHÉP</span>';
              lucide.createIcons();
              
              confetti({ particleCount: 150, spread: 180, origin: { y: 0.3 } });
              playSuccessDing();
              setTimeout(playSuccessDing, 400);

              document.getElementById("cert-modal").classList.remove("hidden");
              document.getElementById("cert-modal").classList.add("flex");

              document.getElementById("btn-generate-cert").onclick = () => {
                const name =
                  document.getElementById("user-name-input").value.trim() ||
                  "Học Viên Vô Danh";
                document.getElementById("cert-input-step").classList.add("hidden");
                document
                  .getElementById("cert-display-step")
                  .classList.remove("hidden");
                document.getElementById("cert-display-step").classList.add("flex");
                generateCertificate(name, score);
              };

              document.getElementById("btn-enter-lab").onclick = () => {
                localStorage.setItem("lab_safety_passed", "true");
                sessionStorage.setItem("just_passed_safety", "true");
                document.body.style.opacity = "0";
                document.body.style.transition = "opacity 1s";
                setTimeout(() => {
                  window.location.href = "/";
                }, 1000);
              };
            }"""

new_complete = """            function completeGate() {
              Doms.stageText.textContent = `HOÀN THÀNH!`;
              Doms.progressText.textContent = `100%`;
              Doms.progressBar.style.width = `100%`;
              document.getElementById("status-badge").className =
                "bg-emerald-900/50 text-emerald-400 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5";
              document.getElementById("status-badge").innerHTML =
                '<i data-lucide="check-circle" class="w-4 h-4"></i><span>ĐÃ CẤP PHÉP</span>';
              if(window.lucide) lucide.createIcons();
              
              confetti({ particleCount: 150, spread: 180, origin: { y: 0.3 } });
              playSuccessDing();
              setTimeout(playSuccessDing, 400);

              // Tự động chuyển thẳng vào phòng thí nghiệm (Phần 9)
              setTimeout(() => {
                localStorage.setItem("lab_safety_passed", "true");
                sessionStorage.setItem("just_passed_safety", "true");
                document.body.style.opacity = "0";
                document.body.style.transition = "opacity 1s";
                setTimeout(() => {
                  window.location.href = "/";
                }, 1000);
              }, 2000);
            }"""

if old_complete in content:
    content = content.replace(old_complete, new_complete)
else:
    print("Could not find completeGate function to replace.")

# 2. Improve Stage 1 graphics
# We'll replace startStage1CanvasGame with a highly realistic version.

with open("public/safety_gate.html", "w") as f:
    f.write(content)
