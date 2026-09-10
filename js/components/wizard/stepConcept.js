// js/components/wizard/stepConcept.js
import { store } from '../../state.js';
import { ARCHETYPES } from '../../rules/archetypes.js';
import { showToast, showConfirmModal } from '../notifications.js';

const ORIGINS = [
  'Mutant', 'High-Tech', 'Magic', 'Alien', 'Experiment',
  'Training', 'Divine', 'Cosmic', 'Psionic', 'Accident'
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderStepConcept(container) {
  const char = store.character;

  // 1. Non-destructive update: If inputs already exist, update them without destroying focus
  const heroNameInput = container.querySelector('#wiz-hero-name');
  if (heroNameInput) {
    if (document.activeElement !== heroNameInput) {
      heroNameInput.value = char.name || '';
    }
    const realNameInput = container.querySelector('#wiz-real-name');
    if (realNameInput && document.activeElement !== realNameInput) {
      realNameInput.value = char.identity || '';
    }
    const playerInput = container.querySelector('#wiz-player-name');
    if (playerInput && document.activeElement !== playerInput) {
      playerInput.value = char.player || '';
    }
    const baseInput = container.querySelector('#wiz-base');
    if (baseInput && document.activeElement !== baseInput) {
      baseInput.value = char.baseOfOperations || '';
    }

    const badge = container.querySelector('.wizard-stage-badge');
    if (badge) {
      badge.textContent = `PL ${char.powerLevel} • ${char.powerLevel * 15} PP Budget`;
    }

    container.querySelectorAll('.pl-preset-btn').forEach(btn => {
      const pl = parseInt(btn.dataset.pl, 10);
      btn.className = `btn btn-xs ${char.powerLevel === pl ? 'btn-primary' : 'btn-secondary'} pl-preset-btn`;
    });

    const plVal = container.querySelector('#wiz-pl-val');
    if (plVal) plVal.textContent = char.powerLevel;
    const plBudget = container.querySelector('#wiz-pl-budget');
    if (plBudget) plBudget.textContent = char.powerLevel * 15;
    const plDec = container.querySelector('#wiz-pl-dec');
    if (plDec) plDec.disabled = char.powerLevel <= 1;
    const plInc = container.querySelector('#wiz-pl-inc');
    if (plInc) plInc.disabled = char.powerLevel >= 20;

    container.querySelectorAll('.origin-chip').forEach(chip => {
      const orig = chip.dataset.origin;
      chip.classList.toggle('selected', (char.notes || '').includes(orig));
    });

    return;
  }

  // 2. Initial render: Build template when navigating to Step 1
  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-user-star-line"></i></div>
        <div>
          <h2>Step 1: Concept & Identity</h2>
          <p>Define your hero's persona, power level, and archetype origin.</p>
        </div>
      </div>
      <div class="wizard-stage-badge">PL ${char.powerLevel} • ${char.powerLevel * 15} PP Budget</div>
    </div>

    <!-- HERO IDENTITY FIELDS -->
    <div class="sheet-card">
      <h3 style="margin-bottom: 1rem; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <i class="ri-id-card-line" style="color: var(--accent-primary);"></i> Hero Identity
      </h3>
      <div class="identity-grid">
        <div class="field-group">
          <label for="wiz-hero-name"><i class="ri-shield-user-line"></i> Hero / Codename</label>
          <input type="text" id="wiz-hero-name" class="text-input" placeholder="e.g. Apex, Chronos, Valkyrie" value="${escapeHtml(char.name || '')}">
        </div>
        <div class="field-group">
          <label for="wiz-real-name"><i class="ri-user-line"></i> Real Name / Alter Ego</label>
          <input type="text" id="wiz-real-name" class="text-input" placeholder="e.g. Clark Kent, Bruce Wayne" value="${escapeHtml(char.identity || '')}">
        </div>
        <div class="field-group">
          <label for="wiz-player-name"><i class="ri-user-smile-line"></i> Player</label>
          <input type="text" id="wiz-player-name" class="text-input" placeholder="Your Name" value="${escapeHtml(char.player || '')}">
        </div>
        <div class="field-group">
          <label for="wiz-base"><i class="ri-building-4-line"></i> Base of Operations</label>
          <input type="text" id="wiz-base" class="text-input" placeholder="e.g. Freedom City, Metro Tower" value="${escapeHtml(char.baseOfOperations || '')}">
        </div>
      </div>
    </div>

    <!-- POWER LEVEL SELECTION -->
    <div class="sheet-card">
      <h3 style="margin-bottom: 0.75rem; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <i class="ri-speed-up-line" style="color: var(--accent-secondary);"></i> Power Level (PL) & Budget
      </h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Power Level sets the campaign scope, defense caps, and point budget (15 Power Points per PL).
      </p>
      
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <button class="btn btn-xs ${char.powerLevel === 6 ? 'btn-primary' : 'btn-secondary'} pl-preset-btn" data-pl="6">PL 6 (Street / Vigilante • 90 PP)</button>
        <button class="btn btn-xs ${char.powerLevel === 8 ? 'btn-primary' : 'btn-secondary'} pl-preset-btn" data-pl="8">PL 8 (Teen Hero / Agent • 120 PP)</button>
        <button class="btn btn-xs ${char.powerLevel === 10 ? 'btn-primary' : 'btn-secondary'} pl-preset-btn" data-pl="10">PL 10 (Standard Hero • 150 PP)</button>
        <button class="btn btn-xs ${char.powerLevel === 12 ? 'btn-primary' : 'btn-secondary'} pl-preset-btn" data-pl="12">PL 12 (Cosmic / Legendary • 180 PP)</button>
      </div>

      <div style="display: flex; align-items: center; gap: 1.5rem; background: var(--bg-elevated); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); width: fit-content;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">Custom PL:</span>
        <div class="stepper">
          <button class="step-btn" id="wiz-pl-dec" ${char.powerLevel <= 1 ? 'disabled' : ''}>-</button>
          <span class="step-val" id="wiz-pl-val" style="font-size: 1.2rem; min-width: 2rem;">${char.powerLevel}</span>
          <button class="step-btn" id="wiz-pl-inc" ${char.powerLevel >= 20 ? 'disabled' : ''}>+</button>
        </div>
        <span style="font-size: 0.8rem; color: var(--accent-secondary); font-weight: 600;">
          Budget: <span id="wiz-pl-budget">${char.powerLevel * 15}</span> PP
        </span>
      </div>
    </div>

    <!-- ORIGIN & DESCRIPTOR TAGS -->
    <div class="sheet-card">
      <h3 style="margin-bottom: 0.75rem; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
        <i class="ri-price-tag-3-line" style="color: var(--accent-pink);"></i> Origin & Theme Descriptors
      </h3>
      <div class="origin-chips-group" id="origin-chips-container">
        ${ORIGINS.map(orig => `
          <div class="origin-chip ${(char.notes || '').includes(orig) ? 'selected' : ''}" data-origin="${orig}">
            ${orig}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ARCHETYPE QUICK-STARTER PRESETS -->
    <div class="sheet-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
        <div>
          <h3 style="font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <i class="ri-sparkling-fill" style="color: var(--accent-amber);"></i> Hero Archetype Starter (Optional)
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">
            Apply a classic archetype template to instantly populate balanced abilities, defenses, and powers.
          </p>
        </div>
      </div>

      <div class="archetypes-grid">
        ${ARCHETYPES.map(arch => `
          <div class="archetype-card" data-arch-id="${arch.id}">
            <div class="archetype-card-head">
              <div class="archetype-card-icon"><i class="${arch.icon}"></i></div>
              <div>
                <h4>${escapeHtml(arch.name)}</h4>
                <span style="font-size: 0.7rem; color: var(--accent-secondary);">${escapeHtml(arch.origin)}</span>
              </div>
            </div>
            <p class="archetype-card-tagline">${escapeHtml(arch.tagline)}</p>
            <div class="archetype-card-stats">
              <strong>Trade-off:</strong> ${escapeHtml(arch.tradeoffStyle)}
            </div>
            <button class="btn btn-secondary btn-xs archetype-apply-btn" data-arch-id="${arch.id}">
              <i class="ri-flashlight-line"></i> Apply ${escapeHtml(arch.name)} Template
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind Events for Text Inputs
  container.querySelector('#wiz-hero-name')?.addEventListener('input', (e) => {
    store.updateHeader({ name: e.target.value });
  });
  container.querySelector('#wiz-real-name')?.addEventListener('input', (e) => {
    store.updateHeader({ identity: e.target.value });
  });
  container.querySelector('#wiz-player-name')?.addEventListener('input', (e) => {
    store.updateHeader({ player: e.target.value });
  });
  container.querySelector('#wiz-base')?.addEventListener('input', (e) => {
    store.updateHeader({ baseOfOperations: e.target.value });
  });

  // PL buttons
  container.querySelectorAll('.pl-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pl = parseInt(btn.dataset.pl, 10);
      store.updateHeader({ powerLevel: pl });
    });
  });

  container.querySelector('#wiz-pl-dec')?.addEventListener('click', () => {
    if (store.character.powerLevel > 1) {
      store.updateHeader({ powerLevel: store.character.powerLevel - 1 });
    }
  });

  container.querySelector('#wiz-pl-inc')?.addEventListener('click', () => {
    if (store.character.powerLevel < 20) {
      store.updateHeader({ powerLevel: store.character.powerLevel + 1 });
    }
  });

  // Origin Chips
  container.querySelectorAll('.origin-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const orig = chip.dataset.origin;
      let notes = store.character.notes || '';
      if (notes.includes(orig)) {
        notes = notes.replace(orig, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
      } else {
        notes = notes ? `${notes}, ${orig}` : orig;
      }
      store.updateHeader({ notes });
    });
  });

  // Apply Archetype Template
  container.querySelectorAll('.archetype-apply-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const archId = btn.dataset.archId;
      const arch = ARCHETYPES.find(a => a.id === archId);
      if (!arch) return;

      const confirmed = await showConfirmModal({
        title: `Apply ${arch.name} Template?`,
        message: `This will configure your character's abilities, defenses, advantages, and sample powers to match the ${arch.name} archetype. Existing attributes will be updated.`,
        confirmText: `Apply ${arch.name}`,
        cancelText: 'Cancel',
        isDanger: false,
        icon: `<i class="${arch.icon}"></i>`
      });

      if (confirmed) {
        // Apply abilities
        for (const [key, val] of Object.entries(arch.abilities)) {
          store.setAbility(key, val);
        }
        // Apply defenses
        for (const [key, val] of Object.entries(arch.defenses)) {
          store.setDefense(key, val);
        }
        // Apply skills
        for (const sk of arch.skills) {
          store.addSkill({ name: sk.name, subtype: sk.subtype, ranks: sk.ranks });
        }
        // Apply advantages
        for (const adv of arch.advantages) {
          store.addAdvantage(adv.name, adv.ranks);
        }
        // Apply sample powers if powers list is empty
        if (store.character.powers.length === 0 && arch.samplePowers) {
          for (const sp of arch.samplePowers) {
            store.addPower({
              ...sp,
              id: 'pow_' + Date.now() + Math.random().toString(36).substr(2, 4)
            });
          }
        }
        showToast(`${arch.name} template applied successfully!`, 'success');
      }
    });
  });
}
