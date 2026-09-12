import { calculatePowerTotalCost, normalizePower } from './rules/powers.js';

const STORAGE_KEY = 'mm3e_builder_character_data';
const MAX_HISTORY = 50;

function createDefaultCharacter() {
  return {
    id: 'char_' + Date.now(),
    name: 'Hero Name',
    player: '',
    identity: '',
    isSecretIdentity: true,
    baseOfOperations: '',
    powerLevel: 10,
    heroPoints: 1,
    abilities: {
      STR: 0, STA: 0, AGL: 0, DEX: 0,
      FGT: 0, INT: 0, AWE: 0, PRE: 0
    },
    defensesBought: {
      DODGE: 0,
      PARRY: 0,
      FORTITUDE: 0,
      WILL: 0,
      TOUGHNESS: 0
    },
    skills: [],
    advantages: [],
    powers: [],
    activeConditions: [],
    injuries: 0,
    customAttacks: [],
    resources: [],
    notes: ''
  };
}

class Store {
  constructor() {
    this.character = this.loadFromStorage() || createDefaultCharacter();
    this.history = [];
    this.historyIndex = -1;
    this.listeners = new Set();
    this.pushHistory();
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const char = JSON.parse(raw);
        if (char) {
          return this.normalizeCharacter(char);
        }
      }
    } catch (e) {
      console.warn('Failed to load character from storage:', e);
    }
    return null;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.character));
    } catch (e) {
      console.warn('Failed to save to storage:', e);
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.saveToStorage();
    for (const fn of this.listeners) {
      fn(this.character);
    }
  }

  pushHistory() {
    const snapshot = JSON.stringify(this.character);
    if (this.historyIndex >= 0 && this.history[this.historyIndex] === snapshot) {
      return;
    }
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    this.historyIndex--;
    this.character = JSON.parse(this.history[this.historyIndex]);
    this.notify();
  }

  redo() {
    if (!this.canRedo()) return;
    this.historyIndex++;
    this.character = JSON.parse(this.history[this.historyIndex]);
    this.notify();
  }

  // --- Calculations ---
  getAbility(key) {
    return this.character.abilities[key] || 0;
  }

  getDefenseBase(key) {
    switch (key) {
      case 'DODGE': return this.getAbility('AGL');
      case 'PARRY': return this.getAbility('FGT');
      case 'FORTITUDE': return this.getAbility('STA');
      case 'WILL': return this.getAbility('AWE');
      case 'TOUGHNESS': return this.getAbility('STA');
      case 'INITIATIVE': {
        const agl = this.getAbility('AGL');
        const impInit = this.character.advantages.find(a => a.name === 'Improved Initiative');
        const initBonus = impInit ? impInit.ranks * 4 : 0;
        return agl + initBonus;
      }
      default: return 0;
    }
  }

  getDefenseTotal(key) {
    const base = this.getDefenseBase(key);
    const bought = this.character.defensesBought[key] || 0;
    let total = base + bought;

    // Add equipped Shield Active Defenses (+Dodge / +Parry)
    if (key === 'DODGE' || key === 'PARRY') {
      for (const r of (this.character.resources || [])) {
        const isEquipped = r.status === 'equipped' || !r.status;
        if (isEquipped && (r.subtype === 'shield' || r.armor?.activeDefenseBonus)) {
          total += (parseInt(r.armor?.activeDefenseBonus, 10) || 0);
        }
      }
    }

    if (key === 'TOUGHNESS') {
      // 1. Add active Protection power ranks (from main effect, active array slot, or linked effects)
      for (const p of (this.character.powers || [])) {
        if (p.active === false) continue;
        const isArray = p.type === 'array' || (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0);
        const activeSlot = p.activeSlotId || 'main';

        const effectsToCheck = [];
        if (!isArray || activeSlot === 'main' || !p.alternateEffects?.some(s => s.id === activeSlot)) {
          if (p.mainEffect) effectsToCheck.push(p.mainEffect);
          else effectsToCheck.push(p);
          if (Array.isArray(p.linkedEffects)) {
            effectsToCheck.push(...p.linkedEffects);
          }
        } else {
          const slot = p.alternateEffects.find(s => s.id === activeSlot);
          if (slot?.effect) effectsToCheck.push(slot.effect);
          if (Array.isArray(slot?.linkedEffects)) {
            effectsToCheck.push(...slot.linkedEffects);
          }
        }

        for (const eff of effectsToCheck) {
          const effBase = (eff.baseEffect || eff.effectType || eff.name || '').toLowerCase();
          if (effBase === 'protection' || effBase === 'force field' || effBase === 'armor plating') {
            total += (parseInt(eff.ranks, 10) || 0);
          }
        }
      }

      // 2. Add equipped Armor Protection bonus from Equipment
      let maxArmorProtection = 0;
      for (const r of (this.character.resources || [])) {
        const isEquipped = r.status === 'equipped' || !r.status;
        if (!isEquipped) continue;

        if (r.subtype === 'armor' || r.armor?.protectionRank) {
          const prot = parseInt(r.armor?.protectionRank ?? 0, 10);
          if (prot > maxArmorProtection) maxArmorProtection = prot;
        } else if (!r.subtype && r.desc) {
          const match = r.desc.match(/Protection\s+(\d+)/i);
          if (match) {
            const prot = parseInt(match[1], 10);
            if (prot > maxArmorProtection) maxArmorProtection = prot;
          }
        }
      }
      total += maxArmorProtection;

      // 3. Add Defensive Roll advantage ranks (M&M 3e Deluxe Hero's Handbook: active defense, lost if Defenseless or Vulnerable)
      const isDefenseless = this.character.activeConditions.includes('Defenseless');
      const isVulnerable = this.character.activeConditions.includes('Vulnerable');
      if (!isDefenseless && !isVulnerable) {
        const defRoll = (this.character.advantages || []).find(a => (a.name || '').toLowerCase() === 'defensive roll');
        if (defRoll) {
          total += (parseInt(defRoll.ranks ?? defRoll.rank ?? 1, 10) || 1);
        }
      }

      // 4. Subtract injuries (cumulative -1 penalty per injury/bruise per M&M 3e rules)
      const injuries = Math.max(0, parseInt(this.character.injuries || 0, 10));
      total = total - injuries;
    }

    // Check conditions impact
    if (key === 'DODGE' || key === 'PARRY') {
      if (this.character.activeConditions.includes('Defenseless')) {
        total = 0;
      } else if (this.character.activeConditions.includes('Vulnerable')) {
        total = Math.ceil(total / 2);
      }
    }
    return total;
  }

  getTotalAbilityPP() {
    let sum = 0;
    for (const val of Object.values(this.character.abilities)) {
      sum += val * 2;
    }
    return sum;
  }

  getTotalDefensePP() {
    let sum = 0;
    for (const [key, val] of Object.entries(this.character.defensesBought)) {
      if (key !== 'TOUGHNESS') { // Toughness isn't bought directly in defense column
        sum += val;
      }
    }
    return sum;
  }

  getTotalSkillPP() {
    let ranks = 0;
    for (const s of (this.character.skills || [])) {
      ranks += (parseInt(s.ranks ?? s.rank ?? 0, 10) || 0);
    }
    return Math.ceil(ranks / 2);
  }

  getTotalAdvantagePP() {
    let sum = 0;
    for (const a of (this.character.advantages || [])) {
      sum += (parseInt(a.ranks ?? a.rank ?? 1, 10) || 1);
    }
    return sum;
  }

  getTotalPowerPP() {
    let sum = 0;
    for (const p of (this.character.powers || [])) {
      sum += (calculatePowerTotalCost(p) || 0);
    }
    return sum;
  }

  getTotalSpentPP() {
    return (
      this.getTotalAbilityPP() +
      this.getTotalDefensePP() +
      this.getTotalSkillPP() +
      this.getTotalAdvantagePP() +
      this.getTotalPowerPP()
    );
  }

  getTotalBudgetPP() {
    return this.character.powerLevel * 15;
  }

  getRemainingPP() {
    return this.getTotalBudgetPP() - this.getTotalSpentPP();
  }

  getTradeOffCaps() {
    const pl = this.character.powerLevel;
    const maxDefensePair = pl * 2;
    const dodge = this.getDefenseTotal('DODGE');
    const parry = this.getDefenseTotal('PARRY');
    const toughness = this.getDefenseTotal('TOUGHNESS');
    const fort = this.getDefenseTotal('FORTITUDE');
    const will = this.getDefenseTotal('WILL');

    const warnings = [];
    if (dodge + toughness > maxDefensePair) {
      warnings.push(`Dodge (${dodge}) + Toughness (${toughness}) = ${dodge + toughness}, exceeds PL cap (${maxDefensePair})`);
    }
    if (parry + toughness > maxDefensePair) {
      warnings.push(`Parry (${parry}) + Toughness (${toughness}) = ${parry + toughness}, exceeds PL cap (${maxDefensePair})`);
    }
    if (fort + will > maxDefensePair) {
      warnings.push(`Fortitude (${fort}) + Will (${will}) = ${fort + will}, exceeds PL cap (${maxDefensePair})`);
    }

    return {
      maxDefensePair,
      warnings,
      isValid: warnings.length === 0
    };
  }

  // --- Mutations ---
  updateHeader(fields) {
    Object.assign(this.character, fields);
    this.pushHistory();
    this.notify();
  }

  setAbility(key, val) {
    this.character.abilities[key] = Math.max(-5, Math.min(20, val));
    this.pushHistory();
    this.notify();
  }

  setDefense(key, val) {
    this.character.defensesBought[key] = Math.max(0, Math.min(30, val));
    this.pushHistory();
    this.notify();
  }

  addSkill(skillData) {
    if (skillData.id) {
      const existing = this.character.skills.find(s => s.id === skillData.id);
      if (existing) {
        existing.name = skillData.name;
        existing.subtype = skillData.subtype || '';
        existing.ranks = Math.max(1, skillData.ranks || 1);
        this.pushHistory();
        this.notify();
        return;
      }
    }
    const match = this.character.skills.find(s =>
      s.name.toLowerCase() === skillData.name.toLowerCase() &&
      (s.subtype || '').toLowerCase() === (skillData.subtype || '').toLowerCase()
    );
    if (match) {
      match.ranks += Math.max(1, skillData.ranks || 1);
    } else {
      this.character.skills.push({
        id: 'skill_' + Date.now() + Math.random().toString(36).substr(2, 4),
        name: skillData.name,
        subtype: skillData.subtype || '',
        ranks: Math.max(1, skillData.ranks || 1)
      });
    }
    this.pushHistory();
    this.notify();
  }

  updateSkill(id, ranks) {
    const skill = this.character.skills.find(s => s.id === id);
    if (skill) {
      skill.ranks = Math.max(0, ranks);
      if (skill.ranks === 0) {
        this.character.skills = this.character.skills.filter(s => s.id !== id);
      }
      this.pushHistory();
      this.notify();
    }
  }

  removeSkill(id) {
    this.character.skills = this.character.skills.filter(s => s.id !== id);
    this.pushHistory();
    this.notify();
  }

  addAdvantage(name, ranks = 1) {
    const existing = this.character.advantages.find(a => a.name === name);
    if (existing) {
      existing.ranks += ranks;
    } else {
      this.character.advantages.push({ name, ranks });
    }
    this.pushHistory();
    this.notify();
  }

  updateAdvantage(name, ranks) {
    const adv = this.character.advantages.find(a => a.name === name);
    if (adv) {
      adv.ranks = Math.max(0, ranks);
      if (adv.ranks === 0) {
        this.character.advantages = this.character.advantages.filter(a => a.name !== name);
      }
      this.pushHistory();
      this.notify();
    }
  }

  removeAdvantage(name) {
    this.character.advantages = this.character.advantages.filter(a => a.name !== name);
    this.pushHistory();
    this.notify();
  }

  // --- Resources & Equipment Budget ---
  getTotalEP() {
    return this.character.resources.reduce((sum, r) => sum + (parseInt(r.epCost ?? r.cost, 10) || 0), 0);
  }

  getEquipmentBudgetInfo() {
    const totalEP = this.getTotalEP();
    const equipAdv = this.character.advantages.find(a => a.name === 'Equipment');
    const ranks = equipAdv ? equipAdv.ranks : 0;
    const maxEP = ranks * 5;
    const neededRanks = Math.ceil(totalEP / 5);
    const isOverBudget = totalEP > maxEP;
    return {
      totalEP,
      ranks,
      maxEP,
      neededRanks,
      isOverBudget,
      remainingEP: maxEP - totalEP
    };
  }

  syncEquipmentAdvantage() {
    const totalEP = this.getTotalEP();
    const neededRanks = Math.ceil(totalEP / 5);
    const existing = this.character.advantages.find(a => a.name === 'Equipment');
    if (neededRanks === 0) {
      if (existing) {
        this.character.advantages = this.character.advantages.filter(a => a.name !== 'Equipment');
      }
    } else {
      if (existing) {
        existing.ranks = neededRanks;
      } else {
        this.character.advantages.push({ name: 'Equipment', ranks: neededRanks });
      }
    }
    this.pushHistory();
    this.notify();
  }

  addResource(resData) {
    const item = {
      id: resData.id || ('res_' + Date.now() + Math.random().toString(36).substr(2, 4)),
      name: resData.name || 'Equipment Item',
      type: resData.type || 'Gear',
      subtype: resData.subtype || (resData.type === 'Vehicle' ? 'vehicle' : (resData.type === 'Headquarters' ? 'headquarters' : 'gear')),
      epCost: Math.max(1, parseInt(resData.epCost, 10) || 1),
      desc: resData.desc || '',
      status: resData.status || 'equipped',
      weapon: resData.weapon || null,
      armor: resData.armor || null,
      vehicle: resData.vehicle || null,
      hq: resData.hq || null
    };

    // If new item is equipped armor, set other armors to 'carried' (Option A: 1 equipped armor)
    if (item.status === 'equipped' && (item.subtype === 'armor' || item.armor?.protectionRank) && item.subtype !== 'shield') {
      for (const r of this.character.resources) {
        if ((r.subtype === 'armor' || r.armor?.protectionRank) && r.subtype !== 'shield') {
          r.status = 'carried';
        }
      }
    }

    this.character.resources.push(item);
    this.pushHistory();
    this.notify();
    return item;
  }

  updateResource(id, resData) {
    const idx = this.character.resources.findIndex(r => r.id === id);
    if (idx !== -1) {
      const updated = {
        ...this.character.resources[idx],
        ...resData,
        epCost: Math.max(1, parseInt(resData.epCost, 10) || 1)
      };

      if (updated.status === 'equipped' && (updated.subtype === 'armor' || updated.armor?.protectionRank) && updated.subtype !== 'shield') {
        for (const r of this.character.resources) {
          if (r.id !== id && (r.subtype === 'armor' || r.armor?.protectionRank) && r.subtype !== 'shield') {
            r.status = 'carried';
          }
        }
      }

      this.character.resources[idx] = updated;
      this.pushHistory();
      this.notify();
    }
  }

  setResourceStatus(id, newStatus) {
    const item = this.character.resources.find(r => r.id === id);
    if (!item) return;

    if (newStatus === 'equipped' && (item.subtype === 'armor' || item.armor?.protectionRank) && item.subtype !== 'shield') {
      for (const r of this.character.resources) {
        if (r.id !== id && (r.subtype === 'armor' || r.armor?.protectionRank) && r.subtype !== 'shield') {
          r.status = 'carried';
        }
      }
    }

    item.status = newStatus;
    this.pushHistory();
    this.notify();
  }

  toggleResourceStatus(id) {
    const item = this.character.resources.find(r => r.id === id);
    if (!item) return;
    const current = item.status || 'equipped';
    const next = current === 'equipped' ? 'carried' : (current === 'carried' ? 'stored' : 'equipped');
    this.setResourceStatus(id, next);
  }

  removeResource(id) {
    this.character.resources = this.character.resources.filter(r => r.id !== id);
    this.pushHistory();
    this.notify();
  }

  addPower(power) {
    const normalized = normalizePower(power);
    normalized.id = 'pow_' + Date.now() + Math.random().toString(36).substr(2, 4);
    this.character.powers.push(normalized);
    this.pushHistory();
    this.notify();
  }

  updatePower(id, power) {
    const idx = this.character.powers.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.character.powers[idx] = normalizePower({ ...power, id });
      this.pushHistory();
      this.notify();
    }
  }

  removePower(id) {
    this.character.powers = this.character.powers.filter(p => p.id !== id);
    this.pushHistory();
    this.notify();
  }

  togglePowerActive(id) {
    const power = this.character.powers.find(p => p.id === id);
    if (power) {
      power.active = power.active === false ? true : false;
      this.pushHistory();
      this.notify();
      return power.active;
    }
    return false;
  }

  setPowerActive(id, isActive) {
    const power = this.character.powers.find(p => p.id === id);
    if (power) {
      power.active = Boolean(isActive);
      this.pushHistory();
      this.notify();
    }
  }

  setActiveArraySlot(powerId, slotId) {
    const power = this.character.powers.find(p => p.id === powerId);
    if (power) {
      power.activeSlotId = slotId || 'main';
      if (power.active === false) {
        power.active = true;
      }
      this.pushHistory();
      this.notify();
    }
  }

  toggleCondition(conditionName) {
    const idx = this.character.activeConditions.indexOf(conditionName);
    if (idx !== -1) {
      this.character.activeConditions.splice(idx, 1);
    } else {
      this.character.activeConditions.push(conditionName);
    }
    this.pushHistory();
    this.notify();
  }

  clearConditions() {
    this.character.activeConditions = [];
    this.pushHistory();
    this.notify();
  }

  addCondition(conditionName) {
    if (!this.character.activeConditions.includes(conditionName)) {
      this.character.activeConditions.push(conditionName);
      this.pushHistory();
      this.notify();
    }
  }

  removeCondition(conditionName) {
    const idx = this.character.activeConditions.indexOf(conditionName);
    if (idx !== -1) {
      this.character.activeConditions.splice(idx, 1);
      this.pushHistory();
      this.notify();
    }
  }

  addInjury(count = 1) {
    this.character.injuries = Math.max(0, (this.character.injuries || 0) + (parseInt(count, 10) || 1));
    this.pushHistory();
    this.notify();
    return this.character.injuries;
  }

  removeInjury(count = 1) {
    this.character.injuries = Math.max(0, (this.character.injuries || 0) - (parseInt(count, 10) || 1));
    this.pushHistory();
    this.notify();
    return this.character.injuries;
  }

  setInjuries(count) {
    this.character.injuries = Math.max(0, parseInt(count, 10) || 0);
    this.pushHistory();
    this.notify();
    return this.character.injuries;
  }

  clearInjuries() {
    this.character.injuries = 0;
    this.pushHistory();
    this.notify();
    return 0;
  }

  /**
   * Applies M&M 3e Damage Failure Degree consequences to character state.
   * Handles condition escalation per official Deluxe Hero's Handbook rules:
   * - 1st Degree (failed by 1-5): +1 Bruise (-1 Toughness penalty)
   * - 2nd Degree (failed by 6-10): +1 Bruise + Dazed (escalates to Staggered if already Dazed)
   * - 3rd Degree (failed by 11-15): +1 Bruise + Staggered (escalates to Incapacitated if already Staggered)
   * - 4th Degree (failed by 16+): Incapacitated immediately
   */
  applyDamageFailureDegree(degree) {
    const d = parseInt(degree, 10);
    const conds = this.character.activeConditions || [];
    const changes = {
      injuryAdded: false,
      newInjuries: this.character.injuries || 0,
      addedConditions: [],
      escalated: false,
      description: ''
    };

    if (d === 1) {
      this.addInjury(1);
      changes.injuryAdded = true;
      changes.newInjuries = this.character.injuries;
      changes.description = '+1 Bruise (-1 Toughness penalty)';
    } else if (d === 2) {
      this.addInjury(1);
      changes.injuryAdded = true;
      changes.newInjuries = this.character.injuries;
      if (conds.includes('Dazed')) {
        this.addCondition('Staggered');
        changes.addedConditions.push('Staggered');
        changes.escalated = true;
        changes.description = '+1 Bruise & Escalated to Staggered (already Dazed)';
      } else {
        this.addCondition('Dazed');
        changes.addedConditions.push('Dazed');
        changes.description = '+1 Bruise & Dazed for 1 round';
      }
    } else if (d === 3) {
      this.addInjury(1);
      changes.injuryAdded = true;
      changes.newInjuries = this.character.injuries;
      if (conds.includes('Staggered')) {
        this.addCondition('Incapacitated');
        changes.addedConditions.push('Incapacitated');
        changes.escalated = true;
        changes.description = '+1 Bruise & Escalated to Incapacitated (already Staggered)';
      } else {
        this.addCondition('Staggered');
        changes.addedConditions.push('Staggered');
        changes.description = '+1 Bruise & Staggered';
      }
    } else if (d >= 4) {
      this.addCondition('Incapacitated');
      changes.addedConditions.push('Incapacitated');
      changes.description = 'Incapacitated (Unconscious / Defeated)';
    }

    return changes;
  }

  addCustomAttack(attack) {
    this.character.customAttacks.push({
      id: 'atk_' + Date.now(),
      name: attack.name || 'Custom Attack',
      attackBonus: parseInt(attack.attackBonus, 10) || 0,
      effectRank: parseInt(attack.effectRank, 10) || 0,
      range: attack.range || 'Close',
      resistance: attack.resistance || 'Toughness',
      descriptor: attack.descriptor || 'Damage',
      crit: attack.crit || '20'
    });
    this.pushHistory();
    this.notify();
  }

  updateCustomAttack(id, attack) {
    const idx = this.character.customAttacks.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.character.customAttacks[idx] = {
        ...this.character.customAttacks[idx],
        ...attack,
        attackBonus: parseInt(attack.attackBonus, 10) || 0,
        effectRank: parseInt(attack.effectRank, 10) || 0,
        id
      };
      this.pushHistory();
      this.notify();
    }
  }

  removeCustomAttack(id) {
    this.character.customAttacks = this.character.customAttacks.filter(a => a.id !== id);
    this.pushHistory();
    this.notify();
  }

  resetCharacter() {
    this.character = createDefaultCharacter();
    this.pushHistory();
    this.notify();
  }

  normalizeCharacter(data) {
    const defaultChar = createDefaultCharacter();
    const char = {
      ...defaultChar,
      ...(data || {}),
      abilities: { ...defaultChar.abilities, ...(data?.abilities || {}) },
      defensesBought: { ...defaultChar.defensesBought, ...(data?.defensesBought || data?.defenses || {}) }
    };

    // Ensure uppercase ability keys and numeric values
    for (const [k, v] of Object.entries(char.abilities)) {
      const upper = k.toUpperCase();
      char.abilities[upper] = parseInt(v, 10) || 0;
      if (upper !== k) delete char.abilities[k];
    }

    // Ensure uppercase defense keys and numeric values
    for (const [k, v] of Object.entries(char.defensesBought)) {
      const upper = k.toUpperCase();
      char.defensesBought[upper] = parseInt(v, 10) || 0;
      if (upper !== k) delete char.defensesBought[k];
    }

    // Normalize skills
    char.skills = (Array.isArray(char.skills) ? char.skills : []).map(s => ({
      ...s,
      name: s.name || s.id || 'Skill',
      ranks: parseInt(s.ranks ?? s.rank ?? 0, 10) || 0
    }));

    // Normalize advantages
    char.advantages = (Array.isArray(char.advantages) ? char.advantages : []).map(a => ({
      ...a,
      name: a.name || a.id || 'Advantage',
      ranks: parseInt(a.ranks ?? a.rank ?? 1, 10) || 1
    }));

    // Normalize powers
    char.powers = (Array.isArray(char.powers) ? char.powers : []).map(p => normalizePower(p));

    // Normalize injuries
    char.injuries = Math.max(0, parseInt(data?.injuries ?? 0, 10)) || 0;

    return char;
  }

  loadCharacter(data) {
    this.character = this.normalizeCharacter(data);
    this.pushHistory();
    this.notify();
  }
}

export const store = new Store();
if (typeof window !== 'undefined') {
  window.store = store;
}
