with open("public/safety_gate.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 282 <= i <= 321:
        continue
    new_lines.append(line)

with open("public/safety_gate.html", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
