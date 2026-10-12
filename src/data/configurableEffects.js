import { ADVANTAGES } from '../rules/advantages.js';

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
    defaultTraits: ['Strength'],
    computeCost: (config) => {
      const cat = config?.traitCategory || 'abilities';
      const targets = Array.isArray(config?.selectedTraits) && config.selectedTraits.length > 0
        ? config.selectedTraits
        : [config?.traitName || 'Strength'];
      let total = 0;
      const defaultCategoryCost = cat === 'defenses' ? 1 : (cat === 'advantages' ? 1 : (cat === 'skills' ? 0.5 : 2));
      targets.forEach(t => {
        const custom = (config?.customItems || []).find(c => c.id === t || c.name === t);
        if (custom && (custom.cost !== undefined || custom.pts !== undefined)) {
          total += Number(custom.cost ?? custom.pts);
        } else {
          total += defaultCategoryCost;
        }
      });
      return Math.max(0.5, total);
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
    label: 'Movement Library',
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
          const custom = (config?.customItems || []).find(c => c.id === m || c.name === m);
          sum += custom ? (Number(custom.ranks || custom.pts) || 1) : 1;
        }
      });
      return Math.max(1, sum);
    }
  },

  'Immunity': {
    type: 'immunity_multiselect_library',
    label: 'Immunity Library',
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
      (config?.customItems || []).forEach(c => {
        const val = Number(c.ranks || c.pts) || 1;
        dict[c.id] = val;
        dict[c.name] = val;
      });
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
    label: 'Comprehend Library',
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
      (config?.customItems || []).forEach(c => {
        const val = Number(c.ranks || c.pts) || 1;
        dict[c.id] = val;
        dict[c.name] = val;
      });
      modes.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Environment': {
    type: 'environment_multiselect_library',
    label: 'Environment Library',
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
      (config?.customItems || []).forEach(c => {
        const val = Number(c.cost || c.pts || c.ranks) || 1;
        dict[c.id] = val;
        dict[c.name] = val;
      });
      elements.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Senses': {
    type: 'senses_multiselect_library',
    label: 'Senses Library',
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
      (config?.customItems || []).forEach(c => {
        const val = Number(c.pts || c.ranks) || 1;
        dict[c.id] = val;
        dict[c.name] = val;
      });
      faculties.forEach(id => {
        sum += (dict[id] || 1);
      });
      return Math.max(1, sum);
    }
  },

  'Concealment': {
    type: 'concealment_multiselect_library',
    label: 'Concealment Library',
    srdNotice: 'Visual senses cost double (2 Ranks for single, 4 Ranks for all visual). Non-visual senses cost 1 Rank each (2 Ranks for entire sense type). Tactile senses cannot be concealed per SRD rules (requires Insubstantial). All non-tactile senses = 10 Ranks.',
    categories: [
      { id: 'all', label: 'All Senses' },
      { id: 'visual', label: 'Visual (Costs Double)' },
      { id: 'auditory', label: 'Auditory' },
      { id: 'olfactory', label: 'Olfactory' },
      { id: 'radio', label: 'Radio' },
      { id: 'mental_exotic', label: 'Mental & Exotic' }
    ],
    options: [
      { id: 'visual_normal', name: 'Normal Vision', ranks: 2, category: 'visual', scope: 'single', scopeLabel: 'Single Visual Sense', desc: 'Invisible to normal optical sight (+5 circumstance bonus to active defense vs visual attacks). Standard invisibility.', icon: 'ri-eye-off-line' },
      { id: 'visual_infra', name: 'Infravision', ranks: 2, category: 'visual', scope: 'single', scopeLabel: 'Single Visual Sense', desc: 'Undetectable by infrared vision, thermal imaging scopes, and heat signatures.', icon: 'ri-fire-line' },
      { id: 'visual_ultra', name: 'Ultravision', ranks: 2, category: 'visual', scope: 'single', scopeLabel: 'Single Visual Sense', desc: 'Undetectable by ultraviolet light perception, blacklight scanners, and UV cameras.', icon: 'ri-sun-line' },
      { id: 'visual_all', name: 'All Visual Senses', ranks: 4, category: 'visual', scope: 'type', scopeLabel: 'Entire Sense Type', desc: 'Total concealment from the entire visual sense type (normal sight, infravision, ultravision, low-light vision). Complete optical invisibility.', icon: 'ri-eye-close-line' },

      { id: 'auditory_normal', name: 'Normal Hearing', ranks: 1, category: 'auditory', scope: 'single', scopeLabel: 'Single Sense', desc: 'Completely silent to normal hearing: emit no acoustic footsteps, vocal sounds, or equipment noise.', icon: 'ri-volume-mute-line' },
      { id: 'auditory_ultra', name: 'Ultra-Hearing', ranks: 1, category: 'auditory', scope: 'single', scopeLabel: 'Single Sense', desc: 'Undetectable by ultrasonic sound sensors, dog whistles, high/low frequency acoustics, and sonar.', icon: 'ri-sound-module-line' },
      { id: 'auditory_all', name: 'All Auditory Senses', ranks: 2, category: 'auditory', scope: 'type', scopeLabel: 'Entire Sense Type', desc: 'Total concealment from the entire auditory sense type (normal hearing, ultra-hearing, and acoustic echolocation). Complete acoustic void.', icon: 'ri-volume-off-vibrate-line' },

      { id: 'olfactory_normal', name: 'Normal Scent', ranks: 1, category: 'olfactory', scope: 'single', scopeLabel: 'Single Sense', desc: 'Completely odorless: immune to scent hounds, natural tracking by smell, and basic odor detection.', icon: 'ri-drop-line' },
      { id: 'olfactory_all', name: 'All Olfactory Senses', ranks: 2, category: 'olfactory', scope: 'type', scopeLabel: 'Entire Sense Type', desc: 'Total concealment from the entire olfactory & gustatory sense type (smell and taste, including acute scent and chemical analyzers).', icon: 'ri-flask-line' },

      { id: 'radio_normal', name: 'Radio Frequency', ranks: 1, category: 'radio', scope: 'single', scopeLabel: 'Single Sense', desc: 'Undetectable by standard radio receivers, wireless signals, cellular sniffers, and RF scanners.', icon: 'ri-broadcast-line' },
      { id: 'radio_radar', name: 'Radar', ranks: 1, category: 'radio', scope: 'single', scopeLabel: 'Single Sense', desc: 'Radar-absorbent stealth: undetectable by active microwave radar dishes and tracking radar.', icon: 'ri-radar-line' },
      { id: 'radio_all', name: 'All Radio Senses', ranks: 2, category: 'radio', scope: 'type', scopeLabel: 'Entire Sense Type', desc: 'Total concealment from the entire radio sense type (radio broadcasts, radar, microwave pulses, and electronic communications).', icon: 'ri-signal-wifi-off-line' },

      { id: 'mental_normal', name: 'Mental Awareness', ranks: 1, category: 'mental_exotic', scope: 'single', scopeLabel: 'Single Sense', desc: 'Telepathic mind blank: telepaths, psionic detectors, and mental awareness cannot locate your mind.', icon: 'ri-brain-line' },
      { id: 'mental_all', name: 'All Mental Senses', ranks: 2, category: 'mental_exotic', scope: 'type', scopeLabel: 'Entire Sense Type', desc: 'Total concealment from the entire mental sense type (telepathic scans, mind reading, psychic tracking, and empathic awareness).', icon: 'ri-mind-map' },
      { id: 'exotic_mystic', name: 'Mystical Awareness', ranks: 1, category: 'mental_exotic', scope: 'single', scopeLabel: 'Single Sense', desc: 'Cloaked from magical divination, aura reading, arcane detection, and witch-sight.', icon: 'ri-sparkling-line' },
      { id: 'exotic_all', name: 'Other Exotic Sense Type', ranks: 2, category: 'mental_exotic', scope: 'type', scopeLabel: 'Entire Sense Type', desc: 'Total concealment from an entire exotic sense type (e.g. Cosmic Awareness, Divine Awareness, or Dimensional Awareness).', icon: 'ri-compass-3-line' },

      { id: 'all_senses', name: 'All Senses (Non-Tactile)', ranks: 10, category: 'all', scope: 'universal', scopeLabel: 'Universal (All Types)', desc: 'Total concealment from all sense types other than tactile (visual, auditory, olfactory, radio, mental, and exotic). The ultimate cloak.', icon: 'ri-shield-star-line' }
    ],
    defaultSenses: ['visual_normal'],
    computeRanks: (config) => {
      const senses = Array.isArray(config?.selectedSenses) && config.selectedSenses.length > 0
        ? config.selectedSenses
        : ['visual_normal'];

      if (senses.includes('all_senses')) return 10;

      let ranks = 0;

      if (senses.includes('visual_all')) {
        ranks += 4;
      } else {
        const visualCount = ['visual_normal', 'visual_infra', 'visual_ultra'].filter(id => senses.includes(id)).length;
        ranks += Math.min(4, visualCount * 2);
      }

      if (senses.includes('auditory_all')) {
        ranks += 2;
      } else {
        const audCount = ['auditory_normal', 'auditory_ultra'].filter(id => senses.includes(id)).length;
        ranks += Math.min(2, audCount * 1);
      }

      if (senses.includes('olfactory_all')) {
        ranks += 2;
      } else if (senses.includes('olfactory_normal')) {
        ranks += 1;
      }

      if (senses.includes('radio_all')) {
        ranks += 2;
      } else {
        const radioCount = ['radio_normal', 'radio_radar'].filter(id => senses.includes(id)).length;
        ranks += Math.min(2, radioCount * 1);
      }

      if (senses.includes('mental_all')) {
        ranks += 2;
      } else if (senses.includes('mental_normal')) {
        ranks += 1;
      }

      if (senses.includes('exotic_all')) {
        ranks += 2;
      } else if (senses.includes('exotic_mystic')) {
        ranks += 1;
      }

      const mapped = new Set([
        'visual_normal', 'visual_infra', 'visual_ultra', 'visual_all',
        'auditory_normal', 'auditory_ultra', 'auditory_all',
        'olfactory_normal', 'olfactory_all',
        'radio_normal', 'radio_radar', 'radio_all',
        'mental_normal', 'mental_all',
        'exotic_mystic', 'exotic_all',
        'all_senses'
      ]);
      senses.forEach(id => {
        if (!mapped.has(id)) {
          const custom = (config?.customItems || []).find(c => c.id === id || c.name === id);
          ranks += custom ? (Number(custom.ranks || custom.pts) || 1) : 1;
        }
      });

      return Math.min(10, Math.max(1, ranks));
    }
  },

  'Variable': {
    type: 'variable_theme',
    label: 'Theme & Scope of Variable Pool',
    themes: ['Magic / Sorcery', 'Cosmic Energy', 'Shape-shifting', 'Power Mimicry', 'Nanotech / Gadgets', 'Mutation', 'Psionics'],
    defaultTheme: 'Magic / Sorcery'
  }
};
