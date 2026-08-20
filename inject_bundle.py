# -*- coding: utf-8 -*-
"""
Injects visualizer bundle into index.html
"""
import subprocess, tempfile, json, os, re

def run():
    with open("visualizer_injection_bundle.html", "r", encoding="utf-8") as f:
        bundle = f.read()

    # Validate JS syntax
    scripts = re.findall(r"<script(?:\s+[^>]*)?>([\s\S]*?)</script>", bundle)
    with tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False) as tf:
        tf.write(scripts[0])
        tf_name = tf.name
    res_check = subprocess.run(["node", "--check", tf_name], capture_output=True, text=True)
    if res_check.returncode != 0:
        print("SYNTAX ERROR IN BUNDLE:", res_check.stderr)
        return
    print("Bundle JS is 100% VALID!")

    # Inject into index.html
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    start_tag = "<!-- 3D Organic Molecule Visualizer Module Start -->"
    end_tag = "<!-- 3D Organic Molecule Visualizer Module End -->"

    s_pos = html.find(start_tag)
    e_pos = html.find(end_tag)

    if s_pos != -1 and e_pos != -1:
        e_pos += len(end_tag)
        html = html[:s_pos] + f"{start_tag}\n{bundle}\n{end_tag}" + html[e_pos:]
        print("Replaced existing visualizer module block in index.html!")
    else:
        body_pos = html.find("</body>")
        if body_pos != -1:
            html = html[:body_pos] + f"\n{start_tag}\n{bundle}\n{end_tag}\n" + html[body_pos:]
            print("Injected visualizer module before </body> in index.html!")

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Saved index.html successfully!")

if __name__ == "__main__":
    run()
