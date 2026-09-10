// js/components/wizard/stepSkills.js
import { store } from '../../state.js';
import { SKILLS, SKILL_RANKS_PER_PP } from '../../rules/skills.js';
import { showToast } from '../notifications.js';

let activeCategory = 'All';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderStepSkills(container) {
  const char = store.character;
  const totalRanks = char.skills.reduce((sum, s) => sum + s.ranks, 0);
  const totalSkillPP = store.getTotalSkillPP();

  const categories = ['All', 'Combat', 'Physical', 'Mental', 'Interaction'];

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-briefcase-4-line"></i></div>
        <div>
          <h2>Step 4: Skills & Training</h2>
          <p>Trained competencies that provide check bonuses (1 PP = 2 Ranks).</p>
        </div>
      </div>
      <div class="wizard-stage-badge">${totalSkillPP} PP Spent (${totalRanks} Total Ranks)</div>
    </div>

    <!-- FILTER TABS & SUBTYPE QUICK ADD -->
    <div class="sheet-card" style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <div class="wizard-skills-filter-tabs">
          ${categories.map(cat => `
            <button class="wizard-filter-tab ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>
          `).join('')}
        </div>
        <button class="btn btn-primary btn-xs" id="wiz-btn-add-custom-skill">
          <i class="ri-focus-3-line"></i> + Add Specialization
        </button>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-secondary);">
        Check Bonus = <strong style="color: var(--text-primary);">Ability Mod</strong> + <strong style="color: var(--accent-secondary);">Ranks</strong>. Rolled against DC with a d20.
      </div>
    </div>

    <!-- SKILLS LIST -->
    <div class="wizard-skills-list" id="wiz-skills-list">
      <!-- Populated dynamically -->
    </div>

    <!-- SPECIALIZATION MODAL MOUNT -->
    <div id="wiz-spec-modal-mount"></div>
  `;

  // Render skills based on active category
  renderSkillsList(container);

  // Tab events
  container.querySelectorAll('.wizard-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = tab.dataset.cat;
      container.querySelectorAll('.wizard-filter-tab').forEach(t => t.classList.toggle('active', t === tab));
      renderSkillsList(container);
    });
  });

  // Top action: Open Specialization Modal
  container.querySelector('#wiz-btn-add-custom-skill')?.addEventListener('click', () => {
    openSpecializationModal(container, 'Close Combat');
  });
}

function renderSkillsList(container) {
  const char = store.character;
  const listEl = container.querySelector('#wiz-skills-list');
  if (!listEl) return;

  // Filter skills
  const filteredSkills = SKILLS.filter(s => {
    if (activeCategory === 'All') return true;
    return s.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const addedSkills = char.skills;
  let html = '';

  filteredSkills.forEach(ruleSkill => {
    const abilityVal = store.getAbility(ruleSkill.ability);

    if (ruleSkill.requiresSubtype) {
      // 1. Show existing subtyped instances on the character
      const instances = addedSkills.filter(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());
      if (instances.length > 0) {
        instances.forEach(inst => {
          html += renderSkillRow(inst.name, inst.subtype, ruleSkill.ability, inst.ranks, inst.id, ruleSkill.desc, true);
        });
      }

      // 2. Render user-friendly prompt card with 1-click popular presets and custom button
      const commonSubtypes = ruleSkill.commonSubtypes || [];
      html += `
        <div class="wizard-spec-prompt-card">
          <div class="spec-prompt-header">
            <div class="spec-prompt-info">
              <span class="spec-prompt-title">
                <i class="ri-add-circle-fill"></i> Add ${escapeHtml(ruleSkill.name)} Specialization
              </span>
              <span class="spec-prompt-sub">
                Key Ability: <strong>${ruleSkill.ability}</strong> (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal}) • Rate: 1 PP = 2 Ranks
              </span>
            </div>
            <button class="btn btn-secondary btn-xs btn-open-spec-modal" data-base="${escapeHtml(ruleSkill.name)}">
              <i class="ri-sound-module-line"></i> Custom Specialization...
            </button>
          </div>

          <div class="spec-quick-chips">
            <span class="spec-chips-label">Popular Presets:</span>
            ${commonSubtypes.map(sub => {
              const isAlreadyAdded = instances.some(inst => (inst.subtype || '').toLowerCase() === sub.toLowerCase());
              if (isAlreadyAdded) {
                return `
                  <span class="spec-quick-chip added" title="${escapeHtml(sub)} already added to character">
                    <i class="ri-check-line"></i> ${escapeHtml(sub)}
                  </span>
                `;
              }
              return `
                <button class="spec-quick-chip btn-quick-add-chip" 
                        data-base="${escapeHtml(ruleSkill.name)}" 
                        data-sub="${escapeHtml(sub)}" 
                        title="Click to instantly add ${escapeHtml(ruleSkill.name)}: ${escapeHtml(sub)} (+2 Ranks)" 
                        type="button">
                  <i class="ri-add-line"></i> ${escapeHtml(sub)}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      // Regular non-subtyped skill
      const match = addedSkills.find(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());
      const ranks = match ? match.ranks : 0;
      const skillId = match ? match.id : null;
      html += renderSkillRow(ruleSkill.name, '', ruleSkill.ability, ranks, skillId, ruleSkill.desc, false);
    }
  });

  listEl.innerHTML = html;

  // Bind Stepper Decrements
  listEl.querySelectorAll('.btn-sk-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const currentRanks = parseInt(btn.dataset.ranks, 10) || 0;
      if (id) {
        store.updateSkill(id, currentRanks - 1);
      }
      renderStepSkills(container);
    });
  });

  // Bind Stepper Increments
  listEl.querySelectorAll('.btn-sk-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const subtype = btn.dataset.subtype || '';
      const currentRanks = parseInt(btn.dataset.ranks, 10) || 0;

      if (id) {
        store.updateSkill(id, currentRanks + 1);
      } else {
        store.addSkill({ name, subtype, ranks: 1 });
      }
      renderStepSkills(container);
    });
  });

  // Bind 1-Click Quick Preset Chips
  listEl.querySelectorAll('.btn-quick-add-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const baseName = btn.dataset.base;
      const subName = btn.dataset.sub;
      store.addSkill({ name: baseName, subtype: subName, ranks: 2 });
      showToast(`Added ${baseName}: ${subName} (2 Ranks)`, 'success');
      renderStepSkills(container);
    });
  });

  // Bind Open Custom Specialization Modal
  listEl.querySelectorAll('.btn-open-spec-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const baseName = btn.dataset.base;
      openSpecializationModal(container, baseName);
    });
  });

  // Bind Delete Specialization Buttons
  listEl.querySelectorAll('.btn-delete-skill').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (id) {
        store.removeSkill(id);
        showToast(`Removed ${name}`, 'info');
        renderStepSkills(container);
      }
    });
  });
}

function renderSkillRow(name, subtype, abilityKey, ranks, id, desc, isSpecialization = false) {
  const abilityVal = store.getAbility(abilityKey);
  const totalBonus = abilityVal + ranks;
  const fullName = subtype ? `${name}: ${subtype}` : name;

  return `
    <div class="wizard-skill-item ${isSpecialization ? 'is-specialization' : ''}">
      <div class="wizard-skill-meta">
        <div class="wizard-skill-title-row">
          <span class="wizard-skill-name">${escapeHtml(fullName)}</span>
          ${isSpecialization ? '<span class="spec-badge"><i class="ri-bookmark-3-fill"></i> Specialization</span>' : ''}
        </div>
        <span class="wizard-skill-ability">Key Ability: <strong>${abilityKey}</strong> (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal})</span>
      </div>

      <div style="text-align: center;">
        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">BONUS</span>
        <span class="wizard-skill-bonus">${totalBonus >= 0 ? `+${totalBonus}` : totalBonus}</span>
      </div>

      <div style="display: flex; align-items: center; justify-content: center;">
        <div class="stepper">
          <button class="step-btn btn-sk-dec" data-id="${id || ''}" data-name="${escapeHtml(name)}" data-subtype="${escapeHtml(subtype)}" data-ranks="${ranks}" ${ranks <= 0 ? 'disabled' : ''}>-</button>
          <span class="step-val" style="font-size: 1rem; min-width: 1.75rem;">${ranks}</span>
          <button class="step-btn btn-sk-inc" data-id="${id || ''}" data-name="${escapeHtml(name)}" data-subtype="${escapeHtml(subtype)}" data-ranks="${ranks}">+</button>
        </div>
      </div>

      <div style="text-align: right; font-size: 0.75rem; color: var(--text-secondary);">
        ${ranks > 0 ? `${ranks} Ranks` : '<span style="color: var(--text-muted);">Untrained</span>'}
      </div>

      <div style="display: flex; align-items: center; justify-content: center;">
        ${isSpecialization && id ? `
          <button class="btn-delete-skill" data-id="${id}" data-name="${escapeHtml(fullName)}" title="Remove ${escapeHtml(fullName)}">
            <i class="ri-delete-bin-line"></i>
          </button>
        ` : '<span></span>'}
      </div>
    </div>
  `;
}

function openSpecializationModal(container, initialBaseSkill = 'Close Combat') {
  const mount = container.querySelector('#wiz-spec-modal-mount');
  if (!mount) return;

  const subtypableSkills = [
    { name: 'Close Combat', ability: 'FGT', icon: 'ri-sword-line', desc: 'Melee weapons & unarmed strikes' },
    { name: 'Ranged Combat', ability: 'DEX', icon: 'ri-crosshair-2-line', desc: 'Firearms, blasts, & thrown weapons' },
    { name: 'Expertise', ability: 'INT', icon: 'ri-book-open-line', desc: 'Knowledge, sciences, & crafts' }
  ];

  let selectedBase = subtypableSkills.some(s => s.name.toLowerCase() === initialBaseSkill.toLowerCase())
    ? initialBaseSkill
    : 'Close Combat';

  let customSubtype = '';
  let initialRanks = 2;

  function updateModalView() {
    const currentRule = SKILLS.find(s => s.name.toLowerCase() === selectedBase.toLowerCase());
    const abilityKey = currentRule?.ability || 'FGT';
    const abilityVal = store.getAbility(abilityKey);
    const totalBonus = abilityVal + initialRanks;
    const presets = currentRule?.commonSubtypes || [];
    const ppCost = initialRanks * 0.5;

    mount.innerHTML = `
      <div class="wizard-spec-modal-overlay open" id="wiz-spec-overlay">
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
            <button class="btn btn-ghost btn-sm" id="btn-close-spec-modal" style="padding:0.25rem 0.5rem;"><i class="ri-close-line"></i></button>
          </div>

          <div class="wizard-spec-modal-body">
            <!-- 1. Base Skill Category Selector -->
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                1. Select Base Skill
              </label>
              <div class="spec-base-cards-grid">
                ${subtypableSkills.map(sk => `
                  <div class="spec-base-card ${sk.name.toLowerCase() === selectedBase.toLowerCase() ? 'active' : ''}" data-select-base="${sk.name}">
                    <i class="${sk.icon}"></i>
                    <h5>${sk.name}</h5>
                    <span>${sk.ability} (${store.getAbility(sk.ability) >= 0 ? `+${store.getAbility(sk.ability)}` : store.getAbility(sk.ability)})</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 2. Popular Presets -->
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                2. Choose Popular Preset (Or Enter Custom Below)
              </label>
              <div class="spec-quick-chips">
                ${presets.map(p => `
                  <button class="spec-quick-chip modal-preset-chip ${customSubtype.toLowerCase() === p.toLowerCase() ? 'active' : ''}" data-preset-val="${escapeHtml(p)}" type="button">
                    ${escapeHtml(p)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 3. Custom Specification Input -->
            <div class="form-group" style="margin:0;">
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                3. Specialization Name
              </label>
              <input type="text" id="wiz-spec-name-input" class="text-input" placeholder="e.g. Unarmed, Swords, Firearms, Forensic Science..." value="${escapeHtml(customSubtype)}">
            </div>

            <!-- 4. Starting Ranks & Live Preview -->
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;display:block;">
                4. Starting Ranks & Check Preview
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
                    <button class="step-btn" id="wiz-spec-rank-dec" ${initialRanks <= 1 ? 'disabled' : ''} type="button">-</button>
                    <span class="step-val" style="min-width:2rem;">${initialRanks}</span>
                    <button class="step-btn" id="wiz-spec-rank-inc" ${initialRanks >= 20 ? 'disabled' : ''} type="button">+</button>
                  </div>
                  <span style="font-size:0.75rem;font-weight:700;color:var(--accent-primary);min-width:48px;">
                    ${ppCost} PP
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="wizard-spec-modal-footer">
            <button class="btn btn-ghost" id="btn-cancel-spec-modal" type="button">Cancel</button>
            <button class="btn btn-primary" id="btn-confirm-add-spec" ${customSubtype.trim() ? '' : 'disabled'} type="button">
              <i class="ri-add-line"></i> Add Specialization (${ppCost} PP)
            </button>
          </div>
        </div>
      </div>
    `;

    // Attach Modal Listeners
    const overlay = mount.querySelector('#wiz-spec-overlay');
    const closeBtn = mount.querySelector('#btn-close-spec-modal');
    const cancelBtn = mount.querySelector('#btn-cancel-spec-modal');
    const confirmBtn = mount.querySelector('#btn-confirm-add-spec');
    const input = mount.querySelector('#wiz-spec-name-input');

    const closeModal = () => {
      mount.innerHTML = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Base card selection
    mount.querySelectorAll('.spec-base-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedBase = card.dataset.selectBase;
        updateModalView();
      });
    });

    // Preset chips
    mount.querySelectorAll('.modal-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        customSubtype = chip.dataset.presetVal;
        updateModalView();
        const inp = mount.querySelector('#wiz-spec-name-input');
        if (inp) {
          inp.focus();
          inp.setSelectionRange(inp.value.length, inp.value.length);
        }
      });
    });

    // Name Input
    input?.addEventListener('input', (e) => {
      customSubtype = e.target.value;
      if (confirmBtn) confirmBtn.disabled = !customSubtype.trim();
      const namePreview = mount.querySelector('.spec-preview-callout span[style*="color:var(--accent-secondary)"]');
      if (namePreview) namePreview.textContent = customSubtype || 'Specialization';
    });

    // Ranks Steppers
    mount.querySelector('#wiz-spec-rank-dec')?.addEventListener('click', () => {
      if (initialRanks > 1) {
        initialRanks--;
        updateModalView();
      }
    });

    mount.querySelector('#wiz-spec-rank-inc')?.addEventListener('click', () => {
      if (initialRanks < 20) {
        initialRanks++;
        updateModalView();
      }
    });

    // Confirm Add
    confirmBtn?.addEventListener('click', () => {
      if (!customSubtype.trim()) return;
      store.addSkill({
        name: selectedBase,
        subtype: customSubtype.trim(),
        ranks: initialRanks
      });
      showToast(`Added ${selectedBase}: ${customSubtype.trim()} (+${initialRanks} Ranks)`, 'success');
      closeModal();
      renderStepSkills(container);
    });
  }

  updateModalView();
}
