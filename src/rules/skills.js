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
export const SKILLS_CATALOG = SKILLS;

/**
 * Normalizes text for skill matching: lowercases, trims, strips punctuation and prefixes.
 */
export function normalizeCombatTerm(term) {
  if (!term || typeof term !== 'string') return '';
  return term
    .toLowerCase()
    .replace(/^(?:ranged combat|close combat)\s*[:(-]?\s*/i, '')
    .replace(/[()[\],.:;/\-_+&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into individual lowercase words (min 2 chars).
 */
function tokenizeWords(text) {
  const norm = normalizeCombatTerm(text);
  if (!norm) return [];
  return norm.split(/\s+/).filter(w => w.length >= 2);
}

/**
 * Checks if two words match or one is a simple plural form of the other.
 */
function wordMatches(w1, w2) {
  if (!w1 || !w2) return false;
  if (w1 === w2) return true;
  const s1 = w1.replace(/ies$/, 'y').replace(/(?:es|s)$/, '');
  const s2 = w2.replace(/ies$/, 'y').replace(/(?:es|s)$/, '');
  return s1 === s2 || (s1.length >= 4 && s2.length >= 4 && (s1.startsWith(s2) || s2.startsWith(s1)));
}

// Category keyword definitions for Ranged Combat
const RANGED_CATEGORIES = {
  firearms: {
    subtypeKeywords: [
      'gun', 'guns', 'firearm', 'firearms', 'pistol', 'pistols', 'rifle', 'rifles',
      'shotgun', 'shotguns', 'handgun', 'handguns', 'smg', 'submachine', 'machine gun',
      'machinegun', 'assault rifle', 'assault', 'sniper', 'carbine', 'magnum', 'revolver',
      'derringer', 'ballistic', 'ballistics', 'bullet', 'bullets', 'heavy weapon', 'heavy weapons',
      'blaster', 'blasters', 'cannon', 'autocannon', 'artillery', 'bazooka', 'rocket launcher',
      'grenade launcher', 'railgun', 'projectile', 'projectiles', 'slugthrower'
    ],
    attackKeywords: [
      'gun', 'guns', 'firearm', 'firearms', 'pistol', 'pistols', 'rifle', 'rifles',
      'shotgun', 'shotguns', 'handgun', 'handguns', 'smg', 'submachine', 'machine gun',
      'machinegun', 'assault rifle', 'assault', 'sniper', 'carbine', 'magnum', 'revolver',
      'derringer', 'ballistic', 'ballistics', 'bullet', 'bullets', 'heavy weapon', 'heavy weapons',
      'blaster', 'blasters', 'cannon', 'autocannon', 'artillery', 'bazooka', 'rocket launcher',
      'grenade launcher', 'railgun', 'projectile', 'slugthrower', 'taser'
    ],
    descriptors: ['ballistic', 'bullet', 'firearm', 'gun', 'projectile', 'munition', 'ordnance']
  },
  bows: {
    subtypeKeywords: [
      'bow', 'bows', 'archery', 'archer', 'arrow', 'arrows', 'crossbow', 'crossbows',
      'longbow', 'shortbow', 'quiver', 'trick arrow', 'trick arrows'
    ],
    attackKeywords: [
      'bow', 'bows', 'archery', 'archer', 'arrow', 'arrows', 'crossbow', 'crossbows',
      'longbow', 'shortbow', 'quiver', 'trick arrow', 'trick arrows'
    ],
    descriptors: ['archery', 'bow', 'arrow']
  },
  thrown: {
    subtypeKeywords: [
      'thrown', 'throwing', 'throw', 'shuriken', 'batarang', 'boomerang', 'dart', 'darts',
      'javelin', 'javelins', 'grenade', 'grenades', 'throwing knife', 'throwing knives',
      'throwing star', 'throwing stars', 'throwing axe', 'bolas', 'sling', 'slingshot'
    ],
    attackKeywords: [
      'thrown', 'throwing', 'throw', 'shuriken', 'batarang', 'boomerang', 'dart', 'darts',
      'javelin', 'javelins', 'grenade', 'grenades', 'knife', 'dagger', 'spear', 'axe',
      'bolas', 'rock', 'sling', 'slingshot'
    ],
    descriptors: ['thrown', 'throwing']
  },
  energy: {
    subtypeKeywords: [
      'blast', 'blasts', 'energy blast', 'energy', 'beam', 'beams', 'ray', 'rays', 'laser',
      'lasers', 'force beam', 'force bolt', 'plasma', 'heat vision', 'optic blast',
      'disintegration', 'hellfire', 'fire blast', 'ice blast', 'lightning', 'bolt', 'bolts',
      'zap', 'pulse', 'radiation', 'radiation blast', 'particle', 'ion', 'sonic', 'shockwave'
    ],
    attackKeywords: [
      'blast', 'blasts', 'beam', 'beams', 'ray', 'rays', 'laser', 'lasers', 'bolt', 'bolts',
      'pulse', 'plasma', 'repulsor', 'heat vision', 'optic blast', 'disintegration', 'hellfire',
      'lightning', 'fireball', 'zap', 'shock', 'burst', 'stream', 'discharge', 'radiation'
    ],
    descriptors: [
      'energy', 'fire', 'flame', 'heat', 'cold', 'ice', 'frost', 'lightning', 'electricity',
      'electric', 'laser', 'force', 'plasma', 'radiation', 'light', 'sonic', 'sound',
      'vibration', 'cosmic', 'hellfire', 'particle', 'ion', 'kinetic'
    ]
  },
  spells: {
    subtypeKeywords: [
      'spell', 'spells', 'magic', 'mystic', 'magical', 'sorcery', 'arcane', 'eldritch',
      'divine', 'incantation', 'witchcraft', 'wizardry', 'necromancy', 'thaumaturgy'
    ],
    attackKeywords: [
      'spell', 'spells', 'magic', 'mystic', 'magical', 'sorcery', 'arcane', 'eldritch',
      'divine', 'incantation', 'witchcraft', 'hex', 'curse', 'miracle', 'sorcerer'
    ],
    descriptors: [
      'magic', 'mystic', 'sorcery', 'arcane', 'eldritch', 'divine', 'supernatural',
      'spell', 'witchcraft', 'occult', 'chaos'
    ]
  },
  battlesuit: {
    subtypeKeywords: [
      'battlesuit', 'battlesuit weapons', 'battlesuit weapon', 'power armor', 'exosuit',
      'suit weapons', 'mech', 'mecha', 'armor weapons', 'cybernetic weapons'
    ],
    attackKeywords: [
      'battlesuit', 'power armor', 'exosuit', 'armor', 'mech', 'mecha', 'repulsor',
      'gauntlet', 'micro-rocket', 'micro-rockets', 'chest beam', 'unibeam'
    ],
    descriptors: ['battlesuit', 'power armor', 'cybernetics']
  },
  gadgets: {
    subtypeKeywords: [
      'gadget', 'gadgets', 'gadgeteer', 'invention', 'inventions', 'utility belt',
      'arsenal', 'devices', 'device', 'tricks'
    ],
    attackKeywords: [
      'gadget', 'gadgets', 'utility belt', 'arsenal', 'device', 'invention', 'inventions'
    ],
    descriptors: ['gadget', 'invention']
  }
};

// Category keyword definitions for Close Combat
const CLOSE_CATEGORIES = {
  unarmed: {
    subtypeKeywords: [
      'unarmed', 'brawl', 'brawling', 'fists', 'punch', 'martial arts', 'hand to hand',
      'hand-to-hand', 'melee', 'strike', 'boxing', 'karate', 'judo', 'kung fu'
    ],
    attackKeywords: [
      'unarmed', 'punch', 'kick', 'strike', 'brawl', 'martial arts', 'fist', 'slam', 'tackle'
    ],
    descriptors: ['unarmed', 'bludgeoning', 'martial arts']
  },
  blades: {
    subtypeKeywords: [
      'blade', 'blades', 'sword', 'swords', 'knife', 'knives', 'dagger', 'daggers',
      'katana', 'machete', 'rapier', 'scimitar', 'broadsword', 'cutlass', 'saber', 'cleaver'
    ],
    attackKeywords: [
      'blade', 'blades', 'sword', 'swords', 'knife', 'knives', 'dagger', 'daggers',
      'katana', 'machete', 'rapier', 'scimitar', 'broadsword', 'cutlass', 'saber', 'cleaver'
    ],
    descriptors: ['slashing', 'piercing', 'blade', 'sword']
  },
  clubs: {
    subtypeKeywords: [
      'club', 'clubs', 'bludgeon', 'bludgeoning', 'bludgeons', 'mace', 'maces',
      'hammer', 'warhammer', 'staff', 'staves', 'bat', 'quarterstaff', 'nightstick',
      'tonfa', 'flail', 'truncheon'
    ],
    attackKeywords: [
      'club', 'clubs', 'bludgeon', 'bludgeons', 'mace', 'maces', 'hammer', 'warhammer',
      'staff', 'staves', 'bat', 'quarterstaff', 'nightstick', 'tonfa', 'flail'
    ],
    descriptors: ['bludgeoning', 'blunt']
  },
  axes: {
    subtypeKeywords: ['axe', 'axes', 'battleaxe', 'hatchet', 'halberd'],
    attackKeywords: ['axe', 'axes', 'battleaxe', 'hatchet', 'halberd'],
    descriptors: ['slashing', 'axe']
  },
  claws: {
    subtypeKeywords: ['claw', 'claws', 'fang', 'fangs', 'bite', 'talons', 'horns', 'natural weapons'],
    attackKeywords: ['claw', 'claws', 'fang', 'fangs', 'bite', 'talons', 'horns'],
    descriptors: ['natural', 'piercing', 'slashing']
  },
  whips: {
    subtypeKeywords: ['whip', 'whips', 'chain', 'chains', 'flail', 'lasso'],
    attackKeywords: ['whip', 'whips', 'chain', 'chains', 'flail', 'lasso'],
    descriptors: ['flexible', 'entangling']
  },
  grappling: {
    subtypeKeywords: ['grapple', 'grappling', 'wrestling', 'grab', 'pin', 'locks'],
    attackKeywords: ['grapple', 'grab', 'wrestle', 'tackle', 'pin'],
    descriptors: ['grappling', 'wrestling']
  }
};

/**
 * Calculates a match score between a skill subtype and an attack context.
 * Returns score > 0 if matching, 0 if not matching.
 */
export function getCombatSkillMatchScore(subtype, attackContext = {}, isRanged = true) {
  const subNorm = normalizeCombatTerm(subtype);
  if (!subNorm) return 0;

  // Extract all text fields from attackContext
  const rawName = attackContext.name || attackContext.slotName || attackContext.effectName || attackContext.powerName || '';
  const nameNorm = normalizeCombatTerm(rawName);
  const powerNameNorm = normalizeCombatTerm(attackContext.powerName || '');
  const slotNameNorm = normalizeCombatTerm(attackContext.slotName || '');
  const sourceTitleNorm = normalizeCombatTerm(attackContext.sourceTitle || '');
  const baseEffectNorm = normalizeCombatTerm(attackContext.baseEffect || '');
  const weaponTypeNorm = normalizeCombatTerm(attackContext.weaponType || '');
  const descNorm = normalizeCombatTerm(attackContext.description || '');

  // Flatten descriptors and traits
  const descList = [
    ...(Array.isArray(attackContext.descriptors) ? attackContext.descriptors : (attackContext.descriptors ? [attackContext.descriptors] : [])),
    ...(Array.isArray(attackContext.traits) ? attackContext.traits : []),
    ...(Array.isArray(attackContext.tags) ? attackContext.tags : [])
  ].map(d => normalizeCombatTerm(String(d))).filter(Boolean);

  const isThrown = Boolean(
    attackContext.isThrown ||
    descList.some(d => d.includes('thrown')) ||
    weaponTypeNorm.includes('thrown') ||
    descNorm.includes('thrown')
  );

  // 1. Exact Match on name / slot / powerName
  if (nameNorm && subNorm === nameNorm) return 100;
  if (slotNameNorm && subNorm === slotNameNorm) return 95;
  if (powerNameNorm && subNorm === powerNameNorm) return 90;

  // 2. Direct Substring Match
  if (nameNorm && (nameNorm.includes(subNorm) || subNorm.includes(nameNorm))) return 85;
  if (slotNameNorm && (slotNameNorm.includes(subNorm) || subNorm.includes(slotNameNorm))) return 80;
  if (powerNameNorm && (powerNameNorm.includes(subNorm) || subNorm.includes(powerNameNorm))) return 80;
  if (sourceTitleNorm && sourceTitleNorm.includes(subNorm)) return 75;

  // 3. Word-level overlap
  const subWords = tokenizeWords(subNorm);
  const attackWords = [
    ...tokenizeWords(nameNorm),
    ...tokenizeWords(slotNameNorm),
    ...tokenizeWords(powerNameNorm),
    ...tokenizeWords(sourceTitleNorm)
  ];

  // If all significant words of subtype are in attack words
  const nonGenericSubWords = subWords.filter(w => !['weapon', 'weapons', 'attack', 'attacks', 'combat'].includes(w));
  if (nonGenericSubWords.length > 0 && nonGenericSubWords.every(sw => attackWords.some(aw => wordMatches(aw, sw)))) {
    return 75;
  }

  // 4. Category and Synonym Match
  const categories = isRanged ? RANGED_CATEGORIES : CLOSE_CATEGORIES;

  for (const [catKey, catDef] of Object.entries(categories)) {
    // Check if skill subtype belongs to this category
    const subMatchesCategory = catDef.subtypeKeywords.some(kw => {
      const kwNorm = normalizeCombatTerm(kw);
      return subNorm === kwNorm || subNorm.includes(kwNorm) || kwNorm.includes(subNorm) || subWords.some(sw => wordMatches(sw, kwNorm));
    });

    if (!subMatchesCategory) continue;

    // Skill is in this category. Does the attack match this category?
    // Check keyword match in name, power, slot, source, description, or weaponType
    const attackTextCombined = `${nameNorm} ${slotNameNorm} ${powerNameNorm} ${sourceTitleNorm} ${descNorm} ${weaponTypeNorm}`;
    const textMatches = catDef.attackKeywords.some(ak => {
      const akNorm = normalizeCombatTerm(ak);
      return attackTextCombined.includes(akNorm) || attackWords.some(aw => wordMatches(aw, akNorm));
    });

    if (textMatches) return 65;

    // Check descriptors
    const descriptorMatches = catDef.descriptors.some(cd => {
      return descList.some(d => d.includes(cd) || cd.includes(d));
    });

    if (descriptorMatches) return 60;

    // Special category logic
    if (isRanged) {
      if (catKey === 'thrown' && isThrown) return 60;
      if (catKey === 'energy' && (baseEffectNorm === 'blast' || nameNorm.includes('blast'))) return 60;
      if (catKey === 'firearms' && (weaponTypeNorm.includes('firearm') || descNorm.includes('ballistic'))) return 60;
      if (catKey === 'battlesuit' && (powerNameNorm.includes('battlesuit') || sourceTitleNorm.includes('battlesuit') || powerNameNorm.includes('power armor'))) return 60;
      if (catKey === 'gadgets' && (powerNameNorm.includes('gadget') || sourceTitleNorm.includes('gadget') || powerNameNorm.includes('utility belt') || powerNameNorm.includes('arsenal'))) return 60;
      if (catKey === 'spells' && (descList.some(d => d.includes('magic')) || powerNameNorm.includes('magic') || powerNameNorm.includes('mystic'))) return 60;
    } else {
      if (catKey === 'unarmed' && (nameNorm.includes('unarmed') || nameNorm.includes('strike'))) return 60;
    }
  }

  // 5. Container / Source Title match fallback
  if (sourceTitleNorm && subWords.some(sw => !['weapon', 'weapons', 'combat'].includes(sw) && sourceTitleNorm.includes(sw))) {
    return 50;
  }

  return 0;
}

/**
 * Checks if a Ranged Combat specialization matches a given attack context.
 */
export function isRangedCombatMatch(subtype, attackContext = {}) {
  return getCombatSkillMatchScore(subtype, attackContext, true) > 0;
}

/**
 * Checks if a Close Combat specialization matches a given attack context.
 */
export function isCloseCombatMatch(subtype, attackContext = {}) {
  return getCombatSkillMatchScore(subtype, attackContext, false) > 0;
}

/**
 * Finds the best matching combat skill from a character's skills list for an attack.
 */
export function findMatchingCombatSkill(skills = [], attackContext = {}, isRanged = true) {
  if (!Array.isArray(skills) || skills.length === 0) return null;

  const targetName = isRanged ? 'ranged combat' : 'close combat';
  const relevantSkills = skills.filter(s => {
    if (!s) return false;
    const sName = (s.name || '').trim().toLowerCase();
    return sName === targetName || sName.startsWith(`${targetName}:`) || sName.startsWith(`${targetName} (`);
  });

  if (relevantSkills.length === 0) return null;

  let bestSkill = null;
  let bestScore = 0;
  let bestRanks = -1;

  for (const skill of relevantSkills) {
    let subtype = skill.subtype || '';
    if (!subtype && skill.name.includes(':')) {
      subtype = skill.name.split(':')[1].trim();
    } else if (!subtype && skill.name.includes('(')) {
      const m = skill.name.match(/\((.*?)\)/);
      if (m) subtype = m[1].trim();
    }

    const score = getCombatSkillMatchScore(subtype, attackContext, isRanged);
    const ranks = Number(skill.ranks ?? skill.rank ?? 0) || 0;

    if (score > 0) {
      if (score > bestScore || (score === bestScore && ranks > bestRanks)) {
        bestScore = score;
        bestRanks = ranks;
        bestSkill = skill;
      }
    }
  }

  return bestSkill;
}

/**
 * Gets the total combat skill bonus ranks for an attack.
 */
export function getCombatSkillBonus(skills = [], attackContext = {}, isRanged = true) {
  const skill = findMatchingCombatSkill(skills, attackContext, isRanged);
  return skill ? (Number(skill.ranks ?? skill.rank ?? 0) || 0) : 0;
}

