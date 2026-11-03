// UI layer: rendering, input, tooltip, and URL sync. All rules live in talents.js.
import { BASE_TREES, PATCH } from "./data.js";
import {
  TOTAL_POINTS, ROWS, COLS, maxRank, rowRequirement, requiredLevel,
  applyPatch, validateTrees, treeSpent, totalSpent,
  canAddPoint, canRemovePoint, missingRequirements, encodeBuild, decodeBuild
} from "./talents.js";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/large/";

// Mode keys double as the URL prefix in build links (#nov2:... / #pre:...).
const MODES = {
  nov2: { trees: applyPatch(BASE_TREES, PATCH), subtitle: `Updated for the ${PATCH.label}` },
  pre: { trees: BASE_TREES, subtitle: "Pre-patch talents (beta client build 1.60.1.70753)" }
};
const DEFAULT_MODE = "nov2";

let mode = DEFAULT_MODE;
let alloc = {};

const $ = id => document.getElementById(id);
const trees = () => MODES[mode].trees;
const findTalent = (treeKey, id) => trees()[treeKey].talents.find(t => t.id === id);

// --- URL sync ---------------------------------------------------------------

function writeHash() {
  const build = encodeBuild(trees(), alloc);
  const empty = /^-*$/.test(build);
  const hash = empty && mode === DEFAULT_MODE ? "" : `#${mode}:${empty ? "" : build}`;
  history.replaceState(null, "", location.pathname + location.search + hash);
}

function readHash() {
  const m = location.hash.match(/^#(\w+):?([\d-]*)$/);
  if (!m || !MODES[m[1]]) return false;
  mode = m[1];
  alloc = (m[2] && decodeBuild(trees(), m[2])) || {};
  return true;
}

// --- Actions ----------------------------------------------------------------

function setMode(next) {
  if (next === mode) return;
  mode = next;
  alloc = {};
  update();
}

function resetAll() {
  alloc = {};
  update();
}

async function copyLink() {
  const btn = $("copy-link");
  try {
    await navigator.clipboard.writeText(location.href);
    btn.textContent = "Link copied!";
  } catch {
    btn.textContent = "Copy failed — use the address bar";
  }
  setTimeout(() => { btn.textContent = "Copy build link"; }, 1600);
}

function step(e, treeKey, talent, dir) {
  const can = dir > 0 ? canAddPoint : canRemovePoint;
  let changed = false;
  do {
    if (!can(trees(), treeKey, talent, alloc)) break;
    alloc = { ...alloc, [talent.id]: (alloc[talent.id] || 0) + dir };
    changed = true;
  } while (e.shiftKey);
  if (changed) {
    update();
    showTooltip(e, talent, treeKey);
  }
}

function update() {
  writeHash();
  render();
}

// --- Rendering --------------------------------------------------------------

function render() {
  const container = $("trees");
  container.innerHTML = "";
  const patched = mode === "nov2";
  const showChanges = patched && $("show-changes").checked;
  container.classList.toggle("show-changes", showChanges);

  const spent = totalSpent(trees(), alloc);
  $("pts-left").textContent = TOTAL_POINTS - spent;
  $("tree-summary").textContent = Object.values(trees()).map(t => treeSpent(t, alloc)).join(" / ");
  $("req-level").textContent = requiredLevel(spent) ?? "—";
  $("mode-nov2").classList.toggle("on", patched);
  $("mode-pre").classList.toggle("on", !patched);
  $("subtitle").textContent = MODES[mode].subtitle;
  $("legend").style.visibility = showChanges ? "visible" : "hidden";
  $("show-changes-wrap").style.visibility = patched ? "visible" : "hidden";

  for (const treeKey in trees()) {
    const tree = trees()[treeKey];
    const spentHere = treeSpent(tree, alloc);

    const panel = document.createElement("div");
    panel.className = "tree-panel";
    panel.innerHTML = `
      <div class="tree-header">
        <span class="tree-title">${tree.name}</span>
        <span class="tree-points">${spentHere}</span>
      </div>`;

    const tiers = document.createElement("div");
    tiers.className = "grid-tiers";
    const slotEls = {};

    for (let r = 1; r <= ROWS; r++) {
      const tierRow = document.createElement("div");
      tierRow.className = "tier-row" + (spentHere < rowRequirement(r) ? " locked" : "");

      for (let c = 1; c <= COLS; c++) {
        const t = tree.talents.find(item => item.row === r && item.col === c);
        const slot = document.createElement("div");
        if (!t) {
          slot.className = "talent-slot empty";
        } else {
          const rank = alloc[t.id] || 0;
          const max = maxRank(t);
          slot.className = "talent-slot " + (rank === max ? "maxed" : rank > 0 ? "active" : "uninvested");
          slot.innerHTML =
            `<div class="t-icon" style="background-image:url('${ICON_BASE}${t.icon}.jpg')"></div>` +
            `<div class="t-ranks">${rank}/${max}</div>` +
            (t.change ? `<div class="t-tag ${t.change}"></div>` : "");
          slot.onclick = e => step(e, treeKey, t, +1);
          slot.oncontextmenu = e => { e.preventDefault(); step(e, treeKey, t, -1); };
          slot.onmouseenter = e => showTooltip(e, t, treeKey);
          slot.onmousemove = moveTooltip;
          slot.onmouseleave = hideTooltip;
          slotEls[t.id] = slot;
        }
        tierRow.appendChild(slot);
      }
      tiers.appendChild(tierRow);
    }
    panel.appendChild(tiers);
    container.appendChild(panel);
    drawArrows(tree, tiers, slotEls);
  }
}

function drawArrows(tree, tiers, slotEls) {
  for (const t of tree.talents) {
    if (!t.requires) continue;
    const from = slotEls[t.requires];
    const to = slotEls[t.id];
    const parent = tree.talents.find(p => p.id === t.requires);
    const arrow = document.createElement("div");
    arrow.className = "prereq-arrow" + ((alloc[parent.id] || 0) >= maxRank(parent) ? " met" : "");
    const top = from.offsetTop + from.offsetHeight;
    arrow.style.left = (from.offsetLeft + from.offsetWidth / 2) + "px";
    arrow.style.top = top + "px";
    arrow.style.height = Math.max(0, to.offsetTop - top - 6) + "px";
    tiers.appendChild(arrow);
  }
}

function renderPatchPanel() {
  const li = s => `<li>${s}</li>`;
  let html = `<h3>Baseline</h3><ul>${PATCH.baseline.map(li).join("")}</ul>`;
  for (const tree of Object.values(MODES.nov2.trees)) {
    const changed = tree.talents.filter(t => t.change).sort((a, b) => a.row - b.row || a.col - b.col);
    const items = changed.map(t => {
      const title = t.formerName ? `${t.formerName} → ${t.name}` : t.name;
      const assumed = t.assumed ? ` <span class="assume">(${t.assumed})</span>` : "";
      return li(`<b>${title}</b>: ${t.patchNotes.join(" ")}${assumed}`);
    });
    if (tree.removed.length) items.push(li(`<b>Removed:</b> ${tree.removed.join(", ")}.`));
    html += `<h3>${tree.name}</h3><ul>${items.join("")}</ul>`;
  }
  $("patch-body").innerHTML = html;
}

// --- Tooltip ----------------------------------------------------------------

const tooltip = $("tooltip");

function metaHtml(meta) {
  if (!meta) return "";
  const pair = (a, b) => (a || b) ? `<div class="tt-meta"><span>${a || ""}</span><span>${b || ""}</span></div>` : "";
  return pair(meta.cost, meta.range) + pair(meta.cast, meta.cooldown) +
    (meta.requirement ? `<div class="tt-req">${meta.requirement}</div>` : "");
}

const CHANGE_LABELS = { new: "New in Nov 2 patch", changed: "Changed in Nov 2 patch", moved: "Moved in Nov 2 patch" };

function showTooltip(e, talent, treeKey) {
  const rank = alloc[talent.id] || 0;
  const max = maxRank(talent);

  let html = `<div class="tt-title">${talent.name}</div><div class="tt-ranks">Rank ${rank}/${max}</div>`;
  html += metaHtml(talent.meta);
  html += `<div class="tt-desc">${talent.desc[Math.max(rank - 1, 0)]}</div>`;
  if (rank > 0 && rank < max) html += `<div class="tt-next">Next rank:<br>${talent.desc[rank]}</div>`;
  html += missingRequirements(trees(), treeKey, talent, alloc).map(m => `<div class="tt-error">${m}</div>`).join("");

  if (mode === "nov2" && talent.change) {
    html += `<div class="tt-patch ${talent.change}"><div class="lbl">${CHANGE_LABELS[talent.change]}</div>` +
      (talent.formerName ? `<div>Formerly ${talent.formerName}.</div>` : "") +
      talent.patchNotes.filter(n => n !== "New talent.").map(n => `<div>${n}</div>`).join("") +
      (talent.assumed ? `<div class="assume">Layout: ${talent.assumed}</div>` : "") +
      `</div>`;
  }

  tooltip.innerHTML = html;
  tooltip.style.display = "block";
  moveTooltip(e);
}

function moveTooltip(e) {
  const pad = 16;
  const w = tooltip.offsetWidth;
  const h = tooltip.offsetHeight;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + w > window.innerWidth - 8) x = Math.max(8, e.clientX - w - pad);
  if (y + h > window.innerHeight - 8) y = Math.max(8, window.innerHeight - h - 8);
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}

function hideTooltip() {
  tooltip.style.display = "none";
}

// --- Boot -------------------------------------------------------------------

const dataErrors = Object.entries(MODES).flatMap(([key, m]) => validateTrees(m.trees).map(e => `[${key}] ${e}`));
if (dataErrors.length) {
  $("data-error").style.display = "block";
  $("data-error").textContent = "Talent data problems:\n" + dataErrors.join("\n");
  console.error(dataErrors);
}

$("mode-nov2").onclick = () => setMode("nov2");
$("mode-pre").onclick = () => setMode("pre");
$("reset").onclick = resetAll;
$("copy-link").onclick = copyLink;
$("show-changes").onchange = render;
// Taps outside a talent dismiss the tooltip (touch devices have no mouseleave).
document.addEventListener("click", e => { if (!e.target.closest(".talent-slot")) hideTooltip(); });
window.addEventListener("resize", render);
window.addEventListener("hashchange", () => { if (readHash()) render(); });

readHash();
renderPatchPanel();
render();
