<template>
  <transition name="fade">
    <div
      v-if="builderStore.isEffectsLibraryOpen"
      class="modal-overlay open"
      @click.self="builderStore.closeEffectsLibrary"
    >
      <div class="modal-dialog modal-xl effects-library-dialog">
        <!-- HEADER -->
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="icon"><i class="ri-magic-line"></i></span>
            <div>
              <h3>M&M 3e Power Effects Library</h3>
              <p class="modal-subtitle">Official Mutants & Masterminds 3rd Edition Base Effects (Hero's Handbook Ch. 6)</p>
            </div>
          </div>
          <div class="modal-header-actions">
            <span class="badge badge-accent">{{ BASE_EFFECTS.length }} Effects Catalog</span>
            <button
              type="button"
              class="modal-close-btn"
              @click="builderStore.closeEffectsLibrary"
              title="Close Effects Library"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>

        <!-- BODY -->
        <div class="modal-body">
          <!-- SEARCH & CATEGORY BAR -->
          <div class="effects-filter-toolbar">
            <div class="palette-search-box flex-1">
              <span class="search-icon"><i class="ri-search-line"></i></span>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="palette-search"
                placeholder="Search effects catalog... (e.g. Damage, Blast, Flight, Protection, Affliction, Teleport)"
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
                <i :class="getCategoryIcon(cat)"></i>
                <span>{{ cat }} ({{ getCategoryCount(cat) }})</span>
              </button>
            </div>
          </div>

          <!-- PARAMETER FILTER CHIPS ROW -->
          <div class="params-filter-row">
            <span class="filter-label">Quick Filters:</span>
            <button
              v-for="flt in ['All Ranges', 'Close', 'Ranged', 'Personal', 'Perception']"
              :key="flt"
              type="button"
              class="param-filter-pill"
              :class="{ active: rangeFilter === flt }"
              @click="rangeFilter = flt"
            >
              {{ flt }}
            </button>
          </div>

          <!-- EFFECTS CARDS GRID -->
          <div class="effects-catalog-grid">
            <div
              v-if="filteredEffects.length === 0"
              class="empty-hint"
              style="grid-column: 1 / -1;"
            >
              <i class="ri-search-eye-line" style="font-size: 2rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;"></i>
              No effects found matching "{{ searchQuery }}".
            </div>

            <div
              v-for="eff in filteredEffects"
              :key="eff.name"
              class="effect-card"
              :class="{ active: isCurrentActive(eff.name) }"
            >
              <div class="effect-card-header">
                <div class="effect-title-group">
                  <span class="effect-cat-tag" :class="getCategoryClass(eff.category)">
                    {{ eff.category }}
                  </span>
                  <strong class="effect-name">{{ eff.name }}</strong>
                </div>
                <span class="effect-cost-badge">{{ eff.cost }} PP / Rank</span>
              </div>

              <!-- Parameter Chips -->
              <div class="effect-param-chips">
                <span class="param-tag"><i class="ri-time-line"></i> {{ eff.action }}</span>
                <span class="param-tag"><i class="ri-crosshair-2-line"></i> {{ eff.range }}</span>
                <span class="param-tag"><i class="ri-hourglass-line"></i> {{ eff.duration }}</span>
                <span v-if="eff.resistance" class="param-tag res-tag">
                  <i class="ri-shield-line"></i> vs {{ eff.resistance }}
                </span>
              </div>

              <!-- Description -->
              <p class="effect-desc">{{ eff.desc }}</p>

              <!-- Footer Select Button -->
              <div class="effect-card-footer">
                <span v-if="isCurrentActive(eff.name)" class="active-effect-label">
                  <i class="ri-checkbox-circle-fill"></i> Current Base Effect
                </span>
                <button
                  type="button"
                  class="btn-select-effect"
                  :class="{ 'btn-selected': isCurrentActive(eff.name) }"
                  @click="selectEffect(eff.name)"
                >
                  <i :class="isCurrentActive(eff.name) ? 'ri-check-line' : 'ri-magic-line'"></i>
                  <span>{{ isCurrentActive(eff.name) ? 'Keep Effect' : 'Select Effect' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="modal-footer">
          <span class="modal-footer-hint">
            <i class="ri-lightbulb-line"></i> Select an effect to configure its rank, extras, flaws, and combat metrics.
          </span>
          <button
            type="button"
            class="btn btn-secondary"
            @click="builderStore.closeEffectsLibrary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { BASE_EFFECTS, EFFECT_CATEGORIES } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();

const searchInputRef = ref(null);
const searchQuery = ref('');
const activeCategory = ref('All');
const rangeFilter = ref('All Ranges');

const categories = EFFECT_CATEGORIES;

watch(() => builderStore.isEffectsLibraryOpen, (isOpen) => {
  if (isOpen) {
    searchQuery.value = '';
    activeCategory.value = 'All';
    rangeFilter.value = 'All Ranges';
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Attack': return 'ri-sword-line';
    case 'Defense': return 'ri-shield-line';
    case 'Movement': return 'ri-flight-takeoff-line';
    case 'Sensory': return 'ri-eye-line';
    case 'Control & Utility': return 'ri-equalizer-line';
    default: return 'ri-apps-line';
  }
}

function getCategoryClass(cat) {
  switch (cat) {
    case 'Attack': return 'cat-attack';
    case 'Defense': return 'cat-defense';
    case 'Movement': return 'cat-movement';
    case 'Sensory': return 'cat-sensory';
    default: return 'cat-control';
  }
}

function getCategoryCount(cat) {
  if (cat === 'All') return BASE_EFFECTS.length;
  return BASE_EFFECTS.filter(e => e.category === cat).length;
}

const filteredEffects = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;
  const rf = rangeFilter.value;

  return BASE_EFFECTS.filter(e => {
    // 1. Text search
    const matchQuery = !q ||
      e.name.toLowerCase().includes(q) ||
      e.desc.toLowerCase().includes(q) ||
      (e.resistance && e.resistance.toLowerCase().includes(q));

    if (!matchQuery) return false;

    // 2. Category match
    if (cat !== 'All' && e.category !== cat) return false;

    // 3. Range filter
    if (rf !== 'All Ranges' && e.range.toLowerCase() !== rf.toLowerCase()) return false;

    return true;
  });
});

function isCurrentActive(effectName) {
  const target = builderStore.targetForEffectsLibrary || builderStore.currentEditingEffect;
  return target && (target.baseEffect || '').toLowerCase() === effectName.toLowerCase();
}

function selectEffect(effectName) {
  builderStore.selectBaseEffectForTarget(effectName);
}
</script>

<style scoped>
.effects-library-dialog {
  max-width: 1180px;
  width: 95%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.effects-filter-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.clear-search-btn:hover {
  color: #fff;
}

.filter-pills-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
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

.effects-library-dialog {
  max-width: 1140px;
  width: 95%;
  height: 88vh;
  max-height: calc(100dvh - 3rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.effects-library-dialog .modal-header {
  flex-shrink: 0;
}

.effects-library-dialog .modal-body {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  padding: 1.25rem 1.25rem 0.5rem 1.5rem;
}

.effects-filter-toolbar {
  flex-shrink: 0;
}

.params-filter-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
}

.param-filter-pill {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  cursor: pointer;
  transition: all var(--trans-fast);
}

.param-filter-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.param-filter-pill.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.effects-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

.effects-catalog-grid::-webkit-scrollbar {
  width: 6px;
}

.effects-catalog-grid::-webkit-scrollbar-track {
  background: transparent;
}

.effects-catalog-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}

.effects-catalog-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}

.effects-library-dialog .modal-footer {
  flex-shrink: 0;
}

.effect-card {
  background: rgba(20, 20, 28, 0.65);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all var(--trans-fast);
}

.effect-card:hover {
  background: rgba(25, 25, 35, 0.85);
  border-color: rgba(220, 38, 38, 0.35);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.effect-card.active {
  border-color: #34d399;
  background: rgba(16, 185, 129, 0.06);
}

.effect-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.effect-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.effect-name {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
}

.effect-cat-tag {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  text-transform: uppercase;
  width: fit-content;
  letter-spacing: 0.04em;
}

.cat-attack { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
.cat-defense { background: rgba(56, 189, 248, 0.15); color: #7dd3fc; }
.cat-movement { background: rgba(245, 158, 11, 0.15); color: #fde68a; }
.cat-sensory { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; }
.cat-control { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }

.effect-cost-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

.effect-param-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.param-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.param-tag.res-tag {
  color: #f87171;
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
}

.effect-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.effect-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 0.5rem;
}

.active-effect-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-select-effect {
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #fff;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.32rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
  transition: all var(--trans-fast);
}

.btn-select-effect:hover {
  background: #ef4444;
}

.btn-select-effect.btn-selected {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #6ee7b7;
}

.btn-select-effect.btn-selected:hover {
  background: #10b981;
  color: #000;
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
</style>
