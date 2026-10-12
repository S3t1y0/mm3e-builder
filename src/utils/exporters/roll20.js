import { formatMod, getAllCharacterSkills } from './helpers.js';

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
