import re

with open("public/safety_gate.html", "r", encoding="utf-8") as f:
    content = f.read()

# Update HUD
content = content.replace("MÀN ${currentStage}/5", "MÀN ${currentStage}/3")
content = content.replace("currentStage - 1) / 5", "currentStage - 1) / 3")
content = content.replace("currentStage > 5", "currentStage > 3")

# Remove Eye Wash HTML
eye_wash_start = content.find("<!-- Eye Wash Station -->")
if eye_wash_start != -1:
    eye_wash_end = content.find("<!-- Waste Bins -->", eye_wash_start)
    if eye_wash_end != -1:
        content = content[:eye_wash_start] + content[eye_wash_end:]

# Remove stage 4 and 5 logic
stage4_start = content.find("} else if (stage === 4) {")
if stage4_start != -1:
    stage5_end = content.find("function completeGate()")
    if stage5_end != -1:
        # We need to find the } that closes loadStage before function completeGate
        # Let's find the first } at the same indentation before completeGate
        end_idx = content.rfind("      }", stage4_start, stage5_end)
        
        if end_idx != -1:
            content = content[:stage4_start] + "      }\n" + content[end_idx + 7:]

with open("public/safety_gate.html", "w", encoding="utf-8") as f:
    f.write(content)
