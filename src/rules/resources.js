// js/rules/resources.js
// Mutants & Masterminds 3rd Edition (Deluxe Hero's Handbook - Chapter 7: Gadgets & Gear)

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'All Items', icon: 'ri-apps-line' },
  { id: 'Weapons', label: 'Weapons', icon: 'ri-sword-line' },
  { id: 'Armor', label: 'Armor & Defense', icon: 'ri-shield-line' },
  { id: 'Gadget', label: 'Gadgets & Tech', icon: 'ri-smartphone-line' },
  { id: 'Vehicle', label: 'Vehicles', icon: 'ri-car-line' },
  { id: 'Headquarters', label: 'Headquarters (HQ)', icon: 'ri-building-line' }
];

export const WEAPON_TRAITS = [
  { id: 'Multiattack', label: 'Multiattack', cost: 1, desc: 'Covers spray fire, autofire against one target, or multiple adjacent targets.' },
  { id: 'Penetrating', label: 'Penetrating', cost: 1, desc: 'Overcomes Impervious Toughness.' },
  { id: 'Subtle', label: 'Subtle', cost: 1, desc: 'Concealable or silent firing (suppressor/silencer).' },
  { id: 'Reach', label: 'Reach (5 ft)', cost: 1, desc: '+5 ft melee reach per rank.' },
  { id: 'Ricochet', label: 'Ricochet', cost: 1, desc: 'Bounce attacks off hard surfaces around corners.' },
  { id: 'Area Burst', label: 'Area (Burst 30 ft)', cost: 1, desc: 'Dodge check DC 10+rank for half effect; targets area.' },
  { id: 'Area Cone', label: 'Area (Cone 60 ft)', cost: 1, desc: 'Cone shaped blast from user.' },
  { id: 'Area Line', label: 'Area (Line 30 ft)', cost: 1, desc: 'Linear path effect.' },
  { id: 'Homing', label: 'Homing', cost: 1, desc: 'Reroll attack on following round if missed.' },
  { id: 'Affliction', label: 'Affliction', cost: 0, desc: 'Inflicts conditions rather than lethal damage (e.g. Taser, Tear Gas).' }
];

export const VEHICLE_SIZES = [
  { size: 'Diminutive', strBase: -4, defMod: 4, toughBase: 2, epCost: -2, desc: 'RC car, miniature drone' },
  { size: 'Tiny', strBase: -2, defMod: 3, toughBase: 3, epCost: -1, desc: 'Bicycle, small scooter' },
  { size: 'Small', strBase: 0, defMod: 2, toughBase: 4, epCost: 0, desc: 'Motorcycle, jet ski' },
  { size: 'Medium', strBase: 2, defMod: 1, toughBase: 6, epCost: 1, desc: 'Compact car, ATV' },
  { size: 'Large', strBase: 5, defMod: 0, toughBase: 8, epCost: 2, desc: 'Sedan, SUV, pickup, light helicopter' },
  { size: 'Huge', strBase: 7, defMod: -2, toughBase: 10, epCost: 3, desc: 'Armored SWAT van, limousine, tactical chopper' },
  { size: 'Gargantuan', strBase: 10, defMod: -4, toughBase: 12, epCost: 4, desc: 'Fighter jet, submarine, cargo transport, battle tank' },
  { size: 'Colossal', strBase: 13, defMod: -6, toughBase: 14, epCost: 5, desc: 'Aircraft carrier, space cruiser, bullet train' }
];

export const VEHICLE_FEATURES = [
  'Autopilot / Autonomous (AI)',
  'Alarm & Anti-Theft System',
  'Armor Plating (Impervious)',
  'Caltrop Dispenser',
  'Communications (Radio/Satellite)',
  'Concealed Weapons',
  'Ejection Seats',
  'Hidden Cargo Compartments',
  'Mounted Heavy Weapon',
  'Navigation System (GPS)',
  'Oil Slick Dispenser',
  'Remote Control',
  'Smokescreen Dispenser',
  'Stealth Radar / ECM',
  'Waterproof / Amphibious Submersion'
];

export const HQ_FEATURES = [
  { name: 'Combat Simulator / Danger Room', desc: '+2 circumstance bonus for combat training' },
  { name: 'Communications System', desc: 'Global & satellite secure communication relay' },
  { name: 'Computer Mainframe', desc: 'Supercomputer AI database (+2 to Technology & Investigation checks)' },
  { name: 'Concealed', desc: 'Disguised entrance (Investigation/Perception DC 20+ to notice)' },
  { name: 'Defense System', desc: 'Automated turret defenses and security blasters' },
  { name: 'Deathtraps', desc: 'Lethal traps for intruders' },
  { name: 'Fire Prevention System', desc: 'Automatic halogen/foam extinguisher suppression' },
  { name: 'Garage / Vehicle Bay', desc: 'Spacious maintenance dock for land vehicles' },
  { name: 'Gym / Training Facility', desc: 'Physical conditioning center (+2 circumstance to Athletics)' },
  { name: 'Hangar / Helipad', desc: 'Aviation launch pad for aircraft & vertical lift' },
  { name: 'Holding Cells', desc: 'Toughness 14 reinforced holding cells for prisoners' },
  { name: 'Holding Cells (Power Nullifying)', desc: 'Cells that suppress mutant/superhuman powers' },
  { name: 'Infirmary / Med-Bay', desc: 'Equipped medical bay (+2 to Treatment, stabilized care)' },
  { name: 'Isolated', desc: 'Located far from civilization (Arctic, ocean, mountain, desert)' },
  { name: 'Laboratory', desc: 'Cutting-edge science & forensics analysis lab' },
  { name: 'Library', desc: 'Extensive archives (+2 to Expertise research checks)' },
  { name: 'Living Space', desc: 'Comfortable bedrooms, kitchen, and living quarters' },
  { name: 'Power System (Backup)', desc: 'Self-sufficient nuclear or fusion generator' },
  { name: 'Sealed (NBC Protection)', desc: 'Airtight with independent oxygen filtering' },
  { name: 'Security System', desc: 'Biometric locks, motion sensors, laser tripwires (DC 25)' },
  { name: 'Self-Destruct System', desc: 'Controlled explosive demolition sequence' },
  { name: 'Teleportation Chamber', desc: 'Point-to-point teleportation portal relay' },
  { name: 'Workshop', desc: 'Heavy manufacturing and inventing workshop' }
];

export const RESOURCE_PRESETS = [
  // ==========================================
  // 1. MELEE WEAPONS (Archaic & Modern)
  // ==========================================
  {
    name: 'Knife / Combat Dagger',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 2,
    status: 'equipped',
    desc: 'Strength-based Damage 1, Critical 19-20, Piercing/Slashing. Easily concealed.',
    weapon: {
      isStrengthBased: true,
      damageRank: 1,
      attackBonus: 0,
      range: 'Close',
      crit: '19-20',
      resistance: 'Toughness',
      traits: ['Subtle']
    }
  },
  {
    name: 'Sword',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 4,
    status: 'equipped',
    desc: 'Strength-based Damage 3, Critical 19-20, Slashing. Standard longsword or katana.',
    weapon: {
      isStrengthBased: true,
      damageRank: 3,
      attackBonus: 0,
      range: 'Close',
      crit: '19-20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Greatsword / Claymore',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 5,
    status: 'equipped',
    desc: 'Strength-based Damage 4, Critical 19-20, Slashing. Two-handed heavy martial blade.',
    weapon: {
      isStrengthBased: true,
      damageRank: 4,
      attackBonus: 0,
      range: 'Close',
      crit: '19-20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Battleaxe',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 4,
    status: 'equipped',
    desc: 'Strength-based Damage 3, Critical 20, Slashing. Cleaving martial axe.',
    weapon: {
      isStrengthBased: true,
      damageRank: 3,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Penetrating']
    }
  },
  {
    name: 'Warhammer / Maul',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 4,
    status: 'equipped',
    desc: 'Strength-based Damage 3, Critical 20, Bludgeoning. Crushing heavy impact.',
    weapon: {
      isStrengthBased: true,
      damageRank: 3,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Penetrating']
    }
  },
  {
    name: 'Spear',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 4,
    status: 'equipped',
    desc: 'Strength-based Damage 3, Critical 20, Piercing. Reach 5 ft.',
    weapon: {
      isStrengthBased: true,
      damageRank: 3,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Reach']
    }
  },
  {
    name: 'Halberd / Polearm',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 5,
    status: 'equipped',
    desc: 'Strength-based Damage 4, Critical 20, Slashing/Piercing. Reach 5 ft, Two-handed.',
    weapon: {
      isStrengthBased: true,
      damageRank: 4,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Reach']
    }
  },
  {
    name: 'Quarterstaff',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 3,
    status: 'equipped',
    desc: 'Strength-based Damage 2, Critical 20, Bludgeoning. Reach 5 ft, Double weapon.',
    weapon: {
      isStrengthBased: true,
      damageRank: 2,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Reach']
    }
  },
  {
    name: 'Club / Police Baton',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 2,
    status: 'equipped',
    desc: 'Strength-based Damage 2, Critical 20, Bludgeoning.',
    weapon: {
      isStrengthBased: true,
      damageRank: 2,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Brass Knuckles',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 1,
    status: 'equipped',
    desc: 'Strength-based Damage 1, Critical 20, Bludgeoning. Subtle concealment.',
    weapon: {
      isStrengthBased: true,
      damageRank: 1,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Subtle']
    }
  },
  {
    name: 'Chain / Whip',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 4,
    status: 'equipped',
    desc: 'Strength-based Damage 2, Critical 20, Reach 10 ft, Improved Trip.',
    weapon: {
      isStrengthBased: true,
      damageRank: 2,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Reach']
    }
  },
  {
    name: 'Stun Baton',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 5,
    status: 'equipped',
    desc: 'Affliction 5 (Dazed, Stunned, Incapacitated), Resisted by Fortitude. DC 15.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Fortitude',
      traits: ['Affliction']
    }
  },
  {
    name: 'Chainsaw',
    type: 'Gear',
    subtype: 'weapon_melee',
    epCost: 8,
    status: 'equipped',
    desc: 'Damage 6, Penetrating 6, Slashing, Critical 20. Inaccurate -1, Unreliable.',
    weapon: {
      isStrengthBased: false,
      damageRank: 6,
      attackBonus: -1,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Penetrating']
    }
  },

  // ==========================================
  // 2. RANGED WEAPONS (Firearms & Exotic)
  // ==========================================
  {
    name: 'Hold-out Pistol',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 5,
    status: 'equipped',
    desc: 'Ranged Damage 2, Critical 20, Subtle (pocket concealment), Range: 50/100/200 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 2,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 50,
      mediumRange: 100,
      longRange: 200,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Subtle']
    }
  },
  {
    name: 'Light Pistol (9mm)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 6,
    status: 'equipped',
    desc: 'Ranged Damage 3, Critical 20, Range: 75/150/300 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 3,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 75,
      mediumRange: 150,
      longRange: 300,
      crit: '20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Heavy Pistol (.45 / .50)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 8,
    status: 'equipped',
    desc: 'Ranged Damage 4, Critical 20, Range: 100/200/400 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 4,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 100,
      mediumRange: 200,
      longRange: 400,
      crit: '20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Submachine Gun (SMG)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 12,
    status: 'equipped',
    desc: 'Ranged Damage 4, Multiattack, Range: 100/200/400 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 4,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 100,
      mediumRange: 200,
      longRange: 400,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Multiattack']
    }
  },
  {
    name: 'Assault Rifle (5.56mm)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 15,
    status: 'equipped',
    desc: 'Ranged Damage 5, Multiattack, Range: 125/250/500 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 125,
      mediumRange: 250,
      longRange: 500,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Multiattack']
    }
  },
  {
    name: 'Sniper Rifle (7.62mm)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 11,
    status: 'equipped',
    desc: 'Ranged Damage 5, Critical 19-20, Range: 250/500/1000 ft. Telescopic scope included.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 250,
      mediumRange: 500,
      longRange: 1000,
      crit: '19-20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Shotgun (12 Gauge)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 10,
    status: 'equipped',
    desc: 'Ranged Damage 5, Range: 50/100/200 ft. High close-range lethality.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 50,
      mediumRange: 100,
      longRange: 200,
      crit: '20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Anti-Materiel Rifle (.50 BMG)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 14,
    status: 'equipped',
    desc: 'Ranged Damage 7, Critical 19-20, Penetrating 3, Range: 350/700/1400 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 7,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 350,
      mediumRange: 700,
      longRange: 1400,
      crit: '19-20',
      resistance: 'Toughness',
      traits: ['Penetrating']
    }
  },
  {
    name: 'Heavy Machine Gun (.50 Cal)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 18,
    status: 'equipped',
    desc: 'Ranged Damage 6, Multiattack, Range: 150/300/600 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 6,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 150,
      mediumRange: 300,
      longRange: 600,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Multiattack']
    }
  },
  {
    name: 'Grenade Launcher (40mm)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 15,
    status: 'equipped',
    desc: 'Ranged Damage 5, Area (Burst 30 ft), Range: 125/250/500 ft. Dodge check DC 15 for half.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 125,
      mediumRange: 250,
      longRange: 500,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Area Burst']
    }
  },
  {
    name: 'Rocket Launcher / RPG',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 20,
    status: 'equipped',
    desc: 'Ranged Damage 10, Area (Burst 30 ft), Penetrating 5, Range: 250/500/1000 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 10,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 250,
      mediumRange: 500,
      longRange: 1000,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Area Burst', 'Penetrating']
    }
  },
  {
    name: 'Flamethrower',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 12,
    status: 'equipped',
    desc: 'Damage 6, Area (Cone 60 ft), Secondary Effect (burns on subsequent round).',
    weapon: {
      isStrengthBased: false,
      damageRank: 6,
      attackBonus: 0,
      range: 'Close',
      crit: '20',
      resistance: 'Toughness',
      traits: ['Area Cone']
    }
  },
  {
    name: 'Compound Bow & Arrows',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 6,
    status: 'equipped',
    desc: 'Ranged Strength-based Damage 3, Critical 20, Silent (Subtle), Range: 75/150/300 ft.',
    weapon: {
      isStrengthBased: true,
      damageRank: 3,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 75,
      mediumRange: 150,
      longRange: 300,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Subtle']
    }
  },
  {
    name: 'Heavy Crossbow',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 8,
    status: 'equipped',
    desc: 'Ranged Damage 4, Critical 19-20, Range: 100/200/400 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 4,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 100,
      mediumRange: 200,
      longRange: 400,
      crit: '19-20',
      resistance: 'Toughness',
      traits: []
    }
  },
  {
    name: 'Taser (Prong Cartridge)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 10,
    status: 'equipped',
    desc: 'Ranged Affliction 5 (Dazed, Stunned, Incapacitated), Resisted by Fortitude. Range: 10/20/40 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 10,
      mediumRange: 20,
      longRange: 40,
      crit: '20',
      resistance: 'Fortitude',
      traits: ['Affliction']
    }
  },
  {
    name: 'Frag Grenades (Box of 5)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 15,
    status: 'equipped',
    desc: 'Ranged Damage 5, Area (Burst 30 ft), Thrown (Range: STR x 10 ft). DC 15 Toughness.',
    weapon: {
      isStrengthBased: false,
      damageRank: 5,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 30,
      mediumRange: 60,
      longRange: 120,
      crit: '20',
      resistance: 'Toughness',
      traits: ['Area Burst']
    }
  },
  {
    name: 'Flashbang Grenades (Box of 5)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 12,
    status: 'equipped',
    desc: 'Ranged Affliction 4 (Visually & Auditory Impaired, Disabled, Unaware), Area Burst 30 ft.',
    weapon: {
      isStrengthBased: false,
      damageRank: 4,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 30,
      mediumRange: 60,
      longRange: 120,
      crit: '20',
      resistance: 'Fortitude',
      traits: ['Area Burst', 'Affliction']
    }
  },
  {
    name: 'Smoke Grenades (Box of 5)',
    type: 'Gear',
    subtype: 'weapon_ranged',
    epCost: 8,
    status: 'equipped',
    desc: 'Concealment 4 (All Visual Senses), Cloud Area (30 ft radius), Duration: Sustained 5 rounds.',
    weapon: {
      isStrengthBased: false,
      damageRank: 4,
      attackBonus: 0,
      range: 'Ranged',
      shortRange: 30,
      mediumRange: 60,
      longRange: 120,
      crit: '20',
      resistance: 'Dodge',
      traits: ['Area Burst']
    }
  },

  // ==========================================
  // 3. ARMOR & PROTECTIVE GEAR
  // ==========================================
  {
    name: 'Leather Armor Jacket',
    type: 'Gear',
    subtype: 'armor',
    epCost: 1,
    status: 'equipped',
    desc: 'Protection 1, Subtle (Regular leather jacket). Negates minor scrapes and cuts.',
    armor: {
      protectionRank: 1,
      isSubtle: true,
      activeDefenseBonus: 0,
      imperviousRank: 0
    }
  },
  {
    name: 'Undercover Shirt (Kevlar)',
    type: 'Gear',
    subtype: 'armor',
    epCost: 2,
    status: 'equipped',
    desc: 'Protection 2, Subtle (Concealable under regular clothes without detection).',
    armor: {
      protectionRank: 2,
      isSubtle: true,
      activeDefenseBonus: 0,
      imperviousRank: 0
    }
  },
  {
    name: 'Tactical Armor Vest',
    type: 'Gear',
    subtype: 'armor',
    epCost: 4,
    status: 'equipped',
    desc: 'Protection 4, Ballistic and melee blunt resistance. Standard patrol/tactical vest.',
    armor: {
      protectionRank: 4,
      isSubtle: false,
      activeDefenseBonus: 0,
      imperviousRank: 0
    }
  },
  {
    name: 'Full Riot Armor',
    type: 'Gear',
    subtype: 'armor',
    epCost: 6,
    status: 'equipped',
    desc: 'Protection 6, Heavy composite plating covering torso, shoulders, and legs.',
    armor: {
      protectionRank: 6,
      isSubtle: false,
      activeDefenseBonus: 0,
      imperviousRank: 0
    }
  },
  {
    name: 'SWAT Ballistic Suit',
    type: 'Gear',
    subtype: 'armor',
    epCost: 10,
    status: 'equipped',
    desc: 'Protection 8, Impervious Toughness 4. High-threat military assault armor.',
    armor: {
      protectionRank: 8,
      isSubtle: false,
      activeDefenseBonus: 0,
      imperviousRank: 4
    }
  },
  {
    name: 'Ballistic Tactical Shield',
    type: 'Gear',
    subtype: 'shield',
    epCost: 4,
    status: 'equipped',
    desc: 'Enhanced Active Defense: +2 Dodge, +2 Parry. Cover bonus against ranged attacks.',
    armor: {
      protectionRank: 0,
      isSubtle: false,
      activeDefenseBonus: 2,
      imperviousRank: 0
    }
  },
  {
    name: 'Hazmat / Radiation Suit',
    type: 'Gear',
    subtype: 'armor',
    epCost: 5,
    status: 'equipped',
    desc: 'Immunity 5 (Radiation, Chemical Toxins, Biological Pathogens, Suffocation).',
    armor: {
      protectionRank: 1,
      isSubtle: false,
      activeDefenseBonus: 0,
      imperviousRank: 0
    }
  },

  // ==========================================
  // 4. GADGETS, SENSORS & ESPIONAGE
  // ==========================================
  {
    name: 'Commlink',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 1,
    status: 'equipped',
    desc: 'Subtle encrypted radio communication transceiver with 1 mile range.'
  },
  {
    name: 'Smart Phone / Pocket Computer',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 2,
    status: 'equipped',
    desc: 'Audio/Video recorder, GPS navigation, internet access, database connection.'
  },
  {
    name: 'Night Vision Goggles',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 1,
    status: 'equipped',
    desc: 'Senses: Darkvision (Negates all visual penalties from darkness).'
  },
  {
    name: 'Flash Goggles',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 1,
    status: 'equipped',
    desc: 'Immunity to Visual Dazzle / Flashbang disorientation effects.'
  },
  {
    name: 'Binoculars (Telescopic)',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 1,
    status: 'equipped',
    desc: 'Senses: Extended Vision (Removes -2 range penalty per 100 ft).'
  },
  {
    name: 'Audio Bug & Micro-Receiver',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 2,
    status: 'equipped',
    desc: 'Concealed magnetic microphone broadcasting up to 5 miles.'
  },
  {
    name: 'Mini-Tracer (GPS Beacon x3)',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 2,
    status: 'equipped',
    desc: 'Adhesive tracking bugs. Tracks position via smartphone/computer within 20 miles.'
  },
  {
    name: 'Multi-tool / Toolkit',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 1,
    status: 'equipped',
    desc: 'Removes the -2 circumstance penalty for lacking tools on Technology checks.'
  },
  {
    name: 'Restraints (Steel Handcuffs)',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 1,
    status: 'equipped',
    desc: 'Toughness 9, Sleight of Hand or Athletics check DC 20 to break/escape.'
  },
  {
    name: 'Gas Mask / Rebreather',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 2,
    status: 'equipped',
    desc: 'Immunity to airborne pathogens, tear gas, and suffocation (1 hour oxygen supply).'
  },
  {
    name: 'Grapple Gun',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 2,
    status: 'equipped',
    desc: 'Movement 1 (Swinging), Range 60 ft line with high-speed motorized reel.'
  },
  {
    name: 'Lock Release Gun / Electronic Pick',
    type: 'Gadget',
    subtype: 'gadget',
    epCost: 2,
    status: 'equipped',
    desc: '+2 circumstance bonus on Technology checks to bypass mechanical and digital locks.'
  },

  // ==========================================
  // 5. VEHICLES (Land, Water, Air, Heavy)
  // ==========================================
  {
    name: 'Motorcycle',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 10,
    status: 'equipped',
    desc: 'Agile two-wheeled street vehicle. Size: Small, Str: 1, Speed: 6 (120 MPH), Defense: 10, Toughness: 8.',
    vehicle: {
      size: 'Small',
      str: 1,
      speedRank: 6,
      speedType: 'Ground',
      speedMph: '120 MPH',
      defense: 10,
      toughness: 8,
      impervious: 0,
      features: ['Navigation System (GPS)']
    }
  },
  {
    name: 'Sports Car',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 11,
    status: 'equipped',
    desc: 'High-speed performance automobile. Size: Large, Str: 5, Speed: 6 (120 MPH), Defense: 8, Toughness: 8.',
    vehicle: {
      size: 'Large',
      str: 5,
      speedRank: 6,
      speedType: 'Ground',
      speedMph: '120 MPH',
      defense: 8,
      toughness: 8,
      impervious: 0,
      features: ['Alarm & Anti-Theft System', 'Navigation System (GPS)']
    }
  },
  {
    name: 'Police Patrol Cruiser',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 12,
    status: 'equipped',
    desc: 'Enforced sedan with sirens, radio cage, and ram bumper. Size: Large, Str: 5, Speed: 5 (60 MPH), Defense: 8, Toughness: 9.',
    vehicle: {
      size: 'Large',
      str: 5,
      speedRank: 5,
      speedType: 'Ground',
      speedMph: '60 MPH',
      defense: 8,
      toughness: 9,
      impervious: 2,
      features: ['Communications (Radio/Satellite)', 'Navigation System (GPS)']
    }
  },
  {
    name: 'Armored SWAT Van / APC',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 16,
    status: 'equipped',
    desc: 'Heavily reinforced assault van. Size: Huge, Str: 7, Speed: 5 (60 MPH), Defense: 6, Toughness: 11, Impervious 6.',
    vehicle: {
      size: 'Huge',
      str: 7,
      speedRank: 5,
      speedType: 'Ground',
      speedMph: '60 MPH',
      defense: 6,
      toughness: 11,
      impervious: 6,
      features: ['Armor Plating (Impervious)', 'Communications (Radio/Satellite)', 'Hidden Cargo Compartments']
    }
  },
  {
    name: 'Tactical Helicopter',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 18,
    status: 'equipped',
    desc: 'Military utility helicopter with searchlight and radar. Size: Huge, Str: 6, Flight: 7 (250 MPH), Defense: 6, Toughness: 9.',
    vehicle: {
      size: 'Huge',
      str: 6,
      speedRank: 7,
      speedType: 'Flight',
      speedMph: '250 MPH',
      defense: 6,
      toughness: 9,
      impervious: 2,
      features: ['Communications (Radio/Satellite)', 'Navigation System (GPS)', 'Searchlight']
    }
  },
  {
    name: 'Supersonic Fighter Jet',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 26,
    status: 'equipped',
    desc: 'Advanced twin-engine stealth interceptor. Size: Gargantuan, Str: 8, Flight: 10 (2,000 MPH), Defense: 4, Toughness: 11.',
    vehicle: {
      size: 'Gargantuan',
      str: 8,
      speedRank: 10,
      speedType: 'Flight',
      speedMph: '2,000 MPH',
      defense: 4,
      toughness: 11,
      impervious: 4,
      features: ['Stealth Radar / ECM', 'Autopilot / Autonomous (AI)', 'Ejection Seats', 'Navigation System (GPS)']
    }
  },
  {
    name: 'Speedboat / Coast Guard Cutter',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 12,
    status: 'equipped',
    desc: 'High-speed marine craft. Size: Large, Str: 5, Swimming: 5 (60 MPH), Defense: 8, Toughness: 8.',
    vehicle: {
      size: 'Large',
      str: 5,
      speedRank: 5,
      speedType: 'Swimming',
      speedMph: '60 MPH',
      defense: 8,
      toughness: 8,
      impervious: 0,
      features: ['Navigation System (GPS)', 'Communications (Radio/Satellite)']
    }
  },
  {
    name: 'Main Battle Tank',
    type: 'Vehicle',
    subtype: 'vehicle',
    epCost: 28,
    status: 'equipped',
    desc: 'Treaded combat behemoth with heavy cannon. Size: Gargantuan, Str: 10, Speed: 4 (30 MPH), Defense: 4, Toughness: 14, Impervious 10.',
    vehicle: {
      size: 'Gargantuan',
      str: 10,
      speedRank: 4,
      speedType: 'Ground',
      speedMph: '30 MPH',
      defense: 4,
      toughness: 14,
      impervious: 10,
      features: ['Mounted Heavy Weapon', 'Armor Plating (Impervious)', 'Communications (Radio/Satellite)']
    }
  },

  // ==========================================
  // 6. HEADQUARTERS (Secret Bases & Sanctuaries)
  // ==========================================
  {
    name: 'Secret Warehouse Lair',
    type: 'Headquarters',
    subtype: 'headquarters',
    epCost: 10,
    status: 'equipped',
    desc: 'Disguised industrial warehouse base. Size: Large, Toughness: 8, Features: Concealed, Security System, Workshop, Living Space.',
    hq: {
      size: 'Large',
      toughness: 8,
      features: ['Concealed', 'Security System', 'Workshop', 'Living Space', 'Garage / Vehicle Bay']
    }
  },
  {
    name: 'Skyscraper Penthouse',
    type: 'Headquarters',
    subtype: 'headquarters',
    epCost: 15,
    status: 'equipped',
    desc: 'High-tech downtown penthouse sanctuary. Size: Medium, Toughness: 10, Features: Computer Mainframe, Gym, Living Space, Security System, Helipad.',
    hq: {
      size: 'Medium',
      toughness: 10,
      features: ['Computer Mainframe', 'Gym / Training Facility', 'Living Space', 'Security System', 'Hangar / Helipad']
    }
  },
  {
    name: 'Underground Fortified Bunker',
    type: 'Headquarters',
    subtype: 'headquarters',
    epCost: 18,
    status: 'equipped',
    desc: 'Deep subterranean shelter with blast doors. Size: Huge, Toughness: 12, Features: Sealed, Isolated, Power System, Holding Cells, Defense System.',
    hq: {
      size: 'Huge',
      toughness: 12,
      features: ['Sealed (NBC Protection)', 'Isolated', 'Power System (Backup)', 'Holding Cells', 'Defense System', 'Infirmary / Med-Bay']
    }
  },
  {
    name: 'Orbital Satellite Station',
    type: 'Headquarters',
    subtype: 'headquarters',
    epCost: 26,
    status: 'equipped',
    desc: 'Station stationed in low Earth orbit. Size: Huge, Toughness: 14, Features: Sealed, Isolated, Teleportation Chamber, Supercomputer, Laboratory, Defense System.',
    hq: {
      size: 'Huge',
      toughness: 14,
      features: ['Sealed (NBC Protection)', 'Isolated', 'Teleportation Chamber', 'Computer Mainframe', 'Laboratory', 'Defense System', 'Power System (Backup)', 'Living Space']
    }
  },
  {
    name: 'Suburban Manor & Cave Complex',
    type: 'Headquarters',
    subtype: 'headquarters',
    epCost: 22,
    status: 'equipped',
    desc: 'Historic mansion sitting above an enormous high-tech cavern. Size: Huge, Toughness: 10, Features: Concealed, Computer, Gym, Hangar, Holding Cells, Infirmary, Lab, Workshop.',
    hq: {
      size: 'Huge',
      toughness: 10,
      features: ['Concealed', 'Computer Mainframe', 'Gym / Training Facility', 'Hangar / Helipad', 'Garage / Vehicle Bay', 'Holding Cells', 'Infirmary / Med-Bay', 'Laboratory', 'Workshop', 'Security System']
    }
  },
  {
    name: 'Island Mountaintop Fortress',
    type: 'Headquarters',
    subtype: 'headquarters',
    epCost: 24,
    status: 'equipped',
    desc: 'Volcanic island redoubt with submarine pens. Size: Gargantuan, Toughness: 12, Features: Isolated, Concealed, Dock, Defense System, Holding Cells, Sealed, Power System.',
    hq: {
      size: 'Gargantuan',
      toughness: 12,
      features: ['Isolated', 'Concealed', 'Garage / Vehicle Bay', 'Hangar / Helipad', 'Defense System', 'Holding Cells', 'Sealed (NBC Protection)', 'Power System (Backup)', 'Living Space', 'Workshop']
    }
  }
];

