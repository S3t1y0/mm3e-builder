<template>
  <div v-if="cfg" class="effect-configurator-container">
    <div class="config-header-strip">
      <div class="header-left">
        <div class="config-badge-icon">
          <i :class="getConfigIcon"></i>
        </div>
        <div class="header-titles">
          <div class="header-title-row">
            <span class="config-title">{{ cfg.label || 'Effect Specific Configuration' }}</span>
          </div>
          <span class="config-subtitle">{{ getConfigSummaryText }}</span>
        </div>
      </div>
    </div>
    <component
      :is="activeSubConfigComponent"
      v-if="activeSubConfigComponent"
      :effect="effect"
      :cfg="cfg"
      :is-linked="isLinked"
      @update="updateConfig"
      @open-custom="openCustomSubModal"
    />
    <div v-if="showCustomSubModal" class="custom-sub-modal-backdrop" @click.self="closeCustomSubModal">
      <div class="custom-sub-modal-dialog">
        <div class="modal-dialog-header">
          <div class="header-info">
            <div class="header-icon-badge">
              <i :class="customForm.icon || 'ri-flashlight-line'"></i>
            </div>
            <div class="header-title-col">
              <h3 class="modal-title">
                {{ editingCustomId ? 'Edit Custom Target / Sub-Effect' : 'New Custom Target / Sub-Effect' }}
              </h3>
            </div>
          </div>
          <button type="button" class="modal-close-btn" @click="closeCustomSubModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="modal-dialog-body" data-seamless-scroll>
          <div class="form-row-grid">
            <div class="form-field-group">
              <label class="form-label">
                <i class="ri-edit-line"></i> Target / Sub-Effect Name <span class="req">*</span>
              </label>
              <input
                v-model="customForm.name"
                type="text"
                class="form-input"
                :placeholder="getCustomNamePlaceholder"
                autofocus
              />
            </div>
            <div class="form-field-group">
              <label class="form-label">
                <i class="ri-coins-line"></i> {{ getCustomCostLabel }}
              </label>
              <div class="custom-stepper-wrap">
                <button
                  type="button"
                  class="stepper-btn"
                  :disabled="customForm.pts <= 1"
                  @click="customForm.pts = Math.max(1, Number(customForm.pts || 1) - 1)"
                >-</button>
                <input
                  v-model.number="customForm.pts"
                  type="number"
                  min="1"
                  max="30"
                  class="stepper-input"
                />
                <button
                  type="button"
                  class="stepper-btn"
                  :disabled="customForm.pts >= 30"
                  @click="customForm.pts = Math.min(30, Number(customForm.pts || 1) + 1)"
                >+</button>
                <span class="stepper-unit-label">{{ getCustomCostUnit }}</span>
              </div>
            </div>
          </div>
          <div v-if="customCategoryOptions.length > 0" class="form-field-group">
            <label class="form-label">
              <i class="ri-folder-settings-line"></i> Category / Classification
            </label>
            <div class="category-chips-row">
              <button
                v-for="cat in customCategoryOptions"
                :key="cat.id"
                type="button"
                class="cat-chip-btn"
                :class="{ active: customForm.category === cat.id }"
                @click="customForm.category = cat.id"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
          <div class="form-field-group">
            <label class="form-label">
              <i class="ri-file-text-line"></i> Description / Sensory Mechanics
            </label>
            <textarea
              v-model="customForm.desc"
              rows="3"
              class="form-textarea"
              placeholder="Detail how this target or sensory faculty functions during play..."
            ></textarea>
          </div>
          <div class="form-field-group">
            <label class="form-label">
              <i class="ri-paint-brush-line"></i> Identifier Icon
            </label>
            <div class="icon-picker-grid">
              <button
                v-for="icon in AVAILABLE_CUSTOM_ICONS"
                :key="icon"
                type="button"
                class="icon-picker-item"
                :class="{ active: customForm.icon === icon }"
                @click="customForm.icon = icon"
              >
                <i :class="icon"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-dialog-footer">
          <button type="button" class="btn-cancel" @click="closeCustomSubModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn-save-custom"
            :disabled="!customForm.name.trim()"
            @click="saveCustomSubItem"
          >
            <i class="ri-check-line"></i>
            <span>{{ editingCustomId ? 'Update Target' : 'Add to Effect' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, provide } from 'vue';
import { CONFIGURABLE_EFFECTS, normalizeEffect } from '../../rules/powerEngine.js';

import EnhancedTraitConfig from './configs/EnhancedTraitConfig.vue';
import SensesConfig from './configs/SensesConfig.vue';
import AfflictionConfig from './configs/AfflictionConfig.vue';
import IllusionConfig from './configs/IllusionConfig.vue';
import ConcealmentConfig from './configs/ConcealmentConfig.vue';
import ImmunityConfig from './configs/ImmunityConfig.vue';
import MovementConfig from './configs/MovementConfig.vue';
import MorphConfig from './configs/MorphConfig.vue';
import WeakenConfig from './configs/WeakenConfig.vue';
import NullifyConfig from './configs/NullifyConfig.vue';
import ComprehendConfig from './configs/ComprehendConfig.vue';
import EnvironmentConfig from './configs/EnvironmentConfig.vue';
import VariableConfig from './configs/VariableConfig.vue';

const props = defineProps({
  effect: {
    type: Object,
    required: true
  },
  isLinked: {
    type: Boolean,
    default: false
  }
});

const SUB_CONFIG_COMPONENTS = {
  trait_picker: EnhancedTraitConfig,
  senses_multiselect_library: SensesConfig,
  affliction_builder: AfflictionConfig,
  senses_multiselect: IllusionConfig,
  concealment_multiselect_library: ConcealmentConfig,
  immunity_multiselect_library: ImmunityConfig,
  movement_multiselect_library: MovementConfig,
  morph_scope: MorphConfig,
  weaken_target: WeakenConfig,
  descriptor_spec: NullifyConfig,
  comprehend_multiselect_library: ComprehendConfig,
  environment_multiselect_library: EnvironmentConfig,
  variable_theme: VariableConfig
};

const cfg = computed(() => {
  if (!props.effect || !props.effect.baseEffect) return null;
  return CONFIGURABLE_EFFECTS[props.effect.baseEffect] || null;
});

const activeSubConfigComponent = computed(() => {
  if (!cfg.value || !cfg.value.type) return null;
  return SUB_CONFIG_COMPONENTS[cfg.value.type] || null;
});

// Ensure config schema is normalized
function ensureInitialized() {
  if (!props.effect || !cfg.value) return;
  props.effect.config = props.effect.config || {};
  const norm = normalizeEffect(props.effect);
  Object.assign(props.effect, norm);
}

onMounted(() => {
  ensureInitialized();
});

watch(
  () => props.effect?.baseEffect,
  () => {
    ensureInitialized();
  }
);

function updateConfig() {
  if (!props.effect || !cfg.value) return;
  const norm = normalizeEffect(props.effect);
  Object.assign(props.effect, norm);
}

const getConfigIcon = computed(() => {
  const base = props.effect?.baseEffect;
  switch (base) {
    case 'Enhanced Trait': return 'ri-user-star-line';
    case 'Senses': return 'ri-eye-2-line';
    case 'Affliction': return 'ri-virus-line';
    case 'Illusion': return 'ri-ghost-line';
    case 'Concealment': return 'ri-eye-close-line';
    case 'Immunity': return 'ri-shield-star-line';
    case 'Movement': return 'ri-walk-line';
    case 'Morph': return 'ri-user-shared-line';
    case 'Weaken': return 'ri-arrow-down-circle-line';
    case 'Nullify': return 'ri-forbid-2-line';
    case 'Comprehend': return 'ri-translate-2';
    case 'Environment': return 'ri-earth-line';
    case 'Variable': return 'ri-sparkling-2-line';
    default: return 'ri-settings-4-line';
  }
});

const selectedTraitsList = computed(() => {
  const c = props.effect?.config;
  if (!c) return [];
  if (Array.isArray(c.selectedTraits) && c.selectedTraits.length > 0) {
    return c.selectedTraits;
  }
  if (c.traitName) return [c.traitName];
  return ['Strength'];
});

const calculatedBaseCostDisplay = computed(() => {
  const cat = props.effect?.config?.traitCategory || 'abilities';
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

const getConfigSummaryText = computed(() => {
  const c = props.effect?.config;
  const base = props.effect?.baseEffect;
  if (!c) return 'Configure effect options and mechanics.';

  switch (base) {
    case 'Enhanced Trait': {
      const cat = c.traitCategory || 'abilities';
      const targets = selectedTraitsList.value;
      const targetsStr = targets.length <= 2 ? targets.join(', ') : `${targets[0]}, ${targets[1]} +${targets.length - 2} more`;
      const costStr = calculatedBaseCostDisplay.value;
      return `Targets: ${targetsStr} (${cat}) • ${costStr}`;
    }
    case 'Senses': {
      const count = (c.selectedFaculties || []).length;
      return `${count} sensory faculties selected • ${props.effect.ranks} Ranks`;
    }
    case 'Concealment': {
      const count = (c.selectedSenses || []).length;
      return `${count} concealment sense${count !== 1 ? 's' : ''} active • ${props.effect.ranks} Ranks (${props.effect.ranks * 2} PP)`;
    }
    case 'Affliction': {
      const limitedDegreeMod = (props.effect?.flaws || []).find(f => f.name === 'Limited Degree');
      const limitedDegreeRanks = limitedDegreeMod ? (Number(limitedDegreeMod.ranks) || 1) : 0;
      const extraConditionMod = (props.effect?.extras || []).find(e => e.name === 'Extra Condition');
      const extraConditionRanks = extraConditionMod ? (Number(extraConditionMod.ranks) || 1) : 0;
      const isProgressive = (props.effect?.extras || []).some(e => e.name === 'Progressive');
      const isCumulative = (props.effect?.extras || []).some(e => e.name === 'Cumulative');

      let degs = [];
      degs.push(`1st: ${c.firstDegree || 'Dazed'}`);
      if (limitedDegreeRanks < 2) {
        degs.push(`2nd: ${c.secondDegree || 'Stunned'}`);
      }
      if (limitedDegreeRanks < 1) {
        degs.push(`3rd: ${c.thirdDegree || 'Paralyzed'}`);
      }
      let summary = `${degs.join(' | ')} (Resisted by ${c.resistance || props.effect.resistance || 'Fortitude'})`;
      if (isProgressive) summary += ' • Progressive';
      else if (isCumulative) summary += ' • Cumulative';
      if (extraConditionRanks > 0) summary += ` • Extra Cond (Rk ${extraConditionRanks})`;
      if (limitedDegreeRanks > 0) summary += ` • Limited Deg (Rk ${limitedDegreeRanks})`;
      return summary;
    }
    case 'Illusion': {
      const count = (c.senses || []).length;
      return `${count} senses affected • ${props.effect.baseCost} PP/Rank`;
    }
    case 'Immunity': {
      const count = (c.selectedPresets || []).length;
      return `${count} immunities active • ${props.effect.ranks} Ranks`;
    }
    case 'Movement': {
      const count = (c.selectedModes || []).length;
      return `${count} movement modes active • ${props.effect.ranks} Ranks`;
    }
    case 'Morph': {
      return `Scope Rank ${c.scope || 1} • ${props.effect.ranks * 5} PP`;
    }
    case 'Weaken': {
      return `Target: ${c.traitName || 'Stamina'} (Resisted by ${c.resistance || 'Fortitude'})`;
    }
    case 'Nullify': {
      return `Countered: ${c.descriptor === 'Custom' ? (c.customDescriptor || 'Custom') : (c.descriptor || 'Magic')}`;
    }
    case 'Comprehend': {
      const count = (c.selectedModes || []).length;
      return `${count} modes active • ${props.effect.ranks} Ranks`;
    }
    case 'Environment': {
      const count = (c.selectedElements || []).length;
      return `${count} hazards active • ${props.effect.baseCost} PP/Rank`;
    }
    case 'Variable': {
      return `Theme: ${c.theme || 'Magic / Sorcery'}`;
    }
    default:
      return 'Effect configuration parameters';
  }
});

const showCustomSubModal = ref(false);
const customSubModalTargetEffect = ref('Senses');
const editingCustomId = ref(null);

const customForm = ref({
  id: null,
  name: '',
  category: '',
  pts: 1,
  desc: '',
  icon: 'ri-flashlight-line',
  appliedTraits: []
});

const AVAILABLE_CUSTOM_ICONS = [
  'ri-eye-line', 'ri-eye-fill', 'ri-scan-line', 'ri-radar-line',
  'ri-shield-star-line', 'ri-shield-flash-line', 'ri-shield-check-line',
  'ri-fire-fill', 'ri-snowflake-line', 'ri-temp-cold-line',
  'ri-pulse-line', 'ri-brain-line', 'ri-earth-line',
  'ri-flashlight-line', 'ri-speed-line', 'ri-footprint-line',
  'ri-broadcast-line', 'ri-cpu-line', 'ri-settings-4-line', 'ri-drop-line',
  'ri-route-line', 'ri-planet-line', 'ri-rocket-line', 'ri-ghost-line',
  'ri-atom-line', 'ri-history-line', 'ri-umbrella-line', 'ri-walk-line',
  'ri-boxing-line', 'ri-drag-move-2-line'
];

const customCategoryOptions = computed(() => {
  const base = customSubModalTargetEffect.value;
  if (base === 'Senses') {
    return [
      { id: 'visual', label: 'Visual' },
      { id: 'auditory', label: 'Auditory' },
      { id: 'mental', label: 'Mental & Exotic' },
      { id: 'tactile', label: 'Tactile & Olfactory' },
      { id: 'spatial', label: 'Spatial & Utility' }
    ];
  }
  if (base === 'Immunity') {
    return [
      { id: 'survival', label: 'Survival & Env' },
      { id: 'biological', label: 'Biological & Sensory' },
      { id: 'descriptors', label: 'Descriptors' },
      { id: 'defenses', label: 'Defense Checks' }
    ];
  }
  if (base === 'Concealment') {
    return [
      { id: 'visual', label: 'Visual' },
      { id: 'auditory', label: 'Auditory' },
      { id: 'olfactory', label: 'Olfactory' },
      { id: 'radio', label: 'Radio' },
      { id: 'mental_exotic', label: 'Mental & Exotic' }
    ];
  }
  if (base === 'Enhanced Trait') {
    return [
      { id: 'abilities', label: 'Abilities' },
      { id: 'defenses', label: 'Defenses' },
      { id: 'skills', label: 'Skills' },
      { id: 'advantages', label: 'Advantages' }
    ];
  }
  return [];
});

const getCustomNamePlaceholder = computed(() => {
  const base = customSubModalTargetEffect.value;
  switch (base) {
    case 'Senses': return 'e.g. Cosmic Energy Sight, Leyline Tracker...';
    case 'Immunity': return 'e.g. Alien Radiation, Chrono-Displacement...';
    case 'Movement': return 'e.g. Gravity Inversion, Shadow Stride...';
    case 'Comprehend': return 'e.g. Alien Dialects, Quantum Frequencies...';
    case 'Environment': return 'e.g. Temporal Distortion, Corrosive Atmosphere...';
    case 'Concealment': return 'e.g. Quantum Obscurement, Astral Stealth...';
    case 'Enhanced Trait': return 'e.g. Hyper-Intuition, Alien Reflexes...';
    default: return 'Enter custom name...';
  }
});

const getCustomCostLabel = computed(() => {
  const base = customSubModalTargetEffect.value;
  if (base === 'Environment') return 'Base Cost (PP/Rank)';
  if (base === 'Enhanced Trait') return 'Cost (PP/Rank)';
  return 'Ranks / Cost';
});

const getCustomCostUnit = computed(() => {
  const base = customSubModalTargetEffect.value;
  if (base === 'Environment' || base === 'Enhanced Trait') return 'PP/R';
  return 'Ranks';
});

function openCustomSubModal(baseEffectName) {
  customSubModalTargetEffect.value = baseEffectName || props.effect?.baseEffect || 'Senses';
  editingCustomId.value = null;

  const defaultCat = customCategoryOptions.value[0]?.id || '';
  const defaultIcon = customSubModalTargetEffect.value === 'Senses' ? 'ri-eye-line'
    : customSubModalTargetEffect.value === 'Immunity' ? 'ri-shield-line'
    : customSubModalTargetEffect.value === 'Movement' ? 'ri-footprint-line'
    : customSubModalTargetEffect.value === 'Environment' ? 'ri-earth-line'
    : customSubModalTargetEffect.value === 'Enhanced Trait' ? 'ri-award-line'
    : 'ri-flashlight-line';

  let defaultPts = 1;
  if (customSubModalTargetEffect.value === 'Enhanced Trait') {
    const cat = props.effect?.config?.traitCategory || 'abilities';
    defaultPts = cat === 'defenses' ? 1 : (cat === 'advantages' ? 1 : (cat === 'skills' ? 0.5 : 2));
  }

  customForm.value = {
    id: null,
    name: '',
    category: defaultCat,
    pts: defaultPts,
    desc: '',
    icon: defaultIcon,
    appliedTraits: []
  };

  showCustomSubModal.value = true;
}

function editCustomSubItem(item) {
  customSubModalTargetEffect.value = props.effect?.baseEffect || 'Senses';
  editingCustomId.value = item.id;
  customForm.value = {
    id: item.id,
    name: item.name,
    category: item.category || '',
    pts: item.pts || item.ranks || item.cost || 1,
    desc: item.desc || '',
    icon: item.icon || 'ri-flashlight-line',
    appliedTraits: Array.isArray(item.appliedTraits) ? [...item.appliedTraits] : []
  };
  showCustomSubModal.value = true;
}

function closeCustomSubModal() {
  showCustomSubModal.value = false;
  editingCustomId.value = null;
}

function saveCustomSubItem() {
  if (!customForm.value.name.trim() || !props.effect) return;
  props.effect.config = props.effect.config || {};
  if (!Array.isArray(props.effect.config.customItems)) {
    props.effect.config.customItems = [];
  }

  const itemId = editingCustomId.value || ('custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
  const ptsVal = Number(customForm.value.pts) || 1;

  const customObj = {
    id: itemId,
    name: customForm.value.name.trim(),
    pts: ptsVal,
    ranks: ptsVal,
    cost: ptsVal,
    category: customForm.value.category,
    desc: customForm.value.desc ? customForm.value.desc.trim() : `Custom ${customSubModalTargetEffect.value} trait`,
    icon: customForm.value.icon || 'ri-flashlight-line',
    isCustom: true,
    appliedTraits: [...customForm.value.appliedTraits]
  };

  const existingIdx = props.effect.config.customItems.findIndex(c => c.id === itemId);
  if (existingIdx !== -1) {
    props.effect.config.customItems[existingIdx] = customObj;
  } else {
    props.effect.config.customItems.push(customObj);
  }

  // Auto-select newly created custom item into active list
  const base = props.effect.baseEffect;
  if (base === 'Senses') {
    if (!Array.isArray(props.effect.config.selectedFaculties)) props.effect.config.selectedFaculties = [];
    if (!props.effect.config.selectedFaculties.includes(itemId)) {
      props.effect.config.selectedFaculties.push(itemId);
    }
  } else if (base === 'Immunity') {
    if (!Array.isArray(props.effect.config.selectedPresets)) props.effect.config.selectedPresets = [];
    if (!props.effect.config.selectedPresets.includes(itemId)) {
      props.effect.config.selectedPresets.push(itemId);
    }
  } else if (base === 'Movement') {
    if (!Array.isArray(props.effect.config.selectedModes)) props.effect.config.selectedModes = [];
    if (!props.effect.config.selectedModes.some(m => (typeof m === 'object' ? m.id === itemId : m === itemId))) {
      props.effect.config.selectedModes.push({ id: itemId, name: customObj.name, ranks: customObj.ranks });
    }
  } else if (base === 'Comprehend') {
    if (!Array.isArray(props.effect.config.selectedModes)) props.effect.config.selectedModes = [];
    if (!props.effect.config.selectedModes.includes(itemId)) {
      props.effect.config.selectedModes.push(itemId);
    }
  } else if (base === 'Environment') {
    if (!Array.isArray(props.effect.config.selectedElements)) props.effect.config.selectedElements = [];
    if (!props.effect.config.selectedElements.includes(itemId)) {
      props.effect.config.selectedElements.push(itemId);
    }
  } else if (base === 'Concealment') {
    if (!Array.isArray(props.effect.config.selectedSenses)) props.effect.config.selectedSenses = [];
    if (!props.effect.config.selectedSenses.includes(itemId)) {
      props.effect.config.selectedSenses.push(itemId);
    }
  } else if (base === 'Enhanced Trait') {
    if (!Array.isArray(props.effect.config.selectedTraits)) props.effect.config.selectedTraits = [];
    if (!props.effect.config.selectedTraits.includes(customObj.name)) {
      props.effect.config.selectedTraits.push(customObj.name);
    }
    props.effect.config.traitName = customObj.name;
  }

  updateConfig();
  closeCustomSubModal();
}

function deleteCustomSubItem(itemId) {
  if (!props.effect?.config?.customItems) return;
  props.effect.config.customItems = props.effect.config.customItems.filter(c => c.id !== itemId);

  const base = props.effect.baseEffect;
  if (base === 'Senses' && Array.isArray(props.effect.config.selectedFaculties)) {
    props.effect.config.selectedFaculties = props.effect.config.selectedFaculties.filter(id => id !== itemId);
    if (props.effect.config.selectedFaculties.length === 0 && cfg.value?.defaultFaculties) {
      props.effect.config.selectedFaculties = [...cfg.value.defaultFaculties];
    }
  } else if (base === 'Immunity' && Array.isArray(props.effect.config.selectedPresets)) {
    props.effect.config.selectedPresets = props.effect.config.selectedPresets.filter(id => id !== itemId);
    if (props.effect.config.selectedPresets.length === 0 && cfg.value?.defaultPresets) {
      props.effect.config.selectedPresets = [...cfg.value.defaultPresets];
    }
  } else if (base === 'Movement' && Array.isArray(props.effect.config.selectedModes)) {
    props.effect.config.selectedModes = props.effect.config.selectedModes.filter(m => (typeof m === 'object' ? m.id !== itemId : m !== itemId));
    if (props.effect.config.selectedModes.length === 0 && cfg.value?.defaultModes) {
      props.effect.config.selectedModes = [{ id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 }];
    }
  } else if (base === 'Comprehend' && Array.isArray(props.effect.config.selectedModes)) {
    props.effect.config.selectedModes = props.effect.config.selectedModes.filter(id => id !== itemId);
    if (props.effect.config.selectedModes.length === 0 && cfg.value?.defaultModes) {
      props.effect.config.selectedModes = [...cfg.value.defaultModes];
    }
  } else if (base === 'Environment' && Array.isArray(props.effect.config.selectedElements)) {
    props.effect.config.selectedElements = props.effect.config.selectedElements.filter(id => id !== itemId);
    if (props.effect.config.selectedElements.length === 0 && cfg.value?.defaultElements) {
      props.effect.config.selectedElements = [...cfg.value.defaultElements];
    }
  } else if (base === 'Concealment' && Array.isArray(props.effect.config.selectedSenses)) {
    props.effect.config.selectedSenses = props.effect.config.selectedSenses.filter(id => id !== itemId);
    if (props.effect.config.selectedSenses.length === 0 && cfg.value?.defaultSenses) {
      props.effect.config.selectedSenses = [...cfg.value.defaultSenses];
    }
  }

  updateConfig();
}

function isCustomTrait(traitName) {
  return (props.effect?.config?.customItems || []).some(c => c.name === traitName || c.id === traitName);
}

function editCustomTrait(traitName) {
  const item = (props.effect?.config?.customItems || []).find(c => c.name === traitName || c.id === traitName);
  if (item) {
    editCustomSubItem(item);
  }
}

function deleteCustomTrait(traitName) {
  const item = (props.effect?.config?.customItems || []).find(c => c.name === traitName || c.id === traitName);
  if (item) {
    props.effect.config.customItems = props.effect.config.customItems.filter(c => c.id !== item.id);
  }
  if (Array.isArray(props.effect?.config?.selectedTraits)) {
    props.effect.config.selectedTraits = props.effect.config.selectedTraits.filter(t => t !== traitName);
    if (props.effect.config.selectedTraits.length === 0) {
      const defaultT = cfg.value?.categories?.[props.effect?.config?.traitCategory || 'abilities']?.traits?.[0] || 'Strength';
      props.effect.config.selectedTraits = [defaultT];
      props.effect.config.traitName = defaultT;
    }
  }
  updateConfig();
}

// Provide custom item actions to child configurators
provide('customSubModal', {
  open: openCustomSubModal,
  edit: editCustomSubItem,
  delete: deleteCustomSubItem,
  isTrait: isCustomTrait,
  editTrait: editCustomTrait,
  deleteTrait: deleteCustomTrait
});
</script>

<style>
@import '../../styles/components/effect-configurator.css';
</style>
