/* app.js - modular, completo (drag, indent, undo/redo, modal, export, etc.) */

const API = "/tree";
let tree = [];
let undoStack = [];
let redoStack = [];
let dragId = null;
let filter = "";
let editingId = null;

const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

function pushHistory() { undoStack.push(JSON.stringify(tree)); redoStack = []; }
function undo() { if(!undoStack.length) return; redoStack.push(JSON.stringify(tree)); tree = JSON.parse(undoStack.pop()); save(); render(); }
function redo() { if(!redoStack.length) return; undoStack.push(JSON.stringify(tree)); tree = JSON.parse(redoStack.pop()); save(); render(); }

function ensure(arr){
  for(const n of arr){
    if(!n.id) n.id = uid();
    if(!n.children) n.children = [];
    if(n.collapsed === undefined) n.collapsed = false;
    ensure(n.children);
  }
}

function findPath(id, arr = tree, path = []){
  for(let i=0;i<arr.length;i++){
    const n = arr[i];
    if(n.id === id) return [...path, { parent: arr, index: i }];
    const r = findPath(id, n.children, [...path, { parent: arr, index: i }]);
    if(r) return r;
  }
  return null;
}
function getNodeByPath(p){ const {parent,index} = p[p.length-1]; return parent[index]; }
function contains(node,targetId){ if(node.id===targetId) return true; return node.children.some(c=>contains(c,targetId)); }

function removeById(id, arr = tree){
  for(let i=0;i<arr.length;i++){
    if(arr[i].id===id) return arr.splice(i,1)[0];
    const r = removeById(id, arr[i].children);
    if(r) return r;
  }
}
function insertBefore(targetId,node,arr=tree){ for(let i=0;i<arr.length;i++){ if(arr[i].id===targetId){arr.splice(i,0,node);return;} insertBefore(targetId,node,arr[i].children); } }
function insertAfter(targetId,node,arr=tree){ for(let i=0;i<arr.length;i++){ if(arr[i].id===targetId){arr.splice(i+1,0,node);return;} insertAfter(targetId,node,arr[i].children); } }
function insertInto(targetId,node,arr=tree){ for(const n of arr){ if(n.id===targetId){ n.children.push(node); return;} insertInto(targetId,node,n.children); } }

function countDescendants(n){ let total = n.children.length; for(const c of n.children) total += countDescendants(c); return total; }

async function load(){ tree = await (await fetch(API)).json(); ensure(tree); render(); }
async function save(){ await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(tree)}); }

function matchFilter(n){
  if(!filter) return true;
  if(n.name.toLowerCase().includes(filter)) return true;
  return n.children.some(matchFilter);
}
function highlight(name){ if(!filter) return name; return name.replace(new RegExp(`(${filter})`,"gi"),"<mark>$1</mark>"); }

function render(){ document.getElementById("tree").innerHTML = renderList(tree,0); }

function renderList(arr,depth){
  return arr.filter(matchFilter).map(n=>`
    <div class="drop" data-drop="before" data-id="${n.id}"></div>

    <div class="row level-${depth} ${n.reviewed?'reviewed':''}" draggable="true" data-id="${n.id}">
      <span class="toggle" data-id="${n.id}">${n.collapsed?"►":"▼"}</span>
      <input type="checkbox" class="chk" ${n.reviewed?'checked':''}/>
      ${editingId===n.id ? `<input class="rename-input" data-edit="${n.id}" value="${n.name}">` : `<span class="name" data-id="${n.id}">${highlight(n.name)}</span>`}
      <button class="btn-indent-left" data-id="${n.id}">⯇</button>
      <button class="btn-indent-right" data-id="${n.id}">⯈</button>
      <button class="btn-add" data-id="${n.id}">+</button>
      <button class="btn-del" data-id="${n.id}">🗑</button>
    </div>

    <div class="drop into" data-drop="into" data-id="${n.id}"></div>

    <div class="children" style="display:${n.collapsed?'none':'block'};">
      ${renderList(n.children,depth+1)}
    </div>

    <div class="drop" data-drop="after" data-id="${n.id}"></div>
  `).join("");
}

/* DRAG & DROP */
const treeEl = document.getElementById("tree");
treeEl.addEventListener("dragstart", e=>{ const r = e.target.closest(".row"); if(r) dragId = r.dataset.id; });
treeEl.addEventListener("dragover", e=>{ const dz = e.target.closest(".drop"); if(dz){ e.preventDefault(); dz.classList.add("over"); }});
treeEl.addEventListener("dragleave", e=>{ const dz = e.target.closest(".drop"); if(dz) dz.classList.remove("over"); });
treeEl.addEventListener("drop", e=>{
  const dz = e.target.closest(".drop"); if(!dz||!dragId) return; dz.classList.remove("over");
  const target = dz.dataset.id; const kind = dz.dataset.drop;
  const dragPath = findPath(dragId); const dragNode = getNodeByPath(dragPath);
  if(contains(dragNode,target)){ showModal("No puedes meter una carpeta dentro de sí misma."); return; }
  pushHistory();
  const node = removeById(dragId);
  if(kind==="before") insertBefore(target,node);
  if(kind==="after") insertAfter(target,node);
  if(kind==="into") insertInto(target,node);
  save(); render();
});

/* CLICK HANDLER */
treeEl.addEventListener("click", e=>{
  const tgt = e.target;

  if(tgt.classList.contains("toggle")){
    const id=tgt.dataset.id; const p=findPath(id); const n=getNodeByPath(p); n.collapsed=!n.collapsed; save(); render(); return;
  }

  if(tgt.classList.contains("btn-indent-right")){
    const id=tgt.dataset.id; const p=findPath(id); if(!p||p[p.length-1].index===0) return;
    pushHistory();
    const {parent,index}=p[p.length-1];
    const node = parent.splice(index,1)[0];
    parent[index-1].children.push(node);
    save(); render(); return;
  }

  if(tgt.classList.contains("btn-indent-left")){
    const id=tgt.dataset.id; const p=findPath(id); if(p.length<2) return;
    pushHistory();
    const {parent,index}=p[p.length-1];
    const node = parent.splice(index,1)[0];
    const gp = p[p.length-2];
    gp.parent.splice(gp.index+1,0,node);
    save(); render(); return;
  }

  if(tgt.classList.contains("btn-add")){
    pushHistory();
    const n = getNodeByPath(findPath(tgt.dataset.id));
    n.children.push({ id:uid(), name:"Nueva carpeta", children:[], reviewed:false });
    save(); render(); return;
  }

  if(tgt.classList.contains("btn-del")){
    const id = tgt.dataset.id; const p = findPath(id); const n = getNodeByPath(p);
    const total = countDescendants(n);
    const text = total>0 ? `La carpeta "<b>${n.name}</b>" tiene <b>${n.children.length}</b> hijas y <b>${total}</b> descendientes. ¿Eliminar?` : `¿Eliminar la carpeta "<b>${n.name}</b>"?`;
    showModal(text, ()=>{
      pushHistory(); removeById(id); save(); render();
    });
    return;
  }

  if(tgt.classList.contains("chk")){
    const n = getNodeByPath(findPath(tgt.closest(".row").dataset.id));
    n.reviewed = tgt.checked; save(); render(); return;
  }

  if(tgt.classList.contains("name")){
    editingId = tgt.dataset.id; render(); const el = document.querySelector(`[data-edit='${editingId}']`); if(el) el.focus();
  }
});

/* RENAME handling */
treeEl.addEventListener("keydown", e=>{
  if(e.target.hasAttribute("data-edit")){
    if(e.key==="Enter"){
      const n = getNodeByPath(findPath(e.target.dataset.edit));
      pushHistory(); n.name = e.target.value.trim(); editingId = null; save(); render();
    }
    if(e.key==="Escape"){ editingId=null; render(); }
  }
});
treeEl.addEventListener("blur", e=>{
  if(e.target.hasAttribute("data-edit")){
    const n = getNodeByPath(findPath(e.target.dataset.edit));
    pushHistory(); n.name = e.target.value.trim(); editingId = null; save(); render();
  }
}, true);

/* TOP BUTTONS */
document.getElementById("add-root").onclick = ()=>{ pushHistory(); tree.push({ id:uid(), name:"Nueva carpeta", children:[], reviewed:false }); save(); render(); };
document.getElementById("undo").onclick = undo;
document.getElementById("redo").onclick = redo;
document.getElementById("filter").oninput = e=>{ filter = e.target.value.toLowerCase(); render(); };

document.getElementById("collapse-all").onclick = ()=>{ tree.forEach(n=>n.collapsed=true); save(); render(); };
document.getElementById("expand-all").onclick = ()=>{ tree.forEach(n=>n.collapsed=false); save(); render(); };

document.getElementById("exp-linux").onclick = ()=>{
  const out=[]; const walk=(n,p="")=>{ const c=(p?p+"/":"")+n.name; out.push(`mkdir -p "${c}"`); n.children.forEach(x=>walk(x,c)); };
  tree.forEach(walk); download("crear_carpetas.sh", out.join("\n"));
};
document.getElementById("exp-win").onclick = ()=>{
  const out=[]; const walk=(n,p="")=>{ const c=(p?p+"\\":"")+n.name; out.push(`mkdir "${c}"`); n.children.forEach(x=>walk(x,c)); };
  tree.forEach(walk); download("crear_carpetas.bat", out.join("\r\n"));
};
function download(name,content){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([content],{type:"text/plain"})); a.download=name; a.click(); }

/* MODAL */
function showModal(html, onConfirm){
  const bg = document.getElementById("modal-bg");
  const txt = document.getElementById("modal-text");
  const ok = document.getElementById("modal-ok");
  const cancel = document.getElementById("modal-cancel");
  txt.innerHTML = html;
  bg.style.display = "flex";
  const close = ()=>{ bg.style.display = "none"; ok.onclick = null; cancel.onclick = null; };
  cancel.onclick = close;
  ok.onclick = ()=>{ close(); if(typeof onConfirm === "function") onConfirm(); };
}

/* INIT */
load();
