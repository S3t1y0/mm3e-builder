import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { isMotivation } from '../../rules/complications.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';
import {
  formatMod,
  getAllCharacterSkills,
  getMovementModes,
  formatEffectDetails,
  formatEffectRulesMarkdown
} from './helpers.js';

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

  let md = `# ${name.toUpperCase()} (PL ${pl})\n\n`;
  md += `**Real Identity:** ${identity} (${identityType})  \n`;
  md += `**Player:** ${player} | **Group Affiliation:** ${affiliation} | **Base of Operations:** ${baseOfOps}  \n`;
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
      md += `| **${abl.name} (${abl.code})** | **-** | **-** | Absent | - | -10 PP |\n`;
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
            md += formatEffectRulesMarkdown(eff, '  ');
            if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
              sp.linkedEffects.forEach(le => {
                const leEff = le.effect || le;
                md += `  - *Linked:* **${le.name || leEff.baseEffect}:** ${formatEffectDetails(leEff)}\n`;
                md += formatEffectRulesMarkdown(leEff, '    ');
              });
            }
            if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
              sp.alternateEffects.forEach(alt => {
                const altEff = alt.effect || alt;
                const altCost = alt.cost || 1;
                md += `  - *Alternate Effect (Slot):* **${alt.name || altEff.baseEffect}:** ${formatEffectDetails(altEff)} (${altCost} PP)\n`;
                md += formatEffectRulesMarkdown(altEff, '    ');
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
          md += formatEffectRulesMarkdown(eff, '  ');
        });
        if (Array.isArray(p.sharedModifiers) && p.sharedModifiers.length > 0) {
          const sharedEff = { extras: p.sharedModifiers, flaws: [] };
          md += formatEffectRulesMarkdown(sharedEff, '  ');
        }
      } else {
        const eff = p.mainEffect || p;
        md += `### ${pIdx + 1}. **${p.name || eff.baseEffect || 'Power'}** (${cost} PP)\n`;
        md += `- **Effect:** ${formatEffectDetails(eff)}${descriptors}\n`;
        md += formatEffectRulesMarkdown(eff, '  ');

        if (p.activation && p.activation !== 'none') {
          md += `- *Activation:* ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}\n`;
        }

        if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
          p.linkedEffects.forEach(link => {
            const linkEff = link.effect || link;
            md += `- *Linked Effect:* **${link.name || linkEff.baseEffect}:** ${formatEffectDetails(linkEff)}\n`;
            md += formatEffectRulesMarkdown(linkEff, '  ');
          });
        }

        if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
          p.alternateEffects.forEach(alt => {
            const altEff = alt.effect || alt;
            const altCost = alt.cost || 1;
            md += `- *Alternate Effect (Slot):* **${alt.name || altEff.baseEffect}:** ${formatEffectDetails(altEff)} (${altCost} PP)\n`;
            md += formatEffectRulesMarkdown(altEff, '  ');
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
  if (character.notes && character.notes.trim()) {
    md += `---\n\n`;
    md += `## Background Story, Tactics & Notes\n\n`;
    md += `> ${character.notes.replace(/\n/g, '\n> ')}\n\n`;
  }

  return md;
}
