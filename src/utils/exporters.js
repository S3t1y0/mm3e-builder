import LZString from 'lz-string';
import { calculatePowerTotalCost } from '../rules/powerEngine.js';
import { isMotivation } from '../rules/complications.js';

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Downloads character data as a JSON file.
 */
export function downloadCharacterJson(character) {
  const safeName = (character.name || 'Hero').replace(/[^a-z0-9_-]/gi, '_');
  const data = JSON.stringify(character, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_mm3e.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export {
  generateShareUrl,
  parseSharedCharacterFromHash as parseShareHash,
  pruneCharacterForShare,
  clearShareHash
} from '../services/shareService.js';

import { compileTargetedAttacks } from '../rules/attacks.js';

/**
 * Format number as a D20 modifier (+5, -2, +0).
 */
function formatMod(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num >= 0 ? `+${num}` : `${num}`;
}

/**
 * Resolves standard ability key for a skill name.
 */
function getSkillAbility(skillName) {
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
 * Generates Roll20 macros for character abilities, defenses, attacks, and all skills.
 */
export function generateRoll20Macros(character, heroStore) {
  const name = character.name || 'Hero';
  const macros = [];

  // Initiative
  const initBonus = heroStore.getDefenseBase('INITIATIVE');
  macros.push({
    category: 'Initiative',
    title: 'Initiative Check',
    command: `&{template:default} {{name=${name} - Initiative}} {{Roll=[[1d20+${initBonus} &{tracker}]]}}`,
    simpleCommand: `/roll 1d20+${initBonus} &{tracker}`
  });

  // 8 Abilities
  const abilities = [
    { code: 'STR', label: 'Strength' },
    { code: 'STA', label: 'Stamina' },
    { code: 'AGL', label: 'Agility' },
    { code: 'DEX', label: 'Dexterity' },
    { code: 'FGT', label: 'Fighting' },
    { code: 'INT', label: 'Intellect' },
    { code: 'AWE', label: 'Awareness' },
    { code: 'PRE', label: 'Presence' }
  ];

  abilities.forEach(abl => {
    const isAbsent = heroStore?.isAbilityAbsent ? heroStore.isAbilityAbsent(abl.code) : ((character.absentAbilities || []).includes(abl.code));
    if (isAbsent) {
      macros.push({
        category: 'Abilities',
        title: `${abl.label} Check`,
        command: `&{template:default} {{name=${name} - ${abl.label} Check}} {{Result=Absent Ability (Automatic Failure)}}`,
        simpleCommand: `/em tries ${abl.label} check but lacks the ability (Automatic Failure).`
      });
      return;
    }
    const score = heroStore.effectiveAbilities[abl.code] ?? (character.abilities?.[abl.code] || 0);
    const modStr = score >= 0 ? `+${score}` : `${score}`;
    macros.push({
      category: 'Abilities',
      title: `${abl.label} Check`,
      command: `&{template:default} {{name=${name} - ${abl.label} Check}} {{Roll=[[1d20${modStr}]]}}`,
      simpleCommand: `/roll 1d20${modStr}`
    });
  });

  // 5 Defenses
  const defenses = [
    { code: 'DODGE', label: 'Dodge Defense' },
    { code: 'PARRY', label: 'Parry Defense' },
    { code: 'TOUGHNESS', label: 'Toughness Resistance' },
    { code: 'FORTITUDE', label: 'Fortitude Resistance' },
    { code: 'WILL', label: 'Will Resistance' }
  ];

  defenses.forEach(def => {
    const total = heroStore.getDefenseTotal(def.code);
    if (def.code === 'FORTITUDE' && (total === null || (character.absentAbilities || []).includes('STA'))) {
      macros.push({
        category: 'Defenses',
        title: `${def.label}`,
        command: `&{template:default} {{name=${name} - ${def.label}}} {{Status=Immune to Fortitude Effects (Absent Stamina)}}`,
        simpleCommand: `/em is Immune to Fortitude Effects (Absent Stamina).`
      });
      return;
    }
    const safeTotal = total ?? 0;
    const modStr = safeTotal >= 0 ? `+${safeTotal}` : `${safeTotal}`;
    macros.push({
      category: 'Defenses',
      title: `${def.label}`,
      command: `&{template:default} {{name=${name} - ${def.label}}} {{Save Roll=[[1d20${modStr}]]}}`,
      simpleCommand: `/roll 1d20${modStr}`
    });
  });

  // Skills (All Skills)
  const allSkills = getAllCharacterSkills(character, heroStore);
  allSkills.forEach(sk => {
    if (sk.isAbsent) {
      macros.push({
        category: 'Skills',
        title: `${sk.displayName} Check`,
        command: `&{template:default} {{name=${name} - ${sk.displayName} Check}} {{Result=Absent Ability (Automatic Failure)}}`,
        simpleCommand: `/em tries ${sk.displayName} check but lacks the ability (Automatic Failure).`
      });
      return;
    }
    const modStr = formatMod(sk.totalBonus);
    macros.push({
      category: 'Skills',
      title: `${sk.displayName} Check`,
      command: `&{template:default} {{name=${name} - ${sk.displayName} Check}} {{Roll=[[1d20${modStr}]]}}`,
      simpleCommand: `/roll 1d20${modStr}`
    });
  });

  // Targeted Attacks
  const attacks = heroStore.targetedAttacks || [];
  attacks.forEach(atk => {
    const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto';
    const bonusNum = Number(atk.rollBonus) || 0;
    const modStr = isAuto ? '+0' : (bonusNum >= 0 ? `+${bonusNum}` : `${bonusNum}`);
    const dcInfo = atk.dc ? `{{DC=${atk.dc} vs ${atk.resistance || 'Toughness'}}}` : '';
    const descInfo = (atk.descriptor || atk.effectName) ? `{{Effect=${atk.descriptor || atk.effectName}}}` : '';
    macros.push({
      category: 'Attacks',
      title: `${atk.name} Attack`,
      command: isAuto
        ? `&{template:default} {{name=${name} - ${atk.name}}} {{Area Attack=Auto-hit (Dodge DC ${atk.dc} for half)}} ${dcInfo} ${descInfo}`
        : `&{template:default} {{name=${name} - ${atk.name}}} {{Attack Roll=[[1d20${modStr}]]}} ${dcInfo} ${descInfo}`,
      simpleCommand: isAuto
        ? `Auto-hit: ${atk.name} (DC ${atk.dc} vs ${atk.resistance || 'Toughness'})`
        : `/roll 1d20${modStr} # ${atk.name} (DC ${atk.dc})`
    });
  });

  return macros;
}

/**
 * Compiles movement modes from powers and standard movement.
 */
function getMovementModes(character) {
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
        const distStr = r >= 7 ? `${Math.round(Math.pow(2, r - 7))} miles` : `${Math.round(Math.pow(2, r) * 30)} ft`;
        modes.push({ name: `Teleport (${title})`, rank: r, speed: `Rank ${r} • ${distStr}/move` });
      } else if (base.includes('swimming')) {
        modes.push({ name: `Swimming (${title})`, rank: r, speed: formatSpeed(Math.max(0, r - 2)) });
      } else if (base.includes('burrowing')) {
        modes.push({ name: `Burrowing (${title})`, rank: r, speed: formatSpeed(Math.max(0, r - 5)) });
      } else if (base.includes('leaping')) {
        const leapDist = r >= 4 ? `${Math.round(Math.pow(2, r - 4) * 30)} ft` : `Rank ${r}`;
        modes.push({ name: `Leaping (${title})`, rank: r, speed: `Rank ${r} • ${leapDist}` });
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
function formatEffectDetails(eff) {
  if (!eff) return '';
  const base = eff.baseEffect || eff.effectType || eff.name || 'Effect';
  const ranks = eff.ranks ?? eff.rank ?? 1;
  const parts = [`${base} ${ranks}`];

  const traits = [];
  if (eff.action && eff.action !== 'Standard') traits.push(`Action: ${eff.action}`);
  if (eff.range && eff.range !== 'Close') traits.push(`Range: ${eff.range}`);
  if (eff.duration && eff.duration !== 'Instant') traits.push(`Duration: ${eff.duration}`);
  if (eff.resistance) traits.push(`Resist: ${eff.resistance}`);
  if (traits.length) {
    parts.push(`(${traits.join(', ')})`);
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
 * Builds clean, comprehensive Markdown character sheet.
 */
export function buildMarkdownSheet(character, heroStore) {
  const pl = character.powerLevel || 10;
  const name = character.name || 'Hero Name';
  const identity = character.identity || 'Secret Alter Ego';
  const isSecret = character.isSecretIdentity !== false;
  const identityType = isSecret ? 'Secret Identity' : 'Public Identity';
  const player = character.player || 'None';
  const affiliation = character.groupAffiliation || 'None';
  const baseOfOps = character.baseOfOperations || 'Freedom City';
  const heroPoints = character.heroPoints ?? 1;

  // Power Points Accounting
  const abilitiesCost = heroStore?.abilitiesCost ?? Object.values(character.abilities || {}).reduce((sum, v) => sum + (Number(v) || 0) * 2, 0);
  const defensesCost = heroStore?.defensesCost ?? Object.entries(character.defensesBought || {}).reduce((sum, [k, v]) => k !== 'TOUGHNESS' ? sum + (Number(v) || 0) : sum, 0);
  const totalSkillRanks = (character.skills || []).reduce((sum, s) => sum + (Number(s.ranks ?? s.rank) || 0), 0);
  const skillsCost = heroStore?.skillsCost ?? Math.ceil(totalSkillRanks / 2);
  const advantagesCost = heroStore?.advantagesCost ?? (character.advantages || []).reduce((sum, a) => sum + (Number(a.ranks ?? a.rank ?? 1) || 1), 0);
  const powersCost = heroStore?.powersCost ?? (character.powers || []).reduce((sum, p) => sum + (calculatePowerTotalCost(p) || 0), 0);
  const totalSpent = heroStore?.totalSpentPP ?? (abilitiesCost + defensesCost + skillsCost + advantagesCost + powersCost);
  const totalBudget = heroStore?.totalBudgetPP ?? (pl * 15);
  const remaining = heroStore?.remainingPP ?? (totalBudget - totalSpent);

  // Effective Abilities
  const effAbilities = heroStore?.effectiveAbilities ?? (character.abilities || {});
  const activeTraits = heroStore?.activeEnhancedTraits || { abilities: {}, defenses: {}, skills: {}, advantages: {} };

  let md = `# ${name.toUpperCase()} (PL ${pl})\n\n`;

  // --- HEADER & IDENTITY ---
  md += `**Real Identity:** ${identity} (${identityType})  \n`;
  md += `**Player:** ${player} | **Group Affiliation:** ${affiliation} | **Base of Operations:** ${baseOfOps}  \n`;

  // Physical Demographics
  const demographics = [];
  if (character.gender) demographics.push(`**Gender:** ${character.gender}`);
  if (character.age) demographics.push(`**Age:** ${character.age}`);
  if (character.height) demographics.push(`**Height:** ${character.height}`);
  if (character.weight) demographics.push(`**Weight:** ${character.weight}`);
  if (character.eyes) demographics.push(`**Eyes:** ${character.eyes}`);
  if (character.hair) demographics.push(`**Hair:** ${character.hair}`);
  if (demographics.length > 0) {
    md += `${demographics.join(' | ')}  \n`;
  }
  md += `**Hero Points:** ${heroPoints}\n\n`;
  md += `---\n\n`;

  // --- POWER POINT ACCOUNTING ---
  md += `## Power Point Summary\n\n`;
  md += `| Category | Cost |\n`;
  md += `|:---|---:|\n`;
  md += `| **Abilities** | ${abilitiesCost} PP |\n`;
  md += `| **Defenses** | ${defensesCost} PP |\n`;
  md += `| **Skills** | ${skillsCost} PP (${totalSkillRanks} ranks) |\n`;
  md += `| **Advantages** | ${advantagesCost} PP |\n`;
  md += `| **Powers** | ${powersCost} PP |\n`;
  md += `| **TOTAL SPENT** | **${totalSpent} / ${totalBudget} PP** |\n`;
  md += `| **REMAINING** | **${remaining} PP** |\n\n`;
  md += `---\n\n`;

  // --- 8 ABILITIES TABLE ---
  md += `## Abilities (${abilitiesCost} PP)\n\n`;
  md += `| Ability | Score | Mod | Base Rank | Enhanced Rank | Cost |\n`;
  md += `|:---|:---:|:---:|:---:|:---:|---:|\n`;

  const ablDefinitions = [
    { code: 'STR', name: 'Strength' },
    { code: 'STA', name: 'Stamina' },
    { code: 'AGL', name: 'Agility' },
    { code: 'DEX', name: 'Dexterity' },
    { code: 'FGT', name: 'Fighting' },
    { code: 'INT', name: 'Intellect' },
    { code: 'AWE', name: 'Awareness' },
    { code: 'PRE', name: 'Presence' }
  ];

  ablDefinitions.forEach(abl => {
    const isAbsent = heroStore?.isAbilityAbsent ? heroStore.isAbilityAbsent(abl.code) : ((character.absentAbilities || []).includes(abl.code));
    if (isAbsent) {
      md += `| **${abl.name} (${abl.code})** | **—** | **—** | Absent | - | -10 PP |\n`;
      return;
    }
    const baseRank = Number(character.abilities?.[abl.code] || 0);
    const enhRank = Number(activeTraits.abilities?.[abl.code] || 0);
    const totalScore = effAbilities[abl.code] ?? (baseRank + enhRank);
    const modStr = formatMod(totalScore);
    const cost = baseRank * 2;
    md += `| **${abl.name} (${abl.code})** | ${totalScore} | ${modStr} | ${baseRank} | ${enhRank > 0 ? '+' + enhRank : '-'} | ${cost} PP |\n`;
  });
  md += `\n---\n\n`;

  // --- DEFENSES TABLE ---
  md += `## Defenses (${defensesCost} PP)\n\n`;
  md += `| Defense | Total | Base Ability | Bought Ranks | Notes / Bonuses |\n`;
  md += `|:---|:---:|:---|:---:|:---|\n`;

  const shieldBonus = heroStore?.equipmentShieldBonus || 0;
  const armorBonus = heroStore?.equipmentArmorBonus || 0;
  const powerProt = heroStore?.protectionBonus || 0;
  const defRoll = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Defensive Roll') : 0;

  const dodgeBought = character.defensesBought?.DODGE || 0;
  const dodgeTotal = heroStore?.getDefenseTotal('DODGE') ?? ((effAbilities.AGL || 0) + dodgeBought + shieldBonus);
  const dodgeNotes = shieldBonus > 0 ? `Shield +${shieldBonus}` : 'Active Defense';
  md += `| **Dodge** | **${dodgeTotal}** | AGL (${formatMod(effAbilities.AGL || 0)}) | +${dodgeBought} | ${dodgeNotes} |\n`;

  const parryBought = character.defensesBought?.PARRY || 0;
  const parryTotal = heroStore?.getDefenseTotal('PARRY') ?? ((effAbilities.FGT || 0) + parryBought + shieldBonus);
  const parryNotes = shieldBonus > 0 ? `Shield +${shieldBonus}` : 'Active Defense';
  md += `| **Parry** | **${parryTotal}** | FGT (${formatMod(effAbilities.FGT || 0)}) | +${parryBought} | ${parryNotes} |\n`;

  const fortBought = character.defensesBought?.FORTITUDE || 0;
  const fortTotal = heroStore?.getDefenseTotal('FORTITUDE') ?? ((effAbilities.STA || 0) + fortBought);
  if (fortTotal === null || (character.absentAbilities || []).includes('STA')) {
    md += `| **Fortitude** | **-** | STA (Absent) | - | Immune to Fortitude Effects |\n`;
  } else {
    md += `| **Fortitude** | **${fortTotal}** | STA (${formatMod(effAbilities.STA || 0)}) | +${fortBought} | Physical Resistance |\n`;
  }

  const toughBought = character.defensesBought?.TOUGHNESS || 0;
  const toughTotal = heroStore?.getDefenseTotal('TOUGHNESS') ?? ((effAbilities.STA || 0) + toughBought + armorBonus + powerProt + defRoll);
  const toughBonusParts = [];
  if (armorBonus > 0) toughBonusParts.push(`Armor +${armorBonus}`);
  if (powerProt > 0) toughBonusParts.push(`Protection +${powerProt}`);
  if (defRoll > 0) toughBonusParts.push(`Def. Roll +${defRoll}`);
  if (toughBought > 0) toughBonusParts.push(`Bought +${toughBought}`);
  const toughNotes = toughBonusParts.length > 0 ? toughBonusParts.join(', ') : 'Natural Resistance';
  md += `| **Toughness** | **${toughTotal}** | STA (${formatMod(effAbilities.STA || 0)}) | +${toughBought} | ${toughNotes} |\n`;

  const willBought = character.defensesBought?.WILL || 0;
  const willTotal = heroStore?.getDefenseTotal('WILL') ?? ((effAbilities.AWE || 0) + willBought);
  md += `| **Will** | **${willTotal}** | AWE (${formatMod(effAbilities.AWE || 0)}) | +${willBought} | Mental Resistance |\n\n`;
  md += `---\n\n`;

  // --- OFFENSE, INITIATIVE & MOVEMENT ---
  const initBonus = heroStore?.initiativeTotal ?? (heroStore?.getDefenseBase('INITIATIVE') ?? (effAbilities.AGL || 0));
  const initAdvRanks = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Improved Initiative') : 0;
  const movementList = getMovementModes(character);

  md += `## Combat Offense & Movement\n\n`;
  md += `- **Initiative:** +${initBonus} (AGL ${formatMod(effAbilities.AGL || 0)}${initAdvRanks > 0 ? `, Improved Initiative +${initAdvRanks * 4}` : ''})\n`;
  md += `- **Movement Modes:**\n`;
  movementList.forEach(m => {
    md += `  - **${m.name}:** ${m.speed}\n`;
  });
  md += `\n`;

  // Attacks Matrix
  let attacksList = heroStore?.targetedAttacks || [];
  if (attacksList.length === 0) {
    attacksList = compileTargetedAttacks(character, effAbilities, (name) => heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks(name) : 0);
  }

  if (attacksList.length > 0) {
    md += `### Attacks Matrix\n\n`;
    md += `| Attack Name | Roll / Bonus | Effect & Rank | Descriptor | DC & Resistance | Range & Crit |\n`;
    md += `|:---|:---:|:---|:---|:---:|:---:|\n`;
    attacksList.forEach(atk => {
      const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto' || atk.rollBonus === null;
      const bonusStr = isAuto ? 'Auto' : (Number(atk.rollBonus) >= 0 ? `+${atk.rollBonus}` : `${atk.rollBonus}`);
      const effectDesc = `${atk.effectName || 'Damage'} ${atk.effectRank ?? atk.rank ?? 0}`;
      const descStr = atk.descriptor || 'Physical';
      const dcStr = atk.dc ? `DC ${atk.dc} vs ${atk.resistance || 'Toughness'}` : '-';
      const rangeCrit = `${atk.range || 'Close'}, Crit ${atk.crit || 20}`;
      md += `| **${atk.name}** | ${bonusStr} | ${effectDesc} | ${descStr} | ${dcStr} | ${rangeCrit} |\n`;
    });
    md += `\n`;
  }
  md += `---\n\n`;

  // --- POWERS & DEVICES ---
  const powers = character.powers || [];
  md += `## Powers & Devices (${powersCost} PP)\n\n`;
  if (powers.length === 0) {
    md += `*No powers purchased.*\n\n`;
  } else {
    powers.forEach((p, pIdx) => {
      const cost = calculatePowerTotalCost(p);
      const descriptors = Array.isArray(p.descriptors) && p.descriptors.length
        ? ` [Descriptors: ${p.descriptors.join(', ')}]`
        : (p.descriptors ? ` [Descriptors: ${p.descriptors}]` : '');

      if (p.type === 'device') {
        const isEasily = p.deviceConfig?.type === 'easily_removable';
        const devType = isEasily ? 'Easily Removable Device (-2 PP / 5 PP discount)' : 'Removable Device (-1 PP / 5 PP discount)';
        md += `### ${pIdx + 1}. **${p.name || 'Device'}** (${cost} PP)\n`;
        md += `*Container: ${devType}*${descriptors}\n\n`;

        const subPowers = p.devicePowers || [];
        if (subPowers.length > 0) {
          subPowers.forEach(sp => {
            const eff = sp.effect || sp;
            md += `- **${sp.name || eff.baseEffect}:** ${formatEffectDetails(eff)}\n`;
            if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
              sp.linkedEffects.forEach(le => {
                md += `  - *Linked:* **${le.name || le.baseEffect}:** ${formatEffectDetails(le.effect || le)}\n`;
              });
            }
            if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
              sp.alternateEffects.forEach(alt => {
                const altCost = alt.cost || 1;
                md += `  - *Alternate Effect (Slot):* **${alt.name || alt.baseEffect}:** ${formatEffectDetails(alt.effect || alt)} (${altCost} PP)\n`;
              });
            }
          });
        }
      } else if (p.type === 'compound') {
        md += `### ${pIdx + 1}. **${p.name || 'Compound Power'}** (${cost} PP)\n`;
        md += `*Container: Compound Suite*${descriptors}\n\n`;
        const compEffects = p.compoundEffects || [];
        compEffects.forEach(cp => {
          const eff = cp.effect || cp;
          md += `- **${cp.name || eff.baseEffect}:** ${formatEffectDetails(eff)}\n`;
        });
      } else {
        const eff = p.mainEffect || p;
        md += `### ${pIdx + 1}. **${p.name || eff.baseEffect || 'Power'}** (${cost} PP)\n`;
        md += `- **Effect:** ${formatEffectDetails(eff)}${descriptors}\n`;

        if (p.activation && p.activation !== 'none') {
          md += `- *Activation:* ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}\n`;
        }

        if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
          p.linkedEffects.forEach(link => {
            md += `- *Linked Effect:* **${link.name || link.baseEffect}:** ${formatEffectDetails(link.effect || link)}\n`;
          });
        }

        if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
          p.alternateEffects.forEach(alt => {
            const altCost = alt.cost || 1;
            md += `- *Alternate Effect (Slot):* **${alt.name || alt.baseEffect}:** ${formatEffectDetails(alt.effect || alt)} (${altCost} PP)\n`;
          });
        }
      }

      if (p.description || p.notes) {
        md += `> ${p.description || p.notes}\n`;
      }
      md += `\n`;
    });
  }
  md += `---\n\n`;

  // --- ADVANTAGES ---
  const advs = heroStore?.effectiveAdvantages ?? (character.advantages || []);
  md += `## Advantages (${advantagesCost} PP)\n\n`;
  if (advs.length === 0) {
    md += `*No advantages purchased.*\n\n`;
  } else {
    md += `| Advantage | Ranks | Source / Notes |\n`;
    md += `|:---|:---:|:---|\n`;
    advs.forEach(a => {
      const rnk = a.ranks || 1;
      const title = a.displayName || (a.specification ? `${a.name} (${a.specification})` : a.name);
      const notes = a.isPowerGranted
        ? 'Granted by Power / Enhanced Trait'
        : (a.hasPowerBonus ? `Base ${a.naturalRanks} + ${a.enhancedRanks} from Power` : 'Purchased');
      md += `| **${title}** | ${rnk} | ${notes} |\n`;
    });
    md += `\n`;
  }
  md += `---\n\n`;

  // --- SKILLS TABLE (ALL SKILLS) ---
  const allSkills = getAllCharacterSkills(character, heroStore);
  md += `## Skills (${skillsCost} PP, ${totalSkillRanks} Ranks Purchased)\n\n`;
  md += `| Skill | Key Ability | Total Bonus | Breakdown | Ranks | Status |\n`;
  md += `|:---|:---:|:---:|:---|:---:|:---:|\n`;
  allSkills.forEach(sk => {
    const statusStr = sk.isTrained ? 'Trained' : 'Untrained';
    const rankPart = sk.ranks > 0 ? `+ ${sk.ranks} Ranks` : '+ 0 Ranks';
    const enhPart = sk.enhBonus > 0 ? ` + ${sk.enhBonus} Enhanced` : '';
    const breakdown = `${sk.abilityCode} (${formatMod(sk.abilityMod)}) ${rankPart}${enhPart}`;
    md += `| **${sk.displayName}** | ${sk.abilityCode} | **${formatMod(sk.totalBonus)}** | ${breakdown} | ${sk.ranks} | ${statusStr} |\n`;
  });
  md += `\n---\n\n`;

  // --- EQUIPMENT, VEHICLES & HEADQUARTERS ---
  const resources = character.resources || [];
  const totalEP = heroStore?.totalEP ?? resources.reduce((sum, r) => sum + (Number(r.epCost ?? r.cost) || 0), 0);
  const maxEP = (heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Equipment') : 0) * 5;

  md += `## Equipment, Vehicles & Headquarters (${totalEP} / ${maxEP} EP)\n\n`;
  if (resources.length === 0) {
    md += `*No equipment, vehicles, or headquarters registered.*\n\n`;
  } else {
    md += `*Budget: ${totalEP} EP spent of ${maxEP} EP maximum from Equipment Advantage*\n\n`;
    resources.forEach((r, rIdx) => {
      const cost = r.epCost ?? r.cost ?? 1;
      const statusStr = r.status ? `[Status: ${r.status}]` : '';
      const subStr = r.subtype ? `(${r.subtype})` : `(${r.type || 'Gear'})`;
      md += `- **${r.name}** ${subStr} (${cost} EP) ${statusStr}`;
      if (r.desc) md += ` - ${r.desc}`;
      md += `\n`;
    });
    md += `\n`;
  }
  md += `---\n\n`;

  // --- MOTIVATIONS & COMPLICATIONS ---
  const comps = character.complications || [];
  md += `## Motivations & Complications\n\n`;
  if (comps.length === 0) {
    md += `*No complications defined.*\n\n`;
  } else {
    const motivations = comps.filter(isMotivation);
    const complications = comps.filter(c => !isMotivation(c));

    if (motivations.length > 0) {
      md += `### Motivations\n`;
      motivations.forEach(m => {
        md += `- **${m.name}:** ${m.desc || 'No description provided.'}\n`;
      });
      md += `\n`;
    }

    if (complications.length > 0) {
      md += `### Complications\n`;
      complications.forEach(c => {
        const typeLabel = c.type && c.type !== 'Complication' ? ` (${c.type})` : '';
        md += `- **${c.name}${typeLabel}:** ${c.desc || 'No description provided.'}\n`;
      });
      md += `\n`;
    }
  }

  // --- BACKGROUND & NOTES ---
  if (character.notes && character.notes.trim()) {
    md += `---\n\n`;
    md += `## Background Story, Tactics & Notes\n\n`;
    md += `> ${character.notes.replace(/\n/g, '\n> ')}\n\n`;
  }

  return md;
}

/**
 * Builds clean, comprehensive BBCode summary for classic forums (Myth-Weavers, RPG boards).
 */
export function buildBBCodeSheet(character, heroStore) {
  const pl = character.powerLevel || 10;
  const name = character.name || 'Hero Name';
  const identity = character.identity || 'Secret Alter Ego';
  const isSecret = character.isSecretIdentity !== false;
  const identityType = isSecret ? 'Secret Identity' : 'Public Identity';
  const player = character.player || 'None';
  const affiliation = character.groupAffiliation || 'None';
  const baseOfOps = character.baseOfOperations || 'Freedom City';
  const heroPoints = character.heroPoints ?? 1;

  // Power Points Accounting
  const abilitiesCost = heroStore?.abilitiesCost ?? Object.values(character.abilities || {}).reduce((sum, v) => sum + (Number(v) || 0) * 2, 0);
  const defensesCost = heroStore?.defensesCost ?? Object.entries(character.defensesBought || {}).reduce((sum, [k, v]) => k !== 'TOUGHNESS' ? sum + (Number(v) || 0) : sum, 0);
  const totalSkillRanks = (character.skills || []).reduce((sum, s) => sum + (Number(s.ranks ?? s.rank) || 0), 0);
  const skillsCost = heroStore?.skillsCost ?? Math.ceil(totalSkillRanks / 2);
  const advantagesCost = heroStore?.advantagesCost ?? (character.advantages || []).reduce((sum, a) => sum + (Number(a.ranks ?? a.rank ?? 1) || 1), 0);
  const powersCost = heroStore?.powersCost ?? (character.powers || []).reduce((sum, p) => sum + (calculatePowerTotalCost(p) || 0), 0);
  const totalSpent = heroStore?.totalSpentPP ?? (abilitiesCost + defensesCost + skillsCost + advantagesCost + powersCost);
  const totalBudget = heroStore?.totalBudgetPP ?? (pl * 15);
  const remaining = heroStore?.remainingPP ?? (totalBudget - totalSpent);

  // Effective Abilities
  const effAbilities = heroStore?.effectiveAbilities ?? (character.abilities || {});
  const activeTraits = heroStore?.activeEnhancedTraits || { abilities: {}, defenses: {}, skills: {}, advantages: {} };

  let bb = `[size=6][b]${name.toUpperCase()}[/b][/size] [size=4][b](PL ${pl})[/b][/size]\n\n`;

  // --- HEADER & IDENTITY ---
  bb += `[b]Real Identity:[/b] ${identity} (${identityType})\n`;
  bb += `[b]Player:[/b] ${player} | [b]Group Affiliation:[/b] ${affiliation} | [b]Base of Operations:[/b] ${baseOfOps}\n`;

  const demographics = [];
  if (character.gender) demographics.push(`[b]Gender:[/b] ${character.gender}`);
  if (character.age) demographics.push(`[b]Age:[/b] ${character.age}`);
  if (character.height) demographics.push(`[b]Height:[/b] ${character.height}`);
  if (character.weight) demographics.push(`[b]Weight:[/b] ${character.weight}`);
  if (character.eyes) demographics.push(`[b]Eyes:[/b] ${character.eyes}`);
  if (character.hair) demographics.push(`[b]Hair:[/b] ${character.hair}`);
  if (demographics.length > 0) {
    bb += `${demographics.join(' | ')}\n`;
  }
  bb += `[b]Hero Points:[/b] ${heroPoints}\n\n`;
  bb += `[hr]\n\n`;

  // --- POWER POINT ACCOUNTING ---
  bb += `[b][size=4][color=#2563eb]■ POWER POINT SUMMARY[/color][/size][/b]\n`;
  bb += `• [b]Abilities:[/b] ${abilitiesCost} PP\n`;
  bb += `• [b]Defenses:[/b] ${defensesCost} PP\n`;
  bb += `• [b]Skills:[/b] ${skillsCost} PP (${totalSkillRanks} ranks)\n`;
  bb += `• [b]Advantages:[/b] ${advantagesCost} PP\n`;
  bb += `• [b]Powers:[/b] ${powersCost} PP\n`;
  bb += `[b]TOTAL SPENT:[/b] [b]${totalSpent} / ${totalBudget} PP[/b] [i](${remaining} PP Remaining)[/i]\n\n`;
  bb += `[hr]\n\n`;

  // --- 8 ABILITIES ---
  bb += `[b][size=4][color=#2563eb]■ ABILITIES (${abilitiesCost} PP)[/color][/size][/b]\n`;
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

  const ablLines = ablDefs.map(abl => {
    const isAbsent = heroStore?.isAbilityAbsent ? heroStore.isAbilityAbsent(abl.code) : ((character.absentAbilities || []).includes(abl.code));
    if (isAbsent) {
      return `[b]${abl.code}:[/b] — (Absent, -10 PP)`;
    }
    const baseRank = Number(character.abilities?.[abl.code] || 0);
    const enhRank = Number(activeTraits.abilities?.[abl.code] || 0);
    const totalScore = effAbilities[abl.code] ?? (baseRank + enhRank);
    const enhStr = enhRank > 0 ? ` (+${enhRank} enhanced)` : '';
    return `[b]${abl.code}:[/b] ${totalScore} (${formatMod(totalScore)})${enhStr}`;
  });

  bb += `${ablLines.slice(0, 4).join(' | ')}\n`;
  bb += `${ablLines.slice(4).join(' | ')}\n\n`;
  bb += `[hr]\n\n`;

  // --- DEFENSES ---
  const shieldBonus = heroStore?.equipmentShieldBonus || 0;
  const armorBonus = heroStore?.equipmentArmorBonus || 0;
  const powerProt = heroStore?.protectionBonus || 0;
  const defRoll = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Defensive Roll') : 0;

  const dodgeBought = character.defensesBought?.DODGE || 0;
  const dodgeTotal = heroStore?.getDefenseTotal('DODGE') ?? ((effAbilities.AGL || 0) + dodgeBought + shieldBonus);

  const parryBought = character.defensesBought?.PARRY || 0;
  const parryTotal = heroStore?.getDefenseTotal('PARRY') ?? ((effAbilities.FGT || 0) + parryBought + shieldBonus);

  const fortBought = character.defensesBought?.FORTITUDE || 0;
  const fortTotal = heroStore?.getDefenseTotal('FORTITUDE') ?? ((effAbilities.STA || 0) + fortBought);
  const isFortAbsent = fortTotal === null || (character.absentAbilities || []).includes('STA');

  const toughBought = character.defensesBought?.TOUGHNESS || 0;
  const toughTotal = heroStore?.getDefenseTotal('TOUGHNESS') ?? ((effAbilities.STA || 0) + toughBought + armorBonus + powerProt + defRoll);
  const toughBonusParts = [];
  if (armorBonus > 0) toughBonusParts.push(`Armor +${armorBonus}`);
  if (powerProt > 0) toughBonusParts.push(`Protection +${powerProt}`);
  if (defRoll > 0) toughBonusParts.push(`Def. Roll +${defRoll}`);
  const toughBonusText = toughBonusParts.length > 0 ? ` (${toughBonusParts.join(', ')})` : '';

  const willBought = character.defensesBought?.WILL || 0;
  const willTotal = heroStore?.getDefenseTotal('WILL') ?? ((effAbilities.AWE || 0) + willBought);

  bb += `[b][size=4][color=#2563eb]■ DEFENSES (${defensesCost} PP)[/color][/size][/b]\n`;
  bb += `• [b]Dodge:[/b] ${dodgeTotal} (Base AGL ${effAbilities.AGL || 0} + Bought ${dodgeBought}${shieldBonus > 0 ? ` + Shield ${shieldBonus}` : ''})\n`;
  bb += `• [b]Parry:[/b] ${parryTotal} (Base FGT ${effAbilities.FGT || 0} + Bought ${parryBought}${shieldBonus > 0 ? ` + Shield ${shieldBonus}` : ''})\n`;
  if (isFortAbsent) {
    bb += `• [b]Fortitude:[/b] — (Absent STA / Immune to Fortitude Effects)\n`;
  } else {
    bb += `• [b]Fortitude:[/b] ${fortTotal} (Base STA ${effAbilities.STA || 0} + Bought ${fortBought})\n`;
  }
  bb += `• [b]Toughness:[/b] ${toughTotal} (Base STA ${effAbilities.STA || 0}${toughBonusText})\n`;
  bb += `• [b]Will:[/b] ${willTotal} (Base AWE ${effAbilities.AWE || 0} + Bought ${willBought})\n\n`;
  bb += `[hr]\n\n`;

  // --- OFFENSE, INITIATIVE & MOVEMENT ---
  const initBonus = heroStore?.initiativeTotal ?? (heroStore?.getDefenseBase('INITIATIVE') ?? (effAbilities.AGL || 0));
  const initAdvRanks = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Improved Initiative') : 0;
  const movementList = getMovementModes(character);

  bb += `[b][size=4][color=#2563eb]■ COMBAT OFFENSE & MOVEMENT[/color][/size][/b]\n`;
  bb += `[b]Initiative:[/b] +${initBonus} (AGL ${formatMod(effAbilities.AGL || 0)}${initAdvRanks > 0 ? `, Improved Initiative +${initAdvRanks * 4}` : ''})\n`;
  bb += `[b]Movement Modes:[/b]\n`;
  movementList.forEach(m => {
    bb += `• ${m.name}: ${m.speed}\n`;
  });
  bb += `\n`;

  // Attacks Matrix
  let attacksList = heroStore?.targetedAttacks || [];
  if (attacksList.length === 0) {
    attacksList = compileTargetedAttacks(character, effAbilities, (name) => heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks(name) : 0);
  }

  if (attacksList.length > 0) {
    bb += `[b][u]Attacks Matrix:[/u][/b]\n`;
    attacksList.forEach(atk => {
      const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto' || atk.rollBonus === null;
      const bonusStr = isAuto ? 'Auto-hit' : (Number(atk.rollBonus) >= 0 ? `+${atk.rollBonus} to hit` : `${atk.rollBonus} to hit`);
      const effectDesc = `${atk.effectName || 'Damage'} ${atk.effectRank ?? atk.rank ?? 0}`;
      const descStr = atk.descriptor ? `(${atk.descriptor})` : '';
      const dcStr = atk.dc ? `DC ${atk.dc} vs ${atk.resistance || 'Toughness'}` : '';
      const rangeCrit = `${atk.range || 'Close'}, Crit ${atk.crit || 20}`;
      bb += `• [b]${atk.name}:[/b] ${bonusStr} • ${effectDesc} ${descStr} • ${dcStr} • ${rangeCrit}\n`;
    });
    bb += `\n`;
  }
  bb += `[hr]\n\n`;

  // --- POWERS & DEVICES ---
  const powers = character.powers || [];
  bb += `[b][size=4][color=#2563eb]■ POWERS & DEVICES (${powersCost} PP)[/color][/size][/b]\n`;
  if (powers.length === 0) {
    bb += `[i]No powers purchased.[/i]\n\n`;
  } else {
    powers.forEach((p, pIdx) => {
      const cost = calculatePowerTotalCost(p);
      const descriptors = Array.isArray(p.descriptors) && p.descriptors.length
        ? ` [Descriptors: ${p.descriptors.join(', ')}]`
        : (p.descriptors ? ` [Descriptors: ${p.descriptors}]` : '');

      if (p.type === 'device') {
        const isEasily = p.deviceConfig?.type === 'easily_removable';
        const devType = isEasily ? 'Easily Removable Device' : 'Removable Device';
        bb += `• [b]${p.name || 'Device'}[/b] (${cost} PP) - [i]${devType}[/i]${descriptors}\n`;
        const subPowers = p.devicePowers || [];
        subPowers.forEach(sp => {
          const eff = sp.effect || sp;
          bb += `  - [b]${sp.name || eff.baseEffect}:[/b] ${formatEffectDetails(eff)}\n`;
          if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
            sp.linkedEffects.forEach(le => {
              bb += `    * [i]Linked:[/i] [b]${le.name || le.baseEffect}:[/b] ${formatEffectDetails(le.effect || le)}\n`;
            });
          }
          if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
            sp.alternateEffects.forEach(alt => {
              const altCost = alt.cost || 1;
              bb += `    * [i]Alternate Effect:[/i] [b]${alt.name || alt.baseEffect}:[/b] ${formatEffectDetails(alt.effect || alt)} (${altCost} PP)\n`;
            });
          }
        });
      } else if (p.type === 'compound') {
        bb += `• [b]${p.name || 'Compound Power'}[/b] (${cost} PP) - [i]Compound Suite[/i]${descriptors}\n`;
        const compEffects = p.compoundEffects || [];
        compEffects.forEach(cp => {
          const eff = cp.effect || cp;
          bb += `  - [b]${cp.name || eff.baseEffect}:[/b] ${formatEffectDetails(eff)}\n`;
        });
      } else {
        const eff = p.mainEffect || p;
        bb += `• [b]${p.name || eff.baseEffect || 'Power'}[/b] (${cost} PP): ${formatEffectDetails(eff)}${descriptors}\n`;

        if (p.activation && p.activation !== 'none') {
          bb += `  - [i]Activation:[/i] ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}\n`;
        }

        if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
          p.linkedEffects.forEach(link => {
            bb += `  - [i]Linked Effect:[/i] [b]${link.name || link.baseEffect}:[/b] ${formatEffectDetails(link.effect || link)}\n`;
          });
        }

        if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
          p.alternateEffects.forEach(alt => {
            const altCost = alt.cost || 1;
            bb += `  - [i]Alternate Effect:[/i] [b]${alt.name || alt.baseEffect}:[/b] ${formatEffectDetails(alt.effect || alt)} (${altCost} PP)\n`;
          });
        }
      }
      if (p.description || p.notes) {
        bb += `  [i]${p.description || p.notes}[/i]\n`;
      }
    });
    bb += `\n`;
  }
  bb += `[hr]\n\n`;

  // --- ADVANTAGES ---
  const advs = heroStore?.effectiveAdvantages ?? (character.advantages || []);
  bb += `[b][size=4][color=#2563eb]■ ADVANTAGES (${advantagesCost} PP)[/color][/size][/b]\n`;
  if (advs.length === 0) {
    bb += `[i]No advantages purchased.[/i]\n\n`;
  } else {
    advs.forEach(a => {
      const rnk = a.ranks || 1;
      const rnkStr = rnk > 1 ? ` ${rnk}` : '';
      const title = a.displayName || (a.specification ? `${a.name} (${a.specification})` : a.name);
      const notes = a.isPowerGranted
        ? ' [i](Enhanced from Power)[/i]'
        : (a.hasPowerBonus ? ` [i](Base ${a.naturalRanks} + ${a.enhancedRanks} from Power)[/i]` : '');
      bb += `• [b]${title}${rnkStr}[/b]${notes}\n`;
    });
    bb += `\n`;
  }
  bb += `[hr]\n\n`;

  // --- SKILLS (ALL SKILLS) ---
  const allSkills = getAllCharacterSkills(character, heroStore);
  bb += `[b][size=4][color=#2563eb]■ SKILLS (${skillsCost} PP, ${totalSkillRanks} Ranks Purchased)[/color][/size][/b]\n`;
  allSkills.forEach(sk => {
    const statusStr = sk.isTrained ? 'Trained' : 'Untrained';
    const rankPart = sk.ranks > 0 ? `${sk.ranks} Ranks` : '0 Ranks';
    const enhPart = sk.enhBonus > 0 ? ` + ${sk.enhBonus} Enhanced` : '';
    bb += `• [b]${sk.displayName} (${sk.abilityCode}):[/b] ${formatMod(sk.totalBonus)} [i](${sk.abilityCode} ${formatMod(sk.abilityMod)} + ${rankPart}${enhPart} - ${statusStr})[/i]\n`;
  });
  bb += `\n[hr]\n\n`;

  // --- EQUIPMENT, VEHICLES & HEADQUARTERS ---
  const resources = character.resources || [];
  const totalEP = heroStore?.totalEP ?? resources.reduce((sum, r) => sum + (Number(r.epCost ?? r.cost) || 0), 0);
  const maxEP = (heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Equipment') : 0) * 5;

  bb += `[b][size=4][color=#2563eb]■ EQUIPMENT, VEHICLES & HEADQUARTERS (${totalEP} / ${maxEP} EP)[/color][/size][/b]\n`;
  if (resources.length === 0) {
    bb += `[i]No equipment, vehicles, or headquarters registered.[/i]\n\n`;
  } else {
    bb += `[i]Budget: ${totalEP} EP spent of ${maxEP} EP maximum from Equipment Advantage[/i]\n`;
    resources.forEach(r => {
      const cost = r.epCost ?? r.cost ?? 1;
      const statusStr = r.status ? `[${r.status}]` : '';
      const subStr = r.subtype ? `(${r.subtype})` : `(${r.type || 'Gear'})`;
      bb += `• [b]${r.name}[/b] ${subStr} (${cost} EP) ${statusStr}${r.desc ? ` - ${r.desc}` : ''}\n`;
    });
    bb += `\n`;
  }
  bb += `[hr]\n\n`;

  // --- MOTIVATIONS & COMPLICATIONS ---
  const comps = character.complications || [];
  bb += `[b][size=4][color=#2563eb]■ MOTIVATIONS & COMPLICATIONS[/color][/size][/b]\n`;
  if (comps.length === 0) {
    bb += `[i]No complications defined.[/i]\n\n`;
  } else {
    const motivations = comps.filter(isMotivation);
    const complications = comps.filter(c => !isMotivation(c));

    if (motivations.length > 0) {
      bb += `[b][u]Motivations:[/u][/b]\n`;
      motivations.forEach(m => {
        bb += `• [b]Motivation (${m.name}):[/b] ${m.desc || 'No description provided.'}\n`;
      });
      bb += `\n`;
    }

    if (complications.length > 0) {
      bb += `[b][u]Complications:[/u][/b]\n`;
      complications.forEach(c => {
        bb += `• [b]${c.type || 'Complication'} (${c.name}):[/b] ${c.desc || 'No description provided.'}\n`;
      });
      bb += `\n`;
    }
  }

  // --- BACKGROUND & NOTES ---
  if (character.notes && character.notes.trim()) {
    bb += `[hr]\n\n`;
    bb += `[b][size=4][color=#2563eb]■ CHARACTER BACKGROUND & NOTES[/color][/size][/b]\n`;
    bb += `[quote]\n${character.notes}\n[/quote]\n\n`;
  }

  return bb;
}

/**
 * Builds clean, comprehensive Plain Text character sheet without formatting tags.
 */
export function buildPlainTextSheet(character, heroStore) {
  const pl = character.powerLevel || 10;
  const name = character.name || 'Hero Name';
  const identity = character.identity || 'Secret Alter Ego';
  const isSecret = character.isSecretIdentity !== false;
  const identityType = isSecret ? 'Secret Identity' : 'Public Identity';
  const player = character.player || 'None';
  const affiliation = character.groupAffiliation || 'None';
  const baseOfOps = character.baseOfOperations || 'Freedom City';
  const heroPoints = character.heroPoints ?? 1;

  // Power Points Accounting
  const abilitiesCost = heroStore?.abilitiesCost ?? Object.values(character.abilities || {}).reduce((sum, v) => sum + (Number(v) || 0) * 2, 0);
  const defensesCost = heroStore?.defensesCost ?? Object.entries(character.defensesBought || {}).reduce((sum, [k, v]) => k !== 'TOUGHNESS' ? sum + (Number(v) || 0) : sum, 0);
  const totalSkillRanks = (character.skills || []).reduce((sum, s) => sum + (Number(s.ranks ?? s.rank) || 0), 0);
  const skillsCost = heroStore?.skillsCost ?? Math.ceil(totalSkillRanks / 2);
  const advantagesCost = heroStore?.advantagesCost ?? (character.advantages || []).reduce((sum, a) => sum + (Number(a.ranks ?? a.rank ?? 1) || 1), 0);
  const powersCost = heroStore?.powersCost ?? (character.powers || []).reduce((sum, p) => sum + (calculatePowerTotalCost(p) || 0), 0);
  const totalSpent = heroStore?.totalSpentPP ?? (abilitiesCost + defensesCost + skillsCost + advantagesCost + powersCost);
  const totalBudget = heroStore?.totalBudgetPP ?? (pl * 15);
  const remaining = heroStore?.remainingPP ?? (totalBudget - totalSpent);

  // Effective Abilities
  const effAbilities = heroStore?.effectiveAbilities ?? (character.abilities || {});
  const activeTraits = heroStore?.activeEnhancedTraits || { abilities: {}, defenses: {}, skills: {}, advantages: {} };

  const divider = '================================================================================';
  const subDivider = '--------------------------------------------------------------------------------';

  let txt = `${divider}\n`;
  txt += `${name.toUpperCase()} (POWER LEVEL ${pl})\n`;
  txt += `${divider}\n`;
  txt += `Real Identity: ${identity} (${identityType})\n`;
  txt += `Player: ${player} | Group Affiliation: ${affiliation} | Base of Operations: ${baseOfOps}\n`;

  const demographics = [];
  if (character.gender) demographics.push(`Gender: ${character.gender}`);
  if (character.age) demographics.push(`Age: ${character.age}`);
  if (character.height) demographics.push(`Height: ${character.height}`);
  if (character.weight) demographics.push(`Weight: ${character.weight}`);
  if (character.eyes) demographics.push(`Eyes: ${character.eyes}`);
  if (character.hair) demographics.push(`Hair: ${character.hair}`);
  if (demographics.length > 0) {
    txt += `${demographics.join(' | ')}\n`;
  }
  txt += `Hero Points: ${heroPoints}\n\n`;

  // --- POWER POINT ACCOUNTING ---
  txt += `${subDivider}\n`;
  txt += `POWER POINT ACCOUNTING\n`;
  txt += `${subDivider}\n`;
  txt += `Abilities:   ${String(abilitiesCost).padStart(3)} PP\n`;
  txt += `Defenses:    ${String(defensesCost).padStart(3)} PP\n`;
  txt += `Skills:      ${String(skillsCost).padStart(3)} PP (${totalSkillRanks} ranks)\n`;
  txt += `Advantages:  ${String(advantagesCost).padStart(3)} PP\n`;
  txt += `Powers:      ${String(powersCost).padStart(3)} PP\n`;
  txt += `${subDivider}\n`;
  txt += `TOTAL SPENT: ${totalSpent} / ${totalBudget} PP (${remaining} PP Remaining)\n\n`;

  // --- 8 ABILITIES ---
  txt += `${subDivider}\n`;
  txt += `ABILITIES (${abilitiesCost} PP)\n`;
  txt += `${subDivider}\n`;
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

  const ablSummary = ablDefs.map(abl => {
    const isAbsent = heroStore?.isAbilityAbsent ? heroStore.isAbilityAbsent(abl.code) : ((character.absentAbilities || []).includes(abl.code));
    if (isAbsent) {
      return `${abl.code}: — (Absent)`;
    }
    const totalScore = effAbilities[abl.code] ?? (Number(character.abilities?.[abl.code] || 0) + Number(activeTraits.abilities?.[abl.code] || 0));
    return `${abl.code}: ${totalScore} (${formatMod(totalScore)})`;
  });
  txt += `${ablSummary.slice(0, 4).join('   ')}\n`;
  txt += `${ablSummary.slice(4).join('   ')}\n\n`;

  txt += `Base Scores & Costs:\n`;
  ablDefs.forEach(abl => {
    const isAbsent = heroStore?.isAbilityAbsent ? heroStore.isAbilityAbsent(abl.code) : ((character.absentAbilities || []).includes(abl.code));
    if (isAbsent) {
      txt += `- ${abl.name.padEnd(12)} (${abl.code}): Absent -> -10 PP\n`;
      return;
    }
    const baseRank = Number(character.abilities?.[abl.code] || 0);
    const enhRank = Number(activeTraits.abilities?.[abl.code] || 0);
    const cost = baseRank * 2;
    const enhStr = enhRank > 0 ? ` (+${enhRank} Enhanced)` : '';
    txt += `- ${abl.name.padEnd(12)} (${abl.code}): Base ${baseRank}${enhStr} -> ${cost} PP\n`;
  });
  txt += `\n`;

  // --- DEFENSES ---
  const shieldBonus = heroStore?.equipmentShieldBonus || 0;
  const armorBonus = heroStore?.equipmentArmorBonus || 0;
  const powerProt = heroStore?.protectionBonus || 0;
  const defRoll = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Defensive Roll') : 0;

  const dodgeBought = character.defensesBought?.DODGE || 0;
  const dodgeTotal = heroStore?.getDefenseTotal('DODGE') ?? ((effAbilities.AGL || 0) + dodgeBought + shieldBonus);

  const parryBought = character.defensesBought?.PARRY || 0;
  const parryTotal = heroStore?.getDefenseTotal('PARRY') ?? ((effAbilities.FGT || 0) + parryBought + shieldBonus);

  const fortBought = character.defensesBought?.FORTITUDE || 0;
  const fortTotal = heroStore?.getDefenseTotal('FORTITUDE') ?? ((effAbilities.STA || 0) + fortBought);
  const isFortAbsent = fortTotal === null || (character.absentAbilities || []).includes('STA');

  const toughBought = character.defensesBought?.TOUGHNESS || 0;
  const toughTotal = heroStore?.getDefenseTotal('TOUGHNESS') ?? ((effAbilities.STA || 0) + toughBought + armorBonus + powerProt + defRoll);
  const toughBonusParts = [];
  if (armorBonus > 0) toughBonusParts.push(`Armor +${armorBonus}`);
  if (powerProt > 0) toughBonusParts.push(`Protection +${powerProt}`);
  if (defRoll > 0) toughBonusParts.push(`Def. Roll +${defRoll}`);
  const toughBonusText = toughBonusParts.length > 0 ? ` (${toughBonusParts.join(', ')})` : '';

  const willBought = character.defensesBought?.WILL || 0;
  const willTotal = heroStore?.getDefenseTotal('WILL') ?? ((effAbilities.AWE || 0) + willBought);

  txt += `${subDivider}\n`;
  txt += `DEFENSES (${defensesCost} PP)\n`;
  txt += `${subDivider}\n`;
  txt += `Dodge:     ${String(dodgeTotal).padStart(2)}  (Base AGL ${effAbilities.AGL || 0} + Bought ${dodgeBought}${shieldBonus > 0 ? ` + Shield ${shieldBonus}` : ''})\n`;
  txt += `Parry:     ${String(parryTotal).padStart(2)}  (Base FGT ${effAbilities.FGT || 0} + Bought ${parryBought}${shieldBonus > 0 ? ` + Shield ${shieldBonus}` : ''})\n`;
  if (isFortAbsent) {
    txt += `Fortitude:  —  (Absent STA / Immune to Fortitude Effects)\n`;
  } else {
    txt += `Fortitude: ${String(fortTotal).padStart(2)}  (Base STA ${effAbilities.STA || 0} + Bought ${fortBought})\n`;
  }
  txt += `Toughness: ${String(toughTotal).padStart(2)}  (Base STA ${effAbilities.STA || 0}${toughBonusText})\n`;
  txt += `Will:      ${String(willTotal).padStart(2)}  (Base AWE ${effAbilities.AWE || 0} + Bought ${willBought})\n\n`;

  // --- OFFENSE, INITIATIVE & MOVEMENT ---
  const initBonus = heroStore?.initiativeTotal ?? (heroStore?.getDefenseBase('INITIATIVE') ?? (effAbilities.AGL || 0));
  const initAdvRanks = heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Improved Initiative') : 0;
  const movementList = getMovementModes(character);

  txt += `${subDivider}\n`;
  txt += `COMBAT OFFENSE & MOVEMENT\n`;
  txt += `${subDivider}\n`;
  txt += `Initiative: +${initBonus} (AGL ${formatMod(effAbilities.AGL || 0)}${initAdvRanks > 0 ? `, Improved Initiative +${initAdvRanks * 4}` : ''})\n\n`;
  txt += `Movement Modes:\n`;
  movementList.forEach(m => {
    txt += `- ${m.name}: ${m.speed}\n`;
  });
  txt += `\n`;

  // Attacks Matrix
  let attacksList = heroStore?.targetedAttacks || [];
  if (attacksList.length === 0) {
    attacksList = compileTargetedAttacks(character, effAbilities, (name) => heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks(name) : 0);
  }

  if (attacksList.length > 0) {
    txt += `Attacks Matrix:\n`;
    attacksList.forEach(atk => {
      const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto' || atk.rollBonus === null;
      const bonusStr = isAuto ? 'Auto-hit' : `${formatMod(atk.rollBonus)} to hit`;
      const effectDesc = `${atk.effectName || 'Damage'} ${atk.effectRank ?? atk.rank ?? 0}`;
      const descStr = atk.descriptor ? `(${atk.descriptor})` : '';
      const dcStr = atk.dc ? `DC ${atk.dc} vs ${atk.resistance || 'Toughness'}` : '-';
      const rangeCrit = `${atk.range || 'Close'}, Crit ${atk.crit || 20}`;
      txt += `- ${atk.name}: ${bonusStr} | ${effectDesc} ${descStr} | ${dcStr} | ${rangeCrit}\n`;
    });
    txt += `\n`;
  }

  // --- POWERS & DEVICES ---
  const powers = character.powers || [];
  txt += `${subDivider}\n`;
  txt += `POWERS & DEVICES (${powersCost} PP)\n`;
  txt += `${subDivider}\n`;
  if (powers.length === 0) {
    txt += `No powers purchased.\n\n`;
  } else {
    powers.forEach((p, pIdx) => {
      const cost = calculatePowerTotalCost(p);
      const descriptors = Array.isArray(p.descriptors) && p.descriptors.length
        ? ` [Descriptors: ${p.descriptors.join(', ')}]`
        : (p.descriptors ? ` [Descriptors: ${p.descriptors}]` : '');

      if (p.type === 'device') {
        const isEasily = p.deviceConfig?.type === 'easily_removable';
        const devType = isEasily ? 'Easily Removable Device' : 'Removable Device';
        txt += `${pIdx + 1}. ${p.name || 'Device'} (${cost} PP) - ${devType}${descriptors}\n`;
        const subPowers = p.devicePowers || [];
        subPowers.forEach(sp => {
          const eff = sp.effect || sp;
          txt += `   - ${sp.name || eff.baseEffect}: ${formatEffectDetails(eff)}\n`;
          if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
            sp.linkedEffects.forEach(le => {
              txt += `     * Linked: ${le.name || le.baseEffect}: ${formatEffectDetails(le.effect || le)}\n`;
            });
          }
          if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
            sp.alternateEffects.forEach(alt => {
              const altCost = alt.cost || 1;
              txt += `     * Alternate Effect: ${alt.name || alt.baseEffect}: ${formatEffectDetails(alt.effect || alt)} (${altCost} PP)\n`;
            });
          }
        });
      } else if (p.type === 'compound') {
        txt += `${pIdx + 1}. ${p.name || 'Compound Power'} (${cost} PP) - Compound Suite${descriptors}\n`;
        const compEffects = p.compoundEffects || [];
        compEffects.forEach(cp => {
          const eff = cp.effect || cp;
          txt += `   - ${cp.name || eff.baseEffect}: ${formatEffectDetails(eff)}\n`;
        });
      } else {
        const eff = p.mainEffect || p;
        txt += `${pIdx + 1}. ${p.name || eff.baseEffect || 'Power'} (${cost} PP): ${formatEffectDetails(eff)}${descriptors}\n`;

        if (p.activation && p.activation !== 'none') {
          txt += `   - Activation: ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}\n`;
        }

        if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
          p.linkedEffects.forEach(link => {
            txt += `   - Linked Effect: ${link.name || link.baseEffect}: ${formatEffectDetails(link.effect || link)}\n`;
          });
        }

        if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
          p.alternateEffects.forEach(alt => {
            const altCost = alt.cost || 1;
            txt += `   - Alternate Effect: ${alt.name || alt.baseEffect}: ${formatEffectDetails(alt.effect || alt)} (${altCost} PP)\n`;
          });
        }
      }
      if (p.description || p.notes) {
        txt += `   Notes: ${p.description || p.notes}\n`;
      }
      txt += `\n`;
    });
  }

  // --- ADVANTAGES ---
  const advs = heroStore?.effectiveAdvantages ?? (character.advantages || []);
  txt += `${subDivider}\n`;
  txt += `ADVANTAGES (${advantagesCost} PP)\n`;
  txt += `${subDivider}\n`;
  if (advs.length === 0) {
    txt += `No advantages purchased.\n\n`;
  } else {
    advs.forEach(a => {
      const rnk = a.ranks || 1;
      const rnkStr = rnk > 1 ? ` ${rnk}` : '';
      const title = a.displayName || (a.specification ? `${a.name} (${a.specification})` : a.name);
      const notes = a.isPowerGranted
        ? ' (Enhanced from Power)'
        : (a.hasPowerBonus ? ` (Base ${a.naturalRanks} + ${a.enhancedRanks} from Power)` : '');
      txt += `- ${title}${rnkStr}${notes}\n`;
    });
    txt += `\n`;
  }

  // --- SKILLS (ALL SKILLS) ---
  const allSkills = getAllCharacterSkills(character, heroStore);
  txt += `${subDivider}\n`;
  txt += `SKILLS (${skillsCost} PP, ${totalSkillRanks} Ranks Purchased)\n`;
  txt += `${subDivider}\n`;
  txt += `Skill Name                   Key  Bonus  Breakdown                      Status\n`;
  txt += `--------------------------------------------------------------------------------\n`;
  allSkills.forEach(sk => {
    const statusStr = sk.isTrained ? 'Trained' : 'Untrained';
    const rankPart = sk.ranks > 0 ? `+ ${sk.ranks} Ranks` : '+ 0 Ranks';
    const enhPart = sk.enhBonus > 0 ? ` + ${sk.enhBonus} Enh` : '';
    const breakdown = `${sk.abilityCode} (${formatMod(sk.abilityMod)}) ${rankPart}${enhPart}`;
    const nameCol = sk.displayName.padEnd(28).slice(0, 28);
    const keyCol = sk.abilityCode.padEnd(4);
    const bonusCol = formatMod(sk.totalBonus).padStart(5);
    const breakdownCol = breakdown.padEnd(30).slice(0, 30);
    txt += `${nameCol} ${keyCol} ${bonusCol}  ${breakdownCol} ${statusStr}\n`;
  });
  txt += `\n`;

  // --- EQUIPMENT, VEHICLES & HEADQUARTERS ---
  const resources = character.resources || [];
  const totalEP = heroStore?.totalEP ?? resources.reduce((sum, r) => sum + (Number(r.epCost ?? r.cost) || 0), 0);
  const maxEP = (heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks('Equipment') : 0) * 5;

  txt += `${subDivider}\n`;
  txt += `EQUIPMENT, VEHICLES & HEADQUARTERS (${totalEP} / ${maxEP} EP)\n`;
  txt += `${subDivider}\n`;
  if (resources.length === 0) {
    txt += `No equipment, vehicles, or headquarters registered.\n\n`;
  } else {
    txt += `Budget: ${totalEP} EP spent of ${maxEP} EP maximum from Equipment Advantage\n\n`;
    resources.forEach(r => {
      const cost = r.epCost ?? r.cost ?? 1;
      const statusStr = r.status ? `[${r.status}]` : '';
      const subStr = r.subtype ? `(${r.subtype})` : `(${r.type || 'Gear'})`;
      txt += `- ${r.name} ${subStr} (${cost} EP) ${statusStr}${r.desc ? ` - ${r.desc}` : ''}\n`;
    });
    txt += `\n`;
  }

  // --- MOTIVATIONS & COMPLICATIONS ---
  const comps = character.complications || [];
  txt += `${subDivider}\n`;
  txt += `MOTIVATIONS & COMPLICATIONS\n`;
  txt += `${subDivider}\n`;
  if (comps.length === 0) {
    txt += `No complications defined.\n\n`;
  } else {
    const motivations = comps.filter(isMotivation);
    const complications = comps.filter(c => !isMotivation(c));

    if (motivations.length > 0) {
      txt += `Motivations:\n`;
      motivations.forEach(m => {
        txt += `- ${m.name}: ${m.desc || 'No description provided.'}\n`;
      });
      txt += `\n`;
    }

    if (complications.length > 0) {
      txt += `Complications:\n`;
      complications.forEach(c => {
        const typeLabel = c.type && c.type !== 'Complication' ? ` (${c.type})` : '';
        txt += `- ${c.name}${typeLabel}: ${c.desc || 'No description provided.'}\n`;
      });
      txt += `\n`;
    }
  }

  // --- BACKGROUND & NOTES ---
  if (character.notes && character.notes.trim()) {
    txt += `${subDivider}\n`;
    txt += `BACKGROUND STORY, TACTICS & NOTES\n`;
    txt += `${subDivider}\n`;
    txt += `${character.notes}\n\n`;
  }

  txt += `${divider}\n`;
  return txt;
}

