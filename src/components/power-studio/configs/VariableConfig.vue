<template>
      <div  class="config-body config-variable">
      <div class="descriptor-intro">
        <span>Choose the thematic descriptor and scope for this Variable power pool:</span>
      </div>
      <div class="descriptor-chips-grid">
        <button
          v-for="th in cfg.themes"
          :key="th"
          type="button"
          class="trait-chip"
          :class="{ active: effect.config?.theme === th }"
          @click="selectVariableTheme(th)"
        >
          <i v-if="effect.config?.theme === th" class="ri-check-line chip-check"></i>
          <span>{{ th }}</span>
        </button>
      </div>

      <div class="custom-desc-input-row">
        <label class="field-label">Custom Theme / Descriptor Descriptor:</label>
        <input
          v-model="effect.config.theme"
          type="text"
          class="text-input"
          placeholder="e.g. Technological Gadgets, Biomorphing, Mystic Spells..."
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
  
function selectVariableTheme(theme) {
  props.effect.config = props.effect.config || {};
  props.effect.config.theme = theme;
  updateConfig();
}

</script>
