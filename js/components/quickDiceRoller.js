// js/components/quickDiceRoller.js
/**
 * Universal Simple Dice Roller for Mutants & Masterminds 3e
 * Provides 1-click rolling for Abilities, Defenses, Skills, Attacks, and Initiative.
 * Displays results in a clean, non-intrusive floating HUD with M&M 3e Degree calculation.
 */

let rollHistory = [];
let currentRoll = null;
let hudTimeout = null;

/**
 * Calculate Degrees of Success or Failure according to Mutants & Masterminds 3e rules.
 * Success: Total >= DC. 1st degree: 0-4 over DC. 2nd degree: 5-9 over. 3rd: 10-14. 4th: 15+.
 * Failure: Total < DC. 1st degree: 1-5 under DC. 2nd degree: 6-10 under. 3rd: 11-15. 4th: 16+.
 */
export function calculateDegrees(total, dc) {
  if (dc === null || dc === undefined || isNaN(dc)) return null;
  const diff = total - dc;
  if (diff >= 0) {
    const degrees = Math.floor(diff / 5) + 1;
    return {
      isSuccess: true,
      degrees,
      diff,
      text: degrees === 1 ? 'Success (1 Degree)' : `Success (${degrees} Degrees)`
    };
  } else {
    const degrees = Math.floor(Math.abs(diff + 1) / 5) + 1;
    return {
      isSuccess: false,
      degrees,
      diff,
      text: degrees === 1 ? 'Failure (1 Degree)' : `Failure (${degrees} Degrees)`
    };
  }
}

/**
 * Perform a d20 roll check
 * @param {Object} options
 * @param {string} options.name - Name of roll (e.g. "Toughness Resistance", "Perception")
 * @param {string} options.type - Category: 'ability' | 'defense' | 'skill' | 'attack' | 'initiative'
 * @param {number} options.bonus - Roll modifier bonus
 * @param {string} [options.subtitle] - Contextual subtitle / details
 */
export function rollCheck({ name, type = 'check', bonus = 0, subtitle = '' }) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const numBonus = parseInt(bonus, 10) || 0;
  const total = d20 + numBonus;
  const isCrit = d20 === 20;
  const isFumble = d20 === 1;

  const rollObj = {
    id: 'roll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name,
    type,
    d20,
    bonus: numBonus,
    total,
    isCrit,
    isFumble,
    subtitle,
    timestamp: new Date()
  };

  currentRoll = rollObj;
  rollHistory.unshift(rollObj);
  if (rollHistory.length > 8) rollHistory.pop();

  renderQuickRollHUD();

  // Reset auto-dismiss timer (14 seconds)
  if (hudTimeout) clearTimeout(hudTimeout);
  hudTimeout = setTimeout(() => {
    closeQuickRollHUD();
  }, 14000);

  return rollObj;
}

/**
 * Ensure HUD container exists in DOM and update its content
 */
export function renderQuickRollHUD() {
  if (typeof document === 'undefined') return;
  if (!currentRoll) return;

  let hud = document.getElementById('quick-roll-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'quick-roll-hud';
    hud.className = 'quick-roll-hud';
    document.body.appendChild(hud);
  }

  const { name, type, d20, bonus, total, isCrit, isFumble, subtitle } = currentRoll;

  // Icon depending on type
  let typeIcon = 'ri-dice-line';
  let typeLabel = 'Check';
  if (type === 'ability') { typeIcon = 'ri-flashlight-line'; typeLabel = 'Ability'; }
  else if (type === 'defense') { typeIcon = 'ri-shield-line'; typeLabel = 'Defense / Resistance'; }
  else if (type === 'skill') { typeIcon = 'ri-tools-line'; typeLabel = 'Skill'; }
  else if (type === 'attack') { typeIcon = 'ri-sword-line'; typeLabel = 'Attack Roll'; }
  else if (type === 'initiative') { typeIcon = 'ri-speed-line'; typeLabel = 'Initiative'; }

  hud.classList.remove('hidden', 'closing');
  hud.classList.add('visible');

  hud.innerHTML = `
    <div class="hud-card ${isCrit ? 'hud-crit' : ''} ${isFumble ? 'hud-fumble' : ''}">
      <!-- Top header -->
      <div class="hud-header">
        <div class="hud-title-wrap">
          <span class="hud-type-badge type-${type}"><i class="${typeIcon}"></i> ${typeLabel}</span>
          <strong class="hud-title">${escapeHtml(name)}</strong>
        </div>
        <button id="btn-hud-close" class="hud-close-btn" title="Close roll result"><i class="ri-close-line"></i></button>
      </div>

      ${subtitle ? `<div class="hud-subtitle">${escapeHtml(subtitle)}</div>` : ''}

      <!-- Main Roll Display -->
      <div class="hud-body">
        <div class="hud-math-row">
          <div class="hud-die-box ${isCrit ? 'crit' : ''} ${isFumble ? 'fumble' : ''}" title="Natural d20 roll">
            <span class="hud-die-label">d20</span>
            <span class="hud-die-num">${d20}</span>
          </div>

          <span class="hud-math-operator">+</span>

          <div class="hud-mod-box" title="Bonus modifier">
            <span class="hud-mod-label">Mod</span>
            <span class="hud-mod-num">${bonus >= 0 ? '+' + bonus : bonus}</span>
          </div>

          <span class="hud-math-operator">=</span>

          <div class="hud-total-box ${isCrit ? 'crit' : ''} ${isFumble ? 'fumble' : ''}" title="Final Total">
            <span class="hud-total-label">TOTAL</span>
            <span class="hud-total-num">${total}</span>
          </div>
        </div>

        ${isCrit ? `
          <div class="hud-crit-banner">
            <i class="ri-sparkling-fill"></i> NATURAL 20! CRITICAL HIT / TRIUMPH!
          </div>
        ` : isFumble ? `
          <div class="hud-fumble-banner">
            <i class="ri-alarm-warning-fill"></i> NATURAL 1! CRITICAL FAILURE!
          </div>
        ` : ''}
      </div>

      <!-- Action Footer -->
      <div class="hud-footer">
        <button id="btn-hud-reroll" class="btn-hud-action reroll" title="Roll again with same modifier">
          <i class="ri-refresh-line"></i> Roll Again
        </button>
        ${rollHistory.length > 1 ? `
          <div class="hud-history-summary" title="${rollHistory.length} recent rolls in history">
            <span>Recent:</span>
            <div class="hud-history-chips">
              ${rollHistory.slice(1, 4).map(h => `
                <span class="hud-hist-chip" title="${escapeHtml(h.name)}: d20(${h.d20}) + ${h.bonus} = ${h.total}">
                  ${h.total}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Attach interactive events inside HUD
  hud.querySelector('#btn-hud-close')?.addEventListener('click', closeQuickRollHUD);

  hud.querySelector('#btn-hud-reroll')?.addEventListener('click', () => {
    rollCheck({
      name: currentRoll.name,
      type: currentRoll.type,
      bonus: currentRoll.bonus,
      subtitle: currentRoll.subtitle
    });
  });
}

/**
 * Close and animate out the HUD
 */
export function closeQuickRollHUD() {
  if (typeof document === 'undefined') return;
  const hud = document.getElementById('quick-roll-hud');
  if (hud) {
    hud.classList.add('closing');
    setTimeout(() => {
      hud.classList.remove('visible', 'closing');
      hud.classList.add('hidden');
    }, 200);
  }
}

/**
 * Get current roll history
 */
export function getRollHistory() {
  return rollHistory;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Attach globally for browser convenience
if (typeof window !== 'undefined') {
  window.quickDiceRoller = {
    rollCheck,
    renderQuickRollHUD,
    closeQuickRollHUD,
    calculateDegrees,
    getRollHistory
  };
}
