import os

code = '''
# Python script to build molecule database and inject into index.html
import json, re

print("Starting generation...")
'''

with open("step1.py", "w") as f:
    f.write(code)
print("Saved step1")
