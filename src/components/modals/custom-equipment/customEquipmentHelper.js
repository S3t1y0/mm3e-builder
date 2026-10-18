import { VEHICLE_SIZES } from '../../../rules/resources.js';
import {
  HQ_SIZES,
  SPEED_RANK_TABLE,
  getSpeedMph,
  getWeaponAttackBonus,
  getWeaponDC
} from '../../../rules/equipmentCalculator.js';

export const STEPS = [
  { num: 1, label: 'Identity', icon: 'ri-fingerprint-line' },
  { num: 2, label: 'Base Specs', icon: 'ri-settings-4-line' },
  { num: 3, label: 'Traits & Features', icon: 'ri-equalizer-line' },
  { num: 4, label: 'Finalize & Summary', icon: 'ri-check-double-line' }
];

export const CATEGORY_CARDS = [
  { id: 'Weapons', label: 'Weapons', icon: 'ri-sword-line', desc: 'Melee blades, firearms, energy weapons & blasters' },
  { id: 'Armor', label: 'Armor & Defense', icon: 'ri-shield-line', desc: 'Ballistic vests, power suits, tactical shields & hazmat' },
  { id: 'Vehicle', label: 'Vehicles', icon: 'ri-car-line', desc: 'Motorcycles, sports cars, armored vans, jets & ships' },
  { id: 'Headquarters', label: 'Headquarters', icon: 'ri-building-line', desc: 'Secret batcaves, skyscrapers, bunkers & orbital stations' },
  { id: 'Gadget', label: 'Gadgets & Tech', icon: 'ri-smartphone-line', desc: 'Commlinks, tool kits, night vision optics & custom tools' }
];

export function createDefaultWeaponConfig() {
  return {
    rangeType: 'Close',
    damageRank: 3,
    isStrengthBased: true,
    critBonus: 0,
    multiattack: false,
    multiattackRanks: 3,
    burstArea: false,
    burstAreaRanks: 3,
    penetratingRank: 0,
    reachRank: 0,
    subtle: false,
    thrown: false,
    laserSight: false,
    laserSightRanks: 0,
    improvedRange: false,
    improvedRangeRanks: 0,
    ricochet: false,
    ricochetRanks: 0,
    homing: false,
    homingRanks: 0
  };
}

export function createDefaultArmorConfig() {
  return {
    protectionRank: 3,
    imperviousRank: 0,
    shieldRank: 0,
    subtle: false,
    immunities: [],
    secondChance: false
  };
}

export function createDefaultVehicleConfig() {
  return {
    size: 'Medium',
    str: 2,
    speedType: 'Ground',
    speedRank: 5,
    defense: 1,
    toughness: 6,
    impervious: 0,
    features: []
  };
}

export function createDefaultHqConfig() {
  return {
    size: 'Medium',
    toughness: 8,
    features: []
  };
}

export function createDefaultGadgetConfig() {
  return {
    mode: 'pack',
    presetPackId: 'commlink',
    customCost: 2,
    customDesc: ''
  };
}

export function getNamePlaceholder(cat) {
  if (cat === 'Weapons') return 'e.g. Plasma Carbine, Vibro-Blade, Dual Pistols...';
  if (cat === 'Armor') return 'e.g. Nanotech Vest, Titanium Exoskeleton, Tactical Shield...';
  if (cat === 'Vehicle') return 'e.g. Shadow Cruiser, Supersonic Jet, SWAT Tactical Van...';
  if (cat === 'Headquarters') return 'e.g. Subterranean Batcave, Downtown Penthouse, Orbital Spire...';
  return 'e.g. Grappling Hook Launcher, Secure Smartphone, Sensor Array...';
}

export function getNameSuggestions(cat) {
  if (cat === 'Weapons') return ['Plasma Carbine', 'Tactical Combat Knife', 'Heavy Sniper Rifle', 'Energy Katana', 'Submachine Gun'];
  if (cat === 'Armor') return ['Reinforced Ballistic Vest', 'Kevlar Undercover Suit', 'Riot Shield', 'Exo-Armor Mesh'];
  if (cat === 'Vehicle') return ['Stealth Interceptor', 'Armored SWAT Carrier', 'Hover Motorcycle', 'Marine Speedboat'];
  if (cat === 'Headquarters') return ['Industrial Warehouse Lair', 'Downtown High-Rise Spire', 'Fortified Bunker', 'Mountain Cavern Complex'];
  return ['Grappling Hook Gun', 'Night Vision Goggles', 'Masterwork Hack Kit', 'Tactical Flashlight'];
}

export function getCategoryIcon(cat) {
  if (cat === 'Weapons') return 'ri-sword-line';
  if (cat === 'Armor') return 'ri-shield-line';
  if (cat === 'Vehicle') return 'ri-car-line';
  if (cat === 'Headquarters') return 'ri-building-line';
  return 'ri-smartphone-line';
}

export function getVehicleBaseStr(sz) {
  return VEHICLE_SIZES.find(s => s.size === sz)?.strBase ?? 2;
}

export function getVehicleBaseTough(sz) {
  return VEHICLE_SIZES.find(s => s.size === sz)?.toughBase ?? 6;
}

export function getHQBaseTough(sz) {
  return HQ_SIZES.find(s => s.size === sz)?.toughBase ?? 8;
}

export { getSpeedMph };

export function calculateAtkBonus(heroStore, weaponConfig, itemName, customDescription) {
  try {
    const resource = {
      name: weaponConfig.name || itemName || '',
      subtype: weaponConfig.rangeType === 'Ranged' ? 'weapon_ranged' : 'weapon_melee',
      desc: weaponConfig.notes || customDescription || '',
      weapon: {
        ...weaponConfig,
        range: weaponConfig.rangeType,
        attackBonus: weaponConfig.laserSight ? Number(weaponConfig.laserSightRanks || 1) : 0
      }
    };
    return getWeaponAttackBonus(resource, heroStore);
  } catch (e) {
    console.error('Error calculating attack bonus:', e);
    return 0;
  }
}

export function calculateDC(heroStore, weaponConfig) {
  try {
    const resource = {
      weapon: {
        ...weaponConfig,
        range: weaponConfig.rangeType
      }
    };
    return getWeaponDC(resource, heroStore);
  } catch (e) {
    console.error('Error calculating DC:', e);
    return 15;
  }
}

export function buildEquipmentResource({
  cat,
  name,
  totalEP,
  itemStatus,
  customDescription,
  weaponConfig,
  armorConfig,
  vehicleConfig,
  hqConfig
}) {
  const newResource = {
    id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name,
    type: cat === 'Weapons' ? 'Gear' : (cat === 'Armor' ? 'Gear' : cat),
    subtype: cat === 'Weapons'
      ? (weaponConfig.rangeType === 'Ranged' ? 'weapon_ranged' : 'weapon_melee')
      : (cat === 'Armor' ? (armorConfig.shieldRank > 0 ? 'shield' : 'armor') : cat.toLowerCase()),
    epCost: totalEP,
    status: itemStatus,
    desc: (customDescription || '').trim()
  };

  if (cat === 'Weapons') {
    newResource.weapon = {
      isStrengthBased: weaponConfig.rangeType === 'Close' && weaponConfig.isStrengthBased,
      damageRank: weaponConfig.damageRank,
      attackBonus: weaponConfig.laserSight ? Number(weaponConfig.laserSightRanks || 1) : 0,
      range: weaponConfig.rangeType === 'Ranged' ? 'Ranged' : 'Close',
      crit: weaponConfig.critBonus > 0 ? `${20 - weaponConfig.critBonus}-20` : '20',
      resistance: 'Toughness',
      traits: [
        ...(weaponConfig.multiattack ? [weaponConfig.multiattackRanks < weaponConfig.damageRank ? `Multiattack ${weaponConfig.multiattackRanks}` : 'Multiattack'] : []),
        ...(weaponConfig.burstArea ? [weaponConfig.burstAreaRanks < weaponConfig.damageRank ? `Area Burst ${weaponConfig.burstAreaRanks}` : 'Area Burst'] : []),
        ...(weaponConfig.penetratingRank > 0 ? [`Penetrating ${weaponConfig.penetratingRank}`] : []),
        ...(weaponConfig.reachRank > 0 ? [`Reach ${weaponConfig.reachRank} (${weaponConfig.reachRank * 5} ft)`] : []),
        ...(weaponConfig.improvedRangeRanks > 0 ? [`Improved Range ${weaponConfig.improvedRangeRanks}`] : []),
        ...(weaponConfig.ricochetRanks > 0 ? [`Ricochet ${weaponConfig.ricochetRanks}`] : []),
        ...(weaponConfig.homingRanks > 0 ? [`Homing ${weaponConfig.homingRanks}`] : []),
        ...(weaponConfig.subtle ? [weaponConfig.rangeType === 'Ranged' ? 'Suppressed' : 'Subtle'] : []),
        ...(weaponConfig.thrown ? ['Thrown'] : [])
      ]
    };
  } else if (cat === 'Armor') {
    newResource.armor = {
      protectionRank: armorConfig.protectionRank,
      imperviousRank: armorConfig.imperviousRank,
      shieldRank: armorConfig.shieldRank,
      activeDefenseBonus: armorConfig.shieldRank,
      subtle: armorConfig.subtle,
      immunities: armorConfig.immunities
    };
  } else if (cat === 'Vehicle') {
    newResource.vehicle = {
      size: vehicleConfig.size,
      str: vehicleConfig.str,
      speedRank: vehicleConfig.speedRank,
      speedType: vehicleConfig.speedType,
      speedMph: getSpeedMph(vehicleConfig.speedRank),
      defense: vehicleConfig.defense,
      toughness: vehicleConfig.toughness,
      impervious: vehicleConfig.impervious,
      features: [...vehicleConfig.features]
    };
  } else if (cat === 'Headquarters') {
    newResource.hq = {
      size: hqConfig.size,
      toughness: hqConfig.toughness,
      features: [...hqConfig.features]
    };
  }

  return newResource;
}
