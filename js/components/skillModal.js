// js/components/skillModal.js
import { store } from '../state.js';
import { SKILLS } from '../rules/skills.js';
import { showToast } from './notifications.js';

let activeCategory = 'all';
let searchQuery = '';
let selectedSkill = null;
let currentRanks = 2;
let currentSubtype = '';
let editingSkillId = null;

export function openSkillModal(skillIdToEdit = null) {
  const modal = document.getElementById('skill-modal');
  if (!modal) return;

  if (skillIdToEdit) {
    const existing = store.character.skills.find(s => s.id === skillIdToEdit);
    if (existing) {
      editingSkillId = existing.id;
      const baseRule = SKILLS.find(s => s.name === existing.name) || SKILLS[0];
      selectedSkill = baseRule;
      currentSubtype = existing.subtype || '';
      currentRanks = existing.ranks || 1;
    } else {
      editingSkillId = null;
      selectedSkill = SKILLS[0];
      currentSubtype = '';
      currentRanks = 2;
    }
  } else {
    editingSkillId = null;
    selectedSkill = SKILLS[0];
    currentSubtype = '';
    currentRanks = 2;
  }

  activeCategory = 'all';
  searchQuery = '';

  renderModal();
  modal.classList.add('open');

  // Focus search input or subtype
  setTimeout(() => {
    const subInput = modal.querySelector('#skill-subtype-input');
    const searchInput = modal.querySelector('#skill-search-input');
    if (subInput) subInput.focus();
    else if (searchInput) searchInput.focus();
  }, 50);
}

export function closeSkillModal() {
  const modal = document.getElementById('skill-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function renderModal() {
  const modal = document.getElementById('skill-modal');
  if (!modal) return;

  const abKey = selectedSkill ? selectedSkill.ability : 'INT';
  const abVal = store.getAbility(abKey);
  const totalBonus = abVal + currentRanks;
  const costPP = (currentRanks / 2).toFixed(1);

  // Filter skills
  const filteredSkills = SKILLS.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ability.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = activeCategory === 'all' ||
      (activeCategory === 'Physical' && ['AGL', 'STR'].includes(s.ability)) ||
      (activeCategory === 'Dexterity' && s.ability === 'DEX') ||
      (activeCategory === 'Combat' && s.ability === 'FGT') ||
      (activeCategory === 'Mental' && ['INT', 'AWE'].includes(s.ability)) ||
      (activeCategory === 'Social' && s.ability === 'PRE');

    return matchesSearch && matchesCat;
  });

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="icon"><i class="ri-focus-3-line"></i></span>
          <div>
            <h3>${editingSkillId ? 'Edit Skill' : 'Add New Skill'}</h3>
            <p class="modal-subtitle">Choose trained abilities for your character (0.5 PP / rank)</p>
          </div>
        </div>
        <button class="modal-close-btn" id="btn-close-skill-modal"><i class="ri-close-line"></i></button>
      </div>

      <div class="modal-body skill-modal-layout">
        <!-- LEFT: SKILLS SELECTOR & SEARCH -->
        <div class="skill-picker-sidebar">
          <div class="palette-search-box">
            <span class="search-icon"><i class="ri-search-line"></i></span>
            <input
              type="text"
              id="skill-search-input"
              class="palette-search"
              placeholder="Search skills (e.g., Stealth, Combat, Tech)..."
              value="${searchQuery}"
            />
          </div>

          <div class="filter-pills-bar">
            <button class="filter-chip ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">All</button>
            <button class="filter-chip ${activeCategory === 'Combat' ? 'active' : ''}" data-cat="Combat">Combat</button>
            <button class="filter-chip ${activeCategory === 'Dexterity' ? 'active' : ''}" data-cat="Dexterity">DEX</button>
            <button class="filter-chip ${activeCategory === 'Physical' ? 'active' : ''}" data-cat="Physical">Physical</button>
            <button class="filter-chip ${activeCategory === 'Mental' ? 'active' : ''}" data-cat="Mental">Mental</button>
            <button class="filter-chip ${activeCategory === 'Social' ? 'active' : ''}" data-cat="Social">Social</button>
          </div>

          <div class="skill-picker-list">
            ${filteredSkills.length === 0 ? `
              <div class="empty-hint">No skills matching "${searchQuery}".</div>
            ` : filteredSkills.map(s => {
              const isSelected = selectedSkill && selectedSkill.name === s.name;
              const alreadyCount = store.character.skills.filter(cs => cs.name === s.name).length;
              return `
                <div class="skill-picker-item ${isSelected ? 'selected' : ''}" data-select-skill="${s.name}">
                  <div class="skill-item-main">
                    <strong>${s.name}</strong>
                    <span class="skill-item-desc">${s.desc}</span>
                  </div>
                  <div class="skill-item-badges">
                    <span class="badge-text">${s.ability}</span>
                    ${alreadyCount > 0 ? `<span class="badge-active-dot" title="Already on sheet (${alreadyCount})"><i class="ri-check-line"></i> ${alreadyCount}</span>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- RIGHT: CONFIGURATION FORM -->
        <div class="skill-config-panel">
          ${selectedSkill ? `
            <div class="config-header-card">
              <div class="skill-detail-title-row">
                <h4>${selectedSkill.name}</h4>
                <span class="badge badge-primary">Ability: ${selectedSkill.ability} (${abVal >= 0 ? '+' : ''}${abVal})</span>
              </div>
              <p class="skill-detail-desc">${selectedSkill.desc}</p>
            </div>

            ${selectedSkill.requiresSubtype ? `
              <div class="config-section">
                <label class="config-label">
                  <strong>Specialization / Subtype:</strong>
                  <span class="text-danger">* Required</span>
                </label>
                <input
                  type="text"
                  id="skill-subtype-input"
                  class="text-input"
                  placeholder="e.g.: ${selectedSkill.commonSubtypes ? selectedSkill.commonSubtypes[0] : 'Specialization'}"
                  value="${currentSubtype}"
                />

                ${selectedSkill.commonSubtypes ? `
                  <div class="subtype-quick-pills">
                    <span class="quick-pills-label">Quick Suggestions:</span>
                    <div class="pills-wrap">
                      ${selectedSkill.commonSubtypes.map(sub => `
                        <button type="button" class="quick-pill-btn" data-fill-subtype="${sub}">${sub}</button>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <div class="config-section">
              <label class="config-label">
                <strong>Trained Ranks:</strong>
                <span class="text-muted">(1 PP = 2 Ranks)</span>
              </label>

              <div class="rank-stepper-large">
                <button type="button" class="step-btn-large" id="btn-rank-minus">-</button>
                <div class="stepper-center-info">
                  <span class="stepper-rank-val">${currentRanks}</span>
                  <span class="stepper-rank-label">Rank</span>
                </div>
                <button type="button" class="step-btn-large" id="btn-rank-plus">+</button>
              </div>

              <!-- Live Formula Preview -->
              <div class="skill-calc-preview">
                <div class="calc-row">
                  <span>Base Bonus (${selectedSkill.ability}):</span>
                  <strong>${abVal >= 0 ? '+' : ''}${abVal}</strong>
                </div>
                <div class="calc-row">
                  <span>Trained Ranks:</span>
                  <strong>+${currentRanks}</strong>
                </div>
                <div class="calc-row highlight">
                  <span>Total d20 Check Bonus:</span>
                  <span class="total-bonus-badge">${totalBonus >= 0 ? '+' : ''}${totalBonus}</span>
                </div>
                <div class="calc-row cost">
                  <span>Character Cost:</span>
                  <span class="cost-badge">${costPP} PP</span>
                </div>
              </div>
            </div>
          ` : `
            <div class="empty-hint">Select a skill from the list on the left.</div>
          `}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" id="btn-cancel-skill-modal">Cancel</button>
        <button class="btn btn-primary" id="btn-save-skill">
          ${editingSkillId ? 'Save Changes' : '+ Add to Sheet'}
        </button>
      </div>
    </div>
  `;

  // Attach event listeners
  modal.querySelector('#btn-close-skill-modal')?.addEventListener('click', closeSkillModal);
  modal.querySelector('#btn-cancel-skill-modal')?.addEventListener('click', closeSkillModal);

  // Search input
  const searchInput = modal.querySelector('#skill-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderModal();
      const updatedInput = modal.querySelector('#skill-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });
  }

  // Category filters
  modal.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderModal();
    });
  });

  // Select skill
  modal.querySelectorAll('[data-select-skill]').forEach(el => {
    el.addEventListener('click', () => {
      const match = SKILLS.find(s => s.name === el.dataset.selectSkill);
      if (match) {
        selectedSkill = match;
        if (!selectedSkill.requiresSubtype) {
          currentSubtype = '';
        }
        renderModal();
      }
    });
  });

  // Subtype input
  const subtypeInput = modal.querySelector('#skill-subtype-input');
  if (subtypeInput) {
    subtypeInput.addEventListener('input', (e) => {
      currentSubtype = e.target.value;
    });
    subtypeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveSkill();
      }
    });
  }

  // Quick subtype pills
  modal.querySelectorAll('[data-fill-subtype]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSubtype = btn.dataset.fillSubtype;
      const subIn = modal.querySelector('#skill-subtype-input');
      if (subIn) {
        subIn.value = currentSubtype;
        subIn.focus();
      }
    });
  });

  // Stepper
  modal.querySelector('#btn-rank-minus')?.addEventListener('click', () => {
    if (currentRanks > 1) {
      currentRanks--;
      renderModal();
    }
  });

  modal.querySelector('#btn-rank-plus')?.addEventListener('click', () => {
    currentRanks++;
    renderModal();
  });

  // Save button
  modal.querySelector('#btn-save-skill')?.addEventListener('click', saveSkill);
}

function saveSkill() {
  if (!selectedSkill) return;

  if (selectedSkill.requiresSubtype && !currentSubtype.trim()) {
    showToast(`Please specify a specialization/subtype for ${selectedSkill.name} (e.g., Unarmed, Swords, Firearms)!`, 'warning');
    const subInput = document.getElementById('skill-subtype-input');
    if (subInput) subInput.focus();
    return;
  }

  const skillTitle = currentSubtype.trim() ? `${selectedSkill.name} (${currentSubtype.trim()})` : selectedSkill.name;
  store.addSkill({
    id: editingSkillId,
    name: selectedSkill.name,
    subtype: currentSubtype.trim(),
    ranks: currentRanks
  });
  showToast(`Skill "${skillTitle}" (Rank ${currentRanks}) saved!`, 'success');

  closeSkillModal();
}
