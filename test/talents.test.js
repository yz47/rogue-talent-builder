import { test } from "node:test";
import assert from "node:assert/strict";
import { BASE_TREES, PATCH } from "../js/data.js";
import {
  TOTAL_POINTS, maxRank, applyPatch, validateTrees, totalSpent,
  canAddPoint, canRemovePoint, isBuildLegal, encodeBuild, decodeBuild
} from "../js/talents.js";

const PATCHED = applyPatch(BASE_TREES, PATCH);
const find = (trees, treeKey, id) => trees[treeKey].talents.find(t => t.id === id);
const byName = (trees, treeKey, name) => trees[treeKey].talents.find(t => t.name === name);

test("pre-patch and patched trees pass layout validation", () => {
  assert.deepEqual(validateTrees(BASE_TREES), []);
  assert.deepEqual(validateTrees(PATCHED), []);
});

test("validateTrees catches overlapping slots and blocked arrows", () => {
  const broken = {
    t: { name: "T", talents: [
      { id: "a", name: "A", row: 1, col: 1, desc: ["x"] },
      { id: "b", name: "B", row: 1, col: 1, desc: ["x"] },
      { id: "c", name: "C", row: 2, col: 2, desc: ["x"] },
      { id: "d", name: "D", row: 3, col: 2, desc: ["x"] },
      { id: "e", name: "E", row: 4, col: 2, desc: ["x"], requires: "c" }
    ] }
  };
  const errors = validateTrees(broken);
  assert.ok(errors.some(e => e.includes("share row 1 col 1")));
  assert.ok(errors.some(e => e.includes("blocked by D")));
});

test("pre-patch tree matches client data shape (17/17/19 talents, 8 prerequisites)", () => {
  assert.deepEqual(Object.values(BASE_TREES).map(t => t.talents.length), [17, 17, 19]);
  const prereqs = Object.values(BASE_TREES).flatMap(t => t.talents.filter(x => x.requires));
  assert.equal(prereqs.length, 8);
});

test("Nov 2 patch: rows, ranks and removals match the patch notes", () => {
  // [tree, name, row, ranks]
  const expected = [
    ["assassination", "Improved Expose Armor", 2, 2],
    ["assassination", "Lethality", 3, 2],
    ["assassination", "Vigor", 3, 2],
    ["assassination", "Blood Splatter", 3, 1],
    ["assassination", "Relentless Strikes", 5, 5],
    ["assassination", "Venom", 5, 1],
    ["assassination", "Seal Fate", 6, 3],
    ["assassination", "Mutilate", 7, 1],
    ["combat", "Coup de Grace", 1, 3],
    ["combat", "Efficient Strikes", 1, 2],
    ["combat", "Improved Sprint", 2, 2],
    ["combat", "Composure", 3, 2],
    ["combat", "Weapon Expertise", 4, 2],
    ["combat", "Aggression", 4, 3],
    ["combat", "Dual Wield Specialization", 5, 2],
    ["combat", "Flash of Steel", 6, 5],
    ["subtlety", "Setup", 1, 3],
    ["subtlety", "Opportunity", 1, 5],
    ["subtlety", "Dirty Deeds", 2, 2],
    ["subtlety", "Camouflage", 2, 3],
    ["subtlety", "Premeditation", 3, 1],
    ["subtlety", "Serrated Blades", 3, 3],
    ["subtlety", "Elusiveness", 4, 2],
    ["subtlety", "Ghostly Strike", 4, 1],
    ["subtlety", "Quick Getaway", 4, 2],
    ["subtlety", "Heightened Senses", 5, 2],
    ["subtlety", "Boot Knife", 6, 5],
    ["subtlety", "Death Mark", 7, 1]
  ];
  for (const [tree, name, row, ranks] of expected) {
    const t = byName(PATCHED, tree, name);
    assert.ok(t, `${name} exists`);
    assert.equal(t.row, row, `${name} row`);
    assert.equal(maxRank(t), ranks, `${name} ranks`);
  }
  const removed = ["Murder", "Improved Distract", "Quietus", "Cutthroat", "Thousand Cuts",
    "Improved Eviscerate", "Improved Sinister Strike"];
  for (const name of removed) {
    for (const tree in PATCHED) assert.equal(byName(PATCHED, tree, name), undefined, `${name} gone`);
  }
});

test("Nov 2 patch: new talents are tagged and renamed talents keep their former name", () => {
  assert.equal(find(PATCHED, "subtlety", "death_mark").change, "new");
  assert.equal(find(PATCHED, "assassination", "imp_ea").change, "moved");
  assert.equal(find(PATCHED, "combat", "imp_evisc").formerName, "Improved Eviscerate");
  assert.equal(find(PATCHED, "assassination", "malice").change, undefined);
});

test("row gating: row N needs 5*(N-1) points spent above it", () => {
  const alloc = {};
  const ruth = find(PATCHED, "assassination", "ruthlessness");
  assert.equal(canAddPoint(PATCHED, "assassination", ruth, alloc), false);
  alloc.malice = 5;
  assert.equal(canAddPoint(PATCHED, "assassination", ruth, alloc), true);
});

test("prerequisite must be maxed, and cannot be reduced while dependent is invested", () => {
  const leth = find(PATCHED, "assassination", "lethality");
  const malice = find(PATCHED, "assassination", "malice");
  const alloc = { malice: 4, imp_gouge: 3, remorseless: 2, ruthlessness: 1 };
  assert.equal(canAddPoint(PATCHED, "assassination", leth, alloc), false);
  alloc.malice = 5;
  assert.equal(canAddPoint(PATCHED, "assassination", leth, alloc), true);
  alloc.lethality = 1;
  assert.equal(canRemovePoint(PATCHED, "assassination", malice, alloc), false);
});

test("cannot remove a point that gates a deeper row", () => {
  const alloc = { imp_gouge: 3, remorseless: 2, ruthlessness: 3, imp_ea: 2, vigor: 1 };
  assert.equal(canRemovePoint(PATCHED, "assassination", find(PATCHED, "assassination", "imp_gouge"), alloc), false);
  assert.equal(canRemovePoint(PATCHED, "assassination", find(PATCHED, "assassination", "vigor"), alloc), true);
});

test(`total points are capped at ${TOTAL_POINTS}`, () => {
  const alloc = {};
  // Max out talents tree by tree, top to bottom, until nothing more can be added.
  for (const treeKey in PATCHED) {
    const ordered = PATCHED[treeKey].talents.slice().sort((a, b) => a.row - b.row || a.col - b.col);
    for (const t of ordered) {
      while (canAddPoint(PATCHED, treeKey, t, alloc)) alloc[t.id] = (alloc[t.id] || 0) + 1;
    }
  }
  assert.equal(totalSpent(PATCHED, alloc), TOTAL_POINTS);
  assert.ok(isBuildLegal(PATCHED, alloc));
});

test("each patched tree can reach its row 7 talent", () => {
  for (const treeKey in PATCHED) {
    const tree = PATCHED[treeKey];
    const alloc = {};
    const ordered = tree.talents.slice().sort((a, b) => a.row - b.row || a.col - b.col);
    for (const t of ordered) {
      while (canAddPoint(PATCHED, treeKey, t, alloc)) alloc[t.id] = (alloc[t.id] || 0) + 1;
    }
    const capstone = tree.talents.find(t => t.row === 7);
    assert.equal(alloc[capstone.id], 1, `${tree.name} capstone reachable`);
  }
});

test("build links round-trip and reject illegal builds", () => {
  const alloc = { malice: 5, imp_gouge: 3, remorseless: 2, lethality: 2, imp_ss: 2 };
  const code = encodeBuild(PATCHED, alloc);
  const decoded = decodeBuild(PATCHED, code);
  for (const [id, rank] of Object.entries(alloc)) assert.equal(decoded[id], rank);
  assert.equal(totalSpent(PATCHED, decoded), 14);

  assert.equal(decodeBuild(PATCHED, "1-2"), null, "wrong tree count");
  assert.equal(decodeBuild(PATCHED, "abc--"), null, "non-digits");
  assert.equal(decodeBuild(PATCHED, "0000000000000000000000001--"), null, "too many digits");
  assert.equal(decodeBuild(PATCHED, "0003--"), null, "row 2 talent with no points above");
  assert.deepEqual(decodeBuild(PATCHED, "--"), Object.fromEntries(
    Object.values(PATCHED).flatMap(t => t.talents.map(x => [x.id, 0]))));
});
