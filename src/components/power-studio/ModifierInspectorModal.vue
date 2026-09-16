<template>
  <transition name="fade">
    <div
      v-if="builderStore.isModifierInspectorOpen"
      class="modal-overlay open"
      @click.self="builderStore.closeModifierInspector"
    >
      <div class="modal-dialog modal-xl modifier-library-dialog">
        <!-- HEADER -->
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="icon"><i class="ri-equalizer-line"></i></span>
            <div>
              <h3>Extras & Flaws Modifiers Library</h3>
              <p class="modal-subtitle">Official Mutants & Masterminds 3e Power Modifiers (Hero's Handbook Ch. 6)</p>
            </div>
          </div>
          <div class="modal-header-actions">
            <span class="badge badge-accent">
              Target: {{ targetEffect?.name || targetEffect?.baseEffect || 'Effect' }}
            </span>
            <button
              type="button"
              class="modal-close-btn"
              @click="builderStore.closeModifierInspector"
              title="Close Modifiers Library"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>

        <!-- BODY -->
        <div class="modal-body modifier-modal-body">
          <!-- TOP CONTROLS: TABS & SEARCH -->
          <div class="mod-top-toolbar">
            <!-- Tabs: Extras (+PP) vs Flaws (-PP) -->
            <div class="mod-type-tabs">
              <button
                type="button"
                class="mod-tab-btn extra"
                :class="{ active: activeTab === 'extras' }"
                @click="activeTab = 'extras'"
              >
                <i class="ri-add-circle-line"></i>
                <span>Extras (+PP)</span>
                <span class="mod-tab-count">{{ filteredExtras.length }}</span>
              </button>
              <button
                type="button"
                class="mod-tab-btn flaw"
                :class="{ active: activeTab === 'flaws' }"
                @click="activeTab = 'flaws'"
              >
                <i class="ri-indeterminate-circle-line"></i>
                <span>Flaws (-PP)</span>
                <span class="mod-tab-count">{{ filteredFlaws.length }}</span>
              </button>
            </div>

            <!-- Search input -->
            <div class="palette-search-box flex-1">
              <i class="ri-search-line search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search modifiers (e.g., Multiattack, Area, Penetrating, Limited, Distracting)..."
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
          </div>

          <!-- CATEGORY FILTER CHIPS -->
          <div class="mod-category-filters">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="cat-filter-btn"
              :class="[
                { active: activeCategory === cat },
                activeTab === 'extras' ? 'is-extra' : 'is-flaw'
              ]"
              @click="activeCategory = cat"
            >
              <i :class="getCategoryIcon(cat)"></i>
              <span>{{ cat === 'all' ? 'All Categories' : cat }}</span>
              <span class="cat-filter-count">({{ getCategoryCount(cat) }})</span>
            </button>
          </div>

          <!-- MODIFIERS CARDS GRID -->
          <div ref="gridRef" class="mod-cards-grid">
            <div
              v-if="currentList.length === 0"
              class="empty-hint"
              style="grid-column: 1 / -1;"
            >
              <i class="ri-inbox-line" style="font-size: 2rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;"></i>
              No modifiers found matching "{{ searchQuery }}".
            </div>

            <div
              v-for="mod in currentList"
              :key="mod.name"
              class="modifier-catalog-card"
              :class="[
                activeTab === 'extras' ? 'card-extra' : 'card-flaw',
                { 'is-applied': isApplied(mod.name) }
              ]"
            >
              <!-- Card Top Row -->
              <div class="card-top-row">
                <div class="card-name-cat">
                  <span class="mod-category-badge">{{ mod.category || 'General' }}</span>
                  <strong class="mod-name">{{ mod.name }}</strong>
                </div>
                <span class="mod-cost-tag" :class="activeTab === 'extras' ? 'tag-extra' : 'tag-flaw'">
                  {{ formatCost(mod) }}
                </span>
              </div>

              <!-- Rules Description -->
              <p class="mod-desc-text">{{ mod.desc }}</p>

              <!-- Configurable Options (e.g. Area types or specific options) -->
              <div v-if="mod.options && mod.options.length > 0" class="mod-options-box">
                <span class="options-label">Select Option:</span>
                <div class="options-chips">
                  <button
                    v-for="opt in mod.options"
                    :key="opt.id"
                    type="button"
                    class="option-chip"
                    :class="{ active: getSelectedOptionId(mod.name) === opt.id }"
                    @click="setModifierOption(mod, opt)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <!-- Card Bottom Actions -->
              <div class="card-bottom-actions">
                <!-- If already applied: Applied badge, stepper if ranked, and remove button -->
                <div v-if="isApplied(mod.name)" class="applied-controls-row">
                  <span class="badge-applied">
                    <i class="ri-checkbox-circle-fill"></i> Applied
                  </span>

                  <!-- Stepper if has ranks -->
                  <div v-if="mod.hasRanks || (getAppliedInstance(mod.name)?.ranks || 1) > 1" class="stepper-compact">
                    <button
                      type="button"
                      class="step-btn-xs"
                      :disabled="getAppliedRanks(mod.name) <= 1"
                      @click="stepAppliedRank(mod.name, -1)"
                      title="Decrease Rank"
                    >-</button>
                    <span class="step-val-xs">R{{ getAppliedRanks(mod.name) }}</span>
                    <button
                      type="button"
                      class="step-btn-xs"
                      @click="stepAppliedRank(mod.name, 1)"
                      title="Increase Rank"
                    >+</button>
                  </div>

                  <button
                    type="button"
                    class="btn-remove-mod"
                    @click="removeApplied(mod.name)"
                    title="Remove from effect"
                  >
                    <i class="ri-delete-bin-line"></i> Remove
                  </button>
                </div>

                <!-- If not yet applied: Add button -->
                <button
                  v-else
                  type="button"
                  class="btn-add-modifier"
                  :class="activeTab === 'extras' ? 'btn-extra' : 'btn-flaw'"
                  @click="handleAdd(mod)"
                >
                  <i class="ri-add-line"></i>
                  <span>Add to Effect</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER WITH LIVE COST IMPACT -->
        <div class="modal-footer">
          <div class="effect-cost-telemetry">
            <span class="telemetry-item">
              Base: <strong>{{ targetEffect?.baseCost || 1 }} PP/R</strong>
            </span>
            <span class="telemetry-sep">•</span>
            <span class="telemetry-item">
              Extras: <strong class="text-emerald">+{{ calculatedExtrasPerRank }}/R</strong>
            </span>
            <span class="telemetry-sep">•</span>
            <span class="telemetry-item">
              Flaws: <strong class="text-crimson">-{{ calculatedFlawsPerRank }}/R</strong>
            </span>
            <span class="telemetry-sep">•</span>
            <span class="telemetry-item">
              Net Cost: <strong>{{ netEffectCost.totalCost }} PP</strong>
            </span>
          </div>

          <button
            type="button"
            class="btn btn-primary"
            @click="builderStore.closeModifierInspector"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { EXTRAS, FLAWS, calculateEffectCost } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();
const uiStore = useUiStore();

const activeTab = ref('extras');
const searchQuery = ref('');
const activeCategory = ref('all');
const gridRef = ref(null);

// Dynamic categories based on whether Extras or Flaws is active
const categories = computed(() => {
  const list = activeTab.value === 'extras' ? EXTRAS : FLAWS;
  const cats = Array.from(new Set(list.map(m => m.category).filter(Boolean))).sort();
  return ['all', ...cats];
});

// Reset category and scroll position when switching between Extras and Flaws
watch(activeTab, () => {
  activeCategory.value = 'all';
  nextTick(() => {
    if (gridRef.value) gridRef.value.scrollTop = 0;
  });
});

// Reset category, search, and scroll when modal opens
watch(() => builderStore.isModifierInspectorOpen, (isOpen) => {
  if (isOpen) {
    searchQuery.value = '';
    activeCategory.value = 'all';
    nextTick(() => {
      if (gridRef.value) gridRef.value.scrollTop = 0;
    });
  }
});

// Reset scroll when filtering by category or typing search
watch([activeCategory, searchQuery], () => {
  nextTick(() => {
    if (gridRef.value) gridRef.value.scrollTop = 0;
  });
});

function getCategoryIcon(cat) {
  switch (cat) {
    case 'all': return 'ri-apps-line';
    case 'Combat': return 'ri-sword-line';
    case 'Duration & Action': return 'ri-time-line';
    case 'Action & Activation': return 'ri-flashlight-line';
    case 'Range & Area': return 'ri-crosshair-2-line';
    case 'Range & Targeting': return 'ri-focus-3-line';
    case 'Utility': return 'ri-tools-line';
    case 'Sensory': return 'ri-eye-line';
    case 'Limitations': return 'ri-indeterminate-circle-line';
    case 'Device': return 'ri-cpu-line';
    default: return 'ri-price-tag-3-line';
  }
}

const targetEffect = computed(() => {
  return builderStore.targetEffectRef || builderStore.currentEditingEffect;
});

const filteredExtras = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;
  return EXTRAS.filter(m => {
    const matchQ = !q || m.name.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q));
    const matchCat = cat === 'all' || m.category === cat;
    return matchQ && matchCat;
  });
});

const filteredFlaws = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;
  return FLAWS.filter(m => {
    const matchQ = !q || m.name.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q));
    const matchCat = cat === 'all' || m.category === cat;
    return matchQ && matchCat;
  });
});

const currentList = computed(() => {
  return activeTab.value === 'extras' ? filteredExtras.value : filteredFlaws.value;
});

function getCategoryCount(cat) {
  const list = activeTab.value === 'extras' ? EXTRAS : FLAWS;
  if (cat === 'all') return list.length;
  return list.filter(m => m.category === cat).length;
}

function formatCost(mod) {
  if (mod.costDisplay) return mod.costDisplay;
  if (mod.type === 'per_rank') {
    return `${mod.cost >= 0 ? '+' : ''}${mod.cost} / Rank`;
  }
  return `${mod.cost >= 0 ? '+' : ''}${mod.cost} Flat`;
}

function isApplied(name) {
  const t = targetEffect.value;
  if (!t) return false;
  const list = activeTab.value === 'extras' ? t.extras : t.flaws;
  return Array.isArray(list) && list.some(m => (m.name || '').toLowerCase() === name.toLowerCase());
}

function getAppliedInstance(name) {
  const t = targetEffect.value;
  if (!t) return null;
  const list = activeTab.value === 'extras' ? t.extras : t.flaws;
  return (list || []).find(m => (m.name || '').toLowerCase() === name.toLowerCase()) || null;
}

function getAppliedRanks(name) {
  const inst = getAppliedInstance(name);
  return inst ? (Number(inst.ranks) || 1) : 1;
}

function getSelectedOptionId(name) {
  const inst = getAppliedInstance(name);
  return inst?.config?.optionId || inst?.optionId || null;
}

function handleAdd(mod) {
  const isFlaw = activeTab.value === 'flaws';
  builderStore.addModifierToTarget(mod, isFlaw);
  uiStore.showToast(`Applied ${mod.name} to effect!`, 'success');
}

function stepAppliedRank(name, delta) {
  const inst = getAppliedInstance(name);
  if (inst) {
    builderStore.stepModifierRank(inst, delta);
  }
}

function removeApplied(name) {
  const t = targetEffect.value;
  if (!t) return;
  const isFlaw = activeTab.value === 'flaws';
  const list = isFlaw ? t.flaws : t.extras;
  const idx = (list || []).findIndex(m => (m.name || '').toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    builderStore.removeModifierFromTarget(t, isFlaw, idx);
    uiStore.showToast(`Removed ${name}`, 'info');
  }
}

function setModifierOption(mod, opt) {
  let inst = getAppliedInstance(mod.name);
  if (!inst) {
    // If not applied yet, apply it with option
    handleAdd(mod);
    inst = getAppliedInstance(mod.name);
  }
  if (inst) {
    inst.config = inst.config || {};
    inst.config.optionId = opt.id;
    inst.cost = opt.cost;
    inst.type = opt.type;
    uiStore.showToast(`Updated ${mod.name} to: ${opt.label}`, 'info');
  }
}

const calculatedExtrasPerRank = computed(() => {
  let sum = 0;
  for (const e of (targetEffect.value?.extras || [])) {
    if (e.type === 'per_rank') sum += (Number(e.cost) || 0) * (Number(e.ranks) || 1);
  }
  return sum;
});

const calculatedFlawsPerRank = computed(() => {
  let sum = 0;
  for (const f of (targetEffect.value?.flaws || [])) {
    if (f.type === 'per_rank') sum += Math.abs(Number(f.cost) || 0) * (Number(f.ranks) || 1);
  }
  return sum;
});

const netEffectCost = computed(() => {
  if (!targetEffect.value) return { netPerRank: 1, basePointCost: 1, flatTotal: 0, totalCost: 1 };
  return calculateEffectCost(targetEffect.value);
});
</script>

<style scoped>
.modifier-library-dialog {
  max-width: 1180px;
  width: 95%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.modifier-modal-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow: hidden;
}

.mod-top-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.mod-type-tabs {
  display: flex;
  align-items: center;
  background: rgba(10, 10, 15, 0.7);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.2rem;
  gap: 0.35rem;
}

.mod-tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.95rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.mod-tab-btn:active {
  transform: scale(0.96);
}

.mod-tab-btn.extra.active {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.mod-tab-btn.flaw.active {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.35);
  color: #f87171;
}

.mod-tab-count {
  font-size: 0.68rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
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

.mod-category-filters {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.cat-filter-btn {
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
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), box-shadow var(--trans-fast), transform var(--trans-fast);
}

.cat-filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.cat-filter-btn:active {
  transform: scale(0.96);
}

.cat-filter-btn.active.is-extra {
  background: #059669;
  border-color: #10b981;
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
}

.cat-filter-btn.active.is-flaw {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.cat-filter-count {
  font-size: 0.68rem;
  opacity: 0.85;
}

.mod-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.85rem;
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 0.45rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.mod-cards-grid::-webkit-scrollbar {
  width: 6px;
}
.mod-cards-grid::-webkit-scrollbar-track {
  background: transparent;
}
.mod-cards-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}
.mod-cards-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}

.modifier-catalog-card {
  background: rgba(20, 20, 28, 0.65);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), transform var(--trans-fast), box-shadow var(--trans-fast);
}

.modifier-catalog-card:hover {
  background: rgba(25, 25, 35, 0.85);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modifier-catalog-card.card-extra {
  border-left: 3px solid #10b981;
}

.modifier-catalog-card.card-flaw {
  border-left: 3px solid #ef4444;
}

.modifier-catalog-card.is-applied {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.4);
}

.card-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-name-cat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.mod-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
}

.mod-category-badge {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.mod-cost-tag {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

.tag-extra {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.tag-flaw {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.mod-desc-text {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
  flex: 1;
}

.mod-options-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: var(--radius-xs);
}

.options-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.options-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.option-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  cursor: pointer;
}

.option-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.option-chip.active {
  background: #38bdf8;
  color: #000;
  border-color: #38bdf8;
  font-weight: 800;
}

.card-bottom-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.applied-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.badge-applied {
  font-size: 0.74rem;
  font-weight: 800;
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-remove-mod {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-remove-mod:hover {
  background: #ef4444;
  color: #fff;
}

.btn-remove-mod:active {
  transform: scale(0.96);
}

.btn-add-modifier {
  width: 100%;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-add-modifier:active {
  transform: scale(0.97);
}

.btn-add-modifier.btn-extra {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.btn-add-modifier.btn-extra:hover {
  background: #10b981;
  color: #000;
}

.btn-add-modifier.btn-flaw {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.35);
  color: #f87171;
}

.btn-add-modifier.btn-flaw:hover {
  background: #ef4444;
  color: #fff;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--border-subtle);
  background: rgba(10, 10, 15, 0.6);
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.effect-cost-telemetry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.effect-cost-telemetry strong {
  font-variant-numeric: tabular-nums;
}

.telemetry-sep {
  color: var(--text-muted);
}

.text-emerald { color: #34d399; }
.text-crimson { color: #f87171; }
</style>
