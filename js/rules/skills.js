// js/rules/skills.js
export const SKILLS = [
  {
    name: 'Acrobatics',
    ability: 'AGL',
    category: 'Physical',
    desc: 'Flips, balancing, contortion, and maneuvering.'
  },
  {
    name: 'Athletics',
    ability: 'STR',
    category: 'Physical',
    desc: 'Running, jumping, swimming, and climbing.'
  },
  {
    name: 'Close Combat',
    ability: 'FGT',
    category: 'Combat',
    requiresSubtype: true,
    desc: 'Specialized accuracy with specific close attack (e.g., Unarmed, Swords).',
    commonSubtypes: ['Unarmed', 'Swords', 'Knives', 'Claws', 'Bludgeoning', 'Martial Arts']
  },
  {
    name: 'Deception',
    ability: 'PRE',
    category: 'Interaction',
    desc: 'Lying, bluffing, disguise, and feinting.'
  },
  {
    name: 'Expertise',
    ability: 'INT',
    category: 'Mental',
    requiresSubtype: true,
    desc: 'Specific field of knowledge, profession, or craft.',
    commonSubtypes: ['Science', 'Technology', 'Criminology', 'Law', 'Magic', 'History', 'Medicine', 'Streetwise', 'Pop Culture']
  },
  {
    name: 'Insight',
    ability: 'AWE',
    category: 'Mental',
    desc: 'Detecting falsehoods, sensing motives, and gut feelings.'
  },
  {
    name: 'Intimidation',
    ability: 'PRE',
    category: 'Interaction',
    desc: 'Coercion, demoralizing opponents, and projecting menace.'
  },
  {
    name: 'Investigation',
    ability: 'INT',
    category: 'Mental',
    desc: 'Gathering clues, research, and deductive reasoning.'
  },
  {
    name: 'Perception',
    ability: 'AWE',
    category: 'Mental',
    desc: 'Spotting, listening, smelling, and awareness of surroundings.'
  },
  {
    name: 'Persuasion',
    ability: 'PRE',
    category: 'Interaction',
    desc: 'Diplomacy, negotiation, and inspiring trust.'
  },
  {
    name: 'Ranged Combat',
    ability: 'DEX',
    category: 'Combat',
    requiresSubtype: true,
    desc: 'Specialized accuracy with specific ranged attack (e.g., Guns, Blasts, Bows).',
    commonSubtypes: ['Firearms / Guns', 'Bows', 'Energy Blast', 'Thrown Weapons', 'Heavy Weapons']
  },
  {
    name: 'Sleight of Hand',
    ability: 'DEX',
    category: 'Physical',
    desc: 'Pickpocketing, card tricks, and concealing objects.'
  },
  {
    name: 'Stealth',
    ability: 'AGL',
    category: 'Physical',
    desc: 'Moving quietly, hiding, and avoiding detection.'
  },
  {
    name: 'Technology',
    ability: 'INT',
    category: 'Mental',
    desc: 'Hacking, engineering, electronic security, and invention.'
  },
  {
    name: 'Treatment',
    ability: 'INT',
    category: 'Mental',
    desc: 'First aid, medical diagnosis, surgery, and medicine.'
  },
  {
    name: 'Vehicles',
    ability: 'DEX',
    category: 'Physical',
    desc: 'Piloting cars, aircraft, boats, and spaceships.'
  }
];

export const SKILL_RANKS_PER_PP = 2; // 1 PP per 2 ranks

