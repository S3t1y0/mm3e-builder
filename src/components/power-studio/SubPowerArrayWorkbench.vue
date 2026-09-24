<template>
  <div class="sub-power-array-workbench">
    <!-- Header of Array Workbench -->
    <div class="array-workbench-header">
      <div class="header-left">
        <div class="array-icon-pill">
          <i class="ri-shuffle-line"></i>
        </div>
        <div class="array-header-titles">
          <span class="workbench-badge">Device Sub-Power Array</span>
          <h5 class="workbench-sub-title">Alternate Configurations for {{ subPower.name || 'Sub-Power' }}</h5>
        </div>
      </div>

      <div class="header-right">
        <button
          type="button"
          class="btn-add-slot-accent"
          @click="builderStore.addArraySlot(true, '', 'Blast')"
        >
          <i class="ri-add-line"></i>
          <span>Add Alternate Slot</span>
        </button>
      </div>
    </div>

    <!-- Collapsible Rules Guide -->
    <details class="array-rules-collapsible" open>
      <summary class="array-rules-summary">
        <i class="ri-information-line"></i>
        <span>M&M 3e Array Rules: Capacity & Costs</span>
        <span class="rules-summary-toggle">View Guidelines</span>
      </summary>
      <div class="array-rules-content">
        <p>
          In Mutants & Masterminds 3e, an <strong>Array</strong> has a point capacity determined by its most expensive primary effect (<strong>{{ arrayCapacity }} PP</strong>).
        </p>
        <ul>
          <li><strong>Standard Slot</strong> (+1 flat PP): Alternate effects swapped as a free action (mutually exclusive).</li>
          <li><strong>Dynamic Slot</strong> (+2 flat PP): Alternate effects that can simultaneously share points from the pool.</li>
          <li>The internal cost of any alternate effect cannot exceed the primary effect's capacity ({{ arrayCapacity }} PP).</li>
        </ul>
      </div>
    </details>

    <!-- Headroom & Capacity Dashboard -->
    <div class="array-budget-dashboard">
      <div class="budget-dashboard-header">
        <span class="budget-primary-stat">
          Array Capacity: <strong>{{ arrayCapacity }} PP</strong>
        </span>
        <span
          class="headroom-stat-badge"
          :class="isCapacityOverflow ? 'overflow' : 'ok'"
        >
          <i :class="isCapacityOverflow ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
          <span>{{ isCapacityOverflow ? 'Capacity Exceeded!' : `Headroom: ${headroom} PP Safe` }}</span>
        </span>
      </div>

      <!-- Capacity Progress Bar -->
      <div class="capacity-meter-track">
        <div
          class="capacity-meter-fill"
          :class="{ overflow: isCapacityOverflow }"
          :style="{ width: `${capacityPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Slots Management List -->
    <div class="alternate-slots-deck">
      <!-- Primary Slot Item Card -->
      <div
        class="slot-card primary-slot"
        :class="{ active: builderStore.activeTargetType === 'main' }"
        @click="builderStore.selectMainForEditing()"
      >
        <div class="slot-left-meta">
          <span class="slot-type-badge primary">Primary Effect</span>
          <span class="slot-name-label">{{ subPower.effect?.name || subPower.effect?.baseEffect || 'Primary Effect' }}</span>
        </div>

        <div class="slot-right-meta">
          <span class="slot-cost-pill">{{ arrayCapacity }} PP Capacity</span>
          <button
            type="button"
            class="btn-edit-slot"
            :class="{ active: builderStore.activeTargetType === 'main' }"
            @click.stop="builderStore.selectMainForEditing()"
          >
            <i class="ri-edit-line"></i>
            <span>{{ builderStore.activeTargetType === 'main' ? 'Editing Canvas' : 'Edit' }}</span>
          </button>
        </div>
      </div>

      <!-- Alternate Slot Cards -->
      <div
        v-for="(slot, idx) in subPower.alternateEffects"
        :key="slot.id"
        class="slot-card"
        :class="{
          active: builderStore.activeTargetType === 'slot' && builderStore.activeSlotIndex === idx,
          dynamic: slot.isDynamic
        }"
      >
        <div class="slot-left-meta">
          <div class="slot-edit-name-box">
            <input
              v-model="slot.name"
              type="text"
              class="slot-name-inline-input"
              placeholder="Slot Name..."
              @click.stop
            />
          </div>

          <div class="slot-sub-info">
            <span class="slot-base-desc">{{ slot.effect?.baseEffect || 'Damage' }} (Rank {{ slot.effect?.ranks || 1 }})</span>
            <span class="slot-raw-cost">{{ getSlotEffectCost(slot) }} PP internal</span>
          </div>
        </div>

        <div class="slot-right-meta">
          <!-- Standard vs Dynamic Pill -->
          <div class="slot-dynamic-toggle" @click.stop>
            <button
              type="button"
              class="dyn-btn"
              :class="{ active: !slot.isDynamic }"
              @click="slot.isDynamic = false"
            >Standard (1 PP)</button>
            <button
              type="button"
              class="dyn-btn dyn"
              :class="{ active: slot.isDynamic }"
              @click="slot.isDynamic = true"
            >Dynamic (2 PP)</button>
          </div>

          <!-- Edit Canvas Button -->
          <button
            type="button"
            class="btn-edit-slot"
            :class="{ active: builderStore.activeTargetType === 'slot' && builderStore.activeSlotIndex === idx }"
            @click.stop="builderStore.selectSlotForEditing(true, idx)"
          >
            <i class="ri-edit-line"></i>
            <span>{{ builderStore.activeTargetType === 'slot' && builderStore.activeSlotIndex === idx ? 'Editing' : 'Configure' }}</span>
          </button>

          <!-- Delete Slot Button -->
          <button
            type="button"
            class="btn-del-slot"
            title="Delete Alternate Slot"
            @click.stop="builderStore.removeArraySlot(true, idx)"
          >
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { calculateEffectCost } from '../../rules/powerEngine.js';

const props = defineProps({
  subPower: {
    type: Object,
    required: true
  },
  subIndex: {
    type: Number,
    required: true
  }
});

const builderStore = usePowerBuilderStore();

const arrayCapacity = computed(() => {
  if (!props.subPower.effect) return 1;
  return calculateEffectCost(props.subPower.effect, 0).totalCost;
});

function getSlotEffectCost(slot) {
  if (!slot?.effect) return 0;
  return calculateEffectCost(slot.effect, 0).totalCost;
}

const highestSlotCost = computed(() => {
  const alts = props.subPower.alternateEffects || [];
  return alts.reduce((max, s) => Math.max(max, getSlotEffectCost(s)), 0);
});

const isCapacityOverflow = computed(() => {
  return highestSlotCost.value > arrayCapacity.value;
});

const headroom = computed(() => {
  return Math.max(0, arrayCapacity.value - highestSlotCost.value);
});

const capacityPercent = computed(() => {
  if (arrayCapacity.value <= 0) return 0;
  const pct = Math.round((highestSlotCost.value / arrayCapacity.value) * 100);
  return Math.min(100, pct);
});
</script>

<style scoped>
.sub-power-array-workbench {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.array-workbench-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.array-icon-pill {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.array-header-titles {
  display: flex;
  flex-direction: column;
}

.workbench-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #c084fc;
  letter-spacing: var(--letter-spacing-caps);
}

.workbench-sub-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.btn-add-slot-accent {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #e9d5ff;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-add-slot-accent:hover {
  background: #a855f7;
  color: #fff;
}

/* Collapsible Details */
.array-rules-collapsible {
  background: rgba(168, 85, 247, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.array-rules-summary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: #c4b5fd;
  cursor: pointer;
}

.rules-summary-toggle {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.array-rules-content {
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  border-top: 1px dashed rgba(168, 85, 247, 0.2);
  line-height: 1.45;
}

.array-rules-content ul {
  padding-left: 1.2rem;
  margin: 0.35rem 0 0;
}

/* Dashboard */
.array-budget-dashboard {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.budget-dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.budget-primary-stat {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.budget-primary-stat strong {
  color: #fff;
}

.headroom-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
}

.headroom-stat-badge.ok {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.headroom-stat-badge.overflow {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.capacity-meter-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.capacity-meter-fill {
  height: 100%;
  background: #a855f7;
  transition: width 0.3s ease;
}

.capacity-meter-fill.overflow {
  background: #ef4444;
}

/* Deck of Slots */
.alternate-slots-deck {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.slot-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.85rem;
  transition: all var(--trans-fast);
}

.slot-card:hover {
  border-color: var(--border-color);
}

.slot-card.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.08);
}

.slot-card.primary-slot {
  border-left: 3px solid #38bdf8;
}

.slot-left-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.slot-type-badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: #38bdf8;
}

.slot-name-label {
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--text-primary);
}

.slot-name-inline-input {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-primary);
  font-size: 0.84rem;
  font-weight: 800;
  padding: 0.15rem 0.35rem;
  border-radius: var(--radius-xs);
  outline: none;
  font-family: inherit;
  transition: all var(--trans-fast);
  max-width: 250px;
}

.slot-name-inline-input:hover,
.slot-name-inline-input:focus {
  background: var(--bg-surface);
  border-color: var(--border-color);
}

.slot-sub-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.slot-right-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.slot-cost-pill {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.slot-dynamic-toggle {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 2px;
}

.dyn-btn {
  background: transparent;
  border: none;
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text-muted);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.dyn-btn.active {
  background: var(--accent-primary);
  color: #fff;
}

.dyn-btn.dyn.active {
  background: #a855f7;
  color: #fff;
}

.btn-edit-slot {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-edit-slot:hover,
.btn-edit-slot.active {
  background: #a855f7;
  border-color: #a855f7;
  color: #fff;
}

.btn-del-slot {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.95rem;
  cursor: pointer;
  transition: color var(--trans-fast);
}

.btn-del-slot:hover {
  color: #f87171;
}
</style>
