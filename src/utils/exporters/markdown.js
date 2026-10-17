import { compileExportData, formatMod } from './helpers.js';

/**
 * Builds clean, comprehensive Markdown character sheet adhering to the
 * Official M&M 3E Deluxe Rulebook section order, customizable via granular options.
 *
 * @param {Object} character - Character object
 * @param {Object} heroStore - Store instance
 * @param {Object} options - Granular export options or { mode: 'compact' | 'exhaustive' }
 * @returns {String} Formatted Markdown character sheet
 */
export function buildMarkdownSheet(character, heroStore, options = {}) {
  const data = compileExportData(character, heroStore, options);
  const opts = data.options;

  let md = `# ${data.identity.name.toUpperCase()} (PL ${data.identity.powerLevel})\n\n`;
  md += `**Real Identity:** ${data.identity.realIdentity} (${data.identity.identityType})  \n`;
  md += `**Player:** ${data.identity.player} | **Group Affiliation:** ${data.identity.affiliation} | **Base of Operations:** ${data.identity.baseOfOperations}  \n`;

  if (data.identity.demographics.length > 0) {
    md += `${data.identity.demographics.map(d => `**${d.label}:** ${d.value}`).join(' | ')}  \n`;
  }
  md += `**Hero Points:** ${data.identity.heroPoints}\n\n`;
  md += `---\n\n`;

  md += `## Power Point Summary\n\n`;
  md += `| Category | Cost |\n`;
  md += `|:---|---:|\n`;
  md += `| **Abilities** | ${data.ppAccounting.abilitiesCost} PP |\n`;
  md += `| **Defenses** | ${data.ppAccounting.defensesCost} PP |\n`;
  md += `| **Skills** | ${data.ppAccounting.skillsCost} PP (${data.ppAccounting.totalSkillRanks} ranks) |\n`;
  md += `| **Advantages** | ${data.ppAccounting.advantagesCost} PP |\n`;
  md += `| **Powers** | ${data.ppAccounting.powersCost} PP |\n`;
  md += `| **TOTAL SPENT** | **${data.ppAccounting.totalSpent} / ${data.ppAccounting.totalBudget} PP** |\n`;
  md += `| **REMAINING** | **${data.ppAccounting.remaining} PP** |\n\n`;
  md += `---\n\n`;

  if (opts.showAbilities) {
    md += `## Abilities (${data.ppAccounting.abilitiesCost} PP)\n\n`;
    md += `| Ability | Score | Mod | Base Rank | Enhanced Rank | Cost |\n`;
    md += `|:---|:---:|:---:|:---:|:---:|---:|\n`;
    data.abilities.forEach(abl => {
      if (abl.isAbsent) {
        md += `| **${abl.name} (${abl.code})** | **-** | **-** | Absent | - | -10 PP |\n`;
      } else {
        const enhStr = abl.enhRank > 0 ? `+${abl.enhRank}` : '-';
        md += `| **${abl.name} (${abl.code})** | ${abl.score} | ${abl.mod} | ${abl.baseRank} | ${enhStr} | ${abl.cost} PP |\n`;
      }
    });
    md += `\n---\n\n`;
  }

  if (opts.showDefenses) {
    md += `## Defenses (${data.ppAccounting.defensesCost} PP)\n\n`;
    md += `| Defense | Total | Base Ability | Bought Ranks | Notes / Bonuses |\n`;
    md += `|:---|:---:|:---|:---:|:---|\n`;
    data.defenses.forEach(def => {
      const boughtStr = def.bought > 0 ? `+${def.bought}` : '-';
      md += `| **${def.name}** | **${def.totalDisplay}** | ${def.baseAbility} | ${boughtStr} | ${def.notes} |\n`;
    });
    md += `\n---\n\n`;
  }

  if (opts.showOffense) {
    md += `## Combat Offense & Initiative\n\n`;
    md += `- **Initiative:** ${data.offense.initiative.total} (${data.offense.initiative.notes})\n\n`;
    if (data.offense.attacks.length > 0) {
      md += `### Attacks Matrix\n\n`;
      md += `| Attack Name | Roll / Bonus | Effect & Rank | Descriptor | DC & Resistance | Range & Crit |\n`;
      md += `|:---|:---:|:---|:---|:---:|:---:|\n`;
      data.offense.attacks.forEach(atk => {
        md += `| **${atk.name}** | ${atk.bonusStr} | ${atk.effectDesc} | ${atk.descStr} | ${atk.dcStr} | ${atk.rangeCrit} |\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  }

  if (opts.showAdvantages) {
    md += `## Advantages (${data.ppAccounting.advantagesCost} PP)\n\n`;
    if (data.advantages.length === 0) {
      md += `*No advantages purchased.*\n\n`;
    } else {
      md += `${data.advantages.map(a => `**${a.label}**`).join(', ')}\n\n`;
    }
    md += `---\n\n`;
  }

  if (opts.showSkills) {
    const modeLabel = opts.skillsMode === 'trained' ? 'Trained Skills' : 'Skills';
    md += `## ${modeLabel} (${data.ppAccounting.skillsCost} PP / ${data.ppAccounting.totalSkillRanks} Ranks)\n\n`;
    if (data.skills.length === 0) {
      md += `*No trained skills registered.*\n\n`;
    } else {
      md += `| Skill Name | Total Bonus | Ranks | Base Ability | Enhanced Bonus |\n`;
      md += `|:---|:---:|:---:|:---|:---:|\n`;
      data.skills.forEach(sk => {
        const totalBonusStr = sk.isAbsent ? '-' : formatMod(sk.totalBonus);
        const ablStr = sk.isAbsent ? `${sk.abilityCode} (-)` : `${sk.abilityCode} (${formatMod(sk.abilityMod)})`;
        const enhStr = sk.enhBonus > 0 ? `+${sk.enhBonus}` : '-';
        md += `| **${sk.displayName}** | **${totalBonusStr}** | ${sk.ranks} | ${ablStr} | ${enhStr} |\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  }

  if (opts.showPowers) {
    md += `## Powers & Devices (${data.ppAccounting.powersCost} PP)\n\n`;
    if (data.powers.length === 0) {
      md += `*No powers purchased.*\n\n`;
    } else {
      data.powers.forEach((p, idx) => {
        const badgeStr = p.structureBadge ? ` *(${p.structureBadge})*` : '';
        const descStr = p.descriptorsText ? ` [${p.descriptorsText}]` : '';
        md += `### ${idx + 1}. ${p.title} (${p.totalCost} PP)${badgeStr}${descStr}\n\n`;

        const showMech = opts.powerMechanics;
        const showEffRules = opts.effectRules;
        const showModRules = opts.modifierRules;

        if (showEffRules || showModRules) {
          if (p.mainLine) md += `- **Effect:** ${p.mainLine}\n`;
          if (showMech && p.mechanicsLine) md += `- **Mechanics:** ${p.mechanicsLine}\n`;
          if (p.modifiersLine) md += `- **Modifiers:** ${p.modifiersLine}\n`;
          if (p.specialConfigLine) md += `- **Configuration:** ${p.specialConfigLine}\n`;
          if (showEffRules && p.effectRuleDescs && p.effectRuleDescs.length > 0) {
            p.effectRuleDescs.forEach(r => md += `- *Rule Reference:* ${r}\n`);
          }
          if (showModRules && p.modifierRules && p.modifierRules.length > 0) {
            p.modifierRules.forEach(m => md += `- *Modifier (${m.name}):* ${m.desc}\n`);
          }
          if (p.subEntries && p.subEntries.length > 0) {
            p.subEntries.forEach(sub => {
              const indent = sub.isLinked ? '  ' : '';
              md += `${indent}- **${sub.label}:** ${sub.details || sub.effectName} *(${sub.costBadge})*\n`;
              if (showMech && sub.mechanics) md += `${indent}  - Mechanics: ${sub.mechanics}\n`;
              if (showEffRules && sub.effectRuleDescs && sub.effectRuleDescs.length > 0) {
                sub.effectRuleDescs.forEach(r => md += `${indent}  - *Rule Reference:* ${r}\n`);
              }
              if (showModRules && sub.modifierRules && sub.modifierRules.length > 0) {
                sub.modifierRules.forEach(m => md += `${indent}  - *Modifier (${m.name}):* ${m.desc}\n`);
              }
            });
          }
        } else {
          if (p.subEntries && p.subEntries.length > 0) {
            if (showMech && p.mechanicsLine) md += `*${p.mechanicsLine}*\n\n`;
            p.subEntries.forEach(sub => {
              const indent = sub.isLinked ? '  ' : '';
              md += `${indent}- **${sub.label}:** ${sub.details || sub.effectName} *(${sub.costBadge})*\n`;
            });
          } else {
            const parts = [
              p.mainLine,
              p.specialConfigLine,
              showMech ? p.mechanicsLine : null,
              p.modifiersLine
            ].filter(Boolean);
            if (parts.length > 0) md += `- ${parts.join(' • ')}\n`;
          }
        }
        md += `\n`;
      });
    }
  }

  // Movement Modes
  if (opts.showMovement && data.movement.length > 0) {
    md += `### Movement Modes\n\n`;
    data.movement.forEach(m => {
      md += `- **${m.name}:** ${m.speed}\n`;
    });
    md += `\n`;
  }
  md += `---\n\n`;

  if (opts.showEquipment) {
    md += `## Equipment, Vehicles & Headquarters (${data.equipment.totalEP} / ${data.equipment.maxEP} EP)\n\n`;
    if (!data.equipment.categories || data.equipment.categories.length === 0) {
      md += `*No equipment, vehicles, or headquarters registered.*\n\n`;
    } else {
      data.equipment.categories.forEach(cat => {
        md += `### ${cat.label} (${cat.totalEP} EP)\n\n`;
        cat.items.forEach(r => {
          const statusStr = r.statusLabel ? ` [Status: ${r.statusLabel}]` : '';
          md += `- **${r.name}** (${r.subtypeLabel}) (${r.cost} EP)${statusStr}\n`;
          if (r.tacticalSummary) {
            md += `  - *Stats:* ${r.tacticalSummary}\n`;
          }
          if (r.desc) {
            md += `  - *Description:* ${r.desc}\n`;
          }
        });
        md += `\n`;
      });
    }
    md += `---\n\n`;
  }

  if (opts.showComplications) {
    md += `## Motivations & Complications\n\n`;
    if (data.complications.all.length === 0) {
      md += `*No complications defined.*\n\n`;
    } else {
      if (data.complications.motivations.length > 0) {
        md += `### Motivations\n\n`;
        data.complications.motivations.forEach(m => {
          md += `- **${m.name}:** ${m.desc || 'No description provided.'}\n`;
        });
        md += `\n`;
      }
      if (data.complications.complications.length > 0) {
        md += `### Complications\n\n`;
        data.complications.complications.forEach(c => {
          const typeLabel = c.type && c.type !== 'Complication' ? ` (${c.type})` : '';
          md += `- **${c.name}${typeLabel}:** ${c.desc || 'No description provided.'}\n`;
        });
        md += `\n`;
      }
    }
  }

  if (opts.showNotes && data.notes && data.notes.trim()) {
    md += `---\n\n`;
    md += `## Background Story, Tactics & Notes\n\n`;
    md += `> ${data.notes.trim().replace(/\n/g, '\n> ')}\n\n`;
  }

  return md;
}
