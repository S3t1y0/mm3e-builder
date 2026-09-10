// js/rules/powerEngine.js
/**
 * Mutants & Masterminds 3e Power Engine
 * Official D20 Hero System Power Rules, Fractional Costs, Array Budgets,
 * Device / Removable Discounts, and Combat Metrics with PL Cap Compliance.
 */

export const EFFECT_CATEGORIES = [
  'All',
  'Attack',
  'Defense',
  'Movement',
  'Sensory',
  'Control & Utility'
];

export const BASE_EFFECTS = [
  { name: 'Affliction', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'You can impose some debilitating condition or conditions on a target by making a close attack. You set the conditions your Affliction inflicts at each of three degrees of failure (Fortitude or Will vs DC 10 + rank). First degree causes conditions like Dazed, Hindered, or Fatigued; second degree causes Compelled, Defenseless, Disabled, Exhausted, Immobile, or Stunned; third degree causes Asleep, Controlled, Incapacitated, Paralyzed, or Transformed.' },
  { name: 'Blast', category: 'Attack', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'You can make a damaging ranged attack. It might be a blast of energy, a projectile (arrow, bullet, throwing blade, etc.), or some similar effect. You make a ranged attack check against the target’s Dodge defense. The attack’s damage equals your power rank and the target makes a Toughness resistance check against it.' },
  { name: 'Burrowing', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can burrow through the ground, leaving a tunnel behind if you choose. You move through soil and sand at a speed rank equal to your Burrowing rank, minus 5. So Burrowing 8, for example, lets you move through the ground at speed rank 3 (around 16 MPH). Burrowing through hard clay and packed earth reduces speed one additional rank. Burrowing through solid rock reduces it by two additional ranks. The tunnel you leave behind is either permanent or collapses behind you immediately (your choice when you begin burrowing each new tunnel). Note that Burrowing differs from the Permeate effect of Movement, which allows you to pass through an obstacle like the ground at your normal speed without disturbing it at all.' },
  { name: 'Communication', category: 'Sensory', cost: 4, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'You can communicate over a distance using a medium other than your normal voice (such as mental telepathy, radio frequencies, mystical sendings, or ultrasonic signals) across distances determined by your rank on the Measurements Table.' },
  { name: 'Comprehend', category: 'Control & Utility', cost: 2, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You can comprehend different sorts of communication. Each rank in this effect allows you to understand, speak, or read foreign languages, communicate with animals, plants, machines, or spirits, or understand all spoken concepts.' },
  { name: 'Concealment', category: 'Control & Utility', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You gain total concealment from a particular sense while this effect is active, making you undetectable to that sense and providing total concealment (+5 circumstance bonus to active defense against attacks relying on that sense). Two ranks grant concealment for an entire sense type.' },
  { name: 'Create', category: 'Control & Utility', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Sustained', desc: 'You can form solid objects essentially out of nowhere. They may be made of solidified energy, “hardened” water or air, transmuted bulk matter, ice, stone, or some other medium, depending on the effect’s descriptors. You can form any simple geometric shape or common object (such as a cube, sphere, dome, hammer, lens, disk, etc.). The GM has final say on whether or not a particular object is too complex for this effect. Generally, your objects can’t have any moving parts more complex than a hinge. They can be solid or hollow, opaque or transparent, as you choose when you use the effect, limited by your descriptors and the Gamemaster’s judgment.' },
  { name: 'Damage', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'You can inflict damage on a target by making a close attack. The exact nature of your Damage is up to you (from powerful kinetic impacts to razor claws, fire, or energy fields). The target resists with a Toughness check against DC 15 + Damage rank to resist bruised penalties (-1 to further checks), dazed, staggered, and incapacitated conditions.' },
  { name: 'Deflect', category: 'Defense', cost: 1, range: 'Ranged', action: 'Standard', duration: 'Instant', desc: 'You can actively defend for characters other than yourself, deflecting or diverting ranged attacks directed at allies within range using active defense checks with a d20 roll, and may be able to more effectively defend yourself depending on your rank.' },
  { name: 'Elongation', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can elongate your body and/or limbs to extend your reach. Add your effect rank to your normal size rank to determine how far you can elongate; for a normalsized human (size rank –2) this is 15 feet at rank 1, 30 feet at rank 2, and so forth. Rank 20 Elongation can stretch 1,000 miles! “Snapping back” to your normal shape is a free action. You can use Elongation to make “close” attacks at a greater distance by elongating your limbs. Once elongated, you can make melee attacks within your new reach as a standard action. If you can’t accurately sense your target (you’re elongating around a corner, for example), apply the rules for concealment.' },
  { name: 'Enhanced Trait', category: 'Control & Utility', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can temporarily improve one of your existing traits, chosen when you take this effect. While this effect is active, you increase the affected trait by its rank. So, for example, Enhanced Strength 5 increases your Strength by +5 while it is active. Your enhanced trait is still subject to power level limits, so your unenhanced rank must be below the limit by at least the amount of the enhancement to accommodate it. The cost of Enhanced Trait is the same per rank as acquiring a rank in the affected trait. The key differences are that Enhanced Trait is a power effect, rather than a natural trait, and as an effect it can be combined with extra effort and other effects.' },
  { name: 'Environment', category: 'Control & Utility', cost: 2, range: 'Rank', action: 'Standard', duration: 'Sustained', desc: 'You can change the environment in an area: raising or lowering the temperature, creating intense light or darkness, causing rain, high winds, or impeditious terrain within a radius determined by your rank.' },
  { name: 'Extra Limbs', category: 'Control & Utility', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You have one or more additional limbs or appendages—tails, tentacles, extra arms, prehensile hair—granting you an advantage when performing multiple manipulative tasks and a bonus on grab checks.' },
  { name: 'Feature', category: 'Control & Utility', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'The Feature effect is intended for minor, cosmetic, or utilitarian superhuman abilities that have a negligible game effect, costing 1 point flat per rank (such as internal compass, fur coat, or mimicry).' },
  { name: 'Flight', category: 'Movement', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can fly through the air, including hovering in place. You have a flight speed rank equal to your effect rank.' },
  { name: 'Growth', category: 'Control & Utility', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can temporarily increase your size, gaining increased Strength, Stamina, and reach, but becoming easier to hit and less stealthy. Every 4 ranks increases your size rank by 1 and grants commensurate physical bonuses.' },
  { name: 'Healing', category: 'Control & Utility', cost: 2, range: 'Close', action: 'Standard', duration: 'Instant', desc: 'You can heal Damage conditions by touch. Make an effect check (DC 10); success removes one degree of damage from the subject (bruised penalty, dazed, or staggered). You can also stabilize dying subjects automatically as a standard action.' },
  { name: 'Illusion', category: 'Control & Utility', cost: 1, range: 'Perception', action: 'Standard', duration: 'Sustained', desc: 'You can project convincing sensory impressions (visual holographic images, phantom sounds, false scents, or tactile sensations) into an area. Targets observing the illusion make an Insight check to recognize it as false.' },
  { name: 'Immortality', category: 'Defense', cost: 2, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You can recover from death! If your character is killed, you return to life after a period of time determined by your Immortality rank (from days at rank 1 to mere minutes or rounds at high ranks).' },
  { name: 'Immunity', category: 'Defense', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You are completely immune to certain effects, hazards, or conditions, ranging from environmental heat/cold and disease/poison (1-2 ranks) to life support, critical hits, or broad damage descriptors (5 to 30 ranks).' },
  { name: 'Insubstantial', category: 'Defense', cost: 5, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can assume a less solid form: Rank 1 Fluid (flow through openings), Rank 2 Gaseous (smoke/gas form), Rank 3 Energy (composed of coherent energy), or Rank 4 Incorporeal (completely intangible ghost, immune to physical damage).' },
  { name: 'Leaping', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Instant', desc: 'You can make prodigious leaps, far beyond normal human capability. Add your effect rank to your normal jumping distance rank to determine how far you can leap as a move action.' },
  { name: 'Luck Control', category: 'Control & Utility', cost: 3, range: 'Perception', action: 'Reaction', duration: 'Instant', desc: 'You can manipulate probability and luck in your favor or to the detriment of opponents, spending Victory Points to force re-rolls, negate unluck, or grant luck benefits to allies.' },
  { name: 'Mind Reading', category: 'Sensory', cost: 2, range: 'Perception', action: 'Standard', duration: 'Sustained', resistance: 'Will', desc: 'You can read another character’s mind via an opposed effect check against the target’s Will defense. Degrees of success allow you to read surface thoughts, probe memories, or uncover deepest subconscious secrets.' },
  { name: 'Morph', category: 'Control & Utility', cost: 5, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can alter your cosmetic appearance, gaining a +20 circumstance bonus to Deception checks to disguise yourself. Ranks determine whether you can assume a single form, narrow group, broad category, or any form of equal mass.' },
  { name: 'Move Object', category: 'Control & Utility', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Sustained', desc: 'You can move objects at a distance without touching them (telekinetically or magnetically). Your effective Strength for lifting and throwing objects is equal to your rank on the Measurements Table.' },
  { name: 'Movement', category: 'Movement', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You have special superhuman modes of locomotion. Each rank allows choosing options such as Dimension Travel, Environmental Adaptation, Permeate, Safe Fall, Slithering, Space Travel, Trackless, Wall-crawling, or Water Walking.' },
  { name: 'Nullify', category: 'Attack', cost: 1, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Will', desc: 'You can counter and shut down active powers matching a designated descriptor (such as fire, magical, or mental effects) via an opposed power check against the target’s power rank or Will check.' },
  { name: 'Protection', category: 'Defense', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Protection shields you against damage, giving you +1 to your Toughness defense per rank. An active defense modifier or descriptor (such as armor, force fields, or mystic barriers) explains how this protection operates.' },
  { name: 'Quickness', category: 'Control & Utility', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can perform routine physical or mental tasks at superhuman speed. Subtract your effect rank from the normal time rank to perform routine tasks (research, assembly, repairs, reading) in fractions of a second.' },
  { name: 'Regeneration', category: 'Control & Utility', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You recover quickly from damage automatically without rest. Remove bruised penalties and recover from staggered/incapacitated damage conditions at an accelerated rate determined by your rank.' },
  { name: 'Remote Sensing', category: 'Sensory', cost: 1, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'You can displace one or more of your senses over a distance, perceiving as if you were physically present at that distant location without crossing the intervening space.' },
  { name: 'Senses', category: 'Sensory', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'One or more of your sensory faculties are superhumanly enhanced or expanded beyond the normal five senses (such as Darkvision, Infravision, Acute Scent, Radar, Tremorsense, or Danger Sense).' },
  { name: 'Shrinking', category: 'Control & Utility', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can temporarily decrease your size, becoming smaller, harder to see, and harder to hit (+active defenses and +Stealth bonuses) at the cost of reduced Strength and ground movement speed.' },
  { name: 'Speed', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can run and move overland faster than normal human limits, with your ground speed rank equal to your effect rank on the Measurements Table.' },
  { name: 'Summon', category: 'Control & Utility', cost: 2, range: 'Close', action: 'Standard', duration: 'Sustained', desc: 'You can call upon another creature—a minion—to aid you. This creature is created as an independent character with (effect rank × 15) character points, limited to a Power Level equal to the Summon rank. You summon your minion automatically as a standard action in an open space beside you.' },
  { name: 'Swimming', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can swim effortlessly through water at high speed, with a water speed rank equal to your Swimming rank minus 2.' },
  { name: 'Teleport', category: 'Movement', cost: 2, range: 'Personal', action: 'Move', duration: 'Instant', desc: 'You can move instantly from place to place without crossing the distance in between, transporting yourself and carrying mass based on your rank on the Measurements Table as a move action.' },
  { name: 'Transform', category: 'Control & Utility', cost: 2, range: 'Close', action: 'Standard', duration: 'Sustained', desc: 'You can change objects into other objects, altering their shape or material composition in the process. You must touch the chosen object (requiring a close attack check if held or worn). Transmuted objects remain in their new form until changed back or dispelled.' },
  { name: 'Variable', category: 'Control & Utility', cost: 7, range: 'Personal', action: 'Standard', duration: 'Sustained', desc: 'You can gain or use potentially any effect of the appropriate type and descriptor! A Variable effect provides you with a pool of (rank × 5) character points you can allocate to different effects matching your theme, subject to normal power level limits.' },
  { name: 'Weaken', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'You can temporarily lower one of a target’s traits (an Ability, Defense, or Power effect), chosen when this effect is acquired. You touch the target with a close attack check. The target makes a Fortitude or Will resistance check vs DC 10 + Weaken rank. Each degree of failure lowers the chosen trait by 1 point, which recovers at a rate of 1 point per round.' }
];

export const EXTRAS = [
  {
    "name": "Accurate",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Provides a +2 bonus to attack checks per rank when using this power.\n\nLike all attack bonuses, this modifier is subject to the series Power Level cap for total attack bonus plus effect rank."
  },
  {
    "name": "Affects Corporeal",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Allows an incorporeal character (using Insubstantial) to use this effect on the normal physical world at its full rank.\n\nIf you have fewer ranks in Affects Corporeal than the effect's rank, the effect operates at a maximum rank equal to your Affects Corporeal rank."
  },
  {
    "name": "Affects Insubstantial",
    "category": "Combat",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1-2 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Allows this effect to affect insubstantial targets. At rank 1 (1 PP flat), the effect works at half rank against incorporeal targets.\n\nAt rank 2 (2 PP flat), the effect works at its full rank against incorporeal targets with no reduction.",
    "options": [
      {
        "id": "half",
        "label": "Half Effect (1 PP)",
        "cost": 1,
        "type": "flat",
        "desc": "Rank 1: Effect works at half its normal rank against insubstantial targets."
      },
      {
        "id": "full",
        "label": "Full Effect (2 PP)",
        "cost": 2,
        "type": "flat",
        "desc": "Rank 2: Effect functions at its full rank against insubstantial targets."
      }
    ]
  },
  {
    "name": "Affects Objects",
    "category": "Utility",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+0-1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Allows effects normally resisted by Fortitude to affect inanimate objects (which have no Stamina). The object gets a Toughness check or Dodge defense where appropriate.\n\nCan be taken at +1 PP/Rank to affect both living beings and objects, or +0 PP/Rank to affect objects only.",
    "options": [
      {
        "id": "both",
        "label": "Living & Objects (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Fortitude-resisted effect works on inanimate objects in addition to living creatures."
      },
      {
        "id": "only_objects",
        "label": "Affects Only Objects (+0/Rank)",
        "cost": 0,
        "type": "per_rank",
        "desc": "+0 PP/Rank: Effect works ONLY on inanimate objects, not on living creatures."
      }
    ]
  },
  {
    "name": "Affects Others",
    "category": "Utility",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+0-1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Allows you to grant the benefits of a personal-range effect to another person by touching them as a standard action.\n\nCosts +1 PP/Rank to grant the effect to others while still using it yourself, or +0 PP/Rank if you can only grant it to others.",
    "options": [
      {
        "id": "both",
        "label": "Self & Others (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Both you and your subject(s) can use the personal effect simultaneously."
      },
      {
        "id": "only_others",
        "label": "Affects Only Others (+0/Rank)",
        "cost": 0,
        "type": "per_rank",
        "desc": "+0 PP/Rank: Effect works ONLY on others, and not on you."
      }
    ]
  },
  {
    "name": "Alternate Effect",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1-2 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Creates an alternate configuration (slot) within a power array. You can switch between alternate slots as a free action once per turn.\n\nStandard slots cost 1 flat PP (mutually exclusive). Dynamic slots cost 2 flat PP and can share points simultaneously.",
    "options": [
      {
        "id": "standard",
        "label": "Standard Slot (1 PP)",
        "cost": 1,
        "type": "flat",
        "desc": "1 flat point: Swappable setting in an array (mutually exclusive)."
      },
      {
        "id": "dynamic",
        "label": "Dynamic Slot (2 PP)",
        "cost": 2,
        "type": "flat",
        "desc": "2 flat points: Can share power point pool dynamically with other dynamic effects."
      }
    ]
  },
  {
    "name": "Alternate Resistance",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+0-1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Changes the defense used to resist the effect (e.g., from Toughness to Fortitude or Will). The DC formula remains 10 + rank (or 15 + rank for Damage).\n\nCosts +1 PP/Rank if switching to a generally lower or more advantageous defense, or +0 PP/Rank for an equivalent defense.",
    "options": [
      {
        "id": "advantageous",
        "label": "Advantageous Defense (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Change is to a generally lower, more advantageous resistance (e.g. Will or Fortitude)."
      },
      {
        "id": "standard",
        "label": "Similar Defense (+0/Rank)",
        "cost": 0,
        "type": "per_rank",
        "desc": "+0 PP/Rank: Resistance differs with no significant increase in effectiveness."
      }
    ]
  },
  {
    "name": "Area",
    "category": "Range & Area",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Expands a single-target effect into an area effect that requires no attack check. Targets inside the area make a Dodge check (DC 10 + rank) for half effect.\n\nAvailable shapes include 30-ft Burst, 60-ft Cone, 30x5-ft Line, 15-ft Cloud, 30-ft Cylinder, Perception Area, or 30 cu. ft. Shapeable.",
    "configType": "area_shape",
    "shapes": [
      "Burst (30-ft radius)",
      "Cone (60-ft)",
      "Line (30-ft x 5-ft)",
      "Cloud (15-ft radius, lingers)",
      "Cylinder (30-ft radius & height)",
      "Perception (Sense-dependent)",
      "Shapeable (30 cu ft)"
    ]
  },
  {
    "name": "Attack",
    "category": "Combat",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Converts a personal-range effect (such as Teleport or Concealment) into an offensive close-range effect used against unwilling targets.\n\nRequires a standard action and an attack check. The target receives a resistance check (typically Dodge or Will) to negate the effect entirely."
  },
  {
    "name": "Contagious",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Causes the effect to spread to anyone who comes into physical contact with the primary target while the effect is active.\n\nSecondary targets make the normal resistance check against the effect. The contagion continues until cured or its duration expires."
  },
  {
    "name": "Dimensional",
    "category": "Sensory",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1-3 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Allows the effect to work across dimensional boundaries into other planes of existence.\n\nCosts 1 flat PP for a single specific dimension, 2 flat PP for a related group of dimensions, or 3 flat PP for any dimension.",
    "options": [
      {
        "id": "single",
        "label": "1 Dimension (1 PP)",
        "cost": 1,
        "type": "flat",
        "desc": "1 flat point: Can reach a single other specified dimension."
      },
      {
        "id": "group",
        "label": "Related Dimensions (2 PP)",
        "cost": 2,
        "type": "flat",
        "desc": "2 flat points: Can reach any of a related group of dimensions (e.g. mystic dimensions, astral planes)."
      },
      {
        "id": "any",
        "label": "Any Dimension (3 PP)",
        "cost": 3,
        "type": "flat",
        "desc": "3 flat points: Can reach into any other dimension in the setting."
      }
    ]
  },
  {
    "name": "Extended Range",
    "category": "Range & Area",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Doubles the short, medium, and maximum distance increments of a ranged effect for each rank applied.\n\nFor example, two ranks of Extended Range quadruple the effect's base range increments."
  },
  {
    "name": "Feature",
    "category": "Utility",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "desc": "Adds a minor, situational utility or cosmetic benefit that does not duplicate an existing effect or advantage.\n\nEach rank costs 1 flat point and provides one distinct minor capability approved by the Gamemaster.",
    "configType": "text_note"
  },
  {
    "name": "Homing",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Grants a ranged attack an additional attack check on subsequent rounds if it misses the target on the initial check.\n\nEach rank gives the attack one additional attempt on your turn until it hits, runs out of attempts, or is destroyed."
  },
  {
    "name": "Impervious",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Causes you to automatically ignore and suffer no harm from damaging effects whose rank is equal to or less than half your Impervious rank.\n\nEffects with the Penetrating extra can bypass Impervious defense up to the Penetrating rank."
  },
  {
    "name": "Increased Duration",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Increases the duration step of an effect: Instant to Concentration (+1 PP/Rank), Sustained to Continuous (+1 PP/Rank), or Instant to Continuous (+2 PP/Rank).\n\nContinuous effects remain active even if you are stunned or unconscious until you choose to dismiss them.",
    "options": [
      {
        "id": "concentration",
        "label": "Instant -> Concentration (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Makes an instant duration effect maintainable with standard action concentration."
      },
      {
        "id": "continuous",
        "label": "Sustained -> Continuous (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Makes a sustained duration effect continuous."
      },
      {
        "id": "instant_to_continuous",
        "label": "Instant -> Continuous (+2/Rank)",
        "cost": 2,
        "type": "per_rank",
        "desc": "+2 PP/Rank: Two steps of duration increase, taking an instant effect directly to continuous."
      }
    ]
  },
  {
    "name": "Increased Mass",
    "category": "Utility",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Increases the maximum mass capacity of a movement or manipulation effect by 1 rank on the Measurements Table per rank applied.\n\nFor example, 3 ranks of Increased Mass allow you to carry or affect 8 times your base mass limit."
  },
  {
    "name": "Increased Range",
    "category": "Range & Area",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Improves the range step of an effect: Close to Ranged (+1 PP/Rank), Ranged to Perception (+1 PP/Rank), or Close to Perception (+2 PP/Rank).\n\nPerception range effects require no attack check and can hit any target you can accurately perceive.",
    "options": [
      {
        "id": "ranged",
        "label": "Close -> Ranged (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Increases range from Close to Ranged."
      },
      {
        "id": "perception",
        "label": "Ranged -> Perception (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Increases range from Ranged to Perception (no attack roll needed)."
      },
      {
        "id": "close_to_perception",
        "label": "Close -> Perception (+2/Rank)",
        "cost": 2,
        "type": "per_rank",
        "desc": "+2 PP/Rank: Two applications of Increased Range, taking a Close effect directly to Perception."
      }
    ]
  },
  {
    "name": "Incurable",
    "category": "Combat",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Prevents damage or conditions inflicted by this effect from being healed or removed by normal Healing or Regeneration effects.\n\nSuch damage can only be treated naturally through rest or by a healing effect with the Persistent advantage."
  },
  {
    "name": "Indirect",
    "category": "Range & Area",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "desc": "Allows a ranged attack to originate from a direction or point other than yourself, bypassing cover and obstacles.\n\nCosts 1 to 4 flat PP depending on origin and directional flexibility (e.g. from above, behind cover, or any vector).",
    "options": [
      {
        "id": "indirect_1",
        "label": "Fixed Point Away (1 PP)",
        "cost": 1,
        "type": "flat",
        "desc": "1 flat point: Effect originates from a fixed point away from you."
      },
      {
        "id": "indirect_2",
        "label": "Any Point Away / Fixed Dir (2 PP)",
        "cost": 2,
        "type": "flat",
        "desc": "2 flat points: Comes from any point away from you or a fixed point in a fixed direction."
      },
      {
        "id": "indirect_3",
        "label": "Any Point in Fixed Dir (3 PP)",
        "cost": 3,
        "type": "flat",
        "desc": "3 flat points: Comes from any point in a fixed direction, or fixed point in any direction."
      },
      {
        "id": "indirect_4",
        "label": "Any Point, Any Direction (4 PP)",
        "cost": 4,
        "type": "flat",
        "desc": "4 flat points: Originates from any point and aims in any direction (including towards you from behind)."
      }
    ]
  },
  {
    "name": "Innate",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Marks the effect as a natural, biological, or intrinsic part of your character's species that cannot be countered by Nullify.\n\nThis extra costs 1 flat point and requires GM approval that the trait is truly inborn."
  },
  {
    "name": "Insidious",
    "category": "Sensory",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Hides the result or onset of an effect so the victim does not realize they have been harmed or weakened.\n\nDetecting the effect requires a DC 20 skill check (Perception or Insight) or a suitable exotic awareness sense."
  },
  {
    "name": "Linked",
    "category": "Utility",
    "type": "flat",
    "cost": 0,
    "costDisplay": "0 flat points",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Ties two or more effects together so they always trigger simultaneously as a single standard action.\n\nBoth effects must have the same range and use a single attack check, but targets make separate resistance checks for each effect."
  },
  {
    "name": "Multiattack",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Allows you to hit multiple targets in an arc or concentrate rapid hits on a single target for extra damage bonus (+2 or +5 DC).\n\nCan also provide covering fire to grant an ally defense against attacks."
  },
  {
    "name": "Penetrating",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Allows an attack to overcome Impervious resistance. The target must resist at least an effect rank equal to your Penetrating rank.\n\nPenetrating rank cannot exceed the base rank of the effect."
  },
  {
    "name": "Precise",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Grants fine motor control and delicate precision to the effect, such as carving initials, picking locks, or manipulating fine tools.\n\nCosts 1 flat point and eliminates clumsy side effects from high-rank power output."
  },
  {
    "name": "Reach",
    "category": "Range & Area",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Extends the physical melee range of a close effect by 5 feet per rank.\n\nUseful for long limbs, tentacles, whips, polearms, or extended energy constructs."
  },
  {
    "name": "Reaction",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 3,
    "costDisplay": "+1 or 3 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Changes the required action to use an effect from standard or free to an automatic reaction triggered by a specific circumstance.\n\nCosts +1 PP/Rank if upgrading from a Free action, or +3 PP/Rank if upgrading from a Standard action.",
    "options": [
      {
        "id": "from_standard",
        "label": "From Standard Action (+3/Rank)",
        "cost": 3,
        "type": "per_rank",
        "desc": "+3 PP/Rank: Applied to effects with a default action of Standard."
      },
      {
        "id": "from_free",
        "label": "From Free Action (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Applied to effects with a default action of Free."
      }
    ]
  },
  {
    "name": "Reversible",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Allows you to instantly remove or reverse the ongoing conditions caused by your effect as a free action.\n\nCosts 1 flat point and lets you dispel your own Afflictions, transforms, or sensory alterations at will."
  },
  {
    "name": "Ricochet",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Allows a ranged attack to bounce off solid surfaces to bypass cover and reach hidden targets.\n\nEach rank allows one bounce before reaching the target, with no penalty on the attack check."
  },
  {
    "name": "Secondary Effect",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Causes the effect to automatically hit the target a second time on the round following a successful attack at the same rank.\n\nThe target makes a second resistance check on their turn; does not stack with itself on subsequent rounds."
  },
  {
    "name": "Selective",
    "category": "Range & Area",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Allows you to pick and choose which targets in an area effect are affected and which are completely spared.\n\nInvaluable for area attacks to prevent hitting allies, innocent bystanders, or critical equipment."
  },
  {
    "name": "Sleep",
    "category": "Combat",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Causes an Affliction or Damage effect to render the target asleep or unconscious rather than incapacitated or dying.\n\nSleeping targets can be awakened early by loud noise, rough handling, or an ally taking a standard action."
  },
  {
    "name": "Split",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Allows you to split the ranks of an effect between multiple targets with a single attack action.\n\nEach rank of Split allows you to target one additional creature, dividing your total rank among all targets (minimum 1 rank each)."
  },
  {
    "name": "Subtle",
    "category": "Sensory",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1-2 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Makes the activation and operation of an effect difficult or impossible for observers to notice.\n\nRank 1 (1 flat PP) requires a DC 20 Perception check to detect. Rank 2 (2 flat PP) is completely undetectable to normal senses.",
    "options": [
      {
        "id": "subtle_1",
        "label": "Subtle 1: DC 20 (1 PP)",
        "cost": 1,
        "type": "flat",
        "desc": "1 flat point: Difficult to notice; DC 20 Perception check or exotic sense required."
      },
      {
        "id": "subtle_2",
        "label": "Subtle 2: Undetectable (2 PP)",
        "cost": 2,
        "type": "flat",
        "desc": "2 flat points: Completely undetectable by standard human senses."
      }
    ]
  },
  {
    "name": "Sustained",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Changes a permanent duration effect to sustained, allowing you to turn it on and off as a free action.\n\nYou can also modify the effect with extras and feats that cannot normally be applied to permanent traits."
  },
  {
    "name": "Triggered",
    "category": "Duration & Action",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Sets an effect to activate automatically when a specific trigger condition occurs (such as proximity, touch, or a timer).\n\nCosts 1 flat PP per trigger instance. You can reset a spent trigger as a standard action."
  },
  {
    "name": "Variable Descriptor",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1-2 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Allows you to alter the power's descriptive theme and energy type on the fly.\n\nCosts 1 flat PP for a narrow group of descriptors (e.g., weather, elements) or 2 flat PP for a broad group (e.g., any energy, magic).",
    "options": [
      {
        "id": "narrow",
        "label": "Narrow Group (1 PP)",
        "cost": 1,
        "type": "flat",
        "desc": "1 flat point: Closely related group of descriptors (e.g. weather, electricity, temperature)."
      },
      {
        "id": "broad",
        "label": "Broad Group (2 PP)",
        "cost": 2,
        "type": "flat",
        "desc": "2 flat points: Any broad group (e.g. all magic, all mental, or all technological)."
      }
    ]
  }
];

export const FLAWS = [
  {
    "name": "Activation",
    "category": "Action & Activation",
    "type": "flat",
    "cost": -1,
    "costDisplay": "–1-2 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "The power requires a preparation action before any of its effects can be used in an encounter.\n\nCosts -1 flat point if it requires a move action to activate, or -2 flat points if it requires a full standard action.",
    "options": [
      {
        "id": "move",
        "label": "Move Action (-1 PP)",
        "cost": -1,
        "type": "flat",
        "desc": "Requires a Move action to prepare/activate before power can be used (-1 PP flat)."
      },
      {
        "id": "standard",
        "label": "Standard Action (-2 PP)",
        "cost": -2,
        "type": "flat",
        "desc": "Requires a Standard action to prepare/activate before power can be used (-2 PP flat)."
      }
    ]
  },
  {
    "name": "Check Required",
    "category": "Limitations",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "–1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "desc": "Requires a successful skill or ability check before the power activates. The DC equals 10 + ranks applied.\n\nIf the check fails, the power does not activate and the action is wasted. Each rank in this flaw reduces cost by -1 flat point.",
    "configType": "skill_select",
    "skills": [
      "Expertise",
      "Technology",
      "Acrobatics",
      "Athletics",
      "Deception",
      "Insight",
      "Intimidation",
      "Perception",
      "Sleight of Hand",
      "Stealth",
      "Treatment"
    ]
  },
  {
    "name": "Concentration",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Reduces the duration step of an effect (such as sustained to concentration). You must spend a standard action each round to maintain it.\n\nIf you take any other standard action or are stunned, the effect immediately ends."
  },
  {
    "name": "Diminished Range",
    "category": "Range & Targeting",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "–1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Reduces the range increments of a ranged effect. Short range becomes 5 ft per rank, medium 10 ft, and maximum 25 ft per rank.\n\nEach rank of Diminished Range reduces the effect's total cost by -1 flat point."
  },
  {
    "name": "Distracting",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Using this effect requires intense focus, leaving you vulnerable (halving your active defenses Dodge and Parry) until your next turn.\n\nThis flaw reduces the cost of the effect by -1 PP/Rank."
  },
  {
    "name": "Fades",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "The effect loses 1 rank of potency each round or use until it reaches rank 0.\n\nYou must spend time recharging, resting, or satisfying a condition to restore the effect to full rank."
  },
  {
    "name": "Feedback",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "You suffer damage whenever the manifestations of your power (such as a projected illusion, duplicate, or sensory probe) are attacked.\n\nYou must make a Toughness resistance check against attacks directed at the manifested power."
  },
  {
    "name": "Grab-Based",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "The effect can only be used on a target you have successfully grabbed or restrained.\n\nIf the grab attempt fails or the target escapes, the effect cannot be applied."
  },
  {
    "name": "Increased Action",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1-3 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Increases the action time needed to use the effect by one or more steps (Standard to Full-Round, Free to Move, etc.).\n\nEach step increase in required action reduces the cost by -1 PP/Rank (up to -3 PP/Rank for 3 steps).",
    "options": [
      {
        "id": "one_step",
        "label": "1 Step Increase (-1/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "-1 PP/Rank: Free to Move action, or Standard to Full action."
      },
      {
        "id": "two_steps",
        "label": "2 Steps Increase (-2/Rank)",
        "cost": -2,
        "type": "per_rank",
        "desc": "-2 PP/Rank: Free to Standard action."
      },
      {
        "id": "three_steps",
        "label": "3 Steps Increase (-3/Rank)",
        "cost": -3,
        "type": "per_rank",
        "desc": "-3 PP/Rank: Free to Full round action."
      }
    ]
  },
  {
    "name": "Limited",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "The effect only functions under specific, restricted circumstances or against a limited class of targets (e.g., only against metal, only in direct sunlight).\n\nThe limitation must remove about half of the effect's usual utility to qualify for this -1 PP/Rank flaw.",
    "configType": "text_note"
  },
  {
    "name": "Noticeable",
    "category": "Limitations",
    "type": "flat",
    "cost": -1,
    "costDisplay": "–1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "A continuous or permanent effect has an obvious, undeniable physical sign that gives it away (such as glowing skin, hum, or stony bulk).\n\nCosts -1 flat point and prevents the effect from ever being subtle or concealed."
  },
  {
    "name": "Permanent",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "The effect cannot be turned off voluntarily and is always active. You cannot use extra effort or stunt alternate effects from it.\n\nCosts -1 PP/Rank and is only applied to sustained personal effects like Protection or Enhanced Traits."
  },
  {
    "name": "Quirk",
    "category": "Limitations",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "–1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "desc": "A minor nuisance, cosmetic flaw, or situational drawback that is slightly inconvenient but less severe than a Complication.\n\nEach Quirk reduces the effect's cost by -1 flat point.",
    "configType": "text_note"
  },
  {
    "name": "Reduced Range",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "Decreases the range step of an effect by one step (Ranged to Close) for -1 PP/Rank, or by two steps (Perception to Close) for -2 PP/Rank.\n\nClose range effects require an attack check to physically touch the target.",
    "options": [
      {
        "id": "one_step",
        "label": "1 Step: Ranged->Close (-1/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "-1 PP/Rank: Decreases range by one step (Perception to Ranged, or Ranged to Close)."
      },
      {
        "id": "two_steps",
        "label": "2 Steps: Perception->Close (-2/Rank)",
        "cost": -2,
        "type": "per_rank",
        "desc": "-2 PP/Rank: Decreases range two steps from Perception to Close."
      }
    ]
  },
  {
    "name": "Removable",
    "category": "Device",
    "type": "flat",
    "cost": -1,
    "costDisplay": "–1-2/5 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "The power is an external item or device that can be taken away from you.\n\nRemovable items (like armor or shields) give a -1 PP discount per 5 PP. Easily Removable items (held weapons or wands) give a -2 PP discount per 5 PP.",
    "options": [
      {
        "id": "removable",
        "label": "Removable (-1 PP / 5 PP)",
        "cost": -1,
        "type": "flat",
        "desc": "-1 PP per 5 PP of final cost: Removed only when stunned & defenseless / out of combat."
      },
      {
        "id": "easily_removable",
        "label": "Easily Removable (-2 PP / 5 PP)",
        "cost": -2,
        "type": "flat",
        "desc": "-2 PP per 5 PP of final cost: Can be snatched or disarmed in combat with an attack check."
      }
    ]
  },
  {
    "name": "Resistible",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Adds an additional resistance check (or allows a check where none was previously allowed) to negate or halve the effect.\n\nFor example, a Teleport Attack might allow both a Dodge and Will check to escape."
  },
  {
    "name": "Sense-Dependent",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "The target must be able to perceive the effect with a specific sense (Sight, Sound, Scent, Touch, or Mental) for it to work.\n\nTargets who lack that sense, have it shielded, or successfully avert their eyes/ears are completely immune.",
    "configType": "sense_select",
    "senses": [
      "Visual",
      "Auditory",
      "Olfactory",
      "Tactile",
      "Mental"
    ]
  },
  {
    "name": "Side Effect",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "A catastrophic failure or complication occurs whenever you use the power or fail an attack check with it.\n\nCosts -1 PP/Rank if the side effect only occurs on a failure, or -2 PP/Rank if it happens every time the power is activated.",
    "options": [
      {
        "id": "on_failure",
        "label": "On Failure Only (-1/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "-1 PP/Rank: Problematic side effect occurs only if attack check misses or target resists."
      },
      {
        "id": "always",
        "label": "Always Occurs on Use (-2/Rank)",
        "cost": -2,
        "type": "per_rank",
        "desc": "-2 PP/Rank: Problematic side effect triggers every time power is used regardless of success."
      }
    ]
  },
  {
    "name": "Tiring",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Using the power leaves you fatigued. You must spend extra effort or rest to recover from the exhaustion.\n\nIf you are already fatigued when using the power, you become exhausted, and then incapacitated."
  },
  {
    "name": "Uncontrolled",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "You have no direct influence over when or how the power manifests; its activation and targets are determined by the Gamemaster.\n\nReduces the cost of the effect by -1 PP/Rank."
  },
  {
    "name": "Unreliable",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "–1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "desc": "The power either only works 5 times before needing to be recharged, or requires an 11+ on a d20 roll each time you try to activate it.\n\nReduces the cost of the effect by -1 PP/Rank.",
    "options": [
      {
        "id": "roll",
        "label": "Roll 11+ on d20 (-1/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "50% chance to work each round; on 10 or less on d20, action is wasted."
      },
      {
        "id": "five_uses",
        "label": "5 Uses per Day/Scene (-1/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "Functions normally for 5 uses, then stops working until recovered/recharged."
      }
    ]
  },
  {
    "name": "Inaccurate",
    "category": "Range & Targeting",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "-1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Imposes a -2 penalty to attack checks per rank when using this power.\n\nEach rank of Inaccurate reduces the cost of the effect by -1 flat point."
  }
];

export const MODIFIER_CATEGORIES = [
  'All',
  'Combat',
  'Range & Area',
  'Duration & Action',
  'Action & Activation',
  'Range & Targeting',
  'Limitations',
  'Sensory',
  'Utility',
  'Device'
];

/**
 * Creates a normalized empty Power Effect.
 */
export function createEmptyEffect(baseName = 'Damage') {
  const base = BASE_EFFECTS.find(b => b.name === baseName) || BASE_EFFECTS[0];

  return {
    id: 'eff_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: base.name,
    baseEffect: base.name,
    ranks: 1,
    baseCost: base.cost || 1,
    action: base.action || 'Standard',
    range: base.range || 'Close',
    duration: base.duration || 'Instant',
    resistance: base.resistance || (base.name === 'Affliction' ? 'Fortitude' : 'Toughness'),
    extras: [],
    flaws: []
  };
}

/**
 * Creates a full normalized Power conforming to the new Power Schema.
 */
export function createEmptyPower() {
  return {
    id: 'pow_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: '',
    summary: '',
    type: 'standard', // 'standard' | 'linked' | 'array' | 'device'
    activation: 'none', // 'none' | 'move' | 'standard'
    activationCost: 0,
    descriptors: [],
    mainEffect: createEmptyEffect('Damage'),
    linkedEffects: [],
    alternateEffects: [],
    deviceConfig: {
      type: 'none', // 'none' | 'removable' | 'easily_removable'
      descriptor: '',
      toughness: 10
    },
    notes: ''
  };
}

/**
 * Normalizes any power object (handles legacy flat format or newly nested format).
 * Guarantees all required fields and sub-effects exist.
 */
export function normalizePower(rawPower) {
  if (!rawPower) return createEmptyPower();

  const power = { ...rawPower };

  // Ensure ID and basic identity
  power.id = power.id || ('pow_' + Date.now() + Math.random().toString(36).substr(2, 4));
  power.name = power.name || '';
  power.summary = power.summary || '';
  power.type = power.type || 'standard';
  power.descriptors = Array.isArray(power.descriptors) ? [...power.descriptors] : [];
  power.notes = power.notes || '';
  power.activation = power.activation || 'none';
  power.activationCost = power.activationCost !== undefined ? Number(power.activationCost) : (power.activation === 'move' ? -1 : power.activation === 'standard' ? -2 : 0);

  // Device configuration
  if (!power.deviceConfig || typeof power.deviceConfig !== 'object') {
    power.deviceConfig = {
      type: 'none',
      descriptor: '',
      toughness: 10
    };
  } else {
    power.deviceConfig = {
      type: power.deviceConfig.type || 'none',
      descriptor: power.deviceConfig.descriptor || '',
      toughness: Number(power.deviceConfig.toughness) || 10
    };
  }

  // Check if power comes with legacy flat effect properties
  const hasLegacyFlatEffect = Boolean(power.baseEffect && !power.mainEffect);
  if (hasLegacyFlatEffect || !power.mainEffect) {
    const baseName = power.baseEffect || power.name || 'Damage';
    const baseRef = BASE_EFFECTS.find(b => b.name === baseName);
    power.mainEffect = {
      id: 'eff_main_' + power.id,
      name: power.name || baseName,
      baseEffect: baseName,
      ranks: Number(power.ranks) || 1,
      baseCost: power.baseCost !== undefined ? Number(power.baseCost) : (baseRef ? baseRef.cost : 1),
      action: power.action || (baseRef ? baseRef.action : 'Standard'),
      range: power.range || (baseRef ? baseRef.range : 'Close'),
      duration: power.duration || (baseRef ? baseRef.duration : 'Instant'),
      resistance: power.resistance || (baseRef ? (baseRef.resistance || 'Toughness') : 'Toughness'),
      extras: Array.isArray(power.extras) ? power.extras.map(normalizeModifier) : [],
      flaws: Array.isArray(power.flaws) ? power.flaws.map(normalizeModifier) : []
    };
  } else {
    power.mainEffect = normalizeEffect(power.mainEffect);
  }

  // Keep root legacy aliases in sync so legacy components, print templates, and targeted effects work
  power.baseEffect = power.mainEffect.baseEffect;
  power.ranks = power.mainEffect.ranks;
  power.baseCost = power.mainEffect.baseCost;
  power.range = power.mainEffect.range;
  power.action = power.mainEffect.action;
  power.duration = power.mainEffect.duration;
  power.resistance = power.mainEffect.resistance;
  power.extras = power.mainEffect.extras;
  power.flaws = power.mainEffect.flaws;

  // Normalize linked effects
  power.linkedEffects = Array.isArray(power.linkedEffects)
    ? power.linkedEffects.map(normalizeEffect)
    : [];

  // Normalize alternate effects
  power.alternateEffects = Array.isArray(power.alternateEffects)
    ? power.alternateEffects.map(normalizeAlternateSlot)
    : [];

  return power;
}

/**
 * Normalizes an individual effect component.
 */
export function normalizeEffect(rawEffect) {
  if (!rawEffect) return createEmptyEffect();
  const eff = { ...rawEffect };
  eff.id = eff.id || ('eff_' + Date.now() + Math.random().toString(36).substr(2, 4));
  eff.baseEffect = eff.baseEffect || eff.name || 'Damage';
  eff.name = eff.name || eff.baseEffect;
  eff.ranks = Math.max(1, Number(eff.ranks) || 1);

  const baseRef = BASE_EFFECTS.find(b => b.name === eff.baseEffect);
  if (eff.baseCost === undefined || isNaN(eff.baseCost)) {
    eff.baseCost = baseRef ? baseRef.cost : 1;
  } else {
    eff.baseCost = Number(eff.baseCost);
  }
  eff.action = eff.action || (baseRef ? baseRef.action : 'Standard');
  eff.range = eff.range || (baseRef ? baseRef.range : 'Close');
  eff.duration = eff.duration || (baseRef ? baseRef.duration : 'Instant');
  eff.resistance = eff.resistance || (baseRef ? (baseRef.resistance || 'Toughness') : 'Toughness');
  eff.extras = Array.isArray(eff.extras) ? eff.extras.map(normalizeModifier) : [];
  eff.flaws = Array.isArray(eff.flaws) ? eff.flaws.map(normalizeModifier) : [];
  return eff;
}

/**
 * Normalizes an individual modifier (extra or flaw).
 */
export function normalizeModifier(rawMod) {
  if (!rawMod) return { name: 'Unknown', cost: 0, type: 'per_rank', ranks: 1 };
  const mod = typeof rawMod === 'string' ? { name: rawMod } : { ...rawMod };

  // Look up master definitions if cost/type/desc missing
  const ref = EXTRAS.find(e => e.name === mod.name) || FLAWS.find(f => f.name === mod.name);
  if (ref) {
    if (!mod.desc) mod.desc = ref.desc;
    if (!mod.category) mod.category = ref.category;
    if (ref.options) mod.options = ref.options;
    if (ref.configType) mod.configType = ref.configType;
    if (ref.shapes) mod.shapes = ref.shapes;
    if (ref.skills) mod.skills = ref.skills;
    if (ref.senses) mod.senses = ref.senses;
    if (ref.costDisplay) mod.costDisplay = ref.costDisplay;
    if (ref.hasRanks !== undefined && mod.hasRanks === undefined) mod.hasRanks = ref.hasRanks;
    if (ref.hasConfig !== undefined && mod.hasConfig === undefined) mod.hasConfig = ref.hasConfig;
  }

  mod.ranks = Math.max(1, Number(mod.ranks) || 1);
  mod.config = mod.config || {};

  // If modifier has options and an option is selected, sync cost and type from selected option
  if (ref && ref.options && ref.options.length > 0) {
    let chosenOpt = ref.options.find(o => o.id === mod.config.selectedOption);
    if (!chosenOpt) {
      chosenOpt = ref.options[0];
      mod.config.selectedOption = chosenOpt.id;
    }
    mod.cost = chosenOpt.cost;
    mod.type = chosenOpt.type || ref.type || 'per_rank';
  } else {
    if (mod.cost === undefined) mod.cost = ref ? ref.cost : 0;
    if (mod.type === undefined) mod.type = ref ? ref.type : 'per_rank';
  }

  mod.cost = Number(mod.cost);
  mod.type = mod.type || 'per_rank';
  return mod;
}

export function normalizeAlternateSlot(rawSlot) {
  if (!rawSlot) return { id: 'alt_' + Date.now(), name: 'Alternate Slot', isDynamic: false, effect: createEmptyEffect() };
  const slot = { ...rawSlot };
  slot.id = slot.id || ('alt_' + Date.now() + Math.random().toString(36).substr(2, 4));
  slot.name = slot.name || (slot.baseEffect ? `${slot.baseEffect} Slot` : 'Alternate Slot');
  slot.isDynamic = Boolean(slot.isDynamic);
  slot.allocatedPP = slot.allocatedPP !== undefined ? Number(slot.allocatedPP) : undefined;

  // Support both nested .effect or legacy flat slot properties
  if (!slot.effect) {
    slot.effect = normalizeEffect({
      baseEffect: slot.baseEffect || 'Damage',
      name: slot.name,
      ranks: slot.ranks || 1,
      extras: slot.extras || [],
      flaws: slot.flaws || []
    });
  } else {
    slot.effect = normalizeEffect(slot.effect);
  }

  return slot;
}

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

  // Sum extras
  for (const extra of norm.extras) {
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
  for (const flaw of norm.flaws) {
    const flawRanks = flaw.ranks || 1;
    if (flaw.type === 'per_rank') {
      perRankModifier += flaw.cost; // flaw.cost is negative
    } else if (flaw.type === 'flat_per_rank') {
      flatTotal += flaw.cost * flawRanks;
    } else if (flaw.type === 'flat') {
      flatTotal += flaw.cost;
    }
  }

  const netPerRank = norm.baseCost + perRankModifier;
  let basePointCost = 0;
  let divisor = null;

  if (netPerRank >= 1) {
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
 * Calculates Device discount according to official M&M 3e rules:
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
 * Main Effect + Linked Effects + Alternate Effects (+1 standard / +2 dynamic) - Device Discount.
 */
export function calculatePowerTotalCost(rawPower) {
  if (!rawPower) return 1;
  const power = normalizePower(rawPower);

  // 1. Main effect cost
  const mainCost = calculateEffectCost(power.mainEffect, power.activationCost || 0).totalCost;

  // 2. Linked effects cost
  let linkedCost = 0;
  for (const linked of power.linkedEffects) {
    linkedCost += calculateEffectCost(linked, 0).totalCost;
  }

  // 3. Alternate effects (Array slots): +1 PP each for standard, +2 PP for dynamic
  let alternateCost = 0;
  for (const alt of power.alternateEffects) {
    alternateCost += alt.isDynamic ? 2 : 1;
  }

  const subtotalRaw = mainCost + linkedCost + alternateCost;

  // 4. Device discount
  const discount = calculateDeviceDiscount(subtotalRaw, power.deviceConfig?.type || 'none');
  const finalCost = Math.max(1, subtotalRaw - discount);

  return finalCost;
}

/**
 * Returns a detailed step-by-step breakdown of power costs and math explanation.
 */
export function calculatePowerDetailedBreakdown(rawPower) {
  const power = normalizePower(rawPower);

  const mainBreakdown = calculateEffectCost(power.mainEffect, power.activationCost || 0);
  const mainCost = mainBreakdown.totalCost;

  const linkedBreakdowns = power.linkedEffects.map(l => ({
    name: l.name || l.baseEffect,
    cost: calculateEffectCost(l, 0).totalCost,
    details: calculateEffectCost(l, 0)
  }));
  const linkedCost = linkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

  const alternateBreakdowns = power.alternateEffects.map(a => ({
    name: a.name || a.effect?.name || 'Alternate Slot',
    isDynamic: Boolean(a.isDynamic),
    slotCost: a.isDynamic ? 2 : 1,
    effectCost: calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost
  }));
  const alternateCost = alternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);

  const rawSubtotal = mainCost + linkedCost + alternateCost;
  const deviceType = power.deviceConfig?.type || 'none';
  const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
  const finalCost = Math.max(1, rawSubtotal - deviceDiscount);

  // Human readable formula string
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
  if (deviceDiscount > 0) {
    formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
  }
  formulaString += ` = ${finalCost} PP`;

  return {
    mainCost,
    mainBreakdown,
    linkedCost,
    linkedBreakdowns,
    alternateCost,
    alternateBreakdowns,
    rawSubtotal,
    deviceType,
    deviceDiscount,
    finalCost,
    formulaString,
    arrayCapacity: mainCost // Max cost any alternate slot is allowed to have
  };
}

/**
 * Validates whether an alternate effect slot fits within the array capacity.
 */
export function validateArraySlot(mainEffectCost, alternateEffect) {
  const altCost = calculateEffectCost(alternateEffect).totalCost;
  return {
    isValid: altCost <= mainEffectCost,
    slotCost: altCost,
    capacity: mainEffectCost,
    headroom: mainEffectCost - altCost,
    overflow: Math.max(0, altCost - mainEffectCost)
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

  const isOffensive = ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify'].includes(effect.baseEffect);
  const isArea = effect.extras.some(e => e.name === 'Area');
  const isPerception = effect.range === 'Perception';
  const isClose = effect.range === 'Close';

  // Accurate extras & Inaccurate flaws
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
    // Check for matching Close Combat skill
    const closeSkill = skills.find(s => s.name === 'Close Combat' && s.subtype && new RegExp(power.name || effect.name, 'i').test(s.subtype));
    if (closeSkill) baseBonus += Number(closeSkill.ranks) || 0;
  } else {
    attackType = 'Ranged Attack';
    baseBonus = Number(abilities.DEX) || 0;
    // Check for matching Ranged Combat skill
    const rangedSkill = skills.find(s => s.name === 'Ranged Combat' && s.subtype && new RegExp(power.name || effect.name, 'i').test(s.subtype));
    if (rangedSkill) baseBonus += Number(rangedSkill.ranks) || 0;
  }

  const finalAttackBonus = (isArea || isPerception) ? null : (baseBonus + modAttackBonus);

  // Difficulty Class (DC)
  let dc = 0;
  let dcDescription = '';
  if (effect.baseEffect === 'Damage' || effect.baseEffect === 'Blast') {
    dc = 15 + effect.ranks;
    dcDescription = `DC ${dc} vs Toughness`;
  } else if (effect.baseEffect === 'Affliction') {
    dc = 10 + effect.ranks;
    dcDescription = `DC ${dc} vs ${effect.resistance || 'Fortitude/Will'}`;
  } else if (effect.baseEffect === 'Weaken' || effect.baseEffect === 'Nullify') {
    dc = 10 + effect.ranks;
    dcDescription = `DC ${dc} vs Will`;
  } else {
    dc = 10 + effect.ranks;
    dcDescription = `DC ${dc}`;
  }

  // Range in feet
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

  // PL Cap Compliance Check
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
      currentTotal = (finalAttackBonus || 0) + effect.ranks;
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
