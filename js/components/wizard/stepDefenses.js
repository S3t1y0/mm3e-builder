// js/components/wizard/stepDefenses.js
import { store } from '../../state.js';
import { DEFENSES, DEFENSE_COST_PER_RANK } from '../../rules/defenses.js';

export function renderStepDefenses(container) {
  const char = store.character;
  const pl = char.powerLevel;
  const maxCap = pl * 2;

  const dodge = store.getDefenseTotal('DODGE');
  const parry = store.getDefenseTotal('PARRY');
  const toughness = store.getDefenseTotal('TOUGHNESS');
  const fort = store.getDefenseTotal('FORTITUDE');
  const will = store.getDefenseTotal('WILL');

  const dtSum = dodge + toughness;
  const ptSum = parry + toughness;
  const fwSum = fort + will;

  const totalDefensePP = store.getTotalDefensePP();

  container.innerHTML = `
    <div class="wizard-stage-header">
      <div class="wizard-stage-header-title">
        <div class="wizard-stage-icon"><i class="ri-shield-check-line"></i></div>
        <div>
          <h2>Step 3: Defenses & Power Level Caps</h2>
          <p>Fine-tune combat defenses and balance trade-offs against Power Level ${pl} maximums.</p>
        </div>
      </div>
      <div class="wizard-stage-badge">${totalDefensePP} PP Spent • Cap: ${maxCap} per Pair</div>
    </div>

    <!-- PL TRADE-OFF ANALYZER -->
    <div class="tradeoff-analyzer-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 1rem; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <i class="ri-scales-3-line" style="color: var(--accent-primary);"></i> Power Level Trade-off Limits
        </h3>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Rule: Defense pairs cannot exceed 2 × PL (${maxCap})</span>
      </div>

      <!-- Trade-off 1: Dodge + Toughness -->
      <div class="tradeoff-row">
        <div class="tradeoff-row-head">
          <span class="tradeoff-row-title">Ranged Defense: Dodge (${dodge}) + Toughness (${toughness})</span>
          <span class="tradeoff-row-score" style="color: ${dtSum > maxCap ? 'var(--accent-danger)' : dtSum === maxCap ? 'var(--accent-emerald)' : 'var(--accent-secondary)'};">
            ${dtSum} / ${maxCap} ${dtSum > maxCap ? '⚠ EXCEEDS CAP' : dtSum === maxCap ? '✓ BALANCED AT CAP' : ''}
          </span>
        </div>
        <div class="tradeoff-bar-track">
          <div class="tradeoff-bar-fill ${dtSum > maxCap ? 'danger' : dtSum === maxCap ? 'exact' : 'normal'}" style="width: ${Math.min(100, (dtSum / maxCap) * 100)}%;"></div>
        </div>
        <span class="tradeoff-row-hint">Dodge protects against ranged attacks. Toughness resists physical injury.</span>
      </div>

      <!-- Trade-off 2: Parry + Toughness -->
      <div class="tradeoff-row">
        <div class="tradeoff-row-head">
          <span class="tradeoff-row-title">Melee Defense: Parry (${parry}) + Toughness (${toughness})</span>
          <span class="tradeoff-row-score" style="color: ${ptSum > maxCap ? 'var(--accent-danger)' : ptSum === maxCap ? 'var(--accent-emerald)' : 'var(--accent-secondary)'};">
            ${ptSum} / ${maxCap} ${ptSum > maxCap ? '⚠ EXCEEDS CAP' : ptSum === maxCap ? '✓ BALANCED AT CAP' : ''}
          </span>
        </div>
        <div class="tradeoff-bar-track">
          <div class="tradeoff-bar-fill ${ptSum > maxCap ? 'danger' : ptSum === maxCap ? 'exact' : 'normal'}" style="width: ${Math.min(100, (ptSum / maxCap) * 100)}%;"></div>
        </div>
        <span class="tradeoff-row-hint">Parry deflects close melee strikes.</span>
      </div>

      <!-- Trade-off 3: Fortitude + Will -->
      <div class="tradeoff-row">
        <div class="tradeoff-row-head">
          <span class="tradeoff-row-title">Resistance: Fortitude (${fort}) + Will (${will})</span>
          <span class="tradeoff-row-score" style="color: ${fwSum > maxCap ? 'var(--accent-danger)' : fwSum === maxCap ? 'var(--accent-emerald)' : 'var(--accent-secondary)'};">
            ${fwSum} / ${maxCap} ${fwSum > maxCap ? '⚠ EXCEEDS CAP' : fwSum === maxCap ? '✓ BALANCED AT CAP' : ''}
          </span>
        </div>
        <div class="tradeoff-bar-track">
          <div class="tradeoff-bar-fill ${fwSum > maxCap ? 'danger' : fwSum === maxCap ? 'exact' : 'normal'}" style="width: ${Math.min(100, (fwSum / maxCap) * 100)}%;"></div>
        </div>
        <span class="tradeoff-row-hint">Fortitude resists poisons and diseases. Will resists mental attacks and despair.</span>
      </div>
    </div>

    <!-- DEFENSES ALLOCATION CARDS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
      ${DEFENSES.filter(d => !d.isDerived).map(def => {
        const base = store.getDefenseBase(def.key);
        const bought = char.defensesBought[def.key] || 0;
        const total = store.getDefenseTotal(def.key);
        const isToughness = def.key === 'TOUGHNESS';

        return `
          <div class="sheet-card" style="padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${def.name}</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-secondary); background: rgba(56, 189, 248, 0.1); padding: 0.2rem 0.5rem; border-radius: var(--radius-xs);">
                Base (${def.baseAbility}): ${base >= 0 ? `+${base}` : base}
              </span>
            </div>

            <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.35; margin: 0;">${def.desc}</p>

            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div>
                <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">TOTAL DEFENSE</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: var(--text-primary);" id="total-def-${def.key}">
                  ${total >= 0 ? `+${total}` : total}
                </div>
              </div>

              ${!isToughness ? `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                  <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">BOUGHT (+1 PP/Rank)</span>
                  <div class="stepper">
                    <button class="step-btn btn-def-dec" data-key="${def.key}" ${bought <= 0 ? 'disabled' : ''}>-</button>
                    <span class="step-val" id="val-def-${def.key}" style="font-size: 1.1rem; min-width: 1.75rem;">${bought}</span>
                    <button class="step-btn btn-def-inc" data-key="${def.key}">+</button>
                  </div>
                </div>
              ` : `
                <div style="text-align: right; font-size: 0.75rem; color: var(--accent-amber);">
                  <i class="ri-information-line"></i> Boost via Stamina, Protection (Powers), or Defensive Roll (Advantages).
                </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind Defense Steppers
  container.querySelectorAll('.btn-def-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const bought = char.defensesBought[key] || 0;
      if (bought > 0) {
        store.setDefense(key, bought - 1);
        renderStepDefenses(container);
      }
    });
  });

  container.querySelectorAll('.btn-def-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const bought = char.defensesBought[key] || 0;
      store.setDefense(key, bought + 1);
      renderStepDefenses(container);
    });
  });
}
