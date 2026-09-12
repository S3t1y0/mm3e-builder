// js/components/conditionsTracker.js
import { store } from '../state.js';
import { BASIC_CONDITIONS, COMBINED_CONDITIONS } from '../rules/conditions.js';
import { showToast } from './notifications.js';

export function renderConditionsTracker(container) {
  const char = store.character;
  const activeConditions = char.activeConditions || [];
  const injuries = char.injuries || 0;

  container.innerHTML = `
    <div class="conditions-card">
      <div class="conditions-header">
        <div class="title-with-badge">
          <span class="icon"><i class="ri-heart-pulse-line"></i></span>
          <h3>Conditions Simulator</h3>
          ${activeConditions.length > 0 ? `
            <span class="active-count-badge">${activeConditions.length} Active</span>
          ` : '<span class="normal-status-badge">Normal: No Conditions</span>'}
        </div>
        ${activeConditions.length > 0 ? `
          <button id="btn-clear-conditions" class="btn btn-outline btn-xs">Clear All</button>
        ` : ''}
      </div>
      <p class="conditions-desc">Click any condition to simulate active combat state. Active conditions apply mechanical debuffs to your defenses and checks automatically.</p>

      <!-- Visual Damage & Injuries Tracker -->
      <div class="injury-tracker-panel ${injuries > 0 ? 'has-injuries' : ''}">
        <div class="injury-tracker-header">
          <div class="injury-title-wrap">
            <span class="injury-icon"><i class="ri-shield-cross-line"></i></span>
            <div>
              <div class="injury-title">Damage & Injuries Tracker</div>
              <div class="injury-subtitle">Tracks cumulative bruised penalties from failed Toughness checks.</div>
            </div>
          </div>
          <div class="injury-debuff-badge ${injuries > 0 ? 'active' : ''}">
            ${injuries > 0
              ? `<i class="ri-arrow-down-line"></i> -${injuries} to Toughness Resistance`
              : '<i class="ri-shield-check-line"></i> Toughness at Max (0 Bruises)'}
          </div>
        </div>

        <div class="injury-controls-row">
          <div class="injury-counter-box">
            <span class="injury-counter-label">CUMULATIVE BRUISES</span>
            <div class="injury-stepper">
              <button id="btn-injury-dec" class="btn-injury-step" title="Recover 1 bruise (1 minute of rest)" ${injuries <= 0 ? 'disabled' : ''}>
                <i class="ri-subtract-line"></i>
              </button>
              <span class="injury-count-val ${injuries > 0 ? 'wounded' : ''}" id="injury-count-display">${injuries}</span>
              <button id="btn-injury-inc" class="btn-injury-step" title="Add 1 bruise (+1 injury penalty)">
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>

          <div class="injury-quick-actions">
            <button id="btn-recover-injury" class="btn btn-outline btn-xs" title="Heal 1 bruise (standard 1 minute rest recovery)" ${injuries <= 0 ? 'disabled' : ''}>
              <i class="ri-time-line"></i> Rest 1 Min (-1)
            </button>
            <button id="btn-clear-injuries" class="btn btn-outline btn-xs" title="Clear all injuries and restore Toughness" ${injuries <= 0 ? 'disabled' : ''}>
              <i class="ri-first-aid-kit-line"></i> Heal All
            </button>
          </div>
        </div>
      </div>

      <div class="conditions-section">
        <span class="section-subtitle">BASIC CONDITIONS</span>
        <div class="condition-chips-grid">
          ${BASIC_CONDITIONS.map(c => {
            const isActive = activeConditions.includes(c.name);
            return `
              <button class="condition-chip ${isActive ? 'active' : ''}" data-condition="${c.name}" title="${c.desc}">
                <span class="chip-dot"></span>
                <span class="chip-name">${c.name}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="conditions-section">
        <span class="section-subtitle">COMBINED CONDITIONS</span>
        <div class="condition-chips-grid">
          ${COMBINED_CONDITIONS.map(c => {
            const isActive = activeConditions.includes(c.name);
            return `
              <button class="condition-chip combined ${isActive ? 'active' : ''}" data-condition="${c.name}" title="${c.components.join(' + ')}: ${c.desc}">
                <span class="chip-dot"></span>
                <span class="chip-name">${c.name}</span>
                <span class="combo-hint">${c.components.join('+')}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Injury controls event handlers
  container.querySelector('#btn-injury-dec')?.addEventListener('click', () => {
    store.removeInjury(1);
  });

  container.querySelector('#btn-injury-inc')?.addEventListener('click', () => {
    store.addInjury(1);
  });

  container.querySelector('#btn-recover-injury')?.addEventListener('click', () => {
    store.removeInjury(1);
    showToast('Recovered 1 bruise penalty after rest.', 'info');
  });

  container.querySelector('#btn-clear-injuries')?.addEventListener('click', () => {
    store.clearInjuries();
    showToast('All injuries cleared. Toughness fully restored!', 'success');
  });

  // Condition chip event handlers
  container.querySelectorAll('.condition-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.condition;
      store.toggleCondition(name);
    });
  });

  const clearBtn = container.querySelector('#btn-clear-conditions');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      store.clearConditions();
    });
  }
}

