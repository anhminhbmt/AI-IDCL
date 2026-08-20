import json
import math

# We will generate 50 molecules across 10 groups with complete data
def make_data():
    groups = [
        {"id": "alkane", "name": "1. Hydrocarbon no (Alkane & Xicloankan)", "badge": "Ankan"},
        {"id": "alkene", "name": "2. Hydrocarbon không no (Alkene, Alkyne, Diene)", "badge": "Anken/Ankin"},
        {"id": "arene", "name": "3. Hydrocarbon thơm (Arene)", "badge": "Benzen"},
        {"id": "halogen", "name": "4. Dẫn xuất Halogen", "badge": "Halogen"},
        {"id": "alcohol", "name": "5. Alcohol & Phenol", "badge": "Ancol"},
        {"id": "carbonyl", "name": "6. Aldehyde & Ketone", "badge": "Anđehit"},
        {"id": "acid", "name": "7. Carboxylic Acid", "badge": "Axit"},
        {"id": "ester", "name": "8. Ester & Lipid", "badge": "Este"},
        {"id": "amine", "name": "9. Amine & Amino Acid", "badge": "Amin"},
        {"id": "bio", "name": "10. Carbohydrate & Hợp chất sinh học", "badge": "Sinh học"}
    ]
    return groups

print("Group defined")
