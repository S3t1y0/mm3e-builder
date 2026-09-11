// js/components/powerBuilder.js
/**
 * Mutants & Masterminds 3e: Full-Screen Power Studio Component
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
  CONFIGURABLE_EFFECTS,
  EXTRAS,
  FLAWS,
  MODIFIER_CATEGORIES,
  calculatePowerTotalCost,
  calculatePowerDetailedBreakdown,
  calculatePowerCombatMetrics,
  validateArraySlot,
  validateLinkedEffect,
  syncLinkedEffectWithMain,
  createAlternateSlotFromEffect,
  COMMON_LINKED_COMBOS,
  calculateEffectCost,
  normalizePower,
  createEmptyPower,
  createEmptyEffect,
  normalizeModifier,
  normalizeEffect
} from '../rules/powers.js';
import { showToast } from './notifications.js';

let currentPower = null;
let editingPowerId = null;
let activeModifierTab = 'extras'; // 'extras' or 'flaws'
let activeCategory = 'All';
let modifierSearchQuery = '';
let isAddingAltSlot = false;
let activeSlotId = null; // ID of currently active alternate effect in this power session
let expandedLinkedIdx = null; // Index of linked effect whose modifiers drawer is open
let expandedSlotIdx = null; // Index of alternate slot whose modifiers drawer is open

// Base Effect Explorer state
let isEffectExplorerOpen = false;
let effectCategoryFilter = 'All';
let effectSearchQuery = '';
let isBaseLibraryExpanded = true;
let expandedLinkedLibIdx = null; // Index of linked effect whose library drawer is open
let isNewSlotLibExpanded = false; // Whether library drawer for new slot in array is open
let newSlotBaseName = 'Damage'; // Selected base effect for new slot
let newSlotTempEffect = createEmptyEffect('Damage');
let expandedSlotLibIdx = null; // Index of alternate slot whose library drawer is open
let optLibSearchState = {}; // Keyed by target:type for search queries
let optLibCatState = {}; // Keyed by target:type for active category filters

export function openPowerBuilder(powerToEdit = null) {
  const modal = document.getElementById('power-builder-modal');
  if (!modal) return;

  if (powerToEdit) {
    editingPowerId = powerToEdit.id;
    currentPower = normalizePower(JSON.parse(JSON.stringify(powerToEdit)));
    isBaseLibraryExpanded = false;
  } else {
    editingPowerId = null;
    currentPower = createEmptyPower();
    currentPower.mainEffect = createEmptyEffect('Damage');
    currentPower.baseEffect = 'Damage';
    isBaseLibraryExpanded = true;
  }

  activeModifierTab = 'extras';
  activeCategory = 'All';
  modifierSearchQuery = '';
  isAddingAltSlot = false;
  activeSlotId = currentPower.activeSlotId || currentPower.alternateEffects[0]?.id || 'main';
  expandedLinkedIdx = null;
  expandedSlotIdx = null;
  expandedLinkedLibIdx = null;
  isNewSlotLibExpanded = false;
  newSlotBaseName = 'Damage';
  expandedSlotLibIdx = null;
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
          <label for="pb-activation">ACTIVATION</label>
          <select id="pb-activation">
            <option value="none" ${currentPower.activation === 'none' ? 'selected' : ''}>None (Standard/Free)</option>
            <option value="move" ${currentPower.activation === 'move' ? 'selected' : ''}>Move Action (-1 PP)</option>
            <option value="standard" ${currentPower.activation === 'standard' ? 'selected' : ''}>Standard Action (-2 PP)</option>
          </select>
        </div>
      </div>

      <!-- Structure Type Visual Card Selector -->
      <div class="pb-structure-selector-wrap">
        <div class="pb-structure-label">
          <span><i class="ri-node-tree"></i> STRUCTURE TYPE (M&M 3e ARCHITECTURE)</span>
          <span style="font-size:0.7rem;font-weight:600;color:var(--text-secondary);">Select how this power functions</span>
        </div>

        <div class="pb-structure-grid">
          <!-- Card 1: Standard Power -->
          <div class="pb-struct-card ${currentPower.type === 'standard' ? 'active' : ''}" data-set-struct="standard">
            <div class="struct-card-header">
              <div class="struct-icon-title">
                <div class="struct-icon icon-standard"><i class="ri-flashlight-line"></i></div>
                <span class="struct-title">Standard Power</span>
              </div>
              <div class="struct-radio-indicator"></div>
            </div>
            <p class="struct-desc">Single standalone effect active independently (e.g., Flight, Blast, Super-Strength).</p>
            <div class="struct-rule-tag">
              <i class="ri-information-line"></i> Full point cost per effect
            </div>
          </div>

          <!-- Card 2: Linked / Compound Power -->
          <div class="pb-struct-card ${currentPower.type === 'compound' ? 'active' : ''}" data-set-struct="compound">
            <div class="struct-card-header">
              <div class="struct-icon-title">
                <div class="struct-icon icon-compound"><i class="ri-links-line"></i></div>
                <span class="struct-title">Linked / Compound</span>
              </div>
              <div class="struct-radio-indicator"></div>
            </div>
            <p class="struct-desc">Two or more effects triggering simultaneously with the exact same action (e.g., Poison Blade).</p>
            <div class="struct-rule-tag">
              <i class="ri-checkbox-circle-line"></i> Must share same Range & Action
            </div>
          </div>

          <!-- Card 3: Array (Alternate Effects) -->
          <div class="pb-struct-card ${currentPower.type === 'array' ? 'active' : ''}" data-set-struct="array">
            <div class="struct-card-header">
              <div class="struct-icon-title">
                <div class="struct-icon icon-array"><i class="ri-stack-line"></i></div>
                <span class="struct-title">Array (Alternate)</span>
              </div>
              <div class="struct-radio-indicator"></div>
            </div>
            <p class="struct-desc">Suite of versatile powers sharing a single budget pool (e.g., Utility Belt, Spellbook).</p>
            <div class="struct-rule-tag">
              <i class="ri-refresh-line"></i> Switched via Free Action (1 active)
            </div>
          </div>
        </div>

        <!-- Decoupled Delivery / Item Form Selector -->
        <div class="pb-delivery-section">
          <div class="form-group" style="margin-bottom:0.4rem;">
            <label><i class="ri-shield-line"></i> ITEM & DELIVERY FORM (REMOVABLE FLAW)</label>
          </div>
          <div class="pb-delivery-pills">
            <button type="button" class="pb-delivery-pill ${(!currentPower.deviceConfig || currentPower.deviceConfig.type === 'none') ? 'active' : ''}" data-delivery="none">
              <i class="ri-dna-line"></i> Inherent (Natural / Innate)
            </button>
            <button type="button" class="pb-delivery-pill pill-removable ${currentPower.deviceConfig?.type === 'removable' ? 'active' : ''}" data-delivery="removable">
              <i class="ri-shield-keyhole-line"></i> Removable (-1 PP / 5 PP)
            </button>
            <button type="button" class="pb-delivery-pill pill-easily ${currentPower.deviceConfig?.type === 'easily_removable' ? 'active' : ''}" data-delivery="easily_removable">
              <i class="ri-sword-line"></i> Easily Removable (-2 PP / 5 PP)
            </button>
          </div>
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

    <!-- 2. Device / Removable Settings (Visible if Removable configured) -->
    ${(currentPower.deviceConfig?.type && currentPower.deviceConfig.type !== 'none') ? `
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
          <div class="main-slot-name-edit-box">
            <input type="text"
                   id="pb-main-slot-name-input"
                   class="pb-slot-name-input"
                   value="${escapeHtml(currentPower.mainEffect.name || currentPower.mainEffect.baseEffect || 'Main Effect')}"
                   placeholder="Main Slot Name (e.g. Solar Blast)"
                   title="Click to rename main effect slot" />
            <i class="ri-edit-line slot-name-edit-icon" title="Editable slot name"></i>
          </div>
        </div>
        <div class="card-header-badge">
          <span class="effect-cost-badge">${breakdown.mainCost} PP</span>
        </div>
      </div>

      <!-- Base Effect Active Showcase with Full Tags & Rules Explanation -->
      ${renderBaseEffectShowcase(currentPower.mainEffect)}

      <!-- Direct Embedded Base Effect Library in Power Studio -->
      ${renderEmbeddedBaseEffectLibrary()}

      <!-- Main Effect Power Ranks Bar -->
      <div class="main-effect-ranks-bar">
        <div class="ranks-control-group">
          <label><i class="ri-bar-chart-fill"></i> POWER RANKS</label>
          <div class="stepper">
            <button class="step-btn" id="pb-rank-dec" type="button" title="Decrease rank">-</button>
            <input type="number" class="step-val" id="pb-ranks" value="${currentPower.mainEffect.ranks}" min="1" max="30">
            <button class="step-btn" id="pb-rank-inc" type="button" title="Increase rank">+</button>
          </div>
        </div>
        <div class="ranks-calculation-badge">
          <span class="calc-label">Base Cost:</span>
          <span class="calc-value">${(() => {
            const mc = calculateEffectCost(currentPower.mainEffect);
            return `<strong>${mc.basePointCost} PP</strong> (${mc.netPerRank >= 1 ? `${mc.netPerRank} PP/Rank` : `1 PP / ${mc.divisor} Ranks`} × ${currentPower.mainEffect.ranks} Ranks)`;
          })()}</span>
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
            ${currentPower.mainEffect.extras.map((ex, idx) => renderAppliedModifierCard(ex, idx, 'extra', 'main')).join('')}
            ${currentPower.mainEffect.flaws.map((fl, idx) => renderAppliedModifierCard(fl, idx, 'flaw', 'main')).join('')}
          </div>
        `}
      </div>

      <!-- Modifiers Palette (Embedded for instant access) -->
      ${renderModifierPaletteForTarget('main')}
    </div>

    <!-- 4. Linked Effects Section -->
    ${(currentPower.type === 'compound' || currentPower.linkedEffects.length > 0) ? `
      <div class="pb-card pb-linked-card">
        <div class="linked-section-header">
          <div class="section-title">
            <i class="ri-links-line"></i> LINKED EFFECTS (${currentPower.linkedEffects.length})
          </div>
          <div class="linked-header-actions">
            <select id="pb-quick-combo-sel" class="linked-combo-select" title="Add a popular pre-configured combo">
              <option value="">⚡ Quick Combo Presets...</option>
              ${COMMON_LINKED_COMBOS.map((c, i) => `
                <option value="${i}">${c.name}</option>
              `).join('')}
            </select>
            <button id="pb-add-linked-btn" class="btn btn-secondary btn-sm" type="button">
              <i class="ri-add-line"></i> Add Linked Effect
            </button>
          </div>
        </div>

        <div class="linked-effects-chain">
          ${currentPower.linkedEffects.map((linked, lIdx) => {
            const linkedCost = calculateEffectCost(linked, 0).totalCost;
            const valLinked = validateLinkedEffect(currentPower.mainEffect, linked);
            const isExpanded = expandedLinkedIdx === lIdx;
            const totalMods = (linked.extras ? linked.extras.length : 0) + (linked.flaws ? linked.flaws.length : 0);
            const linkedBase = BASE_EFFECTS.find(b => b.name === (linked.baseEffect || linked.name)) || BASE_EFFECTS[0];
            const isLinkedLibOpen = expandedLinkedLibIdx === lIdx;

            return `
              <div class="linked-item-card">
                <div class="linked-item-header">
                  <div class="linked-item-title-group">
                    <span class="linked-node-badge"><i class="ri-links-line"></i> LINKED #${lIdx + 1}</span>
                    <strong style="font-size:0.9rem;color:var(--text-primary);">${escapeHtml(linked.name || linked.baseEffect)}</strong>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span class="linked-cost-val">+${linkedCost} PP</span>
                    <button class="btn-delete-linked" data-remove-linked="${lIdx}" title="Delete linked effect">
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>

                <!-- Range & Action Synchronization Status -->
                <div class="linked-sync-status-bar ${valLinked.isValid ? 'synced' : 'mismatched'}">
                  <span>
                    <i class="${valLinked.isValid ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i>
                    ${valLinked.isValid
                      ? `Range (${linked.range}) & Action (${linked.action}) match Main Effect`
                      : valLinked.warnings.join(' • ')
                    }
                  </span>
                  ${!valLinked.isValid ? `
                    <button class="btn-auto-sync" data-auto-sync-linked="${lIdx}" type="button" title="Synchronize range and action with Main Effect">
                      <i class="ri-flashlight-line"></i> Auto-Sync
                    </button>
                  ` : ''}
                </div>

                <!-- Linked Effect Base Effect Showcase & Library Trigger -->
                <div class="linked-effect-showcase-box">
                  <div class="linked-effect-header-bar">
                    <div class="linked-effect-info-wrap">
                      <span class="effect-tag-pill ${getCategoryClass(linkedBase.category)}">${linkedBase.category || 'General'}</span>
                      <strong class="linked-effect-name">${linked.baseEffect}</strong>
                      <span class="effect-tag-pill cost-pill">${linkedBase.cost} PP/Rank</span>
                    </div>
                    <button class="btn btn-secondary btn-xs" data-toggle-linked-lib="${lIdx}" type="button" title="Choose base effect from library">
                      <i class="ri-compass-3-line"></i> ${isLinkedLibOpen ? 'Hide Library' : 'Change Effect (Library)'}
                    </button>
                  </div>

                  <div class="effect-tags-row" style="margin: 0.35rem 0;">
                    <span class="effect-tag-pill" title="Action required to activate"><i class="ri-flashlight-line"></i> ${linked.action || linkedBase.action} Action</span>
                    <span class="effect-tag-pill" title="Range increment"><i class="ri-focus-2-line"></i> ${linked.range || linkedBase.range} Range</span>
                    <span class="effect-tag-pill" title="Duration of manifestation"><i class="ri-time-line"></i> ${linked.duration || linkedBase.duration}</span>
                    ${linkedBase.resistance ? `<span class="effect-tag-pill" title="Target resistance check defense"><i class="ri-shield-line"></i> vs ${linked.resistance || linkedBase.resistance}</span>` : ''}
                  </div>

                  <!-- Description of the selected power effect -->
                  <div class="effect-desc-box">
                    <strong>M&M 3e Rule:</strong> ${escapeHtml(linkedBase.desc || 'Standard D20 Hero System power effect.')}
                  </div>

                  <!-- Configurable Sub-options for Linked Effect -->
                  ${renderEffectConfiguration(linked, `linked:${lIdx}`)}

                  <!-- Embedded Library for Linked Effect if open -->
                  ${isLinkedLibOpen ? renderEmbeddedLibraryForTarget('linked', lIdx, linked.baseEffect) : ''}

                  <!-- Linked Effect Ranks Bar -->
                  <div class="linked-ranks-row">
                    <div class="ranks-control-group">
                      <label><i class="ri-bar-chart-fill"></i> RANKS</label>
                      <div class="stepper">
                        <button class="step-btn" data-linked-dec="${lIdx}" type="button">-</button>
                        <input type="number" class="step-val" data-linked-rank="${lIdx}" value="${linked.ranks}" min="1" max="30">
                        <button class="step-btn" data-linked-inc="${lIdx}" type="button">+</button>
                      </div>
                    </div>
                    <div class="ranks-calculation-badge">
                      <span class="calc-label">Cost:</span>
                      <span class="calc-value">${linked.ranks} Ranks × ${linkedBase.cost} PP/Rank = <strong>${(linked.ranks * linkedBase.cost)} PP</strong></span>
                    </div>
                  </div>
                </div>

                <!-- Modifiers Accordion for Linked Sub-effect -->
                <div class="linked-modifiers-toggle">
                  <span style="font-size:0.75rem;font-weight:700;color:var(--text-secondary);">
                    <i class="ri-settings-3-line"></i> Extras & Flaws (${totalMods})
                  </span>
                  <button class="btn btn-ghost btn-sm" data-toggle-linked-mod="${lIdx}" type="button" style="font-size:0.75rem;">
                    ${isExpanded ? '<i class="ri-arrow-up-s-line"></i> Hide Modifiers' : '<i class="ri-arrow-down-s-line"></i> Manage Modifiers'}
                  </button>
                </div>

                ${isExpanded ? `
                  <div class="slot-modifiers-drawer">
                    <div class="slot-modifiers-drawer-header">
                      <span class="drawer-title"><i class="ri-settings-3-line"></i> Applied Extras & Flaws: <strong>${escapeHtml(linked.name || linked.baseEffect)}</strong> (${totalMods})</span>
                    </div>

                    ${(linked.extras.length === 0 && linked.flaws.length === 0) ? `
                      <div class="empty-applied-hint">No extras or flaws attached to this linked effect. Select modifiers from the library below to customize this effect.</div>
                    ` : `
                      <div class="applied-mods-grid sub-applied-mods-grid">
                        ${(linked.extras || []).map((ex, exIdx) => renderAppliedModifierCard(ex, exIdx, 'extra', `linked:${lIdx}`)).join('')}
                        ${(linked.flaws || []).map((fl, flIdx) => renderAppliedModifierCard(fl, flIdx, 'flaw', `linked:${lIdx}`)).join('')}
                      </div>
                    `}

                    <!-- Visual Modifier Library Palette for Linked Effect -->
                    ${renderModifierPaletteForTarget(`linked:${lIdx}`)}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
          ${currentPower.linkedEffects.length === 0 ? `
            <div class="empty-section-hint">No linked effects added yet. Click "+ Add Linked Effect" or choose a Quick Combo above.</div>
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
        </div>

        <!-- Array Suite Name Config Row -->
        <div class="array-name-row">
          <label for="pb-array-name-input"><i class="ri-edit-2-line"></i> ARRAY NAME / POWER SUITE TITLE</label>
          <input type="text"
                 id="pb-array-name-input"
                 class="form-control"
                 value="${escapeHtml(currentPower.name || '')}"
                 placeholder="e.g., Elemental Arsenal, Utility Belt, Martial Arts Matrix" />
          <span class="field-hint">Rename the entire array suite. This syncs with the power name and displays at the top of the array card on the character sheet.</span>
        </div>

        <!-- M&M 3e Alternate Effects Rule Callout Banner -->
        <div class="array-rules-banner">
          <div class="rules-banner-icon"><i class="ri-book-open-line"></i></div>
          <div class="rules-banner-text">
            <div class="rules-banner-title"><i class="ri-shield-flash-line"></i> M&M 3e Alternate Effects Rule</div>
            <div class="rules-banner-desc">
              <strong>Alternate Effects are switched as a free action once per turn; only one is active at a time.</strong>
              Your Main Effect sets the maximum budget capacity (<strong>${breakdown.arrayCapacity} PP</strong>).
              Standard slots (<strong>+1 PP flat</strong>) switch 100% of the power, while Dynamic slots (<strong>+2 PP flat</strong>) allow dividing points between active powers simultaneously.
            </div>
          </div>
        </div>

        <!-- Array Budget Dashboard & Meter -->
        ${(() => {
          const highestSlotCost = currentPower.alternateEffects.reduce((max, s) => {
            const c = calculateEffectCost(s.effect).totalCost;
            return Math.max(max, c);
          }, 0);
          const budgetCapacity = breakdown.arrayCapacity || 1;
          const pctFill = Math.min(100, Math.round((highestSlotCost / budgetCapacity) * 100));
          const isOverflow = highestSlotCost > budgetCapacity;

          return `
            <div class="array-budget-dashboard">
              <div class="budget-dashboard-header">
                <div class="budget-primary-stat">
                  Primary Budget Pool: <strong>${budgetCapacity} PP</strong> (from Main Effect)
                </div>
                <div class="budget-headroom-badge ${isOverflow ? 'warn' : 'ok'}">
                  ${isOverflow
                    ? `<i class="ri-error-warning-fill"></i> Overflow: +${highestSlotCost - budgetCapacity} PP (Exceeds Budget!)`
                    : `<i class="ri-checkbox-circle-fill"></i> Max Slot: ${highestSlotCost} PP (${budgetCapacity - highestSlotCost} PP Headroom)`
                  }
                </div>
              </div>
              <div class="array-budget-meter-track" title="Max alternate slot usage against primary budget">
                <div class="budget-meter-fill ${isOverflow ? 'overflow' : ''}" style="width: ${pctFill}%;"></div>
              </div>
            </div>
          `;
        })()}

        <!-- Array Toolbar -->
        <div class="array-toolbar">
          <button id="pb-add-alt-slot-btn" class="btn btn-secondary btn-sm" type="button">
            <i class="ri-add-line"></i> Add Blank Slot
          </button>
          <button id="pb-duplicate-main-slot-btn" class="btn btn-secondary btn-sm" type="button" title="Duplicate Main Effect to create an alternate slot variant">
            <i class="ri-file-copy-line"></i> Duplicate Main as Alternate Slot
          </button>
        </div>

        <!-- Inline Add Slot Box (if opened) -->
        ${isAddingAltSlot ? `
          <div class="inline-add-slot-box">
            <div class="inline-box-title"><i class="ri-add-circle-line"></i> Create New Alternate Effect Slot</div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>SLOT NAME</label>
                <input type="text" id="pb-new-slot-name" placeholder="e.g., Stun Ray, Telekinetic Grip" value="${escapeHtml(newSlotBaseName || '')}">
              </div>
              <div class="form-group flex-1">
                <label>RANKS</label>
                <input type="number" id="pb-new-slot-ranks" min="1" max="30" value="${currentPower.mainEffect.ranks}">
              </div>
            </div>

            <!-- Visual Base Effect Picker Box for New Slot -->
            ${(() => {
              const newSlotBase = BASE_EFFECTS.find(b => b.name === newSlotBaseName) || BASE_EFFECTS[0];
              const catClass = getCategoryClass(newSlotBase.category);
              return `
                <div class="new-slot-base-picker-box">
                  <div class="new-slot-base-header">
                    <div class="new-slot-base-info">
                      <span class="picker-label"><i class="ri-flashlight-line"></i> BASE EFFECT:</span>
                      <span class="effect-tag-pill ${catClass}">${newSlotBase.category || 'General'}</span>
                      <strong class="selected-base-chip">${newSlotBase.name}</strong>
                      <span class="effect-tag-pill cost-pill">${newSlotBase.cost} PP/Rank</span>
                      <span class="picker-specs-hint">• ${newSlotBase.action} Action • ${newSlotBase.range} Range • ${newSlotBase.duration}</span>
                    </div>
                    <button class="btn btn-secondary btn-xs" id="pb-toggle-new-slot-lib" type="button" title="Choose base effect from library">
                      <i class="ri-compass-3-line"></i> ${isNewSlotLibExpanded ? 'Hide Library' : 'Change Effect (Library)'}
                    </button>
                  </div>

                  <!-- Description of the selected power effect for new slot -->
                  <div class="effect-desc-box" style="margin-top: 0.35rem;">
                    <strong>M&M 3e Rule:</strong> ${escapeHtml(newSlotBase.desc || 'Standard D20 Hero System power effect.')}
                  </div>

                  <!-- Configurable Sub-options for New Slot -->
                  ${renderEffectConfiguration(newSlotTempEffect, 'new-slot')}

                  ${isNewSlotLibExpanded ? renderEmbeddedLibraryForTarget('new-slot', null, newSlotBaseName) : ''}
                </div>
              `;
            })()}

            <div class="inline-slot-actions">
              <label class="dynamic-checkbox-label">
                <input type="checkbox" id="pb-new-slot-dynamic"> Dynamic Array Slot (+2 PP flat)
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
            const slotBase = BASE_EFFECTS.find(b => b.name === (slot.effect.baseEffect || slot.name)) || BASE_EFFECTS[0];
            const isExpanded = expandedSlotIdx === aIdx;
            const isSlotLibOpen = expandedSlotLibIdx === aIdx;
            const totalMods = (slot.effect?.extras ? slot.effect.extras.length : 0) + (slot.effect?.flaws ? slot.effect.flaws.length : 0);
            const isActive = activeSlotId === slot.id;

            return `
              <div class="array-slot-item ${validation.isValid ? '' : 'slot-overflow'} ${isActive ? 'active-slot' : ''}">
                <div class="slot-main-row">
                  <div class="slot-left-group">
                    <button class="slot-active-toggle-btn ${isActive ? 'active' : ''}" data-toggle-active-slot="${slot.id}" type="button" title="${isActive ? 'Currently Active Slot' : 'Click to switch active power (Free Action)'}">
                      <i class="${isActive ? 'ri-radio-button-fill' : 'ri-checkbox-blank-circle-line'}"></i>
                    </button>
                    <div class="slot-info-box">
                      <div class="slot-title-line">
                        <div class="slot-name-edit-box">
                          <input type="text"
                                 class="pb-slot-name-input"
                                 data-slot-name-idx="${aIdx}"
                                 value="${escapeHtml(slot.name || slot.effect?.name || slot.effect?.baseEffect || 'Alternate Slot')}"
                                 placeholder="Slot Name (e.g. Solar Flare)"
                                 title="Click to rename this slot" />
                          <i class="ri-edit-line slot-name-edit-icon" title="Editable slot name"></i>
                        </div>
                        ${isActive ? '<span class="badge badge-primary" style="font-size:0.65rem;"><i class="ri-flashlight-fill"></i> ACTIVE</span>' : '<span class="badge badge-subtle" style="font-size:0.65rem;">STANDBY</span>'}
                      </div>
                      <div class="slot-specs-row">
                        <span><strong>${slot.effect.baseEffect}</strong> (Rank ${slot.effect.ranks})</span>
                        <span>•</span>
                        <span>${slot.effect.range || slotBase.range || 'Close'}</span>
                        <span>•</span>
                        <span>${slot.effect.action || slotBase.action || 'Standard'}</span>
                        ${slotBase.resistance ? `<span>•</span><span>vs ${slot.effect.resistance || slotBase.resistance}</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <div class="slot-right-actions">
                    <!-- Segmented Dynamic / Standard Toggle -->
                    <div class="slot-type-pill-toggle">
                      <button type="button" class="slot-type-btn ${!slot.isDynamic ? 'active' : ''}" data-set-slot-dynamic="${aIdx}:false">Standard (+1 PP)</button>
                      <button type="button" class="slot-type-btn ${slot.isDynamic ? 'active dynamic' : ''}" data-set-slot-dynamic="${aIdx}:true">Dynamic (+2 PP)</button>
                    </div>

                    <!-- Budget Badge -->
                    <div class="slot-budget-badge ${validation.isValid ? 'ok' : 'warn'}">
                      ${validation.isValid
                        ? `Cost: ${validation.slotCost} / ${validation.capacity} PP`
                        : `Cost: ${validation.slotCost} (+${validation.overflow} PP Over!)`
                      }
                    </div>

                    <button class="btn btn-secondary btn-xs" data-toggle-slot-lib="${aIdx}" type="button" title="Change base effect from library">
                      <i class="ri-compass-3-line"></i> ${isSlotLibOpen ? 'Hide Library' : 'Change Effect'}
                    </button>

                    <button class="btn btn-ghost btn-sm" data-toggle-slot-mod="${aIdx}" type="button" title="Configure modifiers for this slot">
                      <i class="ri-settings-3-line"></i> (${totalMods})
                    </button>

                    <button class="btn-delete-slot" data-remove-alt="${aIdx}" title="Delete slot">
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </div>

                <!-- Description of the selected power effect in alternate slot -->
                <div class="slot-effect-desc-wrap" style="margin-top: 0.45rem;">
                  <div class="effect-desc-box">
                    <strong>M&M 3e Rule:</strong> ${escapeHtml(slotBase.desc || 'Standard D20 Hero System power effect.')}
                  </div>

                  <!-- Configurable Sub-options for Alternate Slot -->
                  ${renderEffectConfiguration(slot.effect, `slot:${aIdx}`)}
                </div>

                <!-- Slot Library Drawer if open -->
                ${isSlotLibOpen ? `
                  <div class="slot-library-drawer">
                    ${renderEmbeddedLibraryForTarget('slot', aIdx, slot.effect.baseEffect)}
                  </div>
                ` : ''}

                <!-- Slot Modifiers Drawer -->
                ${isExpanded ? `
                  <div class="slot-modifiers-drawer">
                    <div class="slot-modifiers-drawer-header">
                      <span class="drawer-title"><i class="ri-settings-3-line"></i> Applied Extras & Flaws: <strong>${escapeHtml(slot.name || 'Alternate Slot')}</strong> (${totalMods})</span>
                    </div>

                    ${(!slot.effect?.extras?.length && !slot.effect?.flaws?.length) ? `
                      <div class="empty-applied-hint">No extras or flaws attached to this alternate slot. Select modifiers from the library below to customize this effect.</div>
                    ` : `
                      <div class="applied-mods-grid sub-applied-mods-grid">
                        ${(slot.effect.extras || []).map((ex, exIdx) => renderAppliedModifierCard(ex, exIdx, 'extra', `slot:${aIdx}`)).join('')}
                        ${(slot.effect.flaws || []).map((fl, flIdx) => renderAppliedModifierCard(fl, flIdx, 'flaw', `slot:${aIdx}`)).join('')}
                      </div>
                    `}

                    <!-- Visual Modifier Library Palette for Alternate Slot -->
                    ${renderModifierPaletteForTarget(`slot:${aIdx}`)}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
          ${currentPower.alternateEffects.length === 0 ? `
            <div class="empty-section-hint">No alternate slots configured. Click "+ Add Blank Slot" or "Duplicate Main" to build your Array.</div>
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

function renderOptionLibrary({
  targetStr,
  effectType,
  label,
  icon,
  badgeText,
  hintText,
  items,
  selectedMap,
  categories = [],
  allowRankStepper = false
}) {
  const stateKey = `${targetStr}:${effectType}`;
  const currentSearch = (optLibSearchState[stateKey] || '').toLowerCase().trim();
  const activeCat = optLibCatState[stateKey] || 'all';

  // Build applied chips
  const appliedChipsHtml = items
    .filter(item => selectedMap.has(item.id))
    .map(item => {
      const entry = selectedMap.get(item.id);
      const currentRank = (typeof entry === 'object' && entry !== null && entry.ranks) ? entry.ranks : null;
      let badgeLabel = '';
      if (allowRankStepper && currentRank) {
        badgeLabel = `Rank ${currentRank}`;
      } else if (item.ranks !== undefined) {
        badgeLabel = `${item.ranks} R`;
      } else if (item.cost !== undefined) {
        badgeLabel = `${item.cost} PP/R`;
      } else if (item.pts !== undefined) {
        badgeLabel = `${item.pts} PP`;
      }

      return `
        <div class="opt-applied-chip">
          <span>${escapeHtml(item.name)}</span>
          ${badgeLabel ? `<span class="chip-cost">${badgeLabel}</span>` : ''}
          <button type="button" class="chip-remove-btn" data-opt-remove="${item.id}" data-config-target="${targetStr}" data-opt-type="${effectType}" title="Remove ${escapeHtml(item.name)}">
            <i class="ri-close-line"></i>
          </button>
        </div>
      `;
    }).join('');

  // Category pills HTML
  let catPillsHtml = '';
  if (categories && categories.length > 0) {
    catPillsHtml = `
      <div class="opt-cat-pills">
        ${categories.map(cat => `
          <button type="button" class="opt-cat-pill ${activeCat === cat.id ? 'active' : ''}" data-config-target="${targetStr}" data-opt-type="${effectType}" data-opt-cat="${cat.id}">
            ${escapeHtml(cat.label)}
          </button>
        `).join('')}
      </div>
    `;
  }

  // Cards grid HTML
  const cardsHtml = items.map(item => {
    const isSelected = selectedMap.has(item.id);
    const entry = isSelected ? selectedMap.get(item.id) : null;
    const currentRank = (typeof entry === 'object' && entry !== null && entry.ranks) ? entry.ranks : (item.ranks || 1);

    const nameMatch = !currentSearch || item.name.toLowerCase().includes(currentSearch) || (item.desc && item.desc.toLowerCase().includes(currentSearch));
    const catMatch = activeCat === 'all' || item.category === activeCat;
    const isVisible = nameMatch && catMatch;

    let costBadge = '';
    if (item.maxRanks !== undefined) {
      costBadge = `Max R${item.maxRanks} (2 PP/R)`;
    } else if (item.ranks !== undefined) {
      costBadge = `${item.ranks} Ranks (${item.ranks} PP)`;
    } else if (item.cost !== undefined) {
      costBadge = `+${item.cost} PP/Rank`;
    } else if (item.pts !== undefined) {
      costBadge = `${item.pts} PP Flat`;
    }

    return `
      <div class="opt-lib-card ${isSelected ? 'selected' : ''}"
           style="${isVisible ? '' : 'display:none;'}"
           data-opt-toggle="${item.id}"
           data-config-target="${targetStr}"
           data-opt-type="${effectType}"
           data-name="${escapeHtml(item.name.toLowerCase())}"
           data-desc="${escapeHtml((item.desc || '').toLowerCase())}"
           data-cat="${escapeHtml(item.category || 'all')}">
        <div class="opt-card-top">
          <div class="opt-card-title-wrap">
            <i class="${item.icon || 'ri-shield-star-line'}"></i>
            <span>${escapeHtml(item.name)}</span>
          </div>
          <span class="opt-card-cost-badge">${costBadge}</span>
        </div>
        <p class="opt-card-desc" title="${escapeHtml(item.desc || '')}">${escapeHtml(item.desc || '')}</p>
        <div class="opt-card-footer">
          <span class="opt-check-status">
            <i class="${isSelected ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}"></i>
            ${isSelected ? 'Selected' : 'Click to add'}
          </span>
          ${allowRankStepper && isSelected ? `
            <div class="opt-rank-stepper" onclick="event.stopPropagation();">
              <button type="button" class="opt-rank-btn" data-opt-rank-dec="${item.id}" data-config-target="${targetStr}" data-opt-type="${effectType}" title="Decrease rank">-</button>
              <span class="opt-rank-val">${currentRank}</span>
              <button type="button" class="opt-rank-btn" data-opt-rank-inc="${item.id}" data-config-target="${targetStr}" data-opt-type="${effectType}" title="Increase rank">+</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="effect-config-header">
      <div class="config-header-left">
        <i class="${icon}"></i>
        <span>${escapeHtml(label)}</span>
        <span class="config-cost-badge">${badgeText}</span>
      </div>
      ${hintText ? `<span class="config-hint-text">${escapeHtml(hintText)}</span>` : ''}
    </div>

    <div class="effect-options-library">
      <!-- Applied selections bar -->
      <div class="opt-lib-applied-box">
        <div class="opt-applied-label">
          <i class="ri-check-double-line"></i> Active Selections (${selectedMap.size})
        </div>
        <div class="opt-applied-chips">
          ${appliedChipsHtml || '<span style="font-size:0.7rem;color:var(--text-muted);font-style:italic;">No options selected. Click cards below to add.</span>'}
        </div>
      </div>

      <!-- Search & Category Toolbar -->
      <div class="opt-lib-toolbar">
        <div class="opt-search-wrapper">
          <i class="ri-search-line search-icon"></i>
          <input type="text"
                 class="opt-search-input"
                 data-config-target="${targetStr}"
                 data-opt-type="${effectType}"
                 placeholder="Search options..."
                 value="${escapeHtml(optLibSearchState[stateKey] || '')}">
        </div>
        ${catPillsHtml}
      </div>

      <!-- Card Grid -->
      <div class="opt-card-grid" data-opt-grid="${targetStr}:${effectType}">
        ${cardsHtml}
      </div>
    </div>
  `;
}

function renderEffectConfiguration(effect, targetStr = 'main') {
  if (!effect) return '';
  const baseName = effect.baseEffect || effect.name;
  const cfg = CONFIGURABLE_EFFECTS[baseName];
  if (!cfg) return '';

  // Ensure config is populated with defaults
  const norm = normalizeEffect(effect);
  effect.config = norm.config;
  effect.baseCost = norm.baseCost;
  const config = effect.config || {};

  let innerContent = '';

  if (cfg.type === 'senses_multiselect') {
    const activeSenses = Array.isArray(config.senses) ? config.senses : ['Visual'];
    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-eye-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">${effect.baseCost} PP/Rank (${activeSenses.length} senses)</span>
        </div>
        <span class="config-hint-text">M&M 3e Rule: 1 PP/Rank per sensory type (Min 1, Max 5)</span>
      </div>
      <div class="effect-config-pills">
        ${cfg.senses.map(sense => {
          const isActive = activeSenses.includes(sense.id);
          return `
            <button type="button" class="effect-pill-btn ${isActive ? 'active' : ''}" data-config-sense="${sense.id}" data-config-target="${targetStr}" title="${escapeHtml(sense.desc)}">
              <i class="${sense.icon || 'ri-checkbox-circle-line'}"></i>
              <span>${sense.name}</span>
              <span class="pill-badge">+1 PP/R</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  } else if (cfg.type === 'trait_picker') {
    const activeCategory = config.traitCategory || 'abilities';
    const catData = cfg.categories[activeCategory] || cfg.categories.abilities;
    const activeTrait = config.traitName || catData.traits[0];

    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-medal-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">${catData.costDisplay}</span>
        </div>
        <span class="config-hint-text">Abilities (2 PP/R), Defenses (1 PP/R), Skills (1 PP / 2 Ranks), Advantages (1 PP/R)</span>
      </div>
      <div class="effect-config-row">
        <div class="effect-config-pills" style="margin-bottom: 0.4rem;">
          ${Object.values(cfg.categories).map(cat => {
            const isCatActive = cat.id === activeCategory;
            return `
              <button type="button" class="effect-pill-btn ${isCatActive ? 'active' : ''}" data-config-trait-cat="${cat.id}" data-config-target="${targetStr}">
                <span>${cat.label}</span>
              </button>
            `;
          }).join('')}
        </div>
        <div class="effect-config-select-wrap">
          <label class="config-select-label"><i class="ri-list-check"></i> Selected ${activeCategory.slice(0, -1).toUpperCase()}:</label>
          <select class="effect-config-select" data-config-trait-name="${targetStr}">
            ${catData.traits.map(trait => `
              <option value="${escapeHtml(trait)}" ${trait === activeTrait ? 'selected' : ''}>${escapeHtml(trait)}</option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  } else if (cfg.type === 'affliction_builder') {
    const resDefense = config.resistance || 'Fortitude';
    const first = config.firstDegree || 'Dazed';
    const second = config.secondDegree || 'Stunned';
    const third = config.thirdDegree || 'Incapacitated';

    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-pulse-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">DC 10 + Rank vs ${resDefense}</span>
        </div>
      </div>
      <div class="effect-config-row">
        <!-- Quick Presets -->
        <div class="config-field-group">
          <label class="config-select-label"><i class="ri-magic-line"></i> Quick Presets:</label>
          <div class="effect-config-pills">
            ${cfg.presets.map(p => `
              <button type="button" class="effect-pill-btn ${config.preset === p.id ? 'active' : ''}" data-config-aff-preset="${p.id}" data-config-target="${targetStr}" title="${p.name} (${p.first} / ${p.second} / ${p.third} vs ${p.res})">
                <span>${p.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Resistance Check Defense -->
        <div class="config-field-group" style="margin-top: 0.35rem;">
          <label class="config-select-label"><i class="ri-shield-line"></i> Resistance Defense Check:</label>
          <div class="effect-config-pills">
            ${cfg.resistanceOptions.map(res => `
              <button type="button" class="effect-pill-btn ${resDefense === res ? 'active' : ''}" data-config-aff-res="${res}" data-config-target="${targetStr}">
                <i class="ri-shield-check-line"></i> vs ${res}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Degrees of Failure Selectors -->
        <div class="config-degrees-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:0.5rem;margin-top:0.4rem;">
          <div class="config-degree-col">
            <label class="config-select-label">1st Degree Failure:</label>
            <select class="effect-config-select" data-config-aff-deg="first" data-config-target="${targetStr}">
              ${cfg.firstDegree.map(d => `<option value="${d}" ${d === first ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div class="config-degree-col">
            <label class="config-select-label">2nd Degree Failure:</label>
            <select class="effect-config-select" data-config-aff-deg="second" data-config-target="${targetStr}">
              ${cfg.secondDegree.map(d => `<option value="${d}" ${d === second ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div class="config-degree-col">
            <label class="config-select-label">3rd Degree Failure:</label>
            <select class="effect-config-select" data-config-aff-deg="third" data-config-target="${targetStr}">
              ${cfg.thirdDegree.map(d => `<option value="${d}" ${d === third ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    `;
  } else if (cfg.type === 'movement_multiselect_library' || cfg.type === 'movement_picker') {
    const selectedModes = Array.isArray(config.selectedModes) ? config.selectedModes : [{ id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 }];
    const selectedMap = new Map();
    selectedModes.forEach(m => {
      if (typeof m === 'object' && m !== null) {
        selectedMap.set(m.id, m);
      } else {
        selectedMap.set(m, { id: m, ranks: 1 });
      }
    });

    innerContent = renderOptionLibrary({
      targetStr,
      effectType: 'movement',
      label: cfg.label || 'Movement Modes Library',
      icon: 'ri-compass-3-line',
      badgeText: `${effect.ranks} Ranks (${effect.ranks * 2} PP)`,
      hintText: 'M&M 3e: 2 PP/Rank. Combine multiple modes with custom ranks.',
      items: cfg.modes,
      selectedMap,
      allowRankStepper: true
    });
  } else if (cfg.type === 'immunity_multiselect_library' || cfg.type === 'immunity_picker') {
    const selectedPresets = Array.isArray(config.selectedPresets) ? config.selectedPresets : ['life_support'];
    const selectedMap = new Map();
    selectedPresets.forEach(id => selectedMap.set(id, { id }));

    innerContent = renderOptionLibrary({
      targetStr,
      effectType: 'immunity',
      label: cfg.label || 'Immunity Scope Library',
      icon: 'ri-shield-star-line',
      badgeText: `${effect.ranks} Ranks (${effect.ranks} PP)`,
      hintText: 'M&M 3e: 1 PP/Rank. Select any combination of immunities.',
      items: cfg.presets,
      selectedMap,
      categories: cfg.categories || []
    });
  } else if (cfg.type === 'morph_scope') {
    const activeScope = config.scope !== undefined ? Number(config.scope) : cfg.defaultScope;

    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-user-shared-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">Rank ${activeScope} (${activeScope * 5} PP)</span>
        </div>
      </div>
      <div class="effect-config-pills">
        ${cfg.scopes.map(s => {
          const isActive = s.ranks === activeScope;
          return `
            <button type="button" class="effect-pill-btn ${isActive ? 'active' : ''}" data-config-morph-scope="${s.ranks}" data-config-target="${targetStr}" title="${escapeHtml(s.desc)}">
              <span>${s.name}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  } else if (cfg.type === 'weaken_target') {
    const resDefense = config.resistance || 'Fortitude';
    const activeTrait = config.traitName || 'Stamina';

    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-arrow-down-circle-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">Target: ${activeTrait} (vs ${resDefense})</span>
        </div>
      </div>
      <div class="effect-config-row">
        <div class="config-field-group">
          <label class="config-select-label">Resistance Check Defense:</label>
          <div class="effect-config-pills">
            ${cfg.resistanceOptions.map(res => `
              <button type="button" class="effect-pill-btn ${resDefense === res ? 'active' : ''}" data-config-weaken-res="${res}" data-config-target="${targetStr}">
                vs ${res}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="effect-config-select-wrap" style="margin-top:0.35rem;">
          <label class="config-select-label">Target Trait to Weaken:</label>
          <select class="effect-config-select" data-config-weaken-trait="${targetStr}">
            <optgroup label="Abilities">
              ${cfg.traitCategories.abilities.map(t => `<option value="${t}" ${t === activeTrait ? 'selected' : ''}>${t}</option>`).join('')}
            </optgroup>
            <optgroup label="Defenses">
              ${cfg.traitCategories.defenses.map(t => `<option value="${t}" ${t === activeTrait ? 'selected' : ''}>${t}</option>`).join('')}
            </optgroup>
            <optgroup label="Broad Categories">
              ${cfg.traitCategories.broad.map(t => `<option value="${t}" ${t === activeTrait ? 'selected' : ''}>${t}</option>`).join('')}
            </optgroup>
          </select>
        </div>
      </div>
    `;
  } else if (cfg.type === 'descriptor_spec') {
    const activeDesc = config.descriptor || cfg.defaultDescriptor;

    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-forbid-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">${activeDesc}</span>
        </div>
      </div>
      <div class="effect-config-row">
        <div class="effect-config-select-wrap">
          <label class="config-select-label">Countered Descriptor:</label>
          <select class="effect-config-select" data-config-descriptor="${targetStr}">
            ${cfg.descriptors.map(d => `<option value="${d}" ${d === activeDesc ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        ${activeDesc === 'Custom' ? `
          <div class="form-group" style="margin-top:0.35rem;">
            <input type="text" class="effect-config-input" data-config-descriptor-custom="${targetStr}" placeholder="Enter custom power descriptor..." value="${escapeHtml(config.customDescriptor || '')}">
          </div>
        ` : ''}
      </div>
    `;
  } else if (cfg.type === 'comprehend_multiselect_library' || cfg.type === 'comprehend_picker') {
    const selectedModes = Array.isArray(config.selectedModes) ? config.selectedModes : ['languages_understand'];
    const selectedMap = new Map();
    selectedModes.forEach(id => selectedMap.set(id, { id }));

    innerContent = renderOptionLibrary({
      targetStr,
      effectType: 'comprehend',
      label: cfg.label || 'Comprehension Modes Library',
      icon: 'ri-translate-2',
      badgeText: `${effect.ranks} Ranks (${effect.ranks * 2} PP)`,
      hintText: 'M&M 3e: 2 PP/Rank. Combine multiple comprehension languages & modes.',
      items: cfg.modes,
      selectedMap
    });
  } else if (cfg.type === 'environment_multiselect_library' || cfg.type === 'environment_picker') {
    const selectedElements = Array.isArray(config.selectedElements) ? config.selectedElements : ['cold_1'];
    const selectedMap = new Map();
    selectedElements.forEach(id => selectedMap.set(id, { id }));

    innerContent = renderOptionLibrary({
      targetStr,
      effectType: 'environment',
      label: cfg.label || 'Environmental Hazards Library',
      icon: 'ri-sun-cloudy-line',
      badgeText: `${effect.baseCost} PP/Rank (Total: ${effect.ranks * (effect.baseCost || 1)} PP)`,
      hintText: 'M&M 3e: Each environmental hazard adds to base cost per rank.',
      items: cfg.elements,
      selectedMap
    });
  } else if (cfg.type === 'senses_multiselect_library' || cfg.type === 'senses_picker') {
    const selectedFaculties = Array.isArray(config.selectedFaculties) ? config.selectedFaculties : ['darkvision'];
    const selectedMap = new Map();
    selectedFaculties.forEach(id => selectedMap.set(id, { id }));

    innerContent = renderOptionLibrary({
      targetStr,
      effectType: 'senses',
      label: cfg.label || 'Sensory Faculty Superhuman Expansion',
      icon: 'ri-radar-line',
      badgeText: `${effect.ranks} Ranks (${effect.ranks} PP Flat)`,
      hintText: 'M&M 3e: 1 PP/Rank Flat per point of enhanced superhuman senses.',
      items: cfg.faculties,
      selectedMap,
      categories: cfg.categories || []
    });
  } else if (cfg.type === 'variable_theme') {
    const activeTheme = config.theme || cfg.defaultTheme;

    innerContent = `
      <div class="effect-config-header">
        <div class="config-header-left">
          <i class="ri-shuffle-line"></i>
          <span>${cfg.label}</span>
          <span class="config-cost-badge">Pool: 5 PP per Rank</span>
        </div>
      </div>
      <div class="effect-config-row">
        <div class="effect-config-select-wrap">
          <label class="config-select-label">Variable Theme / Source:</label>
          <select class="effect-config-select" data-config-variable-theme="${targetStr}">
            ${cfg.themes.map(t => `<option value="${t}" ${t === activeTheme ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  }

  return `
    <div class="effect-config-panel target-${targetStr.replace(':', '-')}">
      ${innerContent}
    </div>
  `;
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
          <span class="effect-tag-pill cost-pill">${effect.baseCost || base.cost} PP/Rank</span>
        </div>
        <button id="pb-toggle-embedded-library" class="btn ${isBaseLibraryExpanded ? 'btn-secondary' : 'btn-primary'} btn-sm" type="button" title="Toggle Base Effect Library view">
          <i class="ri-compass-3-line"></i> ${isBaseLibraryExpanded ? 'Hide Effect Library' : `Browse Effect Library (${BASE_EFFECTS.length})`}
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

      <!-- Configurable Sub-options for Main Effect -->
      ${renderEffectConfiguration(effect, 'main')}
    </div>
  `;
}

function renderEmbeddedBaseEffectLibrary() {
  if (!isBaseLibraryExpanded) return '';
  return renderEmbeddedLibraryForTarget('main', null, currentPower?.mainEffect?.baseEffect || 'Damage');
}

function renderEmbeddedLibraryForTarget(targetType, targetIndex, currentSelectedName) {
  const filtered = getFilteredBaseEffects();
  const targetIdStr = targetIndex !== null ? `:${targetIndex}` : '';

  return `
    <div class="pb-embedded-library-section target-${targetType}">
      <div class="embedded-library-header">
        <div class="embedded-library-title">
          <i class="ri-compass-3-line"></i>
          <span>BASE EFFECT LIBRARY</span>
          <span class="embedded-count-badge">${BASE_EFFECTS.length} Core Effects</span>
        </div>
        <div class="embedded-header-actions">
          <button class="btn btn-ghost btn-xs" data-collapse-target-lib="${targetType}${targetIdStr}" type="button" title="Collapse Library View">
            <i class="ri-arrow-up-s-line"></i> Collapse
          </button>
        </div>
      </div>

      <!-- Controls: Search & Category Pills -->
      <div class="embedded-library-controls">
        <div class="palette-search-wrapper" style="max-width: 320px;">
          <i class="ri-search-line search-icon"></i>
          <input type="text" class="pb-target-search" data-search-target="${targetType}${targetIdStr}" placeholder="Search 41 base effects..." value="${escapeHtml(effectSearchQuery)}">
          ${effectSearchQuery ? `<button class="clear-search-btn" data-clear-target-search="${targetType}${targetIdStr}"><i class="ri-close-line"></i></button>` : ''}
        </div>

        <div class="explorer-category-pills">
          ${EFFECT_CATEGORIES.map(cat => `
            <button class="explorer-pill ${effectCategoryFilter === cat ? 'active' : ''}" data-target-cat="${cat}" data-cat-target="${targetType}${targetIdStr}" type="button">
              ${cat} (${cat === 'All' ? BASE_EFFECTS.length : BASE_EFFECTS.filter(e => e.category === cat).length})
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Responsive Multi-Column Card Grid -->
      <div class="embedded-effect-grid">
        ${filtered.map(eff => {
          const isSelected = eff.name === currentSelectedName;
          const catClass = getCategoryClass(eff.category);
          return `
            <div class="embedded-eff-card ${isSelected ? 'active-selected' : ''}" data-select-target="${targetType}${targetIdStr}" data-select-base="${eff.name}">
              <div class="embedded-card-top">
                <span class="embedded-eff-name">${eff.name}</span>
                <div style="display:flex;gap:0.3rem;align-items:center;">
                  <span class="effect-tag-pill ${catClass}">${eff.category || 'General'}</span>
                  <span class="effect-tag-pill cost-pill">${eff.cost} PP/Rank</span>
                </div>
              </div>

              <div class="effect-tags-row" style="margin: 0.35rem 0;">
                <span class="effect-tag-pill"><i class="ri-flashlight-line"></i> ${eff.action}</span>
                <span class="effect-tag-pill"><i class="ri-focus-2-line"></i> ${eff.range}</span>
                <span class="effect-tag-pill"><i class="ri-time-line"></i> ${eff.duration}</span>
                ${eff.resistance ? `<span class="effect-tag-pill"><i class="ri-shield-line"></i> vs ${eff.resistance}</span>` : ''}
              </div>

              <p class="embedded-card-desc">${escapeHtml(eff.desc)}</p>

              <div class="embedded-card-footer">
                <span class="embedded-status-hint">
                  ${isSelected ? '<i class="ri-checkbox-circle-fill"></i> Currently Active' : 'Click to select'}
                </span>
                <button class="btn btn-xs ${isSelected ? 'btn-secondary' : 'btn-primary'}" type="button">
                  ${isSelected ? 'Selected' : 'Choose Effect'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
        ${filtered.length === 0 ? `
          <div class="empty-embedded-effects">
            No effects match "${escapeHtml(effectSearchQuery || effectCategoryFilter)}".
          </div>
        ` : ''}
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

function getModifierTargetList(targetStr, modType) {
  const [type, idxStr] = (targetStr || 'main').split(':');
  const idx = idxStr !== undefined ? parseInt(idxStr, 10) : null;
  const isExtra = modType === 'extra';

  if (type === 'main') {
    return isExtra ? currentPower.mainEffect.extras : currentPower.mainEffect.flaws;
  } else if (type === 'linked' && idx !== null && currentPower.linkedEffects[idx]) {
    return isExtra ? currentPower.linkedEffects[idx].extras : currentPower.linkedEffects[idx].flaws;
  } else if (type === 'slot' && idx !== null && currentPower.alternateEffects[idx]?.effect) {
    return isExtra ? currentPower.alternateEffects[idx].effect.extras : currentPower.alternateEffects[idx].effect.flaws;
  }
  return null;
}

function renderAppliedModifierCard(mod, idx, type, targetStr = 'main') {
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
                    data-mod-target="${targetStr}"
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
        <select class="mod-config-select" data-mod-target="${targetStr}" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="shape">
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
        <select class="mod-config-select" data-mod-target="${targetStr}" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="skill">
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
        <select class="mod-config-select" data-mod-target="${targetStr}" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="sense">
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
        <input type="text" class="mod-config-input" data-mod-target="${targetStr}" data-mod-type="${type}" data-mod-idx="${idx}" data-mod-config-field="note" value="${escapeHtml(note)}" placeholder="${placeholder}">
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
            <button class="mini-step-btn" data-mod-target="${targetStr}" data-mod-rank-dec="${idx}" data-mod-type="${type}" type="button">-</button>
            <span class="mini-step-val">${mod.ranks || 1} Rank${(mod.ranks || 1) > 1 ? 's' : ''}</span>
            <button class="mini-step-btn" data-mod-target="${targetStr}" data-mod-rank-inc="${idx}" data-mod-type="${type}" type="button">+</button>
          </div>
        ` : '<span></span>'}

        <button class="btn-remove-mod" data-mod-target="${targetStr}" data-remove-mod="${idx}" data-mod-type="${type}" title="Remove modifier" type="button">
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>
  `;
}

function renderModifierPaletteForTarget(targetStr = 'main') {
  const isMain = targetStr === 'main';

  return `
    <div class="modifiers-palette-section ${isMain ? '' : 'sub-effect-palette-section'}" data-palette-target="${targetStr}">
      <div class="palette-header-bar">
        <!-- Search Box -->
        <div class="palette-search-wrapper">
          <i class="ri-search-line search-icon"></i>
          <input type="text" class="pb-target-mod-search" data-search-mod-target="${targetStr}" placeholder="Search modifiers..." value="${escapeHtml(modifierSearchQuery)}">
          ${modifierSearchQuery ? `<button class="clear-search-btn" data-clear-target-mod-search="${targetStr}"><i class="ri-close-line"></i></button>` : ''}
        </div>

        <!-- Tab Toggle: Extras vs Flaws -->
        <div class="palette-type-tabs">
          <button class="palette-type-btn ${activeModifierTab === 'extras' ? 'active' : ''}" data-mod-type="extras" data-tab-mod-target="${targetStr}" type="button">
            Extras (${EXTRAS.length})
          </button>
          <button class="palette-type-btn ${activeModifierTab === 'flaws' ? 'active' : ''}" data-mod-type="flaws" data-tab-mod-target="${targetStr}" type="button">
            Flaws (${FLAWS.length})
          </button>
        </div>
      </div>

      <!-- Category Pills -->
      <div class="palette-category-pills">
        ${MODIFIER_CATEGORIES.map(cat => {
          const catClass = getModifierCategoryClass(cat);
          return `
            <button class="category-pill ${activeCategory === cat ? 'active' : ''} ${catClass}" data-mod-cat="${cat}" data-cat-mod-target="${targetStr}" type="button">
              <span class="pill-dot ${catClass}"></span> ${cat}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Modifiers List -->
      <div class="palette-scroll-grid" data-grid-mod-target="${targetStr}">
        ${renderPaletteCards(targetStr)}
      </div>
    </div>
  `;
}

function renderPaletteCards(targetStr = 'main') {
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
        <button class="btn-add-modifier" data-add-mod="${escapeHtml(m.name)}" data-mod-tab="${activeModifierTab}" data-add-mod-target="${targetStr}" title="Add modifier to this effect" type="button">
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

    currentPower.activeSlotId = activeSlotId || 'main';
    if (currentPower.active === undefined) {
      currentPower.active = true;
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

  // Power Name (synced with #pb-array-name-input)
  modal.querySelector('#pb-power-name')?.addEventListener('input', (e) => {
    currentPower.name = e.target.value;
    const arrayNameInput = modal.querySelector('#pb-array-name-input');
    if (arrayNameInput && arrayNameInput.value !== e.target.value) {
      arrayNameInput.value = e.target.value;
    }
  });

  // Array Suite Name input (synced with #pb-power-name)
  modal.querySelector('#pb-array-name-input')?.addEventListener('input', (e) => {
    currentPower.name = e.target.value;
    const powerNameInput = modal.querySelector('#pb-power-name');
    if (powerNameInput && powerNameInput.value !== e.target.value) {
      powerNameInput.value = e.target.value;
    }
  });

  // Main Effect Slot Name input
  modal.querySelector('#pb-main-slot-name-input')?.addEventListener('input', (e) => {
    currentPower.mainEffect.name = e.target.value;
  });

  // Power Structure Type
  modal.querySelectorAll('[data-set-struct]').forEach(card => {
    card.addEventListener('click', () => {
      currentPower.type = card.dataset.setStruct;
      renderPowerStudio();
    });
  });

  // Delivery Form pills
  modal.querySelectorAll('[data-delivery]').forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.dataset.delivery;
      if (!currentPower.deviceConfig) currentPower.deviceConfig = { type: 'none', descriptor: '', toughness: 10 };
      currentPower.deviceConfig.type = type;
      renderPowerStudio();
    });
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

  // Embedded Base Effect Library main toggle
  modal.querySelector('#pb-toggle-embedded-library')?.addEventListener('click', () => {
    isBaseLibraryExpanded = !isBaseLibraryExpanded;
    renderPowerStudio();
  });

  // Target-aware collapse buttons across all targets (main, linked, new-slot, slot)
  modal.querySelectorAll('[data-collapse-target-lib]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.collapseTargetLib;
      if (target === 'main') {
        isBaseLibraryExpanded = false;
      } else if (target.startsWith('linked:')) {
        expandedLinkedLibIdx = null;
      } else if (target === 'new-slot') {
        isNewSlotLibExpanded = false;
      } else if (target.startsWith('slot:')) {
        expandedSlotLibIdx = null;
      }
      renderPowerStudio();
    });
  });

  // Target-aware search input across all embedded libraries
  modal.querySelectorAll('.pb-target-search').forEach(inp => {
    inp.addEventListener('input', (e) => {
      effectSearchQuery = e.target.value;
      modal.querySelectorAll('.pb-target-search').forEach(otherInp => {
        if (otherInp !== e.target) otherInp.value = effectSearchQuery;
      });
      updateAllEmbeddedLibraries(modal);
    });
  });

  // Target-aware clear search across all embedded libraries
  modal.querySelectorAll('[data-clear-target-search]').forEach(btn => {
    btn.addEventListener('click', () => {
      effectSearchQuery = '';
      modal.querySelectorAll('.pb-target-search').forEach(inp => {
        inp.value = '';
      });
      updateAllEmbeddedLibraries(modal);
    });
  });

  // Target-aware category filter pills across all embedded libraries
  modal.querySelectorAll('[data-target-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      effectCategoryFilter = btn.dataset.targetCat;
      modal.querySelectorAll('[data-target-cat]').forEach(b => {
        b.classList.toggle('active', b.dataset.targetCat === effectCategoryFilter);
      });
      updateAllEmbeddedLibraries(modal);
    });
  });

  // Bind embedded effect selection cards
  bindEmbeddedSelectButtons(modal);

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
  // Target-aware applied modifiers ranks & removal
  modal.querySelectorAll('[data-mod-rank-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStr = btn.dataset.modTarget || 'main';
      const idx = parseInt(btn.dataset.modRankDec, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const list = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (list && list[idx] && (list[idx].ranks || 1) > 1) {
        list[idx].ranks--;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-mod-rank-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStr = btn.dataset.modTarget || 'main';
      const idx = parseInt(btn.dataset.modRankInc, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const list = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (list && list[idx]) {
        list[idx].ranks = (list[idx].ranks || 1) + 1;
        renderPowerStudio();
      }
    });
  });

  modal.querySelectorAll('[data-remove-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStr = btn.dataset.modTarget || 'main';
      const idx = parseInt(btn.dataset.removeMod, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const list = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (list && list[idx]) {
        const removedName = list[idx].name;
        list.splice(idx, 1);
        showToast(`Removed modifier "${removedName}"`, 'info');
        renderPowerStudio();
      }
    });
  });

  // Modifier 'or' cost option buttons
  modal.querySelectorAll('[data-mod-option]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStr = btn.dataset.modTarget || 'main';
      const idx = parseInt(btn.dataset.modIdx, 10);
      const isExtra = btn.dataset.modType === 'extra';
      const optionId = btn.dataset.modOption;
      const list = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (list && list[idx]) {
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
      const targetStr = sel.dataset.modTarget || 'main';
      const idx = parseInt(sel.dataset.modIdx, 10);
      const isExtra = sel.dataset.modType === 'extra';
      const field = sel.dataset.modConfigField;
      const list = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (list && list[idx]) {
        list[idx].config = list[idx].config || {};
        list[idx].config[field] = e.target.value;
        renderPowerStudio();
      }
    });
  });

  // Modifier text note input
  modal.querySelectorAll('.mod-config-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const targetStr = inp.dataset.modTarget || 'main';
      const idx = parseInt(inp.dataset.modIdx, 10);
      const isExtra = inp.dataset.modType === 'extra';
      const field = inp.dataset.modConfigField;
      const list = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (list && list[idx]) {
        list[idx].config = list[idx].config || {};
        list[idx].config[field] = e.target.value;
      }
    });
    inp.addEventListener('change', () => {
      renderPowerStudio();
    });
  });

  // Palette Search & Tabs across all modifier palettes
  modal.querySelectorAll('.pb-target-mod-search, #pb-mod-search').forEach(inp => {
    inp.addEventListener('input', (e) => {
      modifierSearchQuery = e.target.value;
      modal.querySelectorAll('.pb-target-mod-search, #pb-mod-search').forEach(other => {
        if (other !== e.target) other.value = modifierSearchQuery;
      });
      updateAllPaletteGrids(modal);
    });
  });

  modal.querySelectorAll('[data-clear-target-mod-search], #pb-clear-search').forEach(btn => {
    btn.addEventListener('click', () => {
      modifierSearchQuery = '';
      modal.querySelectorAll('.pb-target-mod-search, #pb-mod-search').forEach(inp => inp.value = '');
      updateAllPaletteGrids(modal);
    });
  });

  modal.querySelectorAll('.palette-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModifierTab = btn.dataset.modType;
      modal.querySelectorAll('.palette-type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.modType === activeModifierTab);
      });
      updateAllPaletteGrids(modal);
    });
  });

  modal.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.modCat;
      modal.querySelectorAll('.category-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.modCat === activeCategory);
      });
      updateAllPaletteGrids(modal);
    });
  });

  // Attach Add Modifier buttons inside all palettes
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
      range: currentPower.mainEffect.range || 'Close',
      action: currentPower.mainEffect.action || 'Standard',
      duration: currentPower.mainEffect.duration || 'Instant',
      resistance: 'Fortitude',
      extras: [],
      flaws: []
    });
    renderPowerStudio();
  });

  // Linked Quick Combo Presets
  modal.querySelector('#pb-quick-combo-sel')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val && val !== '0') return;
    const combo = COMMON_LINKED_COMBOS[parseInt(val, 10)];
    if (combo) {
      const baseRef = BASE_EFFECTS.find(b => b.name === combo.effect);
      currentPower.linkedEffects.push({
        baseEffect: combo.effect,
        name: combo.name,
        baseCost: baseRef ? baseRef.cost : 1,
        ranks: Math.min(currentPower.mainEffect.ranks || 10, combo.defaultRanks || 8),
        range: currentPower.mainEffect.range || (baseRef ? baseRef.range : 'Close'),
        action: currentPower.mainEffect.action || (baseRef ? baseRef.action : 'Standard'),
        duration: currentPower.mainEffect.duration || (baseRef ? baseRef.duration : 'Instant'),
        resistance: combo.resistance || (baseRef ? (baseRef.resistance || 'Fortitude') : 'Fortitude'),
        extras: [],
        flaws: []
      });
      showToast(`Linked preset "${combo.name}" added!`, 'info');
      renderPowerStudio();
    }
  });

  // Linked Auto-Sync button
  modal.querySelectorAll('[data-auto-sync-linked]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.autoSyncLinked, 10);
      if (currentPower.linkedEffects[idx]) {
        syncLinkedEffectWithMain(currentPower.mainEffect, currentPower.linkedEffects[idx]);
        showToast('Linked effect Range & Action synchronized with Main Effect!', 'success');
        renderPowerStudio();
      }
    });
  });

  // Linked Modifiers Toggle
  modal.querySelectorAll('[data-toggle-linked-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.toggleLinkedMod, 10);
      expandedLinkedIdx = (expandedLinkedIdx === idx) ? null : idx;
      renderPowerStudio();
    });
  });


  modal.querySelectorAll('[data-remove-linked]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeLinked, 10);
      currentPower.linkedEffects.splice(idx, 1);
      renderPowerStudio();
    });
  });

  // Linked Effect Base Effect Library Toggle
  modal.querySelectorAll('[data-toggle-linked-lib]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.toggleLinkedLib, 10);
      expandedLinkedLibIdx = (expandedLinkedLibIdx === idx) ? null : idx;
      renderPowerStudio();
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
    isNewSlotLibExpanded = false;
    newSlotBaseName = 'Damage';
    newSlotTempEffect = createEmptyEffect('Damage');
    renderPowerStudio();
  });

  modal.querySelector('#pb-cancel-add-slot')?.addEventListener('click', () => {
    isAddingAltSlot = false;
    isNewSlotLibExpanded = false;
    newSlotTempEffect = createEmptyEffect('Damage');
    renderPowerStudio();
  });

  modal.querySelector('#pb-toggle-new-slot-lib')?.addEventListener('click', () => {
    isNewSlotLibExpanded = !isNewSlotLibExpanded;
    renderPowerStudio();
  });

  modal.querySelectorAll('[data-toggle-slot-lib]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.toggleSlotLib, 10);
      expandedSlotLibIdx = (expandedSlotLibIdx === idx) ? null : idx;
      renderPowerStudio();
    });
  });

  modal.querySelector('#pb-duplicate-main-slot-btn')?.addEventListener('click', () => {
    const newSlot = createAlternateSlotFromEffect(currentPower.mainEffect, `${currentPower.name || currentPower.mainEffect.baseEffect} (Variant)`);
    currentPower.alternateEffects.push(newSlot);
    showToast(`Duplicated "${currentPower.mainEffect.name || currentPower.mainEffect.baseEffect}" into a new alternate slot!`, 'success');
    renderPowerStudio();
  });

  modal.querySelector('#pb-confirm-add-slot')?.addEventListener('click', () => {
    const baseName = newSlotBaseName || 'Damage';
    const slotName = modal.querySelector('#pb-new-slot-name')?.value.trim() || baseName;
    const ranks = Math.max(1, parseInt(modal.querySelector('#pb-new-slot-ranks')?.value, 10) || 1);
    const isDynamic = Boolean(modal.querySelector('#pb-new-slot-dynamic')?.checked);

    const slotEffect = normalizeEffect(newSlotTempEffect || createEmptyEffect(baseName));
    slotEffect.name = slotName;
    slotEffect.ranks = ranks;

    currentPower.alternateEffects.push({
      id: 'alt_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: slotName,
      isDynamic,
      effect: slotEffect
    });

    isAddingAltSlot = false;
    isNewSlotLibExpanded = false;
    newSlotBaseName = 'Damage';
    newSlotTempEffect = createEmptyEffect('Damage');
    showToast(`Added alternate effect slot "${slotName}" (${baseName})!`, 'success');
    renderPowerStudio();
  });

  // Array Active Slot Toggle
  modal.querySelectorAll('[data-toggle-active-slot]').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotId = btn.dataset.toggleActiveSlot;
      activeSlotId = (activeSlotId === slotId) ? null : slotId;
      showToast(activeSlotId ? 'Switched active Alternate Effect (Free Action)' : 'Reverted to Main Effect (Free Action)', 'info');
      renderPowerStudio();
    });
  });

  // Array Slot Dynamic / Standard Toggle
  modal.querySelectorAll('[data-set-slot-dynamic]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [aIdx, isDynamicStr] = btn.dataset.setSlotDynamic.split(':');
      const idx = parseInt(aIdx, 10);
      if (currentPower.alternateEffects[idx]) {
        currentPower.alternateEffects[idx].isDynamic = (isDynamicStr === 'true');
        renderPowerStudio();
      }
    });
  });

  // Array Slot Modifiers Toggle
  modal.querySelectorAll('[data-toggle-slot-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.toggleSlotMod, 10);
      expandedSlotIdx = (expandedSlotIdx === idx) ? null : idx;
      renderPowerStudio();
    });
  });


  modal.querySelectorAll('[data-remove-alt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeAlt, 10);
      currentPower.alternateEffects.splice(idx, 1);
      renderPowerStudio();
    });
  });

  // Array Slot Name inputs (inline rename per slot)
  modal.querySelectorAll('.pb-slot-name-input[data-slot-name-idx]').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(input.dataset.slotNameIdx, 10);
      if (currentPower.alternateEffects[idx]) {
        currentPower.alternateEffects[idx].name = e.target.value;
        if (currentPower.alternateEffects[idx].effect) {
          currentPower.alternateEffects[idx].effect.name = e.target.value;
        }
      }
    });
  });

  // Notes
  modal.querySelector('#pb-notes')?.addEventListener('input', (e) => {
    currentPower.notes = e.target.value;
  });

  // Configurable effect controls (Illusion, Enhanced Trait, Affliction, etc.)
  bindEffectConfigurationHandlers(modal);
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
        delete currentPower.mainEffect.config;
        currentPower.mainEffect = normalizeEffect(currentPower.mainEffect);
        if (!currentPower.name || BASE_EFFECTS.some(b => b.name === currentPower.name)) {
          currentPower.name = chosen.name;
        }
      }
      isEffectExplorerOpen = false;
      renderPowerStudio();
    });
  });
}

function updateAllEmbeddedLibraries(modal) {
  modal.querySelectorAll('.pb-embedded-library-section').forEach(sec => {
    const searchInput = sec.querySelector('.pb-target-search');
    const targetStr = searchInput?.dataset.searchTarget || 'main';
    const [targetType, targetIdxStr] = targetStr.split(':');
    const targetIdx = targetIdxStr !== undefined ? parseInt(targetIdxStr, 10) : null;

    let selectedName = 'Damage';
    if (targetType === 'main') {
      selectedName = currentPower?.mainEffect?.baseEffect || 'Damage';
    } else if (targetType === 'linked' && targetIdx !== null && currentPower?.linkedEffects[targetIdx]) {
      selectedName = currentPower.linkedEffects[targetIdx].baseEffect;
    } else if (targetType === 'new-slot') {
      selectedName = newSlotBaseName;
    } else if (targetType === 'slot' && targetIdx !== null && currentPower?.alternateEffects[targetIdx]) {
      selectedName = currentPower.alternateEffects[targetIdx].effect?.baseEffect || 'Damage';
    }

    const grid = sec.querySelector('.embedded-effect-grid');
    if (!grid) return;
    const filtered = getFilteredBaseEffects();
    const targetIdStr = targetIdx !== null ? `:${targetIdx}` : '';

    grid.innerHTML = filtered.map(eff => {
      const isSelected = eff.name === selectedName;
      const catClass = getCategoryClass(eff.category);
      return `
        <div class="embedded-eff-card ${isSelected ? 'active-selected' : ''}" data-select-target="${targetType}${targetIdStr}" data-select-base="${eff.name}">
          <div class="embedded-card-top">
            <span class="embedded-eff-name">${eff.name}</span>
            <div style="display:flex;gap:0.3rem;align-items:center;">
              <span class="effect-tag-pill ${catClass}">${eff.category || 'General'}</span>
              <span class="effect-tag-pill cost-pill">${eff.cost} PP/Rank</span>
            </div>
          </div>

          <div class="effect-tags-row" style="margin: 0.35rem 0;">
            <span class="effect-tag-pill"><i class="ri-flashlight-line"></i> ${eff.action}</span>
            <span class="effect-tag-pill"><i class="ri-focus-2-line"></i> ${eff.range}</span>
            <span class="effect-tag-pill"><i class="ri-time-line"></i> ${eff.duration}</span>
            ${eff.resistance ? `<span class="effect-tag-pill"><i class="ri-shield-line"></i> vs ${eff.resistance}</span>` : ''}
          </div>

          <p class="embedded-card-desc">${escapeHtml(eff.desc)}</p>

          <div class="embedded-card-footer">
            <span class="embedded-status-hint">
              ${isSelected ? '<i class="ri-checkbox-circle-fill"></i> Currently Active' : 'Click to select'}
            </span>
            <button class="btn btn-xs ${isSelected ? 'btn-secondary' : 'btn-primary'}" type="button">
              ${isSelected ? 'Selected' : 'Choose Effect'}
            </button>
          </div>
        </div>
      `;
    }).join('') + (filtered.length === 0 ? `
      <div class="empty-embedded-effects">
        No effects match "${escapeHtml(effectSearchQuery || effectCategoryFilter)}".
      </div>
    ` : '');
  });

  bindEmbeddedSelectButtons(modal);
}

function updateEmbeddedLibraryGrid(modal) {
  updateAllEmbeddedLibraries(modal);
}

function bindEmbeddedSelectButtons(modal) {
  modal.querySelectorAll('.embedded-eff-card[data-select-base]').forEach(card => {
    card.addEventListener('click', () => {
      const effName = card.dataset.selectBase;
      const targetStr = card.dataset.selectTarget || 'main';
      const [targetType, targetIdxStr] = targetStr.split(':');
      const targetIdx = targetIdxStr !== undefined ? parseInt(targetIdxStr, 10) : null;
      const chosen = BASE_EFFECTS.find(b => b.name === effName);
      if (!chosen) return;

      if (targetType === 'main') {
        currentPower.mainEffect.baseEffect = chosen.name;
        currentPower.mainEffect.name = chosen.name;
        currentPower.mainEffect.baseCost = chosen.cost;
        currentPower.mainEffect.range = chosen.range;
        currentPower.mainEffect.action = chosen.action;
        currentPower.mainEffect.duration = chosen.duration;
        currentPower.mainEffect.resistance = chosen.resistance || (chosen.name === 'Affliction' ? 'Fortitude' : 'Toughness');
        delete currentPower.mainEffect.config;
        currentPower.mainEffect = normalizeEffect(currentPower.mainEffect);
        if (!currentPower.name || BASE_EFFECTS.some(b => b.name === currentPower.name)) {
          currentPower.name = chosen.name;
        }
        showToast(`Main base effect changed to "${chosen.name}" (${chosen.cost} PP/Rank)`, 'success');
      } else if (targetType === 'linked' && targetIdx !== null && currentPower.linkedEffects[targetIdx]) {
        const linked = currentPower.linkedEffects[targetIdx];
        linked.baseEffect = chosen.name;
        linked.name = chosen.name;
        linked.baseCost = chosen.cost;
        delete linked.config;
        normalizeEffect(linked);
        // Auto sync range and action with main effect per M&M 3e rules
        syncLinkedEffectWithMain(currentPower.mainEffect, linked);
        expandedLinkedLibIdx = null;
        showToast(`Linked effect #${targetIdx + 1} updated to "${chosen.name}" and auto-synced with Main Effect!`, 'success');
      } else if (targetType === 'new-slot') {
        newSlotBaseName = chosen.name;
        newSlotTempEffect = createEmptyEffect(chosen.name);
        isNewSlotLibExpanded = false;
        const nameInput = modal.querySelector('#pb-new-slot-name');
        if (nameInput && (!nameInput.value || BASE_EFFECTS.some(b => b.name === nameInput.value))) {
          nameInput.value = chosen.name;
        }
        showToast(`Base effect for new slot set to "${chosen.name}"`, 'info');
      } else if (targetType === 'slot' && targetIdx !== null && currentPower.alternateEffects[targetIdx]) {
        const slot = currentPower.alternateEffects[targetIdx];
        if (slot.effect) {
          slot.effect.baseEffect = chosen.name;
          slot.effect.baseCost = chosen.cost;
          slot.effect.range = chosen.range;
          slot.effect.action = chosen.action;
          slot.effect.duration = chosen.duration;
          slot.effect.resistance = chosen.resistance || (chosen.name === 'Affliction' ? 'Fortitude' : 'Toughness');
          delete slot.effect.config;
          slot.effect = normalizeEffect(slot.effect);
          if (!slot.name || BASE_EFFECTS.some(b => b.name === slot.name)) {
            slot.name = chosen.name;
            slot.effect.name = chosen.name;
          }
        }
        expandedSlotLibIdx = null;
        showToast(`Alternate slot #${targetIdx + 1} base effect changed to "${chosen.name}"`, 'success');
      }

      renderPowerStudio();
    });
  });
}

function updateAllPaletteGrids(modal) {
  modal.querySelectorAll('.palette-scroll-grid').forEach(grid => {
    const targetStr = grid.dataset.gridModTarget || 'main';
    grid.innerHTML = renderPaletteCards(targetStr);
  });
  bindPaletteAddButtons(modal);
}

function updatePaletteGrid(modal) {
  updateAllPaletteGrids(modal);
}

function bindPaletteAddButtons(modal) {
  modal.querySelectorAll('[data-add-mod]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modName = btn.dataset.addMod;
      const modTab = btn.dataset.modTab || activeModifierTab;
      const targetStr = btn.dataset.addModTarget || 'main';
      const isExtra = modTab === 'extras';
      const ref = isExtra ? EXTRAS.find(e => e.name === modName) : FLAWS.find(f => f.name === modName);
      if (!ref) return;

      const targetList = getModifierTargetList(targetStr, isExtra ? 'extra' : 'flaw');
      if (!targetList) return;

      const existing = targetList.find(m => m.name === modName);

      if (existing && (ref.hasRanks || ref.type === 'flat_per_rank')) {
        existing.ranks = (existing.ranks || 1) + 1;
        showToast(`Increased "${modName}" to rank ${existing.ranks}`, 'info');
      } else if (!existing) {
        targetList.push(normalizeModifier({
          name: ref.name,
          cost: ref.cost,
          type: ref.type,
          desc: ref.desc,
          category: ref.category,
          ranks: 1
        }));
        showToast(`Added ${isExtra ? 'Extra' : 'Flaw'} "${modName}"`, 'success');
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

function getEffectTarget(targetStr) {
  if (!targetStr || targetStr === 'main') {
    return currentPower.mainEffect;
  }
  const [targetType, targetIdxStr] = targetStr.split(':');
  const targetIdx = targetIdxStr !== undefined ? parseInt(targetIdxStr, 10) : null;
  if (targetType === 'linked' && targetIdx !== null && currentPower.linkedEffects[targetIdx]) {
    return currentPower.linkedEffects[targetIdx];
  }
  if (targetType === 'slot' && targetIdx !== null && currentPower.alternateEffects[targetIdx]?.effect) {
    return currentPower.alternateEffects[targetIdx].effect;
  }
  if (targetType === 'new-slot') {
    return newSlotTempEffect;
  }
  return currentPower.mainEffect;
}

function bindEffectConfigurationHandlers(modal) {
  // 1. Illusion Sense Toggles
  modal.querySelectorAll('[data-config-sense]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const senseId = btn.dataset.configSense;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      let senses = Array.isArray(eff.config.senses) ? [...eff.config.senses] : ['Visual'];
      if (senses.includes(senseId)) {
        if (senses.length > 1) {
          senses = senses.filter(s => s !== senseId);
        } else {
          showToast('Illusion must affect at least 1 sense type', 'warning');
          return;
        }
      } else {
        senses.push(senseId);
      }
      eff.config.senses = senses;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 2. Enhanced Trait Category Buttons
  modal.querySelectorAll('[data-config-trait-cat]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const catId = btn.dataset.configTraitCat;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.traitCategory = catId;
      const catData = CONFIGURABLE_EFFECTS['Enhanced Trait']?.categories[catId];
      if (catData && catData.traits?.length > 0) {
        eff.config.traitName = catData.traits[0];
      }
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 3. Enhanced Trait Name Select
  modal.querySelectorAll('select[data-config-trait-name]').forEach(sel => {
    sel.addEventListener('change', () => {
      const targetStr = sel.dataset.configTraitName;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.traitName = sel.value;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 4. Affliction Presets
  modal.querySelectorAll('[data-config-aff-preset]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const presetId = btn.dataset.configAffPreset;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      const p = CONFIGURABLE_EFFECTS['Affliction']?.presets.find(pr => pr.id === presetId);
      if (p) {
        eff.config = eff.config || {};
        eff.config.preset = p.id;
        eff.config.resistance = p.res;
        eff.config.firstDegree = p.first;
        eff.config.secondDegree = p.second;
        eff.config.thirdDegree = p.third;
        eff.resistance = p.res;
        normalizeEffect(eff);
        showToast(`Affliction preset applied: ${p.name}`, 'info');
        renderPowerStudio();
      }
    });
  });

  // 5. Affliction Resistance Check Defense
  modal.querySelectorAll('[data-config-aff-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const res = btn.dataset.configAffRes;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.resistance = res;
      eff.resistance = res;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 6. Affliction Degree Selectors
  modal.querySelectorAll('select[data-config-aff-deg]').forEach(sel => {
    sel.addEventListener('change', () => {
      const degType = sel.dataset.configAffDeg;
      const targetStr = sel.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      if (degType === 'first') eff.config.firstDegree = sel.value;
      if (degType === 'second') eff.config.secondDegree = sel.value;
      if (degType === 'third') eff.config.thirdDegree = sel.value;
      eff.config.preset = 'custom';
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 7. Universal Multi-Select Option Library Handlers (Movement, Immunity, Comprehend, Environment, Senses)
  // 7a. Card Click Toggle
  modal.querySelectorAll('[data-opt-toggle]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const optId = card.dataset.optToggle;
      const targetStr = card.dataset.configTarget;
      const effectType = card.dataset.optType;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};

      if (effectType === 'movement') {
        let modes = Array.isArray(eff.config.selectedModes) ? [...eff.config.selectedModes] : [{ id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 }];
        const idx = modes.findIndex(m => (typeof m === 'object' ? m.id === optId : m === optId));
        if (idx >= 0) {
          if (modes.length <= 1) {
            showToast('Movement must have at least 1 mode selected', 'warning');
            return;
          }
          modes.splice(idx, 1);
        } else {
          const itemDef = CONFIGURABLE_EFFECTS.Movement?.modes?.find(m => m.id === optId);
          modes.push({ id: optId, name: itemDef?.name || optId, ranks: 1 });
        }
        eff.config.selectedModes = modes;
      } else if (effectType === 'immunity') {
        let presets = Array.isArray(eff.config.selectedPresets) ? [...eff.config.selectedPresets] : ['life_support'];
        if (presets.includes(optId)) {
          if (presets.length <= 1) {
            showToast('Immunity must have at least 1 scope selected', 'warning');
            return;
          }
          presets = presets.filter(p => p !== optId);
        } else {
          presets.push(optId);
        }
        eff.config.selectedPresets = presets;
      } else if (effectType === 'comprehend') {
        let modes = Array.isArray(eff.config.selectedModes) ? [...eff.config.selectedModes] : ['languages_understand'];
        if (modes.includes(optId)) {
          if (modes.length <= 1) {
            showToast('Comprehend must have at least 1 mode selected', 'warning');
            return;
          }
          modes = modes.filter(m => m !== optId);
        } else {
          modes.push(optId);
        }
        eff.config.selectedModes = modes;
      } else if (effectType === 'environment') {
        let elements = Array.isArray(eff.config.selectedElements) ? [...eff.config.selectedElements] : ['cold_1'];
        if (elements.includes(optId)) {
          if (elements.length <= 1) {
            showToast('Environment must have at least 1 hazard selected', 'warning');
            return;
          }
          elements = elements.filter(el => el !== optId);
        } else {
          elements.push(optId);
        }
        eff.config.selectedElements = elements;
      } else if (effectType === 'senses') {
        let faculties = Array.isArray(eff.config.selectedFaculties) ? [...eff.config.selectedFaculties] : ['darkvision'];
        if (faculties.includes(optId)) {
          if (faculties.length <= 1) {
            showToast('Senses must have at least 1 faculty selected', 'warning');
            return;
          }
          faculties = faculties.filter(f => f !== optId);
        } else {
          faculties.push(optId);
        }
        eff.config.selectedFaculties = faculties;
      }

      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 7b. Chip Remove Button
  modal.querySelectorAll('[data-opt-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const optId = btn.dataset.optRemove;
      const targetStr = btn.dataset.configTarget;
      const effectType = btn.dataset.optType;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};

      if (effectType === 'movement') {
        let modes = Array.isArray(eff.config.selectedModes) ? [...eff.config.selectedModes] : [{ id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 }];
        const idx = modes.findIndex(m => (typeof m === 'object' ? m.id === optId : m === optId));
        if (idx >= 0) {
          if (modes.length <= 1) {
            showToast('Movement must have at least 1 mode selected', 'warning');
            return;
          }
          modes.splice(idx, 1);
          eff.config.selectedModes = modes;
        }
      } else if (effectType === 'immunity') {
        let presets = Array.isArray(eff.config.selectedPresets) ? [...eff.config.selectedPresets] : ['life_support'];
        if (presets.includes(optId)) {
          if (presets.length <= 1) {
            showToast('Immunity must have at least 1 scope selected', 'warning');
            return;
          }
          presets = presets.filter(p => p !== optId);
          eff.config.selectedPresets = presets;
        }
      } else if (effectType === 'comprehend') {
        let modes = Array.isArray(eff.config.selectedModes) ? [...eff.config.selectedModes] : ['languages_understand'];
        if (modes.includes(optId)) {
          if (modes.length <= 1) {
            showToast('Comprehend must have at least 1 mode selected', 'warning');
            return;
          }
          modes = modes.filter(m => m !== optId);
          eff.config.selectedModes = modes;
        }
      } else if (effectType === 'environment') {
        let elements = Array.isArray(eff.config.selectedElements) ? [...eff.config.selectedElements] : ['cold_1'];
        if (elements.includes(optId)) {
          if (elements.length <= 1) {
            showToast('Environment must have at least 1 hazard selected', 'warning');
            return;
          }
          elements = elements.filter(el => el !== optId);
          eff.config.selectedElements = elements;
        }
      } else if (effectType === 'senses') {
        let faculties = Array.isArray(eff.config.selectedFaculties) ? [...eff.config.selectedFaculties] : ['darkvision'];
        if (faculties.includes(optId)) {
          if (faculties.length <= 1) {
            showToast('Senses must have at least 1 faculty selected', 'warning');
            return;
          }
          faculties = faculties.filter(f => f !== optId);
          eff.config.selectedFaculties = faculties;
        }
      }

      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 7c. Rank Steppers (Movement)
  modal.querySelectorAll('[data-opt-rank-inc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const optId = btn.dataset.optRankInc;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff || !Array.isArray(eff.config?.selectedModes)) return;

      const modeObj = eff.config.selectedModes.find(m => (typeof m === 'object' ? m.id === optId : m === optId));
      if (!modeObj) return;

      const modeDef = CONFIGURABLE_EFFECTS.Movement?.modes?.find(m => m.id === optId);
      const maxR = modeDef?.maxRanks || 3;
      const currentR = typeof modeObj === 'object' ? (Number(modeObj.ranks) || 1) : 1;

      if (currentR < maxR) {
        if (typeof modeObj === 'object') {
          modeObj.ranks = currentR + 1;
        }
        normalizeEffect(eff);
        renderPowerStudio();
      } else {
        showToast(`Maximum rank for ${modeDef?.name || 'this mode'} is ${maxR}`, 'info');
      }
    });
  });

  modal.querySelectorAll('[data-opt-rank-dec]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const optId = btn.dataset.optRankDec;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff || !Array.isArray(eff.config?.selectedModes)) return;

      const modeObj = eff.config.selectedModes.find(m => (typeof m === 'object' ? m.id === optId : m === optId));
      if (!modeObj) return;

      const currentR = typeof modeObj === 'object' ? (Number(modeObj.ranks) || 1) : 1;
      if (currentR > 1) {
        if (typeof modeObj === 'object') {
          modeObj.ranks = currentR - 1;
        }
        normalizeEffect(eff);
        renderPowerStudio();
      }
    });
  });

  // 7d. Real-Time Search Filtering
  modal.querySelectorAll('.opt-search-input').forEach(input => {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const targetStr = input.dataset.configTarget;
      const effectType = input.dataset.optType;
      const stateKey = `${targetStr}:${effectType}`;
      optLibSearchState[stateKey] = q;

      const activeCat = optLibCatState[stateKey] || 'all';
      const grid = modal.querySelector(`.opt-card-grid[data-opt-grid="${stateKey}"]`);
      if (!grid) return;

      grid.querySelectorAll('.opt-lib-card').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const desc = (card.dataset.desc || '').toLowerCase();
        const cardCat = card.dataset.cat || 'all';

        const matchCat = activeCat === 'all' || cardCat === activeCat;
        const matchSearch = !q || name.includes(q) || desc.includes(q);
        card.style.display = (matchCat && matchSearch) ? '' : 'none';
      });
    });
  });

  // 7e. Category Filter Pills
  modal.querySelectorAll('.opt-cat-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const catId = btn.dataset.optCat;
      const targetStr = btn.dataset.configTarget;
      const effectType = btn.dataset.optType;
      const stateKey = `${targetStr}:${effectType}`;
      optLibCatState[stateKey] = catId;

      const toolbar = btn.closest('.opt-cat-pills');
      if (toolbar) {
        toolbar.querySelectorAll('.opt-cat-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
      }

      const q = (optLibSearchState[stateKey] || '').toLowerCase().trim();
      const grid = modal.querySelector(`.opt-card-grid[data-opt-grid="${stateKey}"]`);
      if (!grid) return;

      grid.querySelectorAll('.opt-lib-card').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const desc = (card.dataset.desc || '').toLowerCase();
        const cardCat = card.dataset.cat || 'all';

        const matchCat = catId === 'all' || cardCat === catId;
        const matchSearch = !q || name.includes(q) || desc.includes(q);
        card.style.display = (matchCat && matchSearch) ? '' : 'none';
      });
    });
  });

  // 10. Morph Scope Pills
  modal.querySelectorAll('[data-config-morph-scope]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scope = parseInt(btn.dataset.configMorphScope, 10);
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.scope = scope;
      eff.ranks = scope;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 11. Weaken Resistance & Trait
  modal.querySelectorAll('[data-config-weaken-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const res = btn.dataset.configWeakenRes;
      const targetStr = btn.dataset.configTarget;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.resistance = res;
      eff.resistance = res;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });
  modal.querySelectorAll('select[data-config-weaken-trait]').forEach(sel => {
    sel.addEventListener('change', () => {
      const targetStr = sel.dataset.configWeakenTrait;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.traitName = sel.value;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });

  // 12. Nullify Descriptor Select & Custom
  modal.querySelectorAll('select[data-config-descriptor]').forEach(sel => {
    sel.addEventListener('change', () => {
      const targetStr = sel.dataset.configDescriptor;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.descriptor = sel.value;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });
  modal.querySelectorAll('input[data-config-descriptor-custom]').forEach(inp => {
    inp.addEventListener('input', () => {
      const targetStr = inp.dataset.configDescriptorCustom;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.customDescriptor = inp.value;
    });
  });



  // 16. Variable Theme
  modal.querySelectorAll('select[data-config-variable-theme]').forEach(sel => {
    sel.addEventListener('change', () => {
      const targetStr = sel.dataset.configVariableTheme;
      const eff = getEffectTarget(targetStr);
      if (!eff) return;
      eff.config = eff.config || {};
      eff.config.theme = sel.value;
      normalizeEffect(eff);
      renderPowerStudio();
    });
  });
}
