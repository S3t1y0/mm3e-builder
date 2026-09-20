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
            <div class="mod-toolbar-left">
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

              <!-- Effect Compatibility Filter Toggle -->
              <button
                type="button"
                class="mod-compat-toggle"
                :class="{ active: filterCompatibleOnly }"
                @click="toggleCompatibilityFilter"
                :title="filterCompatibleOnly ? 'Showing only modifiers compatible with ' + (currentEffectName || 'Effect') + '. Click to show all modifiers.' : 'Showing all modifiers from all effects. Click to filter for ' + (currentEffectName || 'Effect') + '.'"
              >
                <i :class="filterCompatibleOnly ? 'ri-shield-check-line' : 'ri-global-line'"></i>
                <span>{{ filterCompatibleOnly ? (currentEffectName || 'Effect') + ' Only' : 'All Modifiers' }}</span>
                <span class="mod-compat-count">{{ filterCompatibleOnly ? compatibleCount : totalCatalogCount }}</span>
              </button>
            </div>

            <!-- Search input -->
            <div class="palette-search-box mod-search-box">
              <i class="ri-search-line search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search modifiers (e.g., Multiattack, Area, Limited)..."
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
                cat === 'suggested' ? 'is-suggested' : (activeTab === 'extras' ? 'is-extra' : 'is-flaw')
              ]"
              @click="activeCategory = cat"
            >
              <i :class="getCategoryIcon(cat)"></i>
              <span>{{ cat === 'all' ? 'All Categories' : (cat === 'suggested' ? `Suggested (${currentEffectName})` : cat) }}</span>
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
              <div style="margin-bottom: 0.6rem;">
                No modifiers found matching "{{ searchQuery }}"{{ filterCompatibleOnly ? ' for ' + (currentEffectName || 'this effect') : '' }}.
              </div>
              <button
                v-if="filterCompatibleOnly && searchMatchesInOtherEffects > 0"
                type="button"
                class="btn-compat-rescue"
                @click="filterCompatibleOnly = false"
              >
                <i class="ri-search-eye-line"></i>
                Show {{ searchMatchesInOtherEffects }} match{{ searchMatchesInOtherEffects > 1 ? 'es' : '' }} from other effects
              </button>
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
                  <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                    <span class="mod-category-badge">{{ mod.category || 'General' }}</span>
                    <span
                      v-if="mod.appliesTo && mod.appliesTo.length"
                      class="mod-applies-badge"
                      :title="'Designed specifically for: ' + mod.appliesTo.join(', ')"
                    >
                      {{ mod.appliesTo.join(', ') }}
                    </span>
                    <span
                      v-if="!isModCompatible(mod)"
                      class="mod-incompatible-badge"
                      :title="'Effect-specific modifier designed for: ' + mod.appliesTo?.join(', ') + ' (not ' + (currentEffectName || 'current effect') + ')'"
                    >
                      <i class="ri-alert-line"></i> For: {{ mod.appliesTo?.join(', ') }}
                    </span>
                  </div>
                  <strong class="mod-name">{{ mod.name }}</strong>
                </div>
                <span class="mod-cost-tag" :class="activeTab === 'extras' ? 'tag-extra' : 'tag-flaw'">
                  {{ formatCost(mod) }}
                </span>
              </div>

              <!-- Rules Description -->
              <p class="mod-desc-text">{{ mod.desc }}</p>

              <!-- Custom Text Capability Hint -->
              <div v-if="mod.hasCustomText" class="mod-custom-badge-hint">
                <i class="ri-edit-line"></i>
                <span>{{ mod.customTextLabel || 'Custom Player Specification' }}</span>
              </div>

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
                  <div class="applied-left-group">
                    <span class="badge-applied">
                      <i class="ri-checkbox-circle-fill"></i>
                      Applied{{ getAppliedCount(mod.name) > 1 ? ` (${getAppliedCount(mod.name)}x)` : '' }}
                    </span>

                    <button
                      v-if="mod.allowMultiple"
                      type="button"
                      class="btn-add-another-mod"
                      :title="'Add another ' + mod.name + ' instance'"
                      @click="handleAdd(mod)"
                    >
                      <i class="ri-add-line"></i> Another
                    </button>
                  </div>

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
import { EXTRAS, FLAWS, calculateEffectCost, isModifierCompatible } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();
const uiStore = useUiStore();

const activeTab = ref('extras');
const searchQuery = ref('');
const activeCategory = ref('all');
const filterCompatibleOnly = ref(true);
const gridRef = ref(null);

const targetEffect = computed(() => {
  return builderStore.targetEffectRef || builderStore.currentEditingEffect;
});

const currentEffectName = computed(() => {
  const t = targetEffect.value;
  return t?.baseEffect || t?.name || '';
});

function isModCompatible(mod) {
  return isModifierCompatible(mod, currentEffectName.value);
}

function toggleCompatibilityFilter() {
  filterCompatibleOnly.value = !filterCompatibleOnly.value;
  nextTick(() => {
    if (!categories.value.includes(activeCategory.value)) {
      activeCategory.value = 'all';
    }
  });
}

const baseCatalog = computed(() => {
  return activeTab.value === 'extras' ? EXTRAS : FLAWS;
});

const compatibleModifiers = computed(() => {
  return baseCatalog.value.filter(m => isModCompatible(m));
});

const compatibleCount = computed(() => {
  return compatibleModifiers.value.length;
});

const totalCatalogCount = computed(() => {
  return baseCatalog.value.length;
});

const suggestedCount = computed(() => {
  const eff = currentEffectName.value.toLowerCase().trim();
  if (!eff) return 0;
  return baseCatalog.value.filter(m => Array.isArray(m.appliesTo) && m.appliesTo.some(a => a.toLowerCase() === eff)).length;
});

// Dynamic categories based on active tab and whether compatible filter is active
const categories = computed(() => {
  const list = filterCompatibleOnly.value ? compatibleModifiers.value : baseCatalog.value;
  const cats = Array.from(new Set(list.map(m => m.category).filter(Boolean))).sort();
  const res = ['all'];
  if (suggestedCount.value > 0) {
    res.push('suggested');
  }
  return [...res, ...cats];
});

// Reset category and scroll position when switching between Extras and Flaws
watch(activeTab, () => {
  activeCategory.value = 'all';
  nextTick(() => {
    if (gridRef.value) gridRef.value.scrollTop = 0;
  });
});

// Reset category, search, compatibility filter, and scroll when modal opens
watch(() => builderStore.isModifierInspectorOpen, (isOpen) => {
  if (isOpen) {
    searchQuery.value = '';
    filterCompatibleOnly.value = true;
    // Default to suggested category if relevant modifiers exist for this effect!
    activeCategory.value = suggestedCount.value > 0 ? 'suggested' : 'all';
    nextTick(() => {
      if (gridRef.value) gridRef.value.scrollTop = 0;
    });
  }
});

// Reset scroll when filtering by category, compatibility toggle, or typing search
watch([activeCategory, searchQuery, filterCompatibleOnly], () => {
  nextTick(() => {
    if (gridRef.value) gridRef.value.scrollTop = 0;
  });
});

function getCategoryIcon(cat) {
  switch (cat) {
    case 'all': return 'ri-apps-line';
    case 'suggested': return 'ri-magic-line';
    case 'Combat': return 'ri-sword-line';
    case 'Duration & Action': return 'ri-time-line';
    case 'Action & Activation': return 'ri-flashlight-line';
    case 'Range & Area': return 'ri-crosshair-2-line';
    case 'Range & Targeting': return 'ri-focus-3-line';
    case 'Utility': return 'ri-tools-line';
    case 'Sensory': return 'ri-eye-line';
    case 'Sensory & Mental': return 'ri-brain-line';
    case 'Defense & Recovery': return 'ri-heart-pulse-line';
    case 'Minions & Summon': return 'ri-team-line';
    case 'Movement': return 'ri-flight-takeoff-line';
    case 'Limitations': return 'ri-indeterminate-circle-line';
    case 'Device': return 'ri-cpu-line';
    default: return 'ri-price-tag-3-line';
  }
}

const filteredExtras = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;
  const eff = currentEffectName.value.toLowerCase().trim();
  return EXTRAS.filter(m => {
    if (filterCompatibleOnly.value && !isModifierCompatible(m, eff)) {
      return false;
    }
    const matchQ = !q || m.name.toLowerCase().includes(q) || 
      (m.desc && m.desc.toLowerCase().includes(q)) ||
      (Array.isArray(m.appliesTo) && m.appliesTo.some(a => a.toLowerCase().includes(q)));
    let matchCat = false;
    if (cat === 'all') {
      matchCat = true;
    } else if (cat === 'suggested') {
      matchCat = Array.isArray(m.appliesTo) && m.appliesTo.some(a => a.toLowerCase() === eff);
    } else {
      matchCat = m.category === cat;
    }
    return matchQ && matchCat;
  });
});

const filteredFlaws = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const cat = activeCategory.value;
  const eff = currentEffectName.value.toLowerCase().trim();
  return FLAWS.filter(m => {
    if (filterCompatibleOnly.value && !isModifierCompatible(m, eff)) {
      return false;
    }
    const matchQ = !q || m.name.toLowerCase().includes(q) || 
      (m.desc && m.desc.toLowerCase().includes(q)) ||
      (Array.isArray(m.appliesTo) && m.appliesTo.some(a => a.toLowerCase().includes(q)));
    let matchCat = false;
    if (cat === 'all') {
      matchCat = true;
    } else if (cat === 'suggested') {
      matchCat = Array.isArray(m.appliesTo) && m.appliesTo.some(a => a.toLowerCase() === eff);
    } else {
      matchCat = m.category === cat;
    }
    return matchQ && matchCat;
  });
});

const currentList = computed(() => {
  return activeTab.value === 'extras' ? filteredExtras.value : filteredFlaws.value;
});

const searchMatchesInOtherEffects = computed(() => {
  if (!searchQuery.value || !filterCompatibleOnly.value) return 0;
  const q = searchQuery.value.toLowerCase().trim();
  return baseCatalog.value.filter(m => {
    if (isModCompatible(m)) return false;
    return m.name.toLowerCase().includes(q) || 
      (m.desc && m.desc.toLowerCase().includes(q)) ||
      (Array.isArray(m.appliesTo) && m.appliesTo.some(a => a.toLowerCase().includes(q)));
  }).length;
});

function getCategoryCount(cat) {
  if (cat === 'suggested') return suggestedCount.value;
  const list = filterCompatibleOnly.value ? compatibleModifiers.value : baseCatalog.value;
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

function getAppliedCount(name) {
  const t = targetEffect.value;
  if (!t) return 0;
  const list = activeTab.value === 'extras' ? t.extras : t.flaws;
  return (list || []).filter(m => (m.name || '').toLowerCase() === name.toLowerCase()).length;
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
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.mod-toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.mod-search-box {
  flex: 1 1 240px;
  min-width: 0;
  max-width: 380px;
}

.mod-search-box input {
  width: 100%;
  min-width: 0;
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

.mod-compat-toggle {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast), box-shadow var(--trans-fast);
}

.mod-compat-toggle:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.22);
}

.mod-compat-toggle:active {
  transform: scale(0.96);
}

.mod-compat-toggle.active {
  background: rgba(14, 165, 233, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
}

.mod-compat-count {
  font-size: 0.68rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.1rem 0.42rem;
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0.2rem 0;
  flex-shrink: 0;
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

.cat-filter-btn.active.is-extra,
.cat-filter-btn.active.is-flaw {
  background: var(--accent-primary);
  border-color: var(--accent-primary-hover);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 111, 184, 0.35);
}

.cat-filter-btn.is-suggested {
  background: rgba(147, 51, 234, 0.12);
  border-color: rgba(168, 85, 247, 0.35);
  color: #c084fc;
}

.cat-filter-btn.is-suggested:hover {
  background: rgba(147, 51, 234, 0.22);
  border-color: rgba(168, 85, 247, 0.55);
  color: #ffffff;
}

.cat-filter-btn.active.is-suggested {
  background: #9333ea;
  border-color: #a855f7;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4);
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

.mod-applies-badge {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.08rem 0.38rem;
  border-radius: var(--radius-xs);
  background: rgba(147, 51, 234, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
  letter-spacing: 0.02em;
}

.mod-incompatible-badge {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.08rem 0.38rem;
  border-radius: var(--radius-xs);
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.38);
  color: #fbbf24;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-compat-rescue {
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-compat-rescue:hover {
  background: rgba(14, 165, 233, 0.25);
  border-color: rgba(56, 189, 248, 0.6);
  color: #ffffff;
}

.btn-compat-rescue:active {
  transform: scale(0.97);
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
  color: #09090b;
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
  gap: 0.5rem;
}

.applied-left-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-add-another-mod {
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(42, 143, 214, 0.4);
  color: #60a5fa;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  transition: background-color var(--trans-fast), color var(--trans-fast), border-color var(--trans-fast);
}

.btn-add-another-mod:hover {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}

.mod-custom-badge-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.1);
  border: 1px dashed rgba(59, 130, 246, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-xs);
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

.btn-add-modifier.btn-extra,
.btn-add-modifier.btn-flaw {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary-hover);
  color: #fff;
}

.btn-add-modifier.btn-extra:hover,
.btn-add-modifier.btn-flaw:hover {
  background: var(--accent-primary-hover);
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

@media (max-width: 860px) {
  .mod-top-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.6rem;
  }
  .mod-toolbar-left {
    width: 100%;
    justify-content: space-between;
  }
  .mod-search-box {
    max-width: 100%;
    width: 100%;
  }
  .mod-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .mod-toolbar-left {
    flex-direction: column;
    align-items: stretch;
  }
  .mod-type-tabs {
    width: 100%;
    justify-content: center;
  }
  .mod-compat-toggle {
    width: 100%;
    justify-content: center;
  }
}
</style>

