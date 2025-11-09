#!/bin/bash

# Script: crear_estructura.sh
# Genera estructura.json con la estructura de carpetas actual

python3 << 'EOF'
import os, json, uuid

def generar_id():
    return uuid.uuid4().hex[:20]

def scan(dir_path):
    items = []
    for nombre in sorted(os.listdir(dir_path)):
        ruta = os.path.join(dir_path, nombre)
        if os.path.isdir(ruta):
            items.append({
                "id": generar_id(),
                "name": nombre,
                "children": scan(ruta),
                "reviewed": False
            })
    return items

estructura = scan(".")
with open("estructura.json", "w", encoding="utf-8") as f:
    json.dump(estructura, f, indent=2, ensure_ascii=False)

print("✅ Archivo estructura.json generado correctamente.")
EOF
