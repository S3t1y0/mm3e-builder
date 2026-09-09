// js/components/powerBuilder.js
import { store } from '../state.js';
import { BASE_EFFECTS, EXTRAS, FLAWS, calculatePowerTotalCost, calculateComponentCost } from '../rules/powers.js';
import { showToast } from './notifications.js';

let currentPower = null;
let editingPowerId = null;
let activeModifierTab = 'extras'; // 'extras' or 'flaws'
let modifierSearchQuery = '';

function createEmptyPower() {
  return {
    name: '',
    activation: 'none',
    activationCost: 0,
    descriptors: [],
    baseEffect: '',
    baseCost: 1,
    ranks: 1,
    extras: [],
    flaws: [],
    linkedEffects: [],
    alternateEffects: [],
    notes: ''
  };
}

export function openPowerBuilder(powerToEdit = null) {
  const modal = document.getElementById('power-builder-modal');
  if (!modal) return;

  if (powerToEdit) {
    editingPowerId = powerToEdit.id;
    currentPower = JSON.parse(JSON.stringify(powerToEdit));
  } else {
    editingPowerId = null;
    currentPower = createEmptyPower();
  }

  activeModifierTab = 'extras';
  modifierSearchQuery = '';
  renderModalContent();
  modal.classList.add('open');
}

export function closePowerBuilder() {
  const modal = document.getElementById('power-builder-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function renderModalContent() {
  const modal = document.getElementById('power-builder-modal');
  if (!modal) return;

  const totalCost = calculatePowerTotalCost(currentPower);
  const isValid = !!currentPower.baseEffect;

  // Filter modifiers
  const sourceList = activeModifierTab === 'extras' ? EXTRAS : FLAWS;
  const filteredModifiers = sourceList.filter(m => {
    if (!modifierSearchQuery) return true;
    return m.name.toLowerCase().includes(modifierSearchQuery.toLowerCase()) ||
           m.desc.toLowerCase().includes(modifierSearchQuery.toLowerCase());
  });

  modal.innerHTML = `
    <div class="modal-dialog power-builder-dialog">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title">
          <span class="icon"><i class="ri-flashlight-line"></i></span>
          <h3>${editingPowerId ? 'Edit Power' : 'Power Builder'}</h3>
        </div>
        <div class="modal-header-actions">
          <button id="pb-save-btn" class="btn btn-primary" ${isValid ? '' : 'disabled'}>
            <i class="ri-save-line"></i> Save Power (${totalCost} PP)
          </button>
          <button id="pb-close-btn" class="btn btn-ghost"><i class="ri-close-line"></i> Close</button>
        </div>
      </div>

      <!-- Modal Body (Two Columns) -->
      <div class="modal-body pb-layout">
        <!-- LEFT COLUMN: Modifiers Palette -->
        <div class="pb-palette">
          <div class="palette-search">
            <input type="text" id="pb-modifier-search" placeholder="Search modifiers..." value="${modifierSearchQuery}">
          </div>
          <div class="palette-tabs">
            <button class="palette-tab ${activeModifierTab === 'extras' ? 'active' : ''}" data-tab="extras">
              Extras (${EXTRAS.length})
            </button>
            <button class="palette-tab ${activeModifierTab === 'flaws' ? 'active' : ''}" data-tab="flaws">
              Flaws (${FLAWS.length})
            </button>
          </div>
          <div class="palette-list">
            ${filteredModifiers.map(m => {
              const costLabel = m.type === 'per_rank' ? `${m.cost > 0 ? '+' : ''}${m.cost}/rank` :
                               m.type === 'flat_per_rank' ? `${m.cost > 0 ? '+' : ''}${m.cost} flat/rank` :
                               `${m.cost > 0 ? '+' : ''}${m.cost} flat`;
              return `
                <div class="palette-item" title="${m.desc}">
                  <div class="p-info">
                    <span class="p-name">${m.name}</span>
                    <span class="p-cost ${m.cost > 0 ? 'cost-extra' : 'cost-flaw'}">${costLabel}</span>
                  </div>
                  <button class="btn-add-mod" data-add-mod="${m.name}" data-mod-tab="${activeModifierTab}" title="Add to active effect">
                    +
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- RIGHT COLUMN: Power Configuration Form -->
        <div class="pb-form">
          <!-- Identity Row -->
          <div class="form-row">
            <div class="form-group flex-2">
              <label>POWER NAME</label>
              <input type="text" id="pb-power-name" placeholder="e.g., Mystic Blast, Telekinetic Shield" value="${currentPower.name}">
            </div>
            <div class="form-group flex-1">
              <label>ACTION ACTIVATION</label>
              <select id="pb-activation">
                <option value="none" ${currentPower.activation === 'none' ? 'selected' : ''}>Standard (Free)</option>
                <option value="move" ${currentPower.activation === 'move' ? 'selected' : ''}>Move Action (-1 PP)</option>
                <option value="standard" ${currentPower.activation === 'standard' ? 'selected' : ''}>Standard Action (-2 PP)</option>
              </select>
            </div>
          </div>

          <!-- Descriptors Row -->
          <div class="form-group">
            <label>DESCRIPTORS (TAGS)</label>
            <div class="descriptors-manager">
              <div class="descriptors-input-row">
                <input type="text" id="pb-descriptor-input" placeholder="e.g., Fire, Magic, Technological, Mental">
                <button id="pb-add-descriptor" class="btn btn-secondary btn-sm">Add</button>
              </div>
              <div class="descriptors-tags">
                ${currentPower.descriptors.map((d, i) => `
                  <span class="descriptor-tag">
                    ${d}
                    <button class="remove-tag" data-remove-desc="${i}"><i class="ri-close-line"></i></button>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Main Effect Component -->
          <div class="pb-section-card effect-component-card">
            <div class="component-header">
              <span class="badge badge-primary">MAIN EFFECT</span>
              <span class="component-cost-badge">
                ${calculateComponentCost(currentPower.baseCost, currentPower.ranks, currentPower.extras, currentPower.flaws, currentPower.activationCost)} PP
              </span>
            </div>

            <div class="form-row">
              <div class="form-group flex-2">
                <label>BASE EFFECT</label>
                <select id="pb-base-effect">
                  <option value="">-- Choose Base Effect --</option>
                  ${BASE_EFFECTS.map(eff => `
                    <option value="${eff.name}" ${currentPower.baseEffect === eff.name ? 'selected' : ''}>
                      ${eff.name} (${eff.cost} PP/rank, ${eff.range}, ${eff.action})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group flex-1">
                <label>RANKS</label>
                <div class="stepper">
                  <button class="step-btn" id="pb-rank-dec">-</button>
                  <input type="number" class="step-val" id="pb-ranks" value="${currentPower.ranks}" min="1" max="30">
                  <button class="step-btn" id="pb-rank-inc">+</button>
                </div>
              </div>
            </div>

            <!-- Applied Modifiers for Main Effect -->
            <div class="applied-modifiers-area">
              <span class="mod-area-title">Applied Extras & Flaws:</span>
              ${(currentPower.extras.length === 0 && currentPower.flaws.length === 0) ? `
                <div class="empty-mod-hint">Click '+' on any Extra or Flaw on the left palette to attach it.</div>
              ` : ''}
              <div class="mods-chips-row">
                ${currentPower.extras.map((ex, idx) => `
                  <span class="mod-chip extra">
                    ${ex.name} ${ex.type === 'per_rank' ? `(+${ex.cost}/rk)` : `(+${ex.cost})`}
                    <button class="remove-mod-btn" data-remove-extra="${idx}"><i class="ri-close-line"></i></button>
                  </span>
                `).join('')}
                ${currentPower.flaws.map((fl, idx) => `
                  <span class="mod-chip flaw">
                    ${fl.name} ${fl.type === 'per_rank' ? `(${fl.cost}/rk)` : `(${fl.cost})`}
                    <button class="remove-mod-btn" data-remove-flaw="${idx}"><i class="ri-close-line"></i></button>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Linked Effects Section -->
          ${currentPower.linkedEffects.map((linked, lIdx) => `
            <div class="pb-section-card linked-effect-card">
              <div class="component-header">
                <span class="badge badge-secondary">LINKED EFFECT #${lIdx + 1}</span>
                <span class="component-cost-badge">
                  +${calculateComponentCost(linked.baseCost, linked.ranks, linked.extras, linked.flaws, 0)} PP
                </span>
                <button class="remove-linked-btn btn btn-ghost btn-xs" data-remove-linked="${lIdx}"><i class="ri-close-line"></i> Remove</button>
              </div>
              <div class="form-row">
                <div class="form-group flex-2">
                  <select class="pb-linked-base" data-linked-idx="${lIdx}">
                    ${BASE_EFFECTS.map(eff => `
                      <option value="${eff.name}" ${linked.baseEffect === eff.name ? 'selected' : ''}>
                        ${eff.name} (${eff.cost} PP/rank)
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <div class="stepper">
                    <button class="step-btn" data-linked-dec="${lIdx}">-</button>
                    <span class="step-val-text">${linked.ranks}</span>
                    <button class="step-btn" data-linked-inc="${lIdx}">+</button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}

          <div class="pb-actions-row">
            <button id="pb-btn-add-linked" class="btn btn-outline btn-sm">
              <i class="ri-links-line"></i> Linked Effect
            </button>
            <button id="pb-btn-add-alt" class="btn btn-outline btn-sm">
              <i class="ri-stack-line"></i> Alternate Effect (Array)
            </button>
          </div>

          <!-- Alternate Effects Summary -->
          ${currentPower.alternateEffects.length > 0 ? `
            <div class="pb-section-card alt-effects-card">
              <div class="component-header">
                <span class="badge">ALTERNATE EFFECTS (${currentPower.alternateEffects.length})</span>
                <span class="component-cost-badge">+${currentPower.alternateEffects.length} PP</span>
              </div>
              <div class="alt-list">
                ${currentPower.alternateEffects.map((alt, aIdx) => `
                  <div class="alt-item">
                    <span>${alt.name || 'Alternate Slot'} (${alt.baseEffect} ${alt.ranks})</span>
                    <button class="btn btn-ghost btn-xs" data-remove-alt="${aIdx}"><i class="ri-close-line"></i></button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Notes -->
          <div class="form-group">
            <label>NOTES / VISUAL MANIFESTATION</label>
            <textarea id="pb-notes" rows="2" placeholder="Visual effects, power source lore, special complications...">${currentPower.notes || ''}</textarea>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="pb-total-display">
          <span class="total-label">TOTAL POWER COST:</span>
          <span class="total-value">${totalCost} PP</span>
        </div>
        <div class="pb-footer-buttons">
          <button id="pb-cancel-btn" class="btn btn-ghost">Cancel</button>
          <button id="pb-save-footer-btn" class="btn btn-primary" ${isValid ? '' : 'disabled'}>
            Save Power (${totalCost} PP)
          </button>
        </div>
      </div>
    </div>
  `;

  attachEventHandlers();
}

function attachEventHandlers() {
  const modal = document.getElementById('power-builder-modal');
  if (!modal) return;

  // Search
  const searchInput = modal.querySelector('#pb-modifier-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      modifierSearchQuery = e.target.value;
      renderModalContent();
    });
  }

  // Palette tabs
  modal.querySelectorAll('.palette-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      activeModifierTab = tabBtn.dataset.tab;
      renderModalContent();
    });
  });

  // Add modifier
  modal.querySelectorAll('[data-add-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modName = btn.dataset.addMod;
      const isExtra = btn.dataset.modTab === 'extras';
      const source = isExtra ? EXTRAS.find(e => e.name === modName) : FLAWS.find(f => f.name === modName);
      if (!source) return;

      if (isExtra) {
        currentPower.extras.push({ ...source, ranks: 1 });
      } else {
        currentPower.flaws.push({ ...source, ranks: 1 });
      }
      renderModalContent();
    });
  });

  // Remove modifier
  modal.querySelectorAll('[data-remove-extra]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeExtra, 10);
      currentPower.extras.splice(idx, 1);
      renderModalContent();
    });
  });

  modal.querySelectorAll('[data-remove-flaw]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeFlaw, 10);
      currentPower.flaws.splice(idx, 1);
      renderModalContent();
    });
  });

  // Power Name
  const nameInput = modal.querySelector('#pb-power-name');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      currentPower.name = e.target.value;
    });
  }

  // Activation
  const activationSelect = modal.querySelector('#pb-activation');
  if (activationSelect) {
    activationSelect.addEventListener('change', (e) => {
      currentPower.activation = e.target.value;
      currentPower.activationCost = e.target.value === 'move' ? -1 : e.target.value === 'standard' ? -2 : 0;
      renderModalContent();
    });
  }

  // Descriptors
  const descInput = modal.querySelector('#pb-descriptor-input');
  const addDescBtn = modal.querySelector('#pb-add-descriptor');
  const addDesc = () => {
    const val = descInput.value.trim();
    if (val && !currentPower.descriptors.includes(val)) {
      currentPower.descriptors.push(val);
      descInput.value = '';
      renderModalContent();
    }
  };
  if (addDescBtn) addDescBtn.addEventListener('click', addDesc);
  if (descInput) {
    descInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addDesc();
      }
    });
  }

  modal.querySelectorAll('[data-remove-desc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeDesc, 10);
      currentPower.descriptors.splice(idx, 1);
      renderModalContent();
    });
  });

  // Base effect select
  const baseSelect = modal.querySelector('#pb-base-effect');
  if (baseSelect) {
    baseSelect.addEventListener('change', (e) => {
      const chosen = BASE_EFFECTS.find(b => b.name === e.target.value);
      if (chosen) {
        currentPower.baseEffect = chosen.name;
        currentPower.baseCost = chosen.cost;
        currentPower.range = chosen.range;
        currentPower.resistance = chosen.resistance || 'Toughness';
        if (!currentPower.name) {
          currentPower.name = chosen.name;
        }
      } else {
        currentPower.baseEffect = '';
        currentPower.baseCost = 1;
      }
      renderModalContent();
    });
  }

  // Ranks
  const rankDec = modal.querySelector('#pb-rank-dec');
  const rankInc = modal.querySelector('#pb-rank-inc');
  const rankInput = modal.querySelector('#pb-ranks');
  if (rankDec) {
    rankDec.addEventListener('click', () => {
      if (currentPower.ranks > 1) {
        currentPower.ranks--;
        renderModalContent();
      }
    });
  }
  if (rankInc) {
    rankInc.addEventListener('click', () => {
      currentPower.ranks++;
      renderModalContent();
    });
  }
  if (rankInput) {
    rankInput.addEventListener('change', (e) => {
      currentPower.ranks = Math.max(1, parseInt(e.target.value, 10) || 1);
      renderModalContent();
    });
  }

  // Linked Effects
  const addLinkedBtn = modal.querySelector('#pb-btn-add-linked');
  if (addLinkedBtn) {
    addLinkedBtn.addEventListener('click', () => {
      currentPower.linkedEffects.push({
        baseEffect: 'Affliction',
        baseCost: 1,
        ranks: currentPower.ranks || 1,
        extras: [],
        flaws: []
      });
      renderModalContent();
    });
  }

  modal.querySelectorAll('[data-remove-linked]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeLinked, 10);
      currentPower.linkedEffects.splice(idx, 1);
      renderModalContent();
    });
  });

  modal.querySelectorAll('.pb-linked-base').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt(sel.dataset.linkedIdx, 10);
      const chosen = BASE_EFFECTS.find(b => b.name === e.target.value);
      if (chosen && currentPower.linkedEffects[idx]) {
        currentPower.linkedEffects[idx].baseEffect = chosen.name;
        currentPower.linkedEffects[idx].baseCost = chosen.cost;
        renderModalContent();
      }
    });
  });

  modal.querySelectorAll('[data-linked-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.linkedDec, 10);
      if (currentPower.linkedEffects[idx] && currentPower.linkedEffects[idx].ranks > 1) {
        currentPower.linkedEffects[idx].ranks--;
        renderModalContent();
      }
    });
  });

  modal.querySelectorAll('[data-linked-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.linkedInc, 10);
      if (currentPower.linkedEffects[idx]) {
        currentPower.linkedEffects[idx].ranks++;
        renderModalContent();
      }
    });
  });

  // Alternate Effects
  const addAltBtn = modal.querySelector('#pb-btn-add-alt');
  if (addAltBtn) {
    addAltBtn.addEventListener('click', () => {
      const altName = prompt('Alternate Effect Name (e.g. Telekinetic Shield, Disintegrate):');
      if (altName) {
        currentPower.alternateEffects.push({
          name: altName,
          baseEffect: 'Damage',
          ranks: currentPower.ranks || 1,
          isDynamic: false
        });
        renderModalContent();
      }
    });
  }

  modal.querySelectorAll('[data-remove-alt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeAlt, 10);
      currentPower.alternateEffects.splice(idx, 1);
      renderModalContent();
    });
  });

  // Notes
  const notesArea = modal.querySelector('#pb-notes');
  if (notesArea) {
    notesArea.addEventListener('input', (e) => {
      currentPower.notes = e.target.value;
    });
  }

  // Save
  const savePower = () => {
    if (!currentPower.baseEffect) {
      showToast('Please select a Base Effect first!', 'warning');
      return;
    }
    if (!currentPower.name) {
      currentPower.name = currentPower.baseEffect;
    }

    const powerName = currentPower.name;
    if (editingPowerId) {
      store.updatePower(editingPowerId, currentPower);
      showToast(`Power "${powerName}" updated successfully!`, 'success');
    } else {
      store.addPower(currentPower);
      showToast(`Power "${powerName}" added successfully!`, 'success');
    }
    closePowerBuilder();
  };

  const saveBtn = modal.querySelector('#pb-save-btn');
  const saveFooterBtn = modal.querySelector('#pb-save-footer-btn');
  if (saveBtn) saveBtn.addEventListener('click', savePower);
  if (saveFooterBtn) saveFooterBtn.addEventListener('click', savePower);

  // Close / Cancel
  const closeBtn = modal.querySelector('#pb-close-btn');
  const cancelBtn = modal.querySelector('#pb-cancel-btn');
  if (closeBtn) closeBtn.addEventListener('click', closePowerBuilder);
  if (cancelBtn) cancelBtn.addEventListener('click', closePowerBuilder);
}
