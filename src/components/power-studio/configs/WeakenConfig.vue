<template>
      <div  class="config-body config-weaken">
      <div class="trait-picker-horizontal-layout">
        <div class="trait-category-sidebar">
          <div class="sidebar-section-title">
            <i class="ri-folder-settings-line"></i>
            <span>1. Target Category</span>
          </div>
          <div class="trait-category-list">
            <button
              v-for="(traits, catKey) in cfg.traitCategories"
              :key="catKey"
              type="button"
              class="trait-cat-btn"
              :class="{ active: currentWeakenCategory === catKey }"
              @click="selectWeakenCategory(catKey)"
            >
              <span class="cat-label">{{ formatWeakenCatLabel(catKey) }}</span>
            </button>
          </div>
        </div>

        <div class="trait-selector-box">
          <span class="selector-prompt">
            <i class="ri-focus-3-line"></i>
            <span>2. Target Trait to Drain/Weaken:</span>
          </span>
          <div class="trait-chips-grid">
            <button
              v-for="trait in cfg.traitCategories[currentWeakenCategory] || []"
              :key="trait"
              type="button"
              class="trait-chip"
              :class="{ active: effect.config?.traitName === trait }"
              @click="selectWeakenTrait(trait)"
            >
              <i v-if="effect.config?.traitName === trait" class="ri-check-line chip-check"></i>
              <span>{{ trait }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="resistance-defense-row">
        <label class="res-label">
          <i class="ri-shield-line"></i> Resisted By:
        </label>
        <div class="res-toggle-group">
          <button
            v-for="resOpt in cfg.resistanceOptions"
            :key="resOpt"
            type="button"
            class="res-btn"
            :class="{ active: (effect.config?.resistance || effect.resistance) === resOpt }"
            @click="selectWeakenResistance(resOpt)"
          >
            <i :class="resOpt === 'Fortitude' ? 'ri-shield-cross-line' : 'ri-mental-health-line'"></i>
            <span>{{ resOpt }}</span>
          </button>
        </div>
      </div>
    </div>

</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  effect: { type: Object, required: true },
  cfg: { type: Object, required: true }
});
const cfg = computed(() => props.cfg);
const emit = defineEmits(['update']);

function updateConfig() {
  emit('update');
}
  
const currentWeakenCategory = ref('abilities');

function formatWeakenCatLabel(key) {
  switch (key) {
    case 'abilities': return 'Abilities';
    case 'defenses': return 'Defenses';
    case 'broad': return 'Broad Descriptor';
    default: return key;
  }
}

function selectWeakenCategory(catKey) {
  currentWeakenCategory.value = catKey;
  const list = cfg.value.traitCategories?.[catKey] || [];
  if (list.length > 0 && !list.includes(props.effect.config?.traitName)) {
    props.effect.config = props.effect.config || {};
    props.effect.config.traitName = list[0];
    updateConfig();
  }
}

function selectWeakenTrait(trait) {
  props.effect.config = props.effect.config || {};
  props.effect.config.traitName = trait;
  updateConfig();
}

function selectWeakenResistance(resOpt) {
  props.effect.config = props.effect.config || {};
  props.effect.config.resistance = resOpt;
  props.effect.resistance = resOpt;
  updateConfig();
}

</script>
