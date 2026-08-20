# -*- coding: utf-8 -*-
import json, re

# Check if index.html exists
with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Read index.html successfully")
