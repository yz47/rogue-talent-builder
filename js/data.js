// Talent data for the WoW Forever Rogue calculator.
//
// BASE_TREES is the pre-patch tree (beta client data, build 1.60.1.70753).
// PATCH describes the Nov 2 changes as a diff on top of it; js/talents.js applies it.
// To add a future patch, add another diff object shaped like PATCH.

/**
 * Build per-rank tooltip strings from a template. Each "{}" in the template is
 * filled from the next value array, indexed by rank. The number of ranks is the
 * length of the first array, so a talent's max rank is always desc.length.
 *   ranks("Increases crit by {}%.", [1, 2, 3])  ->  3 ranks
 */
export function ranks(template, ...values) {
  return values[0].map((_, i) => {
    let k = 0;
    return template.replace(/\{\}/g, () => values[k++][i]);
  });
}

// ---------------------------------------------------------------------------
// BASE: pre-patch talent trees (WoW Forever beta client data, build 1.60.1.70753).
// Rows and columns are 1-based. `requires` = prerequisite talent (must be maxed).
// ---------------------------------------------------------------------------
export const BASE_TREES = {
  assassination: {
    name: "Assassination",
    talents: [
      { id: "imp_gouge", name: "Improved Gouge", icon: "ability_gouge", row: 1, col: 1,
        desc: ranks("Increases the duration of your Gouge ability by {} sec.", [0.5, 1, 1.5]) },
      { id: "remorseless", name: "Remorseless Attacks", icon: "ability_fiegndead", row: 1, col: 2,
        desc: ranks("After killing a non-trivial enemy, gives you a {}% increased critical strike chance on your next Sinister Strike, Backstab, Ambush, Mutilate, or Ghostly Strike. Lasts 20 sec.", [20, 40]) },
      { id: "malice", name: "Malice", icon: "ability_racial_bloodrage", row: 1, col: 3,
        desc: ranks("Increases your critical strike chance with all attacks and Poisons by {}%.", [1, 2, 3, 4, 5]) },

      { id: "ruthlessness", name: "Ruthlessness", icon: "ability_druid_disembowel", row: 2, col: 1,
        desc: ranks("Gives your finishing moves a {}% chance to add a Combo Point to your target.", [20, 40, 60]) },
      { id: "murder", name: "Murder", icon: "spell_shadow_deathscream", row: 2, col: 2,
        desc: ranks("Increases all damage dealt by {}% against Humanoid and Giant targets.", [2, 4]) },
      { id: "imp_snd", name: "Improved Slice and Dice", icon: "ability_rogue_slicedice", row: 2, col: 4,
        desc: ranks("Increases the duration of your Slice and Dice ability by {}%.", [15, 30, 45]) },

      { id: "relentless", name: "Relentless Strikes", icon: "ability_warrior_decisivestrike", row: 3, col: 1,
        desc: ["Your finishing moves have a 20% chance per Combo Point to restore 25 Energy."] },
      { id: "imp_ea", name: "Improved Expose Armor", icon: "ability_warrior_riposte", row: 3, col: 2,
        desc: ranks("Reduces the Energy cost of your Expose Armor ability by {}, and refunds {} Combo Points when cast with 5 Combo Points.", [5, 10], [1, 2]) },
      { id: "lethality", name: "Lethality", icon: "ability_criticalstrike", row: 3, col: 3, requires: "malice",
        desc: ranks("Increases the critical strike damage bonus of your Sinister Strike, Gouge, Backstab, Mutilate, Ghostly Strike, and Hemorrhage abilities by {}%.", [4, 8, 12, 16, 20]) },

      { id: "vile_poisons", name: "Vile Poisons", icon: "ability_rogue_feigndeath", row: 4, col: 1,
        desc: ranks("Increases the damage dealt by your poisons by {}% and gives your poisons an additional {}% chance to resist dispel effects.", [4, 8, 12, 16, 20], [8, 16, 24, 32, 40]) },
      { id: "cold_blood", name: "Cold Blood", icon: "spell_ice_lament", row: 4, col: 2,
        meta: { cast: "Instant", cooldown: "3 min cooldown" },
        desc: ["When activated, increases the critical strike chance of your next Sinister Strike, Backstab, Ambush, Eviscerate, or Mutilate by 100%."] },
      { id: "imp_poisons", name: "Improved Poisons", icon: "ability_poisons", row: 4, col: 3,
        desc: ranks("Increases the chance to apply Poisons to your target by {}%, and gives Poison applications a {}% chance to not consume a charge.", [2, 4, 6, 8, 10], [10, 20, 30, 40, 50]) },

      { id: "vigor", name: "Vigor", icon: "spell_nature_earthbindtotem", row: 5, col: 1,
        desc: ranks("Increases your maximum Energy by {}.", [5, 10]) },
      { id: "mutilate", name: "Mutilate", icon: "ability_rogue_deadlybrew", row: 5, col: 2,
        meta: { cost: "60 Energy", range: "Melee range", cast: "Instant", requirement: "Requires Daggers" },
        desc: ["Instantly attacks with both weapons for 75% weapon damage plus an additional 17 with each weapon. Damage increased by 20% against Poisoned targets. Awards 2 Combo Points."] },
      { id: "imp_kidney", name: "Improved Kidney Shot", icon: "ability_rogue_kidneyshot", row: 5, col: 3,
        desc: ranks("Enemies Stunned by your Kidney Shot ability take {}% increased damage from your poisons and attacks.", [5, 10]) },

      { id: "seal_fate", name: "Seal Fate", icon: "spell_shadow_chilltouch", row: 6, col: 3,
        desc: ranks("Your critical strikes from abilities that add Combo Points have a {}% chance to add an additional Combo Point.", [20, 40, 60, 80, 100]) },

      { id: "venom", name: "Venom", icon: "inv_sword_31", row: 7, col: 2, requires: "mutilate",
        meta: { cost: "25 Energy", cast: "Instant", requirement: "Requires Melee Weapon" },
        desc: ["Finishing move that increases the damage of your Poisons by 30% and your chance to apply Poisons by 10%. Lasts longer per combo point:<br>1 point: 9 sec<br>2 points: 12 sec<br>3 points: 15 sec<br>4 points: 18 sec<br>5 points: 21 sec"] }
    ]
  },
  combat: {
    name: "Combat",
    talents: [
      { id: "imp_evisc", name: "Improved Eviscerate", icon: "ability_rogue_eviscerate", row: 1, col: 1,
        desc: ranks("Increases the damage done by your Eviscerate ability by {}%.", [7, 13, 20]) },
      { id: "imp_ss", name: "Improved Sinister Strike", icon: "spell_shadow_ritualofsacrifice", row: 1, col: 2,
        desc: ranks("Reduces the Energy cost of your Sinister Strike ability by {}.", [3, 5]) },
      { id: "lightning_reflexes", name: "Lightning Reflexes", icon: "spell_nature_invisibilty", row: 1, col: 3,
        desc: ranks("Increases your Dodge chance by {}%.", [1, 2, 3, 4, 5]) },

      { id: "puncturing_wounds", name: "Puncturing Wounds", icon: "ability_backstab", row: 2, col: 1,
        desc: ranks("Increases the critical strike chance of your Backstab by {}% and your Mutilate by {}%, and gives Backstab a {}% chance to add an additional Combo Point.", [10, 20, 30], [5, 10, 15], [15, 30, 45]) },
      { id: "deflection", name: "Deflection", icon: "ability_parry", row: 2, col: 2,
        desc: ranks("Increases your Parry chance by {}%.", [2, 4, 6]) },
      { id: "precision", name: "Precision", icon: "ability_marksmanship", row: 2, col: 3,
        desc: ranks("Improves your chance to hit by {}%.", [1, 2, 3]) },

      { id: "endurance", name: "Endurance", icon: "spell_shadow_shadowward", row: 3, col: 1,
        desc: ranks("Reduces the cooldown of your Sprint and Evasion abilities by {}%.", [30, 60]) },
      { id: "riposte", name: "Riposte", icon: "ability_warrior_challange", row: 3, col: 2, requires: "deflection",
        meta: { cost: "10 Energy", range: "Melee range", cast: "Instant", cooldown: "6 sec cooldown" },
        desc: ["A strike that becomes active after parrying an opponent's attack. This attack deals 150% weapon damage and disarms the target for 6 sec."] },
      { id: "imp_sprint", name: "Improved Sprint", icon: "ability_rogue_sprint", row: 3, col: 4,
        desc: ranks("Gives a {}% chance to remove all movement impairing effects when you activate your Sprint ability.", [50, 100]) },

      { id: "imp_kick", name: "Improved Kick", icon: "ability_kick", row: 4, col: 1,
        desc: ranks("Gives your Kick ability a {}% chance to Silence the target for 2 sec.", [50, 100]) },
      { id: "flawless_exec", name: "Flawless Execution", icon: "inv_sword_35", row: 4, col: 2,
        desc: ["Reduces the Energy cost of your Eviscerate ability by 10."] },
      { id: "dw_spec", name: "Dual Wield Specialization", icon: "ability_dualwield", row: 4, col: 3, requires: "precision",
        desc: ranks("Increases the damage done by your off-hand weapon by {}%.", [5, 10, 15, 20, 25]) },

      { id: "blade_flurry", name: "Blade Flurry", icon: "ability_warrior_punishingblow", row: 5, col: 2,
        meta: { cost: "25 Energy", cast: "Instant", cooldown: "2 min cooldown" },
        desc: ["Increases your melee attack speed by 20% and your melee attacks strike an additional nearby opponent. Lasts 15 sec."] },
      { id: "hack_and_slash", name: "Hack and Slash", icon: "inv_sword_27", row: 5, col: 3,
        desc: ranks("Gives your melee weapon attacks a benefit depending on the weapon.<br><br>Axe/Sword: Your successful melee attacks have a {}% chance to trigger an extra attack on the target.<br><br>Dagger/Fist: Increases your critical strike chance by {}%.<br><br>Mace: Your attacks ignore {}% of your target's armor.", [1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [3, 6, 9, 12, 15]) },

      { id: "weapon_expertise", name: "Weapon Expertise", icon: "spell_holy_blessingofstrength", row: 6, col: 2, requires: "blade_flurry",
        desc: ranks("Reduces the chance for your attacks to be Dodged or Parried by {}%.", [1, 2]) },
      { id: "aggression", name: "Aggression", icon: "ability_racial_avatar", row: 6, col: 3,
        desc: ranks("Increases the damage of your Sinister Strike, Backstab, and Eviscerate abilities by {}%.", [2, 4, 6]) },

      { id: "adrenaline_rush", name: "Adrenaline Rush", icon: "spell_shadow_shadowworddominate", row: 7, col: 2,
        meta: { cast: "Instant", cooldown: "5 min cooldown" },
        desc: ["Increases your Energy regeneration rate by 100% for 15 sec."] }
    ]
  },
  subtlety: {
    name: "Subtlety",
    talents: [
      { id: "camouflage", name: "Camouflage", icon: "ability_stealth", row: 1, col: 1,
        desc: ranks("Reduces your speed penalty from your Stealth ability by {}% and reduces its cooldown by {} sec.", [3, 6, 9, 12, 15], [2, 3, 4, 5, 6]) },
      { id: "master_of_deception", name: "Master of Deception", icon: "spell_shadow_charm", row: 1, col: 2,
        desc: ranks("Reduces the chance enemies have to detect you while in Stealth mode as if you were {} higher.", ["1 level", "2 levels", "3 levels"]) },
      { id: "opportunity", name: "Opportunity", icon: "ability_warrior_warcry", row: 1, col: 3,
        desc: ranks("Increases the damage dealt by your Backstab, Garrote, Ambush, and Mutilate abilities by {}%.", [5, 10]) },

      { id: "setup", name: "Setup", icon: "spell_nature_mirrorimage", row: 2, col: 1,
        desc: ranks("Gives you a {}% chance to add a Combo Point to your target after Dodging one of their attacks or fully resisting one of their spells.", [33, 67, 100]) },
      { id: "elusiveness", name: "Elusiveness", icon: "spell_magic_lesserinvisibilty", row: 2, col: 2,
        desc: ranks("Reduces the cooldown of your Vanish and Blind abilities by {} sec.", [45, 90]) },
      { id: "dirty_tricks", name: "Dirty Tricks", icon: "ability_sap", row: 2, col: 3,
        desc: ranks("Reduces the Energy cost of your Sap and Blind abilities by {}%.", [25, 50]) },
      { id: "imp_ambush", name: "Improved Ambush", icon: "ability_rogue_ambush", row: 2, col: 4,
        desc: ranks("Increases the critical strike chance of your Ambush ability by {}%.", [15, 30, 45]) },

      { id: "initiative", name: "Initiative", icon: "spell_shadow_fumble", row: 3, col: 1,
        desc: ranks("Gives you a {}% chance to add an additional combo point to your target when using your Ambush, Garrote, or Cheap Shot ability.", [33, 67, 100]) },
      { id: "ghostly_strike", name: "Ghostly Strike", icon: "spell_shadow_curse", row: 3, col: 2,
        meta: { cost: "40 Energy", range: "Melee range", cast: "Instant", cooldown: "20 sec cooldown", requirement: "Requires Melee Weapon" },
        desc: ["A strike that deals 125% (180% if a Dagger is equipped in your Main Hand) weapon damage and increases your chance to dodge by 15% for 7 sec. Awards 1 combo point."] },
      { id: "imp_distract", name: "Improved Distract", icon: "ability_rogue_distract", row: 3, col: 3,
        desc: ranks("Increases the radius of your Distract ability by {} yds, and further reduces the Stealth detection of distracted enemies as though they were an additional {} lower.", [3, 5], ["1 level", "2 levels"]) },

      { id: "heightened_senses", name: "Heightened Senses", icon: "ability_ambush", row: 4, col: 1,
        desc: ranks("Increases your Stealth detection as if you were {} higher and reduces your chance to be hit by spells and ranged attacks by {}%.", ["1 level", "3 levels"], [2, 4]) },
      { id: "premeditation", name: "Premeditation", icon: "spell_shadow_possession", row: 4, col: 2,
        meta: { range: "20 yd range", cast: "Instant", cooldown: "2 min cooldown" },
        desc: ["Adds 2 Combo Points to your target. You must add to or use those combo points within 20 sec or the combo points are lost."] },
      { id: "serrated_blades", name: "Serrated Blades", icon: "inv_sword_17", row: 4, col: 3,
        desc: ranks("Causes your attacks to ignore {}% of your target's Armor and increases the damage dealt by your Rupture ability by {}%.", [3, 6, 9], [10, 20, 30]) },

      { id: "dirty_deeds", name: "Dirty Deeds", icon: "spell_shadow_summonsuccubus", row: 5, col: 1,
        desc: ranks("Reduces the Energy cost of your Cheap Shot and Garrote abilities by {}, and your Garrote ability no longer requires you to be behind your target.", [10, 20]) },
      { id: "preparation", name: "Preparation", icon: "spell_shadow_antishadow", row: 5, col: 2,
        meta: { cast: "Instant", cooldown: "10 min cooldown" },
        desc: ["When activated, this ability immediately finishes the cooldown on your other Rogue abilities."] },
      { id: "hemorrhage", name: "Hemorrhage", icon: "spell_shadow_lifedrain", row: 5, col: 3, requires: "serrated_blades",
        meta: { cost: "35 Energy", range: "Melee range", cast: "Instant", requirement: "Requires Melee Weapon" },
        desc: ["An instant strike that deals 100% weapon damage (145% if a Dagger is equipped) and causes the target to take 15% increased Rupture damage from the Rogue. Lasts 15 sec. Awards 1 Combo Point."] },

      { id: "quietus", name: "Quietus", icon: "ability_rogue_garrote", row: 6, col: 1, requires: "dirty_deeds",
        desc: ranks("Your Sinister Strike, Ghostly Strike, and Hemorrhage abilities cause {}% more damage against targets below 35% health.", [2, 4, 6, 8, 10]) },
      { id: "cutthroat", name: "Cutthroat", icon: "classicon_rogue", row: 6, col: 3,
        desc: ranks("Your Backstab has a {}% chance to cause your next Ambush within 10 sec to not require Stealth.", [3, 6, 9, 12, 15]) },

      { id: "thousand_cuts", name: "Thousand Cuts", icon: "ability_rogue_rupture", row: 7, col: 2, requires: "preparation",
        desc: ["When your Rupture ability deals periodic damage, the Energy cost of your next Hemorrhage or Backstab ability within 10 sec is reduced by 3, stacking up to 5 times."] }
    ]
  }
};

// ---------------------------------------------------------------------------
// PATCH: November 2 changes, applied on top of BASE_TREES.
//   remove: talent ids deleted by the patch
//   modify: per-talent overrides (any talent field) + `notes` explaining the change
//   add:    brand new talents
// `assumed` marks layout choices the patch notes don't specify (they give rows only).
// Row moves and rank-count changes are annotated automatically.
// ---------------------------------------------------------------------------
export const PATCH = {
  label: "November 2 Beta Patch",
  baseline: [
    "<b>Shank</b> (new, level 24): 5 Energy, 10 sec cooldown, melee range. Instantly strike with your off-hand weapon, dealing 50% weapon damage and generating 15 Energy. Cannot miss. Rank 2 (level 44) generates 25 Energy.",
    "<b>Poised</b> (new passive, level 18): when out of combat at maximum Energy, you gain Poised, reducing the Energy cost of your next Energy ability by 10.",
    "Slice and Dice no longer causes the target to stand up if sitting.",
    "Deadly Poison Attack Power coefficient increased to 0.009 (was 0.0045).",
    "Instant Poison Attack Power coefficient increased to 0.01 (was 0.005).",
    "Fixed an issue where Hemorrhage and Ghostly Strike dealt much more damage than intended with a Dagger."
  ],
  trees: {
    assassination: {
      remove: ["murder"],
      modify: {
        ruthlessness: { notes: ["Activating no longer causes the target to stand up if sitting."] },
        imp_ea: { row: 2, col: 2 },
        lethality: {
          desc: ranks("Increases the critical strike damage bonus of your Sinister Strike, Gouge, Backstab, Mutilate, Ghostly Strike, and Hemorrhage abilities by {}%.", [10, 20]),
          notes: ["Was 4/8/12/16/20%."]
        },
        vigor: { row: 3, col: 1 },
        relentless: {
          row: 5, col: 1,
          desc: ranks("Your finishing moves have a {}% chance per Combo Point to restore 25 Energy.", [4, 8, 12, 16, 20]),
          notes: ["Was 20% per Combo Point."]
        },
        venom: {
          row: 5, col: 2, requires: null, meta: null,
          desc: ["Your Shank ability increases the damage of your Poisons by 30% and your chance to apply Poisons by 20% for 6 sec."],
          notes: ["Now a passive tied to Shank (was a 25 Energy finisher: +30% Poison damage and +10% application chance for 9–21 sec).",
                  "No longer requires Mutilate (Mutilate is now below it)."]
        },
        seal_fate: {
          desc: ranks("Your critical strikes from abilities that add Combo Points have a {}% chance to add an additional Combo Point.", [33, 66, 100]),
          notes: ["Was 20/40/60/80/100%."]
        },
        mutilate: {
          row: 7, col: 2,
          desc: ["Instantly attacks with both weapons for 90% weapon damage plus an additional amount with each weapon. Damage increased by 20% against Poisoned targets. Awards 2 Combo Points."],
          notes: ["Was 75% weapon damage plus 17 with each weapon. The additional amount was also increased (new value not stated in the patch notes)."]
        }
      },
      add: [
        { id: "blood_splatter", name: "Blood Splatter", icon: "ability_rogue_bloodsplatter", row: 3, col: 2,
          desc: ["Increases the duration of your Rupture ability by 6 sec and your Garrote ability by 9 sec."],
          assumed: "Column not specified in the patch notes; placed in Improved Expose Armor's old slot." }
      ]
    },
    combat: {
      remove: [],
      modify: {
        imp_evisc: {
          name: "Coup de Grace",
          desc: ranks("Increases the damage done by your Eviscerate ability by {}%, and the damage and storage rate of your Death Mark ability by {}%.", [7, 13, 20], [7, 13, 20]),
          notes: ["Renamed from Improved Eviscerate; now also improves Death Mark."]
        },
        imp_ss: {
          name: "Efficient Strikes",
          desc: ranks("Reduces the Energy cost of your Sinister Strike and Hemorrhage abilities by {}.", [3, 5]),
          notes: ["Renamed from Improved Sinister Strike; now also reduces Hemorrhage's cost."]
        },
        imp_sprint: { row: 2, col: 4 },
        flawless_exec: {
          desc: ["Reduces the Energy cost of your Eviscerate ability by 15."],
          notes: ["Was 10."]
        },
        weapon_expertise: {
          row: 4, col: 3, requires: null,
          notes: ["No longer requires Blade Flurry (Blade Flurry is now below it)."],
          assumed: "Column not specified; placed in Dual Wield Specialization's old slot."
        },
        aggression: {
          row: 4, col: 4,
          desc: ranks("Increases the damage of your Sinister Strike and Eviscerate abilities by {}%.", [5, 10, 15]),
          notes: ["Was Sinister Strike, Backstab, and Eviscerate by 2/4/6%."],
          assumed: "Column not specified in the patch notes."
        },
        dw_spec: {
          row: 5, col: 4, requires: null,
          desc: ranks("Increases the damage done by your off-hand weapon by {}%.", [25, 50]),
          notes: ["Was 5/10/15/20/25%."],
          assumed: "Column not specified. The Precision prerequisite isn't mentioned in the patch notes; dropped because Hack and Slash now blocks the column."
        }
      },
      add: [
        { id: "composure", name: "Composure", icon: "ability_rogue_nervesofsteel", row: 3, col: 4,
          desc: ranks("Increases the Energy cost reduction of your Poised ability by {}.", [5, 10]),
          assumed: "Column not specified; placed in Improved Sprint's old slot." },
        { id: "flash_of_steel", name: "Flash of Steel", icon: "ability_rogue_focusedattacks", row: 6, col: 2,
          desc: ranks("Increases the Energy generated by your Shank ability by {} and reduces its cooldown by {} sec.", [3, 6, 9, 12, 15], ["0.4", "0.8", "1.2", "1.6", "2.0"]),
          assumed: "Column not specified; placed in Weapon Expertise's old slot." }
      ]
    },
    subtlety: {
      remove: ["imp_distract", "quietus", "cutthroat", "thousand_cuts"],
      modify: {
        setup: {
          row: 1, col: 1,
          desc: ranks("Gives you a {}% chance to add a Combo Point to your target after Dodging one of their attacks or fully resisting one of their spells.", [15, 30, 45]),
          notes: ["Was 33/66/100%."]
        },
        opportunity: {
          desc: ranks("Increases the damage dealt by your Backstab, Garrote, Ambush, and Mutilate abilities by {}%.", [4, 8, 12, 16, 20]),
          notes: ["Was 5/10%."]
        },
        dirty_deeds: { row: 2, col: 1 },
        camouflage: {
          row: 2, col: 2,
          desc: ranks("Increases your movement speed while stealthed by {}% and reduces the cooldown of your Stealth ability by {} sec.", [5, 10, 15], [2, 4, 6]),
          notes: ["Was 3/6/9/12/15% and 2/3/4/5/6 sec."]
        },
        premeditation: { row: 3, col: 2 },
        serrated_blades: { row: 3, col: 3 },
        elusiveness: { row: 4, col: 1 },
        ghostly_strike: {
          row: 4, col: 2,
          desc: ["A strike that deals 125% (180% if a Dagger is equipped in your Main Hand) weapon damage and increases your chance to dodge by 15% for 7 sec. Also causes your next Ambush or Garrote cast within 7 sec to not require Stealth. Awards 1 combo point."],
          notes: ["Now also lets your next Ambush or Garrote within 7 sec be used without Stealth.",
                  "Fixed dealing much more damage than intended with a Dagger."]
        },
        heightened_senses: { row: 5, col: 1 },
        hemorrhage: {
          desc: ["An instant strike that deals 100% weapon damage (145% if a Dagger is equipped) and causes the target to take 15% increased Rupture and Garrote damage from the Rogue. Lasts 15 sec. Awards 1 Combo Point."],
          notes: ["Now also increases Garrote damage (was Rupture only).",
                  "Fixed dealing much more damage than intended with a Dagger."]
        }
      },
      add: [
        { id: "quick_getaway", name: "Quick Getaway", icon: "ability_rogue_fleetfooted", row: 4, col: 4,
          desc: ranks("Increases the maximum number of targets you may have Sapped by 1, and increases your movement speed by {}% for 3 sec after Sapping a target.", [15, 30]),
          assumed: "Column not specified; column 3 is kept open for the Serrated Blades → Hemorrhage arrow." },
        { id: "boot_knife", name: "Boot Knife", icon: "inv_throwingknife_04", row: 6, col: 3,
          desc: ranks("Gives your Shank ability a {}% chance to add 2 Combo Points to the target.", [20, 40, 60, 80, 100]),
          assumed: "Column not specified; placed in Cutthroat's old slot." },
        { id: "death_mark", name: "Death Mark", icon: "ability_rogue_deathmark", row: 7, col: 2,
          meta: { cost: "25 Energy", range: "20 yd range", cast: "Instant", cooldown: "10 sec cooldown", requirement: "Curse" },
          desc: ["Finishing move that marks the target, storing a portion of the damage dealt by your attacks per Combo Point. Garrote and Rupture damage is stored at twice the rate. After 6 sec, the stored damage is dealt, up to a maximum increased by Attack Power and Critical Strike chance."],
          notes: ["Replaces Thousand Cuts as the 31-point talent."] }
      ]
    }
  }
};
