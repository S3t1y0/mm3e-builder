import { defineStore } from 'pinia';
import { calculatePowerTotalCost, normalizePower, createEmptyPower, createEmptyEffect } from '../rules/powerEngine.js';
import { compileTargetedAttacks, calculateDegrees } from '../rules/attacks.js';
import { ARCHETYPES } from '../rules/archetypes.js';
import { calculateConditionModifiers, resolveActiveConditionSet, evaluateDyingFortitudeCheck, DYING_DC, DEATH_FAILURE_LIMIT } from '../rules/conditions.js';
import { sendRollToVTT, syncActiveHero } from '../services/vttBridge.js';
import { isEmbedMode, sendCharacterUpdate, sendDiceRoll } from '../services/embedBridge.js';
import { rollD20, isCryptoAvailable } from '../utils/diceRoller.js';

const STORAGE_KEY = 'mm3e_builder_character_data';
const ROSTER_STORAGE_KEY = 'mm3e_saved_heroes_roster';
const MAX_HISTORY = 50;

function getStoredCharacter() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load character from localStorage:', e);
  }
  return null;
}

export function getSavedRoster() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load roster from localStorage:', e);
    return [];
  }
}

export function createDefaultCharacter() {
  return {
    id: 'char_' + Date.now(),
    name: '',
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
    dyingFailures: 0,
    isDyingStable: false,
    customAttacks: [],
    resources: [],
    complications: [],
    notes: ''
  };
}

export const useHeroStore = defineStore('hero', {
  state: () => {
    const stored = getStoredCharacter();
    const char = stored ? { ...createDefaultCharacter(), ...stored } : createDefaultCharacter();
    if (Array.isArray(char.powers)) {
      char.powers = char.powers.map(p => normalizePower(p));
    }
    return {
      character: char,
      history: [JSON.stringify(char)],
      historyIndex: 0,
      lastRoll: null,
      rollHistory: [],
      lastSavedTimestamp: Date.now(),
      isSaving: false,
      savedRoster: getSavedRoster()
    };
  },

  getters: {
    // --- Active Powers & Enhanced Traits ---
    activeEffects(state) {
      const activeEffects = [];
      for (const p of (state.character.powers || [])) {
        if (p.active === false) continue;
        const isDevice = p.type === 'device';
        const isArray = p.type === 'array' || (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0);

        if (isDevice && Array.isArray(p.devicePowers)) {
          for (const sub of p.devicePowers) {
            if (sub.active === false) continue;
            const hasSubAlts = Array.isArray(sub.alternateEffects) && sub.alternateEffects.length > 0;
            const activeSubSlot = sub.activeSlotId || 'main';
            if (!hasSubAlts || activeSubSlot === 'main' || !sub.alternateEffects.some(s => s.id === activeSubSlot)) {
              if (sub.effect) activeEffects.push(sub.effect);
              if (Array.isArray(sub.linkedEffects)) activeEffects.push(...sub.linkedEffects);
            } else {
              const s = sub.alternateEffects.find(alt => alt.id === activeSubSlot);
              if (s?.effect) activeEffects.push(s.effect);
              if (Array.isArray(s?.linkedEffects)) activeEffects.push(...s.linkedEffects);
            }
          }
        } else if (!isArray || p.activeSlotId === 'main' || !p.alternateEffects?.some(s => s.id === p.activeSlotId)) {
          if (p.mainEffect) activeEffects.push(p.mainEffect);
          else if (p.baseEffect || p.effectType) activeEffects.push(p);
          if (Array.isArray(p.linkedEffects)) activeEffects.push(...p.linkedEffects);
        } else {
          const slot = p.alternateEffects.find(s => s.id === p.activeSlotId);
          if (slot?.effect) activeEffects.push(slot.effect);
          if (Array.isArray(slot?.linkedEffects)) activeEffects.push(...slot.linkedEffects);
        }
      }
      return activeEffects;
    },

    activeEnhancedTraits(state) {
      const activeTraits = {
        abilities: { STR: 0, STA: 0, AGL: 0, DEX: 0, FGT: 0, INT: 0, AWE: 0, PRE: 0 },
        defenses: { DODGE: 0, PARRY: 0, FORTITUDE: 0, TOUGHNESS: 0, WILL: 0 },
        skills: {},
        advantages: {}
      };

      const abilityMap = {
        'strength': 'STR', 'str': 'STR',
        'stamina': 'STA', 'sta': 'STA',
        'agility': 'AGL', 'agl': 'AGL',
        'dexterity': 'DEX', 'dex': 'DEX',
        'fighting': 'FGT', 'fgt': 'FGT',
        'intellect': 'INT', 'int': 'INT',
        'awareness': 'AWE', 'awe': 'AWE',
        'presence': 'PRE', 'pre': 'PRE'
      };

      const defenseMap = {
        'dodge': 'DODGE',
        'parry': 'PARRY',
        'fortitude': 'FORTITUDE',
        'toughness': 'TOUGHNESS',
        'will': 'WILL'
      };

      for (const eff of this.activeEffects) {
        const base = (eff.baseEffect || eff.effectType || eff.name || '').trim().toLowerCase();
        const isEnhanced = base === 'enhanced trait' || (eff.config?.traitCategory && base.startsWith('enhanced'));
        if (!isEnhanced) continue;

        const category = (eff.config?.traitCategory || 'abilities').toLowerCase();
        const rawTraitName = (eff.config?.traitName || eff.config?.trait || 'Strength').trim();
        const ranks = parseInt(eff.ranks, 10) || 0;
        if (ranks <= 0) continue;

        if (category === 'abilities') {
          const code = abilityMap[rawTraitName.toLowerCase()] || rawTraitName.toUpperCase();
          if (activeTraits.abilities[code] !== undefined) {
            activeTraits.abilities[code] += ranks;
          }
        } else if (category === 'defenses') {
          const code = defenseMap[rawTraitName.toLowerCase()] || rawTraitName.toUpperCase();
          if (activeTraits.defenses[code] !== undefined) {
            activeTraits.defenses[code] += ranks;
          }
        } else if (category === 'skills') {
          const skillKey = rawTraitName.toLowerCase();
          activeTraits.skills[skillKey] = (activeTraits.skills[skillKey] || 0) + ranks;
        } else if (category === 'advantages') {
          const advKey = rawTraitName.toLowerCase();
          activeTraits.advantages[advKey] = (activeTraits.advantages[advKey] || 0) + ranks;
        }
      }

      return activeTraits;
    },

    effectiveAbilities(state) {
      const traits = this.activeEnhancedTraits;
      const res = {};
      for (const [key, val] of Object.entries(state.character.abilities)) {
        res[key] = (val || 0) + (traits.abilities[key] || 0);
      }
      return res;
    },

    defenseTotals(state) {
      const eff = this.effectiveAbilities;
      const traits = this.activeEnhancedTraits;
      const bought = state.character.defensesBought || {};

      // Calculate Protection bonus from Powers
      const powerProtBonus = this.protectionBonus;
      // Calculate Armor Protection bonus from equipped equipment (non-stacking, take highest)
      const armorBonus = this.equipmentArmorBonus;
      // Calculate Active Defense bonus from equipped shields (Dodge & Parry)
      const shieldBonus = this.equipmentShieldBonus;

      // Calculate Defensive Roll advantage bonus to Toughness
      const defRoll = (this.effectiveAdvantages || []).find(a => (a.name || '').toLowerCase() === 'defensive roll')?.ranks || 0;

      return {
        DODGE: (eff.AGL || 0) + (bought.DODGE || 0) + (traits.defenses.DODGE || 0) + shieldBonus,
        PARRY: (eff.FGT || 0) + (bought.PARRY || 0) + (traits.defenses.PARRY || 0) + shieldBonus,
        FORTITUDE: (eff.STA || 0) + (bought.FORTITUDE || 0) + (traits.defenses.FORTITUDE || 0),
        TOUGHNESS: (eff.STA || 0) + (bought.TOUGHNESS || 0) + powerProtBonus + armorBonus + defRoll + (traits.defenses.TOUGHNESS || 0),
        WILL: (eff.AWE || 0) + (bought.WILL || 0) + (traits.defenses.WILL || 0)
      };
    },

    equipmentArmorBonus(state) {
      let maxProt = 0;
      const resources = state.character.resources || [];
      for (const r of resources) {
        if ((r.status || 'equipped') !== 'equipped') continue;
        if (r.subtype === 'armor' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '')) {
          const a = r.armor || {};
          let rank = Number(a.protectionRank);
          if (isNaN(rank)) {
            const m = (r.desc || '').match(/Protection\s+(\d+)/i);
            rank = m ? parseInt(m[1], 10) : 0;
          }
          if (rank > maxProt) maxProt = rank;
        }
      }
      return maxProt;
    },

    equipmentShieldBonus(state) {
      let maxShield = 0;
      const resources = state.character.resources || [];
      for (const r of resources) {
        if ((r.status || 'equipped') !== 'equipped') continue;
        if (r.subtype === 'shield' || (r.armor && (r.armor.shieldRank || r.armor.activeDefenseBonus))) {
          const a = r.armor || {};
          let shieldVal = Number(a.activeDefenseBonus ?? a.shieldRank ?? 0);
          if (isNaN(shieldVal) || shieldVal <= 0) {
            const m = (r.desc || '').match(/Active Defense:\s*\+(\d+)/i) || (r.desc || '').match(/(?:Dodge|Parry)\s*\+(\d+)/i);
            shieldVal = m ? parseInt(m[1], 10) : 0;
          }
          if (shieldVal > maxShield) maxShield = shieldVal;
        }
      }
      return maxShield;
    },

    protectionBonus() {
      let bonus = 0;
      for (const effect of this.activeEffects) {
        const b = (effect.baseEffect || effect.name || '').toLowerCase();
        if (b === 'protection') {
          bonus += (parseInt(effect.ranks, 10) || 0);
        }
      }
      return bonus;
    },

    // --- Budget & Point Summaries ---
    totalAbilityPP(state) {
      let sum = 0;
      for (const val of Object.values(state.character.abilities)) {
        sum += (val || 0) * 2;
      }
      return sum;
    },

    totalDefensePP(state) {
      let sum = 0;
      for (const [key, val] of Object.entries(state.character.defensesBought || {})) {
        if (key !== 'TOUGHNESS') {
          sum += (val || 0);
        }
      }
      return sum;
    },

    totalSkillPP(state) {
      let ranks = 0;
      for (const s of (state.character.skills || [])) {
        ranks += (parseInt(s.ranks ?? s.rank ?? 0, 10) || 0);
      }
      return Math.ceil(ranks / 2);
    },

    effectiveAdvantages(state) {
      const list = [];
      const bought = state.character.advantages || [];
      const powerTraits = this.activeEnhancedTraits?.advantages || {};

      // 1. Natural / Bought advantages
      bought.forEach((a, idx) => {
        const key = (a.name || '').toLowerCase();
        const powerBonus = Number(powerTraits[key]) || 0;
        list.push({
          id: a.id || ('adv_' + idx),
          name: a.name,
          naturalRanks: Number(a.ranks ?? a.rank) || 1,
          enhancedRanks: powerBonus,
          ranks: (Number(a.ranks ?? a.rank) || 1) + powerBonus,
          hasPowerBonus: powerBonus > 0,
          isPowerGranted: false,
          storeIndex: idx
        });
      });

      // 2. Purely power-granted advantages
      for (const [rawKey, ranks] of Object.entries(powerTraits)) {
        if (!bought.some(a => (a.name || '').toLowerCase() === rawKey.toLowerCase()) && ranks > 0) {
          const formattedName = rawKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          list.push({
            id: 'pow_adv_' + rawKey,
            name: formattedName,
            naturalRanks: 0,
            enhancedRanks: Number(ranks) || 0,
            ranks: Number(ranks) || 0,
            hasPowerBonus: true,
            isPowerGranted: true,
            storeIndex: -1
          });
        }
      }

      return list;
    },

    totalAdvantagePP(state) {
      let sum = 0;
      for (const a of (state.character.advantages || [])) {
        sum += (parseInt(a.ranks ?? a.rank ?? 1, 10) || 1);
      }
      return sum;
    },

    totalPowerPP(state) {
      let sum = 0;
      for (const p of (state.character.powers || [])) {
        sum += (calculatePowerTotalCost(p) || 0);
      }
      return sum;
    },

    abilitiesCost() { return this.totalAbilityPP; },
    defensesCost() { return this.totalDefensePP; },
    skillsCost() { return this.totalSkillPP; },
    advantagesCost() { return this.totalAdvantagePP; },
    powersCost() { return this.totalPowerPP; },

    totalSpentPP() {
      return (
        this.totalAbilityPP +
        this.totalDefensePP +
        this.totalSkillPP +
        this.totalAdvantagePP +
        this.totalPowerPP
      );
    },

    totalBudgetPP(state) {
      return (state.character.powerLevel || 10) * 15;
    },

    remainingPP() {
      return this.totalBudgetPP - this.totalSpentPP;
    },

    targetedAttacks(state) {
      return compileTargetedAttacks(state.character, this.effectiveAbilities, this.getAdvantageRanks);
    },

    speedBaseRank() {
      let speedRank = 0;
      for (const eff of this.activeEffects) {
        const base = (eff.baseEffect || eff.effectType || eff.name || '').toLowerCase();
        if (base === 'flight' || base === 'speed') {
          const r = parseInt(eff.ranks, 10) || 0;
          if (r > speedRank) speedRank = r;
        }
      }
      return speedRank;
    },

    conditionModifiers(state) {
      const defRoll = this.getAdvantageRanks('Defensive Roll');
      return calculateConditionModifiers({
        activeConditions: state.character.activeConditions || [],
        injuries: state.character.injuries || 0,
        defenses: this.defenseTotals,
        speedRank: this.speedBaseRank,
        defensiveRollBonus: defRoll
      });
    },

    activeConditionSet(state) {
      return resolveActiveConditionSet(state.character.activeConditions || []);
    },

    effectiveCombatDefenses() {
      return this.conditionModifiers.effectiveDefenses;
    },

    circumstancePenalty() {
      return this.conditionModifiers.checkPenalty;
    },

    actionState() {
      return this.conditionModifiers.actionState;
    },

    initiativeTotal() {
      const eff = this.effectiveAbilities || {};
      const initBonus = this.getAdvantageRanks('Improved Initiative') * 4;
      const circ = this.circumstancePenalty || 0;
      return (eff.AGL || 0) + initBonus + circ;
    },

    speedTotal() {
      return this.conditionModifiers.effectiveSpeed;
    },

    isDying(state) {
      return (state.character.activeConditions || []).includes('Dying');
    },

    isDead(state) {
      return this.isDying && ((Number(state.character.dyingFailures) || 0) >= DEATH_FAILURE_LIMIT);
    },

    hasDiehard() {
      return this.getAdvantageRanks('Diehard') > 0;
    },

    dyingTacticalState(state) {
      const failures = Math.max(0, Math.min(DEATH_FAILURE_LIMIT, Number(state.character.dyingFailures) || 0));
      return {
        isDying: this.isDying,
        isDead: this.isDead,
        isStable: !!state.character.isDyingStable,
        failures,
        maxFailures: DEATH_FAILURE_LIMIT,
        hasDiehard: this.hasDiehard,
        fortitudeBonus: this.effectiveCombatDefenses.FORTITUDE || 0
      };
    },

    totalEP(state) {
      return (state.character.resources || []).reduce((sum, r) => sum + (parseInt(r.epCost ?? r.cost, 10) || 0), 0);
    },

    getAdvantageRanks() {
      return (advName) => {
        if (!advName) return 0;
        const target = advName.trim().toLowerCase();
        const found = (this.effectiveAdvantages || []).find(
          a => (a.name || '').trim().toLowerCase() === target
        );
        return found ? (Number(found.ranks) || 0) : 0;
      };
    },

    equipmentBudget(state) {
      const total = this.totalEP;
      const ranks = this.getAdvantageRanks('Equipment');
      const maxEP = ranks * 5;
      const neededRanks = Math.ceil(total / 5);
      return {
        totalEP: total,
        ranks,
        maxEP,
        neededRanks,
        isOverBudget: total > maxEP,
        remainingEP: maxEP - total
      };
    },

    motivations(state) {
      const list = Array.isArray(state.character.complications) ? state.character.complications : [];
      return list.filter(c => {
        const typeStr = (c.type || '').toLowerCase();
        const nameStr = (c.name || '').toLowerCase();
        return typeStr === 'motivation' || nameStr.startsWith('motivation:');
      });
    },

    generalComplications(state) {
      const list = Array.isArray(state.character.complications) ? state.character.complications : [];
      return list.filter(c => {
        const typeStr = (c.type || '').toLowerCase();
        const nameStr = (c.name || '').toLowerCase();
        return typeStr !== 'motivation' && !nameStr.startsWith('motivation:');
      });
    },

    narrativeTraitsStatus() {
      const motCount = this.motivations.length;
      const compCount = this.generalComplications.length;
      const hasMotivation = motCount >= 1;
      const hasComplication = compCount >= 1;
      const isValid = hasMotivation && hasComplication;
      return {
        hasMotivation,
        hasComplication,
        isValid,
        motivationsCount: motCount,
        complicationsCount: compCount,
        totalCount: motCount + compCount
      };
    },

    isComplicationsRuleCompliant() {
      return this.narrativeTraitsStatus.isValid;
    }
  },

  actions: {
    getTotalEP() {
      return this.totalEP;
    },

    getEquipmentBudgetInfo() {
      return this.equipmentBudget;
    },

    syncEquipmentAdvantage() {
      const total = this.totalEP;
      const neededRanks = Math.ceil(total / 5);
      const existing = (this.character.advantages || []).find(a => a.name === 'Equipment');
      if (neededRanks === 0) {
        if (existing) {
          this.character.advantages = this.character.advantages.filter(a => a.name !== 'Equipment');
        }
      } else {
        if (existing) {
          existing.ranks = neededRanks;
        } else {
          this.character.advantages.push({ id: 'adv_' + Date.now(), name: 'Equipment', ranks: neededRanks });
        }
      }
      this.pushHistory();
    },

    addResource(resData) {
      if (!this.character.resources) this.character.resources = [];
      const item = {
        id: resData.id || ('res_' + Date.now() + Math.random().toString(36).substr(2, 4)),
        name: resData.name || 'Equipment Item',
        type: resData.type || 'Gear',
        subtype: resData.subtype || (resData.type === 'Vehicle' ? 'vehicle' : (resData.type === 'Headquarters' ? 'headquarters' : 'gear')),
        epCost: Math.max(1, parseInt(resData.epCost ?? resData.cost, 10) || 1),
        desc: resData.desc || '',
        status: resData.status || 'equipped',
        weapon: resData.weapon || null,
        armor: resData.armor || null,
        vehicle: resData.vehicle || null,
        hq: resData.hq || null
      };
      if (item.status === 'equipped' && (item.subtype === 'armor' || item.armor?.protectionRank) && item.subtype !== 'shield') {
        for (const r of this.character.resources) {
          if ((r.subtype === 'armor' || r.armor?.protectionRank) && r.subtype !== 'shield') {
            r.status = 'carried';
          }
        }
      }
      this.character.resources.push(item);
      this.pushHistory();
      return item;
    },

    updateResource(id, resData) {
      if (!this.character.resources) return;
      const idx = this.character.resources.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.character.resources[idx] = { ...this.character.resources[idx], ...resData };
        this.pushHistory();
      }
    },

    removeResource(id) {
      if (!this.character.resources) return;
      this.character.resources = this.character.resources.filter(r => r.id !== id);
      this.pushHistory();
    },

    toggleResourceStatus(id) {
      if (!this.character.resources) return;
      const item = this.character.resources.find(r => r.id === id);
      if (!item) return;
      const cycle = { 'equipped': 'carried', 'carried': 'stored', 'stored': 'equipped' };
      item.status = cycle[item.status || 'equipped'] || 'equipped';
      this.pushHistory();
    },

    getDefenseTotal(code) {
      const c = (code || '').toUpperCase();
      return this.defenseTotals?.[c] ?? 0;
    },

    getDefenseBase(code) {
      const c = (code || '').toUpperCase();
      const eff = this.effectiveAbilities || {};
      const advs = this.character.advantages || [];
      const initAdv = advs.find(a => a.name === 'Improved Initiative');
      const initBonus = (initAdv ? (initAdv.ranks || 1) * 4 : 0);

      const map = {
        'DODGE': eff.AGL || 0,
        'PARRY': eff.FGT || 0,
        'FORTITUDE': eff.STA || 0,
        'TOUGHNESS': eff.STA || 0,
        'WILL': eff.AWE || 0,
        'INITIATIVE': (eff.AGL || 0) + initBonus
      };
      return map[c] ?? 0;
    },

    getAbility(code) {
      const c = (code || '').toUpperCase();
      return this.effectiveAbilities?.[c] ?? (this.character.abilities?.[c] || 0);
    },

    saveToStorage() {
      if (isEmbedMode()) {
        sendCharacterUpdate(this.character);
        return;
      }
      if (typeof localStorage === 'undefined') return;
      try {
        this.isSaving = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.character));
        this.lastSavedTimestamp = Date.now();
        setTimeout(() => {
          this.isSaving = false;
        }, 300);
      } catch (e) {
        console.warn('Failed to save to storage:', e);
        this.isSaving = false;
      }
    },

    refreshRoster() {
      this.savedRoster = getSavedRoster();
    },

    saveCurrentToRoster(customName = null) {
      if (typeof localStorage === 'undefined') return null;
      const roster = getSavedRoster();
      const heroName = customName || this.character.name || 'Unnamed Hero';
      const slotId = 'slot_' + (this.character.id || Date.now());
      
      const existingIdx = roster.findIndex(item => item.id === slotId || (item.character && item.character.id === this.character.id));
      
      const snapshot = {
        id: slotId,
        name: heroName,
        powerLevel: Number(this.character.powerLevel) || 10,
        player: this.character.player || '',
        archetype: this.character.concept?.archetype || 'Custom',
        spentPP: this.totalSpentPP,
        budgetPP: this.totalBudgetPP,
        savedAt: Date.now(),
        character: JSON.parse(JSON.stringify(this.character))
      };

      if (existingIdx >= 0) {
        roster[existingIdx] = snapshot;
      } else {
        roster.unshift(snapshot);
      }

      try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
        this.savedRoster = roster;
        this.saveToStorage();
        return snapshot;
      } catch (e) {
        console.warn('Failed to save to roster:', e);
        return null;
      }
    },

    loadFromRoster(slotId) {
      const roster = getSavedRoster();
      const slot = roster.find(item => item.id === slotId);
      if (slot && slot.character) {
        this.loadCharacter(slot.character);
        return true;
      }
      return false;
    },

    deleteFromRoster(slotId) {
      if (typeof localStorage === 'undefined') return;
      let roster = getSavedRoster();
      roster = roster.filter(item => item.id !== slotId);
      try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
        this.savedRoster = roster;
      } catch (e) {
        console.warn('Failed to delete from roster:', e);
      }
    },

    clearAllRoster() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.removeItem(ROSTER_STORAGE_KEY);
        this.savedRoster = [];
      } catch (e) {
        console.warn('Failed to clear roster:', e);
      }
    },

    pushHistory() {
      const snap = JSON.stringify(this.character);
      if (this.historyIndex >= 0 && this.history[this.historyIndex] === snap) return;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(snap);
      if (this.history.length > MAX_HISTORY) {
        this.history.shift();
      } else {
        this.historyIndex++;
      }
      this.saveToStorage();
      syncActiveHero(this.character, this.totalSpentPP, this.totalBudgetPP);
      if (isEmbedMode()) {
        sendCharacterUpdate(this.character);
      }
    },

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.character = JSON.parse(this.history[this.historyIndex]);
        this.saveToStorage();
      }
    },

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.character = JSON.parse(this.history[this.historyIndex]);
        this.saveToStorage();
      }
    },

    loadCharacter(char) {
      if (!char) return;
      this.character = { ...createDefaultCharacter(), ...char };
      if (Array.isArray(this.character.powers)) {
        this.character.powers = this.character.powers.map(p => normalizePower(p));
      }
      this.pushHistory();
    },

    resetCharacter() {
      this.character = createDefaultCharacter();
      this.pushHistory();
    },

    setAbility(key, rank) {
      const code = (key || '').toUpperCase();
      if (this.character.abilities[code] !== undefined) {
        this.character.abilities[code] = Number(rank);
        this.pushHistory();
      }
    },

    setDefense(key, rank) {
      const code = (key || '').toUpperCase();
      if (!this.character.defensesBought) {
        this.character.defensesBought = {
          DODGE: 0,
          PARRY: 0,
          FORTITUDE: 0,
          WILL: 0,
          TOUGHNESS: 0
        };
      }
      this.character.defensesBought[code] = Math.max(0, Number(rank) || 0);
      this.pushHistory();
    },

    setDefenseBought(key, rank) {
      this.setDefense(key, rank);
    },

    addPower(power) {
      const norm = normalizePower(power);
      if (!Array.isArray(this.character.powers)) this.character.powers = [];
      this.character.powers.push(norm);
      this.pushHistory();
      return norm;
    },

    updatePower(index, power) {
      if (this.character.powers && this.character.powers[index]) {
        this.character.powers[index] = normalizePower(power);
        this.pushHistory();
      }
    },

    removePower(index) {
      if (this.character.powers && this.character.powers[index]) {
        this.character.powers.splice(index, 1);
        this.pushHistory();
      }
    },

    setActivePowerSlot(powerId, slotId) {
      const p = (this.character.powers || []).find(pow => pow.id === powerId);
      if (p) {
        p.activeSlotId = slotId;
        this.pushHistory();
      }
    },

    setActiveDeviceSubSlot(powerId, devSubIdx, slotId) {
      const p = (this.character.powers || []).find(pow => pow.id === powerId);
      if (p && p.type === 'device' && p.devicePowers?.[devSubIdx]) {
        p.devicePowers[devSubIdx].activeSlotId = slotId;
        this.pushHistory();
      }
    },

    togglePower(powerId) {
      const p = (this.character.powers || []).find(pow => pow.id === powerId);
      if (p) {
        p.active = p.active === false ? true : false;
        this.pushHistory();
        return p.active;
      }
      return false;
    },

    setPowerActive(powerId, isActive) {
      const p = (this.character.powers || []).find(pow => pow.id === powerId);
      if (p) {
        p.active = Boolean(isActive);
        this.pushHistory();
        return p.active;
      }
      return false;
    },

    toggleAllPowers(targetState = null) {
      if (!Array.isArray(this.character.powers) || this.character.powers.length === 0) return;
      let newState;
      if (typeof targetState === 'boolean') {
        newState = targetState;
      } else {
        const anyActive = this.character.powers.some(p => p.active !== false);
        newState = !anyActive;
      }
      for (const p of this.character.powers) {
        p.active = newState;
        if (p.type === 'device' && Array.isArray(p.devicePowers)) {
          for (const sub of p.devicePowers) {
            sub.active = newState;
          }
        }
      }
      this.pushHistory();
    },

    toggleDeviceSubPower(powerId, devSubIdx) {
      const p = (this.character.powers || []).find(pow => pow.id === powerId);
      if (p && p.type === 'device' && p.devicePowers?.[devSubIdx]) {
        const sub = p.devicePowers[devSubIdx];
        sub.active = sub.active === false ? true : false;
        this.pushHistory();
        return sub.active;
      }
      return false;
    },

    setDeviceSubPowerActive(powerId, devSubIdx, isActive) {
      const p = (this.character.powers || []).find(pow => pow.id === powerId);
      if (p && p.type === 'device' && p.devicePowers?.[devSubIdx]) {
        p.devicePowers[devSubIdx].active = Boolean(isActive);
        this.pushHistory();
        return p.devicePowers[devSubIdx].active;
      }
      return false;
    },

    // --- Character Sheet Skills, Advantages, Complications & Rolls ---
    setSkillRank(name, subtype, ranks) {
      if (!Array.isArray(this.character.skills)) this.character.skills = [];
      let skill = this.character.skills.find(s => s.name === name && (s.subtype || '') === (subtype || ''));
      if (!skill) {
        skill = { id: 'sk_' + Date.now() + Math.random().toString(36).substr(2, 4), name, subtype: subtype || '', ranks: 0 };
        this.character.skills.push(skill);
      }
      skill.ranks = Math.max(0, Number(ranks) || 0);
      this.pushHistory();
    },

    removeSkill(index) {
      if (this.character.skills?.[index]) {
        this.character.skills.splice(index, 1);
        this.pushHistory();
      }
    },

    addAdvantage(name, rank = 1) {
      if (!Array.isArray(this.character.advantages)) this.character.advantages = [];
      const existing = this.character.advantages.find(a => a.name === name);
      if (existing) {
        existing.ranks = (Number(existing.ranks) || 1) + 1;
      } else {
        this.character.advantages.push({
          id: 'adv_' + Date.now() + Math.random().toString(36).substr(2, 4),
          name,
          ranks: Number(rank) || 1
        });
      }
      this.pushHistory();
    },

    setAdvantageRank(index, ranks) {
      if (this.character.advantages?.[index]) {
        this.character.advantages[index].ranks = Math.max(1, Number(ranks) || 1);
        this.pushHistory();
      }
    },

    removeAdvantage(index) {
      if (this.character.advantages?.[index]) {
        this.character.advantages.splice(index, 1);
        this.pushHistory();
      }
    },

    addComplication(type, name, desc = '') {
      if (!Array.isArray(this.character.complications)) this.character.complications = [];
      this.character.complications.push({
        id: 'comp_' + Date.now() + Math.random().toString(36).substr(2, 4),
        type: type || 'Motivation',
        name: name || 'Heroic Motivation',
        desc: desc || ''
      });
      this.pushHistory();
    },

    updateComplication(id, updatedData) {
      if (!Array.isArray(this.character.complications)) return;
      const idx = this.character.complications.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.character.complications[idx] = {
          ...this.character.complications[idx],
          ...updatedData
        };
        this.pushHistory();
      }
    },

    removeComplication(identifier) {
      if (!Array.isArray(this.character.complications)) return;
      if (typeof identifier === 'number') {
        if (this.character.complications[identifier]) {
          this.character.complications.splice(identifier, 1);
          this.pushHistory();
        }
      } else if (typeof identifier === 'string') {
        const idx = this.character.complications.findIndex(c => c.id === identifier || c.name === identifier);
        if (idx !== -1) {
          this.character.complications.splice(idx, 1);
          this.pushHistory();
        }
      }
    },

    adjustHeroPoints(delta) {
      const cur = Number(this.character.heroPoints ?? 1) || 0;
      this.character.heroPoints = Math.max(0, cur + delta);
      this.pushHistory();
    },


    // d20 Dice Roll System
    rollCheck(name, modifier = 0, dc = null, category = 'General', extraData = {}) {
      const d20 = rollD20();
      const isCrit = (d20 === 20);
      const isCritFail = (d20 === 1);
      const total = d20 + (Number(modifier) || 0);
      const degrees = calculateDegrees(total, dc);

      const rollData = {
        id: 'roll_' + Date.now(),
        name,
        d20,
        modifier: Number(modifier) || 0,
        total,
        isCrit,
        isCritFail,
        degrees,
        dc,
        category,
        timestamp: new Date().toLocaleTimeString(),
        ...extraData
      };

      this.lastRoll = rollData;
      if (!Array.isArray(this.rollHistory)) this.rollHistory = [];
      this.rollHistory.unshift(rollData);
      if (this.rollHistory.length > 20) this.rollHistory.pop();

      sendRollToVTT(rollData, this.character);
      sendDiceRoll(rollData, this.character);

      return rollData;
    },

    rollInitiative() {
      const initBonus = this.initiativeTotal;
      const agl = this.effectiveAbilities?.AGL || 0;
      const advRanks = this.getAdvantageRanks('Improved Initiative');
      const hasSeize = (this.character.advantages || []).some(
        a => (a.name || '').trim().toLowerCase() === 'seize initiative'
      );

      return this.rollCheck('Initiative Check', initBonus, null, 'Initiative', {
        aglBonus: agl,
        improvedInitBonus: advRanks * 4,
        improvedInitRanks: advRanks,
        hasSeizeInitiative: hasSeize
      });
    },

    clearLastRoll() {
      this.lastRoll = null;
    },

    rerollWithHeroPoint() {
      if (!this.lastRoll) return null;
      const curHp = Number(this.character.heroPoints) || 0;
      if (curHp <= 0) return null;

      // Deduct 1 Hero Point
      this.character.heroPoints = Math.max(0, curHp - 1);

      // M&M 3e Hero Point: d20 roll, if 1..10 add +10 (result 11..20)
      const rawD20 = rollD20();
      const boosted = rawD20 <= 10;
      const d20 = boosted ? (rawD20 + 10) : rawD20;
      const isCrit = (d20 === 20);
      const isCritFail = (d20 === 1);
      const modifier = this.lastRoll.modifier || 0;
      const total = d20 + modifier;
      const degrees = calculateDegrees(total, this.lastRoll.dc);

      const rollData = {
        id: 'roll_' + Date.now(),
        name: this.lastRoll.name,
        d20,
        rawD20,
        isHeroPointReroll: true,
        isBoosted: boosted,
        modifier,
        total,
        isCrit,
        isCritFail,
        degrees,
        dc: this.lastRoll.dc,
        category: this.lastRoll.category || 'General',
        timestamp: new Date().toLocaleTimeString()
      };

      this.lastRoll = rollData;
      if (!Array.isArray(this.rollHistory)) this.rollHistory = [];
      this.rollHistory.unshift(rollData);
      if (this.rollHistory.length > 20) this.rollHistory.pop();
      this.pushHistory();

      // Dispatch to MM3e Vue Chrome Extension VTT Bridge
      sendRollToVTT(rollData, this.character);
      sendDiceRoll(rollData, this.character);

      return rollData;
    },

    // Combat Conditions & Injuries
    setInjuries(count) {
      this.character.injuries = Math.max(0, Number(count) || 0);
      this.pushHistory();
    },

    adjustInjuries(delta) {
      const current = Number(this.character.injuries) || 0;
      this.character.injuries = Math.max(0, current + delta);
      this.pushHistory();
    },

    clearInjuries() {
      this.character.injuries = 0;
      this.pushHistory();
    },

    toggleCondition(name) {
      if (!Array.isArray(this.character.activeConditions)) {
        this.character.activeConditions = [];
      }
      const idx = this.character.activeConditions.indexOf(name);
      if (idx !== -1) {
        this.character.activeConditions.splice(idx, 1);
        if (name === 'Dying') {
          this.character.dyingFailures = 0;
          this.character.isDyingStable = false;
        }
      } else {
        this.character.activeConditions.push(name);
        if (name === 'Dying') {
          this.character.dyingFailures = 0;
          this.character.isDyingStable = false;
        }
      }
      this.pushHistory();
    },

    clearConditions() {
      this.character.activeConditions = [];
      this.character.dyingFailures = 0;
      this.character.isDyingStable = false;
      this.pushHistory();
    },

    rollDyingCheck() {
      const bonus = Number(this.effectiveCombatDefenses.FORTITUDE) || 0;
      const rollData = this.rollCheck('Dying Survival Check (Fortitude)', bonus, DYING_DC, 'Defense', {
        isDyingCheck: true
      });

      const evalResult = evaluateDyingFortitudeCheck(rollData.total, DYING_DC);

      if (evalResult.isStabilized) {
        this.stabilizeHero('Natural Fortitude (2+ Degrees of Success)');
      } else if (evalResult.failureDegreesAdded > 0) {
        const currentFailures = Number(this.character.dyingFailures) || 0;
        this.character.dyingFailures = Math.min(DEATH_FAILURE_LIMIT, currentFailures + evalResult.failureDegreesAdded);
        this.character.isDyingStable = false;
      }

      this.pushHistory();
      return { rollData, evalResult };
    },

    stabilizeHero(reason = 'Treatment') {
      if (!Array.isArray(this.character.activeConditions)) {
        this.character.activeConditions = [];
      }
      const dyingIdx = this.character.activeConditions.indexOf('Dying');
      if (dyingIdx !== -1) {
        this.character.activeConditions.splice(dyingIdx, 1);
      }
      // Per M&M 3e rules, stabilized dying character remains Incapacitated
      if (!this.character.activeConditions.includes('Incapacitated')) {
        this.character.activeConditions.push('Incapacitated');
      }
      this.character.dyingFailures = 0;
      this.character.isDyingStable = true;

      const stabData = {
        id: 'stab_' + Date.now(),
        name: `Stabilized: ${reason}`,
        category: 'Combat Event',
        total: 'STABILIZED',
        d20: null,
        modifier: 0,
        degrees: { isSuccess: true, text: `Hero stabilized via ${reason}. Remains Incapacitated.` },
        timestamp: new Date().toLocaleTimeString()
      };
      sendRollToVTT(stabData, this.character);
      sendDiceRoll(stabData, this.character);

      this.pushHistory();
    },

    spendHeroPointToStabilize() {
      const hp = Number(this.character.heroPoints) || 0;
      if (hp <= 0) return false;
      this.character.heroPoints = hp - 1;
      this.stabilizeHero('Hero Point (Escape Death)');
      return true;
    },

    adjustDyingFailures(delta) {
      const current = Number(this.character.dyingFailures) || 0;
      this.character.dyingFailures = Math.max(0, Math.min(DEATH_FAILURE_LIMIT, current + delta));
      this.pushHistory();
    },

    resetDyingTracker() {
      this.character.dyingFailures = 0;
      this.character.isDyingStable = false;
      this.pushHistory();
    },

    applyArchetype(archId) {
      const arch = ARCHETYPES.find(a => a.id === archId);
      if (!arch) return false;

      // Update basic fields
      this.character.notes = arch.origin ? `Origin: ${arch.origin}` : '';
      if (!this.character.name || this.character.name === 'Hero Name') {
        this.character.name = arch.name;
      }

      // Abilities
      if (arch.abilities) {
        for (const [key, val] of Object.entries(arch.abilities)) {
          this.setAbility(key, val);
        }
      }

      // Defenses
      if (arch.defenses) {
        for (const [key, val] of Object.entries(arch.defenses)) {
          this.setDefenseBought(key, val);
        }
      }

      // Skills
      if (Array.isArray(arch.skills)) {
        this.character.skills = arch.skills.map((sk, idx) => ({
          id: 'sk_arch_' + idx + '_' + Date.now(),
          name: sk.name,
          subtype: sk.subtype || '',
          ranks: sk.ranks || 0
        }));
      }

      // Advantages
      if (Array.isArray(arch.advantages)) {
        this.character.advantages = arch.advantages.map((adv, idx) => ({
          id: 'adv_arch_' + idx + '_' + Date.now(),
          name: adv.name,
          ranks: adv.ranks || 1
        }));
      }

      // Sample Powers (converted to standard powers)
      if (Array.isArray(arch.samplePowers)) {
        this.character.powers = arch.samplePowers.map((sp, idx) => {
          const p = createEmptyPower();
          p.id = 'pow_arch_' + idx + '_' + Date.now();
          p.name = sp.name;
          p.type = 'standard';
          p.mainEffect = createEmptyEffect(sp.effectType || 'Damage');
          p.mainEffect.ranks = sp.ranks || 1;
          if (sp.range) p.mainEffect.range = sp.range;
          if (sp.action) p.mainEffect.action = sp.action;
          if (sp.duration) p.mainEffect.duration = sp.duration;
          if (Array.isArray(sp.extras)) p.mainEffect.extras = [...sp.extras];
          if (Array.isArray(sp.flaws)) p.mainEffect.flaws = [...sp.flaws];
          return normalizePower(p);
        });
      }

      this.pushHistory();
      return true;
    }
  }
});
