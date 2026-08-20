# Patcher part 1: load index.html
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

print("Original index.html length:", len(html))
