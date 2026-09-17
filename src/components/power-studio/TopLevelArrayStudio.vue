<template>
  <div class="top-level-array-studio">
    <!-- 1. EMPTY INVITATION CARD (When no alternate effects exist) -->
    <div v-if="!hasAlternateEffects" class="array-empty-invitation">
      <div class="invitation-left">
        <div class="icon-cube"><i class="ri-shuffle-line"></i></div>
        <div>
          <span class="badge-tag">Alternate Effects</span>
          <h5 class="invitation-title">Power Array (Alternate Effects)</h5>
          <p class="invitation-desc">
            Build alternate powers or modes that share the primary effect's PP pool at an economical rate (+1 PP for standard alternate effect, +2 PP for dynamic alternate effect).
          </p>
        </div>
      </div>
      <button
        type="button"
        class="btn-enable-array"
        @click="builderStore.enableArrayForCurrentPower('Damage')"
      >
        <i class="ri-add-line"></i>
        <span>Add Alternate Effect (Turn into Array)</span>
      </button>
    </div>

    <!-- 2. COMPACT HORIZONTAL ARRAY MODE BAR (~55px) -->
    <div v-else class="array-mode-bar">
      <!-- Top Meta Bar: Suite Count, Mini Headroom Meter, Rules Tooltip & Revert -->
      <div class="mode-bar-header">
        <div class="bar-header-left">
          <span class="mode-suite-label">
            <i class="ri-shuffle-line"></i>
            <span>Array Suite ({{ (builderStore.power.alternateEffects?.length || 0) + 1 }} Modes)</span>
          </span>

          <!-- Inline Headroom Mini-Meter -->
          <div class="headroom-inline-meter" :title="`Max Pool: ${arrayCapacity} PP. Safe Headroom: ${headroom} PP`">
            <span class="meter-text">Pool: <strong>{{ arrayCapacity }} PP</strong></span>
            <div class="meter-mini-track">
              <div
                class="meter-mini-fill"
                :class="{ overflow: isOverflow }"
                :style="{ width: `${capacityPercent}%` }"
              ></div>
            </div>
            <span class="meter-badge" :class="isOverflow ? 'overflow' : 'ok'">
              <i :class="isOverflow ? 'ri-error-warning-line' : 'ri-shield-check-line'"></i>
              <span>{{ isOverflow ? 'Exceeds Pool!' : `${headroom} PP Free` }}</span>
            </span>
          </div>

          <!-- Rules Info Tooltip -->
          <span
            class="rules-hint-chip"
            title="M&M 3E Array: Alternate slots cost +1 PP (Standard) or +2 PP (Dynamic) and share the Primary Effect's PP pool capacity."
          >
            <i class="ri-information-line"></i>
            <span>Rules</span>
          </span>
        </div>

        <button
          type="button"
          class="btn-revert-ghost"
          title="Clear all alternate modes and return to standard single power"
          @click="builderStore.clearArrayForCurrentPower()"
        >
          <i class="ri-close-circle-line"></i>
          <span>Revert to Single Power</span>
        </button>
      </div>

      <!-- Horizontal Mode Tabs Strip -->
      <div class="mode-tabs-track">
        <!-- 1. Primary Effect Tab -->
        <button
          type="button"
          class="array-mode-tab primary-tab"
          :class="{ active: builderStore.activeTargetType === 'main' }"
          title="Click to edit Primary Effect"
          @click="builderStore.selectMainForEditing()"
        >
          <i class="ri-star-fill tab-icon-primary"></i>
          <span class="tab-mode-name">
            {{ builderStore.power.mainEffect?.name || builderStore.power.mainEffect?.baseEffect || 'Primary Effect' }}
          </span>
          <span class="tab-cost-pill primary-pill">{{ arrayCapacity }} PP Pool</span>
        </button>

        <!-- 2. Alternate Mode Tabs -->
        <div
          v-for="(slot, idx) in builderStore.power.alternateEffects"
          :key="slot.id || idx"
          class="array-mode-tab alternate-tab"
          :class="{
            active: builderStore.activeTargetType === 'slot' && builderStore.activeSlotIndex === idx,
            dynamic: slot.isDynamic
          }"
          title="Click to edit this alternate mode in the canvas"
          @click="builderStore.selectSlotForEditing(false, idx)"
        >
          <i :class="slot.isDynamic ? 'ri-flashlight-fill dyn-icon' : 'ri-swap-line'"></i>

          <span class="tab-mode-name">
            {{ slot.name || slot.effect?.name || slot.effect?.baseEffect || `Alternate Mode #${idx + 1}` }}
          </span>

          <span
            class="tab-cost-pill"
            :class="{ 'cost-overflow': getSlotCost(slot) > arrayCapacity }"
            :title="`Slot Cost: ${getSlotCost(slot)} PP (Max Pool: ${arrayCapacity} PP)`"
          >
            {{ getSlotCost(slot) }} PP
          </span>

          <!-- Dynamic vs Standard Toggle Pill Button -->
          <button
            type="button"
            class="dyn-badge-btn"
            :class="slot.isDynamic ? 'dyn' : 'std'"
            :title="slot.isDynamic ? 'Dynamic Mode (+2 PP). Click to change to Standard (+1 PP)' : 'Standard Mode (+1 PP). Click to change to Dynamic (+2 PP)'"
            @click.stop="slot.isDynamic = !slot.isDynamic"
          >
            {{ slot.isDynamic ? 'Dyn (+2)' : 'Std (+1)' }}
          </button>

          <!-- Remove Slot Button -->
          <button
            type="button"
            class="tab-remove-btn"
            title="Delete this alternate mode"
            @click.stop="builderStore.removeArraySlot(false, idx)"
          >
            <i class="ri-close-line"></i>
          </button>
        </div>

        <!-- 3. Add Mode Button -->
        <button
          type="button"
          class="btn-add-mode-pill"
          title="Add new alternate mode"
          @click="builderStore.addArraySlot(false, '', 'Damage')"
        >
          <i class="ri-add-line"></i>
          <span>Add Mode</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { calculateEffectCost } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();

const hasAlternateEffects = computed(() => {
  return Array.isArray(builderStore.power.alternateEffects) && builderStore.power.alternateEffects.length > 0;
});

const arrayCapacity = computed(() => {
  if (!builderStore.power.mainEffect) return 1;
  return calculateEffectCost(builderStore.power.mainEffect, 0).totalCost;
});

function getSlotCost(slot) {
  if (!slot?.effect) return 0;
  return calculateEffectCost(slot.effect, 0).totalCost;
}

const highestSlotCost = computed(() => {
  const alts = builderStore.power.alternateEffects || [];
  return alts.reduce((max, s) => Math.max(max, getSlotCost(s)), 0);
});

const isOverflow = computed(() => {
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
.top-level-array-studio {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

/* ==========================================================================
   EMPTY ARRAY INVITATION BANNER
   ========================================================================== */
.array-empty-invitation {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.85));
  border: 1px dashed rgba(168, 85, 247, 0.35);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1.15rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.invitation-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  min-width: 260px;
}

.icon-cube {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.badge-tag {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #c084fc;
  letter-spacing: 0.06em;
}

.invitation-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin: 0.15rem 0 0.1rem 0;
}

.invitation-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.35;
  margin: 0;
  max-width: 600px;
}

.btn-enable-array {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #c084fc;
  border-radius: var(--radius-xs);
  padding: 0.55rem 0.95rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color var(--trans-fast), color var(--trans-fast), box-shadow var(--trans-fast), transform var(--trans-fast);
}

.btn-enable-array:hover {
  background: #a855f7;
  color: #fff;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);
}

.btn-enable-array:active {
  transform: scale(0.97);
}

/* ==========================================================================
   COMPACT HORIZONTAL ARRAY MODE BAR
   ========================================================================== */
.array-mode-bar {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.mode-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bar-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.mode-suite-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #c084fc;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mode-suite-label i {
  font-size: 0.9rem;
}

/* Inline Mini Headroom Meter */
.headroom-inline-meter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
}

.meter-text {
  color: var(--text-secondary);
}

.meter-text strong {
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.meter-mini-track {
  width: 48px;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.meter-mini-fill {
  height: 100%;
  background: #a855f7;
  transition: width 0.3s ease;
}

.meter-mini-fill.overflow {
  background: #ef4444;
}

.meter-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.meter-badge.ok {
  color: #34d399;
}

.meter-badge.overflow {
  color: #f87171;
}

.rules-hint-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-pill);
  cursor: help;
}

.rules-hint-chip:hover {
  color: #c4b5fd;
  border-color: rgba(168, 85, 247, 0.3);
}

.btn-revert-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: color var(--trans-fast), background-color var(--trans-fast), border-color var(--trans-fast);
}

.btn-revert-ghost:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
}

/* Horizontal Mode Tabs Track */
.mode-tabs-track {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.array-mode-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
  user-select: none;
}

.array-mode-tab:hover {
  color: var(--text-primary);
  border-color: var(--border-color);
}

.array-mode-tab:active {
  transform: scale(0.97);
}

.array-mode-tab.active {
  background: rgba(168, 85, 247, 0.15);
  border-color: #a855f7;
  color: #fff;
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.3);
}

.primary-tab {
  border-left: 3px solid #38bdf8;
}

.tab-icon-primary {
  color: #38bdf8;
  font-size: 0.85rem;
}

.dyn-icon {
  color: #c084fc;
}

.tab-mode-name {
  font-weight: 800;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-cost-pill {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.primary-pill {
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
}

.tab-cost-pill.cost-overflow {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.dyn-badge-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.dyn-badge-btn.std {
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.1);
}

.dyn-badge-btn.dyn {
  color: #c084fc;
  border-color: rgba(168, 85, 247, 0.4);
  background: rgba(168, 85, 247, 0.18);
}

.dyn-badge-btn:hover {
  filter: brightness(1.2);
}

.dyn-badge-btn:active {
  transform: scale(0.94);
}

.tab-remove-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0 0.1rem;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity var(--trans-fast), color var(--trans-fast);
}

.tab-remove-btn:hover {
  opacity: 1;
  color: #f87171;
}

.btn-add-mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-surface);
  border: 1px dashed rgba(168, 85, 247, 0.4);
  color: #c084fc;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
  transition: background-color var(--trans-fast), border-color var(--trans-fast), color var(--trans-fast), transform var(--trans-fast);
}

.btn-add-mode-pill:hover {
  background: rgba(168, 85, 247, 0.12);
  border-color: #a855f7;
  color: #e9d5ff;
}

.btn-add-mode-pill:active {
  transform: scale(0.96);
}
</style>
