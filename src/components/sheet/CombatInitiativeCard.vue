<template>
  <div class="dndb-card combat-initiative-card" title="Combat reaction order (AGL + Improved Initiative)">
    <!-- Card Header -->
    <div class="dndb-card-header init-card-header">
      <div class="dndb-card-title-wrap">
        <i class="ri-speed-up-line dndb-card-icon init-icon"></i>
        <h3 class="dndb-card-title">INITIATIVE</h3>
      </div>
    </div>

    <div class="init-card-body">
      <!-- Big Tactical Strike Roll Button (Harmonized with Defenses) -->
      <button
        type="button"
        class="init-strike-btn"
        @click="handleRollInitiative"
        title="Click to roll Initiative (Adds to Roll20 Turn Tracker)"
      >
        <div class="init-strike-left">
          <i class="ri-dice-line init-strike-dice"></i>
          <div class="init-strike-val-col">
            <span class="init-strike-total font-mono">
              {{ initiativeTotal >= 0 ? `+${initiativeTotal}` : initiativeTotal }}
            </span>
            <span class="init-strike-sub">BONUS</span>
          </div>
        </div>
        <div class="init-strike-right">
          <span class="init-strike-cta">ROLL INITIATIVE</span>
          <i class="ri-arrow-right-s-line init-strike-arrow"></i>
        </div>
      </button>

      <!-- Calculation Breakdown Strip (Segmented & Clean) -->
      <div class="init-breakdown-strip">
        <div class="init-calc-pill" title="Base Agility ability modifier">
          <span class="calc-lbl">Base AGL</span>
          <span class="calc-num font-mono">{{ baseAgl >= 0 ? `+${baseAgl}` : baseAgl }}</span>
        </div>
        <span class="calc-operator">+</span>
        <div
          class="init-calc-pill"
          :class="{ 'has-feat-bonus': improvedInitBonus > 0 }"
          title="Improved Initiative advantage (+4 per rank)"
        >
          <span class="calc-lbl">Improved Init</span>
          <span class="calc-num font-mono">+{{ improvedInitBonus }}</span>
          <span v-if="improvedInitRanks > 0" class="calc-rank-tag font-mono">R{{ improvedInitRanks }}</span>
        </div>
        <template v-if="heroStore.circumstancePenalty !== 0">
          <span class="calc-operator">-</span>
          <div
            class="init-calc-pill has-penalty"
            :title="heroStore.conditionModifiers.isDisabled ? 'Disabled: -5 on checks' : 'Impaired: -2 on checks'"
          >
            <span class="calc-lbl">{{ heroStore.conditionModifiers.isDisabled ? 'Disabled' : 'Impaired' }}</span>
            <span class="calc-num font-mono">{{ Math.abs(heroStore.circumstancePenalty) }}</span>
          </div>
        </template>
      </div>

      <!-- Actionable Seize Initiative Trigger (Only if hero has the advantage) -->
      <div v-if="hasSeizeInitiative" class="init-seize-wrapper">
        <button
          type="button"
          class="btn-seize-act"
          :disabled="(heroStore.character.heroPoints || 0) <= 0"
          @click="handleSeizeInitiative"
          title="Spend 1 Hero Point to automatically act first in combat turn order"
        >
          <div class="seize-act-left">
            <i class="ri-flashlight-fill"></i>
            <span class="seize-act-title">Seize Initiative</span>
          </div>
          <span class="seize-act-cost">Spend 1 HP (Act 1st)</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const initiativeTotal = computed(() => {
  return heroStore.initiativeTotal;
});

const baseAgl = computed(() => {
  return heroStore.effectiveAbilities?.AGL || 0;
});

const improvedInitRanks = computed(() => {
  return heroStore.getAdvantageRanks('Improved Initiative');
});

const improvedInitBonus = computed(() => {
  return improvedInitRanks.value * 4;
});

const hasSeizeInitiative = computed(() => {
  return (heroStore.character.advantages || []).some(
    a => (a.name || '').trim().toLowerCase() === 'seize initiative'
  );
});

function handleRollInitiative() {
  heroStore.rollInitiative();
}

function handleSeizeInitiative() {
  const curHp = Number(heroStore.character.heroPoints) || 0;
  if (curHp <= 0) return;

  // Deduct 1 Hero Point
  heroStore.character.heroPoints = Math.max(0, curHp - 1);
  heroStore.pushHistory();

  // Trigger dedicated roll / announcement
  heroStore.rollCheck('Seize Initiative (HP Spent)', heroStore.initiativeTotal, null, 'Initiative', {
    seized: true,
    note: 'Spent 1 Hero Point: Automatically acts first in combat turn order!'
  });
}
</script>

<style scoped>
.combat-initiative-card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: var(--bg-surface, #121824);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 6px);
  padding: 0.85rem;
}

.init-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.5rem;
  margin-bottom: 0.1rem;
}

.init-icon {
  font-size: 1.15rem;
  color: #f59e0b;
}

.init-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

/* Big Tactical Strike Roll Button */
.init-strike-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-sm, 6px);
  color: #f8fafc;
  cursor: pointer;
  transition: all var(--trans-fast, 0.2s ease);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.init-strike-btn:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(245, 158, 11, 0.1) 100%);
  border-color: #f59e0b;
  box-shadow: 0 3px 12px rgba(245, 158, 11, 0.22);
}

.init-strike-btn:active {
  transform: translateY(1px);
}

.init-strike-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.init-strike-dice {
  font-size: 1.35rem;
  color: #f59e0b;
  transition: transform 0.2s ease;
}

.init-strike-btn:hover .init-strike-dice {
  transform: rotate(-15deg) scale(1.1);
}

.init-strike-val-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1;
}

.init-strike-total {
  font-size: 1.4rem;
  font-weight: 900;
  color: #fbbf24;
  letter-spacing: -0.02em;
}

.init-strike-sub {
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--text-secondary, #94a3b8);
  letter-spacing: 0.08em;
  margin-top: 0.18rem;
}

.init-strike-right {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.init-strike-cta {
  font-size: 0.72rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: 0.04em;
}

.init-strike-arrow {
  font-size: 1.15rem;
  color: #f59e0b;
  transition: transform 0.2s ease;
}

.init-strike-btn:hover .init-strike-arrow {
  transform: translateX(2px);
}

/* Calculation Breakdown Strip */
.init-breakdown-strip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.init-calc-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 0.3rem 0.55rem;
  border-radius: var(--radius-xs, 4px);
  font-size: 0.72rem;
}

.calc-lbl {
  color: var(--text-secondary, #94a3b8);
  font-size: 0.68rem;
  font-weight: 600;
}

.calc-num {
  font-weight: 800;
  color: #f1f5f9;
}

.init-calc-pill.has-feat-bonus .calc-num {
  color: #fbbf24;
}

.init-calc-pill.has-penalty {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
}

.init-calc-pill.has-penalty .calc-num {
  color: #f87171;
}

.calc-rank-tag {
  font-size: 0.6rem;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  margin-left: 0.25rem;
}

.calc-operator {
  color: var(--text-secondary, #64748b);
  font-weight: 700;
  font-size: 0.75rem;
}

/* Actionable Seize Initiative Trigger */
.init-seize-wrapper {
  margin-top: 0.1rem;
}

.btn-seize-act {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(245, 158, 11, 0.1);
  border: 1px dashed rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  border-radius: var(--radius-xs, 4px);
  padding: 0.35rem 0.65rem;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all var(--trans-fast, 0.2s ease);
}

.btn-seize-act:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.2);
  border-style: solid;
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
}

.btn-seize-act:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, #94a3b8);
}

.seize-act-left {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 800;
}

.seize-act-cost {
  font-size: 0.64rem;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.2);
  padding: 0.1rem 0.45rem;
  border-radius: 3px;
  color: #fbbf24;
}

.btn-seize-act:disabled .seize-act-cost {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary, #94a3b8);
}
</style>
