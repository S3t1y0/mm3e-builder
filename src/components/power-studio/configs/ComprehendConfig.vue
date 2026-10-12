<template>
      <div  class="config-body config-library">
      <div class="library-filter-bar">
        <span class="library-title-label"><i class="ri-translate-2"></i> Comprehend Communication Modes:</span>
        <button
          type="button"
          class="btn-custom-sub-target"
          @click="openCustomSubModal('Comprehend')"
        >
          <i class="ri-add-line"></i>
          <span>Custom Mode</span>
        </button>
      </div>

      <div class="library-cards-grid" data-seamless-scroll>
        <div
          v-for="mode in allComprehendModes"
          :key="mode.id"
          class="lib-item-card"
          :class="{ selected: isComprehendSelected(mode.id), 'custom-item-card': mode.isCustom }"
          @click="toggleComprehend(mode.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="mode.icon || 'ri-translate-2'"></i>
              <span class="card-title">{{ mode.name }}</span>
              <span v-if="mode.isCustom" class="custom-badge-pill">CUSTOM</span>
            </div>
            <div class="card-top-right">
              <div v-if="mode.isCustom" class="custom-item-actions" @click.stop>
                <button type="button" class="btn-custom-action edit" title="Edit" @click="editCustomSubItem(mode)">
                  <i class="ri-edit-line"></i>
                </button>
                <button type="button" class="btn-custom-action delete" title="Delete" @click="deleteCustomSubItem(mode.id)">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
              <div class="card-pts-badge">
                {{ mode.ranks }} {{ mode.ranks > 1 ? 'Ranks' : 'Rank' }}
              </div>
            </div>
          </div>
          <p class="card-desc">{{ mode.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isComprehendSelected(mode.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isComprehendSelected(mode.id) ? 'Active' : 'Click to Add' }}
            </span>
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


const allComprehendModes = computed(() => {
  return [...(cfg.value?.modes || []), ...(props.effect?.config?.customItems || [])];
});

function isComprehendSelected(modeId) {
  const sel = props.effect?.config?.selectedModes;
  return Array.isArray(sel) && sel.includes(modeId);
}

function toggleComprehend(modeId) {
  props.effect.config = props.effect.config || {};
  let sel = Array.isArray(props.effect.config.selectedModes)
    ? [...props.effect.config.selectedModes]
    : [];

  if (sel.includes(modeId)) {
    if (sel.length > 1) {
      sel = sel.filter(m => m !== modeId);
    }
  } else {
    sel.push(modeId);
  }

  props.effect.config.selectedModes = sel;
  updateConfig();
}

</script>
