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
    </div>

    <!-- Math Formula Card -->
    <div class="sidebar-section-card">
      <div class="section-title">
        <i class="ri-calculator-line"></i>
        <span>Cost Calculation Math</span>
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
            <span class="line-label">Alternate Stunts ({{ builderStore.power.alternateEffects.length }}):</span>
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
import { computed } from 'vue';
import { usePowerBuilderStore } from '../../stores/powerBuilderStore.js';
import { calculateEffectCost } from '../../rules/powerEngine.js';

const builderStore = usePowerBuilderStore();

const structureText = computed(() => {
  const t = builderStore.power.type;
  let base = '';
  if (t === 'device') {
    const dType = builderStore.power.deviceConfig?.type;
    base = `Device Container (${dType === 'easily_removable' ? 'Easily Removable' : 'Removable'})`;
  } else if (builderStore.power.alternateEffects?.length > 0) {
    base = `Standard Power with Array (${builderStore.power.alternateEffects.length} Stunts)`;
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
  gap: 1rem;
  width: 320px;
  flex-shrink: 0;
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
  font-size: 0.76rem;
}

.line-label {
  color: var(--text-secondary);
}

.line-val {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.sub-breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  padding-left: 0.5rem;
  color: var(--text-muted);
}

.sub-cost-txt {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--text-secondary);
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
  font-size: 0.76rem;
}

.c-label {
  color: var(--text-muted);
}

.c-val {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.c-val.dc-val {
  color: #fbbf24;
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
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.pl-compliance-banner.exceeded {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
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
</style>
