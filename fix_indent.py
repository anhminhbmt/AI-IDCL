with open("public/safety_gate.html", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("          });\n              }\n\n\n      // --- Completion & Certificate ---", "          });\n        }\n      }\n\n      // --- Completion & Certificate ---")

with open("public/safety_gate.html", "w", encoding="utf-8") as f:
    f.write(content)
