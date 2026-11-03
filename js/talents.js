// Pure talent-calculator logic: no DOM access, so it runs in the browser and under `node --test`.
//
// Data shapes:
//   trees: { [treeKey]: { name, talents: Talent[], removed?: string[] } }
//   Talent: { id, name, icon, row (1-based), col (1-based), desc: string[] (one per rank),
//             requires?: talentId, meta?, change?, patchNotes?, assumed?, formerName? }
//   alloc: { [talentId]: rank }

export const TOTAL_POINTS = 51;
export const ROWS = 7;
export const COLS = 4;
export const POINTS_PER_ROW = 5;
export const FIRST_TALENT_LEVEL = 10;

export const maxRank = t => t.desc.length;
export const rowRequirement = row => (row - 1) * POINTS_PER_ROW;
export const requiredLevel = spent => (spent > 0 ? spent + FIRST_TALENT_LEVEL - 1 : null);

/**
 * Apply a patch diff ({ trees: { [key]: { remove, modify, add } } }) to base trees.
 * Patched talents get `change` ("new" | "changed" | "moved") and `patchNotes`.
 * Row moves and rank-count changes are annotated automatically.
 */
export function applyPatch(baseTrees, patch) {
  const result = {};
  for (const treeKey in baseTrees) {
    const base = baseTrees[treeKey];
    const tp = { remove: [], modify: {}, add: [], ...patch.trees[treeKey] };
    const removed = new Set(tp.remove);

    const talents = base.talents
      .filter(t => !removed.has(t.id))
      .map(t => {
        const mod = tp.modify[t.id];
        if (!mod) return { ...t };
        const { notes = [], assumed, ...fields } = mod;
        const next = { ...t, ...fields };
        const auto = [];
        if (next.row !== t.row) auto.push(`Moved to row ${next.row} (was row ${t.row}).`);
        if (next.desc.length !== t.desc.length) {
          auto.push(`Now ${next.desc.length} rank${next.desc.length > 1 ? "s" : ""} (was ${t.desc.length}).`);
        }
        const onlyMoved = Object.keys(fields).every(k => k === "row" || k === "col") && notes.length === 0;
        next.change = onlyMoved ? "moved" : "changed";
        next.patchNotes = [...auto, ...notes];
        next.assumed = assumed;
        if (next.name !== t.name) next.formerName = t.name;
        return next;
      });

    for (const { notes = [], ...t } of tp.add) {
      talents.push({ ...t, change: "new", patchNotes: ["New talent.", ...notes] });
    }

    result[treeKey] = {
      name: base.name,
      talents,
      removed: base.talents.filter(t => removed.has(t.id)).map(t => t.name)
    };
  }
  return result;
}

/** Returns human-readable problems with a set of trees (empty array = valid). */
export function validateTrees(trees) {
  const errors = [];
  for (const treeKey in trees) {
    const tree = trees[treeKey];
    const byId = {};
    const slots = {};
    for (const t of tree.talents) {
      if (byId[t.id]) errors.push(`${tree.name}: duplicate id ${t.id}`);
      byId[t.id] = t;
      if (t.row < 1 || t.row > ROWS || t.col < 1 || t.col > COLS) {
        errors.push(`${tree.name}: ${t.name} out of grid (row ${t.row}, col ${t.col})`);
      }
      const key = `${t.row},${t.col}`;
      if (slots[key]) errors.push(`${tree.name}: ${t.name} and ${slots[key].name} share row ${t.row} col ${t.col}`);
      slots[key] = t;
      if (!Array.isArray(t.desc) || t.desc.length === 0) errors.push(`${tree.name}: ${t.name} has no rank descriptions`);
      if (t.desc && t.desc.length > 9) errors.push(`${tree.name}: ${t.name} has more than 9 ranks (breaks build links)`);
    }
    for (const t of tree.talents) {
      if (!t.requires) continue;
      const p = byId[t.requires];
      if (!p) { errors.push(`${tree.name}: ${t.name} requires missing talent ${t.requires}`); continue; }
      if (p.col !== t.col || p.row >= t.row) {
        errors.push(`${tree.name}: ${t.name} requires ${p.name}, which is not directly above it`);
        continue;
      }
      for (let r = p.row + 1; r < t.row; r++) {
        const blocker = slots[`${r},${t.col}`];
        if (blocker) errors.push(`${tree.name}: arrow ${p.name} → ${t.name} is blocked by ${blocker.name}`);
      }
    }
  }
  return errors;
}

// --- Point allocation rules -------------------------------------------------

const rankOf = (alloc, id) => alloc[id] || 0;

export const treeSpent = (tree, alloc) => tree.talents.reduce((s, t) => s + rankOf(alloc, t.id), 0);

export const totalSpent = (trees, alloc) =>
  Object.values(trees).reduce((s, tree) => s + treeSpent(tree, alloc), 0);

const pointsAboveRow = (tree, alloc, row) =>
  tree.talents.filter(t => t.row < row).reduce((s, t) => s + rankOf(alloc, t.id), 0);

const prereqMet = (tree, alloc, talent) => {
  if (!talent.requires) return true;
  const parent = tree.talents.find(t => t.id === talent.requires);
  return !!parent && rankOf(alloc, parent.id) >= maxRank(parent);
};

/** True if every invested talent in the tree satisfies rank caps, row gates and prerequisites. */
export function isTreeLegal(tree, alloc) {
  return tree.talents.every(t => {
    const rank = rankOf(alloc, t.id);
    if (rank === 0) return true;
    if (rank < 0 || rank > maxRank(t)) return false;
    if (pointsAboveRow(tree, alloc, t.row) < rowRequirement(t.row)) return false;
    return prereqMet(tree, alloc, t);
  });
}

export function isBuildLegal(trees, alloc) {
  return totalSpent(trees, alloc) <= TOTAL_POINTS && Object.values(trees).every(tree => isTreeLegal(tree, alloc));
}

// Adding and removing both reduce to "is the resulting tree still legal?", so the
// rules live in one place (isTreeLegal).
export function canAddPoint(trees, treeKey, talent, alloc) {
  if (totalSpent(trees, alloc) >= TOTAL_POINTS) return false;
  if (rankOf(alloc, talent.id) >= maxRank(talent)) return false;
  return isTreeLegal(trees[treeKey], { ...alloc, [talent.id]: rankOf(alloc, talent.id) + 1 });
}

export function canRemovePoint(trees, treeKey, talent, alloc) {
  if (rankOf(alloc, talent.id) <= 0) return false;
  return isTreeLegal(trees[treeKey], { ...alloc, [talent.id]: rankOf(alloc, talent.id) - 1 });
}

/** Unmet requirements for a talent, for tooltips. */
export function missingRequirements(trees, treeKey, talent, alloc) {
  const tree = trees[treeKey];
  const out = [];
  const need = rowRequirement(talent.row);
  if (treeSpent(tree, alloc) < need) out.push(`Requires ${need} points in ${tree.name} Talents`);
  if (!prereqMet(tree, alloc, talent)) {
    const parent = tree.talents.find(t => t.id === talent.requires);
    const n = maxRank(parent);
    out.push(`Requires ${n} point${n > 1 ? "s" : ""} in ${parent.name}`);
  }
  return out;
}

// --- Build links ------------------------------------------------------------
// A build is encoded per tree as one digit per talent (in row/col order), trailing
// zeros trimmed, trees joined by "-". Example: "325-0021-" .

const orderedTalents = tree => tree.talents.slice().sort((a, b) => a.row - b.row || a.col - b.col);

export function encodeBuild(trees, alloc) {
  return Object.values(trees)
    .map(tree => orderedTalents(tree).map(t => rankOf(alloc, t.id)).join("").replace(/0+$/, ""))
    .join("-");
}

/** Decode a build string. Returns an alloc object, or null if malformed or illegal. */
export function decodeBuild(trees, code) {
  const parts = String(code).split("-");
  const treeList = Object.values(trees);
  if (parts.length !== treeList.length || parts.some(p => !/^\d*$/.test(p))) return null;
  const alloc = {};
  for (let i = 0; i < treeList.length; i++) {
    const talents = orderedTalents(treeList[i]);
    if (parts[i].length > talents.length) return null;
    talents.forEach((t, j) => { alloc[t.id] = Number(parts[i][j] || 0); });
  }
  return isBuildLegal(trees, alloc) ? alloc : null;
}
