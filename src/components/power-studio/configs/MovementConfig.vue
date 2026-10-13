<template>
      <div  class="config-body config-movement">
      <div class="library-filter-bar movement-filter-bar">
        <span class="movement-strip-label"><i class="ri-route-line"></i> Movement Modes:</span>
        <button
          type="button"
          class="btn-custom-sub-target"
          @click="openCustomSubModal('Movement')"
        >
          <i class="ri-add-line"></i>
          <span>Custom Movement</span>
        </button>
      </div>

      <div class="movement-grid">
        <div
          v-for="mode in allMovementModes"
          :key="mode.id"
          class="movement-mode-card"
          :class="{ active: isMovementModeActive(mode.id), 'custom-item-card': mode.isCustom }"
        >
          <div class="mode-header" @click="toggleMovementMode(mode.id)">
            <div class="mode-identity">
              <i :class="mode.icon || 'ri-footprint-line'"></i>
              <span class="mode-name">{{ mode.name }}</span>
              <span v-if="mode.isCustom" class="custom-badge-pill">CUSTOM</span>
            </div>
            <div class="mode-right-header">
              <div v-if="mode.isCustom" class="custom-item-actions" @click.stop>
                <button type="button" class="btn-custom-action edit" title="Edit" @click="editCustomSubItem(mode)">
                  <i class="ri-edit-line"></i>
                </button>
                <button type="button" class="btn-custom-action delete" title="Delete" @click="deleteCustomSubItem(mode.id)">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
              <div class="mode-check">
                <i :class="isMovementModeActive(mode.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              </div>
            </div>
          </div>

          <p class="mode-desc">{{ mode.desc }}</p>

          <div v-if="isMovementModeActive(mode.id)" class="mode-ranks-stepper">
            <span class="stepper-label">Purchased Ranks:</span>
            <div v-if="(mode.maxRanks || 5) > 1" class="stepper-controls">
              <button
                type="button"
                class="step-btn"
                :disabled="getMovementModeRanks(mode.id) <= 1"
                @click="stepMovementMode(mode.id, -1)"
              >-</button>
              <span class="step-value">Rank {{ getMovementModeRanks(mode.id) }} / {{ mode.maxRanks || 5 }}</span>
              <button
                type="button"
                class="step-btn"
                :disabled="getMovementModeRanks(mode.id) >= (mode.maxRanks || 5)"
                @click="stepMovementMode(mode.id, 1)"
              >+</button>
            </div>
            <div v-else class="stepper-controls">
              <span class="step-value">Rank 1 (Fixed)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  effect: { type: Object, required: true },
  cfg: { type: Object, required: true }
});
const cfg = computed(() => props.cfg);
const emit = defineEmits(['update', 'open-custom']);

const customSubModal = inject('customSubModal', null);

function updateConfig() {
  emit('update');
}

function openCustomSubModal(type) {
  if (customSubModal?.open) {
    customSubModal.open(type);
  } else {
    emit('open-custom', type);
  }
}

function editCustomSubItem(item) {
  customSubModal?.edit?.(item);
}

function deleteCustomSubItem(itemId) {
  customSubModal?.delete?.(itemId);
}


const allMovementModes = computed(() => {
  return [...(cfg.value?.modes || []), ...(props.effect?.config?.customItems || [])];
});

function isMovementModeActive(modeId) {
  const sel = props.effect?.config?.selectedModes;
  if (!Array.isArray(sel)) return false;
  return sel.some(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
}

function getMovementModeRanks(modeId) {
  const sel = props.effect?.config?.selectedModes;
  if (!Array.isArray(sel)) return 1;
  const match = sel.find(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
  if (match && typeof match === 'object') return Number(match.ranks) || 1;
  return 1;
}

function toggleMovementMode(modeId) {
  props.effect.config = props.effect.config || {};
  let sel = Array.isArray(props.effect.config.selectedModes)
    ? [...props.effect.config.selectedModes]
    : [];

  const exists = sel.some(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
  if (exists) {
    if (sel.length > 1) {
      sel = sel.filter(m => (typeof m === 'object' ? m.id !== modeId : m !== modeId));
    }
  } else {
    const allModes = allMovementModes.value;
    const modeDef = allModes.find(m => m.id === modeId);
    sel.push({ id: modeId, name: modeDef?.name || modeId, ranks: modeDef?.ranks || 1 });
  }

  props.effect.config.selectedModes = sel;
  updateConfig();
}

function stepMovementMode(modeId, delta) {
  props.effect.config = props.effect.config || {};
  const sel = Array.isArray(props.effect.config.selectedModes)
    ? [...props.effect.config.selectedModes]
    : [];

  const idx = sel.findIndex(m => (typeof m === 'object' ? m.id === modeId : m === modeId));
  if (idx >= 0) {
    const allModes = allMovementModes.value;
    const modeDef = allModes.find(m => m.id === modeId);
    const max = modeDef?.maxRanks || 5;
    const currentRanks = typeof sel[idx] === 'object' ? (Number(sel[idx].ranks) || 1) : 1;
    const newRanks = Math.max(1, Math.min(max, currentRanks + delta));

    sel[idx] = { id: modeId, name: modeDef?.name || modeId, ranks: newRanks };
    props.effect.config.selectedModes = sel;
    updateConfig();
  }
}

</script>
