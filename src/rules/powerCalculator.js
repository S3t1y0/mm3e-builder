import { CONFIGURABLE_EFFECTS, BASE_EFFECTS, EXTRAS, FLAWS } from '../data/index.js';
import { normalizeEffect, normalizePower, normalizeModifier } from './powerNormalizer.js';
import { getCombatSkillBonus } from './skills.js';

/**
 * Calculates Power Points cost for a single effect component.
 * Implements M&M 3e Fractional Cost rules when net cost per rank <= 0:
 *   Net 0  -> 1 PP per 2 ranks (divisor 2)
 *   Net -1 -> 1 PP per 3 ranks (divisor 3)
 *   Net -2 -> 1 PP per 4 ranks (divisor 4)
 *   General formula: divisor = 2 - netPerRank; cost = Math.ceil(ranks / divisor)
 */
export function calculateEffectCost(effect, activationCost = 0) {
  if (!effect) return { netPerRank: 1, basePointCost: 1, flatTotal: 0, totalCost: 1, divisor: null };

  const norm = normalizeEffect(effect);
  let perRankModifier = 0;
  let flatTotal = activationCost;
  for (const extra of norm.extras) {
    const extraRanks = extra.ranks || 1;
    if (extra.type === 'per_rank') {
      perRankModifier += extra.cost * (extra.hasRanks ? extraRanks : 1);
    } else if (extra.type === 'flat_per_rank') {
      flatTotal += extra.cost * extraRanks;
    } else if (extra.type === 'flat') {
      flatTotal += extra.cost;
    }
  }
  for (const flaw of norm.flaws) {
    const flawRanks = flaw.ranks || 1;
    if (flaw.type === 'per_rank') {
      perRankModifier += flaw.cost * (flaw.hasRanks ? flawRanks : 1); // flaw.cost is negative
    } else if (flaw.type === 'flat_per_rank') {
      flatTotal += flaw.cost * flawRanks;
    } else if (flaw.type === 'flat') {
      flatTotal += flaw.cost;
    }
  }

  const netPerRank = norm.baseCost + perRankModifier;
  let basePointCost = 0;
  let divisor = null;

  // Enhanced Trait (Skills) rule: 1 PP per 2 ranks (0.5 PP/Rank per skill)
  if (norm.baseEffect === 'Enhanced Trait' && norm.config?.traitCategory === 'skills') {
    const targets = Array.isArray(norm.config?.selectedTraits) && norm.config.selectedTraits.length > 0
      ? norm.config.selectedTraits
      : [norm.config?.traitName || 'Acrobatics'];
    const skillCount = targets.length;
    const basePerRank = 0.5 * skillCount;
    const effectivePerRank = basePerRank + perRankModifier;
    if (perRankModifier === 0) {
      basePointCost = Math.ceil(basePerRank * norm.ranks);
    } else {
      if (effectivePerRank >= 1) {
        basePointCost = Math.ceil(effectivePerRank * norm.ranks);
      } else if (effectivePerRank > 0) {
        basePointCost = Math.ceil(effectivePerRank * norm.ranks);
      } else {
        divisor = Math.max(2, Math.round(2 - effectivePerRank));
        basePointCost = Math.ceil(norm.ranks / divisor);
      }
    }
  } else if (netPerRank >= 1) {
    basePointCost = netPerRank * norm.ranks;
  } else {
    divisor = 2 - netPerRank;
    basePointCost = Math.ceil(norm.ranks / divisor);
  }

  const calculatedTotal = basePointCost + flatTotal;
  const finalTotal = Math.max(1, calculatedTotal);

  return {
    netPerRank,
    basePointCost,
    flatTotal,
    totalCost: finalTotal,
    divisor
  };
}

/**
 * Universal calculateComponentCost supporting both object and multi-arg signatures.
 */
export function calculateComponentCost(baseCostOrEffect, ranks = 1, extras = [], flaws = [], activation = 0) {
  if (typeof baseCostOrEffect === 'object' && baseCostOrEffect !== null) {
    return calculateEffectCost(baseCostOrEffect, ranks || 0).totalCost;
  }
  return calculateEffectCost({
    baseCost: Number(baseCostOrEffect) || 1,
    ranks: Number(ranks) || 1,
    extras: Array.isArray(extras) ? extras : [],
    flaws: Array.isArray(flaws) ? flaws : []
  }, activation).totalCost;
}

/**
 * Calculates Device discount according to M&M 3e rules:
 * - Removable (Cannot be taken in combat, only when incapacitated): -1 PP per 5 PP
 * - Easily Removable (Can be disarmed or grabbed in combat): -2 PP per 5 PP
 */
export function calculateDeviceDiscount(subtotalPP, deviceType = 'none') {
  if (deviceType === 'removable') {
    return Math.floor(subtotalPP / 5) * 1;
  }
  if (deviceType === 'easily_removable') {
    return Math.floor(subtotalPP / 5) * 2;
  }
  return 0;
}

/**
 * Calculates total Power Points for a full Power structure:
 * - Standard / Linked / Array: Main + Linked + Alternate Slots - Device Discount.
 * - Device Container: Sum of all Sub-Powers (Main + Linked + Alternate) - Cumulative Removable Discount.
 */
export function calculatePowerTotalCost(rawPower) {
  if (!rawPower) return 1;
  const power = normalizePower(rawPower);

  // Device Container: Sum all sub-powers before applying Removable flaw
  if (power.type === 'device' && Array.isArray(power.devicePowers) && power.devicePowers.length > 0) {
    let subPowersSum = 0;
    for (const sub of power.devicePowers) {
      const subMainCost = calculateEffectCost(sub.effect, 0).totalCost;
      let subLinkedCost = 0;
      for (const linked of (sub.linkedEffects || [])) {
        subLinkedCost += calculateEffectCost(linked, 0).totalCost;
      }
      let subAltCost = 0;
      for (const alt of (sub.alternateEffects || [])) {
        subAltCost += alt.isDynamic ? 2 : 1;
      }
      subPowersSum += subMainCost + subLinkedCost + subAltCost;
    }

    let subtotalRaw = subPowersSum;
    if (power.activationCost) {
      subtotalRaw = Math.max(1, subtotalRaw + power.activationCost);
    }

    const discount = calculateDeviceDiscount(subtotalRaw, power.deviceConfig?.type || 'removable');
    return Math.max(1, subtotalRaw - discount);
  }

  // Compound Power: Sum of all sub-effects + linked + alternate stunts + shared flat modifiers + activation flaw
  if (power.type === 'compound' && Array.isArray(power.compoundEffects) && power.compoundEffects.length > 0) {
    let compoundSum = 0;
    for (const item of power.compoundEffects) {
      const itemMainCost = calculateEffectCost(item.effect, 0).totalCost;
      let itemLinkedCost = 0;
      for (const linked of (item.linkedEffects || [])) {
        itemLinkedCost += calculateEffectCost(linked, 0).totalCost;
      }
      let itemAltCost = 0;
      for (const alt of (item.alternateEffects || [])) {
        itemAltCost += alt.isDynamic ? 2 : 1;
      }
      compoundSum += itemMainCost + itemLinkedCost + itemAltCost;
    }
    let sharedFlatTotal = Number(power.activationCost) || 0;
    if (Array.isArray(power.sharedModifiers)) {
      for (const mod of power.sharedModifiers) {
        sharedFlatTotal += Number(mod.cost) || 0;
      }
    }
    const rawSubtotal = Math.max(1, compoundSum + sharedFlatTotal);
    const discount = calculateDeviceDiscount(rawSubtotal, power.deviceConfig?.type || 'none');
    return Math.max(1, rawSubtotal - discount);
  }
  const mainCost = calculateEffectCost(power.mainEffect, 0).totalCost;
  let linkedCost = 0;
  for (const linked of power.linkedEffects) {
    linkedCost += calculateEffectCost(linked, 0).totalCost;
  }

  // Alternate effects: +1 PP each for standard, +2 PP for dynamic
  let alternateCost = 0;
  for (const alt of power.alternateEffects) {
    alternateCost += alt.isDynamic ? 2 : 1;
  }

  let subtotalRaw = mainCost + linkedCost + alternateCost;
  if (power.activationCost) {
    subtotalRaw = Math.max(1, subtotalRaw + power.activationCost);
  }
  const discount = calculateDeviceDiscount(subtotalRaw, power.deviceConfig?.type || 'none');
  const finalCost = Math.max(1, subtotalRaw - discount);

  return finalCost;
}

/**
 * Calculates a comprehensive breakdown of power points.
 */
export function calculatePowerDetailedBreakdown(rawPower) {
  if (!rawPower) return null;
  const power = normalizePower(rawPower);
  if (power.type === 'device') {
    const subPowerBreakdowns = (power.devicePowers || []).map((sub, idx) => {
      const subMainBreakdown = calculateEffectCost(sub.effect || createEmptyEffect(), 0);
      const subMainCost = subMainBreakdown.totalCost;

      const subLinkedBreakdowns = (sub.linkedEffects || []).map(l => ({
        name: l.name || l.baseEffect,
        cost: calculateEffectCost(l, 0).totalCost,
        details: calculateEffectCost(l, 0)
      }));
      const subLinkedCost = subLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

      const isSubArray = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
      const subAlternateBreakdowns = isSubArray ? sub.alternateEffects.map(a => {
        const slotEffectCost = calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost;
        const slotLinkedBreakdowns = (a.linkedEffects || []).map(le => ({
          name: le.name || le.baseEffect,
          cost: calculateEffectCost(le, 0).totalCost,
          details: calculateEffectCost(le, 0)
        }));
        const slotLinkedCost = slotLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);
        const combinedSlotValue = slotEffectCost + slotLinkedCost;

        return {
          name: a.name || a.effect?.name || 'Alternate Slot',
          isDynamic: Boolean(a.isDynamic),
          slotCost: a.isDynamic ? 2 : 1,
          effectCost: combinedSlotValue,
          linkedCost: slotLinkedCost,
          linkedBreakdowns: slotLinkedBreakdowns
        };
      }) : [];

      const subAlternateCost = subAlternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);
      const subArrayCapacity = subMainCost + subLinkedCost;
      const highestSlotCost = subAlternateBreakdowns.reduce((max, s) => Math.max(max, s.effectCost), 0);
      const isArrayOverflow = isSubArray && highestSlotCost > subArrayCapacity;
      const totalCost = subMainCost + subLinkedCost + subAlternateCost;

      return {
        id: sub.id || idx,
        name: sub.name || `Sub-Power #${idx + 1}`,
        mainCost: subMainCost,
        mainBreakdown: subMainBreakdown,
        linkedCost: subLinkedCost,
        linkedBreakdowns: subLinkedBreakdowns,
        isSubArray,
        arrayCapacity: subArrayCapacity,
        subArrayCapacity,
        highestSlotCost,
        isArrayOverflow,
        alternateCost: subAlternateCost,
        alternateBreakdowns: subAlternateBreakdowns,
        totalCost
      };
    });

    const subPowersSum = subPowerBreakdowns.reduce((sum, sp) => sum + sp.totalCost, 0);
    const rawSubtotal = Math.max(1, subPowersSum + (power.activationCost || 0));
    const deviceType = power.deviceConfig?.type || 'removable';
    const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
    const finalCost = Math.max(1, rawSubtotal - deviceDiscount);
    const subParts = subPowerBreakdowns.map(sp => {
      if (sp.isSubArray) {
        return `[${sp.name} (Array: ${sp.arrayCapacity} PP + ${sp.alternateBreakdowns.length} Slots: ${sp.alternateCost} PP): ${sp.totalCost} PP]`;
      }
      return `[${sp.name}: ${sp.totalCost} PP]`;
    });
    let formulaString = subParts.join(' + ');
    if (power.activationCost) {
      formulaString += ` - Activation (${power.activation === 'move' ? 'Move' : 'Standard'}): ${Math.abs(power.activationCost)} PP`;
    }
    formulaString += ` = ${rawSubtotal} PP`;
    if (deviceDiscount > 0) {
      formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
    }
    formulaString += ` = ${finalCost} PP`;

    return {
      isDeviceContainer: true,
      activation: power.activation || 'none',
      activationCost: power.activationCost || 0,
      subPowerBreakdowns,
      subPowersSum,
      mainCost: subPowerBreakdowns[0]?.mainCost || 0,
      mainBreakdown: subPowerBreakdowns[0]?.mainBreakdown || calculateEffectCost(power.mainEffect, 0),
      linkedCost: subPowerBreakdowns[0]?.linkedCost || 0,
      linkedBreakdowns: subPowerBreakdowns[0]?.linkedBreakdowns || [],
      alternateCost: 0,
      alternateBreakdowns: [],
      rawSubtotal,
      subtotalBeforeDiscount: rawSubtotal,
      deviceType,
      deviceDiscount,
      discount: deviceDiscount,
      finalCost,
      formulaString,
      arrayCapacity: rawSubtotal
    };
  }

  // Compound Power Architecture (Deluxe Hero's Handbook p. 136-137 & p. 147)
  if (power.type === 'compound') {
    const compoundBreakdowns = (power.compoundEffects || []).map((sub, idx) => {
      const breakdown = calculateEffectCost(sub.effect || createEmptyEffect(), 0);
      const subMainCost = breakdown.totalCost;

      const subLinkedBreakdowns = (sub.linkedEffects || []).map(l => ({
        name: l.name || l.baseEffect,
        cost: calculateEffectCost(l, 0).totalCost,
        details: calculateEffectCost(l, 0)
      }));
      const subLinkedCost = subLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

      const isSubArray = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
      const subAlternateBreakdowns = isSubArray ? sub.alternateEffects.map(a => {
        const slotEffectCost = calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost;
        const slotLinkedBreakdowns = (a.linkedEffects || []).map(le => ({
          name: le.name || le.baseEffect,
          cost: calculateEffectCost(le, 0).totalCost,
          details: calculateEffectCost(le, 0)
        }));
        const slotLinkedCost = slotLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);
        const combinedSlotValue = slotEffectCost + slotLinkedCost;

        return {
          name: a.name || a.effect?.name || 'Alternate Slot',
          isDynamic: Boolean(a.isDynamic),
          slotCost: a.isDynamic ? 2 : 1,
          effectCost: combinedSlotValue,
          linkedCost: slotLinkedCost,
          linkedBreakdowns: slotLinkedBreakdowns
        };
      }) : [];

      const subAlternateCost = subAlternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);
      const subArrayCapacity = subMainCost + subLinkedCost;
      const highestSlotCost = subAlternateBreakdowns.reduce((max, s) => Math.max(max, s.effectCost), 0);
      const isArrayOverflow = isSubArray && highestSlotCost > subArrayCapacity;
      const totalCost = subMainCost + subLinkedCost + subAlternateCost;

      return {
        id: sub.id || idx,
        name: sub.name || `Effect #${idx + 1}`,
        baseEffect: sub.effect?.baseEffect || 'Damage',
        ranks: sub.effect?.ranks || 1,
        range: sub.effect?.range || 'Close',
        action: sub.effect?.action || 'Standard',
        duration: sub.effect?.duration || 'Instant',
        isPrimaryAction: Boolean(sub.isPrimaryAction),
        isLinked: false,
        linkGroupId: sub.linkGroupId || 'link_group_1',
        mainCost: subMainCost,
        breakdown,
        linkedCost: subLinkedCost,
        linkedBreakdowns: subLinkedBreakdowns,
        isSubArray,
        arrayCapacity: subArrayCapacity,
        subArrayCapacity,
        highestSlotCost,
        isArrayOverflow,
        alternateCost: subAlternateCost,
        alternateBreakdowns: subAlternateBreakdowns,
        totalCost,
        cost: totalCost
      };
    });

    const effectsSum = compoundBreakdowns.reduce((sum, item) => sum + item.totalCost, 0);
    let sharedFlatTotal = Number(power.activationCost) || 0;
    const sharedModBreakdowns = (power.sharedModifiers || []).map(m => {
      const cost = Number(m.cost) || 0;
      sharedFlatTotal += cost;
      return {
        name: m.name || 'Shared Modifier',
        cost,
        type: m.type || 'flat'
      };
    });

    const rawSubtotal = Math.max(1, effectsSum + sharedFlatTotal);
    const deviceType = power.deviceConfig?.type || 'none';
    const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
    const finalCost = Math.max(1, rawSubtotal - deviceDiscount);

    const parts = compoundBreakdowns.map(item => `[${item.name}: ${item.totalCost} PP]`);
    let formulaString = parts.length > 0 ? parts.join(' + ') : '0 PP';
    if (power.activationCost) {
      formulaString += ` - Activation (${power.activation === 'move' ? 'Move' : 'Standard'}): ${Math.abs(power.activationCost)} PP`;
    }
    sharedModBreakdowns.forEach(sm => {
      if (sm.cost !== 0) {
        formulaString += ` ${sm.cost > 0 ? '+' : '-'} ${sm.name}: ${Math.abs(sm.cost)} PP`;
      }
    });
    if (deviceDiscount > 0) {
      formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
    }
    formulaString += ` = ${finalCost} PP`;

    return {
      isCompound: true,
      isDeviceContainer: deviceDiscount > 0,
      compoundMode: power.compoundMode || 'linked',
      compoundBreakdowns,
      effectsSum,
      sharedModBreakdowns,
      sharedFlatTotal,
      activation: power.activation || 'none',
      activationCost: power.activationCost || 0,
      mainCost: compoundBreakdowns[0]?.mainCost || 0,
      mainBreakdown: compoundBreakdowns[0]?.breakdown || calculateEffectCost(power.mainEffect, 0),
      linkedCost: compoundBreakdowns.reduce((sum, item) => sum + item.linkedCost, 0),
      alternateCost: compoundBreakdowns.reduce((sum, item) => sum + item.alternateCost, 0),
      alternateBreakdowns: [],
      rawSubtotal,
      subtotalBeforeDiscount: rawSubtotal,
      deviceType,
      deviceDiscount,
      discount: deviceDiscount,
      finalCost,
      formulaString,
      arrayCapacity: finalCost
    };
  }

  const mainBreakdown = calculateEffectCost(power.mainEffect, 0);
  const mainCost = mainBreakdown.totalCost;

  const linkedBreakdowns = power.linkedEffects.map(l => ({
    name: l.name || l.baseEffect,
    cost: calculateEffectCost(l, 0).totalCost,
    details: calculateEffectCost(l, 0)
  }));
  const linkedCost = linkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

  const alternateBreakdowns = power.alternateEffects.map(a => {
    const baseCost = calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost;
    const slotLinkedBreakdowns = (a.linkedEffects || []).map(le => ({
      name: le.name || le.baseEffect,
      cost: calculateEffectCost(le, 0).totalCost,
      details: calculateEffectCost(le, 0)
    }));
    const slotLinkedCost = slotLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);
    const combinedSlotValue = baseCost + slotLinkedCost;

    return {
      name: a.name || a.effect?.name || 'Alternate Slot',
      isDynamic: Boolean(a.isDynamic),
      slotCost: a.isDynamic ? 2 : 1,
      baseCost,
      linkedCost: slotLinkedCost,
      linkedBreakdowns: slotLinkedBreakdowns,
      combinedSlotValue,
      effectCost: combinedSlotValue
    };
  });
  const alternateCost = alternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);

  const subtotalBeforeActivation = mainCost + linkedCost + alternateCost;
  const rawSubtotal = Math.max(1, subtotalBeforeActivation + (power.activationCost || 0));
  const deviceType = power.deviceConfig?.type || 'none';
  const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
  const finalCost = Math.max(1, rawSubtotal - deviceDiscount);

  // In M&M 3e, the primary power suite budget capacity is the full value of the primary power
  // (Main Effect + its Linked Effects)
  const primarySuiteCapacity = mainCost + linkedCost;
  const netLabel = mainBreakdown.netPerRank >= 1
    ? `${mainBreakdown.netPerRank} PP/Rank × ${power.mainEffect.ranks} Ranks`
    : `1 PP / ${mainBreakdown.divisor} Ranks (${mainBreakdown.basePointCost} PP)`;

  let formulaString = `Main: [${netLabel}`;
  if (mainBreakdown.flatTotal !== 0) {
    formulaString += ` ${mainBreakdown.flatTotal > 0 ? '+' : ''}${mainBreakdown.flatTotal} PP flat`;
  }
  formulaString += ` = ${mainCost} PP]`;

  if (linkedCost > 0) {
    formulaString += ` + Linked: ${linkedCost} PP`;
  }
  if (alternateCost > 0) {
    formulaString += ` + Array (${power.alternateEffects.length} slots): ${alternateCost} PP`;
  }
  if (power.activationCost) {
    formulaString += ` - Activation (${power.activation === 'move' ? 'Move' : 'Standard'}): ${Math.abs(power.activationCost)} PP`;
  }
  if (deviceDiscount > 0) {
    formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
  }
  formulaString += ` = ${finalCost} PP`;

  return {
    isDeviceContainer: false,
    activation: power.activation || 'none',
    activationCost: power.activationCost || 0,
    mainCost,
    mainBreakdown,
    linkedCost,
    linkedBreakdowns,
    alternateCost,
    alternateBreakdowns,
    primarySuiteCapacity,
    arrayCapacity: primarySuiteCapacity,
    subtotalBeforeActivation,
    rawSubtotal,
    subtotalBeforeDiscount: rawSubtotal,
    deviceType,
    deviceDiscount,
    discount: deviceDiscount,
    finalCost,
    formulaString,
    arrayCapacity: primarySuiteCapacity // Max cost any alternate slot is allowed to have (Main + Linked)
  };
}

/**
 * Distance progression for Rank-range effects (Measurements Table)
 */
export const MEASUREMENT_DISTANCE_TABLE = {
  '-5': '6 inches',
  '-4': '1 foot',
  '-3': '3 feet',
  '-2': '6 feet',
  '-1': '15 feet',
  '0': '30 feet',
  '1': '60 feet',
  '2': '120 feet',
  '3': '250 feet',
  '4': '500 feet',
  '5': '900 feet',
  '6': '1,800 feet',
  '7': '0.5 mile',
  '8': '1 mile',
  '9': '2 miles',
  '10': '4 miles',
  '11': '8 miles',
  '12': '16 miles',
  '13': '30 miles',
  '14': '60 miles',
  '15': '120 miles',
  '16': '250 miles',
  '17': '500 miles',
  '18': '1,000 miles',
  '19': '2,000 miles',
  '20': '4,000 miles',
  '21': '8,000 miles',
  '22': '16,000 miles',
  '23': '32,000 miles',
  '24': '64,000 miles',
  '25': '125,000 miles',
  '26': '250,000 miles',
  '27': '500,000 miles',
  '28': '1 million miles',
  '29': '2 million miles',
  '30': '4 million miles'
};

export function formatMeasurementDistance(rank) {
  const r = parseInt(rank, 10);
  if (isNaN(r)) return 'Rank Range';
  if (MEASUREMENT_DISTANCE_TABLE[r]) return MEASUREMENT_DISTANCE_TABLE[r];
  if (r > 30) {
    const miles = Math.round(Math.pow(2, r - 8));
    return `${miles.toLocaleString()} miles`;
  }
  if (r < -5) return '< 6 inches';
  return `Rank ${r} Distance`;
}

/**
 * Resolves the true effective range, distance increments, and tactical modifier contributions
 * for any given effect according to Mutants & Masterminds 3e rules.
 *
 * Accounts for:
 * - Base Effect default range (Personal, Close, Ranged, Perception, Rank)
 * - Extras:
 *   - "Increased Range" (options: ranged [Close->Ranged], perception [Ranged->Perception], close_to_perception [Close->Perception])
 *   - "Perception (No Attack Check)" -> Perception
 *   - "Ranged (Remote Touch)" / "Ranged (Remote Burrowing)" -> Ranged
 *   - "Affects Others" / "Attack" on Personal effects -> Close
 *   - "Reach" (+5 ft melee range per rank)
 *   - "Extended Range" (doubles ranged increments: x2^ranks)
 *   - "Area" (notes area coverage and placement range)
 * - Flaws:
 *   - "Reduced Range" (options: one_step [-1 PP/R: Perception->Ranged or Ranged->Close], two_steps [-2 PP/R: Perception->Close])
 *   - "Close (Touch Range Only)" -> Close
 *   - "Ranged (Attack Check Required)" -> Ranged
 *   - "Diminished Range" (reduces ranged increments)
 */
export function resolveEffectRangeDetails(rawEffect) {
  if (!rawEffect) {
    return {
      baseRange: 'Close',
      effectiveRange: 'Close',
      isPersonal: false,
      isClose: true,
      isRanged: false,
      isPerception: false,
      isRankRange: false,
      reachRanks: 0,
      reachFt: 0,
      extendedRanks: 0,
      diminishedRanks: 0,
      distanceIncrements: null,
      distanceDisplay: 'Close (5 ft)',
      summaryLabel: 'Close (5 ft)',
      isModified: false,
      appliedRangeModifiers: [],
      tooltip: 'Range: Close (5 ft)'
    };
  }

  const baseRef = BASE_EFFECTS.find(b => b.name === (rawEffect.baseEffect || rawEffect.name));
  const baseRange = rawEffect.range || (baseRef ? baseRef.range : 'Close');
  const effectRanks = Math.max(1, Number(rawEffect.ranks) || 1);

  const extras = Array.isArray(rawEffect.extras) ? rawEffect.extras : [];
  const flaws = Array.isArray(rawEffect.flaws) ? rawEffect.flaws : [];

  let currentRange = baseRange;
  const appliedRangeModifiers = [];

  // Helper to extract option ID from modifier
  const getOptId = (mod) => mod.config?.optionId || mod.config?.selectedOption || mod.optionId || '';

  // 1. Check Personal-range converters: Affects Others or Attack
  const affectsOthers = extras.find(e => (e.name || '').toLowerCase() === 'affects others');
  const attackExtra = extras.find(e => (e.name || '').toLowerCase() === 'attack');
  if (currentRange === 'Personal' && (affectsOthers || attackExtra)) {
    currentRange = 'Close';
    const sourceName = affectsOthers ? 'Affects Others' : 'Attack';
    appliedRangeModifiers.push({
      name: sourceName,
      type: 'extra',
      summary: `Converted Personal to Close range (${sourceName})`
    });
  }

  // 2. Check "Increased Range" extra
  const incRangeExtra = extras.find(e => (e.name || '').toLowerCase() === 'increased range');
  if (incRangeExtra) {
    const optId = getOptId(incRangeExtra);
    if (optId === 'close_to_perception') {
      currentRange = 'Perception';
      appliedRangeModifiers.push({
        name: 'Increased Range',
        type: 'extra',
        summary: 'Close -> Perception (+2 PP/R)'
      });
    } else if (optId === 'perception') {
      currentRange = 'Perception';
      appliedRangeModifiers.push({
        name: 'Increased Range',
        type: 'extra',
        summary: 'Ranged -> Perception (+1 PP/R)'
      });
    } else if (optId === 'ranged') {
      currentRange = 'Ranged';
      appliedRangeModifiers.push({
        name: 'Increased Range',
        type: 'extra',
        summary: 'Close -> Ranged (+1 PP/R)'
      });
    } else {
      // Default fallback when option is not explicitly saved yet
      if (currentRange === 'Close') {
        currentRange = 'Ranged';
        appliedRangeModifiers.push({
          name: 'Increased Range',
          type: 'extra',
          summary: 'Close -> Ranged (+1 PP/R)'
        });
      } else if (currentRange === 'Ranged') {
        currentRange = 'Perception';
        appliedRangeModifiers.push({
          name: 'Increased Range',
          type: 'extra',
          summary: 'Ranged -> Perception (+1 PP/R)'
        });
      }
    }
  }

  // 3. Check "Perception (No Attack Check)" extra
  const percepExtra = extras.find(e => (e.name || '').toLowerCase().includes('perception (no attack check)'));
  if (percepExtra) {
    currentRange = 'Perception';
    appliedRangeModifiers.push({
      name: 'Perception (No Attack Check)',
      type: 'extra',
      summary: 'Upgraded to Perception range'
    });
  }

  // 4. Check "Ranged (Remote Touch)" / "Ranged (Remote Burrowing)" extra
  const rangedTouchExtra = extras.find(e => {
    const n = (e.name || '').toLowerCase();
    return n.includes('ranged (remote touch)') || n.includes('ranged (remote burrowing)');
  });
  if (rangedTouchExtra) {
    currentRange = 'Ranged';
    appliedRangeModifiers.push({
      name: rangedTouchExtra.name,
      type: 'extra',
      summary: 'Upgraded to Ranged'
    });
  }

  // 5. Check "Reduced Range" flaw
  const reducedRangeFlaw = flaws.find(f => (f.name || '').toLowerCase() === 'reduced range');
  if (reducedRangeFlaw) {
    const optId = getOptId(reducedRangeFlaw);
    if (optId === 'two_steps') {
      currentRange = 'Close';
      appliedRangeModifiers.push({
        name: 'Reduced Range',
        type: 'flaw',
        summary: '2 Steps: Perception -> Close (-2 PP/R)'
      });
    } else {
      // 1 step
      if (currentRange === 'Perception') {
        currentRange = 'Ranged';
        appliedRangeModifiers.push({
          name: 'Reduced Range',
          type: 'flaw',
          summary: '1 Step: Perception -> Ranged (-1 PP/R)'
        });
      } else if (currentRange === 'Ranged') {
        currentRange = 'Close';
        appliedRangeModifiers.push({
          name: 'Reduced Range',
          type: 'flaw',
          summary: '1 Step: Ranged -> Close (-1 PP/R)'
        });
      }
    }
  }

  // 6. Check "Close (Touch Range Only)" flaw
  const closeTouchFlaw = flaws.find(f => (f.name || '').toLowerCase().includes('close (touch range only)'));
  if (closeTouchFlaw) {
    currentRange = 'Close';
    appliedRangeModifiers.push({
      name: 'Close (Touch Range Only)',
      type: 'flaw',
      summary: 'Reduced to Close (Touch only)'
    });
  }

  // 7. Check "Ranged (Attack Check Required)" flaw
  const rangedAttackFlaw = flaws.find(f => (f.name || '').toLowerCase().includes('ranged (attack check required)'));
  if (rangedAttackFlaw) {
    currentRange = 'Ranged';
    appliedRangeModifiers.push({
      name: 'Ranged (Attack Check Required)',
      type: 'flaw',
      summary: 'Reduced to Ranged (Attack Check Required)'
    });
  }

  // 8. Distance Modifier Calculations
  // Check Reach extra for Close range
  let reachRanks = 0;
  const reachExtra = extras.find(e => (e.name || '').toLowerCase() === 'reach');
  if (reachExtra) {
    reachRanks = Math.max(1, Number(reachExtra.ranks) || 1);
    appliedRangeModifiers.push({
      name: 'Reach',
      type: 'extra',
      ranks: reachRanks,
      summary: `+${reachRanks * 5} ft melee reach (${reachRanks} ranks)`
    });
  }

  // Check Extended Range extra for Ranged
  let extendedRanks = 0;
  const extExtra = extras.find(e => (e.name || '').toLowerCase() === 'extended range');
  if (extExtra) {
    extendedRanks = Math.max(1, Number(extExtra.ranks) || 1);
    appliedRangeModifiers.push({
      name: 'Extended Range',
      type: 'extra',
      ranks: extendedRanks,
      summary: `Distance increments multiplied by ${Math.pow(2, extendedRanks)} (${extendedRanks} ranks)`
    });
  }

  // Check Diminished Range flaw for Ranged
  let diminishedRanks = 0;
  const dimFlaw = flaws.find(f => (f.name || '').toLowerCase() === 'diminished range');
  if (dimFlaw) {
    diminishedRanks = Math.max(1, Number(dimFlaw.ranks) || 1);
    appliedRangeModifiers.push({
      name: 'Diminished Range',
      type: 'flaw',
      ranks: diminishedRanks,
      summary: `Range increments diminished (${diminishedRanks} ranks)`
    });
  }

  // Area extra info (if present)
  const areaExtra = extras.find(e => (e.name || '').toLowerCase() === 'area');
  let areaInfo = null;
  if (areaExtra) {
    const areaShape = areaExtra.config?.shape || areaExtra.shape || 'Burst';
    areaInfo = `Area (${areaShape})`;
  }

  // Format Distance Display
  let distanceDisplay = '';
  let distanceIncrements = null;

  if (currentRange === 'Close') {
    const baseFt = 5;
    const totalFt = baseFt + (reachRanks * 5);
    if (reachRanks > 0) {
      distanceDisplay = `Close (${totalFt} ft) [+${reachRanks * 5} ft Reach]`;
    } else {
      distanceDisplay = 'Close (5 ft)';
    }
  } else if (currentRange === 'Ranged') {
    let shortBase = effectRanks * 25;
    let medBase = effectRanks * 50;
    let longBase = effectRanks * 100;

    if (diminishedRanks === 1) {
      shortBase = effectRanks * 10;
      medBase = effectRanks * 25;
      longBase = effectRanks * 50;
    } else if (diminishedRanks === 2) {
      shortBase = effectRanks * 5;
      medBase = effectRanks * 10;
      longBase = effectRanks * 25;
    } else if (diminishedRanks >= 3) {
      shortBase = effectRanks * 2;
      medBase = effectRanks * 5;
      longBase = effectRanks * 10;
    }

    if (extendedRanks > 0) {
      const mult = Math.pow(2, extendedRanks);
      shortBase *= mult;
      medBase *= mult;
      longBase *= mult;
    }

    distanceIncrements = {
      short: shortBase,
      medium: medBase,
      long: longBase
    };

    const sStr = shortBase.toLocaleString();
    const mStr = medBase.toLocaleString();
    const lStr = longBase.toLocaleString();
    distanceDisplay = `${sStr} / ${mStr} / ${lStr} ft`;

    if (extendedRanks > 0) {
      distanceDisplay += ` (Ext ×${Math.pow(2, extendedRanks)})`;
    }
    if (diminishedRanks > 0) {
      distanceDisplay += ` (Dim -${diminishedRanks})`;
    }
  } else if (currentRange === 'Perception') {
    distanceDisplay = 'Visual Range (Perception)';
  } else if (currentRange === 'Personal') {
    distanceDisplay = 'Personal (Self)';
  } else if (currentRange === 'Rank') {
    distanceDisplay = `Rank Range: ${formatMeasurementDistance(effectRanks)}`;
  } else {
    distanceDisplay = currentRange;
  }

  const isPersonal = currentRange === 'Personal';
  const isClose = currentRange === 'Close';
  const isRanged = currentRange === 'Ranged';
  const isPerception = currentRange === 'Perception';
  const isRankRange = currentRange === 'Rank';

  const isModified = currentRange !== baseRange || reachRanks > 0 || extendedRanks > 0 || diminishedRanks > 0;

  // Build Tooltip
  const tooltipLines = [
    `Base Range: ${baseRange}`,
    `Effective Range: ${currentRange}`
  ];
  if (appliedRangeModifiers.length > 0) {
    tooltipLines.push('Applied Range Modifiers:');
    appliedRangeModifiers.forEach(m => tooltipLines.push(`• ${m.name}: ${m.summary}`));
  }
  tooltipLines.push(`Distance: ${distanceDisplay}`);
  if (isPerception) {
    tooltipLines.push('Perception Attack: Requires no attack roll; hits automatically within sensory range.');
  } else if (isRanged) {
    tooltipLines.push('Ranged Attack: Short (no penalty) / Medium (-2 check) / Long (-5 check). Max range is Long.');
  } else if (isClose) {
    tooltipLines.push('Close Attack: Melee reach check using Fighting / Close Combat.');
  }

  return {
    baseRange,
    effectiveRange: currentRange,
    isPersonal,
    isClose,
    isRanged,
    isPerception,
    isRankRange,
    reachRanks,
    reachFt: reachRanks * 5,
    extendedRanks,
    diminishedRanks,
    distanceIncrements,
    distanceDisplay,
    summaryLabel: isClose ? `Close (${5 + reachRanks * 5} ft)` : isRanged ? `Ranged (${distanceDisplay})` : currentRange,
    isModified,
    appliedRangeModifiers,
    areaInfo,
    tooltip: tooltipLines.join('\n')
  };
}

/**
 * Calculates combat metrics for offensive / targeted effects and checks Power Level (PL) compliance.
 *
 * M&M 3e PL Trade-Off Cap:
 *   Attack Bonus + Effect Rank <= 2 * Power Level
 *
 * Area or Perception attacks have NO attack check, so:
 *   Effect Rank <= Power Level
 */
export function calculatePowerCombatMetrics(rawPower, heroPL = 10, abilities = {}, skills = [], targetEffect = null) {
  const power = normalizePower(rawPower);

  // Resolve effective target effect:
  // 1. Explicit targetEffect parameter if provided
  // 2. For Device container: active sub-power or first offensive/available sub-power
  // 3. For Compound power: active component or primary/offensive component
  // 4. Fallback to power.mainEffect
  let rawTarget = targetEffect;
  if (!rawTarget) {
    if (power.type === 'device' && Array.isArray(power.devicePowers) && power.devicePowers.length > 0) {
      const offensiveSub = power.devicePowers.find(sp => {
        const b = (sp.effect?.baseEffect || sp.effect?.name || '').toLowerCase();
        return ['damage', 'blast', 'affliction', 'weaken', 'nullify', 'mind reading', 'mind control'].includes(b);
      });
      rawTarget = offensiveSub?.effect || power.devicePowers[0]?.effect;
    } else if (power.type === 'compound' && Array.isArray(power.compoundEffects) && power.compoundEffects.length > 0) {
      const primaryComp = power.compoundEffects.find(c => c.isPrimaryAction) || power.compoundEffects.find(c => {
        const b = (c.effect?.baseEffect || c.effect?.name || '').toLowerCase();
        return ['damage', 'blast', 'affliction', 'weaken', 'nullify', 'mind reading', 'mind control'].includes(b);
      }) || power.compoundEffects[0];
      rawTarget = primaryComp?.effect;
    }
  }

  const effect = normalizeEffect(rawTarget || power.mainEffect);

  // Dynamic range resolution based on base effect and applied extras/flaws
  const rangeDetails = resolveEffectRangeDetails(effect);

  const isMoveObjectDamaging = effect.baseEffect === 'Move Object' && effect.extras.some(e => e.name === 'Damaging');
  const hasAttackExtra = effect.extras.some(e => (e.name || '').toLowerCase() === 'attack');
  const isOffensive = ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify', 'Mind Reading', 'Mind Control'].includes(effect.baseEffect) || isMoveObjectDamaging || hasAttackExtra;
  const isArea = effect.extras.some(e => e.name === 'Area');
  const isPerception = rangeDetails.isPerception;
  const isClose = rangeDetails.isClose;
  let accurateRanks = 0;
  const accurateExtra = effect.extras.find(e => e.name === 'Accurate');
  if (accurateExtra) accurateRanks += (accurateExtra.ranks || 1);

  let inaccurateRanks = 0;
  const inaccurateFlaw = effect.flaws.find(f => f.name === 'Inaccurate');
  if (inaccurateFlaw) inaccurateRanks += (inaccurateFlaw.ranks || 1);

  const modAttackBonus = (accurateRanks * 2) - (inaccurateRanks * 2);

  let baseBonus = 0;
  let attackType = 'Close Attack';

  if (isArea) {
    attackType = 'Area (No attack roll; Dodge DC 10+rank for half effect)';
  } else if (isPerception) {
    attackType = 'Perception (Automatic hit, no attack roll)';
  } else if (isClose) {
    attackType = 'Close Attack';
    baseBonus = Number(abilities.FGT) || 0;
    const isThrown = /thrown/i.test(power.name || '') || /thrown/i.test(effect.name || '') || effect.extras.some(e => /thrown/i.test(e.name || ''));
    const attackContext = {
      name: effect.name || power.name,
      powerName: power.name || effect.name,
      effectName: effect.name || effect.baseEffect,
      baseEffect: effect.baseEffect,
      descriptors: Array.isArray(effect.descriptors && effect.descriptors.length > 0 ? effect.descriptors : power.descriptors) ? (effect.descriptors?.length ? effect.descriptors : power.descriptors) : [],
      description: effect.description || power.description || '',
      isThrown,
      range: 'Close'
    };
    baseBonus += getCombatSkillBonus(skills, attackContext, false);
  } else {
    attackType = 'Ranged Attack';
    baseBonus = Number(abilities.DEX) || 0;
    const isThrown = /thrown/i.test(power.name || '') || /thrown/i.test(effect.name || '') || effect.extras.some(e => /thrown/i.test(e.name || ''));
    const attackContext = {
      name: effect.name || power.name,
      powerName: power.name || effect.name,
      effectName: effect.name || effect.baseEffect,
      baseEffect: effect.baseEffect,
      descriptors: Array.isArray(effect.descriptors && effect.descriptors.length > 0 ? effect.descriptors : power.descriptors) ? (effect.descriptors?.length ? effect.descriptors : power.descriptors) : [],
      description: effect.description || power.description || '',
      isThrown,
      range: 'Ranged'
    };
    baseBonus += getCombatSkillBonus(skills, attackContext, true);
  }

  const finalAttackBonus = (isArea || isPerception) ? null : (baseBonus + modAttackBonus);
  const isStrengthBased = effect.baseEffect === 'Damage' && effect.extras.some(e => e.name === 'Strength-based');
  const strBonus = isStrengthBased ? (Number(abilities.STR) || 0) : 0;
  const effectiveRank = effect.ranks + strBonus;
  let dc = 0;
  let dcDescription = '';
  if (effect.baseEffect === 'Damage' || effect.baseEffect === 'Blast' || isMoveObjectDamaging) {
    dc = 15 + effectiveRank;
    dcDescription = isStrengthBased
      ? `DC ${dc} vs Toughness (STR ${strBonus >= 0 ? '+' : ''}${strBonus} + Rk ${effect.ranks})`
      : `DC ${dc} vs Toughness`;
  } else if (effect.baseEffect === 'Affliction') {
    dc = 10 + effect.ranks;
    const resDefense = effect.config?.resistance || effect.resistance || 'Fortitude';
    dcDescription = `DC ${dc} vs ${resDefense}`;
  } else if (effect.baseEffect === 'Weaken') {
    dc = 10 + effect.ranks;
    const resDefense = effect.config?.resistance || effect.resistance || 'Fortitude';
    dcDescription = `DC ${dc} vs ${resDefense}`;
  } else if (effect.baseEffect === 'Nullify') {
    dc = 10 + effect.ranks;
    dcDescription = `DC ${dc} vs Will`;
  } else if (isOffensive || hasAttackExtra || (effect.resistance && effect.resistance.toLowerCase() !== 'none' && effect.resistance !== '-')) {
    dc = 10 + effect.ranks;
    const resDefense = effect.resistance || 'Dodge or Will';
    dcDescription = `DC ${dc} vs ${resDefense}`;
  } else {
    dc = null;
    dcDescription = 'None (Utility)';
  }

  const rangeDistance = rangeDetails.distanceDisplay;

  let isCompliant = true;
  let maxAllowed = 2 * heroPL;
  let currentTotal = 0;
  let exceededBy = 0;
  let warningMessage = '';

  if (isOffensive) {
    if (isArea || isPerception) {
      // Area / Perception attacks cannot trade off; max rank is PL
      maxAllowed = heroPL;
      currentTotal = effect.ranks;
      if (currentTotal > maxAllowed) {
        isCompliant = false;
        exceededBy = currentTotal - maxAllowed;
        warningMessage = `Rank ${effect.ranks} exceeds PL ${heroPL} limit (Max Rank ${maxAllowed} for Area/Perception attacks)`;
      }
    } else {
      // Standard attack roll: Attack Bonus + Effect Rank <= 2 * PL
      currentTotal = (finalAttackBonus || 0) + effectiveRank;
      maxAllowed = 2 * heroPL;
      if (currentTotal > maxAllowed) {
        isCompliant = false;
        exceededBy = currentTotal - maxAllowed;
        warningMessage = `Attack (+${finalAttackBonus}) + Rank (${effect.ranks}) = ${currentTotal}, exceeding PL ${heroPL} cap of ${maxAllowed} by ${exceededBy}!`;
      }
    }
  }

  return {
    effectName: effect.name || effect.baseEffect,
    baseEffect: effect.baseEffect,
    isOffensive,
    attackType,
    attackBonus: finalAttackBonus,
    effectRank: effect.ranks,
    dc,
    dcDescription,
    rangeDistance,
    effectiveRange: rangeDetails.effectiveRange,
    baseRange: rangeDetails.baseRange,
    rangeDetails,
    isArea,
    isPerception,
    plCompliance: {
      isCompliant,
      currentTotal,
      maxAllowed,
      exceededBy,
      warningMessage
    }
  };
}

