from flask import Flask, request, jsonify, render_template
import json
import os

# ----------------------------------------------------
# CONFIGURACIÓN FLASK PARA DOCKER
# ----------------------------------------------------
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

DATA_FILE = "estructura.json"


# ----------------------------------------------------
# FUNCIONES DE I/O
# ----------------------------------------------------
def load_data():
    """Carga el árbol desde estructura.json"""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []  # Si el JSON está corrupto, arranca vacío


def save_data(data):
    """Guarda el árbol en estructura.json"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ----------------------------------------------------
# RUTAS
# ----------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/tree", methods=["GET", "POST"])
def tree():
    if request.method == "GET":
        return jsonify(load_data())

    data = request.json
    save_data(data)
    return jsonify({"status": "ok"})


# ----------------------------------------------------
# EJECUCIÓN (DOCKER-SAFE)
# ----------------------------------------------------
if __name__ == "__main__":
    # No usar debug en Docker
    app.run(host="0.0.0.0", port=3001)
