import re

with open("public/safety_gate.html", "r") as f:
    content = f.read()

# Remove the invalid call outside of scope
content = content.replace('const interactables = getInteractables();\n', '')

with open("public/safety_gate.html", "w") as f:
    f.write(content)
