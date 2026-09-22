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

/**
 * Generates Roll20 macros for character abilities, defenses, and attacks.
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
    const modStr = total >= 0 ? `+${total}` : `${total}`;
    macros.push({
      category: 'Defenses',
      title: `${def.label}`,
      command: `&{template:default} {{name=${name} - ${def.label}}} {{Save Roll=[[1d20${modStr}]]}}`,
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
 * Builds clean Markdown summary of the character.
 */
export function buildMarkdownSheet(character, heroStore) {
  const pl = character.powerLevel || 10;
  const name = character.name || 'Hero Name';
  const identity = character.identity || 'Classified';
  const spent = heroStore.totalSpentPP;
  const budget = heroStore.totalBudgetPP;

  let md = `# ${name} (PL ${pl})\n\n`;
  md += `**Real Identity:** ${identity} | **Player:** ${character.player || 'Unknown'} | **Power Points:** ${spent} / ${budget} PP\n\n`;
  if (character.notes) {
    md += `> ${character.notes.replace(/\n/g, '\n> ')}\n\n`;
  }

  // Abilities Table
  md += `### Abilities (${heroStore.abilitiesCost} PP)\n`;
  md += `| STR | STA | AGL | DEX | FGT | INT | AWE | PRE |\n`;
  md += `|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
  const abl = heroStore.effectiveAbilities;
  md += `| ${abl.STR} | ${abl.STA} | ${abl.AGL} | ${abl.DEX} | ${abl.FGT} | ${abl.INT} | ${abl.AWE} | ${abl.PRE} |\n\n`;

  // Defenses Table
  md += `### Defenses (${heroStore.defensesCost} PP)\n`;
  md += `- **Dodge:** ${heroStore.getDefenseTotal('DODGE')} (Base ${heroStore.getDefenseBase('DODGE')} + Bought ${character.defensesBought?.DODGE || 0})\n`;
  md += `- **Parry:** ${heroStore.getDefenseTotal('PARRY')} (Base ${heroStore.getDefenseBase('PARRY')} + Bought ${character.defensesBought?.PARRY || 0})\n`;
  md += `- **Fortitude:** ${heroStore.getDefenseTotal('FORTITUDE')} (Base ${heroStore.getDefenseBase('FORTITUDE')} + Bought ${character.defensesBought?.FORTITUDE || 0})\n`;
  md += `- **Toughness:** ${heroStore.getDefenseTotal('TOUGHNESS')} (Base ${heroStore.getDefenseBase('TOUGHNESS')} + Armor/Traits)\n`;
  md += `- **Will:** ${heroStore.getDefenseTotal('WILL')} (Base ${heroStore.getDefenseBase('WILL')} + Bought ${character.defensesBought?.WILL || 0})\n`;
  md += `- **Initiative:** +${heroStore.getDefenseBase('INITIATIVE')}\n\n`;

  // Targeted Attacks
  const attacksList = heroStore.targetedAttacks || [];
  if (attacksList.length > 0) {
    md += `### Combat Attacks Matrix\n`;
    md += `| Attack | Bonus | Effect / Descriptor | DC & Resistance |\n`;
    md += `|:---|:---:|:---|:---:|\n`;
    attacksList.forEach(atk => {
      const isAuto = atk.isArea || atk.isPerception || atk.rollBonus === 'Auto';
      const bonus = isAuto ? 'Auto' : (Number(atk.rollBonus) >= 0 ? `+${atk.rollBonus}` : `${atk.rollBonus}`);
      md += `| **${atk.name}** | ${bonus} | ${atk.descriptor || atk.effectName || 'Damage'} (Rank ${atk.effectRank || 0}) | DC ${atk.dc || 15} vs ${atk.resistance || 'Toughness'} |\n`;
    });
    md += `\n`;
  }

  // Powers
  const powers = character.powers || [];
  if (powers.length > 0) {
    md += `### Powers (${heroStore.powersCost} PP)\n`;
    powers.forEach(p => {
      const cost = calculatePowerTotalCost(p);
      md += `- **${p.name || p.baseEffect}** (${cost} PP): `;
      if (p.type === 'device') {
        md += `*Device (${p.deviceConfig?.type || 'removable'})* - ${(p.devicePowers || []).map(sp => {
          let spDesc = `${sp.name} [${sp.effect?.baseEffect || 'Effect'} ${sp.effect?.ranks || 1}`;
          if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
            spDesc += sp.linkedEffects.map(le => ` + Linked ${le.name || le.baseEffect} ${le.ranks || 1}`).join('');
          }
          spDesc += ']';
          if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
            spDesc += ` (Array with ${sp.alternateEffects.length} alternate slots)`;
          }
          return spDesc;
        }).join(', ')}`;
      } else {
        const eff = p.mainEffect || p;
        md += `${eff.baseEffect || 'Effect'} ${eff.ranks || 1}`;
        if (p.alternateEffects?.length > 0) {
          md += ` (Array with ${p.alternateEffects.length} alternate slots)`;
        }
      }
      if (p.activation && p.activation !== 'none') {
        md += ` [Activation: ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}]`;
      }
      md += `\n`;
    });
    md += `\n`;
  }

  // Skills
  const skills = (character.skills || []).filter(s => (s.ranks || 0) > 0);
  if (skills.length > 0) {
    md += `### Skills (${heroStore.skillsCost} PP)\n`;
    const skillList = skills.map(s => {
      const sub = s.subtype ? ` (${s.subtype})` : '';
      return `${s.name}${sub} +${s.ranks}`;
    });
    md += `${skillList.join(', ')}\n\n`;
  }

  // Advantages
  const advs = character.advantages || [];
  if (advs.length > 0) {
    md += `### Advantages (${heroStore.advantagesCost} PP)\n`;
    const advList = advs.map(a => `${a.name}${a.ranks > 1 ? ` ${a.ranks}` : ''}`);
    md += `${advList.join(', ')}\n\n`;
  }

  // Motivations & Complications
  const comps = character.complications || [];
  if (comps.length > 0) {
    const motivations = comps.filter(isMotivation);
    const complications = comps.filter(c => !isMotivation(c));

    if (motivations.length > 0) {
      md += `### Motivations\n`;
      motivations.forEach(m => {
        md += `- **${m.name}:** ${m.desc || 'No description'}\n`;
      });
      md += `\n`;
    }

    if (complications.length > 0) {
      md += `### Complications\n`;
      complications.forEach(c => {
        const typeLabel = c.type && c.type !== 'Complication' ? ` (${c.type})` : '';
        md += `- **${c.name}${typeLabel}:** ${c.desc || 'No description'}\n`;
      });
      md += `\n`;
    }
  }

  return md;
}

/**
 * Builds BBCode summary for classic forums (Myth-Weavers, RPG boards).
 */
export function buildBBCodeSheet(character, heroStore) {
  const pl = character.powerLevel || 10;
  const name = character.name || 'Hero Name';
  const identity = character.identity || 'Classified';
  const spent = heroStore.totalSpentPP;
  const budget = heroStore.totalBudgetPP;

  let bb = `[size=5][b]${name}[/b][/size] [b](PL ${pl})[/b]\n`;
  bb += `[b]Real Identity:[/b] ${identity} | [b]Player:[/b] ${character.player || 'Unknown'} | [b]Total Spent:[/b] ${spent} / ${budget} PP\n\n`;

  // Abilities
  const abl = heroStore.effectiveAbilities;
  bb += `[b][color=#2563eb]--- ABILITIES (${heroStore.abilitiesCost} PP) ---[/color][/b]\n`;
  bb += `STR ${abl.STR} | STA ${abl.STA} | AGL ${abl.AGL} | DEX ${abl.DEX} | FGT ${abl.FGT} | INT ${abl.INT} | AWE ${abl.AWE} | PRE ${abl.PRE}\n\n`;

  // Defenses
  bb += `[b][color=#2563eb]--- DEFENSES (${heroStore.defensesCost} PP) ---[/color][/b]\n`;
  bb += `Dodge: ${heroStore.getDefenseTotal('DODGE')} | Parry: ${heroStore.getDefenseTotal('PARRY')} | Fortitude: ${heroStore.getDefenseTotal('FORTITUDE')} | Toughness: ${heroStore.getDefenseTotal('TOUGHNESS')} | Will: ${heroStore.getDefenseTotal('WILL')} | Init: +${heroStore.getDefenseBase('INITIATIVE')}\n\n`;

  // Powers
  const powers = character.powers || [];
  if (powers.length > 0) {
    bb += `[b][color=#2563eb]--- POWERS (${heroStore.powersCost} PP) ---[/color][/b]\n`;
    powers.forEach(p => {
      const cost = calculatePowerTotalCost(p);
      const actStr = (p.activation && p.activation !== 'none')
        ? ` [Activation: ${p.activation === 'move' ? 'Move Action' : 'Standard Action'}]`
        : '';
      bb += `• [b]${p.name || p.baseEffect}[/b] (${cost} PP)${actStr}\n`;
    });
    bb += `\n`;
  }

  // Skills
  const skills = (character.skills || []).filter(s => (s.ranks || 0) > 0);
  if (skills.length > 0) {
    bb += `[b][color=#2563eb]--- SKILLS (${heroStore.skillsCost} PP) ---[/color][/b]\n`;
    bb += skills.map(s => `${s.name}${s.subtype ? ` (${s.subtype})` : ''} +${s.ranks}`).join(', ') + '\n\n';
  }

  // Advantages
  const advs = character.advantages || [];
  if (advs.length > 0) {
    bb += `[b][color=#2563eb]--- ADVANTAGES (${heroStore.advantagesCost} PP) ---[/color][/b]\n`;
    bb += advs.map(a => `${a.name}${a.ranks > 1 ? ` ${a.ranks}` : ''}`).join(', ') + '\n\n';
  }

  // Motivations & Complications
  const comps = character.complications || [];
  if (comps.length > 0) {
    const motivations = comps.filter(isMotivation);
    const complications = comps.filter(c => !isMotivation(c));

    bb += `[b][color=#2563eb]--- MOTIVATIONS & COMPLICATIONS ---[/color][/b]\n`;
    if (motivations.length > 0) {
      motivations.forEach(m => {
        bb += `• [b]Motivation (${m.name}):[/b] ${m.desc || 'No description'}\n`;
      });
    }
    if (complications.length > 0) {
      complications.forEach(c => {
        bb += `• [b]${c.type || 'Complication'} (${c.name}):[/b] ${c.desc || 'No description'}\n`;
      });
    }
    bb += `\n`;
  }

  return bb;
}
