<template>
  <transition name="fade">
    <div
      v-if="uiStore.modals.conditions"
      class="modal-overlay open"
      @click.self="uiStore.closeModal('conditions')"
    >
      <div class="modal-dialog modal-lg condition-picker-dialog">
        <!-- MODAL HEADER -->
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="icon"><i class="ri-heart-pulse-fill"></i></span>
            <div>
              <h3>Apply Combat Conditions</h3>
              <p class="modal-subtitle">Mutants &amp; Masterminds 3e Status Effects &amp; Tactical Penalties</p>
            </div>
          </div>
          <div class="modal-header-actions">
            <span v-if="activeCount > 0" class="badge badge-warning">
              {{ activeCount }} Active
            </span>
            <button
              type="button"
              class="modal-close-btn"
              @click="uiStore.closeModal('conditions')"
              title="Close Condition Picker"
              aria-label="Close"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>

        <!-- MODAL BODY -->
        <div class="modal-body condition-picker-body">
          <!-- SEARCH & FILTER TOOLBAR -->
          <div class="cond-filter-toolbar">
            <div class="cond-search-box flex-1">
              <span class="search-icon"><i class="ri-search-line"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                class="cond-search-input"
                placeholder="Search conditions... (e.g., Dazed, Vulnerable, Stunned, Blind, Prone)"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="clear-search-btn"
                @click="searchQuery = ''"
                title="Clear search"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <!-- TABS: ALL / BASIC / COMBINED -->
            <div class="cond-type-tabs">
              <button
                type="button"
                class="cond-tab-btn"
                :class="{ active: filterTab === 'all' }"
                @click="filterTab = 'all'"
              >
                All ({{ allConditions.length }})
              </button>
              <button
                type="button"
                class="cond-tab-btn"
                :class="{ active: filterTab === 'basic' }"
                @click="filterTab = 'basic'"
              >
                Basic ({{ BASIC_CONDITIONS.length }})
              </button>
              <button
                type="button"
                class="cond-tab-btn"
                :class="{ active: filterTab === 'combined' }"
                @click="filterTab = 'combined'"
              >
                Combined ({{ COMBINED_CONDITIONS.length }})
              </button>
            </div>
          </div>

          <!-- CONDITIONS GRID -->
          <div class="cond-cards-grid">
            <div
              v-for="cond in filteredConditions"
              :key="cond.name"
              class="cond-select-card"
              :class="{
                active: isDirectlyActive(cond.name),
                'active-inherited': isInheritedActive(cond.name),
                'is-severe': cond.isSevere
              }"
              @click="handleToggle(cond.name)"
            >
              <div class="cond-card-top">
                <div class="cond-card-title-col">
                  <div class="cond-card-name-row">
                    <span class="cond-card-checkbox">
                      <i v-if="isDirectlyActive(cond.name)" class="ri-checkbox-circle-fill"></i>
                      <i v-else-if="isInheritedActive(cond.name)" class="ri-indeterminate-circle-line"></i>
                      <i v-else class="ri-checkbox-blank-circle-line"></i>
                    </span>
                    <strong class="cond-card-name">{{ cond.name }}</strong>
                    <span v-if="cond.isCombined" class="cond-badge combined">Combined</span>
                    <span v-else class="cond-badge basic">Basic</span>
                  </div>

                  <span v-if="cond.briefEffect" class="cond-brief-tag">
                    {{ cond.briefEffect }}
                  </span>
                </div>

                <div class="cond-card-status">
                  <span v-if="isDirectlyActive(cond.name)" class="cond-active-label direct">Active</span>
                  <span v-else-if="isInheritedActive(cond.name)" class="cond-active-label inherited">Inherited</span>
                </div>
              </div>

              <!-- Combined Components Callout -->
              <div v-if="cond.components && cond.components.length" class="cond-components-row">
                <span class="components-label">Components:</span>
                <span
                  v-for="comp in cond.components"
                  :key="comp"
                  class="comp-pill"
                >
                  {{ comp }}
                </span>
              </div>

              <p class="cond-card-desc">{{ cond.desc }}</p>

              <!-- Interactive Ability Selector for Debilitated -->
              <div v-if="cond.name === 'Debilitated'" class="modal-deb-box mt-2" @click.stop>
                <div class="modal-deb-head">
                  <div class="modal-deb-title-wrap">
                    <i class="ri-pulse-line modal-deb-icon"></i>
                    <span class="modal-deb-title">Debilitated Abilities</span>
                  </div>
                  <span v-if="heroStore.debilitatedAbilities.length > 0" class="deb-count-pill">
                    {{ heroStore.debilitatedAbilities.length }} Active
                  </span>
                  <span v-else class="deb-hint-pill">Trait &lt; -5</span>
                </div>

                <div class="modal-deb-pills-grid">
                  <button
                    v-for="code in ABILITY_CODES"
                    :key="code"
                    type="button"
                    class="mdeb-pill-btn"
                    :class="{
                      'is-active': heroStore.isDebilitated(code),
                      'is-absent': heroStore.isAbilityAbsent(code)
                    }"
                    :disabled="heroStore.isAbilityAbsent(code)"
                    :title="heroStore.isAbilityAbsent(code) ? `${code} is Absent (immune to Weaken)` : getDebilitatedDesc(code)"
                    @click="heroStore.toggleDebilitatedAbility(code)"
                    @mouseenter="hoveredAbility = code"
                    @mouseleave="hoveredAbility = null"
                  >
                    <span class="mdeb-code">{{ code }}</span>
                    <span class="mdeb-brief">{{ getShortLabel(code) }}</span>
                  </button>
                </div>

                <!-- Live Dynamic Status / Helper Strip -->
                <div class="modal-deb-status-strip" :class="activeDebilitatedSummary.type">
                  <i :class="activeDebilitatedSummary.icon"></i>
                  <span class="status-strip-text">{{ activeDebilitatedSummary.text }}</span>
                </div>
              </div>
            </div>

            <!-- Empty Search Results -->
            <div v-if="filteredConditions.length === 0" class="cond-empty-results">
              <i class="ri-search-line empty-icon"></i>
              <p>No conditions match "{{ searchQuery }}".</p>
            </div>
          </div>
        </div>

        <!-- MODAL FOOTER -->
        <div class="modal-footer condition-picker-footer">
          <div class="footer-left">
            <button
              v-if="activeCount > 0"
              type="button"
              class="btn btn-secondary btn-sm text-danger"
              @click="heroStore.clearConditions()"
            >
              <i class="ri-restart-line"></i> Clear All Conditions
            </button>
          </div>
          <div class="footer-right">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="uiStore.closeModal('conditions')"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import {
  BASIC_CONDITIONS,
  COMBINED_CONDITIONS,
  DEBILITATED_EFFECTS,
  getConditionBriefEffect,
  isConditionSevere
} from '../../rules/conditions.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const ABILITY_CODES = ['STR', 'STA', 'AGL', 'DEX', 'FGT', 'INT', 'AWE', 'PRE'];

const searchQuery = ref('');
const filterTab = ref('all'); // 'all' | 'basic' | 'combined'

const allConditions = computed(() => {
  const basics = BASIC_CONDITIONS.map(c => ({
    ...c,
    isCombined: false,
    briefEffect: getConditionBriefEffect(c.name),
    isSevere: isConditionSevere(c.name)
  }));
  const combined = COMBINED_CONDITIONS.map(c => ({
    ...c,
    isCombined: true,
    briefEffect: getConditionBriefEffect(c.name),
    isSevere: isConditionSevere(c.name)
  }));
  return [...basics, ...combined];
});

const activeCount = computed(() => {
  return (heroStore.character.activeConditions || []).length;
});

function isDirectlyActive(name) {
  if (name === 'Debilitated') {
    return (heroStore.character.activeConditions || []).includes('Debilitated') || heroStore.debilitatedAbilities.length > 0;
  }
  return (heroStore.character.activeConditions || []).includes(name);
}

function isInheritedActive(name) {
  if (isDirectlyActive(name)) return false;
  return heroStore.activeConditionSet.has(name);
}

const hoveredAbility = ref(null);

function getShortLabel(code) {
  const map = {
    STR: 'Collapsed',
    STA: 'Dying',
    AGL: 'Collapsed',
    DEX: 'Collapsed',
    FGT: 'Dazed',
    INT: 'Unaware',
    AWE: 'Unaware',
    PRE: 'Unaware'
  };
  return map[code] || 'Trait < -5';
}

const activeDebilitatedSummary = computed(() => {
  if (hoveredAbility.value) {
    const code = hoveredAbility.value;
    const info = DEBILITATED_EFFECTS[code];
    return {
      text: `${code} (${info?.name || code}): ${info?.desc || ''}`,
      icon: 'ri-information-line',
      type: 'info'
    };
  }

  const active = heroStore.debilitatedAbilities || [];
  if (active.length === 0) {
    return {
      text: 'Click any ability above to apply Debilitated status (< -5).',
      icon: 'ri-cursor-line',
      type: 'muted'
    };
  }

  const parts = active.map(code => {
    const brief = DEBILITATED_EFFECTS[code]?.brief || 'Trait < -5';
    return `${code} (${brief})`;
  });

  return {
    text: `Active: ${parts.join(' • ')}`,
    icon: 'ri-alert-fill',
    type: 'danger'
  };
});

function handleToggle(name) {
  if (name === 'Debilitated' && heroStore.debilitatedAbilities.length > 0) {
    for (const code of [...heroStore.debilitatedAbilities]) {
      heroStore.toggleDebilitatedAbility(code);
    }
    return;
  }
  heroStore.toggleCondition(name);
}

function getDebilitatedDesc(code) {
  return DEBILITATED_EFFECTS[code]?.desc || 'Trait reduced below -5';
}

function getDebilitatedBrief(code) {
  return DEBILITATED_EFFECTS[code]?.brief || '';
}

const filteredConditions = computed(() => {
  let list = allConditions.value;
  if (filterTab.value === 'basic') {
    list = list.filter(c => !c.isCombined);
  } else if (filterTab.value === 'combined') {
    list = list.filter(c => c.isCombined);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;

  return list.filter(c => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.briefEffect && c.briefEffect.toLowerCase().includes(q)) return true;
    if (c.desc && c.desc.toLowerCase().includes(q)) return true;
    if (c.components && c.components.some(comp => comp.toLowerCase().includes(q))) return true;
    return false;
  });
});
</script>

<style scoped>
.condition-picker-dialog {
  max-width: 860px;
  width: 95%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.condition-picker-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.15rem 1.35rem;
  overflow: hidden;
}

.cond-filter-toolbar {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.cond-search-box {
  display: flex;
  align-items: center;
  background: var(--bg-input, #0b1122);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.65rem;
  gap: 0.45rem;
  transition: border-color var(--trans-fast);
}

.cond-search-box:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 111, 184, 0.25);
}

.cond-search-box .search-icon {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.cond-search-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.82rem;
  width: 100%;
  font-family: inherit;
  outline: none;
}

.cond-search-input:focus-visible {
  outline: 2px solid var(--accent-secondary);
  outline-offset: 2px;
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

.cond-type-tabs {
  display: flex;
  align-items: center;
  background: rgba(11, 17, 34, 0.7);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.2rem;
  gap: 0.25rem;
}

.cond-tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--trans-fast);
  white-space: nowrap;
}

.cond-tab-btn:hover {
  color: #fff;
}

.cond-tab-btn.active {
  background: var(--accent-primary);
  color: #fff;
}

/* CARDS GRID */
.cond-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 0.75rem;
  max-height: 54vh;
  overflow-y: auto;
  padding-right: 0.4rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.cond-select-card {
  background: var(--bg-card, #0f172a);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: all var(--trans-fast);
  user-select: none;
  position: relative;
}

.cond-select-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(0, 111, 184, 0.4);
  transform: translateY(-1px);
}

.cond-select-card.active {
  background: rgba(244, 63, 94, 0.08);
  border-color: #f43f5e;
  box-shadow: var(--shadow-sm);
}

.cond-select-card.active.is-severe {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  box-shadow: var(--shadow-sm);
}

.cond-select-card.active-inherited {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.4);
}

.cond-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.cond-card-title-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cond-card-name-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.cond-card-checkbox {
  font-size: 1.15rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.cond-select-card.active .cond-card-checkbox {
  color: #f43f5e;
}

.cond-select-card.active.is-severe .cond-card-checkbox {
  color: #ef4444;
}

.cond-select-card.active-inherited .cond-card-checkbox {
  color: #fbbf24;
}

.cond-card-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
}

.cond-badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  letter-spacing: 0.04em;
}

.cond-badge.basic {
  background: rgba(0, 111, 184, 0.15);
  border: 1px solid rgba(0, 111, 184, 0.35);
  color: #60a5fa;
}

.cond-badge.combined {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: #c4b5fd;
}

.cond-brief-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #cbd5e1;
  font-family: var(--font-mono);
}

.cond-card-status {
  flex-shrink: 0;
}

.cond-active-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-pill);
  letter-spacing: 0.04em;
}

.cond-active-label.direct {
  background: #ef4444;
  color: #fff;
}

.cond-active-label.inherited {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.cond-components-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  font-size: 0.7rem;
}

.components-label {
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 600;
}

.comp-pill {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  color: var(--text-secondary);
  font-size: 0.68rem;
}

.cond-card-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.cond-empty-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.condition-picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.35rem;
  border-top: 1px solid var(--border-color);
  background: rgba(11, 17, 34, 0.6);
}

/* Debilitated Selection Box inside Modal Card */
.modal-deb-box {
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm, 6px);
  padding: 0.65rem 0.75rem;
  margin-top: 0.65rem;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.modal-deb-box:hover {
  border-color: rgba(239, 68, 68, 0.25);
}

.modal-deb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.modal-deb-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.modal-deb-icon {
  color: #ef4444;
  font-size: 0.85rem;
}

.modal-deb-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.deb-count-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #fca5a5;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.deb-hint-pill {
  font-size: 0.64rem;
  font-weight: 600;
  color: #64748b;
  font-family: var(--font-mono, monospace);
}

.modal-deb-pills-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
  width: 100%;
  box-sizing: border-box;
}

.mdeb-pill-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.2rem;
  min-width: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.mdeb-pill-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.mdeb-pill-btn.is-active {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(185, 28, 28, 0.32));
  border-color: #ef4444;
  box-shadow: var(--shadow-sm);
}

.mdeb-pill-btn.is-absent {
  opacity: 0.3;
  cursor: not-allowed;
  border-style: dashed;
  background: rgba(0, 0, 0, 0.25);
}

.mdeb-code {
  font-size: 0.78rem;
  font-weight: 800;
  color: #f1f5f9;
  line-height: 1.1;
}

.mdeb-pill-btn.is-active .mdeb-code {
  color: #fff;
  font-weight: 900;
}

.mdeb-pill-btn.is-absent .mdeb-code {
  text-decoration: line-through;
  color: #64748b;
}

.mdeb-brief {
  font-size: 0.6rem;
  font-weight: 600;
  color: #94a3b8;
  line-height: 1.1;
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.mdeb-pill-btn.is-active .mdeb-brief {
  color: #fca5a5;
}

.mdeb-pill-btn.is-absent .mdeb-brief {
  color: #64748b;
}

/* Live Status Strip */
.modal-deb-status-strip {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
  padding: 0.35rem 0.55rem;
  border-radius: 4px;
  font-size: 0.68rem;
  line-height: 1.35;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.modal-deb-status-strip.muted {
  color: #64748b;
}

.modal-deb-status-strip.muted i {
  color: #64748b;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.modal-deb-status-strip.info {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.25);
  color: #bae6fd;
}

.modal-deb-status-strip.info i {
  color: #38bdf8;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.modal-deb-status-strip.danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.modal-deb-status-strip.danger i {
  color: #ef4444;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.status-strip-text {
  flex: 1;
  white-space: normal;
  word-break: break-word;
}
</style>
