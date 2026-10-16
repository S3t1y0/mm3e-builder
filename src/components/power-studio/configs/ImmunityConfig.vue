<template>
      <div  class="config-body config-library">
      <div class="library-filter-bar">
        <div class="library-tabs">
          <button
            v-for="cat in cfg.categories"
            :key="cat.id"
            type="button"
            class="lib-tab-btn"
            :class="{ active: selectedImmunityCategory === cat.id }"
            @click="selectedImmunityCategory = cat.id"
          >
            {{ cat.label }}
            <span class="tab-count">
              {{ getImmunityCountForCat(cat.id) }}
            </span>
          </button>
        </div>

        <div class="lib-actions-row">
          <div class="lib-search-box">
            <i class="ri-search-line"></i>
            <input
              v-model="immunitySearch"
              type="text"
              class="lib-search-input"
              placeholder="Search immunities (e.g. Life Support, Fire, Aging)..."
            />
            <button v-if="immunitySearch" type="button" class="clear-search-btn" @click="immunitySearch = ''">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <button
            type="button"
            class="btn-custom-sub-target"
            @click="openCustomSubModal('Immunity')"
          >
            <i class="ri-add-line"></i>
            <span>Custom Immunity</span>
          </button>
        </div>
      </div>

      <div class="library-cards-grid" data-seamless-scroll>
        <div
          v-for="item in filteredImmunities"
          :key="item.id"
          class="lib-item-card"
          :class="{ selected: isImmunitySelected(item.id), 'custom-item-card': item.isCustom }"
          @click="toggleImmunity(item.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="item.icon || 'ri-shield-line'"></i>
              <span class="card-title">{{ item.name }}</span>
              <span v-if="item.isCustom" class="custom-badge-pill">CUSTOM</span>
            </div>
            <div class="card-top-right">
              <div v-if="item.isCustom" class="custom-item-actions" @click.stop>
                <button type="button" class="btn-custom-action edit" @click="editCustomSubItem(item)">
                  <i class="ri-edit-line"></i>
                </button>
                <button type="button" class="btn-custom-action delete" @click="deleteCustomSubItem(item.id)">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
              <div class="card-pts-badge immunity-badge">
                {{ item.ranks }} {{ item.ranks > 1 ? 'Ranks' : 'Rank' }}
              </div>
            </div>
          </div>
          <p class="card-desc">{{ item.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isImmunitySelected(item.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isImmunitySelected(item.id) ? 'Active' : 'Click to Add' }}
            </span>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup>
import { computed, ref } from 'vue';
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


const selectedImmunityCategory = ref('all');
const immunitySearch = ref('');

function getImmunityCountForCat(catId) {
  const allPresets = [...(cfg.value?.presets || []), ...(props.effect?.config?.customItems || [])];
  if (catId === 'all') return allPresets.length;
  return allPresets.filter(p => p.category === catId).length;
}

const filteredImmunities = computed(() => {
  const allPresets = [...(cfg.value?.presets || []), ...(props.effect?.config?.customItems || [])];
  return allPresets.filter(item => {
    const matchCat = selectedImmunityCategory.value === 'all' || item.category === selectedImmunityCategory.value;
    if (!matchCat) return false;
    if (!immunitySearch.value.trim()) return true;
    const q = immunitySearch.value.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q));
  });
});

function isImmunitySelected(id) {
  const sel = props.effect?.config?.selectedPresets;
  return Array.isArray(sel) && sel.includes(id);
}

function toggleImmunity(id) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.selectedPresets)
    ? [...props.effect.config.selectedPresets]
    : [];

  if (list.includes(id)) {
    if (list.length > 1) {
      list = list.filter(i => i !== id);
    }
  } else {
    list.push(id);
  }

  props.effect.config.selectedPresets = list;
  updateConfig();
}

</script>
