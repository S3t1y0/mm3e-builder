import { formatMod, getAllCharacterSkills } from './helpers.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';

/**
 * Extracts individual effect units from all power container types (Standard, Device, Compound, Array).
 */
function extractAllPowerEffects(powers) {
  const list = [];
  (powers || []).forEach(p => {
    const pName = p.name || 'Power';
    if (p.type === 'device' && Array.isArray(p.devicePowers)) {
      p.devicePowers.forEach(sp => {
        const eff = sp.effect || sp;
        list.push({ eff, powerName: sp.name ? `${pName}: ${sp.name}` : pName });
      });
    } else if (p.type === 'compound' && Array.isArray(p.compoundEffects)) {
      p.compoundEffects.forEach(cp => {
        const eff = cp.effect || cp;
        list.push({ eff, powerName: cp.name ? `${pName}: ${cp.name}` : pName });
      });
    } else if (p.type === 'array' || (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0)) {
      const mainEff = p.mainEffect || p;
      list.push({ eff: mainEff, powerName: pName });
      (p.alternateEffects || []).forEach(alt => {
        const altEff = alt.effect || alt;
        list.push({ eff: altEff, powerName: `${pName} (${alt.name || altEff.baseEffect})` });
      });
    } else {
      const eff = p.mainEffect || p;
      list.push({ eff, powerName: pName });
    }
  });
  return list;
}

/**
 * Generates comprehensive Roll20 macros for character abilities, defenses, attacks, skills, and active powers.
 *
 * @param {Object} character - Character object
 * @param {Object} heroStore - Store instance
 * @returns {Array<Object>} List of macro objects
 */
export function generateRoll20Macros(character, heroStore) {
  const name = character.name || 'Hero';
  const macros = [];

  // 1. Initiative Check
  const effAbilities = heroStore?.effectiveAbilities ?? (character.abilities || {});
  const initBonus = heroStore?.initiativeTotal ?? (heroStore?.getDefenseBase('INITIATIVE') ?? (effAbilities.AGL || 0));
  macros.push({
    category: 'Initiative',
    title: 'Initiative Check',
    command: `&{template:default} {{name=${name} - Initiative}} {{Roll=[[1d20+${initBonus} &{tracker}]]}}`,
    simpleCommand: `/roll 1d20+${initBonus} &{tracker}`
  });

  // 2. 8 Abilities
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
    const score = effAbilities[abl.code] ?? (character.abilities?.[abl.code] || 0);
    const modStr = score >= 0 ? `+${score}` : `${score}`;
    macros.push({
      category: 'Abilities',
      title: `${abl.label} Check`,
      command: `&{template:default} {{name=${name} - ${abl.label} Check}} {{Roll=[[1d20${modStr}]]}}`,
      simpleCommand: `/roll 1d20${modStr}`
    });
  });

  // 3. 5 Defenses
  const defenses = [
    { code: 'DODGE', label: 'Dodge Defense' },
    { code: 'PARRY', label: 'Parry Defense' },
    { code: 'TOUGHNESS', label: 'Toughness Resistance' },
    { code: 'FORTITUDE', label: 'Fortitude Resistance' },
    { code: 'WILL', label: 'Will Resistance' }
  ];

  defenses.forEach(def => {
    const total = heroStore?.getDefenseTotal ? heroStore.getDefenseTotal(def.code) : null;
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

  // 4. Skills (All 16 Skills + Specialties)
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

  // 5. Targeted Attacks
  let attacks = heroStore?.targetedAttacks || [];
  if (attacks.length === 0) {
    attacks = compileTargetedAttacks(character, effAbilities, (n) => heroStore?.getAdvantageRanks ? heroStore.getAdvantageRanks(n) : 0);
  }

  attacks.forEach(atk => {
    const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto' || atk.rollBonus === null;
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

  // 6. Active Powers (Healing, Affliction condition stages, Deflect, Nullify, Movement)
  const powerEffects = extractAllPowerEffects(character.powers || []);
  const seenPowerTitles = new Set();

  powerEffects.forEach(({ eff, powerName }) => {
    if (!eff) return;
    const base = (eff.baseEffect || eff.name || '').trim().toLowerCase();
    const ranks = Number(eff.ranks ?? eff.rank ?? 1) || 1;

    // Healing Check
    if (base === 'healing') {
      const title = `${powerName} (Healing Check)`;
      if (!seenPowerTitles.has(title)) {
        seenPowerTitles.add(title);
        macros.push({
          category: 'Powers',
          title,
          command: `&{template:default} {{name=${name} - ${powerName}}} {{Healing Check=[[1d20+${ranks}]]}} {{DC=DC 10}} {{Result=Restores 1 Damage Condition per Degree}}`,
          simpleCommand: `/roll 1d20+${ranks} # Healing Check (${powerName})`
        });
      }
    }

    // Affliction Condition Stages
    if (base === 'affliction') {
      const title = `${powerName} (Affliction Save)`;
      if (!seenPowerTitles.has(title)) {
        seenPowerTitles.add(title);
        const dc = 10 + ranks;
        const res = eff.resistance || 'Fortitude';
        const cond1 = eff.config?.condition1 || 'Dazed';
        const cond2 = eff.config?.condition2 || 'Stunned';
        const cond3 = eff.config?.condition3 || 'Incapacitated';
        macros.push({
          category: 'Powers',
          title,
          command: `&{template:default} {{name=${name} - ${powerName}}} {{Save Required=DC ${dc} vs ${res}}} {{1st Degree=${cond1}}} {{2nd Degree=${cond2}}} {{3rd Degree=${cond3}}}`,
          simpleCommand: `/em uses ${powerName}: DC ${dc} vs ${res} (1st: ${cond1}, 2nd: ${cond2}, 3rd: ${cond3})`
        });
      }
    }

    // Deflect Defense
    if (base === 'deflect') {
      const title = `${powerName} (Deflect Check)`;
      if (!seenPowerTitles.has(title)) {
        seenPowerTitles.add(title);
        macros.push({
          category: 'Powers',
          title,
          command: `&{template:default} {{name=${name} - ${powerName}}} {{Deflect Check=[[1d20+${ranks}]]}} {{Result=Replaces Active Defense (Roll 1-10 counts as 11)}}`,
          simpleCommand: `/roll 1d20+${ranks} # Deflect Check (${powerName})`
        });
      }
    }

    // Nullify Opposed Check
    if (base === 'nullify') {
      const title = `${powerName} (Nullify Check)`;
      if (!seenPowerTitles.has(title)) {
        seenPowerTitles.add(title);
        macros.push({
          category: 'Powers',
          title,
          command: `&{template:default} {{name=${name} - ${powerName}}} {{Nullify Check=[[1d20+${ranks}]]}} {{Opposed Check=Target resists with Will or Rank}}`,
          simpleCommand: `/roll 1d20+${ranks} # Nullify Check (${powerName})`
        });
      }
    }

    // Movement Powers Activation
    if (['flight', 'speed', 'teleport', 'burrowing', 'swimming'].includes(base)) {
      const title = `${powerName} (Activate Movement)`;
      if (!seenPowerTitles.has(title)) {
        seenPowerTitles.add(title);
        const modeLabel = base.charAt(0).toUpperCase() + base.slice(1);
        macros.push({
          category: 'Powers',
          title,
          command: `&{template:default} {{name=${name} - ${powerName}}} {{Mode=${modeLabel}}} {{Speed Rank=Rank ${ranks}}} {{Action=Move Action}}`,
          simpleCommand: `/em activates ${powerName} (${modeLabel} Rank ${ranks}).`
        });
      }
    }
  });

  return macros;
}
