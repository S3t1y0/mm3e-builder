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
  getConditionBriefEffect,
  isConditionSevere
} from '../../rules/conditions.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

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
  return (heroStore.character.activeConditions || []).includes(name);
}

function isInheritedActive(name) {
  if (isDirectlyActive(name)) return false;
  return heroStore.activeConditionSet.has(name);
}

function handleToggle(name) {
  heroStore.toggleCondition(name);
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
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.15);
}

.cond-select-card.active.is-severe {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.22);
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
</style>
