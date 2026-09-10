// scratch/test_powers_explanatory.mjs
import assert from 'assert';
import {
  calculatePowerTotalCost,
  calculateEffectCost,
  calculatePowerCombatMetrics,
  calculatePowerDetailedBreakdown,
  BASE_EFFECTS,
  CONFIGURABLE_EFFECTS,
  EXTRAS,
  FLAWS
} from 'file:///C:/Users/Caniago/Downloads/Tes/mm3e-builder/js/rules/powers.js';

console.log('--- Test Suite: Self-Explanatory Powers Architecture ---');

// 1. DATA INTEGRITY: EXTRAS & FLAWS & CONFIGURABLE
console.log('\n1. Testing Rule Definitions & Metadata:');
assert(EXTRAS.length > 20, 'EXTRAS must contain at least 20 modifiers');
assert(FLAWS.length > 15, 'FLAWS must contain at least 15 modifiers');
assert(CONFIGURABLE_EFFECTS.Senses.faculties.length >= 20, 'Senses must have 20+ faculties');
assert(CONFIGURABLE_EFFECTS.Immunity.presets.length >= 20, 'Immunity must have 20+ presets');
assert(CONFIGURABLE_EFFECTS.Movement.modes.length >= 8, 'Movement must have 8+ modes');
console.log('  ✓ Rules data libraries verified');

// 2. POWER WITH DETAILED SUBOPTIONS: SENSES
console.log('\n2. Testing Senses Power Sub-options Breakdown:');
const sensesPower = {
  id: 'pow_scanner',
  name: 'Cybernetic Scanner & HUD',
  mainEffect: {
    baseEffect: 'Senses',
    ranks: 4,
    baseCost: 1,
    action: 'None',
    range: 'Personal',
    duration: 'Continuous',
    config: {
      selectedFaculties: ['darkvision', 'infravision', 'radio']
    },
    extras: [],
    flaws: []
  },
  linkedEffects: [],
  alternateEffects: []
};

const sensesBreakdown = calculatePowerDetailedBreakdown(sensesPower);
assert.strictEqual(sensesBreakdown.finalCost, 4, 'Darkvision (2) + Infravision (1) + Radio (1) = 4 PP');
console.log(`  ✓ Senses formula breakdown: ${sensesBreakdown.formulaString}`);

// 3. POWER WITH EXTRAS, FLAWS, LINKED & ARRAY SLOTS
console.log('\n3. Testing Complex Power (Blast + Multiattack + Distracting + Linked Affliction + Array Slot):');
const complexPower = {
  id: 'pow_complex_1',
  name: 'Helios Plasma Cannon',
  descriptors: ['Plasma', 'Energy', 'Technological'],
  mainEffect: {
    baseEffect: 'Blast',
    ranks: 10,
    baseCost: 2,
    action: 'Standard',
    range: 'Ranged',
    duration: 'Instant',
    resistance: 'Toughness',
    extras: [
      { name: 'Multiattack', cost: 1, type: 'per_rank', costDisplay: '+1 per rank', desc: 'Rapid autofire or multi-target spray' }
    ],
    flaws: [
      { name: 'Distracting', cost: -1, type: 'per_rank', costDisplay: '–1 per rank', desc: 'Leaves user vulnerable until next turn' }
    ]
  },
  linkedEffects: [
    {
      baseEffect: 'Affliction',
      ranks: 10,
      baseCost: 1,
      action: 'Standard',
      range: 'Ranged',
      duration: 'Instant',
      resistance: 'Fortitude',
      config: {
        firstDegree: 'Dazed',
        secondDegree: 'Stunned',
        thirdDegree: 'Paralyzed',
        resistance: 'Fortitude'
      },
      extras: [],
      flaws: []
    }
  ],
  alternateEffects: [
    {
      name: 'Wide Microwave Disruption Pulse',
      isDynamic: false,
      effect: {
        baseEffect: 'Damage',
        ranks: 8,
        action: 'Standard',
        range: 'Close',
        duration: 'Instant',
        resistance: 'Toughness',
        extras: [{ name: 'Area', cost: 1, type: 'per_rank' }],
        flaws: []
      }
    }
  ]
};

const complexCost = calculatePowerTotalCost(complexPower);
// Main: [Base 2 + 1 - 1 = 2 PP/Rank] * 10 = 20 PP
// Linked: [Base 1] * 10 = 10 PP
// Array Alternate Slot: 1 PP flat
// Total = 31 PP
assert.strictEqual(complexCost, 31, 'Helios Cannon total cost should be 31 PP');
console.log('  ✓ Complex power total cost: 31 PP');

const complexMetrics = calculatePowerCombatMetrics(complexPower, 10, { DEX: 4, FGT: 2 }, []);
assert.strictEqual(complexMetrics.attackBonus, 4, 'Attack bonus should match DEX = 4');
assert.strictEqual(complexMetrics.dc, 25, 'Blast 10 DC should be 15 + 10 = 25 vs Toughness');
assert.strictEqual(complexMetrics.plCompliance.isCompliant, true, 'Attack 4 + Rank 10 = 14 <= PL 10 cap (20)');
console.log(`  ✓ Combat metrics check: Attack ${complexMetrics.attackBonus}, DC ${complexMetrics.dc}, Range ${complexMetrics.rangeDistance}`);

console.log('\nAll Self-Explanatory Powers Architecture unit tests passed successfully!');
