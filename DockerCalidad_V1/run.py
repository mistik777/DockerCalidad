# =====================================================
# run.py — Punto de entrada principal de DockerCalidad V.1.0.2
# =====================================================

from app import create_app

# Crea la instancia de la aplicación Flask
app = create_app()

if __name__ == "__main__":
    # Igual que en la V.0 (puerto 3001)
    app.run(host="0.0.0.0", port=3001)
