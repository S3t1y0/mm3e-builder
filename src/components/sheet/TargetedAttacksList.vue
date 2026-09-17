<template>
  <div class="sheet-card targeted-attacks-section">
    <div class="card-header-row">
      <div class="card-title-group">
        <i class="ri-sword-line icon-primary"></i>
        <h3>Targeted Attacks</h3>
      </div>

      <!-- Filter Controls -->
      <div class="filter-pills-row">
        <button
          v-for="flt in ['All', 'Active Only', 'Close', 'Ranged']"
          :key="flt"
          type="button"
          class="filter-pill-btn"
          :class="{ active: currentFilter === flt }"
          @click="currentFilter = flt"
        >
          {{ flt }}
        </button>
      </div>
    </div>

    <!-- Empty Attacks Hint -->
    <div v-if="filteredAttacks.length === 0" class="empty-attacks-notice">
      No attacks matching current filter.
    </div>

    <!-- Attacks Grid / List -->
    <div v-else class="attacks-list-grid">
      <div
        v-for="atk in filteredAttacks"
        :key="atk.id"
        class="attack-tactical-card"
        :class="{
          'is-disabled': atk.isPowerDisabled,
          'is-standby': atk.isStandby && !atk.isPowerDisabled,
          'is-active': atk.isActive
        }"
      >
        <div class="atk-card-top">
          <div class="atk-identity">
            <div class="atk-title-row">
              <span class="atk-title">{{ atk.name }}</span>
              <span class="atk-source-tag">({{ atk.source }})</span>
            </div>
            <div class="atk-meta-row">
              <span class="atk-type-pill" :class="atk.range === 'Ranged' ? 'ranged' : 'close'">
                {{ atk.range }} Attack
              </span>
              <span
                class="atk-status-pill"
                :class="atk.isPowerDisabled ? 'status-disabled' : (atk.isActive ? 'status-active' : 'status-standby')"
              >
                <i :class="atk.isPowerDisabled ? 'ri-shut-down-line' : (atk.isActive ? 'ri-checkbox-circle-fill' : 'ri-time-line')"></i>
                <span>{{ atk.isPowerDisabled ? 'OFFLINE' : (atk.isActive ? 'ACTIVE' : 'STANDBY') }}</span>
              </span>
            </div>
          </div>

          <!-- Roll Action Buttons -->
          <div class="atk-roll-actions">
            <!-- If Power Disabled: 1-click Turn On & Roll! -->
            <button
              v-if="atk.isPowerDisabled"
              type="button"
              class="btn-turnon-roll"
              title="Activate power and roll attack check"
              @click="handleTurnOnAndRoll(atk)"
            >
              <i class="ri-flashlight-line"></i>
              <span>Turn On & Roll</span>
            </button>

            <!-- If Active: 1-click Roll -->
            <button
              v-else-if="atk.isActive"
              type="button"
              class="btn-attack-roll"
              @click="handleRollAttack(atk)"
            >
              <i class="ri-dice-line"></i>
              <span>{{ atk.rollBonus !== null ? `Roll Attack (+${atk.rollBonus})` : 'Trigger Effect' }}</span>
            </button>

            <!-- If Standby (in Array/Device): 1-click Switch & Roll! -->
            <button
              v-else
              type="button"
              class="btn-switch-roll"
              title="Switch slot to Active and roll attack check"
              @click="handleSwitchAndRoll(atk)"
            >
              <i class="ri-shuffle-line"></i>
              <span>Switch & Roll</span>
            </button>
          </div>
        </div>

        <!-- Attack Combat Specs Metrics -->
        <div class="atk-specs-row">
          <div class="spec-metric">
            <span class="spec-label">Attack Bonus</span>
            <div class="spec-bonus-wrap">
              <span class="spec-val bonus">{{ atk.rollBonus !== null ? `+${atk.rollBonus}` : 'Auto / Area' }}</span>
              <span
                v-if="atk.rollBonus !== null && getAttackAdvBonus(atk) > 0"
                class="atk-adv-tag"
                :title="`+${getAttackAdvBonus(atk)} from ${atk.range === 'Ranged' ? 'Ranged Attack' : 'Close Attack'} Advantage`"
              >
                +{{ getAttackAdvBonus(atk) }} Adv
              </span>
            </div>
          </div>

          <div class="spec-metric">
            <span class="spec-label">Effect / DC</span>
            <span class="spec-val dc">{{ atk.dcDescription || `DC ${atk.dc}` }}</span>
          </div>

          <div class="spec-metric">
            <span class="spec-label">Range</span>
            <span class="spec-val">{{ atk.range }}</span>
          </div>

          <div class="spec-metric">
            <span class="spec-label">Critical</span>
            <span class="spec-val crit">{{ atk.crit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const currentFilter = ref('All');

const filteredAttacks = computed(() => {
  const all = heroStore.targetedAttacks || [];
  if (currentFilter.value === 'Active Only') {
    return all.filter(a => a.isActive);
  }
  if (currentFilter.value === 'Close') {
    return all.filter(a => a.range === 'Close');
  }
  if (currentFilter.value === 'Ranged') {
    return all.filter(a => a.range === 'Ranged' || a.range === 'Perception');
  }
  return all;
});

function getAttackAdvBonus(atk) {
  if (!atk) return 0;
  if (atk.range === 'Ranged') {
    return heroStore.getAdvantageRanks('Ranged Attack');
  }
  return heroStore.getAdvantageRanks('Close Attack');
}

function handleRollAttack(atk) {
  const bonus = atk.rollBonus || 0;
  heroStore.rollCheck(`${atk.name} Attack`, bonus, 10, 'Attack');
}

function handleSwitchAndRoll(atk) {
  // Activate slot in store
  if (atk.isSubPower && atk.powerId && atk.devSubIdx !== undefined) {
    heroStore.setActiveDeviceSubSlot(atk.powerId, atk.devSubIdx, atk.slotId);
  } else if (atk.powerId) {
    heroStore.setActivePowerSlot(atk.powerId, atk.slotId);
  }

  handleRollAttack(atk);
}

function handleTurnOnAndRoll(atk) {
  if (atk.powerId) {
    heroStore.setPowerActive(atk.powerId, true);
    if (atk.isSubPower && atk.devSubIdx !== undefined) {
      heroStore.setDeviceSubPowerActive(atk.powerId, atk.devSubIdx, true);
      if (atk.slotId && atk.slotId !== 'main') {
        heroStore.setActiveDeviceSubSlot(atk.powerId, atk.devSubIdx, atk.slotId);
      }
    } else if (atk.slotId && atk.slotId !== 'main') {
      heroStore.setActivePowerSlot(atk.powerId, atk.slotId);
    }
    handleRollAttack(atk);
  }
}
</script>

<style scoped>
.targeted-attacks-section {
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
  margin-bottom: 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.icon-primary {
  font-size: 1.25rem;
  color: #ef4444;
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
  background: rgba(220, 38, 38, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.filter-pills-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-pill-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.filter-pill-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.empty-attacks-notice {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.attacks-list-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.attack-tactical-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all var(--trans-fast);
}

.attack-tactical-card:hover {
  border-color: var(--border-color);
  background: var(--bg-card-hover);
}

.attack-tactical-card.is-active {
  border-left: 3px solid #10b981;
}

.attack-tactical-card.is-standby {
  border-left: 3px solid #f59e0b;
  opacity: 0.8;
}

.attack-tactical-card.is-disabled {
  border-left: 3px solid #64748b;
  opacity: 0.65;
  border-style: dashed;
}

.attack-tactical-card.is-disabled:hover {
  opacity: 0.9;
}

.attack-tactical-card.is-disabled .atk-title {
  color: var(--text-muted);
}

.atk-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.atk-identity {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.atk-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.atk-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
}

.atk-source-tag {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.atk-meta-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.atk-type-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

.atk-type-pill.close {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.atk-type-pill.ranged {
  background: rgba(168, 85, 247, 0.15);
  color: #ddd6fe;
}

.atk-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill);
}

.status-active {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.status-standby {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.status-disabled {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.atk-roll-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-attack-roll {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-attack-roll:hover {
  background: #10b981;
  color: #fff;
}

.btn-switch-roll {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fde68a;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-switch-roll:hover {
  background: #f59e0b;
  color: #09090b;
}

.btn-turnon-roll {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
}

.btn-turnon-roll:hover {
  background: #f59e0b;
  color: #09090b;
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.atk-specs-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border-subtle);
  flex-wrap: wrap;
}

.spec-metric {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.spec-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

.spec-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.spec-val.bonus {
  color: #38bdf8;
  font-weight: 900;
}

.spec-val.dc {
  color: #fbbf24;
  font-weight: 800;
}

.spec-val.crit {
  color: #ec4899;
}

.spec-bonus-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.atk-adv-tag {
  font-size: 0.6rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.05rem 0.32rem;
  border-radius: 3px;
  letter-spacing: 0.02em;
}
</style>
