// js/components/conditionsTracker.js
import { store } from '../state.js';
import { BASIC_CONDITIONS, COMBINED_CONDITIONS } from '../rules/conditions.js';

export function renderConditionsTracker(container) {
  const char = store.character;
  const activeConditions = char.activeConditions || [];

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

  // Event handlers
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
