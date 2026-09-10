// js/components/powerBuilder.js
/**
 * Mutants & Masterminds 3e — Full-Screen Power Studio Component
 * Features:
 * - Full-screen immersive workspace (100vw × 100vh) with top command bar and split-pane layout.
 * - Base Effect Explorer & Active Showcase with full parameter tags (Action, Range, Duration, Resistance, Category, Cost) and rich M&M 3e rules mechanics.
 * - Categorized Modifier Palette & Applied List with tags (Category, Type: Per-Rank / Flat / Ranked Flat), glowing cost badges, and complete explanations.
 * - Live Cost & Mathematical Formula Inspector.
 * - Real-time PL Cap Compliance check and alerts (Standard Attacks & Area/Perception).
 * - Array Capacity & Headroom indicator with slot validation.
 * - Device & Removable discount manager.
 */

import { store } from '../state.js';
import {
  BASE_EFFECTS,
  EFFECT_CATEGORIES,
  EXTRAS,
  FLAWS,
  MODIFIER_CATEGORIES,
  calculatePowerTotalCost,
  calculatePowerDetailedBreakdown,
  calculatePowerCombatMetrics,
  validateArraySlot,
  calculateEffectCost,
  normalizePower,
  createEmptyPower,
  createEmptyEffect,
  normalizeModifier
} from '../rules/powers.js';
import { showToast } from './notifications.js';

let currentPower = null;
let editingPowerId = null;
let activeModifierTab = 'extras'; // 'extras' or 'flaws'
let activeCategory = 'All';
let modifierSearchQuery = '';
let isAddingAltSlot = false;

// Base Effect Explorer state
let isEffectExplorerOpen = false;
let effectCategoryFilter = 'All';
let effectSearchQuery = '';

export function openPowerBuilder(powerToEdit = null) {
  const modal = document.getElementById('power-builder-modal');
  if (!modal) return;

  if (powerToEdit) {
    editingPowerId = powerToEdit.id;
    currentPower = normalizePower(JSON.parse(JSON.stringify(powerToEdit)));
  } else {
    editingPowerId = null;
    currentPower = createEmptyPower();
    currentPower.mainEffect = createEmptyEffect('Damage');
    currentPower.baseEffect = 'Damage';
  }

  activeModifierTab = 'extras';
  activeCategory = 'All';
  modifierSearchQuery = '';
  isAddingAltSlot = false;
  isEffectExplorerOpen = false;
  effectCategoryFilter = 'All';
  effectSearchQuery = '';

  ensureStudioShell(modal);
  renderPowerStudio(true);
  modal.classList.add('open');

  document.removeEventListener('keydown', handleStudioKeyDown);
  document.addEventListener('keydown', handleStudioKeyDown);
}

export function closePowerBuilder() {
  const modal = document.getElementById('power-builder-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  isEffectExplorerOpen = false;
  document.removeEventListener('keydown', handleStudioKeyDown);
}

function handleStudioKeyDown(e) {
  if (e.key === 'Escape') {
    if (isEffectExplorerOpen) {
      isEffectExplorerOpen = false;
      renderPowerStudio();
    } else {
      closePowerBuilder();
    }
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    const saveBtn = document.getElementById('pb-save-header-btn');
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.click();
    }
  }
}

function ensureStudioShell(modal) {
  modal.innerHTML = `
    <div class="modal-dialog power-studio-dialog">
      <div class="modal-header pb-studio-header" id="pb-header-container"></div>
      <div class="modal-body pb-studio-body" id="pb-body-container">
        <div class="pb-canvas" id="pb-canvas-container"></div>
        <div class="pb-inspector" id="pb-inspector-container"></div>
      </div>
      <div id="pb-explorer-container"></div>
    </div>
  `;
}

function getCategoryClass(category) {
  switch (category) {
    case 'Attack': return 'cat-attack';
    case 'Defense': return 'cat-defense';
    case 'Movement': return 'cat-movement';
    case 'Sensory': return 'cat-sensory';
    case 'Control & Utility': return 'cat-control';
    default: return '';
  }
}

function getModifierCategoryClass(category) {
  if (!category) return 'cat-mod-general';
  const c = category.toLowerCase();
  if (c.includes('combat')) return 'cat-mod-combat';
  if (c.includes('range') || c.includes('targeting') || c.includes('area')) return 'cat-mod-range';
  if (c.includes('action') || c.includes('activation') || c.includes('duration')) return 'cat-mod-action';
  if (c.includes('sensory')) return 'cat-mod-sensory';
  if (c.includes('utility')) return 'cat-mod-utility';
  if (c.includes('limitation') || c.includes('flaw')) return 'cat-mod-limitation';
  if (c.includes('device')) return 'cat-mod-device';
  return 'cat-mod-general';
}

function getFilteredModifiers() {
  const sourceList = activeModifierTab === 'extras' ? EXTRAS : FLAWS;
  return sourceList.filter(m => {
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    if (!matchesCategory) return false;

    if (!modifierSearchQuery) return true;
    const q = modifierSearchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q));
  });
}

function getFilteredBaseEffects() {
  return BASE_EFFECTS.filter(eff => {
    const matchesCat = effectCategoryFilter === 'All' || eff.category === effectCategoryFilter;
    if (!matchesCat) return false;
    if (!effectSearchQuery) return true;
    const q = effectSearchQuery.toLowerCase();
    return eff.name.toLowerCase().includes(q) ||
           (eff.desc && eff.desc.toLowerCase().includes(q)) ||
           (eff.action && eff.action.toLowerCase().includes(q)) ||
           (eff.range && eff.range.toLowerCase().includes(q)) ||
           (eff.resistance && eff.resistance.toLowerCase().includes(q));
  });
}

function renderPowerStudio(resetScroll = false) {
  const modal = document.getElementById('power-builder-modal');
  if (!modal) return;

  const bodyContainer = modal.querySelector('#pb-body-container');
  const canvasContainer = modal.querySelector('#pb-canvas-container');
  const inspectorContainer = modal.querySelector('#pb-inspector-container');
  const headerContainer = modal.querySelector('#pb-header-container');
  const explorerContainer = modal.querySelector('#pb-explorer-container');

  if (!canvasContainer || !inspectorContainer || !headerContainer || !explorerContainer) {
    ensureStudioShell(modal);
    return renderPowerStudio(true);
  }

  // Preserve scroll position
  const prevScrollTop = resetScroll ? 0 : (bodyContainer?.scrollTop || 0);

  // Guarantee normalized data
  currentPower = normalizePower(currentPower);
  const breakdown = calculatePowerDetailedBreakdown(currentPower);
  const heroPL = store.character?.powerLevel || 10;
  const abilities = store.character?.abilities || {};
  const skills = store.character?.skills || [];
  const metrics = calculatePowerCombatMetrics(currentPower, heroPL, abilities, skills);
  const isValid = Boolean(currentPower.mainEffect?.baseEffect);

  // Render Header
  headerContainer.innerHTML = `
    <div class="modal-title-group" style="display:flex;align-items:center;gap:0.75rem;">
      <span class="icon studio-brand-icon"><i class="ri-flashlight-fill"></i></span>
      <div>
        <h3 style="margin:0;font-size:1.25rem;">${editingPowerId ? 'Edit Power Studio' : 'Power Studio'}</h3>
        <p class="modal-subtitle" style="margin:0.15rem 0 0 0;font-size:0.78rem;color:var(--text-muted);">
          Full-Screen D20 Hero System Workbench • Effects, Modifiers, Arrays & Devices
        </p>
      </div>
    </div>
    <div class="modal-header-actions" style="display:flex;align-items:center;gap:1rem;">
      <div class="header-pp-pill">
        <span class="pill-label">TOTAL COST</span>
        <span class="pill-val">${breakdown.finalCost} PP</span>
      </div>
      <button id="pb-save-header-btn" class="btn btn-primary" ${isValid ? '' : 'disabled'} title="Save Power (Ctrl+S)">
        <i class="ri-save-line"></i> Save Power
      </button>
      <button id="pb-close-btn" class="btn btn-ghost" title="Close Studio (Esc)"><i class="ri-close-line"></i></button>
    </div>
  `;

  // Render Left Canvas
  canvasContainer.innerHTML = `
    <!-- Mobile Quick Status Strip -->
    <div class="pb-mobile-status-strip">
      <span class="mobile-pl-status ${metrics.plCompliance.isCompliant ? 'compliant' : 'violated'}">
        <i class="${metrics.plCompliance.isCompliant ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i>
        ${metrics.plCompliance.isCompliant ? 'PL ' + heroPL + ' Compliant' : 'PL Cap Exceeded!'}
      </span>
      <span class="mobile-combat-quick">${metrics.isOffensive ? `Attack +${metrics.attackBonus} • DC ${metrics.difficultyClass}` : 'Utility Effect'}</span>
    </div>

    <!-- 1. Identity & Structure Card -->
    <div class="pb-card pb-identity-card">
      <div class="form-row">
        <div class="form-group flex-2">
          <label for="pb-power-name">POWER NAME</label>
          <input type="text" id="pb-power-name" placeholder="e.g., Mystic Bolt, Telekinetic Shield, Web-Shooters" value="${escapeHtml(currentPower.name)}">
        </div>
        <div class="form-group flex-1">
          <label for="pb-power-type">STRUCTURE TYPE</label>
          <select id="pb-power-type">
            <option value="standard" ${currentPower.type === 'standard' ? 'selected' : ''}>Standard Power</option>
            <option value="compound" ${currentPower.type === 'compound' ? 'selected' : ''}>Linked / Compound Power</option>
            <option value="array" ${currentPower.type === 'array' ? 'selected' : ''}>Array (Alternate Effects)</option>
            <option value="device" ${currentPower.type === 'device' ? 'selected' : ''}>Device / Equipment</option>
          </select>
        </div>
        <div class="form-group flex-1">
          <label for="pb-activation">ACTIVATION</label>
          <select id="pb-activation">
            <option value="none" ${currentPower.activation === 'none' ? 'selected' : ''}>None (Standard/Free)</option>
            <option value="move" ${currentPower.activation === 'move' ? 'selected' : ''}>Move Action (-1 PP)</option>
            <option value="standard" ${currentPower.activation === 'standard' ? 'selected' : ''}>Standard Action (-2 PP)</option>
          </select>
        </div>
      </div>

      <!-- Descriptors Tagging -->
      <div class="form-group descriptors-group">
        <label>DESCRIPTORS & THEMES</label>
        <div class="descriptors-manager">
          <div class="descriptors-input-row">
            <input type="text" id="pb-desc-input" placeholder="Type descriptor (e.g., Fire, Mutant, Technology, Cosmic) and press Enter">
            <button id="pb-add-desc-btn" class="btn btn-secondary btn-sm" type="button"><i class="ri-add-line"></i> Add</button>
          </div>
          <div class="descriptors-tags-list">
            ${currentPower.descriptors.map((d, i) => `
              <span class="descriptor-tag">
                <span class="tag-text">${escapeHtml(d)}</span>
                <button class="remove-tag" data-remove-desc="${i}" title="Remove tag"><i class="ri-close-line"></i></button>
              </span>
            `).join('')}
            ${currentPower.descriptors.length === 0 ? '<span class="empty-tag-hint">No descriptors yet (add tags like Magic, Electricity, Psionic).</span>' : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Device / Removable Settings (Visible if Device or Removable configured) -->
    ${(currentPower.type === 'device' || currentPower.deviceConfig?.type !== 'none') ? `
      <div class="pb-card pb-device-card">
        <div class="card-section-header">
          <div class="section-title"><i class="ri-shield-keyhole-line"></i> DEVICE & REMOVABLE SETTINGS</div>
          ${breakdown.deviceDiscount > 0 ? `
            <span class="badge badge-discount"><i class="ri-arrow-down-line"></i> -${breakdown.deviceDiscount} PP Device Discount</span>
          ` : ''}
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label>REMOVABLE TYPE</label>
            <select id="pb-device-type">
              <option value="none" ${currentPower.deviceConfig?.type === 'none' ? 'selected' : ''}>None (Inherent Power)</option>
              <option value="removable" ${currentPower.deviceConfig?.type === 'removable' ? 'selected' : ''}>Removable (-1 PP per 5 PP)</option>
              <option value="easily_removable" ${currentPower.deviceConfig?.type === 'easily_removable' ? 'selected' : ''}>Easily Removable (-2 PP per 5 PP)</option>
            </select>
          </div>
          <div class="form-group flex-2">
            <label>DEVICE ITEM DESCRIPTOR</label>
            <input type="text" id="pb-device-desc" placeholder="e.g., Power Armor, Mystic Staff, Cybernetic Arm" value="${escapeHtml(currentPower.deviceConfig?.descriptor || '')}">
          </div>
          <div class="form-group flex-1">
            <label>ITEM TOUGHNESS</label>
            <input type="number" id="pb-device-toughness" min="1" max="30" value="${currentPower.deviceConfig?.toughness || 10}">
          </div>
        </div>
        <p class="card-hint-text">
          <strong>Removable:</strong> Cannot be taken away in combat without first being incapacitated or bound.<br>
          <strong>Easily Removable:</strong> Can be disarmed or snatched away in combat with an opposed check.
        </p>
      </div>
    ` : ''}

    <!-- 3. Main Effect Card -->
    <div class="pb-card pb-main-effect-card">
      <div class="card-section-header">
        <div class="section-title">
          <span class="badge badge-primary">MAIN EFFECT</span>
          <span class="main-effect-name">${escapeHtml(currentPower.mainEffect.name || currentPower.mainEffect.baseEffect)}</span>
        </div>
        <div class="card-header-badge">
          <span class="effect-cost-badge">${breakdown.mainCost} PP</span>
        </div>
      </div>

      <!-- Base Effect Active Showcase with Full Tags & Rules Explanation -->
      ${renderBaseEffectShowcase(currentPower.mainEffect)}

      <div class="form-row" style="margin-top: 0.75rem;">
        <div class="form-group flex-2">
          <label>QUICK SELECT BASE EFFECT</label>
          <div style="display:flex; gap:0.5rem;">
            <select id="pb-base-effect" style="flex:1;">
              ${BASE_EFFECTS.map(eff => `
                <option value="${eff.name}" ${currentPower.mainEffect.baseEffect === eff.name ? 'selected' : ''}>
                  ${eff.name} (${eff.cost} PP/Rank • ${eff.category || 'General'})
                </option>
              `).join('')}
            </select>
            <button id="pb-browse-effects-btn" class="btn btn-secondary" type="button" title="Open Base Effect Library Explorer">
              <i class="ri-compass-3-line"></i> Library
            </button>
          </div>
        </div>

        <div class="form-group flex-1">
          <label>RANKS</label>
          <div class="stepper">
            <button class="step-btn" id="pb-rank-dec" type="button">-</button>
            <input type="number" class="step-val" id="pb-ranks" value="${currentPower.mainEffect.ranks}" min="1" max="30">
            <button class="step-btn" id="pb-rank-inc" type="button">+</button>
          </div>
        </div>
      </div>

      <!-- Effect Parameter Overrides (Range, Action, Duration, Resistance) -->
      <div class="effect-params-grid">
        <div class="form-group">
          <label>RANGE OVERRIDE</label>
          <select id="pb-effect-range">
            <option value="Personal" ${currentPower.mainEffect.range === 'Personal' ? 'selected' : ''}>Personal</option>
            <option value="Close" ${currentPower.mainEffect.range === 'Close' ? 'selected' : ''}>Close (5 ft)</option>
            <option value="Ranged" ${currentPower.mainEffect.range === 'Ranged' ? 'selected' : ''}>Ranged</option>
            <option value="Perception" ${currentPower.mainEffect.range === 'Perception' ? 'selected' : ''}>Perception</option>
            <option value="Rank" ${currentPower.mainEffect.range === 'Rank' ? 'selected' : ''}>Rank-based</option>
          </select>
        </div>
        <div class="form-group">
          <label>ACTION OVERRIDE</label>
          <select id="pb-effect-action">
            <option value="Standard" ${currentPower.mainEffect.action === 'Standard' ? 'selected' : ''}>Standard</option>
            <option value="Move" ${currentPower.mainEffect.action === 'Move' ? 'selected' : ''}>Move</option>
            <option value="Free" ${currentPower.mainEffect.action === 'Free' ? 'selected' : ''}>Free</option>
            <option value="Reaction" ${currentPower.mainEffect.action === 'Reaction' ? 'selected' : ''}>Reaction</option>
            <option value="None" ${currentPower.mainEffect.action === 'None' ? 'selected' : ''}>None</option>
          </select>
        </div>
        <div class="form-group">
          <label>DURATION OVERRIDE</label>
          <select id="pb-effect-duration">
            <option value="Instant" ${currentPower.mainEffect.duration === 'Instant' ? 'selected' : ''}>Instant</option>
            <option value="Concentration" ${currentPower.mainEffect.duration === 'Concentration' ? 'selected' : ''}>Concentration</option>
            <option value="Sustained" ${currentPower.mainEffect.duration === 'Sustained' ? 'selected' : ''}>Sustained</option>
            <option value="Continuous" ${currentPower.mainEffect.duration === 'Continuous' ? 'selected' : ''}>Continuous</option>
            <option value="Permanent" ${currentPower.mainEffect.duration === 'Permanent' ? 'selected' : ''}>Permanent</option>
          </select>
        </div>
        <div class="form-group">
          <label>RESISTANCE OVERRIDE</label>
          <select id="pb-effect-resistance">
            <option value="Toughness" ${currentPower.mainEffect.resistance === 'Toughness' ? 'selected' : ''}>Toughness</option>
            <option value="Fortitude" ${currentPower.mainEffect.resistance === 'Fortitude' ? 'selected' : ''}>Fortitude</option>
            <option value="Will" ${currentPower.mainEffect.resistance === 'Will' ? 'selected' : ''}>Will</option>
            <option value="Dodge" ${currentPower.mainEffect.resistance === 'Dodge' ? 'selected' : ''}>Dodge</option>
            <option value="None" ${currentPower.mainEffect.resistance === 'None' ? 'selected' : ''}>None</option>
          </select>
        </div>
      </div>

      <!-- Applied Modifiers for Main Effect -->
      <div class="applied-modifiers-block">
        <div class="applied-mod-header">
          <span class="block-title">APPLIED EXTRAS & FLAWS (${currentPower.mainEffect.extras.length + currentPower.mainEffect.flaws.length})</span>
          <span class="block-note">Click "+" from the palette below to attach modifiers</span>
        </div>

        ${(currentPower.mainEffect.extras.length === 0 && currentPower.mainEffect.flaws.length === 0) ? `
          <div class="empty-modifiers-callout">
            <i class="ri-magic-line"></i> No Extras or Flaws applied yet. Select modifiers from the palette below to customize this effect.
          </div>
        ` : `
          <div class="applied-mods-grid">
            ${currentPower.mainEffect.extras.map((ex, idx) => renderAppliedModifierCard(ex, idx, 'extra')).join('')}
            ${currentPower.mainEffect.flaws.map((fl, idx) => renderAppliedModifierCard(fl, idx, 'flaw')).join('')}
          </div>
        `}
      </div>

      <!-- Modifiers Palette (Embedded for instant access) -->
      <div class="modifiers-palette-section">
        <div class="palette-header-bar">
          <!-- Search Box -->
          <div class="palette-search-wrapper">
            <i class="ri-search-line search-icon"></i>
            <input type="text" id="pb-mod-search" placeholder="Search modifiers..." value="${escapeHtml(modifierSearchQuery)}">
            ${modifierSearchQuery ? '<button id="pb-clear-search" class="clear-search-btn"><i class="ri-close-line"></i></button>' : ''}
          </div>

          <!-- Tab Toggle: Extras vs Flaws -->
          <div class="palette-type-tabs">
            <button class="palette-type-btn ${activeModifierTab === 'extras' ? 'active' : ''}" data-mod-type="extras" type="button">
              Extras (${EXTRAS.length})
            </button>
            <button class="palette-type-btn ${activeModifierTab === 'flaws' ? 'active' : ''}" data-mod-type="flaws" type="button">
              Flaws (${FLAWS.length})
            </button>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="palette-category-pills">
          ${MODIFIER_CATEGORIES.map(cat => {
            const catClass = getModifierCategoryClass(cat);
            return `
              <button class="category-pill ${activeCategory === cat ? 'active' : ''} ${catClass}" data-mod-cat="${cat}" type="button">
                <span class="pill-dot ${catClass}"></span> ${cat}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Modifiers List -->
        <div class="palette-scroll-grid" id="pb-palette-grid">
          ${renderPaletteCards()}
        </div>
      </div>
    </div>

    <!-- 4. Linked Effects Section -->
    ${(currentPower.type === 'compound' || currentPower.linkedEffects.length > 0) ? `
      <div class="pb-card pb-linked-card">
        <div class="card-section-header">
          <div class="section-title">
            <i class="ri-links-line"></i> LINKED EFFECTS (${currentPower.linkedEffects.length})
          </div>
          <button id="pb-add-linked-btn" class="btn btn-secondary btn-sm" type="button">
            <i class="ri-add-line"></i> Add Linked Effect
          </button>
        </div>

        <div class="linked-effects-list">
          ${currentPower.linkedEffects.map((linked, lIdx) => {
            const linkedCost = calculateEffectCost(linked, 0).totalCost;
            return `
              <div class="linked-item-card">
                <div class="linked-item-header">
                  <span class="badge badge-secondary">LINKED EFFECT #${lIdx + 1}</span>
                  <span class="linked-cost-val">+${linkedCost} PP</span>
                  <button class="btn-delete-linked" data-remove-linked="${lIdx}" title="Delete linked effect">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
                <div class="form-row">
                  <div class="form-group flex-2">
                    <label>EFFECT</label>
                    <select class="pb-linked-base-sel" data-linked-idx="${lIdx}">
                      ${BASE_EFFECTS.map(eff => `
                        <option value="${eff.name}" ${linked.baseEffect === eff.name ? 'selected' : ''}>
                          ${eff.name} (${eff.cost} PP/Rank • ${eff.category})
                        </option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="form-group flex-1">
                    <label>RANKS</label>
                    <div class="stepper">
                      <button class="step-btn" data-linked-dec="${lIdx}" type="button">-</button>
                      <input type="number" class="step-val" data-linked-rank="${lIdx}" value="${linked.ranks}" min="1" max="30">
                      <button class="step-btn" data-linked-inc="${lIdx}" type="button">+</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
          ${currentPower.linkedEffects.length === 0 ? `
            <div class="empty-section-hint">No linked effects added yet. Click "+ Add Linked Effect" to combine simultaneous effects.</div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <!-- 5. Alternate Effects (Array Studio) Section -->
    ${(currentPower.type === 'array' || currentPower.alternateEffects.length > 0) ? `
      <div class="pb-card pb-array-card">
        <div class="card-section-header">
          <div class="section-title">
            <i class="ri-stack-line"></i> ARRAY STUDIO (${currentPower.alternateEffects.length} Alternate Slots)
          </div>
          <button id="pb-add-alt-slot-btn" class="btn btn-secondary btn-sm" type="button">
            <i class="ri-add-line"></i> Add Alternate Slot
          </button>
        </div>

        <!-- Array Capacity Bar -->
        <div class="array-capacity-banner">
          <div class="capacity-info-row">
            <span><strong>Primary Array Budget:</strong> ${breakdown.arrayCapacity} PP (Cost of Main Effect)</span>
            <span class="capacity-rule-note">Each standard alternate slot costs +1 PP (+2 PP for Dynamic)</span>
          </div>
        </div>

        <!-- Inline Add Slot Box -->
        ${isAddingAltSlot ? `
          <div class="inline-add-slot-box">
            <div class="inline-box-title">New Alternate Effect Slot</div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>SLOT NAME</label>
                <input type="text" id="pb-new-slot-name" placeholder="e.g., Stun Ray, Telekinetic Grip">
              </div>
              <div class="form-group flex-2">
                <label>BASE EFFECT</label>
                <select id="pb-new-slot-base">
                  ${BASE_EFFECTS.map(eff => `<option value="${eff.name}">${eff.name} (${eff.cost} PP/Rank • ${eff.category})</option>`).join('')}
                </select>
              </div>
              <div class="form-group flex-1">
                <label>RANKS</label>
                <input type="number" id="pb-new-slot-ranks" min="1" max="30" value="${currentPower.mainEffect.ranks}">
              </div>
            </div>
            <div class="inline-slot-actions">
              <label class="dynamic-checkbox-label">
                <input type="checkbox" id="pb-new-slot-dynamic"> Dynamic Array (+2 PP)
              </label>
              <div class="action-btns">
                <button id="pb-confirm-add-slot" class="btn btn-primary btn-sm" type="button">Add Slot</button>
                <button id="pb-cancel-add-slot" class="btn btn-ghost btn-sm" type="button">Cancel</button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Slots List -->
        <div class="array-slots-list">
          ${currentPower.alternateEffects.map((slot, aIdx) => {
            const validation = validateArraySlot(breakdown.arrayCapacity, slot.effect);
            return `
              <div class="array-slot-item ${validation.isValid ? '' : 'slot-overflow'}">
                <div class="slot-left">
                  <span class="slot-type-badge ${slot.isDynamic ? 'dynamic' : 'standard'}">
                    ${slot.isDynamic ? 'DYNAMIC (+2 PP)' : 'STANDARD (+1 PP)'}
                  </span>
                  <div class="slot-name-group">
                    <span class="slot-title">${escapeHtml(slot.name || 'Alternate Slot')}</span>
                    <span class="slot-effect-desc">${slot.effect.baseEffect} (Rank ${slot.effect.ranks})</span>
                  </div>
                </div>

                <div class="slot-right">
                  <div class="slot-budget-status ${validation.isValid ? 'budget-ok' : 'budget-warn'}">
                    ${validation.isValid
                      ? `<span>✓ Cost: ${validation.slotCost} PP / ${validation.capacity} PP (${validation.headroom} PP Headroom)</span>`
                      : `<span>⚠️ Cost: ${validation.slotCost} PP exceeds ${validation.capacity} PP (+${validation.overflow} PP)!</span>`
                    }
                  </div>
                  <button class="btn-delete-slot" data-remove-alt="${aIdx}" title="Delete slot">
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
          ${currentPower.alternateEffects.length === 0 ? `
            <div class="empty-section-hint">No alternate slots configured. Click "+ Add Alternate Slot" to build an Array.</div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <!-- 6. Power Notes / Lore -->
    <div class="pb-card pb-notes-card">
      <div class="form-group">
        <label for="pb-notes">NOTES & VISUAL MANIFESTATION</label>
        <textarea id="pb-notes" rows="2" placeholder="Visual fx, origin lore, power complications, special descriptors...">${escapeHtml(currentPower.notes || '')}</textarea>
      </div>
    </div>
  `;

  // Render Right Inspector
  inspectorContainer.innerHTML = `
    <!-- Total Cost Breakdown Card -->
    <div class="inspector-card cost-card">
      <div class="cost-card-header">
        <span class="inspector-title">TOTAL POWER COST</span>
        <span class="cost-value-glow">${breakdown.finalCost} <span class="cost-unit">PP</span></span>
      </div>

      <!-- Mathematical Formula Breakdown -->
      <div class="formula-breakdown-box">
        <div class="formula-title"><i class="ri-calculator-line"></i> FORMULA BREAKDOWN</div>
        <div class="formula-code">${escapeHtml(breakdown.formulaString)}</div>
      </div>

      <!-- Subtotals Checklist -->
      <div class="cost-subtotals-list">
        <div class="subtotal-row">
          <span>Main Effect:</span>
          <span class="subtotal-val">${breakdown.mainCost} PP</span>
        </div>
        ${breakdown.linkedCost > 0 ? `
          <div class="subtotal-row">
            <span>Linked Effects:</span>
            <span class="subtotal-val">+${breakdown.linkedCost} PP</span>
          </div>
        ` : ''}
        ${breakdown.alternateCost > 0 ? `
          <div class="subtotal-row">
            <span>Array Slots:</span>
            <span class="subtotal-val">+${breakdown.alternateCost} PP</span>
          </div>
        ` : ''}
        ${breakdown.deviceDiscount > 0 ? `
          <div class="subtotal-row discount-row">
            <span>Device Discount:</span>
            <span class="subtotal-val">-${breakdown.deviceDiscount} PP</span>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Real-Time PL Cap Compliance Card -->
    <div class="inspector-card compliance-card">
      <div class="compliance-header">
        <span class="inspector-title">PL CAP COMPLIANCE</span>
        <span class="hero-pl-badge">HERO PL ${heroPL}</span>
      </div>

      ${renderComplianceBanner(metrics, heroPL)}
    </div>

    <!-- Combat Action Metrics Card -->
    <div class="inspector-card combat-card">
      <div class="inspector-title">COMBAT PROFILE</div>
      <div class="combat-metrics-grid">
        <div class="metric-item">
          <span class="metric-lbl">ATTACK TYPE</span>
          <span class="metric-data">${metrics.attackType}</span>
        </div>
        <div class="metric-item">
          <span class="metric-lbl">ATTACK BONUS</span>
          <span class="metric-data ${metrics.attackBonus !== null ? 'bonus-val' : 'na-val'}">
            ${metrics.attackBonus !== null ? (metrics.attackBonus >= 0 ? `+${metrics.attackBonus}` : metrics.attackBonus) : 'No roll (Auto/Area)'}
          </span>
        </div>
        <div class="metric-item">
          <span class="metric-lbl">DIFFICULTY CLASS</span>
          <span class="metric-data dc-val">${metrics.dcDescription}</span>
        </div>
        <div class="metric-item">
          <span class="metric-lbl">EFFECTIVE RANGE</span>
          <span class="metric-data">${metrics.rangeDistance}</span>
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="inspector-actions">
      <button id="pb-save-inspector-btn" class="btn btn-primary btn-block" ${isValid ? '' : 'disabled'}>
        <i class="ri-save-line"></i> Save Power (${breakdown.finalCost} PP)
      </button>
      <button id="pb-cancel-inspector-btn" class="btn btn-ghost btn-block">
        Cancel
      </button>
    </div>
  `;

  // Render Base Effect Explorer if opened
  if (isEffectExplorerOpen) {
    explorerContainer.innerHTML = renderEffectExplorerModal();
  } else {
    explorerContainer.innerHTML = '';
  }

  // Restore scroll position
  if (bodyContainer && !resetScroll) {
    bodyContainer.scrollTop = prevScrollTop;
  }

  attachStudioEventHandlers(modal);
}

function renderBaseEffectShowcase(effect) {
  const base = BASE_EFFECTS.find(b => b.name === (effect.baseEffect || effect.name)) || BASE_EFFECTS[0];
  const catClass = getCategoryClass(base.category);

  return `
    <div class="pb-base-effect-showcase">
      <div class="effect-showcase-top">
        <div class="effect-title-group">
          <span class="effect-tag-pill ${catClass}">${base.category || 'General'}</span>
          <h4>${base.name}</h4>
          <span class="effect-tag-pill cost-pill">${base.cost} PP/Rank</span>
        </div>
        <button id="pb-browse-showcase-btn" class="btn btn-secondary btn-sm" type="button">
          <i class="ri-compass-3-line"></i> Browse Library (${BASE_EFFECTS.length})
        </button>
      </div>

      <div class="effect-tags-row">
        <span class="effect-tag-pill" title="Standard Action required to activate"><i class="ri-flashlight-line"></i> ${effect.action || base.action} Action</span>
        <span class="effect-tag-pill" title="Range increment"><i class="ri-focus-2-line"></i> ${effect.range || base.range} Range</span>
        <span class="effect-tag-pill" title="Duration of manifestation"><i class="ri-time-line"></i> ${effect.duration || base.duration}</span>
        ${base.resistance ? `<span class="effect-tag-pill" title="Target resistance check defense"><i class="ri-shield-line"></i> vs ${effect.resistance || base.resistance}</span>` : ''}
      </div>

      <div class="effect-desc-box">
        <strong>M&M 3e Rule:</strong> ${escapeHtml(base.desc || 'Standard D20 Hero System power effect.')}
      </div>
    </div>
  `;
}

function renderEffectExplorerModal() {
  const filtered = getFilteredBaseEffects();
  const currentSelectedName = currentPower?.mainEffect?.baseEffect || 'Damage';

  return `
    <div class="effect-explorer-modal" id="pb-effect-explorer-backdrop">
      <div class="effect-explorer-dialog">
        <div class="explorer-header">
          <div class="explorer-title">
            <h3><i class="ri-compass-3-line"></i> Base Effect Library</h3>
            <p>Select a core D20 Hero System effect to build your power</p>
          </div>
          <button id="pb-close-explorer-btn" class="btn btn-ghost" title="Close Library (Esc)"><i class="ri-close-line"></i></button>
        </div>

        <div class="explorer-controls">
          <div class="explorer-search-bar">
            <i class="ri-search-line search-icon"></i>
            <input type="text" id="pb-explorer-search" placeholder="Search effects by name, action, range, or keyword..." value="${escapeHtml(effectSearchQuery)}">
            ${effectSearchQuery ? '<button id="pb-clear-explorer-search" class="clear-search-btn"><i class="ri-close-line"></i></button>' : ''}
          </div>

          <div class="explorer-category-pills">
            ${EFFECT_CATEGORIES.map(cat => `
              <button class="explorer-pill ${effectCategoryFilter === cat ? 'active' : ''}" data-eff-cat="${cat}" type="button">
                ${cat} (${cat === 'All' ? BASE_EFFECTS.length : BASE_EFFECTS.filter(e => e.category === cat).length})
              </button>
            `).join('')}
          </div>
        </div>

        <div class="explorer-grid">
          ${filtered.map(eff => {
            const isSelected = eff.name === currentSelectedName;
            const catClass = getCategoryClass(eff.category);
            return `
              <div class="explorer-card ${isSelected ? 'selected' : ''}" data-select-base="${eff.name}">
                <div class="explorer-card-header">
                  <span class="explorer-card-title">${eff.name}</span>
                  <div style="display:flex;gap:0.35rem;align-items:center;">
                    <span class="effect-tag-pill ${catClass}">${eff.category || 'General'}</span>
                    <span class="effect-tag-pill cost-pill">${eff.cost} PP/Rank</span>
                  </div>
                </div>

                <div class="effect-tags-row">
                  <span class="effect-tag-pill"><i class="ri-flashlight-line"></i> ${eff.action}</span>
                  <span class="effect-tag-pill"><i class="ri-focus-2-line"></i> ${eff.range}</span>
                  <span class="effect-tag-pill"><i class="ri-time-line"></i> ${eff.duration}</span>
                  ${eff.resistance ? `<span class="effect-tag-pill"><i class="ri-shield-line"></i> ${eff.resistance}</span>` : ''}
                </div>

                <p class="explorer-card-desc">${escapeHtml(eff.desc)}</p>

                <div class="explorer-card-footer">
                  <span style="font-size:0.74rem;color:var(--text-muted);">${isSelected ? '✓ Currently Selected' : 'Click to select'}</span>
                  <button class="btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}" type="button">
                    ${isSelected ? 'Selected' : 'Choose Effect'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
          ${filtered.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
              No effects match "${escapeHtml(effectSearchQuery || effectCategoryFilter)}".
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderAppliedModifierCard(mod, idx, type) {
  const isExtra = type === 'extra';
  const costLabel = mod.type === 'per_rank'
    ? `${mod.cost > 0 ? '+' : ''}${mod.cost} PP/Rank`
    : `${mod.cost > 0 ? '+' : ''}${mod.cost * (mod.ranks || 1)} PP flat`;

  const hasRanks = Boolean(mod.hasRanks || mod.type === 'flat_per_rank');
  const typeClass = mod.type === 'per_rank' ? 'type-per-rank' : (hasRanks ? 'type-ranked' : 'type-flat');
  const typeLabel = mod.type === 'per_rank' ? 'Per Rank' : (hasRanks ? 'Ranked Flat' : 'Flat');
  const typeIcon = mod.type === 'per_rank' ? '⟳' : (hasRanks ? '★' : '◆');
  const catClass = getModifierCategoryClass(mod.category || (isExtra ? 'Combat' : 'Limitations'));
  const costClass = isExtra
    ? (mod.cost > 0 ? 'cost-extra' : 'cost-neutral')
    : (mod.cost < 0 ? 'cost-flaw' : 'cost-neutral');

  // Configurable options / 'or' costs
  let configHtml = '';
  if (mod.options && mod.options.length > 0) {
    const selected = mod.config?.selectedOption || mod.options[0].id;
    configHtml = `
      <div class="mod-config-row">
        <div class="mod-config-header">
          <span class="mod-config-label"><i class="ri-sound-module-line"></i> Select Cost & Mode:</span>
        </div>
        <div class="mod-segmented-options">
          ${mod.options.map(opt => `
            <button class="mod-opt-btn ${selected === opt.id ? 'active' : ''}" 
                    data-mod-type="${type}" 
                    data-mod-idx="${idx}" 
                    data-mod-option="${opt.id}" 
                    title="${escapeHtml(opt.desc || '')}" 
                    type="button">
              ${escapeHtml(opt.label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else if (mod.configType === 'area_shape' && mod.shapes) {
    const selected = mod.config?.shape || mod.shapes[0];
    configHtml = `
      <div class="mod-config-row">
        <div class="mod-config-header">
          <span class="mod-config-label"><i class="ri-shape-line"></i> Area Shape:</span>
        </div>
        <select class="mod-config-select" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="shape">
          ${mod.shapes.map(s => `<option value="${escapeHtml(s)}" ${selected === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
        </select>
      </div>
    `;
  } else if (mod.configType === 'skill_select' && mod.skills) {
    const selected = mod.config?.skill || mod.skills[0];
    const dc = 10 + (mod.ranks || 1);
    configHtml = `
      <div class="mod-config-row">
        <div class="mod-config-header">
          <span class="mod-config-label"><i class="ri-file-list-3-line"></i> Required Check:</span>
        </div>
        <select class="mod-config-select" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="skill">
          ${mod.skills.map(s => `<option value="${escapeHtml(s)}" ${selected === s ? 'selected' : ''}>${escapeHtml(s)} (DC ${dc})</option>`).join('')}
        </select>
      </div>
    `;
  } else if (mod.configType === 'sense_select' && mod.senses) {
    const selected = mod.config?.sense || mod.senses[0];
    configHtml = `
      <div class="mod-config-row">
        <div class="mod-config-header">
          <span class="mod-config-label"><i class="ri-eye-line"></i> Target Sense:</span>
        </div>
        <select class="mod-config-select" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="sense">
          ${mod.senses.map(s => `<option value="${escapeHtml(s)}" ${selected === s ? 'selected' : ''}>${escapeHtml(s)} Sense</option>`).join('')}
        </select>
      </div>
    `;
  } else if (mod.configType === 'text_note') {
    const note = mod.config?.note || '';
    const placeholder = mod.name === 'Limited' ? 'e.g. Only vs Metal, Only at night...' : (mod.name === 'Quirk' ? 'Describe drawback...' : 'Describe capability...');
    configHtml = `
      <div class="mod-config-row">
        <div class="mod-config-header">
          <span class="mod-config-label"><i class="ri-edit-line"></i> Specification:</span>
        </div>
        <input type="text" class="mod-config-input" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="note" value="${escapeHtml(note)}" placeholder="${placeholder}">
      </div>
    `;
  }

  return `
    <div class="applied-mod-card ${isExtra ? 'extra' : 'flaw'}">
      <div class="mod-top-bar">
        <span class="mod-title">${escapeHtml(mod.name)}</span>
        <span class="mod-cost-tag ${costClass}">${costLabel}</span>
      </div>

      <div class="pal-card-tags" style="margin-bottom:0.15rem;">
        <span class="pal-tag ${catClass}">${escapeHtml(mod.category || (isExtra ? 'Combat' : 'Limitations'))}</span>
        <span class="pal-tag ${typeClass}">${typeIcon} ${typeLabel}</span>
      </div>

      ${mod.desc ? `<p class="applied-mod-desc">${escapeHtml(mod.desc)}</p>` : ''}

      ${configHtml}

      <div class="mod-controls-row">
        ${hasRanks ? `
          <div class="mini-stepper">
            <button class="mini-step-btn" data-mod-rank-dec="${idx}" data-mod-type="${type}" type="button">-</button>
            <span class="mini-step-val">${mod.ranks || 1} Rank${(mod.ranks || 1) > 1 ? 's' : ''}</span>
            <button class="mini-step-btn" data-mod-rank-inc="${idx}" data-mod-type="${type}" type="button">+</button>
          </div>
        ` : '<span></span>'}

        <button class="btn-remove-mod" data-remove-mod="${idx}" data-mod-type="${type}" title="Remove modifier" type="button">
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>
  `;
}

function renderPaletteCards() {
  const filtered = getFilteredModifiers();
  if (filtered.length === 0) {
    return `<div class="empty-palette-hint">No modifiers found matching "${escapeHtml(modifierSearchQuery || activeCategory)}".</div>`;
  }

  return filtered.map(m => {
    const isExtra = activeModifierTab === 'extras';
    const costLabel = m.costDisplay || (m.type === 'per_rank'
      ? `${m.cost > 0 ? '+' : ''}${m.cost} PP/Rank`
      : `${m.cost > 0 ? '+' : ''}${m.cost} PP flat`);

    const hasRanks = Boolean(m.hasRanks || m.type === 'flat_per_rank');
    const typeClass = m.type === 'per_rank' ? 'type-per-rank' : (hasRanks ? 'type-ranked' : 'type-flat');
    const typeLabel = m.type === 'per_rank' ? 'Per Rank' : (hasRanks ? 'Ranked Flat' : 'Flat');
    const typeIcon = m.type === 'per_rank' ? '⟳' : (hasRanks ? '★' : '◆');
    const catClass = getModifierCategoryClass(m.category);
    const costClass = isExtra
      ? (m.cost > 0 ? 'cost-extra' : 'cost-neutral')
      : (m.cost < 0 ? 'cost-flaw' : 'cost-neutral');

    return `
      <div class="palette-card">
        <div class="pal-card-main">
          <div class="pal-card-title-row">
            <span class="pal-name">${escapeHtml(m.name)}</span>
            <span class="pal-cost ${costClass}">${costLabel}</span>
          </div>

          <div class="pal-card-tags">
            <span class="pal-tag ${catClass}">${escapeHtml(m.category || 'General')}</span>
            <span class="pal-tag ${typeClass}">${typeIcon} ${typeLabel}</span>
            ${m.hasConfig ? '<span class="pal-tag cat-mod-action" style="color:#fbbf24;">⚙ Options</span>' : ''}
          </div>

          <p class="pal-desc">${escapeHtml(m.desc || '')}</p>
        </div>
        <button class="btn-add-modifier" data-add-mod="${escapeHtml(m.name)}" data-mod-tab="${activeModifierTab}" title="Add to main effect" type="button">
          <i class="ri-add-line"></i>
        </button>
      </div>
    `;
  }).join('');
}

function renderComplianceBanner(metrics, heroPL) {
  if (!metrics.isOffensive) {
    return `
      <div class="compliance-box info-box">
        <div class="comp-icon"><i class="ri-information-fill"></i></div>
        <div class="comp-content">
          <div class="comp-title">Utility / Personal Effect</div>
          <div class="comp-desc">Attack and damage caps do not apply to non-offensive effects.</div>
        </div>
      </div>
    `;
  }

  const { isCompliant, currentTotal, maxAllowed, exceededBy, warningMessage } = metrics.plCompliance;

  if (isCompliant) {
    return `
      <div class="compliance-box compliant-box">
        <div class="comp-icon"><i class="ri-checkbox-circle-fill"></i></div>
        <div class="comp-content">
          <div class="comp-title">✓ PL ${heroPL} Compliant</div>
          <div class="comp-desc">
            ${metrics.isArea || metrics.isPerception
              ? `Rank ${metrics.effectRank} ≤ PL ${heroPL} limit`
              : `Attack (+${metrics.attackBonus}) + Rank (${metrics.effectRank}) = ${currentTotal} ≤ ${maxAllowed}`
            }
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="compliance-box violated-box">
      <div class="comp-icon"><i class="ri-error-warning-fill"></i></div>
      <div class="comp-content">
        <div class="comp-title">⚠️ PL Cap Exceeded!</div>
        <div class="comp-desc">${escapeHtml(warningMessage)}</div>
        <div class="comp-action-hint">Lower effect ranks or reduce Accurate modifiers to meet Power Level limits.</div>
      </div>
    </div>
  `;
}

function attachStudioEventHandlers(modal) {
  // Save action
  const savePower = () => {
    if (!currentPower.mainEffect?.baseEffect) {
      showToast('Please select a Base Effect first!', 'warning');
      return;
    }
    if (!currentPower.name) {
      currentPower.name = currentPower.mainEffect.baseEffect;
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

  modal.querySelector('#pb-save-header-btn')?.addEventListener('click', savePower);
  modal.querySelector('#pb-save-inspector-btn')?.addEventListener('click', savePower);
  modal.querySelector('#pb-close-btn')?.addEventListener('click', closePowerBuilder);
  modal.querySelector('#pb-cancel-inspector-btn')?.addEventListener('click', closePowerBuilder);

  // Power Name
  modal.querySelector('#pb-power-name')?.addEventListener('input', (e) => {
    currentPower.name = e.target.value;
  });

  // Power Structure Type
  modal.querySelector('#pb-power-type')?.addEventListener('change', (e) => {
    currentPower.type = e.target.value;
    if (currentPower.type === 'device' && currentPower.deviceConfig?.type === 'none') {
      currentPower.deviceConfig.type = 'removable';
    }
    renderPowerStudio();
  });

  // Activation
  modal.querySelector('#pb-activation')?.addEventListener('change', (e) => {
    currentPower.activation = e.target.value;
    currentPower.activationCost = e.target.value === 'move' ? -1 : e.target.value === 'standard' ? -2 : 0;
    renderPowerStudio();
  });

  // Descriptors
  const descInput = modal.querySelector('#pb-desc-input');
  const addDesc = () => {
    if (!descInput) return;
    const val = descInput.value.trim();
    if (val && !currentPower.descriptors.includes(val)) {
      currentPower.descriptors.push(val);
      descInput.value = '';
      renderPowerStudio();
    }
  };
  modal.querySelector('#pb-add-desc-btn')?.addEventListener('click', addDesc);
  descInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDesc();
    }
  });

  modal.querySelectorAll('[data-remove-desc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeDesc, 10);
      currentPower.descriptors.splice(idx, 1);
      renderPowerStudio();
    });
  });

  // Device settings
  modal.querySelector('#pb-device-type')?.addEventListener('change', (e) => {
    if (!currentPower.deviceConfig) currentPower.deviceConfig = { type: 'none', descriptor: '', toughness: 10 };
    currentPower.deviceConfig.type = e.target.value;
    renderPowerStudio();
  });
  modal.querySelector('#pb-device-desc')?.addEventListener('input', (e) => {
    if (!currentPower.deviceConfig) currentPower.deviceConfig = { type: 'none', descriptor: '', toughness: 10 };
    currentPower.deviceConfig.descriptor = e.target.value;
  });
  modal.querySelector('#pb-device-toughness')?.addEventListener('change', (e) => {
    if (!currentPower.deviceConfig) currentPower.deviceConfig = { type: 'none', descriptor: '', toughness: 10 };
    currentPower.deviceConfig.toughness = Math.max(1, parseInt(e.target.value, 10) || 10);
  });

  // Base Effect select dropdown
  modal.querySelector('#pb-base-effect')?.addEventListener('change', (e) => {
    const chosen = BASE_EFFECTS.find(b => b.name === e.target.value);
    if (chosen) {
      currentPower.mainEffect.baseEffect = chosen.name;
      currentPower.mainEffect.name = chosen.name;
      currentPower.mainEffect.baseCost = chosen.cost;
      currentPower.mainEffect.range = chosen.range;
      currentPower.mainEffect.action = chosen.action;
      currentPower.mainEffect.duration = chosen.duration;
      currentPower.mainEffect.resistance = chosen.resistance || (chosen.name === 'Affliction' ? 'Fortitude' : 'Toughness');
      if (!currentPower.name) {
        currentPower.name = chosen.name;
      }
    }
    renderPowerStudio();
  });

  // Browse Library buttons (both from header showcase and quick select)
  modal.querySelector('#pb-browse-effects-btn')?.addEventListener('click', () => {
    isEffectExplorerOpen = true;
    renderPowerStudio();
  });
  modal.querySelector('#pb-browse-showcase-btn')?.addEventListener('click', () => {
    isEffectExplorerOpen = true;
    renderPowerStudio();
  });

  // Ranks stepper
  modal.querySelector('#pb-rank-dec')?.addEventListener('click', () => {
    if (currentPower.mainEffect.ranks > 1) {
      currentPower.mainEffect.ranks--;
      renderPowerStudio();
    }
  });
  modal.querySelector('#pb-rank-inc')?.addEventListener('click', () => {
    currentPower.mainEffect.ranks++;
    renderPowerStudio();
  });
  modal.querySelector('#pb-ranks')?.addEventListener('change', (e) => {
    currentPower.mainEffect.ranks = Math.max(1, parseInt(e.target.value, 10) || 1);
    renderPowerStudio();
  });

  // Overrides (Range, Action, Duration, Resistance)
  modal.querySelector('#pb-effect-range')?.addEventListener('change', (e) => {
    currentPower.mainEffect.range = e.target.value;
    renderPowerStudio();
  });
  modal.querySelector('#pb-effect-action')?.addEventListener('change', (e) => {
    currentPower.mainEffect.action = e.target.value;
    renderPowerStudio();
  });
  modal.querySelector('#pb-effect-duration')?.addEventListener('change', (e) => {
    currentPower.mainEffect.duration = e.target.value;
    renderPowerStudio();
  });
  modal.querySelector('#pb-effect-resistance')?.addEventListener('change', (e) => {
    currentPower.mainEffect.resistance = e.target.value;
    renderPowerStudio();
  });

  // Applied modifiers ranks & removal
  modal.querySelectorAll('[data-mod-rank-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.modRankDec, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const list = isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
      if (list[idx] && (list[idx].ranks || 1) > 1) {
        list[idx].ranks--;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-mod-rank-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.modRankInc, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const list = isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
      if (list[idx]) {
        list[idx].ranks = (list[idx].ranks || 1) + 1;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-remove-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeMod, 10);
      const isExtra = btn.dataset.modType === 'extra';
      if (isExtra) {
        currentPower.mainEffect.extras.splice(idx, 1);
      } else {
        currentPower.mainEffect.flaws.splice(idx, 1);
      }
      renderPowerStudio();
    });
  });

  // Modifier 'or' cost option buttons
  modal.querySelectorAll('[data-mod-option]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.modIdx, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const optionId = btn.dataset.modOption;
      const list = isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
      if (list[idx]) {
        list[idx].config = list[idx].config || {};
        list[idx].config.selectedOption = optionId;
        normalizeModifier(list[idx]);
        renderPowerStudio();
      }
    });
  });

  // Modifier dropdown selects (e.g. Area shape, skill, sense)
  modal.querySelectorAll('.mod-config-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt(sel.dataset.modIdx, 10);
      const isExtra = sel.dataset.modType === 'extra';
      const field = sel.dataset.modConfigField;
      const list = isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
      if (list[idx]) {
        list[idx].config = list[idx].config || {};
        list[idx].config[field] = e.target.value;
        renderPowerStudio();
      }
    });
  });

  // Modifier text note input
  modal.querySelectorAll('.mod-config-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.dataset.modIdx, 10);
      const isExtra = inp.dataset.modType === 'extra';
      const field = inp.dataset.modConfigField;
      const list = isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
      if (list[idx]) {
        list[idx].config = list[idx].config || {};
        list[idx].config[field] = e.target.value;
      }
    });
    inp.addEventListener('change', () => {
      renderPowerStudio();
    });
  });

  // Palette Search & Tabs
  const searchInput = modal.querySelector('#pb-mod-search');
  searchInput?.addEventListener('input', (e) => {
    modifierSearchQuery = e.target.value;
    updatePaletteGrid(modal);
  });

  modal.querySelector('#pb-clear-search')?.addEventListener('click', () => {
    modifierSearchQuery = '';
    if (searchInput) searchInput.value = '';
    updatePaletteGrid(modal);
  });

  modal.querySelectorAll('.palette-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModifierTab = btn.dataset.modType;
      modal.querySelectorAll('.palette-type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.modType === activeModifierTab);
      });
      updatePaletteGrid(modal);
    });
  });

  modal.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.modCat;
      modal.querySelectorAll('.category-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.modCat === activeCategory);
      });
      updatePaletteGrid(modal);
    });
  });

  // Attach Add Modifier buttons inside palette
  bindPaletteAddButtons(modal);

  // Attach Explorer event handlers if open
  if (isEffectExplorerOpen) {
    attachExplorerHandlers(modal);
  }

  // Linked Effects handlers
  modal.querySelector('#pb-add-linked-btn')?.addEventListener('click', () => {
    currentPower.linkedEffects.push({
      baseEffect: 'Affliction',
      name: 'Affliction',
      baseCost: 1,
      ranks: currentPower.mainEffect.ranks || 1,
      range: 'Close',
      action: 'Standard',
      duration: 'Instant',
      resistance: 'Fortitude',
      extras: [],
      flaws: []
    });
    renderPowerStudio();
  });

  modal.querySelectorAll('[data-remove-linked]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeLinked, 10);
      currentPower.linkedEffects.splice(idx, 1);
      renderPowerStudio();
    });
  });

  modal.querySelectorAll('.pb-linked-base-sel').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt(sel.dataset.linkedIdx, 10);
      const chosen = BASE_EFFECTS.find(b => b.name === e.target.value);
      if (chosen && currentPower.linkedEffects[idx]) {
        currentPower.linkedEffects[idx].baseEffect = chosen.name;
        currentPower.linkedEffects[idx].name = chosen.name;
        currentPower.linkedEffects[idx].baseCost = chosen.cost;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-linked-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.linkedDec, 10);
      if (currentPower.linkedEffects[idx] && currentPower.linkedEffects[idx].ranks > 1) {
        currentPower.linkedEffects[idx].ranks--;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-linked-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.linkedInc, 10);
      if (currentPower.linkedEffects[idx]) {
        currentPower.linkedEffects[idx].ranks++;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-linked-rank]').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(inp.dataset.linkedRank, 10);
      if (currentPower.linkedEffects[idx]) {
        currentPower.linkedEffects[idx].ranks = Math.max(1, parseInt(e.target.value, 10) || 1);
        renderPowerStudio();
      }
    });
  });

  // Array handlers
  modal.querySelector('#pb-add-alt-slot-btn')?.addEventListener('click', () => {
    isAddingAltSlot = true;
    renderPowerStudio();
  });

  modal.querySelector('#pb-cancel-add-slot')?.addEventListener('click', () => {
    isAddingAltSlot = false;
    renderPowerStudio();
  });

  modal.querySelector('#pb-confirm-add-slot')?.addEventListener('click', () => {
    const slotName = modal.querySelector('#pb-new-slot-name')?.value.trim() || 'Alternate Slot';
    const baseName = modal.querySelector('#pb-new-slot-base')?.value || 'Damage';
    const ranks = Math.max(1, parseInt(modal.querySelector('#pb-new-slot-ranks')?.value, 10) || 1);
    const isDynamic = Boolean(modal.querySelector('#pb-new-slot-dynamic')?.checked);

    const baseRef = BASE_EFFECTS.find(b => b.name === baseName);
    currentPower.alternateEffects.push({
      id: 'alt_' + Date.now(),
      name: slotName,
      isDynamic,
      effect: {
        baseEffect: baseName,
        name: slotName,
        ranks,
        baseCost: baseRef ? baseRef.cost : 1,
        range: baseRef ? baseRef.range : 'Close',
        action: baseRef ? baseRef.action : 'Standard',
        duration: baseRef ? baseRef.duration : 'Instant',
        resistance: baseRef ? (baseRef.resistance || 'Toughness') : 'Toughness',
        extras: [],
        flaws: []
      }
    });

    isAddingAltSlot = false;
    renderPowerStudio();
  });

  modal.querySelectorAll('[data-remove-alt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeAlt, 10);
      currentPower.alternateEffects.splice(idx, 1);
      renderPowerStudio();
    });
  });

  // Notes
  modal.querySelector('#pb-notes')?.addEventListener('input', (e) => {
    currentPower.notes = e.target.value;
  });
}

function attachExplorerHandlers(modal) {
  const explorerContainer = modal.querySelector('#pb-explorer-container');
  if (!explorerContainer || !isEffectExplorerOpen) return;

  // Close Explorer button
  explorerContainer.querySelector('#pb-close-explorer-btn')?.addEventListener('click', () => {
    isEffectExplorerOpen = false;
    renderPowerStudio();
  });

  // Backdrop click to close
  explorerContainer.querySelector('#pb-effect-explorer-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'pb-effect-explorer-backdrop') {
      isEffectExplorerOpen = false;
      renderPowerStudio();
    }
  });

  // Explorer Search
  const searchInput = explorerContainer.querySelector('#pb-explorer-search');
  searchInput?.addEventListener('input', (e) => {
    effectSearchQuery = e.target.value;
    updateExplorerGrid(modal);
  });

  explorerContainer.querySelector('#pb-clear-explorer-search')?.addEventListener('click', () => {
    effectSearchQuery = '';
    if (searchInput) searchInput.value = '';
    updateExplorerGrid(modal);
  });

  // Category filter pills
  explorerContainer.querySelectorAll('[data-eff-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      effectCategoryFilter = btn.dataset.effCat;
      explorerContainer.querySelectorAll('[data-eff-cat]').forEach(b => {
        b.classList.toggle('active', b.dataset.effCat === effectCategoryFilter);
      });
      updateExplorerGrid(modal);
    });
  });

  // Bind effect selection cards
  bindExplorerSelectButtons(modal);
}

function updateExplorerGrid(modal) {
  const grid = modal.querySelector('.explorer-grid');
  if (!grid) return;
  const filtered = getFilteredBaseEffects();
  const currentSelectedName = currentPower?.mainEffect?.baseEffect || 'Damage';

  grid.innerHTML = filtered.map(eff => {
    const isSelected = eff.name === currentSelectedName;
    const catClass = getCategoryClass(eff.category);
    return `
      <div class="explorer-card ${isSelected ? 'selected' : ''}" data-select-base="${eff.name}">
        <div class="explorer-card-header">
          <span class="explorer-card-title">${eff.name}</span>
          <div style="display:flex;gap:0.35rem;align-items:center;">
            <span class="effect-tag-pill ${catClass}">${eff.category || 'General'}</span>
            <span class="effect-tag-pill cost-pill">${eff.cost} PP/Rank</span>
          </div>
        </div>

        <div class="effect-tags-row">
          <span class="effect-tag-pill"><i class="ri-flashlight-line"></i> ${eff.action}</span>
          <span class="effect-tag-pill"><i class="ri-focus-2-line"></i> ${eff.range}</span>
          <span class="effect-tag-pill"><i class="ri-time-line"></i> ${eff.duration}</span>
          ${eff.resistance ? `<span class="effect-tag-pill"><i class="ri-shield-line"></i> ${eff.resistance}</span>` : ''}
        </div>

        <p class="explorer-card-desc">${escapeHtml(eff.desc)}</p>

        <div class="explorer-card-footer">
          <span style="font-size:0.74rem;color:var(--text-muted);">${isSelected ? '✓ Currently Selected' : 'Click to select'}</span>
          <button class="btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}" type="button">
            ${isSelected ? 'Selected' : 'Choose Effect'}
          </button>
        </div>
      </div>
    `;
  }).join('') + (filtered.length === 0 ? `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
      No effects match "${escapeHtml(effectSearchQuery || effectCategoryFilter)}".
    </div>
  ` : '');

  bindExplorerSelectButtons(modal);
}

function bindExplorerSelectButtons(modal) {
  modal.querySelectorAll('[data-select-base]').forEach(card => {
    card.addEventListener('click', () => {
      const effName = card.dataset.selectBase;
      const chosen = BASE_EFFECTS.find(b => b.name === effName);
      if (chosen) {
        currentPower.mainEffect.baseEffect = chosen.name;
        currentPower.mainEffect.name = chosen.name;
        currentPower.mainEffect.baseCost = chosen.cost;
        currentPower.mainEffect.range = chosen.range;
        currentPower.mainEffect.action = chosen.action;
        currentPower.mainEffect.duration = chosen.duration;
        currentPower.mainEffect.resistance = chosen.resistance || (chosen.name === 'Affliction' ? 'Fortitude' : 'Toughness');
        if (!currentPower.name) {
          currentPower.name = chosen.name;
        }
      }
      isEffectExplorerOpen = false;
      renderPowerStudio();
    });
  });
}

function updatePaletteGrid(modal) {
  const grid = modal.querySelector('#pb-palette-grid');
  if (!grid) return;
  grid.innerHTML = renderPaletteCards();
  bindPaletteAddButtons(modal);
}

function bindPaletteAddButtons(modal) {
  modal.querySelectorAll('[data-add-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modName = btn.dataset.addMod;
      const isExtra = btn.dataset.modTab === 'extras';
      const ref = isExtra ? EXTRAS.find(e => e.name === modName) : FLAWS.find(f => f.name === modName);
      if (!ref) return;

      const targetList = isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
      const existing = targetList.find(m => m.name === modName);

      if (existing && (ref.hasRanks || ref.type === 'flat_per_rank')) {
        existing.ranks = (existing.ranks || 1) + 1;
      } else if (!existing) {
        targetList.push(normalizeModifier({
          name: ref.name,
          cost: ref.cost,
          type: ref.type,
          desc: ref.desc,
          category: ref.category,
          ranks: 1
        }));
      } else {
        showToast(`${modName} is already applied to this effect.`, 'info');
        return;
      }

      renderPowerStudio();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
