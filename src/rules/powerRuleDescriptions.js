// src/rules/powerRuleDescriptions.js
import { BASE_EFFECTS, CONFIGURABLE_EFFECTS, EXTRAS, FLAWS } from './powerEngine.js';

// M&M 3E Measurements Table velocity progression (doubles per rank from rank 0 at 2 MPH).
export const SPEED_RANK_TABLE = {
  0: '2 MPH (30 ft/round)',
  1: '4 MPH (60 ft/round)',
  2: '8 MPH (120 ft/round)',
  3: '16 MPH (250 ft/round)',
  4: '30 MPH (500 ft/round)',
  5: '60 MPH (900 ft/round)',
  6: '120 MPH (1,800 ft/round)',
  7: '250 MPH (0.5 mile/round)',
  8: '500 MPH (1 mile/round)',
  9: '1,000 MPH (2 miles/round)',
  10: '2,000 MPH (Mach 2.5 • 4 miles/round)',
  11: '4,000 MPH (Mach 5 • 8 miles/round)',
  12: '8,000 MPH (Mach 10 • 16 miles/round)',
  13: '16,000 MPH (Mach 20 • 30 miles/round)',
  14: '32,000 MPH (Escape Velocity)',
  15: '64,000 MPH (120 miles/sec)',
  16: '125,000 MPH',
  17: '250,000 MPH',
  18: '500,000 MPH',
  19: 'Near Light Speed',
  20: 'Speed of Light (186,000 miles/sec)'
};

export function formatSpeedRank(rank) {
  const r = parseInt(rank, 10) || 0;
  if (SPEED_RANK_TABLE[r]) return SPEED_RANK_TABLE[r];
  if (r > 20) return `Faster Than Light (Rank ${r})`;
  const mph = Math.round(Math.pow(2, r) * 2);
  return `${mph.toLocaleString()} MPH`;
}

// Concise d20herosrd rules distillations used as default reference.
export const EFFECT_RULE_SUMMARIES = {
  'affliction': 'Imposes debilitating conditions (Dazed, Stunned, Incapacitated, etc.) via Fortitude or Will check.',
  'blast': 'Delivers a ranged damaging attack resisted by Toughness defense (DC 15 + rank).',
  'burrowing': 'Tunnels through solid earth, ice, or rock at speed determined by effect rank.',
  'communication': 'Transmits speech, radio, or mental messages over distances up to rank range.',
  'comprehend': 'Enables understanding, speaking, or reading languages, animals, spirits, or objects.',
  'concealment': 'Conceals the user from designated sensory types (visual, auditory, scent, etc.).',
  'create': 'Manifests solid, three-dimensional objects composed of solid light, force, or matter.',
  'damage': 'Inflicts physical or energy harm with a close attack check, resisted by Toughness (DC 15 + rank).',
  'deflect': 'Actively defends against ranged attacks targeting yourself or nearby allies.',
  'elongation': 'Elongates limbs and reach up to rank distance, granting extended melee strikes.',
  'enhanced trait': 'Superhumanly increases abilities, skills, or defenses while active (subject to PL caps).',
  'environment': 'Alters ambient environment (light/dark, cold/heat, precipitation, or movement impediment).',
  'extra limbs': 'Grants additional arms, tentacles, or appendages (+bonus on grab and multi-task checks).',
  'feature': 'Provides a minor, utilitarian, or cosmetic superhuman trait with negligible combat impact.',
  'flight': 'Enables airborne flight, hovering, and movement at speed rank on Measurements Table.',
  'growth': 'Increases physical size and mass, boosting Strength, Stamina, and reach at penalty to stealth.',
  'healing': 'Restores damage conditions (bruises, dazed, staggered) on touched subjects via DC 10 check.',
  'illusion': 'Projects holographic, phantom, or sensory impressions into an area (resisted by Insight).',
  'immortality': 'Recovers from fatal death, returning to life after a duration determined by rank.',
  'immunity': 'Grants complete immunity against specific hazards, environments, damage types, or Fortitude checks.',
  'insubstantial': 'Shifts physical state into fluid, gas, coherent energy, or incorporeal intangibility.',
  'leaping': 'Propels the user through prodigious leaping distances up to rank distance as a move action.',
  'luck control': 'Manipulates probability, forcing re-rolls, negating enemy criticals, or awarding hero points.',
  'mind reading': 'Probes target thoughts, surface emotions, and subconscious memories vs Will resistance.',
  'morph': 'Alters cosmetic appearance and form (+20 Deception bonus to disguises).',
  'move object': 'Telekinetically moves, lifts, and hurls objects at distance with effective Strength equal to rank.',
  'movement': 'Provides specialized modes of movement (Wall-crawling, Water Walking, Dimension Travel, Safe Fall, etc.).',
  'nullify': 'Counters and shuts down active powers matching designated descriptors via opposed check.',
  'protection': 'Adds +1 bonus to Toughness defense per rank against physical and energy harm.',
  'quickness': 'Performs routine physical or mental tasks at superhuman speed in fractions of a second.',
  'regeneration': 'Recovers automatically from bruises, injuries, and staggered conditions without requiring rest.',
  'remote sensing': 'Displaces sensory awareness to perceive distant locations without crossing intervening space.',
  'senses': 'Enhances sensory faculties (Darkvision, Infravision, Acute Scent, Radar, Tremorsense, etc.).',
  'shrinking': 'Decreases physical size, boosting Dodge, Parry, and Stealth bonuses at reduced Strength.',
  'speed': 'Runs overland at superhuman speed rank on the Measurements Table.',
  'summon': 'Calls forth an independent minion or creature with (rank × 15) character points.',
  'swimming': 'Swims effortlessly through water at water speed equal to rank minus 2.',
  'teleport': 'Instantly relocates without crossing intervening space up to rank distance as a move action.',
  'transform': 'Transmutes inanimate objects into different forms or materials via touch.',
  'variable': 'Allocates a versatile pool of (rank × 5) character points to powers fitting a central theme.',
  'weaken': 'Temporarily drains a designated ability, defense, or power rank on the target (resisted by Fort/Will).'
};

export function getEffectRuleSummary(effectOrName) {
  if (!effectOrName) return '';
  const rawName = typeof effectOrName === 'string'
    ? effectOrName
    : (effectOrName.baseEffect || effectOrName.name || '');

  const key = rawName.toLowerCase().trim();
  if (EFFECT_RULE_SUMMARIES[key]) {
    return EFFECT_RULE_SUMMARIES[key];
  }

  // Fallback to base effect definitions if unlisted
  const baseMatch = BASE_EFFECTS.find(b => (b.name || '').toLowerCase() === key);
  if (baseMatch && baseMatch.desc) {
    const firstLine = baseMatch.desc.split('\n')[0].trim();
    const firstSentence = firstLine.split(/\.(?:\s|$)/)[0];
    return firstSentence.length > 120 ? firstSentence.slice(0, 117) + '...' : firstSentence + '.';
  }

  return '';
}

// Resolves rank- and choice-aware rule descriptions for character sheet rows.
export function getDynamicEffectRuleSummary(effect) {
  if (!effect) return [];
  const base = String(effect.baseEffect || effect.name || '').trim();
  const baseKey = base.toLowerCase();
  const ranks = Number(effect.ranks) || 1;
  const c = effect.config || {};
  const cfg = CONFIGURABLE_EFFECTS[base];

  if (baseKey === 'speed') {
    const spd = formatSpeedRank(ranks);
    return [`Runs overland up to ${spd} as a move action (Speed Rank ${ranks}).`];
  }

  if (baseKey === 'flight') {
    const spd = formatSpeedRank(ranks);
    return [`Flies through the air up to ${spd} including hovering in place (Flight Rank ${ranks}).`];
  }

  if (baseKey === 'swimming') {
    const swRank = Math.max(0, ranks - 2);
    const spd = formatSpeedRank(swRank);
    return [`Swims through water up to ${spd} (Water Speed Rank ${swRank}).`];
  }

  if (baseKey === 'burrowing') {
    const buRank = Math.max(0, ranks - 5);
    const spd = formatSpeedRank(buRank);
    return [`Tunnels through earth/stone up to ${spd} (Burrowing Rank ${buRank}).`];
  }

  if (baseKey === 'leaping') {
    const dist = ranks >= 4 ? `${Math.round(Math.pow(2, ranks - 4) * 30)} ft` : `Rank ${ranks} distance`;
    return [`Leaps up to ${dist} in a single bound as a move action (Leaping Rank ${ranks}).`];
  }

  if (baseKey === 'teleport') {
    const dist = ranks >= 7 ? `${Math.round(Math.pow(2, ranks - 7))} miles` : `${Math.round(Math.pow(2, ranks) * 30)} ft`;
    return [`Instantly teleports up to ${dist} carrying normal mass as a move action.`];
  }

  if (baseKey === 'protection') {
    return [`Grants +${ranks} bonus to Toughness defense against physical and energy harm.`];
  }

  if (baseKey === 'damage') {
    const res = effect.resistance || 'Toughness';
    return [`Delivers a close damaging strike resisted by ${res} (DC ${15 + ranks} vs ${res}).`];
  }

  if (baseKey === 'blast') {
    const res = effect.resistance || 'Toughness';
    const rangeDist = `${ranks * 25}/${ranks * 50}/${ranks * 100} ft`;
    return [`Delivers ranged damage (${rangeDist}), resisted by ${res} (DC ${15 + ranks} vs ${res}).`];
  }

  if (baseKey === 'affliction') {
    const first = c.firstDegree || 'Dazed';
    const second = c.secondDegree || 'Stunned';
    const third = c.thirdDegree || 'Incapacitated';
    const res = effect.resistance || 'Fortitude';
    return [`Imposes debilitating conditions: ${first} / ${second} / ${third} (DC ${10 + ranks} vs ${res}).`];
  }

  if (baseKey === 'weaken') {
    const trait = c.trait || c.targetTrait || 'target trait';
    const res = effect.resistance || 'Fortitude';
    return [`Temporarily drains target's ${trait} by 1 per degree of failure (DC ${10 + ranks} vs ${res}).`];
  }

  if (baseKey === 'nullify') {
    const target = c.descriptor || c.targetDescriptor || 'designated descriptors';
    return [`Counters and shuts down active ${target} powers via opposed check (Rank ${ranks}).`];
  }

  if (baseKey === 'senses') {
    const faculties = [...(cfg?.faculties || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedFaculties) && c.selectedFaculties.length > 0
      ? c.selectedFaculties
      : (cfg?.defaultFaculties || ['Darkvision']);
    const names = selected.map(item => {
      const match = faculties.find(f => f.id === item || f.name?.toLowerCase() === String(item).toLowerCase());
      return match ? match.name : String(item);
    });

    if (names.length > 4) {
      return [
        `Superhuman faculties (1/2): ${names.slice(0, 4).join(', ')}`,
        `Superhuman faculties (2/2): ${names.slice(4).join(', ')}`
      ];
    }
    return [`Superhuman sensory faculties: ${names.join(', ')}`];
  }

  if (baseKey === 'movement') {
    const modes = [...(cfg?.modes || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['Wall-crawling']);
    const names = selected.map(item => {
      const modeId = typeof item === 'object' && item ? item.id : item;
      const rankNum = typeof item === 'object' && item ? (item.ranks || 1) : 1;
      const match = modes.find(m => m.id === modeId || m.name === modeId);
      const title = match ? match.name : String(modeId);
      return rankNum > 1 ? `${title} ${rankNum}` : title;
    });

    if (names.length > 4) {
      return [
        `Special movement modes (1/2): ${names.slice(0, 4).join(', ')}`,
        `Special movement modes (2/2): ${names.slice(4).join(', ')}`
      ];
    }
    return [`Special movement modes: ${names.join(', ')}`];
  }

  if (baseKey === 'immunity') {
    const presets = [...(cfg?.presets || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedPresets) && c.selectedPresets.length > 0
      ? c.selectedPresets
      : (cfg?.defaultPresets || ['Life Support']);
    const names = selected.map(item => {
      const match = presets.find(p => p.id === item || p.name === item);
      return match ? match.name : String(item);
    });

    if (names.length > 4) {
      return [
        `Complete immunity against (1/2): ${names.slice(0, 4).join(', ')}`,
        `Complete immunity against (2/2): ${names.slice(4).join(', ')}`
      ];
    }
    return [`Complete immunity against: ${names.join(', ')}`];
  }

  if (baseKey === 'comprehend') {
    const modes = [...(cfg?.modes || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['Languages (Understand)']);
    const names = selected.map(item => {
      const match = modes.find(m => m.id === item || m.name === item);
      return match ? match.name : String(item);
    });
    return [`Superhuman comprehension: ${names.join(', ')}`];
  }

  if (baseKey === 'concealment') {
    const options = [...(cfg?.options || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedSenses) && c.selectedSenses.length > 0
      ? c.selectedSenses
      : (cfg?.defaultSenses || ['Normal Visual']);
    const names = selected.map(item => {
      const match = options.find(o => o.id === item || o.name === item);
      return match ? match.name : String(item);
    });
    return [`Total concealment against: ${names.join(', ')}`];
  }

  if (baseKey === 'enhanced trait') {
    const targets = Array.isArray(c.selectedTraits) && c.selectedTraits.length > 0
      ? c.selectedTraits
      : [c.traitName || 'Strength'];
    return [`Superhumanly enhances traits: ${targets.map(t => `${t} +${ranks}`).join(', ')} while active.`];
  }

  if (baseKey === 'move object') {
    return [`Telekinetically manipulates objects with effective Strength Rank ${ranks} at range.`];
  }

  if (baseKey === 'morph') {
    const scopeNames = { 1: 'Single Appearance', 2: 'Narrow Group', 3: 'Broad Group', 4: 'Any Form' };
    const scope = Number(c.scope) || 1;
    return [`Alters cosmetic appearance to ${scopeNames[scope] || 'Rank ' + scope} (+20 Deception bonus to disguises).`];
  }

  if (baseKey === 'variable') {
    const theme = c.theme || 'versatile powers';
    return [`Allocates a versatile pool of up to ${ranks * 5} character points to powers fitting "${theme}".`];
  }

  if (baseKey === 'quickness') {
    return [`Performs routine physical and mental tasks in fractions of normal time (Quickness Rank ${ranks}).`];
  }

  if (baseKey === 'regeneration') {
    return [`Automatically recovers from damage conditions every ${ranks >= 10 ? 'round' : `${Math.max(1, 11 - ranks)} rounds`} without rest.`];
  }

  if (baseKey === 'immortality') {
    return [`Recovers from fatal death and returns to life after Immortality Rank ${ranks} time period.`];
  }

  if (baseKey === 'insubstantial') {
    const formNames = {
      1: 'Fluid (flow through openings)',
      2: 'Gaseous (gas/smoke cloud)',
      3: 'Energy (coherent energy form)',
      4: 'Incorporeal (intangible ghost, immune to physical harm)'
    };
    return [`Assumes Insubstantial form: ${formNames[ranks] || `Rank ${ranks}`}.`];
  }

  if (baseKey === 'growth') {
    return [`Increases size by +${Math.floor(ranks / 4)} rank(s), gaining +${ranks} Strength and Stamina.`];
  }

  if (baseKey === 'shrinking') {
    return [`Decreases size, gaining +${Math.floor(ranks / 4) * 2} active defenses and +${ranks * 2} Stealth at -${Math.floor(ranks / 4)} Strength.`];
  }

  if (baseKey === 'summon') {
    return [`Summons a minion with ${ranks * 15} character points (Power Level ${ranks}) as a standard action.`];
  }

  if (baseKey === 'environment') {
    const types = Array.isArray(c.selectedTypes) ? c.selectedTypes.join(', ') : 'ambient climate';
    return [`Alters ambient environment (${types}) within radius rank ${ranks}.`];
  }

  if (baseKey === 'create') {
    return [`Manifests solid objects up to volume rank ${ranks} and Toughness rank ${ranks} as a standard action.`];
  }

  if (baseKey === 'deflect') {
    return [`Actively deflects ranged attacks targeting self or nearby allies (Deflect bonus +${ranks}).`];
  }

  if (baseKey === 'illusion') {
    const senses = Array.isArray(c.senses) ? c.senses.join(', ') : 'Visual';
    return [`Projects convincing sensory impressions (${senses}) into an area (resisted by Insight DC ${10 + ranks}).`];
  }

  const fallback = getEffectRuleSummary(baseKey);
  return fallback ? [fallback] : [];
}

export function getModifierRuleSummary(modName, modType = 'extra') {
  if (!modName) return '';
  const clean = String(modName).trim().toLowerCase();

  const primaryList = modType === 'flaw' ? FLAWS : EXTRAS;
  const secondaryList = modType === 'flaw' ? EXTRAS : FLAWS;

  let match = primaryList.find(m => (m.name || '').toLowerCase() === clean);
  if (!match) {
    match = secondaryList.find(m => (m.name || '').toLowerCase() === clean);
  }
  if (!match) {
    match = primaryList.find(m => {
      const mn = (m.name || '').toLowerCase();
      return clean.startsWith(mn) || mn.startsWith(clean);
    });
  }

  if (match && match.desc) {
    const firstLine = match.desc.split('\n')[0].trim();
    const firstSentence = firstLine.split(/\.(?:\s|$)/)[0];
    return firstSentence.length > 120 ? firstSentence.slice(0, 117) + '...' : firstSentence + '.';
  }

  return '';
}

export function resolveEffectRulesBlock(effect) {
  if (!effect) {
    return { effectRuleDesc: '', effectRuleDescs: [], modifierRules: [] };
  }

  const effectRuleDescs = getDynamicEffectRuleSummary(effect);
  const effectRuleDesc = effectRuleDescs[0] || '';
  const modifierRules = [];

  const extras = Array.isArray(effect.extras) ? effect.extras : [];
  for (const ex of extras) {
    const name = ex.name || 'Extra';
    const desc = getModifierRuleSummary(name, 'extra');
    if (desc) {
      modifierRules.push({
        name: ex.customText ? `${name} [${ex.customText}]` : name,
        desc,
        type: 'extra'
      });
    }
  }

  const flaws = Array.isArray(effect.flaws) ? effect.flaws : [];
  for (const fl of flaws) {
    const name = fl.name || 'Flaw';
    const desc = getModifierRuleSummary(name, 'flaw');
    if (desc) {
      modifierRules.push({
        name: fl.customText ? `${name} [${fl.customText}]` : name,
        desc,
        type: 'flaw'
      });
    }
  }

  return { effectRuleDesc, effectRuleDescs, modifierRules };
}
