// js/rules/advantages.js
export const ADVANTAGES = [
  { name: 'Accurate Attack', category: 'Combat', desc: 'Trade effect DC for attack bonus.' },
  { name: 'Agile Feint', category: 'Skill', desc: 'Feint using Acrobatics skill or movement speed.' },
  { name: 'All-out Attack', category: 'Combat', desc: 'Trade active defense for attack bonus.' },
  { name: 'Animal Empathy', category: 'Skill', desc: 'Use interaction skills normally with animals.' },
  { name: 'Artificer', category: 'Skill', desc: 'Use Expertise: Magic to create temporary magical devices.' },
  { name: 'Assessment', category: 'General', desc: 'Use Insight to learn an opponent\'s combat capabilities.' },
  { name: 'Attractive', category: 'Skill', desc: 'Circumstance bonus to interaction based on your looks (+2 per rank, max 2).', ranked: true, maxRanks: 2 },
  { name: 'Beginner\'s Luck', category: 'Fortune', desc: 'Spend a hero point to gain 5 temporary ranks in a skill.' },
  {
    name: 'Benefit',
    category: 'General',
    desc: 'Gain a significant prerequisite, social advantage, wealth, or fringe benefit.',
    ranked: true,
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Benefit Type',
    specificationSuggestions: ['Wealth', 'Cipher', 'Status', 'Alternate Identity', 'Ambidexterity', 'Diplomatic Immunity', 'Security Clearance']
  },
  { name: 'Chokehold', category: 'Combat', desc: 'Suffocate an opponent you have successfully grabbed.' },
  { name: 'Close Attack', category: 'Combat', desc: '+1 bonus to close attack checks per rank.', ranked: true },
  { name: 'Connected', category: 'Skill', desc: 'Call in assistance or favors with a Persuasion check.' },
  { name: 'Contacts', category: 'Skill', desc: 'Make an initial Investigation check in one minute.' },
  { name: 'Daze', category: 'Skill', desc: 'Use Deception or Intimidation to daze an opponent.' },
  { name: 'Defensive Attack', category: 'Combat', desc: 'Trade attack bonus for active defense bonus.' },
  { name: 'Defensive Roll', category: 'Combat', desc: '+1 active defense bonus to Toughness per rank.', ranked: true },
  { name: 'Diehard', category: 'General', desc: 'Automatically stabilize when dying.' },
  { name: 'Eidetic Memory', category: 'General', desc: 'Total recall, +5 circumstance bonus to remember things.' },
  { name: 'Equipment', category: 'General', desc: '5 points of equipment per rank.', ranked: true },
  { name: 'Evasion', category: 'Combat', desc: 'Circumstance bonus to avoid area effects (+2 per rank, max 2).', ranked: true, maxRanks: 2 },
  { name: 'Extraordinary Effort', category: 'General', desc: 'Gain two benefits when using extra effort.' },
  {
    name: 'Fascinate',
    category: 'Skill',
    desc: 'Use an interaction skill to entrance others.',
    ranked: true,
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Interaction Skill',
    specificationSuggestions: ['Persuasion', 'Deception', 'Intimidation', 'Expertise: Performance']
  },
  { name: 'Fast Grab', category: 'Combat', desc: 'Make a free grab check after an unarmed attack.' },
  {
    name: 'Favored Environment',
    category: 'Combat',
    desc: 'Circumstance bonus to attack or defense in an environment.',
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Environment',
    specificationSuggestions: ['Airborne / Flight', 'Underwater / Aquatic', 'Zero-G / Space', 'Urban / Rooftops', 'Darkness / Shadows', 'Forest / Jungle', 'Cold / Arctic']
  },
  {
    name: 'Favored Foe',
    category: 'Skill',
    desc: 'Circumstance bonus to checks against a type of opponent.',
    ranked: true,
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Foe Type / Organization',
    specificationSuggestions: ['Aliens', 'Undead', 'Robots / Synthetics', 'Demons', 'Mutants', 'Ninjas', 'Mob / Organized Crime', 'Secret Societies']
  },
  { name: 'Fearless', category: 'General', desc: 'Immune to fear effects.' },
  { name: 'Grabbing Finesse', category: 'Combat', desc: 'Substitute Dex for Str when making grab attacks.' },
  { name: 'Great Endurance', category: 'General', desc: '+5 on checks involving endurance.' },
  { name: 'Hide in Plain Sight', category: 'Skill', desc: 'Hide while observed without need for a diversion.' },
  { name: 'Improved Aim', category: 'Combat', desc: 'Double circumstance bonuses for aiming.' },
  { name: 'Improved Critical', category: 'Combat', desc: '+1 to critical threat range with an attack per rank.', ranked: true },
  { name: 'Improved Defense', category: 'Combat', desc: '+2 bonus to active defense when you take the defend action.' },
  { name: 'Improved Disarm', category: 'Combat', desc: 'No penalty for the disarm action.' },
  { name: 'Improved Grab', category: 'Combat', desc: 'Make grab attacks with one arm. Not vulnerable while grabbing.' },
  { name: 'Improved Hold', category: 'Combat', desc: '-5 circumstance penalty to escape from your holds.' },
  { name: 'Improved Initiative', category: 'Combat', desc: '+4 bonus to initiative checks per rank.', ranked: true },
  { name: 'Improved Smash', category: 'Combat', desc: 'No penalty for the smash action.' },
  { name: 'Improved Trip', category: 'Combat', desc: 'No penalty for the trip action.' },
  { name: 'Improvised Tools', category: 'Skill', desc: 'No penalty for using skills without tools.' },
  { name: 'Improvised Weapon', category: 'Combat', desc: 'Use Unarmed Combat skill with improvised weapons, +1 damage bonus.', ranked: true },
  { name: 'Inspire', category: 'Fortune', desc: 'Spend a hero point to grant allies a +1 circumstance bonus per rank (max 5).', ranked: true, maxRanks: 5 },
  { name: 'Instant Up', category: 'General', desc: 'Stand from prone as a free action.' },
  { name: 'Interpose', category: 'General', desc: 'Take an attack meant for an ally.' },
  { name: 'Inventor', category: 'Skill', desc: 'Use Technology to create temporary devices.' },
  { name: 'Jack-of-all-trades', category: 'Skill', desc: 'Use any skill untrained.' },
  {
    name: 'Languages',
    category: 'Skill',
    desc: 'Speak and understand additional languages.',
    ranked: true,
    requiresSpecification: true,
    allowMultiple: false,
    specificationLabel: 'Languages Spoken',
    specificationSuggestions: ['Japanese', 'Mandarin', 'Spanish', 'French', 'Russian', 'Arabic', 'German', 'Ancient Latin', 'Atlantean']
  },
  { name: 'Leadership', category: 'Fortune', desc: 'Spend a hero point to remove a condition from an ally.' },
  { name: 'Luck', category: 'Fortune', desc: 'Re-roll a die roll once per rank (max ranks = 1/2 PL).', ranked: true },
  { name: 'Minion', category: 'General', desc: 'Gain a follower or minion with (15 x rank) Character points.', ranked: true },
  { name: 'Move-by Action', category: 'Combat', desc: 'Move both before and after your standard action.' },
  { name: 'Power Attack', category: 'Combat', desc: 'Trade attack bonus for effect bonus.' },
  { name: 'Precise Attack', category: 'Combat', desc: 'Ignore attack check penalties for either cover or concealment.', ranked: true, maxRanks: 4 },
  { name: 'Prone Fighting', category: 'Combat', desc: 'No penalties for fighting while prone.' },
  { name: 'Quick Draw', category: 'Combat', desc: 'Draw a weapon as a free action.' },
  { name: 'Ranged Attack', category: 'Combat', desc: '+1 bonus to ranged attack checks per rank.', ranked: true },
  { name: 'Redirect', category: 'Combat', desc: 'Use Deception to redirect a missed attack at another target.' },
  { name: 'Ritualist', category: 'Skill', desc: 'Use Expertise: Magic to create and perform rituals.' },
  {
    name: 'Second Chance',
    category: 'General',
    desc: 'Re-roll a failed check against a hazard once.',
    ranked: true,
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Hazard / Check',
    specificationSuggestions: ['Mind Control', 'Traps / Hazards', 'Falling', 'Poison / Toxins', 'Radiation', 'Drowning / Suffocation']
  },
  { name: 'Seize Initiative', category: 'Fortune', desc: 'Spend a hero point to go first in the initiative order.' },
  { name: 'Set-up', category: 'Combat', desc: 'Transfer the benefit of an interaction skill to an ally.', ranked: true },
  { name: 'Sidekick', category: 'General', desc: 'Gain a sidekick with (5 x rank) Character points.', ranked: true },
  {
    name: 'Skill Mastery',
    category: 'Skill',
    desc: 'Make routine checks with one skill under any conditions.',
    ranked: true,
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Chosen Skill',
    specificationSuggestions: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Persuasion', 'Sleight of Hand', 'Stealth', 'Technology', 'Treatment', 'Vehicles']
  },
  { name: 'Startle', category: 'Skill', desc: 'Use Intimidation to feint in combat.' },
  { name: 'Takedown', category: 'Combat', desc: 'Free extra attack when you incapacitate a minion.', ranked: true, maxRanks: 2 },
  { name: 'Taunt', category: 'Skill', desc: 'Use Deception to demoralize in combat.' },
  { name: 'Teamwork', category: 'General', desc: '+5 bonus to support team checks.' },
  { name: 'Throwing Mastery', category: 'Combat', desc: '+1 damage bonus with thrown weapons per rank.', ranked: true },
  { name: 'Tracking', category: 'Skill', desc: 'Use Perception to follow tracks.' },
  { name: 'Trance', category: 'General', desc: 'Go into a deathlike trance that slows bodily functions.' },
  {
    name: 'Ultimate Effort',
    category: 'Fortune',
    desc: 'Spend a hero point to get an effective 20 on a specific check.',
    requiresSpecification: true,
    allowMultiple: true,
    specificationLabel: 'Chosen Check',
    specificationSuggestions: ['Toughness Saves', 'Aim / Attack Check', 'Strength Check', 'Will Saves', 'Fortitude Saves', 'Technology Check']
  },
  { name: 'Uncanny Dodge', category: 'Combat', desc: 'Not vulnerable when surprised or caught off-guard.' },
  { name: 'Weapon Bind', category: 'Combat', desc: 'Free disarm attempt when you actively defend.' },
  { name: 'Weapon Break', category: 'Combat', desc: 'Free smash attack when you actively defend.' },
  { name: 'Well-informed', category: 'Skill', desc: 'Immediate Investigation or Persuasion check to know something.' }
];

export const ADVANTAGE_CATEGORIES = ['All', 'Combat', 'Fortune', 'General', 'Skill', 'Ranked'];

export const ADVANTAGE_COST_PER_RANK = 1;
export const ADVANTAGES_CATALOG = ADVANTAGES;

/**
 * Format advantage name with its specification if present
 * e.g., Benefit (Wealth), Favored Foe (Undead)
 */
export function formatAdvantageDisplayName(adv) {
  if (!adv) return '';
  const name = typeof adv === 'string' ? adv : (adv.name || '');
  const spec = typeof adv === 'object' ? (adv.specification || '').trim() : '';
  if (spec) {
    return `${name} (${spec})`;
  }
  return name;
}

/**
 * Find rule definition by advantage name
 */
export function getAdvantageRule(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  return ADVANTAGES.find(a => a.name.toLowerCase() === lower) || null;
}
