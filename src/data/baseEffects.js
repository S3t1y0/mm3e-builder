export const EFFECT_CATEGORIES = [
  'All',
  'Attack',
  'Control',
  'Defense',
  'General',
  'Movement',
  'Sensory'
];

export const BASE_EFFECT_ICONS = {
  Affliction: 'ri-virus-line',
  Blast: 'ri-flashlight-line',
  Burrowing: 'ri-earth-line',
  Communication: 'ri-broadcast-line',
  Comprehend: 'ri-translate-2',
  Concealment: 'ri-eye-close-line',
  Create: 'ri-magic-line',
  Damage: 'ri-sword-line',
  Deflect: 'ri-shield-flash-line',
  Elongation: 'ri-expand-diagonal-line',
  'Enhanced Trait': 'ri-arrow-up-circle-line',
  Environment: 'ri-sun-cloudy-line',
  'Extra Limbs': 'ri-git-branch-line',
  Feature: 'ri-sparkling-line',
  Flight: 'ri-flight-takeoff-line',
  Growth: 'ri-fullscreen-line',
  Healing: 'ri-heart-pulse-line',
  Illusion: 'ri-sparkling-2-line',
  Immortality: 'ri-infinity-line',
  Immunity: 'ri-shield-cross-line',
  Insubstantial: 'ri-ghost-line',
  Leaping: 'ri-arrow-up-line',
  'Luck Control': 'ri-dice-line',
  'Mind Reading': 'ri-brain-line',
  Morph: 'ri-user-shared-line',
  'Move Object': 'ri-hand-coin-line',
  Movement: 'ri-compass-3-line',
  Nullify: 'ri-prohibited-line',
  Protection: 'ri-shield-line',
  Quickness: 'ri-timer-flash-line',
  Regeneration: 'ri-refresh-line',
  'Remote Sensing': 'ri-radar-line',
  Senses: 'ri-eye-line',
  Shrinking: 'ri-fullscreen-exit-line',
  Speed: 'ri-run-line',
  Summon: 'ri-team-line',
  Swimming: 'ri-drop-line',
  Teleport: 'ri-crosshair-2-line',
  Transform: 'ri-flask-line',
  Variable: 'ri-dashboard-3-line',
  Weaken: 'ri-arrow-down-circle-line'
};

export function getBaseEffectIcon(baseEffect) {
  if (!baseEffect) return 'ri-shield-star-line';
  if (BASE_EFFECT_ICONS[baseEffect]) return BASE_EFFECT_ICONS[baseEffect];

  const clean = String(baseEffect).toLowerCase();
  if (clean.includes('attack') || clean.includes('damage') || clean.includes('strike') || clean.includes('blast')) return 'ri-sword-line';
  if (clean.includes('defend') || clean.includes('shield') || clean.includes('protect') || clean.includes('armor')) return 'ri-shield-line';
  if (clean.includes('move') || clean.includes('speed') || clean.includes('flight') || clean.includes('teleport')) return 'ri-compass-3-line';
  if (clean.includes('sense') || clean.includes('sight') || clean.includes('mind') || clean.includes('aura')) return 'ri-eye-line';
  if (clean.includes('heal') || clean.includes('regen') || clean.includes('life')) return 'ri-heart-pulse-line';
  return 'ri-shield-star-line';
}

export const BASE_EFFECTS = [
  { name: 'Affliction', category: 'Attack', cost: 1, range: 'Close', action: 'Standard', duration: 'Instant', resistance: 'Fortitude or Will', desc: 'You can impose some debilitating condition or conditions on a target by making a close attack. You set the conditions your Affliction inflicts at each of three degrees of failure (Fortitude or Will vs DC 10 + rank). First degree causes conditions like Dazed, Hindered, or Fatigued; second degree causes Compelled, Defenseless, Disabled, Exhausted, Immobile, or Stunned; third degree causes Asleep, Controlled, Incapacitated, Paralyzed, or Transformed.' },
  { name: 'Blast', category: 'Attack', cost: 2, range: 'Ranged', action: 'Standard', duration: 'Instant', resistance: 'Toughness', desc: 'You can make a damaging ranged attack. It might be a blast of energy, a projectile (arrow, bullet, throwing blade, etc.), or some similar effect. You make a ranged attack check against the target’s Dodge defense. The attack’s damage equals your power rank and the target makes a Toughness resistance check against it.' },
  { name: 'Burrowing', category: 'Movement', cost: 1, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You can burrow through the ground, leaving a tunnel behind if you choose. You move through soil and sand at a speed rank equal to your Burrowing rank, minus 5. So Burrowing 8, for example, lets you move through the ground at speed rank 3 (around 16 MPH). Burrowing through hard clay and packed earth reduces speed one additional rank. Burrowing through solid rock reduces it by two additional ranks. The tunnel you leave behind is either permanent or collapses behind you immediately (your choice when you begin burrowing each new tunnel). Note that Burrowing differs from the Permeate effect of Movement, which allows you to pass through an obstacle like the ground at your normal speed without disturbing it at all.' },
  { name: 'Communication', category: 'Sensory', cost: 4, range: 'Rank', action: 'Free', duration: 'Sustained', desc: 'You can communicate over a distance using a medium other than your normal voice (such as mental telepathy, radio frequencies, mystical sendings, or ultrasonic signals) across distances determined by your rank on the Measurements Table.' },
  { name: 'Comprehend', category: 'Sensory', cost: 2, range: 'Personal', action: 'None', duration: 'Continuous', desc: 'You can comprehend different sorts of communication. Each rank in this effect allows you to understand, speak, or read foreign languages, communicate with animals, plants, machines, or spirits, or understand all spoken concepts.' },
  { name: 'Concealment', category: 'Sensory', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You gain total concealment from a particular sense while this effect is active, making you undetectable to that sense (+5 circumstance bonus to active defense vs attacks relying on that sense). Visual senses cost double (2 ranks for one sense, 4 ranks for all visual). Non-visual senses cost 1 rank each (2 ranks for entire sense type). Tactile senses cannot be concealed per SRD (requires Insubstantial). All non-tactile senses cost 10 ranks.' },
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
  { name: 'Movement', category: 'Movement', cost: 2, range: 'Personal', action: 'Free', duration: 'Sustained', desc: 'You have special superhuman modes of locomotion. Each rank allows choosing options such as Dimension Travel, Environmental Adaptation, Permeate, Safe Fall, Slithering, Space Travel, Sure-Footed, Swinging, Time Travel, Trackless, Wall-crawling, or Water Walking.' },
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
