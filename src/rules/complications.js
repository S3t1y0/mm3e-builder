// js/rules/complications.js
// Standard Mutants & Masterminds 3rd Edition Motivations & Complications Reference Catalog

export const MOTIVATIONS_CATALOG = [
  {
    id: 'justice',
    name: 'Justice',
    type: 'Motivation',
    icon: 'ri-scales-3-line',
    summary: 'Uphold the law, punish the guilty, and protect fairness.',
    defaultDesc: 'Wants to see the right thing done, bring criminals to justice, and protect people from harm.'
  },
  {
    id: 'responsibility',
    name: 'Responsibility',
    type: 'Motivation',
    icon: 'ri-shield-user-line',
    summary: 'With great power comes the duty to protect others.',
    defaultDesc: 'Believes having powers means an obligation to help and protect others.'
  },
  {
    id: 'doing_good',
    name: 'Doing Good',
    type: 'Motivation',
    icon: 'ri-heart-pulse-line',
    summary: 'Help people and make the world a better place.',
    defaultDesc: 'Helps anyone in need without looking for fame, reward, or recognition.'
  },
  {
    id: 'acceptance',
    name: 'Acceptance',
    type: 'Motivation',
    icon: 'ri-team-line',
    summary: 'Overcome prejudice and earn respect.',
    defaultDesc: 'Wants to be accepted by society and prove that people like them can be trusted.'
  },
  {
    id: 'patriotism',
    name: 'Patriotism',
    type: 'Motivation',
    icon: 'ri-flag-line',
    summary: 'Dedication to your country and its ideals.',
    defaultDesc: 'Guided by loyalty to your nation, its people, and principles of freedom and democracy.'
  },
  {
    id: 'redemption',
    name: 'Redemption',
    type: 'Motivation',
    icon: 'ri-hand-heart-line',
    summary: 'Make up for past mistakes or misdeeds.',
    defaultDesc: 'Seeks to make up for past crimes or mistakes by using powers to do good.'
  },
  {
    id: 'thrills',
    name: 'Thrills',
    type: 'Motivation',
    icon: 'ri-flashlight-line',
    summary: 'Excitement, adventure, and testing powers.',
    defaultDesc: 'Enjoys the excitement of adventure, testing abilities, and facing danger.'
  },
  {
    id: 'recognition',
    name: 'Recognition',
    type: 'Motivation',
    icon: 'ri-trophy-line',
    summary: 'Fame, attention, and public appreciation.',
    defaultDesc: 'Wants public appreciation, media attention, or the respect of peers.'
  },
  {
    id: 'revenge',
    name: 'Revenge',
    type: 'Motivation',
    icon: 'ri-fire-line',
    summary: 'Retribution against an enemy or group.',
    defaultDesc: 'Wants payback against a specific villain, group, or organization that caused personal harm.'
  },
  {
    id: 'greed',
    name: 'Greed',
    type: 'Motivation',
    icon: 'ri-coin-line',
    summary: 'Money, rewards, or profit.',
    defaultDesc: 'Operates as a hero-for-hire or mercenary expecting payment for dangerous jobs.'
  },
  {
    id: 'custom_motivation',
    name: 'Custom Motivation',
    type: 'Motivation',
    icon: 'ri-compass-3-line',
    summary: 'A custom personal reason to act as a hero.',
    defaultDesc: 'A personal goal, oath, or ideal that drives the character to act.'
  }
];

export const COMPLICATIONS_CATALOG = [
  {
    id: 'secret_identity',
    name: 'Secret Identity',
    type: 'Complication',
    icon: 'ri-spy-line',
    summary: 'A civilian identity that must remain secret.',
    defaultDesc: 'Maintains a normal civilian life and identity that must be protected from enemies and the public.'
  },
  {
    id: 'enemy',
    name: 'Enemy',
    type: 'Complication',
    icon: 'ri-skull-line',
    summary: 'A recurring villain or hostile organization.',
    defaultDesc: 'Targeted by an enemy or organization that regularly schemes against you.'
  },
  {
    id: 'weakness',
    name: 'Weakness',
    type: 'Complication',
    icon: 'ri-radioactive-line',
    summary: 'Vulnerable to a specific substance or condition.',
    defaultDesc: 'Suffers harmful effects, penalties, or power loss when exposed to a specific substance or condition.'
  },
  {
    id: 'power_loss',
    name: 'Power Loss',
    type: 'Complication',
    icon: 'ri-battery-low-line',
    summary: 'Powers stop working under certain conditions.',
    defaultDesc: 'Certain conditions, like lack of sunlight or extreme cold, temporarily shut down your powers.'
  },
  {
    id: 'relationship',
    name: 'Relationship',
    type: 'Complication',
    icon: 'ri-parent-line',
    summary: 'Friends, family, or partners who can be placed in danger.',
    defaultDesc: 'Has close friends, family, or loved ones whose safety complicates superhero duties.'
  },
  {
    id: 'responsibility',
    name: 'Responsibility',
    type: 'Complication',
    icon: 'ri-briefcase-line',
    summary: 'A job, family duty, or public role that conflicts with hero work.',
    defaultDesc: 'Work, family obligations, or public responsibilities regularly pull time away from heroics.'
  },
  {
    id: 'phobia',
    name: 'Phobia',
    type: 'Complication',
    icon: 'ri-ghost-line',
    summary: 'An intense fear of a specific thing or situation.',
    defaultDesc: 'Suffers penalties or panics when confronted with the object of your phobia.'
  },
  {
    id: 'accident',
    name: 'Accident',
    type: 'Complication',
    icon: 'ri-alarm-warning-line',
    summary: 'Powers can cause unintended damage or side effects.',
    defaultDesc: 'Powers are hard to control and can cause accidental collateral damage or power surges.'
  },
  {
    id: 'addiction',
    name: 'Addiction',
    type: 'Complication',
    icon: 'ri-capsule-line',
    summary: 'Dependence on a substance, serum, or recharge.',
    defaultDesc: 'Needs regular access to a substance, medication, or power charge to stay functional.'
  },
  {
    id: 'disability',
    name: 'Disability',
    type: 'Complication',
    icon: 'ri-wheelchair-line',
    summary: 'A physical, sensory, or mental limitation.',
    defaultDesc: 'Has a physical limitation, loss of a sense, or health condition that creates challenges.'
  },
  {
    id: 'fame',
    name: 'Fame',
    type: 'Complication',
    icon: 'ri-camera-lens-line',
    summary: 'Being a recognizable public figure.',
    defaultDesc: 'Widely recognized in public, making it hard to go unnoticed, maintain privacy, or operate undercover.'
  },
  {
    id: 'flashbacks',
    name: 'Flashbacks',
    type: 'Complication',
    icon: 'ri-film-line',
    summary: 'Traumatic memories that trigger during stressful moments.',
    defaultDesc: 'Certain sounds, sights, or stressful moments trigger memories that leave you distracted or shaken.'
  },
  {
    id: 'hatred',
    name: 'Hatred',
    type: 'Complication',
    icon: 'ri-forbid-line',
    summary: 'Strong hatred for a specific group, villain, or concept.',
    defaultDesc: 'Has a deep hatred for a particular enemy or injustice, making it hard to stay calm or show restraint.'
  },
  {
    id: 'honor',
    name: 'Honor',
    type: 'Complication',
    icon: 'ri-shield-star-line',
    summary: 'A strict code of conduct or personal oath.',
    defaultDesc: 'Follows a strict code of conduct, such as never lying, refusing to strike from behind, or always accepting a surrender.'
  },
  {
    id: 'obsession',
    name: 'Obsession',
    type: 'Complication',
    icon: 'ri-search-eye-line',
    summary: 'Fixated on a goal, mystery, or foe.',
    defaultDesc: 'Fixated on a case, rival, or mystery, sometimes ignoring personal safety or other priorities to pursue it.'
  },
  {
    id: 'prejudice',
    name: 'Prejudice',
    type: 'Complication',
    icon: 'ri-group-line',
    summary: 'Faces bias or distrust from the public.',
    defaultDesc: 'Treated with suspicion or fear because of your appearance, mutation, species, or background.'
  },
  {
    id: 'reputation',
    name: 'Reputation',
    type: 'Complication',
    icon: 'ri-newspaper-line',
    summary: 'A bad reputation or misunderstood public image.',
    defaultDesc: 'Viewed as dangerous, reckless, or untrustworthy by the media, police, or the public.'
  },
  {
    id: 'rivalry',
    name: 'Rivalry',
    type: 'Complication',
    icon: 'ri-sword-line',
    summary: 'A competitive rivalry with another character.',
    defaultDesc: 'Has a rival who regularly tries to outdo, challenge, or criticize you.'
  },
  {
    id: 'secret',
    name: 'Secret',
    type: 'Complication',
    icon: 'ri-lock-line',
    summary: 'A damaging secret that must remain hidden.',
    defaultDesc: 'Carries a secret about your past, identity, or origins that would cause problems if exposed.'
  },
  {
    id: 'temper',
    name: 'Temper',
    type: 'Complication',
    icon: 'ri-temp-hot-line',
    summary: 'Easily angered or provoked.',
    defaultDesc: 'Has a short temper and can lose control when insulted, provoked, or confronted with cruelty.'
  },
  {
    id: 'custom_complication',
    name: 'Custom Complication',
    type: 'Complication',
    icon: 'ri-error-warning-line',
    summary: 'A custom complication made for your character.',
    defaultDesc: 'A specific complication created with your Gamemaster.'
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

export function isMotivation(comp) {
  if (!comp) return false;
  const typeStr = (comp.type || '').toLowerCase();
  const nameStr = (comp.name || '').toLowerCase();
  return typeStr === 'motivation' || nameStr.startsWith('motivation:');
}

export function validateNarrativeTraits(complicationsList) {
  const list = Array.isArray(complicationsList) ? complicationsList : [];
  const motivations = list.filter(isMotivation);
  const generalComplications = list.filter(c => !isMotivation(c));

  const hasMotivation = motivations.length >= 1;
  const hasComplication = generalComplications.length >= 1;
  const isValid = hasMotivation && hasComplication;

  let message = '';
  if (!hasMotivation && !hasComplication) {
    message = 'Needs at least 1 motivation and 1 complication.';
  } else if (!hasMotivation) {
    message = 'Needs at least 1 motivation.';
  } else if (!hasComplication) {
    message = 'Needs at least 1 complication.';
  } else {
    message = 'Requirements met (1+ motivation, 1+ complication).';
  }

  return {
    hasMotivation,
    hasComplication,
    isValid,
    message,
    motivationsCount: motivations.length,
    complicationsCount: generalComplications.length,
    totalCount: list.length
  };
}
