import { compileExportData, formatMod } from './helpers.js';

/**
 * Builds clean, comprehensive BBCode summary for classic forums (Myth-Weavers, RPG boards)
 * adhering to the Official M&M 3E Deluxe Rulebook section order, customizable via granular options.
 *
 * @param {Object} character - Character object
 * @param {Object} heroStore - Store instance
 * @param {Object} options - Granular export options or { mode: 'compact' | 'exhaustive' }
 * @returns {String} Formatted BBCode character sheet
 */
export function buildBBCodeSheet(character, heroStore, options = {}) {
  const data = compileExportData(character, heroStore, options);
  const opts = data.options;

  let bb = `[size=6][b]${data.identity.name.toUpperCase()}[/b][/size] [size=4][b](PL ${data.identity.powerLevel})[/b][/size]\n\n`;
  bb += `[b]Real Identity:[/b] ${data.identity.realIdentity} (${data.identity.identityType})\n`;
  bb += `[b]Player:[/b] ${data.identity.player} | [b]Group Affiliation:[/b] ${data.identity.affiliation} | [b]Base of Operations:[/b] ${data.identity.baseOfOperations}\n`;

  if (data.identity.demographics.length > 0) {
    bb += `${data.identity.demographics.map(d => `[b]${d.label}:[/b] ${d.value}`).join(' | ')}\n`;
  }
  bb += `[b]Hero Points:[/b] ${data.identity.heroPoints}\n\n`;
  bb += `[hr]\n\n`;

  bb += `[b][size=4][color=#2563eb]■ POWER POINT ACCOUNTING[/color][/size][/b]\n`;
  bb += `• [b]Abilities:[/b] ${data.ppAccounting.abilitiesCost} PP\n`;
  bb += `• [b]Defenses:[/b] ${data.ppAccounting.defensesCost} PP\n`;
  bb += `• [b]Skills:[/b] ${data.ppAccounting.skillsCost} PP (${data.ppAccounting.totalSkillRanks} ranks)\n`;
  bb += `• [b]Advantages:[/b] ${data.ppAccounting.advantagesCost} PP\n`;
  bb += `• [b]Powers:[/b] ${data.ppAccounting.powersCost} PP\n`;
  bb += `[b]TOTAL SPENT:[/b] [b]${data.ppAccounting.totalSpent} / ${data.ppAccounting.totalBudget} PP[/b] [i](${data.ppAccounting.remaining} PP Remaining)[/i]\n\n`;
  bb += `[hr]\n\n`;

  if (opts.showAbilities) {
    bb += `[b][size=4][color=#2563eb]■ ABILITIES (${data.ppAccounting.abilitiesCost} PP)[/color][/size][/b]\n`;
    const ablLines = data.abilities.map(abl => {
      if (abl.isAbsent) {
        return `[b]${abl.code}:[/b] - [i](Absent, -10 PP)[/i]`;
      }
      const enhStr = abl.enhRank > 0 ? ` (+${abl.enhRank} enhanced)` : '';
      return `[b]${abl.code}:[/b] ${abl.score} (${abl.mod})${enhStr}`;
    });
    bb += `${ablLines.slice(0, 4).join(' | ')}\n`;
    bb += `${ablLines.slice(4).join(' | ')}\n\n`;
    bb += `[hr]\n\n`;
  }

  if (opts.showDefenses) {
    bb += `[b][size=4][color=#2563eb]■ DEFENSES (${data.ppAccounting.defensesCost} PP)[/color][/size][/b]\n`;
    data.defenses.forEach(def => {
      const boughtStr = def.bought > 0 ? ` (+${def.bought} bought)` : '';
      bb += `• [b]${def.name}:[/b] [b]${def.totalDisplay}[/b] | Base: ${def.baseAbility}${boughtStr} | [i]${def.notes}[/i]\n`;
    });
    bb += `\n[hr]\n\n`;
  }

  if (opts.showOffense) {
    bb += `[b][size=4][color=#2563eb]■ COMBAT OFFENSE & INITIATIVE[/color][/size][/b]\n`;
    bb += `• [b]Initiative:[/b] ${data.offense.initiative.total} [i](${data.offense.initiative.notes})[/i]\n\n`;
    if (data.offense.attacks.length > 0) {
      bb += `[b]Attacks Matrix:[/b]\n`;
      data.offense.attacks.forEach(atk => {
        bb += `• [b]${atk.name}:[/b] Bonus ${atk.bonusStr} | ${atk.effectDesc} | ${atk.dcStr} | ${atk.rangeCrit} | [i]${atk.descStr}[/i]\n`;
      });
      bb += `\n`;
    }
    bb += `[hr]\n\n`;
  }

  if (opts.showAdvantages) {
    bb += `[b][size=4][color=#2563eb]■ ADVANTAGES (${data.ppAccounting.advantagesCost} PP)[/color][/size][/b]\n`;
    if (data.advantages.length === 0) {
      bb += `[i]No advantages purchased.[/i]\n\n`;
    } else {
      bb += `${data.advantages.map(a => `[b]${a.label}[/b]`).join(', ')}\n\n`;
    }
    bb += `[hr]\n\n`;
  }

  if (opts.showSkills) {
    const modeLabel = opts.skillsMode === 'trained' ? 'TRAINED SKILLS' : 'SKILLS';
    bb += `[b][size=4][color=#2563eb]■ ${modeLabel} (${data.ppAccounting.skillsCost} PP / ${data.ppAccounting.totalSkillRanks} RANKS)[/color][/size][/b]\n`;
    if (data.skills.length === 0) {
      bb += `[i]No trained skills registered.[/i]\n\n`;
    } else {
      data.skills.forEach(sk => {
        const totalBonusStr = sk.isAbsent ? '-' : formatMod(sk.totalBonus);
        const ablStr = sk.isAbsent ? `${sk.abilityCode} (-)` : `${sk.abilityCode} (${formatMod(sk.abilityMod)})`;
        const rankStr = sk.ranks > 0 ? `${sk.ranks} ranks` : 'untrained';
        const enhStr = sk.enhBonus > 0 ? ` (+${sk.enhBonus} enh)` : '';
        bb += `• [b]${sk.displayName}:[/b] ${totalBonusStr} [i](${rankStr}, ${ablStr}${enhStr})[/i]\n`;
      });
      bb += `\n`;
    }
    bb += `[hr]\n\n`;
  }

  if (opts.showPowers) {
    bb += `[b][size=4][color=#2563eb]■ POWERS & DEVICES (${data.ppAccounting.powersCost} PP)[/color][/size][/b]\n`;
    if (data.powers.length === 0) {
      bb += `[i]No powers purchased.[/i]\n\n`;
    } else {
      data.powers.forEach((p, idx) => {
        const badgeStr = p.structureBadge ? ` [color=#4b5563](${p.structureBadge})[/color]` : '';
        const descStr = p.descriptorsText ? ` [i]${p.descriptorsText}[/i]` : '';
        bb += `[b]${idx + 1}. ${p.title}[/b] [b][color=#16a34a][${p.totalCost} PP][/color][/b]${badgeStr}${descStr}\n`;

        const showMech = opts.powerMechanics;
        const showEffRules = opts.effectRules;
        const showModRules = opts.modifierRules;

        if (showEffRules || showModRules) {
          if (p.mainLine) bb += `  • [b]Effect:[/b] ${p.mainLine}\n`;
          if (showMech && p.mechanicsLine) bb += `  • [b]Mechanics:[/b] ${p.mechanicsLine}\n`;
          if (p.modifiersLine) bb += `  • [b]Modifiers:[/b] ${p.modifiersLine}\n`;
          if (p.specialConfigLine) bb += `  • [b]Configuration:[/b] ${p.specialConfigLine}\n`;
          if (showEffRules && p.effectRuleDescs && p.effectRuleDescs.length > 0) {
            p.effectRuleDescs.forEach(r => bb += `  • [i]Rule:[/i] ${r}\n`);
          }
          if (showModRules && p.modifierRules && p.modifierRules.length > 0) {
            p.modifierRules.forEach(m => bb += `  • [i]Modifier (${m.name}):[/i] ${m.desc}\n`);
          }
          if (p.subEntries && p.subEntries.length > 0) {
            p.subEntries.forEach(sub => {
              const prefix = sub.isLinked ? '    • ' : '  • ';
              const ruleIndent = sub.isLinked ? '        - ' : '      - ';
              bb += `${prefix}[b]${sub.label}:[/b] ${sub.details || sub.effectName} [color=#16a34a][${sub.costBadge}][/color]\n`;
              if (showMech && sub.mechanics) bb += `${ruleIndent}Mechanics: ${sub.mechanics}\n`;
              if (showEffRules && sub.effectRuleDescs && sub.effectRuleDescs.length > 0) {
                sub.effectRuleDescs.forEach(r => bb += `${ruleIndent}[i]Rule:[/i] ${r}\n`);
              }
              if (showModRules && sub.modifierRules && sub.modifierRules.length > 0) {
                sub.modifierRules.forEach(m => bb += `${ruleIndent}[i]Modifier (${m.name}):[/i] ${m.desc}\n`);
              }
            });
          }
        } else {
          if (p.subEntries && p.subEntries.length > 0) {
            if (showMech && p.mechanicsLine) bb += `  [i]${p.mechanicsLine}[/i]\n`;
            p.subEntries.forEach(sub => {
              const prefix = sub.isLinked ? '    • ' : '  • ';
              bb += `${prefix}[b]${sub.label}:[/b] ${sub.details || sub.effectName} [color=#16a34a][${sub.costBadge}][/color]\n`;
            });
          } else {
            const parts = [
              p.mainLine,
              p.specialConfigLine,
              showMech ? p.mechanicsLine : null,
              p.modifiersLine
            ].filter(Boolean);
            if (parts.length > 0) bb += `  • ${parts.join(' • ')}\n`;
          }
        }
        bb += `\n`;
      });
    }
  }

  // Movement Modes
  if (opts.showMovement && data.movement.length > 0) {
    bb += `[b]Movement Modes:[/b]\n`;
    data.movement.forEach(m => {
      bb += `• [b]${m.name}:[/b] ${m.speed}\n`;
    });
    bb += `\n`;
  }
  bb += `[hr]\n\n`;

  if (opts.showEquipment) {
    bb += `[b][size=4][color=#2563eb]■ EQUIPMENT, VEHICLES & HEADQUARTERS (${data.equipment.totalEP} / ${data.equipment.maxEP} EP)[/color][/size][/b]\n`;
    if (data.equipment.resources.length === 0) {
      bb += `[i]No equipment, vehicles, or headquarters registered.[/i]\n\n`;
    } else {
      data.equipment.resources.forEach(r => {
        const cost = r.epCost ?? r.cost ?? 1;
        const subStr = r.subtype ? `(${r.subtype})` : `(${r.type || 'Gear'})`;
        const statusStr = r.status ? ` [Status: ${r.status}]` : '';
        const descStr = r.desc ? ` - ${r.desc}` : '';
        bb += `• [b]${r.name}[/b] ${subStr} (${cost} EP)${statusStr}${descStr}\n`;
      });
      bb += `\n`;
    }
    bb += `[hr]\n\n`;
  }

  if (opts.showComplications) {
    bb += `[b][size=4][color=#2563eb]■ MOTIVATIONS & COMPLICATIONS[/color][/size][/b]\n`;
    if (data.complications.all.length === 0) {
      bb += `[i]No complications defined.[/i]\n\n`;
    } else {
      if (data.complications.motivations.length > 0) {
        bb += `[b]Motivations:[/b]\n`;
        data.complications.motivations.forEach(m => {
          bb += `• [b]${m.name}:[/b] ${m.desc || 'No description provided.'}\n`;
        });
        bb += `\n`;
      }
      if (data.complications.complications.length > 0) {
        bb += `[b]Complications:[/b]\n`;
        data.complications.complications.forEach(c => {
          const typeLabel = c.type && c.type !== 'Complication' ? ` (${c.type})` : '';
          bb += `• [b]${c.name}${typeLabel}:[/b] ${c.desc || 'No description provided.'}\n`;
        });
        bb += `\n`;
      }
    }
  }

  if (opts.showNotes && data.notes && data.notes.trim()) {
    bb += `[hr]\n\n`;
    bb += `[b][size=4][color=#2563eb]■ BACKGROUND STORY, TACTICS & NOTES[/color][/size][/b]\n`;
    bb += `[quote]${data.notes.trim()}[/quote]\n\n`;
  }

  return bb;
}
