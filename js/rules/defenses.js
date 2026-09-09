// js/rules/defenses.js
export const DEFENSES = [
  { key: 'DODGE', name: 'Dodge', baseAbility: 'AGL', desc: 'Ability to avoid ranged attacks and other hazards.' },
  { key: 'PARRY', name: 'Parry', baseAbility: 'FGT', desc: 'Ability to turn aside or evade close attacks.' },
  { key: 'FORTITUDE', name: 'Fortitude', baseAbility: 'STA', desc: 'Health, stamina, and biological/metabolic resistance.' },
  { key: 'TOUGHNESS', name: 'Toughness', baseAbility: 'STA', desc: 'Resistance to direct physical damage and impact (not bought directly, enhanced via Protection / Defensive Roll).' },
  { key: 'WILL', name: 'Will', baseAbility: 'AWE', desc: 'Mental stability, determination, and psychic resistance.' },
  { key: 'INITIATIVE', name: 'Initiative', baseAbility: 'AGL', isDerived: true, desc: 'Reaction speed to determine turn order in combat (Base AGL + Improved Initiative).' }
];

export const DEFENSE_COST_PER_RANK = 1;
