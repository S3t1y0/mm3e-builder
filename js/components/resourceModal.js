// js/components/resourceModal.js
import { store } from '../state.js';
import {
  RESOURCE_CATEGORIES,
  RESOURCE_PRESETS,
  WEAPON_TRAITS,
  VEHICLE_SIZES,
  VEHICLE_FEATURES,
  HQ_FEATURES
} from '../rules/resources.js';
import { showToast } from './notifications.js';

let activeTab = 'presets'; // 'presets' or 'custom'
let presetCategory = 'all';
let presetSearchQuery = '';
let editingResourceId = null;

// Custom builder form state
let formSubtypeMode = 'weapon'; // 'weapon' | 'armor' | 'gadget' | 'vehicle' | 'headquarters'
let formName = '';
let formEpCost = 4;
let formDesc = '';

let weaponState = {
  range: 'Close',
  isStrengthBased: true,
  damageRank: 3,
  crit: '20',
  attackBonus: 0,
  traits: []
};

let armorState = {
  isShield: false,
  protectionRank: 4,
  isSubtle: false,
  activeDefenseBonus: 2,
  imperviousRank: 0
};

let vehicleState = {
  size: 'Large',
  str: 5,
  speedRank: 5,
  speedType: 'Ground',
  defense: 8,
  toughness: 8,
  impervious: 0,
  features: ['Navigation System (GPS)']
};

let hqState = {
  size: 'Large',
  toughness: 8,
  features: ['Computer Mainframe', 'Living Space', 'Security System']
};

export function openResourceModal(resourceToEdit = null, defaultType = 'Gear') {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;

  if (resourceToEdit) {
    editingResourceId = resourceToEdit.id || null;
    activeTab = 'custom';
    formName = resourceToEdit.name || '';
    formEpCost = resourceToEdit.epCost || 1;
    formDesc = resourceToEdit.desc || '';

    // Infer builder mode
    if (resourceToEdit.subtype?.startsWith('weapon') || resourceToEdit.weapon) {
      formSubtypeMode = 'weapon';
      const w = resourceToEdit.weapon || {};
      weaponState = {
        range: w.range || (/Ranged/i.test(resourceToEdit.desc) ? 'Ranged' : 'Close'),
        isStrengthBased: w.isStrengthBased ?? (/Strength-based/i.test(resourceToEdit.desc)),
        damageRank: w.damageRank ?? (parseInt(resourceToEdit.desc?.match(/Damage\s+(\d+)/i)?.[1], 10) || 3),
        crit: w.crit || '20',
        attackBonus: w.attackBonus || 0,
        traits: Array.isArray(w.traits) ? [...w.traits] : []
      };
    } else if (resourceToEdit.subtype === 'armor' || resourceToEdit.subtype === 'shield' || resourceToEdit.armor) {
      formSubtypeMode = 'armor';
      const a = resourceToEdit.armor || {};
      armorState = {
        isShield: resourceToEdit.subtype === 'shield' || /shield/i.test(resourceToEdit.name),
        protectionRank: a.protectionRank ?? (parseInt(resourceToEdit.desc?.match(/Protection\s+(\d+)/i)?.[1], 10) || 4),
        isSubtle: a.isSubtle ?? (/subtle/i.test(resourceToEdit.desc)),
        activeDefenseBonus: a.activeDefenseBonus || 2,
        imperviousRank: a.imperviousRank || 0
      };
    } else if (resourceToEdit.type === 'Vehicle' || resourceToEdit.vehicle) {
      formSubtypeMode = 'vehicle';
      const v = resourceToEdit.vehicle || {};
      vehicleState = {
        size: v.size || 'Large',
        str: v.str || 5,
        speedRank: v.speedRank || 5,
        speedType: v.speedType || 'Ground',
        defense: v.defense || 8,
        toughness: v.toughness || 8,
        impervious: v.impervious || 0,
        features: Array.isArray(v.features) ? [...v.features] : ['Navigation System (GPS)']
      };
    } else if (resourceToEdit.type === 'Headquarters' || resourceToEdit.hq) {
      formSubtypeMode = 'headquarters';
      const h = resourceToEdit.hq || {};
      hqState = {
        size: h.size || 'Large',
        toughness: h.toughness || 8,
        features: Array.isArray(h.features) ? [...h.features] : ['Computer Mainframe', 'Living Space', 'Security System']
      };
    } else {
      formSubtypeMode = 'gadget';
    }
  } else {
    editingResourceId = null;
    activeTab = 'presets';
    formName = '';

    if (defaultType === 'Vehicle') {
      formSubtypeMode = 'vehicle';
      presetCategory = 'Vehicle';
    } else if (defaultType === 'Headquarters') {
      formSubtypeMode = 'headquarters';
      presetCategory = 'Headquarters';
    } else if (defaultType === 'Gadget') {
      formSubtypeMode = 'gadget';
      presetCategory = 'Gadget';
    } else {
      formSubtypeMode = 'weapon';
      presetCategory = 'all';
    }

    formDesc = '';
    recalcCustomEp();
  }

  presetSearchQuery = '';
  renderModal();
  modal.classList.add('open');

  setTimeout(() => {
    const input = activeTab === 'presets'
      ? modal.querySelector('#res-preset-search')
      : modal.querySelector('#input-res-name');
    if (input) input.focus();
  }, 50);
}

export function closeResourceModal() {
  const modal = document.getElementById('resource-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function getSpeedMph(rank) {
  const table = {
    0: '2 MPH', 1: '4 MPH', 2: '8 MPH', 3: '16 MPH', 4: '30 MPH',
    5: '60 MPH', 6: '120 MPH', 7: '250 MPH', 8: '500 MPH', 9: '1,000 MPH', 10: '2,000 MPH'
  };
  return table[rank] || `${Math.pow(2, rank)} MPH`;
}

function recalcCustomEp() {
  if (formSubtypeMode === 'weapon') {
    let cost = weaponState.range === 'Ranged' ? (weaponState.damageRank * 2) : weaponState.damageRank;
    if (weaponState.crit === '19-20') cost += 1;
    if (weaponState.crit === '18-20') cost += 2;
    if (weaponState.attackBonus > 0) cost += weaponState.attackBonus;
    for (const t of weaponState.traits) {
      const traitObj = WEAPON_TRAITS.find(item => item.id === t);
      cost += (traitObj ? traitObj.cost : 1);
    }
    formEpCost = Math.max(1, cost);
  } else if (formSubtypeMode === 'armor') {
    if (armorState.isShield) {
      formEpCost = Math.max(1, (armorState.activeDefenseBonus * 2) + (armorState.protectionRank || 0));
    } else {
      let cost = armorState.protectionRank;
      if (armorState.isSubtle) cost += 1;
      if (armorState.imperviousRank > 0) cost += armorState.imperviousRank;
      formEpCost = Math.max(1, cost);
    }
  } else if (formSubtypeMode === 'vehicle') {
    const sizeObj = VEHICLE_SIZES.find(s => s.size === vehicleState.size) || VEHICLE_SIZES[4];
    let cost = Math.max(1, 10 + sizeObj.epCost + (vehicleState.speedRank * 2) + vehicleState.features.length);
    if (vehicleState.impervious > 0) cost += vehicleState.impervious;
    formEpCost = cost;
  } else if (formSubtypeMode === 'headquarters') {
    const sizeCostMap = { Small: 1, Medium: 2, Large: 3, Huge: 4, Gargantuan: 5, Colossal: 6 };
    let sizeCost = sizeCostMap[hqState.size] || 3;
    let baseToughness = 6 + (sizeCost * 2);
    let toughExtra = Math.max(0, Math.ceil((hqState.toughness - baseToughness) / 2));
    formEpCost = Math.max(1, sizeCost + toughExtra + hqState.features.length);
  }
}

function getFilteredPresets() {
  return RESOURCE_PRESETS.filter(p => {
    let matchesCat = true;
    if (presetCategory === 'Weapons') {
      matchesCat = p.subtype?.startsWith('weapon') || p.weapon != null;
    } else if (presetCategory === 'Armor') {
      matchesCat = p.subtype === 'armor' || p.subtype === 'shield' || p.armor != null;
    } else if (presetCategory === 'Gadget') {
      matchesCat = p.type === 'Gadget' || p.subtype === 'gadget';
    } else if (presetCategory === 'Vehicle') {
      matchesCat = p.type === 'Vehicle' || p.subtype === 'vehicle';
    } else if (presetCategory === 'Headquarters') {
      matchesCat = p.type === 'Headquarters' || p.subtype === 'headquarters';
    } else if (presetCategory !== 'all') {
      matchesCat = p.type === presetCategory;
    }

    const matchesSearch = !presetSearchQuery ||
      p.name.toLowerCase().includes(presetSearchQuery.toLowerCase()) ||
      (p.desc && p.desc.toLowerCase().includes(presetSearchQuery.toLowerCase())) ||
      (p.weapon?.traits && p.weapon.traits.some(t => t.toLowerCase().includes(presetSearchQuery.toLowerCase()))) ||
      (p.vehicle?.features && p.vehicle.features.some(f => f.toLowerCase().includes(presetSearchQuery.toLowerCase()))) ||
      (p.hq?.features && p.hq.features.some(f => f.toLowerCase().includes(presetSearchQuery.toLowerCase())));

    return matchesCat && matchesSearch;
  });
}

function renderModal() {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;

  const budget = store.getEquipmentBudgetInfo();

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="icon"><i class="ri-briefcase-line"></i></span>
          <div>
            <h3>${editingResourceId ? 'Edit Equipment / Resource' : 'Equipment & Resources Workshop'}</h3>
            <p class="modal-subtitle">Weapons, protective armor, high-tech vehicles, and secret bases (5 EP = 1 PP)</p>
          </div>
        </div>
        <div class="modal-header-actions">
          <span class="ep-budget-indicator ${budget.isOverBudget ? 'over' : 'ok'}">
            Capacity: ${budget.totalEP} / ${budget.maxEP} EP (${budget.ranks} Equipment ranks)
          </span>
          <button class="modal-close-btn" id="btn-close-res-modal"><i class="ri-close-line"></i></button>
        </div>
      </div>

      <!-- TAB SELECTION -->
      <div class="modal-subtabs-bar">
        <button class="modal-subtab-btn ${activeTab === 'presets' ? 'active' : ''}" id="tab-res-presets">
          <i class="ri-book-open-line"></i> Official M&M 3e Presets (${RESOURCE_PRESETS.length})
        </button>
        <button class="modal-subtab-btn ${activeTab === 'custom' ? 'active' : ''}" id="tab-res-custom">
          <i class="ri-tools-line"></i> ${editingResourceId ? 'Edit Item' : 'Interactive Custom Builder'}
        </button>
      </div>

      <div class="modal-body" id="res-modal-body"></div>
      <div class="modal-footer" id="res-modal-footer"></div>
    </div>
  `;

  // Modal close handlers
  modal.querySelector('#btn-close-res-modal')?.addEventListener('click', closeResourceModal);

  // Tab switching
  modal.querySelector('#tab-res-presets')?.addEventListener('click', () => {
    if (activeTab !== 'presets') {
      activeTab = 'presets';
      updateSubtabButtons();
      renderModalBody(true);
    }
  });

  modal.querySelector('#tab-res-custom')?.addEventListener('click', () => {
    if (activeTab !== 'custom') {
      activeTab = 'custom';
      updateSubtabButtons();
      renderModalBody(true);
    }
  });

  renderModalBody(false);
}

function updateSubtabButtons() {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;
  modal.querySelector('#tab-res-presets')?.classList.toggle('active', activeTab === 'presets');
  modal.querySelector('#tab-res-custom')?.classList.toggle('active', activeTab === 'custom');
}

function renderModalBody(animate = false) {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;

  const body = modal.querySelector('#res-modal-body');
  const footer = modal.querySelector('#res-modal-footer');
  if (!body || !footer) return;

  if (activeTab === 'presets') {
    body.innerHTML = `
      <div class="presets-toolbar">
        <div class="palette-search-box flex-1">
          <span class="search-icon"><i class="ri-search-line"></i></span>
          <input
            type="text"
            id="res-preset-search"
            class="palette-search"
            placeholder="Search 60+ weapons, armors, vehicles, secret headquarters..."
            value="${presetSearchQuery}"
          />
        </div>

        <div class="filter-pills-bar">
          ${RESOURCE_CATEGORIES.map(c => `
            <button class="filter-chip ${presetCategory === c.id ? 'active' : ''}" data-res-cat="${c.id}">
              <i class="${c.icon}"></i> ${c.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="presets-cards-grid" id="presets-cards-grid"></div>
    `;

    footer.innerHTML = `
      <button class="btn btn-ghost" id="btn-cancel-res-modal">Close</button>
      <button class="btn btn-secondary" id="btn-goto-custom">
        <i class="ri-magic-line"></i> Open Custom Item Builder
      </button>
    `;

    // Presets search
    const presetSearch = body.querySelector('#res-preset-search');
    if (presetSearch) {
      presetSearch.addEventListener('input', (e) => {
        presetSearchQuery = e.target.value;
        renderPresetsGrid(false);
      });
    }

    // Category filter pills
    body.querySelectorAll('[data-res-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        presetCategory = btn.dataset.resCat;
        body.querySelectorAll('[data-res-cat]').forEach(b => {
          b.classList.toggle('active', b.dataset.resCat === presetCategory);
        });
        renderPresetsGrid(true);
      });
    });

    renderPresetsGrid(animate);
  } else {
    // Custom Builder Tab
    renderCustomBuilderForm(body, footer, animate);
  }

  // Footer cancel & goto-custom
  footer.querySelector('#btn-cancel-res-modal')?.addEventListener('click', closeResourceModal);
  footer.querySelector('#btn-goto-custom')?.addEventListener('click', () => {
    activeTab = 'custom';
    updateSubtabButtons();
    renderModalBody(true);
  });
}

function renderCustomBuilderForm(body, footer, animate = false) {
  body.innerHTML = `
    <div class="custom-res-form ${animate ? 'category-content-animate' : ''}" id="custom-res-form">
      
      <!-- SUBTYPE SELECTOR -->
      <div class="res-subtype-selector-row">
        <label class="form-label" style="margin-bottom: 0.35rem; display: block; font-weight: 700;">Equipment Blueprint Type:</label>
        <div class="filter-pills-bar">
          <button type="button" class="filter-chip ${formSubtypeMode === 'weapon' ? 'active' : ''}" data-set-subtype="weapon">
            <i class="ri-sword-line"></i> Weapon
          </button>
          <button type="button" class="filter-chip ${formSubtypeMode === 'armor' ? 'active' : ''}" data-set-subtype="armor">
            <i class="ri-shield-line"></i> Armor / Shield
          </button>
          <button type="button" class="filter-chip ${formSubtypeMode === 'vehicle' ? 'active' : ''}" data-set-subtype="vehicle">
            <i class="ri-car-line"></i> Vehicle
          </button>
          <button type="button" class="filter-chip ${formSubtypeMode === 'headquarters' ? 'active' : ''}" data-set-subtype="headquarters">
            <i class="ri-building-line"></i> Headquarters
          </button>
          <button type="button" class="filter-chip ${formSubtypeMode === 'gadget' ? 'active' : ''}" data-set-subtype="gadget">
            <i class="ri-smartphone-line"></i> General Gadget
          </button>
        </div>
      </div>

      <!-- BASIC ITEM NAME & EP OVERVIEW -->
      <div class="field-row-grid mt-3">
        <div class="field-group flex-2">
          <label class="form-label">Item / Equipment Name:</label>
          <input
            type="text"
            id="input-res-name"
            class="text-input"
            placeholder="e.g., Tactical Katana, Heavy Assault Van, Hidden Bunker..."
            value="${formName}"
          />
        </div>

        <div class="field-group flex-1">
          <label class="form-label">Equipment Point (EP) Cost:</label>
          <div class="ep-stepper-wrap">
            <button type="button" class="step-btn-large" id="btn-ep-dec">-</button>
            <div class="ep-val-display">
              <span class="ep-num" id="display-ep-num">${formEpCost}</span>
              <span class="ep-unit">EP</span>
            </div>
            <button type="button" class="step-btn-large" id="btn-ep-inc">+</button>
          </div>
          <span class="text-muted text-xs mt-1" style="display: block;">
            Cost: ~${Math.ceil(formEpCost / 5)} PP (${formEpCost} EP)
          </span>
        </div>
      </div>

      <!-- SUBTYPE SPECIFIC BUILDER CONTAINER -->
      <div class="subtype-builder-panel mt-3" id="subtype-builder-panel">
        ${renderSubtypeBuilderHtml()}
      </div>

      <!-- DESCRIPTION & NOTES -->
      <div class="field-group mt-3">
        <label class="form-label">Rules Description & Narrative Notes:</label>
        <textarea
          id="textarea-res-desc"
          class="text-input"
          rows="3"
          placeholder="Specifications, appearance, special tactical capabilities..."
        >${formDesc}</textarea>
      </div>

    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-ghost" id="btn-cancel-res-modal">Cancel</button>
    <button class="btn btn-primary" id="btn-save-custom-res">
      <i class="ri-check-line"></i> ${editingResourceId ? 'Save Changes' : '+ Add to Library'}
    </button>
  `;

  // Bind Subtype switcher
  body.querySelectorAll('[data-set-subtype]').forEach(btn => {
    btn.addEventListener('click', () => {
      formSubtypeMode = btn.dataset.setSubtype;
      recalcCustomEp();
      renderCustomBuilderForm(body, footer, false);
    });
  });

  // Name input
  const inputName = body.querySelector('#input-res-name');
  if (inputName) {
    inputName.addEventListener('input', (e) => {
      formName = e.target.value;
    });
  }

  // Desc input
  const textDesc = body.querySelector('#textarea-res-desc');
  if (textDesc) {
    textDesc.addEventListener('input', (e) => {
      formDesc = e.target.value;
    });
  }

  // Manual EP Stepper
  const epDisplay = body.querySelector('#display-ep-num');
  body.querySelector('#btn-ep-dec')?.addEventListener('click', () => {
    if (formEpCost > 1) {
      formEpCost--;
      if (epDisplay) epDisplay.textContent = formEpCost;
    }
  });

  body.querySelector('#btn-ep-inc')?.addEventListener('click', () => {
    formEpCost++;
    if (epDisplay) epDisplay.textContent = formEpCost;
  });

  // Bind specific builder events
  bindSubtypeBuilderEvents(body);

  // Save button
  footer.querySelector('#btn-save-custom-res')?.addEventListener('click', () => {
    if (!formName.trim()) {
      showToast('Please enter an item / equipment name!', 'warning');
      body.querySelector('#input-res-name')?.focus();
      return;
    }

    const trimmedName = formName.trim();
    let finalType = 'Gear';
    let finalSubtype = 'gear';
    let weaponObj = null;
    let armorObj = null;
    let vehicleObj = null;
    let hqObj = null;

    if (formSubtypeMode === 'weapon') {
      finalType = 'Gear';
      finalSubtype = weaponState.range === 'Ranged' ? 'weapon_ranged' : 'weapon_melee';
      weaponObj = {
        isStrengthBased: weaponState.isStrengthBased,
        damageRank: weaponState.damageRank,
        attackBonus: weaponState.attackBonus,
        range: weaponState.range,
        crit: weaponState.crit,
        resistance: weaponState.traits.includes('Affliction') ? 'Fortitude' : 'Toughness',
        traits: [...weaponState.traits]
      };
      if (weaponState.range === 'Ranged') {
        weaponObj.shortRange = weaponState.damageRank * 25;
        weaponObj.mediumRange = weaponState.damageRank * 50;
        weaponObj.longRange = weaponState.damageRank * 100;
      }
    } else if (formSubtypeMode === 'armor') {
      finalType = 'Gear';
      finalSubtype = armorState.isShield ? 'shield' : 'armor';
      armorObj = {
        protectionRank: armorState.isShield ? 0 : armorState.protectionRank,
        isSubtle: armorState.isSubtle,
        activeDefenseBonus: armorState.isShield ? armorState.activeDefenseBonus : 0,
        imperviousRank: armorState.imperviousRank
      };
    } else if (formSubtypeMode === 'vehicle') {
      finalType = 'Vehicle';
      finalSubtype = 'vehicle';
      vehicleObj = {
        size: vehicleState.size,
        str: vehicleState.str,
        speedRank: vehicleState.speedRank,
        speedType: vehicleState.speedType,
        speedMph: getSpeedMph(vehicleState.speedRank),
        defense: vehicleState.defense,
        toughness: vehicleState.toughness,
        impervious: vehicleState.impervious,
        features: [...vehicleState.features]
      };
    } else if (formSubtypeMode === 'headquarters') {
      finalType = 'Headquarters';
      finalSubtype = 'headquarters';
      hqObj = {
        size: hqState.size,
        toughness: hqState.toughness,
        features: [...hqState.features]
      };
    } else {
      finalType = 'Gadget';
      finalSubtype = 'gadget';
    }

    const payload = {
      name: trimmedName,
      type: finalType,
      subtype: finalSubtype,
      epCost: formEpCost,
      desc: formDesc.trim() || generateDefaultDesc(finalSubtype, weaponObj, armorObj, vehicleObj, hqObj),
      status: 'equipped',
      weapon: weaponObj,
      armor: armorObj,
      vehicle: vehicleObj,
      hq: hqObj
    };

    if (editingResourceId) {
      store.updateResource(editingResourceId, payload);
      showToast(`"${trimmedName}" updated successfully!`, 'success');
    } else {
      store.addResource(payload);
      showToast(`"${trimmedName}" added to library!`, 'success');
    }

    closeResourceModal();
  });
}

function generateDefaultDesc(subtype, weapon, armor, vehicle, hq) {
  if (weapon) {
    const rangeText = weapon.range === 'Ranged' ? 'Ranged' : (weapon.isStrengthBased ? 'Strength-based' : 'Close');
    return `${rangeText} Damage ${weapon.damageRank}, Crit ${weapon.crit}${weapon.traits.length > 0 ? ', ' + weapon.traits.join(', ') : ''}.`;
  }
  if (armor) {
    if (armor.activeDefenseBonus > 0) return `Active Defense +${armor.activeDefenseBonus} (Dodge/Parry).`;
    return `Protection ${armor.protectionRank}${armor.isSubtle ? ' (Subtle)' : ''}${armor.imperviousRank > 0 ? `, Impervious ${armor.imperviousRank}` : ''}.`;
  }
  if (vehicle) {
    return `Size: ${vehicle.size}, Str: ${vehicle.str}, Speed: ${vehicle.speedRank} (${vehicle.speedMph}), Defense: ${vehicle.defense}, Toughness: ${vehicle.toughness}.`;
  }
  if (hq) {
    return `Size: ${hq.size}, Toughness: ${hq.toughness}, Features: ${hq.features.join(', ')}.`;
  }
  return 'Tactical equipment resource.';
}

function renderSubtypeBuilderHtml() {
  if (formSubtypeMode === 'weapon') {
    return `
      <div class="sheet-card" style="padding: 1rem; border-color: rgba(56, 189, 248, 0.3);">
        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--accent-secondary);"><i class="ri-sword-line"></i> Weapon Tactical Specifications</h4>
        <div class="field-row-grid">
          <div class="field-group flex-1">
            <label class="form-label">Range Type:</label>
            <select id="weap-select-range" class="text-input">
              <option value="Close" ${weaponState.range === 'Close' ? 'selected' : ''}>Close (Melee)</option>
              <option value="Ranged" ${weaponState.range === 'Ranged' ? 'selected' : ''}>Ranged (Firearm / Thrown)</option>
            </select>
          </div>

          <div class="field-group flex-1">
            <label class="form-label">Damage Rank:</label>
            <div class="ep-stepper-wrap">
              <button type="button" class="step-btn-large" id="btn-dmg-dec">-</button>
              <div class="ep-val-display"><span class="ep-num">${weaponState.damageRank}</span></div>
              <button type="button" class="step-btn-large" id="btn-dmg-inc">+</button>
            </div>
          </div>

          <div class="field-group flex-1">
            <label class="form-label">Critical Range:</label>
            <select id="weap-select-crit" class="text-input">
              <option value="20" ${weaponState.crit === '20' ? 'selected' : ''}>20 (Standard)</option>
              <option value="19-20" ${weaponState.crit === '19-20' ? 'selected' : ''}>19-20 (+1 EP)</option>
              <option value="18-20" ${weaponState.crit === '18-20' ? 'selected' : ''}>18-20 (+2 EP)</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 0.75rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" id="chk-weap-str" ${weaponState.isStrengthBased ? 'checked' : ''} />
            <span>Strength-based (Adds STR to Damage DC)</span>
          </label>
        </div>

        <!-- WEAPON TRAITS -->
        <div style="margin-top: 1rem;">
          <label class="form-label">Weapon Modifiers & Traits:</label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5rem; margin-top: 0.35rem;">
            ${WEAPON_TRAITS.map(t => `
              <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; background: rgba(255,255,255,0.03); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
                <input type="checkbox" class="chk-weap-trait" value="${t.id}" ${weaponState.traits.includes(t.id) ? 'checked' : ''} />
                <span>${t.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (formSubtypeMode === 'armor') {
    return `
      <div class="sheet-card" style="padding: 1rem; border-color: rgba(16, 185, 129, 0.3);">
        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--accent-emerald);"><i class="ri-shield-line"></i> Armor & Protection Specifications</h4>
        <div class="field-row-grid">
          <div class="field-group flex-1">
            <label class="form-label">Protection Rank (+Toughness):</label>
            <div class="ep-stepper-wrap">
              <button type="button" class="step-btn-large" id="btn-prot-dec">-</button>
              <div class="ep-val-display"><span class="ep-num">${armorState.protectionRank}</span></div>
              <button type="button" class="step-btn-large" id="btn-prot-inc">+</button>
            </div>
          </div>

          <div class="field-group flex-1">
            <label class="form-label">Impervious Toughness:</label>
            <div class="ep-stepper-wrap">
              <button type="button" class="step-btn-large" id="btn-imperv-dec">-</button>
              <div class="ep-val-display"><span class="ep-num">${armorState.imperviousRank}</span></div>
              <button type="button" class="step-btn-large" id="btn-imperv-inc">+</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" id="chk-armor-subtle" ${armorState.isSubtle ? 'checked' : ''} />
            <span>Subtle (Concealable under regular clothes)</span>
          </label>

          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" id="chk-armor-shield" ${armorState.isShield ? 'checked' : ''} />
            <span>Ballistic Shield (+2 Active Dodge & Parry)</span>
          </label>
        </div>
      </div>
    `;
  }

  if (formSubtypeMode === 'vehicle') {
    return `
      <div class="sheet-card" style="padding: 1rem; border-color: rgba(245, 158, 11, 0.3);">
        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #f59e0b;"><i class="ri-car-line"></i> Vehicle Construction Workshop</h4>
        <div class="field-row-grid">
          <div class="field-group flex-1">
            <label class="form-label">Vehicle Size:</label>
            <select id="veh-select-size" class="text-input">
              ${VEHICLE_SIZES.map(s => `
                <option value="${s.size}" ${vehicleState.size === s.size ? 'selected' : ''}>${s.size} (${s.desc})</option>
              `).join('')}
            </select>
          </div>

          <div class="field-group flex-1">
            <label class="form-label">Speed Type & Rank:</label>
            <div style="display: flex; gap: 0.5rem;">
              <select id="veh-select-speedtype" class="text-input flex-1">
                <option value="Ground" ${vehicleState.speedType === 'Ground' ? 'selected' : ''}>Ground</option>
                <option value="Flight" ${vehicleState.speedType === 'Flight' ? 'selected' : ''}>Flight</option>
                <option value="Swimming" ${vehicleState.speedType === 'Swimming' ? 'selected' : ''}>Swimming</option>
              </select>
              <select id="veh-select-speedrank" class="text-input flex-1">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => `
                  <option value="${r}" ${vehicleState.speedRank === r ? 'selected' : ''}>Rank ${r} (${getSpeedMph(r)})</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="field-row-grid mt-2">
          <div class="field-group flex-1">
            <label class="form-label">Strength: <strong id="veh-disp-str">${vehicleState.str}</strong></label>
          </div>
          <div class="field-group flex-1">
            <label class="form-label">Defense: <strong id="veh-disp-def">${vehicleState.defense}</strong></label>
          </div>
          <div class="field-group flex-1">
            <label class="form-label">Toughness: <strong id="veh-disp-tough">${vehicleState.toughness}</strong></label>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <label class="form-label">Vehicle Features & Options:</label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.4rem; max-height: 160px; overflow-y: auto; margin-top: 0.35rem; padding-right: 0.25rem;">
            ${VEHICLE_FEATURES.map(f => `
              <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; background: rgba(255,255,255,0.02); padding: 0.35rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
                <input type="checkbox" class="chk-veh-feature" value="${f}" ${vehicleState.features.includes(f) ? 'checked' : ''} />
                <span>${f}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (formSubtypeMode === 'headquarters') {
    return `
      <div class="sheet-card" style="padding: 1rem; border-color: rgba(168, 85, 247, 0.3);">
        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #c084fc;"><i class="ri-building-line"></i> Secret Headquarters & Base Builder</h4>
        <div class="field-row-grid">
          <div class="field-group flex-1">
            <label class="form-label">Headquarters Size:</label>
            <select id="hq-select-size" class="text-input">
              <option value="Small" ${hqState.size === 'Small' ? 'selected' : ''}>Small (Apartment / Safehouse) - 1 EP</option>
              <option value="Medium" ${hqState.size === 'Medium' ? 'selected' : ''}>Medium (Penthouse / Loft) - 2 EP</option>
              <option value="Large" ${hqState.size === 'Large' ? 'selected' : ''}>Large (Warehouse / Manor) - 3 EP</option>
              <option value="Huge" ${hqState.size === 'Huge' ? 'selected' : ''}>Huge (Fortified Cavern / Bunker) - 4 EP</option>
              <option value="Gargantuan" ${hqState.size === 'Gargantuan' ? 'selected' : ''}>Gargantuan (Fortress / Base) - 5 EP</option>
              <option value="Colossal" ${hqState.size === 'Colossal' ? 'selected' : ''}>Colossal (Orbital Station / Island) - 6 EP</option>
            </select>
          </div>

          <div class="field-group flex-1">
            <label class="form-label">Toughness Rank:</label>
            <div class="ep-stepper-wrap">
              <button type="button" class="step-btn-large" id="btn-hq-tough-dec">-</button>
              <div class="ep-val-display"><span class="ep-num">${hqState.toughness}</span></div>
              <button type="button" class="step-btn-large" id="btn-hq-tough-inc">+</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <label class="form-label">Headquarters Features Checklist (1 EP each):</label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.4rem; max-height: 180px; overflow-y: auto; margin-top: 0.35rem; padding-right: 0.25rem;">
            ${HQ_FEATURES.map(f => `
              <label title="${f.desc}" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; background: rgba(255,255,255,0.02); padding: 0.35rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
                <input type="checkbox" class="chk-hq-feature" value="${f.name}" ${hqState.features.includes(f.name) ? 'checked' : ''} />
                <span>${f.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="sheet-card" style="padding: 1rem; border-color: rgba(56, 189, 248, 0.2);">
      <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">
        General gadgets include items like tools, smartphones, night vision goggles, and crime kits. Use the EP stepper above to set cost.
      </p>
    </div>
  `;
}

function bindSubtypeBuilderEvents(body) {
  const syncEpDisplay = () => {
    recalcCustomEp();
    const epDisplay = body.querySelector('#display-ep-num');
    if (epDisplay) epDisplay.textContent = formEpCost;
  };

  if (formSubtypeMode === 'weapon') {
    body.querySelector('#weap-select-range')?.addEventListener('change', (e) => {
      weaponState.range = e.target.value;
      syncEpDisplay();
    });

    body.querySelector('#weap-select-crit')?.addEventListener('change', (e) => {
      weaponState.crit = e.target.value;
      syncEpDisplay();
    });

    body.querySelector('#chk-weap-str')?.addEventListener('change', (e) => {
      weaponState.isStrengthBased = e.target.checked;
      syncEpDisplay();
    });

    body.querySelector('#btn-dmg-dec')?.addEventListener('click', () => {
      if (weaponState.damageRank > 1) {
        weaponState.damageRank--;
        renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
      }
    });

    body.querySelector('#btn-dmg-inc')?.addEventListener('click', () => {
      weaponState.damageRank++;
      renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
    });

    body.querySelectorAll('.chk-weap-trait').forEach(chk => {
      chk.addEventListener('change', () => {
        const val = chk.value;
        if (chk.checked) {
          if (!weaponState.traits.includes(val)) weaponState.traits.push(val);
        } else {
          weaponState.traits = weaponState.traits.filter(t => t !== val);
        }
        syncEpDisplay();
      });
    });
  } else if (formSubtypeMode === 'armor') {
    body.querySelector('#btn-prot-dec')?.addEventListener('click', () => {
      if (armorState.protectionRank > 0) {
        armorState.protectionRank--;
        renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
      }
    });

    body.querySelector('#btn-prot-inc')?.addEventListener('click', () => {
      armorState.protectionRank++;
      renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
    });

    body.querySelector('#btn-imperv-dec')?.addEventListener('click', () => {
      if (armorState.imperviousRank > 0) {
        armorState.imperviousRank--;
        renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
      }
    });

    body.querySelector('#btn-imperv-inc')?.addEventListener('click', () => {
      armorState.imperviousRank++;
      renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
    });

    body.querySelector('#chk-armor-subtle')?.addEventListener('change', (e) => {
      armorState.isSubtle = e.target.checked;
      syncEpDisplay();
    });

    body.querySelector('#chk-armor-shield')?.addEventListener('change', (e) => {
      armorState.isShield = e.target.checked;
      syncEpDisplay();
    });
  } else if (formSubtypeMode === 'vehicle') {
    body.querySelector('#veh-select-size')?.addEventListener('change', (e) => {
      vehicleState.size = e.target.value;
      const sizeObj = VEHICLE_SIZES.find(s => s.size === vehicleState.size) || VEHICLE_SIZES[4];
      vehicleState.str = Math.max(0, 5 + sizeObj.strBase);
      vehicleState.defense = Math.max(0, 8 + sizeObj.defMod);
      vehicleState.toughness = sizeObj.toughBase;
      renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
    });

    body.querySelector('#veh-select-speedtype')?.addEventListener('change', (e) => {
      vehicleState.speedType = e.target.value;
    });

    body.querySelector('#veh-select-speedrank')?.addEventListener('change', (e) => {
      vehicleState.speedRank = parseInt(e.target.value, 10) || 5;
      syncEpDisplay();
    });

    body.querySelectorAll('.chk-veh-feature').forEach(chk => {
      chk.addEventListener('change', () => {
        const val = chk.value;
        if (chk.checked) {
          if (!vehicleState.features.includes(val)) vehicleState.features.push(val);
        } else {
          vehicleState.features = vehicleState.features.filter(f => f !== val);
        }
        syncEpDisplay();
      });
    });
  } else if (formSubtypeMode === 'headquarters') {
    body.querySelector('#hq-select-size')?.addEventListener('change', (e) => {
      hqState.size = e.target.value;
      const sizeCostMap = { Small: 1, Medium: 2, Large: 3, Huge: 4, Gargantuan: 5, Colossal: 6 };
      const sc = sizeCostMap[hqState.size] || 3;
      hqState.toughness = 6 + (sc * 2);
      renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
    });

    body.querySelector('#btn-hq-tough-dec')?.addEventListener('click', () => {
      if (hqState.toughness > 4) {
        hqState.toughness--;
        renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
      }
    });

    body.querySelector('#btn-hq-tough-inc')?.addEventListener('click', () => {
      hqState.toughness++;
      renderCustomBuilderForm(body, document.getElementById('resource-modal')?.querySelector('#res-modal-footer'), false);
    });

    body.querySelectorAll('.chk-hq-feature').forEach(chk => {
      chk.addEventListener('change', () => {
        const val = chk.value;
        if (chk.checked) {
          if (!hqState.features.includes(val)) hqState.features.push(val);
        } else {
          hqState.features = hqState.features.filter(f => f !== val);
        }
        syncEpDisplay();
      });
    });
  }
}

function renderPresetsGrid(animate = false) {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;

  const grid = modal.querySelector('#presets-cards-grid');
  if (!grid) return;

  const filteredPresets = getFilteredPresets();

  grid.innerHTML = filteredPresets.length === 0 ? `
    <div class="empty-hint" style="grid-column: 1 / -1;">
      No equipment presets matching "${presetSearchQuery}".
    </div>
  ` : filteredPresets.map((p, idx) => {
    let chipsHtml = '';
    if (p.weapon) {
      chipsHtml = `
        <div class="res-mini-chips">
          <span class="mini-chip"><i class="ri-sword-line"></i> Dmg ${p.weapon.damageRank}${p.weapon.isStrengthBased ? ' (STR)' : ''}</span>
          <span class="mini-chip">${p.weapon.range}</span>
          <span class="mini-chip">Crit ${p.weapon.crit}</span>
          ${p.weapon.traits?.map(t => `<span class="mini-chip trait-chip">${t}</span>`).join('') || ''}
        </div>
      `;
    } else if (p.armor) {
      chipsHtml = `
        <div class="res-mini-chips">
          ${p.armor.protectionRank ? `<span class="mini-chip"><i class="ri-shield-check-line"></i> +${p.armor.protectionRank} Toughness</span>` : ''}
          ${p.armor.activeDefenseBonus ? `<span class="mini-chip">+${p.armor.activeDefenseBonus} Active Def</span>` : ''}
          ${p.armor.isSubtle ? `<span class="mini-chip">Subtle</span>` : ''}
        </div>
      `;
    } else if (p.vehicle) {
      chipsHtml = `
        <div class="res-mini-chips">
          <span class="mini-chip">${p.vehicle.size}</span>
          <span class="mini-chip">Speed ${p.vehicle.speedRank} (${p.vehicle.speedMph})</span>
          <span class="mini-chip">Toughness ${p.vehicle.toughness}</span>
        </div>
      `;
    } else if (p.hq) {
      chipsHtml = `
        <div class="res-mini-chips">
          <span class="mini-chip">${p.hq.size}</span>
          <span class="mini-chip">Toughness ${p.hq.toughness}</span>
          <span class="mini-chip">${p.hq.features?.length || 0} Features</span>
        </div>
      `;
    }

    return `
      <div class="preset-item-card">
        <div class="preset-card-top">
          <span class="badge badge-subtle">${p.type}</span>
          <strong class="preset-name">${p.name}</strong>
          <span class="ep-badge-pill">${p.epCost} EP</span>
        </div>
        ${chipsHtml}
        <p class="preset-desc">${p.desc}</p>
        <div class="preset-card-actions">
          <button class="btn btn-secondary btn-xs" data-preset-customize="${idx}"><i class="ri-edit-line"></i> Customize</button>
          <button class="btn btn-primary btn-xs" data-preset-add="${idx}"><i class="ri-add-line"></i> Add</button>
        </div>
      </div>
    `;
  }).join('');

  if (animate) {
    grid.classList.remove('category-content-animate');
    void grid.offsetWidth; // Trigger reflow
    grid.classList.add('category-content-animate');
  }

  // Preset 1-click Add
  grid.querySelectorAll('[data-preset-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.presetAdd, 10);
      const preset = filteredPresets[idx];
      if (preset) {
        store.addResource({
          ...preset,
          status: 'equipped'
        });
        showToast(`"${preset.name}" added to equipment!`, 'success');
        closeResourceModal();
      }
    });
  });

  // Preset Customize
  grid.querySelectorAll('[data-preset-customize]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.presetCustomize, 10);
      const preset = filteredPresets[idx];
      if (preset) {
        openResourceModal(preset);
      }
    });
  });
}

