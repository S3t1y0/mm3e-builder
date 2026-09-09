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
  { name: 'Accurate', category: 'Combat', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: '+2 attack roll bonus with this power per rank. Allows fine-tuning attack bonus vs effect rank trade-offs under Power Level cap.' },
  { name: 'Affects Corporeal', category: 'Combat', type: 'flat_per_rank', cost: 1, desc: 'Allows an Insubstantial or incorporeal character to physically strike and affect solid corporeal targets.' },
  { name: 'Affects Insubstantial', category: 'Combat', type: 'flat_per_rank', cost: 1, desc: 'Power affects incorporeal and insubstantial targets at full effectiveness without penalty.' },
  { name: 'Affects Objects', category: 'Utility', type: 'per_rank', cost: 0, desc: 'Allows powers that normally target only living creatures to also affect inanimate objects.' },
  { name: 'Affects Others', category: 'Utility', type: 'per_rank', cost: 1, desc: 'Grant a personal-range beneficial effect (e.g. Flight, Protection, Insubstantial) to another willing character.' },
  { name: 'Alternate Resistance', category: 'Combat', type: 'per_rank', cost: 0, desc: 'Change the defense check used to resist the effect (e.g., Damage resisted by Fortitude or Will instead of Toughness).' },
  { name: 'Area', category: 'Range & Area', type: 'per_rank', cost: 1, hasConfig: true, desc: 'Affects all targets in an area (Burst 30-ft radius, Cone 60-ft, Line 30-ft, Cylinder). Targets make Dodge check (DC 10 + rank) for half effect; no attack roll required.' },
  { name: 'Attack', category: 'Combat', type: 'per_rank', cost: 0, desc: 'Convert a personal or beneficial power into an offensive attack against unwilling targets (e.g., Teleport Attack).' },
  { name: 'Contagious', category: 'Combat', type: 'per_rank', cost: 1, desc: 'Effect spreads to anyone making physical contact with the affected target while active.' },
  { name: 'Dimensional', category: 'Sensory', type: 'flat', cost: 1, desc: 'Power can perceive or affect targets across alternate dimensions and astral planes.' },
  { name: 'Extended Range', category: 'Range & Area', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Double the normal range increments of the effect per rank.' },
  { name: 'Feature', category: 'Utility', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Minor beneficial quirk, thematic capability, or cosmetic utility (+1 PP flat per rank).' },
  { name: 'Homing', category: 'Combat', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Missed attack check automatically repeats on the subsequent round for each rank of Homing.' },
  { name: 'Impervious', category: 'Combat', type: 'per_rank', cost: 1, desc: 'Attacks with damage or effect ranks equal to or less than half this Impervious rank (rounded up) have no effect whatsoever.' },
  { name: 'Increased Duration', category: 'Duration & Action', type: 'per_rank', cost: 1, desc: 'Shift duration up one step (Instant -> Concentration -> Sustained -> Continuous).' },
  { name: 'Increased Mass', category: 'Utility', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Exponentially increase the mass that can be carried, moved, or affected by the power.' },
  { name: 'Increased Range', category: 'Range & Area', type: 'per_rank', cost: 1, desc: 'Shift range up one step (Close -> Ranged -> Perception). Perception range attacks never miss.' },
  { name: 'Incurable', category: 'Combat', type: 'flat', cost: 1, desc: 'Harm inflicted cannot be healed or removed without a Counter effect specifically countering this descriptor.' },
  { name: 'Indirect', category: 'Range & Area', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Attack originates away from the user (from above, behind, or ricocheting around obstacles), bypassing cover.' },
  { name: 'Innate', category: 'Utility', type: 'flat', cost: 1, desc: 'Power is biological, natural, or inborn trait; it cannot be nullified or dispelled.' },
  { name: 'Insidious', category: 'Sensory', type: 'flat', cost: 1, desc: 'Target is completely unaware that the effect is acting upon them until a condition manifests.' },
  { name: 'Linked', category: 'Utility', type: 'flat', cost: 0, desc: 'Combined with another effect to activate simultaneously as a single combined action.' },
  { name: 'Multiattack', category: 'Combat', type: 'per_rank', cost: 1, desc: 'Fire rapid-fire volleys at multiple targets, or concentrate fire on one for +2/+5 bonus damage on high attack rolls.' },
  { name: 'Penetrating', category: 'Combat', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Bypasses Impervious defense ranks up to the rank of Penetrating.' },
  { name: 'Precise', category: 'Utility', type: 'flat', cost: 1, desc: 'Surgical accuracy, fine manipulation, and microscopic control over the manifestation of the power.' },
  { name: 'Reach', category: 'Range & Area', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Extend close combat melee attack range by +5 feet per rank.' },
  { name: 'Reaction', category: 'Duration & Action', type: 'per_rank', cost: 3, desc: 'Triggers automatically in response to a defined circumstance or trigger without requiring an action.' },
  { name: 'Reversible', category: 'Utility', type: 'flat', cost: 1, desc: 'Can immediately end or undo the effects created by the power as a free action.' },
  { name: 'Ricochet', category: 'Combat', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Bounce attacks off walls, ceilings, and obstacles to strike targets around corners.' },
  { name: 'Secondary Effect', category: 'Combat', type: 'per_rank', cost: 1, desc: 'Effect strikes target again on the subsequent turn at full potency with no action required.' },
  { name: 'Selective', category: 'Range & Area', type: 'per_rank', cost: 1, desc: 'Choose exactly which targets are affected in an area, avoiding allies.' },
  { name: 'Sleep', category: 'Combat', type: 'per_rank', cost: 0, desc: 'Causes targets to fall into deep sleep rather than standard physical incapacitation.' },
  { name: 'Split', category: 'Combat', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Divide ranks among multiple distinct targets within range on a single attack.' },
  { name: 'Subtle', category: 'Sensory', type: 'flat', cost: 1, hasConfig: true, desc: 'Effect is hard to notice (Rank 1: DC 20 Perception check needed) or completely undetectable (Rank 2).' },
  { name: 'Sustained', category: 'Duration & Action', type: 'per_rank', cost: 0, desc: 'Maintain an instant or continuous power by spending a free action each round.' },
  { name: 'Triggered', category: 'Duration & Action', type: 'flat_per_rank', cost: 1, hasRanks: true, desc: 'Set the power like a trap or delayed trigger to discharge automatically when specific condition is met.' },
  { name: 'Variable Descriptor', category: 'Utility', type: 'flat', cost: 1, desc: 'Freely change power descriptors (Rank 1: narrow group like elements; Rank 2: any broad descriptor).' }
];

export const FLAWS = [
  { name: 'Activation', category: 'Action & Activation', type: 'flat', cost: -1, hasConfig: true, desc: 'Requires a Move action (-1 PP) or Standard action (-2 PP) to activate before use; deactivates if incapacitated.' },
  { name: 'Check Required', category: 'Limitations', type: 'flat_per_rank', cost: -1, hasRanks: true, hasConfig: true, desc: 'Must pass a skill check DC 10 + rank to activate the power. Failure wastes the action.' },
  { name: 'Concentration', category: 'Action & Activation', type: 'per_rank', cost: -1, desc: 'Requires a standard action each round to maintain, preventing other standard actions.' },
  { name: 'Diminished Range', category: 'Range & Targeting', type: 'flat_per_rank', cost: -1, hasRanks: true, desc: 'Reduces normal range increments by one step per rank.' },
  { name: 'Distracting', category: 'Action & Activation', type: 'per_rank', cost: -1, desc: 'Character becomes Vulnerable (halved active defenses) while using this power.' },
  { name: 'Fades', category: 'Limitations', type: 'per_rank', cost: -1, desc: 'Power loses 1 rank of potency each time it is used until recovered through rest or recharge.' },
  { name: 'Feedback', category: 'Limitations', type: 'per_rank', cost: -1, desc: 'Attacks targeting remote manifestations or projected energy forms harm the character directly.' },
  { name: 'Grab-Based', category: 'Range & Targeting', type: 'per_rank', cost: -1, desc: 'Requires a successful grab or hold on the target before the effect can be applied.' },
  { name: 'Inaccurate', category: 'Range & Targeting', type: 'flat_per_rank', cost: -1, hasRanks: true, desc: '-2 attack check penalty with this power per rank.' },
  { name: 'Limited', category: 'Limitations', type: 'per_rank', cost: -1, hasConfig: true, desc: 'Only effective in specific circumstances or against certain targets (e.g. Only vs Metal, Only in Sunlight).' },
  { name: 'Noticeable', category: 'Limitations', type: 'flat', cost: -1, desc: 'Power has an unmistakable, obvious visual, sonic, or olfactory tell that cannot be disguised.' },
  { name: 'Permanent', category: 'Action & Activation', type: 'per_rank', cost: 0, desc: 'Continuous duration, cannot be deactivated at will, and cannot be improved by extra effort.' },
  { name: 'Quirk', category: 'Limitations', type: 'flat', cost: -1, hasRanks: true, hasConfig: true, desc: 'Minor disadvantage, thematic restriction, or drawback (-1 PP flat).' },
  { name: 'Reduced Range', category: 'Range & Targeting', type: 'per_rank', cost: -1, desc: 'Shift range down one step (Perception -> Ranged -> Close).' },
  { name: 'Removable', category: 'Device', type: 'flat', cost: -1, hasConfig: true, desc: 'Power comes from equipment/item that can be taken away (-1 PP per 5 PP, or -2 per 5 for Easily Removable disarmable in combat).' },
  { name: 'Resistible', category: 'Limitations', type: 'per_rank', cost: -1, desc: 'Grants the target an extra resistance check (e.g., Dodge or Fortitude) to avoid or lessen the effect.' },
  { name: 'Sense-Dependent', category: 'Range & Targeting', type: 'per_rank', cost: -1, desc: 'Target must be able to perceive the effect with a specific sensory sense (sight, hearing, etc.).' },
  { name: 'Side Effect', category: 'Limitations', type: 'per_rank', cost: -1, desc: 'Failing a check or using the power triggers automatic negative backlash or damage to the user.' },
  { name: 'Tiring', category: 'Action & Activation', type: 'per_rank', cost: -1, desc: 'Using power causes a level of Fatigue, requiring recovery action or Extra Effort to withstand.' },
  { name: 'Uncontrolled', category: 'Limitations', type: 'per_rank', cost: -1, desc: 'GM or narrative circumstance dictates when the power triggers and manifests.' },
  { name: 'Unreliable', category: 'Limitations', type: 'per_rank', cost: -1, desc: '50% chance power fails to activate (roll 11+ on d20 required) or power has 5 uses per day.' }
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

  // Look up master definitions if cost/type missing
  const ref = EXTRAS.find(e => e.name === mod.name) || FLAWS.find(f => f.name === mod.name);
  if (ref) {
    if (mod.cost === undefined) mod.cost = ref.cost;
    if (mod.type === undefined) mod.type = ref.type;
    if (!mod.desc) mod.desc = ref.desc;
    if (!mod.category) mod.category = ref.category;
  }

  mod.ranks = Math.max(1, Number(mod.ranks) || 1);
  mod.cost = Number(mod.cost) || 0;
  mod.type = mod.type || 'per_rank';
  mod.config = mod.config || {};
  return mod;
}

/**
 * Normalizes an alternate effect (array slot).
 */
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
