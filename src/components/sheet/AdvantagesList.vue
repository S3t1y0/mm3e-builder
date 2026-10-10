<template>
  <div class="advantages-hub-pane">
    <!-- Advantages Toolbar -->
    <div class="dndb-pane-toolbar">
      <div class="dndb-pane-info">
        <span class="dndb-pane-title">Combat & General Advantages</span>
        <span class="adv-pp-badge">{{ heroStore.totalAdvantagePP }} PP Total</span>
      </div>
      <div class="dndb-pane-actions">
        <button
          type="button"
          class="btn-add-advantage"
          @click="uiStore.openModal('advantage')"
          title="Open Advantages Library Catalog"
        >
          <i class="ri-add-line"></i>
          <span>Add Advantage</span>
        </button>
      </div>
    </div>

    <!-- Category Filter Tabs & Quick Search -->
    <div v-if="effectiveAdvantages.length > 0" class="adv-filter-row">
      <div class="adv-filter-tabs">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          type="button"
          class="adv-filter-tab"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          <i v-if="cat.icon" :class="cat.icon"></i>
          <span>{{ cat.label }}</span>
          <span class="tab-count">{{ cat.count }}</span>
        </button>
      </div>

      <div v-if="effectiveAdvantages.length > 4" class="adv-search-mini">
        <i class="ri-search-line"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter advantages..."
          class="adv-search-input"
          aria-label="Filter advantages"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="adv-search-clear"
          @click="searchQuery = ''"
          aria-label="Clear search"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>

    <!-- EMPTY ADVANTAGES STATE -->
    <div v-if="effectiveAdvantages.length === 0" class="adv-empty-state">
      <div class="adv-empty-icon"><i class="ri-medal-line"></i></div>
      <h4 class="adv-empty-title">No Advantages Selected</h4>
      <p class="adv-empty-desc">
        Advantages represent specialized combat maneuvers, fortune perks, and expert talents (1 PP per rank).
      </p>
      <button
        type="button"
        class="btn-browse-empty-cta"
        @click="uiStore.openModal('advantage')"
      >
        <i class="ri-search-line"></i> Browse Advantages Library
      </button>
    </div>

    <!-- ACTIVE ADVANTAGES 2-COLUMN GRID -->
    <div v-else-if="filteredAdvantages.length > 0" class="sheet-advantages-grid">
      <article
        v-for="adv in filteredAdvantages"
        :key="adv.id || adv.name"
        class="sheet-adv-card"
        :class="{
          'is-power-granted': adv.isPowerGranted,
          'is-custom': adv.isCustom
        }"
      >
        <!-- Card Top Bar: Title & Actions -->
        <div class="adv-card-header">
          <div class="adv-card-title-group">
            <i :class="[getCategoryIcon(adv), 'adv-card-icon', getAdvCategory(adv).toLowerCase()]"></i>
            <div class="adv-card-titles">
              <h4 class="adv-card-name" :title="adv.displayName || adv.name">
                {{ adv.name }}
              </h4>
              <span v-if="adv.specification" class="adv-spec-badge" :title="`Specification: ${adv.specification}`">
                {{ adv.specification }}
              </span>
            </div>
          </div>

          <div class="adv-action-cluster">
            <button
              type="button"
              class="adv-act-btn btn-broadcast"
              @click="broadcastAdvantage(adv)"
              :title="`Broadcast ${adv.displayName || adv.name} to Roll20`"
              aria-label="Broadcast to Roll20"
            >
              <i class="ri-broadcast-line"></i>
            </button>
            <button
              v-if="!adv.isPowerGranted"
              type="button"
              class="adv-act-btn btn-edit"
              @click="openEditModal(adv)"
              :title="`Edit ${adv.displayName || adv.name}`"
              aria-label="Edit advantage"
            >
              <i class="ri-edit-line"></i>
            </button>
            <button
              v-if="adv.isPowerGranted"
              type="button"
              class="adv-act-btn btn-locked"
              title="Granted by active power. Modify or deactivate power to remove."
              aria-label="Granted by power (locked)"
              disabled
            >
              <i class="ri-lock-line"></i>
            </button>
            <button
              v-else
              type="button"
              class="adv-act-btn btn-delete"
              @click="deleteAdvantage(adv)"
              :title="`Remove ${adv.displayName || adv.name} from sheet`"
              aria-label="Remove advantage"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Meta Bar: Category, Cost & Compact Rank Stepper -->
        <div class="adv-card-meta">
          <div class="adv-meta-tags">
            <span v-if="adv.isCustom" class="adv-cat-tag custom">
              <i class="ri-medal-line"></i> Custom
            </span>
            <span v-else-if="adv.isPowerGranted" class="adv-cat-tag power">
              <i class="ri-flashlight-line"></i> Enhanced Trait
            </span>
            <span v-else class="adv-cat-tag" :class="getAdvCategory(adv).toLowerCase()">
              {{ getAdvCategory(adv) }}
            </span>
            <span class="adv-cost-tag">
              {{ adv.naturalRanks }} PP{{ adv.hasPowerBonus ? ` (+${adv.enhancedRanks}p)` : '' }}
            </span>
          </div>

          <!-- Compact Rank Stepper for Ranked Traits -->
          <div v-if="(isAdvRanked(adv.name) || adv.isCustom) && !adv.isPowerGranted" class="adv-card-stepper">
            <button
              type="button"
              class="adv-step-btn"
              :disabled="adv.naturalRanks <= 1"
              @click="stepRank(adv, -1)"
              title="Decrease Rank"
              aria-label="Decrease Rank"
            >
              <i class="ri-subtract-line"></i>
            </button>
            <span class="adv-step-text">Rank {{ adv.ranks }}</span>
            <button
              type="button"
              class="adv-step-btn"
              :disabled="getMaxRanks(adv.name) && adv.naturalRanks >= getMaxRanks(adv.name)"
              @click="stepRank(adv, 1)"
              title="Increase Rank"
              aria-label="Increase Rank"
            >
              <i class="ri-add-line"></i>
            </button>
          </div>
        </div>

        <!-- Rules Description (Proportional & Clean) -->
        <p class="adv-card-desc">{{ adv.desc || getAdvDesc(adv.name) }}</p>
      </article>
    </div>

    <!-- No Match Indicator -->
    <div v-else class="adv-no-filter-match">
      <i class="ri-filter-off-line"></i>
      <span>No advantages found matching filter.</span>
      <button type="button" class="btn-clear-filter" @click="clearFilter">
        Reset Filter
      </button>
    </div>

    <!-- EDIT ADVANTAGE MODAL -->
    <transition name="fade">
      <div
        v-if="editingAdv"
        class="spec-picker-overlay"
        @click.self="editingAdv = null"
      >
        <div class="spec-picker-box">
          <div class="spec-picker-header">
            <div class="spec-picker-title-row">
              <i class="ri-edit-line"></i>
              <h4>Edit Advantage: {{ editingAdv.name }}</h4>
            </div>
            <button
              type="button"
              class="del-btn-tiny"
              @click="editingAdv = null"
              title="Cancel"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>

          <!-- NAME (IF CUSTOM) -->
          <div v-if="editingAdv.isCustom" class="spec-field-group">
            <label class="spec-field-label">Advantage Name:</label>
            <input v-model="editForm.name" type="text" class="spec-text-input" />
          </div>

          <!-- PRESETS SUGGESTIONS IF AVAILABLE -->
          <div v-if="getAdvRule(editingAdv.name)?.specificationSuggestions?.length" class="spec-suggestions-block">
            <span class="spec-sugg-title"><i class="ri-list-check-2"></i> Common Options:</span>
            <div class="spec-sugg-chips">
              <button
                v-for="sugg in getAdvRule(editingAdv.name).specificationSuggestions"
                :key="sugg"
                type="button"
                class="spec-sugg-chip"
                :class="{ selected: editForm.specification.trim().toLowerCase() === sugg.toLowerCase() }"
                @click="editForm.specification = sugg"
              >
                {{ sugg }}
              </button>
            </div>
          </div>

          <!-- SPECIFICATION / FOCUS INPUT -->
          <div class="spec-field-group">
            <label class="spec-field-label">
              {{ getAdvRule(editingAdv.name)?.specificationLabel || 'Specification / Focus' }}:
            </label>
            <input
              v-model="editForm.specification"
              type="text"
              class="spec-text-input"
              placeholder="e.g. Wealth, Undead, Technology"
            />
          </div>

          <!-- RANKS STEPPER -->
          <div v-if="isAdvRanked(editingAdv.name) || editingAdv.isCustom" class="spec-field-group">
            <label class="spec-field-label">Ranks:</label>
            <div class="spec-rank-stepper-wrap">
              <div class="stepper-compact">
                <button
                  type="button"
                  class="step-btn-xs"
                  :disabled="editForm.ranks <= 1"
                  @click="editForm.ranks = Math.max(1, editForm.ranks - 1)"
                >-</button>
                <span class="step-val-xs">{{ editForm.ranks }}</span>
                <button
                  type="button"
                  class="step-btn-xs"
                  @click="editForm.ranks++"
                >+</button>
              </div>
              <span class="spec-cost-indicator">{{ editForm.ranks }} PP</span>
            </div>
          </div>

          <!-- DESCRIPTION / CUSTOM NOTES -->
          <div class="spec-field-group">
            <label class="spec-field-label">Description / Notes:</label>
            <textarea
              v-model="editForm.desc"
              class="spec-textarea-input"
              rows="3"
              placeholder="Custom description or mechanical notes..."
            ></textarea>
          </div>

          <div class="spec-picker-actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="editingAdv = null"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="saveAdvantageEdit"
            >
              <i class="ri-check-line"></i> Save Changes
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { ADVANTAGES, formatAdvantageDisplayName } from '../../rules/advantages.js';
import { sendFeatureToVTT } from '../../services/vttBridge.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const selectedCategory = ref('all');
const searchQuery = ref('');

// Editing modal state
const editingAdv = ref(null);
const editForm = ref({
  name: '',
  specification: '',
  ranks: 1,
  desc: ''
});

const effectiveAdvantages = computed(() => {
  return heroStore.effectiveAdvantages || [];
});

const availableCategories = computed(() => {
  const all = effectiveAdvantages.value;
  const counts = { all: all.length, combat: 0, skill: 0, fortune: 0, general: 0 };
  all.forEach(adv => {
    const cat = getAdvCategory(adv).toLowerCase();
    if (counts[cat] !== undefined) {
      counts[cat]++;
    } else {
      counts.general = (counts.general || 0) + 1;
    }
  });
  return [
    { id: 'all', label: 'All', count: counts.all, icon: 'ri-apps-line' },
    { id: 'combat', label: 'Combat', count: counts.combat, icon: 'ri-sword-line' },
    { id: 'skill', label: 'Skill', count: counts.skill, icon: 'ri-focus-3-line' },
    { id: 'fortune', label: 'Fortune', count: counts.fortune, icon: 'ri-dice-line' },
    { id: 'general', label: 'General', count: counts.general, icon: 'ri-shield-line' },
  ].filter(c => c.id === 'all' || c.count > 0);
});

const filteredAdvantages = computed(() => {
  return effectiveAdvantages.value.filter(adv => {
    if (selectedCategory.value !== 'all') {
      const cat = getAdvCategory(adv).toLowerCase();
      if (cat !== selectedCategory.value) return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const name = (adv.name || '').toLowerCase();
      const spec = (adv.specification || '').toLowerCase();
      const desc = (adv.desc || getAdvDesc(adv.name)).toLowerCase();
      if (!name.includes(q) && !spec.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });
});

function clearFilter() {
  selectedCategory.value = 'all';
  searchQuery.value = '';
}

function getAdvRule(name) {
  return ADVANTAGES.find(r => r.name.toLowerCase() === (name || '').toLowerCase());
}

function getAdvCategory(adv) {
  const name = typeof adv === 'string' ? adv : (adv?.name || '');
  if (typeof adv === 'object' && adv.isCustom && adv.category) return adv.category;
  const rule = getAdvRule(name);
  return rule?.category || 'General';
}

function getCategoryIcon(adv) {
  const cat = getAdvCategory(adv);
  switch (cat) {
    case 'Combat': return 'ri-sword-line';
    case 'Fortune': return 'ri-dice-line';
    case 'Skill': return 'ri-focus-3-line';
    case 'General': return 'ri-shield-line';
    default: return 'ri-shield-line';
  }
}

function getAdvDesc(name) {
  const rule = getAdvRule(name);
  return rule?.desc || 'Rules description unavailable.';
}

function isAdvRanked(name) {
  const rule = getAdvRule(name);
  return !!rule?.ranked;
}

function getMaxRanks(name) {
  const rule = getAdvRule(name);
  return rule?.maxRanks || null;
}

function stepRank(adv, delta) {
  if (adv.isPowerGranted) return;
  const cur = adv.naturalRanks;
  const next = Math.max(1, cur + delta);
  heroStore.setAdvantageRank(adv.id, next);
}

function deleteAdvantage(adv) {
  if (adv.isPowerGranted) return;
  heroStore.removeAdvantage(adv.id);
  uiStore.showToast(`Removed ${adv.displayName || adv.name} from Advantages`, 'info');
}

function openEditModal(adv) {
  editingAdv.value = adv;
  editForm.value = {
    name: adv.name,
    specification: adv.specification || '',
    ranks: adv.naturalRanks || 1,
    desc: adv.desc || ''
  };
}

function saveAdvantageEdit() {
  if (!editingAdv.value) return;
  heroStore.updateAdvantage(editingAdv.value.id, {
    name: editForm.value.name,
    specification: editForm.value.specification,
    ranks: editForm.value.ranks,
    desc: editForm.value.desc
  });
  const disp = editForm.value.specification.trim()
    ? `${editForm.value.name} (${editForm.value.specification})`
    : editForm.value.name;
  uiStore.showToast(`Updated "${disp}"!`, 'success');
  editingAdv.value = null;
}

function broadcastAdvantage(adv) {
  const title = adv.displayName || adv.name;
  const desc = adv.desc || getAdvDesc(adv.name);
  const text = `**${title}** [Rank ${adv.ranks}]\n${desc}`;

  sendFeatureToVTT({
    name: title,
    category: 'advantage',
    type: 'Advantage',
    subtype: adv.specification ? `${getAdvCategory(adv)} (${adv.specification})` : getAdvCategory(adv),
    ranks: adv.ranks || 1,
    description: desc,
    details: `${getAdvCategory(adv)} Advantage • Rank ${adv.ranks}`
  }, heroStore.character);

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    uiStore.showToast(`Broadcasted "${title}" to Roll20 and copied to clipboard!`, 'info');
  } else {
    uiStore.showToast(`Broadcasted "${title}" to Roll20!`, 'info');
  }
}
</script>

<style scoped>
.advantages-hub-pane {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.adv-pp-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #60a5fa;
  background: rgba(0, 111, 184, 0.14);
  border: 1px solid rgba(0, 111, 184, 0.3);
  padding: 0.18rem 0.55rem;
  border-radius: var(--radius-xs);
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.02em;
}

.dndb-pane-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add-advantage {
  background: rgba(0, 111, 184, 0.14);
  border: 1px solid rgba(0, 111, 184, 0.38);
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.btn-add-advantage:hover {
  background: var(--accent-primary);
  border-color: var(--accent-secondary);
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-add-advantage:active {
  transform: scale(0.95);
}

/* Category Filter Tabs & Quick Search */
.adv-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-bottom: 0.1rem;
}

.adv-filter-tabs {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.adv-filter-tab {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.adv-filter-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.adv-filter-tab.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.adv-filter-tab .tab-count {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.05rem 0.25rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
}

.adv-filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.adv-search-mini {
  display: flex;
  align-items: center;
  background: rgba(11, 15, 23, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--radius-xs);
  padding: 0.18rem 0.45rem;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  transition: border-color var(--trans-fast);
}

.adv-search-mini:focus-within {
  border-color: var(--accent-secondary, #2a8fd6);
  box-shadow: 0 0 0 2px rgba(42, 143, 214, 0.25);
}

.adv-search-input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.72rem;
  outline: none;
  width: 95px;
}

.adv-search-input::placeholder {
  color: var(--text-muted);
}

.adv-search-clear {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.adv-search-clear:hover {
  color: #ffffff;
}

/* Empty State */
.adv-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.2rem 1.25rem;
  background: rgba(255, 255, 255, 0.015);
  border: 1px dashed rgba(255, 255, 255, 0.09);
  border-radius: var(--radius-md);
  gap: 0.55rem;
}

.adv-empty-icon {
  font-size: 2rem;
  color: rgba(0, 111, 184, 0.45);
}

.adv-empty-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.adv-empty-desc {
  font-size: 0.76rem;
  color: var(--text-muted);
  max-width: 420px;
  margin: 0;
  line-height: 1.4;
}

.btn-browse-empty-cta {
  margin-top: 0.35rem;
  background: rgba(0, 111, 184, 0.18);
  border: 1px solid rgba(0, 111, 184, 0.4);
  color: #38bdf8;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.btn-browse-empty-cta:hover {
  background: var(--accent-primary);
  color: #ffffff;
}

/* 2-COLUMN RESPONSIVE ADVANTAGES GRID (OPTION 2) */
.sheet-advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.55rem;
}

.sheet-adv-card {
  background: rgba(17, 24, 39, 0.55);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: all var(--trans-fast);
}

.sheet-adv-card:hover {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(23, 31, 49, 0.75);
}

.sheet-adv-card.is-power-granted {
  border-color: rgba(56, 189, 248, 0.35);
}

/* Card Header Row */
.adv-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.4rem;
}

.adv-card-title-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  flex: 1;
}

.adv-card-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
}

.adv-card-icon.combat { color: #f87171; }
.adv-card-icon.fortune { color: #34d399; }
.adv-card-icon.skill { color: #38bdf8; }
.adv-card-icon.general { color: #c084fc; }

.adv-card-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.25;
  word-break: break-word;
}

/* Tactile Action Cluster */
.adv-action-cluster {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}

.adv-act-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  transition: all var(--trans-fast);
}

.adv-act-btn:active {
  transform: scale(0.92);
}

.adv-act-btn.btn-broadcast:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.16);
  border-color: rgba(56, 189, 248, 0.45);
}

.adv-act-btn.btn-delete:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
}

.adv-act-btn.btn-locked {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Meta Bar: Tags & Compact Rank Stepper */
.adv-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.adv-meta-tags {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.adv-cat-tag {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.08rem 0.38rem;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.adv-cat-tag.combat { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.28); }
.adv-cat-tag.fortune { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.28); }
.adv-cat-tag.skill { background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.28); }
.adv-cat-tag.general { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.28); }
.adv-cat-tag.power {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.adv-cost-tag {
  font-size: 0.64rem;
  font-weight: 800;
  padding: 0.08rem 0.38rem;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-family: var(--font-mono, monospace);
}

/* Compact Rank Stepper */
.adv-card-stepper {
  display: inline-flex;
  align-items: center;
  background: rgba(11, 15, 23, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-xs);
  padding: 1px;
  gap: 2px;
}

.adv-step-btn {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: calc(var(--radius-xs) - 1px);
  color: #ffffff;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.adv-step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.adv-step-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.adv-step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.adv-step-text {
  font-size: 0.7rem;
  font-weight: 800;
  color: #ffffff;
  padding: 0 0.35rem;
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
}

/* Rules Description (Proportional & Clean) */
.adv-card-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sheet-adv-card:hover .adv-card-desc {
  -webkit-line-clamp: unset;
  overflow: visible;
}

/* No Match Indicator */
.adv-no-filter-match {
  padding: 1.5rem 1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.015);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.76rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.btn-clear-filter {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-clear-filter:hover {
  background: rgba(255, 255, 255, 0.12);
}

.adv-card-titles {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.adv-spec-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #c084fc;
  background: rgba(168, 85, 247, 0.14);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
  align-self: flex-start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.adv-act-btn.btn-edit:hover {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.18);
  border-color: rgba(245, 158, 11, 0.45);
}

.adv-cat-tag.custom {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

/* EDIT MODAL STYLES */
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
.spec-textarea-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
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

.step-btn-xs {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.step-btn-xs:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.step-val-xs {
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 16px;
  text-align: center;
  color: #fff;
}
</style>
