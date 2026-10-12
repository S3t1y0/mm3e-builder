<template>
      <div  class="config-body config-nullify">
      <div class="descriptor-intro">
        <span>Select or enter the specific descriptor/power type countered by Nullify:</span>
      </div>
      <div class="descriptor-chips-grid">
        <button
          v-for="desc in cfg.descriptors"
          :key="desc"
          type="button"
          class="trait-chip"
          :class="{ active: effect.config?.descriptor === desc }"
          @click="selectNullifyDescriptor(desc)"
        >
          <i v-if="effect.config?.descriptor === desc" class="ri-check-line chip-check"></i>
          <span>{{ desc }}</span>
        </button>
      </div>

      <div v-if="effect.config?.descriptor === 'Custom'" class="custom-desc-input-row">
        <label class="field-label">Custom Countered Descriptor:</label>
        <input
          v-model="effect.config.customDescriptor"
          type="text"
          class="text-input"
          placeholder="e.g. Divine Magic, Solar Energy, Kryptonite..."
          @input="updateConfig"
        />
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
  
function selectNullifyDescriptor(desc) {
  props.effect.config = props.effect.config || {};
  props.effect.config.descriptor = desc;
  updateConfig();
}

</script>
