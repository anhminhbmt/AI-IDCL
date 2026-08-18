with open("public/safety_gate.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function completeGate()" in line:
        start = max(0, i - 10)
        end = i + 5
        for j in range(start, end):
            print(f"{j+1}: {lines[j].rstrip()}")
        break
