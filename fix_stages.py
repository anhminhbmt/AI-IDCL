import re

with open("public/safety_gate.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # lines 914 to 997 is the original stage 3 Fume Hood block.
    if 913 <= i < 997:
        continue
    
    # line 998 starts } else if (stage === 3) { -> Keep as 3, but update task text
    if "Nhiệm vụ 4: Phân Loại Rác" in line:
        line = line.replace("Nhiệm vụ 4:", "Nhiệm vụ 3:")
    
    # line 1049 was } else if (stage === 3) { -> change to 4
    if "Nhiệm vụ 5: Khẩn Cấp!" in line:
        line = line.replace("Nhiệm vụ 5:", "Nhiệm vụ 4:")
    if i == 1048: # 0-indexed for 1049
        line = line.replace("stage === 3", "stage === 4")
        
    # line 1119 was } else if (stage === 4) { -> change to 5
    if "Nhiệm vụ 6: Giải Mã GHS" in line:
        line = line.replace("Nhiệm vụ 6:", "Nhiệm vụ 5:")
    if i == 1118: # 0-indexed for 1119
        line = line.replace("stage === 4", "stage === 5")
        
    new_lines.append(line)

with open("public/safety_gate.html", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
