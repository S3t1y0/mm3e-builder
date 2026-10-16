<template>
      <div  class="config-body config-library">
      <div class="library-filter-bar">
        <span class="library-title-label"><i class="ri-earth-line"></i> Environmental Hazards & Ambient Effects:</span>
        <button
          type="button"
          class="btn-custom-sub-target"
          @click="openCustomSubModal('Environment')"
        >
          <i class="ri-add-line"></i>
          <span>Custom Element</span>
        </button>
      </div>

      <div class="library-cards-grid" data-seamless-scroll>
        <div
          v-for="el in allEnvironmentElements"
          :key="el.id"
          class="lib-item-card"
          :class="{ selected: isEnvironmentSelected(el.id), 'custom-item-card': el.isCustom }"
          @click="toggleEnvironment(el.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="el.icon || 'ri-earth-line'"></i>
              <span class="card-title">{{ el.name }}</span>
              <span v-if="el.isCustom" class="custom-badge-pill">CUSTOM</span>
            </div>
            <div class="card-top-right">
              <div v-if="el.isCustom" class="custom-item-actions" @click.stop>
                <button type="button" class="btn-custom-action edit" @click="editCustomSubItem(el)">
                  <i class="ri-edit-line"></i>
                </button>
                <button type="button" class="btn-custom-action delete" @click="deleteCustomSubItem(el.id)">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
              <div class="card-pts-badge">
                +{{ el.cost }} PP/R
              </div>
            </div>
          </div>
          <p class="card-desc">{{ el.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isEnvironmentSelected(el.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isEnvironmentSelected(el.id) ? 'Selected' : 'Click to Add' }}
            </span>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup>
import { computed } from 'vue';
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
  editCustomSubItem,
  deleteCustomSubItem
} = useCustomSubModal(emit);


const allEnvironmentElements = computed(() => {
  return [...(cfg.value?.elements || []), ...(props.effect?.config?.customItems || [])];
});

function isEnvironmentSelected(elId) {
  const sel = props.effect?.config?.selectedElements;
  return Array.isArray(sel) && sel.includes(elId);
}

function toggleEnvironment(elId) {
  props.effect.config = props.effect.config || {};
  let sel = Array.isArray(props.effect.config.selectedElements)
    ? [...props.effect.config.selectedElements]
    : [];

  if (sel.includes(elId)) {
    if (sel.length > 1) {
      sel = sel.filter(e => e !== elId);
    }
  } else {
    sel.push(elId);
  }

  props.effect.config.selectedElements = sel;
  updateConfig();
}

</script>
