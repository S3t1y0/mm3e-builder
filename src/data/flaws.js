export const FLAWS = [
  {
    "name": "Activation",
    "category": "Action & Activation",
    "type": "flat",
    "cost": -1,
    "costDisplay": "-1-2 flat points",
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
    "name": "Attitude",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "appliesTo": [
      "Summon"
    ],
    "desc": "Summoned creatures are not inherently obedient.",
    "options": [
      {
        "id": "indifferent",
        "label": "Indifferent (-1/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "-1 PP/Rank: Minions are indifferent; must persuade them to help."
      },
      {
        "id": "unfriendly",
        "label": "Unfriendly (-2/Rank)",
        "cost": -2,
        "type": "per_rank",
        "desc": "-2 PP/Rank: Minions are hostile or unfriendly; dangerous to summon."
      }
    ]
  },
  {
    "name": "Blending",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Concealment"
    ],
    "desc": "Your Concealment only works while stationary or moving at half speed or less, blending against backgrounds."
  },
  {
    "name": "Check Required",
    "category": "Limitations",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "-1 flat per rank",
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
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Reduces the duration step of an effect (such as sustained to concentration). You must spend a standard action each round to maintain it.\n\nIf you take any other standard action or are stunned, the effect immediately ends."
  },
  {
    "name": "Custom Flaw",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank / flat",
    "hasRanks": true,
    "hasConfig": true,
    "hasCustomText": true,
    "allowMultiple": true,
    "customTextLabel": "Custom Flaw Drawback",
    "customTextPlaceholder": "Specify custom drawback and mechanical limitation...",
    "desc": "A custom Flaw approved by the Gamemaster with customizable cost reduction and mechanical drawback."
  },
  {
    "name": "Diminished Range",
    "category": "Range & Targeting",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "-1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "desc": "Reduces the range increments of a ranged effect. Short range becomes 5 ft per rank, medium 10 ft, and maximum 25 ft per rank.\n\nEach rank of Diminished Range reduces the effect's total cost by -1 flat point."
  },
  {
    "name": "Distracting",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Using this effect requires intense focus, leaving you vulnerable (halving your active defenses Dodge and Parry) until your next turn.\n\nThis flaw reduces the cost of the effect by -1 PP/Rank."
  },
  {
    "name": "Empathic",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "When you heal damage or conditions from another subject, you suffer those same damage conditions yourself."
  },
  {
    "name": "Fades",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "The effect loses 1 rank of potency each round or use until it reaches rank 0.\n\nYou must spend time recharging, resting, or satisfying a condition to restore the effect to full rank."
  },
  {
    "name": "Feedback",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "You suffer damage whenever the manifestations of your power (such as a projected illusion, duplicate, or sensory probe) are attacked.\n\nYou must make a Toughness resistance check against attacks directed at the manifested power."
  },
  {
    "name": "Full Power",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Leaping"
    ],
    "desc": "You can only jump your maximum possible leap distance whenever you use this power."
  },
  {
    "name": "Gliding",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Flight"
    ],
    "desc": "You fly by gliding on air currents, descending at least 1 rank of distance for every rank traveled forward."
  },
  {
    "name": "Grab-Based",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "The effect can only be used on a target you have successfully grabbed or restrained.\n\nIf the grab attempt fails or the target escapes, the effect cannot be applied."
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
  },
  {
    "name": "Increased Action",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1-3 per rank",
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
    "name": "Instant Recovery",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Affliction"
    ],
    "desc": "Target instantly recovers from all inflicted conditions as soon as the effect stops being applied or concentration breaks."
  },
  {
    "name": "Levitation",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Flight"
    ],
    "desc": "You can only ascend or descend straight vertically; you cannot propel yourself horizontally using this flight power."
  },
  {
    "name": "Limited",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "hasCustomText": true,
    "allowMultiple": true,
    "customTextLabel": "Limitation Condition",
    "customTextPlaceholder": "e.g. Only against metals/machines, Only in direct sunlight...",
    "desc": "The effect only functions under specific, restricted circumstances or against a limited class of targets (e.g., only against metal, only in direct sunlight).\n\nThe limitation must remove about half of the effect's usual utility to qualify for this -1 PP/Rank flaw.",
    "configType": "text_note"
  },
  {
    "name": "Limited by Language",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading"
    ],
    "desc": "You can only understand thoughts, memories, or internal monologues if you share a common language with the subject."
  },
  {
    "name": "Limited Degree",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": true,
    "maxRanks": 2,
    "hasConfig": false,
    "appliesTo": [
      "Affliction"
    ],
    "desc": "The Affliction can inflict fewer degrees of failure. Rank 1 limits to at most two degrees of failure (third degree eliminated); Rank 2 limits to only one degree of failure (second and third degrees eliminated)."
  },
  {
    "name": "Limited Direction",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Move Object"
    ],
    "desc": "You can only move objects in a single fixed direction or vector (e.g. only pushing away, or only pulling toward yourself)."
  },
  {
    "name": "Limited Material",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Move Object"
    ],
    "desc": "You can only manipulate a specific material or substance (e.g. only ferrous metals, only crystalline solids, only liquids)."
  },
  {
    "name": "Limited to Emotions",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading"
    ],
    "desc": "You can only perceive emotional states and visceral reactions, not coherent language, thoughts, or memories."
  },
  {
    "name": "Limited to Extended",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport"
    ],
    "desc": "Requires the Extended extra. You cannot perform short-range tactical teleports; you can only make two-action extended teleports."
  },
  {
    "name": "Limited to Half Effect",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Immunity"
    ],
    "desc": "Grants half-effect resistance (+5 circumstance bonus or half damage taken) instead of complete immunity."
  },
  {
    "name": "Limited to Surface Thoughts",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading"
    ],
    "desc": "You can only detect immediate surface thoughts; you cannot probe deeper memories or subconscious secrets."
  },
  {
    "name": "Medium",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Teleport",
      "Remote Sensing"
    ],
    "desc": "You require a physical medium to travel or sense through (e.g. electrical cables, shadow conduits, mirror surfaces, water mains)."
  },
  {
    "name": "Noticeable",
    "category": "Limitations",
    "type": "flat",
    "cost": -1,
    "costDisplay": "-1 flat point",
    "hasRanks": false,
    "hasConfig": true,
    "hasCustomText": true,
    "customTextLabel": "Tell / Manifestation",
    "customTextPlaceholder": "e.g. Skin turns bright gold, Loud turbine roar...",
    "desc": "A continuous or permanent effect has an obvious, undeniable physical sign that gives it away (such as glowing skin, hum, or stony bulk).\n\nCosts -1 flat point and prevents the effect from ever being subtle or concealed."
  },
  {
    "name": "Partial",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Concealment"
    ],
    "desc": "Provides partial concealment (+2 circumstance bonus to defense) rather than total concealment."
  },
  {
    "name": "Passive",
    "category": "Sensory & Mental",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Concealment"
    ],
    "desc": "Your Concealment shuts off immediately whenever you perform an attack or offensive action."
  },
  {
    "name": "Permanent",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "The effect cannot be turned off voluntarily and is always active. You cannot use extra effort or stunt alternate effects from it.\n\nCosts -1 PP/Rank and is only applied to sustained personal effects like Protection or Enhanced Traits."
  },
  {
    "name": "Platform",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Flight"
    ],
    "desc": "You ride an external platform, board, disk, or carpet that can be attacked, targeted, or knocked away from under your feet."
  },
  {
    "name": "Proportional",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Create"
    ],
    "desc": "The combined volume rank plus Toughness rank of created objects cannot exceed your Create effect rank."
  },
  {
    "name": "Quirk",
    "category": "Limitations",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "-1 flat per rank",
    "hasRanks": true,
    "hasConfig": true,
    "hasCustomText": true,
    "allowMultiple": true,
    "customTextLabel": "Quirk Drawback",
    "customTextPlaceholder": "e.g. Only while screaming, Emits loud hum, Leaves glowing footprints...",
    "desc": "A minor nuisance, cosmetic flaw, or situational drawback that is slightly inconvenient but less severe than a Complication.\n\nEach Quirk reduces the effect's cost by -1 flat point.",
    "configType": "text_note"
  },
  {
    "name": "Reduced Range",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1-2 per rank",
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
    "costDisplay": "-1-2/5 flat points",
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
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "hasCustomText": true,
    "customTextLabel": "Resistance Defense Check",
    "customTextPlaceholder": "e.g. Will defense, Fortitude check...",
    "desc": "Adds an additional resistance check (or allows a check where none was previously allowed) to negate or halve the effect.\n\nFor example, a Teleport Attack might allow both a Dodge and Will check to escape."
  },
  {
    "name": "Sense-Dependent",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
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
    "costDisplay": "-1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "hasCustomText": true,
    "customTextLabel": "Side Effect Manifestation",
    "customTextPlaceholder": "e.g. User suffers Dazed condition on miss, electrical shock...",
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
    "name": "Slow",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Variable"
    ],
    "desc": "You can only reconfigure your Variable pool outside of combat/action encounters, requiring minutes or hours of dedicated laboratory, ritual, or workshop access."
  },
  {
    "name": "Source",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Regeneration"
    ],
    "desc": "You only regenerate when in direct physical contact with your designated source (e.g. natural sunlight, fresh blood, open electricity)."
  },
  {
    "name": "Temporary",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Healing"
    ],
    "desc": "Damage conditions are only suppressed temporarily for 1 hour, returning in full once the duration expires."
  },
  {
    "name": "Tiring",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "Using the power leaves you fatigued. You must spend extra effort or rest to recover from the exhaustion.\n\nIf you are already fatigued when using the power, you become exhausted, and then incapacitated."
  },
  {
    "name": "Uncontrolled",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "desc": "You have no direct influence over when or how the power manifests; its activation and targets are determined by the Gamemaster.\n\nReduces the cost of the effect by -1 PP/Rank."
  },
  {
    "name": "Unreliable",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
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
    "name": "Wings",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Flight"
    ],
    "desc": "Flight relies on physical wings that require open clearance to spread and can be fouled, bound, or pinned."
  }
,
  {
    "name": "Sustained (Force Field)",
    "category": "Defense & Recovery",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Protection"
    ],
    "desc": "Your Protection is a sustained effect rather than permanent. It can be turned on/off, maintained with free action, and improved with extra effort, but drops if you become stunned or incapacitated."
  },
  {
    "name": "Type (Restricted Group)",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -2,
    "costDisplay": "-2 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Comprehend"
    ],
    "desc": "You can only comprehend a broad type of subject (such as only elves, only canines, only avians, or only insectoid machines)."
  },
  {
    "name": "Reduced Trait",
    "category": "Limitations",
    "type": "flat_per_rank",
    "cost": -1,
    "costDisplay": "-1 flat per rank",
    "hasRanks": true,
    "hasConfig": false,
    "appliesTo": [
      "Enhanced Trait"
    ],
    "desc": "One or more of your traits is lowered while others are enhanced (e.g. gaining Enhanced Strength lowers Agility by the same amount). Gives -1 PP per rank of reduced trait."
  },
  {
    "name": "Limited to One Subject",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Illusion"
    ],
    "desc": "Only a single subject at a time can perceive your Illusion."
  },
  {
    "name": "Absent Strength",
    "category": "Limitations",
    "type": "flat",
    "cost": -1,
    "costDisplay": "-1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Insubstantial"
    ],
    "desc": "Applies only to Rank 1 Insubstantial (Fluid form). Removes your effective Strength while in liquid form, preventing physical manipulation."
  },
  {
    "name": "Acrobatics Check Required",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Leaping"
    ],
    "desc": "In order to use Leaping, you must make an Acrobatics skill check (DC 10). Each point your check exceeds 10 provides 1 rank of your Leaping effect."
  },
  {
    "name": "Action (Standard Action)",
    "category": "Action & Activation",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Luck Control"
    ],
    "desc": "Increases the action required for Luck Control from a reaction to a standard action, drastically limiting when it can be used."
  },
  {
    "name": "Ranged (Attack Check Required)",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading",
      "Luck Control",
      "Illusion"
    ],
    "desc": "Reduces normally Perception-range power to Ranged, requiring a ranged attack check to hit in addition to normal defense/resistance."
  },
  {
    "name": "Close (Touch Range Only)",
    "category": "Range & Targeting",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading",
      "Move Object"
    ],
    "desc": "Reduces range to Close. For Mind Reading, you must touch the subject. For Move Object, you can only move objects within physical reach (tactile telekinesis)."
  },
  {
    "name": "Limited to Sensory Link",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Mind Reading"
    ],
    "desc": "You can only tap into a subject's senses with Sensory Link, but cannot read surface thoughts or probe memories."
  },
  {
    "name": "Limited to One Type",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Quickness"
    ],
    "desc": "Your Quickness applies to only physical tasks or only mental tasks, not both."
  },
  {
    "name": "Limited to One Task",
    "category": "Limitations",
    "type": "per_rank",
    "cost": -2,
    "costDisplay": "-2 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Quickness"
    ],
    "desc": "Your Quickness applies to only one particular task, such as reading, mathematical calculations, drawing, or typing."
  },
  {
    "name": "Permanent (Cannot Dismiss)",
    "category": "Duration & Action",
    "type": "per_rank",
    "cost": 0,
    "costDisplay": "+0 per rank",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Create",
      "Enhanced Trait",
      "Insubstantial"
    ],
    "desc": "The effect is permanent and cannot be dismissed voluntarily. Created objects are permanent real matter; Enhanced Traits cannot be turned off; Insubstantial form is permanent."
  },
  {
    "name": "Noticeable",
    "category": "Limitations",
    "type": "flat",
    "cost": -1,
    "costDisplay": "-1 flat point",
    "hasRanks": false,
    "hasConfig": false,
    "appliesTo": [
      "Remote Sensing",
      "Senses"
    ],
    "desc": "The power has a noticeable trait that cannot be hidden or disguised (e.g. glowing eyes, a buzzing mystical drone, or visible sensory conduit)."
  },
  {
    "name": "Attitude",
    "category": "Minions & Summon",
    "type": "per_rank",
    "cost": -1,
    "costDisplay": "-1-2 per rank",
    "hasRanks": false,
    "hasConfig": true,
    "options": [
      {
        "id": "indifferent",
        "label": "Indifferent (-1 PP/Rank)",
        "cost": -1,
        "type": "per_rank",
        "desc": "Summoned minion is indifferent to you (-1 PP/Rank)."
      },
      {
        "id": "unfavorable",
        "label": "Unfavorable / Hostile (-2 PP/Rank)",
        "cost": -2,
        "type": "per_rank",
        "desc": "Summoned minion is hostile/unfavorable to you (-2 PP/Rank)."
      }
    ],
    "appliesTo": [
      "Summon"
    ],
    "desc": "Summoned minions are less cooperative than normal, requiring social interaction or checks to command."
  }
];
