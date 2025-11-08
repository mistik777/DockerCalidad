// =====================================================
// history.js — Gestión del historial (Undo / Redo)
// =====================================================

import { saveTree, renderTree, getTree, setTree } from "./tree.js";
import { logError } from "./utils.js";

// -----------------------------------------------------
// Configuración
// -----------------------------------------------------
const MAX_HISTORY = 50;
let undoStack = [];
let redoStack = [];

// -----------------------------------------------------
// Inicialización
// -----------------------------------------------------
export function initHistory() {
  undoStack = [];
  redoStack = [];
  console.log("🕘 Historial inicializado");
}

// -----------------------------------------------------
// Guarda el estado actual (antes de un cambio)
// -----------------------------------------------------
function pushStateInternal() {
  try {
    const snapshot = JSON.stringify(getTree());
    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
  } catch (err) {
    logError("Error al guardar el estado en el historial", err);
  }
}

// -----------------------------------------------------
// Deshacer
// -----------------------------------------------------
function performUndo() {
  try {
    if (!undoStack.length) return;
    const current = JSON.stringify(getTree());
    redoStack.push(current);
    const prev = undoStack.pop();
    setTree(JSON.parse(prev));
    saveTree(getTree());
    renderTree();
    console.log("↶ Acción deshecha");
  } catch (err) {
    logError("Error al deshacer acción", err);
  }
}

// -----------------------------------------------------
// Rehacer
// -----------------------------------------------------
function performRedo() {
  try {
    if (!redoStack.length) return;
    const current = JSON.stringify(getTree());
    undoStack.push(current);
    const next = redoStack.pop();
    setTree(JSON.parse(next));
    saveTree(getTree());
    renderTree();
    console.log("↷ Acción rehecha");
  } catch (err) {
    logError("Error al rehacer acción", err);
  }
}

// -----------------------------------------------------
// API pública
// -----------------------------------------------------
export const undo = {
  pushState: pushStateInternal,
  perform: performUndo
};

export const redo = {
  perform: performRedo
};
