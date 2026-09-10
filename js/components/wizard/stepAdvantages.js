// js/components/wizard/stepAdvantages.js
import { store } from '../../state.js';
import { ADVANTAGES } from '../../rules/advantages.js';

let activeAdvCategory = 'All';

export function renderStepAdvantages(container) {
  const char = store.character;
  const totalAdvPP = store.getTotalAdvantagePP();
  const equipAdv = char.advantages.find(a => a.name === 'Equipment');
  const equipRanks = equipAdv ? equipAdv.ranks : 0;
  const maxEP = equipRanks * 5;

  const categories = ['All', 'Combat', 'Fortune', 'General', 'Skill'];

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-medal-line"></i></div>
        <div>
          <h2>Step 5: Advantages</h2>
          <p>Special combat knacks, general benefits, and tactical feats (1 PP / Rank).</p>
        </div>
      </div>
      <div class="wizard-stage-badge">${totalAdvPP} PP Spent (${char.advantages.length} Advantages Selected)</div>
    </div>

    <!-- EQUIPMENT ADVANTAGE SYNERGY BANNER -->
    <div class="sheet-card" style="padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="font-size: 1.5rem; color: var(--accent-secondary);"><i class="ri-shield-flash-line"></i></div>
        <div>
          <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-primary);">Equipment Synergy</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">
            Each rank of the <strong>Equipment</strong> advantage provides <strong>5 Equipment Points (EP)</strong> to buy weapons, vehicles, and headquarters in Step 7.
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 700;">
          Equipment: ${equipRanks} Rank${equipRanks !== 1 ? 's' : ''} (${maxEP} EP Available)
        </span>
      </div>
    </div>

    <!-- CATEGORY FILTER TABS -->
    <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;">
      ${categories.map(cat => `
        <button class="wizard-filter-tab ${cat === activeAdvCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>
      `).join('')}
    </div>

    <!-- ADVANTAGES GRID -->
    <div class="wizard-advantages-grid" id="wiz-adv-grid">
      <!-- Populated dynamically -->
    </div>
  `;

  renderAdvantagesGrid(container);

  // Filter tabs
  container.querySelectorAll('.wizard-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeAdvCategory = tab.dataset.cat;
      container.querySelectorAll('.wizard-filter-tab').forEach(t => t.classList.toggle('active', t === tab));
      renderAdvantagesGrid(container);
    });
  });
}

function renderAdvantagesGrid(container) {
  const char = store.character;
  const grid = container.querySelector('#wiz-adv-grid');
  if (!grid) return;

  const filtered = ADVANTAGES.filter(a => {
    if (activeAdvCategory === 'All') return true;
    return a.category.toLowerCase() === activeAdvCategory.toLowerCase();
  });

  grid.innerHTML = filtered.map(ruleAdv => {
    const existing = char.advantages.find(a => a.name.toLowerCase() === ruleAdv.name.toLowerCase());
    const ranks = existing ? existing.ranks : 0;
    const isSelected = ranks > 0;

    return `
      <div class="wizard-advantage-card ${isSelected ? 'active' : ''}" id="adv-card-${ruleAdv.name.replace(/\s+/g, '-')}">
        <div class="wizard-advantage-head">
          <div class="wizard-advantage-title">${ruleAdv.name}</div>
          <span style="font-size: 0.65rem; color: var(--accent-secondary); font-weight: 600;">${ruleAdv.category}</span>
        </div>

        <p class="wizard-advantage-desc">${ruleAdv.desc}</p>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
          ${ruleAdv.ranked ? `
            <span style="font-size: 0.7rem; color: var(--text-muted);">Ranked Advantage</span>
            <div class="stepper">
              <button class="step-btn btn-adv-dec" data-name="${ruleAdv.name}" ${ranks <= 0 ? 'disabled' : ''}>-</button>
              <span class="step-val" style="font-size: 0.95rem; min-width: 1.5rem;">${ranks}</span>
              <button class="step-btn btn-adv-inc" data-name="${ruleAdv.name}">+</button>
            </div>
          ` : `
            <span style="font-size: 0.7rem; color: var(--text-muted);">1 PP</span>
            <button class="btn ${isSelected ? 'btn-danger' : 'btn-secondary'} btn-xs btn-adv-toggle" data-name="${ruleAdv.name}">
              ${isSelected ? '<i class="ri-close-line"></i> Remove' : '<i class="ri-add-line"></i> Select'}
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  // Bind Steppers
  grid.querySelectorAll('.btn-adv-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const existing = char.advantages.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (existing && existing.ranks > 0) {
        store.updateAdvantage(name, existing.ranks - 1);
        renderStepAdvantages(container);
      }
    });
  });

  grid.querySelectorAll('.btn-adv-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const existing = char.advantages.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        store.updateAdvantage(name, existing.ranks + 1);
      } else {
        store.addAdvantage(name, 1);
      }
      renderStepAdvantages(container);
    });
  });

  // Toggle non-ranked
  grid.querySelectorAll('.btn-adv-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const existing = char.advantages.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        store.removeAdvantage(name);
      } else {
        store.addAdvantage(name, 1);
      }
      renderStepAdvantages(container);
    });
  });
}
