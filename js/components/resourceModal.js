// js/components/resourceModal.js
import { store } from '../state.js';
import { RESOURCE_CATEGORIES, RESOURCE_PRESETS } from '../rules/resources.js';
import { showToast } from './notifications.js';

let activeTab = 'presets'; // 'presets' or 'custom'
let presetCategory = 'all';
let presetSearchQuery = '';
let editingResourceId = null;

// Custom form state
let formType = 'Gear';
let formName = '';
let formEpCost = 4;
let formDesc = '';

export function openResourceModal(resourceToEdit = null, defaultType = 'Gear') {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;

  if (resourceToEdit) {
    editingResourceId = resourceToEdit.id || null;
    activeTab = 'custom';
    formType = resourceToEdit.type || 'Gear';
    formName = resourceToEdit.name || '';
    formEpCost = resourceToEdit.epCost || 1;
    formDesc = resourceToEdit.desc || '';
  } else {
    editingResourceId = null;
    activeTab = 'presets';
    formType = defaultType;
    formName = '';
    formEpCost = defaultType === 'Vehicle' ? 10 : (defaultType === 'Headquarters' ? 15 : 4);
    formDesc = '';
  }

  presetCategory = defaultType && defaultType !== 'Gear' ? defaultType : 'all';
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

function renderModal() {
  const modal = document.getElementById('resource-modal');
  if (!modal) return;

  const budget = store.getEquipmentBudgetInfo();

  // Filter presets
  const filteredPresets = RESOURCE_PRESETS.filter(p => {
    const matchesCat = presetCategory === 'all' || p.type === presetCategory;
    const matchesSearch = !presetSearchQuery ||
      p.name.toLowerCase().includes(presetSearchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(presetSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="icon"><i class="ri-briefcase-line"></i></span>
          <div>
            <h3>${editingResourceId ? 'Edit Equipment / Resource' : 'Add Equipment & Resource'}</h3>
            <p class="modal-subtitle">Weapons, protective gadgets, vehicles, and headquarters (5 EP = 1 PP)</p>
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
          <i class="ri-flashlight-line"></i> Choose Official M&M 3e Preset
        </button>
        <button class="modal-subtab-btn ${activeTab === 'custom' ? 'active' : ''}" id="tab-res-custom">
          <i class="ri-tools-line"></i> ${editingResourceId ? 'Edit Custom Item' : 'Create Custom Item'}
        </button>
      </div>

      <div class="modal-body">
        ${activeTab === 'presets' ? `
          <!-- TAB 1: PRESETS -->
          <div class="presets-toolbar">
            <div class="palette-search-box flex-1">
              <span class="search-icon"><i class="ri-search-line"></i></span>
              <input
                type="text"
                id="res-preset-search"
                class="palette-search"
                placeholder="Search weapon presets, armor, vehicles, headquarters..."
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

          <div class="presets-cards-grid">
            ${filteredPresets.length === 0 ? `
              <div class="empty-hint" style="grid-column: 1 / -1;">
                No presets matching "${presetSearchQuery}".
              </div>
            ` : filteredPresets.map((p, idx) => `
              <div class="preset-item-card">
                <div class="preset-card-top">
                  <span class="badge badge-subtle">${p.type}</span>
                  <strong class="preset-name">${p.name}</strong>
                  <span class="ep-badge-pill">${p.epCost} EP</span>
                </div>
                <p class="preset-desc">${p.desc}</p>
                <div class="preset-card-actions">
                  <button class="btn btn-secondary btn-xs" data-preset-customize="${idx}"><i class="ri-edit-line"></i> Customize</button>
                  <button class="btn btn-primary btn-xs" data-preset-add="${idx}"><i class="ri-add-line"></i> Add</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- TAB 2: CUSTOM BUILDER -->
          <div class="custom-res-form">
            <div class="field-row-grid">
              <div class="field-group flex-2">
                <label class="form-label">Item / Equipment Name:</label>
                <input
                  type="text"
                  id="input-res-name"
                  class="text-input"
                  placeholder="e.g., Tactical Katana, Stealth Drone, Jet Cruiser..."
                  value="${formName}"
                />
              </div>

              <div class="field-group flex-1">
                <label class="form-label">Item Category:</label>
                <select id="select-res-type" class="text-input">
                  <option value="Gear" ${formType === 'Gear' ? 'selected' : ''}>Gear & Weapons</option>
                  <option value="Gadget" ${formType === 'Gadget' ? 'selected' : ''}>Gadget & Tech</option>
                  <option value="Vehicle" ${formType === 'Vehicle' ? 'selected' : ''}>Vehicles</option>
                  <option value="Headquarters" ${formType === 'Headquarters' ? 'selected' : ''}>Headquarters (HQ)</option>
                </select>
              </div>
            </div>

            <div class="field-row-grid mt-3">
              <div class="field-group flex-1">
                <label class="form-label">Equipment Point (EP) Cost:</label>
                <div class="ep-stepper-wrap">
                  <button type="button" class="step-btn-large" id="btn-ep-dec">-</button>
                  <div class="ep-val-display">
                    <span class="ep-num">${formEpCost}</span>
                    <span class="ep-unit">EP</span>
                  </div>
                  <button type="button" class="step-btn-large" id="btn-ep-inc">+</button>
                </div>
                <span class="text-muted text-xs mt-1">
                  <i class="ri-lightbulb-line"></i> 5 EP = 1 Power Point (PP) via "Equipment" Advantage (~${Math.ceil(formEpCost / 5)} PP equivalent)
                </span>
              </div>
            </div>

            <div class="field-group mt-3">
              <label class="form-label">Description, Features & Rules Effects:</label>
              <textarea
                id="textarea-res-desc"
                class="text-input"
                rows="4"
                placeholder="Enter specifications, damage effects, defensive features, or item capabilities..."
              >${formDesc}</textarea>
            </div>
          </div>
        `}
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" id="btn-cancel-res-modal">Close</button>
        ${activeTab === 'custom' ? `
          <button class="btn btn-primary" id="btn-save-custom-res">
            ${editingResourceId ? 'Save Changes' : '+ Save to Library'}
          </button>
        ` : `
          <button class="btn btn-secondary" id="btn-goto-custom">
            + Create New Custom Item
          </button>
        `}
      </div>
    </div>
  `;

  // Modal close handlers
  modal.querySelector('#btn-close-res-modal')?.addEventListener('click', closeResourceModal);
  modal.querySelector('#btn-cancel-res-modal')?.addEventListener('click', closeResourceModal);

  // Tab switching
  modal.querySelector('#tab-res-presets')?.addEventListener('click', () => {
    activeTab = 'presets';
    renderModal();
  });
  modal.querySelector('#tab-res-custom')?.addEventListener('click', () => {
    activeTab = 'custom';
    renderModal();
  });
  modal.querySelector('#btn-goto-custom')?.addEventListener('click', () => {
    activeTab = 'custom';
    renderModal();
  });

  // Presets search
  const presetSearch = modal.querySelector('#res-preset-search');
  if (presetSearch) {
    presetSearch.addEventListener('input', (e) => {
      presetSearchQuery = e.target.value;
      renderModal();
      const updatedSearch = modal.querySelector('#res-preset-search');
      if (updatedSearch) {
        updatedSearch.focus();
        updatedSearch.setSelectionRange(presetSearchQuery.length, presetSearchQuery.length);
      }
    });
  }

  // Preset category pills
  modal.querySelectorAll('[data-res-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      presetCategory = btn.dataset.resCat;
      renderModal();
    });
  });

  // Preset 1-click Add
  modal.querySelectorAll('[data-preset-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.presetAdd, 10);
      const preset = filteredPresets[idx];
      if (preset) {
        store.addResource({
          name: preset.name,
          type: preset.type,
          epCost: preset.epCost,
          desc: preset.desc
        });
        showToast(`"${preset.name}" added to equipment!`, 'success');
        closeResourceModal();
      }
    });
  });

  // Preset Customize (load into custom tab)
  modal.querySelectorAll('[data-preset-customize]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.presetCustomize, 10);
      const preset = filteredPresets[idx];
      if (preset) {
        formName = preset.name;
        formType = preset.type;
        formEpCost = preset.epCost;
        formDesc = preset.desc;
        activeTab = 'custom';
        renderModal();
      }
    });
  });

  // Custom Form handlers
  const inputName = modal.querySelector('#input-res-name');
  if (inputName) {
    inputName.addEventListener('input', (e) => {
      formName = e.target.value;
    });
  }

  const selectType = modal.querySelector('#select-res-type');
  if (selectType) {
    selectType.addEventListener('change', (e) => {
      formType = e.target.value;
    });
  }

  const textDesc = modal.querySelector('#textarea-res-desc');
  if (textDesc) {
    textDesc.addEventListener('input', (e) => {
      formDesc = e.target.value;
    });
  }

  modal.querySelector('#btn-ep-dec')?.addEventListener('click', () => {
    if (formEpCost > 1) {
      formEpCost--;
      renderModal();
    }
  });

  modal.querySelector('#btn-ep-inc')?.addEventListener('click', () => {
    formEpCost++;
    renderModal();
  });

  modal.querySelector('#btn-save-custom-res')?.addEventListener('click', () => {
    if (!formName.trim()) {
      showToast('Please enter an item / equipment name!', 'warning');
      modal.querySelector('#input-res-name')?.focus();
      return;
    }

    const trimmedName = formName.trim();
    if (editingResourceId) {
      store.updateResource(editingResourceId, {
        name: trimmedName,
        type: formType,
        epCost: formEpCost,
        desc: formDesc.trim()
      });
      showToast(`"${trimmedName}" updated successfully!`, 'success');
    } else {
      store.addResource({
        name: trimmedName,
        type: formType,
        epCost: formEpCost,
        desc: formDesc.trim()
      });
      showToast(`"${trimmedName}" added successfully!`, 'success');
    }

    closeResourceModal();
  });
}
