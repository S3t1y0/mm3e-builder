// js/rules/conditions.js

export const BASIC_CONDITIONS = [
  { name: 'Compelled', desc: 'Directed by an outside force; limited to free actions and one standard action per turn chosen by the controller.' },
  { name: 'Controlled', desc: 'No free will; all actions dictated by the controller.' },
  { name: 'Dazed', desc: 'Limited to free actions and a single standard action (or move action) per turn.' },
  { name: 'Debilitated', desc: 'One or more abilities lowered below -5.' },
  { name: 'Defenseless', desc: 'Active defense bonuses (Dodge & Parry) are 0. Attackers gain routine attacks or auto-criticals.', affectsDefense: true },
  { name: 'Disabled', desc: '-5 circumstance penalty on checks.' },
  { name: 'Fatigued', desc: 'Hindered. Recovers after an hour of rest.' },
  { name: 'Hindered', desc: 'Moves at half normal speed (-1 speed rank).' },
  { name: 'Immobile', desc: 'Movement speed is 0; cannot move from current spot.' },
  { name: 'Impaired', desc: '-2 circumstance penalty on checks.' },
  { name: 'Stunned', desc: 'Cannot take any actions, including free actions.' },
  { name: 'Transformed', desc: 'Some or all traits altered by outside agency.' },
  { name: 'Unaware', desc: 'Completely unaware of surroundings; unable to make interaction or Perception checks.' },
  { name: 'Vulnerable', desc: 'Active defenses (Dodge & Parry) are halved (rounded up).', affectsDefense: true },
  { name: 'Weakened', desc: 'Temporarily lost power points in a trait.' }
];

export const COMBINED_CONDITIONS = [
  { name: 'Asleep', components: ['Defenseless', 'Stunned', 'Unaware'], desc: 'Defenseless, stunned, and unaware. Hearing check (DC 15) or loud noise/damage wakes character.' },
  { name: 'Blind', components: ['Hindered', 'Unaware', 'Vulnerable'], desc: 'Visual concealment from everything; hindered, visually unaware, and vulnerable.' },
  { name: 'Bound', components: ['Defenseless', 'Immobile', 'Impaired'], desc: 'Defenseless, immobile, and impaired by restraints.' },
  { name: 'Deaf', components: ['Unaware'], desc: 'Total auditory concealment; unaware of sound.' },
  { name: 'Dying', components: ['Defenseless', 'Stunned', 'Unaware'], desc: 'Incapacitated and near death; Fortitude check DC 15 required each round or suffer death.' },
  { name: 'Entranced', components: ['Stunned'], desc: 'Stunned, taking no actions other than paying attention to the entrancing effect.' },
  { name: 'Exhausted', components: ['Impaired', 'Hindered'], desc: 'Near collapse; impaired and hindered. Recovers after 1 hour rest.' },
  { name: 'Incapacitated', components: ['Defenseless', 'Stunned', 'Unaware'], desc: 'Defenseless, stunned, and unaware. Character falls prone.' },
  { name: 'Paralyzed', components: ['Defenseless', 'Immobile', 'Stunned'], desc: 'Defenseless, immobile, and physically stunned, but mentally aware.' },
  { name: 'Prone', components: ['Hindered'], desc: 'Lying on ground; -5 close attack penalty, +5 close defense bonus, -5 ranged defense penalty.' },
  { name: 'Restrained', components: ['Hindered', 'Vulnerable'], desc: 'Hindered and vulnerable due to grappling or physical hold.' },
  { name: 'Staggered', components: ['Dazed', 'Hindered'], desc: 'Dazed and hindered; limited to one standard action per turn.' },
  { name: 'Surprised', components: ['Stunned', 'Vulnerable'], desc: 'Stunned and vulnerable until character gets a turn to react.' }
];

const COMBINED_MAP = Object.fromEntries(
  COMBINED_CONDITIONS.map(c => [c.name.toLowerCase(), c.components || []])
);

// Resolves combined conditions down to their constituent basic condition names
export function resolveActiveConditionSet(activeConditions = []) {
  const resolved = new Set();
  for (const raw of activeConditions) {
    if (!raw) continue;
    const name = raw.trim();
    resolved.add(name);
    const key = name.toLowerCase();
    const sub = COMBINED_MAP[key];
    if (Array.isArray(sub)) {
      for (const component of sub) {
        resolved.add(component);
      }
    }
  }
  return resolved;
}

// Computes real-time combat modifiers for defenses, speed, and checks based on M&M 3e rules
export function calculateConditionModifiers({
  activeConditions = [],
  injuries = 0,
  defenses = {},
  speedRank = 0,
  defensiveRollBonus = 0
}) {
  const condSet = resolveActiveConditionSet(activeConditions);

  const isDefenseless = condSet.has('Defenseless');
  const isVulnerable = !isDefenseless && condSet.has('Vulnerable');
  const isDisabled = condSet.has('Disabled');
  const isImpaired = !isDisabled && condSet.has('Impaired');
  const isImmobile = condSet.has('Immobile');
  const isHindered = !isImmobile && (condSet.has('Hindered') || condSet.has('Fatigued'));
  const isStunned = condSet.has('Stunned');
  const isDazed = !isStunned && condSet.has('Dazed');
  const isProne = condSet.has('Prone');
  const isUnaware = condSet.has('Unaware');

  // Check circumstance penalty (-5 if Disabled, -2 if Impaired)
  const checkPenalty = isDisabled ? -5 : (isImpaired ? -2 : 0);

  // Dodge calculation
  const baseDodge = Number(defenses.DODGE) || 0;
  let effectiveDodge = baseDodge;
  if (isDefenseless) {
    effectiveDodge = 0;
  } else if (isVulnerable) {
    effectiveDodge = Math.ceil(baseDodge / 2);
  }

  // Parry calculation
  const baseParry = Number(defenses.PARRY) || 0;
  let effectiveParry = baseParry;
  if (isDefenseless) {
    effectiveParry = 0;
  } else if (isVulnerable) {
    effectiveParry = Math.ceil(baseParry / 2);
  }
  if (isProne && !isDefenseless) {
    effectiveParry = Math.max(0, effectiveParry - 5);
  }

  // Toughness calculation: -1 per injury bruise; defensive roll bonus is lost when vulnerable or defenseless
  const baseToughness = Number(defenses.TOUGHNESS) || 0;
  const defRollLost = (isDefenseless || isVulnerable) ? (Number(defensiveRollBonus) || 0) : 0;
  const effectiveToughness = baseToughness - (Number(injuries) || 0) - defRollLost;

  // Fortitude & Will (circumstance penalty applies to resistance checks)
  const baseFortitude = Number(defenses.FORTITUDE) || 0;
  const effectiveFortitude = baseFortitude + checkPenalty;

  const baseWill = Number(defenses.WILL) || 0;
  const effectiveWill = baseWill + checkPenalty;

  // Speed calculation
  let effectiveSpeedRank = Number(speedRank) || 0;
  let speedText = '30 ft.';
  let speedSub = 'Rank 0';

  if (isImmobile) {
    effectiveSpeedRank = -Infinity;
    speedText = '0 ft.';
    speedSub = 'Immobile';
  } else if (isHindered) {
    effectiveSpeedRank = Math.max(-1, effectiveSpeedRank - 1);
    if (effectiveSpeedRank <= -1) {
      speedText = '15 ft.';
      speedSub = 'Rank -1 (Half Speed)';
    } else {
      speedText = `Rank ${effectiveSpeedRank}`;
      speedSub = `${Math.pow(2, effectiveSpeedRank) * 30} ft. (Half Speed)`;
    }
  } else if (effectiveSpeedRank > 0) {
    speedText = `Rank ${effectiveSpeedRank}`;
    speedSub = `${Math.pow(2, effectiveSpeedRank) * 30} ft.`;
  }

  // Action economy
  const actionState = isStunned ? 'stunned' : (isDazed ? 'dazed' : 'normal');

  // Attack penalties
  const closeAttackPenalty = checkPenalty + (isProne ? -5 : 0);
  const rangedAttackPenalty = checkPenalty;

  // Active status tags
  const tags = [];
  if (isDefenseless) tags.push({ label: 'Defenses: 0', type: 'danger', reason: 'Defenseless' });
  else if (isVulnerable) tags.push({ label: 'Defenses: Halved', type: 'warning', reason: 'Vulnerable' });
  if (defRollLost > 0) tags.push({ label: `Def Roll -${defRollLost}`, type: 'warning', reason: 'Defensive Roll Lost' });
  if (injuries > 0) tags.push({ label: `Toughness -${injuries}`, type: 'danger', reason: 'Bruised' });
  if (checkPenalty < 0) tags.push({ label: `Checks ${checkPenalty}`, type: 'danger', reason: isDisabled ? 'Disabled' : 'Impaired' });
  if (isImmobile) tags.push({ label: 'Speed: 0', type: 'danger', reason: 'Immobile' });
  else if (isHindered) tags.push({ label: 'Speed: Halved', type: 'warning', reason: 'Hindered' });
  if (isStunned) tags.push({ label: 'No Actions', type: 'danger', reason: 'Stunned' });
  else if (isDazed) tags.push({ label: '1 Action / Turn', type: 'warning', reason: 'Dazed' });
  if (isProne) tags.push({ label: 'Prone (-5 Melee Atk/+5 Ranged Def/-5 Parry)', type: 'warning', reason: 'Prone' });
  if (isUnaware) tags.push({ label: 'Unaware', type: 'warning', reason: 'Unaware' });
  const isDying = condSet.has('Dying');
  if (isDying) tags.push({ label: 'Dying (Fortitude DC 15)', type: 'danger', reason: 'Hero is near death. Fortitude check DC 15 required each round or suffer death.' });

  const hasMods = (
    isDefenseless ||
    isVulnerable ||
    injuries > 0 ||
    checkPenalty !== 0 ||
    isImmobile ||
    isHindered ||
    isStunned ||
    isDazed ||
    isProne ||
    isUnaware ||
    isDying ||
    defRollLost > 0
  );

  return {
    isDefenseless,
    isVulnerable,
    isDisabled,
    isImpaired,
    isImmobile,
    isHindered,
    isStunned,
    isDazed,
    isProne,
    isUnaware,
    isDying,
    defRollLost,
    checkPenalty,
    closeAttackPenalty,
    rangedAttackPenalty,
    actionState,
    hasMods,
    tags,
    effectiveDefenses: {
      DODGE: effectiveDodge,
      PARRY: effectiveParry,
      TOUGHNESS: effectiveToughness,
      FORTITUDE: effectiveFortitude,
      WILL: effectiveWill
    },
    effectiveSpeed: {
      rank: effectiveSpeedRank,
      val: speedText,
      sub: speedSub,
      isImmobile,
      isHindered
    }
  };
}

export const DYING_DC = 15;
export const DEATH_FAILURE_LIMIT = 3;

/**
 * Evaluates a Fortitude resistance check for a dying character per M&M 3e rules.
 * Target DC is 15.
 * - Success (2+ degrees, total >= 20): Character stabilizes (removes Dying, remains Incapacitated).
 * - Success (1 degree, total 15-19): Character survives round; remains Dying with no added failure.
 * - Failure (1 degree, total 10-14): +1 degree of failure.
 * - Failure (2 degrees, total 5-9): +2 degrees of failure.
 * - Failure (3+ degrees, total <= 4): +3 degrees of failure.
 * - Cumulative 3 degrees of failure = Death.
 */
export function evaluateDyingFortitudeCheck(checkTotal, dc = DYING_DC) {
  const numDC = parseInt(dc, 10) || 15;
  const total = parseInt(checkTotal, 10) || 0;
  const diff = total - numDC;

  if (diff >= 0) {
    const degrees = Math.floor(diff / 5) + 1;
    const isStabilized = degrees >= 2;
    const degSuffix = degrees === 1 ? '1st' : degrees === 2 ? '2nd' : degrees === 3 ? '3rd' : `${degrees}th`;
    return {
      isSuccess: true,
      degrees,
      isStabilized,
      failureDegreesAdded: 0,
      diff,
      text: isStabilized
        ? `Success (${degSuffix} Degree): Character stabilizes!`
        : `Success (${degSuffix} Degree): Character survives this round, remains dying.`
    };
  } else {
    const margin = numDC - total;
    const degrees = Math.floor((margin - 1) / 5) + 1;
    const degSuffix = degrees === 1 ? '1st' : degrees === 2 ? '2nd' : degrees === 3 ? '3rd' : `${degrees}th`;
    return {
      isSuccess: false,
      degrees,
      isStabilized: false,
      failureDegreesAdded: degrees,
      margin,
      text: `Failure (${degSuffix} Degree): +${degrees} failure degree(s).`
    };
  }
}

