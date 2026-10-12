<template>
      <div  class="config-body config-morph">
      <div class="morph-scopes-grid">
        <div
          v-for="scope in cfg.scopes"
          :key="scope.ranks"
          class="morph-scope-card"
          :class="{ active: (Number(effect.config?.scope) || 1) === scope.ranks }"
          @click="selectMorphScope(scope.ranks)"
        >
          <div class="scope-card-top">
            <span class="scope-ranks-tag">Rank {{ scope.ranks }}</span>
            <span class="scope-cost-badge">{{ scope.cost }} PP</span>
          </div>
          <span class="scope-name">{{ scope.name.split(' (')[0] }}</span>
          <p class="scope-desc">{{ scope.desc }}</p>
          <div class="scope-footer">
            <i :class="(Number(effect.config?.scope) || 1) === scope.ranks ? 'ri-radio-button-fill' : 'ri-checkbox-blank-circle-line'"></i>
            <span>{{ (Number(effect.config?.scope) || 1) === scope.ranks ? 'Selected Scope' : 'Select' }}</span>
          </div>
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
  
function selectMorphScope(scopeRanks) {
  props.effect.config = props.effect.config || {};
  props.effect.config.scope = scopeRanks;
  props.effect.ranks = scopeRanks;
  updateConfig();
}

</script>
