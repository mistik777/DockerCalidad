// =====================================================
// export.js — Generación y descarga de scripts para crear carpetas
// =====================================================

import { logError } from "./utils.js";

/**
 * Exporta la estructura del árbol a un script para Linux (.sh)
 * @param {Array} tree - Estructura jerárquica actual
 */
export function exportLinux(tree) {
  try {
    if (!Array.isArray(tree) || tree.length === 0) {
      logError("No hay estructura de árbol para exportar (Linux).");
      return;
    }

    const lines = [];
    const walk = (node, path = "") => {
      const current = (path ? path + "/" : "") + node.name;
      lines.push(`mkdir -p "${current}"`);
      node.children.forEach(child => walk(child, current));
    };
    tree.forEach(n => walk(n));

    const content = lines.join("\n");
    downloadFile("crear_carpetas.sh", content);
    console.log("✅ Script Linux generado correctamente (crear_carpetas.sh)");
  } catch (err) {
    logError("Error exportando script para Linux", err);
  }
}

/**
 * Exporta la estructura del árbol a un script para Windows (.bat)
 * @param {Array} tree - Estructura jerárquica actual
 */
export function exportWindows(tree) {
  try {
    if (!Array.isArray(tree) || tree.length === 0) {
      logError("No hay estructura de árbol para exportar (Windows).");
      return;
    }

    const lines = [];
    const walk = (node, path = "") => {
      const current = (path ? path + "\\" : "") + node.name;
      lines.push(`mkdir "${current}"`);
      node.children.forEach(child => walk(child, current));
    };
    tree.forEach(n => walk(n));

    const content = lines.join("\r\n");
    downloadFile("crear_carpetas.bat", content);
    console.log("✅ Script Windows generado correctamente (crear_carpetas.bat)");
  } catch (err) {
    logError("Error exportando script para Windows", err);
  }
}

/**
 * Descarga un archivo de texto con nombre y contenido indicados.
 * @param {string} name - Nombre del archivo
 * @param {string} content - Contenido del archivo
 */
function downloadFile(name, content) {
  try {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    logError(`Error descargando archivo ${name}`, err);
  }
}
