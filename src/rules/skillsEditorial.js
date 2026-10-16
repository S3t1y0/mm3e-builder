// src/rules/skillsEditorial.js

export const SKILL_ICONS = {
  'Acrobatics': 'ri-run-line',
  'Athletics': 'ri-boxing-line',
  'Close Combat': 'ri-sword-line',
  'Deception': 'ri-ghost-line',
  'Expertise': 'ri-book-open-line',
  'Insight': 'ri-compass-3-line',
  'Intimidation': 'ri-skull-line',
  'Investigation': 'ri-search-eye-line',
  'Perception': 'ri-eye-line',
  'Persuasion': 'ri-chat-smile-2-line',
  'Ranged Combat': 'ri-crosshair-2-line',
  'Sleight of Hand': 'ri-hand-coin-line',
  'Stealth': 'ri-footprint-line',
  'Technology': 'ri-cpu-line',
  'Treatment': 'ri-first-aid-kit-line',
  'Vehicles': 'ri-car-line'
};

export const SKILL_EDITORIAL = {
  'Acrobatics': {
    action: 'Move / Free Action',
    traits: ['Trained Only'],
    trainedOnly: true,
    synergyAdvantages: ['Agile Feint', 'Instant Up', 'Skill Mastery'],
    overview: 'Acrobatics covers flips, balancing, contortionism, gymnastics, and aerial maneuvers. Use it to cross narrow footing, stand up quickly from prone, and soften damage when falling.',
    routine: 'Routine checks apply to casual gymnastics or balancing without distractions. Combat, surprise, or hazards prevent routine checks.',
    dcTable: [
      { dc: '10', label: 'Routine', example: 'Walk across a balance beam or wide roof ledge' },
      { dc: '15', label: 'Moderate', example: 'Walk across a narrow pipe, slippery wire, or icy surface' },
      { dc: '20', label: 'Hard', example: 'Swing across a wide gap on a cable, or roll out of a 20-foot fall' },
      { dc: '25', label: 'Very Hard', example: 'Tumble through a moving security grid or shifting machinery' },
      { dc: '30+', label: 'Heroic', example: 'Balance on a vibrating wire or narrow cable during heavy crosswinds' }
    ],
    balanceTable: [
      { surface: 'Mud, snow, or rubble (soft / uneven)', dc: 'DC 10', effect: 'Move at half speed' },
      { surface: 'Narrow ledge (3 to 6 inches wide)', dc: 'DC 15', effect: 'Vulnerable (active defense halved)' },
      { surface: 'Narrow pipe or wire (1 to 2 inches wide)', dc: 'DC 20', effect: 'Vulnerable; take -5 check mod to keep defense' },
      { surface: 'Hairline wire, wet beam, or needlepoint', dc: 'DC 25+', effect: 'Failure by 5+ causes an immediate fall' }
    ],
    tasks: [
      { name: 'Balancing Hazard', desc: 'Cross narrow surfaces as a Move action. While balancing you are Vulnerable unless taking a -5 check penalty. Taking damage while balancing forces an immediate reaction check.' },
      { name: 'Stand from Prone', desc: 'Stand up as a Free action with a successful DC 20 check. If you possess the Instant Up advantage, this requires no roll.' },
      { name: 'Fall Damage Reduction', desc: 'Make a DC 5 check when falling. Each degree of success reduces falling distance and damage by 1 rank.' },
      { name: 'Acrobatic Feint', desc: 'Disengage from close combat without penalty, or feint in combat using Acrobatics if you have the Agile Feint advantage.' }
    ]
  },

  'Athletics': {
    action: 'Move Action',
    traits: [],
    trainedOnly: false,
    synergyAdvantages: ['Fast Grab', 'Improved Grab', 'Skill Mastery'],
    overview: 'Athletics covers basic physical exertion: running, swimming, climbing, and jumping. It governs movement over physical obstacles and stamina during sustained activity.',
    routine: 'Routine checks apply when climbing ladders, swimming in calm water, or running on clear ground.',
    dcTable: [
      { dc: '10', label: 'Routine', example: 'Climb a wall with handholds or tread calm water' },
      { dc: '15', label: 'Moderate', example: 'Climb a rough brick wall or swim against a steady current' },
      { dc: '20', label: 'Hard', example: 'Climb an angled overhang or jump across an alleyway' },
      { dc: '25', label: 'Very Hard', example: 'Climb wet stone or swim against choppy open surf' },
      { dc: '30+', label: 'Heroic', example: 'Scale a sheer glass surface or vertical concrete wall without equipment' }
    ],
    jumpTable: [
      { type: 'Running Long-Jump', formula: 'Check Result in feet', example: 'Result 20 = 20 ft horizontal' },
      { type: 'Standing Long-Jump', formula: 'Check Result / 2 in feet', example: 'Result 20 = 10 ft horizontal' },
      { type: 'Running Vertical Jump', formula: 'Check Result / 5 in feet', example: 'Result 20 = 4 ft vertical' },
      { type: 'Standing Vertical Jump', formula: 'Check Result / 10 in feet', example: 'Result 20 = 2 ft vertical' },
      { type: 'Routine Jumping Distance', formula: 'Strength Mod + 10 in feet', example: 'Guaranteed distance without rolling' }
    ],
    climbTable: [
      { surface: 'Rope with wall or knotted rope', dc: 'DC 0 - 5', speed: 'Normal climbing pace' },
      { surface: 'Surface with ample ledges / ladder', dc: 'DC 10', speed: 'Half ground speed' },
      { surface: 'Uneven brick or masonry wall', dc: 'DC 15', speed: 'Half ground speed' },
      { surface: 'Smooth stone, wet rock, or overhang', dc: 'DC 20 - 25', speed: 'Quarter speed / high risk' },
      { surface: 'Catch falling character', dc: 'Climb DC + 10', speed: 'Reaction check within reach' }
    ],
    tasks: [
      { name: 'Climbing', desc: 'Ascend or descend vertical surfaces at half normal ground speed. A reaction check at DC + 10 can catch a falling ally within reach.' },
      { name: 'Jumping and Leaping', desc: 'Horizontal and vertical jumps are determined by your check result. Super-powered Leaping ranks supersede check calculations.' },
      { name: 'Running Sprint', desc: 'A DC 15 check increases your ground speed rank by +1 for 1 round.' },
      { name: 'Swimming and Holding Breath', desc: 'Swim through water at half ground speed. Hold breath for Stamina rank in rounds before requiring DC 10 checks each round.' }
    ]
  },

  'Close Combat': {
    action: 'Standard Action',
    traits: [],
    trainedOnly: false,
    synergyAdvantages: ['Accurate Attack', 'All-out Attack', 'Defensive Attack', 'Improved Critical', 'Power Attack', 'Takedown'],
    overview: 'Close Combat represents attack accuracy with a specific close weapon group, unarmed martial style, or natural attack.',
    routine: 'Attack checks in active combat cannot be made as routine checks.',
    dcTable: [
      { dc: 'Def', label: 'Target Parry', example: 'Opponent active Parry defense score' },
      { dc: '10', label: 'Routine Attack', example: 'Strike an unattended, stationary, or defenseless object' }
    ],
    tasks: [
      { name: 'Close Attack Check', desc: 'Roll d20 + Total Close Combat bonus against the target active Parry defense.' },
      { name: 'Critical Hit', desc: 'A natural 20 or roll within your weapon threat range scores a critical hit (+5 DC bonus or added condition).' },
      { name: 'Combat Maneuvers', desc: 'Combines with combat advantages including All-out Attack, Power Attack, and Defensive Attack.' }
    ]
  },

  'Deception': {
    action: 'Standard Action',
    traits: ['Interaction'],
    trainedOnly: false,
    synergyAdvantages: ['Daze', 'Fascinate', 'Redirect', 'Set-up', 'Taunt'],
    overview: 'Deception covers misleading others through false statements, disguises, combat feints, innuendo, and psychological tricks.',
    routine: 'Routine deception cannot be used against alert, suspicious, or hostile targets.',
    dcTable: [
      { dc: 'Opp', label: 'Insight Check', example: 'Target rolls an opposed Insight check to see through lies' },
      { dc: '15', label: 'Moderate Bluff', example: 'Convince a guard that your credentials are on file' },
      { dc: '20', label: 'Difficult Bluff', example: 'Present an improbable explanation supported by circumstantial evidence' },
      { dc: '25', label: 'Complex Bluff', example: 'Impersonate a known official with no advance preparation' }
    ],
    modifierTable: [
      { situation: 'Target wants to believe the lie', mod: '-5 DC', note: 'Appeals to target existing hopes or bias' },
      { situation: 'Plausible / believable story', mod: '+0 DC', note: 'Standard opposed Insight check' },
      { situation: 'Hard to believe / questionable', mod: '+5 DC', note: 'Lacks supporting evidence or context' },
      { situation: 'Highly improbable / major risk', mod: '+10 DC', note: 'Directly contradicts observable facts' },
      { situation: 'Completely impossible / incredible', mod: '+20 DC', note: 'Defies basic physical laws or direct experience' }
    ],
    disguiseTable: [
      { observer: 'Casual stranger / passerby', bonus: '+0', note: 'Standard opposed Perception vs Deception' },
      { observer: 'Work colleague or associate', bonus: '+2', note: 'Familiar with general posture and habits' },
      { observer: 'Close friend or confidant', bonus: '+5', note: 'Recognizes subtle mannerisms and voice' },
      { observer: 'Spouse, parent, or intimate partner', bonus: '+10', note: 'Deep personal familiarity' }
    ],
    tasks: [
      { name: 'Bluffing and Misdirection', desc: 'Make a false statement seem believable. Opposed by target Insight check, modified by plausibility.' },
      { name: 'Combat Feint', desc: 'Standard action in combat. Opposed by target Insight or Deception. Success leaves target Vulnerable against your next attack.' },
      { name: 'Tricking Opponents', desc: 'Opposed check to make an opponent hit an obstacle, hazard, or ally. Failure by 5+ leaves you Vulnerable.' },
      { name: 'Disguise', desc: 'Takes 10 minutes to 1 hour. Opposed by observer Perception checks with familiarity bonuses.' },
      { name: 'Innuendo', desc: 'Transmit a hidden message to allies: DC 10 (basic), DC 15 (complex), DC 20 (covert). Bystanders miss the real meaning.' }
    ]
  },

  'Expertise': {
    action: 'Varies by Task',
    traits: ['Trained Only'],
    trainedOnly: true,
    synergyAdvantages: ['Artificer', 'Eidetic Memory', 'Ritualist', 'Skill Mastery'],
    overview: 'Expertise covers knowledge, professions, crafts, and academic disciplines. Examples include Science, Law, History, Tactics, Streetwise, and Arcana.',
    routine: 'Routine checks answer common questions or handle standard professional tasks in your field.',
    dcTable: [
      { dc: '10', label: 'Basic', example: 'Common professional knowledge known to entry-level practitioners' },
      { dc: '15', label: 'Intermediate', example: 'Specialized information requiring college-level study' },
      { dc: '20', label: 'Advanced', example: 'Obscure, proprietary, or classified subject matter' },
      { dc: '25', label: 'Expert', example: 'Specialized research and rare historical records' },
      { dc: '30+', label: 'Master', example: 'Decipher alien technology or forgotten ancient rituals' }
    ],
    tasks: [
      { name: 'Recall Knowledge', desc: 'Remember facts, scientific formulas, history, or legal statutes.' },
      { name: 'Crafting and Analysis', desc: 'Produce professional work or analyze technical evidence related to your specialization.' },
      { name: 'Rituals and Inventions', desc: 'Expertise: Magic synergizes with Ritualist; Expertise: Engineering synergizes with Inventor.' }
    ]
  },

  'Insight': {
    action: 'Free Action',
    traits: [],
    trainedOnly: false,
    synergyAdvantages: ['Assessment', 'Trance'],
    overview: 'Insight covers reading intent, detecting lies, evaluating body language, and noticing mental influence or sensory illusions.',
    routine: 'Routine checks allow you to gauge the general mood of a crowd or casual acquaintance.',
    dcTable: [
      { dc: 'Opp', label: 'Deception Check', example: 'Opposed by speaker Deception check' },
      { dc: '15', label: 'Sense Motive', example: 'Gauge whether someone is acting under external duress or nervous strain' },
      { dc: '20', label: 'Detect Influence', example: 'Notice subtle signs of mental control, compulsion, or psychic tampering' },
      { dc: '25', label: 'Anticipate Intent', example: 'Notice an ambush or betrayal immediately before it happens' }
    ],
    mentalTable: [
      { detection: 'Sense Motive / Emotion', dc: 'DC 15', note: 'Detect nervous tension or concealed duress' },
      { detection: 'Detect Illusion', dc: 'DC 10 + Rank', note: 'Secret check vs Illusion power rank to spot sensory flaws' },
      { detection: 'Detect Mental Tampering', dc: 'DC 10 + Rank', note: 'Notice hypnotic compulsion, mind control, or psychic puppetry' },
      { detection: 'Gauge Combat Capabilities', dc: 'Opposed / DC 15', note: 'Synergizes with Assessment advantage to reveal attack & defense' }
    ],
    tasks: [
      { name: 'Detect Lies', desc: 'Opposed check against Deception to recognize falsehoods, evasions, or exaggerations.' },
      { name: 'Detect Mental Influence', desc: 'DC 10 + Effect Rank check to notice that a subject is acting under mental control or telepathic tampering.' },
      { name: 'Detect Illusion', desc: 'Secret check vs DC 10 + Illusion rank when encountering an illusion to recognize sensory flaws.' },
      { name: 'Resist Combat Feints', desc: 'Oppose enemy combat feints or tricks attempting to lower your active defenses.' }
    ]
  },

  'Intimidation': {
    action: 'Standard Action',
    traits: ['Interaction'],
    trainedOnly: false,
    synergyAdvantages: ['Daze', 'Fascinate', 'Startle'],
    overview: 'Intimidation covers frightening foes in combat, interrogating captives, and forcing cooperation through threats.',
    routine: 'Routine intimidation can cow average bystanders, but does not work against determined heroes or villains.',
    dcTable: [
      { dc: 'Opp', label: 'Opposed Check', example: 'Opposed by target Will defense or Intimidation check' },
      { dc: '15', label: 'Coerce Minion', example: 'Force an unarmed henchman to surrender or reveal guard patrol schedules' },
      { dc: '20', label: 'Threaten Group', example: 'Cow a hostile crowd into backing down' },
      { dc: '25', label: 'Interrogation', example: 'Extract critical information from a captured operative' }
    ],
    demoralizeTable: [
      { degree: 'Success (1st Degree)', effect: 'Impaired (-2 on all checks)', duration: '1 Round (end of your next turn)' },
      { degree: '2nd - 3rd Degree', effect: 'Impaired (-2) + Target is shaken', duration: '1 Round' },
      { degree: 'Exceptional (4th Degree / 15+ diff)', effect: 'Disabled (-5 on all checks)', duration: '1 Round' },
      { degree: 'Minions Check', effect: 'Squad routed', duration: 'Minions failing by 2+ degrees flee or cower' }
    ],
    tasks: [
      { name: 'Combat Demoralize', desc: 'Standard action. Opposed by target Will defense or Intimidation check. Inflicts Impaired (-2) or Disabled (-5 on 4th degree).' },
      { name: 'Intimidating Minions', desc: 'Single check vs an entire squad of minions. Minions failing by 2+ degrees flee, surrender, or panic.' },
      { name: 'Coercion and Interrogation', desc: 'Force a non-player character to cooperate temporarily. Later their attitude drops to Hostile.' }
    ]
  },

  'Investigation': {
    action: 'Extended (Area)',
    traits: ['Trained Only', 'Requires Tools'],
    trainedOnly: true,
    synergyAdvantages: ['Contacts', 'Skill Mastery', 'Well-informed'],
    overview: 'Investigation covers searching crime scenes, analyzing physical evidence, and conducting research in public or private records.',
    routine: 'Routine checks apply to thorough searches with proper equipment and no time pressure.',
    dcTable: [
      { dc: '10', label: 'Basic', example: 'Locate obvious physical evidence, muddy footprints, or dropped items' },
      { dc: '15', label: 'Search Scene', example: 'Discover a hidden safe behind a painting or trace an electronic burner phone' },
      { dc: '20', label: 'Forensic Analysis', example: 'Analyze microscopic bullet rifling, chemical residue, or financial records' },
      { dc: '25', label: 'Cold Case', example: 'Reconstruct a multi-stage crime scene from weeks prior with sparse evidence' }
    ],
    searchTable: [
      { area: 'Closet / Booth (30 sq ft)', time: '1 Round (6 sec)', dc: 'DC 10' },
      { area: 'Room / Office (60 - 150 sq ft)', time: '1 Minute (Time Rank 2)', dc: 'DC 15' },
      { area: 'Large House / Penthouse (1,000 sq ft)', time: '4 Minutes (Time Rank 4)', dc: 'DC 15 - 20' },
      { area: 'Warehouse (10,000 sq ft)', time: '15 Minutes (Time Rank 6)', dc: 'DC 20' },
      { area: 'City Block / Docks', time: '1 Hour (Time Rank 9)', dc: 'DC 20 - 25' },
      { area: '1 Square Mile Region', time: '2 Hours (Time Rank 11)', dc: 'DC 25+' }
    ],
    evidenceTable: [
      { condition: 'Fresh crime scene (same day)', mod: '+0 DC', note: 'Undisturbed ballistics and physical residue' },
      { condition: 'Elapsed time per day', mod: '+2 DC / day', note: 'Maximum +10 DC penalty from degradation' },
      { condition: 'Outdoors scene (weather exposure)', mod: '+5 DC', note: 'Wind, rain, sun, or temperature decay' },
      { condition: 'Disturbed / trampled scene', mod: '+2 DC', note: 'First responders or heavy foot traffic' },
      { condition: 'Deliberately cleaned scene', mod: '+5 DC', note: 'Chemical wash, wiped surfaces, or incinerated files' }
    ],
    tasks: [
      { name: 'Search Scene', desc: 'Examine an area for physical clues. Search time is determined by Area Distance Rank + 2.' },
      { name: 'Analyze Evidence', desc: 'Forensic analysis requires forensic tools or crime lab access. Working without tools incurs a -5 penalty.' },
      { name: 'Gather Information', desc: 'Spend hours questioning street contacts and combing records to extract intelligence.' }
    ]
  },

  'Perception': {
    action: 'Free Action',
    traits: [],
    trainedOnly: false,
    synergyAdvantages: ['Tracking', 'Uncanny Dodge'],
    overview: 'Perception covers sensory awareness across sight, hearing, scent, and touch. It determines whether you spot concealed hazards or react to ambushes.',
    routine: 'Routine checks apply to passive observation while on guard or walking through an area.',
    dcTable: [
      { dc: 'Opp', label: 'Stealth Check', example: 'Opposed by target Stealth roll' },
      { dc: '10', label: 'Notice Obvious', example: 'Hear footsteps in a quiet corridor; spot a running figure in daylight' },
      { dc: '15', label: 'Notice Concealed', example: 'Hear a whisper through a door; spot a camouflaged figure in foliage' },
      { dc: '20', label: 'Notice Faint Clue', example: 'Detect faint scent of ozone before an electric trap fires; hear a timer ticking' },
      { dc: '25', label: 'Nearly Hidden', example: 'Detect a concealed microphone or silent sniper at long range' }
    ],
    sensoryTable: [
      { factor: 'Distance Modifier', mod: '-1 per 10 feet', note: 'Linear distance penalty from sound or visual source' },
      { factor: 'Through Interior Wooden Door', mod: '+5 DC', note: 'Hollow core or residential wood door' },
      { factor: 'Through Solid Brick / Stone Wall', mod: '+15 DC', note: 'Masonry barrier or structural concrete' },
      { factor: 'Through Heavy Steel Vault Door', mod: '+25 DC', note: 'Hermetically sealed bank vault or blast door' },
      { factor: 'Character is Asleep', mod: '-10 Check Mod', note: 'Loud sudden sound (DC 0) wakes sleeper on DC 10' }
    ],
    tasks: [
      { name: 'Active Spotting', desc: 'Look or listen closely for hidden opponents, concealed objects, or traps.' },
      { name: 'Passive Awareness', desc: 'Notice unexpected dangers or ambushes before opponents can launch a surprise attack.' },
      { name: 'Barriers and Distance', desc: 'Sounds through walls and distant objects suffer standardized DC penalties.' }
    ]
  },

  'Persuasion': {
    action: '1 Minute+ / Move Rushed',
    traits: ['Interaction'],
    trainedOnly: false,
    synergyAdvantages: ['Attractive', 'Connected', 'Fascinate', 'Inspire', 'Leadership', 'Well-informed'],
    overview: 'Persuasion covers negotiation, diplomacy, and de-escalating tense or hostile situations through dialogue and reason.',
    routine: 'Routine checks apply when making reasonable requests of coworkers or neutral contacts.',
    dcTable: [
      { dc: '15', label: 'Favorable Request', example: 'Convince an indifferent merchant or contact to grant a small favor' },
      { dc: '20', label: 'Reluctant Target', example: 'Persuade a reluctant witness to share relevant details' },
      { dc: '25', label: 'Hostile Ceasefire', example: 'Convince actively hostile adversaries to pause combat and negotiate terms' },
      { dc: '30+', label: 'Difficult Treaty', example: 'Negotiate peace between hostile factions or defuse a hostage standoff' }
    ],
    attitudeLadder: [
      { attitude: 'Hostile', reaction: 'Will take risks to hurt or oppose you', shiftDC: 'DC 15 to Unfavorable' },
      { attitude: 'Unfavorable', reaction: 'Wishes you ill, uncooperative, obstinate', shiftDC: 'DC 15 to Indifferent' },
      { attitude: 'Indifferent', reaction: 'Neutral bystander, neither helps nor hinders', shiftDC: 'DC 15 to Favorable' },
      { attitude: 'Favorable', reaction: 'Warm, cooperative, willing to assist within reason', shiftDC: 'DC 15 to Helpful' },
      { attitude: 'Helpful', reaction: 'Devoted, willing to take substantial risks to help you', shiftDC: 'Maximum Support' }
    ],
    tasks: [
      { name: '5-Step Attitude Shift', desc: 'Hostile -> Unfavorable -> Indifferent -> Favorable -> Helpful. Check DC 15 improves attitude 1 step (+2 degrees per extra step). Failing by 5+ worsens attitude.' },
      { name: 'Rushed Persuasion', desc: 'Normally takes 1 minute minimum. Can be rushed as a Move Action with a -10 circumstance penalty.' },
      { name: 'De-escalation and Trust', desc: 'Calm panicked civilians, negotiate hostage releases, and broker agreements.' }
    ]
  },

  'Ranged Combat': {
    action: 'Standard Action',
    traits: [],
    trainedOnly: false,
    synergyAdvantages: ['Accurate Attack', 'Improved Aim', 'Power Attack', 'Precise Attack', 'Quick Draw', 'Ranged Attack'],
    overview: 'Ranged Combat governs precision and accuracy with a specific ranged weapon category, such as Firearms, Bows, Thrown Weapons, or Energy Blasts.',
    routine: 'Attack checks in active combat cannot be made as routine checks.',
    dcTable: [
      { dc: 'Def', label: 'Target Dodge', example: 'Opponent active Dodge defense score' },
      { dc: '10', label: 'Stationary Target', example: 'Hit an inanimate target at short range with no cover' }
    ],
    tasks: [
      { name: 'Ranged Attack Check', desc: 'Roll d20 + Total Ranged Combat bonus against the target active Dodge defense.' },
      { name: 'Range Penalties', desc: 'Short range: no penalty; Medium range: -2 check penalty; Long range: -5 check penalty.' },
      { name: 'Cover and Concealment', desc: 'Partial cover gives -2 to hit; total cover blocks direct line of attack (mitigate with Precise Attack).' }
    ]
  },

  'Sleight of Hand': {
    action: 'Standard Action',
    traits: ['Trained Only', 'Manipulation', 'Requires Tools'],
    trainedOnly: true,
    synergyAdvantages: ['Improvised Tools', 'Quick Draw', 'Skill Mastery'],
    overview: 'Sleight of Hand covers pickpocketing, concealing small objects, escaping bonds, and stage magic.',
    routine: 'Routine checks apply when performing stage magic tricks for willing audiences or palming loose items.',
    dcTable: [
      { dc: 'Opp', label: 'Perception Check', example: 'Opposed by bystander Perception to notice the theft or palmed item' },
      { dc: '15', label: 'Palm Item', example: 'Conceal a coin, keycard, or thumb drive in your hand smoothly' },
      { dc: '20', label: 'Pick Pocket', example: 'Lift a wallet, badge, or firearm from a walking target holster' },
      { dc: '25', label: 'Escape Bonds', example: 'Slip out of high-grade steel handcuffs or industrial ropes' }
    ],
    escapeTable: [
      { restraint: 'Standard Ropes / Twine', dc: 'DC 15', time: '1 Minute' },
      { restraint: 'Police Steel Handcuffs', dc: 'DC 20', time: '1 Minute' },
      { restraint: 'Masterwork / High-Tech Cuffs', dc: 'DC 25', time: '1 Minute' },
      { restraint: 'Straightjacket / Medical Harness', dc: 'DC 25', time: '1 Minute' },
      { restraint: 'Rigged Bonds / Welded Chains', dc: 'DC 30', time: '1 Minute' }
    ],
    tasks: [
      { name: 'Conceal and Palm Item', desc: 'Hide small items on your person or palm them without drawing attention. Opposed by Perception.' },
      { name: 'Pick Pockets and Plant Items', desc: 'Minimum DC 20 check to pick a pocket or plant evidence on someone undetected.' },
      { name: 'Escape Restraints', desc: 'Spend 1 minute wriggling free from handcuffs, ropes, or straightjackets.' }
    ]
  },

  'Stealth': {
    action: 'Move Action',
    traits: [],
    trainedOnly: false,
    synergyAdvantages: ['Hide in Plain Sight', 'Skill Mastery'],
    overview: 'Stealth covers moving quietly, hiding from observers, and evading cameras or detection systems.',
    routine: 'Routine Stealth applies when moving quietly through familiar terrain with no active patrols.',
    dcTable: [
      { dc: 'Opp', label: 'Perception Check', example: 'Opposed by the highest Perception check among observers' },
      { dc: '15', label: 'Move Silently', example: 'Creep across creaky wooden floors or gravel without sound' },
      { dc: '20', label: 'Tail Target', example: 'Follow a suspect through urban crowds without being identified' },
      { dc: '25', label: 'Cover Infiltration', example: 'Cross an open, lit area monitored by active guards' }
    ],
    tasks: [
      { name: 'Hide in Shadows', desc: 'Remain undetected while stationary behind cover or in darkness. Opposed by Perception.' },
      { name: 'Move Silently', desc: 'Move at up to half speed with no penalty. Moving full speed imposes a -5 check penalty.' },
      { name: 'Sniper Concealment', desc: 'Maintain concealment after making a ranged attack with a -20 check modifier.' }
    ]
  },

  'Technology': {
    action: 'Standard / Extended',
    traits: ['Trained Only', 'Manipulation', 'Requires Tools'],
    trainedOnly: true,
    synergyAdvantages: ['Improvised Tools', 'Inventor', 'Skill Mastery'],
    overview: 'Technology covers computer hacking, electronic security bypass, hardware repair, system diagnostics, and demolitions.',
    routine: 'Routine checks handle everyday computer operation, standard system diagnostics, or simple repairs.',
    dcTable: [
      { dc: '10', label: 'Basic Operation', example: 'Set up a local network, build a basic radio, or change a security password' },
      { dc: '15', label: 'System Bypass', example: 'Rewire an electronic keycard reader or bypass a commercial burglar alarm' },
      { dc: '20', label: 'Network Infiltration', example: 'Access an encrypted corporate server; fabricate an improvised electronic jammer' },
      { dc: '25', label: 'Hardened Security', example: 'Crack a top-secret defense network or dismantle an armed tactical warhead' },
      { dc: '30+', label: 'Heroic Tech', example: 'Override an alien mainframe or catastrophic reactor overload' }
    ],
    securityTable: [
      { level: 'Civilian Lock / Simple Password', dc: 'DC 15', example: 'Home deadbolt, basic router password' },
      { level: 'Corporate / Commercial Security', dc: 'DC 20', example: 'Office magnetic swipe card, retail alarm' },
      { level: 'High Security / Bank Mainframe', dc: 'DC 25', example: 'Bank vault, encrypted financial database' },
      { level: 'Military / Top Secret Network', dc: 'DC 30', example: 'Defense department grid, orbital missile silo' },
      { level: 'Alien / Hyper-Tech Mainframe', dc: 'DC 35+', example: 'Extraterrestrial systems, sentient mainframe' }
    ],
    tasks: [
      { name: 'Hacking and Systems', desc: 'Infiltrate computer systems, bypass digital authentication, and extract classified data.' },
      { name: 'Jury-Rigging', desc: 'Temporary combat repair at +5 DC above normal. Repaired device functions for check result in minutes.' },
      { name: 'Demolitions', desc: 'Disarm explosives: DC 15 (basic), DC 20 (complex), DC 25 (booby-trapped). Failure by 5+ detonates.' },
      { name: 'Invention and Devices', desc: 'Design and construct temporary devices using the Inventor advantage.' }
    ]
  },

  'Treatment': {
    action: 'Standard / 1 Min',
    traits: ['Trained Only', 'Manipulation', 'Requires Tools'],
    trainedOnly: true,
    synergyAdvantages: ['Improvised Tools', 'Skill Mastery'],
    overview: 'Treatment covers first aid, stabilizing dying patients, field trauma care, and treating poisons or diseases.',
    routine: 'Routine checks apply to treating minor scrapes, cleaning burns, or administering known antidotes in a clinic.',
    dcTable: [
      { dc: '15', label: 'First Aid', example: 'Stabilize a dying character; perform basic emergency trauma dressing' },
      { dc: '20', label: 'Treat Disease / Poison', example: 'Grant the patient a +2 circumstance bonus to resist toxin or pathogen effects' },
      { dc: '25', label: 'Revive Incapacitated', example: 'Bring an incapacitated ally back to conscious Dazed status in 1 minute' },
      { dc: '30+', label: 'Emergency Surgery', example: 'Perform field trauma surgery during an emergency or treat engineered bioweapons' }
    ],
    treatmentTable: [
      { procedure: 'First Aid (Stabilize Dying)', dc: 'DC 15', action: 'Standard Action', effect: 'Prevents character from dying; stabilizes health' },
      { procedure: 'Revive Incapacitated', dc: 'DC 15 + Dmg', action: '1 Minute', effect: 'Awakens unconscious subject to Dazed condition' },
      { procedure: 'Medical Care (Convalescence)', dc: 'DC 15', action: 'Ongoing (Hours)', effect: 'Grants +2 circumstance bonus on natural recovery checks' },
      { procedure: 'Treat Poison or Disease', dc: 'Toxin DC', action: 'Standard Action', effect: 'Allows patient to use your Treatment roll for resistance' }
    ],
    tasks: [
      { name: 'Stabilize Dying (First Aid)', desc: 'Standard action to stabilize a dying character (DC 15 check). Failure leaves them dying.' },
      { name: 'Revive Incapacitated', desc: 'Spend 1 minute tending an unconscious character to restore them to conscious Dazed condition.' },
      { name: 'Treat Venom, Poison & Disease', desc: 'Check equal to toxin DC grants the patient your check result or +2 circumstance bonus.' }
    ]
  },

  'Vehicles': {
    action: 'Move Action',
    traits: ['Trained Only', 'Manipulation'],
    trainedOnly: true,
    synergyAdvantages: ['Skill Mastery'],
    overview: 'Vehicles covers operating ground, air, water, and space vehicles under combat or hazardous conditions.',
    routine: 'Routine checks cover standard highway driving, smooth airport landings, or cruising calm coastal waters.',
    dcTable: [
      { dc: '10', label: 'Routine Maneuver', example: 'Drive at normal speed in heavy rain or traffic; turn without losing control' },
      { dc: '15', label: 'High-Speed Chase', example: 'Weave through crowded streets at speed; land an aircraft in a crosswind' },
      { dc: '20', label: 'Stunt Driving', example: 'Execute a 180-degree bootlegger turn; navigate a narrow tunnel at speed' },
      { dc: '25', label: 'Hazardous Pilot', example: 'Land a crippled aircraft on a crowded street; thread a vehicle through tight wreckage' },
      { dc: '30+', label: 'Heroic Pilot', example: 'Navigate an active debris field or supersonic trench run' }
    ],
    maneuverTable: [
      { maneuver: 'Routine Highway Maneuver', dc: 'DC 10', effect: 'Standard speed turn in rain / traffic' },
      { maneuver: 'High-Speed Chase Weaving', dc: 'DC 15', effect: 'Avoid obstacles and pedestrian congestion at speed' },
      { maneuver: 'Tactical Bootlegger / Power Slide', dc: 'DC 20', effect: '180-degree spin into tight alleyway without spinning out' },
      { maneuver: 'Extreme Stunt / Slalom Run', dc: 'DC 25', effect: 'Drive on two wheels through a narrow gate' },
      { maneuver: 'Crash Mitigation', dc: 'DC 15', effect: 'Reduces collision damage to passengers by 5 DC (+5 per degree)' }
    ],
    tasks: [
      { name: 'Combat Piloting', desc: 'Control your vehicle in combat while avoiding obstacles and incoming projectile attacks.' },
      { name: 'Crash Mitigation', desc: 'Emergency Vehicles check reduces collision damage to passengers by 5 DC (10 DC on 2+ degrees).' },
      { name: 'Tactical Maneuver', desc: 'Perform specialized tactical stunts (PIT maneuver, bootlegger turn, tight evasive roll).' }
    ]
  }
};
