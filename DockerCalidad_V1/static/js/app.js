// =====================================================
// app.js — Punto de entrada principal de DockerCalidad V.1.0.2 (Frontend)
// =====================================================

import {
  loadTree,
  saveTree,
  tree,
  setTree,
  renderTree,
  initTreeEvents,
  initStructureBar
} from "./tree.js";
import { undo, redo, initHistory } from "./history.js";
import { showModal } from "./modals.js";
import { exportLinux, exportWindows } from "./export.js";
import { logError } from "./utils.js";

// -----------------------------------------------------
// Inicialización principal
// -----------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando DockerCalidad V.1.0.2...");

  initHistory();

  try {
    // 🔹 Inicializar barra de estructuras
    await initStructureBar();

    // 🔹 Cargar árbol inicial
    const data = await loadTree();
    setTree(data);
    renderTree();
    initTreeEvents();

    // -----------------------------------------------------
    // Botones superiores (herramientas)
    // -----------------------------------------------------
    const addRootBtn = document.getElementById("add-root");
    if (!addRootBtn) {
      logError("Botón '+ Carpeta raíz' no encontrado en el DOM.");
      return;
    }

    // ➕ Crear carpeta raíz
    addRootBtn.onclick = () => {
      try {
        undo.pushState();
        tree.push({
          id: crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36),
          name: "Nueva carpeta",
          children: [],
          reviewed: false
        });
        saveTree(tree);
        renderTree();
      } catch (err) {
        logError("Error al crear carpeta raíz", err);
      }
    };

    // ↶ Deshacer / ↷ Rehacer
    document.getElementById("undo").onclick = () => undo.perform();
    document.getElementById("redo").onclick = () => redo.perform();

    // 📁 Colapsar / Expandir todo
    document.getElementById("collapse-all").onclick = () => {
      tree.forEach(n => (n.collapsed = true));
      saveTree(tree);
      renderTree();
    };
    document.getElementById("expand-all").onclick = () => {
      tree.forEach(n => (n.collapsed = false));
      saveTree(tree);
      renderTree();
    };

    // 💾 Exportar estructura
    document.getElementById("exp-linux").onclick = () => exportLinux(tree);
    document.getElementById("exp-win").onclick = () => exportWindows(tree);

    // 🔍 Filtro de búsqueda
    document.getElementById("filter").oninput = e => {
      const value = e.target.value.toLowerCase();
      renderTree(value);
    };

  } catch (err) {
    logError("Error inicializando la aplicación", err);
    showModal("❌ Error al cargar los datos. Revisa la consola.");
  }
});
