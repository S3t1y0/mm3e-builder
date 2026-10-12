<template>
      <div  class="config-body config-illusion">
      <div class="illusion-intro">
        <span>Select sensory impressions affected. Base cost is <strong>1 PP per Rank per sense type</strong> (1 to 5 PP/Rank).</span>
      </div>
      <div class="illusion-senses-grid">
        <div
          v-for="s in cfg.senses"
          :key="s.id"
          class="illusion-sense-card"
          :class="{ selected: isIllusionSenseSelected(s.id) }"
          @click="toggleIllusionSense(s.id)"
        >
          <div class="sense-icon-col">
            <i :class="s.icon || 'ri-eye-line'"></i>
          </div>
          <div class="sense-text-col">
            <div class="sense-name-row">
              <span class="sense-name">{{ s.name }}</span>
              <span class="sense-badge">+1 PP/R</span>
            </div>
            <p class="sense-desc">{{ s.desc }}</p>
          </div>
          <div class="sense-toggle-check">
            <i :class="isIllusionSenseSelected(s.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
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
  
function isIllusionSenseSelected(senseId) {
  const sel = props.effect?.config?.senses;
  return Array.isArray(sel) && sel.includes(senseId);
}

function toggleIllusionSense(senseId) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.senses)
    ? [...props.effect.config.senses]
    : ['Visual'];

  if (list.includes(senseId)) {
    if (list.length > 1) {
      list = list.filter(s => s !== senseId);
    }
  } else {
    list.push(senseId);
  }

  props.effect.config.senses = list;
  updateConfig();
}

</script>
