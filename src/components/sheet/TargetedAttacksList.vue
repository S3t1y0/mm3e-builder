<template>
  <div class="sheet-card targeted-attacks-section">
    <div class="card-header-row">
      <div class="card-title-group">
        <i class="ri-sword-line icon-primary"></i>
        <h3>Targeted Attacks</h3>
      </div>

      <!-- Quick Initiative & Filter Controls -->
      <div class="header-actions-wrap">
        <button
          type="button"
          class="quick-init-btn"
          @click="heroStore.rollInitiative()"
          title="Roll Combat Initiative (Turn Order)"
        >
          <i class="ri-speed-up-line"></i>
          <span>Init {{ heroStore.initiativeTotal >= 0 ? `+${heroStore.initiativeTotal}` : heroStore.initiativeTotal }}</span>
        </button>

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
    </div>

    <!-- Stunned / Dazed Tactical Notice -->
    <div v-if="heroStore.conditionModifiers.isStunned" class="atk-action-warning stunned mb-3">
      <i class="ri-forbid-line"></i>
      <span>Hero is <strong>Stunned / Incapacitated</strong>: Cannot take combat actions.</span>
    </div>
    <div v-else-if="heroStore.conditionModifiers.isDazed" class="atk-action-warning dazed mb-3">
      <i class="ri-time-line"></i>
      <span>Hero is <strong>Dazed / Staggered</strong>: Limited to 1 standard action this turn.</span>
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
                v-if="atk.isPowerDisabled || atk.isStandby"
                class="atk-status-pill"
                :class="atk.isPowerDisabled ? 'status-disabled' : 'status-standby'"
              >
                <i :class="atk.isPowerDisabled ? 'ri-shut-down-line' : 'ri-time-line'"></i>
                <span>{{ atk.isPowerDisabled ? 'OFFLINE' : 'STANDBY' }}</span>
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
              :title="atk.rollBonus !== null ? `Roll attack check (${getEffectiveAttackBonus(atk) >= 0 ? '+' : ''}${getEffectiveAttackBonus(atk)})` : 'Trigger combat effect'"
              @click="handleRollAttack(atk)"
            >
              <i class="ri-dice-line"></i>
              <span>{{ atk.rollBonus !== null ? `Roll ${getEffectiveAttackBonus(atk) >= 0 ? '+' : ''}${getEffectiveAttackBonus(atk)}` : 'Trigger' }}</span>
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
              <span class="spec-val bonus">
                {{ atk.rollBonus !== null ? (getEffectiveAttackBonus(atk) >= 0 ? `+${getEffectiveAttackBonus(atk)}` : getEffectiveAttackBonus(atk)) : 'Auto / Area' }}
              </span>
              <span
                v-if="getAttackPenaltyTag(atk) !== null"
                class="atk-penalty-tag"
                :title="atk.range === 'Close' && heroStore.conditionModifiers.isProne ? 'Penalty from conditions and prone (-5 close attack)' : 'Penalty from conditions'"
              >
                {{ getAttackPenaltyTag(atk) }} Cond
              </span>
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

        <!-- Effect Summary Strip & Drawer Toggle (Anti Slop R-03: 44px min tap target) -->
        <div class="atk-summary-strip">
          <div class="summary-left">
            <span class="summary-icon-badge" :class="getEffectTypeClass(atk)">
              <i :class="getEffectIcon(atk)"></i>
            </span>
            <div class="summary-content">
              <div class="summary-text-wrap">
                <span class="summary-label">Effect:</span>
                <span class="summary-value">{{ atk.summaryText || `${atk.effectName} (DC ${atk.dc} vs ${atk.resistance})` }}</span>
              </div>
              <!-- Tactical Modifiers Badges -->
              <div v-if="atk.tacticalModifiers?.length" class="summary-tag-chips">
                <span
                  v-for="mod in atk.tacticalModifiers"
                  :key="mod.name"
                  class="summary-tactical-chip"
                  :title="mod.desc"
                >
                  {{ mod.badge || mod.name }}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="btn-toggle-effects"
            :class="{ 'is-expanded': isExpanded(atk.id) }"
            :aria-expanded="isExpanded(atk.id)"
            @click="toggleDrawer(atk.id)"
            title="View failure degrees, conditions ladder, and defense check guide"
          >
            <i :class="isExpanded(atk.id) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            <span>{{ isExpanded(atk.id) ? 'Hide Details' : 'Effect Details' }}</span>
          </button>
        </div>

        <!-- Collapsible Tactical Effects Drawer -->
        <div v-if="isExpanded(atk.id)" class="atk-effects-drawer">
          <!-- Case A: Multi-track Linked Combo (e.g. Damage + Affliction) -->
          <div v-if="atk.isCompoundLinked && atk.linkedTargets?.length" class="linked-effects-wrap">
            <div class="linked-header-banner">
              <i class="ri-git-merge-line"></i>
              <span>Linked Attack Combo: Target makes separate resistance checks against each linked effect</span>
            </div>

            <div v-for="(sub, sIdx) in atk.linkedTargets" :key="sub.id || sIdx" class="linked-track-block">
              <div class="linked-track-header">
                <span class="track-tag">Track {{ sIdx + 1 }}</span>
                <span class="track-title">{{ sub.name || sub.baseEffect }}</span>
                <span class="track-dc-badge">{{ sub.dcDescription || `DC ${sub.dc} vs ${sub.resistance}` }}</span>
              </div>

              <!-- Resistance Guide -->
              <div class="resistance-guide-bar">
                <i class="ri-shield-check-line icon-teal"></i>
                <span>Target makes <strong>{{ sub.resistance }} check vs DC {{ sub.dc }}</strong></span>
              </div>

              <!-- Degree Ladder Grid -->
              <div v-if="sub.degrees?.length" class="degree-ladder-grid">
                <div
                  v-for="deg in sub.degrees"
                  :key="deg.degree || deg.label"
                  class="degree-step-card"
                  :class="{ 'is-severe': deg.isSevere }"
                >
                  <div class="step-card-header">
                    <span class="deg-step-badge" :class="{ 'severe': deg.isSevere }">{{ deg.label || deg.degree }}</span>
                    <span class="deg-margin-tag">{{ deg.margin || '' }}</span>
                  </div>
                  <div class="deg-conditions-row">
                    <span
                      v-for="cond in (deg.conditions || [deg.label])"
                      :key="cond"
                      class="deg-cond-pill"
                      :class="{ 'severe': deg.isSevere }"
                    >
                      {{ cond }}
                    </span>
                  </div>
                  <p class="deg-desc-text">{{ deg.desc || deg.label }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Case B: Standard Attack Effect Breakdown (Affliction, Damage, Weaken, etc.) -->
          <div v-else class="standard-effect-wrap">
            <!-- Resistance Target Guide Bar -->
            <div class="resistance-guide-bar">
              <i class="ri-shield-flash-line icon-teal"></i>
              <span>Defense Guide: Target makes <strong>{{ atk.resistance }} check vs DC {{ atk.dc }}</strong> ({{ atk.dcDescription }})</span>
            </div>

            <!-- Degree Ladder Grid -->
            <div v-if="atk.degrees?.length" class="degree-ladder-grid">
              <div
                v-for="deg in atk.degrees"
                :key="deg.degree || deg.label"
                class="degree-step-card"
                :class="{ 'is-severe': deg.isSevere }"
              >
                <div class="step-card-header">
                  <span class="deg-step-badge" :class="{ 'severe': deg.isSevere }">{{ deg.label || deg.degree }}</span>
                  <span class="deg-margin-tag">{{ deg.margin || '' }}</span>
                </div>
                <div class="deg-conditions-row">
                  <span
                    v-for="cond in (deg.conditions || [deg.label])"
                    :key="cond"
                    class="deg-cond-pill"
                    :class="{ 'severe': deg.isSevere }"
                  >
                    {{ cond }}
                  </span>
                </div>
                <p class="deg-desc-text">{{ deg.desc || deg.label }}</p>
              </div>
            </div>

            <!-- Tactical Modifiers Breakdown (if any) -->
            <div v-if="atk.tacticalModifiers?.length" class="tactical-modifiers-box">
              <div class="tactical-mod-header">
                <i class="ri-information-line"></i>
                <span>Tactical Modifiers & Traits:</span>
              </div>
              <div class="tactical-chips-grid">
                <div v-for="mod in atk.tacticalModifiers" :key="mod.name" class="tactical-mod-chip">
                  <strong class="mod-chip-name">{{ mod.name }}:</strong>
                  <span class="mod-chip-desc">{{ mod.desc }}</span>
                </div>
              </div>
            </div>
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
const expandedAttackIds = ref(new Set());

function isExpanded(id) {
  return expandedAttackIds.value.has(id);
}

function toggleDrawer(id) {
  if (expandedAttackIds.value.has(id)) {
    expandedAttackIds.value.delete(id);
  } else {
    expandedAttackIds.value.add(id);
  }
}

function getEffectIcon(atk) {
  if (atk.isCompoundLinked) return 'ri-git-merge-line';
  const eff = (atk.effectName || '').toLowerCase();
  if (eff.includes('affliction')) return 'ri-virus-line';
  if (eff.includes('weaken')) return 'ri-arrow-down-circle-line';
  if (eff.includes('nullify')) return 'ri-prohibited-line';
  if (eff.includes('move object')) return 'ri-hand-coin-line';
  return 'ri-sword-line';
}

function getEffectTypeClass(atk) {
  if (atk.isCompoundLinked) return 'effect-linked';
  const eff = (atk.effectName || '').toLowerCase();
  if (eff.includes('affliction')) return 'effect-affliction';
  if (eff.includes('damage') || eff.includes('blast')) return 'effect-damage';
  if (eff.includes('weaken')) return 'effect-weaken';
  return 'effect-default';
}

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

function getEffectiveAttackBonus(atk) {
  if (atk.rollBonus === null || atk.rollBonus === undefined) return null;
  let bonus = atk.rollBonus;
  const cond = heroStore.conditionModifiers;
  if (cond) {
    if (atk.range === 'Close') {
      bonus += cond.closeAttackPenalty;
    } else {
      bonus += cond.rangedAttackPenalty;
    }
  }
  return bonus;
}

function getAttackPenaltyTag(atk) {
  if (atk.rollBonus === null || atk.rollBonus === undefined) return null;
  const cond = heroStore.conditionModifiers;
  if (!cond) return null;
  const pen = atk.range === 'Close' ? cond.closeAttackPenalty : cond.rangedAttackPenalty;
  if (pen === 0) return null;
  return pen;
}

function handleRollAttack(atk) {
  const bonus = getEffectiveAttackBonus(atk) ?? 0;
  const extra = {
    dc: atk.dc,
    dcDescription: atk.dcDescription,
    resistance: atk.resistance,
    effectName: atk.effectName,
    effectRank: atk.effectRank,
    summaryText: atk.summaryText,
    degrees: atk.degrees,
    tacticalModifiers: atk.tacticalModifiers
  };
  if (heroStore.conditionModifiers.checkPenalty !== 0) {
    extra.conditionPenalty = heroStore.conditionModifiers.checkPenalty;
  }
  if (atk.range === 'Close' && heroStore.conditionModifiers.isProne) {
    extra.pronePenalty = -5;
  }
  heroStore.rollCheck(`${atk.name} Attack`, bonus, 10, 'Attack', extra);
}

function handleSwitchAndRoll(atk) {
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
  background: rgba(0, 111, 184, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(0, 111, 184, 0.3);
}

.header-actions-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.quick-init-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  transition: all var(--trans-fast, 0.2s ease);
}

.quick-init-btn:hover {
  background: rgba(245, 158, 11, 0.22);
  border-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.quick-init-btn:active {
  transform: translateY(1px);
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
  border-color: rgba(0, 111, 184, 0.4);
  background: rgba(0, 111, 184, 0.04);
}

.attack-tactical-card.is-standby {
  border-color: rgba(245, 158, 11, 0.35);
  opacity: 0.85;
}

.attack-tactical-card.is-disabled {
  border-color: rgba(100, 116, 139, 0.35);
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
  flex-shrink: 0;
}

.btn-attack-roll {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: var(--radius-xs, 4px);
  background: linear-gradient(180deg, #0077c5 0%, #005a96 100%);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition: all var(--trans-fast);
}

.btn-attack-roll::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
  width: 100%;
  height: 100%;
}

.btn-attack-roll:hover {
  background: linear-gradient(180deg, #0088df 0%, #0068ad 100%);
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(0, 111, 184, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.btn-attack-roll:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

.btn-switch-roll {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: var(--radius-xs, 4px);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.28) 100%);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fde68a;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: all var(--trans-fast);
}

.btn-switch-roll::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
  width: 100%;
  height: 100%;
}

.btn-switch-roll:hover {
  background: #f59e0b;
  color: #0b1020;
  border-color: #fbbf24;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.btn-switch-roll:active {
  transform: translateY(1px);
}

.btn-turnon-roll {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: var(--radius-xs, 4px);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.25) 100%);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fbbf24;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: all var(--trans-fast);
}

.btn-turnon-roll::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
  width: 100%;
  height: 100%;
}

.btn-turnon-roll:hover {
  background: #f59e0b;
  color: #0b1020;
  border-color: #fbbf24;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.btn-turnon-roll:active {
  transform: translateY(1px);
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
  color: var(--text-primary);
  font-weight: 800;
}

.spec-val.crit {
  color: #f87171;
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

.atk-action-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  margin-bottom: 0.75rem;
}

.atk-action-warning.stunned {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.atk-action-warning.dazed {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.atk-penalty-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 800;
  color: #f87171;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.32);
  padding: 0.05rem 0.32rem;
  border-radius: 3px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* Effect Summary Strip (Anti Slop R-03: 44px min touch target) */
.atk-summary-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0.65rem;
  background: rgba(11, 17, 34, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  margin-top: 0.2rem;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: 1;
  min-width: 0;
}

.summary-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.summary-icon-badge.effect-affliction {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.35);
}

.summary-icon-badge.effect-damage {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.summary-icon-badge.effect-weaken {
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.35);
}

.summary-icon-badge.effect-linked {
  background: rgba(20, 184, 166, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(20, 184, 166, 0.35);
}

.summary-icon-badge.effect-default {
  background: rgba(0, 111, 184, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(0, 111, 184, 0.35);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.summary-text-wrap {
  font-size: 0.76rem;
  line-height: 1.35;
  word-break: break-word;
}

.summary-label {
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: var(--letter-spacing-caps);
  margin-right: 0.35rem;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
}

.summary-tag-chips {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.summary-tactical-chip {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.08rem 0.38rem;
  border-radius: 3px;
  background: rgba(0, 111, 184, 0.12);
  color: #93c5fd;
  border: 1px solid rgba(0, 111, 184, 0.28);
}

/* Button Toggle Effects (Touch Target 44px via ::after) */
.btn-toggle-effects {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  height: 28px;
  padding: 0 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--trans-fast);
  flex-shrink: 0;
}

.btn-toggle-effects::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
  width: 100%;
  height: 100%;
}

.btn-toggle-effects:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-toggle-effects.is-expanded {
  background: rgba(0, 111, 184, 0.15);
  color: #38bdf8;
  border-color: rgba(0, 111, 184, 0.4);
}

.btn-toggle-effects:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Collapsible Effects Drawer (DESIGN.md: matte slate #0b1122 base, no blur stacking) */
.atk-effects-drawer {
  background: #0b1122;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: drawerFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes drawerFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Resistance Guide Bar */
.resistance-guide-bar {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid var(--border-subtle);
  padding: 0.45rem 0.65rem;
  border-radius: var(--radius-xs);
  margin-bottom: 0.25rem;
}

.resistance-guide-bar strong {
  color: #f8fafc;
}

.icon-teal {
  color: #2dd4bf;
}

/* Degree Ladder Grid */
.degree-ladder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.5rem;
}

.degree-step-card {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: border-color var(--trans-fast);
}

.degree-step-card:hover {
  border-color: var(--border-color);
}

.degree-step-card.is-severe {
  border-color: rgba(244, 63, 94, 0.28);
  background: rgba(244, 63, 94, 0.04);
}

.step-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}

.deg-step-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.08rem 0.4rem;
  border-radius: 3px;
  background: rgba(0, 111, 184, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(0, 111, 184, 0.3);
}

.deg-step-badge.severe {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.35);
}

.deg-margin-tag {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-weight: 600;
}

.deg-conditions-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.deg-cond-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 3px;
  background: rgba(245, 158, 11, 0.15);
  color: #fde047;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.deg-cond-pill.severe {
  background: rgba(244, 63, 94, 0.2);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.4);
}

.deg-desc-text {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

/* Tactical Modifiers Box */
.tactical-modifiers-box {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.55rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tactical-mod-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
}

.tactical-chips-grid {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.tactical-mod-chip {
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--text-secondary);
}

.mod-chip-name {
  color: #93c5fd;
  margin-right: 0.3rem;
}

.mod-chip-desc {
  color: var(--text-secondary);
}

/* Linked Combo Blocks */
.linked-effects-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.linked-header-banner {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 700;
  color: #2dd4bf;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-xs);
}

.linked-track-block {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.linked-track-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.track-tag {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  padding: 0.08rem 0.38rem;
  border-radius: 3px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.track-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
}

.track-dc-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.08rem 0.45rem;
  border-radius: 3px;
  margin-left: auto;
}
</style>
