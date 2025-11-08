# =====================================================
# app/storage.py — Gestión de lectura/escritura del árbol JSON
# =====================================================

import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "estructura.json")


def load_data():
    """
    Carga el árbol desde estructura.json.
    Si no existe o está corrupto, devuelve una lista vacía.
    """
    if not os.path.exists(DATA_FILE):
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_data(data):
    """
    Guarda el árbol en estructura.json.
    Sobrescribe el archivo actual.
    """
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
