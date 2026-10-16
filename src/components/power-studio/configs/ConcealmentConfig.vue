<template>
      <div  class="config-body config-library">
      <div v-if="selectedConcealmentList.length > 0" class="selected-senses-ribbon">
        <div class="ribbon-title">
          <i class="ri-checkbox-circle-fill text-emerald"></i>
          <span>Active Concealment ({{ totalConcealmentRanks }} {{ totalConcealmentRanks > 1 ? 'Ranks' : 'Rank' }} • {{ totalConcealmentRanks * 2 }} PP):</span>
        </div>
        <div class="ribbon-pills-row">
          <button
            v-for="opt in selectedConcealmentList"
            :key="opt.id"
            type="button"
            class="sense-active-pill"
            :disabled="selectedConcealmentList.length <= 1"
            @click="toggleConcealment(opt.id)"
          >
            <i :class="opt.icon || 'ri-eye-close-line'"></i>
            <span class="pill-name">{{ opt.name }}</span>
            <span class="pill-pts">+{{ opt.ranks }} R ({{ opt.ranks * 2 }} PP)</span>
            <i v-if="selectedConcealmentList.length > 1" class="ri-close-line pill-close"></i>
          </button>
        </div>
      </div>
      <div class="srd-notice-banner">
        <div class="srd-notice-icon">
          <i class="ri-book-open-line"></i>
        </div>
        <div class="srd-notice-content">
          <div class="srd-notice-title">M&M 3e SRD Sensory Concealment Rules</div>
          <div class="srd-notice-text">
            <strong>Visual senses cost double</strong> (2 Ranks for single sense, 4 Ranks for all visual). 
            <strong>Non-visual senses</strong> cost 1 Rank each (2 Ranks for entire sense type). 
            <strong>Tactile senses are excluded</strong> (requires <em>Insubstantial</em>). 
            <strong>All senses (non-tactile)</strong> costs 10 Ranks.
          </div>
        </div>
      </div>
      <div class="library-filter-bar">
        <div class="library-tabs">
          <button
            v-for="cat in cfg.categories"
            :key="cat.id"
            type="button"
            class="lib-tab-btn"
            :class="{ active: selectedConcealmentCategory === cat.id }"
            @click="selectedConcealmentCategory = cat.id"
          >
            {{ cat.label }}
            <span class="tab-count">
              {{ getConcealmentCountForCat(cat.id) }}
            </span>
          </button>
        </div>

        <div class="lib-actions-row">
          <div class="lib-search-box">
            <i class="ri-search-line"></i>
            <input
              v-model="concealmentSearch"
              type="text"
              class="lib-search-input"
              placeholder="Search sense (e.g. Normal Vision, Hearing, Radar, Invisibility)..."
            />
            <button v-if="concealmentSearch" type="button" class="clear-search-btn" @click="concealmentSearch = ''">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <button
            type="button"
            class="btn-custom-sub-target"
            @click="openCustomSubModal('Concealment')"
          >
            <i class="ri-add-line"></i>
            <span>Custom Sense</span>
          </button>
        </div>
      </div>
      <div class="library-cards-grid" data-seamless-scroll>
        <div
          v-for="item in filteredConcealments"
          :key="item.id"
          class="lib-item-card"
          :class="{ selected: isConcealmentSelected(item.id), 'custom-item-card': item.isCustom }"
          @click="toggleConcealment(item.id)"
        >
          <div class="card-top">
            <div class="card-icon-title">
              <i :class="item.icon || 'ri-eye-close-line'"></i>
              <div class="card-title-group">
                <span class="card-title">{{ item.name }}</span>
                <span v-if="item.isCustom" class="custom-badge-pill">CUSTOM</span>
                <span v-if="item.scopeLabel" class="card-scope-tag">{{ item.scopeLabel }}</span>
              </div>
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
                {{ item.ranks }} {{ item.ranks > 1 ? 'Ranks' : 'Rank' }} ({{ item.ranks * 2 }} PP)
              </div>
            </div>
          </div>
          <p class="card-desc">{{ item.desc }}</p>
          <div class="card-footer">
            <span class="selection-status">
              <i :class="isConcealmentSelected(item.id) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              {{ isConcealmentSelected(item.id) ? 'Active' : 'Click to Add' }}
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


const selectedConcealmentCategory = ref('all');
const concealmentSearch = ref('');

const selectedConcealmentList = computed(() => {
  const allOptions = [...(cfg.value?.options || []), ...(props.effect?.config?.customItems || [])];
  const sel = props.effect?.config?.selectedSenses || [];
  return allOptions.filter(opt => sel.includes(opt.id));
});

const totalConcealmentRanks = computed(() => {
  if (typeof cfg.value?.computeRanks === 'function') {
    return cfg.value.computeRanks(props.effect?.config);
  }
  return props.effect?.ranks || 1;
});

function getConcealmentCountForCat(catId) {
  const allOptions = [...(cfg.value?.options || []), ...(props.effect?.config?.customItems || [])];
  if (catId === 'all') return allOptions.length;
  return allOptions.filter(o => o.category === catId).length;
}

const filteredConcealments = computed(() => {
  const allOptions = [...(cfg.value?.options || []), ...(props.effect?.config?.customItems || [])];
  return allOptions.filter(item => {
    const matchCat = selectedConcealmentCategory.value === 'all' || item.category === selectedConcealmentCategory.value;
    if (!matchCat) return false;
    if (!concealmentSearch.value.trim()) return true;
    const q = concealmentSearch.value.toLowerCase();
    return item.name.toLowerCase().includes(q) 
      || (item.desc && item.desc.toLowerCase().includes(q))
      || (item.scopeLabel && item.scopeLabel.toLowerCase().includes(q));
  });
});

function isConcealmentSelected(id) {
  const sel = props.effect?.config?.selectedSenses;
  return Array.isArray(sel) && sel.includes(id);
}

function toggleConcealment(id) {
  props.effect.config = props.effect.config || {};
  let list = Array.isArray(props.effect.config.selectedSenses)
    ? [...props.effect.config.selectedSenses]
    : [];

  if (list.includes(id)) {
    if (list.length > 1) {
      list = list.filter(i => i !== id);
    }
  } else {
    if (id === 'all_senses') {
      list = ['all_senses'];
    } else {
      list = list.filter(i => i !== 'all_senses');

      // Selecting an entire sense type removes individual sub-senses
      if (id === 'visual_all') {
        list = list.filter(i => !['visual_normal', 'visual_infra', 'visual_ultra'].includes(i));
      } else if (['visual_normal', 'visual_infra', 'visual_ultra'].includes(id)) {
        list = list.filter(i => i !== 'visual_all');
      }

      if (id === 'auditory_all') {
        list = list.filter(i => !['auditory_normal', 'auditory_ultra'].includes(i));
      } else if (['auditory_normal', 'auditory_ultra'].includes(id)) {
        list = list.filter(i => i !== 'auditory_all');
      }

      if (id === 'olfactory_all') {
        list = list.filter(i => i !== 'olfactory_normal');
      } else if (id === 'olfactory_normal') {
        list = list.filter(i => i !== 'olfactory_all');
      }

      if (id === 'radio_all') {
        list = list.filter(i => !['radio_normal', 'radio_radar'].includes(i));
      } else if (['radio_normal', 'radio_radar'].includes(id)) {
        list = list.filter(i => i !== 'radio_all');
      }

      if (id === 'mental_all') {
        list = list.filter(i => i !== 'mental_normal');
      } else if (id === 'mental_normal') {
        list = list.filter(i => i !== 'mental_all');
      }

      if (id === 'exotic_all') {
        list = list.filter(i => i !== 'exotic_mystic');
      } else if (id === 'exotic_mystic') {
        list = list.filter(i => i !== 'exotic_all');
      }

      list.push(id);
    }
  }

  props.effect.config.selectedSenses = list;
  updateConfig();
}

</script>
