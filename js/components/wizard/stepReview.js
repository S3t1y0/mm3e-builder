// js/components/wizard/stepReview.js
import { store } from '../../state.js';
import { exportToJson, printSheet } from '../../storage/exportImport.js';
import { openRoll20Preview } from '../roll20Print.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderStepReview(container, onSwitchToSheet) {
  const char = store.character;
  const pl = char.powerLevel;
  const budget = store.getTotalBudgetPP();
  const spent = store.getTotalSpentPP();
  const remaining = store.getRemainingPP();

  const caps = store.getTradeOffCaps();

  const dodge = store.getDefenseTotal('DODGE');
  const parry = store.getDefenseTotal('PARRY');
  const toughness = store.getDefenseTotal('TOUGHNESS');
  const fort = store.getDefenseTotal('FORTITUDE');
  const will = store.getDefenseTotal('WILL');
  const init = store.getDefenseTotal('INITIATIVE');

  const abilitiesPP = store.getTotalAbilityPP();
  const defensesPP = store.getTotalDefensePP();
  const skillsPP = store.getTotalSkillPP();
  const advantagesPP = store.getTotalAdvantagePP();
  const powersPP = store.getTotalPowerPP();

  const maxPair = pl * 2;

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border-color: rgba(16, 185, 129, 0.3);">
          <i class="ri-checkbox-circle-line"></i>
        </div>
        <div>
          <h2>Step 8: Review & Finalize</h2>
          <p>Audit rulebook compliance, verify combat statistics, and export your superhero.</p>
        </div>
      </div>
      <div class="wizard-stage-badge" style="background: ${remaining === 0 ? 'rgba(16, 185, 129, 0.15)' : remaining > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${remaining === 0 ? 'var(--accent-emerald)' : remaining > 0 ? 'var(--accent-secondary)' : 'var(--accent-danger)'};">
        ${remaining === 0 ? '✓ Balanced (0 PP Remaining)' : remaining > 0 ? `+${remaining} PP Remaining` : `⚠ ${Math.abs(remaining)} PP Over Budget`}
      </div>
    </div>

    <!-- AUDIT & VALIDATION SUMMARY -->
    <div class="wizard-audit-grid">
      <!-- PP Balance Card -->
      <div class="audit-card ${remaining >= 0 ? 'pass' : 'warning'}">
        <div class="audit-card-head">
          <span class="audit-card-title">Power Point Balance</span>
          <span style="font-size: 0.75rem; font-weight: 800; color: ${remaining >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)'};">
            ${spent} / ${budget} PP
          </span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.25rem;">
          <div>• Abilities: <strong>${abilitiesPP} PP</strong></div>
          <div>• Defenses: <strong>${defensesPP} PP</strong></div>
          <div>• Skills: <strong>${skillsPP} PP</strong></div>
          <div>• Advantages: <strong>${advantagesPP} PP</strong></div>
          <div>• Powers: <strong>${powersPP} PP</strong></div>
        </div>
        <div style="margin-top: auto; padding-top: 0.5rem; font-size: 0.7rem; font-weight: 700; color: ${remaining === 0 ? 'var(--accent-emerald)' : remaining > 0 ? 'var(--accent-secondary)' : 'var(--accent-danger)'};">
          ${remaining === 0 ? '✓ Perfect 0 PP Balance' : remaining > 0 ? `• ${remaining} PP unspent (can buy more traits)` : `⚠ Exceeds budget by ${Math.abs(remaining)} PP`}
        </div>
      </div>

      <!-- Defense Caps Card -->
      <div class="audit-card ${caps.isValid ? 'pass' : 'warning'}">
        <div class="audit-card-head">
          <span class="audit-card-title">Defense Trade-offs (PL ${pl})</span>
          <span style="font-size: 0.75rem; font-weight: 800; color: ${caps.isValid ? 'var(--accent-emerald)' : 'var(--accent-danger)'};">
            ${caps.isValid ? '✓ COMPLIANT' : '⚠ WARNING'}
          </span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
          <div>Dodge + Toughness: <strong>${dodge + toughness} / ${maxPair}</strong> ${dodge + toughness > maxPair ? '<span style="color: var(--accent-danger); font-weight: bold;">(Over)</span>' : '✓'}</div>
          <div>Parry + Toughness: <strong>${parry + toughness} / ${maxPair}</strong> ${parry + toughness > maxPair ? '<span style="color: var(--accent-danger); font-weight: bold;">(Over)</span>' : '✓'}</div>
          <div>Fortitude + Will: <strong>${fort + will} / ${maxPair}</strong> ${fort + will > maxPair ? '<span style="color: var(--accent-danger); font-weight: bold;">(Over)</span>' : '✓'}</div>
        </div>
        <div style="margin-top: auto; padding-top: 0.5rem; font-size: 0.7rem; color: var(--text-muted);">
          Max limit: ${maxPair} per defense pair.
        </div>
      </div>

      <!-- Combat Readiness Card -->
      <div class="audit-card pass">
        <div class="audit-card-head">
          <span class="audit-card-title">Combat Quick Stats</span>
          <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-secondary);">
            Init: ${init >= 0 ? `+${init}` : init}
          </span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.25rem;">
          <div>• Unarmed Damage: <strong>DC ${15 + store.getAbility('STR')}</strong> (${store.getAbility('STR')} Damage)</div>
          <div>• Active Defenses: <strong>Dodge +${dodge}, Parry +${parry}</strong></div>
          <div>• Durability: <strong>Toughness +${toughness}</strong></div>
          <div>• Resistances: <strong>Fort +${fort}, Will +${will}</strong></div>
        </div>
      </div>
    </div>

    <!-- HERO SNAPSHOT & COMBAT ACTIONS -->
    <div class="sheet-card" style="padding: 1.25rem;">
      <h3 style="font-size: 1rem; color: var(--text-primary); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <i class="ri-sword-fill" style="color: var(--accent-primary);"></i> Combat Action Overview
      </h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem;">
        <!-- Unarmed Attack -->
        <div style="background: var(--bg-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">Unarmed Strike</div>
          <div style="font-size: 0.75rem; color: var(--accent-secondary);">Close Combat • Standard Action</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.35rem;">
            Attack Check: <strong>+${store.getAbility('FGT')}</strong> • Resistance: <strong>Toughness DC ${15 + store.getAbility('STR')}</strong>
          </div>
        </div>

        <!-- Powers with offensive effects -->
        ${char.powers.filter(p => {
          const effBase = (p.baseEffect || p.mainEffect?.baseEffect || p.effectType || '');
          return ['Damage', 'Blast', 'Affliction', 'Weaken'].some(a => effBase.includes(a));
        }).map(p => {
          const effBase = p.baseEffect || p.mainEffect?.baseEffect || p.effectType || 'Damage';
          const ranks = p.ranks || p.mainEffect?.ranks || 1;
          const isAfflictionOrWeaken = effBase === 'Affliction' || effBase === 'Weaken';
          const dc = (isAfflictionOrWeaken ? 10 : 15) + ranks;
          const res = effBase === 'Affliction' ? (p.resistance || 'Fortitude') : effBase === 'Weaken' ? (p.resistance || 'Fort/Will') : 'Toughness';
          return `
            <div style="background: var(--bg-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(p.name || effBase)}</div>
              <div style="font-size: 0.75rem; color: var(--accent-secondary);">${p.range || 'Ranged'} • ${p.action || 'Standard'} Action</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.35rem;">
                Effect: <strong>${escapeHtml(effBase)} ${ranks}</strong> • DC: <strong>${dc} vs ${res}</strong>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- FINALIZE ACTIONS BAR -->
    <div class="sheet-card" style="padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%);">
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.35rem 0;">
          Your Superhero is Ready for Action!
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; max-width: 600px;">
          Your hero profile is saved in browser storage. Choose what you'd like to do next:
        </p>
      </div>

      <div class="wizard-final-actions" style="justify-content: center;">
        <button id="wiz-btn-to-sheet" class="btn btn-primary btn-md">
          <i class="ri-file-list-3-line"></i> Open in Full Character Sheet
        </button>
        <button id="wiz-btn-to-roll20" class="btn btn-secondary btn-md">
          <i class="ri-file-user-line"></i> Preview Roll20 Official Sheet
        </button>
        <button id="wiz-btn-to-print" class="btn btn-secondary btn-md">
          <i class="ri-printer-line"></i> Print Character to PDF
        </button>
        <button id="wiz-btn-to-export" class="btn btn-secondary btn-md">
          <i class="ri-download-2-line"></i> Export JSON File
        </button>
      </div>
    </div>
  `;

  // Bind Finalize Actions
  document.getElementById('wiz-btn-to-sheet')?.addEventListener('click', () => {
    if (typeof onSwitchToSheet === 'function') {
      onSwitchToSheet();
    }
  });

  document.getElementById('wiz-btn-to-roll20')?.addEventListener('click', () => {
    openRoll20Preview();
  });

  document.getElementById('wiz-btn-to-print')?.addEventListener('click', () => {
    printSheet();
  });

  document.getElementById('wiz-btn-to-export')?.addEventListener('click', () => {
    exportToJson();
  });
}
