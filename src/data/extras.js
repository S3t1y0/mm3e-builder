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
    "name": "Active",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Your summoned minions are active immediately upon summoning and do not suffer the Dazed condition, having a full set of actions each turn."
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
    "name": "Aquatic",
    "category": "Movement",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Flight"
    ],
    "desc": "Allows you to travel through water as easily as through the air, retaining your full flight speed underwater."
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
    "name": "Atomic",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Shrinking"
    ],
    "desc": "At Shrinking 20, allows you to shrink to atomic and subatomic scale, entering microscopic realms."
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
    "name": "Broad",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Weaken",
      "Nullify"
    ],
    "desc": "Allows the effect to target any trait within a broad set (e.g. all Abilities, all Mental traits) or counter effects matching a broad descriptor (e.g. all Magic, all Mutant, all Tech)."
  },
  {
    "name": "Change Direction",
    "category": "Movement",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "You can freely reorient your facing direction after teleporting, avoiding disorientation or landing facing the wrong way."
  },
  {
    "name": "Change Velocity",
    "category": "Movement",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "You teleport \"at rest\" at your destination, shedding all kinetic momentum (e.g. teleporting out of a terminal velocity fall and landing safely)."
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
    "name": "Controlled",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Summoned minions have the Controlled condition and obey your telepathic or spoken instructions without reservation."
  },
  {
    "name": "Cumulative",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Affliction",
      "Mind Reading"
    ],
    "desc": "Allows degrees of failure to accumulate across repeated attacks against the same target, advancing through higher condition degrees instead of only keeping the highest result."
  },
  {
    "name": "Custom Extra",
    "category": "Utility",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank / flat",
    "hasRanks": true,
    "hasConfig": true,
    "hasCustomText": true,
    "allowMultiple": true,
    "customTextLabel": "Custom Extra Details",
    "customTextPlaceholder": "Specify custom extra name and rules effect...",
    "desc": "A custom Extra approved by the Gamemaster with customizable cost and mechanical or narrative effects."
  },
  {
    "name": "Damaging",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Move Object"
    ],
    "desc": "Allows your telekinetic or magnetic Move Object effect to inflict Damage directly like physical Strength, resisting with Toughness DC 15 + rank."
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
    "name": "Easy",
    "category": "Movement",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "You do not suffer the Dazed and Vulnerable conditions after performing an Extended Teleport."
  },
  {
    "name": "Effortless",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Nullify",
      "Mind Reading"
    ],
    "desc": "Retrying this effect after two or more degrees of failure does not require spending Extra Effort; you may retry freely on your next turn."
  },
  {
    "name": "Energizing",
    "category": "Defense & Recovery",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "Your Healing effect can recover Fatigued and Exhausted conditions (DC 10 effect check removes one degree) in addition to physical damage."
  },
  {
    "name": "Extended",
    "category": "Movement",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "Taking two move actions allows you to teleport an extraordinary distance equal to your effect rank + 8 on the Measurements Table (leaving you dazed and vulnerable for 1 round unless you have the Easy extra)."
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
    "name": "Extra Condition",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": true,
    "maxRanks": 2,
    "hasConfig": false,
    "appliesTo": [
      "Affliction"
    ],
    "desc": "Your Affliction imposes an additional condition per degree of failure (Rank 1: two conditions per degree; Rank 2: three conditions per degree)."
  },
  {
    "name": "Feature",
    "category": "Utility",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "hasCustomText": true,
    "allowMultiple": true,
    "customTextLabel": "Feature Specification",
    "customTextPlaceholder": "e.g. Internal Compass, Fur Coat, Integrated Flashlight...",
    "desc": "Adds a minor, situational utility or cosmetic benefit that does not duplicate an existing effect or advantage.\n\nEach rank costs 1 flat point and provides one distinct minor capability approved by the Gamemaster.",
    "configType": "text_note"
  },
  {
    "name": "Heroic",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": 2,
    "costDisplay": "+2 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Summoned creatures are treated as full non-player characters rather than minions, exempt from routine attack takedowns and minion failure rules."
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
    "name": "Horde",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Allows you to summon your maximum number of minions (with Multiple Minions) in a single standard action rather than one at a time."
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
    "name": "Improvised Weapon",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Move Object"
    ],
    "desc": "Provides the benefit of the Throwing Mastery or Improvised Weapon advantage to objects thrown or wielded via Move Object, adding +1 damage per rank (up to the series PL cap)."
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
    "name": "Mental Link",
    "category": "Minions & Summon",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Telepathic two-way communication link with your summoned minions, allowing you to issue mental commands at any distance."
  },
  {
    "name": "Metamorph",
    "category": "Utility",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per form",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Morph"
    ],
    "desc": "Each rank gives you an entirely different alternate character sheet / form configuration (equal to the campaign PP budget) that you can switch into when morphing."
  },
  {
    "name": "Movable",
    "category": "Utility",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Create"
    ],
    "desc": "Created objects can be moved telekinetically around the battlefield with effective Strength equal to your Create rank."
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
    "name": "Multiple Minions",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": 2,
    "costDisplay": "+2 per rank",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Each application doubles your summoned minion count: 1 rank = 2 minions, 2 ranks = 4 minions, 3 ranks = 8 minions, and so forth."
  },
  {
    "name": "No Conduit",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Remote Sensing"
    ],
    "desc": "Sensory hazards or flashbang attacks at the displaced sensing location cannot travel back through the conduit to affect you."
  },
  {
    "name": "Normal Strength",
    "category": "Utility",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Shrinking"
    ],
    "desc": "You retain your full Strength, speed, and physical capacity even while shrunk to minuscule size."
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
    "name": "Persistent",
    "category": "Defense & Recovery",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing",
      "Regeneration"
    ],
    "desc": "Allows your Healing or Regeneration effect to treat and recover damage or conditions inflicted by attacks with the Incurable modifier."
  },
  {
    "name": "Portal",
    "category": "Movement",
    "type": "per_rank",
    "cost": 2,
    "costDisplay": "+2 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "Opens a five-foot dimensional gateway between two points as a free action. Anyone stepping through is transported; maintained via concentration."
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
    "name": "Progressive",
    "category": "Combat",
    "type": "per_rank",
    "cost": 2,
    "costDisplay": "+2 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Affliction",
      "Weaken",
      "Insubstantial"
    ],
    "desc": "Causes the effect to intensify incrementally on each of the target's turns until they successfully make a resistance check. A failed check advances to the next degree or further reduces traits."
  },
  {
    "name": "Randomize",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Nullify"
    ],
    "desc": "Rather than being countered, targeted effects acquire the Uncontrolled flaw and activate erratically at the GM's discretion."
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
    "name": "Redirect",
    "category": "Defense & Recovery",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Deflect",
      "Immunity"
    ],
    "desc": "Allows you to redirect an attack you successfully deflect toward any target within the attack's normal range as a free action."
  },
  {
    "name": "Reflect",
    "category": "Defense & Recovery",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Deflect",
      "Immunity"
    ],
    "desc": "Allows you to reflect an attack back at the original attacker as a free reaction if your active defense check exceeds the attacker's attack roll."
  },
  {
    "name": "Restorative",
    "category": "Defense & Recovery",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "Restores power points removed by Weaken effects. An effect check removes points equal to the check result minus 10."
  },
  {
    "name": "Resurrection",
    "category": "Defense & Recovery",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "Restores life to deceased subjects who have been dead for fewer minutes than your Healing rank (DC 20 check; success stabilizes and revives the target)."
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
    "name": "Sacrifice",
    "category": "Minions & Summon",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Summon"
    ],
    "desc": "When hit by an effect requiring a resistance check, you can spend a Hero Point / Victory Point to shift the attack to a nearby minion instead."
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
    "name": "Sensory Link",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading"
    ],
    "desc": "Taps into the target's senses, allowing you to see, hear, and feel what the target experiences."
  },
  {
    "name": "Simultaneous",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Weaken",
      "Nullify",
      "Remote Sensing"
    ],
    "desc": "Affects all traits within a broad set simultaneously with a single check, counters all effects of a descriptor at once, or allows you to perceive both your physical body and remote sensor location at the same time."
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
    "name": "Stabilize",
    "category": "Defense & Recovery",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "You automatically stabilize a dying character as a standard action without needing to roll an effect check."
  },
  {
    "name": "Stationary",
    "category": "Utility",
    "type": "flat",
    "cost": 0,
    "costDisplay": "0 flat points",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Create"
    ],
    "desc": "Created objects can hang completely immobile in midair, defying gravity and resisting movement with effective Strength equal to their Toughness rank."
  },
  {
    "name": "Strength-based",
    "category": "Combat",
    "type": "flat",
    "cost": 0,
    "costDisplay": "0 flat points",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Damage"
    ],
    "desc": "Adds your Strength damage rank to this Damage effect. Total damage rank equals your Strength rank plus the power rank, subject to campaign Power Level limits."
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
    "name": "Tether",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Create"
    ],
    "desc": "You maintain a physical tether or connection to your created objects, allowing you to anchor or pull them using your own Strength."
  },
  {
    "name": "Triggered",
    "category": "Duration & Action",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "hasCustomText": true,
    "allowMultiple": true,
    "customTextLabel": "Trigger Condition",
    "customTextPlaceholder": "e.g. Proximity within 10 ft, Pressure plate, Command word...",
    "desc": "Sets an effect to activate automatically when a specific trigger condition occurs (such as proximity, touch, or a timer).\n\nCosts 1 flat PP per trigger instance. You can reset a spent trigger as a standard action."
  },
  {
    "name": "Turnabout",
    "category": "Movement",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "Allows you to teleport to a target, perform a standard action (e.g. an attack), and teleport back to your starting position in a single round, provided total distance is within range."
  },
  {
    "name": "Variable Descriptor",
    "category": "Utility",
    "type": "flat",
    "cost": 1,
    "costDisplay": "1-2 flat points",
    "hasRanks": false,
    "hasConfig": true,
    "hasCustomText": true,
    "customTextLabel": "Available Descriptors",
    "customTextPlaceholder": "e.g. Fire, Cold, Electricity, Acid...",
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
  },
  {
    "name": "Variable Type",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Allows summoning different types of minions rather than identical copies.",
    "options": [
      {
        "id": "general",
        "label": "General Type (+1/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "+1 PP/Rank: Specific category (e.g. canines, zombies, robots)."
      },
      {
        "id": "broad",
        "label": "Broad Type (+2/Rank)",
        "cost": 2,
        "type": "per_rank",
        "desc": "+2 PP/Rank: Broad category (e.g. all animals, all demons, all humanoids)."
      }
    ]
  }
,
  {
    "name": "Accurate (Destination)",
    "category": "Movement",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "You do not need to know or accurately sense your destination to teleport there, just be able to generally describe it (e.g., 'inside the capitol building lobby' or 'atop the Emerald Tower’s roof'). If the destination isn’t in your Teleport range, nothing happens."
  },
  {
    "name": "Concentration (Maintained Effect)",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Affliction",
      "Weaken",
      "Nullify"
    ],
    "desc": "Once you have hit with a Concentration effect, so long as you continue to take a standard action each round to concentrate, the subject makes an additional resistance check against the effect on your turn without requiring a new attack roll."
  },
  {
    "name": "Continuous (Permanent State)",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Create",
      "Extra Limbs",
      "Flight",
      "Insubstantial",
      "Move Object"
    ],
    "desc": "Extends duration to continuous (+1 cost per rank). For Create, objects remain until destroyed or nullified. For Flight, you remain aloft even when incapacitated. For Insubstantial, Extra Limbs, or Move Object, the effect persists without conscious maintenance."
  },
  {
    "name": "Sustained (Toggleable)",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Extra Limbs",
      "Immunity"
    ],
    "desc": "Converts a permanent or continuous effect into sustained (+0 cost per rank). This allows you to turn the effect on and off at will and improve it using extra effort."
  },
  {
    "name": "Sustained (Counter Suppression)",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Nullify"
    ],
    "desc": "Any countered effect is suppressed and cannot be reactivated while you maintain this effect as a free action each round."
  },
  {
    "name": "Rapid (Fast Transmission)",
    "category": "Sensory",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Communication"
    ],
    "desc": "Your communication occurs 10 times faster than normal speech per rank (speed rank -1 per rank). Excellent for high-speed digital broadcasts or telepathic data downloads."
  },
  {
    "name": "Projection",
    "category": "Utility",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Extra Limbs"
    ],
    "desc": "Your Extra Limbs are merely a projection of your power (such as psychic force, solid light, or shadow) rather than an extension of your physical body. Attacks cannot damage you through them."
  },
  {
    "name": "Action (Move Action)",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "Reduces the action required to use Healing from a standard action to a move action (+1 cost per rank)."
  },
  {
    "name": "Action (Accelerated Reconfig)",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": 3,
    "costDisplay": "+3 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Variable"
    ],
    "desc": "You can change the configuration of your Variable effect faster: +1 cost per rank for a move action, +2 cost per rank for a free action, or +3 cost per rank for a reaction."
  },
  {
    "name": "Perception (No Attack Check)",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing",
      "Move Object",
      "Variable"
    ],
    "desc": "Applied to a Ranged effect: it does not require an attack check and can affect any subject or object you can accurately perceive within range."
  },
  {
    "name": "Ranged (Remote Touch)",
    "category": "Range & Area",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing",
      "Immunity",
      "Variable"
    ],
    "desc": "Extends a Close or Personal (Affects Others) effect to Ranged (requires a ranged attack check to hit an unwilling target, or touches an ally at distance)."
  },
  {
    "name": "Ranged (Remote Burrowing)",
    "category": "Range & Area",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "options": [
      {
        "id": "ranged",
        "label": "Ranged (+1 PP/Rank)",
        "cost": 1,
        "type": "per_rank",
        "desc": "Create tunnels at distance (Standard range)."
      },
      {
        "id": "perception",
        "label": "Perception (+2 PP/Rank)",
        "cost": 2,
        "type": "per_rank",
        "desc": "Create tunnels anywhere accurately perceived."
      }
    ],
    "appliesTo": [
      "Burrowing"
    ],
    "desc": "Allows you to create tunnels at a distance without having to travel through them yourself."
  },
  {
    "name": "Ranged (Sensory Projection)",
    "category": "Range & Area",
    "type": "per_rank",
    "cost": 2,
    "costDisplay": "+2 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Senses"
    ],
    "desc": "Applies to Senses with Affects Others, extending the range at which you can bestow senses onto allies from Close to Ranged (+2 cost per rank)."
  },
  {
    "name": "Independent",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Illusion"
    ],
    "desc": "Your active illusions only require a free action to maintain and change, rather than a standard action each round."
  },
  {
    "name": "Luck (Bonus Ranks)",
    "category": "Utility",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Luck Control"
    ],
    "desc": "Each rank in this extra gives you the benefit of a rank in the Luck advantage, expanding your pool of rerolls."
  },
  {
    "name": "Permanent (Inherent Trait)",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Growth"
    ],
    "desc": "Growth is permanent, innate, and cannot be deactivated. Typical for naturally giant species, colossi, and towering automatons."
  },
  {
    "name": "Attack (Force Insubstantial)",
    "category": "Combat",
    "type": "per_rank",
    "cost": 1,
    "costDisplay": "+1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Insubstantial"
    ],
    "desc": "Allows turning another character insubstantial as an offensive attack (close attack check resisted by Dodge or Fortitude)."
  },
  {
    "name": "Improvised Weapon (TK)",
    "category": "Combat",
    "type": "flat_per_rank",
    "cost": 1,
    "costDisplay": "1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Move Object"
    ],
    "desc": "You are adept at using objects as weapons with telekinesis. Each rank gives the equivalent of a rank of Throwing Mastery or Improvised Weapon."
  }
];
