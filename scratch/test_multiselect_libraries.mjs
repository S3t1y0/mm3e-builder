import {
  CONFIGURABLE_EFFECTS,
  normalizeEffect,
  calculateEffectCost,
  calculatePowerTotalCost,
  createEmptyEffect
} from '../js/rules/powerEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

console.log('--- Test Suite: Multi-Select Option Libraries ---');

// 1. SENSES
console.log('\nTesting Senses Library:');
{
  const eff = createEmptyEffect('Senses');
  assert(eff.config.selectedFaculties.includes('darkvision'), 'Defaults to Darkvision');
  assert(eff.ranks === 2, 'Darkvision (2 pts) sets ranks to 2');
  assert(calculateEffectCost(eff).totalCost === 2, 'Darkvision 2 ranks @ 1 PP/R = 2 PP');

  // Multi-select: Darkvision (2) + Danger Sense (1) + Radio (1) = 4 pts
  eff.config.selectedFaculties = ['darkvision', 'danger_sense', 'radio'];
  const norm = normalizeEffect(eff);
  assert(norm.ranks === 4, 'Multi-select 3 senses calculates 4 ranks');
  assert(calculateEffectCost(norm).totalCost === 4, '4 ranks @ 1 PP/R = 4 PP');

  // Backward compatibility: old format faculty string
  const legacyEff = { baseEffect: 'Senses', ranks: 1, config: { faculty: 'Tremorsense' } };
  const normLegacy = normalizeEffect(legacyEff);
  assert(normLegacy.config.selectedFaculties.includes('Tremorsense'), 'Migrates legacy faculty string to array');
  assert(normLegacy.ranks === 2, 'Tremorsense points (2) correctly computes 2 ranks');
}

// 2. IMMUNITY
console.log('\nTesting Immunity Library:');
{
  const eff = createEmptyEffect('Immunity');
  assert(eff.config.selectedPresets.includes('life_support'), 'Defaults to Life Support (10 ranks)');
  assert(eff.ranks === 10, 'Ranks auto-syncs to 10');
  assert(calculateEffectCost(eff).totalCost === 10, '10 ranks @ 1 PP/R = 10 PP');

  // Multi-select: Aging (1) + Disease (1) + Poison (1) = 3 ranks
  eff.config.selectedPresets = ['aging', 'disease', 'poison'];
  const norm = normalizeEffect(eff);
  assert(norm.ranks === 3, 'Multi-select 3 survival immunities calculates 3 ranks');
  assert(calculateEffectCost(norm).totalCost === 3, '3 ranks = 3 PP');

  // Multi-select: Life Support (10) + Critical Hits (2) = 12 ranks
  eff.config.selectedPresets = ['life_support', 'critical'];
  const norm2 = normalizeEffect(eff);
  assert(norm2.ranks === 12, 'Life Support (10) + Critical Hits (2) = 12 ranks');
  assert(calculateEffectCost(norm2).totalCost === 12, '12 ranks = 12 PP');

  // Backward compatibility: old preset string
  const legacyImm = { baseEffect: 'Immunity', ranks: 1, config: { preset: 'aging' } };
  const normLegacyImm = normalizeEffect(legacyImm);
  assert(normLegacyImm.config.selectedPresets.includes('aging'), 'Migrates legacy preset string');
  assert(normLegacyImm.ranks === 1, 'Aging calculates 1 rank');
}

// 3. COMPREHEND
console.log('\nTesting Comprehend Library:');
{
  const eff = createEmptyEffect('Comprehend');
  assert(eff.config.selectedModes.includes('languages_understand'), 'Defaults to Languages Understand');
  assert(eff.ranks === 1, 'Ranks auto-syncs to 1');
  assert(calculateEffectCost(eff).totalCost === 2, 'Comprehend costs 2 PP per rank (1 rank = 2 PP)');

  // Multi-select: Languages Understand (1) + Speak (1) + Animals (1) = 3 ranks (6 PP)
  eff.config.selectedModes = ['languages_understand', 'languages_speak', 'animals_understand'];
  const norm = normalizeEffect(eff);
  assert(norm.ranks === 3, 'Multi-select 3 modes calculates 3 ranks');
  assert(calculateEffectCost(norm).totalCost === 6, '3 ranks @ 2 PP/R = 6 PP');
}

// 4. MOVEMENT
console.log('\nTesting Movement Library:');
{
  const eff = createEmptyEffect('Movement');
  assert(eff.ranks === 1, 'Defaults to 1 rank');
  assert(calculateEffectCost(eff).totalCost === 2, 'Movement costs 2 PP per rank (1 rank = 2 PP)');

  // Multi-select: Wall-crawling (1) + Safe Fall (1) + Water Walking (1) = 3 ranks (6 PP)
  eff.config.selectedModes = [
    { id: 'wall_crawling', name: 'Wall-crawling', ranks: 1 },
    { id: 'safe_fall', name: 'Safe Fall', ranks: 1 },
    { id: 'water_walking', name: 'Water Walking', ranks: 1 }
  ];
  const norm = normalizeEffect(eff);
  assert(norm.ranks === 3, 'Multi-select 3 movement modes calculates 3 ranks');
  assert(calculateEffectCost(norm).totalCost === 6, '3 ranks @ 2 PP/R = 6 PP');
}

// 5. ENVIRONMENT
console.log('\nTesting Environment Library:');
{
  const eff = createEmptyEffect('Environment');
  assert(eff.config.selectedElements.includes('cold_1'), 'Defaults to Intense Cold');
  assert(eff.baseCost === 1, 'Intense Cold has baseCost 1 PP/R');

  // Multi-select: Extreme Cold (2) + Impede Movement (-1) (1) + Visibility (-2) (1) = 4 PP/R
  eff.config.selectedElements = ['cold_2', 'impede_1', 'vis_1'];
  eff.ranks = 5;
  const norm = normalizeEffect(eff);
  assert(norm.baseCost === 4, 'Dynamic baseCost computes 4 PP/Rank');
  assert(calculateEffectCost(norm).totalCost === 20, '5 ranks @ 4 PP/R = 20 PP');
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
