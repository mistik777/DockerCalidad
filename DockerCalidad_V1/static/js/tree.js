// =====================================================
// tree.js — Gestión visual y lógica del árbol documental
// =====================================================

import { undo } from "./history.js";
import { showModal } from "./modals.js";
import { exportLinux, exportWindows } from "./export.js";
import { uid, logError } from "./utils.js";  // 🔹 Centralizado

// -----------------------------------------------------
// Variables globales
// -----------------------------------------------------
export let tree = [];
export const API = "/tree";
let filter = "";
let editingId = null;
let dragId = null;

// -----------------------------------------------------
// Acceso a los datos
// -----------------------------------------------------
export async function loadTree() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    ensure(data);
    return data;
  } catch (err) {
    logError("Error cargando el árbol", err);
    return [];
  }
}

export async function saveTree(data) {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    logError("Error guardando el árbol", err);
  }
}

export function setTree(data) { tree = data; }
export function getTree() { return tree; }

// -----------------------------------------------------
// Funciones auxiliares internas
// -----------------------------------------------------
const visited = new WeakSet();
function ensure(arr) {
  for (const n of arr) {
    if (visited.has(n)) continue;
    visited.add(n);
    if (!n.id) n.id = uid();
    if (!n.children) n.children = [];
    if (n.collapsed === undefined) n.collapsed = false;
    if (n.reviewed === undefined) n.reviewed = false;
    ensure(n.children);
  }
}

function findPath(id, arr = tree, path = []) {
  for (let i = 0; i < arr.length; i++) {
    const n = arr[i];
    if (n.id === id) return [...path, { parent: arr, index: i }];
    const r = findPath(id, n.children, [...path, { parent: arr, index: i }]);
    if (r) return r;
  }
  return null;
}

function getNodeByPath(p) {
  const { parent, index } = p[p.length - 1];
  return parent[index];
}

function contains(node, targetId) {
  if (node.id === targetId) return true;
  return node.children.some(c => contains(c, targetId));
}

function removeById(id, arr = tree) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return arr.splice(i, 1)[0];
    const r = removeById(id, arr[i].children);
    if (r) return r;
  }
}

function insertBefore(targetId, node, arr = tree) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === targetId) {
      arr.splice(i, 0, node);
      return;
    }
    insertBefore(targetId, node, arr[i].children);
  }
}

function insertAfter(targetId, node, arr = tree) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === targetId) {
      arr.splice(i + 1, 0, node);
      return;
    }
    insertAfter(targetId, node, arr[i].children);
  }
}

function insertInto(targetId, node, arr = tree) {
  for (const n of arr) {
    if (n.id === targetId) {
      n.children.push(node);
      return;
    }
    insertInto(targetId, node, n.children);
  }
}

function countDescendants(n) {
  let total = n.children.length;
  for (const c of n.children) total += countDescendants(c);
  return total;
}

function matchFilter(n) {
  if (!filter) return true;
  if (n.name.toLowerCase().includes(filter)) return true;
  return n.children.some(matchFilter);
}

function highlight(name) {
  if (!filter) return name;
  return name.replace(new RegExp(`(${filter})`, "gi"), "<mark>$1</mark>");
}

function updateTree() {
  try {
    saveTree(tree);
    renderTree(filter);
  } catch (err) {
    logError("Error actualizando el árbol", err);
  }
}

// -----------------------------------------------------
// Renderizado
// -----------------------------------------------------
export function renderTree(currentFilter = "") {
  filter = currentFilter;
  document.getElementById("tree").innerHTML = renderList(tree, 0);
}

function renderList(arr, depth) {
  return arr.filter(matchFilter).map(n => `
    <div class="drop" data-drop="before" data-id="${n.id}"></div>

    <div class="row level-${depth} ${n.reviewed ? "reviewed" : ""}" draggable="true" data-id="${n.id}">
      <span class="toggle" data-id="${n.id}">${n.collapsed ? "►" : "▼"}</span>
      ${editingId === n.id
        ? `<input class="rename-input" data-edit="${n.id}" value="${n.name}">`
        : `<span class="name" data-id="${n.id}">${highlight(n.name)}</span>`}
      <button type="button" class="btn-indent-left" data-id="${n.id}" title="Desanidar (izquierda)">⯇</button>
      <button type="button" class="btn-indent-right" data-id="${n.id}" title="Anidar (derecha)">⯈</button>
      <button type="button" class="btn-add" data-id="${n.id}" title="Añadir subcarpeta">+</button>
      <button type="button" class="btn-del" data-id="${n.id}" title="Eliminar carpeta">🗑</button>
      <input type="checkbox" class="chk-review" title="Revisado" ${n.reviewed ? "checked" : ""}/>
    </div>

    <div class="drop into" data-drop="into" data-id="${n.id}"></div>

    <div class="children" style="display:${n.collapsed ? "none" : "block"};">
      ${renderList(n.children, depth + 1)}
    </div>

    <div class="drop" data-drop="after" data-id="${n.id}"></div>
  `).join("");
}

// -----------------------------------------------------
// Eventos del árbol
// -----------------------------------------------------
export function initTreeEvents() {
  const treeEl = document.getElementById("tree");

  // Drag & Drop
  treeEl.addEventListener("dragstart", e => {
    const r = e.target.closest(".row");
    if (r) dragId = r.dataset.id;
  });

  treeEl.addEventListener("dragover", e => {
    const dz = e.target.closest(".drop");
    if (dz) {
      e.preventDefault();
      dz.classList.add("over");
    }
  });

  treeEl.addEventListener("dragleave", e => {
    const dz = e.target.closest(".drop");
    if (dz) dz.classList.remove("over");
  });

  treeEl.addEventListener("drop", e => {
    const dz = e.target.closest(".drop");
    if (!dz || !dragId) return;
    dz.classList.remove("over");
    const target = dz.dataset.id;
    const kind = dz.dataset.drop;
    const dragPath = findPath(dragId);
    const dragNode = getNodeByPath(dragPath);
    if (contains(dragNode, target)) {
      showModal("No puedes meter una carpeta dentro de sí misma.");
      return;
    }
    undo.pushState();
    const node = removeById(dragId);
    if (kind === "before") insertBefore(target, node);
    if (kind === "after") insertAfter(target, node);
    if (kind === "into") insertInto(target, node);
    updateTree();
  });

  // Clicks (botones, toggles, checks)
  treeEl.addEventListener("click", e => {
    const tgt = e.target;

    if (tgt.classList.contains("toggle")) {
      const id = tgt.dataset.id;
      const p = findPath(id);
      const n = getNodeByPath(p);
      n.collapsed = !n.collapsed;
      updateTree();
      return;
    }

    // 🔹 Aumentar sangría (anidar)
    if (tgt.classList.contains("btn-indent-right")) {
      const id = tgt.dataset.id;
      const p = findPath(id);
      if (!p || p[p.length - 1].index === 0) return;
      undo.pushState();
      const { parent, index } = p[p.length - 1];
      const node = parent.splice(index, 1)[0];
      parent[index - 1].children.push(node);
      updateTree();
      return;
    }

    // 🔹 Disminuir sangría (desanidar)
    if (tgt.classList.contains("btn-indent-left")) {
      const id = tgt.dataset.id;
      const p = findPath(id);
      if (p.length < 2) return;
      undo.pushState();
      const { parent, index } = p[p.length - 1];
      const node = parent.splice(index, 1)[0];
      const gp = p[p.length - 2];
      gp.parent.splice(gp.index + 1, 0, node);
      updateTree();
      return;
    }

    if (tgt.classList.contains("btn-add")) {
      undo.pushState();
      const n = getNodeByPath(findPath(tgt.dataset.id));
      const newNode = { id: uid(), name: "Nueva carpeta", children: [], reviewed: false };
      n.children.push(newNode);
      updateTree();
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${newNode.id}"] .name`);
        if (el) el.click();
      }, 150);
      return;
    }

    if (tgt.classList.contains("btn-del")) {
      const id = tgt.dataset.id;
      const p = findPath(id);
      const n = getNodeByPath(p);
      const total = countDescendants(n);
      const text = total > 0
        ? `La carpeta "<b>${n.name}</b>" tiene <b>${n.children.length}</b> hijas y <b>${total}</b> descendientes. ¿Eliminar?`
        : `¿Eliminar la carpeta "<b>${n.name}</b>"?`;
      showModal(text, () => {
        undo.pushState();
        removeById(id);
        updateTree();
      });
      return;
    }

    // ✅ Checkbox Revisado
    if (tgt.classList.contains("chk-review")) {
      const row = tgt.closest(".row");
      const n = getNodeByPath(findPath(row.dataset.id));
      n.reviewed = tgt.checked;
      row.classList.toggle("reviewed", tgt.checked);
      saveTree(tree);
      return;
    }

    if (tgt.classList.contains("name")) {
      editingId = tgt.dataset.id;
      renderTree(filter);
      const el = document.querySelector(`[data-edit='${editingId}']`);
      if (el) el.focus();
    }
  });

  // Renombrar
  treeEl.addEventListener("keydown", e => {
    if (e.target.hasAttribute("data-edit")) {
      if (e.key === "Enter") {
        const n = getNodeByPath(findPath(e.target.dataset.edit));
        undo.pushState();
        n.name = e.target.value.trim();
        editingId = null;
        updateTree();
      }
      if (e.key === "Escape") {
        editingId = null;
        renderTree(filter);
      }
    }
  });

  treeEl.addEventListener("blur", e => {
    if (e.target.hasAttribute("data-edit")) {
      const n = getNodeByPath(findPath(e.target.dataset.edit));
      undo.pushState();
      n.name = e.target.value.trim();
      editingId = null;
      updateTree();
    }
  }, true);
}

// =====================================================
// Gestión de múltiples estructuras
// =====================================================
export function initStructureBar() {
  const select = document.getElementById("structure-select");
  const btnNew = document.getElementById("btn-new");
  const btnImport = document.getElementById("btn-import");
  const btnExport = document.getElementById("btn-export");
  const btnDelete = document.getElementById("btn-delete");

  async function refreshList() {
    const res = await fetch("/list");
    const files = await res.json();
    select.innerHTML = files.map(f => `<option value="${f}">${f}</option>`).join("");
  }

  select.addEventListener("change", async () => {
    const name = select.value;
    const res = await fetch(`/tree/${name}`);
    const data = await res.json();
    ensure(data); // 🔹 importante al cambiar estructura
    setTree(data);
    renderTree();
  });

  btnNew.addEventListener("click", async () => {
    const name = prompt("Nombre de la nueva estructura:", `estructura-${Date.now()}.json`);
    if (!name) return;
    await fetch(`/tree/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([])
    });
    await refreshList();
    select.value = name;
    setTree([]);
    renderTree();
  });

  btnImport.addEventListener("click", async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async e => {
      const file = e.target.files[0];
      const text = await file.text();
      let data = JSON.parse(text);
      ensure(data); // 🔹 asegura estructura válida
      const name = prompt("Guardar como:", file.name);
      if (!name) return;
      await fetch(`/tree/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      await refreshList();
      select.value = name;
      setTree(data);
      renderTree();
    };
    input.click();
  });

  btnExport.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(getTree(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = select.value || "estructura.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  btnDelete.addEventListener("click", async () => {
    const name = select.value;
    if (!name) return alert("No hay estructura seleccionada.");
    if (!confirm(`¿Eliminar ${name}?`)) return;
    await fetch(`/tree/${name}`, { method: "DELETE" });
    await refreshList();
    const first = select.options[0]?.value;
    if (first) {
      const res = await fetch(`/tree/${first}`);
      const data = await res.json();
      ensure(data);
      setTree(data);
      renderTree();
      select.value = first;
    } else {
      setTree([]);
      renderTree();
    }
  });

  refreshList();
}
