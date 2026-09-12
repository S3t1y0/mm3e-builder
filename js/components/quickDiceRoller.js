// js/components/quickDiceRoller.js
import { showToast } from './notifications.js';
/**
 * Universal Simple Dice Roller for Mutants & Masterminds 3e
 * Provides 1-click rolling for Abilities, Defenses, Skills, Attacks, and Initiative.
 * Displays results in a clean, non-intrusive floating HUD.
 */

let rollHistory = [];
let currentRoll = null;
let hudTimeout = null;

/**
 * Calculate Degrees of Success or Failure according to Mutants & Masterminds 3e rules:
 * - Success (Total >= DC):
 *   - 1st Degree: 0-4 over DC (meets DC)
 *   - 2nd Degree: 5-9 over DC
 *   - 3rd Degree: 10-14 over DC
 *   - 4th Degree: 15+ over DC
 * - Failure (Total < DC):
 *   - Margin = DC - Total
 *   - 1st Degree: failed by 1-5
 *   - 2nd Degree: failed by 6-10
 *   - 3rd Degree: failed by 11-15
 *   - 4th Degree: failed by 16+
 */
export function calculateDegrees(total, dc) {
  if (dc === null || dc === undefined || isNaN(dc)) return null;
  const numDC = parseInt(dc, 10);
  const diff = total - numDC;

  if (diff >= 0) {
    const degrees = Math.floor(diff / 5) + 1;
    const degSuffix = degrees === 1 ? '1st' : degrees === 2 ? '2nd' : degrees === 3 ? '3rd' : `${degrees}th`;
    return {
      isSuccess: true,
      degrees,
      diff,
      margin: diff,
      text: `Success (${degSuffix} Degree)`
    };
  } else {
    const margin = numDC - total;
    const degrees = Math.floor((margin - 1) / 5) + 1;
    const degSuffix = degrees === 1 ? '1st' : degrees === 2 ? '2nd' : degrees === 3 ? '3rd' : `${degrees}th`;
    return {
      isSuccess: false,
      degrees,
      diff,
      margin,
      text: `Failure (${degSuffix} Degree)`
    };
  }
}

/**
 * Perform a d20 roll check
 * @param {Object} options
 * @param {string} options.name - Name of roll (e.g. "Toughness Resistance", "Perception")
 * @param {string} [options.type] - Category: 'ability' | 'defense' | 'skill' | 'attack' | 'initiative'
 * @param {number} [options.bonus] - Roll modifier bonus
 * @param {string} [options.subtitle] - Contextual subtitle / details
 */
export function rollCheck({
  name,
  type = 'check',
  bonus = 0,
  subtitle = '',
  extra = {}
}) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const numBonus = parseInt(bonus, 10) || 0;
  const total = d20 + numBonus;
  const isCrit = d20 === 20;
  const isFumble = d20 === 1;

  const rollObj = {
    id: 'roll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name,
    type,
    bonus: numBonus,
    d20,
    total,
    isCrit,
    isFumble,
    subtitle,
    extra: extra || {},
    timestamp: new Date()
  };

  currentRoll = rollObj;
  rollHistory.unshift(rollObj);
  if (rollHistory.length > 8) rollHistory.pop();

  // Dispatch custom event for MM3e to Roll20 VTT Bridge Chrome Extension
  if (typeof window !== 'undefined') {
    let charName = 'Hero';
    try {
      if (window.store && window.store.character && window.store.character.name) {
        charName = window.store.character.name;
      }
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('mm3e-vtt-roll', {
      detail: {
        characterName: charName,
        rollName: name,
        type,
        bonus: numBonus,
        d20,
        total,
        isCrit,
        isFumble,
        subtitle,
        ...(extra || {})
      }
    }));
  }

  renderQuickRollHUD();

  // Reset auto-dismiss timer (15 seconds)
  if (hudTimeout) clearTimeout(hudTimeout);
  hudTimeout = setTimeout(() => {
    closeQuickRollHUD();
  }, 15000);

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
      subtitle: currentRoll.subtitle,
      extra: currentRoll.extra || {}
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

/**
 * Dispatch a rich feature card (Power, Advantage, Equipment) to VTT (Roll20)
 * @param {Object} featureData
 */
export function sendFeatureToVTT(featureData) {
  if (typeof window === 'undefined') return;

  let characterName = featureData.characterName;
  if (!characterName) {
    try {
      if (window.store && window.store.character && window.store.character.name) {
        characterName = window.store.character.name;
      }
    } catch (e) {}
    characterName = characterName || 'Hero';
  }

  const payload = {
    ...featureData,
    characterName
  };

  window.dispatchEvent(new CustomEvent('mm3e-vtt-feature', { detail: payload }));
  showToast(`Sent "${featureData.name || 'Feature'}" to Roll20 chat!`, 'info');
}

// Attach globally for browser convenience
if (typeof window !== 'undefined') {
  window.quickDiceRoller = {
    rollCheck,
    renderQuickRollHUD,
    closeQuickRollHUD,
    calculateDegrees,
    getRollHistory,
    sendFeatureToVTT
  };
  window.sendFeatureToVTT = sendFeatureToVTT;

  // Feedback listener when MM3e Chrome Extension delivers roll to Roll20
  window.addEventListener('mm3e-bridge-status', (e) => {
    const detail = e.detail;
    if (detail && detail.success && detail.deliveredCount > 0) {
      const hud = document.getElementById('quick-roll-hud');
      if (hud && hud.classList.contains('visible')) {
        let badge = hud.querySelector('.hud-vtt-status');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'hud-vtt-status';
          badge.style.cssText = 'font-size: 0.72rem; color: #34d399; display: flex; align-items: center; justify-content: center; gap: 0.35rem; margin-top: 0.4rem; font-weight: 600; background: rgba(16, 185, 129, 0.12); padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.25);';
          const card = hud.querySelector('.hud-card');
          if (card) card.appendChild(badge);
        }
        badge.innerHTML = `<i class="ri-broadcast-line"></i> Sent to Roll20 (${detail.deliveredCount} active tab${detail.deliveredCount > 1 ? 's' : ''})`;
      }
    }
  });
}
