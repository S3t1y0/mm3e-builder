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
import { exportToJson, importFromJson } from './storage/exportImport.js';
import { showToast, showConfirmModal } from './components/notifications.js';
import { initRoll20Print, openRoll20Preview } from './components/roll20Print.js';
import { renderWizard } from './components/wizard/wizardController.js';
import { rollCheck, sendFeatureToVTT } from './components/quickDiceRoller.js';
import { getSharedCharacterFromUrl, clearShareHash } from './storage/shareUrl.js';
import { openShareModal } from './components/shareModal.js';

let activeTab = 'sheet'; // 'sheet', 'wizard', 'resources', 'references'
let activeDndbHubTab = 'actions'; // 'actions', 'powers', 'advantages', 'conditions'
let activeSheetSkillCategory = 'All';
let sheetSkillSearchQuery = '';
let activeResourceCategory = 'all';

// Collapsed & Expanded sections tracking
const collapsedPowerIds = new Set();
const collapsedAdvantageNames = new Set();
const expandedPowerRulesIds = new Set();
const expandedArrayOverviewIds = new Set();

if (typeof window !== 'undefined') {
  window.store = store;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

function syncSheetHeights() {
  const colLeft = document.querySelector('.dndb-col-left');
  const sheetGrid = document.querySelector('.dndb-sheet-grid');
  if (!colLeft || !sheetGrid) return;

  if (window.innerWidth > 768) {
    const h = colLeft.offsetHeight;
    if (h > 300) {
      sheetGrid.style.setProperty('--dndb-col1-height', `${h}px`);
    }
  } else {
    sheetGrid.style.removeProperty('--dndb-col1-height');
  }
}

function initApp() {
  setupNavigation();
  setupDndbHubNavigation();
  setupGlobalActions();
  setupKeyboardShortcuts();
  initRoll20Print();

  // Subscribe to store updates
  store.subscribe(() => {
    render();
  });

  render();

  // Synchronize Column 2 (Skills) and Column 3 (Hub) height to match Column 1 (down to CONDITIONS)
  syncSheetHeights();
  if (window.ResizeObserver) {
    const colLeft = document.querySelector('.dndb-col-left');
    if (colLeft) {
      const ro = new ResizeObserver(() => {
        syncSheetHeights();
      });
      ro.observe(colLeft);
    }
  }
  window.addEventListener('resize', syncSheetHeights);
  window.addEventListener('hashchange', checkSharedCharacterUrl);

  // Check for shared character in URL (#hero=...)
  checkSharedCharacterUrl();
}

async function checkSharedCharacterUrl() {
  try {
    const sharedChar = await getSharedCharacterFromUrl();
    if (sharedChar) {
      const heroName = sharedChar.name || 'Shared Hero';
      const pl = sharedChar.powerLevel || 10;
      const spent = sharedChar.powerPointsTotal || 150;
      const confirmed = await showConfirmModal({
        title: 'Shared Character Detected',
        message: `A shared hero profile was detected in your link: <strong>${heroName}</strong> (PL ${pl}, ${spent} PP). Would you like to load this character into your sheet?`,
        confirmText: 'Load Hero',
        cancelText: 'Keep Current',
        isDanger: false,
        icon: '<i class="ri-shield-flash-line"></i>'
      });
      if (confirmed) {
        store.loadCharacter(sharedChar);
        showToast(`Loaded shared hero: ${heroName}`, 'success');
      }
      clearShareHash();
    }
  } catch (err) {
    console.warn('Error processing shared character URL:', err);
    clearShareHash();
  }
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

function setupDndbHubNavigation() {
  const hubBtns = document.querySelectorAll('.dndb-hub-tab-btn');
  hubBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.hubTab;
      if (!tab) return;
      switchDndbHubTab(tab);
    });
  });

  // Initiative Quick Box 1-Click Roll
  const initQuickBox = document.getElementById('dndb-init-quick-box');
  initQuickBox?.addEventListener('click', () => {
    const initTotal = store.getDefenseTotal('INITIATIVE');
    rollCheck({
      name: 'Initiative Roll',
      type: 'initiative',
      bonus: initTotal,
      subtitle: 'Reaction Speed Turn Order Check'
    });
  });

  // Advantages catalog modal button in hub
  document.getElementById('btn-open-adv-modal')?.addEventListener('click', () => {
    openAdvantageModal();
  });
}

function switchDndbHubTab(tab) {
  activeDndbHubTab = tab;
  const hubBtns = document.querySelectorAll('.dndb-hub-tab-btn');
  const hubPanes = document.querySelectorAll('.dndb-tab-pane');

  hubBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.hubTab === tab);
  });
  hubPanes.forEach(p => {
    p.classList.toggle('active', p.id === `dndb-tab-pane-${tab}`);
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
  document.getElementById('btn-share')?.addEventListener('click', () => {
    openShareModal();
  });
  document.getElementById('btn-export')?.addEventListener('click', () => {
    exportToJson();
    showToast('Character exported to JSON file successfully!', 'success');
  });
  document.getElementById('btn-roll20-preview')?.addEventListener('click', () => {
    openRoll20Preview();
  });

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

  document.getElementById('btn-open-skill-spec')?.addEventListener('click', () => {
    openSheetSpecializationModal('Close Combat');
  });
  document.getElementById('drawer-btn-new')?.addEventListener('click', () => {
    closeDrawer();
    document.getElementById('btn-new-char')?.click();
  });
  document.getElementById('drawer-btn-clear')?.addEventListener('click', async () => {
    closeDrawer();
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
  document.getElementById('drawer-btn-share')?.addEventListener('click', () => {
    closeDrawer();
    openShareModal();
  });
  bindDrawerAction('drawer-btn-export', 'btn-export');
  bindDrawerAction('drawer-btn-import', 'btn-import');
  bindDrawerAction('drawer-btn-roll20', 'btn-roll20-preview');

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
  const referencesView = document.getElementById('view-references');

  if (sheetView) sheetView.style.display = activeTab === 'sheet' ? 'block' : 'none';
  if (wizardView) wizardView.style.display = activeTab === 'wizard' ? 'block' : 'none';
  if (referencesView) referencesView.style.display = activeTab === 'references' ? 'block' : 'none';

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

  const equipmentContainer = document.getElementById('hub-equipment-container');
  if (equipmentContainer) renderResourcesTab(equipmentContainer);

  switchDndbHubTab(activeDndbHubTab);
  syncSheetHeights();
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

  const dndbPlDisplay = document.getElementById('dndb-pl-display');
  if (dndbPlDisplay) dndbPlDisplay.textContent = char.powerLevel;

  const hpDisplay = document.getElementById('display-hp');
  if (hpDisplay) hpDisplay.textContent = char.heroPoints;

  // Initiative & Speed Vitals
  const initVal = store.getDefenseTotal('INITIATIVE');
  const initDisplay = document.getElementById('dndb-init-val');
  if (initDisplay) initDisplay.textContent = initVal >= 0 ? `+${initVal}` : `${initVal}`;

  // Movement Speed calculation
  let speedRank = 0;
  let speedMode = 'Ground';
  (char.powers || []).forEach(p => {
    if (p.active === false) return;
    (p.effects || []).forEach(eff => {
      const effName = (eff.baseEffect || eff.name || '').toLowerCase();
      if (effName === 'flight') {
        const r = Number(eff.ranks) || 0;
        if (r > speedRank) { speedRank = r; speedMode = 'Flight'; }
      } else if (effName === 'speed') {
        const r = Number(eff.ranks) || 0;
        if (r > speedRank) { speedRank = r; speedMode = 'Speed'; }
      } else if (effName === 'swimming') {
        const r = Number(eff.ranks) || 0;
        if (r > speedRank) { speedRank = r; speedMode = 'Swim'; }
      }
    });
  });

  const speedDistances = ['30 ft.', '60 ft. (4 MPH)', '120 ft. (8 MPH)', '250 ft. (16 MPH)', '500 ft. (30 MPH)', '900 ft. (60 MPH)', '1,800 ft. (120 MPH)', '1/2 mile (250 MPH)', '1 mile (500 MPH)', '2 miles (1000 MPH)', '4 miles (2000 MPH)'];
  const speedDisplay = document.getElementById('dndb-speed-val');
  const speedBox = speedDisplay?.parentElement;
  if (speedDisplay) {
    if (speedRank === 0) {
      speedDisplay.textContent = '30 ft.';
      const sub = speedBox?.querySelector('.dndb-vital-sub');
      if (sub) sub.textContent = 'Normal Walk';
    } else {
      const distStr = speedDistances[speedRank] || `Rank ${speedRank}`;
      speedDisplay.textContent = distStr.split(' ')[0] + ' ' + (distStr.split(' ')[1] || '');
      const sub = speedBox?.querySelector('.dndb-vital-sub');
      if (sub) sub.textContent = `${speedMode} Rank ${speedRank}`;
    }
  }

  // PP Progress
  const spent = store.getTotalSpentPP();
  const budget = store.getTotalBudgetPP();
  const ppSpentEl = document.getElementById('dndb-pp-spent');
  const ppBudgetEl = document.getElementById('dndb-pp-budget');
  const ppProgress = document.getElementById('dndb-pp-progress');
  if (ppSpentEl) ppSpentEl.textContent = spent;
  if (ppBudgetEl) ppBudgetEl.textContent = budget;
  if (ppProgress) {
    const pct = Math.min(100, Math.max(0, Math.round((spent / budget) * 100)));
    ppProgress.style.width = `${pct}%`;
    ppProgress.classList.toggle('overbudget', spent > budget);
  }

  // Passive Perception (10 + Awareness + Perception rank)
  const aweMod = store.getAbility('AWE');
  const percSkill = (char.skills || []).find(s => s.name.toLowerCase() === 'perception');
  const percRanks = percSkill ? percSkill.ranks : 0;
  const passivePerc = 10 + aweMod + percRanks;
  const passiveEl = document.getElementById('dndb-passive-perc');
  if (passiveEl) passiveEl.textContent = passivePerc;

  // Senses list
  const sensesListEl = document.getElementById('dndb-senses-list');
  if (sensesListEl) {
    const specialSenses = [];
    (char.powers || []).forEach(p => {
      if (p.active === false) return;
      (p.effects || []).forEach(eff => {
        if ((eff.baseEffect || eff.name) === 'Senses') {
          const faculties = eff.config?.selectedFaculties || [];
          faculties.forEach(f => {
            const name = typeof f === 'object' ? (f.name || f.id) : f;
            if (name && !specialSenses.includes(name)) specialSenses.push(name);
          });
        }
      });
    });

    let sHtml = `
      <div class="dndb-sense-item"><i class="ri-check-line"></i> Normal Vision & Hearing</div>
      <div class="dndb-sense-item"><i class="ri-check-line"></i> Olfactory & Tactile</div>
    `;
    if (specialSenses.length > 0) {
      sHtml += specialSenses.map(s => `
        <div class="dndb-sense-item" style="color: #38bdf8;"><i class="ri-radar-line"></i> ${escapeHtml(s)}</div>
      `).join('');
    }
    sensesListEl.innerHTML = sHtml;
  }

  // Hub Tab Badges
  const hubPowersCount = document.getElementById('hub-powers-count');
  const hubAdvantagesCount = document.getElementById('hub-advantages-count');
  const hubEquipmentCount = document.getElementById('hub-equipment-count');
  const powersPpBadge = document.getElementById('powers-pp-badge');
  const advantagesPpBadge = document.getElementById('advantages-pp-badge');
  if (hubPowersCount) hubPowersCount.textContent = (char.powers || []).length;
  if (hubAdvantagesCount) hubAdvantagesCount.textContent = (char.advantages || []).length;
  if (hubEquipmentCount) hubEquipmentCount.textContent = (char.resources || []).length;
  if (powersPpBadge) powersPpBadge.textContent = `${store.getTotalPowerPP()} PP`;
  if (advantagesPpBadge) advantagesPpBadge.textContent = `${store.getTotalAdvantagePP()} PP`;
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
          <button class="step-btn" data-ab-dec="${ab.key}" title="Decrease ${ab.key}">-</button>
          <button class="ab-roll-btn" data-roll-ability="${ab.key}" data-roll-name="${escapeHtml(ab.name)}" data-roll-bonus="${val}" title="Click to Roll ${escapeHtml(ab.name)} Check (d20${val >= 0 ? '+' + val : val})">
            <i class="ri-dice-line"></i>
            <span class="ab-val ${val < 0 ? 'negative' : ''}">${val >= 0 ? '+' + val : val}</span>
          </button>
          <button class="step-btn" data-ab-inc="${ab.key}" title="Increase ${ab.key}">+</button>
        </div>
      </div>
    `;
  }).join('');

  // Step decrement
  container.querySelectorAll('[data-ab-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const k = btn.dataset.abDec;
      store.setAbility(k, store.getAbility(k) - 1);
    });
  });

  // Step increment
  container.querySelectorAll('[data-ab-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const k = btn.dataset.abInc;
      store.setAbility(k, store.getAbility(k) + 1);
    });
  });

  // 1-Click Ability Roll
  container.querySelectorAll('[data-roll-ability]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.rollAbility;
      const name = btn.dataset.rollName || 'Ability';
      const bonus = parseInt(btn.dataset.rollBonus, 10) || 0;
      rollCheck({
        name: `${name} Check`,
        type: 'ability',
        bonus,
        subtitle: `M&M 3e Ability Check • Base ${key} (${bonus >= 0 ? '+' + bonus : bonus})`
      });
    });
  });
}

function renderDefenses() {
  const container = document.getElementById('defenses-grid');
  if (!container) return;

  const injuries = store.character.injuries || 0;

  container.innerHTML = DEFENSES.map(def => {
    const base = store.getDefenseBase(def.key);
    const bought = store.character.defensesBought[def.key] || 0;
    const total = store.getDefenseTotal(def.key);
    const isInit = def.key === 'INITIATIVE';
    const isToughness = def.key === 'TOUGHNESS';
    const rollTitle = isInit
      ? `Click to Roll Initiative (d20${total >= 0 ? '+' + total : total})`
      : `Click to Roll ${escapeHtml(def.name)} Resistance Check (d20${total >= 0 ? '+' + total : total})`;

    let baseInfoHtml = `<span class="def-base-info">${def.baseAbility} ${base}</span>`;
    if (isToughness && injuries > 0) {
      baseInfoHtml = `<span class="def-base-info def-injured-text" title="Base STA ${base}, minus ${injuries} bruise penalty">STA ${base} (-${injuries} Bruised)</span>`;
    }

    return `
      <div class="defense-card ${isToughness && injuries > 0 ? 'card-injured' : ''}" title="${def.desc}">
        <div class="def-header">
          <span class="def-name">${def.name}</span>
          ${baseInfoHtml}
        </div>
        <div class="def-body">
          <button class="def-roll-btn" data-roll-defense="${def.key}" data-roll-name="${escapeHtml(def.name)}" data-roll-bonus="${total}" title="${rollTitle}">
            <i class="ri-dice-line"></i>
            <span class="def-total">${total >= 0 ? '+' + total : total}</span>
            <span class="def-roll-label">ROLL</span>
          </button>
          ${!def.isDerived && def.key !== 'TOUGHNESS' ? `
            <div class="def-stepper">
              <button class="step-btn" data-def-dec="${def.key}" title="Decrease ${def.name}">-</button>
              <span class="def-bought-val">+${bought} PP</span>
              <button class="step-btn" data-def-inc="${def.key}" title="Increase ${def.name}">+</button>
            </div>
          ` : `
            <div class="def-stepper derived">
              <span class="def-derived-label">${def.key === 'TOUGHNESS' ? 'Via STA/Armor' : isInit ? 'AGL + Adv' : 'Derived'}</span>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');

  // Step decrement
  container.querySelectorAll('[data-def-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const k = btn.dataset.defDec;
      const cur = store.character.defensesBought[k] || 0;
      if (cur > 0) store.setDefense(k, cur - 1);
    });
  });

  // Step increment
  container.querySelectorAll('[data-def-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const k = btn.dataset.defInc;
      const cur = store.character.defensesBought[k] || 0;
      store.setDefense(k, cur + 1);
    });
  });

  // 1-Click Defense / Resistance / Initiative Roll
  container.querySelectorAll('[data-roll-defense]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.rollDefense;
      const name = btn.dataset.rollName || 'Defense';
      const bonus = parseInt(btn.dataset.rollBonus, 10) || 0;
      const isInit = key === 'INITIATIVE';
      const isToughness = key === 'TOUGHNESS';
      const isAffliction = key === 'FORTITUDE' || key === 'WILL';
      const curInjuries = store.character.injuries || 0;

      rollCheck({
        name: isInit ? 'Initiative Roll' : `${name} Resistance Check`,
        type: isInit ? 'initiative' : 'defense',
        bonus,
        subtitle: isInit
          ? 'Reaction Speed Turn Order Check'
          : isToughness
            ? (curInjuries > 0 ? `Damage Resistance • ${curInjuries} Bruise Penalty (-${curInjuries})` : 'Damage Resistance Check')
            : `M&M 3e ${name} Resistance Check`,
        extra: isToughness ? { injuries: curInjuries } : {}
      });
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

    <div class="sheet-skills-table-header" style="display:grid;grid-template-columns:20px 42px 1fr auto auto;gap:0.65rem;padding:0.25rem 0.65rem;font-size:0.65rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid var(--border-subtle);margin-bottom:0.35rem;">
      <span title="Trained Status (● Trained, ◆ Specialization, ○ Untrained)">Pip</span>
      <span>Abil</span>
      <span>Skill Name</span>
      <span style="min-width:52px;text-align:center;">Roll</span>
      <span style="min-width:58px;text-align:center;">Rank</span>
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
              <div class="sheet-skill-row is-trained is-specialization" title="${escapeHtml(ruleSkill.desc)}">
                <span class="dndb-skill-pip spec" title="Specialization">◆</span>
                <span class="sheet-skill-ab-tag">${abilityKey}</span>
                <span class="sheet-skill-name">
                  ${escapeHtml(ruleSkill.name)}: <span class="spec-highlight">${escapeHtml(inst.subtype || 'General')}</span>
                </span>
                <button class="sheet-skill-roll-btn ${totalBonus >= 0 ? 'positive' : 'negative'}" data-roll-skill="${escapeHtml(ruleSkill.name)}: ${escapeHtml(inst.subtype || 'General')}" data-roll-bonus="${totalBonus}" title="Click to Roll ${escapeHtml(ruleSkill.name)}: ${escapeHtml(inst.subtype || 'General')} Check (d20${totalBonus >= 0 ? '+' + totalBonus : totalBonus})">
                  <i class="ri-dice-line"></i>
                  <span class="skill-roll-val">${totalBonus >= 0 ? `+${totalBonus}` : totalBonus}</span>
                </button>
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
        } else {
          html += `
            <div class="sheet-skill-row is-subtype-empty" title="${escapeHtml(ruleSkill.desc)}">
              <span class="dndb-skill-pip untrained" title="Specialization Required">○</span>
              <span class="sheet-skill-ab-tag">${abilityKey}</span>
              <span class="sheet-skill-name" style="opacity: 0.7;">
                ${escapeHtml(ruleSkill.name)} <span style="font-size: 0.72rem; color: var(--text-muted);">(No spec added)</span>
              </span>
              <div style="grid-column: span 2; display: flex; justify-content: flex-end;">
                <button class="btn btn-ghost btn-xs btn-open-sheet-spec-modal" data-base="${escapeHtml(ruleSkill.name)}" type="button" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;">
                  <i class="ri-add-line"></i> Add Spec
                </button>
              </div>
            </div>
          `;
        }
      } else {
        // Standard Skill without subtypes (Always displayed, trained or untrained)
        const match = addedSkills.find(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());
        const ranks = match ? match.ranks : 0;
        const skillId = match ? match.id : null;
        const isTrained = ranks > 0;
        const totalBonus = abilityVal + ranks;

        html += `
          <div class="sheet-skill-row ${isTrained ? 'is-trained' : ''}" title="${escapeHtml(ruleSkill.desc)}">
            <span class="dndb-skill-pip ${isTrained ? 'trained' : 'untrained'}" title="${isTrained ? 'Trained (+ ' + ranks + ' Ranks)' : 'Untrained'}">${isTrained ? '●' : '○'}</span>
            <span class="sheet-skill-ab-tag">${abilityKey}</span>
            <span class="sheet-skill-name">${escapeHtml(ruleSkill.name)}</span>
            <button class="sheet-skill-roll-btn ${totalBonus >= 0 ? 'positive' : 'negative'}" data-roll-skill="${escapeHtml(ruleSkill.name)}" data-roll-bonus="${totalBonus}" title="Click to Roll ${escapeHtml(ruleSkill.name)} Check (d20${totalBonus >= 0 ? '+' + totalBonus : totalBonus})">
              <i class="ri-dice-line"></i>
              <span class="skill-roll-val">${totalBonus >= 0 ? `+${totalBonus}` : totalBonus}</span>
            </button>
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

  const prevList = container.querySelector('.sheet-skills-list');
  const prevScroll = prevList ? prevList.scrollTop : 0;

  html += `</div>`;

  // Prevent unnecessary DOM destruction and visual re-render/animation if content is identical
  if (container._lastRenderedHtml === html && container.firstElementChild) {
    return;
  }
  container._lastRenderedHtml = html;
  container.innerHTML = html;

  const newList = container.querySelector('.sheet-skills-list');
  if (newList && prevScroll > 0) {
    newList.scrollTop = prevScroll;
  }

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

  // 1-Click Skill Roll
  container.querySelectorAll('[data-roll-skill]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const skillName = btn.dataset.rollSkill || 'Skill';
      const bonus = parseInt(btn.dataset.rollBonus, 10) || 0;
      rollCheck({
        name: `${skillName} Check`,
        type: 'skill',
        bonus,
        subtitle: `M&M 3e Skill Check • Total Bonus ${bonus >= 0 ? '+' + bonus : bonus}`
      });
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

  // Wire Collapse / Expand All Advantages toggle button
  const allAdvBtn = document.getElementById('btn-toggle-all-advantages');
  const allAdvText = document.getElementById('toggle-all-adv-text');
  if (allAdvBtn && advs.length > 0) {
    allAdvBtn.style.display = 'inline-flex';
    const allCollapsed = advs.every(a => collapsedAdvantageNames.has(a.name));
    if (allAdvText) {
      allAdvText.textContent = allCollapsed ? 'Expand All' : 'Collapse All';
    }
    allAdvBtn.onclick = () => {
      if (allCollapsed) {
        collapsedAdvantageNames.clear();
      } else {
        advs.forEach(a => collapsedAdvantageNames.add(a.name));
      }
      renderAdvantages();
    };
  } else if (allAdvBtn) {
    allAdvBtn.style.display = 'none';
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
    const isCollapsed = collapsedAdvantageNames.has(a.name);

    return `
          <div class="sheet-adv-card ${isCollapsed ? 'is-collapsed' : ''}" id="adv-card-${escapeHtml(a.name)}">
            <div class="adv-card-header">
              <div class="adv-card-title-group">
                <i class="${iconClass} adv-card-icon"></i>
                <h4 class="adv-card-name">${escapeHtml(a.name)}</h4>
              </div>
              <div class="adv-card-badges">
                <span class="adv-cat-tag ${category.toLowerCase()}">${escapeHtml(category)}</span>
                <span class="adv-cost-tag">${a.ranks} PP</span>
                <button class="btn-send-vtt" data-send-adv-vtt="${escapeHtml(a.name)}" title="Send ${escapeHtml(a.name)} info to Roll20 chat" type="button">
                  <i class="ri-broadcast-line"></i>
                </button>
                <button class="btn-adv-collapse-toggle ${isCollapsed ? 'collapsed' : ''}" data-toggle-collapse-adv="${escapeHtml(a.name)}" title="${isCollapsed ? 'Expand Advantage Section' : 'Close Advantage Section'}" type="button">
                  <i class="${isCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}"></i>
                </button>
              </div>
            </div>

            <div class="adv-card-body ${isCollapsed ? 'collapsed' : ''}" id="adv-body-${escapeHtml(a.name)}">
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
          </div>
        `;
  }).join('')}
    </div>
  `;

  // Bind Advantage Collapse / Expand Toggle
  container.querySelectorAll('[data-toggle-collapse-adv]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.toggleCollapseAdv;
      if (collapsedAdvantageNames.has(name)) {
        collapsedAdvantageNames.delete(name);
      } else {
        collapsedAdvantageNames.add(name);
      }
      renderAdvantages();
    });
  });

  // Expand when clicking header of collapsed card
  container.querySelectorAll('.sheet-adv-card.is-collapsed .adv-card-header').forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const card = header.closest('.sheet-adv-card');
      const toggleBtn = card?.querySelector('[data-toggle-collapse-adv]');
      if (toggleBtn) toggleBtn.click();
    });
  });

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

  // Send Advantage info card to Roll20 VTT
  container.querySelectorAll('[data-send-adv-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.sendAdvVtt;
      const adv = advs.find(x => x.name === name);
      if (!adv) return;
      const rule = ADVANTAGES.find(r => r.name.toLowerCase() === adv.name.toLowerCase());
      sendFeatureToVTT({
        category: 'advantage',
        name: adv.name,
        type: rule?.category || 'General',
        ranks: adv.ranks ? `Rank ${adv.ranks}` : 'Rank 1',
        cost: `${adv.ranks || 1} PP`,
        description: rule?.desc || ''
      });
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

function getEffectIcon(baseEffect) {
  switch (baseEffect) {
    case 'Damage':
    case 'Blast':
      return 'ri-sword-fill';
    case 'Affliction':
      return 'ri-skull-2-fill';
    case 'Protection':
    case 'Deflect':
      return 'ri-shield-check-fill';
    case 'Flight':
      return 'ri-flight-takeoff-fill';
    case 'Speed':
      return 'ri-speed-fill';
    case 'Leaping':
      return 'ri-arrow-up-circle-fill';
    case 'Teleport':
      return 'ri-portal-fill';
    case 'Movement':
      return 'ri-footprint-fill';
    case 'Senses':
    case 'Remote Sensing':
      return 'ri-eye-2-fill';
    case 'Enhanced Trait':
      return 'ri-sparkling-fill';
    case 'Immunity':
      return 'ri-shield-flash-fill';
    case 'Healing':
    case 'Regeneration':
      return 'ri-heart-pulse-fill';
    case 'Create':
    case 'Transform':
      return 'ri-magic-fill';
    case 'Move Object':
      return 'ri-drag-move-2-fill';
    case 'Illusion':
      return 'ri-ghost-fill';
    case 'Mind Reading':
      return 'ri-brain-fill';
    case 'Weaken':
    case 'Nullify':
      return 'ri-forbid-fill';
    default:
      return 'ri-flashlight-fill';
  }
}

function getEffectBenefitSnippet(eff) {
  if (!eff) return '';
  const base = eff.baseEffect || eff.name;
  const cfg = eff.config || {};
  if (base === 'Enhanced Trait') {
    const trait = cfg.trait || 'Trait';
    return `+${eff.ranks || 1} ${trait} Passive Buff`;
  }
  if (base === 'Senses') {
    if (Array.isArray(cfg.selectedFaculties) && cfg.selectedFaculties.length > 0) {
      const names = cfg.selectedFaculties.map(f => typeof f === 'object' ? f.name : f);
      return names.slice(0, 2).join(', ') + (names.length > 2 ? ` (+${names.length - 2})` : '');
    }
    if (Array.isArray(cfg.selectedModes) && cfg.selectedModes.length > 0) {
      const names = cfg.selectedModes.map(m => typeof m === 'object' ? m.name : m);
      return names.slice(0, 2).join(', ');
    }
    return 'Sensory Enhancement';
  }
  if (base === 'Immunity') {
    if (Array.isArray(cfg.selectedPresets) && cfg.selectedPresets.length > 0) {
      const presetDict = {
        aging: 'Aging', disease: 'Disease', poison: 'Poison', sleep: 'No Sleep',
        starvation: 'No Food/Water', suffocation_partial: 'Hold Breath',
        suffocation_all: 'No Breathing (Vacuum/Gas Proof)', env_cold: 'Cold', env_heat: 'Heat',
        radiation: 'Radiation', vacuum: 'Vacuum', critical: 'Critical Hits',
        alteration: 'Alteration Attacks', entrapment: 'Entrapment', fatigue: 'Fatigue',
        sensory: 'Sensory Afflictions', interaction: 'Interaction Skills',
        life_support: 'Life Support', fire: 'Fire/Heat', cold: 'Cold/Ice',
        electricity: 'Electricity', magic: 'Magic', mental: 'Mental Powers',
        energy: 'All Energy', physical: 'All Physical', fortitude: 'All Fortitude', will: 'All Will'
      };
      const names = cfg.selectedPresets.map(p => presetDict[p] || p);
      return `Immune: ${names.slice(0, 2).join(', ')}${names.length > 2 ? ` (+${names.length - 2})` : ''}`;
    }
    return 'Hazard Immunity';
  }
  if (base === 'Movement') {
    if (Array.isArray(cfg.selectedModes) && cfg.selectedModes.length > 0) {
      const names = cfg.selectedModes.map(m => typeof m === 'object' ? m.name : m);
      return names.slice(0, 2).join(', ');
    }
  }
  if (base === 'Protection') {
    return `+${eff.ranks || 1} Toughness`;
  }
  if (base === 'Affliction') {
    const res = cfg.resistance || eff.resistance || 'Fortitude';
    return `DC ${10 + (eff.ranks || 1)} vs ${res}`;
  }
  if (base === 'Damage' || base === 'Blast') {
    return `DC ${15 + (eff.ranks || 1)} vs Toughness`;
  }
  if (base === 'Weaken') {
    const trait = cfg.trait || 'Trait';
    return `Weaken ${trait} (DC ${10 + (eff.ranks || 1)})`;
  }
  return '';
}

function renderEffectExplainedModifiers(mainEff, powerName = '') {
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
          <div class="power-mod-header-actions">
            <span class="power-mod-rate-tag">${escapeHtml(costTag)}</span>
            <button class="btn-send-vtt btn-send-vtt-xs btn-send-extra-vtt"
                    data-send-extra-vtt="${escapeHtml(e.name)}"
                    data-extra-cost="${escapeHtml(costTag)}"
                    data-extra-desc="${escapeHtml(desc)}"
                    data-parent-power="${escapeHtml(powerName)}"
                    title="Share ${escapeHtml(e.name)} Extra to Roll20"
                    type="button">
              <i class="ri-broadcast-line"></i>
            </button>
          </div>
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
          <div class="power-mod-header-actions">
            <span class="power-mod-rate-tag">${escapeHtml(costTag)}</span>
            <button class="btn-send-vtt btn-send-vtt-xs btn-send-flaw-vtt"
                    data-send-flaw-vtt="${escapeHtml(f.name)}"
                    data-flaw-cost="${escapeHtml(costTag)}"
                    data-flaw-desc="${escapeHtml(desc)}"
                    data-parent-power="${escapeHtml(powerName)}"
                    title="Share ${escapeHtml(f.name)} Flaw to Roll20"
                    type="button">
              <i class="ri-broadcast-line"></i>
            </button>
          </div>
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

  // Wire Collapse / Expand All Powers toggle button
  const allPowersBtn = document.getElementById('btn-toggle-all-powers');
  const allPowersText = document.getElementById('toggle-all-powers-text');
  if (allPowersBtn && powers.length > 0) {
    allPowersBtn.style.display = 'inline-flex';
    const allCollapsed = powers.every(p => collapsedPowerIds.has(p.id));
    if (allPowersText) {
      allPowersText.textContent = allCollapsed ? 'Expand All' : 'Collapse All';
    }
    allPowersBtn.onclick = () => {
      if (allCollapsed) {
        collapsedPowerIds.clear();
      } else {
        powers.forEach(p => collapsedPowerIds.add(p.id));
      }
      renderPowers();
    };
  } else if (allPowersBtn) {
    allPowersBtn.style.display = 'none';
  }

  if (powers.length === 0) {
    container.innerHTML = `<div class="empty-hint">No powers created yet. Click "+ New Power" to build superpowers!</div>`;
    return;
  }

  container.innerHTML = `
    <div class="powers-linear-stack">
      ${powers.map(p => {
    const cost = calculatePowerTotalCost(p);
    const mainEff = p.mainEffect || p;
    const isPowerActive = p.active !== false;
    const isArray = p.type === 'array' || (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0);
    const activeSlotId = p.activeSlotId || 'main';
    const isPrimaryActive = isPowerActive && (!isArray || activeSlotId === 'main' || !p.alternateEffects.some(s => s.id === activeSlotId));
    const activeAltSlot = isArray && !isPrimaryActive ? p.alternateEffects.find(s => s.id === activeSlotId) : null;

    // Target effect to showcase in the active mode card
    const displayedEff = (isArray && !isPrimaryActive && activeAltSlot) ? (activeAltSlot.effect || activeAltSlot) : mainEff;
    const isDisplayedMain = isPrimaryActive || !isArray;
    const displayedMetrics = calculatePowerCombatMetrics({ ...p, mainEffect: displayedEff }, store.character.powerLevel, store.character.abilities, store.character.skills);
    const baseDef = BASE_EFFECTS.find(b => b.name === (displayedEff.baseEffect || displayedEff.name));
    const subOptionsHtml = renderEffectDetailedSubOptions(displayedEff);
    const powerTitle = p.name || displayedEff.baseEffect || 'Custom Power';
    const modifiersHtml = renderEffectExplainedModifiers(displayedEff, powerTitle);
    const isCollapsed = collapsedPowerIds.has(p.id);
    const isRulesExpanded = expandedPowerRulesIds.has(p.id);
    const isArrayOverviewOpen = expandedArrayOverviewIds.has(p.id);
    const mainSlotCost = calculateEffectCost(mainEff).totalCost;
    const primaryLinkedCost = (p.linkedEffects || []).reduce((sum, le) => sum + (calculateEffectCost(le).totalCost || 0), 0);
    const primarySuiteCapacity = mainSlotCost + primaryLinkedCost;
    const activeLinkedEffects = isDisplayedMain ? (p.linkedEffects || []) : (activeAltSlot?.linkedEffects || []);

    return `
          <div class="power-cascade-card ${isPowerActive ? 'power-active' : 'power-deactivated'} ${isCollapsed ? 'is-collapsed' : ''}" id="power-card-${p.id}">
            <!-- HEADER & TOP METRICS -->
            <div class="power-cascade-top">
              <div class="power-top-left">
                <span class="power-glyph"><i class="${getEffectIcon(mainEff.baseEffect || p.baseEffect)}"></i></span>
                <div>
                  <h3 class="power-name-title">${escapeHtml(p.name || mainEff.baseEffect || 'Custom Power')}</h3>
                  <div class="power-tags-row">
                    <span class="power-tag"><i class="ri-magic-line"></i> ${escapeHtml(mainEff.baseEffect || p.baseEffect || 'Effect')} Rank ${mainEff.ranks || p.ranks || 1}</span>
                    ${isArray ? `<span class="power-tag array-badge"><i class="ri-stack-line"></i> Array (${1 + p.alternateEffects.length} Modes)</span>` : ''}
                    ${(activeLinkedEffects && activeLinkedEffects.length > 0) ? `<span class="power-tag linked-badge"><i class="ri-links-line"></i> ${activeLinkedEffects.length} Linked</span>` : ''}
                    ${(p.descriptors || []).map(d => `<span class="power-tag"><i class="ri-hashtag"></i> ${escapeHtml(d)}</span>`).join('')}
                    ${p.deviceConfig?.type && p.deviceConfig.type !== 'none' ? `
                      <span class="power-tag device"><i class="ri-shield-user-line"></i> Device (${p.deviceConfig.type === 'easily_removable' ? 'Easily Removable' : 'Removable'})</span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div class="power-top-right">
                <div class="power-active-toggle-wrap">
                  <button class="btn-power-master-toggle ${isPowerActive ? 'active' : 'inactive'}"
                          data-toggle-power="${p.id}"
                          type="button"
                          title="${isPowerActive ? 'Power is Active (Click to Deactivate)' : 'Power is Inactive (Click to Activate)'}">
                    <span class="power-toggle-dot"></span>
                    <span class="power-toggle-text">${isPowerActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  </button>
                </div>
                <div class="power-cost-badge-box">
                  <span class="power-total-pp-val">${cost} PP</span>
                </div>
                <div class="power-actions-group">
                  <button class="btn btn-secondary btn-xs btn-send-power-vtt" data-send-power-vtt="${p.id}" title="Send complete ${escapeHtml(p.name || 'Power')} suite to Roll20 chat" type="button">
                    <i class="ri-broadcast-line"></i> Full Power
                  </button>
                  <button class="btn-power-collapse-toggle ${isCollapsed ? 'collapsed' : ''}" data-toggle-collapse-power="${p.id}" title="${isCollapsed ? 'Expand Power Details' : 'Close Power Section'}" type="button">
                    <i class="${isCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}"></i> <span class="collapse-text">${isCollapsed ? 'Expand' : 'Close'}</span>
                  </button>
                  <button class="btn btn-secondary btn-xs" data-power-edit="${p.id}" title="Open Power Studio / Builder">
                    <i class="ri-edit-line"></i> Edit
                  </button>
                  <button class="btn btn-ghost btn-xs text-danger" data-power-del="${p.id}" title="Delete Power">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>

            ${isCollapsed ? `
              <div class="power-collapsed-hint" data-toggle-collapse-power="${p.id}" title="Click to expand full playbook & effects">
                <i class="ri-information-line"></i>
                <span>Section details closed (${escapeHtml(mainEff.baseEffect || p.baseEffect || 'Effect')} Rank ${mainEff.ranks || p.ranks || 1} • ${cost} PP). Click to expand.</span>
              </div>
            ` : ''}

            <div class="power-cascade-body ${isCollapsed ? 'collapsed' : ''}" id="power-body-${p.id}">
              <!-- Deactivated Power Notification Banner -->
              ${!isPowerActive ? `
                <div class="power-deactivated-banner">
                  <div class="deact-banner-left">
                    <i class="ri-shut-down-line"></i>
                    <span><strong>Power Deactivated:</strong> This power is currently turned off. Its effects and associated attacks are inactive.</span>
                  </div>
                  <button class="btn btn-primary btn-xs" data-toggle-power="${p.id}" type="button">
                    <i class="ri-flashlight-fill"></i> Activate Power
                  </button>
                </div>
              ` : ''}

              <!-- ZONA 1: ARRAY MODE SWITCHER DOCK (IF POWER HAS ALTERNATE EFFECTS) -->
              ${isArray ? `
                <div class="power-array-dock">
                  <div class="array-dock-bar">
                    <div class="array-dock-info">
                      <span class="array-dock-label"><i class="ri-stack-line"></i> ARRAY MODES (${1 + p.alternateEffects.length})</span>
                      <span class="array-pool-hint"><i class="ri-copper-coin-line"></i> Pool: ${primarySuiteCapacity} PP • Free Action to Switch</span>
                    </div>
                    <div class="array-dock-actions">
                      <button class="btn-toggle-array-overview ${isArrayOverviewOpen ? 'active' : ''}" data-toggle-array-overview="${p.id}" type="button" title="View all alternate mode configurations side by side">
                        <i class="${isArrayOverviewOpen ? 'ri-layout-grid-fill' : 'ri-layout-grid-line'}"></i>
                        <span>${isArrayOverviewOpen ? 'Close Overview' : 'Compare All Modes'}</span>
                      </button>
                    </div>
                  </div>
                  <div class="array-segmented-switcher">
                    <button class="array-mode-btn ${isPrimaryActive ? 'active' : 'standby'} ${!isPowerActive ? 'disabled' : ''}" data-set-array-slot="${p.id}:main" type="button" title="${isPrimaryActive ? 'Primary mode active in combat' : 'Click to switch to Primary mode (Free Action)'}">
                      <span class="mode-btn-indicator"><i class="${isPrimaryActive ? 'ri-radio-button-fill' : 'ri-checkbox-blank-circle-line'}"></i></span>
                      <span class="mode-btn-name">${escapeHtml(mainEff.name && mainEff.name !== mainEff.baseEffect ? mainEff.name : (p.name || mainEff.baseEffect))}</span>
                      <span class="mode-btn-tag">Primary</span>
                      <span class="mode-btn-status-badge ${isPrimaryActive ? 'active' : 'standby'}">${isPrimaryActive ? 'ACTIVE' : 'STANDBY'}</span>
                    </button>
                    ${p.alternateEffects.map((ae, aIdx) => {
      const isThisSlotActive = isPowerActive && (activeSlotId === ae.id);
      const eff = ae.effect || ae;
      const slotLinkedCount = Array.isArray(ae.linkedEffects) ? ae.linkedEffects.length : 0;
      return `
                        <button class="array-mode-btn ${isThisSlotActive ? 'active' : 'standby'} ${ae.isDynamic ? 'dynamic' : ''} ${!isPowerActive ? 'disabled' : ''}" data-set-array-slot="${p.id}:${ae.id}" type="button" title="${isThisSlotActive ? 'This alternate mode is active in combat' : 'Click to switch to this mode (Free Action)'}">
                          <span class="mode-btn-indicator"><i class="${isThisSlotActive ? 'ri-radio-button-fill' : 'ri-checkbox-blank-circle-line'}"></i></span>
                          <span class="mode-btn-name">${escapeHtml(ae.name || eff.name || eff.baseEffect || `Slot ${aIdx + 1}`)}</span>
                          ${slotLinkedCount > 0 ? `<span class="mode-btn-linked-badge" title="${slotLinkedCount} Linked Effects">+${slotLinkedCount}</span>` : ''}
                          <span class="mode-btn-tag ${ae.isDynamic ? 'dynamic' : 'alt'}">${ae.isDynamic ? 'Dynamic' : 'Alt'}</span>
                          <span class="mode-btn-status-badge ${isThisSlotActive ? 'active' : 'standby'}">${isThisSlotActive ? 'ACTIVE' : 'STANDBY'}</span>
                        </button>
                      `;
    }).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- ZONA 2: TACTICAL MECHANICS 2x2 EXPLANATION GRID -->
              <div class="power-tactical-grid">
                <!-- Cell 1: ACTION -->
                <div class="tactical-grid-cell">
                  <div class="tactical-grid-cell-header">
                    <span class="tactical-grid-title"><i class="ri-time-line action-icon"></i> ACTION</span>
                    <span class="tactical-grid-badge action">${escapeHtml(displayedEff.action || 'Standard')}</span>
                  </div>
                  <p class="tactical-grid-desc">${getActionExplanation(displayedEff.action || 'Standard')}</p>
                </div>

                <!-- Cell 2: RANGE -->
                <div class="tactical-grid-cell">
                  <div class="tactical-grid-cell-header">
                    <span class="tactical-grid-title"><i class="ri-map-pin-range-line range-icon"></i> RANGE</span>
                    <span class="tactical-grid-badge range">${escapeHtml(displayedEff.range || 'Close')}</span>
                  </div>
                  <p class="tactical-grid-desc">${getRangeExplanation(displayedEff.range || 'Close', displayedEff.ranks || 1)}</p>
                </div>

                <!-- Cell 3: DURATION -->
                <div class="tactical-grid-cell">
                  <div class="tactical-grid-cell-header">
                    <span class="tactical-grid-title"><i class="ri-timer-line duration-icon"></i> DURATION</span>
                    <span class="tactical-grid-badge duration">${escapeHtml(displayedEff.duration || 'Instant')}</span>
                  </div>
                  <p class="tactical-grid-desc">${getDurationExplanation(displayedEff.duration || 'Instant')}</p>
                </div>

                <!-- Cell 4: RESISTANCE CHECK -->
                <div class="tactical-grid-cell">
                  <div class="tactical-grid-cell-header">
                    <span class="tactical-grid-title"><i class="ri-shield-check-line res-icon"></i> RESISTANCE CHECK</span>
                    <span class="tactical-grid-badge res">${escapeHtml(displayedEff.resistance || 'None')}</span>
                  </div>
                  <p class="tactical-grid-desc">${getResistanceExplanation(displayedEff.resistance, displayedMetrics.dcDescription)}</p>
                </div>
              </div>

              <!-- ZONA 4: ACTIVE EFFECT SHOWCASE -->
              <div class="power-tier-section active-mode-card">
                <div class="tier-badge-line">
                  <span class="tier-label">${isDisplayedMain ? 'Primary Effect' : 'Active Alternate Mode'}:</span>
                  <span class="tier-main-pill">
                    <i class="${getEffectIcon(displayedEff.baseEffect)}"></i>
                    ${escapeHtml(displayedEff.name && displayedEff.name !== displayedEff.baseEffect ? `${displayedEff.name} [${displayedEff.baseEffect}]` : (displayedEff.baseEffect || 'Effect'))} Rank ${displayedEff.ranks || 1}
                  </span>
                  <span class="tier-cost-rate">(${displayedEff.baseCost !== undefined ? displayedEff.baseCost : 1} PP/Rank base)</span>
                  ${isArray ? `
                    <span class="slot-active-status-badge ${isDisplayedMain ? 'primary-active' : 'alt-active'}" style="margin-left: auto;">
                      <i class="ri-flashlight-fill"></i> ${isDisplayedMain ? 'ACTIVE PRIMARY' : `ACTIVE: ${escapeHtml(activeAltSlot?.name || 'ALTERNATE')}`}
                    </span>
                  ` : ''}
                  <button class="btn btn-outline btn-xs btn-send-effect-vtt"
                          data-send-effect-vtt="${p.id}"
                          data-effect-slot="${isDisplayedMain ? 'main' : (activeAltSlot?.id || 'alt')}"
                          style="margin-left: ${isArray ? '0.5rem' : 'auto'};"
                          title="Send only this Effect to Roll20 chat"
                          type="button">
                    <i class="ri-broadcast-line"></i> Share Effect
                  </button>
                </div>
                <!-- RULES EXPLANATION DIRECTLY BELOW EFFECT NAME -->
                ${(displayedEff.desc || baseDef?.desc) ? `
                  <div class="effect-rules-callout">
                    <p class="effect-rules-text">
                      <i class="ri-book-open-line"></i> ${escapeHtml(displayedEff.desc || baseDef.desc)}
                    </p>
                  </div>
                ` : ''}
                ${subOptionsHtml}
              </div>

              <!-- ZONA 5: APPLIED MODIFIERS (EXTRAS & FLAWS) -->
              ${modifiersHtml}

              <!-- ZONA 6: LINKED EFFECTS SYNERGY TREE -->
              ${(activeLinkedEffects && activeLinkedEffects.length > 0) ? `
                <div class="linked-synergy-section">
                  <div class="linked-synergy-banner">
                    <div class="synergy-banner-left">
                      <span class="synergy-icon"><i class="ri-links-line"></i></span>
                      <div>
                        <strong class="synergy-title">LINKED COMBO SUITE (${activeLinkedEffects.length} EFFECTS${!isDisplayedMain ? ` - ${escapeHtml(activeAltSlot?.name || 'ALTERNATE SLOT')}` : ''})</strong>
                        <span class="synergy-subtitle">All effects below trigger simultaneously with 1 attack roll &amp; 1 action</span>
                      </div>
                    </div>
                    <span class="synergy-simultaneous-tag"><i class="ri-flashlight-line"></i> SIMULTANEOUS ON HIT</span>
                  </div>

                  <div class="linked-synergy-tree">
                    ${activeLinkedEffects.map((le, leIdx) => {
      const leCost = calculateEffectCost(le).totalCost;
      const leBenefit = getEffectBenefitSnippet(le);
      const leBaseDef = BASE_EFFECTS.find(b => b.name === (le.baseEffect || le.name));
      const leSub = renderEffectDetailedSubOptions(le);
      const leMods = renderEffectExplainedModifiers(le, `${p.name || 'Power'} [${le.name || le.baseEffect}]`);
      const isLast = leIdx === activeLinkedEffects.length - 1;

      return `
                        <div class="linked-synergy-node ${isLast ? 'is-last' : ''}">
                          <div class="synergy-connector-rail">
                            <span class="synergy-rail-dot"></span>
                            <span class="synergy-rail-line"></span>
                          </div>
                          <div class="synergy-node-card">
                            <div class="synergy-node-top">
                              <div class="synergy-node-ident">
                                <span class="synergy-node-glyph"><i class="${getEffectIcon(le.baseEffect)}"></i></span>
                                <div>
                                  <div class="synergy-title-row">
                                    <strong class="synergy-node-name">${escapeHtml(le.name || le.baseEffect)}</strong>
                                    <span class="synergy-rank-badge">Rank ${le.ranks || 1}</span>
                                    ${leBenefit ? `<span class="synergy-benefit-pill"><i class="ri-checkbox-circle-fill"></i> ${escapeHtml(leBenefit)}</span>` : ''}
                                  </div>
                                  ${(le.desc || leBaseDef?.desc) ? `
                                    <div class="synergy-rules-callout">
                                      <p class="synergy-rules-text"><i class="ri-book-open-line"></i> ${escapeHtml(le.desc || leBaseDef.desc)}</p>
                                    </div>
                                  ` : ''}
                                </div>
                              </div>
                              <div class="synergy-node-meta">
                                ${le.resistance ? `<span class="tactical-chip-micro res"><i class="ri-shield-line"></i> vs ${escapeHtml(le.resistance)}</span>` : ''}
                                <span class="tactical-chip-micro action">${escapeHtml(le.action || 'None')}</span>
                                <span class="tactical-chip-micro range">${escapeHtml(le.range || 'Personal')}</span>
                                <span class="synergy-cost-pill">${leCost} PP</span>
                                <button class="btn-send-vtt btn-send-vtt-xs btn-send-linked-effect-vtt"
                                        data-send-linked-effect-vtt="${escapeHtml(le.name || le.baseEffect)}"
                                        data-parent-power="${escapeHtml(p.name || 'Power')}"
                                        data-effect-ranks="${le.ranks || 1}"
                                        data-effect-action="${escapeHtml(le.action || 'None')}"
                                        data-effect-range="${escapeHtml(le.range || 'Personal')}"
                                        data-effect-duration="${escapeHtml(le.duration || 'Instant')}"
                                        data-effect-res="${escapeHtml(le.resistance ? `vs ${le.resistance}` : '')}"
                                        data-effect-cost="${leCost} PP"
                                        data-effect-desc="${escapeHtml(leBenefit || '')}"
                                        title="Share ${escapeHtml(le.name || le.baseEffect)} Linked Effect to Roll20"
                                        type="button">
                                  <i class="ri-broadcast-line"></i>
                                </button>
                              </div>
                            </div>
                            ${leSub}
                            ${leMods}
                          </div>
                        </div>
                      `;
    }).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- ZONA 7: ARRAY COMPARE ALL MODES OVERVIEW (TOGGLED) -->
              ${(isArray && isArrayOverviewOpen) ? `
                <div class="array-overview-panel">
                  <div class="overview-panel-header">
                    <div class="overview-header-left">
                      <i class="ri-layout-grid-fill"></i>
                      <strong>All Configured Array Slots (${1 + p.alternateEffects.length})</strong>
                    </div>
                    <span class="overview-hint">Mutually exclusive power configurations sharing a ${primarySuiteCapacity} PP pool</span>
                  </div>
                  <div class="array-overview-grid">
                    <!-- Primary Slot Card -->
                    <div class="overview-slot-card ${isPrimaryActive ? 'active-combat' : 'standby'}">
                      <div class="overview-slot-header">
                        <div class="overview-slot-title-wrap">
                          <span class="overview-slot-chip primary">Primary Core</span>
                          <strong>${escapeHtml(mainEff.name && mainEff.name !== mainEff.baseEffect ? mainEff.name : (p.name || mainEff.baseEffect))}</strong>
                          <span class="overview-rank-tag">Rank ${mainEff.ranks || 1}</span>
                          ${(p.linkedEffects && p.linkedEffects.length > 0) ? `<span class="power-tag linked-badge" style="font-size:0.65rem; padding: 2px 6px;"><i class="ri-links-line"></i> +${p.linkedEffects.length} Linked</span>` : ''}
                        </div>
                        <span class="overview-slot-cost">${primarySuiteCapacity} PP Value</span>
                      </div>
                      ${(p.linkedEffects && p.linkedEffects.length > 0) ? `
                        <div class="overview-slot-linked-summary" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">
                          <i class="ri-links-line"></i> <strong>Linked:</strong> ${p.linkedEffects.map(le => `${escapeHtml(le.name || le.baseEffect)} (R${le.ranks || 1})`).join(' + ')}
                        </div>
                      ` : ''}
                      <div class="overview-slot-meta">
                        <span><i class="ri-time-line"></i> ${escapeHtml(mainEff.action || 'Standard')}</span>
                        <span><i class="ri-map-pin-range-line"></i> ${escapeHtml(mainEff.range || 'Close')}</span>
                        <span><i class="ri-shield-line"></i> vs ${escapeHtml(mainEff.resistance || 'Toughness')}</span>
                      </div>
                      ${isPrimaryActive ? `
                        <div class="overview-active-indicator"><i class="ri-flashlight-fill"></i> CURRENTLY ACTIVE IN COMBAT</div>
                      ` : `
                        <button class="btn btn-outline btn-xs overview-activate-btn" data-set-array-slot="${p.id}:main" type="button">
                          <i class="ri-swap-box-line"></i> Switch to this Mode (Free Action)
                        </button>
                      `}
                    </div>

                    <!-- Alternate Slots Cards -->
                    ${p.alternateEffects.map((ae, aIdx) => {
      const eff = ae.effect || ae;
      const effCost = calculateEffectCost(eff).totalCost;
      const slotLinkedEffects = Array.isArray(ae.linkedEffects) ? ae.linkedEffects : [];
      const slotLinkedCost = slotLinkedEffects.reduce((sum, le) => sum + (calculateEffectCost(le).totalCost || 0), 0);
      const combinedCost = effCost + slotLinkedCost;
      const isThisActive = isPowerActive && (activeSlotId === ae.id);
      return `
                        <div class="overview-slot-card ${isThisActive ? 'active-combat' : 'standby'} ${ae.isDynamic ? 'dynamic' : ''}">
                          <div class="overview-slot-header">
                            <div class="overview-slot-title-wrap">
                              <span class="overview-slot-chip ${ae.isDynamic ? 'dynamic' : 'alt'}">${ae.isDynamic ? 'Dynamic' : 'Alternate'} Slot ${aIdx + 1}</span>
                              <strong>${escapeHtml(ae.name || eff.name || eff.baseEffect || `Slot ${aIdx + 1}`)}</strong>
                              <span class="overview-rank-tag">Rank ${eff.ranks || 1}</span>
                              ${slotLinkedEffects.length > 0 ? `<span class="power-tag linked-badge" style="font-size:0.65rem; padding: 2px 6px;"><i class="ri-links-line"></i> +${slotLinkedEffects.length} Linked</span>` : ''}
                            </div>
                            <span class="overview-slot-cost">${combinedCost} PP Value</span>
                          </div>
                          ${slotLinkedEffects.length > 0 ? `
                            <div class="overview-slot-linked-summary" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">
                              <i class="ri-links-line"></i> <strong>Linked:</strong> ${slotLinkedEffects.map(le => `${escapeHtml(le.name || le.baseEffect)} (R${le.ranks || 1})`).join(' + ')}
                            </div>
                          ` : ''}
                          <div class="overview-slot-meta">
                            <span><i class="ri-time-line"></i> ${escapeHtml(eff.action || 'Standard')}</span>
                            <span><i class="ri-map-pin-range-line"></i> ${escapeHtml(eff.range || 'Close')}</span>
                            <span><i class="ri-shield-line"></i> vs ${escapeHtml(eff.resistance || 'Toughness')}</span>
                          </div>
                          ${isThisActive ? `
                            <div class="overview-active-indicator"><i class="ri-flashlight-fill"></i> CURRENTLY ACTIVE IN COMBAT</div>
                          ` : `
                            <button class="btn btn-outline btn-xs overview-activate-btn" data-set-array-slot="${p.id}:${ae.id}" type="button">
                              <i class="ri-swap-box-line"></i> Switch to this Mode (Free Action)
                            </button>
                          `}
                        </div>
                      `;
    }).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- ZONA 8: COST BREAKDOWN & NOTES FOOTER -->
              <div class="power-tier-footer">
                <div class="power-cost-formula-bar">
                  <span class="formula-label"><i class="ri-calculator-line"></i> Cost Breakdown:</span>
                  <span class="formula-math">${getCostBreakdownFormula(p, mainEff, cost)}</span>
                </div>
                ${p.notes ? `<p class="power-notes-quote"><i class="ri-chat-1-line"></i> "${escapeHtml(p.notes)}"</p>` : ''}
              </div>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;

  // Bind Master Power Toggle (Activate / Deactivate)
  container.querySelectorAll('[data-toggle-power]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.togglePower;
      const power = powers.find(x => x.id === pId);
      const nowActive = store.togglePowerActive(pId);
      const name = power ? (power.name || power.baseEffect || 'Power') : 'Power';
      showToast(nowActive ? `Power "${name}" activated!` : `Power "${name}" deactivated.`, 'info');
    });
  });

  // Bind Power Collapse / Expand Toggle
  container.querySelectorAll('[data-toggle-collapse-power]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.toggleCollapsePower;
      if (collapsedPowerIds.has(pId)) {
        collapsedPowerIds.delete(pId);
      } else {
        collapsedPowerIds.add(pId);
      }
      renderPowers();
    });
  });

  // Bind Array Slot Switcher (Both dock buttons and overview buttons)
  container.querySelectorAll('[data-set-array-slot]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const [powerId, slotId] = btn.dataset.setArraySlot.split(':');
      const power = powers.find(x => x.id === powerId);
      if (!power) return;

      store.setActiveArraySlot(powerId, slotId);
      let slotTitle = 'Primary Effect';
      if (slotId !== 'main') {
        const slot = power.alternateEffects?.find(s => s.id === slotId);
        slotTitle = slot ? (slot.name || slot.effect?.baseEffect || 'Alternate Slot') : 'Alternate Slot';
      }
      showToast(`Switched active mode to "${slotTitle}" (Free Action)`, 'success');
    });
  });

  // Bind Array Overview Toggle (Compare All Modes)
  container.querySelectorAll('[data-toggle-array-overview]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.toggleArrayOverview;
      if (expandedArrayOverviewIds.has(pId)) {
        expandedArrayOverviewIds.delete(pId);
      } else {
        expandedArrayOverviewIds.add(pId);
      }
      renderPowers();
    });
  });

  // Bind Power Rules Drawer Toggle (Progressive Disclosure)
  container.querySelectorAll('[data-toggle-power-rules]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.togglePowerRules;
      if (expandedPowerRulesIds.has(pId)) {
        expandedPowerRulesIds.delete(pId);
      } else {
        expandedPowerRulesIds.add(pId);
      }
      renderPowers();
    });
  });

  // Bind Send Full Power to Roll20 VTT
  container.querySelectorAll('[data-send-power-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.sendPowerVtt;
      const p = powers.find(x => x.id === pId);
      if (!p) return;

      const mainEff = p.mainEffect || p;
      const isArray = p.type === 'array' || (Array.isArray(p.alternateEffects) && p.alternateEffects.length > 0);
      const activeSlotId = p.activeSlotId || 'main';
      const isPrimaryActive = !isArray || activeSlotId === 'main' || !p.alternateEffects.some(s => s.id === activeSlotId);
      const activeAltSlot = isArray && !isPrimaryActive ? p.alternateEffects.find(s => s.id === activeSlotId) : null;
      const activeEff = isPrimaryActive ? mainEff : (activeAltSlot?.effect || activeAltSlot || mainEff);

      const extrasList = (activeEff.extras || []).map(ex => `${ex.name} (${(ex.cost >= 0 ? '+' : '') + ex.cost}/rank)`);
      const flawsList = (activeEff.flaws || []).map(fl => `${fl.name} (${fl.cost}/rank)`);
      const activeSlotName = !isPrimaryActive && activeAltSlot ? (activeAltSlot.name || activeEff.name) : null;
      const fullPowerName = activeSlotName ? `${p.name || 'Power'}: ${activeSlotName}` : (p.name || activeEff.name || 'Custom Power');
      const effectSummary = `${activeEff.baseEffect || activeEff.name || 'Effect'} Rank ${activeEff.ranks || 1}`;

      sendFeatureToVTT({
        category: 'power',
        name: fullPowerName,
        effectSummary,
        action: activeEff.action || 'Standard Action',
        range: activeEff.range || 'Personal',
        duration: activeEff.duration || 'Instant',
        resistance: activeEff.resistance ? `DC ${10 + (activeEff.ranks || 1)} vs ${activeEff.resistance}` : '',
        descriptors: p.descriptors || [],
        extras: extrasList,
        flaws: flawsList,
        cost: `${calculatePowerTotalCost(p)} PP`,
        description: p.notes || p.description || ''
      });
    });
  });

  // Bind Send Single Power Effect to Roll20 VTT
  container.querySelectorAll('[data-send-effect-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.sendEffectVtt;
      const p = powers.find(x => x.id === pId);
      if (!p) return;

      const slotId = btn.dataset.effectSlot || 'main';
      const mainEff = p.mainEffect || p;
      const eff = (slotId !== 'main' && Array.isArray(p.alternateEffects))
        ? (p.alternateEffects.find(s => s.id === slotId)?.effect || mainEff)
        : mainEff;

      const baseDef = (typeof BASE_EFFECTS !== 'undefined' ? BASE_EFFECTS : []).find(b => b.name === (eff.baseEffect || eff.name));
      const metrics = calculatePowerCombatMetrics({ ...p, mainEffect: eff }, store.character.powerLevel, store.character.abilities, store.character.skills);
      const effName = eff.name && eff.name !== eff.baseEffect ? `${eff.name} [${eff.baseEffect}]` : (eff.baseEffect || 'Effect');

      sendFeatureToVTT({
        category: 'power_effect',
        name: effName,
        parentPower: p.name || 'Power',
        ranks: eff.ranks || 1,
        action: eff.action || 'Standard',
        range: eff.range || 'Close',
        duration: eff.duration || 'Instant',
        resistance: metrics?.dcDescription || (eff.resistance ? `DC ${10 + (eff.ranks || 1)} vs ${eff.resistance}` : ''),
        cost: `${eff.baseCost !== undefined ? eff.baseCost : 1} PP/Rank base`,
        description: eff.desc || baseDef?.desc || ''
      });
    });
  });

  // Bind Send Single Extra to Roll20 VTT
  container.querySelectorAll('[data-send-extra-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const extraName = btn.dataset.sendExtraVtt;
      const cost = btn.dataset.extraCost;
      const desc = btn.dataset.extraDesc;
      const parentPower = btn.dataset.parentPower;

      sendFeatureToVTT({
        category: 'power_extra',
        name: extraName,
        parentPower: parentPower || '',
        cost: cost || '+1 PP',
        description: desc || ''
      });
    });
  });

  // Bind Send Single Flaw to Roll20 VTT
  container.querySelectorAll('[data-send-flaw-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const flawName = btn.dataset.sendFlawVtt;
      const cost = btn.dataset.flawCost;
      const desc = btn.dataset.flawDesc;
      const parentPower = btn.dataset.parentPower;

      sendFeatureToVTT({
        category: 'power_flaw',
        name: flawName,
        parentPower: parentPower || '',
        cost: cost || '-1 PP',
        description: desc || ''
      });
    });
  });

  // Bind Send Linked Effect to Roll20 VTT
  container.querySelectorAll('[data-send-linked-effect-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const leName = btn.dataset.sendLinkedEffectVtt;
      const parentPower = btn.dataset.parentPower;
      const ranks = btn.dataset.effectRanks;
      const action = btn.dataset.effectAction;
      const range = btn.dataset.effectRange;
      const duration = btn.dataset.effectDuration;
      const res = btn.dataset.effectRes;
      const cost = btn.dataset.effectCost;
      const desc = btn.dataset.effectDesc;

      sendFeatureToVTT({
        category: 'power_effect',
        name: `${leName} (Linked Effect)`,
        parentPower: parentPower || '',
        ranks: ranks || 1,
        action: action || 'None',
        range: range || 'Personal',
        duration: duration || 'Instant',
        resistance: res || '',
        cost: cost || '',
        description: desc || 'Linked effect triggers simultaneously with primary attack.'
      });
    });
  });

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

function renderResourcesTab(container) {
  const char = store.character;
  const budget = store.getEquipmentBudgetInfo();

  container.innerHTML = `
    <div class="resources-page">
      <div class="res-header">
        <div>
          <h2>Equipment & Resources Workshop</h2>
          <p>Weapons, ballistic armor, utility gadgets, combat vehicles, and secret bases (1 PP = 5 EP).</p>
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
            <span class="budget-label">Equipment Capacity</span>
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
              <i class="ri-flashlight-line"></i> Auto-Sync Advantage (${budget.neededRanks} Ranks / ${budget.neededRanks} PP)
            </button>
          ` : `
            <div class="budget-status-ok">
              <span class="status-icon"><i class="ri-checkbox-circle-line"></i></span>
              <span>Budget OK (Remaining: <strong>${budget.remainingEP} EP</strong>)</span>
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
          <button class="filter-chip ${activeResourceCategory === 'Weapons' ? 'active' : ''}" data-res-filter="Weapons">
            <i class="ri-sword-line"></i> Weapons (${char.resources.filter(r => r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor'))).length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Armor' ? 'active' : ''}" data-res-filter="Armor">
            <i class="ri-shield-line"></i> Armor & Defense (${char.resources.filter(r => r.subtype === 'armor' || r.subtype === 'shield' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '')).length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Gadget' ? 'active' : ''}" data-res-filter="Gadget">
            <i class="ri-smartphone-line"></i> Gadgets (${char.resources.filter(r => r.type === 'Gadget' || r.subtype === 'gadget').length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Vehicle' ? 'active' : ''}" data-res-filter="Vehicle">
            <i class="ri-car-line"></i> Vehicles (${char.resources.filter(r => r.type === 'Vehicle' || r.subtype === 'vehicle').length})
          </button>
          <button class="filter-chip ${activeResourceCategory === 'Headquarters' ? 'active' : ''}" data-res-filter="Headquarters">
            <i class="ri-building-line"></i> HQ (${char.resources.filter(r => r.type === 'Headquarters' || r.subtype === 'headquarters').length})
          </button>
        </div>

        <div class="quick-add-group">
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Gear"><i class="ri-sword-line"></i> + Weapon/Armor</button>
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Gadget"><i class="ri-smartphone-line"></i> + Gadget</button>
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Vehicle"><i class="ri-car-line"></i> + Vehicle</button>
          <button class="btn btn-secondary btn-xs" data-quick-add-type="Headquarters"><i class="ri-building-line"></i> + HQ</button>
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
  const str = store.getAbility('STR');
  const fgt = store.getAbility('FGT');
  const dex = store.getAbility('DEX');

  const listWrap = container.querySelector('#resources-list-wrap');
  if (!listWrap) return;

  const filtered = char.resources.filter(r => {
    if (activeResourceCategory === 'all') return true;
    if (activeResourceCategory === 'Weapons') {
      return r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor'));
    }
    if (activeResourceCategory === 'Armor') {
      return r.subtype === 'armor' || r.subtype === 'shield' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '');
    }
    if (activeResourceCategory === 'Gadget') {
      return r.type === 'Gadget' || r.subtype === 'gadget';
    }
    if (activeResourceCategory === 'Vehicle') {
      return r.type === 'Vehicle' || r.subtype === 'vehicle';
    }
    if (activeResourceCategory === 'Headquarters') {
      return r.type === 'Headquarters' || r.subtype === 'headquarters';
    }
    return r.type === activeResourceCategory;
  });

  const getResIcon = (r) => {
    if (r.subtype === 'weapon_ranged' || (r.weapon?.range === 'Ranged')) return '<i class="ri-focus-2-line"></i>';
    if (r.subtype?.startsWith('weapon') || r.weapon != null) return '<i class="ri-sword-line"></i>';
    if (r.subtype === 'armor') return '<i class="ri-shield-check-line"></i>';
    if (r.subtype === 'shield') return '<i class="ri-shield-line"></i>';
    if (r.type === 'Vehicle' || r.subtype === 'vehicle') return '<i class="ri-car-line"></i>';
    if (r.type === 'Headquarters' || r.subtype === 'headquarters') return '<i class="ri-building-line"></i>';
    if (r.type === 'Gadget' || r.subtype === 'gadget') return '<i class="ri-smartphone-line"></i>';
    return '<i class="ri-archive-line"></i>';
  };

  const getSubtypeLabel = (r) => {
    if (r.subtype === 'weapon_ranged') return 'RANGED WEAPON';
    if (r.subtype === 'weapon_melee') return 'MELEE WEAPON';
    if (r.weapon) return r.weapon.range === 'Ranged' ? 'RANGED WEAPON' : 'MELEE WEAPON';
    if (r.subtype === 'armor') return 'BODY ARMOR';
    if (r.subtype === 'shield') return 'SHIELD';
    if (r.type === 'Vehicle' || r.subtype === 'vehicle') return 'VEHICLE';
    if (r.type === 'Headquarters' || r.subtype === 'headquarters') return 'HEADQUARTERS';
    return (r.type || 'GEAR').toUpperCase();
  };

  listWrap.innerHTML = filtered.length === 0 ? `
    <div class="empty-hint">
      ${char.resources.length === 0
      ? 'Equipment library is empty. Click "+ Add Item / Preset" above to choose official M&M 3e weapons, gadgets, vehicles, or secret headquarters!'
      : `No items in category "${activeResourceCategory}".`}
    </div>
  ` : `
    <div class="res-grid">
      ${filtered.map((r, i) => {
        const itemId = r.id || i;
        const status = r.status || 'equipped';
        const isEquipped = status === 'equipped';

        // Check weapon stats
        const isWeapon = r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || '') && !r.subtype?.includes('armor'));
        const w = r.weapon || {};
        const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
        const isRanged = w.range === 'Ranged' || (/Ranged/i.test(r.desc || '') && !/Close/i.test(w.range || ''));

        let dmgRank = w.damageRank;
        if (dmgRank === undefined) {
          const match = (r.desc || '').match(/Damage\s+(\d+)/i);
          dmgRank = match ? parseInt(match[1], 10) : 1;
        }

        const traits = Array.isArray(w.traits) ? w.traits : [];
        const isAffliction = traits.includes('Affliction') || /Affliction/i.test(r.desc || '');

        let atkBonus = 0;
        if (isWeapon) {
          if (isRanged) {
            const rangedSkill = char.skills.find(s => s.name === 'Ranged Combat' && (
              new RegExp(r.name, 'i').test(s.subtype || '') ||
              /firearm|guns|pistol|rifle|projectile/i.test(s.subtype || '')
            ));
            atkBonus = dex + (rangedSkill ? rangedSkill.ranks : 0) + (w.attackBonus || 0);
          } else {
            const closeSkill = char.skills.find(s => s.name === 'Close Combat' && (
              new RegExp(r.name, 'i').test(s.subtype || '') ||
              /blades|swords|melee|unarmed|axes/i.test(s.subtype || '')
            ));
            atkBonus = fgt + (closeSkill ? closeSkill.ranks : 0) + (w.attackBonus || 0);
          }
        }

        const effectiveDmg = isStrengthBased ? (str + dmgRank) : dmgRank;
        const dcBase = isAffliction ? 10 : 15;
        const dc = dcBase + effectiveDmg;
        const resistance = w.resistance || (isAffliction ? 'Fortitude' : 'Toughness');
        const crit = w.crit || (/Critical\s+([0-9-]+)/i.exec(r.desc || '')?.[1]) || '20';

        // Check armor stats
        const isArmor = r.subtype === 'armor' || r.subtype === 'shield' || r.armor != null || /Protection\s+\d+/i.test(r.desc || '');
        const a = r.armor || {};
        let protRank = a.protectionRank;
        if (protRank === undefined) {
          const m = (r.desc || '').match(/Protection\s+(\d+)/i);
          protRank = m ? parseInt(m[1], 10) : 0;
        }

        // Vehicle / HQ stats
        const v = r.vehicle;
        const hq = r.hq;

        return `
          <div class="res-card stagger-item ${isEquipped ? 'card-equipped' : 'card-unequipped'}" style="--stagger-idx: ${i};">
            <div class="res-card-top">
              <div class="res-title-box">
                <span class="res-icon ${r.subtype || r.type}">${getResIcon(r)}</span>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                    <span class="badge badge-subtle">${getSubtypeLabel(r)}</span>
                    <button
                      class="res-status-pill status-${status}"
                      data-toggle-status="${itemId}"
                      title="Click to cycle status (Equipped -> In Bag -> Stored)"
                    >
                      ${status === 'equipped'
                        ? '<i class="ri-checkbox-circle-fill breathing-pulse"></i> Equipped'
                        : status === 'carried'
                        ? '<i class="ri-inbox-line"></i> In Bag'
                        : '<i class="ri-archive-line"></i> Stored'}
                    </button>
                  </div>
                  <strong class="res-card-name">${escapeHtml(r.name)}</strong>
                </div>
              </div>
              <div class="res-top-actions">
                <span class="ep-tag font-mono">${r.epCost ?? r.cost ?? 0} EP</span>
                <button class="btn-icon-subtle btn-send-res-vtt" data-send-res-vtt="${itemId}" title="Send ${escapeHtml(r.name)} card to Roll20 chat"><i class="ri-broadcast-line"></i></button>
                <button class="btn-icon-subtle" data-edit-res="${itemId}" title="Edit Item"><i class="ri-edit-line"></i></button>
                <button class="btn-icon-subtle text-danger" data-del-res="${itemId}" title="Delete Item"><i class="ri-delete-bin-line"></i></button>
              </div>
            </div>

            <!-- TACTICAL CHIPS ROW -->
            ${isWeapon ? `
              <div class="res-tactical-chips">
                <span class="res-chip chip-atk font-mono"><i class="ri-crosshair-2-line"></i> Atk +${atkBonus}</span>
                <span class="res-chip chip-dc font-mono"><i class="ri-shield-flash-line"></i> DC ${dc} ${resistance}</span>
                <span class="res-chip chip-range">${isRanged ? 'Ranged' : (isStrengthBased ? 'Melee (STR-based)' : 'Close')}</span>
                <span class="res-chip chip-crit font-mono">Crit ${crit}</span>
                ${traits.map(t => `<span class="res-chip trait-chip">${t}</span>`).join('')}
              </div>

              <!-- WEAPON QUICK ROLL BUTTONS -->
              <div class="res-quick-roll-bar">
                <button class="btn btn-primary btn-xs btn-res-roll-atk font-mono" data-res-roll-atk="${itemId}">
                  <i class="ri-dice-line"></i> Roll Attack (d20+${atkBonus})
                </button>
                <button class="btn btn-secondary btn-xs btn-res-roll-dc font-mono" data-res-roll-dc="${itemId}" title="Display Resistance Check DC in chat">
                  <i class="ri-shield-line"></i> DC ${dc} ${resistance}
                </button>
              </div>
            ` : isArmor ? `
              <div class="res-tactical-chips">
                ${protRank > 0 ? `<span class="res-chip chip-prot font-mono"><i class="ri-shield-check-line"></i> +${protRank} Toughness</span>` : ''}
                ${a.activeDefenseBonus ? `<span class="res-chip chip-def font-mono">+${a.activeDefenseBonus} Active Def (Dodge/Parry)</span>` : ''}
                ${a.isSubtle ? `<span class="res-chip">Subtle</span>` : ''}
                ${a.imperviousRank > 0 ? `<span class="res-chip font-mono">Impervious ${a.imperviousRank}</span>` : ''}
                ${isEquipped && protRank > 0 ? `<span class="res-chip chip-applied"><i class="ri-check-double-line"></i> Added to Active Toughness</span>` : ''}
              </div>
            ` : v ? `
              <div class="res-stat-matrix">
                <div class="matrix-cell"><span class="m-lbl">SIZE</span><span class="m-v">${v.size}</span></div>
                <div class="matrix-cell"><span class="m-lbl">STR</span><span class="m-v">${v.str}</span></div>
                <div class="matrix-cell"><span class="m-lbl">SPEED</span><span class="m-v">${v.speedRank} (${v.speedMph})</span></div>
                <div class="matrix-cell"><span class="m-lbl">DEFENSE</span><span class="m-v">${v.defense}</span></div>
                <div class="matrix-cell"><span class="m-lbl">TOUGHNESS</span><span class="m-v">${v.toughness}${v.impervious ? ` (Imp ${v.impervious})` : ''}</span></div>
              </div>
              ${v.features?.length > 0 ? `
                <div class="res-features-chips">
                  ${v.features.map(f => `<span class="feature-chip"><i class="ri-check-line"></i> ${f}</span>`).join('')}
                </div>
              ` : ''}
            ` : hq ? `
              <div class="res-stat-matrix">
                <div class="matrix-cell"><span class="m-lbl">SIZE</span><span class="m-v">${hq.size}</span></div>
                <div class="matrix-cell"><span class="m-lbl">TOUGHNESS</span><span class="m-v">${hq.toughness}</span></div>
                <div class="matrix-cell"><span class="m-lbl">FEATURES</span><span class="m-v">${hq.features?.length || 0} Installed</span></div>
              </div>
              ${hq.features?.length > 0 ? `
                <div class="res-features-chips">
                  ${hq.features.map(f => `<span class="feature-chip"><i class="ri-check-line"></i> ${f}</span>`).join('')}
                </div>
              ` : ''}
            ` : ''}

            <p class="res-card-desc">${r.desc || r.notes || '<span class="text-muted">No description notes.</span>'}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;

  if (animate) {
    listWrap.classList.remove('category-content-animate');
    void listWrap.offsetWidth; // Trigger reflow
    listWrap.classList.add('category-content-animate');
  }

  // Toggle status button
  listWrap.querySelectorAll('[data-toggle-status]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idOrIdx = btn.dataset.toggleStatus;
      const resItem = char.resources.find(r => r.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      if (resItem) {
        store.toggleResourceStatus(resItem.id);
      }
    });
  });

  // Weapon Quick Attack Roll
  listWrap.querySelectorAll('[data-res-roll-atk]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idOrIdx = btn.dataset.resRollAtk;
      const r = char.resources.find(item => item.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      if (!r) return;

      const w = r.weapon || {};
      const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
      const isRanged = w.range === 'Ranged' || (/Ranged/i.test(r.desc || '') && !/Close/i.test(w.range || ''));

      let dmgRank = w.damageRank;
      if (dmgRank === undefined) {
        const match = (r.desc || '').match(/Damage\s+(\d+)/i);
        dmgRank = match ? parseInt(match[1], 10) : 1;
      }

      const traits = Array.isArray(w.traits) ? w.traits : [];
      const isAffliction = traits.includes('Affliction') || /Affliction/i.test(r.desc || '');

      let bonus = 0;
      if (isRanged) {
        const rangedSkill = char.skills.find(s => s.name === 'Ranged Combat' && (
          new RegExp(r.name, 'i').test(s.subtype || '') ||
          /firearm|guns|pistol|rifle|projectile/i.test(s.subtype || '')
        ));
        bonus = dex + (rangedSkill ? rangedSkill.ranks : 0) + (w.attackBonus || 0);
      } else {
        const closeSkill = char.skills.find(s => s.name === 'Close Combat' && (
          new RegExp(r.name, 'i').test(s.subtype || '') ||
          /blades|swords|melee|unarmed|axes/i.test(s.subtype || '')
        ));
        bonus = fgt + (closeSkill ? closeSkill.ranks : 0) + (w.attackBonus || 0);
      }

      const effectiveDmg = isStrengthBased ? (str + dmgRank) : dmgRank;
      const dcBase = isAffliction ? 10 : 15;
      const dc = dcBase + effectiveDmg;
      const resistance = w.resistance || (isAffliction ? 'Fortitude' : 'Toughness');
      const crit = w.crit || (/Critical\s+([0-9-]+)/i.exec(r.desc || '')?.[1]) || '20';

      rollCheck({
        name: `${r.name} Attack`,
        type: 'attack',
        bonus,
        subtitle: `Equipment Weapon • ${isRanged ? 'Ranged' : 'Close'} • Resisted by ${resistance}`,
        extra: {
          dc,
          resistance,
          crit,
          descriptor: r.name,
          range: isRanged ? 'Ranged' : 'Close',
          effectRank: effectiveDmg
        }
      });
    });
  });

  // Weapon Quick DC check toast
  listWrap.querySelectorAll('[data-res-roll-dc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idOrIdx = btn.dataset.resRollDc;
      const r = char.resources.find(item => item.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      if (!r) return;

      const w = r.weapon || {};
      const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
      let dmgRank = w.damageRank ?? (parseInt(r.desc?.match(/Damage\s+(\d+)/i)?.[1], 10) || 1);
      const effectiveDmg = isStrengthBased ? (str + dmgRank) : dmgRank;
      const dcBase = /Affliction/i.test(r.desc || '') ? 10 : 15;
      const dc = dcBase + effectiveDmg;
      const resistance = w.resistance || (/Affliction/i.test(r.desc || '') ? 'Fortitude' : 'Toughness');

      showToast(`Target must make a DC ${dc} ${resistance} check against ${r.name}.`, 'info');
    });
  });

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

  // Send Equipment info to Roll20 VTT
  listWrap.querySelectorAll('[data-send-res-vtt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idOrIdx = btn.dataset.sendResVtt;
      const r = char.resources.find(item => item.id === idOrIdx) || char.resources[parseInt(idOrIdx, 10)];
      if (!r) return;

      const ep = r.epCost ?? r.cost ?? 0;
      let mechanicsText = '';

      if (r.weapon) {
        const isStrengthBased = r.weapon.isStrengthBased;
        const effDmg = isStrengthBased ? (str + r.weapon.damageRank) : r.weapon.damageRank;
        mechanicsText = `Damage: DC ${15 + effDmg} (${r.weapon.range || 'Close'}) • Crit ${r.weapon.crit}${r.weapon.traits?.length ? ' • ' + r.weapon.traits.join(', ') : ''}`;
      } else if (r.armor) {
        if (r.armor.activeDefenseBonus > 0) mechanicsText = `Active Defense +${r.armor.activeDefenseBonus} (Dodge/Parry)`;
        else mechanicsText = `+${r.armor.protectionRank} Toughness${r.armor.imperviousRank ? `, Impervious ${r.armor.imperviousRank}` : ''}`;
      } else if (r.vehicle) {
        mechanicsText = `Size: ${r.vehicle.size} • STR: ${r.vehicle.str} • Speed: ${r.vehicle.speedRank} (${r.vehicle.speedMph}) • Def: ${r.vehicle.defense} • Toughness: ${r.vehicle.toughness}`;
      } else if (r.hq) {
        mechanicsText = `Size: ${r.hq.size} • Toughness: ${hq.toughness} • Features: ${hq.features?.join(', ')}`;
      }

      sendFeatureToVTT({
        category: 'equipment',
        name: r.name,
        type: getSubtypeLabel(r),
        cost: `${ep} EP (${Math.ceil(ep / 5)} PP)`,
        mechanics: mechanicsText,
        description: r.desc || r.notes || ''
      });
    });
  });
}

// Global modal triggers for Skills, Advantages, and Resources
window.openAddSkillModal = function (id = null) {
  openSkillModal(id);
};

window.openAdvantageModal = function () {
  openAdvantageModal();
};

window.openAddAdvantageModal = function () {
  openAdvantageModal();
};

window.openAddResourceModal = function (type = 'Gear') {
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
