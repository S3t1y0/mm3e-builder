<template>
  <transition name="fade">
    <div
      v-if="uiStore.modals.advantage"
      class="modal-overlay open"
      @click.self="uiStore.closeModal('advantage')"
    >
      <div class="modal-dialog modal-xl advantage-modal-dialog">
        <!-- MODAL HEADER -->
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="icon"><i class="ri-star-line"></i></span>
            <div>
              <h3>M&M 3e Advantages Catalog</h3>
              <p class="modal-subtitle">Talents, combat maneuvers, and special perks (1 PP / Rank)</p>
            </div>
          </div>
          <div class="modal-header-actions">
            <span class="badge badge-accent">
              Total: {{ selectedCount }} Selected ({{ totalAdvPP }} PP)
            </span>
            <button
              type="button"
              class="modal-close-btn"
              @click="uiStore.closeModal('advantage')"
              title="Close Advantage Catalog"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>

        <!-- MODAL BODY -->
        <div class="modal-body advantage-modal-body">
          <!-- SEARCH & CATEGORY BAR -->
          <div class="adv-filter-toolbar">
            <div class="palette-search-box flex-1">
              <span class="search-icon"><i class="ri-search-line"></i></span>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="palette-search"
                placeholder="Search advantages... (e.g., Initiative, Power Attack, Luck, Evasion)"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="clear-search-btn"
                @click="searchQuery = ''"
              >
                <i class="ri-close-circle-line"></i>
              </button>
            </div>

            <!-- CATEGORY FILTER CHIPS -->
            <div class="filter-pills-bar">
              <button
                v-for="cat in categories"
                :key="cat"
                type="button"
                class="filter-chip"
                :class="{ active: activeCategory === cat }"
                @click="activeCategory = cat"
              >
                <i :class="getCategoryIconClass(cat)"></i>
                <span>{{ cat }} ({{ getCategoryCount(cat) }})</span>
              </button>
            </div>
          </div>

          <!-- ADVANTAGES CATALOG GRID -->
          <div ref="gridRef" class="adv-catalog-grid">
            <div
              v-if="filteredAdvantages.length === 0"
              class="empty-hint"
              style="grid-column: 1 / -1;"
            >
              <i class="ri-search-eye-line" style="font-size: 2rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;"></i>
              No advantages found matching "{{ searchQuery }}".
            </div>

            <div
              v-for="adv in filteredAdvantages"
              :key="adv.name"
              class="adv-catalog-card"
              :class="{ added: isAdvantageOnSheet(adv.name) }"
            >
              <div class="adv-card-header">
                <div class="adv-card-title-wrap">
                  <span class="adv-cat-tag" :class="(adv.category || 'general').toLowerCase()">
                    <i :class="getCategoryIconClass(adv.category)"></i>
                    {{ adv.category || 'General' }}
                  </span>
                  <strong class="adv-card-title">{{ adv.name }}</strong>
                </div>
                <span v-if="adv.ranked" class="badge-ranked" title="Can be taken for multiple ranks">
                  Ranked
                </span>
              </div>

              <p class="adv-card-desc">{{ adv.desc }}</p>

              <div class="adv-card-footer">
                <!-- If already on sheet: On Sheet badge, Stepper, and Delete button -->
                <div v-if="isAdvantageOnSheet(adv.name)" class="adv-card-active-controls">
                  <span class="badge-in-sheet">
                    <i class="ri-checkbox-circle-fill"></i>
                    <span>On Sheet ({{ getAdvantageRanks(adv.name) }} Rank{{ getAdvantageRanks(adv.name) > 1 ? 's' : '' }})</span>
                  </span>

                  <div class="stepper-compact">
                    <button
                      type="button"
                      class="step-btn-xs"
                      :disabled="getAdvantageRanks(adv.name) <= 1"
                      @click="stepAdvantage(adv.name, -1)"
                      title="Decrease Rank"
                    >-</button>
                    <span class="step-val-xs">{{ getAdvantageRanks(adv.name) }}</span>
                    <button
                      type="button"
                      class="step-btn-xs"
                      :disabled="adv.maxRanks && getAdvantageRanks(adv.name) >= adv.maxRanks"
                      @click="stepAdvantage(adv.name, 1)"
                      title="Increase Rank"
                    >+</button>
                    <button
                      type="button"
                      class="del-btn-tiny"
                      @click="deleteAdvantage(adv.name)"
                      title="Remove from Sheet"
                    >
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </div>

                <!-- If not on sheet: Add button -->
                <button
                  v-else
                  type="button"
                  class="btn btn-secondary btn-xs btn-add-adv"
                  @click="addAdvantage(adv.name)"
                >
                  <i class="ri-add-line"></i> Add ({{ adv.ranked ? '1 Rank' : '1 PP' }})
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL FOOTER -->
        <div class="modal-footer">
          <span class="modal-footer-hint">
            <i class="ri-lightbulb-line"></i> Click <strong>"+ Add"</strong> on any card to add it directly to your character sheet.
          </span>
          <button
            type="button"
            class="btn btn-primary"
            @click="uiStore.closeModal('advantage')"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { ADVANTAGES, ADVANTAGE_CATEGORIES } from '../../rules/advantages.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const searchInputRef = ref(null);
const gridRef = ref(null);
const activeCategory = ref('All');
const searchQuery = ref('');

const categories = ADVANTAGE_CATEGORIES;

const selectedCount = computed(() => {
  return (heroStore.character.advantages || []).length;
});

const totalAdvPP = computed(() => {
  return heroStore.totalAdvantagePP;
});

watch(() => uiStore.modals.advantage, (isOpen) => {
  if (isOpen) {
    searchQuery.value = '';
    activeCategory.value = 'All';
    nextTick(() => {
      searchInputRef.value?.focus();
      if (gridRef.value) gridRef.value.scrollTop = 0;
    });
  }
});

watch([activeCategory, searchQuery], () => {
  nextTick(() => {
    if (gridRef.value) {
      gridRef.value.scrollTop = 0;
    }
  });
});

function getCategoryIconClass(cat) {
  switch (cat) {
    case 'Combat': return 'ri-sword-line';
    case 'Fortune': return 'ri-clover-line';
    case 'Skill': return 'ri-focus-3-line';
    case 'General': return 'ri-shield-line';
    case 'Ranked': return 'ri-star-line';
    default: return 'ri-apps-line';
  }
}

function getCategoryCount(cat) {
  if (cat === 'All') return ADVANTAGES.length;
  if (cat === 'Ranked') return ADVANTAGES.filter(a => a.ranked).length;
  return ADVANTAGES.filter(a => a.category === cat).length;
}

const filteredAdvantages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;

  return ADVANTAGES.filter(a => {
    // Search match
    const matchesSearch = !q ||
      a.name.toLowerCase().includes(q) ||
      (a.desc && a.desc.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Category match
    if (cat === 'All') return true;
    if (cat === 'Ranked') return !!a.ranked;
    return a.category === cat;
  });
});

function isAdvantageOnSheet(name) {
  const advs = heroStore.character.advantages || [];
  return advs.some(a => a.name.toLowerCase() === name.toLowerCase());
}

function getAdvantageRanks(name) {
  const advs = heroStore.character.advantages || [];
  const found = advs.find(a => a.name.toLowerCase() === name.toLowerCase());
  return found ? (Number(found.ranks ?? found.rank) || 1) : 0;
}

function addAdvantage(name) {
  heroStore.addAdvantage(name, 1);
  uiStore.showToast(`Added ${name} to Advantages!`, 'success');
}

function stepAdvantage(name, delta) {
  const advs = heroStore.character.advantages || [];
  const idx = advs.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    const cur = Number(advs[idx].ranks ?? advs[idx].rank) || 1;
    const next = Math.max(1, cur + delta);
    heroStore.setAdvantageRank(idx, next);
  }
}

function deleteAdvantage(name) {
  const advs = heroStore.character.advantages || [];
  const idx = advs.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    heroStore.removeAdvantage(idx);
    uiStore.showToast(`Removed ${name} from Advantages`, 'info');
  }
}
</script>

<style scoped>
.advantage-modal-dialog {
  max-width: 1100px;
  width: 95%;
  height: 88vh;
  max-height: calc(100dvh - 3rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  flex-shrink: 0;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.clear-search-btn:hover {
  color: #fff;
}

.advantage-modal-body {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  padding: 1.25rem 1.25rem 0.5rem 1.5rem;
}

.adv-filter-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  flex-shrink: 0;
}

.filter-pills-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  flex-shrink: 0;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.22rem 0.65rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.filter-chip.active {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.filter-chip i {
  font-size: 0.82rem;
}

.adv-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 0.85rem;
  flex: 1 1 0;
  min-height: 0;
  max-height: none !important;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.45rem;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.adv-catalog-grid::-webkit-scrollbar {
  width: 6px;
}

.adv-catalog-grid::-webkit-scrollbar-track {
  background: transparent;
}

.adv-catalog-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}

.adv-catalog-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}

.del-btn-tiny {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all var(--trans-fast);
}

.del-btn-tiny:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--border-subtle);
  background: rgba(10, 10, 15, 0.6);
  flex-shrink: 0;
}

.modal-footer-hint {
  font-size: 0.76rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.modal-footer-hint i {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .advantage-modal-dialog {
    width: 98%;
    height: 94vh;
    max-height: calc(100dvh - 1.5rem);
  }

  .advantage-modal-body {
    padding: 1rem 0.85rem 0.5rem 1rem;
  }

  .adv-catalog-grid {
    grid-template-columns: 1fr;
    gap: 0.65rem;
    padding-right: 0.25rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }
}

@media (max-height: 520px) {
  .advantage-modal-dialog {
    height: 98vh;
    max-height: calc(100dvh - 0.75rem);
  }

  .advantage-modal-body {
    padding: 0.75rem 1rem 0.25rem 1rem;
  }

  .adv-filter-toolbar {
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }
}
</style>
