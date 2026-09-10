// js/components/wizard/stepAbilities.js
import { store } from '../../state.js';
import { ABILITIES, ABILITY_COST_PER_RANK } from '../../rules/abilities.js';

function getBenchmarkLabel(val) {
  if (val <= -2) return 'Debilitated (-2 or lower)';
  if (val === -1) return 'Below Average (-1)';
  if (val === 0) return 'Human Norm (0)';
  if (val === 1 || val === 2) return 'Athletic / Trained (1–2)';
  if (val === 3 || val === 4) return 'Peak Human (3–4)';
  if (val >= 5 && val <= 7) return 'Superhuman (5–7)';
  if (val >= 8 && val <= 10) return 'High Superhuman (8–10)';
  if (val >= 11 && val <= 14) return 'Godlike / Titan (11–14)';
  return 'Cosmic Force (15+)';
}

export function renderStepAbilities(container) {
  const char = store.character;
  const totalAbilityPP = store.getTotalAbilityPP();
  const recommendedPP = `${Math.round(char.powerLevel * 3)}–${Math.round(char.powerLevel * 5)} PP`;

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-heart-pulse-line"></i></div>
        <div>
          <h2>Step 2: Core Abilities</h2>
          <p>Allocate the 8 fundamental attributes that govern all physical and mental traits.</p>
        </div>
      </div>
      <div class="wizard-stage-badge">${totalAbilityPP} PP Spent (Target: ~${recommendedPP})</div>
    </div>

    <!-- ABILITIES ALLOCATION GUIDELINES -->
    <div class="sheet-card" style="padding: 1rem 1.25rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          <strong style="color: var(--text-primary);">Cost Rate:</strong> 2 Power Points per Rank (ranks can range from -5 to 20).
        </div>
        <div style="font-size: 0.8rem; color: var(--accent-secondary); font-weight: 600;">
          Human Norm: 0 • Peak Human: 4 • Superhuman: 5+
        </div>
      </div>
    </div>

    <!-- 8 ABILITIES GRID -->
    <div class="wizard-abilities-grid">
      ${ABILITIES.map(ab => {
        const val = char.abilities[ab.key] || 0;
        const benchmark = getBenchmarkLabel(val);
        const cost = val * ABILITY_COST_PER_RANK;

        return `
          <div class="wizard-ability-card" id="card-ab-${ab.key}">
            <div class="wizard-ability-header">
              <span class="wizard-ability-name">${ab.name}</span>
              <span class="wizard-ability-abbr">${ab.key}</span>
            </div>

            <p class="wizard-ability-desc">${ab.desc}</p>

            <div class="wizard-ability-body">
              <div class="wizard-ability-stepper">
                <button class="step-btn btn-ab-dec" data-key="${ab.key}" ${val <= -5 ? 'disabled' : ''}>-</button>
                <span class="wizard-ability-val" id="val-ab-${ab.key}">${val >= 0 ? `+${val}` : val}</span>
                <button class="step-btn btn-ab-inc" data-key="${ab.key}" ${val >= 20 ? 'disabled' : ''}>+</button>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-primary);" id="cost-ab-${ab.key}">${cost} PP</div>
                <div style="font-size: 0.65rem; color: var(--text-muted);" id="bench-ab-${ab.key}">${benchmark}</div>
              </div>
            </div>

            <div class="wizard-ability-derived">
              <span style="font-size: 0.65rem; color: var(--text-muted); width: 100%;">Affects:</span>
              ${ab.linkedDefenses.map(d => `<span class="derived-tag" style="border: 1px solid rgba(56, 189, 248, 0.3); color: var(--accent-secondary);">Def: ${d}</span>`).join('')}
              ${ab.linkedSkills.map(s => `<span class="derived-tag">Skill: ${s}</span>`).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind Steppers
  container.querySelectorAll('.btn-ab-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const current = store.getAbility(key);
      if (current > -5) {
        store.setAbility(key, current - 1);
        updateAbilityDisplay(container, key);
      }
    });
  });

  container.querySelectorAll('.btn-ab-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const current = store.getAbility(key);
      if (current < 20) {
        store.setAbility(key, current + 1);
        updateAbilityDisplay(container, key);
      }
    });
  });
}

function updateAbilityDisplay(container, key) {
  const val = store.getAbility(key);
  const cost = val * ABILITY_COST_PER_RANK;
  const benchmark = getBenchmarkLabel(val);

  const valEl = container.querySelector(`#val-ab-${key}`);
  const costEl = container.querySelector(`#cost-ab-${key}`);
  const benchEl = container.querySelector(`#bench-ab-${key}`);

  if (valEl) valEl.textContent = val >= 0 ? `+${val}` : val;
  if (costEl) costEl.textContent = `${cost} PP`;
  if (benchEl) benchEl.textContent = benchmark;

  // Update stage header badge
  const badge = container.querySelector('.wizard-stage-badge');
  if (badge) {
    const totalAbilityPP = store.getTotalAbilityPP();
    const recommendedPP = `${Math.round(store.character.powerLevel * 3)}–${Math.round(store.character.powerLevel * 5)} PP`;
    badge.textContent = `${totalAbilityPP} PP Spent (Target: ~${recommendedPP})`;
  }
}
