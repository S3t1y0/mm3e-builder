// js/components/roll20Print.js
import { store } from '../state.js';
import { SKILLS } from '../rules/skills.js';

/**
 * Calculates movement speeds based on powers and standard speed rank 0.
 */
function getMovementData(char) {
  const moves = [
    { type: 'Ground', rank: 0, mph: '2 mph', rpd: '30 ft/rnd' }
  ];

  // Helper speed table for M&M 3e
  const speedTable = {
    0: { mph: '2 mph', rpd: '30 ft/rnd' },
    1: { mph: '4 mph', rpd: '60 ft/rnd' },
    2: { mph: '8 mph', rpd: '120 ft/rnd' },
    3: { mph: '16 mph', rpd: '250 ft/rnd' },
    4: { mph: '30 mph', rpd: '500 ft/rnd' },
    5: { mph: '60 mph', rpd: '900 ft/rnd' },
    6: { mph: '120 mph', rpd: '1800 ft/rnd' },
    7: { mph: '250 mph', rpd: '0.5 mi/rnd' },
    8: { mph: '500 mph', rpd: '1 mi/rnd' },
    9: { mph: '1000 mph', rpd: '2 mi/rnd' },
    10: { mph: '2000 mph', rpd: '4 mi/rnd' },
    11: { mph: '4000 mph', rpd: '8 mi/rnd' },
    12: { mph: '8000 mph', rpd: '16 mi/rnd' }
  };

  for (const p of char.powers) {
    const effect = (p.baseEffect || '').toLowerCase();
    let moveType = null;
    if (effect.includes('flight')) moveType = 'Flight';
    else if (effect.includes('speed')) moveType = 'Ground';
    else if (effect.includes('swimming')) moveType = 'Swimming';
    else if (effect.includes('leaping')) moveType = 'Leaping';
    else if (effect.includes('teleport')) moveType = 'Teleport';

    if (moveType) {
      const rk = p.ranks || 1;
      const speedInfo = speedTable[rk] || { mph: `Rank ${rk}`, rpd: `Rank ${rk}` };
      if (moveType === 'Ground') {
        moves[0] = { type: 'Ground', rank: rk, mph: speedInfo.mph, rpd: speedInfo.rpd };
      } else {
        moves.push({ type: moveType, rank: rk, mph: speedInfo.mph, rpd: speedInfo.rpd });
      }
    }
  }

  return moves;
}

/**
 * Calculates attack list for the Attacks table.
 */
function getAttacksData(char) {
  const attacks = [];
  const str = store.getAbility('STR');
  const fgt = store.getAbility('FGT');
  const dex = store.getAbility('DEX');

  // 1. Unarmed
  const unarmedSkill = char.skills.find(s => s.name === 'Close Combat' && /unarmed/i.test(s.subtype || ''));
  const unarmedBonus = fgt + (unarmedSkill ? unarmedSkill.ranks : 0);
  attacks.push({
    name: 'Unarmed',
    skill: unarmedSkill ? `Close Combat (${unarmedSkill.subtype})` : 'Fighting',
    mod: unarmedBonus >= 0 ? `+${unarmedBonus}` : `${unarmedBonus}`,
    attackTotal: unarmedBonus >= 0 ? `+${unarmedBonus}` : `${unarmedBonus}`,
    rank: str,
    descriptor: 'Bludgeoning Damage',
    dc: 15 + str,
    crit: '20'
  });

  // 2. Power-based attacks
  for (const p of char.powers) {
    const isAttack = ['Damage', 'Blast', 'Affliction', 'Weaken'].includes(p.baseEffect);
    if (isAttack) {
      let rollBonus = fgt;
      let skillName = 'Fighting';
      const isRanged = p.baseEffect === 'Blast' || p.range === 'Ranged';

      if (isRanged) {
        skillName = 'Dexterity';
        const rangedSkill = char.skills.find(s => s.name === 'Ranged Combat' && (new RegExp(p.name, 'i').test(s.subtype || '') || /blast/i.test(s.subtype || '')));
        rollBonus = dex + (rangedSkill ? rangedSkill.ranks : 0);
        if (rangedSkill) skillName = `Ranged Combat (${rangedSkill.subtype})`;
      }

      // Check accurate
      const accurate = (p.extras || []).find(e => e.name === 'Accurate');
      if (accurate) {
        rollBonus += (accurate.ranks || 1) * 2;
      }

      const dcBase = p.baseEffect === 'Affliction' ? 10 : 15;
      attacks.push({
        name: p.name || p.baseEffect,
        skill: skillName,
        mod: rollBonus >= 0 ? `+${rollBonus}` : `${rollBonus}`,
        attackTotal: rollBonus >= 0 ? `+${rollBonus}` : `${rollBonus}`,
        rank: p.ranks,
        descriptor: p.descriptors || (p.baseEffect === 'Affliction' ? 'Affliction' : 'Damage'),
        dc: dcBase + p.ranks,
        crit: '20'
      });
    }
  }

  // 3. Custom Attacks
  for (const c of (char.customAttacks || [])) {
    attacks.push({
      name: c.name,
      skill: c.skill || 'Custom',
      mod: c.attackBonus >= 0 ? `+${c.attackBonus}` : `${c.attackBonus}`,
      attackTotal: c.attackBonus >= 0 ? `+${c.attackBonus}` : `${c.attackBonus}`,
      rank: c.ranks || 0,
      descriptor: c.descriptor || 'Damage',
      dc: c.dc || 15,
      crit: c.crit || '20'
    });
  }

  return attacks;
}

/**
 * Builds the full skills list with calculated totals and breakdown.
 */
function getSkillsData(char) {
  const list = [];
  for (const def of SKILLS) {
    const abilityScore = store.getAbility(def.ability);

    if (def.requiresSubtype) {
      // Find matching trained subtypes
      const matches = char.skills.filter(s => s.name === def.name);
      if (matches.length > 0) {
        for (const m of matches) {
          const total = abilityScore + (m.ranks || 0);
          list.push({
            name: `${def.name} (${m.subtype || 'General'})`,
            ability: def.ability,
            totalBonus: total >= 0 ? `+${total}` : `${total}`,
            abilityMod: abilityScore >= 0 ? `+${abilityScore}` : `${abilityScore}`,
            ranks: m.ranks || 0,
            misc: 0
          });
        }
      } else {
        // Untrained base entry
        list.push({
          name: def.name,
          ability: def.ability,
          totalBonus: abilityScore >= 0 ? `+${abilityScore}` : `${abilityScore}`,
          abilityMod: abilityScore >= 0 ? `+${abilityScore}` : `${abilityScore}`,
          ranks: 0,
          misc: 0
        });
      }
    } else {
      const trained = char.skills.find(s => s.name === def.name);
      const ranks = trained ? trained.ranks : 0;
      const total = abilityScore + ranks;
      list.push({
        name: def.name,
        ability: def.ability,
        totalBonus: total >= 0 ? `+${total}` : `${total}`,
        abilityMod: abilityScore >= 0 ? `+${abilityScore}` : `${abilityScore}`,
        ranks,
        misc: 0
      });
    }
  }
  return list;
}

/**
 * Generates the complete HTML string for the Roll20 Character Sheet.
 */
export function buildRoll20SheetHtml() {
  const char = store.character;
  const pl = char.powerLevel || 10;
  const hp = char.heroPoints || 1;

  // Power Points breakdown
  const ppAbilities = store.getTotalAbilityPP();
  const ppDefenses = store.getTotalDefensePP();
  const ppSkills = store.getTotalSkillPP();
  const ppAdvantages = store.getTotalAdvantagePP();
  const ppPowers = store.getTotalPowerPP();
  
  let ppEquipment = 0;
  for (const r of (char.resources || [])) {
    ppEquipment += (r.cost || 0);
  }

  const ppTotal = ppAbilities + ppDefenses + ppSkills + ppAdvantages + ppPowers + ppEquipment;
  const ppBudget = pl * 15;

  // 8 Abilities
  const abilities = [
    { code: 'STR', name: 'STRENGTH' },
    { code: 'STA', name: 'STAMINA' },
    { code: 'AGL', name: 'AGILITY' },
    { code: 'DEX', name: 'DEXTERITY' },
    { code: 'FGT', name: 'FIGHTING' },
    { code: 'INT', name: 'INTELLECT' },
    { code: 'AWE', name: 'AWARENESS' },
    { code: 'PRE', name: 'PRESENCE' }
  ];

  // Defenses
  const defenses = [
    { code: 'DODGE', name: 'Dodge', ablCode: 'AGL' },
    { code: 'PARRY', name: 'Parry', ablCode: 'FGT' },
    { code: 'FORTITUDE', name: 'Fortitude', ablCode: 'STA' },
    { code: 'TOUGHNESS', name: 'Toughness', ablCode: 'STA' },
    { code: 'WILL', name: 'Will', ablCode: 'AWE' }
  ];

  const attacks = getAttacksData(char);
  const movements = getMovementData(char);
  const skills = getSkillsData(char);
  const initBonus = store.getDefenseBase('INITIATIVE');

  // Condition checkboxes
  const basicConditions = [
    'Dazed', 'Defenseless', 'Disabled', 'Fatigued',
    'Hindered', 'Immobile', 'Impaired', 'Stunned',
    'Transformed', 'Unaware', 'Vulnerable', 'Weakened'
  ];

  return `
    <!-- ================= PAGE 1: CORE COMBAT SHEET ================= -->
    <div class="roll20-sheet r20-page-1">
      <!-- HEADER BANNER -->
      <header class="r20-header">
        <div class="r20-price-stamp">
          <span class="price-num">12¢</span>
          <span class="price-label">PL ${pl}</span>
        </div>

        <div class="r20-title-block">
          <img class="r20-logo" src="assets/roll20/0aRNO0Z.png" alt="Mutants & Masterminds 3E" onerror="this.src='https://i.imgur.com/0aRNO0Z.png'">
          <div class="r20-real-name-bar">Real Identity: ${escapeHtml(char.identity || 'Classified')}</div>
          <h1 class="r20-hero-name">${escapeHtml(char.name || 'Hero Name').toUpperCase()}</h1>
          <div class="r20-pp-equation">
            Ability <span class="highlight">${ppAbilities}</span> + 
            Defense <span class="highlight">${ppDefenses}</span> + 
            Skill <span class="highlight">${ppSkills}</span> + 
            Advantage <span class="highlight">${ppAdvantages}</span> + 
            Powers <span class="highlight">${ppPowers}</span> + 
            Equipment <span class="highlight">${ppEquipment}</span> = 
            Total <span class="highlight">${ppTotal} / ${ppBudget} PP</span>
          </div>
        </div>

        <div class="r20-header-right">
          <div class="r20-hero-points-badge">
            <span>HERO POINTS</span>
            <span class="r20-hero-points-val">${hp}</span>
          </div>
          <div class="r20-complications-box">
            <div class="r20-complications-header">COMPLICATIONS</div>
            <div class="r20-complications-content">
              ${char.notes ? escapeHtml(char.notes).replace(/\n/g, '<br>') : '<em>Motivation: Justice / Responsibility.<br>Personal relationships, secret identity.</em>'}
            </div>
          </div>
        </div>
      </header>

      <!-- CONDITIONS & MOVEMENT ROW -->
      <div class="r20-cond-move-row">
        <!-- Conditions Panel -->
        <div class="r20-panel">
          <div class="r20-panel-title conditions-title">
            <span>CONDITIONS</span>
            <small style="font-size: 0.75rem; color: #ffcd29;">Damage & Penalties</small>
          </div>
          <div class="r20-conditions-body">
            <div class="r20-damage-track">
              <span>BRUISES / DAMAGE:</span>
              <label><input type="checkbox"> -1</label>
              <label><input type="checkbox"> -2</label>
              <label><input type="checkbox"> -3</label>
              <label><input type="checkbox"> -4</label>
              <label><input type="checkbox"> -5</label>
              <span style="margin-left: 10px; color: var(--r20-red);">• STAGGERED: <input type="checkbox"></span>
              <span style="color: var(--r20-red);">• INCAPACITATED: <input type="checkbox"></span>
            </div>
            <div class="r20-condition-chips-grid">
              ${basicConditions.map(cond => `
                <label class="r20-cond-chip">
                  <input type="checkbox" ${char.activeConditions.includes(cond) ? 'checked' : ''}>
                  <span>${cond}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Movement Panel -->
        <div class="r20-panel">
          <div class="r20-panel-title movement-title">
            <span>MOVEMENT</span>
          </div>
          <div class="r20-movement-body">
            ${movements.map(m => `
              <div class="r20-move-item">
                <strong>${m.type} (Rank ${m.rank})</strong>
                <span>${m.mph} • ${m.rpd}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- DEFENSES & ATTACKS ROW -->
      <div class="r20-defense-attack-row">
        <!-- Defenses Panel -->
        <div class="r20-panel">
          <div class="r20-panel-title defenses-title">
            <span>DEFENSES</span>
          </div>
          <table class="r20-defense-table">
            <thead>
              <tr>
                <th style="text-align: left;">Defense</th>
                <th>Total</th>
                <th>Base</th>
                <th>Bought</th>
              </tr>
            </thead>
            <tbody>
              ${defenses.map(d => {
                const total = store.getDefenseTotal(d.code);
                const base = store.getDefenseBase(d.code);
                const bought = char.defensesBought[d.code] || 0;
                return `
                  <tr>
                    <td class="r20-def-name-cell">
                      ${d.name} <span class="r20-def-sub">(${d.ablCode})</span>
                    </td>
                    <td><span class="r20-def-total-badge">${total}</span></td>
                    <td><span class="r20-def-pill">${base}</span></td>
                    <td><span class="r20-def-pill">${bought}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="r20-hits-box">
            <span>CURRENT INJURIES / HITS</span>
            <span class="r20-hits-val">0</span>
          </div>
        </div>

        <!-- Attacks & Initiative Panel -->
        <div class="r20-panel">
          <div class="r20-panel-title attacks-title">
            <span>ATTACKS & INITIATIVE</span>
            <div class="r20-init-badge">
              <span>INITIATIVE:</span>
              <span class="r20-init-val">${initBonus >= 0 ? '+' + initBonus : initBonus}</span>
            </div>
          </div>
          <table class="r20-attack-table">
            <thead>
              <tr>
                <th style="text-align: left;">Attack Name</th>
                <th>Combat Skill</th>
                <th>Attack</th>
                <th>Rnk</th>
                <th>Descriptor</th>
                <th>DC</th>
                <th>Crit</th>
              </tr>
            </thead>
            <tbody>
              ${attacks.map(atk => `
                <tr>
                  <td class="r20-attack-name-cell">${escapeHtml(atk.name)}</td>
                  <td>${escapeHtml(atk.skill)}</td>
                  <td><span class="r20-attack-bonus-badge">${atk.attackTotal}</span></td>
                  <td>${atk.rank}</td>
                  <td>${escapeHtml(atk.descriptor)}</td>
                  <td><span class="r20-dc-badge">${atk.dc}</span></td>
                  <td>${atk.crit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8 ABILITIES ROW -->
      <div class="r20-abilities-row">
        ${abilities.map(abl => {
          const score = store.getAbility(abl.code);
          return `
            <div class="r20-ability-capsule">
              <div class="r20-abl-badge">${score}</div>
              <div class="r20-abl-name">${abl.name}</div>
              <div class="r20-abl-pill">MOD: ${score >= 0 ? '+' + score : score}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 3-COLUMN LOWER SECTION -->
      <div class="r20-three-col-row">
        <!-- COLUMN 1: ADVANTAGES -->
        <div class="r20-panel">
          <div class="r20-panel-title advantages-title">
            <span>ADVANTAGES</span>
            <small style="font-size: 0.75rem; color: #ffcd29;">${char.advantages.length} Trained</small>
          </div>
          <div class="r20-adv-list">
            ${char.advantages.length === 0 ? '<em style="color:#777; padding: 6px;">No advantages purchased.</em>' : ''}
            ${char.advantages.map(adv => `
              <div class="r20-adv-item">
                <span class="r20-adv-name">${escapeHtml(adv.name)}</span>
                <span class="r20-adv-rank">${adv.ranks || 1}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- COLUMN 2: POWERS -->
        <div class="r20-panel">
          <div class="r20-panel-title attacks-title">
            <span>POWERS</span>
            <small style="font-size: 0.75rem; color: #ffcd29;">${char.powers.length} Powers</small>
          </div>
          <div class="r20-powers-list">
            ${char.powers.length === 0 ? '<em style="color:#777; padding: 6px;">No powers defined.</em>' : ''}
            ${char.powers.map(p => {
              const extrasStr = (p.extras || []).map(e => e.name).join(', ');
              const flawsStr = (p.flaws || []).map(f => f.name).join(', ');
              return `
                <div class="r20-power-card">
                  <div class="r20-power-header">
                    <span class="r20-power-name">${escapeHtml(p.name || p.baseEffect)}</span>
                    <span class="r20-power-cost">Rank ${p.ranks} • Cost: ${p.cost || p.ranks * 2} PP</span>
                  </div>
                  <div class="r20-power-body">
                    <div class="r20-power-tags">
                      <span class="r20-tag">${p.baseEffect || 'Effect'}</span>
                      <span class="r20-tag">${p.action || 'Standard'} Action</span>
                      <span class="r20-tag">${p.range || 'Close'} Range</span>
                      <span class="r20-tag">${p.duration || 'Instant'}</span>
                    </div>
                    ${p.descriptors ? `<div style="font-size:0.75rem; color:#666;"><strong>Descriptors:</strong> ${escapeHtml(p.descriptors)}</div>` : ''}
                    ${extrasStr ? `<div style="font-size:0.72rem; color:var(--r20-green-dark);"><strong>Extras:</strong> ${escapeHtml(extrasStr)}</div>` : ''}
                    ${flawsStr ? `<div style="font-size:0.72rem; color:var(--r20-red);"><strong>Flaws:</strong> ${escapeHtml(flawsStr)}</div>` : ''}
                    ${p.notes ? `<div class="r20-power-desc">${escapeHtml(p.notes)}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COLUMN 3: SKILLS -->
        <div class="r20-panel">
          <div class="r20-panel-title skills-title">
            <span>SKILLS</span>
            <small style="font-size: 0.75rem; color: #ffcd29;">${skills.length} Skills</small>
          </div>
          <div class="r20-skills-list">
            ${skills.map(sk => `
              <div class="r20-skill-item">
                <span class="r20-skill-bonus">${sk.totalBonus}</span>
                <span class="r20-skill-name">${escapeHtml(sk.name)}</span>
                <span class="r20-skill-breakdown">${sk.ability} ${sk.abilityMod} + Rnk ${sk.ranks}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ================= PAGE 2: DETAILS, EQUIPMENT, NOTES ================= -->
    <div class="roll20-sheet r20-page-2">
      <!-- HEADER 2 -->
      <div class="r20-panel" style="margin-bottom: 15px;">
        <div class="r20-panel-title">
          <span>CHARACTER BACKGROUND & BIOGRAPHY</span>
          <span style="font-size: 0.85rem; color: #ffcd29;">${escapeHtml(char.name || 'Hero')}</span>
        </div>
        <div class="r20-bio-grid">
          <div class="r20-bio-item"><strong>Hero Name:</strong> ${escapeHtml(char.name || 'Hero Name')}</div>
          <div class="r20-bio-item"><strong>Real Identity:</strong> ${escapeHtml(char.identity || 'Secret Alter Ego')}</div>
          <div class="r20-bio-item"><strong>Status:</strong> ${char.isSecretIdentity ? 'Secret Identity' : 'Public ID'}</div>
          <div class="r20-bio-item"><strong>Player:</strong> ${escapeHtml(char.player || '-')}</div>
          <div class="r20-bio-item"><strong>Base of Operations:</strong> ${escapeHtml(char.baseOfOperations || 'Freedom City')}</div>
          <div class="r20-bio-item"><strong>Power Level:</strong> ${pl}</div>
        </div>
      </div>

      <!-- EQUIPMENT & VEHICLES / HEADQUARTERS -->
      <div class="r20-equip-grid">
        <!-- Equipment Table -->
        <div class="r20-panel">
          <div class="r20-panel-title">
            <span>EQUIPMENT & DEVICES</span>
            <small style="font-size: 0.75rem; color: #ffcd29;">Total EP: ${ppEquipment * 5}</small>
          </div>
          <table class="r20-equip-table">
            <thead>
              <tr>
                <th>Item / Gear Name</th>
                <th>Type</th>
                <th>Cost (EP)</th>
              </tr>
            </thead>
            <tbody>
              ${(char.resources || []).length === 0 ? '<tr><td colspan="3" style="color:#888; font-style: italic;">No equipment assigned.</td></tr>' : ''}
              ${(char.resources || []).map(res => `
                <tr>
                  <td><strong>${escapeHtml(res.name || 'Item')}</strong></td>
                  <td>${escapeHtml(res.type || 'Gear')}</td>
                  <td>${res.cost || 1} EP</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Motivations & Complications Narrative -->
        <div class="r20-panel">
          <div class="r20-panel-title complications-title">
            <span>MOTIVATION & COMPLICATIONS</span>
          </div>
          <div style="padding: 10px 14px; font-size: 0.85rem; line-height: 1.4;">
            ${char.notes ? escapeHtml(char.notes).replace(/\n/g, '<br>') : `
              <p><strong>Motivation: Responsibility:</strong> Driven to protect the innocent and uphold order against emerging superhuman threats.</p>
              <p><strong>Complication: Secret Identity:</strong> Maintains a civilian double-life, requiring continuous care to avoid exposing loved ones.</p>
              <p><strong>Complication: Enemy:</strong> Has recurrent arch-villains plotting retribution.</p>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Updates the print sheet DOM element.
 */
export function updateRoll20PrintSheet() {
  const container = document.getElementById('roll20-print-sheet');
  if (container) {
    container.innerHTML = buildRoll20SheetHtml();
  }

  const modalContainer = document.getElementById('roll20-preview-content');
  if (modalContainer) {
    modalContainer.innerHTML = buildRoll20SheetHtml();
  }
}

/**
 * Opens the on-screen Roll20 PDF preview modal.
 */
export function openRoll20Preview() {
  updateRoll20PrintSheet();
  const modal = document.getElementById('roll20-preview-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Closes the preview modal.
 */
export function closeRoll20Preview() {
  const modal = document.getElementById('roll20-preview-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Initiates the browser print dialog with the Roll20 layout populated.
 */
export function printRoll20Sheet() {
  updateRoll20PrintSheet();
  window.print();
}

/**
 * Initializes listeners and hooks for Roll20 printing.
 */
export function initRoll20Print() {
  // Update on print dialog trigger
  window.addEventListener('beforeprint', () => {
    updateRoll20PrintSheet();
  });

  // Wire preview modal buttons if present
  document.getElementById('btn-roll20-preview-close')?.addEventListener('click', closeRoll20Preview);
  document.getElementById('btn-roll20-preview-print')?.addEventListener('click', printRoll20Sheet);
}
