// js/rules/abilities.js
export const ABILITIES = [
  { key: 'STR', name: 'Strength', desc: 'Physical power, lifting capacity, and close damage.', linkedDefenses: [], linkedSkills: ['Athletics'] },
  { key: 'STA', name: 'Stamina', desc: 'Health, endurance, and physical resilience.', linkedDefenses: ['Toughness', 'Fortitude'], linkedSkills: [] },
  { key: 'AGL', name: 'Agility', desc: 'Body control, coordination, speed, and balance.', linkedDefenses: ['Dodge'], linkedSkills: ['Acrobatics', 'Stealth'] },
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

export const ABILITY_EDITORIAL = {
  STR: {
    overview: 'Strength measures physical power and lifting capacity. It sets your base damage in close combat and governs Athletics checks.',
    checksHeading: 'Strength Checks',
    checks: 'Roll a Strength check when pushing, prying, or breaking heavy objects that test your limits, or when opposing another character\'s physical force directly. When not under pressure, you can take a routine check (treating your d20 roll as 10).',
    skills: [
      {
        name: 'Athletics',
        desc: 'Climbing, swimming, running, and leaping. Your Strength rank directly determines your jump distances and throwing range.'
      }
    ],
    defenses: [],
    specialNotes: 'Melee Damage & Lifting: Your Strength rank provides your base unarmed damage bonus (Damage DC = 15 + Strength rank). Lifting capacity follows the M&M 3e Measurements Table (doubling with each rank above 0).'
  },
  STA: {
    overview: 'Stamina measures health, endurance, and physical durability. It determines how well you absorb damage and resist hazards like poison or exhaustion.',
    checksHeading: 'Stamina Checks',
    checks: 'Roll a Stamina check when enduring extreme conditions over time, such as holding your breath, resisting starvation, surviving exposure to harsh weather, or pushing through exhaustion on a forced march.',
    skills: [],
    defenses: [
      {
        name: 'Toughness',
        desc: 'Resists physical impact and damage. When an attack hits, roll Toughness against DC 15 + Damage effect rank to avoid injury conditions.'
      },
      {
        name: 'Fortitude',
        desc: 'Resists physical toxins, diseases, radiation, and metabolic effects that bypass direct armor.'
      }
    ]
  },
  AGL: {
    overview: 'Agility represents physical balance, coordination, reflexes, and body control. It governs your ability to dodge attacks, move stealthily, and react quickly in battle.',
    checksHeading: 'Agility Checks',
    checks: 'Roll an Agility check to keep your footing across narrow beams or slippery ice, catch yourself during a fall, or dodge sudden environmental hazards.',
    skills: [
      {
        name: 'Acrobatics',
        desc: 'Flipping, balancing on wires, escaping restraints, and standing up from prone as a free action (DC 20).'
      },
      {
        name: 'Stealth',
        desc: 'Moving silently, hiding in cover, and tailing targets without being spotted.'
      }
    ],
    defenses: [
      {
        name: 'Dodge',
        desc: 'Your active defense against ranged attacks. Combined with Toughness, your total cannot exceed twice the series Power Level (Dodge + Toughness <= 2 × PL).'
      }
    ]
  },
  DEX: {
    overview: 'Dexterity measures hand-eye coordination, manual precision, and accuracy with ranged weapons and vehicles.',
    checksHeading: 'Dexterity Checks',
    checks: 'Roll a Dexterity check when performing delicate manual tasks that require steady hands, like disarming a hair-trigger fuse or picking a physical lock.',
    skills: [
      {
        name: 'Ranged Combat',
        desc: 'Attack bonus with specific ranged weapon groups such as firearms, thrown weapons, or energy blasts.'
      },
      {
        name: 'Sleight of Hand',
        desc: 'Palming small items, pickpocketing, and hiding weapons or contraband on your person.'
      },
      {
        name: 'Vehicles',
        desc: 'Steering, piloting, and maneuvering cars, aircraft, or starships under dangerous conditions.'
      }
    ],
    defenses: []
  },
  FGT: {
    overview: 'Fighting measures close-quarters combat skill and hand-to-hand proficiency. It sets your base melee accuracy and your ability to parry incoming strikes.',
    checksHeading: 'Fighting Checks',
    checks: 'Roll a Fighting check to evaluate an opponent\'s combat stance, feint against a defender in melee, or resolve an improvised close-combat maneuver.',
    skills: [
      {
        name: 'Close Combat',
        desc: 'Attack bonus with specific close-combat weapons or styles, such as blades, unarmed strikes, or grappling.'
      }
    ],
    defenses: [
      {
        name: 'Parry',
        desc: 'Your active defense against melee attacks. Combined with Toughness, your total cannot exceed twice the series Power Level (Parry + Toughness <= 2 × PL).'
      }
    ]
  },
  INT: {
    overview: 'Intellect covers reasoning, memory, problem-solving, and specialized technical knowledge.',
    checksHeading: 'Intellect Checks',
    checks: 'Roll an Intellect check to solve complex puzzles, recall obscure facts, or decipher an unfamiliar code.',
    skills: [
      {
        name: 'Expertise',
        desc: 'Knowledge and training in specific fields, such as science, law, history, magic, or current events.'
      },
      {
        name: 'Investigation',
        desc: 'Searching crime scenes for clues, analyzing surveillance records, and interviewing witnesses.'
      },
      {
        name: 'Technology',
        desc: 'Hacking computer networks, building or repairing electronic hardware, and bypassing electronic locks.'
      },
      {
        name: 'Treatment',
        desc: 'Providing emergency medical care, stabilizing dying characters, and treating poison or disease.'
      }
    ],
    defenses: []
  },
  AWE: {
    overview: 'Awareness measures perception, common sense, intuition, and mental discipline. It helps you notice subtle cues and resist mental or psychic influence.',
    checksHeading: 'Awareness Checks',
    checks: 'Roll an Awareness check to spot sudden changes in your surroundings, sense when someone is acting under duress, or awaken when danger approaches.',
    skills: [
      {
        name: 'Insight',
        desc: 'Detecting lies, reading body language, and sensing when a target is under mental control.'
      },
      {
        name: 'Perception',
        desc: 'Spotting hidden foes, overhearing quiet conversations, and noticing concealed objects.'
      }
    ],
    defenses: [
      {
        name: 'Will',
        desc: 'Your defense against telepathy, mind control, illusions, and demoralizing intimidation.'
      }
    ]
  },
  PRE: {
    overview: 'Presence reflects force of personality, leadership, and social confidence. It determines your ability to persuade allies, deceive rivals, and intimidate opponents.',
    checksHeading: 'Presence Checks',
    checks: 'Roll a Presence check when trying to sway a restless crowd, take command in a crisis, or project authority.',
    skills: [
      {
        name: 'Deception',
        desc: 'Telling convincing lies, disguising yourself, and feinting in combat to throw an opponent off balance.'
      },
      {
        name: 'Intimidation',
        desc: 'Frightening opponents, extracting information during an interrogation, and imposing a -2 defense penalty by demoralizing in combat.'
      },
      {
        name: 'Persuasion',
        desc: 'Negotiating treaties, building trust with skeptical contacts, and talking down hostile bystanders.'
      }
    ],
    defenses: []
  }
};


