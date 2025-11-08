// =====================================================
// modals.js — Gestión de modales de confirmación y alerta
// =====================================================

import { logError } from "./utils.js";

/**
 * Muestra un modal de confirmación o alerta.
 * @param {string} html - Contenido HTML a mostrar.
 * @param {Function} [onConfirm] - Acción a ejecutar si el usuario confirma.
 */
export function showModal(html, onConfirm) {
  try {
    const bg = document.getElementById("modal-bg");
    const txt = document.getElementById("modal-text");
    const ok = document.getElementById("modal-ok");
    const cancel = document.getElementById("modal-cancel");

    if (!bg || !txt || !ok || !cancel) {
      logError("No se encontraron los elementos del modal en el DOM.");
      return;
    }

    txt.innerHTML = html;
    bg.style.display = "flex";

    // Eliminar posibles listeners anteriores
    ok.replaceWith(ok.cloneNode(true));
    cancel.replaceWith(cancel.cloneNode(true));

    // Reasignar los elementos actualizados
    const okNew = document.getElementById("modal-ok");
    const cancelNew = document.getElementById("modal-cancel");

    // Cerrar el modal
    const close = () => {
      bg.style.display = "none";
      okNew.onclick = null;
      cancelNew.onclick = null;
    };

    cancelNew.onclick = close;

    okNew.onclick = () => {
      close();
      if (typeof onConfirm === "function") {
        try {
          onConfirm();
        } catch (err) {
          logError("Error ejecutando la acción de confirmación", err);
        }
      }
    };
  } catch (err) {
    logError("Error mostrando el modal", err);
  }
}
