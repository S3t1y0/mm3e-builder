// js/rules/archetypes.js
// 10 Standard M&M 3e Hero Archetypes inspired by the Hero's Handbook

export const ARCHETYPES = [
  {
    id: 'battlesuit',
    name: 'Battlesuit',
    icon: 'ri-robot-2-line',
    tagline: 'High-tech powered armor with heavy blasters, force fields, and flight systems.',
    origin: 'High-Tech',
    description: 'A brilliant engineer, inventor, or military pilot protected by an exoskeleton of advanced alloys and micro-circuitry. The suit provides immense firepower, computer-assisted targeting, flight, and near-impervious armor.',
    tradeoffStyle: 'High Toughness / Moderate Dodge (Dodge 8, Toughness 12)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 30,
      defenses: 12,
      skills: 16,
      advantages: 12,
      powers: 80
    },
    abilities: {
      STR: 1, STA: 2, AGL: 1, DEX: 3,
      FGT: 4, INT: 6, AWE: 2, PRE: 1
    },
    defenses: {
      DODGE: 7,
      PARRY: 4,
      FORTITUDE: 6,
      WILL: 6
    },
    skills: [
      { name: 'Technology', ranks: 8, subtype: '' },
      { name: 'Ranged Combat', ranks: 5, subtype: 'Battlesuit Weapons' },
      { name: 'Expertise', ranks: 6, subtype: 'Engineering' },
      { name: 'Perception', ranks: 5, subtype: '' }
    ],
    advantages: [
      { name: 'Inventor', ranks: 1 },
      { name: 'Ranged Attack', ranks: 2 },
      { name: 'Eidetic Memory', ranks: 1 },
      { name: 'Benefit', ranks: 2 }, // Wealth
      { name: 'Equipment', ranks: 2 }
    ],
    samplePowers: [
      {
        name: 'Armor Plating',
        description: 'Heavy composite alloy armor that deflects kinetic and energy strikes.',
        effectType: 'Protection',
        costPerRank: 1,
        ranks: 10,
        range: 'Personal',
        action: 'None',
        duration: 'Permanent',
        cost: 10,
        extras: [],
        flaws: []
      },
      {
        name: 'Repulsor Blaster',
        description: 'Gauntlet-mounted directed particle beam weapons.',
        effectType: 'Damage',
        costPerRank: 2,
        ranks: 10,
        range: 'Ranged',
        action: 'Standard',
        duration: 'Instant',
        cost: 20,
        extras: [{ name: 'Increased Range', costPerRank: 1, isFlat: false }],
        flaws: []
      },
      {
        name: 'Thruster Jets',
        description: 'High-output micro-thrusters mounted in the boots and back.',
        effectType: 'Flight',
        costPerRank: 2,
        ranks: 6,
        range: 'Personal',
        action: 'Move',
        duration: 'Sustained',
        cost: 12,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'energy_controller',
    name: 'Energy Controller',
    icon: 'ri-fire-line',
    tagline: 'Master of raw elemental force, hurling devastating bolts and soaring through the sky.',
    origin: 'Mutant',
    description: 'Whether channeling stellar radiation, plasma, electricity, or mystical fire, the Energy Controller commands energy at a cellular level. Capable of pinpoint blast attacks, defensive force fields, and explosive area bombardments.',
    tradeoffStyle: 'High Dodge / Moderate Toughness (Dodge 12, Toughness 8)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 36,
      defenses: 16,
      skills: 14,
      advantages: 8,
      powers: 76
    },
    abilities: {
      STR: 0, STA: 2, AGL: 4, DEX: 4,
      FGT: 2, INT: 1, AWE: 3, PRE: 2
    },
    defenses: {
      DODGE: 8,
      PARRY: 6,
      FORTITUDE: 6,
      WILL: 7
    },
    skills: [
      { name: 'Ranged Combat', ranks: 6, subtype: 'Energy Blast' },
      { name: 'Acrobatics', ranks: 6, subtype: '' },
      { name: 'Perception', ranks: 6, subtype: '' },
      { name: 'Insight', ranks: 4, subtype: '' }
    ],
    advantages: [
      { name: 'Accurate Attack', ranks: 1 },
      { name: 'Improved Initiative', ranks: 2 },
      { name: 'Power Attack', ranks: 1 },
      { name: 'Uncanny Dodge', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Energy Blast',
        description: 'Focused projectile beam of elemental power.',
        effectType: 'Damage',
        costPerRank: 2,
        ranks: 10,
        range: 'Ranged',
        action: 'Standard',
        duration: 'Instant',
        cost: 20,
        extras: [{ name: 'Increased Range', costPerRank: 1, isFlat: false }],
        flaws: []
      },
      {
        name: 'Energy Aura Force Field',
        description: 'A shimmering aura that repels physical and energy attacks.',
        effectType: 'Force Field',
        costPerRank: 1,
        ranks: 6,
        range: 'Personal',
        action: 'Free',
        duration: 'Sustained',
        cost: 6,
        extras: [],
        flaws: []
      },
      {
        name: 'Energy Flight',
        description: 'Propelling oneself through the air via kinetic thermal thrust.',
        effectType: 'Flight',
        costPerRank: 2,
        ranks: 7,
        range: 'Personal',
        action: 'Move',
        duration: 'Sustained',
        cost: 14,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'gadgeteer',
    name: 'Gadgeteer',
    icon: 'ri-tools-line',
    tagline: 'Master of clever gadgets, tactical gear, utility belts, and rapid innovation.',
    origin: 'Training & Tech',
    description: 'Unmatched intellect and resourcefulness. The Gadgeteer carries a customized arsenal of specialized non-lethal weapons, grappling hooks, smoke pellets, hacking rigs, and armored clothing.',
    tradeoffStyle: 'High Dodge / Balanced Toughness (Dodge 11, Toughness 9)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 46,
      defenses: 14,
      skills: 30,
      advantages: 24,
      powers: 36
    },
    abilities: {
      STR: 1, STA: 2, AGL: 3, DEX: 4,
      FGT: 6, INT: 7, AWE: 3, PRE: 2
    },
    defenses: {
      DODGE: 8,
      PARRY: 5,
      FORTITUDE: 6,
      WILL: 6
    },
    skills: [
      { name: 'Technology', ranks: 10, subtype: '' },
      { name: 'Investigation', ranks: 8, subtype: '' },
      { name: 'Perception', ranks: 8, subtype: '' },
      { name: 'Ranged Combat', ranks: 6, subtype: 'Gadgets' },
      { name: 'Stealth', ranks: 6, subtype: '' },
      { name: 'Athletics', ranks: 4, subtype: '' }
    ],
    advantages: [
      { name: 'Inventor', ranks: 1 },
      { name: 'Jack-of-all-trades', ranks: 1 },
      { name: 'Equipment', ranks: 5 }, // 25 EP for gear
      { name: 'Quick Draw', ranks: 1 },
      { name: 'Well-informed', ranks: 1 },
      { name: 'Assessment', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Utility Belt Arsenal',
        description: 'A modular belt carrying cryogenic pellets, shock darts, and bolas.',
        effectType: 'Affliction',
        costPerRank: 2,
        ranks: 8,
        range: 'Ranged',
        action: 'Standard',
        duration: 'Instant',
        cost: 16,
        extras: [{ name: 'Increased Range', costPerRank: 1, isFlat: false }],
        flaws: [{ name: 'Removable', costPerRank: 0, isFlat: true, flatValue: -3 }]
      },
      {
        name: 'Tactical Visor',
        description: 'Heads-up display showing thermal spectrum and targeting reticles.',
        effectType: 'Senses',
        costPerRank: 1,
        ranks: 4,
        range: 'Personal',
        action: 'None',
        duration: 'Permanent',
        cost: 4,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'martial_artist',
    name: 'Martial Artist',
    icon: 'ri-sword-line',
    tagline: 'Peak human conditioning, legendary martial disciplines, and unerring tactical precision.',
    origin: 'Training',
    description: 'Years of rigorous physical discipline, esoteric meditation, and combat mastery allow the Martial Artist to rival superhuman titans through precision, defensive roll, and nerve strikes.',
    tradeoffStyle: 'Extreme Dodge / Low Toughness (Dodge 14, Toughness 6)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 56,
      defenses: 16,
      skills: 34,
      advantages: 28,
      powers: 16
    },
    abilities: {
      STR: 3, STA: 3, AGL: 6, DEX: 4,
      FGT: 10, INT: 1, AWE: 4, PRE: 2
    },
    defenses: {
      DODGE: 8,
      PARRY: 4,
      FORTITUDE: 6,
      WILL: 6
    },
    skills: [
      { name: 'Acrobatics', ranks: 10, subtype: '' },
      { name: 'Athletics', ranks: 8, subtype: '' },
      { name: 'Close Combat', ranks: 4, subtype: 'Unarmed' },
      { name: 'Insight', ranks: 8, subtype: '' },
      { name: 'Perception', ranks: 8, subtype: '' },
      { name: 'Stealth', ranks: 8, subtype: '' }
    ],
    advantages: [
      { name: 'Defensive Roll', ranks: 4 },
      { name: 'Improved Initiative', ranks: 2 },
      { name: 'Power Attack', ranks: 1 },
      { name: 'Takedown', ranks: 2 },
      { name: 'Agile Feint', ranks: 1 },
      { name: 'Uncanny Dodge', ranks: 1 },
      { name: 'Instant Up', ranks: 1 },
      { name: 'Prone Fighting', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Chi Flurry',
        description: 'A rapid succession of pressure-point strikes.',
        effectType: 'Damage',
        costPerRank: 1,
        ranks: 6,
        range: 'Close',
        action: 'Standard',
        duration: 'Instant',
        cost: 9,
        extras: [{ name: 'Multiattack', costPerRank: 1, isFlat: false }, { name: 'Strength-based', costPerRank: 0, isFlat: true, flatValue: 1 }],
        flaws: []
      },
      {
        name: 'Leaping & Wall Run',
        description: 'Acrobatic feats defying gravity.',
        effectType: 'Leaping',
        costPerRank: 1,
        ranks: 3,
        range: 'Personal',
        action: 'Move',
        duration: 'Instant',
        cost: 3,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'mystic',
    name: 'Mystic',
    icon: 'ri-magic-line',
    tagline: 'Wielder of ancient incantations, dimensional gateways, and arcane wards.',
    origin: 'Magic',
    description: 'Keeper of hidden lore, ancient grimoires, and arcane artifacts. The Mystic bends reality with spells of binding, scrying across planar boundaries, and shielding allies with shimmering runes.',
    tradeoffStyle: 'Balanced Defenses (Dodge 10, Toughness 10)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 40,
      defenses: 16,
      skills: 18,
      advantages: 10,
      powers: 66
    },
    abilities: {
      STR: 0, STA: 2, AGL: 2, DEX: 2,
      FGT: 3, INT: 5, AWE: 6, PRE: 3
    },
    defenses: {
      DODGE: 8,
      PARRY: 7,
      FORTITUDE: 6,
      WILL: 6
    },
    skills: [
      { name: 'Expertise', ranks: 10, subtype: 'Magic' },
      { name: 'Insight', ranks: 6, subtype: '' },
      { name: 'Perception', ranks: 6, subtype: '' },
      { name: 'Ranged Combat', ranks: 6, subtype: 'Spells' }
    ],
    advantages: [
      { name: 'Ritualist', ranks: 1 },
      { name: 'Artificer', ranks: 1 },
      { name: 'Trance', ranks: 1 },
      { name: 'Fearless', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Mystic Blast',
        description: 'Bolts of eldritch energy that crackle with magical force.',
        effectType: 'Damage',
        costPerRank: 2,
        ranks: 10,
        range: 'Ranged',
        action: 'Standard',
        duration: 'Instant',
        cost: 20,
        extras: [{ name: 'Increased Range', costPerRank: 1, isFlat: false }],
        flaws: []
      },
      {
        name: 'Shield of the Seraphim',
        description: 'An arcane ward that repels hostile spells and physical blows.',
        effectType: 'Force Field',
        costPerRank: 1,
        ranks: 8,
        range: 'Personal',
        action: 'Free',
        duration: 'Sustained',
        cost: 8,
        extras: [],
        flaws: []
      },
      {
        name: 'Astral Flight',
        description: 'Levitation and flight sustained by mystical currents.',
        effectType: 'Flight',
        costPerRank: 2,
        ranks: 5,
        range: 'Personal',
        action: 'Move',
        duration: 'Sustained',
        cost: 10,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'paragon',
    name: 'Paragon',
    icon: 'ri-shield-star-line',
    tagline: 'Godlike physical power, impervious durability, and supersonic flight.',
    origin: 'Alien / Mutation',
    description: 'The archetype of the classic champion: superhuman strength capable of lifting locomotives, skin impervious to small arms, supersonic flight, and an inspiring presence on the battlefield.',
    tradeoffStyle: 'High Toughness / Low Dodge (Dodge 8, Toughness 12)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 64,
      defenses: 8,
      skills: 12,
      advantages: 6,
      powers: 60
    },
    abilities: {
      STR: 12, STA: 10, AGL: 2, DEX: 1,
      FGT: 6, INT: 1, AWE: 2, PRE: 3
    },
    defenses: {
      DODGE: 6,
      PARRY: 2,
      FORTITUDE: 2,
      WILL: 6
    },
    skills: [
      { name: 'Athletics', ranks: 4, subtype: '' },
      { name: 'Perception', ranks: 6, subtype: '' },
      { name: 'Persuasion', ranks: 6, subtype: '' },
      { name: 'Insight', ranks: 4, subtype: '' }
    ],
    advantages: [
      { name: 'Power Attack', ranks: 1 },
      { name: 'Inspire', ranks: 2 },
      { name: 'Interpose', ranks: 1 },
      { name: 'Attractive', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Impervious Toughness',
        description: 'Resilient tissue that shrugs off attacks with ranks less than the impervious rating.',
        effectType: 'Impervious',
        costPerRank: 1,
        ranks: 8,
        range: 'Personal',
        action: 'None',
        duration: 'Permanent',
        cost: 8,
        extras: [],
        flaws: []
      },
      {
        name: 'Supersonic Flight',
        description: 'Soaring through the upper atmosphere at supersonic speeds.',
        effectType: 'Flight',
        costPerRank: 2,
        ranks: 8,
        range: 'Personal',
        action: 'Move',
        duration: 'Sustained',
        cost: 16,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'powerhouse',
    name: 'Powerhouse',
    icon: 'ri-boxing-line',
    tagline: 'A titanic juggernaut with overwhelming brute strength and shockwave groundstrikes.',
    origin: 'Accident / Mutation',
    description: 'A towering engine of sheer muscle and kinetic momentum. The Powerhouse demolishes fortifications with bare hands, withstands artillery shells, and creates shockwaves that knock enemies off their feet.',
    tradeoffStyle: 'Extreme Toughness / Minimal Dodge (Dodge 6, Toughness 14)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 56,
      defenses: 6,
      skills: 10,
      advantages: 8,
      powers: 70
    },
    abilities: {
      STR: 14, STA: 12, AGL: 1, DEX: 0,
      FGT: 6, INT: 0, AWE: 1, PRE: 1
    },
    defenses: {
      DODGE: 5,
      PARRY: 0,
      FORTITUDE: 2,
      WILL: 6
    },
    skills: [
      { name: 'Athletics', ranks: 6, subtype: '' },
      { name: 'Intimidation', ranks: 8, subtype: '' },
      { name: 'Perception', ranks: 4, subtype: '' }
    ],
    advantages: [
      { name: 'Power Attack', ranks: 1 },
      { name: 'Takedown', ranks: 1 },
      { name: 'Startle', ranks: 1 },
      { name: 'Fast Feint', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Groundstrike Shockwave',
        description: 'Smashing the earth to topple and disorient nearby combatants.',
        effectType: 'Affliction',
        costPerRank: 2,
        ranks: 10,
        range: 'Close',
        action: 'Standard',
        duration: 'Instant',
        cost: 20,
        extras: [{ name: 'Area (Burst)', costPerRank: 1, isFlat: false }],
        flaws: []
      },
      {
        name: 'Tremendous Leaping',
        description: 'Leg muscles capable of vaulting over skyscrapers in a single bound.',
        effectType: 'Leaping',
        costPerRank: 1,
        ranks: 8,
        range: 'Personal',
        action: 'Move',
        duration: 'Instant',
        cost: 8,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'psychic',
    name: 'Psychic',
    icon: 'ri-brain-line',
    tagline: 'Master of telepathy, psychokinesis, mental illusions, and astral perception.',
    origin: 'Psionic / Mutant',
    description: 'Possessing an ascended mind capable of perceiving thoughts, projecting devastating psychic blasts directly into minds, and moving objects effortlessly with telekinesis.',
    tradeoffStyle: 'Balanced Defenses with Perception Attack (Dodge 10, Toughness 10)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 44,
      defenses: 16,
      skills: 18,
      advantages: 8,
      powers: 64
    },
    abilities: {
      STR: 0, STA: 2, AGL: 2, DEX: 2,
      FGT: 2, INT: 5, AWE: 8, PRE: 3
    },
    defenses: {
      DODGE: 8,
      PARRY: 8,
      FORTITUDE: 6,
      WILL: 4
    },
    skills: [
      { name: 'Insight', ranks: 8, subtype: '' },
      { name: 'Perception', ranks: 6, subtype: '' },
      { name: 'Persuasion', ranks: 6, subtype: '' },
      { name: 'Investigation', ranks: 6, subtype: '' }
    ],
    advantages: [
      { name: 'Uncanny Dodge', ranks: 1 },
      { name: 'Trance', ranks: 1 },
      { name: 'Well-informed', ranks: 1 },
      { name: 'Assessment', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Telekinetic Force',
        description: 'Manipulating objects and striking foes from a distance through mental power.',
        effectType: 'Move Object',
        costPerRank: 2,
        ranks: 10,
        range: 'Ranged',
        action: 'Standard',
        duration: 'Sustained',
        cost: 20,
        extras: [],
        flaws: []
      },
      {
        name: 'Mental Blast',
        description: 'A searing psychic shock that bypasses physical armor entirely.',
        effectType: 'Damage',
        costPerRank: 4,
        ranks: 8,
        range: 'Perception',
        action: 'Standard',
        duration: 'Instant',
        cost: 32,
        extras: [
          { name: 'Increased Range (Perception)', costPerRank: 2, isFlat: false },
          { name: 'Alternate Resistance (Will)', costPerRank: 1, isFlat: false }
        ],
        flaws: []
      }
    ]
  },
  {
    id: 'shapeshifter',
    name: 'Shapeshifter',
    icon: 'ri-shape-line',
    tagline: 'Fluid physiology capable of morphing into beasts, mimicking forms, and stretching.',
    origin: 'Alien / Genetic',
    description: 'A biological chameleon whose genetic structure can reconfigure on command. Capable of mimicking any humanoid, adopting deadly predatory animal forms, or stretching limbs across rooms.',
    tradeoffStyle: 'Adaptive Defenses (Dodge 10, Toughness 10)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 40,
      defenses: 16,
      skills: 20,
      advantages: 10,
      powers: 64
    },
    abilities: {
      STR: 2, STA: 3, AGL: 4, DEX: 3,
      FGT: 6, INT: 1, AWE: 2, PRE: 2
    },
    defenses: {
      DODGE: 6,
      PARRY: 4,
      FORTITUDE: 6,
      WILL: 6
    },
    skills: [
      { name: 'Deception', ranks: 8, subtype: '' },
      { name: 'Stealth', ranks: 8, subtype: '' },
      { name: 'Athletics', ranks: 6, subtype: '' },
      { name: 'Perception', ranks: 6, subtype: '' }
    ],
    advantages: [
      { name: 'Agile Feint', ranks: 1 },
      { name: 'Daze', ranks: 1 },
      { name: 'Evasion', ranks: 1 },
      { name: 'Taunt', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Morph (Any Form)',
        description: 'Changing outward appearance and vocal patterns at will.',
        effectType: 'Morph',
        costPerRank: 5,
        ranks: 3,
        range: 'Personal',
        action: 'Free',
        duration: 'Sustained',
        cost: 15,
        extras: [],
        flaws: []
      },
      {
        name: 'Elongation & Camouflage',
        description: 'Stretching limbs and blending skin into backgrounds.',
        effectType: 'Elongation',
        costPerRank: 1,
        ranks: 4,
        range: 'Personal',
        action: 'Free',
        duration: 'Sustained',
        cost: 4,
        extras: [],
        flaws: []
      }
    ]
  },
  {
    id: 'speedster',
    name: 'Speedster',
    icon: 'ri-flashlight-line',
    tagline: 'Velocity beyond sound, hypersonic reactions, rapid punches, and defensive vibration.',
    origin: 'Accident / Mutation',
    description: 'Tapping into hyper-metabolic or dimensional speed force. The Speedster runs across water, up vertical walls, performs hundreds of tasks in a single second, and avoids incoming fire with effortless evasion.',
    tradeoffStyle: 'Extreme Dodge / Low Toughness (Dodge 15, Toughness 5)',
    recommendedPL: 10,
    budgetGuidelines: {
      abilities: 44,
      defenses: 14,
      skills: 18,
      advantages: 14,
      powers: 60
    },
    abilities: {
      STR: 2, STA: 2, AGL: 7, DEX: 4,
      FGT: 6, INT: 2, AWE: 2, PRE: 1
    },
    defenses: {
      DODGE: 8,
      PARRY: 4,
      FORTITUDE: 6,
      WILL: 6
    },
    skills: [
      { name: 'Acrobatics', ranks: 8, subtype: '' },
      { name: 'Athletics', ranks: 8, subtype: '' },
      { name: 'Perception', ranks: 6, subtype: '' },
      { name: 'Close Combat', ranks: 4, subtype: 'Unarmed' }
    ],
    advantages: [
      { name: 'Improved Initiative', ranks: 4 }, // +16 Init!
      { name: 'Defensive Roll', ranks: 3 },
      { name: 'Evasion', ranks: 2 },
      { name: 'Move-by Action', ranks: 1 },
      { name: 'Instant Up', ranks: 1 },
      { name: 'Uncanny Dodge', ranks: 1 }
    ],
    samplePowers: [
      {
        name: 'Super-Speed',
        description: 'Moving across land and water at hypersonic speeds.',
        effectType: 'Speed',
        costPerRank: 1,
        ranks: 10,
        range: 'Personal',
        action: 'Free',
        duration: 'Sustained',
        cost: 10,
        extras: [],
        flaws: []
      },
      {
        name: 'Quickness',
        description: 'Performing routine non-combat tasks in fractions of a second.',
        effectType: 'Quickness',
        costPerRank: 1,
        ranks: 8,
        range: 'Personal',
        action: 'Free',
        duration: 'Sustained',
        cost: 8,
        extras: [],
        flaws: []
      },
      {
        name: 'Rapid-Fire Strike',
        description: 'Dozens of supersonic blows raining down on an opponent.',
        effectType: 'Damage',
        costPerRank: 1,
        ranks: 5,
        range: 'Close',
        action: 'Standard',
        duration: 'Instant',
        cost: 10,
        extras: [
          { name: 'Multiattack', costPerRank: 1, isFlat: false },
          { name: 'Strength-based', costPerRank: 0, isFlat: true, flatValue: 1 }
        ],
        flaws: []
      }
    ]
  }
];

export function getArchetypeById(id) {
  return ARCHETYPES.find(a => a.id === id) || null;
}
