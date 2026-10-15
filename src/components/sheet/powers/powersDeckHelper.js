import { useHeroStore } from '../../../stores/heroStore.js';
import { useUiStore } from '../../../stores/uiStore.js';
import { BASE_EFFECTS, EXTRAS, FLAWS, CONFIGURABLE_EFFECTS, calculatePowerTotalCost, hasResistanceCheck } from '../../../rules/powerEngine.js';
import { sendFeatureToVTT } from '../../../services/vttBridge.js';


export function formatModifierList(mods, isFlaw = false) {
  if (!Array.isArray(mods) || mods.length === 0) return '';
  return mods.map(m => {
    const costSign = m.cost > 0 ? `+${m.cost}` : `${m.cost}`;
    const costPart = m.cost !== undefined ? ` (${costSign}${m.type === 'flat' ? ' flat' : '/r'})` : '';
    const rkPart = m.ranks && m.ranks > 1 ? ` x${m.ranks}` : '';
    const textPart = m.customText ? ` [${m.customText}]` : '';
    return `${m.name || 'Modifier'}${textPart}${rkPart}${costPart}`;
  }).join(', ');
}

export function getLinkedDisplayName(linked) {
  if (!linked) return 'Linked Effect';
  const name = linked.name ? linked.name.trim() : '';
  const base = linked.baseEffect || 'Effect';

  if (!name || name === 'Unnamed Effect' || name.toLowerCase() === base.toLowerCase()) {
    return `${base} (Linked)`;
  }

  const linkedMatch = /^(.*)\s*\(Linked\)$/i.exec(name);
  if (linkedMatch) {
    const prefix = linkedMatch[1].trim();
    if (prefix.toLowerCase() !== base.toLowerCase() &&
        (prefix.toLowerCase() === 'affliction' || BASE_EFFECTS.some(b => b.name.toLowerCase() === prefix.toLowerCase()))) {
      return `${base} (Linked)`;
    }
    return name;
  }

  // If name matches another base effect name completely (stale non-linked default)
  if (BASE_EFFECTS.some(b => b.name.toLowerCase() === name.toLowerCase()) && name.toLowerCase() !== base.toLowerCase()) {
    return `${base} (Linked)`;
  }

  return name;
}

export function getEffectCategory(baseName) {
  if (!baseName) return '';
  const ref = BASE_EFFECTS.find(b => b.name.toLowerCase() === baseName.toLowerCase());
  return ref?.category || '';
}

export function formatLinkedEffectsList(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(le => {
    const dcStr = calculateDC(le);
    const name = getLinkedDisplayName(le);
    const cfg = getEffectConfigDetails(le);
    const cfgStr = cfg?.quickText ? ` [${cfg.quickText}]` : '';
    return `${name} (Rank ${le.ranks || 1}${cfgStr}${dcStr ? ', ' + dcStr : ''})`;
  }).join('; ');
}

export function getEffectConfigDetails(eff) {
  if (!eff || !eff.baseEffect) return null;
  const cfg = CONFIGURABLE_EFFECTS[eff.baseEffect];
  const c = eff.config || {};
  const base = eff.baseEffect;

  if (base === 'Senses') {
    const faculties = [...(cfg?.faculties || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedFaculties) && c.selectedFaculties.length > 0
      ? c.selectedFaculties
      : (cfg?.defaultFaculties || ['darkvision']);
    
    const items = selected.map(idOrName => {
      const match = faculties.find(f => f.id === idOrName || f.name?.toLowerCase() === String(idOrName).toLowerCase());
      if (match) {
        return {
          id: match.id,
          name: match.name,
          pts: match.pts,
          desc: match.desc,
          category: match.category,
          icon: match.icon || 'ri-eye-line',
          isCustom: match.isCustom || false
        };
      }
      return {
        id: idOrName,
        name: idOrName,
        pts: 1,
        desc: 'Superhuman sensory faculty enhancement.',
        category: 'Sensory',
        icon: 'ri-eye-line'
      };
    });

    return {
      type: 'senses',
      title: 'Configured Sensory Faculties',
      badge: `${items.length} Faculties • ${eff.ranks || 1} Ranks`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Enhanced Trait') {
    const cat = c.traitCategory || 'abilities';
    const targets = Array.isArray(c.selectedTraits) && c.selectedTraits.length > 0
      ? c.selectedTraits
      : [c.traitName || 'Strength'];
    const ranks = eff.ranks || 1;
    const catLabels = {
      abilities: 'Ability Scores',
      defenses: 'Defense Traits',
      skills: 'Skill Bonuses',
      advantages: 'Combat Advantages'
    };
    const catIcons = {
      abilities: 'ri-boxing-line',
      defenses: 'ri-shield-line',
      skills: 'ri-tools-line',
      advantages: 'ri-award-line'
    };

    return {
      type: 'enhanced_trait',
      title: targets.length > 1 ? 'Enhanced Trait Targets' : 'Enhanced Trait Target',
      badge: `${catLabels[cat] || 'Traits'} (+${ranks})`,
      quickText: targets.map(t => `${t} +${ranks}`).join(', '),
      items: targets.map(t => {
        const custom = (c.customItems || []).find(ci => ci.name === t || ci.id === t);
        return {
          name: t,
          ranks: ranks,
          category: custom?.category || catLabels[cat] || cat,
          desc: custom?.desc || `Superhumanly enhances ${t} by +${ranks} rank${ranks > 1 ? 's' : ''}, applying to all associated checks and rolls.`,
          icon: custom?.icon || catIcons[cat] || 'ri-shield-star-line',
          isCustom: custom?.isCustom || false
        };
      })
    };
  }

  if (base === 'Movement') {
    const modes = [...(cfg?.modes || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['wall_crawling']);

    const items = selected.map(selItem => {
      const modeId = typeof selItem === 'object' && selItem ? selItem.id : selItem;
      const rankNum = typeof selItem === 'object' && selItem ? (selItem.ranks || 1) : 1;
      const match = modes.find(m => m.id === modeId || m.name === modeId);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          ranks: rankNum,
          desc: match.desc,
          icon: match.icon || 'ri-footprint-line',
          isCustom: match.isCustom || false
        };
      }
      return {
        id: modeId,
        name: modeId,
        ranks: rankNum,
        desc: 'Superhuman movement mode capability.',
        icon: 'ri-footprint-line'
      };
    });

    return {
      type: 'movement',
      title: 'Configured Movement Modes',
      badge: `${items.length} Modes Active`,
      quickText: items.map(i => `${i.name}${i.ranks > 1 ? ` ${i.ranks}` : ''}`).join(', '),
      items
    };
  }

  if (base === 'Immunity') {
    const presets = [...(cfg?.presets || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedPresets) && c.selectedPresets.length > 0
      ? c.selectedPresets
      : (cfg?.defaultPresets || ['life_support']);

    const items = selected.map(id => {
      const match = presets.find(p => p.id === id || p.name === id);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          ranks: match.ranks,
          category: match.category,
          desc: match.desc,
          icon: match.icon || 'ri-shield-check-line',
          isCustom: match.isCustom || false
        };
      }
      return {
        id,
        name: id,
        ranks: 1,
        desc: 'Immunity to specified environmental hazard or attack effect.',
        icon: 'ri-shield-check-line'
      };
    });

    return {
      type: 'immunity',
      title: 'Configured Immunities',
      badge: `${items.length} Immunities • ${eff.ranks || 1} Ranks`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Concealment') {
    const options = [...(cfg?.options || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedSenses) && c.selectedSenses.length > 0
      ? c.selectedSenses
      : (cfg?.defaultSenses || ['visual_normal']);

    const items = selected.map(id => {
      const match = options.find(o => o.id === id || o.name === id);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          ranks: match.ranks,
          category: match.category,
          scopeLabel: match.scopeLabel,
          desc: match.desc,
          icon: match.icon || 'ri-eye-close-line',
          isCustom: match.isCustom || false
        };
      }
      return {
        id,
        name: id,
        ranks: 2,
        desc: 'Concealment from specified sensory faculty.',
        icon: 'ri-eye-close-line'
      };
    });

    return {
      type: 'concealment',
      title: 'Configured Concealment',
      badge: `${items.length} Senses • ${eff.ranks || 1} Ranks (${(eff.ranks || 1) * 2} PP)`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Comprehend') {
    const modes = [...(cfg?.modes || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedModes) && c.selectedModes.length > 0
      ? c.selectedModes
      : (cfg?.defaultModes || ['languages_understand']);

    const items = selected.map(id => {
      const match = modes.find(m => m.id === id || m.name === id);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          ranks: match.ranks || 1,
          desc: match.desc,
          icon: match.icon || 'ri-translate-2',
          isCustom: match.isCustom || false
        };
      }
      return {
        id,
        name: id,
        ranks: 1,
        desc: 'Superhuman language/communication faculty.',
        icon: 'ri-translate-2'
      };
    });

    return {
      type: 'comprehend',
      title: 'Configured Comprehend Modes',
      badge: `${items.length} Modes • ${eff.ranks || 1} Ranks`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Environment') {
    const elements = [...(cfg?.elements || []), ...(c.customItems || [])];
    const selected = Array.isArray(c.selectedElements) && c.selectedElements.length > 0
      ? c.selectedElements
      : (cfg?.defaultElements || ['cold_1']);

    const items = selected.map(id => {
      const match = elements.find(e => e.id === id || e.name === id);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          cost: match.cost || 1,
          desc: match.desc,
          icon: match.icon || 'ri-earth-line',
          isCustom: match.isCustom || false
        };
      }
      return {
        id,
        name: id,
        cost: 1,
        desc: 'Environmental alteration hazard.',
        icon: 'ri-earth-line'
      };
    });

    return {
      type: 'environment',
      title: 'Configured Environmental Hazards',
      badge: `${items.length} Elements (${eff.baseCost || 1} PP/R)`,
      quickText: items.map(i => i.name).join(', '),
      items
    };
  }

  if (base === 'Affliction') {
    const limDegree = (eff.flaws || []).find(f => f.name === 'Limited Degree');
    const limRanks = limDegree ? (Number(limDegree.ranks) || 1) : 0;

    const first = Array.isArray(c.firstConditions) && c.firstConditions.length > 0
      ? c.firstConditions.join(' & ')
      : (c.firstDegree || 'Dazed');
    const second = Array.isArray(c.secondConditions) && c.secondConditions.length > 0
      ? c.secondConditions.join(' & ')
      : (c.secondDegree || 'Stunned');
    const third = Array.isArray(c.thirdConditions) && c.thirdConditions.length > 0
      ? c.thirdConditions.join(' & ')
      : (c.thirdDegree || 'Paralyzed');
    const res = c.resistance || eff.resistance || 'Fortitude';

    const isProg = (eff.extras || []).some(e => e.name === 'Progressive');
    const isCum = (eff.extras || []).some(e => e.name === 'Cumulative');
    let modeBadge = '';
    if (isProg) modeBadge = ' • Progressive';
    else if (isCum) modeBadge = ' • Cumulative';

    const items = [
      { name: '1st Degree', desc: `Target suffers: ${first}`, icon: 'ri-error-warning-line' }
    ];
    if (limRanks < 2) {
      items.push({ name: '2nd Degree', desc: `Target suffers: ${second}`, icon: 'ri-alert-line' });
    }
    if (limRanks < 1) {
      items.push({ name: '3rd Degree', desc: `Target suffers: ${third}`, icon: 'ri-skull-line' });
    }

    const quickParts = items.map(i => i.desc.replace('Target suffers: ', ''));

    return {
      type: 'affliction',
      title: 'Conditions & Degrees of Failure',
      badge: `Resisted by ${res}${modeBadge}`,
      quickText: quickParts.join(' / '),
      items
    };
  }

  if (base === 'Illusion') {
    const senses = Array.isArray(c.senses) && c.senses.length > 0 ? c.senses : ['Visual'];
    return {
      type: 'illusion',
      title: 'Sensory Impressions Affected',
      badge: `${senses.length} Senses (${eff.baseCost || senses.length} PP/R)`,
      quickText: senses.join(', '),
      items: senses.map(s => ({
        name: s,
        desc: `Projects holographic sensations affecting ${s} perception.`,
        icon: String(s).toLowerCase().includes('aud') ? 'ri-volume-up-line' : 'ri-eye-line'
      }))
    };
  }

  if (base === 'Weaken') {
    const trait = c.traitName || 'Stamina';
    const res = c.resistance || eff.resistance || 'Fortitude';
    return {
      type: 'weaken',
      title: 'Targeted Trait to Drain',
      badge: `Resisted by ${res}`,
      quickText: `Drains ${trait}`,
      items: [{
        name: `Target: ${trait}`,
        desc: `Target makes a ${res} resistance check vs DC 10 + Weaken rank. Each point check fails DC drains 1 point of ${trait} (up to rank max).`,
        icon: 'ri-arrow-down-circle-line'
      }]
    };
  }

  if (base === 'Nullify') {
    const desc = c.descriptor === 'Custom' ? (c.customDescriptor || 'Custom') : (c.descriptor || 'Magic');
    return {
      type: 'nullify',
      title: 'Targeted Descriptor to Counter',
      badge: desc,
      quickText: `Counters: ${desc}`,
      items: [{
        name: desc,
        desc: `Counters and dispels powers with the "${desc}" descriptor.`,
        icon: 'ri-forbid-2-line'
      }]
    };
  }

  if (base === 'Morph') {
    const scopeNames = {
      1: 'Single Appearance (Exact Twin / Alter Ego)',
      2: 'Narrow Group (Single species, gender, or shape)',
      3: 'Broad Group (Any humanoid, animal, or machine)',
      4: 'Any Form (Any person, creature, or object of same mass)'
    };
    const scope = Number(c.scope) || 1;
    return {
      type: 'morph',
      title: 'Morph Scope of Forms',
      badge: `Scope Rank ${scope}`,
      quickText: scopeNames[scope] || `Rank ${scope}`,
      items: [{
        name: scopeNames[scope] || `Scope Rank ${scope}`,
        desc: `Grants +20 bonus to Deception checks to disguise as forms within this scope.`,
        icon: 'ri-user-shared-line'
      }]
    };
  }

  if (base === 'Variable') {
    const theme = c.theme || 'Magic / Sorcery';
    return {
      type: 'variable',
      title: 'Variable Power Theme',
      badge: `Theme: ${theme}`,
      quickText: theme,
      items: [{
        name: theme,
        desc: `Can allocate up to ${Number(eff.ranks || 1) * 5} PP to effects fitting the "${theme}" descriptor.`,
        icon: 'ri-shape-line'
      }]
    };
  }

  return null;
}

export function broadcastPower(pow) {
  const heroStore = useHeroStore();
  const uiStore = useUiStore();
  const cost = getPowerCost(pow);
  const eff = getActiveEffect(pow);
  const dc = calculateDC(eff);
  const range = formatRange(eff);
  const rules = getEffectDesc(eff?.baseEffect);
  const flavor = pow.description || pow.summary || pow.notes || '';
  const status = pow.active !== false ? 'ACTIVE' : 'OFFLINE';

  // Configured choices (Senses, Enhanced Trait, Movement, Immunity, etc.)
  const cfgDetails = getEffectConfigDetails(eff);
  const configuredChoices = cfgDetails?.quickText || '';
  const configuredTitle = cfgDetails?.title || 'Selections';

  // Descriptors
  const descriptors = Array.isArray(pow.descriptors) && pow.descriptors.length > 0
    ? pow.descriptors.join(', ')
    : '';

  // Extras & Flaws
  const extras = formatModifierList(eff?.extras, false);
  const flaws = formatModifierList(eff?.flaws, true);

  // Linked Effects
  const linkedList = getActiveLinkedEffects(pow);
  const linkedEffects = formatLinkedEffectsList(linkedList);

  // Array context
  let activeStuntName = '';
  let alternateStunts = '';
  const isArray = pow.type === 'array' || (Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0);
  if (isArray) {
    if (pow.activeSlotId && pow.activeSlotId !== 'main') {
      const activeAlt = (pow.alternateEffects || []).find(a => a.id === pow.activeSlotId);
      activeStuntName = activeAlt?.name || 'Alternate Effect';
    } else {
      activeStuntName = pow.mainEffect?.name || pow.name || 'Primary Effect';
    }

    const stuntsList = [];
    if (pow.activeSlotId !== 'main') {
      stuntsList.push(`[Primary] ${pow.mainEffect?.name || 'Primary Mode'}`);
    }
    (pow.alternateEffects || []).forEach(a => {
      if (a.id !== pow.activeSlotId) {
        stuntsList.push(a.name || 'Alternate Mode');
      }
    });
    alternateStunts = stuntsList.join(', ');
  }

  // Device context (works for Device container OR Removable flaw on any power)
  let deviceType = '';
  let deviceSystems = '';
  if (pow.type === 'device' || pow.deviceConfig?.type) {
    const devTypeVal = pow.deviceConfig?.type || (pow.type === 'device' ? 'removable' : '');
    if (devTypeVal === 'easily_removable') {
      deviceType = 'Easily Removable (-2/5 PP)';
    } else if (devTypeVal === 'removable') {
      deviceType = 'Removable (-1/5 PP)';
    }
  }
  if (pow.type === 'device' && Array.isArray(pow.devicePowers) && pow.devicePowers.length > 0) {
    deviceSystems = pow.devicePowers.map((s, idx) => {
      const sEff = getSubPowerActiveEffect(s);
      const sStatus = (pow.active !== false && s.active !== false) ? 'ONLINE' : 'OFFLINE';
      return `[${sStatus}] ${s.name || `System ${idx + 1}`} (${sEff.baseEffect || 'Effect'} Rank ${sEff.ranks || 1})`;
    }).join('; ');
  }

  // Compound context
  let compoundComponents = '';
  let sharedModifiers = '';
  if (pow.type === 'compound' && Array.isArray(pow.compoundEffects) && pow.compoundEffects.length > 0) {
    compoundComponents = pow.compoundEffects.map((s, idx) => {
      const sEff = getSubPowerActiveEffect(s);
      const priTag = (s.isPrimaryAction || s.isPrimary) ? '[Primary] ' : '';
      const dc = calculateDC(sEff);
      const dcStr = dc ? ` [${dc}]` : '';
      return `${priTag}${s.name || `Component ${idx + 1}`} (${sEff?.baseEffect || 'Effect'} Rank ${sEff?.ranks || 1}${dcStr})`;
    }).join('; ');
    if (Array.isArray(pow.sharedModifiers) && pow.sharedModifiers.length > 0) {
      sharedModifiers = formatModifiersInline(pow.sharedModifiers);
    }
  }

  const effSummary = eff ? `${eff.baseEffect || 'Effect'} Rank ${eff.ranks || 1} (Action: ${eff.action || 'Standard'}, Range: ${range}, ${dc})` : '';
  const activation = (pow.activation && pow.activation !== 'none')
    ? (pow.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)')
    : '';

  sendFeatureToVTT({
    name: pow.name || 'Power',
    category: 'power',
    powerType: pow.type || 'standard',
    status,
    activation,
    deviceType,
    deviceSystems,
    compoundMode: pow.compoundMode || 'Suite (Simultaneous)',
    compoundComponents,
    sharedModifiers,
    arrayContext: isArray,
    activeStuntName,
    alternateStunts,
    baseEffect: eff?.baseEffect || '',
    effectRank: eff?.ranks || 1,
    configuredChoices,
    configuredTitle,
    dc,
    descriptors,
    action: eff?.action || 'Standard',
    range,
    duration: eff?.duration || 'Instant',
    cost: `${cost} PP`,
    extras,
    flaws,
    linkedEffects,
    flavor,
    rules,
    description: flavor || rules,
    details: effSummary
  }, heroStore.character);

  uiStore.showToast(`Broadcasted "${pow.name || 'Power'}" dossier to Roll20!`, 'info');
}

export function broadcastSubPower(parentPow, subPow, subIdx) {
  const heroStore = useHeroStore();
  const uiStore = useUiStore();
  const isCompound = parentPow.type === 'compound';
  const eff = getSubPowerActiveEffect(subPow);
  const dc = calculateDC(eff);
  const range = formatRange(eff);
  const rules = getEffectDesc(eff?.baseEffect);
  const flavor = subPow.description || subPow.summary || subPow.notes || '';
  const status = (parentPow.active !== false && subPow.active !== false) ? 'ACTIVE' : 'OFFLINE';

  const cfgDetails = getEffectConfigDetails(eff);
  const configuredChoices = cfgDetails?.quickText || '';
  const configuredTitle = cfgDetails?.title || 'Selections';

  const extras = formatModifierList(eff?.extras, false);
  const flaws = formatModifierList(eff?.flaws, true);

  const activation = (parentPow.activation && parentPow.activation !== 'none')
    ? (parentPow.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)')
    : '';

  const isPrimary = Boolean(subPow.isPrimaryAction || subPow.isPrimary);

  sendFeatureToVTT({
    name: subPow.name || (isCompound ? `Component ${subIdx + 1}` : `System ${subIdx + 1}`),
    componentName: subPow.name || (isCompound ? `Component ${subIdx + 1}` : `System ${subIdx + 1}`),
    systemName: subPow.name || `System ${subIdx + 1}`,
    parentDevice: !isCompound ? (parentPow.name || 'Device') : '',
    parentCompound: isCompound ? (parentPow.name || 'Compound Power') : '',
    category: isCompound ? 'compound_component' : 'device_subpower',
    isPrimary,
    status,
    activation,
    baseEffect: eff?.baseEffect || '',
    effectRank: eff?.ranks || 1,
    configuredChoices,
    configuredTitle,
    dc,
    action: eff?.action || 'Standard',
    range,
    duration: eff?.duration || 'Instant',
    extras,
    flaws,
    flavor,
    rules,
    description: flavor || rules
  }, heroStore.character);

  const label = isCompound ? 'component' : 'sub-system';
  uiStore.showToast(`Broadcasted ${label} "${subPow.name || (isCompound ? 'Component' : 'System')}" to Roll20!`, 'info');
}

export function broadcastEffect(pow, effect, isLinked = false) {
  const heroStore = useHeroStore();
  const uiStore = useUiStore();
  if (!effect || !effect.baseEffect) return;
  const dc = calculateDC(effect);
  const range = formatRange(effect);
  const rules = getEffectDesc(effect.baseEffect);
  const parentName = pow ? (pow.name || 'Power') : '';

  const cfgDetails = getEffectConfigDetails(effect);
  const configuredChoices = cfgDetails?.quickText || '';
  const configuredTitle = cfgDetails?.title || 'Selections';
  const activeTitle = getActiveSlotTitle(pow);
  const displayName = isLinked
    ? getLinkedDisplayName(effect)
    : (activeTitle ? `${activeTitle} (${effect.baseEffect || 'Effect'})` : (effect.baseEffect || 'Effect'));

  sendFeatureToVTT({
    name: displayName,
    category: 'power_effect',
    parentPower: isLinked ? `${parentName} (Linked)` : parentName,
    ranks: effect.ranks || 1,
    configuredChoices,
    configuredTitle,
    action: effect.action || 'Standard',
    range,
    duration: effect.duration || 'Instant',
    resistance: effect.resistance || '',
    dc,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted ${isLinked ? 'linked ' : ''}effect "${displayName}" to Roll20!`, 'info');
}

export function broadcastExtra(pow, extra, parentEffectName = null) {
  const heroStore = useHeroStore();
  const uiStore = useUiStore();
  if (!extra || !extra.name) return;
  const modInfo = getModifierInfo(extra.name, false);
  const category = modInfo.category || 'Combat & Utility Extra';
  const rawRules = extra.desc || modInfo.desc || '';
  const rules = extra.customText ? `Specification: ${extra.customText}\n\n${rawRules}` : rawRules;
  const costSign = extra.cost >= 0 ? `+${extra.cost}` : `${extra.cost}`;
  const costModifier = `${costSign} ${extra.type === 'per_rank' ? 'PP/r' : 'Flat'}`;
  const parentPowerName = pow ? (pow.name || 'Power') : '';
  const effName = parentEffectName || (pow ? getActiveEffect(pow)?.baseEffect : '');
  const displayName = extra.customText ? `${extra.name}: ${extra.customText}` : extra.name;

  sendFeatureToVTT({
    name: displayName,
    category: 'power_extra',
    parentPower: parentPowerName,
    effectName: effName,
    category,
    ranks: extra.ranks || 1,
    cost: costModifier,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted Extra "${displayName}" to Roll20!`, 'info');
}

export function broadcastFlaw(pow, flaw, parentEffectName = null) {
  const heroStore = useHeroStore();
  const uiStore = useUiStore();
  if (!flaw || !flaw.name) return;
  const modInfo = getModifierInfo(flaw.name, true);
  const category = modInfo.category || 'Limitation Flaw';
  const rawRules = flaw.desc || modInfo.desc || '';
  const rules = flaw.customText ? `Drawback: ${flaw.customText}\n\n${rawRules}` : rawRules;
  const costModifier = `${flaw.cost} ${flaw.type === 'per_rank' ? 'PP/r' : 'Flat'}`;
  const parentPowerName = pow ? (pow.name || 'Power') : '';
  const effName = parentEffectName || (pow ? getActiveEffect(pow)?.baseEffect : '');
  const displayName = flaw.customText ? `${flaw.name}: ${flaw.customText}` : flaw.name;

  sendFeatureToVTT({
    name: displayName,
    category: 'power_flaw',
    parentPower: parentPowerName,
    effectName: effName,
    category,
    ranks: flaw.ranks || 1,
    cost: costModifier,
    rules,
    description: rules
  }, heroStore.character);

  uiStore.showToast(`Broadcasted Flaw "${displayName}" to Roll20!`, 'info');
}

// Set tracking expanded cards

export function hasPowerSubMeta(pow) {
  if (!pow) return false;
  if (pow.activation && pow.activation !== 'none') return true;
  if (pow.type === 'device') return true;
  return false;
}

export function formatModifiersInline(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(m => {
    let s = m.name;
    if (m.customText) s += ` (${m.customText})`;
    if ((m.ranks || 1) > 1) s += ` x${m.ranks}`;
    return s;
  }).join(', ');
}

export function formatLinkedInline(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list.map(l => {
    let s = `${getLinkedDisplayName(l)} ${l.ranks || 1}R`;
    const dc = calculateDC(l);
    if (dc) s += ` (${dc})`;
    return s;
  }).join(' • ');
}

// Device Container Sub-Power Tabs State

export function getEffectIcon(baseEffect) {
  const base = (baseEffect || '').toLowerCase();
  if (['damage', 'blast', 'strike'].includes(base)) return 'ri-sword-line';
  if (['protection', 'force field', 'deflect'].includes(base)) return 'ri-shield-fill';
  if (['immunity'].includes(base)) return 'ri-shield-cross-fill';
  if (['senses'].includes(base)) return 'ri-eye-fill';
  if (['flight', 'speed', 'leaping', 'teleport', 'movement', 'swimming', 'burrowing'].includes(base)) return 'ri-flight-takeoff-fill';
  if (['enhanced trait'].includes(base)) return 'ri-user-star-fill';
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) return 'ri-skull-fill';
  if (['healing', 'regeneration', 'immortality'].includes(base)) return 'ri-heart-pulse-fill';
  if (['create', 'illusion', 'transform', 'morph', 'variable'].includes(base)) return 'ri-magic-fill';
  if (['communication', 'comprehend', 'remote sensing'].includes(base)) return 'ri-broadcast-fill';
  return 'ri-flashlight-fill';
}

export function getActiveEffect(pow) {
  if (!pow) return {};
  const hasAlts = Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0;
  if ((pow.type === 'array' || hasAlts) && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = pow.alternateEffects.find(a => a.id === pow.activeSlotId);
    if (alt && alt.effect) return alt.effect;
  }
  return pow.mainEffect || {};
}

export function getActiveLinkedEffects(pow) {
  if (!pow) return [];
  const hasAlts = Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0;
  if ((pow.type === 'array' || hasAlts) && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = pow.alternateEffects.find(a => a.id === pow.activeSlotId);
    if (alt) {
      if (Array.isArray(alt.linkedEffects)) return alt.linkedEffects;
      if (alt.effect && Array.isArray(alt.effect.linkedEffects)) return alt.effect.linkedEffects;
    }
  }
  return pow.linkedEffects || [];
}

export function getActiveSlotTitle(pow) {
  if (!pow) return '';
  const hasAlts = Array.isArray(pow.alternateEffects) && pow.alternateEffects.length > 0;
  if ((pow.type === 'array' || hasAlts) && pow.activeSlotId && pow.activeSlotId !== 'main') {
    const alt = pow.alternateEffects.find(a => a.id === pow.activeSlotId);
    return alt?.name || '';
  }
  return '';
}

export function getSubPowerActiveEffect(sub) {
  if (sub.alternateEffects?.length > 0 && sub.activeSlotId && sub.activeSlotId !== 'main') {
    const alt = sub.alternateEffects.find(a => a.id === sub.activeSlotId);
    if (alt && alt.effect) return alt.effect;
  }
  return sub.effect || {};
}

export function getSubPowerActiveLinkedEffects(sub) {
  if (!sub) return [];
  if (sub.alternateEffects?.length > 0 && sub.activeSlotId && sub.activeSlotId !== 'main') {
    const alt = sub.alternateEffects.find(a => a.id === sub.activeSlotId);
    if (alt && Array.isArray(alt.linkedEffects)) return alt.linkedEffects;
    if (alt && alt.effect && Array.isArray(alt.effect.linkedEffects)) return alt.effect.linkedEffects;
  }
  if (Array.isArray(sub.linkedEffects)) return sub.linkedEffects;
  if (sub.effect && Array.isArray(sub.effect.linkedEffects)) return sub.effect.linkedEffects;
  return [];
}

export function calculateDC(eff) {
  if (!eff || !eff.baseEffect) return '';
  const ranks = Number(eff.ranks) || 0;
  const base = (eff.baseEffect || '').toLowerCase();
  if (base === 'damage' || base === 'blast') {
    return `DC ${15 + ranks} vs ${eff.resistance || 'Toughness'}`;
  }
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Fortitude'}`;
  }
  if (base === 'mind reading') {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Will'}`;
  }
  const extras = Array.isArray(eff.extras) ? eff.extras : [];
  const hasAttackExtra = extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');
  if (hasAttackExtra) {
    return `DC ${10 + ranks} vs ${eff.resistance || 'Dodge'}`;
  }
  const nonResistanceEffects = [
    'senses', 'enhanced trait', 'movement', 'immunity', 'flight', 'speed', 'quickness',
    'leaping', 'swimming', 'growth', 'shrinking', 'morph', 'variable', 'comprehend',
    'feature', 'protection', 'regeneration', 'immortality', 'elongation', 'invisibility',
    'insubstantial', 'burrowing', 'teleport', 'deflect', 'healing', 'remote sensing',
    'create', 'illusion', 'transform', 'communication', 'luck control', 'extra limbs', 'environment', 'summon'
  ];
  if (nonResistanceEffects.includes(base) || eff.action === 'None' || (!eff.resistance || eff.resistance === 'None' || eff.resistance === 'none')) {
    return '';
  }
  return eff.resistance && eff.resistance !== 'Toughness' ? `vs ${eff.resistance}` : '';
}

export function calculateCompactDC(eff) {
  if (!eff || !eff.baseEffect) return '';
  const ranks = Number(eff.ranks) || 0;
  const base = (eff.baseEffect || '').toLowerCase();
  const res = eff.resistance ? eff.resistance.slice(0, 4) : '';
  if (base === 'damage' || base === 'blast') {
    return `DC ${15 + ranks} ${res || 'Tou'}`;
  }
  if (['affliction', 'weaken', 'nullify', 'mind control'].includes(base)) {
    return `DC ${10 + ranks} ${res || 'Fort'}`;
  }
  if (base === 'mind reading') {
    return `DC ${10 + ranks} ${res || 'Will'}`;
  }
  const extras = Array.isArray(eff.extras) ? eff.extras : [];
  const hasAttackExtra = extras.some(x => (x.name || '').trim().toLowerCase() === 'attack');
  if (hasAttackExtra) {
    return `DC ${10 + ranks} ${res || 'Dod'}`;
  }
  return '';
}

export function formatRange(eff) {
  if (!eff) return 'Close';
  const range = eff.range || 'Close';
  const ranks = Number(eff.ranks) || 0;
  if (range === 'Ranged') {
    return `Ranged (${ranks * 25}/${ranks * 50}/${ranks * 100} ft)`;
  }
  return range;
}

export function getEffectDesc(baseName) {
  const match = BASE_EFFECTS.find(b => b.name?.toLowerCase() === (baseName || '').toLowerCase());
  return match?.desc || 'Core superhuman power effect rules.';
}

export function getModifierInfo(modName, isFlaw = false) {
  const catalog = isFlaw ? FLAWS : EXTRAS;
  const match = catalog.find(m => m.name?.toLowerCase() === (modName || '').toLowerCase());
  return {
    category: match?.category || (isFlaw ? 'Limitation' : 'Combat & Utility'),
    desc: match?.desc || 'Applies modifier rules to this power effect.'
  };
}

export function getPowerCost(power) {
  return calculatePowerTotalCost(power);
}
