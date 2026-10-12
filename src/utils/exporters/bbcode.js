import { calculatePowerTotalCost } from '../../rules/powerEngine.js';
import { isMotivation } from '../../rules/complications.js';
import { compileTargetedAttacks } from '../../rules/attacks.js';
import {
  formatMod,
  getAllCharacterSkills,
  getMovementModes,
  formatEffectDetails,
  formatEffectRulesBBCode
} from './helpers.js';

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

  let bb = `[size=6][b]${name.toUpperCase()}[/b][/size] [size=4][b](PL ${pl})[/b][/size]\n\n`;
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
  bb += `[b][size=4][color=#2563eb]■ POWER POINT SUMMARY[/color][/size][/b]\n`;
  bb += `• [b]Abilities:[/b] ${abilitiesCost} PP\n`;
  bb += `• [b]Defenses:[/b] ${defensesCost} PP\n`;
  bb += `• [b]Skills:[/b] ${skillsCost} PP (${totalSkillRanks} ranks)\n`;
  bb += `• [b]Advantages:[/b] ${advantagesCost} PP\n`;
  bb += `• [b]Powers:[/b] ${powersCost} PP\n`;
  bb += `[b]TOTAL SPENT:[/b] [b]${totalSpent} / ${totalBudget} PP[/b] [i](${remaining} PP Remaining)[/i]\n\n`;
  bb += `[hr]\n\n`;
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
      return `[b]${abl.code}:[/b] - (Absent, -10 PP)`;
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
    bb += `• [b]Fortitude:[/b] - (Absent STA / Immune to Fortitude Effects)\n`;
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
          bb += formatEffectRulesBBCode(eff, '    ');
          if (Array.isArray(sp.linkedEffects) && sp.linkedEffects.length > 0) {
            sp.linkedEffects.forEach(le => {
              const leEff = le.effect || le;
              bb += `    * [i]Linked:[/i] [b]${le.name || leEff.baseEffect}:[/b] ${formatEffectDetails(leEff)}\n`;
              bb += formatEffectRulesBBCode(leEff, '      ');
            });
          }
          if (Array.isArray(sp.alternateEffects) && sp.alternateEffects.length > 0) {
            sp.alternateEffects.forEach(alt => {
              const altEff = alt.effect || alt;
              const altCost = alt.cost || 1;
              bb += `    * [i]Alternate Effect:[/i] [b]${alt.name || altEff.baseEffect}:[/b] ${formatEffectDetails(altEff)} (${altCost} PP)\n`;
              bb += formatEffectRulesBBCode(altEff, '      ');
            });
          }
        });
      } else if (p.type === 'compound') {
        bb += `• [b]${p.name || 'Compound Power'}[/b] (${cost} PP) - [i]Compound Suite[/i]${descriptors}\n`;
        const compEffects = p.compoundEffects || [];
        compEffects.forEach(cp => {
          const eff = cp.effect || cp;
          bb += `  - [b]${cp.name || eff.baseEffect}:[/b] ${formatEffectDetails(eff)}\n`;
          bb += formatEffectRulesBBCode(eff, '    ');
        });
        if (Array.isArray(p.sharedModifiers) && p.sharedModifiers.length > 0) {
          const sharedEff = { extras: p.sharedModifiers, flaws: [] };
          bb += formatEffectRulesBBCode(sharedEff, '    ');
        }
      } else {
        const eff = p.mainEffect || p;
        bb += `• [b]${p.name || eff.baseEffect || 'Power'}[/b] (${cost} PP): ${formatEffectDetails(eff)}${descriptors}\n`;
        bb += formatEffectRulesBBCode(eff, '  ');

        if (p.activation && p.activation !== 'none') {
          bb += `  - [i]Activation:[/i] ${p.activation === 'move' ? 'Move Action (-1 PP)' : 'Standard Action (-2 PP)'}\n`;
        }

        if (Array.isArray(p.linkedEffects) && p.linkedEffects.length > 0) {
          p.linkedEffects.forEach(link => {
            const linkEff = link.effect || link;
            bb += `  - [i]Linked Effect:[/i] [b]${link.name || linkEff.baseEffect}:[/b] ${formatEffectDetails(linkEff)}\n`;
            bb += formatEffectRulesBBCode(linkEff, '    ');
          });
        }

        if (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0) {
          p.alternateEffects.forEach(alt => {
            const altEff = alt.effect || alt;
            const altCost = alt.cost || 1;
            bb += `  - [i]Alternate Effect:[/i] [b]${alt.name || altEff.baseEffect}:[/b] ${formatEffectDetails(altEff)} (${altCost} PP)\n`;
            bb += formatEffectRulesBBCode(altEff, '    ');
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
  if (character.notes && character.notes.trim()) {
    bb += `[hr]\n\n`;
    bb += `[b][size=4][color=#2563eb]■ CHARACTER BACKGROUND & NOTES[/color][/size][/b]\n`;
    bb += `[quote]\n${character.notes}\n[/quote]\n\n`;
  }

  return bb;
}
