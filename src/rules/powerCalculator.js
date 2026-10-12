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
 * Calculates combat metrics for offensive / targeted effects and checks Power Level (PL) compliance.
 *
 * M&M 3e PL Trade-Off Cap:
 *   Attack Bonus + Effect Rank <= 2 * Power Level
 *
 * Area or Perception attacks have NO attack check, so:
 *   Effect Rank <= Power Level
 */
export function calculatePowerCombatMetrics(rawPower, heroPL = 10, abilities = {}, skills = []) {
  const power = normalizePower(rawPower);
  const effect = power.mainEffect;

  const isMoveObjectDamaging = effect.baseEffect === 'Move Object' && effect.extras.some(e => e.name === 'Damaging');
  const isOffensive = ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify'].includes(effect.baseEffect) || isMoveObjectDamaging;
  const isArea = effect.extras.some(e => e.name === 'Area');
  const isPerception = effect.range === 'Perception';
  const isClose = effect.range === 'Close';
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
      name: power.name || effect.name,
      powerName: power.name,
      effectName: effect.name,
      baseEffect: effect.baseEffect,
      descriptors: Array.isArray(power.descriptors) ? power.descriptors : [],
      description: power.description || effect.description || '',
      isThrown,
      range: 'Close'
    };
    baseBonus += getCombatSkillBonus(skills, attackContext, false);
  } else {
    attackType = 'Ranged Attack';
    baseBonus = Number(abilities.DEX) || 0;
    const isThrown = /thrown/i.test(power.name || '') || /thrown/i.test(effect.name || '') || effect.extras.some(e => /thrown/i.test(e.name || ''));
    const attackContext = {
      name: power.name || effect.name,
      powerName: power.name,
      effectName: effect.name,
      baseEffect: effect.baseEffect,
      descriptors: Array.isArray(power.descriptors) ? power.descriptors : [],
      description: power.description || effect.description || '',
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
  } else {
    dc = 10 + effect.ranks;
    dcDescription = `DC ${dc}`;
  }
  let rangeDistance = 'Close (5 ft)';
  if (effect.range === 'Ranged') {
    const shortR = effect.ranks * 25;
    const medR = effect.ranks * 50;
    const longR = effect.ranks * 100;
    rangeDistance = `${shortR} / ${medR} / ${longR} ft`;
  } else if (effect.range === 'Perception') {
    rangeDistance = 'Visual Range (No penalty)';
  } else if (effect.range === 'Personal') {
    rangeDistance = 'Personal';
  }
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
    isOffensive,
    attackType,
    attackBonus: finalAttackBonus,
    effectRank: effect.ranks,
    dc,
    dcDescription,
    rangeDistance,
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

