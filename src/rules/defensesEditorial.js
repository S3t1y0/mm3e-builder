// src/rules/defensesEditorial.js
// Authoritative Mutants & Masterminds 3rd Edition (OGL) Reference for Defenses

export const DEFENSE_ICONS = {
  DODGE: 'ri-shield-flash-line',
  PARRY: 'ri-sword-line',
  FORTITUDE: 'ri-heart-pulse-line',
  TOUGHNESS: 'ri-shield-fill',
  WILL: 'ri-mental-health-line'
};

export const DEFENSE_EDITORIAL = {
  DODGE: {
    key: 'DODGE',
    name: 'Dodge',
    baseAbility: 'AGL',
    baseAbilityName: 'Agility',
    type: 'Active Ranged Defense',
    cost: '1 PP per Rank',
    pairedKey: 'TOUGHNESS',
    pairedName: 'Toughness',
    icon: 'ri-shield-flash-line',
    overview: 'Dodge measures physical agility and reflexes to avoid ranged attacks, explosions, and area hazards.',
    activeDefenseRules: 'Because Dodge is an Active Defense, you lose your Dodge bonus entirely (reduced to 0) if you are Defenseless. If you are Vulnerable, your Dodge bonus is halved (rounded up). When Prone, you gain a +5 bonus to Dodge against ranged attacks from more than 10 feet away.',
    tradeoffAdvice: 'Dodge trades off with Toughness. High Dodge favors avoiding attacks outright, while high Toughness favors absorbing direct hits.',
    hazardsResisted: [
      { name: 'Ranged Attacks', desc: 'Direct ballistic projectile attacks, energy blasters, thrown weapons, and ranged spells.' },
      { name: 'Area Attacks (Half Effect)', desc: 'When caught in an Area Effect (Burst, Cone, Line), make a Dodge check (DC 10 + Effect rank). Success reduces the effect rank by half.' },
      { name: 'Hazardous Traps & Collapses', desc: 'Dodging sudden falling rubble, ceiling collapses, spikes, or rolling boulders.' }
    ],
    conditionModifiers: [
      { condition: 'Defenseless', effect: 'Active defense reduced to 0. Attackers gain +5 bonus or can make routine checks.' },
      { condition: 'Vulnerable', effect: 'Active defense bonus is halved (rounded up).' },
      { condition: 'Prone', effect: '+5 bonus vs ranged attacks from beyond 10 feet; -5 penalty vs close attacks.' },
      { condition: 'Total Defense Action', effect: 'Standard action grants a +2 circumstance bonus to Dodge and Parry, or an active check of d20 + 10.' }
    ],
    synergisticAdvantages: ['Agile Feint', 'Defensive Roll', 'Evasion', 'Improved Defense', 'Instant Up', 'Uncanny Dodge']
  },

  PARRY: {
    key: 'PARRY',
    name: 'Parry',
    baseAbility: 'FGT',
    baseAbilityName: 'Fighting',
    type: 'Active Close Combat Defense',
    cost: '1 PP per Rank',
    pairedKey: 'TOUGHNESS',
    pairedName: 'Toughness',
    icon: 'ri-sword-line',
    overview: 'Parry measures close-combat defense, reflecting the skill to block or parry melee strikes and unarmed attacks.',
    activeDefenseRules: 'Like Dodge, Parry is an Active Defense: it is reduced to 0 if Defenseless, and halved if Vulnerable. Being Prone imposes a -5 circumstance penalty against close attacks.',
    tradeoffAdvice: 'Parry trades off with Toughness in melee. High Parry avoids close strikes, while high Toughness endures them.',
    hazardsResisted: [
      { name: 'Close Attacks', desc: 'Melee weapon strikes, martial arts punches, claws, bite attacks, and close-range energy touch.' },
      { name: 'Disarm Maneuver', desc: 'Defending against opponents trying to strip weapons or gadgets from your grip.' },
      { name: 'Grab & Trip Attacks', desc: 'Defending against opponent close grappling, pins, leg sweeps, and throws.' }
    ],
    conditionModifiers: [
      { condition: 'Defenseless', effect: 'Active defense reduced to 0.' },
      { condition: 'Vulnerable', effect: 'Active defense bonus is halved (rounded up).' },
      { condition: 'Prone', effect: '-5 circumstance penalty against close melee attacks.' },
      { condition: 'Defend Action', effect: 'Standard action to replace passive Parry/Dodge with a d20 + 10 check (minimum 11).' }
    ],
    synergisticAdvantages: ['Defensive Attack', 'Grabbing Finesse', 'Improved Defense', 'Takedown', 'Weapon Bind', 'Weapon Break']
  },

  FORTITUDE: {
    key: 'FORTITUDE',
    name: 'Fortitude',
    baseAbility: 'STA',
    baseAbilityName: 'Stamina',
    type: 'Passive Biological Resilience',
    cost: '1 PP per Rank',
    pairedKey: 'WILL',
    pairedName: 'Will',
    icon: 'ri-heart-pulse-line',
    overview: 'Fortitude measures bodily resistance against poisons, diseases, radiation, extreme environments, and physical exhaustion.',
    activeDefenseRules: 'Unlike Dodge and Parry, Fortitude is not an active defense and is not reduced by Vulnerable or Defenseless. Non-living entities (Constructs, Robots, Undead) with Absent Stamina automatically possess Immunity 30: Fortitude effects and cannot purchase Fortitude.',
    tradeoffAdvice: 'Fortitude trades off with Will, balancing physical endurance against mental defense.',
    hazardsResisted: [
      { name: 'Biological Toxins & Venoms', desc: 'Poison darts, toxic gas, venoms, paralyzing secretions, and synthetic drugs.' },
      { name: 'Diseases & Pathogens', desc: 'Bacterial infections, engineered bioweapons, viruses, and parasites.' },
      { name: 'Environmental Hazards', desc: 'Suffocation/drowning, extreme heat/cold, severe vacuum, radiation exposure, and starvation.' },
      { name: 'Fatigue & Exhaustion', desc: 'Exertion checks, sleep deprivation, and extra effort recovery checks.' },
      { name: 'Dying Checks', desc: 'A DC 15 Fortitude check each round while dying stabilizes the character. Three failures cause death.' }
    ],
    conditionModifiers: [
      { condition: 'Fatigued', effect: '-1 circumstance penalty on Fortitude checks.' },
      { condition: 'Exhausted', effect: '-2 circumstance penalty on Fortitude checks.' },
      { condition: 'Absent Stamina', effect: 'Immunity to Fortitude effects; Fortitude rank is null (-).' }
    ],
    synergisticAdvantages: ['Diehard', 'Great Endurance', 'Second Chance (Poison)', 'Second Chance (Radiation)', 'Ultimate Effort (Fortitude)']
  },

  TOUGHNESS: {
    key: 'TOUGHNESS',
    name: 'Toughness',
    baseAbility: 'STA',
    baseAbilityName: 'Stamina',
    type: 'Passive Damage Mitigation',
    cost: 'Non-purchasable directly (derived)',
    pairedKey: 'DODGE_PARRY',
    pairedName: 'Dodge & Parry',
    icon: 'ri-shield-fill',
    overview: 'Toughness measures armor, body density, and the ability to absorb damage without falling.',
    activeDefenseRules: 'Toughness cannot be purchased directly with Character Points. It is derived from Stamina + Protection (Power) + Defensive Roll (Advantage) + Armor (Equipment). If you are Vulnerable or Defenseless, you temporarily lose your Defensive Roll bonus.',
    tradeoffAdvice: 'Toughness trades off with Dodge and Parry. High Toughness with low active defense fits armored characters who shrug off incoming hits rather than dodging.',
    hazardsResisted: [
      { name: 'Direct Damage Effects', desc: 'Ballistic, bludgeoning, piercing, slashing, and energy damage (DC 15 + Damage rank).' },
      { name: 'Slam & Collision Hazards', desc: 'Impact from falling, vehicle collisions, and knockback against solid walls.' },
      { name: 'Explosive Shockwaves', desc: 'Blast pressure and concussion damage from detonating ordnance.' }
    ],
    damageConditions: [
      { degree: 'Failure: 1 Degree (1-5 below DC)', effect: 'Bruised: -1 cumulative penalty on future Toughness checks.' },
      { degree: 'Failure: 2 Degrees (6-10 below DC)', effect: 'Dazed until end of next turn, plus 1 Bruise.' },
      { degree: 'Failure: 3 Degrees (11-15 below DC)', effect: 'Staggered until end of next turn, plus 1 Bruise (second Staggered = Incapacitated).' },
      { degree: 'Failure: 4 Degrees (16+ below DC)', effect: 'Incapacitated (Unconscious/Defenseless).' }
    ],
    synergisticAdvantages: ['Defensive Roll', 'Diehard', 'Withstand Damage', 'Ultimate Effort (Toughness)']
  },

  WILL: {
    key: 'WILL',
    name: 'Will',
    baseAbility: 'AWE',
    baseAbilityName: 'Awareness',
    type: 'Passive Psychological Resistance',
    cost: '1 PP per Rank',
    pairedKey: 'FORTITUDE',
    pairedName: 'Fortitude',
    icon: 'ri-mental-health-line',
    overview: 'Will measures mental discipline and resistance against mind control, sensory illusions, fear, and psychic influence.',
    activeDefenseRules: 'Will is not an active defense and is not reduced by Vulnerable or Defenseless. Mindless constructs (Absent Intellect) or entities without awareness are immune to mental effects targeting reasoning or social manipulation.',
    tradeoffAdvice: 'Will trades off with Fortitude, protecting against telepathy, mind control, illusions, and demoralization.',
    hazardsResisted: [
      { name: 'Mental Afflictions', desc: 'Mind control, telepathic domination, psychic blasts, memory wipe, and emotional control.' },
      { name: 'Sensory Illusions', desc: 'Disbelieving phantom illusions and holographic deception (Will check DC 10 + Illusion rank).' },
      { name: 'Fear & Despair', desc: 'Supernatural fear effects, frightful presence, and demoralization.' },
      { name: 'Social Manipulation', desc: 'Resisting combat feints and tricks (Deception) or demoralize attempts (Intimidation).' }
    ],
    conditionModifiers: [
      { condition: 'Compelled / Controlled', effect: 'Opposed Will checks can overcome ongoing mental commands.' },
      { condition: 'Absent Intellect', effect: 'Immunity to mental effects targeting rational thought.' }
    ],
    synergisticAdvantages: ['Fearless', 'Mind Reading Defense', 'Second Chance (Mind Control)', 'Ultimate Effort (Will)']
  }
};
