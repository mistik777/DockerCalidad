# =====================================================
# app/__init__.py — Inicialización y rutas de DockerCalidad V.1.0.2
# =====================================================

from flask import Flask, jsonify, request, send_from_directory, render_template
import os, json, glob

# -----------------------------------------------------
# Factoría de la aplicación Flask
# -----------------------------------------------------
def create_app():
    app = Flask(__name__, static_folder="../static", template_folder="../templates")

    # -----------------------------------------------------
    # Rutas principales
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
            files = [os.path.basename(f) for f in glob.glob("estructura*.json")]
            return jsonify(files)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------
    # Árbol principal por defecto (estructura.json)
    # -----------------------------------------------------
    @app.route("/tree", methods=["GET"])
    def get_default_tree():
        if not os.path.exists("estructura.json"):
            return jsonify([])
        try:
            with open("estructura.json", "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tree", methods=["POST"])
    def save_default_tree():
        data = request.json
        try:
            with open("estructura.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------
    # Gestión de múltiples estructuras
    # -----------------------------------------------------
    @app.route("/tree/<name>", methods=["GET"])
    def get_tree(name):
        if not os.path.exists(name):
            return jsonify([])
        try:
            with open(name, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tree/<name>", methods=["POST"])
    def save_tree(name):
        data = request.json
        try:
            with open(name, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tree/<name>", methods=["DELETE"])
    def delete_tree(name):
        try:
            if os.path.exists(name):
                os.remove(name)
            return jsonify({"deleted": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------
    # Archivos estáticos (opcional para compatibilidad)
    # -----------------------------------------------------
    @app.route("/static/<path:path>")
    def send_static(path):
        return send_from_directory("../static", path)

    return app
