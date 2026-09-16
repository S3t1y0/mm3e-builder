// src/rules/attacks.js
/**
 * Mutants & Masterminds 3e Combat Attacks Generator
 * Compiles basic attacks (Unarmed) and offensive power attacks (Damage, Blast, Affliction, Weaken)
 * from standard powers, array alternate slots, and device containers.
 */

export function calculateDegrees(total, dc) {
  if (dc === null || dc === undefined || isNaN(dc)) return null;
  const numDC = parseInt(dc, 10);
  const diff = total - numDC;

  if (diff >= 0) {
    const degrees = Math.floor(diff / 5) + 1;
    const degSuffix = degrees === 1 ? '1st' : degrees === 2 ? '2nd' : degrees === 3 ? '3rd' : `${degrees}th`;
    return {
      isSuccess: true,
      degrees,
      diff,
      margin: diff,
      text: `Success (${degSuffix} Degree)`
    };
  } else {
    const margin = numDC - total;
    const degrees = Math.floor((margin - 1) / 5) + 1;
    const degSuffix = degrees === 1 ? '1st' : degrees === 2 ? '2nd' : degrees === 3 ? '3rd' : `${degrees}th`;
    return {
      isSuccess: false,
      degrees,
      diff,
      margin,
      text: `Failure (${degSuffix} Degree)`
    };
  }
}

export function compileTargetedAttacks(character, effectiveAbilities = {}, getAdvantageRanks = () => 0) {
  const attacks = [];
  const str = effectiveAbilities.STR || 0;
  const fgt = effectiveAbilities.FGT || 0;
  const dex = effectiveAbilities.DEX || 0;

  // Advantage bonuses
  const closeAttackBonus = typeof getAdvantageRanks === 'function' ? (Number(getAdvantageRanks('Close Attack')) || 0) : 0;
  const rangedAttackBonus = typeof getAdvantageRanks === 'function' ? (Number(getAdvantageRanks('Ranged Attack')) || 0) : 0;
  const throwingMasteryBonus = typeof getAdvantageRanks === 'function' ? (Number(getAdvantageRanks('Throwing Mastery')) || 0) : 0;
  const improvedCritBonus = typeof getAdvantageRanks === 'function' ? (Number(getAdvantageRanks('Improved Critical')) || 0) : 0;

  const defaultCrit = improvedCritBonus > 0 ? `${Math.max(1, 20 - improvedCritBonus)}-20` : '20';

  // 1. Basic Unarmed
  const unarmedSkill = (character.skills || []).find(
    s => s.name === 'Close Combat' && /unarmed/i.test(s.subtype || '')
  );
  const unarmedBonus = fgt + (unarmedSkill ? Number(unarmedSkill.ranks) || 0 : 0) + closeAttackBonus;

  attacks.push({
    id: 'unarmed_attack',
    type: 'basic',
    name: 'Unarmed Strike',
    source: 'Basic',
    rollBonus: unarmedBonus,
    range: 'Close',
    action: 'Standard',
    effectName: 'Damage',
    effectRank: str,
    dc: 15 + str,
    dcDescription: `DC ${15 + str} vs Toughness`,
    resistance: 'Toughness',
    crit: defaultCrit,
    isStandby: false,
    isActive: true,
    tags: ['Close Combat', 'Bludgeoning']
  });

  // Helper to process an offensive effect
  function processEffect(power, effect, opt = {}) {
    if (!effect) return null;
    const baseEffect = effect.baseEffect || effect.name || 'Damage';
    const isOffensive = ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify'].includes(baseEffect);
    if (!isOffensive) return null;

    const isRanged = baseEffect === 'Blast' || effect.range === 'Ranged';
    const isArea = (effect.extras || []).some(e => e.name === 'Area');
    const isPerception = effect.range === 'Perception';

    // Calculate attack roll bonus (FGT/DEX + Advantage bonus + Skill bonus + Accurate)
    let rollBonus = isRanged ? (dex + rangedAttackBonus) : (fgt + closeAttackBonus);
    const searchPattern = opt.slotName || power.name || effect.name;

    if (isRanged) {
      const rangedSkill = (character.skills || []).find(
        s => s.name === 'Ranged Combat' && (new RegExp(searchPattern, 'i').test(s.subtype || '') || /blast/i.test(s.subtype || ''))
      );
      if (rangedSkill) rollBonus += Number(rangedSkill.ranks) || 0;
    } else {
      const closeSkill = (character.skills || []).find(
        s => s.name === 'Close Combat' && new RegExp(searchPattern, 'i').test(s.subtype || '')
      );
      if (closeSkill) rollBonus += Number(closeSkill.ranks) || 0;
    }

    // Accurate extra bonus (+2 per rank)
    const accurateMod = (effect.extras || []).find(e => e.name === 'Accurate');
    if (accurateMod) {
      rollBonus += (Number(accurateMod.ranks) || 1) * 2;
    }

    // Throwing Mastery effect boost
    let effectRank = Number(effect.ranks) || 1;
    const isThrown = /thrown/i.test(power.name || '') || /thrown/i.test(effect.name || '') || /thrown/i.test(opt.slotName || '');
    if (isThrown && throwingMasteryBonus > 0) {
      effectRank += throwingMasteryBonus;
    }

    // DC calculation
    let dc = 10 + effectRank;
    let res = effect.resistance || 'Toughness';
    if (baseEffect === 'Damage' || baseEffect === 'Blast') {
      dc = 15 + effectRank;
      res = 'Toughness';
    }

    return {
      id: opt.id || ('atk_' + power.id + '_' + (opt.slotId || 'main')),
      type: 'power',
      name: opt.slotName || effect.name || power.name,
      powerId: power.id,
      powerName: power.name,
      source: opt.sourceTitle || power.name,
      rollBonus: (isArea || isPerception) ? null : rollBonus,
      range: effect.range || (isRanged ? 'Ranged' : 'Close'),
      action: effect.action || 'Standard',
      effectName: baseEffect,
      effectRank,
      dc,
      dcDescription: `DC ${dc} vs ${res}`,
      resistance: res,
      crit: defaultCrit,
      isArea,
      isPerception,
      isStandby: Boolean(opt.isStandby),
      isPowerDisabled: Boolean(opt.isPowerDisabled),
      isActive: !opt.isStandby && !opt.isPowerDisabled,
      slotId: opt.slotId || 'main',
      isSubPower: Boolean(opt.isSubPower),
      devSubIdx: opt.devSubIdx,
      tags: [baseEffect, effect.range || 'Close']
    };
  }

  // 2. Iterate Powers
  for (const p of (character.powers || [])) {
    const isPowerDisabled = p.active === false;

    if (p.type === 'device' && Array.isArray(p.devicePowers)) {
      p.devicePowers.forEach((sub, sIdx) => {
        const isSubDisabled = isPowerDisabled || sub.active === false;
        const hasAlts = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
        const activeSubSlot = sub.activeSlotId || 'main';

        // Primary effect of sub-power
        const isPrimaryActive = !hasAlts || activeSubSlot === 'main';
        const subAtk = processEffect(p, sub.effect, {
          id: `atk_${p.id}_sub_${sIdx}_main`,
          slotId: 'main',
          slotName: sub.name,
          sourceTitle: `${p.name} (${sub.name})`,
          isStandby: !isPrimaryActive,
          isPowerDisabled: isSubDisabled,
          isSubPower: true,
          devSubIdx: sIdx
        });
        if (subAtk) attacks.push(subAtk);

        // Alternate slots of sub-power
        if (hasAlts) {
          sub.alternateEffects.forEach((alt, aIdx) => {
            const isSlotActive = activeSubSlot === alt.id;
            const altAtk = processEffect(p, alt.effect, {
              id: `atk_${p.id}_sub_${sIdx}_slot_${aIdx}`,
              slotId: alt.id,
              slotName: alt.name,
              sourceTitle: `${p.name} [${alt.name}]`,
              isStandby: !isSlotActive,
              isPowerDisabled: isSubDisabled,
              isSubPower: true,
              devSubIdx: sIdx
            });
            if (altAtk) attacks.push(altAtk);
          });
        }
      });
    } else if (p.type === 'array' || (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0)) {
      const activeSlot = p.activeSlotId || 'main';
      const isMainActive = activeSlot === 'main';

      const mainAtk = processEffect(p, p.mainEffect, {
        id: `atk_${p.id}_main`,
        slotId: 'main',
        slotName: p.mainEffect?.name || p.name,
        sourceTitle: `${p.name} (Primary)`,
        isStandby: !isMainActive,
        isPowerDisabled
      });
      if (mainAtk) attacks.push(mainAtk);

      (p.alternateEffects || []).forEach((alt, aIdx) => {
        const isSlotActive = activeSlot === alt.id;
        const altAtk = processEffect(p, alt.effect, {
          id: `atk_${p.id}_slot_${aIdx}`,
          slotId: alt.id,
          slotName: alt.name,
          sourceTitle: `${p.name} [${alt.name}]`,
          isStandby: !isSlotActive,
          isPowerDisabled
        });
        if (altAtk) attacks.push(altAtk);
      });
    } else {
      // Standard power
      const atk = processEffect(p, p.mainEffect, {
        id: `atk_${p.id}_main`,
        slotId: 'main',
        slotName: p.name,
        sourceTitle: p.name,
        isStandby: false,
        isPowerDisabled
      });
      if (atk) attacks.push(atk);
    }
  }

  return attacks;
}
