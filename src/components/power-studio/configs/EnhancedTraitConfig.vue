<template>
      <div  class="config-body config-trait-picker">
      <div v-if="selectedTraitsList.length > 0" class="selected-traits-ribbon">
        <div class="ribbon-title">
          <i class="ri-checkbox-circle-fill text-blue"></i>
          <span>Active Targets ({{ selectedTraitsList.length }}):</span>
        </div>
        <div class="ribbon-pills-row">
          <button
            v-for="trait in selectedTraitsList"
            :key="trait"
            type="button"
            class="trait-active-pill"
            :disabled="selectedTraitsList.length <= 1"
            @click="toggleTrait(trait)"
          >
            <i class="ri-check-line"></i>
            <span class="pill-name">{{ trait }}</span>
            <span class="pill-bonus">+{{ effect.ranks }}</span>
            <i v-if="selectedTraitsList.length > 1" class="ri-close-line pill-close"></i>
          </button>
        </div>
      </div>

      <div class="trait-picker-horizontal-layout">
        <div class="trait-category-sidebar">
          <div class="sidebar-section-title">
            <i class="ri-folder-settings-line"></i>
            <span>1. Trait Category</span>
          </div>
          <div class="trait-category-list">
            <button
              v-for="(cat, catKey) in cfg.categories"
              :key="catKey"
              type="button"
              class="trait-cat-btn"
              :class="{ active: currentTraitCategory === catKey }"
              @click="selectTraitCategory(catKey)"
            >
              <div class="cat-btn-left">
                <i :class="getCategoryIcon(catKey)"></i>
                <span class="cat-label">{{ cat.label.split(' (')[0] }}</span>
              </div>
              <span class="cat-cost-badge">{{ cat.costDisplay }}</span>
            </button>
          </div>
        </div>
        <div class="trait-selector-box">
          <div class="selector-header">
            <span class="selector-prompt">
              <i class="ri-focus-3-line"></i>
              <span>2. Choose Target {{ currentCategoryObj?.label.split(' (')[0] || 'Traits' }} (Multi-Select):</span>
            </span>

            <div class="selector-header-actions">
              <div class="trait-search-wrapper">
                <i class="ri-search-line"></i>
                <input
                  v-model="traitSearch"
                  type="text"
                  class="trait-search-input"
                  :placeholder="`Filter ${currentCategoryObj?.label.split(' (')[0]}...`"
                />
                <button
                  v-if="traitSearch"
                  type="button"
                  class="clear-search-btn"
                  @click="traitSearch = ''"
                >
                  <i class="ri-close-line"></i>
                </button>
              </div>
              <button
                type="button"
                class="btn-custom-sub-target"
                @click="openCustomSubModal('Enhanced Trait')"
              >
                <i class="ri-add-line"></i>
                <span>Custom Target</span>
              </button>
            </div>
          </div>
          <div v-if="currentTraitCategory === 'abilities' || currentTraitCategory === 'defenses'" class="trait-presets-strip">
            <span class="presets-label"><i class="ri-bookmark-line"></i> Presets:</span>
            <template v-if="currentTraitCategory === 'abilities'">
              <button type="button" class="preset-pill-btn" @click="applyTraitPreset(['Strength', 'Agility', 'Stamina'])">
                Physical (STR, AGI, STA)
              </button>
              <button type="button" class="preset-pill-btn" @click="applyTraitPreset(['Fighting', 'Dexterity'])">
                Combat (FGT, DEX)
              </button>
              <button type="button" class="preset-pill-btn" @click="applyTraitPreset(['Intellect', 'Awareness', 'Presence'])">
                Mental (INT, AWE, PRE)
              </button>
            </template>
            <template v-else-if="currentTraitCategory === 'defenses'">
              <button type="button" class="preset-pill-btn" @click="applyTraitPreset(['Dodge', 'Parry'])">
                Active Defenses (Dodge, Parry)
              </button>
              <button type="button" class="preset-pill-btn" @click="applyTraitPreset(['Fortitude', 'Will'])">
                Resistances (Fort, Will)
              </button>
            </template>
          </div>
          <div class="trait-chips-grid" :class="{ 'scrollable-grid': currentTraitCategory === 'advantages' }" data-seamless-scroll>
            <div
              v-for="trait in filteredTraits"
              :key="trait"
              class="trait-chip"
              :class="{ active: isTraitSelected(trait), 'custom-trait-chip': isCustomTrait(trait) }"
              @click="toggleTrait(trait)"
            >
              <i :class="isTraitSelected(trait) ? 'ri-checkbox-circle-fill chip-check' : 'ri-checkbox-blank-circle-line chip-uncheck'"></i>
              <span>{{ trait }}</span>
              <span v-if="isCustomTrait(trait)" class="custom-badge-pill-micro">CUSTOM</span>
              <div v-if="isCustomTrait(trait)" class="custom-chip-actions" @click.stop>
                <button type="button" class="btn-micro-action edit" @click="editCustomTrait(trait)">
                  <i class="ri-edit-line"></i>
                </button>
                <button type="button" class="btn-micro-action delete" @click="deleteCustomTrait(trait)">
                  <i class="ri-close-line"></i>
                </button>
              </div>
            </div>
            <div v-if="filteredTraits.length === 0" class="no-results-msg">
              No traits found matching "{{ traitSearch }}"
            </div>
          </div>
        </div>
      </div>
      <div class="config-summary-bar">
        <i class="ri-information-line"></i>
        <span>
          Enhancing ({{ selectedTraitsList.length }}): <strong>{{ selectedTraitsDisplay }}</strong>
          &bull; Ranks: <strong>+{{ effect.ranks }} to each</strong>
          &bull; Base Cost: <strong>{{ calculatedBaseCostDisplay }}</strong>
          &bull; Total: <strong>{{ calculatedTotalPPDisplay }}</strong>
        </span>
      </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { calculateEffectCost } from '../../../rules/powerEngine.js';
import { useCustomSubModal } from './useCustomSubModal.js';

const props = defineProps({
  effect: { type: Object, required: true },
  cfg: { type: Object, required: true }
});
const cfg = computed(() => props.cfg);
const emit = defineEmits(['update', 'open-custom']);

const {
  updateConfig,
  openCustomSubModal,
  isCustomTrait,
  editCustomTrait,
  deleteCustomTrait
} = useCustomSubModal(emit, props);

const traitSearch = ref('');

const currentTraitCategory = computed(() => {
  return props.effect?.config?.traitCategory || 'abilities';
});

const currentCategoryObj = computed(() => {
  return cfg.value?.categories?.[currentTraitCategory.value] || null;
});

const filteredTraits = computed(() => {
  const list = [...(currentCategoryObj.value?.traits || [])];
  const customMatching = (props.effect?.config?.customItems || [])
    .filter(c => !c.category || c.category === currentTraitCategory.value)
    .map(c => c.name);
  customMatching.forEach(cName => {
    if (!list.includes(cName)) list.push(cName);
  });
  if (!traitSearch.value.trim()) return list;
  const q = traitSearch.value.toLowerCase();
  return list.filter(t => t.toLowerCase().includes(q));
});

function getCategoryIcon(catKey) {
  switch (catKey) {
    case 'abilities': return 'ri-boxing-line';
    case 'defenses': return 'ri-shield-line';
    case 'skills': return 'ri-tools-line';
    case 'advantages': return 'ri-medal-line';
    default: return 'ri-check-line';
  }
}

function selectTraitCategory(catKey) {
  props.effect.config = props.effect.config || {};
  props.effect.config.traitCategory = catKey;
  const catObj = cfg.value?.categories?.[catKey];
  if (catObj && catObj.traits && catObj.traits.length > 0) {
    const currentSelected = props.effect.config.selectedTraits || [];
    const validSelected = currentSelected.filter(t => catObj.traits.includes(t));
    if (validSelected.length > 0) {
      props.effect.config.selectedTraits = validSelected;
      props.effect.config.traitName = validSelected[0];
    } else {
      props.effect.config.selectedTraits = [catObj.traits[0]];
      props.effect.config.traitName = catObj.traits[0];
    }
  }
  updateConfig();
}

const selectedTraitsList = computed(() => {
  const sel = props.effect?.config?.selectedTraits;
  if (Array.isArray(sel) && sel.length > 0) return sel;
  if (props.effect?.config?.traitName) return [props.effect.config.traitName];
  return ['Strength'];
});

function isTraitSelected(trait) {
  return selectedTraitsList.value.includes(trait);
}

function toggleTrait(trait) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.selectedTraits) && props.effect.config.selectedTraits.length > 0
    ? [...props.effect.config.selectedTraits]
    : [props.effect.config.traitName || 'Strength'];

  if (list.includes(trait)) {
    if (list.length <= 1) return; // Keep at least 1 trait
    list = list.filter(t => t !== trait);
  } else {
    list.push(trait);
  }
  props.effect.config.selectedTraits = list;
  props.effect.config.traitName = list[0] || trait;
  updateConfig();
}

function applyTraitPreset(presetTraits) {
  props.effect.config = props.effect.config || {};
  props.effect.config.selectedTraits = [...presetTraits];
  props.effect.config.traitName = presetTraits[0] || 'Strength';
  updateConfig();
}

const selectedTraitsDisplay = computed(() => {
  const list = selectedTraitsList.value;
  if (list.length <= 3) return list.join(', ');
  return `${list.slice(0, 3).join(', ')} +${list.length - 3} more`;
});

const calculatedBaseCostDisplay = computed(() => {
  const cat = currentTraitCategory.value;
  const count = selectedTraitsList.value.length;
  if (cat === 'abilities') return `${count * 2} PP/Rank (${count} × 2 PP)`;
  if (cat === 'defenses') return `${count} PP/Rank (${count} × 1 PP)`;
  if (cat === 'advantages') return `${count} PP/Rank (${count} × 1 PP)`;
  if (cat === 'skills') {
    const ppPerRank = count * 0.5;
    return `${ppPerRank} PP/Rank (${count} skills @ 0.5 PP)`;
  }
  return `${props.effect.baseCost || 1} PP/Rank`;
});

const calculatedTotalPPDisplay = computed(() => {
  const costObj = calculateEffectCost(props.effect);
  return `${costObj.totalCost} PP`;
});

</script>
