// js/rules/powers.js

export const BASE_EFFECTS = [
  { name: 'Affliction', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'Impose harmful conditions on target (Dazed, Stunned, Incapacitated).' },
  { name: 'Blast', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'Ranged damaging attack (Damage with Increased Range).' },
  { name: 'Burrowing', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Tunnel through earth and solid obstacles.' },
  { name: 'Communication', cost: 4, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'Communicate over long distances using mental, radio, or sensory means.' },
  { name: 'Comprehend', cost: 2, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Understand languages, animals, spirits, machines, or objects (flat 2 PP/rank).' },
  { name: 'Concealment', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Total or partial concealment from specific visual or auditory senses.' },
  { name: 'Create', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Sustained', desc: 'Form solid objects out of thin air or energy.' },
  { name: 'Damage', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'Inflict direct physical, energy, or mental harm.' },
  { name: 'Deflect', cost: 1, range: 'Ranged', action: 'Standard', duration: 'Instant', desc: 'Actively parry or deflect incoming attacks directed at allies.' },
  { name: 'Elongation', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Stretch limbs and body across distances.' },
  { name: 'Enhanced Trait', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Boost existing Ability, Defense, Skill, or Advantage.' },
  { name: 'Flight', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Fly through the air with speed determined by rank.' },
  { name: 'Healing', cost: 2, range: 'Close', action: 'Standard', duration: 'Instant', desc: 'Remove damage conditions and stabilize dying allies.' },
  { name: 'Illusion', cost: 1, range: 'Perception', action: 'Standard', duration: 'Sustained', desc: 'Project false images or sounds that deceive the senses.' },
  { name: 'Immunity', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Immune to specific hazards, effects, or environmental extremes (1 to 30 ranks).' },
  { name: 'Insubstantial', cost: 5, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Transform into fluid, gaseous, energy, or incorporeal form (5 PP/rank).' },
  { name: 'Leaping', cost: 1, range: 'Personal', action: 'Free', duration: 'Instant', desc: 'Jump extraordinary distances based on rank.' },
  { name: 'Mind Reading', cost: 2, range: 'Perception', action: 'Standard', duration: 'Sustained', resistance: 'Will', desc: 'Probe targets’ minds to detect surface thoughts or deep memories.' },
  { name: 'Morph', cost: 5, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Change physical appearance into other people or forms (5 PP/rank).' },
  { name: 'Move Object', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Sustained', desc: 'Manipulate and lift distant objects with telekinetic or magnetic force.' },
  { name: 'Nullify', cost: 1, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Will', desc: 'Counter and shut down specific powers or descriptors.' },
  { name: 'Protection', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Armored skin, force field, or magical shielding boosting Toughness.' },
  { name: 'Quickness', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Perform routine physical or mental tasks at superhuman speeds.' },
  { name: 'Regeneration', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Rapidly heal damage conditions each round.' },
  { name: 'Remote Sensing', cost: 1, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'Perceive distant areas through clairvoyance, clairaudience, or scrying.' },
  { name: 'Senses', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Darkvision, infravision, acute scent, radar, or tremorsense (1 PP/rank).' },
  { name: 'Speed', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Superhuman ground movement speed.' },
  { name: 'Swimming', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'Aquatic locomotion and maneuverability.' },
  { name: 'Teleport', cost: 2, range: 'Personal', action: 'Move', duration: 'Instant', desc: 'Instantaneous transit across space without crossing intervening distance.' },
  { name: 'Weaken', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'Drain target\'s ranks in an Ability, Defense, or Power.' }
];

export const EXTRAS = [
  { name: 'Accurate', type: 'flat_per_rank', cost: 1, desc: '+2 attack bonus with this power per rank.' },
  { name: 'Affects Corporeal', type: 'flat_per_rank', cost: 1, desc: 'Insubstantial power can affect corporeal physical targets.' },
  { name: 'Affects Insubstantial', type: 'flat_per_rank', cost: 1, desc: 'Power affects incorporeal and insubstantial targets.' },
  { name: 'Affects Objects', type: 'per_rank', cost: 0, desc: 'Effect can also affect inanimate non-living objects.' },
  { name: 'Affects Others', type: 'per_rank', cost: 1, desc: 'Grant personal effect to another character or ally.' },
  { name: 'Alternate Resistance', type: 'per_rank', cost: 0, desc: 'Change defense resistance check (e.g., from Toughness to Will or Fortitude).' },
  { name: 'Area', type: 'per_rank', cost: 1, desc: 'Effect affects all targets within a burst, cone, line, or cylinder.' },
  { name: 'Attack', type: 'per_rank', cost: 0, desc: 'Turn a personal or beneficial effect into a harmful offensive attack.' },
  { name: 'Contagious', type: 'per_rank', cost: 1, desc: 'Effect spreads to anyone making contact with target.' },
  { name: 'Dimensional', type: 'flat', cost: 1, desc: 'Power can affect targets across alternate dimensions.' },
  { name: 'Extended Range', type: 'flat_per_rank', cost: 1, desc: 'Double the normal range increments of the effect.' },
  { name: 'Feature', type: 'flat_per_rank', cost: 1, desc: 'Minor beneficial quirk, thematic flair, or cosmetic utility.' },
  { name: 'Homing', type: 'flat_per_rank', cost: 1, desc: 'Missed attack gets an additional attack check on the next turn.' },
  { name: 'Impervious', type: 'per_rank', cost: 1, desc: 'Automatically ignore damage below half this rank.' },
  { name: 'Increased Duration', type: 'per_rank', cost: 1, desc: 'Shift duration up one step (Instant -> Concentration -> Sustained -> Continuous).' },
  { name: 'Increased Mass', type: 'flat_per_rank', cost: 1, desc: 'Increase mass that can be carried or affected.' },
  { name: 'Increased Range', type: 'per_rank', cost: 1, desc: 'Shift range up one step (Close -> Ranged -> Perception).' },
  { name: 'Incurable', type: 'flat', cost: 1, desc: 'Effects cannot be treated or healed without the Counter effect.' },
  { name: 'Indirect', type: 'flat_per_rank', cost: 1, desc: 'Attack originates from an angle, ceiling, or behind cover.' },
  { name: 'Innate', type: 'flat', cost: 1, desc: 'Power is biological or inborn; cannot be nullified.' },
  { name: 'Insidious', type: 'flat', cost: 1, desc: 'Target is unaware of the effect taking place.' },
  { name: 'Linked', type: 'flat', cost: 0, desc: 'Combined with another effect to activate simultaneously.' },
  { name: 'Multiattack', type: 'per_rank', cost: 1, desc: 'Rapid-fire multiple targets or concentrate fire on one for bonus damage.' },
  { name: 'Penetrating', type: 'flat_per_rank', cost: 1, desc: 'Overcomes Impervious defenses equal to this rank.' },
  { name: 'Precise', type: 'flat', cost: 1, desc: 'Fine manipulation and surgical control over the effect.' },
  { name: 'Reach', type: 'flat_per_rank', cost: 1, desc: 'Extend close combat attack range by 5 feet per rank.' },
  { name: 'Reaction', type: 'per_rank', cost: 3, desc: 'Triggers automatically in response to a defined circumstance without an action.' },
  { name: 'Reversible', type: 'flat', cost: 1, desc: 'Can immediately end or undo the effect as a free action.' },
  { name: 'Ricochet', type: 'flat_per_rank', cost: 1, desc: 'Bounce attacks around corners and obstacles.' },
  { name: 'Secondary Effect', type: 'per_rank', cost: 1, desc: 'Effect strikes target again on the subsequent turn.' },
  { name: 'Selective', type: 'per_rank', cost: 1, desc: 'Choose exactly which targets are affected in an area.' },
  { name: 'Sleep', type: 'per_rank', cost: 0, desc: 'Causes targets to fall asleep rather than standard conditions.' },
  { name: 'Split', type: 'flat_per_rank', cost: 1, desc: 'Divide ranks among multiple distinct targets.' },
  { name: 'Subtle', type: 'flat', cost: 1, desc: 'Effect is hard (DC 20 Perception) or impossible to detect.' },
  { name: 'Sustained', type: 'per_rank', cost: 0, desc: 'Maintain an instant or continuous power with free actions.' },
  { name: 'Triggered', type: 'flat_per_rank', cost: 1, desc: 'Set a power like a trap or delay to activate upon trigger.' },
  { name: 'Variable Descriptor', type: 'flat', cost: 1, desc: 'Change power descriptors freely (e.g. fire to ice to electricity).' }
];

export const FLAWS = [
  { name: 'Activation', type: 'flat', cost: -1, desc: 'Requires a move (-1 PP) or standard (-2 PP) action to activate before use.' },
  { name: 'Check Required', type: 'flat_per_rank', cost: -1, desc: 'Must pass a skill check DC 10 + rank to use the power.' },
  { name: 'Concentration', type: 'per_rank', cost: -1, desc: 'Requires a standard action each round to maintain.' },
  { name: 'Diminished Range', type: 'flat_per_rank', cost: -1, desc: 'Reduces normal range increments.' },
  { name: 'Distracting', type: 'per_rank', cost: -1, desc: 'Vulnerable while using this power.' },
  { name: 'Fades', type: 'per_rank', cost: -1, desc: 'Loses 1 rank each time it is used until recovered.' },
  { name: 'Feedback', type: 'per_rank', cost: -1, desc: 'Attacks on manifestations or projected forms harm the character.' },
  { name: 'Grab-Based', type: 'per_rank', cost: -1, desc: 'Requires successful grab before effect can be applied.' },
  { name: 'Inaccurate', type: 'flat_per_rank', cost: -1, desc: '-2 attack check penalty with this power per rank.' },
  { name: 'Limited', type: 'per_rank', cost: -1, desc: 'Only effective in specific circumstances or against certain targets (e.g. Only vs Metal).' },
  { name: 'Noticeable', type: 'flat', cost: -1, desc: 'Power has an unmistakable, obvious visual or audio tell.' },
  { name: 'Permanent', type: 'per_rank', cost: 0, desc: 'Continuous duration, cannot be deactivated at will.' },
  { name: 'Quirk', type: 'flat', cost: -1, desc: 'Minor disadvantage or limitation.' },
  { name: 'Reduced Range', type: 'per_rank', cost: -1, desc: 'Shift range down one step (Perception -> Ranged -> Close).' },
  { name: 'Removable', type: 'flat', cost: -1, desc: 'Power comes from equipment/item that can be taken away (-1 PP per 5 PP, or -2 per 5 for Easily Removable).' },
  { name: 'Resistible', type: 'per_rank', cost: -1, desc: 'Grants an extra resistance check (e.g., Dodge or Fortitude) to avoid effect.' },
  { name: 'Sense-Dependent', type: 'per_rank', cost: -1, desc: 'Target must be able to perceive the effect with a specific sense.' },
  { name: 'Side Effect', type: 'per_rank', cost: -1, desc: 'Failing a check or using power triggers negative backlash.' },
  { name: 'Tiring', type: 'per_rank', cost: -1, desc: 'Using power causes a level of Fatigue.' },
  { name: 'Uncontrolled', type: 'per_rank', cost: -1, desc: 'GM or circumstance dictates when power triggers.' },
  { name: 'Unreliable', type: 'per_rank', cost: -1, desc: '50% chance power fails to activate (roll 11+ on d20) or 5 uses/day.' }
];

/**
 * Calculates total Power Points cost for a single effect component based on M&M 3e rules.
 * Supports fractional costs (e.g., 1 PP per 2 ranks).
 */
export function calculateComponentCost(baseCost, ranks, extras = [], flaws = [], activation = 0) {
  let perRankModifier = 0;
  let flatTotal = activation; // -1 for move, -2 for standard

  // Sum extras
  for (const extra of extras) {
    const extraRanks = extra.ranks || 1;
    if (extra.type === 'per_rank') {
      perRankModifier += extra.cost;
    } else if (extra.type === 'flat_per_rank') {
      flatTotal += extra.cost * extraRanks;
    } else if (extra.type === 'flat') {
      flatTotal += extra.cost;
    }
  }

  // Sum flaws
  for (const flaw of flaws) {
    const flawRanks = flaw.ranks || 1;
    if (flaw.type === 'per_rank') {
      perRankModifier += flaw.cost; // flaw.cost is negative
    } else if (flaw.type === 'flat_per_rank') {
      flatTotal += flaw.cost * flawRanks;
    } else if (flaw.type === 'flat') {
      flatTotal += flaw.cost;
    }
  }

  const netPerRank = baseCost + perRankModifier;

  let basePointCost = 0;
  if (netPerRank >= 1) {
    basePointCost = netPerRank * ranks;
  } else {
    // Fractional cost rule: 0 -> 1 per 2 ranks; -1 -> 1 per 3 ranks; -2 -> 1 per 4 ranks...
    const divisor = 2 - netPerRank; // e.g. netPerRank 0 -> divisor 2; netPerRank -1 -> divisor 3
    basePointCost = Math.ceil(ranks / divisor);
  }

  const totalCost = basePointCost + flatTotal;
  return Math.max(1, totalCost);
}

/**
 * Calculates total Power Points for a full Power (including Linked Effects and Alternate Effects).
 */
export function calculatePowerTotalCost(power) {
  // Main effect cost
  let mainCost = calculateComponentCost(
    power.baseCost || 1,
    power.ranks || 1,
    power.extras || [],
    power.flaws || [],
    power.activationCost || 0
  );

  // Add linked effects
  if (power.linkedEffects && power.linkedEffects.length > 0) {
    for (const linked of power.linkedEffects) {
      mainCost += calculateComponentCost(
        linked.baseCost || 1,
        linked.ranks || 1,
        linked.extras || [],
        linked.flaws || [],
        linked.activationCost || 0
      );
    }
  }

  // Alternate effects cost (+1 PP each for standard array, or +2 PP for dynamic)
  let alternateEffectsCost = 0;
  if (power.alternateEffects && power.alternateEffects.length > 0) {
    for (const alt of power.alternateEffects) {
      alternateEffectsCost += alt.isDynamic ? 2 : 1;
    }
  }

  return mainCost + alternateEffectsCost;
}
