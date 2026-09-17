<template>
  <div class="step-advantages-container">
    <!-- STEP BANNER -->
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-medal-line"></i></div>
      <div class="step-banner-content">
        <div class="step-title-row">
          <h3 class="step-title">Advantages</h3>
          <span class="badge-total-pp tabular-nums">
            Total: {{ heroStore.advantagesCost }} PP ({{ selectedCount }} Selected)
          </span>
        </div>
        <p class="step-subtitle">
          Select specialized talents, combat maneuvers, and heroic perks (<strong>1 PP per Rank</strong>).
        </p>
      </div>
      <button
        type="button"
        class="btn btn-secondary btn-sm btn-open-modal"
        @click="uiStore.openModal('advantage')"
        title="Open Full Advantage Library"
      >
        <i class="ri-book-open-line"></i>
        <span>Browse Advantage Library</span>
      </button>
    </div>

    <!-- MAIN COCKPIT: DUAL PANEL LAYOUT -->
    <div class="adv-cockpit-layout">
      <!-- LEFT PANEL: ACTIVE ADVANTAGES DECK (~40%) -->
      <div class="cockpit-card active-deck-panel">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <h4 class="panel-title">
              <span>Active Advantages</span>
            </h4>
            <span class="active-count-badge tabular-nums">{{ selectedCount }} Advantages</span>
          </div>

          <!-- MINI BREAKDOWN PILLS -->
          <div v-if="selectedCount > 0" class="active-breakdown-row">
            <span v-if="activeCategoryBreakdown.Combat > 0" class="mini-cat-chip combat">
              <i class="ri-sword-line"></i> {{ activeCategoryBreakdown.Combat }}
            </span>
            <span v-if="activeCategoryBreakdown.Fortune > 0" class="mini-cat-chip fortune">
              <i class="ri-clover-line"></i> {{ activeCategoryBreakdown.Fortune }}
            </span>
            <span v-if="activeCategoryBreakdown.Skill > 0" class="mini-cat-chip skill">
              <i class="ri-focus-3-line"></i> {{ activeCategoryBreakdown.Skill }}
            </span>
            <span v-if="activeCategoryBreakdown.General > 0" class="mini-cat-chip general">
              <i class="ri-shield-line"></i> {{ activeCategoryBreakdown.General }}
            </span>
          </div>
        </div>

        <!-- ACTIVE LIST BODY -->
        <div class="active-deck-body">
          <!-- EMPTY STATE WITH QUICK SUGGESTIONS -->
          <div v-if="selectedCount === 0" class="active-empty-state">
            <div class="empty-icon"><i class="ri-shield-star-line"></i></div>
            <h5 class="empty-title">No Advantages Selected Yet</h5>
            <p class="empty-desc">
              Browse the catalog on the right or tap quick recommendations below to add core hero perks.
            </p>

            <div class="quick-recs-wrap">
              <span class="quick-recs-label"><i class="ri-flashlight-line"></i> Quick Suggestions:</span>
              <div class="quick-recs-pills">
                <button
                  v-for="rec in quickRecommendations"
                  :key="rec"
                  type="button"
                  class="btn-quick-rec"
                  @click="addAdvantage(rec)"
                >
                  <i class="ri-add-line"></i> {{ rec }}
                </button>
              </div>
            </div>
          </div>

          <!-- ACTIVE ADVANTAGES CARDS LIST -->
          <div v-else class="active-cards-list">
            <div
              v-for="(adv, idx) in heroStore.character.advantages"
              :key="adv.id || adv.name"
              class="active-feat-card"
              :class="(getAdvantageMeta(adv.name).category || 'general').toLowerCase()"
            >
              <!-- Card Top Row -->
              <div class="active-feat-top">
                <div class="active-feat-identity">
                  <strong class="active-feat-name">{{ adv.name }}</strong>
                </div>

                <span class="active-pp-cost tabular-nums">
                  {{ getAdvantageCost(adv) }} PP
                </span>
              </div>

              <!-- Card Description Snippet -->
              <p class="active-feat-desc">
                {{ getAdvantageMeta(adv.name).desc }}
              </p>

              <!-- Card Bottom Controls -->
              <div class="active-feat-controls">
                <!-- If Ranked: Stepper controls -->
                <div v-if="getAdvantageMeta(adv.name).ranked" class="stepper-group">
                  <span class="stepper-label">
                    Rank:
                    <span v-if="getAdvantageMeta(adv.name).maxRanks" class="max-rank-hint">
                      (Max {{ getAdvantageMeta(adv.name).maxRanks }})
                    </span>
                  </span>
                  <div class="stepper-controls">
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="Number(adv.ranks || 1) <= 1"
                      @click="stepAdvantage(adv.name, -1)"
                      title="Decrease Rank"
                    >-</button>
                    <span class="step-value tabular-nums">{{ adv.ranks || 1 }}</span>
                    <button
                      type="button"
                      class="step-btn"
                      :disabled="getAdvantageMeta(adv.name).maxRanks && Number(adv.ranks || 1) >= getAdvantageMeta(adv.name).maxRanks"
                      @click="stepAdvantage(adv.name, 1)"
                      title="Increase Rank"
                    >+</button>
                  </div>
                </div>

                <!-- If Static / Non-Ranked -->
                <span v-else class="badge-static-rank">
                  <i class="ri-check-line"></i> 1 Rank (Static)
                </span>

                <!-- Delete Action -->
                <button
                  type="button"
                  class="btn-remove-active"
                  @click="removeAdvantage(adv.name)"
                  title="Remove from sheet"
                >
                  <i class="ri-delete-bin-line"></i>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: INTERACTIVE ADVANTAGES CATALOG (~60%) -->
      <div class="cockpit-card catalog-browser-panel">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <h4 class="panel-title">
              <i class="ri-book-mark-line text-accent"></i>
              <span>Advantages Catalog</span>
            </h4>
            <span class="catalog-count-hint tabular-nums">{{ filteredCatalog.length }} of 59 Available</span>
          </div>
        </div>

        <!-- SEARCH & CATEGORY FILTER TOOLBAR -->
        <div class="catalog-toolbar">
          <div class="catalog-search-box">
            <span class="search-icon"><i class="ri-search-line"></i></span>
            <input
              v-model="searchQuery"
              type="text"
              class="catalog-search-input"
              placeholder="Search advantages by name or rules... (e.g. Power Attack, Evasion, Luck)"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="clear-search-btn"
              @click="searchQuery = ''"
              title="Clear search"
            >
              <i class="ri-close-circle-line"></i>
            </button>
          </div>

          <!-- CATEGORY FILTER CHIPS -->
          <div class="filter-chips-row">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="cat-chip-btn"
              :class="{ active: activeCategory === cat }"
              @click="activeCategory = cat"
            >
              <i :class="getCategoryIconClass(cat)"></i>
              <span>{{ cat }}</span>
              <span class="cat-chip-count tabular-nums">({{ getCategoryCount(cat) }})</span>
            </button>
          </div>
        </div>

        <!-- CATALOG CARDS SCROLLABLE GRID -->
        <div ref="catalogScrollRef" class="catalog-cards-container">
          <!-- EMPTY FILTER RESULT -->
          <div v-if="filteredCatalog.length === 0" class="catalog-empty-hint">
            <i class="ri-search-eye-line empty-search-icon"></i>
            <h5>No Advantages Found</h5>
            <p>No advantages matched "{{ searchQuery }}" in category "{{ activeCategory }}".</p>
            <button
              type="button"
              class="btn btn-secondary btn-xs"
              @click="searchQuery = ''; activeCategory = 'All';"
            >
              Reset Filters
            </button>
          </div>

          <!-- CATALOG CARDS GRID -->
          <div v-else class="catalog-cards-grid">
            <div
              v-for="item in filteredCatalog"
              :key="item.name"
              class="catalog-card"
              :class="{
                'is-added': isAdvantageActive(item.name),
                [ (item.category || 'general').toLowerCase() ]: true
              }"
            >
              <!-- Card Header -->
              <div class="catalog-card-header">
                <div class="card-title-group">
                  <strong class="catalog-card-name">{{ item.name }}</strong>
                </div>

                <span v-if="item.ranked" class="badge-ranked-tag" title="Can be taken multiple times">
                  <i class="ri-star-fill"></i> Ranked
                </span>
              </div>

              <!-- Card Rules Description -->
              <p class="catalog-card-desc">
                {{ item.desc }}
              </p>

              <!-- Card Action Footer -->
              <div class="catalog-card-footer">
                <!-- If already added: Show Active Status + Inline Stepper + Quick Delete -->
                <div v-if="isAdvantageActive(item.name)" class="card-added-controls">
                  <span class="badge-added-status">
                    <i class="ri-checkbox-circle-fill"></i>
                    <span>On Sheet ({{ getAdvantageRanks(item.name) }} Rk)</span>
                  </span>

                  <div class="inline-actions-wrap">
                    <!-- Inline Stepper for Ranked Feats -->
                    <div v-if="item.ranked" class="stepper-mini">
                      <button
                        type="button"
                        class="step-btn-mini"
                        :disabled="getAdvantageRanks(item.name) <= 1"
                        @click="stepAdvantage(item.name, -1)"
                        title="Decrease Rank"
                      >-</button>
                      <span class="step-val-mini tabular-nums">{{ getAdvantageRanks(item.name) }}</span>
                      <button
                        type="button"
                        class="step-btn-mini"
                        :disabled="item.maxRanks && getAdvantageRanks(item.name) >= item.maxRanks"
                        @click="stepAdvantage(item.name, 1)"
                        title="Increase Rank"
                      >+</button>
                    </div>

                    <!-- Quick Delete Button -->
                    <button
                      type="button"
                      class="btn-delete-mini"
                      @click="removeAdvantage(item.name)"
                      title="Remove from Sheet"
                    >
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </div>

                <!-- If not on sheet: Add Button -->
                <button
                  v-else
                  type="button"
                  class="btn-add-feat"
                  @click="addAdvantage(item.name)"
                >
                  <i class="ri-add-line"></i>
                  <span>Add ({{ item.ranked ? '1 Rank' : '1 PP' }})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { ADVANTAGES, ADVANTAGE_CATEGORIES } from '../../rules/advantages.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const activeCategory = ref('All');
const searchQuery = ref('');
const catalogScrollRef = ref(null);

const categories = ADVANTAGE_CATEGORIES;

const selectedCount = computed(() => {
  return (heroStore.character.advantages || []).length;
});

// Category count breakdown for active advantages in left deck
const activeCategoryBreakdown = computed(() => {
  const advs = heroStore.character.advantages || [];
  const map = { Combat: 0, Fortune: 0, General: 0, Skill: 0 };
  for (const a of advs) {
    const meta = ADVANTAGES.find(m => m.name.toLowerCase() === a.name.toLowerCase());
    const cat = meta?.category || 'General';
    if (map[cat] !== undefined) map[cat]++;
    else map.General++;
  }
  return map;
});

// Quick recommendation feats for empty state
const quickRecommendations = [
  'Power Attack',
  'Improved Initiative',
  'Luck',
  'Evasion',
  'Agile Feint',
  'Accurate Attack'
];

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

const filteredCatalog = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;

  return ADVANTAGES.filter(item => {
    // Search match
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      (item.desc && item.desc.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Category match - FIXED BUG: uses item.category instead of item.type!
    if (cat === 'All') return true;
    if (cat === 'Ranked') return !!item.ranked;
    return item.category === cat;
  });
});

watch([activeCategory, searchQuery], () => {
  nextTick(() => {
    if (catalogScrollRef.value) {
      catalogScrollRef.value.scrollTop = 0;
    }
  });
});

function getAdvantageMeta(name) {
  return ADVANTAGES.find(a => a.name.toLowerCase() === name.toLowerCase()) || {
    name,
    category: 'General',
    desc: ''
  };
}

function isAdvantageActive(name) {
  const advs = heroStore.character.advantages || [];
  return advs.some(a => a.name.toLowerCase() === name.toLowerCase());
}

function getAdvantageRanks(name) {
  const advs = heroStore.character.advantages || [];
  const found = advs.find(a => a.name.toLowerCase() === name.toLowerCase());
  return found ? (Number(found.ranks ?? found.rank) || 1) : 0;
}

function getAdvantageCost(adv) {
  return Number(adv.ranks ?? adv.rank) || 1;
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
    const meta = getAdvantageMeta(name);
    let next = cur + delta;
    if (next < 1) next = 1;
    if (meta?.maxRanks && next > meta.maxRanks) next = meta.maxRanks;
    heroStore.setAdvantageRank(idx, next);
  }
}

function removeAdvantage(name) {
  const advs = heroStore.character.advantages || [];
  const idx = advs.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    heroStore.removeAdvantage(idx);
    uiStore.showToast(`Removed ${name} from Advantages`, 'info');
  }
}
</script>

<style scoped>
.step-advantages-container {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

/* ==========================================================================
   STEP BANNER (Clean M&M Crimson/Amber Aesthetic)
   ========================================================================== */
.step-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.15rem 1.35rem;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 15, 22, 0.6) 100%);
  border: 1px solid rgba(236, 72, 153, 0.25);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.step-banner-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(236, 72, 153, 0.16);
  border: 1px solid rgba(236, 72, 153, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  color: #f472b6;
  flex-shrink: 0;
}

.step-banner-content {
  flex: 1;
  min-width: 0;
}

.step-title-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: var(--letter-spacing-tight);
  margin: 0;
}

.badge-total-pp {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(236, 72, 153, 0.18);
  border: 1px solid rgba(236, 72, 153, 0.4);
  color: #f472b6;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-xs);
}

.step-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.45;
}

.btn-open-modal {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.5rem 0.95rem;
  white-space: nowrap;
  flex-shrink: 0;
  border-color: rgba(255, 255, 255, 0.18);
  transition: all var(--trans-fast);
}

.btn-open-modal:hover {
  border-color: rgba(236, 72, 153, 0.5);
  color: #f472b6;
}

/* ==========================================================================
   COCKPIT DUAL PANEL LAYOUT
   ========================================================================== */
.adv-cockpit-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(440px, 1.45fr);
  gap: 1.25rem;
  align-items: stretch;
}

.cockpit-card {
  background: rgba(18, 18, 26, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 0.95rem 1.25rem;
  background: rgba(10, 10, 15, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.panel-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.active-count-badge {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs);
}

.catalog-count-hint {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* ==========================================================================
   LEFT PANEL: ACTIVE ADVANTAGES DECK
   ========================================================================== */
.active-breakdown-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mini-cat-chip {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.mini-cat-chip.combat { background: rgba(239, 68, 68, 0.18); color: #fca5a5; }
.mini-cat-chip.fortune { background: rgba(168, 85, 247, 0.18); color: #d8b4fe; }
.mini-cat-chip.skill { background: rgba(56, 189, 248, 0.18); color: #7dd3fc; }
.mini-cat-chip.general { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; }

.active-deck-body {
  padding: 1rem 1.15rem;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Empty State */
.active-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.25rem 1rem;
  color: var(--text-muted);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.015);
  margin: auto 0;
}

.empty-icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 0.65rem;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.35rem;
}

.empty-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.45;
  max-width: 320px;
  margin: 0 0 1.25rem;
}

.quick-recs-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.quick-recs-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.quick-recs-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}

.btn-quick-rec {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.btn-quick-rec:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.4);
  color: #fff;
  transform: translateY(-1px);
}

.btn-quick-rec:active {
  transform: scale(0.96);
}

/* Active Cards List */
.active-cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 580px;
  overflow-y: auto;
  padding-right: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.active-cards-list::-webkit-scrollbar {
  width: 6px;
}
.active-cards-list::-webkit-scrollbar-track {
  background: transparent;
}
.active-cards-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 4px;
}

.active-feat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid #64748b;
  border-radius: var(--radius-md);
  padding: 0.85rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all var(--trans-fast);
}

.active-feat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.active-feat-card.combat { border-left-color: #ef4444; }
.active-feat-card.fortune { border-left-color: #10b981; }
.active-feat-card.skill { border-left-color: #38bdf8; }
.active-feat-card.general { border-left-color: #a855f7; }

.active-feat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.active-feat-identity {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.active-cat-tag {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.active-cat-tag.combat { background: rgba(239, 68, 68, 0.18); color: #fca5a5; }
.active-cat-tag.fortune { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; }
.active-cat-tag.skill { background: rgba(56, 189, 248, 0.18); color: #7dd3fc; }
.active-cat-tag.general { background: rgba(168, 85, 247, 0.18); color: #d8b4fe; }

.active-feat-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
}

.active-pp-cost {
  font-size: 0.78rem;
  font-weight: 800;
  color: #ec4899;
  background: rgba(236, 72, 153, 0.12);
  border: 1px solid rgba(236, 72, 153, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

.active-feat-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  text-wrap: pretty;
}

.active-feat-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 0.5rem;
}

.stepper-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.stepper-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 700;
}

.max-rank-hint {
  font-size: 0.65rem;
  color: #f59e0b;
}

.stepper-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.15rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.step-btn {
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 3px;
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--trans-fast);
}

.step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}

.step-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.step-value {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  min-width: 20px;
  text-align: center;
}

.badge-static-rank {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-remove-active {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--trans-fast);
}

.btn-remove-active:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.btn-remove-active:active {
  transform: scale(0.96);
}

/* ==========================================================================
   RIGHT PANEL: INTERACTIVE ADVANTAGES CATALOG
   ========================================================================== */
.catalog-toolbar {
  padding: 0.85rem 1.15rem 0.65rem;
  background: rgba(14, 14, 20, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex-shrink: 0;
}

.catalog-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.catalog-search-box .search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  pointer-events: none;
}

.catalog-search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  padding: 0.45rem 2.2rem 0.45rem 2.35rem;
  color: #fff;
  font-size: 0.82rem;
  transition: all var(--trans-fast);
}

.catalog-search-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
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

.filter-chips-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.filter-chips-row::-webkit-scrollbar {
  display: none;
}

.cat-chip-btn {
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

.cat-chip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.cat-chip-btn:active {
  transform: scale(0.96);
}

.cat-chip-btn.active {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.cat-chip-count {
  font-size: 0.68rem;
  opacity: 0.85;
}

/* Catalog Scrollable Grid Area */
.catalog-cards-container {
  padding: 1rem 1.15rem;
  flex: 1;
  min-height: 0;
  max-height: 600px;
  overflow-y: auto;
  overscroll-behavior-y: auto;
  will-change: scroll-position;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.catalog-cards-container::-webkit-scrollbar {
  width: 6px;
}
.catalog-cards-container::-webkit-scrollbar-track {
  background: transparent;
}
.catalog-cards-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 4px;
}

.catalog-empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-search-icon {
  font-size: 2.25rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.catalog-empty-hint h5 {
  color: #fff;
  font-weight: 800;
  margin: 0 0 0.35rem;
}

.catalog-empty-hint p {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.catalog-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.85rem;
}

.catalog-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
  transition: all var(--trans-fast);
}

.catalog-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.catalog-card.is-added {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.04);
}

.catalog-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.45rem;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.adv-cat-tag {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.adv-cat-tag.combat { background: rgba(239, 68, 68, 0.18); color: #fca5a5; }
.adv-cat-tag.fortune { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; }
.adv-cat-tag.skill { background: rgba(56, 189, 248, 0.18); color: #7dd3fc; }
.adv-cat-tag.general { background: rgba(168, 85, 247, 0.18); color: #d8b4fe; }

.catalog-card-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
}

.badge-ranked-tag {
  font-size: 0.62rem;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.18);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.1rem 0.38rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.catalog-card-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.42;
  margin: 0;
  flex: 1;
  text-wrap: pretty;
}

.catalog-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn-add-feat {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all var(--trans-fast);
}

.btn-add-feat:hover {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.btn-add-feat:active {
  transform: scale(0.96);
}

.card-added-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.4rem;
}

.badge-added-status {
  font-size: 0.72rem;
  font-weight: 800;
  color: #34d399;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.inline-actions-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stepper-mini {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.1rem;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step-btn-mini {
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 2px;
  color: #fff;
  font-weight: 800;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--trans-fast);
}

.step-btn-mini:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.22);
}

.step-btn-mini:active:not(:disabled) {
  transform: scale(0.9);
}

.step-btn-mini:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.step-val-mini {
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  min-width: 14px;
  text-align: center;
}

.btn-delete-mini {
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

.btn-delete-mini:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-delete-mini:active {
  transform: scale(0.9);
}

/* ==========================================================================
   RESPONSIVE BREAKPOINTS
   ========================================================================== */
@media (max-width: 960px) {
  .adv-cockpit-layout {
    grid-template-columns: 1fr;
  }

  .catalog-cards-container {
    max-height: 480px;
  }

  .active-cards-list {
    max-height: 380px;
  }
}

@media (max-width: 640px) {
  .step-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-open-modal {
    width: 100%;
    justify-content: center;
  }

  .catalog-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
