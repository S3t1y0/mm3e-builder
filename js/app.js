// js/app.js
import { store } from './state.js';
import { ABILITIES } from './rules/abilities.js';
import { DEFENSES } from './rules/defenses.js';
import { SKILLS } from './rules/skills.js';
import { ADVANTAGES } from './rules/advantages.js';
import {
  calculatePowerTotalCost,
  calculateEffectCost,
  calculatePowerCombatMetrics,
  calculatePowerDetailedBreakdown,
  BASE_EFFECTS,
  CONFIGURABLE_EFFECTS,
  EXTRAS,
  FLAWS
} from './rules/powers.js';
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
import { renderWizard } from './components/wizard/wizardController.js';

let activeTab = 'sheet'; // 'sheet', 'wizard', 'resources', 'references'
let activeSheetSkillCategory = 'All';
let sheetSkillSearchQuery = '';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

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

  // Mobile Drawer Actions
  const drawerOverlay = document.getElementById('mobile-drawer-overlay');
  const openDrawerBtn = document.getElementById('btn-mobile-menu');
  const closeDrawerBtn = document.getElementById('btn-close-drawer');

  const openDrawer = () => drawerOverlay?.classList.add('open');
  const closeDrawer = () => drawerOverlay?.classList.remove('open');

  openDrawerBtn?.addEventListener('click', openDrawer);
  closeDrawerBtn?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });

  const bindDrawerAction = (id, targetId) => {
    document.getElementById(id)?.addEventListener('click', () => {
      closeDrawer();
      document.getElementById(targetId)?.click();
    });
  };

  bindDrawerAction('drawer-btn-undo', 'btn-undo');
  bindDrawerAction('drawer-btn-redo', 'btn-redo');
  bindDrawerAction('drawer-btn-new', 'btn-new-char');
  bindDrawerAction('drawer-btn-clear', 'btn-clear');
  bindDrawerAction('drawer-btn-export', 'btn-export');
  bindDrawerAction('drawer-btn-excel', 'btn-excel');
  bindDrawerAction('drawer-btn-import', 'btn-import');
  bindDrawerAction('drawer-btn-roll20', 'btn-roll20-preview');
  bindDrawerAction('drawer-btn-print', 'btn-pdf');

  document.getElementById('drawer-btn-wizard')?.addEventListener('click', () => {
    closeDrawer();
    activeTab = 'wizard';
    document.querySelectorAll('.nav-tab-btn').forEach(t => t.classList.toggle('active', t.dataset.tab === 'wizard'));
    render();
  });

  // Swipe-to-dismiss gesture for mobile drawer (swipe right >= 50px)
  let touchStartX = 0;
  let touchStartY = 0;
  const drawerEl = document.getElementById('mobile-action-drawer');
  drawerEl?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  drawerEl?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = Math.abs(touchEndY - touchStartY);
    if (diffX > 50 && diffY < 100) {
      closeDrawer();
    }
  }, { passive: true });
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
  const wizardView = document.getElementById('view-wizard');
  const resourcesView = document.getElementById('view-resources');
  const referencesView = document.getElementById('view-references');
  const statsFooter = document.getElementById('points-breakdown-footer');

  if (sheetView) sheetView.style.display = activeTab === 'sheet' ? 'block' : 'none';
  if (wizardView) wizardView.style.display = activeTab === 'wizard' ? 'block' : 'none';
  if (resourcesView) resourcesView.style.display = activeTab === 'resources' ? 'block' : 'none';
  if (referencesView) referencesView.style.display = activeTab === 'references' ? 'block' : 'none';

  if (statsFooter) {
    statsFooter.style.display = activeTab === 'wizard' ? 'none' : 'flex';
  }

  if (activeTab === 'wizard') {
    renderWizard(wizardView, (newTab) => {
      activeTab = newTab || 'sheet';
      document.querySelectorAll('.nav-tab-btn').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
      render();
    });
    return;
  }

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

  // Bottom stats footer summary (Responsive Mobile Dock)
  const spent = store.getTotalSpentPP();
  const budget = store.getTotalBudgetPP();
  const remaining = store.getRemainingPP();

  const drawerName = document.getElementById('drawer-char-name');
  const drawerPL = document.getElementById('drawer-char-pl');
  if (drawerName) drawerName.textContent = store.character.name || 'Hero Name';
  if (drawerPL) drawerPL.textContent = `PL ${store.character.powerLevel} • Mutants & Masterminds 3e`;

  const statsFooter = document.getElementById('points-breakdown-footer');
  if (statsFooter) {
    const wasOpen = statsFooter.querySelector('#pp-dock-details')?.classList.contains('open');
    statsFooter.innerHTML = `
      <div class="pp-dock-summary">
        <div class="dock-summary-left">
          <span class="dock-label">TOTAL SPENT</span>
          <strong class="dock-val">${spent} / ${budget} PP</strong>
        </div>
        <div class="dock-summary-right">
          <div class="dock-rem-badge ${remaining < 0 ? 'negative' : ''}">
            <span>Rem:</span> <strong>${remaining} PP</strong>
          </div>
          <button id="btn-toggle-dock-details" class="dock-toggle-btn" aria-label="Toggle PP Details" title="Toggle PP Breakdown">
            <i class="${wasOpen ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}"></i>
          </button>
        </div>
      </div>
      <div class="pp-dock-details ${wasOpen ? 'open' : ''}" id="pp-dock-details">
        <div class="breakdown-item"><span>Abilities:</span> <strong>${store.getTotalAbilityPP()} PP</strong></div>
        <div class="breakdown-item"><span>Defenses:</span> <strong>${store.getTotalDefensePP()} PP</strong></div>
        <div class="breakdown-item"><span>Skills:</span> <strong>${store.getTotalSkillPP()} PP</strong></div>
        <div class="breakdown-item"><span>Advantages:</span> <strong>${store.getTotalAdvantagePP()} PP</strong></div>
        <div class="breakdown-item"><span>Powers:</span> <strong>${store.getTotalPowerPP()} PP</strong></div>
        <div class="breakdown-item total"><span>Total Spent:</span> <strong>${spent} / ${budget} PP</strong></div>
        <div class="breakdown-item remaining ${remaining < 0 ? 'negative' : ''}"><span>Remaining:</span> <strong>${remaining} PP</strong></div>
      </div>
    `;

    statsFooter.querySelector('#btn-toggle-dock-details')?.addEventListener('click', () => {
      const details = statsFooter.querySelector('#pp-dock-details');
      const icon = statsFooter.querySelector('#btn-toggle-dock-details i');
      if (details) {
        details.classList.toggle('open');
        if (icon) {
          icon.className = details.classList.contains('open') ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line';
        }
      }
    });
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

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAdvCategoryIcon(category) {
  switch ((category || '').toLowerCase()) {
    case 'combat': return 'ri-sword-line';
    case 'fortune': return 'ri-clover-line';
    case 'skill': return 'ri-tools-line';
    case 'general': default: return 'ri-medal-line';
  }
}

function renderEffectDetailedSubOptions(effect) {
  if (!effect) return '';
  const baseName = effect.baseEffect || effect.name;
  const cfg = effect.config || {};
  const cards = [];

  if (baseName === 'Senses' && Array.isArray(cfg.selectedFaculties) && cfg.selectedFaculties.length > 0) {
    const facultyList = CONFIGURABLE_EFFECTS?.Senses?.faculties || [];
    cfg.selectedFaculties.forEach(f => {
      const fId = typeof f === 'object' && f !== null ? (f.id || f.name) : f;
      const def = facultyList.find(x => x.id === fId || x.name === fId);
      const name = def?.name || (typeof f === 'object' ? f.name : f);
      const pts = def?.pts || (typeof f === 'object' ? f.pts : 1);
      const icon = def?.icon || 'ri-eye-line';
      const desc = def?.desc || 'Superhuman sensory faculty expanded beyond normal limits.';
      cards.push(`
        <div class="power-option-explain-card">
          <div class="power-option-explain-header">
            <span class="power-option-title"><i class="${icon}"></i> ${escapeHtml(name)}</span>
            <span class="power-option-cost-tag">${pts} PP</span>
          </div>
          <p class="power-option-desc">${escapeHtml(desc)}</p>
        </div>
      `);
    });
  } else if (baseName === 'Immunity' && Array.isArray(cfg.selectedPresets) && cfg.selectedPresets.length > 0) {
    const presetList = CONFIGURABLE_EFFECTS?.Immunity?.presets || [];
    cfg.selectedPresets.forEach(p => {
      const pId = typeof p === 'object' && p !== null ? (p.id || p.name) : p;
      const def = presetList.find(x => x.id === pId || x.name === pId);
      const name = def?.name || (typeof p === 'object' ? p.name : p);
      const ranks = def?.ranks || (typeof p === 'object' ? p.ranks : 1);
      const icon = def?.icon || 'ri-shield-check-line';
      const desc = def?.desc || 'Complete immunity requiring no resistance check against matching hazards.';
      cards.push(`
        <div class="power-option-explain-card">
          <div class="power-option-explain-header">
            <span class="power-option-title"><i class="${icon}"></i> ${escapeHtml(name)}</span>
            <span class="power-option-cost-tag">${ranks} PP (${ranks} R)</span>
          </div>
          <p class="power-option-desc">${escapeHtml(desc)}</p>
        </div>
      `);
    });
  } else if (baseName === 'Movement' && Array.isArray(cfg.selectedModes) && cfg.selectedModes.length > 0) {
    const modeList = CONFIGURABLE_EFFECTS?.Movement?.modes || [];
    cfg.selectedModes.forEach(m => {
      const mId = typeof m === 'object' && m !== null ? (m.id || m.name) : m;
      const def = modeList.find(x => x.id === mId || x.name === mId);
      const name = def?.name || (typeof m === 'object' ? m.name : m);
      const mRanks = typeof m === 'object' && m !== null && m.ranks ? Number(m.ranks) : (def?.ranks || 1);
      const icon = def?.icon || 'ri-footprint-line';
      const desc = def?.desc || 'Superhuman locomotion mode traversing specialized obstacles or terrain.';
      cards.push(`
        <div class="power-option-explain-card">
          <div class="power-option-explain-header">
            <span class="power-option-title"><i class="${icon}"></i> ${escapeHtml(name)}</span>
            <span class="power-option-cost-tag">${mRanks * 2} PP (Rank ${mRanks})</span>
          </div>
          <p class="power-option-desc">${escapeHtml(desc)}</p>
        </div>
      `);
    });
  } else if (baseName === 'Environment' && Array.isArray(cfg.selectedElements) && cfg.selectedElements.length > 0) {
    const elemList = CONFIGURABLE_EFFECTS?.Environment?.elements || [];
    cfg.selectedElements.forEach(e => {
      const eId = typeof e === 'object' && e !== null ? (e.id || e.name) : e;
      const def = elemList.find(x => x.id === eId || x.name === eId);
      const name = def?.name || (typeof e === 'object' ? e.name : e);
      const cost = def?.cost || (typeof e === 'object' ? e.cost : 1);
      const icon = def?.icon || 'ri-sun-line';
      const desc = def?.desc || 'Localized weather hazard or ambient environmental disruption.';
      cards.push(`
        <div class="power-option-explain-card">
          <div class="power-option-explain-header">
            <span class="power-option-title"><i class="${icon}"></i> ${escapeHtml(name)}</span>
            <span class="power-option-cost-tag">${cost} PP</span>
          </div>
          <p class="power-option-desc">${escapeHtml(desc)}</p>
        </div>
      `);
    });
  } else if (baseName === 'Illusion' && Array.isArray(cfg.senses) && cfg.senses.length > 0) {
    cfg.senses.forEach(s => {
      cards.push(`
        <div class="power-option-explain-card">
          <div class="power-option-explain-header">
            <span class="power-option-title"><i class="ri-sparkling-line"></i> ${escapeHtml(s)} Impression</span>
            <span class="power-option-cost-tag">1 PP/sense</span>
          </div>
          <p class="power-option-desc">Creates convincing phantom sensory impressions for ${escapeHtml(s)}. Observers make an Insight check to recognize the illusion.</p>
        </div>
      `);
    });
  } else if (baseName === 'Enhanced Trait' && cfg.traitName) {
    cards.push(`
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-arrow-up-circle-line"></i> Enhanced ${escapeHtml(cfg.traitName)}</span>
          <span class="power-option-cost-tag">+${effect.ranks || 1} Ranks</span>
        </div>
        <p class="power-option-desc">Increases ${escapeHtml(cfg.traitCategory || 'trait')} ${escapeHtml(cfg.traitName)} by +${effect.ranks || 1} rank while this power is active.</p>
      </div>
    `);
  } else if (baseName === 'Affliction' && (cfg.firstDegree || cfg.secondDegree || cfg.thirdDegree)) {
    const res = cfg.resistance || effect.resistance || 'Fortitude';
    cards.push(`
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-pulse-line"></i> 1st Degree: ${escapeHtml(cfg.firstDegree || 'Dazed')}</span>
          <span class="power-option-cost-tag">Failed by 1-5 vs ${res}</span>
        </div>
        <p class="power-option-desc">Initial debilitating condition inflicted when target fails resistance check.</p>
      </div>
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-alert-line"></i> 2nd Degree: ${escapeHtml(cfg.secondDegree || 'Stunned')}</span>
          <span class="power-option-cost-tag">Failed by 6-10 vs ${res}</span>
        </div>
        <p class="power-option-desc">Severe intermediate condition (e.g. defenseless, immobilized, or losing actions).</p>
      </div>
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-skull-line"></i> 3rd Degree: ${escapeHtml(cfg.thirdDegree || 'Paralyzed')}</span>
          <span class="power-option-cost-tag">Failed by 11+ vs ${res}</span>
        </div>
        <p class="power-option-desc">Completely incapacitating condition lasting until recovery or treated.</p>
      </div>
    `);
  } else if (baseName === 'Comprehend' && Array.isArray(cfg.selectedModes) && cfg.selectedModes.length > 0) {
    cfg.selectedModes.forEach(m => {
      cards.push(`
        <div class="power-option-explain-card">
          <div class="power-option-explain-header">
            <span class="power-option-title"><i class="ri-translate-2"></i> ${escapeHtml(m)}</span>
            <span class="power-option-cost-tag">Comprehend Mode</span>
          </div>
          <p class="power-option-desc">Ability to understand, speak, or read through the medium of ${escapeHtml(m)}.</p>
        </div>
      `);
    });
  } else if (baseName === 'Morph' && cfg.scope) {
    const scopes = ['', 'Single Form (1 R)', 'Narrow Group (2 R)', 'Broad Group (3 R)', 'Any Form (4 R)'];
    cards.push(`
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-user-shared-line"></i> Scope: ${escapeHtml(scopes[cfg.scope] || 'Form')}</span>
          <span class="power-option-cost-tag">${cfg.scope * 5} PP</span>
        </div>
        <p class="power-option-desc">Alters cosmetic appearance and physical form with a +20 circumstance bonus to Deception checks to disguise.</p>
      </div>
    `);
  } else if (baseName === 'Weaken' && cfg.traitName) {
    cards.push(`
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-arrow-down-circle-line"></i> Weaken ${escapeHtml(cfg.traitName)}</span>
          <span class="power-option-cost-tag">vs ${cfg.resistance || effect.resistance || 'Fortitude'}</span>
        </div>
        <p class="power-option-desc">Lowers target's ${escapeHtml(cfg.traitName)} by 1 point per degree of failure on save check. Recovers 1 point per round.</p>
      </div>
    `);
  } else if (baseName === 'Nullify' && (cfg.descriptor || cfg.customDescriptor)) {
    const desc = cfg.customDescriptor || cfg.descriptor;
    cards.push(`
      <div class="power-option-explain-card">
        <div class="power-option-explain-header">
          <span class="power-option-title"><i class="ri-prohibited-line"></i> Counter: ${escapeHtml(desc)}</span>
          <span class="power-option-cost-tag">Opposed vs Will/Rank</span>
        </div>
        <p class="power-option-desc">Counters and shuts down active powers matching the ${escapeHtml(desc)} descriptor.</p>
      </div>
    `);
  }

  if (cards.length === 0) return '';
  return `
    <div class="power-explained-options-grid">
      ${cards.join('')}
    </div>
  `;
}

function renderEffectSubOptionsSummary(effect) {
  return renderEffectDetailedSubOptions(effect);
}

function openSheetSpecializationModal(initialBaseSkill = 'Close Combat') {
  let selectedBase = initialBaseSkill;
  let customSubtype = '';
  let initialRanks = 2;
  const mount = document.getElementById('sheet-spec-modal-mount');
  if (!mount) return;

  const baseSkillOptions = [
    { name: 'Close Combat', ability: 'FGT', icon: 'ri-sword-line', desc: 'Melee weapon or attack form accuracy (e.g. Swords, Unarmed, Claws).' },
    { name: 'Ranged Combat', ability: 'DEX', icon: 'ri-crosshair-2-line', desc: 'Ranged weapon accuracy (e.g. Guns, Bows, Energy Blasts).' },
    { name: 'Expertise', ability: 'INT', icon: 'ri-book-open-line', desc: 'Field of professional or academic knowledge (e.g. Science, Criminology, Magic).' }
  ];

  function updateModalView() {
    const rule = SKILLS.find(s => s.name === selectedBase) || baseSkillOptions[0];
    const abilityKey = rule.ability || 'INT';
    const abilityVal = store.getAbility(abilityKey);
    const totalBonus = abilityVal + initialRanks;
    const ppCost = Math.ceil(initialRanks / 2);
    const commonSubtypes = rule.commonSubtypes || [];

    mount.innerHTML = `
      <div class="wizard-spec-modal-overlay open" id="sheet-spec-overlay">
        <div class="wizard-spec-modal">
          <div class="wizard-spec-modal-header">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <span style="font-size:1.4rem;color:var(--accent-secondary);"><i class="ri-focus-3-line"></i></span>
              <div>
                <h3 style="margin:0;font-size:1.1rem;color:var(--text-primary);">Add Skill Specialization</h3>
                <p style="margin:0.2rem 0 0 0;font-size:0.75rem;color:var(--text-muted);">
                  Configure specialized combat technique or expertise field (1 PP = 2 Ranks)
                </p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-close-sheet-spec-modal" style="padding:0.25rem 0.5rem;" type="button"><i class="ri-close-line"></i></button>
          </div>

          <div class="wizard-spec-modal-body">
            <!-- 1. Select Base Skill -->
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                1. Select Base Subtype Skill
              </label>
              <div class="spec-base-cards-grid">
                ${baseSkillOptions.map(opt => {
                  const isSel = opt.name.toLowerCase() === selectedBase.toLowerCase();
                  const abMod = store.getAbility(opt.ability);
                  return `
                    <div class="spec-base-card ${isSel ? 'active' : ''}" data-select-base="${opt.name}">
                      <i class="${opt.icon}"></i>
                      <h5>${escapeHtml(opt.name)}</h5>
                      <span>${opt.ability} (${abMod >= 0 ? '+' : ''}${abMod})</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 2. Popular Presets -->
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                2. Choose Popular Preset (Or Enter Custom Below)
              </label>
              <div class="spec-quick-chips">
                ${commonSubtypes.map(sub => `
                  <button class="spec-quick-chip modal-preset-chip ${customSubtype.toLowerCase() === sub.toLowerCase() ? 'active' : ''}" 
                          data-preset-val="${escapeHtml(sub)}" type="button">
                    ${escapeHtml(sub)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 3. Name Input -->
            <div class="form-group" style="margin:0;">
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                3. Specialization Name
              </label>
              <input type="text" class="text-input" id="sheet-spec-name-input" 
                     placeholder="e.g. Swords, Firearms, Forensic Science..." 
                     value="${escapeHtml(customSubtype)}" autofocus>
            </div>

            <!-- 4. Preview & Ranks -->
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                4. Starting Ranks & Check Bonus Preview
              </label>
              <div class="spec-preview-callout">
                <div>
                  <div style="font-size:0.9rem;font-weight:800;color:var(--text-primary);">
                    ${escapeHtml(selectedBase)}: <span style="color:var(--accent-secondary);">${escapeHtml(customSubtype || 'Specialization')}</span>
                  </div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;">
                    Key Ability: <strong>${abilityKey}</strong> (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal}) + <strong>${initialRanks} Ranks</strong> = 
                    <strong style="color:var(--accent-secondary);font-size:0.85rem;">${totalBonus >= 0 ? `+${totalBonus}` : totalBonus} Check Bonus</strong>
                  </div>
                </div>

                <div style="display:flex;align-items:center;gap:0.75rem;">
                  <div class="stepper">
                    <button class="step-btn" id="sheet-spec-rank-dec" ${initialRanks <= 1 ? 'disabled' : ''} type="button">-</button>
                    <span class="step-val" style="min-width:2rem;">${initialRanks}</span>
                    <button class="step-btn" id="sheet-spec-rank-inc" ${initialRanks >= 20 ? 'disabled' : ''} type="button">+</button>
                  </div>
                  <span style="font-size:0.75rem;font-weight:700;color:var(--accent-primary);min-width:48px;">
                    ${ppCost} PP
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="wizard-spec-modal-footer">
            <button class="btn btn-ghost" id="btn-cancel-sheet-spec-modal" type="button">Cancel</button>
            <button class="btn btn-primary" id="btn-confirm-add-sheet-spec" ${customSubtype.trim() ? '' : 'disabled'} type="button">
              <i class="ri-add-line"></i> Add Specialization (${ppCost} PP)
            </button>
          </div>
        </div>
      </div>
    `;

    // Attach Modal Listeners
    const overlay = mount.querySelector('#sheet-spec-overlay');
    const closeBtn = mount.querySelector('#btn-close-sheet-spec-modal');
    const cancelBtn = mount.querySelector('#btn-cancel-sheet-spec-modal');
    const confirmBtn = mount.querySelector('#btn-confirm-add-sheet-spec');
    const input = mount.querySelector('#sheet-spec-name-input');

    const closeModal = () => {
      mount.innerHTML = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    mount.querySelectorAll('.spec-base-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedBase = card.dataset.selectBase;
        updateModalView();
      });
    });

    mount.querySelectorAll('.modal-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        customSubtype = chip.dataset.presetVal;
        updateModalView();
        const inp = mount.querySelector('#sheet-spec-name-input');
        if (inp) {
          inp.focus();
          inp.setSelectionRange(inp.value.length, inp.value.length);
        }
      });
    });

    input?.addEventListener('input', (e) => {
      customSubtype = e.target.value;
      if (confirmBtn) confirmBtn.disabled = !customSubtype.trim();
      const namePreview = mount.querySelector('.spec-preview-callout span[style*="color:var(--accent-secondary)"]');
      if (namePreview) namePreview.textContent = customSubtype || 'Specialization';
    });

    mount.querySelector('#sheet-spec-rank-dec')?.addEventListener('click', () => {
      if (initialRanks > 1) {
        initialRanks--;
        updateModalView();
      }
    });

    mount.querySelector('#sheet-spec-rank-inc')?.addEventListener('click', () => {
      if (initialRanks < 20) {
        initialRanks++;
        updateModalView();
      }
    });

    confirmBtn?.addEventListener('click', () => {
      if (!customSubtype.trim()) return;
      store.addSkill({
        name: selectedBase,
        subtype: customSubtype.trim(),
        ranks: initialRanks
      });
      showToast(`Added ${selectedBase}: ${customSubtype.trim()} (${initialRanks} Ranks)`, 'success');
      closeModal();
    });
  }

  updateModalView();
  setTimeout(() => {
    const inp = mount.querySelector('#sheet-spec-name-input');
    inp?.focus();
  }, 50);
}

function renderSkills() {
  const container = document.getElementById('skills-list-container');
  const countBadge = document.getElementById('skills-pp-badge');
  if (!container) return;

  const totalPP = store.getTotalSkillPP();
  if (countBadge) countBadge.textContent = `${totalPP} PP`;

  const addedSkills = store.character.skills;
  const categories = ['All', 'Combat', 'Physical', 'Mental', 'Interaction'];

  // Filter skills
  const filteredSkills = SKILLS.filter(s => {
    // 1. Category match
    const catMatch = activeSheetSkillCategory === 'All' || s.category.toLowerCase() === activeSheetSkillCategory.toLowerCase();
    if (!catMatch) return false;

    // 2. Search query match
    if (!sheetSkillSearchQuery.trim()) return true;
    const q = sheetSkillSearchQuery.toLowerCase().trim();
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.desc && s.desc.toLowerCase().includes(q)) return true;

    // Check if any matching specializations exist
    if (s.requiresSubtype) {
      const matchingSub = addedSkills.some(inst =>
        inst.name.toLowerCase() === s.name.toLowerCase() &&
        inst.subtype &&
        inst.subtype.toLowerCase().includes(q)
      );
      if (matchingSub) return true;
      if (s.commonSubtypes && s.commonSubtypes.some(cs => cs.toLowerCase().includes(q))) return true;
    }

    return false;
  });

  let html = `
    <div class="sheet-skills-toolbar">
      <div class="skills-cat-pills">
        ${categories.map(cat => `
          <button class="skill-cat-pill ${activeSheetSkillCategory === cat ? 'active' : ''}" data-cat="${cat}" type="button">
            ${cat}
          </button>
        `).join('')}
      </div>
      <div class="skills-search-wrap">
        <i class="ri-search-line"></i>
        <input type="text" id="sheet-skill-search" placeholder="Search 16 skills & specializations..." value="${escapeHtml(sheetSkillSearchQuery)}">
      </div>
    </div>

    <div class="sheet-skills-list">
  `;

  if (filteredSkills.length === 0) {
    html += `
      <div class="empty-hint">
        No skills found matching "${escapeHtml(sheetSkillSearchQuery)}".
      </div>
    `;
  } else {
    filteredSkills.forEach(ruleSkill => {
      const abilityKey = ruleSkill.ability;
      const abilityVal = store.getAbility(abilityKey);

      if (ruleSkill.requiresSubtype) {
        // Subtype Skill (Close Combat, Ranged Combat, Expertise)
        const instances = addedSkills.filter(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());

        // 1. Show existing active specializations
        if (instances.length > 0) {
          instances.forEach(inst => {
            const ranks = inst.ranks;
            const totalBonus = abilityVal + ranks;
            html += `
              <div class="sheet-skill-row is-trained is-specialization">
                <div class="sheet-skill-main-col">
                  <div class="sheet-skill-title-line">
                    <span class="sheet-skill-name">
                      ${escapeHtml(ruleSkill.name)}: <span class="spec-highlight">${escapeHtml(inst.subtype || 'General')}</span>
                    </span>
                    <span class="sheet-skill-ab-tag">${abilityKey} (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal})</span>
                    <span class="sheet-skill-trained-badge spec"><i class="ri-shield-star-line"></i> Specialization</span>
                  </div>
                  <p class="sheet-skill-desc">${escapeHtml(ruleSkill.desc)}</p>
                </div>

                <div class="sheet-skill-calc-col">
                  <span class="sheet-skill-formula-hint">${abilityKey} (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal}) + ${ranks} Ranks</span>
                  <span class="sheet-skill-total-bonus ${totalBonus >= 0 ? 'positive' : 'negative'}">
                    ${totalBonus >= 0 ? `+${totalBonus}` : totalBonus}
                  </span>
                </div>

                <div class="sheet-skill-stepper-col">
                  <div class="stepper-compact">
                    <button class="step-btn-xs" data-sheet-sk-dec="${inst.id}" title="Decrease Rank">-</button>
                    <span class="step-val-xs">${ranks}</span>
                    <button class="step-btn-xs" data-sheet-sk-inc="${inst.id}" title="Increase Rank">+</button>
                  </div>
                  <button class="btn-delete-row" data-sheet-sk-del="${inst.id}" title="Remove Specialization">
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>
            `;
          });
        }

        // 2. Integrated Wizard-Style Specialization Card
        const commonSubtypes = ruleSkill.commonSubtypes || [];
        html += `
          <div class="wizard-spec-prompt-card sheet-spec-card">
            <div class="spec-prompt-header">
              <div class="spec-prompt-info">
                <span class="spec-prompt-title">
                  <i class="ri-add-circle-fill"></i> Add ${escapeHtml(ruleSkill.name)} Specialization
                </span>
                <span class="spec-prompt-sub">
                  Key Ability: <strong>${abilityKey}</strong> (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal}) • Rate: 1 PP = 2 Ranks
                </span>
              </div>
              <button class="btn btn-secondary btn-xs btn-open-sheet-spec-modal" data-base="${escapeHtml(ruleSkill.name)}" type="button">
                <i class="ri-sound-module-line"></i> Custom Specialization...
              </button>
            </div>

            <div class="spec-quick-chips">
              <span class="spec-chips-label">Popular Presets:</span>
              ${commonSubtypes.map(sub => {
                const isAlreadyAdded = instances.some(inst => (inst.subtype || '').toLowerCase() === sub.toLowerCase());
                if (isAlreadyAdded) {
                  return `
                    <span class="spec-quick-chip added" title="${escapeHtml(sub)} already active on sheet">
                      <i class="ri-check-line"></i> ${escapeHtml(sub)}
                    </span>
                  `;
                }
                return `
                  <button class="spec-quick-chip btn-sheet-quick-add" 
                          data-base="${escapeHtml(ruleSkill.name)}" 
                          data-sub="${escapeHtml(sub)}" 
                          title="Instantly add ${escapeHtml(ruleSkill.name)}: ${escapeHtml(sub)} (+2 Ranks)" 
                          type="button">
                    <i class="ri-add-line"></i> ${escapeHtml(sub)}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        // Standard Skill without subtypes (Always displayed, trained or untrained)
        const match = addedSkills.find(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());
        const ranks = match ? match.ranks : 0;
        const skillId = match ? match.id : null;
        const isTrained = ranks > 0;
        const totalBonus = abilityVal + ranks;

        html += `
          <div class="sheet-skill-row ${isTrained ? 'is-trained' : ''}">
            <div class="sheet-skill-main-col">
              <div class="sheet-skill-title-line">
                <span class="sheet-skill-name">${escapeHtml(ruleSkill.name)}</span>
                <span class="sheet-skill-ab-tag">${abilityKey} (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal})</span>
                ${isTrained ? `
                  <span class="sheet-skill-trained-badge"><i class="ri-checkbox-circle-line"></i> Trained</span>
                ` : `
                  <span class="sheet-skill-untrained-badge">Untrained</span>
                `}
              </div>
              <p class="sheet-skill-desc">${escapeHtml(ruleSkill.desc)}</p>
            </div>

            <div class="sheet-skill-calc-col">
              <span class="sheet-skill-formula-hint">${abilityKey} (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal}) + ${ranks} Ranks</span>
              <span class="sheet-skill-total-bonus ${totalBonus >= 0 ? 'positive' : 'negative'}">
                ${totalBonus >= 0 ? `+${totalBonus}` : totalBonus}
              </span>
            </div>

            <div class="sheet-skill-stepper-col">
              <div class="stepper-compact">
                <button class="step-btn-xs" data-sheet-sk-dec="${skillId || ''}" title="Decrease Rank" ${ranks <= 0 ? 'disabled' : ''}>-</button>
                <span class="step-val-xs">${ranks}</span>
                <button class="step-btn-xs" data-sheet-sk-inc="${skillId || ''}" data-base="${escapeHtml(ruleSkill.name)}" title="Increase Rank">+</button>
              </div>
            </div>
          </div>
        `;
      }
    });
  }

  html += `</div>`;
  container.innerHTML = html;

  // Search input listeners
  const searchInput = container.querySelector('#sheet-skill-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      sheetSkillSearchQuery = e.target.value;
      renderSkills();
      const newInp = container.querySelector('#sheet-skill-search');
      if (newInp) {
        newInp.focus();
        const len = newInp.value.length;
        newInp.setSelectionRange(len, len);
      }
    });
  }

  // Category filter listeners
  container.querySelectorAll('.skill-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activeSheetSkillCategory = pill.dataset.cat;
      renderSkills();
    });
  });

  // Rank Decrements
  container.querySelectorAll('[data-sheet-sk-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.sheetSkDec;
      if (!id) return;
      const s = addedSkills.find(x => x.id === id);
      if (s) store.updateSkill(s.id, s.ranks - 1);
    });
  });

  // Rank Increments
  container.querySelectorAll('[data-sheet-sk-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.sheetSkInc;
      const baseName = btn.dataset.base;
      if (id) {
        const s = addedSkills.find(x => x.id === id);
        if (s) store.updateSkill(s.id, s.ranks + 1);
      } else if (baseName) {
        store.addSkill({ name: baseName, subtype: '', ranks: 1 });
      }
    });
  });

  // Quick Preset Add Chips
  container.querySelectorAll('.btn-sheet-quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const baseName = btn.dataset.base;
      const subName = btn.dataset.sub;
      store.addSkill({ name: baseName, subtype: subName, ranks: 2 });
      showToast(`Added ${baseName}: ${subName} (2 Ranks)`, 'success');
    });
  });

  // Open Specialization Modal
  container.querySelectorAll('.btn-open-sheet-spec-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const baseName = btn.dataset.base;
      openSheetSpecializationModal(baseName);
    });
  });

  // Delete Specialization
  container.querySelectorAll('[data-sheet-sk-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.sheetSkDel;
      const match = addedSkills.find(x => x.id === id);
      const label = match ? `${match.name}: ${match.subtype}` : 'Specialization';
      store.removeSkill(id);
      showToast(`Removed ${label}`, 'info');
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

  // Wire header "+ Browse & Add Advantages" button
  const addBtn = document.getElementById('btn-open-adv-modal');
  if (addBtn && !addBtn._wired) {
    addBtn.addEventListener('click', () => openAdvantageModal());
    addBtn._wired = true;
  }

  if (advs.length === 0) {
    container.innerHTML = `
      <div class="empty-hint">
        No advantages added yet.
        <button class="btn btn-secondary btn-xs mt-2" onclick="openAdvantageModal()">
          <i class="ri-add-line"></i> Open Advantages Catalog (56 Choices)
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="sheet-advantages-library">
      ${advs.map(a => {
        const rule = ADVANTAGES.find(r => r.name.toLowerCase() === a.name.toLowerCase());
        const category = rule?.category || 'General';
        const iconClass = getAdvCategoryIcon(category);
        const desc = rule?.desc || 'Rules description unavailable.';
        const isRanked = Boolean(rule?.ranked);

        return `
          <div class="sheet-adv-card">
            <div class="adv-card-header">
              <div class="adv-card-title-group">
                <i class="${iconClass} adv-card-icon"></i>
                <h4 class="adv-card-name">${escapeHtml(a.name)}</h4>
              </div>
              <div class="adv-card-badges">
                <span class="adv-cat-tag ${category.toLowerCase()}">${escapeHtml(category)}</span>
                <span class="adv-cost-tag">${a.ranks} PP</span>
              </div>
            </div>

            <p class="adv-card-desc">${escapeHtml(desc)}</p>

            <div class="adv-card-footer">
              <div class="adv-card-stepper-wrap">
                ${isRanked ? `
                  <div class="stepper-compact">
                    <button class="step-btn-xs" data-adv-dec="${escapeHtml(a.name)}" title="Decrease Rank" ${a.ranks <= 1 ? 'disabled' : ''}>-</button>
                    <span class="step-val-xs">Rank ${a.ranks}</span>
                    <button class="step-btn-xs" data-adv-inc="${escapeHtml(a.name)}" title="Increase Rank">+</button>
                  </div>
                ` : `
                  <span class="adv-status-tag"><i class="ri-check-line"></i> Active Trait</span>
                `}
              </div>
              <button class="btn-adv-del" data-adv-del="${escapeHtml(a.name)}" title="Remove ${escapeHtml(a.name)} from Sheet">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Decrement
  container.querySelectorAll('[data-adv-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const a = advs.find(x => x.name === btn.dataset.advDec);
      if (a) store.updateAdvantage(a.name, a.ranks - 1);
    });
  });

  // Increment
  container.querySelectorAll('[data-adv-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const a = advs.find(x => x.name === btn.dataset.advInc);
      if (a) store.updateAdvantage(a.name, a.ranks + 1);
    });
  });

  // Delete
  container.querySelectorAll('[data-adv-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.advDel;
      store.removeAdvantage(name);
      showToast(`Removed Advantage: ${name}`, 'info');
    });
  });
}

/* ==========================================================================
   SELF-EXPLANATORY POWERS ARCHITECTURE HELPERS
   ========================================================================== */

function getActionExplanation(action) {
  const map = {
    'Standard': 'Requires a standard action on your turn (used to attack or activate an effect).',
    'Move': 'Requires a move action on your turn.',
    'Free': 'Can be activated freely at any time during your turn without using an action.',
    'Reaction': 'Triggers automatically in response to a specific condition, even outside your turn.',
    'None': 'Permanent or passive trait that is always active without requiring an activation action.'
  };
  return map[action] || 'Power activation action per Mutants & Masterminds 3e rules.';
}

function getRangeExplanation(range, ranks = 1) {
  const r = Number(ranks) || 1;
  const map = {
    'Close': 'Requires physical contact or melee reach (5 ft) with the target.',
    'Ranged': `Effective range: Short (${r * 25} ft), Medium (${r * 50} ft, -2 penalty), Long (${r * 100} ft, -5 penalty).`,
    'Perception': 'Affects any target you can accurately perceive without requiring an attack check.',
    'Personal': 'Applies only to the character using the power.',
    'Rank': `Effective range scales with measurement ranks (${r} ranks on the Measurements Table).`
  };
  return map[range] || `Effective power range: ${range}.`;
}

function getDurationExplanation(duration) {
  const map = {
    'Instant': 'Occurs immediately upon hitting and ends once the effect has been resolved.',
    'Concentration': 'Requires a Standard Action each turn to sustain the effect.',
    'Sustained': 'Lasts round to round as long as you spend a Free Action each turn to maintain it.',
    'Continuous': 'Remains active continuously even if the character is stunned or incapacitated.',
    'Permanent': 'Always active without needing maintenance, cannot be turned off, and cannot be used with Extra Effort.'
  };
  return map[duration] || `Effect duration: ${duration}.`;
}

function getResistanceExplanation(resistance, dcDescription = '') {
  if (!resistance || resistance === 'None') {
    return 'No resistance check required; the effect applies automatically on contact.';
  }
  const cleanRes = String(resistance).trim();
  if (cleanRes.toLowerCase() === 'toughness') {
    return 'Target rolls d20 + Toughness vs. the effect DC to resist damage and physical trauma.';
  }
  if (cleanRes.toLowerCase() === 'fortitude') {
    return 'Target rolls d20 + Fortitude vs. the effect DC to resist biological, poison, or physiological effects.';
  }
  if (cleanRes.toLowerCase() === 'will') {
    return 'Target rolls d20 + Will vs. the effect DC to resist mental, psychic, or sensory assault.';
  }
  if (cleanRes.toLowerCase() === 'dodge') {
    return 'Target rolls d20 + Dodge vs. the effect DC to evade or reduce area effect impact.';
  }
  if (/fortitude\s+or\s+will/i.test(cleanRes)) {
    return 'Target rolls d20 + Fortitude or Will (depending on effect configuration) to resist.';
  }
  return `Target rolls d20 + ${cleanRes} vs. the effect DC to resist or mitigate the effect.`;
}

function renderEffectExplainedModifiers(mainEff) {
  const rawExtras = Array.isArray(mainEff.extras) ? mainEff.extras : [];
  const rawFlaws = Array.isArray(mainEff.flaws) ? mainEff.flaws : [];
  if (rawExtras.length === 0 && rawFlaws.length === 0) return '';

  // Properly categorize even if legacy data placed negative modifier in extras
  const extras = [];
  const flaws = [...rawFlaws];

  rawExtras.forEach(e => {
    if (Number(e.cost) < 0 || (typeof FLAWS !== 'undefined' ? FLAWS : []).some(f => f.name.toLowerCase() === (e.name || '').toLowerCase())) {
      flaws.push(e);
    } else {
      extras.push(e);
    }
  });

  const extraCards = extras.map(e => {
    const def = (typeof EXTRAS !== 'undefined' ? EXTRAS : []).find(x => x.name.toLowerCase() === (e.name || '').toLowerCase());
    const desc = e.desc || def?.desc || 'Enhances power versatility, impact, or operational scope.';
    const costTag = e.costDisplay || (e.cost !== undefined ? (e.cost >= 0 ? `+${e.cost} PP` : `${e.cost} PP`) : '+1/Rank');
    return `
      <div class="power-mod-explain-card extra">
        <div class="power-mod-explain-header">
          <span class="power-mod-name"><i class="ri-add-circle-fill"></i> ${escapeHtml(e.name)}</span>
          <span class="power-mod-rate-tag">${escapeHtml(costTag)}</span>
        </div>
        <p class="power-mod-desc-text">${escapeHtml(desc)}</p>
      </div>
    `;
  });

  const flawCards = flaws.map(f => {
    const def = (typeof FLAWS !== 'undefined' ? FLAWS : []).find(x => x.name.toLowerCase() === (f.name || '').toLowerCase());
    const desc = f.desc || def?.desc || 'Restricts power usage or conditions to reduce Power Point cost.';
    const costTag = f.costDisplay || (f.cost !== undefined ? (Number(f.cost) <= 0 ? `${f.cost} PP` : `-${f.cost} PP`) : '-1/Rank');
    return `
      <div class="power-mod-explain-card flaw">
        <div class="power-mod-explain-header">
          <span class="power-mod-name"><i class="ri-indeterminate-circle-fill"></i> ${escapeHtml(f.name)}</span>
          <span class="power-mod-rate-tag">${escapeHtml(costTag)}</span>
        </div>
        <p class="power-mod-desc-text">${escapeHtml(desc)}</p>
      </div>
    `;
  });

  return `
    <div class="power-tier-section">
      <div class="tier-badge-line">
        <span class="tier-label">Applied Modifiers (Extras &amp; Flaws):</span>
        <span class="tier-sub-hint" style="font-size: 0.72rem; color: var(--text-muted);">
          Rules modifying how the power functions (green = Extra / red = Flaw)
        </span>
      </div>
      <div class="power-explained-mod-grid">
        ${extraCards.join('')}
        ${flawCards.join('')}
      </div>
    </div>
  `;
}



function getCostBreakdownFormula(power, mainEff, totalCost) {
  try {
    const breakdown = calculatePowerDetailedBreakdown(power);
    if (breakdown && breakdown.formulaString) {
      return breakdown.formulaString;
    }
  } catch (e) {
    console.warn('Error calculating detailed breakdown:', e);
  }
  const ranks = Number(mainEff.ranks || power.ranks || 1);
  const baseCost = Number(mainEff.baseCost !== undefined ? mainEff.baseCost : 1);
  return `[Base ${baseCost} PP/Rank × ${ranks} Ranks] = ${totalCost} PP`;
}

function renderPowers() {
  const container = document.getElementById('powers-list-container');
  const countBadge = document.getElementById('powers-pp-badge');
  if (!container) return;

  const powers = store.character.powers;
  const totalPP = store.getTotalPowerPP();
  if (countBadge) countBadge.textContent = `${totalPP} PP`;

  if (powers.length === 0) {
    container.innerHTML = `<div class="empty-hint">No powers created yet. Click "+ New Power" to build superpowers!</div>`;
    return;
  }

  container.innerHTML = `
    <div class="powers-linear-stack">
      ${powers.map(p => {
        const cost = calculatePowerTotalCost(p);
        const metrics = calculatePowerCombatMetrics(p, store.character.powerLevel, store.character.abilities, store.character.skills);
        const mainEff = p.mainEffect || p;
        const baseDef = BASE_EFFECTS.find(b => b.name === (mainEff.baseEffect || p.baseEffect));
        const subOptionsHtml = renderEffectDetailedSubOptions(mainEff);
        const modifiersHtml = renderEffectExplainedModifiers(mainEff);

        return `
          <div class="power-cascade-card">
            <!-- HEADER & TOP METRICS -->
            <div class="power-cascade-top">
              <div class="power-top-left">
                <span class="power-glyph"><i class="ri-flashlight-line"></i></span>
                <div>
                  <h3 class="power-name-title">${escapeHtml(p.name || mainEff.baseEffect || 'Custom Power')}</h3>
                  <div class="power-tags-row">
                    <span class="power-tag"><i class="ri-magic-line"></i> ${escapeHtml(mainEff.baseEffect || p.baseEffect || 'Effect')} Rank ${mainEff.ranks || p.ranks || 1}</span>
                    ${(p.descriptors || []).map(d => `<span class="power-tag"><i class="ri-hashtag"></i> ${escapeHtml(d)}</span>`).join('')}
                    ${p.deviceConfig?.type && p.deviceConfig.type !== 'none' ? `
                      <span class="power-tag device"><i class="ri-shield-user-line"></i> Device (${p.deviceConfig.type === 'easily_removable' ? 'Easily Removable' : 'Removable'})</span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div class="power-top-right">
                <div class="power-cost-badge-box">
                  <span class="power-total-pp-val">${cost} PP</span>
                  <span class="power-cost-sub">Total Power Points</span>
                </div>
                <div class="power-actions-group">
                  <button class="btn btn-secondary btn-xs" data-power-edit="${p.id}" title="Open Power Studio / Builder">
                    <i class="ri-edit-line"></i> Edit
                  </button>
                  <button class="btn btn-ghost btn-xs text-danger" data-power-del="${p.id}" title="Delete Power">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- ZONA 1: ACTION & TARGETING PLAYBOOK -->
            <div class="power-targeting-playbook">
              <div class="playbook-metric-card">
                <div class="playbook-metric-header">
                  <span class="playbook-metric-label"><i class="ri-time-line"></i> Action</span>
                  <span class="playbook-metric-val action">${escapeHtml(mainEff.action || p.action || 'Standard')}</span>
                </div>
                <p class="playbook-metric-explain">${getActionExplanation(mainEff.action || p.action || 'Standard')}</p>
              </div>

              <div class="playbook-metric-card">
                <div class="playbook-metric-header">
                  <span class="playbook-metric-label"><i class="ri-map-pin-range-line"></i> Range</span>
                  <span class="playbook-metric-val range">${escapeHtml(mainEff.range || p.range || 'Close')}</span>
                </div>
                <p class="playbook-metric-explain">${getRangeExplanation(mainEff.range || p.range || 'Close', mainEff.ranks || p.ranks || 1)}</p>
              </div>

              <div class="playbook-metric-card">
                <div class="playbook-metric-header">
                  <span class="playbook-metric-label"><i class="ri-timer-line"></i> Duration</span>
                  <span class="playbook-metric-val duration">${escapeHtml(mainEff.duration || p.duration || 'Instant')}</span>
                </div>
                <p class="playbook-metric-explain">${getDurationExplanation(mainEff.duration || p.duration || 'Instant')}</p>
              </div>

              <div class="playbook-metric-card">
                <div class="playbook-metric-header">
                  <span class="playbook-metric-label"><i class="ri-shield-line"></i> Resistance Check</span>
                  <span class="playbook-metric-val res">${escapeHtml(mainEff.resistance || p.resistance || 'None')}</span>
                </div>
                <p class="playbook-metric-explain">${getResistanceExplanation(mainEff.resistance || p.resistance, metrics.dcDescription)}</p>
              </div>
            </div>

            <!-- ZONA 2: PRIMARY EFFECT & SUBOPTIONS -->
            <div class="power-tier-section">
              <div class="tier-badge-line">
                <span class="tier-label">Primary Effect:</span>
                <span class="tier-main-pill">${escapeHtml(mainEff.baseEffect || p.baseEffect || 'Effect')} Rank ${mainEff.ranks || p.ranks || 1}</span>
                <span class="tier-cost-rate">(${mainEff.baseCost !== undefined ? mainEff.baseCost : 1} PP/Rank base)</span>
              </div>
              ${baseDef?.desc ? `<p class="tier-rule-desc">${escapeHtml(baseDef.desc)}</p>` : ''}
              ${subOptionsHtml}
            </div>

            <!-- ZONA 3: EXTRAS & FLAWS (IF ANY) -->
            ${modifiersHtml}

            <!-- ZONA 4: LINKED EFFECTS CHAIN TREE -->
            ${(p.linkedEffects && p.linkedEffects.length > 0) ? `
              <div class="power-tier-section">
                <div class="power-guidance-banner">
                  <i class="ri-information-fill"></i>
                  <span><strong>Linked Effects Chain:</strong> All effects below trigger simultaneously on the same target with <strong>1 action &amp; 1 attack check</strong> without requiring separate actions.</span>
                </div>
                <div class="linked-cascade-list" style="margin-top: 0.65rem;">
                  ${p.linkedEffects.map(le => {
                    const leCost = calculateEffectCost(le).totalCost;
                    const leDef = BASE_EFFECTS.find(b => b.name === (le.baseEffect || le.name));
                    const leSub = renderEffectDetailedSubOptions(le);
                    const leMods = renderEffectExplainedModifiers(le);
                    return `
                      <div class="linked-cascade-item">
                        <span class="linked-item-branch">&#x21B3;</span>
                        <div class="linked-item-content">
                          <div class="linked-item-header">
                            <strong>${escapeHtml(le.baseEffect || le.name)} Rank ${le.ranks || 1}</strong>
                            <span class="linked-item-cost">${leCost} PP</span>
                            <span class="power-tag action"><i class="ri-time-line"></i> ${escapeHtml(le.action || 'Standard')}</span>
                            <span class="power-tag range"><i class="ri-map-pin-range-line"></i> ${escapeHtml(le.range || 'Close')}</span>
                            ${le.resistance ? `<span class="power-tag res"><i class="ri-shield-line"></i> vs ${escapeHtml(le.resistance)}</span>` : ''}
                          </div>
                          ${leDef?.desc ? `<p class="tier-rule-desc" style="margin-top: 0.35rem;">${escapeHtml(leDef.desc)}</p>` : ''}
                          ${leSub}
                          ${leMods}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <!-- ZONA 5: ARRAY ALTERNATE SLOTS GROUP -->
            ${(p.alternateEffects && p.alternateEffects.length > 0) ? `
              <div class="power-tier-section">
                <div class="power-guidance-banner" style="background: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8;">
                  <i class="ri-stack-line" style="color: #38bdf8;"></i>
                  <span><strong>Array Alternate Slots (${p.alternateEffects.length} configured):</strong> Cost-effective power pool sharing points. You may switch to another slot configuration <strong>once per turn as a Free Action</strong>.</span>
                </div>
                <div class="array-cascade-list" style="margin-top: 0.75rem;">
                  ${p.alternateEffects.map((ae, aIdx) => {
                    const eff = ae.effect || ae;
                    const isDynamic = Boolean(ae.isDynamic);
                    const effDef = BASE_EFFECTS.find(b => b.name === (eff.baseEffect || eff.name));
                    const effCost = calculateEffectCost(eff).totalCost;
                    const aeSub = renderEffectDetailedSubOptions(eff);
                    const aeMods = renderEffectExplainedModifiers(eff);
                    return `
                      <div class="array-slot-card ${isDynamic ? 'dynamic' : 'alternate'}">
                        <div class="slot-header">
                          <div class="slot-title-wrap">
                            <span class="slot-index-pill">Slot ${aIdx + 1}</span>
                            <span class="slot-type-pill ${isDynamic ? 'dynamic' : 'alternate'}">
                              <i class="${isDynamic ? 'ri-shuffle-line' : 'ri-swap-box-line'}"></i>
                              ${isDynamic ? 'Dynamic Slot (2 PP)' : 'Alternate Slot (1 PP)'}
                            </span>
                            <h4 class="slot-name">${escapeHtml(ae.name || eff.baseEffect || 'Slot')}</h4>
                            <span class="power-tag"><i class="ri-magic-line"></i> ${escapeHtml(eff.baseEffect || 'Effect')}</span>
                          </div>
                          <div class="slot-badges-right">
                            <span class="slot-ranks-badge"><i class="ri-award-line"></i> Rank ${eff.ranks || 1}</span>
                            <span class="slot-cost-badge" title="Equivalent standalone power point value"><i class="ri-copper-coin-line"></i> ${effCost} PP Value</span>
                          </div>
                        </div>

                        <div class="slot-meta-row">
                          <div class="slot-tags-group">
                            <span class="power-tag action"><i class="ri-time-line"></i> ${escapeHtml(eff.action || 'Standard')}</span>
                            ${eff.range ? `<span class="power-tag range"><i class="ri-map-pin-range-line"></i> ${escapeHtml(eff.range)}</span>` : ''}
                            ${eff.duration ? `<span class="power-tag duration"><i class="ri-timer-line"></i> ${escapeHtml(eff.duration)}</span>` : ''}
                            ${eff.resistance ? `<span class="power-tag res"><i class="ri-shield-line"></i> vs ${escapeHtml(eff.resistance)}</span>` : ''}
                          </div>
                          <span class="slot-mode-hint">
                            <i class="${isDynamic ? 'ri-links-line' : 'ri-checkbox-blank-circle-line'}"></i>
                            ${isDynamic ? 'Dynamic: Flexibly shares rank points with other dynamic slots' : 'Alternate: Mutually exclusive (only one slot active at a time)'}
                          </span>
                        </div>

                        ${effDef?.desc ? `<p class="tier-rule-desc" style="margin: 0.4rem 0;">${escapeHtml(effDef.desc)}</p>` : ''}
                        ${aeSub}
                        ${aeMods}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <!-- ZONA 6: COST BREAKDOWN & NOTES -->
            <div class="power-tier-footer">
              <!-- Transparent Cost Breakdown Bar -->
              <div class="power-cost-formula-bar">
                <span class="formula-label"><i class="ri-calculator-line"></i> Cost Breakdown Formula:</span>
                <span class="formula-math">${getCostBreakdownFormula(p, mainEff, cost)}</span>
              </div>

              ${p.notes ? `
                <p class="power-notes-quote"><i class="ri-chat-1-line"></i> "${escapeHtml(p.notes)}"</p>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind Edit
  container.querySelectorAll('[data-power-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = powers.find(x => x.id === btn.dataset.powerEdit);
      if (p) openPowerBuilder(p);
    });
  });

  // Bind Delete
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

      <div class="resources-list-wrap" id="resources-list-wrap"></div>
    </div>
  `;

  // Attach top-level event handlers
  container.querySelector('#btn-main-add-res')?.addEventListener('click', () => {
    openResourceModal(null, activeResourceCategory !== 'all' ? activeResourceCategory : 'Gear');
  });

  container.querySelector('#btn-sync-equipment')?.addEventListener('click', () => {
    store.syncEquipmentAdvantage();
  });

  container.querySelectorAll('[data-res-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeResourceCategory = btn.dataset.resFilter;
      container.querySelectorAll('[data-res-filter]').forEach(b => {
        b.classList.toggle('active', b.dataset.resFilter === activeResourceCategory);
      });
      renderResourcesList(container, true);
    });
  });

  container.querySelectorAll('[data-quick-add-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      openResourceModal(null, btn.dataset.quickAddType);
    });
  });

  renderResourcesList(container, false);
}

function renderResourcesList(container, animate = false) {
  const char = store.character;
  const listWrap = container.querySelector('#resources-list-wrap');
  if (!listWrap) return;

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

  listWrap.innerHTML = filtered.length === 0 ? `
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
  `;

  if (animate) {
    listWrap.classList.remove('category-content-animate');
    void listWrap.offsetWidth; // Trigger reflow
    listWrap.classList.add('category-content-animate');
  }

  // Bind edit and delete handlers
  listWrap.querySelectorAll('[data-edit-res]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idOrIdx = btn.dataset.editRes;
      const resItem = char.resources.find(r => r.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      if (resItem) {
        openResourceModal(resItem);
      }
    });
  });

  listWrap.querySelectorAll('[data-del-res]').forEach(btn => {
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
