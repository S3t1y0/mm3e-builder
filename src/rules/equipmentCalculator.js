// src/rules/equipmentCalculator.js
// Mutants & Masterminds 3rd Edition (Deluxe Hero's Handbook - Chapter 7: Gadgets & Gear)
// Mathematical Calculation Engine for Custom Equipment

import { VEHICLE_SIZES, VEHICLE_FEATURES, HQ_FEATURES, WEAPON_TRAITS } from './resources.js';

export const HQ_SIZES = [
  { size: 'Small', epCost: 0, toughBase: 8, desc: '1 room, hidden bunker, shed, small safehouse' },
  { size: 'Medium', epCost: 1, toughBase: 8, desc: 'House, small clinic, brownstone townhouse, loft' },
  { size: 'Large', epCost: 2, toughBase: 10, desc: 'Mansion, industrial warehouse, city hall wing' },
  { size: 'Huge', epCost: 3, toughBase: 10, desc: 'Skyscraper, sprawling compound, tactical base' },
  { size: 'Gargantuan', epCost: 4, toughBase: 12, desc: 'Castle fortress, deep subterranean complex, mountain redoubt' },
  { size: 'Colossal', epCost: 5, toughBase: 14, desc: 'Remote volcanic island, orbital space station' },
  { size: 'Awesome', epCost: 6, toughBase: 16, desc: 'Subterranean metropolis, planetary redoubt' }
];

export const SPEED_RANK_TABLE = [
  { rank: 1, mph: '4 MPH' },
  { rank: 2, mph: '8 MPH' },
  { rank: 3, mph: '16 MPH' },
  { rank: 4, mph: '30 MPH' },
  { rank: 5, mph: '60 MPH' },
  { rank: 6, mph: '120 MPH' },
  { rank: 7, mph: '250 MPH' },
  { rank: 8, mph: '500 MPH' },
  { rank: 9, mph: '1,000 MPH' },
  { rank: 10, mph: '2,000 MPH' },
  { rank: 11, mph: '4,000 MPH' },
  { rank: 12, mph: '8,000 MPH' }
];

export const ARMOR_EXTRAS = [
  { id: 'Subtle', label: 'Subtle (Concealed)', cost: 1, desc: 'Concealable under civilian clothes (e.g. Undercover Vest).' },
  { id: 'ImmunityCold', label: 'Immunity: Extreme Cold', cost: 1, desc: 'Protects from Arctic conditions and environmental frostbite.' },
  { id: 'ImmunityHeat', label: 'Immunity: Extreme Heat', cost: 1, desc: 'Protects from desert heat and environmental fire hazards.' },
  { id: 'ImmunityRad', label: 'Immunity: Radiation', cost: 1, desc: 'Lead-lined shielding against ambient radioactive zones.' },
  { id: 'ImmunityGas', label: 'Immunity: Suffocation / Gas', cost: 1, desc: 'Built-in oxygen rebreather against smoke, toxic gas, and vacuum.' },
  { id: 'SecondChance', label: 'Second Chance (Hazard Reroll)', cost: 1, desc: 'Reroll a failed Toughness check against a specific environmental hazard.' }
];

export const GADGET_PACKS = [
  { id: 'tool_basic', name: 'Basic Tool Kit', cost: 1, category: 'Tools', desc: 'Standard tools for Technology or mechanical maintenance.' },
  { id: 'tool_master', name: 'Masterwork Tool Kit', cost: 2, category: 'Tools', desc: 'High-end specialized gear (+2 circumstance bonus to Tech/Investigation).' },
  { id: 'commlink', name: 'Commlink', cost: 1, category: 'Communications', desc: 'Miniaturized audio transceiver for team radio communications.' },
  { id: 'smartphone', name: 'Smartphone / Secure PDA', cost: 2, category: 'Communications', desc: 'Pocket computer with GPS, camera, audio recorder, and encrypted uplink.' },
  { id: 'satellite_link', name: 'Satellite Uplink', cost: 3, category: 'Communications', desc: 'Global high-bandwidth secure orbital relay transceiver.' },
  { id: 'night_vision', name: 'Night Vision Goggles', cost: 2, category: 'Sensors', desc: 'Optics granting Darkvision / Low-light thermal vision.' },
  { id: 'binoculars', name: 'Binoculars (Extended Vision)', cost: 1, category: 'Sensors', desc: 'Magnifying optics reducing distance penalties (Extended Vision 1).' },
  { id: 'audio_recorder', name: 'Audio Recorder / Wiretap', cost: 1, category: 'Sensors', desc: 'Miniature listening bug and voice recorder.' },
  { id: 'gas_mask', name: 'Gas Mask / Rebreather', cost: 1, category: 'Survival', desc: 'Filters airborne contaminants and provides clean breathing air.' },
  { id: 'restraints', name: 'Handcuffs / Heavy Restraints', cost: 1, category: 'Tactical', desc: 'Toughness 9 steel handcuffs (Sleight of Hand / Escape DC 20).' },
  { id: 'grapple_gun', name: 'Grappling Hook Gun', cost: 2, category: 'Tactical', desc: 'Pneumatic line-launcher granting Movement 1 (Swinging).' },
  { id: 'first_aid', name: 'First Aid Emergency Kit', cost: 1, category: 'Medical', desc: 'Sterile trauma bandages, coagulant, and suture kit for Treatment checks.' }
];

// =========================================================================
// Pure Mathematical Calculation Functions
// =========================================================================

/**
 * Calculate Weapon EP Cost
 * - Melee: Damage * 1 EP (STR-based adds 0 cost)
 * - Ranged: Damage * 2 EP
 * - Crit rank: +1 EP per rank (19-20 = +1, 18-20 = +2)
 * - Multiattack: +1 EP per damage rank
 * - Burst Area: +1 EP per damage rank
 * - Penetrating: +1 EP per rank
 * - Reach: +1 EP per rank (5 ft/rank)
 * - Subtle: +1 EP
 * - Thrown: +1 EP
 * - Laser Sight / Accurate: +1 EP per rank (+1 to hit)
 */
export function calculateWeaponCost(config) {
  const isRanged = config.rangeType === 'Ranged';
  const dmg = Math.max(1, Number(config.damageRank) || 1);
  
  // Base Damage Cost
  let baseCost = isRanged ? (dmg * 2) : (dmg * 1);
  
  // Critical Threat (Default 20 = 0 EP, 19-20 = +1, 18-20 = +2, 17-20 = +3, 16-20 = +4)
  const critCost = Math.max(0, Math.min(4, Number(config.critBonus) || 0));

  // Variable Traits based on damage (Partial Modifiers support)
  let traitsCost = 0;
  let multiRanks = 0;
  if (config.multiattack) {
    multiRanks = Math.min(dmg, Math.max(1, Number(config.multiattackRanks) || dmg));
    traitsCost += multiRanks;
  }

  let areaRanks = 0;
  if (config.burstArea) {
    areaRanks = Math.min(dmg, Math.max(1, Number(config.burstAreaRanks) || dmg));
    traitsCost += areaRanks;
  }

  // Fixed or Rank Traits
  let penRanks = 0;
  if (config.penetratingRank) {
    penRanks = Math.min(dmg, Math.max(1, Number(config.penetratingRank) || 1));
    traitsCost += penRanks;
  }

  let reachRanks = 0;
  if (config.reachRank) {
    reachRanks = Math.max(1, Number(config.reachRank) || 1);
    traitsCost += reachRanks;
  }

  if (config.subtle) traitsCost += 1;
  if (config.thrown) traitsCost += 1;
  if (config.laserSight) traitsCost += (Number(config.laserSightRanks) || 1);

  let rangeRanks = 0;
  if (config.improvedRange || config.improvedRangeRanks > 0) {
    rangeRanks = Math.max(1, Number(config.improvedRangeRanks) || 1);
    traitsCost += rangeRanks;
  }

  let ricoRanks = 0;
  if (config.ricochet || config.ricochetRanks > 0) {
    ricoRanks = Math.max(1, Number(config.ricochetRanks) || 1);
    traitsCost += ricoRanks;
  }

  let homeRanks = 0;
  if (config.homing || config.homingRanks > 0) {
    homeRanks = Math.max(1, Number(config.homingRanks) || 1);
    traitsCost += homeRanks;
  }

  const total = Math.max(1, baseCost + critCost + traitsCost);

  return {
    total,
    baseCost,
    critCost,
    traitsCost,
    breakdown: [
      { label: `Base Damage (${dmg} Rk ${isRanged ? 'x 2 EP' : 'x 1 EP'})`, cost: baseCost },
      ...(critCost > 0 ? [{ label: `Improved Critical ${critCost} (${20 - critCost}-20)`, cost: critCost }] : []),
      ...(config.multiattack ? [{ label: multiRanks === dmg ? `Multiattack (+${multiRanks} EP)` : `Multiattack (${multiRanks} of ${dmg} Ranks)`, cost: multiRanks }] : []),
      ...(config.burstArea ? [{ label: areaRanks === dmg ? `Burst Area (30 ft)` : `Burst Area (${areaRanks} of ${dmg} Ranks)`, cost: areaRanks }] : []),
      ...(penRanks > 0 ? [{ label: `Penetrating ${penRanks}`, cost: penRanks }] : []),
      ...(reachRanks > 0 ? [{ label: `Reach ${reachRanks} (${reachRanks * 5} ft)`, cost: reachRanks }] : []),
      ...(config.subtle ? [{ label: isRanged ? 'Silencer / Suppressor' : 'Subtle / Concealable', cost: 1 }] : []),
      ...(config.thrown ? [{ label: 'Thrown Weapon', cost: 1 }] : []),
      ...(config.laserSight ? [{ label: 'Laser Sight / Accurate', cost: Number(config.laserSightRanks) || 1 }] : []),
      ...(rangeRanks > 0 ? [{ label: `Improved Range ${rangeRanks}`, cost: rangeRanks }] : []),
      ...(ricoRanks > 0 ? [{ label: `Ricochet ${ricoRanks}`, cost: ricoRanks }] : []),
      ...(homeRanks > 0 ? [{ label: `Homing ${homeRanks}`, cost: homeRanks }] : [])
    ]
  };
}

/**
 * Calculate Armor EP Cost
 * - Protection: 1 EP per +1 Toughness rank
 * - Impervious: 1 EP per rank
 * - Shield (Active Defense): 1 EP per rank (adds to Dodge/Parry)
 * - Extras (Subtle, Immunities, Second Chance): 1 EP each
 */
export function calculateArmorCost(config) {
  const prot = Math.max(0, Number(config.protectionRank) || 0);
  const imperv = Math.max(0, Number(config.imperviousRank) || 0);
  const shield = Math.max(0, Number(config.shieldRank) || 0);

  let extrasCost = 0;
  if (config.subtle) extrasCost += 1;
  if (config.secondChance) extrasCost += 1;
  const immunities = Array.isArray(config.immunities) ? config.immunities : [];
  extrasCost += immunities.length;

  const total = Math.max(1, prot + imperv + shield + extrasCost);

  return {
    total,
    protCost: prot,
    impervCost: imperv,
    shieldCost: shield,
    extrasCost,
    breakdown: [
      ...(prot > 0 ? [{ label: `Protection (+${prot} Toughness)`, cost: prot }] : []),
      ...(imperv > 0 ? [{ label: `Impervious Toughness ${imperv}`, cost: imperv }] : []),
      ...(shield > 0 ? [{ label: `Active Defense Shield (+${shield} Dodge/Parry)`, cost: shield }] : []),
      ...(config.subtle ? [{ label: 'Subtle (Concealed)', cost: 1 }] : []),
      ...immunities.map(im => ({ label: `Immunity: ${im}`, cost: 1 })),
      ...(config.secondChance ? [{ label: 'Second Chance (Hazard Reroll)', cost: 1 }] : [])
    ]
  };
}

/**
 * Calculate Vehicle EP Cost
 * - Size: Base Size EP from VEHICLE_SIZES
 * - Extra STR: +1 EP per STR above base
 * - Speed: 1 EP per rank
 * - Extra Toughness: +1 EP per Toughness above base
 * - Impervious: 1 EP per rank
 * - Extra Defense: +1 EP per Defense above base
 * - Features: 1 EP each
 */
export function calculateVehicleCost(config) {
  const sizeObj = VEHICLE_SIZES.find(s => s.size === config.size) || VEHICLE_SIZES[3]; // default Medium
  const sizeCost = sizeObj.epCost;

  const currentStr = Number(config.str ?? sizeObj.strBase);
  const extraStr = Math.max(0, currentStr - sizeObj.strBase);

  const speedRank = Math.max(0, Number(config.speedRank) || 0);

  const currentTough = Number(config.toughness ?? sizeObj.toughBase);
  const extraTough = Math.max(0, currentTough - sizeObj.toughBase);

  const impervious = Math.max(0, Number(config.impervious) || 0);

  const currentDef = Number(config.defense ?? sizeObj.defMod);
  const extraDef = Math.max(0, currentDef - sizeObj.defMod);

  const features = Array.isArray(config.features) ? config.features : [];
  const featuresCost = features.length;

  const total = Math.max(1, sizeCost + extraStr + speedRank + extraTough + impervious + extraDef + featuresCost);

  return {
    total,
    sizeCost,
    extraStr,
    speedRank,
    extraTough,
    impervious,
    extraDef,
    featuresCost,
    breakdown: [
      { label: `Size (${sizeObj.size})`, cost: sizeCost },
      ...(extraStr > 0 ? [{ label: `Enhanced Strength (+${extraStr} STR)`, cost: extraStr }] : []),
      ...(speedRank > 0 ? [{ label: `Movement Speed (${config.speedType || 'Ground'} Rank ${speedRank})`, cost: speedRank }] : []),
      ...(extraTough > 0 ? [{ label: `Reinforced Toughness (+${extraTough} Tough)`, cost: extraTough }] : []),
      ...(impervious > 0 ? [{ label: `Impervious Armor Plating (${impervious} Rk)`, cost: impervious }] : []),
      ...(extraDef > 0 ? [{ label: `Handling Defense (+${extraDef} Def)`, cost: extraDef }] : []),
      ...features.map(f => ({ label: `Feature: ${f}`, cost: 1 }))
    ]
  };
}

/**
 * Calculate Headquarters (HQ) EP Cost
 * - Size: Base Size EP from HQ_SIZES
 * - Extra Toughness: +1 EP per Toughness above base
 * - Features / Amenities: 1 EP each
 */
export function calculateHQCost(config) {
  const sizeObj = HQ_SIZES.find(s => s.size === config.size) || HQ_SIZES[1]; // default Medium
  const sizeCost = sizeObj.epCost;

  const currentTough = Number(config.toughness ?? sizeObj.toughBase);
  const extraTough = Math.max(0, currentTough - sizeObj.toughBase);

  const features = Array.isArray(config.features) ? config.features : [];
  const featuresCost = features.length;

  const total = Math.max(1, sizeCost + extraTough + featuresCost);

  return {
    total,
    sizeCost,
    extraTough,
    featuresCost,
    breakdown: [
      { label: `HQ Size (${sizeObj.size})`, cost: sizeCost },
      ...(extraTough > 0 ? [{ label: `Reinforced Structure (+${extraTough} Toughness)`, cost: extraTough }] : []),
      ...features.map(f => ({ label: `Amenity: ${f}`, cost: 1 }))
    ]
  };
}

/**
 * Calculate Gadget EP Cost
 */
export function calculateGadgetCost(config) {
  if (config.presetPackId) {
    const pack = GADGET_PACKS.find(p => p.id === config.presetPackId);
    if (pack) {
      return {
        total: pack.cost,
        breakdown: [{ label: pack.name, cost: pack.cost }]
      };
    }
  }
  const customCost = Math.max(1, Number(config.customCost) || 1);
  return {
    total: customCost,
    breakdown: [{ label: 'Custom Gadget / Tech Device', cost: customCost }]
  };
}

/**
 * Unified Equipment Cost Calculation Dispatcher
 */
export function calculateTotalEquipmentCost(category, config) {
  if (category === 'Weapons') return calculateWeaponCost(config);
  if (category === 'Armor') return calculateArmorCost(config);
  if (category === 'Vehicle') return calculateVehicleCost(config);
  if (category === 'Headquarters') return calculateHQCost(config);
  return calculateGadgetCost(config);
}

/**
 * Auto-generate Official M&M 3e Publication-Quality Rules Description
 */
export function generateEquipmentDescription(category, config) {
  if (category === 'Weapons') {
    const isRanged = config.rangeType === 'Ranged';
    const dmg = config.damageRank || 1;
    const parts = [];
    if (isRanged) {
      parts.push(`Ranged Damage ${dmg}`);
    } else {
      parts.push(config.isStrengthBased ? `Strength-based Damage ${dmg}` : `Damage ${dmg}`);
    }
    const critBonus = Number(config.critBonus) || 0;
    if (critBonus > 0) parts.push(`Critical ${20 - critBonus}-20`);

    if (config.multiattack) {
      const mRk = Number(config.multiattackRanks) || dmg;
      parts.push(mRk === dmg ? 'Multiattack' : `Multiattack ${mRk}`);
    }
    if (config.burstArea) {
      const aRk = Number(config.burstAreaRanks) || dmg;
      parts.push(aRk === dmg ? 'Burst Area (30 ft)' : `Burst Area ${aRk} (30 ft)`);
    }
    if (config.penetratingRank > 0) parts.push(`Penetrating ${config.penetratingRank}`);
    if (config.reachRank > 0) parts.push(`Reach ${config.reachRank} (${config.reachRank * 5} ft)`);
    if (config.subtle) parts.push(isRanged ? 'Silenced / Suppressed' : 'Subtle (Concealable)');
    if (config.thrown) parts.push('Thrown');
    if (config.laserSight) parts.push(`Laser Sight (+${config.laserSightRanks || 1} to hit)`);
    if (config.improvedRange || config.improvedRangeRanks > 0) {
      const rRk = Number(config.improvedRangeRanks) || 1;
      parts.push(rRk > 1 ? `Improved Range ${rRk}` : 'Improved Range');
    }
    if (config.ricochet || config.ricochetRanks > 0) {
      const rcRk = Number(config.ricochetRanks) || 1;
      parts.push(`Ricochet ${rcRk}`);
    }
    if (config.homing || config.homingRanks > 0) {
      const hmRk = Number(config.homingRanks) || 1;
      parts.push(`Homing ${hmRk}`);
    }

    return parts.join(', ') + '.';
  }

  if (category === 'Armor') {
    const parts = [];
    if (config.protectionRank > 0) parts.push(`Protection ${config.protectionRank} (+${config.protectionRank} Toughness)`);
    if (config.imperviousRank > 0) parts.push(`Impervious Toughness ${config.imperviousRank}`);
    if (config.shieldRank > 0) parts.push(`Active Shield (+${config.shieldRank} Dodge & Parry)`);
    if (config.subtle) parts.push('Subtle (Concealed under clothing)');
    if (Array.isArray(config.immunities) && config.immunities.length > 0) {
      parts.push(`Immunities: ${config.immunities.join(', ')}`);
    }
    if (config.secondChance) parts.push('Second Chance vs Hazard');
    return parts.join(', ') + '.';
  }

  if (category === 'Vehicle') {
    const speedMph = SPEED_RANK_TABLE.find(s => s.rank === Number(config.speedRank))?.mph || `${config.speedRank} Ranks`;
    const parts = [
      `Size: ${config.size || 'Medium'}`,
      `Strength: ${config.str || 2}`,
      `Speed: ${config.speedRank || 5} (${config.speedType || 'Ground'}, ${speedMph})`,
      `Defense: ${config.defense ?? 1}`,
      `Toughness: ${config.toughness || 6}${config.impervious > 0 ? ` (Impervious ${config.impervious})` : ''}`
    ];
    if (Array.isArray(config.features) && config.features.length > 0) {
      parts.push(`Features: ${config.features.join(', ')}`);
    }
    return parts.join(' • ') + '.';
  }

  if (category === 'Headquarters') {
    const parts = [
      `Size: ${config.size || 'Medium'}`,
      `Toughness: ${config.toughness || 8}`
    ];
    if (Array.isArray(config.features) && config.features.length > 0) {
      parts.push(`Amenities: ${config.features.join(', ')}`);
    }
    return parts.join(' • ') + '.';
  }

  // Gadget
  if (config.presetPackId) {
    const pack = GADGET_PACKS.find(p => p.id === config.presetPackId);
    if (pack) return `${pack.name}. ${pack.desc}`;
  }
  return config.customDesc || 'Custom technological device or gadget.';
}
