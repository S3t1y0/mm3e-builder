import { defineStore } from 'pinia';
import { useHeroStore } from './heroStore.js';
import {
  BASE_EFFECTS,
  EFFECT_CATEGORIES,
  CONFIGURABLE_EFFECTS,
  EXTRAS,
  FLAWS,
  createEmptyPower,
  createEmptyEffect,
  createEmptyDeviceSubPower,
  normalizePower,
  normalizeEffect,
  normalizeAlternateSlot,
  normalizeModifier,
  calculateEffectCost,
  calculatePowerTotalCost,
  calculatePowerDetailedBreakdown,
  calculateDeviceDiscount,
  calculatePowerCombatMetrics
} from '../rules/powerEngine.js';

export const usePowerBuilderStore = defineStore('powerBuilder', {
  state: () => ({
    isOpen: false,
    editingIndex: -1, // -1 means new power
    power: createEmptyPower(),
    activeSubPowerIndex: 0,
    activeTargetType: 'main', // 'main' | 'linked' | 'slot'
    activeLinkedIndex: 0,
    activeSlotIndex: 0,

    // Modifier Inspector Modal state
    isModifierInspectorOpen: false,
    modifierSearchQuery: '',
    modifierCategory: 'all', // 'all' | 'Combat' | 'Duration & Action' | 'Range & Area' | 'Utility'
    modifierFilterType: 'all', // 'all' | 'extras' | 'flaws'
    targetEffectRef: null,

    // Effects Library Modal state
    isEffectsLibraryOpen: false,
    targetForEffectsLibrary: null
  }),

  getters: {
    isDeviceMode(state) {
      return state.power.type === 'device';
    },

    isArrayMode(state) {
      return state.power.type === 'array';
    },

    breakdown(state) {
      try {
        return calculatePowerDetailedBreakdown(state.power);
      } catch (err) {
        console.warn('Error calculating breakdown:', err);
        return null;
      }
    },

    totalCost(state) {
      try {
        return calculatePowerTotalCost(state.power);
      } catch (err) {
        console.warn('Error calculating total cost:', err);
        return 1;
      }
    },

    activeSubPower(state) {
      if (state.power.type === 'device' && Array.isArray(state.power.devicePowers)) {
        return state.power.devicePowers[state.activeSubPowerIndex] || state.power.devicePowers[0] || null;
      }
      return null;
    },

    currentEditingEffect(state) {
      if (state.power.type === 'device') {
        const sub = this.activeSubPower;
        if (!sub) return state.power.mainEffect;

        if (state.activeTargetType === 'linked') {
          return sub.linkedEffects?.[state.activeLinkedIndex] || sub.effect;
        }
        if (state.activeTargetType === 'slot') {
          const slot = sub.alternateEffects?.[state.activeSlotIndex];
          return slot?.effect || sub.effect;
        }
        return sub.effect;
      } else {
        if (state.activeTargetType === 'linked') {
          return state.power.linkedEffects?.[state.activeLinkedIndex] || state.power.mainEffect;
        }
        if (state.activeTargetType === 'slot') {
          const slot = state.power.alternateEffects?.[state.activeSlotIndex];
          return slot?.effect || state.power.mainEffect;
        }
        return state.power.mainEffect;
      }
    },

    currentEffectCost() {
      if (!this.currentEditingEffect) return { netPerRank: 1, basePointCost: 1, flatTotal: 0, totalCost: 1 };
      return calculateEffectCost(this.currentEditingEffect, 0);
    },

    combatMetrics(state) {
      try {
        return calculatePowerCombatMetrics(state.power, 10);
      } catch (e) {
        return null;
      }
    },

    // Filtered extras for inspector
    filteredExtras(state) {
      const q = (state.modifierSearchQuery || '').trim().toLowerCase();
      return EXTRAS.filter(e => {
        const matchName = e.name.toLowerCase().includes(q) || (e.desc && e.desc.toLowerCase().includes(q));
        const matchCat = state.modifierCategory === 'all' || e.category === state.modifierCategory;
        return matchName && matchCat;
      });
    },

    // Filtered flaws for inspector
    filteredFlaws(state) {
      const q = (state.modifierSearchQuery || '').trim().toLowerCase();
      return FLAWS.filter(f => {
        const matchName = f.name.toLowerCase().includes(q) || (f.desc && f.desc.toLowerCase().includes(q));
        const matchCat = state.modifierCategory === 'all' || f.category === state.modifierCategory;
        return matchName && matchCat;
      });
    },

    // Active linked effects based on structure and editing target
    currentLinkedEffects(state) {
      if (state.power.type === 'device') {
        return state.activeSubPower?.linkedEffects || [];
      }
      if (state.activeTargetType === 'slot') {
        return state.power.alternateEffects?.[state.activeSlotIndex]?.linkedEffects || [];
      }
      return state.power.linkedEffects || [];
    }
  },

  actions: {
    openNewPower(type = 'standard') {
      const p = createEmptyPower();
      p.type = type;
      p.name = type === 'device' ? 'New Device' : type === 'array' ? 'New Power Array' : 'New Power';

      if (type === 'device') {
        p.deviceConfig = { type: 'removable', descriptor: 'High-Tech Equipment', toughness: 10 };
        p.devicePowers = [
          createEmptyDeviceSubPower('Primary Weapon System', 'Damage')
        ];
        p.mainEffect = p.devicePowers[0].effect;
      } else if (type === 'array') {
        p.mainEffect = createEmptyEffect('Damage');
        p.alternateEffects = [
          normalizeAlternateSlot({ name: 'Alternate Blast Mode', effect: createEmptyEffect('Blast') })
        ];
      }

      this.power = normalizePower(p);
      this.editingIndex = -1;
      this.activeSubPowerIndex = 0;
      this.activeTargetType = 'main';
      this.activeLinkedIndex = 0;
      this.activeSlotIndex = 0;
      this.isOpen = true;
    },

    openEditPower(index, rawPower) {
      this.editingIndex = index;
      let powerData = rawPower;
      if (!powerData && index >= 0) {
        try {
          const heroStore = useHeroStore();
          powerData = heroStore.character.powers?.[index];
        } catch (err) {
          console.warn('[PowerBuilder] Could not retrieve heroStore:', err);
        }
      }

      if (!powerData) {
        console.warn(`[PowerBuilder] Cannot open power editor: no power found at index ${index}`);
        return;
      }

      let clone;
      try {
        clone = JSON.parse(JSON.stringify(powerData));
      } catch (err) {
        console.error('[PowerBuilder] Failed to clone power:', err);
        clone = { ...powerData };
      }

      this.power = normalizePower(clone);
      this.activeSubPowerIndex = 0;
      this.activeTargetType = 'main';
      this.activeLinkedIndex = 0;
      this.activeSlotIndex = 0;
      this.isOpen = true;
    },

    closeModal() {
      this.isOpen = false;
      this.isModifierInspectorOpen = false;
    },

    setStructureType(newType) {
      if (this.power.type === newType) return;
      const prevType = this.power.type;
      this.power.type = newType;

      if (newType === 'device') {
        this.power.deviceConfig = this.power.deviceConfig || { type: 'removable', toughness: 10 };
        if (this.power.deviceConfig.type === 'none') {
          this.power.deviceConfig.type = 'removable';
        }
        if (!Array.isArray(this.power.devicePowers) || this.power.devicePowers.length === 0) {
          this.power.devicePowers = [
            createEmptyDeviceSubPower(this.power.name || 'Primary System', this.power.mainEffect?.baseEffect || 'Damage')
          ];
          if (this.power.mainEffect) {
            this.power.devicePowers[0].effect = normalizeEffect(this.power.mainEffect);
          }
          if (Array.isArray(this.power.alternateEffects) && this.power.alternateEffects.length > 0) {
            this.power.devicePowers[0].alternateEffects = [...this.power.alternateEffects];
          }
        }
        this.power.alternateEffects = [];
      } else if (newType === 'array') {
        if (prevType === 'device' && this.power.devicePowers?.length > 0) {
          const first = this.power.devicePowers[0];
          this.power.mainEffect = normalizeEffect(first.effect);
          this.power.alternateEffects = Array.isArray(first.alternateEffects) ? [...first.alternateEffects] : [];
        }
        if (!Array.isArray(this.power.alternateEffects) || this.power.alternateEffects.length === 0) {
          this.power.alternateEffects = [
            normalizeAlternateSlot({ name: 'Alternate Slot #1', effect: createEmptyEffect('Affliction') })
          ];
        }
      } else {
        // Standard or Compound
        if (prevType === 'device' && this.power.devicePowers?.length > 0) {
          this.power.mainEffect = normalizeEffect(this.power.devicePowers[0].effect);
        }
        this.power.alternateEffects = [];
      }

      this.power = normalizePower(this.power);
      this.activeSubPowerIndex = 0;
      this.activeTargetType = 'main';
    },

    setDeviceDiscountType(discountType) {
      if (!this.power.deviceConfig) {
        this.power.deviceConfig = { type: discountType, descriptor: '', toughness: 10 };
      } else {
        this.power.deviceConfig.type = discountType;
      }
    },

    setActivation(type) {
      this.power.activation = type || 'none';
      this.power.activationCost = type === 'move' ? -1 : type === 'standard' ? -2 : 0;
    },

    // Sub-power actions
    selectSubPower(idx) {
      this.activeSubPowerIndex = Math.max(0, Math.min(idx, (this.power.devicePowers?.length || 1) - 1));
      this.activeTargetType = 'main';
      this.activeSlotIndex = 0;
      this.activeLinkedIndex = 0;
    },

    addDeviceSubPower(name = '', baseEffect = 'Damage') {
      if (!Array.isArray(this.power.devicePowers)) this.power.devicePowers = [];
      const num = this.power.devicePowers.length + 1;
      const sub = createEmptyDeviceSubPower(name || `Sub-Power #${num}`, baseEffect);
      this.power.devicePowers.push(sub);
      this.activeSubPowerIndex = this.power.devicePowers.length - 1;
      this.activeTargetType = 'main';
      this.power = normalizePower(this.power);
    },

    removeDeviceSubPower(idx) {
      if (!this.power.devicePowers || this.power.devicePowers.length <= 1) return;
      this.power.devicePowers.splice(idx, 1);
      if (this.activeSubPowerIndex >= this.power.devicePowers.length) {
        this.activeSubPowerIndex = this.power.devicePowers.length - 1;
      }
      this.activeTargetType = 'main';
      this.power = normalizePower(this.power);
    },

    // Array slots in sub-power or top-level
    addArraySlot(isSubPower = false, name = '', baseEffect = 'Damage') {
      const slotName = name || `Alternate Slot #${Date.now().toString().slice(-3)}`;
      const newSlot = normalizeAlternateSlot({
        name: slotName,
        isDynamic: false,
        effect: createEmptyEffect(baseEffect)
      });

      if (isSubPower && this.activeSubPower) {
        if (!Array.isArray(this.activeSubPower.alternateEffects)) {
          this.activeSubPower.alternateEffects = [];
        }
        this.activeSubPower.alternateEffects.push(newSlot);
        this.activeSlotIndex = this.activeSubPower.alternateEffects.length - 1;
        this.activeTargetType = 'slot';
      } else {
        if (!Array.isArray(this.power.alternateEffects)) {
          this.power.alternateEffects = [];
        }
        this.power.alternateEffects.push(newSlot);
        this.activeSlotIndex = this.power.alternateEffects.length - 1;
        this.activeTargetType = 'slot';
      }
    },

    removeArraySlot(isSubPower = false, slotIdx) {
      const list = (isSubPower && this.activeSubPower)
        ? this.activeSubPower.alternateEffects
        : this.power.alternateEffects;

      if (!Array.isArray(list) || !list[slotIdx]) return;
      list.splice(slotIdx, 1);

      if (this.activeTargetType === 'slot' && this.activeSlotIndex === slotIdx) {
        this.activeTargetType = 'main';
        this.activeSlotIndex = 0;
      } else if (this.activeSlotIndex > slotIdx) {
        this.activeSlotIndex--;
      }
    },

    toggleSlotDynamic(isSubPower = false, slotIdx) {
      const list = (isSubPower && this.activeSubPower)
        ? this.activeSubPower.alternateEffects
        : this.power.alternateEffects;

      if (list && list[slotIdx]) {
        list[slotIdx].isDynamic = !list[slotIdx].isDynamic;
      }
    },

    selectSlotForEditing(isSubPower = false, slotIdx) {
      this.activeTargetType = 'slot';
      this.activeSlotIndex = slotIdx;
    },

    selectMainForEditing() {
      this.activeTargetType = 'main';
    },

    // Effect editing actions
    setEffectBase(effect, baseName) {
      const ref = BASE_EFFECTS.find(b => b.name === baseName);
      if (!ref) return;
      const prevBase = effect.baseEffect;
      effect.baseEffect = ref.name;

      const isDefaultLinked = Boolean(effect.name && (
        effect.name === `${prevBase} (Linked)` ||
        effect.name.toLowerCase() === 'affliction (linked)' ||
        BASE_EFFECTS.some(b => effect.name.trim().toLowerCase() === `${b.name.toLowerCase()} (linked)`)
      ));

      const isLinkedEffect = isDefaultLinked ||
        (Array.isArray(this.currentLinkedEffects) && this.currentLinkedEffects.includes(effect)) ||
        (Array.isArray(this.power.linkedEffects) && this.power.linkedEffects.includes(effect)) ||
        (Array.isArray(this.activeSubPower?.linkedEffects) && this.activeSubPower.linkedEffects.includes(effect));

      const isDefaultBase = !effect.name ||
        effect.name === prevBase ||
        effect.name === 'Unnamed Effect' ||
        effect.name === 'Damage' ||
        BASE_EFFECTS.some(b => b.name.toLowerCase() === (effect.name || '').trim().toLowerCase());

      if (isDefaultLinked || (isLinkedEffect && isDefaultBase)) {
        effect.name = `${ref.name} (Linked)`;
      } else if (isDefaultBase) {
        effect.name = ref.name;
      }

      if (this.power.type !== 'device' && (!this.power.name || this.power.name === prevBase || this.power.name === 'Unnamed Power' || this.power.name === 'Damage')) {
        this.power.name = ref.name;
      }
      effect.baseCost = ref.cost;
      effect.action = ref.action;
      effect.range = ref.range;
      effect.duration = ref.duration;
      effect.resistance = ref.resistance || 'Toughness';

      // Normalize to initialize full configuration for all 12 configurable types
      const norm = normalizeEffect(effect);
      Object.assign(effect, norm);
    },

    updateEffectRank(effect, delta) {
      effect.ranks = Math.max(1, (Number(effect.ranks) || 1) + delta);
    },

    // Modifier Inspector Actions
    openModifierInspector(targetEffect = null) {
      this.targetEffectRef = targetEffect || this.currentEditingEffect;
      this.modifierSearchQuery = '';
      this.isModifierInspectorOpen = true;
    },

    closeModifierInspector() {
      this.isModifierInspectorOpen = false;
    },

    addModifierToTarget(modDef, isFlaw = false) {
      if (!this.targetEffectRef) {
        this.targetEffectRef = this.currentEditingEffect;
      }
      const target = this.targetEffectRef;
      if (!target) return;

      const norm = normalizeModifier({
        name: modDef.name,
        cost: modDef.cost,
        type: modDef.type,
        ranks: 1,
        desc: modDef.desc,
        category: modDef.category,
        options: modDef.options,
        hasRanks: modDef.hasRanks,
        hasConfig: modDef.hasConfig
      });

      if (isFlaw) {
        if (!Array.isArray(target.flaws)) target.flaws = [];
        target.flaws.push(norm);
      } else {
        if (!Array.isArray(target.extras)) target.extras = [];
        target.extras.push(norm);
      }
    },

    removeModifierFromTarget(targetEffect, isFlaw, index) {
      const list = isFlaw ? targetEffect?.flaws : targetEffect?.extras;
      if (Array.isArray(list) && list[index]) {
        list.splice(index, 1);
      }
    },

    stepModifierRank(mod, delta) {
      mod.ranks = Math.max(1, (Number(mod.ranks) || 1) + delta);
    },

    // Effects Library Actions
    openEffectsLibrary(targetEffect = null) {
      this.targetForEffectsLibrary = targetEffect || this.currentEditingEffect;
      this.isEffectsLibraryOpen = true;
    },

    closeEffectsLibrary() {
      this.isEffectsLibraryOpen = false;
      this.targetForEffectsLibrary = null;
    },

    selectBaseEffectForTarget(baseName) {
      const target = this.targetForEffectsLibrary || this.currentEditingEffect;
      if (target) {
        this.setEffectBase(target, baseName);
      }
      this.closeEffectsLibrary();
    },

    // Linked Effects Actions (Simultaneous Action Effects)
    addLinkedEffect(parentEffect = null, baseName = 'Affliction') {
      const newLinked = createEmptyEffect(baseName);
      newLinked.name = `${baseName} (Linked)`;

      // If explicit parentEffect provided and has linkedEffects array
      if (parentEffect && Array.isArray(parentEffect.linkedEffects)) {
        parentEffect.linkedEffects.push(newLinked);
        return;
      }

      // Context-aware fallback based on structure
      if (this.power.type === 'device') {
        const sub = this.activeSubPower;
        if (sub) {
          if (!Array.isArray(sub.linkedEffects)) sub.linkedEffects = [];
          sub.linkedEffects.push(newLinked);
        }
      } else if (this.activeTargetType === 'slot') {
        const slot = this.power.alternateEffects?.[this.activeSlotIndex];
        if (slot) {
          if (!Array.isArray(slot.linkedEffects)) slot.linkedEffects = [];
          slot.linkedEffects.push(newLinked);
        }
      } else {
        if (!Array.isArray(this.power.linkedEffects)) {
          this.power.linkedEffects = [];
        }
        this.power.linkedEffects.push(newLinked);
      }
    },

    removeLinkedEffect(parentEffect = null, index = 0) {
      if (parentEffect && Array.isArray(parentEffect.linkedEffects)) {
        if (parentEffect.linkedEffects[index]) {
          parentEffect.linkedEffects.splice(index, 1);
        }
        return;
      }

      // Context-aware fallback based on structure
      if (this.power.type === 'device') {
        const sub = this.activeSubPower;
        if (sub?.linkedEffects && sub.linkedEffects[index]) {
          sub.linkedEffects.splice(index, 1);
        }
      } else if (this.activeTargetType === 'slot') {
        const slot = this.power.alternateEffects?.[this.activeSlotIndex];
        if (slot?.linkedEffects && slot.linkedEffects[index]) {
          slot.linkedEffects.splice(index, 1);
        }
      } else {
        if (Array.isArray(this.power.linkedEffects) && this.power.linkedEffects[index]) {
          this.power.linkedEffects.splice(index, 1);
        }
      }
    },

    // On-demand Array / Alternate Effects Suite actions
    enableArrayForCurrentPower(defaultBaseEffect = 'Damage') {
      if (!Array.isArray(this.power.alternateEffects)) {
        this.power.alternateEffects = [];
      }
      const slotNum = this.power.alternateEffects.length + 1;
      const newSlot = normalizeAlternateSlot({
        name: `Alternate Mode #${slotNum}`,
        isDynamic: false,
        effect: createEmptyEffect(defaultBaseEffect)
      });
      this.power.alternateEffects.push(newSlot);
      this.activeSlotIndex = this.power.alternateEffects.length - 1;
      this.activeTargetType = 'slot';
    },

    clearArrayForCurrentPower() {
      this.power.alternateEffects = [];
      this.activeTargetType = 'main';
      this.activeSlotIndex = 0;
    }
  }
});
