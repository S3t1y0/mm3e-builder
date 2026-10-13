// js/rules/powerFormatter.js
import { BASE_EFFECTS, CONFIGURABLE_EFFECTS, calculatePowerTotalCost, calculateEffectCost } from './powerEngine.js';
import { resolveEffectRulesBlock, formatTimeRank, formatDistanceRank } from './powerRuleDescriptions.js';
import { formatMeasurementDistance } from './powerCalculator.js';

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
export function formatSpeedRank(rank, options = {}) {
  const r = parseInt(rank, 10) || 0;
  if (SPEED_RANK_TABLE[r]) {
    const raw = SPEED_RANK_TABLE[r];
    if (options.compact || options.inline) {
      return raw.replace(/\s*\((.*?)\)\s*/, (match, p1) => ` • ${p1}`);
    }
    return raw;
  }
  if (r > 20) return `Faster Than Light (Rank ${r})`;
  const mph = Math.round(Math.pow(2, r) * 2);
  const ftRound = Math.round((mph * 5280) / 600);
  return `${mph.toLocaleString()} MPH • ${ftRound.toLocaleString()} ft/round`;
}

/**
 * Calculates Resistance Check DC according to M&M 3E rules.
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
    return `Rank Range (${formatMeasurementDistance(ranks)})`;
  }
  return 'Close Range';
}

/**
 * Resolves specialized configurable effect selections (Senses, Movement, Immunities, Affliction, etc.)
 */
export function resolveSpecialConfig(effect) {
  if (!effect) return '';
  const rawBase = effect.baseEffect || effect.name || '';
  const baseKey = String(rawBase).trim().toLowerCase();
  const cfg = CONFIGURABLE_EFFECTS[rawBase] || CONFIGURABLE_EFFECTS[Object.keys(CONFIGURABLE_EFFECTS).find(k => k.toLowerCase() === baseKey)];
  const c = effect.config || {};
  const ranks = Number(effect.ranks) || 1;

  if (baseKey === 'flight' || baseKey === 'speed') {
    return `Speed Rank ${ranks} (${formatSpeedRank(ranks)})`;
  }
  if (baseKey === 'swimming') {
    const swRank = Math.max(0, ranks - 2);
    return `Water Speed Rank ${swRank} (${formatSpeedRank(swRank)})`;
  }
  if (baseKey === 'burrowing') {
    const buRank = Math.max(0, ranks - 5);
    return `Burrowing Speed Rank ${buRank} (${formatSpeedRank(buRank)})`;
  }
  if (baseKey === 'leaping') {
    const standDist = formatDistanceRank(ranks - 2);
    const runDist = formatDistanceRank(ranks - 1);
    return `Leap Distance: ${standDist} standing (${runDist} running) • Free action`;
  }
  if (baseKey === 'teleport') {
    const dist = formatDistanceRank(ranks);
    return `Teleport Distance: ${dist} • Max 50 lbs default • Move action`;
  }
  if (baseKey === 'weaken') {
    const trait = c.trait || c.targetTrait || 'Target Trait';
    return `Drains: ${trait} (1 pt per pt below DC, max ${ranks})`;
  }
  if (baseKey === 'healing') {
    return 'Healing: DC 10 check removes 1 condition/degree • Stabilizes dying';
  }
  if (baseKey === 'immortality') {
    const recTimeRank = 19 - ranks;
    const timeStr = formatTimeRank(recTimeRank);
    return `Recovery Time: ${timeStr} (Time Rank ${recTimeRank})`;
  }
  if (baseKey === 'insubstantial') {
    const formNames = {
      1: 'Fluid (flow through openings)',
      2: 'Gaseous (gas/cloud form)',
      3: 'Energy (coherent energy)',
      4: 'Incorporeal (intangible ghost)'
    };
    return `Form: ${formNames[ranks] || `Rank ${ranks}`}`;
  }
  if (baseKey === 'deflect') {
    return `Deflect Bonus: d20 + ${ranks} (min 10 on die)`;
  }
  if (baseKey === 'protection') {
    return `Toughness Bonus: +${ranks}`;
  }

  if (baseKey === 'senses') {
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

  if (baseKey === 'affliction') {
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

  if (baseKey === 'immunity') {
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

  if (baseKey === 'enhanced trait') {
    const targets = Array.isArray(c.selectedTraits) && c.selectedTraits.length > 0
      ? c.selectedTraits
      : [c.traitName || 'Strength'];
    return `Enhanced: ${targets.map(t => `${t} +${ranks}`).join(', ')}`;
  }

  if (baseKey === 'movement') {
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

  if (baseKey === 'concealment') {
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

  if (baseKey === 'comprehend') {
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

  if (baseKey === 'variable') {
    const theme = c.theme || 'Versatile Theme';
    return `Variable Pool: up to ${ranks * 5} PP allocated to "${theme}"`;
  }

  if (baseKey === 'morph') {
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
export function formatModifiers(effect, options = {}) {
  const parts = [];

  const extras = (Array.isArray(effect.extras) ? effect.extras : []).map(e => {
    let name = e.name || 'Extra';
    if (e.customText) name += ` [${e.customText}]`;
    if (e.rank && e.rank > 1) name += ` ${e.rank}`;
    if (!options.compact) {
      const cost = e.cost ?? e.costPerRank;
      const isFlat = e.isFlat || e.type === 'flat';
      if (cost !== undefined) {
        name += ` (${cost > 0 ? '+' : ''}${cost}${isFlat ? ' flat' : '/rank'})`;
      }
    }
    return name;
  });

  if (extras.length) {
    parts.push(options.compact ? extras.join(', ') : `Extras: ${extras.join(', ')}`);
  }

  const flaws = (Array.isArray(effect.flaws) ? effect.flaws : []).map(f => {
    let name = f.name || 'Flaw';
    if (f.customText) name += ` [${f.customText}]`;
    if (f.rank && f.rank > 1) name += ` ${f.rank}`;
    if (!options.compact) {
      const cost = f.cost ?? f.costPerRank;
      const isFlat = f.isFlat || e.type === 'flat';
      if (cost !== undefined) {
        name += ` (${cost > 0 ? '+' : ''}${cost}${isFlat ? ' flat' : '/rank'})`;
      }
    }
    return name;
  });

  if (flaws.length) {
    parts.push(options.compact ? flaws.join(', ') : `Flaws: ${flaws.join(', ')}`);
  }

  return parts.join(' • ');
}

/**
 * Formats a clean mechanics line: Action, Range, Duration, Resistance DC.
 * Intelligently suppresses default passive metadata (Action: None, Range: Personal, Duration: Continuous/Permanent).
 */
export function formatEffectMechanics(effect, options = {}) {
  if (!effect) return '';
  const tokens = [];
  const baseKey = String(effect.baseEffect || effect.name || '').trim().toLowerCase();

  const isPassive = ['protection', 'immunity', 'senses'].includes(baseKey);

  const act = effect.action || (isPassive ? 'None' : 'Standard');
  const rng = formatRange(effect);
  const dur = effect.duration || (isPassive ? 'Continuous' : 'Instant');

  // Only show Action if it is not default passive None or standard active
  if (!isPassive && act !== 'Standard') {
    tokens.push(act === 'Free' ? 'Free Action' : (act === 'Move' ? 'Move Action' : `Action: ${act}`));
  } else if (isPassive && act !== 'None') {
    tokens.push(`${act} Action`);
  }

  // Only show Range if non-personal on passive, or non-close on active
  if (isPassive) {
    if (rng !== 'Personal' && rng !== 'Close Range') {
      tokens.push(rng);
    }
  } else {
    if (rng === 'Personal') {
      tokens.push('Personal Range');
    } else if (rng !== 'Close Range') {
      tokens.push(rng);
    }
  }

  // Only show Duration if non-default
  if (isPassive) {
    if (dur !== 'Continuous' && dur !== 'Permanent') {
      tokens.push(dur);
    }
  } else {
    if (dur === 'Sustained') {
      tokens.push('Sustained');
    } else if (dur === 'Concentration' || dur === 'Continuous') {
      tokens.push(dur);
    } else if (dur !== 'Instant') {
      tokens.push(`Duration: ${dur}`);
    }
  }

  if (options.includeDC !== false) {
    const dc = calculateDC(effect);
    if (dc) {
      tokens.push(`Resist: ${dc}`);
    }
  }

  return tokens.join(' • ');
}

/**
 * Creates a punchy, compact summary of an individual effect for inline statblock presentation.
 */
export function formatEffectInlineSummary(effect) {
  if (!effect) return '';
  const eff = effect.effect || effect;
  const rawBase = eff.baseEffect || eff.name || 'Effect';
  const baseKey = String(rawBase).trim().toLowerCase();
  const ranks = Number(eff.ranks) || 1;
  const rankStr = eff.ranks ? ` ${eff.ranks}` : '';
  const spec = resolveSpecialConfig(eff);
  const c = eff.config || {};

  let coreDesc = '';
  if (baseKey === 'protection') {
    const imp = (eff.extras || []).find(e => (e.name || '').toLowerCase() === 'impervious');
    const impStr = imp ? ' (Impervious)' : '';
    coreDesc = `Protection ${ranks}${impStr}`;
  } else if (baseKey === 'immunity') {
    const immList = spec ? spec.replace(/^Immunities:\s*/i, '') : 'Broad Trait';
    coreDesc = `Immunity ${ranks} (${immList})`;
  } else if (baseKey === 'senses') {
    const sensList = spec ? spec.replace(/^Senses:\s*/i, '') : 'Sensory';
    coreDesc = `Senses ${ranks} (${sensList})`;
  } else if (baseKey === 'enhanced trait') {
    coreDesc = spec ? spec.replace(/^Enhanced:\s*/i, 'Enhanced ') : `Enhanced Trait ${ranks}`;
  } else if (baseKey === 'speed') {
    coreDesc = `Speed ${ranks} (${formatSpeedRank(ranks, { compact: true })})`;
  } else if (baseKey === 'leaping') {
    const standDist = formatDistanceRank(ranks - 2);
    coreDesc = `Leaping ${ranks} (${standDist})`;
  } else if (baseKey === 'flight') {
    coreDesc = `Flight ${ranks} (${formatSpeedRank(ranks, { compact: true })})`;
  } else if (baseKey === 'swimming') {
    const swRank = Math.max(0, ranks - 2);
    coreDesc = `Swimming ${ranks} (${formatSpeedRank(swRank, { compact: true })})`;
  } else if (baseKey === 'burrowing') {
    const buRank = Math.max(0, ranks - 5);
    coreDesc = `Burrowing ${ranks} (${formatSpeedRank(buRank, { compact: true })})`;
  } else if (baseKey === 'damage' || baseKey === 'blast') {
    const dc = 15 + ranks;
    const res = eff.resistance || 'Toughness';
    const rng = eff.range === 'Ranged' ? 'Ranged ' : (eff.range === 'Perception' ? 'Perception ' : '');
    coreDesc = `${rng}${rawBase} ${ranks} (DC ${dc} vs ${res})`;
  } else if (baseKey === 'affliction') {
    const dc = 10 + ranks;
    const res = eff.resistance || 'Fortitude';
    const first = c.firstDegree || 'Dazed';
    const second = c.secondDegree || 'Stunned';
    const third = c.thirdDegree || 'Incapacitated';
    const degrees = [first, second, third].filter(Boolean).join('/');
    const rng = eff.range === 'Ranged' ? 'Ranged ' : (eff.range === 'Perception' ? 'Perception ' : '');
    coreDesc = `${rng}Affliction ${ranks} (DC ${dc} vs ${res}; ${degrees})`;
  } else if (baseKey === 'weaken') {
    const dc = 10 + ranks;
    const res = eff.resistance || 'Fortitude';
    const trait = c.trait || c.targetTrait || 'Trait';
    const rng = eff.range === 'Ranged' ? 'Ranged ' : '';
    coreDesc = `${rng}Weaken ${trait} ${ranks} (DC ${dc} vs ${res})`;
  } else if (baseKey === 'nullify') {
    const dc = 10 + ranks;
    const res = eff.resistance || 'Will';
    const target = c.targetEffect || c.theme || 'Effects';
    coreDesc = `Nullify ${target} ${ranks} (DC ${dc} vs ${res})`;
  } else {
    const parts = [`${rawBase}${rankStr}`];
    if (spec) parts.push(spec);
    coreDesc = parts.join(' • ');
  }

  // Mechanically suppress DC duplication
  const mech = formatEffectMechanics(eff, { includeDC: false });
  // Filter out impervious from mods on Protection since it is already inline
  const mods = baseKey === 'protection' ? '' : formatModifiers(eff, { compact: true });

  const finalParts = [coreDesc];
  if (mech) finalParts.push(mech);
  if (mods) finalParts.push(mods);

  return finalParts.join(' • ');
}

/**
 * Formats a linked effect as a sub-entry for the statblock.
 */
export function formatLinkedSubEntry(linked) {
  if (!linked) return null;
  const eff = linked.effect || linked;
  const lCost = calculateEffectCost(eff, 0)?.totalCost || eff.cost || 0;
  const sRules = resolveEffectRulesBlock(eff);

  const rawName = (linked.name || '').trim();
  const cleanName = rawName
    .replace(/^linked\s*:\s*/i, '')
    .replace(/\s*[\(\[]linked(?: effect)?[\)\]]\s*$/i, '')
    .trim();

  const effBase = eff.baseEffect || 'Effect';
  const rankStr = eff.ranks ? ` ${eff.ranks}` : '';
  const isSameAsBase = !cleanName || cleanName.toLowerCase() === effBase.toLowerCase();
  const labelText = isSameAsBase
    ? `${effBase}${rankStr}`
    : `${cleanName} (${effBase}${rankStr})`;

  const inlineSummary = formatEffectInlineSummary(eff);

  return {
    label: `↳ ${labelText}`,
    effectName: `${effBase}${rankStr}`,
    effectBaseName: effBase,
    mechanics: '',
    details: inlineSummary || `${effBase}${rankStr}`,
    costBadge: `${lCost} PP`,
    effectRuleDesc: sRules.effectRuleDesc,
    effectRuleDescs: sRules.effectRuleDescs,
    modifierRules: sRules.modifierRules,
    isLinked: true
  };
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

  // Device container
  if (type === 'device') {
    const isEasily = power.deviceConfig?.type === 'easily_removable';
    const discPerFive = isEasily ? 2 : 1;
    const badge = isEasily ? 'EASILY REMOVABLE DEVICE' : 'REMOVABLE DEVICE';
    const toughness = power.deviceConfig?.toughness || 10;
    const deviceDesc = power.deviceConfig?.descriptor || 'Technological Device';

    const subEntries = [];
    (power.devicePowers || []).forEach(sp => {
      const eff = sp.effect || sp;
      const sCost = calculateEffectCost(eff, 0)?.totalCost || calculatePowerTotalCost(sp) || eff.cost || 0;
      const spLinked = Array.isArray(sp.linkedEffects) ? sp.linkedEffects : (Array.isArray(eff.linkedEffects) ? eff.linkedEffects : []);
      const sRules = resolveEffectRulesBlock(eff);
      const combinedModifierRules = [...sRules.modifierRules];

      if (spLinked.length === 0) {
        const sMech = formatEffectMechanics(eff);
        const sMods = formatModifiers(eff);
        const sSpecial = resolveSpecialConfig(eff);
        const inlineSummary = formatEffectInlineSummary(eff);
        const bodyParts = inlineSummary || [sSpecial, sMech, sMods].filter(Boolean).join(' • ') || `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`;

        subEntries.push({
          label: sp.name || eff.baseEffect || 'System',
          effectName: `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`,
          effectBaseName: eff.baseEffect || sp.name || 'Effect',
          mechanics: sMech,
          details: bodyParts,
          costBadge: `${sCost} PP`,
          effectRuleDesc: sRules.effectRuleDesc,
          effectRuleDescs: sRules.effectRuleDescs,
          modifierRules: combinedModifierRules
        });
      } else {
        // Linked combo: combine inline with adaptive line splitting
        let totalComboCost = sCost;
        const mainSummary = formatEffectInlineSummary(eff);
        const inlineLinkedParts = [];
        const overflowSubEntries = [];

        spLinked.forEach(le => {
          const leEff = le.effect || le;
          const leCost = calculateEffectCost(leEff, 0)?.totalCost || leEff.cost || 0;
          totalComboCost += leCost;

          const leRules = resolveEffectRulesBlock(leEff);

          const rawLName = (le.name || '').trim()
            .replace(/^linked\s*:\s*/i, '')
            .replace(/\s*[\(\[]linked(?: effect)?[\)\]]\s*$/i, '')
            .trim();
          const isSame = !rawLName || rawLName.toLowerCase() === (leEff.baseEffect || '').toLowerCase();
          const leSummary = formatEffectInlineSummary(leEff);
          const leText = isSame ? leSummary : `${rawLName} (${leSummary})`;

          // Test current total length for adaptive 100-character line wrapping
          const prospectiveLine = [mainSummary, ...inlineLinkedParts, leText].join(' & ');
          if (prospectiveLine.length <= 100 && overflowSubEntries.length === 0) {
            inlineLinkedParts.push(leText);
            if (leRules.modifierRules?.length) {
              for (const mr of leRules.modifierRules) {
                if (!combinedModifierRules.some(c => c.name.toLowerCase() === mr.name.toLowerCase())) {
                  combinedModifierRules.push(mr);
                }
              }
            }
          } else {
            // Adaptive overflow: flows to the next ruled line cleanly
            overflowSubEntries.push({
              label: `↳ ${rawLName || leEff.baseEffect || 'Effect'}`,
              effectName: `${leEff.baseEffect || 'Effect'} ${leEff.ranks || 1}`,
              effectBaseName: leEff.baseEffect || rawLName || 'Effect',
              mechanics: '',
              details: leSummary,
              costBadge: `${leCost} PP`,
              effectRuleDesc: leRules.effectRuleDesc,
              effectRuleDescs: leRules.effectRuleDescs,
              modifierRules: leRules.modifierRules,
              isLinked: true
            });
          }
        });

        const combinedDetails = [mainSummary, ...inlineLinkedParts].join(' & ');

        subEntries.push({
          label: sp.name || eff.baseEffect || 'System',
          effectName: `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`,
          effectBaseName: eff.baseEffect || sp.name || 'Effect',
          mechanics: '',
          details: combinedDetails,
          costBadge: `${totalComboCost} PP`,
          effectRuleDesc: sRules.effectRuleDesc,
          effectRuleDescs: sRules.effectRuleDescs,
          modifierRules: combinedModifierRules
        });

        // Add any overflow linked rows
        overflowSubEntries.forEach(of => subEntries.push(of));
      }

      // Alternate effects on this device sub-power (if any)
      if (Array.isArray(sp.alternateEffects)) {
        sp.alternateEffects.forEach(alt => {
          const altEff = alt.effect || alt;
          const altCost = alt.isDynamic ? 2 : 1;
          const altRules = resolveEffectRulesBlock(altEff);
          const altSummary = formatEffectInlineSummary(altEff);

          subEntries.push({
            label: `Alternate Effect: ${alt.name || altEff.baseEffect}`,
            effectName: `${altEff.baseEffect || 'Effect'} ${altEff.ranks || 1}`,
            effectBaseName: altEff.baseEffect || alt.name || 'Effect',
            mechanics: '',
            details: altSummary,
            costBadge: `${altCost} PP Slot`,
            effectRuleDesc: altRules.effectRuleDesc,
            effectRuleDescs: altRules.effectRuleDescs,
            modifierRules: altRules.modifierRules
          });

          const altLinked = Array.isArray(alt.linkedEffects) ? alt.linkedEffects : (Array.isArray(altEff.linkedEffects) ? altEff.linkedEffects : []);
          altLinked.forEach(ale => {
            const item = formatLinkedSubEntry(ale);
            if (item) subEntries.push(item);
          });
        });
      }
    });

    if (Array.isArray(power.linkedEffects)) {
      power.linkedEffects.forEach(le => {
        const item = formatLinkedSubEntry(le);
        if (item) subEntries.push(item);
      });
    }

    const specLine = [
      `Device Toughness ${toughness}`,
      `Discount: -${discPerFive} PP per 5 PP`,
      activation ? activation.replace(/^Activation:\s*/i, '') : '',
      deviceDesc
    ].filter(Boolean).join(' • ');

    return {
      title: name,
      totalCost: cost,
      structureBadge: badge,
      descriptorsText: descriptors,
      mainLine: descriptors,
      mechanicsLine: specLine,
      modifiersLine: '',
      specialConfigLine: '',
      effectBaseName: '',
      effectRuleDesc: '',
      effectRuleDescs: [],
      modifierRules: [],
      subEntries,
      summaryText: `${name}: ${badge} [${cost} PP] • ${subEntries.length} systems installed`
    };
  }

  // Compound power
  if (type === 'compound') {
    const compoundEffects = power.compoundEffects || [];
    const hasLinked = compoundEffects.some(cp => cp.isLinked) || (Array.isArray(power.linkedEffects) && power.linkedEffects.length > 0);
    const badge = hasLinked ? 'COMPOUND (LINKED COMBO)' : `COMPOUND (${compoundEffects.length} EFFECTS)`;

    const subEntries = [];
    compoundEffects.forEach((cp, idx) => {
      const eff = cp.effect || cp;
      const cCost = calculateEffectCost(eff, 0)?.totalCost || calculatePowerTotalCost(cp) || eff.cost || 0;
      const tag = cp.isPrimaryAction ? 'Primary Action' : (cp.isLinked ? 'Linked Effect' : `Trait ${idx + 1}`);
      const cRules = resolveEffectRulesBlock(eff);
      const cSummary = formatEffectInlineSummary(eff);

      const rawCpName = (cp.name || eff.baseEffect || '').trim();
      const cleanCpName = rawCpName.replace(/\s*[\(\[]linked(?: effect)?[\)\]]\s*$/i, '').trim() || eff.baseEffect;
      subEntries.push({
        label: `${tag}: ${cleanCpName}`,
        effectName: `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`,
        effectBaseName: eff.baseEffect || cleanCpName || 'Effect',
        mechanics: '',
        details: cSummary,
        costBadge: `${cCost} PP`,
        effectRuleDesc: cRules.effectRuleDesc,
        effectRuleDescs: cRules.effectRuleDescs,
        modifierRules: cRules.modifierRules
      });

      const cpLinked = Array.isArray(cp.linkedEffects) ? cp.linkedEffects : (Array.isArray(eff.linkedEffects) ? eff.linkedEffects : []);
      cpLinked.forEach(le => {
        const item = formatLinkedSubEntry(le);
        if (item) subEntries.push(item);
      });
    });

    if (Array.isArray(power.linkedEffects)) {
      power.linkedEffects.forEach(le => {
        const item = formatLinkedSubEntry(le);
        if (item) subEntries.push(item);
      });
    }

    const sharedMods = formatModifiers({ extras: power.sharedModifiers || [], flaws: [] });
    const sharedRules = resolveEffectRulesBlock({ extras: power.sharedModifiers || [], flaws: [] });

    return {
      title: name,
      totalCost: cost,
      structureBadge: badge,
      descriptorsText: descriptors,
      mainLine: descriptors,
      modifiersLine: [sharedMods, activation].filter(Boolean).join(' • '),
      specialConfigLine: '',
      effectBaseName: '',
      effectRuleDesc: '',
      effectRuleDescs: [],
      modifierRules: sharedRules.modifierRules,
      subEntries,
      summaryText: `${name}: ${badge} [${cost} PP]`
    };
  }

  // Power array
  const hasAlternateEffects = Array.isArray(power.alternateEffects) && power.alternateEffects.length > 0;
  if (type === 'array' || hasAlternateEffects) {
    const mainEff = power.mainEffect || power;
    const mainBase = mainEff.baseEffect || 'Effect';
    const mainRanks = mainEff.ranks || 1;
    const mainMech = formatEffectMechanics(mainEff);
    const mainMods = formatModifiers(mainEff);
    const mainRules = resolveEffectRulesBlock(mainEff);

    const subEntries = [];

    // Primary effect linked effects
    const primaryLinked = Array.isArray(power.linkedEffects) && power.linkedEffects.length > 0
      ? power.linkedEffects
      : (Array.isArray(mainEff.linkedEffects) ? mainEff.linkedEffects : []);

    primaryLinked.forEach(le => {
      const item = formatLinkedSubEntry(le);
      if (item) subEntries.push(item);
    });

    (power.alternateEffects || []).forEach(alt => {
      const altEff = alt.effect || alt;
      const isDynamic = Boolean(alt.isDynamic || alt.dynamic);
      const slotCost = isDynamic ? 2 : 1;
      const altRules = resolveEffectRulesBlock(altEff);
      const altSummary = formatEffectInlineSummary(altEff);

      subEntries.push({
        label: `Alternate Effect: ${alt.name || altEff.baseEffect}`,
        effectName: `${altEff.baseEffect || 'Effect'} ${altEff.ranks || 1}`,
        effectBaseName: altEff.baseEffect || alt.name || 'Effect',
        mechanics: '',
        details: altSummary,
        costBadge: `${slotCost} PP Slot`,
        effectRuleDesc: altRules.effectRuleDesc,
        effectRuleDescs: altRules.effectRuleDescs,
        modifierRules: altRules.modifierRules
      });

      const altLinked = Array.isArray(alt.linkedEffects) ? alt.linkedEffects : (Array.isArray(altEff.linkedEffects) ? altEff.linkedEffects : []);
      altLinked.forEach(ale => {
        const item = formatLinkedSubEntry(ale);
        if (item) subEntries.push(item);
      });
    });

    const hasLinked = primaryLinked.length > 0 || (power.alternateEffects || []).some(alt => {
      const ae = alt.effect || alt;
      return (alt.linkedEffects && alt.linkedEffects.length > 0) || (ae.linkedEffects && ae.linkedEffects.length > 0);
    });
    const altCount = (power.alternateEffects || []).length;
    const badge = hasLinked ? `ARRAY (${altCount + 1} MODES • LINKED)` : `ARRAY (${altCount + 1} MODES)`;

    return {
      title: name,
      totalCost: cost,
      structureBadge: badge,
      descriptorsText: descriptors,
      mainLine: descriptors ? `${mainBase} ${mainRanks} ${descriptors}` : `${mainBase} ${mainRanks}`,
      mechanicsLine: mainMech,
      modifiersLine: [mainMods, activation].filter(Boolean).join(' • '),
      specialConfigLine: resolveSpecialConfig(mainEff),
      effectBaseName: mainBase,
      effectRuleDesc: mainRules.effectRuleDesc,
      effectRuleDescs: mainRules.effectRuleDescs,
      modifierRules: mainRules.modifierRules,
      subEntries,
      summaryText: `${name}: Array [${cost} PP] • Primary: ${mainBase} ${mainRanks}`
    };
  }

  // Standard single-effect power
  const eff = power.mainEffect || power;
  const base = eff.baseEffect || 'Effect';
  const ranks = eff.ranks || 1;
  const mech = formatEffectMechanics(eff);
  const mods = formatModifiers(eff);
  const rules = resolveEffectRulesBlock(eff);
  const combinedModifierRules = [...rules.modifierRules];

  const subEntries = [];
  const linkedList = Array.isArray(power.linkedEffects) && power.linkedEffects.length > 0
    ? power.linkedEffects
    : (Array.isArray(eff.linkedEffects) ? eff.linkedEffects : []);

  let displayMainLine = descriptors ? `${base} ${ranks} ${descriptors}` : `${base} ${ranks}`;
  let displayTotalCost = cost;

  if (linkedList.length > 0) {
    const inlineLinked = [];

    linkedList.forEach(le => {
      const leEff = le.effect || le;
      const leCost = calculateEffectCost(leEff, 0)?.totalCost || leEff.cost || 0;
      const leRules = resolveEffectRulesBlock(leEff);

      const rawLName = (le.name || '').trim()
        .replace(/^linked\s*:\s*/i, '')
        .replace(/\s*[\(\[]linked(?: effect)?[\)\]]\s*$/i, '')
        .trim();
      const isSame = !rawLName || rawLName.toLowerCase() === (leEff.baseEffect || '').toLowerCase();
      const leSummary = formatEffectInlineSummary(leEff);
      const leText = isSame ? leSummary : `${rawLName} (${leSummary})`;

      const prospective = [displayMainLine, ...inlineLinked, leText].join(' & ');
      if (prospective.length <= 95 && subEntries.length === 0) {
        inlineLinked.push(leText);
        if (leRules.modifierRules?.length) {
          for (const mr of leRules.modifierRules) {
            if (!combinedModifierRules.some(c => c.name.toLowerCase() === mr.name.toLowerCase())) {
              combinedModifierRules.push(mr);
            }
          }
        }
      } else {
        subEntries.push({
          label: `↳ ${rawLName || leEff.baseEffect || 'Effect'}`,
          effectName: `${leEff.baseEffect || 'Effect'} ${leEff.ranks || 1}`,
          effectBaseName: leEff.baseEffect || rawLName || 'Effect',
          mechanics: '',
          details: leSummary,
          costBadge: `${leCost} PP`,
          effectRuleDesc: leRules.effectRuleDesc,
          effectRuleDescs: leRules.effectRuleDescs,
          modifierRules: leRules.modifierRules,
          isLinked: true
        });
      }
    });

    if (inlineLinked.length > 0) {
      displayMainLine = [displayMainLine, ...inlineLinked].join(' & ');
    }
  }

  const hasLinked = linkedList.length > 0;
  const structureBadge = hasLinked ? 'LINKED COMBO' : '';

  return {
    title: name,
    totalCost: displayTotalCost,
    structureBadge,
    descriptorsText: descriptors,
    mainLine: displayMainLine,
    mechanicsLine: mech,
    modifiersLine: [mods, activation].filter(Boolean).join(' • '),
    specialConfigLine: resolveSpecialConfig(eff),
    effectBaseName: base,
    effectRuleDesc: rules.effectRuleDesc,
    effectRuleDescs: rules.effectRuleDescs,
    modifierRules: combinedModifierRules,
    subEntries,
    summaryText: hasLinked
      ? `${name}: ${displayMainLine} [${displayTotalCost} PP]`
      : `${name}: ${base} ${ranks} [${displayTotalCost} PP]`
  };
}


