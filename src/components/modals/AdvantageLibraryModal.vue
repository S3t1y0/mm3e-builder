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
              <p class="modal-subtitle">Talents, combat maneuvers, and situational benefits (1 PP / Rank)</p>
            </div>
          </div>
          <div class="modal-header-actions">
            <button
              type="button"
              class="btn-create-custom-adv"
              @click="openCustomModal"
              title="Create Custom / Homebrew Advantage"
            >
              <i class="ri-add-circle-line"></i>
              <span>+ Custom Advantage</span>
            </button>
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
                placeholder="Search advantages... (e.g., Wealth, Favored Foe, Skill Mastery, Initiative)"
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
              :class="{
                added: isAdvantageOnSheet(adv.name),
                'has-specs': adv.requiresSpecification
              }"
            >
              <div class="adv-card-header">
                <div class="adv-card-meta-row">
                  <span class="adv-cat-tag" :class="(adv.category || 'general').toLowerCase()">
                    <i :class="getCategoryIconClass(adv.category)"></i>
                    {{ adv.category || 'General' }}
                  </span>
                  <div class="adv-header-badges">
                    <span v-if="adv.requiresSpecification" class="badge-spec" title="Requires specific choice">
                      Specifiable
                    </span>
                    <span v-if="adv.ranked" class="badge-ranked" title="Can be taken for multiple ranks">
                      Ranked
                    </span>
                  </div>
                </div>
                <strong class="adv-card-title">{{ adv.name }}</strong>
              </div>

              <p class="adv-card-desc" :title="adv.desc">{{ adv.desc }}</p>

              <div class="adv-card-footer">
                <!-- A. IF ADVANTAGE REQUIRES SPECIFICATION (e.g. Benefit, Favored Foe, Skill Mastery) -->
                <template v-if="adv.requiresSpecification">
                  <!-- List of already added subtypes on sheet -->
                  <div v-if="getSheetInstances(adv.name).length > 0" class="adv-instances-tray">
                    <div
                      v-for="inst in getSheetInstances(adv.name)"
                      :key="inst.id"
                      class="adv-instance-chip"
                    >
                      <div class="inst-info">
                        <i class="ri-checkbox-circle-fill inst-icon"></i>
                        <span class="inst-text" :title="inst.specification || 'Default'">
                          {{ inst.specification || 'Default' }}
                        </span>
                      </div>
                      <div class="stepper-compact">
                        <button
                          type="button"
                          class="step-btn-xs"
                          :disabled="Number(inst.ranks || 1) <= 1"
                          @click="stepInstance(inst.id, -1)"
                          title="Decrease rank"
                        >-</button>
                        <span class="step-val-xs">{{ inst.ranks || 1 }}</span>
                        <button
                          type="button"
                          class="step-btn-xs"
                          :disabled="adv.maxRanks && Number(inst.ranks || 1) >= adv.maxRanks"
                          @click="stepInstance(inst.id, 1)"
                          title="Increase rank"
                        >+</button>
                        <button
                          type="button"
                          class="del-btn-tiny"
                          @click="deleteInstance(inst.id)"
                          title="Remove this choice"
                        >
                          <i class="ri-close-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Add / Add Another Button -->
                  <button
                    type="button"
                    class="btn btn-secondary btn-xs btn-add-adv"
                    @click="openSpecModal(adv)"
                  >
                    <i class="ri-add-line"></i>
                    <span>{{ getSheetInstances(adv.name).length > 0 ? 'Add Another Choice' : 'Add with Specification' }}</span>
                  </button>
                </template>

                <!-- B. STANDARD ADVANTAGE (NO SPECIFICATION NEEDED) -->
                <template v-else>
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
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL FOOTER -->
        <div class="modal-footer">
          <span class="modal-footer-hint">
            <i class="ri-lightbulb-line"></i> Use <strong>"Add with Specification"</strong> for specialized advantages like Wealth, Favored Foe, or Skill Mastery.
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

      <!-- SPECIFICATION PICKER POPUP MODAL -->
      <transition name="fade">
        <div
          v-if="activeSpecAdv"
          class="spec-picker-overlay"
          @click.self="activeSpecAdv = null"
        >
          <div class="spec-picker-box">
            <div class="spec-picker-header">
              <div class="spec-picker-title-row">
                <i class="ri-equalizer-line"></i>
                <h4>Define {{ activeSpecAdv.name }}</h4>
              </div>
              <button
                type="button"
                class="del-btn-tiny"
                @click="activeSpecAdv = null"
                title="Cancel"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <p class="spec-picker-desc">{{ activeSpecAdv.desc }}</p>

            <!-- PRESET SUGGESTION CHIPS -->
            <div v-if="activeSpecAdv.specificationSuggestions?.length" class="spec-suggestions-block">
              <span class="spec-sugg-title">
                <i class="ri-list-check-2"></i> Common Options:
              </span>
              <div class="spec-sugg-chips">
                <button
                  v-for="sugg in activeSpecAdv.specificationSuggestions"
                  :key="sugg"
                  type="button"
                  class="spec-sugg-chip"
                  :class="{ selected: specInput.trim().toLowerCase() === sugg.toLowerCase() }"
                  @click="specInput = sugg"
                >
                  {{ sugg }}
                </button>
              </div>
            </div>

            <!-- TEXT INPUT -->
            <div class="spec-field-group">
              <label class="spec-field-label">
                {{ activeSpecAdv.specificationLabel || 'Specification / Focus' }}:
              </label>
              <input
                ref="specInputRef"
                v-model="specInput"
                type="text"
                class="spec-text-input"
                :placeholder="`e.g., ${activeSpecAdv.specificationSuggestions?.[0] || 'Type specification...'}`"
                @keyup.enter="confirmAddWithSpec"
              />
            </div>

            <!-- RANK PICKER IF RANKED -->
            <div v-if="activeSpecAdv.ranked" class="spec-field-group">
              <label class="spec-field-label">Initial Rank:</label>
              <div class="spec-rank-stepper-wrap">
                <div class="stepper-compact">
                  <button
                    type="button"
                    class="step-btn-xs"
                    :disabled="specRank <= 1"
                    @click="specRank = Math.max(1, specRank - 1)"
                  >-</button>
                  <span class="step-val-xs">{{ specRank }}</span>
                  <button
                    type="button"
                    class="step-btn-xs"
                    :disabled="activeSpecAdv.maxRanks && specRank >= activeSpecAdv.maxRanks"
                    @click="specRank++"
                  >+</button>
                </div>
                <span class="spec-cost-indicator">{{ specRank }} PP</span>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="spec-picker-actions">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="activeSpecAdv = null"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="!specInput.trim()"
                @click="confirmAddWithSpec"
              >
                <i class="ri-check-line"></i> Add to Sheet
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- CREATE CUSTOM HOMEBREW ADVANTAGE MODAL -->
      <transition name="fade">
        <div
          v-if="showCustomModal"
          class="spec-picker-overlay"
          @click.self="showCustomModal = false"
        >
          <div class="spec-picker-box custom-adv-box">
            <div class="spec-picker-header">
              <div class="spec-picker-title-row">
                <i class="ri-medal-line" style="color: #f59e0b;"></i>
                <h4>Create Custom Advantage</h4>
              </div>
              <button
                type="button"
                class="del-btn-tiny"
                @click="showCustomModal = false"
                title="Cancel"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <div class="custom-adv-form">
              <div class="form-row">
                <div class="form-col flex-2">
                  <label class="spec-field-label">Advantage Name *</label>
                  <input
                    v-model="customForm.name"
                    type="text"
                    class="spec-text-input"
                    placeholder="e.g. Iron Will, Martial Arts Stance"
                  />
                </div>
                <div class="form-col flex-1">
                  <label class="spec-field-label">Category</label>
                  <select v-model="customForm.category" class="spec-select-input">
                    <option value="General">General</option>
                    <option value="Combat">Combat</option>
                    <option value="Skill">Skill</option>
                    <option value="Fortune">Fortune</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-col flex-2">
                  <label class="spec-field-label">Specification / Focus (Optional)</label>
                  <input
                    v-model="customForm.specification"
                    type="text"
                    class="spec-text-input"
                    placeholder="e.g. Crane Style, High Magic"
                  />
                </div>
                <div class="form-col flex-1">
                  <label class="spec-field-label">Initial Rank</label>
                  <div class="stepper-compact">
                    <button
                      type="button"
                      class="step-btn-xs"
                      :disabled="customForm.ranks <= 1"
                      @click="customForm.ranks = Math.max(1, customForm.ranks - 1)"
                    >-</button>
                    <span class="step-val-xs">{{ customForm.ranks }}</span>
                    <button
                      type="button"
                      class="step-btn-xs"
                      @click="customForm.ranks++"
                    >+</button>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-col flex-1">
                  <label class="spec-field-label">Description / Effect</label>
                  <textarea
                    v-model="customForm.desc"
                    class="spec-textarea-input"
                    rows="3"
                    placeholder="Describe how this advantage works and its mechanics..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="spec-picker-actions">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="showCustomModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="!customForm.name.trim()"
                @click="confirmCreateCustomAdv"
              >
                <i class="ri-check-line"></i> Create & Add Advantage
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { ADVANTAGES, ADVANTAGE_CATEGORIES, formatAdvantageDisplayName } from '../../rules/advantages.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const searchInputRef = ref(null);
const gridRef = ref(null);
const activeCategory = ref('All');
const searchQuery = ref('');

// Specification picker state
const activeSpecAdv = ref(null);
const specInput = ref('');
const specRank = ref(1);
const specInputRef = ref(null);

// Custom feat modal state
const showCustomModal = ref(false);
const customForm = ref({
  name: '',
  category: 'General',
  specification: '',
  desc: '',
  ranks: 1
});

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
    activeSpecAdv.value = null;
    showCustomModal.value = false;
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
    case 'Fortune': return 'ri-dice-line';
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
      (a.desc && a.desc.toLowerCase().includes(q)) ||
      (a.specificationSuggestions && a.specificationSuggestions.some(s => s.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    // Category match
    if (cat === 'All') return true;
    if (cat === 'Ranked') return !!a.ranked;
    return a.category === cat;
  });
});

function isAdvantageOnSheet(name) {
  const advs = heroStore.character.advantages || [];
  return advs.some(a => (a.name || '').toLowerCase() === name.toLowerCase());
}

function getSheetInstances(name) {
  const advs = heroStore.character.advantages || [];
  return advs.filter(a => (a.name || '').trim().toLowerCase() === (name || '').trim().toLowerCase());
}

function getAdvantageRanks(name) {
  const advs = heroStore.character.advantages || [];
  const found = advs.find(a => (a.name || '').toLowerCase() === name.toLowerCase());
  return found ? (Number(found.ranks ?? found.rank) || 1) : 0;
}

function addAdvantage(name) {
  heroStore.addAdvantage(name, 1);
  uiStore.showToast(`Added ${name} to Advantages!`, 'success');
}

function stepAdvantage(name, delta) {
  const advs = heroStore.character.advantages || [];
  const idx = advs.findIndex(a => (a.name || '').toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    const cur = Number(advs[idx].ranks ?? advs[idx].rank) || 1;
    const next = Math.max(1, cur + delta);
    heroStore.setAdvantageRank(advs[idx].id || idx, next);
  }
}

function deleteAdvantage(name) {
  const advs = heroStore.character.advantages || [];
  const idx = advs.findIndex(a => (a.name || '').toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    heroStore.removeAdvantage(advs[idx].id || idx);
    uiStore.showToast(`Removed ${name} from Advantages`, 'info');
  }
}

function stepInstance(id, delta) {
  const advs = heroStore.character.advantages || [];
  const found = advs.find(a => a.id === id);
  if (found) {
    const cur = Number(found.ranks ?? found.rank) || 1;
    const next = Math.max(1, cur + delta);
    heroStore.setAdvantageRank(id, next);
  }
}

function deleteInstance(id) {
  const advs = heroStore.character.advantages || [];
  const found = advs.find(a => a.id === id);
  const title = found ? formatAdvantageDisplayName(found) : 'Advantage';
  heroStore.removeAdvantage(id);
  uiStore.showToast(`Removed ${title} from Advantages`, 'info');
}

// Open specification picker
function openSpecModal(adv) {
  activeSpecAdv.value = adv;
  specInput.value = adv.specificationSuggestions?.[0] || '';
  specRank.value = 1;
  nextTick(() => {
    specInputRef.value?.focus();
    specInputRef.value?.select();
  });
}

function confirmAddWithSpec() {
  if (!activeSpecAdv.value || !specInput.value.trim()) return;
  const name = activeSpecAdv.value.name;
  const spec = specInput.value.trim();
  const ranks = specRank.value || 1;

  heroStore.addAdvantage(name, ranks, spec);
  uiStore.showToast(`Added ${name} (${spec}) [Rank ${ranks}] to Advantages!`, 'success');
  activeSpecAdv.value = null;
}

// Custom feat modal
function openCustomModal() {
  customForm.value = {
    name: '',
    category: 'General',
    specification: '',
    desc: '',
    ranks: 1
  };
  showCustomModal.value = true;
}

function confirmCreateCustomAdv() {
  if (!customForm.value.name.trim()) return;
  const f = customForm.value;
  heroStore.addAdvantage(f.name.trim(), f.ranks, f.specification.trim(), {
    isCustom: true,
    desc: f.desc.trim(),
    category: f.category
  });
  const disp = f.specification.trim() ? `${f.name} (${f.specification})` : f.name;
  uiStore.showToast(`Created custom advantage "${disp}"!`, 'success');
  showCustomModal.value = false;
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
  overflow-y: hidden;
  padding: 0.35rem 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  flex-shrink: 0;
}

.filter-pills-bar::-webkit-scrollbar {
  height: 4px;
}

.filter-pills-bar::-webkit-scrollbar-track {
  background: transparent;
}

.filter-pills-bar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}

.filter-pills-bar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}

.filter-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.24rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.filter-chip.active {
  background: rgba(37, 99, 235, 0.22);
  border-color: #3b82f6;
  color: #93c5fd;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.25);
}

.filter-chip i {
  font-size: 0.82rem;
}

.adv-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(295px, 1fr));
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

/* ADVANTAGE CARD */
.adv-catalog-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  background: rgba(18, 22, 34, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  gap: 0.65rem;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.adv-catalog-card:hover {
  border-color: rgba(96, 165, 250, 0.45);
  background: rgba(22, 28, 44, 0.88);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.adv-catalog-card.added {
  border-color: rgba(16, 185, 129, 0.45);
  background: rgba(16, 185, 129, 0.04);
  box-shadow: var(--shadow-sm);
}

.adv-catalog-card.added:hover {
  border-color: rgba(16, 185, 129, 0.65);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.adv-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 100%;
}

.adv-card-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.adv-card-title {
  font-size: 0.96rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.adv-cat-tag {
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.12rem 0.45rem;
  border-radius: 4px;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.adv-cat-tag.combat {
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: #fca5a5;
}

.adv-cat-tag.fortune {
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.28);
  color: #fcd34d;
}

.adv-cat-tag.skill {
  background: rgba(14, 165, 233, 0.14);
  border: 1px solid rgba(14, 165, 233, 0.28);
  color: #7dd3fc;
}

.adv-cat-tag.general {
  background: rgba(148, 163, 184, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #cbd5e1;
}

.adv-header-badges {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.badge-spec {
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.12rem 0.42rem;
  border-radius: 4px;
  background: rgba(168, 85, 247, 0.14);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.28);
}

.badge-ranked {
  font-size: 0.63rem;
  font-weight: 800;
  background: rgba(234, 179, 8, 0.14);
  color: #fde047;
  border: 1px solid rgba(234, 179, 8, 0.28);
  padding: 0.12rem 0.42rem;
  border-radius: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.adv-card-desc {
  font-size: 0.79rem;
  color: #94a3b8;
  line-height: 1.48;
  margin: 0;
  flex: 1;
  min-height: 3.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ACTION SHELF (CARD FOOTER) */
.adv-card-footer {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.5rem !important;
  align-items: stretch !important;
  width: 100% !important;
  padding-top: 0.7rem !important;
  border-top: 1px solid rgba(255, 255, 255, 0.07) !important;
  margin-top: auto;
}

.adv-instances-tray {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  background: rgba(0, 0, 0, 0.32);
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  max-height: 130px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.adv-instances-tray::-webkit-scrollbar {
  width: 4px;
}

.adv-instances-tray::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.adv-instance-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.3rem 0.45rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  font-size: 0.75rem;
  transition: background 0.15s ease;
}

.adv-instance-chip:hover {
  background: rgba(255, 255, 255, 0.08);
}

.adv-instance-chip .inst-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  overflow: hidden;
}

.adv-instance-chip .inst-icon {
  color: #10b981;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.adv-instance-chip .inst-text {
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.74rem;
}

.adv-card-active-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.32rem 0.6rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 6px;
  gap: 0.5rem;
}

.badge-in-sheet {
  font-size: 0.73rem;
  font-weight: 700;
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.stepper-compact {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.12rem 0.25rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.step-btn-xs {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0;
  line-height: 1;
  transition: all 0.15s;
}

.step-btn-xs:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  color: #fff;
}

.step-btn-xs:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.step-val-xs {
  font-size: 0.72rem;
  font-weight: 800;
  color: #60a5fa;
  min-width: 14px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.btn-add-adv {
  width: 100%;
  justify-content: center;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
  font-size: 0.76rem;
  padding: 0.42rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-add-adv:hover {
  background: rgba(59, 130, 246, 0.18);
  border-color: #3b82f6;
  color: #93c5fd;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
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

.btn-create-custom-adv {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  transition: all var(--trans-fast, 0.15s ease);
}

.btn-create-custom-adv:hover {
  background: rgba(245, 158, 11, 0.22);
  border-color: #f59e0b;
  color: #fff;
  transform: translateY(-1px);
}

/* SPECIFICATION POPUP MODAL */
.spec-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 10, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.spec-picker-box {
  background: #111420;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  animation: modalPopIn 0.18s ease-out;
}

.custom-adv-box {
  max-width: 520px;
}

@keyframes modalPopIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.spec-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.65rem;
}

.spec-picker-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
}

.spec-picker-title-row i {
  font-size: 1.2rem;
  color: #3b82f6;
}

.spec-picker-title-row h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.spec-picker-desc {
  font-size: 0.8rem;
  color: var(--text-secondary, #94a3b8);
  margin: 0;
  line-height: 1.45;
}

.spec-suggestions-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.spec-sugg-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-secondary, #94a3b8);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.spec-sugg-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-height: 120px;
  overflow-y: auto;
  padding: 0.1rem 0;
}

.spec-sugg-chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary, #cbd5e1);
  padding: 0.22rem 0.55rem;
  border-radius: 4px;
  font-size: 0.73rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.spec-sugg-chip:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #fff;
}

.spec-sugg-chip.selected {
  background: #2563eb;
  border-color: #60a5fa;
  color: #fff;
}

.spec-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spec-field-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary, #cbd5e1);
}

.spec-text-input,
.spec-select-input,
.spec-textarea-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #fff;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.15s;
}

.spec-text-input:focus,
.spec-select-input:focus,
.spec-textarea-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.spec-text-input:focus-visible,
.spec-select-input:focus-visible,
.spec-textarea-input:focus-visible {
  outline: 2px solid var(--accent-secondary);
  outline-offset: 2px;
}

.spec-rank-stepper-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spec-cost-indicator {
  font-size: 0.8rem;
  font-weight: 800;
  color: #10b981;
}

.spec-picker-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* CUSTOM ADV FORM LAYOUT */
.custom-adv-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
</style>
