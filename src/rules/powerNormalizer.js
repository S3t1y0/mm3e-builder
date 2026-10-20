import { BASE_EFFECTS, CONFIGURABLE_EFFECTS, EXTRAS, FLAWS } from '../data/index.js';

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
  power.linkedEffects = Array.isArray(power.linkedEffects)
    ? power.linkedEffects.map(normalizeEffect)
    : [];
  power.alternateEffects = Array.isArray(power.alternateEffects)
    ? power.alternateEffects.map(normalizeAlternateSlot)
    : [];
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
  const cfg = CONFIGURABLE_EFFECTS[eff.baseEffect];
  if (cfg) {
    eff.config = eff.config && typeof eff.config === 'object' ? { ...eff.config } : {};
    if (cfg.type === 'senses_multiselect') {
      if (!Array.isArray(eff.config.senses) || eff.config.senses.length === 0) {
        eff.config.senses = [...(cfg.defaultSenses || ['Visual'])];
      }
    } else if (cfg.type === 'trait_picker') {
      eff.config.traitCategory = eff.config.traitCategory || cfg.defaultCategory || 'abilities';
      if (!Array.isArray(eff.config.selectedTraits) || eff.config.selectedTraits.length === 0) {
        eff.config.selectedTraits = eff.config.traitName ? [eff.config.traitName] : [cfg.defaultTrait || 'Strength'];
      }
      eff.config.traitName = eff.config.selectedTraits[0] || cfg.defaultTrait || 'Strength';
    } else if (cfg.type === 'affliction_builder') {
      eff.config.resistance = eff.config.resistance || eff.resistance || cfg.defaultResistance || 'Fortitude';
      eff.config.preset = eff.config.preset || 'stun';
      
      const extraMod = (eff.extras || []).find(e => e.name === 'Extra Condition');
      const extraRanks = extraMod ? (Number(extraMod.ranks) || 1) : 0;
      const condsPerDegree = 1 + extraRanks;

      const parseConditions = (degArr, degStr, defVal, defaultExtras = []) => {
        let list = [];
        if (Array.isArray(degArr) && degArr.length > 0) {
          list = [...degArr.filter(Boolean)];
        } else if (typeof degStr === 'string' && degStr.trim()) {
          list = degStr.split(/\s*(?:&|,)\s*/).filter(Boolean);
        } else {
          list = [defVal];
        }
        if (list.length < condsPerDegree && typeof degStr === 'string' && degStr.includes('&')) {
          const fromStr = degStr.split(/\s*(?:&|,)\s*/).filter(Boolean);
          if (fromStr.length > list.length) list = fromStr;
        }
        while (list.length < condsPerDegree) {
          list.push(defaultExtras[list.length - 1] || 'Vulnerable');
        }
        return list.slice(0, condsPerDegree);
      };

      eff.config.firstConditions = parseConditions(eff.config.firstConditions, eff.config.firstDegree, 'Dazed', ['Vulnerable', 'Hindered']);
      eff.config.secondConditions = parseConditions(eff.config.secondConditions, eff.config.secondDegree, 'Stunned', ['Defenseless', 'Immobile']);
      eff.config.thirdConditions = parseConditions(eff.config.thirdConditions, eff.config.thirdDegree, 'Paralyzed', ['Incapacitated', 'Controlled']);

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
    } else if (cfg.type === 'concealment_multiselect_library' || cfg.type === 'concealment_picker') {
      if (eff.config.sense && !eff.config.selectedSenses) {
        eff.config.selectedSenses = [eff.config.sense];
      }
      if (!Array.isArray(eff.config.selectedSenses) || eff.config.selectedSenses.length === 0) {
        eff.config.selectedSenses = [...(cfg.defaultSenses || ['visual_normal'])];
      } else {
        // Map legacy IDs to SRD IDs and exclude tactile senses (strictly forbidden in SRD)
        const legacyMap = {
          normal_vision_total: 'visual_normal',
          normal_vision_partial: 'visual_normal',
          infravision: 'visual_infra',
          ultravision: 'visual_ultra',
          all_visual: 'visual_all',
          auditory_total: 'auditory_normal',
          auditory_partial: 'auditory_normal',
          ultrasonic: 'auditory_ultra',
          olfactory_total: 'olfactory_normal',
          olfactory_partial: 'olfactory_normal',
          radio_total: 'radio_all',
          radio_partial: 'radio_normal',
          mental_total: 'mental_all',
          mental_partial: 'mental_normal',
          mystic_awareness: 'exotic_mystic',
          all_senses: 'all_senses'
        };
        const migrated = [];
        eff.config.selectedSenses.forEach(id => {
          if (id === 'tactile_total' || id === 'tactile_partial') return; // Excluded by SRD rules
          const target = legacyMap[id] || id;
          if (!migrated.includes(target)) {
            migrated.push(target);
          }
        });
        eff.config.selectedSenses = migrated.length > 0 ? migrated : [...(cfg.defaultSenses || ['visual_normal'])];
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
    const desiredId = mod.config?.optionId || mod.config?.selectedOption || mod.optionId;
    let chosenOpt = ref.options.find(o => o.id === desiredId);
    if (!chosenOpt) {
      chosenOpt = ref.options[0];
    }
    mod.config.selectedOption = chosenOpt.id;
    mod.config.optionId = chosenOpt.id;
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

  const rawLinked = (Array.isArray(slot.linkedEffects) && slot.linkedEffects.length > 0)
    ? slot.linkedEffects
    : (Array.isArray(slot.effect?.linkedEffects) ? slot.effect.linkedEffects : []);
  slot.linkedEffects = rawLinked.map(normalizeEffect);

  return slot;
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
