import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { isMotivation } from '../../rules/complications.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';
import { calculateDC, resolveSpecialConfig, formatRange, formatPowerStatblock } from '../../rules/powerFormatter.js';
import { resolveEffectRulesBlock, formatDistanceRank } from '../../rules/powerRuleDescriptions.js';

/**
 * Format number as a D20 modifier (+5, -2, +0).
 */
export function formatMod(val) {
  if (val === null || val === undefined) return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  return num >= 0 ? `+${num}` : `${num}`;
}

/**
 * Resolves standard ability key for a skill name.
 */
export function getSkillAbility(skillName) {
  const clean = (skillName || '').toLowerCase().trim();
  if (clean.includes('acrobatics') || clean.includes('stealth')) return 'AGL';
  if (clean.includes('athletics')) return 'STR';
  if (clean.includes('close combat') || clean.includes('fighting')) return 'FGT';
  if (clean.includes('ranged combat') || clean.includes('sleight of hand') || clean.includes('vehicles')) return 'DEX';
  if (clean.includes('deception') || clean.includes('intimidation') || clean.includes('persuasion')) return 'PRE';
  if (clean.includes('insight') || clean.includes('perception')) return 'AWE';
  if (clean.includes('expertise') || clean.includes('investigation') || clean.includes('technology') || clean.includes('treatment')) return 'INT';
  return 'INT';
}

export const CORE_SKILLS = [
  { name: 'Acrobatics', ability: 'AGL', requiresSubtype: false },
  { name: 'Athletics', ability: 'STR', requiresSubtype: false },
  { name: 'Close Combat', ability: 'FGT', requiresSubtype: true },
  { name: 'Deception', ability: 'PRE', requiresSubtype: false },
  { name: 'Expertise', ability: 'INT', requiresSubtype: true },
  { name: 'Insight', ability: 'AWE', requiresSubtype: false },
  { name: 'Intimidation', ability: 'PRE', requiresSubtype: false },
  { name: 'Investigation', ability: 'INT', requiresSubtype: false },
  { name: 'Perception', ability: 'AWE', requiresSubtype: false },
  { name: 'Persuasion', ability: 'PRE', requiresSubtype: false },
  { name: 'Ranged Combat', ability: 'DEX', requiresSubtype: true },
  { name: 'Sleight of Hand', ability: 'DEX', requiresSubtype: false },
  { name: 'Stealth', ability: 'AGL', requiresSubtype: false },
  { name: 'Technology', ability: 'INT', requiresSubtype: false },
  { name: 'Treatment', ability: 'INT', requiresSubtype: false },
  { name: 'Vehicles', ability: 'DEX', requiresSubtype: false }
];

/**
 * Returns a complete list of all character skills (all 16 standard skills plus any customized/trained specialties).
 */
export function getAllCharacterSkills(character, heroStore) {
  const effAbilities = heroStore?.effectiveAbilities ?? (character.abilities || {});
  const activeEnhancedSkills = heroStore?.activeEnhancedTraits?.skills || {};
  const charSkills = Array.isArray(character.skills) ? character.skills : [];
  const absentList = character.absentAbilities || [];

  const result = [];
  const processedIndexes = new Set();

  CORE_SKILLS.forEach(core => {
    const abl = core.ability;
    const isAbsent = absentList.includes(abl) || effAbilities[abl] === null;

    if (core.requiresSubtype) {
      const matches = [];
      charSkills.forEach((cs, idx) => {
        const cName = (cs.name || '').trim().toLowerCase();
        if (cName === core.name.toLowerCase() || cName.startsWith(core.name.toLowerCase() + ':') || cName.startsWith(core.name.toLowerCase() + ' (')) {
          matches.push({ cs, idx });
        }
      });

      if (matches.length > 0) {
        matches.forEach(({ cs, idx }) => {
          processedIndexes.add(idx);
          const sub = (cs.subtype || '').trim();
          let displayName = cs.name;
          if (sub && !cs.name.includes(':') && !cs.name.includes('(')) {
            displayName = `${cs.name}: ${sub}`;
          }
          const ranks = Number(cs.ranks ?? cs.rank ?? 0) || 0;
          const abilityMod = isAbsent ? null : (effAbilities[abl] || 0);
          const enhBonus = Number(activeEnhancedSkills[displayName.toLowerCase()] || activeEnhancedSkills[cs.name.toLowerCase()] || 0);
          const totalBonus = isAbsent ? null : (abilityMod + ranks + enhBonus);

          result.push({
            name: cs.name,
            subtype: sub,
            displayName,
            abilityCode: abl,
            abilityMod,
            ranks,
            enhBonus,
            totalBonus,
            isAbsent,
            isTrained: ranks > 0
          });
        });
      } else {
        const abilityMod = isAbsent ? null : (effAbilities[abl] || 0);
        const enhBonus = Number(activeEnhancedSkills[core.name.toLowerCase()] || 0);
        const totalBonus = isAbsent ? null : (abilityMod + enhBonus);
        result.push({
          name: core.name,
          subtype: '',
          displayName: core.name,
          abilityCode: abl,
          abilityMod,
          ranks: 0,
          enhBonus,
          totalBonus,
          isAbsent,
          isTrained: false
        });
      }
    } else {
      const foundIdx = charSkills.findIndex(cs => (cs.name || '').trim().toLowerCase() === core.name.toLowerCase());
      const abilityMod = isAbsent ? null : (effAbilities[abl] || 0);

      if (foundIdx !== -1) {
        processedIndexes.add(foundIdx);
        const cs = charSkills[foundIdx];
        const sub = (cs.subtype || '').trim();
        const displayName = sub ? `${cs.name}: ${sub}` : cs.name;
        const ranks = Number(cs.ranks ?? cs.rank ?? 0) || 0;
        const enhBonus = Number(activeEnhancedSkills[displayName.toLowerCase()] || activeEnhancedSkills[cs.name.toLowerCase()] || 0);
        const totalBonus = isAbsent ? null : (abilityMod + ranks + enhBonus);

        result.push({
          name: cs.name,
          subtype: sub,
          displayName,
          abilityCode: abl,
          abilityMod,
          ranks,
          enhBonus,
          totalBonus,
          isAbsent,
          isTrained: ranks > 0
        });
      } else {
        const enhBonus = Number(activeEnhancedSkills[core.name.toLowerCase()] || 0);
        const totalBonus = isAbsent ? null : (abilityMod + enhBonus);
        result.push({
          name: core.name,
          subtype: '',
          displayName: core.name,
          abilityCode: abl,
          abilityMod,
          ranks: 0,
          enhBonus,
          totalBonus,
          isAbsent,
          isTrained: false
        });
      }
    }
  });

  // Any additional custom character skills
  charSkills.forEach((cs, idx) => {
    if (!processedIndexes.has(idx)) {
      const sub = (cs.subtype || '').trim();
      const displayName = sub ? `${cs.name}: ${sub}` : cs.name;
      const abl = getSkillAbility(cs.name);
      const isAbsent = absentList.includes(abl) || effAbilities[abl] === null;
      const abilityMod = isAbsent ? null : (effAbilities[abl] || 0);
      const ranks = Number(cs.ranks ?? cs.rank ?? 0) || 0;
      const enhBonus = Number(activeEnhancedSkills[displayName.toLowerCase()] || activeEnhancedSkills[cs.name.toLowerCase()] || 0);
      const totalBonus = isAbsent ? null : (abilityMod + ranks + enhBonus);

      result.push({
        name: cs.name,
        subtype: sub,
        displayName,
        abilityCode: abl,
        abilityMod,
        ranks,
        enhBonus,
        totalBonus,
        isAbsent,
        isTrained: ranks > 0
      });
    }
  });

  result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return result;
}

/**
 * Compiles movement modes from powers and standard movement.
 */
export function getMovementModes(character) {
  const modes = [
    { name: 'Normal Ground', rank: 0, speed: '30 ft/round (2 mph)' }
  ];

  const speedRankTable = {
    0: '30 ft/rnd (2 mph)',
    1: '60 ft/rnd (4 mph)',
    2: '120 ft/rnd (8 mph)',
    3: '250 ft/rnd (16 mph)',
    4: '500 ft/rnd (30 mph)',
    5: '900 ft/rnd (60 mph)',
    6: '1,800 ft/rnd (120 mph)',
    7: '0.5 mile/rnd (250 mph)',
    8: '1 mile/rnd (500 mph)',
    9: '2 miles/rnd (1,000 mph / Mach 1.3)',
    10: '4 miles/rnd (2,000 mph / Mach 2.6)',
    11: '8 miles/rnd (4,000 mph / Mach 5.2)',
    12: '16 miles/rnd (8,000 mph / Mach 10)',
    13: '32 miles/rnd (16,000 mph / Escape Velocity)',
    14: '64 miles/rnd (32,000 mph)',
    15: '120 miles/rnd (64,000 mph)',
    16: '250 miles/rnd (125,000 mph)',
    17: '500 miles/rnd (250,000 mph)',
    18: '1,000 miles/rnd (500,000 mph)',
    19: '2,000 miles/rnd (1,000,000 mph)',
    20: 'Speed of Light (186,000 miles/sec)'
  };

  function formatSpeed(rank) {
    if (speedRankTable[rank]) return `Rank ${rank} • ${speedRankTable[rank]}`;
    return `Rank ${rank} • ${Math.round(Math.pow(2, rank) * 2)} mph`;
  }

  const powers = character.powers || [];
  for (const p of powers) {
    const effList = [];
    if (p.type === 'device' && Array.isArray(p.devicePowers)) {
      p.devicePowers.forEach(sp => { if (sp.effect) effList.push({ ...sp.effect, parentName: sp.name || p.name }); });
    } else if (p.type === 'compound' && Array.isArray(p.compoundEffects)) {
      p.compoundEffects.forEach(cp => { if (cp.effect) effList.push({ ...cp.effect, parentName: cp.name || p.name }); });
    } else {
      if (p.mainEffect) effList.push({ ...p.mainEffect, parentName: p.name });
      else effList.push({ ...p, parentName: p.name });
    }

    for (const eff of effList) {
      const base = (eff.baseEffect || eff.effectType || eff.name || '').toLowerCase();
      const r = parseInt(eff.ranks, 10) || 1;
      const title = eff.parentName || p.name || 'Power';

      if (base.includes('flight')) {
        modes.push({ name: `Flight (${title})`, rank: r, speed: formatSpeed(r) });
      } else if (base.includes('speed') && !base.includes('flight')) {
        modes.push({ name: `Enhanced Ground Speed (${title})`, rank: r, speed: formatSpeed(r) });
      } else if (base.includes('teleport')) {
        const distStr = formatDistanceRank(r);
        modes.push({ name: `Teleport (${title})`, rank: r, speed: `Rank ${r} • ${distStr}/move (up to 50 lbs default)` });
      } else if (base.includes('swimming')) {
        modes.push({ name: `Swimming (${title})`, rank: r, speed: formatSpeed(Math.max(0, r - 2)) });
      } else if (base.includes('burrowing')) {
        modes.push({ name: `Burrowing (${title})`, rank: r, speed: formatSpeed(Math.max(0, r - 5)) });
      } else if (base.includes('leaping')) {
        const standDist = formatDistanceRank(r - 2);
        const runDist = formatDistanceRank(r - 1);
        modes.push({ name: `Leaping (${title})`, rank: r, speed: `Rank ${r} • ${standDist} standing (${runDist} running)` });
      } else if (base.includes('movement')) {
        const modeOpt = eff.config?.option || 'Super-Movement';
        modes.push({ name: `Movement: ${modeOpt} (${title})`, rank: r, speed: `Rank ${r}` });
      }
    }
  }

  return modes;
}

/**
 * Formats a power effect line with duration, action, range, extras, flaws, and descriptors.
 */
export function formatEffectDetails(eff) {
  if (!eff) return '';
  const base = eff.baseEffect || eff.effectType || eff.name || 'Effect';
  const ranks = eff.ranks ?? eff.rank ?? 1;
  const parts = [`${base} ${ranks}`];

  const traits = [];
  if (eff.action && eff.action !== 'Standard') traits.push(`Action: ${eff.action}`);
  if (eff.range && eff.range !== 'Close') traits.push(`Range: ${formatRange(eff)}`);
  if (eff.duration && eff.duration !== 'Instant') traits.push(`Duration: ${eff.duration}`);
  const dc = calculateDC(eff);
  if (dc) traits.push(`Resist: ${dc}`);
  else if (eff.resistance) traits.push(`Resist: ${eff.resistance}`);
  if (traits.length) {
    parts.push(`(${traits.join(', ')})`);
  }

  const specialConfig = resolveSpecialConfig(eff);
  if (specialConfig) {
    parts.push(specialConfig);
  }

  const extras = (Array.isArray(eff.extras) ? eff.extras : []).map(e => {
    let s = e.name || 'Extra';
    if (e.rank) s += ` ${e.rank}`;
    if (e.costPerRank) s += ` (${e.costPerRank > 0 ? '+' : ''}${e.costPerRank}${e.isFlat ? ' flat' : '/rank'})`;
    return s;
  });
  if (extras.length) {
    parts.push(`Extras: ${extras.join(', ')}`);
  }

  const flaws = (Array.isArray(eff.flaws) ? eff.flaws : []).map(f => {
    let s = f.name || 'Flaw';
    if (f.rank) s += ` ${f.rank}`;
    if (f.costPerRank) s += ` (${f.costPerRank > 0 ? '+' : ''}${f.costPerRank}${f.isFlat ? ' flat' : '/rank'})`;
    return s;
  });
  if (flaws.length) {
    parts.push(`Flaws: ${flaws.join(', ')}`);
  }

  if (eff.config) {
    const cfg = eff.config;
    const customs = Array.isArray(cfg.customItems) ? cfg.customItems : [];
    if (Array.isArray(cfg.selectedFaculties) && cfg.selectedFaculties.length) {
      const names = cfg.selectedFaculties.map(id => {
        const custom = customs.find(c => c.id === id);
        return custom ? custom.name : id;
      });
      parts.push(`Faculties: ${names.join(', ')}`);
    } else if (Array.isArray(cfg.selectedElements) && cfg.selectedElements.length) {
      const names = cfg.selectedElements.map(id => {
        const custom = customs.find(c => c.id === id);
        return custom ? custom.name : id;
      });
      parts.push(`Elements: ${names.join(', ')}`);
    } else if (Array.isArray(cfg.selectedPresets) && cfg.selectedPresets.length) {
      const names = cfg.selectedPresets.map(id => {
        const custom = customs.find(c => c.id === id);
        return custom ? custom.name : id;
      });
      parts.push(`Immunities: ${names.join(', ')}`);
    } else if (Array.isArray(cfg.selectedModes) && cfg.selectedModes.length) {
      const names = cfg.selectedModes.map(m => {
        const id = typeof m === 'object' ? (m.id || m.name) : m;
        const custom = customs.find(c => c.id === id);
        return custom ? custom.name : (typeof m === 'object' ? (m.name || m.id) : m);
      });
      parts.push(`Modes: ${names.join(', ')}`);
    } else if (Array.isArray(cfg.senses) && cfg.senses.length) {
      parts.push(`Senses: ${cfg.senses.join(', ')}`);
    } else if (Array.isArray(cfg.selectedTraits) && cfg.selectedTraits.length) {
      parts.push(`Targets: ${cfg.selectedTraits.join(', ')}`);
    } else if (cfg.traitName || cfg.trait) {
      parts.push(`Target: ${cfg.traitName || cfg.trait}`);
    }
  }

  return parts.join(' • ');
}

/**
 * Formats dynamic rule descriptions for a power effect (effect rules, extras, flaws) in Markdown.
 */
export function formatEffectRulesMarkdown(eff, baseIndent = '  ') {
  if (!eff) return '';
  const { effectRuleDescs, modifierRules } = resolveEffectRulesBlock(eff);
  const descs = Array.isArray(effectRuleDescs) ? effectRuleDescs : [];
  const mods = Array.isArray(modifierRules) ? modifierRules : [];
  if (!descs.length && !mods.length) return '';

  const effName = eff.baseEffect || eff.name || 'Effect';
  let out = `${baseIndent}- *Rules Reference:*\n`;
  descs.forEach((d, idx) => {
    const label = idx === 0 ? effName : '•';
    out += `${baseIndent}  - *${label}:* ${d}\n`;
  });
  mods.forEach(m => {
    const typeLabel = m.type === 'extra' ? 'Extra' : 'Flaw';
    out += `${baseIndent}  - *${m.name} (${typeLabel}):* ${m.desc}\n`;
  });
  return out;
}

/**
 * Formats dynamic rule descriptions for a power effect (effect rules, extras, flaws) in BBCode.
 */
export function formatEffectRulesBBCode(eff, baseIndent = '  ') {
  if (!eff) return '';
  const { effectRuleDescs, modifierRules } = resolveEffectRulesBlock(eff);
  const descs = Array.isArray(effectRuleDescs) ? effectRuleDescs : [];
  const mods = Array.isArray(modifierRules) ? modifierRules : [];
  if (!descs.length && !mods.length) return '';

  const effName = eff.baseEffect || eff.name || 'Effect';
  let out = `${baseIndent}- [i]Rules Reference:[/i]\n`;
  descs.forEach((d, idx) => {
    const label = idx === 0 ? effName : '•';
    out += `${baseIndent}  * [i]${label}:[/i] ${d}\n`;
  });
  mods.forEach(m => {
    const typeLabel = m.type === 'extra' ? 'Extra' : 'Flaw';
    out += `${baseIndent}  * [i]${m.name} (${typeLabel}):[/i] ${m.desc}\n`;
  });
  return out;
}

/**
 * Formats dynamic rule descriptions for a power effect (effect rules, extras, flaws) in Plain Text.
 */
export function formatEffectRulesPlainText(eff, baseIndent = '   ') {
  if (!eff) return '';
  const { effectRuleDescs, modifierRules } = resolveEffectRulesBlock(eff);
  const descs = Array.isArray(effectRuleDescs) ? effectRuleDescs : [];
  const mods = Array.isArray(modifierRules) ? modifierRules : [];
  if (!descs.length && !mods.length) return '';

  const effName = eff.baseEffect || eff.name || 'Effect';
  let out = `${baseIndent}- Rules Reference:\n`;
  descs.forEach((d, idx) => {
    const label = idx === 0 ? effName : '•';
    out += `${baseIndent}  * ${label}: ${d}\n`;
  });
  mods.forEach(m => {
    const typeLabel = m.type === 'extra' ? 'Extra' : 'Flaw';
    out += `${baseIndent}  * ${m.name} (${typeLabel}): ${m.desc}\n`;
  });
  return out;
}

/**
 * Compiles a canonical, normalized character export dataset.
 * Serves as the single source of truth for Plain Text, Markdown, and BBCode exporters.
 *
 * @param {Object} character - Raw character object from store
 * @param {Object} heroStore - Pinia hero store instance
 * @param {Object} options - Export options { mode: 'compact' | 'exhaustive' }
 * @returns {Object} Canonical export dataset
 */
export function compileExportData(character = {}, heroStore = null, options = {}) {
  const opts = {
    powerMechanics: options.powerMechanics !== undefined ? options.powerMechanics : true,
    effectRules: options.effectRules !== undefined ? options.effectRules : (options.mode === 'exhaustive'),
    modifierRules: options.modifierRules !== undefined ? options.modifierRules : (options.mode === 'exhaustive'),
    showAbilities: options.showAbilities !== false,
    showDefenses: options.showDefenses !== false,
    showOffense: options.showOffense !== false,
    showAdvantages: options.showAdvantages !== false,
    showSkills: options.showSkills !== false,
    skillsMode: options.skillsMode || 'all',
    showPowers: options.showPowers !== false,
    showMovement: options.showMovement !== false,
    showEquipment: options.showEquipment !== false,
    showComplications: options.showComplications !== false,
    showNotes: options.showNotes !== false
  };
  const mode = (opts.effectRules || opts.modifierRules) ? 'exhaustive' : 'compact';
  const pl = character.powerLevel || 10;
  const name = character.name || 'Hero Name';
  const identity = character.identity || 'Secret Alter Ego';
  const isSecret = character.isSecretIdentity !== false;
  const identityType = isSecret ? 'Secret Identity' : 'Public Identity';
  const player = character.player || 'None';
  const affiliation = character.groupAffiliation || 'None';
  const baseOfOps = character.baseOfOperations || 'Freedom City';
  const heroPoints = character.heroPoints ?? 1;

  // Demographics
  const demographics = [];
  if (character.gender) demographics.push({ label: 'Gender', value: character.gender });
  if (character.age) demographics.push({ label: 'Age', value: character.age });
  if (character.height) demographics.push({ label: 'Height', value: character.height });
  if (character.weight) demographics.push({ label: 'Weight', value: character.weight });
  if (character.eyes) demographics.push({ label: 'Eyes', value: character.eyes });
  if (character.hair) demographics.push({ label: 'Hair', value: character.hair });

  // Power Point Accounting
  const abilitiesCost = heroStore?.abilitiesCost ?? Object.values(character.abilities || {}).reduce((sum, v) => sum + (Number(v) || 0) * 2, 0);
  const defensesCost = heroStore?.defensesCost ?? Object.entries(character.defensesBought || {}).reduce((sum, [k, v]) => k !== 'TOUGHNESS' ? sum + (Number(v) || 0) : sum, 0);
  const totalSkillRanks = (character.skills || []).reduce((sum, s) => sum + (Number(s.ranks ?? s.rank) || 0), 0);
  const skillsCost = heroStore?.skillsCost ?? Math.ceil(totalSkillRanks / 2);
  const advantagesCost = heroStore?.advantagesCost ?? (character.advantages || []).reduce((sum, a) => sum + (Number(a.ranks ?? a.rank ?? 1) || 1), 0);
  const powersCost = heroStore?.powersCost ?? (character.powers || []).reduce((sum, p) => sum + (calculatePowerTotalCost(p) || 0), 0);
  const totalSpent = heroStore?.totalSpentPP ?? (abilitiesCost + defensesCost + skillsCost + advantagesCost + powersCost);
  const totalBudget = heroStore?.totalBudgetPP ?? (pl * 15);
  const remaining = heroStore?.remainingPP ?? (totalBudget - totalSpent);

  const effAbilities = heroStore?.effectiveAbilities ?? (character.abilities || {});
  const activeTraits = heroStore?.activeEnhancedTraits || { abilities: {}, defenses: {}, skills: {}, advantages: {} };

  // Abilities (8 Core Abilities)
  const ablDefs = [
    { code: 'STR', name: 'Strength' },
    { code: 'STA', name: 'Stamina' },
    { code: 'AGL', name: 'Agility' },
    { code: 'DEX', name: 'Dexterity' },
    { code: 'FGT', name: 'Fighting' },
    { code: 'INT', name: 'Intellect' },
    { code: 'AWE', name: 'Awareness' },
    { code: 'PRE', name: 'Presence' }
  ];

  const abilities = ablDefs.map(abl => {
    const isAbsent = heroStore?.isAbilityAbsent ? heroStore.isAbilityAbsent(abl.code) : ((character.absentAbilities || []).includes(abl.code));
    if (isAbsent) {
      return {
        code: abl.code,
        name: abl.name,
        score: null,
        scoreDisplay: '-',
        mod: '-',
        baseRank: 'Absent',
        enhRank: 0,
        cost: -10,
        isAbsent: true
      };
    }
    const baseRank = Number(character.abilities?.[abl.code] || 0);
    const enhRank = Number(activeTraits.abilities?.[abl.code] || 0);
    const score = effAbilities[abl.code] ?? (baseRank + enhRank);
    const mod = formatMod(score);
    const cost = baseRank * 2;
    return {
      code: abl.code,
      name: abl.name,
      score,
      scoreDisplay: String(score),
      mod,
      baseRank,
      enhRank,
      cost,
      isAbsent: false
    };
  });

  // Defenses
  const shieldBonus = heroStore?.equipmentShieldBonus || 0;
  const armorBonus = heroStore?.equipmentArmorBonus || 0;
  const powerProt = heroStore?.protectionBonus || 0;
  const defRoll = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Defensive Roll') : 0;

  const dodgeBought = character.defensesBought?.DODGE || 0;
  const dodgeTotal = heroStore?.getDefenseTotal('DODGE') ?? ((effAbilities.AGL || 0) + dodgeBought + shieldBonus);
  const dodgeNotes = shieldBonus > 0 ? `Shield +${shieldBonus}` : 'Active Defense';

  const parryBought = character.defensesBought?.PARRY || 0;
  const parryTotal = heroStore?.getDefenseTotal('PARRY') ?? ((effAbilities.FGT || 0) + parryBought + shieldBonus);
  const parryNotes = shieldBonus > 0 ? `Shield +${shieldBonus}` : 'Active Defense';

  const fortBought = character.defensesBought?.FORTITUDE || 0;
  const isStaAbsent = (character.absentAbilities || []).includes('STA');
  const fortTotal = isStaAbsent ? null : (heroStore?.getDefenseTotal('FORTITUDE') ?? ((effAbilities.STA || 0) + fortBought));
  const fortNotes = isStaAbsent ? 'Immune to Fortitude Effects' : 'Physical Resistance';

  const toughBought = character.defensesBought?.TOUGHNESS || 0;
  const toughTotal = heroStore?.getDefenseTotal('TOUGHNESS') ?? ((effAbilities.STA || 0) + toughBought + armorBonus + powerProt + defRoll);
  const toughBonuses = [];
  if (armorBonus > 0) toughBonuses.push(`Armor +${armorBonus}`);
  if (powerProt > 0) toughBonuses.push(`Protection +${powerProt}`);
  if (defRoll > 0) toughBonuses.push(`Defensive Roll +${defRoll}`);
  const toughNotes = toughBonuses.length > 0 ? toughBonuses.join(', ') : 'Base Toughness';

  const willBought = character.defensesBought?.WILL || 0;
  const willTotal = heroStore?.getDefenseTotal('WILL') ?? ((effAbilities.AWE || 0) + willBought);
  const willNotes = 'Mental Resistance';

  const defenses = [
    {
      code: 'DODGE',
      name: 'Dodge',
      total: dodgeTotal,
      totalDisplay: String(dodgeTotal),
      baseAbility: `AGL (${formatMod(effAbilities.AGL || 0)})`,
      bought: dodgeBought,
      notes: dodgeNotes,
      isImmune: false
    },
    {
      code: 'PARRY',
      name: 'Parry',
      total: parryTotal,
      totalDisplay: String(parryTotal),
      baseAbility: `FGT (${formatMod(effAbilities.FGT || 0)})`,
      bought: parryBought,
      notes: parryNotes,
      isImmune: false
    },
    {
      code: 'FORTITUDE',
      name: 'Fortitude',
      total: fortTotal,
      totalDisplay: fortTotal !== null ? String(fortTotal) : '-',
      baseAbility: isStaAbsent ? 'STA (Absent)' : `STA (${formatMod(effAbilities.STA || 0)})`,
      bought: fortBought,
      notes: fortNotes,
      isImmune: isStaAbsent
    },
    {
      code: 'TOUGHNESS',
      name: 'Toughness',
      total: toughTotal,
      totalDisplay: String(toughTotal),
      baseAbility: `STA (${formatMod(effAbilities.STA || 0)})`,
      bought: toughBought,
      notes: toughNotes,
      isImmune: false
    },
    {
      code: 'WILL',
      name: 'Will',
      total: willTotal,
      totalDisplay: String(willTotal),
      baseAbility: `AWE (${formatMod(effAbilities.AWE || 0)})`,
      bought: willBought,
      notes: willNotes,
      isImmune: false
    }
  ];

  // Offense (Initiative & Attacks)
  const initBonus = heroStore?.initiativeTotal ?? (heroStore?.getDefenseBase('INITIATIVE') ?? (effAbilities.AGL || 0));
  const initAdvRanks = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Improved Initiative') : 0;
  const initNotesParts = [`AGL ${formatMod(effAbilities.AGL || 0)}`];
  if (initAdvRanks > 0) initNotesParts.push(`Improved Initiative +${initAdvRanks * 4}`);

  let attacksList = heroStore?.targetedAttacks || [];
  if (attacksList.length === 0) {
    attacksList = compileTargetedAttacks(character, effAbilities, (n) => heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks(n) : 0);
  }

  const attacks = attacksList.map(atk => {
    const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto' || atk.rollBonus === null;
    const bonusStr = isAuto ? 'Auto' : (Number(atk.rollBonus) >= 0 ? `+${atk.rollBonus}` : `${atk.rollBonus}`);
    const effectDesc = `${atk.effectName || 'Damage'} ${atk.effectRank ?? atk.rank ?? 0}`;
    const descStr = atk.descriptor || 'Physical';
    const dcStr = atk.dc ? `DC ${atk.dc} vs ${atk.resistance || 'Toughness'}` : '-';
    const rangeCrit = `${atk.range || 'Close'}, Crit ${atk.crit || 20}`;
    return {
      name: atk.name,
      bonusStr,
      effectDesc,
      descStr,
      dcStr,
      rangeCrit,
      isAuto,
      rawAttack: atk
    };
  });

  // Advantages
  const rawAdvs = Array.isArray(character.advantages) ? character.advantages : [];
  const advantages = rawAdvs.map(adv => {
    const advName = adv.name || 'Advantage';
    const ranks = Number(adv.ranks ?? adv.rank ?? 1) || 1;
    const specifier = adv.specifier || adv.detail || '';
    let label = ranks > 1 ? `${advName} ${ranks}` : advName;
    if (specifier) label += ` (${specifier})`;
    return {
      name: advName,
      ranks,
      specifier,
      label,
      desc: adv.desc || adv.description || ''
    };
  }).sort((a, b) => a.label.localeCompare(b.label));

  // Skills (All 16 core skills + subskills, filtered if trained only)
  let skills = getAllCharacterSkills(character, heroStore);
  if (opts.skillsMode === 'trained') {
    skills = skills.filter(sk => (Number(sk.ranks) || 0) > 0 || sk.subtype);
  }

  // Powers
  const rawPowers = Array.isArray(character.powers) ? character.powers : [];
  const powers = rawPowers.map(p => {
    const statblock = formatPowerStatblock(p, opts);
    return {
      ...statblock,
      cost: statblock.totalCost,
      rawPower: p
    };
  });

  // Movement Modes
  const movement = getMovementModes(character);

  // Equipment / Resources
  const resources = character.resources || [];
  const totalEP = heroStore?.totalEP ?? resources.reduce((sum, r) => sum + (Number(r.epCost ?? r.cost) || 0), 0);
  const maxEP = (heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Equipment') : 0) * 5;

  // Complications
  const comps = character.complications || [];
  const motivations = comps.filter(isMotivation);
  const complications = comps.filter(c => !isMotivation(c));

  return {
    options: opts,
    mode,
    identity: {
      name,
      powerLevel: pl,
      realIdentity: identity,
      isSecret,
      identityType,
      player,
      affiliation,
      baseOfOperations: baseOfOps,
      heroPoints,
      demographics
    },
    ppAccounting: {
      abilitiesCost,
      defensesCost,
      skillsCost,
      advantagesCost,
      powersCost,
      totalSpent,
      totalBudget,
      remaining,
      totalSkillRanks
    },
    abilities,
    defenses,
    offense: {
      initiative: {
        total: formatMod(initBonus),
        bonus: initBonus,
        notes: initNotesParts.join(', ')
      },
      attacks
    },
    advantages,
    skills,
    powers,
    movement,
    equipment: {
      resources,
      totalEP,
      maxEP
    },
    complications: {
      motivations,
      complications,
      all: comps
    },
    notes: character.notes || ''
  };
}
