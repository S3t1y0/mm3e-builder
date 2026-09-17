<template>
  <div class="wizard-page">
    <!-- STEPPER PROGRESS BAR -->
    <div class="card mb-4" style="padding: 0.85rem 1.25rem;">
      <div class="stepper-track">
        <button
          v-for="step in steps"
          :key="step.id"
          class="step-node"
          :class="{
            active: currentStep === step.id,
            completed: currentStep > step.id
          }"
          @click="currentStep = step.id"
        >
          <div class="step-circle">
            <i v-if="currentStep > step.id" class="ri-check-line" style="font-size: 0.95rem;"></i>
            <span v-else class="tabular-nums">{{ step.id }}</span>
          </div>
          <div class="step-meta">
            <span class="step-num">Step {{ step.id }}</span>
            <span class="step-name">{{ step.title }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- MAIN TWO-COLUMN SPLIT WORKSPACE -->
    <div class="wizard-layout-split">
      <!-- LEFT: ACTIVE STEP CANVAS (65%) -->
      <div class="wizard-canvas">
        <component :is="activeStepComponent" />

        <!-- BOTTOM NAV BAR -->
        <div class="wizard-footer-nav">
          <button
            class="btn btn-secondary"
            :disabled="currentStep <= 1"
            @click="currentStep--"
          >
            <i class="ri-arrow-left-line"></i> Previous Step
          </button>

          <div class="tabular-nums" style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">
            Step {{ currentStep }} of {{ steps.length }}
          </div>

          <button
            v-if="currentStep < steps.length"
            class="btn btn-primary"
            @click="currentStep++"
          >
            Next Step <i class="ri-arrow-right-line"></i>
          </button>
          <button
            v-else
            class="btn btn-primary"
            style="background: #10b981; border-color: #059669;"
            @click="finishWizard"
          >
            <i class="ri-check-double-line"></i> Finish & Open Sheet
          </button>
        </div>
      </div>

      <!-- RIGHT: ADVISOR SIDEBAR (35%) -->
      <aside class="wizard-advisor-sidebar">
        <!-- BUDGET OVERVIEW CARD -->
        <div class="card mb-3" style="padding: 1.15rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
              Power Point Budget
            </div>
            <span class="badge badge-primary tabular-nums" style="font-size: 0.7rem;">PL {{ heroStore.character.powerLevel }}</span>
          </div>

          <!-- PP PROGRESS BAR -->
          <div style="margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem;">
              <span style="color: var(--text-secondary);">PP Spent</span>
              <span class="tabular-nums" :style="{ color: heroStore.remainingPP < 0 ? '#ef4444' : '#fff' }">
                {{ heroStore.totalSpentPP }} / {{ heroStore.totalBudgetPP }} PP
              </span>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: var(--radius-xs); overflow: hidden;">
              <div
                style="height: 100%; width: 100%; transform-origin: left; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);"
                :style="{
                  transform: `scaleX(${Math.min(1, Math.max(0, (heroStore.totalSpentPP / Math.max(1, heroStore.totalBudgetPP))))})`,
                  background: heroStore.remainingPP < 0 ? '#ef4444' : 'var(--accent-primary)'
                }"
              ></div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); padding-top: 0.35rem;">
            <span>Remaining:</span>
            <strong class="tabular-nums" :style="{ color: heroStore.remainingPP < 0 ? '#ef4444' : '#10b981' }">
              {{ heroStore.remainingPP }} PP
            </strong>
          </div>
        </div>

        <!-- PP ALLOCATION CHIPS -->
        <div class="card mb-3" style="padding: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.65rem;">
            Point Allocation by Category
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.78rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #60a5fa;">Abilities</span>
              <strong class="tabular-nums" style="color: #fff;">{{ heroStore.abilitiesCost }} PP</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #34d399;">Defenses</span>
              <strong class="tabular-nums" style="color: #fff;">{{ heroStore.defensesCost }} PP</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #fbbf24;">Skills</span>
              <strong class="tabular-nums" style="color: #fff;">{{ heroStore.skillsCost }} PP</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #f472b6;">Advantages</span>
              <strong class="tabular-nums" style="color: #fff;">{{ heroStore.advantagesCost }} PP</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #38bdf8;">Powers & Devices</span>
              <strong class="tabular-nums" style="color: #fff;">{{ heroStore.powersCost }} PP</strong>
            </div>
          </div>
        </div>

        <!-- STEP STRATEGY ADVICE -->
        <div class="card" style="padding: 1rem; border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.04);">
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 800; color: #60a5fa; margin-bottom: 0.5rem;">
            <i class="ri-lightbulb-line"></i> Advisor Tip: {{ activeStepInfo.title }}
          </div>
          <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.55; margin: 0;">
            {{ activeStepInfo.tip }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHeroStore } from '../../stores/heroStore.js';
import { useUiStore } from '../../stores/uiStore.js';

import StepConcept from './StepConcept.vue';
import StepAbilities from './StepAbilities.vue';
import StepDefenses from './StepDefenses.vue';
import StepSkills from './StepSkills.vue';
import StepAdvantages from './StepAdvantages.vue';
import StepPowers from './StepPowers.vue';
import StepEquipment from './StepEquipment.vue';
import StepComplications from './StepComplications.vue';
import StepReview from './StepReview.vue';

const heroStore = useHeroStore();
const uiStore = useUiStore();

const currentStep = ref(1);

const steps = [
  { id: 1, title: 'Concept', component: StepConcept, tip: 'Start with a strong narrative concept or select one of the 10 official Archetypes for a balanced baseline point distribution.' },
  { id: 2, title: 'Abilities', component: StepAbilities, tip: 'Focus points on 2-3 primary attributes. Combat abilities (FGT/DEX) are vital for attack accuracy.' },
  { id: 3, title: 'Defenses', component: StepDefenses, tip: 'Ensure Dodge+Toughness, Parry+Toughness, and Fortitude+Will totals do not exceed 2x your Power Level.' },
  { id: 4, title: 'Skills', component: StepSkills, tip: 'Skills cost 1 PP per 2 ranks. Add Close Combat or Ranged Combat skills to specialize with specific weapons or powers.' },
  { id: 5, title: 'Advantages', component: StepAdvantages, tip: 'Power Attack and All-out Attack provide tactical versatility by trading attack bonuses for effect rank or defense.' },
  { id: 6, title: 'Powers', component: StepPowers, tip: 'Group alternate powers into an Array at a fraction of the cost (+1 PP per alternate slot).' },
  { id: 7, title: 'Equipment', component: StepEquipment, tip: 'Equipment is purchased with Equipment Points (EP) at 1 PP = 5 EP. Vehicles and Headquarters can also be shared with team members.' },
  { id: 8, title: 'Complications', component: StepComplications, tip: 'Complications provide the GM dramatic story hooks that award valuable Hero Points during play.' },
  { id: 9, title: 'Review', component: StepReview, tip: 'Audit your total PP budget, EP equipment capacity, and verify all Power Level caps before finalizing your hero sheet.' }
];

const activeStepComponent = computed(() => {
  const step = steps.find(s => s.id === currentStep.value);
  return step ? step.component : StepConcept;
});

const activeStepInfo = computed(() => {
  const step = steps.find(s => s.id === currentStep.value);
  return step || steps[0];
});

function finishWizard() {
  uiStore.setActiveTab('sheet');
  uiStore.showToast(`Hero ${heroStore.character.name || 'Hero'} is ready!`, 'success');
}
</script>

<style scoped>
.wizard-page {
  width: 100%;
}

.stepper-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow-x: auto;
  gap: 0.75rem;
  scrollbar-width: thin;
  position: relative;
}

.step-node {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  transition-property: background-color, transform, opacity;
  transition-duration: 0.2s;
  white-space: nowrap;
}

.step-node:hover {
  background: rgba(255, 255, 255, 0.06);
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-secondary);
  transition-property: border-color, background-color, color, box-shadow;
  transition-duration: 0.2s;
  flex-shrink: 0;
}

.step-node.active .step-circle {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: #fff;
}

.step-node.completed .step-circle {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.step-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
}

.step-num {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.step-node.active .step-num {
  color: var(--accent-primary);
}

.step-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #fff;
}

.wizard-layout-split {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

.wizard-canvas {
  min-width: 0;
}

.wizard-advisor-sidebar {
  position: sticky;
  top: 4.5rem;
  max-height: calc(100vh - 5.5rem);
  max-height: calc(100dvh - 5.5rem);
  overflow-y: auto;
  scrollbar-width: thin;
}

@media (max-width: 1024px) {
  .wizard-layout-split {
    grid-template-columns: 1fr;
  }
  .wizard-advisor-sidebar {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
}

.wizard-footer-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}
</style>
