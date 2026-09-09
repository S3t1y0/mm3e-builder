// js/components/advantageModal.js
import { store } from '../state.js';
import { ADVANTAGES, ADVANTAGE_CATEGORIES } from '../rules/advantages.js';

let activeCategory = 'All';
let searchQuery = '';

export function openAdvantageModal() {
  const modal = document.getElementById('advantage-modal');
  if (!modal) return;

  activeCategory = 'All';
  searchQuery = '';
  renderModal();
  modal.classList.add('open');

  setTimeout(() => {
    const input = modal.querySelector('#adv-search-input');
    if (input) input.focus();
  }, 50);
}

export function closeAdvantageModal() {
  const modal = document.getElementById('advantage-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function renderModal() {
  const modal = document.getElementById('advantage-modal');
  if (!modal) return;

  const charAdvs = store.character.advantages;
  const totalAdvPP = store.getTotalAdvantagePP();

  // Filter advantages
  const filtered = ADVANTAGES.filter(a => {
    const matchesSearch = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = activeCategory === 'All' ||
      (activeCategory === 'Ranked' ? a.ranked : a.category === activeCategory);

    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Combat': return '<i class="ri-sword-line"></i>';
      case 'Fortune': return '<i class="ri-clover-line"></i>';
      case 'Skill': return '<i class="ri-focus-3-line"></i>';
      case 'General': return '<i class="ri-shield-line"></i>';
      default: return '<i class="ri-star-line"></i>';
    }
  };

  modal.innerHTML = `
    <div class="modal-dialog modal-xl">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="icon"><i class="ri-star-line"></i></span>
          <div>
            <h3>M&M 3e Advantages Catalog</h3>
            <p class="modal-subtitle">Talents, combat maneuvers, and special perks (1 PP / rank)</p>
          </div>
        </div>
        <div class="modal-header-actions">
          <span class="badge badge-accent">Total: ${charAdvs.length} Selected (${totalAdvPP} PP)</span>
          <button class="modal-close-btn" id="btn-close-adv-modal"><i class="ri-close-line"></i></button>
        </div>
      </div>

      <div class="modal-body">
        <!-- SEARCH & CATEGORY BAR -->
        <div class="adv-filter-toolbar">
          <div class="palette-search-box flex-1">
            <span class="search-icon"><i class="ri-search-line"></i></span>
            <input
              type="text"
              id="adv-search-input"
              class="palette-search"
              placeholder="Search advantages... (e.g., Initiative, Power Attack, Luck, Evasion)"
              value="${searchQuery}"
            />
          </div>

          <div class="filter-pills-bar">
            ${ADVANTAGE_CATEGORIES.map(cat => {
              const count = ADVANTAGES.filter(a => cat === 'All' || (cat === 'Ranked' ? a.ranked : a.category === cat)).length;
              return `
                <button class="filter-chip ${activeCategory === cat ? 'active' : ''}" data-adv-cat="${cat}">
                  ${getCategoryIcon(cat)} ${cat} (${count})
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ADVANTAGES GRID -->
        <div class="adv-catalog-grid">
          ${filtered.length === 0 ? `
            <div class="empty-hint" style="grid-column: 1 / -1;">
              No advantages matching "${searchQuery}".
            </div>
          ` : filtered.map(a => {
            const onSheet = charAdvs.find(ca => ca.name === a.name);
            const isAdded = !!onSheet;
            const currentRanks = onSheet ? onSheet.ranks : 0;

            return `
              <div class="adv-catalog-card ${isAdded ? 'added' : ''}">
                <div class="adv-card-header">
                  <div class="adv-card-title-wrap">
                    <span class="adv-cat-tag ${a.category?.toLowerCase()}">
                      ${getCategoryIcon(a.category)} ${a.category || 'General'}
                    </span>
                    <strong class="adv-card-title">${a.name}</strong>
                  </div>
                  ${a.ranked ? `<span class="badge-ranked" title="Can be increased multiple times">Ranked</span>` : ''}
                </div>

                <p class="adv-card-desc">${a.desc}</p>

                <div class="adv-card-footer">
                  ${isAdded ? `
                    <div class="adv-card-active-controls">
                      <span class="badge-in-sheet"><i class="ri-check-line"></i> On Sheet (${currentRanks} Rank${currentRanks > 1 ? 's' : ''})</span>
                      <div class="stepper-compact">
                        <button class="step-btn-xs" data-card-dec="${a.name}">-</button>
                        <span class="step-val-xs">${currentRanks}</span>
                        <button class="step-btn-xs" data-card-inc="${a.name}" ${a.maxRanks && currentRanks >= a.maxRanks ? 'disabled' : ''}>+</button>
                        <button class="del-btn-tiny" data-card-del="${a.name}" title="Remove from Sheet"><i class="ri-close-line"></i></button>
                      </div>
                    </div>
                  ` : `
                    <button class="btn btn-secondary btn-xs btn-add-adv" data-card-add="${a.name}">
                      <i class="ri-add-line"></i> Add (${a.ranked ? '1 Rank' : '1 PP'})
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="modal-footer">
        <span class="modal-footer-hint"><i class="ri-lightbulb-line"></i> Click "+ Add" on any card to add it directly to your character.</span>
        <button class="btn btn-primary" id="btn-done-adv-modal">Done</button>
      </div>
    </div>
  `;

  // Attach event handlers
  modal.querySelector('#btn-close-adv-modal')?.addEventListener('click', closeAdvantageModal);
  modal.querySelector('#btn-done-adv-modal')?.addEventListener('click', closeAdvantageModal);

  // Search input
  const searchInput = modal.querySelector('#adv-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderModal();
      const updatedInput = modal.querySelector('#adv-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });
  }

  // Category filter
  modal.querySelectorAll('[data-adv-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.advCat;
      renderModal();
    });
  });

  // Add advantage
  modal.querySelectorAll('[data-card-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const advName = btn.dataset.cardAdd;
      store.addAdvantage(advName, 1);
      renderModal();
    });
  });

  // Increment advantage
  modal.querySelectorAll('[data-card-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const advName = btn.dataset.cardInc;
      const cur = charAdvs.find(a => a.name === advName);
      if (cur) {
        store.updateAdvantage(advName, cur.ranks + 1);
        renderModal();
      }
    });
  });

  // Decrement advantage
  modal.querySelectorAll('[data-card-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const advName = btn.dataset.cardDec;
      const cur = charAdvs.find(a => a.name === advName);
      if (cur) {
        store.updateAdvantage(advName, cur.ranks - 1);
        renderModal();
      }
    });
  });

  // Delete advantage
  modal.querySelectorAll('[data-card-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const advName = btn.dataset.cardDel;
      store.removeAdvantage(advName);
      renderModal();
    });
  });
}
