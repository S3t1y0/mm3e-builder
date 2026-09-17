<template>
  <div class="step-review-container">
    <div class="step-banner">
      <div class="step-banner-icon"><i class="ri-checkbox-circle-line"></i></div>
      <div>
        <h3 class="step-title">Character Review & Audit</h3>
        <p class="step-subtitle">Audit Power Level caps compliance, verify point allocations (PP), check equipment capacity (EP), and complete final hero validation.</p>
      </div>
    </div>

    <!-- AUDIT SUMMARY CARDS -->
    <div class="audit-grid mb-4">
      <!-- 1. POINT BUDGET STATUS -->
      <div class="card audit-card" :class="heroStore.remainingPP < 0 ? 'card-danger' : 'card-success'">
        <div class="audit-icon">
          <i :class="heroStore.remainingPP < 0 ? 'ri-error-warning-line' : 'ri-check-double-line'"></i>
        </div>
        <div>
          <div class="audit-label">PP Budget Balance</div>
          <div class="audit-val tabular-nums">
            {{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP
            <span v-if="heroStore.remainingPP >= 0" style="color: #10b981; font-size: 0.85rem;">({{ heroStore.remainingPP }} PP Remaining)</span>
            <span v-else style="color: #ef4444; font-size: 0.85rem;">({{ Math.abs(heroStore.remainingPP) }} PP OVER BUDGET)</span>
          </div>
        </div>
      </div>

      <!-- 2. PL DEFENSE CAPS -->
      <div class="card audit-card" :class="isDefenseCapsValid ? 'card-success' : 'card-danger'">
        <div class="audit-icon">
          <i :class="isDefenseCapsValid ? 'ri-shield-check-line' : 'ri-shield-flash-line'"></i>
        </div>
        <div>
          <div class="audit-label">Defense Caps (PL {{ heroStore.character.powerLevel }})</div>
          <div class="audit-val">
            {{ isDefenseCapsValid ? 'All Defenses Within Limits' : 'One or More Caps Exceeded' }}
          </div>
        </div>
      </div>

      <!-- 3. COMPLICATIONS CHECK -->
      <div class="card audit-card" :class="isComplicationsValid ? 'card-success' : 'card-warning'">
        <div class="audit-icon">
          <i :class="isComplicationsValid ? 'ri-heart-pulse-line' : 'ri-alert-line'"></i>
        </div>
        <div>
          <div class="audit-label">Complications Requirement</div>
          <div class="audit-val tabular-nums">
            {{ heroStore.character.complications?.length || 0 }} Complications Defined
            <span v-if="!isComplicationsValid" style="color: #f59e0b; font-size: 0.8rem;">(Minimum 2 recommended)</span>
          </div>
        </div>
      </div>

      <!-- 4. EQUIPMENT CAPACITY (EP) -->
      <div class="card audit-card" :class="heroStore.equipmentBudget.isOverBudget ? 'card-warning' : 'card-success'">
        <div class="audit-icon">
          <i :class="heroStore.equipmentBudget.isOverBudget ? 'ri-alert-line' : 'ri-tools-line'"></i>
        </div>
        <div>
          <div class="audit-label">Equipment Capacity (EP)</div>
          <div class="audit-val tabular-nums">
            {{ heroStore.equipmentBudget.totalEP }} / {{ heroStore.equipmentBudget.maxEP }} EP
            <span v-if="!heroStore.equipmentBudget.isOverBudget" style="color: #10b981; font-size: 0.85rem;">(Capacity OK)</span>
            <span v-else style="color: #f59e0b; font-size: 0.85rem;">(Deficit: {{ heroStore.equipmentBudget.totalEP - heroStore.equipmentBudget.maxEP }} EP)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ITEMIZED POINT BREAKDOWN -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title">Point Allocation Breakdown</h4>
      <div class="breakdown-grid">
        <div class="breakdown-item">
          <span class="breakdown-label">Abilities</span>
          <span class="breakdown-val tabular-nums">{{ heroStore.abilitiesCost }} PP</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Defenses Bought</span>
          <span class="breakdown-val tabular-nums">{{ heroStore.defensesCost }} PP</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Skills</span>
          <span class="breakdown-val tabular-nums">{{ heroStore.skillsCost }} PP</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Advantages</span>
          <span class="breakdown-val tabular-nums">{{ heroStore.advantagesCost }} PP</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Powers & Devices</span>
          <span class="breakdown-val tabular-nums">{{ heroStore.powersCost }} PP</span>
        </div>
        <div class="breakdown-item highlight">
          <span class="breakdown-label">TOTAL SPENT</span>
          <span class="breakdown-val tabular-nums" style="color: var(--accent-primary);">{{ heroStore.totalSpentPP }} PP</span>
        </div>
      </div>
    </div>

    <!-- ACTION CALLOUT -->
    <div class="card launch-ready-card" style="padding: 1.5rem; text-align: center; background: var(--bg-surface); border: 1px solid rgba(16, 185, 129, 0.3);">
      <div class="launch-badge">
        <i class="ri-checkbox-circle-fill"></i> Build Complete
      </div>
      <h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0.6rem 0 0.35rem;">
        Hero Ready for Play
      </h4>
      <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 520px; margin: 0 auto 1.25rem; line-height: 1.5;">
        Your hero build is ready. You can switch to the character sheet anytime to view traits, roll dice, and manage attacks.
      </p>
      <button class="btn btn-primary btn-lg" style="padding: 0.75rem 2rem; font-weight: 800; box-shadow: var(--shadow-sm);" @click="finishWizard">
        <i class="ri-file-user-line"></i> Open Character Sheet
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const maxCap = computed(() => (heroStore.character.powerLevel || 10) * 2);

const isDefenseCapsValid = computed(() => {
  const cap = maxCap.value;
  const dodge = (heroStore.effectiveAbilities.AGL || 0) + (heroStore.character.defensesBought.DODGE || 0);
  const parry = (heroStore.effectiveAbilities.FGT || 0) + (heroStore.character.defensesBought.PARRY || 0);
  const fort = (heroStore.effectiveAbilities.STA || 0) + (heroStore.character.defensesBought.FORTITUDE || 0);
  const will = (heroStore.effectiveAbilities.AWE || 0) + (heroStore.character.defensesBought.WILL || 0);
  const tough = (heroStore.effectiveAbilities.STA || 0) + (heroStore.protectionBonus || 0);

  return (dodge + tough <= cap) && (parry + tough <= cap) && (fort + will <= cap);
});

const isComplicationsValid = computed(() => {
  return (heroStore.character.complications || []).length >= 2;
});

function finishWizard() {
  uiStore.setActiveTab('sheet');
  uiStore.showToast(`Hero ${heroStore.character.name || 'Hero'} is ready!`, 'success');
}
</script>

<style scoped>
.step-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
}

.step-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #34d399;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.step-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.5;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.audit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .audit-grid {
    grid-template-columns: 1fr;
  }
}

.audit-card {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-radius: var(--radius-md);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card-success {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.05);
}

.card-danger {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}

.card-warning {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}

.audit-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.card-success .audit-icon {
  color: #34d399;
  background: rgba(16, 185, 129, 0.2);
}

.card-danger .audit-icon {
  color: #f87171;
  background: rgba(239, 68, 68, 0.2);
}

.card-warning .audit-icon {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.2);
}

.audit-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.audit-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  margin-top: 0.15rem;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}

@media (max-width: 768px) {
  .breakdown-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
}

.breakdown-item {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.breakdown-item:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.breakdown-item.highlight {
  border-color: var(--accent-primary);
  background: rgba(220, 38, 38, 0.08);
}

.breakdown-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.breakdown-val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  margin-top: 0.25rem;
}

.launch-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-xs);
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
