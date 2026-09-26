// src/rules/attacks.js
import { getCombatSkillBonus } from './skills.js';
import {
  BASIC_CONDITIONS,
  COMBINED_CONDITIONS,
  CONDITION_BRIEF_EFFECTS,
  getConditionBriefEffect,
  isConditionSevere
} from './conditions.js';

export function getConditionExplanation(name) {
  if (!name) return 'Combat condition';
  const clean = name.trim();
  const explanations = {
    Dazed: 'Limited to free actions and 1 standard action per turn (no move action)',
    Stunned: 'Cannot take any actions; active defense (Dodge/Parry) is 0',
    Incapacitated: 'Defenseless, stunned, and unaware; character falls prone',
    Paralyzed: 'Speed 0, defenseless, and physically stunned, but mentally aware',
    Compelled: 'Actions directed by attacker (free actions + 1 standard action of attacker choice)',
    Controlled: 'No free will; all actions dictated by attacker',
    Hindered: 'Movement speed is halved (-1 speed rank)',
    Immobile: 'Movement speed is 0; cannot move from current spot',
    Impaired: '-2 circumstance penalty on all checks',
    Disabled: '-5 circumstance penalty on all checks',
    Fatigued: 'Hindered; recovers after 1 hour of rest',
    Exhausted: 'Impaired and hindered (-2 checks, half speed); near collapse',
    Defenseless: 'Active defenses (Dodge & Parry) are 0; attacks against target are routine or auto-critical',
    Vulnerable: 'Active defenses (Dodge & Parry) are halved (rounded up)',
    Asleep: 'Defenseless, stunned, and unaware until awakened by noise or damage',
    Blind: 'Total visual concealment; hindered, visually unaware, and vulnerable',
    Deaf: 'Total auditory concealment; unaware of sound',
    Entranced: 'Fascinated; takes no actions other than paying attention to effect',
    Transformed: 'Some or all traits altered by outside agency',
    Unaware: 'Completely unaware of surroundings; cannot make interaction or Perception checks',
    Prone: 'Lying on ground (-5 close attack, +5 close defense, -5 ranged defense)',
    Bruised: '-1 cumulative penalty to subsequent Toughness checks against damage',
    Weakened: 'Temporarily lost power points/ranks in targeted trait (1 rank per point of failure)'
  };
  return explanations[clean] || getConditionBriefEffect(clean) || 'Combat tactical condition';
}

export function buildEffectBreakdown(baseEffect, effect = {}, dc = 15, res = 'Toughness', opt = {}) {
  const cfg = effect.config || {};
  const extras = Array.isArray(effect.extras) ? effect.extras : [];
  const flaws = Array.isArray(effect.flaws) ? effect.flaws : [];

  const tacticalModifiers = [];
  if (extras.some(e => e.name === 'Cumulative')) {
    tacticalModifiers.push({
      name: 'Cumulative',
      badge: 'Cumulative',
      desc: 'Failure degrees accumulate across multiple hits until target recovers'
    });
  }
  if (extras.some(e => e.name === 'Progressive')) {
    tacticalModifiers.push({
      name: 'Progressive',
      badge: 'Progressive',
      desc: 'Conditions worsen by 1 degree each round automatically if target fails check'
    });
  }
  if (extras.some(e => e.name === 'Multiattack')) {
    tacticalModifiers.push({
      name: 'Multiattack',
      badge: 'Multiattack',
      desc: 'Attack multiple targets (-2 check) or gain bonus single-target damage (+2/+5)'
    });
  }
  if (extras.some(e => e.name === 'Penetrating')) {
    tacticalModifiers.push({
      name: 'Penetrating',
      badge: 'Penetrating',
      desc: 'Overcomes target Impervious Toughness up to Penetrating rank'
    });
  }
  if (extras.some(e => e.name === 'Extra Condition')) {
    tacticalModifiers.push({
      name: 'Extra Condition',
      badge: 'Extra Condition',
      desc: 'Inflicts 2 conditions simultaneously at each degree of failure'
    });
  }
  if (flaws.some(f => f.name === 'Limited Degree')) {
    tacticalModifiers.push({
      name: 'Limited Degree',
      badge: 'Limited Degree',
      desc: 'Effect is capped at a specific maximum degree (e.g. 2nd degree)'
    });
  }
  if (flaws.some(f => f.name === 'Instant Recovery')) {
    tacticalModifiers.push({
      name: 'Instant Recovery',
      badge: 'Instant Recovery',
      desc: 'Target recovers automatically at start of next turn without a check'
    });
  }
  const areaExtra = extras.find(e => e.name === 'Area');
  if (areaExtra) {
    tacticalModifiers.push({
      name: 'Area',
      badge: 'Area',
      desc: 'Targets in area make Dodge check (DC 10+rank) for half effect'
    });
  }
  if (extras.some(e => e.name === 'Contagious')) {
    tacticalModifiers.push({
      name: 'Contagious',
      badge: 'Contagious',
      desc: 'Conditions spread to anyone who touches or makes contact with target'
    });
  }
  if (extras.some(e => e.name === 'Secondary Effect')) {
    tacticalModifiers.push({
      name: 'Secondary Effect',
      badge: 'Secondary Effect',
      desc: 'Effect strikes target again automatically on the following round'
    });
  }

  let degrees = [];
  let summary = '';
  let resistanceGuide = `Target makes ${res} resistance check vs DC ${dc}`;

  if (baseEffect === 'Affliction') {
    const parseConditions = (degVal, defVal) => {
      if (Array.isArray(degVal) && degVal.length > 0) return degVal.filter(Boolean);
      if (typeof degVal === 'string' && degVal.trim()) {
        return degVal.split(/\s*(?:&|,)\s*/).filter(Boolean);
      }
      return [defVal];
    };

    let first = parseConditions(cfg.firstConditions || cfg.firstDegree, 'Dazed');
    let second = parseConditions(cfg.secondConditions || cfg.secondDegree, 'Stunned');
    let third = parseConditions(cfg.thirdConditions || cfg.thirdDegree, 'Paralyzed');

    const contextName = (opt.slotName || effect.name || '').toLowerCase();
    if (!cfg.firstConditions && !cfg.firstDegree) {
      if (/sleep|sedative|tranquil/i.test(contextName)) {
        first = ['Fatigued']; second = ['Exhausted']; third = ['Asleep'];
      } else if (/mind|mental|puppet|hypno/i.test(contextName)) {
        first = ['Dazed']; second = ['Compelled']; third = ['Controlled'];
      } else if (/snare|entangle|web|glue/i.test(contextName)) {
        first = ['Hindered']; second = ['Immobile']; third = ['Incapacitated'];
      } else if (/poison|toxin|nausea|sick/i.test(contextName)) {
        first = ['Impaired']; second = ['Disabled']; third = ['Incapacitated'];
      }
    }

    degrees = [
      {
        degree: '1st',
        label: '1st Degree',
        margin: 'Fail by 1-5',
        conditions: first,
        desc: first.map(c => getConditionExplanation(c)).join(' • '),
        isSevere: first.some(c => isConditionSevere(c))
      },
      {
        degree: '2nd',
        label: '2nd Degree',
        margin: 'Fail by 6-10',
        conditions: second,
        desc: second.map(c => getConditionExplanation(c)).join(' • '),
        isSevere: second.some(c => isConditionSevere(c))
      },
      {
        degree: '3rd',
        label: '3rd Degree',
        margin: 'Fail by 11+',
        conditions: third,
        desc: third.map(c => getConditionExplanation(c)).join(' • '),
        isSevere: third.some(c => isConditionSevere(c))
      }
    ];

    summary = `Affliction (${first.join(' & ')} > ${second.join(' & ')} > ${third.join(' & ')})`;
    resistanceGuide = `Target makes ${res} resistance check vs DC ${dc} (DC 10 + Rank ${effect.ranks || (dc - 10)})`;
  } else if (baseEffect === 'Damage' || baseEffect === 'Blast') {
    degrees = [
      {
        degree: '1st',
        label: '1st Degree',
        margin: 'Fail by 1-5',
        conditions: ['Bruised'],
        desc: getConditionExplanation('Bruised'),
        isSevere: false
      },
      {
        degree: '2nd',
        label: '2nd Degree',
        margin: 'Fail by 6-10',
        conditions: ['Dazed', 'Bruised'],
        desc: `${getConditionExplanation('Dazed')} + Bruised penalty`,
        isSevere: false
      },
      {
        degree: '3rd',
        label: '3rd Degree',
        margin: 'Fail by 11-15',
        conditions: ['Staggered', 'Bruised'],
        desc: `${getConditionExplanation('Staggered')} + Bruised penalty`,
        isSevere: true
      },
      {
        degree: '4th',
        label: '4th Degree',
        margin: 'Fail by 16+',
        conditions: ['Incapacitated'],
        desc: getConditionExplanation('Incapacitated'),
        isSevere: true
      }
    ];
    summary = 'Damage (Bruised > Dazed > Staggered > Incapacitated)';
    resistanceGuide = `Target makes Toughness check vs DC ${dc} (DC 15 + Rank ${effect.ranks || (dc - 15)})`;
  } else if (baseEffect === 'Weaken') {
    const trait = cfg.traitName || cfg.trait || 'Targeted Trait';
    degrees = [
      {
        degree: 'All',
        label: 'Per Degree of Failure',
        margin: 'Per Point Failed',
        conditions: ['Weakened'],
        desc: `Reduces target ${trait} by 1 rank per point of failure against DC ${dc}`,
        isSevere: false
      }
    ];
    summary = `Weaken (-1 rank ${trait} per point of failure)`;
    resistanceGuide = `Target makes ${res} check vs DC ${dc}`;
  } else if (baseEffect === 'Nullify') {
    const descText = cfg.descriptor || 'Target Descriptor';
    degrees = [
      {
        degree: 'Check',
        label: 'Opposed Check',
        margin: 'Opposed Result',
        conditions: ['Nullified'],
        desc: `Counters and shuts down active ${descText} effect if attacker wins opposed check`,
        isSevere: false
      }
    ];
    summary = `Nullify: Counter & nullify active ${descText}`;
    resistanceGuide = `Attacker makes opposed check vs target Will or Power Rank`;
  } else if (baseEffect === 'Move Object') {
    summary = 'Move Object (Grab, Trip, Disarm, Throw)';
    degrees = [
      {
        degree: 'Check',
        label: 'Maneuver',
        margin: 'Opposed Check',
        conditions: ['Grabbed / Tripped / Disarmed'],
        desc: 'Performs remote combat maneuvers using Move Object rank as effective Strength',
        isSevere: false
      }
    ];
  } else {
    summary = `${baseEffect} (DC ${dc} vs ${res})`;
  }

  return {
    baseEffect,
    summary,
    resistanceGuide,
    degrees,
    tacticalModifiers
  };
}

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

  // PRIORITY 1: If character explicitly defines an `attacks` array (e.g. from Heros.json or JSON standard)
  if (Array.isArray(character.attacks) && character.attacks.length > 0) {
    character.attacks.forEach((atk, idx) => {
      let dcNum = 15;
      let res = atk.resistance || 'Toughness';
      if (typeof atk.dc === 'number') {
        dcNum = atk.dc;
      } else if (typeof atk.dc === 'string') {
        const m = atk.dc.match(/(\d+)/);
        if (m) dcNum = parseInt(m[1], 10);
        if (/will/i.test(atk.dc)) res = 'Will';
        else if (/fortitude/i.test(atk.dc)) res = 'Fortitude';
        else if (/dodge/i.test(atk.dc)) res = 'Dodge';
      }

      const rollBonus = atk.bonus !== undefined ? Number(atk.bonus) : (atk.rollBonus !== undefined ? Number(atk.rollBonus) : null);
      const isArea = Boolean(atk.isArea || rollBonus === 0 || /area/i.test(atk.name || '') || (atk.descriptors || []).some(d => /area/i.test(d)));
      const isPerception = atk.range === 'Perception';

      const effectType = atk.effectType || (res === 'Toughness' ? 'Damage' : 'Affliction');
      const effectRank = atk.ranks || (dcNum > 15 && effectType === 'Damage' ? dcNum - 15 : dcNum - 10);
      const explicitBreakdown = buildEffectBreakdown(
        effectType,
        { ranks: effectRank, extras: (atk.descriptors || []).map(d => ({ name: d })) },
        dcNum,
        res,
        { slotName: atk.name }
      );

      attacks.push({
        id: atk.id || `atk_explicit_${idx}`,
        type: 'explicit',
        name: atk.name || 'Attack',
        source: atk.source || 'Standard Attack',
        rollBonus: (isArea || isPerception) ? null : rollBonus,
        range: atk.range || (atk.targetDefense === 'Dodge' ? 'Ranged' : 'Close'),
        action: atk.action || 'Standard',
        effectName: effectType,
        effectRank,
        dc: dcNum,
        dcDescription: typeof atk.dc === 'string' ? atk.dc : `DC ${dcNum} vs ${res}`,
        resistance: res,
        crit: atk.crit || (isArea ? '-' : defaultCrit),
        isArea,
        isPerception,
        isStandby: false,
        isPowerDisabled: false,
        isActive: true,
        slotId: 'main',
        effectBreakdown: explicitBreakdown,
        summaryText: explicitBreakdown.summary,
        degrees: Array.isArray(atk.degrees) && atk.degrees.length > 0 ? atk.degrees : explicitBreakdown.degrees,
        tacticalModifiers: explicitBreakdown.tacticalModifiers,
        resistanceGuide: explicitBreakdown.resistanceGuide,
        tags: Array.isArray(atk.descriptors) ? atk.descriptors : []
      });
    });

    return attacks;
  }

  // 1. Basic Unarmed (fallback when no explicit attacks are provided)
  const unarmedContext = { name: 'Unarmed Strike', range: 'Close' };
  const unarmedSkillBonus = getCombatSkillBonus(character.skills || [], unarmedContext, false);
  const unarmedBonus = fgt + unarmedSkillBonus + closeAttackBonus;
  const unarmedBreakdown = buildEffectBreakdown('Damage', { ranks: str }, 15 + str, 'Toughness', { slotName: 'Unarmed Strike' });

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
    effectBreakdown: unarmedBreakdown,
    summaryText: unarmedBreakdown.summary,
    degrees: unarmedBreakdown.degrees,
    tacticalModifiers: unarmedBreakdown.tacticalModifiers,
    resistanceGuide: unarmedBreakdown.resistanceGuide,
    tags: ['Close Combat', 'Bludgeoning']
  });

  // Helper to process an offensive effect
  function processEffect(power, effect, opt = {}) {
    if (!effect) return null;
    const baseEffect = effect.baseEffect || effect.name || 'Damage';
    const isMoveObjectDamaging = baseEffect === 'Move Object' && (effect.extras || []).some(e => e.name === 'Damaging');
    const isOffensive = ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify', 'Move Object'].includes(baseEffect) || isMoveObjectDamaging;
    if (!isOffensive) return null;

    const isRanged = baseEffect === 'Blast' || effect.range === 'Ranged' || (isMoveObjectDamaging && effect.range !== 'Close') || (baseEffect === 'Move Object' && effect.range !== 'Close');
    const isArea = (effect.extras || []).some(e => e.name === 'Area');
    const isPerception = effect.range === 'Perception';

    const isThrown = /thrown/i.test(power.name || '') || /thrown/i.test(effect.name || '') || /thrown/i.test(opt.slotName || '') || (effect.extras || []).some(e => /thrown/i.test(e.name || ''));

    // Safe and robust skill matching (supports categories, power names, device context, and descriptors)
    const attackContext = {
      name: opt.slotName || effect.name || power.name,
      slotName: opt.slotName,
      powerName: power.name,
      effectName: effect.name,
      baseEffect: baseEffect,
      sourceTitle: opt.sourceTitle,
      descriptors: [
        ...(Array.isArray(power.descriptors) ? power.descriptors : (power.descriptors ? [power.descriptors] : [])),
        ...(Array.isArray(effect.descriptors) ? effect.descriptors : (effect.descriptors ? [effect.descriptors] : [])),
        ...(Array.isArray(opt.descriptors) ? opt.descriptors : [])
      ],
      description: effect.description || power.description || '',
      isThrown,
      range: effect.range || (isRanged ? 'Ranged' : 'Close'),
      deviceType: power.type
    };

    const skillBonus = getCombatSkillBonus(character.skills || [], attackContext, isRanged);
    let rollBonus = (isRanged ? (dex + rangedAttackBonus) : (fgt + closeAttackBonus)) + skillBonus;

    // Accurate extra bonus (+2 per rank)
    const accurateMod = (effect.extras || []).find(e => e.name === 'Accurate');
    if (accurateMod) {
      rollBonus += (Number(accurateMod.ranks) || 1) * 2;
    }

    // Strength-based modifier
    const isStrengthBased = (baseEffect === 'Damage' || isMoveObjectDamaging) && (effect.extras || []).some(e => e.name === 'Strength-based');
    const strBonus = isStrengthBased ? (Number(str) || 0) : 0;

    // Throwing Mastery effect boost
    let effectRank = (Number(effect.ranks) || 1) + strBonus;
    if (isThrown && throwingMasteryBonus > 0) {
      effectRank += throwingMasteryBonus;
    }

    // DC and resistance calculation
    let dc = 10 + effectRank;
    let res = effect.resistance || 'Fortitude';
    if (baseEffect === 'Damage' || baseEffect === 'Blast' || isMoveObjectDamaging) {
      dc = 15 + effectRank;
      res = 'Toughness';
    } else if (baseEffect === 'Affliction') {
      res = effect.resistance || effect.config?.resistance || (/snare/i.test(opt.slotName || power.name || '') ? 'Dodge' : 'Fortitude');
    } else if (baseEffect === 'Move Object') {
      res = effect.resistance || 'Dodge';
    } else if (baseEffect === 'Weaken') {
      res = effect.resistance || 'Fortitude';
    } else if (baseEffect === 'Nullify') {
      res = effect.resistance || 'Will';
    }

    const tags = [baseEffect, effect.range || (isRanged ? 'Ranged' : 'Close')];
    if (isStrengthBased) tags.push('Strength-based');
    if ((effect.extras || []).some(e => e.name === 'Multiattack')) tags.push('Multiattack');
    if ((effect.extras || []).some(e => e.name === 'Penetrating')) tags.push('Penetrating');
    if ((effect.extras || []).some(e => e.name === 'Cumulative')) tags.push('Cumulative');
    if ((effect.extras || []).some(e => e.name === 'Progressive')) tags.push('Progressive');
    if ((effect.extras || []).some(e => e.name === 'Extra Condition')) tags.push('Extra Condition');
    if ((effect.flaws || []).some(f => f.name === 'Limited Degree')) tags.push('Limited Degree');
    if ((effect.flaws || []).some(f => f.name === 'Instant Recovery')) tags.push('Instant Recovery');

    const effectBreakdown = buildEffectBreakdown(baseEffect, effect, dc, res, opt);

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
      effectName: isMoveObjectDamaging ? 'Damage (TK)' : baseEffect,
      effectRank,
      dc,
      dcDescription: isStrengthBased
        ? `DC ${dc} vs ${res} (STR ${strBonus >= 0 ? '+' : ''}${strBonus} + Rk ${effect.ranks})`
        : `DC ${dc} vs ${res}`,
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
      effectBreakdown,
      summaryText: effectBreakdown.summary,
      degrees: effectBreakdown.degrees,
      tacticalModifiers: effectBreakdown.tacticalModifiers,
      resistanceGuide: effectBreakdown.resistanceGuide,
      tags
    };
  }

  // 2. Iterate Powers
  for (const p of (character.powers || [])) {
    const isPowerDisabled = p.active === false;
    const isContainer = p.type === 'device' || p.type === 'container';

    if (isContainer && Array.isArray(p.devicePowers)) {
      p.devicePowers.forEach((sub, sIdx) => {
        const isSubDisabled = isPowerDisabled || sub.active === false;
        const subEff = sub.mainEffect || sub.effect || sub;
        const hasAlts = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
        const activeSubSlot = sub.activeSlotId || 'main';

        // Primary effect of sub-power
        const isPrimaryActive = !hasAlts || activeSubSlot === 'main';
        const subAtk = processEffect(p, subEff, {
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

        // Linked effects of sub-power primary effect
        if (Array.isArray(sub.linkedEffects)) {
          sub.linkedEffects.forEach((link, lIdx) => {
            const linkAtk = processEffect(p, link, {
              id: `atk_${p.id}_sub_${sIdx}_link_${lIdx}`,
              slotId: `link_${lIdx}`,
              slotName: link.name || `${sub.name} (Linked)`,
              sourceTitle: `${p.name} (${sub.name}) [Linked]`,
              isStandby: !isPrimaryActive,
              isPowerDisabled: isSubDisabled,
              isSubPower: true,
              devSubIdx: sIdx
            });
            if (linkAtk) attacks.push(linkAtk);
          });
        }

        // Alternate slots of sub-power
        if (hasAlts) {
          sub.alternateEffects.forEach((alt, aIdx) => {
            const isSlotActive = activeSubSlot === alt.id;
            const altEff = alt.effect || alt.mainEffect || alt;
            const altAtk = processEffect(p, altEff, {
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

            // Linked effects of sub-power alternate slot
            if (Array.isArray(alt.linkedEffects)) {
              alt.linkedEffects.forEach((link, lIdx) => {
                const linkAtk = processEffect(p, link, {
                  id: `atk_${p.id}_sub_${sIdx}_alt_${aIdx}_link_${lIdx}`,
                  slotId: alt.id,
                  slotName: link.name || `${alt.name} (Linked)`,
                  sourceTitle: `${p.name} [${alt.name}] (Linked)`,
                  isStandby: !isSlotActive,
                  isPowerDisabled: isSubDisabled,
                  isSubPower: true,
                  devSubIdx: sIdx
                });
                if (linkAtk) attacks.push(linkAtk);
              });
            }
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

      if (Array.isArray(p.linkedEffects)) {
        p.linkedEffects.forEach((link, lIdx) => {
          const linkAtk = processEffect(p, link, {
            id: `atk_${p.id}_link_${lIdx}`,
            slotId: `link_${lIdx}`,
            slotName: link.name || `${p.name} (Linked)`,
            sourceTitle: `${p.name} [Linked]`,
            isStandby: !isMainActive,
            isPowerDisabled
          });
          if (linkAtk) attacks.push(linkAtk);
        });
      }

      (p.alternateEffects || []).forEach((alt, aIdx) => {
        const isSlotActive = activeSlot === alt.id;
        const altEff = alt.effect || alt.mainEffect || alt;
        const altAtk = processEffect(p, altEff, {
          id: `atk_${p.id}_slot_${aIdx}`,
          slotId: alt.id,
          slotName: alt.name,
          sourceTitle: `${p.name} [${alt.name}]`,
          isStandby: !isSlotActive,
          isPowerDisabled
        });
        if (altAtk) attacks.push(altAtk);

        if (Array.isArray(alt.linkedEffects)) {
          alt.linkedEffects.forEach((link, lIdx) => {
            const linkAtk = processEffect(p, link, {
              id: `atk_${p.id}_slot_${aIdx}_link_${lIdx}`,
              slotId: alt.id,
              slotName: link.name || `${alt.name} (Linked)`,
              sourceTitle: `${p.name} [${alt.name}] (Linked)`,
              isStandby: !isSlotActive,
              isPowerDisabled
            });
            if (linkAtk) attacks.push(linkAtk);
          });
        }
      });
    } else if (p.type === 'compound' || (Array.isArray(p.compoundEffects) && p.compoundEffects.length > 0)) {
      // Compound Power (M&M 3e rules: Linked Combo or Power Suite)
      const activeCompound = (p.compoundEffects || []).filter(sub => sub.active !== false);

      const linkedOffensive = activeCompound.filter(sub => {
        if (!sub.isLinked && p.compoundMode !== 'linked') return false;
        const eff = sub.effect;
        const base = eff?.baseEffect || eff?.name || '';
        const isMoveDamaging = base === 'Move Object' && (eff?.extras || []).some(e => e.name === 'Damaging');
        return ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify'].includes(base) || isMoveDamaging;
      });

      if (linkedOffensive.length > 1) {
        // Multi-effect Linked Attack Combo (DHH p. 147: single attack check, multiple resistance checks)
        const primarySub = linkedOffensive.find(s => s.isPrimaryAction) || linkedOffensive[0];
        const primaryEff = primarySub.effect;
        const baseAtk = processEffect(p, primaryEff, {
          id: `atk_${p.id}_compound_linked`,
          slotId: 'compound_linked',
          slotName: p.name || 'Linked Combo',
          sourceTitle: `${p.name} [Linked Combo]`,
          isStandby: false,
          isPowerDisabled
        });

        if (baseAtk) {
          baseAtk.isCompoundLinked = true;
          baseAtk.linkedTargets = linkedOffensive.map(sub => {
            const subAtk = processEffect(p, sub.effect, {
              slotName: sub.name,
              sourceTitle: `${p.name} (${sub.name})`
            });
            return {
              id: sub.id,
              name: sub.name || sub.effect?.name,
              baseEffect: sub.effect?.baseEffect || sub.effect?.name,
              ranks: subAtk ? subAtk.effectRank : sub.effect?.ranks,
              dc: subAtk ? subAtk.dc : 15,
              resistance: subAtk ? subAtk.resistance : 'Toughness',
              dcDescription: subAtk ? subAtk.dcDescription : '',
              degrees: subAtk ? subAtk.degrees : [],
              effectBreakdown: subAtk ? subAtk.effectBreakdown : null,
              summaryText: subAtk ? subAtk.summaryText : '',
              tacticalModifiers: subAtk ? subAtk.tacticalModifiers : []
            };
          });

          baseAtk.dcDescription = baseAtk.linkedTargets.map(t => t.dcDescription).join(' & ');
          baseAtk.summaryText = baseAtk.linkedTargets.map(t => t.summaryText || t.name).join(' + ');
          attacks.push(baseAtk);
        }

        // Process any other offensive effects in the compound power that are NOT part of the linked combo
        const unlinkedOffensive = activeCompound.filter(sub => !linkedOffensive.includes(sub));
        unlinkedOffensive.forEach((sub, uIdx) => {
          const subAtk = processEffect(p, sub.effect, {
            id: `atk_${p.id}_comp_sub_${uIdx}`,
            slotId: `comp_sub_${uIdx}`,
            slotName: sub.name || sub.effect?.name,
            sourceTitle: `${p.name} (${sub.name})`,
            isStandby: false,
            isPowerDisabled
          });
          if (subAtk) attacks.push(subAtk);
        });
      } else {
        // Single offensive or suite mode: process each sub-effect independently
        activeCompound.forEach((sub, cIdx) => {
          const subAtk = processEffect(p, sub.effect, {
            id: `atk_${p.id}_comp_${cIdx}`,
            slotId: `comp_${cIdx}`,
            slotName: sub.name || sub.effect?.name,
            sourceTitle: `${p.name} (${sub.name})`,
            isStandby: false,
            isPowerDisabled
          });
          if (subAtk) attacks.push(subAtk);

          if (Array.isArray(sub.linkedEffects)) {
            sub.linkedEffects.forEach((link, lIdx) => {
              const linkAtk = processEffect(p, link, {
                id: `atk_${p.id}_comp_${cIdx}_link_${lIdx}`,
                slotId: `comp_${cIdx}`,
                slotName: link.name || `${sub.name} (Linked)`,
                sourceTitle: `${p.name} (${sub.name}) [Linked]`,
                isStandby: false,
                isPowerDisabled
              });
              if (linkAtk) attacks.push(linkAtk);
            });
          }

          if (Array.isArray(sub.alternateEffects)) {
            sub.alternateEffects.forEach((alt, aIdx) => {
              const altEff = alt.effect || alt.mainEffect || alt;
              const altAtk = processEffect(p, altEff, {
                id: `atk_${p.id}_comp_${cIdx}_slot_${aIdx}`,
                slotId: alt.id || `comp_${cIdx}_slot_${aIdx}`,
                slotName: alt.name,
                sourceTitle: `${p.name} (${sub.name}) [${alt.name}]`,
                isStandby: false,
                isPowerDisabled
              });
              if (altAtk) attacks.push(altAtk);

              if (Array.isArray(alt.linkedEffects)) {
                alt.linkedEffects.forEach((csLnk, cslIdx) => {
                  const csLnkAtk = processEffect(p, csLnk, {
                    id: `atk_${p.id}_comp_${cIdx}_slot_${aIdx}_link_${cslIdx}`,
                    slotId: alt.id || `comp_${cIdx}_slot_${aIdx}`,
                    slotName: csLnk.name || `${alt.name} (Linked)`,
                    sourceTitle: `${p.name} (${sub.name}) [${alt.name}] (Linked)`,
                    isStandby: false,
                    isPowerDisabled
                  });
                  if (csLnkAtk) attacks.push(csLnkAtk);
                });
              }
            });
          }
        });
      }
    } else if (!isContainer) {
      // Standard power (skip outer container shell if it has no direct mainEffect)
      const atk = processEffect(p, p.mainEffect, {
        id: `atk_${p.id}_main`,
        slotId: 'main',
        slotName: p.name,
        sourceTitle: p.name,
        isStandby: false,
        isPowerDisabled
      });
      if (atk) attacks.push(atk);

      if (Array.isArray(p.linkedEffects)) {
        p.linkedEffects.forEach((link, lIdx) => {
          const linkAtk = processEffect(p, link, {
            id: `atk_${p.id}_link_${lIdx}`,
            slotId: `link_${lIdx}`,
            slotName: link.name || `${p.name} (Linked)`,
            sourceTitle: `${p.name} [Linked]`,
            isStandby: false,
            isPowerDisabled
          });
          if (linkAtk) attacks.push(linkAtk);
        });
      }
    }
  }

  // 3. Iterate Equipped Weapons from Resources / Equipment
  const resources = character.resources || [];
  for (const r of resources) {
    if ((r.status || 'equipped') !== 'equipped') continue;
    const isWpn = r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor') && !r.subtype?.includes('shield'));
    if (!isWpn) continue;

    const w = r.weapon || {};
    const isRanged = w.range === 'Ranged' || (/Ranged/i.test(r.desc || '') && !/Close/i.test(w.range || ''));
    const isArea = (w.traits || []).some(t => /area/i.test(t)) || /Area/i.test(r.desc || '');
    const isAffliction = (w.traits || []).some(t => /affliction/i.test(t)) || /Affliction/i.test(r.desc || '');

    // Safe and comprehensive skill matching for equipped weapons
    const isThrown = /thrown/i.test(r.subtype || '') || /thrown/i.test(r.desc || '') || (w.traits || []).some(t => /thrown/i.test(t));
    const attackContext = {
      name: r.name,
      weaponType: r.subtype,
      description: r.desc,
      traits: w.traits || [],
      descriptors: w.traits || [],
      isThrown,
      range: isRanged ? 'Ranged' : 'Close'
    };

    const skillBonus = getCombatSkillBonus(character.skills || [], attackContext, isRanged);

    const rollBonus = isRanged
      ? (dex + rangedAttackBonus + skillBonus + (w.attackBonus || 0))
      : (fgt + closeAttackBonus + skillBonus + (w.attackBonus || 0));

    // DC and damage calculation
    const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
    let dmgRank = w.damageRank;
    if (dmgRank === undefined) {
      const m = (r.desc || '').match(/Damage\s+(\d+)/i) || (r.desc || '').match(/Affliction\s+(\d+)/i);
      dmgRank = m ? parseInt(m[1], 10) : 1;
    }
    const effectiveDmg = isStrengthBased ? (str + dmgRank) : dmgRank;
    const dc = (isAffliction ? 10 : 15) + effectiveDmg;
    const resistance = w.resistance || (isAffliction ? 'Fortitude' : 'Toughness');

    // Weapon Critical
    let weaponCrit = defaultCrit;
    if (w.crit) {
      weaponCrit = w.crit;
    } else {
      const mCrit = (r.desc || '').match(/Critical\s+([0-9-]+)/i);
      if (mCrit) weaponCrit = mCrit[1];
    }

    const weaponBreakdown = buildEffectBreakdown(
      isAffliction ? 'Affliction' : 'Damage',
      { ranks: effectiveDmg, extras: (w.traits || []).map(t => ({ name: t })) },
      dc,
      resistance,
      { slotName: r.name }
    );

    attacks.push({
      id: `atk_res_${r.id || r.name}`,
      type: 'equipment',
      name: r.name,
      source: 'Equipment',
      rollBonus: isArea ? null : rollBonus,
      range: isRanged ? 'Ranged' : 'Close',
      action: 'Standard',
      effectName: isAffliction ? 'Affliction' : 'Damage',
      effectRank: effectiveDmg,
      dc,
      dcDescription: `DC ${dc} vs ${resistance}`,
      resistance,
      crit: weaponCrit,
      isArea,
      isPerception: false,
      isStandby: false,
      isActive: true,
      effectBreakdown: weaponBreakdown,
      summaryText: weaponBreakdown.summary,
      degrees: weaponBreakdown.degrees,
      tacticalModifiers: weaponBreakdown.tacticalModifiers,
      resistanceGuide: weaponBreakdown.resistanceGuide,
      tags: [isRanged ? 'Ranged Weapon' : 'Melee Weapon', ...(w.traits || [])]
    });
  }

  return attacks;
}
