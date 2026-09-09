// js/app.js
import { store } from './state.js';
import { ABILITIES } from './rules/abilities.js';
import { DEFENSES } from './rules/defenses.js';
import { SKILLS } from './rules/skills.js';
import { ADVANTAGES } from './rules/advantages.js';
import { calculatePowerTotalCost } from './rules/powers.js';
import { renderTargetedEffects } from './components/targetedEffects.js';
import { renderConditionsTracker } from './components/conditionsTracker.js';
import { openPowerBuilder } from './components/powerBuilder.js';
import { openSkillModal } from './components/skillModal.js';
import { openAdvantageModal } from './components/advantageModal.js';
import { openResourceModal } from './components/resourceModal.js';
import { renderReferencesTab } from './components/references.js';
import { exportToJson, importFromJson, exportToCsv, printSheet } from './storage/exportImport.js';
import { showToast, showConfirmModal } from './components/notifications.js';
import { initRoll20Print, openRoll20Preview } from './components/roll20Print.js';

let activeTab = 'sheet'; // 'sheet', 'resources', 'references'

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupNavigation();
  setupGlobalActions();
  setupKeyboardShortcuts();
  initRoll20Print();

  // Subscribe to store updates
  store.subscribe(() => {
    render();
  });

  render();
}

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      render();
    });
  });
}

function setupGlobalActions() {
  document.getElementById('btn-undo')?.addEventListener('click', () => store.undo());
  document.getElementById('btn-redo')?.addEventListener('click', () => store.redo());
  document.getElementById('btn-clear')?.addEventListener('click', async () => {
    const confirmed = await showConfirmModal({
      title: 'Reset Character',
      message: 'Are you sure you want to clear the entire character sheet and reset all Power Points?',
      confirmText: 'Reset Sheet',
      cancelText: 'Cancel',
      isDanger: true,
      icon: '<i class="ri-delete-bin-line"></i>'
    });
    if (confirmed) {
      store.resetCharacter();
      showToast('Character sheet reset successfully.', 'info');
    }
  });
  document.getElementById('btn-export')?.addEventListener('click', () => {
    exportToJson();
    showToast('Character exported to JSON file successfully!', 'success');
  });
  document.getElementById('btn-excel')?.addEventListener('click', () => {
    exportToCsv();
    showToast('Character exported to CSV/Excel file successfully!', 'success');
  });
  document.getElementById('btn-roll20-preview')?.addEventListener('click', () => {
    openRoll20Preview();
  });
  document.getElementById('btn-pdf')?.addEventListener('click', () => printSheet());

  // Import JSON
  const importInput = document.getElementById('file-import-input');
  document.getElementById('btn-import')?.addEventListener('click', () => {
    importInput?.click();
  });
  importInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importFromJson(file);
        showToast('Character imported from JSON file successfully!', 'success');
      } catch (err) {
        showToast('Failed to import JSON: ' + err.message, 'error');
      }
      e.target.value = '';
    }
  });

  // New character
  document.getElementById('btn-new-char')?.addEventListener('click', async () => {
    const confirmed = await showConfirmModal({
      title: 'Create New Character',
      message: 'Start a new character from scratch? Your current character data is automatically saved in browser storage.',
      confirmText: 'Create New',
      cancelText: 'Cancel',
      isDanger: false,
      icon: '<i class="ri-sparkling-line"></i>'
    });
    if (confirmed) {
      store.resetCharacter();
      showToast('New character ready.', 'success');
    }
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        store.redo();
      } else {
        e.preventDefault();
        store.undo();
      }
    }
  });
}

function render() {
  const char = store.character;

  // Header summary & warning
  renderHeaderPoints();

  // Tab switching
  const sheetView = document.getElementById('view-character-sheet');
  const resourcesView = document.getElementById('view-resources');
  const referencesView = document.getElementById('view-references');

  if (sheetView) sheetView.style.display = activeTab === 'sheet' ? 'block' : 'none';
  if (resourcesView) resourcesView.style.display = activeTab === 'resources' ? 'block' : 'none';
  if (referencesView) referencesView.style.display = activeTab === 'references' ? 'block' : 'none';

  if (activeTab === 'references') {
    renderReferencesTab(referencesView);
    return;
  }
  if (activeTab === 'resources') {
    renderResourcesTab(resourcesView);
    return;
  }

  // Character Sheet Tab
  renderHeroDetails();
  renderAbilities();
  renderDefenses();
  renderSkills();
  renderAdvantages();
  renderPowers();

  const targetedContainer = document.getElementById('targeted-effects-container');
  if (targetedContainer) renderTargetedEffects(targetedContainer);

  const conditionsContainer = document.getElementById('conditions-container');
  if (conditionsContainer) renderConditionsTracker(conditionsContainer);
}

function renderHeaderPoints() {
  const caps = store.getTradeOffCaps();

  // Undo / Redo states
  const undoBtn = document.getElementById('btn-undo');
  const redoBtn = document.getElementById('btn-redo');
  if (undoBtn) undoBtn.disabled = !store.canUndo();
  if (redoBtn) redoBtn.disabled = !store.canRedo();

  // Caps warnings
  const warningsBanner = document.getElementById('caps-warning-banner');
  if (warningsBanner) {
    if (caps.warnings.length > 0) {
      warningsBanner.style.display = 'flex';
      warningsBanner.innerHTML = `
        <span class="warning-icon"><i class="ri-alert-line"></i></span>
        <div class="warning-content">
          <div class="warning-header-line">
            <span class="warning-badge">Rule Check</span>
            <strong>Trade-off Cap Warning (PL ${store.character.powerLevel})</strong>
          </div>
          <div class="warning-items-list">
            ${caps.warnings.map(w => `<div class="warning-item-chip">${w}</div>`).join('')}
          </div>
        </div>
      `;
    } else {
      warningsBanner.style.display = 'none';
    }
  }

  // Bottom stats footer summary
  const spent = store.getTotalSpentPP();
  const budget = store.getTotalBudgetPP();
  const remaining = store.getRemainingPP();

  const statsFooter = document.getElementById('points-breakdown-footer');
  if (statsFooter) {
    statsFooter.innerHTML = `
      <div class="breakdown-item"><span>Abilities:</span> <strong>${store.getTotalAbilityPP()} PP</strong></div>
      <div class="breakdown-item"><span>Defenses:</span> <strong>${store.getTotalDefensePP()} PP</strong></div>
      <div class="breakdown-item"><span>Skills:</span> <strong>${store.getTotalSkillPP()} PP</strong></div>
      <div class="breakdown-item"><span>Advantages:</span> <strong>${store.getTotalAdvantagePP()} PP</strong></div>
      <div class="breakdown-item"><span>Powers:</span> <strong>${store.getTotalPowerPP()} PP</strong></div>
      <div class="breakdown-item total"><span>Total Spent:</span> <strong>${spent} / ${budget} PP</strong></div>
      <div class="breakdown-item remaining ${remaining < 0 ? 'negative' : ''}"><span>Remaining:</span> <strong>${remaining} PP</strong></div>
    `;
  }
}

function renderHeroDetails() {
  const char = store.character;

  const nameInput = document.getElementById('input-hero-name');
  if (nameInput && document.activeElement !== nameInput) nameInput.value = char.name;

  const playerInput = document.getElementById('input-player');
  if (playerInput && document.activeElement !== playerInput) playerInput.value = char.player;

  const identityInput = document.getElementById('input-identity');
  if (identityInput && document.activeElement !== identityInput) identityInput.value = char.identity;

  const baseInput = document.getElementById('input-base');
  if (baseInput && document.activeElement !== baseInput) baseInput.value = char.baseOfOperations;


  const plDisplay = document.getElementById('display-pl');
  if (plDisplay) plDisplay.textContent = char.powerLevel;

  const hpDisplay = document.getElementById('display-hp');
  if (hpDisplay) hpDisplay.textContent = char.heroPoints;
}

function renderAbilities() {
  const container = document.getElementById('abilities-grid');
  if (!container) return;

  container.innerHTML = ABILITIES.map(ab => {
    const val = store.getAbility(ab.key);
    return `
      <div class="ability-card" title="${ab.desc}">
        <div class="ab-top">
          <span class="ab-key">${ab.key}</span>
          <span class="ab-name">${ab.name}</span>
          <span class="ab-cost">${val * 2} PP</span>
        </div>
        <div class="ab-controls">
          <button class="step-btn" data-ab-dec="${ab.key}">-</button>
          <span class="ab-val ${val < 0 ? 'negative' : ''}">${val >= 0 ? '+' + val : val}</span>
          <button class="step-btn" data-ab-inc="${ab.key}">+</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-ab-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.abDec;
      store.setAbility(k, store.getAbility(k) - 1);
    });
  });

  container.querySelectorAll('[data-ab-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.abInc;
      store.setAbility(k, store.getAbility(k) + 1);
    });
  });
}

function renderDefenses() {
  const container = document.getElementById('defenses-grid');
  if (!container) return;

  container.innerHTML = DEFENSES.map(def => {
    const base = store.getDefenseBase(def.key);
    const bought = store.character.defensesBought[def.key] || 0;
    const total = store.getDefenseTotal(def.key);

    return `
      <div class="defense-card" title="${def.desc}">
        <div class="def-header">
          <span class="def-name">${def.name}</span>
          <span class="def-base-info">${def.baseAbility} ${base}</span>
        </div>
        <div class="def-body">
          <div class="def-total-box">
            <span class="def-total">${total >= 0 ? '+' + total : total}</span>
          </div>
          ${!def.isDerived && def.key !== 'TOUGHNESS' ? `
            <div class="def-stepper">
              <button class="step-btn" data-def-dec="${def.key}">-</button>
              <span class="def-bought-val">+${bought} PP</span>
              <button class="step-btn" data-def-inc="${def.key}">+</button>
            </div>
          ` : `
            <div class="def-stepper derived">
              <span class="def-derived-label">${def.key === 'TOUGHNESS' ? 'Via STA/Armor' : 'Derived'}</span>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-def-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.defDec;
      const cur = store.character.defensesBought[k] || 0;
      if (cur > 0) store.setDefense(k, cur - 1);
    });
  });

  container.querySelectorAll('[data-def-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.defInc;
      const cur = store.character.defensesBought[k] || 0;
      store.setDefense(k, cur + 1);
    });
  });
}

function renderSkills() {
  const container = document.getElementById('skills-list-container');
  const countBadge = document.getElementById('skills-pp-badge');
  if (!container) return;

  const skills = store.character.skills;
  const totalPP = store.getTotalSkillPP();
  if (countBadge) countBadge.textContent = `${totalPP} PP`;

  // Wire header "+ Add Skill" button
  const addBtn = document.getElementById('btn-open-skill-modal');
  if (addBtn && !addBtn._wired) {
    addBtn.addEventListener('click', () => openSkillModal());
    addBtn._wired = true;
  }

  if (skills.length === 0) {
    container.innerHTML = `
      <div class="empty-hint">
        No skills added yet.
        <button class="btn btn-secondary btn-xs mt-2" onclick="openSkillModal()">+ Add First Skill</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="skills-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Skill & Subtype</th>
            <th>Governing Ability</th>
            <th>Check Bonus</th>
            <th>Trained Ranks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${skills.map(s => {
            const rule = SKILLS.find(r => r.name === s.name);
            const abKey = rule?.ability || 'INT';
            const abVal = store.getAbility(abKey);
            const totalBonus = abVal + s.ranks;
            return `
              <tr>
                <td>
                  <strong class="clickable-skill-name" data-skill-edit="${s.id}" title="Click to edit">${s.name}</strong>
                  ${s.subtype ? `<span class="subtype">(${s.subtype})</span>` : ''}
                </td>
                <td><span class="badge-text">${abKey} (${abVal >= 0 ? '+' : ''}${abVal})</span></td>
                <td><span class="highlight-val">${totalBonus >= 0 ? '+' : ''}${totalBonus}</span></td>
                <td>
                  <div class="stepper-compact">
                    <button class="step-btn-xs" data-skill-dec="${s.id}">-</button>
                    <span class="step-val-xs">${s.ranks}</span>
                    <button class="step-btn-xs" data-skill-inc="${s.id}">+</button>
                  </div>
                </td>
                <td>
                  <div class="row-actions-group">
                    <button class="btn-action-icon" data-skill-edit="${s.id}" title="Edit Subtype / Ranks"><i class="ri-edit-line"></i></button>
                    <button class="btn-delete-row" data-skill-del="${s.id}" title="Remove Skill"><i class="ri-close-line"></i></button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('[data-skill-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = skills.find(x => x.id === btn.dataset.skillDec);
      if (s) store.updateSkill(s.id, s.ranks - 1);
    });
  });

  container.querySelectorAll('[data-skill-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = skills.find(x => x.id === btn.dataset.skillInc);
      if (s) store.updateSkill(s.id, s.ranks + 1);
    });
  });

  container.querySelectorAll('[data-skill-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.removeSkill(btn.dataset.skillDel);
    });
  });

  container.querySelectorAll('[data-skill-edit]').forEach(el => {
    el.addEventListener('click', () => {
      openSkillModal(el.dataset.skillEdit);
    });
  });
}

function renderAdvantages() {
  const container = document.getElementById('advantages-list-container');
  const countBadge = document.getElementById('advantages-pp-badge');
  if (!container) return;

  const advs = store.character.advantages;
  const totalPP = store.getTotalAdvantagePP();
  if (countBadge) countBadge.textContent = `${totalPP} PP`;

  // Wire header "+ Add Advantage" button
  const addBtn = document.getElementById('btn-open-adv-modal');
  if (addBtn && !addBtn._wired) {
    addBtn.addEventListener('click', () => openAdvantageModal());
    addBtn._wired = true;
  }

  if (advs.length === 0) {
    container.innerHTML = `
      <div class="empty-hint">
        No advantages added yet.
        <button class="btn btn-secondary btn-xs mt-2" onclick="openAdvantageModal()">+ Open Advantages Catalog (56 Choices)</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="tags-grid">
      ${advs.map(a => {
        const rule = ADVANTAGES.find(r => r.name === a.name);
        return `
          <div class="adv-chip" title="${rule?.desc || ''}">
            <span class="adv-name clickable-adv" data-adv-click="${a.name}">
              ${a.name} ${a.ranks > 1 ? `(${a.ranks})` : ''}
            </span>
            <div class="adv-actions">
              <button class="step-btn-tiny" data-adv-dec="${a.name}" title="Decrease Rank">-</button>
              <button class="step-btn-tiny" data-adv-inc="${a.name}" title="Increase Rank">+</button>
              <button class="del-btn-tiny" data-adv-del="${a.name}" title="Remove from Sheet"><i class="ri-close-line"></i></button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('[data-adv-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const a = advs.find(x => x.name === btn.dataset.advDec);
      if (a) store.updateAdvantage(a.name, a.ranks - 1);
    });
  });

  container.querySelectorAll('[data-adv-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const a = advs.find(x => x.name === btn.dataset.advInc);
      if (a) store.updateAdvantage(a.name, a.ranks + 1);
    });
  });

  container.querySelectorAll('[data-adv-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.removeAdvantage(btn.dataset.advDel);
    });
  });

  container.querySelectorAll('[data-adv-click]').forEach(el => {
    el.addEventListener('click', () => {
      openAdvantageModal();
    });
  });
}

function renderPowers() {
  const container = document.getElementById('powers-list-container');
  const countBadge = document.getElementById('powers-pp-badge');
  if (!container) return;

  const powers = store.character.powers;
  const totalPP = store.getTotalPowerPP();
  if (countBadge) countBadge.textContent = `${totalPP} PP`;

  if (powers.length === 0) {
    container.innerHTML = `<div class="empty-hint">No powers created yet. Click "+ New Power (Power Builder)" to design custom superpowers!</div>`;
    return;
  }

  container.innerHTML = `
    <div class="powers-cards-grid">
      ${powers.map(p => {
        const cost = calculatePowerTotalCost(p);
        return `
          <div class="power-card">
            <div class="power-header">
              <div class="power-name-group">
                <span class="power-icon"><i class="ri-flashlight-line"></i></span>
                <h4 class="power-name">${p.name}</h4>
                <span class="power-cost-tag">${cost} PP</span>
              </div>
              <div class="power-card-actions">
                <button class="btn btn-ghost btn-xs" data-power-edit="${p.id}"><i class="ri-edit-line"></i> Edit</button>
                <button class="btn btn-ghost btn-xs text-danger" data-power-del="${p.id}"><i class="ri-delete-bin-line"></i></button>
              </div>
            </div>

            <div class="power-main-desc">
              <strong>${p.baseEffect} ${p.ranks}</strong>
              <span class="power-meta-info">(${p.range || 'Close'}, ${p.activation || 'Standard'})</span>
            </div>

            ${p.descriptors && p.descriptors.length > 0 ? `
              <div class="power-descriptors">
                ${p.descriptors.map(d => `<span class="desc-pill">${d}</span>`).join('')}
              </div>
            ` : ''}

            ${(p.extras.length > 0 || p.flaws.length > 0) ? `
              <div class="power-modifiers-summary">
                ${p.extras.map(e => `<span class="mod-tag extra">+${e.name}</span>`).join('')}
                ${p.flaws.map(f => `<span class="mod-tag flaw">-${f.name}</span>`).join('')}
              </div>
            ` : ''}

            ${p.linkedEffects && p.linkedEffects.length > 0 ? `
              <div class="linked-summary">
                <span class="linked-label">Linked:</span>
                ${p.linkedEffects.map(l => `${l.baseEffect} ${l.ranks}`).join(', ')}
              </div>
            ` : ''}

            ${p.alternateEffects && p.alternateEffects.length > 0 ? `
              <div class="array-summary">
                <span class="array-label">Array:</span>
                ${p.alternateEffects.map(a => a.name || a.baseEffect).join(' | ')}
              </div>
            ` : ''}

            ${p.notes ? `<p class="power-notes-text">${p.notes}</p>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('[data-power-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = powers.find(x => x.id === btn.dataset.powerEdit);
      if (p) openPowerBuilder(p);
    });
  });

  container.querySelectorAll('[data-power-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pId = btn.dataset.powerDel;
      const power = powers.find(x => x.id === pId);
      const powerName = power ? power.name : 'Power';
      const confirmed = await showConfirmModal({
        title: 'Delete Power',
        message: `Are you sure you want to delete power "${powerName}"?`,
        confirmText: 'Delete Power',
        cancelText: 'Cancel',
        isDanger: true,
        icon: '<i class="ri-delete-bin-line"></i>'
      });
      if (confirmed) {
        store.removePower(pId);
        showToast(`Power "${powerName}" deleted successfully.`, 'info');
      }
    });
  });
}

let activeResourceCategory = 'all';

function renderResourcesTab(container) {
  const char = store.character;
  const budget = store.getEquipmentBudgetInfo();

  const filtered = char.resources.filter(r => {
    if (activeResourceCategory === 'all') return true;
    return r.type === activeResourceCategory;
  });

  const getResIcon = (type) => {
    switch (type) {
      case 'Gear': return '<i class="ri-sword-line"></i>';
      case 'Gadget': return '<i class="ri-smartphone-line"></i>';
      case 'Vehicle': return '<i class="ri-car-line"></i>';
      case 'Headquarters': return '<i class="ri-building-line"></i>';
      default: return '<i class="ri-archive-line"></i>';
    }
  };

  container.innerHTML = `
    <div class="resources-page">
      <div class="res-header">
        <div>
          <h2>Equipment & Resources Library</h2>
          <p>Collection of gear, gadgets, combat vehicles, and headquarters (1 PP = 5 EP).</p>
        </div>
        <button class="btn btn-primary" id="btn-main-add-res"><i class="ri-add-line"></i> Add Item / Preset</button>
      </div>

      <!-- EQUIPMENT ADVANTAGE SYNC & BUDGET CARD -->
      <div class="equipment-budget-banner ${budget.isOverBudget ? 'banner-warn' : 'banner-ok'}">
        <div class="budget-banner-left">
          <div class="budget-stat-group">
            <span class="budget-label">Total EP Used</span>
            <span class="budget-val highlight">${budget.totalEP} EP</span>
          </div>
          <div class="budget-divider">/</div>
          <div class="budget-stat-group">
            <span class="budget-label">Equipment Advantage Capacity</span>
            <span class="budget-val">${budget.maxEP} EP (${budget.ranks} Ranks)</span>
          </div>
        </div>

        <div class="budget-banner-right">
          ${budget.isOverBudget ? `
            <div class="budget-status-alert">
              <span class="status-icon"><i class="ri-alert-line"></i></span>
              <span>Deficit: <strong>${budget.totalEP - budget.maxEP} EP</strong> (Requires Rank ${budget.neededRanks} Equipment)</span>
            </div>
            <button class="btn btn-warning btn-xs" id="btn-sync-equipment">
              <i class="ri-flashlight-line"></i> Sync Advantage (${budget.neededRanks} Ranks / ${budget.neededRanks} PP)
            </button>
          ` : `
            <div class="budget-status-ok">
              <span class="status-icon"><i class="ri-checkbox-circle-line"></i></span>
              <span>Budget OK (Remaining Capacity: <strong>${budget.remainingEP} EP</strong>)</span>
            </div>
            ${budget.ranks > budget.neededRanks ? `
              <button class="btn btn-ghost btn-xs" id="btn-sync-equipment" title="Reduce unused ranks">
                <i class="ri-flashlight-line"></i> Adjust to ${budget.neededRanks} Ranks
              </button>
            ` : ''}
          `}
        </div>
      </div>

      <!-- FILTER & QUICK BUTTONS -->
      <div class="res-categories-bar">
        <div class="filter-pills-bar">
          <button class="filter-chip ${activeResourceCategory === 'all' ? 'active' : ''}" data-res-filter="all">
            All (${char.resources.length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Gear' ? 'active' : ''}" data-res-filter="Gear">
            <i class="ri-sword-line"></i> Gear (${char.resources.filter(r => r.type === 'Gear').length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Gadget' ? 'active' : ''}" data-res-filter="Gadget">
            <i class="ri-smartphone-line"></i> Gadget (${char.resources.filter(r => r.type === 'Gadget').length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Vehicle' ? 'active' : ''}" data-res-filter="Vehicle">
            <i class="ri-car-line"></i> Vehicles (${char.resources.filter(r => r.type === 'Vehicle').length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Headquarters' ? 'active' : ''}" data-res-filter="Headquarters">
            <i class="ri-building-line"></i> HQ (${char.resources.filter(r => r.type === 'Headquarters').length})
          </button>
        </div>

        <div class="quick-add-group">
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Gear"><i class="ri-sword-line"></i> Gear</button>
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Gadget"><i class="ri-smartphone-line"></i> Gadget</button>
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Vehicle"><i class="ri-car-line"></i> Vehicle</button>
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Headquarters"><i class="ri-building-line"></i> HQ</button>
        </div>
      </div>

      <div class="resources-list-wrap">
        ${filtered.length === 0 ? `
          <div class="empty-hint">
            ${char.resources.length === 0
              ? 'Equipment library is empty. Click "+ Add Item / Preset" above to choose official M&M 3e weapons, gadgets, vehicles, or secret headquarters!'
              : `No items in category ${activeResourceCategory}.`}
          </div>
        ` : `
          <div class="res-grid">
            ${filtered.map((r, i) => `
              <div class="res-card">
                <div class="res-card-top">
                  <div class="res-title-box">
                    <span class="res-icon">${getResIcon(r.type)}</span>
                    <div>
                      <span class="badge badge-subtle">${r.type.toUpperCase()}</span>
                      <strong class="res-card-name">${r.name}</strong>
                    </div>
                  </div>
                  <div class="res-top-actions">
                    <span class="ep-tag">${r.epCost ?? r.cost ?? 0} EP</span>
                    <button class="btn-icon-subtle" data-edit-res="${r.id || i}" title="Edit Item"><i class="ri-edit-line"></i></button>
                    <button class="btn-icon-subtle text-danger" data-del-res="${r.id || i}" title="Delete Item"><i class="ri-delete-bin-line"></i></button>
                  </div>
                </div>
                <p class="res-card-desc">${r.desc || r.notes || '<span class="text-muted">No description notes.</span>'}</p>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelector('#btn-main-add-res')?.addEventListener('click', () => {
    openResourceModal(null, activeResourceCategory !== 'all' ? activeResourceCategory : 'Gear');
  });

  container.querySelector('#btn-sync-equipment')?.addEventListener('click', () => {
    store.syncEquipmentAdvantage();
  });

  container.querySelectorAll('[data-res-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeResourceCategory = btn.dataset.resFilter;
      renderResourcesTab(container);
    });
  });

  container.querySelectorAll('[data-quick-add-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      openResourceModal(null, btn.dataset.quickAddType);
    });
  });

  container.querySelectorAll('[data-edit-res]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idOrIdx = btn.dataset.editRes;
      const resItem = char.resources.find(r => r.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      if (resItem) {
        openResourceModal(resItem);
      }
    });
  });

  container.querySelectorAll('[data-del-res]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idOrIdx = btn.dataset.delRes;
      const item = char.resources.find(r => r.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      const itemName = item ? item.name : 'this item';
      const confirmed = await showConfirmModal({
        title: 'Delete Equipment / Resource',
        message: `Are you sure you want to remove "${itemName}" from your equipment library?`,
        confirmText: 'Delete Item',
        cancelText: 'Cancel',
        isDanger: true,
        icon: '<i class="ri-delete-bin-line"></i>'
      });
      if (confirmed) {
        if (item && item.id) {
          store.removeResource(item.id);
        } else {
          char.resources.splice(parseInt(idOrIdx, 10), 1);
          store.pushHistory();
          store.notify();
        }
        showToast(`"${itemName}" removed from library.`, 'info');
      }
    });
  });
}

// Global modal triggers for Skills, Advantages, and Resources
window.openAddSkillModal = function(id = null) {
  openSkillModal(id);
};

window.openAddAdvantageModal = function() {
  openAdvantageModal();
};

window.openAddResourceModal = function(type = 'Gear') {
  openResourceModal(null, type);
};

// Wire header inputs
document.getElementById('input-hero-name')?.addEventListener('input', (e) => {
  store.character.name = e.target.value;
  store.saveToStorage();
});
document.getElementById('input-player')?.addEventListener('input', (e) => {
  store.character.player = e.target.value;
  store.saveToStorage();
});
document.getElementById('input-identity')?.addEventListener('input', (e) => {
  store.character.identity = e.target.value;
  store.saveToStorage();
});
document.getElementById('input-base')?.addEventListener('input', (e) => {
  store.character.baseOfOperations = e.target.value;
  store.saveToStorage();
});


document.getElementById('btn-pl-dec')?.addEventListener('click', () => {
  if (store.character.powerLevel > 1) {
    store.character.powerLevel--;
    store.pushHistory();
    store.notify();
  }
});
document.getElementById('btn-pl-inc')?.addEventListener('click', () => {
  store.character.powerLevel++;
  store.pushHistory();
  store.notify();
});

document.getElementById('btn-hp-dec')?.addEventListener('click', () => {
  if (store.character.heroPoints > 0) {
    store.character.heroPoints--;
    store.pushHistory();
    store.notify();
  }
});
document.getElementById('btn-hp-inc')?.addEventListener('click', () => {
  store.character.heroPoints++;
  store.pushHistory();
  store.notify();
});

// Wire New Power button
document.getElementById('btn-new-power')?.addEventListener('click', () => {
  openPowerBuilder();
});
