# =====================================================
# app/__init__.py — Inicialización y rutas con carpeta "estructuras"
# =====================================================

from flask import Flask, jsonify, request, send_from_directory, render_template
import os, json, glob

# -----------------------------------------------------
# Factoría de la aplicación Flask
# -----------------------------------------------------
def create_app():
    app = Flask(__name__, static_folder="../static", template_folder="../templates")

    # Directorio donde se guardan las estructuras
    STRUCTURE_DIR = os.path.join(os.getcwd(), "estructuras")
    os.makedirs(STRUCTURE_DIR, exist_ok=True)

    # -----------------------------------------------------
    # Página principal
    # -----------------------------------------------------
    @app.route("/")
    def index():
        return render_template("index.html")

    # -----------------------------------------------------
    # Listado de estructuras disponibles
    # -----------------------------------------------------
    @app.route("/list")
    def list_structures():
        try:
            pattern = os.path.join(STRUCTURE_DIR, "*.json")
            files = [os.path.basename(f) for f in glob.glob(pattern)]
            return jsonify(files)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------
    # Árbol principal por defecto (estructura.json)
    # -----------------------------------------------------
    @app.route("/tree", methods=["GET"])
    def get_default_tree():
        path = os.path.join(STRUCTURE_DIR, "estructura.json")
        if not os.path.exists(path):
            return jsonify([])
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tree", methods=["POST"])
    def save_default_tree():
        data = request.json
        path = os.path.join(STRUCTURE_DIR, "estructura.json")
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------
    # Gestión de múltiples estructuras
    # -----------------------------------------------------
    @app.route("/tree/<name>", methods=["GET"])
    def get_tree(name):
        path = os.path.join(STRUCTURE_DIR, name)
        if not os.path.exists(path):
            return jsonify([])
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tree/<name>", methods=["POST"])
    def save_tree(name):
        data = request.json
        path = os.path.join(STRUCTURE_DIR, name)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tree/<name>", methods=["DELETE"])
    def delete_tree(name):
        path = os.path.join(STRUCTURE_DIR, name)
        try:
            if os.path.exists(path):
                os.remove(path)
            return jsonify({"deleted": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------
    # Servir archivos estáticos
    # -----------------------------------------------------
    @app.route("/static/<path:path>")
    def send_static(path):
        return send_from_directory("../static", path)

    return app
