import {
  CONFIGURABLE_EFFECTS,
  createEmptyEffect,
  createEmptyPower,
  normalizeEffect,
  normalizePower,
  calculateEffectCost,
  calculatePowerTotalCost,
  calculatePowerDetailedBreakdown,
  calculatePowerCombatMetrics
} from '../js/rules/powerEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TEST 1: Illusion Sensory Multiselect & Dynamic Cost ---');
const illusionEff = createEmptyEffect('Illusion');
assert(illusionEff.baseEffect === 'Illusion', 'Base effect is Illusion');
assert(Array.isArray(illusionEff.config.senses), 'Illusion has senses array');
assert(illusionEff.config.senses.length === 1, 'Default senses has 1 sense (Visual)');
assert(illusionEff.baseCost === 1, 'Default base cost is 1 PP/Rank');

// Add Auditory and Tactile
illusionEff.config.senses = ['Visual', 'Auditory', 'Tactile'];
const normIllusion = normalizeEffect(illusionEff);
assert(normIllusion.baseCost === 3, 'Illusion with 3 senses has baseCost 3 PP/Rank');

normIllusion.ranks = 8;
const illusionCost = calculateEffectCost(normIllusion);
assert(illusionCost.totalCost === 24, `Illusion rank 8 with 3 senses costs 24 PP (got ${illusionCost.totalCost})`);

// 5 senses
normIllusion.config.senses = ['Visual', 'Auditory', 'Olfactory', 'Tactile', 'Mental'];
const normIllusion5 = normalizeEffect(normIllusion);
assert(normIllusion5.baseCost === 5, 'Illusion with 5 senses has baseCost 5 PP/Rank');
const illusionCost5 = calculateEffectCost(normIllusion5);
assert(illusionCost5.totalCost === 40, `Illusion rank 8 with 5 senses costs 40 PP (got ${illusionCost5.totalCost})`);

console.log('\n--- TEST 2: Enhanced Trait Categories & Special Skill Math ---');
const enhAbility = createEmptyEffect('Enhanced Trait');
assert(enhAbility.config.traitCategory === 'abilities', 'Default category is abilities');
assert(enhAbility.baseCost === 2, 'Default ability cost is 2 PP/Rank');
enhAbility.ranks = 5;
assert(calculateEffectCost(enhAbility).totalCost === 10, 'Rank 5 Enhanced Ability costs 10 PP');

// Defense category
const enhDefense = normalizeEffect({
  baseEffect: 'Enhanced Trait',
  ranks: 4,
  config: { traitCategory: 'defenses', traitName: 'Dodge' }
});
assert(enhDefense.baseCost === 1, 'Enhanced Defense baseCost is 1 PP/Rank');
assert(calculateEffectCost(enhDefense).totalCost === 4, 'Rank 4 Enhanced Defense costs 4 PP');

// Skill category (1 PP per 2 ranks = Math.ceil(ranks / 2))
const enhSkill = normalizeEffect({
  baseEffect: 'Enhanced Trait',
  ranks: 5,
  config: { traitCategory: 'skills', traitName: 'Stealth' }
});
assert(enhSkill.baseCost === 0.5, 'Enhanced Skill baseCost is 0.5 PP/Rank');
assert(calculateEffectCost(enhSkill).totalCost === 3, `Rank 5 Enhanced Skill costs Math.ceil(5/2) = 3 PP (got ${calculateEffectCost(enhSkill).totalCost})`);

const enhSkill4 = normalizeEffect({
  baseEffect: 'Enhanced Trait',
  ranks: 4,
  config: { traitCategory: 'skills', traitName: 'Perception' }
});
assert(calculateEffectCost(enhSkill4).totalCost === 2, `Rank 4 Enhanced Skill costs Math.ceil(4/2) = 2 PP (got ${calculateEffectCost(enhSkill4).totalCost})`);

console.log('\n--- TEST 3: Affliction Resistance & Combat Metrics ---');
const affFort = normalizeEffect({
  baseEffect: 'Affliction',
  ranks: 10,
  config: { resistance: 'Fortitude', firstDegree: 'Dazed', secondDegree: 'Stunned', thirdDegree: 'Incapacitated' }
});
assert(affFort.resistance === 'Fortitude', 'Affliction resistance synced to Fortitude');
const fortMetrics = calculatePowerCombatMetrics({ mainEffect: affFort }, 10);
assert(fortMetrics.dcDescription.includes('vs Fortitude'), `Affliction DC describes Fortitude: ${fortMetrics.dcDescription}`);

const affWill = normalizeEffect({
  baseEffect: 'Affliction',
  ranks: 8,
  config: { resistance: 'Will', firstDegree: 'Entranced', secondDegree: 'Compelled', thirdDegree: 'Controlled' }
});
assert(affWill.resistance === 'Will', 'Affliction resistance synced to Will');
const willMetrics = calculatePowerCombatMetrics({ mainEffect: affWill }, 10);
assert(willMetrics.dcDescription.includes('vs Will'), `Affliction DC describes Will: ${willMetrics.dcDescription}`);

console.log('\n--- TEST 4: Array with Configurable Slot ---');
const arrayPower = createEmptyPower();
arrayPower.type = 'array';
arrayPower.mainEffect = normalizeEffect({
  baseEffect: 'Damage',
  ranks: 10 // 10 PP capacity
});
arrayPower.alternateEffects = [
  {
    name: 'Sensory Illusion',
    isDynamic: false,
    effect: normalizeEffect({
      baseEffect: 'Illusion',
      ranks: 2,
      config: { senses: ['Visual', 'Auditory', 'Tactile'] } // 3 PP/R * 2 = 6 PP <= 10 PP
    })
  }
];

const totalArrayCost = calculatePowerTotalCost(arrayPower);
// Main: 10 PP, Alt Slot: 1 PP -> Total: 11 PP
assert(totalArrayCost === 11, `Array total cost is 11 PP (got ${totalArrayCost})`);
const breakdown = calculatePowerDetailedBreakdown(arrayPower);
assert(breakdown.alternateBreakdowns[0].effectCost === 6, `Alt slot effect cost is 6 PP (got ${breakdown.alternateBreakdowns[0].effectCost})`);

console.log('\n--- TEST 5: Backward Compatibility (Power with no config) ---');
const legacyPower = {
  baseEffect: 'Illusion',
  ranks: 4
};
const normLegacy = normalizePower(legacyPower);
assert(normLegacy.mainEffect.config !== undefined, 'Legacy power normalized with config');
assert(normLegacy.mainEffect.config.senses.length >= 1, 'Legacy illusion has default senses');

console.log(`\n================================`);
console.log(`TESTS SUMMARY: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
