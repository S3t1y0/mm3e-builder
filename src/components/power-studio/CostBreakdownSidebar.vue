<template>
  <aside class="cost-breakdown-sidebar">
    <!-- Big Point Total Badge -->
    <div class="total-cost-card">
      <span class="total-badge-label">Total Power Points</span>
      <div class="total-badge-value">
        <span class="number">{{ builderStore.totalCost }}</span>
        <span class="unit">PP</span>
      </div>
      <span class="structure-caption">{{ structureText }}</span>

      <!-- Quick Hero Budget Impact Chip -->
      <div class="power-budget-chip" :class="isOverBudget ? 'chip-over' : 'chip-ok'">
        <i :class="isOverBudget ? 'ri-error-warning-fill' : 'ri-wallet-3-line'"></i>
        <span>Hero: {{ projectedTotalSpentPP }}/{{ totalBudgetPP }} PP ({{ isOverBudget ? `${Math.abs(projectedRemainingPP)} PP over` : `${projectedRemainingPP} PP left` }})</span>
      </div>
    </div>

    <!-- Math Formula Card -->
    <div class="sidebar-section-card">
      <div class="section-title">
        <i class="ri-calculator-line"></i>
        <span>Power Point Breakdown</span>
      </div>

      <div v-if="builderStore.breakdown" class="breakdown-lines">
        <!-- If Device -->
        <template v-if="builderStore.power.type === 'device'">
          <div class="math-line">
            <span class="line-label">Sub-Powers Raw Total:</span>
            <span class="line-val">{{ builderStore.breakdown.subtotalBeforeDiscount || 0 }} PP</span>
          </div>

          <div
            v-for="(sub, sIdx) in builderStore.breakdown.subPowerBreakdowns"
            :key="sub.id || sIdx"
            class="sub-breakdown-row"
          >
            <span class="sub-name-txt">• {{ sub.name }}:</span>
            <span class="sub-cost-txt">{{ sub.totalCost }} PP</span>
          </div>

          <div v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="math-line discount-line">
            <span class="line-label">
              Activation ({{ builderStore.power.activation === 'move' ? 'Move Action' : 'Standard Action' }}):
            </span>
            <span class="line-val discount">{{ builderStore.breakdown.activationCost }} PP</span>
          </div>

          <div class="math-line discount-line">
            <span class="line-label">
              {{ builderStore.power.deviceConfig?.type === 'easily_removable' ? 'Easily Removable (-2/5 PP):' : 'Removable (-1/5 PP):' }}
            </span>
            <span class="line-val discount">-{{ builderStore.breakdown.discount || 0 }} PP</span>
          </div>

          <div class="math-divider"></div>

          <div class="math-line total-line">
            <span class="line-label">Final Device Cost:</span>
            <span class="line-val highlight">{{ builderStore.totalCost }} PP</span>
          </div>
        </template>

        <!-- If Compound Power -->
        <template v-else-if="builderStore.power.type === 'compound'">
          <div class="math-line">
            <span class="line-label">Sub-Effects Total:</span>
            <span class="line-val">{{ builderStore.breakdown.subtotalEffects || 0 }} PP</span>
          </div>

          <div
            v-for="(sub, sIdx) in (builderStore.breakdown.subEffectBreakdowns || [])"
            :key="sub.id || sIdx"
            class="sub-breakdown-row"
          >
            <span class="sub-name-txt">
              • {{ sub.name }} (Rank {{ sub.rank }}):
              <small v-if="sub.isPrimary" class="primary-badge">PRIMARY</small>
            </span>
            <span class="sub-cost-txt">{{ sub.totalCost }} PP</span>
          </div>

          <div v-if="(builderStore.power.sharedModifiers || []).length > 0" class="math-line">
            <span class="line-label">Suite Modifiers:</span>
            <span class="line-val">
              {{ (builderStore.breakdown.sharedModifiersCost || 0) >= 0 ? `+${builderStore.breakdown.sharedModifiersCost || 0}` : builderStore.breakdown.sharedModifiersCost }} PP
            </span>
          </div>

          <div v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="math-line discount-line">
            <span class="line-label">
              Activation ({{ builderStore.power.activation === 'move' ? 'Move Action' : 'Standard Action' }}):
            </span>
            <span class="line-val discount">{{ builderStore.breakdown.activationCost }} PP</span>
          </div>

          <div class="math-divider"></div>

          <div class="math-line total-line">
            <span class="line-label">Final Compound Cost:</span>
            <span class="line-val highlight">{{ builderStore.totalCost }} PP</span>
          </div>
        </template>

        <!-- Standard or Array -->
        <template v-else>
          <div class="math-line">
            <span class="line-label">Base Effect ({{ activeEffCost.netPerRank }} PP/Rank):</span>
            <span class="line-val">{{ activeEffCost.basePointCost }} PP</span>
          </div>

          <div v-if="activeEffCost.flatTotal !== 0" class="math-line">
            <span class="line-label">Flat Extras / Flaws:</span>
            <span class="line-val">{{ activeEffCost.flatTotal > 0 ? `+${activeEffCost.flatTotal}` : activeEffCost.flatTotal }} PP</span>
          </div>

          <div v-if="builderStore.power.linkedEffects?.length > 0" class="math-line">
            <span class="line-label">Linked Effects ({{ builderStore.power.linkedEffects.length }}):</span>
            <span class="line-val">+{{ builderStore.power.linkedEffects.reduce((s, l) => s + (calculateEffectCost(l, 0).totalCost), 0) }} PP</span>
          </div>

          <div v-if="(builderStore.power.alternateEffects || []).length > 0" class="math-line">
            <span class="line-label">Alternate Effects ({{ builderStore.power.alternateEffects.length }}):</span>
            <span class="line-val">+{{ (builderStore.power.alternateEffects || []).reduce((s, a) => s + (a.isDynamic ? 2 : 1), 0) }} PP</span>
          </div>

          <div v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="math-line discount-line">
            <span class="line-label">
              Activation ({{ builderStore.power.activation === 'move' ? 'Move Action' : 'Standard Action' }}):
            </span>
            <span class="line-val discount">{{ builderStore.breakdown.activationCost }} PP</span>
          </div>

          <div class="math-divider"></div>

          <div class="math-line total-line">
            <span class="line-label">Final Power Cost:</span>
            <span class="line-val highlight">{{ builderStore.totalCost }} PP</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Character PP Spend & Budget Impact Card -->
    <div class="sidebar-section-card pp-spend-card">
      <div class="section-title">
        <i class="ri-pie-chart-2-line"></i>
        <span>Character PP Spend</span>
        <span class="hero-pl-tag">PL {{ heroStore.character.powerLevel || 10 }}</span>
      </div>

      <!-- Budget Status Summary -->
      <div class="spend-summary-box">
        <div class="spend-val-row">
          <div class="spend-main-col">
            <span class="spend-sub-label">Projected Total</span>
            <div class="spend-num-row font-mono">
              <span class="spend-spent" :class="{ 'over-budget': isOverBudget }">{{ projectedTotalSpentPP }}</span>
              <span class="spend-slash">/</span>
              <span class="spend-budget">{{ totalBudgetPP }}</span>
              <span class="spend-unit">PP</span>
            </div>
          </div>
          <div class="spend-badge-col">
            <span
              class="pp-status-pill"
              :class="isOverBudget ? 'pill-over' : 'pill-ok'"
            >
              <i :class="isOverBudget ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill'"></i>
              {{ isOverBudget ? `${Math.abs(projectedRemainingPP)} PP Over` : `${projectedRemainingPP} PP Left` }}
            </span>
          </div>
        </div>

        <!-- Dynamic Progress Meter -->
        <div class="pp-meter-track" :title="`${projectedPercent}% of ${totalBudgetPP} PP spent`">
          <div
            class="pp-meter-fill"
            :class="{ 'meter-over': isOverBudget }"
            :style="{ width: projectedPercent + '%' }"
          ></div>
        </div>

        <!-- Delta Context Line -->
        <div class="spend-delta-row">
          <span class="delta-label">
            {{ isEditingExisting ? 'Modifying Power:' : 'New Power:' }}
          </span>
          <span class="delta-val" :class="powerCostDelta > 0 ? 'delta-increase' : powerCostDelta < 0 ? 'delta-decrease' : 'delta-zero'">
            {{ powerCostDelta > 0 ? `+${powerCostDelta}` : powerCostDelta }} PP
            <small v-if="isEditingExisting && originalPowerCost !== builderStore.totalCost" class="delta-prev">
              (was {{ originalPowerCost }} PP)
            </small>
          </span>
        </div>
      </div>

      <!-- Category Breakdown (Abilities, Defenses, Skills, Advantages, Powers) -->
      <div class="spend-breakdown-wrap">
        <button
          type="button"
          class="btn-toggle-categories"
          @click="showCategoryDetails = !showCategoryDetails"
          title="Toggle detailed point allocation breakdown"
        >
          <span class="btn-toggle-title">Allocation Breakdown</span>
          <i class="ri-arrow-down-s-line chevron" :class="{ rotated: showCategoryDetails }"></i>
        </button>

        <div v-if="showCategoryDetails" class="category-breakdown-list">
          <div class="cat-math-line">
            <span class="cat-label"><i class="ri-user-star-line icon-cat"></i> Abilities:</span>
            <span class="cat-val">{{ heroStore.totalAbilityPP }} PP</span>
          </div>
          <div class="cat-math-line">
            <span class="cat-label"><i class="ri-shield-line icon-cat"></i> Defenses:</span>
            <span class="cat-val">{{ heroStore.totalDefensePP }} PP</span>
          </div>
          <div class="cat-math-line">
            <span class="cat-label"><i class="ri-focus-2-line icon-cat"></i> Skills:</span>
            <span class="cat-val">{{ heroStore.totalSkillPP }} PP</span>
          </div>
          <div class="cat-math-line">
            <span class="cat-label"><i class="ri-medal-line icon-cat"></i> Advantages:</span>
            <span class="cat-val">{{ heroStore.totalAdvantagePP }} PP</span>
          </div>
          <div class="cat-math-line cat-highlight">
            <span class="cat-label"><i class="ri-flashlight-line icon-cat"></i> Powers & Devices:</span>
            <span class="cat-val highlight">
              {{ projectedPowersCost }} PP
              <small v-if="projectedPowersCost !== heroStore.totalPowerPP" class="cat-sub">
                ({{ heroStore.totalPowerPP }} now)
              </small>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Combat Profile Preview & PL Cap Check -->
    <div class="sidebar-section-card">
      <div class="section-title">
        <i class="ri-sword-line"></i>
        <span>Combat Profile & PL Check</span>
      </div>

      <div v-if="combatProfile" class="combat-profile-lines">
        <div class="combat-line">
          <span class="c-label">Difficulty Class:</span>
          <span class="c-val dc-val">{{ combatProfile.dcDescription || `DC ${combatProfile.dc}` }}</span>
        </div>

        <div class="combat-line">
          <span class="c-label">Range Distance:</span>
          <span class="c-val">{{ combatProfile.rangeDistance }}</span>
        </div>

        <div class="combat-line">
          <span class="c-label">Offensive Attack:</span>
          <span class="c-val">{{ combatProfile.isOffensive ? 'Yes (Attack Roll / Save)' : 'Non-Offensive / Utility' }}</span>
        </div>

        <!-- PL Cap Indicator -->
        <div
          v-if="combatProfile.plCompliance"
          class="pl-compliance-banner"
          :class="combatProfile.plCompliance.isCompliant ? 'compliant' : 'exceeded'"
        >
          <i :class="combatProfile.plCompliance.isCompliant ? 'ri-shield-check-line' : 'ri-alert-line'"></i>
          <div class="pl-text">
            <span class="pl-title">
              {{ combatProfile.plCompliance.isCompliant ? 'PL 10 Compliant' : 'Exceeds PL 10 Cap!' }}
            </span>
            <span v-if="!combatProfile.plCompliance.isCompliant" class="pl-warn">
              {{ combatProfile.plCompliance.warningMessage }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { calculateEffectCost, calculatePowerTotalCost } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();
const heroStore = useHeroStore();

const showCategoryDetails = ref(true);

const totalBudgetPP = computed(() => heroStore.totalBudgetPP);

const isEditingExisting = computed(() => {
  return builderStore.editingIndex >= 0 && !!heroStore.character?.powers?.[builderStore.editingIndex];
});

const originalPowerCost = computed(() => {
  if (isEditingExisting.value) {
    try {
      return calculatePowerTotalCost(heroStore.character.powers[builderStore.editingIndex]) || 0;
    } catch (err) {
      console.warn('Error calculating original power cost:', err);
      return 0;
    }
  }
  return 0;
});

const powerCostDelta = computed(() => {
  if (isEditingExisting.value) {
    return builderStore.totalCost - originalPowerCost.value;
  }
  return builderStore.totalCost;
});

const projectedTotalSpentPP = computed(() => {
  if (isEditingExisting.value) {
    return heroStore.totalSpentPP - originalPowerCost.value + builderStore.totalCost;
  }
  return heroStore.totalSpentPP + builderStore.totalCost;
});

const projectedRemainingPP = computed(() => {
  return totalBudgetPP.value - projectedTotalSpentPP.value;
});

const projectedPowersCost = computed(() => {
  if (isEditingExisting.value) {
    return Math.max(0, heroStore.totalPowerPP - originalPowerCost.value + builderStore.totalCost);
  }
  return heroStore.totalPowerPP + builderStore.totalCost;
});

const projectedPercent = computed(() => {
  if (!totalBudgetPP.value || totalBudgetPP.value <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((projectedTotalSpentPP.value / totalBudgetPP.value) * 100)));
});

const isOverBudget = computed(() => projectedRemainingPP.value < 0);

const structureText = computed(() => {
  const t = builderStore.power.type;
  let base = '';
  if (t === 'device') {
    const dType = builderStore.power.deviceConfig?.type;
    base = `Device (${dType === 'easily_removable' ? 'Easily Removable' : 'Removable'})`;
  } else if (t === 'compound') {
    base = `Compound Power (${builderStore.power.compoundEffects?.length || 0} Sub-Effects)`;
  } else if (builderStore.power.alternateEffects?.length > 0) {
    base = `Standard Power with Array (${builderStore.power.alternateEffects.length} Alternate Effects)`;
  } else {
    base = 'Standard Independent Power';
  }
  if (builderStore.power.activation && builderStore.power.activation !== 'none') {
    base += ` • Activation (${builderStore.power.activation === 'move' ? 'Move' : 'Standard'})`;
  }
  return base;
});

const activeEffCost = computed(() => {
  if (!builderStore.currentEditingEffect) return { netPerRank: 1, basePointCost: 1, flatTotal: 0 };
  return calculateEffectCost(builderStore.currentEditingEffect, 0);
});

const combatProfile = computed(() => {
  return builderStore.combatMetrics;
});
</script>

<style scoped>
.cost-breakdown-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.total-cost-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.total-badge-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.total-badge-value {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.total-badge-value .number {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.total-badge-value .unit {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.structure-caption {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
  line-height: 1.35;
  word-break: break-word;
}

.sidebar-section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.45rem;
}

.section-title i {
  color: var(--accent-primary);
}

.breakdown-lines {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.math-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.76rem;
}

.line-label {
  color: var(--text-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-val {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
}

.sub-breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.72rem;
  padding-left: 0.5rem;
  color: var(--text-muted);
}

.sub-name-txt {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-cost-txt {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
}

.primary-badge {
  color: var(--accent-primary, #38bdf8);
  font-weight: 800;
  font-size: 0.65rem;
  margin-left: 0.3rem;
  letter-spacing: 0.05em;
}

.linked-badge {
  color: #38bdf8;
  font-weight: 700;
  font-size: 0.65rem;
  margin-left: 0.3rem;
  letter-spacing: 0.05em;
}

.discount-line .discount {
  color: #34d399;
  font-variant-numeric: tabular-nums;
}

.math-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 0.2rem 0;
}

.total-line {
  font-size: 0.84rem;
}

.total-line .highlight {
  color: var(--accent-primary);
  font-size: 0.95rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.combat-profile-lines {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.combat-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.76rem;
}

.c-label {
  color: var(--text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

.c-val {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.c-val.dc-val {
  color: var(--text-primary);
}

.pl-compliance-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-xs);
  margin-top: 0.35rem;
}

.pl-compliance-banner.compliant {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.pl-compliance-banner.compliant i {
  color: #34d399;
}

.pl-compliance-banner.exceeded {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.pl-compliance-banner i {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.pl-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.pl-title {
  font-size: 0.76rem;
  font-weight: 800;
}

.pl-warn {
  font-size: 0.68rem;
  color: #fca5a5;
  line-height: 1.3;
}

/* Quick Budget Impact Pill inside Total Cost Card */
.power-budget-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-xs);
  margin-top: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.power-budget-chip.chip-ok {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.28);
  color: #34d399;
}

.power-budget-chip.chip-over {
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.32);
  color: #f87171;
}

/* PP Spend Card & Metrics */
.pp-spend-card {
  position: relative;
}

.hero-pl-tag {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  background: rgba(0, 111, 184, 0.2);
  border: 1px solid rgba(0, 111, 184, 0.4);
  border-radius: 999px;
  color: #38bdf8;
  letter-spacing: 0.04em;
}

.spend-summary-box {
  background: rgba(11, 17, 34, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spend-val-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.spend-main-col {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.spend-sub-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.spend-num-row {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  line-height: 1.1;
}

.spend-spent {
  font-size: 1.35rem;
  font-weight: 900;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.spend-spent.over-budget {
  color: #f87171;
}

.spend-slash {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.spend-budget {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.spend-unit {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-left: 0.1rem;
}

.pp-status-pill {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.pp-status-pill.pill-ok {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.pp-status-pill.pill-over {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.pp-meter-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin: 0.35rem 0 0.15rem;
}

.pp-meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #006fb8, #38bdf8);
  border-radius: 999px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pp-meter-fill.meter-over {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.spend-delta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  padding-top: 0.25rem;
  border-top: 1px dashed var(--border-subtle);
  margin-top: 0.2rem;
}

.delta-label {
  color: var(--text-secondary);
}

.delta-val {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.delta-val.delta-increase {
  color: #38bdf8;
}

.delta-val.delta-decrease {
  color: #34d399;
}

.delta-val.delta-zero {
  color: var(--text-muted);
}

.delta-prev {
  font-size: 0.66rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 0.25rem;
}

/* Category Breakdown List */
.spend-breakdown-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.btn-toggle-categories {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.25rem 0.1rem;
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: color 0.15s ease;
}

.btn-toggle-categories:hover {
  color: var(--text-primary);
}

.btn-toggle-categories .chevron {
  font-size: 0.95rem;
  transition: transform 0.2s ease;
}

.btn-toggle-categories .chevron.rotated {
  transform: rotate(180deg);
}

.category-breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
}

.cat-math-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
}

.cat-label {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.icon-cat {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.cat-val {
  font-weight: 700;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.cat-math-line.cat-highlight {
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.25rem;
  margin-top: 0.15rem;
}

.cat-math-line.cat-highlight .cat-label {
  color: var(--text-primary);
  font-weight: 700;
}

.cat-math-line.cat-highlight .icon-cat {
  color: var(--accent-primary);
}

.cat-math-line.cat-highlight .cat-val.highlight {
  color: var(--accent-primary);
  font-weight: 800;
}

.cat-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-left: 0.2rem;
}
</style>
