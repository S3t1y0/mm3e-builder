<template>
  <div class="sheet-card powers-deck-section">
    <div class="card-header-row">
      <div class="card-title-group">
        <i class="ri-flashlight-line icon-primary"></i>
        <h3>Powers & Devices Deck</h3>
      </div>

      <div class="header-right-actions">
        <button
          v-if="heroStore.character.powers.length > 0"
          type="button"
          class="btn-expand-all"
          :title="isAllExpanded ? 'Collapse All Powers' : 'Expand All Powers'"
          @click="toggleExpandAll"
        >
          <i :class="isAllExpanded ? 'ri-contract-up-down-line' : 'ri-expand-up-down-line'"></i>
          <span>{{ isAllExpanded ? 'Collapse All' : 'Expand All' }}</span>
        </button>

        <button
          v-if="heroStore.character.powers.length > 0"
          type="button"
          class="btn-toggle-all-powers"
          :class="{ 'all-active': isAnyPowerActive, 'all-off': !isAnyPowerActive }"
          :title="isAnyPowerActive ? 'Deactivate all powers' : 'Activate all powers'"
          @click="handleToggleAllPowers"
        >
          <i :class="isAnyPowerActive ? 'ri-toggle-fill' : 'ri-toggle-line'"></i>
          <span>{{ isAnyPowerActive ? 'Disable All' : 'Enable All' }}</span>
        </button>

        <div class="create-power-btn-group">
          <button type="button" class="btn-create-p" @click="handleCreatePower('standard')">
            <i class="ri-flashlight-line"></i> + Standard
          </button>
          <button type="button" class="btn-create-p compound" @click="handleCreatePower('compound')">
            <i class="ri-stack-line"></i> + Compound
          </button>
          <button type="button" class="btn-create-p dev" @click="handleCreatePower('device')">
            <i class="ri-shield-keyhole-line"></i> + Device
          </button>
        </div>
        <span class="header-total-badge">{{ heroStore.totalPowerPP }} PP Total</span>
      </div>
    </div>

    <!-- Empty Powers Hint -->
    <div v-if="heroStore.character.powers.length === 0" class="empty-powers-box">
      <i class="ri-flashlight-line"></i>
      <p>No powers added yet. Select + Standard, + Compound, or + Device to open Power Studio.</p>
    </div>

    <!-- Powers Cards List -->
    <div v-else class="powers-cards-deck">
      <PowerCard
        v-for="(pow, idx) in heroStore.character.powers"
        :key="pow.id || idx"
        :pow="pow"
        :idx="idx"
        :is-expanded="isExpanded(pow.id || idx)"
        @toggle-expand="toggleExpand(pow.id || idx)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import PowerCard from './powers/PowerCard.vue';

const heroStore = useHeroStore();
const builderStore = usePowerBuilderStore();

const expandedPowers = ref(new Set());

function isExpanded(id) {
  return expandedPowers.value.has(id);
}

function toggleExpand(id) {
  if (expandedPowers.value.has(id)) {
    expandedPowers.value.delete(id);
  } else {
    expandedPowers.value.add(id);
  }
}

const isAllExpanded = computed(() => {
  const list = heroStore.character.powers || [];
  if (list.length === 0) return false;
  return list.every((p, i) => expandedPowers.value.has(p.id || i));
});

function toggleExpandAll() {
  const list = heroStore.character.powers || [];
  if (isAllExpanded.value) {
    expandedPowers.value.clear();
  } else {
    list.forEach((p, i) => expandedPowers.value.add(p.id || i));
  }
}

const isAnyPowerActive = computed(() => {
  return (heroStore.character.powers || []).some(p => p.active !== false);
});

function handleToggleAllPowers() {
  const target = !isAnyPowerActive.value;
  (heroStore.character.powers || []).forEach(p => {
    p.active = target;
  });
  heroStore.saveToStorage();
}

function handleCreatePower(type) {
  builderStore.openNewPower(type);
}
</script>

<style scoped>
.powers-deck-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card-title-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.55rem;
}

.icon-primary {
  font-size: 1.25rem;
  color: #a855f7;
}

.card-title-group h3 {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
}

.cost-tag-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  background: rgba(168, 85, 247, 0.15);
  color: #ddd6fe;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.btn-expand-all {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.28rem 0.6rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: color var(--trans-fast), background-color var(--trans-fast), border-color var(--trans-fast);
}

.btn-expand-all:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-expand-all:active {
  transform: scale(0.96);
}

.btn-toggle-all-powers {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.28rem 0.65rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: color var(--trans-fast), background-color var(--trans-fast), border-color var(--trans-fast), transform var(--trans-fast);
}

.btn-toggle-all-powers:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-toggle-all-powers:active {
  transform: scale(0.96);
}

.btn-toggle-all-powers.all-active {
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.08);
}

.btn-toggle-all-powers.all-active:hover {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
}

.btn-toggle-all-powers.all-off {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
}

.btn-toggle-all-powers.all-off:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.create-power-btn-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-create-p {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-create-p:hover {
  background: var(--accent-primary);
  color: #fff;
}

.btn-create-p.dev:hover {
  background: #f59e0b;
  color: #fff;
}

.btn-create-p.compound:hover {
  background: #0ea5e9;
  color: #fff;
}

.btn-create-p.arr:hover {
  background: #8b5cf6;
  color: #fff;
}

.btn-create-p:active {
  transform: scale(0.96);
}

.header-total-badge {
  font-size: 0.78rem;
  font-weight: 800;
  color: #60a5fa;
  background: rgba(0, 111, 184, 0.12);
  border: 1px solid rgba(0, 111, 184, 0.3);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
}

.empty-powers-box {
  padding: 2.5rem;
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-powers-box i {
  font-size: 2.2rem;
}

.powers-cards-deck {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

</style>
