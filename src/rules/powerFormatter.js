// js/rules/powerFormatter.js
import { BASE_EFFECTS, CONFIGURABLE_EFFECTS, calculatePowerTotalCost } from './powerEngine.js';

/**
 * Speed rank table for real-world velocity in Mutants & Masterminds 3E.
 * Rank 0 is 2 MPH, Rank 1 is 4 MPH, doubling with each rank.
 */
const SPEED_RANK_TABLE = {
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

/**
 * Calculates speed description for movement powers.
 */
export function formatSpeedRank(rank) {
  const r = parseInt(rank, 10) || 0;
  if (SPEED_RANK_TABLE[r]) return SPEED_RANK_TABLE[r];
  if (r > 20) return `Faster Than Light (Rank ${r})`;
  const mph = Math.round(Math.pow(2, r) * 2);
  return `${mph.toLocaleString()} MPH`;
}

/**
 * Calculates official Resistance Check DC according to M&M 3E rules.
 * Damage/Blast: DC 15 + Rank vs Toughness.
 * Affliction/Weaken/Nullify: DC 10 + Rank vs Fortitude/Will.
 * Attack Extra: DC 10 + Rank vs Dodge.
 */
export function calculateDC(effect) {
  if (!effect || !effect.baseEffect) return '';
  const ranks = Number(effect.ranks) || 0;
  const base = String(effect.baseEffect || '').trim().toLowerCase();
  const res = effect.resistance || '';

  if (base === 'damage' || base === 'blast') {
    return `DC ${15 + ranks} vs ${res || 'Toughness'}`;
  }
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) {
    return `DC ${10 + ranks} vs ${res || 'Fortitude'}`;
  }
  if (base === 'mind reading') {
    return `DC ${10 + ranks} vs ${res || 'Will'}`;
  }

  const extras = Array.isArray(effect.extras) ? effect.extras : [];
  const hasAttackExtra = extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');
  if (hasAttackExtra) {
    return `DC ${10 + ranks} vs ${res || 'Dodge'}`;
  }

  const nonResistingEffects = [
    'senses', 'enhanced trait', 'movement', 'immunity', 'flight', 'speed', 'quickness',
    'leaping', 'swimming', 'growth', 'shrinking', 'morph', 'variable', 'comprehend',
    'feature', 'protection', 'regeneration', 'immortality', 'elongation', 'invisibility',
    'insubstantial', 'burrowing', 'teleport', 'deflect', 'healing', 'remote sensing',
    'create', 'illusion', 'transform', 'communication', 'luck control', 'extra limbs',
    'environment', 'summon'
  ];

  if (nonResistingEffects.includes(base) || effect.action === 'None' || (!res || res.toLowerCase() === 'none')) {
    return '';
  }

  return res ? `vs ${res}` : '';
}

/**
 * Formats effect range distance according to standard M&M 3E range rules.
 */
export function formatRange(effect) {
  if (!effect) return 'Close';
  const range = effect.range || 'Close';
  const ranks = Number(effect.ranks) || 1;

  if (range === 'Ranged') {
    return `Ranged (${ranks * 25}/${ranks * 50}/${ranks * 100} ft)`;
  }
  if (range === 'Perception') {
    return 'Perception Range';
  }
  if (range === 'Personal') {
    return 'Personal';
  }
  if (range === 'Rank') {
    return `Rank Distance (${Math.round(Math.pow(2, Math.max(0, ranks - 1)))} miles)`;
  }
  return 'Close Range';
}

/**
 * Resolves specialized configurable effect selections (Senses, Movement, Immunities, Affliction, etc.)
 */
export function resolveSpecialConfig(effect) {
  if (!effect || !effect.baseEffect) return '';
  const base = effect.baseEffect;
  const cfg = CONFIGURABLE_EFFECTS[base];
  const c = effect.config || {};
  const ranks = Number(effect.ranks) || 1;

  if (base === 'Flight' || base === 'Speed') {
    return `Speed Rank ${ranks} (${formatSpeedRank(ranks)})`;
  }
  if (base === 'Swimming') {
    const swRank = Math.max(0, ranks - 2);
    return `Water Speed Rank ${swRank} (${formatSpeedRank(swRank)})`;
  }
  if (base === 'Burrowing') {
    const buRank = Math.max(0, ranks - 5);
    return `Burrowing Speed Rank ${buRank} (${formatSpeedRank(buRank)})`;
  }
  if (base === 'Leaping') {
    const dist = ranks >= 4 ? `${Math.round(Math.pow(2, ranks - 4) * 30)} ft` : `Rank ${ranks}`;
    return `Leap Distance: ${dist} as move action`;
  }
  if (base === 'Teleport') {
    const dist = ranks >= 7 ? `${Math.round(Math.pow(2, ranks - 7))} miles` : `${Math.round(Math.pow(2, ranks) * 30)} ft`;
    return `Distance: ${dist} per move action`;
  }

  if (base === 'Senses') {
    const faculties = [...(cfg?.faculties || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedFaculties) && c.selectedFaculties.length > 0
      ? c.selectedFaculties
      : (cfg?.defaultFaculties || ['darkvision']);

    const names = selected.map(item => {
      const match = faculties.find(f => f.id === item || f.name?.toLowerCase() === String(item).toLowerCase());
      return match ? match.name : String(item);
    });
    return `Senses: ${names.join(', ')}`;
  }

  if (base === 'Affliction') {
    const first = c.firstDegree || 'Dazed';
    const second = c.secondDegree || 'Stunned';
    const third = c.thirdDegree || 'Incapacitated';
    const degrees = [first, second, third].filter(Boolean).join(' / ');
    const isProg = (effect.extras || []).some(e => e.name === 'Progressive');
    const isCum = (effect.extras || []).some(e => e.name === 'Cumulative');
    let mod = '';
    if (isProg) mod = ' (Progressive)';
    else if (isCum) mod = ' (Cumulative)';
    return `Conditions: ${degrees}${mod}`;
  }

  if (base === 'Immunity') {
    const presets = [...(cfg?.presets || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedPresets) && c.selectedPresets.length > 0
      ? c.selectedPresets
      : (cfg?.defaultPresets || ['life_support']);

    const names = selected.map(item => {
      const match = presets.find(p => p.id === item || p.name === item);
      return match ? match.name : String(item);
    });
    return `Immunities: ${names.join(', ')}`;
  }

  if (base === 'Enhanced Trait') {
    const targets = Array.isArray(c.selectedTraits) && c.selectedTraits.length > 0
      ? c.selectedTraits
      : [c.traitName || 'Strength'];
    return `Enhanced: ${targets.map(t => `${t} +${ranks}`).join(', ')}`;
  }

  if (base === 'Movement') {
    const modes = [...(cfg?.modes || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['wall_crawling']);

    const names = selected.map(item => {
      const modeId = typeof item === 'object' && item ? item.id : item;
      const rankNum = typeof item === 'object' && item ? (item.ranks || 1) : 1;
      const match = modes.find(m => m.id === modeId || m.name === modeId);
      const title = match ? match.name : String(modeId);
      return rankNum > 1 ? `${title} ${rankNum}` : title;
    });
    return `Modes: ${names.join(', ')}`;
  }

  if (base === 'Concealment') {
    const options = [...(cfg?.options || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedSenses) && c.selectedSenses.length > 0
      ? c.selectedSenses
      : (cfg?.defaultSenses || ['visual_normal']);

    const names = selected.map(item => {
      const match = options.find(o => o.id === item || o.name === item);
      return match ? match.name : String(item);
    });
    return `Concealment from: ${names.join(', ')}`;
  }

  if (base === 'Comprehend') {
    const modes = [...(cfg?.modes || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['languages_understand']);

    const names = selected.map(item => {
      const match = modes.find(m => m.id === item || m.name === item);
      return match ? match.name : String(item);
    });
    return `Comprehend: ${names.join(', ')}`;
  }

  if (base === 'Variable') {
    const theme = c.theme || 'Versatile Theme';
    return `Variable Pool: up to ${ranks * 5} PP allocated to "${theme}"`;
  }

  if (base === 'Morph') {
    const scopeNames = {
      1: 'Single Appearance',
      2: 'Narrow Group',
      3: 'Broad Group',
      4: 'Any Form'
    };
    const scope = Number(c.scope) || 1;
    return `Scope: ${scopeNames[scope] || `Rank ${scope}`}`;
  }

  return '';
}

/**
 * Formats extras and flaws lists with costs and ranks.
 */
export function formatModifiers(effect) {
  const parts = [];

  const extras = (Array.isArray(effect.extras) ? effect.extras : []).map(e => {
    let name = e.name || 'Extra';
    if (e.customText) name += ` [${e.customText}]`;
    if (e.rank && e.rank > 1) name += ` ${e.rank}`;
    const cost = e.cost ?? e.costPerRank;
    const isFlat = e.isFlat || e.type === 'flat';
    if (cost !== undefined) {
      name += ` (${cost > 0 ? '+' : ''}${cost}${isFlat ? ' flat' : '/rank'})`;
    }
    return name;
  });

  if (extras.length) {
    parts.push(`Extras: ${extras.join(', ')}`);
  }

  const flaws = (Array.isArray(effect.flaws) ? effect.flaws : []).map(f => {
    let name = f.name || 'Flaw';
    if (f.customText) name += ` [${f.customText}]`;
    if (f.rank && f.rank > 1) name += ` ${f.rank}`;
    const cost = f.cost ?? f.costPerRank;
    const isFlat = f.isFlat || f.type === 'flat';
    if (cost !== undefined) {
      name += ` (${cost > 0 ? '+' : ''}${cost}${isFlat ? ' flat' : '/rank'})`;
    }
    return name;
  });

  if (flaws.length) {
    parts.push(`Flaws: ${flaws.join(', ')}`);
  }

  return parts.join(' • ');
}

/**
 * Formats a clean mechanics line: Action, Range, Duration, Resistance DC.
 */
export function formatEffectMechanics(effect) {
  if (!effect) return '';
  const tokens = [];

  const act = effect.action || 'Standard';
  tokens.push(`Action: ${act}`);

  const rng = formatRange(effect);
  tokens.push(`Range: ${rng}`);

  const dur = effect.duration || 'Instant';
  tokens.push(`Duration: ${dur}`);

  const dc = calculateDC(effect);
  if (dc) {
    tokens.push(`Resist: ${dc}`);
  }

  return tokens.join(' • ');
}

/**
 * Returns structured representation of any power according to its architectural type:
 * Standard, Array, Compound, or Device.
 */
export function formatPowerStatblock(power) {
  if (!power) {
    return {
      title: 'Power',
      totalCost: 0,
      structureBadge: '',
      descriptorsText: '',
      mainLine: '',
      mechanicsLine: '',
      modifiersLine: '',
      specialConfigLine: '',
      subEntries: [],
      summaryText: ''
    };
  }

  const cost = calculatePowerTotalCost(power) || 0;
  const name = power.name || 'Unnamed Power';
  const type = power.type || 'standard';

  const rawDescList = Array.isArray(power.descriptors)
    ? power.descriptors
    : (typeof power.descriptors === 'string' && power.descriptors ? [power.descriptors] : []);
  const validDescriptors = rawDescList
    .map(d => (typeof d === 'string' ? d.trim() : ''))
    .filter(Boolean);
  const descriptors = validDescriptors.length ? `(${validDescriptors.join(', ')})` : '';

  const activation = (power.activation && power.activation !== 'none')
    ? `Activation: ${power.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}`
    : '';

  // STRUCTURE 1: DEVICE CONTAINER
  if (type === 'device') {
    const isEasily = power.deviceConfig?.type === 'easily_removable';
    const discPerFive = isEasily ? 2 : 1;
    const badge = isEasily ? 'EASILY REMOVABLE DEVICE' : 'REMOVABLE DEVICE';
    const toughness = power.deviceConfig?.toughness || 10;
    const deviceDesc = power.deviceConfig?.descriptor || 'Technological Device';

    const subEntries = (power.devicePowers || []).map(sp => {
      const eff = sp.effect || sp;
      const sCost = calculatePowerTotalCost(sp) || eff.cost || 0;
      const sMech = formatEffectMechanics(eff);
      const sCfg = resolveSpecialConfig(eff);
      const sMods = formatModifiers(eff);

      const bodyParts = [sMech, sCfg, sMods].filter(Boolean).join(' • ');
      return {
        label: sp.name || eff.baseEffect || 'System',
        effectName: `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`,
        mechanics: sMech,
        details: bodyParts,
        costBadge: `${sCost} PP`
      };
    });

    const specLine = `Device Toughness ${toughness} • Discount: -${discPerFive} PP per 5 PP • ${deviceDesc}`;

    return {
      title: name,
      totalCost: cost,
      structureBadge: badge,
      descriptorsText: descriptors,
      mainLine: descriptors,
      mechanicsLine: specLine,
      modifiersLine: activation,
      specialConfigLine: '',
      subEntries,
      summaryText: `${name}: ${badge} [${cost} PP] • ${subEntries.length} systems installed`
    };
  }

  // STRUCTURE 2: COMPOUND POWER (Linked Combo or Bundled Traits)
  if (type === 'compound') {
    const compoundEffects = power.compoundEffects || [];
    const hasLinked = compoundEffects.some(cp => cp.isLinked);
    const badge = hasLinked ? 'COMPOUND (LINKED COMBO)' : `COMPOUND (${compoundEffects.length} EFFECTS)`;

    const subEntries = compoundEffects.map((cp, idx) => {
      const eff = cp.effect || cp;
      const cCost = calculatePowerTotalCost(cp) || eff.cost || 0;
      const tag = cp.isPrimaryAction ? 'Primary Action' : (cp.isLinked ? 'Linked Effect' : `Trait ${idx + 1}`);
      const sMech = formatEffectMechanics(eff);
      const sCfg = resolveSpecialConfig(eff);
      const sMods = formatModifiers(eff);

      const bodyParts = [sMech, sCfg, sMods].filter(Boolean).join(' • ');
      return {
        label: `${tag}: ${cp.name || eff.baseEffect}`,
        effectName: `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`,
        mechanics: sMech,
        details: bodyParts,
        costBadge: `${cCost} PP`
      };
    });

    const sharedMods = formatModifiers({ extras: power.sharedModifiers || [], flaws: [] });

    return {
      title: name,
      totalCost: cost,
      structureBadge: badge,
      descriptorsText: descriptors,
      mainLine: descriptors,
      modifiersLine: [sharedMods, activation].filter(Boolean).join(' • '),
      specialConfigLine: '',
      subEntries,
      summaryText: `${name}: ${badge} [${cost} PP]`
    };
  }

  // STRUCTURE 3: POWER ARRAY (Primary Effect + Alternate Effects)
  const hasAlternateEffects = Array.isArray(power.alternateEffects) && power.alternateEffects.length > 0;
  if (type === 'array' || hasAlternateEffects) {
    const mainEff = power.mainEffect || power;
    const mainBase = mainEff.baseEffect || 'Effect';
    const mainRanks = mainEff.ranks || 1;
    const mainMech = formatEffectMechanics(mainEff);
    const mainCfg = resolveSpecialConfig(mainEff);
    const mainMods = formatModifiers(mainEff);

    const subEntries = (power.alternateEffects || []).map(alt => {
      const altEff = alt.effect || alt;
      const isDynamic = Boolean(alt.isDynamic || alt.dynamic);
      const slotCost = isDynamic ? 2 : 1;
      const altMech = formatEffectMechanics(altEff);
      const altCfg = resolveSpecialConfig(altEff);
      const altMods = formatModifiers(altEff);

      const bodyParts = [altMech, altCfg, altMods].filter(Boolean).join(' • ');
      return {
        label: `Alternate Effect: ${alt.name || altEff.baseEffect}`,
        effectName: `${altEff.baseEffect || 'Effect'} ${altEff.ranks || 1}`,
        mechanics: altMech,
        details: bodyParts,
        costBadge: `${slotCost} PP Slot`
      };
    });

    return {
      title: name,
      totalCost: cost,
      structureBadge: `ARRAY (${subEntries.length + 1} MODES)`,
      descriptorsText: descriptors,
      mainLine: descriptors ? `${mainBase} ${mainRanks} ${descriptors}` : `${mainBase} ${mainRanks}`,
      mechanicsLine: mainMech,
      modifiersLine: [mainMods, activation].filter(Boolean).join(' • '),
      specialConfigLine: mainCfg,
      subEntries,
      summaryText: `${name}: Array [${cost} PP] • Primary: ${mainBase} ${mainRanks}`
    };
  }

  // STRUCTURE 4: STANDARD POWER (Single Effect)
  const eff = power.mainEffect || power;
  const base = eff.baseEffect || 'Effect';
  const ranks = eff.ranks || 1;
  const mech = formatEffectMechanics(eff);
  const cfg = resolveSpecialConfig(eff);
  const mods = formatModifiers(eff);

  return {
    title: name,
    totalCost: cost,
    structureBadge: '',
    descriptorsText: descriptors,
    mainLine: descriptors ? `${base} ${ranks} ${descriptors}` : `${base} ${ranks}`,
    mechanicsLine: mech,
    modifiersLine: [mods, activation].filter(Boolean).join(' • '),
    specialConfigLine: cfg,
    subEntries: [],
    summaryText: `${name}: ${base} ${ranks} [${cost} PP]`
  };
}
