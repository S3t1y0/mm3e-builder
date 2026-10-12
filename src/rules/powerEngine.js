/**
 * Mutants & Masterminds 3e Power Engine (Central Facade)
 * Re-exports all domain data catalogs, normalizers, calculators, and validators.
 * Preserves 100% backward-compatibility for all existing imports.
 */

export * from '../data/index.js';
export * from './powerNormalizer.js';
export * from './powerCalculator.js';
export * from './powerValidator.js';
