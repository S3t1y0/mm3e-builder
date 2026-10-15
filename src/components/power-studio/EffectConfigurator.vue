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
import { computed, watch, onMounted } from 'vue';
import { CONFIGURABLE_EFFECTS, normalizeEffect } from '../../rules/powerEngine.js';
import { useCustomSubModalHost } from './configs/useCustomSubModal.js';

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

const {
  showCustomSubModal,
  customSubModalTargetEffect,
  editingCustomId,
  customForm,
  AVAILABLE_CUSTOM_ICONS,
  customCategoryOptions,
  getCustomNamePlaceholder,
  getCustomCostLabel,
  getCustomCostUnit,
  openCustomSubModal,
  editCustomSubItem,
  closeCustomSubModal,
  saveCustomSubItem,
  deleteCustomSubItem,
  isCustomTrait,
  editCustomTrait,
  deleteCustomTrait
} = useCustomSubModalHost(props, cfg, updateConfig);
</script>

<style>
@import '../../styles/components/effect-configurator.css';
</style>
