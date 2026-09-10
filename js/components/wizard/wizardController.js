// js/components/wizard/wizardController.js
import { store } from '../../state.js';
import { renderStepConcept } from './stepConcept.js';
import { renderStepAbilities } from './stepAbilities.js';
import { renderStepDefenses } from './stepDefenses.js';
import { renderStepSkills } from './stepSkills.js';
import { renderStepAdvantages } from './stepAdvantages.js';
import { renderStepPowers } from './stepPowers.js';
import { renderStepResources } from './stepResources.js';
import { renderStepReview } from './stepReview.js';

export const WIZARD_STEPS = [
  { id: 1, title: 'Concept', icon: 'ri-user-star-line', shortDesc: 'Identity & PL' },
  { id: 2, title: 'Abilities', icon: 'ri-heart-pulse-line', shortDesc: '8 Core Stats' },
  { id: 3, title: 'Defenses', icon: 'ri-shield-check-line', shortDesc: 'Caps & Sliders' },
  { id: 4, title: 'Skills', icon: 'ri-briefcase-4-line', shortDesc: 'd20 Checks' },
  { id: 5, title: 'Advantages', icon: 'ri-medal-line', shortDesc: 'Feats & Talents' },
  { id: 6, title: 'Powers', icon: 'ri-flashlight-line', shortDesc: 'Superhuman Studio' },
  { id: 7, title: 'Resources', icon: 'ri-car-line', shortDesc: 'Equipment & HQ' },
  { id: 8, title: 'Review', icon: 'ri-checkbox-circle-line', shortDesc: 'Audit & Finalize' }
];

let currentStep = 1;
let tabSwitchCallback = null;

export function initWizard(container, onSwitchTab) {
  tabSwitchCallback = onSwitchTab;
  renderWizard(container);
}

export function renderWizard(container, onSwitchTab) {
  if (onSwitchTab) tabSwitchCallback = onSwitchTab;
  if (!container) return;

  const char = store.character;
  const pl = char.powerLevel;
  const budget = store.getTotalBudgetPP();
  const spent = store.getTotalSpentPP();
  const remaining = store.getRemainingPP();

  container.innerHTML = `
    <div class="wizard-view-container">
      <!-- 1. STEPPER PROGRESS HEADER -->
      <div class="wizard-stepper-wrapper">
        <div class="wizard-stepper" id="wizard-stepper-bar">
          ${WIZARD_STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            return `
              <button class="stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-step="${step.id}" title="${step.title}: ${step.shortDesc}">
                <div class="stepper-bubble">
                  ${isCompleted ? '<i class="ri-check-line"></i>' : step.id}
                </div>
                <div class="stepper-info">
                  <span class="stepper-step-num">Step ${step.id}</span>
                  <span class="stepper-title">${step.title}</span>
                </div>
              </button>
              ${idx < WIZARD_STEPS.length - 1 ? '<div class="stepper-divider"></div>' : ''}
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. TWO-COLUMN SPLIT WORKSPACE -->
      <div class="wizard-layout">
        <!-- CANVAS (LEFT 65%) -->
        <div class="wizard-canvas" id="wizard-step-canvas">
          <!-- Step module renders here -->
        </div>

        <!-- ADVISOR SIDEBAR (RIGHT 35%) -->
        <aside class="wizard-advisor">
          <!-- Live Character Mini Card -->
          <div class="advisor-card">
            <div class="advisor-header">
              <i class="ri-shield-user-fill advisor-icon"></i>
              <div>
                <h4 class="advisor-title">${char.name || 'Hero Name'}</h4>
                <span style="font-size: 0.72rem; color: var(--accent-secondary); font-weight: 600;">
                  Power Level ${pl} • ${budget} PP Budget
                </span>
              </div>
            </div>

            <!-- PP Allocation Breakdown -->
            <div class="advisor-budget-chart">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
                <span>Total Spent</span>
                <span style="color: ${remaining >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)'};">
                  ${spent} / ${budget} PP
                </span>
              </div>

              <!-- Abilities -->
              <div class="budget-bar-group">
                <div class="budget-bar-label">
                  <span>Abilities</span>
                  <span>${store.getTotalAbilityPP()} PP</span>
                </div>
                <div class="budget-bar-track">
                  <div class="budget-bar-progress" style="width: ${budget > 0 ? (store.getTotalAbilityPP() / budget) * 100 : 0}%; background: var(--accent-primary);"></div>
                </div>
              </div>

              <!-- Defenses -->
              <div class="budget-bar-group">
                <div class="budget-bar-label">
                  <span>Defenses</span>
                  <span>${store.getTotalDefensePP()} PP</span>
                </div>
                <div class="budget-bar-track">
                  <div class="budget-bar-progress" style="width: ${budget > 0 ? (store.getTotalDefensePP() / budget) * 100 : 0}%; background: var(--accent-secondary);"></div>
                </div>
              </div>

              <!-- Skills -->
              <div class="budget-bar-group">
                <div class="budget-bar-label">
                  <span>Skills</span>
                  <span>${store.getTotalSkillPP()} PP</span>
                </div>
                <div class="budget-bar-track">
                  <div class="budget-bar-progress" style="width: ${budget > 0 ? (store.getTotalSkillPP() / budget) * 100 : 0}%; background: var(--accent-emerald);"></div>
                </div>
              </div>

              <!-- Advantages -->
              <div class="budget-bar-group">
                <div class="budget-bar-label">
                  <span>Advantages</span>
                  <span>${store.getTotalAdvantagePP()} PP</span>
                </div>
                <div class="budget-bar-track">
                  <div class="budget-bar-progress" style="width: ${budget > 0 ? (store.getTotalAdvantagePP() / budget) * 100 : 0}%; background: var(--accent-amber);"></div>
                </div>
              </div>

              <!-- Powers -->
              <div class="budget-bar-group">
                <div class="budget-bar-label">
                  <span>Powers</span>
                  <span>${store.getTotalPowerPP()} PP</span>
                </div>
                <div class="budget-bar-track">
                  <div class="budget-bar-progress" style="width: ${budget > 0 ? (store.getTotalPowerPP() / budget) * 100 : 0}%; background: var(--accent-pink);"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step Contextual Guidance -->
          <div class="advisor-card">
            <div class="advisor-header">
              <i class="ri-lightbulb-line advisor-icon" style="color: var(--accent-amber);"></i>
              <div>
                <h4 class="advisor-title">Stage Tips & Rules</h4>
                <span style="font-size: 0.72rem; color: var(--text-muted);">Step ${currentStep}: ${WIZARD_STEPS[currentStep - 1].title}</span>
              </div>
            </div>
            <div class="advisor-tips-box">
              ${getStepGuidance(currentStep, char)}
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- 3. PERSISTENT FLOATING WIZARD DOCK (BOTTOM BAR) -->
    <div class="wizard-dock-bar">
      <div class="dock-left-actions">
        <button id="wiz-dock-prev" class="btn btn-secondary btn-sm" ${currentStep <= 1 ? 'disabled style="opacity: 0.5; pointer-events: none;"' : ''}>
          <i class="ri-arrow-left-line"></i> Back: ${currentStep > 1 ? WIZARD_STEPS[currentStep - 2].title : 'Start'}
        </button>
      </div>

      <div class="dock-center-pp-meter">
        <div class="pp-metric-tag">
          <span class="label">Spent:</span>
          <span class="val">${spent} / ${budget} PP</span>
        </div>
        <div style="width: 1px; height: 16px; background: var(--border-subtle);"></div>
        <div class="pp-metric-tag">
          <span class="label">Remaining:</span>
          <span class="val ${remaining > 0 ? 'positive' : remaining < 0 ? 'negative' : ''}">
            ${remaining >= 0 ? `${remaining} PP` : `${remaining} PP (Over)`}
          </span>
        </div>
      </div>

      <div class="dock-right-actions">
        ${currentStep < 8 ? `
          <button id="wiz-dock-next" class="btn btn-primary btn-sm">
            Next: ${WIZARD_STEPS[currentStep].title} <i class="ri-arrow-right-line"></i>
          </button>
        ` : `
          <button id="wiz-dock-finish" class="btn btn-primary btn-sm" style="background: var(--accent-emerald); border-color: var(--accent-emerald);">
            <i class="ri-checkbox-circle-line"></i> Finalize Character
          </button>
        `}
      </div>
    </div>
  `;

  // Render the active step canvas
  const canvas = container.querySelector('#wizard-step-canvas');
  renderActiveStepCanvas(canvas);

  // Stepper Header Clicks
  container.querySelectorAll('.stepper-item').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep = parseInt(btn.dataset.step, 10);
      renderWizard(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Dock Navigation Buttons
  document.getElementById('wiz-dock-prev')?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      renderWizard(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('wiz-dock-next')?.addEventListener('click', () => {
    if (currentStep < 8) {
      currentStep++;
      renderWizard(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('wiz-dock-finish')?.addEventListener('click', () => {
    if (typeof tabSwitchCallback === 'function') {
      tabSwitchCallback('sheet');
    }
  });
}

function renderActiveStepCanvas(canvas) {
  if (!canvas) return;

  switch (currentStep) {
    case 1:
      renderStepConcept(canvas);
      break;
    case 2:
      renderStepAbilities(canvas);
      break;
    case 3:
      renderStepDefenses(canvas);
      break;
    case 4:
      renderStepSkills(canvas);
      break;
    case 5:
      renderStepAdvantages(canvas);
      break;
    case 6:
      renderStepPowers(canvas);
      break;
    case 7:
      renderStepResources(canvas);
      break;
    case 8:
      renderStepReview(canvas, () => {
        if (typeof tabSwitchCallback === 'function') {
          tabSwitchCallback('sheet');
        }
      });
      break;
    default:
      renderStepConcept(canvas);
  }
}

function getStepGuidance(step, char) {
  const pl = char.powerLevel;
  switch (step) {
    case 1:
      return `
        <strong>Power Level ${pl} Standard:</strong><br>
        Standard superheroes in Mutants & Masterminds operate at <strong>PL 10 (150 PP)</strong>.
        You can choose an archetype template like <em>Battlesuit</em> or <em>Speedster</em> for instant balanced stats, or start completely from scratch!
      `;
    case 2:
      return `
        <strong>Ability Costs:</strong><br>
        Each rank costs <strong>2 PP</strong>. Ranks from 1–4 represent normal to peak human potential, while ranks 5+ are superhuman.<br><br>
        <em>Tip:</em> For a PL ${pl} hero, typical ability point budgets range between <strong>30–50 PP</strong>.
      `;
    case 3:
      return `
        <strong>The Rule of Caps:</strong><br>
        In M&M 3e, defense totals are capped in pairs at <strong>2 × PL (${pl * 2})</strong>:<br>
        • Dodge + Toughness ≤ ${pl * 2}<br>
        • Parry + Toughness ≤ ${pl * 2}<br>
        • Fortitude + Will ≤ ${pl * 2}<br>
        Trade-offs allow you to be nimble (high Dodge) or brick-like (high Toughness)!
      `;
    case 4:
      return `
        <strong>Skill Economy:</strong><br>
        Skills cost only <strong>1 PP for every 2 Ranks</strong>. Your total bonus when rolling a d20 is <em>Ability Modifier + Ranks</em>.<br><br>
        <em>Tip:</em> Pick Close Combat or Ranged Combat for specialized weapon or power accuracy.
      `;
    case 5:
      return `
        <strong>Advantage Synergies:</strong><br>
        Advantages cost <strong>1 PP per rank</strong>. Crucial advantages include <em>Equipment</em> (for weapons/gear), <em>Improved Initiative</em> (+4 reaction speed), and <em>Power Attack</em>.
      `;
    case 6:
      return `
        <strong>Powers Studio:</strong><br>
        Powers are the heart of your superhero! Click <em>Open Power Studio</em> to combine 41 official SRD effects with Extras, Flaws, and Alternate Effect Arrays.
      `;
    case 7:
      return `
        <strong>Equipment Points (EP):</strong><br>
        Purchased items use Equipment Points (EP), not direct PP. 1 Rank of the <em>Equipment</em> advantage provides 5 EP. Use the <em>Auto-Sync</em> button to easily balance your equipment ranks.
      `;
    case 8:
      return `
        <strong>Audit Checklist:</strong><br>
        Confirm that your PP balance equals 0 unspent points and that all defense pairs comply with PL ${pl} limits. When ready, click <em>Open in Full Character Sheet</em> or preview the official Roll20 sheet!
      `;
    default:
      return 'Follow each step to build your superhero.';
  }
}
