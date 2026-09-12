// js/components/wizard/stepResources.js
import { store } from '../../state.js';
import { RESOURCE_CATEGORIES, RESOURCE_PRESETS } from '../../rules/resources.js';
import { showToast } from '../notifications.js';

let activeResCategory = 'all';

export function renderStepResources(container) {
  const char = store.character;
  const budgetInfo = store.getEquipmentBudgetInfo();

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-car-line"></i></div>
        <div>
          <h2>Step 7: Equipment, Vehicles & HQ</h2>
          <p>Allocate Equipment Points (EP) for conventional weapons, armored vehicles, and secret bases.</p>
        </div>
      </div>
      <div class="wizard-stage-badge">${budgetInfo.totalEP} / ${budgetInfo.maxEP} EP Allocated</div>
    </div>

    <!-- EP BUDGET METER & SYNC BAR -->
    <div class="sheet-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary);">Equipment Point (EP) Budget</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">
            Funded by the <strong>Equipment</strong> advantage (${budgetInfo.ranks} Ranks = ${budgetInfo.maxEP} EP).
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.1rem; font-weight: 900; font-variant-numeric: tabular-nums; color: ${budgetInfo.isOverBudget ? 'var(--accent-danger)' : 'var(--accent-emerald)'};">
            ${budgetInfo.totalEP} / ${budgetInfo.maxEP} EP
          </span>
          <button id="wiz-btn-sync-ep" class="btn btn-secondary btn-xs">
            <i class="ri-refresh-line"></i> Auto-Sync Equipment Advantage (${budgetInfo.neededRanks} Ranks)
          </button>
        </div>
      </div>

      <!-- EP Progress Bar -->
      <div class="tradeoff-bar-track" style="height: 10px;">
        <div class="tradeoff-bar-fill ${budgetInfo.isOverBudget ? 'danger' : budgetInfo.totalEP === budgetInfo.maxEP ? 'exact' : 'normal'}"
             style="width: ${budgetInfo.maxEP > 0 ? Math.min(100, (budgetInfo.totalEP / budgetInfo.maxEP) * 100) : (budgetInfo.totalEP > 0 ? 100 : 0)}%;">
        </div>
      </div>

      ${budgetInfo.isOverBudget ? `
        <div style="font-size: 0.8rem; color: var(--accent-danger); display: flex; align-items: center; gap: 0.4rem;">
          <i class="ri-alert-line"></i>
          Over EP budget by ${Math.abs(budgetInfo.remainingEP)} EP! Click "Auto-Sync Equipment Advantage" to automatically increase your Equipment advantage.
        </div>
      ` : ''}
    </div>

    <!-- INVENTORY LIST & CATALOG GRID -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.5fr); gap: 1.25rem;">
      <!-- CURRENT INVENTORY -->
      <div class="sheet-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <h3 style="font-size: 0.95rem; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <i class="ri-inbox-archive-line" style="color: var(--accent-secondary);"></i> Equipped Resources (${char.resources.length})
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 480px; overflow-y: auto;">
          ${char.resources.length === 0 ? `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.85rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
              No resources equipped yet. Add items from the catalog on the right.
            </div>
          ` : char.resources.map(res => `
            <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
              <div>
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${res.name}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${res.type || 'Gear'} • ${res.desc || ''}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                <span style="font-weight: 800; font-size: 0.8rem; color: var(--accent-secondary);">${res.epCost ?? res.cost} EP</span>
                <button class="btn btn-ghost btn-xs btn-remove-res" data-id="${res.id}" style="color: var(--accent-danger);">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- RESOURCE PRESET CATALOG -->
      <div class="sheet-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 0.95rem; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <i class="ri-store-2-line" style="color: var(--accent-primary);"></i> Catalog Presets
          </h3>
          <div style="display: flex; gap: 0.35rem; overflow-x: auto;">
            ${RESOURCE_CATEGORIES.map(c => `
              <button class="wizard-filter-tab btn-res-cat ${c.id === activeResCategory ? 'active' : ''}" data-cat="${c.id}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                <i class="${c.icon}"></i> ${c.label.split(' ')[0]}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 480px; overflow-y: auto;" id="res-catalog-list">
          <!-- Filtered Presets -->
        </div>
      </div>
    </div>
  `;

  renderCatalogList(container);

  // Auto-sync button
  document.getElementById('wiz-btn-sync-ep')?.addEventListener('click', () => {
    store.syncEquipmentAdvantage();
    showToast('Equipment advantage synchronized with total EP!', 'success');
    renderStepResources(container);
  });

  // Remove resource
  container.querySelectorAll('.btn-remove-res').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      store.removeResource(id);
      renderStepResources(container);
    });
  });

  // Category filter buttons
  container.querySelectorAll('.btn-res-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      activeResCategory = btn.dataset.cat;
      container.querySelectorAll('.btn-res-cat').forEach(b => b.classList.toggle('active', b === btn));
      renderCatalogList(container);
    });
  });
}

function renderCatalogList(container) {
  const catalogList = container.querySelector('#res-catalog-list');
  if (!catalogList) return;

  const filtered = RESOURCE_PRESETS.filter(p => {
    if (activeResCategory === 'all') return true;
    if (activeResCategory === 'Weapons') return p.subtype?.startsWith('weapon') || p.weapon != null;
    if (activeResCategory === 'Armor') return p.subtype === 'armor' || p.subtype === 'shield' || p.armor != null;
    if (activeResCategory === 'Gadget') return p.type === 'Gadget';
    if (activeResCategory === 'Vehicle') return p.type === 'Vehicle';
    if (activeResCategory === 'Headquarters') return p.type === 'Headquarters';
    return p.type.toLowerCase() === activeResCategory.toLowerCase();
  });

  catalogList.innerHTML = filtered.map((preset, idx) => `
    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
      <div>
        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${preset.name}</div>
        <div style="font-size: 0.7rem; color: var(--text-secondary);">${preset.desc}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
        <span style="font-weight: 800; font-size: 0.8rem; color: var(--accent-secondary);">${preset.epCost} EP</span>
        <button class="btn btn-secondary btn-xs btn-add-preset" data-preset-idx="${idx}">
          <i class="ri-add-line"></i> Add
        </button>
      </div>
    </div>
  `).join('');

  catalogList.querySelectorAll('.btn-add-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.presetIdx, 10);
      const preset = filtered[idx];
      if (preset) {
        store.addResource({
          ...preset,
          status: 'equipped'
        });
        showToast(`Equipped ${preset.name} (${preset.epCost} EP)`, 'success');
        renderStepResources(container);
      }
    });
  });
}
