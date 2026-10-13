import { compileExportData, formatMod } from './helpers.js';

/**
 * Builds clean, comprehensive Plain Text character sheet adhering to the
 * Official M&M 3E Deluxe Rulebook section order, customizable via granular options.
 *
 * @param {Object} character - Character object
 * @param {Object} heroStore - Store instance
 * @param {Object} options - Granular export options or { mode: 'compact' | 'exhaustive' }
 * @returns {String} Formatted plain text character sheet
 */
export function buildPlainTextSheet(character, heroStore, options = {}) {
  const data = compileExportData(character, heroStore, options);
  const opts = data.options;

  const divider = '================================================================================';
  const subDivider = '--------------------------------------------------------------------------------';

  let txt = `${divider}\n`;
  txt += `${data.identity.name.toUpperCase()} (POWER LEVEL ${data.identity.powerLevel})\n`;
  txt += `${divider}\n`;
  txt += `Real Identity: ${data.identity.realIdentity} (${data.identity.identityType})\n`;
  txt += `Player: ${data.identity.player} | Group Affiliation: ${data.identity.affiliation} | Base of Operations: ${data.identity.baseOfOperations}\n`;

  if (data.identity.demographics.length > 0) {
    txt += `${data.identity.demographics.map(d => `${d.label}: ${d.value}`).join(' | ')}\n`;
  }
  txt += `Hero Points: ${data.identity.heroPoints}\n\n`;

  // 1. POWER POINT ACCOUNTING
  txt += `${subDivider}\n`;
  txt += `POWER POINT ACCOUNTING\n`;
  txt += `${subDivider}\n`;
  txt += `Abilities:   ${String(data.ppAccounting.abilitiesCost).padStart(3)} PP\n`;
  txt += `Defenses:    ${String(data.ppAccounting.defensesCost).padStart(3)} PP\n`;
  txt += `Skills:      ${String(data.ppAccounting.skillsCost).padStart(3)} PP (${data.ppAccounting.totalSkillRanks} ranks)\n`;
  txt += `Advantages:  ${String(data.ppAccounting.advantagesCost).padStart(3)} PP\n`;
  txt += `Powers:      ${String(data.ppAccounting.powersCost).padStart(3)} PP\n`;
  txt += `${subDivider}\n`;
  txt += `TOTAL SPENT: ${data.ppAccounting.totalSpent} / ${data.ppAccounting.totalBudget} PP (${data.ppAccounting.remaining} PP Remaining)\n\n`;

  // 2. ABILITIES
  if (opts.showAbilities) {
    txt += `${subDivider}\n`;
    txt += `ABILITIES (${data.ppAccounting.abilitiesCost} PP)\n`;
    txt += `${subDivider}\n`;
    txt += `${'Ability'.padEnd(16)}${'Score'.padStart(6)}   ${'Mod'.padStart(4)}   ${'Base'.padStart(6)}   ${'Enhanced'.padStart(8)}   ${'Cost'.padStart(6)}\n`;
    data.abilities.forEach(abl => {
      const ablLabel = `${abl.code} ${abl.name}`.padEnd(16);
      const scoreStr = abl.scoreDisplay.padStart(6);
      const modStr = abl.mod.padStart(4);
      const baseStr = String(abl.baseRank).padStart(6);
      const enhStr = (abl.enhRank > 0 ? `+${abl.enhRank}` : '-').padStart(8);
      const costStr = `${abl.cost} PP`.padStart(6);
      txt += `${ablLabel}${scoreStr}   ${modStr}   ${baseStr}   ${enhStr}   ${costStr}\n`;
    });
    txt += `\n`;
  }

  // 3. DEFENSES
  if (opts.showDefenses) {
    txt += `${subDivider}\n`;
    txt += `DEFENSES (${data.ppAccounting.defensesCost} PP)\n`;
    txt += `${subDivider}\n`;
    txt += `${'Defense'.padEnd(12)}${'Total'.padStart(6)}   ${'Base Ability'.padEnd(16)}${'Bought'.padStart(7)}   Notes / Bonuses\n`;
    data.defenses.forEach(def => {
      const nameStr = def.name.padEnd(12);
      const totalStr = def.totalDisplay.padStart(6);
      const baseStr = def.baseAbility.padEnd(16);
      const boughtStr = (def.bought > 0 ? `+${def.bought}` : '-').padStart(7);
      txt += `${nameStr}${totalStr}   ${baseStr}${boughtStr}   ${def.notes}\n`;
    });
    txt += `\n`;
  }

  // 4. OFFENSE / ATTACKS & INITIATIVE
  if (opts.showOffense) {
    txt += `${subDivider}\n`;
    txt += `OFFENSE & INITIATIVE\n`;
    txt += `${subDivider}\n`;
    txt += `Initiative: ${data.offense.initiative.total} (${data.offense.initiative.notes})\n\n`;
    if (data.offense.attacks.length > 0) {
      txt += `${'Attack Name'.padEnd(24)}${'Bonus'.padStart(6)}   ${'Effect & Rank'.padEnd(20)}${'DC & Resistance'.padEnd(22)}Range & Crit\n`;
      data.offense.attacks.forEach(atk => {
        const atkName = atk.name.padEnd(24);
        const bonus = atk.bonusStr.padStart(6);
        const eff = atk.effectDesc.padEnd(20);
        const dc = atk.dcStr.padEnd(22);
        txt += `${atkName}${bonus}   ${eff}${dc}${atk.rangeCrit}\n`;
      });
      txt += `\n`;
    }
  }

  // 5. ADVANTAGES
  if (opts.showAdvantages) {
    txt += `${subDivider}\n`;
    txt += `ADVANTAGES (${data.ppAccounting.advantagesCost} PP)\n`;
    txt += `${subDivider}\n`;
    if (data.advantages.length === 0) {
      txt += `No advantages purchased.\n\n`;
    } else {
      const advLabels = data.advantages.map(a => a.label);
      let line = '';
      advLabels.forEach((label, idx) => {
        const separator = idx === advLabels.length - 1 ? '' : ', ';
        if ((line + label + separator).length > 78) {
          txt += `${line}\n`;
          line = label + separator;
        } else {
          line += label + separator;
        }
      });
      if (line) txt += `${line}\n`;
      txt += `\n`;
    }
  }

  // 6. SKILLS
  if (opts.showSkills) {
    txt += `${subDivider}\n`;
    const modeLabel = opts.skillsMode === 'trained' ? 'TRAINED SKILLS' : 'SKILLS';
    txt += `${modeLabel} (${data.ppAccounting.skillsCost} PP / ${data.ppAccounting.totalSkillRanks} RANKS)\n`;
    txt += `${subDivider}\n`;
    if (data.skills.length === 0) {
      txt += `No trained skills registered.\n\n`;
    } else {
      txt += `${'Skill Name'.padEnd(26)}${'Total'.padStart(6)}   ${'Ranks'.padStart(6)}   ${'Ability'.padEnd(14)}Enhanced\n`;
      data.skills.forEach(sk => {
        const nameStr = sk.displayName.padEnd(26);
        const totalStr = (sk.isAbsent ? '-' : formatMod(sk.totalBonus)).padStart(6);
        const rankStr = String(sk.ranks).padStart(6);
        const ablStr = (sk.isAbsent ? `${sk.abilityCode} (-)` : `${sk.abilityCode} (${formatMod(sk.abilityMod)})`).padEnd(14);
        const enhStr = sk.enhBonus > 0 ? `+${sk.enhBonus}` : '-';
        txt += `${nameStr}${totalStr}   ${rankStr}   ${ablStr}${enhStr}\n`;
      });
      txt += `\n`;
    }
  }

  // 7. POWERS & DEVICES
  if (opts.showPowers) {
    txt += `${subDivider}\n`;
    txt += `POWERS & DEVICES (${data.ppAccounting.powersCost} PP)\n`;
    txt += `${subDivider}\n`;
    if (data.powers.length === 0) {
      txt += `No powers purchased.\n\n`;
    } else {
      data.powers.forEach((p, idx) => {
        const costBadge = `[${p.totalCost} PP]`;
        const badge = p.structureBadge ? ` [${p.structureBadge}]` : '';
        const desc = p.descriptorsText ? ` ${p.descriptorsText}` : '';
        txt += `${idx + 1}. ${p.title}${badge} ${costBadge}${desc}\n`;

        const showMech = opts.powerMechanics;
        const showEffRules = opts.effectRules;
        const showModRules = opts.modifierRules;

        if (showEffRules || showModRules) {
          if (p.mainLine) txt += `   Effect: ${p.mainLine}\n`;
          if (showMech && p.mechanicsLine) txt += `   Mechanics: ${p.mechanicsLine}\n`;
          if (p.modifiersLine) txt += `   Modifiers: ${p.modifiersLine}\n`;
          if (p.specialConfigLine) txt += `   Configuration: ${p.specialConfigLine}\n`;
          if (showEffRules && p.effectRuleDescs && p.effectRuleDescs.length > 0) {
            p.effectRuleDescs.forEach(r => txt += `   * Rule: ${r}\n`);
          }
          if (showModRules && p.modifierRules && p.modifierRules.length > 0) {
            p.modifierRules.forEach(m => txt += `   * Modifier (${m.name}): ${m.desc}\n`);
          }
          if (p.subEntries && p.subEntries.length > 0) {
            p.subEntries.forEach(sub => {
              txt += `   • ${sub.label}: ${sub.details || sub.effectName} [${sub.costBadge}]\n`;
              if (showMech && sub.mechanics) txt += `     Mechanics: ${sub.mechanics}\n`;
              if (showEffRules && sub.effectRuleDescs && sub.effectRuleDescs.length > 0) {
                sub.effectRuleDescs.forEach(r => txt += `     * Rule: ${r}\n`);
              }
              if (showModRules && sub.modifierRules && sub.modifierRules.length > 0) {
                sub.modifierRules.forEach(m => txt += `     * Modifier (${m.name}): ${m.desc}\n`);
              }
            });
          }
        } else {
          if (p.subEntries && p.subEntries.length > 0) {
            if (showMech && p.mechanicsLine) txt += `   ${p.mechanicsLine}\n`;
            p.subEntries.forEach(sub => {
              txt += `   • ${sub.label}: ${sub.details || sub.effectName} [${sub.costBadge}]\n`;
            });
          } else {
            const parts = [
              p.mainLine,
              p.specialConfigLine,
              showMech ? p.mechanicsLine : null,
              p.modifiersLine
            ].filter(Boolean);
            if (parts.length > 0) txt += `   ${parts.join(' • ')}\n`;
          }
        }
        txt += `\n`;
      });
    }
  }

  // Movement Modes
  if (opts.showMovement && data.movement.length > 0) {
    txt += `Movement Modes:\n`;
    data.movement.forEach(m => {
      txt += `- ${m.name}: ${m.speed}\n`;
    });
    txt += `\n`;
  }

  // 8. EQUIPMENT, VEHICLES & HEADQUARTERS
  if (opts.showEquipment) {
    txt += `${subDivider}\n`;
    txt += `EQUIPMENT, VEHICLES & HEADQUARTERS (${data.equipment.totalEP} / ${data.equipment.maxEP} EP)\n`;
    txt += `${subDivider}\n`;
    if (data.equipment.resources.length === 0) {
      txt += `No equipment, vehicles, or headquarters registered.\n\n`;
    } else {
      data.equipment.resources.forEach(r => {
        const cost = r.epCost ?? r.cost ?? 1;
        const subStr = r.subtype ? `(${r.subtype})` : `(${r.type || 'Gear'})`;
        const statusStr = r.status ? ` [Status: ${r.status}]` : '';
        const descStr = r.desc ? ` - ${r.desc}` : '';
        txt += `- ${r.name} ${subStr} (${cost} EP)${statusStr}${descStr}\n`;
      });
      txt += `\n`;
    }
  }

  // 9. MOTIVATIONS & COMPLICATIONS
  if (opts.showComplications) {
    txt += `${subDivider}\n`;
    txt += `MOTIVATIONS & COMPLICATIONS\n`;
    txt += `${subDivider}\n`;
    if (data.complications.all.length === 0) {
      txt += `No complications defined.\n\n`;
    } else {
      if (data.complications.motivations.length > 0) {
        txt += `Motivations:\n`;
        data.complications.motivations.forEach(m => {
          txt += `- ${m.name}: ${m.desc || 'No description provided.'}\n`;
        });
        txt += `\n`;
      }
      if (data.complications.complications.length > 0) {
        txt += `Complications:\n`;
        data.complications.complications.forEach(c => {
          const typeLabel = c.type && c.type !== 'Complication' ? ` (${c.type})` : '';
          txt += `- ${c.name}${typeLabel}: ${c.desc || 'No description provided.'}\n`;
        });
        txt += `\n`;
      }
    }
  }

  // 10. NOTES
  if (opts.showNotes && data.notes && data.notes.trim()) {
    txt += `${subDivider}\n`;
    txt += `BACKGROUND STORY, TACTICS & NOTES\n`;
    txt += `${subDivider}\n`;
    txt += `${data.notes.trim()}\n\n`;
  }

  return txt;
}
