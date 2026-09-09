// js/components/references.js
import { BASIC_CONDITIONS, COMBINED_CONDITIONS } from '../rules/conditions.js';

export const COMBAT_ACTIONS = [
  { action: 'Aid', type: 'Standard', effect: '+2 (or +5 on 2+ degrees) to an ally’s check on the character’s next turn.' },
  { action: 'Aim', type: 'Standard', effect: '+2 circumstance bonus to the next ranged attack check (+5 if entire round spent aiming).' },
  { action: 'Charge', type: 'Standard', effect: 'Move up to your speed in a straight line then make a close attack with -2 attack check penalty.' },
  { action: 'Defend', type: 'Standard', effect: 'Opposed check; treat d20 rolls of 10 or less as 10 for active defenses until your next turn.' },
  { action: 'Disarm', type: 'Standard', effect: '-2 attack check; target makes STR check vs. attack check result to retain weapon.' },
  { action: 'Escape', type: 'Move', effect: 'Opposed STR or Acrobatics check vs. attacker’s STR or grab check to break a Grab.' },
  { action: 'Grab', type: 'Standard', effect: 'Attack check; target resists with STR or Dodge; on hit, target becomes hindered and vulnerable.' },
  { action: 'Recover', type: 'Standard', effect: 'Remove the character’s highest active damage condition; once per combat encounter.' },
  { action: 'Smash', type: 'Standard', effect: '-5 attack check against held object or unattended target; ignores Toughness cap.' },
  { action: 'Trip', type: 'Standard', effect: '-2 attack check; target resists with STR or Acrobatics; on failure, target falls prone.' }
];

export const COMBAT_MANEUVERS = [
  { action: 'Accurate Attack', atkMod: '+1 or +2', defMod: '--', effect: '-1 or -2 to effect rank.' },
  { action: 'All-out Attack', atkMod: '+1 or +2', defMod: '-1 or -2', effect: 'Trade active defense for attack check bonus.' },
  { action: 'Defensive Attack', atkMod: '-1 or -2', defMod: '+1 or +2', effect: 'Trade attack bonus for active defense.' },
  { action: 'Power Attack', atkMod: '-1 or -2', defMod: '--', effect: '+1 or +2 to effect/damage rank.' },
  { action: 'Slam Attack', atkMod: '-1 or -2', defMod: '+1 or +2', effect: 'Charge variant; attacker takes half Toughness damage on a hit.' },
  { action: 'Team Attack', atkMod: '--', defMod: '--', effect: 'Multiple attackers hit simultaneously; highest result + 2 per extra degree.' }
];

export function renderReferencesTab(container) {
  container.innerHTML = `
    <div class="references-page">
      <div class="ref-header">
        <h2>Quick Reference Manual</h2>
        <p>Quick-access combat rules, actions, and maneuvers for Mutants & Masterminds 3e.</p>
      </div>

      <!-- Combat Actions -->
      <div class="ref-card">
        <h3 class="ref-section-title"><i class="ri-sword-line"></i> Combat Actions</h3>
        <div class="table-responsive">
          <table class="ref-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Type</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              ${COMBAT_ACTIONS.map(a => `
                <tr>
                  <td class="font-bold">${a.action}</td>
                  <td><span class="action-type-pill ${a.type.toLowerCase()}">${a.type}</span></td>
                  <td>${a.effect}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Combat Maneuvers -->
      <div class="ref-card">
        <h3 class="ref-section-title"><i class="ri-shield-check-line"></i> Combat Maneuvers</h3>
        <div class="table-responsive">
          <table class="ref-table">
            <thead>
              <tr>
                <th>Maneuver</th>
                <th>Attack Mod</th>
                <th>Defense Mod</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              ${COMBAT_MANEUVERS.map(m => `
                <tr>
                  <td class="font-bold">${m.action}</td>
                  <td class="text-accent">${m.atkMod}</td>
                  <td class="text-accent">${m.defMod}</td>
                  <td>${m.effect}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Conditions Reference -->
      <div class="ref-card">
        <h3 class="ref-section-title"><i class="ri-alert-line"></i> Conditions Reference</h3>
        <div class="conditions-ref-grid">
          <div>
            <h4 class="sub-title">Basic Conditions</h4>
            <div class="cond-ref-list">
              ${BASIC_CONDITIONS.map(c => `
                <div class="cond-ref-item">
                  <strong>${c.name}:</strong> <span>${c.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <h4 class="sub-title">Combined Conditions</h4>
            <div class="cond-ref-list">
              ${COMBINED_CONDITIONS.map(c => `
                <div class="cond-ref-item">
                  <strong>${c.name} <span class="combo-label">(${c.components.join(' + ')})</span>:</strong>
                  <span>${c.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
