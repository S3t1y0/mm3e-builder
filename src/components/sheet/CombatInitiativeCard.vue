<template>
  <div class="dndb-card combat-initiative-card" title="Combat reaction order (AGL + Improved Initiative)">
    <div class="dndb-card-header init-card-header">
      <div class="init-title-group">
        <i class="ri-speed-up-line init-icon"></i>
        <div>
          <h3 class="dndb-card-title">INITIATIVE</h3>
          <span class="init-sub">Combat Turn Order</span>
        </div>
      </div>
      <div class="init-badges">
        <span v-if="hasSeizeInitiative" class="init-seize-badge" title="Seize Initiative Advantage: Spend 1 Hero Point to automatically act first">
          <i class="ri-flashlight-fill"></i> Seize Init
        </span>
        <span class="dndb-cost-indicator">Agility Based</span>
      </div>
    </div>

    <div class="init-card-body">
      <!-- Big Roll Trigger -->
      <button
        type="button"
        class="init-main-roll-btn"
        @click="handleRollInitiative"
        title="Click to roll Initiative (Adds to Roll20 Turn Tracker)"
      >
        <div class="init-roll-left">
          <i class="ri-dice-line init-dice-icon"></i>
          <div class="init-val-wrap">
            <span class="init-val-total tabular-nums">
              {{ initiativeTotal >= 0 ? `+${initiativeTotal}` : initiativeTotal }}
            </span>
            <span class="init-roll-label">ROLL TURN ORDER</span>
          </div>
        </div>
        <div class="init-roll-right">
          <span class="init-formula-pill font-mono">1d20{{ initiativeTotal >= 0 ? `+${initiativeTotal}` : initiativeTotal }}</span>
        </div>
      </button>

      <!-- Calculation Breakdown Strip -->
      <div class="init-breakdown-row">
        <div class="init-breakdown-item" title="Agility ability modifier">
          <span class="breakdown-lbl">Base AGL</span>
          <span class="breakdown-val font-mono">{{ baseAgl >= 0 ? `+${baseAgl}` : baseAgl }}</span>
        </div>
        <span class="breakdown-sep">+</span>
        <div class="init-breakdown-item" :class="{ 'has-bonus': improvedInitBonus > 0 }" title="Improved Initiative advantage (+4 per rank)">
          <span class="breakdown-lbl">Improved Init</span>
          <span class="breakdown-val font-mono">+{{ improvedInitBonus }}</span>
        </div>
        <div v-if="hasSeizeInitiative" class="init-rule-note">
          <span>• 1 HP to Act 1st</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';

const heroStore = useHeroStore();

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
}

.init-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.init-icon {
  font-size: 1.15rem;
  color: #f59e0b;
}

.init-sub {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted, #94a3b8);
  letter-spacing: 0.3px;
}

.init-badges {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.init-seize-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.init-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.init-main-roll-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 6px;
  color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.init-main-roll-btn:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-color: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
}

.init-main-roll-btn:active {
  transform: translateY(1px);
}

.init-roll-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.init-dice-icon {
  font-size: 1.35rem;
  color: #f59e0b;
}

.init-val-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.init-val-total {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1;
  color: #fbbf24;
}

.init-roll-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #e2e8f0;
}

.init-formula-pill {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #94a3b8;
}

.init-breakdown-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--text-secondary, #94a3b8);
  padding: 0.3rem 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.init-breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.breakdown-lbl {
  color: var(--text-muted, #64748b);
}

.breakdown-val {
  font-weight: 700;
  color: #f1f5f9;
}

.init-breakdown-item.has-bonus .breakdown-val {
  color: #fbbf24;
}

.breakdown-sep {
  color: var(--text-muted, #475569);
  font-weight: 700;
}

.init-rule-note {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 600;
  color: #f59e0b;
}
</style>
