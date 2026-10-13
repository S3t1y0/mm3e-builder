<template>
  <aside class="cost-breakdown-sidebar pro-inspector-panel">
    <!-- ZONE 1: MINIMALIST COST HEADER -->
    <header class="inspector-cost-header">
      <span class="inspector-badge-label">Total Power Points</span>
      <div class="inspector-badge-value">
        <span class="number font-mono">{{ builderStore.totalCost }}</span>
        <span class="unit">PP</span>
      </div>
      <span class="structure-caption">{{ structureText }}</span>
    </header>

    <div class="inspector-divider"></div>

    <!-- ZONE 2: PRO FORMULA LEDGER (POWER POINT BREAKDOWN) -->
    <section class="inspector-section">
      <div class="inspector-section-header">
        <i class="ri-calculator-line section-icon"></i>
        <span class="section-title-text">Power Point Breakdown</span>
      </div>

      <div v-if="builderStore.breakdown" class="ledger-table">
        <!-- If Device -->
        <template v-if="builderStore.power.type === 'device'">
          <div class="ledger-row">
            <span class="ledger-label">Sub-Powers Raw Total:</span>
            <span class="ledger-val font-mono">{{ builderStore.breakdown.subtotalBeforeDiscount || 0 }} PP</span>
          </div>

          <div
            v-for="(sub, sIdx) in builderStore.breakdown.subPowerBreakdowns"
            :key="sub.id || sIdx"
            class="sub-breakdown-row"
          >
            <span class="sub-name-txt">• {{ sub.name }}:</span>
            <span class="sub-cost-txt font-mono">{{ sub.totalCost }} PP</span>
          </div>

          <div v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="ledger-row discount-row">
            <span class="ledger-label">
              Activation ({{ builderStore.power.activation === 'move' ? 'Move Action' : 'Standard Action' }}):
            </span>
            <span class="ledger-val discount font-mono">{{ builderStore.breakdown.activationCost }} PP</span>
          </div>

          <div class="ledger-row discount-row">
            <span class="ledger-label">
              {{ builderStore.power.deviceConfig?.type === 'easily_removable' ? 'Easily Removable (-2/5 PP):' : 'Removable (-1/5 PP):' }}
            </span>
            <span class="ledger-val discount font-mono">-{{ builderStore.breakdown.discount || 0 }} PP</span>
          </div>

          <div class="ledger-divider"></div>

          <div class="ledger-row total-row">
            <span class="ledger-label">Final Device Cost:</span>
            <span class="ledger-val highlight font-mono">{{ builderStore.totalCost }} PP</span>
          </div>
        </template>

        <!-- If Compound Power -->
        <template v-else-if="builderStore.power.type === 'compound'">
          <div class="ledger-row">
            <span class="ledger-label">Sub-Effects Total:</span>
            <span class="ledger-val font-mono">{{ builderStore.breakdown.effectsSum ?? builderStore.breakdown.subtotalEffects ?? 0 }} PP</span>
          </div>

          <div
            v-for="(sub, sIdx) in (builderStore.breakdown.compoundBreakdowns || builderStore.breakdown.subEffectBreakdowns || [])"
            :key="sub.id || sIdx"
            class="sub-breakdown-row"
          >
            <span class="sub-name-txt">
              • {{ sub.name }} (Rank {{ sub.ranks ?? sub.rank ?? 1 }}):
              <small v-if="sub.isPrimaryAction || sub.isPrimary" class="primary-badge">PRIMARY</small>
            </span>
            <span class="sub-cost-txt font-mono">{{ sub.totalCost ?? sub.cost }} PP</span>
          </div>

          <div v-if="(builderStore.power.sharedModifiers || []).length > 0" class="ledger-row">
            <span class="ledger-label">Suite Modifiers:</span>
            <span class="ledger-val font-mono">
              {{ (builderStore.breakdown.sharedFlatTotal ?? builderStore.breakdown.sharedModifiersCost ?? 0) >= 0 ? `+${builderStore.breakdown.sharedFlatTotal ?? builderStore.breakdown.sharedModifiersCost ?? 0}` : (builderStore.breakdown.sharedFlatTotal ?? builderStore.breakdown.sharedModifiersCost) }} PP
            </span>
          </div>

          <div v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="ledger-row discount-row">
            <span class="ledger-label">
              Activation ({{ builderStore.power.activation === 'move' ? 'Move Action' : 'Standard Action' }}):
            </span>
            <span class="ledger-val discount font-mono">{{ builderStore.breakdown.activationCost }} PP</span>
          </div>

          <div class="ledger-divider"></div>

          <div class="ledger-row total-row">
            <span class="ledger-label">Final Compound Cost:</span>
            <span class="ledger-val highlight font-mono">{{ builderStore.totalCost }} PP</span>
          </div>
        </template>

        <!-- Standard or Array -->
        <template v-else>
          <div class="ledger-row">
            <span class="ledger-label">
              Base Effect ({{ activeEffCost.divisor ? `1 PP/${activeEffCost.divisor} Rk` : `${activeEffCost.netPerRank} PP/Rk` }} × {{ builderStore.currentEditingEffect?.ranks ?? builderStore.currentEditingEffect?.rank ?? builderStore.power.mainEffect?.ranks ?? 1 }} Rk):
            </span>
            <span class="ledger-val font-mono">{{ activeEffCost.basePointCost }} PP</span>
          </div>

          <div v-if="activeEffCost.flatTotal !== 0" class="ledger-row">
            <span class="ledger-label">Flat Extras / Flaws:</span>
            <span class="ledger-val font-mono">{{ activeEffCost.flatTotal > 0 ? `+${activeEffCost.flatTotal}` : activeEffCost.flatTotal }} PP</span>
          </div>

          <div v-if="builderStore.power.linkedEffects?.length > 0" class="ledger-row">
            <span class="ledger-label">Linked Effects ({{ builderStore.power.linkedEffects.length }}):</span>
            <span class="ledger-val font-mono">+{{ builderStore.power.linkedEffects.reduce((s, l) => s + (calculateEffectCost(l, 0).totalCost), 0) }} PP</span>
          </div>

          <div v-if="(builderStore.power.alternateEffects || []).length > 0" class="ledger-row">
            <span class="ledger-label">Alternate Effects ({{ builderStore.power.alternateEffects.length }}):</span>
            <span class="ledger-val font-mono">+{{ (builderStore.power.alternateEffects || []).reduce((s, a) => s + (a.isDynamic ? 2 : 1), 0) }} PP</span>
          </div>

          <div v-if="builderStore.power.activation && builderStore.power.activation !== 'none'" class="ledger-row discount-row">
            <span class="ledger-label">
              Activation ({{ builderStore.power.activation === 'move' ? 'Move Action' : 'Standard Action' }}):
            </span>
            <span class="ledger-val discount font-mono">{{ builderStore.breakdown.activationCost }} PP</span>
          </div>

          <div class="ledger-divider"></div>

          <div class="ledger-row total-row">
            <span class="ledger-label">Final Power Cost:</span>
            <span class="ledger-val highlight font-mono">{{ builderStore.totalCost }} PP</span>
          </div>
        </template>
      </div>
    </section>

    <div class="inspector-divider"></div>

    <!-- ZONE 3: CHARACTER BUDGET & SEGMENTED DISTRIBUTION -->
    <section class="inspector-section">
      <div class="inspector-section-header">
        <i class="ri-pie-chart-2-line section-icon"></i>
        <span class="section-title-text">Character PP Spend</span>
        <span class="hero-pl-tag">PL {{ heroStore.character.powerLevel || 10 }}</span>
      </div>

      <!-- Budget Status Line -->
      <div class="budget-status-row">
        <div class="budget-spent-block">
          <span class="budget-sub-label">Projected Spend</span>
          <div class="budget-figures font-mono">
            <span class="num-spent" :class="{ 'over-budget': isOverBudget }">{{ projectedTotalSpentPP }}</span>
            <span class="num-slash">/</span>
            <span class="num-budget">{{ totalBudgetPP }}</span>
            <span class="num-unit">PP</span>
          </div>
        </div>
        <div class="budget-status-pill" :class="isOverBudget ? 'pill-over' : 'pill-ok'">
          <i :class="isOverBudget ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill'"></i>
          <span>{{ isOverBudget ? `${Math.abs(projectedRemainingPP)} PP Over` : `${projectedRemainingPP} PP Left` }}</span>
        </div>
      </div>

      <!-- Segmented Multi-Color Progress Meter -->
      <div
        class="segmented-meter-track"
        :title="`Abilities: ${heroStore.totalAbilityPP} PP, Defenses: ${heroStore.totalDefensePP} PP, Skills: ${heroStore.totalSkillPP} PP, Advantages: ${heroStore.totalAdvantagePP} PP, Powers: ${projectedPowersCost} PP`"
      >
        <div class="segment segment-abilities" :style="{ width: budgetPercentages.abilities + '%' }" title="Abilities"></div>
        <div class="segment segment-defenses" :style="{ width: budgetPercentages.defenses + '%' }" title="Defenses"></div>
        <div class="segment segment-skills" :style="{ width: budgetPercentages.skills + '%' }" title="Skills"></div>
        <div class="segment segment-advantages" :style="{ width: budgetPercentages.advantages + '%' }" title="Advantages"></div>
        <div class="segment segment-powers" :class="{ 'segment-over': isOverBudget }" :style="{ width: budgetPercentages.powers + '%' }" title="Powers & Devices"></div>
      </div>

      <!-- Delta Context Line -->
      <div class="spend-delta-row">
        <span class="delta-label">
          {{ isEditingExisting ? 'Modifying Power:' : 'New Power:' }}
        </span>
        <span class="delta-val font-mono" :class="powerCostDelta > 0 ? 'delta-increase' : powerCostDelta < 0 ? 'delta-decrease' : 'delta-zero'">
          {{ powerCostDelta > 0 ? `+${powerCostDelta}` : powerCostDelta }} PP
          <small v-if="isEditingExisting && originalPowerCost !== builderStore.totalCost" class="delta-prev">
            (was {{ originalPowerCost }} PP)
          </small>
        </span>
      </div>

      <!-- Category Allocation Distribution Grid -->
      <div class="allocation-grid">
        <div class="alloc-item">
          <span class="alloc-dot dot-abilities"></span>
          <span class="alloc-name">Abilities:</span>
          <span class="alloc-num font-mono">{{ heroStore.totalAbilityPP }} PP</span>
        </div>
        <div class="alloc-item">
          <span class="alloc-dot dot-defenses"></span>
          <span class="alloc-name">Defenses:</span>
          <span class="alloc-num font-mono">{{ heroStore.totalDefensePP }} PP</span>
        </div>
        <div class="alloc-item">
          <span class="alloc-dot dot-skills"></span>
          <span class="alloc-name">Skills:</span>
          <span class="alloc-num font-mono">{{ heroStore.totalSkillPP }} PP</span>
        </div>
        <div class="alloc-item">
          <span class="alloc-dot dot-advantages"></span>
          <span class="alloc-name">Advantages:</span>
          <span class="alloc-num font-mono">{{ heroStore.totalAdvantagePP }} PP</span>
        </div>
        <div class="alloc-item alloc-highlight">
          <span class="alloc-dot dot-powers"></span>
          <span class="alloc-name">Powers:</span>
          <span class="alloc-num font-mono highlight">
            {{ projectedPowersCost }} PP
            <small v-if="projectedPowersCost !== heroStore.totalPowerPP" class="alloc-sub">
              ({{ heroStore.totalPowerPP }} now)
            </small>
          </span>
        </div>
      </div>
    </section>

    <div class="inspector-divider"></div>

    <!-- ZONE 4: COMBAT PROFILE & TACTICAL VALIDATION -->
    <section class="inspector-section">
      <div class="inspector-section-header">
        <div class="header-title-group">
          <i class="ri-sword-line section-icon"></i>
          <span class="section-title-text">Combat Profile</span>
        </div>
        <!-- Inline PL Badge -->
        <span
          v-if="combatProfile?.plCompliance"
          class="inline-pl-badge"
          :class="combatProfile.plCompliance.isCompliant ? 'badge-pl-compliant' : 'badge-pl-exceeded'"
        >
          <i :class="combatProfile.plCompliance.isCompliant ? 'ri-shield-check-line' : 'ri-alert-line'"></i>
          {{ combatProfile.plCompliance.isCompliant ? `PL ${heroStore.character.powerLevel || 10} Valid` : 'Cap Exceeded' }}
        </span>
      </div>

      <!-- Active Effect Indicator Sub-Bar -->
      <div v-if="combatProfile.effectName" class="combat-target-indicator">
        <span class="target-indicator-label">Target:</span>
        <span class="target-indicator-name font-mono" :title="combatProfile.effectName">
          {{ combatProfile.effectName }}
        </span>
      </div>

      <div class="combat-grid">
        <!-- DC Check: Full Width Prominent Tile -->
        <div class="combat-tile dc-tile">
          <span class="tile-label">DC Check</span>
          <span class="tile-val font-mono" :title="combatProfile.dcDescription || (combatProfile.dc ? `DC ${combatProfile.dc}` : 'None')">
            {{ combatProfile.dcDescription || (combatProfile.dc ? `DC ${combatProfile.dc}` : 'None') }}
          </span>
        </div>
        <div class="combat-tile" :class="{ 'tile-range-modified': combatProfile?.rangeDetails?.isModified }">
          <div class="tile-label-row">
            <span class="tile-label">Range</span>
            <span
              v-if="combatProfile?.rangeDetails?.isModified && combatProfile.rangeDetails.effectiveRange !== combatProfile.rangeDetails.baseRange"
              class="tile-mod-tag"
              :title="combatProfile.rangeDetails.tooltip"
            >
              {{ combatProfile.rangeDetails.effectiveRange }}
            </span>
          </div>
          <span
            class="tile-val font-mono"
            :class="{ 'range-highlight': combatProfile?.rangeDetails?.isModified }"
            :title="combatProfile.rangeDetails?.tooltip || combatProfile.rangeDistance"
          >
            {{ combatProfile.rangeDistance }}
          </span>
        </div>
        <div class="combat-tile">
          <span class="tile-label">Type</span>
          <span class="tile-val" :title="combatProfile.isOffensive ? (combatProfile.attackBonus !== null ? `Offensive (+${combatProfile.attackBonus})` : 'Offensive') : 'Utility'">
            {{ combatProfile.isOffensive ? (combatProfile.attackBonus !== null ? `Offensive (+${combatProfile.attackBonus})` : 'Offensive') : 'Utility' }}
          </span>
        </div>
      </div>

      <!-- Warning Banner only if PL Cap is Exceeded -->
      <div
        v-if="combatProfile?.plCompliance && !combatProfile.plCompliance.isCompliant"
        class="pl-exceeded-alert"
      >
        <i class="ri-alert-line alert-icon"></i>
        <div class="alert-content">
          <span class="alert-title">Exceeds Power Level Cap</span>
          <span class="alert-msg">{{ combatProfile.plCompliance.warningMessage }}</span>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { useHeroStore } from '../../stores/heroStore.js';
import { calculateEffectCost, calculatePowerTotalCost } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();
const heroStore = useHeroStore();

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

const budgetPercentages = computed(() => {
  const total = totalBudgetPP.value || 150;
  return {
    abilities: Math.min(100, Math.max(0, ((heroStore.totalAbilityPP || 0) / total) * 100)),
    defenses: Math.min(100, Math.max(0, ((heroStore.totalDefensePP || 0) / total) * 100)),
    skills: Math.min(100, Math.max(0, ((heroStore.totalSkillPP || 0) / total) * 100)),
    advantages: Math.min(100, Math.max(0, ((heroStore.totalAdvantagePP || 0) / total) * 100)),
    powers: Math.min(100, Math.max(0, ((projectedPowersCost.value || 0) / total) * 100))
  };
});
</script>

<style scoped>
.cost-breakdown-sidebar {
  padding-bottom: 2rem;
}

/* Pro Inspector Panel Container (Single Cohesive Box, Zero Card-in-Card) */
.pro-inspector-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface, #0f172a);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-md, 6px);
  padding: 0.95rem 0.9rem 1.25rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

/* Subtle Interior Dividers */
.inspector-divider {
  height: 1px;
  background: var(--border-subtle, rgba(255, 255, 255, 0.07));
  margin: 0.65rem 0;
  width: 100%;
}

/* Zone 1: Minimalist Cost Header */
.inspector-cost-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.inspector-badge-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted, #94a3b8);
}

.inspector-badge-value {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.inspector-badge-value .number {
  font-size: 2.3rem;
  font-weight: 900;
  color: var(--accent-primary, #38bdf8);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.inspector-badge-value .unit {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-secondary, #cbd5e1);
}

.structure-caption {
  font-size: 0.74rem;
  color: var(--text-secondary, #cbd5e1);
  margin-top: 0.2rem;
  line-height: 1.35;
  word-break: break-word;
}

/* Generic Section Styles */
.inspector-section {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.inspector-section-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.section-icon {
  font-size: 0.9rem;
  color: var(--accent-primary, #38bdf8);
}

.section-title-text {
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-secondary, #cbd5e1);
  letter-spacing: 0.05em;
}

/* Zone 2: Formula Ledger */
.ledger-table {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ledger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.ledger-label {
  color: var(--text-secondary, #cbd5e1);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger-val {
  font-weight: 700;
  color: var(--text-primary, #fff);
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
  color: var(--text-muted, #94a3b8);
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
  color: var(--text-secondary, #cbd5e1);
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

.discount-row .discount {
  color: #34d399;
}

.ledger-divider {
  height: 1px;
  background: var(--border-subtle, rgba(255, 255, 255, 0.06));
  margin: 0.2rem 0;
}

.total-row {
  font-size: 0.82rem;
  padding-top: 0.15rem;
}

.total-row .highlight {
  color: var(--accent-primary, #38bdf8);
  font-size: 0.95rem;
  font-weight: 900;
}

/* Zone 3: Character Budget & Segmented Distribution */
.hero-pl-tag {
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  background: rgba(0, 111, 184, 0.2);
  border: 1px solid rgba(0, 111, 184, 0.4);
  border-radius: var(--radius-xs, 4px);
  color: #38bdf8;
  letter-spacing: 0.04em;
}

.budget-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.budget-spent-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.budget-sub-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted, #94a3b8);
  letter-spacing: 0.05em;
}

.budget-figures {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  line-height: 1.1;
}

.num-spent {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-primary, #fff);
  font-variant-numeric: tabular-nums;
}

.num-spent.over-budget {
  color: #f87171;
}

.num-slash {
  font-size: 0.85rem;
  color: var(--text-muted, #94a3b8);
}

.num-budget {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-secondary, #cbd5e1);
  font-variant-numeric: tabular-nums;
}

.num-unit {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  margin-left: 0.1rem;
}

.budget-status-pill {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.22rem 0.55rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.budget-status-pill.pill-ok {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.budget-status-pill.pill-over {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

/* Multi-Color Segmented Meter Track */
.segmented-meter-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  display: flex;
  overflow: hidden;
  margin: 0.2rem 0;
}

.segment {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.segment-abilities {
  background: #38bdf8;
}

.segment-defenses {
  background: #10b981;
}

.segment-skills {
  background: #a855f7;
}

.segment-advantages {
  background: #f59e0b;
}

.segment-powers {
  background: #006fb8;
}

.segment-powers.segment-over {
  background: #ef4444;
}

/* Delta Context Line */
.spend-delta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  padding-top: 0.15rem;
}

.delta-label {
  color: var(--text-muted, #94a3b8);
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
  color: var(--text-muted, #94a3b8);
}

.delta-prev {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-muted, #94a3b8);
  margin-left: 0.2rem;
}

/* Allocation Grid (Clean 2-Column Distribution) */
.allocation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem 0.6rem;
  padding-top: 0.3rem;
  border-top: 1px dashed var(--border-subtle, rgba(255, 255, 255, 0.06));
}

.alloc-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
}

.alloc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-abilities { background: #38bdf8; }
.dot-defenses { background: #10b981; }
.dot-skills { background: #a855f7; }
.dot-advantages { background: #f59e0b; }
.dot-powers { background: #006fb8; }

.alloc-name {
  color: var(--text-muted, #94a3b8);
}

.alloc-num {
  margin-left: auto;
  font-weight: 700;
  color: var(--text-secondary, #cbd5e1);
  font-variant-numeric: tabular-nums;
}

.alloc-item.alloc-highlight {
  grid-column: 1 / -1;
  padding-top: 0.15rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.alloc-item.alloc-highlight .alloc-name {
  color: var(--text-primary, #fff);
  font-weight: 700;
}

.alloc-item.alloc-highlight .alloc-num.highlight {
  color: var(--accent-primary, #38bdf8);
  font-weight: 800;
}

.alloc-sub {
  font-size: 0.63rem;
  color: var(--text-muted, #94a3b8);
  font-weight: 500;
}

/* Zone 4: Combat Profile & PL Check */
.header-title-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.combat-target-indicator {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: var(--radius-xs, 4px);
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
}

.target-indicator-label {
  color: var(--text-muted, #94a3b8);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.62rem;
  letter-spacing: 0.04em;
}

.target-indicator-name {
  color: var(--accent-primary, #38bdf8);
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-pl-badge {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-xs, 4px);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-pl-compliant {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.badge-pl-exceeded {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.combat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
}

.combat-tile {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xs, 4px);
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.combat-tile.dc-tile {
  grid-column: span 2;
  background: rgba(56, 189, 248, 0.03);
  border-color: rgba(56, 189, 248, 0.15);
}

.tile-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
}

.tile-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tile-mod-tag {
  font-size: 0.58rem;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 3px;
  padding: 0.05rem 0.28rem;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.combat-tile.tile-range-modified {
  border-color: rgba(56, 189, 248, 0.25);
  background: rgba(56, 189, 248, 0.03);
}

.tile-val {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--text-primary, #fff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-val.range-highlight {
  color: #7dd3fc;
}

.combat-tile.dc-tile .tile-val {
  font-size: 0.82rem;
  color: var(--accent-primary, #38bdf8);
}

.pl-exceeded-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 0.5rem 0.65rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-xs, 4px);
  margin-top: 0.25rem;
}

.alert-icon {
  font-size: 1rem;
  color: #f87171;
  flex-shrink: 0;
  margin-top: 0.05rem;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.alert-title {
  font-size: 0.74rem;
  font-weight: 800;
  color: #f87171;
}

.alert-msg {
  font-size: 0.68rem;
  color: #fca5a5;
  line-height: 1.3;
}
</style>
