// js/components/wizard/stepPowers.js
import { store } from '../../state.js';
import { calculatePowerTotalCost } from '../../rules/powers.js';
import { openPowerBuilder } from '../powerBuilder.js';
import { showConfirmModal, showToast } from '../notifications.js';

const QUICK_POWER_PRESETS = [
  {
    name: 'Energy Blast',
    description: 'A focused beam of thermal or kinetic energy.',
    effectType: 'Damage',
    costPerRank: 2,
    ranks: 10,
    range: 'Ranged',
    action: 'Standard',
    duration: 'Instant',
    cost: 20,
    extras: [{ name: 'Increased Range', costPerRank: 1, isFlat: false }],
    flaws: []
  },
  {
    name: 'Supersonic Flight',
    description: 'Propelling through the sky at speeds exceeding sound.',
    effectType: 'Flight',
    costPerRank: 2,
    ranks: 8,
    range: 'Personal',
    action: 'Move',
    duration: 'Sustained',
    cost: 16,
    extras: [],
    flaws: []
  },
  {
    name: 'Force Field',
    description: 'A protective barrier that shields against incoming attacks.',
    effectType: 'Protection',
    costPerRank: 1,
    ranks: 10,
    range: 'Personal',
    action: 'Free',
    duration: 'Sustained',
    cost: 10,
    extras: [{ name: 'Sustained', costPerRank: 0, isFlat: true, flatValue: 0 }],
    flaws: []
  },
  {
    name: 'Super-Speed',
    description: 'Hypersonic running velocity and rapid operational capability.',
    effectType: 'Speed',
    costPerRank: 1,
    ranks: 10,
    range: 'Personal',
    action: 'Free',
    duration: 'Sustained',
    cost: 10,
    extras: [],
    flaws: []
  },
  {
    name: 'Teleportation',
    description: 'Instantaneous spatial transition across distances.',
    effectType: 'Teleport',
    costPerRank: 2,
    ranks: 6,
    range: 'Personal',
    action: 'Move',
    duration: 'Instant',
    cost: 12,
    extras: [],
    flaws: []
  },
  {
    name: 'Telekinesis',
    description: 'Manipulating objects and throwing enemies at a distance with mind force.',
    effectType: 'Move Object',
    costPerRank: 2,
    ranks: 8,
    range: 'Ranged',
    action: 'Standard',
    duration: 'Sustained',
    cost: 16,
    extras: [],
    flaws: []
  }
];

export function renderStepPowers(container) {
  const char = store.character;
  const totalPowerPP = store.getTotalPowerPP();

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-flashlight-line"></i></div>
        <div>
          <h2>Step 6: Superpowers & Gadgets</h2>
          <p>Construct signature superhuman abilities using the 41 d20HeroSRD effects catalog.</p>
        </div>
      </div>
      <div class="wizard-stage-badge">${totalPowerPP} PP Spent (${char.powers.length} Powers Created)</div>
    </div>

    <!-- POWERS COMMAND BAR -->
    <div class="sheet-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1rem; color: var(--text-primary); margin: 0 0 0.25rem 0;">Modular Power Studio</h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">
          Launch the full-screen builder to add Extras, Flaws, Alternate Effects, and Removable devices.
        </p>
      </div>
      <button id="wiz-btn-new-power" class="btn btn-primary btn-sm">
        <i class="ri-add-line"></i> Open Power Studio
      </button>
    </div>

    <!-- QUICK ADD PRESETS -->
    <div class="sheet-card" style="padding: 1rem 1.25rem;">
      <h4 style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: var(--letter-spacing-caps);">
        <i class="ri-sparkling-fill" style="color: var(--accent-amber);"></i> Quick Add Common Powers
      </h4>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${QUICK_POWER_PRESETS.map((qp, idx) => `
          <button class="btn btn-secondary btn-xs btn-quick-power" data-idx="${idx}">
            <i class="ri-add-line"></i> + ${qp.name} (${qp.cost} PP)
          </button>
        `).join('')}
      </div>
    </div>

    <!-- CURRENT POWERS LIST -->
    <div class="wizard-powers-container" id="wiz-powers-list">
      ${char.powers.length === 0 ? `
        <div class="sheet-card" style="text-align: center; padding: 2.5rem 1rem; border-style: dashed;">
          <div style="font-size: 2rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i class="ri-flashlight-line"></i></div>
          <h4 style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 0.25rem;">No Powers Created Yet</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
            Click "Open Power Studio" above or choose a Quick Add preset to give your hero superhuman capabilities.
          </p>
          <button id="wiz-btn-empty-add" class="btn btn-primary btn-sm">
            <i class="ri-add-line"></i> Create First Power
          </button>
        </div>
      ` : char.powers.map(p => {
        const cost = calculatePowerTotalCost(p);
        const effectName = p.baseEffect || p.mainEffect?.baseEffect || p.effectType || (p.effects?.[0]?.name) || 'Custom Effect';
        const rank = p.ranks || p.effects?.[0]?.ranks || 1;
        const range = p.range || 'Personal';
        const altCount = (p.alternateEffects || []).length;

        return `
          <div class="wizard-power-item">
            <div class="wizard-power-info">
              <div class="wizard-power-name">
                <i class="ri-flashlight-fill" style="color: var(--accent-primary);"></i>
                ${p.name || 'Unnamed Power'}
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-secondary); background: rgba(56, 189, 248, 0.1); padding: 0.15rem 0.5rem; border-radius: var(--radius-xs);">
                  ${cost} PP
                </span>
                ${altCount > 0 ? `<span style="font-size: 0.7rem; color: var(--accent-pink); background: rgba(236, 72, 153, 0.1); padding: 0.15rem 0.5rem; border-radius: var(--radius-xs);">${altCount} Alt Slot${altCount > 1 ? 's' : ''}</span>` : ''}
              </div>
              <div class="wizard-power-details">
                <strong>${effectName} ${rank}</strong> • Range: ${range} • Action: ${p.action || 'Standard'} • Duration: ${p.duration || 'Instant'}
              </div>
              ${p.description ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">${p.description}</p>` : ''}
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-ghost btn-xs btn-edit-power" data-id="${p.id}" title="Edit in Studio">
                <i class="ri-edit-line"></i> Edit
              </button>
              <button class="btn btn-ghost btn-xs btn-delete-power" data-id="${p.id}" title="Delete Power" style="color: var(--accent-danger);">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind Events
  document.getElementById('wiz-btn-new-power')?.addEventListener('click', () => openPowerBuilder());
  document.getElementById('wiz-btn-empty-add')?.addEventListener('click', () => openPowerBuilder());

  // Quick Powers Add
  container.querySelectorAll('.btn-quick-power').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const preset = QUICK_POWER_PRESETS[idx];
      if (preset) {
        store.addPower({
          ...preset,
          id: 'pow_' + Date.now() + Math.random().toString(36).substr(2, 4)
        });
        showToast(`Added ${preset.name} (${preset.cost} PP)`, 'success');
        renderStepPowers(container);
      }
    });
  });

  // Edit Power
  container.querySelectorAll('.btn-edit-power').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const power = char.powers.find(p => p.id === id);
      if (power) {
        openPowerBuilder(power);
      }
    });
  });

  // Delete Power
  container.querySelectorAll('.btn-delete-power').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const power = char.powers.find(p => p.id === id);
      if (power) {
        const confirmed = await showConfirmModal({
          title: `Delete Power "${power.name}"?`,
          message: `Are you sure you want to remove ${power.name}? This will free up ${calculatePowerTotalCost(power)} PP.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          isDanger: true,
          icon: '<i class="ri-delete-bin-line"></i>'
        });
        if (confirmed) {
          store.removePower(id);
          showToast(`Power deleted.`, 'info');
          renderStepPowers(container);
        }
      }
    });
  });
}
