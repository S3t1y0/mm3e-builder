// js/rules/complications.js
// Standard Mutants & Masterminds 3rd Edition Motivations & Complications Reference Catalog

export const MOTIVATIONS_CATALOG = [
  {
    id: 'justice',
    name: 'Justice',
    type: 'Motivation',
    icon: 'ri-scales-3-line',
    summary: 'Uphold the law, punish the guilty, and protect fairness.',
    defaultDesc: 'Driven by a strict moral compass to bring wrongdoers to justice and ensure the law prevails equally for everyone.'
  },
  {
    id: 'responsibility',
    name: 'Responsibility',
    type: 'Motivation',
    icon: 'ri-shield-user-line',
    summary: 'With great power comes the duty to protect others.',
    defaultDesc: 'Feels a profound obligation to use superhuman gifts to shelter those who cannot protect themselves.'
  },
  {
    id: 'doing_good',
    name: 'Doing Good',
    type: 'Motivation',
    icon: 'ri-heart-pulse-line',
    summary: 'Pure altruism and desire to make the world better.',
    defaultDesc: 'Believes in simply helping people in need without seeking glory, personal profit, or recognition.'
  },
  {
    id: 'acceptance',
    name: 'Acceptance',
    type: 'Motivation',
    icon: 'ri-team-line',
    summary: 'Prove value and overcome prejudice to fit in.',
    defaultDesc: 'Strives through heroic sacrifice to gain public understanding and respect despite being an outsider, mutant, or alien.'
  },
  {
    id: 'patriotism',
    name: 'Patriotism',
    type: 'Motivation',
    icon: 'ri-flag-line',
    summary: 'Devotion to country, ideals, and constitutional liberty.',
    defaultDesc: 'Guided by supreme dedication to one’s homeland, government service, or foundational ideals of freedom and democracy.'
  },
  {
    id: 'redemption',
    name: 'Redemption',
    type: 'Motivation',
    icon: 'ri-hand-heart-line',
    summary: 'Atoning for past crimes, dark mistakes, or failure.',
    defaultDesc: 'Fighting on the side of angels to atone for past errors, criminal deeds, or harm caused before turning a new leaf.'
  },
  {
    id: 'thrills',
    name: 'Thrills',
    type: 'Motivation',
    icon: 'ri-flashlight-line',
    summary: 'Craves high-stakes action, adrenaline, and superhuman tests.',
    defaultDesc: 'Finds mundane civilian existence boring; loves the pure rush of superheroics and testing superhuman boundaries.'
  },
  {
    id: 'recognition',
    name: 'Recognition',
    type: 'Motivation',
    icon: 'ri-trophy-line',
    summary: 'Desires public fame, celebrity admiration, and validation.',
    defaultDesc: 'Driven by the pursuit of acclaim, media spotlight, and being celebrated by peers and the general public.'
  },
  {
    id: 'revenge',
    name: 'Revenge',
    type: 'Motivation',
    icon: 'ri-fire-line',
    summary: 'Obsessed with punishing a specific enemy or syndicate.',
    defaultDesc: 'Vowed vengeance against the syndicate, villain, or organization responsible for personal tragedy or grief.'
  },
  {
    id: 'greed',
    name: 'Greed',
    type: 'Motivation',
    icon: 'ri-coin-line',
    summary: 'Motivated by financial bounty, wealth, and material gain.',
    defaultDesc: 'Acts as a hero-for-hire, mercenary, or treasure-seeker expecting substantial material payoff for dangerous assignments.'
  },
  {
    id: 'custom_motivation',
    name: 'Custom Motivation',
    type: 'Motivation',
    icon: 'ri-compass-3-line',
    summary: 'Unique personal philosophical driving force.',
    defaultDesc: 'A personal mission or unique philosophy that drives the hero forward through hardship.'
  }
];

export const COMPLICATIONS_CATALOG = [
  {
    id: 'secret_identity',
    name: 'Secret Identity',
    type: 'Complication',
    icon: 'ri-spy-line',
    summary: 'Maintains a civilian double-life that must stay hidden.',
    defaultDesc: 'Has a civilian identity and day-to-day life that must be protected from villains, paparazzi, and authorities.'
  },
  {
    id: 'enemy',
    name: 'Enemy',
    type: 'Complication',
    icon: 'ri-skull-line',
    summary: 'Persistent nemesis or hostile organization targeting the hero.',
    defaultDesc: 'Hounded by a recurring villain, criminal cabal, or agency that actively schemes to defeat, disgrace, or eliminate the hero.'
  },
  {
    id: 'weakness',
    name: 'Weakness',
    type: 'Complication',
    icon: 'ri-radioactive-line',
    summary: 'Vulnerable to a specific substance, energy, or environmental factor.',
    defaultDesc: 'Suffers debilitating harm, loss of powers, or severe penalty when exposed to a specific substance or condition.'
  },
  {
    id: 'power_loss',
    name: 'Power Loss',
    type: 'Complication',
    icon: 'ri-battery-low-line',
    summary: 'Powers temporarily shut down under specific circumstances.',
    defaultDesc: 'Certain conditions (e.g. solar deprivation, special nullifiers, severe stress) temporarily render powers useless.'
  },
  {
    id: 'relationship',
    name: 'Relationship',
    type: 'Complication',
    icon: 'ri-parent-line',
    summary: 'Loved ones, friends, or dependents frequently placed in danger.',
    defaultDesc: 'Close family, romantic partners, or civilian dependents can become targets or require urgent intervention.'
  },
  {
    id: 'responsibility',
    name: 'Responsibility',
    type: 'Complication',
    icon: 'ri-briefcase-line',
    summary: 'Demanding day job, civic duty, or family care limits heroics.',
    defaultDesc: 'Civilian career commitments, family obligations, or public offices frequently conflict with sudden emergencies.'
  },
  {
    id: 'phobia',
    name: 'Phobia',
    type: 'Complication',
    icon: 'ri-ghost-line',
    summary: 'Paralyzing fear of a specific creature, environment, or event.',
    defaultDesc: 'Overcome with intense dread or panicked hesitation when confronted by the object of their phobia.'
  },
  {
    id: 'accident',
    name: 'Accident',
    type: 'Complication',
    icon: 'ri-alarm-warning-line',
    summary: 'Powers risk unintended collateral damage or volatility.',
    defaultDesc: 'Superhuman abilities are volatile, occasionally causing collateral devastation or unpredictable energy surges.'
  },
  {
    id: 'addiction',
    name: 'Addiction',
    type: 'Complication',
    icon: 'ri-capsule-line',
    summary: 'Physiological or psychological dependence on a substance or routine.',
    defaultDesc: 'Requires regular doses of a serum, power battery recharge, or substance to remain functional and avoid withdrawal.'
  },
  {
    id: 'disability',
    name: 'Disability',
    type: 'Complication',
    icon: 'ri-wheelchair-line',
    summary: 'Physical or sensory challenge affecting non-powered tasks.',
    defaultDesc: 'Lives with a sensory impairment, mobility restriction, or chronic condition that complicates situations.'
  },
  {
    id: 'fame',
    name: 'Fame',
    type: 'Complication',
    icon: 'ri-camera-lens-line',
    summary: 'High public profile makes stealth and privacy nearly impossible.',
    defaultDesc: 'Recognized everywhere; media swarms and enthusiastic fans hamper covert actions and private moments.'
  },
  {
    id: 'flashbacks',
    name: 'Flashbacks',
    type: 'Complication',
    icon: 'ri-film-line',
    summary: 'Traumatic memories trigger disorientation or freezing in crisis.',
    defaultDesc: 'Specific sights, sounds, or battlefield stresses can induce vivid traumatic memories and disorienting panic.'
  },
  {
    id: 'hatred',
    name: 'Hatred',
    type: 'Complication',
    icon: 'ri-forbid-line',
    summary: 'Intense animosity toward a concept, group, or creature type.',
    defaultDesc: 'Blinded by fierce hatred when facing certain foes or social evils, making rational tactical restraint very hard.'
  },
  {
    id: 'honor',
    name: 'Honor',
    type: 'Complication',
    icon: 'ri-shield-star-line',
    summary: 'Strict moral oath, code of chivalry, or sacred vows.',
    defaultDesc: 'Bound by an unbreakable code of conduct (e.g. never strike from behind, never lie, defend the defenseless first).'
  },
  {
    id: 'obsession',
    name: 'Obsession',
    type: 'Complication',
    icon: 'ri-search-eye-line',
    summary: 'Monomaniacal pursuit of an investigation, nemesis, or crusade.',
    defaultDesc: 'Compelled to investigate clues or chase an ongoing obsession, sometimes neglecting immediate tactical prudence.'
  },
  {
    id: 'prejudice',
    name: 'Prejudice',
    type: 'Complication',
    icon: 'ri-group-line',
    summary: 'Subject to discrimination, social fear, or systemic distrust.',
    defaultDesc: 'Feared, hated, or distrusted by the populace due to origin, mutation, alien appearance, or background.'
  },
  {
    id: 'reputation',
    name: 'Reputation',
    type: 'Complication',
    icon: 'ri-newspaper-line',
    summary: 'Notorious past or misunderstood public perception.',
    defaultDesc: 'Considered a menace, loose cannon, or dangerous vigilante by media outlets, city officials, or law enforcement.'
  },
  {
    id: 'rivalry',
    name: 'Rivalry',
    type: 'Complication',
    icon: 'ri-sword-line',
    summary: 'Competitive tension with a fellow hero or professional peer.',
    defaultDesc: 'Engaged in persistent competitive friction with a rival who constantly tries to upstage or critique them.'
  },
  {
    id: 'secret',
    name: 'Secret',
    type: 'Complication',
    icon: 'ri-lock-line',
    summary: 'Dangerous truth that would cause immense harm if uncovered.',
    defaultDesc: 'Harbors a compromising secret about their origin, powers, or past that would devastate them if exposed.'
  },
  {
    id: 'temper',
    name: 'Temper',
    type: 'Complication',
    icon: 'ri-temp-hot-line',
    summary: 'Easily provoked into reckless fury or berserk aggression.',
    defaultDesc: 'Has a short fuse; insulting remarks or brazen cruelty can provoke an explosive, reckless loss of composure.'
  },
  {
    id: 'custom_complication',
    name: 'Custom Complication',
    type: 'Complication',
    icon: 'ri-error-warning-line',
    summary: 'Unique complication tailored to the character.',
    defaultDesc: 'A unique personal challenge, curse, or circumstance agreed upon between player and Gamemaster.'
  }
];

export function findComplicationPreset(categoryOrId) {
  if (!categoryOrId) return null;
  const target = String(categoryOrId).toLowerCase().replace(/[\s_-]+/g, '');
  const all = [...MOTIVATIONS_CATALOG, ...COMPLICATIONS_CATALOG];
  return all.find(item => {
    const itemId = item.id.toLowerCase().replace(/[\s_-]+/g, '');
    const itemName = item.name.toLowerCase().replace(/[\s_-]+/g, '');
    return itemId === target || itemName === target;
  }) || null;
}
