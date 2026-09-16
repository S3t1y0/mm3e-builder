// js/rules/conditions.js
export const BASIC_CONDITIONS = [
  { name: 'Compelled', desc: 'Directed by an outside force; limited to free actions and one standard action per turn chosen by the controller.' },
  { name: 'Controlled', desc: 'No free will; all actions dictated by the controller.' },
  { name: 'Dazed', desc: 'Limited to free actions and a single standard action (or move action) per turn.' },
  { name: 'Debilitated', desc: 'One or more abilities lowered below -5.' },
  { name: 'Defenseless', desc: 'Active defense bonuses (Dodge & Parry) are 0. Attackers gain routine attacks or auto-criticals.', affectsDefense: true },
  { name: 'Disabled', desc: '-5 circumstance penalty on checks.' },
  { name: 'Fatigued', desc: 'Hindered. Recovers after an hour of rest.' },
  { name: 'Hindered', desc: 'Moves at half normal speed (-1 speed rank).' },
  { name: 'Immobile', desc: 'Movement speed is 0; cannot move from current spot.' },
  { name: 'Impaired', desc: '-2 circumstance penalty on checks.' },
  { name: 'Stunned', desc: 'Cannot take any actions, including free actions.' },
  { name: 'Transformed', desc: 'Some or all traits altered by outside agency.' },
  { name: 'Unaware', desc: 'Completely unaware of surroundings; unable to make interaction or Perception checks.' },
  { name: 'Vulnerable', desc: 'Active defenses (Dodge & Parry) are halved (rounded up).', affectsDefense: true },
  { name: 'Weakened', desc: 'Temporarily lost power points in a trait.' }
];

export const COMBINED_CONDITIONS = [
  { name: 'Asleep', components: ['Defenseless', 'Stunned', 'Unaware'], desc: 'Defenseless, stunned, and unaware. Hearing check (DC 15) or loud noise/damage wakes character.' },
  { name: 'Blind', components: ['Hindered', 'Unaware', 'Vulnerable'], desc: 'Visual concealment from everything; hindered, visually unaware, and vulnerable.' },
  { name: 'Bound', components: ['Defenseless', 'Immobile', 'Impaired'], desc: 'Defenseless, immobile, and impaired by restraints.' },
  { name: 'Deaf', components: ['Unaware'], desc: 'Total auditory concealment; unaware of sound.' },
  { name: 'Dying', components: ['Defenseless', 'Stunned', 'Unaware'], desc: 'Incapacitated and near death; Fortitude check DC 15 required each round or suffer death.' },
  { name: 'Entranced', components: ['Stunned'], desc: 'Stunned, taking no actions other than paying attention to the entrancing effect.' },
  { name: 'Exhausted', components: ['Impaired', 'Hindered'], desc: 'Near collapse; impaired and hindered. Recovers after 1 hour rest.' },
  { name: 'Incapacitated', components: ['Defenseless', 'Stunned', 'Unaware'], desc: 'Defenseless, stunned, and unaware. Character falls prone.' },
  { name: 'Paralyzed', components: ['Defenseless', 'Immobile', 'Stunned'], desc: 'Defenseless, immobile, and physically stunned, but mentally aware.' },
  { name: 'Prone', components: ['Hindered'], desc: 'Lying on ground; -5 close attack penalty, +5 close defense bonus, -5 ranged defense penalty.' },
  { name: 'Restrained', components: ['Hindered', 'Vulnerable'], desc: 'Hindered and vulnerable due to grappling or physical hold.' },
  { name: 'Staggered', components: ['Dazed', 'Hindered'], desc: 'Dazed and hindered; limited to one standard action per turn.' },
  { name: 'Surprised', components: ['Stunned', 'Vulnerable'], desc: 'Stunned and vulnerable until character gets a turn to react.' }
];
