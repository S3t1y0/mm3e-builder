import { store } from '../state.js';
import { showToast, showConfirmModal } from './notifications.js';
import { rollCheck } from './quickDiceRoller.js';

let activeFilter = 'All';

export function renderTargetedEffects(container) {
  const char = store.character;
  const str = store.getAbility('STR');
  const fgt = store.getAbility('FGT');

  // Close combat unarmed skill check
  const unarmedSkill = char.skills.find(s => s.name === 'Close Combat' && /unarmed/i.test(s.subtype || ''));
  const unarmedAttackBonus = fgt + (unarmedSkill ? unarmedSkill.ranks : 0);

  // Compile list of attacks
  const attacks = [];

  // 1. Basic Unarmed
  attacks.push({
    id: 'unarmed_basic',
    type: 'basic',
    name: 'Unarmed',
    rollBonus: unarmedAttackBonus,
    range: 'Close',
    effectName: 'Damage',
    effectRank: str,
    dc: 15 + str,
    resistance: 'Toughness',
    crit: '20',
    tags: ['Attack roll', 'Resistance']
  });

  // 2. Attacks derived from Powers
  const buildPowerAttack = ({ power, eff, slotId = 'main', slotName = null }) => {
    if (!eff) return null;
    const baseEffect = eff.baseEffect || eff.name || 'Damage';
    const isAttackEffect = ['Damage', 'Blast', 'Affliction', 'Weaken'].includes(baseEffect);
    if (!isAttackEffect) return null;

    const isArray = power.type === 'array' || (Array.isArray(power.alternateEffects) && power.alternateEffects.length > 0);
    const isPowerActive = power.active !== false;
    const activeSlot = power.activeSlotId || 'main';

    let isActiveSlot = true;
    let isStandby = false;
    if (isArray) {
      if (slotId === 'main') {
        isActiveSlot = isPowerActive && (activeSlot === 'main' || !power.alternateEffects.some(s => s.id === activeSlot));
      } else {
        isActiveSlot = isPowerActive && (activeSlot === slotId);
      }
      isStandby = isPowerActive && !isActiveSlot;
    }

    const isInactive = !isPowerActive;

    let rollBonus = fgt;
    const isRanged = baseEffect === 'Blast' || eff.range === 'Ranged';
    if (isRanged) {
      const dex = store.getAbility('DEX');
      const searchPattern = slotName || power.name;
      const rangedSkill = char.skills.find(s => s.name === 'Ranged Combat' && (new RegExp(searchPattern, 'i').test(s.subtype || '') || /blast/i.test(s.subtype || '')));
      rollBonus = dex + (rangedSkill ? rangedSkill.ranks : 0);
    }

    const extras = eff.extras || [];
    const accurate = extras.find(e => e.name === 'Accurate');
    if (accurate) {
      rollBonus += (accurate.ranks || 1) * 2;
    }

    const tags = ['Attack roll', 'Resistance'];
    if (extras.some(e => e.name === 'Area')) tags.push('Area');
    if (extras.some(e => e.name === 'Affects Others')) tags.push('Affects Others');

    const resistance = eff.resistance || (baseEffect === 'Affliction' ? 'Fortitude' : 'Toughness');
    const dcBase = baseEffect === 'Affliction' ? 10 : 15;
    const ranks = eff.ranks || 1;

    let displayName = slotName || eff.name || power.name || baseEffect;
    if (isArray && slotId !== 'main' && power.name && !displayName.startsWith(power.name)) {
      displayName = `${power.name}: ${displayName}`;
    }

    return {
      id: slotId === 'main' ? power.id : `${power.id}_${slotId}`,
      powerId: power.id,
      slotId,
      type: 'power',
      name: displayName,
      rollBonus,
      range: eff.range || (baseEffect === 'Blast' ? 'Ranged' : 'Close'),
      effectName: baseEffect,
      effectRank: ranks,
      dc: dcBase + ranks,
      resistance,
      crit: '20',
      tags,
      isArray,
      isActiveSlot,
      isStandby,
      isInactive
    };
  };

  for (const power of char.powers) {
    const mainEff = power.mainEffect || {
      baseEffect: power.baseEffect,
      ranks: power.ranks,
      range: power.range,
      action: power.action,
      duration: power.duration,
      resistance: power.resistance,
      extras: power.extras,
      flaws: power.flaws,
      name: power.mainEffect?.name || power.name
    };
    const mainAtk = buildPowerAttack({
      power,
      eff: mainEff,
      slotId: 'main',
      slotName: power.name || mainEff.name
    });
    if (mainAtk) attacks.push(mainAtk);

    // Also include primary linked attack effects
    if (Array.isArray(power.linkedEffects)) {
      power.linkedEffects.forEach((le, lIdx) => {
        const linkedAtk = buildPowerAttack({
          power,
          eff: le,
          slotId: 'main',
          slotName: `${power.name || mainEff.name} + ${le.name || le.baseEffect}`
        });
        if (linkedAtk) {
          linkedAtk.id = `${power.id}_linked_${lIdx}`;
          linkedAtk.isLinked = true;
          attacks.push(linkedAtk);
        }
      });
    }

    if (Array.isArray(power.alternateEffects)) {
      for (const slot of power.alternateEffects) {
        const slotEff = slot.effect || slot;
        const slotAtk = buildPowerAttack({
          power,
          eff: slotEff,
          slotId: slot.id,
          slotName: slot.name || slotEff.name
        });
        if (slotAtk) attacks.push(slotAtk);

        // Also include alternate slot linked attack effects
        if (Array.isArray(slot.linkedEffects)) {
          slot.linkedEffects.forEach((le, lIdx) => {
            const slotLinkedAtk = buildPowerAttack({
              power,
              eff: le,
              slotId: slot.id,
              slotName: `${slot.name || slotEff.name} + ${le.name || le.baseEffect}`
            });
            if (slotLinkedAtk) {
              slotLinkedAtk.id = `${power.id}_${slot.id}_linked_${lIdx}`;
              slotLinkedAtk.isLinked = true;
              attacks.push(slotLinkedAtk);
            }
          });
        }
      }
    }
  }

  // 3. Custom Attacks
  for (const custom of char.customAttacks) {
    const dcBase = (custom.resistance === 'Fortitude' || custom.resistance === 'Will' || custom.resistance === 'Dodge') ? 10 : 15;
    attacks.push({
      id: custom.id,
      type: 'custom',
      name: custom.name,
      rollBonus: custom.attackBonus || 0,
      range: custom.range || 'Close',
      effectName: custom.descriptor || 'Damage',
      effectRank: custom.effectRank || 0,
      dc: dcBase + (custom.effectRank || 0),
      resistance: custom.resistance || 'Toughness',
      crit: custom.crit || '20',
      tags: ['Attack roll', 'Resistance']
    });
  }

  // 4. Equipped Weapons from Resources / Equipment
  for (const r of (char.resources || [])) {
    const isEquipped = r.status === 'equipped' || !r.status;
    if (!isEquipped) continue;

    // Check if weapon
    const isWeapon = r.subtype?.startsWith('weapon') || r.weapon != null || (/Damage\s+\d+/i.test(r.desc || ''));
    if (!isWeapon) continue;

    const w = r.weapon || {};
    const isStrengthBased = w.isStrengthBased ?? (/Strength-based/i.test(r.desc || ''));
    const isRanged = w.range === 'Ranged' || (/Ranged/i.test(r.desc || '') && !/Close/i.test(w.range || ''));

    // Extract damage rank
    let dmgRank = w.damageRank;
    if (dmgRank === undefined) {
      const match = (r.desc || '').match(/Damage\s+(\d+)/i);
      dmgRank = match ? parseInt(match[1], 10) : 1;
    }

    const traits = Array.isArray(w.traits) ? w.traits : [];
    const isAffliction = traits.includes('Affliction') || /Affliction/i.test(r.desc || '');

    // Calculate attack bonus
    let rollBonus = 0;
    if (isRanged) {
      const dex = store.getAbility('DEX');
      const rangedSkill = char.skills.find(s => s.name === 'Ranged Combat' && (
        new RegExp(r.name, 'i').test(s.subtype || '') ||
        /firearm|guns|pistol|rifle|projectile/i.test(s.subtype || '')
      ));
      rollBonus = dex + (rangedSkill ? rangedSkill.ranks : 0) + (w.attackBonus || 0);
    } else {
      const fgt = store.getAbility('FGT');
      const closeSkill = char.skills.find(s => s.name === 'Close Combat' && (
        new RegExp(r.name, 'i').test(s.subtype || '') ||
        /blades|swords|melee|unarmed|axes/i.test(s.subtype || '')
      ));
      rollBonus = fgt + (closeSkill ? closeSkill.ranks : 0) + (w.attackBonus || 0);
    }

    // Effective rank and DC
    const effectiveRank = isStrengthBased ? (str + dmgRank) : dmgRank;
    const dcBase = isAffliction ? 10 : 15;
    const resistance = w.resistance || (isAffliction ? 'Fortitude' : 'Toughness');
    const crit = w.crit || (/Critical\s+([0-9-]+)/i.exec(r.desc || '')?.[1]) || '20';

    const tags = ['Attack roll', 'Resistance'];
    if (traits.some(t => /area/i.test(t)) || /Area/i.test(r.desc || '')) tags.push('Area');
    if (traits.some(t => /multiattack/i.test(t)) || /Multiattack/i.test(r.desc || '')) tags.push('Multiattack');

    attacks.push({
      id: `equip_${r.id}`,
      type: 'equipment',
      name: `${r.name}`,
      rollBonus,
      range: isRanged ? 'Ranged' : 'Close',
      effectName: isAffliction ? 'Affliction' : (isStrengthBased ? `Damage (STR-based ${dmgRank})` : 'Damage'),
      effectRank: effectiveRank,
      dc: dcBase + effectiveRank,
      resistance,
      crit,
      tags,
      equipmentId: r.id
    });
  }

  // Filter
  const filtered = attacks.filter(atk => {
    if (activeFilter === 'All') return true;
    return atk.tags.includes(activeFilter);
  });

  container.innerHTML = `
    <div class="targeted-effects-card">
      <div class="targeted-header">
        <div class="targeted-title">
          <span class="icon"><i class="ri-crosshair-2-line"></i></span>
          <h3>Targeted Effects</h3>
        </div>
        <div class="targeted-filter-tags">
          ${['All', 'Attack roll', 'Resistance', 'Area', 'Affects Others'].map(tag => `
            <button class="filter-pill ${activeFilter === tag ? 'active' : ''}" data-filter="${tag}">
              ${tag}
            </button>
          `).join('')}
        </div>
      </div>
      <p class="targeted-desc">Profiles derived from their source and mechanical rules. Tags identify rolls, resistance checks, and applied modifiers.</p>

      <div class="attacks-list">
        ${filtered.length === 0 ? `<div class="empty-hint">No attacks matching filter "${activeFilter}".</div>` : ''}
        ${filtered.map(atk => `
          <div class="attack-card ${atk.type} ${atk.isInactive ? 'inactive-attack' : ''} ${atk.isStandby ? 'standby-attack' : ''}">
            <div class="attack-main">
              <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                <span class="attack-badge ${atk.type}">${atk.slotId && atk.slotId !== 'main' ? 'ARRAY SLOT' : atk.type.toUpperCase()}</span>
                ${atk.isLinked ? `<span class="badge" style="font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35);"><i class="ri-links-line"></i> LINKED</span>` : ''}
                ${atk.isInactive ? `<span class="badge" style="font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35);"><i class="ri-forbid-line"></i> DEACTIVATED</span>` : ''}
                ${atk.isStandby ? `<span class="badge" style="font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35);"><i class="ri-pause-circle-line"></i> STANDBY</span>` : ''}
                ${atk.type === 'power' && !atk.isInactive && !atk.isStandby ? `<span class="badge" style="font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);"><i class="ri-flashlight-fill"></i> ACTIVE</span>` : ''}
              </div>
              <h4 class="attack-name">${escapeHtml(atk.name)}</h4>
              ${atk.isInactive ? `
                <button class="roll-btn" disabled style="opacity: 0.45; cursor: not-allowed;" title="Power is deactivated on Character Sheet">
                  <i class="ri-forbid-line"></i> Deactivated
                </button>
              ` : atk.isStandby ? `
                <button class="btn-switch-and-roll" data-switch-power="${atk.powerId}" data-switch-slot="${atk.slotId}" data-bonus="${atk.rollBonus}" title="Switch Array active slot to this attack (Free Action) and roll">
                  <i class="ri-flashlight-line"></i> Switch & Roll d20${atk.rollBonus >= 0 ? '+' + atk.rollBonus : atk.rollBonus}
                </button>
              ` : `
                <button class="roll-btn" data-attack-id="${atk.id}" data-bonus="${atk.rollBonus}" title="Roll d20 + Attack">
                  <i class="ri-dice-line"></i> Roll d20${atk.rollBonus >= 0 ? '+' + atk.rollBonus : atk.rollBonus}
                </button>
              `}
            </div>
            <div class="attack-metrics">
              <div class="metric">
                <span class="m-label">ROLL BONUS</span>
                <span class="m-val highlight">${atk.rollBonus >= 0 ? '+' + atk.rollBonus : atk.rollBonus}</span>
              </div>
              <div class="metric">
                <span class="m-label">RANGE</span>
                <span class="m-val">${escapeHtml(atk.range)}</span>
              </div>
              <div class="metric">
                <span class="m-label">EFFECT</span>
                <span class="m-val">${escapeHtml(atk.effectName)} ${atk.effectRank}</span>
              </div>
              <div class="metric">
                <span class="m-label">RESISTANCE</span>
                <span class="m-val">${escapeHtml(atk.resistance)} (DC ${atk.dc})</span>
              </div>
            </div>
            ${atk.type === 'custom' ? `
              <div class="atk-action-btns">
                <button class="edit-atk-btn" data-edit-atk="${atk.id}" title="Edit custom attack"><i class="ri-edit-line"></i></button>
                <button class="remove-atk-btn" data-delete-atk="${atk.id}" data-atk-name="${escapeHtml(atk.name)}" title="Remove custom attack"><i class="ri-delete-bin-line"></i></button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="targeted-actions">
        <button id="btn-add-custom-atk" class="btn btn-secondary btn-sm">
          <i class="ri-add-line"></i> Add Custom Attack
        </button>
      </div>

      <!-- Roll Result Overlay / Toast Container -->
      <div id="attack-roll-result" class="roll-result-banner" style="display: none;"></div>
    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderTargetedEffects(container);
    });
  });

  // Roll button click
  container.querySelectorAll('.roll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bonus = parseInt(btn.dataset.bonus, 10) || 0;
      const atkId = btn.dataset.attackId;
      const atk = attacks.find(a => a.id === atkId);
      const atkName = atk?.name || 'Attack';
      const dcMatch = atk?.resistance?.match(/DC\s*(\d+)/i);
      const defaultDC = dcMatch ? parseInt(dcMatch[1], 10) : (atk?.dc || 15);

      // Universal Quick Roll HUD
      const res = rollCheck({
        name: atkName,
        type: 'attack',
        bonus,
        subtitle: `Targeted Effect Attack Check • ${atk?.range || 'Close'} • ${atk?.resistance || 'Toughness'}`,
        extra: {
          dc: atk?.dc || defaultDC,
          resistance: atk?.resistance || 'Toughness',
          descriptor: atk?.effectName || atk?.descriptor || '',
          range: atk?.range || 'Close',
          crit: atk?.crit || '20',
          effectRank: atk?.effectRank || 0
        }
      });

      const d20 = res.d20;
      const total = res.total;
      const isCrit = res.isCrit;

      const banner = container.querySelector('#attack-roll-result');
      if (banner) {
        banner.style.display = 'flex';
        banner.innerHTML = `
          <div class="roll-box ${isCrit ? 'crit' : ''}">
            <span class="d20-die"><i class="ri-dice-line"></i> ${d20}</span>
            <span class="roll-formula">+ ${bonus} = <strong>${total}</strong></span>
            ${isCrit ? '<span class="crit-badge">NATURAL 20! CRITICAL HIT!</span>' : ''}
          </div>
          <button class="close-roll-btn" title="Close roll result"><i class="ri-close-line"></i></button>
        `;
        banner.querySelector('.close-roll-btn').addEventListener('click', () => {
          banner.style.display = 'none';
        });
      }
    });
  });

  // Switch array active slot and roll
  container.querySelectorAll('.btn-switch-and-roll').forEach(btn => {
    btn.addEventListener('click', () => {
      const powerId = btn.dataset.switchPower;
      const slotId = btn.dataset.switchSlot;
      const bonus = parseInt(btn.dataset.bonus, 10) || 0;

      if (powerId && slotId) {
        store.setActiveArraySlot(powerId, slotId);
        showToast('Switched active Array slot (Free Action)', 'info');
      }

      const atk = attacks.find(a => a.powerId === powerId && a.slotId === slotId) || attacks.find(a => a.powerId === powerId);
      const atkName = atk?.name || 'Array Attack';

      // Universal Quick Roll HUD
      const res = rollCheck({
        name: atkName,
        type: 'attack',
        bonus,
        subtitle: `Switched Array Slot (Free Action) • Attack Check`,
        extra: {
          dc: atk?.dc || 15,
          resistance: atk?.resistance || 'Toughness',
          descriptor: atk?.effectName || '',
          range: atk?.range || 'Close',
          crit: atk?.crit || '20',
          effectRank: atk?.effectRank || 0
        }
      });

      const d20 = res.d20;
      const total = res.total;
      const isCrit = res.isCrit;

      const banner = container.querySelector('#attack-roll-result');
      if (banner) {
        banner.style.display = 'flex';
        banner.innerHTML = `
          <div class="roll-box ${isCrit ? 'crit' : ''}">
            <span class="d20-die"><i class="ri-dice-line"></i> ${d20}</span>
            <span class="roll-formula">+ ${bonus} = <strong>${total}</strong></span>
            ${isCrit ? '<span class="crit-badge">NATURAL 20! CRITICAL HIT!</span>' : ''}
          </div>
          <button class="close-roll-btn" title="Close roll result"><i class="ri-close-line"></i></button>
        `;
        banner.querySelector('.close-roll-btn').addEventListener('click', () => {
          banner.style.display = 'none';
        });
      }
    });
  });

  // Edit custom attack modal trigger
  container.querySelectorAll('[data-edit-atk]').forEach(btn => {
    btn.addEventListener('click', () => {
      openCustomAttackModal(btn.dataset.editAtk);
    });
  });

  // Delete custom attack with user-friendly confirmation modal
  container.querySelectorAll('[data-delete-atk]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const atkId = btn.dataset.deleteAtk;
      const atkName = btn.dataset.atkName || 'this custom attack';
      const confirmed = await showConfirmModal({
        title: 'Delete Custom Attack',
        message: `Are you sure you want to remove "${atkName}" from your attack profiles?`,
        confirmText: 'Delete Attack',
        cancelText: 'Cancel',
        isDanger: true,
        icon: '<i class="ri-delete-bin-line"></i>'
      });
      if (confirmed) {
        store.removeCustomAttack(atkId);
        showToast(`Attack "${atkName}" removed successfully.`, 'info');
      }
    });
  });

  // Add custom attack modal trigger (User-friendly modal instead of browser prompt alert)
  const addBtn = container.querySelector('#btn-add-custom-atk');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openCustomAttackModal();
    });
  }
}

/**
 * Opens a modern, user-friendly modal dialog for creating or editing custom attacks.
 * Replaces disruptive consecutive prompt() alerts.
 */
export function openCustomAttackModal(attackIdToEdit = null) {
  let modal = document.getElementById('custom-attack-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'custom-attack-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const isEditing = Boolean(attackIdToEdit);
  const existing = isEditing 
    ? store.character.customAttacks.find(a => a.id === attackIdToEdit)
    : null;

  const data = existing ? { ...existing } : {
    name: '',
    attackBonus: 8,
    effectRank: 8,
    range: 'Ranged',
    resistance: 'Toughness',
    descriptor: 'Energy, Ballistic',
    crit: '20'
  };

  const getDc = (res, rank) => {
    const base = (res === 'Fortitude' || res === 'Will' || res === 'Dodge') ? 10 : 15;
    return base + (parseInt(rank, 10) || 0);
  };

  modal.innerHTML = `
    <div class="modal-dialog modal-md">
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="modal-title-icon" style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: rgba(245, 158, 11, 0.15); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
            <i class="ri-sword-line"></i>
          </div>
          <div>
            <h3 class="modal-title">${isEditing ? 'Edit Custom Attack' : 'Add Custom Attack'}</h3>
            <p class="modal-subtitle" style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Configure weapon, gadget, or specialized combat attack parameters.</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" id="btn-close-custom-atk-modal" aria-label="Close modal"><i class="ri-close-line"></i></button>
      </div>

      <form id="custom-atk-form" class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
        <div class="field-group">
          <label for="custom-atk-name" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
            <i class="ri-shield-flash-line"></i> Attack Name *
          </label>
          <input type="text" id="custom-atk-name" class="text-input" placeholder="e.g. Plasma Pistol, Katana, Sniper Rifle, Psionic Blast" value="${escapeHtml(data.name)}" required autofocus style="font-size: 0.95rem; font-weight: 600;">
        </div>

        <div class="custom-atk-grid">
          <div class="field-group">
            <label for="custom-atk-bonus" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              <i class="ri-focus-2-line"></i> Attack Check Bonus (+X)
            </label>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button type="button" class="btn btn-secondary btn-xs" id="atk-bonus-dec" style="width: 32px; height: 32px; padding: 0;">-</button>
              <input type="number" id="custom-atk-bonus" class="text-input" value="${data.attackBonus}" style="text-align: center; font-weight: 800; font-size: 1rem; width: 60px; min-width: 44px;">
              <button type="button" class="btn btn-secondary btn-xs" id="atk-bonus-inc" style="width: 32px; height: 32px; padding: 0;">+</button>
            </div>
          </div>

          <div class="field-group">
            <label for="custom-atk-rank" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              <i class="ri-flashlight-line"></i> Effect / Damage Rank
            </label>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button type="button" class="btn btn-secondary btn-xs" id="atk-rank-dec" style="width: 32px; height: 32px; padding: 0;">-</button>
              <input type="number" id="custom-atk-rank" class="text-input" value="${data.effectRank}" min="0" max="25" style="text-align: center; font-weight: 800; font-size: 1rem; width: 60px; min-width: 44px;">
              <button type="button" class="btn btn-secondary btn-xs" id="atk-rank-inc" style="width: 32px; height: 32px; padding: 0;">+</button>
            </div>
          </div>
        </div>

        <div class="custom-atk-grid">
          <div class="field-group">
            <label for="custom-atk-range" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              <i class="ri-compass-3-line"></i> Range
            </label>
            <select id="custom-atk-range" class="text-input" style="cursor: pointer;">
              <option value="Close" ${data.range === 'Close' ? 'selected' : ''}>Close (Melee)</option>
              <option value="Ranged" ${data.range === 'Ranged' ? 'selected' : ''}>Ranged</option>
              <option value="Perception" ${data.range === 'Perception' ? 'selected' : ''}>Perception Range</option>
            </select>
          </div>

          <div class="field-group">
            <label for="custom-atk-resistance" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              <i class="ri-shield-line"></i> Resisted By
            </label>
            <select id="custom-atk-resistance" class="text-input" style="cursor: pointer;">
              <option value="Toughness" ${data.resistance === 'Toughness' ? 'selected' : ''}>Toughness (Damage DC 15+Rank)</option>
              <option value="Fortitude" ${data.resistance === 'Fortitude' ? 'selected' : ''}>Fortitude (Poison/Affliction DC 10+Rank)</option>
              <option value="Will" ${data.resistance === 'Will' ? 'selected' : ''}>Will (Mental/Affliction DC 10+Rank)</option>
              <option value="Dodge" ${data.resistance === 'Dodge' ? 'selected' : ''}>Dodge (Area/Snare DC 10+Rank)</option>
            </select>
          </div>
        </div>

        <div class="custom-atk-grid-desc">
          <div class="field-group">
            <label for="custom-atk-descriptor" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              <i class="ri-price-tag-3-line"></i> Descriptors / Type
            </label>
            <input type="text" id="custom-atk-descriptor" class="text-input" placeholder="e.g. Slashing, Energy, Ballistic, Fire" value="${escapeHtml(data.descriptor || '')}">
          </div>

          <div class="field-group">
            <label for="custom-atk-crit" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              <i class="ri-sparkling-fill"></i> Critical Hit
            </label>
            <select id="custom-atk-crit" class="text-input" style="cursor: pointer;">
              <option value="20" ${data.crit === '20' ? 'selected' : ''}>20 (Standard)</option>
              <option value="19-20" ${data.crit === '19-20' ? 'selected' : ''}>19-20 (Imp. Crit 1)</option>
              <option value="18-20" ${data.crit === '18-20' ? 'selected' : ''}>18-20 (Imp. Crit 2)</option>
              <option value="17-20" ${data.crit === '17-20' ? 'selected' : ''}>17-20 (Imp. Crit 3)</option>
            </select>
          </div>
        </div>

        <!-- Live Preview Box -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-size: 0.68rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase;">Live Attack Card Preview:</span>
            <span id="preview-dc-tag" style="font-size: 0.75rem; font-weight: 700; color: var(--accent-amber);">DC ${getDc(data.resistance, data.effectRank)}</span>
          </div>
          <div id="custom-atk-live-preview"></div>
        </div>
      </form>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; background: var(--bg-elevated); border-top: 1px solid var(--border-color);">
        <button type="button" class="btn btn-ghost" id="btn-cancel-custom-atk">Cancel</button>
        <button type="button" class="btn btn-primary" id="btn-save-custom-atk">
          <i class="ri-check-line"></i> ${isEditing ? 'Save Changes' : 'Add Attack Profile'}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  // Input elements
  const nameInput = modal.querySelector('#custom-atk-name');
  const bonusInput = modal.querySelector('#custom-atk-bonus');
  const rankInput = modal.querySelector('#custom-atk-rank');
  const rangeInput = modal.querySelector('#custom-atk-range');
  const resistanceInput = modal.querySelector('#custom-atk-resistance');
  const descInput = modal.querySelector('#custom-atk-descriptor');
  const critInput = modal.querySelector('#custom-atk-crit');
  const previewBox = modal.querySelector('#custom-atk-live-preview');
  const previewDcTag = modal.querySelector('#preview-dc-tag');

  // Update preview function
  const updatePreview = () => {
    const name = nameInput.value.trim() || 'Custom Attack';
    const bonus = parseInt(bonusInput.value, 10) || 0;
    const rank = parseInt(rankInput.value, 10) || 0;
    const range = rangeInput.value;
    const res = resistanceInput.value;
    const desc = descInput.value.trim() || 'Damage';
    const crit = critInput.value;
    const dc = getDc(res, rank);

    previewDcTag.textContent = `DC ${dc}`;
    previewBox.innerHTML = `
      <div class="attack-card custom" style="margin: 0;">
        <div class="attack-main">
          <span class="attack-badge custom">CUSTOM</span>
          <h4 class="attack-name">${escapeHtml(name)}</h4>
          <span class="roll-btn" style="pointer-events: none;">
            <i class="ri-dice-line"></i> Roll d20${bonus >= 0 ? '+' + bonus : bonus}
          </span>
        </div>
        <div class="attack-metrics">
          <div class="metric">
            <span class="m-label">ROLL BONUS</span>
            <span class="m-val highlight">${bonus >= 0 ? '+' + bonus : bonus}</span>
          </div>
          <div class="metric">
            <span class="m-label">RANGE</span>
            <span class="m-val">${range}</span>
          </div>
          <div class="metric">
            <span class="m-label">EFFECT</span>
            <span class="m-val">${escapeHtml(desc)} ${rank}</span>
          </div>
          <div class="metric">
            <span class="m-label">RESISTANCE</span>
            <span class="m-val">${res} (DC ${dc})</span>
          </div>
        </div>
      </div>
    `;
  };

  updatePreview();

  // Listeners for live changes
  [nameInput, bonusInput, rankInput, rangeInput, resistanceInput, descInput, critInput].forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  // Steppers
  modal.querySelector('#atk-bonus-dec')?.addEventListener('click', () => {
    bonusInput.value = (parseInt(bonusInput.value, 10) || 0) - 1;
    updatePreview();
  });
  modal.querySelector('#atk-bonus-inc')?.addEventListener('click', () => {
    bonusInput.value = (parseInt(bonusInput.value, 10) || 0) + 1;
    updatePreview();
  });
  modal.querySelector('#atk-rank-dec')?.addEventListener('click', () => {
    rankInput.value = Math.max(0, (parseInt(rankInput.value, 10) || 0) - 1);
    updatePreview();
  });
  modal.querySelector('#atk-rank-inc')?.addEventListener('click', () => {
    rankInput.value = (parseInt(rankInput.value, 10) || 0) + 1;
    updatePreview();
  });

  // Save handler
  const saveAttack = () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast('Please enter an attack name.', 'warning');
      nameInput.focus();
      return;
    }

    const attackData = {
      name,
      attackBonus: parseInt(bonusInput.value, 10) || 0,
      effectRank: parseInt(rankInput.value, 10) || 0,
      range: rangeInput.value,
      resistance: resistanceInput.value,
      descriptor: descInput.value.trim() || 'Damage',
      crit: critInput.value
    };

    if (isEditing && existing) {
      store.updateCustomAttack(existing.id, attackData);
      showToast(`Custom attack "${name}" updated successfully!`, 'success');
    } else {
      store.addCustomAttack(attackData);
      showToast(`Custom attack "${name}" added successfully!`, 'success');
    }

    closeCustomAttackModal();
  };

  modal.querySelector('#btn-save-custom-atk')?.addEventListener('click', saveAttack);
  modal.querySelector('#custom-atk-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAttack();
  });

  // Close handlers
  const close = () => closeCustomAttackModal();
  modal.querySelector('#btn-close-custom-atk-modal')?.addEventListener('click', close);
  modal.querySelector('#btn-cancel-custom-atk')?.addEventListener('click', close);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Focus name
  setTimeout(() => {
    nameInput?.focus();
    nameInput?.select();
  }, 60);
}

export function closeCustomAttackModal() {
  const modal = document.getElementById('custom-attack-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
