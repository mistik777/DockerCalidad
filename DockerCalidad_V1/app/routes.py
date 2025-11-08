# =====================================================
# app/routes.py — Rutas principales de DockerCalidad V.1
# =====================================================

from flask import Blueprint, request, jsonify, render_template
from .storage import load_data, save_data

# Blueprint principal
bp = Blueprint("main", __name__)

# -----------------------------------------------------
# Ruta principal: interfaz HTML
# -----------------------------------------------------
@bp.route("/")
def index():
    """Muestra la interfaz principal."""
    return render_template("index.html")


# -----------------------------------------------------
# Ruta del árbol (GET: leer / POST: guardar)
# -----------------------------------------------------
@bp.route("/tree", methods=["GET", "POST"])
def tree():
    """Carga o guarda la estructura JSON del árbol."""
    if request.method == "GET":
        data = load_data()
        return jsonify(data)

    # POST
    data = request.json or []
    save_data(data)
    return jsonify({"status": "ok"})
