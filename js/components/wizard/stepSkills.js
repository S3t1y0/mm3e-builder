// js/components/wizard/stepSkills.js
import { store } from '../../state.js';
import { SKILLS, SKILL_RANKS_PER_PP } from '../../rules/skills.js';

let activeCategory = 'All';

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
        <button class="btn btn-secondary btn-xs" id="wiz-btn-add-custom-skill">
          <i class="ri-add-line"></i> Add Subtyped Skill (Combat / Expertise)
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

  // Custom skill modal / quick add
  document.getElementById('wiz-btn-add-custom-skill')?.addEventListener('click', () => {
    openSubtypeQuickAdd(container);
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

  // Also include any user-added subtyped skills for this category
  const addedSkills = char.skills;

  let html = '';

  // 1. Standard base skills
  filteredSkills.forEach(ruleSkill => {
    if (ruleSkill.requiresSubtype) {
      // Show subtyped instances currently on character
      const instances = addedSkills.filter(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());
      if (instances.length > 0) {
        instances.forEach(inst => {
          html += renderSkillRow(inst.name, inst.subtype, ruleSkill.ability, inst.ranks, inst.id, ruleSkill.desc);
        });
      }
      // Add prompt row to add a new specialization
      html += `
        <div class="wizard-skill-item" style="border-style: dashed; background: transparent;">
          <div class="wizard-skill-meta">
            <span class="wizard-skill-name" style="color: var(--accent-secondary);">+ Add ${ruleSkill.name} Specialization</span>
            <span class="wizard-skill-ability">Key Ability: ${ruleSkill.ability} • (e.g. ${ruleSkill.commonSubtypes?.slice(0, 3).join(', ') || 'Various'})</span>
          </div>
          <div style="grid-column: span 3; text-align: right;">
            <button class="btn btn-ghost btn-xs btn-add-sub-trigger" data-name="${ruleSkill.name}">
              <i class="ri-add-line"></i> Add ${ruleSkill.name}
            </button>
          </div>
        </div>
      `;
    } else {
      const match = addedSkills.find(s => s.name.toLowerCase() === ruleSkill.name.toLowerCase());
      const ranks = match ? match.ranks : 0;
      const skillId = match ? match.id : null;
      html += renderSkillRow(ruleSkill.name, '', ruleSkill.ability, ranks, skillId, ruleSkill.desc);
    }
  });

  listEl.innerHTML = html;

  // Bind Steppers
  listEl.querySelectorAll('.btn-sk-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const subtype = btn.dataset.subtype || '';
      const currentRanks = parseInt(btn.dataset.ranks, 10) || 0;

      if (id) {
        store.updateSkill(id, currentRanks - 1);
      }
      renderStepSkills(container);
    });
  });

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

  listEl.querySelectorAll('.btn-add-sub-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const skillName = btn.dataset.name;
      const rule = SKILLS.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      const promptSubtype = prompt(`Enter specialization for ${skillName} (e.g. ${rule?.commonSubtypes?.join(', ') || 'Custom'}):`);
      if (promptSubtype && promptSubtype.trim()) {
        store.addSkill({ name: skillName, subtype: promptSubtype.trim(), ranks: 2 });
        renderStepSkills(container);
      }
    });
  });
}

function renderSkillRow(name, subtype, abilityKey, ranks, id, desc) {
  const abilityVal = store.getAbility(abilityKey);
  const totalBonus = abilityVal + ranks;
  const fullName = subtype ? `${name}: ${subtype}` : name;

  return `
    <div class="wizard-skill-item">
      <div class="wizard-skill-meta">
        <span class="wizard-skill-name">${fullName}</span>
        <span class="wizard-skill-ability">Key Ability: <strong>${abilityKey}</strong> (${abilityVal >= 0 ? `+${abilityVal}` : abilityVal})</span>
      </div>

      <div style="text-align: center;">
        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">BONUS</span>
        <span class="wizard-skill-bonus">${totalBonus >= 0 ? `+${totalBonus}` : totalBonus}</span>
      </div>

      <div style="display: flex; align-items: center; justify-content: center;">
        <div class="stepper">
          <button class="step-btn btn-sk-dec" data-id="${id || ''}" data-name="${name}" data-subtype="${subtype}" data-ranks="${ranks}" ${ranks <= 0 ? 'disabled' : ''}>-</button>
          <span class="step-val" style="font-size: 1rem; min-width: 1.75rem;">${ranks}</span>
          <button class="step-btn btn-sk-inc" data-id="${id || ''}" data-name="${name}" data-subtype="${subtype}" data-ranks="${ranks}">+</button>
        </div>
      </div>

      <div style="text-align: right; font-size: 0.75rem; color: var(--text-secondary);">
        ${ranks > 0 ? `${ranks} Ranks` : '<span style="color: var(--text-muted);">Untrained</span>'}
      </div>
    </div>
  `;
}

function openSubtypeQuickAdd(container) {
  const subtypable = SKILLS.filter(s => s.requiresSubtype);
  const choice = prompt(`Choose skill to specialize:\n` + subtypable.map((s, idx) => `${idx + 1}. ${s.name}`).join('\n'));
  const num = parseInt(choice, 10);
  if (num >= 1 && num <= subtypable.length) {
    const selected = subtypable[num - 1];
    const subtype = prompt(`Enter subtype/specialization for ${selected.name} (e.g. ${selected.commonSubtypes?.join(', ')}):`);
    if (subtype && subtype.trim()) {
      store.addSkill({ name: selected.name, subtype: subtype.trim(), ranks: 2 });
      renderStepSkills(container);
    }
  }
}
