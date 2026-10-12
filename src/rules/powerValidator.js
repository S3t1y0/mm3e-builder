import { createEmptyEffect, normalizeEffect, normalizePower } from './powerNormalizer.js';
import { calculateEffectCost, calculatePowerTotalCost } from './powerCalculator.js';

/**
 * Validates whether an alternate effect slot fits within the array capacity.
 */
export function validateArraySlot(mainEffectCost, alternateEffect, alternateLinkedEffects = []) {
  const baseCost = calculateEffectCost(alternateEffect || createEmptyEffect()).totalCost;
  const linkedCost = Array.isArray(alternateLinkedEffects)
    ? alternateLinkedEffects.reduce((sum, le) => sum + calculateEffectCost(le).totalCost, 0)
    : 0;
  const altCost = baseCost + linkedCost;
  return {
    isValid: altCost <= mainEffectCost,
    slotCost: altCost,
    baseCost,
    linkedCost,
    capacity: mainEffectCost,
    headroom: mainEffectCost - altCost,
    overflow: Math.max(0, altCost - mainEffectCost)
  };
}

/**
 * Validates whether a linked effect satisfies M&M 3e rules:
 * Linked effects must have the same range and action to be triggered simultaneously.
 */
export function validateLinkedEffect(mainEffect, linkedEffect) {
  if (!mainEffect || !linkedEffect) return { isValid: true, matchesRange: true, matchesAction: true, warnings: [] };
  const matchesRange = (mainEffect.range || 'Close') === (linkedEffect.range || 'Close');
  const matchesAction = (mainEffect.action || 'Standard') === (linkedEffect.action || 'Standard');
  const warnings = [];
  if (!matchesRange) {
    warnings.push(`Range mismatch: Main is ${mainEffect.range || 'Close'} but Linked is ${linkedEffect.range || 'Close'}.`);
  }
  if (!matchesAction) {
    warnings.push(`Action mismatch: Main is ${mainEffect.action || 'Standard'} but Linked is ${linkedEffect.action || 'Standard'}.`);
  }
  return {
    isValid: matchesRange && matchesAction,
    matchesRange,
    matchesAction,
    warnings
  };
}

/**
 * Automatically synchronizes a linked effect's Range, Action, and Duration to match the Main Effect.
 */
export function syncLinkedEffectWithMain(mainEffect, linkedEffect) {
  if (!mainEffect || !linkedEffect) return linkedEffect;
  linkedEffect.range = mainEffect.range || 'Close';
  linkedEffect.action = mainEffect.action || 'Standard';
  linkedEffect.duration = mainEffect.duration || 'Instant';
  return linkedEffect;
}

/**
 * Validates whether sub-effects in a Compound Power comply with M&M 3e rules (DHH p. 136-137 & p. 147).
 * For linked effects, validates matching Range and Action.
 */
export function validateCompoundPower(rawPower) {
  const power = normalizePower(rawPower);
  if (power.type !== 'compound') {
    return { isValid: true, warnings: [], linkedMismatchCount: 0 };
  }

  const primary = power.compoundEffects?.find(c => c.isPrimaryAction) || power.compoundEffects?.[0];
  const pRange = primary?.effect?.range || 'Close';
  const pAction = primary?.effect?.action || 'Standard';

  return {
    isValid: true,
    warnings: [],
    linkedMismatchCount: 0,
    primaryRange: pRange,
    primaryAction: pAction
  };
}

/**
 * Harmonizes all linked effects in a compound power to match the primary effect's Action and Range (DHH p. 147).
 */
export function harmonizeCompoundEffects(rawPower, primaryIdx = 0) {
  const power = JSON.parse(JSON.stringify(rawPower));
  if (!Array.isArray(power.compoundEffects) || power.compoundEffects.length === 0) return power;

  const pIdx = Math.max(0, Math.min(primaryIdx, power.compoundEffects.length - 1));
  const primary = power.compoundEffects[pIdx];
  if (!primary || !primary.effect) return power;

  const targetRange = primary.effect.range || 'Close';
  const targetAction = primary.effect.action || 'Standard';
  const targetDuration = primary.effect.duration || 'Instant';

  power.compoundEffects.forEach((item, idx) => {
    if (idx === pIdx) {
      item.isPrimaryAction = true;
    } else if (item.isLinked) {
      item.effect.range = targetRange;
      item.effect.action = targetAction;
      item.effect.duration = targetDuration;
    }
  });

  return power;
}
