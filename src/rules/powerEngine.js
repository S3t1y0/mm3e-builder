// js/rules/powerEngine.js
import { ADVANTAGES } from './advantages.js';
/**
 * Mutants & Masterminds 3e Power Engine
 * Official D20 Hero System Power Rules, Fractional Costs, Array Budgets,
 * Device / Removable Discounts, and Combat Metrics with PL Cap Compliance.
 */

export const EFFECT_CATEGORIES = [
  'All',
  'Attack',
  'Control',
  'Defense',
  'General',
  'Movement',
  'Sensory'
];

export const BASE_EFFECTS = [
  { name: 'Affliction', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'You can impose some debilitating condition or conditions on a target by making a close attack. You set the conditions your Affliction inflicts at each of three degrees of failure (Fortitude or Will vs DC 10 + rank). First degree causes conditions like Dazed, Hindered, or Fatigued; second degree causes Compelled, Defenseless, Disabled, Exhausted, Immobile, or Stunned; third degree causes Asleep, Controlled, Incapacitated, Paralyzed, or Transformed.' },
  { name: 'Blast', category: 'Attack', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'You can make a damaging ranged attack. It might be a blast of energy, a projectile (arrow, bullet, throwing blade, etc.), or some similar effect. You make a ranged attack check against the target’s Dodge defense. The attack’s damage equals your power rank and the target makes a Toughness resistance check against it.' },
  { name: 'Burrowing', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can burrow through the ground, leaving a tunnel behind if you choose. You move through soil and sand at a speed rank equal to your Burrowing rank, minus 5. So Burrowing 8, for example, lets you move through the ground at speed rank 3 (around 16 MPH). Burrowing through hard clay and packed earth reduces speed one additional rank. Burrowing through solid rock reduces it by two additional ranks. The tunnel you leave behind is either permanent or collapses behind you immediately (your choice when you begin burrowing each new tunnel). Note that Burrowing differs from the Permeate effect of Movement, which allows you to pass through an obstacle like the ground at your normal speed without disturbing it at all.' },
  { name: 'Communication', category: 'Sensory', cost: 4, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'You can communicate over a distance using a medium other than your normal voice (such as mental telepathy, radio frequencies, mystical sendings, or ultrasonic signals) across distances determined by your rank on the Measurements Table.' },
  { name: 'Comprehend', category: 'Sensory', cost: 2, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You can comprehend different sorts of communication. Each rank in this effect allows you to understand, speak, or read foreign languages, communicate with animals, plants, machines, or spirits, or understand all spoken concepts.' },
  { name: 'Concealment', category: 'Sensory', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You gain total concealment from a particular sense while this effect is active, making you undetectable to that sense and providing total concealment (+5 circumstance bonus to active defense against attacks relying on that sense). Two ranks grant concealment for an entire sense type.' },
  { name: 'Create', category: 'Control', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Sustained', desc: 'You can form solid objects essentially out of nowhere. They may be made of solidified energy, “hardened” water or air, transmuted bulk matter, ice, stone, or some other medium, depending on the effect’s descriptors. You can form any simple geometric shape or common object (such as a cube, sphere, dome, hammer, lens, disk, etc.). The GM has final say on whether or not a particular object is too complex for this effect. Generally, your objects can’t have any moving parts more complex than a hinge. They can be solid or hollow, opaque or transparent, as you choose when you use the effect, limited by your descriptors and the Gamemaster’s judgment.' },
  { name: 'Damage', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'You can inflict damage on a target by making a close attack. The exact nature of your Damage is up to you (from powerful kinetic impacts to razor claws, fire, or energy fields). The target resists with a Toughness check against DC 15 + Damage rank to resist bruised penalties (-1 to further checks), dazed, staggered, and incapacitated conditions.' },
  { name: 'Deflect', category: 'Defense', cost: 1, range: 'Ranged', action: 'Standard', duration: 'Instant', desc: 'You can actively defend for characters other than yourself, deflecting or diverting ranged attacks directed at allies within range using active defense checks with a d20 roll, and may be able to more effectively defend yourself depending on your rank.' },
  { name: 'Elongation', category: 'General', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can elongate your body and/or limbs to extend your reach. Add your effect rank to your normal size rank to determine how far you can elongate; for a normalsized human (size rank -2) this is 15 feet at rank 1, 30 feet at rank 2, and so forth. Rank 20 Elongation can stretch 1,000 miles! “Snapping back” to your normal shape is a free action. You can use Elongation to make “close” attacks at a greater distance by elongating your limbs. Once elongated, you can make melee attacks within your new reach as a standard action. If you can’t accurately sense your target (you’re elongating around a corner, for example), apply the rules for concealment.' },
  { name: 'Enhanced Trait', category: 'General', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can temporarily improve one of your existing traits, chosen when you take this effect. While this effect is active, you increase the affected trait by its rank. So, for example, Enhanced Strength 5 increases your Strength by +5 while it is active. Your enhanced trait is still subject to power level limits, so your unenhanced rank must be below the limit by at least the amount of the enhancement to accommodate it. The cost of Enhanced Trait is the same per rank as acquiring a rank in the affected trait. The key differences are that Enhanced Trait is a power effect, rather than a natural trait, and as an effect it can be combined with extra effort and other effects.' },
  { name: 'Environment', category: 'Control', cost: 2, range: 'Rank', action: 'Standard', duration: 'Sustained', desc: 'You can change the environment in an area: raising or lowering the temperature, creating intense light or darkness, causing rain, high winds, or impeditious terrain within a radius determined by your rank.' },
  { name: 'Extra Limbs', category: 'General', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You have one or more additional limbs or appendages (tails, tentacles, extra arms, prehensile hair), granting you an advantage when performing multiple manipulative tasks and a bonus on grab checks.' },
  { name: 'Feature', category: 'General', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'The Feature effect is intended for minor, cosmetic, or utilitarian superhuman abilities that have a negligible game effect, costing 1 point flat per rank (such as internal compass, fur coat, or mimicry).' },
  { name: 'Flight', category: 'Movement', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can fly through the air, including hovering in place. You have a flight speed rank equal to your effect rank.' },
  { name: 'Growth', category: 'General', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can temporarily increase your size, gaining increased Strength, Stamina, and reach, but becoming easier to hit and less stealthy. Every 4 ranks increases your size rank by 1 and grants commensurate physical bonuses.' },
  { name: 'Healing', category: 'General', cost: 2, range: 'Close', action: 'Standard', duration: 'Instant', desc: 'You can heal Damage conditions by touch. Make an effect check (DC 10); success removes one degree of damage from the subject (bruised penalty, dazed, or staggered). You can also stabilize dying subjects automatically as a standard action.' },
  { name: 'Illusion', category: 'Control', cost: 1, range: 'Perception', action: 'Standard', duration: 'Sustained', desc: 'You can project convincing sensory impressions (visual holographic images, phantom sounds, false scents, or tactile sensations) into an area. Targets observing the illusion make an Insight check to recognize it as false.' },
  { name: 'Immortality', category: 'Defense', cost: 2, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You can recover from death! If your character is killed, you return to life after a period of time determined by your Immortality rank (from days at rank 1 to mere minutes or rounds at high ranks).' },
  { name: 'Immunity', category: 'Defense', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You are completely immune to certain effects, hazards, or conditions, ranging from environmental heat/cold and disease/poison (1-2 ranks) to life support, critical hits, or broad damage descriptors (5 to 30 ranks).' },
  { name: 'Insubstantial', category: 'General', cost: 5, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can assume a less solid form: Rank 1 Fluid (flow through openings), Rank 2 Gaseous (smoke/gas form), Rank 3 Energy (composed of coherent energy), or Rank 4 Incorporeal (completely intangible ghost, immune to physical damage).' },
  { name: 'Leaping', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Instant', desc: 'You can make prodigious leaps, far beyond normal human capability. Add your effect rank to your normal jumping distance rank to determine how far you can leap as a move action.' },
  { name: 'Luck Control', category: 'Control', cost: 3, range: 'Perception', action: 'Reaction', duration: 'Instant', desc: 'You can manipulate probability and luck in your favor or to the detriment of opponents, spending Victory Points to force re-rolls, negate unluck, or grant luck benefits to allies.' },
  { name: 'Mind Reading', category: 'Sensory', cost: 2, range: 'Perception', action: 'Standard', duration: 'Sustained', resistance: 'Will', desc: 'You can read another character’s mind via an opposed effect check against the target’s Will defense. Degrees of success allow you to read surface thoughts, probe memories, or uncover deepest subconscious secrets.' },
  { name: 'Morph', category: 'General', cost: 5, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can alter your cosmetic appearance, gaining a +20 circumstance bonus to Deception checks to disguise yourself. Ranks determine whether you can assume a single form, narrow group, broad category, or any form of equal mass.' },
  { name: 'Move Object', category: 'Control', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Sustained', desc: 'You can move objects at a distance without touching them (telekinetically or magnetically). Your effective Strength for lifting and throwing objects is equal to your rank on the Measurements Table.' },
  { name: 'Movement', category: 'Movement', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You have special superhuman modes of locomotion. Each rank allows choosing options such as Dimension Travel, Environmental Adaptation, Permeate, Safe Fall, Slithering, Space Travel, Trackless, Wall-crawling, or Water Walking.' },
  { name: 'Nullify', category: 'Attack', cost: 1, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Will', desc: 'You can counter and shut down active powers matching a designated descriptor (such as fire, magical, or mental effects) via an opposed power check against the target’s power rank or Will check.' },
  { name: 'Protection', category: 'Defense', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'Protection shields you against damage, giving you +1 to your Toughness defense per rank. An active defense modifier or descriptor (such as armor, force fields, or mystic barriers) explains how this protection operates.' },
  { name: 'Quickness', category: 'General', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can perform routine physical or mental tasks at superhuman speed. Subtract your effect rank from the normal time rank to perform routine tasks (research, assembly, repairs, reading) in fractions of a second.' },
  { name: 'Regeneration', category: 'Defense', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You recover quickly from damage automatically without rest. Remove bruised penalties and recover from staggered/incapacitated damage conditions at an accelerated rate determined by your rank.' },
  { name: 'Remote Sensing', category: 'Sensory', cost: 1, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'You can displace one or more of your senses over a distance, perceiving as if you were physically present at that distant location without crossing the intervening space.' },
  { name: 'Senses', category: 'Sensory', cost: 1, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'One or more of your sensory faculties are superhumanly enhanced or expanded beyond the normal five senses (such as Darkvision, Infravision, Acute Scent, Radar, Tremorsense, or Danger Sense).' },
  { name: 'Shrinking', category: 'General', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can temporarily decrease your size, becoming smaller, harder to see, and harder to hit (+active defenses and +Stealth bonuses) at the cost of reduced Strength and ground movement speed.' },
  { name: 'Speed', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can run and move overland faster than normal human limits, with your ground speed rank equal to your effect rank on the Measurements Table.' },
  { name: 'Summon', category: 'Control', cost: 2, range: 'Close', action: 'Standard', duration: 'Sustained', desc: 'You can call upon another creature (a minion) to aid you. This creature is created as an independent character with (effect rank × 15) character points, limited to a Power Level equal to the Summon rank. You summon your minion automatically as a standard action in an open space beside you.' },
  { name: 'Swimming', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can swim effortlessly through water at high speed, with a water speed rank equal to your Swimming rank minus 2.' },
  { name: 'Teleport', category: 'Movement', cost: 2, range: 'Personal', action: 'Move', duration: 'Instant', desc: 'You can move instantly from place to place without crossing the distance in between, transporting yourself and carrying mass based on your rank on the Measurements Table as a move action.' },
  { name: 'Transform', category: 'Control', cost: 2, range: 'Close', action: 'Standard', duration: 'Sustained', desc: 'You can change objects into other objects, altering their shape or material composition in the process. You must touch the chosen object (requiring a close attack check if held or worn). Transmuted objects remain in their new form until changed back or dispelled.' },
  { name: 'Variable', category: 'General', cost: 7, range: 'Personal', action: 'Standard', duration: 'Sustained', desc: 'You can gain or use potentially any effect of the appropriate type and descriptor! A Variable effect provides you with a pool of (rank × 5) character points you can allocate to different effects matching your theme, subject to normal power level limits.' },
  { name: 'Weaken', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'You can temporarily lower one of a target’s traits (an Ability, Defense, or Power effect), chosen when this effect is acquired. You touch the target with a close attack check. The target makes a Fortitude or Will resistance check vs DC 10 + Weaken rank. Each degree of failure lowers the chosen trait by 1 point, which recovers at a rate of 1 point per round.' }
];

export const CONFIGURABLE_EFFECTS = {
  'Illusion': {
    type: 'senses_multiselect',
    label: 'Sensory Impressions Affected',
    senses: [
      { id: 'Visual', name: 'Visual (Sight)', icon: 'ri-eye-line', desc: 'Creates optical and holographic imagery' },
      { id: 'Auditory', name: 'Auditory (Hearing)', icon: 'ri-volume-up-line', desc: 'Creates phantom voices, sounds, and acoustics' },
      { id: 'Olfactory', name: 'Olfactory & Gustatory', icon: 'ri-drop-line', desc: 'Creates scents, smells, and taste sensations' },
      { id: 'Tactile', name: 'Tactile (Touch)', icon: 'ri-hand-coin-line', desc: 'Creates physical texture, temperature, and touch impressions' },
      { id: 'Mental', name: 'Mental (Psychic)', icon: 'ri-brain-line', desc: 'Creates telepathic impressions directly in minds' }
    ],
    defaultSenses: ['Visual'],
    computeCost: (config) => {
      const count = Array.isArray(config?.senses) && config.senses.length > 0 ? config.senses.length : 1;
      return count; // 1 to 5 PP/Rank
    }
  },

  'Enhanced Trait': {
    type: 'trait_picker',
    label: 'Enhanced Trait Category & Target',
    categories: {
      abilities: {
        id: 'abilities',
        label: 'Ability (+2 PP/Rank)',
        cost: 2,
        costDisplay: '2 PP/Rank',
        traits: ['Strength', 'Agility', 'Fighting', 'Awareness', 'Stamina', 'Dexterity', 'Intellect', 'Presence']
      },
      defenses: {
        id: 'defenses',
        label: 'Defense (+1 PP/Rank)',
        cost: 1,
        costDisplay: '1 PP/Rank',
        traits: ['Dodge', 'Parry', 'Fortitude', 'Toughness', 'Will']
      },
      skills: {
        id: 'skills',
        label: 'Skill (+1 PP / 2 Ranks)',
        cost: 0.5,
        costDisplay: '1 PP per 2 Ranks',
        traits: [
          'Acrobatics', 'Athletics', 'Close Combat', 'Deception', 'Expertise',
          'Insight', 'Intimidation', 'Investigation', 'Perception', 'Persuasion',
          'Ranged Combat', 'Sleight of Hand', 'Stealth', 'Technology', 'Treatment', 'Vehicles'
        ]
      },
      advantages: {
        id: 'advantages',
        label: 'Advantage (+1 PP/Rank)',
        cost: 1,
        costDisplay: '1 PP/Rank',
        traits: ADVANTAGES.map(a => a.name)
      }
    },
    defaultCategory: 'abilities',
    defaultTrait: 'Strength',
    computeCost: (config) => {
      const cat = config?.traitCategory || 'abilities';
      if (cat === 'defenses') return 1;
      if (cat === 'advantages') return 1;
      if (cat === 'skills') return 0.5;
      return 2; // abilities
    }
  },

  'Affliction': {
    type: 'affliction_builder',
    label: 'Resistance Check & Degrees of Failure',
    resistanceOptions: ['Fortitude', 'Will'],
    defaultResistance: 'Fortitude',
    firstDegree: ['Dazed', 'Fatigued', 'Hindered', 'Impaired', 'Vulnerable', 'Entranced'],
    secondDegree: ['Compelled', 'Defenseless', 'Disabled', 'Exhausted', 'Immobile', 'Prone', 'Stunned'],
    thirdDegree: ['Asleep', 'Blind', 'Controlled', 'Deaf', 'Incapacitated', 'Paralyzed', 'Transformed', 'Unaware'],
    presets: [
      { id: 'stun', name: 'Stun / Paralyze', first: 'Dazed', second: 'Stunned', third: 'Paralyzed', res: 'Fortitude' },
      { id: 'sleep', name: 'Sleep / Sedative', first: 'Fatigued', second: 'Exhausted', third: 'Asleep', res: 'Fortitude' },
      { id: 'mind_control', name: 'Mind Control', first: 'Dazed', second: 'Compelled', third: 'Controlled', res: 'Will' },
      { id: 'entangle', name: 'Entangle / Snare', first: 'Hindered', second: 'Immobile', third: 'Incapacitated', res: 'Fortitude' },
      { id: 'sickness', name: 'Nausea / Poison', first: 'Impaired', second: 'Disabled', third: 'Incapacitated', res: 'Fortitude' },
      { id: 'terror', name: 'Terror / Fear', first: 'Entranced', second: 'Compelled', third: 'Incapacitated', res: 'Will' }
    ]
  },

  'Movement': {
    type: 'movement_multiselect_library',
    label: 'Movement Modes Library',
    modes: [
      { id: 'wall_crawling', name: 'Wall-crawling', maxRanks: 2, ranks: 1, desc: 'Climb walls and ceilings at -1 speed rank (Rank 1) or full speed (Rank 2)', icon: 'ri-footprint-line' },
      { id: 'safe_fall', name: 'Safe Fall', maxRanks: 1, ranks: 1, desc: 'Fall any distance without suffering damage or injury', icon: 'ri-parachute-line' },
      { id: 'water_walking', name: 'Water Walking', maxRanks: 1, ranks: 1, desc: 'Walk or run across liquid surfaces without sinking', icon: 'ri-drop-line' },
      { id: 'dimension_travel', name: 'Dimension Travel', maxRanks: 3, ranks: 1, desc: 'Travel across dimensions (Rank 1: single, 2: related, 3: any)', icon: 'ri-planet-line' },
      { id: 'env_adaptation', name: 'Environmental Adaptation', maxRanks: 1, ranks: 1, desc: 'Move without penalty in hostile environment (Aquatic, Zero-G, Cold, etc.)', icon: 'ri-shield-user-line' },
      { id: 'permeate', name: 'Permeate', maxRanks: 3, ranks: 1, desc: 'Pass through solid obstacles (Rank 1: speed -2, 2: speed -1, 3: full speed)', icon: 'ri-ghost-line' },
      { id: 'slithering', name: 'Slithering', maxRanks: 1, ranks: 1, desc: 'Move full speed while prone and squeeze through tight openings', icon: 'ri-drag-move-2-line' },
      { id: 'space_travel', name: 'Space Travel', maxRanks: 3, ranks: 1, desc: 'Fly through vacuum of space (Rank 1: solar system, 2: other star systems, 3: galaxies)', icon: 'ri-rocket-line' },
      { id: 'swinging', name: 'Swinging', maxRanks: 1, ranks: 1, desc: 'Swing through city or forest obstacles at normal movement speed', icon: 'ri-route-line' },
      { id: 'trackless', name: 'Trackless', maxRanks: 2, ranks: 1, desc: 'Leave no visual trail (Rank 1) or no sensory trail (Rank 2)', icon: 'ri-eye-off-line' }
    ],
    defaultModes: ['wall_crawling'],
    computeRanks: (config) => {
      let sum = 0;
      const modes = Array.isArray(config?.selectedModes) ? config.selectedModes : ['wall_crawling'];
      modes.forEach(m => {
        if (typeof m === 'object' && m !== null) {
          sum += (Number(m.ranks) || 1);
        } else if (typeof m === 'string') {
          sum += 1;
        }
      });
      return Math.max(1, sum);
    }
  },

  'Immunity': {
    type: 'immunity_multiselect_library',
    label: 'Immunity Scope Library',
    categories: [
      { id: 'all', label: 'All' },
      { id: 'survival', label: 'Survival & Env (1-2 R)' },
      { id: 'biological', label: 'Biological & Sensory (5 R)' },
      { id: 'descriptors', label: 'Descriptors (10-20 R)' },
      { id: 'defenses', label: 'Defense Checks (30 R)' }
    ],
    presets: [
      { id: 'aging', name: 'Aging', ranks: 1, category: 'survival', desc: 'Immune to aging effects and natural death by old age', icon: 'ri-hourglass-line' },
      { id: 'disease', name: 'Disease', ranks: 1, category: 'survival', desc: 'Immune to all biological infections, viruses, and diseases', icon: 'ri-virus-line' },
      { id: 'poison', name: 'Poison', ranks: 1, category: 'survival', desc: 'Immune to natural, chemical, and synthetic toxins and venoms', icon: 'ri-flask-line' },
      { id: 'sleep', name: 'Need for Sleep', ranks: 1, category: 'survival', desc: 'Never need sleep or suffer from exhaustion/sleep deprivation', icon: 'ri-zzz-line' },
      { id: 'starvation', name: 'Starvation & Thirst', ranks: 1, category: 'survival', desc: 'Do not need food, nourishment, or water to survive', icon: 'ri-restaurant-line' },
      { id: 'suffocation_partial', name: 'Suffocation (Hold Breath)', ranks: 1, category: 'survival', desc: 'Can hold breath indefinitely without suffocating', icon: 'ri-lungs-line' },
      { id: 'suffocation_all', name: 'Suffocation (No Breathing)', ranks: 2, category: 'survival', desc: 'Completely do not breathe air or gas; vacuum & gas proof', icon: 'ri-lungs-fill' },
      { id: 'env_cold', name: 'Environmental Cold', ranks: 1, category: 'survival', desc: 'Unaffected by freezing atmospheric cold temperatures', icon: 'ri-temp-cold-line' },
      { id: 'env_heat', name: 'Environmental Heat', ranks: 1, category: 'survival', desc: 'Unaffected by intense desert or atmospheric heat', icon: 'ri-temp-hot-line' },
      { id: 'radiation', name: 'Radiation', ranks: 1, category: 'survival', desc: 'Immune to ambient, solar, and nuclear environmental radiation', icon: 'ri-radioactive-line' },
      { id: 'vacuum', name: 'Vacuum', ranks: 1, category: 'survival', desc: 'Unaffected by decompression and zero-pressure vacuum of space', icon: 'ri-space' },
      { id: 'critical', name: 'Critical Hits', ranks: 2, category: 'survival', desc: 'Opponents cannot score critical hits against you', icon: 'ri-shield-flash-line' },

      { id: 'alteration', name: 'Alteration Effects', ranks: 5, category: 'biological', desc: 'Immune to shape-changing, petrification, transmutation, and morphing attacks', icon: 'ri-magic-line' },
      { id: 'entrapment', name: 'Entrapment', ranks: 5, category: 'biological', desc: 'Immune to snares, tangles, nets, and physical binds', icon: 'ri-links-line' },
      { id: 'fatigue', name: 'Fatigue Effects', ranks: 5, category: 'biological', desc: 'Immune to powers that inflict fatigued or exhausted conditions', icon: 'ri-battery-low-line' },
      { id: 'sensory', name: 'Sensory Afflictions', ranks: 5, category: 'biological', desc: 'Immune to dazzle, blinding flash, and sensory overloading attacks', icon: 'ri-eye-off-line' },
      { id: 'interaction', name: 'Interaction Skills', ranks: 5, category: 'biological', desc: 'Immune to Deception, Intimidation, and Persuasion checks', icon: 'ri-chat-voice-line' },

      { id: 'life_support', name: 'Life Support', ranks: 10, category: 'descriptors', desc: 'Complete immunity: disease, poison, environmental cold/heat/radiation/vacuum, suffocation, and starvation', icon: 'ri-heart-pulse-line' },
      { id: 'fire', name: 'Common Descriptor: Fire / Heat', ranks: 10, category: 'descriptors', desc: 'Immune to all fire, heat, plasma, and thermal damage effects', icon: 'ri-fire-line' },
      { id: 'cold', name: 'Common Descriptor: Cold / Ice', ranks: 10, category: 'descriptors', desc: 'Immune to all cold, frost, freezing, and cryo damage effects', icon: 'ri-snowflake-line' },
      { id: 'electricity', name: 'Common Descriptor: Electricity', ranks: 10, category: 'descriptors', desc: 'Immune to all lightning, shock, voltage, and electrical damage', icon: 'ri-flashlight-line' },
      { id: 'magic', name: 'Common Descriptor: Magic', ranks: 10, category: 'descriptors', desc: 'Immune to all mystical, arcane, eldritch, and spell effects', icon: 'ri-sparkling-line' },
      { id: 'mental', name: 'Common Descriptor: Mental Effects', ranks: 10, category: 'descriptors', desc: 'Immune to all psychic, psionic, and telepathic powers', icon: 'ri-brain-line' },
      { id: 'energy', name: 'Very Common: All Energy', ranks: 20, category: 'descriptors', desc: 'Immune to all energy-based damage (fire, electricity, lasers, radiation, plasma)', icon: 'ri-sun-line' },
      { id: 'physical', name: 'Very Common: All Physical', ranks: 20, category: 'descriptors', desc: 'Immune to all kinetic, bludgeoning, piercing, and slashing physical attacks', icon: 'ri-shield-line' },

      { id: 'fortitude', name: 'All Fortitude Effects', ranks: 30, category: 'defenses', desc: 'Immune to any effect requiring a Fortitude resistance check', icon: 'ri-shield-cross-line' },
      { id: 'will', name: 'All Will Effects', ranks: 30, category: 'defenses', desc: 'Immune to any effect requiring a Will resistance check', icon: 'ri-mental-health-line' },
      { id: 'lethal', name: 'All Lethal Damage', ranks: 30, category: 'defenses', desc: 'Cannot suffer lethal harm or deadly injury', icon: 'ri-skull-line' }
    ],
    defaultPresets: ['life_support'],
    computeRanks: (config) => {
      let sum = 0;
      const presets = Array.isArray(config?.selectedPresets) ? config.selectedPresets : ['life_support'];
      const dict = {};
      CONFIGURABLE_EFFECTS.Immunity.presets.forEach(p => { dict[p.id] = p.ranks; });
      presets.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Morph': {
    type: 'morph_scope',
    label: 'Disguise Scope & Appearance Range',
    scopes: [
      { ranks: 1, cost: 5, name: 'Single Form (5 PP)', desc: 'A single specific alternate appearance (e.g., civilian disguise or specific individual)' },
      { ranks: 2, cost: 10, name: 'Narrow Group (10 PP)', desc: 'A narrow group of related forms (e.g., humanoids of same sex and size, or canines)' },
      { ranks: 3, cost: 15, name: 'Broad Group (15 PP)', desc: 'A broad group of related forms (e.g., any humanoid, any animal, any machine)' },
      { ranks: 4, cost: 20, name: 'Any Form (20 PP)', desc: 'Any form of roughly the same mass' }
    ],
    defaultScope: 1
  },

  'Weaken': {
    type: 'weaken_target',
    label: 'Target Trait & Resistance Defense',
    resistanceOptions: ['Fortitude', 'Will'],
    defaultResistance: 'Fortitude',
    traitCategories: {
      abilities: ['Strength', 'Stamina', 'Agility', 'Dexterity', 'Fighting', 'Intellect', 'Awareness', 'Presence'],
      defenses: ['Toughness', 'Dodge', 'Parry', 'Fortitude', 'Will'],
      broad: ['Power Descriptor (Magic, Fire, Tech, etc.)']
    },
    defaultTrait: 'Stamina'
  },

  'Nullify': {
    type: 'descriptor_spec',
    label: 'Countered Power Descriptor',
    descriptors: ['Fire', 'Ice / Cold', 'Electricity', 'Magic', 'Mental / Psionic', 'Technology', 'Telekinesis', 'Mutant Powers', 'Cosmic Energy', 'Biological Traits', 'Custom'],
    defaultDescriptor: 'Magic'
  },

  'Comprehend': {
    type: 'comprehend_multiselect_library',
    label: 'Comprehension Modes Library',
    modes: [
      { id: 'languages_understand', name: 'Languages: Understand Spoken', ranks: 1, desc: 'Understand all spoken languages spoken to you', icon: 'ri-hearing-line' },
      { id: 'languages_speak', name: 'Languages: Speak Any One', ranks: 1, desc: 'Speak any language, one language at a time', icon: 'ri-voiceprint-line' },
      { id: 'languages_read', name: 'Languages: Read All', ranks: 1, desc: 'Understand and read any written language or script', icon: 'ri-book-read-line' },
      { id: 'languages_understood', name: 'Languages: Understood by All', ranks: 1, desc: 'Anyone who can hear you understands your speech', icon: 'ri-broadcast-line' },
      { id: 'animals_understand', name: 'Animals: Understand', ranks: 1, desc: 'Understand communications and sounds of all animals', icon: 'ri-bear-smile-line' },
      { id: 'animals_speak', name: 'Animals: Speak', ranks: 1, desc: 'Speak to and converse bidirectionally with animals', icon: 'ri-chat-smile-3-line' },
      { id: 'plants', name: 'Plants: Speak & Understand', ranks: 1, desc: 'Communicate bidirectionally with plant life and flora', icon: 'ri-leaf-line' },
      { id: 'machines', name: 'Machines: Speak & Understand', ranks: 2, desc: 'Communicate fluently with electronics, computers, and AI', icon: 'ri-cpu-line' },
      { id: 'spirits', name: 'Spirits: Speak & Understand', ranks: 2, desc: 'Communicate with spirits, ghosts, and astral souls', icon: 'ri-ghost-line' },
      { id: 'objects', name: 'Objects: Read Impressions', ranks: 2, desc: 'Read psychometric impressions left on physical items', icon: 'ri-hand-coin-line' }
    ],
    defaultModes: ['languages_understand'],
    computeRanks: (config) => {
      let sum = 0;
      const modes = Array.isArray(config?.selectedModes) ? config.selectedModes : ['languages_understand'];
      const dict = {};
      CONFIGURABLE_EFFECTS.Comprehend.modes.forEach(m => { dict[m.id] = m.ranks; dict[m.name] = m.ranks; });
      modes.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Environment': {
    type: 'environment_multiselect_library',
    label: 'Environmental Hazards Library',
    elements: [
      { id: 'cold_1', name: 'Intense Cold', cost: 1, desc: 'Extreme low temperature exposure hazard checks', icon: 'ri-temp-cold-line' },
      { id: 'cold_2', name: 'Extreme Cold', cost: 2, desc: 'Severe freezing and frostbite hazard checks', icon: 'ri-snowflake-line' },
      { id: 'heat_1', name: 'Intense Heat', cost: 1, desc: 'Extreme high temperature exposure hazard checks', icon: 'ri-temp-hot-line' },
      { id: 'heat_2', name: 'Extreme Heat', cost: 2, desc: 'Severe heatstroke and heat exhaustion hazard checks', icon: 'ri-fire-line' },
      { id: 'impede_1', name: 'Impede Movement (-1)', cost: 1, desc: 'Reduces ground movement speed rank by 1 in area', icon: 'ri-walk-line' },
      { id: 'impede_2', name: 'Impede Movement (-2)', cost: 2, desc: 'Reduces ground movement speed rank by 2 in area', icon: 'ri-run-line' },
      { id: 'light_1', name: 'Bright Light', cost: 1, desc: 'Daylight level illumination dispelling shadow', icon: 'ri-sun-line' },
      { id: 'light_2', name: 'Blinding Light', cost: 2, desc: 'Blinding glare imposing -5 penalty to Perception', icon: 'ri-flashlight-line' },
      { id: 'vis_1', name: 'Visibility (-2)', cost: 1, desc: 'Fog or smoke imposing -2 penalty to visual Perception', icon: 'ri-cloud-line' },
      { id: 'vis_2', name: 'Total Concealment', cost: 2, desc: 'Impenetrable obscurement providing Total Concealment', icon: 'ri-mist-line' }
    ],
    defaultElements: ['cold_1'],
    computeCost: (config) => {
      let sum = 0;
      const elements = Array.isArray(config?.selectedElements) ? config.selectedElements : ['cold_1'];
      const dict = {};
      CONFIGURABLE_EFFECTS.Environment.elements.forEach(e => { dict[e.id] = e.cost; });
      elements.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Senses': {
    type: 'senses_multiselect_library',
    label: 'Sensory Faculty Superhuman Expansion',
    categories: [
      { id: 'all', label: 'All' },
      { id: 'visual', label: 'Visual' },
      { id: 'auditory', label: 'Auditory' },
      { id: 'mental', label: 'Mental & Exotic' },
      { id: 'tactile', label: 'Tactile & Olfactory' },
      { id: 'spatial', label: 'Spatial & Utility' }
    ],
    faculties: [
      { id: 'darkvision', name: 'Darkvision', pts: 2, category: 'visual', desc: 'See in total darkness as if normal daylight without light sources', icon: 'ri-eye-line' },
      { id: 'low_light', name: 'Low-Light Vision', pts: 1, category: 'visual', desc: 'Ignore penalties from dim lighting conditions and deep shadows', icon: 'ri-contrast-line' },
      { id: 'infravision', name: 'Infravision', pts: 1, category: 'visual', desc: 'See thermal infrared radiation patterns, heat signatures, and warm bodies', icon: 'ri-fire-line' },
      { id: 'ultravision', name: 'Ultravision', pts: 1, category: 'visual', desc: 'See ultraviolet frequencies, energy trails, and radioactive leaks', icon: 'ri-sun-line' },
      { id: 'microscopic', name: 'Microscopic Vision (Dust)', pts: 1, category: 'visual', desc: 'See dust-sized and tiny microscopic details clearly', icon: 'ri-zoom-in-line' },
      { id: 'microscopic_2', name: 'Microscopic Vision (Cellular)', pts: 2, category: 'visual', desc: 'See individual biological cells, bacteria, and DNA structures', icon: 'ri-microscope-line' },
      { id: 'penetrates_concealment_vis', name: 'Penetrates Concealment (Visual)', pts: 4, category: 'visual', desc: 'X-Ray vision: perceive visually through solid walls, lead, or smoke', icon: 'ri-scan-line' },
      { id: 'counters_concealment_vis', name: 'Counters Concealment (Visual)', pts: 2, category: 'visual', desc: 'Ignore invisibility, darkness, camouflage, and visual obscurement', icon: 'ri-eye-fill' },
      { id: 'counters_illusion_vis', name: 'Counters Illusion (Visual)', pts: 2, category: 'visual', desc: 'Automatically see through all optical and holographic illusions', icon: 'ri-shield-check-line' },

      { id: 'ultra_hearing', name: 'Ultra-Hearing', pts: 1, category: 'auditory', desc: 'Hear very high and low ultrasonic acoustic frequencies', icon: 'ri-volume-up-line' },
      { id: 'auditory_radar', name: 'Auditory Radar (Echolocation)', pts: 2, category: 'auditory', desc: 'Accurate sonic reflection sense mapping physical objects via audio bounce', icon: 'ri-broadcast-line' },
      { id: 'counters_concealment_aud', name: 'Counters Concealment (Auditory)', pts: 2, category: 'auditory', desc: 'Hear clearly through silence fields, white noise, and deafening zones', icon: 'ri-sound-module-line' },

      { id: 'danger_sense', name: 'Danger Sense', pts: 1, category: 'mental', desc: 'Notice impending surprise attacks with Perception check (never surprised)', icon: 'ri-alarm-warning-line' },
      { id: 'radio', name: 'Radio', pts: 1, category: 'mental', desc: 'Pick up radio, cellular, WiFi, and wireless data broadcasts', icon: 'ri-radio-line' },
      { id: 'radar', name: 'Radar', pts: 3, category: 'mental', desc: 'Accurate 360-degree radio sense perceiving physical surroundings in total dark', icon: 'ri-radar-line' },
      { id: 'mental_awareness', name: 'Mental Awareness', pts: 1, category: 'mental', desc: 'Sense the presence, location, and power activation of psychic minds', icon: 'ri-brain-line' },
      { id: 'magic_awareness', name: 'Mystical Awareness', pts: 1, category: 'mental', desc: 'Sense the aura, weave, and presence of magic and supernatural energies', icon: 'ri-sparkling-line' },
      { id: 'postcognition', name: 'Postcognition', pts: 4, category: 'mental', desc: 'Perceive past events that transpired at your current location', icon: 'ri-history-line' },
      { id: 'precognition', name: 'Precognition', pts: 4, category: 'mental', desc: 'Receive visions, premonitions, and glimpses of future events', icon: 'ri-compass-3-line' },

      { id: 'acute_scent', name: 'Acute Scent', pts: 1, category: 'tactile', desc: 'Distinguish identical scents and uniquely identify individuals by smell', icon: 'ri-drop-line' },
      { id: 'tracking', name: 'Tracking', pts: 1, category: 'tactile', desc: 'Follow scent trails or sensory traces at full movement speed', icon: 'ri-footprint-line' },
      { id: 'tremorsense', name: 'Tremorsense', pts: 2, category: 'tactile', desc: 'Detect ground vibrations and underground movements through physical contact', icon: 'ri-pulse-line' },
      { id: 'analytical_taste', name: 'Analytical Taste', pts: 1, category: 'tactile', desc: 'Detect trace poisons, chemical compositions, and ingredients by taste', icon: 'ri-test-tube-line' },

      { id: 'direction_sense', name: 'Direction Sense', pts: 1, category: 'spatial', desc: 'Always know which way is true north and spatial orientation', icon: 'ri-compass-line' },
      { id: 'distance_sense', name: 'Distance Sense', pts: 1, category: 'spatial', desc: 'Accurately judge distances and ranges without tools', icon: 'ri-ruler-line' },
      { id: 'time_sense', name: 'Time Sense', pts: 1, category: 'spatial', desc: 'Always know exact elapsed time like an internal atomic clock', icon: 'ri-time-line' },
      { id: 'extended_sense', name: 'Extended Sense', pts: 1, category: 'spatial', desc: 'Multiplies sensory range increments tenfold (-10 distance penalty threshold)', icon: 'ri-fullscreen-line' },
      { id: 'radius', name: 'Radius (360 Degree Sense)', pts: 1, category: 'spatial', desc: 'Perceive in all directions simultaneously without blind spots', icon: 'ri-circle-line' }
    ],
    defaultFaculties: ['darkvision'],
    computeRanks: (config) => {
      let sum = 0;
      const faculties = Array.isArray(config?.selectedFaculties) ? config.selectedFaculties : ['darkvision'];
      const dict = {};
      CONFIGURABLE_EFFECTS.Senses.faculties.forEach(f => { dict[f.id] = f.pts; dict[f.name] = f.pts; });
      faculties.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Variable': {
    type: 'variable_theme',
    label: 'Theme & Scope of Variable Pool',
    themes: ['Magic / Sorcery', 'Cosmic Energy', 'Shape-shifting', 'Power Mimicry', 'Nanotech / Gadgets', 'Mutation', 'Psionics'],
    defaultTheme: 'Magic / Sorcery'
  }
};

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
 * Checks whether an effect requires a resistance check according to M&M 3e rules.
 * Attack effects (Damage, Blast, Affliction, Weaken, Nullify, etc.), effects with the Attack extra,
 * or hostile/resisted effects allow a resistance check. Non-combat/utility/movement/defense effects do not.
 */
export function hasResistanceCheck(eff) {
  if (!eff) return false;
  const base = (eff.baseEffect || eff.name || '').toLowerCase();
  const inherentAttackEffects = ['damage', 'blast', 'affliction', 'weaken', 'nullify', 'mind reading', 'mind control'];
  if (inherentAttackEffects.includes(base)) return true;

  const extras = Array.isArray(eff.extras) ? eff.extras : [];
  const hasAttackExtra = extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');
  if (hasAttackExtra) return true;

  const nonResistanceEffects = [
    'senses', 'enhanced trait', 'movement', 'immunity', 'flight', 'speed', 'quickness',
    'leaping', 'swimming', 'growth', 'shrinking', 'morph', 'variable', 'comprehend',
    'feature', 'protection', 'regeneration', 'immortality', 'elongation', 'invisibility',
    'insubstantial', 'burrowing', 'teleport', 'deflect', 'healing', 'remote sensing',
    'create', 'illusion', 'transform', 'communication', 'luck control', 'extra limbs', 'environment', 'summon'
  ];
  if (nonResistanceEffects.includes(base) || eff.action === 'None') {
    return false;
  }

  const res = (eff.resistance || '').trim().toLowerCase();
  if (!res || res === 'none' || res === '-') return false;

  return ['toughness', 'fortitude', 'will', 'dodge', 'parry', 'fortitude or will', 'dodge or will', 'dodge or fortitude'].includes(res);
}

/**
 * Creates a normalized empty Power Effect.
 */
export function createEmptyEffect(baseName = 'Damage') {
  const base = BASE_EFFECTS.find(b => b.name === baseName) || BASE_EFFECTS[0];

  const eff = {
    id: 'eff_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: base.name,
    baseEffect: base.name,
    ranks: 1,
    baseCost: base.cost || 1,
    action: base.action || 'Standard',
    range: base.range || 'Close',
    duration: base.duration || 'Instant',
    resistance: base.resistance || (base.category === 'Attack' ? (base.name === 'Affliction' ? 'Fortitude' : 'Toughness') : ''),
    extras: [],
    flaws: []
  };

  return normalizeEffect(eff);
}

/**
 * Creates an empty Device sub-power component.
 */
export function createEmptyDeviceSubPower(name = 'Sub-Power', baseEffect = 'Damage') {
  return {
    id: 'dev_sub_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: name,
    effect: createEmptyEffect(baseEffect),
    linkedEffects: [],
    alternateEffects: []
  };
}

/**
 * Creates an empty sub-effect component for a Compound Power.
 * M&M 3e rules allow compound powers to combine multiple effects into a single named power.
 */
export function createEmptyCompoundEffect(name = '', baseEffect = 'Damage', isPrimary = false, isLinked = false) {
  const eff = createEmptyEffect(baseEffect);
  if (name) eff.name = name;
  return {
    id: 'comp_eff_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: name || eff.name || baseEffect,
    isPrimaryAction: Boolean(isPrimary),
    isLinked: Boolean(isLinked),
    linkGroupId: 'link_group_1',
    effect: eff,
    active: true
  };
}

/**
 * Creates a full normalized Power conforming to the Power Schema.
 */
export function createEmptyPower(type = 'standard') {
  const power = {
    id: 'pow_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name: '',
    summary: '',
    type: type || 'standard',
    compoundMode: 'suite', // 'suite'
    activation: 'none',
    activationCost: 0,
    sharedModifiers: [],
    descriptors: [],
    mainEffect: createEmptyEffect('Damage'),
    linkedEffects: [],
    alternateEffects: [],
    compoundEffects: [],
    devicePowers: [],
    deviceConfig: {
      type: 'none',
      descriptor: '',
      toughness: 10
    },
    active: true,
    activeSlotId: 'main',
    notes: ''
  };

  if (type === 'compound') {
    power.compoundEffects = [
      createEmptyCompoundEffect('Component #1', 'Damage', true, false),
      createEmptyCompoundEffect('Component #2', 'Affliction', false, false)
    ];
    power.mainEffect = power.compoundEffects[0].effect;
  }

  return power;
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
  power.active = power.active !== undefined ? Boolean(power.active) : true;
  power.activeSlotId = power.activeSlotId || 'main';
  power.activation = power.activation || 'none';
  power.activationCost = power.activationCost !== undefined ? Number(power.activationCost) : (power.activation === 'move' ? -1 : power.activation === 'standard' ? -2 : 0);

  // Device configuration
  if (!power.deviceConfig || typeof power.deviceConfig !== 'object') {
    power.deviceConfig = {
      type: power.type === 'device' ? 'removable' : 'none',
      descriptor: '',
      toughness: 10
    };
  } else {
    power.deviceConfig = {
      type: power.deviceConfig.type || (power.type === 'device' ? 'removable' : 'none'),
      descriptor: power.deviceConfig.descriptor || '',
      toughness: Number(power.deviceConfig.toughness) || 10
    };
  }

  // Check if power comes with legacy flat effect properties
  const hasLegacyFlatEffect = Boolean((power.baseEffect || power.effectType) && !power.mainEffect);
  if (hasLegacyFlatEffect || !power.mainEffect) {
    const rawBase = power.baseEffect || power.effectType;
    let baseName = rawBase;
    const aliasMap = {
      'force field': 'Protection',
      'blast': 'Damage',
      'impervious': 'Protection',
      'armor plating': 'Protection'
    };

    if (rawBase && aliasMap[rawBase.toLowerCase()]) {
      baseName = aliasMap[rawBase.toLowerCase()];
    } else if (!baseName || !BASE_EFFECTS.some(b => b.name === baseName)) {
      if (BASE_EFFECTS.some(b => b.name === power.name)) {
        baseName = power.name;
      } else if (power.name && aliasMap[power.name.toLowerCase()]) {
        baseName = aliasMap[power.name.toLowerCase()];
      } else {
        baseName = BASE_EFFECTS.some(b => b.name === power.baseEffect) ? power.baseEffect : (power.effectType || 'Damage');
      }
    }

    const baseRef = BASE_EFFECTS.find(b => b.name === baseName) || BASE_EFFECTS.find(b => b.name === 'Damage');
    const finalBaseName = baseRef ? baseRef.name : (baseName || 'Damage');

    power.mainEffect = normalizeEffect({
      id: 'eff_main_' + power.id,
      name: power.name || finalBaseName,
      baseEffect: finalBaseName,
      ranks: Number(power.ranks) || 1,
      baseCost: power.baseCost !== undefined ? Number(power.baseCost) : (baseRef ? baseRef.cost : 1),
      action: power.action || (baseRef ? baseRef.action : 'Standard'),
      range: power.range || (baseRef ? baseRef.range : 'Close'),
      duration: power.duration || (baseRef ? baseRef.duration : 'Instant'),
      resistance: power.resistance || (baseRef ? (baseRef.resistance || 'Toughness') : 'Toughness'),
      extras: Array.isArray(power.extras) ? power.extras.map(normalizeModifier) : [],
      flaws: Array.isArray(power.flaws) ? power.flaws.map(normalizeModifier) : [],
      config: power.config || {}
    });
  } else {
    // If power.mainEffect already exists, heal any corrupted baseEffect if effectType was provided
    if (!BASE_EFFECTS.some(b => b.name === power.mainEffect.baseEffect)) {
      const aliasMap = { 'force field': 'Protection', 'blast': 'Damage', 'impervious': 'Protection', 'armor plating': 'Protection' };
      if (power.effectType && BASE_EFFECTS.some(b => b.name === power.effectType)) {
        power.mainEffect.baseEffect = power.effectType;
      } else if (power.effectType && aliasMap[power.effectType.toLowerCase()]) {
        power.mainEffect.baseEffect = aliasMap[power.effectType.toLowerCase()];
      } else if (power.mainEffect.baseEffect && aliasMap[power.mainEffect.baseEffect.toLowerCase()]) {
        power.mainEffect.baseEffect = aliasMap[power.mainEffect.baseEffect.toLowerCase()];
      }
    }
    power.mainEffect = normalizeEffect(power.mainEffect);
  }

  // Normalize linked effects
  power.linkedEffects = Array.isArray(power.linkedEffects)
    ? power.linkedEffects.map(normalizeEffect)
    : [];

  // Normalize alternate effects
  power.alternateEffects = Array.isArray(power.alternateEffects)
    ? power.alternateEffects.map(normalizeAlternateSlot)
    : [];

  // Device Container normalization
  const isContainerPower = power.type === 'device' || power.type === 'container';
  if (isContainerPower) {
    const topLevelLinked = Array.isArray(power.linkedEffects) && power.linkedEffects.length > 0
      ? power.linkedEffects
      : (Array.isArray(power.mainEffect?.linkedEffects) && power.mainEffect.linkedEffects.length > 0
        ? power.mainEffect.linkedEffects
        : []);

    const topLevelAlts = Array.isArray(power.alternateEffects) && power.alternateEffects.length > 0
      ? power.alternateEffects
      : [];

    if (!Array.isArray(power.devicePowers) || power.devicePowers.length === 0) {
      power.devicePowers = [{
        id: 'dev_sub_' + Date.now(),
        name: power.mainEffect?.name || 'Primary System',
        effect: power.mainEffect ? normalizeEffect(power.mainEffect) : createEmptyEffect('Damage'),
        mainEffect: power.mainEffect ? normalizeEffect(power.mainEffect) : createEmptyEffect('Damage'),
        activeSlotId: 'main',
        active: true,
        linkedEffects: topLevelLinked.map(normalizeEffect),
        alternateEffects: topLevelAlts.map(normalizeAlternateSlot)
      }];
    } else {
      power.devicePowers = power.devicePowers.map((sp, idx) => {
        const subEff = sp.effect || sp.mainEffect || sp;
        const normEff = normalizeEffect(subEff);

        let rawLinked = [];
        if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
          rawLinked = sp.linkedEffects;
        } else if (Array.isArray(subEff?.linkedEffects) && subEff.linkedEffects.length > 0) {
          rawLinked = subEff.linkedEffects;
        } else if (Array.isArray(sp.effect?.linkedEffects) && sp.effect.linkedEffects.length > 0) {
          rawLinked = sp.effect.linkedEffects;
        } else if (Array.isArray(sp.mainEffect?.linkedEffects) && sp.mainEffect.linkedEffects.length > 0) {
          rawLinked = sp.mainEffect.linkedEffects;
        } else if (idx === 0 && topLevelLinked.length > 0) {
          rawLinked = topLevelLinked;
        }

        let rawAlts = [];
        if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
          rawAlts = sp.alternateEffects;
        } else if (Array.isArray(subEff?.alternateEffects) && subEff.alternateEffects.length > 0) {
          rawAlts = subEff.alternateEffects;
        } else if (Array.isArray(sp.effect?.alternateEffects) && sp.effect.alternateEffects.length > 0) {
          rawAlts = sp.effect.alternateEffects;
        } else if (Array.isArray(sp.mainEffect?.alternateEffects) && sp.mainEffect.alternateEffects.length > 0) {
          rawAlts = sp.mainEffect.alternateEffects;
        } else if (idx === 0 && topLevelAlts.length > 0) {
          rawAlts = topLevelAlts;
        }

        return {
          ...sp,
          id: sp.id || ('dev_sub_' + Date.now() + '_' + idx),
          name: sp.name || normEff.name || `Sub-Power #${idx + 1}`,
          effect: normEff,
          mainEffect: normEff,
          activeSlotId: sp.activeSlotId || 'main',
          active: sp.active !== undefined ? Boolean(sp.active) : true,
          linkedEffects: rawLinked.map(normalizeEffect),
          alternateEffects: rawAlts.map(normalizeAlternateSlot)
        };
      });
    }

    if (!power.deviceConfig || power.deviceConfig.type === 'none') {
      power.deviceConfig = {
        type: 'removable',
        descriptor: power.name || 'Device',
        toughness: 10
      };
    }

    // Synchronize primary sub-power into mainEffect for cross-compatibility
    if (power.devicePowers.length > 0) {
      power.mainEffect = power.devicePowers[0].effect || power.devicePowers[0].mainEffect;
    }
    // Device containers group sub-powers; top-level linked and alternate effects must be empty
    power.linkedEffects = [];
    power.alternateEffects = [];
  }

  // Compound Power normalization (M&M 3e Deluxe Hero's Handbook p. 136-137 & p. 147)
  if (power.type === 'compound') {
    power.compoundMode = power.compoundMode || 'linked';
    power.sharedModifiers = Array.isArray(power.sharedModifiers)
      ? power.sharedModifiers.map(normalizeModifier)
      : [];

    if (!Array.isArray(power.compoundEffects) || power.compoundEffects.length === 0) {
      const primaryEff = power.mainEffect ? normalizeEffect(power.mainEffect) : createEmptyEffect('Damage');
      power.compoundEffects = [
        {
          id: 'comp_eff_' + Date.now() + '_0',
          name: primaryEff.name || 'Primary Effect',
          isPrimaryAction: true,
          isLinked: true,
          linkGroupId: 'link_group_1',
          effect: primaryEff,
          active: true
        }
      ];
      if (Array.isArray(power.linkedEffects) && power.linkedEffects.length > 0) {
        power.linkedEffects.forEach((le, lIdx) => {
          power.compoundEffects.push({
            id: 'comp_eff_' + Date.now() + '_' + (lIdx + 1),
            name: le.name || `Linked Effect #${lIdx + 1}`,
            isPrimaryAction: false,
            isLinked: true,
            linkGroupId: 'link_group_1',
            effect: normalizeEffect(le),
            active: true
          });
        });
      }
    } else {
      power.compoundEffects = power.compoundEffects.map((item, idx) => {
        const subEff = item.effect || item.mainEffect || item;
        const normEff = normalizeEffect(subEff);
        const rawLinked = Array.isArray(item.linkedEffects) ? item.linkedEffects : [];
        const rawAlts = Array.isArray(item.alternateEffects) ? item.alternateEffects : [];
        return {
          id: item.id || ('comp_eff_' + Date.now() + '_' + idx),
          name: item.name || normEff.name || `Sub-Effect #${idx + 1}`,
          isPrimaryAction: item.isPrimaryAction !== undefined ? Boolean(item.isPrimaryAction) : (idx === 0),
          isLinked: false,
          linkGroupId: item.linkGroupId || 'link_group_1',
          effect: normEff,
          active: item.active !== undefined ? Boolean(item.active) : true,
          linkedEffects: rawLinked.map(normalizeEffect),
          alternateEffects: rawAlts.map(normalizeAlternateSlot)
        };
      });
    }

    const primaryComp = power.compoundEffects.find(c => c.isPrimaryAction) || power.compoundEffects[0];
    if (primaryComp) {
      power.mainEffect = primaryComp.effect;
    }
    power.linkedEffects = [];
    power.alternateEffects = [];
  }

  // Keep root legacy aliases in sync so legacy components, print templates, and targeted effects work
  if (!power.mainEffect) {
    power.mainEffect = createEmptyEffect('Damage');
  }
  power.baseEffect = power.mainEffect.baseEffect;
  power.effectType = power.mainEffect.baseEffect;
  power.ranks = power.mainEffect.ranks;
  power.baseCost = power.mainEffect.baseCost;
  power.range = power.mainEffect.range;
  power.action = power.mainEffect.action;
  power.duration = power.mainEffect.duration;
  power.resistance = power.mainEffect.resistance;
  power.extras = power.mainEffect.extras;
  power.flaws = power.mainEffect.flaws;

  return power;
}

/**
 * Normalizes an individual effect component.
 */
export function normalizeEffect(rawEffect) {
  if (!rawEffect) return createEmptyEffect();
  const eff = { ...rawEffect };
  eff.id = eff.id || ('eff_' + Date.now() + Math.random().toString(36).substr(2, 4));

  // Determine actual baseEffect without blindly falling back to 'Damage'
  let determinedBase = eff.baseEffect || eff.effectType || eff.type;
  if (!determinedBase || !BASE_EFFECTS.some(b => b.name === determinedBase)) {
    if (eff.name && BASE_EFFECTS.some(b => b.name === eff.name)) {
      determinedBase = eff.name;
    } else {
      const aliasMap = {
        'force field': 'Protection',
        'blast': 'Damage',
        'impervious': 'Protection',
        'armor plating': 'Protection',
        'snare': 'Affliction',
        'web snare': 'Affliction',
        'stun': 'Affliction',
        'telekinesis': 'Move Object'
      };
      if (eff.name && aliasMap[eff.name.toLowerCase()]) {
        determinedBase = aliasMap[eff.name.toLowerCase()];
      } else if (determinedBase && aliasMap[determinedBase.toLowerCase()]) {
        determinedBase = aliasMap[determinedBase.toLowerCase()];
      }
    }
  }

  eff.baseEffect = determinedBase || eff.name || 'Damage';
  eff.name = eff.name || eff.baseEffect;

  // Heal stale auto-generated default linked names where baseEffect was switched but name was not updated
  if (eff.name && eff.baseEffect && eff.name.trim().toLowerCase() !== eff.baseEffect.toLowerCase()) {
    const linkedMatch = /^(.*)\s*\(Linked\)$/i.exec(eff.name.trim());
    if (linkedMatch) {
      const oldBase = linkedMatch[1].trim();
      if (oldBase.toLowerCase() !== eff.baseEffect.toLowerCase() &&
          (oldBase.toLowerCase() === 'affliction' || BASE_EFFECTS.some(b => b.name.toLowerCase() === oldBase.toLowerCase()))) {
        eff.name = `${eff.baseEffect} (Linked)`;
      }
    } else if (BASE_EFFECTS.some(b => b.name.toLowerCase() === eff.name.trim().toLowerCase())) {
      eff.name = eff.baseEffect;
    }
  }

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

  const isAttackEffect = baseRef ? (baseRef.category === 'Attack' || ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify', 'Mind Reading'].includes(baseRef.name)) : false;
  const hasAttackExtra = Array.isArray(eff.extras) && eff.extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');

  if (isAttackEffect || hasAttackExtra) {
    eff.resistance = eff.resistance || (baseRef ? (baseRef.resistance || (baseRef.name === 'Affliction' ? 'Fortitude' : 'Toughness')) : 'Toughness');
  } else {
    const nonResList = [
      'senses', 'enhanced trait', 'movement', 'immunity', 'flight', 'speed', 'quickness',
      'leaping', 'swimming', 'growth', 'shrinking', 'morph', 'variable', 'comprehend',
      'feature', 'protection', 'regeneration', 'immortality', 'elongation', 'invisibility',
      'insubstantial', 'burrowing', 'teleport', 'deflect', 'healing', 'remote sensing',
      'create', 'illusion', 'transform', 'communication', 'luck control', 'extra limbs', 'environment', 'summon'
    ];
    if (nonResList.includes((eff.baseEffect || '').toLowerCase()) || eff.action === 'None' || eff.resistance === 'None' || eff.resistance === 'none') {
      eff.resistance = '';
    } else {
      eff.resistance = eff.resistance && eff.resistance !== 'Toughness' ? eff.resistance : (baseRef?.resistance || '');
    }
  }

  eff.extras = Array.isArray(eff.extras) ? eff.extras.map(normalizeModifier) : [];
  eff.flaws = Array.isArray(eff.flaws) ? eff.flaws.map(normalizeModifier) : [];

  // Configuration initialization for configurable effects
  const cfg = CONFIGURABLE_EFFECTS[eff.baseEffect];
  if (cfg) {
    eff.config = eff.config && typeof eff.config === 'object' ? { ...eff.config } : {};
    if (cfg.type === 'senses_multiselect') {
      if (!Array.isArray(eff.config.senses) || eff.config.senses.length === 0) {
        eff.config.senses = [...(cfg.defaultSenses || ['Visual'])];
      }
    } else if (cfg.type === 'trait_picker') {
      eff.config.traitCategory = eff.config.traitCategory || cfg.defaultCategory || 'abilities';
      eff.config.traitName = eff.config.traitName || cfg.defaultTrait || 'Strength';
    } else if (cfg.type === 'affliction_builder') {
      eff.config.resistance = eff.config.resistance || cfg.defaultResistance || 'Fortitude';
      eff.config.preset = eff.config.preset || 'stun';
      
      const parseConditions = (degVal, defVal) => {
        if (Array.isArray(degVal) && degVal.length > 0) return degVal.filter(Boolean);
        if (typeof degVal === 'string' && degVal.trim()) {
          return degVal.split(/\s*(?:&|,)\s*/).filter(Boolean);
        }
        return [defVal];
      };

      eff.config.firstConditions = parseConditions(eff.config.firstConditions || eff.config.firstDegree, 'Dazed');
      eff.config.secondConditions = parseConditions(eff.config.secondConditions || eff.config.secondDegree, 'Stunned');
      eff.config.thirdConditions = parseConditions(eff.config.thirdConditions || eff.config.thirdDegree, 'Paralyzed');

      eff.config.firstDegree = eff.config.firstConditions.join(' & ');
      eff.config.secondDegree = eff.config.secondConditions.join(' & ');
      eff.config.thirdDegree = eff.config.thirdConditions.join(' & ');
      eff.resistance = eff.config.resistance;
    } else if (cfg.type === 'movement_multiselect_library' || cfg.type === 'movement_picker') {
      if (eff.config.mode && !eff.config.selectedModes) {
        eff.config.selectedModes = [{ id: eff.config.mode, name: eff.config.mode, ranks: 1 }];
      }
      if (!Array.isArray(eff.config.selectedModes) || eff.config.selectedModes.length === 0) {
        eff.config.selectedModes = [{ id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 }];
      }
      if (typeof cfg.computeRanks === 'function') {
        eff.ranks = cfg.computeRanks(eff.config);
      }
    } else if (cfg.type === 'immunity_multiselect_library' || cfg.type === 'immunity_picker') {
      if (eff.config.preset && !eff.config.selectedPresets) {
        eff.config.selectedPresets = [eff.config.preset];
      }
      if (!Array.isArray(eff.config.selectedPresets) || eff.config.selectedPresets.length === 0) {
        eff.config.selectedPresets = [...(cfg.defaultPresets || ['life_support'])];
      }
      if (typeof cfg.computeRanks === 'function') {
        eff.ranks = cfg.computeRanks(eff.config);
      }
    } else if (cfg.type === 'morph_scope') {
      eff.config.scope = eff.config.scope !== undefined ? Number(eff.config.scope) : (cfg.defaultScope || 1);
    } else if (cfg.type === 'weaken_target') {
      eff.config.resistance = eff.config.resistance || cfg.defaultResistance || 'Fortitude';
      eff.config.traitCategory = eff.config.traitCategory || 'abilities';
      eff.config.traitName = eff.config.traitName || cfg.defaultTrait || 'Stamina';
      eff.resistance = eff.config.resistance;
    } else if (cfg.type === 'descriptor_spec') {
      eff.config.descriptor = eff.config.descriptor || cfg.defaultDescriptor || 'Magic';
      eff.config.customDescriptor = eff.config.customDescriptor || '';
    } else if (cfg.type === 'comprehend_multiselect_library' || cfg.type === 'comprehend_picker') {
      if (eff.config.mode && !eff.config.selectedModes) {
        eff.config.selectedModes = [eff.config.mode];
      }
      if (!Array.isArray(eff.config.selectedModes) || eff.config.selectedModes.length === 0) {
        eff.config.selectedModes = [...(cfg.defaultModes || ['languages_understand'])];
      }
      if (typeof cfg.computeRanks === 'function') {
        eff.ranks = cfg.computeRanks(eff.config);
      }
    } else if (cfg.type === 'environment_multiselect_library' || cfg.type === 'environment_picker') {
      if (eff.config.element && !eff.config.selectedElements) {
        eff.config.selectedElements = [eff.config.element];
      }
      if (!Array.isArray(eff.config.selectedElements) || eff.config.selectedElements.length === 0) {
        eff.config.selectedElements = [...(cfg.defaultElements || ['cold_1'])];
      }
    } else if (cfg.type === 'senses_multiselect_library' || cfg.type === 'senses_picker') {
      if (eff.config.faculty && !eff.config.selectedFaculties) {
        eff.config.selectedFaculties = [eff.config.faculty];
      }
      if (!Array.isArray(eff.config.selectedFaculties) || eff.config.selectedFaculties.length === 0) {
        eff.config.selectedFaculties = [...(cfg.defaultFaculties || ['darkvision'])];
      }
      if (typeof cfg.computeRanks === 'function') {
        eff.ranks = cfg.computeRanks(eff.config);
      }
    } else if (cfg.type === 'variable_theme') {
      eff.config.theme = eff.config.theme || cfg.defaultTheme || 'Magic / Sorcery';
    }

    if (typeof cfg.computeCost === 'function') {
      eff.baseCost = cfg.computeCost(eff.config);
    }
  }

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
    if (ref.hasCustomText !== undefined && mod.hasCustomText === undefined) mod.hasCustomText = ref.hasCustomText;
    if (ref.allowMultiple !== undefined && mod.allowMultiple === undefined) mod.allowMultiple = ref.allowMultiple;
    if (ref.customTextLabel && !mod.customTextLabel) mod.customTextLabel = ref.customTextLabel;
    if (ref.customTextPlaceholder && !mod.customTextPlaceholder) mod.customTextPlaceholder = ref.customTextPlaceholder;
    if (ref.appliesTo && !mod.appliesTo) mod.appliesTo = ref.appliesTo;
  }

  // Ensure unique ID for multiple instances identification
  mod.id = mod.id || ('mod_' + Date.now() + Math.random().toString(36).substr(2, 5));

  // Preserve customText from either direct property or config object
  if (rawMod.customText !== undefined) {
    mod.customText = rawMod.customText;
  } else if (rawMod.config?.customText !== undefined) {
    mod.customText = rawMod.config.customText;
  } else if (mod.customText === undefined) {
    mod.customText = '';
  }

  mod.ranks = Math.max(1, Number(mod.ranks) || 1);
  mod.config = mod.config || {};
  if (mod.customText) {
    mod.config.customText = mod.customText;
  }

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

/**
 * Checks if a modifier is compatible with a given effect name.
 * A modifier is compatible if it is general (no appliesTo specified)
 * or if its appliesTo array includes the effect name.
 *
 * @param {Object} mod - Modifier object from EXTRAS or FLAWS
 * @param {string} effectName - Name of the effect (e.g. 'Damage', 'Summon')
 * @returns {boolean}
 */
export function isModifierCompatible(mod, effectName) {
  if (!effectName) return true;
  if (!mod || !mod.appliesTo || !Array.isArray(mod.appliesTo) || mod.appliesTo.length === 0) {
    return true;
  }
  const eff = effectName.toLowerCase().trim();
  return mod.appliesTo.some(a => a.toLowerCase().trim() === eff);
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

  // Normalize linked effects for alternate slot
  const rawLinked = (Array.isArray(slot.linkedEffects) && slot.linkedEffects.length > 0)
    ? slot.linkedEffects
    : (Array.isArray(slot.effect?.linkedEffects) ? slot.effect.linkedEffects : []);
  slot.linkedEffects = rawLinked.map(normalizeEffect);

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
      perRankModifier += extra.cost * (extra.hasRanks ? extraRanks : 1);
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
      perRankModifier += flaw.cost * (flaw.hasRanks ? flawRanks : 1); // flaw.cost is negative
    } else if (flaw.type === 'flat_per_rank') {
      flatTotal += flaw.cost * flawRanks;
    } else if (flaw.type === 'flat') {
      flatTotal += flaw.cost;
    }
  }

  const netPerRank = norm.baseCost + perRankModifier;
  let basePointCost = 0;
  let divisor = null;

  // Enhanced Trait (Skills) rule: 1 PP per 2 ranks (0.5 PP/Rank)
  if (norm.baseEffect === 'Enhanced Trait' && norm.config?.traitCategory === 'skills') {
    if (perRankModifier === 0) {
      divisor = 2;
      basePointCost = Math.ceil(norm.ranks / 2);
    } else {
      const effectivePerRank = 0.5 + perRankModifier;
      if (effectivePerRank >= 1) {
        basePointCost = Math.ceil(effectivePerRank * norm.ranks);
      } else {
        divisor = Math.max(2, Math.round(2 - effectivePerRank));
        basePointCost = Math.ceil(norm.ranks / divisor);
      }
    }
  } else if (netPerRank >= 1) {
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
 * - Standard / Linked / Array: Main + Linked + Alternate Slots - Device Discount.
 * - Device Container: Sum of all Sub-Powers (Main + Linked + Alternate) - Cumulative Removable Discount.
 */
export function calculatePowerTotalCost(rawPower) {
  if (!rawPower) return 1;
  const power = normalizePower(rawPower);

  // Device Container: Sum all sub-powers before applying Removable flaw
  if (power.type === 'device' && Array.isArray(power.devicePowers) && power.devicePowers.length > 0) {
    let subPowersSum = 0;
    for (const sub of power.devicePowers) {
      const subMainCost = calculateEffectCost(sub.effect, 0).totalCost;
      let subLinkedCost = 0;
      for (const linked of (sub.linkedEffects || [])) {
        subLinkedCost += calculateEffectCost(linked, 0).totalCost;
      }
      let subAltCost = 0;
      for (const alt of (sub.alternateEffects || [])) {
        subAltCost += alt.isDynamic ? 2 : 1;
      }
      subPowersSum += subMainCost + subLinkedCost + subAltCost;
    }

    let subtotalRaw = subPowersSum;
    if (power.activationCost) {
      subtotalRaw = Math.max(1, subtotalRaw + power.activationCost);
    }

    const discount = calculateDeviceDiscount(subtotalRaw, power.deviceConfig?.type || 'removable');
    return Math.max(1, subtotalRaw - discount);
  }

  // Compound Power: Sum of all sub-effects + linked + alternate stunts + shared flat modifiers + activation flaw
  if (power.type === 'compound' && Array.isArray(power.compoundEffects) && power.compoundEffects.length > 0) {
    let compoundSum = 0;
    for (const item of power.compoundEffects) {
      const itemMainCost = calculateEffectCost(item.effect, 0).totalCost;
      let itemLinkedCost = 0;
      for (const linked of (item.linkedEffects || [])) {
        itemLinkedCost += calculateEffectCost(linked, 0).totalCost;
      }
      let itemAltCost = 0;
      for (const alt of (item.alternateEffects || [])) {
        itemAltCost += alt.isDynamic ? 2 : 1;
      }
      compoundSum += itemMainCost + itemLinkedCost + itemAltCost;
    }
    let sharedFlatTotal = Number(power.activationCost) || 0;
    if (Array.isArray(power.sharedModifiers)) {
      for (const mod of power.sharedModifiers) {
        sharedFlatTotal += Number(mod.cost) || 0;
      }
    }
    const rawSubtotal = Math.max(1, compoundSum + sharedFlatTotal);
    const discount = calculateDeviceDiscount(rawSubtotal, power.deviceConfig?.type || 'none');
    return Math.max(1, rawSubtotal - discount);
  }

  // 1. Main effect cost
  const mainCost = calculateEffectCost(power.mainEffect, 0).totalCost;

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

  let subtotalRaw = mainCost + linkedCost + alternateCost;
  if (power.activationCost) {
    subtotalRaw = Math.max(1, subtotalRaw + power.activationCost);
  }

  // 4. Device discount
  const discount = calculateDeviceDiscount(subtotalRaw, power.deviceConfig?.type || 'none');
  const finalCost = Math.max(1, subtotalRaw - discount);

  return finalCost;
}

/**
 * Calculates a comprehensive breakdown of power points.
 */
export function calculatePowerDetailedBreakdown(rawPower) {
  if (!rawPower) return null;
  const power = normalizePower(rawPower);

  // Device Container Architecture
  if (power.type === 'device') {
    const subPowerBreakdowns = (power.devicePowers || []).map((sub, idx) => {
      const subMainBreakdown = calculateEffectCost(sub.effect || createEmptyEffect(), 0);
      const subMainCost = subMainBreakdown.totalCost;

      const subLinkedBreakdowns = (sub.linkedEffects || []).map(l => ({
        name: l.name || l.baseEffect,
        cost: calculateEffectCost(l, 0).totalCost,
        details: calculateEffectCost(l, 0)
      }));
      const subLinkedCost = subLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

      const isSubArray = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
      const subAlternateBreakdowns = isSubArray ? sub.alternateEffects.map(a => {
        const slotEffectCost = calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost;
        const slotLinkedBreakdowns = (a.linkedEffects || []).map(le => ({
          name: le.name || le.baseEffect,
          cost: calculateEffectCost(le, 0).totalCost,
          details: calculateEffectCost(le, 0)
        }));
        const slotLinkedCost = slotLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);
        const combinedSlotValue = slotEffectCost + slotLinkedCost;

        return {
          name: a.name || a.effect?.name || 'Alternate Slot',
          isDynamic: Boolean(a.isDynamic),
          slotCost: a.isDynamic ? 2 : 1,
          effectCost: combinedSlotValue,
          linkedCost: slotLinkedCost,
          linkedBreakdowns: slotLinkedBreakdowns
        };
      }) : [];

      const subAlternateCost = subAlternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);
      const subArrayCapacity = subMainCost + subLinkedCost;
      const highestSlotCost = subAlternateBreakdowns.reduce((max, s) => Math.max(max, s.effectCost), 0);
      const isArrayOverflow = isSubArray && highestSlotCost > subArrayCapacity;
      const totalCost = subMainCost + subLinkedCost + subAlternateCost;

      return {
        id: sub.id || idx,
        name: sub.name || `Sub-Power #${idx + 1}`,
        mainCost: subMainCost,
        mainBreakdown: subMainBreakdown,
        linkedCost: subLinkedCost,
        linkedBreakdowns: subLinkedBreakdowns,
        isSubArray,
        arrayCapacity: subArrayCapacity,
        subArrayCapacity,
        highestSlotCost,
        isArrayOverflow,
        alternateCost: subAlternateCost,
        alternateBreakdowns: subAlternateBreakdowns,
        totalCost
      };
    });

    const subPowersSum = subPowerBreakdowns.reduce((sum, sp) => sum + sp.totalCost, 0);
    const rawSubtotal = Math.max(1, subPowersSum + (power.activationCost || 0));
    const deviceType = power.deviceConfig?.type || 'removable';
    const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
    const finalCost = Math.max(1, rawSubtotal - deviceDiscount);

    // Formula string
    const subParts = subPowerBreakdowns.map(sp => {
      if (sp.isSubArray) {
        return `[${sp.name} (Array: ${sp.arrayCapacity} PP + ${sp.alternateBreakdowns.length} Slots: ${sp.alternateCost} PP): ${sp.totalCost} PP]`;
      }
      return `[${sp.name}: ${sp.totalCost} PP]`;
    });
    let formulaString = subParts.join(' + ');
    if (power.activationCost) {
      formulaString += ` - Activation (${power.activation === 'move' ? 'Move' : 'Standard'}): ${Math.abs(power.activationCost)} PP`;
    }
    formulaString += ` = ${rawSubtotal} PP`;
    if (deviceDiscount > 0) {
      formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
    }
    formulaString += ` = ${finalCost} PP`;

    return {
      isDeviceContainer: true,
      activation: power.activation || 'none',
      activationCost: power.activationCost || 0,
      subPowerBreakdowns,
      subPowersSum,
      mainCost: subPowerBreakdowns[0]?.mainCost || 0,
      mainBreakdown: subPowerBreakdowns[0]?.mainBreakdown || calculateEffectCost(power.mainEffect, 0),
      linkedCost: subPowerBreakdowns[0]?.linkedCost || 0,
      linkedBreakdowns: subPowerBreakdowns[0]?.linkedBreakdowns || [],
      alternateCost: 0,
      alternateBreakdowns: [],
      rawSubtotal,
      subtotalBeforeDiscount: rawSubtotal,
      deviceType,
      deviceDiscount,
      discount: deviceDiscount,
      finalCost,
      formulaString,
      arrayCapacity: rawSubtotal
    };
  }

  // Compound Power Architecture (Deluxe Hero's Handbook p. 136-137 & p. 147)
  if (power.type === 'compound') {
    const compoundBreakdowns = (power.compoundEffects || []).map((sub, idx) => {
      const breakdown = calculateEffectCost(sub.effect || createEmptyEffect(), 0);
      const subMainCost = breakdown.totalCost;

      const subLinkedBreakdowns = (sub.linkedEffects || []).map(l => ({
        name: l.name || l.baseEffect,
        cost: calculateEffectCost(l, 0).totalCost,
        details: calculateEffectCost(l, 0)
      }));
      const subLinkedCost = subLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

      const isSubArray = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
      const subAlternateBreakdowns = isSubArray ? sub.alternateEffects.map(a => {
        const slotEffectCost = calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost;
        const slotLinkedBreakdowns = (a.linkedEffects || []).map(le => ({
          name: le.name || le.baseEffect,
          cost: calculateEffectCost(le, 0).totalCost,
          details: calculateEffectCost(le, 0)
        }));
        const slotLinkedCost = slotLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);
        const combinedSlotValue = slotEffectCost + slotLinkedCost;

        return {
          name: a.name || a.effect?.name || 'Alternate Slot',
          isDynamic: Boolean(a.isDynamic),
          slotCost: a.isDynamic ? 2 : 1,
          effectCost: combinedSlotValue,
          linkedCost: slotLinkedCost,
          linkedBreakdowns: slotLinkedBreakdowns
        };
      }) : [];

      const subAlternateCost = subAlternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);
      const subArrayCapacity = subMainCost + subLinkedCost;
      const highestSlotCost = subAlternateBreakdowns.reduce((max, s) => Math.max(max, s.effectCost), 0);
      const isArrayOverflow = isSubArray && highestSlotCost > subArrayCapacity;
      const totalCost = subMainCost + subLinkedCost + subAlternateCost;

      return {
        id: sub.id || idx,
        name: sub.name || `Effect #${idx + 1}`,
        baseEffect: sub.effect?.baseEffect || 'Damage',
        ranks: sub.effect?.ranks || 1,
        range: sub.effect?.range || 'Close',
        action: sub.effect?.action || 'Standard',
        duration: sub.effect?.duration || 'Instant',
        isPrimaryAction: Boolean(sub.isPrimaryAction),
        isLinked: false,
        linkGroupId: sub.linkGroupId || 'link_group_1',
        mainCost: subMainCost,
        breakdown,
        linkedCost: subLinkedCost,
        linkedBreakdowns: subLinkedBreakdowns,
        isSubArray,
        arrayCapacity: subArrayCapacity,
        subArrayCapacity,
        highestSlotCost,
        isArrayOverflow,
        alternateCost: subAlternateCost,
        alternateBreakdowns: subAlternateBreakdowns,
        totalCost,
        cost: totalCost
      };
    });

    const effectsSum = compoundBreakdowns.reduce((sum, item) => sum + item.totalCost, 0);
    let sharedFlatTotal = Number(power.activationCost) || 0;
    const sharedModBreakdowns = (power.sharedModifiers || []).map(m => {
      const cost = Number(m.cost) || 0;
      sharedFlatTotal += cost;
      return {
        name: m.name || 'Shared Modifier',
        cost,
        type: m.type || 'flat'
      };
    });

    const rawSubtotal = Math.max(1, effectsSum + sharedFlatTotal);
    const deviceType = power.deviceConfig?.type || 'none';
    const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
    const finalCost = Math.max(1, rawSubtotal - deviceDiscount);

    const parts = compoundBreakdowns.map(item => `[${item.name}: ${item.totalCost} PP]`);
    let formulaString = parts.length > 0 ? parts.join(' + ') : '0 PP';
    if (power.activationCost) {
      formulaString += ` - Activation (${power.activation === 'move' ? 'Move' : 'Standard'}): ${Math.abs(power.activationCost)} PP`;
    }
    sharedModBreakdowns.forEach(sm => {
      if (sm.cost !== 0) {
        formulaString += ` ${sm.cost > 0 ? '+' : '-'} ${sm.name}: ${Math.abs(sm.cost)} PP`;
      }
    });
    if (deviceDiscount > 0) {
      formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
    }
    formulaString += ` = ${finalCost} PP`;

    return {
      isCompound: true,
      isDeviceContainer: deviceDiscount > 0,
      compoundMode: power.compoundMode || 'linked',
      compoundBreakdowns,
      effectsSum,
      sharedModBreakdowns,
      sharedFlatTotal,
      activation: power.activation || 'none',
      activationCost: power.activationCost || 0,
      mainCost: compoundBreakdowns[0]?.mainCost || 0,
      mainBreakdown: compoundBreakdowns[0]?.breakdown || calculateEffectCost(power.mainEffect, 0),
      linkedCost: compoundBreakdowns.reduce((sum, item) => sum + item.linkedCost, 0),
      alternateCost: compoundBreakdowns.reduce((sum, item) => sum + item.alternateCost, 0),
      alternateBreakdowns: [],
      rawSubtotal,
      subtotalBeforeDiscount: rawSubtotal,
      deviceType,
      deviceDiscount,
      discount: deviceDiscount,
      finalCost,
      formulaString,
      arrayCapacity: finalCost
    };
  }

  const mainBreakdown = calculateEffectCost(power.mainEffect, 0);
  const mainCost = mainBreakdown.totalCost;

  const linkedBreakdowns = power.linkedEffects.map(l => ({
    name: l.name || l.baseEffect,
    cost: calculateEffectCost(l, 0).totalCost,
    details: calculateEffectCost(l, 0)
  }));
  const linkedCost = linkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);

  const alternateBreakdowns = power.alternateEffects.map(a => {
    const baseCost = calculateEffectCost(a.effect || createEmptyEffect(), 0).totalCost;
    const slotLinkedBreakdowns = (a.linkedEffects || []).map(le => ({
      name: le.name || le.baseEffect,
      cost: calculateEffectCost(le, 0).totalCost,
      details: calculateEffectCost(le, 0)
    }));
    const slotLinkedCost = slotLinkedBreakdowns.reduce((sum, item) => sum + item.cost, 0);
    const combinedSlotValue = baseCost + slotLinkedCost;

    return {
      name: a.name || a.effect?.name || 'Alternate Slot',
      isDynamic: Boolean(a.isDynamic),
      slotCost: a.isDynamic ? 2 : 1,
      baseCost,
      linkedCost: slotLinkedCost,
      linkedBreakdowns: slotLinkedBreakdowns,
      combinedSlotValue,
      effectCost: combinedSlotValue
    };
  });
  const alternateCost = alternateBreakdowns.reduce((sum, item) => sum + item.slotCost, 0);

  const subtotalBeforeActivation = mainCost + linkedCost + alternateCost;
  const rawSubtotal = Math.max(1, subtotalBeforeActivation + (power.activationCost || 0));
  const deviceType = power.deviceConfig?.type || 'none';
  const deviceDiscount = calculateDeviceDiscount(rawSubtotal, deviceType);
  const finalCost = Math.max(1, rawSubtotal - deviceDiscount);

  // In M&M 3e, the primary power suite budget capacity is the full value of the primary power
  // (Main Effect + its Linked Effects)
  const primarySuiteCapacity = mainCost + linkedCost;

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
  if (power.activationCost) {
    formulaString += ` - Activation (${power.activation === 'move' ? 'Move' : 'Standard'}): ${Math.abs(power.activationCost)} PP`;
  }
  if (deviceDiscount > 0) {
    formulaString += ` - Device (${deviceType === 'easily_removable' ? 'Easily Removable' : 'Removable'}): ${deviceDiscount} PP`;
  }
  formulaString += ` = ${finalCost} PP`;

  return {
    isDeviceContainer: false,
    activation: power.activation || 'none',
    activationCost: power.activationCost || 0,
    mainCost,
    mainBreakdown,
    linkedCost,
    linkedBreakdowns,
    alternateCost,
    alternateBreakdowns,
    primarySuiteCapacity,
    arrayCapacity: primarySuiteCapacity,
    subtotalBeforeActivation,
    rawSubtotal,
    subtotalBeforeDiscount: rawSubtotal,
    deviceType,
    deviceDiscount,
    discount: deviceDiscount,
    finalCost,
    formulaString,
    arrayCapacity: primarySuiteCapacity // Max cost any alternate slot is allowed to have (Main + Linked)
  };
}

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

/**
 * Creates a new Alternate Effect slot by deep-cloning an effect (usually mainEffect)
 * to make creating power variants instantaneous.
 */
export function createAlternateSlotFromEffect(sourceEffect, slotName = '', isDynamic = false) {
  const norm = normalizeEffect(sourceEffect);
  const clonedEffect = JSON.parse(JSON.stringify(norm));
  clonedEffect.id = 'eff_alt_' + Date.now() + Math.random().toString(36).substr(2, 4);
  const name = slotName.trim() || `${norm.name || norm.baseEffect} (Variant)`;
  clonedEffect.name = name;
  return {
    id: 'alt_' + Date.now() + Math.random().toString(36).substr(2, 4),
    name,
    isDynamic: Boolean(isDynamic),
    effect: clonedEffect
  };
}

/**
 * Popular standard M&M 3e Linked Effect combo presets.
 */
export const COMMON_LINKED_COMBOS = [
  {
    name: 'Poison / Toxic Strike',
    desc: 'Physical Damage linked with Fortitude Affliction (Dazed / Stunned / Incapacitated).',
    effect: 'Affliction',
    resistance: 'Fortitude',
    defaultRanks: 8
  },
  {
    name: 'Corrosive Acid',
    desc: 'Burning Damage linked with Weaken Toughness to melt armor.',
    effect: 'Weaken',
    resistance: 'Fortitude',
    defaultRanks: 8
  },
  {
    name: 'Taser / Stun Shock',
    desc: 'Electrical Damage linked with Affliction (Dazed / Defenseless / Paralyzed).',
    effect: 'Affliction',
    resistance: 'Fortitude',
    defaultRanks: 8
  },
  {
    name: 'Telekinetic Strike',
    desc: 'Ranged impact Damage linked with Move Object for knockback.',
    effect: 'Move Object',
    resistance: 'Dodge',
    defaultRanks: 6
  }
];


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

  const isMoveObjectDamaging = effect.baseEffect === 'Move Object' && effect.extras.some(e => e.name === 'Damaging');
  const isOffensive = ['Damage', 'Blast', 'Affliction', 'Weaken', 'Nullify'].includes(effect.baseEffect) || isMoveObjectDamaging;
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

  // Strength-based modifier bonus
  const isStrengthBased = effect.baseEffect === 'Damage' && effect.extras.some(e => e.name === 'Strength-based');
  const strBonus = isStrengthBased ? (Number(abilities.STR) || 0) : 0;
  const effectiveRank = effect.ranks + strBonus;

  // Difficulty Class (DC)
  let dc = 0;
  let dcDescription = '';
  if (effect.baseEffect === 'Damage' || effect.baseEffect === 'Blast' || isMoveObjectDamaging) {
    dc = 15 + effectiveRank;
    dcDescription = isStrengthBased
      ? `DC ${dc} vs Toughness (STR ${strBonus >= 0 ? '+' : ''}${strBonus} + Rk ${effect.ranks})`
      : `DC ${dc} vs Toughness`;
  } else if (effect.baseEffect === 'Affliction') {
    dc = 10 + effect.ranks;
    const resDefense = effect.config?.resistance || effect.resistance || 'Fortitude';
    dcDescription = `DC ${dc} vs ${resDefense}`;
  } else if (effect.baseEffect === 'Weaken') {
    dc = 10 + effect.ranks;
    const resDefense = effect.config?.resistance || effect.resistance || 'Fortitude';
    dcDescription = `DC ${dc} vs ${resDefense}`;
  } else if (effect.baseEffect === 'Nullify') {
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
      currentTotal = (finalAttackBonus || 0) + effectiveRank;
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
