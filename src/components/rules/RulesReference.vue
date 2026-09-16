<template>
  <div class="rules-reference-container">
    <!-- SEARCH & FILTER HEADER -->
    <div class="card mb-4" style="padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <i class="ri-book-open-line text-accent"></i> M&M 3e SRD Rules Reference Library
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.25rem 0 0;">
            Quick reference guide for combat actions, tactical maneuvers, measurements table, and official Mutants & Masterminds 3e condition rules.
          </p>
        </div>

        <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
          <button
            v-for="cat in ['All', 'Actions', 'Maneuvers', 'Conditions', 'Measurements']"
            :key="cat"
            class="btn btn-xs"
            :class="activeSection === cat ? 'btn-primary' : 'btn-secondary'"
            @click="activeSection = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Search action, maneuver, or condition... (e.g. Power Attack, Grab, Dazed, Charge, Speed)"
          style="font-size: 0.82rem;"
        />
      </div>
    </div>

    <!-- 1. COMBAT ACTIONS TABLE -->
    <div v-if="activeSection === 'All' || activeSection === 'Actions'" class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title"><i class="ri-sword-line text-accent"></i> Combat Actions</h4>
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th style="width: 140px;">Action</th>
              <th style="width: 100px;">Type</th>
              <th>Effect & Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="act in filteredActions" :key="act.action">
              <td style="font-weight: 800; color: #fff;">{{ act.action }}</td>
              <td>
                <span class="badge" :class="act.type === 'Move' ? 'badge-secondary' : 'badge-primary'" style="font-size: 0.68rem;">
                  {{ act.type }}
                </span>
              </td>
              <td style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4;">
                {{ act.effect }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. COMBAT MANEUVERS TABLE -->
    <div v-if="activeSection === 'All' || activeSection === 'Maneuvers'" class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title"><i class="ri-shield-flash-line text-accent"></i> Combat Maneuvers</h4>
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th style="width: 160px;">Maneuver</th>
              <th style="width: 120px; text-align: center;">Attack Mod</th>
              <th style="width: 120px; text-align: center;">Defense Mod</th>
              <th>Effect & Rules</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredManeuvers" :key="m.action">
              <td style="font-weight: 800; color: #fff;">{{ m.action }}</td>
              <td style="text-align: center; font-weight: 700; color: #60a5fa;">{{ m.atkMod }}</td>
              <td style="text-align: center; font-weight: 700; color: #34d399;">{{ m.defMod }}</td>
              <td style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4;">
                {{ m.effect }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. CONDITIONS REFERENCE -->
    <div v-if="activeSection === 'All' || activeSection === 'Conditions'" class="card mb-4" style="padding: 1.25rem;">
      <h4 class="section-title"><i class="ri-heart-pulse-line text-accent"></i> Conditions Guide</h4>
      <div class="conditions-two-col">
        <div>
          <div class="cond-subtitle">Basic Conditions</div>
          <div class="cond-card-list">
            <div
              v-for="c in filteredBasicConditions"
              :key="c.name"
              class="cond-ref-box"
            >
              <div style="font-weight: 800; color: #fff; font-size: 0.85rem; margin-bottom: 0.2rem;">{{ c.name }}</div>
              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.35; margin: 0;">{{ c.desc }}</p>
            </div>
          </div>
        </div>

        <div>
          <div class="cond-subtitle">Combined Conditions</div>
          <div class="cond-card-list">
            <div
              v-for="c in filteredCombinedConditions"
              :key="c.name"
              class="cond-ref-box"
            >
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                <span style="font-weight: 800; color: #c084fc; font-size: 0.85rem;">{{ c.name }}</span>
                <span v-if="c.components" class="badge badge-secondary" style="font-size: 0.65rem;">{{ c.components.join(' + ') }}</span>
              </div>
              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.35; margin: 0;">{{ c.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. MEASUREMENTS TABLE -->
    <div v-if="activeSection === 'All' || activeSection === 'Measurements'" class="card" style="padding: 1.25rem;">
      <h4 class="section-title"><i class="ri-ruler-line text-accent"></i> Measurements Table (Rank & Units)</h4>
      <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Each 1 rank increase doubles the measurement value (&times;2) in the M&M 3e measurement scale.
      </p>
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th style="text-align: center;">Rank</th>
              <th>Mass / Weight</th>
              <th>Distance</th>
              <th>Speed</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in measurementRows" :key="row.rank">
              <td style="text-align: center; font-weight: 800; color: #60a5fa;">{{ row.rank }}</td>
              <td style="color: #fff; font-weight: 600;">{{ row.mass }}</td>
              <td style="color: var(--text-secondary);">{{ row.distance }}</td>
              <td style="color: #34d399; font-weight: 600;">{{ row.speed }}</td>
              <td style="color: var(--text-secondary);">{{ row.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { BASIC_CONDITIONS, COMBINED_CONDITIONS } from '../../rules/conditions.js';

const activeSection = ref('All');
const searchQuery = ref('');

const combatActions = [
  { action: 'Aid', type: 'Standard', effect: '+2 circumstance bonus (+5 with 3+ degrees of success) to an ally\'s check on their next turn.' },
  { action: 'Aim', type: 'Standard', effect: '+2 circumstance bonus on your next ranged attack check (+5 if you spend a full round aiming).' },
  { action: 'Charge', type: 'Standard', effect: 'Move up to your full speed in a straight line and make a close attack with a -2 attack check penalty.' },
  { action: 'Defend', type: 'Standard', effect: 'Active defense check; d20 rolls of 10 or less are treated as 11 for active defense until your next turn.' },
  { action: 'Disarm', type: 'Standard', effect: 'Make an attack check at -2; target makes a STR or Dodge check vs. your attack result to keep hold of their weapon.' },
  { action: 'Escape', type: 'Move', effect: 'Make an opposed STR or Acrobatics check against the grabber\'s STR to break free from a Grab condition.' },
  { action: 'Grab', type: 'Standard', effect: 'Close attack check; target opposes with STR or Dodge. On success, target is Hindered & Vulnerable (or Defenseless & Immobile with 2 degrees).' },
  { action: 'Recover', type: 'Standard', effect: 'Remove your highest damage condition (1 bruise) or recover from being fatigued; usable once per conflict.' },
  { action: 'Smash', type: 'Standard', effect: 'Attack check against an inanimate or unattended object with -5 penalty; object has no active defense and Toughness resists damage.' },
  { action: 'Trip', type: 'Standard', effect: 'Close attack check at -2; target resists with opposed STR, Agility, or Acrobatics. If you win, target falls Prone.' }
];

const combatManeuvers = [
  { action: 'Accurate Attack', atkMod: '+1 to +5', defMod: '--', effect: 'Trade effect/damage rank for attack check bonus (up to +/-5 points).' },
  { action: 'All-out Attack', atkMod: '+1 to +5', defMod: '-1 to -5', effect: 'Trade active defense (Dodge/Parry) for attack check bonus (up to +/-5 points).' },
  { action: 'Defensive Attack', atkMod: '-1 to -5', defMod: '+1 to +5', effect: 'Trade attack check bonus to increase active defense (Dodge/Parry, up to +/-5 points).' },
  { action: 'Power Attack', atkMod: '-1 to -5', defMod: '--', effect: 'Trade attack check bonus to increase Damage/Effect rank (up to +/-5 points).' },
  { action: 'Slam Attack', atkMod: '-1 or -2', defMod: '+1 or +2', effect: 'A Charge attack using your full body velocity to inflict Damage based on your speed and mass.' },
  { action: 'Team Attack', atkMod: '--', defMod: '--', effect: 'Multiple allies coordinate their attacks against a single target to combine effective damage rank.' }
];

const measurementRows = [
  { rank: 0, mass: '50 lbs (25 kg)', distance: '30 ft (9 m)', speed: '30 ft/round (4 mph)', time: '6 seconds (1 round)' },
  { rank: 1, mass: '100 lbs (50 kg)', distance: '60 ft (18 m)', speed: '60 ft/round (8 mph)', time: '12 seconds' },
  { rank: 2, mass: '200 lbs (100 kg)', distance: '120 ft (36 m)', speed: '120 ft/round (16 mph)', time: '24 seconds' },
  { rank: 3, mass: '400 lbs (200 kg)', distance: '250 ft (75 m)', speed: '250 ft/round (30 mph)', time: '1 minute' },
  { rank: 4, mass: '800 lbs (400 kg)', distance: '500 ft (150 m)', speed: '500 ft/round (60 mph)', time: '2 minutes' },
  { rank: 5, mass: '1,600 lbs (800 kg)', distance: '900 ft (250 m)', speed: '900 ft/round (120 mph)', time: '4 minutes' },
  { rank: 6, mass: '1.5 tons (1.6 k-ton)', distance: '1,800 ft (500 m)', speed: '1,800 ft/round (250 mph)', time: '8 minutes' },
  { rank: 7, mass: '3 tons', distance: '1/2 mile (1 km)', speed: '1/2 mile/round (500 mph)', time: '15 minutes' },
  { rank: 8, mass: '6 tons', distance: '1 mile (2 km)', speed: '1 mile/round (Mach 1)', time: '30 minutes' },
  { rank: 9, mass: '12 tons', distance: '2 miles (4 km)', speed: '2 miles/round (Mach 2)', time: '1 hour' },
  { rank: 10, mass: '25 tons', distance: '4 miles (8 km)', speed: '4 miles/round (Mach 4)', time: '2 hours' }
];

const filteredActions = computed(() => {
  if (!searchQuery.value.trim()) return combatActions;
  const q = searchQuery.value.toLowerCase();
  return combatActions.filter(a => a.action.toLowerCase().includes(q) || a.effect.toLowerCase().includes(q));
});

const filteredManeuvers = computed(() => {
  if (!searchQuery.value.trim()) return combatManeuvers;
  const q = searchQuery.value.toLowerCase();
  return combatManeuvers.filter(m => m.action.toLowerCase().includes(q) || m.effect.toLowerCase().includes(q));
});

const filteredBasicConditions = computed(() => {
  if (!searchQuery.value.trim()) return BASIC_CONDITIONS;
  const q = searchQuery.value.toLowerCase();
  return BASIC_CONDITIONS.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
});

const filteredCombinedConditions = computed(() => {
  if (!searchQuery.value.trim()) return COMBINED_CONDITIONS;
  const q = searchQuery.value.toLowerCase();
  return COMBINED_CONDITIONS.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
});
</script>

<style scoped>
.section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.table-custom {
  width: 100%;
  border-collapse: collapse;
}

.table-custom th {
  padding: 0.65rem 0.85rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
}

.table-custom td {
  padding: 0.65rem 0.85rem;
  font-size: 0.82rem;
  border-bottom: 1px solid var(--border-subtle);
}

.conditions-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 800px) {
  .conditions-two-col {
    grid-template-columns: 1fr;
  }
}

.cond-subtitle {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.65rem;
}

.cond-card-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cond-ref-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
}
</style>
