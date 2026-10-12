import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { isMotivation } from '../../rules/complications.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';
import {
  formatMod,
  getAllCharacterSkills,
  getMovementModes,
  formatEffectDetails,
  formatEffectRulesPlainText
} from './helpers.js';

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
      return `${abl.code}: - (Absent)`;
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
    txt += `Fortitude:  -  (Absent STA / Immune to Fortitude Effects)\n`;
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
          txt += formatEffectRulesPlainText(eff, '     ');
          if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
            sp.linkedEffects.forEach(le => {
              const leEff = le.effect || le;
              txt += `     * Linked: ${le.name || leEff.baseEffect}: ${formatEffectDetails(leEff)}\n`;
              txt += formatEffectRulesPlainText(leEff, '       ');
            });
          }
          if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
            sp.alternateEffects.forEach(alt => {
              const altEff = alt.effect || alt;
              const altCost = alt.cost || 1;
              txt += `     * Alternate Effect: ${alt.name || alt.baseEffect}: ${formatEffectDetails(altEff)} (${altCost} PP)\n`;
              txt += formatEffectRulesPlainText(altEff, '       ');
            });
          }
        });
      } else if (p.type === 'compound') {
        txt += `${pIdx + 1}. ${p.name || 'Compound Power'} (${cost} PP) - Compound Suite${descriptors}\n`;
        const compEffects = p.compoundEffects || [];
        compEffects.forEach(cp => {
          const eff = cp.effect || cp;
          txt += `   - ${cp.name || eff.baseEffect}: ${formatEffectDetails(eff)}\n`;
          txt += formatEffectRulesPlainText(eff, '     ');
        });
        if (Array.isArray(p.sharedModifiers) && p.sharedModifiers.length > 0) {
          const sharedEff = { extras: p.sharedModifiers, flaws: [] };
          txt += formatEffectRulesPlainText(sharedEff, '     ');
        }
      } else {
        const eff = p.mainEffect || p;
        txt += `${pIdx + 1}. ${p.name || eff.baseEffect || 'Power'} (${cost} PP): ${formatEffectDetails(eff)}${descriptors}\n`;
        txt += formatEffectRulesPlainText(eff, '   ');

        if (p.activation && p.activation !== 'none') {
          txt += `   - Activation: ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}\n`;
        }

        if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
          p.linkedEffects.forEach(link => {
            const linkEff = link.effect || link;
            txt += `   - Linked Effect: ${link.name || linkEff.baseEffect}: ${formatEffectDetails(linkEff)}\n`;
            txt += formatEffectRulesPlainText(linkEff, '     ');
          });
        }

        if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
          p.alternateEffects.forEach(alt => {
            const altEff = alt.effect || alt;
            const altCost = alt.cost || 1;
            txt += `   - Alternate Effect: ${alt.name || alt.baseEffect}: ${formatEffectDetails(altEff)} (${altCost} PP)\n`;
            txt += formatEffectRulesPlainText(altEff, '     ');
          });
        }
      }
      if (p.description || p.notes) {
        txt += `   Notes: ${p.description || p.notes}\n`;
      }
      txt += `\n`;
    });
  }
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
  if (character.notes && character.notes.trim()) {
    txt += `${subDivider}\n`;
    txt += `BACKGROUND STORY, TACTICS & NOTES\n`;
    txt += `${subDivider}\n`;
    txt += `${character.notes}\n\n`;
  }

  txt += `${divider}\n`;
  return txt;
}
