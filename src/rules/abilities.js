// js/rules/abilities.js
export const ABILITIES = [
  { key: 'STR', name: 'Strength', desc: 'Physical power, lifting capacity, and close damage.', linkedDefenses: [], linkedSkills: ['Athletics'] },
  { key: 'STA', name: 'Stamina', desc: 'Health, endurance, and physical resilience.', linkedDefenses: ['Toughness', 'Fortitude'], linkedSkills: [] },
  { key: 'AGL', name: 'Agility', desc: 'Body control, coordination, speed, and balance.', linkedDefenses: ['Dodge', 'Initiative'], linkedSkills: ['Acrobatics', 'Stealth'] },
  { key: 'DEX', name: 'Dexterity', desc: 'Agility of the hands and precision with ranged attacks.', linkedDefenses: [], linkedSkills: ['Ranged Combat', 'Sleight of Hand', 'Vehicles'] },
  { key: 'FGT', name: 'Fighting', desc: 'Close combat ability, hand-to-hand skill, and parry defense.', linkedDefenses: ['Parry'], linkedSkills: ['Close Combat'] },
  { key: 'INT', name: 'Intellect', desc: 'Reasoning ability, knowledge, logic, and education.', linkedDefenses: [], linkedSkills: ['Expertise', 'Investigation', 'Technology', 'Treatment'] },
  { key: 'AWE', name: 'Awareness', desc: 'Common sense, perception, intuition, and willpower.', linkedDefenses: ['Will'], linkedSkills: ['Insight', 'Perception'] },
  { key: 'PRE', name: 'Presence', desc: 'Force of personality, charisma, leadership, and confidence.', linkedDefenses: [], linkedSkills: ['Deception', 'Intimidation', 'Persuasion'] }
];

export const ABILITY_COST_PER_RANK = 2;

/**
 * Format numeric value with +/- sign for M&M 3e modifiers (e.g. +3, -1, +0).
 * Handles absent/null/undefined or non-numeric values gracefully by returning '-'.
 */
export function formatMod(val) {
  if (val === null || val === undefined || val === '') return '-';
  const num = Number(val);
  if (Number.isNaN(num)) return '-';
  return num >= 0 ? `+${num}` : `${num}`;
}

export const formatModifier = formatMod;

