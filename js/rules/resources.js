// js/rules/resources.js

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: 'ri-apps-line' },
  { id: 'Gear', label: 'Gear & Weapons', icon: 'ri-sword-line' },
  { id: 'Gadget', label: 'Gadget & Tech', icon: 'ri-smartphone-line' },
  { id: 'Vehicle', label: 'Vehicles', icon: 'ri-car-line' },
  { id: 'Headquarters', label: 'Headquarters (HQ)', icon: 'ri-building-line' }
];

export const RESOURCE_PRESETS = [
  // --- WEAPONS & COMBAT GEAR ---
  {
    name: 'Light Pistol',
    type: 'Gear',
    epCost: 6,
    desc: 'Ranged Damage 3, Critical 20, Range: 75/150/300 ft.'
  },
  {
    name: 'Heavy Pistol',
    type: 'Gear',
    epCost: 8,
    desc: 'Ranged Damage 4, Critical 20, Range: 100/200/400 ft.'
  },
  {
    name: 'Submachine Gun (SMG)',
    type: 'Gear',
    epCost: 12,
    desc: 'Ranged Damage 4, Multiattack, Range: 100/200/400 ft.'
  },
  {
    name: 'Assault Rifle',
    type: 'Gear',
    epCost: 15,
    desc: 'Ranged Damage 5, Multiattack, Range: 125/250/500 ft.'
  },
  {
    name: 'Sniper Rifle',
    type: 'Gear',
    epCost: 11,
    desc: 'Ranged Damage 5, Critical 19-20, Range: 250/500/1000 ft.'
  },
  {
    name: 'Shotgun',
    type: 'Gear',
    epCost: 10,
    desc: 'Ranged Damage 5, Range: 50/100/200 ft.'
  },
  {
    name: 'Sword',
    type: 'Gear',
    epCost: 4,
    desc: 'Strength-based Damage 3, Critical 19-20, Slashing.'
  },
  {
    name: 'Knife / Combat Dagger',
    type: 'Gear',
    epCost: 2,
    desc: 'Strength-based Damage 1, Critical 19-20, Piercing/Slashing.'
  },
  {
    name: 'Undercover Shirt (Body Armor)',
    type: 'Gear',
    epCost: 2,
    desc: 'Protection 2, Subtle (Concealable under regular clothes).'
  },
  {
    name: 'Tactical Armor Vest',
    type: 'Gear',
    epCost: 4,
    desc: 'Protection 4, Ballistic and melee blunt resistance.'
  },
  {
    name: 'Full Riot Armor',
    type: 'Gear',
    epCost: 6,
    desc: 'Protection 6, Heavy plated body defense.'
  },

  // --- GADGETS & TECH ---
  {
    name: 'Commlink',
    type: 'Gadget',
    epCost: 1,
    desc: 'Subtle encrypted radio communication, 1 mile range.'
  },
  {
    name: 'Smart Phone / Pocket Computer',
    type: 'Gadget',
    epCost: 2,
    desc: 'Audio/Video recorder, GPS, internet access, database connection.'
  },
  {
    name: 'Night Vision Goggles',
    type: 'Gadget',
    epCost: 1,
    desc: 'Senses: Darkvision (Negates all darkness visual penalties).'
  },
  {
    name: 'Multi-tool / Toolkit',
    type: 'Gadget',
    epCost: 1,
    desc: 'Removes the -2 circumstance penalty for lacking tools on Technology checks.'
  },
  {
    name: 'Restraints (Handcuffs)',
    type: 'Gadget',
    epCost: 1,
    desc: 'Toughness 9, Sleight of Hand or Athletics check DC 20 to escape.'
  },
  {
    name: 'Gas Mask / Rebreather',
    type: 'Gadget',
    epCost: 2,
    desc: 'Immunity to airborne pathogens, tear gas, and suffocation (1 hour oxygen).'
  },
  {
    name: 'Grapple Gun',
    type: 'Gadget',
    epCost: 2,
    desc: 'Movement 1 (Swinging), Range 60 ft line with motor reel.'
  },

  // --- VEHICLES ---
  {
    name: 'Motorcycle',
    type: 'Vehicle',
    epCost: 10,
    desc: 'Size: Medium, Str: 1, Speed: 6 (120 MPH), Defense: 10, Toughness: 8.'
  },
  {
    name: 'Sports Car',
    type: 'Vehicle',
    epCost: 10,
    desc: 'Size: Large, Str: 5, Speed: 6 (120 MPH), Defense: 8, Toughness: 8.'
  },
  {
    name: 'Armored SUV / Van',
    type: 'Vehicle',
    epCost: 15,
    desc: 'Size: Huge, Str: 7, Speed: 5 (60 MPH), Defense: 6, Toughness: 10, Impervious 4.'
  },
  {
    name: 'Tactical Helicopter',
    type: 'Vehicle',
    epCost: 17,
    desc: 'Size: Huge, Str: 6, Flight: 7 (250 MPH), Defense: 6, Toughness: 9, Navigation System.'
  },
  {
    name: 'Supersonic Jet',
    type: 'Vehicle',
    epCost: 24,
    desc: 'Size: Huge, Str: 8, Flight: 10 (2,000 MPH), Defense: 6, Toughness: 11, Stealth Radar.'
  },

  // --- HEADQUARTERS ---
  {
    name: 'Secret Warehouse Lair',
    type: 'Headquarters',
    epCost: 10,
    desc: 'Size: Large, Toughness: 8, Features: Concealed, Security System, Workshop, Living Space.'
  },
  {
    name: 'Skyscraper Penthouse',
    type: 'Headquarters',
    epCost: 15,
    desc: 'Size: Medium, Toughness: 10, Features: Computer, Gym, Living Space, Security System, Helipad.'
  },
  {
    name: 'Underground Fortified Bunker',
    type: 'Headquarters',
    epCost: 18,
    desc: 'Size: Huge, Toughness: 12, Features: Sealed, Isolated, Power System, Holding Cells, Defense System.'
  },
  {
    name: 'Orbital Satellite Station',
    type: 'Headquarters',
    epCost: 25,
    desc: 'Size: Huge, Toughness: 14, Features: Sealed, Isolated, Teleporter, Sensor Array, Supercomputer, Laboratory.'
  }
];
