<template>
      <div  class="config-body config-library">
      <div v-if="selectedFacultiesList.length > 0" class="selected-senses-ribbon">
        <div class="ribbon-title">
          <i class="ri-checkbox-circle-fill text-emerald"></i>
          <span>Active Senses ({{ totalSensesRanks }} {{ totalSensesRanks > 1 ? 'Ranks' : 'Rank' }}):</span>
        </div>
        <div class="ribbon-pills-row">
          <button
            v-for="fac in selectedFacultiesList"
            :key="fac.id"
            type="button"
            class="sense-active-pill"
            :disabled="selectedFacultiesList.length <= 1"
            @click="toggleFaculty(fac.id)"
            :title="selectedFacultiesList.length <= 1 ? 'At least one faculty is required' : 'Click to remove'"
          >
            <i :class="fac.icon || 'ri-eye-line'"></i>
            <span class="pill-name">{{ fac.name }}</span>
            <span class="pill-pts">+{{ fac.pts }} R</span>
            <i v-if="selectedFacultiesList.length > 1" class="ri-close-line pill-close"></i>
          </button>
        </div>
      </div>
      <div class="library-filter-bar">
        <div class="library-tabs">
          <button
            v-for="cat in cfg.categories"
            :key="cat.id"
            type="button"
            class="lib-tab-btn"
            :class="{ active: selectedSensesCategory === cat.id }"
            @click="selectedSensesCategory = cat.id"
          >
            {{ cat.label }}
            <span class="tab-count">
              {{ getSensesCountForCat(cat.id) }}
            </span>
          </button>
        </div>

        <div class="lib-actions-row">
          <div class="lib-search-box">
            <i class="ri-search-line"></i>
            <input
              v-model="sensesSearch"
              type="text"
              class="lib-search-input"
              placeholder="Search sensory faculties (e.g. Darkvision, Danger Sense)..."
            />
            <button v-if="sensesSearch" type="button" class="clear-search-btn" @click="sensesSearch = ''">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <button
            type="button"
            class="btn-custom-sub-target"
            @click="openCustomSubModal('Senses')"
          >
            <i class="ri-add-line"></i>
            <span>Custom Sense</span>
          </button>
        </div>
      </div>
      <div class="library-cards-grid horizontal-senses-grid" data-seamless-scroll>
        <div
          v-for="fac in filteredFaculties"
          :key="fac.id"
          class="lib-item-card horizontal-sense-card"
          :class="{ selected: isFacultySelected(fac.id), 'custom-item-card': fac.isCustom }"
          @click="toggleFaculty(fac.id)"
        >
          <div class="sense-card-left">
            <div class="card-icon-title">
              <i :class="fac.icon || 'ri-eye-line'"></i>
              <div class="sense-text-meta">
                <div class="sense-name-row">
                  <span class="card-title">{{ fac.name }}</span>
                  <span v-if="fac.isCustom" class="custom-badge-pill">CUSTOM</span>
                  <span class="card-pts-badge">+{{ fac.pts }} {{ fac.pts > 1 ? 'Ranks' : 'Rank' }}</span>
                </div>
                <p class="card-desc">{{ fac.desc }}</p>
              </div>
            </div>
          </div>
          <div class="sense-card-right">
            <div v-if="fac.isCustom" class="custom-item-actions" @click.stop>
              <button type="button" class="btn-custom-action edit" title="Edit Custom Sense" @click="editCustomSubItem(fac)">
                <i class="ri-edit-line"></i>
              </button>
              <button type="button" class="btn-custom-action delete" title="Delete Custom Sense" @click="deleteCustomSubItem(fac.id)">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
            <span class="selection-status">
              <i :class="isFacultySelected(fac.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              <span class="status-label">{{ isFacultySelected(fac.id) ? 'Active' : 'Add' }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup>
import { computed, ref, inject } from 'vue';

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


const selectedSensesCategory = ref('all');
const sensesSearch = ref('');

const selectedFacultiesList = computed(() => {
  const sel = props.effect?.config?.selectedFaculties;
  if (!Array.isArray(sel)) return [];
  const allFaculties = [...(cfg.value?.faculties || []), ...(props.effect?.config?.customItems || [])];
  return allFaculties.filter(f => sel.includes(f.id));
});

const totalSensesRanks = computed(() => {
  return selectedFacultiesList.value.reduce((sum, f) => sum + (f.pts || 1), 0);
});

function getSensesCountForCat(catId) {
  const allFaculties = [...(cfg.value?.faculties || []), ...(props.effect?.config?.customItems || [])];
  if (catId === 'all') return allFaculties.length;
  return allFaculties.filter(f => f.category === catId).length;
}

const filteredFaculties = computed(() => {
  const allFaculties = [...(cfg.value?.faculties || []), ...(props.effect?.config?.customItems || [])];
  return allFaculties.filter(f => {
    const matchCat = selectedSensesCategory.value === 'all' || f.category === selectedSensesCategory.value;
    if (!matchCat) return false;
    if (!sensesSearch.value.trim()) return true;
    const q = sensesSearch.value.toLowerCase();
    return f.name.toLowerCase().includes(q) || (f.desc && f.desc.toLowerCase().includes(q));
  });
});

function isFacultySelected(facId) {
  const sel = props.effect?.config?.selectedFaculties;
  return Array.isArray(sel) && sel.includes(facId);
}

function toggleFaculty(facId) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.selectedFaculties)
    ? [...props.effect.config.selectedFaculties]
    : [];

  if (list.includes(facId)) {
    if (list.length > 1) {
      list = list.filter(id => id !== facId);
    }
  } else {
    list.push(facId);
  }

  props.effect.config.selectedFaculties = list;
  updateConfig();
}

</script>
