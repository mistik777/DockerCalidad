# 🧩 DockerCalidad V.1

Versión modular y ampliable del proyecto **DockerCalidad**  
Basada en **Flask + Docker**, con el mismo funcionamiento que la versión V.0 pero con código más limpio, estructurado y preparado para futuras mejoras.

---

## 🧠 Funcionamiento

La aplicación muestra un árbol de documentos editable y jerárquico con:
- **Arrastrar y soltar (Drag & Drop)**
- **Crear, eliminar y renombrar carpetas**
- **Marcar como revisadas**
- **Deshacer / Rehacer**
- **Exportar a scripts de creación de carpetas (.sh / .bat)**

Toda la información se guarda automáticamente en `estructura.json`.

---

## 🐳 Ejecución con Docker

cd ~
<br>
git clone https://github.com/mistik777/DockerCalidad<br>
cd DockerCalidad_V1<br>
docker compose up -d<br>

Funciona en puerto:0777
